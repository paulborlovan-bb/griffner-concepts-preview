/* GRIFFNER Journey: die Familie (Vater, Mutter, Tochter, Sohn) als weiche Spielfiguren, in Code gebaut (eigener Entwurf, keine Lizenzfrage).
   Kundenwunsch 2026-11-19: freundlich wie eine 3D-Spielzeugfamilie (runde Köpfe, einfache lächelnde Gesichter, Polo, Kleid, T-Shirt),
   aber gedämpfte Farben. Sie gehen gemeinsam zum Haus; an den Stationen dreht sich eins der Kinder um und winkt.
   Blick in Richtung −z. API: { members, pose(m, ph, env, t, look, still, extra), fade(m, o), stride(m) }.
   Runde 7 (2026-11-19, Kundenwunsch: „die animierten zurück, die echten Menschen sehen zu seltsam aus“): wieder diese Figuren, dazu aus den
   Runden danach: etwas kleiner (FS) und enger beieinander, Kleidung in GRIFFNER Farben, das Kind winkt mit dem äußeren Arm und hüpft dabei,
   alle blinzeln und schauen ab und zu zu ihrem Nachbarn. */

/* GRIFFNER Farben (Sand, Anthrazit, Gelb, Salbei, Weiß) zu warmer Haut und braunen Haaren */
const TOY_C = {
  haut: 0xEFD6C2, wange: 0xE2A497, auge: 0x2E2622, mund: 0x8A4E46,
  haarV: 0x4A3A30, haarM: 0x5C4535, haarT: 0x6A4F3F, haarS: 0x4E3D32,
  polo: 0xCFC3B3, hose: 0x4E4E4B, kleidM: 0xECE8E0, shirt: 0x8B907C, shorts: 0x4E4E4B, kleidT: 0xFFB200, schuh: 0x3E3E3C, schuhK: 0xE4DED4
};

/* Maßstab der ganzen Figur (Runde 4: „etwas kleiner“): Vater 1,54 m, Mutter 1,43 m, Kinder 0,96 und 1,03 m */
const FS = .9;

/* Maße in m (vor FS): Beinlänge, Rumpf, Kopfradius, Schulter- und Hüftbreite (halb), Arm, Dicken. Kinder mit großem Kopf.
   lat seitlich vom Weg (+ rechts), fwd vor (+) oder hinter, cad höchstens Doppelschritte je s, wave: Arm zum Winken
   (1 rechts, −1 links: der äußere, wenn sich das Kind zu dir umdreht), nb: zu wem der Blick ab und zu geht */
export const TOY_WHO = [
  { key: 'vater', kid: false, leg: .62, torso: .52, R: .27, sw: .2, hw: .16, arm: .52, ar: .062, lr: .075, lat: .34, fwd: 0, cad: 2, A: .48, nb: 'mutter' },
  { key: 'mutter', kid: false, leg: .58, torso: .47, R: .26, sw: .165, hw: .16, arm: .47, ar: .052, lr: .062, lat: -.34, fwd: .05, cad: 2, A: .44, nb: 'tochter' },
  { key: 'tochter', kid: true, leg: .33, torso: .29, R: .22, sw: .125, hw: .11, arm: .3, ar: .046, lr: .052, lat: -.9, fwd: .15, cad: 3.2, A: .6, wave: 1, nb: 'mutter' },
  { key: 'sohn', kid: true, leg: .36, torso: .31, R: .23, sw: .135, hw: .115, arm: .32, ar: .048, lr: .055, lat: .9, fwd: .12, cad: 3.2, A: .6, wave: -1, nb: 'vater' }
];

