/* 04 DEIN WEG. Sechs Schritte fahren seitlich durch, während du nach unten scrollst (wie vorher "Gebaut in Griffen").
   Jeder Schritt hat statt eines Fotos ein kleines Arbeitsmodell in 3D, das sich aufbaut, sobald der Schritt ins Bild fährt.
   Ein einziger WebGL Renderer zeichnet die sichtbaren Szenen nacheinander und kopiert das Bild in die Leinwand des Schritts,
   so bleibt es bei einem 3D Kontext für alle sechs. */
import { $, $$, E, ease, clamp, lerp, seg, prog, loop, reduce } from './core.js';
import { WEG } from '../data/content.js';

let D, M, T, R, G, MT, SC = [], booted = false, booting = false, RW = 0, RH = 0;

export function initWeg() {
  D = { pin: $('[data-wg-pin]'), track: $('[data-wg-track]'), bar: $('[data-wg-prog]'), n: $('[data-wg-n]') };
  if (!D.pin) return;
  D.track.innerHTML = WEG.map((s, i) => `
    <article class="wg__step${i % 2 ? ' wg__step--wide' : ''}">
      <figure class="wg__fig"><canvas data-wg-c="${i}" aria-hidden="true"></canvas><figcaption class="tag">${s.cap}</figcaption></figure>
      <div class="wg__txt"><span class="wg__nr">${s.nr}</span><h3 class="h-s">${s.name}.</h3><p class="txt">${s.say}</p></div>
    </article>`).join('') +
    `<div class="wg__step wg__step--end"><p class="lead">Und am Ende bekommst du den Schlüssel.</p><div class="dockbox" data-wg-dock data-dock="box" data-dock-trigger="k-weg" data-dock-hide="1" aria-hidden="true"></div></div>`;
  D.cv = $$('canvas', D.track);
  D.dock = $('[data-wg-dock]');
  new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) boot(); }, { rootMargin: '800px 0px' }).observe(D.pin);
  addEventListener('resize', () => { if (booted) size(); });
  loop.add({ tick });
}

async function boot() {
  if (booted || booting) return; booting = true;
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); return; }
  T = M.T;
  R = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.outputColorSpace = T.SRGBColorSpace;
  R.setScissorTest(true);
  G = { box: new T.BoxGeometry(1, 1, 1), cone: new T.ConeGeometry(1, 1, 9).translate(0, .5, 0), cyl: new T.CylinderGeometry(.5, .5, 1, 8).translate(0, .5, 0), ball: new T.SphereGeometry(1, 20, 12) };
  G.edge = new T.EdgesGeometry(G.box); G.coneE = new T.EdgesGeometry(G.cone, 40); G.cylE = new T.EdgesGeometry(G.cyl, 40);
  MT = {
    white: new T.MeshStandardMaterial({ color: 0xF4F1EC, roughness: .9, metalness: 0 }),
    line: new T.LineBasicMaterial({ color: 0x8b8378, transparent: true, opacity: .5 }),
    glass: new T.MeshStandardMaterial({ color: 0x15171a, roughness: .3, metalness: .2 }),
    ink: new T.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: .55 })
  };
  SC = WEG.map(s => BUILD[s.scene]());
  booted = true; size(); loop.poke();
}

/* Leinwände in Gerätepixeln, der Renderer so groß wie die größte */
function size() {
  const dpr = Math.min(1.5, devicePixelRatio || 1);
  let mw = 1, mh = 1;
  D.cv.forEach((c, i) => {
    const r = c.parentElement.getBoundingClientRect(), w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    mw = Math.max(mw, w); mh = Math.max(mh, h);
    if (SC[i]) { SC[i].cam.aspect = w / h; SC[i].cam.updateProjectionMatrix(); }
  });
  if (mw !== RW || mh !== RH) { RW = mw; RH = mh; R.setSize(RW, RH, false); }
  loop.poke();
}

