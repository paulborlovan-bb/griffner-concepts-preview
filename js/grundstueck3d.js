/* Runde 48: „Alles aus einer Hand“, das Grundstück als Modell (three.js), gebaut über das Scrollen.
   Zehn Schritte: Grundstück mit Schnurgerüst → Fundament → das Haus kommt aus der Manufaktur (Wände, Decke, Obergeschoß, Dach)
   → Innenausbau (das Obergeschoß hebt ab, darunter Eiche, Küche, Essplatz, Sofa, Bett) → Carport mit Eingangsüberdachung, das Auto fährt ein
   → Holzterrassen mit Überdachung und Lounge → Pool (die Wiese sinkt, das Wasser steigt) → Garten (Rasen, Bäume, Hecken, Beete, Essplatz, Mauer)
   → Sauna, Glashaus, Gartenhütte → das Ganze. setU(u) setzt den Fortschritt (0 bis 9, gebrochen), alles läuft mit und auch zurück.
   Ziehen dreht, Strg/Pinch oder die Knöpfe zoomen. Im letzten Schritt sind die Nummern Wegweiser: Klick fliegt hin (opt.onPick).
   Lage aus data/grundstueck.js. Maße in m, x nach rechts, z zur Gartenseite, y nach oben. */
import * as T from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { prism, cube, MAT } from './svc-geo.js';
import { BUILD, car, pendant } from './grundriss-moebel.js';
import * as G from '../data/grundstueck.js';

const L = G.LAWN, W = .42, PJ = .26;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (u, a, b) => cl((u - a) / (b - a));
const eio = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = t => 1 - Math.pow(1 - t, 3);
const eback = t => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

/* Blick je Schritt: Ziel, Azimut (0 = von der Gartenseite), Höhe, Abstand */
const VIEWS = [
  { t: [-0.8, -0.5, 2.6], az: -0.1, el: 1.18, d: 96 },   // 0 Grundstück, fast wie der Plan von oben
  { t: [2.6, -0.2, -9.0], az: -0.58, el: .6, d: 36 },     // 1 Fundament
  { t: [2.0, 2.6, -9.6], az: -0.8, el: .3, d: 43 },       // 2 Haus
  { t: [3.4, 4.2, -9.6], az: -0.28, el: .6, d: 49 },      // 3 Innen, Obergeschoß schwebt
  { t: [-8.2, 1.0, -12.4], az: -1.02, el: .3, d: 27 },    // 4 Carport
  { t: [8.6, 0.6, -5.2], az: .64, el: .34, d: 28 },       // 5 Terrasse
  { t: [7.8, -0.4, 1.2], az: .3, el: .5, d: 23 },         // 6 Pool
  { t: [-0.5, -0.4, 4.5], az: -0.24, el: .55, d: 62 },    // 7 Garten
  { t: [6.0, 0.6, -2.5], az: .62, el: .5, d: 60 },        // 8 Sauna, Glashaus, Hütte: vom Garten her, die Sauna rechts neben dem Haus
  { t: [-0.8, 0.0, 2.4], az: -0.5, el: .62, d: 76 }       // 9 Das Ganze
];
/* Blick beim Antippen einer Nummer im fertigen Modell: höher, damit Bäume und Hecken nicht davor stehen */
const PICK = { 3: { d: 54 }, 4: { az: -2.4, el: .62, d: 32 }, 5: { az: 1.0, el: .82, d: 36 }, 6: { az: 1.15, el: .8, d: 30 } };   // Carport von der Straße, Terrasse und Pool von Osten
/* Nummer am Modell je Schritt (Schritt 0 und 9 ohne) */
const ANCH = [null, [4.0, 0.05, -5.6], [3.2, 6.95, -9.2], [5.2, 1.4, -8.6], [-8.8, 3.1, -13.4], [7.25, 3.25, -3.9], [7.7, -0.35, 1.8], [0.2, 6.7, 3.6], [4.6, 2.8, 9.4], null];

