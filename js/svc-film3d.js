/* Runde 49: Services Übersicht im Design v2 (Kunde). Der Film über das ganze Projekt, gezeichnet mit three.js.
   Runde 51 (Kundenwunsch): wieder das Grundstück und der ganze Garten aus Runde 48 (data/grundstueck.js, nach dem Gartenplan, Straße im
   Norden), mit Carport und Eingangsüberdachung, Holzterrassen, Überdachung und Lounge, Pool mit Deck, Sauna im Garten, Essplatz mit
   gelbem Segel, Beeten, Glashaus, Hütte, Bäumen, Hecken und der Mauer. Das Haus ist das Haus aus dem Gartenplan, jetzt mit Satteldach
   (data/grundriss-garten.js, gezeichnet mit js/grundriss.js wie die Concepts: Wände, Fenster, Möbel, Treppe, Decke, Dach).
   Der Garten lebt: Wind in den Bäumen, das Segel flattert, Wellen im Pool, ein Hund dreht seine Runde. Das läuft nur, solange der Garten
   zu sehen ist, der Film im Bild steht und niemand weniger Bewegung eingestellt hat.
   Eingang: P von 0 bis 12 (Kapitel des Entwurfs, js/svc-film.js). Daraus: Bauzustand des Hauses, Explosion in Schichten, Kamera, Marken.
   Welt in m: x nach Osten, z nach Süden (Garten), y nach oben, Mitte des Hauses bei 0 (Gartenplan minus 3,2 / plus 9,2). */
import * as T from 'three';
import { houseWorld } from './grundriss.js';
import { M, UBOX, BUILD, car } from './grundriss-moebel.js';
import { MAT, WALL, prism } from './svc-geo.js';
import * as G from '../data/grundstueck.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = t => (t = clamp(t), t * t * (3 - 2 * t));
const S_ = (p, a, b) => sm((p - a) / (b - a));
/* an zwischen a und b, mit weichen Rändern r */
const win = (p, a, b, r = .06) => Math.min(S_(p, a - r, a + r * .5), 1 - S_(p, b - r * .5, b + r));
/* Winkel auf dem kürzeren Weg */
const lerpA = (a, b, t) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GELB = 0xFFB200;

/* ---------- Grundstück und Garten (m), aus dem Gartenplan verschoben, damit die Mitte des Hauses bei 0 liegt ---------- */
const OX = 3.2, OZ = -9.2;
const wx = x => +(x - OX).toFixed(3), wz = z => +(z - OZ).toFixed(3);
const WP = ([x, z]) => [wx(x), wz(z)];
const WR = r => ({ ...r, x0: wx(r.x0), x1: wx(r.x1), z0: wz(r.z0), z1: wz(r.z1) });
const POLY = G.PLOT.map(WP);
/* Startform beim Wachsen: das Rechteck um Haus und Anbauten, jede Ecke der Grenze hat ihren Punkt darauf */
const POLY0 = [[-8.9, -7.3], [6.4, -7.3], [6.4, -6.6], [6.4, 6.3], [-.8, 6.3], [-8.9, 6.3], [-8.9, 2.6]];
const GROUND_Y = -.3, LG = GROUND_Y;
const CX = POLY.reduce((s, p) => s + p[0], 0) / POLY.length, CZ = POLY.reduce((s, p) => s + p[1], 0) / POLY.length;
const streetZ = x => lerp(POLY[0][1], POLY[1][1], (x - POLY[0][0]) / (POLY[1][0] - POLY[0][0]));
const HAUS = WR(G.HAUS), ANB = G.ANBAU.map(WR), CP = { ...WR(G.CARPORT), dach: WR(G.CARPORT.dach) };
const SAUNA = WR(G.SAUNA), DECKS = G.DECKS.map(WR), UEB = WR(G.UEBERDACHUNG), PDECK = WR(G.POOLDECK), POOL = WR(G.POOL);
const ESS = WR(G.ESSPLATZ), KRAEUTER = G.KRAEUTER.map(WR), HOCHBEETE = G.HOCHBEETE.map(WR), GLASHAUS = WR(G.GLASHAUS), HUETTE = WR(G.HUETTE);
const DUSCHE = WP(G.DUSCHE);
const BAEUME = G.BAEUME.map(([x, z, r, k]) => [wx(x), wz(z), r, k]);
const BUESCHE = G.BUESCHE.map(WP), BEEREN = G.BEEREN.map(WP), HECKEN = G.HECKEN.map(s => s.map(WP)), MAUER = G.MAUER.map(WP);
const TECH = ANB.find(a => a.k === 'technik'), EING = ANB.find(a => a.k === 'eingang'), ESSA = ANB.find(a => a.k === 'essen');
/* Runde des Hundes über den Rasen im Süden (zwischen Beeten, Glashaus, Hütte, Büschen und Bäumen durch) */
const DOG = [[-.4, 7.0], [.4, 11.8], [2.4, 16.4], [4.4, 16.8], [6.8, 14.4], [8.4, 10.9], [7.6, 8.6], [6.0, 6.4], [3.0, 6.2], [.8, 6.3]].map(WP);

/* Kamera: Ziel t, Azimut az (0 = von Süden, aus dem Garten), Höhe el, Abstand d */
const V = (t, az, el, d) => ({ t, az, el, d });
const KEYS = [
  [0, V([0, 3.4, 0], .62, .12, 40)],
  [1, V([0, 3.4, 0], .3, .18, 44)],
  [2.05, V([0, 2.6, 0], .16, .26, 50)],
  [2.7, V([-4, 0, 11], -.5, .62, 84)],
  [3.15, V([-2, 5.6, 8], .5, .36, 104)],
  [3.95, V([-2, 5.8, 8], .58, .35, 106)],
  [4.25, V([-4, 0, 10.5], -.08, 1.05, 128)],
  [5.05, V([-4, 0, 10.5], 0, 1.12, 128)],
  [5.5, V([-4, 0, 10.5], .05, 1.18, 124)],
  [5.68, V([-1.3, 0, -1.6], 0, 1.26, 52)],
  [6.02, V([-1.3, 0, -1.6], 0, 1.26, 52)],
  [6.3, V([-1.3, -.2, 0], .6, .5, 42)],
  [6.92, V([-1.3, -.2, 0], .5, .44, 42)],
  [7.12, V([0, 3.4, .5], .62, .22, 40)],
  [7.98, V([0, 3.4, .5], .72, .22, 40)],
  [8.18, V([-.8, .4, -.6], .3, .92, 44)],
  [8.98, V([-.8, .4, -.6], .24, .92, 44)],
  /* Rund ums Haus: von der Straße (Carport, Eingang) über die Sauna im Osten in den Garten (Terrasse, Pool, Garten) */
  [9.22, V([-8.5, 0, -2.4], -2.4, .56, 46)],
  [9.6, V([4.5, 0, -1.5], 2.3, .58, 50)],
  [9.98, V([-4, 0, 11], -.5, .6, 84)],
  [10.2, V([-9.6, 1.6, -.9], -1.02, .16, 20)],
  [10.48, V([-9.6, 1.6, -.9], -.94, .16, 19)],
  [10.62, V([-11.5, 1.4, -7.4], -2.62, .3, 34)],
  [10.98, V([-11.5, 1.4, -7.4], -2.52, .3, 35)],
  [11.2, V([-.5, 3.2, 6], .66, .2, 60)],
  [12, V([-.5, 2.8, 8], .86, .24, 70)]
];
/* Punkte im Haus: Anker und Blick */
const HOT = {
  dach: { at: [1.6, 7.9, 2.0], v: V([1.4, 7.6, 1.4], .7, .42, 24) },
  wand: { at: [6.15, 1.5, -.5], v: V([6.6, 1.5, -.5], 1.05, .14, 13.6) },
  fenster: { at: [.1, 4.75, 4.06], v: V([.1, 4.6, 4.2], .3, .08, 16.8) },
  fassade: { at: [6.14, 4.6, -1.6], v: V([6.1, 4.4, -1.4], 1.22, .08, 20.8) },
  hoehe: { at: [5.6, 1.4, 1.8], v: V([5.6, 1.45, 1.6], 1.42, .06, 15.2) },
  open: { at: [-.7, .6, 1.2], v: V([-.6, .4, .8], -.36, .62, 24) },
  parkett: { at: [1.6, .05, 2.4], v: V([1.6, .1, 2.2], -.5, .82, 12) },
  /* Fliesen im Eingang, Türen an der Tür ins Büro. Für beide (und Open Space, Parkett) sinken die Wände beim Fokus auf 1 m (LOW) */
  fliesen: { at: [-7.1, .05, -1.0], v: V([-7.0, .2, -1.0], -.9, .9, 10.5) },
  bad: { at: [3.8, 3.4, -2.6], v: V([3.8, 3.3, -2.5], -.2, 1.12, 14.5) },
  tuer: { at: [5.0, 1.75, -1.06], v: V([4.8, 1.0, -.5], .42, .5, 10.5) }
};
const EXT = ['dach', 'wand', 'fenster', 'fassade', 'hoehe'];
const LOW = ['open', 'parkett', 'fliesen', 'tuer'];

