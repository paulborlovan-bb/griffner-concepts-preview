/* Runde 49: Services Übersicht im Design v2 (Kunde). Der Film über das ganze Projekt, gezeichnet mit three.js.
   Das Haus ist Concept Free, dasselbe Modell wie der Grundriss auf griffner.com/concepts/free (js/grundriss.js, data/grundriss-free.js:
   Erdgeschoß in Stein, Obergeschoß in Lärche, Satteldach mit Holzrahmen, Loggien in beiden Giebeln, echte Möbel). Dazu gebaut:
   das Grundstück (24 × 32 m), Zufahrt, Carport, Pool, Sauna, Bäume, Maße, Baufenster, Bohrkern, Zonen des Projektplans,
   ein Schlüssel (Projektmanager), der Wagen des Kundendiensts und ein Schnitt durch die GRIFFNER Wand.
   Eingang: P von 0 bis 12 (Kapitel des Entwurfs, js/svc-film.js). Daraus: Bauzustand des Hauses, Explosion in Schichten, Kamera, Marken.
   Gezeichnet wird nur, wenn sich P, die Größe oder der Fokus ändert.
   Welt in m: x nach Osten, z nach Süden (Straße), y nach oben, Mitte des Erdgeschoßes bei 0. */
import * as T from 'three';
import { houseWorld } from './grundriss.js';
import { M, B, UBOX } from './grundriss-moebel.js';
import { MAT, WALL } from './svc-geo.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = t => (t = clamp(t), t * t * (3 - 2 * t));
const S_ = (p, a, b) => sm((p - a) / (b - a));
/* an zwischen a und b, mit weichen Rändern r */
const win = (p, a, b, r = .06) => Math.min(S_(p, a - r, a + r * .5), 1 - S_(p, b - r * .5, b + r));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GELB = 0xFFB200;

/* ---------- Grundstück und Garten (m) ---------- */
const PLOT = { x0: -12, x1: 12, z0: -16, z1: 16 };
const GROUND_Y = -.12;
const DRIVE = { x0: -6.8, x1: -1.7, z0: 6.84, z1: 16 };
const CARPORT = { x0: 2.6, x1: 8.4, z0: 10.2, z1: 15.6 };
const POOL = { x0: .6, x1: 9.8, z0: -14.9, z1: -11.1 };
const SAUNA = { x0: -11.2, x1: -7.9, z0: -15.4, z1: -12.6 };
const TREES = [[-10.4, -9.8, 1.15], [-10.6, -4.2, .95], [-10.3, 2.8, 1.1], [10.4, -8.4, 1], [10.6, 1.5, 1.2], [10.2, 7.6, .9], [-10.5, 9.5, 1.05], [-3.4, -14.6, .85], [10.6, -15, .8]];

/* Kamera: Ziel t, Azimut az (0 = von Süden), Höhe el, Abstand d */
const V = (t, az, el, d) => ({ t, az, el, d });
const KEYS = [
  [0, V([0, 3.4, 0], -.62, .1, 42)],
  [1, V([0, 3.4, 0], -.22, .16, 46)],
  [2.05, V([0, 2.4, 0], -.1, .24, 52)],
  [2.7, V([0, 0, 0], -.42, .62, 64)],
  [3.15, V([0, 5.2, 0], -.62, .36, 62)],
  [3.95, V([0, 6.2, 0], -.72, .34, 64)],
  [4.25, V([0, 0, 0], -.28, 1.02, 98)],
  [5.05, V([0, 0, .5], -.18, 1.1, 100)],
  [5.5, V([0, 0, 0], -.1, 1.18, 96)],
  [5.68, V([0, 0, 0], -.06, 1.26, 47)],
  [6.02, V([0, 0, 0], -.06, 1.26, 47)],
  [6.3, V([0, -.2, 0], -.62, .46, 42)],
  [6.92, V([0, -.2, 0], -.5, .4, 42)],
  [7.12, V([1.2, 3.2, .5], .56, .2, 40)],
  [7.98, V([1.2, 3.2, .5], .66, .2, 40)],
  [8.18, V([-.6, .4, -1.2], -.34, .92, 37)],
  [8.98, V([-.6, .4, -1.2], -.4, .92, 37)],
  [9.22, V([0, 0, -1], -.62, .86, 76)],
  [9.98, V([0, 0, -1], -.7, .84, 76)],
  [10.2, V([-.6, 2.4, 7], .2, .24, 33)],
  [10.48, V([-.6, 2.4, 7], .28, .24, 32)],
  [10.62, V([-2.6, 1.5, 9.5], .5, .26, 36)],
  [10.98, V([-2.6, 1.5, 9.5], .58, .26, 37)],
  [11.2, V([0, 3.4, 0], -.6, .12, 46)],
  [12, V([0, 3.4, 0], -.86, .14, 50)]
];
/* Punkte im Haus: Anker und Blick */
const HOT = {
  dach: { at: [4.7, 7.6, -1.2], v: V([4.2, 7.2, -1], .92, .42, 22.4) },
  wand: { at: [9.2, 1.5, 2.7], v: V([8.6, 1.5, 2.7], 1.0, .14, 13.6) },
  fenster: { at: [4.35, 4.6, 6.75], v: V([4.3, 4.5, 6.9], .32, .08, 16.8) },
  fassade: { at: [6.75, 4.6, -2.2], v: V([6.7, 4.4, -1.6], 1.22, .08, 20.8) },
  hoehe: { at: [7.95, 1.4, -4.2], v: V([7.9, 1.45, -4.2], 1.32, .06, 15.2) },
  open: { at: [3.2, .6, -4.2], v: V([3.2, .4, -3.8], -.36, .62, 24) },
  parkett: { at: [1.2, .05, -2.6], v: V([1.2, .1, -2.8], -.5, .82, 12) },
  fliesen: { at: [-4.7, .05, -3.8], v: V([-4.6, .2, -4.2], -.6, .86, 13.6) },
  bad: { at: [4.6, 3.4, -4.3], v: V([4.5, 3.5, -4.2], -.4, .82, 15.2) },
  tuer: { at: [3.4, 1.0, 1.3], v: V([3.2, .9, 1.6], .3, .34, 12) }
};
const EXT = ['dach', 'wand', 'fenster', 'fassade', 'hoehe'];

