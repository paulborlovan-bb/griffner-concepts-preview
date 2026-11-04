/* GRIFFNER Concepts, Arbeitsmodelle in three.js. Kopie aus dem Handoff (site/concepts-3d.js), erweitert um
   Summer (Vordach ov), Fassadenton (tone: 0 dunkler Rahmen, .55 helles Holz, 1 hell verputzt) und lift (Obergeschoß abheben, in m). */
const T = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
const cl = x => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => cl((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, t) => a + (b - a) * t;

export const CONCEPTS = {
  block: { L0: 14, D: 9, H1: 5.6, L1: 14, H2: 0, sx: 0, up: 0, R: 0, gl: 0, gu: 0, ge: 0, slope: 0, ov: 0, tone: 1 },
  wald: { L0: 17, D: 9, H1: 3.1, L1: 15, H2: 3.1, sx: -2.4, up: 1, R: 0, gl: .86, gu: .55, ge: 0, slope: 0 },
  duene: { L0: 22, D: 8, H1: 3.2, L1: 22, H2: 0, sx: 0, up: 0, R: 4.4, gl: .5, gu: 0, ge: 1, slope: 0 },
  hang: { L0: 9.5, D: 9, H1: 3.2, L1: 18, H2: 3.2, sx: 4.6, up: 1, R: 0, gl: .7, gu: .9, ge: 0, slope: 1 },
  summer: { L0: 18, D: 10, H1: 3.2, L1: 10, H2: 3, sx: -3.6, up: 1, R: 0, gl: .96, gu: .9, ge: 0, slope: 0, ov: 1.8, tone: 1 }
};
CONCEPTS.wald.tone = 0; CONCEPTS.duene.tone = .55;
const TONE = { frame: [[0, 0x2f2f2d], [.55, 0xD8CBB6], [1, 0xF5F3EF]], body: [[0, 0xE6DCCB], [.55, 0xD8CBB6], [1, 0xF5F3EF]] };
const toneAt = (list, t, c) => {
  let a = list[0], b = list[list.length - 1];
  for (let i = 0; i < list.length - 1; i++) if (t >= list[i][0] && t <= list[i + 1][0]) { a = list[i]; b = list[i + 1]; break; }
  const k = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
  return c.setHex(a[1]).lerp(new T.Color(b[1]), Math.max(0, Math.min(1, k)));
};
export const KEYS = Object.keys(CONCEPTS.block);
export const mix = (a, b, t) => { const o = {}; KEYS.forEach(k => o[k] = lerp(a[k] ?? 0, b[k] ?? 0, t)); return o; };

const BOX = new T.BoxGeometry(1, 1, 1);
const EDGE = new T.EdgesGeometry(BOX);
const PRISM = (() => {
  const s = new T.Shape(); s.moveTo(-.5, 0); s.lineTo(.5, 0); s.lineTo(0, 1); s.closePath();
  const g = new T.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -.5); g.rotateY(Math.PI / 2); return g;
})();
const PRISM_EDGE = new T.EdgesGeometry(PRISM);

