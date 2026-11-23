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

/* ---------- Schritt für Schritt (Runde 11 und 12, 2026-11-23) ----------
   Runde 11, Kundenwunsch: „tight the scroll so you can't stop between steps and you can't jump steps“.
   Runde 12, Kundenwunsch: „too slow between steps, make it faster and correlated, don't lock it and also make it smoother“. Darum:
   - schneller: eine Geste gleitet in rund 0,4 bis 0,8 s zum nächsten Halt (vorher 0,65 bis 1,9 s), sofort schnell und weich auslaufend (wie Schwung)
   - mitgehend: am Telefon folgt die Seite dem Finger 1:1 (höchstens bis zum Nachbarhalt); beim Loslassen gleitet sie mit dem Tempo des Fingers weiter
   - nicht gesperrt: während des Gleitens zählt jede neue Geste (Mausrad, Wischen, Taste) und führt einen Halt weiter oder zurück;
     ein Finger fängt das Gleiten auf. Nur der Nachlauf derselben Geste (Trackpad-Schwung) wird weiter geschluckt, damit nichts übersprungen wird.
   Jede Sektion meldet ihre Halte (Seiten-Y, aufsteigend) als Zone an: die Szene (Phasen und Tage) mit dem Stapel, Besser leben (Phase und Kapitel).
   Innerhalb einer Zone (und zwischen zwei Zonen, die weniger als 1,6 Bildschirmhöhen auseinander liegen) führt jede Geste genau einen Halt weiter.
   Hinter dem letzten und vor dem ersten Halt scrollt die Seite frei. Wer von außen hineinscrollt (auch mit Schwung), landet am ersten
   bzw. letzten Halt. Bleibt die Seite zwischen zwei Halten stehen (Scrollbalken, Sprung), gleitet sie zum nächsten.
   Alle Komponenten teilen sich ein Steuerwerk (window.__jgSchritte); auf der Website gleitet es mit Lenis (store.lenis), sonst selbst. */