export async function createGrundstueck(host, opt = {}) {
  const labels = opt.labels || [];
  const gl = document.createElement('div'); gl.className = 'gs__gl';
  const marks = document.createElement('div'); marks.className = 'sh__marks gs__marks';
  host.append(gl, marks);

  const R = new T.WebGLRenderer({ antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.domElement.style.cssText = 'display:block;width:100%;height:100%';
  gl.appendChild(R.domElement);
  const scene = new T.Scene(); scene.background = new T.Color(opt.bg ?? 0xffffff);
  const pmrem = new T.PMREMGenerator(R); scene.environment = pmrem.fromScene(new RoomEnvironment(R), .04).texture; pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff, 0xcfc8bd, .4));
  const sun = new T.DirectionalLight(0xfff1e0, 2.2); sun.position.set(-26, 40, 22); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const cam = new T.PerspectiveCamera(28, 1, .5, 700);
  const root = new T.Group(); scene.add(root);

  /* ---------- Materialien ---------- */
  const mc = new Map();
  const mat = n => { if (!mc.has(n)) mc.set(n, MAT[n]()); return mc.get(n); };
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .9, metalness: 0, ...o });
  const XM = {
    frame: mat('frame'), slats: mat('slats'), glass: mat('glass'), white: mat('paint'), concrete: mat('concrete'), screed: mat('screed'),
    oak: mat('oak'), board: mat('board'), larch: mat('larch'), earth: mat('earth'), gravel: mat('gravel'), alu: mat('alu'), spruce: mat('spruce'),
    lawn: std(0xcbbfa8, { roughness: 1 }), leafG: std(0x9aa45c, { flatShading: true }), leafD: std(0x56683f, { flatShading: true }), hedge: std(0x52623d, { roughness: 1 }),
    trunk: std(0x5b4a3a), stone: std(0x8d8981, { flatShading: true }), soil: std(0x4a3a2c, { roughness: 1 }), herb: std(0x6f8a4a, { flatShading: true }),
    berry: std(0x4f6239, { flatShading: true }), tile: std(0xdfe9eb, { roughness: .35 }),
    water: new T.MeshStandardMaterial({ color: 0x78aeb9, roughness: .06, metalness: .05, transparent: true, opacity: .84, depthWrite: false }),
    sail: std(0xFFB200, { side: T.DoubleSide, roughness: .85 }), string: new T.MeshBasicMaterial({ color: 0xfafaf7 }), dark: std(0x262625, { roughness: .6 }),
    grill: std(0x1e1e1d, { roughness: .45, metalness: .3 })
  };
  const RAW = new T.Color(0xcbbfa8), LAWNC = new T.Color(0xeef1e6);   // ohne Textur wie im Architekturmodell: rohes Gelände hell wie Sand, der fertige Rasen fast weiß mit einem Hauch Grün
  XM.lawn.color.copy(RAW);

  const add = (geo, m, parent = root, o = {}) => {
    const x = new T.Mesh(geo, m); x.castShadow = o.cast !== false; x.receiveShadow = true; parent.add(x); return x;
  };
  const put = (obj, parent, x, y, z, ry = 0) => {
    obj.position.set(x, y, z); obj.rotation.y = ry;
    obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    parent.add(obj); return obj;
  };

  /* ---------- Aufbau über das Scrollen: jede Gruppe gehört zu einem Schritt ---------- */
  const anims = [];
  /* kind: grow (wächst von y0 nach oben), drop (fällt H m ein), pop (wächst aus dem Punkt), wipe (rollt in x aus), slide (fährt um v ein), sink (geht unter) */
  function grp(step, kind, o = {}) {
    const g = new T.Group(), inner = new T.Group(); g.add(inner); (o.parent || root).add(g);
    const a = { g, inner, step, kind, d: o.d || 0, until: o.until, H: o.H ?? 9, v: o.v, y0: o.y0 ?? L, x0: o.x0 ?? 0, at: o.at || [0, 0, 0] };
    if (kind === 'grow') { g.position.y = a.y0; inner.position.y = -a.y0; }
    if (kind === 'wipe') { g.position.x = a.x0; inner.position.x = -a.x0; }
    if (kind === 'pop') { g.position.set(...a.at); inner.position.set(-a.at[0], -a.at[1], -a.at[2]); }
    anims.push(a); return inner;
  }
  function kOf(a, u) {
    if (a.step <= 0 && !a.until) return 1;
    let k;
    if (reduceMotion) k = u >= a.step - .35 ? 1 : 0;
    else { const s0 = a.step - .62 + a.d * .32; k = seg(u, s0, s0 + .34); }
    if (a.until) k *= 1 - (reduceMotion ? (u >= a.until - .35 ? 1 : 0) : seg(u, a.until - .62, a.until - .36));
    return k;
  }
  function applyA(a, k) {
    /* was untergeht, ist bis dahin da; alles andere erscheint erst mit seinem Schritt */
    const on = a.kind === 'sink' ? k < .999 : k > .001;
    if (a.g.visible !== on) a.g.visible = on;
    if (!on) return;
    switch (a.kind) {
      case 'grow': a.g.scale.y = Math.max(.001, eo(k)); break;
      case 'drop': a.g.position.y = (1 - eo(k)) * a.H; break;
      case 'pop': a.g.scale.setScalar(Math.max(.001, eback(k))); break;
      case 'wipe': a.g.scale.x = Math.max(.001, eo(k)); break;
      case 'slide': { const e = 1 - eio(k); a.g.position.set(a.v[0] * e, a.v[1] * e, a.v[2] * e); break; }
      case 'sink': a.g.position.y = -eio(k) * 1.6; break;
    }
  }

  /* ---------- Gelände: Erdsockel, Wiese mit Loch für den Pool, die Wiese über dem Pool sinkt später ---------- */
  const P = G.POOL, poolHole = [[P.x0, P.z0], [P.x1, P.z0], [P.x1, P.z1], [P.x0, P.z1]];
  add(prism('y', G.PLOT, L - 2.2, L - .05, [poolHole]), XM.earth);
  add(prism('y', G.PLOT, L - .05, L, [poolHole]), XM.lawn, root, { cast: false });
  const catcher = new T.Mesh(new T.PlaneGeometry(400, 400), new T.ShadowMaterial({ opacity: .12 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = L - 2.2; catcher.receiveShadow = true; scene.add(catcher);
  /* Becken: Boden, Wände in hellem Fliesenton, knapp innerhalb des Lochs */
  {
    const t = .03, yb = L - 1.5;
    add(cube(P.x0, yb - .1, P.z0, P.x1, yb, P.z1), XM.tile, root, { cast: false });
    /* Wände enden knapp unter der Wiese, damit vor dem Pool kein Rand durchscheint */
    const yt = L - .052;
    add(cube(P.x0, yb, P.z0, P.x0 + t, yt, P.z1), XM.tile); add(cube(P.x1 - t, yb, P.z0, P.x1, yt, P.z1), XM.tile);
    add(cube(P.x0, yb, P.z0, P.x1, yt, P.z0 + t), XM.tile); add(cube(P.x0, yb, P.z1 - t, P.x1, yt, P.z1), XM.tile);
    const cover = grp(6, 'sink', { d: 0 });
    add(cube(P.x0, L - .05, P.z0, P.x1, L, P.z1), XM.lawn, cover, { cast: false });
    const water = grp(6, 'grow', { d: .55, y0: yb });
    const wm = add(cube(P.x0 + t, yb, P.z0 + t, P.x1 - t, L - .07, P.z1 - t), XM.water, water, { cast: false }); wm.renderOrder = 2;
  }

  /* ---------- 0 Schnurgerüst: Böcke und Schnüre um den Grundriss, bis das Haus steht ---------- */
  {
    const H = G.HAUS, o = 1.4, y = L + .7;
    const sg = grp(0, 'pop', { until: 2, at: [(H.x0 + H.x1) / 2, L, (H.z0 + H.z1) / 2] });
    const xs = [H.x0, H.x1], zs = [H.z0, H.z1];
    /* Schnüre entlang der Hauskanten, über die Ecken hinaus bis zu den Böcken */
    zs.forEach(z => add(cube(H.x0 - o, y - .006, z - .006, H.x1 + o, y + .006, z + .006), XM.string, sg, { cast: false }));
    xs.forEach(x => add(cube(x - .006, y - .006, H.z0 - o, x + .006, y + .006, H.z1 + o), XM.string, sg, { cast: false }));
    /* Böcke: je Ecke zwei Pfähle und ein Brett, außen vor den Schnüren */
    xs.forEach(x => zs.forEach(z => {
      const sx = x === H.x0 ? -1 : 1, sz = z === H.z0 ? -1 : 1;
      const bx = x + sx * (o + .1), bz = z + sz * (o + .1);
      [[bx, z], [x, bz]].forEach(([px, pz]) => {
        add(cube(px - .05, L, pz - .05, px + .05, y + .12, pz + .05), XM.spruce, sg);
      });
      add(cube(Math.min(bx, x) - .3, y - .06, bz - .02, Math.max(bx, x) + .3, y + .06, bz + .02), XM.spruce, sg);
      add(cube(bx - .02, y - .06, Math.min(bz, z) - .3, bx + .02, y + .06, Math.max(bz, z) + .3), XM.spruce, sg);
    }));
  }

  /* ---------- 1 Fundament: Bodenplatte unter Haus und Anbauten, wächst aus der Erde ---------- */
  {
    const fp = [G.HAUS, ...G.ANBAU];
    fp.forEach((f, i) => {
      const g = grp(1, 'grow', { d: i * .18, y0: L - .6 });
      add(cube(f.x0 - .08, L - .6, f.z0 - .08, f.x1 + .08, 0, f.z1 + .08), XM.concrete, g);
    });
  }

  /* ---------- 2 Das Haus ---------- */
  const H = G.HAUS, GF1 = 3.0, OG0 = 3.25, OG1 = 6.2, RF = 6.5, AT = 6.72;
  /* Wand entlang x an der Fläche z (nach innen: s = +1 → +z), mit Öffnungen [a0, a1, y0, y1] */
  function wallX(par, x0, x1, z, s, y0, y1, holes) {
    const zo = s > 0 ? z : z - W, zi = s > 0 ? z + W : z;
    const hs = holes.map(([a, b, c, d]) => [[a, c], [b, c], [b, d], [a, d]]);
    const poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    add(prism('z', poly, s > 0 ? zo : zo + .015, s > 0 ? zi - .015 : zi, hs), XM.slats, par);
    add(prism('z', [[x0 + W, y0], [x1 - W, y0], [x1 - W, y1], [x0 + W, y1]], s > 0 ? zi - .015 : zo, s > 0 ? zi : zo + .015, hs.map(h => h.map(([a, b]) => [cl(a, x0 + W, x1 - W), b]))), XM.white, par, { cast: false });
    holes.forEach(([a, b, c, d, open]) => open || pane(par, 'x', a, b, c, d, (zo + zi) / 2));
  }
  /* Wand entlang z an der Fläche x (nach innen: s = +1 → +x) */
  function wallZ(par, z0, z1, x, s, y0, y1, holes) {
    const xo = s > 0 ? x : x - W, xi = s > 0 ? x + W : x;
    const hs = holes.map(([a, b, c, d]) => [[a, c], [b, c], [b, d], [a, d]]);
    add(prism('x', [[z0, y0], [z1, y0], [z1, y1], [z0, y1]], s > 0 ? xo : xo + .015, s > 0 ? xi - .015 : xi, hs), XM.slats, par);
    add(prism('x', [[z0, y0], [z1, y0], [z1, y1], [z0, y1]], s > 0 ? xi - .015 : xo, s > 0 ? xi : xo + .015, hs), XM.white, par, { cast: false });
    holes.forEach(([a, b, c, d]) => pane(par, 'z', a, b, c, d, (xo + xi) / 2));
  }
  /* Fenster in der Öffnung: dunkler Rahmen, Glas */
  function pane(par, ax, a, b, c, d, w) {
    const f = .06, t = .07;
    const box = ax === 'x' ? (u0, v0, u1, v1, w0, w1) => cube(u0, v0, w0, u1, v1, w1) : (u0, v0, u1, v1, w0, w1) => cube(w0, v0, u0, w1, v1, u1);
    [[a, c, b, c + f], [a, d - f, b, d], [a, c, a + f, d], [b - f, c, b, d]].forEach(([u0, v0, u1, v1]) => add(box(u0, v0, u1, v1, w - t, w + t), XM.frame, par, { cast: false }));
    if (b - a > 2.4) { const m = (a + b) / 2; add(box(m - .03, c, m + .03, d, w - t, w + t), XM.frame, par, { cast: false }); }
    add(box(a + f, c + f, b - f, d - f, w - .006, w + .006), XM.glass, par, { cast: false });
  }
  {
    /* Erdgeschoß, Seite für Seite aus der Manufaktur */
    const gS = grp(2, 'drop', { d: 0, H: 11 }), gN = grp(2, 'drop', { d: .12, H: 11 }), gW = grp(2, 'drop', { d: .24, H: 11 }), gE = grp(2, 'drop', { d: .36, H: 11 });
    wallX(gS, H.x0, H.x1, H.z1, -1, 0, GF1, [[-2.4, 0.6, 0, 2.6], [1.3, 5.1, 0, 2.62, 1], [5.8, 8.8, 0, 2.6]]);
    wallX(gN, H.x0, H.x1, H.z0, 1, 0, GF1, [[3.0, 4.0, 1.0, 2.2], [6.0, 8.6, .9, 2.3]]);
    wallZ(gW, H.z0 + W, H.z1 - W, H.x0, 1, 0, GF1, [[-11.0, -9.6, 0, 2.4], [-7.8, -6.0, .9, 2.3]]);
    wallZ(gE, H.z0 + W, H.z1 - W, H.x1, -1, 0, GF1, [[-11.8, -9.8, 0, 2.6], [-8.0, -6.0, 0, 2.6]]);
    /* Estrich, Innenwände, Ecken des Rahmens */
    const gIn = grp(2, 'drop', { d: .42, H: 6 });
    add(cube(H.x0 + W, 0, H.z0 + W, H.x1 - W, .015, H.z1 - W), XM.screed, gIn, { cast: false });
    [[5.6, -12.78, 5.72, -10.4], [5.6, -10.52, 6.0, -10.4], [6.9, -10.52, 8.88, -10.4], [.5, -12.78, .62, -11.0], [-2.48, -11.12, -.6, -11.0], [.3, -11.12, .62, -11.0]]
      .forEach(([x0, z0, x1, z1]) => add(cube(x0, 0, z0, x1, GF1 - .02, z1), XM.white, gIn));
    [[H.x0, H.z0], [H.x1, H.z0], [H.x0, H.z1], [H.x1, H.z1]].forEach(([x, z]) => {
      const sx = x === H.x0 ? -1 : 1, sz = z === H.z0 ? -1 : 1;
      add(cube(Math.min(x, x + sx * PJ), 0, Math.min(z, z + sz * PJ), Math.max(x, x + sx * PJ), GF1, Math.max(z, z + sz * PJ)), XM.frame, gIn);
    });
  }
  /* Obergeschoß: Decke mit Band, Wände, Dach mit Attika. Hebt in Schritt 3 ab, damit du hineinsiehst */
  const upper = new T.Group(); root.add(upper);
  {
    const band = (par, y0, y1) => {
      add(cube(H.x0 - PJ, y0, H.z1, H.x1 + PJ, y1, H.z1 + PJ), XM.frame, par); add(cube(H.x0 - PJ, y0, H.z0 - PJ, H.x1 + PJ, y1, H.z0), XM.frame, par);
      add(cube(H.x0 - PJ, y0, H.z0, H.x0, y1, H.z1), XM.frame, par); add(cube(H.x1, y0, H.z0, H.x1 + PJ, y1, H.z1), XM.frame, par);
    };
    const gD = grp(2, 'drop', { d: .52, H: 10, parent: upper });
    add(cube(H.x0, GF1, H.z0, H.x1, OG0, H.z1), mat('slab'), gD);
    band(gD, GF1 - .08, OG0 + .22);
    const gO = grp(2, 'drop', { d: .64, H: 10, parent: upper });
    wallX(gO, H.x0, H.x1, H.z1, -1, OG0, OG1, [[-2.4, 1.6, 3.55, 5.95], [4.0, 8.8, 3.55, 5.95]]);
    wallX(gO, H.x0, H.x1, H.z0, 1, OG0, OG1, [[-1.8, .4, 4.2, 5.6], [5.0, 8.4, 4.0, 5.9]]);
    wallZ(gO, H.z0 + W, H.z1 - W, H.x0, 1, OG0, OG1, [[-11.5, -9.5, 4.0, 5.6]]);
    wallZ(gO, H.z0 + W, H.z1 - W, H.x1, -1, OG0, OG1, [[-11.0, -7.0, 3.55, 5.95]]);
    [[H.x0, H.z0], [H.x1, H.z0], [H.x0, H.z1], [H.x1, H.z1]].forEach(([x, z]) => {
      const sx = x === H.x0 ? -1 : 1, sz = z === H.z0 ? -1 : 1;
      add(cube(Math.min(x, x + sx * PJ), OG0, Math.min(z, z + sz * PJ), Math.max(x, x + sx * PJ), OG1, Math.max(z, z + sz * PJ)), XM.frame, gO);
    });
    const gR = grp(2, 'drop', { d: .78, H: 10, parent: upper });
    add(cube(H.x0, OG1, H.z0, H.x1, RF, H.z1), mat('slab'), gR);
    add(cube(H.x0 + .2, RF, H.z0 + .2, H.x1 - .2, RF + .02, H.z1 - .2), mat('membrane'), gR, { cast: false });
    band(gR, OG1 - .1, AT);
  }
  /* Anbauten: Technik zur Straße, Eingang, verglaster Essplatz */
  {
    G.ANBAU.forEach((b, i) => {
      const g = grp(2, 'drop', { d: .3 + i * .14, H: 9 });
      if (b.glas) {
        [[b.x0, b.z1], [b.x1, b.z1], [b.x0 + .02, b.z0 + .02], [b.x1 - .02, b.z0 + .02]].forEach(([x, z]) => add(cube(x - .07, 0, z - .07, x + .07, b.h - .2, z + .07), XM.frame, g));
        pane(g, 'x', b.x0 + .07, b.x1 - .07, 0, b.h - .2, b.z1);
        pane(g, 'z', b.z0 + .1, b.z1 - .07, 0, b.h - .2, b.x0);
        pane(g, 'z', b.z0 + .1, b.z1 - .07, 0, b.h - .2, b.x1);
        add(cube(b.x0, 0, b.z0, b.x1, .015, b.z1), XM.screed, g, { cast: false });
      } else {
        add(cube(b.x0, 0, b.z0, b.x1, b.h - .2, b.z1), XM.slats, g);
      }
      add(cube(b.x0 - .12, b.h - .3, b.z0 - .12, b.x1 + .12, b.h, b.z1 + .12), XM.frame, g);
      if (b.k === 'eingang') {
        /* Haustür Holz-Alu mit Seitenteil zum Carport */
        add(cube(b.x0 - .03, 0, -10.9, b.x0, 2.35, -9.85), mat('frameNatur'), g, { cast: false });
        add(cube(b.x0 - .025, 0, -9.85, b.x0 - .005, 2.35, -9.3), XM.dark, g, { cast: false });
        add(cube(b.x0 - .05, 2.35, -10.95, b.x0, 2.43, -9.25), XM.frame, g, { cast: false });
      }
      if (b.k === 'technik') add(cube(-4.6, 0, b.z0 - .02, -2.4, 2.4, b.z0 + .03), XM.frame, g, { cast: false });
    });
  }

  /* ---------- 3 Innenausbau: Eiche rollt aus, Treppe, Küche, Essplatz, Sofa, Bett, Bad ---------- */
  {
    const fl = grp(3, 'wipe', { d: 0, x0: H.x0 + W });
    add(cube(H.x0 + W, .015, H.z0 + W, H.x1 - W, .03, H.z1 - W), XM.oak, fl, { cast: false });
    const flb = grp(3, 'wipe', { d: .1, x0: 1.2 });
    add(cube(1.25, .015, -5.15, 5.15, .03, -3.25), XM.oak, flb, { cast: false });
    const st = grp(3, 'drop', { d: .2, H: 3 });
    const n = 15, r = OG0 / (n + 1);
    for (let i = 0; i < n; i++) add(cube(1.5 + i * .26, r * (i + 1) - .05, -12.76, 1.5 + (i + 1) * .26 + .02, r * (i + 1), -11.8), XM.oak, st);
    const fu = [
      [BUILD.island(2.4, 1.0, {}), -.2, -8.1, 0],
      [BUILD.counter(3.6, .65, {}), -2.12, -8.3, Math.PI / 2],
      [BUILD.table(2.2, 1.0, {}), 3.2, -4.2, 0],
      [BUILD.sofa(2.8, 1.0, { c: 'kalk' }), 7.3, -7.5, 0],
      [BUILD.coffee(1.1, .6, {}), 7.3, -6.4, 0],
      [BUILD.plant(.5, .5, { big: 1 }), 8.55, -5.95, 0],
      [BUILD.bed(1.8, 2.1, { c: 'sand' }), 7.5, -11.65, 0],
      [BUILD.tub(1.7, .75, {}), -1.5, -12.3, 0]
    ];
    [-1, 1].forEach(sd => [2.45, 3.2, 3.95].forEach(x => fu.push([BUILD.chair(.48, .52, {}), x, -4.2 + sd * .72, sd > 0 ? Math.PI : 0])));
    fu.forEach(([o, x, z, ry], i) => put(o, grp(3, 'drop', { d: .25 + (i % 8) * .08, H: 2.6 }), x, .03, z, ry));
    put(pendant(2.65), grp(3, 'drop', { d: .7, H: 2 }), 3.2, .03, -4.2);
  }

  /* ---------- 4 Carport mit Eingangsüberdachung, Zufahrt, das Auto fährt ein ---------- */
  {
    const C = G.CARPORT, fl = grp(4, 'grow', { d: 0, y0: L - .02 });
    add(cube(C.x0, L - .02, -17.0, C.x1, L + .08, C.z1), XM.concrete, fl, { cast: false });
    add(cube(C.dach.x0, L - .02, C.z1, C.dach.x1, L + .08, C.dach.z1), XM.concrete, fl, { cast: false });
    add(cube(C.x1 - .6, L, -11.1, C.x1, -.2, -9.6), XM.concrete, fl, { cast: false });
    const po = grp(4, 'grow', { d: .15, y0: L });
    [[C.x0 + .1, C.z0 + .1], [C.x0 + .1, C.z1 - .1], [C.dach.x0 + .1, C.dach.z1 - .1], [C.dach.x0 + .1, C.z1 - .1]].forEach(([x, z]) => add(cube(x - .07, L, z - .07, x + .07, 2.62, z + .07), XM.frame, po));
    for (let z = C.z0 + .3; z < C.z1 - .2; z += .14) add(cube(C.x0 + .04, L + .1, z, C.x0 + .1, 2.55, z + .045), XM.larch, po, { cast: false });
    const rf = grp(4, 'drop', { d: .32, H: 7 });
    add(prism('y', [[C.x0 - .1, C.z0 - .1], [C.x1, C.z0 - .1], [C.x1, C.dach.z1 + .1], [C.dach.x0 - .1, C.dach.z1 + .1], [C.dach.x0 - .1, C.z1 + .1], [C.x0 - .1, C.z1 + .1]], 2.62, 2.95), XM.frame, rf);
    const cr = grp(4, 'slide', { d: .5, v: [0, 0, -9] });
    put(car(4.7, 1.86, 0x2c3034), cr, -9.0, L + .08, -13.3, 0);
  }

  /* ---------- 5 Holzterrassen, Überdachung, Lounge ---------- */
  {
    G.DECKS.forEach((d, i) => { const g = grp(5, 'grow', { d: i * .14, y0: L }); add(cube(d.x0, L, d.z0, d.x1, 0, d.z1), XM.board, g); });
    const stp = grp(5, 'grow', { d: .3, y0: L });
    add(cube(-2.9, L, -3.2, 1.2, -.22, -2.75), XM.board, stp);
    const U = G.UEBERDACHUNG, po = grp(5, 'grow', { d: .4, y0: 0 });
    [[U.x0 + .12, U.z1 - .12], [U.x1 - .12, U.z1 - .12]].forEach(([x, z]) => add(cube(x - .07, 0, z - .07, x + .07, 2.9, z + .07), XM.frame, po));
    const rf = grp(5, 'drop', { d: .5, H: 6 });
    add(cube(U.x0, 2.9, U.z0, U.x1, 3.18, U.z1), XM.frame, rf);
    const lo = grp(5, 'drop', { d: .65, H: 2.5 });
    put(BUILD.osofa(2.6, .95, {}), lo, 12.25, 0, -3.4, -Math.PI / 2);
    put(BUILD.otable(.8, .8, { round: 1 }), lo, 11.05, 0, -3.4);
    put(BUILD.osofa(2.4, .95, {}), lo, 7.25, 0, -4.55, 0);
    put(BUILD.otable(1.2, .6, {}), lo, 7.25, 0, -3.5);
  }

  /* ---------- 6 Pool: Deck darüber, Liegen, Außendusche ---------- */
  {
    const D = G.POOLDECK, dk = grp(6, 'drop', { d: .2, H: 3 });
    add(prism('y', [[D.x0, D.z0], [D.x1, D.z0], [D.x1, D.z1], [D.x0, D.z1]], L, L + .05, [poolHole]), XM.board, dk, { cast: false });
    const li = grp(6, 'drop', { d: .7, H: 2.5 });
    [11.95, 12.6].forEach(x => put(BUILD.chair(.6, 1.9, { lounge: 1, out: 1 }), li, x, L + .05, 1.6, 0));
    const du = grp(6, 'grow', { d: .8, y0: L });
    const [x, z] = G.DUSCHE;
    add(cube(x - .04, L + .05, z - .04, x + .04, L + 2.3, z + .04), XM.dark, du);
    add(cube(x - .04, L + 2.22, z - .04, x + .04, L + 2.3, z + .42), XM.dark, du);
    add(cube(x - .3, L + .05, z - .3, x + .3, L + .07, z + .3), XM.dark, du, { cast: false });
  }

  /* ---------- 7 Garten: Rasen, Bäume, Hecken, Beete, Essplatz, Mauer ---------- */
  const crown = new T.IcosahedronGeometry(1, 1), blob = new T.IcosahedronGeometry(1, 0), stem = new T.CylinderGeometry(.09, .13, 1, 8).translate(0, .5, 0);
  function tree(par, x, z, r, kind, y = L) {
    const m = kind === 'gelb' ? XM.leafG : XM.leafD, th = 1.2 + r * .55;
    const tr = add(stem, XM.trunk, par); tr.position.set(x, y, z); tr.scale.set(1 + r * .25, th + r * .4, 1 + r * .25);
    const c = add(crown, m, par); c.position.set(x, y + th + r * .82, z); c.scale.set(r, r * 1.02, r); c.rotation.y = x * 3.1;
    const c2 = add(crown, m, par); c2.position.set(x + r * .35, y + th + r * 1.25, z - r * .2); c2.scale.set(r * .62, r * .6, r * .62); c2.rotation.y = z;
  }
  {
    G.BAEUME.forEach(([x, z, r, k], i) => {
      const y = (x > 9 && x < 12.2 && z > -5.2 && z < -1.6) ? 0 : L;
      const g = grp(7, 'pop', { d: .1 + (i / G.BAEUME.length) * .65, at: [x, y, z] });
      if (y === 0) add(cube(x - .45, 0, z - .45, x + .45, .5, z + .45), XM.dark, g);
      tree(g, x, z, r, k, y === 0 ? .5 : L);
    });
    G.BUESCHE.forEach(([x, z], i) => { const g = grp(7, 'pop', { d: .3 + i * .05, at: [x, L, z] }); const b = add(blob, XM.leafD, g); b.position.set(x, L + .45, z); b.scale.set(.7, .55, .7); b.rotation.y = i; });
    G.BEEREN.forEach(([x, z], i) => { const g = grp(7, 'pop', { d: .45 + i * .04, at: [x, L, z] }); const b = add(blob, XM.berry, g); b.position.set(x, L + .42, z); b.scale.set(.45, .45, .45); b.rotation.y = i * 1.7; });
    /* Hecken: je Strecke ein Körper, an den Enden etwas kürzer */
    G.HECKEN.forEach(([a, b], i) => {
      const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) - 1.2, g = grp(7, 'grow', { d: .15 + i * .12, y0: L });
      const m = add(new T.BoxGeometry(len, 1.5, .75).translate(0, .75, 0), XM.hedge, g);
      m.position.set((a[0] + b[0]) / 2, L, (a[1] + b[1]) / 2); m.rotation.y = -Math.atan2(dz, dx);
    });
    /* Mauer aus Steinen an der Kante zum Nachbarn */
    const mw = grp(7, 'grow', { d: .2, y0: L - 2.2 });
    for (let s = 0; s < G.MAUER.length - 1; s++) {
      const [a, b] = [G.MAUER[s], G.MAUER[s + 1]], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(len / .62);
      const nx = (b[1] - a[1]) / len, nz = -(b[0] - a[0]) / len; /* nach innen */
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = a[0] + (b[0] - a[0]) * t + nx * .25, z = a[1] + (b[1] - a[1]) * t + nz * .25, sc = .28 + ((i * 37 + s * 11) % 10) / 40;
        const st = add(blob, XM.stone, mw); st.position.set(x, L - .05, z); st.scale.set(sc * 1.3, sc, sc * 1.1); st.rotation.set(i, i * 2.3, 0);
      }
    }
    /* Beete: Holzrahmen, Erde, Kräuter */
    const bed = (par, b, h) => {
      add(cube(b.x0, L, b.z0, b.x1, L + h, b.z1), XM.larch, par);
      add(cube(b.x0 + .05, L + h - .02, b.z0 + .05, b.x1 - .05, L + h + .005, b.z1 - .05), XM.soil, par, { cast: false });
      for (let x = b.x0 + .2; x < b.x1 - .1; x += .32) for (let z = b.z0 + .2; z < b.z1 - .1; z += .34) { const p = add(blob, XM.herb, par, { cast: false }); p.position.set(x, L + h + .1, z); p.scale.setScalar(.13 + ((x * 7 + z * 3) % 1) * .06); }
    };
    G.KRAEUTER.forEach((b, i) => bed(grp(7, 'grow', { d: .35 + i * .08, y0: L }), b, .55));
    G.HOCHBEETE.forEach((b, i) => bed(grp(7, 'grow', { d: .5 + i * .08, y0: L }), b, .75));
    /* Essplatz im Garten: Platten, Tisch, sechs Stühle, gelbes Sonnensegel, Grill; Trittsteine zum Pool */
    const E = G.ESSPLATZ, es = grp(7, 'grow', { d: .25, y0: L });
    add(cube(E.x0, L, E.z0, E.x1, L + .04, E.z1), XM.concrete, es, { cast: false });
    [[2.05, .1], [2.95, .35]].forEach(([x, z]) => add(cube(x - .3, L, z - .3, x + .3, L + .03, z + .3), XM.concrete, es, { cast: false }));
    const ti = grp(7, 'drop', { d: .5, H: 2.5 });
    put(BUILD.table(2.0, .9, { out: 1 }), ti, -2.2, L + .04, -.6, 0);
    [-1, 1].forEach(sd => [-2.9, -2.2, -1.5].forEach(x => put(BUILD.chair(.48, .52, { out: 1 }), ti, x, L + .04, -.6 + sd * .7, sd > 0 ? Math.PI : 0)));
    add(cube(.55, L + .04, -2.25, 1.35, L + .95, -1.7), XM.grill, ti);
    const se = grp(7, 'pop', { d: .7, at: [-2.6, L + 2.6, -.4] });
    const S = [[-4.3, L + 2.85, -2.45], [-.25, L + 2.45, -1.15], [-3.4, L + 2.6, 1.45]];
    S.forEach(([x, y, z]) => add(cube(x - .04, L, z - .04, x + .04, y + .05, z + .04), XM.dark, se));
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(S.flat(), 3)); sg.computeVertexNormals();
    add(sg, XM.sail, se);
  }

  /* ---------- 8 Sauna, Glashaus, Gartenhütte ---------- */
  {
    const S = G.SAUNA, sa = grp(8, 'drop', { d: 0, H: 9 });
    add(cube(S.x0 - .1, L, S.z0 - .1, S.x1 + .1, 0, S.z1), XM.board, sa);
    add(cube(S.x0, 0, S.z0, S.x1, 2.45, S.z1), XM.slats, sa);
    add(cube(S.x0 - .12, 2.45, S.z0 - .12, S.x1 + .12, 2.66, S.z1 + .12), XM.frame, sa);
    pane(sa, 'x', 10.1, 11.1, .05, 2.15, S.z1 + .01);
    const Gh = G.GLASHAUS, gh = grp(8, 'drop', { d: .3, H: 9 }), cx = (Gh.x0 + Gh.x1) / 2, eav = L + 1.95, rid = L + 2.6;
    add(cube(Gh.x0, L, Gh.z0, Gh.x1, L + .03, Gh.z1), XM.gravel, gh, { cast: false });
    [Gh.x0, Gh.x1].forEach(x => [Gh.z0, (Gh.z0 + Gh.z1) / 2, Gh.z1].forEach(z => add(cube(x - .03, L, z - .03, x + .03, eav, z + .03), XM.dark, gh)));
    add(cube(cx - .03, rid - .05, Gh.z0, cx + .03, rid, Gh.z1), XM.dark, gh);
    pane(gh, 'z', Gh.z0, Gh.z1, L + .03, eav, Gh.x0); pane(gh, 'z', Gh.z0, Gh.z1, L + .03, eav, Gh.x1);
    pane(gh, 'x', Gh.x0, Gh.x1, L + .03, eav, Gh.z0); pane(gh, 'x', Gh.x0, Gh.x1, L + .03, eav, Gh.z1);
    [[Gh.x0, eav, cx, rid], [Gh.x1, eav, cx, rid]].forEach(([x0, y0, x1, y1]) => {
      const l = Math.hypot(x1 - x0, y1 - y0), m = add(new T.BoxGeometry(l, .02, Gh.z1 - Gh.z0), XM.glass, gh, { cast: false });
      m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (Gh.z0 + Gh.z1) / 2); m.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    });
    [Gh.z0, Gh.z1].forEach(z => add(prism('z', [[Gh.x0, eav], [Gh.x1, eav], [cx, rid]], z - .01, z + .01), XM.glass, gh, { cast: false }));
    add(cube(Gh.x0 + .1, L, Gh.z0 + .3, Gh.x0 + .7, L + .8, Gh.z1 - .3), XM.larch, gh);
    for (let z = Gh.z0 + .5; z < Gh.z1 - .3; z += .45) { const p = add(blob, XM.herb, gh, { cast: false }); p.position.set(Gh.x0 + .4, L + .95, z); p.scale.setScalar(.2); }
    const Hu = G.HUETTE, hu = grp(8, 'drop', { d: .55, H: 9 });
    add(cube(Hu.x0, L, Hu.z0, Hu.x1, L + 2.2, Hu.z1), XM.slats, hu);
    add(cube(Hu.x0 - .12, L + 2.2, Hu.z0 - .12, Hu.x1 + .12, L + 2.38, Hu.z1 + .12), XM.frame, hu);
    add(cube(Hu.x1 - .01, L, 9.0, Hu.x1 + .03, L + 2.0, 9.9), XM.frame, hu, { cast: false });
  }

  /* ---------- Nummern ---------- */
  const markEls = [];
  ANCH.forEach((a, i) => {
    if (!a) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'sh__mk gs__mk'; b.dataset.i = i;
    const nr = String(i + 1).padStart(2, '0'), lb = (labels[i] || '').replace(/\.$/, '');
    b.setAttribute('aria-label', nr + ' ' + lb);
    b.innerHTML = `<span class="sh__nr">${nr}</span><span class="sh__lb info">${lb}</span>`;
    b.addEventListener('click', e => { e.stopPropagation(); opt.onPick && opt.onPick(i); });
    marks.appendChild(b); markEls[i] = b;
  });
  const v3 = new T.Vector3();
  function updateMarks() {
    const w = host.clientWidth, h = host.clientHeight, step = Math.round(U.u), all = U.u > 8.55;
    markEls.forEach((el, i) => {
      if (!el) return;
      const [x, y, z] = ANCH[i];
      v3.set(x, y + (i === 2 ? upper.position.y : 0), z).project(cam);
      const px = (v3.x + 1) / 2 * w;
      /* nicht hinter der Textspalte und nicht am Rand */
      const inView = v3.z < 1 && px > padC + 16 && px < w - 12 && Math.abs(v3.y) < .96;
      const show = inView && (all || (i === step && kOf({ step: i, d: 0 }, U.u) > .9));
      el.style.transform = `translate(${px.toFixed(1)}px,${((1 - v3.y) / 2 * h).toFixed(1)}px)`;
      el.classList.toggle('is-off', !show);
      el.classList.toggle('is-sel', !all ? i === step : sel === i);
      el.tabIndex = all && show ? 0 : -1;
    });
  }

  /* ---------- Kamera: Blick folgt dem Fortschritt, dazu deine Drehung und dein Zoom ---------- */
  const U = { u: 0 }, user = { az: 0, el: 0, z: 1 };
  let sel = null, ov = null, liftU = 0, liftS = 0, liftC = 0;
  const C = { t: new T.Vector3(), az: 0, el: 0, d: 1 };
  const lv = (a, b, k) => ({ t: a.t.map((v, i) => v + (b.t[i] - v) * k), az: a.az + (b.az - a.az) * k, el: a.el + (b.el - a.el) * k, d: a.d + (b.d - a.d) * k });
  function viewAt(u) {
    let v = VIEWS[0];
    for (let i = 1; i < VIEWS.length; i++) {
      const k = reduceMotion ? (u >= i - .35 ? 1 : 0) : eio(seg(u, i - .62, i - .08));
      if (k <= 0) break;
      v = lv(v, VIEWS[i], k);
    }
    return v;
  }
  const scaleD = () => { const a = cam.aspect || 1; return a < .8 ? 1.5 : a < 1.2 ? 1.18 : 1; };
  function place(now) {
    let v = viewAt(U.u);
    if (ov) { const k = reduceMotion ? 1 : eio(cl((now - ov.t0) / 1100)); v = lv(ov.from, ov.to, k); if (k < 1) need = true; }
    C.t.set(...v.t); C.az = v.az + user.az; C.el = cl(v.el + user.el, .1, 1.4); C.d = v.d * scaleD() * user.z;
    cam.position.set(C.t.x + Math.sin(C.az) * Math.cos(C.el) * C.d, C.t.y + Math.sin(C.el) * C.d, C.t.z + Math.cos(C.az) * Math.cos(C.el) * C.d);
    cam.lookAt(C.t);
  }

  function update() {
    const u = U.u;
    anims.forEach(a => applyA(a, kOf(a, u)));
    const lift = reduceMotion ? (u > 2.65 && u < 3.6 ? 1 : 0) : eio(seg(u, 2.42, 2.92)) * (1 - eio(seg(u, 3.42, 3.9)));
    liftU = lift; upper.position.y = Math.max(liftU, liftC) * 8.2;
    XM.lawn.color.copy(RAW).lerp(LAWNC, reduceMotion ? (u >= 6.65 ? 1 : 0) : eo(seg(u, 6.38, 6.85)));
  }

  /* ---------- Ziehen dreht, Strg + Rad oder zwei Finger zoomen ---------- */
  const el = R.domElement, pts = new Map();
  let drag = null, pinch = 0;
  el.style.touchAction = 'pan-y';
  let z0 = 1;
  el.addEventListener('pointerdown', e => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); drag = { x: e.clientX, y: e.clientY, az: user.az, el: user.el, id: e.pointerId, m: 0 }; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); z0 = user.z; } });
  addEventListener('pointermove', e => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    /* zwei Finger: auseinander = näher */
    if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; user.z = cl(z0 * pinch / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), .45, 1.7); poke(); opt.onUser && opt.onUser(); return; }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.m = Math.max(drag.m, Math.hypot(dx, dy));
    if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) && drag.m < 14) return;
    if (drag.m > 4) { user.az = cl(drag.az - dx * .005, -1.6, 1.6); user.el = cl(drag.el + dy * .004, -.6, .7); host.classList.add('is-drag'); poke(); opt.onUser && opt.onUser(); }
  });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (drag && e.pointerId === drag.id) { drag = null; host.classList.remove('is-drag'); } };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); user.z = cl(user.z * Math.exp(e.deltaY * .01), .45, 1.7); poke(); opt.onUser && opt.onUser(); }, { passive: false });
  el.addEventListener('dblclick', () => api.reset());

  /* ---------- Takt: nur zeichnen, wenn sich etwas ändert ---------- */
  let need = true, visible = true, raf = 0, padT = 0, padC = 0;
  function poke() { need = true; if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    if (!visible) { need = true; return; }
    if (Math.abs(padT - padC) > .5) { padC += (padT - padC) * .18; if (Math.abs(padT - padC) <= .5) padC = padT; offset(); need = true; }
    /* Innenausbau im fertigen Modell gewählt: das Obergeschoß hebt sich wieder ab */
    if (Math.abs(liftS - liftC) > .002) { liftC += (liftS - liftC) * (reduceMotion ? 1 : .1); if (Math.abs(liftS - liftC) <= .002) liftC = liftS; upper.position.y = Math.max(liftU, liftC) * 8.2; need = true; }
    if (need) { need = false; place(now); R.render(scene, cam); updateMarks(); }
    if (need || Math.abs(padT - padC) > .5 || Math.abs(liftS - liftC) > .002) raf = requestAnimationFrame(frame);
  }
  function offset() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    if (padC > .5) cam.setViewOffset(w, h, -padC / 2, 0, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }
  const fit = () => { const w = host.clientWidth || 1, h = host.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; offset(); poke(); };
  const ro = new ResizeObserver(fit); ro.observe(host); fit();
  const io = new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); if (visible) poke(); }, { rootMargin: '200px 0px' }); io.observe(host);

  const api = {
    setU(u) {
      if (Math.abs(u - U.u) < 1e-4) return;
      if (ov && Math.abs(u - ov.u) > .06) { ov = null; sel = null; liftS = 0; host.classList.remove('has-sel'); opt.onSelect && opt.onSelect(null); }
      U.u = u; update(); poke();
    },
    /* Wegweiser im letzten Schritt: fliegt zum Blick des Schritts i, null zurück zum Ganzen */
    select(i) {
      const now = performance.now(), from = { t: C.t.toArray(), az: C.az - user.az, el: C.el - user.el, d: C.d / scaleD() / user.z };
      sel = i;
      ov = i == null ? { from, to: viewAt(U.u), t0: now, u: U.u, back: 1 } : { from, to: { ...VIEWS[i], ...(PICK[i] || {}) }, t0: now, u: U.u };
      liftS = i === 3 ? 1 : 0; host.classList.toggle('has-sel', i != null);
      if (i == null) setTimeout(() => { if (ov && ov.back) ov = null; }, 1200);
      opt.onSelect && opt.onSelect(i); poke();
    },
    get selected() { return sel; },
    zoom(f) { user.z = cl(user.z * f, .45, 1.7); poke(); },
    reset() { user.az = 0; user.el = 0; user.z = 1; poke(); },
    get moved() { return Math.abs(user.az) > .01 || Math.abs(user.el) > .01 || Math.abs(user.z - 1) > .01; },
    pad(px) { padT = Math.max(0, px || 0); if (reduceMotion) { padC = padT; offset(); } poke(); },
    dispose() { ro.disconnect(); io.disconnect(); R.dispose(); }
  };
  update();
  return api;
}
