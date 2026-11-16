/* Projekt-Album (projects-album.html): sechs schmale Bildstrecken mit denselben acht Häusern, nur Bilder, und ein Leuchtkasten mit kleinem Titel.
   01 Album      Reihen aus zwei Bildern, eines breit und farbig, eines schmal und grau; darüberfahren (Telefon: tippen) tauscht
   02 Raster     drei Spalten, quadratische Kacheln wie ein Profil
   03 Bento      jedes Haus ein Block aus großen und kleinen Feldern (feste Muster je Bildzahl, jedes zweite Haus gespiegelt)
   04 Mauerwerk  Spalten (3, Telefon 2), jedes Bild in seinem Format, neues Bild kommt in die kürzeste Spalte
   05 Streifen   jedes Haus eine Reihe Streifen, einer ist offen; Telefon: Streifen untereinander
   06 Beitrag    eine schmale Spalte, jedes Haus ein Beitrag mit Bildern zum Wischen, Punkte darunter
   Beim Scrollen kommen weitere Häuser dazu: feed() hängt je BATCH Häuser an, sobald das Ende einer Variante sichtbar wird.
   Leuchtkasten: Bild, Zähler im Haus, kleiner Titel, Bilder des Hauses; Pfeile, Wischen, Pfeiltasten gehen durch alle Bilder aller Häuser.
   Ohne Bewegung (prefers-reduced-motion) erscheint alles ohne Einblendung. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { GALERIE } from '../data/galerie.js';

const L = GALERIE, N = L.length;
const BATCH = 2;            // Häuser pro Nachladen
const EASE = 'cubic-bezier(.22,1,.36,1)';
const fine = matchMedia('(hover:hover) and (pointer:fine)');
let LB = null;           // Leuchtkasten, unten gestartet
const ALL = [];             // alle Bilder in Reihenfolge, für den Leuchtkasten
L.forEach((p, pi) => p.img.forEach((im, ii) => ALL.push({ pi, ii, im })));

const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pad2 = n => String(n).padStart(2, '0');
const mod = (a, n) => ((a % n) + n) % n;
const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
const pos = im => im.pos ? ` style="object-position:${im.pos}"` : '';
const img = (im, sizes, eager) => `<img src="${im.t}" srcset="${im.t} 600w, ${im.m} 960w, ${im.l} 1920w" sizes="${sizes}" alt="" decoding="async" draggable="false"${eager ? '' : ' loading="lazy"'}${pos(im)}>`;
const lab = (pi, ii) => `${esc(L[pi].name)}, Bild ${ii + 1}`;
const tile = (cls, pi, ii, sizes, attr = '') => `<button class="${cls}" type="button" data-p="${pi}" data-i="${ii}" aria-label="${lab(pi, ii)}"${attr}>${img(L[pi].img[ii], sizes)}</button>`;
const frag = html => { const t = document.createElement('template'); t.innerHTML = html; return [...t.content.children]; };
const onResize = fn => { let t, w = innerWidth; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (innerWidth !== w) { w = innerWidth; fn(); } }, 150); }); };

run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());


/* Ein Klick auf ein Bild öffnet den Leuchtkasten. data-tap: am Telefon öffnet der erste Tipp nur den Streifen bzw. das breite Feld */
document.addEventListener('click', e => {
  const c = e.target.closest('[data-a] [data-p]');
  if (!c) return;
  if (c.hasAttribute('data-tap') && !c.classList.contains('is-on')) { on(c); return; }
  LB.open(+c.dataset.p, +c.dataset.i, $('img', c));
});
const on = c => { [...c.parentElement.children].forEach(s => s.classList.toggle('is-on', s === c)); };
/* Maus: darüberfahren macht ein Feld breit (Album, Streifen) */
const hoverOn = g => g.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse') return;
  const c = e.target.closest('[data-tap]');
  if (c && g.contains(c) && !c.classList.contains('is-on')) on(c);
});

