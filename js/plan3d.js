/* GRUNDRISS IN 3D (Seiten der Concepts, data-p3-house wählt das Haus). Die echten CAD Grundrisse als Modell: ziehen zum Drehen, dazu ein Knopf für das ganze Haus.
   Wände: die gefüllten Wandflächen der Pläne (Klasse w), hochgezogen. Boden: die Planzeichnung selbst.
   Möbel: einfache Körper an den Stellen der weißen Möbelflächen im Plan (Klasse k).
   Wände und Möbelflächen kommen als Daten aus data/plan-geo.js (tools/plan-geo.mjs), nicht mehr aus dem SVG: Framer optimiert
   hochgeladene SVG, danach fand der alte Parser nichts mehr und die Pläne lagen live flach (2026-11-05). Das SVG ist nur das Bodenbild. Im Carport stehen die zwei Autos aus dem Plan in 3D.
   Ganzes Haus: das Obergeschoß setzt sich auf das Erdgeschoß, so wie die beiden Pläne übereinander liegen (gleiches Koordinatensystem).
   Dazwischen eine dunkle Decke, oben der dunkle Rahmen aus dem Obergeschoßplan (Seiten, Brüstung zum Garten) und das Dach.
   Pläne: SVG im Bildordner (tools/plan.mjs), in Punkt, 1 m = 28,35 pt, Norden oben. */
import { $, $$, E, clamp, lerp, loop, reduce, through } from './core.js';
import { PLAN_GEO } from '../data/plan-geo.js';

