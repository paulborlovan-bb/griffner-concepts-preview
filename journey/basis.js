/* GRIFFNER Journey, Runde 10: kleine Werkzeuge für alle Sektionen der Seite (Einstieg, Szene, Stapel, Leben).
   framer-bau.mjs legt diese Datei in jede Komponente. */
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const E = (x, a, b) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const nr2 = i => String(i).padStart(2, '0');
/* Stichworte: Text mit „ · “ (oder Zeilenumbruch) getrennt, oder schon eine Liste */
export const stichworte = k => (Array.isArray(k) ? k : String(k ?? '').split(/\s*[·•\n]\s*/)).map(s => String(s).trim()).filter(Boolean);
/* Wörter, die beim Erscheinen von unten in ihre Zeile steigen (wie die Titel im Services Film) */
export const words = s => esc(s).split(/\s+/).filter(Boolean).map((w, i) => `<span class="jw"><span style="--i:${i}">${w}</span></span>`).join(' ');
/* Schwarzer Bildschirm, der eine Phase ansagt: Feld (dort dockt das gelbe Feld der Website an), Zeile, Titel, optional ein Satz */
export const phaseHTML = (p, cls = '') => `<div class="jph ${cls}"><div class="jph__b"><i class="jf jph__f" aria-hidden="true"></i>${p.info ? `<p class="info jph__i">${esc(p.info)}</p>` : ''}<h2 class="jph__h">${words(p.h)}</h2>${p.lead ? `<p class="lead jph__l">${esc(p.lead)}</p>` : ''}</div></div>`;
/* Ein Stichwort als kleines Feld mit gelber Marke */
export const chip = (s, cls = '', st = '') => `<span class="jk ${cls}"${st ? ` style="${st}"` : ''}><span class="jk__f"><span class="jk__i"><i aria-hidden="true"></i>${esc(s)}</span></span></span>`;
/* Lage eines Elements im Fenster: 0 = Oberkante unten am Fenster, 1 = Unterkante oben am Fenster */
export const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
/* Bilder von Framer in passender Größe */
export const srcset = (u, ws = [512, 1024, 2048]) => /framerusercontent\.com\/images\//.test(u) ? ws.map(w => `${u}?scale-down-to=${w} ${w}w`).join(', ') : '';

/* ---------- Schritt für Schritt (Runde 11, 2026-11-23) ----------
   Kundenwunsch: „tight the scroll so you can't stop between steps and you can't jump steps“.
   Jede Sektion meldet ihre Halte (Seiten-Y, aufsteigend) als Zone an: die Szene (Phasen und Tage) mit dem Stapel, Besser leben (Phase und Kapitel).
   Innerhalb einer Zone (und zwischen zwei Zonen, die weniger als 1,6 Bildschirmhöhen auseinander liegen) führt jede Geste genau einen Halt weiter:
   Mausrad und Trackpad (ein Halt je Geste, der Nachlauf wird geschluckt), Wischen am Telefon, Pfeiltasten, Bild auf/ab, Leertaste.
   Hinter dem letzten und vor dem ersten Halt scrollt die Seite wieder frei. Wer von außen hineinscrollt (auch mit Schwung), landet am ersten
   bzw. letzten Halt. Bleibt die Seite zwischen zwei Halten stehen (Scrollbalken, Sprung), gleitet sie zum nächsten.
   Alle Komponenten teilen sich ein Steuerwerk (window.__jgSchritte); auf der Website gleitet es mit Lenis (store.lenis), sonst selbst. */