export async function createFilm(stage, opt = {}) {
  const canvas = stage.querySelector('canvas');
  const l3 = stage.querySelector('[data-l3]');
  const small = () => innerWidth < 900;
  const R = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  R.setClearColor(0x000000, 0);
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .98;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  const cam = new T.PerspectiveCamera(30, 1, .3, 700);

  /* ---------- Haus ---------- */
  const HW = await houseWorld('garten', R);
  const scene = HW.scene; scene.background = null;
  const S = HW.S, HT = HW.HT, EGH = HT.eg, OGY = HT.eg + HT.slab, CUT0 = HT.cut;
  const hemi = new T.HemisphereLight(0xffffff, 0xcfc8bd, .42);
  const sun = new T.DirectionalLight(0xfff1e0, 2.25);
  sun.position.set(-22, 32, 30); sun.target.position.set(-4, 0, 11); sun.castShadow = true;
  const smap = small() ? 1024 : 2048; sun.shadow.mapSize.set(smap, smap);
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -29, right: 29, top: 29, bottom: -29, near: 1, far: 150 });
  scene.add(hemi, sun, sun.target);
  const envAll = o => (o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []).forEach(m => { if (m.isMeshStandardMaterial && m.envMapIntensity === 1) m.envMapIntensity = .75; });

  /* Teile des Erdgeschoßes für die Explosion: Fundament (Sockel), Innen (Boden, Möbel, Treppe), Hülle (alles andere) */
  const EG = HW.FL[0], OG = HW.FL[1];
  const inner = new Set([EG.plane, ...EG.furn.map(o => o.m), ...EG.steps.map(s => s.m)]);
  const fund = new Set([...EG.base, ...EG.rim]);
  const egRoofs = HW.roofs.filter(r => r.g.parent === EG.g).map(r => r.g);
  const ogRoofs = HW.roofs.filter(r => r.g.parent === OG.g);
  const managed = new Set([...EG.base, ...EG.steps.filter(s => s.th).map(s => s.m), ...egRoofs]);
  /* Runde 51: die Bodenplatte grau wie Beton (im Fundament steht sie allein, ohne Plan darauf) */
  const slabMat = new T.MeshStandardMaterial({ color: 0x6d6a65, roughness: .92 });
  EG.base.forEach(m => { m.material = slabMat; });
  HW.apply();
  EG.g.children.forEach(c => { c.userData.y0 = c.position.y; });
  const offEG = (fo, io, so) => EG.g.children.forEach(c => {
    const off = fund.has(c) ? fo : inner.has(c) ? io : so;
    if (managed.has(c)) c.position.y += off; else c.position.y = c.userData.y0 + off;
  });

  /* ---------- Materialien des Gartens ---------- */
  const W3 = new T.Group(); scene.add(W3);
  const std = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: .95, metalness: 0, ...o });
  const mc = new Map(), mat = n => { if (!mc.has(n)) mc.set(n, MAT[n]()); return mc.get(n); };
  const MG = {
    lawn: std(0x4b4f45), plinth: std(0x2a2a29), street: std(0x343432, { roughness: .9 }), drive: std(0x7a7770), concrete: std(0x9c988f),
    timber: std(0x9a7a56, { roughness: .8 }), frame: std(0x262625, { roughness: .6 }), dark: std(0x2e2e2c, { roughness: .7 }),
    white: std(0xf2f0eb, { roughness: .6 }), stone: std(0x8d8981, { flatShading: true }), hedge: std(0x46553a, { roughness: 1 }),
    leafG: std(0x8c9a55, { flatShading: true }), leafD: std(0x55673f, { flatShading: true }), trunk: std(0x5b4a3a),
    soil: std(0x4a3a2c, { roughness: 1 }), herb: std(0x6f8a4a, { flatShading: true }), berry: std(0x4f6239, { flatShading: true }),
    tile: std(0xd8e6e9, { roughness: .35 }), grill: std(0x1e1e1d, { roughness: .45, metalness: .3 }), gravel: std(0x77736c),
    water: new T.MeshStandardMaterial({ color: 0x5f9fae, roughness: .04, metalness: .1, transparent: true, opacity: .86, depthWrite: false }),
    sail: std(GELB, { side: T.DoubleSide, roughness: .85 }),
    gelb: new T.MeshStandardMaterial({ color: GELB, roughness: .7, emissive: GELB, emissiveIntensity: .12 }),
    fur: std(0xc8965c, { roughness: .9 }), nose: std(0x2b2623, { roughness: .6 }),
    soilL: [std(0x5a4a3a), std(0x7a6a52), std(0x9c8b6c), std(0x6b6258), std(0x8a8378)]
  };
  MG.slats = mat('slats'); MG.larch = mat('larch'); MG.glass = M.glass;
  /* Kacheln am Boden des Pools mit Lichtnetz (wandert mit den Wellen) */
  const caus = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#d8e6e9'; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
      x.beginPath(); let px = (i * 97) % 256, py = (i * 53) % 256; x.moveTo(px, py);
      for (let k = 0; k < 5; k++) { px += 30 * Math.sin(i + k * 1.7); py += 30 * Math.cos(i * 1.3 + k); x.lineTo(px, py); }
      x.stroke();
    }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 1.4); t.colorSpace = T.SRGBColorSpace; return t;
  })();
  MG.poolFloor = std(0xffffff, { roughness: .4, map: caus });

  const box = (g, x0, y0, z0, x1, y1, z1, m, cast = true) => { const o = new T.Mesh(UBOX, m); o.scale.set(x1 - x0, y1 - y0, z1 - z0); o.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2); o.castShadow = cast; o.receiveShadow = true; g.add(o); return o; };
  const mesh = (g, geo, m, cast = true) => { const o = new T.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = true; g.add(o); return o; };
  const put = (obj, g, x, y, z, ry = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); g.add(obj); return obj; };
  /* viele gleiche Teile (Steine, Kräuter, Büsche): eine InstancedMesh je Art */
  const inst = (g, geo, m, items, cast = true) => {
    const im = new T.InstancedMesh(geo, m, items.length), o = new T.Object3D();
    items.forEach(([x, y, z, sx, sy, sz, ry = 0, rx = 0], i) => { o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, ry, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.castShadow = cast; im.receiveShadow = true; g.add(im); return im;
  };

  /* ---------- Rasenplatte: wächst vom Sockel des Hauses (Rechteck) auf das ganze Grundstück, am Ende mit dem Loch für den Pool ---------- */
  const lawn = new T.Mesh(new T.BufferGeometry(), [MG.lawn, MG.plinth]); lawn.receiveShadow = true; W3.add(lawn);
  const hole = [[POOL.x0, POOL.z0], [POOL.x1, POOL.z0], [POOL.x1, POOL.z1], [POOL.x0, POOL.z1]];
  let lawnK = -1;
  const setPlot = k => {
    if (Math.abs(k - lawnK) < 1e-4) return; lawnK = k;
    const sh = new T.Shape(POLY.map(([x, z], i) => new T.Vector2(lerp(POLY0[i][0], x, k), -lerp(POLY0[i][1], z, k))));
    if (k > .999) sh.holes.push(new T.Path(hole.map(([x, z]) => new T.Vector2(x, -z))));
    const g = new T.ExtrudeGeometry(sh, { depth: .45, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, GROUND_Y - .45, 0);
    lawn.geometry.dispose(); lawn.geometry = g;
  };
  /* Straße vor dem Grundstück (Norden) */
  const street = (() => {
    const [a, b] = [POLY[0], POLY[1]], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    const o = new T.Mesh(UBOX, MG.street); o.scale.set(len + 22, .4, 6.2); o.rotation.y = -Math.atan2(dz, dx);
    o.position.set((a[0] + b[0]) / 2 - 3, GROUND_Y - .44, (a[1] + b[1]) / 2 - 3.25); o.receiveShadow = true; W3.add(o); return o;
  })();

  /* ---------- Garten: jedes Teil eine Gruppe, die vom Rasen nach oben wächst ---------- */
  const parts = {};
  const part = (key) => { const g = new T.Group(), inn = new T.Group(); g.position.y = GROUND_Y; inn.position.y = -GROUND_Y; g.add(inn); W3.add(g); parts[key] = { g, k: -1 }; return inn; };
  const blob = new T.IcosahedronGeometry(1, 0), crownG = new T.IcosahedronGeometry(1, 1), stemG = new T.CylinderGeometry(.09, .13, 1, 8).translate(0, .5, 0);
  /* Fenster: Rahmen und Glas in einer Öffnung (ax 'x' = Scheibe entlang x bei z = w) */
  function pane(g, ax, a, b, c, d, w) {
    const f = .06, t = .07;
    const bx = ax === 'x' ? (u0, v0, u1, v1, w0, w1) => box(g, u0, v0, w0, u1, v1, w1, MG.frame, false) : (u0, v0, u1, v1, w0, w1) => box(g, w0, v0, u0, w1, v1, u1, MG.frame, false);
    [[a, c, b, c + f], [a, d - f, b, d], [a, c, a + f, d], [b - f, c, b, d]].forEach(([u0, v0, u1, v1]) => bx(u0, v0, u1, v1, w - t, w + t));
    if (ax === 'x') box(g, a + f, c + f, w - .006, b - f, d - f, w + .006, MG.glass, false); else box(g, w - .006, c + f, a + f, w + .006, d - f, b - f, MG.glass, false);
  }
  {
    /* Zufahrt von der Straße unter den Carport, Weg zur Haustür */
    const g = part('zufahrt');
    box(g, CP.x0, LG - .02, streetZ(CP.x0) - .05, CP.x1, LG + .08, CP.z1, MG.drive, false);
    box(g, CP.dach.x0, LG - .02, CP.z1, CP.dach.x1, LG + .08, CP.dach.z1, MG.drive, false);
    box(g, CP.x1 - .6, LG, wz(-11.1), CP.x1, -.2, wz(-9.6), MG.concrete, false);
  }
  const carG = (() => {
    /* Carport mit Eingangsüberdachung: Stützen, Lärchenwand im Westen, flaches Dach; darunter das Auto */
    const g = part('carport'), C = CP, D = CP.dach;
    [[C.x0 + .1, C.z0 + .1], [C.x0 + .1, C.z1 - .1], [D.x0 + .1, D.z1 - .1], [D.x0 + .1, C.z1 - .1], [C.x1 - .1, C.z0 + .1]].forEach(([x, z]) => box(g, x - .07, LG, z - .07, x + .07, 2.62, z + .07, MG.frame));
    for (let z = C.z0 + .3; z < C.z1 - .2; z += .14) box(g, C.x0 + .04, LG + .1, z, C.x0 + .1, 2.55, z + .045, MG.larch, false);
    mesh(g, prism('y', [[C.x0 - .1, C.z0 - .1], [C.x1, C.z0 - .1], [C.x1, D.z1 + .1], [D.x0 - .1, D.z1 + .1], [D.x0 - .1, C.z1 + .1], [C.x0 - .1, C.z1 + .1]], 2.62, 2.95), MG.frame);
    return put(car(4.7, 1.86, 0x2c3034), g, wx(-9.0), LG + .08, wz(-13.3), 0);
  })();
  {
    /* Holzterrassen auf Hausniveau, Stufe in den Garten, Überdachung, Lounge */
    const g = part('terrasse');
    DECKS.forEach(d => box(g, d.x0, LG, d.z0, d.x1, 0, d.z1, MG.timber));
    box(g, wx(-2.9), LG, wz(-3.2), wx(1.2), -.16, wz(-2.75), MG.timber);
    [[UEB.x0 + .12, UEB.z1 - .12], [UEB.x1 - .12, UEB.z1 - .12]].forEach(([x, z]) => box(g, x - .07, 0, z - .07, x + .07, 2.9, z + .07, MG.frame));
    box(g, UEB.x0, 2.9, UEB.z0, UEB.x1, 3.18, UEB.z1, MG.frame);
    put(BUILD.osofa(2.6, .95, {}), g, wx(12.25), 0, wz(-3.4), -Math.PI / 2);
    put(BUILD.otable(.8, .8, { round: 1 }), g, wx(11.05), 0, wz(-3.4));
    put(BUILD.osofa(2.4, .95, {}), g, wx(7.25), 0, wz(-4.55), 0);
    put(BUILD.otable(1.2, .6, {}), g, wx(7.25), 0, wz(-3.5));
  }
  /* Wasser mit Wellen: feines Gitter, die Höhen ändern sich mit der Zeit */
  const water = new T.Mesh(new T.PlaneGeometry(POOL.x1 - POOL.x0 - .06, POOL.z1 - POOL.z0 - .06, 36, 16).rotateX(-Math.PI / 2), MG.water);
  const waterPos = water.geometry.attributes.position, waterXZ = Float32Array.from({ length: waterPos.count * 2 }, (_, i) => waterPos.array[(i >> 1) * 3 + (i & 1 ? 2 : 0)]);
  const poolCover = box(W3, POOL.x0 - .01, LG - .3, POOL.z0 - .01, POOL.x1 + .01, LG, POOL.z1 + .01, MG.lawn, false);
  {
    /* Pool 7 × 3 m: Becken in hellen Fliesen, Deck rundum, zwei Liegen, Außendusche */
    const g = part('pool'), P = POOL, t = .03, yb = LG - 1.5, yt = LG - .02;
    box(g, P.x0, yb - .1, P.z0, P.x1, yb, P.z1, MG.poolFloor, false);
    box(g, P.x0, yb, P.z0, P.x0 + t, yt, P.z1, MG.tile, false); box(g, P.x1 - t, yb, P.z0, P.x1, yt, P.z1, MG.tile, false);
    box(g, P.x0, yb, P.z0, P.x1, yt, P.z0 + t, MG.tile, false); box(g, P.x0, yb, P.z1 - t, P.x1, yt, P.z1, MG.tile, false);
    water.position.set((P.x0 + P.x1) / 2, LG - .12, (P.z0 + P.z1) / 2); water.renderOrder = 2; g.add(water);
    const D = PDECK;
    mesh(g, prism('y', [[D.x0, D.z0], [D.x1, D.z0], [D.x1, D.z1], [D.x0, D.z1]], LG, LG + .05, [hole]), MG.timber, false);
    [wx(11.95), wx(12.6)].forEach(x => put(BUILD.chair(.6, 1.9, { lounge: 1, out: 1 }), g, x, LG + .05, wz(1.6), 0));
    const [x, z] = DUSCHE;
    box(g, x - .04, LG + .05, z - .04, x + .04, LG + 2.3, z + .04, MG.dark);
    box(g, x - .04, LG + 2.22, z - .04, x + .04, LG + 2.3, z + .42, MG.dark);
    box(g, x - .3, LG + .05, z - .3, x + .3, LG + .07, z + .3, MG.dark, false);
  }
  {
    /* Sauna im Garten, an der Terrasse: Holzsockel auf Hausniveau, Lärchenlatten, dunkles Dach, Glas zur Terrasse */
    const g = part('sauna'), Sa = SAUNA;
    box(g, Sa.x0 - .1, LG, Sa.z0 - .1, Sa.x1 + .1, 0, Sa.z1, MG.timber);
    box(g, Sa.x0, 0, Sa.z0, Sa.x1, 2.45, Sa.z1, MG.slats);
    box(g, Sa.x0 - .12, 2.45, Sa.z0 - .12, Sa.x1 + .12, 2.66, Sa.z1 + .12, MG.frame);
    pane(g, 'x', wx(10.1), wx(11.1), .05, 2.15, Sa.z1 + .01);
  }
  /* Bäume: je Baum eine Gruppe mit dem Drehpunkt am Stamm, damit der Wind sie biegen kann */
  const trees = [];
  const sail = { geo: null, rest: null, bary: null, n: 10, N: new T.Vector3() };
  let dog = null;
  {
    const g = part('garten');
    BAEUME.forEach(([x, z, r, k], i) => {
      const onDeck = DECKS[1] && x > DECKS[1].x0 && x < DECKS[1].x1 && z > DECKS[1].z0 && z < DECKS[1].z1, y0 = onDeck ? .5 : LG;
      if (onDeck) box(g, x - .45, 0, z - .45, x + .45, .5, z + .45, MG.dark);
      const t = new T.Group(); t.position.set(x, y0, z); g.add(t);
      const m = k === 'gelb' ? MG.leafG : MG.leafD, th = 1.2 + r * .55;
      const tr = mesh(t, stemG, MG.trunk); tr.scale.set(1 + r * .25, th + r * .4, 1 + r * .25);
      const c = mesh(t, crownG, m); c.position.set(0, th + r * .82, 0); c.scale.set(r, r * 1.02, r); c.rotation.y = x * 3.1;
      const c2 = mesh(t, crownG, m); c2.position.set(r * .35, th + r * 1.25, -r * .2); c2.scale.set(r * .62, r * .6, r * .62); c2.rotation.y = z;
      t.userData = { tree: 1, s0: 1, ph: i * 1.7, h: th + r, c, c2 };
      trees.push(t);
    });
    inst(g, blob, MG.leafD, BUESCHE.map(([x, z], i) => [x, LG + .45, z, .7, .55, .7, i]));
    inst(g, blob, MG.berry, BEEREN.map(([x, z], i) => [x, LG + .42, z, .45, .45, .45, i * 1.7]));
    /* Hecken an der Grenze */
    HECKEN.forEach(([a, b]) => {
      const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) - 1.2;
      const m = mesh(g, new T.BoxGeometry(len, 1.5, .75).translate(0, .75, 0), MG.hedge);
      m.position.set((a[0] + b[0]) / 2, LG, (a[1] + b[1]) / 2); m.rotation.y = -Math.atan2(dz, dx);
    });
    /* Mauer aus Steinen an der Kante zum Nachbarn */
    const st = [];
    for (let s = 0; s < MAUER.length - 1; s++) {
      const [a, b] = [MAUER[s], MAUER[s + 1]], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(len / .62);
      const nx = (b[1] - a[1]) / len, nz = -(b[0] - a[0]) / len;
      for (let i = 0; i <= n; i++) {
        const t = i / n, sc = .28 + ((i * 37 + s * 11) % 10) / 40;
        st.push([a[0] + (b[0] - a[0]) * t + nx * .25, LG - .05, a[1] + (b[1] - a[1]) * t + nz * .25, sc * 1.3, sc, sc * 1.1, i * 2.3, i]);
      }
    }
    inst(g, blob, MG.stone, st);
    /* Beete: Holzrahmen, Erde, Kräuter */
    const herbs = [];
    const bed = (b, h) => {
      box(g, b.x0, LG, b.z0, b.x1, LG + h, b.z1, MG.larch);
      box(g, b.x0 + .05, LG + h - .02, b.z0 + .05, b.x1 - .05, LG + h + .005, b.z1 - .05, MG.soil, false);
      for (let x = b.x0 + .2; x < b.x1 - .1; x += .32) for (let z = b.z0 + .2; z < b.z1 - .1; z += .34) { const s = .13 + (Math.abs(x * 7 + z * 3) % 1) * .06; herbs.push([x, LG + h + .1, z, s, s, s]); }
    };
    KRAEUTER.forEach(b => bed(b, .55)); HOCHBEETE.forEach(b => bed(b, .75));
    /* Essplatz im Garten: Platten, Tisch, sechs Stühle, Grill, gelbes Sonnensegel; Trittsteine zum Pool */
    const E = ESS;
    box(g, E.x0, LG, E.z0, E.x1, LG + .04, E.z1, MG.concrete, false);
    [[2.05, .1], [2.95, .35]].forEach(([x, z]) => box(g, wx(x) - .3, LG, wz(z) - .3, wx(x) + .3, LG + .03, wz(z) + .3, MG.concrete, false));
    put(BUILD.table(2.0, .9, { out: 1 }), g, wx(-2.2), LG + .04, wz(-.6), 0);
    [-1, 1].forEach(sd => [-2.9, -2.2, -1.5].forEach(x => put(BUILD.chair(.48, .52, { out: 1 }), g, wx(x), LG + .04, wz(-.6) + sd * .7, sd > 0 ? Math.PI : 0)));
    box(g, wx(.55), LG + .04, wz(-2.25), wx(1.35), LG + .95, wz(-1.7), MG.grill);
    const SC = [[-4.3, 2.85, -2.45], [-.25, 2.45, -1.15], [-3.4, 2.6, 1.45]].map(([x, y, z]) => [wx(x), LG + y, wz(z)]);
    SC.forEach(([x, y, z]) => box(g, x - .04, LG, z - .04, x + .04, y + .05, z + .04, MG.dark));
    {
      /* Segel als feines Dreiecksnetz: die Ecken hängen fest, die Mitte bläht sich im Wind */
      const n = sail.n, pos = [], bary = [], idx = [], id = (i, j) => i * (n + 1) - (i * (i - 1)) / 2 + j;
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
        const a = i / n, b = j / n, c = 1 - a - b; bary.push(a, b, c);
        pos.push(...[0, 1, 2].map(k => SC[0][k] * c + SC[1][k] * a + SC[2][k] * b));
      }
      for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) {
        idx.push(id(i, j), id(i + 1, j), id(i, j + 1));
        if (j < n - i - 1) idx.push(id(i + 1, j), id(i + 1, j + 1), id(i, j + 1));
      }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      sail.geo = geo; sail.rest = Float32Array.from(pos); sail.bary = bary;
      const e1 = new T.Vector3(...SC[1]).sub(new T.Vector3(...SC[0])), e2 = new T.Vector3(...SC[2]).sub(new T.Vector3(...SC[0]));
      sail.N.crossVectors(e1, e2).normalize(); if (sail.N.y < 0) sail.N.negate();
      mesh(g, geo, MG.sail);
    }
    /* Glashaus mit Satteldach aus Glas, Gartenhütte */
    const Gh = GLASHAUS, cx = (Gh.x0 + Gh.x1) / 2, eav = LG + 1.95, rid = LG + 2.6;
    box(g, Gh.x0, LG, Gh.z0, Gh.x1, LG + .03, Gh.z1, MG.gravel, false);
    [Gh.x0, Gh.x1].forEach(x => [Gh.z0, (Gh.z0 + Gh.z1) / 2, Gh.z1].forEach(z => box(g, x - .03, LG, z - .03, x + .03, eav, z + .03, MG.dark)));
    box(g, cx - .03, rid - .05, Gh.z0, cx + .03, rid, Gh.z1, MG.dark);
    pane(g, 'z', Gh.z0, Gh.z1, LG + .03, eav, Gh.x0); pane(g, 'z', Gh.z0, Gh.z1, LG + .03, eav, Gh.x1);
    pane(g, 'x', Gh.x0, Gh.x1, LG + .03, eav, Gh.z0); pane(g, 'x', Gh.x0, Gh.x1, LG + .03, eav, Gh.z1);
    [[Gh.x0, eav, cx, rid], [Gh.x1, eav, cx, rid]].forEach(([x0, y0, x1, y1]) => {
      const l = Math.hypot(x1 - x0, y1 - y0), m = mesh(g, new T.BoxGeometry(l, .02, Gh.z1 - Gh.z0), MG.glass, false);
      m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (Gh.z0 + Gh.z1) / 2); m.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    });
    [Gh.z0, Gh.z1].forEach(z => mesh(g, prism('z', [[Gh.x0, eav], [Gh.x1, eav], [cx, rid]], z - .01, z + .01), MG.glass, false));
    box(g, Gh.x0 + .1, LG, Gh.z0 + .3, Gh.x0 + .7, LG + .8, Gh.z1 - .3, MG.larch);
    for (let z = Gh.z0 + .5; z < Gh.z1 - .3; z += .45) herbs.push([Gh.x0 + .4, LG + .95, z, .2, .2, .2]);
    inst(g, blob, MG.herb, herbs, false);
    const Hu = HUETTE;
    box(g, Hu.x0, LG, Hu.z0, Hu.x1, LG + 2.2, Hu.z1, MG.slats);
    box(g, Hu.x0 - .12, LG + 2.2, Hu.z0 - .12, Hu.x1 + .12, LG + 2.38, Hu.z1 + .12, MG.frame);
    box(g, Hu.x1 - .01, LG, wz(9.0), Hu.x1 + .03, LG + 2.0, wz(9.9), MG.frame, false);
    /* Der Hund: gebaut mit der Nase nach +x, Beine und Schwanz an Gelenken */
    dog = (() => {
      const d = new T.Group(), body = new T.Group(); d.add(body); d.scale.setScalar(1.25);
      const bx = (p, w, h, dd, m, x, y, z) => { const o = new T.Mesh(UBOX, m); o.scale.set(w, h, dd); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
      bx(body, .62, .26, .26, MG.fur, 0, .34, 0);
      bx(body, .05, .07, .27, MG.gelb, .25, .5, 0);
      const head = new T.Group(); head.position.set(.34, .52, 0); body.add(head);
      bx(head, .24, .22, .2, MG.fur, .02, 0, 0); bx(head, .14, .1, .12, MG.fur, .17, .02, 0); bx(head, .04, .05, .06, MG.nose, .25, .07, 0);
      [-1, 1].forEach(s => { const e = bx(head, .07, .12, .04, MG.trunk, -.04, .17, s * .085); e.rotation.x = s * .3; });
      const legs = [[.22, .09, 0], [.22, -.09, Math.PI], [-.22, .09, Math.PI], [-.22, -.09, 0]].map(([x, z, ph]) => {
        const j = new T.Group(); j.position.set(x, .38, z); body.add(j); bx(j, .07, .38, .07, MG.fur, 0, -.38, 0); j.userData.ph = ph; return j;
      });
      const tail = new T.Group(); tail.position.set(-.3, .55, 0); body.add(tail); bx(tail, .26, .05, .05, MG.fur, -.13, -.025, 0); tail.rotation.z = -.7;
      const curve = new T.CatmullRomCurve3(DOG.map(([x, z]) => new T.Vector3(x, LG, z)), true, 'centripetal');
      g.add(d);
      return { g: d, body, head, legs, tail, curve, len: curve.getLength() };
    })();
  }

  /* ---------- Linien: Grundstücksgrenze, Maße, Baufenster ---------- */
  const lineMat = (color = 0xffffff, op = 1) => new T.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false });
  const segs = (pts, m) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pts.flat(), 3)); const l = new T.LineSegments(g, m); l.renderOrder = 2; W3.add(l); return l; };
  const rectPts = (x0, z0, x1, z1, y) => [[x0, y, z0], [x1, y, z0], [x1, y, z0], [x1, y, z1], [x1, y, z1], [x0, y, z1], [x0, y, z1], [x0, y, z0]];
  const yL = GROUND_Y + .03;
  const border = segs(POLY.flatMap(([x, z], i) => { const [x1, z1] = POLY[(i + 1) % POLY.length]; return [[x, yL, z], [x1, yL, z1]]; }), lineMat(0xffffff, .9));
  /* Maße: Straßenseite (Ecke 0 → 1) und Ostseite (Ecke 2 → 3), je 1,6 m nach außen gerückt, mit Endstrichen */
  const dimM = lineMat(0xffffff, 1);
  const dimLine = (a, b) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    let nx = -dz / len, nz = dx / len; if ((CX - a[0]) * nx + (CZ - a[1]) * nz > 0) { nx = -nx; nz = -nz; }
    const o = 1.6, p = [a[0] + nx * o, a[1] + nz * o], q = [b[0] + nx * o, b[1] + nz * o];
    const tick = ([x, z]) => [[x - nx * .5, yL, z - nz * .5], [x + nx * .5, yL, z + nz * .5]];
    const l = segs([[p[0], yL, p[1]], [q[0], yL, q[1]], ...tick(p), ...tick(q)], dimM.clone());
    l.userData.mid = [(p[0] + q[0]) / 2 + nx * .6, yL, (p[1] + q[1]) / 2 + nz * .6]; return l;
  };
  const dimX = dimLine(POLY[0], POLY[1]), dimZ = dimLine(POLY[2], POLY[3]);
  const BAU = { x0: -12.0, x1: 8.6, z0: -6.6, z1: 7.0 };
  const bau = (() => {
    const g = new T.BufferGeometry().setFromPoints(rectPts(BAU.x0, BAU.z0, BAU.x1, BAU.z1, yL + .01).filter((p, i) => i % 2 === 0).concat([[BAU.x0, yL + .01, BAU.z0]]).map(p => new T.Vector3(...p)));
    const l = new T.Line(g, new T.LineDashedMaterial({ color: GELB, dashSize: .6, gapSize: .4, transparent: true, depthWrite: false }));
    l.computeLineDistances(); l.renderOrder = 2; W3.add(l); return l;
  })();
  /* Bohrkern: Schichten des Baugrunds, die aus dem Boden steigen (im Garten im Westen) */
  const CORE = [-12.6, 3.4];
  const core = new T.Group(); core.position.set(CORE[0], 0, CORE[1]); W3.add(core);
  { let y = 0; [.5, .7, .9, .6, .8].forEach((h, i) => { const m = new T.Mesh(new T.CylinderGeometry(.42, .42, h, 28).translate(0, -y - h / 2, 0), MG.soilL[i]); m.castShadow = true; core.add(m); y += h; }); core.userData.h = y; }
  /* Zonen des Projektplans: sofort Haus und Zufahrt, später Terrasse und Garten, irgendwann Pool oder Sauna */
  const zoneMat = c => new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide });
  const zone = (rs, c, ro = 3) => { const g = new T.Group(), m = zoneMat(c); rs.forEach(({ x0, z0, x1, z1 }) => { const o = new T.Mesh(new T.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2), m); o.position.set((x0 + x1) / 2, yL + .02, (z0 + z1) / 2); o.renderOrder = ro; g.add(o); }); W3.add(g); return m; };
  const Z1g = zoneMat(0xffffff);
  { const o = new T.Mesh(new T.ShapeGeometry(new T.Shape(POLY.map(([x, z]) => new T.Vector2(x, -z)))).rotateX(-Math.PI / 2), Z1g); o.position.y = yL + .02; o.renderOrder = 3; W3.add(o); }
  const Z1 = zone([...DECKS, UEB], 0xffffff, 4);
  const Z0 = zone([HAUS, { x0: TECH.x0, x1: TECH.x1, z0: TECH.z0, z1: HAUS.z0 }, { x0: EING.x0, x1: HAUS.x0, z0: EING.z0, z1: EING.z1 }, { x0: ESSA.x0, x1: ESSA.x1, z0: HAUS.z1, z1: ESSA.z1 },
    { x0: CP.x0, x1: CP.x1, z0: streetZ(CP.x0), z1: CP.z1 }, { x0: CP.dach.x0, x1: CP.dach.x1, z0: CP.z1, z1: CP.dach.z1 }], GELB, 5);
  const Z2 = zone([PDECK, { x0: SAUNA.x0 - .1, x1: SAUNA.x1 + .1, z0: SAUNA.z0 - .1, z1: SAUNA.z1 }], 0xffffff, 5);

  /* ---------- Schlüssel (Projektmanager) ---------- */
  const key = new T.Group(); scene.add(key);
  {
    const ring = new T.Mesh(new T.TorusGeometry(.36, .1, 16, 40), MG.gelb); ring.position.x = -.62; key.add(ring);
    const shaft = new T.Mesh(UBOX, MG.gelb); shaft.scale.set(1.25, .13, .1); shaft.position.set(.2, -.065, 0); key.add(shaft);
    [[.55, .28], [.72, .2], [.38, .2]].forEach(([x, h]) => { const b2 = new T.Mesh(UBOX, MG.gelb); b2.scale.set(.12, h, .1); b2.position.set(x, -h - .02, 0); key.add(b2); });
    key.traverse(o => { if (o.isMesh) o.castShadow = true; });
  }
  /* ---------- Wagen des Kundendiensts: fährt die Straße entlang und hält vor dem Carport ---------- */
  const van = new T.Group(); scene.add(van);
  {
    const L = 5.2, Wd = 2.0;
    box(van, -L / 2, .38, -Wd / 2, L / 2 - 1.2, 2.45, Wd / 2, MG.white);
    box(van, L / 2 - 1.25, .38, -Wd / 2, L / 2, 1.55, Wd / 2, MG.white);
    box(van, L / 2 - 1.2, 1.25, -Wd / 2 + .06, L / 2 - .25, 2.05, Wd / 2 - .06, M.carGlass);
    box(van, -L / 2 + .3, 1.5, -Wd / 2 - .005, L / 2 - 1.4, 1.62, Wd / 2 + .005, MG.gelb, false);
    const wg = new T.CylinderGeometry(.36, .36, .26, 20).rotateX(Math.PI / 2);
    [[-1.6, -Wd / 2], [-1.6, Wd / 2], [1.65, -Wd / 2], [1.65, Wd / 2]].forEach(([x, z]) => { const w = new T.Mesh(wg, M.tyre); w.position.set(x, .36, z); van.add(w); });
    van.rotation.y = Math.PI;
  }
  const VANZ = streetZ(-12) - 3.1, VANX = (CP.x0 + CP.x1) / 2 + .3;
  /* ---------- Schnitt durch die GRIFFNER Wand (Punkt Wand): neun Schichten, die sich beim Fokus auffächern ---------- */
  const WALLX = HAUS.x1 + .04;
  const wall = new T.Group(); wall.position.set(WALLX, 0, -.5); scene.add(wall);
  const wallL = [];
  { let a = 0; WALL.forEach(L => { const m = new T.Mesh(UBOX, MAT[L.m]()); m.scale.set(Math.max(.01, L.d), EGH - .1, 1.6); m.castShadow = true; m.receiveShadow = true; wall.add(m); wallL.push({ m, a, d: L.d }); a += L.d; }); wall.userData.D = a; }
  /* Maß der Raumhöhe (Punkt Raumhöhe): Linie 2,72 m und daneben 2,50 m, im Wohnen hinter dem Glas nach Osten */
  const dims = new T.Group(); dims.position.set(5.6, 0, 1.8); dims.rotation.y = Math.PI / 2; scene.add(dims);
  {
    const l1 = lineMat(GELB, 1), l2 = lineMat(0xffffff, .8);
    const v = (x, h, m) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([x, 0, 0, x, h, 0, x - .25, 0, 0, x + .25, 0, 0, x - .25, h, 0, x + .25, h, 0], 3)); const l = new T.LineSegments(g, m); l.renderOrder = 4; dims.add(l); };
    v(.15, 2.72, l1); v(.75, 2.5, l2);
    dims.userData.mats = [l1, l2];
  }
  [W3, key, van, wall, dims].forEach(g => g.traverse(envAll));

  /* ---------- Marken (HTML über dem Bild) ---------- */
  const keyAt = () => { key.updateMatrixWorld(true); const v = key.localToWorld(new T.Vector3(.05, -.15, 0)); return [v.x, v.y, v.z]; };
  const anchors = {
    'lay-plan': () => [1.5, yL, 22.5], 'lay-fund': () => [HAUS.x1, X.fo - .05, HAUS.z1], 'lay-huelle': () => [HAUS.x1, X.so + OGY + 1.6, 1.6],
    'lay-innen': () => [3.4, X.io + .5, 1.6], 'lay-aussen': () => [(POOL.x0 + POOL.x1) / 2 + 1.5, LG + .1, (POOL.z0 + POOL.z1) / 2], 'lay-key': keyAt,
    flaeche: () => [-1.5, yL, 22], dimx: () => dimX.userData.mid, dimz: () => dimZ.userData.mid, bau: () => [-2, yL, BAU.z1], boden: () => [CORE[0], 1.4 * X.core, CORE[1]],
    z0: () => [0, yL, 0], z1: () => [-4, yL, 17], z2: () => [(PDECK.x0 + PDECK.x1) / 2, yL, (POOL.z0 + POOL.z1) / 2],
    arch: () => [HAUS.x0, 1.6, HAUS.z0], einreich: () => [HAUS.x1, 1.6, HAUS.z0], werk: () => [HAUS.x1, 1.6, HAUS.z1], statik: () => [HAUS.x0, 1.6, HAUS.z1],
    slab: () => [1.5, .02, HAUS.z1], daemm: () => [1.0, 8.5 + X.roofUp, 1.2], moist: () => [WALLX + 2.1, 2.4, -.5], ueblich: () => [5.6, 2.5, 1.05],
    terrasse: () => [6.0, .1, 5.8], carport: () => [(CP.x0 + CP.x1) / 2, 2.95, (CP.z0 + CP.z1) / 2], pool: () => [(POOL.x0 + POOL.x1) / 2, LG + .1, (POOL.z0 + POOL.z1) / 2],
    sauna: () => [(SAUNA.x0 + SAUNA.x1) / 2, 2.7, (SAUNA.z0 + SAUNA.z1) / 2], garten: () => [-3.0, 5.4, 12.8],
    key: () => { key.updateMatrixWorld(true); const v = key.localToWorld(new T.Vector3(1.0, .5, 0)); return [v.x, v.y, v.z]; }, van: () => [van.position.x, 2.5, van.position.z]
  };
  Object.keys(HOT).forEach(k => { anchors[k] = () => HOT[k].at; });
  const X = { fo: 0, io: 0, so: 0, core: 0, roofUp: 0 };
  const NS = 'http://www.w3.org/2000/svg';
  const lnSvg = document.createElementNS(NS, 'svg'); lnSvg.setAttribute('class', 'svf__ln'); lnSvg.setAttribute('aria-hidden', 'true'); l3.appendChild(lnSvg);
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
    let ln = null, pt = null;
    if (!hot) {
      ln = document.createElementNS(NS, 'line'); pt = document.createElementNS(NS, 'circle'); pt.setAttribute('r', lay ? '4.5' : '3.5');
      ln.style.opacity = '0'; pt.style.opacity = '0'; lnSvg.append(ln, pt);
    }
    return { ...L, el, hot, lay, ln, pt, a: anchors[L.id] || (() => [0, 0, 0]), op: -1 };
  });

  /* ---------- Zustand je P ---------- */
  let P = opt.P || 0, focus = null, fk = 0, fkFrom = 0, fkT0 = 0, fkTo = 0, lastFocus = null, Wd = 1, Hd = 1, dirty = true, alive = true, raf = 0;
  const viewAt = p => {
    let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    const [p0, a] = KEYS[i], [p1, b] = KEYS[i + 1], t = sm((p - p0) / (p1 - p0));
    return { t: a.t.map((v, k) => lerp(v, b.t[k], t)), az: lerpA(a.az, b.az, t), el: lerp(a.el, b.el, t), d: lerp(a.d, b.d, t) };
  };
  const mixV = (a, b, t) => ({ t: a.t.map((v, k) => lerp(v, b.t[k], t)), az: lerpA(a.az, b.az, t), el: lerp(a.el, b.el, t), d: lerp(a.d, b.d, t) });

  function state(p) {
    /* Haus: ganz (0 bis 4), weg im Projektcheck, Plan (Hausplanung), graue Bodenplatte (Fundament), baut sich (Exterior), offen (Interior), ganz */
    const gone = S_(p, 3.98, 4.22) * (1 - S_(p, 5.5, 5.62));
    const plan = S_(p, 5.5, 5.66);
    const build = S_(p, 6.72, 7.12), og = S_(p, 6.95, 7.12), roof = S_(p, 7.04, 7.2);
    const open = S_(p, 8.0, 8.16) * (1 - S_(p, 8.96, 9.1));
    let eg, ogs, ext, slab, rf, plane = true, slabOnly = false;
    if (p < 5.5) { eg = 1 - gone; ogs = 1 - gone; ext = 1; slab = 1 - gone; rf = 1 - S_(p, 3.98, 4.12); }
    else if (p < 6.02) { eg = plan; ogs = 0; ext = 0; slab = 0; rf = 0; }
    /* Runde 51: der Plan sinkt in die Platte, dann steht nur die graue Bodenplatte da, ohne Plan darauf */
    else if (p < 6.72) { eg = lerp(1, .079, S_(p, 6.02, 6.22)); ogs = 0; ext = 0; slab = 0; rf = 0; plane = eg > .45; slabOnly = true; }
    else { eg = lerp(.079, 1, build); ogs = og; ext = build; slab = og; rf = roof; plane = build > .55; slabOnly = true; }
    if (p >= 7.98) { ogs *= 1 - open; slab *= 1 - open; rf *= 1 - open; ext = lerp(ext, .62, open); }
    const fo = focus;
    if (fo === 'bad') { const k = fk; ogs = lerp(ogs, 1, k); slab = lerp(slab, 1, k); ext = lerp(ext, .62, k); }
    /* Fokus auf Open Space, Parkett, Fliesen oder Türen: Wände auf 1 m, damit man in die Räume sieht */
    const low = LOW.includes(focus || lastFocus) ? sm(fk) : 0;
    ext = lerp(ext, 0, low); HT.cut = lerp(CUT0, 1.0, low);
    S.eg = clamp(eg); S.og = clamp(ogs); S.ext = clamp(ext); S.slab = clamp(slab); S.roof = clamp(rf); S.lift = 1;
    /* Explosion im Überblick */
    const ex = S_(p, 3.08, 3.4) * (1 - S_(p, 3.92, 4.06));
    X.fo = 1.3 * ex; X.io = 3.2 * ex; X.so = 6.4 * ex;
    X.roofUp = fo === 'dach' ? 1.4 * fk : 0;
    return { ex, plane, slabOnly };
  }

  let gardenOn = 0;
  function placeAll(p) {
    const st = state(p);
    HW.apply();
    if (st.slabOnly && S.eg > .01) EG.base.forEach(m => { m.scale.y = .3; m.position.y = -.3; });
    if (!st.plane) EG.plane.visible = false;
    offEG(X.fo, X.io, X.so);
    OG.g.position.y += X.so;
    ogRoofs.forEach(r => { if (r.g.visible) r.g.position.y += X.roofUp; });
    /* Grundstück: wächst im Kapitel Projekt vom Sockel aufs ganze Grundstück */
    const pk = S_(p, 2.05, 2.5);
    lawn.visible = true; setPlot(pk);
    border.material.opacity = .7 * S_(p, 2.3, 2.6);
    street.visible = pk > .98; street.scale.z = 6.2 * S_(p, 2.45, 2.7) + .001;
    /* Garten: im Projekt und im Überblick da, ab dem Projektcheck weg, ab Rund ums Haus Teil für Teil zurück */
    const back = { zufahrt: 9.05, carport: 9.05, sauna: 9.22, terrasse: 9.36, pool: 9.46, garten: 9.58 };
    Object.entries(parts).forEach(([k, o]) => {
      const on = Math.max(S_(p, 2.4, 2.72) * (1 - S_(p, 3.98, 4.16)), S_(p, back[k] - .06, back[k] + .06));
      const kk = k === 'zufahrt' ? Math.max(on, S_(p, 6.6, 7.0)) : on;
      if (Math.abs(kk - o.k) < 1e-4) return; o.k = kk;
      o.g.visible = kk > .002; o.g.scale.set(1, Math.max(.001, kk), 1);
    });
    poolCover.visible = lawnK > .999 && parts.pool.k < .5;
    gardenOn = Math.max(parts.garten.k, parts.pool.k);
    /* Auto fährt unter den Carport */
    carG.position.z = wz(-13.3) - 9 * (1 - sm(clamp((parts.carport.k - .5) * 2)));
    /* Bäume wachsen mit den Jahren (Kundendienst) */
    const yr = S_(p, 10.55, 10.95), ts = .82 + .18 * Math.max(yr, p < 10.5 ? 1 : 0);
    trees.forEach(t => t.scale.setScalar(ts));
    /* Projektcheck: Maße, Baufenster, Bohrkern */
    dimX.material.opacity = S_(p, 4.42, 4.55) * (1 - S_(p, 5.0, 5.1));
    dimZ.material.opacity = S_(p, 4.47, 4.6) * (1 - S_(p, 5.0, 5.1));
    dimX.visible = dimX.material.opacity > .002; dimZ.visible = dimZ.material.opacity > .002;
    bau.material.opacity = S_(p, 4.57, 4.7) * (1 - S_(p, 5.02, 5.12)); bau.visible = bau.material.opacity > .002;
    X.core = S_(p, 4.66, 4.82) * (1 - S_(p, 5.02, 5.14));
    core.visible = X.core > .002; core.position.y = lerp(-.2, core.userData.h + .4, X.core) - .2;
    /* Projektplan: Zonen */
    Z0.opacity = .82 * S_(p, 5.08, 5.16) * (1 - S_(p, 5.5, 5.58));
    Z1.opacity = .8 * S_(p, 5.2, 5.28) * (1 - S_(p, 5.5, 5.58)); Z1g.opacity = .4 * Z1.opacity;
    Z2.opacity = .8 * S_(p, 5.32, 5.4) * (1 - S_(p, 5.5, 5.58));
    /* Schlüssel: im Überblick frei rechts neben dem Haus, mit Linie zu seiner Marke; beim Projektmanager vor der Haustür */
    const kOver = S_(p, 3.4, 3.6) * (1 - S_(p, 3.92, 4.04)), kDoor = S_(p, 10.08, 10.3) * (1 - S_(p, 10.46, 10.6));
    key.visible = kOver > .002 || kDoor > .002;
    if (kOver > .002) { key.position.set(10.6, 9.4 + .25 * Math.sin(p * 9), .4); key.rotation.set(0, .5 + Math.sin(p * 5) * .4, .12); key.scale.setScalar(2.4 * kOver); }
    else { key.position.set(-9.7, 1.65 + .12 * Math.sin(p * 12), -.9); key.rotation.set(0, -1.0 + Math.sin((p - 10.1) * 6) * .35, .12); key.scale.setScalar(1.7 * kDoor); }
    /* Kundendienst: der Wagen fährt die Straße entlang und bleibt vor dem Carport stehen */
    const vk = S_(p, 10.52, 10.78) * (1 - S_(p, 10.98, 11.08));
    van.visible = vk > .002; van.position.set(lerp(30, VANX, sm(vk)), GROUND_Y, VANZ);
    /* Wand im Schnitt (Fokus Wand) */
    const wk = focus === 'wand' ? fk : 0;
    wall.visible = wk > .002;
    if (wall.visible) {
      wall.position.x = WALLX + 1.6 * wk;
      let x = 0; wallL.forEach(L => { L.m.position.set(x + L.d / 2 - .02, 0, 0); L.m.scale.x = Math.max(.01, L.d); x += L.d + .16 * wk; });
    }
    const dk = focus === 'hoehe' ? fk : 0;
    dims.visible = dk > .002; dims.userData.mats.forEach(m => { m.opacity = dk; });
    /* Fenster leuchten am Ende warm (Haltung) */
    const glow = S_(p, 11.2, 11.7);
    M.glass.emissive.setHex(0xffd9a0); M.glass.emissiveIntensity = .55 * glow;
    return st;
  }

  /* ---------- Der Garten lebt: Wind, Segel, Wellen, Hund ---------- */
  const tmp = new T.Vector3();
  function life(t) {
    const gust = .55 + .45 * Math.sin(t * .37) * Math.sin(t * .23 + 1);
    trees.forEach(tr => {
      const u = tr.userData, a = (.012 + .02 * gust) * (2.2 / (1.4 + u.h * .25));
      tr.rotation.z = a * Math.sin(t * 1.1 + u.ph); tr.rotation.x = a * .7 * Math.sin(t * .83 + u.ph * 1.4);
      u.c.rotation.z = .04 * gust * Math.sin(t * 2.3 + u.ph); u.c2.rotation.x = .05 * gust * Math.sin(t * 2.7 + u.ph);
    });
    if (sail.geo) {
      const p = sail.geo.attributes.position, b = sail.bary, r = sail.rest, N = sail.N;
      for (let i = 0; i < p.count; i++) {
        const a = b[i * 3], bb = b[i * 3 + 1], c = b[i * 3 + 2], belly = 27 * a * bb * c;
        const w = belly * (.22 + .16 * gust * Math.sin(t * 3.1 + a * 5 + bb * 3)) + .03 * Math.sin(t * 7 + a * 11) * belly;
        p.array[i * 3] = r[i * 3] + N.x * w; p.array[i * 3 + 1] = r[i * 3 + 1] + N.y * w; p.array[i * 3 + 2] = r[i * 3 + 2] + N.z * w;
      }
      p.needsUpdate = true; sail.geo.computeVertexNormals();
    }
    {
      const a = waterPos.array, n = waterPos.count;
      for (let i = 0; i < n; i++) {
        const x = waterXZ[i * 2], z = waterXZ[i * 2 + 1];
        a[i * 3 + 1] = .014 * Math.sin(x * 1.7 + t * 1.9) + .01 * Math.sin(z * 2.6 - t * 1.3 + x * .5) + .006 * Math.sin((x - z) * 4.1 + t * 3.2);
      }
      waterPos.needsUpdate = true; water.geometry.computeVertexNormals();
      caus.offset.set(t * .015, Math.sin(t * .2) * .03);
    }
    if (dog) {
      const u = ((t * 1.15) % dog.len) / dog.len, pt = dog.curve.getPointAt(u), tg = dog.curve.getTangentAt(u, tmp);
      dog.g.position.copy(pt); dog.g.rotation.y = Math.atan2(-tg.z, tg.x);
      const s = t * 2 * Math.PI * 2.1;
      dog.legs.forEach(j => { j.rotation.z = .55 * Math.sin(s + j.userData.ph); });
      dog.body.position.y = .025 * Math.abs(Math.sin(s));
      dog.tail.rotation.y = .6 * Math.sin(t * 13); dog.head.rotation.z = .06 * Math.sin(s * .5);
    }
  }

  /* ---------- Kamera und Marken ---------- */
  const tv = new T.Vector3();
  function camera(p) {
    let v = viewAt(p);
    if (fk > 0 && (focus || lastFocus)) v = mixV(v, HOT[focus || lastFocus].v, sm(fk));
    /* Telefon und Hochformat: das Modell kleiner, damit oben Platz bleibt und der Text unten frei steht */
    const asp = Wd / Hd, dk = asp < .8 ? lerp(1.42, 1.24, win(p, 3.0, 3.98, .14)) : asp < 1.2 ? 1.14 : 1, d = v.d * dk;
    const cp = Math.cos(v.el);
    cam.position.set(v.t[0] + d * Math.sin(v.az) * cp, v.t[1] + d * Math.sin(v.el), v.t[2] + d * Math.cos(v.az) * cp);
    cam.lookAt(tv.set(...v.t));
    /* Bildmitte: am Desktop rechts oben (Text unten links), am Telefon oben */
    const ov = small() ? 0 : win(p, 3.0, 3.98, .14), td = win(p, 4.2, 5.55, .14);
    const sx = small() ? .5 : lerp(.63, .465, ov), sy = asp < .8 ? .3 : small() ? .36 : lerp(lerp(.44, .34, ov), .5, td);
    cam.setViewOffset(Wd, Hd, -(sx - .5) * Wd, -(sy - .5) * Hd, Wd, Hd);
    cam.updateMatrixWorld();
  }
  function marks(p) {
    const ph = small(), lay = [], tags = [];
    labels.forEach(L => {
      let o;
      if (L.fo) o = focus === L.fo ? sm(fk) : 0;
      else {
        o = win(p, L.from, L.to, .05);
        if (L.hot && focus) o *= 1 - sm(fk);
        if (L.hot && !focus && fk > 0 && lastFocus) o *= 1 - sm(fk);
      }
      if (o < .01) { if (L.op !== 0) { L.el.style.opacity = '0'; L.el.style.visibility = 'hidden'; L.el.style.pointerEvents = 'none'; L.op = 0; lineOff(L); } return; }
      tv.set(...L.a()).project(cam);
      /* Punkte und Schilder nur, wenn ihr Anker wirklich im Bild ist (sonst hängt die Marke halb am Rand) */
      const m = L.lay ? -40 : 12, x = (tv.x + 1) / 2 * Wd, y = (1 - tv.y) / 2 * Hd, off = tv.z > 1 || x < m || x > Wd - m || y < m || y > Hd - m;
      if (off) { L.el.style.visibility = 'hidden'; L.el.style.pointerEvents = 'none'; L.op = -1; lineOff(L); return; }
      L.el.style.visibility = 'visible';
      L.el.style.opacity = o.toFixed(3); L.op = o;
      L.el.style.pointerEvents = o > .5 ? 'auto' : 'none';
      L.el.classList.toggle('is-left', x > Wd * (ph ? .6 : .74));
      if (L.lay) { lay.push({ L, x, y, o }); return; }
      if (!L.hot) { tags.push({ L, x, y, o }); return; }
      L.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    });
    if (lay.length) spread(lay, ph);
    if (tags.length) spreadTags(tags);
  }
  /* Runde 51: die Marken des Überblicks stehen etwas neben ihrem Teil und hängen immer an einer Linie mit einem gelben Punkt auf dem
     Teil im Modell (kein Pfeil mehr); senkrecht entzerrt, nicht über das Logo, nicht in die Leiste unten */
  function spread(lay, ph) {
    lay.forEach(m => { if (!m.L.th) m.L.th = m.L.el.querySelector('.svf-m__t').offsetHeight || 30; });
    lay.sort((a, b) => a.y - b.y);
    const top = ph ? 96 : 118, bot = Hd - (ph ? 120 : 150), gap = m => m.L.th + (ph ? 8 : 12);
    lay.forEach((m, i) => { m.ly = Math.max(m.y - (ph ? 18 : 30), i ? lay[i - 1].ly + gap(lay[i - 1]) : top); });
    for (let i = lay.length - 1; i >= 0; i--) { const lim = i < lay.length - 1 ? lay[i + 1].ly - gap(lay[i]) : bot; if (lay[i].ly > lim) lay[i].ly = lim; }
    lay.forEach((m, i) => { m.ly = Math.max(m.ly, i ? lay[i - 1].ly + gap(lay[i - 1]) : top); });
    /* Desktop: eine Spalte rechts neben dem Modell, Linien vom Teil zur Marke. Telefon: knapp neben dem Teil */
    const col = Wd >= 1200 ? Wd - 380 : Wd - 320, dx = 26;
    lay.forEach(m => {
      if (ph) m.lx = m.x + (m.L.el.classList.contains('is-left') ? -dx : dx);
      else { m.L.el.classList.remove('is-left'); m.lx = Math.max(col, m.x + 40); }
      m.always = true; putMark(m);
    });
  }
  /* Schilder (Grundstück, Plan, Garten): nur entzerren, wo sie sich wirklich überdecken (auch waagrecht) */
  function spreadTags(tags) {
    tags.forEach(m => { if (!m.L.th) { const t = m.L.el.querySelector('.svf-m__t'); m.L.th = t.offsetHeight || 26; m.L.tw = t.offsetWidth || 120; } });
    tags.sort((a, b) => a.y - b.y);
    const placed = [];
    tags.forEach(m => {
      const left = m.L.el.classList.contains('is-left');
      m.x0 = left ? m.x - 18 - m.L.tw : m.x - 8; m.x1 = left ? m.x + 8 : m.x + 18 + m.L.tw;
      let ly = m.y;
      placed.forEach(q => { if (m.x0 < q.x1 && m.x1 > q.x0 && ly < q.ly + q.L.th + 6 && ly > q.ly - m.L.th - 6) ly = q.ly + q.L.th + 6; });
      m.ly = ly; placed.push(m);
    });
    tags.forEach(putMark);
  }
  function putMark({ L, x, y, lx = x, ly, o, always }) {
    L.el.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0)`;
    const d = always || Math.abs(ly - y) > 6;
    /* die Linie endet am gelben Kästchen der Marke */
    const ex = lx, ey = always ? ly : ly + (ly > y ? -5 : 5);
    L.ln.setAttribute('x1', x.toFixed(1)); L.ln.setAttribute('y1', y.toFixed(1)); L.ln.setAttribute('x2', ex.toFixed(1)); L.ln.setAttribute('y2', ey.toFixed(1));
    L.pt.setAttribute('cx', x.toFixed(1)); L.pt.setAttribute('cy', y.toFixed(1));
    L.ln.style.opacity = d ? (o * (always ? .9 : .7)).toFixed(3) : '0'; L.pt.style.opacity = d ? o.toFixed(3) : '0';
  }
  function lineOff(L) { if (L.ln) { L.ln.style.opacity = '0'; L.pt.style.opacity = '0'; } }

  function size() {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    if (w === Wd && h === Hd) return;
    Wd = w; Hd = h;
    R.setPixelRatio(Math.min(devicePixelRatio || 1, small() ? 1.5 : 2));
    R.setSize(Wd, Hd, false);
    cam.aspect = Wd / Hd; cam.fov = Wd / Hd < .8 ? 42 : 30; cam.updateProjectionMatrix();
    dirty = true;
  }
  /* Zeit des Gartens: läuft nur, wenn er lebt; bei weniger Bewegung steht er still */
  let tLife = 0, tLast = 0;
  function draw() {
    size();
    placeAll(P); life(tLife); camera(P); marks(P);
    R.render(scene, cam);
  }
  let inView = true;
  const living = () => !reduce && inView && !document.hidden && gardenOn > .5;
  function tick(now) {
    raf = 0; if (!alive) return;
    if (fkT0) {
      const k = reduce ? 1 : clamp((now - fkT0) / 900);
      fk = lerp(fkFrom, fkTo, k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      if (k >= 1) { fkT0 = 0; if (!focus) lastFocus = null; }
      dirty = true;
    }
    const lv = living();
    if (lv) {
      const dt = tLast ? Math.min(.1, (now - tLast) / 1000) : 0;
      /* am Telefon reichen 30 Bilder je Sekunde */
      if (!dirty && small() && dt < .03) { raf = requestAnimationFrame(tick); return; }
      tLife += dt; tLast = now;
      if (dirty) { dirty = false; draw(); } else { life(tLife); R.render(scene, cam); }
    } else {
      tLast = 0;
      if (dirty) { dirty = false; draw(); }
    }
    if (fkT0 || living()) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf && alive) raf = requestAnimationFrame(tick); };
  const ro = new ResizeObserver(() => { dirty = true; kick(); }); ro.observe(stage);
  const io = new IntersectionObserver(es => { inView = es.some(e => e.isIntersecting); if (inView) kick(); }); io.observe(stage);
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  draw();

  return {
    R, scene, cam, HW, KEYS, HOT,
    get P() { return P; },
    setP(p) { if (Math.abs(p - P) < 1e-5) return; P = p; dirty = true; kick(); },
    renderAt(p) { P = p; draw(); },
    setFocus(id) {
      if (id === focus) return;
      if (id) { lastFocus = id; focus = id; fkFrom = fk; fkTo = 1; }
      else { focus = null; fkFrom = fk; fkTo = 0; }
      fkT0 = performance.now(); dirty = true; kick();
    },
    isExt: id => EXT.includes(id),
    destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); l3.innerHTML = ''; try { R.dispose(); } catch (e) { /* egal */ } }
  };
}
