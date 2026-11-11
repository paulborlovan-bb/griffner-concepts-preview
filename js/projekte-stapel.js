/* Referenzen, Variante B (projects-b.html): Stapel. Jedes Projekt ist eine große Bildkarte. Die Karten bleiben oben stehen,
   die nächste schiebt sich beim Scrollen darüber. Der Scroll steuert alles: die ankommende Karte geht von schmal auf volle Breite auf
   und ihr Bild zoomt zurück, die verdeckte Karte weicht nach hinten (kleiner, dunkler, ihre Oberkante bleibt als Kante stehen).
   Etikett unten links in der Farbe der Sektion (wie Variante A), deckt sich auf, sobald die Karte steht.
   Maus über das Bild wandert durch die Bilder des Projekts (Striche oben), am Telefon wischen. Filter Alle / Häuser / Building.
   Klick öffnet die Projektansicht: Vollbild schwarz, wächst aus der Karte, Bilder als Filmstreifen in ihrem Format (Mausrad, Wischen,
   Pfeile, Pfeiltasten), darunter Name, Text, Daten, unten vorheriges und nächstes Projekt. Esc, Zurück-Taste oder Schließen geht zurück
   in die Karte. Daten aus data/referenzen.js (REFERENZEN, kat). */
import { loop, $, $$, clamp, reduce, vhs } from './core.js';

const DIR = 'assets/img/projekte/ref/', EASE = 'cubic-bezier(.22,1,.36,1)';
const pad2 = n => String(n).padStart(2, '0');
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const KAT = [['', 'Alle'], ['haus', 'Häuser'], ['building', 'Building']];
const smooth = x => x * x * (3 - 2 * x);
const imgAttrs = (m, sizes) => m.s
  ? `src="${DIR}${m.s}-m.webp" srcset="${DIR}${m.s}-m.webp 960w, ${DIR}${m.s}-l.webp 1920w" sizes="${sizes}"`
  : `src="${m.src}"`;

