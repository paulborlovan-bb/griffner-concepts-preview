/* GRIFFNER Journey, Runde 20 (2026-11-24): die vier Zeichnungen in „Wie wir das möglich machen.“ in der Bildsprache der 14 Tage.
   Kunde: „make the 4 animations more progressive and modern like the animation we have for the 14 steps, so they are in the same graphic vibe“.
   Je Thema eine kleine 3D-Szene auf Canvas 2D mit derselben Projektion wie die Kamerafahrt in weg.js: Kachelbrett, gestrichelter Weg
   mit Punkt, Kacheln, die zu gelben Blöcken wachsen, Nummern und Marken in Versalien mit gelbem Strich. Hier auf Weiß.
   Die Szenen laufen mit dem Scrollen (p von 0 bis 1) und bleiben am Ende stehen; die Kamera dreht dabei langsam mit.
   schichten: die Ebenen des Planungssystems fallen zu einem Plan zusammen, daraus wächst das Haus aus gelben Blöcken;
   partner:   sechs Gewerke, ihre Wege laufen in einem gelben Block zusammen (Ein Partner);
   update:    die Wochen als Kacheln in die Tiefe, der Punkt zieht Woche für Woche weiter (erledigt, als nächstes, noch offen);
   griffen:   zwei Wege von deinem Zuhause zur Manufaktur (Runde 21: in der Form des Floating House), mit jedem Besuch geht dort ein Geschoss an; dann ein Tag mehr. */

const G = 100, INS = 7, NEAR = 20;
const GELB = '#FFB200', SCHWARZ = '#000000', ANTH = '#444442', KALK = '#CACACA', WEISS = '#FFFFFF';
const cl = v => v < 0 ? 0 : v > 1 ? 1 : v, rp = (v, a, b) => cl((v - a) / (b - a));
const eo = v => 1 - Math.pow(1 - v, 3), io = v => v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
/* wie die Kacheln der Fahrt: wächst aus der Mitte und schwingt leicht über */
const pop = u => 1 + 2.9 * Math.pow(u - 1, 3) + 1.9 * Math.pow(u - 1, 2);
const hash = (i, j) => ((((i * 97 + j * 211) % 41) + 41) % 41) / 41;
const bez = (a, b, c, d, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; o.push([0, 1, 2].map(k => s * s * s * a[k] + 3 * s * s * t * b[k] + 3 * s * t * t * c[k] + t * t * t * d[k])); } return o; };
/* Catmull-Rom durch Punkte [x, z] (wie der Weg der Fahrt), Ergebnis [x, 0, z] mit n Stützen je Abschnitt */
const cr = (P, n = 14) => {
  const o = [];
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(P.length - 1, i + 2)];
    for (let s = 0; s < n; s++) { const t = s / n, f = (a, b, c, d) => .5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t); o.push([f(a[0], b[0], c[0], d[0]), 0, f(a[1], b[1], c[1], d[1])]); }
  }
  const L = P[P.length - 1]; o.push([L[0], 0, L[1]]); return o;
};
const auf = (pts, f) => { const n = pts.length - 1, t = cl(f) * n, i = Math.min(n - 1, Math.floor(t)), u = t - i, a = pts[i], b = pts[i + 1]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; };
const quader = (x0, x1, y0, y1, z0, z1) => [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];

/* Daten der Themen (aus inhalt.js; aus Framer kämen sie als Text) */
const zeilen = s => String(s || '').split(/\n+/).map(l => l.trim()).filter(Boolean);
export function szeneDaten(k = {}) {
  const o = { ...k };
  if (typeof o.schichten === 'string') o.schichten = o.schichten.split(/\s*[·•\n,]\s*/).map(s => s.trim()).filter(Boolean);
  if (typeof o.punkte === 'string') o.punkte = zeilen(o.punkte).map(l => { const m = l.match(/^(.+?[.:])\s+(.+)$/); return m ? [m[1], m[2]] : [l, '']; });
  if (typeof o.marken === 'string') o.marken = zeilen(o.marken).map(l => { const [a, ...b] = l.split(/\s+·\s+/); return [a || '', b.join(' · ')]; });
  o.schichten = (o.schichten || []).slice(0, 6); o.punkte = o.punkte || []; o.marken = o.marken || [];
  return o;
}
/* Muster je Ebene: nach dem Namen, sonst nach der Reihe */
const TYP = (nm, k) => { const s = String(nm).toLowerCase(); return /innen/.test(s) ? 'innen' : /archit/.test(s) ? 'archit' : /technik|install|energie/.test(s) ? 'technik' : /unterbau|keller|fundament/.test(s) ? 'unterbau' : /au(ß|ss)en|garten|freiraum/.test(s) ? 'aussen' : ['archit', 'innen', 'technik', 'unterbau', 'aussen'][k % 5]; };
/* Haus im Planungssystem: Hauptteil 2 × 2 Kacheln, Anbau 1 Kachel (Kachel i, j und Höhe) */
const HAUS = [[-1, 0, 62], [0, 0, 62], [-1, 1, 62], [0, 1, 62], [1, 0, 36]];
const GARTEN = [[-1, -1], [0, -1], [1, -1], [1, 1]];

