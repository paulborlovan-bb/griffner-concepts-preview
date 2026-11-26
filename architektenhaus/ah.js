/* /architektenhaus, Fassung 3 (2026-11-26): eine Bühne, die beim Scrollen stehen bleibt.
   Leitsatz → Grundstück → Ein Partner → Ein Plan → Gefertigt in Griffen → Foto → Zuhause. Pro Schritt eine Überschrift und ein Satz,
   die Zeichnung wandelt sich (zeichnet sich, setzt sich zusammen, fällt zu einem Plan zusammen). ?en = englische Übersetzung. */
import { T } from './inhalt.js';

const Q = new URLSearchParams(location.search);
const L = Q.has('en') ? 1 : 0;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches || Q.has('still');
const SITE = 'https://www.griffner.com';
const t = a => a[L];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tag = k => `<mark class="ent">${esc(t(k === 'E' ? T.meta.entwurf : T.meta.zahl))}</mark>`;
/* Entwurf-Marken; im Englischen hängen die Marken des deutschen Satzes am Ende */
const mk = pair => {
  let s = esc(pair[L]);
  if (L) { const m = pair[0].match(/\{[EZ]\}/g); if (m && !/\{[EZ]\}/.test(pair[1])) s += ' ' + m.join(' '); }
  return s.replace(/\s*\{([EZ])\}/g, (_, k) => ' ' + tag(k));
};
const ww = s => esc(s).split(' ').map((w, i) => `<span class="ww"><span style="--i:${i}">${w}</span></span>`).join(' ');
const nn = i => String(i).padStart(2, '0');
const href = p => SITE + p;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const M = T.marken;

