/* DIE IDEE und VOM VOLUMEN ZUM HAUS, aus dem Entwurf des Kunden (GRIFFNER Concept.dc.html), auf house3d.js umgestellt.
   Die Skizze entsteht aus denselben Maßen wie das 3D Modell: sichtbare Kanten der Baukörper, Fensterbänder, Bodenlinie.
   So bekommt jedes neue Concept seine Strichzeichnung, ohne dass jemand sie zeichnen muss. */
import { $, $$, E, seg, lerp, prog, loop, reduce } from './core.js';

let M, VS, vH, D, I, skI, skO, ovSig = '', booted = false, WP, STEPS;
const f2 = v => v.toFixed(2);

/* Sichtbare Kanten als Linien in 3D, c = Kamerapunkt */
function segs(P, c) {
  const out = [], L = (a, b) => out.push([a, b]), ext = P.slope * 1.86;
  const Lm = Math.max(P.L0, P.L1 * P.up), sx = P.sx * P.up;
  const vis = (cc, h, ax, s) => s * (c[ax] - (cc[ax] + s * h[ax])) > 0;
  const box = (cc, h) => {
    for (let a = 0; a < 3; a++) {
      const b = (a + 1) % 3, d = (a + 2) % 3;
      for (const sb of [-1, 1]) for (const sd of [-1, 1]) {
        if (!vis(cc, h, b, sb) && !vis(cc, h, d, sd)) continue;
        const p0 = [0, 0, 0], p1 = [0, 0, 0];
        p0[a] = cc[a] - h[a]; p1[a] = cc[a] + h[a]; p0[b] = p1[b] = cc[b] + sb * h[b]; p0[d] = p1[d] = cc[d] + sd * h[d];
        L(p0, p1);
      }
    }
  };
  L([-Lm * .95 + Math.min(0, sx), 0, P.D / 2 + 2.6], [Lm * .95 + Math.max(0, sx), 0, P.D / 2 + 2.6]);
  const H0 = P.H1 + ext;
  box([0, H0 / 2, 0], [P.L0 / 2, H0 / 2, P.D / 2]);
  const H2 = P.H2 * P.up;
  if (H2 > .05) box([sx, H0 + H2 / 2, 0], [P.L1 / 2, H2 / 2, P.D / 2]);
  if (c[2] > P.D / 2) {
    const z = P.D / 2;
    const band = (n, len, x0, yc, h, amt) => {
      if (amt < .02) return;
      const span = len * .84 * amt, wd = span / n * .78;
      for (let i = 0; i < n; i++) {
        const x = x0 - span / 2 + span / n * (i + .5), a = x - wd / 2, b = x + wd / 2, y0 = yc - h / 2, y1 = yc + h / 2;
        L([a, y0, z], [b, y0, z]); L([b, y0, z], [b, y1, z]); L([b, y1, z], [a, y1, z]); L([a, y1, z], [a, y0, z]); L([x, y0, z], [x, y1, z]);
      }
    };
    band(3, P.L0, 0, ext + P.H1 * .44, P.H1 * .7, P.gl);
    if (H2 > .05) band(3, P.L1, sx, H0 + H2 * .5, H2 * .6, P.gu);
  }
  return out;
}
const svgLines = (L, col, sw) => L.map(([a, b]) => `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}" stroke="${col}" stroke-width="${sw}" vector-effect="non-scaling-stroke" stroke-linecap="square" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"></line>`).join('');

/* Skizze in eine Fläche einpassen, eigene Kamera */
function sketchFit(host, P, o) {
  const T = M.T, A = Math.max(.5, (host.clientWidth || 1) / (host.clientHeight || 1));
  const cam = new T.PerspectiveCamera(o.fov || 28, A, .5, 900), ty = o.ty ?? 3;
  const c = [Math.sin(o.az) * Math.cos(o.el) * o.dist, ty + Math.sin(o.el) * o.dist, Math.cos(o.az) * Math.cos(o.el) * o.dist];
  cam.position.set(c[0], c[1], c[2]); cam.lookAt(0, ty, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const W = 1000 * A, H = 1000, v = new T.Vector3();
  const pr = p => { v.set(p[0], p[1], p[2]).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
  const L = segs(P, c).map(([a, b]) => [pr(a), pr(b)]);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  L.forEach(s => s.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
  const pd = Math.max(x1 - x0, y1 - y0) * .03, end = L[0][1];
  host.innerHTML = `<svg viewBox="${f2(x0 - pd)} ${f2(y0 - pd)} ${f2(x1 - x0 + 2 * pd)} ${f2(y1 - y0 + 2 * pd)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${svgLines(L, o.col, o.sw || 1.2)}<circle data-end cx="${f2(end[0])}" cy="${f2(end[1])}" r=".01" fill="none"></circle></svg>`;
  return { lines: $$('line', host), end: $('[data-end]', host) };
}
/* Striche nacheinander, jeder braucht ein Fünftel der Zeit */
function draw(sk, k) {
  if (!sk) return; const n = sk.lines.length;
  sk.lines.forEach((l, i) => { const a = i / n * .8; l.style.strokeDashoffset = (1 - E(k, a, a + .2)).toFixed(4); });
}

export function initIdee() {
  I = { el: $('#w-idee'), host: $('[data-sk-idee]'), text: $('[data-idee-text]'), dock: $('[data-idee-dock]') };
  D = { el: $('#w-vol'), host: $('[data-vol-gl]'), ov: $('[data-vol-sk]'), steps: $$('[data-vol-step]'), n: $('[data-vol-n]'), dock: $('[data-vol-dock]') };
  if (!I.el) return;
  /* Vom Volumen zum Haus ist seit Runde 5 von der Seite genommen; der Code bleibt, falls der Abschnitt zurückkommt */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !booted) { booted = true; io.disconnect(); boot(); } }), { rootMargin: '600px 0px' });
  io.observe(I.el); if (D.el) io.observe(D.el);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { refit(); loop.poke(); }, 140); });
  loop.add({ tick });
}