const K = 28.35, WALL = 2.35, FRAME = .32, GAP = 2.6;
/* Ganzes Haus: Geschoßhöhen in m, Deckenstärke, Brüstung */
const EGH = 2.9, OGH = 2.75, SLAB = .34, RAIL = 1.05;
const COL = { w: 0xF7F6F3, s: 0xCFC3B3, a: 0x5c5b57 }, DARK = 0x3a3936;
/* Concept Light, Möbel von Hand: x, y, Breite, Tiefe in pt (aus dem Plan), Höhe in m, Farbe (w weiß, s Sand, a Anthrazit), rund */
const FURN_LIGHT = {
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
/* Die echten Grundrisse je Concept (CAD PDF, tools/plan.mjs). Je Geschoß: Plan, Ausschnitt in pt, Hauskörper (body: alles außerhalb ist
   im Obergeschoß der Rahmen), aux (Mauern außerhalb des Hauses, wachsen im ganzen Haus nicht mit), Decke bzw. Dach (slab, pt),
   off (Versatz in pt auf das Erdgeschoß, wenn die Pläne nicht deckungsgleich liegen), Autos (Mitte x, y, Länge, Breite in pt, Lack, Richtung
   der Schnauze: s Süden, w Westen), Raumnamen. furn: Möbel von Hand, sonst aus den weißen Möbelflächen des Plans. */
const HOUSES = {
  light: [
    { key: 'eg', cap: 'Erdgeschoß', src: 'assets/img/plan-eg.svg', geo: 'plan-eg', crop: [209, 68, 806, 463], aux: b => b[0] < 330 || b[0] > 760, slab: [321, 117, 761, 445],
      furn: FURN_LIGHT.eg, cars: [[285.5, 155.5, 133, 51, 0xEDEBE6, 's'], [360, 157, 138, 54, 0x4a4a47, 's']],
      labels: [['Kochen', 436, 286], ['Essen', 431, 351], ['Wohnen', 686, 322], ['Büro', 650, 196], ['Eingang', 590, 152], ['Terrasse', 648, 434]] },
    { key: 'og', cap: 'Obergeschoß', src: 'assets/img/plan-og.svg', geo: 'plan-og', crop: [293, 99, 789, 473], body: [397, 123, 725, 369], slab: [321, 117, 761, 445],
      furn: FURN_LIGHT.og, labels: [['Eltern', 452, 342], ['Kind', 668, 150], ['Kind', 668, 340], ['Galerie', 557, 300], ['Bad', 476, 186]] }
  ],
  bold: [
    { key: 'eg', cap: 'Erdgeschoß', src: 'assets/img/plan-bold-eg.svg', geo: 'plan-bold-eg', crop: [135, 122, 732, 450], house: [312, 150, 706, 392], slab: [156, 129, 700, 442],
      cars: [[208.3, 241.4, 130, 49, 0xEDEBE6, 's'], [274.9, 241.4, 130, 49, 0x4a4a47, 's']],
      labels: [['Carport', 241.6, 241.4], ['Abstellraum', 241.6, 352.3], ['Eingang', 412.2, 207.3], ['WC', 367.4, 249.9], ['Zimmer', 382.3, 326.7], ['Technik', 542.2, 198.8], ['Kochen', 629.7, 220.1], ['Essen', 629.7, 331], ['Wohnen', 510.3, 322.4], ['Terrasse', 561.4, 416.2]] },
    { key: 'og', cap: 'Obergeschoß', src: 'assets/img/plan-bold-og.svg', geo: 'plan-bold-og', crop: [127, 148, 724, 474], body: [313, 180, 707, 412], slab: [133, 154, 718, 467], off: [0, -25],
      labels: [['Bad', 378.6, 224.8], ['Kind', 382.9, 348.4], ['Kind', 506.5, 348.4], ['Eltern', 655.8, 352.7], ['Bad', 638.7, 224.8], ['Ankleide', 660, 288.7], ['Terrasse', 233.6, 310]] }
  ],
  calm: [
    { key: 'eg', cap: 'Eine Ebene', src: 'assets/img/plan-calm-eg.svg', geo: 'plan-calm-eg', crop: [322, 134, 966, 700], house: [326, 385, 910, 645],
      cars: [[671.6, 196.1, 133.4, 50.6, 0xEDEBE6, 'w'], [671.6, 278.9, 138, 55.2, 0x4a4a47, 'w']],
      labels: [['Carport', 678.5, 239.8], ['Eingang', 680.8, 437.6], ['Kochen', 814.2, 433], ['Essen', 763.6, 571], ['Wohnen', 690, 575.6], ['Terrasse', 869.4, 571], ['Eltern', 372.6, 575.6], ['Ankleide', 372.6, 497.4], ['Bad', 404.8, 428.4], ['Dusche', 501.4, 433], ['Technik', 565.8, 433], ['Kind', 480.7, 571], ['Kind', 588.8, 571]] }
  ]
};
let FLOORS = [];

let M, T, S, D, k = reduce ? 1 : 0, started = false, az = 0, el = 0, user = [0, 0], touched = false, narrow = null;
let hm = 0, hmT = 0, lt = 0, PL = null, HS = null, MATD = null;
const V = () => new T.Vector3();
const sm = x => x * x * (3 - 2 * x);

export function initPlan3d() {
  D = { st: $('[data-p3]'), gl: $('[data-p3-gl]'), labs: $('[data-p3-labs]'), hint: $('[data-p3-hint]'), tag: $('[data-p3-tag]'), tabs: $$('[data-p3-mode]') };
  if (!D.st) return;
  FLOORS = (HOUSES[D.st.dataset.p3House] || HOUSES.light).map(f => ({ ...f }));
  /* Nur eine Ebene: kein Umschalten zum ganzen Haus */
  if (FLOORS.length < 2) { const tb = D.tabs[0] && D.tabs[0].closest('.tabs'); if (tb) tb.style.display = 'none'; }
  /* Aufbau beim ersten Hinsehen: erst die Wände, dann die Möbel, dann die Namen */
  new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || started) return; started = true;
    const t0 = performance.now(), run = () => { k = reduce ? 1 : clamp((performance.now() - t0) / 2800); loop.poke(); if (k < 1) requestAnimationFrame(run); };
    run();
  }), { threshold: .25 }).observe(D.st);
  /* Grundriss oder ganzes Haus */
  D.tabs.forEach(b => b.addEventListener('click', () => {
    hmT = b.dataset.p3Mode === 'haus' ? 1 : 0;
    D.tabs.forEach(x => x.setAttribute('aria-selected', String(x === b)));
    if (D.tag) D.tag.textContent = hmT ? 'Ganzes Haus / Idee, kein Maßstab' : 'Grundriss / Idee, kein Maßstab';
    if (reduce) hm = hmT;
    lt = performance.now(); loop.poke();
  }));
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
  const mat = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .92, ...PO, ...o });
  const MAT = { wall: mat(0xF4F2EE), w: mat(COL.w), s: mat(COL.s), a: mat(COL.a), dark: mat(DARK, { roughness: .8 }) };
  MATD = MAT.dark;
  const LINE = new T.LineBasicMaterial({ color: 0x9a948a, transparent: true, opacity: .75 });
  const LINE2 = new T.LineBasicMaterial({ color: 0x8b8378, transparent: true, opacity: .45 });
  const LINED = new T.LineBasicMaterial({ color: 0x55534f, transparent: true, opacity: .6 });
  const solid = (geo, m, eg, lm) => { const o = new T.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; if (eg) o.add(new T.LineSegments(eg, lm)); return o; };

  await Promise.all(FLOORS.map(async (f, fi) => {
    const pg = PLAN_GEO[f.geo] || { w: [], k: [] };
    const svg = await fetch(f.src).then(r => r.ok ? r.text() : null).catch(() => null);
    const [x0, y0, x1, y1] = f.crop, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const lx = x => (x - cx) / K, lz = y => (y - cy) / K;
    f.w = (x1 - x0) / K; f.d = (y1 - y0) / K; f.lx = lx; f.lz = lz; f.c = [cx, cy];
    const g = f.g = new T.Group(); S.scene.add(g);
    /* Sockel und Boden mit der Planzeichnung; im Obergeschoß blenden beide aus, sobald es auf dem Haus sitzt */
    f.pm = mat(0xE4E0D8, { transparent: true });
    const plate = f.plate = solid(box, f.pm, boxE, LINE2); plate.scale.set(f.w, .3, f.d); plate.position.y = -.3; plate.castShadow = false; g.add(plate);
    f.top = new T.Mesh(new T.PlaneGeometry(f.w, f.d), new T.MeshStandardMaterial({ color: 0xEFECE6, roughness: 1, transparent: true }));
    f.top.rotation.x = -Math.PI / 2; f.top.position.y = .004; f.top.receiveShadow = true; g.add(f.top);
    if (svg) tex(svg, f).then(t => { if (!t) return; f.top.material.map = t; f.top.material.color.setHex(0xffffff); f.top.material.needsUpdate = true; loop.poke(); });
    /* Wände: jede Wandfläche des Plans wird ein Körper. Splitter und Haarlinien bleiben weg.
       Rahmen (Obergeschoß, außerhalb des Hauskörpers): im Grundriss niedrig und hell, im ganzen Haus dunkel; Seiten raumhoch, zum Garten Brüstung.
       Mauern außerhalb des Hauses (Carport, Garten) wachsen im ganzen Haus nicht mit. */
    f.fm = mat(0xCACACA);
    f.walls = [];
    for (const n of pg.w) {
      const pts = [];
      for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      if (Math.min(b[2] - b[0], b[3] - b[1]) < 1.5 || (b[2] - b[0]) * (b[3] - b[1]) < 20) continue;
      const fr = !!f.body && (b[0] < f.body[0] || b[1] < f.body[1] || b[2] > f.body[2] || b[3] > f.body[3]);
      const cxw = (b[0] + b[2]) / 2, cyw = (b[1] + b[3]) / 2;
      const aux = f.aux ? f.aux(b) : !!f.house && (cxw < f.house[0] || cxw > f.house[2] || cyw < f.house[1] || cyw > f.house[3]);
      const sh = new T.Shape(pts.map(([x, y]) => new T.Vector2(lx(x), -lz(y))));
      const geo = new T.ExtrudeGeometry(sh, { depth: fr ? FRAME : WALL, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
      const o = solid(geo, fr ? f.fm : MAT.wall, new T.EdgesGeometry(geo, 25), LINE); g.add(o);
      const hgt = fr ? ((b[2] - b[0]) > (b[3] - b[1]) ? RAIL : OGH) / FRAME : aux ? 1.02 : (f.key === 'eg' ? EGH : OGH) / WALL;
      f.walls.push({ o, fr, hgt, d: clamp(((b[0] + b[2]) / 2 - x0) / (x1 - x0) * .7 + ((b[1] + b[3]) / 2 - y0) / (y1 - y0) * .3) });
    }
    /* Möbel */
    f.furn = (f.furn || autoFurn(pg, f)).map(([x, y, w, d, ht, c, rnd]) => {
      const o = solid(rnd ? cyl : box, MAT[c], c === 'a' ? null : (rnd ? cylE : boxE), LINE2);
      o.scale.set(w / K, ht, d / K); o.position.set(lx(x + w / 2), 0, lz(y + d / 2)); o.userData.h = ht; g.add(o);
      return { o, h: ht, d: clamp((x - x0) / (x1 - x0)) };
    });
    /* Autos im Carport */
    f.cars = (f.cars || []).map(([x, y, l, w, c, dir], i) => { const o = car(l / K, w / K, c); if (dir === 'w') o.rotation.y = -Math.PI / 2; o.position.set(lx(x), 0, lz(y)); g.add(o); return { o, d: .1 + i * .06 }; });
    /* Ganzes Haus: Decke über dem Erdgeschoß (am Erdgeschoß), Dach über dem Obergeschoß */
    const [sx0, sy0, sx1, sy1] = f.slab || f.crop, slab = solid(box, MAT.dark, boxE, LINED);
    slab.scale.set((sx1 - sx0) / K, SLAB, (sy1 - sy0) / K); slab.position.set(lx((sx0 + sx1) / 2), f.key === 'eg' ? EGH : OGH, lz((sy0 + sy1) / 2));
    slab.visible = false; g.add(slab); f.slab = slab;
    /* Namen auf dem Boden, dazu der Name der Ebene vor dem Sockel */
    f.labs = (f.labels || []).map(([t, x, y]) => ({ el: lab(t, 'p3__lab'), x: lx(x), z: lz(y) }));
    f.cap = { el: lab(f.cap, 'p3__cap'), x: 0, z: f.d / 2 };
    f.fi = fi;
  }));
  layout();
  loop.poke();
}

/* Möbel aus dem Plan: jede weiße Möbelfläche (Klasse k) innerhalb des Hauses wird ein einfacher Körper, die Höhe nach Größe und Form.
   Klein (Stühle, Hocker), groß und flach (Betten, Sofas), lang und schmal (Küchenzeilen, Schränke), sonst Tische. */
function autoFurn(pg, f) {
  const H = f.body || f.house || f.crop, out = [];
  for (const b of pg.k) {
    const w = b[2] - b[0], d = b[3] - b[1], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    if (Math.max(w, d) < 6 || cx < H[0] || cx > H[2] || cy < H[1] || cy > H[3]) continue;
    const lo = Math.min(w, d), hi = Math.max(w, d);
    let ht = .74, c = 'a';
    if (hi < 22) { ht = .46; c = 's'; }
    else if (lo > 34 && w * d > 1400) { ht = .45; c = 's'; }
    else if (lo < 24 && hi > 40) { ht = .9; c = 'a'; }
    else if (lo < 30) { ht = .42; c = 's'; }
    out.push([b[0], b[1], w, d, ht, c]);
  }
  return out;
}

/* Ein Auto als einfaches, echtes Modell: Karosserie im Profil, Glas, Dach, vier Räder. Länge entlang z, Schnauze nach +z. */
function car(L, W, paint) {
  /* gebaut entlang x (hinten bei −x, Schnauze bei +x), dann eine Vierteldrehung: +x zeigt nach +z */
  const g = new T.Group(), inner = new T.Group(); inner.rotation.y = -Math.PI / 2; g.add(inner);
  const body = new T.MeshStandardMaterial({ color: paint, roughness: .35, metalness: .25 });
  const glass = new T.MeshStandardMaterial({ color: 0x1f2326, roughness: .15, metalness: .4 });
  const tyre = new T.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .9 }), rim = new T.MeshStandardMaterial({ color: 0xb9b9b6, roughness: .4, metalness: .6 });
  const s = L / 4.7, P = (pts, w, m) => {
    const sh = new T.Shape(pts.map(([u, v]) => new T.Vector2(u * s - L / 2, v)));
    const geo = new T.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2 }); geo.translate(0, 0, -w / 2);
    const o = new T.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; inner.add(o); return o;
  };
  P([[.04, .3], [0, .5], [.05, .86], [.32, .96], [3.3, .99], [4.42, .87], [4.66, .68], [4.7, .44], [4.6, .3]], W - .06, body);
  P([[.26, .93], [.6, 1.4], [2.95, 1.43], [3.52, .96]], W - .2, glass);
  P([[.5, 1.36], [.66, 1.47], [2.88, 1.48], [3.02, 1.37]], W - .16, body);
  const wg = new T.CylinderGeometry(.34, .34, .24, 28).rotateX(Math.PI / 2), hg = new T.CylinderGeometry(.2, .2, .25, 20).rotateX(Math.PI / 2);
  [.86, 3.75].forEach(u => [-1, 1].forEach(sd => {
    const t = new T.Mesh(wg, tyre), r = new T.Mesh(hg, rim), x = u * s - L / 2, z = sd * (W / 2 - .12);
    t.position.set(x, .34, z); r.position.set(x, .34, z + sd * .005); t.castShadow = true; inner.add(t, r);
  }));
  return g;
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

