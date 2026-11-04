/* HERO. Am Anfang ist nur ein Strich. Dann kommst du, mit deinem Leben. Die Worte fliegen in Räume, der Strich wird zum Plan,
   dann kippt die Kamera aus der Draufsicht, die Wände wachsen, oben landet der Rahmen, Bäume kommen dazu: aus Räumen wird ein Haus.
   Alles in 3D (three.js über house3d.js). Hilfslinien, überstehende Ecken und die punktierte Mittellinie kommen aus dem Intro "Der Plan" von griffner.com. */
import { $, $$, E, win, lerp, clamp, ease, reduce, prog, loop } from './core.js';

/* Abstrakter Plan in Metern, Ursprung links oben, y nach unten (Süden). Kein echter Grundriss, ein Bild für "aus Leben werden Räume". */
const ROOMS = [
  [0, 0, 5, 5], [5, 0, 9, 4.5], [9, 0, 11.5, 4.5], [11.5, 0, 18, 5.5],
  [0, 5, 7, 12], [7, 4.5, 13, 12], [13, 5.5, 18, 12]
];
const TERR = [7, 12, 13, 15];
/* [Wort, Raum, Raumindex, Startpunkt Desktop, Startpunkt Telefon], Startpunkte in Anteilen des Viewports */
const WORDS = [
  ['Morgenkaffee.', 'Küche', 0, [.06, .2], [.06, .2]],
  ['Konzentration.', 'Arbeiten', 1, [.52, .13], [.5, .14]],
  ['Ein warmes Bad.', 'Bad', 2, [.95, .22], [.94, .26]],
  ['Ausschlafen.', 'Schlafen', 3, [.93, .38], [.94, .38]],
  ['Ein langer Tisch.', 'Essen', 4, [.08, .46], [.06, .44]],
  ['Bücher.', 'Wohnen', 5, [.4, .31], [.06, .32]],
  ['Kinderlachen.', 'Kinder', 6, [.95, .62], [.06, .56]],
  ['Abendsonne.', 'Terrasse', 7, [.56, .53], [.94, .5]]
];
const FW = 18, FH = 12;
const wx = x => x - FW / 2, wz = y => y - FH / 2;

let D, S, T, G = null, hi = reduce ? 1 : 0, t0 = 0, d0 = 80, VW = 1, VH = 1;
/* Bildausschnitt: auf dem Desktop sitzt der Plan rechts der Mitte, am Ende rückt das Modell nach oben rechts, damit die Headline frei steht */
function offset(en) {
  const narrow = innerWidth < 820;
  S.cam.setViewOffset(VW, VH, narrow ? 0 : -VW * lerp(.1, .17, en), VH * (narrow ? lerp(.05, .16, en) : lerp(0, .15, en)), VW, VH);
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
  D.dim = document.createElement('div'); D.dim.className = 'hw hw__dim info'; D.dim.textContent = '18,00 M'; D.words.appendChild(D.dim);
  loop.add({ tick });
  t0 = performance.now();
  /* Einstieg: Strich zeichnet sich, Text kommt, sobald die Schrift geladen ist */
  const intro = () => { if (hi >= 1) return; hi = ease(clamp((performance.now() - t0 - 250) / 2400)); loop.poke(); requestAnimationFrame(intro); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { t0 = performance.now(); requestAnimationFrame(intro); });
  boot();
}

async function boot() {
  let M;
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); return; }
  T = M.T;
  S = M.createStage(D.gl, { bg: 0x000000, fov: 22, shadow: .55, key: 1.7, hemi: .85, fogNear: 90, fogFar: 330 });
  S.hemi.groundColor.setHex(0x222220);
  S.onResize = () => { frameCam(); loop.poke(); };
  build();
  frameCam();
  loop.poke();
}

