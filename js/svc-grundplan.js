/* Runde 48: „Rund ums Haus“ im Leistungsumfang. Das Grundstück aus data/grundstueck.js als Linienplan wie „Der Plan“ auf griffner.com:
   feine Linien auf Schwarz, die sich Gruppe für Gruppe zeichnen, sobald der Plan ins Bild kommt. Acht Nummern am Plan, dieselben in der Liste;
   Zeigen oder Tippen auf eine Zeile oder Nummer macht den Teil gelb, der Rest tritt zurück. */
import * as G from '../data/grundstueck.js';

const NS = 'http://www.w3.org/2000/svg', S = 20, X0 = -16.8, Z0 = -18.1, X1 = 15.2, Z1 = 23.8;
const X = x => +((x - X0) * S).toFixed(1), Z = z => +((z - Z0) * S).toFixed(1);
const NN = n => String(n).padStart(2, '0');

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
  const grp = k => { const g = mk(svg, 'g', { class: 'rp__g', 'data-k': k, style: `--gi:${gi++}` }, false); return g; };
  const rect = (par, r, cls = '', o = 0) => mk(par, 'rect', { x: X(r.x0 - o), y: Z(r.z0 - o), width: +((r.x1 - r.x0 + 2 * o) * S).toFixed(1), height: +((r.z1 - r.z0 + 2 * o) * S).toFixed(1), class: cls });
  const poly = (par, pts, cls = '', closed = true) => mk(par, closed ? 'polygon' : 'polyline', { points: pts.map(([x, z]) => `${X(x)},${Z(z)}`).join(' '), class: cls });
  const line = (par, a, b, cls = '') => mk(par, 'line', { x1: X(a[0]), y1: Z(a[1]), x2: X(b[0]), y2: Z(b[1]), class: cls });
  const circ = (par, x, z, r, cls = '') => mk(par, 'circle', { cx: X(x), cy: Z(z), r: +(r * S).toFixed(1), class: cls });

  /* Grenze und Mauer */
  const gG = grp('grenze');
  poly(gG, G.PLOT, 'dot');
  for (let s = 0; s < G.MAUER.length - 1; s++) {
    const [a, b] = [G.MAUER[s], G.MAUER[s + 1]], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(len / .9);
    const nx = (b[1] - a[1]) / len, nz = -(b[0] - a[0]) / len;
    for (let i = 0; i <= n; i++) { const t = i / n; circ(gG, a[0] + (b[0] - a[0]) * t + nx * .3, a[1] + (b[1] - a[1]) * t + nz * .3, .26, 'thin'); }
  }
  const H = G.HAUS;
  /* 01 Fundament: Platte unter Haus und Anbauten, gestrichelt */
  const g1 = grp(1); [H, ...G.ANBAU].forEach(r => rect(g1, r, 'dash', .25));
  /* 02 Haus */
  const g2 = grp(2); rect(g2, H, 'bold'); G.ANBAU.forEach(r => rect(g2, r, r.glas ? '' : 'bold'));
  /* 03 Interior: Treppe, Küche, Tisch, Sofa, Bett, Bad */
  const g3 = grp(3);
  for (let i = 0; i <= 15; i++) line(g3, [1.5 + i * .26, -12.76], [1.5 + i * .26, -11.8], 'thin');
  rect(g3, { x0: -1.4, x1: 1.0, z0: -8.6, z1: -7.6 }); rect(g3, { x0: -2.45, x1: -1.8, z0: -10.1, z1: -6.5 });
  rect(g3, { x0: 2.1, x1: 4.3, z0: -4.7, z1: -3.7 }); rect(g3, { x0: 5.9, x1: 8.7, z0: -8.0, z1: -7.0 }); rect(g3, { x0: 6.6, x1: 8.4, z0: -12.75, z1: -10.65 });
  rect(g3, { x0: -2.35, x1: -.65, z0: -12.7, z1: -11.95 });
  [[5.6, -12.78, 5.6, -10.4], [5.6, -10.46, 6.0, -10.46], [6.9, -10.46, 8.88, -10.46], [.56, -12.78, .56, -11.06], [-2.48, -11.06, -.6, -11.06]].forEach(([a, b, c, d]) => line(g3, [a, b], [c, d]));
  /* 04 Carport mit Eingangsüberdachung und Auto */
  const C = G.CARPORT, g4 = grp(4);
  poly(g4, [[C.x0, C.z0], [C.x1, C.z0], [C.x1, C.dach.z1], [C.dach.x0, C.dach.z1], [C.dach.x0, C.z1], [C.x0, C.z1]]);
  mk(g4, 'rect', { x: X(-9.93), y: Z(-15.65), width: 1.86 * S, height: 4.7 * S, rx: 6, class: 'thin' });
  /* 05 Terrassen, Überdachung */
  const g5 = grp(5); G.DECKS.forEach(d => rect(g5, d)); rect(g5, G.UEBERDACHUNG, 'dash'); rect(g5, { x0: 11.8, x1: 12.7, z0: -4.7, z1: -2.1 }, 'thin');
  /* 06 Pool im Deck, Dusche */
  const g6 = grp(6); rect(g6, G.POOLDECK); rect(g6, G.POOL, 'bold'); rect(g6, G.POOL, 'thin', -.25); circ(g6, G.DUSCHE[0], G.DUSCHE[1], .25, 'thin');
  /* 07 Garten: Hecken, Bäume, Büsche, Beeren, Beete, Essplatz mit Segel */
  const g7 = grp(7);
  G.HECKEN.forEach(([a, b]) => line(g7, a, b, 'hedge'));
  G.BAEUME.forEach(([x, z, r]) => { circ(g7, x, z, r); circ(g7, x, z, .12, 'thin'); });
  G.BUESCHE.forEach(([x, z]) => circ(g7, x, z, .6, 'thin'));
  G.BEEREN.forEach(([x, z]) => circ(g7, x, z, .38, 'thin'));
  [...G.KRAEUTER, ...G.HOCHBEETE].forEach(b => rect(g7, b));
  rect(g7, G.ESSPLATZ, 'thin'); poly(g7, [[-4.3, -2.45], [-.25, -1.15], [-3.4, 1.45]], 'sail');
  /* 08 Sauna, Glashaus, Gartenhütte */
  const Gh = G.GLASHAUS, g8 = grp(8); rect(g8, G.SAUNA, 'bold'); rect(g8, Gh); line(g8, [(Gh.x0 + Gh.x1) / 2, Gh.z0], [(Gh.x0 + Gh.x1) / 2, Gh.z1], 'thin'); rect(g8, G.HUETTE, 'bold');

  /* Nummern am Plan */
  const PIN = { 1: [H.x0 - .25, H.z1 + .25], 2: [6.4, -9.4], 3: [-.2, -6.2], 4: [-8.9, -11.9], 5: [11.2, -9.2], 6: [7.7, 1.8], 7: [-4.9, 7.4], 8: [4.6, 12.1] };
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
