/* Projekt-Galerie (projects-galerie.html): sechs Abschnitte, die dieselben acht Häuser zeigen, und ein Projektfenster für alle.
   01 Schweben   freie Fläche mit Karten in verschiedenen Tiefen, ziehen mit Maus oder Finger, wiederholt sich endlos
   02 Namen      große Liste der Namen, über einem Namen schweben seine Bilder mit dem Mauszeiger mit (Telefon: Bildreihe)
   03 Stapel     jedes Haus ein Stapel Fotos, darüberfahren fächert auf, ziehen verschiebt (mit Schwung)
   04 Strömung   drei Reihen ziehen in verschiedenen Tempi, Scrollen beschleunigt, über einem Bild bleibt sein Haus hell
   05 Schichten  gepinnte Bühne, pro Haus steigen seine Bilder in drei Tiefen am großen Namen vorbei
   06 Bühne      ein Haus groß in der Mitte, die anderen schweben darum, darüberfahren holt eins auf die Bühne
   Projektfenster: Bilder (Wischblende, Pfeile, Wischen, Pfeiltasten, kleine Bilder), Art, Name, Text, Daten, Link, voriges und nächstes Projekt.
   Daten in data/galerie.js. Ohne Bewegung (prefers-reduced-motion) stehen alle Abschnitte ruhig in ihrer Endlage. */
import { loop, reveal, $, $$, clamp, lerp, reduce, vhs } from './core.js';
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
run('namen', () => initNamen($('[data-g="namen"]')));
run('stapel', () => initStapel($('[data-g="stapel"]')));
run('stroemung', () => initStroemung($('[data-g="stroemung"]')));
run('schichten', () => initSchichten($('[data-g="schichten"]')));
run('buehne', () => initBuehne($('[data-g="buehne"]')));

