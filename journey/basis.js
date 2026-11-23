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
