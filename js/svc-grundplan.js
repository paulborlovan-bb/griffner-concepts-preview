/* „Rund ums Haus“ im Leistungsumfang als Linienplan wie „Der Plan“ auf griffner.com: feine Linien auf Schwarz, die sich Gruppe für Gruppe
   zeichnen, sobald der Plan ins Bild kommt. Acht Nummern am Plan, dieselben in der Liste; Zeigen oder Tippen auf eine Zeile oder Nummer
   macht den Teil gelb, der Rest tritt zurück.
   Runde 53 (Kunde: „wie auf der Seite Services“): dasselbe Grundstück wie im Film auf /services (js/svc-film3d.js): 32 × 24 m, Straße im
   Süden, Concept Free mit den echten Wänden und Möbeln des Erdgeschoßes (Garage, Sauna im Haus), Terrasse, Zufahrt, Pool, Bäume, Hecke.
   Welt in m wie im Film: x nach Osten, z nach Süden. */
import FREE from '../data/grundriss-free.js';
import { WAENDE } from '../data/free-eg-waende.js';

const NS = 'http://www.w3.org/2000/svg', S = 20, X0 = -17, Z0 = -13, X1 = 17, Z1 = 19.6;
const X = x => +((x - X0) * S).toFixed(1), Z = z => +((z - Z0) * S).toFixed(1);
const NN = n => String(n).padStart(2, '0');
/* Maße des Films (aus Free gerechnet): Erdgeschoß, Obergeschoß mit Satteldach */
const EX0 = -9.5, EX1 = 5.9, EZ0 = -5.52, EZ1 = 8.16, BX = .9, HW = 4, BZ0 = -7.52, BZ1 = 9.66;
/* Plan pt (Erdgeschoß von Free) zur Welt: die Außenkante 371 / 253,5 liegt bei EX0 / EZ0 */
const K = FREE.K, PX = x => EX0 + (x - 371) / K, PZ = y => EZ0 + (y - 253.5) / K;
const EG = FREE.floors[0];

