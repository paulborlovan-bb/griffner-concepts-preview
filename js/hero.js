/* HERO. Am Anfang ist nur ein Strich. Dann erzählst du, wie du lebst: die Worte schweben, fliegen in ihre Räume,
   und die Wände wachsen gleich in 3D aus dem Boden, ohne den Umweg über einen gezeichneten Plan.
   Oben landet der Rahmen, rundherum wachsen Bäume. Alles in 3D (three.js über house3d.js). */
import { $, $$, E, win, lerp, clamp, ease, reduce, prog, loop } from './core.js';

/* Räume in Metern, Ursprung links oben, y nach unten (Süden). Kein echter Grundriss, ein Bild für "aus Leben werden Räume". */
const ROOMS = [
  [0, 0, 5, 5], [5, 0, 9, 4.5], [9, 0, 11.5, 4.5], [11.5, 0, 18, 5.5],
  [0, 5, 7, 12], [7, 4.5, 13, 12], [13, 5.5, 18, 12]
];
const TERR = [7, 12, 13, 15];
/* [Wort, Raum, Raumindex, Startpunkt Desktop, Startpunkt Telefon], Startpunkte in Anteilen des Viewports */
const WORDS = [
  ['Morgenkaffee.', 'Küche', 0, [.06, .3], [.06, .24]],
  ['Konzentration.', 'Arbeiten', 1, [.5, .2], [.5, .17]],
  ['Ein warmes Bad.', 'Bad', 2, [.94, .26], [.94, .3]],
  ['Ausschlafen.', 'Schlafen', 3, [.93, .42], [.94, .41]],
  ['Ein langer Tisch.', 'Essen', 4, [.08, .5], [.06, .47]],
  ['Bücher.', 'Wohnen', 5, [.42, .36], [.06, .35]],
  ['Kinderlachen.', 'Kinder', 6, [.95, .6], [.06, .58]],
  ['Abendsonne.', 'Terrasse', 7, [.6, .55], [.94, .52]]
];
/* Bäume: x, z, Höhe, Laubbaum. Hinter und neben dem Haus, der Garten im Süden bleibt frei. */
const TREES = [
  [-16, -10, 11], [-22, 0, 9], [-12, -16, 13], [-4, -19, 10.5, 1], [5, -18, 14], [13, -13, 12], [21, -4, 10],
  [23, -9, 0, 1], [-25, -2, 0, 1], [-27, -11, 12.5], [27, 3, 9], [10, -24, 11]
];
const FW = 18, FH = 12;
const wx = x => x - FW / 2, wz = y => y - FH / 2;

let D, S, T, G = null, hi = reduce ? 1 : 0, t0 = 0, d0 = 70, VW = 1, VH = 1;
/* Bildausschnitt: auf dem Desktop sitzt das Haus rechts der Mitte, damit links die Sätze frei stehen */
function offset(en) {
  const narrow = innerWidth < 820;
  S.cam.setViewOffset(VW, VH, narrow ? 0 : -VW * lerp(.12, .17, en), VH * (narrow ? lerp(-.02, .08, en) : lerp(-.04, .12, en)), VW, VH);
  S.cam.updateProjectionMatrix();
}

export function initHero() {
  const el = $('#k-hero');
  D = { el, gl: $('[data-h-gl]'), words: $('[data-h-words]'), top: $('[data-h-top]'), says: $$('[data-h-say]'), end: $('[data-h-end]'), scroll: $('[data-h-scroll]'), dock: $('[data-h-dock]') };
  D.w = WORDS.map(([w, r]) => {
    const n = document.createElement('div'); n.className = 'hw';
    n.innerHTML = `<span class="hw__w">${w}</span><span class="hw__r info">${r}</span>`;
    D.words.appendChild(n);
    return { n, ww: n.firstElementChild, rr: n.lastElementChild };
  });
  loop.add({ tick });
  t0 = performance.now();
  /* Einstieg: der Strich zeichnet sich, Text kommt, sobald die Schrift geladen ist */
  const intro = () => { if (hi >= 1) return; hi = ease(clamp((performance.now() - t0 - 250) / 2400)); loop.poke(); requestAnimationFrame(intro); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { t0 = performance.now(); requestAnimationFrame(intro); });
  boot();
}

async function boot() {
  let M;
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); return; }
  T = M.T;
  S = M.createStage(D.gl, { bg: 0x000000, fov: 22, shadow: .55, key: 1.8, hemi: 1, fogNear: 90, fogFar: 330 });
  S.hemi.groundColor.setHex(0x2a2a28);
  /* Schattenebene unter die Bodenplatte, sonst flimmern Plattenoberseite und Schatten in derselben Tiefe */
  S.ground.position.y = -.31;
  S.onResize = () => { frameCam(); loop.poke(); };
  build();
  frameCam();
  loop.poke();
}

