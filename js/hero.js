/* HERO, nach dem neuen Handoff (design_handoff_concepts 2, GRIFFNER Concepts.dc.html, hero()).
   Ein Modellhaus von der Stange baut sich auf und fällt in sich zusammen. Aus dem Punkt steht ein Mensch auf: du.
   Deine Worte schweben im Raum, fliegen in den Grundriss, die Wände wachsen, das Haus entsteht, wechselt durch eigene Concepts,
   am Ende ein Feld aus Häusern mit dem gelben Feld in der Mitte.
   Anders als im Handoff sitzt das ganze Bild etwas weiter rechts oben (Kamera-Ausschnitt), damit es nicht hinter den großen Sätzen unten links liegt.
   Die vorige Fassung liegt im Scratchpad der Sitzung als hero-round3.js. */
import { $, $$, E, win, lerp, clamp, ease, reduce, prog, loop } from './core.js';

const GHOSTS = [
  { L0: 13, D: 10, H1: 3, L1: 13, H2: 3, sx: 0, up: 1, R: 0, gl: .6, gu: .6, ge: 0, slope: 0 },
  { L0: 12, D: 9, H1: 3.1, L1: 12, H2: 3, sx: 0, up: 1, R: 3.4, gl: .5, gu: .4, ge: 0, slope: 0 },
  { L0: 18, D: 7, H1: 3, L1: 18, H2: 0, sx: 0, up: 0, R: 3.6, gl: .4, gu: 0, ge: 1, slope: 0 },
  { L0: 8, D: 8, H1: 3, L1: 12, H2: 3, sx: 3, up: 1, R: 0, gl: .6, gu: .8, ge: 0, slope: .6 },
  { L0: 24, D: 6, H1: 3.2, L1: 24, H2: 0, sx: 0, up: 0, R: 0, gl: .9, gu: 0, ge: 0, slope: 0 },
  { L0: 10, D: 10, H1: 3, L1: 14, H2: 3, sx: -2, up: 1, R: 3, gl: .6, gu: .6, ge: 0, slope: 0 },
  { L0: 14, D: 9, H1: 3.4, L1: 14, H2: 0, sx: 0, up: 0, R: 5, gl: .5, gu: 0, ge: 1, slope: 0 }
];
/* Grundriss 16 × 10 m, Front (+z) verglast. Die Figur ist der Maßstab: du. */
const HF = [-6.5, 8.5];
/* Das Modell am Anfang: ein Haus von der Stange, das wieder verschwindet */
const STD = { L0: 11, D: 9, H1: 2.9, L1: 11, H2: 2.7, sx: 0, up: 1, R: 3.6, gl: .45, gu: .45, ge: 0, slope: 0 };
const HP = [-1.2, 6.2], HY = [-.5, 5];
const PLAN = { L0: 16, D: 10, H1: 3.1, L1: 18, H2: 3.1, sx: 2.5, up: 1, R: 0, gl: .9, gu: .7, ge: 0, slope: 0 };
const WALLS = [
  [-8, -5, -3.3, -5, .3], [-2.2, -5, 8, -5, .3], [8, -5, 8, 5, .3], [-8, -5, -8, 5, .3], [-8, 5, -3, 5, .3], [-3, 5, 8, 5, .07],
  [-8, -1, -7, -1, .16], [-6, -1, -2.8, -1, .16], [-1.8, -1, 0, -1, .16], [1, -1, 2.5, -1, .16],
  [-4.5, -5, -4.5, -1, .16], [-1, -5, -1, -1, .16], [2.5, -5, 2.5, -1, .16], [-3, -1, -3, .4, .16], [-3, 1.4, -3, 5, .16]
];
/* Wörter: Streuposition im Raum, dann Platz im Grundriss. Drei Wellen: leben, brauchen, träumen. */
const HW = [
  [[-1.5, 5.5, -4], [5.25, -3]], [[-15.5, 3.5, 2], [-5.5, 2]], [[-5.5, 7, 6], [2.5, 2]],
  [[-1, 3, 4], [.75, -3]], [[-18.5, 6.5, -6], [-6.25, -3]], [[-9.5, 2, -8], [-2.75, -3]],
  [[-13.5, 7.5, 4], [-.5, 7.9]], [[-3.5, 7.5, -2], [3.5, 6.6]], [[-7.5, 4.5, -12], [6.5, 6.6]]
];
/* Zeitfenster der Sätze, der erste kommt mit dem Laden */
const WINS = [null, [.1, .19], [.205, .37], [.405, .54], [.575, .69], [.725, .85], [.9, 1.4]];
/* Bildausschnitt: Modell etwas nach rechts oben, Anteile von Breite und Höhe */
const SHIFT = { wide: [.12, .11], narrow: [-.2, .1] };
let sk = '';

