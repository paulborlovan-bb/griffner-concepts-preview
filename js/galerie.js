/* Projekt-Galerie (projects-galerie.html): fünf Abschnitte, die dieselben Projekte zeigen, und ein Projektfenster für alle.
   01 Schweben   freie Fläche mit Karten in verschiedenen Tiefen, ziehen mit Maus oder Finger, wiederholt sich endlos
   02 Raumflug   gepinnte Bühne, die Projekte liegen hintereinander im Raum, Scrollen fliegt hindurch
   03 Bogenwand  alle Bilder auf einer gebogenen Wand (von innen gesehen), Scrollen und Ziehen drehen sie
   04 Umlauf     die Projekte fliegen aus der Mitte auf eine Bahn um die Aussage und kreisen weiter
   05 Raster     ein Haus füllt den Bildschirm, beim Scrollen zoomt es heraus in die ganze Sammlung
   Projektfenster: Bilder (Wischblende, Pfeile, Wischen, Pfeiltasten, kleine Bilder), Art, Name, Text, Daten, Link, voriges und nächstes Projekt.
   Daten in data/galerie.js. Ohne Bewegung (prefers-reduced-motion) stehen alle Abschnitte ruhig in ihrer Endlage. */
import { loop, reveal, $, $$, clamp, lerp, reduce, vhs, E } from './core.js';
import { initChrome, frame } from './chrome.js';
import { GALERIE } from '../data/galerie.js';

const L = GALERIE, N = L.length;
const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pad2 = n => String(n).padStart(2, '0');
const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
const now = () => performance.now();
const mod = (a, n) => ((a % n) + n) % n;
const rng = s => () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
/* Fortschritt einer gepinnten Strecke: 0 Oberkante oben, 1 Unterkante unten */
const scene = el => { const r = el.getBoundingClientRect(), span = r.height - vhs(); return span > 0 ? clamp(-r.top / span) : r.top <= 0 ? 1 : 0; };
const near = (el, m = 1.15) => { const r = el.getBoundingClientRect(), vh = vhs(); return r.bottom > -vh * .15 && r.top < vh * m; };
const capHTML = p => `<span class="gcap"><span class="info">${esc(p.info)}</span><b>${esc(p.name)}</b></span>`;
const imgHTML = (im, big) => `<img src="${big ? im.l : im.t}" alt="" decoding="async" draggable="false"${big ? '' : ' loading="lazy"'}${im.pos ? ` style="object-position:${im.pos}"` : ''}>`;
const onResize = fn => { let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { fn(); loop.poke(); }, 120); }); };

run('chrome', initChrome);
$$('[data-g-n]').forEach(e => { e.textContent = N; });
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());

const WIN = initWin();
run('schweben', () => initSchweben($('[data-g="schweben"]')));
run('raum', () => initRaum($('[data-g="raum"]')));
run('wand', () => initWand($('[data-g="wand"]')));
run('umlauf', () => initUmlauf($('[data-g="umlauf"]')));
run('raster', () => initRaster($('[data-g="raster"]')));

/* Ein Klick auf eine Karte in irgendeiner Variante öffnet das Projektfenster, nicht nach einem Ziehen */
document.addEventListener('click', e => {
  const c = e.target.closest('[data-g] [data-p]');
  if (!c) return;
  const g = c.closest('[data-g]');
  if (g.dataset.dragged === '1') { e.preventDefault(); return; }
  WIN.open(+c.dataset.p, +c.dataset.i || 0, $('img', c));
});