export function initGrundplan(box) {
  const svg = box.querySelector('[data-rp-svg]'); if (!svg) return;
  svg.setAttribute('viewBox', `0 0 ${X(X1)} ${Z(Z1)}`);
  const mk = (par, tag, a = {}, draw = true) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
    /* gestrichelte und gepunktete Linien blenden ein, alle anderen zeichnen sich (pathLength 1 und Strichversatz) */
    if (draw && !/\b(dot|dash)\b/.test(a.class || '')) e.setAttribute('pathLength', '1');
    par.appendChild(e); return e;
  };
  let gi = 0;
  const grp = k => mk(svg, 'g', { class: 'rp__g', 'data-k': k, style: `--gi:${gi++}` }, false);
  const rect = (par, x0, z0, x1, z1, cls = '', rx = 0) => mk(par, 'rect', { x: X(x0), y: Z(z0), width: +((x1 - x0) * S).toFixed(1), height: +((z1 - z0) * S).toFixed(1), class: cls, ...(rx ? { rx } : {}) });
  const prect = (par, r, cls = '') => rect(par, PX(r[0]), PZ(r[1]), PX(r[2]), PZ(r[3]), cls);
  const poly = (par, pts, cls = '', closed = true) => mk(par, closed ? 'polygon' : 'polyline', { points: pts.map(([x, z]) => `${X(x)},${Z(z)}`).join(' '), class: cls });
  const line = (par, a, b, cls = '') => mk(par, 'line', { x1: X(a[0]), y1: Z(a[1]), x2: X(b[0]), y2: Z(b[1]), class: cls });
  const circ = (par, x, z, r, cls = '') => mk(par, 'circle', { cx: X(x), cy: Z(z), r: +(r * S).toFixed(1), class: cls });

  /* Grenze (32 × 24 m), Eckpflöcke, Straße im Süden */
  const gG = grp('grenze');
  rect(gG, -16, -12, 16, 12, 'dot');
  [[-16, -12], [16, -12], [16, 12], [-16, 12]].forEach(([x, z]) => circ(gG, x, z, .16, 'thin'));
  line(gG, [X0, 13], [X1, 13], 'thin'); line(gG, [X0, 18.5], [X1, 18.5], 'thin'); line(gG, [X0, 15.75], [X1, 15.75], 'dash');
  /* 01 Fundament: Platte unter dem Erdgeschoß, gestrichelt */
  const g1 = grp(1); rect(g1, EX0 - .3, EZ0 - .3, EX1 + .3, EZ1 + .3, 'dash');
  /* 02 Haus: echte Wände des Erdgeschoßes, darüber das Obergeschoß mit First (Satteldach) */
  const g2 = grp(2);
  WAENDE.forEach(n => { const pts = []; for (let i = 0; i + 1 < n.length; i += 2) pts.push([PX(n[i]), PZ(n[i + 1])]); poly(g2, pts, 'wall'); });
  rect(g2, BX - HW, BZ0, BX + HW, BZ1, 'thin'); line(g2, [BX, BZ0], [BX, BZ1], 'dash');
  /* 03 Innenausbau und Interior: Möbel und Treppe des Erdgeschoßes (die Sauna ist 08, Möbel draußen gehören zur Terrasse) */
  const g3 = grp(3);
  const SR = [382.4, 264.9, 552.5, 358.4], inSauna = (x, y) => x >= SR[0] && x < SR[2] && y >= SR[1] && y < SR[3];
  const SKIP = ['pendant', 'slats', 'plant'];
  const FURN = (EG.furn || []).filter(f => !SKIP.includes(f[0]));
  const outside = ([, x, y, , , o = {}]) => o.out || y < 253.5 || y > 641.2 || x < 371 || x > 807.7;
  FURN.filter(f => !outside(f) && !inSauna(f[1], f[2])).forEach(([, x, y, w, d]) => prect(g3, [x, y, x + w, y + d], 'thin'));
  /* 04 Garage und Zufahrt: Pflaster bis zur Straße, zwei Autos in der Garage */
  const g4 = grp(4);
  rect(g4, -9.6, EZ1, -3, 12.4); rect(g4, -2.9, EZ1, -1.1, 12.4);
  (EG.cars || []).forEach(([x, y, l, w]) => { const cx = PX(x), cz = PZ(y), hl = l / K / 2, hw = w / K / 2; rect(g4, cx - hw, cz - hl, cx + hw, cz + hl, 'thin', 6); });
  /* 05 Terrasse im Norden und an der Westseite, Dielen */
  const g5 = grp(5);
  rect(g5, EX0 - 1.6, EZ0 - 4, EX1, EZ0); rect(g5, EX0 - 1.6, EZ0, EX0, 1.6);
  for (let x = EX0 - 1.1; x < EX1 - .2; x += 1) line(g5, [x, EZ0 - 4], [x, EZ0], 'thin');
  FURN.filter(f => outside(f) && f[2] < 253.5).forEach(([, x, y, w, d]) => prect(g5, [x, y, x + w, y + d]));
  /* 06 Pool mit Rand */
  const g6 = grp(6); rect(g6, 8.1, -7.9, 14.9, -1.1); rect(g6, 8.5, -7.5, 14.5, -1.5, 'bold');
  /* 07 Garten: Bäume (wie im Film), Hecke im Norden, Rasen */
  const g7 = grp(7);
  [[-13.6, -10.2], [14, -10.4], [14.4, 10], [-13.8, 10.2], [7.4, 10.8], [-14, -3.6], [14.6, 2], [3.4, -10.8]].forEach(([x, z], i) => { const r = 1.45 * (.8 + (i % 3) * .16); circ(g7, x, z, r); circ(g7, x, z, .12, 'thin'); });
  line(g7, [-15.3, -11.35], [15.3, -11.35], 'hedge');
  /* 08 Sauna im Haus (Erdgeschoß, Nordwest): Raum, Kabine, Bank, Ofen, Duschen */
  const g8 = grp(8);
  prect(g8, SR, 'bold'); prect(g8, [382.4, 264.9, 467.4, 324.6]);
  FURN.filter(f => !outside(f) && inSauna(f[1], f[2])).forEach(([, x, y, w, d]) => prect(g8, [x, y, x + w, y + d], 'thin'));

  /* Nummern am Plan */
  const PIN = { 1: [EX1 + .95, 5.6], 2: [EX1 - .9, .6], 3: [-.4, -3.0], 4: [-6.3, 10.9], 5: [-3.6, -7.6], 6: [11.5, -4.5], 7: [-12.2, 3.2], 8: [(PX(SR[0]) + PX(SR[2])) / 2 + 1.2, (PZ(SR[1]) + PZ(SR[3])) / 2 + .6] };
  const pins = mk(svg, 'g', { class: 'rp__pins' }, false);
  const inner = [];
  Object.entries(PIN).forEach(([k, [x, z]], n) => {
    const p = mk(pins, 'g', { class: 'rp__pin', 'data-k': k, transform: `translate(${X(x)} ${Z(z)})`, style: `--pi:${n}` }, false);
    const q = mk(p, 'g', { class: 'rp__pi' }, false); inner.push(q);
    mk(q, 'rect', { x: -15, y: -11, width: 30, height: 22 }, false);
    const t = mk(q, 'text', { x: 0, y: 4.2, 'text-anchor': 'middle' }, false); t.textContent = NN(k);
    p.addEventListener('pointerenter', () => hot(k)); p.addEventListener('pointerleave', () => hot(null)); p.addEventListener('click', () => hot(k, true));
  });

  /* Nummern bleiben gleich groß am Bildschirm, auch wenn der Plan am Telefon kleiner wird */
  const fit = () => { const r = svg.getBoundingClientRect(); if (!r.width || !r.height) return; const s = Math.min(2.4, Math.max(1, X(X1) / r.width, Z(Z1) / r.height)).toFixed(3); inner.forEach(q => q.setAttribute('transform', `scale(${s})`)); };
  new ResizeObserver(fit).observe(svg); fit();

  /* Gelb, was du zeigst */
  let fixed = null;
  function hot(k, click) {
    if (click) fixed = fixed === k ? null : k;
    const v = k || fixed;
    if (v) box.dataset.hot = v; else delete box.dataset.hot;
    box.querySelectorAll('[data-rp-it]').forEach(b => b.classList.toggle('is-hot', b.dataset.rpIt === String(v)));
  }
  box.querySelectorAll('[data-rp-it]').forEach(b => {
    const k = b.dataset.rpIt;
    b.addEventListener('pointerenter', () => hot(k)); b.addEventListener('pointerleave', () => hot(null));
    b.addEventListener('focus', () => hot(k)); b.addEventListener('blur', () => hot(null));
    b.addEventListener('click', () => hot(k, true));
  });

  /* zeichnet sich, sobald der Plan zu einem Viertel im Bild ist */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { box.classList.add('is-on'); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { box.classList.add('is-on'); io.disconnect(); } }, { threshold: .25 });
  io.observe(svg);
}
