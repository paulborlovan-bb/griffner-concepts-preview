/* Runde 55 (Kunde, 2026-11-12): neuer Entwurf „GRIFFNER Services v2“ (Claude Design, S2Services, site/svc3d.js und site/svc3d-scene.js).
   Der Film läuft eins zu eins wie im Entwurf: Vitrine mit Drehteller und durchgestrichenen Produktschildern, die Familie geht durch die
   Haustür, rund ums Haus wächst alles, Überblick in Schichten, Machbarkeit mit Scan, Bebauungsstudie, Budget als Kostenturm,
   Entwurfsplanung als Zeichnung, Open Space mit wenigen Lastenpunkten, Innenarchitektur im offenen Haus mit Materialmustern,
   Gesamtkosten, Generalunternehmer (Bodenplatte im Schnitt, Zufahrt, Zaun), Projektmanagement mit Planblättern, Projektmanager mit
   Faden und Schlüssel, Bausystem (Dach, Holzdecke, Wand in neun Schichten, Raumhöhe), Ausstattung als Rundgang, Photovoltaik und
   Überschuss ins Netz, Kundendienst mit Wagen und Schnee, die vielen gleichen Häuser.
   Wie seit Runde 52 ist nur das Haus anders: das echte Concept Free (js/grundriss.js, data/grundriss-free.js) statt des Modells im
   Entwurf, mit seiner Haustür (schwingt auf), seiner Sauna im Haus, seinem Bad im Obergeschoß und den Wegen der Familie um seine Möbel.
   Eingang P wie im Entwurf: die Seite gibt P (0 bis 12), daraus PN (remapP) und das Bild-P (warp). Welt in m: x nach Osten,
   z nach Süden (Straße), y nach oben. */
import * as T from 'three';
import { houseWorld } from './grundriss.js';
import { M as HM, FAB } from './grundriss-moebel.js';

const C = { weiss: 0xEAE8E3, sand: 0xCFC3B3, kalk: 0xCACACA, beton: 0xB9B7B2, anth: 0x444442, ground: 0x242423, gelb: 0xFFB200, salbei: 0x8B907C, glas: 0x0b0c0d, schwarz: 0x000000 };
const GAP = 11.5;
/* Free im System des Entwurfs: Mitte des Erdgeschoßes bei HX/HZ. Maße des Entwurfs, aus Free gerechnet */
const HX = -1.8, HZ = 1.32;
const EX0 = -9.5, EX1 = 5.9, EZ0 = -5.52, EZ1 = 8.16, EH = 2.9;
const BX = .9, HW = 4, BZ0 = -7.52, BZ1 = 9.66, YB = 3.24, KW = 2.75, RP = 3.4, CZ0 = BZ0 + 2, CZ1 = BZ1 - 1.5;
/* Ebenen der Explosion zu den Marken des Überblicks */
const LAYER_E = { 'lay-plan': [0, 1], 'lay-fund': 2, 'lay-huelle': 3, 'lay-innen': 4, 'lay-aussen': 5, 'lay-key': 6 };
/* Punkte im Haus: Blick [Azimut, Höhe, Abstand, Ziel x, y, z] und Effekte. Runde 55: im Entwurf nur noch Fenster (innen), Parkett,
   Fliesen und Bad (Knöpfe im Text der Ausstattung und Punkte im Haus). Fliesen im Duschraum bei der Sauna, das Bad im Obergeschoß
   (beim Öffnen kommt das Obergeschoß auf das Haus zurück, Ziele rechnet buildScene aus dem Plan). */