/* Kameraabstand, damit der Plan in die Fläche passt; der Plan sitzt auf dem Desktop rechts der Mitte */
function frameCam() {
  const w = D.gl.clientWidth || innerWidth, h = D.gl.clientHeight || innerHeight, a = w / h, narrow = innerWidth < 820, tn = Math.tan(11 * Math.PI / 180) * 2;
  d0 = narrow ? Math.max(18 / (.86 * tn * a), 15 / (.4 * tn)) : Math.max(18 / (.46 * tn * a), 15 / (.5 * tn));
  VW = w; VH = h;
  offset(0);
  S.scene.fog.near = d0 * 1.1; S.scene.fog.far = d0 * 3.6;
}

function build() {
  const sc = S.scene, V = (x, y, z) => new T.Vector3(x, y, z);
  const lm = (c, dashed) => dashed ? new T.LineDashedMaterial({ color: c, dashSize: .35, gapSize: .5, transparent: true, opacity: 0 }) : new T.LineBasicMaterial({ color: c, transparent: true, opacity: 0 });
  const line = (pts, mat) => { const l = new T.Line(new T.BufferGeometry().setFromPoints(pts), mat); if (mat.isLineDashedMaterial) l.computeLineDistances(); sc.add(l); return l; };
  const per = (r, n = 20) => { const [x0, y0, x1, y1] = r, c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], o = []; for (let i = 0; i < 4; i++) for (let j = 0; j < n; j++) { const t = j / n; o.push(V(wx(lerp(c[i][0], c[i + 1][0], t)), .03, wz(lerp(c[i][1], c[i + 1][1], t)))); } o.push(V(wx(x0), .03, wz(y0))); return o; };
  G = {};
  G.strich = line([V(0, .03, wz(FH)), V(0, .03, wz(FH))], lm(0xffffff));
  G.rooms = ROOMS.map(r => { const l = line(per(r), lm(0xffffff)); l.userData.n = 81; return l; });
  G.outer = line(per([0, 0, FW, FH], 30), lm(0xffffff)); G.outer.userData.n = 121;
  G.terr = line(per(TERR, 8).map(v => (v.y = .03, v)), lm(0xCACACA, true)); G.terr.computeLineDistances();
  const F = 260;
  G.guides = [line([V(-F, .02, wz(0)), V(F, .02, wz(0))], lm(0x444442)), line([V(F, .02, wz(FH)), V(-F, .02, wz(FH))], lm(0x444442)),
    line([V(wx(0), .02, F), V(wx(0), .02, -F)], lm(0x444442)), line([V(wx(FW), .02, -F), V(wx(FW), .02, F)], lm(0x444442))];
  G.mid = line([V(wx(-2.2), .02, 0), V(wx(FW + 2.2), .02, 0)], lm(0x444442, true));
  const o = 1.2, cr = [];
  [[0, 0], [FW, 0], [0, FH], [FW, FH]].forEach(([x, y]) => { cr.push(V(wx(x) - o, .03, wz(y)), V(wx(x) + o, .03, wz(y)), V(wx(x), .03, wz(y) - o), V(wx(x), .03, wz(y) + o)); });
  G.corners = new T.LineSegments(new T.BufferGeometry().setFromPoints(cr), lm(0xCACACA)); sc.add(G.corners);

  /* Wände: gemeinsame Kanten zusammengelegt, damit nichts doppelt steht. Die Südseite zum Garten ist Glas. */
  const box = new T.BoxGeometry(1, 1, 1), edge = new T.EdgesGeometry(box);
  const white = new T.MeshStandardMaterial({ color: 0xF2EFEA, roughness: .9, transparent: true });
  const glass = new T.MeshStandardMaterial({ color: 0x1b1d20, roughness: .25, metalness: .3, transparent: true, opacity: .85 });
  const wl = new T.LineBasicMaterial({ color: 0x8b8378, transparent: true, opacity: .6 });
  const mesh = (mat, lineMat = wl) => { const m = new T.Mesh(box, mat); m.castShadow = true; m.receiveShadow = true; if (lineMat) m.add(new T.LineSegments(edge, lineMat)); sc.add(m); return m; };
  const Hm = new Map(), Vm = new Map();
  const add = (m, key, a, b) => { const k = key.toFixed(2); if (!m.has(k)) m.set(k, []); m.get(k).push([Math.min(a, b), Math.max(a, b)]); };
  ROOMS.forEach(([x0, y0, x1, y1]) => { add(Hm, y0, x0, x1); add(Hm, y1, x0, x1); add(Vm, x0, y0, y1); add(Vm, x1, y0, y1); });
  const merge = l => { l.sort((p, q) => p[0] - q[0]); const r = []; l.forEach(s => { const z = r[r.length - 1]; if (z && s[0] <= z[1] + 1e-6) z[1] = Math.max(z[1], s[1]); else r.push([...s]); }); return r; };
  const th = .2; G.walls = [];
  Hm.forEach((l, k) => merge(l).forEach(([a, b]) => { const c = +k, out = c === 0 || c === FH, h = out ? 3 : 2.7; G.walls.push({ m: mesh(c === FH ? glass : white, c === FH ? null : wl), h, sx: b - a + th, sz: th, x: wx((a + b) / 2), z: wz(c) }); }));
  Vm.forEach((l, k) => merge(l).forEach(([a, b]) => { const c = +k, out = c === 0 || c === FW, h = out ? 3 : 2.7; G.walls.push({ m: mesh(white), h, sx: th, sz: b - a, x: wx(c), z: wz((a + b) / 2) }); }));
  G.walls.forEach((w, i) => { w.d = ((i * 37) % 11) / 11; });
  G.white = white; G.glass = glass; G.wl = wl;
  G.slab = mesh(white); G.slab.scale.set(FW + .5, .3, FH + .5); G.slab.position.set(0, -.15, 0);
  G.deck = mesh(new T.MeshStandardMaterial({ color: 0xCFC3B3, roughness: .9, transparent: true }));
  G.deck.scale.set(TERR[2] - TERR[0], .14, TERR[3] - TERR[1]); G.deck.position.set(wx((TERR[0] + TERR[2]) / 2), .07, wz((TERR[1] + TERR[3]) / 2));
  /* Oben ein Rahmen statt einer Kiste, damit man in die Räume sieht */
  G.frame = new T.Group(); sc.add(G.frame);
  const fm = new T.MeshStandardMaterial({ color: 0xCFC3B3, roughness: .8, transparent: true }), L1 = 15, D1 = 9.4, H2 = 3, b = .26, x1 = -1.2, z1 = -1.6;
  const beam = (sx, sy, sz, x, y, z) => { const m = new T.Mesh(box, fm); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; G.frame.add(m); };
  [0, H2].forEach(y => { beam(L1, b, b, x1, y, z1 - D1 / 2); beam(L1, b, b, x1, y, z1 + D1 / 2); beam(b, b, D1, x1 - L1 / 2, y, z1); beam(b, b, D1, x1 + L1 / 2, y, z1); });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => beam(b, H2, b, x1 + sx * L1 / 2, H2 / 2, z1 + sz * D1 / 2));
  G.fm = fm;
  /* Ein paar Bäume, wie im Architekturmodell */
  const cone = new T.ConeGeometry(1, 1, 7).translate(0, .5, 0), coneE = new T.EdgesGeometry(cone, 40);
  /* Bäume als Silhouette mit hellen Kanten, wie gezeichnet */
  const tm = new T.MeshBasicMaterial({ color: 0x030303, transparent: true }), tl = new T.LineBasicMaterial({ color: 0xBDBDB8, transparent: true, opacity: .62 });
  G.trees = [[-15, -9, 10], [-19, 4, 8], [15, -10, 11], [19, 2, 9], [-13, 13, 7.5], [16, 12, 8.5]].map(([x, z, ht], i) => {
    const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
    const c = new T.Mesh(cone, tm); c.scale.set(ht * .17, ht * .86, ht * .17); c.position.y = ht * .14; c.rotation.y = i; c.castShadow = true; c.add(new T.LineSegments(coneE, tl)); g.add(c);
    const st = new T.LineSegments(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(0, ht * .14, 0)]), tl); g.add(st);
    return { g, d: i / 6 };
  });
  G.tm = tm; G.tl = tl;
  G.ray = new T.Raycaster(); G.plane = new T.Plane(new T.Vector3(0, 1, 0), -.03); G.hit = new T.Vector3();
}