/* ---------- Zeichen-Helfer (Zeichenfläche 640 × 480) ---------- */
const P = (d, cls = '', j = 0) => `<path class="d ${cls}" d="${d}" pathLength="1" style="--j:${j}"/>`;
const box = (x, y, w, h) => `M${x} ${y}H${x + w}V${y + h}H${x}V${y}`; /* ohne Z: Chrome zählt den Schluss-Strich nicht ganz in pathLength */
const lab = (x, y, txt, cls = 'l', j = 0, small = '') => `<p class="lb ${cls}" style="left:${(x / 6.4).toFixed(2)}%;top:${(y / 4.8).toFixed(2)}%;--j:${j}">${esc(txt)}${small ? `<small>${esc(small)}</small>` : ''}</p>`;
const svg = (inner, defs = '') => `<svg viewBox="0 0 640 480" aria-hidden="true">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;

/* ---------- Hausskizze (10_Bildwelt/Hausskizze), Linien als Pfade ---------- */
let SKIZZE = '';
async function ladeSkizze() {
  const doc = new DOMParser().parseFromString(await (await fetch('img/hausskizze.svg')).text(), 'image/svg+xml');
  const lines = [...doc.querySelectorAll('line')].map(l => {
    const g = n => +l.getAttribute(n), c = (l.getAttribute('stroke') || '').toUpperCase(), op = +(l.getAttribute('stroke-opacity') || 1);
    return { d: `M${g('x1')} ${g('y1')}L${g('x2')} ${g('y2')}`, kind: c === '#FFB200' ? 'gelb' : c === '#444442' ? 'plan' : op < .5 ? 'grund' : 'haus', op };
  });
  const ORDER = { grund: 0, plan: 1, haus: 2, gelb: 3 }, START = { grund: 0, plan: 450, haus: 850, gelb: 2600 }, STEP = { grund: 32, plan: 48, haus: 36, gelb: 90 };
  const cnt = { grund: 0, plan: 0, haus: 0, gelb: 0 };
  lines.sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
  SKIZZE = lines.map(l => {
    const i = cnt[l.kind]++;
    const st = l.kind === 'gelb' ? 'stroke:#FFB200;stroke-width:2.4px' : l.kind === 'plan' ? `stroke-opacity:${(l.op * .7).toFixed(2)}` : l.kind === 'grund' ? `stroke-opacity:${Math.max(.32, l.op).toFixed(2)}` : `stroke-opacity:${l.op.toFixed(2)};stroke-width:1.25px`;
    return `<path class="d" d="${l.d}" pathLength="1" style="${st};--d0:${START[l.kind] + i * STEP[l.kind]}ms;transition-duration:${l.kind === 'haus' ? 900 : 800}ms"/>`;
  }).join('');
}
/* das Fenster als Fläche (Schnittpunkte der vier gelben Striche): im letzten Schritt brennt dort Licht */
const schnitt = ([a, b], [c, d]) => { const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0], u = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den; return [a[0] + u * r[0], a[1] + u * r[1]]; };
const GL = { u: [[334.7, 254.3], [484.9, 290.1]], r: [[464.7, 307.0], [455.7, 135.4]], o: [[478.5, 161.0], [325.5, 135.5]], l: [[345.6, 117.2], [357.8, 281.3]] };
const FENSTER = [schnitt(GL.o, GL.l), schnitt(GL.o, GL.r), schnitt(GL.u, GL.r), schnitt(GL.u, GL.l)];
const skLab = (x, y, txt, d0) => `<p class="lb l w" style="left:${(x / 13.56).toFixed(2)}%;top:${(y / 8.96).toFixed(2)}%;--d0:${d0}ms">${esc(txt)}</p>`;
const skizze = (licht = false, labels = '') => `<div class="sk"${licht ? ' data-licht' : ''}><svg viewBox="0 0 1356 896" aria-hidden="true">${licht ? `<path class="d f" d="M${FENSTER.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L')}Z" style="--d0:2400ms"/>` : ''}${SKIZZE}</svg>${labels}</div>`;

/* ---------- Grundstück von oben ---------- */
function figGrund() {
  const plot = 'M110 120L520 92L560 380L150 410Z';
  return `<div class="fig">${svg([
    P(plot, '', 0),
    `<g clip-path="url(#cpG)">${['M60 214C210 184 400 254 600 200', 'M60 286C230 256 410 320 600 272', 'M60 356C240 330 420 388 600 344'].map((d, i) => P(d, 'k', 2 + i)).join('')}</g>`,
    P('M384 238H604', 's k', 5), P('M296 238H40', 's k', 5),
    P('M318 296L250 470', 's', 6), P('M362 296L470 470', 's', 6),
    P(box(292, 270, 96, 26), '', 7), P('M300 206H380V270H300V206', 'f', 8),
    P('M600 30V86', '', 9), P('M593 44L600 30L607 44', '', 9),
  ].join(''), `<clipPath id="cpG"><path d="${plot}"/></clipPath>`)}
  ${lab(112, 86, t(M.grund), 'l w', 1)}${lab(604, 214, t(M.morgen), 'r', 5)}${lab(40, 214, t(M.abend), 'l', 5)}${lab(362, 444, t(M.blick), 'c w', 6)}${lab(340, 182, t(M.haus), 'c w', 8)}${lab(600, 92, 'N', 'c w', 9)}</div>`;
}

/* ---------- Viele Firmen → ein Partner ---------- */
function figWege() {
  const Y = [110, 240, 370], PTS = [...Y.map(y => [84, y]), ...Y.map(y => [556, y])];
  const tr = PTS.map(([x, y], j) => P(box(x - 24, y - 19, 48, 38), '', j)).join('');
  const trL = PTS.map(([x, y], j) => lab(x, y + 28, t(M.gewerke[j]), 'c', j)).join('');
  const a = [tr, ...PTS.map(([x, y], j) => P(x < 320 ? `M108 ${y}L288 240` : `M532 ${y}L352 240`, '', 6 + j)),
    P('M108 110L532 370', 's k', 12), P('M108 370L532 110', 's k', 12), P('M84 129V221', 's k', 13), P('M84 259V351', 's k', 13),
    P('M556 129V221', 's k', 13), P('M556 259V351', 's k', 13), P(box(288, 215, 64, 50), '', 3)].join('');
  const b = [tr, ...PTS.map(([x, y], j) => P(x < 320 ? `M108 ${y}C190 ${y} 204 240 280 240` : `M532 ${y}C450 ${y} 436 240 360 240`, '', 6 + j)),
    P(box(288, 34, 64, 50), '', 2), P('M320 84V208', '', 12), P('M280 208H360V272H280V208', 'f', 13)].join('');
  return `<div class="fig" data-wege>
    <div class="st" data-st="a">${svg(a)}${trL}${lab(320, 274, t(M.du), 'c w', 4)}</div>
    <div class="st" data-st="b">${svg(b)}${trL}${lab(362, 50, t(M.du), 'l w', 3)}${lab(320, 284, t(M.partner), 'c w', 14)}</div></div>`;
}

/* ---------- Isometrie ---------- */
const C30 = Math.cos(Math.PI / 6);
const iso = (cx, cy) => (x, y, z) => [cx + (x - y) * C30, cy + (x + y) * .5 - z];
const pts = a => a.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1));
const poly = a => 'M' + pts(a).join('L') + 'Z';
const pl = a => 'M' + pts(a).join('L');

/* ---------- Fünf Ebenen, ein Plan ---------- */
const SCH = { W: 250, D: 170, cx: 176, cy: 235, gap0: 50, gap1: 9 };
function schichtDetails(i, pr, z) {
  const p = (x, y) => pr(x, y, z), W = SCH.W, D = SCH.D;
  const Ln = (a, cls = 'k') => `<path class="iso-l ${cls}" d="${pl(a.map(([x, y]) => p(x, y)))}"/>`;
  const R = (x, y, w, h, cls = 'k') => `<path class="iso-l ${cls}" d="${poly([p(x, y), p(x + w, y), p(x + w, y + h), p(x, y + h)])}"/>`;
  if (i === 0) return R(14, 14, W - 28, D - 28, '') + Ln([[110, 14], [110, 96]]) + Ln([[14, 96], [168, 96]]) + Ln([[168, 96], [168, D - 14]]) + Ln([[200, 14], [200, 60]]);
  if (i === 1) return R(30, 28, 62, 22) + R(140, 34, 54, 34) + R(150, 112, 64, 42) + R(22, 120, 80, 12) + R(36, 62, 16, 16);
  if (i === 2) return Ln([[20, 82], [W - 20, 82]], 's') + Ln([[124, 18], [124, D - 18]], 's') + Ln([[60, 82], [60, 140], [100, 140]], 's') + R(16, 76, 10, 10, '') + R(W - 26, 76, 10, 10, '');
  if (i === 3) { let s = ''; for (let x = 0; x <= W; x += 62.5) s += Ln([[x, 0], [x, D]]); for (let y = 0; y <= D; y += 85) s += Ln([[0, y], [W, y]]); return s; }
  return R(70, 110, 120, 44) + Ln([[0, 132], [70, 132]], 's') + R(24, 24, 9, 9, '') + R(46, 40, 9, 9, '') + R(210, 30, 9, 9, '') + R(222, 60, 9, 9, '');
}
function figSchichten() {
  const S = M.schichten;
  return `<div class="fig" data-schichten><svg viewBox="0 0 640 480" aria-hidden="true"><g class="isoW" style="transition-delay:700ms">${S.map((s, i) => `<path class="iso-l" data-lead="${i}" style="stroke-opacity:.5"/>`).join('')}</g>${S.map((s, i) => `<g data-sch="${i}" class="isoW" style="transition-delay:${(4 - i) * 140}ms"></g>`).reverse().join('')}</svg>${S.map((s, i) => `<p class="lb l w" data-slab="${i}" style="--j:${i};--d0:500ms">${nn(i + 1)}&nbsp;&nbsp;${esc(t(s))}</p>`).join('')}</div>`;
}
function zeichneSchichten(el, p) {
  const e = p * p * (3 - 2 * p), gap = SCH.gap0 + (SCH.gap1 - SCH.gap0) * e, W = SCH.W, D = SCH.D, pr = iso(SCH.cx, SCH.cy);
  for (let i = 0; i < 5; i++) {
    const z = (4 - i) * gap;
    el.querySelector(`[data-sch="${i}"]`).innerHTML = `<path class="iso" d="${poly([pr(0, 0, z), pr(W, 0, z), pr(W, D, z), pr(0, D, z)])}"/>${schichtDetails(i, pr, z)}`;
    const [rx, ry] = pr(W, 0, z), ly = SCH.cy + W * .5 - (4 - i) * SCH.gap0 - 6;
    el.querySelector(`[data-lead="${i}"]`).setAttribute('d', `M${(rx + 4).toFixed(1)} ${ry.toFixed(1)}L${(rx + 22).toFixed(1)} ${(ly + 6).toFixed(1)}H398`);
    const lb = el.querySelector(`[data-slab="${i}"]`); lb.style.left = (404 / 6.4).toFixed(2) + '%'; lb.style.top = (ly / 4.8).toFixed(2) + '%';
  }
}

/* ---------- Das Haus setzt sich zusammen ---------- */
const HS = { W: 230, D: 150, H: 100, t: 8, cx: 300, cy: 236 };
function quader(pr, [x0, y0, z0, x1, y1, z1], extra = '') {
  const f = a => `<path class="iso" d="${poly(a)}"/>`;
  return f([pr(x1, y0, z0), pr(x1, y1, z0), pr(x1, y1, z1), pr(x1, y0, z1)]) + f([pr(x0, y1, z0), pr(x1, y1, z0), pr(x1, y1, z1), pr(x0, y1, z1)]) + f([pr(x0, y0, z1), pr(x1, y0, z1), pr(x1, y1, z1), pr(x0, y1, z1)]) + extra;
}
function figMontage() {
  const tl = (k, a, b, cls = 'l') => `<p class="lb ${cls}" data-tl="${k}">${esc(t(a))}${b ? `<small>${esc(t(b))}</small>` : ''}</p>`;
  return `<div class="fig" data-montage><svg viewBox="0 0 640 480" aria-hidden="true"><g class="isoW" data-haus></g></svg>${tl('dach', M.dach, M.griffen)}${tl('waende', M.waende, M.griffen)}${tl('platte', M.platte, M.vorort, 'c')}${tl('fertig', M.fertig, null, 'c w')}</div>`;
}
function zeichneMontage(el, p) {
  const { W, D, H, t: th, cx, cy } = HS, pr = iso(cx, cy);
  const seg = (a, b) => { const x = clamp((p - a) / (b - a)); return 1 - x * x * (3 - 2 * x); };
  const eW = 62 * seg(0, .5), eC = 64 * seg(.3, .72), eR = 120 * seg(.48, .95);
  const mv = (b, dx, dy, dz) => [b[0] + dx, b[1] + dy, b[2] + dz, b[3] + dx, b[4] + dy, b[5] + dz];
  const Ln = (a, cls = 'k') => `<path class="iso-l ${cls}" d="${pl(a)}"/>`;
  let grid = '';
  for (let x = -120; x <= W + 120; x += 46) grid += Ln([pr(x, -120, -14), pr(x, D + 120, -14)]);
  for (let y = -120; y <= D + 120; y += 46) grid += Ln([pr(-120, y, -14), pr(W + 120, y, -14)]);
  const fy = (x0, z0, x1, z1, dy) => [pr(x0, D + dy, z0), pr(x1, D + dy, z0), pr(x1, D + dy, z1), pr(x0, D + dy, z1)];
  const fx = (y0, z0, y1, z1, dx) => [pr(W + dx, y0, z0), pr(W + dx, y1, z0), pr(W + dx, y1, z1), pr(W + dx, y0, z1)];
  let fe = `<path class="iso-l" d="${poly(fy(30, 28, 96, 82, eW))}"/><path class="iso-l" d="${poly(fy(150, 0, 176, 74, eW))}"/>`;
  for (let x = 108; x <= 140; x += 8) fe += Ln([pr(x, D + eW, 4), pr(x, D + eW, H - 6)]);
  let ge = `<path class="iso-l" d="${poly(fx(24, 8, 112, 90, eW))}"/>`;
  for (const y of [53, 82]) ge += Ln([pr(W + eW, y, 8), pr(W + eW, y, 90)]);
  const lit = p > .97 ? `<path class="iso g" d="${poly(fx(30, 14, 52, 84, .5))}"/>` : '';
  el.querySelector('[data-haus]').innerHTML = `<g style="opacity:.16">${grid}</g>` + quader(pr, [-12, -12, -14, W + 12, D + 12, 0])
    + quader(pr, mv([0, 0, 0, th, D, H], -eW, 0, 0)) + quader(pr, mv([th, 0, 0, W, th, H], 0, -eW, 0))
    + quader(pr, mv([th, D - th, 0, W - th, D, H], 0, eW, 0), fe) + quader(pr, mv([W - th, th, 0, W, D, H], eW, 0, 0), ge)
    + lit + quader(pr, [0, 0, H + eC, W, D, H + 8 + eC]) + quader(pr, [-10, -10, H + 8 + eR, W + 10, D + 10, H + 16 + eR]);
  const on = el.classList.contains('on') ? 1 : 0;
  const put = (k, pt, vis) => { const n = el.querySelector(`[data-tl="${k}"]`); n.style.left = (pt[0] / 6.4).toFixed(2) + '%'; n.style.top = (pt[1] / 4.8).toFixed(2) + '%'; n.style.opacity = on * vis; };
  const dp = pr(W + 10, -10, H + 16 + eR), wp = pr(W + eW, D, H), vorn = pr(W + 12, D + 12, -14);
  put('dach', [dp[0] + 14, dp[1] - 10], Math.min(1, eR / 40));
  put('waende', [wp[0] + 16, wp[1] - 4], Math.min(1, eW / 30));
  put('platte', [vorn[0], vorn[1] + 10], p < .9 ? 1 : 0);
  put('fertig', [vorn[0], vorn[1] + 10], p > .96 ? 1 : 0);
}

/* ---------- Seite ---------- */
const STEPS = ['motto', ...T.schritte.map(s => s.art)];
const WEIGHT = { motto: 1, grund: 1.1, partner: 1.5, plan: 1.5, griffen: 1.8, foto: 1.2, zuhause: 1.3 };
const SLOT = { grund: figGrund, partner: figWege, plan: figSchichten, griffen: figMontage, zuhause: () => skizze(true, skLab(500, 96, t(M.fenster), 2600)) };

function markup() {
  const H = T.hero;
  const panels = T.schritte.map((s, i) => `<div class="tp" data-tp="${i + 1}">
      <p class="info n"><b>${nn(i + 1)}</b><span>/ 06</span></p>
      <h2 class="h2">${ww(t(s.h))}</h2>
      <p class="lead">${mk(s.p)}</p>
      ${s.link ? `<a class="lk" href="${href(s.link[1])}">${esc(t(s.link[0]))}<i></i></a>` : ''}
    </div>`).join('');
  const slots = T.schritte.filter(s => SLOT[s.art]).map(s => `<div class="slot" data-slot="${s.art}">${SLOT[s.art]()}</div>`).join('');
  return `
