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

/* Wortmarke GRIFFNER in Weiß, als Textur für Polo vorne und hinten.
   Als SVG-Bild statt Canvas: Safari 26 verrauscht das Auslesen von Canvas (auch als WebGL-Textur), das gäbe bunte Punkte. */
const WM_D = 'M25.6175,943.7201c0,11.20975 3.53369,20.21351 10.65137,27.03844c7.15581,6.86148 17.16066,10.74236 30.87103,10.74236c4.96815,0 8.50697,-0.8061 12.3691,-1.96933l0,-42.46217h24.9939l0,57.77744l-1.226,0.90146c-6.02352,4.42902 -21.12992,9.8111 -36.9165,9.8111c-20.21738,0 -37.18365,-6.8534 -48.50981,-17.79528c-11.35724,-10.9719 -17.85059,-26.86115 -17.85059,-44.04402c0,-18.28634 7.01257,-35.0372 19.08935,-46.58802c12.04754,-11.52285 29.94264,-18.68108 51.01265,-18.68108c13.2843,0 26.20787,3.04911 33.95395,7.42282l1.53825,0.86855l0,25.04651l-4.45708,-2.28646c-7.71088,-3.95564 -19.01914,-7.46063 -30.09972,-7.46063c-14.73455,0 -25.71753,4.16415 -33.58926,11.64783c-7.83912,7.45268 -11.83064,17.42693 -11.83064,30.03047z M205.21355,966.00257c-3.38938,0.35155 -6.23481,0.58183 -10.71755,0.58183c-7.65244,0 -10.69508,-0.3876 -14.8635,-0.99759v37.47819h-25.3057l0,-123.055h46.717c15.87667,0.06529 28.81055,3.90787 37.29433,10.86786c8.5691,7.02999 13.32017,17.93298 13.32017,30.54854c0,9.38225 -2.39398,17.82267 -6.66033,24.32575c-4.27781,6.52054 -9.10355,10.24684 -15.53701,13.6009l27.13716,43.71195h-28.74392zM218.55349,937.7964c4.91627,-3.75645 6.8637,-8.60615 6.8637,-16.0582c0,-5.99161 -1.27187,-9.96813 -5.14359,-13.16941c-4.03263,-3.33434 -10.22514,-5.18466 -20.78881,-5.12389h-19.8523v39.26481c4.00979,0.61469 7.50415,0.90749 14.7076,0.90749c11.61829,0 19.15071,-1.95248 24.2134,-5.8208z M324.29349,880.01l0,123.055h-24.9939v-123.055z M402.85289,903.7567v22.2438l41.1576,0l0,23.7467l-41.1576,0v53.3178h-25.3057l0,-123.055l68.3341,0l0,23.7467z M516.80159,903.7567v22.2438l41.1576,0l0,23.7467l-41.1576,0v53.3178h-25.3057l0,-123.055l68.3341,0l0,23.7467z M715.09218,1003.6886h-7.41239l-77.24131,-73.84446l0,73.22086h-24.9939l0,-123.8345h7.08819l77.40961,72.97777l0,-72.19827l25.1498,0z M849.77558,1003.065h-82.0533l0,-123.055l80.4943,0l0,23.7467l-56.124,0v22.2438l53.3178,0v23.7467l-53.3178,0v29.5711l57.683,0z M948.61543,966.00257c-3.38938,0.35155 -6.23481,0.58183 -10.71755,0.58183c-7.65244,0 -10.69508,-0.3876 -14.8635,-0.99759v37.47819h-25.3057l0,-123.055h46.717c15.87667,0.06529 28.81055,3.90787 37.29433,10.86786c8.5691,7.02999 13.32017,17.93298 13.32017,30.54854c0,9.38225 -2.39398,17.82267 -6.66033,24.32575c-4.27781,6.52054 -9.10355,10.24684 -15.53701,13.6009l27.13716,43.71195h-28.74392zM961.95537,937.7964c4.91627,-3.75645 6.8637,-8.60615 6.8637,-16.0582c0,-5.99161 -1.27187,-9.96813 -5.14359,-13.16941c-4.03263,-3.33434 -10.22514,-5.18466 -20.78881,-5.12389h-19.8523v39.26481c4.00979,0.61469 7.50415,0.90749 14.7076,0.90749c11.61829,0 19.15071,-1.95248 24.2134,-5.8208z';
function word(T) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="247" viewBox="-150 818.5 1300 247"><path fill="#ffffff" d="${WM_D}"/></svg>`;
  const img = new Image(), t = new T.Texture(img);
  t.colorSpace = T.SRGBColorSpace;
  img.onload = () => { t.needsUpdate = true; };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 1, depthWrite: false });
}
