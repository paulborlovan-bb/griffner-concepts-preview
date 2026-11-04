/* 02 GRUNDSTÜCK in 3D. Ein Geländemodell, gesteuert vom Scrollen: zuerst von oben wie der Lageplan, dann kippt der Blick,
   die Föhren stehen auf, die Sonne zieht von Morgen bis Abend über das Modell und wirft echte Schatten.
   Dann setzt der Kran das Haus ab, es dreht sich zum Licht und weicht den Bäumen aus. Am Ende ist der Ort frei wählbar:
   das Gelände verformt sich, Bäume fallen und wachsen, das Haus wird neu gesetzt. Am Hang zeigt sich der Sockel. */
import { $, h, ease, clamp, lerp, E, reduce } from './core.js';

const BASE = 7, DROP = 26, SLOPE = .17, OGH = 3, EGH = 3.1;
const now = () => performance.now();
const easeIn = x => x * x * x;

let M, T, S, viewEl, gl, lbBox, ray;
let SITES = {}, cur = null, prev = null, swT = -1e9, P = 0, azDrag = 0, drag = false, visible = false, raf = 0, cam = null;
let O = {}, LB = {};

/* Gelände: Höhe an einer Stelle, Norden oben (z klein) ist oben am Hang */
const hAt = (z, s) => -s * z;

export function initG3(sites, key) {
  viewEl = $('[data-g-view]'); if (!viewEl) return;
  gl = $('[data-g-gl]', viewEl); lbBox = $('[data-g-lbls]', viewEl);
  sites.forEach(s => { SITES[s.key] = s; });
  cur = SITES[key] || sites[0];
  const mk = (k, t, cls = '') => { LB[k] = h('span', { class: 'info g3__lbl ' + cls }, t); lbBox.appendChild(LB[k]); };
  mk('zufahrt', 'Zufahrt'); mk('foehre', 'Föhre'); mk('morgen', 'Morgen', 'is-sand'); mk('mittag', 'Mittag', 'is-sand'); mk('abend', 'Abend', 'is-sand');
  mk('n', 'N'); mk('haus', 'Dein Haus'); mk('blick', 'Blick', 'is-sand'); mk('tal', 'Tal');
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) boot(); kick(); }), { rootMargin: '400px 0px' }).observe(viewEl);
  let sx = 0, a0 = 0;
  viewEl.addEventListener('pointerdown', e => { drag = true; sx = e.clientX; a0 = azDrag; viewEl.setPointerCapture(e.pointerId); kick(); });
  viewEl.addEventListener('pointermove', e => { if (!drag) return; azDrag = clamp(a0 - (e.clientX - sx) / 300, -1.4, 1.4); kick(); });
  ['pointerup', 'pointercancel'].forEach(t => viewEl.addEventListener(t, () => { drag = false; }));
}
export function g3Site(key) {
  const s = SITES[key]; if (!s || s === cur) return;
  prev = cur; cur = s; swT = now(); kick();
}
export function g3Tick(p) { if (Math.abs(p - P) < 1e-4 && cam) return; P = p; kick(); }

async function boot() {
  if (M) return;
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); return; }
  T = M.T;
  S = M.createStage(gl, { bg: 0x000000, fov: 26, key: 2.5, hemi: .5, fill: .3, fogNear: 400, fogFar: 1200 });
  S.ground.visible = false;
  S.hemi.color.setHex(0xd9dde2); S.hemi.groundColor.setHex(0x111111);
  S.key.shadow.mapSize.set(2048, 2048);
  Object.assign(S.key.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 });
  S.key.shadow.camera.updateProjectionMatrix();
  S.onResize = kick;
  ray = new T.Raycaster();
  build();
  kick();
}