const setOp = (o, v) => { o.material.opacity = v; o.visible = v > .002; };
const draw = (l, k) => { l.geometry.setDrawRange(0, Math.max(0, Math.round(k * l.userData.n))); l.material.opacity = k > .001 ? 1 : 0; l.visible = k > .001; };
/* Bildschirmpunkt auf den Boden */
function ground(sx, sy) {
  const w = D.gl.clientWidth, h = D.gl.clientHeight;
  G.ray.setFromCamera({ x: sx / w * 2 - 1, y: -(sy / h) * 2 + 1 }, S.cam);
  return G.ray.ray.intersectPlane(G.plane, G.hit) ? G.hit.clone() : null;
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
  const W = [[.09, .2], [.2, .33], [.36, .56], [.6, .78]];
  D.says.forEach((el, i) => {
    el.style.opacity = win(p, W[i][0], W[i][1], .025).toFixed(3);
    el.style.transform = `translateY(${((1 - E(p, W[i][0], W[i][0] + .03)) * 28).toFixed(1)}px)`;
  });
  const en = E(p, .82, .9);
  D.end.style.opacity = en.toFixed(3);
  D.end.style.transform = `translateY(${((1 - en) * 28).toFixed(1)}px)`;

  /* Worte erscheinen frei und schweben, solange der Plan noch nicht da ist */
  const big = Math.max(20, Math.min(44, vw * .026));
  if (!G) { D.w.forEach((w, i) => { const [fx, fy] = WORDS[i][narrow ? 4 : 3]; const a = E(p, .11 + i * .012, .17 + i * .012); w.n.style.opacity = a.toFixed(3); w.n.style.transform = `translate3d(${(fx * vw).toFixed(1)}px,${(fy * vh).toFixed(1)}px,0) translate(${fx > .6 ? -100 : fx > .3 ? -50 : 0}%,-50%)`; w.ww.style.fontSize = big + 'px'; }); return; }

  /* Kamera: Draufsicht, dann kippt sie ins Modell und dreht langsam weiter */
  const tilt = E(p, .58, .8);
  offset(narrow ? E(p, .8, .9) : E(p, .76, .9));
  S.orbit(lerp(0, -.62, E(p, .56, .84)) - E(p, .82, 1) * .28, lerp(1.48, .5, tilt), d0 * lerp(1, 1.06, tilt), 0, lerp(0, 1.4, tilt), 0);

  /* Der Strich: zeichnet sich beim Laden, zieht sich auf die Außenkante des Plans zusammen */
  const m = parseFloat(getComputedStyle(D.el).getPropertyValue('--page-margin')) || 48;
  S.cam.updateMatrixWorld();
  const A = ground(m, 0), B = ground(vw - m, 0);
  const ax = A ? A.x : -40, bx = B ? B.x : 40, k = E(p, .27, .36);
  const x0 = lerp(ax, wx(0), k), x1 = lerp(bx, wx(FW), k), pos = G.strich.geometry.attributes.position;
  pos.setXYZ(0, x0, .03, wz(FH)); pos.setXYZ(1, lerp(x0, x1, hi), .03, wz(FH)); pos.needsUpdate = true;
  setOp(G.strich, hi * (1 - E(p, .42, .48)));

  /* Räume zeichnen sich nacheinander, dann Außenkante, Terrasse, Hilfslinien */
  G.rooms.forEach((r, i) => draw(r, E(p, .36 + i * .02, .45 + i * .02)));
  draw(G.outer, E(p, .44, .54));
  setOp(G.terr, E(p, .5, .56) * (1 - E(p, .66, .72)));
  const gk = E(p, .5, .6) * (1 - E(p, .72, .8) * .7);
  G.guides.forEach((g, i) => setOp(g, E(p, .5 + i * .015, .58 + i * .015) * (1 - E(p, .72, .8) * .7)));
  setOp(G.mid, gk); setOp(G.corners, gk * (1 - E(p, .62, .7)));
  /* Wände wachsen, Bodenplatte und Terrasse kommen, oben landet der Rahmen, Bäume wachsen */
  const sk = E(p, .58, .64);
  G.slab.visible = sk > .002; G.white.opacity = 1; G.slab.scale.y = Math.max(.001, .3 * sk); G.slab.position.y = -.3 * sk / 2;
  G.walls.forEach(w => {
    const t = E(p, .6 + w.d * .07, .68 + w.d * .07), hh = Math.max(.001, w.h * t);
    w.m.scale.set(w.sx, hh, w.sz); w.m.position.set(w.x, hh / 2, w.z); w.m.visible = t > .002;
  });
  const dk = E(p, .66, .72); G.deck.visible = dk > .002; G.deck.scale.y = Math.max(.001, .14 * dk); G.deck.position.y = .07 * dk;
  const fk = E(p, .72, .8); G.frame.visible = fk > .002; G.frame.position.y = 3 + (1 - fk) * 9; G.fm.opacity = fk;
  G.trees.forEach(t => { const g = E(p, .74 + t.d * .05, .82 + t.d * .05); t.g.visible = g > .002; t.g.scale.set(1, Math.max(.001, g), 1); });
  /* Am Ende tritt das Modell zurück, damit die Botschaft trägt */
  D.gl.style.opacity = (1 - en * .25).toFixed(3);
  S.render();

  /* Worte: fliegen in ihre Räume und werden zu Beschriftungen, die am Modell hängen */
  const proj = (x, y, z) => S.project(x, y, z);
  D.w.forEach((w, i) => {
    const [fx, fy] = WORDS[i][narrow ? 4 : 3], ri = WORDS[i][2], r = ri < 7 ? ROOMS[ri] : TERR;
    const appear = E(p, .11 + i * .012, .17 + i * .012);
    const fly = E(p, .4 + i * .018, .54 + i * .018);
    const sx = fx * vw, sy = fy * vh - (p - .1) * 60;
    const q = proj(wx((r[0] + r[2]) / 2), .2, wz((r[1] + r[3]) / 2));
    const x = lerp(sx, q.x, fly), y = lerp(sy, q.y, fly);
    const ax2 = fx > .6 ? -100 : fx > .3 ? -50 : 0;
    w.n.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(${lerp(ax2, -50, fly).toFixed(1)}%,-50%)`;
    w.ww.style.fontSize = lerp(big, narrow ? 10 : 12, fly).toFixed(2) + 'px';
    w.ww.style.color = fly > .9 ? 'var(--griffner-kalk)' : '';
    /* Auf dem Handy sind die Räume zu klein für beides: das Wort geht, der Raumname bleibt */
    w.ww.style.opacity = narrow ? (1 - E(p, .56 + i * .012, .6 + i * .012)).toFixed(3) : (1 - E(p, .62, .7) * .7).toFixed(3);
    w.rr.style.fontSize = narrow ? '9px' : '';
    w.rr.style.letterSpacing = narrow ? '.12em' : '';
    w.rr.style.marginTop = narrow ? '-6px' : '';
    w.n.style.textAlign = fly > .5 ? 'center' : 'left';
    w.rr.style.opacity = E(p, .55 + i * .012, .6 + i * .012).toFixed(3);
    w.n.style.opacity = (appear * (1 - E(p, .76, .84))).toFixed(3);
  });
  const dq = proj(0, .03, wz(TERR[3]) + 1.6);
  D.dim.style.transform = `translate3d(${dq.x.toFixed(1)}px,${dq.y.toFixed(1)}px,0) translate(-50%,-50%)`;
  D.dim.style.opacity = (E(p, .56, .62) * (1 - E(p, .62, .68))).toFixed(3);

  /* Connector am Ende auf der Ecke des Rahmens */
  if (p > .84) { const c = proj(-1.2 + 7.5, 6, -1.6 - 4.7); D.dock.style.left = c.x.toFixed(1) + 'px'; D.dock.style.top = c.y.toFixed(1) + 'px'; delete D.dock.dataset.dockHide; }
  else D.dock.dataset.dockHide = '1';
}
