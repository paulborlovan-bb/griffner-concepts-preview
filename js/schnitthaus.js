/* Services (Runde 45): GRIFFNER Haus im Schnitt, three.js.
   Ein zweigeschoßiges Haus mit Satteldach, bis zum First offen, bei x = 0 aufgeschnitten wie ein Hausschnitt: an der Schnittfläche
   siehst du die GRIFFNER Wand, den Fußboden mit 21,5 cm, die Massivholzdecke und das Dach in Schichten.
   Modus „erkunden“ (leistungen.html): Nummern 01 bis 08 am Modell, Klick auf Nummer oder Bauteil fliegt hin, der Rest wird hell
   wie ein weißes Architekturmodell. Modus „stufen“ (leistungsumfang.html): Ausbaustufe 1 bis 3 baut sich auf.
   Maße in m. x entlang des Firsts (0 = Schnitt, LX = Giebel), y nach oben, z quer (+ vorne mit Eingang). */
import * as T from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { prism, cube, MAT, FRAME_COL, WALL, ROOF, FLOOR } from './svc-geo.js';
import { BUILD, pendant, M as FM } from './grundriss-moebel.js';

/* ---------- Maße ---------- */
const W = .4225, D = 10.64, HD = D / 2, ZI = HD - W, LX = 7.2;
const F0 = .215, H = 2.72, C0 = F0 + H, C1 = C0 + .2, F1 = C1 + .16;
const AL = 35 * Math.PI / 180, TA = Math.tan(AL), CO = Math.cos(AL);
const YK = F1 + 1.5, YR = YK + TA * ZI;
const roofIn = z => YR - TA * Math.abs(z);
const RT = ROOF.reduce((s, l) => s + l.d, 0), OV = .45, OVG = .3, ZE = HD + OV;
/* Treppe entlang der Rückwand, 16 Steigungen */
const SX = 1.0, SW = 1.0, NR = 16, GO = .27, SX0 = 1.75, SX1 = SX + GO * (NR - 1);
/* Öffnungen: vorne (z+) Fenster bodentief und Haustür mit Seitenteil, hinten ein Fenster, Giebel unten und oben */
const OPEN_F = [{ x0: .9, x1: 3.5, y0: F0, y1: F0 + 2.42, k: 'fenster' }, { x0: 4.4, x1: 5.9, y0: F0, y1: F0 + 2.35, k: 'tuer' }];
const OPEN_B = [{ x0: 5.6, x1: 6.6, y0: F0 + .9, y1: F0 + 2.3, k: 'fenster' }];
const OPEN_G = [{ z0: -1.0, z1: 2.4, y0: F0, y1: F0 + 2.42 }, { z0: -1.9, z1: 1.9, y0: F1, y1: F1 + 2.9 }];
const POSTS = [[2.0, -.3], [5.27, -.3]];

/* Anker der Nummern und Blickpunkte (Ziel, Azimut, Höhe, Abstand) */
const ANCH = {
  openspace: [2.0, 1.75, -.3], wand: [-.02, 1.35, HD - W / 2], dach: [-.02, roofIn(2.3) + RT / CO / 2, 2.3],
  fenster: [2.2, 1.5, HD + .02], decke: [-.02, (C0 + C1) / 2, -1.2], parkett: [.8, F0 + .02, -1.3],
  raumhoehe: [-.08, (F0 + C0) / 2, -2.7], fassade: [6.55, 1.7, HD + .03]
};
const VIEW = {
  home: { t: [3.3, 3.5, .2], az: -.78, el: .3, d: 33 },
  openspace: { t: [3.6, 1.4, -.3], az: -1.22, el: .16, d: 11 },
  wand: { t: [0, 1.45, HD - W / 2], az: -1.12, el: .14, d: 2.9 },
  dach: { t: [0, 6.7, 2.4], az: -1.3, el: .08, d: 4.8 },
  fenster: { t: [2.3, 1.5, 5.0], az: -.32, el: .1, d: 8.5 },
  decke: { t: [2.4, 2.7, .4], az: -1.12, el: -.06, d: 10 },
  parkett: { t: [1.6, .3, .2], az: -1.05, el: .42, d: 7.5 },
  raumhoehe: { t: [0, 1.7, -.6], az: -1.5, el: .04, d: 13 },
  fassade: { t: [5.2, 2.3, 5.0], az: .32, el: .12, d: 13 },
  stufen: { t: [3.3, 2.6, 0], az: -.92, el: .34, d: 29 }
};
const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = t => 1 - Math.pow(1 - t, 3);

