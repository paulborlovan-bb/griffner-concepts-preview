/* Services (Runde 45): die acht Muster im Leistungsumfang (leistungsumfang.html), three.js.
   Eine Leinwand bleibt rechts stehen, beim Scrollen wechselt das Muster. Jedes Muster ist ein Stück Bauteil in echten Materialien,
   das sich in seine Schichten auseinanderzieht und langsam dreht. Beschriftungen stehen links in einer Spalte mit Linie zum Bauteil.
   Schichtdicken sind schematisch (gesamt stimmt: Wand 42,25 cm, Boden 21,5 cm), Beschriftungen ohne Einzelmaße. */
import * as T from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { cube, MAT, WALL, ROOF, FLOOR } from './svc-geo.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = x => Math.max(0, Math.min(1, x));
const eio = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = x => 1 - Math.pow(1 - x, 3);
const GELB = 0xffb200;
const SV = 'http://www.w3.org/2000/svg';

/* ---------- Muster ----------
   Jedes Muster: g (Gruppe), ex: [[Mesh, dx, dy, dz]] Weg beim Auseinanderziehen, labs: [[Punkt, Text, heiß]], upd(t, e) optional */
function mk() {
  const g = new T.Group(), ex = [], labs = [];
  const add = (geo, mat, d = [0, 0, 0], parent = g) => { const m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m); if (d) ex.push([m, ...d]); return m; };
  return { g, ex, labs, add };
}

