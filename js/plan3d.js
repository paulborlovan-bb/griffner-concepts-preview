/* GRUNDRISS IN 3D (Seite Wald). Die echten CAD Grundrisse als Modell, ohne Knöpfe: nur ziehen zum Drehen.
   Wände: die gefüllten Wandflächen der Pläne (Klasse w), hochgezogen. Boden: die Planzeichnung selbst.
   Möbel: einfache Körper an den Stellen der weißen Möbelflächen im Plan (Klasse k).
   Pläne: assets/img/plan-eg.svg und plan-og.svg, in Punkt, 1 m = 28,35 pt, Norden oben, Garten im Süden (+z). */
import { $, E, clamp, loop, reduce, through } from './core.js';
import { PLAN_3D } from '../data/content.js';

const K = 28.35, WALL = 2.35, FRAME = .32, GAP = 2.6;
const COL = { w: 0xF7F6F3, s: 0xCFC3B3, a: 0x5c5b57 };
/* Möbel: x, y, Breite, Tiefe in pt (aus dem Plan), Höhe in m, Farbe (w weiß, s Sand, a Anthrazit), rund */
const FURN = {
  eg: [
    [350, 256, 140, 17, .9, 'a'], [382, 299, 104, 28, .9, 'a'],
    [396, 367, 71, 34, .74, 'a'],
    [389, 377, 14, 14, .46, 's'], [405, 359, 14, 14, .46, 's'], [406, 395, 14, 14, .46, 's'], [423, 359, 14, 14, .46, 's'],
    [424, 395, 15, 14, .46, 's'], [441, 359, 15, 14, .46, 's'], [443, 395, 14, 14, .46, 's'], [460, 377, 14, 14, .46, 's'],
    [628, 229, 25, 56, .42, 's'], [653, 234, 52, 20, .42, 's'], [628, 229, 6, 56, .74, 's'], [653, 229, 52, 5, .74, 's'],
    [665, 267, 25, 26, .36, 'a', 1], [700, 265, 19, 17, .44, 's'], [700, 291, 19, 17, .44, 's'], [621, 330, 56, 14, .44, 'a'],
    [679, 129, 23, 49, .74, 'a'], [699, 146, 14, 14, .46, 's'], [654, 134, 20, 19, .44, 's'], [656, 163, 20, 19, .44, 's'], [628, 211, 99, 14, 1.1, 'a'],
    [435, 137, 17, 11, .42, 'w'], [429, 157, 23, 27, .08, 'w'], [478, 133, 11, 20, .86, 'w'], [429, 129, 6, 28, 1.1, 'w'],
    [493, 129, 62, 17, .9, 'w'], [563, 209, 9, 59, 2, 'a'],
    [631, 381, 34, 23, .74, 'a'], [619, 385, 9, 15, .46, 's'], [668, 385, 9, 15, .46, 's'],
    [633, 369, 14, 9, .46, 's'], [650, 369, 14, 9, .46, 's'], [633, 407, 14, 9, .46, 's'], [650, 407, 14, 9, .46, 's']
  ],
  og: [
    [611, 138, 34, 57, .48, 's'], [613, 140, 30, 9, .6, 'w'], [646, 140, 11, 11, .5, 'a'], [687, 167, 23, 42, .74, 'a'], [675, 181, 11, 14, .46, 's'],
    [611, 297, 34, 57, .48, 's'], [613, 343, 30, 9, .6, 'w'], [646, 341, 11, 11, .5, 'a'], [687, 275, 23, 43, .74, 'a'], [675, 289, 11, 14, .46, 's'],
    [613, 240, 45, 17, 2, 'a'], [664, 236, 46, 17, 2, 'a'],
    [414, 273, 57, 51, .48, 's'], [416, 276, 9, 45, .6, 'w'], [414, 258, 11, 11, .5, 'a'], [414, 327, 12, 12, .5, 'a'], [496, 275, 11, 46, .8, 'a'],
    [412, 204, 14, 48, 2, 'a'], [493, 204, 14, 48, 2, 'a'], [426, 204, 33, 13, .9, 'a'], [426, 239, 33, 13, .9, 'a'],
    [511, 149, 23, 51, .55, 'w'], [418, 175, 34, 25, .08, 'w'], [537, 175, 34, 25, .08, 'w'], [463, 138, 71, 11, .86, 'w'],
    [420, 151, 14, 12, .42, 'w'], [547, 151, 15, 12, .42, 'w'], [412, 138, 6, 62, 1.1, 'w'], [537, 138, 6, 37, 1.1, 'w'], [594, 142, 13, 31, .86, 'w']
  ]
};
/* Ausschnitt je Plan in pt; im Obergeschoß ist alles außerhalb des Hauskörpers der Rahmen über der Terrasse */
const FLOORS = [
  { key: 'eg', src: 'assets/img/plan-eg.svg', crop: [209, 68, 806, 463] },
  { key: 'og', src: 'assets/img/plan-og.svg', crop: [293, 99, 789, 473], body: [397, 123, 725, 369] }
];

