/* Runde 35: Grundriss fürs Telefon, realistisch (free-grundriss.html). Kundenwunsch: am Telefon einfacher und zugänglicher,
   näher am Desktop, realistischer (Holzboden, Fliesen, echte Möbel), mit Umsehen, Haus bauen und Geschoß wechseln, Raumnamen
   wie auf einem Verkaufsplan, groß als Vollbild.
   Auf der Seite: das Modell als ruhiges Bild (kein Wischen, die Seite scrollt normal), darunter EG, OG, Ganzes Haus und
   „Grundriss öffnen“. Groß (dialog): ein Finger dreht, zwei Finger zoomen und schieben, doppelt tippen zoomt hinein; dazu
   Knöpfe für alles (drehen, zoomen, von oben, Räume, Haus bauen), eine Liste der Räume mit Fläche, Tastatur, Ansage.
   Runde 39: alle Häuser (grundrisse.html, Bold, Calm, Light, Free). Jedes Haus ist eine eigene Welt (Szene, Geschoße, Dächer,
   Raumnamen) aus data/grundriss-<haus>.js, gebaut erst, wenn seine Karte in die Nähe kommt; höchstens zwei oder drei Welten
   bleiben im Speicher. Ein WebGL Bild für alles: die Leinwand wandert zur Karte, die am meisten zu sehen ist, und ins Vollbild;
   die Karte, die sie verlässt, behält ein Standbild. Bis dahin zeigt jede Karte ein vorgerechnetes Bild (Poster).
   Gezeichnet wird nur, wenn sich etwas bewegt. */
import * as T from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { PLAN_GEO } from '../data/plan-geo.js';
import { floorCanvas, stoneCanvas, larchCanvas, roofCanvas, gravelCanvas, limeCanvas, woodLightCanvas, battenCanvas, brickCanvas, darkCanvas, tileRoofCanvas, setPPM } from './grundriss-tex.js';
import { M, B, BUILD, pendant, car, UBOX, isShared, share } from './grundriss-moebel.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Telefon oder wenig Speicher: Böden mit weniger Pixeln, höchstens zwei Häuser zugleich */
const SMALL = matchMedia('(max-width: 819px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
if (SMALL) setPPM(72);
const MAXW = SMALL ? 2 : 3;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const E = (p, a, b) => ease(clamp((p - a) / (b - a)));
const FACE = { s: 0, n: Math.PI, o: Math.PI / 2, w: -Math.PI / 2 };
const OPP = { n: 's', s: 'n', o: 'w', w: 'o' };
const U4 = rs => rs.reduce((a, r) => [Math.min(a[0], r[0]), Math.min(a[1], r[1]), Math.max(a[2], r[2]), Math.max(a[3], r[3])], [1e9, 1e9, -1e9, -1e9]);
/* Flächen: amtlich (DIN 277, Light) genau mit Komma, sonst gerechnet und gerundet mit „ca.“ */
const fmtA = r => r.a ? r.a.toFixed(2).replace('.', ',') + ' m²' : 'ca. ' + Math.round(r.area) + ' m²';
/* Endzustand je Ansicht (für Wechsel ohne Bewegung) */
const FINAL = {
  eg: { eg: 1, og: 0, ext: 0, slab: 0, roof: 0, lift: 1 },
  og: { eg: 0, og: 1, ext: 0, slab: 0, roof: 0, lift: 0 },
  haus: { eg: 1, og: 1, ext: 1, slab: 1, roof: 1, lift: 1 }
};

/* Gebunden an das Haus, das gerade gezeigt wird (bind) */
let W = null, HOUSE, K, HT, EGF, OGF, ORX, ORY, TOP, scene, FL = [], S = {}, ROOFS = [], SLABS = [], labsEl = null;
let mode = 'eg', tilt = false;
const WORLDS = new Map(), LAST = {}, LOADS = {};
/* Für alle Häuser gleich */
let R, cam, sun, hemi, ENV, raf = 0, last = 0, host = null, CUR = null, dlgEl = null;
let shadowDirty = true, anims = [], seq = 0, labelsOn = true, focus = null, dragging = false;
/* Kamera: gezeigt (c) und Ziel (g); Azimut, Höhe, Abstand, Zielpunkt */
const c = { az: -.32, el: .98, dist: 30, t: new T.Vector3() }, g = { az: -.32, el: .98, dist: 30, t: new T.Vector3() };
let fitD = 30, box = null, vel = 0; const TV = new T.Vector3();
/* Runde 38: Übergang Karte zu Vollbild (morph) und der Hinweis auf zwei Finger (cue) */
let morph = null, cueT = 0, cueN = 0, two = false;
try { two = localStorage.getItem('gr-two') === '1'; } catch (e) { /* ohne Speicher: Hinweis bei jedem Öffnen */ }

/* ---------- Materialien für alle Häuser ---------- */

function worldUV(mat, s) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uWS = { value: s };
    sh.vertexShader = 'uniform float uWS;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n{ vec4 gw = modelMatrix * vec4( transformed, 1.0 ); vMapUv = vec2( ( gw.x + gw.z ) * uWS, gw.y * uWS ); }');
  };
  return mat;
}
/* Bild liegt flach auf (Kies, Decken) */
function groundUV(mat, s) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uGS = { value: s };
    sh.vertexShader = 'uniform float uGS;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n{ vec4 gw = modelMatrix * vec4( transformed, 1.0 ); vMapUv = vec2( gw.x * uGS, gw.z * uGS ); }');
  };
  return mat;
}
const ctex = (cv, rep) => { const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; } return t; };
const SKIN = {};
const env = m => { if (m.isMeshStandardMaterial) m.envMapIntensity = .75; return m; };
/* Fassaden: stein (Free unten), holz (Lärche, Free oben), kalkstein (Light unten), holzhell (Calm, Light oben), latten (Bold),
   ziegel (Calm Nordseite), dunkel (Bold Rahmen), putz (hell), anthrazit (Kanten), weiss */
function skinMat(key) {
  if (!key) return null;
  if (SKIN[key]) return SKIN[key];
  const mk = (cv, s, r) => share(env(worldUV(new T.MeshStandardMaterial({ map: ctex(cv(), 1), roughness: r }), s)));
  const F = {
    stein: () => mk(stoneCanvas, .5, .95), holz: () => mk(larchCanvas, 1, .85), kalkstein: () => mk(limeCanvas, .5, .95),
    holzhell: () => mk(woodLightCanvas, 1, .85), latten: () => mk(battenCanvas, 1, .8), ziegel: () => mk(brickCanvas, 1, .95),
    dunkel: () => mk(darkCanvas, 1, .8), putz: () => share(env(new T.MeshStandardMaterial({ color: 0xEDEAE3, roughness: .95 }))),
    anthrazit: () => M.anthrazit, weiss: () => M.wall
  };
  return (SKIN[key] = (F[key] || F.putz)());
}
/* Dach: Blech (Stehfalz) oder Ziegel, Falz und Fugen laufen das Gefälle hinunter; ax: First entlang y (Plan) oder x */
function roofMat(kind, ax) {
  const k = 'roof-' + kind + ax; if (SKIN[k]) return SKIN[k];
  const tile = kind === 'ziegel';
  const m = new T.MeshStandardMaterial({ map: ctex(tile ? tileRoofCanvas() : roofCanvas(), 1), roughness: tile ? .8 : .55, metalness: tile ? .05 : .25 });
  m.onBeforeCompile = sh => {
    sh.uniforms.uAx = { value: ax === 'x' ? 1 : 0 };
    sh.vertexShader = 'uniform float uAx;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n{ vec4 gw = modelMatrix * vec4( transformed, 1.0 ); vMapUv = vec2( mix( gw.z, gw.x, uAx ) * .5, gw.y * .62 ); }');
  };
  m.customProgramCacheKey = () => 'gr-roof';
  return (SKIN[k] = share(env(m)));
}
function gravelMat() { return SKIN.kies || (SKIN.kies = share(env(groundUV(new T.MeshStandardMaterial({ map: ctex(gravelCanvas(), 1), roughness: 1 }), 1)))); }
const topMat = k => k === 'kies' ? gravelMat() : skinMat(k || 'dunkel');

/* ---------- Bühne (einmal) ---------- */

function stage() {
  R = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .96;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  /* Schatten nur neu rechnen, wenn sich am Modell etwas bewegt (nicht beim Drehen der Kamera): halbiert die Arbeit am Telefon */
  R.shadowMap.autoUpdate = false;
  R.domElement.className = 'gr__gl';
  const pm = new T.PMREMGenerator(R); ENV = pm.fromScene(new RoomEnvironment(R), .04).texture; pm.dispose();
  cam = new T.PerspectiveCamera(32, 1, .3, 400);
  hemi = new T.HemisphereLight(0xffffff, 0xcfc8bd, .35);
  sun = new T.DirectionalLight(0xfff1e0, 2.2); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .025; sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 140 });
}

/* ---------- Eine Welt je Haus ---------- */

const loadHouse = key => LOADS[key] || (LOADS[key] = import(`../data/grundriss-${key}.js`).then(m => m.default));

