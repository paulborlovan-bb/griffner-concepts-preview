/* BÜHNE, nach stillform.homes (Kundenwunsch 2026-11-05, Aufnahme vom Kunden).
   Um eine kleine Überschrift in der Mitte liegen lose, leicht gedrehte Bilder. Beim Scrollen fliegen sie weg,
   die mittlere Karte wächst zum Rahmen: 75 % des Bildschirms, nie Vollbild, damit niemand meint, die Seite sei zu Ende.
   Im Rahmen wechseln die Häuser mit einem seitlichen Schieben, mit Zurück, Weiter und Balken zum Springen.
   Nur transform und opacity. Genutzt von concepts.js (alle Concepts) und wald.js (Nächstes Concept, ein Haus).
   Ein Bildschirm, alles drin: Bild, Text, Knopf und Steuerung bleiben im Rahmen, auch auf dem Telefon. */
import { $, $$, E, lerp, clamp, loop, reduce } from './core.js';

/* Längen in Bildschirmhöhen: Collage stehen lassen, Wachsen, je Haus, Auslauf nach dem letzten */
const HOLD = .35, GROW = .95, PER = 1, TAIL = .55;
/* Plätze der Karten: Mitte x und y in %, Breite in vw, Seitenverhältnis, Drehung, Tiefe */
const SLOTS = [
  [16, 22, 10, 4 / 3, -3, .6], [84, 20, 11, 4 / 3, 2.5, .7], [8, 55, 13, 4 / 5, 3, 1.1], [92, 53, 12, 4 / 5, -3.5, 1.2],
  [21, 87, 15, 4 / 3, 2, .9], [79, 88, 16, 4 / 3, -2.5, 1.3], [37, 104, 11, 1, -2, .8], [63, 106, 10, 4 / 5, 3, .7]
];
const SLOTS_M = [[11, 47, 30, 4 / 5, -4, 1], [89, 51, 28, 4 / 5, 3.5, 1.1], [17, 92, 36, 4 / 3, 2.5, .9], [85, 94, 32, 4 / 3, -3, 1.2]];

/* Karten: je Concept eine Ansicht, dann die zweite, damit alle gemischt um die Überschrift liegen */
export function cardsFor(list) {
  const out = [], most = Math.max(...list.map(c => c.views.length));
  for (let k = 0; k < most; k++) list.forEach(c => { if (c.views[k]) out.push(c.views[k]); });
  return out;
}