let M, T, S, D, k = reduce ? 1 : 0, started = false, az = 0, el = 0, user = [0, 0], touched = false, narrow = null, C = [0, 0, 0], BB = null;
const V = () => new T.Vector3();

export function initPlan3d() {
  D = { st: $('[data-p3]'), gl: $('[data-p3-gl]'), labs: $('[data-p3-labs]'), hint: $('[data-p3-hint]') };
  if (!D.st) return;
  /* Aufbau beim ersten Hinsehen: erst die Wände, dann die Möbel, dann die Namen */
  new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || started) return; started = true;
    const t0 = performance.now(), run = () => { k = reduce ? 1 : clamp((performance.now() - t0) / 2800); loop.poke(); if (k < 1) requestAnimationFrame(run); };
    run();
  }), { threshold: .25 }).observe(D.st);
  drag();
  loop.add({ tick });
  boot();
}

async function boot() {
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); return; }
  T = M.T;
  S = M.createStage(D.gl, { bg: 0x000000, fov: 26, shadow: .42, key: 2.2, hemi: 1.05, fogNear: 600, fogFar: 1400 });
  S.hemi.groundColor.setHex(0x3c3b38);
  S.ground.position.y = -.33;
  S.onResize = () => { layout(); loop.poke(); };
  const box = new T.BoxGeometry(1, 1, 1).translate(0, .5, 0), boxE = new T.EdgesGeometry(box);
  const cyl = new T.CylinderGeometry(.5, .5, 1, 32).translate(0, .5, 0), cylE = new T.EdgesGeometry(cyl, 40);
  const PO = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
  const mat = c => new T.MeshStandardMaterial({ color: c, roughness: .92, ...PO });
  const MAT = { wall: mat(0xF4F2EE), frame: mat(0xCACACA), plate: mat(0xE4E0D8), w: mat(COL.w), s: mat(COL.s), a: mat(COL.a) };
  const LINE = new T.LineBasicMaterial({ color: 0x9a948a, transparent: true, opacity: .75 });
  const LINE2 = new T.LineBasicMaterial({ color: 0x8b8378, transparent: true, opacity: .45 });
  const solid = (geo, m, eg, lm) => { const o = new T.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; if (eg) o.add(new T.LineSegments(eg, lm)); return o; };

  await Promise.all(FLOORS.map(async (f, fi) => {
    const svg = await (await fetch(f.src)).text();
    const [x0, y0, x1, y1] = f.crop, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const lx = x => (x - cx) / K, lz = y => (y - cy) / K;
    f.w = (x1 - x0) / K; f.d = (y1 - y0) / K; f.lx = lx; f.lz = lz;
    const g = f.g = new T.Group(); S.scene.add(g);
    /* Sockel und Boden mit der Planzeichnung */
    const plate = solid(box, MAT.plate, boxE, LINE2); plate.scale.set(f.w, .3, f.d); plate.position.y = -.3; plate.castShadow = false; g.add(plate);
    f.top = new T.Mesh(new T.PlaneGeometry(f.w, f.d), new T.MeshStandardMaterial({ color: 0xEFECE6, roughness: 1 }));
    f.top.rotation.x = -Math.PI / 2; f.top.position.y = .004; f.top.receiveShadow = true; g.add(f.top);
    tex(svg, f).then(t => { if (!t) return; f.top.material.map = t; f.top.material.color.setHex(0xffffff); f.top.material.needsUpdate = true; loop.poke(); });
    /* Wände: jede Wandfläche des Plans wird ein Körper. Splitter und Haarlinien bleiben weg. */
    f.walls = [];
    for (const m of svg.matchAll(/<path class="w"[^>]*? d="([^"]+)"/g)) {
      const n = (m[1].match(/-?[\d.]+/g) || []).map(Number), pts = [];
      for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      if (Math.min(b[2] - b[0], b[3] - b[1]) < 1.5 || (b[2] - b[0]) * (b[3] - b[1]) < 20) continue;
      const fr = f.body && (b[0] < f.body[0] || b[1] < f.body[1] || b[2] > f.body[2] || b[3] > f.body[3]);
      const sh = new T.Shape(pts.map(([x, y]) => new T.Vector2(lx(x), -lz(y))));
      const geo = new T.ExtrudeGeometry(sh, { depth: fr ? FRAME : WALL, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
      const o = solid(geo, fr ? MAT.frame : MAT.wall, new T.EdgesGeometry(geo, 25), LINE); g.add(o);
      f.walls.push({ o, d: clamp(((b[0] + b[2]) / 2 - x0) / (x1 - x0) * .7 + ((b[1] + b[3]) / 2 - y0) / (y1 - y0) * .3) });
    }
    /* Möbel */
    f.furn = FURN[f.key].map(([x, y, w, d, ht, c, rnd]) => {
      const o = solid(rnd ? cyl : box, MAT[c], c === 'a' ? null : (rnd ? cylE : boxE), LINE2);
      o.scale.set(w / K, ht, d / K); o.position.set(lx(x + w / 2), 0, lz(y + d / 2)); o.userData.h = ht; g.add(o);
      return { o, h: ht, d: clamp((x - x0) / (x1 - x0)) };
    });
    /* Namen auf dem Boden, dazu der Name der Ebene vor dem Sockel */
    const P = PLAN_3D[f.key];
    f.labs = P.labels.map(([t, x, y]) => ({ el: lab(t, 'p3__lab'), x: lx(x), z: lz(y) }));
    f.cap = { el: lab(P.cap, 'p3__cap'), x: 0, z: f.d / 2 };
    f.fi = fi;
  }));
  layout();
  loop.poke();
}

