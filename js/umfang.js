/* Services Leistungsumfang (Runde 49): die Teile der Seite als Funktionen, damit Framer sie je Sektion einzeln starten kann
   (framer/src/umfang-entry.js). Die Seite selbst startet sie in js/leistungsumfang.js. */
import { loop, $, $$, reduce, clamp } from './core.js';
import { initFolge } from './svc-ui.js';
import { ACHT } from '../data/leistungen.js';

/* lädt, sobald der Bereich 900 px vor dem Bild ist */
export function near(el, fn, margin = '900px 0px') {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin });
  io.observe(el);
}

/* ---------- 00 Auftakt (Runde 61, Kunde: erste Sektion des Entwurfs „GRIFFNER Projektumfang“ statt des Heros) ----------
   Gepinnt. Rechts die Zeichnung des Entwurfs (Grundstück, Haus, Ausbau, isometrisch, Linien zeichnen sich beim Laden), darum die
   Hilfslinien des alten Heros (durch die Kanten der Zeichnung über die ganze Fläche, gepunktete Mitte, vier Eckstriche, die sich gerade ziehen).
   Beim Scrollen: der Einstieg geht, das Haus hebt ab (Ausbau darunter), „So setzt sich dein Projekt zusammen“ kommt mit drei Teilen;
   der aktuelle Teil ist gelb in der Zeichnung, Rund ums Haus wächst Teil für Teil aufs Grundstück. Die Teile springen zu ihren Sektionen. */
