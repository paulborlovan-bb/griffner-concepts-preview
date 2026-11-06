/* GRIFFNER Concepts, Arbeitsmodelle in three.js. Kopie aus dem Handoff (site/concepts-3d.js), erweitert um
   Summer (Vordach ov), Fassadenton (tone: 0 dunkler Rahmen, .55 helles Holz, 1 hell verputzt) und lift (Obergeschoß abheben, in m). */
const T = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
const cl = x => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => cl((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, t) => a + (b - a) * t;

export const CONCEPTS = {
  block: { L0: 14, D: 9, H1: 5.6, L1: 14, H2: 0, sx: 0, up: 0, R: 0, gl: 0, gu: 0, ge: 0, slope: 0, ov: 0, tone: 1, lg: 0 },
  wald: { L0: 17, D: 9, H1: 3.1, L1: 15, H2: 3.1, sx: -2.4, up: 1, R: 0, gl: .86, gu: .55, ge: 0, slope: 0 },
  duene: { L0: 22, D: 8, H1: 3.2, L1: 22, H2: 0, sx: 0, up: 0, R: 4.4, gl: .5, gu: 0, ge: 1, slope: 0 },
  /* Runde 30 (Kundenwunsch: Free überall falsch, wie auf den Bildern): Sockel aus Stein, darauf das Holzhaus mit steilem Satteldach,
     2 m über den Sockel hinaus, in beiden Giebeln eine tiefe, gerahmte Loggia mit Glas (lg = Tiefe in m, Garten und Einfahrt).
     Kein Hang mehr. Der Schlüssel bleibt "hang", damit Daten und Framer nichts umstellen müssen. */
  hang: { L0: 12, D: 9, H1: 3.1, L1: 14, H2: 2.5, sx: -1, up: 1, R: 3.5, gl: .82, gu: 0, ge: 0, slope: 0, lg: 1.6 },
  summer: { L0: 18, D: 10, H1: 3.2, L1: 10, H2: 3, sx: -3.6, up: 1, R: 0, gl: .96, gu: .9, ge: 0, slope: 0, ov: 1.8, tone: 1 }
};
CONCEPTS.wald.tone = 0; CONCEPTS.duene.tone = .55; CONCEPTS.hang.tone = .55;
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
    /* Loggien in beiden Giebeln (Runde 30): je zwei Seitenwangen, Boden, zwei Dachplatten über der Nische, Glas als Rechteck und Dreieck */
    this.lgSets = [-1, 1].map(e => ({
      e, fins: [part(BOX, EDGE, this.fmat), part(BOX, EDGE, this.fmat)], plate: part(BOX, EDGE, this.fmat),
      slabs: [part(BOX, EDGE, this.fmat), part(BOX, EDGE, this.fmat)], R: part(BOX, EDGE, this.glass, false), T: part(PRISM, PRISM_EDGE, this.glass, false)
    }));
    this.lgParts = this.lgSets.flatMap(L => [...L.fins, L.plate, ...L.slabs, L.R, L.T]);
    this.lgSolid = this.lgSets.flatMap(L => [...L.fins, L.plate, ...L.slabs]);
    this.hill = new T.Group(); this.g.add(this.hill); this.layers = [];
    this.body = new T.Group(); this.g.add(this.body);
    [this.lower, this.upper, this.roof, this.cap, ...this.win, ...this.lgParts].forEach(m => this.body.add(m));
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
    const H2 = P.H2 * P.up, lg = (P.lg || 0) * P.up;
    this.place(this.upper, P.L1 - 2 * lg, H2, P.D, P.sx, P.H1 + H2 / 2 + lf, 0, kU);
    const rl = lerp(P.L0, P.L1, P.up), rx = P.sx * P.up, top = P.H1 + H2 + lf;
    this.roof.scale.set(Math.max(.0001, rl - 2 * lg), Math.max(.0001, P.R * kR), P.D);
    this.roof.position.set(rx, top, 0); this.roof.visible = P.R * kR > .02;
    /* Loggien: je eine Nische so tief wie lg an beiden Giebeln, Wangen und Boden rahmen sie, das Dach läuft als zwei Platten bis zum Giebel */
    const hasL = lg > .05;
    this.lgParts.forEach(m => { m.visible = hasL; });
    if (hasL) {
      const hz = P.D / 2, Ls = Math.hypot(hz, P.R), a = Math.atan2(P.R, hz), t = .3, gw = P.D - .8;
      this.lgSets.forEach(L => {
        const e = L.e, ge = P.sx + e * P.L1 / 2, rg = rx + e * rl / 2, cx = ge - e * lg / 2;
        L.fins.forEach((m, i) => this.place(m, lg, H2, t, cx, P.H1 + H2 / 2 + lf, (i ? -1 : 1) * (hz - t / 2), kU));
        this.place(L.plate, lg, t, P.D, cx, P.H1 + t / 2 + lf, 0, kU);
        L.slabs.forEach((m, i) => {
          const sg = i ? -1 : 1;
          m.rotation.set(sg * a, 0, 0);
          m.scale.set(lg, t, Math.max(.0001, Ls * kR));
          m.position.set(rg - e * lg / 2, top + P.R / 2 + t / 2 * hz / Ls, sg * (hz / 2 + t / 2 * P.R / Ls));
          m.visible = P.R * kR > .02;
        });
        const gz = ge - e * (lg - .06);
        this.place(L.R, .08, H2 - .35, gw, gz, P.H1 + .3 + (H2 - .35) / 2 + lf, 0, kW);
        L.T.scale.set(.08, Math.max(.0001, P.R * gw / P.D * .95 * kW), gw);
        L.T.position.set(gz, top, 0); L.T.visible = P.R > .02 && kW > .01;
      });
    }
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
    band(3, 3, P.L1 - 2 * lg, P.sx, P.H1 + H2 * .5 + lf, H2 * .6, P.gu * P.up);
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
    [this.lower, this.upper, this.roof, this.cap, ...w, ...this.lgSolid].forEach(m => { m.castShadow = g < .5; });
    this.glass.emissiveIntensity = this.night * 1.35;
    this.glass.color.setHex(this.night > .5 ? 0x2a2218 : 0x15171a);
    this.g.position.set(this.x, 0, this.z || 0);
  }
}

