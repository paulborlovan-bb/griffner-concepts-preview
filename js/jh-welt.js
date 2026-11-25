/* Journey auf der Startseite, Runde 2 (2026-11-25): die gezeichnete 3D-Welt der Seite /journey als kleine Bühne für die Startseite.
   Kunde: „for journey I like v5 and do 5 variants in that feel also keep the feel from the actual page“.
   Gleiche Projektion, Farben und Zeichnung wie die Kamerafahrt in journey/weg.js: Kachelbrett (Anthrazit auf Schwarz, Kalk auf Weiß),
   gestrichelter Weg mit Punkt, die 14 Tage als weiße Rahmen, die zu gelben Blöcken wachsen (mit Überschwingen), im gelben Feld der Moment
   des Tages (js/jh-moment.js, erzeugt aus weg.js), Nummern in Versalien, Querlinien bei Start und Zwischenziel, am Ziel das Floating House
   (schwarz mit weißen Kanten, die Fenster gehen gelb an). Die Varianten geben nur Kamera und Zustand vor (draw(pos, cam, o)). */
import { drawMoment } from './jh-moment.js';

const GELB = '#FFB200', SCHWARZ = '#000000', WEISS = '#FFFFFF', ANTH = '#444442', KALK = '#CACACA';
export const G2 = 400, NEAR = 30;
const INS = 24;
export const cl = v => v < 0 ? 0 : v > 1 ? 1 : v;
export const rp = (v, a, b) => cl((v - a) / (b - a));
export const sm = v => { v = cl(v); return v * v * (3 - 2 * v); };
export const eo = v => 1 - Math.pow(1 - cl(v), 3);
export const io = v => { v = cl(v); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
/* wie die Tage der Fahrt: wächst aus der Mitte und schwingt leicht über */
const pop = u => 1 + 2.9 * Math.pow(u - 1, 3) + 1.9 * Math.pow(u - 1, 2);
const hash = (i, j) => ((((i * 97 + j * 211) % 41) + 41) % 41) / 41;
const lerp = (a, b, t) => a + (b - a) * t;

/* der Weg der Seite /journey: 14 Felder in Schlangenlinie, je 1200 in die Tiefe */
export const WEG = (dz = 1200) => Array.from({ length: 14 }, (_, k) => ({ x: Math.round((-1000 * Math.sin(k * .36) - 200) / 400) * 400 + 200, z: 200 + k * dz }));

/* Kameras: hinter dem Feld wie auf /journey (camAt), Umlauf um einen Punkt, Mischung zweier Kameras */
export const umlauf = (T, az, el, d) => ({ C: { x: T.x + d * Math.cos(el) * Math.cos(az), y: T.y + d * Math.sin(el), z: T.z + d * Math.cos(el) * Math.sin(az) }, L: { x: T.x, y: T.y, z: T.z } });
export const misch = (a, b, u, lift = 0) => { const k = io(u), l = (p, q) => p + (q - p) * k; return { C: { x: l(a.C.x, b.C.x), y: l(a.C.y, b.C.y) + lift * Math.sin(Math.PI * k), z: l(a.C.z, b.C.z) }, L: { x: l(a.L.x, b.L.x), y: l(a.L.y, b.L.y), z: l(a.L.z, b.L.z) } }; };

export class Welt {
  constructor(can, o = {}) {
    this.can = can; this.x = can.getContext('2d'); this.o = o; this.hell = !!o.hell; this.red = !!o.red;
    this.PTS = o.pts || WEG(); this.W = 0; this.key = '';
    const cs = getComputedStyle(can);
    this.fD = cs.getPropertyValue('--font-display').trim() || 'sans-serif'; this.fT = cs.getPropertyValue('--font-text').trim() || 'sans-serif';
    this.prep();
  }
  S(p) {
    const P = this.PTS, n = P.length - 1;
    if (p <= 0) return { x: P[0].x + (P[1].x - P[0].x) * p, z: P[0].z + (P[1].z - P[0].z) * p };
    if (p >= n) return { x: P[n].x + (P[n].x - P[n - 1].x) * (p - n), z: P[n].z + (P[n].z - P[n - 1].z) * (p - n) };
    const i = Math.min(n - 1, Math.floor(p)), t = p - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)];
    const cr = (a, b, c, d) => .5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
    return { x: cr(a.x, b.x, c.x, d.x), z: cr(a.z, b.z, c.z, d.z) };
  }
  T(p) { const a = this.S(p - .05), b = this.S(p + .05), dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1; return { x: dx / l, z: dz / l }; }
  /* Kamera hinter dem Feld p, wie camAt() in weg.js (Telefon: weiter vorausblicken) */
  camAt(p) {
    const mob = this.mob, BACK = mob ? 1150 : 1050, SIDE = mob ? 360 : 380, HGT = mob ? 420 : 600, LOOK = mob ? 380 : 260;
    const s = this.S(p), t = this.T(p), r = { x: t.z, z: -t.x }, L = this.S(p + (mob ? 2.4 : .75));
    return { C: { x: s.x - t.x * BACK - r.x * SIDE, y: HGT, z: s.z - t.z * BACK - r.z * SIDE }, L: { x: L.x + r.x * LOOK, y: 0, z: L.z + r.z * LOOK } };
  }
  /* Floating House am Ziel: Mitte, Richtung, Maßstab wie drawStops() in weg.js */
  haus() { const c0 = this.S(15.7), t = this.o.hausT || this.T(14.3), r = { x: t.z, z: -t.x }, K = .62; return { c0, t, r, K, m: { x: c0.x + r.x * 150 * K, y: 300 * K, z: c0.z + r.z * 150 * K } }; }
  prep() {
    const P = this.PTS, h = this.haus().m; let x0 = h.x, x1 = h.x, z0 = h.z, z1 = h.z;
    P.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
    this.box = { x0, x1, z0, z1 };
    const X0 = Math.floor((x0 - 1400) / G2) * G2, X1 = Math.ceil((x1 + 1400) / G2) * G2, Z0 = Math.floor((z0 - 1000) / G2) * G2, Z1 = Math.ceil((z1 + 1000) / G2) * G2;
    const tag = new Set(P.map(p => Math.floor(p.x / G2) + ',' + Math.floor(p.z / G2)));
    const S = []; for (let p = -1; p <= 15.2; p += .05) S.push([p, this.S(p)]);
    this.cells = [];
    for (let a = X0; a < X1; a += G2) for (let b = Z0; b < Z1; b += G2) {
      if (tag.has(a / G2 + ',' + b / G2)) continue;
      const cx = a + G2 / 2, cz = b + G2 / 2; let bp = 0, bd = 1e9;
      S.forEach(([p, s]) => { const d = Math.hypot(s.x - cx, s.z - cz); if (d < bd) { bd = d; bp = p; } });
      this.cells.push({ a, b, ar: bp + bd / 650 + hash(a / G2, b / G2) * .45, d: bd, bp });
    }
  }
  size(mob) {
    const W = this.can.clientWidth, H = this.can.clientHeight; if (!W || !H) { this.W = 0; return; }
    const dpr = Math.min(2, devicePixelRatio || 1), cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (this.can.width !== cw || this.can.height !== ch) { this.can.width = cw; this.can.height = ch; }
    this.W = W; this.H = H; this.dpr = dpr; this.mob = mob == null ? W < 820 : mob;
    this.F = Math.min(H * 1.12, W * (this.mob ? 1.05 : 1.2)); this.key = '';
  }
  look(cam) {
    const C = cam.C, L = cam.L; let fx = L.x - C.x, fy = L.y - C.y, fz = L.z - C.z; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
    let rx = fz, rz = -fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
    const ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;
    const F = cam.F || this.F, cx = cam.cx == null ? this.W / 2 : cam.cx, cy = cam.cy == null ? this.H * .36 : cam.cy;
    this.C = C; this.Fn = F; this.cx = cx; this.cy = cy;
    this.tc = (px, py, pz) => { const dx = px - C.x, dy = py - C.y, dz = pz - C.z; return [dx * rx + dz * rz, dx * ux + dy * uy + dz * uz, dx * fx + dy * fy + dz * fz]; };
    this.pr = c => [cx + c[0] * F / c[2], cy - c[1] * F / c[2]];
  }
  P(x, y, z) { const c = this.tc(x, y, z); return c[2] < NEAR ? null : this.pr(c); }
  /* Maßstab und Mitte so, dass die Punkte pts unter allen Kameras cams in die Fläche passen (Rand pad) */
  passend(cams, pts, pad) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    cams.forEach(cam => { this.look({ ...cam, F: 1, cx: 0, cy: 0 }); pts.forEach(([a, b, c]) => { const q = this.tc(a, b, c); if (q[2] < NEAR) return; const X = q[0] / q[2], Y = -q[1] / q[2]; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }); });
    const aw = Math.max(40, this.W - pad.l - pad.r), ah = Math.max(40, this.H - pad.t - pad.b), F = Math.min(aw / Math.max(1e-6, x1 - x0), ah / Math.max(1e-6, y1 - y0));
    return { F, cx: pad.l + aw / 2 - F * (x0 + x1) / 2, cy: pad.t + ah / 2 - F * (y0 + y1) / 2 };
  }
  /* Punkte für passend(): der Weg mit einem Feld Rand und das Haus */
  huelle(rand = G2) {
    const b = this.box, h = this.haus(), o = [];
    [[b.x0 - rand, b.z0 - rand], [b.x1 + rand, b.z0 - rand], [b.x1 + rand, b.z1 + rand], [b.x0 - rand, b.z1 + rand]].forEach(([x, z]) => o.push([x, 0, z]));
    this.PTS.forEach(p => o.push([p.x, 0, p.z]));
    [[-900, -450], [1200, -450], [1200, 450], [-900, 450]].forEach(([u, v]) => { const x = h.c0.x + (h.r.x * u + h.t.x * v) * h.K, z = h.c0.z + (h.r.z * u + h.t.z * v) * h.K; o.push([x, 0, z], [x, 620 * h.K, z]); });
    return o;
  }
  /* Feld k auf dem Bildschirm: Mitte der Oberseite (für Zeiger und Beschriftung) */
  feld(k, hg = 24) { const p = this.PTS[k], a = Math.floor(p.x / G2) * G2 + G2 / 2, b = Math.floor(p.z / G2) * G2 + G2 / 2; return this.P(a, hg, b); }

  /* o: netz (Linien bis zum Horizont, Deckkraft), rand (Rahmen der Kacheln), kachel(cell) 0..1, nebel [z0, Weite] oder null,
     weg [p0, p1] (gestrichelt), punkt (p oder null), linien (Querlinien bei Start und Zwischenziel), tag(k) → { u, hot, m, flat, h, za (Deckkraft der eigenen Nummer) },
     zahl (Deckkraft der Nummern), haus (Deckkraft), licht (Fenster 0..1), clipY (darunter nichts zeichnen) */
  draw(pos, cam, o = {}) {
    if (!this.W) return;
    const x = this.x, W = this.W, H = this.H, hell = this.hell;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); x.clearRect(0, 0, W, H); x.globalAlpha = 1; x.setLineDash([]); x.letterSpacing = '0px';
    this.look(cam);
    const tc = this.tc, pr = this.pr, C = this.C;
    const neb = o.nebel === undefined ? [1800, 12500] : o.nebel, fog = z => neb ? cl(1 - (z - neb[0]) / neb[1]) : 1;
    const clip = (a, b) => {
      if (a[2] < NEAR && b[2] < NEAR) return null;
      if (a[2] < NEAR) { const t = (NEAR - a[2]) / (b[2] - a[2]); a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]; }
      if (b[2] < NEAR) { const t = (NEAR - b[2]) / (a[2] - b[2]); b = [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t, NEAR]; }
      return [pr(a), pr(b)];
    };
    const path = q => { if (q.some(c => c[2] < NEAR)) return false; q.forEach((c, i) => { const s = pr(c); i ? x.lineTo(s[0], s[1]) : x.moveTo(s[0], s[1]); }); x.closePath(); return true; };
    const quad = (a, b, y, n) => [tc(a + n, y, b + n), tc(a + G2 - n, y, b + n), tc(a + G2 - n, y, b + G2 - n), tc(a + n, y, b + G2 - n)];
    x.save(); if (o.clipY != null && o.clipY < H) { x.beginPath(); x.rect(0, 0, W, Math.max(0, o.clipY)); x.clip(); }

    /* Linien bis zum Horizont (nur dunkel, wie die Fahrt) */
    if (o.netz > 0) {
      const B = 7, bk = Array.from({ length: B + 1 }, () => []), fogG = z => cl(1 - (z - 900) / 7800);
      const add = (ax, az, bx, bz) => { const a = tc(ax, 0, az), b = tc(bx, 0, bz), k = Math.round(fogG((a[2] + b[2]) / 2) * B); if (!k) return; const s = clip(a, b); if (s) bk[k].push(s); };
      const gx0 = Math.floor((C.x - 8000) / G2) * G2, gx1 = C.x + 8000, gz0 = Math.floor((C.z - 1200) / G2) * G2, gz1 = C.z + 10000;
      for (let gx = gx0; gx <= gx1; gx += G2) for (let gz = gz0; gz < gz1; gz += G2) add(gx, gz, gx, gz + G2);
      for (let gz = gz0; gz <= gz1; gz += G2) for (let gx = gx0; gx < gx1; gx += G2) add(gx, gz, gx + G2, gz);
      x.lineWidth = 1; x.strokeStyle = hell ? KALK : ANTH;
      bk.forEach((arr, k) => { if (!arr.length) return; x.globalAlpha = Math.pow(k / B, 1.4) * .7 * o.netz; x.beginPath(); arr.forEach(s => { x.moveTo(s[0][0], s[0][1]); x.lineTo(s[1][0], s[1][1]); }); x.stroke(); });
    }

    /* Kacheln: Rahmen und Fläche, die aus der Mitte wächst */
    const kf = o.kachel || (c => eo(rp(Math.min(pos, 13) + 1.1, c.ar - .25, c.ar + .55)));
    const ra = o.rand == null ? .9 : o.rand, B2 = 8, rb = Array.from({ length: B2 + 1 }, () => []), fb = Array.from({ length: B2 + 1 }, () => []);
    this.cells.forEach(c => {
      const z = tc(c.a + G2 / 2, 0, c.b + G2 / 2)[2]; if (z < NEAR) return; const f = fog(z); if (f <= .01) return;
      const edge = o.ausblend ? cl((o.ausblend - c.d) / 500) : 1; if (edge <= .01) return;
      const t = kf(c);
      if (ra > 0) { const k = Math.round(f * edge * B2); if (k) rb[k].push(quad(c.a, c.b, 0, INS)); }
      if (t > 0) { const k = Math.round(Math.min(1, t * 1.4) * f * edge * B2); if (k) fb[k].push(quad(c.a, c.b, 0, INS + (G2 / 2 - INS) * (1 - Math.min(1, t)))); }
    });
    x.lineWidth = 1; x.strokeStyle = hell ? KALK : ANTH; x.fillStyle = hell ? KALK : ANTH;
    rb.forEach((arr, k) => { if (!arr.length) return; x.globalAlpha = k / B2 * ra; x.beginPath(); arr.forEach(path); x.stroke(); });
    fb.forEach((arr, k) => { if (!arr.length) return; x.globalAlpha = k / B2 * (hell ? .34 : .55); x.beginPath(); arr.forEach(path); x.fill(); });

    /* Querlinien bei Start und Zwischenziel */
    if (o.linien) [[-.5, 0], [6.5, 7]].forEach(([p, at]) => {
      const s = this.S(p), t = this.T(p), r = { x: t.z, z: -t.x }, a0 = tc(s.x - r.x * 1600, 0, s.z - r.z * 1600), a1 = tc(s.x + r.x * 1600, 0, s.z + r.z * 1600);
      const hot = cl(1 - Math.abs(pos - at) * 1.2), a = fog((a0[2] + a1[2]) / 2) * o.linien; if (a <= 0) return; const sg = clip(a0, a1); if (!sg) return;
      x.globalAlpha = a * (.45 + .55 * hot); x.strokeStyle = hell ? SCHWARZ : WEISS; x.lineWidth = 1.5; x.beginPath(); x.moveTo(sg[0][0], sg[0][1]); x.lineTo(sg[1][0], sg[1][1]); x.stroke();
    });

    /* der Weg, gestrichelt, mit Punkt */
    const wg = o.weg || [-.6, 14.35];
    if (wg[1] > wg[0]) {
      x.globalAlpha = (o.wegA == null ? .7 : o.wegA); x.strokeStyle = hell ? ANTH : KALK; x.lineWidth = 1.3; x.setLineDash([3, 8]); x.beginPath();
      let prev = null; for (let p = wg[0]; ; p = Math.min(wg[1], p + .06)) { const s = this.S(p), c = tc(s.x, 0, s.z); if (prev) { const sg = clip(prev, c); if (sg) { x.moveTo(sg[0][0], sg[0][1]); x.lineTo(sg[1][0], sg[1][1]); } } prev = c; if (p >= wg[1]) break; }
      x.stroke(); x.setLineDash([]);
    }
    if (o.punkt != null) { const s = this.S(o.punkt), q = this.P(s.x, 0, s.z); if (q) { x.fillStyle = hell ? SCHWARZ : WEISS; x.globalAlpha = hell ? .16 : .35; x.beginPath(); x.arc(q[0], q[1], 9, 0, 7); x.fill(); x.globalAlpha = 1; x.beginPath(); x.arc(q[0], q[1], 3.5, 0, 7); x.fill(); } }

    /* die 14 Tage, von hinten nach vorn */
    const tg = o.tag || (k => ({ u: rp(pos, k - .4, k + .02), hot: cl(1 - Math.abs(pos - k) * 1.25), m: pos }));
    const nf = Math.max(10, Math.min(15, W / 1440 * 13)) * (o.zahlS || 1), za = o.zahl == null ? 1 : o.zahl;
    this.PTS.map((P, k) => ({ k, P, z: tc(P.x, 0, P.z)[2] })).sort((a, b) => b.z - a.z).forEach(({ k, P, z }) => {
      if (z < NEAR) return;
      const a = Math.floor(P.x / G2) * G2, b = Math.floor(P.z / G2) * G2, st = tg(k) || {}, fz = fog(z) * (st.a == null ? 1 : st.a); if (fz <= .01) return;
      const u = st.u || 0, hot = st.hot || 0;
      let low = null;
      if (u <= 0) { const q = quad(a, b, 0, INS); x.strokeStyle = hell ? SCHWARZ : WEISS; x.lineWidth = 1; x.globalAlpha = fz * .75 * (st.ra == null ? 1 : st.ra); x.beginPath(); if (path(q)) x.stroke(); low = q; }
      else {
        const n = G2 / 2 - (G2 / 2 - INS) * Math.min(1.04, pop(Math.min(1, u))), hg = st.flat ? 0 : (st.h == null ? 24 + 96 * hot : st.h) * Math.min(1, u * 1.6);
        const Bq = quad(a, b, 0, n), Tq = quad(a, b, hg, n);
        if (hg > .5) [0, 1, 2, 3].map(i => { const f = [Bq[i], Bq[(i + 1) % 4], Tq[(i + 1) % 4], Tq[i]]; return { f, z: f.reduce((s, c) => s + c[2], 0) / 4 }; }).sort((p, q) => q.z - p.z)
          .forEach(({ f }) => { x.beginPath(); if (!path(f)) return; x.globalAlpha = fz; x.fillStyle = hell ? WEISS : SCHWARZ; x.fill(); x.globalAlpha = fz * .78; x.fillStyle = SCHWARZ; x.fill(); x.globalAlpha = fz * .62; x.fillStyle = GELB; x.fill(); });
        x.fillStyle = GELB; x.globalAlpha = fz; x.beginPath(); if (path(Tq)) x.fill();
        if (st.m != null) drawMoment.call({ ctx: x, red: this.red }, k, st.m, a + G2 / 2, b + G2 / 2, hg, fz, tc, pr, NEAR);
        low = Bq;
      }
      /* Nummer unter dem Feld (unter der untersten Ecke, egal von wo die Kamera schaut) */
      if (za > 0 && st.za !== 0 && low && !low.some(c => c[2] < NEAR)) {
        const s = low.map(pr), cx = s.reduce((v, p) => v + p[0], 0) / 4, by = Math.max(...s.map(p => p[1]));
        x.font = '500 ' + nf.toFixed(1) + 'px ' + this.fT; x.letterSpacing = '0.14em'; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillStyle = hell ? SCHWARZ : WEISS;
        x.globalAlpha = za * (st.za == null ? 1 : st.za) * fz * (u > 0 ? .55 + .45 * hot : .6); x.fillText(String(k + 1).padStart(2, '0'), cx, by + 8); x.letterSpacing = '0px';
      }
    });

    /* Floating House am Ziel */
    const hA = o.haus || 0;
    if (hA > 0) {
      const { c0, t, r, K } = this.haus(), lit = o.licht || 0, faces = [];
      const W3 = (u, v, y) => tc(c0.x + (r.x * u + t.x * v) * K, y * K, c0.z + (r.z * u + t.z * v) * K);
      const box = (b, wins) => { const [u0, u1, v0, v1, y0, y1] = b;
        faces.push({ p: [W3(u0, v0, y0), W3(u1, v0, y0), W3(u1, v0, y1), W3(u0, v0, y1)], w: (wins || []).map(([a0, a1, b0, b1]) => [W3(a0, v0, b0), W3(a1, v0, b0), W3(a1, v0, b1), W3(a0, v0, b1)]) });
        faces.push({ p: [W3(u0, v1, y0), W3(u1, v1, y0), W3(u1, v1, y1), W3(u0, v1, y1)], w: [] });
        faces.push({ p: [W3(u0, v0, y0), W3(u0, v1, y0), W3(u0, v1, y1), W3(u0, v0, y1)], w: [] });
        faces.push({ p: [W3(u1, v0, y0), W3(u1, v1, y0), W3(u1, v1, y1), W3(u1, v0, y1)], w: [] });
        faces.push({ p: [W3(u0, v0, y1), W3(u1, v0, y1), W3(u1, v1, y1), W3(u0, v1, y1)], w: [] }); };
      box([-900, 900, -450, 450, 0, 330], [[-820, -120, 30, 300]]); box([-300, 1200, -400, 400, 330, 620], [[300, 1120, 380, 580]]);
      faces.map(f => Object.assign(f, { z: f.p.reduce((s, c) => s + c[2], 0) / 4 })).sort((a, b) => b.z - a.z).forEach(f => {
        x.beginPath(); if (!path(f.p)) return; x.globalAlpha = hA; x.fillStyle = SCHWARZ; x.fill(); x.strokeStyle = WEISS; x.globalAlpha = hA * .85; x.lineWidth = 1.2; x.stroke();
        f.w.forEach(q => { x.beginPath(); if (!path(q)) return; if (lit > 0) { x.globalAlpha = hA * lit; x.fillStyle = GELB; x.fill(); } x.globalAlpha = hA * .7; x.stroke(); });
      });
    }
    x.restore(); x.globalAlpha = 1;
  }

  /* Beschriftung im Bild: Zeile in Versalien mit gelbem Strich, darunter der Titel (wie die Marken der Fahrt) */
  marke(px, py, l1, l2, o = {}) {
    const x = this.x, a = o.a == null ? 1 : o.a; if (a <= .01) return;
    const f1 = o.f1 || 11, f2 = o.f2 || 15, al = o.al || 'left', col = this.hell ? SCHWARZ : WEISS;
    x.globalAlpha = a; x.textBaseline = 'top'; x.textAlign = al;
    x.font = '500 ' + f1 + 'px ' + this.fT; x.letterSpacing = '0.16em'; x.fillStyle = col; const s1 = String(l1).toUpperCase(); x.fillText(s1, px, py);
    const w1 = x.measureText(s1).width - f1 * .16; x.fillStyle = GELB; x.fillRect(al === 'left' ? px : al === 'right' ? px - w1 : px - w1 / 2, py + f1 + 5, w1, 3);
    x.letterSpacing = '0px';
    if (l2) { x.font = '600 ' + f2 + 'px ' + this.fT; x.fillStyle = col; x.fillText(String(l2).toUpperCase(), px, py + f1 + 16); }
    x.globalAlpha = 1;
  }
}
export { lerp };