function geo(w) {
  HOUSE = w.H; K = HOUSE.K; HT = HOUSE.h; [EGF, OGF] = HOUSE.floors;
  ORX = w.ORX; ORY = w.ORY; TOP = w.TOP; scene = w.scene; FL = w.FL; S = w.S; ROOFS = w.roofs; SLABS = w.slabs; labsEl = w.labsEl;
}
function bind(w) {
  if (W) { W.mode = mode; W.tilt = tilt; LAST[W.key] = mode; }
  W = w; geo(w); mode = w.mode; tilt = w.tilt; w.used = performance.now();
  w.scene.add(hemi, sun, sun.target);
  /* Schattenbild über das ganze Haus */
  const b = w.box.haus.b, rad = Math.max(...[[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([x, z]) => Math.hypot(x, z))) + 2.5;
  Object.assign(sun.shadow.camera, { left: -rad, right: rad, top: rad, bottom: -rad }); sun.shadow.camera.updateProjectionMatrix();
  shadowDirty = true;
}

function buildWorld(key, H) {
  const prev = W, E0 = H.floors[0];
  const w = {
    key, H, scene: new T.Scene(), FL: [], roofs: [], slabs: [], tilt: false,
    mode: LAST[key] || 'eg', ORX: (E0.house[0] + E0.house[2]) / 2, ORY: (E0.house[1] + E0.house[3]) / 2, TOP: 0
  };
  if (!H.floors[1] && w.mode === 'og') w.mode = 'eg';
  w.S = { ...FINAL[w.mode] };
  w.scene.background = new T.Color(0x000000); w.scene.environment = ENV;
  geo(w);
  w.FL = FL = H.floors.map((F, fi) => buildFloor(F, fi));
  /* Decken und Vordächer über dem Erdgeschoß (Free: die Decke selbst, Light: Vordächer, Bold: die dunkle Platte) */
  const sl = EGF.slabs || (OGF ? [{ r: [EGF.house], t: HT.slab, top: 'kies', side: 'anthrazit', under: 'weiss' }] : []);
  sl.forEach(s => w.slabs.push(...buildSlab(s, FL[0])));
  /* Dächer */
  H.floors.forEach((F, fi) => roofList(F).forEach(rf => w.roofs.push(rf.type === 'flat' ? buildFlat(FL[fi], rf) : buildGable(FL[fi], rf))));
  const top = w.roofs.map(r => r.top);
  w.TOP = TOP = (top.length ? Math.max(...top) : (OGF ? HT.eg + HT.slab + HT.og : HT.eg)) + .3;
  w.box = boxes();
  w.scene.traverse(o => { (o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []).forEach(env); });
  /* Raumnamen */
  w.labsEl = labsEl = document.createElement('div'); labsEl.className = 'gr-labs'; labsEl.setAttribute('aria-hidden', 'true');
  FL.forEach(st => st.rooms.forEach(r => {
    const el = document.createElement('span'); el.className = 'gr-lab';
    el.innerHTML = `<b>${r.n}</b>` + (r.part || !r.area ? '' : `<i>${fmtA(r)}</i>`);
    labsEl.appendChild(el); r.el = el;
  }));
  if (prev) geo(prev);
  return w;
}

/* Alles freigeben, was nur dieses Haus hatte (Materialien und Formen, die alle teilen, bleiben) */
function dispose(w) {
  const seen = new Set();
  w.scene.traverse(o => {
    if (o.geometry && !isShared(o.geometry) && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
    (o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []).forEach(m => {
      if (isShared(m) || seen.has(m)) return; seen.add(m);
      if (m.map) m.map.dispose(); m.dispose();
    });
  });
  WORLDS.delete(w.key);
}

async function ensureWorld(key) {
  if (WORLDS.has(key)) return WORLDS.get(key);
  const H = await loadHouse(key);
  if (WORLDS.has(key)) return WORLDS.get(key);
  const w = buildWorld(key, H); w.used = performance.now(); WORLDS.set(key, w);
  /* höchstens MAXW Häuser: das am längsten nicht gezeigte geht (seine Karte behält ihr Standbild) */
  while (WORLDS.size > MAXW) {
    const old = [...WORLDS.values()].filter(x => x !== W && x !== w).sort((a, b) => a.used - b.used)[0];
    if (!old) break; dispose(old);
  }
  return w;
}

const roofList = F => F.roofs || (F.roof ? [{ type: 'gable', r: F.roof.slice(0, 4), rise: F.roof[4], axis: 'y', gables: (F.gables || []).map(at => ({ at, kind: 'glas' })) }] : []);

/* Rahmen der Ansichten in m (Welt): Sockel der Geschoße, fürs ganze Haus dazu Decken und Dächer */
function boxes() {
  const toW = (r, off = [0, 0]) => [(r[0] + off[0] - ORX) / K, (r[1] + off[1] - ORY) / K, (r[2] + off[0] - ORX) / K, (r[3] + off[1] - ORY) / K];
  const eg = EGF.base.map(r => toW(r)), og = OGF ? OGF.base.map(r => toW(r, OGF.off)) : [];
  const ex = HOUSE.floors.flatMap(F => roofList(F).flatMap(rf => (rf.type === 'flat' ? rf.r : [rf.r]).map(r => toW(r, F.off))));
  (EGF.slabs || []).forEach(s => s.r.forEach(r => ex.push(toW(r))));
  return { eg: { b: U4(eg), y0: -.3, y1: HT.cut }, og: { b: U4(og.length ? og : eg), y0: -.3, y1: HT.cut }, haus: { b: U4([...eg, ...og, ...ex]), y0: -.3, y1: TOP } };
}

/* ---------- Aufbau eines Geschoßes ---------- */

const inR = (q, x, y) => x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3];
/* Fassade je Abschnitt: das erste Rechteck aus F.skins, in dem die Mitte liegt, sonst F.skin */
function skinFor(F, b) {
  const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, s = (F.skins || []).find(q => inR(q, cx, cy));
  return skinMat(s ? s[4] : F.skin);
}

function buildFloor(F, fi) {
  const geo2 = PLAN_GEO[F.geo] || { w: [] }, off = F.off || [0, 0];
  const X = x => (x + off[0] - ORX) / K, Z = y => (y + off[1] - ORY) / K;
  const grp = new T.Group(); scene.add(grp);
  const st = { F, fi, g: grp, walls: [], skins: [], wins: [], furn: [], fins: [], steps: [], labs: [], base: [], X, Z };
  const [cx0, cy0, cx1, cy1] = F.crop, span = [cx1 - cx0, cy1 - cy0];
  const dl = (x, y) => clamp(((x - cx0) / span[0]) * .55 + ((y - cy0) / span[1]) * .45);
  /* Sockel (im Obergeschoß die Decke darunter, außen wie die Fassade oder F.baseSide) */
  const bs = fi ? skinMat(F.baseSide || F.skin) : null, pmat = fi ? [bs, bs, M.base, bs, bs, bs] : M.base;
  F.base.forEach(r => { const m = new T.Mesh(UBOX, pmat); m.scale.set((r[2] - r[0]) / K, .3, (r[3] - r[1]) / K); m.position.set((X(r[0]) + X(r[2])) / 2, -.3, (Z(r[1]) + Z(r[3])) / 2); m.receiveShadow = true; m.castShadow = true; grp.add(m); st.base.push(m); });
  /* Runde 37: heller Rand rund um den Sockel (20 cm), solange ein Geschoß allein steht: auf Schwarz bekommt das Haus so seine Kante */
  st.rim = F.base.map(r => { const e = .2, m = new T.Mesh(UBOX, M.edge); m.scale.set((r[2] - r[0]) / K + e * 2, .3, (r[3] - r[1]) / K + e * 2); m.position.set((X(r[0]) + X(r[2])) / 2, -.316, (Z(r[1]) + Z(r[3])) / 2); m.receiveShadow = true; grp.add(m); return m; });
  /* Wände: die Wandflächen des Plans (ohne Pfeile der Schiebetüren, F.skip), dazu F.walls; oben schwarz geschnitten */
  const skip = new Set(F.skip || []);
  const polys = geo2.w.filter((n, i) => !skip.has(i)).concat((F.walls || []).map(([a, b, c2, d]) => [a, b, c2, b, c2, d, a, d]));
  const wallsPts = [], wb = [];
  for (const n of polys) {
    const pts = []; for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (Math.min(b[2] - b[0], b[3] - b[1]) < 1.5 || (b[2] - b[0]) * (b[3] - b[1]) < 20) continue;
    wallsPts.push(n); wb.push(b);
    const shp = new T.Shape(pts.map(([x, y]) => new T.Vector2(X(x), -Z(y))));
    const eg = new T.ExtrudeGeometry(shp, { depth: 1, bevelEnabled: false }); eg.rotateX(-Math.PI / 2);
    /* ganze Wand in einem Material (Carport in Holz, freistehende Mauer in Stein) */
    const mw = (F.mats || []).find(q => inR(q, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2));
    const m = new T.Mesh(eg, [M.cap, mw ? skinMat(mw[4]) : M.wall]); m.castShadow = m.receiveShadow = true; grp.add(m);
    const d = dl((b[0] + b[2]) / 2, (b[1] + b[3]) / 2), low = !!(F.low && F.low(b));
    const cap = (F.caps || []).find(q => b[0] >= q[0] - .5 && b[2] <= q[2] + .5 && b[1] >= q[1] - .5 && b[3] <= q[3] + .5);
    st.walls.push({ m, d, low, cap: cap ? cap[4] : 0 });
    /* Fassade außen */
    const o = F.out, sk = skinFor(F, b), t = .035;
    const face = (x, z, w, dd) => { const s = B(grp, w, 1, dd, sk, x, 0, z); st.skins.push({ m: s, d, low, cap: cap ? cap[4] : 0 }); };
    o.x0.forEach(v => { if (Math.abs(b[0] - v) < 1) face(X(v) - t / 2, (Z(b[1]) + Z(b[3])) / 2, t, (b[3] - b[1]) / K + t * 2); });
    o.x1.forEach(v => { if (Math.abs(b[2] - v) < 1) face(X(v) + t / 2, (Z(b[1]) + Z(b[3])) / 2, t, (b[3] - b[1]) / K + t * 2); });
    o.y0.forEach(v => { if (Math.abs(b[1] - v) < 1) face((X(b[0]) + X(b[2])) / 2, Z(v) - t / 2, (b[2] - b[0]) / K + t * 2, t); });
    o.y1.forEach(v => { if (Math.abs(b[3] - v) < 1) face((X(b[0]) + X(b[2])) / 2, Z(v) + t / 2, (b[2] - b[0]) / K + t * 2, t); });
  }
  /* Innentüren: in jeder Lücke von 0,7 bis 1,1 m zwischen zwei Wandstücken steht ein offenes Türblatt (wie auf dem Verkaufsplan),
     nicht bei Schiebetüren und offenen Durchgängen (F.noDoor) */
  for (const dr of doorGaps(F, wb)) {
    if ((F.noDoor || []).some(([px, py]) => px >= dr.q[0] - 3 && px <= dr.q[2] + 3 && py >= dr.q[1] - 3 && py <= dr.q[3] + 3)) continue;
    const o = doorLeaf(dr, X, Z); grp.add(o); st.furn.push({ m: o, d: dl(dr.cx, dr.cy) });
  }
  /* Fenster, Türen, Tor */
  for (const w of F.windows || []) st.wins.push(windowPart(grp, w, F, X, Z, skinFor(F, w), dl((w[0] + w[2]) / 2, (w[1] + w[3]) / 2)));
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
      obj.position.set(cx, o.y || 0, cz); obj.rotation.y = FACE[f];
      if (!/glass|rail|shower|stool|slats/.test(type)) foot.push([x, y, w, d, /wardrobe|tall|shelf|tech|island|counter|bed|sofa|tub|lowboard|washer/.test(type) ? .7 : .35]);
      /* Lamellen wachsen mit den Wänden (im Grundriss so hoch wie der Schnitt) */
      if (type === 'slats') { grp.add(obj); st.fins.push({ m: obj, d: dl(x, y), h: o.h || 2.4 }); continue; }
    }
    grp.add(obj); st.furn.push({ m: obj, d: dl(x, y) });
  }
  for (const [x, y, l, w, paint, dir] of F.cars || []) {
    const ns = dir === 'n' || dir === 's';
    const o = car(l / K, w / K, paint); o.rotation.y = dir === 'n' ? Math.PI : dir === 'w' ? -Math.PI / 2 : dir === 'o' ? Math.PI / 2 : 0; o.position.set(X(x), 0, Z(y)); grp.add(o);
    st.furn.push({ m: o, d: .2 }); foot.push([x - (ns ? w : l) / 2, y - (ns ? l : w) / 2, ns ? w : l, ns ? l : w, .8]);
  }
  /* Treppe (Erdgeschoß): massive Stufen, Eiche obenauf (über einem Raum nur die Trittplatte, F.stair.float);
     im Obergeschoß das Treppenauge im Bodenbild */
  const stepsTex = [];
  const stairs = EGF.stair ? stairPolys(EGF.stair) : [];
  if (F.stair) {
    const fl = F.stair.float || 0;
    stairs.forEach(([pts, top], i) => {
      const shp = new T.Shape(pts.map(([x, y]) => new T.Vector2(X(x), -Z(y))));
      const eg = new T.ExtrudeGeometry(shp, { depth: 1, bevelEnabled: false }); eg.rotateX(-Math.PI / 2);
      const m = new T.Mesh(eg, [M.oak, M.wall]); m.castShadow = m.receiveShadow = true; grp.add(m);
      st.steps.push({ m, top, i, th: fl && top > fl ? .2 : 0 });
    });
  }
  if (F.void) stairs.forEach(([pts, top]) => stepsTex.push([pts.map(([x, y]) => [x - off[0], y - off[1]]), clamp((HT.eg + HT.slab - top) / (HT.eg + HT.slab))]));
  /* Boden mit allem, was gemalt ist */
  const cv = floorCanvas({ ...F, floor: F.floor || HOUSE.floor }, K, wallsPts, foot, stepsTex);
  const tex = ctex(cv);
  /* nach dem Hochladen braucht das Bild keinen Speicher mehr im Browser */
  tex.onUpdate = () => { cv.width = cv.height = 1; };
  const fm = new T.MeshStandardMaterial({ map: tex, roughness: .62, alphaTest: .5 });
  const pl = new T.Mesh(new T.PlaneGeometry(span[0] / K, span[1] / K), fm);
  pl.rotation.x = -Math.PI / 2; pl.position.set((X(cx0) + X(cx1)) / 2, .003, (Z(cy0) + Z(cy1)) / 2); pl.receiveShadow = true; grp.add(pl); st.plane = pl;
  /* Räume: Namen und Flächen; Hindernisse für die Namen: alles, was am Boden steht, Autos, Treppe, Treppenauge */
  const obst = (F.furn || []).filter(f => f[0] !== 'pendant').map(([, x, y, w, d]) => [x - 2, y - 2, x + w + 2, y + d + 2]);
  for (const [x, y, l, w, , dir] of F.cars || []) { const n = dir === 'n' || dir === 's'; obst.push([x - (n ? w : l) / 2 - 2, y - (n ? l : w) / 2 - 2, x + (n ? w : l) / 2 + 2, y + (n ? l : w) / 2 + 2]); }
  if (F.stair && stairs.length) obst.push(U4(stairs.flatMap(([pts]) => pts.map(([x, y]) => [x, y, x, y]))));
  if (F.void) obst.push(F.void);
  st.rooms = F.rooms.filter(r => r.n).map(r => {
    const area = r.r ? r.r.reduce((a, q) => a + (q[2] - q[0]) * (q[3] - q[1]), 0) / (K * K) : 0;
    const bb = r.r ? U4(r.r) : [r.at[0] - 40, r.at[1] - 40, r.at[0] + 40, r.at[1] + 40];
    /* Fläche, in die der Name passen muss: das Rechteck des Raums unter dem Namen (Teile eines Raums: 2,8 m rundum) */
    const fr = (r.r || []).find(q => inR(q, r.at[0], r.at[1])) || [r.at[0] - 40, r.at[1] - 40, r.at[0] + 40, r.at[1] + 40];
    /* Runde 37: der Name steht auf freiem Boden, nicht auf Möbeln, Autos oder der Treppe (wie auf einem Verkaufsplan) */
    const sp = clearSpot(fr, r.at, obst);
    return { n: r.n, list: r.list || r.n, part: !!r.part, area, a: r.a || 0, out: !!r.out, pos: new T.Vector3(X(sp[0]), .05, Z(sp[1])), bb: [X(bb[0]), Z(bb[1]), X(bb[2]), Z(bb[3])], fit: [X(fr[0]), Z(fr[1]), X(fr[2]), Z(fr[3])], fi };
  });
  return st;
}