/* Runde 30: dieselben Körper als Daten, für die Strichzeichnung (idee.js „Die Idee“), damit sie genau so aussieht wie das Modell
   in der Sammlung. Endzustand (aufgebaut, nicht abgehoben). solids: konvexe Körper (Ecken V, Flächen F), glass: Linien auf den
   Glasflächen und Fenstern. Maße wie in House.update, y ab Boden (der Hang hebt den Körper um ext). */
const BOXF = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
const PRISMF = [[0, 1, 2, 3], [1, 2, 5, 4], [0, 3, 5, 4], [0, 1, 4], [3, 2, 5]];
const bx = (cx, cy, cz, sx, sy, sz, rx = 0) => {
  const V = [], cs = Math.cos(rx), sn = Math.sin(rx);
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) {
    const y = b * sy / 2, z = c * sz / 2;
    V.push([cx + a * sx / 2, cy + y * cs - z * sn, cz + y * sn + z * cs]);
  }
  return { V, F: BOXF };
};
const pr = (x0, x1, y0, R, hz) => ({ V: [[x0, y0, -hz], [x0, y0, hz], [x1, y0, hz], [x1, y0, -hz], [x0, y0 + R, 0], [x1, y0 + R, 0]], F: PRISMF });
export function shape(P0) {
  const P = { ...CONCEPTS.block, ...P0 };
  const ext = P.slope * 1.86, H0 = P.H1 + ext, H2 = P.H2 * P.up, lg = (P.lg || 0) * P.up, hz = P.D / 2;
  const solids = [], glass = [], G = (a, b) => glass.push([a, b]);
  solids.push(bx(0, H0 / 2, 0, P.L0, H0, P.D));
  if (H2 > .05) solids.push(bx(P.sx, H0 + H2 / 2, 0, P.L1 - 2 * lg, H2, P.D));
  const rl = lerp(P.L0, P.L1, P.up), rx = P.sx * P.up, top = H0 + H2;
  if (P.R > .02) solids.push(pr(rx - rl / 2 + lg, rx + rl / 2 - lg, top, P.R, hz));
  if ((P.ov || 0) >= .02) solids.push(bx(0, H0 + .12, P.ov * .55, P.L0 + P.ov * 2.4, .24, P.D + P.ov * 1.6));
  if (lg > .05 && H2 > .05) [-1, 1].forEach(e => {
    const t = .3, Ls = Math.hypot(hz, P.R), a = Math.atan2(P.R, hz), ge = P.sx + e * P.L1 / 2, rg = rx + e * rl / 2, cx = ge - e * lg / 2;
    [1, -1].forEach(sg => solids.push(bx(cx, H0 + H2 / 2, sg * (hz - t / 2), lg, H2, t)));
    solids.push(bx(cx, H0 + t / 2, 0, lg, t, P.D));
    if (P.R > .02) [1, -1].forEach(sg => solids.push(bx(rg - e * lg / 2, top + P.R / 2 + t / 2 * hz / Ls, sg * (hz / 2 + t / 2 * P.R / Ls), lg, t, Ls, sg * a)));
    /* Glas in der Nische: Rechteck, Dreieck im Giebel, zwei Pfosten, oben die Glasbrüstung vorne an der Kante */
    const gw = (P.D - .8) / 2, x = ge - e * (lg - .06), y0 = H0 + t, th = P.R * (P.D - .8) / P.D * .95;
    G([x, y0, -gw], [x, y0, gw]); G([x, y0, gw], [x, top, gw]); G([x, top, gw], [x, top, -gw]); G([x, top, -gw], [x, y0, -gw]);
    if (P.R > .02) { G([x, top, -gw], [x, top + th, 0]); G([x, top + th, 0], [x, top, gw]); }
    [-1, 1].forEach(sg => { const z = sg * gw / 3; G([x, y0, z], [x, top + (P.R > .02 ? th * (1 - Math.abs(z) / gw) : 0), z]); });
    const xr = ge - e * .12, zr = hz - t;
    G([xr, y0 + 1.05, -zr], [xr, y0 + 1.05, zr]);
  });
  /* Fensterbänder vorne (z = D/2), wie House.update */
  const fz = hz + .05;
  const band = (n, L, x0, yc, h, amt) => {
    if (amt < .02) return;
    const span = L * .84 * amt, wd = span / n * .78;
    for (let i = 0; i < n; i++) {
      const x = x0 - span / 2 + span / n * (i + .5), a = x - wd / 2, b = x + wd / 2, y0 = yc - h / 2, y1 = yc + h / 2;
      G([a, y0, fz], [b, y0, fz]); G([b, y0, fz], [b, y1, fz]); G([b, y1, fz], [a, y1, fz]); G([a, y1, fz], [a, y0, fz]); G([x, y0, fz], [x, y1, fz]);
    }
  };
  band(3, P.L0, 0, ext + P.H1 * .44, P.H1 * .7, P.gl);
  if (H2 > .05) band(3, P.L1 - 2 * lg, P.sx, H0 + H2 * .5, H2 * .6, P.gu * P.up);
  /* Glasgiebel am Ende des Erdgeschoßes (Calm) */
  if (P.ge >= .02) {
    const x = P.L0 / 2 + .05, h = (P.H1 + P.R * .55) * .92, yc = ext + (P.H1 + P.R * .55) * .46, w = P.D * .46 * P.ge / 2;
    G([x, yc - h / 2, -w], [x, yc - h / 2, w]); G([x, yc - h / 2, w], [x, yc + h / 2, w]); G([x, yc + h / 2, w], [x, yc + h / 2, -w]); G([x, yc + h / 2, -w], [x, yc - h / 2, -w]);
  }
  /* Hang: Geländestufen */
  if (P.slope > .01) {
    const hw = Math.max(P.L0, P.L1 * P.up) * 1.25 + 8, lh = .62 * P.slope, hd = P.D * 2.2;
    for (let i = 0; i < 6; i++) { const w = hw * (.96 - i * .135); solids.push(bx(-hw / 2 + w / 2 - hw * .18, lh * (i + .5) - .01, -P.D * .35, w, lh, hd)); }
  }
  return { solids, glass };
}