/* Breit: beide Ebenen nebeneinander. Schmal: Erdgeschoß vorne, Obergeschoß dahinter.
   Ganzes Haus: Erdgeschoß in der Mitte, Obergeschoß genau darüber, versetzt wie in den Plänen. */
function layout() {
  if (!FLOORS[0] || !FLOORS[0].g) return;
  const w = D.gl.clientWidth || 1, h = D.gl.clientHeight || 1;
  narrow = w / h < 1.05;
  const [a, b] = FLOORS;
  const box = (x0, x1, y0, y1, z0, z1) => { const o = []; [x0, x1].forEach(x => [y0, y1].forEach(y => [z0, z1].forEach(z => o.push([x, y, z])))); return o; };
  /* Nur eine Ebene: das Geschoß in der Mitte, kein ganzes Haus */
  if (!b) {
    PL = HS = { a: [0, 0], C: [0, .8, 0], BB: box(-a.w / 2, a.w / 2, -.3, WALL, -a.d / 2, a.d / 2) };
    return;
  }
  let pa, pb;
  if (!narrow) { const tot = a.w + GAP + b.w; pa = [-tot / 2 + a.w / 2, 0]; pb = [tot / 2 - b.w / 2, -(a.d - b.d) / 2]; }
  /* Telefon: mehr Abstand, weil die Kamera flacher von der Seite schaut und das vordere Geschoß sonst das hintere verdeckt */
  else { const tot = a.d + GAP * 2 + b.d; pa = [0, tot / 2 - a.d / 2]; pb = [0, -tot / 2 + b.d / 2]; }
  let mn = [1e9, 1e9], mx = [-1e9, -1e9];
  [[a, pa], [b, pb]].forEach(([f, p]) => { mn = [Math.min(mn[0], p[0] - f.w / 2), Math.min(mn[1], p[1] - f.d / 2)]; mx = [Math.max(mx[0], p[0] + f.w / 2), Math.max(mx[1], p[1] + f.d / 2)]; });
  PL = { a: pa, b: pb, C: [(mn[0] + mx[0]) / 2, .8, (mn[1] + mx[1]) / 2], BB: box(mn[0], mx[0], -.3, WALL, mn[1], mx[1]) };
  const top = EGH + SLAB + OGH + SLAB, off = b.off || [0, 0];
  HS = { a: [0, 0], b: [(b.c[0] + off[0] - a.c[0]) / K, (b.c[1] + off[1] - a.c[1]) / K], C: [0, 2.4, 0], BB: box(-a.w / 2, a.w / 2, -.3, top, -a.d / 2, a.d / 2) };
}

