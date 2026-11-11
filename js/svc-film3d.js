/* Runde 52 (Kunde): zurück zum Film des Entwurfs v2 (Claude Design „GRIFFNER Services v2“, site/svc3d.js und site/svc3d-scene.js).
   Kamera, Zeitachse, Drehteller, Explosion in Schichten, Grundstück, Straße, Scan, Zonen, Fundament im Schnitt, Terrasse, Zufahrt,
   Pool, Sauna, Garten, Schnee, Kundendienst mit Wagen, Schlüssel mit Faden und die vielen gleichen Häuser stehen wie im Entwurf.
   Neu ist nur das Haus: statt des vereinfachten Modells des Entwurfs das echte Concept Free (js/grundriss.js, data/grundriss-free.js,
   2G FRAME: Erdgeschoß in Stein mit Garage, Obergeschoß in Lärche, Satteldach mit Holzrahmen, Loggien in beiden Giebeln, echte Möbel),
   an derselben Stelle (das Modell im Entwurf war schon Free: 15,40 × 13,68 m). Die Punkte im Haus liegen auf den echten Räumen und
   Bauteilen (Karte in js/svc-film.js).
   Eingang: P von 0 bis 12 (Kapitel, js/svc-film.js). Welt in m: x nach Osten, z nach Süden (Straße), y nach oben. */
import * as T from 'three';
import { houseWorld } from './grundriss.js';
import { M as HM } from './grundriss-moebel.js';

const C = { weiss: 0xEAE8E3, sand: 0xCFC3B3, kalk: 0xCACACA, beton: 0xB9B7B2, anth: 0x444442, ground: 0x242423, gelb: 0xFFB200, salbei: 0x8B907C, glas: 0x0b0c0d, schwarz: 0x000000 };
const GAP = 11.5;
/* Free im System des Entwurfs: Mitte des Erdgeschoßes bei HX/HZ. Maße des Entwurfs, aus Free gerechnet */
const HX = -1.8, HZ = 1.32;
const EX0 = -9.5, EX1 = 5.9, EZ0 = -5.52, EZ1 = 8.16, EH = 2.9;
const BX = .9, HW = 4, BZ0 = -7.52, BZ1 = 9.66, YB = 3.24, KW = 2.75, RP = 3.4, CZ0 = BZ0 + 2, CZ1 = BZ1 - 1.5;
/* Ebenen der Explosion zu den Marken des Überblicks */
const LAYER_E = { 'lay-plan': [0, 1], 'lay-fund': 2, 'lay-huelle': 3, 'lay-innen': 4, 'lay-aussen': 5, 'lay-key': 6 };
/* Punkte im Haus: Blick [Azimut, Höhe, Abstand, Ziel x, y, z] und Effekte (Dach hebt sich, Wand im Schnitt, Maße) */
const FOC = {
  dach: { cam: [62, 24, 52, -1, 6.5, 4.5], fx: { roof: 1 } },
  wand: { cam: [28, 13, 34, 1.6, 1.6, 8.5], fx: { wall: 1 } },
  fenster: { cam: [12, 12, 38, -.4, 6.2, 8.2] },
  fassade: { cam: [84, 10, 34, 4.9, 4.6, -1.6] },
  hoehe: { cam: [30, 12, 42, 3, 1.6, 8.15], fx: { dims: 1 } },
  open: { cam: [60, 62, 40, .8, .5, -1.2] },
  parkett: { cam: [50, 46, 22, -1.0, .3, -3.0] },
  /* Runde 53: Fliesen im Duschraum neben der Sauna (Erdgeschoß), das Bad ist das echte Bad bei den Eltern im Obergeschoß:
     beim Öffnen senkt sich das Obergeschoß wieder auf das Haus, das Dach bleibt weg (Ziele rechnet buildScene aus dem Plan) */
  fliesen: { cam: [35, 60, 14, -6.4, .3, -2.4] },
  bad: { cam: [28, 58, 13, 2.9, 3.4, -3.3], fx: { og: 1 } },
  tuer: { cam: [30, 42, 14, 1.41, 1.0, 4.81] }
};
/* Fokus, bei dem die Wände auf 1 m gehen, damit man in die Räume sieht */
const LOW = ['open', 'parkett', 'fliesen', 'bad', 'tuer'];