/* Schnurgerüst: ein abgestecktes Grundstück für ein Concept, das noch kommt (Sammlung 05 bis 10, Kundenwunsch 2026-11-05).
   Vier Eckböcke (zwei Bretter im Winkel auf drei Pflöcken), dazwischen die Schnüre entlang der Hauskanten, die sich über den Ecken
   kreuzen, und vier kleine Pflöcke an den Ecken des Hauses. Maße in m wie die Häuser: p.L0 Länge, p.D Tiefe (die Grundfläche).
   build 0 bis 1: erst die Pflöcke, dann die Bretter, dann laufen die Schnüre, zuletzt die Eckpflöcke. Gleiche Felder wie House
   (x, z, build, p, update), damit die Sammlung beide gleich behandelt. */
const STAKE = { o: 1.9, a: 1.1, t: .25, bh: .26, bt: .07, ph: 1.25, pw: .13, sy: 1.08 };
export class Stake {
  constructor(stage, opt = {}) {
    this.g = new T.Group(); stage.scene.add(this.g);
    this.mat = new T.MeshStandardMaterial({ color: opt.color ?? 0xF2F0EC, roughness: .9, metalness: 0 });
    this.lineMat = new T.LineBasicMaterial({ color: opt.line ?? 0xCACACA, transparent: true, opacity: .55 });
    this.strMat = new T.LineBasicMaterial({ color: opt.string ?? 0xFFFFFF, transparent: true, opacity: .9 });
    this.p = { L0: 14, D: 10 }; this.build = 1; this.x = 0; this.z = 0;
    this.posts = []; this.boards = []; this.pegs = []; this.strings = [];
    const solid = () => { const m = new T.Mesh(BOX, this.mat); m.castShadow = true; m.receiveShadow = true; m.add(new T.LineSegments(EDGE, this.lineMat)); this.g.add(m); return m; };
    for (let i = 0; i < 12; i++) this.posts.push(solid());
    for (let i = 0; i < 8; i++) this.boards.push(solid());
    for (let i = 0; i < 4; i++) this.pegs.push(solid());
    const sg = new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(1, 0, 0)]);
    for (let i = 0; i < 4; i++) { const l = new T.Line(sg, this.strMat); this.g.add(l); this.strings.push(l); }
  }
  set(p) { Object.assign(this.p, p); return this; }
  update() {
    const { L0, D } = this.p, b = this.build, S = STAKE;
    const kP = eo(seg(b, 0, .36)), kB = eo(seg(b, .26, .58)), kS = eo(seg(b, .5, .9)), kG = eo(seg(b, .84, 1));
    const hx = L0 / 2, hz = D / 2, ox = hx + S.o, oz = hz + S.o, yb = S.sy;
    const box = (m, sx, sy, sz, x, y, z, k) => { m.scale.set(sx, Math.max(.0001, sy * k), sz); m.position.set(x, y - sy * (1 - k) / 2, z); m.visible = k > .01; };
    let pi = 0, bi = 0;
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], c) => {
      /* Pflöcke: äußere Ecke und die beiden Enden des Winkels */
      [[ox, oz], [ox, hz - S.a], [hx - S.a, oz]].forEach(([x, z]) => box(this.posts[pi++], S.pw, S.ph, S.pw, sx * x, S.ph / 2, sz * z, kP));
      /* Bretter knapp unter der Pflockspitze: eines quer zur langen Schnur (entlang z), eines quer zur kurzen (entlang x) */
      const kb = eo(seg(kB, c * .12, .64 + c * .12));
      const lz = S.o + S.a + S.t, lx = S.o + S.a + S.t;
      box(this.boards[bi++], S.bt, S.bh, lz, sx * (ox + S.pw / 2 + S.bt / 2), yb - S.bh / 2 + .02, sz * (hz - S.a + lz / 2 - S.t / 2), kb);
      box(this.boards[bi++], lx, S.bh, S.bt, sx * (hx - S.a + lx / 2 - S.t / 2), yb - S.bh / 2 + .02, sz * (oz + S.pw / 2 + S.bt / 2), kb);
      /* kleiner Pflock an der Hausecke, genau unter dem Kreuz der Schnüre */
      box(this.pegs[c], .09, .42, .09, sx * hx, .21, sz * hz, kG);
    });
    /* Schnüre: vorne und hinten (entlang x), links und rechts (entlang z), von Brett zu Brett gespannt, sie laufen von einem Ende zum anderen */
    const run = (l, x0, z0, len, rotY, k) => { l.position.set(x0, yb + .03, z0); l.rotation.set(0, rotY, 0); l.scale.set(Math.max(.0001, len * k), 1, 1); l.visible = k > .01; };
    const Lx = (ox + S.pw) * 2, Lz = (oz + S.pw) * 2;
    run(this.strings[0], -Lx / 2, hz, Lx, 0, kS);
    run(this.strings[1], Lx / 2, -hz, Lx, Math.PI, kS);
    run(this.strings[2], hx, Lz / 2, Lz, Math.PI / 2, eo(seg(kS, .15, 1)));
    run(this.strings[3], -hx, -Lz / 2, Lz, -Math.PI / 2, eo(seg(kS, .15, 1)));
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
    stake(o) { const h = new Stake(S, o); S.houses.push(h); return h; },
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