export class Szene {
  constructor(can, t, f = {}) { this.can = can; this.x = can.getContext('2d'); this.t = szeneDaten(t); this.art = this.t.art; this.fT = f.fT || 'sans-serif'; this.key = ''; this.W = 0; this.F = 1; this.cx = 0; this.cy = 0; }
  size(mob) {
    const W = this.can.clientWidth, H = this.can.clientHeight; if (!W || !H) { this.W = 0; return; }
    const dpr = Math.min(2, devicePixelRatio || 1), cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (this.can.width !== cw || this.can.height !== ch) { this.can.width = cw; this.can.height = ch; }
    /* hohe Fläche (Telefon, Tablet hochkant): gedrehte Kamera und Beschriftung wie am Telefon; schmale Fläche: kleinere Schrift */
    const klein = W < 460; Object.assign(this, { W, H, dpr, mob: mob || W / H < .9, f1: klein ? 9 : 11, f2: klein ? 11.5 : 14 });
    this.fit(); this.key = '';
  }
  draw(p) {
    if (!this.W) return; p = cl(p); const k = p.toFixed(4); if (k === this.key) return; this.key = k;
    const x = this.x; x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); x.clearRect(0, 0, this.W, this.H);
    x.globalAlpha = 1; x.setLineDash([]); x.letterSpacing = '0px'; x.lineJoin = 'miter'; this.belegt = [];
    this.cam(p); const f = this['s_' + this.art]; if (f) f.call(this, p);
    x.globalAlpha = 1; x.setLineDash([]); x.letterSpacing = '0px';
  }

  /* ---------- Kamera und Projektion (wie draw() in weg.js) ---------- */
  view(az, el, d, T) {
    const C = { x: T[0] + d * Math.cos(el) * Math.cos(az), y: T[1] + d * Math.sin(el), z: T[2] + d * Math.cos(el) * Math.sin(az) };
    let fx = T[0] - C.x, fy = T[1] - C.y, fz = T[2] - C.z; const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
    let rx = fz, rz = -fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
    const ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;
    this.tc = (px, py, pz) => { const dx = px - C.x, dy = py - C.y, dz = pz - C.z; return [dx * rx + dz * rz, dx * ux + dy * uy + dz * uz, dx * fx + dy * fy + dz * fz]; };
  }
  /* Telefon: die Kamera steht um 90° gedreht, so läuft die lange Achse der Szene in die Tiefe und füllt die hohe Fläche */
  cam(p) {
    const A = -Math.PI / 2, a = this.art, e = io(p), m = this.mob, R = m ? -Math.PI / 2 : 0;
    if (a === 'schichten') { const mg = io(rp(p, .5, .78)); return this.view(A - .72 + .34 * e, (m ? .56 : .5) + .16 * mg, 1250, [0, 80 * (1 - mg) + 10, 0]); }
    if (a === 'partner') return this.view(A + R - .34 + .24 * e, (m ? .98 : .84) - .1 * e, 1900, [0, 20, 0]);
    if (a === 'update') return this.view(A + R - .3 + .2 * e, (m ? .9 : .66) + .05 * e, 2600, [0, 0, 0]);
    return this.view(A + R + (m ? .5 - .2 * e : -.36 + .26 * e), (m ? .86 : .66) - .05 * e, 2000, [60, 20, 0]);
  }
  /* Bildschirmpunkt unter (bzw. über) einer Kachel: Mitte und unterste (oberste) Ecke */
  kante(cx, cz, h, unten, y = 0) { let b = null, s = 0, n = 0; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, c]) => { const q = this.P(cx + a * h, y, cz + c * h); if (!q) return; s += q[0]; n++; if (!b || (unten ? q[1] > b[1] : q[1] < b[1])) b = q; }); return b ? [s / n, b[1]] : null; }
  /* Beschriftung von der Mitte der Szene weg: links, rechts, oben oder unten neben dem Punkt */
  weg(q, l1, l2, o = {}) {
    if (!q) return; const c = this.P(0, 0, 0) || [this.W / 2, this.H / 2], dx = q[0] - c[0], dy = q[1] - c[1], d = this.mob ? 8 : 12;
    if (Math.abs(dx) * (o.k || 1) > Math.abs(dy)) this.lab(q[0] + (dx > 0 ? d : -d), q[1] - this.lh(l1, l2) / 2, l1, l2, { ...o, al: dx > 0 ? 'left' : 'right' });
    else this.lab(q[0], q[1] + (dy > 0 ? d : -d), l1, l2, { ...o, up: dy < 0 });
  }
  /* Q: wie P, aber durch die Hausdrehung this.T (am Telefon steht das Floating House quer, die Fassade schaut zur Kamera) */
  Q(x, y, z) { return this.T ? this.P(...this.T([x, y, z])) : this.P(x, y, z); }
  P(x, y, z) { const c = this.tc(x, y, z); return c[2] < NEAR ? null : [this.cx + c[0] * this.F / c[2], this.cy - c[1] * this.F / c[2]]; }
  /* Maßstab so, dass die Szene über ihren ganzen Ablauf in die Fläche passt (Platz für die Beschriftungen bleibt frei) */
  hull() {
    const a = this.art, n = Math.max(1, this.t.schichten.length);
    if (a === 'schichten') { const r = this.mob ? 170 : 230; return quader(-r, r, 0, 30 + (n - 1) * 62 + 20, -r, r); }
    if (a === 'partner') return quader(-450, 450, 0, 90, -260, 260);
    if (a === 'update') return quader(-760, 760, 0, 50, this.mob ? -150 : -200, this.mob ? 150 : 200);
    return this.mob ? quader(-470, 500, 0, 110, -360, 360) : quader(-470, 640, 0, 110, -330, 330);
  }
  pads() {
    const m = this.mob, a = this.art, k = this.f1 / 9, K = o => m ? Object.fromEntries(Object.entries(o).map(([n, v]) => [n, v * k])) : o;
    if (a === 'schichten') { const x = this.x; x.font = '500 ' + this.f1 + 'px ' + this.fT; x.letterSpacing = '0.16em'; const w = Math.max(60, ...this.t.schichten.map(s => x.measureText(s.toUpperCase()).width)) + this.f1 * 2.9; x.letterSpacing = '0px'; return { l: 4, r: w + (m ? 30 : 56), t: m ? 8 : 20, b: m ? 8 : 20 }; }
    if (a === 'partner') return K(m ? { l: 16, r: 16, t: 34, b: 24 } : { l: 54, r: 54, t: 44, b: 40 });
    if (a === 'update') return K(m ? { l: 8, r: 132, t: 30, b: 8 } : { l: 20, r: 20, t: 96, b: 50 });
    return K(m ? { l: 78, r: 78, t: 40, b: 30 } : { l: 50, r: 110, t: 56, b: 50 });
  }
  fit() {
    const pad = this.pad = this.pads(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    [0, .25, .5, .75, 1].forEach(p => { this.cam(p); this.hull().forEach(([a, b, c]) => { const q = this.tc(a, b, c); if (q[2] < NEAR) return; const X = q[0] / q[2], Y = -q[1] / q[2]; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }); });
    const aw = Math.max(40, this.W - pad.l - pad.r), ah = Math.max(40, this.H - pad.t - pad.b);
    this.F = Math.min(aw / Math.max(1e-6, x1 - x0), ah / Math.max(1e-6, y1 - y0));
    this.cx = pad.l + aw / 2 - this.F * (x0 + x1) / 2; this.cy = pad.t + ah / 2 - this.F * (y0 + y1) / 2;
  }

  /* ---------- Zeichnen ---------- */
  poly(pts) { const s = pts.map(q => this.Q(q[0], q[1], q[2])); if (s.some(v => !v)) return null; const pa = new Path2D(); s.forEach((q, i) => i ? pa.lineTo(q[0], q[1]) : pa.moveTo(q[0], q[1])); pa.closePath(); return pa; }
  quad(x0, z0, x1, z1, y = 0) { return this.poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]); }
  /* Kachelbrett wie in der Fahrt; die Kacheln wachsen von der Mitte nach außen (g0 bis g1) und laufen zum Rand ins Weiß aus */
  board(p, ni, nj, R, g0, g1, skip) {
    const x = this.x; x.lineWidth = 1;
    for (let i = -ni; i <= ni; i++) for (let j = -nj; j <= nj; j++) {
      if (skip && skip(i, j)) continue;
      const r = Math.hypot(i * G / R[0], j * G / R[1]), fa = cl((1.12 - r) / .5); if (fa <= .01) continue;
      const ar = g0 + (g1 - g0) * (cl(r) * .75 + hash(i, j) * .25), t = eo(rp(p, ar, ar + .16)); if (t <= 0) continue;
      const n = INS + (G / 2 - INS) * (1 - t), q = this.quad(i * G - G / 2 + n, j * G - G / 2 + n, i * G + G / 2 - n, j * G + G / 2 - n); if (!q) continue;
      x.globalAlpha = fa * t * .34; x.fillStyle = KALK; x.fill(q);
      x.globalAlpha = fa * t * .9; x.strokeStyle = KALK; x.stroke(q);
    }
  }
  /* Kachel als Block: 'gelb' wie die Tage der Fahrt, 'weiss' mit Haarlinie, 'schwarz' wie das Haus am Ende der Fahrt */
  box(x0, z0, x1, z1, y0, y1, st, a = 1, win) {
    const B = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    if (y1 - y0 > .5) [0, 1, 2, 3].map(i => { const p = B[i], q = B[(i + 1) % 4], f = [[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]; return { f, i, z: f.reduce((s, c) => s + (this.T ? this.tc(...this.T(c)) : this.tc(c[0], c[1], c[2]))[2], 0) / 4 }; })
      .sort((u, v) => v.z - u.z).forEach(({ f, i }) => { const pa = this.poly(f); if (!pa) return; this.face(pa, st, a, false); if (win && i === 0) win(z0); });
    const pt = this.quad(x0, z0, x1, z1, y1); if (pt) this.face(pt, st, a, true);
  }
  face(pa, st, a, top) {
    const x = this.x;
    if (st === 'gelb') { if (top) { x.globalAlpha = a; x.fillStyle = GELB; x.fill(pa); } else { x.globalAlpha = a; x.fillStyle = WEISS; x.fill(pa); x.globalAlpha = a * .78; x.fillStyle = SCHWARZ; x.fill(pa); x.globalAlpha = a * .62; x.fillStyle = GELB; x.fill(pa); } }
    else if (st === 'schwarz') { x.globalAlpha = a; x.fillStyle = SCHWARZ; x.fill(pa); x.globalAlpha = a * .85; x.strokeStyle = WEISS; x.lineWidth = 1.2; x.stroke(pa); }
    else { x.globalAlpha = a; x.fillStyle = WEISS; x.fill(pa); x.globalAlpha = a * .9; x.strokeStyle = SCHWARZ; x.lineWidth = 1; x.stroke(pa); }
  }
  /* Weg von f0 bis f1 (Anteil), gestrichelt wie in der Fahrt */
  path(pts, f0, f1, col, a, dash = [3, 7], lw = 1.3) {
    if (a <= .01 || f1 <= f0) return;
    const x = this.x, n = pts.length - 1, i0 = cl(f0) * n, i1 = cl(f1) * n; x.beginPath(); let st = false;
    const go = q => { if (!q) return; if (st) x.lineTo(q[0], q[1]); else { x.moveTo(q[0], q[1]); st = true; } };
    go(this.P(...auf(pts, f0))); for (let i = Math.floor(i0) + 1; i < i1; i++) go(this.P(...pts[i])); go(this.P(...auf(pts, f1)));
    x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = lw; x.setLineDash(dash); x.stroke(); x.setLineDash([]);
  }
  dot(q, a = 1) { if (!q || a <= .01) return; const x = this.x; x.globalAlpha = a * .16; x.fillStyle = SCHWARZ; x.beginPath(); x.arc(q[0], q[1], 9, 0, 7); x.fill(); x.globalAlpha = a; x.beginPath(); x.arc(q[0], q[1], 3.5, 0, 7); x.fill(); }
  /* Beschriftung: Zeile in Versalien (wie die Nummern und Marken der Fahrt), darunter optional eine Textzeile; mark = gelber Strich */
  tw(l1, l2) {
    const x = this.x; let w = 0;
    if (l1) { x.font = '500 ' + this.f1 + 'px ' + this.fT; x.letterSpacing = '0.16em'; w = x.measureText(String(l1).toUpperCase()).width - this.f1 * .16; }
    if (l2) { x.font = '400 ' + this.f2 + 'px ' + this.fT; x.letterSpacing = '0px'; w = Math.max(w, x.measureText(l2).width); }
    x.letterSpacing = '0px'; return w;
  }
  lh(l1, l2, mark) { return (l1 ? this.f1 : 0) + (l1 && l2 ? Math.round(this.f1 * .6) + (mark ? 8 : 0) : 0) + (l2 ? this.f2 * 1.1 : 0) + (mark && !l2 ? 7 : 0); }
  lab(px, py, l1, l2, o = {}) {
    const x = this.x, a = o.a == null ? 1 : o.a; if (a <= .01 || (!l1 && !l2)) return;
    const al = o.al || 'center', h = this.lh(l1, l2, o.mark), w = this.tw(l1, l2);
    const lx = al === 'left' ? px : al === 'right' ? px - w : px - w / 2;
    let y = o.up ? py - h : py;
    x.textAlign = 'left'; x.textBaseline = 'top'; x.globalAlpha = a;
    if (l1) {
      const s = String(l1).toUpperCase(); x.font = '500 ' + this.f1 + 'px ' + this.fT; x.letterSpacing = '0.16em'; x.fillStyle = o.c1 || SCHWARZ;
      const w1 = x.measureText(s).width - this.f1 * .16, x1 = al === 'left' ? px : al === 'right' ? px - w1 : px - w1 / 2;
      x.fillText(s, x1, y);
      if (o.mark) { x.fillStyle = GELB; x.fillRect(x1, y + this.f1 + 4, w1, 3); }
      y += this.f1 + (l2 ? Math.round(this.f1 * .6) + (o.mark ? 8 : 0) : 0);
    }
    if (l2) { x.font = '400 ' + this.f2 + 'px ' + this.fT; x.letterSpacing = '0px'; x.fillStyle = o.c2 || ANTH; const w2 = x.measureText(l2).width; x.fillText(l2, al === 'left' ? px : al === 'right' ? px - w2 : px - w2 / 2, y); }
    x.letterSpacing = '0px';
    return { x: lx, y: o.up ? py - h : py, w, h };
  }

  /* Beschriftung an der ersten freien Stelle neben dem Punkt (r rechts, l links, u unten, o oben); belegte Flächen werden gemerkt */
  sperre(pts) { let r = null; pts.forEach(c => { const q = this.P(...c); if (!q) return; r = r ? [Math.min(r[0], q[0]), Math.max(r[1], q[0]), Math.min(r[2], q[1]), Math.max(r[3], q[1])] : [q[0], q[0], q[1], q[1]]; }); if (r) this.belegt.push(r); }
  setze(q, l1, l2, o = {}, wahl = ['r', 'l', 'u', 'o']) {
    if (!q || (o.a != null && o.a <= .01) || (!l1 && !l2)) return;
    const w = this.tw(l1, l2), h = this.lh(l1, l2, o.mark), d = this.mob ? 8 : 12, B = this.belegt;
    const K = { r: [q[0] + d, q[1] - h / 2, 'left'], l: [q[0] - d, q[1] - h / 2, 'right'], u: [q[0], q[1] + d, 'center'], o: [q[0], q[1] - d - h, 'center'] };
    let best = null;
    for (const k of wahl) {
      const [x, y, al] = K[k], x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2, r = [x0, x0 + w, y, y + h];
      const ok = r[0] >= 2 && r[1] <= this.W - 2 && r[2] >= 0 && r[3] <= this.H && !B.some(b => r[0] < b[1] + 6 && r[1] > b[0] - 6 && r[2] < b[3] + 3 && r[3] > b[2] - 3);
      if (!best || ok) best = [x, y, al, r]; if (ok) break;
    }
    B.push(best[3]); this.lab(best[0], best[1], l1, l2, { ...o, al: best[2], up: false });
  }

  /* ---------- GRIFFNER Planungssystem: Ebenen fallen zu einem Plan zusammen ---------- */
  s_schichten(p) {
    const x = this.x, L = this.t.schichten.length ? this.t.schichten : ['Plan'], n = L.length, mg = io(rp(p, .5, .78));
    this.board(p, 3, 3, [340, 340], 0, .3, (i, j) => Math.abs(i) <= 1 && Math.abs(j) <= 1);
    const gap = 62, base = 30;
    const pl = L.map((nm, k) => { const j = n - 1 - k, ap = eo(rp(p, .04 + j * .07, .24 + j * .07)); return { k, j, nm, ap, y: (base + j * gap) * (1 - mg) + 1 + (1 - ap) * 90, ty: TYP(nm, k) }; });
    for (let j = 0; j < n; j++) { const P = pl[n - 1 - j]; if (P.ap > .01) this.platte(P, mg, j === 0); }
    /* aus dem Plan wächst das Haus: gelbe Blöcke wie die Tage der Fahrt */
    HAUS.map(([i, j, h], k) => ({ i, j, h, k, z: this.tc(i * G, 0, j * G)[2] })).sort((a, b) => b.z - a.z).forEach(({ i, j, h, k }) => {
      const u = rp(p, .74 + k * .03, .9 + k * .03); if (u <= 0) return;
      const nn = G / 2 - (G / 2 - INS) * Math.min(1.04, pop(u)); this.box(i * G - G / 2 + nn, j * G - G / 2 + nn, i * G + G / 2 - nn, j * G + G / 2 - nn, 1, 1 + h * eo(u), 'gelb', 1);
    });
    /* Beschriftung rechts in einer Spalte, Haarlinien zur Ecke jeder Ebene; fallen die Ebenen zusammen, laufen die Linien in einem Punkt zusammen */
    const colX = this.W - this.pad.r + (this.mob ? 18 : 34), lh = this.mob ? 17 : 23;
    const an = pl.map(P => { let b = null; [[-150, -150], [150, -150], [150, 150], [-150, 150]].forEach(([u, v]) => { const q = this.P(u, P.y, v); if (q && (!b || q[0] > b[0])) b = q; }); return b; });
    const ys = an.map(q => q ? q[1] : 0); for (let k = 1; k < n; k++) ys[k] = Math.max(ys[k], ys[k - 1] + lh);
    const ym = an.reduce((s, q) => s + (q ? q[1] : 0), 0) / n;
    x.font = '500 ' + this.f1 + 'px ' + this.fT;
    pl.forEach((P, k) => {
      const q = an[k]; if (!q || P.ap <= .01) return; const ly = ys[k] + (ym + (k - (n - 1) / 2) * lh - ys[k]) * mg;
      x.globalAlpha = P.ap * .5; x.strokeStyle = ANTH; x.lineWidth = 1; x.beginPath(); x.moveTo(q[0] + 3, q[1]); x.lineTo(colX - 12, ly); x.stroke();
      x.globalAlpha = P.ap; x.fillStyle = SCHWARZ; x.fillRect(q[0] - 2, q[1] - 2, 4, 4);
      x.textAlign = 'left'; x.textBaseline = 'middle'; x.font = '500 ' + this.f1 + 'px ' + this.fT; x.letterSpacing = '0.16em';
      x.fillStyle = ANTH; x.fillText(String(k + 1).padStart(2, '0'), colX, ly + .5); x.fillStyle = SCHWARZ; x.fillText(String(P.nm).toUpperCase(), colX + this.f1 * 2.9, ly + .5);
      x.letterSpacing = '0px';
    });
  }
  platte(P, mg, unten) {
    const x = this.x, a = P.ap, y = P.y, q = this.quad(-150, -150, 150, 150, y); if (!q) return;
    x.globalAlpha = a * .94 * (unten ? 1 : 1 - .9 * mg); x.fillStyle = WEISS; x.fill(q);
    x.lineWidth = 1; x.strokeStyle = KALK;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const t = this.quad(i * G - 50 + INS, j * G - 50 + INS, i * G + 50 - INS, j * G + 50 - INS, y); if (t) { x.globalAlpha = a * .75 * (unten ? 1 : 1 - .8 * mg); x.stroke(t); } }
    x.globalAlpha = a * .9 * (unten ? 1 : 1 - mg); x.strokeStyle = SCHWARZ; x.stroke(q);
    const cell = (i, j, n) => this.quad(i * G - 50 + n, j * G - 50 + n, i * G + 50 - n, j * G + 50 - n, y);
    if (P.ty === 'archit') {
      const o = this.poly([[-150, y, -50], [150, y, -50], [150, y, 50], [50, y, 50], [50, y, 150], [-150, y, 150]]); if (o) { x.globalAlpha = a; x.strokeStyle = SCHWARZ; x.lineWidth = 1.6; x.stroke(o); }
      const w1 = this.P(-150, y, 50), w2 = this.P(-30, y, 50); if (w1 && w2) { x.lineWidth = 1.2; x.beginPath(); x.moveTo(w1[0], w1[1]); x.lineTo(w2[0], w2[1]); x.stroke(); }
    } else if (P.ty === 'innen') {
      [[-135, 95, -75, 135], [-30, -25, 25, 20], [72, -32, 132, 30], [-130, -30, -95, 30]].forEach(r => { const t = this.quad(r[0], r[1], r[2], r[3], y); if (t) { x.globalAlpha = a * .55; x.fillStyle = ANTH; x.fill(t); } });
    } else if (P.ty === 'technik') {
      const pts = [[-100, y, -20], [-100, y, 100], [0, y, 100], [0, y, 0], [100, y, 0]];
      this.path(pts, 0, 1, SCHWARZ, a * .9, [3, 4], 1.2); x.globalAlpha = a; x.fillStyle = SCHWARZ;
      pts.forEach(c => { const s = this.P(...c); if (s) x.fillRect(s[0] - 2.5, s[1] - 2.5, 5, 5); });
    } else if (P.ty === 'unterbau') {
      HAUS.forEach(([i, j]) => { const t = cell(i, j, INS); if (t) { x.globalAlpha = a * .8; x.fillStyle = KALK; x.fill(t); x.globalAlpha = a * .6; x.strokeStyle = ANTH; x.lineWidth = 1; x.stroke(t); } });
    } else {
      GARTEN.forEach(([i, j]) => { const t = cell(i, j, INS); if (t) { x.globalAlpha = a * .5; x.fillStyle = KALK; x.fill(t); } });
      [[-120, -120], [-60, -95], [10, -125], [110, -110], [120, 120], [90, 85]].forEach(([u, v]) => { const s = this.P(u, y, v); if (s) { x.globalAlpha = a * .75; x.fillStyle = ANTH; x.fillRect(s[0] - 2.5, s[1] - 2.5, 5, 5); } });
    }
  }

  /* ---------- Ein Vertragspartner: sechs Gewerke, ein gelber Block ---------- */
  s_partner(p) {
    const T = [[-4, 2], [-4, 0], [-4, -2], [4, 2], [4, 0], [4, -2]], M = this.t.marken, ord = [0, 3, 1, 4, 2, 5];
    this.board(p, 5, 3, [600, 380], 0, .28, (i, j) => (i === 0 && j === 0) || T.some(t => t[0] === i && t[1] === j));
    const R = T.map(([i, j]) => { const s = Math.sign(i), z = j * G; return bez([s * (Math.abs(i) * G - G / 2 + INS), 0, z], [s * 240, 0, z], [s * 170, 0, z * .2], [s * (G / 2 - INS + 4), 0, z * .2]); });
    const ap = T.map((_, k) => eo(rp(p, .05 + ord.indexOf(k) * .035, .2 + ord.indexOf(k) * .035)));
    const rr = T.map((_, k) => io(rp(p, .26 + ord.indexOf(k) * .06, .5 + ord.indexOf(k) * .06)));
    R.forEach((pts, k) => { this.path(pts, 0, 1, KALK, ap[k]); this.path(pts, 0, rr[k], SCHWARZ, .9); });
    const arr = rr.reduce((s, v) => s + rp(v, .9, 1), 0) / T.length, first = rp(rr[0], .9, 1), h = 10 + 100 * eo(arr), cb = eo(rp(p, .1, .24));
    T.map(([i, j], k) => ({ i, j, k, z: this.tc(i * G, 0, j * G)[2] })).concat([{ i: 0, j: 0, k: -1, z: this.tc(0, 0, 0)[2] }]).sort((a, b) => b.z - a.z).forEach(({ i, j, k }) => {
      if (k < 0) {
        if (first <= 0) { const q = this.quad(-G / 2 + INS, -G / 2 + INS, G / 2 - INS, G / 2 - INS); if (q && cb > 0) { this.x.globalAlpha = cb * .8; this.x.strokeStyle = SCHWARZ; this.x.lineWidth = 1; this.x.stroke(q); } return; }
        const nn = G / 2 - (G / 2 - INS) * Math.min(1.04, pop(first)); this.box(-G / 2 + nn, -G / 2 + nn, G / 2 - nn, G / 2 - nn, 0, h, 'gelb', 1); return;
      }
      const a = ap[k]; if (a <= 0) return; const nn = G / 2 - (G / 2 - INS) * Math.min(1.04, pop(a));
      this.box(i * G - G / 2 + nn, j * G - G / 2 + nn, i * G + G / 2 - nn, j * G + G / 2 - nn, 0, 16 * a, 'weiss', 1);
    });
    rr.forEach((v, k) => { if (v > 0 && v < 1) this.dot(this.P(...auf(R[k], v)), 1); });
    /* Beschriftungen ohne Überschneidung: am Telefon stehen die hinteren Gewerke über ihren Kacheln, Ein Partner rechts neben dem Block */
    const fest = [], c0 = this.P(0, 0, 0), put = (cx, y, l1, l2, o, dir) => {
      const w = this.tw(l1, l2), hh = this.lh(l1, l2, o.mark); let top = dir > 0 ? y : y - hh, x0 = o.al === 'left' ? cx : cx - w / 2;
      for (let n = 0; n < 4 && fest.some(r => x0 < r[1] + 8 && x0 + w > r[0] - 8 && top < r[3] + 3 && top + hh > r[2] - 3); n++) top += dir * (hh + 5);
      fest.push([x0, x0 + w, top, top + hh]); this.lab(cx, top, l1, l2, { ...o, up: false });
    };
    const m6 = M[6] || [], a6 = eo(rp(p, .8, .94));
    if (this.mob) { let r = null; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([u, v]) => { const q = this.P(u * (G / 2 - INS), h, v * (G / 2 - INS)); if (q && (!r || q[0] > r[0])) r = q; }); if (r && a6 > .01) put(r[0] + 10, r[1] - this.f1 / 2, m6[0], m6[1], { al: 'left', mark: true, a: a6 }, 1); }
    else { const qt = this.kante(0, 0, G / 2 - INS, false, h); if (qt && a6 > .01) put(qt[0], qt[1] - 18, m6[0], m6[1], { mark: true, a: a6 }, -1); }
    T.forEach(([i, j], k) => {
      const m = M[k] || [], a = eo(rp(p, .12 + ord.indexOf(k) * .035, .3 + ord.indexOf(k) * .035)); if (a <= .01) return;
      const qb = this.kante(i * G, j * G, G / 2 - INS, true), up = this.mob && c0 && qb && qb[1] < c0[1], q = up ? this.kante(i * G, j * G, G / 2 - INS, false, 16 * ap[k]) : qb;
      if (q) put(q[0], q[1] + (up ? -6 : this.mob ? 6 : 10), m[0], m[1], { a, c1: rr[k] >= 1 ? SCHWARZ : ANTH }, up ? -1 : 1);
    });
  }

  /* ---------- Wochenupdate: Woche für Woche, der Punkt zieht weiter ---------- */
  s_update(p) {
    const x = this.x, N = 8, C = Array.from({ length: N }, (_, k) => [(k - (N - 1) / 2) * 2, Math.round(Math.sin(k * .75) * 1.3)]);
    const pts = cr(C.map(([i, j]) => [i * G, j * G]), 16), hp = -.4 + 4.55 * io(rp(p, .12, .84));
    const PU = this.t.punkte, M = this.t.marken, tit = k => (PU[k] || [])[0] || '';
    this.board(p, 8, 3, [840, 380], 0, .3, (i, j) => C.some(c => c[0] === i && c[1] === j));
    this.path(pts, 0, 1, KALK, eo(rp(p, .04, .2))); this.path(pts, 0, cl(hp / (N - 1)), SCHWARZ, .9);
    const uk = k => rp(hp, k - .4, k + .02), n0 = C.findIndex((_, k) => uk(k) <= 0), nx = n0 < 0 ? N : n0;
    const hg = k => { const u = uk(k); return u > 0 ? (6 + 44 * cl(1 - Math.abs(hp - k) * 1.25)) * Math.min(1, u * 1.6) : 0; };
    /* Wochen: erreichte Kacheln werden gelbe Blöcke (die aktuelle am höchsten), die nächste ist gestrichelt, die übrigen offen */
    C.map((c, k) => ({ c, k, z: this.tc(c[0] * G, 0, c[1] * G)[2] })).sort((a, b) => b.z - a.z).forEach(({ c, k }) => {
      const x0 = c[0] * G - G / 2, z0 = c[1] * G - G / 2, ta = eo(rp(p, .04 + k * .02, .18 + k * .02)); if (ta <= 0) return;
      const u = uk(k);
      if (u <= 0) {
        const q = this.quad(x0 + INS, z0 + INS, x0 + G - INS, z0 + G - INS); if (!q) return;
        x.globalAlpha = ta; x.fillStyle = WEISS; x.fill(q); x.globalAlpha = ta * .85; x.strokeStyle = SCHWARZ; x.lineWidth = 1; if (k === nx) x.setLineDash([3, 3]); x.stroke(q); x.setLineDash([]);
      } else { const nn = G / 2 - (G / 2 - INS) * Math.min(1.04, pop(u)); this.box(x0 + nn, z0 + nn, x0 + G - nn, z0 + G - nn, 0, hg(k), 'gelb', 1); }
    });
    const head = hp > -.3 && hp < N - 1 ? this.P(...auf(pts, hp / (N - 1))) : null; this.dot(head, rp(p, .1, .16));
    /* Beschriftung wie Maßketten über den Wochen: erledigt, als nächstes, noch offen; unter dem Punkt Kosten und Termine */
    const ext = k => { const c = C[k], h = hg(k); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => [0, h].forEach(yy => { const q = this.P(c[0] * G + a * (G / 2 - INS), yy, c[1] * G + b * (G / 2 - INS)); if (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); } })); return [x0, x1, y0, y1]; };
    const E = C.map((_, k) => ext(k)), rowY = Math.min(...E.map(e => e[2])) - (this.mob ? 14 : 22), rowB = Math.max(...E.map(e => e[3])) + (this.mob ? 12 : 18), step = this.f1 + (this.mob ? 12 : 16);
    const cur = Math.round(cl(hp / (N - 1)) * (N - 1)), done = [], open = []; C.forEach((_, k) => { if (k < cur && uk(k) > .5) done.push(k); else if (k > nx) open.push(k); });
    const GR = [], grp = (ks, t, a) => { if (!ks.length || !t || a <= .01) return; GR.push({ x0: Math.min(...ks.map(k => E[k][0])), x1: Math.max(...ks.map(k => E[k][1])), t, a }); };
    grp(done, tit(0), rp(hp, .7, 1.2)); if (nx < N) grp([nx], tit(1), rp(p, .2, .3)); grp(open, tit(2), rp(p, .24, .34));
    if (this.mob) return this.updateRechts(p, C, E, GR, head, done, open, nx, tit, M);
    const rows = []; x.lineWidth = 1;
    GR.sort((a, b) => a.x0 - b.x0).forEach(g => {
      const w = this.tw(g.t), cx = (g.x0 + g.x1) / 2; let r = 0; while (rows[r] != null && rows[r] > cx - w / 2 - 14) r++; rows[r] = cx + w / 2;
      const ly = rowY - r * step; x.globalAlpha = g.a * .7; x.strokeStyle = ANTH; x.beginPath(); x.moveTo(g.x0, ly); x.lineTo(g.x1, ly); x.moveTo(g.x0, ly); x.lineTo(g.x0, ly + 6); x.moveTo(g.x1, ly); x.lineTo(g.x1, ly + 6); x.stroke();
      this.lab(cx, ly - 5, g.t, '', { up: true, a: g.a });
    });
    if (head) { const t = tit(3), a = rp(p, .3, .4); if (t && a > 0) { x.globalAlpha = a * .7; x.strokeStyle = ANTH; x.beginPath(); x.moveTo(head[0], head[1] + 8); x.lineTo(head[0], rowB); x.stroke(); this.lab(Math.max(this.tw(t) / 2 + 2, Math.min(this.W - this.tw(t) / 2 - 2, head[0])), rowB + 5, t, '', { a }); } }
    const m0 = M[0] || []; this.lab(this.W / 2, Math.max(2, rowY - 2 * step - (this.mob ? 10 : 18)), m0[0], m0[1], { up: true, mark: true, a: eo(rp(p, .02, .14)) });
  }

  /* Telefon: die Wochen laufen in die Tiefe, die Maßketten stehen rechts daneben (senkrecht), dazu Kosten und Termine am Punkt */
  updateRechts(p, C, E, GR0, head, done, open, nx, tit, M) {
    const x = this.x, bx = Math.max(...E.map(e => e[1])) + 12, GR = [];
    const grp = (ks, t, a) => { if (!ks.length || !t || a <= .01) return; GR.push({ y0: Math.min(...ks.map(k => E[k][2])), y1: Math.max(...ks.map(k => E[k][3])), t, a }); };
    GR0.forEach(g => { const ks = g.t === tit(0) ? done : g.t === tit(1) ? [nx] : open; grp(ks, g.t, g.a); });
    if (head) { const t = tit(3), a = rp(p, .3, .4); if (t && a > 0) GR.push({ y0: head[1], y1: head[1], t, a, hd: head }); }
    let py = -1e9; x.lineWidth = 1;
    GR.sort((a, b) => (a.y0 + a.y1) - (b.y0 + b.y1)).forEach(g => {
      const cy = Math.max((g.y0 + g.y1) / 2, py + this.f1 + 10); py = cy;
      x.globalAlpha = g.a * .7; x.strokeStyle = ANTH; x.beginPath();
      if (g.hd) { x.moveTo(g.hd[0] + 8, g.hd[1]); x.lineTo(bx, g.hd[1]); x.lineTo(bx + 4, cy); }
      else { x.moveTo(bx - 5, g.y0); x.lineTo(bx, g.y0); x.lineTo(bx, g.y1); x.lineTo(bx - 5, g.y1); x.moveTo(bx, (g.y0 + g.y1) / 2); x.lineTo(bx + 4, cy); }
      x.stroke(); this.lab(bx + 10, cy - this.f1 / 2, g.t, '', { al: 'left', a: g.a });
    });
    const m0 = M[0] || []; this.lab(this.W / 2, Math.max(4, Math.min(...E.map(e => e[2])) - this.f1 - 34), m0[0], m0[1], { mark: true, a: eo(rp(p, .02, .14)) });
  }

  /* ---------- Besuch in Griffen: zwei Wege zur Manufaktur ---------- */
  s_griffen(p) {
    const x = this.x, M = this.t.marken, m = k => M[k] || [];
    /* Wörthersee und Feuerberg: am Desktop hinter der Manufaktur, am Telefon links und rechts daneben */
    const HX = 300, home = [-4, 0], mo = this.mob, X = mo ? [[4, 3], [4, -3]] : [[6, 2], [6, -2]], zc = mo ? -30 : 0;
    /* Hausdrehung am Telefon: Länge quer zur Blickrichtung, das Carport liegt seitlich, die Fassade schaut zu deinem Zuhause */
    const TH = mo ? ([u, y, v]) => [HX + v, y, HX - u + zc] : null, TQ = c => TH ? TH(c) : c;
    this.board(p, 6, 3, [700, 400], 0, .28, (i, j) => (i === home[0] && j === home[1]) || (mo ? i >= 2 && i <= 4 && j >= -2 && j <= 2 : i >= 1 && i <= 4 && j >= -1 && j <= 1) || X.some(c => c[0] === i && c[1] === j));
    const ax = mo ? 196 : 110, az = mo ? 60 : 74;
    const A = bez([-400, 0, G / 2 - INS], [-330, 0, 330], [40, 0, 330], [ax, 0, zc + az]), B = bez([-400, 0, -G / 2 + INS], [-320, 0, -330], [40, 0, -330], [ax, 0, zc - az]);
    const ra = io(rp(p, .2, .48)), rb = io(rp(p, .5, .78)), pa = eo(rp(p, .14, .26)), l1 = rp(p, .47, .55), l2 = rp(p, .76, .84), ex = rp(p, .8, .95);
    this.path(A, 0, 1, KALK, pa); this.path(B, 0, 1, KALK, pa);
    this.path(A, 0, ra, SCHWARZ, .9); this.path(B, 0, rb, SCHWARZ, .9);
    const XP = X.map(([i, j], k) => { const s = k ? -1 : 1; return mo ? bez([HX + 84, 0, zc + s * 40], [HX + 124, 0, zc + s * 120], [i * G, 0, j * G - s * 130], [i * G, 0, j * G - s * (G / 2 - INS)]) : bez([HX + 156, 0, s * 30], [HX + 226, 0, s * 60], [i * G - 80, 0, j * G], [i * G - G / 2 + INS, 0, j * G]); });
    XP.forEach(pts => this.path(pts, 0, io(ex), ANTH, .8, [2, 5], 1.1));
    X.forEach(([i, j]) => { const q = this.quad(i * G - G / 2 + INS, j * G - G / 2 + INS, i * G + G / 2 - INS, j * G + G / 2 - INS); if (q && ex > .3) { x.globalAlpha = rp(ex, .3, .7) * .8; x.strokeStyle = ANTH; x.lineWidth = 1; x.setLineDash([3, 4]); x.stroke(q); x.setLineDash([]); } });
    /* dein Zuhause (weißer Block) und die Manufaktur in der Form unseres Floating House (Runde 21): das verglaste Erdgeschoss
       steht zurückgesetzt, das Obergeschoss schwebt darüber und kragt rundum aus, links das Carportdach auf dem Lagerkasten.
       Schwarz wie das Haus am Ende der Fahrt; Tag 07 macht das Erdgeschoss hell, Tag 11 die Loggia oben. */
    const ah = eo(rp(p, .04, .18)), hs = eo(rp(p, .08, .3));
    const fen = (x0, x1, us, ya, yb, lit) => z0 => us.forEach(([a, b]) => { const u0 = x0 + (x1 - x0) * a, u1 = x0 + (x1 - x0) * b, q = this.poly([[u0, ya, z0], [u1, ya, z0], [u1, yb, z0], [u0, yb, z0]]); if (!q) return; if (lit > 0) { x.globalAlpha = lit; x.fillStyle = GELB; x.fill(q); } x.globalAlpha = .7; x.strokeStyle = WEISS; x.lineWidth = 1; x.stroke(q); });
    const latte = (x0, x1, n, ya, yb) => z0 => { x.globalAlpha = .32; x.strokeStyle = WEISS; x.lineWidth = 1; x.beginPath(); for (let k = 1; k < n; k++) { const u = x0 + (x1 - x0) * k / n, a = this.Q(u, ya, z0), b = this.Q(u, yb, z0); if (a && b) { x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); } } x.stroke(); };
    const fhaus = () => {
      if (hs <= 0) return;
      const he = 50 * eo(rp(hs, 0, .55)), c = eo(rp(hs, .2, .7)), ho = 56 * eo(rp(hs, .45, 1)), hc = 42 * c;
      const carport = { z: this.tc(...(this.T ? this.T([110, 0, 0]) : [110, 0, 0]))[2], f: () => { if (c <= 0) return;
        this.box(46, -54, 94, 54, 0, hc, 'schwarz', 1, latte(46, 94, 7, 3 * c, hc - 3 * c));
        [-60, 54].forEach(z => this.box(HX - 166, z, HX - 160, z + 6, 0, hc, 'schwarz', 1));
        this.box(46, -60, HX - 128, 60, hc, hc + 8 * c, 'schwarz', 1); } };
      const erd = { z: this.tc(HX, 0, 0)[2], f: () => { if (he <= .5) return; this.box(HX - 126, -56, HX + 132, 64, 0, he, 'schwarz', 1, fen(HX - 126, HX + 132, [[.03, .24], [.36, .57], [.68, .89]], he * .1, he * .92, l1)); } };
      [carport, erd].sort((a, b) => b.z - a.z).forEach(it => it.f());
      if (ho > .5) {
        const y0 = Math.max(he, hc + 8 * c), y1 = y0 + ho, lo = z0 => { const q = this.poly([[HX - 140, y0, z0], [HX + 140, y0, z0], [HX + 140, y0 + ho * .7, z0], [HX - 140, y0 + ho * .7, z0]]); if (q) { x.globalAlpha = .5; x.strokeStyle = WEISS; x.lineWidth = 1; x.stroke(q); } fen(HX - 150, HX + 150, [[.13, .31], [.42, .6], [.7, .89]], y0 + ho * .06, y0 + ho * .66, l2)(z0); };
        this.box(HX - 150, -78, HX + 150, 78, y0, y1, 'schwarz', 1, lo);
      }
    };
    const items = [{ z: this.tc(home[0] * G, 0, 0)[2], f: () => { if (ah <= 0) return; const nn = G / 2 - (G / 2 - INS) * Math.min(1.04, pop(ah)); this.box(home[0] * G - G / 2 + nn, -G / 2 + nn, home[0] * G + G / 2 - nn, G / 2 - nn, 0, 30 * ah, 'weiss', 1); } },
      { z: this.tc(HX, 0, 0)[2], f: () => { this.T = TH; fhaus(); this.T = null; } }];
    items.sort((a, b) => b.z - a.z).forEach(it => it.f());
    if (ra > 0 && ra < 1) this.dot(this.P(...auf(A, ra))); if (rb > 0 && rb < 1) this.dot(this.P(...auf(B, rb)));
    if (hs > 0) this.sperre(quader(46, HX + 150, 0, 106 * hs, -78, 78).map(TQ));
    let dach = null; [[-150, -78], [150, -78], [150, 78], [-150, 78]].forEach(([a, c]) => { const q = this.P(...TQ([HX + a, 106 * hs, c])); if (q && (!dach || q[1] < dach[1])) dach = q; }); const dm = this.P(...TQ([HX, 106 * hs, 0])); if (dach && dm) dach = [dm[0], dach[1]];
    this.setze(dach, m(1)[0], m(1)[1], { mark: true, a: eo(rp(p, .18, .32)) }, ['o', 'r', 'l']);
    this.setze(this.kante(home[0] * G, 0, G / 2 - INS, true), m(0)[0], m(0)[1], { a: eo(rp(p, .1, .24)) }, ['u', 'l', 'r']);
    this.setze(this.P(...auf(A, .5)), m(2)[0], m(2)[1], { a: rp(ra, .35, .65) }, mo ? ['l', 'o', 'r'] : ['o', 'l', 'r']);
    this.setze(this.P(...auf(B, .5)), m(3)[0], m(3)[1], { a: rp(rb, .35, .65) }, mo ? ['r', 'u', 'l'] : ['u', 'r', 'l']);
    X.forEach(([i, j], k) => this.setze(this.P(i * G, 0, j * G), m(5 - k)[0], m(5 - k)[1], { a: rp(ex, .5, 1), c1: ANTH }, mo ? (k ? ['r', 'o', 'u', 'l'] : ['l', 'o', 'u', 'r']) : ['r', k ? 'u' : 'o', 'l']));
  }
}