/* Ziehen mit Maus oder Finger. Am Telefon gehört senkrechtes Wischen der Seite (touch-action: pan-y). */
function drag(el, g, { move, end }) {
  let id = null, sx = 0, sy = 0, lx = 0, ly = 0, lt = 0, vx = 0, vy = 0, on = false;
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    id = e.pointerId; sx = lx = e.clientX; sy = ly = e.clientY; lt = now(); vx = vy = 0; on = false;
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    if (!on) {
      const tx = e.clientX - sx, ty = e.clientY - sy;
      if (Math.hypot(tx, ty) < 6) return;
      if (e.pointerType !== 'mouse' && Math.abs(ty) > Math.abs(tx)) { id = null; return; }
      on = true; g.classList.add('is-drag');
      try { el.setPointerCapture(id); } catch (err) { /* schon losgelassen */ }
    }
    const t = now(), dt = Math.max(1, t - lt), dx = e.clientX - lx, dy = e.clientY - ly;
    vx = lerp(vx, dx / dt * 16.7, .5); vy = lerp(vy, dy / dt * 16.7, .5);
    lx = e.clientX; ly = e.clientY; lt = t;
    move(dx, dy);
  });
  const up = e => {
    if (e.pointerId !== id) return;
    id = null;
    if (on) {
      g.classList.remove('is-drag'); g.dataset.dragged = '1';
      setTimeout(() => { g.dataset.dragged = ''; }, 60);
      const still = now() - lt > 90;
      end(still ? 0 : vx, still ? 0 : vy);
    }
    on = false;
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}

/* ---------- 01 Schweben ---------- */
function initSchweben(g) {
  if (!g) return;
  const f = $('[data-gs-f]', g), cur = $('[data-gs-cur]', g), R = rng(11);
  const items = [];
  L.forEach((p, pi) => { items.push([pi, 0]); if (p.img.length > 2) items.push([pi, Math.min(2, p.img.length - 1)]); });
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  f.innerHTML = items.map(([pi, ii], k) => {
    const p = L[pi], im = p.img[ii];
    return `<button class="gs__c" type="button" data-p="${pi}" data-i="${ii}" aria-label="${esc(p.name)} öffnen">`
      + `<span class="gs__in" style="transition-delay:${(k % 14) * 55}ms"><span class="gs__im" style="--r:${im.r}">${imgHTML(im)}</span>${capHTML(p)}</span></button>`;
  }).join('');
  cur.textContent = `${items.length} Bilder aus ${N} Projekten`;
  const cards = $$('.gs__c', f).map((el, k) => { const d = .5 + R() * .8; return { el, d, sz: .55 + d * .5 + R() * .18, jx: R(), jy: R(), r: L[items[k][0]].img[items[k][1]].r }; });
  let W = 0, H = 0, sw = 0, sh = 0;
  const layout = () => {
    sw = g.clientWidth; sh = g.clientHeight;
    const base = sw < 700 ? clamp(sw * .3, 96, 150) : clamp(sw * .14, 120, 250);
    let mw = 0;
    cards.forEach(c => { c.w = Math.round(base * c.sz * (c.r < 1 ? .7 : 1)); c.h = c.w / c.r; c.el.style.setProperty('--w', c.w + 'px'); mw = Math.max(mw, c.w); });
    W = Math.max(sw * 1.75, sw + 2 * mw + 200); H = Math.max(sh * 1.6, sh + 2 * mw + 200);
    const cols = sw < 700 ? 5 : 6, rows = Math.ceil(cards.length / cols), cw = W / cols, ch = H / rows;
    cards.forEach((c, k) => {
      const col = k % cols, row = Math.floor(k / cols);
      c.x = col * cw + c.jx * Math.max(0, cw - c.w); c.y = row * ch + c.jy * Math.max(0, ch - c.h - 40);
      c.el.style.zIndex = Math.round(c.d * 100);
    });
  };
  layout(); onResize(layout);

  const o = { x: 0, y: 0 }, v = { x: 0, y: 0 };
  let mx = 0, my = 0, smx = 0, smy = 0, hov = false, last = now();
  drag(g, g, {
    move: (dx, dy) => { o.x += dx; o.y += dy; v.x = v.y = 0; loop.poke(); },
    end: (vx, vy) => { v.x = vx; v.y = vy; loop.poke(); },
  });
  g.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = g.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
  });
  g.addEventListener('pointerover', e => { hov = !!e.target.closest('.gs__c'); });
  g.addEventListener('pointerleave', () => { hov = false; mx = my = 0; });
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { g.classList.add('is-in'); io.disconnect(); } }), { threshold: .15 }).observe(g);

  loop.add({ tick() {
    if (!near(g)) { last = now(); return; }
    const t = now(), dt = Math.min(64, t - last); last = t;
    if (!reduce) {
      if (!g.classList.contains('is-drag')) {
        o.x += v.x * dt / 16.7; o.y += v.y * dt / 16.7;
        const k = Math.pow(.93, dt / 16.7); v.x *= k; v.y *= k;
        if (!hov) o.x -= .014 * dt;  // ganz langsames Treiben nach links
      }
      smx = lerp(smx, mx, .05); smy = lerp(smy, my, .05);
    }
    const sy = reduce ? 0 : -g.getBoundingClientRect().top * .3;  // Scrollen schiebt die Wolke ein wenig mit
    const ox = (W - sw) / 2, oy = (H - sh) / 2;
    for (const c of cards) {
      const x = mod(c.x + (o.x - smx * 70) * c.d, W) - ox, y = mod(c.y + (o.y + sy - smy * 50) * c.d, H) - oy;
      c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    }
    if (!reduce) loop.poke();
  } });
}