/* ---------- Szene (Entwurf site/svc3d-scene.js, das Haus aus js/grundriss.js) ---------- */
function buildScene(H) {
  const grp = (parent, name) => { const g = new T.Group(); g.name = name; g.userData.mats = []; if (parent) parent.add(g); return g; };
  const M = (g, color, o = {}) => { const m = new T.MeshStandardMaterial({ color, roughness: o.r ?? .9, metalness: o.m ?? 0, emissive: o.em ?? 0, emissiveIntensity: o.ei ?? 0, side: o.side ?? T.FrontSide, map: o.map || null }); m.userData.base = o.op ?? 1; if (o.glass || (o.m >= .85 && o.r <= .05)) m.userData.glass = 1; g.userData.mats.push(m); return m; };
  const LM = (g, color, op = 1, dashed) => { const m = dashed ? new T.LineDashedMaterial({ color, dashSize: .55, gapSize: .4, transparent: true, opacity: op }) : new T.LineBasicMaterial({ color, transparent: true, opacity: op }); m.userData.base = op; g.userData.mats.push(m); return m; };
  const BM = (g, color, op = 1) => { const m = new T.MeshBasicMaterial({ color, transparent: true, opacity: op, side: T.DoubleSide, depthWrite: false }); m.userData.base = op; g.userData.mats.push(m); return m; };
  const box = (g, x0, y0, z0, x1, y1, z1, mat, em) => {
    const geo = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m = new T.Mesh(geo, mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true;
    if (em) m.add(new T.LineSegments(new T.EdgesGeometry(geo), em));
    g.add(m); return m;
  };
  const wire = (g, x0, y0, z0, x1, y1, z1, mat) => { const geo = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), l = new T.LineSegments(new T.EdgesGeometry(geo), mat); l.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); if (mat.isLineDashedMaterial) l.computeLineDistances(); g.add(l); return l; };
  const segs = (g, arr, mat) => { const p = []; arr.forEach(s => p.push(new T.Vector3(s[0], s[1], s[2]), new T.Vector3(s[3], s[4], s[5]))); const l = new T.LineSegments(new T.BufferGeometry().setFromPoints(p), mat); if (mat.isLineDashedMaterial) l.computeLineDistances(); g.add(l); return l; };
  const loop = (g, pts, mat) => { const p = pts.map(v => new T.Vector3(v[0], v[1], v[2])); p.push(p[0].clone()); const l = new T.Line(new T.BufferGeometry().setFromPoints(p), mat); if (mat.isLineDashedMaterial) l.computeLineDistances(); g.add(l); return l; };
  const A = {};
  const anchor = (g, id, x, y, z) => { const o = new T.Object3D(); o.position.set(x, y, z); g.add(o); A[id] = o; return o; };
  /* Punkt im Plan von Free (pt, Geschoß fi) zur Welt des Films: [x, z] */
  const TW = (x, y, fi = 0) => { const [a, b] = H.toWorld(x, y, fi); return [HX + a, HZ + b]; };

  const pivot = new T.Group(), root = new T.Group();
  pivot.add(root);
  const units = [];
  const unit = (id, e, landP, delay) => { const g = grp(root, id); g.userData.e = e; g.userData.landP = landP; g.userData.delay = delay; g.userData.base = new T.Vector3(); units.push(g); return g; };

  /* Grundstück */
  const grund = unit('grund', 0, 4, 0);
  const gm = M(grund, C.ground, { r: 1 }), ge = LM(grund, C.kalk, .45);
  box(grund, -16, -1.4, -12, 16, 0, -1, gm, ge);
  const front = grp(grund, 'front');
  const fm = M(front, C.ground, { r: 1 }), fe = LM(front, C.kalk, .45);
  box(front, -16, -1.4, -1, 16, 0, 12, fm, fe);
  const street = M(grund, 0x141414, { r: 1 });
  box(grund, -26, -1.4, 13, 26, -.08, 18.5, street);
  segs(grund, [[-26, -.07, 15.75, 26, -.07, 15.75]], LM(grund, C.kalk, .35, true));
  const pm0 = M(grund, C.kalk);
  [[-16, -12], [16, -12], [16, 12], [-16, 12]].forEach(([x, z]) => box(grund, x - .08, 0, z - .08, x + .08, 1, z + .08, pm0));
  anchor(grund, 'lay-grund', 17, 0, 6);

  /* Projektcheck: Vermessung, Scan */
  const check = grp(grund, 'check');
  const scanM = BM(check, 0xFFFFFF, .1);
  const scan = new T.Mesh(new T.PlaneGeometry(24.5, 7), scanM); scan.rotation.y = Math.PI / 2; scan.position.set(-16, 3.5, 0); check.add(scan);
  const scanEdge = segs(check, [[0, 0, -12.25, 0, 0, 12.25], [0, 7, -12.25, 0, 7, 12.25]], LM(check, 0xFFFFFF, .7)); scanEdge.position.set(-16, 0, 0);
  const ptsGeo = new T.BoxGeometry(.2, .2, .2), ptsMat = BM(check, 0xFFFFFF, 1);
  const pts = []; for (let x = -14; x <= 14; x += 2) for (let z = -10; z <= 10; z += 2) pts.push([x, z]);
  const ptsMesh = new T.InstancedMesh(ptsGeo, ptsMat, pts.length); check.add(ptsMesh);
  const dimM = LM(check, 0xFFFFFF, .9);
  segs(check, [[-16, .02, 13, 16, .02, 13], [-16, .02, 12.5, -16, .02, 13.5], [16, .02, 12.5, 16, .02, 13.5], [17, .02, -12, 17, .02, 12], [16.5, .02, -12, 17.5, .02, -12], [16.5, .02, 12, 17.5, .02, 12]], dimM);
  loop(check, [[-13, .03, -10.4], [13, .03, -10.4], [13, .03, 10.4], [-13, .03, 10.4]], LM(check, 0xFFFFFF, .8, true));
  segs(check, [[-12.6, 0, 3, -12.6, -3.5, 3]], LM(check, 0xFFFFFF, .9, true));
  anchor(check, 'dimx', 0, .1, 14.2); anchor(check, 'dimz', 18.2, .1, 0); anchor(check, 'bau', -13, .1, -11); anchor(check, 'boden', -12.6, -3.8, 3); anchor(check, 'flaeche', 0, .1, 0);

  /* Projektplan: Sofort (Haus und Zufahrt), Später (Terrasse und Garten, Wahl des Kunden in Runde 50b), Irgendwann (Pool oder Sauna) */
  const plan = unit('plan', 1, 5.1, .06);
  const zones = [0, 1, 2].map(i => grp(plan, 'zone' + i));
  box(zones[0], EX0, .02, EZ0, EX1, .1, EZ1, M(zones[0], C.gelb, { r: .8 })); box(zones[0], -9.6, .02, EZ1, -1.1, .08, 12.4, M(zones[0], C.gelb, { r: .8 }));
  const zw0 = LM(zones[0], C.kalk, .55); wire(zones[0], EX0, .1, EZ0, EX1, EH, EZ1, zw0); wire(zones[0], BX - HW, YB, BZ0, BX + HW, YB + KW + RP, BZ1, zw0);
  { const zm = M(zones[1], C.kalk, { op: .35 }), ze = LM(zones[1], 0xFFFFFF, .9);
    box(zones[1], EX0 - 1.6, .02, EZ0 - 4, EX1, .07, EZ0, zm, ze); box(zones[1], EX0 - 1.6, .02, EZ0, EX0, .07, 1.6, zm, ze);
    box(zones[1], -15.6, .02, -11.7, 15.6, .07, -11, zm, ze); }
  /* Runde 53: Irgendwann = Pool im Garten oder die Sauna im Haus (Raum im Erdgeschoß, Nordwest) */
  box(zones[2], 8.1, .02, -7.9, 14.9, .07, -1.1, M(zones[2], C.kalk, { op: .2 }), LM(zones[2], 0xFFFFFF, .9));
  wire(zones[2], 8.5, -1.3, -7.5, 14.5, .07, -1.5, LM(zones[2], C.kalk, .45, true));
  { const a = TW(382.4, 264.9), b = TW(552.5, 358.4); box(zones[2], a[0], .1, a[1], b[0], .16, b[1], M(zones[2], C.kalk, { op: .35 }), LM(zones[2], 0xFFFFFF, .9)); wire(zones[2], a[0], .16, a[1], b[0], EH - .1, b[1], LM(zones[2], 0xFFFFFF, .7, true)); }
  anchor(plan, 'z0', -1.1, .2, 12.4); anchor(plan, 'z1', EX0 - 1.6, .3, EZ0 - 4); anchor(plan, 'z2', 14.9, .3, -.5);
  anchor(plan, 'lay-plan', 17, -1.5, 6);

  /* Fundament */
  const fund = unit('fund', 2, 6.4, .1);
  const bm = M(fund, C.beton, { r: .95 }), be = LM(fund, C.schwarz, .35);
  box(fund, EX0 - .3, -.8, EZ0 - .3, EX1 + .3, .02, EZ1 + .3, bm, be);
  [[EX0 - .3, EZ0 - .3, EX1 + .3, EZ0 + .2], [EX0 - .3, EZ1 - .2, EX1 + .3, EZ1 + .3], [EX0 - .3, EZ0 + .2, EX0 + .2, EZ1 - .2], [EX1 - .2, EZ0 + .2, EX1 + .3, EZ1 - .2]].forEach(([a, b, c, d]) => box(fund, a, -1.45, b, c, -.8, d, bm, be));
  anchor(fund, 'slab', EX1 + .3, -.4, EZ1 + .3); anchor(fund, 'lay-fund', 17, 1.2, 6);

  /* Bausystem: das echte Haus. Erdgeschoß (Wände, Fassade, Fenster), Decke, Obergeschoß, Dach je in einer eigenen Gruppe, damit
     sie sich wie im Entwurf voneinander lösen (Exterior, Interior) */
  const EG = H.FL[0], OG = H.FL[1], HT = H.HT;
  const hx = (parent, y = 0) => { const g = new T.Group(); g.position.set(HX, y, HZ); parent.add(g); return g; };
  const hul = unit('huelle', 3, 7.1, 0);
  const gvol = grp(hul, 'gvol'), deck = grp(hul, 'deck'), up = grp(hul, 'up'), roof = grp(hul, 'roof'), roofIns = grp(hul, 'roofIns');
  const inn = unit('innen', 4, 8.15, .14);
  /* Runde 53: Böden 2,5 cm höher, sonst liegt das Bodenbild (Eiche, Fliesen) unter der Oberkante des Fundaments und man sieht nur Beton */
  const ih = hx(inn, .025);
  [EG.plane, ...EG.furn.map(o => o.m), ...EG.steps.map(s => s.m)].forEach(o => o && ih.add(o));
  EG.base.forEach(m => { m.visible = false; });
  hx(gvol).add(EG.g);
  { const dk = hx(deck); H.slabs.forEach(s => dk.add(s.m)); }
  hx(up).add(OG.g);
  { const rb = hx(roof, HT.eg + HT.slab); H.roofs.filter(r => r.g.parent === OG.g).forEach(r => rb.add(r.g)); }
  /* eigene Materialien je Ebene (Ein- und Ausblenden wie im Entwurf), mit der Umgebung der Concepts */
  /* Runde 53: Fassaden und Dach legen ihr Bild in Weltkoordinaten (js/grundriss.js, für stehende Häuser). Hier dreht und bewegt sich
     das Haus, das Bild wanderte über die Wände. Jede Gruppe gibt ihren Materialien uFix mit (Kehrwert ihrer Lage), so bleibt das Bild am Haus. */
  const own = (u, roots, env, ref) => { const map = new Map(); const cl = m => { if (!m) return m; let c = map.get(m); if (!c) { c = m.clone();
      if (ref && Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile')) {
        const ob = m.onBeforeCompile, key = (m.customProgramCacheKey ? m.customProgramCacheKey() : '') + '|fix', uFix = { value: new T.Matrix4() };
        (ref.userData.fix = ref.userData.fix || []).push(uFix);
        c.onBeforeCompile = (sh, r) => { ob.call(c, sh, r); sh.uniforms.uFix = uFix; sh.vertexShader = 'uniform mat4 uFix;\n' + sh.vertexShader.replace('vec4 gw = modelMatrix * vec4( transformed, 1.0 );', 'vec4 gw = uFix * modelMatrix * vec4( transformed, 1.0 );'); };
        c.customProgramCacheKey = () => key;
      } else { c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; }
      if (c.isMeshStandardMaterial && !c.envMap) c.envMap = env; c.userData = { base: m.opacity, orig: m }; map.set(m, c); u.userData.mats.push(c); } return c; };
    roots.forEach(r => r.traverse(o => { if (o.material) o.material = Array.isArray(o.material) ? o.material.map(cl) : cl(o.material); })); return map; };
  const env = H.scene.environment;
  const mHul = [gvol, deck, up, roof].map(g => own(hul, [g], env, g)); own(inn, [ih], env);
  const glasM = mHul.flatMap(mp => [...mp.entries()].filter(([o]) => o === HM.glass).map(([, c]) => c));
  glasM.forEach(m => { m.emissive = new T.Color(0xFFE3BF); m.emissiveIntensity = 0; });
  const larchM = [...new Set(OG.skins.map(s => s.m.material).flat().concat(OG.base.map(m => m.material).flat()))].filter(m => m && m.map);
  const roofM = []; roof.traverse(o => { if (o.isMesh && Array.isArray(o.material) && o.material[1]) roofM.push(o.material[1]); });
  [...larchM, ...roofM].forEach(m => { m.userData.c0 = m.color.clone(); });
  { const ang = Math.atan2(RP, HW), len = BZ1 - BZ0 + .4, cz = (BZ0 + BZ1) / 2, im = M(roofIns, 0xD8D1C3, { r: 1 }), ie = LM(roofIns, C.schwarz, .3);
    [1, -1].forEach(sg => {
      const L2 = HW / Math.cos(ang) - .4, g2 = new T.BoxGeometry(L2, .34, len - 4.6), m2 = new T.Mesh(g2, im); m2.rotation.z = -sg * ang;
      m2.position.set(BX + sg * HW / 2, YB + KW + RP - HW / 2 * Math.tan(ang) - .25, cz); m2.add(new T.LineSegments(new T.EdgesGeometry(g2), ie)); roofIns.add(m2);
    }); }
  anchor(roof, 'dach', BX, YB + KW + RP + .3, BZ1 + .2); anchor(up, 'fassade', BX + HW + .05, YB + 1.6, -2.4); anchor(roofIns, 'daemm', BX + HW * .6, YB + KW + 1.2, CZ0 + 1);
  anchor(roof, 'fenster', -.8, YB + KW + .9, 8.02);
  /* Raumhöhe: 2,72 m im Licht, darüber der Geist der üblichen 2,50 m */
  const RY0 = .12, RY1 = RY0 + 2.72;
  const dim = grp(hul, 'dim');
  segs(dim, [[EX1 + .45, RY0, EZ1 + .3, EX1 + .45, RY1, EZ1 + .3], [EX1 + .15, RY0, EZ1 + .3, EX1 + .75, RY0, EZ1 + .3], [EX1 + .15, RY1, EZ1 + .3, EX1 + .75, RY1, EZ1 + .3]], LM(dim, 0xFFFFFF, 1));
  anchor(deck, 'decke', EX1 + .1, 3.6, EZ1 + .1); anchor(dim, 'hoehe', EX1 + .6, .2, EZ1 + .3);

  /* Hausplanung: das Haus als Zeichnung des Architekturteams, die Wände aus dem echten Grundriss */
  const zeich = grp(root, 'zeich'), zl = LM(zeich, 0xFFFFFF, .95), zf = LM(zeich, 0xFFFFFF, .5), zy = LM(zeich, C.gelb, 1);
  loop(zeich, [[EX0, .04, EZ0], [EX1, .04, EZ0], [EX1, .04, EZ1], [EX0, .04, EZ1]], zl);
  /* Wände als volle Flächen wie auf dem Plan (Öffnungen für Fenster und Türen bleiben frei) */
  { const wm = BM(zeich, 0xFFFFFF, .92), wp = hx(zeich, .025);
    EG.walls.forEach(w => { const m = new T.Mesh(w.m.geometry, wm); m.scale.y = .02; wp.add(m); }); }
  segs(zeich, [[EX0, .04, EZ0 - 1.3, EX1, .04, EZ0 - 1.3], [EX0, .04, EZ0 - 1.6, EX0, .04, EZ0 - 1], [EX1, .04, EZ0 - 1.6, EX1, .04, EZ0 - 1], [BX - HW, .04, EZ0 - 1.5, BX - HW, .04, EZ0 - 1.1], [EX1 + 1.3, .04, EZ0, EX1 + 1.3, .04, EZ1], [EX1 + 1, .04, EZ0, EX1 + 1.6, .04, EZ0], [EX1 + 1, .04, EZ1, EX1 + 1.6, .04, EZ1], [EX1 + 1.1, .04, 2.4, EX1 + 1.5, .04, 2.4]], zl);
  segs(zeich, [[BX, -.2, BZ0 - 1.4, BX, -.2, BZ1 + 1.4]], zy);
  const pent = (w, b0, k, apex) => { const sh = new T.Shape(); sh.moveTo(-w, b0); sh.lineTo(w, b0); sh.lineTo(w, k); sh.lineTo(0, apex); sh.lineTo(-w, k); sh.closePath(); return sh; };
  const ext = (sh, len) => new T.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  const hs = [3.6, .4, KW - .05, KW + RP - .55];
  const zUp = grp(zeich, 'zUp');
  { const g1 = new T.BoxGeometry(EX1 - EX0, EH, EZ1 - EZ0); g1.translate((EX0 + EX1) / 2, EH / 2, (EZ0 + EZ1) / 2); zUp.add(new T.LineSegments(new T.EdgesGeometry(g1), zl));
    const g2 = ext(pent(HW, 0, KW, KW + RP), BZ1 - BZ0); g2.translate(BX, YB, BZ0); zUp.add(new T.LineSegments(new T.EdgesGeometry(g2), zl));
    const g3 = ext(pent(hs[0], hs[1], hs[2], hs[3]), .01); [CZ0, CZ1].forEach(z => { const l = new T.LineSegments(new T.EdgesGeometry(g3), zf); l.position.set(BX, YB, z); zUp.add(l); });
    const sp = []; for (let z = BZ0 + 1.2; z < BZ1; z += 1.2) sp.push([BX - HW, YB + KW, z, BX, YB + KW + RP, z], [BX, YB + KW + RP, z, BX + HW, YB + KW, z]); segs(zUp, sp, zf); }
  anchor(zUp, 'arch', BX, YB + KW + RP + .4, BZ1); anchor(zeich, 'einreich', EX1 + 1.3, .1, (EZ0 + EZ1) / 2); anchor(zUp, 'werk', EX1, EH, EZ1); anchor(zUp, 'statik', BX + HW, YB + KW, BZ0 + 2);

  /* Wandschnitt, Feuchte, übliche Raumhöhe */
  const WI = EZ1 - .3, wallx = grp(hul, 'wallx'), wxL = [];
  [[C.weiss, .06], [C.sand, .16], [0xD8D1C3, .46], [0x887254, .12], [0x2a2a29, .08], [0xB49E7F, .07]].forEach(([col, th], i) => {
    const g = new T.Group(); wallx.add(g); const m = M(wallx, col), e = LM(wallx, C.schwarz, .3), sd = M(wallx, C.sand);
    box(g, .4, .05, 0, 3, EH - .05, th, m, e);
    if (i === 1) [.5, 1.5, 2.5].forEach(y => box(g, .4, y, -.01, 3, y + .1, th + .01, sd));
    if (i === 2) [.6, 1.5, 2.4].forEach(x => box(g, x, .05, -.01, x + .12, EH - .05, th + .01, sd));
    if (i === 4) [.5, 1.5, 2.45].forEach(x => box(g, x, .05, 0, x + .08, EH - .05, th, sd));
    if (i === 5) for (let x = .43; x < 2.95; x += .26) box(g, x, .05, 0, x + .2, EH - .05, th + .02, M(wallx, 0xB49E7F));
    g.userData.th = th; g.position.z = WI; wxL.push(g);
  });
  const NP = 280, mp = new Float32Array(NP * 3), mph = [];
  for (let i = 0; i < NP; i++) mph.push([.5 + Math.random() * 2.4, .25 + Math.random() * 2.5, Math.random() * Math.PI * 2, .55 + Math.random() * .7]);
  const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(mp, 3));
  const moist = new T.Points(mg, new T.PointsMaterial({ color: 0xFFFFFF, size: .13, transparent: true, opacity: 0, depthWrite: false, depthTest: false })); moist.renderOrder = 5; moist.frustumCulled = false; hul.add(moist);
  const ghostH = grp(hul, 'ghostH');
  { const pl = new T.Mesh(new T.PlaneGeometry(EX1 - EX0, EZ1 - EZ0), BM(ghostH, C.kalk, .16)); pl.rotation.x = -Math.PI / 2; pl.position.set((EX0 + EX1) / 2, 0, (EZ0 + EZ1) / 2); ghostH.add(pl);
    loop(ghostH, [[EX0, 0, EZ0], [EX1, 0, EZ0], [EX1, 0, EZ1], [EX0, 0, EZ1]], LM(ghostH, 0xFFFFFF, .9, true)); }
  anchor(wxL[5], 'wallx', 3, EH - .05, .07); A.wand = A.wallx; anchor(wxL[2], 'moist', 3, .35, .46); anchor(ghostH, 'ueblich', EX1, 0, EZ0);
  anchor(hul, 'lay-huelle', 17, 3.2, 6);

  /* Innen: Böden, Möbel, Türen und Treppe von Free (oben in ih), Licht am Abend */
  const lamps = [[1.6, 2.4, -2.6], [-6.8, 2.4, -3.6]].map(p => { const l = new T.PointLight(0xFFE2BC, 0, 18, 1.2); l.position.set(...p); inn.add(l); return l; });
  /* Parkett im Wohnen, Open Space am Essplatz, Innentür zum Büro. Runde 53: Fliesen im Duschraum neben der Sauna (großformatig, hell),
     das Bad liegt oben: der Punkt steht an der Treppe („Im Obergeschoß“), beim Öffnen kommt das Obergeschoß herunter */
  const fl0 = TW(482, 338), bt = TW(616, 461), bad0 = TW(764, 286, 1);
  anchor(inn, 'parkett', -1.0, .1, -3.0); anchor(inn, 'open', 3.45, 1.6, -1.55); anchor(inn, 'fliesen', fl0[0], .1, fl0[1]); anchor(inn, 'bad', bt[0], 1.9, bt[1]); anchor(inn, 'tuer', 1.41, 2.1, 4.81);
  anchor(up, 'bad-og', bad0[0], HT.eg + HT.slab + 1.05, bad0[1]);
  FOC.fliesen.cam.splice(3, 3, fl0[0], .3, fl0[1]); FOC.bad.cam.splice(3, 3, bad0[0], HT.eg + HT.slab + .25, bad0[1]);
  anchor(inn, 'lay-innen', 17, 3, 6);

  /* Rund ums Haus */
  const au = [];
  const ter = unit('terrasse', 5, 9.0, .18); au.push(ter);
  { const tm = M(ter, C.sand), tl = LM(ter, C.schwarz, .18); box(ter, EX0 - 1.6, 0, EZ0 - 4, EX1, .18, EZ0, tm, LM(ter, C.schwarz, .25)); box(ter, EX0 - 1.6, 0, EZ0, EX0, .18, 1.6, tm, LM(ter, C.schwarz, .25));
    const sg = []; for (let x = EX0 - 1.4; x < EX1; x += .5) sg.push([x, .185, EZ0 - 4, x, .185, EZ0]); segs(ter, sg, tl); }
  const zuf = unit('carport', 5, 9.12, .2); au.push(zuf);
  { const pv = M(zuf, 0x55534f, { r: .95 }), pe = LM(zuf, C.schwarz, .25); box(zuf, -9.6, 0, EZ1, -3, .06, 12, pv, pe); box(zuf, -2.9, 0, EZ1, -1.1, .06, 12, pv, pe);
    [0, 1, 2].forEach(i => box(zuf, -3.1 + i * .02, .06 + i * .14, EZ1 + 1.6 - i * .45, -.8, .2 + i * .14, EZ1 + 2.05 - i * .45, M(zuf, 0x8d8a85))); }
  const pool = unit('pool', 5, 9.24, .22); au.push(pool);
  { const rm = M(pool, C.kalk), re = LM(pool, C.schwarz, .25); box(pool, 8.1, 0, -7.9, 14.9, .16, -7.5, rm, re); box(pool, 8.1, 0, -1.5, 14.9, .16, -1.1, rm, re); box(pool, 8.1, 0, -7.5, 8.5, .16, -1.5, rm, re); box(pool, 14.5, 0, -7.5, 14.9, .16, -1.5, rm, re); box(pool, 8.5, 0, -7.5, 14.5, .1, -1.5, M(pool, C.salbei, { r: .12, m: .2 })); }
  /* Runde 53: keine Sauna im Garten. Free hat die Sauna im Haus (Erdgeschoß, Nordwest, mit Duschen und Blick in den Garten),
     die Marke zeigt dorthin */
  const sau = unit('sauna', 5, 9.36, .24); au.push(sau);
  const sr = [TW(382.4, 264.9), TW(552.5, 358.4)];
  const gar = unit('garten', 5, 9.5, .26); au.push(gar);
  { const tm = M(gar, C.weiss), crm = M(gar, C.weiss), hm = M(gar, C.salbei); gar.userData.crown = crm; const trunk = new T.CylinderGeometry(.1, .12, 2.4, 8), crown = new T.SphereGeometry(1.45, 24, 16);
    [[-13.6, -10.2], [14, -10.4], [14.4, 10], [-13.8, 10.2], [7.4, 10.8], [-14, -3.6], [14.6, 2], [3.4, -10.8]].forEach(([x, z], i) => { const sc = .8 + (i % 3) * .16; const tr = new T.Mesh(trunk, tm); tr.position.set(x, 1.2 * sc, z); tr.scale.setScalar(sc); tr.castShadow = true; const cr = new T.Mesh(crown, crm); cr.position.set(x, 3.4 * sc, z); cr.scale.setScalar(sc); cr.castShadow = cr.receiveShadow = true; gar.add(tr, cr); });
    box(gar, -15.6, 0, -11.7, 15.6, 1.1, -11, hm); }
  anchor(ter, 'terrasse', 2, .3, EZ0 - 3.6); anchor(zuf, 'carport', -6.3, .2, 10.6); anchor(pool, 'pool', 11.5, .2, -4.5); anchor(sau, 'sauna', (sr[0][0] + sr[1][0]) / 2, EH + .1, (sr[0][1] + sr[1][1]) / 2); anchor(gar, 'garten', 14, 4.4, -10.4);
  anchor(ter, 'lay-aussen', 17, 3.2, 6);

  /* Besser leben: Jahreszeiten, Kundendienst */
  const life = grp(root, 'life');
  { const sn = new T.Mesh(new T.PlaneGeometry(32, 24), BM(life, 0xF4F4F2, .9)); sn.rotation.x = -Math.PI / 2; sn.position.y = .03; life.add(sn); life.userData.snowPlane = sn;
    const NS = 900, sp = new Float32Array(NS * 3), sd = []; for (let i = 0; i < NS; i++) sd.push([-16 + Math.random() * 32, Math.random() * 22, -12 + Math.random() * 24, .6 + Math.random() * .8]);
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
    const flakes = new T.Points(sg, new T.PointsMaterial({ color: 0xFFFFFF, size: .12, transparent: true, opacity: 0, depthWrite: false })); flakes.frustumCulled = false; life.add(flakes); life.userData.flakes = flakes; life.userData.sd = sd;
    /* GRIFFNER Transporter mit Handwerkern */
    const van = new T.Group(); life.add(van); life.userData.van = van;
    const vb = new T.MeshStandardMaterial({ color: 0x111111, roughness: .35, metalness: .4 }), vg = new T.MeshStandardMaterial({ color: 0x2a3138, roughness: .05, metalness: .9 }), vy = new T.MeshStandardMaterial({ color: C.gelb, roughness: .6 }), vt = new T.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .9 }), vr = new T.MeshStandardMaterial({ color: 0x9a9a9a, roughness: .4, metalness: .6 });
    const vbox = (m, x0, y0, z0, x1, y1, z1) => { const o = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); o.castShadow = o.receiveShadow = true; van.add(o); return o; };
    vbox(vb, -1.05, .45, -2.9, 1.05, 2.65, 1.4); vbox(vb, -1.05, .45, 1.4, 1.05, 1.55, 2.6);
    { const hood = new T.Mesh(new T.BoxGeometry(2.1, .16, 1.6), vb); hood.position.set(0, 2.1, 1.85); hood.rotation.x = .62; hood.castShadow = true; van.add(hood); const ws = new T.Mesh(new T.BoxGeometry(1.9, .05, 1.45), vg); ws.position.set(0, 2.12, 1.93); ws.rotation.x = .62; van.add(ws); }
    vbox(vg, -1.07, 1.65, .5, -1.04, 2.3, 1.45); vbox(vg, 1.04, 1.65, .5, 1.07, 2.3, 1.45);
    vbox(vy, 1.06, 1.15, -2.3, 1.08, 2.15, -1.05); vbox(vy, -1.08, 1.15, -2.3, -1.06, 2.15, -1.05);
    vbox(vr, -1.08, .45, -2.95, 1.08, .62, 2.65); vbox(vy, -.9, .7, 2.6, -.6, .85, 2.64); vbox(vy, .6, .7, 2.6, .9, .85, 2.64);
    const wheels = []; [[-1.02, -1.9], [1.02, -1.9], [-1.02, 1.75], [1.02, 1.75]].forEach(([x, z]) => { const w = new T.Mesh(new T.CylinderGeometry(.42, .42, .3, 20), vt); w.rotation.z = Math.PI / 2; w.position.set(x, .42, z); w.castShadow = true; van.add(w); wheels.push(w); });
    life.userData.wheels = wheels;
    const sideDoor = new T.Mesh(new T.BoxGeometry(.05, 1.9, 1.3), vb); sideDoor.position.set(-1.08, 1.5, .6); van.add(sideDoor); life.userData.sideDoor = sideDoor;
    const crew = []; const wm2 = new T.MeshStandardMaterial({ color: 0xEAE8E3, roughness: .85 }), wd = new T.MeshStandardMaterial({ color: 0x2b2a29, roughness: .9 });
    [0, 1].forEach(i => { const g = new T.Group(); const legs = new T.Mesh(new T.CylinderGeometry(.17, .15, .85, 10), wd); legs.position.y = .43; const body = new T.Mesh(new T.CylinderGeometry(.23, .2, .75, 12), wd); body.position.y = 1.22; const head = new T.Mesh(new T.SphereGeometry(.17, 16, 12), wm2); head.position.y = 1.78; const cap = new T.Mesh(new T.CylinderGeometry(.18, .18, .07, 14), new T.MeshStandardMaterial({ color: C.gelb, roughness: .6 })); cap.position.y = 1.9; [legs, body, head, cap].forEach(m => { m.castShadow = true; g.add(m); }); if (i === 1) { const tb = new T.Mesh(new T.BoxGeometry(.5, .28, .22), new T.MeshStandardMaterial({ color: 0x55534f, roughness: .7 })); tb.position.set(.34, .75, 0); tb.castShadow = true; g.add(tb); } life.add(g); crew.push(g); });
    life.userData.crew = crew;
    const vanAnchor = new T.Object3D(); vanAnchor.position.set(0, 4.6, -1); van.add(vanAnchor); A.van = vanAnchor; }

  /* Projektmanager */
  const pm = grp(root, 'pm');
  const ym = M(pm, C.gelb, { r: .5, em: C.gelb, ei: .35 });
  const spineGeo = new T.CylinderGeometry(.09, .09, 1, 8); spineGeo.translate(0, .5, 0);
  const spine = new T.Mesh(spineGeo, ym); spine.position.set(BX, 0, 1.1); pm.add(spine);
  /* Runde 53: der Faden geht außen ums Haus (Kunde: „die Linie schneidet das Haus“): von der Straße über den Rasen neben dem Weg,
     an der Ostseite zwischen Haus und Pool, im Norden zwischen Terrasse und Hecke, an der Westseite zurück und über das Dach des
     Erdgeschoßes hinauf zum Schlüssel. Abstand zu Wänden, Dach, Bäumen, Pool, Wagen und Handwerkern gegen die Szene geprüft. */
  const curve = new T.CatmullRomCurve3([[1, .25, 18.5], [1, .3, 13.2], [2.2, .7, 10.6], [5.2, 1, 10.2], [7.3, 1.1, 7.6], [7.4, 1.2, 1], [7, 1.3, -4], [5, 1.5, -9.9], [-4, 1.5, -10.05], [-11, 1.4, -10], [-12.4, 1.4, -4], [-12.2, 1.8, 3.5], [-10.6, 4.5, 4.5], [-7.5, 8.5, 3.5], [-3.5, 11.8, 2.2], [.9, 12.8, 1.1]].map(p => new T.Vector3(...p)), false, 'catmullrom', .4);
  const threadGeo = new T.TubeGeometry(curve, 560, .075, 8, false);
  const thread = new T.Mesh(threadGeo, ym); thread.castShadow = true; pm.add(thread);
  const key = new T.Group(); pm.add(key);
  { const k = M(pm, C.gelb, { r: .35, m: .2, em: C.gelb, ei: .25 }); const bow = new T.Mesh(new T.TorusGeometry(.85, .22, 16, 48), k); bow.position.x = -1.6; const sh = new T.Mesh(new T.BoxGeometry(3, .34, .26), k); sh.position.x = .75; const t1 = new T.Mesh(new T.BoxGeometry(.34, .7, .26), k); t1.position.set(1.4, -.45, 0); const t2 = new T.Mesh(new T.BoxGeometry(.3, .5, .26), k); t2.position.set(2.05, -.35, 0); [bow, sh, t1, t2].forEach(m => { m.castShadow = true; key.add(m); }); }
  anchor(pm, 'lay-pm', 17, 0, 6);
  const keyAnchor = new T.Object3D(); key.add(keyAnchor); A.key = keyAnchor; A['lay-key'] = keyAnchor;

  /* Tausend gleiche Häuser (in der Form von Free) */
  const many = grp(null, 'many');
  const N = 10, SP = 38, cells = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = (i - N / 2 + .5) * SP, z = (j - N / 2 + .5) * SP; if (Math.abs(x) < SP * .6 && Math.abs(z) < SP * .6) continue; cells.push([x, z, Math.hypot(x, z) / (N * SP * .62)]); }
  const mA = new T.InstancedMesh(new T.BoxGeometry(EX1 - EX0, YB, EZ1 - EZ0), M(many, 0x6f665d), cells.length);
  const mB = new T.InstancedMesh(new T.BoxGeometry(2 * HW, KW, BZ1 - BZ0), M(many, 0xB39878), cells.length);
  const rpG = (() => { const sh = new T.Shape(); sh.moveTo(-HW - .2, 0); sh.lineTo(HW + .2, 0); sh.lineTo(0, RP + .1); sh.closePath(); const g = new T.ExtrudeGeometry(sh, { depth: BZ1 - BZ0 + .4, bevelEnabled: false }); g.translate(0, 0, -(BZ1 - BZ0 + .4) / 2); return g; })();
  const mC = new T.InstancedMesh(rpG, M(many, 0x2f2f2e, { r: .75 }), cells.length);
  many.add(mA, mB, mC);
  const grid = new T.GridHelper(N * SP, N, C.anth, C.anth); grid.material.transparent = true; grid.material.userData.base = .7; many.userData.mats.push(grid.material); grid.position.set(0, .01, 0); many.add(grid); many.userData.grid = grid;

  const catcher = new T.Mesh(new T.PlaneGeometry(240, 240), new T.ShadowMaterial({ opacity: .55, transparent: true })); catcher.rotation.x = -Math.PI / 2; catcher.position.y = .002; catcher.receiveShadow = true;

  return { C, GAP, pivot, root, units, U: Object.fromEntries(units.map(u => [u.name, u])), A, front, check, scan, scanEdge, pts, ptsMesh, zones, gvol, deck, up, roof, dim, glasM, lamps, roofIns, zeich, zUp, life, larchM, roofM, crownMat: gar.userData.crown, wallx, wxL, wallIn: WI, moist, mph, ghostH, pm, spine, thread, threadGeo, key, many, mA, mB, mC, cells, catcher, au };
}