/* Ein Klick auf eine Karte in irgendeiner Variante öffnet das Projektfenster, nicht nach einem Ziehen */
document.addEventListener('click', e => {
  const c = e.target.closest('[data-g] [data-p]');
  if (!c || c.hasAttribute('data-own')) return;  // data-own: die Variante öffnet selbst
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
  L.forEach((p, pi) => p.img.slice(0, 5).forEach((im, ii) => items.push([pi, ii])));  // bis zu fünf Bilder pro Haus
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  f.innerHTML = items.map(([pi, ii], k) => {
    const p = L[pi], im = p.img[ii];
    return `<button class="gs__c" type="button" data-p="${pi}" data-i="${ii}" aria-label="${esc(p.name)} öffnen">`
      + `<span class="gs__in" style="transition-delay:${(k % 14) * 55}ms"><span class="gs__im" style="--r:${im.r}">${imgHTML(im)}</span>${capHTML(p)}</span></button>`;
  }).join('');
  cur.textContent = `${items.length} Bilder aus ${N} Häusern`;
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

/* ---------- 02 Namen ---------- */
function initNamen(g) {
  if (!g) return;
  const list = $('[data-gn-list]', g), fl = $('[data-gn-float]', g);
  /* Plätze der schwebenden Bilder um den Mauszeiger: x, y (× Grundbreite), Breite, Nachlauf (kleiner = träger) */
  const SLOT = [[-.2, -.7, 1, .15], [.5, -.3, .6, .1], [-.7, .16, .5, .08], [.28, .44, .42, .062]];
  list.innerHTML = L.map((p, pi) => `<li class="gn__row">`
    + `<button class="gn__b" type="button" data-p="${pi}" data-i="0" data-own aria-label="${esc(p.name)} öffnen">`
    + `<span class="info gn__nr">${pad2(pi + 1)}</span><span class="gn__name">${esc(p.name)}</span>`
    + `<span class="info gn__info">${esc(p.info)}</span><span class="info gn__cnt">${pad2(p.img.length)} Bilder</span></button>`
    + `<div class="gn__strip">${p.img.map((im, ii) => `<button class="gn__th" type="button" data-p="${pi}" data-i="${ii}" aria-label="${esc(p.name)}, Bild ${ii + 1}" style="--r:${im.r}">${imgHTML(im)}</button>`).join('')}</div></li>`).join('');
  fl.innerHTML = L.map((p, pi) => `<div class="gn__grp" data-k="${pi}">${p.img.slice(0, 4).map((im, j) =>
    `<span class="gn__fi" style="--j:${j}"><img src="${j ? im.t : im.m}" alt="" decoding="async" loading="lazy" draggable="false"${im.pos ? ` style="object-position:${im.pos}"` : ''}></span>`).join('')}</div>`).join('');
  const grps = $$('.gn__grp', fl).map((el, pi) => ({ el, fs: $$('.gn__fi', el).map((e, j) => ({ e, j, r: L[pi].img[j].r, x: 0, y: 0, w: 0, h: 0 })) }));
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let act = -1, mx = 0, my = 0, base = 0, live = false, lastSY = 0, last = now();
  const layout = () => {
    base = clamp(innerWidth * .2, 200, 340);
    grps.forEach(gp => gp.fs.forEach(f => { f.w = base * SLOT[f.j][2] * (f.r < 1 ? .72 : 1); f.h = f.w / f.r; f.e.style.width = `${f.w.toFixed(1)}px`; f.e.style.height = `${f.h.toFixed(1)}px`; }));
  };
  layout(); onResize(layout);
  const target = (f, r) => [mx - r.left + SLOT[f.j][0] * base - f.w / 2, my - r.top + SLOT[f.j][1] * base - f.h / 2];
  const setAct = k => {
    if (k === act) return;
    if (act >= 0) grps[act].el.classList.remove('is-on');
    act = k;
    if (k < 0) return;
    const gp = grps[k], r = g.getBoundingClientRect();
    gp.fs.forEach(f => { const [tx, ty] = target(f, r); f.x = tx; f.y = ty + 50 + f.j * 16; });  // steigen leicht von unten ein
    gp.el.classList.add('is-on');
    live = true; loop.poke();
  };
  const pick = el => { const b = el && el.closest && el.closest('.gn__b'); return b && g.contains(b) ? +b.dataset.p : -1; };
  g.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !fine.matches) return; mx = e.clientX; my = e.clientY; setAct(pick(e.target)); live = true; loop.poke(); });
  g.addEventListener('pointerleave', () => setAct(-1));
  list.addEventListener('click', e => {
    const b = e.target.closest('.gn__b'); if (!b) return;
    const k = +b.dataset.p;
    WIN.open(k, 0, act === k ? $('img', grps[k].fs[0].e) : null);
  });
  loop.add({ tick() {
    const t = now(), dt = Math.min(64, t - last); last = t;
    if (!live || !near(g)) return;
    if (scrollY !== lastSY) { lastSY = scrollY; if (act >= 0) setAct(pick(document.elementFromPoint(mx, my))); }  // Scrollen ohne Mausbewegung
    const r = g.getBoundingClientRect();
    let busy = false;
    for (const gp of grps) for (const f of gp.fs) {
      const [tx, ty] = target(f, r), k = reduce ? 1 : 1 - Math.pow(1 - SLOT[f.j][3], dt / 16.7);
      f.x += (tx - f.x) * k; f.y += (ty - f.y) * k;
      if (Math.abs(tx - f.x) + Math.abs(ty - f.y) > .3) busy = true;
      f.e.style.transform = `translate3d(${f.x.toFixed(1)}px,${f.y.toFixed(1)}px,0)`;
    }
    if (busy) loop.poke(); else if (act < 0) live = false;
  } });
}