function build() {
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .95, metalness: 0, ...o });
  const line = (c, o = 1) => new T.LineBasicMaterial({ color: c, transparent: true, opacity: o });
  const sc = S.scene;
  O.mat = {
    ground: std(0x3b3b39, { flatShading: true }), road: std(0x1c1c1b), white: std(0xF2F0EB), tree: std(0xE9E6DF, { side: T.DoubleSide }),
    roof: std(0x2f2f2d), plinth: std(0x5a5a57), glass: std(0x1a1e22, { roughness: .2, metalness: .2 }), deck: std(0xB9A386),
    sunBox: new T.MeshBasicMaterial({ color: 0xF4EEE4 }), sand: new T.MeshBasicMaterial({ color: 0xCFC3B3 }),
    cone: new T.MeshBasicMaterial({ color: 0xCFC3B3, transparent: true, opacity: .14, depthWrite: false, side: T.DoubleSide }),
    edge: line(0x8c8c89, .55), plot: line(0xFFFFFF), cont: line(0x6d6d6a, .9), north: line(0xFFFFFF, .9), coneLine: line(0xCFC3B3),
    arc: new T.LineDashedMaterial({ color: 0xCFC3B3, dashSize: 1.1, gapSize: .7, transparent: true }), cable: line(0xCACACA, .7)
  };
  /* Geländeblock aus vier Ecken, Oberseite folgt dem Gefälle */
  const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.BufferAttribute(new Float32Array(30 * 3), 3));
  O.terrain = new T.Mesh(tg, O.mat.ground); O.terrain.receiveShadow = true; O.terrain.castShadow = false; sc.add(O.terrain);
  O.plot = new T.Line(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(5 * 3), 3)), O.mat.plot); sc.add(O.plot);
  O.cont = []; for (let i = 0; i < 6; i++) { const l = new T.Line(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(2 * 3), 3)), O.mat.cont); sc.add(l); O.cont.push(l); }
  /* Zufahrt */
  O.road = new T.Mesh(new T.BoxGeometry(1, 1, 1), O.mat.road); O.road.receiveShadow = true; sc.add(O.road);
  O.roadLine = new T.Line(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(2 * 3), 3)), O.mat.plot); sc.add(O.roadLine);
  /* Nordpfeil */
  O.north = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute([0, 0, 3, 0, 0, -3, -.7, 0, -1.9, 0, 0, -3, .7, 0, -1.9, 0, 0, -3], 3)), O.mat.north); sc.add(O.north);
  /* Modellbäume: zwei gekreuzte Scheiben, Föhrenform */
  const tp = [[-.035, 0], [.035, 0], [.035, .16], [.21, .16], [.1, .42], [.17, .42], [0, 1], [-.17, .42], [-.1, .42], [-.21, .16], [-.035, .16]];
  const ts = new T.Shape(); tp.forEach(([x, y], i) => i ? ts.lineTo(x, y) : ts.moveTo(x, y)); ts.closePath();
  const tgeo = new T.ShapeGeometry(ts), tedge = new T.EdgesGeometry(tgeo);
  Object.values(SITES).forEach(site => {
    site._trees = site.trees.map(([x, z], i) => {
      const g = new T.Group(), hgt = 7 + ((i * 37) % 5) * .9;
      [0, Math.PI / 2].forEach(r => { const m = new T.Mesh(tgeo, O.mat.tree); m.rotation.y = r; m.castShadow = true; m.receiveShadow = true; m.add(new T.LineSegments(tedge, O.mat.edge)); g.add(m); });
      g.userData = { x, z, hgt }; g.visible = false; sc.add(g); return g;
    });
    site._house = makeHouse(site); sc.add(site._house.g);
    site._cone = makeCone(site); sc.add(site._cone);
  });
  /* Sonne: Bahn, drei Marken, die Sonne selbst */
  O.arc = new T.Line(new T.BufferGeometry(), O.mat.arc); sc.add(O.arc);
  O.marks = [0, 1, 2].map(() => { const m = new T.Mesh(new T.BoxGeometry(.9, .9, .9), O.mat.sand); sc.add(m); return m; });
  O.sun = new T.Mesh(new T.BoxGeometry(1.6, 1.6, 1.6), O.mat.sunBox); sc.add(O.sun);
  O.cable = new T.Line(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, 0, 80, 0], 3)), O.mat.cable); O.cable.visible = false; sc.add(O.cable);
}

