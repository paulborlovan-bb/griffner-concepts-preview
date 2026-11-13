/* Runde 61 (Kunde, 2026-11-13): die Ausbaustufen auf /services/leistungsumfang mit dem Haus der Services Seite.
   Statt Schildern, die auf Teile zeigen, baut sich das Haus mit der Liste: jeder Bereich, den du liest, setzt seinen Teil dazu
   (Plan, Bodenplatte, Wände in Holz, Fassade, Dach, Fenster, Haustür, Raffstores, Feuchtesensoren, Spengler, Terrasse und Zufahrt).
   Belagsfertig und Schlüsselfertig: das Obergeschoß hebt ab, du siehst ins Erdgeschoß (Heizung, Elektro, Sanitär, Estrich, Treppe,
   Parkett, Fliesen, Innentüren, Bad, Malerarbeiten). Übergabe: das Haus schließt sich, die Fenster leuchten.
   Das Haus selbst kommt aus js/svc-film3d.js (buildScene, gebaut aus dem Entwurf), hier nur zerlegt und neu geordnet.
   Der neue Teil leuchtet kurz gelb. Ziehen dreht das Haus. Zeichnen nur, solange sich etwas bewegt und der Bereich zu sehen ist. */
import * as T from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { buildScene } from './svc-film3d.js';