/* ---------- 03 Stapel ---------- */
function initStapel(g) {
  if (!g) return;
  const t = $('[data-gk-t]', g), R = rng(7);
  /* aufgefächert: x, y (× Kartenbreite), Drehung; Bild 1 bleibt vorn */
  const FAN = [[0, 0, -1], [-.6, -.1, -7], [.6, -.04, 6], [.05, -.5, -2.5]];
  const quer = p => p.img.map((im, ii) => [im, ii]).filter(([im]) => im.r >= 1.2).slice(0, 4);  // Hochformate würden unter dem Stapel herausragen
  t.innerHTML = L.map((p, pi) => `<div class="gk__s" data-k="${pi}"><div class="gk__p" style="transition-delay:${pi * 90}ms">`
    + quer(p).map(([im, ii], j) => `<button class="gk__c" type="button" data-p="${pi}" data-i="${ii}" aria-label="${esc(p.name)}, Bild ${ii + 1}" style="--j:${j}">${imgHTML(im)}</button>`).join('')
    + `<span class="gk__lab"><span class="info">${esc(p.info)}</span><b>${esc(p.name)}</b></span></div></div>`).join('');
  const st = $$('.gk__s', t).map((el, pi) => ({
    el, pi, x: 0, y: 0, vx: 0, vy: 0, jx: R() - .5, jy: R() - .5,
    cs: $$('.gk__c', el).map((e, j) => ({ e, j, r: L[pi].img[+e.dataset.i].r, rx: (R() - .5) * 12, ry: (R() - .5) * 10, rr: j ? (R() - .5) * 9 : (R() - .5) * 3 })),
    lab: $('.gk__lab', el),
  }));
  let sw = 0, sh = 0, W = 0, top = 10, last = now(), moving = false;
  const layout = () => {
    sw = t.clientWidth;
    const phone = sw < 700, cols = phone ? 2 : sw < 1024 ? 3 : 4, rows = Math.ceil(N / cols);
    W = phone ? sw * .36 : clamp(sw * .14, 150, 250);
    const pm = phone ? 16 : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-margin')) || 48);
    const x0 = pm + W * .62, uw = sw - 2 * x0, cellH = W * (phone ? 1.1 : 1.05) + (phone ? 70 : 100);
    sh = rows * cellH + (phone ? 70 : 130);
    t.style.height = `${Math.round(sh)}px`;
    st.forEach((s, k) => {
      const col = k % cols, row = Math.floor(k / cols), shift = (row % 2 ? .22 : -.1) * (phone ? .4 : 1);
      s.x = clamp(x0 + uw * (col + shift + s.jx * .3) / (cols - 1), x0, sw - x0);
      s.y = (phone ? 30 : 60) + (row + .5) * cellH + s.jy * cellH * .12;
      s.vx = s.vy = 0;
      s.cs.forEach(c => {
        const w = W, f = FAN[c.j];
        c.e.style.cssText = `--j:${c.j};--r:${c.r};--cw:${w.toFixed(1)}px;--rx:${c.rx.toFixed(1)}px;--ry:${c.ry.toFixed(1)}px;--rr:${c.rr.toFixed(2)}deg;--fx:${(f[0] * W).toFixed(1)}px;--fy:${(f[1] * W).toFixed(1)}px;--fr:${f[2]}deg`;
      });
      s.lab.style.cssText = `width:${Math.round(W * (phone ? 1.12 : 1.3))}px;top:${Math.round(W / 1.333 / 2 + 20)}px`;
      place(s);
    });
  };
  const place = s => { s.el.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0)`; };
  st.forEach(s => {
    s.el.addEventListener('pointerdown', () => { s.el.style.zIndex = ++top; });
    drag(s.el, g, {
      move: (dx, dy) => { s.x += dx; s.y += dy; s.vx = s.vy = 0; place(s); },
      end: (vx, vy) => { s.vx = vx; s.vy = vy; moving = true; loop.poke(); },
    });
  });
  layout(); onResize(layout);
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { g.classList.add('is-in'); io.disconnect(); } }), { threshold: .2 }).observe(g);
  loop.add({ tick() {
    const tt = now(), dt = Math.min(64, tt - last); last = tt;
    if (!moving) return;
    moving = false;
    const m = W * .45, fr = Math.pow(.92, dt / 16.7);
    for (const s of st) {
      if (Math.abs(s.vx) + Math.abs(s.vy) < .05) continue;
      s.x += s.vx * dt / 16.7; s.y += s.vy * dt / 16.7; s.vx *= fr; s.vy *= fr;
      if (s.x < m || s.x > sw - m) { s.x = clamp(s.x, m, sw - m); s.vx *= -.4; }   // weich vom Rand zurück
      if (s.y < m || s.y > sh - m) { s.y = clamp(s.y, m, sh - m); s.vy *= -.4; }
      place(s); moving = true;
    }
    if (moving) loop.poke();
  } });
}

/* ---------- 04 Strömung ---------- */
function initStroemung(g) {
  if (!g) return;
  const box = $('[data-gf-rows]', g), inf = $('[data-gf-info]', g), nm = $('[data-gf-name]', g), R = rng(5);
  const fine = matchMedia('(hover:hover) and (pointer:fine)'), HINT = fine.matches ? 'Fahr über ein Bild' : 'Tipp auf ein Bild, um das Haus zu öffnen';
  inf.textContent = HINT;
  const all = [];
  L.forEach((p, pi) => p.img.forEach((im, ii) => all.push([pi, ii])));
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const NR = 3, items = [[], [], []];
  all.forEach((it, k) => items[k % NR].push(it));
  const one = ([pi, ii], copy) => `<button class="gf__c" type="button" data-p="${pi}" data-i="${ii}"${copy ? ' tabindex="-1"' : ''} aria-label="${esc(L[pi].name)}, Bild ${ii + 1}" style="--r:${L[pi].img[ii].r}">${imgHTML(L[pi].img[ii]).replace(' loading="lazy"', '')}</button>`;
  box.innerHTML = items.map((row, ri) => `<div class="gf__row" data-r="${ri}"><div class="gf__track">`
    + [0, 1, 2].map(c => `<div class="gf__set"${c ? ' aria-hidden="true"' : ''}>${row.map(it => one(it, c)).join('')}</div>`).join('') + `</div></div>`).join('');
  const SPEED = [.02, .032, .025], DIR = [1, -1, 1], BOOST = [.5, .9, .7];  // px pro ms, 1 = nach links
  const rows = $$('.gf__row', box).map((el, ri) => ({ el, ri, tr: $('.gf__track', el), set: $('.gf__set', el), x: R() * 400, v: 0, h: 1, hov: false, sw: 1 }));
  const cards = $$('.gf__c', box);
  const measure = () => rows.forEach(r => { r.sw = r.set.offsetWidth || 1; });
  measure(); onResize(measure);
  addEventListener('load', measure);
  rows.forEach(r => {
    r.el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') r.hov = true; });
    r.el.addEventListener('pointerleave', () => { r.hov = false; });
    drag(r.el, g, { move: dx => { r.x -= dx; r.v = 0; loop.poke(); }, end: vx => { r.v = -vx; loop.poke(); } });
  });
  let hp = null;
  const hl = p => {
    if (p === hp) return;
    hp = p;
    g.classList.toggle('is-hl', p != null);
    cards.forEach(c => c.classList.toggle('is-p', c.dataset.p === p));
    if (p == null) { inf.textContent = HINT; nm.textContent = ''; return; }
    inf.textContent = L[+p].info; nm.textContent = L[+p].name;
  };
  box.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const c = e.target.closest('.gf__c'); hl(c ? c.dataset.p : null); });
  box.addEventListener('pointerleave', () => hl(null));
  let last = now(), lastSY = scrollY;
  loop.add({ tick() {
    const t = now(), dt = Math.min(64, t - last); last = t;
    const dy = Math.min(160, Math.abs(scrollY - lastSY)); lastSY = scrollY;
    if (!near(g)) return;
    for (const r of rows) {
      r.h = lerp(r.h, r.hov ? 0 : 1, 1 - Math.pow(.9, dt / 16.7));   // über einer Reihe bleibt sie fast stehen
      if (!reduce && !g.classList.contains('is-drag')) r.x += DIR[r.ri] * (SPEED[r.ri] * dt * r.h + dy * BOOST[r.ri] * .45);
      r.x += r.v * dt / 16.7; r.v *= Math.pow(.93, dt / 16.7);
      r.tr.style.transform = `translate3d(${(-mod(r.x, r.sw)).toFixed(1)}px,0,0)`;
    }
    if (!reduce || rows.some(r => Math.abs(r.v) > .05)) loop.poke();
  } });
}

/* ---------- 05 Schichten ---------- */
function initSchichten(g) {
  if (!g) return;
  const box = $('[data-gl-imgs]', g), mid = $('.gl__mid', g), nm = $('[data-gl-name]', g), inf = $('[data-gl-info]', g), nr = $('[data-gl-nr]', g), line = $('[data-gl-line]', g);
  $('[data-gl-of]', g).textContent = pad2(N);
  const STEP = .7, PAD = .55;  // Bildschirmhöhen Scrollweg pro Haus, Vor- und Nachlauf in Häusern
  /* Plätze pro Haus: x (Mitte, Anteil der Breite), y (Bildschirmhöhen um die Mitte), Tiefe 0 bis 1 (nah = groß, schnell, vor dem Namen) */
  const SL = [[.11, .08, 1], [.8, -.25, .5], [.6, .36, .28], [.32, -.38, .38], [.88, .3, .82]];
  const SLP = [[.2, .14, 1], [.78, -.26, .5], [.62, .36, .3], [.3, -.4, .38], [.84, .3, .82]];
  const its = [];
  L.forEach((p, pi) => p.img.slice(0, 5).forEach((im, j) => its.push({ pi, j, r: im.r, d: SL[j][2] })));
  box.innerHTML = its.map(o => `<button class="gl__c${o.d < .9 ? ' is-fern' : ''}" type="button" data-p="${o.pi}" data-i="${o.j}" aria-label="${esc(L[o.pi].name)}, Bild ${o.j + 1}" style="--r:${o.r}">${o.d >= .8 ? imgHTML({ ...L[o.pi].img[o.j], t: L[o.pi].img[o.j].m }) : imgHTML(L[o.pi].img[o.j])}</button>`).join('');
  $$('.gl__c', box).forEach((el, k) => { its[k].el = el; });
  let sw = 0, sh = 0, base = 0, cur = -1, swapT = 0, mx = 0, smx = 0;
  const layout = () => {
    sw = innerWidth; sh = vhs();
    base = sw < 700 ? sw * .5 : clamp(sw * .25, 230, 410);
    g.style.height = `${Math.round(((N - 1 + 2 * PAD) * STEP + 1) * sh)}px`;
    its.forEach(o => { o.w = base * (.45 + .6 * o.d) * (o.r < 1 ? .7 : 1); o.h = o.w / o.r; o.el.style.width = `${o.w.toFixed(1)}px`; o.el.style.opacity = (.3 + .7 * o.d).toFixed(2); });
  };
  layout(); onResize(layout);
  const setName = i => {
    nm.textContent = L[i].name; inf.textContent = L[i].info; nr.textContent = pad2(i + 1);
    nm.setAttribute('aria-label', `${L[i].name} öffnen`);
  };
  nm.addEventListener('click', () => { if (cur >= 0) WIN.open(cur, 0, null); });
  g.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') mx = e.clientX / innerWidth - .5; });
  loop.add({ tick() {
    if (!near(g)) return;
    const p = scene(g), c = -PAD + p * (N - 1 + 2 * PAD);
    smx = reduce ? 0 : lerp(smx, mx, .06);
    for (const o of its) {
      const s = (sw < 700 ? SLP : SL)[o.j], u = c - o.pi, sp = .55 + .75 * o.d;
      const y = sh * (.5 + s[1] - u * sp) - o.h / 2, x = sw * s[0] - o.w / 2 - smx * 40 * o.d;
      const vis = y > -o.h - 20 && y < sh + 20;
      if (vis !== o.v) { o.v = vis; o.el.style.visibility = vis ? 'visible' : 'hidden'; }
      if (vis) o.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    }
    const i = clamp(Math.round(c), 0, N - 1);
    if (i !== cur) {
      const first = cur < 0; cur = i; clearTimeout(swapT);
      if (first || reduce) setName(i);
      else { mid.classList.add('is-swap'); swapT = setTimeout(() => { setName(i); mid.classList.remove('is-swap'); }, 260); }
    }
    line.style.transform = `scaleX(${p.toFixed(4)})`;
    if (!reduce && Math.abs(smx - mx) > .001) loop.poke();
  } });
}

/* ---------- 06 Bühne ---------- */
function initBuehne(g) {
  if (!g) return;
  const ring = $('[data-gb-ring]', g), stage = $('[data-gb-stage]', g), A = $('[data-gb-a]', g), B = $('[data-gb-b]', g);
  const cap = $('.gb__cap', g), inf = $('[data-gb-info]', g), nm = $('[data-gb-name]', g), cnt = $('[data-gb-cnt]', g);
  const EASE = 'cubic-bezier(.22,1,.36,1)', HOLD = 3200;
  /* schwebende Bilder um die Bühne: x, y (Anteil der Fläche), Größe, Tiefe; Telefon: zwei lose Reihen unter der Bühne */
  const SLOT = [[.11, .2, 1, .8], [.225, .52, .78, .45], [.1, .82, .92, 1], [.89, .2, .86, .6], [.8, .54, 1, 1], [.9, .84, .8, .5], [.64, .08, .72, .35], [.36, .93, .76, .7]];
  const SLOTP = [[.14, 0, 1, .7], [.39, .1, .9, .4], [.63, -.04, 1, 1], [.87, .08, .9, .5], [.16, 1, .9, .6], [.4, .88, 1, 1], [.64, 1.04, .9, .45], [.88, .92, 1, .8]];
  ring.innerHTML = L.map((p, pi) => `<button class="gb__t" type="button" data-p="${pi}" data-i="0" aria-label="${esc(p.name)} öffnen" style="--r:${p.img[0].r}"><span class="gb__ti">${imgHTML(p.img[0])}</span></button>`).join('');
  const th = $$('.gb__t', ring).map((el, pi) => ({ el, pi, r: L[pi].img[0].r, ph: pi * 1.7 }));
  const wide = pi => L[pi].img.map((im, k) => [im, k]).filter(([im]) => im.r >= 1.2);  // Hochformate passen nicht auf die Bühne
  let sw = 0, H = 0, phone = false, cur = -1, ci = 0, hov = -1, next = now() + HOLD, mx = 0, my = 0, smx = 0, smy = 0;
  const layout = () => {
    sw = g.clientWidth; phone = sw < 700 || vhs() > sw * 1.1;   // Telefon und Tablet hochkant: Bühne oben, Bilder darunter
    g.classList.toggle('is-col', phone);
    const mid = $('.gb__mid', g), sW = Math.min(sw * .4, vhs() * .56 * 1.5);
    mid.style.width = phone ? '' : `${Math.round(sW)}px`;
    const tw = phone ? sw * (sw < 700 ? .19 : .16) : clamp(sw * .1, 110, 180);
    H = g.clientHeight;
    const mb = mid.offsetTop + mid.offsetHeight;
    th.forEach((o, k) => {
      const s = phone ? SLOTP[k] : SLOT[k];
      o.w = tw * s[2] * (o.r < 1 ? .7 : 1); o.h = o.w / o.r; o.d = s[3];
      o.el.style.width = `${o.w.toFixed(1)}px`;
      o.x = sw * s[0] - o.w / 2;
      o.y = phone ? mb + 40 + s[1] * (tw * .95 + 26) : H * s[1] - o.h / 2;
    });
    if (phone) g.style.height = `${Math.round(mb + 40 + 1.05 * (tw * .95 + 26) + tw * .75 + 44)}px`; else g.style.height = '';
  };
  const show = (pi, k) => {
    const w = wide(pi), pick = w.length ? w[mod(k, w.length)] : [L[pi].img[0], 0];
    const [im, idx] = pick, first = cur < 0, newP = pi !== cur;
    cur = pi; ci = idx;
    th.forEach(o => o.el.classList.toggle('is-cur', o.pi === pi));
    cnt.textContent = `${pad2(pi + 1)} / ${pad2(N)}`;
    stage.setAttribute('aria-label', `${L[pi].name} öffnen`);
    if (newP) {
      if (first || reduce) { inf.textContent = L[pi].info; nm.textContent = L[pi].name; }
      else { cap.classList.add('is-swap'); setTimeout(() => { inf.textContent = L[pi].info; nm.textContent = L[pi].name; cap.classList.remove('is-swap'); }, 260); }
    }
    if (first || reduce) { A.src = im.m; A.alt = im.alt || ''; A.style.objectPosition = im.pos || ''; return; }
    const key = im.m; B.dataset.k = key;
    const pre = new Image(); pre.src = im.m;
    (pre.decode ? pre.decode() : Promise.resolve()).catch(() => {}).then(() => {
      if (B.dataset.k !== key) return;
      B.getAnimations().forEach(a => a.cancel());
      B.src = im.m; B.style.objectPosition = im.pos || ''; B.style.visibility = 'visible';
      A.animate([{ transform: 'none' }, { transform: 'scale(1.04)' }], { duration: 900, easing: EASE });
      const an = B.animate([{ clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.08)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], { duration: 900, easing: EASE });
      an.onfinish = () => { A.src = B.src; A.alt = im.alt || ''; A.style.objectPosition = B.style.objectPosition; B.style.visibility = 'hidden'; };
    });
  };
  layout(); onResize(layout); addEventListener('load', layout);
  show(0, 0);
  ring.addEventListener('pointerover', e => {
    if (e.pointerType !== 'mouse') return;
    const b = e.target.closest('.gb__t'); if (!b) return;
    const k = +b.dataset.p; hov = k;
    if (k !== cur) { show(k, 0); next = now() + HOLD; }
  });
  ring.addEventListener('pointerout', e => { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.gb__t')) hov = -1; });
  stage.addEventListener('click', () => WIN.open(cur, ci, A));
  g.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = g.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; });
  g.addEventListener('pointerleave', () => { mx = my = 0; hov = -1; });
  loop.add({ tick() {
    if (!near(g)) { next = now() + HOLD; return; }
    const t = now();
    if (!reduce && t > next && !$('[data-gwin]').open) {   // von selbst weiter: über einem Haus seine Bilder, sonst das nächste Haus
      next = t + HOLD;
      if (hov >= 0) show(hov, ci + 1); else show(mod(cur + 1, N), 0);
    }
    if (!reduce) { smx = lerp(smx, mx, .05); smy = lerp(smy, my, .05); }
    for (const o of th) {
      const b = reduce ? 0 : Math.sin(t * .0007 * (.6 + o.d * .5) + o.ph) * (5 + 7 * o.d);
      o.el.style.transform = `translate3d(${(o.x - smx * 36 * o.d).toFixed(1)}px,${(o.y + b - smy * 24 * o.d).toFixed(1)}px,0)`;
    }
    if (!reduce) loop.poke();
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