/* Haus aus dem Grundriss: Erdgeschoß als Umriss, Obergeschoß als Riegel, Glas zum Garten, Terrasse, Sockel für den Hang */
function makeHouse(site) {
  const fp = site.house, xs = fp.map(p => p[0]), ys = fp.map(p => p[1]);
  const bx = [Math.min(...xs), Math.max(...xs)], by = [Math.min(...ys), Math.max(...ys)], hc = [(bx[0] + bx[1]) / 2, (by[0] + by[1]) / 2];
  const g = new T.Group(), body = new T.Group(); g.add(body);
  const flat = (pts, depth, mat, y0) => {
    const sh = new T.Shape(); pts.forEach(([x, y], i) => i ? sh.lineTo(x - hc[0], y - hc[1]) : sh.moveTo(x - hc[0], y - hc[1])); sh.closePath();
    const geo = new T.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); geo.rotateX(Math.PI / 2); geo.translate(0, y0 + depth, 0);
    const m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(geo), O.mat.edge)); return m;
  };
  const box = (x0, x1, z0, z1, y0, y1, mat) => {
    const m = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat); m.position.set((x0 + x1) / 2 - hc[0], (y0 + y1) / 2, (z0 + z1) / 2 - hc[1]);
    m.castShadow = true; m.receiveShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry), O.mat.edge)); return m;
  };
  body.add(flat(fp, EGH, O.mat.white, 0));
  /* Obergeschoß: beim breiten Grundriss der Riegel über dem Wohnflügel, beim schmalen die Mitte */
  const wide = bx[1] - bx[0] > 12;
  const og = wide ? [bx[0] + 3.2, bx[1], by[0], by[0] + 7.5] : [bx[0], bx[1], by[0] + 3, by[0] + 16];
  body.add(box(og[0], og[1], og[2], og[3], EGH, EGH + OGH, O.mat.white));
  body.add(box(og[0] - .2, og[1] + .2, og[2] - .2, og[3] + .2, EGH + OGH, EGH + OGH + .28, O.mat.roof));
  body.add(box(og[0] + .8, og[1] - .8, og[3] - .02, og[3] + .06, EGH + .5, EGH + OGH - .5, O.mat.glass));
  /* Glas im Erdgeschoß zur Südseite */
  const south = fp.filter(p => Math.abs(p[1] - by[1]) < .01).map(p => p[0]);
  if (south.length > 1) { const a = Math.min(...south), b = Math.max(...south); body.add(box(a + .6, b - .6, by[1] - .02, by[1] + .06, .3, EGH - .4, O.mat.glass)); }
  if (site.terr) body.add(flat(site.terr, .16, O.mat.deck, 0));
  const plinth = box(bx[0] + .1, bx[1] - .1, by[0] + .1, by[1] - .1, -1, 0, O.mat.plinth); body.add(plinth);
  g.visible = false;
  return { g, body, hc, bx, by, plinth };
}

function makeCone(site) {
  const v = site.view, g = new T.Group();
  const geo = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute([v.from[0], 0, v.from[1], v.to[0] - v.spread, 0, v.to[1], v.to[0] + v.spread, 0, v.to[1]], 3));
  g.add(new T.Mesh(geo, O.mat.cone));
  const ln = new T.Line(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(3 * 3), 3)), O.mat.coneLine); g.add(ln);
  g.userData = { ln, geo }; g.visible = false;
  return g;
}

/* Linie anteilig zeichnen: Punkte bis zur Länge k */
function partial(pts, k) {
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = pts[i].distanceTo(pts[i - 1]); seg.push(l); tot += l; }
  let left = tot * k; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (left >= seg[i - 1]) { out.push(pts[i]); left -= seg[i - 1]; continue; }
    out.push(pts[i - 1].clone().lerp(pts[i], seg[i - 1] ? left / seg[i - 1] : 0)); break;
  }
  return out;
}
function setLine(l, pts) {
  const a = l.geometry.attributes.position;
  pts.forEach((p, i) => a.setXYZ(i, p.x, p.y, p.z));
  a.needsUpdate = true; l.geometry.setDrawRange(0, pts.length); l.geometry.computeBoundingSphere();
}

/* Kamera so weit weg, dass die Box ins Bild passt, Ziel auf die Bildmitte geschoben (wie im Arbeitsmodell) */
function fit(box, az, el) {
  const [x0, x1, y0, y1, z0, z1] = box, c = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  const f = [-Math.sin(az) * Math.cos(el), -Math.sin(el), -Math.cos(az) * Math.cos(el)];
  const rl = Math.hypot(f[0], f[2]) || 1e-6, r = [-f[2] / rl, 0, f[0] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const W = gl.clientWidth || 1, H = gl.clientHeight || 1, t13 = Math.tan(13 * Math.PI / 180);
  const m = W < 560 ? 8 : 24, tv = t13 * (1 - 2 * m / H), th = t13 * W / H * (1 - 2 * m / W);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const pts = []; [x0, x1].forEach(x => [y0, y1].forEach(y => [z0, z1].forEach(z => pts.push([x, y, z]))));
  const dist = () => { let d = 0; pts.forEach(p => { const q = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], zf = dot(q, f); d = Math.max(d, Math.abs(dot(q, r)) / th - zf, Math.abs(dot(q, u)) / tv - zf); }); return d; };
  let d = dist(), ax = [1e9, -1e9], ay = [1e9, -1e9];
  pts.forEach(p => { const q = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], dep = dot(q, f) + d, px = dot(q, r) / dep, py = dot(q, u) / dep; ax = [Math.min(ax[0], px), Math.max(ax[1], px)]; ay = [Math.min(ay[0], py), Math.max(ay[1], py)]; });
  const sx = (ax[0] + ax[1]) / 2 * d, sy = (ay[0] + ay[1]) / 2 * d;
  for (let i = 0; i < 3; i++) c[i] += r[i] * sx + u[i] * sy;
  return { tx: c[0], ty: c[1], tz: c[2], dist: dist(), el, az };
}