async function boot() {
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); return; }
  /* Form des Concepts dieser Seite (data-form an #w-idee, aus content.js) */
  WP = { ...(M.CONCEPTS[(I.el && I.el.dataset.form) || 'wald'] || M.CONCEPTS.wald) };
  /* Vier Formen, die fünfte Stufe ist die Skizze */
  STEPS = [
    { ...M.CONCEPTS.block, L0: 16, D: 9, H1: 6.2, L1: 16, H2: 0, tone: 0 },
    { ...WP, L0: 16, L1: 16, sx: -1, gl: 0, gu: 0 },
    { ...WP, gl: 0, gu: 0 },
    WP
  ];
  if (!D.host) { refit(); loop.poke(); return; }
  VS = M.createStage(D.host, { bg: 0xFFFFFF, fov: 26, shadow: .16, key: 2, hemi: .95, fogNear: 260, fogFar: 600 });
  vH = VS.house({ line: 0x000000 }); vH.set(STEPS[0]); vH.ghost = 1;
  VS.onResize = () => { ovSig = ''; loop.poke(); };
  refit();
  loop.poke();
}

function refit() {
  if (!M) return;
  skI = sketchFit(I.host, WP, { az: -.55, el: .3, dist: 60, ty: 3, col: '#000000', sw: innerWidth < 760 ? 1 : 1.3 });
  ovSig = '';
}

function tick() {
  if (!I) return;
  if (prog(I.el).on) idee();
  if (D.el && prog(D.el).on) vol();
}

function idee() {
  const { p } = prog(I.el), k = reduce ? 1 : seg(p, .04, .62);
  draw(skI, k);
  const t = reduce ? 1 : E(p, .58, .72);
  I.text.style.opacity = t.toFixed(3); I.text.style.transform = `translateY(${((1 - t) * 24).toFixed(1)}px)`;
  /* Connector landet am Ende der Bodenlinie, sobald die Zeichnung fertig ist */
  if (skI && skI.end && k > .97) {
    const r = skI.end.getBoundingClientRect(), par = I.dock.parentElement, pr = par.getBoundingClientRect();
    /* im Satzspiegel halten: am Telefon endet die Bodenlinie fast am Bildschirmrand (2026-11-05) */
    const cs = getComputedStyle(par), hb = (I.dock.offsetWidth || 0) / 2;
    const lo = (parseFloat(cs.paddingLeft) || 0) + hb, hi = pr.width - (parseFloat(cs.paddingRight) || 0) - hb;
    const x = Math.min(Math.max(r.left - pr.left, lo), Math.max(lo, hi));
    I.dock.style.left = x.toFixed(1) + 'px'; I.dock.style.top = (r.top - pr.top).toFixed(1) + 'px'; delete I.dock.dataset.dockHide;
  } else I.dock.dataset.dockHide = '1';
}

function vol() {
  const { p } = prog(D.el), t = [0, .18, .36, .54, .74];
  let act = 0; t.forEach((v, i) => { if (p >= v) act = i; });
  D.steps.forEach((s, i) => { s.style.opacity = i === act ? '1' : i < act ? '.32' : '.14'; s.classList.toggle('is-cur', i === act); });
  D.n.textContent = `0${act + 1} / 05`;
  if (!VS) return;
  let P = { ...STEPS[0] };
  for (let i = 1; i < 4; i++) P = M.mix(P, STEPS[i], E(p, t[i] - .09, t[i]));
  vH.set(P);
  const narrow = innerWidth < 760, az = lerp(-.62, .42, E(p, 0, .72));
  /* Hochformat: so weit zurück, dass das ganze Haus in die Breite passt */
  const A = (D.host.clientWidth || 1) / (D.host.clientHeight || 1);
  VS.orbit(az, .3, 62 * (narrow ? Math.max(1.45, .8 / A) : 1), narrow ? 0 : 1.3, innerHeight < 760 ? -3.4 : -1.6, 0);
  const fade = E(p, .74, .8);
  D.host.style.opacity = (1 - fade).toFixed(3);
  VS.render();
  /* Connector auf der oberen Ecke des Obergeschoßes, solange das Modell steht */
  if (p > .06 && p < .72) {
    const q = VS.project(P.sx * P.up + P.L1 / 2, P.H1 + P.H2 * P.up, P.D / 2);
    D.dock.style.left = q.x.toFixed(1) + 'px'; D.dock.style.top = q.y.toFixed(1) + 'px'; delete D.dock.dataset.dockHide;
  } else D.dock.dataset.dockHide = '1';
  /* Am Ende: dieselbe Kamera, die Kanten werden zur Strichzeichnung */
  if (p > .7) {
    const c = VS.cam.position, w = D.ov.clientWidth, h = D.ov.clientHeight, sig = `${w}x${h}:${az.toFixed(3)}`;
    if (sig !== ovSig) {
      ovSig = sig;
      const Lr = segs(WP, [c.x, c.y, c.z]).map(([a, b]) => { const q0 = VS.project(a[0], a[1], a[2]), q1 = VS.project(b[0], b[1], b[2]); return [[q0.x, q0.y], [q1.x, q1.y]]; });
      D.ov.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${svgLines(Lr, '#000000', narrow ? 1 : 1.3)}</svg>`;
      skO = { lines: $$('line', D.ov) };
    }
    draw(skO, seg(p, .76, .96));
  } else if (skO) draw(skO, 0);
}

export { segs, sketchFit, draw };
