/* /architektenhaus, Fassung 2 (2026-11-26). Eine Geschichte in sechs Kapiteln, erzählt mit Strichzeichnungen:
   Hero: die Hausskizze aus dem Markensystem zeichnet sich. 01 Grundstück von oben. 02 Der übliche Weg / Mit GRIFFNER (umschaltbar).
   03 Fünf Planungsebenen fallen beim Scrollen zu einem Plan zusammen. 04 Das Haus setzt sich beim Scrollen zusammen.
   05 Ein Foto, kein Rendering. 06 Die Skizze, fertig, mit gelbem Fenster. ?en zeigt die englische Übersetzung. */
import { T, KAPITEL } from './inhalt.js';

const Q = new URLSearchParams(location.search);
const L = Q.has('en') ? 1 : 0;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches || Q.has('still');
const SITE = 'https://www.griffner.com';
const t = a => a[L];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tag = k => `<mark class="ent">${esc(t(k === 'E' ? T.meta.entwurf : T.meta.zahl))}</mark>`;
/* Text mit Entwurf-Marken. Im Englischen hängen die Marken des deutschen Satzes am Ende. */
const mk = pair => {
  let s = esc(pair[L]);
  if (L && !/\{[EZ]\}/.test(pair[1])) { const m = pair[0].match(/\{[EZ]\}/g); if (m) s += ' ' + m.join(' '); }
  return s.replace(/\{([EZ])\}/g, (_, k) => tag(k)).replace(/\s+(<mark)/g, ' $1');
};
const ww = s => esc(s).split(' ').map((w, i) => `<span class="ww"><span style="--i:${i}">${w}</span></span>`).join(' ');
const nn = i => String(i).padStart(2, '0');
const href = p => SITE + p;

/* ---------- Zeichen-Helfer (Zeichenfläche 640 × 480) ---------- */
const P = (d, cls = '', j = 0) => `<path class="d ${cls}" d="${d}" pathLength="1" style="--j:${j}"/>`;
const box = (x, y, w, h) => `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
const lab = (x, y, txt, cls = 'l', j = 0, small = '') => `<p class="lb ${cls}" style="left:${(x / 6.4).toFixed(2)}%;top:${(y / 4.8).toFixed(2)}%;--j:${j}">${esc(txt)}${small ? `<small>${esc(small)}</small>` : ''}</p>`;
const svg = (inner, defs = '') => `<svg viewBox="0 0 640 480" aria-hidden="true">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;

/* ---------- Hausskizze (10_Bildwelt/Hausskizze), Linien als Pfade, damit sie sich zeichnen ---------- */
let SKIZZE = '';
async function ladeSkizze() {
  const txt = await (await fetch('img/hausskizze.svg')).text();
  const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
  const lines = [...doc.querySelectorAll('line')].map(l => {
    const g = n => +l.getAttribute(n);
    const c = (l.getAttribute('stroke') || '').toUpperCase(), op = +(l.getAttribute('stroke-opacity') || 1);
    const kind = c === '#FFB200' ? 'gelb' : c === '#444442' ? 'plan' : op < .5 ? 'grund' : 'haus';
    return { d: `M${g('x1')} ${g('y1')}L${g('x2')} ${g('y2')}`, kind, op };
  });
  const ORDER = { grund: 0, plan: 1, haus: 2, gelb: 3 }, START = { grund: 0, plan: 420, haus: 820, gelb: 2500 }, STEP = { grund: 30, plan: 45, haus: 34, gelb: 90 };
  const cnt = { grund: 0, plan: 0, haus: 0, gelb: 0 };
  lines.sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
  SKIZZE = lines.map(l => {
    const i = cnt[l.kind]++;
    const st = l.kind === 'gelb' ? 'stroke:#FFB200;stroke-width:2.4px' : l.kind === 'plan' ? `stroke:currentColor;stroke-opacity:${(l.op * .7).toFixed(2)};stroke-width:1px` : l.kind === 'grund' ? `stroke:currentColor;stroke-opacity:${Math.max(.32, l.op).toFixed(2)};stroke-width:1px` : `stroke:currentColor;stroke-opacity:${l.op.toFixed(2)};stroke-width:1.25px`;
    return `<path class="d sk__${l.kind}" d="${l.d}" pathLength="1" style="${st};--d0:${START[l.kind] + i * STEP[l.kind]}ms;--j:0;transition-duration:${l.kind === 'haus' ? 800 : 700}ms"/>`;
  }).join('');
}
/* Fenster der Skizze als Fläche (Schnittpunkte der vier gelben Striche): im letzten Kapitel brennt dort Licht */
const schnitt = ([a, b], [c, d]) => { const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0], u = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den; return [a[0] + u * r[0], a[1] + u * r[1]]; };
const GL = { u: [[334.7, 254.3], [484.9, 290.1]], r: [[464.7, 307.0], [455.7, 135.4]], o: [[478.5, 161.0], [325.5, 135.5]], l: [[345.6, 117.2], [357.8, 281.3]] };
const FENSTER = [schnitt(GL.o, GL.l), schnitt(GL.o, GL.r), schnitt(GL.u, GL.r), schnitt(GL.u, GL.l)];
const skizze = (labels = '', licht = false) => `<div class="sk"><svg viewBox="0 0 1356 896" aria-hidden="true">${licht ? `<path class="d f" d="M${FENSTER.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L')}Z" style="--d0:2300ms;opacity:0"/>` : ''}${SKIZZE}</svg>${labels}</div>`;
const skLab = (x, y, txt, cls = 'l', d0 = 0) => `<p class="lb ${cls}" style="left:${(x / 13.56).toFixed(2)}%;top:${(y / 8.96).toFixed(2)}%;--d0:${d0}ms">${esc(txt)}</p>`;

