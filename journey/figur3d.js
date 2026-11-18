/* GRIFFNER Journey: die Figur „du“ aus dem Concepts Hero (js/hero.js), als eigenes Modul.
   Mensch, 1,78 m, mit Gelenken, in Code gebaut (kein fremdes Modell, keine Lizenzfrage).
   Angezogen wie im Markensystem (11_Anwendungen/Textil): schwarzes GRIFFNER Polo, gelbes Feld an der Kragenspitze,
   Wortmarke auf der Brust, hinten das Logo mit gelbem Feld. Schwarze Hose, helle Schuhe.
   Das Becken bleibt ein gerader, flacher Block ohne Hüftkugeln (Kundenwunsch, keine Gesäßform von hinten).
   Blick in Richtung −z. Gehen: Gegengleich Arm und Bein, die Phase hängt am gegangenen Weg, damit nichts rutscht. */

export function figure(T) {
  const M3 = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .8, transparent: true, opacity: 1, ...o });
  const MM = {
    skin: M3(0xd9ae90, { emissive: 0x1c130d, roughness: .65 }), hair: M3(0x2a1f18, { roughness: .95 }),
    polo: M3(0x1b1b1b, { emissive: 0x070707, roughness: .9 }), pants: M3(0x1b1b1b, { emissive: 0x070707, roughness: .9 }),
    shoe: M3(0xF2F0EC, { emissive: 0x1a1a1a, roughness: .6 }), yel: M3(0xFFB200, { emissive: 0xFFB200, emissiveIntensity: .45, roughness: .7 })
  };
  const wm = word(T);
  const mats = [...Object.values(MM), wm];
  const V3 = (x, y, z) => new T.Vector3(x, y, z), UP = V3(0, 1, 0), O = V3(0, 0, 0);
  const grp = (par, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const add = (par, geo, mat, pos, s) => { const m = new T.Mesh(geo, mat); m.position.copy(pos); s && m.scale.set(...s); m.castShadow = true; par.add(m); return m; };
  const limb = (par, a, b, r0, r1, mat, joint = mat) => { const d = b.clone().sub(a), m = add(par, new T.CylinderGeometry(r1, r0, d.length(), 20), mat, a.clone().add(b).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(UP, d.normalize()); if (joint) add(par, new T.SphereGeometry(r0, 20, 14), joint, a); return m; };
  const lathe = (pts, mat, par) => add(par, new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(r, y)), 32), mat, O, [1, 1, .62]);
  const man = new T.Group();
  const body = grp(man, 0, 0, 0);
  const spine = grp(body, 0, .9, 0);
  lathe([[0, -.13], [.168, -.13], [.168, -.04], [0, -.04]], MM.pants, spine);
  lathe([[0, -.095], [.178, -.095], [.178, -.01], [.16, .15], [.164, .3], [.186, .42], [.196, .51], [.158, .565], [.072, .6], [0, .605]], MM.polo, spine);
  const col = add(spine, new T.CylinderGeometry(.064, .078, .055, 24, 1, true), MM.polo, V3(0, .6, .004), [1, 1, .86]); col.material.side = T.DoubleSide;
  add(spine, new T.BoxGeometry(.026, .02, .008), MM.yel, V3(-.045, .585, -.06)).rotation.set(-.35, 0, .5);
  add(spine, new T.BoxGeometry(.1, .08, .008), MM.yel, V3(0, .515, .124)).rotation.x = .12;
  const wb = add(spine, new T.PlaneGeometry(.1, .019), wm, V3(0, .462, .128)); wb.rotation.x = .1; wb.castShadow = false;
  const wf = add(spine, new T.PlaneGeometry(.075, .014), wm, V3(-.085, .44, -.123)); wf.rotation.y = Math.PI; wf.castShadow = false;
  const leg = x => {
    const hip = grp(body, x, .9, 0), knee = grp(hip, 0, -.4, 0), ank = grp(knee, 0, -.415, 0);
    limb(hip, O, V3(0, -.4, 0), .08, .062, MM.pants, null); limb(knee, O, V3(0, -.405, 0), .062, .054, MM.pants);
    add(ank, new T.SphereGeometry(.052, 20, 12), MM.shoe, V3(0, -.05, -.06), [.95, .62, 2.1]);
    add(ank, new T.BoxGeometry(.1, .025, .25), MM.shoe, V3(0, -.075, -.06));
    return { hip, knee, ank };
  };
  const arm = x => {
    const sh = grp(spine, x, .52, 0), el = grp(sh, 0, -.29, 0);
    limb(sh, O, V3(0, -.29, 0), .046, .04, MM.skin, MM.polo);
    limb(sh, V3(0, .01, 0), V3(0, -.15, 0), .062, .058, MM.polo, null);
    limb(el, O, V3(0, -.26, 0), .04, .031, MM.skin);
    add(el, new T.SphereGeometry(.042, 16, 12), MM.skin, V3(0, -.32, 0), [.75, 1.55, 1.05]);
    return { sh, el };
  };
  const head = grp(spine, 0, .57, 0);
  limb(head, O, V3(0, .1, -.012), .052, .049, MM.skin);
  add(head, new T.SphereGeometry(.104, 32, 24), MM.skin, V3(0, .195, -.018), [.88, 1.12, 1]);
  [-1, 1].forEach(sg => add(head, new T.SphereGeometry(.022, 12, 10), MM.skin, V3(sg * .09, .19, -.008), [.6, 1, .9]));
  const hair = add(head, new T.SphereGeometry(.111, 32, 18, 0, Math.PI * 2, 0, 1.5), MM.hair, V3(0, .2, -.016), [.92, 1.06, 1.06]);
  hair.rotation.x = .2;
  const R = { body, spine, head, L: leg(-.09), R: leg(.09), aL: arm(-.215), aR: arm(.215) };

  /* ph: Schrittphase (eine Runde = zwei Schritte), env: 0 steht, 1 geht, t: Zeit in s für Atmen, look: Kopf drehen (+ links) */
  function pose(ph, env, t, look = 0, still = false) {
    const s = Math.sin(ph), sw = s * .3 * env;
    R.L.hip.rotation.x = s * .42 * env; R.R.hip.rotation.x = -s * .42 * env;
    R.L.knee.rotation.x = -Math.max(0, Math.sin(ph + 1.2)) * .7 * env; R.R.knee.rotation.x = -Math.max(0, Math.sin(ph + 1.2 + Math.PI)) * .7 * env;
    R.L.ank.rotation.x = Math.max(0, -Math.sin(ph + .4)) * .25 * env; R.R.ank.rotation.x = Math.max(0, Math.sin(ph + .4)) * .25 * env;
    R.aR.sh.rotation.set(.03 + sw, 0, .07); R.aR.el.rotation.x = .12 + Math.max(0, sw) * .5;
    R.aL.sh.rotation.set(.02 - sw, 0, -.07); R.aL.el.rotation.x = .14 + Math.max(0, -sw) * .5;
    const br = still ? 0 : Math.sin(t * 1.4);
    R.spine.rotation.x = .05 * env + br * .006; R.spine.scale.y = 1 + br * .005;
    R.spine.rotation.y = -s * .06 * env;
    R.head.rotation.set(-.04 * env + (still ? 0 : Math.sin(t * .9) * .015), look + (still ? 0 : Math.sin(t * .37) * .03) * (1 - env), 0);
    R.body.position.y = (Math.abs(Math.cos(ph)) - .7) * .03 * env;
  }
  function fade(o) { mats.forEach(m => { m.opacity = o; m.depthWrite = o > .5 && m.map == null; }); man.visible = o > .002; }
  pose(0, 0, 0);
  return { man, rig: R, mats, pose, fade };
}

/* Wortmarke GRIFFNER in Weiß, als Textur für Polo vorne und hinten */
function word(T) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.font = '500 64px "Ofelia Text", "Helvetica Neue", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  if ('letterSpacing' in x) x.letterSpacing = '14px';
  x.fillText('GRIFFNER', 256, 52);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
  return new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 1, depthWrite: false });
}