function frame() {
  raf = 0;
  if (!S || !cur) return;
  const t = now(), p = P;
  const re = reduce ? 1 : clamp((t - swT) / 2600), sw = re < 1;
  if (!sw && prev) prev = null;
  const R = (a, b) => (sw ? E(re, a, b) : 1);
  /* Gelände: Ecken und Gefälle verformen sich beim Wechsel */
  const km = prev ? R(.15, .55) : 1;
  const cs = cur.plot.map((c, i) => prev ? [lerp(prev.plot[i][0], c[0], km), lerp(prev.plot[i][1], c[1], km)] : c);
  const slope = lerp(prev && prev.contours ? SLOPE : 0, cur.contours ? SLOPE : 0, prev ? km : 1);
  const hz = z => hAt(z, slope);
  const rise = E(p, 0, .1);
  const top = cs.map(([x, z]) => new T.Vector3(x, lerp(-BASE, hz(z), rise), z));
  const bot = cs.map(([x, z]) => new T.Vector3(x, -BASE - 1, z));
  const a = O.terrain.geometry.attributes.position; let vi = 0;
  const tri = (p1, p2, p3) => { [p1, p2, p3].forEach(q => a.setXYZ(vi++, q.x, q.y, q.z)); };
  tri(top[0], top[2], top[1]); tri(top[0], top[3], top[2]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; tri(top[i], top[j], bot[j]); tri(top[i], bot[j], bot[i]); }
  a.needsUpdate = true; O.terrain.geometry.computeVertexNormals(); O.terrain.geometry.computeBoundingSphere();
  const xs = cs.map(c => c[0]), zs = cs.map(c => c[1]);
  const bx = [Math.min(...xs), Math.max(...xs)], bz = [Math.min(...zs), Math.max(...zs)], cx = (bx[0] + bx[1]) / 2, cz = (bz[0] + bz[1]) / 2;
  /* Grenze zeichnet sich */
  const lift = q => q.clone().setY(q.y + .06);
  const ring = [...top, top[0]].map(lift);
  const kp = Math.min(E(p, .02, .14), sw ? R(.1, .6) : 1);
  setLine(O.plot, partial(ring, kp)); O.plot.visible = kp > .001;
  /* Höhenlinien am Hang */
  O.cont.forEach((l, i) => {
    const z = bz[0] + 3 + i * 5, xl = lerp(cs[0][0], cs[3][0], clamp((z - cs[0][1]) / (cs[3][1] - cs[0][1] || 1))), xr = lerp(cs[1][0], cs[2][0], clamp((z - cs[1][1]) / (cs[2][1] - cs[1][1] || 1)));
    setLine(l, [new T.Vector3(xl, hz(z) + .04, z), new T.Vector3(xr, hz(z) + .04, z)]);
    l.visible = slope > .01 && z < bz[1] - .5 && E(p, .12, .2) > 0;
  });
  O.mat.cont.opacity = .9 * slope / SLOPE * E(p, .12, .2);
  /* Zufahrt oben */
  const roadK = E(p, .08, .16), ry = hz(-3.2);
  O.road.scale.set(bx[1] - bx[0] + 8, Math.max(.001, (ry + BASE) * roadK), 2.4); O.road.position.set(cx, -BASE + (ry + BASE) * roadK / 2, -3.2);
  O.road.visible = roadK > .001;
  setLine(O.roadLine, [new T.Vector3(bx[0] - 4, ry + .05, -2), new T.Vector3(bx[1] + 4, ry + .05, -2)]); O.roadLine.visible = roadK > .5;
  /* Nordpfeil rechts oben */
  O.north.position.set(bx[1] + 4.5, hz(2) + .05, 2); O.north.visible = E(p, .02, .1) > .01;
  O.mat.north.opacity = .9 * E(p, .02, .1);
  /* Bäume */
  Object.values(SITES).forEach(site => {
    const on = site === cur, off = site === prev;
    site._trees.forEach((g, i) => {
      const u = g.userData;
      let k = 0;
      if (on) k = Math.min(E(p, .2 + i * .015, .27 + i * .015), sw ? R(.45 + i * .03, .62 + i * .03) : 1);
      else if (off) k = Math.min(1 - R(0, .25), E(p, .2, .27));
      g.visible = k > .001;
      if (g.visible) { g.position.set(u.x, hz(u.z), u.z); const s = u.hgt * (on ? ease(k) : k); g.scale.set(s, s, s); }
    });
    /* Haus: der Kran setzt es dort ab, wo man es achtlos abstellen würde, dann dreht und rückt es an seinen Platz */
    const H = site._house;
    let show = false, x = 0, z = 0, r = 0, y = 0, drop = 0;
    if (on) {
      const dk = Math.min(E(p, .58, .64), sw ? R(.5, .68) : 1), mv = Math.min(E(p, .64, .76), sw ? R(.68, 1) : 1);
      show = dk > .001; drop = 1 - dk;
      x = lerp(site.start.x, site.fit.x, mv); z = lerp(site.start.y, site.fit.y, mv); r = lerp(site.start.r, site.fit.r, mv);
    } else if (off) {
      const lk = R(0, .32);
      show = lk < 1 && E(p, .58, .64) > 0; drop = easeIn(lk);
      x = site.fit.x; z = site.fit.y; r = site.fit.r;
    }
    H.g.visible = show;
    if (show) {
      y = hz(z - (H.by[1] - H.by[0]) / 2) + drop * DROP;
      H.g.position.set(x, y, z); H.g.rotation.y = -r * Math.PI / 180;
      const pk = slope * (H.by[1] - H.by[0]) + .35; H.plinth.scale.y = pk; H.plinth.position.y = -pk / 2;
      if (on || off) H._live = { x, y, z, drop };
    }
    /* Blick */
    const C = site._cone;
    const vk = on ? Math.min(E(p, .8, .9), sw ? R(.8, 1) : 1) : 0;
    C.visible = vk > .001;
    if (C.visible) {
      const v = site.view, ap = new T.Vector3(v.from[0], hz(v.from[1]) + .08, v.from[1]);
      const L1 = new T.Vector3(v.to[0] - v.spread, hz(v.to[1]) + .08, v.to[1]), R1 = new T.Vector3(v.to[0] + v.spread, hz(v.to[1]) + .08, v.to[1]);
      const ga = C.userData.geo.attributes.position; ga.setXYZ(0, ap.x, ap.y, ap.z); ga.setXYZ(1, L1.x, L1.y, L1.z); ga.setXYZ(2, R1.x, R1.y, R1.z); ga.needsUpdate = true;
      setLine(C.userData.ln, partial([L1, ap, R1], vk));
      O.mat.cone.opacity = .14 * vk;
    }
  });
  /* Kranseil über dem schwebenden Haus */
  const live = [cur, prev].filter(Boolean).map(s => s._house).find(Hh => Hh.g.visible && Hh._live && Hh._live.drop > .002 && Hh._live.drop < .999);
  O.cable.visible = !!live;
  if (live) O.cable.position.set(live._live.x, live._live.y + EGH + OGH + .3, live._live.z);
  /* Sonne: vor Schritt drei hoch im Süden, dann von Morgen bis Abend, danach Abendlicht */
  const Rx = (bx[1] - bx[0]) / 2 + 5, Rz = 5, H0 = 1, Hs = 21;
  const sp = th => new T.Vector3(cx + Rx * Math.cos(th), H0 + Hs * Math.sin(th), cz + Rz * Math.sin(th));
  const sunVis = E(p, .4, .44);
  const th = p < .42 ? lerp(.42, .06, E(p, .36, .42)) * Math.PI : p < .56 ? lerp(.06, .94, clamp((p - .42) / .14)) * Math.PI : lerp(.94, .88, E(p, .56, .64)) * Math.PI;
  const arcKey = [bx, bz].join();
  if (O.arcKey !== arcKey) { O.arcKey = arcKey; const pts = []; for (let i = 0; i <= 64; i++) pts.push(sp(Math.PI * i / 64)); O.arc.geometry.setFromPoints(pts); O.arc.computeLineDistances(); }
  O.arc.visible = sunVis > .01; O.mat.arc.opacity = sunVis;
  [0, .5, 1].forEach((f, i) => { O.marks[i].position.copy(sp(Math.PI * f)); O.marks[i].visible = sunVis > .01; });
  const spos = sp(th); O.sun.position.copy(spos); O.sun.visible = sunVis > .01;
  const center = new T.Vector3(cx, 0, cz), dir = spos.clone().sub(center).normalize();
  /* Kamera: von oben wie der Plan, dann gekippt, mit langsamer Fahrt */
  const tilt = E(p, .1, .3);
  const el = lerp(1.38, .62, tilt) - E(p, .36, .44) * .16 + E(p, .58, .72) * .08;
  const nar = (gl.clientWidth || 999) < 560;
  const azv = (lerp(0, -.5, tilt) + E(p, .4, .58) * .3 - E(p, .6, .8) * .12) * (nar ? .35 : 1) + azDrag;
  const box = [bx[0] - 1 - sunVis * 4.5, bx[1] + (nar ? 5.6 : 7), -BASE * .6, 10 + sunVis * 13, -5, bz[1] + 1];
  const v = fit(box, azv, el), c = cam || (cam = { ...v });
  let moving = false;
  Object.keys(v).forEach(q => { const d = v[q] - c[q]; if (Math.abs(d) > .002 && !reduce && (sw || drag)) { c[q] += d * .12; moving = true; } else c[q] = v[q]; });
  S.orbit(c.az, c.el, c.dist, c.tx, c.ty, c.tz);
  S.key.position.copy(center).addScaledVector(dir, 90); S.key.target.position.copy(center); S.key.target.updateMatrixWorld();
  S.key.intensity = lerp(1.6, 2.6, clamp(dir.y * 1.6));
  S.r.render(S.scene, S.cam);
  labels(p, re, { bx, bz, cx, hz, sp, sunVis });
  if ((sw || drag || moving) && visible) raf = requestAnimationFrame(frame);
}
function kick() { if (!raf && S && visible) raf = requestAnimationFrame(frame); }