export async function createSchnitthaus(host, opt = {}) {
  const mode = opt.mode || 'erkunden', EXPL = mode === 'erkunden';
  const gl = document.createElement('div'); gl.className = 'sh__gl';
  const marks = document.createElement('div'); marks.className = 'sh__marks';
  const hov = document.createElement('span'); hov.className = 'sh__hov info'; hov.setAttribute('aria-hidden', 'true');
  host.append(gl, marks, hov);

  const R = new T.WebGLRenderer({ antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.domElement.style.cssText = 'display:block;width:100%;height:100%';
  gl.appendChild(R.domElement);
  const scene = new T.Scene(); scene.background = new T.Color(opt.bg ?? 0xffffff);
  const pmrem = new T.PMREMGenerator(R); scene.environment = pmrem.fromScene(new RoomEnvironment(R), .04).texture; pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff, 0xcfc8bd, .35));
  const sun = new T.DirectionalLight(0xfff1e0, 2.3); sun.position.set(-12, 21, 15); sun.target.position.set(3.4, 1.5, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 70 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const cam = new T.PerspectiveCamera(28, 1, .1, 400);
  const root = new T.Group(); scene.add(root);

  /* ---------- Teile und Materialien je Teil (jedes Teil wird für sich hell) ---------- */
  const parts = {};
  const mats = new Map();
  const pm = (key, name) => { const id = key + ':' + name; if (!mats.has(id)) mats.set(id, MAT[name]()); return mats.get(id); };
  const add = (geo, mat, key, parent = root, o = {}) => {
    const m = new T.Mesh(geo, mat); m.castShadow = o.cast !== false; m.receiveShadow = true;
    m.userData.part = key || null; parent.add(m);
    if (key) (parts[key] || (parts[key] = [])).push(m);
    return m;
  };
  /* Bühnen je Ausbaustufe: Gruppen, die erscheinen (wachsen von unten oder fallen ein) */
  const staged = [];
  const stage = (n, kind = 'grow', y0 = 0, until = 3) => { const g = new T.Group(); g.position.y = y0; root.add(g); const inner = new T.Group(); inner.position.y = -y0; g.add(inner); staged.push({ g, n, until, kind, k: 1 }); return inner; };

  /* ---------- Gelände: Sockel aus Erde, Rasen, Kiesstreifen, Weg ---------- */
  const XP = LX + 2.6, ZP = HD + 2.6, GR = -.15;
  const ushape = (xi, zi) => [[0, -ZP], [XP, -ZP], [XP, ZP], [0, ZP], [0, zi], [xi, zi], [xi, -zi], [0, -zi]];
  add(cube(0, -1.1, -ZP, XP, -.25, ZP), pm('g', 'earth'), null);
  add(prism('y', ushape(LX, HD), -.25, -.2), pm('g', 'earth'), null);
  add(prism('y', ushape(LX + .4, HD + .4), -.2, GR), pm('g', 'grass'), null);
  add(prism('y', [[0, -HD - .4], [LX + .4, -HD - .4], [LX + .4, HD + .4], [0, HD + .4], [0, HD], [LX, HD], [LX, -HD], [0, -HD]], -.2, GR + .015), pm('g', 'gravel'), null);
  for (let i = 0; i < 3; i++) add(cube(4.5, GR + .015, HD + .55 + i * .68, 5.8, GR + .05, HD + 1.1 + i * .68), pm('g', 'concrete'), null);
  const catcher = new T.Mesh(new T.PlaneGeometry(200, 200), new T.ShadowMaterial({ opacity: .14 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = -1.1; catcher.receiveShadow = true; scene.add(catcher);

  /* ---------- Bodenplatte und Fußboden ---------- */
  add(cube(0, -.25, -HD, LX, 0, HD), pm('g', 'concrete'), null);
  const floorEG = stage(2, 'grow', 0);
  const floorEG3 = stage(3, 'grow', F0 - .015);
  {
    let y = 0;
    FLOOR.forEach(L => {
      const y1 = y + L.d;
      if (L.k === 'parkett') add(cube(0, y, -ZI, LX - W, y1, ZI), pm('parkett', 'oak'), 'parkett', floorEG3);
      else if (L.k === 'estrich') {
        add(cube(1.2, y, -ZI, LX - W, y1, ZI), pm('parkett', 'screed'), 'parkett', floorEG);
        /* Heizrohre am Schnitt: Stufe 2 offen, in Stufe 3 ist der Estrich bis zum Schnitt gegossen */
        const pipes = stage(2, 'grow', y, 2);
        for (let z = -ZI + .2; z < ZI - .1; z += .15) add(cube(.06, y, z - .009, 1.2, y + .018, z + .009), pm('parkett', 'pipe'), 'parkett', pipes, { cast: false });
        for (let z = -ZI + .2; z < ZI - .25; z += .3) { add(cube(.06, y, z, .078, y + .018, z + .15), pm('parkett', 'pipe'), 'parkett', pipes, { cast: false }); }
        const fill = stage(3, 'grow', y);
        add(cube(0, y, -ZI, 1.2, y1, ZI), pm('parkett', 'screed'), 'parkett', fill);
      } else add(cube(0, y, -ZI, LX - W, y1, ZI), pm('parkett', L.m), 'parkett', floorEG);
      y = y1;
    });
  }

  /* ---------- Wände ---------- */
  const facade = [], gipsM = [], depth = [];
  { let a = 0; WALL.forEach(L => { depth.push([a, a + L.d]); a += L.d; }); }
  const wallMat = (L, key) => (L.k === 'fassade' ? pm('fassade', 'larch') : L.k === 'gips' ? pm('wand', 'gipsRaw') : pm('wand', L.m));
  const track = (m, L) => { if (L.k === 'fassade') facade.push(m); if (L.k === 'gips') gipsM.push(m); return m; };
  const wallX = (s, open) => WALL.forEach((L, i) => {
    const [a, b] = depth[i], zo = s * (HD - a), zi = s * (HD - b), xEnd = LX - a, key = L.k === 'fassade' ? 'fassade' : 'wand';
    const quad = (y0, y1) => [[zi, y0], [zo, y0], [zo, y1 == null ? roofIn(zo) : y1], [zi, y1 == null ? roofIn(zi) : y1]];
    const cuts = [0, ...open.flatMap(o => [o.x0, o.x1]), xEnd];
    for (let k = 0; k < cuts.length - 1; k++) {
      const x0 = cuts[k], x1 = Math.min(cuts[k + 1], xEnd); if (x1 - x0 < 1e-4) continue;
      const o = open.find(o => o.x0 <= x0 + 1e-6 && o.x1 >= x1 - 1e-6);
      const polys = o ? [o.y0 > .001 ? quad(0, o.y0) : null, quad(o.y1, null)].filter(Boolean) : [quad(0, null)];
      polys.forEach(p => track(add(prism('x', p, x0, x1), wallMat(L), key), L));
    }
  });
  wallX(1, OPEN_F); wallX(-1, OPEN_B);
  WALL.forEach((L, i) => {
    const [a, b] = depth[i], zl = HD - b, key = L.k === 'fassade' ? 'fassade' : 'wand';
    const poly = [[-zl, 0], [zl, 0], [zl, roofIn(zl)], [0, YR], [-zl, roofIn(zl)]];
    const holes = OPEN_G.map(o => [[o.z0, o.y0], [o.z1, o.y0], [o.z1, o.y1], [o.z0, o.y1]]);
    track(add(prism('x', poly, LX - b, LX - a, holes), wallMat(L), key), L);
  });
  /* Sockelblech rundum */
  add(prism('x', [[HD, GR], [HD + .012, GR], [HD + .012, .05], [HD, .05]], 0, LX + .012), pm('fassade', 'alu'), 'fassade');
  add(prism('x', [[-HD - .012, GR], [-HD, GR], [-HD, .05], [-HD - .012, .05]], 0, LX + .012), pm('fassade', 'alu'), 'fassade');
  add(cube(LX, GR, -HD - .012, LX + .012, .05, HD + .012), pm('fassade', 'alu'), 'fassade');

  /* ---------- Decke (Massivholz oder Tram) mit Treppenloch, Obergeschoß ---------- */
  const notch = [[0, -ZI], [SX0, -ZI], [SX0, -ZI + SW], [SX1, -ZI + SW], [SX1, -ZI], [LX - W, -ZI], [LX - W, ZI], [0, ZI]];
  const ceil = add(prism('y', notch, C0, C1), pm('decke', 'slab'), 'decke');
  const beams = new T.Group(); root.add(beams); beams.visible = false;
  for (let x = .35; x < LX - W - .1; x += .8) add(cube(x - .07, C0 - .18, x > SX0 - .1 && x < SX1 + .1 ? -ZI + SW : -ZI, x + .07, C0, ZI), pm('decke', 'slab'), 'decke', beams);
  const floorOG = stage(2, 'grow', C1);
  const floorOG3 = stage(3, 'grow', F1 - .015);
  {
    let y = C1;
    [['fill', .055], ['insul', .03], ['screed', .06], ['oak', .015]].forEach(([m, d]) => {
      add(prism('y', notch, y, y + d), pm('parkett', m), 'parkett', m === 'oak' ? floorOG3 : floorOG); y += d;
    });
  }

  /* ---------- Dach, bis zum First offen ---------- */
  {
    let t = 0;
    ROOF.forEach(L => {
      const t0 = t, t1 = t + L.d; t = t1;
      [1, -1].forEach(s => {
        const y0 = YR + t0 / CO, y1 = YR + t1 / CO;
        add(prism('x', [[0, y0], [0, y1], [s * ZE, y1 - TA * ZE], [s * ZE, y0 - TA * ZE]], 0, LX + OVG), pm('dach', L.m), 'dach');
      });
    });
    [1, -1].forEach(s => {
      /* Ortgang, Traufe und Rinne in Aluminium */
      const yA = YR - .02 / CO, yB = YR + (RT + .025) / CO;
      add(prism('x', [[0, yA], [0, yB], [s * (ZE + .02), yB - TA * (ZE + .02)], [s * (ZE + .02), yA - TA * (ZE + .02)]], LX + OVG, LX + OVG + .025), pm('dach', 'alu'), 'dach');
      const yi = YR - TA * ZE;
      add(prism('x', [[s * ZE, yi - .03], [s * (ZE + .02), yi - .03], [s * (ZE + .02), yi + RT / CO], [s * ZE, yi + RT / CO]], 0, LX + OVG), pm('dach', 'alu'), 'dach');
      add(prism('x', [[s * (ZE + .02), yi + .12], [s * (ZE + .16), yi + .12], [s * (ZE + .16), yi + .3], [s * (ZE + .02), yi + .3]], 0, LX + OVG), pm('dach', 'alu'), 'dach');
    });
    /* Firstziegel */
    add(cube(0, YR + RT / CO - .03, -.13, LX + OVG + .025, YR + RT / CO + .05, .13), pm('dach', 'alu'), 'dach');
    /* Firstpfette, sichtbar */
    add(prism('x', [[-.1, YR - .32], [.1, YR - .32], [.1, roofIn(.1)], [0, YR], [-.1, roofIn(.1)]], 0, LX - W), pm('dach', 'spruce'), 'dach');
  }

  /* ---------- Open Space: zwei Ableitungspunkte ---------- */
  POSTS.forEach(([x, z]) => add(cube(x - .08, F0, z - .08, x + .08, C0, z + .08), pm('openspace', 'spruce'), 'openspace'));

  /* ---------- Fenster und Haustür ---------- */
  const frameWood = pm('fenster', 'frameNatur'), frameAlu = pm('fenster', 'alu'), glass = pm('fenster', 'glass');
  const wallFrame = (side) => {
    const g = new T.Group(); root.add(g);
    if (side === 'front') { g.rotation.y = Math.PI; g.position.set(0, 0, HD); }
    else if (side === 'back') g.position.set(0, 0, -HD);
    else { g.rotation.y = -Math.PI / 2; g.position.set(LX, 0, 0); }
    return g;
  };
  /* u entlang der Wand, v Höhe, w Tiefe von außen nach innen; Rahmen liegt in der Dämmebene */
  function window(g, u0, u1, v0, v1, o = {}) {
    const fw = .085, A0 = .07, A1 = .095, B1 = .175, low = v0 > F0 + .05;
    const ring = (w0, w1, mat, inset = 0) => {
      const a = u0 + inset, b = u1 - inset, c = v0 + inset, d = v1 - inset;
      add(cube(a, c, w0, b, c + fw, w1), mat, 'fenster', g); add(cube(a, d - fw, w0, b, d, w1), mat, 'fenster', g);
      add(cube(a, c + fw, w0, a + fw, d - fw, w1), mat, 'fenster', g); add(cube(b - fw, c + fw, w0, b, d - fw, w1), mat, 'fenster', g);
    };
    ring(A0, A1, frameAlu); ring(A1, B1, frameWood);
    if (o.split) { const m = (u0 + u1) / 2; add(cube(m - .045, v0 + fw, A0, m + .045, v1 - fw, A1), frameAlu, 'fenster', g); add(cube(m - .045, v0 + fw, A1, m + .045, v1 - fw, B1), frameWood, 'fenster', g); }
    [.115, .132, .149].forEach(w => add(cube(u0 + fw, v0 + fw, w, u1 - fw, v1 - fw, w + .005), glass, 'fenster', g, { cast: false }));
    reveal(g, u0, u1, v0, v1, pm('fenster', 'paint'), frameAlu, 'fenster', B1, A0);
    /* Raffstore oben in der Laibung, eingefahren */
    add(cube(u0 + .012, v1 - .14, .006, u1 - .012, v1 - .012, .062), frameAlu, 'fenster', g);
    if (low) {
      add(cube(u0 + .0125, v0, B1, u1 - .0125, v0 + .025, W + .035), pm('fenster', 'oak'), 'fenster', g);
      add(cube(u0 + .01, v0, -.05, u1 - .01, v0 + .02, A0), frameAlu, 'fenster', g);
    } else add(cube(u0 + .01, v0, -.03, u1 - .01, v0 + .015, A0), frameAlu, 'fenster', g);
  }
  /* Laibung: innen Wandoberfläche hinter dem Rahmen, außen Aluminium vor dem Rahmen; liegt in der Öffnung, damit keine Fläche doppelt ist */
  function reveal(g, u0, u1, v0, v1, inner, outer, key, wIn, wOut) {
    const t = .0125, s = .01;
    add(cube(u0, v1 - t, wIn, u1, v1, W), inner, key, g);
    add(cube(u0, v0, wIn, u0 + t, v1 - t, W), inner, key, g); add(cube(u1 - t, v0, wIn, u1, v1 - t, W), inner, key, g);
    add(cube(u0, v1 - s, 0, u1, v1, wOut), outer, key, g);
    add(cube(u0, v0, 0, u0 + s, v1 - s, wOut), outer, key, g); add(cube(u1 - s, v0, 0, u1, v1 - s, wOut), outer, key, g);
  }
  const gF = wallFrame('front'), gB = wallFrame('back'), gG = wallFrame('gable');
  /* vorne: u = -x */
  window(gF, -3.5, -.9, F0, F0 + 2.42, { split: true });
  window(gB, 5.6, 6.6, F0 + .9, F0 + 2.3);
  window(gG, -1.0, 2.4, F0, F0 + 2.42, { split: true });
  window(gG, -1.9, 1.9, F1, F1 + 2.9, { split: true });
  /* Haustür Holz-Alu mit Seitenteil, Stangengriff außen */
  {
    const u0 = -5.9, u1 = -4.4, v0 = F0, v1 = F0 + 2.35, fw = .085;
    const al = pm('tuer', 'alu'), wd = pm('tuer', 'frameNatur');
    add(cube(u0, v1 - fw, .07, u1, v1, .175), al, null, gF); add(cube(u0, v0, .07, u0 + fw, v1 - fw, .175), al, null, gF); add(cube(u1 - fw, v0, .07, u1, v1 - fw, .175), al, null, gF);
    add(cube(u0 + fw, v0, .07, u0 + fw + .07, v1 - fw, .175), al, null, gF);
    const lu0 = u0 + fw + .07, lu1 = u1 - fw;
    add(cube(lu0, v0 + .01, .075, lu1, v1 - fw, .1), al, null, gF);
    add(cube(lu0, v0 + .01, .1, lu1, v1 - fw, .165), wd, null, gF);
    add(cube(lu0 + .12, v0 + .35, .035, lu0 + .155, v0 + 1.95, .07), pm('tuer', 'steel'), null, gF);
    [.11, .127].forEach(w => add(cube(u0 + fw, v0 + .02, w, u0 + fw + .07, v1 - fw, w + .006), glass, null, gF, { cast: false }));
    reveal(gF, u0, u1, v0, v1, pm('tuer', 'paint'), al, null, .175, .07);
  }

  /* ---------- Treppe: Rohbautreppe (Stufe 1 bis 2), Eiche mit Setzstufen und Geländer (Stufe 3) ---------- */
  {
    const raw = stage(1, 'grow', 0, 2);
    const r1 = C1 / NR;
    for (let i = 0; i < NR - 1; i++) add(cube(SX + GO * i, r1 * (i + 1) - .05, -ZI + .06, SX + GO * (i + 1) + .02, r1 * (i + 1), -ZI + SW - .06), pm('g', 'spruce'), null, raw);
    [-ZI + .06, -ZI + SW - .06].forEach(z => add(prism('z', [[SX, 0], [SX + .3, 0], [SX1 + .02, C1 - .25], [SX1 + .02, C1], [SX1 - .3, C1]], z - .05, z), pm('g', 'spruce'), null, raw));
    const oak = stage(3, 'grow', 0);
    const r = (F1 - F0) / NR;
    for (let i = 0; i < NR - 1; i++) {
      const y = F0 + r * (i + 1);
      add(cube(SX + GO * i - .03, y - .045, -ZI, SX + GO * (i + 1), y, -ZI + SW), pm('g', 'oak'), null, oak);
      add(cube(SX + GO * i, y - r, -ZI, SX + GO * i + .02, y - .045, -ZI + SW), pm('g', 'oak'), null, oak);
    }
    add(cube(SX + GO * (NR - 1), F1 - r, -ZI, SX + GO * (NR - 1) + .02, F1 - .015, -ZI + SW), pm('g', 'oak'), null, oak);
    add(prism('z', [[SX, F0], [SX + .32, F0], [SX1, F1 - .18], [SX1, F1], [SX1 - .32, F1]], -ZI + SW, -ZI + SW + .05), pm('g', 'oak'), null, oak);
    /* Geländer in Eiche am Treppenloch */
    for (let x = SX0 + .06; x < SX1 - .02; x += .11) add(cube(x, F1, -ZI + SW - .04, x + .035, F1 + .98, -ZI + SW), pm('g', 'oak'), null, oak);
    add(cube(SX0, F1 + .98, -ZI + SW - .06, SX1, F1 + 1.03, -ZI + SW + .01), pm('g', 'oak'), null, oak);
    for (let z = -ZI + .06; z < -ZI + SW - .05; z += .11) add(cube(SX0, F1, z, SX0 + .035, F1 + .98, z + .035), pm('g', 'oak'), null, oak);
    add(cube(SX0 - .02, F1 + .98, -ZI, SX0 + .05, F1 + 1.03, -ZI + SW), pm('g', 'oak'), null, oak);
  }

  /* ---------- Haustechnik (Stufe 2): Wärmepumpe außen, Schalter und Steckdosen ---------- */
  {
    const hp = stage(2, 'drop', GR + .02);
    const x = LX + 1.05, z = HD - .9;
    add(cube(x - .2, GR + .02, z - .55, x + .26, GR + 1.0, z + .55), pm('g', 'white'), null, hp);
    add(cube(x + .26, GR + .1, z - .45, x + .275, GR + .92, z + .45), pm('g', 'dark'), null, hp);
    add(cube(x - .25, GR + .015, z - .62, x + .32, GR + .03, z + .62), pm('g', 'concrete'), null, hp);
    const el = stage(2, 'drop', 0);
    [[1.2, .45], [3.0, .45], [6.2, .45], [5.95, 1.05]].forEach(([x, y]) => add(cube(x - .04, F0 + y - .04, -ZI, x + .04, F0 + y + .04, -ZI + .012), pm('g', 'white'), null, el, { cast: false }));
    [[3.9, 1.05], [6.4, .45]].forEach(([x, y]) => add(cube(x - .04, F0 + y - .04, ZI - .012, x + .04, F0 + y + .04, ZI), pm('g', 'white'), null, el, { cast: false }));
  }

  /* ---------- Möbel (nur „erkunden“) ---------- */
  if (EXPL) {
    const put = (obj, x, y, z, ry = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData.part = null; (parts.moebel || (parts.moebel = [])).push(o); } }); root.add(obj); };
    put(BUILD.sofa(2.6, .98, { c: 'kalk' }), 2.75, F0, 3.2, -Math.PI / 2);
    put(BUILD.coffee(1.0, .6, {}), 1.6, F0, 3.2);
    put(BUILD.table(2.0, .95, {}), 3.65, F0, -1.85, Math.PI / 2);
    [[-.5, -1], [.5, -1], [-.5, 1], [.5, 1]].forEach(([dz, s]) => put(BUILD.chair(.48, .52, {}), 3.65 + s * .66, F0, -1.85 + dz, s * -Math.PI / 2));
    put(pendant(C0 - F0), 3.65, F0, -1.85);
    put(BUILD.lowboard(1.8, .45, {}), 6.5, F0, 3.5, -Math.PI / 2);
    put(BUILD.plant(.5, .5, {}), .45, F0, 4.5);
    put(BUILD.bed(1.8, 2.1, { c: 'sand' }), 4.4, F1, 1.0, Math.PI / 2);
    put(BUILD.plant(.5, .5, {}), 6.3, F1, -2.6);
  }

  /* ---------- Bemaßung 2,72 m am Schnitt ---------- */
  const dimMat = new T.LineBasicMaterial({ color: 0x000000 });
  {
    const x = -.08, z = ANCH.raumhoehe[2], pts = [[x, F0, z], [x, C0, z], [x, F0, z - .12], [x, F0, z + .12], [x, C0, z - .12], [x, C0, z + .12]];
    const g = new T.BufferGeometry().setFromPoints([0, 1, 2, 3, 4, 5].map(i => new T.Vector3(...pts[i])));
    const dim = new T.LineSegments(g, dimMat); root.add(dim);
    /* Fangkörper für Klicks auf die Bemaßung */
    add(cube(x - .05, F0, z - .12, x + .01, C0, z + .12), new T.MeshBasicMaterial({ visible: false }), 'raumhoehe', root, { cast: false });
  }

  /* ---------- Wahl: Fassade, Fensterfarbe innen, Decke ---------- */
  const state = { fassade: 'holz', fenster: 'natur', decke: 'massiv', farbe: 'natur' };
  function applyWahl() {
    const larch = pm('fassade', 'larch'), putz = pm('fassade', 'putz');
    facade.forEach(m => {
      const gable = m.geometry.boundingSphere.center.x > LX - .5;
      m.material = state.fassade === 'holz' ? larch : state.fassade === 'putz' ? putz : (gable ? larch : putz);
    });
    frameWood.color.setHex(FRAME_COL[state.fenster] || FRAME_COL.natur);
    const slab = state.farbe === 'weiss' ? pm('decke', 'slabWhite') : pm('decke', 'slab');
    ceil.material = slab; beams.children.forEach(b => b.material = slab); beams.visible = state.decke === 'tram';
    pickList = null; applyDim(); poke();
  }

  /* ---------- Hell machen, was nicht gewählt ist ---------- */
  let sel = null;
  function applyDim() {
    const lit = new Set(), dim = new Set();
    Object.entries(parts).forEach(([k, ms]) => ms.forEach(m => (sel && k !== sel ? dim : lit).add(m.material)));
    root.traverse(o => { if (o.isMesh && !o.userData.part && o.material) (sel ? dim : lit).add(o.material); });
    dim.forEach(m => { if (lit.has(m) || !m.emissive) return; m.emissive.setHex(0xffffff); m.emissiveIntensity = .58; });
    lit.forEach(m => { if (m.emissive && m !== FM.glow) { m.emissive.setHex(0x000000); m.emissiveIntensity = 1; } });
    if (FM.glow) { FM.glow.emissive.setHex(0xffe2b0); FM.glow.emissiveIntensity = .9; }
    /* Open Space: die zwei Ableitungspunkte leuchten gelb, wie im Grundriss */
    if (sel === 'openspace') { const m = pm('openspace', 'spruce'); m.emissive.setHex(0xffb200); m.emissiveIntensity = .62; }
    glass.opacity = sel && sel !== 'fenster' ? .12 : .22;
  }

  /* ---------- Kamera ---------- */
  const C = { t: new T.Vector3(...VIEW[EXPL ? 'home' : 'stufen'].t), az: VIEW[EXPL ? 'home' : 'stufen'].az, el: VIEW[EXPL ? 'home' : 'stufen'].el, d: VIEW[EXPL ? 'home' : 'stufen'].d };
  let tw = null;
  const scaleD = () => { const a = cam.aspect || 1; return a < 1 ? 1 + (1 - a) * 1.1 : a < 1.3 ? 1.06 : 1; };
  function place() {
    const d = C.d * scaleD();
    cam.position.set(C.t.x + Math.sin(C.az) * Math.cos(C.el) * d, C.t.y + Math.sin(C.el) * d, C.t.z + Math.cos(C.az) * Math.cos(C.el) * d);
    cam.lookAt(C.t);
  }
  function fly(v, dur = 1100) {
    const from = { t: C.t.clone(), az: C.az, el: C.el, d: C.d };
    tw = { from, to: { t: new T.Vector3(...v.t), az: v.az, el: v.el, d: v.d }, t0: performance.now(), dur };
    poke();
  }

  /* ---------- Nummern ---------- */
  const markEls = {};
  if (EXPL && opt.items) opt.items.forEach(it => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'sh__mk'; b.dataset.k = it.key;
    b.setAttribute('aria-label', it.nr + ' ' + it.name);
    b.innerHTML = `<span class="sh__nr">${it.nr}</span><span class="sh__lb info">${it.mark}</span>`;
    b.addEventListener('click', e => { e.stopPropagation(); api.select(sel === it.key ? null : it.key); });
    marks.appendChild(b); markEls[it.key] = b;
  });
  const ray = new T.Raycaster(), v3 = new T.Vector3();
  const pickables = () => { const a = []; root.traverse(o => { if (o.isMesh && o.visible && o.userData.part !== undefined) a.push(o); }); return a; };
  let pickList = null;
  function visibleChain(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
  function updateMarks() {
    if (!EXPL) return;
    const w = host.clientWidth, h = host.clientHeight;
    pickList = pickList || pickables();
    Object.entries(markEls).forEach(([k, el]) => {
      v3.set(...ANCH[k]); const dist = v3.distanceTo(cam.position);
      const p = v3.clone().project(cam);
      const on = p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05;
      el.style.transform = `translate(${((p.x + 1) / 2 * w).toFixed(1)}px,${((1 - p.y) / 2 * h).toFixed(1)}px)`;
      ray.set(cam.position, v3.clone().sub(cam.position).normalize());
      const hit = ray.intersectObjects(pickList, false).find(x => visibleChain(x.object) && x.object.material && x.object.material.visible !== false && !x.object.material.transparent);
      const hidden = hit && hit.distance < dist - .25 && hit.object.userData.part !== k;
      el.classList.toggle('is-off', !on); el.classList.toggle('is-behind', !!hidden);
      el.classList.toggle('is-sel', sel === k);
    });
  }

  /* ---------- Ziehen dreht, Klick wählt ---------- */
  const el = R.domElement;
  let drag = null, moved = 0;
  el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, az: C.az, el: C.el, id: e.pointerId }; moved = 0; });
  addEventListener('pointermove', e => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy));
      if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) && moved < 12) return;
      if (moved > 4) { tw = null; C.az = Math.max(-1.75, Math.min(.85, drag.az - dx * .006)); C.el = Math.max(-.1, Math.min(.85, drag.el + dy * .004)); poke(); host.classList.add('is-drag'); }
    } else if (EXPL && e.pointerType === 'mouse' && e.target === el) hover(e);
  });
  addEventListener('pointercancel', () => { drag = null; host.classList.remove('is-drag'); });
  addEventListener('pointerup', e => {
    if (!drag || e.pointerId !== drag.id) return;
    host.classList.remove('is-drag');
    if (moved < 5 && EXPL) { const k = pickAt(e); api.select(k && k !== sel ? k : null); }
    drag = null;
  });
  el.addEventListener('pointerleave', () => { hov.classList.remove('is-on'); el.style.cursor = ''; });
  function pickAt(e) {
    const r = el.getBoundingClientRect();
    ray.setFromCamera({ x: (e.clientX - r.left) / r.width * 2 - 1, y: -(e.clientY - r.top) / r.height * 2 + 1 }, cam);
    pickList = pickList || pickables();
    const hits = ray.intersectObjects(pickList, false).filter(h => visibleChain(h.object));
    const h = hits.find(h => h.object.userData.part && h.object.userData.part !== 'tuer');
    return h ? h.object.userData.part : null;
  }
  let hovT = 0;
  function hover(e) {
    const now = performance.now(); if (now - hovT < 60) return; hovT = now;
    const k = pickAt(e), it = k && opt.items && opt.items.find(i => i.key === k);
    el.style.cursor = it ? 'pointer' : 'grab';
    if (it) { const r = host.getBoundingClientRect(); hov.textContent = it.nr + ' ' + it.kurz; hov.style.transform = `translate(${e.clientX - r.left + 14}px,${e.clientY - r.top + 12}px)`; hov.classList.add('is-on'); }
    else hov.classList.remove('is-on');
  }

  /* ---------- Ausbaustufen ---------- */
  let curStage = EXPL ? 3 : 1;
  function setStageNow(n, animate) {
    curStage = n;
    staged.forEach(s => {
      const on = n >= s.n && n <= s.until;
      if (on && !s.g.visible) { s.g.visible = true; s.k = animate ? 0 : 1; s.t0 = performance.now() + (animate ? (s.n - 1) * 80 + Math.random() * 120 : 0); }
      if (!on) { s.g.visible = false; s.k = 0; }
      apply(s);
    });
    const paint = n >= 3, gm = paint ? pm('wand', 'paint') : pm('wand', 'gipsRaw');
    gipsM.forEach(m => m.material = gm);
    pickList = null; applyDim(); poke();
  }
  function apply(s) {
    const k = eo(Math.max(0, Math.min(1, s.k)));
    if (s.kind === 'grow') { s.g.scale.y = Math.max(.001, k); }
    else { s.g.children[0].position.y = -s.g.position.y + (1 - k) * 1.4; }
  }

  /* ---------- Takt ---------- */
  let need = true, visible = true, raf = 0;
  function poke() { need = true; if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    if (!visible) { need = true; return; }
    let busy = false;
    if (tw) {
      const k = easeIO(Math.min(1, (now - tw.t0) / tw.dur));
      C.t.lerpVectors(tw.from.t, tw.to.t, k); C.az = tw.from.az + (tw.to.az - tw.from.az) * k; C.el = tw.from.el + (tw.to.el - tw.from.el) * k; C.d = tw.from.d + (tw.to.d - tw.from.d) * k;
      if (k >= 1) tw = null; busy = true; need = true;
    }
    staged.forEach(s => { if (s.g.visible && s.k < 1) { s.k = Math.max(0, (now - s.t0) / 900); apply(s); busy = true; need = true; } });
    if (need && visible) { place(); R.render(scene, cam); updateMarks(); need = false; }
    if (busy || need) raf = requestAnimationFrame(frame);
  }
  const fit = () => { const w = host.clientWidth || 1, h = host.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); poke(); };
  const ro = new ResizeObserver(fit); ro.observe(host); fit();
  const io = new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); if (visible) poke(); }, { rootMargin: '200px 0px' }); io.observe(host);

  const api = {
    select(k) {
      sel = k || null; applyDim(); updateMarks();
      fly(VIEW[sel || (EXPL ? 'home' : 'stufen')]);
      host.classList.toggle('has-sel', !!sel);
      opt.onSelect && opt.onSelect(sel);
    },
    get selected() { return sel; },
    set(k, v) { state[k] = v; applyWahl(); },
    get wahl() { return { ...state }; },
    stage(n) { if (n !== curStage) setStageNow(n, true); },
    home() { fly(VIEW[sel || (EXPL ? 'home' : 'stufen')]); },
    dispose() { ro.disconnect(); io.disconnect(); R.dispose(); }
  };
  setStageNow(curStage, false);
  applyWahl();
  return api;
}
