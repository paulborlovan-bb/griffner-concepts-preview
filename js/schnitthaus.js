/* Services (Runde 45, Runde 46): Concept Bold im Schnitt, three.js.
   Runde 46 (Kundenwunsch: das Haus soll eines von unseren sein): Concept Bold, zwei Ebenen, Flachdach, dunkler Rahmen um beide Geschoße,
   dazwischen senkrechte Lärchenlatten, raumhohe Fenster (wie die Bilder wald-garten.jpg und wald-strasse.jpg). Das Haus ist bei x = 0
   aufgeschnitten wie ein Hausschnitt: an der Schnittfläche siehst du die GRIFFNER Wand, den Fußboden mit 21,5 cm, die Massivholzdecke und das Dach.
   Modus „erkunden“ (leistungen.html): Nummern 01 bis 08 am Modell, Klick auf Nummer oder Bauteil fliegt hin, der Rest wird hell
   wie ein weißes Architekturmodell. Modus „stufen“ (leistungsumfang.html): Ausbaustufe 1 bis 3 baut sich auf.
   Runde 51 (Kundenwunsch: das Satteldach ist das Besondere von GRIFFNER): Satteldach statt Flachdach, First entlang des Hauses,
   Obergeschoß so lang wie das Erdgeschoß und bis zum First offen. Am Schnitt siehst du den Aufbau des Dachs (ROOF: Holz innen,
   Sparren mit Holzfaser und Zellulose, Holzfaser, Hinterlüftung, Lattung, Betondachstein), an der Stirnseite den Giebel.
   Vom dunklen Rahmen bleibt das Band zwischen den Geschoßen.
   Maße in m. x entlang des Hauses (0 = Schnitt, LX = Stirnseite), y nach oben, z quer (+ Gartenseite). */
import * as T from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { prism, cube, MAT, FRAME_COL, WALL, FLOOR, ROOF } from './svc-geo.js';
import { BUILD, pendant, M as FM } from './grundriss-moebel.js';

/* ---------- Maße ---------- */
/* LX: Erdgeschoß, LO: Obergeschoß (Runde 51: gleich lang, darüber das Satteldach) */
const W = .4225, D = 9.0, HD = D / 2, ZI = HD - W, LX = 11.2, LO = LX;
const F0 = .215, H = 2.72, C0 = F0 + H, C1 = C0 + .2, F1 = C1 + .16, R0 = F1 + H, YW = R0 + .2;
/* Flachdach: Dämmung, Abdichtung, Attika; der dunkle Rahmen steht PJ vor der Fassade, ein Band zwischen den Geschoßen, eines am Dach */
const RD = .28, YT = YW + RD + .012, AT = YT + .22, PJ = .28;
const B0 = C0 - .12, B1 = F1 + .24, RB0 = R0 - .1, YM = (B0 + B1) / 2;
/* Satteldach: Neigung 35° (tan .7), Unterseite der Sparren durch die Oberkante der Außenwand, Traufe .55 m, Ortgang .45 m vor */
const TP = .7, OVS = .55, OVG = .45, yIn = z => YW + (HD - Math.abs(z)) * TP, RIDGE = yIn(0);
/* Treppe entlang der Rückwand, 16 Steigungen */
const SX = 1.0, SW = 1.0, NR = 16, GO = .27, SX0 = 1.75, SX1 = SX + GO * (NR - 1);
/* Öffnungen in x und y: Gartenseite (z+) raumhoch, Straßenseite (z−) Haustür, Fenster */
const OG0 = B1 + .06, OG1 = R0 - .2;
const OPEN = {
  front: [{ x0: .7, x1: 3.3, y0: F0, y1: F0 + 2.5, split: 1 }, { x0: 4.3, x1: 6.9, y0: F0, y1: F0 + 2.5, split: 1 }, { x0: 8.1, x1: 10.5, y0: F0, y1: F0 + 2.5, split: 1 },
    { x0: 1.0, x1: 2.9, y0: OG0, y1: OG1 }, { x0: 4.6, x1: 6.9, y0: OG0, y1: OG1, split: 1 }],
  back: [{ x0: 5.6, x1: 6.9, y0: F0, y1: F0 + 2.35, door: 1 }, { x0: 7.15, x1: 7.65, y0: F0, y1: F0 + 2.5 }, { x0: 9.0, x1: 10.4, y0: F0 + .9, y1: F0 + 2.5 }, { x0: 5.6, x1: 6.9, y0: 4.2, y1: OG1 }]
};
const POSTS = [[2.0, -.3], [5.27, -.3]];

