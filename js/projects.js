/* Projects (projects.html): Nachbau von griffner.com/projects, Stand 11.11.2026, damit Änderungen erst hier entstehen und nicht live.
   Abläufe wie in framer-code (GriffnerMotion.tsx, ProjekteZahl.tsx, ProjekteFormen.tsx, ClaimFenster.tsx), hier ohne React:
   Hero „Kein Rendering“ → Zahl seit 1950 → Formen → Floating House (Schwarz zu Weiß, Galerie seitwärts) → GRIFFNER Living (Index)
   → GRIFFNER Building (Karten seitwärts) → Bauherren (Satz, Abspann) → Kontakt (gelbe Fläche) → Finale „built different“ → Footer. */
import { loop, reveal, $, $$, clamp, E, lerp, reduce, vhs, mix, css } from './core.js';
import { initChrome, frame } from './chrome.js';
import { CLAIM_PATH } from '../data/claim-path.js';
import { REFERENZEN } from '../data/referenzen.js';
import { initRaster } from './projekte-raster.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
/* Fortschritt einer gepinnten Sektion: 0 Oberkante oben, 1 Unterkante unten (sceneProgress) */
const scene = el => { const r = el.getBoundingClientRect(), span = r.height - vhs(); return span > 0 ? clamp(-r.top / span) : r.top <= 0 ? 1 : 0; };
const near = (el, m = 1.2) => { const r = el.getBoundingClientRect(), vh = vhs(); return r.bottom > -vh * .2 && r.top < vh * m; };
const bez = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = t => ((ax * t + bx) * t + cx) * t, fy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 6; i++) { const e = fx(t) - x, d = dx(t); if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break; t -= e / d; } return fy(clamp(t)); };
};
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const pow = { p2In: x => x * x * x, p3InOut: x => (x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2) };
/* Projektband (06 Referenzen): Bildordner, Scrollweg je Projekt in Bildschirmhöhen */
const RB_DIR = 'assets/img/projekte/ref/', RB_STEP = .42;
const pad2 = n => String(n).padStart(2, '0');
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
run('hero', initHero);
run('zahl', initZahl);
run('formen', initFormen);
run('fh', initFh);
run('living', initLiving);
run('refs', () => initBand($('[data-rb="refs"]'), REFERENZEN, 'refs'));
run('refs-b', () => initRaster($('[data-raster="refs"]'), REFERENZEN));  // nur projects-b.html
run('namen', initNamen);
run('kontakt', initKontakt);
run('finale', initFinale);
run('lux', initLux);

