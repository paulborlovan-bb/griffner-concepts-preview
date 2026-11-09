/* Runde 35: Grundriss fürs Telefon, realistisch (free-grundriss.html). Kundenwunsch: am Telefon einfacher und zugänglicher,
   näher am Desktop, realistischer (Holzboden, Fliesen, echte Möbel), mit Umsehen, Haus bauen und Geschoß wechseln, Raumnamen
   wie auf einem Verkaufsplan, groß als Vollbild.
   Auf der Seite: das Modell als ruhiges Bild (kein Wischen, die Seite scrollt normal), darunter EG, OG, Ganzes Haus und
   „Groß ansehen“. Groß (dialog): ein Finger dreht, zwei Finger zoomen und schieben, doppelt tippen zoomt hinein; dazu
   Knöpfe für alles (drehen, zoomen, von oben, Räume, Haus bauen), eine Liste der Räume mit Fläche, Tastatur, Ansage.
   Ein WebGL Bild für beides: die Leinwand wandert zwischen Seite und Vollbild. Gezeichnet wird nur, wenn sich etwas bewegt. */
import * as T from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { PLAN_GEO } from '../data/plan-geo.js';
import HOUSE from '../data/grundriss-free.js';
import { floorCanvas, stoneCanvas, larchCanvas, roofCanvas, gravelCanvas } from './grundriss-tex.js';
import { M, B, BUILD, pendant, car } from './grundriss-moebel.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const K = HOUSE.K, HT = HOUSE.h, [EGF, OGF] = HOUSE.floors;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const E = (p, a, b) => ease(clamp((p - a) / (b - a)));
const FACE = { s: 0, n: Math.PI, o: Math.PI / 2, w: -Math.PI / 2 };
const OPP = { n: 's', s: 'n', o: 'w', w: 'o' };
/* Weltursprung: Mitte des Erdgeschoßes; x nach Osten, z nach Süden, 1 = 1 m */
const ORX = (EGF.house[0] + EGF.house[2]) / 2, ORY = (EGF.house[1] + EGF.house[3]) / 2;
const TOP = HT.eg + HT.slab + HT.og + OGF.roof[4] + .3;
const fmtA = a => 'ca. ' + Math.round(a) + ' m²';

let R, scene, cam, sun, FL = [], EGSLAB = null, ROOF = null, host = null, labsEl = null, lives = [], dlgEl = null, raf = 0, last = 0;
const S = { eg: 0, og: 0, ext: 0, slab: 0, roof: 0, lift: 0 };
let shadowDirty = true, anims = [], seq = 0, mode = 'eg', tilt = false, labelsOn = true, focus = null, dragging = false;
/* Kamera: gezeigt (c) und Ziel (g); Azimut, Höhe, Abstand, Zielpunkt */
const c = { az: -.32, el: .98, dist: 30, t: new T.Vector3() }, g = { az: -.32, el: .98, dist: 30, t: new T.Vector3() };
let fitD = 30, box = null, vel = 0; const TV = new T.Vector3();

/* ---------- Aufbau ---------- */

function worldUV(mat, s) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uWS = { value: s };
    sh.vertexShader = 'uniform float uWS;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n{ vec4 gw = modelMatrix * vec4( transformed, 1.0 ); vMapUv = vec2( ( gw.x + gw.z ) * uWS, gw.y * uWS ); }');
  };
  return mat;
}
const ctex = (cv, rep) => { const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; } return t; };

function stage() {
  R = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .96;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  /* Schatten nur neu rechnen, wenn sich am Modell etwas bewegt (nicht beim Drehen der Kamera): halbiert die Arbeit am Telefon */
  R.shadowMap.autoUpdate = false;
  R.domElement.className = 'gr__gl';
  /* Runde 36: auf Schwarz wie die Website (Grundriss am Desktop: weißes Modell auf Schwarz) */
  scene = new T.Scene(); scene.background = new T.Color(0x000000);
  const pm = new T.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(R), .04).texture; pm.dispose();
  cam = new T.PerspectiveCamera(32, 1, .3, 400);
  scene.add(new T.HemisphereLight(0xffffff, 0xcfc8bd, .35));
  sun = new T.DirectionalLight(0xfff1e0, 2.2); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .025; sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 120 });
  scene.add(sun, sun.target);
  /* Materialien mit Bildern */
  const stone = worldUV(new T.MeshStandardMaterial({ map: ctex(stoneCanvas(), 1), roughness: .95 }), .5);
  const larch = worldUV(new T.MeshStandardMaterial({ map: ctex(larchCanvas(), 1), roughness: .85 }), 1);
  const roof = new T.MeshStandardMaterial({ map: ctex(roofCanvas(), 1), roughness: .55, metalness: .25 });
  roof.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n{ vec4 gw = modelMatrix * vec4( transformed, 1.0 ); vMapUv = vec2( gw.z * .5, ( gw.x + gw.y ) * .5 ); }'); };
  const gravel = ctex(gravelCanvas(), 1);
  const SK = { stein: stone, holz: larch };
  FL = HOUSE.floors.map((F, fi) => buildFloor(F, fi, SK));
  /* Decke über dem Erdgeschoß: Kies obenauf, Blechkante, unten weiß */
  {
    const [x0, y0, x1, y1] = EGF.house, w = (x1 - x0) / K, d = (y1 - y0) / K;
    const gm = new T.MeshStandardMaterial({ map: gravel, roughness: 1 }); gm.map = gravel.clone(); gm.map.needsUpdate = true; gm.map.repeat.set(w, d);
    const mats = [M.anthrazit, M.anthrazit, gm, M.wall, M.anthrazit, M.anthrazit];
    EGSLAB = new T.Mesh(new T.BoxGeometry(1, 1, 1).translate(0, .5, 0), mats);
    EGSLAB.scale.set(w + .06, HT.slab, d + .06); EGSLAB.position.set(((x0 + x1) / 2 - ORX) / K, HT.eg, ((y0 + y1) / 2 - ORY) / K);
    EGSLAB.castShadow = EGSLAB.receiveShadow = true; FL[0].g.add(EGSLAB);
  }
  ROOF = buildRoof(FL[1], roof, larch);
  /* Umgebung etwas zurücknehmen, sonst wird Weiß grau */
  scene.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(m => { if (m.isMeshStandardMaterial) m.envMapIntensity = .75; }); });
}

