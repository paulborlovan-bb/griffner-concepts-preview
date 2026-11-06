/* Gemeinsame Helfer. Gleiche Kurven und Rechenwege wie site/griffner-web.js aus dem Handoff, als Modul. */
const bez = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) { const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= (sx(t) - x) / d; }
    return sy(Math.min(1, Math.max(0, t)));
  };
};
const rootStyle = () => getComputedStyle(document.documentElement);
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = bez(.22, 1, .36, 1);
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const seg = (p, a, b) => clamp((p - a) / (b - a));
export const E = (p, a, b) => ease(seg(p, a, b));
export const win = (p, a, b, f = .025) => Math.min(E(p, a, a + f), 1 - E(p, b - f, b));
export const lerp = (a, b, t) => a + (b - a) * t;
export const token = n => rootStyle().getPropertyValue(n).trim();
export const ms = n => { const v = token(n); return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000 || 0; };
export const hex = h => { h = h.trim(); if (h.startsWith('rgb')) return h.match(/[\d.]+/g).slice(0, 3).map(Number); const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
export const mix = (a, b, t) => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t);
export const css = c => `rgb(${c.map(v => Math.round(v)).join(',')})`;
export const ink = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; const L = .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); return (1.05 / (L + .05)) > ((L + .05) / .05) ? '#FFFFFF' : '#000000'; };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const h = (tag, attrs = {}, html = '') => { const el = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => v != null && el.setAttribute(k, v)); if (html) el.innerHTML = html; return el; };

/* Fortschritt eines gepinnten Abschnitts: 0 wenn die Oberkante oben ankommt, 1 wenn die Unterkante unten ankommt */
/* Runde 29 (Kundenwunsch: am Telefon läuft nicht alles sauber, Chrome und Safari): eine Bildschirmhöhe, die beim Scrollen gleich bleibt.
   innerHeight wächst am Telefon, sobald die Leiste des Browsers wegfährt, die Bühnen sind aber 100svh hoch. Dann sprang der
   Fortschritt mitten im Scrollen. Die Höhe des Dokumentfensters ist die kleine Höhe (wie svh) und ändert sich dabei nicht. */
export const vhs = () => document.documentElement.clientHeight || innerHeight;
/* h: Höhe der gepinnten Bühne, wenn sie nicht 100svh ist */
export function prog(el, h) {
  const r = el.getBoundingClientRect(), vh = vhs();
  return { p: reduce ? 1 : clamp(-r.top / Math.max(1, r.height - (h || vh))), on: r.bottom > -vh * .2 && r.top < vh * 1.2, r };
}
/* Wie weit ein Element durch den Viewport gewandert ist: 0 Oberkante bei 100 %, 1 Oberkante bei 0 % */
export function through(el, a = 1, b = 0) {
  const r = el.getBoundingClientRect(), vh = vhs();
  return clamp((vh * a - r.top) / (vh * (a - b)));
}

/* Zustand der Reise. Wird lokal gemerkt, damit die Seite beim Neuladen weiß, was du schon gewählt hast. */
const KEY = 'griffner-konzepte-v1';
const listeners = new Set();
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { state = {}; }
export const store = {
  get: () => state,
  set(patch) {
    state = { ...state, ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* privat oder gesperrt, dann eben nur im Speicher */ }
    listeners.forEach(fn => fn(state, patch));
  },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};

/* Einblenden beim Scrollen, wie GW.reveal, aber ohne GSAP */
export function reveal(scope = document) {
  const els = $$('[data-reveal]:not([data-rv])', scope);
  if (reduce) { els.forEach(el => { el.dataset.rv = '1'; el.classList.add('is-in'); }); return; }
  const io = reveal.io || (reveal.io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.style.transitionDelay = (parseFloat(el.dataset.reveal) || 0) + 'ms';
    el.classList.add('is-in'); reveal.io.unobserve(el);
  }), { rootMargin: '0px 0px -14% 0px' }));
  els.forEach(el => { el.dataset.rv = '1'; io.observe(el); });
}

/* Ein Takt für alle Module. Module melden sich mit tick() an, der Takt läuft nur, wenn sich etwas bewegt. */
const mods = [];
let dirty = true;
export const loop = {
  add(m) { mods.push(m); dirty = true; },
  poke() { dirty = true; },
  start(always) {
    const run = () => {
      always && always();
      if (dirty) { dirty = false; mods.forEach(m => { try { m.tick(); } catch (e) { console.error(e); } }); }
      requestAnimationFrame(run);
    };
    addEventListener('scroll', () => { dirty = true; }, { passive: true });
    addEventListener('resize', () => { dirty = true; });
    requestAnimationFrame(run);
  }
};