/* ---------- 01 Kein Rendering: das Haus erscheint klein im gelben Feld (Zeit, 2,4 s), dann öffnet das Fenster randlos (Scroll) ---------- */
function initHero() {
  const sec = $('#p-hero'); if (!sec) return;
  const st = $('.ph__st', sec), title = $('.ph__title', sec), field = $('.ph__field', sec), win = $('.ph__win', sec), img = $('.ph__img', sec), shade = $('.ph__shade', sec);
  const [l1, l2] = $$('.ph__l', sec);
  const IMG = { w: 2400, h: 1601, fx: 1366, fy: 977, fw: 1229 };
  let G = null, it = reduce ? 1 : 0;
  const size = () => {
    const W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
    const tr = title.getBoundingClientRect(), sr = st.getBoundingClientRect();
    const m = tr.left - sr.left, aT = tr.bottom - sr.top + Math.max(24, H * .04), aB = H - Math.max(32, H * .07);
    const w = Math.max(120, Math.min(W * .34, (aB - aT) / .8, W - 2 * m)), hh = w * .8, s2 = Math.max(W / IMG.w, H / IMG.h);
    G = { win: { x: (W - w) / 2, y: aT + (aB - aT - hh) / 2, w, h: hh }, cover: { s: s2, ox: (W - IMG.w * s2) * .5, oy: (H - IMG.h * s2) * .62 }, W, H };
  };
  const apply = () => {
    if (!G) return;
    const p = scene(sec), Wn = G.win, C = G.cover;
    const fg = E(it, 0, .32);
    field.style.cssText = `left:${(Wn.x + (Wn.w - Wn.w * fg) / 2).toFixed(1)}px;top:${(Wn.y + (Wn.h - Wn.h * fg) / 2).toFixed(1)}px;width:${(Wn.w * fg).toFixed(1)}px;height:${(Wn.h * fg).toFixed(1)}px`;
    const k = E(p, .04, .68), x = lerp(Wn.x, 0, k), y = lerp(Wn.y, 0, k), r = lerp(Wn.x + Wn.w, G.W, k), b = lerp(Wn.y + Wn.h, G.H, k);
    win.style.clipPath = `inset(${y.toFixed(1)}px ${(G.W - r).toFixed(1)}px ${(G.H - b).toFixed(1)}px ${x.toFixed(1)}px)`;
    const ph = E(it, .3, .78), late = E(p, .68, 1);
    const sf = (Wn.w * .9) / IMG.fw * (1 + .1 * (1 - ph)), cx = Wn.x + Wn.w / 2, cy = Wn.y + Wn.h / 2;
    const s = lerp(sf, C.s * (1 + .03 * late), k), ox = lerp(cx - IMG.fx * sf, C.ox - G.W * .015 * late, k), oy = lerp(cy - IMG.fy * sf, C.oy - G.H * .015 * late, k);
    img.style.transform = `translate3d(${ox.toFixed(1)}px,${oy.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
    img.style.opacity = ph.toFixed(3);
    shade.style.opacity = (.75 * E(p, .3, .7)).toFixed(3);
    [[l1, .5, .85], [l2, .62, .97]].forEach(([l, a, bb]) => { const e = E(it, a, bb); l.style.opacity = e.toFixed(3); l.style.transform = `translateY(${((1 - e) * 24).toFixed(1)}px)`; });
    /* Feld: bis 74 % ausgeblendet, dann an der Unterkante der Bühne (72 %) */
    if (p > .74) delete st.dataset.dockHide; else st.dataset.dockHide = '1';
  };
  size();
  new ResizeObserver(() => { size(); apply(); }).observe(st);
  if (document.fonts) document.fonts.ready.then(() => { size(); apply(); });
  loop.add({ tick() { if (near(sec)) apply(); } });
  if (!reduce) {
    const t0 = performance.now() + 200;
    const intro = now => { it = clamp((now - t0) / 2400); apply(); if (it < 1) requestAnimationFrame(intro); };
    requestAnimationFrame(intro);
  } else apply();
}

/* ---------- 02 Zahl: zählt beim Hereinscrollen hoch (2,6 s), dann rollt der Teil, der sich bei +1 ändert, und die gelbe Linie zieht ---------- */
function initZahl() {
  const el = $('[data-zahl]'); if (!el) return;
  const fmt = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  /* ab dem Stichtag jeden Montag 2 bis 3 dazu, pro Woche fest (gleiche Rechnung wie live) */
  const WEEK = 7 * 864e5, MONDAY = Date.UTC(1970, 0, 5), weekOf = t => Math.floor((t - MONDAY) / WEEK);
  const hash = n => { let x = (n ^ 0x5bd1e995) >>> 0; x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) >>> 0; x = Math.imul(x ^ (x >>> 12), 0x297a2d39) >>> 0; return (x ^ (x >>> 15)) >>> 0; };
  const base = +el.dataset.base || 10247, t0 = Date.parse(el.dataset.since);
  let value = base;
  if (isFinite(t0)) for (let w = weekOf(t0) + 1, end = weekOf(Date.now()); w <= end; w++) value += 2 + (hash(w) % 2);
  const a = fmt(value), b = fmt(value + 1);
  let k = 0; if (a.length === b.length) while (k < a.length - 1 && a[k] === b[k]) k++;
  const tail = a.length - k;
  el.setAttribute('aria-label', b);
  el.innerHTML = `<span aria-hidden="true" data-head></span><span class="pz__roll" aria-hidden="true"><span class="pz__win"><span class="pz__wheel"><span data-last></span><span>${b.slice(b.length - tail)}</span></span></span><span class="pz__note"></span></span>`;
  const head = $('[data-head]', el), last = $('[data-last]', el), wheel = $('.pz__wheel', el), note = $('.pz__note', el);
  const show = v => { const s = fmt(v); head.textContent = s.slice(0, Math.max(0, s.length - tail)); last.textContent = s.slice(-tail); };
  if (reduce) { show(value); wheel.classList.add('is-plus'); note.classList.add('is-on'); return; }
  show(0);
  const curve = bez(.215, .61, .355, 1);
  const io = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return; io.disconnect();
    const s0 = performance.now();
    const step = now => {
      const t = clamp((now - s0) / 2600); show(value * curve(t));
      if (t < 1) requestAnimationFrame(step);
      else setTimeout(() => { wheel.classList.add('is-plus'); setTimeout(() => note.classList.add('is-on'), 1300); }, 1400);
    };
    requestAnimationFrame(step);
  }, { rootMargin: '0px 0px -15% 0px' });
  io.observe(el);
}

/* ---------- 03 Formen: ein Modell verformt sich mit jedem Wort, am Ende „Deine Vision. Gebaut.“, die Fenster gehen an ---------- */
function initFormen() {
  const sec = $('#p-fw'), el = $('[data-pf]'); if (!sec || !el) return;
  const canvas = $('canvas', el), ctx = canvas.getContext('2d'), wrap = $('[data-pf-words]', el), ws = $$('span', wrap), endA = $('[data-pf-vision]', el), count = $('[data-pf-count]', el);
  const Zb = (x, z, y) => [x, z, y, 0, 0, 0, 0];
  /* [x, z, y, Breite, Tiefe, Höhe, Dach]; 0 Volumen / 1 Glas / 2 Platte / 3 bis 5 Stützen, Nebenbau */
  const CFG = [
    [[0, 0, 0, 8, 7, 3, 2.6], [0, 4.5, 0, 2.6, 2, 2.6, 0], Zb(0, 0, 3), Zb(9.6, 6, 0), Zb(-9.6, 6, 0), Zb(9.6, -6, 0)],
    [[0, 0, 3, 24, 12, 9, 0], [0, 0, 0, 22, 10, 3, 0], [0, 0, 12, 25, 13, .4, 0], Zb(9.6, 6, 0), Zb(-9.6, 6, 0), Zb(9.6, -6, 0)],
    [[-5, 0, 0, 22, 9, 3, 0], [11, 0, 0, 10, 9, 3, 0], [2, 0, 3, 38, 13, .35, 0], Zb(9.6, 6, 0), Zb(-9.6, 6, 0), Zb(9.6, -6, 0)],
    [[0, 0, 0, 8, 8, 19, 0], [0, 0, 19, 7.6, 7.6, 3, 0], [0, 0, 22, 9, 9, .4, 0], Zb(9.6, 6, 0), Zb(-9.6, 6, 0), Zb(9.6, -6, 0)],
    [[-7, -2, 0, 3, 5, 5.6, 0], [1, 0, 0, 13, 9, 5.6, 0], [0, 0, 5.6, 22, 14, .5, 0], [10.2, 6.2, 0, .4, .4, 5.6, 0], [-10.2, 6.2, 0, .4, .4, 5.6, 0], [10.2, -6.2, 0, .4, .4, 5.6, 0]],
    [[3, 0, 3.2, 22, 10, 3.4, 0], [0, 0, 0, 11, 7, 3.2, 0], [3, 0, 6.6, 22.4, 10.4, .25, 0], [-13, 1, 0, 6, 8, 2.8, 0], Zb(-9.6, 6, 0), Zb(9.6, -6, 0)]
  ];
  const FLAT = CFG[0].map(b => [b[0], b[1], 0, b[3], b[4], 0, 0]);
  const KIND = ['solid', 'glass', 'slab', 'solid', 'solid', 'solid'], N = 6;
  let dpr = 1, geo = null, FIT = [], FITEND = null;

  const size = () => {
    const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const sr = el.getBoundingClientRect(), aw = wrap.getBoundingClientRect().width || W * .8;
    /* Schriftgröße: das längste Wort füllt die Breite (höchstens 20 % der Höhe) */
    const longest = ws.reduce((a, b) => (b.textContent.length > a.textContent.length ? b : a), ws[0]);
    longest.style.fontSize = '100px';
    const fs = Math.min((aw / (longest.getBoundingClientRect().width || 1)) * 100, H * .2);
    ws.forEach(s => (s.style.fontSize = fs.toFixed(2) + 'px'));
    /* schmal: „Deine Vision.“ so groß wie „Gebaut.“, darf zweizeilig stehen */
    endA.style.fontSize = W < 820 ? fs.toFixed(2) + 'px' : '';
    const wrTop = wrap.getBoundingClientRect().top - sr.top;
    const top = Math.max(110, H * .17), ground = wrTop - Math.max(20, H * .04);
    const th = 43 * Math.PI / 180, ph = 16 * Math.PI / 180, ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
    const fitOf = (cfg, topY = top) => {
      const ah = Math.max(80, ground - topY);
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      cfg.forEach(bx => {
        if (bx[3] < .05 || bx[5] < .03) return;
        [-1, 1].forEach(sx => [-1, 1].forEach(sz => [bx[2], bx[2] + bx[5] + bx[6]].forEach(yy => {
          const X = bx[0] + sx * bx[3] / 2, Zz = bx[1] + sz * bx[4] / 2, xr = X * ct - Zz * st, zr = X * st + Zz * ct, py = -(yy * cp - zr * sp);
          x0 = Math.min(x0, xr); x1 = Math.max(x1, xr); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
        })));
      });
      const s = Math.min(aw * .86 / (x1 - x0), ah * .9 / (y1 - y0)), hgt = (y1 - y0) * s;
      return { s, cx: W / 2 - s * (x0 + x1) / 2, gy: ground - s * y1 - Math.max(0, (ah * .9 - hgt) * .15) };
    };
    FIT = CFG.map(c => fitOf(c));
    const ea0 = endA.getBoundingClientRect();
    FITEND = fitOf(CFG[N - 1], Math.max(top, ea0.bottom - sr.top + Math.max(16, H * .04)));
    geo = { W, H, clipY: wrTop - 6, s: 1, cx: 0, gy: 0 };
  };

  const draw = (boxes, lit, p) => {
    const Gm = geo;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, Gm.W, Gm.H);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Gm.W, Gm.clipY); ctx.clip();
    const th = (30 + 26 * p) * Math.PI / 180, ph = 16 * Math.PI / 180, ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph), s = Gm.s;
    const P = (x, y, z) => { const xr = x * ct - z * st, zr = x * st + z * ct; return [Gm.cx + s * xr, Gm.gy - s * (y * cp - zr * sp)]; };
    const V = [st * cp, sp, ct * cp], L = [-.45, .8, .4];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const poly = pts => { ctx.beginPath(); pts.forEach((q, n) => { const c = P(q[0], q[1], q[2]); n ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1]); }); ctx.closePath(); };
    /* Grundraster */
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.1)';
    for (let g = -24; g <= 24; g += 3) {
      let a = P(g, 0, -15), b = P(g, 0, 15); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      if (Math.abs(g) <= 15) { a = P(-24, 0, g); b = P(24, 0, g); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
    const list = boxes.map((b, k) => ({ b, k, x0: b[0] - b[3] / 2, x1: b[0] + b[3] / 2, z0: b[1] - b[4] / 2, z1: b[1] + b[4] / 2, y0: b[2], y1: b[2] + b[5] + b[6] })).filter(o => o.b[3] > .05 && o.b[4] > .05 && o.b[5] > .03);
    const ax = [['x0', 'x1', V[0]], ['y0', 'y1', V[1]], ['z0', 'z1', V[2]]], eps = .01;
    const depth = o => dot([(o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, (o.z0 + o.z1) / 2], V);
    list.sort((A, B) => {
      for (const [lo, hi, g] of ax) { if (A[hi] <= B[lo] + eps) return g >= 0 ? -1 : 1; if (B[hi] <= A[lo] + eps) return g >= 0 ? 1 : -1; }
      return depth(A) - depth(B);
    });
    const mixc = (a, b, k) => a.map((v, n) => Math.round(v + (b[n] - v) * k));
    const AN = [68, 68, 66], KA = [202, 202, 202], SA = [207, 195, 179];
    list.forEach(o => {
      const [, bz, by, w, d, hh, r] = o.b, kind = KIND[o.k], x0 = o.x0, x1 = o.x1, z0 = o.z0, z1 = o.z1, y0 = by, y1 = by + hh, zc = bz, yr = y1 + r;
      const faces = [
        { n: [0, 0, 1], pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], wall: 'x', z: z1 },
        { n: [0, 0, -1], pts: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], wall: 'x', z: z0 },
        { n: [-1, 0, 0], pts: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, yr, zc], [x0, y1, z0]], wall: 'z', x: x0 },
        { n: [1, 0, 0], pts: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, yr, zc], [x1, y1, z1]], wall: 'z', x: x1 },
        ...(r < .02 ? [{ n: [0, 1, 0], pts: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], top: 1 }]
          : [{ n: [0, d / 2, r], pts: [[x0, y1, z1], [x1, y1, z1], [x1, yr, zc], [x0, yr, zc]], top: 1 }, { n: [0, d / 2, -r], pts: [[x1, y1, z0], [x0, y1, z0], [x0, yr, zc], [x1, yr, zc]], top: 1 }])
      ];
      faces.forEach(f => {
        const nl = Math.hypot(f.n[0], f.n[1], f.n[2]) || 1, n = f.n.map(v => v / nl);
        if (dot(n, V) <= .001) return;
        const b = Math.max(0, dot(n, L) / Math.hypot(L[0], L[1], L[2]));
        poly(f.pts);
        if (kind === 'glass') {
          ctx.fillStyle = 'rgb(10,10,10)'; ctx.fill();
          ctx.fillStyle = `rgba(202,202,202,${(.05 + .07 * b).toFixed(3)})`; ctx.fill();
          if (lit > 0 && f.wall) { ctx.fillStyle = `rgba(${SA.join(',')},${(.9 * lit).toFixed(3)})`; ctx.fill(); }
        } else {
          const c = kind === 'slab' ? (f.top ? mixc([30, 30, 29], AN, .6) : mixc(AN, KA, .35)) : f.top ? mixc([30, 30, 29], AN, .5) : mixc([18, 18, 17], AN, .25 + .75 * b);
          ctx.fillStyle = `rgb(${c.join(',')})`; ctx.fill();
        }
        if (f.wall) {
          const glass = kind === 'glass', step = glass ? 2.4 : .5, len = f.wall === 'x' ? w : d;
          if (len > step * 1.5 && hh > .3) {
            ctx.lineWidth = glass ? 1 : .6;
            ctx.strokeStyle = glass ? `rgba(255,255,255,${(.32 * (1 - .6 * lit)).toFixed(3)})` : 'rgba(255,255,255,.09)';
            ctx.beginPath();
            const nn = Math.floor(len / step);
            for (let m = 1; m < nn; m++) {
              const u = m / nn, a = f.wall === 'x' ? [x0 + w * u, y0, f.z] : [f.x, y0, z0 + d * u], c2 = f.wall === 'x' ? [x0 + w * u, y1, f.z] : [f.x, y1, z0 + d * u];
              const pa = P(a[0], a[1], a[2]), pb = P(c2[0], c2[1], c2[2]); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]);
            }
            ctx.stroke();
          }
        }
        if (f.wall && kind === 'solid' && Math.min(w, d) > 1.5 && hh > 2.4) {
          const len = f.wall === 'x' ? w : d, floors = Math.max(1, Math.round(hh / 3)), fh = hh / floors, panes = Math.max(1, Math.round(len * .8 / 3.2)), pw = len * .8 / panes;
          const at = (u, yy) => (f.wall === 'x' ? [x0 + w * u, yy, f.z] : [f.x, yy, z0 + d * u]);
          for (let fl = 0; fl < floors; fl++) {
            const ya = y0 + fl * fh + fh * .3, yb = y0 + fl * fh + fh * .82;
            for (let pn = 0; pn < panes; pn++) {
              const u0 = .1 + (pn * pw + pw * .12) / len, u1 = .1 + ((pn + 1) * pw - pw * .12) / len;
              poly([at(u0, ya), at(u1, ya), at(u1, yb), at(u0, yb)]);
              ctx.fillStyle = 'rgb(8,8,8)'; ctx.fill();
              if (lit > 0) { ctx.fillStyle = `rgba(${SA.join(',')},${(.9 * lit).toFixed(3)})`; ctx.fill(); }
              ctx.lineWidth = .8; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
            }
          }
        }
        poly(f.pts); ctx.lineWidth = 1; ctx.strokeStyle = kind === 'glass' ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.55)'; ctx.stroke();
      });
    });
    ctx.restore();
  };

  const apply = () => {
    if (!geo) return;
    const fp = scene(sec);
    const S = N + 1, x = Math.min(S - 1e-6, Math.max(0, fp * S)), i = Math.floor(x), t = x - i;
    ws.forEach((w, j) => {
      const a = j === i ? E(t, .04, .22) : j === i - 1 ? 1 - E(t, 0, .12) : 0, y = j === i ? (1 - a) * 100 : -(1 - a) * 60;
      w.style.opacity = a.toFixed(3); w.style.transform = `translateY(${y.toFixed(2)}%)`;
    });
    const end = i >= N;
    count.textContent = '0' + Math.min(N, i + 1) + ' / 06';
    count.style.opacity = (end ? 1 - E(t, 0, .15) : 1).toFixed(3);
    const ea = end ? E(t, .05, .25) : 0;
    endA.style.opacity = ea.toFixed(3); endA.style.transform = `translateY(${((1 - ea) * 24).toFixed(1)}px)`;
    const from = end ? CFG[N - 1] : i === 0 ? FLAT : CFG[i - 1], to = end ? CFG[N - 1] : CFG[i];
    const boxes = to.map((b, k) => { const e = E(t, .02 + k * .035, .42 + k * .035); return b.map((v, n) => from[k][n] + (v - from[k][n]) * e); });
    const fa = end ? FIT[N - 1] : FIT[Math.max(0, i - 1)], fb = end ? FITEND : FIT[i], fe = i === 0 ? 1 : end ? E(t, 0, .25) : E(t, .02, .5);
    Object.assign(geo, { s: fa.s + (fb.s - fa.s) * fe, cx: fa.cx + (fb.cx - fa.cx) * fe, gy: fa.gy + (fb.gy - fa.gy) * fe });
    draw(boxes, end ? E(t, .25, .55) : 0, fp);
  };
  const resize = () => { size(); apply(); };
  resize();
  new ResizeObserver(resize).observe(el);
  if (document.fonts) document.fonts.ready.then(resize);
  loop.add({ tick() { if (near(sec, 1.4)) apply(); } });
}

/* ---------- Seitwärts-Galerie: die Strecke ist so lang wie der Überstand plus 1,2 Bildschirmhöhen, die Spur folgt dem Scrollen ---------- */
function hzGallery(pin, onTick) {
  const track = $('[data-hz-track]', pin), bar = $('[data-hz-bar]', pin);
  const over = () => Math.max(0, track.offsetWidth - innerWidth);
  const fit = () => { pin.style.height = reduce ? '' : Math.round(over() + vhs() * 1.2) + 'px'; };
  new ResizeObserver(fit).observe(track); addEventListener('resize', fit); fit();
  return () => {
    const r = pin.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - vhs()));
    if (!reduce) track.style.transform = `translate3d(${(-over() * p).toFixed(1)}px,0,0)`;
    if (bar) bar.style.transform = `scaleX(${clamp((p - .02) / .92).toFixed(4)})`;
    if (onTick) onTick(p);
  };
}

/* ---------- 04 Floating House: Schwarz zu Weiß (beginnt, wenn die Oberkante bei 55 % steht, dauert gut eine Fensterhöhe),
   die Galerie läuft seitwärts, die Bilder gleiten leicht im Rahmen, das Feld sitzt am Bild nahe der Mitte (55 %) ---------- */
function initFh() {
  const sec = $('#p-fh'), pin = $('[data-hz="fh"]', sec); if (!sec || !pin) return;
  const frames = $$('[data-fh-frame]', pin), imgs = frames.map(f => $('img', f));
  let cur = null, bgOld = '';
  const gal = hzGallery(pin);
  loop.add({ tick() {
    if (!near(sec)) return;
    const vh = vhs(), top = sec.getBoundingClientRect().top, t = clamp((.55 * vh - top) / (1.05 * vh));
    const bg = css(mix([0, 0, 0], [255, 255, 255], t));
    if (bg !== bgOld) { bgOld = bg; sec.style.background = bg; sec.dataset.inkBg = bg; }
    gal();
    const vw = innerWidth;
    let best = null, d = Infinity;
    frames.forEach((f, i) => {
      const r = f.getBoundingClientRect(), c = r.left + r.width / 2;
      if (Math.abs(c - vw * .55) < d) { d = Math.abs(c - vw * .55); best = f; }
      if (!reduce && r.right > -200 && r.left < vw + 200) imgs[i].style.transform = `translate3d(${(-(c - vw / 2) * .06).toFixed(1)}px,0,0)`;
    });
    if (best !== cur) {
      if (cur) { delete cur.dataset.dock; delete cur.dataset.dockX; delete cur.dataset.dockTrigger; }
      cur = best;
      if (cur) Object.assign(cur.dataset, { dock: 'edge', dockX: '.72', dockTrigger: 'p-fh-pin' });
    }
  } });
}

/* ---------- 05 GRIFFNER Living: großes Projekt mit leichtem Gleiten, dann der Index. Breit (ab 1200 px): die Zeile in der Bildmitte
   (oder unter der Maus) ist aktiv, die anderen treten zurück, links klebt ihr Bild. Schmal: Bild in jeder Zeile, alle voll sichtbar. ---------- */
function initLiving() {
  const sec = $('#p-homes'); if (!sec) return;
  const par = $('[data-par]', sec), box = $('[data-idx-box]', sec), rows = $$('.idx__row', sec), items = $$('.idx__it', box);
  let act = -1, hover = false;
  const wide = () => innerWidth >= 1200;
  const set = i => {
    if (i === act) return; act = i;
    items.forEach((it, j) => it.classList.toggle('is-on', j === Math.max(0, i)));
    rows.forEach((r, j) => r.classList.toggle('is-dim', wide() && i >= 0 && j !== i));
  };
  const track = () => {
    if (hover) return;
    const mid = vhs() * .5; let best = 0, d = Infinity;
    rows.forEach((r, i) => { const b = r.getBoundingClientRect(), x = Math.abs(b.top + b.height / 2 - mid); if (x < d) { d = x; best = i; } });
    set(best);
  };
  rows.forEach((r, i) => {
    const on = () => { if (!wide()) return; hover = true; set(i); };
    r.addEventListener('mouseenter', on); r.addEventListener('focus', on);
  });
  $('[data-idx-rows]', sec).addEventListener('mouseleave', () => { hover = false; track(); });
  /* Bildspalte: klebt mittig im Fenster, so hoch wie ein Bild; schmal ohne Feld */
  const fit = () => {
    const h = box.offsetHeight;
    box.style.top = `max(112px, calc(50vh - ${Math.round(h / 2)}px))`;
    if (wide()) Object.assign(box.dataset, { dock: 'edge', dockX: '.72', dockTrigger: 'idx-box' });
    else { delete box.dataset.dock; }
    act = -2; track();
  };
  addEventListener('resize', fit); fit();
  loop.add({ tick() {
    if (!near(sec)) return;
    track();
    if (par && !reduce) { const r = par.parentElement.parentElement.getBoundingClientRect(), vh = vhs(); par.style.transform = `translate3d(0,${(-((r.top + r.height / 2 - vh / 2) / vh) * 5).toFixed(2)}%,0)`; }
  } });
}

/* ---------- 06 Referenzen: Projektband, ein Bauteil für beliebig viele Projekte mit beliebig vielen Bildern (Häuser und Building gemischt).
   Breit (ab 1024 px): alle Projekte als Bildstreifen, gepinnt. Das Band darf breiter als der Bildschirm sein und gleitet so mit, dass der
   offene Streifen möglichst mittig steht. Der Scroll öffnet eines nach dem anderen (RB_STEP Bildschirmhöhen je Projekt), Klick auf einen
   Streifen springt hin. Im offenen Streifen wechseln die Bilder (Pfeile, Wischen, Pfeiltasten; das neue wischt von der Seite herein).
   Unten links ein kleines Etikett in der Farbe der Sektion (wie aus dem Bild geschnitten): Art, Name, Zähler, Pfeile; „+“ klappt Text und
   Daten nach oben auf. Das gelbe Feld sitzt unten am offenen Streifen. Schmal: Liste zum Antippen, Text immer offen.
   Bilder außer dem ersten laden erst, wenn ihr Projekt aufgeht. ---------- */
function bandHTML(key, list) {
  const img = (m, k) => {
    const pos = m.pos ? ` style="object-position:${m.pos}"` : '', d = k ? 'data-' : '', cls = `rb__img${k ? '' : ' is-on'}`, lz = k ? '' : 'loading="lazy" ';
    if (m.s) { const a = RB_DIR + m.s; return `<img class="${cls}" ${d}src="${a}-m.webp" ${d}srcset="${a}-m.webp 960w, ${a}-l.webp 1920w" sizes="(min-width:1024px) 64vw, 100vw" alt="${esc(m.alt)}" draggable="false" ${lz}decoding="async"${pos}>`; }
    return `<img class="${cls}" ${d}src="${m.src}" alt="${esc(m.alt)}" draggable="false" ${lz}decoding="async"${pos}>`;
  };
  const card = (p, id) => {
    const n = p.img.length;
    const facts = p.facts ? `<dl class="rb__facts">${p.facts.map(([a, b]) => `<div><dt class="info">${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : '';
    const link = p.link ? `<a class="rb__go" href="${esc(p.link.href)}" target="_blank" rel="noopener">${esc(p.link.label)} <span aria-hidden="true">↗</span></a>` : '';
    const more = p.text || facts || link;
    const det = more ? `<button class="rb__btn rb__det" type="button" aria-expanded="false" aria-controls="${id}-more" aria-label="Mehr zum Projekt"><i aria-hidden="true"></i></button>` : '';
    const arr = n > 1 ? `<button class="rb__btn rb__arr" type="button" data-d="-1" aria-label="Vorheriges Bild">←</button><button class="rb__btn rb__arr" type="button" data-d="1" aria-label="Nächstes Bild">→</button>` : '';
    return `<div class="rb__card">`
      + (more ? `<div class="rb__more" id="${id}-more"><div class="rb__more-in"><div class="rb__more-c">${p.text ? `<p class="txt">${esc(p.text)}</p>` : ''}${facts}${link}</div></div></div>` : '')
      + `<div class="rb__head"><p class="info rb__art">${esc(p.info)}</p><h3 class="rb__name">${esc(p.name)}</h3>`
      + (n > 1 ? `<span class="rb__cnt info" aria-live="polite">01 / ${pad2(n)}</span>` : '')
      + (det || arr ? `<div class="rb__ctl">${det}${arr}</div>` : '') + `</div></div>`;
  };
  const item = (p, i) => {
    const id = `rb-${key}-${i}`, f = p.img[0], th = f.s ? `${RB_DIR}${f.s}-m.webp` : f.src;
    return `<article class="rb__p" role="listitem" data-n="${p.img.length}" style="--k:${i}">`
      + `<button class="rb__tab" type="button" aria-expanded="false" aria-controls="${id}"><span class="rb__no info">${pad2(i + 1)}</span><span class="rb__tn">${esc(p.name)}</span>`
      + `<span class="rb__th" aria-hidden="true"><img src="${th}" alt="" loading="lazy" decoding="async"></span><span class="rb__plus" aria-hidden="true"></span></button>`
      + `<div class="rb__body" id="${id}"><div class="rb__in"><div class="rb__media">${p.img.map(img).join('')}</div>${card(p, id)}</div></div></article>`;
  };
  return `<div class="rb__pin" id="rb-${key}-pin"><div class="rb__st"><div class="rb__vp"><div class="rb__band" role="list">${list.map(item).join('')}</div></div></div></div>`;
}
function initBand(el, list, key) {
  if (!el || !list || !list.length) return;
  el.innerHTML = bandHTML(key, list);
  const pin = $('.rb__pin', el), vp = $('.rb__vp', el), band = $('.rb__band', el), N = list.length, EASE = 'cubic-bezier(.22,1,.36,1)';
  const G = $$('.rb__p', el).map(p => ({ p, tab: $('.rb__tab', p), card: $('.rb__card', p), det: $('.rb__det', p), media: $('.rb__media', p), imgs: $$('.rb__img', p), cnt: $('.rb__cnt', p), cur: 0, loaded: false }));
  let act = -1, mode = '', lock = 0, geo = null;
  const load = g => { if (g.loaded) return; g.loaded = true; g.imgs.forEach(im => { if (im.dataset.srcset) im.srcset = im.dataset.srcset; if (im.dataset.src) im.src = im.dataset.src; }); };
  const show = (g, k, dir) => {
    const n = g.imgs.length; k = (k + n) % n; if (n < 2 || k === g.cur) return;
    load(g);
    const a = g.imgs[g.cur], b = g.imgs[k];
    g.imgs.forEach(im => { if (im !== a) im.classList.remove('is-was'); });
    a.classList.remove('is-on'); a.classList.add('is-was'); b.classList.add('is-on');
    if (!reduce) {
      b.animate([{ clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 950, easing: EASE });
      a.animate([{ translate: '0 0' }, { translate: `${dir > 0 ? -14 : 14}% 0` }], { duration: 950, easing: EASE }).finished
        .then(() => { if (!a.classList.contains('is-on')) a.classList.remove('is-was'); }, () => {});
    } else a.classList.remove('is-was');
    g.cur = k;
    if (g.cnt) g.cnt.textContent = `${pad2(k + 1)} / ${pad2(n)}`;
  };
  const details = (g, on) => { g.card.classList.toggle('is-det', on); if (g.det) g.det.setAttribute('aria-expanded', String(on)); };
  /* Band gleitet: der offene Streifen steht möglichst mittig, an den Enden bündig */
  const slide = () => {
    if (mode !== 'band' || !geo) { band.style.transform = ''; return; }
    const { W, cw, pw, gap } = geo, total = (N - 1) * (cw + gap) + pw, i = Math.max(0, act);
    const off = clamp(i * (cw + gap) - (W - pw) / 2, 0, Math.max(0, total - W));
    band.style.transform = `translate3d(${(-off).toFixed(1)}px,0,0)`;
  };
  const open = i => {
    if (i === act) return; act = i;
    G.forEach((g, j) => {
      const on = j === i;
      g.p.classList.toggle('is-open', on); g.tab.setAttribute('aria-expanded', String(on)); g.card.inert = !on;
      if (on) load(g); else details(g, false);
      if (on && mode === 'band') Object.assign(g.p.dataset, { dock: 'edge', dockX: '.88', dockW: '.1', dockTrigger: pin.id });
      else { delete g.p.dataset.dock; delete g.p.dataset.dockX; delete g.p.dataset.dockW; delete g.p.dataset.dockTrigger; }
    });
    if (G[i + 1]) G[i + 1].imgs[0].loading = 'eager';
    slide(); loop.poke();
  };
  const fit = () => {
    const m = innerWidth >= 1024 ? 'band' : 'list';
    if (m !== mode) { mode = m; el.dataset.mode = m; const a = act; act = -1; open(a < 0 ? 0 : a); }
    if (mode === 'band') {
      const W = vp.clientWidth, gap = 6, cw = Math.round(clamp(W * .045, 48, 72));
      let pw = Math.round(clamp(W * .64, 520, 1240));
      if ((N - 1) * (cw + gap) + pw < W) pw = W - (N - 1) * (cw + gap);
      geo = { W, cw, pw, gap };
      band.style.setProperty('--cw', cw + 'px'); band.style.setProperty('--pw', pw + 'px'); band.style.setProperty('--gap', gap + 'px');
      pin.style.height = reduce ? '' : Math.round(vhs() * (1 + RB_STEP * N)) + 'px';
    } else { geo = null; pin.style.height = ''; }
    slide(); loop.poke();
  };
  G.forEach((g, i) => {
    g.tab.addEventListener('click', () => {
      if (mode === 'list') {
        const was = act === i; open(was ? -1 : i);
        if (!was && !reduce) setTimeout(() => { const t = g.p.getBoundingClientRect().top; if (t < 72) scrollBy({ top: t - 88, behavior: 'smooth' }); }, 720);
        return;
      }
      open(i);
      if (reduce) return;
      const r = pin.getBoundingClientRect(), span = r.height - vhs();
      lock = performance.now() + 1600;
      scrollTo({ top: Math.round(scrollY + r.top + span * (i + .5) / N), behavior: 'smooth' });
    });
    if (g.det) g.det.addEventListener('click', () => details(g, !g.card.classList.contains('is-det')));
    g.p.querySelectorAll('.rb__arr').forEach(b => b.addEventListener('click', () => { const d = +b.dataset.d; show(g, g.cur + d, d); }));
    let x0 = null, y0 = 0;
    g.media.addEventListener('pointerdown', e => { if (act === i && g.imgs.length > 1) { x0 = e.clientX; y0 = e.clientY; } });
    g.media.addEventListener('pointerup', e => {
      if (x0 == null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) show(g, g.cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
    g.media.addEventListener('pointercancel', () => { x0 = null; });
    g.p.addEventListener('keydown', e => {
      if (act !== i || !g.p.contains(document.activeElement)) return;
      if (e.key === 'Escape') { details(g, false); return; }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); const d = e.key === 'ArrowRight' ? 1 : -1; show(g, g.cur + d, d);
    });
  });
  addEventListener('scrollend', () => { lock = 0; });
  new ResizeObserver(fit).observe(el); addEventListener('resize', fit); fit();
  loop.add({ tick() {
    if (mode !== 'band' || reduce || performance.now() < lock || !near(el)) return;
    const r = pin.getBoundingClientRect(), span = r.height - vhs(); if (span <= 0) return;
    open(Math.min(N - 1, Math.floor(clamp(-r.top / span) * N)));
  } });
  if (reduce) el.classList.add('is-in');
  else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }), { rootMargin: '0px 0px -12% 0px' }); io.observe(el); }
}

/* ---------- 07 Bauherren: „Sie hätten mit jedem bauen können.“ wechselt zu „Sie haben sich für GRIFFNER entschieden.“,
   dann laufen die Namen wie ein Abspann nach oben; nah an der Mitte voll sichtbar, am Rand ausgeblendet ---------- */
function initNamen() {
  const satz = $('[data-pn-satz]'), A = $('[data-pn-a]'), B = $('[data-pn-b]'), pin = $('[data-pn-pin]'), list = $('[data-pn-list]');
  if (!satz || !pin || !list) return;
  const items = [...list.children], last = items[items.length - 1];
  const geo = () => { const H = vhs(), y0 = H * .92, y1 = H / 2 - (last.offsetTop + last.offsetHeight / 2); return { H, y0, y1, travel: Math.max(1, y0 - y1) }; };
  const fit = () => { const g = geo(); pin.style.height = Math.round(g.travel * 1.1 + g.H) + 'px'; };
  new ResizeObserver(fit).observe(list); addEventListener('resize', fit); fit();
  loop.add({ tick() {
    if (near(satz)) {
      const p = reduce ? 1 : scene(satz), a = E(p, .3, .5), b = E(p, .45, .68);
      A.style.opacity = (1 - a).toFixed(3); A.style.transform = `translateY(${(-a * 32).toFixed(1)}px)`;
      B.style.opacity = b.toFixed(3); B.style.transform = `translateY(${((1 - b) * 32).toFixed(1)}px)`;
    }
    if (!near(pin)) return;
    const g = geo(), r = pin.getBoundingClientRect(), p = reduce ? 1 : clamp(-r.top / Math.max(1, r.height - g.H) * 1.1);
    const ty = lerp(g.y0, g.y1, Math.min(1, p));
    list.style.transform = `translate3d(0,${ty.toFixed(1)}px,0)`;
    items.forEach(it => { const c = ty + it.offsetTop + it.offsetHeight / 2, d = Math.abs(c - g.H / 2) / (g.H / 2); it.style.opacity = clamp(1.25 - d * 1.1).toFixed(3); });
  } });
}

/* ---------- 08 Kontakt: prüft die Pflichtfelder und bestätigt. Vorschau: es wird nichts gesendet. ---------- */
function initKontakt() {
  const form = $('[data-pk-form]'); if (!form) return;
  const msg = $('[data-pk-msg]', form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    let bad = null;
    $$('[required]', form).forEach(inp => {
      const ok = inp.type === 'checkbox' ? inp.checked : inp.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()) : !!inp.value.trim();
      inp.closest('label').classList.toggle('is-bad', !ok);
      if (!ok && !bad) bad = inp;
    });
    if (bad) { msg.textContent = 'Bitte fülle die markierten Felder aus.'; bad.focus(); return; }
    msg.textContent = 'Danke. In dieser Vorschau wird nichts gesendet.';
  });
  form.addEventListener('input', e => { const l = e.target.closest('label'); if (l) l.classList.remove('is-bad'); });
}

/* ---------- 09 Finale: das Feld dockt in der Bildmitte an, dann wird es zur gelben Fläche (bis .28), „built different“ stanzt sich aus
   (.32 bis .46), Zoom durchs f bis kurz vor dem Footer (.56 bis 1.01) ---------- */
function initFinale() {
  const sec = $('#finale'), stage = $('[data-pfi]'); if (!sec || !stage) return;
  const fieldEl = $('[data-pfi-field]', stage), svg = $('[data-pfi-svg]', stage), g = $('[data-pfi-g]', stage), path = $('[data-pfi-path]', stage);
  path.setAttribute('d', CLAIM_PATH);
  const CL = { VW: 6053, VH: 977, FX: .5225, FY: .303, R: .009 };
  const share = W => (W < 600 ? .5 : W < 1000 ? .36 : .26);
  const fieldRect = (W, H) => { const w = Math.min(W * share(W), H * .4), h = w * .8; return { t: (H - h) / 2, l: (W - w) / 2, w, h }; };
  const claimT = (W, H, e) => {
    const W0 = Math.min(W * .84, 1200), H0 = W0 * CL.VH / CL.VW, px = (W - W0) / 2 + CL.FX * W0, py = (H - H0) / 2 + CL.FY * H0;
    const far = Math.max(Math.hypot(px, py), Math.hypot(W - px, py), Math.hypot(px, H - py), Math.hypot(W - px, H - py));
    const k = W0 * Math.exp(Math.log(far / (CL.R * W0) * 1.2) * e) / CL.VW;
    return `translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${k.toFixed(5)}) translate(${(-CL.FX * CL.VW).toFixed(1)} ${(-CL.FY * CL.VH).toFixed(1)})`;
  };
  const place = () => { const f = fieldRect(stage.clientWidth, stage.clientHeight); Object.assign(fieldEl.style, { left: f.l + 'px', top: f.t + 'px', width: f.w + 'px', height: f.h + 'px' }); };
  addEventListener('resize', place); place();
  loop.add({ tick() {
    if (!near(sec)) return;
    const W = stage.clientWidth, H = stage.clientHeight, q = scene(sec), f = fieldRect(W, H), k = pow.p3InOut(Math.min(1, q / .28));
    svg.style.clipPath = `inset(${(f.t * (1 - k)).toFixed(1)}px ${((W - f.l - f.w) * (1 - k)).toFixed(1)}px ${((H - f.t - f.h) * (1 - k)).toFixed(1)}px ${(f.l * (1 - k)).toFixed(1)}px)`;
    path.setAttribute('fill-opacity', sm(.32, .46, q).toFixed(3));
    g.setAttribute('transform', claimT(W, H, pow.p2In(sm(.56, 1.01, q))));
    /* bis zum Andocken trägt der Connector das Gelb, danach die Fläche */
    const carry = q > .015;
    svg.style.visibility = carry && q < .995 ? 'visible' : 'hidden';
    if (carry) fieldEl.dataset.dockHide = '1'; else delete fieldEl.dataset.dockHide;
  } });
}

/* ---------- Bildrahmen decken sich von unten auf ---------- */
function initLux() {
  const els = $$('.p-lux'); if (!els.length) return;
  if (reduce) { els.forEach(e => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  els.forEach(e => io.observe(e));
}