/* Maße des Hauses wie in buildScene */
const EX0 = -9.5, EX1 = 5.9, EZ0 = -5.5, EZ1 = 8.15, EH = 3.0, BX = .9, HW = 4, BZ0 = -7.5, BZ1 = 9.7, YB = 3.3, KW = 2.1;
const GELB = new T.Color(0xFFB200);
/* Sockel: Haus (x -9.6 bis 6.7, z -7.7 bis 9.9), Terrasse (bis x -11.1, z -9.5), Zufahrt (bis z 12), Wärmepumpe (x 7.1), rundum gut 1 m */
const PL = { x: -1.9, z: 1.2, w: 21.4, d: 24 };
const cl = t => Math.max(0, Math.min(1, t)), eo = t => 1 - Math.pow(1 - cl(t), 3), eio = t => (t = cl(t), t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Bereiche der Liste (data-name, wie in data/leistungen.js) und ihr Bauschritt */
export const BAU = ['Beratung und Planung', 'Baustelle', 'Die GRIFFNER Wand', 'Fassade', 'Dach', 'Geschossdecke', 'Fenster', 'Haustür',
  'Beschattung und Insektenschutz', 'Feuchtemonitoring', 'Spengler', 'Terrasse, Carport und Überdachungen',
  'Wärme', 'Elektro', 'Sanitärinstallation', 'Estrich und Fußbodenaufbau',
  'Böden, Treppe, Türen', 'Bodenbelag', 'Fliesen', 'Innentüren', 'Sanitäreinrichtung', 'Oberflächen', 'Übergabe'];
const INNEN = [12, 21];            // Obergeschoß abgehoben
const UEBERGABE = 22;
/* Teile: ab welchem Schritt, bis zu welchem, wie sie kommen (Fall aus d Metern, oder ein-/ausblenden), Verzögerung */
const SETS = {
  plan: { from: 0, until: 2, fade: 1 }, wire: { from: 0, until: 1, fade: 1 },
  fund: { from: 1, d: 2.2 },
  wall: { from: 2, d: 7 }, deck: { from: 2, d: 7, wait: .3 }, 'wall^': { from: 2, d: 7, wait: .55 }, 'deck^': { from: 2, d: 7, wait: .3 },
  clad: { from: 3, fade: 1 }, roof: { from: 4, d: 5 },
  win: { from: 6, d: 1.4 }, door: { from: 7, d: 1.4 }, raff: { from: 8, d: 1.2 }, sens: { from: 9, until: 9, fade: 1 }, gut: { from: 10, d: 2 },
  terr: { from: 11, d: 1.4 }, carp: { from: 11, d: 1.4, wait: .15 },
  iwall: { from: 12, d: 3.2 }, heat: { from: 12, until: 14, d: .6, wait: .3 }, pump: { from: 12, d: 1.5 },
  elec: { from: 13, until: 20, d: .6 }, sani: { from: 14, until: 19, d: .6 }, estr: { from: 15, d: .5 },
  stair: { from: 16, d: 1.6 }, park: { from: 17, d: .5 }, tile: { from: 18, d: .5 }, idoor: { from: 19, d: 1 }, bath: { from: 20, d: 1 }
};
/* was im Schritt kurz gelb leuchtet */
const GLOW = { 0: ['plan', 'wire'], 1: ['fund'], 2: ['wall', 'wall^', 'deck', 'deck^'], 3: ['wall', 'wall^', 'clad'], 4: ['roof'], 5: ['deck', 'deck^'], 6: ['win'], 7: ['door'],
  8: ['raff'], 9: ['sens'], 10: ['gut'], 11: ['terr', 'carp'], 12: ['heat', 'pump'], 13: ['elec'], 14: ['sani'], 15: ['estr'], 16: ['stair'], 17: ['park'], 18: ['tile'],
  19: ['idoor'], 20: ['bath'], 21: ['iwall'] };
const base = k => k.replace('^', '');

export async function createBau(host) {
  const gl = document.createElement('div'); gl.className = 'sh__gl'; host.prepend(gl);
  const phone = Math.min(innerWidth, innerHeight) < 600;
  const R = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 2 : 1.75));
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  gl.appendChild(R.domElement);
  /* Runde 64b: Hintergrund aus dem CSS der Bühne (Ausbaustufen schwarz), sonst Weiß */
  const bgc = getComputedStyle(host).backgroundColor, bgm = bgc && bgc.match(/\d+(\.\d+)?/g), bgOk = bgm && (bgm.length < 4 || +bgm[3] > 0);
  const scene = new T.Scene(); scene.background = bgOk ? new T.Color().setRGB(bgm[0] / 255, bgm[1] / 255, bgm[2] / 255, T.SRGBColorSpace) : new T.Color(0xffffff);
  const pmrem = new T.PMREMGenerator(R), env = pmrem.fromScene(new RoomEnvironment(R), .04).texture; pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff, 0xd9d3c8, 1.15));
  const sun = new T.DirectionalLight(0xfff3e2, 2.4); sun.position.set(-22, 38, 24); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 110 }); sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; scene.add(sun, sun.target);
  const fill = new T.DirectionalLight(0xffffff, .55); fill.position.set(30, 14, -20); scene.add(fill);
  const cam = new T.PerspectiveCamera(28, 1, .5, 400);

  /* Haus aus der Szene der Services Seite */
  const S = buildScene(T);
  const KEEP = { fund: 1, huelle: 1, innen: 1, terrasse: 1, carport: 1, zeich: 1 };
  [...S.root.children].forEach(c => { if (!KEEP[c.name]) S.root.remove(c); });
  S.root.position.set(0, 0, 0); S.root.updateMatrixWorld(true);
  const house = new T.Group(), rig = new T.Group(); house.add(rig); scene.add(house);

  /* Sockel: ein heller Block wie ein Architekturmodell, oben auf Höhe der Bodenplatte minus 24 cm */
  const GY = -.24;
  { const g = new T.BoxGeometry(PL.w, 1.2, PL.d), m = new T.Mesh(g, new T.MeshStandardMaterial({ color: 0xEDEAE4, roughness: .95 }));
    m.position.set(PL.x, GY - .6, PL.z); m.receiveShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(g), new T.LineBasicMaterial({ color: 0xBDB8AE }))); house.add(m); }

  /* ---- Teile einsammeln und einordnen ---- */
  /* Runde 66: 'og' = eingerichtetes Obergeschoss des Entwurfs (Raumgefühl im Film), gehört zu keiner Ausbaustufe */
  const SKIP = new Set(['dim', 'wallx', 'ghostH', 'roofIns', 'pvA', 'moe', 'og']);
  const units = [];
  const ctxOf = { gvol: 'gvol', up: 'up', deck: 'deck', roof: 'roof', zUp: 'zUp', zeich: 'zeich', fund: 'fund', terrasse: 'terr', carport: 'carp', innen: 'inn' };
  const IA = S.U.innen.userData.IA || {};
  const iaName = new Map(Object.entries(IA).map(([k, g]) => [g, k]));
  function walk(g, ctx) {
    for (const c of [...g.children]) {
      if (c.isLight) { c.intensity = 0; continue; }
      if (c.isPoints) { c.visible = false; continue; }
      if (SKIP.has(c.name) || iaName.get(c) === 'moe') { c.visible = false; continue; }
      const nctx = ctxOf[c.name] || (iaName.has(c) ? 'ia-' + iaName.get(c) : ctx);
      if (c.isGroup && (iaName.has(c) || !(c.name === '' && (ctx === 'gvol' || ctx === 'inn')))) walk(c, nctx);
      else units.push({ o: c, ctx: nctx });
    }
  }
  walk(S.root, 'root');
  const v = new T.Vector3(), bb = new T.Box3();
  const hex = m => (m && m.color ? m.color.getHex() : -1);
  const mats = o => { const a = []; o.traverse(x => { if (x.material) (Array.isArray(x.material) ? x.material : [x.material]).forEach(m => a.push(m)); }); return a; };
  function classify(u) {
    const o = u.o; bb.setFromObject(o); bb.getCenter(v); const sz = bb.getSize(new T.Vector3());
    const m0 = Array.isArray(o.material) ? o.material[0] : o.material, h = hex(m0), bath = v.x < -3.3 && v.x > EX0 && v.z < -1.6;
    switch (u.ctx) {
      case 'fund': return 'fund';
      case 'zeich': return 'plan';
      case 'zUp': return 'wire';
      case 'terr': return 'terr';
      case 'carp': return 'carp';
      case 'roof': return 'roof';
      case 'deck': return 'deck';
      case 'gvol':
        if (o.isGroup) return 'door';                                   // Haustür
        if (o.isLineSegments || o.isLine) return 'door';                // Rillen im Garagentor
        if (m0 === S.glas) return 'win';
        if (h === 0x2a2c2e) return sz.x > 5 && v.z > EZ1 - .2 ? 'door' : 'win';
        return 'wall';
      case 'up':
        if (o.isLineSegments || o.isLine) return 'clad';                // Lärchenschalung
        if (m0 === S.glas || h === 0x2a2c2e || h === 0xDDE3E3) return 'win';
        return 'wall';
      case 'inn':
        if (o.isGroup || o.isLineSegments) return 'idoor';
        if (m0 && m0.map && hex(m0) === 0xffffff) return v.x < -3.1 ? 'tile' : 'park';
        if (sz.y > 2.8) return 'iwall';
        if (h === 0xB08A62 && v.x > -3 && v.x < -1.9) return 'stair';
        return bath && sz.y < 1.2 ? 'bath' : null;
      case 'ia-floor': return v.x < -3.1 ? 'tile' : 'park';
      case 'ia-ein': return bath ? 'bath' : null;
      case 'ia-dek': return bath && v.y > .7 ? 'bath' : null;
    }
    return null;
  }

  /* je Teil eine Gruppe, unten (Erdgeschoß) oder oben (am Gestell, das im Innenausbau abhebt); eigene Materialien je Gruppe */
  const G = {};
  const grp = key => {
    if (G[key]) return G[key];
    const hi = key.endsWith('^'), s = SETS[key] || SETS[base(key)];
    const g = new T.Group(); g.name = 'bau-' + key; (hi ? rig : house).add(g);
    return G[key] = { key, g, s, k: 0, t: 0, wait: 0, glow: 0, gt: 0, mats: new Map(), list: [], units: [] };
  };
  const own = (st, m) => { if (!st.mats.has(m)) { const c = m.clone(); c.userData = { ...m.userData, c0: c.color ? c.color.clone() : null, op0: m.userData.base ?? m.opacity ?? 1 }; st.mats.set(m, c); st.list.push(c); } return st.mats.get(m); };
  S.root.updateMatrixWorld(true);
  units.forEach(u => {
    let key = classify(u); if (!key) { u.o.visible = false; return; }
    bb.setFromObject(u.o); bb.getCenter(v);
    if (v.y > EH + .05 && !['plan', 'wire', 'fund', 'terr', 'carp'].includes(key)) key += '^';
    const st = grp(key);
    u.o.traverse(x => { if (!x.material) return; x.material = Array.isArray(x.material) ? x.material.map(m => own(st, m)) : own(st, x.material); x.castShadow = x.receiveShadow = !!x.isMesh; });
    st.g.attach(u.o); st.units.push(u.o);
  });

  /* Plan und Drahtmodell dunkel auf dem hellen Sockel (in der Szene weiß auf Schwarz) */
  ['plan', 'wire'].forEach(k => G[k] && G[k].list.forEach(m => { if (m.color && hex(m) === 0xffffff) { m.color.setHex(0x2B2B2A); m.userData.c0 = m.color.clone(); } }));
  /* Grundopazität (in der Szene setzt der Film sie je Bild) */
  Object.values(G).forEach(st => st.list.forEach(m => { const b = m.userData.op0; if (b < .999) { m.transparent = true; m.opacity = b; m.depthWrite = false; } }));
  /* Glas: der Klon behält die Merkmale des Originals */
  Object.values(G).forEach(st => st.list.forEach(m => { if (m.metalness >= .85 && m.roughness <= .06) { m.envMap = env; m.envMapIntensity = 1.3; m.userData.glass = 1; } }));

  /* Terrasse und Zufahrt auf den Sockel (in der Szene liegen sie auf dem Grundstück, hier 24 cm tiefer) */
  if (G.terr) { G.terr.g.scale.y = (.18 - GY) / .18; G.terr.y0 = GY; }
  if (G.carp) G.carp.y0 = GY + .005;

  /* Wände: erst Holz (die GRIFFNER Wand), mit der Fassade Stein und Lärche */
  const holz = new T.MeshStandardMaterial({ color: 0xE4D0AC, roughness: .82 });
  ['wall', 'wall^'].forEach(k => { const st = G[k]; if (!st) return; const w = holz.clone(); w.userData = { c0: w.color.clone(), op0: 1 }; st.list.push(w);
    st.units.forEach(o => o.traverse(x => { if (!x.isMesh) return; const orig = x.material, swap = m => ((m.map && hex(m) === 0xffffff) || hex(m) === 0xB39878 ? w : m);
      x.userData.fac = orig; x.userData.raw = Array.isArray(orig) ? orig.map(swap) : swap(orig); })); });
  let facade = -1;
  const setFacade = on => { if (facade === +on) return; facade = +on; ['wall', 'wall^'].forEach(k => G[k] && G[k].units.forEach(o => o.traverse(x => { if (x.isMesh && x.userData.fac) x.material = on ? x.userData.fac : x.userData.raw; }))); };
  setFacade(false);
  /* Innenwände und Innenseiten: roh (Gipsfaser), mit den Oberflächen weiß */
  const paintMats = [...(G.iwall ? G.iwall.list : []), ...(G.wall ? G.wall.list.filter(m => hex(m) === 0xF3F1EC) : [])].filter(m => m.isMeshStandardMaterial);
  const RAW = new T.Color(0xCFC9BE); paintMats.forEach(m => { m.userData.paint = 1; });

  /* ---- neue Teile, die es in der Szene nicht gibt ---- */
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: o.r ?? .6, metalness: o.m ?? 0 });
  const add = (key, geo, mat, x, y, z) => { const st = grp(key), m = new T.Mesh(geo, own(st, mat)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; st.g.add(m); st.units.push(m); return m; };
  const tube = (key, pts, r, mat) => { const c = new T.CurvePath(); for (let i = 1; i < pts.length; i++) c.add(new T.LineCurve3(new T.Vector3(...pts[i - 1]), new T.Vector3(...pts[i])));
    return add(key, new T.TubeGeometry(c, Math.round(Math.max(16, Math.min(1600, c.getLength() / .1))), r, 6, false), mat, 0, 0, 0); };
  /* Raffstores: Kasten über den großen Fenstern im Erdgeschoß, Lamellen fahren im Schritt herunter */
  const raffs = [];
  { const dark = std(0x34342f, { r: .5, m: .4 });
    const R1 = (x0, x1, z, o) => ({ ax: 'x', a0: x0, a1: x1, c: z + o * .2, y0: .15, y1: 2.8 }), R2 = (z0, z1, x, o) => ({ ax: 'z', a0: z0, a1: z1, c: x + o * .2, y0: .15, y1: 2.8 });
    [R1(-1.6, 4.6, EZ0, -1), R1(3.4, 5.4, EZ1, 1), R2(-4.6, -1.8, EX1, 1), R2(4.6, 7.3, EX1, 1)].forEach(w => {
      const L = w.a1 - w.a0 + .1, mid = (w.a0 + w.a1) / 2, P = (a, y, c) => (w.ax === 'x' ? [a, y, c] : [c, y, a]);
      add('raff', w.ax === 'x' ? new T.BoxGeometry(L, .2, .2) : new T.BoxGeometry(.2, .2, L), dark, ...P(mid, w.y1 + .1, w.c));
      const slats = []; for (let i = 0; i < 22; i++) slats.push(add('raff', w.ax === 'x' ? new T.BoxGeometry(L - .06, .03, .1) : new T.BoxGeometry(.1, .03, L - .06), dark, ...P(mid, w.y1 - .02, w.c)));
      raffs.push({ slats, top: w.y1 - .02, h: w.y1 - w.y0 });
    }); }
  /* Feuchtesensoren: gelbe Punkte in Wand und Dach, sie pulsieren */
  const sens = [];
  { const m = new T.MeshBasicMaterial({ color: 0xFFB200 }), g = new T.SphereGeometry(.13, 16, 10);
    [[EX1 + .03, .35, -3], [EX1 + .03, .35, 3.5], [1.8, .35, EZ1 + .03], [-6, .35, EZ1 + .03], [-1, .35, EZ0 - .03], [EX0 - .03, .35, -1],
     [BX + HW + .03, YB + .5, -3], [BX + HW + .03, YB + .5, 4], [BX - HW - .03, YB + .5, 0], [BX + 2.2, YB + KW + 2.05, 1], [BX - 2.2, YB + KW + 2.05, -2]].forEach(p => { const s = add(p[1] > EH ? 'sens^' : 'sens', g, m, ...p); s.castShadow = false; sens.push(s); }); }
  /* Spengler: Rinnen an der Traufe, Fallrohre */
  { const met = std(0x5a5a56, { r: .35, m: .6 }), len = BZ1 - BZ0 + .4, ez = YB + KW - .3, cz = (BZ0 + BZ1) / 2;
    [-1, 1].forEach(sg => { const x = BX + sg * (HW + .42), r = add('gut^', new T.CylinderGeometry(.11, .11, len, 14, 1), met, x, ez, cz); r.rotation.x = Math.PI / 2;
      [BZ0 + .35, BZ1 - .35].forEach(z => add('gut^', new T.CylinderGeometry(.055, .055, ez - YB, 10), met, x, (ez + YB) / 2, z)); }); }
  /* Wärme: Fußbodenheizung in Schleifen, Wärmepumpe neben dem Haus */
  { const hot = std(0xE5702A, { r: .45 }), y = .03;
    const loopZ = (x0, x1, z0, z1, s) => { const p = []; let up = true; for (let x = x0; x <= x1 + 1e-6; x += s) { p.push([x, y, up ? z0 : z1], [x, y, up ? z1 : z0]); up = !up; } return p; };
    tube('heat', loopZ(-2.6, 5.3, -4.95, 2.05, .42), .03, hot); tube('heat', loopZ(1.4, 5.3, 2.8, 7.6, .42), .03, hot); tube('heat', loopZ(-9, -3.6, -4.95, -2.1, .42), .03, hot);
    const pm = std(0xE6E4DF, { r: .7 }); add('pump', new T.BoxGeometry(.75, 1.05, 1.1), pm, EX1 + .75, .525 + GY, .2);
    const fan = add('pump', new T.CylinderGeometry(.34, .34, .04, 28), std(0x2c2c2a, { r: .5 }), EX1 + 1.13, .55 + GY, .2); fan.rotation.z = Math.PI / 2; }
  /* Elektro: Leitungen an den Wänden, Dosen, Verteiler */
  { const cu = std(0xFFB200, { r: .5 }), y = .32, wz0 = EZ0 + .36, wx1 = EX1 - .36;
    tube('elec', [[-2.85, y, wz0], [wx1, y, wz0], [wx1, y, 2.2]], .022, cu); tube('elec', [[wx1, y, 2.7], [wx1, y, EZ1 - .36], [1.25, y, EZ1 - .36]], .022, cu);
    tube('elec', [[-3.4, y, wz0], [EX0 + .36, y, wz0], [EX0 + .36, y, -2]], .022, cu);
    [[-1.5, wz0], [1.8, wz0], [4.4, wz0], [wx1, -2.6], [wx1, 4.6], [3.2, EZ1 - .36], [-6.8, wz0]].forEach(([x, z]) => { tube('elec', [[x, y, z], [x, 1.05, z]], .02, cu); add('elec', new T.BoxGeometry(.12, .12, .12), std(0xffffff, { r: .4 }), x, 1.1, z); });
    add('elec', new T.BoxGeometry(.6, .8, .16), std(0xD9D7D1, { r: .5 }), -3.45, 1.45, 1.2); }
  /* Sanitär: kalt (blau) und warm (rot) ins Bad und zur Küche */
  { const kalt = std(0x3E79B0, { r: .4 }), warm = std(0xC4553B, { r: .4 });
    [[kalt, .14], [warm, .26]].forEach(([m, y]) => {
      tube('sani', [[-3.5, y, 1.2], [-3.5, y, -5.0], [-8.9, y, -5.0]], .035, m);
      [-8.2, -5.6, -4.5].forEach(x => tube('sani', [[x, y, -5.0], [x, .95, -5.0]], .03, m));
      tube('sani', [[-2.8, y, 2.15], [3.0, y, 2.15], [3.0, .85, 2.15]], .03, m); }); }
  /* Estrich */
  { const es = std(0xB9B5AD, { r: .95 }); add('estr', new T.BoxGeometry(-3.25 - EX0 - .3, .045, 1.5 - EZ0 - .3), es, (EX0 + .3 - 3.25) / 2, .0225, (EZ0 + .3 + 1.5) / 2);
    add('estr', new T.BoxGeometry(EX1 - .3 + 2.95, .045, EZ1 - EZ0 - .6), es, (EX1 - .3 - 2.95) / 2, .0225, (EZ0 + EZ1) / 2); }

  /* ---- Zustand ---- */
  const groups = Object.values(G);
  groups.forEach(st => { st.y0 = st.y0 ?? 0; st.g.position.y = st.y0; st.g.visible = false; });
  let glowUntil = 0, step = -2, pg = 0, rigK = 0, rigT = 0, lightK = 0, paintK = 0, raffK = 0, dragA = 0;
  const C = { az: 0, el: 0, tx: 0, ty: 0, tz: 0, d: 0, init: false };
  function setStep(n) {
    if (n === step) return; step = n;
    groups.forEach(st => { const s = st.s, on = n >= s.from && n <= (s.until ?? 99) ? 1 : 0; if (on && !st.t) st.wait = reduce ? 0 : (s.wait || 0); st.t = on; });
    const gl = new Set(GLOW[n] || []); groups.forEach(st => { st.gt = gl.has(st.key) || gl.has(base(st.key)) ? 1 : 0; });
    glowUntil = performance.now() + 2000 + (reduce ? 0 : 400);
    rigT = n >= INNEN[0] && n <= INNEN[1] ? 1 : 0;
    setFacade(n >= 3);
    kick();
  }

  /* ---- Bild ---- */
  let W = 1, H = 1, visible = false, raf = 0, last = 0, settle = 0;
  function size() {
    const r = host.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    R.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); kick();
  }
  const approach = (a, b, d) => (a < b ? Math.min(b, a + d) : Math.max(b, a - d));
  /* Punkte, die immer ganz im Bild sein sollen: Sockel (oben und unten), Dach (außen), im Innenausbau das Erdgeschoß */
  const PTS = { out: [], inn: [] };
  for (const x of [PL.x - PL.w / 2, PL.x + PL.w / 2]) for (const z of [PL.z - PL.d / 2, PL.z + PL.d / 2]) { PTS.out.push([x, GY, z], [x, GY - 1.2, z]); PTS.inn.push([x, GY, z]); }
  for (const x of [-9.6, 6.65]) for (const z of [BZ0 - .2, BZ1 + .2]) PTS.out.push([x, YB + .3, z]);
  for (const z of [BZ0 - .2, BZ1 + .2]) PTS.out.push([BX, 9.6, z]);
  for (const x of [EX0, EX1]) for (const z of [EZ0, EZ1]) PTS.inn.push([x, EH, z]);
  function fit(pts, az, el, t, m) {
    const ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    const back = [sa * ce, se, ca * ce], rt = [ca, 0, -sa], up = [-sa * se, ce, -ca * se];
    const tv = Math.tan(cam.fov * Math.PI / 360), th = tv * cam.aspect;
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    let d = 0;
    for (let it = 0; it < 2; it++) {
      d = 0; const q = [0, 0, 0];
      pts.forEach(P => { q[0] = P[0] - t[0]; q[1] = P[1] - t[1]; q[2] = P[2] - t[2];
        d = Math.max(d, dot(q, back) + Math.max(Math.abs(dot(q, rt)) / (m * th), Math.abs(dot(q, up)) / (m * tv))); });
      /* Mitte der Punkte im Bild, Ziel dorthin schieben */
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      pts.forEach(P => { q[0] = P[0] - t[0]; q[1] = P[1] - t[1]; q[2] = P[2] - t[2]; const z = d - dot(q, back), x = dot(q, rt) / (z * th), y = dot(q, up) / (z * tv);
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
      if (it) break;
      const cx = (x0 + x1) / 2 * th * d, cy = (y0 + y1) / 2 * tv * d;
      t = [t[0] + rt[0] * cx + up[0] * cy, t[1] + up[1] * cy, t[2] + rt[2] * cx + up[2] * cy];
    }
    return { d, t };
  }
  function camTarget() {
    const inn = rigK > .5 && step < UEBERGABE, end = step >= UEBERGABE;
    const az = (38 + Math.sin(pg * Math.PI) * 95) * Math.PI / 180 + dragA;
    const el = (inn ? 54 : end ? 19 : 25) * Math.PI / 180;
    const f = fit(inn ? PTS.inn : PTS.out, az, el, inn ? [-1.6, 0, 1] : [-1.6, 2.3, 1.3], W < 600 ? .94 : .9);
    return { az, el, tx: f.t[0], ty: f.t[1], tz: f.t[2], d: f.d };
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now;
    let busy = false;
    const sp = reduce ? 99 : 1;
    /* Gestell oben: im Innenausbau abheben und ausblenden, zur Übergabe wieder schließen */
    const r0 = rigK; rigK = approach(rigK, rigT, dt * .7 * sp); if (rigK !== r0) busy = true;
    rig.position.y = eio(rigK) * 9;
    const fadeHi = 1 - eio(cl((rigK - .2) / .6));
    rig.visible = fadeHi > .01;
    groups.forEach(st => {
      if (st.wait > 0 && st.t) { st.wait -= dt; busy = true; return; }
      const k0 = st.k; st.k = approach(st.k, st.t, dt * (st.t ? 1.35 : 2.2) * sp); if (st.k !== k0) busy = true;
      const gOn = st.gt && st.k > .7 && now < glowUntil ? 1 : 0;
      const g0 = st.glow; st.glow = approach(st.glow, gOn, dt * (gOn ? 2.2 : .8) * sp); if (st.glow !== g0) busy = true;
      const s = st.s, on = st.k > .002; st.g.visible = on;
      if (!on) return;
      const fh = st.key.endsWith('^') ? fadeHi : 1, fk = s.fade ? eio(st.k) : 1;
      if (s.fade || fh < .999 || st.fh !== fh) {
        st.fh = fh;
        st.list.forEach(m => { const b = m.userData.op0, o = b * fk * fh; m.opacity = o; m.transparent = o < .999; m.depthWrite = b >= .999 && o > .9; });
      }
      if (!s.fade) st.g.position.y = st.y0 + (1 - eo(st.k)) * s.d * (st.t ? 1 : .35);
      const gk = st.glow * (.8 + .2 * Math.sin(now / 160));
      st.list.forEach(m => {
        if (m.emissive) {
          if (m.userData.glass && lightK > .01 && gk < .01) { m.emissive.setHex(0xFFDDB0); m.emissiveIntensity = lightK * .85; }
          else { m.emissive.copy(GELB); m.emissiveIntensity = gk * .42; }
        }
        else if (m.color && m.userData.c0 && !m.userData.paint) m.color.copy(m.userData.c0).lerp(GELB, st.glow * .7);
      });
      if (st.glow > .002 || (gOn && st.glow < 1)) busy = true;
    });
    const l0 = lightK; lightK = approach(lightK, step >= UEBERGABE ? 1 : 0, dt * .8 * sp); if (lightK !== l0) busy = true;
    const p0 = paintK; paintK = approach(paintK, step >= 21 ? 1 : 0, dt * .9 * sp); if (paintK !== p0) busy = true;
    paintMats.forEach(m => { if (!m.userData.c0) return; m.color.copy(RAW).lerp(m.userData.c0, paintK); });
    const f0 = raffK; raffK = approach(raffK, step === 8 ? 1 : 0, dt * .45 * sp); if (raffK !== f0) busy = true;
    raffs.forEach(w => w.slats.forEach((s, i) => { s.position.y = w.top - (i + 1) / w.slats.length * w.h * eio(raffK) * .62 + .02; }));
    if (G.sens && G.sens.k > .01) { sens.forEach((s, i) => s.scale.setScalar(.8 + .45 * (.5 + .5 * Math.sin(now / 260 + i)))); busy = true; }
    /* Kamera weich zum Ziel */
    const tg = camTarget();
    if (!C.init) { Object.assign(C, tg, { init: true }); }
    const f = 1 - Math.exp(-dt * (reduce ? 60 : 3.2));
    let moved = 0; ['az', 'el', 'tx', 'ty', 'tz', 'd'].forEach(k => { const d = (tg[k] - C[k]) * f; C[k] += d; moved += Math.abs(d); });
    if (moved > 1e-4) busy = true;
    cam.position.set(C.tx + Math.sin(C.az) * Math.cos(C.el) * C.d, C.ty + Math.sin(C.el) * C.d, C.tz + Math.cos(C.az) * Math.cos(C.el) * C.d);
    cam.lookAt(C.tx, C.ty, C.tz);
    R.render(scene, cam);
    settle = busy ? 0 : settle + 1;
    if (visible && settle < 3) raf = requestAnimationFrame(frame); else last = 0;
  }
  const kick = () => { settle = 0; if (!raf && visible) raf = requestAnimationFrame(frame); };

  /* Ziehen dreht das Haus */
  let drag = null;
  host.addEventListener('pointerdown', e => { drag = { x: e.clientX, a: dragA, id: e.pointerId }; host.classList.add('is-drag'); });
  const mv = e => { if (!drag || e.pointerId !== drag.id) return; dragA = drag.a + (e.clientX - drag.x) / Math.max(240, W) * Math.PI * 1.2; kick(); };
  const up = () => { if (drag) { drag = null; host.classList.remove('is-drag'); } };
  addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);

  new ResizeObserver(size).observe(host);
  const io = new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); kick(); }, { rootMargin: '160px 0px' }); io.observe(host);
  size(); setStep(-1);
  return {
    step(n) { setStep(Math.max(-1, Math.min(UEBERGABE, n))); },
    stage() {},
    progress(p) { if (Math.abs(p - pg) < .0004) return; pg = p; kick(); },
    destroy() { io.disconnect(); cancelAnimationFrame(raf); removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); R.dispose(); }
  };
}