/* Freier Platz für einen Namen im Rechteck fr (Plan pt): der Punkt mit dem meisten Abstand zu Möbeln und Wänden,
   gemessen wie ein Kasten, der 2,6 mal so breit wie hoch ist (so liegt Schrift); bei Gleichstand näher am gewünschten Punkt at. */
function clearSpot(fr, at, obs) {
  const [x0, y0, x1, y1] = fr, in_ = obs.filter(o => o[0] < x1 && o[2] > x0 && o[1] < y1 && o[3] > y0);
  let best = at, bs = -1e9;
  for (let y = y0 + 6; y <= y1 - 6; y += 3) for (let x = x0 + 6; x <= x1 - 6; x += 3) {
    let c2 = Math.min(Math.min(x - x0, x1 - x) / 2.6, Math.min(y - y0, y1 - y));
    for (const o of in_) { const dx = Math.max(o[0] - x, 0, x - o[2]), dy = Math.max(o[1] - y, 0, y - o[3]); c2 = Math.min(c2, Math.max(dx / 2.6, dy)); if (c2 <= 0) break; }
    const sc = Math.min(c2, 16) - Math.hypot(x - at[0], y - at[1]) * .03;
    if (sc > bs) { bs = sc; best = [x, y]; }
  }
  return best;
}

/* Türöffnungen aus den Wandflächen: zwei Wandstücke auf derselben Linie mit einer Lücke von 0,7 bis 1,1 m, nichts dazwischen,
   nicht dort, wo schon ein Fenster oder eine Außentür ist. Das Blatt schlägt in den Raum auf, nicht in Flur, Eingang oder Wohnen. */