/* ---------- Film (Entwurf site/svc3d.js): Kamera, Zeitachse P (0 bis 12), Marken im Raum ---------- */
export async function createFilm(host, cfg = {}) {
  const cv = host.querySelector('canvas'), lab = host.querySelector('[data-l3]');
  const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
  R.outputColorSpace = T.SRGBColorSpace; R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.setClearColor(0x000000, 1);
  const HWd = await houseWorld('free', R);
  Object.assign(HWd.S, { eg: 1, og: 1, ext: 1, slab: 1, roof: 1, lift: 1 });
  HWd.apply();
  const HT = HWd.HT, CUT0 = HT.cut;
  const scene = new T.Scene(); scene.fog = new T.Fog(0x000000, 60, 200);
  const cam = new T.PerspectiveCamera(30, 1, .5, 5000);
  const S = buildScene(HWd);
  const HC = new T.Vector3(-1.8, 0, 1.3);
  S.pivot.position.copy(HC); S.root.position.copy(HC).multiplyScalar(-1);
  scene.add(S.pivot, S.many, S.catcher);
  { const pg = new T.PMREMGenerator(R), es = new T.Scene(), sg = new T.SphereGeometry(50, 48, 24), col = [], p = sg.attributes.position, c = new T.Color();
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 50; if (y > .05) c.setRGB(.55 + .35 * y, .6 + .33 * y, .66 + .3 * y); else if (y > -.08) c.setRGB(.42, .45, .48); else c.setRGB(.05, .05, .05); col.push(c.r, c.g, c.b); }
    sg.setAttribute('color', new T.Float32BufferAttribute(col, 3)); es.add(new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    const env = pg.fromScene(es, .02).texture; scene.traverse(o => { if (o.material && o.material.userData && o.material.userData.glass) { o.material.envMap = env; o.material.envMapIntensity = 1.5; } }); pg.dispose(); }
  scene.add(new T.HemisphereLight(0xffffff, 0x2a2a2a, 1.7));
  const sun = new T.DirectionalLight(0xffffff, 2.3); sun.position.set(-26, 42, 20); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 }); sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
  scene.add(sun, sun.target);
  const fill = new T.DirectionalLight(0xffffff, .9); fill.position.set(34, 18, 30); scene.add(fill);
  const rim = new T.DirectionalLight(0xffffff, .4); rim.position.set(20, 10, -34); scene.add(rim);

  const cl = t => Math.max(0, Math.min(1, t)), sm = t => (t = cl(t), t * t * (3 - 2 * t));
  const K = [
    [0, 32, 14, 70, -1, 4.4, 1.3], [1, 22, 11, 63, -1, 4.2, 1.3], [1.75, 36, 15, 70, -1, 4.2, 1.3],
    [2.6, 36, 30, 84, 0, 0, 1], [3.3, 40, 12, 196, 0, 34, 0], [3.9, 47, 14, 190, 0, 34, 0],
    [4.4, 18, 50, 92, 0, 0, 1], [4.9, 6, 56, 88, 0, 0, 1],
    [5.3, 0, 68, 104, -6, 0, 1], [5.48, 8, 62, 102, -6, 0, 1], [5.72, 30, 32, 72, -1.5, 3, 1.3], [5.95, 42, 28, 68, -1.5, 3, 1.3],
    [6.35, 22, 12, 60, -1.8, -.6, 1.3], [6.9, 34, 15, 56, -1.8, -.6, 1.3],
    [7.2, 34, 20, 78, 0, 4.4, 1.3], [7.95, 52, 19, 76, 0, 4.4, 1.3],
    [8.35, 50, 58, 54, 0, .5, 1.3], [8.9, 68, 54, 50, 0, .5, 1.3],
    [9.35, 30, 34, 90, 1, 0, 0], [9.9, 12, 30, 86, 1, 0, 0],
    [10.3, 22, 24, 104, 0, 5, 0], [10.48, 40, 25, 100, 0, 5, 0], [10.62, 18, 14, 50, -3.5, 1.4, 8.5], [10.76, 30, 11, 34, -3.6, 1.2, 10], [10.95, 46, 12, 32, -3.4, 1.2, 9.6],
    [11.35, 45, 42, 330, 0, 0, 0], [11.85, 54, 50, 270, 0, 0, 0], [12, 56, 34, 112, 0, 3, 0]
  ];
  const camAt = P => {
    let i = 0; while (i < K.length - 2 && P >= K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1], f = sm((P - a[0]) / (b[0] - a[0]));
    return a.map((v, j) => v + (b[j] - v) * f);
  };
  /* Runde 54 (Kunde, Telefon: „Animation kleiner, damit alles zu sehen ist“): am Telefon steht das Bild in einer Bühne zwischen
     Kopfzeile und Kapiteltext. NZ = Abstand der Kamera je Stelle (Faktor auf K) bei einer Bühne von 40 % der Höhe; ist die Bühne
     kleiner (langer Text, kurzes Telefon), geht die Kamera entsprechend weiter weg. Die Mitte der Bühne liegt in der Bildmitte. */
  const NZ = [
    [0, 1.25], [1, 1.5], [1.75, 1.45], [2.3, 1.55], [2.6, 2.15], [3.1, 1.95], [3.3, 2.5], [3.9, 2.5],
    [4.4, 2.0], [4.9, 2.0], [5.3, 2.05], [5.72, 2.05], [5.95, 1.75], [6.35, 1.9], [6.9, 1.9],
    [7.2, 1.35], [7.95, 1.35], [8.35, 1.55], [8.9, 1.55], [9.35, 1.5], [9.9, 1.5],
    [10.3, 1.2], [10.48, 1.2], [10.62, 1.5], [10.95, 1.5], [11.35, 1.0], [12, 1.0]
  ];
  const nzAt = P => {
    let i = 0; while (i < NZ.length - 2 && P >= NZ[i + 1][0]) i++;
    const a = NZ[i], b = NZ[i + 1]; return a[1] + (b[1] - a[1]) * sm((P - a[0]) / (b[0] - a[0]));
  };
  const IM = new T.Matrix4(), tmp = new T.Vector3(), dummy = new T.Object3D(), SET = { focus: null, fk: 0, fx: { roof: 0, wall: 0, dims: 0, og: 0 }, flow: 0, lastCam: null, P: cfg.P || 0, tP: cfg.P || 0, hover: -1, mx: 0, my: 0, tmx: 0, tmy: 0, w: 0, h: 0, alive: 1, raf: 0 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setOp = (g, o) => {
    g.visible = o > .004;
    g.userData.mats.forEach(m => { const v = m.userData.base * o; m.opacity = v; m.transparent = v < .999; m.depthWrite = v > .55; });
    const sh = o > .6; if (g.userData.sh !== sh) { g.userData.sh = sh; g.traverse(c => { if (c.isMesh && !c.isInstancedMesh) c.castShadow = sh; }); }
  };

  /* Marken (Entwurf): Ebenen des Überblicks, Schilder, Punkte im Haus. Ebenen und Punkte sind Knöpfe */
  const LABELS = (cfg.labels || []).map(L => {
    const big = L.kind === 'layer', hot = L.kind === 'hot', btn = big || hot;
    const el = document.createElement(btn ? 'button' : 'div');
    if (btn) { el.type = 'button'; el.tabIndex = -1; el.setAttribute('aria-label', L.t + (L.s ? '. ' + L.s : '')); } else el.setAttribute('aria-hidden', 'true');
    el.className = 'svf-m3' + (hot ? ' svf-m--hot' : big ? ' svf-m--lay3' : ''); el.dataset.id = L.id;
    el.style.cssText = 'position:absolute;left:0;top:0;display:flex;align-items:center;gap:12px;opacity:0;will-change:transform,opacity;white-space:nowrap;pointer-events:none;color:#fff;margin:0;padding:0;border:0;background:none;font:inherit;text-align:left;-webkit-tap-highlight-color:transparent';
    el.innerHTML = (hot ? `<span style="flex:none;width:32px;height:32px;margin:-8px;display:grid;place-items:center"><span style="width:16px;height:16px;box-sizing:border-box;border:1px solid currentColor;border-radius:50%;display:grid;place-items:center"><span style="width:5px;height:5px;border-radius:50%;background:currentColor"></span></span></span>` : `<span style="flex:none;width:${big ? 28 : 16}px;height:1px;background:currentColor"></span>`) + `<span style="display:grid;gap:3px;${big ? '' : 'background:#000;padding:6px 9px 7px;'}"><span style="font-family:var(--font-${big ? 'display' : 'text'});font-weight:500;font-size:${big ? 'clamp(13px,1.05vw,17px)' : '11px'};letter-spacing:${big ? '.06em' : '.2em'};text-transform:uppercase">${L.t}</span>${L.s ? `<span style="font-family:var(--font-text);font-size:${big ? '13px' : '11px'};letter-spacing:${big ? '0' : '.2em'};${big ? '' : 'text-transform:uppercase;'}color:#CACACA">${L.s}</span>` : ''}</span>`;
    const e = LAYER_E[L.id];
    if (big) {
      el.style.cursor = 'pointer';
      el.addEventListener('pointerenter', () => SET.hover = e);
      el.addEventListener('pointerleave', () => SET.hover = -1);
      el.addEventListener('click', () => cfg.onJump && cfg.onJump(L.jump));
    }
    if (hot) { el.style.cursor = 'pointer'; el.addEventListener('click', ev => { ev.stopPropagation(); cfg.onHot && cfg.onHot(L.hot || L.id); }); }
    lab.appendChild(el);
    return { ...L, hot: hot ? (L.hot || L.id) : null, e: e ?? -1, el, big };
  });

  const resize = () => {
    const r = host.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    if (w === SET.w && h === SET.h) return; SET.w = w; SET.h = h;
    R.setSize(w, h, false); cam.aspect = w / h;
    const narrow = w < 900; SET.narrow = narrow; SET.offX = null;
  };
  /* Runde 53 (Kunde: die Headline liegt auf dem Haus): in den ersten Kapiteln rückt das Haus am Desktop weiter nach rechts, weg vom Text */
  const offset = P => {
    const k = 1 - sm((P - 2.3) / .8), w = SET.w, h = SET.h, ox = SET.narrow ? -w * .07 * k : -w * (.17 + .13 * k);
    const oy = SET.narrow ? h / 2 - (SET.stT + SET.stB) / 2 : 0;
    if (SET.offX !== null && Math.abs(ox - SET.offX) < .5 && Math.abs(oy - SET.offY) < .5) return;
    SET.offX = ox; SET.offY = oy; cam.setViewOffset(w, h, ox, oy, w, h); cam.updateProjectionMatrix();
  };
  /* Bühne am Telefon: oben unter der Kopfzeile, unten über dem Text (setStage aus js/svc-film.js), weich nachgeführt */
  const stageEase = () => {
    const tT = SET.tT != null ? SET.tT : 72, tB = Math.max(tT + 120, SET.tB != null ? SET.tB : SET.h * .5);
    if (SET.stB == null || SET.snap || reduce) { SET.stT = tT; SET.stB = tB; SET.snap = 0; }
    else { SET.stT += (tT - SET.stT) * .08; SET.stB += (tB - SET.stB) * .08; }
  };
  const onMove = e => { SET.tmx = e.clientX / innerWidth * 2 - 1; SET.tmy = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onMove, { passive: true });
  const t0 = performance.now();
  let K0 = null;

  /* Zeichnen nur, solange der Film zu sehen ist */
  let inView = true;
  const frame = () => { SET.raf = 0; if (!SET.alive || !inView || document.hidden) return; try { frameX(); } catch (err) { if (!SET.err) { SET.err = 1; console.warn('Services 3D', err); } } SET.raf = requestAnimationFrame(frame); };
  const wake = () => { if (!SET.raf && SET.alive && inView && !document.hidden) SET.raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver(es => { inView = es.some(x => x.isIntersecting); wake(); }, { rootMargin: '120px 0px' });
  io.observe(host);
  const onVis = () => wake();
  document.addEventListener('visibilitychange', onVis);

  const frameX = () => {
    if (!SET.alive) return;
    resize();
    SET.P += (SET.tP - SET.P) * (reduce ? 1 : .09);
    SET.mx += (SET.tmx - SET.mx) * .04; SET.my += (SET.tmy - SET.my) * .04;
    const P = SET.P, t = (performance.now() - t0) / 1000, s = (a, b) => sm((P - a) / (b - a)), ease = reduce ? 1 : .06;
    stageEase(); offset(P);

    /* Kamera */
    const ft = SET.focus ? 1 : 0; SET.fk += (ft - SET.fk) * ease;
    ['roof', 'wall', 'dims', 'og'].forEach(k => { const tg = SET.focus && SET.focus.fx && SET.focus.fx[k] ? 1 : 0; SET.fx[k] += (tg - SET.fx[k]) * (reduce ? 1 : .07); });
    SET.flow += ((SET.focus && LOW.includes(SET.focus.id) ? 1 : 0) - SET.flow) * ease;
    if (SET.focus) SET.lastCam = SET.focus.cam;
    const c = camAt(P);
    /* Runde 54: am Telefon je Stelle so weit weg, dass das Bild in die Bühne über dem Text passt */
    if (SET.narrow) { const phi = (SET.stB - SET.stT) / SET.h; c[3] *= nzAt(P) * Math.max(.6, Math.min(1.6, .4 / Math.max(.05, phi))); }
    if (SET.fk > .001 && SET.lastCam) { const fk = sm(SET.fk), fc = SET.lastCam; for (let j = 1; j < 7; j++) c[j] = c[j] + (fc[j - 1] * (j === 3 && SET.narrow ? 1.5 : 1) - c[j]) * fk; }
    let az = c[1], el = c[2];
    if (!reduce) { az += Math.sin(t * .11) * 1.6 + SET.mx * 2.6; el += Math.sin(t * .08) * .8 - SET.my * 1.4; }
    const A = az * Math.PI / 180, E = el * Math.PI / 180, d = c[3];
    cam.position.set(c[4] + d * Math.cos(E) * Math.sin(A), c[5] + d * Math.sin(E), c[6] + d * Math.cos(E) * Math.cos(A));
    cam.lookAt(c[4], c[5], c[6]);
    scene.fog.near = d * .7; scene.fog.far = d * 2.6;

    /* Haus: Wände auf 1 m, wenn ein Raum im Fokus ist */
    { const lo = sm(SET.flow), ex = 1 - lo, cut = CUT0 + (1 - CUT0) * lo;
      if (lo < .002) { if (HWd.S.ext !== 1 || HT.cut !== CUT0) { HWd.S.ext = 1; HT.cut = CUT0; HWd.apply(); } }
      else if (Math.abs(ex - HWd.S.ext) > .002 || Math.abs(cut - HT.cut) > .002) { HWd.S.ext = ex; HT.cut = cut; HWd.apply(); } }

    /* Drehteller: das Haus als Produkt */
    let sp = (t * .32) % (Math.PI * 2); if (sp > Math.PI) sp -= Math.PI * 2;
    S.pivot.rotation.y = reduce ? 0 : sp * (1 - s(1.35, 1.95));
    S.catcher.visible = P < 2.5;

    /* Einheiten: zusammensetzen, explodieren, schweben, landen */
    const expK = s(3.0, 3.5), ov = s(3.2, 3.5) * (1 - s(3.9, 4.1));
    S.units.forEach(u => {
      const { e, landP, delay } = u.userData;
      const appear = u.name === 'huelle' ? 1 : u.name === 'plan' ? s(2.95, 3.25) : s(2 + delay * 2, 2.35 + delay * 2);
      const ghost = e === 0 ? 0 : s(3.95, 4.35) * (1 - s(landP - .5, landP - .08));
      const land = 1 - s(landP - .5, landP - .08);
      u.position.y = S.GAP * e * Math.min(expK, land) + 5 * ghost;
      let o = appear * (1 - ghost);
      if (SET.hover !== -1 && !(Array.isArray(SET.hover) ? SET.hover.includes(e) : e === SET.hover)) o *= 1 - .78 * ov;
      u.userData.op = o; setOp(u, o);
    });
    const U = S.U;

    /* Projektcheck */
    const ck = s(4.12, 4.3) * (1 - s(4.95, 5.15)); setOp(S.check, ck * U.grund.userData.op);
    const sx = -16 + 32 * s(4.25, 4.85); S.scan.position.x = sx; S.scanEdge.position.x = sx;
    if (ck > 0) { S.pts.forEach(([x, z], i) => { const k = cl((sx - x) / 2.5); dummy.position.set(x, .1 + .12 * k, z); dummy.scale.setScalar(Math.max(.001, k)); dummy.updateMatrix(); S.ptsMesh.setMatrixAt(i, dummy.matrix); }); S.ptsMesh.instanceMatrix.needsUpdate = true; }

    /* Projektplan */
    S.zones.forEach((z, i) => { const zv = P < 4.6 ? 1 : s(5.1 + i * .12, 5.2 + i * .12); setOp(z, U.plan.userData.op * zv * (1 - s(5.48, 5.58))); });

    /* Hausplanung */
    setOp(S.zeich, s(5.5, 5.6) * (1 - s(5.98, 6.1))); S.zUp.scale.y = Math.max(.001, s(5.58, 5.8));

    /* Fundament: Schnitt durch das Gelände */
    const cut = s(6.0, 6.3) * (1 - s(6.85, 7.05));
    S.front.position.z = 20 * cut; S.front.position.y = -1.5 * cut; setOp(S.front, U.grund.userData.op * (1 - cut * .9));

    /* Hülle und Innen */
    const hl = Math.max(s(7.1, 7.28) * (1 - s(7.84, 8.0)) * .6, SET.fx.roof), doll = s(7.95, 8.22) * (1 - s(8.82, 9.05));
    /* Runde 53: Bad im Fokus, das Obergeschoß kommt zurück auf das Haus (Decke mit), das Dach bleibt weg */
    const dg = doll * (1 - sm(SET.fx.og));
    S.deck.position.set(-16 * dg, .5 * hl + 5 * dg, -18 * dg); S.up.position.set(-16 * dg, 1.1 * hl + 6.5 * dg, -18 * dg); S.roof.position.set(-16 * doll, 3 * hl + 8.5 * doll, -18 * doll); S.roofIns.position.set(0, 1.5 * hl, 0); setOp(S.roofIns, U.huelle.userData.op * Math.max(s(7.12, 7.24) * (1 - s(7.4, 7.48)), SET.fx.roof) * (1 - doll));
    setOp(S.dim, U.huelle.userData.op * SET.fx.dims);
    const wx = SET.fx.wall; setOp(S.wallx, U.huelle.userData.op * Math.min(1, wx * 3));
    { let z = S.wallIn + .38; S.wxL.forEach((g, i) => { g.position.z = S.wallIn + (z - S.wallIn + i * .62) * wx; z += g.userData.th; }); }
    const mo = sm((SET.fx.wall - .6) / .4); S.moist.visible = mo > .01; S.moist.material.opacity = .85 * mo;
    if (mo > .01) { const a = S.moist.geometry.attributes.position.array, span = 4.6; S.mph.forEach(([x, y, ph, sp2], i) => { const k = Math.sin(t * sp2 + ph) * .5 + .5; a[i * 3] = x; a[i * 3 + 1] = y + Math.sin(t * .7 + ph) * .08; a[i * 3 + 2] = S.wallIn - .5 + k * span * wx; }); S.moist.geometry.attributes.position.needsUpdate = true; }
    const gh = SET.fx.dims; setOp(S.ghostH, U.huelle.userData.op * gh); S.ghostH.position.y = 2.84 - .22 * sm((gh - .3) / .7);
    const warm = s(8.2, 8.5) * (1 - .55 * s(11.0, 11.3));
    S.glasM.forEach(m => { m.emissiveIntensity = .5 * warm; m.opacity = Math.min(.8, m.opacity * (1 + 1.6 * warm)); });
    S.lamps.forEach(l => l.intensity = 7 * warm);

    /* Projektmanager */
    const ovK = s(3.0, 3.45) * (1 - s(3.9, 4.3));
    S.spine.visible = ovK > .01; S.spine.scale.set(ovK, Math.max(.001, (S.GAP * 6 + 2) * expK), ovK);
    let kv;
    if (P < 6) { kv = ovK; S.key.position.set(.9, (S.GAP * 6 + 3.4) * expK, 1.1); }
    else { kv = s(10.22, 10.38) * (1 - s(10.52, 10.62)); S.key.position.set(.9, 13.2 + 3 * (1 - s(10.22, 10.45)), 1.1); }
    S.key.visible = kv > .01; S.key.scale.setScalar(Math.max(.001, kv)); S.key.rotation.y = t * .7;
    const tk = s(10.03, 10.32); S.thread.visible = tk > .001;
    S.threadGeo.setDrawRange(0, Math.floor(S.threadGeo.index.count * tk / 3) * 3);

    /* Besser leben: zehn Jahre im Zeitraffer */
    { const L = S.life.userData, on = s(10.52, 10.6) * (1 - s(10.96, 11.02)), u = s(10.55, 10.95), c2 = ((u * 4) % 1 + 1) % 1;
      const w = .5 + .5 * Math.cos(2 * Math.PI * c2), snow = on * Math.pow(w, 3);
      S.life.visible = on > .005; L.snowPlane.material.opacity = .85 * snow; L.snowPlane.visible = snow > .01;
      const fl = L.flakes; fl.visible = snow > .05; fl.material.opacity = .9 * snow;
      if (fl.visible) { const a = fl.geometry.attributes.position.array; L.sd.forEach(([x, y, z, v], i) => { a[i * 3] = x + Math.sin(t * .6 + i) * .3; a[i * 3 + 1] = ((y - t * v * 1.6) % 22 + 22) % 22; a[i * 3 + 2] = z; }); fl.geometry.attributes.position.needsUpdate = true; }
      if (!K0) K0 = { crown: S.crownMat.color.clone(), w: new T.Color(0xF4F4F2), sal: new T.Color(0x8B907C), kup: new T.Color(0x887254), grey: new T.Color(0x9b9891), tmp: new T.Color() };
      S.roofM.forEach(m => m.color.copy(m.userData.c0).lerp(K0.w, snow * .92));
      S.larchM.forEach(m => m.color.copy(m.userData.c0).lerp(K0.grey, on * u * .85));
      let cc; if (c2 < .25) cc = K0.tmp.copy(K0.w).lerp(K0.sal, sm(c2 / .25)); else if (c2 < .6) cc = K0.tmp.copy(K0.sal); else if (c2 < .85) cc = K0.tmp.copy(K0.sal).lerp(K0.kup, sm((c2 - .6) / .25)); else cc = K0.tmp.copy(K0.kup).lerp(K0.w, sm((c2 - .85) / .15));
      S.crownMat.color.copy(K0.crown).lerp(cc, on);
      /* Runde 53: der Wagen hält auf der Zufahrt, die Schnauze 1,4 m vor dem Garagentor (vorher fuhr er ins Tor) */
      { const vz = 24 - 11.8 * (1 - Math.pow(1 - cl((P - 10.56) / .14), 2)), van = L.van; van.position.set(-5.8, 0, vz); van.rotation.y = Math.PI; van.visible = on > .01;
        L.wheels.forEach(wh => wh.rotation.x = -(vz - 24) / .42);
        L.sideDoor.position.z = .6 - 1.15 * s(10.71, 10.75);
        L.crew.forEach((g, i) => { const k = s(10.74 + i * .03, 10.9 + i * .03), x0 = -4.3, z0 = 11.6 - i * .8, x1 = -1.4 - i * .7, z1 = 9.3 - i * .2; g.visible = on > .01 && P > 10.73 + i * .03; g.position.set(x0 + (x1 - x0) * k, 0, z0 + (z1 - z0) * k); g.rotation.y = Math.atan2(x1 - x0, z1 - z0); g.children[0].scale.y = 1 + (k > 0 && k < 1 ? Math.sin(t * 9 + i) * .06 : 0); g.children[1].position.y = 1.22 + (k > 0 && k < 1 ? Math.abs(Math.sin(t * 9 + i)) * .05 : 0); }); } }

    /* Tausendmal dasselbe Haus */
    const mv = P > 11.0 && P < 12;
    S.many.visible = mv;
    if (mv) {
      setOp(S.many, 1); S.many.userData.grid.material.opacity = .7 * s(11.0, 11.15) * (1 - s(11.75, 11.95));
      S.cells.forEach(([x, z, dd], i) => {
        const h = Math.max(.001, s(11.02 + dd * .26, 11.16 + dd * .26) * (1 - s(11.5 + (1 - dd) * .3, 11.68 + (1 - dd) * .3)));
        const hs = h < .04 ? .001 : 1; dummy.scale.set(hs, h, hs); dummy.position.set(x - 1.8, YB / 2 * h, z + 1.32); dummy.updateMatrix(); S.mA.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x + .9, (YB + KW / 2) * h, z + 1.07); dummy.updateMatrix(); S.mB.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x + .9, (YB + KW) * h, z + 1.07); dummy.updateMatrix(); S.mC.setMatrixAt(i, dummy.matrix);
      });
      S.mA.instanceMatrix.needsUpdate = S.mB.instanceMatrix.needsUpdate = S.mC.instanceMatrix.needsUpdate = true;
    }

    /* Bild der Fassaden bleibt am Haus (uFix je Gruppe, siehe own) */
    [S.gvol, S.deck, S.up, S.roof].forEach(g => { const f = g.userData.fix; if (!f) return; g.updateWorldMatrix(true, false); IM.copy(g.matrixWorld).invert(); f.forEach(u => u.value.copy(IM)); });
    R.render(scene, cam);

    /* Marken */
    const PL = [];
    LABELS.forEach(L => {
      let v = L.fo ? (SET.focus && SET.focus.id === L.fo ? sm((SET.fk - .5) / .5) : 0) : s(L.from, L.from + .12) * (1 - s(L.to - .12, L.to));
      if (L.big && SET.hover !== -1 && SET.hover !== L.e) v *= .4;
      if (L.hot && SET.focus && SET.focus.id !== L.hot) v *= .45;
      /* Runde 53: liegt das Obergeschoß auf dem Haus (Bad), sind die Punkte des Erdgeschoßes darunter: ausblenden */
      const og = sm(SET.fx.og); if (L.hot && L.hot !== 'bad' && og > .002) v *= 1 - og;
      const off = () => { if (L.on) { L.el.style.opacity = '0'; L.el.style.pointerEvents = 'none'; if (L.el.tabIndex === 0) L.el.tabIndex = -1; L.on = 0; } };
      if (v < .01) return off();
      const a = L.id === 'bad' && SET.fx.og > .5 ? S.A['bad-og'] : S.A[L.id]; if (!a) return off();
      a.getWorldPosition(tmp).project(cam);
      if (tmp.z > 1) return off();
      let x = (tmp.x * .5 + .5) * SET.w; const y = (-tmp.y * .5 + .5) * SET.h;
      if (!L.wd || L.on !== 1) { L.wd = L.el.offsetWidth; L.ht = L.el.offsetHeight; } if (!SET.narrow && !L.free) x = Math.max(x, SET.w * .56); x = Math.min(x, SET.w - L.wd - (SET.narrow ? 12 : 20));
      /* Runde 54: am Telefon nur in der Bühne (nicht unter dem Text, nicht unter der Kopfzeile) */
      if (SET.narrow && (y < SET.stT - 30 || y > SET.stB + 30)) return off();
      PL.push({ L, x, y, v, top: y - (L.big ? 12 : 7) });
      const act = (L.big || L.hot) && v > .5;
      L.el.style.pointerEvents = act ? 'auto' : 'none'; L.on = 1;
      if (L.big || L.hot) { const ti = act ? 0 : -1; if (L.el.tabIndex !== ti) L.el.tabIndex = ti; }
      if (L.hot) { const on = SET.focus && SET.focus.id === L.hot; if (on !== L.act) { L.act = on; L.el.style.color = on ? '#FFB200' : '#fff'; } }
    });
    /* Runde 54: am Telefon rücken Schilder, die sich decken, nach unten. Punkte im Haus bleiben an ihrer Stelle; deckt ihr Name ein
       anderes Schild, bleibt nur der Punkt. Alles blendet nur innerhalb der Bühne ein (nicht unter dem Text, nicht unter der Kopfzeile). */
    if (SET.narrow) {
      PL.sort((a, b) => a.top - b.top);
      const hit = (q, o) => q.x < o.x + o.L.wd + 6 && o.x < q.x + q.L.wd + 6 && q.top < o.top + o.L.ht + 4 && o.top < q.top + q.L.ht + 4;
      for (let i = 0; i < PL.length; i++) {
        const q = PL[i]; q.bare = false; q.dy = 0;
        for (let j = 0; j < i; j++) {
          const o = PL[j]; if (o.bare || !hit(q, o)) continue;
          const need = o.top + o.L.ht + 4 - q.top;
          /* Punkt im Haus: nur sein Name rückt (bis 26 px) neben dem Punkt nach unten, sonst bleibt nur der Punkt */
          if (q.L.hot) { if (q.dy + need <= 26) { q.dy += need; q.top += need; } else { q.bare = true; break; } }
          else q.top += need;
        }
        q.v *= sm((q.top - SET.stT + 4) / 16) * sm((SET.stB - q.top - q.L.ht + 4) / 16);
      }
    }
    PL.forEach(q => {
      const L = q.L; L.el.style.transform = `translate3d(${q.x.toFixed(1)}px,${q.top.toFixed(1)}px,0)`; L.el.style.opacity = q.v.toFixed(3);
      if (q.v < .3) L.el.style.pointerEvents = 'none';
      if (L.hot) { const t = L.el.lastElementChild, vis = q.bare ? 'hidden' : 'visible', tf = q.dy ? `translateY(${q.dy.toFixed(1)}px)` : ''; if (t && t.style.visibility !== vis) t.style.visibility = vis; if (t && t.style.transform !== tf) t.style.transform = tf; }
    });
  };
  wake();
  return {
    R, scene, cam, S, HW: HWd, K, FOC,
    setP(P) { SET.tP = P; wake(); },
    setFocus(id) { SET.focus = id && FOC[id] ? { id, ...FOC[id] } : null; wake(); },
    renderAt(P) { SET.P = SET.tP = P; SET.snap = 1; frameX(); },
    setStage(top, bottom) { if (SET.tT === top && SET.tB === bottom) return; SET.tT = top; SET.tB = bottom; wake(); },
    get P() { return SET.P; },
    isExt: id => ['dach', 'wand', 'fenster', 'fassade', 'hoehe'].includes(id),
    destroy() { SET.alive = 0; cancelAnimationFrame(SET.raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis); removeEventListener('pointermove', onMove); R.dispose(); lab.innerHTML = ''; }
  };
}