const SVN = 'http://www.w3.org/2000/svg', cl = x => clamp(x);
let GEO = null;
function uaGeo() {
  if (GEO) return GEO;
  const S = 14, C = .866, N = .5; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const B = (X, Y) => { if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; };
  const Pn = (x, y, z) => { const X = (x - z) * C * S, Y = ((x + z) * N - y) * S; B(X, Y); return [X, Y]; };
  const P = (x, y, z) => Pn(x, y, z).map(v => v.toFixed(1)).join(' ');
  const pl = (pts, f) => ({ d: 'M' + pts.map(p => P(...p)).join('L') + 'Z', f: f || 'none' });
  const ln = (...pts) => ({ d: 'M' + pts.map(p => P(...p)).join('L'), f: 'none' });
  const box = (a, b, c, d, e, g) => [pl([[a, e, c], [d, e, c], [d, e, g], [a, e, g]], '#000'), pl([[a, b, g], [d, b, g], [d, e, g], [a, e, g]], '#000'), pl([[d, b, c], [d, b, g], [d, e, g], [d, e, c]], '#000')];
  const flat = (a, c, d, g, f) => pl([[a, 0, c], [d, 0, c], [d, 0, g], [a, 0, g]], f);
  const circ = (cx, cz, r) => { const p = []; for (let i = 0; i < 32; i++) { const t = i / 32 * Math.PI * 2; p.push([cx + Math.cos(t) * r, 0, cz + Math.sin(t) * r]); } return pl(p); };
  const ball = (cx, cy, cz, r) => { const [X, Y] = Pn(cx, cy, cz), R = r * S; B(X - R, Y - R); B(X + R, Y + R); return { d: `M${(X - R).toFixed(1)} ${Y.toFixed(1)}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z`, f: '#000' }; };
  const tree = (cx, cz, r, h) => ({ id: 'garten', c: cx + cz, p: [circ(cx, cz, r * .8), ln([cx, 0, cz], [cx, h - r * .6, cz]), ball(cx, h, cz, r)] });
  const fence = (a, b) => { const p = [ln([a[0], 1.1, a[1]], [b[0], 1.1, b[1]]), ln([a[0], .55, a[1]], [b[0], .55, b[1]])]; const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2); for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; p.push(ln([x, 0, z], [x, 1.25, z])); } return p; };
  const plot = { id: 'plot', c: -1, p: [flat(0, 0, 32, 24)] };
  const items = [
    { id: 'zaun', c: 16, p: fence([0, 0], [32, 0]) }, { id: 'zaun', c: 12, p: fence([0, 0], [0, 24]) }, { id: 'zaun', c: 48, p: fence([32, 0], [32, 24]) },
    { id: 'zufahrt', c: 20, p: [flat(2, 9, 6, 24), ...[10.5, 12, 13.5, 15, 16.5, 18, 19.5, 21, 22.5].map(z => ln([2, 0, z], [6, 0, z]))] },
    { id: 'garage', c: 9.5, p: [...box(1, 0, 2, 7, 2.8, 9), pl([[1.6, 0, 9], [6.4, 0, 9], [6.4, 2.3, 9], [1.6, 2.3, 9]]), ln([1.6, .77, 9], [6.4, .77, 9]), ln([1.6, 1.53, 9], [6.4, 1.53, 9])] },
    { id: 'terrasse', c: 33, p: [flat(9, 16, 23, 18.2), ...[16.55, 17.1, 17.65].map(z => ln([9, 0, z], [23, 0, z]))] },
    { id: 'pool', c: 38.2, p: [flat(13, 18.8, 23, 22), flat(13.45, 19.25, 22.55, 21.55), ln([15, 0, 20], [17.5, 0, 20]), ln([18.5, 0, 20.8], [21, 0, 20.8])] },
    { id: 'sauna', c: 46.5, p: [...box(26, 0, 17, 29.5, 2.4, 20.5), pl([[26.6, .9, 20.5], [28.6, .9, 20.5], [28.6, 1.9, 20.5], [26.6, 1.9, 20.5]])] },
    tree(27.5, 4.5, 2.2, 5.2), tree(30, 10.5, 1.5, 4), tree(3.5, 14, 1.8, 4.4), tree(9, 21.6, 1.3, 3.4), tree(30.6, 22.2, 1.2, 3.2)
  ].sort((a, b) => a.c - b.c);
  const aus = [...box(9, 0, 7, 23, .3, 16), ...box(9, .3, 7, 23, 1.9, 7.25), ...box(9, .3, 7.25, 9.25, 1.9, 16), ...box(10, .3, 7.25, 15, 1.2, 8.1), ...box(20, .3, 7.6, 22.6, .9, 9.4),
    ...box(17, .3, 7.25, 17.2, 1.9, 11.4), ...box(19.4, .3, 11.2, 23, 1.9, 11.4), ...box(13, .3, 9.6, 16, 1.2, 10.6), ...box(13.6, .95, 12.4, 16.6, 1.05, 14.2),
    ...box(10, .3, 12.6, 11, .95, 15.6), ...box(11, .3, 14.6, 14.2, .95, 15.6)];
  for (let i = 7; i >= 0; i--) aus.push(...box(20.4, .3, 15.5 - i * .5, 22.4, .3 + (i + 1) * .36, 16 - i * .5));
  const shell = [...box(9, 0, 7, 23, 3.2, 16), pl([[10.5, .3, 16], [21.5, .3, 16], [21.5, 2.9, 16], [10.5, 2.9, 16]]), ln([14.2, .3, 16], [14.2, 2.9, 16]), ln([17.8, .3, 16], [17.8, 2.9, 16]),
    pl([[23, .3, 8.5], [23, .3, 13.5], [23, 2.9, 13.5], [23, 2.9, 8.5]]),
    ...box(12, 3.2, 6, 25, 6.2, 14), pl([[12.35, 6.2, 6.35], [24.65, 6.2, 6.35], [24.65, 6.2, 13.65], [12.35, 6.2, 13.65]]),
    pl([[13, 3.9, 14], [24, 3.9, 14], [24, 5.7, 14], [13, 5.7, 14]]), ln([16.7, 3.9, 14], [16.7, 5.7, 14]), ln([20.3, 3.9, 14], [20.3, 5.7, 14]),
    ...[7.2, 8.4, 9.6, 10.8, 12, 13.2].map(z => ln([25, 3.2, z], [25, 6.2, z]))];
  const pad = 24;
  return GEO = { S, ground: [plot, ...items], aus, shell, vb: [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad] };
}
/* Sprung auf griffner.com über SmoothScroll (Lenis), im Prototyp weich */
function jumpTo(id) {
  const el = document.getElementById(id); if (!el) return;
  const y = el.getBoundingClientRect().top + scrollY, g = globalThis;
  if (g.__griffnerJump) g.__griffnerJump(y); else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}
