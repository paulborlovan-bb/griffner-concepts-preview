/* HERO. Am Anfang ist nur ein Strich. Dann kommst du, mit deinem Leben. Die Worte fliegen in Räume, der Strich wird zum Plan.
   Das Hilfsliniensystem am Ende (Führungslinien, überstehende Ecken, punktierte Mittellinie) kommt aus dem Intro "Der Plan" von griffner.com. */
import { $, $$, E, win, lerp, clamp, ease, reduce, prog, loop } from './core.js';

/* Abstrakter Plan in Metern, Ursprung links oben. Kein echter Grundriss, ein Bild für "aus Leben werden Räume". */
const ROOMS = [
  [0, 0, 5, 5], [5, 0, 9, 4.5], [9, 0, 11.5, 4.5], [11.5, 0, 18, 5.5],
  [0, 5, 7, 12], [7, 4.5, 13, 12], [13, 5.5, 18, 12]
];
const TERR = [7, 12, 13, 15];
/* [Wort, Raum, Raumindex, Startpunkt Desktop, Startpunkt Telefon]. Startpunkte in Anteilen des Viewports,
   so verteilt, dass sich kein Wort mit einem anderen oder mit dem Satz unten links überschneidet. */
const WORDS = [
  ['Morgenkaffee.', 'Küche', 0, [.06, .2], [.06, .2]],
  ['Konzentration.', 'Arbeiten', 1, [.52, .13], [.5, .14]],
  ['Ein warmes Bad.', 'Bad', 2, [.95, .22], [.94, .26]],
  ['Ausschlafen.', 'Schlafen', 3, [.93, .38], [.94, .38]],
  ['Ein langer Tisch.', 'Essen', 4, [.08, .46], [.06, .44]],
  ['Bücher.', 'Wohnen', 5, [.4, .31], [.06, .32]],
  ['Kinderlachen.', 'Kinder', 6, [.95, .62], [.06, .56]],
  ['Abendsonne.', 'Terrasse', 7, [.56, .53], [.94, .5]]
];
const FW = 18, FH = 12, BOXH = 15;
const NS = 'http://www.w3.org/2000/svg';

let D, G = {}, hi = reduce ? 1 : 0, t0 = 0;

export function initHero() {
  const el = $('#k-hero');
  D = { el, svg: $('[data-h-svg]'), words: $('[data-h-words]'), top: $('[data-h-top]'), says: $$('[data-h-say]'), end: $('[data-h-end]'), scroll: $('[data-h-scroll]'), dock: $('[data-h-dock]') };
  D.w = WORDS.map(([w, r]) => {
    const n = document.createElement('div'); n.className = 'hw';
    n.innerHTML = `<span class="hw__w">${w}</span><span class="hw__r info">${r}</span>`;
    D.words.appendChild(n);
    return { n, ww: n.firstElementChild, rr: n.lastElementChild };
  });
  build();
  addEventListener('resize', () => { build(); loop.poke(); });
  t0 = performance.now();
  loop.add({ tick });
  /* Einstieg: Strich zeichnet sich, Text kommt, sobald die Schrift geladen ist */
  const intro = () => { if (hi >= 1) return; hi = ease(clamp((performance.now() - t0 - 250) / 2400)); loop.poke(); requestAnimationFrame(intro); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { t0 = performance.now(); requestAnimationFrame(intro); });
}

function mk(tag, attrs, parent = D.svg) { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.appendChild(e); return e; }