const EASE_IO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function steuerwerk() {
  const G = { zones: new Set(), n: 0, anim: null, animEnd: 0, lastT: 0, lastAbs: 0, acc: 0, used: false, touch: null, pending: null, prevY: 0, settle: 0 };
  const lenis = () => { for (const z of G.zones) { const l = z.lenis && z.lenis(); if (l) return l; } return null; };
  /* geführte Strecken: Halte aller Zonen, zusammenhängend */
  const segs = () => {
    const L = [];
    G.zones.forEach(z => { (z.stops() || []).forEach(y => { if (isFinite(y)) L.push({ y: Math.round(y), z }); }); });
    L.sort((a, b) => a.y - b.y);
    const S = []; let cur = null;
    L.forEach(p => { const last = cur && cur[cur.length - 1]; if (last && (p.z === last.z || p.y - last.y < innerHeight * 1.6)) { if (p.y - last.y > 1) cur.push(p); } else { cur = [p]; S.push(cur); } });
    return S.map(s => s.map(p => p.y));
  };
  const inSeg = y => segs().find(s => y >= s[0] - 2 && y <= s[s.length - 1] + 2) || null;
  /* wohin führt eine Geste in Richtung d? {y} ein Halt, {release} frei weiter, null: nicht unsere Sache */
  const target = (y, d, pred) => {
    const s = inSeg(y);
    if (s) {
      let t = null;
      if (d > 0) t = s.find(v => v > y + 2); else for (const v of s) if (v < y - 2) t = v;
      return t == null ? { release: true } : { y: t };
    }
    for (const s2 of segs()) {
      if (d > 0 && y < s2[0] - 2 && pred > s2[0] - 2) return { y: s2[0] };
      if (d < 0 && y > s2[s2.length - 1] + 2 && pred < s2[s2.length - 1] + 2) return { y: s2[s2.length - 1] };
    }
    return null;
  };
  const go = (to, max = 1900) => {
    const from = scrollY, dist = Math.abs(to - from);
    if (dist < 1) return;
    const ms = clamp(480 + dist / innerHeight * 600, 650, max), L = lenis(), a = { to };
    G.anim = a; G.used = true;
    const done = () => { if (G.anim !== a) return; G.anim = null; G.animEnd = performance.now(); G.prevY = scrollY; };
    if (L) { L.scrollTo(to, { duration: ms / 1000, easing: EASE_IO, lock: true, force: true, onComplete: done }); setTimeout(done, ms + 500); }
    else {
      const t0 = performance.now();
      const tick = now => { if (G.anim !== a) return; const k = clamp((now - t0) / ms); scrollTo({ top: from + (to - from) * EASE_IO(k), behavior: 'instant' }); if (k < 1) requestAnimationFrame(tick); else done(); };
      requestAnimationFrame(tick);
    }
  };
  /* Schwung (Telefon, Lenis) stoppen, bevor wir selbst gleiten */
  const kill = () => {
    const L = lenis(); if (L && L.isScrolling) L.scrollTo(scrollY, { immediate: true, force: true });
    const h = document.documentElement, o = h.style.overflow; h.style.overflow = 'hidden'; scrollTo({ top: scrollY, behavior: 'instant' });
    requestAnimationFrame(() => { h.style.overflow = o; });
  };
  const eat = e => { if (e.cancelable) e.preventDefault(); e.stopPropagation(); };
  const skip = el => !!(el && el.closest && el.closest('[class*="framer-cookie-banner-container"], [data-lenis-prevent], input, textarea, select'));
  const onWheel = e => {
    if (e.ctrlKey || !G.zones.size || skip(e.target)) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    if (!dy || Math.abs(dy) < Math.abs(e.deltaX)) return;
    const now = performance.now(), gap = now - G.lastT, abs = Math.abs(dy);
    /* neue Geste: Pause über 180 ms, oder nach dem Gleiten ein deutlich kräftigerer Stoß als der Nachlauf */
    const fresh = gap > 180 || (abs > Math.max(24, G.lastAbs * 2.2) && now - G.animEnd > 150);
    G.lastT = now; G.lastAbs = abs;
    if (fresh) { G.used = false; G.acc = 0; }
    if (G.anim) { eat(e); return; }
    const y = scrollY, L = lenis(), t = target(y, Math.sign(dy), (L ? L.targetScroll : y) + dy);
    if (!t) return;
    if (t.release) { if (G.used) eat(e); return; }
    eat(e);
    if (G.used) return;
    G.acc += dy; if (Math.abs(G.acc) < 6) return;
    go(t.y);
  };
  const onTS = e => { G.touch = e.touches.length === 1 ? { y0: e.touches[0].clientY, x0: e.touches[0].clientX, mode: null, t: null, fired: false } : null; };
  const onTM = e => {
    const T = G.touch; if (!T || !G.zones.size) return;
    const dy = T.y0 - e.touches[0].clientY;
    if (T.mode === null) {
      if (!dy) return;
      if (Math.abs(T.x0 - e.touches[0].clientX) > Math.abs(dy)) T.mode = 'native'; // seitlich wischen (Reiter) bleibt frei
      else if (G.anim) T.mode = 'block';
      else { const y = scrollY; T.t = target(y, Math.sign(dy), y + dy * 4); T.mode = !T.t || T.t.release ? 'native' : 'step'; }
    }
    if (T.mode === 'native') return;
    if (e.cancelable) e.preventDefault();
    if (T.mode === 'step' && !T.fired && Math.abs(dy) > 26) { T.fired = true; go(T.t.y); }
  };
  const onTE = () => { G.touch = null; if (G.pending != null) { const y = G.pending; G.pending = null; kill(); go(y); } };
  const onKey = e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !G.zones.size) return;
    const k = e.key, tg = e.target;
    if (tg && (tg.isContentEditable || skip(tg))) return;
    const d = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey) ? 1 : k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey) ? -1 : 0;
    if (!d || (k === ' ' && tg && /^(BUTTON|A)$/.test(tg.tagName))) return;
    const y = scrollY;
    if (G.anim) { if (inSeg(y)) e.preventDefault(); return; }
    const t = target(y, d, y + d * innerHeight * .9);
    if (!t || t.release) return;
    e.preventDefault(); go(t.y);
  };
  /* Scrollen ohne Geste (Schwung, Balken, Sprung): von außen hinein → an den Rand; zwischen Halten stehen geblieben → zum nächsten */
  const onScroll = () => {
    const y = scrollY, p = G.prevY; G.prevY = y;
    if (G.anim || !G.zones.size) return;
    clearTimeout(G.settle);
    if (Math.abs(y - p) < innerHeight * 2.5) for (const s of segs()) {
      const a = s[0], b = s[s.length - 1];
      const hit = p < a - 2 && y > a + 2 ? a : p > b + 2 && y < b - 2 ? b : null;
      if (hit != null) { if (G.touch) G.pending = hit; else { kill(); go(hit); } return; }
    }
    G.settle = setTimeout(() => {
      if (G.anim || G.touch) return;
      const y2 = scrollY, s = inSeg(y2); if (!s) return;
      let best = s[0]; s.forEach(v => { if (Math.abs(v - y2) < Math.abs(best - y2)) best = v; });
      if (Math.abs(best - y2) > 2) go(best);
    }, 220);
  };
  const L = [['wheel', onWheel, { capture: true, passive: false }], ['touchstart', onTS, { capture: true, passive: true }], ['touchmove', onTM, { capture: true, passive: false }],
    ['touchend', onTE, { capture: true }], ['touchcancel', onTE, { capture: true }], ['keydown', onKey, { capture: true }], ['scroll', onScroll, { passive: true }]];
  G.up = () => { if (G.n++ === 0) { G.prevY = scrollY; L.forEach(([t, f, o]) => addEventListener(t, f, o)); } };
  G.down = () => { if (--G.n === 0) L.forEach(([t, f, o]) => removeEventListener(t, f, o)); };
  G.go = go;
  return G;
}
/* zone: { stops: () => Seiten-Y[] (aufsteigend), lenis?: () => Lenis } → { go(y), dispose() } */
export function schritte(zone) {
  if (typeof window === 'undefined') return { go() { }, dispose() { } };
  const G = window.__jgSchritte || (window.__jgSchritte = steuerwerk());
  G.zones.add(zone); G.up();
  let on = true;
  return { go: (y, max) => G.go(y, max), dispose() { if (!on) return; on = false; G.zones.delete(zone); G.down(); } };
}