let D, M, H, T, G = null, hi = reduce ? 1 : 0, rig = null;

export function initHero() {
  const el = $('#k-hero');
  D = { el, gl: $('[data-h-gl]'), shade: $('[data-h-shade]'), top: $('[data-h-top]'), says: $$('[data-h-say]'), sls: $$('[data-h-sl]'), ws: $$('[data-h-w]'), dock: $('[data-h-dock]'), scroll: $('[data-h-scroll]') };
  loop.add({ tick });
  /* Einstieg: das Modellhaus baut sich in 2,4 s auf, sobald die Schrift da ist */
  const go = () => {
    const t0 = performance.now() + 400;
    const step = () => { hi = clamp((performance.now() - t0) / 2400); loop.poke(); if (hi < 1) requestAnimationFrame(step); };
    if (!reduce) requestAnimationFrame(step);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
  boot();
}

async function boot() {
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); return; }
  T = M.T;
  H = M.createStage(D.gl, { bg: 0x000000, fov: 28, shadow: .6, key: 2.4, hemi: .55, fogNear: 90, fogFar: 320 });
  H.onResize = () => { sk = ''; shift(0); loop.poke(); };
  build();
  shift(0);
  loop.poke();
}

/* Solange die Wörter frei im Raum schweben (p .2 bis .4), rückt das Bild weniger nach rechts, damit kein Wort am Rand abgeschnitten wird */
function shift(p) {
  const nar = innerWidth < 820, w = D.gl.clientWidth || innerWidth, h = D.gl.clientHeight || innerHeight, s = SHIFT[nar ? 'narrow' : 'wide'];
  /* Schmal: die erste Kamera zielt links neben das Modellhaus, darum anfangs nach links rücken, bis die Figur in der Mitte steht */
  const sx = nar ? s[0] * (1 - E(p, .04, .09)) : s[0] * (1 - .7 * win(p, .19, .41, .03)), key = w + ',' + h + ',' + sx.toFixed(4);
  if (key === sk) return; sk = key;
  H.cam.setViewOffset(w, h, -w * sx, h * s[1], w, h);
  H.cam.updateProjectionMatrix();
}