/* Kameraabstand, damit Haus und Bäume in die Fläche passen */
function frameCam() {
  const w = D.gl.clientWidth || innerWidth, h = D.gl.clientHeight || innerHeight, a = w / h, narrow = innerWidth < 820, tn = Math.tan(11 * Math.PI / 180) * 2;
  d0 = narrow ? Math.max(26 / (tn * a), 18 / tn) : Math.max(40 / (tn * a), 19 / tn);
  VW = w; VH = h;
  offset(0);
  S.scene.fog.near = d0 * .9; S.scene.fog.far = d0 * 2.4;
}

function build() {
  const sc = S.scene, V = (x, y, z) => new T.Vector3(x, y, z);
  G = {};
  /* Der Strich: eine helle Linie auf dem Boden, entlang der späteren Gartenseite */
  G.strich = new T.Line(new T.BufferGeometry().setFromPoints([V(0, .03, wz(FH)), V(0, .03, wz(FH))]), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  G.strich.frustumCulled = false; sc.add(G.strich);

  /* Wände: gemeinsame Kanten zusammengelegt, damit nichts doppelt steht. Die Südseite zum Garten ist Glas. */
  const box = new T.BoxGeometry(1, 1, 1), edge = new T.EdgesGeometry(box);
  /* polygonOffset schiebt die Flächen minimal zurück, damit die Kanten nicht mit ihnen flimmern */
  const PO = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
  const white = new T.MeshStandardMaterial({ color: 0xF2EFEA, roughness: .9, ...PO });
  const glass = new T.MeshStandardMaterial({ color: 0x1b1d20, roughness: .25, metalness: .3, transparent: true, opacity: .85, ...PO });
  const wl = new T.LineBasicMaterial({ color: 0x8b8378, transparent: true, opacity: .6 });
  const mesh = (mat, lineMat = wl) => { const m = new T.Mesh(box, mat); m.castShadow = true; m.receiveShadow = true; if (lineMat) m.add(new T.LineSegments(edge, lineMat)); sc.add(m); return m; };
  const Hm = new Map(), Vm = new Map();
  const add = (m, key, a, b) => { const k = key.toFixed(2); if (!m.has(k)) m.set(k, []); m.get(k).push([Math.min(a, b), Math.max(a, b)]); };
  ROOMS.forEach(([x0, y0, x1, y1]) => { add(Hm, y0, x0, x1); add(Hm, y1, x0, x1); add(Vm, x0, y0, y1); add(Vm, x1, y0, y1); });
  const merge = l => { l.sort((p, q) => p[0] - q[0]); const r = []; l.forEach(s => { const z = r[r.length - 1]; if (z && s[0] <= z[1] + 1e-6) z[1] = Math.max(z[1], s[1]); else r.push([...s]); }); return r; };
  const th = .2; G.walls = [];
  Hm.forEach((l, k) => merge(l).forEach(([a, b]) => { const c = +k, out = c === 0 || c === FH, h = out ? 3 : 2.7; G.walls.push({ m: mesh(c === FH ? glass : white, c === FH ? null : wl), h, sx: b - a + th, sz: th, x: wx((a + b) / 2), z: wz(c) }); }));
  Vm.forEach((l, k) => merge(l).forEach(([a, b]) => { const c = +k, out = c === 0 || c === FW, h = out ? 3 : 2.7; G.walls.push({ m: mesh(white), h, sx: th, sz: b - a, x: wx(c), z: wz((a + b) / 2) }); }));
  /* Reihenfolge: von hinten links nach vorne rechts, so liest man das Wachsen */
  G.walls.forEach(w => { w.d = clamp(((w.x + FW / 2) / FW) * .55 + ((w.z + FH / 2) / FH) * .45); });
  G.slab = mesh(white); G.slab.scale.set(FW + .5, .3, FH + .5); G.slab.position.set(0, -.15, 0);
  G.deck = mesh(new T.MeshStandardMaterial({ color: 0xCFC3B3, roughness: .9, ...PO }));
  G.deck.scale.set(TERR[2] - TERR[0], .14, TERR[3] - TERR[1]); G.deck.position.set(wx((TERR[0] + TERR[2]) / 2), .07, wz((TERR[1] + TERR[3]) / 2));
  /* Oben ein Rahmen statt einer Kiste, damit man in die Räume sieht */
  G.frame = new T.Group(); sc.add(G.frame);
  const fm = new T.MeshStandardMaterial({ color: 0xCFC3B3, roughness: .8, transparent: true, ...PO }), L1 = 15, D1 = 9.4, H2 = 3, b = .26, x1 = -1.2, z1 = -1.6;
  const beam = (sx, sy, sz, x, y, z) => { const m = new T.Mesh(box, fm); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; G.frame.add(m); };
  [0, H2].forEach(y => { beam(L1, b, b, x1, y, z1 - D1 / 2); beam(L1, b, b, x1, y, z1 + D1 / 2); beam(b, b, D1, x1 - L1 / 2, y, z1); beam(b, b, D1, x1 + L1 / 2, y, z1); });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => beam(b, H2, b, x1 + sx * L1 / 2, H2 / 2, z1 + sz * D1 / 2));
  G.fm = fm;

  /* Bäume wie im Architekturmodell: Fichten aus drei Kegeln, ein paar runde Laubbäume. Hell, damit sie auf Schwarz stehen. */
  const trunkG = new T.CylinderGeometry(.14, .24, 1, 6).translate(0, .5, 0), coneG = new T.ConeGeometry(1, 1, 9).translate(0, .5, 0), ballG = new T.IcosahedronGeometry(1, 1);
  const trunkE = new T.EdgesGeometry(trunkG, 40), coneE = new T.EdgesGeometry(coneG, 40), ballE = new T.EdgesGeometry(ballG, 24);
  const tm = new T.MeshStandardMaterial({ color: 0xD9D2C6, roughness: .95, flatShading: true, ...PO }), tl = new T.LineBasicMaterial({ color: 0x8f867a, transparent: true, opacity: .5 });
  const part = (geo, edges) => { const m = new T.Mesh(geo, tm); m.castShadow = true; m.add(new T.LineSegments(edges, tl)); return m; };
  G.trees = TREES.map(([x, z, ht, laub], i) => {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = i * 1.7; sc.add(g);
    if (laub) {
      const rad = 2.2 + (i % 3) * .35, stem = 3.2;
      const tr = part(trunkG, trunkE); tr.scale.set(1.2, stem + rad * .5, 1.2);
      const cr = part(ballG, ballE); cr.scale.set(rad, rad * .96, rad); cr.position.y = stem + rad * .78;
      g.add(tr, cr);
    } else {
      const rad = ht * .21, stem = 1.1, C = ht - stem;
      const tr = part(trunkG, trunkE); tr.scale.set(1, stem + .5, 1); g.add(tr);
      [[0, .58, 1], [.27, .48, .74], [.52, .48, .48]].forEach(([y0, hh, rr]) => { const c = part(coneG, coneE); c.scale.set(rad * rr, C * hh, rad * rr); c.position.y = stem + C * y0; g.add(c); });
    }
    /* von vorne nach hinten und von der Mitte nach außen */
    return { g, d: clamp((Math.hypot(x, z) - 14) / 16) };
  });
}