export class House {
  constructor(stage, opt = {}) {
    this.g = new T.Group(); stage.scene.add(this.g);
    this.mat = new T.MeshStandardMaterial({ color: opt.color ?? 0xFFFFFF, roughness: .9, metalness: 0, transparent: true });
    this.fmat = new T.MeshStandardMaterial({ color: opt.color ?? 0xFFFFFF, roughness: .9, metalness: 0, transparent: true });
    this.toned = !!opt.toned;
    this.glass = new T.MeshStandardMaterial({ color: 0x15171a, roughness: .25, metalness: .2, emissive: 0xffdcae, emissiveIntensity: 0, transparent: true });
    this.lineMat = new T.LineBasicMaterial({ color: opt.line ?? 0xCACACA, transparent: true, opacity: 0 });
    this.hillMat = new T.MeshStandardMaterial({ color: opt.hill ?? 0x1b1b1a, roughness: 1, transparent: true });
    const part = (geo, eg, mat, shadow = true) => {
      const m = new T.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true;
      const e = new T.LineSegments(eg, this.lineMat); m.add(e); this.g.add(m); return m;
    };
    this.lower = part(BOX, EDGE, this.mat);
    this.upper = part(BOX, EDGE, this.fmat);
    this.roof = part(PRISM, PRISM_EDGE, this.fmat);
    this.cap = part(BOX, EDGE, this.fmat);
    this.win = [];
    for (let i = 0; i < 7; i++) this.win.push(part(BOX, EDGE, this.glass, false));
    this.hill = new T.Group(); this.g.add(this.hill); this.layers = [];
    this.body = new T.Group(); this.g.add(this.body);
    [this.lower, this.upper, this.roof, this.cap, ...this.win].forEach(m => this.body.add(m));
    this.hillLine = new T.LineBasicMaterial({ color: opt.hillLine ?? 0x555555, transparent: true, opacity: 1 });
    for (let i = 0; i < 6; i++) { const m = new T.Mesh(BOX, this.hillMat); m.receiveShadow = true; m.castShadow = true; m.add(new T.LineSegments(EDGE, this.hillLine)); this.hill.add(m); this.layers.push(m); }
    this.p = { ...CONCEPTS.block }; this.build = 1; this.ghost = 0; this.night = 0; this.x = 0;
  }
  set(p) { Object.assign(this.p, p); return this; }
  place(m, sx, sy, sz, x, y, z, k = 1) {
    const v = Math.max(.0001, k);
    m.scale.set(Math.max(.0001, sx), Math.max(.0001, sy * v), Math.max(.0001, sz));
    m.position.set(x, y - sy * (1 - v) / 2, z);
    m.visible = sx > .01 && sy * v > .01 && sz > .01;
  }
  update() {
    const P = this.p, b = this.build, g = this.ghost, lf = this.lift || 0;
    const kL = eo(seg(b, 0, .34)), kU = eo(seg(b, .3, .58)), kR = eo(seg(b, .54, .74)), kW = eo(seg(b, .72, .96));
    const ext = P.slope * 1.86; this.body.position.y = ext;
    this.place(this.lower, P.L0, P.H1 + ext, P.D, 0, (P.H1 - ext) / 2, 0, kL);
    const H2 = P.H2 * P.up;
    this.place(this.upper, P.L1, H2, P.D, P.sx, P.H1 + H2 / 2 + lf, 0, kU);
    const rl = lerp(P.L0, P.L1, P.up), rx = P.sx * P.up;
    this.roof.scale.set(Math.max(.0001, rl), Math.max(.0001, P.R * kR), P.D);
    this.roof.position.set(rx, P.H1 + H2 + lf, 0); this.roof.visible = P.R * kR > .02;
    const ov = P.ov || 0;
    this.place(this.cap, P.L0 + ov * 2.4, .24, P.D + ov * 1.6, 0, P.H1 + .12, ov * .55, kR * cl(ov / .2));
    if (ov < .02) this.cap.visible = false;
    if (this.toned) { const t = P.tone ?? 1; toneAt(TONE.body, t, this.mat.color); toneAt(TONE.frame, t, this.fmat.color); }
    const fz = P.D / 2 + .05, w = this.win;
    const band = (i0, n, L, x0, y0, h, amt) => {
      const span = L * .84 * amt, wd = span / n * .78;
      for (let i = 0; i < n; i++) {
        const x = x0 - span / 2 + span / n * (i + .5);
        this.place(w[i0 + i], wd, h, .1, x, y0, fz, kW);
        if (amt < .02) w[i0 + i].visible = false;
      }
    };
    band(0, 3, P.L0, 0, P.H1 * .44, P.H1 * .7, P.gl);
    band(3, 3, P.L1, P.sx, P.H1 + H2 * .5 + lf, H2 * .6, P.gu * P.up);
    this.place(w[6], .1, (P.H1 + P.R * .55) * .92, P.D * .46 * P.ge, P.L0 / 2 + .05, (P.H1 + P.R * .55) * .46, 0, kW);
    if (P.ge < .02) w[6].visible = false;
    const hw = Math.max(P.L0, P.L1 * P.up) * 1.25 + 8, lh = .62 * P.slope, hd = P.D * 2.2;
    this.layers.forEach((m, i) => {
      const w = hw * (.96 - i * .135);
      m.scale.set(w, Math.max(.0001, lh), hd); m.position.set(-hw / 2 + w / 2 - hw * .18, lh * (i + .5) - .01, -P.D * .35);
    });
    this.hill.visible = P.slope > .01;
    this.mat.opacity = 1 - g; this.fmat.opacity = 1 - g; this.fmat.depthWrite = g < .5; this.glass.opacity = 1 - g; this.hillMat.opacity = 1 - g; this.hillLine.opacity = P.slope * (1 - g * .6);
    this.mat.depthWrite = g < .5; this.lineMat.opacity = Math.max(g, this.edgeAlways || 0);
    [this.lower, this.upper, this.roof, this.cap, ...w].forEach(m => { m.castShadow = g < .5; });
    this.glass.emissiveIntensity = this.night * 1.35;
    this.glass.color.setHex(this.night > .5 ? 0x2a2218 : 0x15171a);
    this.g.position.set(this.x, 0, this.z || 0);
  }
}