export function initAuftakt() {
  const r = $('[data-ua]'); if (!r) return;
  const st = $('.ua__st', r), svg = $('[data-ua-svg]', r), plan = $('[data-ua-plan]', r), draw = $('[data-ua-draw]', r);
  const he = $('[data-ua-hero]', r), pe = $('[data-ua-panel]', r), steps = $$('[data-ua-step]', r);
  const G = uaGeo(), S = G.S;
  const pth = p => `<path d="${p.d}" fill="${p.f}" pathLength="1" vector-effect="non-scaling-stroke"></path>`;
  svg.innerHTML = '<g data-layer="ground">' + G.ground.map(it => `<g data-gi="${it.id}" style="transform-box:fill-box;transform-origin:50% 100%">${it.p.map(pth).join('')}</g>`).join('') + '</g>' +
    `<g data-layer="aus">${G.aus.map(pth).join('')}</g><g data-layer="shell">${G.shell.map(pth).join('')}</g>`;
  const H = { aus: $('[data-layer="aus"]', svg), shell: $('[data-layer="shell"]', svg), items: $$('[data-gi]', svg), vb: '' };
  [H.aus, H.shell, ...H.items].forEach(g => { g.style.transition = 'stroke 500ms cubic-bezier(.2,.7,.2,1)'; });
  /* Linien zeichnen sich beim Laden: Grundstück, dann Ausbau, dann Haus */
  if (!reduce) {
    const ps = $$('path', svg); ps.forEach(p => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
    requestAnimationFrame(() => requestAnimationFrame(() => ps.forEach(p => { const L = p.closest('[data-layer]').dataset.layer; p.style.transition = 'stroke-dashoffset 1800ms cubic-bezier(.2,.7,.2,1) ' + (L === 'ground' ? 250 : L === 'aus' ? 450 : 700) + 'ms'; p.style.strokeDashoffset = '0'; })));
  }
  /* Hilfslinien wie im alten Hero (js/svc-plan.js), hier durch die Kanten der Zeichnung */
  const ln = cls => { const l = document.createElementNS(SVN, 'line'); l.setAttribute('class', cls); plan.appendChild(l); return l; };
  const gl = ['g', 'g', 'g', 'g', 'g dot'].map(ln), sk = ['s', 's', 's', 's'].map(ln);
  const jit = [[-2.1, -6, 4], [1.8, 5, -7], [-1.4, 7, 6], [2.4, -5, -4]];
  const t0 = performance.now() + 200;
  const set = (l, a, b, c, d) => { l.setAttribute('x1', a.toFixed(1)); l.setAttribute('y1', b.toFixed(1)); l.setAttribute('x2', c.toFixed(1)); l.setAttribute('y2', d.toFixed(1)); };
  const eioP = x => (x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2), eoP = x => 1 - Math.pow(1 - x, 3);
  let lastKey = '';
  function guides(rect, W, Hh, T, fade) {
    const { l, t, r: rr, b } = rect, ov = Math.max(14, (rr - l) * .06), key = [l, t, rr, b, W, Hh, Math.round(T * 60), fade.toFixed(2)].map(v => Math.round(v)).join(',');
    if (key === lastKey) return; lastKey = key;
    plan.setAttribute('viewBox', `0 0 ${W} ${Hh}`); plan.style.opacity = fade.toFixed(3);
    const g = [[0, t, W, t], [W, b, 0, b], [l, Hh, l, 0], [rr, 0, rr, Hh], [0, (t + b) / 2, W, (t + b) / 2]];
    gl.forEach((e, i) => { const k = reduce ? 1 : eioP(cl((T - .1 - i * .12) / 1.1)), q = g[i]; set(e, q[0], q[1], q[0] + (q[2] - q[0]) * k, q[1] + (q[3] - q[1]) * k); });
    const s = [[l - ov, t, rr + ov, t], [rr, t - ov, rr, b + ov], [rr + ov, b, l - ov, b], [l, b + ov, l, t - ov]];
    sk.forEach((e, i) => { const k = reduce ? 1 : eoP(cl((T - .55 - i * .14) / .9)), sv = reduce || nwPrev ? 1 : eioP(cl((T - 1.75) / .8)), q = s[i], j = jit[i];
      set(e, q[0], q[1], q[0] + (q[2] - q[0]) * k, q[1] + (q[3] - q[1]) * k);
      const cx = (q[0] + q[2]) / 2, cy = (q[1] + q[3]) / 2;
      e.setAttribute('transform', `translate(${(j[1] * (1 - sv)).toFixed(2)} ${(j[2] * (1 - sv)).toFixed(2)}) rotate(${(j[0] * (1 - sv)).toFixed(3)} ${cx.toFixed(1)} ${cy.toFixed(1)})`); });
  }
  const Y = '#FFB200', DIM = '#6e6e6b', W8 = '#FFFFFF';
  const setS = (el, c) => { if (el._s !== c) { el._s = c; el.style.stroke = c; } };
  const ORD = ['zufahrt', 'garage', 'terrasse', 'pool', 'sauna', 'zaun', 'garten'];
  let nwPrev = null, stepPrev = '';
  r.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-jump]'); if (b && r.contains(b)) { e.preventDefault(); jumpTo(b.dataset.jump); } });
  loop.add({ tick(now) {
    const fb = r.getBoundingClientRect(), vh = innerHeight;
    const T = ((now || performance.now()) - t0) / 1000;
    if (fb.bottom < -50 || fb.top > vh + 50) return;
    const nw = innerWidth < 900; if (nw !== nwPrev) { nwPrev = nw; lastKey = ''; }  // Telefonlayout kommt aus dem CSS (max-width:899px)
    const sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
    const p = cl(-fb.top / Math.max(1, fb.height - vh)), hero = 1 - sm((p - .05) / .07), e = sm((p - .1) / .16), pan = sm((p - .17) / .06);
    const step = p < .47 ? 0 : p < .69 ? 1 : 2, L = 12 * S, A = 5.5 * S;
    he.style.opacity = hero.toFixed(3); he.style.transform = `translate3d(0,${(-(1 - hero) * 40).toFixed(1)}px,0)`; he.style.pointerEvents = hero > .5 ? 'auto' : 'none'; he.style.visibility = hero < .01 ? 'hidden' : 'visible';
    pe.style.opacity = pan.toFixed(3); pe.style.transform = `translate3d(0,${((1 - pan) * 24).toFixed(1)}px,0)`; pe.style.pointerEvents = pan > .5 ? 'auto' : 'none'; pe.style.visibility = pan < .01 ? 'hidden' : 'visible';
    H.shell.style.transform = `translate(0px,${(-L * e).toFixed(1)}px)`; H.aus.style.transform = `translate(0px,${(-A * e).toFixed(1)}px)`;
    const v = G.vb, vb = [v[0], v[1] - L * e, v[2], v[3] + L * e], vbs = vb.map(x => x.toFixed(1)).join(' ');
    if (H.vb !== vbs) { H.vb = vbs; svg.setAttribute('viewBox', vbs); }
    const col = i => (pan < .5 ? W8 : i === step ? Y : DIM);
    setS(H.shell, col(0)); setS(H.aus, col(1));
    let gi = 0;
    H.items.forEach(g => { const id = g.dataset.gi; if (id === 'plot') { setS(g, pan < .5 || step === 2 ? W8 : DIM); return; } setS(g, col(2));
      const j = ORD.indexOf(id) + (id === 'garten' ? gi++ * .5 : 0), k = sm((p - .71 - j * .018) / .03), t = `scale(${Math.max(.001, k).toFixed(3)})`;
      if (g._t !== t) { g._t = t; g.style.transform = t; g.style.visibility = k < .01 ? 'hidden' : 'visible'; } });
    const sk = step + '|' + (pan >= .5) + '|' + (nw || vh < 700);
    if (sk !== stepPrev) { stepPrev = sk; steps.forEach((a, i) => { const cur = pan >= .5 && i === step; a.classList.toggle('is-cur', cur); a.style.opacity = pan < .5 || cur ? '1' : '.4'; a.classList.toggle('is-short', (nw || vh < 700) && !cur && pan >= .5); }); }
    /* Hilfslinien: Rahmen der Zeichnung im Bild (Seitenverhältnis wie die viewBox, mittig im Feld) */
    const sr = st.getBoundingClientRect(), dr = draw.getBoundingClientRect(), sc = Math.min(dr.width / vb[2], dr.height / vb[3]);
    const w = vb[2] * sc, h = vb[3] * sc, l = dr.left - sr.left + (dr.width - w) / 2, t = dr.top - sr.top + (dr.height - h) / 2;
    const tTop = t + (L * e) * sc;  // der Rahmen bleibt am Grundstück, das Haus hebt darüber ab
    guides({ l: l + 24 * sc, t: tTop + 24 * sc, r: l + w - 24 * sc, b: t + h - 24 * sc }, sr.width, sr.height, T, 1 - .55 * pan);
    if (T < 3) loop.poke && loop.poke();
  } });
  if (loop.poke) { const t = setInterval(() => loop.poke(), 120); setTimeout(() => clearInterval(t), 3200); }
}

