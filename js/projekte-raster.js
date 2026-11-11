/* Referenzen, Variante B (projects-b.html): Raster statt Band. Alle Projekte auf einen Blick, Filter Alle / Häuser / Building.
   Kacheln in wechselnden Größen (Muster RAST unten, auch nach dem Filtern), die letzte Reihe füllt sich auf.
   Kachel: Maus über das Bild wandert durch die Bilder des Projekts (Striche oben zeigen wo), am Telefon wischen; gelbes Feld mit Plus.
   Beim Hereinscrollen deckt sich das Bild von unten auf, die Bilder gleiten leicht (Parallax).
   Klick öffnet die Projektansicht: Vollbild schwarz, wächst aus der Kachel, Bilder als Filmstreifen in ihrem Format (Mausrad, Wischen,
   Pfeile, Pfeiltasten), darunter Name, Text, Daten, unten vorheriges und nächstes Projekt. Esc, Zurück-Taste oder Schließen geht zurück
   in die Kachel. Daten aus data/referenzen.js (REFERENZEN, kat). */
import { loop, $, $$, clamp, reduce, vhs } from './core.js';

const DIR = 'assets/img/projekte/ref/', EASE = 'cubic-bezier(.22,1,.36,1)';
const pad2 = n => String(n).padStart(2, '0');
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const KAT = [['', 'Alle'], ['haus', 'Häuser'], ['building', 'Building']];
/* Reihen-Muster in Spalten von 12; Seitenverhältnis je Breite */
const RAST = {
  wide: { rows: [[7, 5], [4, 4, 4], [5, 7], [4, 4, 4]], r: { 12: '21 / 9', 7: '16 / 11', 6: '4 / 3', 5: '1 / 1', 4: '4 / 5' } },
  mid: { rows: [[12], [6, 6], [6, 6]], r: { 12: '16 / 9', 6: '4 / 5' } },
};
const imgAttrs = (m, sizes) => m.s
  ? `src="${DIR}${m.s}-m.webp" srcset="${DIR}${m.s}-m.webp 960w, ${DIR}${m.s}-l.webp 1920w" sizes="${sizes}"`
  : `src="${m.src}"`;

