/* DIE IDEE und VOM VOLUMEN ZUM HAUS, aus dem Entwurf des Kunden (GRIFFNER Concept.dc.html), auf house3d.js umgestellt.
   Die Skizze entsteht aus denselben Maßen wie das 3D Modell: sichtbare Kanten der Baukörper, Fensterbänder, Bodenlinie.
   So bekommt jedes neue Concept seine Strichzeichnung, ohne dass jemand sie zeichnen muss. */
import { $, $$, E, seg, lerp, prog, loop, reduce } from './core.js';

let M, VS, vH, D, I, skI, skO, ovSig = '', booted = false, WP, STEPS;
const f2 = v => v.toFixed(2);

/* Sichtbare Kanten als Linien in 3D, c = Kamerapunkt.
   Runde 30 (Kundenwunsch: die Zeichnung wie das Modell in der Sammlung): die Körper kommen aus house3d.js shape(), also auch
   Satteldach (Calm), Vordach (Light) und die Loggia im Giebel (Free). Verdeckte Kanten fallen weg: jede Kante wird in kurzen
   Schritten gegen alle Körper geprüft, nur was man vom Kamerapunkt aus sieht, wird gezeichnet. */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function faceN(V, f) {
  const n = [0, 0, 0];
  f.forEach((i, k) => { const a = V[i], b = V[f[(k + 1) % f.length]]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); });
  const l = Math.hypot(n[0], n[1], n[2]) || 1; return n.map(v => v / l);
}
function segs(P, c) {
  const { solids, glass } = M.shape(P);
  const Lm = Math.max(P.L0, P.L1 * P.up), sx = P.sx * P.up;
  const raw = [[[-Lm * .95 + Math.min(0, sx), 0, P.D / 2 + 2.6], [Lm * .95 + Math.max(0, sx), 0, P.D / 2 + 2.6]]];
  /* Ebenen jedes Körpers, Normalen nach außen */
  const PL = solids.map(s => {
    const cen = [0, 1, 2].map(j => s.V.reduce((t, v) => t + v[j], 0) / s.V.length);
    return s.F.map(f => { let n = faceN(s.V, f); const v0 = s.V[f[0]]; if (dot(n, sub(v0, cen)) < 0) n = n.map(v => -v); return { n, d: dot(n, v0), f }; });
  });
  /* Kanten, an denen mindestens eine zugewandte Fläche liegt */
  solids.forEach((s, si) => {
    const E = new Map();
    PL[si].forEach(({ n, f }) => {
      const vis = dot(n, sub(c, s.V[f[0]])) > 1e-6;
      f.forEach((i, k) => { const j = f[(k + 1) % f.length], key = i < j ? i + ',' + j : j + ',' + i; const e = E.get(key) || [i, j, false]; e[2] = e[2] || vis; E.set(key, e); });
    });
    E.forEach(([i, j, v]) => { if (v) raw.push([s.V[i], s.V[j]]); });
  });
  glass.forEach(g => raw.push(g));
  /* Verdeckt: der Strahl vom Auge zum Punkt geht vorher durch einen Körper */
  const hidden = p => {
    const dv = sub(p, c), len = Math.hypot(dv[0], dv[1], dv[2]) || 1, tmax = 1 - .03 / len;
    for (const pl of PL) {
      let t0 = 0, t1 = tmax, ok = true;
      for (const { n, d } of pl) {
        const den = dot(n, dv), num = d - dot(n, c);
        if (Math.abs(den) < 1e-9) { if (num < 0) { ok = false; break; } continue; }
        const t = num / den;
        if (den < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
        if (t0 > t1) { ok = false; break; }
      }
      if (ok && t1 - t0 > 1e-4) return true;
    }
    return false;
  };
  const out = [];
  raw.forEach(([a, b]) => {
    const n = Math.max(6, Math.ceil(Math.hypot(...sub(b, a)) / .18));
    let run = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], vis = !hidden(q);
      if (vis) { if (run) run[1] = q; else run = [q, q]; }
      if ((!vis || i === n) && run) { if (Math.hypot(...sub(run[1], run[0])) > .04) out.push(run); run = null; }
    }
  });
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
  if (!I.dock) return; /* Runde 12: die Hausseiten haben an der Skizze kein gelbes Feld mehr */
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