export function createStage(host, opt = {}) {
  const r = new T.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  r.setPixelRatio(Math.min(1.6, devicePixelRatio || 1));
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  r.outputColorSpace = T.SRGBColorSpace;
  r.domElement.style.cssText = 'display:block;width:100%;height:100%';
  host.querySelectorAll('canvas').forEach(c => c.remove());
  host.appendChild(r.domElement);
  const scene = new T.Scene();
  const bg = new T.Color(opt.bg ?? 0x000000); scene.background = bg;
  scene.fog = new T.Fog(bg, opt.fogNear ?? 70, opt.fogFar ?? 220);
  const cam = new T.PerspectiveCamera(opt.fov ?? 30, 16 / 9, .5, 800);
  const hemi = new T.HemisphereLight(0xdfe4ea, 0x1a1a1a, opt.hemi ?? .7); scene.add(hemi);
  const key = new T.DirectionalLight(0xffffff, opt.key ?? 2.2);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 1, far: 260 });
  key.shadow.bias = -.0005; key.shadow.normalBias = .03; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new T.DirectionalLight(0xc8d2de, opt.fill ?? .5); fill.position.set(60, 30, -80); scene.add(fill);
  const ground = new T.Mesh(new T.PlaneGeometry(1200, 1200), new T.ShadowMaterial({ opacity: opt.shadow ?? .45 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const look = new T.Vector3();
  const S = {
    T, r, scene, cam, key, hemi, fill, ground, houses: [],
    house(o) { const h = new House(S, o); S.houses.push(h); return h; },
    orbit(az, el, dist, tx = 0, ty = 2.5, tz = 0) {
      cam.position.set(tx + Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, tz + Math.cos(az) * Math.cos(el) * dist);
      look.set(tx, ty, tz); cam.lookAt(look);
      key.position.set(tx - 34, 60, tz + 46); key.target.position.set(tx, 0, tz); key.target.updateMatrixWorld();
    },
    setBg(hex) { bg.set(hex); scene.fog.color.set(hex); },
    project(x, y, z) { const v = new T.Vector3(x, y, z).project(cam); return { x: (v.x + 1) / 2 * host.clientWidth, y: (1 - v.y) / 2 * host.clientHeight, z: v.z }; },
    fit() { const w = host.clientWidth || 1, h = host.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); },
    render() { S.houses.forEach(h => h.update()); r.render(scene, cam); },
    dispose() { S.ro && S.ro.disconnect(); r.dispose(); r.domElement.remove(); }
  };
  S.ro = new ResizeObserver(() => { S.fit(); S.onResize && S.onResize(); }); S.ro.observe(host); S.fit();
  return S;
}
export { T, cl, seg, eo, lerp };