/* ---------- 01 Acht Dinge: Bildfolge, das Muster wechselt mit, der Vergleich liegt über dem Muster ---------- */
export function initAcht() {
  const box = $('[data-ac]'); if (!box) return;
  const st = $('[data-muster]', box), labs = $('[data-muster-labs]', box);
  let api = null, cur = 0;
  const closeVs = () => $$('[data-vs]', box).forEach(v => {
    if (v.hidden) return;
    v.hidden = true; box.classList.remove('vs-open');
    const b = $(`[aria-controls="${v.id}"]`, box); if (b) b.setAttribute('aria-expanded', 'false');
  });
  initFolge(box, { onStep(k) { cur = k; closeVs(); if (api) api.show(ACHT[k].key); } });
  $$('[data-vs-open]', box).forEach(b => b.addEventListener('click', () => {
    const v = document.getElementById(b.getAttribute('aria-controls')), open = v.hidden;
    closeVs();
    if (open) { box.style.setProperty('--vs-top', st.offsetTop + 'px'); v.hidden = false; box.classList.add('vs-open'); b.setAttribute('aria-expanded', 'true'); $('[data-vs-close]', v).focus({ preventScroll: true }); }
  }));
  $$('[data-vs-close]', box).forEach(b => b.addEventListener('click', () => {
    const it = b.closest('[data-fo-it]'); closeVs();
    const o = it && $('[data-vs-open]', it); if (o) o.focus({ preventScroll: true });
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('vs-open')) closeVs(); });
  near(box, () => import('./muster3d.js').then(m => m.createMuster(st, labs)).then(a => { api = a; api.show(ACHT[cur].key); })
    .catch(e => { console.warn('Muster nicht geladen', e); box.classList.add('is-fallback'); }));
}