function lab(t, cls) { const s = document.createElement('span'); s.className = cls + ' info'; s.textContent = t; D.labs.appendChild(s); return s; }

/* Die Planzeichnung als Bodenbild: Wandflächen hell, Linien grau, Möbelflächen in Bodenfarbe */
function tex(svg, f) {
  const [x0, y0, x1, y1] = f.crop, sc = 4, W = Math.round((x1 - x0) * sc), H = Math.round((y1 - y0) * sc);
  const style = '<style>path{fill:none;stroke:#9f998f;stroke-width:.34}.w{fill:#d8d3cb;stroke:none}.k{fill:#EFECE6;stroke:none}.o{stroke-width:.7;stroke:#8f897f}.m{stroke-width:.46}.d{stroke-width:.42}.t{stroke-width:.26;stroke:#b6b0a6}</style>';
  const s2 = svg.replace(/<svg([^>]*?)viewBox="[^"]*"/, `<svg$1viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" width="${W}" height="${H}"`).replace(/(<svg[^>]*>)/, `$1${style}`);
  const url = URL.createObjectURL(new Blob([s2], { type: 'image/svg+xml' }));
  return new Promise(res => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d'); x.fillStyle = '#EFECE6'; x.fillRect(0, 0, W, H); x.drawImage(im, 0, 0, W, H);
      URL.revokeObjectURL(url);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = Math.min(8, S.r.capabilities.getMaxAnisotropy()); res(t);
    };
    im.onerror = () => { URL.revokeObjectURL(url); res(null); };
    im.src = url;
  });
}

/* Breit: beide Ebenen nebeneinander. Schmal: Erdgeschoß vorne, Obergeschoß dahinter. */
function layout() {
  if (!FLOORS[0].g) return;
  const w = D.gl.clientWidth || 1, h = D.gl.clientHeight || 1;
  narrow = w / h < 1.05;
  const [a, b] = FLOORS;
  if (!narrow) {
    const tot = a.w + GAP + b.w;
    a.g.position.set(-tot / 2 + a.w / 2, 0, 0); b.g.position.set(tot / 2 - b.w / 2, 0, -(a.d - b.d) / 2);
  } else {
    const tot = a.d + GAP + b.d;
    a.g.position.set(0, 0, tot / 2 - a.d / 2); b.g.position.set(0, 0, -tot / 2 + b.d / 2);
  }
  let mn = [1e9, 1e9], mx = [-1e9, -1e9];
  FLOORS.forEach(f => { const p = f.g.position; mn = [Math.min(mn[0], p.x - f.w / 2), Math.min(mn[1], p.z - f.d / 2)]; mx = [Math.max(mx[0], p.x + f.w / 2), Math.max(mx[1], p.z + f.d / 2)]; });
  C = [(mn[0] + mx[0]) / 2, .8, (mn[1] + mx[1]) / 2];
  BB = [];
  [mn[0], mx[0]].forEach(x => [-.3, WALL].forEach(y => [mn[1], mx[1]].forEach(z => BB.push(new T.Vector3(x, y, z)))));
}

/* Kameraabstand, bei dem das ganze Modell im Bild bleibt, für jede Drehung neu. Gestapelt (Telefon) mehr Luft unten für Geschoßname und Hinweis. */
function fit(a, e) {
  let lo = 6, hi = 320; const v = V();
  for (let i = 0; i < 16; i++) {
    const d = (lo + hi) / 2; S.orbit(a, e, d, C[0], C[1], C[2]); S.cam.updateMatrixWorld();
    let o = 0; BB.forEach(p => { v.copy(p).project(S.cam); o = Math.max(o, Math.abs(v.x) / .97, (v.y < 0 ? -v.y / (narrow ? .7 : .84) : v.y / (narrow ? .82 : .95)), v.z > 1 ? 9 : 0); });
    if (o > 1) lo = d; else hi = d;
  }
  return hi;
}

function drag() {
  let id = null, sx = 0, sy = 0, u0 = [0, 0];
  D.st.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    id = e.pointerId; sx = e.clientX; sy = e.clientY; u0 = [...user];
    D.st.setPointerCapture(id); D.st.classList.add('is-drag');
  });
  D.st.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    const dx = (e.clientX - sx) / 260, dy = e.pointerType === 'mouse' ? (e.clientY - sy) / 320 : 0;
    user = [clamp(u0[0] - dx, -1.3, 1.3), clamp(u0[1] + dy, -.45, .5)];
    if (!touched && Math.abs(e.clientX - sx) > 6) { touched = true; D.hint.classList.add('is-off'); }
    loop.poke();
  });
  const end = e => { if (e.pointerId !== id) return; id = null; D.st.classList.remove('is-drag'); };
  D.st.addEventListener('pointerup', end); D.st.addEventListener('pointercancel', end);
}

function tick() {
  if (!S || !BB) return;
  const r = D.st.getBoundingClientRect();
  if (r.bottom < -40 || r.top > innerHeight + 40) return;
  /* leichte Drehung beim Scrollen, dazu was du selbst gedreht hast */
  const t = through(D.st, 1, -.2);
  az = (narrow ? -.28 : -.4) + (t - .5) * .34 + user[0];
  el = clamp((narrow ? 1.02 : .92) + user[1], .4, 1.35);
  S.orbit(az, el, fit(az, el), C[0], C[1], C[2]);
  FLOORS.forEach(f => {
    if (!f.walls) return;
    f.walls.forEach(w => { const e = E(k, .04 + f.fi * .08 + w.d * .3, .3 + f.fi * .08 + w.d * .3); w.o.scale.y = Math.max(.001, e); w.o.visible = e > .002; });
    f.furn.forEach(m => { const e = E(k, .48 + f.fi * .06 + m.d * .22, .64 + f.fi * .06 + m.d * .22); m.o.scale.y = Math.max(.001, m.h * e); m.o.visible = e > .002; });
  });
  S.render();
  /* Namen folgen dem Modell */
  const lo = E(k, .82, 1), W = D.gl.clientWidth, H = D.gl.clientHeight, v = V();
  FLOORS.forEach(f => {
    if (!f.labs) return;
    const p = f.g.position, put = (L, y, o) => {
      v.set(p.x + L.x, y, p.z + L.z).project(S.cam);
      L.el.style.transform = `translate3d(${((v.x + 1) / 2 * W).toFixed(1)}px,${((1 - v.y) / 2 * H).toFixed(1)}px,0) translate(-50%,-50%)`;
      L.el.style.opacity = o.toFixed(3);
    };
    f.labs.forEach(L => put(L, .08, lo));
    put(f.cap, -.3, E(k, .1, .4));
  });
}