export function toyFamily(T, who = TOY_WHO) {
  const mats = [];
  const M = (c, o = {}) => { const m = new T.MeshStandardMaterial({ color: c, roughness: .62, metalness: 0, transparent: true, opacity: 1, ...o }); mats.push(m); return m; };
  const V = (x, y, z) => new T.Vector3(x, y, z), UP = V(0, 1, 0);
  const add = (par, geo, mat, x = 0, y = 0, z = 0, s) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); s && m.scale.set(...s); m.castShadow = true; par.add(m); return m; };
  const grp = (par, x = 0, y = 0, z = 0) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const cap = (r, l) => new T.CapsuleGeometry(r, Math.max(.001, l), 8, 16);
  const lathe = (pts, n = 32) => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(Math.max(.0001, r), y)), n);
  /* Merkmal auf der Kopfkugel: u waagrecht, v senkrecht (Bogenmaß), Blick −z */
  const face = (par, geo, mat, R, u, v, k = 1, s) => {
    const n = V(Math.sin(u) * Math.cos(v), Math.sin(v), -Math.cos(u) * Math.cos(v));
    const m = add(par, geo, mat, n.x * R * k, n.y * R * k, n.z * R * k, s); m.rotation.order = 'YXZ'; m.rotation.set(v, -u, 0); m.castShadow = false; return m;
  };

  const members = who.map(w => {
    const mt = {
      haut: M(TOY_C.haut), auge: M(TOY_C.auge, { roughness: .3 }), glanz: M(0xffffff, { roughness: .2, emissive: 0xffffff, emissiveIntensity: .4 }),
      mund: M(TOY_C.mund, { roughness: .5 }), wange: M(TOY_C.wange, { opacity: .5, depthWrite: false }),
      haar: M({ vater: TOY_C.haarV, mutter: TOY_C.haarM, tochter: TOY_C.haarT, sohn: TOY_C.haarS }[w.key], { roughness: .75 }),
      oben: M({ vater: TOY_C.polo, mutter: TOY_C.kleidM, tochter: TOY_C.kleidT, sohn: TOY_C.shirt }[w.key]),
      unten: M({ vater: TOY_C.hose, mutter: TOY_C.kleidM, tochter: TOY_C.kleidT, sohn: TOY_C.shorts }[w.key]),
      schuh: M(w.kid ? TOY_C.schuhK : TOY_C.schuh, { roughness: .5 })
    };
    const dress = w.key === 'mutter' || w.key === 'tochter';
    const g = new T.Group(), body = grp(g), hipY = w.leg, R = w.R;

    /* Beine: Hüftgelenk, Bein als Kapsel, Schuh. Vater lange Hose, Sohn kurze Hose, Mutter und Tochter Kleid (Beine Haut). */
    const legs = [-1, 1].map(sg => {
      const hip = grp(body, sg * w.hw * .55, hipY, 0), L = w.leg - .05;
      if (w.key === 'vater') add(hip, cap(w.lr, L - 2 * w.lr), mt.unten, 0, -L / 2, 0);
      else if (w.key === 'sohn') { add(hip, cap(w.lr * 1.35, L * .32), mt.unten, 0, -L * .22, 0); add(hip, cap(w.lr * .9, L * .55), mt.haut, 0, -L * .62, 0); }
      else add(hip, cap(w.lr * .9, L - 2 * w.lr), mt.haut, 0, -L / 2, 0);
      add(hip, new T.SphereGeometry(w.lr * 1.25, 20, 14), mt.schuh, 0, -L + .005, -w.lr * .55, [1, .62, 1.55]);
      return hip;
    });

    /* Rumpf: weiche Form (Drehkörper, vorne-hinten flacher). Kleid: von der Brust ausgestellt bis übers Knie. */
    const spine = grp(body, 0, hipY, 0), Tt = w.torso;
    if (dress) {
      const hem = -w.leg * (w.kid ? .38 : .5);
      add(spine, lathe([[w.hw * 1.75, hem], [w.hw * 1.7, hem + .02], [w.hw * 1.25, 0], [w.sw * .9, Tt * .55], [w.sw, Tt * .82], [w.sw * .78, Tt * .97], [w.R * .32, Tt * 1.02], [0, Tt * 1.03]]), mt.oben, 0, 0, 0, [1, 1, .8]);
    } else {
      add(spine, lathe([[0, -.03], [w.hw * 1.05, -.03], [w.hw * 1.1, Tt * .18], [w.sw * .95, Tt * .62], [w.sw, Tt * .84], [w.sw * .78, Tt * .97], [w.R * .32, Tt * 1.02], [0, Tt * 1.03]]), mt.oben, 0, 0, 0, [1, 1, .8]);
      if (w.key === 'vater') add(spine, lathe([[0, -.06], [w.hw * 1.08, -.06], [w.hw * 1.1, .07], [0, .07]]), mt.unten, 0, 0, 0, [1, 1, .82]);
      else add(spine, lathe([[0, -.05], [w.hw * 1.12, -.05], [w.hw * 1.14, .06], [0, .06]]), mt.unten, 0, 0, 0, [1, 1, .82]);
    }
    /* Polo: Kragen als weicher Ring, zwei Knöpfe */
    if (w.key === 'vater') {
      const col = add(spine, new T.TorusGeometry(w.R * .42, .022, 10, 28), mt.oben, 0, Tt * 1.0, 0, [1, 1, .85]); col.rotation.x = Math.PI / 2 + .25;
      [0, 1].forEach(i => add(spine, new T.SphereGeometry(.009, 8, 6), mt.unten, 0, Tt * (.9 - i * .07), -w.sw * .8 * (.98 - i * .02)));
    }
    /* Hals */
    add(spine, new T.CylinderGeometry(w.R * .26, w.R * .3, .08, 16), mt.haut, 0, Tt * 1.02, 0);

    /* Arme: Schultergelenk, Ärmel, Arm, Hand */
    const arms = [-1, 1].map(sg => {
      const sh = grp(spine, sg * (w.sw + w.ar * .35), Tt * .86, 0), L = w.arm;
      const sleeve = w.key === 'mutter' ? L * .55 : L * .32;
      add(sh, cap(w.ar * 1.32, sleeve * .5), mt.oben, 0, -sleeve * .35, 0);
      add(sh, cap(w.ar, L - 2 * w.ar), mt.haut, 0, -L / 2, 0);
      add(sh, new T.SphereGeometry(w.ar * 1.35, 16, 12), mt.haut, 0, -L, 0, [.9, 1.05, .9]);
      return sh;
    });

    /* Kopf: Kugel, Ohren, Haare, Gesicht (Augen mit Glanzpunkt, Brauen, Nase, Lächeln, rote Wangen) */
    const head = grp(spine, 0, Tt * 1.06 + R * .92, 0);
    add(head, new T.SphereGeometry(R, 40, 28), mt.haut, 0, 0, 0, [1.04, .98, 1]);
    [-1, 1].forEach(sg => add(head, new T.SphereGeometry(R * .17, 14, 10), mt.haut, sg * R * 1.0, -R * .05, R * .05, [.6, 1, .8]));
    const hairTop = add(head, new T.SphereGeometry(R * 1.06, 40, 16, 0, Math.PI * 2, 0, 1.12), mt.haar, 0, 0, 0, [1.05, 1, 1.02]);
    hairTop.rotation.x = -.12;
    add(head, new T.SphereGeometry(R * 1.05, 40, 20, 0, Math.PI, 0, w.key === 'mutter' ? 2.6 : 2.4), mt.haar, 0, 0, 0, [1.05, 1, 1.02]);
    if (w.key === 'vater') { const f = add(head, new T.SphereGeometry(R * .5, 20, 12), mt.haar, -R * .22, R * .62, -R * .74, [1.25, .42, .62]); f.rotation.set(-.5, 0, .35); }
    if (w.key === 'sohn') [-.32, 0, .3].forEach((x, i) => { const f = add(head, new T.SphereGeometry(R * .26, 14, 10), mt.haar, x * R, R * (.7 - Math.abs(x) * .3), -R * .76, [1, .62, .7]); f.rotation.x = -.6; });
    if (w.key === 'mutter') { add(head, new T.SphereGeometry(R * .36, 20, 14), mt.haar, 0, R * .32, R * 1.02); [-1, 1].forEach(sg => add(head, new T.SphereGeometry(R * .42, 18, 12), mt.haar, sg * R * .78, -R * .15, R * .12, [.55, 1.15, .85])); }
    if (w.key === 'tochter') [-1, 1].forEach(sg => { add(head, new T.SphereGeometry(R * .32, 18, 12), mt.haar, sg * R * 1.06, R * .02, R * .32, [.9, 1.15, .9]); add(head, new T.SphereGeometry(R * .09, 10, 8), mt.oben, sg * R * .96, R * .3, R * .25); });
    if (w.key === 'tochter' || w.key === 'mutter') { const f = add(head, new T.SphereGeometry(R * .55, 20, 12), mt.haar, R * .2, R * .62, -R * .72, [1.2, .38, .6]); f.rotation.set(-.55, 0, -.3); }
    const eye = new T.SphereGeometry(R * .085, 14, 10), hl = new T.SphereGeometry(R * .026, 8, 6), eyes = [], hls = [];
    [-1, 1].forEach(sg => {
      eyes.push(face(head, eye, mt.auge, R, sg * .34, -.02, .985, [.85, 1.15, .45]));
      hls.push(face(head, hl, mt.glanz, R, sg * .34 - .035, .03, 1.015));
      const br = face(head, new T.CapsuleGeometry(R * .022, R * .12, 4, 8), mt.haar, R, sg * .35, .25, 1.0); br.rotation.z = Math.PI / 2 + sg * .12;
      face(head, new T.CircleGeometry(R * .11, 20).rotateY(Math.PI), mt.wange, R, sg * .56, -.2, 1.005);
    });
    face(head, new T.SphereGeometry(R * .065, 12, 8), mt.haut, R, 0, -.13, .98, [1, .8, .8]);
    face(head, new T.TorusGeometry(R * .13, R * .024, 8, 20, Math.PI).rotateZ(Math.PI), mt.mund, R, 0, -.3, .985);

    g.scale.setScalar(FS);
    /* Kopfhöhe (m, mit FS) für den Blick zum Nachbarn */
    const eyeY = (hipY + Tt * 1.06 + R * .92) * FS;
    return { ...w, g, body, spine, head, legs, arms, eyes, hls, eyeY, mt, mats: Object.values(mt), ph: 0, yaw: null, turn: 0, wave: w.wave || 0, i: who.indexOf(w) };
  });
  const byKey = Object.fromEntries(members.map(m => [m.key, m]));

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), smooth = x => x * x * (3 - 2 * x), lerp = (a, b, k) => a + (b - a) * k;
  /* Blinzeln: alle 3,6 bis 4,7 s, 0,17 s lang (jede Figur in ihrem Takt) */
  const blink = (m, t) => { const per = 3.6 + m.i * .37, x = (t + m.i * 1.3) % per; return x < .17 ? Math.sin(x / .17 * Math.PI) : 0; };
  /* Ab und zu (alle 6 bis 8 s für 2 s) ein Blick zum Nachbarn: Kopf dreht sich zu ihm, Kinder schauen hinauf, Eltern hinunter */
  const GL = { w: 0, y: 0, p: 0 };
  function glance(m, t) {
    const per = 6.2 + m.i * .6, x = (t + 2.5 + m.i * 2.1) % per, nb = byKey[m.nb];
    GL.w = nb ? smooth(clamp(x / .35)) * smooth(clamp((2.05 - x) / .35)) : 0;
    if (!GL.w) return GL;
    const vx = nb.g.position.x - m.g.position.x, vz = nb.g.position.z - m.g.position.z, a = m.g.rotation.y, ca = Math.cos(a), sa = Math.sin(a);
    const lx = vx * ca - vz * sa, lz = vx * sa + vz * ca;
    GL.y = clamp(Math.atan2(-lx, -lz), -1.05, 1.05);
    GL.p = clamp(Math.atan2(nb.eyeY - m.eyeY, Math.max(.35, Math.hypot(vx, vz))), -.35, .35) * .7;
    return GL;
  }

  /* ph: Schrittphase (eine Runde = ein Doppelschritt), env: 0 steht, 1 geht, t: Zeit in s, look: Kopf drehen (+ links),
     extra.wave: 0 bis 1, die Hand auf der Seite m.wave hoch und winken (das Kind hüpft dabei ein wenig) */
  function pose(m, ph, env, t, look = 0, still = false, extra = {}) {
    const s = Math.sin(ph), c = Math.cos(ph), tt = still ? 0 : t, w = extra.wave || 0;
    m.legs[0].rotation.x = s * m.A * env; m.legs[1].rotation.x = -s * m.A * env;
    m.body.position.y = (Math.abs(c) - .6) * (m.kid ? .035 : .028) * env + Math.abs(Math.sin(tt * 6.4)) * .035 * w;
    m.body.rotation.z = s * (m.kid ? .06 : .03) * env;
    const br = still ? 0 : Math.sin(tt * 1.6 + m.fwd * 3);
    m.spine.rotation.x = .05 * env + br * .01;
    m.spine.scale.y = 1 + br * .006 * (1 - env);
    /* Arme schwingen gegengleich; im Stehen locker etwas abgespreizt. Der Winkarm (rechts 1, links −1) geht hoch und winkt. */
    const wr = m.wave > 0 ? w : 0, wl = m.wave < 0 ? w : 0, wz = 2.4 + .3 * Math.sin(tt * 8.5);
    m.arms[0].rotation.set(-s * .5 * env * (1 - wl), 0, lerp(-.14 - .04 * (1 - env), -wz, wl));
    m.arms[1].rotation.set(s * .5 * env * (1 - wr), 0, lerp(.14 + .04 * (1 - env), wz, wr));
    /* Kopf: Blick, im Stehen leicht schief gelegt (freundlich), beim Gehen kleines Nicken; ab und zu ein Blick zum Nachbarn
       (nicht beim Winken und nicht, wenn alle zum gelben Feld schauen) */
    const gl = still ? (GL.w = 0, GL) : glance(m, tt), gw = gl.w * (1 - clamp(Math.abs(look) / .3)) * (1 - clamp(w * 2));
    m.head.rotation.order = 'YXZ';
    m.head.rotation.set(-.05 * env + Math.sin(ph * 2) * .025 * env + gl.p * gw, look * (1 - gw) + gl.y * .8 * gw,
      (still ? .06 : Math.sin(tt * .7 + m.fwd * 2) * .07) * (1 - env) + (m.wave || 1) * w * .12);
    /* Blinzeln: Augen werden schmal, der Glanzpunkt verschwindet */
    const bl = still ? 0 : blink(m, tt);
    m.eyes.forEach(e => { e.scale.y = 1.15 * (1 - .9 * bl); });
    m.hls.forEach(h => { h.visible = bl < .4; });
  }
  function fade(m, o) { m.mats.forEach(x => { x.opacity = x === m.mt.wange ? o * .5 : o; x.depthWrite = x === m.mt.wange ? false : o > .5; }); m.g.visible = o > .002; }
  /* Doppelschritt in m (mit FS): zwei Schritte mit dem Beinschwung A */
  const stride = m => 4 * m.leg * Math.sin(m.A) * .95 * FS;
  members.forEach(m => pose(m, 0, 0, 0, 0, true));
  return { members, pose, fade, stride };
}