export async function createFilm(stage, opt = {}) {
  const canvas = stage.querySelector('canvas');
  const l3 = stage.querySelector('[data-l3]');
  const small = () => innerWidth < 900;
  const R = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  R.setClearColor(0x000000, 0);
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .98;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  const cam = new T.PerspectiveCamera(30, 1, .3, 600);

  /* ---------- Haus ---------- */
  const HW = await houseWorld('free', R);
  const scene = HW.scene; scene.background = null;
  const S = HW.S, HT = HW.HT, EGH = HT.eg, OGY = HT.eg + HT.slab;
  const hemi = new T.HemisphereLight(0xffffff, 0xcfc8bd, .42);
  const sun = new T.DirectionalLight(0xfff1e0, 2.25);
  sun.position.set(-16, 30, 20); sun.target.position.set(0, 0, 0); sun.castShadow = true;
  const smap = small() ? 1024 : 2048; sun.shadow.mapSize.set(smap, smap);
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 120 });
  scene.add(hemi, sun, sun.target);
  const envAll = o => (o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []).forEach(m => { if (m.isMeshStandardMaterial && m.envMapIntensity === 1) m.envMapIntensity = .75; });

  /* Teile des Erdgeschoßes für die Explosion: Fundament (Sockel), Innen (Boden, Möbel, Treppe), Hülle (alles andere) */
  const EG = HW.FL[0], OG = HW.FL[1];
  const inner = new Set([EG.plane, ...EG.furn.map(o => o.m), ...EG.steps.map(s => s.m)]);
  const fund = new Set([...EG.base, ...EG.rim]);
  const managed = new Set([...EG.base, ...EG.steps.filter(s => s.th).map(s => s.m)]);
  HW.apply();
  EG.g.children.forEach(c => { c.userData.y0 = c.position.y; });
  const offEG = (fo, io, so) => EG.g.children.forEach(c => {
    const off = fund.has(c) ? fo : inner.has(c) ? io : so;
    if (managed.has(c)) c.position.y += off; else c.position.y = c.userData.y0 + off;
  });

  /* ---------- Grundstück ---------- */
  const W3 = new T.Group(); scene.add(W3);
  const std = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: .95, metalness: 0, ...o });
  const MG = {
    lawn: std(0x4b4f45), plinth: std(0x2a2a29), paving: std(0x9c988f), drive: std(0x7a7770), gravel: std(0x77736c),
    water: new T.MeshStandardMaterial({ color: 0x86aab3, roughness: .08, metalness: .1, transparent: true, opacity: .82 }),
    coping: std(0xeceae5, { roughness: .6 }), trunk: std(0x6e5a44), leaf: std(0x6f7761, { roughness: .9 }), leaf2: std(0x7f866f, { roughness: .9 }),
    timber: std(0x9a7a56, { roughness: .8 }), dark: std(0x2e2e2c, { roughness: .7 }), white: std(0xf2f0eb, { roughness: .6 }),
    gelb: new T.MeshStandardMaterial({ color: GELB, roughness: .7, emissive: GELB, emissiveIntensity: .12 }),
    soil: [std(0x5a4a3a), std(0x7a6a52), std(0x9c8b6c), std(0x6b6258), std(0x8a8378)]
  };
  const box = (g, x0, y0, z0, x1, y1, z1, m, cast = true) => { const o = new T.Mesh(UBOX, m); o.scale.set(x1 - x0, y1 - y0, z1 - z0); o.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2); o.castShadow = cast; o.receiveShadow = true; g.add(o); return o; };

  /* Rasenplatte (wächst vom Sockel des Hauses auf das ganze Grundstück) */
  const lawn = box(W3, -.5, GROUND_Y - .45, -.5, .5, GROUND_Y, .5, [MG.plinth, MG.plinth, MG.lawn, MG.plinth, MG.plinth, MG.plinth], false);
  const plotSize = k => { const a = { x0: -8.9, x1: 8.9, z0: -9.9, z1: 9.4 }, b = PLOT; return { x0: lerp(a.x0, b.x0, k), x1: lerp(a.x1, b.x1, k), z0: lerp(a.z0, b.z0, k), z1: lerp(a.z1, b.z1, k) }; };
  const setPlot = k => { const p = plotSize(k); lawn.scale.set(p.x1 - p.x0, .45, p.z1 - p.z0); lawn.position.set((p.x0 + p.x1) / 2, GROUND_Y - .45, (p.z0 + p.z1) / 2); };

  /* Garten: jedes Teil eine Gruppe, die von unten wächst */
  const parts = {};
  const part = (key, anchor) => { const g = new T.Group(); W3.add(g); parts[key] = { g, k: -1, anchor }; return g; };
  { const g = part('zufahrt'); box(g, DRIVE.x0, GROUND_Y, DRIVE.z0, DRIVE.x1, GROUND_Y + .05, DRIVE.z1, MG.drive, false); box(g, -1.7, GROUND_Y, 8.34, 2.4, GROUND_Y + .05, 16, MG.paving, false); }
  {
    const g = part('carport'), c = CARPORT, h = 2.6;
    [[c.x0 + .1, c.z0 + .1], [c.x1 - .25, c.z0 + .1], [c.x0 + .1, c.z1 - .25], [c.x1 - .25, c.z1 - .25]].forEach(([x, z]) => box(g, x, GROUND_Y, z, x + .15, GROUND_Y + h, z + .15, MG.timber));
    box(g, c.x0 - .2, GROUND_Y + h, c.z0 - .2, c.x1 + .2, GROUND_Y + h + .22, c.z1 + .2, [MG.timber, MG.timber, MG.dark, MG.timber, MG.timber, MG.timber]);
    box(g, c.x0, GROUND_Y, c.z0, c.x1, GROUND_Y + .04, c.z1, MG.gravel, false);
  }
  {
    const g = part('pool'), p = POOL;
    box(g, p.x0 - .5, GROUND_Y, p.z0 - .5, p.x1 + .5, GROUND_Y + .06, p.z0, MG.coping, false);
    box(g, p.x0 - .5, GROUND_Y, p.z1, p.x1 + .5, GROUND_Y + .06, p.z1 + .5, MG.coping, false);
    box(g, p.x0 - .5, GROUND_Y, p.z0, p.x0, GROUND_Y + .06, p.z1, MG.coping, false);
    box(g, p.x1, GROUND_Y, p.z0, p.x1 + .5, GROUND_Y + .06, p.z1, MG.coping, false);
    box(g, p.x0, GROUND_Y - .25, p.z0, p.x1, GROUND_Y - .02, p.z1, MG.water, false);
    box(g, p.x0 - .5, GROUND_Y, p.z1 + .5, p.x1 + .5, GROUND_Y + .04, p.z1 + 2.2, MG.paving, false);
  }
  {
    const g = part('sauna'), s = SAUNA, h = 2.5;
    box(g, s.x0, GROUND_Y, s.z0, s.x1, GROUND_Y + h, s.z1, [MG.timber, MG.timber, MG.dark, MG.timber, M.glass, MG.timber]);
    box(g, s.x0 - .3, GROUND_Y + h, s.z0 - .3, s.x1 + .3, GROUND_Y + h + .18, s.z1 + .3, MG.dark);
    box(g, s.x0, GROUND_Y, s.z1, s.x1, GROUND_Y + .05, s.z1 + 1.6, MG.timber, false);
  }
  {
    const g = part('garten');
    const leafG = new T.IcosahedronGeometry(1, 4), trunkG = new T.CylinderGeometry(.1, .14, 1, 8).translate(0, .5, 0);
    TREES.forEach(([x, z, s], i) => {
      const t = new T.Group(); t.position.set(x, GROUND_Y, z); t.scale.setScalar(s); g.add(t);
      const tr = new T.Mesh(trunkG, MG.trunk); tr.scale.set(1, 2.2, 1); tr.castShadow = true; t.add(tr);
      const lf = new T.Mesh(leafG, i % 2 ? MG.leaf2 : MG.leaf); lf.scale.set(1.5, 1.85, 1.5); lf.position.y = 3.6; lf.castShadow = true; lf.receiveShadow = true; t.add(lf);
      t.userData.tree = 1;
    });
    /* Hecke an der Straße und ein Weg aus Platten zur Sauna */
    box(g, PLOT.x0 + .3, GROUND_Y, PLOT.z1 - .9, DRIVE.x0 - .6, GROUND_Y + 1.0, PLOT.z1 - .3, MG.leaf);
    box(g, 2.9, GROUND_Y, PLOT.z1 - .9, PLOT.x1 - .3, GROUND_Y + 1.0, PLOT.z1 - .3, MG.leaf);
    for (let i = 0; i < 5; i++) box(g, -6.6 + i * .2, GROUND_Y, -10.2 - i * 1.0, -5.6 + i * .2, GROUND_Y + .04, -9.6 - i * 1.0, MG.paving, false);
  }

  /* ---------- Linien: Grundstücksgrenze, Maße, Baufenster, Pläne ---------- */
  const lineMat = (color = 0xffffff, op = 1) => new T.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false });
  const segs = (pts, mat) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pts.flat(), 3)); const l = new T.LineSegments(g, mat); l.renderOrder = 2; W3.add(l); return l; };
  const rectPts = (x0, z0, x1, z1, y) => [[x0, y, z0], [x1, y, z0], [x1, y, z0], [x1, y, z1], [x1, y, z1], [x0, y, z1], [x0, y, z1], [x0, y, z0]];
  const yL = GROUND_Y + .03;
  const border = segs(rectPts(PLOT.x0, PLOT.z0, PLOT.x1, PLOT.z1, yL), lineMat(0xffffff, .9));
  const dimM = lineMat(0xffffff, 1);
  const tk = (x, z, ax) => (ax === 'x' ? [[x, yL, z - .5], [x, yL, z + .5]] : [[x - .5, yL, z], [x + .5, yL, z]]);
  const dimX = segs([[PLOT.x0, yL, PLOT.z1 + 1.6], [PLOT.x1, yL, PLOT.z1 + 1.6], ...tk(PLOT.x0, PLOT.z1 + 1.6, 'x'), ...tk(PLOT.x1, PLOT.z1 + 1.6, 'x')], dimM.clone());
  const dimZ = segs([[PLOT.x1 + 1.6, yL, PLOT.z0], [PLOT.x1 + 1.6, yL, PLOT.z1], ...tk(PLOT.x1 + 1.6, PLOT.z0, 'z'), ...tk(PLOT.x1 + 1.6, PLOT.z1, 'z')], dimM.clone());
  const bau = (() => {
    const g = new T.BufferGeometry().setFromPoints(rectPts(-9, -13, 9, 13, yL + .01).filter((p, i) => i % 2 === 0).concat([[-9, yL + .01, -13]]).map(p => new T.Vector3(...p)));
    const l = new T.Line(g, new T.LineDashedMaterial({ color: GELB, dashSize: .6, gapSize: .4, transparent: true, depthWrite: false }));
    l.computeLineDistances(); l.renderOrder = 2; W3.add(l); return l;
  })();
  /* Bohrkern: Schichten des Baugrunds, die aus dem Boden steigen */
  const core = new T.Group(); core.position.set(-8.6, 0, 12.2); W3.add(core);
  { let y = 0; [.5, .7, .9, .6, .8].forEach((h, i) => { const m = new T.Mesh(new T.CylinderGeometry(.42, .42, h, 28).translate(0, -y - h / 2, 0), MG.soil[i]); m.castShadow = true; core.add(m); y += h; }); core.userData.h = y; }
  /* Zonen des Projektplans */
  const zoneMat = c => new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide });
  const zone = (rs, c) => { const g = new T.Group(), mat = zoneMat(c); rs.forEach(([x0, z0, x1, z1]) => { const m = new T.Mesh(new T.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2), mat); m.position.set((x0 + x1) / 2, yL + .02, (z0 + z1) / 2); m.renderOrder = 3; g.add(m); }); W3.add(g); return mat; };
  const Z0 = zone([[-7.7, -6.84, 7.7, 6.84], [-1.3, -8.84, 6.7, -6.84], [-1.3, 6.84, 6.7, 8.34], [DRIVE.x0, DRIVE.z0, DRIVE.x1, DRIVE.z1]], GELB);
  const Z1 = zone([[CARPORT.x0, CARPORT.z0, CARPORT.x1, CARPORT.z1]], 0xffffff);
  const Z2 = zone([[POOL.x0, POOL.z0, POOL.x1, POOL.z1], [SAUNA.x0, SAUNA.z0, SAUNA.x1, SAUNA.z1]], 0xffffff);

  /* ---------- Schlüssel (Projektmanager) ---------- */
  const key = new T.Group(); scene.add(key);
  {
    const ring = new T.Mesh(new T.TorusGeometry(.36, .1, 16, 40), MG.gelb); ring.position.x = -.62; key.add(ring);
    const shaft = new T.Mesh(UBOX, MG.gelb); shaft.scale.set(1.25, .13, .1); shaft.position.set(.2, -.065, 0); key.add(shaft);
    [[.55, .28], [.72, .2], [.38, .2]].forEach(([x, h]) => { const b2 = new T.Mesh(UBOX, MG.gelb); b2.scale.set(.12, h, .1); b2.position.set(x, -h - .02, 0); key.add(b2); });
    key.traverse(o => { if (o.isMesh) o.castShadow = true; });
  }
  /* ---------- Wagen des Kundendiensts ---------- */
  const van = new T.Group(); scene.add(van);
  {
    const L = 5.2, Wd = 2.0;
    box(van, -L / 2, .38, -Wd / 2, L / 2 - 1.2, 2.45, Wd / 2, MG.white);
    box(van, L / 2 - 1.25, .38, -Wd / 2, L / 2, 1.55, Wd / 2, MG.white);
    box(van, L / 2 - 1.2, 1.25, -Wd / 2 + .06, L / 2 - .25, 2.05, Wd / 2 - .06, M.carGlass);
    box(van, -L / 2 + .3, 1.5, -Wd / 2 - .005, L / 2 - 1.4, 1.62, Wd / 2 + .005, MG.gelb, false);
    const wg = new T.CylinderGeometry(.36, .36, .26, 20).rotateX(Math.PI / 2);
    [[-1.6, -Wd / 2], [-1.6, Wd / 2], [1.65, -Wd / 2], [1.65, Wd / 2]].forEach(([x, z]) => { const w = new T.Mesh(wg, M.tyre); w.position.set(x, .36, z); van.add(w); });
    van.rotation.y = Math.PI / 2;
  }
  /* ---------- Schnitt durch die GRIFFNER Wand (Punkt Wand): neun Schichten, die sich beim Fokus auffächern ---------- */
  const wall = new T.Group(); wall.position.set(7.72, 0, 2.7); scene.add(wall);
  const wallL = [];
  { let a = 0; WALL.forEach(L => { const m = new T.Mesh(UBOX, MAT[L.m]()); m.scale.set(Math.max(.01, L.d), EGH - .1, 1.6); m.castShadow = true; m.receiveShadow = true; wall.add(m); wallL.push({ m, a, d: L.d }); a += L.d; }); wall.userData.D = a; }
  /* Maß der Raumhöhe (Punkt Raumhöhe): Linie 2,72 m und daneben 2,50 m */
  const dims = new T.Group(); dims.position.set(7.95, 0, -4.2); scene.add(dims);
  {
    const l1 = lineMat(GELB, 1), l2 = lineMat(0xffffff, .8);
    const v = (x, h, m) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([x, 0, 0, x, h, 0, x - .25, 0, 0, x + .25, 0, 0, x - .25, h, 0, x + .25, h, 0], 3)); const l = new T.LineSegments(g, m); l.renderOrder = 4; dims.add(l); };
    v(.15, 2.72, l1); v(.75, 2.5, l2);
    dims.userData.mats = [l1, l2];
  }
  [W3, key, van, wall, dims].forEach(g => g.traverse(envAll));

  /* ---------- Marken (HTML über dem Bild) ---------- */
  const anchors = {
    'lay-plan': () => [PLOT.x0 + 2.4, yL, PLOT.z1 - 2.5], 'lay-fund': () => [-7.2, X.fo + .02, 6.2], 'lay-huelle': () => [-1.3, X.so + OGY + 2.2, 7.4],
    'lay-innen': () => [5.8, X.io + .6, -4.6], 'lay-aussen': () => [5.2, GROUND_Y + .1, -12.9], 'lay-key': () => [key.position.x, key.position.y, key.position.z],
    flaeche: () => [-4, yL, -4], dimx: () => [0, yL, PLOT.z1 + 1.6], dimz: () => [PLOT.x1 + 1.6, yL, 0], bau: () => [-9, yL, -6], boden: () => [-8.6, 1.4 * X.core, 12.2],
    z0: () => [3.2, yL, 2], z1: () => [5.5, yL, 12.9], z2: () => [5.2, yL, -13],
    arch: () => [-7.7, 1.6, -6.84], einreich: () => [7.7, 1.6, -6.84], werk: () => [7.7, 1.6, 6.84], statik: () => [-7.7, 1.6, 6.84],
    slab: () => [3, .02, 6.84], daemm: () => [2.7, 9.4 + X.roofUp, -2], moist: () => [9.2 + .2, 2.4, 2.7], ueblich: () => [8.7, 2.5, -4.2],
    terrasse: () => [2.7, .1, -7.9], carport: () => [-4.2, GROUND_Y + .1, 12.6], pool: () => [5.2, GROUND_Y + .1, -12.9], sauna: () => [-9.5, 2.6, -14], garten: () => [10.4, 4.2, 1.5],
    key: () => [key.position.x, key.position.y, key.position.z], van: () => [van.position.x, 2.5, van.position.z]
  };
  Object.keys(HOT).forEach(k => { anchors[k] = () => HOT[k].at; });
  const X = { fo: 0, io: 0, so: 0, core: 0, roofUp: 0 };
  const labels = (opt.labels || []).map(L => {
    const hot = L.kind === 'hot', lay = L.kind === 'layer';
    const el = document.createElement(hot || lay ? 'button' : 'span');
    el.dataset.id = L.id;
    el.className = 'svf-m' + (hot ? ' svf-m--hot' : lay ? ' svf-m--lay' : ' svf-m--tag');
    if (hot || lay) { el.type = 'button'; el.setAttribute('aria-label', L.t + (L.s ? ', ' + L.s : '')); }
    else el.setAttribute('aria-hidden', 'true');
    el.innerHTML = (hot ? '<span class="svf-m__dot" aria-hidden="true"><i></i></span>' : '<span class="svf-m__box" aria-hidden="true"></span>') +
      `<span class="svf-m__t"><b>${L.t}</b>${L.s ? `<em>${L.s}</em>` : ''}</span>`;
    if (hot) el.addEventListener('click', e => { e.stopPropagation(); opt.onHot && opt.onHot(L.id); });
    if (lay) el.addEventListener('click', e => { e.stopPropagation(); opt.onJump && opt.onJump(L.jump); });
    l3.appendChild(el);
    return { ...L, el, hot, lay, a: anchors[L.id] || (() => [0, 0, 0]), op: -1 };
  });

  /* ---------- Zustand je P ---------- */
  let P = opt.P || 0, focus = null, fk = 0, fkFrom = 0, fkT0 = 0, fkTo = 0, lastFocus = null, Wd = 1, Hd = 1, dirty = true, alive = true, raf = 0;
  const viewAt = p => {
    let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    const [p0, a] = KEYS[i], [p1, b] = KEYS[i + 1], t = sm((p - p0) / (p1 - p0));
    return { t: a.t.map((v, k) => lerp(v, b.t[k], t)), az: lerp(a.az, b.az, t), el: lerp(a.el, b.el, t), d: lerp(a.d, b.d, t) };
  };
  const mixV = (a, b, t) => ({ t: a.t.map((v, k) => lerp(v, b.t[k], t)), az: lerp(a.az, b.az, t), el: lerp(a.el, b.el, t), d: lerp(a.d, b.d, t) });

  function state(p) {
    /* Haus: ganz (0 bis 4), weg im Projektcheck, Plan (Hausplanung), Sockel (Fundament), baut sich (Exterior), offen (Interior), ganz */
    const gone = S_(p, 3.98, 4.22) * (1 - S_(p, 5.5, 5.62));
    const plan = S_(p, 5.5, 5.66) * (1 - S_(p, 5.98, 6.12));
    const sockel = S_(p, 5.98, 6.12);
    const build = S_(p, 6.72, 7.12), og = S_(p, 6.95, 7.12), roof = S_(p, 7.04, 7.2);
    const open = S_(p, 8.0, 8.16) * (1 - S_(p, 8.96, 9.1));
    let eg, ogs, ext, slab, rf;
    if (p < 5.5) { eg = 1 - gone; ogs = 1 - gone; ext = 1; slab = 1 - gone; rf = 1 - S_(p, 3.98, 4.12); }
    else if (p < 6.02) { eg = plan; ogs = 0; ext = 0; slab = 0; rf = 0; }
    else if (p < 6.72) { eg = Math.max(.1 * sockel, 1 - S_(p, 6.0, 6.2) * .9); ogs = 0; ext = 0; slab = 0; rf = 0; }
    else { eg = lerp(.1, 1, build); ogs = og; ext = build; slab = og; rf = roof; }
    if (p >= 7.98) { ogs *= 1 - open; slab *= 1 - open; rf *= 1 - open; ext = lerp(ext, .62, open); }
    const fo = focus;
    if (fo === 'bad') { const k = fk; ogs = lerp(ogs, 1, k); slab = lerp(slab, 1, k); ext = lerp(ext, .62, k); }
    S.eg = clamp(eg); S.og = clamp(ogs); S.ext = clamp(ext); S.slab = clamp(slab); S.roof = clamp(rf); S.lift = 1;
    /* Explosion im Überblick */
    const ex = S_(p, 3.08, 3.4) * (1 - S_(p, 3.92, 4.06));
    X.fo = 1.4 * ex; X.io = 3.6 * ex; X.so = 7.2 * ex;
    X.roofUp = fo === 'dach' ? 1.4 * fk : 0;
    return { ex };
  }

  function placeAll(p) {
    const st = state(p);
    HW.apply();
    offEG(X.fo, X.io, X.so);
    OG.g.position.y += X.so;
    HW.roofs.forEach(r => { if (r.g.visible) r.g.position.y += X.roofUp; });
    /* Grundstück: wächst im Kapitel Projekt vom Sockel aufs ganze Grundstück */
    const pk = S_(p, 2.05, 2.55);
    lawn.visible = true; setPlot(pk);
    border.material.opacity = .7 * S_(p, 2.3, 2.6);
    /* Garten: im Projekt und im Überblick da, ab dem Projektcheck weg, ab Rund ums Haus Teil für Teil zurück */
    const back = { zufahrt: 9.17, carport: 9.17, pool: 9.29, sauna: 9.41, garten: 9.55 };
    Object.entries(parts).forEach(([k, o]) => {
      const on = Math.max(S_(p, 2.25, 2.6) * (1 - S_(p, 3.98, 4.16)), S_(p, back[k] - .06, back[k] + .06));
      const kk = k === 'zufahrt' ? Math.max(on, S_(p, 6.6, 7.0)) : on;
      if (Math.abs(kk - o.k) < 1e-4) return; o.k = kk;
      o.g.visible = kk > .002; o.g.scale.set(1, Math.max(.001, kk), 1);
    });
    /* Bäume wachsen mit den Jahren (Kundendienst) */
    const yr = S_(p, 10.55, 10.95);
    parts.garten.g.children.forEach(t => { if (t.userData.tree) t.scale.setScalar((t.userData.s0 || (t.userData.s0 = t.scale.x)) * (.82 + .18 * Math.max(yr, p < 10.5 ? 1 : 0))); });
    /* Projektcheck: Maße, Baufenster, Bohrkern */
    dimX.material.opacity = S_(p, 4.42, 4.55) * (1 - S_(p, 5.0, 5.1));
    dimZ.material.opacity = S_(p, 4.47, 4.6) * (1 - S_(p, 5.0, 5.1));
    dimX.visible = dimX.material.opacity > .002; dimZ.visible = dimZ.material.opacity > .002;
    bau.material.opacity = S_(p, 4.57, 4.7) * (1 - S_(p, 5.02, 5.12)); bau.visible = bau.material.opacity > .002;
    X.core = S_(p, 4.66, 4.82) * (1 - S_(p, 5.02, 5.14));
    core.visible = X.core > .002; core.position.y = lerp(-.2, core.userData.h + .4, X.core) - .2;
    /* Projektplan: Zonen */
    Z0.opacity = .82 * S_(p, 5.08, 5.16) * (1 - S_(p, 5.5, 5.58));
    Z1.opacity = .8 * S_(p, 5.2, 5.28) * (1 - S_(p, 5.5, 5.58));
    Z2.opacity = .8 * S_(p, 5.32, 5.4) * (1 - S_(p, 5.5, 5.58));
    /* Schlüssel: im Überblick oben über dem Haus, beim Projektmanager vor der Haustür */
    const kOver = S_(p, 3.4, 3.6) * (1 - S_(p, 3.92, 4.04)), kDoor = S_(p, 10.08, 10.3) * (1 - S_(p, 10.46, 10.6));
    key.visible = kOver > .002 || kDoor > .002;
    if (kOver > .002) { key.position.set(2.7, 9.6 + X.so + .4 + 1.6 * kOver, 0); key.rotation.set(0, p * 3, 0); key.scale.setScalar(2.2 * kOver); }
    else { key.position.set(1.0, 1.3 + .25 * Math.sin(p * 12), 7.6); key.rotation.set(0, -.5 + (p - 10.1) * 2.4, .2); key.scale.setScalar(kDoor); }
    /* Kundendienst: der Wagen fährt die Zufahrt herauf und bleibt stehen */
    const vk = S_(p, 10.52, 10.78) * (1 - S_(p, 10.98, 11.08));
    van.visible = vk > .002; van.position.set(-4.25, GROUND_Y, lerp(24, 11.6, sm(vk)));
    /* Wand im Schnitt (Fokus Wand) */
    const wk = focus === 'wand' ? fk : 0;
    wall.visible = wk > .002;
    if (wall.visible) {
      wall.position.x = 7.72 + 1.6 * wk;
      let x = 0; wallL.forEach((L, i) => { L.m.position.set(x + L.d / 2 - .02, 0, 0); L.m.scale.x = Math.max(.01, L.d); x += L.d + .16 * wk; });
    }
    const dk = focus === 'hoehe' ? fk : 0;
    dims.visible = dk > .002; dims.userData.mats.forEach(m => { m.opacity = dk; });
    /* Fenster leuchten am Ende warm (Haltung) */
    const glow = S_(p, 11.2, 11.7);
    M.glass.emissive.setHex(0xffd9a0); M.glass.emissiveIntensity = .55 * glow;
    return st;
  }

  /* ---------- Kamera und Marken ---------- */
  const tv = new T.Vector3();
  function camera(p) {
    let v = viewAt(p);
    if (fk > 0 && (focus || lastFocus)) v = mixV(v, HOT[focus || lastFocus].v, sm(fk));
    /* Telefon und Hochformat: das Modell kleiner, damit oben Platz bleibt und der Text unten frei steht */
    const asp = Wd / Hd, dk = asp < .8 ? 1.42 : asp < 1.2 ? 1.14 : 1, d = v.d * dk;
    const cp = Math.cos(v.el);
    cam.position.set(v.t[0] + d * Math.sin(v.az) * cp, v.t[1] + d * Math.sin(v.el), v.t[2] + d * Math.cos(v.az) * cp);
    cam.lookAt(tv.set(...v.t));
    /* Bildmitte: am Desktop rechts oben (Text unten links), am Telefon oben */
    const sx = small() ? .5 : .63, sy = asp < .8 ? .3 : small() ? .36 : .44;
    cam.setViewOffset(Wd, Hd, -(sx - .5) * Wd, -(sy - .5) * Hd, Wd, Hd);
    cam.updateMatrixWorld();
  }
  function marks(p) {
    const ph = small();
    labels.forEach(L => {
      let o;
      if (L.fo) o = focus === L.fo ? sm(fk) : 0;
      else {
        o = win(p, L.from, L.to, .05);
        if (L.hot && focus) o *= 1 - sm(fk);
        if (L.hot && !focus && fk > 0 && lastFocus) o *= 1 - sm(fk);
      }
      if (o < .01) { if (L.op !== 0) { L.el.style.opacity = '0'; L.el.style.visibility = 'hidden'; L.op = 0; } return; }
      tv.set(...L.a()).project(cam);
      const x = (tv.x + 1) / 2 * Wd, y = (1 - tv.y) / 2 * Hd, off = tv.z > 1 || x < -40 || x > Wd + 40 || y < -40 || y > Hd + 40;
      if (off) { L.el.style.visibility = 'hidden'; L.op = -1; return; }
      L.el.style.visibility = 'visible';
      L.el.style.opacity = o.toFixed(3); L.op = o;
      L.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      L.el.style.pointerEvents = o > .5 ? 'auto' : 'none';
      L.el.classList.toggle('is-left', x > Wd * (ph ? .62 : .78));
    });
  }

  function size() {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    if (w === Wd && h === Hd) return;
    Wd = w; Hd = h;
    R.setPixelRatio(Math.min(devicePixelRatio || 1, small() ? 1.5 : 2));
    R.setSize(Wd, Hd, false);
    cam.aspect = Wd / Hd; cam.fov = Wd / Hd < .8 ? 42 : 30; cam.updateProjectionMatrix();
    dirty = true;
  }
  function draw() {
    size();
    placeAll(P); camera(P); marks(P);
    R.render(scene, cam);
  }
  function tick(now) {
    raf = 0; if (!alive) return;
    if (fkT0) {
      const k = reduce ? 1 : clamp((now - fkT0) / 900);
      fk = lerp(fkFrom, fkTo, k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      if (k >= 1) { fkT0 = 0; if (!focus) lastFocus = null; }
      dirty = true;
    }
    if (dirty) { dirty = false; draw(); }
    if (fkT0) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf && alive) raf = requestAnimationFrame(tick); };
  const ro = new ResizeObserver(() => { dirty = true; kick(); }); ro.observe(stage);
  draw();

  return {
    R, scene, cam, HW,
    setP(p) { if (Math.abs(p - P) < 1e-5) return; P = p; dirty = true; kick(); },
    renderAt(p) { P = p; draw(); },
    setFocus(id) {
      if (id === focus) return;
      if (id) { lastFocus = id; focus = id; fkFrom = fk; fkTo = 1; }
      else { focus = null; fkFrom = fk; fkTo = 0; }
      fkT0 = performance.now(); dirty = true; kick();
    },
    isExt: id => EXT.includes(id),
    destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); l3.innerHTML = ''; try { R.dispose(); } catch (e) { /* egal */ } }
  };
}