function build() {
  const vw = innerWidth, vh = innerHeight, narrow = vw < 820;
  D.svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  D.svg.innerHTML = '';
  const s = narrow ? Math.min(vw * .86 / FW, vh * .36 / BOXH) : Math.min(vw * .46 / FW, vh * .5 / BOXH);
  const cx = narrow ? vw * .5 : vw * .6, cy = narrow ? vh * .44 : vh * .48;
  const ox = cx - FW * s / 2, oy = cy - BOXH * s / 2;
  const P = (x, y) => [ox + x * s, oy + y * s];
  G = { s, ox, oy, P, vw, vh };
  const rect = r => { const [a, b] = P(r[0], r[1]), [c, d] = P(r[2], r[3]); return `M${a} ${b}H${c}V${d}H${a}Z`; };
  /* Führungslinien durch die Außenkanten, über die ganze Fläche */
  const [x0, y0] = P(0, 0), [x1, y1] = P(FW, FH);
  G.guides = [
    mk('path', { class: 'hl hl--guide', d: `M0 ${y0}H${vw}`, pathLength: 1 }),
    mk('path', { class: 'hl hl--guide', d: `M${vw} ${y1}H0`, pathLength: 1 }),
    mk('path', { class: 'hl hl--guide', d: `M${x0} ${vh}V0`, pathLength: 1 }),
    mk('path', { class: 'hl hl--guide', d: `M${x1} 0V${vh}`, pathLength: 1 })
  ];
  G.mid = mk('path', { class: 'hl hl--mid', d: `M${x0 - 40} ${(y0 + y1) / 2}H${x1 + 40}` });
  G.rooms = ROOMS.map(r => mk('path', { class: 'hl hl--room', d: rect(r), pathLength: 1 }));
  G.terr = mk('path', { class: 'hl hl--out', d: rect(TERR) });
  G.outer = mk('path', { class: 'hl', d: rect([0, 0, FW, FH]), pathLength: 1, 'stroke-width': 3 });
  /* Ecken, die überstehen wie gezeichnet */
  const o = Math.max(14, s * 1.2);
  G.corners = mk('path', { class: 'hl', stroke: 'var(--griffner-kalk)', d: `M${x0 - o} ${y0}H${x0 + o}M${x0} ${y0 - o}V${y0 + o}M${x1 - o} ${y0}H${x1 + o}M${x1} ${y0 - o}V${y0 + o}M${x0 - o} ${y1}H${x0 + o}M${x0} ${y1 - o}V${y1 + o}M${x1 - o} ${y1}H${x1 + o}M${x1} ${y1 - o}V${y1 + o}` });
  /* Maßkette */
  const dy = y1 + Math.max(26, s * 3.4) + (TERR[3] - FH) * s * 0;
  G.dim = mk('g', {});
  mk('path', { class: 'hl hl--guide', d: `M${x0} ${dy}H${x1}M${x0} ${dy - 5}V${dy + 5}M${x1} ${dy - 5}V${dy + 5}`, stroke: 'var(--griffner-kalk)' }, G.dim);
  const t = mk('text', { x: (x0 + x1) / 2, y: dy - 8, 'text-anchor': 'middle', fill: 'var(--griffner-kalk)', 'font-size': 10, 'letter-spacing': '.2em', 'font-family': 'var(--font-text)', 'font-weight': 500 }, G.dim);
  t.textContent = '18,00 M';
  G.dim.setAttribute('transform', `translate(0 ${s * (TERR[3] - FH) + 6})`);
  /* Der Strich */
  G.line = mk('line', { class: 'hl', 'stroke-width': 1.4 });
  const m = parseFloat(getComputedStyle(D.el).getPropertyValue('--page-margin')) || 48;
  G.L = { a: [m, y1], b: [vw - m, y1], c: [x0, y1], d: [x1, y1] };
  /* Ziele der Worte: Mitte des Raums */
  G.tgt = WORDS.map(([, , ri]) => { const r = ri < 7 ? ROOMS[ri] : TERR; return P((r[0] + r[2]) / 2, (r[1] + r[3]) / 2); });
  D.dockAt = P(FW, 0);
  tick(true);
}

const dash = (el, k) => { el.style.strokeDasharray = '1 1'; el.style.strokeDashoffset = (1 - k).toFixed(4); el.style.opacity = k > 0.001 ? 1 : 0; };