/* ---------- 01 Grundstück von oben ---------- */
function figGrund() {
  const M = T.k1.marken;
  const plot = 'M110 120L520 92L560 380L150 410Z';
  const inner = [
    P(plot, '', 0),
    `<g clip-path="url(#cpG)">${['M60 200C210 170 400 240 600 186', 'M60 254C220 222 400 292 600 240', 'M60 310C230 280 410 344 600 296', 'M60 366C240 338 420 396 600 352'].map((d, i) => P(d, 'k', 2 + i)).join('')}</g>`,
    P('M140 146L496 122L530 356L174 382Z', 's', 3),
    P('M0 150H112', '', 4), P('M0 174H115', '', 4), P('M114 162C190 162 250 194 300 222', 's', 5),
    P('M384 238H604', 's k', 7), P('M296 238H40', 's k', 7),
    P('M318 296L250 470', 's', 8), P('M362 296L470 470', 's', 8),
    P(box(292, 270, 96, 26), '', 9),
    P('M300 206H380V270H300Z', 'f', 10),
    P('M600 30V86', '', 11), P('M593 44L600 30L607 44', '', 11),
  ].join('');
  const labels = [
    lab(112, 86, t(M.grund), 'l w', 1), lab(186, 346, t(M.baugrenze), 'l', 3), lab(556, 312, t(M.hang), 'r', 4),
    lab(6, 126, t(M.zufahrt), 'l', 5), lab(604, 214, t(M.morgen), 'r', 7), lab(40, 214, t(M.abend), 'l', 7),
    lab(362, 444, t(M.blick), 'c w', 8), lab(340, 182, t(M.haus), 'c w', 10), lab(600, 92, 'N', 'c w', 11),
  ].join('');
  return `<div class="fig" data-fig>${svg(inner, `<clipPath id="cpG"><path d="${plot}"/></clipPath>`)}${labels}</div>`;
}