const CIRC = new Set(['Eingang', 'Wohnen', 'Flur', 'Galerie', 'Diele', 'Kochen', 'Essen']);
function doorGaps(F, Wb) {
  const out = [], win = (F.windows || []).map(w => w.slice(0, 4)), seen = new Set(), def = F.floor || HOUSE.floor || 'eiche';
  const free = (q, a, b) => !Wb.some(c2 => c2 !== a && c2 !== b && c2[0] < q[2] - 1 && c2[2] > q[0] + 1 && c2[1] < q[3] - 1 && c2[3] > q[1] + 1);
  for (const a of Wb) for (const b of Wb) {
    if (a === b) continue;
    for (const ax of ['h', 'v']) {
      const h = ax === 'h', i0 = h ? 0 : 1, i1 = h ? 1 : 0;
      const ov = Math.min(a[i1 + 2], b[i1 + 2]) - Math.max(a[i1], b[i1]), gap = b[i0] - a[i0 + 2];
      if (ov <= 3 || gap < 20 || gap > 31.2) continue;
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
    for (const rm of F.rooms) { if (!rm.r) continue; const q = rm.r.find(q2 => inR(q2, px, py)); if (q && (!best || area(rm) < area(best))) { best = rm; rect = q; } }
    return best && { rm: best, rect, circ: CIRC.has(best.n) || (!best.n && (best.f === def || best.f === 'eiche')), a: area(best) };
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
  const gg = new T.Group(), t = .045, H = 2.02, [x0, y0, x1, y1] = d.q;
  const len = ((d.h ? x1 - x0 : y1 - y0) / K) - .03;
  if (d.h) {
    const hx = X(d.hinge ? x1 : x0) + (d.hinge ? -t / 2 - .015 : t / 2 + .015), fz = Z(d.s > 0 ? y1 : y0);
    B(gg, t, H, len, M.door, hx, 0, fz + d.s * len / 2);
    B(gg, .1, .02, .02, M.steel, hx, 1, fz + d.s * (len - .08));
  } else {
    const hz = Z(d.hinge ? y1 : y0) + (d.hinge ? -t / 2 - .015 : t / 2 + .015), fx = X(d.s > 0 ? x1 : x0);
    B(gg, len, H, t, M.door, fx + d.s * len / 2, 0, hz);
    B(gg, .02, .02, .1, M.steel, fx + d.s * (len - .08), 1, hz);
  }
  gg.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return gg;
}

/* Treppe als Stufenflächen in Plan pt (Erdgeschoß) mit Oberkante in m, in der Reihenfolge des Aufgangs.
   Teile: gerade Läufe {dir: 'x', y: [y0, y1], x: [Kanten]} oder {dir: 'y', x: [x0, x1], y: [Kanten]},
   Wendelstufen {c: Mitte, rect, n, a0, a1} (Winkel im Plan, y nach unten). Free (Runde 35): run1, wind, run2.
   Steigung: Geschoßhöhe durch Stufen + 1 (die letzte Steigung ist der Boden oben), oder durch sp.n. */
function stairPolys(sp) {
  const parts = sp.parts || [{ dir: 'x', ...sp.run1 }, { ...sp.wind, a0: -Math.PI / 2, a1: -1.5 * Math.PI }, { dir: 'x', ...sp.run2 }];
  const raw = [];
  for (const p of parts) {
    if (p.c) {
      const [cx, cy] = p.c, [rx0, ry0, rx1, ry1] = p.rect, n = p.n, sg = Math.sign(p.a1 - p.a0), spn = Math.abs(p.a1 - p.a0), TAU = Math.PI * 2;
      const hit = th => { const dx = Math.cos(th), dy = Math.sin(th); let t = 1e9; if (dx < -1e-6) t = Math.min(t, (rx0 - cx) / dx); if (dx > 1e-6) t = Math.min(t, (rx1 - cx) / dx); if (dy < -1e-6) t = Math.min(t, (ry0 - cy) / dy); if (dy > 1e-6) t = Math.min(t, (ry1 - cy) / dy); return [cx + dx * t, cy + dy * t]; };
      const rel = a => (((a - p.a0) * sg) % TAU + TAU) % TAU;
      const corners = [[rx0, ry0], [rx0, ry1], [rx1, ry1], [rx1, ry0]].map(q => [q, rel(Math.atan2(q[1] - cy, q[0] - cx))]);
      for (let i = 0; i < n; i++) {
        const t0 = spn * i / n, t1 = spn * (i + 1) / n;
        const pts = [[cx, cy], hit(p.a0 + sg * t0)];
        corners.filter(([q, t]) => t > t0 + 1e-6 && t < t1 - 1e-6 && Math.hypot(q[0] - cx, q[1] - cy) > .5).sort((u, v) => u[1] - v[1]).forEach(([q]) => pts.push(q));
        pts.push(hit(p.a0 + sg * t1));
        raw.push(pts);
      }
    } else if (p.dir === 'y') {
      for (let i = 0; i + 1 < p.y.length; i++) { const a = p.y[i], b = p.y[i + 1]; raw.push([[p.x[0], a], [p.x[1], a], [p.x[1], b], [p.x[0], b]]); }
    } else {
      for (let i = 0; i + 1 < p.x.length; i++) { const a = p.x[i], b = p.x[i + 1]; raw.push([[a, p.y[0]], [b, p.y[0]], [b, p.y[1]], [a, p.y[1]]]); }
    }
  }
  const rise = (HT.eg + HT.slab) / (sp.n || raw.length + 1);
  return raw.map((pts, i) => [pts, rise * (i + 1)]);
}

/* Ein Fenster (oder Tür, Tor) in der Wandöffnung: Brüstung, Glas mit schwarzem Rahmen und Sprossen, Sturz bis zur Wandkrone.
   Türen: o.leaf Breite des Blatts in m (so breit wie die Öffnung: Tür ohne Seitenteil), o.at 'r' Blatt am anderen Ende,
   o.c 'dunkel' dunkles Blatt. Felder: o.sp gleich verteilte Pfosten (gilt auch für 'schiebe'), o.m Pfosten an Planstellen in pt,
   o.tr Kämpfer in m über dem Boden, o.trh ihre Höhe (Runde 40) */
function windowPart(grp, w, F, X, Z, skin, d) {
  const [x0, y0, x1, y1, sill, head, kind, o = {}] = w, alongX = (x1 - x0) > (y1 - y0);
  const len = (alongX ? x1 - x0 : y1 - y0) / K, th = (alongX ? y1 - y0 : x1 - x0) / K;
  const g2 = new T.Group(); g2.position.set((X(x0) + X(x1)) / 2, 0, (Z(y0) + Z(y1)) / 2); if (!alongX) g2.rotation.y = Math.PI / 2; grp.add(g2);
  /* außen: welche Seite (lokal −z oder +z). Gedreht (Wand entlang y) zeigt lokal +z nach Osten: Westseite −1, Ostseite +1
     (Runde 42: vorher vertauscht, die Fassade um Fenster in Ost und West lag innen) */
  const ou = F.out; let outZ = 0;
  if (alongX) { if (ou.y0.some(v => Math.abs(y0 - v) < 1)) outZ = -1; else if (ou.y1.some(v => Math.abs(y1 - v) < 1)) outZ = 1; }
  else { if (ou.x0.some(v => Math.abs(x0 - v) < 1)) outZ = -1; else if (ou.x1.some(v => Math.abs(x1 - v) < 1)) outZ = 1; }
  const wallBox = () => { const m = new T.Mesh(UBOX, [M.wall, M.wall, M.cap, M.wall, M.wall, M.wall]); m.castShadow = m.receiveShadow = true; m.scale.set(len, 1, th); g2.add(m); return m; };
  const P = { sill: sill > 0 ? wallBox() : null, lin: wallBox(), parts: [], posts: [] };
  if (outZ && skin) {
    P.sk1 = B(g2, len, 1, .035, skin, 0, 0, outZ * (th / 2 + .0175)); P.sk2 = B(g2, len, 1, .035, skin, 0, 0, outZ * (th / 2 + .0175));
    /* Runde 42: Laibung außen (seitlich und oben) in der Fassade, vor dem Rahmen bis zur Außenkante; sonst sieht man den hellen Wandkern */
    const ld = th / 2 + .035 - .04, lz = outZ * (.04 + ld / 2);
    P.jb = [-1, 1].map(sd => B(g2, .02, 1, ld, skin, sd * (len / 2 - .01), 0, lz)); P.hl = B(g2, len, 1, ld, skin, 0, 0, lz);
  }
  const fr = .055, fz = 0;
  if (kind === 'tor') {
    P.door = B(g2, len, 1, .06, M.anthrazit, 0, 0, outZ * (th / 2 - .05));
    P.grooves = [1, 2, 3, 4].map(() => B(g2, len, .012, .065, M.black, 0, 0, outZ * (th / 2 - .05)));
  } else {
    const leaf = kind === 'tuer' ? Math.min(len, o.leaf || Math.min(1.1, len * .55)) : 0, rs = o.at === 'r' ? -1 : 1;
    const lx = rs * (-len / 2 + leaf / 2);
    if (leaf) { P.door = B(g2, leaf, 1, .07, o.c === 'dunkel' ? M.anthrazit : M.oak, lx, 0, fz); P.handle = B(g2, .03, .5, .1, M.steel, rs * (-len / 2 + leaf - .1), 0, fz); }
    const gl = len - leaf, gx = rs * (-len / 2 + leaf + gl / 2);
    const xs = [-len / 2 + fr / 2, len / 2 - fr / 2]; if (leaf && gl > .05) xs.push(rs * (-len / 2 + leaf + fr / 2));
    if (gl > .12) {
      P.glass = B(g2, gl - fr, 1, .02, M.glass, gx, 0, fz); P.glass.castShadow = false;
      const sp = o.sp != null ? o.sp : kind === 'schiebe' ? Math.max(1, Math.round(gl / 1.5)) : 0;
      for (let i = 1; i <= sp; i++) xs.push(gx - gl / 2 + gl * i / (sp + 1));
      /* Runde 40: o.m Pfosten an Planstellen (pt, entlang der Öffnung), o.tr Kämpfer in m über Boden, o.trh ihre Höhe */
      (o.m || []).forEach(v => xs.push(alongX ? (v - (x0 + x1) / 2) / K : -(v - (y0 + y1) / 2) / K));
      P.rb = B(g2, gl, fr, .08, M.black, gx, 0, fz);
    }
    P.posts = xs.map(x => B(g2, fr, 1, .08, M.black, x, 0, fz));
    P.rt = B(g2, len, fr, .08, M.black, 0, 0, fz);
    P.trh = o.trh || fr; P.trs = (o.tr || []).map(h => [B(g2, len, 1, .08, M.black, 0, 0, fz), h]);
  }
  const part = (m, a, b) => { if (!m) return; const h = b - a; m.visible = h > .004; if (m.visible) { m.position.y = a; m.scale.y = h; } };
  /* Wt: Höhe der Wandkrone gerade jetzt */
  return {
    d, update(Wt) {
      const s = Math.min(sill, Wt), hd = Math.min(head, Wt);
      part(P.sill, 0, s); part(P.sk1, 0, sill > 0 ? s : 0);
      part(P.lin, head, Wt); part(P.sk2, head, Wt);
      if (P.jb) { P.jb.forEach(m => part(m, s, hd)); part(P.hl, Math.min(head - .02, Wt), Wt > head + .001 ? head : 0); }
      if (kind === 'tor') { part(P.door, 0, hd); P.grooves.forEach((m, i) => { m.visible = hd > (i + 1) * .5; m.position.y = (i + 1) * .5; }); return; }
      part(P.door, 0, hd); if (P.handle) { P.handle.visible = Wt > 1.3; P.handle.position.y = .8; }
      part(P.glass, s, hd); P.posts.forEach(m => part(m, s, hd));
      P.trs.forEach(([m, h]) => part(m, Math.min(h, hd), Math.min(h + P.trh, hd)));
      if (P.rb) { P.rb.visible = Wt > s + fr && sill > 0; P.rb.position.y = s; }
      if (P.rt) { P.rt.visible = Wt >= head - .001; P.rt.position.y = head - fr; }
    }
  };
}

/* Platten als Quader: Decke über dem Erdgeschoß und Vordächer (Light), dunkle Platte (Bold). Oben Kies oder dunkel,
   Kante wie side, unten weiß oder Holz */
function buildSlab(sl, st) {
  const t = sl.t || HT.slab, sd = skinMat(sl.side || 'anthrazit'), mats = [sd, sd, topMat(sl.top || 'kies'), skinMat(sl.under || 'weiss'), sd, sd];
  return sl.r.map(r => {
    const m = new T.Mesh(UBOX, mats); m.castShadow = m.receiveShadow = true;
    m.scale.set((r[2] - r[0]) / K + .06, t, (r[3] - r[1]) / K + .06);
    m.position.set((st.X(r[0]) + st.X(r[2])) / 2, sl.y ?? HT.eg, (st.Z(r[1]) + st.Z(r[3])) / 2);
    m.visible = false; st.g.add(m); return { m, t };
  });
}

/* Flachdach: Platten wie oben, fallen beim Bauen von oben auf die Wände */
function buildFlat(st, rf) {
  const grp = new T.Group(), y = rf.y ?? (st.fi ? HT.og : HT.eg), t = rf.t || .35;
  const sd = skinMat(rf.side || 'anthrazit'), mats = [sd, sd, topMat(rf.top || 'kies'), skinMat(rf.under || 'weiss'), sd, sd];
  rf.r.forEach(r => {
    const m = new T.Mesh(UBOX, mats); m.castShadow = m.receiveShadow = true;
    m.scale.set((r[2] - r[0]) / K, t, (r[3] - r[1]) / K); m.position.set((st.X(r[0]) + st.X(r[2])) / 2, 0, (st.Z(r[1]) + st.Z(r[3])) / 2); grp.add(m);
  });
  grp.visible = false; st.g.add(grp);
  return { g: grp, y, top: (st.fi ? HT.eg + HT.slab : 0) + y + t };
}

/* Satteldach: First entlang y (Free) oder x (Calm), Traufe auf der Wandkrone, rf.ov Überstand an der Traufe. Giebel: Glas mit schwarzen
   Pfosten, mit mittlerem Feld (mid: Anteil der Breite, mat: Fassade), geschlossen in einer Fassade (kind = Fassade), in Feldern
   (parts, Runde 40) oder als Rahmen an der Stirn (band, Runde 40) */
function buildGable(st, rf) {
  const [x0, y0, x1, y1] = rf.r, X = st.X, Z = st.Z, ax = rf.axis || 'y', Rh = rf.rise;
  const across = (ax === 'y' ? x1 - x0 : y1 - y0) / K, along = (ax === 'y' ? y1 - y0 : x1 - x0) / K;
  const hw = across / 2, ov = rf.ov ?? .45, s = Rh / hw, tv = rf.t || .26, L = along + (rf.ext ?? .5);
  const shp = new T.Shape([new T.Vector2(-hw - ov, -ov * s), new T.Vector2(0, Rh), new T.Vector2(hw + ov, -ov * s), new T.Vector2(hw + ov, -ov * s + tv), new T.Vector2(0, Rh + tv), new T.Vector2(-hw - ov, -ov * s + tv)]);
  const geo3 = new T.ExtrudeGeometry(shp, { depth: L, bevelEnabled: false }); geo3.translate(0, 0, -L / 2);
  const y = rf.y ?? (st.fi ? HT.og : HT.eg);
  const grp = new T.Group(); grp.position.set((X(x0) + X(x1)) / 2, 0, (Z(y0) + Z(y1)) / 2); if (ax === 'x') grp.rotation.y = Math.PI / 2; st.g.add(grp);
  const roof = new T.Mesh(geo3, [skinMat(rf.edge || 'anthrazit'), roofMat(rf.cover || 'blech', ax)]); roof.castShadow = roof.receiveShadow = true; grp.add(roof);
  /* Untersicht in Holz, knapp unter der Deckung */
  const und = new T.Shape([new T.Vector2(-hw - ov + .02, -ov * s + .015), new T.Vector2(0, Rh - .01), new T.Vector2(hw + ov - .02, -ov * s + .015), new T.Vector2(hw + ov - .02, -ov * s + .03), new T.Vector2(0, Rh + .005), new T.Vector2(-hw - ov + .02, -ov * s + .03)]);
  const ug = new T.ExtrudeGeometry(und, { depth: L - .04, bevelEnabled: false }); ug.translate(0, 0, -(L - .04) / 2);
  grp.add(new T.Mesh(ug, skinMat(rf.under || 'holz')));
  const hAt = x => Rh * (1 - Math.abs(x) / hw);
  /* Planwert quer zum First in lokales x: First entlang y, dann x; entlang x (gedreht), dann zeigt lokal +x nach Norden */
  const lxOf = v => ax === 'y' ? X(v) - grp.position.x : -(Z(v) - grp.position.z);
  (rf.gables || []).forEach(gb => {
    const z = ax === 'y' ? Z(gb.at) - grp.position.z : X(gb.at) - grp.position.x;
    const ext = (pts, mat, dep) => {
      const tg = new T.ExtrudeGeometry(new T.Shape(pts), { depth: dep, bevelEnabled: false }); tg.translate(0, 0, -dep / 2);
      const m = new T.Mesh(tg, mat); m.position.z = z; m.castShadow = mat !== M.glass; m.receiveShadow = true; grp.add(m); return m;
    };
    const tri = (a, b, mat, dep) => {
      const pts = [new T.Vector2(a, 0), new T.Vector2(b, 0)]; if (b > 0 && a < 0) { pts.push(new T.Vector2(b, hAt(b)), new T.Vector2(0, Rh), new T.Vector2(a, hAt(a))); } else pts.push(new T.Vector2(b, hAt(b)), new T.Vector2(a, hAt(a)));
      return ext(pts, mat, dep);
    };
    /* Runde 40, band: Rahmen an der Dachstirn, gb.band m breit (quer zur Dachneigung) unter der Deckung bis zur Traufe */
    if (gb.band) {
      const e = hw + ov, yb = -ov * s, d = gb.band * Math.hypot(hw, Rh) / hw, xi = e - d / s;
      ext([new T.Vector2(-e, yb), new T.Vector2(-xi, yb), new T.Vector2(0, Rh - d), new T.Vector2(xi, yb), new T.Vector2(e, yb), new T.Vector2(0, Rh)].reverse(), skinMat(gb.mat || 'holz'), gb.dep ?? .1);
      return;
    }
    /* Runde 40, parts: Giebel in Feldern [a, b, Art, {sp, m}] in Plan pt quer zum First; Glas mit Rahmen nur über dem eigenen Feld,
       sonst Fassade bis unter das Dach. gb.dep Tiefe der Fassadenfelder, gb.tb Höhe des unteren Rahmens (Kämpfer über dem Fenster) */
    if (gb.parts) {
      gb.parts.forEach(([pa, pb, kind, po = {}]) => {
        let a = lxOf(pa), b = lxOf(pb); if (a > b) [a, b] = [b, a]; a = Math.max(a, -hw); b = Math.min(b, hw);
        if (b - a < .01) return;
        if (kind !== 'glas') { tri(a, b, skinMat(kind), po.dep ?? gb.dep ?? .4); return; }
        tri(a, b, M.glass, .02);
        B(grp, b - a, gb.tb ?? .07, .1, M.black, (a + b) / 2, 0, z);
        const xs = [a + .03, b - .03], n = po.sp || 0;
        for (let i = 1; i <= n; i++) xs.push(a + (b - a) * i / (n + 1));
        (po.m || []).forEach(v => xs.push(lxOf(v)));
        xs.forEach(px => B(grp, .06, hAt(px), .09, M.black, px, 0, z));
        const rake = (u, v) => {
          if (v - u < .01) return; const dy = hAt(v) - hAt(u), l = Math.hypot(v - u, dy);
          const r = B(grp, l, .07, .1, M.black, (u + v) / 2, (hAt(u) + hAt(v)) / 2 - .035, z); r.rotation.z = Math.atan2(dy, v - u);
        };
        if (a < 0 && b > 0) { rake(a, 0); rake(0, b); } else rake(a, b);
      });
      return;
    }
    if (gb.kind !== 'glas') { tri(-hw, hw, skinMat(gb.kind), .12); return; }
    const mw = (gb.mid || 0) * hw;
    if (mw) { tri(-mw, mw, skinMat(gb.mat || 'putz'), .14); tri(-hw, -mw, M.glass, .02); tri(mw, hw, M.glass, .02); }
    else tri(-hw, hw, M.glass, .02);
    const posts = mw ? [-mw, mw, -(mw + hw) / 2, (mw + hw) / 2] : [-hw / 2, 0, hw / 2];
    posts.forEach(px => B(grp, .06, hAt(px), .09, M.black, px, 0, z));
    B(grp, hw * 2, .07, .1, M.black, 0, 0, z);
    [-1, 1].forEach(sg => { const len = Math.hypot(hw, Rh), e = B(grp, len, .07, .1, M.black, sg * hw / 2, Rh / 2 - .035, z); e.rotation.z = -sg * Math.atan2(Rh, hw); e.position.y = Rh / 2 - .035; });
  });
  grp.visible = false;
  return { g: grp, y, top: (st.fi ? HT.eg + HT.slab : 0) + y + Rh + tv };
}

/* ---------- Zustand je Bild ---------- */

function apply() {
  const ext = E(S.ext, 0, 1);
  FL.forEach(st => {
    const fi = st.fi, b = fi ? S.og : S.eg, full = fi ? HT.og : HT.eg, lowH = st.F.lowH || 1;
    st.g.visible = b > .001;
    if (!st.g.visible) return;
    const W0 = lerp(HT.cut, full, ext);
    st.base.forEach(m => { m.scale.y = Math.max(.001, .3 * E(b, 0, .12)); m.position.y = -.3 * E(b, 0, .12); });
    st.plane.visible = b > .05;
    const rimOn = b > .1 && S.ext < .5 && (!fi || S.lift < .02); st.rim.forEach(m => { m.visible = rimOn; });
    const grow = d => E(b, .08 + d * .3, .42 + d * .3);
    const hw = w => { let h = (w.low ? lowH : W0); if (w.cap) h = Math.min(h, w.cap); return h * grow(w.d); };
    st.walls.forEach(w => { const h = hw(w); w.m.scale.y = Math.max(.001, h); w.m.visible = h > .003; });
    st.skins.forEach(w => { const h = hw(w); w.m.scale.y = Math.max(.001, h); w.m.visible = h > .003; });
    st.wins.forEach(w => w.update(W0 * grow(w.d)));
    st.fins.forEach(f => { const h = Math.min(f.h, W0 * grow(f.d)); f.m.scale.y = Math.max(.001, h / f.h); f.m.visible = h > .003; });
    const Ws = W0 * E(b, .2, .6);
    st.steps.forEach(s => { const v = s.top <= Ws + .002; s.m.visible = v; if (v) { if (s.th) { s.m.scale.y = s.th; s.m.position.y = s.top - s.th; } else s.m.scale.y = s.top; } });
    st.furn.forEach(o => { const e = E(b, .48 + o.d * .3, .68 + o.d * .3); o.m.scale.y = Math.max(.001, e); o.m.visible = e > .003; });
    /* Obergeschoß: steht allein am Boden oder sitzt auf der Decke; beim Umsetzen hebt es weich ab */
    if (fi) st.g.position.y = S.lift * (HT.eg + HT.slab) + Math.sin(Math.PI * clamp(S.lift)) * .6 * (S.lift < 1 ? 1 : 0);
  });
  const r = E(S.roof, 0, 1);
  ROOFS.forEach(rf => { rf.g.visible = S.roof > .002; if (rf.g.visible) rf.g.position.y = rf.y + (1 - r) * 4; });
  const sl = E(S.slab, 0, 1);
  SLABS.forEach(s => { s.m.visible = sl > .002 && S.eg > .5; s.m.scale.y = Math.max(.001, s.t * sl); });
}

/* ---------- Tweens und Abläufe ---------- */

const set = (k, v) => { anims = anims.filter(a => { if (a.k === k) { a.res(); return false; } return true; }); S[k] = v; shadowDirty = true; kick(); };
function tween(k, to, dur) {
  anims = anims.filter(a => { if (a.k === k) { a.res(); return false; } return true; });
  if (reduce || Math.abs(S[k] - to) < 1e-4) { S[k] = to; shadowDirty = true; kick(); return Promise.resolve(); }
  return new Promise(res => { anims.push({ k, from: S[k], to, t0: performance.now(), dur: dur * 1000 * Math.min(1, Math.abs(S[k] - to) * 1.2 + .25), res }); kick(); });
}
const all = (...p) => Promise.all(p);
/* laufende Bewegungen sofort ans Ziel (Wechsel des Hauses): die Abläufe brechen über seq ab */
function settle() { anims.forEach(a => { S[a.k] = a.to; a.res(); }); anims = []; seq++; if (W) Object.assign(S, FINAL[mode]); focus = null; }

async function setMode(m, opt = {}) {
  if (!OGF && m === 'og') m = 'eg';
  const my = ++seq, w = W, ok = () => my === seq && w === W;
  mode = m; focus = null; syncUI(); reframe(true);
  const name = HOUSE.name;
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
  } else if (!OGF) {
    /* ein Geschoß (Calm): Wände hoch, dann das Dach */
    if (opt.build) {
      set('eg', 0); set('roof', 0); set('slab', 0); set('ext', 1);
      announce(HOUSE.build || 'Das Haus wird gebaut: erst die Wände, dann das Dach.');
      await tween('eg', 1, 3.2); if (!ok()) return;
      if (SLABS.length) { await tween('slab', 1, .7); if (!ok()) return; }
      await tween('roof', 1, 1.4); if (!ok()) return;
      announce('Fertig gebaut. Das ganze Haus, Concept ' + name + '.');
      return;
    }
    if (S.eg < 1) { await tween('eg', 1, 1); if (!ok()) return; }
    await tween('ext', 1, .8); if (!ok()) return;
    if (SLABS.length) { await tween('slab', 1, .5); if (!ok()) return; }
    await tween('roof', 1, .9);
  } else {
    if (opt.build) {
      set('eg', 0); set('og', 0); set('slab', 0); set('roof', 0); set('lift', 1); set('ext', 1);
      announce(HOUSE.build || 'Das Haus wird gebaut: erst das Erdgeschoß, dann die Decke, das Obergeschoß und das Dach.');
      await tween('eg', 1, 3.2); if (!ok()) return;
      await tween('slab', 1, .9); if (!ok()) return;
      await tween('og', 1, 2.8); if (!ok()) return;
      await tween('roof', 1, 1.4); if (!ok()) return;
      announce('Fertig gebaut. Das ganze Haus, Concept ' + name + '.');
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

function modeBox(m) { return W.box[m === 'og' ? 'og' : m === 'haus' ? 'haus' : 'eg']; }
function corners(bx) { const o = []; [bx.b[0], bx.b[2]].forEach(x => [bx.y0, bx.y1].forEach(y => [bx.b[1], bx.b[3]].forEach(z => o.push(new T.Vector3(x, y, z))))); return o; }
function insets() { return morph && morph.ins ? morph.ins : host && host.insets ? host.insets() : { t: 8, b: 8, l: 8, r: 8 }; }
function place(o, at = cam) {
  at.position.set(o.t.x + Math.sin(o.az) * Math.cos(o.el) * o.dist, o.t.y + Math.sin(o.el) * o.dist, o.t.z + Math.cos(o.az) * Math.cos(o.el) * o.dist);
  at.lookAt(o.t);
}
function fitDist(bx, az, el, t) {
  const Wd = host.el.clientWidth || 1, H = host.el.clientHeight || 1, I = insets();
  const mx = Math.max(.2, (Wd - I.l - I.r) / Wd), my = Math.max(.2, (H - I.t - I.b) / H);
  cam.clearViewOffset(); cam.aspect = Wd / H; cam.updateProjectionMatrix();
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
function fitGoal() {
  box = modeBox(mode);
  const tall = (host.el.clientHeight || 1) > (host.el.clientWidth || 1) * 1.05;
  const [az, el] = mode === 'haus' ? (HOUSE.view || DEF.haus) : tilt ? (tall ? DEF.tiltTall : DEF.tilt) : DEF.plan;
  const t = new T.Vector3((box.b[0] + box.b[2]) / 2, mode === 'haus' ? TOP * .38 : .5, (box.b[1] + box.b[3]) / 2);
  fitD = fitDist(box, az, el, t);
  g.az = az; g.el = el; g.dist = fitD; g.t.copy(t); vel = 0;
}
function reframe(anim) {
  if (!host || !cam || !W) return;
  fitGoal();
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
  announce(rm.list + (rm.area && !rm.part ? ', ' + fmtA(rm) : ''));
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
  if (morph) { morphStep(now); busy = true; }
  if (!dragging && Math.abs(vel) > .01) { g.az += vel * dt; vel *= Math.pow(.008, dt); busy = true; }
  const f = reduce ? 1 : 1 - Math.pow(dragging ? 1e-7 : .0012, dt);
  const before = c.az + c.el + c.dist + c.t.x + c.t.y + c.t.z;
  c.az += (g.az - c.az) * f; c.el += (g.el - c.el) * f; c.dist += (g.dist - c.dist) * f; c.t.lerp(g.t, f);
  if (Math.abs(before - (c.az + c.el + c.dist + c.t.x + c.t.y + c.t.z)) > 1e-4) busy = true;
  render();
  if (busy && !raf) raf = requestAnimationFrame(frame);
}
function render() {
  if (!host || !W) return;
  const Wd = host.el.clientWidth || 1, H = host.el.clientHeight || 1, I = insets();
  apply();
  cam.aspect = Wd / H;
  /* im Obergeschoß folgt der Blick dem Geschoß, solange es noch auf dem Erdgeschoß sitzt oder sich senkt */
  const yo = mode === 'og' ? S.lift * (HT.eg + HT.slab) : 0; TV.copy(c.t); TV.y += yo; place({ az: c.az, el: c.el, dist: c.dist, t: TV });
  cam.setViewOffset(Wd, H, (I.r - I.l) / 2, (I.b - I.t) / 2, Wd, H); cam.updateProjectionMatrix();
  /* Sonne von Nordwesten, fest über der Mitte des Hauses */
  sun.position.set(-14, 26, -9); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  if (shadowDirty) { R.shadowMap.needsUpdate = true; shadowDirty = false; }
  R.render(scene, cam);
  labels(Wd, H);
}

/* Namen der Räume (Runde 36, fürs Telefon): ein Name steht nur dort, wo er in seinen Raum passt, nicht über einem anderen Namen
   und nicht unter der Bedienung. Passt er an seinem Platz nicht, rückt er zur Mitte des Raums; passt er dann noch nicht,
   steht nur der Name ohne Fläche, sonst gar nichts. Näher heran zeigt mehr. Der gewählte Raum steht immer da (gelb). */
const LV = new T.Vector3();
const scr = (x, y, z, o, Wd, H) => { LV.set(x + o.x, y + o.y, z + o.z).project(cam); return [(LV.x + 1) / 2 * Wd, (1 - LV.y) / 2 * H, LV.z]; };
function inQuad(Q, px, py) {
  let s = 0;
  for (let i = 0; i < Q.length; i++) {
    const a = Q[i], b = Q[(i + 1) % Q.length], c2 = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
    if (Math.abs(c2) > 1e-6) { const gs = Math.sign(c2); if (s && gs !== s) return false; s = gs; }
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
function labels(Wd, H) {
  if (!labsEl) return;
  const show = labelsOn && S.ext < .05 && mode !== 'haus', taken = [], blk = host.block ? host.block() : [];
  /* von oben stehen die Namen als Schrift auf dem Boden; schräg (3D) kämen sie über die Wände, dort mit schwarzem Feld */
  labsEl.classList.toggle('is-plate', c.el < 1.3);
  const list = FL.flatMap(st => st.rooms.map(r => ({ r, st })));
  list.sort((a, b) => (b.r === focus) - (a.r === focus) || (b.r.part ? 6 : b.r.area) - (a.r.part ? 6 : a.r.area));
  for (const { r, st } of list) {
    const el = r.el; if (!el) continue;
    const bld = st.fi ? S.og : S.eg, op = show ? E(bld, .86, 1) : 0;
    if (op <= .01 || !st.g.visible) { el.style.opacity = '0'; continue; }
    const o = st.g.position, [x, y, z] = scr(r.pos.x, r.pos.y, r.pos.z, o, Wd, H);
    if (z > 1) { el.style.opacity = '0'; continue; }
    const [f0, f1, f2, f3] = r.fit, Q = [[f0, f1], [f2, f1], [f2, f3], [f0, f3]].map(([a, b]) => scr(a, .05, b, o, Wd, H));
    const cx = (Q[0][0] + Q[1][0] + Q[2][0] + Q[3][0]) / 4, cy = (Q[0][1] + Q[1][1] + Q[2][1] + Q[3][1]) / 4;
    if (!r.sz) measure(r);
    let best = null;
    for (const [w, h, cmp] of r.sz) {
      for (const t of [0, .35, .7, 1]) {
        const px = x + (cx - x) * t, py = y + (cy - y) * t, bx = [px - w / 2, py - h / 2, px + w / 2, py + h / 2];
        if (bx[0] < 4 || bx[1] < 4 || bx[2] > Wd - 4 || bx[3] > H - 4) continue;
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

/* ---------- Bühne: Karte oder Vollbild ---------- */

/* Runde 38: die Großansicht wächst aus der Karte. Die Bühne liegt sofort im Vollbild, nur ein Ausschnitt (clip-path) wächst
   von der Karte bis zum ganzen Bildschirm, der Grundriss bleibt dabei in den Ausschnitt eingepasst und die Seite dahinter wird
   schwarz. Die Leisten kommen erst gegen Ende dazu. Schließen läuft rückwärts und bringt die Ansicht dabei zurück zum Ganzen. */
const easeOut = t => 1 - Math.pow(1 - t, 4);
function morphApply(m, k) {
  m.k = k;
  const Wd = m.el.clientWidth || 1, H = m.el.clientHeight || 1, a = m.r0, q = 1 - k;
  const l = a[0] * q, t = a[1] * q, r = (Wd - a[2]) * q, b = (H - a[3]) * q;
  m.el.style.clipPath = `inset(${t.toFixed(1)}px ${r.toFixed(1)}px ${b.toFixed(1)}px ${l.toFixed(1)}px)`;
  m.dlg.style.setProperty('--grv-dim', Math.min(1, k * 1.5).toFixed(3));
  const f = m.base();
  m.ins = { t: t + lerp(14, f.t, k), b: b + lerp(14, f.b, k), l: l + lerp(10, f.l, k), r: r + lerp(10, f.r, k) };
}
function morphStep(now) {
  const m = morph; if (!m.t0) m.t0 = now;
  const p = clamp((now - m.t0) / m.dur);
  if (m.dir > 0) {
    morphApply(m, easeOut(p));
    if (p > .45 && !m.bars) { m.bars = 1; m.dlg.classList.remove('is-intro'); }
    fitGoal(); c.az = g.az; c.el = g.el; c.dist = g.dist; c.t.copy(g.t);
  } else {
    const e = ease(p); morphApply(m, m.k0 * (1 - e));
    fitGoal();
    const s = m.cs, az = g.az + Math.round((s.az - g.az) / (2 * Math.PI)) * 2 * Math.PI;
    c.az = g.az = lerp(s.az, az, e); c.el = g.el = lerp(s.el, g.el, e); c.dist = g.dist = s.dist * Math.pow(g.dist / s.dist, e);
    c.t.lerpVectors(s.t, g.t, e); g.t.copy(c.t);
  }
  if (p >= 1) { morph = null; m.res(); }
}

/* Hinweis unten links: am Telefon „Mit zwei Fingern verschieben“, mit Maus die Maustasten. Kommt nach dem Öffnen und wieder,
   wenn jemand mit einem Finger zieht (dreht), höchstens dreimal. Wer einmal zwei Finger, Mausrad oder rechte Taste benutzt hat,
   sieht ihn nicht mehr (localStorage gr-two). */
function cueShow(ms) { if (!UI.cue || two || !dlgEl || !dlgEl.open) return; UI.cue.classList.add('is-on'); clearTimeout(cueT); cueT = setTimeout(cueHide, ms); kick(); }
function cueHide() { clearTimeout(cueT); if (UI.cue && UI.cue.classList.contains('is-on')) { UI.cue.classList.remove('is-on'); kick(); } }
function learned() { if (!two) { two = true; try { localStorage.setItem('gr-two', '1'); } catch (e) { /* egal */ } } cueHide(); }

let ro = null, fontsHooked = false;
const resetSizes = () => WORLDS.forEach(w => w.FL.forEach(st => st.rooms.forEach(r => { r.sz = null; })));
function attach(h) {
  host = h;
  h.el.prepend(R.domElement);
  if (h.labs && h.labs !== labsEl) h.labs.remove();
  h.el.appendChild(labsEl); h.labs = labsEl;
  R.setPixelRatio(Math.min(devicePixelRatio || 1, h.dpr));
  const fit = () => { if (host !== h) return; R.setSize(h.el.clientWidth || 1, h.el.clientHeight || 1, false); resetSizes(); reframe(false); render(); };
  /* Schrift geladen: Namen neu messen */
  if (document.fonts && !fontsHooked) { fontsHooked = true; document.fonts.ready.then(() => { resetSizes(); kick(); }); }
  if (ro) ro.disconnect();
  ro = new ResizeObserver(fit); ro.observe(h.el);
  fit();
}
/* Die Leinwand verlässt eine Karte: das letzte Bild bleibt als Standbild (die Namen bleiben, wo sie standen) */
function park() {
  if (!host || host.dlg || !W) return;
  const h = host; render();
  const cv = h.snap, src = R.domElement;
  if (cv) { cv.width = src.width; cv.height = src.height; cv.getContext('2d').drawImage(src, 0, 0); h.root.classList.add('has-snap'); }
  h.root.classList.remove('has-gl');
}

/* Ansage: im Vollbild die Region im Dialog (alles andere ist dann inert), sonst die der Karte */
function announce(t) {
  const l = dlgEl && dlgEl.open ? dlgEl.querySelector('[data-gr-live]') : CUR && CUR.root.querySelector('[data-gr-live]');
  if (l) { l.textContent = ''; setTimeout(() => { l.textContent = t; }, 30); }
}

/* ---------- Bedienung ---------- */

let UI = {};
const scoped = sel => [...(CUR ? CUR.root.querySelectorAll(sel) : []), ...(dlgEl ? dlgEl.querySelectorAll(sel) : [])];
const floorName = () => mode === 'og' ? OGF.name : mode === 'haus' ? 'Ganzes Haus' : (OGF ? EGF.name : 'Grundriss');
function syncUI() {
  if (!W) return;
  scoped('[data-gr-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.grMode === mode)));
  const name = floorName();
  if (UI.floor) UI.floor.textContent = name;
  if (UI.top) { UI.top.disabled = mode === 'haus'; UI.top.setAttribute('aria-pressed', String(tilt && mode !== 'haus')); }
  const n = mode === 'haus' ? 0 : FL[mode === 'og' ? 1 : 0].rooms.filter(r => !r.part).length;
  const desc = `Concept ${HOUSE.name}, ${name} als 3D Modell` + (n ? `, ${n} Räume. Die Räume mit Fläche stehen in der Liste Räume.` : '. ' + (HOUSE.desc || ''));
  scoped('[data-gr-desc]').forEach(el => el.setAttribute('aria-label', desc));
  if (UI.rooms && !UI.rooms.hidden) fillRooms();
}
/* Der Dialog zeigt das Haus der Karte: Titel, bei einem Geschoß nur „Grundriss“ und „Ganzes Haus“ */
function dlgHouse() {
  if (!dlgEl || !W) return;
  const t = dlgEl.querySelector('#grv-title .info'); if (t) t.textContent = 'Concept ' + HOUSE.name;
  dlgEl.querySelectorAll('.grv__tabs').forEach(tb => {
    tb.classList.toggle('is-single', !OGF);
    const og = tb.querySelector('[data-gr-mode="og"]'), eg = tb.querySelector('[data-gr-mode="eg"]');
    if (og) og.hidden = !OGF;
    if (eg) { eg.textContent = OGF ? 'EG' : 'Grundriss'; eg.setAttribute('aria-label', OGF ? 'Erdgeschoß' : 'Grundriss'); }
  });
}
function fillRooms() {
  const list = UI.roomList; list.textContent = '';
  const fis = mode === 'haus' ? FL.map(st => st.fi) : [mode === 'og' ? 1 : 0];
  UI.roomTitle.textContent = mode === 'haus' ? 'Alle Räume' : OGF ? 'Räume im ' + (mode === 'og' ? OGF.name : EGF.name) : 'Räume';
  fis.forEach(fi => {
    if (fis.length > 1) { const h = document.createElement('li'); h.className = 'grv__sub info'; h.textContent = HOUSE.floors[fi].name; list.appendChild(h); }
    FL[fi].rooms.filter(r => !r.part).forEach(r => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.className = 'grv__room';
      b.innerHTML = `<span>${r.list}</span><span class="grv__a">${fmtA(r)}</span>`;
      b.addEventListener('click', () => { closeRooms(); focusRoom(r); });
      li.appendChild(b); list.appendChild(li);
    });
  });
}
function openRooms() { fillRooms(); UI.rooms.hidden = false; kick(); UI.roomsBtn.setAttribute('aria-expanded', 'true'); UI.rooms.querySelector('button').focus(); }
function closeRooms(back = true) { if (!UI.rooms || UI.rooms.hidden) return; UI.rooms.hidden = true; kick(); UI.roomsBtn.setAttribute('aria-expanded', 'false'); if (back) UI.roomsBtn.focus(); }

function gestures(el) {
  const P = new Map(); let p0 = null, lastTap = 0, moved = 0, lastMove = 0, multi = false;
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
    if (e.target.closest('button') || morph) return;
    if (!P.size) multi = false;
    el.setPointerCapture(e.pointerId); P.set(e.pointerId, { x: e.clientX, y: e.clientY, btn: e.button, shift: e.shiftKey || e.ctrlKey || e.metaKey });
    if (P.size > 1) multi = true;
    p0 = snap(); moved = 0; dragging = true; vel = 0;
  });
  el.addEventListener('pointermove', e => {
    if (!P.has(e.pointerId)) return;
    const pt = P.get(e.pointerId), dx = e.clientX - pt.x, dy = e.clientY - pt.y, now = e.timeStamp || performance.now(), et = Math.max(8, now - (pt.t || now - 16)) / 1000; pt.x = e.clientX; pt.y = e.clientY; pt.t = now;
    moved += Math.abs(dx) + Math.abs(dy);
    const s = snap();
    if (s && s.two && p0 && p0.two) { zoom(p0.d / s.d); pan(s.mx - p0.mx, s.my - p0.my); if (moved > 12) learned(); }
    else if (s && !s.two) {
      if (pt.btn === 2 || pt.shift) { pan(dx, dy); if (moved > 12) learned(); }
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
      /* mit einem Finger gezogen (das dreht): zeigen, dass zwei Finger verschieben */
      if (e.pointerType === 'touch' && !multi && moved > 30 && !two && cueN < 3) { cueN++; cueShow(2600); }
      kick();
    }
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => { e.preventDefault(); if (morph) return; zoom(Math.exp(e.deltaY * (e.deltaMode ? .05 : .0015))); learned(); kick(); }, { passive: false });
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
    if (used) { e.preventDefault(); cueHide(); kick(); }
  });
  return { zoom, turn: a => { g.az += a; untop(); kick(); } };
}

/* ---------- Karten ---------- */

const HOSTS = [];
let activating = null;
/* Eine Karte bekommt die Leinwand: ihr Haus wird (wenn nötig) gebaut und gebunden, die bisherige Karte behält ein Standbild */
async function activate(h) {
  if (dlgEl && dlgEl.open) return;
  if (host === h && W && W.key === h.house) return;
  const my = activating = {};
  const w = await ensureWorld(h.house);
  if (my !== activating || (dlgEl && dlgEl.open)) return;
  if (host && host !== h && !host.dlg) park();
  if (W !== w) { settle(); bind(w); }
  CUR = h;
  attach(h);
  h.root.classList.add('has-gl'); h.root.classList.remove('has-snap');
  if (!h.inited) {
    h.inited = true;
    /* ohne Poster (free-grundriss.html): das Erdgeschoß baut sich auf, sobald es zu sehen ist */
    if (!h.poster && mode === 'eg' && !LAST[w.key]) { Object.assign(S, { eg: 0, og: 0, ext: 0, slab: 0, roof: 0, lift: 1 }); setMode('eg'); }
  }
  dlgHouse(); syncUI(); kick();
}

function tabs(list, h) {
  list.querySelectorAll('[data-gr-mode]').forEach(b => b.addEventListener('click', async () => {
    if (h && (CUR !== h || !W || W.key !== h.house)) await activate(h);
    if (b.dataset.grMode === mode && !anims.length) { tilt = false; syncUI(); reframe(true); return; }
    setMode(b.dataset.grMode); announce(b.getAttribute('aria-label') || b.textContent);
  }));
}

const idle = fn => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200));

/* Runde 49: dasselbe Haus für den Services Film (js/svc-film3d.js), mit dessen Renderer, Kamera und Licht. Die Welt entsteht wie hier
   (Wände, Fassaden, Fenster, Möbel, Decke, Dach aus data/grundriss-<haus>.js), ihr Zustand S (eg, og, ext, slab, roof, lift) kommt
   von außen, apply() setzt ihn. Auf einer Seite ohne Karten [data-gr] ist das die einzige Welt, die hier gebaut wird. */
export async function houseWorld(key, renderer) {
  if (!ENV) { const pm = new T.PMREMGenerator(renderer); ENV = pm.fromScene(new RoomEnvironment(renderer), .04).texture; pm.dispose(); }
  const H = await loadHouse(key);
  const w = buildWorld(key, H);
  w.S = { eg: 1, og: 1, ext: 1, slab: 1, roof: 1, lift: 1 };
  geo(w);
  return {
    H, scene: w.scene, S: w.S, FL: w.FL, roofs: w.roofs, slabs: w.slabs, HT: H.h, K: H.K, ORX: w.ORX, ORY: w.ORY, top: w.TOP,
    toWorld: (x, y, fi = 0) => { const off = (H.floors[fi] && H.floors[fi].off) || [0, 0]; return [(x + off[0] - w.ORX) / H.K, (y + off[1] - w.ORY) / H.K]; },
    apply() { geo(w); apply(); }
  };
}

export async function initGrundriss() {
  const roots = [...document.querySelectorAll('[data-gr]')]; if (!roots.length) return;
  const dlg = document.querySelector('[data-grv]'); dlgEl = dlg;
  roots.forEach(root => {
    const stageEl = root.querySelector('[data-gr-stage]');
    const h = { root, el: stageEl, card: root.querySelector('.gr__card'), house: root.dataset.grHouse || 'free', dpr: 1.5, insets: () => ({ t: 14, b: 14, l: 10, r: 10 }), poster: root.querySelector('.gr__poster'), snap: root.querySelector('.gr__snap'), inited: false };
    HOSTS.push(h);
  });
  /* Daten früh holen (klein), gebaut wird erst in der Nähe */
  const near = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; near.unobserve(e.target);
    const h = HOSTS.find(x => x.root === e.target); loadHouse(h.house).then(() => idle(() => { if (R) ensureWorld(h.house); }));
  }), { rootMargin: '700px 0px' });
  roots.forEach(r => near.observe(r));
  await new Promise(res => { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); res(); } }, { rootMargin: '900px 0px' }); roots.forEach(r => io.observe(r)); });
  try {
    stage();
  } catch (e) {
    console.warn('Grundriss 3D nicht möglich', e);
    roots.forEach(r => r.classList.add('is-fallback')); return;
  }
  roots.forEach(r => r.classList.add('is-ready'));
  window.__gr = { R, WORLDS, get W() { return W; }, get S() { return S; }, get FL() { return FL; }, c, g, HOSTS, setMode: m => setMode(m), activate };
  /* Welche Karte ist am meisten zu sehen: dorthin wandert die Leinwand (die gezeigte behält sie bei Gleichstand) */
  const vis = new Map();
  let pend = 0;
  const pick = () => {
    pend = 0; if (dlg && dlg.open) return;
    let best = null, br = .12;
    vis.forEach((r, h) => { const s = r + (h === CUR ? .15 : 0); if (r > .12 && s > br) { br = s; best = h; } });
    if (best && (best !== CUR || !host)) activate(best);
  };
  const io2 = new IntersectionObserver(es => { es.forEach(e => vis.set(HOSTS.find(x => x.card === e.target), e.isIntersecting ? e.intersectionRatio : 0)); if (!pend) pend = requestAnimationFrame(pick); }, { threshold: [0, .12, .25, .4, .6, .8, 1] });
  HOSTS.forEach(h => io2.observe(h.card));
  HOSTS.forEach(h => h.root.querySelectorAll('.gr__tabs').forEach(l => tabs(l, h)));
  if (!dlg) return;
  /* Vollbild */
  UI = {
    floor: dlg.querySelector('[data-grv-floor]'), top: dlg.querySelector('[data-grv-top]'), cue: dlg.querySelector('[data-grv-cue]'),
    rooms: dlg.querySelector('[data-grv-rooms]'), roomsBtn: dlg.querySelector('[data-grv-rooms-btn]'), roomList: dlg.querySelector('[data-grv-list]'), roomTitle: dlg.querySelector('[data-grv-rooms-title]')
  };
  dlg.querySelectorAll('.grv__tabs').forEach(l => tabs(l, null));
  const stageEl = dlg.querySelector('[data-grv-stage]'), ctl = gestures(stageEl);
  const DLG = {
    dlg: true, el: stageEl, dpr: 2, insets: () => {
      const tp = dlg.querySelector('.grv__top'), bt = dlg.querySelector('.grv__bottom'), sd = dlg.querySelector('.grv__side');
      const wide = stageEl.clientWidth >= 820, bh = bt ? bt.offsetHeight : 140;
      dlg.style.setProperty('--grv-bottom', bh + 'px');
      return { t: (tp ? tp.offsetHeight : 60) + 8, b: wide ? bh + 40 : bh + 10, l: wide ? 40 : 10, r: wide ? (sd ? sd.offsetWidth : 48) + 56 : 14 };
    },
    /* Flächen der Bedienung über dem Bild: dort steht kein Raumname */
    block: () => {
      const s0 = stageEl.getBoundingClientRect();
      return [...dlg.querySelectorAll('.grv__top,.grv__bottom,.grv__side,.grv__rooms:not([hidden]),.grv__cue.is-on')].map(e => { const q = e.getBoundingClientRect(); return [q.left - s0.left - 4, q.top - s0.top - 4, q.right - s0.left + 4, q.bottom - s0.top + 4]; });
    }
  };
  let opener = null, cueWait = 0, from = null;
  const box4 = r => { const s0 = stageEl.getBoundingClientRect(); return [r.left - s0.left, r.top - s0.top, r.right - s0.left, r.bottom - s0.top]; };
  /* Karte außer Sicht (zum Beispiel nach dem Drehen des Telefons): dann aus der Mitte */
  const cardBox = () => {
    const r = from.card.getBoundingClientRect(), Wd = innerWidth, H = innerHeight;
    if (r.bottom > 60 && r.top < H - 60) return box4(r);
    const w = Wd * .8, hh = w * r.height / (r.width || 1);
    return box4({ left: (Wd - w) / 2, top: (H - hh) / 2, right: (Wd + w) / 2, bottom: (H + hh) / 2 });
  };
  const opened = () => {
    stageEl.style.clipPath = ''; dlg.classList.remove('is-intro'); dlg.style.removeProperty('--grv-dim');
    clearTimeout(cueWait); cueWait = setTimeout(() => cueShow(4500), 250);
  };
  const open = async (e, h) => {
    if (dlg.open) return;
    opener = e && e.currentTarget; cueN = 0;
    await activate(h); if (dlg.open || CUR !== h) return;
    from = h;
    /* Runde 43: das echte <html> (in Framer ist document auf die Sektion begrenzt), damit die Seite dahinter stillsteht */
    globalThis.document.documentElement.classList.add('grv-open');
    if (!reduce) { dlg.classList.add('is-intro'); dlg.style.setProperty('--grv-dim', '0'); }
    dlgHouse();
    dlg.showModal();
    if (!reduce) { morph = { dir: 1, dur: 720, el: stageEl, dlg, base: DLG.insets, r0: cardBox(), res: opened }; morphApply(morph, 0); }
    attach(DLG); syncUI(); kick();
    if (reduce) cueShow(4500);
    /* Zurück schließt die Großansicht; den Zustand der Seite (Framers Router) behalten */
    history.pushState({ ...(history.state || {}), grv: 1 }, '');
    announce(`Großansicht, Concept ${HOUSE.name}. ${floorName()}. Ein Finger dreht, zwei Finger verschieben und zoomen.`);
  };
  /* zurück auf die Seite, gleich nach dlg.close(), damit die Karte keinen Moment leer ist */
  const after = () => {
    if (host !== DLG) return;
    morph = null; clearTimeout(cueWait); cueHide();
    stageEl.style.clipPath = ''; dlg.classList.remove('is-intro'); dlg.style.removeProperty('--grv-dim');
    globalThis.document.documentElement.classList.remove('grv-open'); tilt = false; focus = null;
    attach(from); reframe(false); syncUI();
    if (history.state && history.state.grv) history.back();
    if (opener) opener.focus({ preventScroll: true });
    pick();
  };
  const close = () => {
    if (!dlg.open || (morph && morph.dir < 0)) return;
    closeRooms(false); clearTimeout(cueWait); cueHide();
    if (reduce) { dlg.close(); after(); return; }
    const k0 = morph ? morph.k : 1;
    tilt = false; focus = null; syncUI(); dlg.classList.add('is-intro');
    morph = { dir: -1, dur: 580, k0, el: stageEl, dlg, base: DLG.insets, r0: cardBox(), cs: { az: c.az, el: c.el, dist: c.dist, t: c.t.clone() }, res: () => { dlg.close(); after(); } };
    kick();
  };
  dlg.addEventListener('close', after);
  addEventListener('popstate', () => { if (dlg.open) close(); });
  HOSTS.forEach(h => h.root.querySelectorAll('[data-gr-open]').forEach(b => b.addEventListener('click', e => open(e, h))));
  dlg.querySelector('[data-grv-close]').addEventListener('click', () => close());
  /* Escape: erst die Raumliste, dann animiert schließen (geht das nicht, schließt der Browser direkt und after() räumt auf) */
  dlg.addEventListener('cancel', e => { if (!e.cancelable) return; e.preventDefault(); if (!UI.rooms.hidden) closeRooms(); else close(); });
  dlg.querySelector('[data-grv-build]').addEventListener('click', () => { tilt = false; setMode('haus', { build: true }); });
  UI.top.addEventListener('click', () => { tilt = !tilt; syncUI(); reframe(true); announce(tilt ? '3D Ansicht, schräg von oben.' : 'Grundriss von oben, Norden oben.'); });
  UI.roomsBtn.addEventListener('click', () => (UI.rooms.hidden ? openRooms() : closeRooms()));
  dlg.querySelector('[data-grv-rooms-done]').addEventListener('click', () => closeRooms());
  dlg.querySelectorAll('[data-grv-zoom]').forEach(b => b.addEventListener('click', () => { ctl.zoom(Number(b.dataset.grvZoom)); kick(); }));
  dlg.querySelectorAll('[data-grv-turn]').forEach(b => b.addEventListener('click', () => { ctl.turn(Number(b.dataset.grvTurn) * Math.PI / 8); }));
}

initGrundriss();