/* root: .bu mit .bu__sticky, [data-bu-intro], [data-bu-cards]. o: { houses, cards, count(i), all, dockId } */
export function initBuehne(root, o) {
  const N = o.houses.length, END = HOLD + GROW + (N - 1) * PER + TAIL;
  root.style.setProperty('--bu-l', END.toFixed(3));
  const sticky = $('.bu__sticky', root), intro = $('[data-bu-intro]', root), cardsEl = $('[data-bu-cards]', root);
  const trig = root.closest('section') ? root.closest('section').id : '';
  cardsEl.innerHTML = o.cards.slice(0, SLOTS.length).map(c => `<figure class="bu__card" data-bu-card><img src="${c.img}" alt="" loading="lazy" decoding="async"></figure>`).join('');
  const fr = document.createElement('div');
  fr.className = 'bu__frame'; fr.id = o.dockId || (trig + '-frame');
  Object.assign(fr.dataset, { dock: 'edge', dockX: '.8', dockTrigger: trig, dockHide: '1' });
  fr.innerHTML = `
    <div class="bu__slides">${o.houses.map((c, i) => `
      <div class="bu__slide" data-bu-slide>
        <img src="${c.img}" alt="Concept ${c.name}, ${/Foto/.test(c.cap) ? 'Foto' : 'Visualisierung'}" style="object-position:${c.pos || '50% 50%'}" decoding="async"${i ? ' loading="lazy"' : ''}>
        <div class="bu__shade" data-bu-shade aria-hidden="true"></div>
        <div class="bu__panel" data-bu-panel aria-hidden="true">
          <h3 class="bu__word">${c.word}</h3>
          <p class="bu__fuer">${c.fuer}</p>
          <p class="bu__text">${c.text}</p>
          <a class="bu__go info" href="${c.href}" tabindex="-1">Concept ${c.name} ansehen</a>
        </div>
        <span class="tag bu__tag" data-bu-tag>${c.cap || ''}</span>
      </div>`).join('')}</div>
    <div class="bu__top" data-bu-top>
      <span class="info" data-bu-count>${o.count(0)}</span>
      ${N > 1 ? `<div class="bu__nav"><button type="button" class="bu__btn info" data-bu-prev>Zurück</button><button type="button" class="bu__btn info" data-bu-next>Weiter</button></div>`
        : o.all ? `<a class="bu__btn info" href="${o.all}">Alle Concepts</a>` : ''}
    </div>
    ${N > 1 ? `<div class="bu__bars">${o.houses.map(c => `<button type="button" class="bu__bar" data-bu-bar aria-label="Concept ${c.name}"><i></i></button>`).join('')}</div>` : ''}`;
  sticky.appendChild(fr);

  const q = s => $(s, fr);
  const S = {
    cards: $$('[data-bu-card]', root), slides: $$('[data-bu-slide]', fr).map(el => ({ el, im: $('img', el) })),
    panels: $$('[data-bu-panel]', fr), bars: $$('[data-bu-bar]', fr), shades: $$('[data-bu-shade]', fr), tags: $$('[data-bu-tag]', fr),
    top: q('[data-bu-top]'), count: q('[data-bu-count]'), prev: q('[data-bu-prev]'), next: q('[data-bu-next]'), barsBox: q('.bu__bars')
  };
  let mx = 0, my = 0, uc = null, cur = -1, W = 0, H = 0, mob = false, on = [];

  /* Springen: zur Mitte des Halts von Haus i */
  const go = i => {
    i = clamp(i, 0, N - 1);
    const vh = innerHeight, y = root.getBoundingClientRect().top + scrollY + (HOLD + GROW + i * PER + .2) * vh;
    if (window.__griffnerJump) window.__griffnerJump(y); else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };
  S.prev && S.prev.addEventListener('click', () => go(cur - 1));
  S.next && S.next.addEventListener('click', () => go(cur + 1));
  S.bars.forEach((b, i) => b.addEventListener('click', () => go(i)));
  /* Wischen im Rahmen (Telefon) */
  let tx = 0, ty = 0;
  fr.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  fr.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (N > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
  if (!reduce && matchMedia('(pointer:fine)').matches) addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; loop.poke(); }, { passive: true });

  /* Größen: Rahmen 75 % (Telefon: volle Breite mit Rand, 72 % Höhe), Karten aus den Plätzen */
  const layout = (vw, vh) => {
    mob = vw < 760; W = mob ? vw - 32 : Math.round(vw * .75); H = Math.round(vh * (mob ? .72 : .75));
    const off = mob ? 22 : Math.min(28, vh * .03);
    Object.assign(fr.style, { width: W + 'px', height: H + 'px', left: ((vw - W) / 2) + 'px', top: ((vh - H) / 2 + off) + 'px' });
    const sl = mob ? SLOTS_M : SLOTS;
    on = S.cards.map((f, i) => {
      const s = sl[i];
      if (!s) { f.style.display = 'none'; return null; }
      f.style.display = '';
      Object.assign(f.style, { width: (s[2] * vw / 100) + 'px', aspectRatio: String(s[3]), left: s[0] + '%', top: s[1] + '%' });
      return { f, s, x: s[0] / 100 * vw, y: s[1] / 100 * vh };
    });
    return off;
  };
  let lw = 0, lh = 0, off = 0;

  loop.add({ tick() {
    const r = root.getBoundingClientRect(), vh = innerHeight, vw = innerWidth;
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    if (vw !== lw || vh !== lh) { lw = vw; lh = vh; off = layout(vw, vh); }
    /* Fortschritt in Bildschirmhöhen, geglättet, damit es ruhig läuft */
    const ut = -r.top / vh;
    uc = uc == null || reduce ? ut : uc + (ut - uc) * .2;
    if (Math.abs(ut - uc) > .0008) loop.poke(); else uc = ut;
    const u = uc, pre = clamp(1 + u);
    const g = reduce ? 1 : E(u, HOLD, HOLD + GROW);
    const drift = clamp(u, 0, HOLD + GROW) * vh * .1;

    /* Überschrift: steht, bis der Rahmen wächst */
    intro.style.opacity = (1 - E(g, 0, .38)).toFixed(3);
    intro.style.transform = `translate3d(-50%,${(-g * 70 - drift * .4).toFixed(1)}px,0)`;
    intro.style.visibility = g > .99 ? 'hidden' : '';

    /* Karten: steigen von unten auf, schweben mit eigener Tiefe, fliegen beim Wachsen nach außen */
    on.forEach((k, i) => {
      if (!k) return;
      const [, , , , rot, dp] = k.s;
      const a = reduce ? 0 : E(pre, .2 + i * .05, .8 + i * .025), out = E(g, 0, .75);
      const x = (k.x - vw / 2) * out * 1.1 + mx * 16 * dp;
      const y = (1 - a) * vh * .55 * dp + (k.y - vh / 2) * out * 1.1 - drift * dp + my * 10 * dp;
      k.f.style.transform = `translate3d(-50%,-50%,0) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(rot * (1 + out)).toFixed(2)}deg)`;
      const op = a * (1 - E(g, .1, .62));
      k.f.style.opacity = op.toFixed(3);
      k.f.style.visibility = op < .005 ? 'hidden' : '';
    });

    /* Rahmen: klein in der Mitte, wächst auf 75 % */
    const s0 = mob ? .5 : .34, aF = reduce ? 1 : E(pre, .3, .95);
    const c0y = vh * (mob ? .64 : .62), cy = (vh - H) / 2 + off + H / 2;
    const s = lerp(s0, 1, g), dx = mx * 10 * (1 - g), dy = lerp(c0y - cy, 0, g) + (1 - aF) * vh * .45 - drift * (1 - g) + my * 8 * (1 - g);
    fr.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
    fr.style.opacity = aF.toFixed(3);

    /* Häuser im Rahmen: das nächste schiebt sich von rechts über das alte */
    const f = (u - HOLD - GROW) / PER, i0 = Math.max(0, Math.floor(f));
    const idx = clamp(i0 + (reduce ? (f - i0 > .5 ? 1 : 0) : E(f - i0, .5, .95)), 0, N - 1);
    const zoom = lerp(1.18, 1, g);
    S.slides.forEach((sl, i) => {
      const d = i - idx;
      const hide = d >= 1 || d <= -1;
      sl.el.style.visibility = hide ? 'hidden' : '';
      if (hide) return;
      sl.el.style.zIndex = String(i + 1);
      sl.el.style.transform = `translate3d(${(d > 0 ? d * 100 : d * 28).toFixed(3)}%,0,0)`;
      sl.im.style.transform = `translate3d(${(d > 0 ? -d * 55 : 0).toFixed(3)}%,0,0) scale(${zoom.toFixed(4)})`;
    });
    /* Text, Bildschutz und Bildnachweis gehören zum Bild und schieben mit */
    const ready = E(g, .82, 1), sh = E(g, .55, 1).toFixed(3);
    S.shades.forEach(e => { e.style.opacity = sh; });
    S.tags.forEach(e => { e.style.opacity = ready.toFixed(3); });
    S.top.style.opacity = ready.toFixed(3);
    if (S.barsBox) S.barsBox.style.opacity = ready.toFixed(3);
    S.panels.forEach((p, i) => {
      p.style.opacity = ready.toFixed(3);
      p.style.transform = `translate3d(0,${((1 - ready) * 18).toFixed(1)}px,0)`;
      const live = ready > .6 && Math.abs(i - idx) < .5;
      if (p.classList.contains('is-on') !== live) {
        p.classList.toggle('is-on', live); p.setAttribute('aria-hidden', String(!live));
        $('.bu__go', p).setAttribute('tabindex', live ? '0' : '-1');
      }
    });
    S.bars.forEach((b, i) => b.style.setProperty('--f', clamp(idx + 1 - i).toFixed(3)));
    const c = Math.round(idx);
    if (c !== cur) {
      cur = c; S.count.textContent = o.count(c);
      if (S.prev) S.prev.disabled = c <= 0;
      if (S.next) S.next.disabled = c >= N - 1;
    }
    /* Gelbes Feld dockt am Rahmen, sobald er steht */
    if (g > .97 && u < END + .1) delete fr.dataset.dockHide; else fr.dataset.dockHide = '1';
  } });
}