/* ---------- 02 Der übliche Weg / Mit GRIFFNER ---------- */
function figWege() {
  const G = T.k2.gewerke, Y = [110, 240, 370], PTS = [...Y.map(y => [84, y]), ...Y.map(y => [556, y])];
  const tr = PTS.map(([x, y], j) => P(box(x - 24, y - 19, 48, 38), 'w', j)).join('');
  const trL = PTS.map(([x, y], j) => lab(x, y + 28, t(G[j]), 'c', j)).join('');
  /* A: du in der Mitte, alle Linien laufen zu dir, und die Gewerke untereinander */
  const a = [
    tr,
    ...PTS.map(([x, y], j) => P(x < 320 ? `M108 ${y}L288 240` : `M532 ${y}L352 240`, '', 6 + j)),
    P('M108 110L532 370', 's k', 12), P('M108 370L532 110', 's k', 12), P('M84 129V221', 's k', 13), P('M84 259V351', 's k', 13),
    P('M556 129V221', 's k', 13), P('M556 259V351', 's k', 13), P('M108 104C220 60 420 60 532 104', 's k', 14),
    P(box(288, 215, 64, 50), 'w', 3),
  ].join('');
  /* B: ein Partner in der Mitte (gelbes Feld), du oben, eine einzige Linie zu dir */
  const b = [
    tr,
    ...PTS.map(([x, y], j) => P(x < 320 ? `M108 ${y}C190 ${y} 204 240 280 240` : `M532 ${y}C450 ${y} 436 240 360 240`, '', 6 + j)),
    P(box(288, 34, 64, 50), 'w', 2), P('M320 84V208', '', 12),
    P('M280 208H360V272H280Z', 'f', 13),
  ].join('');
  return `<div class="fig" data-fig data-wege>
    <div class="wege" role="tablist"><button type="button" role="tab" data-weg="a" class="is-akt">${esc(t(T.k2.weg1))}</button><button type="button" role="tab" data-weg="b">${esc(t(T.k2.weg2))}</button></div>
    <div class="st" data-st="a" style="position:absolute;inset:0">${svg(a)}${trL}${lab(320, 274, t(T.k2.du), 'c w', 4)}</div>
    <div class="st" data-st="b" style="position:absolute;inset:0">${svg(b)}${trL}${lab(362, 50, t(T.k2.du), 'l w', 3)}${lab(320, 284, t(T.k2.partner), 'c w', 14)}</div>
  </div>`;
}

/* ---------- Isometrie ---------- */
const C30 = Math.cos(Math.PI / 6);
const iso = (cx, cy) => (x, y, z) => [cx + (x - y) * C30, cy + (x + y) * .5 - z];
const pts = a => a.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1));
const poly = a => 'M' + pts(a).join('L') + 'Z';
const pl = a => 'M' + pts(a).join('L');

/* ---------- 03 Planungssystem: fünf Ebenen ---------- */
const SCH = { W: 250, D: 170, cx: 166, cy: 235, gap0: 50, gap1: 9 };
function schichtDetails(i, pr, z) {
  const p = (x, y) => pr(x, y, z), W = SCH.W, D = SCH.D;
  const L = (a, cls = 'k') => `<path class="iso-l ${cls}" d="${pl(a.map(([x, y]) => p(x, y)))}"/>`;
  const R = (x, y, w, h, cls = 'k') => `<path class="iso-l ${cls}" d="${poly([p(x, y), p(x + w, y), p(x + w, y + h), p(x, y + h)])}"/>`;
  if (i === 0) return R(14, 14, W - 28, D - 28, '') + L([[110, 14], [110, 96]]) + L([[14, 96], [168, 96]]) + L([[168, 96], [168, D - 14]]) + L([[200, 14], [200, 60]]);
  if (i === 1) return R(30, 28, 62, 22) + R(140, 34, 54, 34) + R(150, 112, 64, 42) + R(22, 120, 80, 12) + R(36, 62, 16, 16);
  if (i === 2) return L([[20, 82], [W - 20, 82]], 's') + L([[124, 18], [124, D - 18]], 's') + L([[60, 82], [60, 140], [100, 140]], 's') + R(16, 76, 10, 10, '') + R(W - 26, 76, 10, 10, '');
  if (i === 3) { let s = ''; for (let x = 0; x <= W; x += 62.5) s += L([[x, 0], [x, D]]); for (let y = 0; y <= D; y += 85) s += L([[0, y], [W, y]]); return s; }
  return R(70, 110, 120, 44) + L([[0, 132], [70, 132]], 's') + R(24, 24, 9, 9, '') + R(46, 40, 9, 9, '') + R(210, 30, 9, 9, '') + R(222, 60, 9, 9, '');
}
function figSchichten() {
  const S = T.k3.schichten;
  const rows = S.map((s, i) => `<g data-sch="${i}" class="isoW" style="transition-delay:${(4 - i) * 140}ms"></g>`).reverse().join('');
  const leaders = S.map((s, i) => `<path class="iso-l" data-lead="${i}" style="stroke-opacity:.5"/>`).join('');
  const labels = S.map((s, i) => `<p class="lb l w" data-slab="${i}" style="--j:${i};--d0:500ms">${nn(i + 1)}&nbsp;&nbsp;${esc(t(s))}</p>`).join('');
  return `<div class="fig" data-fig data-schichten><svg viewBox="0 0 640 480" aria-hidden="true"><g class="isoW" style="transition-delay:700ms">${leaders}</g>${rows}</svg>${labels}<p class="info fig__hin">${esc(t(T.k3.systemT))}</p></div>`;
}
function zeichneSchichten(el, p) {
  const e = p * p * (3 - 2 * p), gap = SCH.gap0 + (SCH.gap1 - SCH.gap0) * e, W = SCH.W, D = SCH.D;
  const pr = iso(SCH.cx, SCH.cy);
  for (let i = 0; i < 5; i++) {
    const z = (4 - i) * gap, g = el.querySelector(`[data-sch="${i}"]`);
    const outline = poly([pr(0, 0, z), pr(W, 0, z), pr(W, D, z), pr(0, D, z)]);
    g.innerHTML = `<path class="iso" d="${outline}"/>${schichtDetails(i, pr, z)}`;
    /* Beschriftung bleibt in ihrer Spalte, die Linie folgt der Ebene */
    const zl = (4 - i) * SCH.gap0, [rx, ry] = pr(W, 0, z), ly = SCH.cy + W * .5 - zl - 6;
    el.querySelector(`[data-lead="${i}"]`).setAttribute('d', `M${(rx + 4).toFixed(1)} ${ry.toFixed(1)}L${(rx + 22).toFixed(1)} ${(ly + 6).toFixed(1)}H388`);
    const lb = el.querySelector(`[data-slab="${i}"]`);
    lb.style.left = (394 / 6.4).toFixed(2) + '%'; lb.style.top = (ly / 4.8).toFixed(2) + '%';
  }
}