function tick() {
  if (!D || !D.pin) return;
  const narrow = innerWidth < 820, vw = innerWidth, vh = innerHeight;
  const { p, on } = prog(D.pin);
  if (narrow) { D.track.style.transform = ''; D.dock.dataset.dockHide = '1'; }
  else if (on) {
    const max = Math.max(0, D.track.scrollWidth - vw), k = seg(p, .04, .96);
    D.track.style.transform = `translate3d(${(-max * k).toFixed(1)}px,0,0)`;
    D.bar.style.transform = `scaleX(${k.toFixed(4)})`;
    if (k > .9) delete D.dock.dataset.dockHide; else D.dock.dataset.dockHide = '1';
  }
  if (!booted) return;
  let best = 0, bd = 9;
  D.cv.forEach((cv, i) => {
    const r = cv.getBoundingClientRect();
    const c = narrow ? (r.top + r.height / 2) / vh : (r.left + r.width / 2) / vw;
    if (Math.abs(c - .5) < bd) { bd = Math.abs(c - .5); best = i; }
    if (r.right < -20 || r.left > vw + 20 || r.bottom < -20 || r.top > vh + 20) return;
    draw(i, reduce ? 1 : ease(clamp((1.1 - c) / .62)), clamp(c, -.5, 1.5));
  });
  D.n.textContent = `${WEG[best].nr} / 0${WEG.length}`;
}

function draw(i, k, c) {
  const s = SC[i], cv = D.cv[i], w = cv.width, h = cv.height;
  s.update(k, c);
  R.setViewport(0, 0, w, h); R.setScissor(0, 0, w, h);
  R.render(s.scene, s.cam);
  const ctx = cv.getContext('2d');
  ctx.drawImage(R.domElement, 0, RH - h, w, h, 0, 0, w, h);
}