function buildFloor(F, fi, SK) {
  const geo = PLAN_GEO[F.geo] || { w: [] }, off = F.off || [0, 0];
  const X = x => (x + off[0] - ORX) / K, Z = y => (y + off[1] - ORY) / K;
  const grp = new T.Group(); scene.add(grp);
  const st = { F, fi, g: grp, walls: [], skins: [], wins: [], furn: [], steps: [], labs: [], base: [], X, Z };
  const [cx0, cy0, cx1, cy1] = F.crop, span = [cx1 - cx0, cy1 - cy0];
  const dl = (x, y) => clamp(((x - cx0) / span[0]) * .55 + ((y - cy0) / span[1]) * .45);
  /* Sockel (im Obergeschoß die Decke darunter, außen in Lärche wie die Fassade) */
  const pmat = fi ? [SK.holz, SK.holz, M.base, SK.holz, SK.holz, SK.holz] : M.base;
  F.base.forEach(r => { const m = new T.Mesh(new T.BoxGeometry(1, 1, 1).translate(0, .5, 0), pmat); m.scale.set((r[2] - r[0]) / K, .3, (r[3] - r[1]) / K); m.position.set((X(r[0]) + X(r[2])) / 2, -.3, (Z(r[1]) + Z(r[3])) / 2); m.receiveShadow = true; m.castShadow = true; grp.add(m); st.base.push(m); });
  /* Runde 37: heller Rand rund um den Sockel (20 cm), solange ein Geschoß allein steht: auf Schwarz bekommt das Haus so seine Kante */
  st.rim = F.base.map(r => { const e = .2, m = new T.Mesh(new T.BoxGeometry(1, 1, 1).translate(0, .5, 0), M.edge); m.scale.set((r[2] - r[0]) / K + e * 2, .3, (r[3] - r[1]) / K + e * 2); m.position.set((X(r[0]) + X(r[2])) / 2, -.316, (Z(r[1]) + Z(r[3])) / 2); m.receiveShadow = true; grp.add(m); return m; });
  /* Wände: die Wandflächen des Plans, oben schwarz geschnitten */
  const wallsPts = [], wb = [];
  for (const n of geo.w) {
    const pts = []; for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (Math.min(b[2] - b[0], b[3] - b[1]) < 1.5 || (b[2] - b[0]) * (b[3] - b[1]) < 20) continue;
    wallsPts.push(n); wb.push(b);
    const shp = new T.Shape(pts.map(([x, y]) => new T.Vector2(X(x), -Z(y))));
    const eg = new T.ExtrudeGeometry(shp, { depth: 1, bevelEnabled: false }); eg.rotateX(-Math.PI / 2);
    const m = new T.Mesh(eg, [M.cap, M.wall]); m.castShadow = m.receiveShadow = true; grp.add(m);
    const d = dl((b[0] + b[2]) / 2, (b[1] + b[3]) / 2), low = !!(F.low && F.low(b));
    st.walls.push({ m, d, low });
    /* Fassade außen: Stein unten, Lärche oben */
    const o = F.out, sk = SK[F.skin], t = .035;
    const face = (x, z, w, dd) => { const s = B(grp, w, 1, dd, sk, x, 0, z); st.skins.push({ m: s, d, low }); };
    o.x0.forEach(v => { if (Math.abs(b[0] - v) < 1) face(X(v) - t / 2, (Z(b[1]) + Z(b[3])) / 2, t, (b[3] - b[1]) / K + t * 2); });
    o.x1.forEach(v => { if (Math.abs(b[2] - v) < 1) face(X(v) + t / 2, (Z(b[1]) + Z(b[3])) / 2, t, (b[3] - b[1]) / K + t * 2); });
    o.y0.forEach(v => { if (Math.abs(b[1] - v) < 1) face((X(b[0]) + X(b[2])) / 2, Z(v) - t / 2, (b[2] - b[0]) / K + t * 2, t); });
    o.y1.forEach(v => { if (Math.abs(b[3] - v) < 1) face((X(b[0]) + X(b[2])) / 2, Z(v) + t / 2, (b[2] - b[0]) / K + t * 2, t); });
  }
  /* Innentüren: in jeder Lücke von 0,78 bis 1,1 m zwischen zwei Wandstücken steht ein offenes Türblatt (wie auf dem Verkaufsplan) */
  for (const dr of doorGaps(F, wb)) { const o = doorLeaf(dr, X, Z); grp.add(o); st.furn.push({ m: o, d: dl(dr.cx, dr.cy) }); }
  /* Fenster, Türen, Tor */
  for (const w of F.windows || []) st.wins.push(windowPart(grp, w, F, X, Z, SK[F.skin], dl((w[0] + w[2]) / 2, (w[1] + w[3]) / 2)));
  /* Möbel */
  const foot = [];
  for (const [type, x, y, w, d, o = {}] of F.furn || []) {
    let obj;
    if (type === 'pendant') { obj = pendant(HT.cut); obj.position.set(X(x), 0, Z(y)); }
    else {
      const f = o.f || (o.head ? OPP[o.head] : 's'), side = f === 'o' || f === 'w';
      const lw = (side ? d : w) / K, ld = (side ? w : d) / K, cx = X(x + w / 2), cz = Z(y + d / 2);
      const P = (px, py) => [X(px) - cx, Z(py) - cz]; P.K = K;
      if (!BUILD[type]) continue;
      obj = BUILD[type](lw, ld, o, P);
      obj.position.set(cx, 0, cz); obj.rotation.y = FACE[f];
      if (!/glass|rail|shower|stool/.test(type)) foot.push([x, y, w, d, /wardrobe|tall|shelf|tech|island|counter|bed|sofa|tub|lowboard|washer/.test(type) ? .7 : .35]);
    }
    grp.add(obj); st.furn.push({ m: obj, d: dl(x, y) });
  }
  for (const [x, y, l, w, paint, dir] of F.cars || []) {
    const o = car(l / K, w / K, paint); o.rotation.y = dir === 'n' ? Math.PI : dir === 'w' ? -Math.PI / 2 : 0; o.position.set(X(x), 0, Z(y)); grp.add(o);
    st.furn.push({ m: o, d: .2 }); foot.push([x - (dir === 'n' ? w : l) / 2, y - (dir === 'n' ? l : w) / 2, dir === 'n' ? w : l, dir === 'n' ? l : w, .8]);
  }
  /* Treppe (Erdgeschoß): massive Stufen, Eiche obenauf; im Obergeschoß das Treppenauge im Bodenbild */
  const stepsTex = [];
  const stairs = stairPolys(EGF.stair);
  if (F.stair) {
    stairs.forEach(([pts, top], i) => {
      const shp = new T.Shape(pts.map(([x, y]) => new T.Vector2(X(x), -Z(y))));
      const eg = new T.ExtrudeGeometry(shp, { depth: 1, bevelEnabled: false }); eg.rotateX(-Math.PI / 2);
      const m = new T.Mesh(eg, [M.oak, M.wall]); m.castShadow = m.receiveShadow = true; grp.add(m);
      st.steps.push({ m, top, i });
    });
  }
  if (F.void) stairs.forEach(([pts, top]) => stepsTex.push([pts.map(([x, y]) => [x - off[0], y - off[1]]), clamp((HT.eg + HT.slab - top) / (HT.eg + HT.slab))]));
  /* Boden mit allem, was gemalt ist */
  const cv = floorCanvas(F, K, wallsPts, foot, stepsTex);
  const fm = new T.MeshStandardMaterial({ map: ctex(cv), roughness: .62, alphaTest: .5 });
  const pl = new T.Mesh(new T.PlaneGeometry(span[0] / K, span[1] / K), fm);
  pl.rotation.x = -Math.PI / 2; pl.position.set((X(cx0) + X(cx1)) / 2, .003, (Z(cy0) + Z(cy1)) / 2); pl.receiveShadow = true; grp.add(pl); st.plane = pl;
  /* Räume: Namen und Flächen */
  /* alles, was am Boden steht (auch Duschen, Glas, Hocker), dazu die Autos */
  const obst = (F.furn || []).filter(f => f[0] !== 'pendant').map(([, x, y, w, d]) => [x - 2, y - 2, x + w + 2, y + d + 2]);
  for (const [x, y, l, w, , dir] of F.cars || []) { const n = dir === 'n'; obst.push([x - (n ? w : l) / 2 - 2, y - (n ? l : w) / 2 - 2, x + (n ? w : l) / 2 + 2, y + (n ? l : w) / 2 + 2]); }
  if (F.stair) { const t = F.stair; obst.push([t.wind.rect[0], t.run1.y[0], Math.max(...t.run1.x, ...t.run2.x), t.run2.y[1]]); }
  if (F.void) obst.push(F.void);
  st.rooms = F.rooms.filter(r => r.n).map(r => {
    const area = r.r ? r.r.reduce((a, q) => a + (q[2] - q[0]) * (q[3] - q[1]), 0) / (K * K) : 0;
    const bb = r.r ? r.r.reduce((a, q) => [Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.max(a[2], q[2]), Math.max(a[3], q[3])], [1e9, 1e9, -1e9, -1e9]) : [r.at[0] - 40, r.at[1] - 40, r.at[0] + 40, r.at[1] + 40];
    /* Fläche, in die der Name passen muss: das Rechteck des Raums unter dem Namen (Teile eines Raums: 2,8 m rundum) */
    const fr = (r.r || []).find(q => r.at[0] >= q[0] && r.at[0] <= q[2] && r.at[1] >= q[1] && r.at[1] <= q[3]) || [r.at[0] - 40, r.at[1] - 40, r.at[0] + 40, r.at[1] + 40];
    /* Runde 37: der Name steht auf freiem Boden, nicht auf Möbeln, Autos oder der Treppe (wie auf einem Verkaufsplan) */
    const sp = clearSpot(fr, r.at, obst);
    return { n: r.n, list: r.list || r.n, part: !!r.part, area, out: !!r.out, pos: new T.Vector3(X(sp[0]), .05, Z(sp[1])), bb: [X(bb[0]), Z(bb[1]), X(bb[2]), Z(bb[3])], fit: [X(fr[0]), Z(fr[1]), X(fr[2]), Z(fr[3])], fi };
  });
  return st;
}