export function initRaster(el, list) {
  if (!el || !list || !list.length) return;
  const count = k => list.filter(p => !k || p.kat === k).length;
  const tile = (p, i) => {
    const n = p.img.length;
    const imgs = p.img.map((m, k) => `<img ${imgAttrs(m, '(min-width:1024px) 58vw, (min-width:700px) 50vw, 100vw')} alt="${k ? '' : esc(m.alt)}" loading="lazy" decoding="async" draggable="false"${m.pos ? ` style="object-position:${m.pos}"` : ''}>`).join('');
    return `<article class="rv__t" data-i="${i}" data-kat="${p.kat || ''}">`
      + `<div class="rv__frame"><div class="rv__strip">${imgs}</div>${n > 1 ? `<div class="rv__bars" aria-hidden="true">${'<i></i>'.repeat(n)}</div>` : ''}<span class="rv__go" aria-hidden="true"></span></div>`
      + `<div class="rv__cap"><p class="info rv__art"><span class="rv__no">${pad2(i + 1)}</span><span>${esc(p.info)}</span></p><span class="info rv__n">${n} ${n > 1 ? 'Bilder' : 'Bild'}</span>`
      + `<h3 class="rv__name"><button class="rv__open" type="button" aria-haspopup="dialog">${esc(p.name)}</button></h3></div></article>`;
  };
  el.innerHTML = `<div class="rv__top"><div class="rv__chips" role="group" aria-label="Projekte filtern">${KAT.map(([k, l]) => `<button class="rv__chip" type="button" data-k="${k}" aria-pressed="${k ? 'false' : 'true'}">${l}<sup>${count(k)}</sup></button>`).join('')}</div></div>`
    + `<div class="rv__grid">${list.map(tile).join('')}</div>`
    + `<dialog class="rvd" aria-labelledby="rvd-name"><div class="rvd__in" tabindex="-1">`
    + `<div class="rvd__top"><p class="info rvd__pos"></p><button class="rvd__x" type="button">Schließen <i aria-hidden="true"></i></button></div>`
    + `<div class="rvd__gal"><div class="rvd__strip" tabindex="0" aria-label="Bilder"></div></div>`
    + `<div class="rvd__bar"><span class="info rvd__cnt" aria-live="polite"></span><span class="rvd__prog" aria-hidden="true"><i></i></span><button class="rvd__btn" type="button" data-d="-1" aria-label="Vorheriges Bild">←</button><button class="rvd__btn" type="button" data-d="1" aria-label="Nächstes Bild">→</button></div>`
    + `<div class="rvd__txt"><div class="rvd__t1"><p class="info rvd__art"></p><h2 class="rvd__name" id="rvd-name"></h2></div><div class="rvd__t2"></div><div class="rvd__t3"></div></div>`
    + `<div class="rvd__pn"><button class="rvd__pnb" type="button" data-d="-1"><span class="info">← Vorheriges<span class="rvd__pw"> Projekt</span></span><span class="rvd__pnn"></span></button><button class="rvd__pnb rvd__pnb--r" type="button" data-d="1"><span class="info">Nächstes<span class="rvd__pw"> Projekt</span> →</span><span class="rvd__pnn"></span></button></div>`
    + `</div></dialog>`;

  const grid = $('.rv__grid', el), chips = $$('.rv__chip', el);
  const T = $$('.rv__t', el).map((t, i) => ({ el: t, p: list[i], frame: $('.rv__frame', t), strip: $('.rv__strip', t), bars: $$('.rv__bars i', t), no: $('.rv__no', t), btn: $('.rv__open', t), n: list[i].img.length, cur: 0 }));
  let vis = T.slice();

  /* ---------- Raster ---------- */
  const mode = () => innerWidth >= 1024 ? 'wide' : innerWidth >= 700 ? 'mid' : 'phone';
  const put = (t, span, ratio, col) => { t.el.style.gridColumn = `span ${span}`; t.el.style.setProperty('--r', ratio); t.el.style.setProperty('--c', col); };
  const layout = () => {
    const m = mode();
    vis.forEach((t, j) => { t.no.textContent = pad2(j + 1); });
    if (m === 'phone') { vis.forEach(t => put(t, 12, '4 / 3', 0)); return; }
    const { rows, r } = RAST[m];
    /* Eine Reihe hat eine Höhe: die größte Kachel gibt ihr Format vor, die anderen bekommen ihre Breite zu dieser Höhe */
    const cs = getComputedStyle(grid), gap = parseFloat(cs.columnGap) || 24, colW = (grid.clientWidth - 11 * gap) / 12, wOf = s => s * colW + (s - 1) * gap;
    const rat = s => { const [a, b] = (r[s] || '4 / 5').split('/').map(Number); return a / b; };
    for (let k = 0, row = 0; k < vis.length; row++) {
      let cols = rows[row % rows.length];
      const left = vis.length - k;
      if (left < cols.length) cols = left === 1 ? [12] : left === 2 ? (m === 'mid' ? [6, 6] : [7, 5]) : cols.slice(0, left);
      const lead = Math.max(...cols), H = wOf(lead) / rat(lead);
      cols.forEach((s, c) => put(vis[k + c], s, `${wOf(s).toFixed(1)} / ${H.toFixed(1)}`, c));
      k += cols.length;
    }
  };
  const bars = t => t.bars.forEach((b, k) => b.classList.toggle('is-on', k === t.cur));
  const go = (t, k) => { if (k === t.cur) return; t.cur = k; t.strip.scrollLeft = k * t.strip.clientWidth; bars(t); };
  const eager = t => $$('img', t.strip).forEach(im => { im.loading = 'eager'; });
  T.forEach(t => {
    bars(t);
    t.frame.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') eager(t); });
    t.frame.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || t.n < 2) return;
      const r = t.frame.getBoundingClientRect();
      go(t, clamp(Math.floor((e.clientX - r.left) / r.width * t.n), 0, t.n - 1));
    });
    t.frame.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') go(t, 0); });
    t.strip.addEventListener('scroll', () => { const k = Math.round(t.strip.scrollLeft / Math.max(1, t.strip.clientWidth)); if (k !== t.cur) { t.cur = k; bars(t); } }, { passive: true });
    t.el.addEventListener('click', e => { if (!e.target.closest('.rv__open')) open(t, t.cur, !e.detail); });  // ganze Kachel, auch während der Clip-Einblendung
    t.btn.addEventListener('click', e => open(t, 0, !e.detail));  // detail 0 = per Tastatur ausgelöst
  });
  chips.forEach(c => c.addEventListener('click', () => {
    const k = c.dataset.k;
    chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    T.forEach(t => { t.el.hidden = !!k && t.p.kat !== k; });
    vis = T.filter(t => !t.el.hidden);
    layout();
    vis.forEach((t, j) => {
      t.el.classList.add('is-in');
      if (!reduce) t.el.animate([{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: j * 45, easing: EASE, fill: 'backwards' });
    });
    loop.poke();
  }));
  layout();
  addEventListener('resize', () => { layout(); loop.poke(); });
  if (reduce) T.forEach(t => t.el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    T.forEach(t => io.observe(t.el));
  }
  /* Parallax: der Bildstreifen gleitet in der Kachel um bis zu 4 % der Höhe */
  loop.add({ tick() {
    if (reduce) return;
    const r0 = grid.getBoundingClientRect(), vh = vhs();
    if (r0.bottom < -vh * .2 || r0.top > vh * 1.2) return;
    vis.forEach(t => {
      const r = t.frame.getBoundingClientRect(); if (r.bottom < -40 || r.top > vh + 40) return;
      const y = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1) * -r.height * .04;
      t.strip.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
    });
  } });

  /* ---------- Projektansicht ---------- */
  const dlg = $('.rvd', el), inn = $('.rvd__in', dlg), dstrip = $('.rvd__strip', dlg), prog = $('.rvd__prog i', dlg), cnt = $('.rvd__cnt', dlg);
  const pos = $('.rvd__pos', dlg), art = $('.rvd__art', dlg), name = $('.rvd__name', dlg), t2 = $('.rvd__t2', dlg), t3 = $('.rvd__t3', dlg);
  const pnb = $$('.rvd__pnb', dlg), bar = $('.rvd__bar', dlg);
  let cur = null, slides = [], si = 0;
  const neighbour = d => vis[(vis.indexOf(cur) + d + vis.length) % vis.length];
  const fill = t => {
    const p = t.p, n = p.img.length;
    cur = t;
    pos.textContent = `${pad2(vis.indexOf(t) + 1)} / ${pad2(vis.length)}`;
    art.textContent = p.info; name.textContent = p.name;
    t2.innerHTML = (p.text ? `<p class="txt">${esc(p.text)}</p>` : '') + (p.link ? `<a class="rvd__go" href="${esc(p.link.href)}" target="_blank" rel="noopener">${esc(p.link.label)} <span aria-hidden="true">↗</span></a>` : '');
    t3.innerHTML = p.facts ? `<dl class="rvd__facts">${p.facts.map(([a, b]) => `<div><dt class="info">${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : '';
    dstrip.innerHTML = p.img.map((m, k) => `<img ${imgAttrs(m, '(min-width:1024px) 70vw, 100vw')} alt="${esc(m.alt)}" decoding="async" draggable="false"${m.pos ? ` style="object-position:${m.pos}"` : ''}>`).join('');
    slides = $$('img', dstrip);
    slides.forEach(im => { const a = () => { if (im.naturalWidth) im.style.setProperty('--a', `${im.naturalWidth} / ${im.naturalHeight}`); }; if (im.complete) a(); else im.addEventListener('load', a, { once: true }); });
    bar.hidden = n < 2; dlg.classList.toggle('is-solo', n < 2);
    const single = vis.length < 2;
    pnb.forEach(b => { b.hidden = single; $('.rvd__pnn', b).textContent = single ? '' : neighbour(+b.dataset.d).p.name; });
    si = 0; track();
  };
  const pad = () => parseFloat(getComputedStyle(dstrip).paddingLeft) || 0;
  const slideTo = (k, behavior = 'smooth') => {
    k = clamp(k, 0, slides.length - 1); const s = slides[k]; if (!s) return;
    dstrip.scrollTo({ left: s.offsetLeft - pad(), behavior: reduce ? 'auto' : behavior });
  };
  const track = () => {
    const max = dstrip.scrollWidth - dstrip.clientWidth, x = dstrip.scrollLeft;
    let k = 0;
    if (max > 0 && x >= max - 2) k = slides.length - 1;
    else { let d = Infinity; slides.forEach((s, j) => { const dd = Math.abs(s.offsetLeft - pad() - x); if (dd < d) { d = dd; k = j; } }); }
    si = k;
    cnt.textContent = `${pad2(k + 1)} / ${pad2(slides.length)}`;
    prog.style.transform = `scaleX(${max > 0 ? clamp(x / max).toFixed(4) : 1})`;
  };
  dstrip.addEventListener('scroll', track, { passive: true });
  dstrip.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const max = dstrip.scrollWidth - dstrip.clientWidth; if (max <= 0) return;
    e.preventDefault(); dstrip.scrollLeft += e.deltaY;
  }, { passive: false });
  $$('.rvd__btn', dlg).forEach(b => b.addEventListener('click', () => slideTo(si + +b.dataset.d)));
  const rectOf = t => { const r = t.frame.getBoundingClientRect(), W = innerWidth, H = innerHeight; return `inset(${Math.max(0, r.top).toFixed(1)}px ${Math.max(0, W - r.right).toFixed(1)}px ${Math.max(0, H - r.bottom).toFixed(1)}px ${Math.max(0, r.left).toFixed(1)}px)`; };
  let busy = false;
  const open = (t, k = 0, kb = false) => {
    if (busy || dlg.open) return;
    fill(t);
    document.documentElement.classList.add('rv-lock');
    dlg.showModal();
    requestAnimationFrame(() => slideTo(k, 'auto'));
    history.pushState({ rv: 1 }, '');
    if (!reduce) {
      busy = true;
      dlg.animate([{ clipPath: rectOf(t) }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: 780, easing: EASE }).finished.then(() => { busy = false; }, () => { busy = false; });
      inn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 320, easing: EASE, fill: 'backwards' });
      slides.forEach((s, j) => s.animate([{ transform: 'translateX(12%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 360 + j * 60, easing: EASE, fill: 'backwards' }));
    }
    (kb ? $('.rvd__x', dlg) : inn).focus({ preventScroll: true });  // Maus: kein Fokusrahmen auf Schließen
  };
  const shut = () => {
    if (!dlg.open) return;
    const t = cur, done = () => { dlg.close(); document.documentElement.classList.remove('rv-lock'); busy = false; t.btn.focus({ preventScroll: true }); };
    if (reduce) return done();
    busy = true;
    inn.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'linear', fill: 'forwards' }).finished.then(() => {
      const r = rectOf(t);
      dlg.animate([{ clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: r }], { duration: 620, easing: EASE, fill: 'forwards' }).finished.then(() => {
        done(); dlg.getAnimations().forEach(a => a.cancel()); inn.getAnimations().forEach(a => a.cancel());
      }, done);
    }, done);
  };
  const close = () => { if (history.state && history.state.rv) history.back(); else shut(); };
  addEventListener('popstate', () => { if (dlg.open) shut(); });
  $('.rvd__x', dlg).addEventListener('click', close);
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); slideTo(si + (e.key === 'ArrowRight' ? 1 : -1)); }
  });
  /* Nachbarprojekt: Inhalt blendet um, die Kachel im Hintergrund wird mitgescrollt, damit das Schließen dort landet */
  pnb.forEach(b => b.addEventListener('click', () => {
    if (busy) return;
    const t = neighbour(+b.dataset.d), swap = () => {
      fill(t); dstrip.scrollLeft = 0;
      const r = t.frame.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) {
        document.documentElement.classList.remove('rv-lock');
        scrollTo({ top: scrollY + r.top - (innerHeight - r.height) / 2, behavior: 'auto' });
        document.documentElement.classList.add('rv-lock');
      }
    };
    if (reduce) return swap();
    busy = true;
    inn.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'linear' }).finished.then(() => {
      swap(); busy = false;
      inn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: EASE });
      slides.forEach((s, j) => s.animate([{ transform: 'translateX(8%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, delay: j * 50, easing: EASE, fill: 'backwards' }));
      dlg.scrollTop = 0;
    }, () => { busy = false; });
  }));
}