const BUILD = {
  /* 01 Open Space: Boden, zwei Punkte, Decke darüber, Wände frei, sie tragen nicht */
  openspace() {
    const s = mk(), { add } = s;
    add(cube(-.8, 0, -.5, .8, .05, .5), MAT.oak(), null);
    const post = MAT.spruce(); post.color.setHex(GELB); post.emissive.setHex(GELB); post.emissiveIntensity = .35;
    [-.33, .33].forEach(x => add(cube(x - .028, .05, -.028, x + .028, .64, .028), post, null));
    add(cube(-.8, .64, -.5, .8, .71, .5), MAT.slab(), [0, .22, 0]);
    const wm = MAT.paint();
    const wa = add(cube(-.016, .05, -.5, .016, .6, -.08), wm, null);
    const wb = add(cube(.06, .05, -.016, .8, .6, .016), wm, null);
    s.upd = (t) => { wa.position.x = -.56 + .1 * Math.sin(t * .55); wb.position.z = .22 + .12 * Math.sin(t * .42 + 1.3); };
    s.labs.push([[-.33, .64, .028], 'Ableitungspunkt', true], [[.33, .64, .028], 'Ableitungspunkt', true],
      [[-.8, .675, .5], 'Massivholzdecke'], [[-.56, .6, -.3], 'Innenwand, trägt nicht'], [[-.8, .025, .5], 'Eichenparkett']);
    s.view = { az: -.62, el: .42, rot: .2 };
    return s;
  },
  /* 02 Die GRIFFNER Wand: acht Schichten, außen vorne (z+), innen hinten */
  wand() {
    const s = mk(), n = WALL.length, Tt = WALL.reduce((a, l) => a + l.d, 0);
    let z = Tt / 2;
    WALL.forEach((l, i) => {
      const z0 = z - l.d, m = MAT[l.m]();
      s.add(cube(-.45, 0, z0, .45, 1.0, z), m, [0, 0, ((n - 1) / 2 - i) * .075]);
      s.labs.push([[-.45, .9 - i * .105, (z + z0) / 2], l.name]);
      z = z0;
    });
    s.labs.push([[.0, 1.0, 0], '42,25 cm', true]);
    s.view = { az: -.78, el: .3, rot: .1 };
    return s;
  },
  /* 03 Dach: Schichten von innen nach außen, 35 Grad geneigt, offen bis zum First */
  dach() {
    const s = mk(), n = ROOF.length, tilt = new T.Group();
    tilt.rotation.z = 35 * Math.PI / 180; tilt.position.set(-.05, .1, 0); s.g.add(tilt);
    let y = 0;
    ROOF.forEach((l, i) => {
      const y1 = y + l.d;
      s.add(cube(-.55, y, -.4, .55, y1, .4), MAT[l.m](), [0, (i - (n - 1) / 2) * .08, 0], tilt);
      s.labs.push([[-.2 - i * .06, (y + y1) / 2, .4], l.name, false, tilt]);
      y = y1;
    });
    s.labs.push([[.3, y, 0], 'U-Wert 0,13', true, tilt]);
    s.view = { az: -.5, el: .22, rot: .35 };
    return s;
  },
  /* 04 Holz-Alu-Fenster: Ecke mit Rahmen, Alu außen, Holz innen, drei Scheiben */
  fenster() {
    const s = mk(), { add } = s;
    const wood = MAT.frameNatur(), alu = MAT.alu(), gl = () => { const m = MAT.glass(); m.opacity = .32; m.side = T.DoubleSide; return m; };
    /* Holz: Schwelle unten und Stock links (innen z −.05 bis .03) */
    add(cube(-.5, 0, -.05, .5, .1, .03), wood, null);
    add(cube(-.5, .1, -.05, -.4, 1.0, .03), wood, null);
    /* Alu Schale außen */
    add(cube(-.5, 0, .03, .5, .1, .046), alu, [0, 0, .2]);
    add(cube(-.5, .1, .03, -.4, 1.0, .046), alu, [0, 0, .2]);
    /* drei Scheiben mit Abstandhaltern */
    [-.03, -.008, .014].forEach((z, i) => {
      add(cube(-.42, .085, z, .5, .98, z + .006), gl(), [0, .03, (i - 1) * .085 + .06]);
      if (i < 2) add(cube(-.42, .085, z + .006, .5, .1, z + .022), MAT.dark(), [0, .03, (i - .5) * .085 + .06]);
    });
    s.labs.push([[-.5, .55, .046], 'Alu außen'], [[-.45, .05, -.05], 'Holz innen'], [[.1, .6, .02], 'Dreifachglas'], [[.5, .9, -.02], 'Ug 0,6 W/m²K', true]);
    s.view = { az: -.66, el: .2, rot: .25 };
    return s;
  },
  /* 05 Massivholzdecke: Lamellen in Sichtqualität, natur und weiß lasiert, darunter Tram auf Wunsch */
  decke() {
    const s = mk(), N = 7, w = .14, z0 = -N * w / 2;
    for (let i = 0; i < N; i++) {
      const m = i < 4 ? MAT.slab() : MAT.slabWhite();
      s.add(cube(-.5, .36, z0 + i * w, .5, .52, z0 + (i + 1) * w - .002), m, [0, .06, (i - (N - 1) / 2) * .018]);
    }
    const sp = MAT.spruce();
    [-.25, .25].forEach(x => s.add(cube(x - .05, .16, -.5, x + .05, .36, .5), sp, [0, -.12, 0]));
    s.labs.push([[-.5, .44, z0 + w * 1.5], 'Natur'], [[-.5, .44, z0 + w * 5.5], 'Weiß lasiert'], [[-.25, .26, .5], 'Tram, auf Wunsch'], [[.5, .52, z0 + w * 6.5], 'Sichtqualität', true]);
    s.view = { az: -.7, el: -.3, rot: .15, ty: .36 };
    return s;
  },
  /* 06 Naturparkett: fünf Ebenen, 21,5 cm, Rohre der Flächenheizung im Estrich */
  parkett() {
    const s = mk(), n = FLOOR.length;
    let y = 0, tritt = 0;
    FLOOR.forEach((l, i) => {
      const y1 = y + l.d * 1.6;
      s.add(cube(-.5, y, -.42, .5, y1, .42), MAT[l.m](), [0, i * .085, 0]);
      s.labs.push([[-.5, (y + y1) / 2, .42], l.name]);
      if (l.k === 'tritt') tritt = { y: y1, i };
      y = y1;
    });
    const pipe = MAT.pipe();
    [-.3, -.1, .1, .3].forEach(z => {
      const pg = new T.CylinderGeometry(.011, .011, .98, 12); pg.rotateZ(Math.PI / 2); pg.translate(0, tritt.y + .012, z);
      const c = new T.Mesh(pg, pipe);
      c.castShadow = true; s.g.add(c); s.ex.push([c, 0, (tritt.i + .45) * .085, 0]);
    });
    s.labs.push([[.5, tritt.y + .012, .3], 'Flächenheizung'], [[0, y, 0], '21,5 cm', true]);
    s.view = { az: -.62, el: .34, rot: .2, ty: .2 };
    return s;
  },
  /* 07 Raumhöhe: die Decke steigt von 2,50 m auf 2,72 m, die übliche Höhe bleibt als Linie */
  raumhoehe() {
    const s = mk(), { add } = s, k = .34, h0 = 2.5 * k, h1 = 2.72 * k;
    add(cube(-.62, 0, -.45, .62, .03, .45), MAT.oak(), null);
    const back = add(cube(-.62, .03, -.45, .62, 1, -.42), MAT.paint(), null);
    const side = add(cube(-.62, .03, -.42, -.59, 1, .45), MAT.paint(), null);
    const ceil = add(cube(-.62, 0, -.45, .62, .04, .45), MAT.slab(), null);
    /* übliche Höhe als gestrichelte Linie an Rück und Seitenwand */
    const pts = [[.62, -.418], [-.588, -.418], [-.588, .45], [.62, .45], [.62, -.418]].map(([x, z]) => new T.Vector3(x, h0, z));
    const dl = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineDashedMaterial({ color: 0x000000, dashSize: .035, gapSize: .025 }));
    dl.computeLineDistances(); s.g.add(dl);
    /* Maßlinie vorne links */
    const ml = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-.66, .03, .45), new T.Vector3(-.66, 1, .45)]), new T.LineBasicMaterial({ color: 0x000000 }));
    s.g.add(ml);
    s.upd = (t, e) => {
      const h = h0 + (h1 - h0) * e;
      back.scale.y = side.scale.y = (h - .03) / .97; back.position.y = side.position.y = .03 - .03 * back.scale.y;
      ceil.position.y = h; ml.scale.y = (h - .03) / .97; ml.position.y = .03 - .03 * ml.scale.y;
      s.labs[0][0][1] = h + .02;
    };
    s.labs.push([[-.66, h1, .45], '2,72 m', true], [[.62, h0, .45], '2,50 m, üblich']);
    s.view = { az: -.62, el: .2, rot: .25, ty: .45 };
    return s;
  },
  /* 08 Fassade: links Lärche, rechts Putz, dahinter Lattung, Hinterlüftung und Fassadenbahn auf Holzfaser */
  fassade() {
    const s = mk(), { add } = s;
    add(cube(-.6, 0, -.08, .6, 1, -.02), MAT.fibre(), null);
    add(cube(-.6, 0, -.02, .6, 1, -.016), MAT.membrane(), [0, 0, .06]);
    const sp = MAT.spruce();
    [-.52, -.18, .18, .52].forEach(x => add(cube(x - .025, 0, -.016, x + .025, 1, .014), sp, [0, 0, .14]));
    const lm = MAT.larch();
    for (let i = 0; i < 5; i++) { const x0 = -.6 + i * .12; add(cube(x0, 0, .014, x0 + .112, 1, .036), lm, [0, 0, .24]); }
    add(cube(0, 0, .014, .6, 1, .03), MAT.osb(), [0, 0, .2]);
    add(cube(0, 0, .03, .6, 1, .042), MAT.putz(), [0, 0, .25]);
    s.labs.push([[-.3, .9, .036], 'Lärche'], [[.3, .9, .042], 'Putz'], [[-.6, .5, 0], 'Hinterlüftung', true], [[-.6, .3, -.018], 'Fassadenbahn'], [[-.6, .12, -.05], 'Holzfaser']);
    s.view = { az: -.58, el: .2, rot: .15 };
    return s;
  }
};