const setOp = (o, v) => { o.material.opacity = v; o.visible = v > .002; };
/* Wort am Ankerpunkt: ax = horizontaler Anker in Prozent, sc = Maßstab. Schriftgröße nur setzen, wenn sie sich ändert. */
function word(w, ax, sc, big, narrow) {
  if (w.fs !== big) { w.fs = big; w.ww.style.fontSize = big + 'px'; }
  if (w.nr !== narrow) { w.nr = narrow; w.rr.style.fontSize = narrow ? '9px' : ''; w.rr.style.letterSpacing = narrow ? '.12em' : ''; }
  w.ww.style.transformOrigin = `${(-ax).toFixed(1)}% 50%`;
  w.ww.style.transform = `translate(${ax.toFixed(2)}%,-50%) scale(${sc.toFixed(4)})`;
}

function tick() {
  if (!D) return;
  const { p, on } = prog(D.el);
  if (!on) return;
  const vw = innerWidth, vh = innerHeight, narrow = vw < 820;
  /* Text */
  D.top.style.opacity = (hi * (1 - E(p, .05, .1))).toFixed(3);
  D.top.style.transform = `translateY(${((1 - hi) * 24 - E(p, .05, .1) * 32).toFixed(1)}px)`;
  D.scroll.style.opacity = (hi * (1 - E(p, 0, .03))).toFixed(3);
  const W = [[.09, .26], [.3, .5], [.54, .72]];
  D.says.forEach((el, i) => {
    el.style.opacity = win(p, W[i][0], W[i][1], .025).toFixed(3);
    el.style.transform = `translateY(${((1 - E(p, W[i][0], W[i][0] + .03)) * 28).toFixed(1)}px)`;
  });
  const en = E(p, .8, .88);
  D.end.style.opacity = en.toFixed(3);
  D.end.style.transform = `translateY(${((1 - en) * 28).toFixed(1)}px)`;

  /* Worte erscheinen frei und schweben, solange das 3D noch lädt */
  const big = Math.max(20, Math.min(44, vw * .026));
  if (!G) { D.w.forEach((w, i) => { const [fx, fy] = WORDS[i][narrow ? 4 : 3]; const a = E(p, .11 + i * .012, .17 + i * .012); w.n.style.opacity = a.toFixed(3); w.n.style.transform = `translate3d(${(fx * vw).toFixed(1)}px,${(fy * vh).toFixed(1)}px,0)`; word(w, fx > .6 ? -100 : fx > .3 ? -50 : 0, 1, big, narrow); }); return; }

  /* Kamera: von Anfang an schräg von oben, sie dreht langsam um das Haus */
  offset(narrow ? E(p, .78, .9) : E(p, .76, .9));
  S.orbit(lerp(-.3, -.72, E(p, 0, .8)) - E(p, .8, 1) * .22, lerp(.62, .44, E(p, .1, .7)), d0 * lerp(1.04, .98, E(p, .2, .7)), 0, 1.2, 0);

  /* Der Strich: zeichnet sich beim Laden über die ganze Breite, zieht sich dann auf die Gartenseite des Hauses zusammen */
  const k = E(p, .22, .3), pos = G.strich.geometry.attributes.position;
  const x0 = lerp(-70, wx(0) - .25, k), x1 = lerp(70, wx(FW) + .25, k);
  pos.setXYZ(0, x0, .03, wz(FH) + .25); pos.setXYZ(1, lerp(x0, x1, hi), .03, wz(FH) + .25); pos.needsUpdate = true;
  setOp(G.strich, hi * (1 - E(p, .3, .36)));

  /* Bodenplatte, dann wachsen die Wände direkt aus dem Boden, Terrasse, Rahmen, Bäume */
  const sk = E(p, .26, .32);
  G.slab.visible = sk > .002; G.slab.scale.y = Math.max(.001, .3 * sk); G.slab.position.y = -.3 * sk / 2;
  G.walls.forEach(w => {
    const t = E(p, .3 + w.d * .14, .38 + w.d * .14), hh = Math.max(.001, w.h * t);
    w.m.scale.set(w.sx, hh, w.sz); w.m.position.set(w.x, hh / 2, w.z); w.m.visible = t > .002;
  });
  const dk = E(p, .48, .53); G.deck.visible = dk > .002; G.deck.scale.y = Math.max(.001, .14 * dk); G.deck.position.y = .07 * dk;
  const fk = E(p, .52, .62); G.frame.visible = fk > .002; G.frame.position.y = 3 + (1 - fk) * 4; G.fm.opacity = fk;
  G.trees.forEach(t => { const g = E(p, .56 + t.d * .1, .66 + t.d * .1); t.g.visible = g > .002; t.g.scale.set(lerp(.6, 1, g), Math.max(.001, g), lerp(.6, 1, g)); });
  /* Am Ende tritt das Modell etwas zurück, damit die Botschaft trägt */
  D.gl.style.opacity = (1 - en * .25).toFixed(3);
  S.render();

  /* Worte: fliegen in ihre Räume und werden zu Beschriftungen, die am Modell hängen */
  const proj = (x, y, z) => S.project(x, y, z);
  D.w.forEach((w, i) => {
    const [fx, fy] = WORDS[i][narrow ? 4 : 3], ri = WORDS[i][2], r = ri < 7 ? ROOMS[ri] : TERR;
    const appear = E(p, .11 + i * .012, .17 + i * .012);
    const fly = E(p, .3 + i * .016, .42 + i * .016);
    const sx = fx * vw, sy = fy * vh - (p - .1) * 60;
    const q = proj(wx((r[0] + r[2]) / 2), ri < 7 ? 3.2 : .4, wz((r[1] + r[3]) / 2));
    const x = lerp(sx, q.x, fly), y = lerp(sy, q.y, fly);
    const ax2 = fx > .6 ? -100 : fx > .3 ? -50 : 0;
    w.n.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    /* Das Wort wird kleiner per scale, nicht per Schriftgröße: kein Umbruch, kein Springen */
    word(w, lerp(ax2, -50, fly), lerp(1, (narrow ? 10 : 12) / big, fly), big, narrow);
    w.ww.style.color = fly > .9 ? 'var(--griffner-kalk)' : '';
    /* Unterwegs bleibt das Wort, am Ziel steht nur noch der Raum, mittig auf dem Raum */
    w.ww.style.opacity = (1 - E(p, .44 + i * .012, .5 + i * .012)).toFixed(3);
    w.rr.style.opacity = E(p, .42 + i * .012, .48 + i * .012).toFixed(3);
    w.n.style.opacity = (appear * (1 - E(p, .62, .7))).toFixed(3);
  });

  /* Connector am Ende auf der Ecke des Rahmens */
  if (p > .84) { const c = proj(-1.2 + 7.5, 6, -1.6 - 4.7); D.dock.style.left = c.x.toFixed(1) + 'px'; D.dock.style.top = c.y.toFixed(1) + 'px'; delete D.dock.dataset.dockHide; }
  else D.dock.dataset.dockHide = '1';
}
