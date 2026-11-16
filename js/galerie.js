/* Projekt-Galerie (projects-galerie.html): zwei Abschnitte, die dieselben acht Häuser zeigen, und ein Projektfenster für beide.
   Runde 3: aus Runde 2 ausgewählt, Schweben, Namen, Stapel und Strömung sind entfernt.
   01 Schichten  gepinnte Bühne, pro Haus steigen seine Bilder in drei Tiefen am großen Namen vorbei
   02 Bühne      ein Haus groß in der Mitte, die anderen schweben darum, darüberfahren holt eins auf die Bühne
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
/* Fortschritt einer gepinnten Strecke: 0 Oberkante oben, 1 Unterkante unten */
const scene = el => { const r = el.getBoundingClientRect(), span = r.height - vhs(); return span > 0 ? clamp(-r.top / span) : r.top <= 0 ? 1 : 0; };
const near = (el, m = 1.15) => { const r = el.getBoundingClientRect(), vh = vhs(); return r.bottom > -vh * .15 && r.top < vh * m; };
const imgHTML = (im, big) => `<img src="${big ? im.l : im.t}" alt="" decoding="async" draggable="false"${big ? '' : ' loading="lazy"'}${im.pos ? ` style="object-position:${im.pos}"` : ''}>`;
const onResize = fn => { let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { fn(); loop.poke(); }, 120); }); };

run('chrome', initChrome);
$$('[data-g-n]').forEach(e => { e.textContent = N; });
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());

const WIN = initWin();
run('schichten', () => initSchichten($('[data-g="schichten"]')));
run('buehne', () => initBuehne($('[data-g="buehne"]')));

/* Ein Klick auf ein Bild in einer Variante öffnet das Projektfenster */
document.addEventListener('click', e => {
  const c = e.target.closest('[data-g] [data-p]');
  if (!c) return;
  WIN.open(+c.dataset.p, +c.dataset.i || 0, $('img', c));
});

/* ---------- 01 Schichten ---------- */
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

/* ---------- 02 Bühne ---------- */
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
