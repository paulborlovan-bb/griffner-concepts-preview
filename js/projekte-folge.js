/* Referenzen, Variante B (projects-b.html): Folge, gebaut wie die Akte der Concepts Seite (js/akte.js), nur knapper.
   Ein gepinntes Bild für alle Projekte. Links die nummerierte Liste (wo du bist, Linie füllt sich, Klick springt).
   Rechts Art und Ort, der Name groß, die Bildfolge im Rahmen, darunter der Satz mit kleinem Bild am Anfang, Linie, Projekt ansehen, Daten.
   Jeder Scrollschritt (STEP Bildschirmhöhe) bringt das nächste Projekt: sein Bild schiebt sich von rechts über das aktuelle, das aktuelle
   weicht etwas nach links (wie die Bildwechsel der Akte), Name und Satz laufen Wort für Wort neu herein. Pfeile und Wischen blättern
   durch die Bilder des Projekts. Klick auf das Bild oder Projekt ansehen öffnet die Projektansicht (Vollbild schwarz, aus dem Rahmen),
   Esc oder Zurück schließt. Schmal: die Liste wird eine Leiste unter dem Kopf. Daten aus data/referenzen.js (REFERENZEN). */
import { loop, $, $$, clamp, seg, reduce, vhs } from './core.js';

const DIR = 'assets/img/projekte/ref/', EASE = 'cubic-bezier(.22,1,.36,1)';
const STEP = .5, REST = .38, TAIL = .3;  // je Projekt eine halbe Bildschirmhöhe, davon REST Ruhe; am Ende TAIL stehen bleiben
const pad2 = n => String(n).padStart(2, '0');
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const io = t => t < .5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2;
const src = (m, size = 'm') => m.s ? `${DIR}${m.s}-${size}.webp` : m.src;
const imgAttrs = (m, sizes) => m.s
  ? `src="${DIR}${m.s}-m.webp" srcset="${DIR}${m.s}-m.webp 960w, ${DIR}${m.s}-l.webp 1920w" sizes="${sizes}"`
  : `src="${m.src}"`;
const words = s => s.split(/\s+/).filter(Boolean).map(w => `<span class="rf__w"><span>${esc(w)}</span></span>`).join(' ');

