/* Referenzen, Variante B (projects-b.html): Folge, gebaut wie die Akte der Concepts Seite (js/akte.js), nur knapper.
   Ein gepinntes Bild für alle Projekte, mit viel Luft. Links die nummerierte Liste, klein (wo du bist, Linie füllt sich, Klick springt).
   In der Mitte die Bildfolge im Rahmen, rechts eine ruhige Textspalte: oben Art und Name, unten Satz, Daten, Projekt ansehen.
   Jeder Scrollschritt (STEP Bildschirmhöhe) bringt das nächste Projekt: sein Bild schiebt sich von rechts über das aktuelle, das aktuelle
   weicht etwas nach links (wie die Bildwechsel der Akte), Name und Satz laufen Wort für Wort neu herein. Pfeile und Wischen blättern
   durch die Bilder des Projekts. Klick auf das Bild oder Projekt ansehen öffnet die Projektansicht (Vollbild schwarz, aus dem Rahmen),
   Esc oder Zurück schließt. Unter 1200 px wird die Liste eine Leiste unter dem Kopf, unter 900 px steht der Text unter dem Bild.
   Daten aus data/referenzen.js (REFERENZEN). */
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
  const layer = (p, i) => `<div class="rf__lay"${i ? ' aria-hidden="true"' : ''}>${p.img.map((m, k) => `<div class="rf__sl"><img ${imgAttrs(m, '(min-width:1200px) 56vw, (min-width:900px) 66vw, 100vw')} alt="${esc(m.alt)}" loading="${i < 2 && !k ? 'eager' : 'lazy'}" decoding="async" draggable="false"${m.pos ? ` style="object-position:${m.pos}"` : ''}></div>`).join('')}</div>`;
  /* Lose Karte je Projekt (wie die losen Bilder der Akte): ein weiteres Bild, gleitet beim Scrollen schneller als die Seite am Rahmen hoch */
  const loose = p => { const k = p.img[2] ? 2 : p.img[1] ? 1 : -1; return k < 0 ? '<i class="rf__lc" hidden></i>' : `<button class="rf__lc" type="button" tabindex="-1" data-k="${k}"><img src="${src(p.img[k])}" alt="" loading="lazy" decoding="async" draggable="false"></button>`; };
  el.innerHTML = `<div class="rf__pin"><div class="rf__stage">`
    + `<nav class="rf__nav" aria-label="Projekte"><ol class="rf__list">${list.map((p, i) => `<li><button class="rf__link" type="button" data-i="${i}"><span class="info">${pad2(i + 1)}</span><span class="rf__ln">${esc(p.name)}</span><i aria-hidden="true"></i></button></li>`).join('')}</ol></nav>`
    + `<div class="rf__main">`
    + `<div class="rf__fw"><div class="rf__frame" role="group" aria-roledescription="Bildfolge"><div class="rf__lays">${list.map(layer).join('')}</div>`
    + `<span class="info rf__count"></span><div class="rf__arrows"><button type="button" class="rf__arrow" data-d="-1" aria-label="Vorheriges Bild">←</button><button type="button" class="rf__arrow" data-d="1" aria-label="Nächstes Bild">→</button></div></div>`
    + `<div class="rf__loose" aria-hidden="true">${list.map(loose).join('')}</div></div>`
    + `<div class="rf__txt"><div class="rf__head"><p class="info rf__art"></p><h3 class="rf__h"></h3></div>`
    + `<div class="rf__foot"><p class="rf__say"></p><ul class="info rf__facts"></ul><button class="rf__go" type="button" aria-haspopup="dialog">Projekt ansehen</button></div></div>`
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
  const lcs = $$('.rf__lc', el), fw = $('.rf__fw', el);
  const P = $$('.rf__lay', el).map((l, i) => ({ i, p: list[i], lay: l, sl: $$('.rf__sl', l), imgs: $$('img', l), lc: lcs[i].hidden ? null : lcs[i], n: list[i].img.length, tgt: 0, pos: 0, sv: [], v: null, kb: '', lk: '' }));

  /* Länge des Pins: ein Bildschirm plus je Projekt STEP, plus TAIL zum Stehenbleiben am Ende */
  const size = () => { pin.style.height = `${Math.round(vhs() * (1 + (N - 1) * STEP + TAIL))}px`; };
  size();
  const yOf = i => pin.getBoundingClientRect().top + scrollY + i * STEP * vhs() + 1;

  const sayHTML = p => p.text ? words(p.text) : '';
  const factsHTML = p => (p.facts || []).slice(0, 3).map(([a, b]) => `<li><span>${esc(a)}</span> ${esc(b)}</li>`).join('');
  /* Schmal (Bild über dem Text): unterer Block so hoch wie der höchste aller Projekte, so bleibt der Rahmen beim Wechsel gleich groß.
     Breit steht der Text neben dem Bild und braucht das nicht */
  const foot = $('.rf__foot', el), main = $('.rf__main', el);
  const stacked = () => getComputedStyle(main).flexDirection === 'column';
  const measureFoot = () => {
    foot.style.minHeight = '';
    if (!stacked()) return;
    const c = foot.cloneNode(true);
    c.style.cssText = `position:absolute;left:0;top:0;width:${foot.clientWidth}px;visibility:hidden;pointer-events:none`;
    c.setAttribute('aria-hidden', 'true'); foot.parentNode.appendChild(c);
    const cs = $('.rf__say', c), cf = $('.rf__facts', c);
    let mx = 0;
    list.forEach(p => { cs.innerHTML = sayHTML(p); cs.hidden = !p.text; cf.innerHTML = factsHTML(p); mx = Math.max(mx, c.offsetHeight); });
    c.remove(); foot.style.minHeight = `${Math.ceil(mx)}px`;
  };
  /* Name: breit steht er in der Textspalte und bricht um (höchstens drei Zeilen, kein Wort ragt hinaus).
     Schmal bleibt er einzeilig, damit der Rahmen beim Wechsel nicht springt. Was nicht passt, wird kleiner */
  const fit = () => {
    hh.style.fontSize = hh.style.paddingTop = '';
    const cs = getComputedStyle(hh), fs = parseFloat(cs.fontSize), w = hh.clientWidth, h0 = hh.offsetHeight;
    if (stacked()) {
      const sw = hh.scrollWidth; if (sw <= w + 1) return;
      hh.style.fontSize = `${(fs * Math.max(.55, w / sw * .98)).toFixed(1)}px`;
      hh.style.paddingTop = `${Math.max(0, h0 - hh.offsetHeight)}px`;  // gleiche Höhe wie ein normaler Name, Text sitzt unten
      return;
    }
    const lr = (parseFloat(cs.lineHeight) || fs * 1.04) / fs;
    for (let f = fs; f > fs * .6 && (hh.scrollWidth > w + 1 || hh.offsetHeight > lr * f * 3 + 2);) { f *= .94; hh.style.fontSize = `${f.toFixed(1)}px`; }
  };
  /* Text des aktiven Projekts. Er hängt am Scrollen: im Wechsel gehen Name und Satz Wort für Wort nach oben weg,
     die neuen steigen Wort für Wort von unten nach */
  let cur = -1, tw = { name: [], say: [] }, lastT = '';
  const off = (x, j, n, D) => clamp((x - D * (n > 1 ? j / (n - 1) : 0)) / (1 - D));
  const scrub = (dir, a) => {  // dir -1: geht nach oben weg, +1: kommt von unten; a: 0 steht, 1 ganz weg
    const key = `${dir}:${a.toFixed(3)}`; if (key === lastT) return; lastT = key;
    const set = (arr, D) => { const n = arr.length; arr.forEach((sp, j) => { const g = dir < 0 ? off(a, j, n, D) : 1 - off(1 - a, j, n, D); sp.style.transform = g > .001 ? `translate3d(0,${(dir * g * 112).toFixed(1)}%,0)` : ''; }); };
    set(tw.name, .45); set(tw.say, .6);
    const on = a > .001;
    [art, facts].forEach(x => { x.style.opacity = on ? (1 - a).toFixed(3) : ''; x.style.transform = on ? `translate3d(0,${(dir * a * 14).toFixed(1)}px,0)` : ''; });
  };
  const text = (i, anim) => {
    const p = list[i];
    art.textContent = p.info;
    hh.innerHTML = words(p.name); fit();
    say.innerHTML = sayHTML(p); say.hidden = !p.text;
    facts.innerHTML = factsHTML(p);
    goBtn.setAttribute('aria-label', `Projekt ${p.name} ansehen`);
    frame.setAttribute('aria-label', `Bilder von ${p.name}`);
    tw = { name: $$('.rf__w>span', hh), say: $$('.rf__w>span', say) }; lastT = '';
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
  P.forEach(q => { if (q.lc) q.lc.addEventListener('click', e => open(q, +q.lc.dataset.k, !e.detail)); });
  let mx = 0, my = 0;
  if (!reduce && matchMedia('(pointer:fine)').matches) addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; loop.poke(); }, { passive: true });
  links.forEach(l => l.addEventListener('click', () => scrollTo({ top: yOf(+l.dataset.i), behavior: reduce ? 'auto' : 'smooth' })));
  addEventListener('resize', () => { size(); fit(); measureFoot(); loop.poke(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); measureFoot(); });

  setCur(0, false); measureFoot();
  loop.add({ tick() {
    const vh = vhs(), r = pin.getBoundingClientRect();
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    /* u: Position in Projekten; je Schritt erst Ruhe, dann der Wechsel, weich hinein und heraus. raw läuft auch vor und nach dem Pin weiter */
    const raw = -r.top / (STEP * vh), u = clamp(raw, 0, N - 1);
    let pos = 0;
    if (N > 1) { const k = Math.min(Math.floor(u), N - 2), f = u - k; pos = k + (reduce ? (f > .7 ? 1 : 0) : io(seg(f, REST, 1))); }
    placeLayers(pos);
    setCur(Math.round(pos), true);
    const fr = pos - Math.floor(pos);
    if (reduce || fr < 1e-4) scrub(-1, 0); else if (fr < .5) scrub(-1, fr * 2); else scrub(1, (1 - fr) * 2);
    if (!reduce) {
      /* Rahmen holt im Wechsel kurz Luft: die Kanten gehen ein Stück nach innen und wieder auf */
      const b = Math.sin(Math.PI * fr);
      frame.style.clipPath = b > .002 ? `inset(${(b * 5).toFixed(2)}% ${(b * 3.5).toFixed(2)}%)` : '';
      const uo = b > .002 ? clamp(1 - b * 4).toFixed(2) : '';  // Zähler und Pfeile treten im Wechsel kurz zurück
      count.style.opacity = uo; arrows.style.opacity = uo;
      /* Bild zoomt über die ganze Zeit, in der das Projekt zu sehen ist, langsam zurück und gleitet etwas */
      P.forEach(q => {
        if (q.v === 9 || q.v === null) return;
        const l = clamp((raw - (q.i - 1 + REST)) / (2 - REST)), kb = `scale(${(1.16 - .16 * l).toFixed(4)}) translate3d(0,${((.5 - l) * 3).toFixed(2)}%,0)`;
        if (kb !== q.kb) { q.kb = kb; q.imgs.forEach(im => { im.style.transform = kb; }); }
      });
      /* Lose Karten: je Projekt eine, steigt schneller als die Seite am rechten Rand des Rahmens hoch und dreht sich dabei */
      const TR = vh * .8, fwr = fw.getBoundingClientRect(), mid = fwr.top + fwr.height / 2;
      P.forEach(q => {
        if (!q.lc) return;
        const d = q.i + REST / 2 - raw;  // 0 = Mitte der Ruhe dieses Projekts
        if (d < -1.25 || d > 1.25) { if (q.lk !== 'h') { q.lk = 'h'; q.lc.style.visibility = 'hidden'; } return; }
        const im = $('img', q.lc); if (im.loading === 'lazy') im.loading = 'eager';
        const rot = (q.i % 2 ? 4 : -3) + d * 7, x = mx * 14, y = d * TR + my * 10;
        /* oben unter dem Kopf und unten über dem Text blendet die Karte aus, damit sie nichts verdeckt, was man lesen oder klicken will */
        const cy = mid + y, op = Math.min(clamp((cy - vh * .2) / (vh * .16)), clamp((vh * .82 - cy) / (vh * .16)));
        const lk = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)|${op.toFixed(2)}`;
        if (lk !== q.lk) { q.lk = lk; q.lc.style.visibility = op > .01 ? 'visible' : 'hidden'; q.lc.style.transform = lk.split('|')[0]; q.lc.style.opacity = op.toFixed(2); q.lc.style.pointerEvents = op > .6 ? '' : 'none'; }
      });
    }
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