/* Freier Platz für einen Namen im Rechteck fr (Plan pt): der Punkt mit dem meisten Abstand zu Möbeln und Wänden,
   gemessen wie ein Kasten, der 2,6 mal so breit wie hoch ist (so liegt Schrift); bei Gleichstand näher am gewünschten Punkt at. */
function clearSpot(fr, at, obs) {
  const [x0, y0, x1, y1] = fr, in_ = obs.filter(o => o[0] < x1 && o[2] > x0 && o[1] < y1 && o[3] > y0);
  let best = at, bs = -1e9;
  for (let y = y0 + 6; y <= y1 - 6; y += 3) for (let x = x0 + 6; x <= x1 - 6; x += 3) {
    let c = Math.min(Math.min(x - x0, x1 - x) / 2.6, Math.min(y - y0, y1 - y));
    for (const o of in_) { const dx = Math.max(o[0] - x, 0, x - o[2]), dy = Math.max(o[1] - y, 0, y - o[3]); c = Math.min(c, Math.max(dx / 2.6, dy)); if (c <= 0) break; }
    const sc = Math.min(c, 16) - Math.hypot(x - at[0], y - at[1]) * .03;
    if (sc > bs) { bs = sc; best = [x, y]; }
  }
  return best;
}

/* Türöffnungen aus den Wandflächen: zwei Wandstücke auf derselben Linie mit einer Lücke von 0,78 bis 1,1 m, nichts dazwischen,
   nicht dort, wo schon ein Fenster oder eine Außentür ist. Das Blatt schlägt in den Raum auf, nicht in Flur, Eingang oder Wohnen. */