export function initFolge(el, list) {
  if (!el || !list || !list.length) return;
  const N = list.length;
  const layer = (p, i) => `<div class="rf__lay"${i ? ' aria-hidden="true"' : ''}>${p.img.map((m, k) => `<div class="rf__sl"><img ${imgAttrs(m, '(min-width:1024px) 72vw, 100vw')} alt="${esc(m.alt)}" loading="${i < 2 && !k ? 'eager' : 'lazy'}" decoding="async" draggable="false"${m.pos ? ` style="object-position:${m.pos}"` : ''}></div>`).join('')}</div>`;
  el.innerHTML = `<div class="rf__pin"><div class="rf__stage">`
    + `<nav class="rf__nav" aria-label="Projekte"><ol class="rf__list">${list.map((p, i) => `<li><button class="rf__link" type="button" data-i="${i}"><span class="info">${pad2(i + 1)}</span><span class="rf__ln">${esc(p.name)}</span><i aria-hidden="true"></i></button></li>`).join('')}</ol></nav>`
    + `<div class="rf__main">`
    + `<div class="rf__head"><p class="info rf__art"></p><h3 class="rf__h"></h3></div>`
    + `<div class="rf__frame" role="group" aria-roledescription="Bildfolge"><div class="rf__lays">${list.map(layer).join('')}</div>`
    + `<span class="info rf__count"></span><div class="rf__arrows"><button type="button" class="rf__arrow" data-d="-1" aria-label="Vorheriges Bild">←</button><button type="button" class="rf__arrow" data-d="1" aria-label="Nächstes Bild">→</button></div></div>`
    + `<div class="rf__foot"><p class="rf__say"></p><div class="rf__rule"></div><div class="rf__row"><button class="rf__go" type="button" aria-haspopup="dialog">Projekt ansehen</button><ul class="info rf__facts"></ul></div></div>`
    + `</div></div></div>`
    + `<dialog class="rvd" aria-labelledby="rvd-name"><div class="rvd__in" tabindex="-1">`
    + `<div class="rvd__top"><p class="info rvd__pos"></p><button class="rvd__x" type="button">Schließen <i aria-hidden="true"></i></button></div>`
    + `<div class="rvd__gal"><div class="rvd__strip" tabindex="0" aria-label="Bilder"></div></div>`
    + `<div class="rvd__bar"><span class="info rvd__cnt" aria-live="polite"></span><span class="rvd__prog" aria-hidden="true"><i></i></span><button class="rvd__btn" type="button" data-d="-1" aria-label="Vorheriges Bild">←</button><button class="rvd__btn" type="button" data-d="1" aria-label="Nächstes Bild">→</button></div>`
    + `<div class="rvd__txt"><div class="rvd__t1"><p class="info rvd__art"></p><h2 class="rvd__name" id="rvd-name"></h2></div><div class="rvd__t2"></div><div class="rvd__t3"></div></div>`
    + `<div class="rvd__pn"><button class="rvd__pnb" type="button" data-d="-1"><span class="info">← Vorheriges<span class="rvd__pw"> Projekt</span></span><span class="rvd__pnn"></span></button><button class="rvd__pnb rvd__pnb--r" type="button" data-d="1"><span class="info">Nächstes<span class="rvd__pw"> Projekt</span> →</span><span class="rvd__pnn"></span></button></div>`
    + `</div></dialog>`;

  const pin = $('.rf__pin', el), frame = $('.rf__frame', el), html = document.documentElement;
  const art = $('.rf__art', el), hh = $('.rf__h', el), say = $('.rf__say', el), facts = $('.rf__facts', el), count = $('.rf__count', el);
  const arrows = $('.rf__arrows', el), links = $$('.rf__link', el), bar = $('.rf__list', el), goBtn = $('.rf__go', el);
  const P = $$('.rf__lay', el).map((l, i) => ({ i, p: list[i], lay: l, sl: $$('.rf__sl', l), n: list[i].img.length, tgt: 0, pos: 0, sv: [], v: null }));

  /* Länge des Pins: ein Bildschirm plus je Projekt STEP, plus TAIL zum Stehenbleiben am Ende */
  const size = () => { pin.style.height = `${Math.round(vhs() * (1 + (N - 1) * STEP + TAIL))}px`; };
  size();
  const yOf = i => pin.getBoundingClientRect().top + scrollY + i * STEP * vhs() + 1;

  const sayHTML = p => { const im = p.img[1] || p.img[0]; return p.text ? `<span class="rf__thumb"><img src="${src(im)}" alt="" decoding="async"></span>${words(p.text)}` : ''; };
  const factsHTML = p => (p.facts || []).slice(0, 3).map(([a, b]) => `<li><span>${esc(a)}</span> ${esc(b)}</li>`).join('') + `<li>${p.img.length} ${p.img.length > 1 ? 'Bilder' : 'Bild'}</li>`;
  /* Unterer Block so hoch wie der höchste aller Projekte: so bleibt der Rahmen beim Wechsel gleich groß */
  const foot = $('.rf__foot', el);
  const measureFoot = () => {
    foot.style.minHeight = '';
    const c = foot.cloneNode(true);
    c.style.cssText = `position:absolute;left:0;top:0;width:${foot.clientWidth}px;visibility:hidden;pointer-events:none`;
    c.setAttribute('aria-hidden', 'true'); foot.parentNode.appendChild(c);
    const cs = $('.rf__say', c), cf = $('.rf__facts', c);
    let mx = 0;
    list.forEach(p => { cs.innerHTML = sayHTML(p); cs.hidden = !p.text; cf.innerHTML = factsHTML(p); mx = Math.max(mx, c.offsetHeight); });
    c.remove(); foot.style.minHeight = `${Math.ceil(mx)}px`;
  };
  /* Name immer einzeilig, lange Namen werden kleiner: so springt der Rahmen beim Wechsel nicht */
  const fit = () => {
    hh.style.fontSize = hh.style.paddingTop = '';
    const w = hh.clientWidth, sw = hh.scrollWidth, h0 = hh.offsetHeight;
    if (sw <= w + 1) return;
    hh.style.fontSize = `${(parseFloat(getComputedStyle(hh).fontSize) * Math.max(.55, w / sw * .98)).toFixed(1)}px`;
    hh.style.paddingTop = `${Math.max(0, h0 - hh.offsetHeight)}px`;  // gleiche Höhe wie ein normaler Name, Text sitzt unten
  };
  /* Text des aktiven Projekts, läuft Wort für Wort herein */
  let cur = -1;
  const text = (i, anim) => {
    const p = list[i];
    art.textContent = p.info;
    hh.innerHTML = words(p.name); fit();
    say.innerHTML = sayHTML(p); say.hidden = !p.text;
    facts.innerHTML = factsHTML(p);
    goBtn.setAttribute('aria-label', `Projekt ${p.name} ansehen`);
    frame.setAttribute('aria-label', `Bilder von ${p.name}`);
    if (!anim || reduce) return;
    $$('.rf__w>span', hh).forEach((s, j) => s.animate([{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 760, delay: j * 50, easing: EASE, fill: 'backwards' }));
    $$('.rf__w>span', say).forEach((s, j) => s.animate([{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 700, delay: 120 + j * 16, easing: EASE, fill: 'backwards' }));
    const th = $('.rf__thumb', say); if (th) th.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 700, delay: 80, easing: EASE, fill: 'backwards' });
    [art, facts].forEach((x, j) => x.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 60 + j * 160, easing: EASE, fill: 'backwards' }));
  };
  const setCur = (i, anim) => {
    if (i === cur) return;
    cur = i; text(i, anim);
    P.forEach(q => q.lay.setAttribute('aria-hidden', String(q.i !== i)));
    links.forEach((l, j) => { l.classList.toggle('is-cur', j === i); if (j === i) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
    const q = P[i]; arrows.hidden = q.n < 2; count.hidden = q.n < 2; counter(q);
    /* schmal: die Leiste schiebt das aktuelle Projekt ins Bild */
    if (bar.scrollWidth > bar.clientWidth + 2) bar.scrollTo({ left: links[i].parentNode.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
  };
  const counter = q => { count.textContent = `${pad2(((Math.round(q.pos) % q.n) + q.n) % q.n + 1)} / ${pad2(q.n)}`; };

  /* Bildwechsel wie in den Akten: das nächste schiebt sich von rechts darüber, das aktuelle weicht um ein Drittel nach links */
  const shift = (v, d) => (d > 0 ? d * 100 : d * 32).toFixed(2);
  const placeLayers = pos => P.forEach(q => {
    const d = q.i - pos, v = d > -1 && d < 1 ? Math.round(d * 1000) / 1000 : 9;
    if (v === q.v) return; q.v = v;
    if (v === 9) { q.lay.style.visibility = 'hidden'; return; }
    q.lay.style.visibility = ''; q.lay.style.zIndex = v > 0 ? 2 : 1;
    q.lay.style.transform = `translate3d(${shift(0, v)}%,0,0)`;
    q.sl.forEach(s => { const im = $('img', s); if (im.loading === 'lazy' && s === q.sl[0]) im.loading = 'eager'; });
  });
  const placeSlides = q => q.sl.forEach((s, j) => {
    let d = ((j - q.pos) % q.n + q.n) % q.n; if (d > q.n / 2) d -= q.n;
    const v = d > -1 && d < 1 ? Math.round(d * 1000) / 1000 : 9;
    if (v === q.sv[j]) return; q.sv[j] = v;
    if (v === 9) { s.style.visibility = 'hidden'; return; }
    s.style.visibility = ''; s.style.zIndex = v > 0 ? 2 : 1;
    s.style.transform = `translate3d(${shift(0, v)}%,0,0)`;
    const im = $('img', s); if (im.loading === 'lazy') im.loading = 'eager';
  });
  P.forEach(placeSlides);
  const step = d => { const q = P[cur]; if (!q || q.n < 2) return; q.tgt += d; loop.poke(); };
  $$('.rf__arrow', el).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); step(+b.dataset.d); }));
  let tx = 0, ty = 0, swiped = false;
  frame.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; swiped = false; }, { passive: true });
  frame.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped = true; step(dx < 0 ? 1 : -1); }
  }, { passive: true });
  frame.addEventListener('click', e => { if (swiped || e.target.closest('.rf__arrows')) return; const q = P[cur]; open(q, ((Math.round(q.tgt) % q.n) + q.n) % q.n, !e.detail); });
  goBtn.addEventListener('click', e => { const q = P[cur]; open(q, ((Math.round(q.tgt) % q.n) + q.n) % q.n, !e.detail); });
  links.forEach(l => l.addEventListener('click', () => scrollTo({ top: yOf(+l.dataset.i), behavior: reduce ? 'auto' : 'smooth' })));
  addEventListener('resize', () => { size(); fit(); measureFoot(); loop.poke(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); measureFoot(); });

  setCur(0, false); measureFoot();
  loop.add({ tick() {
    const vh = vhs(), r = pin.getBoundingClientRect();
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    /* u: Position in Projekten; je Schritt erst Ruhe, dann der Wechsel, weich hinein und heraus */
    const u = clamp(-r.top / (STEP * vh), 0, N - 1);
    let pos = 0;
    if (N > 1) { const k = Math.min(Math.floor(u), N - 2), f = u - k; pos = k + (reduce ? (f > .7 ? 1 : 0) : io(seg(f, REST, 1))); }
    placeLayers(pos);
    setCur(Math.round(pos), true);
    links.forEach((l, j) => l.style.setProperty('--p', clamp(u - j + .5).toFixed(3)));
    /* Blättern im Projekt gleitet nach */
    let moving = false;
    P.forEach(q => {
      if (Math.abs(q.pos - q.tgt) < .002) { if (q.pos !== q.tgt) { q.pos = q.tgt; placeSlides(q); if (q.i === cur) counter(q); } return; }
      q.pos += (q.tgt - q.pos) * (reduce ? 1 : .14); moving = true; placeSlides(q); if (q.i === cur) counter(q);
    });
    if (moving) loop.poke();
  } });

  /* ---------- Projektansicht (wie zuvor) ---------- */
  const dlg = $('.rvd', el), inn = $('.rvd__in', dlg), dstrip = $('.rvd__strip', dlg), prog = $('.rvd__prog i', dlg), cnt = $('.rvd__cnt', dlg);
  const pos = $('.rvd__pos', dlg), dart = $('.rvd__art', dlg), name = $('.rvd__name', dlg), t2 = $('.rvd__t2', dlg), t3 = $('.rvd__t3', dlg);
  const pnb = $$('.rvd__pnb', dlg), dbar = $('.rvd__bar', dlg);
  let open_q = null, slides = [], si = 0;
  const fill = q => {
    const p = q.p, n = p.img.length;
    open_q = q;
    pos.textContent = `${pad2(q.i + 1)} / ${pad2(N)}`;
    dart.textContent = p.info; name.textContent = p.name;
    t2.innerHTML = (p.text ? `<p class="txt">${esc(p.text)}</p>` : '') + (p.link ? `<a class="rvd__go" href="${esc(p.link.href)}" target="_blank" rel="noopener">${esc(p.link.label)} <span aria-hidden="true">↗</span></a>` : '');
    t3.innerHTML = p.facts ? `<dl class="rvd__facts">${p.facts.map(([a, b]) => `<div><dt class="info">${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : '';
    dstrip.innerHTML = p.img.map(m => `<img ${imgAttrs(m, '(min-width:1024px) 70vw, 100vw')} alt="${esc(m.alt)}" decoding="async" draggable="false"${m.pos ? ` style="object-position:${m.pos}"` : ''}>`).join('');
    slides = $$('img', dstrip);
    slides.forEach(im => { const a = () => { if (im.naturalWidth) im.style.setProperty('--a', `${im.naturalWidth} / ${im.naturalHeight}`); }; if (im.complete) a(); else im.addEventListener('load', a, { once: true }); });
    dbar.hidden = n < 2; dlg.classList.toggle('is-solo', n < 2);
    pnb.forEach(b => { b.hidden = N < 2; $('.rvd__pnn', b).textContent = N < 2 ? '' : list[(q.i + +b.dataset.d + N) % N].name; });
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
  const rectOf = () => { const r = frame.getBoundingClientRect(), W = innerWidth, H = innerHeight; return `inset(${Math.max(0, r.top).toFixed(1)}px ${Math.max(0, W - r.right).toFixed(1)}px ${Math.max(0, H - r.bottom).toFixed(1)}px ${Math.max(0, r.left).toFixed(1)}px)`; };
  let busy = false;
  const open = (q, k = 0, kb = false) => {
    if (busy || dlg.open) return;
    fill(q);
    html.classList.add('rv-lock');
    dlg.showModal();
    requestAnimationFrame(() => slideTo(k, 'auto'));
    history.scrollRestoration = 'manual';  // Zurück soll nicht an die alte Stelle springen, wenn du im Vollbild das Projekt gewechselt hast
    history.pushState({ rv: 1 }, '');
    if (!reduce) {
      busy = true;
      dlg.animate([{ clipPath: rectOf() }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: 780, easing: EASE }).finished.then(() => { busy = false; }, () => { busy = false; });
      inn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 320, easing: EASE, fill: 'backwards' });
      slides.forEach((s, j) => s.animate([{ transform: 'translateX(12%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 360 + j * 60, easing: EASE, fill: 'backwards' }));
    }
    (kb ? $('.rvd__x', dlg) : inn).focus({ preventScroll: true });
  };
  const shut = () => {
    if (!dlg.open) return;
    const done = () => { dlg.close(); html.classList.remove('rv-lock'); busy = false; history.scrollRestoration = 'auto'; goBtn.focus({ preventScroll: true }); };
    if (reduce) return done();
    busy = true;
    inn.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'linear', fill: 'forwards' }).finished.then(() => {
      dlg.animate([{ clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: rectOf() }], { duration: 620, easing: EASE, fill: 'forwards' }).finished.then(() => {
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
  /* Nachbarprojekt: Inhalt blendet um, im Hintergrund springt die Folge zu diesem Projekt, damit das Schließen dort landet */
  pnb.forEach(b => b.addEventListener('click', () => {
    if (busy) return;
    const q = P[(open_q.i + +b.dataset.d + N) % N], swap = () => {
      fill(q); dstrip.scrollLeft = 0;
      html.classList.remove('rv-lock'); scrollTo({ top: yOf(q.i), behavior: 'auto' }); html.classList.add('rv-lock'); loop.poke();
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