/* ---------- 04 Montage: das Haus setzt sich zusammen ---------- */
const HS = { W: 230, D: 150, H: 100, t: 8, cx: 300, cy: 236 };
function quader(pr, [x0, y0, z0, x1, y1, z1], extra = '') {
  const top = poly([pr(x0, y0, z1), pr(x1, y0, z1), pr(x1, y1, z1), pr(x0, y1, z1)]);
  const fx = poly([pr(x1, y0, z0), pr(x1, y1, z0), pr(x1, y1, z1), pr(x1, y0, z1)]);
  const fy = poly([pr(x0, y1, z0), pr(x1, y1, z0), pr(x1, y1, z1), pr(x0, y1, z1)]);
  return `<path class="iso" d="${fx}"/><path class="iso" d="${fy}"/><path class="iso" d="${top}"/>${extra}`;
}
function figMontage() {
  const Tl = T.k4.teile;
  const labels = ['dach', 'decke', 'waende', 'platte', 'fertig'].map(k => `<p class="lb ${k === 'fertig' || k === 'platte' ? 'c' : 'l'}${k === 'fertig' ? ' w' : ''}" data-tl="${k}" style="--d0:400ms">${esc(t(Tl[k][0]))}<small>${esc(t(Tl[k][1]))}</small></p>`).join('');
  return `<div class="fig" data-fig data-montage><svg viewBox="0 0 640 480" aria-hidden="true"><g class="isoW" data-haus></g></svg>${labels}<p class="info fig__hin">${esc(t(T.k4.hinweis))}</p></div>`;
}
function zeichneMontage(el, p) {
  const { W, D, H, t: th, cx, cy } = HS;
  const pr = iso(cx, cy);
  const seg = (a, b) => { const x = Math.min(1, Math.max(0, (p - a) / (b - a))); return 1 - x * x * (3 - 2 * x); }; /* 1 = auseinander, 0 = montiert */
  const eW = 62 * seg(0, .5), eC = 64 * seg(.3, .72), eR = 120 * seg(.48, .95);
  const mv = (b, dx, dy, dz) => [b[0] + dx, b[1] + dy, b[2] + dz, b[3] + dx, b[4] + dy, b[5] + dz];
  const L = (a, cls = 'k') => `<path class="iso-l ${cls}" d="${pl(a)}"/>`;
  /* Boden: ein ruhiges Raster wie das Brett der Journey */
  let grid = '';
  for (let x = -120; x <= W + 120; x += 46) grid += L([pr(x, -120, -14), pr(x, D + 120, -14)]);
  for (let y = -120; y <= D + 120; y += 46) grid += L([pr(-120, y, -14), pr(W + 120, y, -14)]);
  grid = `<g style="opacity:.16">${grid}</g>`;
  const platte = quader(pr, [-12, -12, -14, W + 12, D + 12, 0]);
  const wl = quader(pr, mv([0, 0, 0, th, D, H], -eW, 0, 0));
  const wr = quader(pr, mv([th, 0, 0, W, th, H], 0, -eW, 0));
  /* vordere Wand links (y = D): Fenster und Tür, ein paar Linien der Holzfassade */
  const fy = (x0, z0, x1, z1, dy) => [pr(x0, D + dy, z0), pr(x1, D + dy, z0), pr(x1, D + dy, z1), pr(x0, D + dy, z1)];
  const fl = mv([th, D - th, 0, W - th, D, H], 0, eW, 0);
  let fe = `<path class="iso-l" d="${poly(fy(30, 28, 96, 82, eW))}"/><path class="iso-l" d="${poly(fy(150, 0, 176, 74, eW))}"/>`;
  for (let x = 108; x <= 140; x += 8) fe += L([pr(x, D + eW, 4), pr(x, D + eW, H - 6)]);
  const wf = quader(pr, fl, fe);
  /* vordere Wand rechts (x = W): große Verglasung */
  const fx = (y0, z0, y1, z1, dx) => [pr(W + dx, y0, z0), pr(W + dx, y1, z0), pr(W + dx, y1, z1), pr(W + dx, y0, z1)];
  let ge = `<path class="iso-l" d="${poly(fx(24, 8, 112, 90, eW))}"/>`;
  for (const y of [53, 82]) ge += L([pr(W + eW, y, 8), pr(W + eW, y, 90)]);
  const wx = quader(pr, mv([W - th, th, 0, W, D, H], eW, 0, 0), ge);
  const decke = quader(pr, [0, 0, H + eC, W, D, H + 8 + eC]);
  const dach = quader(pr, [-10, -10, H + 8 + eR, W + 10, D + 10, H + 16 + eR]);
  /* das gelbe Feld: ein Fenster, das Licht hat, sobald alles steht */
  const lit = p > .97 ? `<path class="iso g" d="${poly(fx(30, 14, 52, 84, 0.5))}"/>` : '';
  el.querySelector('[data-haus]').innerHTML = grid + platte + wl + wr + wf + wx + lit + decke + dach;
  /* Beschriftungen: stehen bei ihrem Teil, solange es fliegt */
  const put = (k, pt, vis) => { const n = el.querySelector(`[data-tl="${k}"]`); n.style.left = (pt[0] / 6.4).toFixed(2) + '%'; n.style.top = (pt[1] / 4.8).toFixed(2) + '%'; n.style.opacity = vis; };
  const on = el.classList.contains('on') ? 1 : 0;
  put('dach', [pr(W + 10, -10, H + 16 + eR)[0] + 14, pr(W + 10, -10, H + 16 + eR)[1] - 10], on * Math.min(1, eR / 40));
  put('decke', [pr(W, 0, H + 8 + eC)[0] + 14, pr(W, 0, H + 8 + eC)[1] + 2], on * Math.min(1, eC / 30));
  put('waende', [pr(W + eW, D, H)[0] + 16, pr(W + eW, D, H)[1] - 4], on * Math.min(1, eW / 30));
  const vorn = pr(W + 12, D + 12, -14);
  put('platte', [vorn[0], vorn[1] + 10], on * (p < .9 ? 1 : 0));
  put('fertig', [vorn[0], vorn[1] + 10], on * (p > .96 ? 1 : 0));
  const hin = el.querySelector('.fig__hin'); if (hin) hin.style.opacity = p > .9 ? 0 : '';
}