const CIRC = new Set(['Eingang', 'Wohnen']);
function doorGaps(F, W) {
  const out = [], win = (F.windows || []).map(w => w.slice(0, 4)), seen = new Set();
  const free = (q, a, b) => !W.some(c => c !== a && c !== b && c[0] < q[2] - 1 && c[2] > q[0] + 1 && c[1] < q[3] - 1 && c[3] > q[1] + 1);
  for (const a of W) for (const b of W) {
    if (a === b) continue;
    for (const ax of ['h', 'v']) {
      const h = ax === 'h', i0 = h ? 0 : 1, i1 = h ? 1 : 0;
      const ov = Math.min(a[i1 + 2], b[i1 + 2]) - Math.max(a[i1], b[i1]), gap = b[i0] - a[i0 + 2];
      if (ov <= 3 || gap < 22 || gap > 31.2) continue;
      const lo = Math.max(a[i1], b[i1]), hi = Math.min(a[i1 + 2], b[i1 + 2]);
      if (hi - lo > 16) continue;
      const q = h ? [a[2], lo, b[0], hi] : [lo, a[3], hi, b[1]];
      if (!free(q, a, b) || win.some(w => w[0] < q[2] + 2 && w[2] > q[0] - 2 && w[1] < q[3] + 2 && w[3] > q[1] - 2)) continue;
      const key = q.map(v => Math.round(v)).join(); if (seen.has(key)) continue; seen.add(key);
      out.push({ h, q, cx: (q[0] + q[2]) / 2, cy: (q[1] + q[3]) / 2 });
    }
  }
  const area = rm => rm.r.reduce((s, q) => s + (q[2] - q[0]) * (q[3] - q[1]), 0);
  const roomAt = (px, py) => {
    let best = null, rect = null;
    for (const rm of F.rooms) { if (!rm.r) continue; const q = rm.r.find(q => px >= q[0] && px <= q[2] && py >= q[1] && py <= q[3]); if (q && (!best || area(rm) < area(best))) { best = rm; rect = q; } }
    return best && { rm: best, rect, circ: CIRC.has(best.n) || (!best.n && best.f === 'eiche'), a: area(best) };
  };
  return out.map(d => {
    const p = 14, [x0, y0, x1, y1] = d.q;
    const sides = [-1, 1].map(s => ({ s, r: d.h ? roomAt(d.cx, s > 0 ? y1 + p : y0 - p) : roomAt(s > 0 ? x1 + p : x0 - p, d.cy) })).filter(o => o.r);
    if (!sides.length) return null;
    sides.sort((u, v) => (u.r.circ - v.r.circ) || (u.r.a - v.r.a));
    const { s, r } = sides[0], q = r.rect;
    /* Angel an dem Ende, das näher an einer Wand des Raums liegt; dort lehnt das offene Blatt */
    const e0 = d.h ? x0 - q[0] : y0 - q[1], e1 = d.h ? q[2] - x1 : q[3] - y1;
    return { ...d, s, hinge: e0 <= e1 ? 0 : 1 };
  }).filter(Boolean);
}
function doorLeaf(d, X, Z) {
  const g = new T.Group(), t = .045, H = 2.02, [x0, y0, x1, y1] = d.q;
  const len = ((d.h ? x1 - x0 : y1 - y0) / K) - .03;
  if (d.h) {
    const hx = X(d.hinge ? x1 : x0) + (d.hinge ? -t / 2 - .015 : t / 2 + .015), fz = Z(d.s > 0 ? y1 : y0);
    B(g, t, H, len, M.door, hx, 0, fz + d.s * len / 2);
    B(g, .1, .02, .02, M.steel, hx, 1, fz + d.s * (len - .08));
  } else {
    const hz = Z(d.hinge ? y1 : y0) + (d.hinge ? -t / 2 - .015 : t / 2 + .015), fx = X(d.s > 0 ? x1 : x0);
    B(g, len, H, t, M.door, fx + d.s * len / 2, 0, hz);
    B(g, .02, .02, .1, M.steel, fx + d.s * (len - .08), 1, hz);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

/* Treppe als Stufenflächen in Plan pt (Erdgeschoß) mit Oberkante in m: Lauf nach Westen, Wendel, Lauf nach Osten */
function stairPolys(sp) {
  const out = [], rise = (HT.eg + HT.slab) / 17; let k = 1;
  const run = r => { for (let i = 0; i + 1 < r.x.length; i++) { const a = r.x[i], b = r.x[i + 1]; out.push([[[a, r.y[0]], [b, r.y[0]], [b, r.y[1]], [a, r.y[1]]], rise * k++]); } };
  run(sp.run1);
  const [cx, cy] = sp.wind.c, [rx0, ry0, rx1, ry1] = sp.wind.rect, n = sp.wind.n;
  const hit = th => { const dx = Math.cos(th), dy = Math.sin(th); let t = 1e9; if (dx < -1e-6) t = Math.min(t, (rx0 - cx) / dx); if (dx > 1e-6) t = Math.min(t, (rx1 - cx) / dx); if (dy < -1e-6) t = Math.min(t, (ry0 - cy) / dy); if (dy > 1e-6) t = Math.min(t, (ry1 - cy) / dy); return [cx + dx * t, cy + dy * t]; };
  const corners = [[rx0, ry0], [rx0, ry1], [rx1, ry1], [rx1, ry0]].map(p => [p, Math.atan2(p[1] - cy, p[0] - cx)]);
  const norm = a => { while (a > -Math.PI / 2 + 1e-9) a -= Math.PI * 2; while (a <= -Math.PI / 2 - Math.PI * 2) a += Math.PI * 2; return a; };
  for (let i = 0; i < n; i++) {
    /* von Norden (−90°) über Westen nach Süden, die Winkel fallen */
    const a0 = -Math.PI / 2 - i * Math.PI / n, a1 = -Math.PI / 2 - (i + 1) * Math.PI / n;
    const pts = [[cx, cy], hit(a0)];
    corners.map(([p, a]) => [p, norm(a)]).filter(([, a]) => a < a0 && a > a1).sort((u, v) => v[1] - u[1]).forEach(([p]) => pts.push(p));
    pts.push(hit(a1));
    out.push([pts, rise * k++]);
  }
  run(sp.run2);
  return out;
}

/* Ein Fenster (oder Tür, Tor) in der Wandöffnung: Brüstung, Glas mit schwarzem Rahmen und Sprossen, Sturz bis zur Wandkrone */
function windowPart(grp, w, F, X, Z, skin, d) {
  const [x0, y0, x1, y1, sill, head, kind, o = {}] = w, alongX = (x1 - x0) > (y1 - y0);
  const len = (alongX ? x1 - x0 : y1 - y0) / K, th = (alongX ? y1 - y0 : x1 - x0) / K;
  const g2 = new T.Group(); g2.position.set((X(x0) + X(x1)) / 2, 0, (Z(y0) + Z(y1)) / 2); if (!alongX) g2.rotation.y = Math.PI / 2; grp.add(g2);
  /* außen: welche Seite (lokal −z oder +z) */
  const ou = F.out; let outZ = 0;
  if (alongX) { if (ou.y0.some(v => Math.abs(y0 - v) < 1)) outZ = -1; else if (ou.y1.some(v => Math.abs(y1 - v) < 1)) outZ = 1; }
  else { if (ou.x0.some(v => Math.abs(x0 - v) < 1)) outZ = 1; else if (ou.x1.some(v => Math.abs(x1 - v) < 1)) outZ = -1; }
  const wallBox = () => { const m = new T.Mesh(new T.BoxGeometry(1, 1, 1).translate(0, .5, 0), [M.wall, M.wall, M.cap, M.wall, M.wall, M.wall]); m.castShadow = m.receiveShadow = true; m.scale.set(len, 1, th); g2.add(m); return m; };
  const P = { sill: sill > 0 ? wallBox() : null, lin: wallBox(), parts: [] };
  if (outZ && skin) { P.sk1 = B(g2, len, 1, .035, skin, 0, 0, outZ * (th / 2 + .0175)); P.sk2 = B(g2, len, 1, .035, skin, 0, 0, outZ * (th / 2 + .0175)); }
  const fr = .055, fz = 0;
  if (kind === 'tor') {
    P.door = B(g2, len, 1, .06, M.anthrazit, 0, 0, outZ * (th / 2 - .05));
    P.grooves = [1, 2, 3, 4].map(() => B(g2, len, .012, .065, M.black, 0, 0, outZ * (th / 2 - .05)));
  } else {
    const leaf = kind === 'tuer' ? Math.min(1.1, len * .55) : 0;
    if (leaf) { P.door = B(g2, leaf, 1, .07, M.oak, -len / 2 + leaf / 2, 0, fz); P.handle = B(g2, .03, .5, .1, M.steel, -len / 2 + leaf - .1, 0, fz); }
    const gl = len - leaf, gx = -len / 2 + leaf + gl / 2;
    P.glass = B(g2, gl - fr, 1, .02, M.glass, gx, 0, fz); P.glass.castShadow = false;
    const sp = kind === 'schiebe' ? Math.max(1, Math.round(gl / 1.5)) : (o.sp || 0);
    const xs = [-len / 2 + fr / 2, len / 2 - fr / 2]; if (leaf) xs.push(-len / 2 + leaf + fr / 2);
    for (let i = 1; i <= sp; i++) xs.push(gx - gl / 2 + gl * i / (sp + 1));
    P.posts = xs.map(x => B(g2, fr, 1, .08, M.black, x, 0, fz));
    P.rb = B(g2, gl, fr, .08, M.black, gx, 0, fz); P.rt = B(g2, len, fr, .08, M.black, 0, 0, fz);
  }
  const part = (m, a, b) => { if (!m) return; const h = b - a; m.visible = h > .004; if (m.visible) { m.position.y = a; m.scale.y = h; } };
  /* W: Höhe der Wandkrone gerade jetzt */
  return {
    d, update(W) {
      const s = Math.min(sill, W), hd = Math.min(head, W);
      part(P.sill, 0, s); part(P.sk1, 0, sill > 0 ? s : 0);
      part(P.lin, head, W); part(P.sk2, head, W);
      if (kind === 'tor') { part(P.door, 0, hd); P.grooves.forEach((m, i) => { m.visible = hd > (i + 1) * .5; m.position.y = (i + 1) * .5; }); return; }
      part(P.door, 0, hd); if (P.handle) { P.handle.visible = W > 1.3; P.handle.position.y = .8; }
      part(P.glass, s, hd); P.posts.forEach(m => part(m, s, hd));
      if (P.rb) { P.rb.visible = W > s + fr && sill > 0; P.rb.position.y = s; }
      if (P.rt) { P.rt.visible = W >= head - .001; P.rt.position.y = head - fr; }
    }
  };
}

/* Satteldach über dem Obergeschoß, Giebel aus Glas über den Loggien */
function buildRoof(st, metal, larch) {
  const F = st.F, [x0, y0, x1, y1, Rh] = F.roof, X = st.X, Z = st.Z;
  const hw = (x1 - x0) / K / 2, ov = .45, s = Rh / hw, tv = .26, L = (y1 - y0) / K + .5;
  const shp = new T.Shape([new T.Vector2(-hw - ov, -ov * s), new T.Vector2(0, Rh), new T.Vector2(hw + ov, -ov * s), new T.Vector2(hw + ov, -ov * s + tv), new T.Vector2(0, Rh + tv), new T.Vector2(-hw - ov, -ov * s + tv)]);
  const geo = new T.ExtrudeGeometry(shp, { depth: L, bevelEnabled: false }); geo.translate(0, 0, -L / 2);
  const grp = new T.Group(); grp.position.set((X(x0) + X(x1)) / 2, HT.og, (Z(y0) + Z(y1)) / 2); st.g.add(grp);
  const roof = new T.Mesh(geo, [M.anthrazit, metal]); roof.castShadow = roof.receiveShadow = true; grp.add(roof);
  /* Untersicht in Lärche, knapp unter dem Blech */
  const und = new T.Shape([new T.Vector2(-hw - ov + .02, -ov * s + .015), new T.Vector2(0, Rh - .01), new T.Vector2(hw + ov - .02, -ov * s + .015), new T.Vector2(hw + ov - .02, -ov * s + .03), new T.Vector2(0, Rh + .005), new T.Vector2(-hw - ov + .02, -ov * s + .03)]);
  const ug = new T.ExtrudeGeometry(und, { depth: L - .04, bevelEnabled: false }); ug.translate(0, 0, -(L - .04) / 2);
  grp.add(new T.Mesh(ug, larch));
  /* Giebelfelder: Glas mit schwarzen Pfosten */
  (F.gables || []).forEach(gy => {
    const z = Z(gy) - grp.position.z, tri = new T.Shape([new T.Vector2(-hw, 0), new T.Vector2(hw, 0), new T.Vector2(0, Rh)]);
    const tg = new T.ExtrudeGeometry(tri, { depth: .02, bevelEnabled: false }); tg.translate(0, 0, -.01);
    const gm = new T.Mesh(tg, M.glass); gm.position.z = z; grp.add(gm);
    [-.5, 0, .5].forEach(f => { const hx = Math.abs(f) * hw, h = Rh * (1 - hx / hw); B(grp, .06, h, .09, M.black, f * hw, 0, z); });
    const bar = B(grp, hw * 2, .07, .1, M.black, 0, 0, z);
    [-1, 1].forEach(sg => { const len = Math.hypot(hw, Rh), e = B(grp, len, .07, .1, M.black, sg * hw / 2, Rh / 2 - .035, z); e.geometry = e.geometry; e.rotation.z = -sg * Math.atan2(Rh, hw); e.position.y = Rh / 2 - .035; });
  });
  grp.visible = false;
  return grp;
}

/* ---------- Zustand je Bild ---------- */

function apply() {
  const ext = E(S.ext, 0, 1);
  FL.forEach(st => {
    const fi = st.fi, b = fi ? S.og : S.eg, full = fi ? HT.og : HT.eg;
    st.g.visible = b > .001;
    if (!st.g.visible) return;
    const W0 = lerp(HT.cut, full, ext);
    st.base.forEach(m => { m.scale.y = Math.max(.001, .3 * E(b, 0, .12)); m.position.y = -.3 * E(b, 0, .12); });
    st.plane.visible = b > .05;
    const rimOn = b > .1 && S.ext < .5 && (!fi || S.lift < .02); st.rim.forEach(m => { m.visible = rimOn; });
    const grow = d => E(b, .08 + d * .3, .42 + d * .3);
    st.walls.forEach(w => { const h = (w.low ? 1 : W0) * grow(w.d); w.m.scale.y = Math.max(.001, h); w.m.visible = h > .003; });
    st.skins.forEach(w => { const h = (w.low ? 1 : W0) * grow(w.d); w.m.scale.y = Math.max(.001, h); w.m.visible = h > .003; });
    st.wins.forEach(w => w.update(W0 * grow(w.d)));
    const Ws = W0 * E(b, .2, .6);
    st.steps.forEach(s => { const v = s.top <= Ws + .002; s.m.visible = v; if (v) s.m.scale.y = s.top; });
    st.furn.forEach(o => { const e = E(b, .48 + o.d * .3, .68 + o.d * .3); o.m.scale.y = Math.max(.001, e); o.m.visible = e > .003; });
    if (fi) {
      /* Obergeschoß: steht allein am Boden oder sitzt auf der Decke; beim Umsetzen hebt es weich ab */
      st.g.position.y = S.lift * (HT.eg + HT.slab) + Math.sin(Math.PI * clamp(S.lift)) * .6 * (S.lift < 1 ? 1 : 0);
      ROOF.visible = S.roof > .002;
      if (ROOF.visible) { const r = E(S.roof, 0, 1); ROOF.position.y = HT.og * lerp(1, 1, r) + (1 - r) * 4; ROOF.scale.setScalar(1); }
    }
  });
  const sl = E(S.slab, 0, 1); EGSLAB.visible = sl > .002 && S.eg > .5; EGSLAB.scale.y = Math.max(.001, HT.slab * sl);
}

/* ---------- Tweens und Abläufe ---------- */

const set = (k, v) => { anims = anims.filter(a => { if (a.k === k) { a.res(); return false; } return true; }); S[k] = v; shadowDirty = true; kick(); };
function tween(k, to, dur) {
  anims = anims.filter(a => { if (a.k === k) { a.res(); return false; } return true; });
  if (reduce || Math.abs(S[k] - to) < 1e-4) { S[k] = to; shadowDirty = true; kick(); return Promise.resolve(); }
  return new Promise(res => { anims.push({ k, from: S[k], to, t0: performance.now(), dur: dur * 1000 * Math.min(1, Math.abs(S[k] - to) * 1.2 + .25), res }); kick(); });
}
const all = (...p) => Promise.all(p);

async function setMode(m, opt = {}) {
  const my = ++seq, ok = () => my === seq;
  mode = m; focus = null; syncUI(); reframe(true);
  if (m === 'eg') {
    await tween('roof', 0, .45); if (!ok()) return;
    if (S.og > 0) { await tween('og', 0, .55); if (!ok()) return; }
    set('lift', 1); set('slab', 0);
    await all(tween('ext', 0, .6), tween('eg', 1, 1.1));
  } else if (m === 'og') {
    await tween('roof', 0, .45); if (!ok()) return;
    if (S.og > .5 && S.lift > .5) {
      await all(tween('slab', 0, .4), tween('ext', 0, .6)); if (!ok()) return;
      await tween('eg', 0, .7); if (!ok()) return;
      await tween('lift', 0, .9);
    } else {
      if (S.eg > 0) { await tween('eg', 0, .55); if (!ok()) return; }
      set('lift', 0); set('slab', 0);
      await all(tween('og', 1, 1.1), tween('ext', 0, .5));
    }
  } else {
    if (opt.build) {
      set('eg', 0); set('og', 0); set('slab', 0); set('roof', 0); set('lift', 1); set('ext', 1);
      announce('Das Haus wird gebaut: erst das Erdgeschoß, dann die Decke, das Obergeschoß und das Dach.');
      await tween('eg', 1, 3.2); if (!ok()) return;
      await tween('slab', 1, .9); if (!ok()) return;
      await tween('og', 1, 2.8); if (!ok()) return;
      await tween('roof', 1, 1.4); if (!ok()) return;
      announce('Fertig gebaut. Das ganze Haus, Concept ' + HOUSE.name + '.');
      return;
    }
    if (S.og > .5 && S.lift < .5) {
      await all(tween('lift', 1.3, .8), tween('ext', 1, .8)); if (!ok()) return;
      await tween('eg', 1, 1.1); if (!ok()) return;
      await tween('slab', 1, .5); if (!ok()) return;
      await tween('lift', 1, .55);
    } else {
      if (S.eg < 1) { await tween('eg', 1, 1); if (!ok()) return; }
      await tween('ext', 1, .8); if (!ok()) return;
      await tween('slab', 1, .5); if (!ok()) return;
      set('lift', 1);
      await tween('og', 1, 1.2);
    }
    if (!ok()) return;
    await tween('roof', 1, .9);
  }
}

/* ---------- Kamera ---------- */

function modeBox(m) {
  const eg = [(EGF.house[0] - ORX) / K, (196.8 - ORY) / K, (EGF.house[2] - ORX) / K, (683.8 - ORY) / K];
  const og = [(552.5 - ORX) / K, (196.8 - ORY) / K, (779.4 - ORX) / K, (683.8 - ORY) / K];
  const b = m === 'og' ? og : eg, y1 = m === 'haus' ? TOP : HT.cut;
  return { b, y0: -.3, y1 };
}
function corners(bx) { const o = []; [bx.b[0], bx.b[2]].forEach(x => [bx.y0, bx.y1].forEach(y => [bx.b[1], bx.b[3]].forEach(z => o.push(new T.Vector3(x, y, z))))); return o; }
function insets() { return host && host.insets ? host.insets() : { t: 8, b: 8, l: 8, r: 8 }; }
function place(o, at = cam) {
  at.position.set(o.t.x + Math.sin(o.az) * Math.cos(o.el) * o.dist, o.t.y + Math.sin(o.el) * o.dist, o.t.z + Math.cos(o.az) * Math.cos(o.el) * o.dist);
  at.lookAt(o.t);
}
function fitDist(bx, az, el, t) {
  const W = host.el.clientWidth || 1, H = host.el.clientHeight || 1, I = insets();
  const mx = Math.max(.2, (W - I.l - I.r) / W), my = Math.max(.2, (H - I.t - I.b) / H);
  cam.clearViewOffset(); cam.aspect = W / H; cam.updateProjectionMatrix();
  const P = corners(bx), v = new T.Vector3(); let lo = 2, hi = 300;
  for (let i = 0; i < 22; i++) {
    const d = (lo + hi) / 2; place({ az, el, dist: d, t }); cam.updateMatrixWorld();
    let o = 0; P.forEach(p => { v.copy(p).project(cam); o = Math.max(o, Math.abs(v.x) / mx, Math.abs(v.y) / my, v.z > 1 ? 9 : 0); });
    if (o > 1) lo = d; else hi = d;
  }
  return hi;
}
/* Runde 37: Grundriss von oben wie ein Verkaufsplan (Norden oben, leicht perspektivisch); „3D Ansicht“ kippt ihn schräg */
const DEF = { plan: [0, 1.5], tilt: [-.32, .98], tiltTall: [-.14, 1.12], haus: [-.62, .42] };
function reframe(anim) {
  if (!host || !cam) return;
  box = modeBox(mode);
  const tall = (host.el.clientHeight || 1) > (host.el.clientWidth || 1) * 1.05;
  const [az, el] = mode === 'haus' ? DEF.haus : tilt ? (tall ? DEF.tiltTall : DEF.tilt) : DEF.plan;
  const t = new T.Vector3((box.b[0] + box.b[2]) / 2, mode === 'haus' ? TOP * .38 : .5, (box.b[1] + box.b[3]) / 2);
  fitD = fitDist(box, az, el, t);
  g.az = az; g.el = el; g.dist = fitD; g.t.copy(t); vel = 0;
  if (!anim || reduce) { c.az = g.az; c.el = g.el; c.dist = g.dist; c.t.copy(g.t); }
  kick();
}
function focusRoom(rm) {
  if (rm.fi !== (mode === 'og' ? 1 : 0) || mode === 'haus') setMode(rm.fi ? 'og' : 'eg').then(() => focusRoom(rm));
  focus = rm;
  const [x0, z0, x1, z1] = rm.bb, pad = .6;
  const bx = { b: [x0 - pad, z0 - pad, x1 + pad, z1 + pad], y0: 0, y1: 1 };
  const t = new T.Vector3((x0 + x1) / 2, .3, (z0 + z1) / 2), el = Math.max(c.el, .95);
  g.dist = Math.max(fitD * .18, fitDist(bx, c.az, el, t)); g.el = el; g.az = c.az; g.t.copy(t); vel = 0;
  if (reduce) { c.el = g.el; c.dist = g.dist; c.t.copy(g.t); }
  announce(rm.list + (rm.area && !rm.part ? ', ' + fmtA(rm.area) : ''));
  kick();
}

/* ---------- Bild ---------- */

function kick() { if (!raf && R) { last = performance.now(); raf = requestAnimationFrame(frame); } }
function frame(now) {
  raf = 0;
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  let busy = false;
  anims = anims.filter(a => {
    const p = a.dur ? clamp((now - a.t0) / a.dur) : 1; S[a.k] = lerp(a.from, a.to, p);
    shadowDirty = true; if (p >= 1) { a.res(); return false; } busy = true; return true;
  });
  if (!dragging && Math.abs(vel) > .01) { g.az += vel * dt; vel *= Math.pow(.008, dt); busy = true; }
  const f = reduce ? 1 : 1 - Math.pow(dragging ? 1e-7 : .0012, dt);
  const before = c.az + c.el + c.dist + c.t.x + c.t.y + c.t.z;
  c.az += (g.az - c.az) * f; c.el += (g.el - c.el) * f; c.dist += (g.dist - c.dist) * f; c.t.lerp(g.t, f);
  if (Math.abs(before - (c.az + c.el + c.dist + c.t.x + c.t.y + c.t.z)) > 1e-4) busy = true;
  render();
  if (busy) raf = requestAnimationFrame(frame);
}
function render() {
  if (!host) return;
  const W = host.el.clientWidth || 1, H = host.el.clientHeight || 1, I = insets();
  apply();
  cam.aspect = W / H;
  /* im Obergeschoß folgt der Blick dem Geschoß, solange es noch auf dem Erdgeschoß sitzt oder sich senkt */
  const yo = mode === 'og' ? S.lift * (HT.eg + HT.slab) : 0; TV.copy(c.t); TV.y += yo; place({ az: c.az, el: c.el, dist: c.dist, t: TV });
  cam.setViewOffset(W, H, (I.r - I.l) / 2, (I.b - I.t) / 2, W, H); cam.updateProjectionMatrix();
  /* Sonne von Nordwesten, fest über der Mitte des Hauses */
  sun.position.set(-14, 26, -9); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  if (shadowDirty) { R.shadowMap.needsUpdate = true; shadowDirty = false; }
  R.render(scene, cam);
  labels(W, H);
}

/* Namen der Räume (Runde 36, fürs Telefon): ein Name steht nur dort, wo er in seinen Raum passt, nicht über einem anderen Namen
   und nicht unter der Bedienung. Passt er an seinem Platz nicht, rückt er zur Mitte des Raums; passt er dann noch nicht,
   steht nur der Name ohne Fläche, sonst gar nichts. Näher heran zeigt mehr. Der gewählte Raum steht immer da (gelb). */
const LV = new T.Vector3();
const scr = (x, y, z, o, W, H) => { LV.set(x + o.x, y + o.y, z + o.z).project(cam); return [(LV.x + 1) / 2 * W, (1 - LV.y) / 2 * H, LV.z]; };
function inQuad(Q, px, py) {
  let s = 0;
  for (let i = 0; i < Q.length; i++) {
    const a = Q[i], b = Q[(i + 1) % Q.length], c = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
    if (Math.abs(c) > 1e-6) { const g = Math.sign(c); if (s && g !== s) return false; s = g; }
  }
  return true;
}
const hits = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
function measure(r) {
  const el = r.el, b = el.querySelector('b'), cs = getComputedStyle(el);
  el.classList.remove('is-compact');
  const px = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight), py = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const full = [el.offsetWidth, el.offsetHeight, false], name = [b.offsetWidth + px, b.offsetHeight + py, true];
  r.sz = r.part || !r.area ? [name] : [full, name];
}
function labels(W, H) {
  if (!labsEl) return;
  const show = labelsOn && S.ext < .05 && mode !== 'haus', taken = [], blk = host.block ? host.block() : [];
  /* von oben stehen die Namen als Schrift auf dem Boden; schräg (3D) kämen sie über die Wände, dort mit schwarzem Feld */
  labsEl.classList.toggle('is-plate', c.el < 1.3);
  const all = FL.flatMap(st => st.rooms.map(r => ({ r, st })));
  all.sort((a, b) => (b.r === focus) - (a.r === focus) || (b.r.part ? 6 : b.r.area) - (a.r.part ? 6 : a.r.area));
  for (const { r, st } of all) {
    const el = r.el; if (!el) continue;
    const bld = st.fi ? S.og : S.eg, op = show ? E(bld, .86, 1) : 0;
    if (op <= .01 || !st.g.visible) { el.style.opacity = '0'; continue; }
    const o = st.g.position, [x, y, z] = scr(r.pos.x, r.pos.y, r.pos.z, o, W, H);
    if (z > 1) { el.style.opacity = '0'; continue; }
    const [f0, f1, f2, f3] = r.fit, Q = [[f0, f1], [f2, f1], [f2, f3], [f0, f3]].map(([a, b]) => scr(a, .05, b, o, W, H));
    const cx = (Q[0][0] + Q[1][0] + Q[2][0] + Q[3][0]) / 4, cy = (Q[0][1] + Q[1][1] + Q[2][1] + Q[3][1]) / 4;
    if (!r.sz) measure(r);
    let best = null;
    for (const [w, h, cmp] of r.sz) {
      for (const t of [0, .35, .7, 1]) {
        const px = x + (cx - x) * t, py = y + (cy - y) * t, bx = [px - w / 2, py - h / 2, px + w / 2, py + h / 2];
        if (bx[0] < 4 || bx[1] < 4 || bx[2] > W - 4 || bx[3] > H - 4) continue;
        if (blk.some(q => hits(bx, q))) continue;
        if (taken.some(q => hits([bx[0] - 3, bx[1] - 3, bx[2] + 3, bx[3] + 3], q))) continue;
        /* darf etwas über die Wand ragen, aber nicht in den nächsten Raum */
        const sx = w * .05, sy = h * .1;
        if (![[bx[0] + sx, bx[1] + sy], [bx[2] - sx, bx[1] + sy], [bx[2] - sx, bx[3] - sy], [bx[0] + sx, bx[3] - sy]].every(([a, b]) => inQuad(Q, a, b))) continue;
        best = [px, py, bx, cmp]; break;
      }
      if (best) break;
    }
    if (!best && r === focus) { const [w, h] = r.sz[0]; best = [x, y, [x - w / 2, y - h / 2, x + w / 2, y + h / 2], false]; }
    if (!best) { el.style.opacity = '0'; continue; }
    taken.push(best[2]);
    el.classList.toggle('is-compact', best[3]); el.classList.toggle('is-on', r === focus);
    el.style.opacity = op.toFixed(2);
    el.style.transform = `translate3d(${best[0].toFixed(1)}px,${best[1].toFixed(1)}px,0) translate(-50%,-50%)`;
  }
}

/* ---------- Bühne: Seite oder Vollbild ---------- */

function attach(h) {
  host = h;
  h.el.prepend(R.domElement); h.el.appendChild(labsEl);
  R.setPixelRatio(Math.min(devicePixelRatio || 1, h.dpr));
  const fit = () => { R.setSize(h.el.clientWidth || 1, h.el.clientHeight || 1, false); FL.forEach(st => st.rooms.forEach(r => { r.sz = null; })); reframe(false); render(); };
  /* Schrift geladen: Namen neu messen */
  if (document.fonts && !attach.f) { attach.f = 1; document.fonts.ready.then(() => { FL.forEach(st => st.rooms.forEach(r => { r.sz = null; })); kick(); }); }
  if (attach.ro) attach.ro.disconnect();
  attach.ro = new ResizeObserver(fit); attach.ro.observe(h.el);
  fit();
}

/* Ansage: im Vollbild die Region im Dialog (alles andere ist dann inert), sonst die auf der Seite */
function announce(t) { const l = lives.find(x => (dlgEl && dlgEl.open) === !!x.closest('dialog')); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = t; }, 30); } }