const EASE_IO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const EASE_OUT = t => 1 - Math.pow(1 - t, 3);
/* Anlauf mit dem Tempo des Fingers (m = Anfangstempo relativ zum Mittel, 0 bis 3; m = 3 ist EASE_OUT), dann weich zum Halt */
const HERMITE = m => t => (t * t * t - 2 * t * t + t) * m + (3 * t * t - 2 * t * t * t);
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
  const near = (s, y) => { let i = 0; s.forEach((v, j) => { if (Math.abs(v - y) < Math.abs(s[i] - y)) i = j; }); return i; };
  /* sofort setzen (Finger) */
  const setY = y => { const L = lenis(); if (L) L.scrollTo(y, { immediate: true, force: true }); else scrollTo({ top: y, behavior: 'instant' }); };
  /* Gleiten anhalten, wo es gerade ist; gibt das Ziel zurück */
  const stop = () => {
    const a = G.anim; if (!a) return null;
    G.anim = null; G.animEnd = performance.now();
    const L = lenis(); if (L) L.scrollTo(scrollY, { immediate: true, force: true });
    G.prevY = scrollY; return a;
  };
  /* Gleiten. Gesten: sofort schnell, weich auslaufen (Schwung). Klick auf Reiter oder Leiste: weich an und aus. o.ms: Dauer vorgeben (Finger-Tempo). */
  const go = (to, o = {}) => {
    const from = scrollY, dist = Math.abs(to - from), vh = innerHeight;
    if (dist < 1) { stop(); return; }
    const ms = o.ms || (o.click ? clamp(420 + dist / vh * 220, 480, 1100) : clamp(300 + dist / vh * 220, 380, 800));
    const ease = o.ease || (o.click ? EASE_IO : EASE_OUT), L = lenis(), a = { to };
    G.anim = a; G.used = true;
    const done = () => { if (G.anim !== a) return; G.anim = null; G.animEnd = performance.now(); G.prevY = scrollY; };
    if (L) { L.scrollTo(to, { duration: ms / 1000, easing: ease, lock: false, force: true, onComplete: done }); setTimeout(done, ms + 400); }
    else {
      const t0 = performance.now();
      const tick = now => { if (G.anim !== a) return; const k = clamp((now - t0) / ms); scrollTo({ top: from + (to - from) * ease(k), behavior: 'instant' }); if (k < 1) requestAnimationFrame(tick); else done(); };
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
    /* neue Geste: Pause über 160 ms (auch während des Gleitens), oder nach dem Gleiten ein deutlich kräftigerer Stoß als der Nachlauf */
    const fresh = gap > 160 || (!G.anim && abs > Math.max(24, G.lastAbs * 2.2) && now - G.animEnd > 150);
    G.lastT = now; G.lastAbs = abs;
    if (fresh) { G.used = false; G.acc = 0; }
    if (G.anim && G.used) { eat(e); return; } // Nachlauf der Geste, die gerade gleitet
    const base = G.anim ? G.anim.to : scrollY, L = lenis();
    const t = target(base, Math.sign(dy), (G.anim ? base : L ? L.targetScroll : base) + dy);
    if (!t) return;
    if (t.release) { if (G.used) { eat(e); return; } stop(); return; } // frei weiter: Lenis übernimmt
    eat(e);
    if (G.used) return;
    G.acc += dy; if (Math.abs(G.acc) < 6) return;
    go(t.y);
  };
  /* Telefon: die Seite folgt dem Finger (bis zum Nachbarhalt), beim Loslassen gleitet sie mit seinem Tempo zum Halt */
  const onTS = e => {
    if (e.touches.length !== 1 || !G.zones.size || skip(e.target)) { G.touch = null; return; }
    const p = e.touches[0], a = G.anim ? stop() : null; // ein Finger fängt das Gleiten auf
    G.touch = { y0: p.clientY, x0: p.clientX, s0: scrollY, mode: null, base: a ? a.to : null, grab: !!a, smp: [[performance.now(), scrollY]] };
  };
  const onTM = e => {
    const T = G.touch; if (!T || !G.zones.size) return;
    const p = e.touches[0], dy = T.y0 - p.clientY;
    if (T.mode === null) {
      if (!dy) return;
      if (Math.abs(T.x0 - p.clientX) > Math.abs(dy)) { T.mode = 'side'; return; } // seitlich wischen (Reiter) bleibt frei
      const base = T.base != null ? T.base : T.s0, s = inSeg(base);
      if (!s) { T.mode = 'native'; return; }
      const i = near(s, base), nx = dy > 0 ? s[i + 1] : s[i - 1];
      if (nx == null) { T.mode = 'native'; return; } // am Rand nach außen: frei
      T.mode = 'drag'; T.base = s[i]; T.lo = i > 0 ? s[i - 1] : s[i]; T.hi = i < s.length - 1 ? s[i + 1] : s[i];
    }
    if (T.mode !== 'drag') return;
    eat(e);
    const y = clamp(T.s0 + dy, T.lo, T.hi);
    setY(y);
    T.smp.push([performance.now(), y]); if (T.smp.length > 8) T.smp.shift();
  };
  const onTE = () => {
    const T = G.touch; G.touch = null;
    if (T && T.mode === 'drag') {
      const y = scrollY, off = y - T.base, now = performance.now(), last = T.smp[T.smp.length - 1];
      const first = T.smp.find(q => last[0] - q[0] < 100) || last;
      let v = last[0] > first[0] ? (last[1] - first[1]) / (last[0] - first[0]) : 0; // px je ms, + = nach unten
      if (now - last[0] > 120) v = 0; // Finger vor dem Loslassen still gehalten
      const nb = off > 0 ? T.hi : T.lo, span = Math.abs(nb - T.base) || 1;
      let to = T.base;
      if (Math.abs(v) > .3) { if (Math.sign(v) === Math.sign(off) || Math.abs(off) < 2) to = v > 0 ? T.hi : T.lo; }
      else if (Math.abs(off) > Math.min(40, span * .15)) to = nb;
      /* Dauer aus der Reststrecke (kurz), Anfangstempo = Finger; ist der Finger schneller, wird es noch kürzer */
      const D = Math.abs(to - y), sp = Math.sign(to - y) === Math.sign(v) ? Math.abs(v) : 0;
      let ms = clamp(260 + D / innerHeight * 240, 320, 700);
      if (sp > 0 && D > 1) ms = Math.max(220, Math.min(ms, 3 * D / sp));
      go(to, { ms, ease: HERMITE(D > 1 ? Math.min(3, sp * ms / D) : 0) });
      return;
    }
    if (T && T.grab && (T.mode === null || T.mode === 'side')) { go(T.base); return; } // nur angetippt: weiter zum Halt
    if (G.pending != null) { const y = G.pending; G.pending = null; kill(); go(y); }
  };
  const onKey = e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !G.zones.size) return;
    const k = e.key, tg = e.target;
    if (tg && (tg.isContentEditable || skip(tg))) return;
    const d = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey) ? 1 : k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey) ? -1 : 0;
    if (!d || (k === ' ' && tg && /^(BUTTON|A)$/.test(tg.tagName))) return;
    const base = G.anim ? G.anim.to : scrollY;
    const t = target(base, d, base + d * innerHeight * .9);
    if (!t) return;
    if (t.release) { stop(); return; }
    e.preventDefault(); go(t.y);
  };
  /* Scrollen ohne Geste (Schwung, Balken, Sprung): von außen hinein → an den Rand; zwischen Halten stehen geblieben → zum nächsten */
  const onScroll = () => {
    const y = scrollY, p = G.prevY; G.prevY = y;
    if (G.anim || !G.zones.size || (G.touch && G.touch.mode === 'drag')) return;
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
      if (Math.abs(best - y2) > 2) go(best, { click: true });
    }, 220);
  };
  const L = [['wheel', onWheel, { capture: true, passive: false }], ['touchstart', onTS, { capture: true, passive: true }], ['touchmove', onTM, { capture: true, passive: false }],
    ['touchend', onTE, { capture: true }], ['touchcancel', onTE, { capture: true }], ['keydown', onKey, { capture: true }], ['scroll', onScroll, { passive: true }]];
  G.up = () => { if (G.n++ === 0) { G.prevY = scrollY; L.forEach(([t, f, o]) => addEventListener(t, f, o)); } };
  G.down = () => { if (--G.n === 0) L.forEach(([t, f, o]) => removeEventListener(t, f, o)); };
  G.go = go;
  return G;
}
/* zone: { stops: () => Seiten-Y[] (aufsteigend), lenis?: () => Lenis } → { go(y) (Klick: weich an und aus), dispose() } */
export function schritte(zone) {
  if (typeof window === 'undefined') return { go() { }, dispose() { } };
  const G = window.__jgSchritte || (window.__jgSchritte = steuerwerk());
  G.zones.add(zone); G.up();
  let on = true;
  return { go: (y, o) => G.go(y, { click: true, ...(o || {}) }), dispose() { if (!on) return; on = false; G.zones.delete(zone); G.down(); } };
}
