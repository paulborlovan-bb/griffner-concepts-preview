/* GRIFFNER Journey: die Familie (Vater, Mutter, Tochter, Sohn) als eigene Figuren mit menschlichen Proportionen, in Code gebaut.
   Kundenwunsch 2026-11-19: menschlicher (wie eine Trickfilm-Familie: normale Körper, große freundliche Augen, T-Shirts, Jeans,
   Jeanshemd, Turnschuhe), gedämpfte Farben, etwas kleiner und enger beieinander, die Bewegung menschlicher.
   Der Gang ist eine echte Bewegungsaufnahme (gang-daten.js aus der Quaternius Universal Animation Library, CC0): Knie, Ferse bis
   Zehen, Becken und Schultern drehen gegeneinander, die Arme schwingen mit. Die Figuren übernehmen nur die Richtungen der
   Körperteile, die Längen sind ihre eigenen; der tiefste Punkt der Schuhe steht immer auf dem Boden (nichts schwebt, nichts rutscht).
   Die Familie hält sich an den Händen (Tochter, Mutter, Vater, Sohn); ein Kind, das sich umdreht und winkt, lässt los.
   Blick in Richtung −z, rechts = +x. API: { members, pose(m, ph, env, t, look, still, extra), hands(), fade(m, o), stride(m) }. */
import { GANG } from './gang-daten.js';

/* Gedämpfte Farben: warmes Weiß statt Weiß, Jeans und Hemd taubenblau, Hosen und Schuhe warmes Dunkel */
const MC = {
  haut: 0xD8A889, hautK: 0xDDAE90, haar: 0x2C2521, haarK: 0x332A25,
  weiss: 0xE4DFD5, hemd: 0x7F91A4, hoseV: 0x3A3733, jeans: 0x5F758D, shorts: 0x6C6964, jeansK: 0x7489A0,
  schuh: 0x2D2C2B, sohle: 0xE2DED5, guertel: 0x6B4C38, auge: 0x46301F, sklera: 0xF1EDE6, mund: 0x86463F, wange: 0xDC9485
};

/* H Körpergröße (m), lat seitlich vom Weg (+ rechts), fwd vor (+) oder hinter, cad höchstens Doppelschritte je s, wave: Hand zum Winken */
export const MENSCH_WHO = [
  { key: 'vater', kid: false, H: 1.82, lat: .28, fwd: 0, cad: 1.9 },
  { key: 'mutter', kid: false, H: 1.69, lat: -.28, fwd: .04, cad: 1.9 },
  { key: 'tochter', kid: true, H: 1.16, lat: -.78, fwd: .12, cad: 2.6, wave: -1 },
  { key: 'sohn', kid: true, H: 1.24, lat: .78, fwd: .1, cad: 2.6, wave: 1 }
];
/* Wer hält wen: [links, rechts]. Die rechte Hand der linken Figur nimmt die linke Hand der rechten. */
const HOLD = [['tochter', 'mutter'], ['mutter', 'vater'], ['vater', 'sohn']];
/* Die Familie ist etwas kleiner als echt (Kundenwunsch: kleiner im Bild) */
const FS = .84;