<section class="hero" id="top">
  <div class="hero__txt">
    <p class="info auf" style="--d:0ms"><b>${esc(t(H.info))}</b></p>
    <h1 class="h1">${ww(t(H.h1))}</h1>
    <p class="lead auf" style="--d:600ms">${mk(H.lead)}</p>
    <div class="auf" style="--d:800ms"><a class="btn" href="${href('/catalogue')}">${esc(t(H.knopf))}</a></div>
  </div>
  <div class="hero__fig" data-hskizze>${skizze(false)}</div>
  <a class="hero__cue info" href="#buehne">${esc(t(H.scroll))}<i></i></a>
</section>

<section class="bn" id="buehne" data-bn aria-label="${L ? 'The story' : 'Die Geschichte'}">
  <div class="bn__st">
    <div class="bn__foto"><img src="https://framerusercontent.com/images/Unpl4PriPV66mKCB4Z3z6BNiU.jpg?scale-down-to=2048" alt="${esc(t(M.fotoAlt))}" decoding="async"><p class="fm info"><i></i>${esc(t(M.foto))}</p></div>
    <div class="bn__motto">${T.motto.map(m => `<p>${ww(t(m))}</p>`).join('')}</div>
    <div class="bn__fig">${slots}</div>
    <div class="bn__txt">${panels}</div>
    <div class="bn__lauf"><i></i></div>
  </div>