/* Bühne für eine Szene: Licht von links oben, weicher Schatten auf unsichtbarem Boden */
function stage(bg, o = {}) {
  const scene = new T.Scene(), col = new T.Color(bg);
  scene.background = col; scene.fog = new T.Fog(col, o.fogNear ?? 120, o.fogFar ?? 320);
  const cam = new T.PerspectiveCamera(o.fov ?? 26, 1, .1, 800);
  const hemi = new T.HemisphereLight(0xffffff, 0x9a9286, o.hemi ?? .95); scene.add(hemi);
  const key = new T.DirectionalLight(0xffffff, o.key ?? 2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  const b = o.box ?? 40; Object.assign(key.shadow.camera, { left: -b, right: b, top: b, bottom: -b, near: 1, far: 400 });
  key.shadow.bias = -.0005; key.shadow.normalBias = .03; key.shadow.radius = 3;
  scene.add(key, key.target);
  const ground = new T.Mesh(new T.PlaneGeometry(900, 900), new T.ShadowMaterial({ opacity: o.shadow ?? .22 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const s = { scene, cam, key, hemi, update() {} };
  s.orbit = (az, el, dist, tx = 0, ty = 2, tz = 0, kx = -30, kz = 40) => {
    cam.position.set(tx + Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, tz + Math.cos(az) * Math.cos(el) * dist);
    cam.lookAt(tx, ty, tz);
    key.position.set(tx + kx, 50, tz + kz); key.target.position.set(tx, 0, tz); key.target.updateMatrixWorld();
  };
  return s;
}
/* Quader mit Kanten, y ist die Unterkante */
function box(parent, w, h, d, x, y, z, mat = MT.white, lm = MT.line) {
  const m = new T.Mesh(G.box, mat); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z);
  m.castShadow = true; m.receiveShadow = true;
  if (lm) m.add(new T.LineSegments(G.edge, lm));
  parent.add(m); return m;
}
function tree(parent, x, y, z, ht, mat = MT.white, lm = MT.line) {
  const g = new T.Group(); g.position.set(x, y, z);
  const st = ht * .12, C = ht - st, rad = ht * .21;
  const tr = new T.Mesh(G.cyl, mat); tr.scale.set(.32, st + .4, .32); tr.castShadow = true; g.add(tr);
  [[0, .58, 1], [.27, .48, .74], [.52, .48, .48]].forEach(([y0, hh, rr], i) => {
    const c = new T.Mesh(G.cone, mat); c.scale.set(rad * rr, C * hh, rad * rr); c.position.y = st + C * y0; c.rotation.y = i * 1.3;
    c.castShadow = true; c.receiveShadow = true; c.add(new T.LineSegments(G.coneE, lm)); g.add(c);
  });
  parent.add(g); return g;
}
const house = (parent, id, o = {}) => {
  const hs = new M.House({ scene: parent }, { line: 0x8b8378, hill: 0xE4DCD1, hillLine: 0xB7AC9D, toned: true, ...o });
  hs.set(typeof id === 'string' ? M.CONCEPTS[id] : id); hs.edgeAlways = .45; return hs;
};

const BUILD = {
  /* 01 Kennenlernen: ein langer Tisch, Stühle rücken heran, Blätter, ein kleines Modell */
  tisch() {
    const s = stage(0xCFC3B3, { box: 6, fogNear: 20, fogFar: 60, shadow: .2 });
    const g = new T.Group(); s.scene.add(g);
    box(g, 3.4, .06, 1.2, 0, .72, 0);
    [[-1.6, -.5], [1.6, -.5], [-1.6, .5], [1.6, .5]].forEach(([x, z]) => box(g, .06, .72, .06, x, 0, z));
    const chair = () => {
      const c = new T.Group();
      box(c, .44, .05, .44, 0, .42, 0);
      box(c, .44, .48, .04, 0, .47, -.2);
      [[-.19, -.19], [.19, -.19], [-.19, .19], [.19, .19]].forEach(([x, z]) => box(c, .035, .42, .035, x, 0, z, MT.white, null));
      g.add(c); return c;
    };
    const chairs = [[-1.05, -1], [0, -1], [1.05, -1], [-.55, 1], [.6, 1]].map(([x, sd]) => {
      const c = chair(); c.rotation.y = sd > 0 ? Math.PI : 0; c.userData = { x, z: sd * .74, out: sd * 1.4 }; return c;
    });
    const sheets = [[-1.05, .08, .3], [-.5, -.16, -.25], [1.05, .1, .15]].map(([x, z, r]) => { const m = box(g, .3, .006, .42, x, .78, z); m.rotation.y = r; m.userData.z = z; return m; });
    const hold = new T.Group(); hold.position.set(.25, .78, .05); hold.scale.setScalar(.042); g.add(hold);
    const hs = house(hold, 'wald');
    s.update = (k, c) => {
      chairs.forEach((ch, i) => { const t = E(k, i * .07, .42 + i * .07); ch.position.set(ch.userData.x, 0, ch.userData.z + ch.userData.out * (1 - t)); });
      sheets.forEach((m, i) => { const t = E(k, .3 + i * .08, .56 + i * .08); m.visible = t > .01; m.position.y = .783 + (1 - t) * .35; });
      hs.build = E(k, .5, 1); hs.update();
      s.orbit(-.62 + (c - .5) * -.7, .52, 7.4, 0, .5, 0, -3, 4);
    };
    return s;
  },
  /* 02 Grundstück: Gelände in Schichten, Grenze, Bäume, die Sonne zieht ihren Bogen, am Ende steht das Haus als Linie */
  ort() {
    const s = stage(0xCFC3B3, { box: 50, fogNear: 140, fogFar: 320 });
    const g = new T.Group(); s.scene.add(g);
    const L = [];
    for (let i = 0; i < 5; i++) { const w = 62 - i * 10, d = 46 - i * 6, x = -i * 2.6, z = -i * 2.2; L.push({ w, d, x, z, top: (i + 1) * .9 }); box(g, w, .9, d, x, i * .9, z); }
    const top = (x, z) => { let y = 0; L.forEach(l => { if (Math.abs(x - l.x) < l.w / 2 && Math.abs(z - l.z) < l.d / 2) y = l.top; }); return y; };
    [[-22, 14], [-26, -6], [20, -14], [24, 10], [-6, -16], [6, -17], [-17, 3], [17, 3], [-28, 6]].forEach(([x, z], i) => tree(g, x, top(x, z), z, 8 + (i % 3) * 2.4));
    const ly = top(-6, -4) + .03, pl = [[-15, ly, -11], [5, ly, -11], [5, ly, 4], [-15, ly, 4], [-15, ly, -11]].map(v => new T.Vector3(...v));
    g.add(new T.Line(new T.BufferGeometry().setFromPoints(pl), MT.ink));
    const arc = [];
    for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI; arc.push(new T.Vector3(Math.cos(a) * 40 - 5, Math.sin(a) * 26 + 4, Math.sin(a) * 16 - 4)); }
    const al = new T.Line(new T.BufferGeometry().setFromPoints(arc), new T.LineDashedMaterial({ color: 0x000000, dashSize: 1.2, gapSize: 1.2, transparent: true, opacity: .45 }));
    al.computeLineDistances(); g.add(al);
    const sun = new T.Mesh(G.ball, new T.MeshBasicMaterial({ color: 0xFFB200 })); sun.scale.setScalar(1.6); g.add(sun);
    const hold = new T.Group(); hold.position.set(-5, ly, -3.5); hold.scale.setScalar(.8); g.add(hold);
    const hs = house(hold, 'wald'); hs.ghost = 1;
    s.update = (k, c) => {
      const a = lerp(.12, 2.4, k), sp = new T.Vector3(Math.cos(a) * 40 - 5, Math.sin(a) * 26 + 4, Math.sin(a) * 16 - 4);
      sun.position.copy(sp);
      hs.update(); hs.lineMat.opacity = E(k, .62, .92) * .9; hs.g.visible = k > .6;
      s.orbit(-.5 + (c - .5) * -.6, .6, 104, -4, 2, -3);
      s.key.position.set(sp.x * 2.4, Math.max(14, sp.y * 2.4), sp.z * 2.4 + 20); s.key.target.position.set(-5, 0, -3); s.key.target.updateMatrixWorld();
    };
    return s;
  },
  /* 03 Inspiration: Stille, Einfachheit, Leichtigkeit und Weitblick auf Sockeln, nacheinander gebaut */
  ideen() {
    const s = stage(0xCFC3B3, { box: 70, fogNear: 190, fogFar: 420 });
    const forms = ['wald', 'duene', 'summer', { ...M.CONCEPTS.hang, slope: 0 }];
    const hs = forms.map((id, i) => {
      const hold = new T.Group(); hold.position.set((i - 1.5) * 28, .5, 0); s.scene.add(hold);
      box(s.scene, 24, .5, 15, (i - 1.5) * 28, 0, 0);
      return house(hold, id);
    });
    s.update = (k, c) => {
      hs.forEach((h, i) => { h.build = E(k, i * .1, .43 + i * .1); h.update(); });
      s.orbit(-.42 + (c - .5) * -.6, .34, 150, 0, 3, 0);
    };
    return s;
  },
  /* 04 Mischen: dahinter Stille, Einfachheit und Leichtigkeit als Linien, vorne wird aus ihnen eins */
  mischen() {
    const s = stage(0xCFC3B3, { box: 60, fogNear: 170, fogFar: 380 });
    const ghosts = ['wald', 'duene', 'summer'].map((id, i) => {
      const hold = new T.Group(); hold.position.set((i - 1) * 28, 0, -30); s.scene.add(hold);
      const h = house(hold, id); h.ghost = 1; return h;
    });
    const main = house(s.scene, 'wald');
    const C = M.CONCEPTS, FIN = { ...C.wald, L0: 18, L1: 14, sx: -2, R: 3.6, ov: 0, gl: .96, gu: .7, tone: .55 };
    s.update = (k, c) => {
      let P = M.mix(C.wald, C.duene, E(k, .05, .32)); P = M.mix(P, C.summer, E(k, .34, .58)); P = M.mix(P, FIN, E(k, .62, .92));
      main.set(P); main.lift = Math.sin(Math.PI * clamp(k / .92)) * 3.4; main.build = 1; main.update();
      ghosts.forEach(h => { h.update(); h.lineMat.opacity = .5; });
      s.orbit(-.55 + (c - .5) * -.6, .32, 100, 0, 4, -10);
    };
    return s;
  },
  /* 05 Bauen: Bodenplatte, dann schweben Wand für Wand und die Decken am Kran herein */
  bauen() {
    const s = stage(0xCFC3B3, { box: 34, fogNear: 110, fogFar: 260 });
    const g = new T.Group(); s.scene.add(g);
    box(g, 17.4, .35, 9.4, 0, 0, 0);
    const H1 = 3.1, H2 = 3.1, t = .28, y1 = .35, y2 = y1 + H1 + .3, P = [];
    for (let i = 0; i < 4; i++) P.push([4.2, H1, t, -8.5 + 4.25 * (i + .5), y1, 4.5 - t / 2, i === 1 || i === 2]);
    P.push([t, H1, 9 - 2 * t, -8.5 + t / 2, y1, 0]); P.push([t, H1, 9 - 2 * t, 8.5 - t / 2, y1, 0]);
    for (let i = 0; i < 4; i++) P.push([4.2, H1, t, -8.5 + 4.25 * (i + .5), y1, -4.5 + t / 2]);
    P.push([17, .3, 9, 0, y1 + H1, 0]);
    for (let i = 0; i < 3; i++) P.push([4.96, H2, t, -9.9 + 5 * (i + .5), y2, 4.5 - t / 2, i === 1]);
    P.push([t, H2, 9 - 2 * t, -9.9 + t / 2, y2, 0]); P.push([t, H2, 9 - 2 * t, 5.1 - t / 2, y2, 0]);
    for (let i = 0; i < 3; i++) P.push([4.96, H2, t, -9.9 + 5 * (i + .5), y2, -4.5 + t / 2]);
    P.push([15.2, .3, 9.2, -2.4, y2 + H2, 0]);
    const unit = new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(0, 1, 0)]);
    const parts = P.map(([w, h, d, x, y, z, gl]) => {
      const m = box(g, w, h, d, x, y, z, gl ? MT.glass : MT.white);
      const cab = new T.Line(unit, MT.ink); g.add(cab);
      return { m, cab, y: y + h / 2, top: y + h, x, z };
    });
    const mx = 15, mz = -11;
    box(g, .7, 32, .7, mx, 0, mz);
    const piv = new T.Group(); piv.position.set(mx, 31.6, mz); g.add(piv);
    box(piv, 32, .55, .55, 9, 0, 0);
    s.update = (k, c) => {
      const N = parts.length; let act = null;
      parts.forEach((q, j) => {
        const a = j / N * .78, tt = E(k, a, a + .2);
        q.m.visible = tt > .001; q.m.position.y = q.y + (1 - tt) * 15;
        const live = tt > .001 && tt < .999; q.cab.visible = live;
        if (live) { const y0 = q.m.position.y - q.y + q.top; q.cab.position.set(q.x, y0, q.z); q.cab.scale.y = Math.max(.01, 31.6 - y0); act = q; }
      });
      if (act) piv.rotation.y = -Math.atan2(act.z - mz, act.x - mx);
      s.orbit(-.6 + (c - .5) * -.6, .34, 70, 0, 6, 0);
    };
    return s;
  },
  /* 06 Einzug: Abend, im Haus geht das Licht an */
  einzug() {
    const s = stage(0x5a5955, { box: 44, hemi: .5, key: 1, shadow: .3, fogNear: 100, fogFar: 240 });
    s.key.color.setHex(0xb8c2d2); s.hemi.color.setHex(0x9aa4b4); s.hemi.groundColor.setHex(0x2a2a28);
    const dusk = new T.Color(0x6a6964), night = new T.Color(0x2e2e2c);
    const dark = new T.MeshStandardMaterial({ color: 0x77756f, roughness: .95 }), dl = new T.LineBasicMaterial({ color: 0x8f8c85, transparent: true, opacity: .5 });
    const hs = house(s.scene, 'wald', { line: 0x55534f });
    [[-20, -12], [-26, 4], [22, -10], [27, 6], [-9, -18], [9, -19], [-30, -14]].forEach(([x, z], i) => tree(s.scene, x, 0, z, 9 + (i % 3) * 2.2, dark, dl));
    const warm = new T.PointLight(0xffc27a, 0, 26, 1.6); warm.position.set(0, 1.8, 6.5); s.scene.add(warm);
    s.update = (k, c) => {
      const n = E(k, .2, .85);
      hs.night = n; hs.update();
      warm.intensity = n * 60;
      s.scene.background.lerpColors(dusk, night, n); s.scene.fog.color.copy(s.scene.background);
      s.hemi.intensity = lerp(.6, .28, n); s.key.intensity = lerp(1.2, .35, n);
      s.orbit(-.32 + (c - .5) * -.6, .2, 62, 0, 3.4, 0);
    };
    return s;
  }
};