/* Kameraabstand, bei dem das ganze Modell im Bild bleibt, für jede Drehung neu. Gestapelt (Telefon) mehr Luft unten für Geschoßname und Hinweis. */
function fit(a, e, C, BB) {
  let lo = 6, hi = 320; const v = V();
  for (let i = 0; i < 16; i++) {
    const d = (lo + hi) / 2; S.orbit(a, e, d, C[0], C[1], C[2]); S.cam.updateMatrixWorld();
    let o = 0; BB.forEach(p => { v.set(p[0], p[1], p[2]).project(S.cam); o = Math.max(o, Math.abs(v.x) / .97, (v.y < 0 ? -v.y / (narrow ? .6 : .84) : v.y / (narrow ? .8 : .9)), v.z > 1 ? 9 : 0); });
    if (o > 1) lo = d; else hi = d;
  }
  return hi;
}

function drag() {
  let id = null, sx = 0, sy = 0, u0 = [0, 0];
  D.st.addEventListener('pointerdown', e => {
    if (e.button > 0 || e.target.closest('button')) return;
    id = e.pointerId; sx = e.clientX; sy = e.clientY; u0 = [...user];
    D.st.setPointerCapture(id); D.st.classList.add('is-drag');
  });
  D.st.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    const dx = (e.clientX - sx) / 260, dy = e.pointerType === 'mouse' ? (e.clientY - sy) / 320 : 0;
    user = [clamp(u0[0] - dx, -1.3, 1.3), clamp(u0[1] + dy, -.5, .5)];
    if (!touched && Math.abs(e.clientX - sx) > 6) { touched = true; D.hint.classList.add('is-off'); }
    loop.poke();
  });
  const end = e => { if (e.pointerId !== id) return; id = null; D.st.classList.remove('is-drag'); };
  D.st.addEventListener('pointerup', end); D.st.addEventListener('pointercancel', end);
}