export function initStapel(el, list) {
  if (!el || !list || !list.length) return;
  const count = k => list.filter(p => !k || p.kat === k).length;
  const card = (p, i) => {
    const n = p.img.length;
    const imgs = p.img.map((m, k) => `<img ${imgAttrs(m, '(min-width:700px) 94vw, 100vw')} alt="${k ? '' : esc(m.alt)}" loading="${i < 2 && !k ? 'eager' : 'lazy'}" decoding="async" draggable="false"${m.pos ? ` style="object-position:${m.pos}"` : ''}>`).join('');
    return `<i class="rv__mk" aria-hidden="true"></i><article class="rv__t" data-kat="${p.kat || ''}"><div class="rv__in">`
      + `<div class="rv__frame"><div class="rv__strip">${imgs}</div>${n > 1 ? `<div class="rv__bars" aria-hidden="true">${'<i></i>'.repeat(n)}</div>` : ''}`
      + `<span class="rv__go" aria-hidden="true"></span><span class="rv__dim" aria-hidden="true"></span></div>`
      + `<div class="rv__card"><p class="info rv__art"><span class="rv__no"></span><span class="rv__inf">${esc(p.info)}</span></p>`
      + `<h3 class="rv__name"><button class="rv__open" type="button" aria-haspopup="dialog">${esc(p.name)}</button></h3>`
      + `<p class="info rv__meta"><span class="rv__n">${n} ${n > 1 ? 'Bilder' : 'Bild'}</span><span class="rv__cta">Projekt ansehen <i aria-hidden="true"></i></span></p></div>`
      + `</div></article>`;
  };
  el.innerHTML = `<div class="rv__top"><div class="rv__chips" role="group" aria-label="Projekte filtern">${KAT.map(([k, l]) => `<button class="rv__chip" type="button" data-k="${k}" aria-pressed="${k ? 'false' : 'true'}">${l}<sup>${count(k)}</sup></button>`).join('')}</div></div>`
    + `<div class="rv__stack">${list.map(card).join('')}<i class="rv__end" aria-hidden="true"></i></div>`
    + `<dialog class="rvd" aria-labelledby="rvd-name"><div class="rvd__in" tabindex="-1">`
    + `<div class="rvd__top"><p class="info rvd__pos"></p><button class="rvd__x" type="button">Schließen <i aria-hidden="true"></i></button></div>`
    + `<div class="rvd__gal"><div class="rvd__strip" tabindex="0" aria-label="Bilder"></div></div>`
    + `<div class="rvd__bar"><span class="info rvd__cnt" aria-live="polite"></span><span class="rvd__prog" aria-hidden="true"><i></i></span><button class="rvd__btn" type="button" data-d="-1" aria-label="Vorheriges Bild">←</button><button class="rvd__btn" type="button" data-d="1" aria-label="Nächstes Bild">→</button></div>`
    + `<div class="rvd__txt"><div class="rvd__t1"><p class="info rvd__art"></p><h2 class="rvd__name" id="rvd-name"></h2></div><div class="rvd__t2"></div><div class="rvd__t3"></div></div>`
    + `<div class="rvd__pn"><button class="rvd__pnb" type="button" data-d="-1"><span class="info">← Vorheriges<span class="rvd__pw"> Projekt</span></span><span class="rvd__pnn"></span></button><button class="rvd__pnb rvd__pnb--r" type="button" data-d="1"><span class="info">Nächstes<span class="rvd__pw"> Projekt</span> →</span><span class="rvd__pnn"></span></button></div>`
    + `</div></dialog>`;

  const stack = $('.rv__stack', el), chips = $$('.rv__chip', el), html = document.documentElement;
  const mks = $$('.rv__mk', stack);
  const T = $$('.rv__t', el).map((t, i) => ({
    el: t, mk: mks[i], p: list[i], inn: $('.rv__in', t), frame: $('.rv__frame', t), strip: $('.rv__strip', t), dim: $('.rv__dim', t),
    bars: $$('.rv__bars i', t), no: $('.rv__no', t), btn: $('.rv__open', t), n: list[i].img.length, cur: 0, e: -1, c: -1, on: false,
  }));
  let vis = T.slice();

  /* ---------- Stapel ---------- */
  let ST = 96, X = 10, PEEK = 18;  // ST: Oberkante der stehenden Karte, X: Einzug beim Ankommen (%), PEEK: sichtbare Kante der Karte dahinter
  const measure = () => {
    const ph = innerWidth < 700;
    X = ph ? 5 : 10; PEEK = ph ? 10 : 18;
    ST = vis[0] ? parseFloat(getComputedStyle(vis[0].el).top) || 96 : 96;
    vis.forEach((t, j) => { t.no.textContent = `${pad2(j + 1)} / ${pad2(vis.length)}`; t.e = t.c = -1; });
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
    t.el.addEventListener('click', e => { if (!e.target.closest('.rv__open')) open(t, t.cur, !e.detail); });
    t.btn.addEventListener('click', e => open(t, 0, !e.detail));  // detail 0 = per Tastatur ausgelöst
  });
  chips.forEach(c => c.addEventListener('click', () => {
    const k = c.dataset.k;
    chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    T.forEach(t => { const h = !!k && t.p.kat !== k; t.el.hidden = h; t.mk.hidden = h; t.on = false; t.el.classList.remove('is-on'); });
    vis = T.filter(t => !t.el.hidden);
    measure();
    const top = el.getBoundingClientRect().top;
    if (top < 0) scrollTo({ top: scrollY + top - 120, behavior: 'auto' });  // wer mitten im Stapel filtert, landet wieder am Anfang
    if (!reduce) stack.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: EASE });
    if (reduce) vis.forEach(t => t.el.classList.add('is-on'));
    loop.poke();
  }));
  measure();
  addEventListener('resize', () => { measure(); loop.poke(); });
  if (reduce) T.forEach(t => t.el.classList.add('is-on'));
  loop.add({ tick() {
    if (reduce || !vis.length) return;
    const vh = vhs(), sr = stack.getBoundingClientRect();
    if (sr.bottom < -vh * .5 || sr.top > vh * 1.5) return;
    /* e: wie weit die Karte angekommen ist (0 = unten am Rand, 1 = steht), c: wie weit die nächste sie wirklich überdeckt
       (am Telefon ist die nächste schon unten zu sehen, bevor sie die stehende berührt) */
    const R = vis.map(t => t.el.getBoundingClientRect());
    vis.forEach((t, j) => {
      const r = R[j], e = clamp((vh - r.top) / Math.max(1, vh - ST));
      const c = j + 1 < vis.length ? clamp((ST + r.height - R[j + 1].top) / Math.max(1, r.height)) : 0;
      if (Math.abs(e - t.e) < 1e-4 && Math.abs(c - t.c) < 1e-4) return;
      t.e = e; t.c = c;
      const k = 1 - smooth(e);  // Einzug und Zoom laufen über den ganzen Weg nach oben
      t.el.style.setProperty('--x', `${(k * X).toFixed(2)}%`);
      t.strip.style.transform = k > 1e-4 ? `scale(${(1 + .2 * k).toFixed(4)})` : '';
      t.inn.style.transform = c > 1e-4 ? `translate3d(0,${(-c * PEEK).toFixed(1)}px,0) scale(${(1 - .05 * c).toFixed(4)})` : '';
      t.dim.style.opacity = (c * .6).toFixed(3);
      const on = e > .62 && c < .5;
      if (on !== t.on) { t.on = on; t.el.classList.toggle('is-on', on); }
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
    dstrip.innerHTML = p.img.map(m => `<img ${imgAttrs(m, '(min-width:1024px) 70vw, 100vw')} alt="${esc(m.alt)}" decoding="async" draggable="false"${m.pos ? ` style="object-position:${m.pos}"` : ''}>`).join('');
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
    html.classList.add('rv-lock');
    dlg.showModal();
    requestAnimationFrame(() => slideTo(k, 'auto'));
    history.scrollRestoration = 'manual';  // Zurück soll den Stapel nicht auf die alte Stelle zurückspringen lassen (Nachbarprojekt)
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
    const t = cur, done = () => { dlg.close(); html.classList.remove('rv-lock'); busy = false; history.scrollRestoration = 'auto'; t.btn.focus({ preventScroll: true }); };
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
  /* Nachbarprojekt: Inhalt blendet um, im Hintergrund springt der Stapel zu dieser Karte, damit das Schließen dort landet */
  pnb.forEach(b => b.addEventListener('click', () => {
    if (busy) return;
    const t = neighbour(+b.dataset.d), swap = () => {
      fill(t); dstrip.scrollLeft = 0;
      const y = Math.round(t.mk.getBoundingClientRect().top + scrollY - ST);
      if (Math.abs(y - scrollY) > 1) { html.classList.remove('rv-lock'); scrollTo({ top: y, behavior: 'auto' }); html.classList.add('rv-lock'); loop.poke(); }
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