export async function createMuster(host, labsEl) {
  const R = new T.WebGLRenderer({ antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  host.insertBefore(R.domElement, host.firstChild);
  const scene = new T.Scene(); scene.background = new T.Color(0xffffff);
  const pmrem = new T.PMREMGenerator(R); scene.environment = pmrem.fromScene(new RoomEnvironment(R), .04).texture; pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff, 0xcfc8bd, .4));
  const sun = new T.DirectionalLight(0xfff1e0, 2.1); sun.position.set(-2.4, 4.2, 3); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: .5, far: 12 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .01; sun.shadow.radius = 4;
  scene.add(sun);
  const ground = new T.Mesh(new T.PlaneGeometry(8, 8), new T.ShadowMaterial({ opacity: .1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.002; ground.receiveShadow = true; scene.add(ground);
  const cam = new T.PerspectiveCamera(24, 1, .05, 60);

  /* Beschriftungen: eine Linie je Punkt, Kästchen links in einer Spalte */
  const svg = document.createElementNS(SV, 'svg'); svg.setAttribute('class', 'ml__svg'); labsEl.appendChild(svg);

  const S = {};
  let cur = null, prev = null, W = 1, H = 1, visible = false, raf = 0;
  const v3 = new T.Vector3();
  const get = k => {
    if (S[k]) return S[k];
    const s = BUILD[k](); s.k = k; s.g.visible = false; scene.add(s.g);
    s.box = new T.Box3();
    s.ex.forEach(([m, dx, dy, dz]) => m.position.set(dx, dy, dz)); s.g.updateMatrixWorld(true); s.box.setFromObject(s.g);
    s.ex.forEach(([m]) => m.position.set(0, 0, 0));
    s.els = s.labs.map(([, txt, hot]) => {
      const el = document.createElement('div'); el.className = 'ml' + (hot ? ' is-hot' : ''); el.innerHTML = `<b>${txt}</b>`; labsEl.appendChild(el);
      const ln = document.createElementNS(SV, 'path'); ln.setAttribute('class', 'ml__ln' + (hot ? ' is-hot' : '')); svg.appendChild(ln);
      const dot = document.createElementNS(SV, 'rect'); dot.setAttribute('class', 'ml__pt' + (hot ? ' is-hot' : '')); dot.setAttribute('width', 5); dot.setAttribute('height', 5); svg.appendChild(dot);
      return { el, ln, dot };
    });
    return S[k] = s;
  };

  /* Kamera: Blick von vorne links, Abstand so, dass das auseinandergezogene Muster neben die Beschriftungen passt */
  /* Runde 61 (Kunde): am Telefon ohne Beschriftung, das Muster groß in der Mitte */
  const PH = () => innerWidth < 810;
  const LABW = () => (PH() ? 0 : W < 520 ? W * .46 : Math.min(170, W * .34));
  function frameCam(s, k = 1, from = null) {
    const c = s.box.getCenter(new T.Vector3()), r = s.box.getSize(new T.Vector3()).length() / 2;
    const vf = cam.fov * Math.PI / 180, effW = W - LABW() - (PH() ? 0 : 24), hf = 2 * Math.atan(Math.tan(vf / 2) * effW / H);
    const d = r / Math.sin(Math.min(vf, hf) / 2) * (PH() ? .98 : .9);
    const v = s.view, ty = v.ty ?? c.y;
    const to = { d, az: v.az, el: v.el, tx: c.x, ty, tz: c.z };
    const f = from || to;
    const m = (a, b) => a + (b - a) * k;
    const D = m(f.d, to.d), A = m(f.az, to.az), E = m(f.el, to.el);
    cam.position.set(m(f.tx, to.tx) + Math.sin(A) * Math.cos(E) * D, m(f.ty, to.ty) + Math.sin(E) * D, m(f.tz, to.tz) + Math.cos(A) * Math.cos(E) * D);
    cam.lookAt(m(f.tx, to.tx), m(f.ty, to.ty), m(f.tz, to.tz));
    return to;
  }
  let camFrom = null, camTo = null;

  function size() {
    const r = host.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    R.setSize(W, H, false); R.domElement.style.width = '100%'; R.domElement.style.height = '100%';
    cam.aspect = W / H;
    /* Muster nach rechts, links Platz für die Spalte */
    const sh = LABW() / 2; cam.setViewOffset(W, H, -sh, 0, W, H);
    cam.updateProjectionMatrix();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (cur) camTo = frameCam(cur);
    kick();
  }

  function place(s, on) {
    const cols = [];
    s.labs.forEach(([p, , , parent], i) => {
      v3.set(...p); (parent || s.g).localToWorld(v3); v3.project(cam);
      cols.push({ i, ax: (v3.x + 1) / 2 * W, ay: (1 - v3.y) / 2 * H });
    });
    /* Kästchen ohne Überlappung untereinander, in der Reihenfolge der Punkte */
    const sorted = cols.slice().sort((a, b) => a.ay - b.ay);
    const gap = W < 520 ? 25 : 30;
    let y = -1e9; sorted.forEach(c => { c.y = Math.max(c.ay, y + gap); y = c.y; });
    const over = y - (H - 18); if (over > 0) sorted.forEach(c => { c.y -= over; });
    sorted.forEach((c, j) => { if (c.y < 18) c.y = 18 + j * gap; });
    cols.forEach(c => {
      const o = s.els[c.i], w = o.el.offsetWidth || 120, x1 = 12 + w;
      o.el.style.transform = `translate(12px,${(c.y - 12).toFixed(1)}px)`;
      const mx = Math.max(x1 + 14, c.ax - 26);
      o.ln.setAttribute('d', `M${x1} ${c.y.toFixed(1)}H${mx.toFixed(1)}L${c.ax.toFixed(1)} ${c.ay.toFixed(1)}`);
      o.dot.setAttribute('x', (c.ax - 2.5).toFixed(1)); o.dot.setAttribute('y', (c.ay - 2.5).toFixed(1));
      o.el.classList.toggle('is-on', on); o.ln.classList.toggle('is-on', on); o.dot.classList.toggle('is-on', on);
    });
  }
  const hideLabs = s => s && s.els.forEach(o => { o.el.classList.remove('is-on'); o.ln.classList.remove('is-on'); o.dot.classList.remove('is-on'); });

  let tSwitch = 0;
  function frame(now) {
    raf = 0;
    const t = now / 1000, ts = (now - tSwitch) / 1000;
    /* raus: altes Muster sinkt und wird kleiner */
    if (prev) {
      const k = eio(cl(ts / .38));
      prev.g.position.y = -.12 * k; prev.g.scale.setScalar(1 - .1 * k);
      if (k >= 1) { prev.g.visible = false; prev = null; }
    }
    if (cur) {
      const kin = reduce ? 1 : eo(cl((ts - .18) / .55));
      cur.g.visible = !prev || ts > .18;
      cur.g.position.y = .1 * (1 - kin); cur.g.scale.setScalar(.92 + .08 * kin);
      const e = reduce ? 1 : eio(cl((ts - .5) / 1.1));
      const breathe = reduce ? 0 : Math.sin(t * .32) * .2;
      cur.g.rotation.y = cur.view.rot + breathe;
      cur.ex.forEach(([m, dx, dy, dz]) => m.position.set(dx * e, dy * e, dz * e));
      if (cur.upd) cur.upd(t, e);
      const kc = reduce ? 1 : eio(cl(ts / .7));
      frameCam(cur, kc, camFrom);
      cur.g.updateMatrixWorld(true);
      place(cur, e > .72);
    }
    R.render(scene, cam);
    if (visible && !reduce) raf = requestAnimationFrame(frame);
    else if (visible && reduce && prev) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  new ResizeObserver(size).observe(host);
  new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); kick(); }, { rootMargin: '120px 0px' }).observe(host);

  const api = {
    show(k) {
      if (!BUILD[k] || (cur && cur.k === k)) return;
      const nx = get(k);
      /* Kamera fliegt vom aktuellen Blick */
      camFrom = cur ? frameCam(cur) : null;
      if (prev && prev !== cur) prev.g.visible = false;
      hideLabs(cur); prev = cur; cur = nx; cur.g.position.y = .1; cur.g.scale.setScalar(.92);
      cur.ex.forEach(([m]) => m.position.set(0, 0, 0));
      tSwitch = performance.now();
      camTo = frameCam(cur, 1);
      if (!camFrom) camFrom = camTo;
      kick();
    }
  };
  size();
  return api;
}