/* ---------- Bedienung ---------- */

let UI = {};
function syncUI() {
  document.querySelectorAll('[data-gr-mode]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.grMode === mode));
  });
  const name = mode === 'og' ? OGF.name : mode === 'haus' ? 'Ganzes Haus' : EGF.name;
  if (UI.floor) UI.floor.textContent = name;
  if (UI.top) { UI.top.disabled = mode === 'haus'; UI.top.setAttribute('aria-pressed', String(tilt && mode !== 'haus')); }
  const n = mode === 'haus' ? 0 : FL[mode === 'og' ? 1 : 0].rooms.filter(r => !r.part).length;
  const desc = `Concept ${HOUSE.name}, ${name} als 3D Modell` + (n ? `, ${n} Räume. Die Räume mit Fläche stehen in der Liste Räume.` : '. Erdgeschoß in Stein, Obergeschoß in Lärche, Satteldach.');
  document.querySelectorAll('[data-gr-desc]').forEach(el => el.setAttribute('aria-label', desc));
  if (UI.rooms && !UI.rooms.hidden) fillRooms();
}
function fillRooms() {
  const list = UI.roomList; list.textContent = '';
  const fis = mode === 'haus' ? [0, 1] : [mode === 'og' ? 1 : 0];
  UI.roomTitle.textContent = mode === 'haus' ? 'Alle Räume' : 'Räume im ' + (mode === 'og' ? OGF.name : EGF.name);
  fis.forEach(fi => {
    if (fis.length > 1) { const h = document.createElement('li'); h.className = 'grv__sub info'; h.textContent = HOUSE.floors[fi].name; list.appendChild(h); }
    FL[fi].rooms.filter(r => !r.part).forEach(r => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.className = 'grv__room';
      b.innerHTML = `<span>${r.list}</span><span class="grv__a">${fmtA(r.area)}</span>`;
      b.addEventListener('click', () => { closeRooms(); focusRoom(r); });
      li.appendChild(b); list.appendChild(li);
    });
  });
}
function openRooms() { fillRooms(); UI.rooms.hidden = false; kick(); UI.roomsBtn.setAttribute('aria-expanded', 'true'); UI.rooms.querySelector('button').focus(); }
function closeRooms(back = true) { if (UI.rooms.hidden) return; UI.rooms.hidden = true; kick(); UI.roomsBtn.setAttribute('aria-expanded', 'false'); if (back) UI.roomsBtn.focus(); }