/* Einblenden: neue Elemente steigen leicht auf, versetzt */
function rise(els, d0 = 0) {
  if (reduce) return;
  els.slice(0, 18).forEach((el, k) => el.animate([{ opacity: 0, transform: 'translateY(36px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: d0 + k * 70, easing: EASE, fill: 'backwards' }));
}

/* Häuser nach und nach: add(von, bis) hängt die Häuser von..bis-1 an und gibt die neuen Elemente zurück.
   Darunter eine kleine Leiste (Fortschritt, Zähler), die beim Sichtbarwerden die nächsten Häuser holt. */
function feed(g, add) {
  const more = document.createElement('div');
  more.className = 'amore';
  more.innerHTML = '<span class="amore__bar" aria-hidden="true"><i></i></span><span class="info amore__n" aria-live="polite"></span>';
  g.after(more);
  const n = $('.amore__n', more), bar = $('.amore__bar i', more);
  let shown = 0, busy = false, seen = false;
  const step = () => {
    const from = shown, to = Math.min(N, shown + BATCH);
    shown = to;
    const els = add(from, to) || [];
    n.textContent = shown < N ? `${pad2(shown)} / ${pad2(N)} Häuser` : `Alle ${pad2(N)} Häuser`;
    bar.style.transform = `scaleX(${shown / N})`;
    more.classList.toggle('is-end', shown >= N);
    return els;
  };
  const first = step();
  if (!reduce) { first.forEach(el => { el.style.opacity = '0'; }); }
  new IntersectionObserver((es, io) => es.forEach(e => {
    if (!e.isIntersecting || seen) return;
    seen = true; io.disconnect();
    first.forEach(el => { el.style.opacity = ''; }); rise(first);
  }), { threshold: .05 }).observe(g);
  const load = () => {
    if (busy || shown >= N) return;
    busy = true; more.classList.add('is-load');
    setTimeout(() => {
      more.classList.remove('is-load');
      rise(step());
      busy = false;
      if (shown >= N) { io.disconnect(); return; }
      setTimeout(() => { if (more.getBoundingClientRect().top < innerHeight - 20) load(); }, 900);  // schnell gescrollt: gleich weiter
    }, reduce ? 0 : 480);
  };
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) load(); }, { rootMargin: '0px 0px -24px 0px' });
  io.observe(more);
}

/* ---------- 01 Album ---------- */
function initAlbum(g) {
  if (!g) return;
  let k = 0;
  hoverOn(g);
  feed(g, (a, b) => {
    const it = [];
    for (let pi = a; pi < b; pi++) L[pi].img.forEach((im, ii) => it.push([pi, ii]));
    let html = '';
    for (let i = 0; i < it.length; i += 2, k++) {
      const pair = it.slice(i, i + 2), w = k % 2;   // w: welches Feld breit beginnt
      html += `<div class="aa__row${pair.length < 2 ? ' is-one' : ''}">` + pair.map(([pi, ii], j) =>
        tile(`aa__c${j === (pair.length < 2 ? 0 : w) ? ' is-on' : ''}`, pi, ii, '(max-width:699px) 70vw, 480px', ' data-tap')).join('') + '</div>';
    }
    const els = frag(html); g.append(...els); return els;
  });
}

/* ---------- 02 Raster ---------- */
function initRaster(g) {
  if (!g) return;
  feed(g, (a, b) => {
    let html = '';
    for (let pi = a; pi < b; pi++) L[pi].img.forEach((im, ii) => { html += tile('ar__c', pi, ii, '(max-width:699px) 34vw, 250px'); });
    const els = frag(html); g.append(...els); return els;
  });
}

/* ---------- 03 Bento ---------- */
/* Felder im Raster aus 4 Spalten: [Spalte, Reihe, Breite, Höhe], je Bildzahl ein Muster, das ein Rechteck lückenlos füllt */
const BENTO = {
  1: [[1, 1, 4, 2]],
  2: [[1, 1, 2, 2], [3, 1, 2, 2]],
  3: [[1, 1, 2, 2], [3, 1, 2, 1], [3, 2, 2, 1]],
  4: [[1, 1, 2, 2], [3, 1, 2, 1], [3, 2, 1, 1], [4, 2, 1, 1]],
  5: [[1, 1, 2, 2], [3, 1, 1, 1], [4, 1, 1, 1], [3, 2, 1, 1], [4, 2, 1, 1]],
  6: [[1, 1, 2, 2], [3, 1, 1, 1], [4, 1, 1, 1], [3, 2, 2, 1], [1, 3, 2, 1], [3, 3, 2, 1]],
  7: [[1, 1, 2, 2], [3, 1, 1, 1], [4, 1, 1, 1], [3, 2, 2, 1], [1, 3, 2, 1], [3, 3, 2, 1], [1, 4, 4, 1]],
  8: [[1, 1, 2, 2], [3, 1, 1, 1], [4, 1, 1, 1], [3, 2, 2, 1], [1, 3, 2, 1], [3, 3, 1, 2], [4, 3, 1, 2], [1, 4, 2, 1]],
};
function initBento(g) {
  if (!g) return;
  feed(g, (a, b) => {
    let html = '';
    for (let pi = a; pi < b; pi++) {
      const ims = L[pi].img.slice(0, 8), S = BENTO[ims.length].map(s => [...s]), flip = pi % 2;
      if (flip) S.forEach(s => { s[0] = 6 - s[0] - s[2]; });   // jedes zweite Haus gespiegelt
      /* Hochformate in hohe oder kleine Felder, das erste Querformat ins große Feld */
      const free = S.map((s, k) => k), put = [];
      const take = (...tests) => { for (const t of tests) { const j = free.findIndex(k => t(S[k])); if (j >= 0) return free.splice(j, 1)[0]; } return free.shift(); };
      const idx = ims.map((im, ii) => ii);
      idx.filter(ii => ims[ii].r < 1).forEach(ii => { put[take(s => s[3] > s[2], s => s[2] === 1 && s[3] === 1)] = ii; });
      idx.filter(ii => ims[ii].r >= 1).forEach(ii => { put[take(() => true)] = ii; });
      html += `<div class="ab__h">` + S.map((s, k) => tile('ab__c', pi, put[k], `(max-width:699px) ${s[2] * 25}vw, ${s[2] * 220}px`,
        ` style="grid-column:${s[0]} / span ${s[2]};grid-row:${s[1]} / span ${s[3]}"`)).join('') + '</div>';
    }
    const els = frag(html); g.append(...els); return els;
  });
}

/* ---------- 04 Mauerwerk ---------- */
function initMauer(g) {
  if (!g) return;
  let cols = [], hs = [], done = [];
  const nc = () => (g.clientWidth < 560 ? 2 : 3);
  const place = items => items.map(([pi, ii]) => {
    const im = L[pi].img[ii], [el] = frag(tile('am__c', pi, ii, `(max-width:699px) 50vw, 300px`, ` style="--r:${im.r}"`));
    const c = hs.indexOf(Math.min(...hs));
    cols[c].append(el); hs[c] += 1 / im.r + .03;
    return el;
  });
  const build = () => {
    g.innerHTML = ''; cols = []; hs = [];
    for (let c = 0; c < nc(); c++) { const d = document.createElement('div'); d.className = 'am__col'; g.append(d); cols.push(d); hs.push(0); }
    place(done);
  };
  build();
  onResize(() => { if (cols.length !== nc()) build(); });
  feed(g, (a, b) => {
    const it = [];
    for (let pi = a; pi < b; pi++) L[pi].img.forEach((im, ii) => it.push([pi, ii]));
    done = done.concat(it);
    return place(it);
  });
}

/* ---------- 05 Streifen ---------- */
function initStreifen(g) {
  if (!g) return;
  hoverOn(g);
  const size = () => {
    const w = g.clientWidth, col = w < 700;
    g.classList.toggle('is-col', col);
    $$('.as__h', g).forEach(h => {
      const n = h.children.length;
      /* Telefon: offener Streifen im Format 3:2, die anderen 30 px hoch; aktiver Anteil so, dass die anderen 30 px bleiben */
      h.style.setProperty('--g', col ? Math.max(2, (w / 1.5) / 30).toFixed(2) : '9');
      h.style.height = col ? `${Math.round(w / 1.5 + (n - 1) * 34)}px` : '';
    });
  };
  onResize(size);
  feed(g, (a, b) => {
    let html = '';
    for (let pi = a; pi < b; pi++) {
      const n = L[pi].img.length;
      html += `<div class="as__h" style="--n:${n}">` + L[pi].img.map((im, ii) => tile(`as__c${ii ? '' : ' is-on'}`, pi, ii, '(max-width:699px) 100vw, 560px', ' data-tap')).join('') + '</div>';
    }
    const els = frag(html); g.append(...els); size(); return els;
  });
}

/* ---------- 06 Beitrag ---------- */
function initBeitrag(g) {
  if (!g) return;
  feed(g, (a, b) => {
    let html = '';
    for (let pi = a; pi < b; pi++) {
      const p = L[pi], m = p.img.length, r = Math.min(1.5, Math.max(1.25, p.img[0].r));
      html += `<article class="ap__p" style="--r:${r}" aria-label="${esc(p.name)}">`
        + `<div class="ap__media"><div class="ap__car" data-car>` + p.img.map((im, ii) => tile(`ap__c${im.r < 1 ? ' is-hoch' : ''}`, pi, ii, '(max-width:699px) 100vw, 520px')).join('') + `</div>`
        + (m > 1 ? `<span class="info ap__cnt" data-cnt>1 / ${m}</span><button class="ap__ab ap__ab--l" type="button" data-go="-1" aria-label="Voriges Bild" hidden><i></i></button><button class="ap__ab ap__ab--r" type="button" data-go="1" aria-label="Nächstes Bild"><i></i></button>` : '')
        + `</div>` + (m > 1 ? `<div class="ap__dots" aria-hidden="true">${p.img.map((im, ii) => `<i${ii ? '' : ' class="is-on"'}></i>`).join('')}</div>` : '') + `</article>`;
    }
    const els = frag(html); g.append(...els);
    els.forEach(post => {
      const car = $('[data-car]', post), cnt = $('[data-cnt]', post), dots = $$('.ap__dots i', post), l = $('[data-go="-1"]', post), r = $('[data-go="1"]', post);
      if (!cnt) return;
      const m = car.children.length;
      let cur = 0;
      const mark = () => {
        const i = Math.round(car.scrollLeft / car.clientWidth);
        if (i === cur) return;
        cur = i; cnt.textContent = `${i + 1} / ${m}`;
        dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
        l.hidden = i === 0; r.hidden = i === m - 1;
      };
      car.addEventListener('scroll', mark, { passive: true });
      post.addEventListener('click', e => {
        const b = e.target.closest('[data-go]'); if (!b) return;
        car.scrollTo({ left: (cur + +b.dataset.go) * car.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    return els;
  });
}

/* ---------- Sprungleiste ---------- */
function initSwitch() {
  const sw = $('[data-aswitch]'), links = $$('a', sw), secs = links.map(a => $(a.getAttribute('href'))), start = $('#a-start'), ft = $('[data-footer]');
  let raf = 0;
  const upd = () => {
    raf = 0;
    const vh = innerHeight, show = start.getBoundingClientRect().bottom < vh * .5 && ft.getBoundingClientRect().top > vh * .8;
    sw.classList.toggle('is-on', show);
    let cur = -1;
    secs.forEach((s, k) => { const r = s.getBoundingClientRect(); if (r.top < vh * .5 && r.bottom > vh * .5) cur = k; });
    links.forEach((a, k) => { a.classList.toggle('is-cur', k === cur); if (k === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(upd); };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); upd();
}

/* ---------- Leuchtkasten ---------- */
function initLb() {
  const d = $('[data-alb]'), stage = $('[data-alb-stage]', d), A = $('[data-alb-a]', d), B = $('[data-alb-b]', d);
  const cnt = $('[data-alb-cnt]', d), t = $('[data-alb-t]', d), th = $('[data-alb-th]', d), x = $('[data-alb-close]', d);
  let k = 0, hp = -1, back = null, shutT = 0;
  const setImg = (el, im) => {
    const key = im.l;
    el.dataset.k = key; el.alt = im.alt || ''; el.style.objectPosition = '';
    el.src = im.m;
    const big = new Image(); big.decoding = 'async'; big.src = im.l;
    (big.decode ? big.decode() : Promise.resolve()).then(() => { if (el.dataset.k === key) el.src = im.l; }).catch(() => {});
  };
  const render = () => {
    const { pi, ii } = ALL[k], p = L[pi];
    cnt.textContent = `${pad2(ii + 1)} / ${pad2(p.img.length)}`;
    if (pi !== hp) {
      hp = pi;
      t.textContent = p.name;
      th.innerHTML = p.img.map((im, j) => `<button class="alb__tb" type="button" data-j="${j}" aria-label="Bild ${j + 1} von ${p.img.length}"><img src="${im.t}" alt="" decoding="async"></button>`).join('');
    }
    $$('.alb__tb', th).forEach((b, j) => { b.classList.toggle('is-cur', j === ii); if (j === ii) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    const cb = $('.alb__tb.is-cur', th);
    if (cb) th.scrollTo({ left: cb.offsetLeft - th.clientWidth / 2 + cb.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  };
  const go = (to, dir) => {
    to = mod(to, ALL.length);
    if (to === k) return;
    k = to;
    const im = ALL[k].im;
    B.getAnimations().forEach(a => a.finish());
    render();
    if (reduce) { setImg(A, im); return; }
    setImg(B, im); B.style.visibility = 'visible';
    A.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 3}%)` }], { duration: 500, easing: EASE });
    B.animate([{ opacity: 0, transform: `translateX(${dir * 4}%)` }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EASE }).onfinish = () => {
      A.dataset.k = B.dataset.k; A.alt = B.alt; A.src = B.src; B.style.visibility = 'hidden';
    };
  };
  /* Rechteck, das ein Bild mit Seitenverhältnis r in der Bühne einnimmt (contain) */
  const fit = r => { const s = stage.getBoundingClientRect(); let w = s.width, h = w / r; if (h > s.height) { h = s.height; w = h * r; } return { left: s.left + (s.width - w) / 2, top: s.top + (s.height - h) / 2, width: w, height: h }; };
  const flight = (src, r) => {
    const r0 = src.getBoundingClientRect();
    if (r0.width < 8 || r0.bottom < 0 || r0.top > innerHeight) return;
    const r1 = fit(r), gh = document.createElement('img');
    gh.className = 'alb__ghost'; gh.alt = ''; gh.src = src.currentSrc || src.src;
    d.append(gh); A.style.opacity = '0';
    gh.animate([
      { left: `${r0.left}px`, top: `${r0.top}px`, width: `${r0.width}px`, height: `${r0.height}px` },
      { left: `${r1.left}px`, top: `${r1.top}px`, width: `${r1.width}px`, height: `${r1.height}px` },
    ], { duration: 720, easing: 'cubic-bezier(.65,.05,.36,1)', fill: 'forwards' }).onfinish = () => {
      A.style.opacity = '';
      gh.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).onfinish = () => gh.remove();
    };
  };
  const lock = v => { document.documentElement.style.overflow = v ? 'hidden' : ''; };
  function open(pi, ii, src) {
    clearTimeout(shutT);
    back = document.activeElement;
    k = ALL.findIndex(o => o.pi === pi && o.ii === ii); if (k < 0) k = 0;
    hp = -1; render(); setImg(A, ALL[k].im); B.style.visibility = 'hidden';
    if (!d.open) d.showModal();
    lock(true);
    x.focus({ preventScroll: true });
    if (!reduce && src) flight(src, ALL[k].im.r);
    requestAnimationFrame(() => d.classList.add('is-open'));
  }
  function shut() {
    if (!d.open) return;
    d.classList.remove('is-open');
    shutT = setTimeout(() => { d.close(); lock(false); $$('.alb__ghost', d).forEach(e => e.remove()); A.style.opacity = ''; if (back && back.focus) back.focus({ preventScroll: true }); }, reduce ? 0 : 360);
  }
  x.addEventListener('click', shut);
  d.addEventListener('cancel', e => { e.preventDefault(); shut(); });
  d.addEventListener('click', e => { if (e.target === d || e.target === stage || e.target.classList.contains('alb__top') || e.target.classList.contains('alb__foot')) shut(); });
  $('[data-alb-prev]', d).addEventListener('click', () => go(k - 1, -1));
  $('[data-alb-next]', d).addEventListener('click', () => go(k + 1, 1));
  th.addEventListener('click', e => { const b = e.target.closest('.alb__tb'); if (!b) return; const j = +b.dataset.j, ii = ALL[k].ii; go(k + j - ii, j >= ii ? 1 : -1); });
  d.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(k + 1, 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(k - 1, -1); }
  });
  let sx = null, sy = 0;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(k + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    else if (Math.abs(dy) > 90 && dy > 0) shut();   // nach unten wischen schließt
  });
  stage.addEventListener('pointercancel', () => { sx = null; });
  return { open };
}

/* ---------- Start (am Ende, damit alle Muster und Helfer oben schon stehen) ---------- */
LB = initLb();
run('album', () => initAlbum($('[data-a="album"]')));
run('raster', () => initRaster($('[data-a="raster"]')));
run('bento', () => initBento($('[data-a="bento"]')));
run('mauer', () => initMauer($('[data-a="mauer"]')));
run('streifen', () => initStreifen($('[data-a="streifen"]')));
run('beitrag', () => initBeitrag($('[data-a="beitrag"]')));
run('switch', initSwitch);