function labels(p, re, g) {
  const W = gl.clientWidth, H = gl.clientHeight;
  const put = (k, v3, o, dx = 0, dy = 0, anchor = 'c') => {
    const el = LB[k]; if (!el) return;
    if (o <= .01 || !v3) { el.style.opacity = '0'; return; }
    const q = v3.clone().project(S.cam);
    if (q.z > 1) { el.style.opacity = '0'; return; }
    const x = (q.x + 1) / 2 * W + dx, y = (1 - q.y) / 2 * H + dy;
    const tx = anchor === 'l' ? '0' : anchor === 'r' ? '-100%' : '-50%';
    el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${tx},-50%)`;
    el.style.opacity = o.toFixed(3);
  };
  const sw = re < 1, R = (a, b) => (sw ? E(re, a, b) : 1);
  put('zufahrt', new T.Vector3(g.bx[0] - 3, g.hz(-3.2) + .1, -3.2), E(p, .1, .18), 0, -12, 'l');
  const t0 = cur._trees[0], tu = t0.userData;
  put('foehre', new T.Vector3(tu.x, g.hz(tu.z) + tu.hgt * .55, tu.z), Math.min(E(p, .28, .34), R(.7, .9)), 14, 0, 'l');
  ['morgen', 'mittag', 'abend'].forEach((k, i) => put(k, g.sp(Math.PI * [0, .5, 1][i]), g.sunVis, 0, 18));
  put('n', new T.Vector3(g.bx[1] + 4.5, g.hz(5.6), 5.6), E(p, .02, .1), 0, 6);
  const Hh = cur._house;
  put('haus', Hh.g.visible ? new T.Vector3(Hh.g.position.x, Hh.g.position.y + EGH + OGH + 1.2, Hh.g.position.z) : null, Math.min(E(p, .74, .8), R(.85, 1)));
  const v = cur.view;
  put('blick', new T.Vector3(v.to[0], g.hz(v.to[1]) + .2, v.to[1] + 1.4), Math.min(E(p, .86, .9), R(.9, 1)));
  put('tal', cur.contours ? new T.Vector3(g.bx[1] - 5, g.hz(g.bz[1]) - 1.5, g.bz[1] + 1.5) : null, cur.contours ? Math.min(E(p, .14, .22), R(.6, .8)) : 0);
}