</section>

<section class="faq" id="fragen">
  <p class="info auf">${esc(t(T.faq.info))}</p>
  <div class="faq__l auf">${T.faq.fragen.map(([f, a]) => `<details><summary>${esc(t(f))}<i></i></summary><p>${mk(a)}</p></details>`).join('')}</div>
</section>

<section class="next" id="katalog">
  <span class="feld auf" aria-hidden="true"></span>
  <p class="info auf">${esc(t(T.next.info))}</p>
  <h2 class="h2">${ww(t(T.next.h))}</h2>
  <p class="lead auf">${mk(T.next.p)}</p>
  <div class="next__akt auf"><a class="btn" href="${href('/catalogue')}">${esc(t(T.next.knopf))}</a><a class="lk" href="${href('/visit')}">${esc(t(T.next.link2))}<i></i></a></div>
</section>

<section class="mehr">
  <p class="info auf">${esc(t(T.mehr.info))}</p>
  ${T.mehr.links.map(([n, p, ab]) => ab ? `<span class="ml auf">${esc(t(n))}<span class="info ab">${esc(t(ab))}</span></span>` : `<a class="auf" href="${href(p)}">${esc(t(n))}<i></i></a>`).join('')}
</section>

<footer class="fuss"><div data-wm></div><p class="info"><span>Griffen / AT / 46.70 N / 14.73 E</span><span>${esc(t(T.meta.entwurf))} · noindex</span></p></footer>`;
}

async function start() {
  document.documentElement.lang = L ? 'en' : 'de';
  document.title = t(T.meta.title) + ' (Entwurf)';
  await ladeSkizze();
  const main = document.querySelector('[data-seite]');
  main.innerHTML = markup();
  document.querySelectorAll('.kopf__sp a').forEach(a => a.classList.toggle('is-akt', (a.dataset.l === 'en') === !!L));
  fetch('img/wortmarke.svg').then(r => r.text()).then(s => { main.querySelector('[data-wm]').innerHTML = s.replace(/fill="#fff"/gi, 'fill="#FFB200"').replace('<svg ', '<svg style="display:block;width:100%;height:auto" '); });

  /* Hero: die Skizze zeichnet sich, die Überschrift steigt */
  const hero = main.querySelector('.hero');
  requestAnimationFrame(() => requestAnimationFrame(() => { hero.classList.add('is-in'); hero.querySelector('[data-hskizze] .sk').classList.add('on'); }));

  /* Unten: Absätze beim Hereinkommen */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  main.querySelectorAll('.faq,.next,.mehr').forEach(s => io.observe(s));

  /* Bühne */
  const bn = main.querySelector('[data-bn]'), motto = bn.querySelector('.bn__motto'), lauf = bn.querySelector('.bn__lauf i');
  const tps = [...bn.querySelectorAll('.tp')], slots = [...bn.querySelectorAll('.slot')];
  const sch = bn.querySelector('[data-schichten]'), mon = bn.querySelector('[data-montage]'), weg = bn.querySelector('[data-wege]');
  zeichneSchichten(sch, 0); zeichneMontage(mon, 0);
  const W = STEPS.map(s => WEIGHT[s]), SUM = W.reduce((a, b) => a + b, 0), CUM = W.map((_, i) => W.slice(0, i).reduce((a, b) => a + b, 0));
  const UNIT = innerWidth < 810 ? 80 : 85; /* vh pro Gewicht */
  bn.style.height = `calc(${(SUM * UNIT).toFixed(1)}vh + 100vh)`;
  window.__ah = { STEPS, CUM, W, SUM, UNIT };
  let akt = -1, lastS = -1, lastM = -1, lastWeg = '';
  const setAkt = i => {
    if (i === akt) return; akt = i;
    const art = STEPS[i];
    motto.classList.toggle('is-in', art === 'motto');
    tps.forEach((p, j) => p.classList.toggle('is-in', j + 1 === i));
    slots.forEach(s => { const on = s.dataset.slot === art; s.classList.toggle('is-akt', on); s.firstElementChild.classList.toggle('on', on); });
    bn.classList.toggle('is-foto', art === 'foto');
    if (art !== 'partner') { lastWeg = ''; weg.querySelectorAll('.st').forEach(s => s.classList.remove('on')); }
  };
  const frame = () => {
    const vh = innerHeight, r = bn.getBoundingClientRect();
    const P = clamp(-r.top / (r.height - vh)) * SUM;
    let i = 0; while (i < STEPS.length - 1 && P >= CUM[i + 1]) i++;
    const local = clamp((P - CUM[i]) / W[i]);
    if (r.top > vh * .4) { if (akt !== -1) { akt = -1; motto.classList.remove('is-in'); } }
    else setAkt(i);
    lauf.style.transform = `scaleX(${(P / SUM).toFixed(4)})`;
    const art = STEPS[i];
    if (art === 'partner' && akt === i) { const w = local < .42 ? 'a' : 'b'; if (w !== lastWeg) { lastWeg = w; weg.querySelectorAll('.st').forEach(s => s.classList.toggle('on', s.dataset.st === w)); } }
    const ps = REDUCE ? (art === 'plan' ? 1 : 0) : clamp((local - .12) / .62);
    if (art === 'plan' && Math.abs(ps - lastS) > .001) { zeichneSchichten(sch, ps); lastS = ps; }
    const pm = REDUCE ? 1 : (art === 'griffen' ? clamp((local - .04) / .72) : CUM[i] > CUM[STEPS.indexOf('griffen')] ? 1 : 0);
    if (Math.abs(pm - lastM) > .001 || mon.dataset.on !== String(mon.classList.contains('on'))) { mon.dataset.on = String(mon.classList.contains('on')); zeichneMontage(mon, pm); lastM = pm; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  /* Sprachwechsel behält die Stelle */
  try { const s = sessionStorage.getItem('ah-y'); if (s) { scrollTo(0, +s); sessionStorage.removeItem('ah-y'); } } catch {}
  document.querySelectorAll('.kopf__sp a').forEach(a => a.addEventListener('click', () => { try { sessionStorage.setItem('ah-y', String(scrollY)); } catch {} }));
  /* weich wie auf der Website (Lenis 1.1.13); ?nativ schaltet es ab */
  if (!REDUCE && !Q.has('nativ')) {
    import('https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs').then(({ default: Lenis }) => {
      const Ln = window.__lenis = new Lenis({ duration: 1.5, easing: x => Math.min(1, 1.001 - Math.pow(2, -10 * x)), smoothWheel: true });
      const loop = x => { Ln.raf(x); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
      main.querySelector('.hero__cue').addEventListener('click', e => { e.preventDefault(); Ln.scrollTo(bn, { duration: 1.8 }); });
    }).catch(e => console.warn('Lenis', e));
  }
}
start();