/* Anker der Nummern und Blickpunkte (Ziel, Azimut, Höhe, Abstand) */
const ANCH = {
  openspace: [2.0, 1.75, -.3], wand: [-.02, 1.35, HD - W / 2], dach: [-.02, yIn(HD - 1.1) + .2, HD - 1.1],
  fenster: [2.0, 1.5, HD + .02], decke: [-.02, (C0 + C1) / 2, -1.2], parkett: [.8, F0 + .02, -1.3],
  raumhoehe: [-.08, (F0 + C0) / 2, -2.7], fassade: [3.75, 4.7, HD + .03]
};
const VIEW = {
  home: { t: [5.4, 3.5, .4], az: -.8, el: .28, d: 36 },
  openspace: { t: [3.6, 1.4, -.3], az: -1.22, el: .16, d: 11 },
  wand: { t: [0, 1.45, HD - W / 2], az: -1.12, el: .14, d: 2.9 },
  dach: { t: [.4, yIn(HD - 1.4) - .2, HD - 1.4], az: -1.1, el: .22, d: 7.5 },
  fenster: { t: [2.6, 1.7, 4.5], az: -.3, el: .1, d: 9 },
  decke: { t: [2.4, 2.7, .4], az: -1.12, el: -.06, d: 10 },
  parkett: { t: [1.6, .3, .2], az: -1.05, el: .42, d: 7.5 },
  raumhoehe: { t: [0, 1.7, -.6], az: -1.5, el: .04, d: 13 },
  fassade: { t: [5.4, 3.0, 4.5], az: .3, el: .1, d: 19 },
  stufen: { t: [5.4, 3.7, .2], az: -.9, el: .32, d: 38 }
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = t => 1 - Math.pow(1 - t, 3);

export async function createSchnitthaus(host, opt = {}) {
  const mode = opt.mode || 'erkunden', EXPL = mode === 'erkunden';
  const gl = document.createElement('div'); gl.className = 'sh__gl';
  const marks = document.createElement('div'); marks.className = 'sh__marks';
  const hov = document.createElement('span'); hov.className = 'sh__hov info'; hov.setAttribute('aria-hidden', 'true');
  host.append(gl, marks, hov);
  /* Runde 52 (Ausbaustufen): ein gelber Punkt mit Namen am Teil, das du gerade liest */
  const pin = document.createElement('div'); pin.className = 'sh__pin'; pin.setAttribute('aria-hidden', 'true');
  pin.innerHTML = '<i></i><span class="info"></span>';
  if (!EXPL) marks.appendChild(pin);
  let pinName = '';

  const R = new T.WebGLRenderer({ antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  /* Runde 52: Schatten nur neu, wenn sich etwas bewegt (Stufe wächst), nicht bei jedem Bild: ruhigeres Scrollen */
  R.shadowMap.autoUpdate = false; R.shadowMap.needsUpdate = true;
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
  /* Runde 52: Punkt am Teil für die Ausbaustufen (sonst ANCH, sonst Mitte des Teils) */
  const PIN_AT = {};
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

  /* ---------- Gelände: Sockel aus Erde, Rasen, Kiesstreifen, Terrasse aus Platten auf der Gartenseite ---------- */
  const LE = LX + PJ, HE = HD + PJ, XP = LE + 2.6, ZP = HE + 2.8, GR = -.15;
  const ushape = (xi, zi) => [[0, -ZP], [XP, -ZP], [XP, ZP], [0, ZP], [0, zi], [xi, zi], [xi, -zi], [0, -zi]];
  add(cube(0, -1.1, -ZP, XP, -.25, ZP), pm('g', 'earth'), null);
  add(prism('y', ushape(LE, HE), -.25, -.2), pm('g', 'earth'), null);
  add(prism('y', ushape(LE + .4, HE + .4), -.2, GR), pm('g', 'grass'), null);
  add(prism('y', [[0, -HE - .4], [LE + .4, -HE - .4], [LE + .4, HE + .4], [0, HE + .4], [0, HE], [LE, HE], [LE, -HE], [0, -HE]], -.2, GR + .015), pm('g', 'gravel'), null);
  for (let x = 0; x < LE - .1; x += 1.2) add(cube(x + .01, GR + .015, HE + .45, Math.min(LE, x + 1.19), GR + .05, HE + 2.25), pm('terrasse', 'concrete'), 'terrasse');
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
        for (let z = -ZI + .2; z < ZI - .1; z += .15) add(cube(.06, y, z - .009, 1.2, y + .018, z + .009), pm('technik', 'pipe'), 'technik', pipes, { cast: false });
        for (let z = -ZI + .2; z < ZI - .25; z += .3) { add(cube(.06, y, z, .078, y + .018, z + .15), pm('technik', 'pipe'), 'technik', pipes, { cast: false }); }
        const fill = stage(3, 'grow', y);
        add(cube(0, y, -ZI, 1.2, y1, ZI), pm('parkett', 'screed'), 'parkett', fill);
      } else add(cube(0, y, -ZI, LX - W, y1, ZI), pm('parkett', L.m), 'parkett', floorEG);
      y = y1;
    });
  }

  /* ---------- Wände: je Schicht ein Prisma mit den Öffnungen als Löcher ---------- */
  const facade = [], gipsM = [], depth = [];
  { let a = 0; WALL.forEach(L => { depth.push([a, a + L.d]); a += L.d; }); }
  const wallMat = L => (L.k === 'fassade' ? pm('fassade', 'slats') : L.k === 'gips' ? pm('wand', 'gipsRaw') : pm('wand', L.m));
  const hole = o => [[o.x0, o.y0], [o.x1, o.y0], [o.x1, o.y1], [o.x0, o.y1]];
  /* Erdgeschoß bis YM (hinter dem Band), Obergeschoß darüber */
  const wallZ = (s, open) => WALL.forEach((L, i) => {
    const [a, b] = depth[i];
    const z0 = s > 0 ? HD - b : -(HD - a), z1 = s > 0 ? HD - a : -(HD - b);
    [[0, YM, LX - a, false], [YM, YW, LO - a, true]].forEach(([y0, y1, xEnd, og]) => {
      const hs = open.filter(o => o.y0 >= y0 && o.y1 <= y1).map(hole);
      const m = add(prism('z', [[0, y0], [xEnd, y0], [xEnd, y1], [0, y1]], z0, z1, hs), wallMat(L), L.k === 'fassade' ? 'fassade' : 'wand');
      if (L.k === 'fassade') { m.userData.og = og; facade.push(m); }
      if (L.k === 'gips') gipsM.push(m);
    });
  });
  wallZ(1, OPEN.front); wallZ(-1, OPEN.back);
  /* Stirnseite ohne Öffnungen: unten bis YM, oben der Giebel bis unter die Sparren */
  [[LX, 0, YM, false], [LO, YM, YW, true]].forEach(([xe, y0, y1, og]) => WALL.forEach((L, i) => {
    const [a, b] = depth[i], zl = HD - b;
    const poly = og ? [[-zl, y0], [zl, y0], [zl, yIn(zl)], [0, RIDGE], [-zl, yIn(zl)]] : [[-zl, y0], [zl, y0], [zl, y1], [-zl, y1]];
    const m = add(prism('x', poly, xe - b, xe - a), wallMat(L), L.k === 'fassade' ? 'fassade' : 'wand');
    if (L.k === 'fassade') { m.userData.og = og; facade.push(m); }
    if (L.k === 'gips') gipsM.push(m);
  }));
  /* Das dunkle Band zwischen den Geschoßen, rund ums Haus */
  {
    const dk = pm('fassade', 'frame');
    add(cube(0, B0, HD, LE, B1, HE), dk, 'fassade');
    add(cube(0, B0, -HE, LE, B1, -HD), dk, 'fassade');
    add(cube(LX, B0, -HE, LE, B1, HE), dk, 'fassade');
  }
  /* Sockelblech an Garten- und Straßenseite */
  add(cube(0, GR, HD, LX, .05, HD + .012), pm('blech', 'alu'), 'blech');
  add(cube(0, GR, -HD - .012, LX, .05, -HD), pm('blech', 'alu'), 'blech');

  /* ---------- Decke (Massivholz oder Tram) mit Treppenloch, Obergeschoß ---------- */
  const notchAt = xe => [[0, -ZI], [SX0, -ZI], [SX0, -ZI + SW], [SX1, -ZI + SW], [SX1, -ZI], [xe, -ZI], [xe, ZI], [0, ZI]];
  const notch = notchAt(LX - W), notchOG = notchAt(LO - W);
  const ceil = add(prism('y', notch, C0, C1), pm('decke', 'slab'), 'decke');
  const beams = new T.Group(); root.add(beams); beams.visible = false;
  for (let x = .35; x < LX - W - .1; x += .8) add(cube(x - .07, C0 - .18, x > SX0 - .1 && x < SX1 + .1 ? -ZI + SW : -ZI, x + .07, C0, ZI), pm('decke', 'slab'), 'decke', beams);
  const floorOG = stage(2, 'grow', C1);
  const floorOG3 = stage(3, 'grow', F1 - .015);
  {
    let y = C1;
    [['fill', .055], ['insul', .03], ['screed', .06], ['oak', .015]].forEach(([m, d]) => {
      add(prism('y', notchOG, y, y + d), pm('parkett', m), 'parkett', m === 'oak' ? floorOG3 : floorOG); y += d;
    });
  }

  /* ---------- Satteldach: Schicht für Schicht (ROOF, von innen nach außen) als Band über beide Dachflächen, am Schnitt offen ---------- */
  {
    const c = Math.cos(Math.atan(TP)), Ze = HD + OVS, xe = LX + OVG;
    let o = 0;
    ROOF.forEach(L => {
      const o0 = o / c, o1 = (o + L.d) / c; o += L.d;
      [1, -1].forEach(s => add(prism('x', [[0, RIDGE + o0], [s * Ze, yIn(Ze) + o0], [s * Ze, yIn(Ze) + o1], [0, RIDGE + o1]], 0, xe), pm('dach', L.m), 'dach'));
    });
    /* Fußpfetten auf den Wänden, unter den Sparren */
    [1, -1].forEach(s => add(prism('x', [[s * ZI, YW], [s * HD, YW], [s * ZI, yIn(ZI)]], 0, LX), pm('dach', 'spruce'), 'dach'));
    /* Dachrinne an der Traufe, Blech am Ortgang */
    /* Runde 52: Rinne, Ortgang und Sockelblech sind ein eigenes Teil „blech“ (Spengler), damit es in den Ausbaustufen leuchtet */
    const al = pm('blech', 'alu'), top = o / c;
    [1, -1].forEach(s => {
      const g = add(cube(0, yIn(Ze) - .12, Math.min(s * Ze, s * (Ze + .14)), xe, yIn(Ze) + .02, Math.max(s * Ze, s * (Ze + .14))), al, 'blech');
      if (s > 0) PIN_AT.blech = [xe * .62, yIn(Ze) - .05, Ze + .07];
      add(prism('x', [[0, RIDGE + top], [s * Ze, yIn(Ze) + top], [s * Ze, yIn(Ze) + top - .2], [0, RIDGE + top - .2]], xe, xe + .025), al, 'blech');
      void g;
    });
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
  const gF = wallFrame('front'), gB = wallFrame('back');
  /* Gartenseite: u = −x */
  OPEN.front.forEach(o => window(gF, -o.x1, -o.x0, o.y0, o.y1, { split: o.split }));
  OPEN.back.filter(o => !o.door).forEach(o => window(gB, o.x0, o.x1, o.y0, o.y1, { split: o.split }));
  /* Haustür Holz-Alu mit Seitenteil auf der Straßenseite, Stangengriff außen */
  {
    const d = OPEN.back.find(o => o.door), u0 = d.x0, u1 = d.x1, v0 = d.y0, v1 = d.y1, fw = .085;
    const al = pm('tuer', 'alu'), wd = pm('tuer', 'frameNatur');
    add(cube(u0, v1 - fw, .07, u1, v1, .175), al, 'tuer', gB); add(cube(u0, v0, .07, u0 + fw, v1 - fw, .175), al, 'tuer', gB); add(cube(u1 - fw, v0, .07, u1, v1 - fw, .175), al, 'tuer', gB);
    add(cube(u0 + fw, v0, .07, u0 + fw + .07, v1 - fw, .175), al, 'tuer', gB);
    const lu0 = u0 + fw + .07, lu1 = u1 - fw;
    add(cube(lu0, v0 + .01, .075, lu1, v1 - fw, .1), al, 'tuer', gB);
    add(cube(lu0, v0 + .01, .1, lu1, v1 - fw, .165), wd, 'tuer', gB);
    add(cube(lu1 - .155, v0 + .35, .035, lu1 - .12, v0 + 1.95, .07), pm('tuer', 'steel'), 'tuer', gB);
    [.11, .127].forEach(w => add(cube(u0 + fw, v0 + .02, w, u0 + fw + .07, v1 - fw, w + .006), glass, 'tuer', gB, { cast: false }));
    reveal(gB, u0, u1, v0, v1, pm('tuer', 'paint'), al, 'tuer', .175, .07);
  }

  /* ---------- Treppe: Rohbautreppe (Stufe 1 bis 2), Eiche mit Setzstufen und Geländer (Stufe 3) ---------- */
  {
    const raw = stage(1, 'grow', 0, 2);
    const r1 = C1 / NR;
    for (let i = 0; i < NR - 1; i++) add(cube(SX + GO * i, r1 * (i + 1) - .05, -ZI + .06, SX + GO * (i + 1) + .02, r1 * (i + 1), -ZI + SW - .06), pm('treppe', 'spruce'), 'treppe', raw);
    [-ZI + .06, -ZI + SW - .06].forEach(z => add(prism('z', [[SX, 0], [SX + .3, 0], [SX1 + .02, C1 - .25], [SX1 + .02, C1], [SX1 - .3, C1]], z - .05, z), pm('treppe', 'spruce'), 'treppe', raw));
    const oak = stage(3, 'grow', 0);
    const r = (F1 - F0) / NR;
    for (let i = 0; i < NR - 1; i++) {
      const y = F0 + r * (i + 1);
      add(cube(SX + GO * i - .03, y - .045, -ZI, SX + GO * (i + 1), y, -ZI + SW), pm('treppe', 'oak'), 'treppe', oak);
      add(cube(SX + GO * i, y - r, -ZI, SX + GO * i + .02, y - .045, -ZI + SW), pm('treppe', 'oak'), 'treppe', oak);
    }
    add(cube(SX + GO * (NR - 1), F1 - r, -ZI, SX + GO * (NR - 1) + .02, F1 - .015, -ZI + SW), pm('treppe', 'oak'), 'treppe', oak);
    add(prism('z', [[SX, F0], [SX + .32, F0], [SX1, F1 - .18], [SX1, F1], [SX1 - .32, F1]], -ZI + SW, -ZI + SW + .05), pm('treppe', 'oak'), 'treppe', oak);
    /* Geländer in Eiche am Treppenloch */
    for (let x = SX0 + .06; x < SX1 - .02; x += .11) add(cube(x, F1, -ZI + SW - .04, x + .035, F1 + .98, -ZI + SW), pm('treppe', 'oak'), 'treppe', oak);
    add(cube(SX0, F1 + .98, -ZI + SW - .06, SX1, F1 + 1.03, -ZI + SW + .01), pm('treppe', 'oak'), 'treppe', oak);
    for (let z = -ZI + .06; z < -ZI + SW - .05; z += .11) add(cube(SX0, F1, z, SX0 + .035, F1 + .98, z + .035), pm('treppe', 'oak'), 'treppe', oak);
    add(cube(SX0 - .02, F1 + .98, -ZI, SX0 + .05, F1 + 1.03, -ZI + SW), pm('treppe', 'oak'), 'treppe', oak);
  }

  /* ---------- Haustechnik (Stufe 2): Wärmepumpe außen, Schalter und Steckdosen ---------- */
  {
    const hp = stage(2, 'drop', GR + .02);
    const x = LE + 1.0, z = HD - .9;
    add(cube(x - .2, GR + .02, z - .55, x + .26, GR + 1.0, z + .55), pm('technik', 'white'), 'technik', hp);
    add(cube(x + .26, GR + .1, z - .45, x + .275, GR + .92, z + .45), pm('technik', 'dark'), 'technik', hp);
    add(cube(x - .25, GR + .015, z - .62, x + .32, GR + .03, z + .62), pm('g', 'concrete'), null, hp);
    const el = stage(2, 'drop', 0);
    [[7.3, .45], [5.35, 1.05], [.5, .45]].forEach(([x, y]) => add(cube(x - .04, F0 + y - .04, -ZI, x + .04, F0 + y + .04, -ZI + .012), pm('technik', 'white'), 'technik', el, { cast: false }));
    [[3.8, .45], [7.6, .45]].forEach(([x, y]) => add(cube(x - .04, F0 + y - .04, ZI - .012, x + .04, F0 + y + .04, ZI), pm('technik', 'white'), 'technik', el, { cast: false }));
  }

  /* ---------- Möbel (nur „erkunden“) ---------- */
  if (EXPL) {
    const put = (obj, x, y, z, ry = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData.part = null; (parts.moebel || (parts.moebel = [])).push(o); } }); root.add(obj); };
    put(BUILD.sofa(2.6, .98, { c: 'kalk' }), 2.75, F0, 2.55, -Math.PI / 2);
    put(BUILD.coffee(1.0, .6, {}), 1.6, F0, 2.55);
    put(BUILD.table(2.0, .95, {}), 3.65, F0, -1.85, Math.PI / 2);
    [[-.5, -1], [.5, -1], [-.5, 1], [.5, 1]].forEach(([dz, s]) => put(BUILD.chair(.48, .52, {}), 3.65 + s * .66, F0, -1.85 + dz, s * -Math.PI / 2));
    put(pendant(C0 - F0), 3.65, F0, -1.85);
    put(BUILD.lowboard(1.8, .45, {}), LX - W - .25, F0, 1.6, -Math.PI / 2);
    put(BUILD.plant(.5, .5, {}), .45, F0, 3.65);
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
    const larch = pm('fassade', 'slats'), putz = pm('fassade', 'putz');
    /* Beides: unten Putz, oben Lärche */
    facade.forEach(m => { m.material = state.fassade === 'holz' ? larch : state.fassade === 'putz' ? putz : (m.userData.og ? larch : putz); });
    frameWood.color.setHex(FRAME_COL[state.fenster] || FRAME_COL.natur);
    const slab = state.farbe === 'weiss' ? pm('decke', 'slabWhite') : pm('decke', 'slab');
    ceil.material = slab; beams.children.forEach(b => b.material = slab); beams.visible = state.decke === 'tram';
    pickList = null; applyDim(); poke();
  }

  /* ---------- Hell machen, was nicht gewählt ist ---------- */
  let sel = null;
  /* Runde 52: der gewählte Teil wird gelb, der Rest hell; beides blendet weich über (Ziel je Material, frame() nähert sich an) */
  const emi = new Map(), YEL = new T.Color(0xffb200);
  let emiBusy = false;
  function applyDim(snap) {
    const lit = new Set(), dim = new Set(), hot = new Set();
    Object.entries(parts).forEach(([k, ms]) => ms.forEach(m => (sel && k !== sel ? dim : lit).add(m.material)));
    if (sel && parts[sel]) parts[sel].forEach(m => hot.add(m.material));
    root.traverse(o => { if (o.isMesh && !o.userData.part && o.material) (sel ? dim : lit).add(o.material); });
    new Set([...lit, ...dim]).forEach(m => {
      if (!m.emissive || m === FM.glow) return;
      const e = emi.get(m) || { neu: true };
      e.dT = dim.has(m) && !lit.has(m) ? 1 : 0; e.gT = hot.has(m) && !dim.has(m) ? 1 : 0;
      /* neues Material (Wahl, Stufe 3 Farbe): gleich am Ziel, kein Aufblitzen */
      if (e.neu) { e.d = e.dT; e.g = e.gT; delete e.neu; }
      emi.set(m, e);
    });
    if (FM.glow) { FM.glow.emissive.setHex(0xffe2b0); FM.glow.emissiveIntensity = .9; }
    glass.opacity = sel && sel !== 'fenster' ? .12 : .22;
    emiBusy = true; stepEmi(snap || reduceMotion ? 1 : 0);
  }
  /* k = Anteil des Wegs zum Ziel in diesem Bild; 1 = sofort */
  function stepEmi(k) {
    if (!emiBusy) return false;
    let busy = false;
    emi.forEach((e, m) => {
      e.d += (e.dT - e.d) * k; e.g += (e.gT - e.g) * k;
      if (Math.abs(e.dT - e.d) < .004) e.d = e.dT; if (Math.abs(e.gT - e.g) < .004) e.g = e.gT;
      if (e.d !== e.dT || e.g !== e.gT) busy = true;
      const w = .58 * e.d, y = (EXPL ? (sel === 'openspace' ? .62 : 0) : .42) * e.g;
      m.emissive.setRGB(w + YEL.r * y, w + YEL.g * y, w + YEL.b * y); m.emissiveIntensity = 1;
    });
    emiBusy = busy;
    return busy;
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
  const pinBox = new T.Box3(), pinV = new T.Vector3();
  function pinAt(k) {
    if (PIN_AT[k]) return pinV.set(...PIN_AT[k]);
    if (ANCH[k]) return pinV.set(...ANCH[k]);
    const ms = (parts[k] || []).filter(visibleChain); if (!ms.length) return null;
    pinBox.makeEmpty(); ms.forEach(m => pinBox.expandByObject(m));
    return pinBox.getCenter(pinV);
  }
  function updatePin() {
    if (EXPL) return;
    const v = sel ? pinAt(sel) : null;
    if (!v) { pin.classList.remove('is-on'); return; }
    const w = host.clientWidth, h = host.clientHeight, p = v.clone().project(cam);
    const on = p.z < 1 && Math.abs(p.x) < 1 && Math.abs(p.y) < 1;
    const x = (p.x + 1) / 2 * w, y = (1 - p.y) / 2 * h;
    pin.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    pin.classList.toggle('is-left', x > w * .62);
    const t = pin.lastChild; if (t.textContent !== pinName) t.textContent = pinName;
    pin.classList.toggle('is-on', on && !!pinName);
  }
  function updateMarks() {
    updatePin();
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
    const h = hits.find(h => h.object.userData.part && VIEW[h.object.userData.part]);
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
    R.shadowMap.needsUpdate = true; pickList = null;
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
    staged.forEach(s => { if (s.g.visible && s.k < 1) { s.k = Math.max(0, (now - s.t0) / 900); apply(s); busy = true; need = true; R.shadowMap.needsUpdate = true; } });
    if (emiBusy) { const dt = Math.min(64, now - (frame.last || now)); if (stepEmi(1 - Math.exp(-(dt || 16) / 140))) busy = true; need = true; }
    frame.last = now;
    /* Platz für die Karte rechts: das Bild rückt weich nach links */
    if (Math.abs(padT - padC) > .5) { padC += (padT - padC) * .16; if (Math.abs(padT - padC) <= .5) padC = padT; offset(); busy = true; need = true; }
    if (need && visible) { place(); R.render(scene, cam); updateMarks(); need = false; }
    if (busy || need) raf = requestAnimationFrame(frame);
  }
  let padT = 0, padC = 0;
  function offset() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    if (padC > .5) cam.setViewOffset(w, h, padC / 2, 0, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }
  const fit = () => { const w = host.clientWidth || 1, h = host.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; offset(); poke(); };
  const ro = new ResizeObserver(fit); ro.observe(host); fit();
  const io = new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); if (visible) poke(); }, { rootMargin: '200px 0px' }); io.observe(host);

  const api = {
    select(k) {
      sel = k || null; applyDim(); updateMarks();
      fly(VIEW[sel || (EXPL ? 'home' : 'stufen')]);
      host.classList.toggle('has-sel', !!sel);
      opt.onSelect && opt.onSelect(sel);
    },
    /* Runde 48: nur hell machen, der Blick bleibt (Ausbaustufen, der Bereich, den du gerade liest) */
    focus(k, name) { pinName = (k && name) || ''; if ((k || null) === sel) { updatePin(); return; } sel = k || null; applyDim(); host.classList.toggle('has-sel', !!sel); poke(); },
    get selected() { return sel; },
    set(k, v) { state[k] = v; applyWahl(); },
    get wahl() { return { ...state }; },
    stage(n) { if (n !== curStage) setStageNow(n, true); },
    home() { fly(VIEW[sel || (EXPL ? 'home' : 'stufen')]); },
    pad(px) { padT = Math.max(0, px || 0); if (reduceMotion) { padC = padT; offset(); } poke(); },
    dispose() { ro.disconnect(); io.disconnect(); R.dispose(); }
  };
  setStageNow(curStage, false);
  applyWahl();
  return api;
}