/* ---------- Seite ---------- */
const kopfK = (i, h) => `<div class="kap__kopf"><p class="info kap__n auf" style="--d:0ms"><b>${nn(i)}</b><span>/ 06</span><span>${esc(t(KAPITEL[i - 1]))}</span></p><h2 class="h2">${ww(t(h))}</h2></div>`;
const ps = arr => arr.map((p, i) => `<p class="txt auf" style="--d:${200 + i * 80}ms">${mk(p)}</p>`).join('');

function markup() {
  const H = T.hero, K1 = T.k1, K2 = T.k2, K3 = T.k3, K4 = T.k4, K5 = T.k5, K6 = T.k6;
  return `
<section class="hero" data-in id="top">
  <div class="hero__txt">
    <p class="info auf" style="--d:0ms"><b>${esc(t(H.info))}</b></p>
    <h1 class="h1">${ww(t(H.h1))}</h1>
    <p class="lead auf" style="--d:500ms">${mk(H.lead)}</p>
    <p class="txt auf" style="--d:650ms">${mk(H.text)}</p>
    <div class="hero__akt auf" style="--d:800ms"><a class="btn" href="${href('/catalogue')}">${esc(t(H.knopf))}</a><a class="lk" href="#k1">${esc(t(H.weiter))}<i></i></a></div>
  </div>
  <div class="hero__fig" data-fig data-skizze>${skizze(skLab(40, 870, t(H.skizze) + '  ·  01', 'l', 3000))}</div>
  <p class="info hero__ort"><span>${esc(t(H.ort))}</span><span>${esc(t(T.meta.entwurf))} · noindex</span></p>
</section>

<section class="kap" id="k1" data-kap="1" data-in>
  ${kopfK(1, K1.h)}
  <div class="kap__fig">${figGrund()}</div>
  <div class="kap__body">
    <p class="lead auf" style="--d:120ms">${mk(K1.lead)}</p>
    ${ps(K1.p)}
    <div class="kurz auf" style="--d:420ms"><p class="info"><i></i>${esc(t(K1.kurzT))}</p><p>${mk(K1.kurz)}</p></div>
  </div>
</section>

<section class="kap" id="k2" data-kap="2" data-in>
  ${kopfK(2, K2.h)}
  <div class="kap__fig">${figWege()}</div>
  <div class="kap__body">
    <p class="lead auf" style="--d:120ms">${mk(K2.lead)}</p>
    <p class="txt auf" style="--d:200ms">${mk(K2.p[0])}</p>
    <p class="txt auf" style="--d:280ms" data-weg-b>${mk(K2.p[1])}</p>
    <p class="satz auf">${mk(K2.satz)}</p>
    <div class="zahlen auf"><p class="info">${esc(t(K2.zahlenT))}</p>${K2.zahlen.map(([z, s]) => `<div class="zahl"><b>${esc(z)}</b><span>${mk(s)}</span></div>`).join('')}</div>
  </div>
</section>

<section class="kap ist-weiss" id="k3" data-kap="3" data-in>
  ${kopfK(3, K3.h)}
  <div class="kap__fig">${figSchichten()}</div>
  <div class="kap__body">
    <p class="lead auf" style="--d:120ms">${mk(K3.lead)}</p>
    ${ps(K3.p)}
    <h3 class="h3 auf" style="margin-top:22px">${esc(t(K3.conceptsH))}</h3>
    <p class="txt auf">${mk(K3.conceptsP)}</p>
    <nav class="cc auf" aria-label="Concepts">${K3.concepts.map(([n, p, s]) => `<a href="${href(p)}"><b>${n}</b><span>${esc(t(s))}</span><i></i></a>`).join('')}</nav>
    <div class="eigen auf"><h3 class="h3">${esc(t(K3.eigenH))}</h3><p class="txt">${mk(K3.eigenP)}</p><a class="lk" href="${href('/projects/eisteich')}">${esc(t(K3.eigenL))}<i></i></a></div>
  </div>
</section>

<section class="kap kap--lang" id="k4" data-kap="4" data-in>
  ${kopfK(4, K4.h)}
  <div class="kap__fig">${figMontage()}</div>
  <div class="kap__body">
    <p class="lead auf" style="--d:120ms">${mk(K4.lead)}</p>
    ${ps(K4.p)}
    <blockquote class="zt auf"><p>${mk(K4.zitat)}</p><span class="info">${esc(t(K4.zitatVon))}</span></blockquote>
  </div>
</section>

<section class="kap kap--foto" id="k5" data-kap="5" data-in>
  ${kopfK(5, K5.h)}
  <div class="kap__body">
    <p class="lead auf" style="--d:120ms">${mk(K5.lead)}</p>
    <p class="txt auf" style="--d:200ms">${mk(K5.p)}</p>
  </div>
  <figure class="foto auf">
    <div class="foto__b"><img src="https://framerusercontent.com/images/Unpl4PriPV66mKCB4Z3z6BNiU.jpg?scale-down-to=2048" alt="${esc(t(K5.alt))}" loading="lazy" decoding="async"></div>
    <p class="foto__m info"><i></i>${esc(t(K5.marke))}</p>
    <figcaption class="info"><span>${esc(t(K5.bild))}</span><span>GRIFFNER</span></figcaption>
  </figure>
  <blockquote class="zt auf"><p>${mk(K5.zitat)}</p><div class="zt__f"><span class="info leise">${esc(t(K5.zitatVon))}</span><a class="lk" href="${href('/projects/waldrand')}">${esc(t(K5.link))}<i></i></a></div></blockquote>
</section>

<section class="kap" id="k6" data-kap="6" data-in>
  ${kopfK(6, K6.h)}
  <div class="kap__fig"><div data-fig data-skizze2>${skizze(skLab(500, 96, t(K6.marken.fenster), 'l', 2900) + skLab(40, 870, t(K6.marken.tag), 'l', 3000), true)}</div></div>
  <div class="kap__body">
    <p class="lead auf" style="--d:120ms">${mk(K6.lead)}</p>
    ${ps(K6.p)}
    <a class="lk auf" href="${href('/journey')}">${esc(t(K6.link))}<i></i></a>
  </div>
</section>

<section class="faq ist-weiss" id="fragen" data-in>
  <div class="faq__kopf"><p class="info auf">${esc(t(T.faq.info))}</p><h2 class="h2">${ww(t(T.faq.h))}</h2></div>
  <div class="faq__l auf">${T.faq.fragen.map(([f, a], i) => `<details${i === 0 ? ' open' : ''}><summary><h3 class="h3">${esc(t(f))}</h3><i></i></summary><p>${mk(a)}</p></details>`).join('')}</div>
</section>

<section class="next" id="katalog" data-in>
  <div class="next__a">
    <span class="feld auf" aria-hidden="true"></span>
    <p class="info auf">${esc(t(T.next.info))}</p>
    <h2 class="h2">${ww(t(T.next.h))}</h2>
    <p class="txt auf leise">${mk(T.next.p)}</p>
    <div class="auf"><a class="btn" href="${href('/catalogue')}">${esc(t(T.next.knopf))}</a></div>
  </div>
  <div class="next__b auf">
    <h3 class="h3">${esc(t(T.next.h2))}</h3>
    <p class="txt">${mk(T.next.p2)}</p>
    <a class="lk" href="${href('/visit')}">${esc(t(T.next.link2))}<i></i></a>
  </div>
</section>

<section class="mehr" data-in>
  <p class="info auf">${esc(t(T.mehr.info))}</p>
  <ul class="auf">${T.mehr.links.map(([n, p, ab]) => ab
    ? `<li><span class="ml"><span class="h3">${esc(t(n))}</span><span class="info ab">${esc(t(ab))}</span><i></i></span></li>`
    : `<li><a href="${href(p)}"><span class="h3">${esc(t(n))}</span><span></span><i></i></a></li>`).join('')}</ul>
</section>

<footer class="fuss"><div data-wm></div><p class="info"><span>Griffen / AT / 46.70 N / 14.73 E</span><span>${esc(t(T.meta.entwurf))}</span></p></footer>

<nav class="lauf" aria-label="Kapitel">${KAPITEL.map((k, i) => `<a href="#k${i + 1}" title="${esc(t(k))}"><span>${nn(i + 1)}</span><i><b></b></i></a>`).join('')}</nav>`;
}