/* ---------- 02 Raumflug ---------- */
function initRaum(g) {
  if (!g) return;
  const sp = $('[data-gr-space]', g), cap = $('.gr__cap', g), nm = $('[data-gr-name]', g), inf = $('[data-gr-info]', g), nr = $('[data-gr-nr]', g), line = $('[data-gr-line]', g);
  $('[data-gr-of]', g).textContent = pad2(N);
  const STEP = .34, FAR = 8;
  sp.innerHTML = L.map((p, pi) => `<button class="gr__c" type="button" data-p="${pi}" data-i="0" aria-label="${esc(p.name)} öffnen" style="--r:${p.img[0].r}">${imgHTML(p.img[0])}</button>`).join('');
  const cs = $$('.gr__c', sp).map((el, i) => ({ el, a: i * 2.39996 + .9, rr: .72 + .28 * (((i * 7) % 5) / 4), v: false, r: L[i].img[0].r }));
  let sw = 0, sh = 0, D = 0, RX = 0, RY = 0, cur = -1, swapT = 0;
  const layout = () => {
    sw = innerWidth; sh = vhs(); D = 800;  // Tiefe zwischen zwei Projekten, Perspektive 1000 px
    g.style.height = `${Math.round(((N - 1) * STEP + 1.5) * sh)}px`;
    const w = sw < 700 ? sw * .52 : clamp(sw * .3, 260, 520);
    RX = sw < 700 ? sw * .32 : sw * .5; RY = sh * (sw < 700 ? .26 : .34);  // weit gestreut: fern klein in der Mitte, nah am Rand vorbei
    cs.forEach(c => c.el.style.setProperty('--w', `${Math.round(w * (c.r < 1 ? .66 : 1))}px`));
  };
  layout(); onResize(layout);
  const setCap = i => {
    cur = i; const p = L[i];
    if (reduce) { nm.textContent = p.name; inf.textContent = p.info; nr.textContent = pad2(i + 1); return; }
    cap.classList.add('is-swap'); clearTimeout(swapT);
    swapT = setTimeout(() => { nm.textContent = p.name; inf.textContent = p.info; nr.textContent = pad2(i + 1); cap.classList.remove('is-swap'); }, 220);
  };
  loop.add({ tick() {
    if (!near(g)) return;
    const p = scene(g), cam = -1.4 + p * (N - 1 + 1.75);
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i], dz = i - cam, vis = dz > -.32 && dz < FAR;
      if (!vis) { if (c.v) { c.el.style.visibility = 'hidden'; c.v = false; } continue; }
      if (!c.v) { c.el.style.visibility = 'visible'; c.v = true; }
      const x = Math.cos(c.a) * RX * c.rr, y = Math.sin(c.a) * RY * c.rr, z = -dz * D;
      const op = clamp((FAR - dz) / 2.4) * clamp((dz + .32) / .28);
      c.el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px)`;
      c.el.style.opacity = op.toFixed(3);
      c.el.style.pointerEvents = dz > -.05 && dz < 2.4 ? 'auto' : 'none';
    }
    const i = clamp(Math.round(cam + .5), 0, N - 1);
    if (i !== cur) setCap(i);
    line.style.transform = `scaleX(${p.toFixed(4)})`;
  } });
}

/* ---------- 03 Bogenwand ---------- */
function initWand(g) {
  if (!g) return;
  const st = $('.gw3__st', g), ring = $('[data-gw3-ring]', g), ci = $('[data-gw3-info]', g), cn = $('[data-gw3-name]', g);
  const IM = L.flatMap((p, pi) => p.img.map((im, ii) => [pi, ii]));
  const hint = matchMedia('(hover:hover)').matches ? 'Ziehen oder scrollen / Klicken zum Öffnen' : 'Scrollen oder wischen / Tippen zum Öffnen';
  let sw = 0, sh = 0, P = 0, A = 0, HALF = 0, COLS = 0, ROWS = 0, cols = [], built = '', dragA = 0, vA = 0, last = now(), tilt = 0, mty = 0;
  const layout = () => {
    sw = innerWidth; sh = vhs();
    const phone = sw < 700;
    HALF = phone ? 26 : 38;
    const V = phone ? 3.6 : 7;
    P = (sw / 2) / Math.tan(HALF * Math.PI / 180);
    COLS = Math.round(360 / (2 * HALF / V)); A = 360 / COLS;
    const tw = 2 * P * Math.tan(A / 2 * Math.PI / 180) * .92, th = tw / 1.32, gap = tw * .08;
    const edge = 1 / Math.cos(HALF * Math.PI / 180);
    ROWS = clamp(Math.floor((sh * .72 / edge + gap) / (th + gap)), 2, 4);
    g.style.height = `${Math.round(sh * 3.2)}px`;
    st.style.perspective = `${P.toFixed(0)}px`;
    const key = `${COLS}x${ROWS}`;
    if (key !== built) {
      built = key; let k = 0, html = '';
      for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
        const [pi, ii] = IM[k++ % IM.length], p = L[pi];
        html += `<button class="gw3__t" type="button" data-p="${pi}" data-i="${ii}" data-c="${c}" aria-label="${esc(p.name)} öffnen" tabindex="-1">${imgHTML(p.img[ii])}</button>`;
      }
      ring.innerHTML = html;
      cols = Array.from({ length: COLS }, (_, c) => ({ a: c * A, els: $$(`[data-c="${c}"]`, ring), v: true }));
    }
    cols.forEach(col => col.els.forEach((el, r) => {
      const y = (r - (ROWS - 1) / 2) * (th + gap);
      Object.assign(el.style, { width: `${tw.toFixed(1)}px`, height: `${th.toFixed(1)}px`, left: `${(-tw / 2).toFixed(1)}px`, top: `${(y - th / 2).toFixed(1)}px`,
        transform: `rotateY(${col.a.toFixed(3)}deg) translateZ(${(-P).toFixed(1)}px)` });
    }));
  };
  layout(); onResize(layout);
  const setCap = p => { if (p) { ci.textContent = p.info; cn.textContent = p.name; } else { ci.textContent = hint; cn.textContent = ''; } };
  setCap(null);
  ring.addEventListener('pointerover', e => { const t = e.target.closest('.gw3__t'); setCap(t ? L[+t.dataset.p] : null); });
  ring.addEventListener('pointerout', e => { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.gw3__t')) setCap(null); });
  drag(st, g, {
    move: dx => { dragA += dx / P * 180 / Math.PI; vA = 0; loop.poke(); },  // nach rechts ziehen dreht die Wand nach rechts
    end: vx => { vA = vx / P * 180 / Math.PI; loop.poke(); },
  });
  st.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') mty = (e.clientY / sh - .5); });
  loop.add({ tick() {
    if (!near(g)) { last = now(); return; }
    const t = now(), dt = Math.min(64, t - last); last = t;
    let moving = false;
    if (!reduce && !g.classList.contains('is-drag') && Math.abs(vA) > .002) { dragA += vA * dt / 16.7; vA *= Math.pow(.93, dt / 16.7); moving = true; }
    if (!reduce) { const nt = lerp(tilt, -mty * 4, .06); moving = moving || Math.abs(nt - tilt) > .001; tilt = nt; }
    const p = scene(g), th0 = reduce ? 0 : 18 - p * 150, rot = th0 + dragA;  // Scrollen dreht die Wand nach links
    ring.style.transform = `translateZ(${P.toFixed(1)}px) rotateX(${tilt.toFixed(3)}deg) rotateY(${(-rot).toFixed(3)}deg)`;
    for (const col of cols) {
      const e = mod(col.a - rot + 180, 360) - 180, v = Math.abs(e) < HALF + A * 1.5;
      if (v !== col.v) { col.v = v; col.els.forEach(el => { el.style.visibility = v ? 'visible' : 'hidden'; }); }
    }
    if (moving) loop.poke();
  } });
}

/* ---------- 04 Umlauf ---------- */
function initUmlauf(g) {
  if (!g) return;
  const orb = $('[data-gu-orbit]', g), go = $('[data-gu-go]', g);
  orb.innerHTML = L.map((p, pi) => `<button class="gu__c" type="button" data-p="${pi}" data-i="0" aria-label="${esc(p.name)} öffnen" style="--r:${p.img[0].r}">${imgHTML(p.img[0])}${capHTML(p)}</button>`).join('');
  const cs = $$('.gu__c', orb).map((el, i) => ({ el, r: L[i].img[0].r }));
  let sw = 0, sh = 0, RX = 0, RY = 0, spin = 0, hov = false, last = now(), front = 0;
  const layout = () => {
    sw = innerWidth; sh = vhs();
    const phone = sw < 700;
    RX = phone ? sw * .42 : Math.min(sw * .4, 640); RY = phone ? sh * .34 : Math.min(sh * .31, 320);
    const w = phone ? 60 : clamp(sw * .085, 96, 168);  // Telefon: Bilder kreisen neben dem schmalen Text vorbei
    cs.forEach(c => { c.w = w * (c.r < 1 ? .72 : 1); c.h = c.w / c.r; c.el.style.setProperty('--w', `${c.w.toFixed(1)}px`); });
    g.style.height = `${Math.round(sh * 2.6)}px`;
  };
  layout(); onResize(layout);
  orb.addEventListener('pointerover', e => { hov = !!e.target.closest('.gu__c'); });
  orb.addEventListener('pointerout', e => { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.gu__c')) hov = false; });
  go.addEventListener('click', () => WIN.open(front, 0, $('img', cs[front].el)));
  loop.add({ tick() {
    if (!near(g)) { last = now(); return; }
    const t = now(), dt = Math.min(64, t - last); last = t;
    if (!reduce && !hov) spin += dt * .005;
    const p = scene(g), rot = (reduce ? 0 : p * 200 + spin) * Math.PI / 180;
    let best = -2;
    cs.forEach((c, i) => {
      const ri = reduce ? 1 : E(p, .02 + i * .006, .3 + i * .006);
      const phi = (i / N) * Math.PI * 2 + rot, dep = Math.sin(phi);
      const x = Math.cos(phi) * RX * ri, y = dep * RY * ri;
      const s = (.68 + .42 * (dep + 1) / 2) * (.35 + .65 * ri);
      c.el.style.transform = `translate(${(x - c.w / 2).toFixed(1)}px,${(y - c.h / 2).toFixed(1)}px) scale(${s.toFixed(3)})`;
      c.el.style.zIndex = dep > -.1 ? 30 + Math.round(dep * 10) : 10 + Math.round((dep + 1) * 5);
      c.el.style.opacity = (ri * (.6 + .4 * (dep + 1) / 2)).toFixed(3);
      c.el.style.pointerEvents = ri > .9 ? 'auto' : 'none';
      if (dep > best) { best = dep; front = i; }
    });
    if (!reduce) loop.poke();
  } });
}

/* ---------- 05 Raster ---------- */
function initRaster(g) {
  if (!g) return;
  const st = $('.gx__st', g), gr = $('[data-gx-g]', g);
  const extra = {
    zahl: `<div class="gx__c"><div class="gx__x"><span class="info">Seit 1950</span><b>Über 10.000 Projekte</b></div><span class="gcap"></span></div>`,
    cta: `<div class="gx__c"><a class="gx__x gx__x--cta" href="https://griffner.com/contact"><b>Dein Haus fehlt noch.</b><span class="info">Projekt anfragen →</span></a><span class="gcap"></span></div>`,
  };
  let sw = 0, sh = 0, cols = 0, rows = 0, cw = 0, ch = 0, gap = 0, gx = 0, gy = 0, ci = 0, cells = [], dist = [], built = 0, ccx = 0, ccy = 0;
  const build = () => {
    const total = N + 2;
    rows = Math.ceil(total / cols);
    ci = (Math.ceil(rows / 2) - 1) * cols + Math.ceil(cols / 2) - 1;   // Zelle nahe der Mitte: dort startet das große Haus
    const order = L.map((p, pi) => pi).slice(1);
    const list = [];
    for (let k = 0; k < rows * cols && (order.length || list.length < total); k++) {
      if (k === ci) list.push(0);
      else if (k === cols - 1) list.push('zahl');
      else if (k === total - 1) list.push('cta');
      else if (order.length) list.push(order.shift());
    }
    gr.innerHTML = list.map(v => typeof v === 'string' ? extra[v] : (() => {
      const p = L[v], im = p.img[0];
      return `<button class="gx__c" type="button" data-p="${v}" data-i="0" aria-label="${esc(p.name)} öffnen"><span class="gx__im">${imgHTML(im, v === 0)}</span>${capHTML(p)}</button>`;
    })()).join('');
    cells = $$('.gx__c', gr);
  };
  const layout = () => {
    sw = innerWidth; sh = vhs();
    const nc = sw >= 1024 ? 6 : 4;
    if (nc !== cols || !built) { cols = nc; build(); built = 1; }
    gap = sw < 700 ? 6 : 12;
    const caph = sw < 700 ? 0 : sw < 1024 ? 18 : 42, capg = caph ? 8 : 0;  // Tablet: nur der Name unter dem Bild
    const m = sw < 700 ? 16 : Math.max(24, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-margin')) || 48);
    const top = sw < 700 ? 74 : 96, bot = sw < 700 ? 24 : 40, availW = sw - 2 * m, availH = sh - top - bot;
    cw = (availW - (cols - 1) * gap) / cols; ch = cw / 1.5;
    const hNeed = rows * (ch + caph + capg) + (rows - 1) * gap;
    if (hNeed > availH) { ch = (availH - (rows - 1) * gap - rows * (caph + capg)) / rows; cw = ch * 1.5; }
    gr.style.setProperty('--cols', cols); gr.style.setProperty('--cw', `${cw.toFixed(1)}px`); gr.style.setProperty('--ch', `${ch.toFixed(1)}px`);
    gr.style.setProperty('--gap', `${gap}px`); gr.style.setProperty('--caph', `${caph}px`); gr.style.setProperty('--capg', `${capg}px`);
    gr.style.rowGap = `${gap}px`;
    const gw = cols * cw + (cols - 1) * gap, gh = rows * (ch + caph + capg) + (rows - 1) * gap;
    gx = (sw - gw) / 2; gy = top + (availH - gh) / 2;
    const c = cells[ci]; ccx = c.offsetLeft + cw / 2; ccy = c.offsetTop + ch / 2;
    const pc = cells.map(el => [el.offsetLeft + cw / 2, el.offsetTop + ch / 2]);
    const md = Math.max(...pc.map(([x, y]) => Math.hypot(x - ccx, y - ccy))) || 1;
    dist = pc.map(([x, y]) => Math.hypot(x - ccx, y - ccy) / md);
    g.style.height = `${Math.round(sh * 2.5)}px`;
  };
  layout(); onResize(layout);
  loop.add({ tick() {
    if (!near(g)) return;
    const p = scene(g), z = reduce ? 1 : E(p, .03, .6);
    const S0 = Math.max(sw / cw, sh / ch) * 1.02, s = Math.pow(S0, 1 - z), t = S0 > 1 ? (S0 - s) / (S0 - 1) : 1;
    const cx = lerp(sw / 2, gx + ccx, t), cy = lerp(sh / 2, gy + ccy, t);
    gr.style.transform = `translate(${(cx - s * ccx).toFixed(2)}px,${(cy - s * ccy).toFixed(2)}px) scale(${s.toFixed(4)})`;
    cells.forEach((el, k) => {
      if (k === ci) return;
      const o = E(t, .1 + dist[k] * .45, .4 + dist[k] * .5);
      el.style.opacity = o.toFixed(3);
      el.style.pointerEvents = o > .9 ? '' : 'none';
    });
    gr.style.setProperty('--capo', clamp((t - .86) / .14).toFixed(3));
  } });
}

/* ---------- Projektfenster ---------- */
function initWin() {
  const d = $('[data-gwin]'), stage = $('[data-gwin-stage]', d), A = $('[data-gwin-a]', d), B = $('[data-gwin-b]', d);
  const cnt = $('[data-gwin-cnt]', d), th = $('[data-gwin-th]', d), prev = $('[data-gwin-prev]', d), next = $('[data-gwin-next]', d);
  const close = $('[data-gwin-close]', d), txt = $('[data-gwin-txt]', d), info = $('.gwin__info', d);
  const pp = $('[data-gwin-pp]', d), np = $('[data-gwin-np]', d), ppn = $('[data-gwin-ppn]', d), npn = $('[data-gwin-npn]', d);
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  let pi = 0, ii = 0, back = null, shutT = 0;

  const setImg = (el, im) => {
    const key = im.l;
    el.dataset.k = key; el.alt = im.alt || ''; el.classList.toggle('is-hoch', im.r < 1.05); el.style.objectPosition = im.pos || '';
    el.src = im.t;
    const big = new Image(); big.decoding = 'async'; big.src = im.l;
    (big.decode ? big.decode() : Promise.resolve()).then(() => { if (el.dataset.k === key) el.src = im.l; }).catch(() => {});
  };
  const mark = () => {
    const m = L[pi].img.length;
    cnt.textContent = `${pad2(ii + 1)} / ${pad2(m)}`;
    $$('.gwin__tb', th).forEach((b, k) => { b.classList.toggle('is-cur', k === ii); if (k === ii) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    const cb = $('.gwin__tb.is-cur', th);
    if (cb) th.scrollTo({ left: cb.offsetLeft - th.clientWidth / 2 + cb.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  };
  function show(n, dir = 1, instant = false) {
    const imgs = L[pi].img, m = imgs.length;
    n = mod(n, m);
    if (n === ii && !instant) return;
    ii = n;
    const im = imgs[ii];
    B.getAnimations().forEach(a => a.finish());
    if (instant || reduce) { setImg(A, im); mark(); return; }
    setImg(B, im); B.style.visibility = 'visible';
    A.animate([{ transform: 'none' }, { transform: `translateX(${-dir * 5}%) scale(1.02)` }], { duration: 700, easing: EASE });
    const an = B.animate([{ clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', transform: `translateX(${dir * 4}%)` }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], { duration: 700, easing: EASE });
    an.onfinish = () => {
      A.dataset.k = B.dataset.k; A.alt = B.alt; A.className = B.className; A.style.objectPosition = B.style.objectPosition; A.src = B.src;
      B.style.visibility = 'hidden';
    };
    mark();
  }
  function render(n, i0 = 0) {
    pi = mod(n, N);
    const p = L[pi];
    const facts = p.facts && p.facts.length ? `<dl class="gwin__facts">${p.facts.slice(0, 4).map(([a, b]) => `<div><dt class="info">${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : '';
    const link = p.link ? `<a class="info gwin__go" href="${esc(p.link.href)}" target="_blank" rel="noopener">${esc(p.link.label)}</a>` : '';
    txt.innerHTML = `<p class="info gwin__art">${pad2(pi + 1)} / ${esc(p.info)}</p><h2 class="gwin__name" id="gwin-name">${esc(p.name)}</h2>`
      + (p.text ? `<p class="gwin__say">${esc(p.text)}</p>` : '') + facts + link + (p.credit ? `<p class="gwin__cred">${esc(p.credit)}</p>` : '');
    th.innerHTML = p.img.length > 1 ? p.img.map((im, k) => `<button class="gwin__tb" type="button" data-k="${k}" aria-label="Bild ${k + 1} von ${p.img.length}"><img src="${im.t}" alt="" loading="lazy" decoding="async"></button>`).join('') : '';
    prev.hidden = next.hidden = p.img.length < 2;
    ppn.textContent = L[mod(pi - 1, N)].name; npn.textContent = L[mod(pi + 1, N)].name;
    info.scrollTop = 0;
    ii = -1; show(i0, 1, true);
  }
  const lock = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; };
  function flight(src) {
    const r0 = src.getBoundingClientRect(), r1 = stage.getBoundingClientRect();
    if (r0.width < 8 || r0.bottom < 0 || r0.top > innerHeight) return;
    const gh = document.createElement('img');
    gh.className = 'gwin__ghost'; gh.alt = ''; gh.src = src.currentSrc || src.src;
    d.appendChild(gh); A.style.opacity = '0';
    const a = gh.animate([
      { left: `${r0.left}px`, top: `${r0.top}px`, width: `${r0.width}px`, height: `${r0.height}px` },
      { left: `${r1.left}px`, top: `${r1.top}px`, width: `${r1.width}px`, height: `${r1.height}px` },
    ], { duration: 780, easing: 'cubic-bezier(.65,.05,.36,1)', fill: 'forwards' });
    a.onfinish = () => { A.style.opacity = ''; gh.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240 }).onfinish = () => gh.remove(); };
  }
  function open(n, i = 0, src) {
    clearTimeout(shutT);
    back = document.activeElement;
    render(n, i);
    if (!d.open) d.showModal();
    lock(true);
    close.focus({ preventScroll: true });
    if (!reduce && src) flight(src);
    requestAnimationFrame(() => d.classList.add('is-open'));
  }
  function shut() {
    if (!d.open) return;
    d.classList.remove('is-open');
    shutT = setTimeout(() => { d.close(); lock(false); $$('.gwin__ghost', d).forEach(e => e.remove()); A.style.opacity = ''; if (back && back.focus) back.focus({ preventScroll: true }); }, reduce ? 0 : 400);
  }
  const project = dir => {
    render(pi + dir);
    if (reduce) return;
    txt.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: EASE });
    A.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: EASE });
  };
  close.addEventListener('click', shut);
  d.addEventListener('cancel', e => { e.preventDefault(); shut(); });
  d.addEventListener('click', e => { if (e.target === d) shut(); });
  prev.addEventListener('click', () => show(ii - 1, -1));
  next.addEventListener('click', () => show(ii + 1, 1));
  pp.addEventListener('click', () => project(-1));
  np.addEventListener('click', () => project(1));
  th.addEventListener('click', e => { const b = e.target.closest('.gwin__tb'); if (b) { const k = +b.dataset.k; show(k, k >= ii ? 1 : -1); } });
  d.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('a,input,textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(ii + 1, 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(ii - 1, -1); }
  });
  /* Wischen über das Bild */
  let sx = null, sy = 0;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(ii + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { sx = null; });
  return { open };
}