function build() {
  const sc = H.scene;
  G = {};
  const grid = G.grid = new T.GridHelper(600, 150, 0x1c1c1c, 0x121212); grid.position.y = .001; grid.material.transparent = true; sc.add(grid);
  /* Mensch, 1,78 m, mit Gelenken: Hüfte, Knie, Schulter, Ellbogen, Kopf. Blick Richtung Haus (−z). */
  const mm = G.manMat = new T.MeshStandardMaterial({ color: 0xf2f2f0, emissive: 0x2a2a2a, roughness: .7, transparent: true, opacity: 0 });
  const V3 = (x, y, z) => new T.Vector3(x, y, z), UP = V3(0, 1, 0), O = V3(0, 0, 0);
  const grp = (par, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const add = (par, geo, pos, s) => { const m = new T.Mesh(geo, mm); m.position.copy(pos); s && m.scale.set(...s); m.castShadow = true; par.add(m); return m; };
  const limb = (par, a, b, r0, r1) => { const d = b.clone().sub(a), m = add(par, new T.CylinderGeometry(r1, r0, d.length(), 18), a.clone().add(b).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(UP, d.normalize()); add(par, new T.SphereGeometry(r0, 18, 12), a); };
  const man = G.man = new T.Group();
  const spine = grp(man, 0, .9, 0);
  const prof = [[0, -.04], [.135, -.035], [.165, .05], [.14, .15], [.155, .3], [.18, .42], [.19, .51], [.15, .565], [.06, .6], [0, .605]].map(([r, y]) => new T.Vector2(r, y));
  add(spine, new T.LatheGeometry(prof, 28), O, [1, 1, .6]);
  const leg = x => { const hip = grp(man, x, .9, 0), knee = grp(hip, 0, -.4, 0), ank = grp(knee, 0, -.415, 0);
    limb(hip, O, V3(0, -.4, 0), .082, .056); limb(knee, O, V3(0, -.415, 0), .056, .036); limb(ank, O, V3(0, -.05, -.17), .04, .032); return { hip, knee }; };
  const arm = x => { const sh = grp(spine, x, .52, 0), el = grp(sh, 0, -.29, 0);
    limb(sh, O, V3(0, -.29, 0), .05, .04); limb(el, O, V3(0, -.26, 0), .04, .03); add(el, new T.SphereGeometry(.04, 14, 10), V3(0, -.32, 0), [.75, 1.6, 1]); return { sh, el }; };
  const head = grp(spine, 0, .57, 0);
  limb(head, O, V3(0, .095, -.012), .05, .047); add(head, new T.SphereGeometry(.104, 28, 20), V3(0, .195, -.018), [.86, 1.12, 1]);
  rig = { spine, head, L: leg(-.088), R: leg(.088), aL: arm(-.2), aR: arm(.2) };
  man.position.set(HF[0], 0, HF[1]); sc.add(man);
  /* Lichtkegel von oben: der erste Moment gehört dir */
  const spot = G.spot = new T.SpotLight(0xfff1de, 0, 0, .36, .85, 0); spot.position.set(HF[0], 7.5, HF[1] + 1.2); spot.target = man;
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.0004; sc.add(spot);
  const pc = document.createElement('canvas'); pc.width = pc.height = 256; const px = pc.getContext('2d'), gr = px.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,241,222,.55)'); gr.addColorStop(.45, 'rgba(255,241,222,.22)'); gr.addColorStop(1, 'rgba(255,241,222,0)'); px.fillStyle = gr; px.fillRect(0, 0, 256, 256);
  G.pool = new T.Mesh(new T.PlaneGeometry(6, 6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(pc), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 }));
  G.pool.rotation.x = -Math.PI / 2; sc.add(G.pool);
  /* Das gelbe Rechteck (5:4) ist deine Idee: es erscheint an der Hand und landet als Connector auf der Kante des Grundrisses, halb innen mit 50 %, halb außen voll */
  const ym = new T.MeshBasicMaterial({ color: 0xFFB200 }), yh = G.yelIn = new T.MeshBasicMaterial({ color: 0xFFB200, transparent: true, opacity: 1, depthWrite: false });
  const plate = G.plate = new T.Group(), pg = new T.BoxGeometry(5, .03, 2);
  const pIn = new T.Mesh(pg, yh), pOut = new T.Mesh(pg, ym); pIn.position.z = -1; pOut.position.z = 1; pOut.castShadow = pIn.castShadow = true;
  plate.add(pIn, pOut); plate.visible = false; sc.add(plate);
  const wm = new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0x3a3a3a, roughness: .9 });
  G.glass = new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0x3a3a3a, roughness: .3, transparent: true });
  const bx = new T.BoxGeometry(1, 1, 1);
  G.walls = WALLS.map(([x0, z0, x1, z1, t]) => { const m = new T.Mesh(bx, t < .1 ? G.glass : wm); m.castShadow = true; m.receiveShadow = true; m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.visible = false; sc.add(m); return { m, x0, z0, x1, z1, t, len: Math.hypot(x1 - x0, z1 - z0) }; });
  G.v = new T.Vector3();
  G.std = H.house({ hill: 0x2b2b2a, hillLine: 0x3c3c3b }); G.std.set(STD); G.std.x = HF[0]; G.std.z = HF[1] - 1; G.std.build = 0;
  G.main = H.house({ hill: 0x2b2b2a, hillLine: 0x3c3c3b, line: 0x8a8a8a });
  const C = M.CONCEPTS;
  const TP = [[-46, -40], [0, -40], [46, -40], [-46, 0], [46, 0], [-46, 40], [0, 40], [46, 40]];
  const TF = [C.wald, GHOSTS[1], C.duene, GHOSTS[3], C.hang, GHOSTS[2], GHOSTS[5], GHOSTS[0]];
  G.field = TP.map(([x, z], i) => { const h = H.house({ hill: 0x2b2b2a, hillLine: 0x3c3c3b }); h.set(TF[i]); h.x = x; h.z = z; h.build = 0; h.g.visible = false; return h; });
}