const FOC = {
  dach: { cam: [62, 24, 52, -1, 6.5, 4.5], fx: { roof: 1 } },
  wand: { cam: [28, 13, 34, 1.6, 1.6, 8.5], fx: { wall: 1 } },
  fassade: { cam: [84, 10, 34, 4.9, 4.6, -1.6] },
  hoehe: { cam: [30, 12, 42, 3, 1.6, 8.15], fx: { dims: 1 } },
  fenster: { cam: [10, 26, 15, .9, 1.3, -5.0] },
  parkett: { cam: [50, 46, 22, -1.0, .3, -3.0] },
  fliesen: { cam: [35, 60, 15, -6.4, .3, -2.4] },
  bad: { cam: [28, 58, 14, 2.9, 3.4, -3.3], fx: { og: 1 } }
};
/* Fokus, bei dem die Wände auf 1 m gehen, damit man in die Räume sieht */
const LOW = ['parkett', 'fliesen', 'bad'];
const HOTS = ['fenster', 'parkett', 'fliesen', 'bad'];

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
  const tex = (draw, w = 512, h = 512) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };
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

  /* Machbarkeit: Vermessung, Scan */
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

  /* Projektplan (Überblick): Sofort (Haus und Zufahrt), Später (Terrasse und Garten, Wahl des Kunden in Runde 50b), Irgendwann (Pool oder Sauna) */
  const plan = unit('plan', 1, 5.1, .06);
  const zones = [0, 1, 2].map(i => grp(plan, 'zone' + i));
  box(zones[0], EX0, .02, EZ0, EX1, .1, EZ1, M(zones[0], C.gelb, { r: .8 })); box(zones[0], -9.6, .02, EZ1, -1.1, .08, 12.4, M(zones[0], C.gelb, { r: .8 }));
  const zw0 = LM(zones[0], C.kalk, .55); wire(zones[0], EX0, .1, EZ0, EX1, EH, EZ1, zw0); wire(zones[0], BX - HW, YB, BZ0, BX + HW, YB + KW + RP, BZ1, zw0);
  { const zm = M(zones[1], C.kalk, { op: .35 }), ze = LM(zones[1], 0xFFFFFF, .9);
    box(zones[1], EX0 - 1.6, .02, EZ0 - 4, EX1, .07, EZ0, zm, ze); box(zones[1], EX0 - 1.6, .02, EZ0, EX0, .07, 1.6, zm, ze);
    box(zones[1], -15.6, .02, -11.7, 15.6, .07, -11, zm, ze); }
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
     sie sich wie im Entwurf voneinander lösen */
  const EG = H.FL[0], OG = H.FL[1], HT = H.HT;
  const hx = (parent, y = 0) => { const g = new T.Group(); g.position.set(HX, y, HZ); parent.add(g); return g; };
  const hul = unit('huelle', 3, 7.1, 0);
  const gvol = grp(hul, 'gvol'), deck = grp(hul, 'deck'), up = grp(hul, 'up'), roof = grp(hul, 'roof'), roofIns = grp(hul, 'roofIns');
  const inn = unit('innen', 4, 8.15, .14);
  /* Runde 53: Böden 2,5 cm höher, sonst liegt das Bodenbild (Eiche, Fliesen) unter der Oberkante des Fundaments */
  const ih = hx(inn, .025);
  [EG.plane, ...EG.furn.map(o => o.m), ...EG.steps.map(s => s.m)].forEach(o => o && ih.add(o));
  EG.base.forEach(m => { m.visible = false; });
  hx(gvol).add(EG.g);
  { const dk = hx(deck); H.slabs.forEach(s => dk.add(s.m)); }
  hx(up).add(OG.g);
  { const rb = hx(roof, HT.eg + HT.slab); H.roofs.filter(r => r.g.parent === OG.g).forEach(r => rb.add(r.g)); }
  /* Haustür von Free (Runde 55): das Blatt hängt an einem Scharnier an der Westseite der Öffnung und schwingt nach innen auf */
  const hdoor = new T.Group();
  { const tw = EG.wins.find(o => o.kind === 'tuer' && o.w[0] === 586.4) || EG.wins.find(o => o.kind === 'tuer');
    const d = tw && tw.P.door;
    if (d) { const leaf = d.scale.x; hdoor.position.set(d.position.x - leaf / 2, 0, d.position.z); d.parent.add(hdoor); hdoor.add(d); d.position.x = leaf / 2; d.position.z = 0;
      const hd = tw.P.handle; if (hd) { hdoor.add(hd); hd.position.x -= hdoor.position.x; hd.position.z -= hdoor.position.z; } } }
  /* eigene Materialien je Ebene (Ein- und Ausblenden wie im Entwurf), mit der Umgebung der Concepts. Runde 53: Fassaden und Dach legen
     ihr Bild in Weltkoordinaten; jede Gruppe gibt ihren Materialien uFix mit (Kehrwert ihrer Lage), so bleibt das Bild am Haus */
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
  const mHul = [gvol, deck, up, roof].map(g => own(hul, [g], env, g)); const mInn = own(inn, [ih], env);
  const glasM = mHul.flatMap(mp => [...mp.entries()].filter(([o]) => o === HM.glass).map(([, c]) => c));
  glasM.forEach(m => { m.emissive = new T.Color(0xFFE3BF); m.emissiveIntensity = 0; });
  const larchM = [...new Set(OG.skins.map(s => s.m.material).flat().concat(OG.base.map(m => m.material).flat()))].filter(m => m && m.map);
  const roofM = []; roof.traverse(o => { if (o.isMesh && Array.isArray(o.material) && o.material[1]) roofM.push(o.material[1]); });
  [...larchM, ...roofM].forEach(m => { m.userData.c0 = m.color.clone(); });
  /* Bausystem: die Decke zeigt ihr Holz (Entwurf: reveal), Stoffe werden in der Innenarchitektur salbeigrün */
  const deckM = [...mHul[1].values()].filter(m => m.isMeshStandardMaterial); deckM.forEach(m => { m.userData.c0 = m.color.clone(); });
  const softM = [...mInn.entries()].filter(([o]) => o === FAB.kalk || o === FAB.sand).map(([, c]) => c); softM.forEach(m => { m.userData.c0 = m.color.clone(); });
  const ang = Math.atan2(RP, HW), cz = (BZ0 + BZ1) / 2;
  { const len = BZ1 - BZ0 + .4, im = M(roofIns, 0xD8D1C3, { r: 1 }), ie = LM(roofIns, C.schwarz, .3);
    [1, -1].forEach(sg => {
      const L2 = HW / Math.cos(ang) - .4, g2 = new T.BoxGeometry(L2, .34, len - 4.6), m2 = new T.Mesh(g2, im); m2.rotation.z = -sg * ang;
      m2.position.set(BX + sg * HW / 2, YB + KW + RP - HW / 2 * Math.tan(ang) - .25, cz); m2.add(new T.LineSegments(new T.EdgesGeometry(g2), ie)); roofIns.add(m2);
    }); }
  /* Photovoltaik auf der Ostseite des Dachs (Entwurf pvA), 3 × 8 Module */
  const pvA = new T.Group(); pvA.name = 'pvA'; roof.add(pvA);
  { const ov = .3, n = .1; pvA.rotation.z = -ang; pvA.position.set(BX + (HW + ov) / 2 + n * Math.sin(ang), YB + KW + RP - (HW + ov) / 2 * Math.tan(ang) + n * Math.cos(ang), cz);
    const pg = new T.BoxGeometry(1.72, .05, 1.06), pe = new T.LineBasicMaterial({ color: C.kalk, transparent: true, opacity: .35 }), panels = [];
    [-1.85, 0, 1.85].forEach(px => { for (let j = 0; j < 8; j++) { const mt = new T.MeshStandardMaterial({ color: 0x0e1620, roughness: .25, metalness: .6, emissive: 0x7f93ad, emissiveIntensity: 0, transparent: true, opacity: 0 });
      const m = new T.Mesh(pg, mt); m.position.set(px, .12, (j - 3.5) * 1.12); m.userData.y0 = .12; m.castShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(pg), pe)); pvA.add(m); panels.push(m); } });
    pvA.userData.panels = panels; anchor(pvA, 'pvA', -1.85, .4, 0); pvA.visible = false; }
  anchor(roof, 'dach', BX, YB + KW + RP + .3, BZ1 + .2); anchor(up, 'fassade', BX + HW + .05, YB + 1.6, -2.4); anchor(roofIns, 'daemm', BX + HW * .6, YB + KW + 1.2, CZ0 + 1);
  anchor(roof, 'fenster', -.8, YB + KW + .9, 8.02);
  /* Fenster von innen: die Schiebetür nach Norden (Terrasse) */
  anchor(gvol, 'fensterI', 1.5, 2.2, -5.17);
  /* Raumhöhe: 2,72 m im Licht, darüber der Geist der üblichen 2,50 m */
  const RY0 = .12, RY1 = RY0 + 2.72;
  const dim = grp(hul, 'dim');
  segs(dim, [[EX1 + .45, RY0, EZ1 + .3, EX1 + .45, RY1, EZ1 + .3], [EX1 + .15, RY0, EZ1 + .3, EX1 + .75, RY0, EZ1 + .3], [EX1 + .15, RY1, EZ1 + .3, EX1 + .75, RY1, EZ1 + .3]], LM(dim, 0xFFFFFF, 1));
  anchor(deck, 'decke', EX1 + .1, 3.6, EZ1 + .1); anchor(dim, 'hoehe', EX1 + .6, .2, EZ1 + .3);

  /* Entwurfsplanung: das Haus als Zeichnung des Architekturteams, die Wände aus dem echten Grundriss */
  const zeich = grp(root, 'zeich'), zl = LM(zeich, 0xFFFFFF, .95), zf = LM(zeich, 0xFFFFFF, .5), zy = LM(zeich, C.gelb, 1);
  loop(zeich, [[EX0, .04, EZ0], [EX1, .04, EZ0], [EX1, .04, EZ1], [EX0, .04, EZ1]], zl);
  const zInt = hx(zeich, .025);
  { const wm = BM(zeich, 0xFFFFFF, .92); EG.walls.forEach(w => { const m = new T.Mesh(w.m.geometry, wm); m.scale.y = .02; zInt.add(m); }); }
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

  /* Wandschnitt (Entwurf Runde 55: neun Schichten), Feuchte, übliche Raumhöhe */
  const WI = EZ1 - .3, wallx = grp(hul, 'wallx'), wxL = [];
  [[C.weiss, .05, 0], [C.sand, .14, 1], [0xC2A77F, .04, 0], [0xD8D1C3, .42, 2], [0xA48C6A, .05, 0], [0x887254, .1, 0], [0x75624B, .03, 0], [0x2a2a29, .07, 4], [0xB49E7F, .07, 5]].forEach(([col, th, ty]) => {
    const g = new T.Group(); wallx.add(g); const m = M(wallx, col), e = LM(wallx, C.schwarz, .3), sd = M(wallx, C.sand);
    box(g, .4, .05, 0, 3, EH - .05, th, m, e);
    if (ty === 1) [.5, 1.5, 2.5].forEach(y => box(g, .4, y, -.01, 3, y + .1, th + .01, sd));
    if (ty === 2) [.6, 1.5, 2.4].forEach(x => box(g, x, .05, -.01, x + .12, EH - .05, th + .01, sd));
    if (ty === 4) [.5, 1.5, 2.45].forEach(x => box(g, x, .05, 0, x + .08, EH - .05, th, sd));
    if (ty === 5) for (let x = .43; x < 2.95; x += .26) box(g, x, .05, 0, x + .2, EH - .05, th + .02, M(wallx, 0xB49E7F));
    g.userData.th = th; g.position.z = WI; wxL.push(g);
  });
  const NP = 280, mp = new Float32Array(NP * 3), mph = [];
  for (let i = 0; i < NP; i++) mph.push([.5 + Math.random() * 2.4, .25 + Math.random() * 2.5, Math.random() * Math.PI * 2, .55 + Math.random() * .7]);
  const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(mp, 3));
  const moist = new T.Points(mg, new T.PointsMaterial({ color: 0xFFFFFF, size: .13, transparent: true, opacity: 0, depthWrite: false, depthTest: false })); moist.renderOrder = 5; moist.frustumCulled = false; hul.add(moist);
  const ghostH = grp(hul, 'ghostH');
  { const pl = new T.Mesh(new T.PlaneGeometry(EX1 - EX0, EZ1 - EZ0), BM(ghostH, C.kalk, .16)); pl.rotation.x = -Math.PI / 2; pl.position.set((EX0 + EX1) / 2, 0, (EZ0 + EZ1) / 2); ghostH.add(pl);
    loop(ghostH, [[EX0, 0, EZ0], [EX1, 0, EZ0], [EX1, 0, EZ1], [EX0, 0, EZ1]], LM(ghostH, 0xFFFFFF, .9, true)); }
  anchor(wxL[8], 'wallx', 3, EH - .05, .07); A.wand = A.wallx; anchor(wxL[3], 'moist', 3, .35, .42); anchor(ghostH, 'ueblich', EX1, 0, EZ0);
  anchor(hul, 'lay-huelle', 17, 3.2, 6);

  /* Innen: Böden, Möbel, Türen und Treppe von Free (oben in ih), Licht am Abend */
  const lamps = [[1.6, 2.4, -2.6], [-6.8, 2.4, -3.6]].map(p => { const l = new T.PointLight(0xFFE2BC, 0, 18, 1.2); l.position.set(...p); inn.add(l); return l; });
  /* Parkett im Wohnen, Fliesen im Duschraum neben der Sauna, das Bad liegt oben: der Punkt steht an der Treppe, beim Öffnen kommt das Obergeschoß herunter */
  const fl0 = TW(482, 338), bt = TW(616, 461), bad0 = TW(764, 286, 1);
  anchor(inn, 'parkett', -1.0, .1, -3.0); anchor(inn, 'open', 3.45, 1.6, -1.55); anchor(inn, 'fliesen', fl0[0], .1, fl0[1]); anchor(inn, 'bad', bt[0], 1.9, bt[1]); anchor(inn, 'tuer', 1.41, 2.1, 4.81);
  anchor(up, 'bad-og', bad0[0], HT.eg + HT.slab + 1.05, bad0[1]);
  FOC.fliesen.cam.splice(3, 3, fl0[0], .3, fl0[1]); FOC.bad.cam.splice(3, 3, bad0[0], HT.eg + HT.slab + .25, bad0[1]);
  anchor(inn, 'lay-innen', 17, 3, 6);
  /* Rundgang der Ausstattung: Blick und Licht je Stelle (Entwurf lampP), auf die Räume von Free */
  const TOUR = [[8.62, FOC.fenster.cam, [.9, 2.2, -3.6]], [8.82, FOC.parkett.cam, [-1.0, 2.4, -3.0]], [9.02, FOC.fliesen.cam.map((v, j) => j === 2 ? v + 3 : v), [fl0[0], 2.4, fl0[1]]], [9.22, FOC.bad.cam.map((v, j) => j === 2 ? v + 3 : v), [bad0[0], HT.eg + HT.slab + 2.2, bad0[1]]]];

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
  /* Runde 53: Free hat die Sauna im Haus (Erdgeschoß, Nordwest), die Marke zeigt dorthin */
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
  /* Runde 53: der Faden geht außen ums Haus (Kunde: „die Linie schneidet das Haus“) und über das Dach des Erdgeschoßes hinauf zum Schlüssel */
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

  /* Budget und Gesamtkosten: jedes Teil des Projekts wird zum Block im Kostenturm (Garage von Free im Erdgeschoß, Südwest) */
  const cost = grp(root, 'cost'), cblk = [];
  [['haus', 8.4, C.weiss, [-1.8, 1.3]], ['garage', 2.6, C.kalk, [-6.1, 4.8]], ['zufahrt', 1.3, C.anth, [-6, 10.2]], ['garten', 2.0, C.salbei, [11.5, -9]]].forEach(([id, h, col, src]) => {
    const g = new T.Group(); cost.add(g); const geo = new T.BoxGeometry(5, h, 5); geo.translate(0, h / 2, 0);
    const m = new T.Mesh(geo, M(cost, col, { r: .85 })); m.castShadow = m.receiveShadow = true; g.add(m); g.add(new T.LineSegments(new T.EdgesGeometry(geo), LM(cost, id === 'zufahrt' ? C.kalk : C.schwarz, .4)));
    anchor(g, 'c-' + id, 5, h / 2, 2.5); cblk.push({ id, h, g, src }); });
  { let y = 0; cblk.forEach(c => { c.y = y; y += c.h + .08; }); const top = new T.Object3D(); top.position.set(20 + 5, y + .2, 2.5); cost.add(top); A['c-top'] = top; }
  cost.userData.blk = cblk;
  /* Open Space: wenige Lastenpunkte, Wände frei */
  const osp = grp(root, 'osp');
  { const wm = M(osp, 0xEAE8E3, { r: .9 }), cm = M(osp, 0xFFFFFF, { r: .7 });
    [[-3.1, -1.8], [-3.1, 3.4], [1.0, .9]].forEach(([x, z]) => { const c = new T.Mesh(new T.CylinderGeometry(.2, .2, 2.8, 24), cm); c.position.set(x, 1.4, z); c.castShadow = true; osp.add(c); });
    const walls = []; for (let i = 0; i < 4; i++) { const g = new T.BoxGeometry(1, 2.6, .12); g.translate(.5, 1.3, 0); const m = new T.Mesh(g, wm); m.castShadow = m.receiveShadow = true; if (i % 2) m.rotation.y = -Math.PI / 2; osp.add(m); walls.push(m); }
    osp.userData.walls = walls;
    osp.userData.L = [[[.95, 2.4, 4.65], [1.02, 2.4, 5.45], [-2.95, -1.5, 4.95], [2.0, -5.2, 3.7]], [[3.4, 2.4, 2.2], [1.02, 6.4, 1.45], [-2.95, -1.5, .9], [2.0, -5.2, .8]], [[-.6, 4.2, 3.2], [2.6, 4.2, 3.65], [3.0, -1.4, 2.6], [3.0, -5.2, 3.8]]]; }
  anchor(osp, 'osp', 1.0, 2.9, .9);

  /* Projektmanagement: Planblätter (Behörden, Kosten, Qualität, Termine) */
  const docs = grp(root, 'docs'), sheets = [];
  { const SW = 6.4, SH = 4.5, draw = [
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); x.strokeRect(w - 150, h - 60, 136, 46);
        const gx = 90, gy = h - 70; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + 300, gy); x.lineTo(gx + 300, gy - 80); x.lineTo(gx + 230, gy - 80); x.lineTo(gx + 230, gy - 120); x.lineTo(gx + 150, gy - 220); x.lineTo(gx + 70, gy - 120); x.lineTo(gx + 70, gy - 80); x.lineTo(gx, gy - 80); x.closePath(); x.stroke();
        x.lineWidth = 1; [[gx + 20, gy - 60, 40, 50], [gx + 120, gy - 70, 70, 60], [gx + 240, gy - 60, 40, 50], [gx + 120, gy - 175, 60, 45]].forEach(r => x.strokeRect(...r));
        x.beginPath(); x.moveTo(gx, gy + 20); x.lineTo(gx + 300, gy + 20); [gx, gx + 300].forEach(v => { x.moveTo(v, gy + 12); x.lineTo(v, gy + 28); }); x.stroke(); },
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); const g = ['#3a3a3a', '#555', '#707070', '#8a8a8a', '#a4a4a4', '#bdbdbd', '#d2d2d2'];
        g.forEach((c, i) => { x.fillStyle = c; x.fillRect(50, 50 + i * 36, 120 + i * 38, 26); }); x.fillStyle = '#111'; x.beginPath(); x.moveTo(470, 63); x.lineTo(440, 50); x.lineTo(440, 76); x.closePath(); x.fill(); x.fillRect(440, 60, 40, 6); },
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); const b = h - 90; x.beginPath(); x.moveTo(80, b); x.lineTo(430, b); x.moveTo(80, b); x.lineTo(255, b - 170); x.lineTo(430, b); x.moveTo(255, b - 170); x.lineTo(255, b); x.moveTo(167, b - 85); x.lineTo(255, b); x.lineTo(343, b - 85); x.stroke();
        x.lineWidth = 1; for (let i = 0; i < 7; i++) { const px = 110 + i * 48; x.beginPath(); x.moveTo(px, 40); x.lineTo(px, 70); x.moveTo(px - 6, 62); x.lineTo(px, 70); x.lineTo(px + 6, 62); x.stroke(); }
        x.setLineDash([5, 5]); x.beginPath(); x.moveTo(80, b + 30); x.quadraticCurveTo(255, b + 110, 430, b + 30); x.stroke(); },
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); x.lineWidth = 1; for (let i = 0; i < 9; i++) { const gx = 60 + i * 46; x.beginPath(); x.moveTo(gx, 40); x.lineTo(gx, h - 40); x.strokeStyle = '#c8c8c8'; x.stroke(); }
        x.strokeStyle = '#111'; [[0, 2], [1, 3], [2, 5], [4, 7], [6, 8]].forEach(([a, b2], i) => { x.fillStyle = i === 2 ? '#FFB200' : '#555'; x.fillRect(60 + a * 46, 60 + i * 50, (b2 - a) * 46, 22); });
        x.beginPath(); x.moveTo(60 + 5.4 * 46, 36); x.lineTo(60 + 5.4 * 46, h - 36); x.lineWidth = 2; x.stroke(); } ];
    draw.forEach((d, i) => { const t = tex((x, w, h) => { x.fillStyle = '#F4F3F0'; x.fillRect(0, 0, w, h); d(x, w, h); }, 512, 362);
      const top = M(docs, 0xffffff, { map: t, r: .9 }), side = M(docs, 0xE8E6E1, { r: .9 });
      const m = new T.Mesh(new T.BoxGeometry(SW, .04, SH), [side, side, top, side, side, side]); m.castShadow = m.receiveShadow = true; docs.add(m); sheets.push(m);
      anchor(m, 'doc' + i, SW / 2, .1, -SH / 2 + .4); }); }

  /* Innenarchitektur: Materialmuster fliegen auf Boden, Sofa, Bett und Wand von Free */
  const ia = new T.Group(); ia.name = 'ia'; root.add(ia);
  { const tg = [[TW(680, 340), .12], [TW(646, 291), .5], [TW(732, 617), .5], [TW(748, 408), 1.0]];
    const chips = [0xC9B79E, 0xD9CFBF, 0x8B907C, 0xCACACA].map((col, i) => {
      const m = new T.Mesh(new T.BoxGeometry(1.5, .14, 1.5), new T.MeshStandardMaterial({ color: col, roughness: .8, transparent: true, opacity: 0 })); m.castShadow = true; m.userData = { from: [-4.6 + i * 2.6, 7.2, 1.3], to: [tg[i][0][0], tg[i][1], tg[i][0][1]] }; ia.add(m); return m; });
    ia.userData = { chips }; anchor(ia, 'iaChips', 4.2, 7.4, 1.3); ia.visible = false; }

  /* Einstieg: Vitrine, Drehteller, Familie, Licht an der Haustür */
  const hero = { hdoor };
  { const vitr = grp(null, 'vitr'), vw = 12.6, vh = 11.4; wire(vitr, -vw, 0, -vw, vw, vh, vw, LM(vitr, 0xFFFFFF, .55));
    const pmv = BM(vitr, 0xFFFFFF, .03);
    [[0, -vw, 0], [0, vw, 0], [-vw, 0, 1], [vw, 0, 1]].forEach(([x, z, r]) => { const p = new T.Mesh(new T.PlaneGeometry(vw * 2, vh), pmv); p.position.set(x, vh / 2, z); p.rotation.y = r * Math.PI / 2; vitr.add(p); });
    const tp = new T.Mesh(new T.PlaneGeometry(vw * 2, vw * 2), pmv); tp.rotation.x = -Math.PI / 2; tp.position.y = vh; vitr.add(tp);
    hero.vitr = vitr; }
  { const tt = grp(pivot, 'tt'), g = new T.CylinderGeometry(12.8, 12.8, .34, 120), m = new T.Mesh(g, M(tt, 0x1c1c1b, { r: .55 })); m.position.y = -.18; m.receiveShadow = true; tt.add(m);
    const tk = []; for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, r0 = i % 10 ? 12.25 : 11.6; tk.push([Math.cos(a) * r0, .006, Math.sin(a) * r0, Math.cos(a) * 12.65, .006, Math.sin(a) * 12.65]); }
    segs(tt, tk, LM(tt, C.kalk, .5)); hero.tt = tt; }
  { const fam = new T.Group(); fam.name = 'fam'; root.add(fam);
    const person = (h, col, kid) => {
      const mat = new T.MeshStandardMaterial({ color: col, roughness: .78 });
      const g = new T.Group(), hipY = (kid ? .46 : .5) * h, shY = (kid ? .78 : .82) * h, hr = (kid ? .09 : .072) * h;
      const cap = (r, len) => { const q = new T.CapsuleGeometry(r, Math.max(.01, len - 2 * r), 6, 14); q.translate(0, -len / 2, 0); return q; };
      const part = (geo, parent) => { const m = new T.Mesh(geo, mat); m.castShadow = true; parent.add(m); return m; };
      const hip = new T.Group(); hip.position.y = hipY; g.add(hip);
      const tl = hipY * .52, sl = hipY - tl;
      const legs = [-1, 1].map(sd => { const th = new T.Group(); th.position.x = sd * .056 * h; hip.add(th); part(cap(.048 * h, tl + .03 * h), th); const kn = new T.Group(); kn.position.y = -tl; th.add(kn); part(cap(.039 * h, sl - .012 * h), kn);
        const ft = new T.Mesh(new T.BoxGeometry(.06 * h, .03 * h, .13 * h), mat); ft.position.set(0, -sl + .015 * h, .03 * h); ft.castShadow = true; kn.add(ft); return { th, kn }; });
      const tor = new T.Group(); hip.add(tor);
      { const len = shY - hipY + .08 * h, q = new T.CapsuleGeometry(.088 * h, len - .176 * h, 6, 16); q.translate(0, len / 2 - .04 * h, 0); const m = part(q, tor); m.scale.set(1.22, 1, .72); }
      const head = new T.Group(); head.position.y = shY - hipY + .035 * h + hr; tor.add(head); part(new T.SphereGeometry(hr, 20, 14), head);
      const ua = (kid ? .17 : .19) * h, fa = (kid ? .15 : .17) * h;
      const arms = [-1, 1].map(sd => { const sh = new T.Group(); sh.position.set(sd * .136 * h, shY - hipY - .025 * h, 0); tor.add(sh); part(cap(.03 * h, ua), sh); const el = new T.Group(); el.position.y = -ua; sh.add(el); part(cap(.026 * h, fa), el); return { sh, el }; });
      g.userData = { h, hip, hipY, legs, arms, tor, head, mat }; return g;
    };
    hero.figs = [[1.84, 0xE4E0D8, 0], [1.7, 0xD9D2C6, 0], [1.3, 0xECEAE5, 1], [1.02, 0xF2F0EB, 1]].map(([h, c, k]) => { const p = person(h, c, k); fam.add(p); return p; });
    hero.fam = fam; fam.visible = false; }
  { const fx = new T.Group(); fx.name = 'heroFx'; root.add(fx); const DX = -1.35;
    const glow = new T.Mesh(new T.PlaneGeometry(2.0, 2.5), new T.MeshBasicMaterial({ color: 0xFFD9AC, transparent: true, opacity: 0, fog: false })); glow.position.set(DX, 1.3, EZ1 - .9); fx.add(glow);
    const sc = document.createElement('canvas'); sc.width = 128; sc.height = 256; const x = sc.getContext('2d'); x.filter = 'blur(7px)';
    const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,214,166,1)'); gr.addColorStop(.35, 'rgba(255,214,166,.55)'); gr.addColorStop(1, 'rgba(255,214,166,0)'); x.fillStyle = gr;
    x.beginPath(); x.moveTo(42, 4); x.lineTo(86, 4); x.lineTo(122, 252); x.lineTo(6, 252); x.closePath(); x.fill();
    const st = new T.CanvasTexture(sc); st.colorSpace = T.SRGBColorSpace;
    const spill = new T.Mesh(new T.PlaneGeometry(2.8, 4), new T.MeshBasicMaterial({ map: st, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
    spill.rotation.x = -Math.PI / 2; spill.position.set(DX, .025, EZ1 + 2); fx.add(spill);
    const lamp = new T.PointLight(0xFFD2A0, 0, 14, 1.4); lamp.position.set(DX, 1.6, EZ1 + 1.2); fx.add(lamp);
    Object.assign(hero, { glow, spill, lamp }); }

  /* Zaun um das Grundstück, Lücke an der Zufahrt */
  const zaun = grp(root, 'zaun');
  { const X0 = -16.5, X1 = 16.5, Z0 = -12.5, Z1 = 12.5, Hz = 1.1, pmz = M(zaun, C.weiss, { r: .8 }), lm = LM(zaun, C.kalk, .9), posts = [], rails = [];
    const run = (a, b) => { const L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L2 / 2)); for (let i = 0; i <= n; i++) { const f = i / n; posts.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); }
      [.35, 1.0].forEach(y => rails.push([a[0], y, a[1], b[0], y, b[1]])); };
    [[[-1.1, Z1], [X1, Z1]], [[X1, Z1], [X1, Z0]], [[X1, Z0], [X0, Z0]], [[X0, Z0], [X0, Z1]], [[X0, Z1], [-9.6, Z1]]].forEach(([a, b]) => run(a, b));
    const pg = new T.BoxGeometry(.09, Hz, .09); pg.translate(0, Hz / 2, 0);
    zaun.userData.posts = posts.map(([x, z]) => { const m = new T.Mesh(pg, pmz); m.position.set(x, 0, z); m.castShadow = true; zaun.add(m); return m; });
    zaun.userData.rails = segs(zaun, rails, lm); anchor(zaun, 'zaun', X1, Hz, Z1); zaun.visible = false; }

  /* Energiefluss vom Dach ins Netz: von der Traufe im Südosten an der Hauswand hinab, zur Straße */
  const netz = grp(root, 'netz');
  { const P3 = [[5.3, 5.6, 8.6], [6.3, .12, 8.6], [6.3, .12, 13.2], [16, .12, 13.2]].map(v => new T.Vector3(...v)), segL = [], tot = [0];
    for (let i = 1; i < P3.length; i++) { segL.push(P3[i].distanceTo(P3[i - 1])); tot.push(tot[i - 1] + segL[i - 1]); }
    const path = u => { const d = u * tot[tot.length - 1]; let i = 0; while (i < segL.length - 1 && d > tot[i + 1]) i++; return P3[i].clone().lerp(P3[i + 1], (d - tot[i]) / segL[i]); };
    const line = new T.Line(new T.BufferGeometry().setFromPoints(P3), new T.LineBasicMaterial({ color: C.gelb, transparent: true, opacity: 0 })); netz.add(line);
    const dg = new T.BoxGeometry(.2, .2, .2), dots = Array.from({ length: 16 }, () => { const d = new T.Mesh(dg, new T.MeshBasicMaterial({ color: C.gelb, transparent: true, opacity: 0 })); netz.add(d); return d; });
    Object.assign(netz.userData, { line, dots, path }); anchor(netz, 'netz', 6.3, 1.2, 10.6); netz.visible = false; }

  ['cost', 'osp', 'docs'].forEach(n => { const g = root.getObjectByName(n); if (g) g.visible = false; });
  return { C, GAP, pivot, root, units, U: Object.fromEntries(units.map(u => [u.name, u])), A, front, check, scan, scanEdge, pts, ptsMesh, zones, gvol, deck, up, roof, dim, glasM, lamps, roofIns, zeich, zUp, zInt, life, larchM, roofM, deckM, softM, crownMat: gar.userData.crown, wallx, wxL, wallIn: WI, moist, mph, ghostH, pm, spine, thread, threadGeo, key, many, mA, mB, mC, cells, catcher, au, cost, osp, docs, sheets, ia, hero, zaun, pvA, netz, TOUR };
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
  const S = buildScene(HWd), H = S.hero;
  const HC = new T.Vector3(-1.8, 0, 1.3);
  S.pivot.position.copy(HC); S.root.position.copy(HC).multiplyScalar(-1);
  scene.add(S.pivot, S.many, S.catcher);
  H.vitr.position.copy(HC); scene.add(H.vitr);
  { const pg = new T.PMREMGenerator(R), es = new T.Scene(), sg = new T.SphereGeometry(50, 48, 24), col = [], p = sg.attributes.position, c = new T.Color();
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 50; if (y > .05) c.setRGB(.55 + .35 * y, .6 + .33 * y, .66 + .3 * y); else if (y > -.08) c.setRGB(.42, .45, .48); else c.setRGB(.05, .05, .05); col.push(c.r, c.g, c.b); }
    sg.setAttribute('color', new T.Float32BufferAttribute(col, 3)); es.add(new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    const env = pg.fromScene(es, .02).texture; scene.traverse(o => { if (o.material && o.material.userData && o.material.userData.glass) { o.material.envMap = env; o.material.envMapIntensity = 1.5; } }); pg.dispose(); }
  const hemi = new T.HemisphereLight(0xffffff, 0x2a2a2a, 1.7); scene.add(hemi);
  const sun = new T.DirectionalLight(0xffffff, 2.3); sun.position.set(-26, 42, 20); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 }); sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
  scene.add(sun, sun.target);
  const fill = new T.DirectionalLight(0xffffff, .9); fill.position.set(34, 18, 30); scene.add(fill);
  const rim = new T.DirectionalLight(0xffffff, .4); rim.position.set(20, 10, -34); scene.add(rim);
  const spot = new T.SpotLight(0xffffff, 0, 0, .42, .8, 0); spot.position.set(HC.x + 6, 38, HC.z + 12); spot.target = S.pivot; scene.add(spot);

  const cl = t => Math.max(0, Math.min(1, t)), sm = t => (t = cl(t), t * t * (3 - 2 * t));
  /* Kamera: [P, Azimut, Höhe, Abstand, Ziel x, y, z], wie im Entwurf */
  const K = [
    [0, 32, 14, 70, -1, 4.4, 1.3], [.44, 26, 12, 62, -1, 4.2, 1.3], [.74, 10, 7, 48, -3.4, 3, 6], [.98, 4, 7, 42, -3.6, 2.6, 9.4],
    [1.36, 14, 6, 28, -2.9, 1.9, 9.4], [1.54, 32, 22, 54, -1, 1.5, 3], [1.95, 54, 40, 82, 1.5, 0, -.5],
    [2.6, 36, 30, 84, 0, 0, 1], [3.3, 40, 12, 196, 0, 34, 0], [3.9, 47, 14, 190, 0, 34, 0],
    [4.4, 18, 50, 92, 0, 0, 1], [4.9, 6, 56, 88, 0, 0, 1],
    [5.2, 0, 68, 104, -6, 0, 1], [5.27, 8, 50, 104, 6, 2, 0], [5.42, 18, 26, 90, 15, 4.5, 0], [5.5, 22, 26, 90, 15, 4.5, 0], [5.62, 30, 32, 72, -1.5, 3, 1.3], [5.73, 38, 30, 70, -1.5, 3, 1.3], [5.8, 16, 72, 64, 0, 0, 1.3], [5.87, 24, 70, 62, 0, 0, 1.3], [5.93, 18, 26, 90, 15, 4.5, 0], [5.99, 24, 24, 88, 15, 4.5, 0],
    [6.35, 22, 12, 60, -1.8, -.6, 1.3], [6.9, 34, 15, 56, -1.8, -.6, 1.3],
    [7.2, 34, 20, 78, 0, 4.4, 1.3], [7.95, 52, 19, 76, 0, 4.4, 1.3],
    [8.35, 50, 58, 54, 0, .5, 1.3], [8.9, 68, 54, 50, 0, .5, 1.3],
    [9.35, 30, 34, 90, 1, 0, 0], [9.9, 12, 30, 86, 1, 0, 0],
    [10.3, 22, 24, 104, 0, 5, 0], [10.48, 40, 25, 100, 0, 5, 0], [10.62, 18, 14, 50, -3.5, 1.4, 8.5], [10.76, 30, 11, 34, -3.6, 1.2, 10], [10.95, 46, 12, 32, -3.4, 1.2, 9.6],
    [11.35, 45, 42, 330, 0, 0, 0], [11.85, 54, 50, 270, 0, 0, 0], [12, 56, 34, 112, 0, 3, 0]
  ];
  const lerpK = (KK, P) => { let i = 0; while (i < KK.length - 2 && P >= KK[i + 1][0]) i++; const a = KK[i], b = KK[i + 1], f = sm((P - a[0]) / (b[0] - a[0])); return a.map((v, j) => v + (b[j] - v) * f); };
  /* Seite P → Bild-P wie im Entwurf: Teile der Planung (5 bis 6) zeigen eigene Stellen, Bauen und Leben springen zu ihren Szenen */
  const PL = [[5, 5.19, 5, 5.25], [5.19, 5.38, 5.25, 5.5], [5.38, 5.571, 5.5, 5.75], [5.571, 5.666, 5.75, 5.875], [5.666, 5.905, 9.5, 10], [5.905, 6, 5.875, 6]];
  const remapP = p => { if (p >= 5 && p < 6) { const g = PL.find(q => p < q[1]) || PL[PL.length - 1]; return g[2] + (p - g[0]) / (g[1] - g[0]) * (g[3] - g[2]); }
    return p >= 6 && p < 6.5 ? p + 1 : p >= 6.5 && p < 7.5 ? p - .5 : p >= 7.5 && p < 8 ? p + 2.5 : p >= 8 && p < 9 ? 7.5 : p >= 9 && p < 10 ? p - .5 : p >= 10 && p < 10.5 ? 10.5 : p; };
  const warp = p => p < 6 ? p : p < 7 ? 6 : p < 7.5 ? 6 + (p - 7) * 2 : p < 9.5 ? p - .5 : p < 10 ? 8.92 : p < 10.1 ? 8.92 + (p - 10) * 9.8 : p < 10.5 ? 9.9 + (p - 10.1) * 1.5 : p;
  const NK = [[6.0, 24, 50, 50, 1, 0, 2], [6.45, 38, 54, 44, 1, 0, 2], [7.0, 50, 50, 46, 1, 0, 2]];
  /* Runde 54/55 (Telefon): die Kamera geht je Stelle so weit weg, dass das Bild in die Bühne über dem Text passt (Faktor auf den Abstand,
     bei einer Bühne von 40 % der Höhe) */
  const NZ = [
    [0, 1.6], [.44, 1.7], [.74, 2.1], [1.36, 2.1], [1.54, 1.8], [1.95, 1.6], [2.6, 2.15], [3.1, 1.95], [3.3, 2.5], [3.9, 2.5],
    [4.4, 2.2], [4.9, 2.1], [5.2, 2.05], [5.27, 1.85], [5.5, 1.8], [5.62, 2.0], [5.73, 2.0], [5.8, 1.85], [5.87, 1.85], [5.93, 1.8], [5.99, 1.8],
    [6.35, 1.9], [6.9, 1.9], [7.2, 1.6], [7.95, 1.6], [8.35, 1.55], [8.9, 1.55], [9.35, 1.5], [9.9, 1.5],
    [10.3, 1.2], [10.48, 1.2], [10.62, 1.85], [10.95, 1.85], [11.35, 1.0], [12, 1.0]
  ];
  const nzAt = P => lerpK(NZ, P)[1];
  const AU = ['terrasse', 'carport', 'pool', 'sauna', 'garten'], ks = (k, a, b) => sm((k - a) / (b - a));
  const ang = (a, b, k) => { const d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
  const walk = (pts, k) => { const sl = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); sl.push(l); tot += l; }
    const at = d => { d = Math.max(0, Math.min(tot, d)); for (let i = 0; i < sl.length; i++) { if (d <= sl[i] || i === sl.length - 1) { const f = sl[i] ? Math.min(1, d / sl[i]) : 0, a = pts[i], b = pts[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; } d -= sl[i]; } return pts[pts.length - 1]; };
    const d = tot * cl(k), p = at(d), q = at(d + .5), p0 = at(d - .5); return { x: p[0], z: p[1], d, h: Math.atan2(q[0] - p0[0], q[1] - p0[1]) }; };
  const pose = (f, x, z, hd, d, a, i, t) => { const u = f.userData, ph = d / (u.h * .8) * Math.PI * 2;
    f.position.set(x, 0, z); f.rotation.y = hd;
    u.legs.forEach((l, j) => { const p = ph + j * Math.PI; l.th.rotation.x = -Math.sin(p) * .42 * a; l.kn.rotation.x = a * (.06 + .66 * Math.max(0, Math.cos(p))); });
    u.arms.forEach((r, j) => { const p = ph + j * Math.PI; r.sh.rotation.x = Math.sin(p) * .36 * a; r.sh.rotation.z = (j ? -1 : 1) * .06; r.el.rotation.x = -.14 - .26 * a; });
    u.hip.position.y = u.hipY + (Math.abs(Math.cos(ph)) - .6) * .024 * u.h * a + (1 - a) * Math.sin(t * 1.3 + i) * .002 * u.h;
    u.tor.rotation.x = .05 * a; u.head.rotation.y = (1 - a) * Math.sin(t * .37 + i * 1.7) * .32; u.head.rotation.x = (1 - a) * (u.h < 1.4 ? -.12 : 0); };
  /* Wege der Familie: vor der Haustür von Free (0,7 m östlich der Tür im Entwurf), hinein, dann durch die Schiebetür auf die Terrasse,
     um Sofa, Tisch und Stühle von Free herum */
  const FA = { f2: [[-2.4, 14.4], [-.2, 14.3], [-1.6, 13.7], [-.85, 13.95]], b3d: [.05, .08, 0, .025],
    in3: [[-1.6, 9.7], [-1.0, 9.8], [-1.4, 9.3], [-1.2, 9.5]],
    b4: [[[-.2, -4.7], [-.4, -6.6], [-.2, -8.6]], [[1.2, -4.7], [1.2, -6.5], [1.5, -8.0]], [[3.0, -4.7], [3.0, -5.85], [4.4, -5.95], [6.5, -6.1], [7.6, -4.3]], [[.5, -4.7], [.6, -6.4], [2.0, -9.2]]],
    fh4: [Math.PI / 2, Math.atan2(-1, -.5), Math.PI / 2, .5] };
  const IM = new T.Matrix4(), tmp = new T.Vector3(), dummy = new T.Object3D(), SET = { focus: null, fk: 0, fx: { roof: 0, wall: 0, dims: 0, og: 0 }, flow: 0, lastCam: null, P: cfg.P || 0, tP: cfg.P || 0, hover: -1, mx: 0, my: 0, tmx: 0, tmy: 0, w: 0, h: 0, alive: 1, raf: 0, cb: 0 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setOp = (g, o) => {
    g.visible = o > .004;
    g.userData.mats.forEach(m => { const v = m.userData.base * o; m.opacity = v; m.transparent = v < .999; m.depthWrite = v > .55; });
    const sh = o > .6; if (g.userData.sh !== sh) { g.userData.sh = sh; g.traverse(c => { if (c.isMesh && !c.isInstancedMesh) c.castShadow = sh; }); }
  };

  /* Marken (Entwurf): Ebenen des Überblicks, Schilder, Punkte im Haus. Ebenen und Punkte sind Knöpfe. Runde 55: jede Marke hat einen
     eigenen Schlüssel (Feld in Framer) und zeigt auf einen Anker (a) */
  const LABELS = (cfg.labels || []).map(L => {
    const big = L.kind === 'layer', hot = L.kind === 'hot', btn = big || hot, a = L.a || L.id;
    const el = document.createElement(btn ? 'button' : 'div');
    if (btn) { el.type = 'button'; el.tabIndex = -1; el.setAttribute('aria-label', L.t + (L.s ? '. ' + L.s : '')); } else el.setAttribute('aria-hidden', 'true');
    el.className = 'svf-m3' + (hot ? ' svf-m--hot' : big ? ' svf-m--lay3' : ''); el.dataset.id = L.id;
    el.style.cssText = 'position:absolute;left:0;top:0;display:flex;align-items:center;gap:12px;opacity:0;will-change:transform,opacity;white-space:nowrap;pointer-events:none;color:#fff;margin:0;padding:0;border:0;background:none;font:inherit;text-align:left;-webkit-tap-highlight-color:transparent';
    el.innerHTML = (hot ? `<span style="flex:none;width:32px;height:32px;margin:-8px;display:grid;place-items:center"><span style="width:16px;height:16px;box-sizing:border-box;border:1px solid currentColor;border-radius:50%;display:grid;place-items:center"><span style="width:5px;height:5px;border-radius:50%;background:currentColor"></span></span></span>` : `<span style="flex:none;width:${big ? 28 : 16}px;height:1px;background:currentColor"></span>`) + `<span style="position:relative;display:grid;gap:3px;${big ? '' : 'background:#000;padding:6px 9px 7px;'}"><span style="font-family:var(--font-${big ? 'display' : 'text'});font-weight:500;font-size:${big ? 'clamp(13px,1.05vw,17px)' : '11px'};letter-spacing:${big ? '.06em' : '.2em'};text-transform:uppercase">${L.t}</span>${L.s ? `<span style="font-family:var(--font-text);font-size:${big ? '13px' : '11px'};letter-spacing:${big ? '0' : '.2em'};${big ? '' : 'text-transform:uppercase;'}color:#CACACA">${L.s}</span>` : ''}${L.strike ? '<span data-ls="1" style="position:absolute;left:6px;right:6px;top:50%;height:2px;margin-top:-1px;background:#FFFFFF;transform:scaleX(0);transform-origin:left center"></span>' : ''}</span>`;
    const e = LAYER_E[a];
    if (big) {
      el.style.cursor = 'pointer';
      el.addEventListener('pointerenter', () => SET.hover = e);
      el.addEventListener('pointerleave', () => SET.hover = -1);
      el.addEventListener('click', () => cfg.onJump && cfg.onJump(L.jump));
    }
    if (hot) { el.style.cursor = 'pointer'; el.addEventListener('click', ev => { ev.stopPropagation(); cfg.onHot && cfg.onHot(L.hot || L.id); }); }
    lab.appendChild(el);
    return { ...L, a, hot: hot ? (L.hot || L.id) : null, e: e ?? -1, el, big, ls: el.querySelector('[data-ls]') };
  });

  const resize = () => {
    const r = host.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    if (w === SET.w && h === SET.h) return; SET.w = w; SET.h = h;
    R.setSize(w, h, false); cam.aspect = w / h;
    const narrow = w < 900; SET.narrow = narrow; SET.offX = null;
  };
  /* Runde 55: am Desktop wie im Entwurf um 17 % der Breite nach rechts, weg vom Text. Am Telefon steht das Bild in der Bühne */
  const offset = P => {
    const w = SET.w, h = SET.h, ox = SET.narrow ? 0 : -w * .17;
    const oy = SET.narrow ? h / 2 - (SET.stT + SET.stB) / 2 : 0;
    if (SET.offX !== null && Math.abs(ox - SET.offX) < .5 && Math.abs(oy - SET.offY) < .5) return;
    SET.offX = ox; SET.offY = oy; cam.setViewOffset(w, h, ox, oy, w, h); cam.updateProjectionMatrix();
  };
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
    const PR = SET.P, PN = remapP(PR), P = warp(PN), t = (performance.now() - t0) / 1000, ease = reduce ? 1 : .06;
    const s = (a, b) => sm((P - a) / (b - a)), sN = (a, b) => sm((PN - a) / (b - a)), sP = (a, b) => sm((PR - a) / (b - a));
    stageEase(); offset(P);
    const bk = PR >= 8 && PR < 9 ? PR - 8 : -1, bq = (a, w) => bk < 0 ? 0 : sm((bk - a) / w), bRoof = bq(.1, .14) * (1 - bq(.88, .08)), bDeck = bq(.28, .14) * (1 - bq(.88, .08)), bWall = bq(.5, .08) * (1 - bq(.8, .06)), bDims = bq(.79, .05) * (1 - bq(.93, .05));
    const ek = PR >= 10 && PR < 10.5 ? (PR - 10) * 2 : -1, eq = (a, w) => ek < 0 ? 0 : sm((ek - a) / w);
    const autoWall = Math.max(bWall, sN(7.56, 7.64) * (1 - sN(7.92, 8.0))), autoDims = Math.max(bDims, sN(8.03, 8.09) * (1 - sN(8.19, 8.25))), autoDeck = Math.max(bDeck, sm(sN(8.18, 8.24) * (1 - sN(8.31, 8.37)))), autoRoof = Math.max(bRoof, sN(8.31, 8.37) * (1 - sN(8.46, 8.53)));
    const wI = sN(8.5, 8.6) * (1 - sN(9.38, 9.5)); SET.cur = wI > .5 ? HOTS[PN < 8.72 ? 0 : PN < 8.92 ? 1 : PN < 9.12 ? 2 : 3] : null;

    /* Kamera */
    const ft = SET.focus ? 1 : 0; SET.fk += (ft - SET.fk) * ease;
    ['roof', 'wall', 'dims', 'og'].forEach(k => { const fo = SET.focus && SET.focus.fx && SET.focus.fx[k] ? 1 : 0, au = k === 'wall' ? autoWall : k === 'dims' ? autoDims : k === 'roof' ? autoRoof : (!SET.focus && SET.cur === 'bad' ? 1 : 0);
      SET.fx[k] += (Math.max(fo, au) - SET.fx[k]) * (reduce ? 1 : .07); });
    { const fl = SET.focus ? LOW.includes(SET.focus.id) : (SET.cur && LOW.includes(SET.cur)); SET.flow += ((fl ? 1 : 0) - SET.flow) * ease; }
    if (SET.focus) SET.lastCam = SET.focus.cam;
    const c = lerpK(K, P);
    { const wN = sN(5.97, 6.07) * (1 - sN(6.98, 7.1)); if (wN > 0) { const n = lerpK(NK, Math.max(6, Math.min(7, PN))); for (let j = 1; j < 7; j++) c[j] += (n[j] - c[j]) * wN; } }
    { const wa = sm(autoWall), wc = [0, 28, 13, 34, 1.6, 1.6, 8.5]; if (wa > 0 && !SET.focus) for (let j = 1; j < 7; j++) c[j] += (wc[j] - c[j]) * wa; }
    let lampP = null;
    { const tour = (w, st) => { if (w <= 0 || SET.focus) return null; const p = Math.max(st[0][0], Math.min(st[st.length - 1][0], PN)); let i = 0; while (i < st.length - 2 && p >= st[i + 1][0]) i++; const a = st[i], b = st[i + 1], f = sm((p - a[0]) / (b[0] - a[0]));
        for (let j = 1; j < 7; j++) { const v = a[1][j - 1] + (b[1][j - 1] - a[1][j - 1]) * f; c[j] += (v - c[j]) * w; } return a[2] ? a[2].map((v, j) => v + (b[2][j] - v) * f) : null; };
      tour(sm(sN(8.0, 8.08) * (1 - sN(8.46, 8.56))), [[8.1, [30, 12, 40, 3, 1.6, 8.15]], [8.24, [40, 14, 46, 0, 3.6, 3]], [8.4, [62, 24, 52, -1, 6.5, 4.5]]]);
      tour(sm(sN(9.5, 9.56) * (1 - sN(9.98, 10.06))), [[9.52, [58, 60, 50, 0, .5, 1.3]], [10.0, [84, 52, 46, 0, .5, 1.3]]]);
      lampP = tour(sm(wI), S.TOUR); }
    { const key = (w, kk, x) => { if (w <= 0 || SET.focus) return; const v = lerpK(kk, x); for (let j = 1; j < 7; j++) c[j] += (v[j] - c[j]) * w; };
      key(bk < 0 ? 0 : sm(cl(bk / .05)) * (1 - sm(cl((bk - .95) / .05))), [[0, 34, 16, 66, 0, 3.5, 1.3], [.36, 46, 20, 72, 0, 7, 1.3], [.5, 40, 16, 56, 1, 5, 4], [.66, 28, 13, 34, 1.6, 1.6, 8.5], [.84, 30, 12, 40, 3, 1.6, 8.15], [1, 36, 16, 62, 0, 3.5, 1.3]], Math.max(0, bk));
      key(ek < 0 ? 0 : sm(cl(ek / .08)) * (1 - sm(cl((ek - .92) / .08))), [[0, 62, 24, 64, 1, 4, 2], [.5, 78, 30, 56, 2, 5, 3], [1, 70, 18, 70, 5, 3, 6]], Math.max(0, ek)); }
    if (SET.fk > .001 && SET.lastCam) { const fk = sm(SET.fk), fc = SET.lastCam; for (let j = 1; j < 7; j++) c[j] = c[j] + (fc[j - 1] - c[j]) * fk; }
    if (SET.cPrev && Math.abs(PN - SET.pnPrev) > .3 && !reduce) { SET.cFrom = SET.cPrev.slice(); SET.cb = 1; }
    if (SET.cb > .002) { const k = sm(SET.cb); for (let j = 1; j < 7; j++) c[j] += (SET.cFrom[j] - c[j]) * k; SET.cb *= .93; }
    SET.cPrev = c.slice(); SET.pnPrev = PN;
    let az = c[1], el = c[2], d = c[3];
    /* Runde 54/55: am Telefon je Stelle so weit weg, dass das Bild in die Bühne über dem Text passt */
    if (SET.narrow) {
      let nz = nzAt(P);
      if (bk >= 0) nz = 2.0; else if (ek >= 0) nz = 1.75; else if (PN >= 9.48 && PN < 10.06) nz = 2.0; else if (PN > 5.97 && PN < 7.1) nz = 1.6;
      if (wI > 0) nz += (1.8 - nz) * sm(wI);
      nz += (1.8 - nz) * sm(SET.fk);
      const phi = (SET.stB - SET.stT) / SET.h; d *= nz * Math.max(.6, Math.min(1.6, .4 / Math.max(.05, phi)));
    }
    if (!reduce) { az += Math.sin(t * .11) * 1.6 + SET.mx * 2.6; el += Math.sin(t * .08) * .8 - SET.my * 1.4; }
    const Az = az * Math.PI / 180, E = el * Math.PI / 180;
    cam.position.set(c[4] + d * Math.cos(E) * Math.sin(Az), c[5] + d * Math.sin(E), c[6] + d * Math.cos(E) * Math.cos(Az));
    cam.lookAt(c[4], c[5], c[6]);
    scene.fog.near = d * .7; scene.fog.far = d * 2.6;

    /* Haus: Wände auf 1 m, wenn ein Raum im Fokus ist (oder im Rundgang der Ausstattung) */
    { const lo = sm(SET.flow), ex = 1 - lo, cut = CUT0 + (1 - CUT0) * lo;
      if (lo < .002) { if (HWd.S.ext !== 1 || HT.cut !== CUT0) { HWd.S.ext = 1; HT.cut = CUT0; HWd.apply(); } }
      else if (Math.abs(ex - HWd.S.ext) > .002 || Math.abs(cut - HT.cut) > .002) { HWd.S.ext = ex; HT.cut = cut; HWd.apply(); } }

    /* Drehteller: das Haus als Produkt, dann Abend */
    let sp = (t * .32) % (Math.PI * 2); if (sp > Math.PI) sp -= Math.PI * 2;
    S.pivot.rotation.y = reduce ? 0 : sp * (1 - s(.42, .68));
    const prodK = 1 - s(.44, .7), dusk = s(.56, .86) * (1 - s(1.46, 1.8));
    sun.intensity = 2.3 * (1 - .35 * prodK - .55 * dusk); hemi.intensity = 1.7 * (1 - .4 * prodK - .5 * dusk); fill.intensity = .9 * (1 - .6 * dusk); spot.intensity = 2.6 * prodK;
    S.catcher.visible = P < 2.5;

    /* Einheiten: zusammensetzen, explodieren, schweben, landen */
    const expK = s(3.0, 3.5), ov = s(3.2, 3.5) * (1 - s(3.9, 4.1));
    S.units.forEach(u => {
      const { e, landP, delay } = u.userData;
      const ai = AU.indexOf(u.name);
      /* Runde 55: das Innere von Free ist von Anfang an da (die Familie geht hinein, durch das Glas sieht man die Räume) */
      const appear = u.name === 'huelle' || u.name === 'innen' ? 1 : u.name === 'plan' ? s(2.95, 3.25) : u.name === 'grund' ? s(.5, .62) : ai >= 0 ? s(1.48 + ai * .06, 1.62 + ai * .06) : s(2 + delay * 2, 2.35 + delay * 2);
      if (u.name === 'grund') { const g = Math.max(.001, s(.48, .86)); u.scale.set(g, 1, g); }
      const ghost = e === 0 ? 0 : s(3.95, 4.35) * (1 - s(landP - .5, landP - .08));
      const land = 1 - s(landP - .5, landP - .08);
      u.position.y = S.GAP * e * Math.min(expK, land) + 5 * ghost - (ai >= 0 ? 1.8 * (1 - appear) : 0);
      let o = appear * (1 - ghost);
      if ((u.name === 'huelle' || u.name === 'fund') && ((PN > 4.92 && PN < 5.32) || (PN > 5.86 && PN < 6.05 && PR < 6))) { const k = PN < 5.5 ? sN(4.94, 5.02) * (1 - sN(5.24, 5.3)) : sN(5.88, 5.93) * (1 - sN(5.99, 6.04)); u.position.y = 5 * ghost * (1 - k); o = Math.max(o, k); }
      if (u.name === 'carport') { const inW = PN > 7.1 && PN < 7.56 && PR < 6.5, k = inW ? sN(7.18, 7.24) * (1 - sN(7.46, 7.52)) : 0; if (inW) { u.position.y = -1.8 * (1 - k); o = k; }
        if (u.userData.hl === undefined) u.userData.hl = u.userData.mats.find(m => m.color && m.color.getHex() === 0x55534f) || null;
        const hm = u.userData.hl; if (hm) { if (!hm.userData.c0) { hm.userData.c0 = hm.color.clone(); hm.userData.c1 = new T.Color(0xCACACA); } hm.color.copy(hm.userData.c0).lerp(hm.userData.c1, k); } }
      if (ai >= 0 && PN > 4.96 && PN < 5.3) { const ord = [1, 0, 2, 3, 4][ai], k = sN(5.02 + ord * .03, 5.07 + ord * .03), out = 1 - sN(5.23, 5.28); u.position.y = -1.8 * (1 - k); o = k * out; }
      if (SET.hover !== -1 && !(Array.isArray(SET.hover) ? SET.hover.includes(e) : e === SET.hover)) o *= 1 - .78 * ov;
      if (u.name === 'innen' && PN > 7.9 && PN < 8.6) o *= sN(8.46, 8.53);
      u.userData.op = o; setOp(u, o);
    });
    const U = S.U;

    /* Machbarkeit */
    const ck = s(4.12, 4.3) * (1 - s(4.95, 5.15)); setOp(S.check, ck * U.grund.userData.op);
    const sx = -16 + 32 * s(4.25, 4.85); S.scan.position.x = sx; S.scanEdge.position.x = sx;
    if (ck > 0) { S.pts.forEach(([x, z], i) => { const k = cl((sx - x) / 2.5); dummy.position.set(x, .1 + .12 * k, z); dummy.scale.setScalar(Math.max(.001, k)); dummy.updateMatrix(); S.ptsMesh.setMatrixAt(i, dummy.matrix); }); S.ptsMesh.instanceMatrix.needsUpdate = true; }

    /* Projektplan im Überblick */
    S.zones.forEach(z => { const zv = P < 4.6 ? 1 : 1 - s(4.9, 5.0); setOp(z, U.plan.userData.op * zv * (1 - s(5.24, 5.29))); });

    /* Entwurfsplanung: Zeichnung, die Innenwände gehen für Open Space */
    setOp(S.zeich, sN(5.5, 5.56) * (1 - sN(5.87, 5.91))); S.zUp.scale.y = Math.max(.001, sN(5.54, 5.68) * (1 - sN(5.74, 5.82))); S.zUp.visible = S.zUp.scale.y > .02; S.zInt.visible = P < 5.78;

    /* Budget, Gesamtkosten und Open Space */
    { const fin = PN > 5.8, co = fin ? (PR < 6 ? sN(5.9, 5.92) * (1 - sN(5.99, 6.04)) : 0) : sN(5.26, 5.28) * (1 - sN(5.52, 5.56)); setOp(S.cost, co);
      if (co > .004) S.cost.userData.blk.forEach((cb, i) => { const a0 = 5.265 + i * .03, k1 = fin ? sN(5.905 + i * .014, 5.925 + i * .014) : sN(a0, a0 + .018), k2 = fin ? 1 : sN(a0 + .018, a0 + .05);
        const x = cb.src[0] + (20 - cb.src[0]) * k2, z = cb.src[1] + (0 - cb.src[1]) * k2, y = cb.y * k2 + Math.sin(Math.PI * k2) * 7;
        cb.g.position.set(x - 2.5, y, z - 2.5); cb.g.scale.set(1, Math.max(.001, k1), 1); cb.g.visible = k1 > .01; }); }
    { const oo = sN(5.76, 5.8) * (1 - sN(5.87, 5.9)); setOp(S.osp, oo);
      if (oo > .004) { const Lw = S.osp.userData.L, ab = s(5.8, 5.83), bc = s(5.84, 5.87), upk = Math.max(.001, s(5.76, 5.79));
        S.osp.userData.walls.forEach((w, i) => { const A0 = Lw[0][i], B0 = Lw[1][i], C0 = Lw[2][i], v = j => A0[j] + (B0[j] - A0[j]) * ab + (C0[j] - B0[j]) * bc;
          w.position.set(v(0), 0, v(1)); w.scale.set(Math.max(.001, v(2)), upk, 1); }); } }

    /* Fundament: Schnitt durch das Gelände */
    const cut = s(6.0, 6.3) * (1 - s(6.85, 7.05));
    S.front.position.z = 20 * cut; S.front.position.y = -1.5 * cut; setOp(S.front, U.grund.userData.op * (1 - cut * .9));

    /* Hülle und Innen: das offene Haus (Puppenhaus), Bad mit dem Obergeschoß zurück auf dem Haus */
    const hl = SET.fx.roof, doll = Math.max(s(7.95, 8.22) * (1 - s(8.82, 9.05)), sN(8.45, 8.6) * (1 - sN(9.92, 10.04)));
    const dg = doll * (1 - sm(SET.fx.og));
    S.deck.position.set(-16 * dg, .5 * hl + 5 * dg, -18 * dg); S.up.position.set(-16 * dg, 1.1 * hl + 6.5 * dg, -18 * dg); S.roof.position.set(-16 * doll, 3 * hl + 8.5 * doll, -18 * doll); S.roofIns.position.set(0, 1.5 * hl, 0); setOp(S.roofIns, U.huelle.userData.op * SET.fx.roof * (1 - doll));
    if (autoDeck > 0) { S.up.position.y += 2.6 * autoDeck; S.roof.position.y += 2.6 * autoDeck; }
    S.roof.position.y += 2.4 * bRoof;
    if (!K0) K0 = { crown: S.crownMat.color.clone(), w: new T.Color(0xF4F4F2), sal: new T.Color(0x8B907C), kup: new T.Color(0x887254), grey: new T.Color(0x9b9891), wood: new T.Color(0xC9AA82), tmp: new T.Color() };
    S.deckM.forEach(m => m.color.copy(m.userData.c0).lerp(K0.wood, autoDeck));
    setOp(S.dim, U.huelle.userData.op * SET.fx.dims);
    const wx = SET.fx.wall; setOp(S.wallx, U.huelle.userData.op * Math.min(1, wx * 3));
    { let z = S.wallIn + .38; S.wxL.forEach((g, i) => { g.position.z = S.wallIn + (z - S.wallIn + i * .46) * wx; z += g.userData.th; }); }
    const mo = sm((SET.fx.wall - .6) / .4); S.moist.visible = mo > .01; S.moist.material.opacity = .85 * mo;
    if (mo > .01) { const a = S.moist.geometry.attributes.position.array, span = 4.6; S.mph.forEach(([x, y, ph, sp2], i) => { const k = Math.sin(t * sp2 + ph) * .5 + .5; a[i * 3] = x; a[i * 3 + 1] = y + Math.sin(t * .7 + ph) * .08; a[i * 3 + 2] = S.wallIn - .5 + k * span * wx; }); S.moist.geometry.attributes.position.needsUpdate = true; }
    const gh = SET.fx.dims; setOp(S.ghostH, U.huelle.userData.op * gh); S.ghostH.position.y = 2.84 - .22 * sm((gh - .3) / .7);
    const warm = Math.max(s(8.2, 8.5) * (1 - .55 * s(11.0, 11.3)), s(.56, .86) * (1 - s(2.2, 2.6)) * .9, wI, sN(9.5, 9.52) * (1 - sN(9.98, 10.04)));
    if (lampP && wI > .01) S.lamps[0].position.set(...lampP); else S.lamps[0].position.set(1.6, 2.4, -2.6);
    /* Innenarchitektur: Materialmuster, Stoffe werden salbeigrün */
    { const on = PN > 9.48 && PN < 10.06, ud = S.ia.userData; S.ia.visible = on;
      const sk = sN(9.7, 9.76) * (1 - sN(10.0, 10.06)); S.softM.forEach(m => m.color.copy(m.userData.c0).lerp(K0.sal, sk));
      if (on) ud.chips.forEach((m, i) => { const ap = sN(9.53 + i * .025, 9.58 + i * .025), dr = sN(9.62 + i * .03, 9.68 + i * .03), f = m.userData.from, to = m.userData.to;
        m.position.set(f[0] + (to[0] - f[0]) * dr, f[1] + (to[1] - f[1]) * dr + (1 - ap) * 1.5 + Math.sin(Math.PI * dr) * 1.2, f[2] + (to[2] - f[2]) * dr); m.rotation.y = (1 - dr) * .25 * Math.sin(t * .5 + i);
        const o = ap * (1 - ks(dr, .82, 1)); m.material.opacity = o; m.visible = o > .01; }); }
    /* Garten: die Bäume wachsen im Einstieg */
    { const gc = S.U.garten.children; for (let i = 0, j = 0; i + 1 < gc.length; i += 2, j++) { const tr = gc[i], cr = gc[i + 1]; if (!tr.geometry || tr.geometry.type !== 'CylinderGeometry') break; if (tr.userData.s0 == null) tr.userData.s0 = tr.scale.x;
      const s0 = tr.userData.s0, k = Math.max(.001, s(1.72 + j * .022, 1.86 + j * .022)); tr.scale.set(s0, s0 * k, s0); tr.position.y = 1.2 * s0 * k; cr.scale.setScalar(s0 * k); cr.position.y = 3.4 * s0 * k; } }
    S.glasM.forEach(m => { m.emissiveIntensity = .5 * warm; m.opacity = Math.min(.8, m.opacity * (1 + 1.6 * warm)); });
    S.lamps.forEach(l => l.intensity = 7 * warm);

    /* Projektmanager: Faden um das Haus, Schlüssel */
    const ovK = s(3.0, 3.45) * (1 - s(3.9, 4.3));
    S.spine.visible = ovK > .01; S.spine.scale.set(ovK, Math.max(.001, (S.GAP * 6 + 2) * expK), ovK);
    let kv;
    if (P < 6) { kv = ovK; S.key.position.set(.9, (S.GAP * 6 + 3.4) * expK, 1.1); }
    else { kv = PR >= 8 ? 0 : s(10.22, 10.38); S.key.position.set(.9, 13.2 + 3 * (1 - s(10.22, 10.45)), 1.1); }
    S.key.visible = kv > .01; S.key.scale.setScalar(Math.max(.001, kv)); S.key.rotation.y = t * .7;
    const tk = PR >= 8 && PR < 11 ? 0 : s(10.03, 10.32); S.thread.visible = tk > .001;
    S.threadGeo.setDrawRange(0, Math.floor(S.threadGeo.index.count * tk / 3) * 3);

    /* Besser leben: zehn Jahre im Zeitraffer */
    { const L = S.life.userData, on = s(10.52, 10.6) * (1 - s(10.96, 11.02)), u = s(10.55, 10.95), c2 = ((u * 4) % 1 + 1) % 1;
      const w = .5 + .5 * Math.cos(2 * Math.PI * c2), snow = on * Math.pow(w, 3);
      S.life.visible = on > .005; L.snowPlane.material.opacity = .85 * snow; L.snowPlane.visible = snow > .01;
      const fl = L.flakes; fl.visible = snow > .05; fl.material.opacity = .9 * snow;
      if (fl.visible) { const a = fl.geometry.attributes.position.array; L.sd.forEach(([x, y, z, v], i) => { a[i * 3] = x + Math.sin(t * .6 + i) * .3; a[i * 3 + 1] = ((y - t * v * 1.6) % 22 + 22) % 22; a[i * 3 + 2] = z; }); fl.geometry.attributes.position.needsUpdate = true; }
      S.roofM.forEach(m => m.color.copy(m.userData.c0).lerp(K0.w, snow * .92));
      S.larchM.forEach(m => m.color.copy(m.userData.c0).lerp(K0.grey, on * u * .85));
      let cc; if (c2 < .25) cc = K0.tmp.copy(K0.w).lerp(K0.sal, sm(c2 / .25)); else if (c2 < .6) cc = K0.tmp.copy(K0.sal); else if (c2 < .85) cc = K0.tmp.copy(K0.sal).lerp(K0.kup, sm((c2 - .6) / .25)); else cc = K0.tmp.copy(K0.kup).lerp(K0.w, sm((c2 - .85) / .15));
      S.crownMat.color.copy(K0.crown).lerp(cc, on);
      /* Runde 53: der Wagen hält auf der Zufahrt, die Schnauze 1,4 m vor dem Garagentor */
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

    /* Generalunternehmer: Zaun. Betriebskosten: Photovoltaik, Überschuss ins Netz */
    { const zo = PR < 6.5 ? sN(7.26, 7.28) * (1 - sN(7.46, 7.52)) : 0, zu = S.zaun.userData; setOp(S.zaun, zo);
      if (zo > .004) { const n = zu.posts.length; zu.posts.forEach((m, i) => { m.scale.y = Math.max(.001, sN(7.27 + i / n * .1, 7.29 + i / n * .1)); });
        const rk = sN(7.34, 7.38); zu.rails.visible = rk > .01; zu.rails.material.opacity = .9 * rk; } }
    { const pv = S.pvA, nz = S.netz, on = ek >= 0; pv.visible = on; nz.visible = on;
      if (on) { const pn = pv.userData.panels, n = pn.length, glow = eq(.42, .1);
        pn.forEach((m, i) => { const k = eq(.06 + i / n * .32, .06); m.visible = k > .01; m.position.y = m.userData.y0 + (1 - k) * 1.2; m.material.opacity = k; m.material.emissiveIntensity = .55 * glow; });
        const fk = eq(.5, .08) * (1 - eq(.94, .05)); nz.userData.line.material.opacity = .5 * fk;
        nz.userData.dots.forEach((dt, i) => { const u = (t * .12 + i / nz.userData.dots.length) % 1; dt.position.copy(nz.userData.path(u)); dt.visible = fk > .02; dt.material.opacity = fk; }); } }
    /* Projektmanagement: das Fundament geht, die Planblätter fallen auf das Grundstück */
    setOp(U.fund, U.fund.userData.op * (1 - sN(5.98, 6.04) * (1 - sN(6.98, 7.06))));
    { const dv = sN(6.04, 6.1) * (1 - sN(6.9, 6.98)); setOp(S.docs, dv);
      if (dv > .004) S.sheets.forEach((m, i) => { const k = sN(6.06 + i * .07, 6.18 + i * .07), q = 1 - k;
        m.position.set(1 + i * .35 + q * 6, .04 + i * .06 + q * q * 14, 2 - i * .25 - q * 4); m.rotation.set(q * -.9, (i - 1) * .07 + q * .8, q * .4); }); }

    /* Einstieg: Produkt, Leben, Haustür, Services */
    { setOp(H.vitr, prodK); H.vitr.position.y = 28 * s(.44, .74);
      const tm = s(.5, .74); setOp(H.tt, 1 - tm); H.tt.position.y = -.6 * tm;
      const open = s(1.12, 1.22) * (1 - s(1.42, 1.54));
      H.hdoor.rotation.y = 1.45 * open;
      H.glow.material.opacity = cl(open * 1.8); H.glow.visible = open > .005;
      H.spill.material.opacity = .9 * open; H.spill.visible = open > .005; H.lamp.intensity = 16 * open;
      const fo = s(.55, .62) * (1 - s(2.25, 2.55)); H.fam.visible = P > .55 && P < 2.56;
      if (H.fam.visible) H.figs.forEach((f, i) => {
        let w, k, hd, vis = true;
        if (P < 1) { const q = FA.f2[i]; k = s(.56 + i * .012, .9 + i * .012); w = walk([[q[0] + 20, q[1] + 1.3], [q[0] + 2.5, q[1] + .5], q], k); hd = ang(w.h, Math.PI, ks(k, .82, 1)); }
        else if (P < 1.58) { const a = 1 + FA.b3d[i]; k = s(a, a + .3); w = walk([FA.f2[i], FA.in3[i], [-1.3, 8.5], [-1.3, 6.9]], k); hd = ang(Math.PI, w.h, ks(k, 0, .1)); vis = w.z > 7.35; }
        else { const a = 1.6 + i * .025; k = s(a, a + .26); w = walk(FA.b4[i], k); hd = ang(w.h, FA.fh4[i], ks(k, .82, 1)); vis = w.z < -5.6; }
        pose(f, w.x, w.z, hd, w.d, Math.pow(Math.sin(Math.PI * cl(k)), .4), i, t);
        f.visible = vis && fo > .01; const m = f.userData.mat; m.opacity = fo; m.transparent = fo < .999; m.depthWrite = fo > .5;
      }); }

    /* Bild der Fassaden bleibt am Haus (uFix je Gruppe, siehe own) */
    [S.gvol, S.deck, S.up, S.roof].forEach(g => { const f = g.userData.fix; if (!f) return; g.updateWorldMatrix(true, false); IM.copy(g.matrixWorld).invert(); f.forEach(u => u.value.copy(IM)); });
    R.render(scene, cam);

    /* Marken: Ebenen, Stapel neben der Überschrift, Spalte der Punkte, freie Schilder (Entwurf). Am Telefon rücken Schilder, die sich
       decken, nach unten, alles bleibt in der Bühne über dem Text */
    const hr = host.getBoundingClientRect(), stk = [], col = [], PLn = []; let avR = null;
    const off = L => { if (L.on) { L.el.style.opacity = '0'; L.el.style.pointerEvents = 'none'; if (L.el.tabIndex === 0) L.el.tabIndex = -1; L.on = 0; } };
    const isAct = L => SET.focus ? SET.focus.id === L.hot : SET.cur === L.hot;
    const hotCol = L => { const a = isAct(L); if (a !== L.act) { L.act = a; L.el.style.color = a ? '#FFB200' : '#fff'; } };
    LABELS.forEach(L => {
      const ff = L.pr ? sP : sN, fd = L.fd || .12;
      let v = L.fo ? (SET.focus && SET.focus.id === L.fo ? sm((SET.fk - .5) / .5) : 0) : ff(L.from, L.from + fd) * (1 - ff(L.to - fd, L.to));
      if (L.t0 != null) v *= sm((t - L.t0) / .9);
      if (L.ls) L.ls.style.transform = 'scaleX(' + sN(L.strike[0], L.strike[1]).toFixed(3) + ')';
      if (L.big && SET.hover !== -1 && SET.hover !== L.e) v *= .4;
      if (L.hot && SET.focus && SET.focus.id !== L.hot) v = 0;
      else if (L.hot && SET.cur && SET.cur !== L.hot) v *= .45;
      /* Runde 53: liegt das Obergeschoß auf dem Haus (Bad), sind die Punkte des Erdgeschoßes darunter: ausblenden */
      const og = sm(SET.fx.og); if (L.hot && L.hot !== 'bad' && og > .002) v *= 1 - og;
      if (v < .01) return off(L);
      const a = L.a === 'bad' && SET.fx.og > .5 ? S.A['bad-og'] : S.A[L.a]; if (!a) return off(L);
      a.getWorldPosition(tmp).project(cam);
      if (tmp.z > 1) return off(L);
      let x = (tmp.x * .5 + .5) * SET.w, y = (-tmp.y * .5 + .5) * SET.h;
      if (!L.wd || L.on !== 1) { L.wd = L.el.offsetWidth; L.ht = L.el.offsetHeight; }
      const act = (L.big || L.hot) && v > .5;
      if (SET.narrow) {
        x = Math.min(Math.max(8, x), SET.w - L.wd - 12);
        if (y < SET.stT - 30 || y > SET.stB + 30) return off(L);
        PLn.push({ L, x, y, v, top: y - (L.big ? 12 : 7) });
      } else if (L.stack) {
        if (avR === null) { const ae = host.querySelector(L.stack); avR = ae ? ae.getBoundingClientRect().right - hr.left + 28 : 0; }
        x = Math.min(Math.max(x, avR), SET.w - L.wd - 20); stk.push({ L, x, y: y - 7, v }); return;
      } else if (L.hot) {
        x = Math.max(20, x); if (!isAct(L) && x < SET.w * .55) return off(L);
        col.push({ L, x, y: y - 7, v, pri: isAct(L) ? 0 : 1 }); return;
      } else {
        if (!L.free) x = Math.max(x, SET.w * .56); x = Math.min(x, SET.w - L.wd - 20);
        if (L.free) y = Math.min(y, SET.h - 128 - L.ht + 7);
        L.el.style.transform = `translate3d(${x.toFixed(1)}px,${(y - (L.big ? 12 : 7)).toFixed(1)}px,0)`; L.el.style.opacity = v.toFixed(3);
      }
      L.el.style.pointerEvents = act ? 'auto' : 'none'; L.on = 1;
      if (L.big || L.hot) { const ti = act ? 0 : -1; if (L.el.tabIndex !== ti) L.el.tabIndex = ti; }
      if (L.hot) hotCol(L);
    });
    /* Desktop: Punkte im Haus als Spalte rechts, ohne sich zu decken (Entwurf) */
    if (col.length) { const top = 126, bot = SET.h - 128, placed = []; col.sort((a, b) => a.pri - b.pri || a.y - b.y);
      col.forEach(o => { const L = o.L, w = L.wd || 160, h = L.ht || 30; let y = Math.min(Math.max(o.y, top), bot - h);
        for (let n = 0; n < 8; n++) { const hit = placed.find(p => o.x < p.x + p.w + 8 && o.x + w + 8 > p.x && y < p.y + p.h + 6 && y + h + 6 > p.y); if (!hit) break; y = hit.y + hit.h + 6; if (y + h > bot) { y = Math.max(top, hit.y - h - 6); break; } }
        placed.push({ x: o.x, y, w, h });
        L.el.style.transform = `translate3d(${o.x.toFixed(1)}px,${y.toFixed(1)}px,0)`; L.el.style.opacity = o.v.toFixed(3);
        const act = o.v > .3; L.el.style.pointerEvents = act ? 'auto' : 'none'; L.on = 1; const ti = act ? 0 : -1; if (L.el.tabIndex !== ti) L.el.tabIndex = ti; hotCol(L); }); }
    /* Desktop: Stapel neben der Überschrift (Produktschilder, Kosten, Blätter, Inklusivleistungen) */
    if (stk.length) { stk.forEach(o => o.L.wd = o.L.el.offsetWidth || o.L.wd || 120); stk.sort((a, b) => (a.L.ord != null && b.L.ord != null) ? a.L.ord - b.L.ord : a.y - b.y);
      let prev = null; const y0 = stk.reduce((m, o) => m + o.y, 0) / stk.length, cx = Math.min(Math.max(...stk.map(o => o.x)) + (stk[0].L.gap || 12), SET.w - Math.max(...stk.map(o => o.L.wd)) - 20);
      stk.forEach(o => { if (prev) o.y = Math.max(o.y, prev.y + (prev.L.ht || 40) + 6); prev = o; });
      const dy = y0 - stk.reduce((m, o) => m + o.y, 0) / stk.length;
      stk.forEach(o => { const L = o.L; L.el.style.transform = `translate3d(${cx.toFixed(1)}px,${Math.max(120, o.y + dy).toFixed(1)}px,0)`; L.el.style.opacity = o.v.toFixed(3); L.el.style.pointerEvents = 'none'; L.on = 1; }); }
    /* Telefon: Schilder, die sich decken, rücken nach unten; Punkte im Haus bleiben, deckt ihr Name ein Schild, bleibt nur der Punkt */
    if (PLn.length) {
      PLn.sort((a, b) => a.top - b.top);
      const hit = (q, o) => q.x < o.x + o.L.wd + 6 && o.x < q.x + q.L.wd + 6 && q.top < o.top + o.L.ht + 4 && o.top < q.top + q.L.ht + 4;
      for (let i = 0; i < PLn.length; i++) {
        const q = PLn[i]; q.bare = false; q.dy = 0;
        for (let j = 0; j < i; j++) {
          const o = PLn[j]; if (o.bare || !hit(q, o)) continue;
          const need = o.top + o.L.ht + 4 - q.top;
          if (q.L.hot) { if (q.dy + need <= 26) { q.dy += need; q.top += need; } else { q.bare = true; break; } }
          else q.top += need;
        }
        q.v *= sm((q.top - SET.stT + 4) / 16) * sm((SET.stB - q.top - q.L.ht + 4) / 16);
      }
      PLn.forEach(q => {
        const L = q.L; L.el.style.transform = `translate3d(${q.x.toFixed(1)}px,${q.top.toFixed(1)}px,0)`; L.el.style.opacity = q.v.toFixed(3);
        if (q.v < .3) L.el.style.pointerEvents = 'none';
        if (L.hot) { const tx = L.el.lastElementChild, vis = q.bare ? 'hidden' : 'visible', tf = q.dy ? `translateY(${q.dy.toFixed(1)}px)` : ''; if (tx && tx.style.visibility !== vis) tx.style.visibility = vis; if (tx && tx.style.transform !== tf) tx.style.transform = tf; }
      });
    }
  };
  wake();
  return {
    R, scene, cam, S, HW: HWd, K, FOC,
    /* snap: ohne Übergang (unter dem schwarzen Zwischentitel), ohne weiche Kamera */
    setP(P, snap) { SET.tP = P; if (snap) { SET.P = P; SET.cPrev = null; SET.cb = 0; } wake(); },
    setFocus(id) { SET.focus = id && FOC[id] ? { id, ...FOC[id] } : null; wake(); },
    renderAt(P) { SET.P = SET.tP = P; SET.snap = 1; SET.cPrev = null; SET.cb = 0; frameX(); },
    setStage(top, bottom) { if (SET.tT === top && SET.tB === bottom) return; SET.tT = top; SET.tB = bottom; wake(); },
    get P() { return SET.P; },
    isExt: id => ['dach', 'wand', 'fassade', 'hoehe'].includes(id),
    destroy() { SET.alive = 0; cancelAnimationFrame(SET.raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis); removeEventListener('pointermove', onMove); R.dispose(); lab.innerHTML = ''; }
  };
}