/* Runde 61: „Andere nennen es Aufpreis“ entfernt (Kunde) */

/* ---------- 03 Ausbaustufen (Runde 48): drei Teile, alle Positionen offen. Links bleibt das Haus stehen: große Nummer, Name der Stufe,
   die Leiste füllt sich beim Lesen. Die Stufe wechselt, wenn ihr Kopf die Bildmitte erreicht, das Haus baut sich mit.
   Der Bereich auf Höhe der Bildmitte wird im Haus hell (Wand, Dach, Fenster ...), die Zeilen laufen beim Hereinscrollen ein.
   Runde 61 (Kunde): das Haus der Services Seite (js/stufen-bau3d.js) baut sich mit jedem Bereich, den du erreichst, keine Schilder mehr. ---------- */
export function initStufen() {
  const box = $('[data-sts]'); if (!box) return;
  const arts = $$('[data-stx]', box), heads = arts.map(a => $('[data-stx-head]', a)), segs = $$('[data-sts-seg]', box), names = $$('[data-sts-name]', box);
  const groups = arts.map(a => $$('[data-stg]', a)), all = groups.flat(), nr = $('[data-sts-nr]', box), now = $('[data-sts-now]', box), stage = $('[data-st-stage]', box);
  let api = null, n = 0, label = '', curG = null, lastPg = -1, bau = -1;
  /* Runde 53: Name des Bereichs aus der Überschrift (in Framer bearbeitbar), sonst aus data-name */
  const gName = x => { const h = $('.stg__h>span', x); return (h && h.textContent.trim()) || x.dataset.name; };
  if (reduce) $$('[data-stg],[data-stx-head]', box).forEach(g => g.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    $$('[data-stg],[data-stx-head]', box).forEach(g => io.observe(g));
  }
  const setStage = k => {
    if (k === n) return; n = k;
    names.forEach((x, i) => x.classList.toggle('is-on', i === k - 1));
    if (nr) { nr.textContent = String(k).padStart(2, '0'); if (!reduce) { nr.classList.remove('is-new'); void nr.offsetWidth; nr.classList.add('is-new'); } }
    if (api) api.stage(k);
  };
  loop.add({ tick() {
    const r = box.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    const mid = vh * .52;
    /* Runde 53: das Haus dreht sich mit dem Scrollen (js/schnitthaus.js progress) */
    const pg = Math.min(1, Math.max(0, (vh * .5 - r.top) / Math.max(1, r.height - vh * .5)));
    if (api && Math.abs(pg - lastPg) > .0004) { lastPg = pg; api.progress(pg); }
    let k = 1;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < mid) k = i + 1; });
    setStage(k);
    /* Leiste: was du von jeder Stufe schon gelesen hast */
    arts.forEach((a, i) => {
      const q = a.getBoundingClientRect(), f = Math.min(1, Math.max(0, (mid - q.top) / Math.max(1, q.height)));
      segs[i].style.setProperty('--f', f.toFixed(4));
      segs[i].classList.toggle('is-cur', i === k - 1); segs[i].classList.toggle('is-done', i < k - 1);
    });
    /* der Bereich auf Höhe der Bildmitte */
    let g = null;
    groups[k - 1].forEach(x => { const q = x.getBoundingClientRect(); if (q.top < mid && q.bottom > mid - 40) g = x; });
    if (g !== curG) { if (curG) curG.classList.remove('is-cur'); if (g) g.classList.add('is-cur'); curG = g; }
    const lb = g ? gName(g) : names[k - 1].textContent;
    if (lb !== label) { label = lb; if (now) now.textContent = lb; }
    /* Runde 52: der gelesene Bereich hebt sich ab, die anderen der Stufe treten zurück */
    box.classList.toggle('has-cur', !!g);
    /* Runde 61: Bauschritt = der letzte Bereich, dessen Kopf die Bildmitte erreicht hat (über alle Stufen) */
    let reach = null; all.forEach(x => { if (x.getBoundingClientRect().top < mid) reach = x; });
    const b = reach ? STEP(reach) : -1;
    if (b !== bau) { bau = b; if (api) api.step(b); }
  } });
  let STEP = () => -1;
  near(stage, () => import('./stufen-bau3d.js').then(m => { const idx = new Map(m.BAU.map((x, i) => [x, i]));
    STEP = x => idx.get(x.dataset.name) ?? all.indexOf(x); return m.createBau(stage); }).then(a => {
    api = a; stage.classList.add('is-live'); bau = -2;
  }).catch(e => { console.warn('Haus nicht geladen', e); stage.classList.add('is-fallback'); }));
}

/* ---------- 04 Dazu kommt (Runde 47): jeder Punkt läuft Wort für Wort herein, sobald er ins Bild kommt.
   Hell ist der Punkt, der der Bildmitte am nächsten ist, die große Zahl links zählt mit. ---------- */
export function initDazu() {
  const box = $('[data-dz]'); if (!box) return;
  const its = $$('[data-dz-it]', box), nr = $('[data-dz-nr]', box);
  let cur = 0;
  if (reduce) its.forEach(it => it.classList.add('is-in'));
  loop.add({ tick() {
    const r = box.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    let best = 0, bd = Infinity;
    its.forEach((it, i) => {
      const q = it.getBoundingClientRect();
      if (q.top < vh * .86 && !it.classList.contains('is-in')) it.classList.add('is-in');
      const d = Math.abs(q.top + q.height / 2 - vh * .5);
      if (d < bd) { bd = d; best = i; }
    });
    if (best === cur) return;
    its[cur].classList.remove('is-cur'); its[best].classList.add('is-cur'); cur = best;
    if (nr) { nr.textContent = String(best + 1).padStart(2, '0'); if (!reduce) { nr.classList.remove('is-new'); void nr.offsetWidth; nr.classList.add('is-new'); } }
  } });
}