function gestures(el) {
  const P = new Map(); let p0 = null, lastTap = 0, moved = 0, lastMove = 0;
  const wpp = () => 2 * c.dist * Math.tan(cam.fov * Math.PI / 360) / (host.el.clientHeight || 1);
  const pan = (dx, dy) => {
    const k = wpp(), rx = Math.cos(c.az), rz = -Math.sin(c.az), fx = -Math.sin(c.az), fz = -Math.cos(c.az), sy = 1 / Math.max(.35, Math.sin(c.el));
    g.t.x += -rx * dx * k + fx * dy * k * sy; g.t.z += -rz * dx * k + fz * dy * k * sy;
    const b = box.b; g.t.x = clamp(g.t.x, b[0] - 2, b[2] + 2); g.t.z = clamp(g.t.z, b[1] - 2, b[3] + 2);
  };
  const zoom = f => { g.dist = clamp(g.dist * f, fitD * .16, fitD * 1.8); };
  const untop = () => { if (tilt) { tilt = false; syncUI(); } };
  const snap = () => { const v = [...P.values()]; if (v.length >= 2) { const [a, b] = v; return { two: true, d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; } if (v.length === 1) return { two: false, x: v[0].x, y: v[0].y, t: performance.now() }; return null; };
  el.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    el.setPointerCapture(e.pointerId); P.set(e.pointerId, { x: e.clientX, y: e.clientY, btn: e.button, shift: e.shiftKey || e.ctrlKey || e.metaKey });
    p0 = snap(); moved = 0; dragging = true; vel = 0; hideHint();
  });
  el.addEventListener('pointermove', e => {
    if (!P.has(e.pointerId)) return;
    const pt = P.get(e.pointerId), dx = e.clientX - pt.x, dy = e.clientY - pt.y, now = e.timeStamp || performance.now(), et = Math.max(8, now - (pt.t || now - 16)) / 1000; pt.x = e.clientX; pt.y = e.clientY; pt.t = now;
    moved += Math.abs(dx) + Math.abs(dy);
    const s = snap();
    if (s && s.two && p0 && p0.two) { zoom(p0.d / s.d); pan(s.mx - p0.mx, s.my - p0.my); }
    else if (s && !s.two) {
      if (pt.btn === 2 || pt.shift) pan(dx, dy);
      else { g.az -= dx * .0075; g.el = clamp(g.el + dy * .0055, .1, 1.53); vel = lerp(vel, -dx * .0075 / et, .5); if (Math.abs(dy) > 1) untop(); if (Math.abs(dx) > 1) untop(); }
    }
    p0 = s; lastMove = performance.now(); kick();
  });
  const up = e => {
    if (!P.has(e.pointerId)) return; P.delete(e.pointerId); p0 = snap();
    if (!P.size) {
      dragging = false; vel = performance.now() - (lastMove || 0) > 90 ? 0 : clamp(vel, -2.2, 2.2);
      if (moved < 8) {
        const now = performance.now();
        if (now - lastTap < 320) { lastTap = 0; dbl(e.clientX, e.clientY); } else lastTap = now;
      } else lastTap = 0;
      kick();
    }
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(e.deltaY * (e.deltaMode ? .05 : .0015))); hideHint(); kick(); }, { passive: false });
  /* doppelt tippen: dorthin heranzoomen, nochmal: zurück zum Ganzen */
  const dbl = (x, y) => {
    if (g.dist < fitD * .55) { reframe(true); return; }
    const r = el.getBoundingClientRect(), ndc = new T.Vector2((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    const rc = new T.Raycaster(); rc.setFromCamera(ndc, cam);
    const pl = new T.Plane(new T.Vector3(0, 1, 0), mode === 'og' ? -(S.lift * (HT.eg + HT.slab)) : 0), hit = new T.Vector3();
    if (rc.ray.intersectPlane(pl, hit)) { g.t.set(clamp(hit.x, box.b[0], box.b[2]), .3, clamp(hit.z, box.b[1], box.b[3])); zoom(.42); kick(); }
  };
  /* Tastatur auf der Bühne */
  el.addEventListener('keydown', e => {
    const k = e.key; let used = true;
    if (e.shiftKey && /^Arrow/.test(k)) pan(k === 'ArrowLeft' ? 40 : k === 'ArrowRight' ? -40 : 0, k === 'ArrowUp' ? 40 : k === 'ArrowDown' ? -40 : 0);
    else if (k === 'ArrowLeft') { g.az += .2; untop(); } else if (k === 'ArrowRight') { g.az -= .2; untop(); }
    else if (k === 'ArrowUp') g.el = clamp(g.el + .1, .1, 1.53); else if (k === 'ArrowDown') g.el = clamp(g.el - .1, .1, 1.53);
    else if (k === '+' || k === '=') zoom(.8); else if (k === '-' || k === '_') zoom(1.25);
    else if (k === '0' || k === 'Home') reframe(true);
    else used = false;
    if (used) { e.preventDefault(); hideHint(); kick(); }
  });
  return { zoom, turn: a => { g.az += a; untop(); kick(); } };
}
function hideHint() { if (UI.hint && !UI.hint.classList.contains('is-off')) { UI.hint.classList.add('is-off'); kick(); } }

/* Geschoß wählen: drei Knöpfe, gedrückt ist das gezeigte (aria-pressed); nochmal drücken zeigt wieder alles */
function tabs(list) {
  list.querySelectorAll('[data-gr-mode]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.grMode === mode && !anims.length) { tilt = false; syncUI(); reframe(true); return; }
    setMode(b.dataset.grMode); announce(b.getAttribute('aria-label') || b.textContent);
  }));
}