function tick() {
  if (!S || !PL) return;
  const r = D.st.getBoundingClientRect();
  if (r.bottom < -40 || r.top > innerHeight + 40) return;
  /* Umbau zum ganzen Haus und zurück, 1,8 s */
  const now = performance.now(), dt = Math.min(.1, (now - lt) / 1000 || .016); lt = now;
  if (hm !== hmT) { hm = hmT > hm ? Math.min(hmT, hm + dt / 1.8) : Math.max(hmT, hm - dt / 1.8); loop.poke(); }
  const m = sm(hm), [a, b] = FLOORS;
  if (!a.g) return;
  /* Lage der Geschoße: das Obergeschoß hebt ab, schwebt hinüber und setzt sich auf die Decke */
  const mv = E(m, .12, .8), arc = Math.sin(Math.PI * mv) * 2.4;
  a.g.position.set(lerp(PL.a[0], HS.a[0], E(m, 0, .7)), 0, lerp(PL.a[1], HS.a[1], E(m, 0, .7)));
  if (b) b.g.position.set(lerp(PL.b[0], HS.b[0], mv), lerp(0, EGH + SLAB, mv) + arc, lerp(PL.b[1], HS.b[1], mv));
  const C = PL.C.map((v, i) => lerp(v, HS.C[i], m)), BB = PL.BB.map((p, i) => p.map((v, j) => lerp(v, HS.BB[i][j], m)));
  /* leichte Drehung beim Scrollen, dazu was du selbst gedreht hast; das ganze Haus von flacher und mehr von der Seite */
  const t = through(D.st, 1, -.2);
  /* Telefon: mehr von der Seite als von oben (Kundenwunsch 2026-11-05) */
  az = lerp(narrow ? -.24 : -.4, narrow ? -.55 : -.62, m) + (t - .5) * (narrow ? .2 : .34) + user[0];
  el = clamp(lerp(narrow ? .56 : .92, .42, m) + user[1], .14, 1.35);
  S.orbit(az, el, fit(az, el, C, BB), C[0], C[1], C[2]);
  const gw = E(m, .04, .42), gu = E(m, .55, .86), gf = E(m, .62, .92), gs = E(m, .34, .56), gr = E(m, .8, 1);
  FLOORS.forEach(f => {
    if (!f.walls) return;
    const grow = f.fi ? gu : gw;
    f.walls.forEach(w => {
      const e = E(k, .04 + f.fi * .08 + w.d * .3, .3 + f.fi * .08 + w.d * .3);
      w.o.scale.y = Math.max(.001, e * lerp(1, w.hgt, w.fr ? gf : grow)); w.o.visible = e > .002;
    });
    f.furn.forEach(o => { const e = E(k, .48 + f.fi * .06 + o.d * .22, .64 + f.fi * .06 + o.d * .22); o.o.scale.y = Math.max(.001, o.h * e); o.o.visible = e > .002; });
    f.cars.forEach(c => { const e = E(k, .5 + c.d, .7 + c.d); c.o.scale.y = Math.max(.001, e); c.o.visible = e > .002; });
    /* Rahmen wird dunkel, Sockel und Boden des Obergeschoßes verschwinden, Decke und Dach wachsen */
    f.fm.color.setHex(0xCACACA).lerp(MATD.color, gf);
    if (f.fi) { const o = 1 - E(m, .06, .34); f.pm.opacity = o; f.top.material.opacity = o; f.plate.visible = f.top.visible = o > .002; f.pm.depthWrite = f.top.material.depthWrite = o > .5; }
    const sg = f.fi ? gr : gs; f.slab.visible = sg > .002; f.slab.scale.y = Math.max(.001, SLAB * sg);
  });
  S.render();
  /* Namen folgen dem Modell und gehen, sobald das Haus zusammengesetzt wird */
  const lo = E(k, .82, 1) * (1 - E(m, 0, .2)), W = D.gl.clientWidth, H = D.gl.clientHeight, v = V();
  FLOORS.forEach(f => {
    if (!f.labs) return;
    const p = f.g.position, put = (L, y, o) => {
      L.el.style.opacity = o.toFixed(3);
      if (o <= 0) return;
      v.set(p.x + L.x, p.y + y, p.z + L.z).project(S.cam);
      L.el.style.transform = `translate3d(${((v.x + 1) / 2 * W).toFixed(1)}px,${((1 - v.y) / 2 * H).toFixed(1)}px,0) translate(-50%,-50%)`;
    };
    f.labs.forEach(L => put(L, .08, lo));
    put(f.cap, -.3, E(k, .1, .4) * (1 - E(m, 0, .2)));
  });
}