/* ---------- Ablauf ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
async function start() {
  document.documentElement.lang = L ? 'en' : 'de';
  document.title = t(T.meta.title) + ' (Entwurf)';
  await ladeSkizze();
  const main = document.querySelector('[data-seite]');
  main.innerHTML = markup();
  document.querySelectorAll('.kopf__sp a').forEach(a => a.classList.toggle('is-akt', (a.dataset.l === 'en') === !!L));
  fetch('img/wortmarke.svg').then(r => r.text()).then(s => { document.querySelector('[data-wm]').innerHTML = s.replace(/fill="#fff"/gi, 'fill="#FFB200"').replace('<svg ', '<svg style="display:block;width:100%;height:auto" '); });

  const sch = main.querySelector('[data-schichten]'), mon = main.querySelector('[data-montage]'), weg = main.querySelector('[data-wege]');
  zeichneSchichten(sch, 0); zeichneMontage(mon, 0);

  /* Hereinkommen: Überschriften, Absätze, Zeichnungen */
  const seen = el => el.classList.add(el.matches('[data-fig]') ? 'on' : 'is-in');
  if (REDUCE) { main.querySelectorAll('[data-in],.auf,[data-fig]').forEach(seen); }
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { seen(e.target); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -12% 0px' });
    main.querySelectorAll('.auf,.h1,.h2').forEach(el => io.observe(el));
    const iof = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { seen(e.target); iof.unobserve(e.target); } }), { threshold: .3 });
    main.querySelectorAll('[data-fig]').forEach(el => iof.observe(el));
  }

  /* 02: Umschalter, von Hand oder beim Scrollen */
  let wegHand = false, wegAkt = 'a';
  const setWeg = w => {
    if (w === wegAkt && weg.querySelector(`[data-st="${w}"]`).classList.contains('on')) return;
    wegAkt = w;
    weg.querySelectorAll('[data-st]').forEach(s => s.classList.toggle('on', s.dataset.st === w && weg.classList.contains('on')));
    weg.querySelectorAll('[data-weg]').forEach(b => { b.classList.toggle('is-akt', b.dataset.weg === w); b.setAttribute('aria-selected', b.dataset.weg === w); });
  };
  weg.querySelectorAll('[data-weg]').forEach(b => b.addEventListener('click', () => { wegHand = true; setWeg(b.dataset.weg); }));
  new MutationObserver(() => { if (weg.classList.contains('on')) { weg.querySelector(`[data-st="${wegAkt}"]`).classList.add('on'); } }).observe(weg, { attributes: true, attributeFilter: ['class'] });

  /* Scroll: Ebenen, Montage, Umschalter, Kapitel-Leiste */
  const kaps = [...main.querySelectorAll('[data-kap]')];
  const lauf = main.querySelector('.lauf'), laufA = [...lauf.querySelectorAll('a')];
  const mob = () => innerWidth < 810;
  let lastS = -1, lastM = -1;
  const frame = () => {
    const vh = innerHeight;
    const prog = sec => { const r = sec.getBoundingClientRect(); return clamp((vh * .5 - r.top) / r.height); };
    const figP = (fig, sec, a, b) => {
      if (mob()) { const r = fig.getBoundingClientRect(); return clamp((vh - r.bottom) / Math.max(1, vh * .86 - r.height)); }
      const r = sec.getBoundingClientRect(); return clamp((-r.top + vh * a) / (r.height - vh * b));
    };
    const ps3 = REDUCE ? 0 : figP(sch, kaps[2], .05, .95), pm4 = REDUCE ? 1 : figP(mon, kaps[3], .1, 1.05);
    if (Math.abs(ps3 - lastS) > .001) { zeichneSchichten(sch, ps3); lastS = ps3; }
    if (Math.abs(pm4 - lastM) > .001 || mon.dataset.on !== String(mon.classList.contains('on'))) { mon.dataset.on = String(mon.classList.contains('on')); zeichneMontage(mon, pm4); lastM = pm4; }
    if (!wegHand && weg.classList.contains('on')) {
      const r = weg.getBoundingClientRect();
      const pb = kaps[1].querySelector('[data-weg-b]').getBoundingClientRect();
      const w = mob() ? (r.top < vh * .3 ? 'b' : 'a') : (pb.top < vh * .62 ? 'b' : 'a');
      setWeg(w);
    }
    /* Leiste */
    const f = kaps[0].getBoundingClientRect(), l = kaps[5].getBoundingClientRect();
    lauf.classList.toggle('is-an', f.top < vh * .5 && l.bottom > vh * .6);
    let akt = -1;
    kaps.forEach((k, i) => { const r = k.getBoundingClientRect(); const p = clamp((vh * .5 - r.top) / r.height); laufA[i].querySelector('b').style.transform = `scaleX(${p.toFixed(3)})`; if (r.top <= vh * .5 && r.bottom > vh * .5) akt = i; });
    laufA.forEach((a, i) => a.classList.toggle('is-akt', i === akt));
    const unter = document.elementsFromPoint(innerWidth - 60, vh - 30).find(n => n.matches && n.matches('section,footer'));
    lauf.classList.toggle('is-hell', !!(unter && unter.classList.contains('ist-weiss')));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  /* Sprung zum Kapitel nach dem Sprachwechsel */
  try { const s = sessionStorage.getItem('ah-y'); if (s) { scrollTo(0, +s); sessionStorage.removeItem('ah-y'); } } catch {}
  document.querySelectorAll('.kopf__sp a').forEach(a => a.addEventListener('click', () => { try { sessionStorage.setItem('ah-y', String(scrollY)); } catch {} }));
}
start();