export async function initGrundriss() {
  const root = document.querySelector('[data-gr]'); if (!root) return;
  const inl = root.querySelector('[data-gr-stage]'), dlg = document.querySelector('[data-grv]');
  lives = [...document.querySelectorAll('[data-gr-live]')]; dlgEl = dlg;
  /* erst bauen, wenn der Grundriss in die Nähe kommt */
  await new Promise(res => { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); res(); } }, { rootMargin: '900px 0px' }); io.observe(root); });
  try {
    stage();
  } catch (e) {
    console.warn('Grundriss 3D nicht möglich', e);
    root.classList.add('is-fallback'); return;
  }
  labsEl = document.createElement('div'); labsEl.className = 'gr-labs'; labsEl.setAttribute('aria-hidden', 'true');
  FL.forEach(st => st.rooms.forEach(r => {
    const el = document.createElement('span'); el.className = 'gr-lab';
    el.innerHTML = `<b>${r.n}</b>` + (r.part || !r.area ? '' : `<i>${fmtA(r.area)}</i>`);
    labsEl.appendChild(el); r.el = el;
  }));
  root.classList.add('is-ready');
  window.__gr = { R, scene, S, FL, c, g };
  const INL = { el: inl, dpr: 1.5, insets: () => ({ t: 14, b: 14, l: 10, r: 10 }) };
  attach(INL);
  /* Anfang: das Erdgeschoß baut sich auf, sobald es zu sehen ist */
  const io2 = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io2.disconnect(); setMode('eg'); } }, { threshold: .3 }); io2.observe(inl);
  root.querySelectorAll('.gr__tabs').forEach(tabs);
  /* Vollbild */
  UI = {
    floor: dlg.querySelector('[data-grv-floor]'), top: dlg.querySelector('[data-grv-top]'), hint: dlg.querySelector('[data-grv-hint]'),
    rooms: dlg.querySelector('[data-grv-rooms]'), roomsBtn: dlg.querySelector('[data-grv-rooms-btn]'), roomList: dlg.querySelector('[data-grv-list]'), roomTitle: dlg.querySelector('[data-grv-rooms-title]')
  };
  dlg.querySelectorAll('.grv__tabs').forEach(tabs);
  const stageEl = dlg.querySelector('[data-grv-stage]'), ctl = gestures(stageEl);
  const DLG = {
    el: stageEl, dpr: 2, insets: () => {
      const tp = dlg.querySelector('.grv__top'), bt = dlg.querySelector('.grv__bottom'), sd = dlg.querySelector('.grv__side');
      const wide = stageEl.clientWidth >= 820, bh = bt ? bt.offsetHeight : 140;
      dlg.style.setProperty('--grv-bottom', bh + 'px');
      return { t: (tp ? tp.offsetHeight : 60) + 8, b: wide ? bh + 40 : bh + 10, l: wide ? 40 : 10, r: wide ? (sd ? sd.offsetWidth : 48) + 56 : 14 };
    },
    /* Flächen der Bedienung über dem Bild: dort steht kein Raumname */
    block: () => {
      const s0 = stageEl.getBoundingClientRect();
      return [...dlg.querySelectorAll('.grv__top,.grv__bottom,.grv__side,.grv__rooms:not([hidden]),.grv__hint:not(.is-off)')].map(e => { const q = e.getBoundingClientRect(); return [q.left - s0.left - 4, q.top - s0.top - 4, q.right - s0.left + 4, q.bottom - s0.top + 4]; });
    }
  };
  let opener = null;
  const open = e => {
    opener = e && e.currentTarget; if (dlg.open) return;
    dlg.showModal(); document.documentElement.classList.add('grv-open');
    attach(DLG); syncUI();
    UI.hint.classList.remove('is-off'); clearTimeout(open.t); open.t = setTimeout(hideHint, 6000);
    history.pushState({ grv: 1 }, '');
    announce(`Großansicht. ${mode === 'og' ? OGF.name : mode === 'haus' ? 'Ganzes Haus' : EGF.name}. Ein Finger dreht, zwei Finger zoomen.`);
  };
  const close = (fromPop) => {
    if (!dlg.open) return;
    closeRooms(false); dlg.close();
  };
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('grv-open'); tilt = false;
    attach(INL); reframe(false); syncUI();
    if (history.state && history.state.grv) history.back();
    if (opener) opener.focus({ preventScroll: true });
  });
  addEventListener('popstate', () => { if (dlg.open) { dlg.close(); } });
  root.querySelectorAll('[data-gr-open]').forEach(b => b.addEventListener('click', open));
  dlg.querySelector('[data-grv-close]').addEventListener('click', () => close());
  dlg.addEventListener('cancel', e => { if (!UI.rooms.hidden) { e.preventDefault(); closeRooms(); } });
  dlg.querySelector('[data-grv-build]').addEventListener('click', () => { tilt = false; setMode('haus', { build: true }); });
  UI.top.addEventListener('click', () => { tilt = !tilt; syncUI(); reframe(true); announce(tilt ? '3D Ansicht, schräg von oben.' : 'Grundriss von oben, Norden oben.'); });
  UI.roomsBtn.addEventListener('click', () => (UI.rooms.hidden ? openRooms() : closeRooms()));
  dlg.querySelector('[data-grv-rooms-done]').addEventListener('click', () => closeRooms());
  dlg.querySelectorAll('[data-grv-zoom]').forEach(b => b.addEventListener('click', () => { ctl.zoom(Number(b.dataset.grvZoom)); hideHint(); kick(); }));
  dlg.querySelectorAll('[data-grv-turn]').forEach(b => b.addEventListener('click', () => { ctl.turn(Number(b.dataset.grvTurn) * Math.PI / 8); hideHint(); }));
  syncUI();
}

initGrundriss();