export function humanFamily(T, who = MENSCH_WHO) {
  const V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z), UP = V(0, 1, 0);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- Gang: Richtungen je Bild, Stehen = Mittel des Gangs ---------- */
  const KEYS = ['thL', 'shL', 'ftL', 'thR', 'shR', 'ftR', 'uaL', 'faL', 'uaR', 'faR', 'pr', 'pu', 'cr', 'cu', 'hd'];
  const G = GANG, STAND = {};
  KEYS.forEach(k => { const s = V(); for (let f = 0; f < G.F; f++) s.add(V(G[k][f * 3], G[k][f * 3 + 1], G[k][f * 3 + 2])); STAND[k] = s.normalize(); });
  /* Stehen: Beine gerade, Füße flach, Becken und Brust aufrecht */
  ['thL', 'shL', 'thR', 'shR'].forEach(k => STAND[k].lerp(V(Math.sign(STAND[k].x) * .02, -1, 0), .6).normalize());
  STAND.pu.set(0, 1, 0); STAND.cu.set(0, 1, 0); STAND.pr.set(1, 0, 0); STAND.cr.set(1, 0, 0);
  const FT0 = { L: STAND.ftL.clone(), R: STAND.ftR.clone() };
  const _a = V(), _b = V();
  function gait(ph, env, d) {
    const fl = ((ph / (2 * Math.PI)) % 1 + 1) % 1 * G.F, f0 = Math.floor(fl) % G.F, f1 = (f0 + 1) % G.F, k = fl - Math.floor(fl);
    KEYS.forEach(key => {
      const a = G[key];
      _a.set(a[f0 * 3], a[f0 * 3 + 1], a[f0 * 3 + 2]); _b.set(a[f1 * 3], a[f1 * 3 + 1], a[f1 * 3 + 2]);
      d[key].copy(_a.lerp(_b, k).normalize()).lerp(STAND[key], 1 - env).normalize();
    });
    /* Arme näher am Körper als in der Aufnahme (Spielfigur), Becken und Brust weniger nach vorn geneigt */
    ['uaL', 'uaR'].forEach(k => { d[k].x *= .6; d[k].normalize(); });
    ['faL', 'faR'].forEach(k => { d[k].x *= .65; d[k].normalize(); });
    d.pu.lerp(UP, .55).normalize(); d.cu.lerp(UP, .6).normalize(); d.hd.lerp(UP, .75).normalize();
  }
  const _m4 = new T.Matrix4(), _z = V(), _y = V();
  function basis(r, u, q) { _z.crossVectors(r, u).normalize(); _y.crossVectors(_z, r).normalize(); _m4.makeBasis(r, _y, _z); return q.setFromRotationMatrix(_m4); }

  /* ---------- Bausteine ---------- */
  const mats = [];
  const M = (c, o = {}) => { const m = new T.MeshStandardMaterial({ color: c, roughness: .8, metalness: 0, transparent: true, opacity: 1, ...o }); mats.push(m); return m; };
  const mesh = (par, geo, mat, x = 0, y = 0, z = 0, s) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); s && m.scale.set(...s); m.castShadow = true; par.add(m); return m; };
  const grp = par => { const g = new T.Group(); par.add(g); return g; };
  /* Glied: abgerundeter Kegel entlang y, unten (distal) r0, oben (proximal) r1, Länge l zwischen den Gelenken */
  const limb = (r0, r1, l, n = 18) => {
    const p = [];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + i / 6 * Math.PI / 2; p.push(new T.Vector2(Math.max(1e-4, r0 * Math.cos(a)), -l / 2 + r0 * Math.sin(a))); }
    for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; p.push(new T.Vector2(Math.max(1e-4, r1 * Math.cos(a)), l / 2 + r1 * Math.sin(a))); }
    return new T.LatheGeometry(p, n);
  };
  /* Ärmel und Hosenbein: offenes Rohr am proximalen Ende des Glieds, Anteil k der Länge */
  const tube = (r0, r1, h) => new T.CylinderGeometry(r1, r0, h, 18, 1, true);
  const lathe = (pts, n = 32, ps = 0, pl = Math.PI * 2) => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(Math.max(1e-4, r), y)), n, ps, pl);

  /* ---------- eine Figur ---------- */
  function build(w) {
    const H = w.H, kid = w.kid, mom = w.key === 'mutter', dad = w.key === 'vater', girl = w.key === 'tochter', boy = w.key === 'sohn';
    /* Maße (m): Beine, Rumpf, Kopf. Trickfilm-Proportionen: Kopf etwas größer, Kinder mit großem Kopf. */
    const L = H * (kid ? .43 : .47), aH = H * .03, tL = (L - aH) * .52, sL = (L - aH) * .48;
    const hipDrop = H * .035, hw = H * (mom ? .057 : .052), waist = H * .1, S = H * (kid ? .2 : .205);
    const sw = H * (dad ? .108 : mom ? .092 : .098), neck = H * (kid ? .035 : .04), R = H * (kid ? .118 : .083);
    const ua = H * (kid ? .155 : .17), fa = H * (kid ? .13 : .14), hand = H * .055, fL = H * .088;
    const th = (mom ? .95 : kid ? 1.12 : 1) * 1.14, rr = x => H * x * th;
    const p = { H, L, aH, tL, sL, hipDrop, hw, waist, S, sw, neck, R, ua, fa, hand, fL };

    const mt = {
      haut: M(kid ? MC.hautK : MC.haut, { roughness: .6 }), haar: M(kid ? MC.haarK : MC.haar, { roughness: .7, side: T.DoubleSide }),
      tee: M(MC.weiss, { side: T.DoubleSide }), hemd: M(MC.hemd, { side: T.DoubleSide }),
      hose: M(dad ? MC.hoseV : mom ? MC.jeans : boy ? MC.shorts : MC.jeans, { side: T.DoubleSide }),
      schuh: M(MC.schuh, { roughness: .6 }), sohle: M(MC.sohle, { roughness: .7 }), socke: M(MC.weiss),
      guertel: M(MC.guertel, { roughness: .55 }), sklera: M(MC.sklera, { roughness: .35, emissive: 0x2a2724 }), auge: M(MC.auge, { roughness: .3 }),
      pupille: M(0x141110, { roughness: .2 }), glanz: M(0xffffff, { roughness: .1, emissive: 0xffffff, emissiveIntensity: .5 }),
      mund: M(MC.mund, { roughness: .5 }), wange: M(MC.wange, { opacity: .45, depthWrite: false })
    };
    const g = new T.Group(); g.scale.setScalar(FS);
    const body = grp(g);

    /* Becken mit Hose (Hüften), Gürtel bei der Mutter */
    const pelvis = grp(body);
    mesh(pelvis, lathe([[0, kid ? -H * .085 : -H * .048], [hw * (kid ? .75 : 1.1), kid ? -H * .08 : -H * .044], [hw * 1.42, -H * .01], [hw * 1.42, H * .035], [hw * (mom ? 1.25 : 1.32), waist * 1.02], [0, waist * 1.02]]), mt.hose, 0, 0, 0, [1, 1, .72]);
    if (mom) { const b = mesh(pelvis, new T.TorusGeometry(hw * 1.15, H * .007, 8, 40), mt.guertel, 0, waist * .93, 0, [1, .76, 1]); b.rotation.x = Math.PI / 2; }

    /* Brust: T-Shirt; Vater dazu das offene Hemd (vorne offen) */
    const chest = grp(body), rW = hw * (mom ? 1.14 : 1.3), rC = sw * (mom ? .86 : .88), rS = sw * .97, rN = R * .3;
    const hem = kid ? -H * .005 : mom ? -H * .02 : -H * .055, rH = hw * (mom ? 1.3 : kid ? 1.36 : 1.55);
    mesh(chest, lathe([[0, hem], [rH, hem], [rH * .98, hem + H * .02], [rW * 1.05, S * .15], [rC, S * .52], [rS, S * .8], [rS * .8, S * .95], [rN * 1.1, S * 1.0], [0, S * 1.01]]), mt.tee, 0, 0, 0, [1, 1, .7]);
    if (dad) {
      const gap = .42;
      mesh(chest, lathe([[rH * 1.06, -H * .085], [rH * 1.04, -H * .06], [rW * 1.12, S * .15], [rC * 1.07, S * .52], [rS * 1.06, S * .8], [rS * .86, S * .96], [rN * 1.35, S * 1.02], [rN * 1.3, S * 1.06]], 32, Math.PI + gap, Math.PI * 2 - gap * 2), mt.hemd, 0, 0, 0, [1, 1, .74]);
    }
    /* Hals */
    const neckG = grp(body); mesh(neckG, limb(R * .27, R * .3, neck + R * .2), mt.haut);

    /* Beine: Oberschenkel, Unterschenkel, Schuh. Kleidung je Figur. */
    const legs = [-1, 1].map(sg => {
      const thigh = grp(body), shin = grp(body), foot = grp(body);
      const longPants = dad || mom;
      mesh(thigh, limb(rr(.03), rr(.04), tL), longPants ? mt.hose : mt.haut);
      if (dad) mesh(shin, limb(rr(.033), rr(.036), sL), mt.hose);
      else if (mom) { mesh(shin, limb(rr(.024), rr(.031), sL), mt.hose); const c = mesh(shin, new T.TorusGeometry(rr(.026), rr(.008), 8, 24), mt.hose, 0, -sL / 2 + H * .012, 0); c.rotation.x = Math.PI / 2; }
      else {
        mesh(shin, limb(rr(.023), rr(.03), sL), mt.haut);
        mesh(shin, tube(rr(.026), rr(.027), H * .035), mt.socke, 0, -sL / 2 + H * .016, 0);
        if (boy) mesh(thigh, limb(rr(.04), rr(.043), tL * .72), mt.hose, 0, tL / 2 - tL * .36, 0);
        else { mesh(thigh, limb(rr(.041), rr(.043), tL * .48), mt.hose, 0, tL / 2 - tL * .24, 0); const c = mesh(thigh, new T.TorusGeometry(rr(.04), rr(.007), 8, 24), mt.hose, 0, tL / 2 - tL * .48 - rr(.02), 0); c.rotation.x = Math.PI / 2; }
      }
      /* Turnschuh: Schaft dunkel, Sohle hell; flach im Stehen, dreht mit dem Fuß */
      mesh(foot, new T.SphereGeometry(1, 20, 14), mt.schuh, 0, -aH * .42, -fL * .33, [H * .036, aH * .62, fL * .66]);
      mesh(foot, new T.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mt.sohle, 0, -aH * .55, -fL * .33, [H * .039, aH * .5, fL * .7]);
      return { thigh, shin, foot, sg };
    });

    /* Arme: Oberarm, Unterarm, Hand; T-Shirt-Ärmel kurz, Vater Hemdärmel bis zum Ellbogen gekrempelt */
    const arms = [-1, 1].map(sg => {
      const uaG = grp(body), faG = grp(body);
      mesh(uaG, limb(rr(.021), rr(.027), ua), mt.haut);
      mesh(uaG, new T.SphereGeometry(rr(dad ? .038 : .032), 16, 12), dad ? mt.hemd : mt.tee, 0, ua / 2 + H * .004, 0);
      mesh(uaG, tube(rr(.032), rr(.037), ua * .5), mt.tee, 0, ua / 2 - ua * .25 + H * .012, 0);
      if (dad) { mesh(uaG, tube(rr(.033), rr(.04), ua * .92), mt.hemd, 0, ua / 2 - ua * .46 + H * .014, 0); const c = mesh(uaG, new T.TorusGeometry(rr(.033), rr(.009), 8, 24), mt.hemd, 0, -ua / 2 + H * .012, 0); c.rotation.x = Math.PI / 2; }
      mesh(faG, limb(rr(.017), rr(.021), fa), mt.haut);
      /* Hand: weich, leicht flach, Daumen */
      mesh(faG, new T.SphereGeometry(1, 16, 12), mt.haut, 0, -fa / 2 - hand * .45, 0, [rr(.024), hand * .58, rr(.017)]);
      mesh(faG, new T.SphereGeometry(1, 10, 8), mt.haut, sg * -rr(.01), -fa / 2 - hand * .25, -rr(.016), [rr(.009), hand * .3, rr(.009)]);
      return { ua: uaG, fa: faG, sg };
    });

    /* Kopf: Schädel, Wangen und Kinn, Ohren, Augen (Weiß, Iris, Pupille, Glanz), Brauen, Nase, Lächeln, rote Wangen; Haare */
    const head = grp(body), c = V(0, R * .96, 0);
    mesh(head, new T.SphereGeometry(R, 40, 28), mt.haut, c.x, c.y, c.z, [.95, 1, .98]);
    mesh(head, new T.SphereGeometry(R * .8, 32, 20), mt.haut, 0, c.y - R * .3, -R * .17, [1.02, .92, .95]);
    [-1, 1].forEach(sg => mesh(head, new T.SphereGeometry(R * .17, 14, 10), mt.haut, sg * R * .93, c.y - R * .08, R * .04, [.5, 1, .78]));
    const face = (geo, mat, u, v, k = 1, s) => {
      const n = V(Math.sin(u) * Math.cos(v), Math.sin(v), -Math.cos(u) * Math.cos(v));
      const m = mesh(head, geo, mat, c.x + n.x * R * k, c.y + n.y * R * k, c.z + n.z * R * k, s); m.rotation.order = 'YXZ'; m.rotation.set(v, -u, 0); m.castShadow = false; return m;
    };
    const eyeU = kid ? .32 : .3, eyeR = R * (kid ? .155 : .13);
    [-1, 1].forEach(sg => {
      face(new T.SphereGeometry(eyeR, 20, 14), mt.sklera, sg * eyeU, .02, .93, [.95, 1.12, .5]);
      face(new T.SphereGeometry(eyeR * .8, 18, 12), mt.auge, sg * (eyeU - .01), .015, .975, [1, 1.08, .38]);
      face(new T.SphereGeometry(eyeR * .42, 12, 8), mt.pupille, sg * (eyeU - .01), .015, .99, [1, 1.05, .3]);
      face(new T.SphereGeometry(eyeR * .2, 8, 6), mt.glanz, sg * (eyeU - .01) - .045, .07, 1.0);
      const br = face(new T.CapsuleGeometry(R * .025, R * .16, 4, 8), mt.haar, sg * (eyeU + .01), .27, 1.0); br.rotation.z = Math.PI / 2 - sg * .1;
      face(new T.CircleGeometry(R * .12, 20).rotateY(Math.PI), mt.wange, sg * .52, -.2, 1.01);
    });
    face(new T.SphereGeometry(R * .085, 14, 10), mt.haut, 0, -.1, 1.0, [.9, .85, 1]);
    face(new T.TorusGeometry(R * .14, R * .026, 8, 20, Math.PI).rotateZ(Math.PI), mt.mund, 0, -.33, 1.005);
    /* Haare: dunkel, weich. Vater kurz mit Tolle, Sohn kurz verstrubbelt, Mutter schulterlang, Tochter lang. */
    const hair = (geo, x, y, z, s, rot) => { const m = mesh(head, geo, mt.haar, x, y, z, s); rot && m.rotation.set(...rot); return m; };
    hair(new T.SphereGeometry(R * 1.05, 40, 18, 0, Math.PI * 2, 0, kid ? 1.2 : 1.12), c.x, c.y, c.z, [.97, 1, 1.0], [-.2, 0, 0]);
    hair(new T.SphereGeometry(R * 1.04, 40, 20, 0, Math.PI, 0, 2.15), c.x, c.y, c.z, [.97, 1, 1.0]);
    if (dad) { hair(new T.SphereGeometry(R * .52, 20, 12), R * .12, c.y + R * .74, -R * .45, [1.35, .5, .9], [-.35, 0, -.15]); }
    if (boy) [[-.4, .74, -.48, .3], [0, .84, -.5, 0], [.38, .76, -.46, -.3], [.1, .95, -.1, .1], [-.3, .9, .2, .2]].forEach(([x, y, z, r]) => hair(new T.SphereGeometry(R * .3, 14, 10), x * R, c.y + y * R, z * R, [1, .62, .9], [-.6, 0, r]));
    if (mom || girl) {
      /* Rücken und Seiten: weiche Haarform (Drehkörper) vom Scheitel bis zur Haarlänge, unten nach innen gerundet, vorne offen für das Gesicht */
      const prof = mom
        ? [[1.05, .05], [1.08, -.3], [1.1, -.7], [1.06, -1.02], [.98, -1.2], [.86, -1.28], [.76, -1.22]]
        : [[1.04, .05], [1.06, -.4], [1.05, -1.0], [1.0, -1.55], [.92, -1.95], [.8, -2.1], [.7, -2.04]];
      hair(lathe(prof.map(([r, y]) => [r * R, y * R]), 36, Math.PI * 1.28, Math.PI * 1.44), c.x, c.y, c.z + R * .05, [.98, 1, .92]);
      /* Pony seitlich gescheitelt */
      hair(new T.SphereGeometry(R * .6, 20, 12), R * .22, c.y + R * .6, -R * .62, [1.25, .42, .62], [-.55, 0, -.32]);
      hair(new T.SphereGeometry(R * .45, 16, 10), -R * .42, c.y + R * .52, -R * .6, [1.0, .45, .6], [-.5, 0, .4]);
    }

    return {
      ...w, p, g, body, pelvis, chest, neckG, head, legs, arms, mt, mats: Object.values(mt),
      d: Object.fromEntries(KEYS.map(k => [k, V()])), q: { pel: new T.Quaternion(), ch: new T.Quaternion(), hd: new T.Quaternion(), ft: new T.Quaternion() },
      J: { shL: V(), shR: V(), elL: V(), elR: V(), wrL: V(), wrR: V(), W: V(), N: V() }, link: { L: 0, R: 0 },
      ph: 0, yaw: null, turn: 0
    };
  }
  const members = who.map(build);

  /* ---------- Haltung je Bild ---------- */
  const _q = new T.Quaternion(), _e = new T.Euler(0, 0, 0, 'YXZ'), _v = V(), _w = V(), _t = V(), _h = V(), _k = V(), _n = V();
  const DOWN = V(0, -1, 0);
  /* Glied zwischen Gelenk a (proximal) und b (distal) ausrichten */
  function seg(gr, a, b) { gr.position.copy(a).add(b).multiplyScalar(.5); _v.subVectors(a, b).normalize(); gr.quaternion.setFromUnitVectors(UP, _v); }

  function pose(m, ph, env, t, look = 0, still = false, extra = {}) {
    const p = m.p, d = m.d, tt = still ? 0 : t, wv = extra.wave || 0;
    gait(ph, env, d);
    /* Winken: der freie Arm geht hoch, die Hand winkt */
    if (wv > 0 && m.wave) {
      const s = m.wave, u = s < 0 ? 'L' : 'R';
      d['ua' + u].lerp(_v.set(s * .55, .78, -.12).normalize(), wv).normalize();
      d['fa' + u].lerp(_v.set(s * .15 + .42 * Math.sin(tt * 8.5), 1, -.18).normalize(), wv).normalize();
    }
    /* Stehen: leichtes Atmen und Gewicht verlagern */
    const st = (1 - env) * (still ? 0 : 1), sway = Math.sin(tt * .8 + m.fwd * 5) * .012 * st;
    basis(d.pr, d.pu, m.q.pel); basis(d.cr, d.cu, m.q.ch);
    const P = _h.set(sway, 0, 0);
    m.pelvis.position.copy(P); m.pelvis.quaternion.copy(m.q.pel);
    /* Beine */
    let low = 1e9;
    const leg = (lg, th, sh, ft, s0) => {
      const hip = _t.set(lg.sg * p.hw, -p.hipDrop, 0).applyQuaternion(m.q.pel).add(P).clone();
      const knee = _k.copy(hip).addScaledVector(th, p.tL).clone(), ank = _n.copy(knee).addScaledVector(sh, p.sL).clone();
      seg(lg.thigh, hip, knee); seg(lg.shin, knee, ank);
      lg.foot.position.copy(ank); lg.foot.quaternion.setFromUnitVectors(s0, ft);
      const toe = _w.set(0, -p.aH, -p.fL * .95).applyQuaternion(lg.foot.quaternion).add(ank), heel = _v.set(0, -p.aH, p.fL * .22).applyQuaternion(lg.foot.quaternion).add(ank);
      low = Math.min(low, toe.y, heel.y);
    };
    leg(m.legs[0], d.thL, d.shL, d.ftL, FT0.L); leg(m.legs[1], d.thR, d.shR, d.ftR, FT0.R);
    /* Der tiefste Punkt der Schuhe steht auf dem Boden: Körper heben oder senken (das ist auch das Federn beim Gehen) */
    m.body.position.y = -low;
    /* Rumpf, Hals, Kopf */
    const W = m.J.W.set(0, p.waist, 0).applyQuaternion(m.q.pel).add(P);
    m.chest.position.copy(W); m.chest.quaternion.copy(m.q.ch);
    const br = still ? 0 : Math.sin(tt * 1.7 + m.fwd * 3);
    m.chest.scale.set(1, 1 + br * .006 * (1 - env), 1);
    const N = m.J.N.set(0, p.S * .97, 0).applyQuaternion(m.q.ch).add(W);
    const nt = _w.copy(N).addScaledVector(d.hd, p.neck);
    seg(m.neckG, nt, _v.copy(N).addScaledVector(d.hd, -p.R * .1));
    m.head.position.copy(nt);
    _e.set(-.04 + (-.03 * env + Math.sin(ph * 2) * .02 * env), look, (still ? .05 : Math.sin(tt * .7 + m.fwd * 2) * .06) * (1 - env) * (m.kid ? 1.4 : .8) + wv * .12);
    m.head.quaternion.setFromEuler(_e);
    /* Schultern und natürliche Arme (Hände halten folgt in hands()) */
    m.J.shL.set(-p.sw, p.S * .84, 0).applyQuaternion(m.q.ch).add(W); m.J.shR.set(p.sw, p.S * .84, 0).applyQuaternion(m.q.ch).add(W);
    m.J.elL.copy(m.J.shL).addScaledVector(d.uaL, p.ua); m.J.wrL.copy(m.J.elL).addScaledVector(d.faL, p.fa);
    m.J.elR.copy(m.J.shR).addScaledVector(d.uaR, p.ua); m.J.wrR.copy(m.J.elR).addScaledVector(d.faR, p.fa);
    placeArms(m);
  }
  function placeArms(m) {
    const J = m.J;
    seg(m.arms[0].ua, J.shL, J.elL); seg(m.arms[0].fa, J.elL, J.wrL);
    seg(m.arms[1].ua, J.shR, J.elR); seg(m.arms[1].fa, J.elR, J.wrR);
  }

  /* ---------- Hände halten: zwei Arme treffen sich zwischen den beiden (Zwei-Gelenk-Lösung), Knie-artig nach außen gebeugt ---------- */
  const byKey = Object.fromEntries(members.map(m => [m.key, m]));
  const _s = V(), _tg = V(), _el = V(), _ax = V(), _pp = V(), _wA = V(), _wB = V(), _mid = V();
  function reach(m, side, target, k) {
    const p = m.p, J = m.J, sh = J['sh' + side], el = J['el' + side], wr = J['wr' + side];
    const l1 = p.ua, l2 = p.fa + p.hand * .45;
    _tg.copy(target).sub(sh); let dd = _tg.length(); const dmax = (l1 + l2) * .995;
    if (dd < 1e-4) return;
    if (dd > dmax) { _tg.multiplyScalar(dmax / dd); dd = dmax; }
    _ax.copy(_tg).divideScalar(dd);
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    /* Ellbogen nach außen und etwas nach hinten */
    _pp.set(side === 'L' ? -1 : 1, -.2, .6); _pp.addScaledVector(_ax, -_pp.dot(_ax)).normalize();
    _el.copy(sh).addScaledVector(_ax, a).addScaledVector(_pp, h);
    /* Handgelenk auf der Linie Ellbogen zum Treffpunkt */
    _s.copy(sh).add(_tg).sub(_el).normalize().multiplyScalar(p.fa).add(_el);
    /* mit dem natürlichen Arm mischen, Längen wieder herstellen */
    el.lerp(_el, k); wr.lerp(_s, k);
    el.sub(sh).setLength(l1).add(sh); wr.sub(el).setLength(p.fa).add(el);
  }
  function hands(still = false) {
    members.forEach(m => m.g.updateMatrixWorld(true));
    HOLD.forEach(([a, b]) => {
      const A = byKey[a], B = byKey[b];
      if (!A || !B) return;
      /* natürliche Handgelenke in der Welt, Treffpunkt dazwischen (etwas vor dem Körper) */
      A.body.localToWorld(_wA.copy(A.J.wrR)); B.body.localToWorld(_wB.copy(B.J.wrL));
      _mid.copy(_wA).add(_wB).multiplyScalar(.5);
      const sA = A.body.localToWorld(A.J.shR.clone()), sB = B.body.localToWorld(B.J.shL.clone());
      const rA = (A.p.ua + A.p.fa + A.p.hand * .45) * FS * .96, rB = (B.p.ua + B.p.fa + B.p.hand * .45) * FS * .96;
      /* Treffpunkt in die Reichweite beider Arme ziehen (abwechselnd auf beide Kugeln projizieren) */
      for (let i = 0; i < 6; i++) [[sA, rA], [sB, rB]].forEach(([sh, r]) => { const dd = _mid.distanceTo(sh); if (dd > r) _mid.sub(sh).multiplyScalar(r / dd).add(sh); });
      const over = Math.max(sA.distanceTo(_mid) / rA, sB.distanceTo(_mid) / rB);
      /* loslassen: zu weit auseinander oder ein Kind dreht sich um und winkt */
      const k = clamp((1.06 - over) / .06) * (1 - clamp(A.turn * 3)) * (1 - clamp(B.turn * 3));
      A.link.R = still ? k : lerp(A.link.R, k, .25); B.link.L = A.link.R;
      if (A.link.R < .01) return;
      reach(A, 'R', A.body.worldToLocal(_mid.clone()), A.link.R);
      reach(B, 'L', B.body.worldToLocal(_mid.clone()), A.link.R);
      placeArms(A); placeArms(B);
    });
  }
  function fade(m, o) { m.mats.forEach(x => { x.opacity = x === m.mt.wange ? o * .45 : o; x.depthWrite = x === m.mt.wange ? false : o > .5; }); m.g.visible = o > .002; }
  /* Doppelschritt in m (Weltmaß): aus der Aufnahme, je Beinlänge */
  const stride = m => G.stride * m.p.L * FS;
  members.forEach(m => pose(m, 0, 0, 0, 0, true));
  return { members, pose, hands, fade, stride };
}
