/* GRIFFNER Journey, Runde 14 (2026-11-24): die vier Zeichnungen aus Runde 11 (leben.js) für „Wie wir das möglich machen.“
   Kunde: „for the section wie wir das moglich machen use my animations“. Gleiche Zeichnungen und Abläufe, hier auf Weiß (weg.css, .wz).
   schichten: fünf Ebenen fallen zu einem Plan zusammen; partner: alle Gewerke laufen in einem Feld zusammen;
   update: das Update baut sich Zeile für Zeile auf; griffen: zwei Wege von deinem Zuhause nach Griffen. */
import { esc, stichworte } from './basis.js';

const punkte = p => (p || []).filter(x => x && (x[0] || x[1]));
/* aus Framer kommen Punkte, Ebenen und Marken als Text */
export function zeichnungDaten(k = {}) {
  const o = { ...k };
  if (typeof o.punkte === 'string') o.punkte = o.punkte.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^(.+?[.:])\s+(.+)$/); return m ? [m[1], m[2]] : [l, '']; });
  if (typeof o.schichten === 'string') o.schichten = stichworte(o.schichten);
  if (typeof o.marken === 'string') o.marken = o.marken.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => { const [a, ...b] = l.split(/\s+·\s+/); return [a || '', b.join(' · ')]; });
  return o;
}
/* Beschriftung an einer Stelle der Zeichnung (Zeichenfläche 640 × 480) */
const M = (k, j) => (k.marken || [])[j];
const lab = (m, x, y, j = 0, cls = '') => m && (m[0] || m[1]) ? `<p class="lb__lb ${cls}" style="left:${(x / 6.4).toFixed(2)}%;top:${(y / 4.8).toFixed(2)}%;--j:${j}">${m[0] ? `<span class="lb__l1">${esc(m[0])}</span>` : ''}${m[1] ? `<span class="lb__l2">${esc(m[1])}</span>` : ''}</p>` : '';
const svg = inner => `<svg class="lb__svg" viewBox="0 0 640 480" aria-hidden="true">${inner}</svg>`;
const line = (d, j, cls = '') => `<path class="lb__d ${cls}" style="--j:${j}" d="${d}" pathLength="1"/>`;

export function zeichnung(k0) {
  const k = zeichnungDaten(k0);
  if (k.art === 'schichten') {
    const L = (k.schichten || []).slice(0, 6);
    return `<div class="lb__sch" aria-hidden="true" style="--n:${L.length}">${L.map((s, j) => `<div class="lb__e" style="--j:${j}"><i class="lb__pl"></i><span class="lb__et">${esc(s)}</span></div>`).join('')}</div>`;
  }
  if (k.art === 'partner') {
    const Y = [112, 240, 368], P = [...Y.map(y => [78, y]), ...Y.map(y => [562, y])];
    const lines = P.map(([x, y], j) => line(x < 320 ? `M102 ${y}C190 ${y} 204 240 280 240` : `M538 ${y}C450 ${y} 436 240 360 240`, j)).join('');
    const sq = P.map(([x, y], j) => `<rect class="lb__sq" style="--j:${j}" x="${x - 24}" y="${y - 19}" width="48" height="38"/>`).join('');
    return `${svg(`${lines}${sq}<rect class="lb__ce" x="280" y="208" width="80" height="64"/>`)}${P.map(([x, y], j) => lab(M(k, j), x, y + 30, j)).join('')}${lab(M(k, 6), 320, 290, 6, 'is-hell')}`;
  }
  if (k.art === 'update') {
    const h = M(k, 0);
    return `<div class="lb__up" aria-hidden="true">${h && h[0] ? `<p class="lb__uh"><i></i>${esc(h[0])}</p>` : ''}${punkte(k.punkte).map((p, j) => `<div class="lb__ur" style="--j:${j}"><i class="${j ? '' : 'is-done'}"></i><div><p class="lb__ut">${esc(p[0])}</p><p class="lb__ux">${esc(p[1])}</p></div></div>`).join('')}</div>`;
  }
  if (k.art === 'griffen') {
    /* dein Zuhause links, Griffen (gelb) rechts; oben der Weg zur Beauftragung (Tag 07), unten der zum Design Day (Tag 11);
       gestrichelt ein Tag mehr am Wörthersee oder auf dem Feuerberg */
    return `${svg(`${line('M120 309C138 176 320 116 414 182', 0)}${line('M146 342C262 424 384 384 414 222', 1)}
<path class="lb__dash" d="M486 190C516 166 542 148 570 142"/><path class="lb__dash" d="M486 212C518 238 542 286 570 298"/>
<rect class="lb__sq" style="--j:0" x="94" y="309" width="52" height="42"/><rect class="lb__ce" x="414" y="171" width="72" height="58"/>
<rect class="lb__sq lb__sq--x" x="570" y="129" width="32" height="26"/><rect class="lb__sq lb__sq--x" x="570" y="287" width="32" height="26"/>`)}
${lab(M(k, 0), 120, 362, 0)}${lab(M(k, 1), 450, 240, 1, 'is-hell')}${lab(M(k, 2), 236, 92, 2, 'is-a')}${lab(M(k, 3), 300, 412, 3, 'is-b')}${lab(M(k, 4), 586, 324, 4, 'is-x')}${lab(M(k, 5), 586, 166, 5, 'is-x')}`;
  }
  return '';
}