function tick() {
  if (!D) return;
  const { p, on } = prog(D.el);
  if (!on) return;
  const vw = innerWidth, vh = innerHeight;
  /* Text */
  D.top.style.opacity = (hi * (1 - E(p, .05, .1))).toFixed(3);
  D.top.style.transform = `translateY(${((1 - hi) * 24 - E(p, .05, .1) * 32).toFixed(1)}px)`;
  D.scroll.style.opacity = (hi * (1 - E(p, 0, .03))).toFixed(3);
  const W = [[.09, .2], [.2, .33], [.36, .56], [.6, .76]];
  D.says.forEach((el, i) => {
    const o = win(p, W[i][0], W[i][1], .025);
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translateY(${((1 - E(p, W[i][0], W[i][0] + .03)) * 28).toFixed(1)}px)`;
  });
  const en = E(p, .8, .88);
  D.end.style.opacity = en.toFixed(3);
  D.end.style.transform = `translateY(${((1 - en) * 28).toFixed(1)}px)`;

  /* Strich: zeichnet sich beim Laden, zieht sich dann auf die Außenkante des Plans zusammen */
  const L = G.L, k = E(p, .27, .36);
  const a = [lerp(L.a[0], L.c[0], k), L.a[1]], b = [lerp(L.b[0], L.d[0], k), L.b[1]];
  const draw = hi;
  G.line.setAttribute('x1', a[0]); G.line.setAttribute('y1', a[1]);
  G.line.setAttribute('x2', lerp(a[0], b[0], draw)); G.line.setAttribute('y2', b[1]);
  G.line.style.opacity = (1 - E(p, .4, .46)).toFixed(3);

  /* Räume zeichnen sich nacheinander */
  G.rooms.forEach((r, i) => dash(r, E(p, .36 + i * .022, .46 + i * .022)));
  dash(G.outer, E(p, .6, .7));
  G.terr.style.opacity = E(p, .5, .58).toFixed(3);
  G.guides.forEach((g, i) => dash(g, E(p, .61 + i * .015, .74 + i * .015)));
  const gk = E(p, .66, .74);
  G.corners.style.opacity = gk.toFixed(3); G.mid.style.opacity = gk.toFixed(3); G.dim.style.opacity = gk.toFixed(3);
  /* Am Ende tritt der Plan zurück, damit die Botschaft trägt */
  D.svg.style.opacity = (1 - en * .84).toFixed(3);

  /* Worte: erscheinen frei, schweben, fliegen in ihre Räume und werden zu Beschriftungen */
  const big = Math.max(20, Math.min(44, vw * .026));
  D.w.forEach((w, i) => {
    const [fx, fy] = WORDS[i][vw < 820 ? 4 : 3];
    const appear = E(p, .11 + i * .012, .17 + i * .012);
    const fly = E(p, .4 + i * .018, .54 + i * .018);
    const sx = fx * vw, sy = fy * vh - (p - .1) * 60;
    const [tx, ty] = G.tgt[i];
    const x = lerp(sx, tx, fly), y = lerp(sy, ty, fly);
    const ax = fx > .6 ? -100 : fx > .3 ? -50 : 0;
    w.n.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(${lerp(ax, -50, fly).toFixed(1)}%,-50%)`;
    const narrow = vw < 820;
    w.ww.style.fontSize = lerp(big, narrow ? 10 : 12, fly).toFixed(2) + 'px';
    w.ww.style.color = fly > .9 ? 'var(--griffner-kalk)' : '';
    /* Auf dem Handy sind die Räume zu klein für beides: das Wort geht, der Raumname bleibt */
    w.ww.style.opacity = narrow ? (1 - E(p, .56 + i * .012, .6 + i * .012)).toFixed(3) : '';
    w.rr.style.fontSize = narrow ? '9px' : '';
    w.rr.style.letterSpacing = narrow ? '.12em' : '';
    w.rr.style.marginTop = narrow ? '-6px' : '';
    w.n.style.textAlign = fly > .5 ? 'center' : 'left';
    w.rr.style.opacity = E(p, .55 + i * .012, .6 + i * .012).toFixed(3);
    w.n.style.opacity = (appear * (1 - en * .84)).toFixed(3);
  });

  /* Connector am Ende auf der Ecke des Plans */
  if (p > .84) { D.dock.style.left = D.dockAt[0].toFixed(1) + 'px'; D.dock.style.top = D.dockAt[1].toFixed(1) + 'px'; delete D.dock.dataset.dockHide; }
  else D.dock.dataset.dockHide = '1';
}