function tick() {
  if (!D) return;
  const { p, on } = prog(D.el);
  if (!on) return;
  const it = hi, vw = innerWidth;
  /* Text */
  D.top.style.opacity = (ease(it) * (1 - E(p, .05, .09))).toFixed(3);
  if (D.scroll) D.scroll.style.opacity = (it * (1 - E(p, 0, .03))).toFixed(3);
  D.says.forEach((el, i) => {
    let o, y;
    if (i === 0) { const s = E(it, .55, 1); o = s * (1 - E(p, .05, .08)); y = (1 - s) * 24 - E(p, .05, .08) * 24; }
    else { o = win(p, WINS[i][0], WINS[i][1], .02); y = (1 - E(p, WINS[i][0], WINS[i][0] + .03)) * 28; }
    el.style.opacity = o.toFixed(3); el.style.transform = `translateY(${y.toFixed(1)}px)`;
  });
  D.sls.forEach((s, j) => { const k = E(p, .205 + j * .05, .235 + j * .05); s.style.opacity = k.toFixed(3); s.style.transform = `translateY(${((1 - k) * 20).toFixed(1)}px)`; });
  if (!G) return;
  const C = M.CONCEPTS;
  /* Kamera: Modellhaus, Figur, Wörter im Raum, Draufsicht Grundriss, Haus, Folge, Feld. [p, Azimut, Höhe, Abstand, Ziel x, y, z] */
  const w6 = .14 / 6, AZ = [.5, -.45, .62, -.3, .42, -.58], EL = [.22, .3, .18, .26, .2, .3];
  const K = [[0, -.5, .2, 54, -10.5, 4.2, 7.5], [.05, -.44, .19, 46, -9, 3, 7.5], [.1, -.22, .14, 10, -6.5, .95, 8.5], [.19, -.12, .13, 12, -6.5, 1.05, 8.5],
    [.37, .38, .3, 34, -11, 3.4, 4], [.5, .02, 1.42, 50, 0, 0, -.6], [.555, .06, 1.4, 48, 0, 0, -.6], [.67, -.55, .3, 46, 0, 2.4, 1], [.715, -.6, .27, 48, 0, 2.4, 1]];
  AZ.forEach((az, i) => { const a = .72 + i * w6; K.push([a + w6 * .45, az, EL[i], 50, 0, 2.6, 0], [a + w6, az, EL[i], 50, 0, 2.6, 0]); });
  K.push([.875, .3, .5, 90, -8, 0, 8], [.95, .3, .92, 262, -28, 0, 30], [1, .2, .94, 272, -28, 0, 30]);
  let k = 0; while (k < K.length - 2 && p > K[k + 1][0]) k++;
  const A = K[k], B = K[k + 1], t = ease(clamp((p - A[0]) / Math.max(1e-6, B[0] - A[0]))), cv = A.map((v, j) => v + (B[j] - v) * t);
  const dist = cv[3] * (vw < 760 ? (vw / innerHeight < .62 ? 1.8 : 1.5) : 1);
  H.scene.fog.near = dist * .9; H.scene.fog.far = dist * 2.6 + 60;
  shift(p);
  H.orbit(cv[1], cv[2], dist, cv[4], cv[5], cv[6]);
  const dim = E(p, .075, .12) * (1 - E(p, .38, .46));
  H.hemi.intensity = lerp(lerp(.5, 1.1, E(p, .87, .95)), .1, dim); H.key.intensity = lerp(2.4, .35, dim);
  G.spot.intensity = 5.5 * dim; G.pool.material.opacity = dim;
  G.grid.material.opacity = lerp(.35, 1, E(p, .38, .48));
  /* Ein Modellhaus baut sich auf und fällt in sich zusammen, bis nur ein Punkt bleibt. Aus dem Punkt steht ein Mensch auf: du. */
  const S0 = G.std, bIn = reduce ? 1 : E(it, .05, .8), gone = E(p, .035, .07), shrink = E(p, .055, .08);
  S0.build = bIn * (1 - gone); S0.g.visible = S0.build > .002 && shrink < .999; S0.g.scale.set(Math.max(.001, 1 - shrink), 1, Math.max(.001, 1 - shrink));
  pose(p, E(p, .07, .11));
  const pl = G.plate, ya = E(p, .325, .365), yf = E(p, .41, .5), tt = performance.now() / 1000;
  pl.visible = ya > .002;
  const fx = HF[0] + 1.25, fy = 2.45 + Math.sin(tt * 1.1) * .05 * (1 - yf), fz = HF[1] - 1.7;
  pl.position.set(lerp(fx, HY[0], yf), lerp(fy, .015, yf), lerp(fz, HY[1], yf));
  pl.scale.setScalar(Math.max(.001, lerp(.2 * ya, 1, yf * yf * yf)));
  pl.rotation.set(lerp(Math.PI / 2, 0, yf), lerp(Math.sin(tt * .6) * .35 + .25, 0, yf) + (1 - yf) * yf * 4 * Math.PI * .5, 0);
  G.yelIn.opacity = lerp(1, .5, E(p, .48, .52));
  /* Der Grundriss zeichnet sich, dann wachsen die Wände */
  const ex = E(p, .555, .61), wallOn = p > .4 && p < .7;
  G.glass.opacity = lerp(1, .3, ex);
  G.walls.forEach((w, i) => {
    const d = E(p, .415 + i * .007, .47 + i * .007), l = w.len * d, ht = lerp(.05, 3, ex), ux = (w.x1 - w.x0) / w.len, uz = (w.z1 - w.z0) / w.len;
    w.m.scale.set(Math.max(.001, l), ht, w.t); w.m.position.set(w.x0 + ux * l / 2, ht / 2, w.z0 + uz * l / 2); w.m.visible = wallOn && d > .002;
  });
  /* Haus: Grundriss wird Volumen, dann eine Folge eigener Concepts, dann zurück in die Mitte des Felds */
  const FS = [C.wald, C.duene, C.hang, GHOSTS[2], GHOSTS[3], GHOSTS[6]];
  let P = { ...PLAN };
  FS.forEach((f, i) => { const a = .72 + i * w6; P = M.mix(P, f, E(p, a, a + w6 * .4)); });
  P = M.mix(P, PLAN, E(p, .865, .9));
  G.main.set(P); G.main.build = E(p, .595, .68); G.main.g.visible = p > .595;
  G.main.ghost = .6 * (1 - E(p, .645, .69)); G.main.edgeAlways = 0;
  G.field.forEach((h, i) => { h.build = E(p, .87 + i * .008, .93 + i * .008); h.g.visible = h.build > .001; });
  D.shade.style.opacity = Math.max(.55 * win(p, .58, .86, .02), E(p, .88, .95) * .85).toFixed(3);
  H.render();
  /* Wörter: im Raum verteilt, dann im Grundriss an ihrem Platz */
  const cam = H.cam.position, V = G.v;
  D.ws.forEach((el, i) => {
    const [s3, s2] = HW[i], wave = Math.floor(i / 3), a = .21 + wave * .05 + (i % 3) * .009;
    const fin = E(p, a, a + .04), fl = E(p, .395 + i * .01, .47 + i * .01), out = E(p, .6, .64);
    const x = lerp(s3[0], s2[0], fl), y = lerp(s3[1], .1, fl), z = lerp(s3[2], s2[1], fl);
    const q = H.project(x, y, z), dd = cam.distanceTo(V.set(x, y, z));
    const sc = lerp(Math.min(1.7, Math.max(.35, 22 / dd)), .44, fl), fog = clamp(1.5 - dd / 70);
    const o = fin * (1 - out) * lerp(fog, 1, fl) * (q.z < 1 ? 1 : 0);
    el.style.opacity = o.toFixed(3);
    if (o > 0) {
      if (!el._w) { el._w = el.offsetWidth; el._h = el.offsetHeight; }
      el.style.transform = `translate3d(${(q.x - el._w / 2).toFixed(2)}px,${(q.y - el._h / 2).toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
    }
  });
  if (p > .95) { const q = H.project(HY[0], 0, HY[1]); D.dock.style.left = q.x.toFixed(1) + 'px'; D.dock.style.top = q.y.toFixed(1) + 'px'; delete D.dock.dataset.dockHide; }
  else D.dock.dataset.dockHide = '1';
  /* Atmen, Kopf und schwebendes Feld laufen weiter, solange die Figur zu sehen ist */
  if (!reduce && p > .06 && p < .93) loop.poke();
}

function pose(p, up) {
  const R = rig, man = G.man, t = performance.now() / 1000, sm = x => x * x * (3 - 2 * x);
  G.manMat.opacity = up; G.manMat.transparent = up < .999; G.manMat.depthWrite = up > .5; man.visible = up > .002 && p < .93;
  /* Gehen: ein paar Schritte auf das Haus zu, sobald es steht */
  const w = clamp((p - .6) / .09), env = Math.sin(Math.PI * w), ph = w * 4 * Math.PI * 2, sw2 = sm(w);
  man.position.set(lerp(HF[0], HP[0], sw2), Math.abs(Math.sin(ph)) * .025 * env + .03 * E(p, .62, .64), lerp(HF[1], HP[1], sw2));
  man.rotation.y = Math.atan2(-(HP[0] - HF[0]), -(HP[1] - HF[1])) * Math.min(sm(clamp(w / .16)), 1 - sm(clamp((w - .84) / .16)));
  G.pool.position.set(man.position.x, .004, man.position.z);
  /* Blick: gesenkt, dann auf. Zu den Wörtern, nach oben zu den Träumen, hinunter auf den Grundriss, hinauf zum Haus. */
  let hx = lerp(-.32, .02, E(p, .13, .19)), hy = 0;
  hy = lerp(hy, .38, E(p, .21, .25)); hy = lerp(hy, -.32, E(p, .26, .3)); hy = lerp(hy, .08, E(p, .31, .35));
  hx += .26 * E(p, .31, .35) * (1 - E(p, .39, .45)) - .22 * E(p, .4, .46) * (1 - E(p, .58, .64)) + .3 * E(p, .64, .7) * (1 - E(p, .9, .95));
  hy = lerp(hy, 0, E(p, .39, .45));
  R.head.rotation.set(hx + Math.sin(t * .9) * .015, hy + Math.sin(t * .37) * .03, 0);
  /* Wovon du träumst: der Arm hebt sich, die Hand öffnet sich in den Raum */
  const reach = E(p, .315, .36) * (1 - E(p, .39, .46));
  const sw = Math.sin(ph) * .32 * env;
  R.aR.sh.rotation.set(lerp(.03, 1.35, reach) - sw, 0, lerp(.07, .32, reach)); R.aR.el.rotation.x = lerp(.12, .3, reach) + Math.max(0, -sw) * .5;
  R.aL.sh.rotation.set(.02 + sw, 0, -.07 - .05 * reach); R.aL.el.rotation.x = .14 + Math.max(0, sw) * .5;
  /* Atmen, leichtes Zurücklehnen beim Träumen, Spielbein */
  R.spine.rotation.x = .07 * reach + Math.sin(t * 1.4) * .006; R.spine.scale.y = 1 + Math.sin(t * 1.4) * .005;
  R.L.hip.rotation.x = Math.sin(ph) * .42 * env; R.R.hip.rotation.x = -Math.sin(ph) * .42 * env + .1 * (1 - env);
  R.L.knee.rotation.x = -Math.max(0, Math.sin(ph + 1.2)) * .7 * env; R.R.knee.rotation.x = -Math.max(0, Math.sin(ph + 1.2 + Math.PI)) * .7 * env - .22 * (1 - env);
  R.L.hip.rotation.z = -.02; R.R.hip.rotation.z = .04 * (1 - env);
}
