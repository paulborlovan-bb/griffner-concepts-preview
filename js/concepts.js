/* 03 INSPIRATION. Spielerisch, Referenz stillform.homes: hinter allem läuft der Name riesig durch ("WALD. WALD."),
   davor schweben die Ansichten und die Eckdaten als lose Collage, jede Karte mit eigener Tiefe (Scrollen und Maus).
   Dann fliegt die Collage auseinander, das Hauptbild wächst zum Vollbild, unten links steht nur das Nötigste.
   Nur transform und opacity, keine clip-path Animation: das hält es flüssig.
   Alles kommt aus CONCEPTS in data/content.js: ein neues Concept braucht nur einen neuen Eintrag. */
import { $, $$, E, lerp, clamp, prog, loop, store, h, reduce } from './core.js';
import { CONCEPTS } from '../data/content.js';
import { answers } from './kennen.js';

const NUM = ['Keine', 'Eine', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun', 'Zehn'];
const WHY = {
  who: { allein: 'allein einziehst', zwei: 'zu zweit einziehst', familie: 'mit Familie einziehst', generationen: 'mit mehreren Generationen lebst' },
  work: { buero: 'im Büro arbeitest', zuhause: 'oft zuhause arbeitest', kunden: 'zuhause Kundschaft empfängst' },
  love: { morgen: 'Morgenlicht magst', kochen: 'gern für viele kochst', weite: 'Weite brauchst', rueckzug: 'Rückzug suchst', garten: 'deinen Garten liebst', gaeste: 'gern Gäste hast', buecher: 'Bücher liebst', werkstatt: 'eine Werkstatt willst' }
};
const join = l => l.length > 1 ? l.slice(0, -1).join(', ') + ' und ' + l[l.length - 1] : l[0];
export function fit(c, a = answers()) {
  const r = [];
  if (c.fits.who.includes(a.who)) r.push(WHY.who[a.who]);
  if (c.fits.work.includes(a.work)) r.push(WHY.work[a.work]);
  a.love.filter(k => c.fits.love.includes(k)).forEach(k => r.push(WHY.love[k]));
  return { score: r.length, reasons: r.slice(0, 2) };
}
export const best = () => { const a = answers(); return CONCEPTS.map(c => ({ c, ...fit(c, a) })).sort((x, y) => y.score - x.score)[0]; };

/* Collage Plätze: Mitte x und y in Prozent, Breite in vw, Seitenverhältnis, Tiefe (wie stark die Karte mitschwebt) */
const SLOTS = [
  [15, 31, 15, 3 / 4, 1.3], [84, 27, 13, 4 / 5, .8], [79, 75, 17, 4 / 3, 1.1],
  [21, 77, 11, 1, .7], [41, 15, 9, 1, .5], [62, 87, 10, 1, .9]
];
let CH = [], mx = 0, my = 0;

export function initConcepts() {
  const host = $('[data-chapters]');
  const n = CONCEPTS.length;
  $('#k-concepts .h-xl').textContent = `${NUM[n] || n} Ideen zum Weiterdenken.`;
  $('[data-c-count]').textContent = `${join(CONCEPTS.map(c => c.name))}. Keine fertigen Häuser, sondern Haltungen.`;
  CH = CONCEPTS.map(c => {
    /* Karten: zuerst die Ansichten, dann die Eckdaten als Schriftkarten, höchstens sechs */
    const cards = [...c.views.map(v => ({ img: v.img, cap: v.cap })), ...c.facts.map(f => ({ fact: f }))].slice(0, SLOTS.length);
    const el = h('article', { class: 'cc', id: 'c-' + c.id, 'aria-label': 'Concept ' + c.name });
    el.innerHTML = `
      <div class="cc__sticky">
        <p class="cc__mq" data-mq aria-hidden="true"><span>${(c.word + ' ').repeat(4)}</span></p>
        <div class="cc__cards">
          ${cards.map((k, i) => `<figure class="cc__card${k.fact ? ' cc__card--fact' + (i % 2 ? ' is-dark' : '') : ''}" data-card style="--w:${SLOTS[i][2]}vw;--a:${SLOTS[i][3]};left:${SLOTS[i][0]}%;top:${SLOTS[i][1]}%">${k.fact ? `<span>${k.fact}</span>` : `<img src="${k.img}" alt="Concept ${c.name}, ${k.cap.replace('.', '')}" loading="lazy" decoding="async">`}</figure>`).join('')}
          <figure class="cc__main" data-main><img src="${c.img}" alt="Concept ${c.name}, Visualisierung" style="object-position:${c.pos}" decoding="async"></figure>
        </div>
        <div class="cc__shade" data-shade></div>
        <div class="cc__frame" data-frame id="c-${c.id}-frame" data-dock="edge" data-dock-x=".72" data-dock-trigger="c-${c.id}" data-dock-hide="1"></div>
        <div class="cc__panel" data-panel>
          <span class="info">Concept ${c.nr}${c.ph ? ' <span class="cc__ph">/ Werte vorläufig</span>' : ''}</span>
          <h3 class="cc__word">${c.word}</h3>
          <p class="cc__lead">${c.lead}</p>
          <div class="cc__acts"><a class="btn-line info" href="${c.href}">Ansehen</a><button type="button" class="btn-line info" data-fav aria-pressed="false">Merken</button></div>
        </div>
        <span class="tag cc__tag" data-tag>${c.cap}</span>
      </div>`;
    host.appendChild(el);
    const q = s => $(s, el);
    const o = {
      c, el, mq: q('[data-mq]'), main: q('[data-main]'), mim: q('[data-main] img'), shade: q('[data-shade]'), frame: q('[data-frame]'),
      cards: $$('[data-card]', el).map((f, i) => ({ f, s: SLOTS[i], d: i * .018 })), panel: q('[data-panel]'), tag: q('[data-tag]'), fav: q('[data-fav]')
    };
    o.fav.addEventListener('click', () => {
      const f = new Set(store.get().favs || []); f.has(c.id) ? f.delete(c.id) : f.add(c.id); store.set({ favs: [...f] });
    });
    return o;
  });
  favs();
  store.on((s, patch) => { if ('favs' in patch) favs(); });
  /* Maus gibt der Collage Tiefe: jede Karte weicht ein wenig aus, je nach Tiefe */
  if (!reduce && matchMedia('(pointer:fine)').matches) addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; loop.poke(); }, { passive: true });
  loop.add({ tick });
}

function favs() {
  const f = new Set(store.get().favs || []);
  CH.forEach(o => { const on = f.has(o.c.id); o.fav.setAttribute('aria-pressed', String(on)); o.fav.textContent = on ? 'Gemerkt' : 'Merken'; });
}

const clear = o => {
  o.main.style.transform = ''; o.mim.style.transform = ''; o.mq.style.cssText = ''; o.shade.style.opacity = '';
  o.cards.forEach(k => { k.f.style.transform = ''; k.f.style.opacity = ''; });
  [o.panel, o.tag].forEach(e => { e.style.cssText = ''; }); o.frame.style.cssText = '';
};

function tick() {
  const narrow = innerWidth < 820;
  CH.forEach(o => {
    const { p, on } = prog(o.el);
    if (narrow || reduce) { if (o.wide !== false) { o.wide = false; clear(o); } o.frame.dataset.dockHide = '1'; return; }
    o.wide = true;
    if (!on) return;
    const vw = innerWidth, vh = innerHeight;
    /* Der Name läuft riesig durch, solange die Collage steht */
    o.mq.style.transform = `translate3d(${(-p * 34).toFixed(2)}%,-50%,0)`;
    o.mq.style.opacity = (E(p, 0, .08) * (1 - E(p, .44, .54))).toFixed(3);
    /* Hauptbild: klein in der Mitte, wächst zum Vollbild */
    const grow = E(p, .42, .62), s = lerp(.3, 1, grow), pm = 1 - grow;
    const inn = E(p, 0, .12);
    o.main.style.transform = `translate3d(${(mx * 10 * pm).toFixed(1)}px,${(my * 8 * pm + (1 - inn) * 60).toFixed(1)}px,0) scale(${(s * lerp(.9, 1, inn)).toFixed(4)})`;
    o.main.style.opacity = inn.toFixed(3);
    o.mim.style.transform = `scale(${lerp(1.16, 1, E(p, .42, .8)).toFixed(4)})`;
    /* Karten fliegen von außen herein, schweben mit eigener Tiefe, fliegen beim Wachsen wieder hinaus */
    o.cards.forEach(k => {
      const [cx, cy, , , dp] = k.s, ox = (cx - 50) / 100 * vw, oy = (cy - 50) / 100 * vh;
      const a = E(p, .02 + k.d, .14 + k.d), out = E(p, .42, .58);
      const f = (1 - a) * 1.1 + out * 1.6;
      const x = ox * f + mx * 18 * dp, y = oy * f + my * 12 * dp - (p - .28) * vh * .32 * dp;
      k.f.style.transform = `translate3d(-50%,-50%,0) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      k.f.style.opacity = (a * (1 - out)).toFixed(3);
    });
    /* Am Ende: Bildschutz, Text unten links, Bildnachweis */
    o.shade.style.opacity = E(p, .6, .7).toFixed(3);
    const pn = E(p, .66, .78);
    o.panel.style.opacity = pn.toFixed(3);
    o.panel.style.transform = `translateY(${((1 - pn) * 36).toFixed(1)}px)`;
    o.panel.classList.toggle('is-on', pn > .5);
    o.tag.style.opacity = E(p, .7, .78).toFixed(3);
    /* Andockrahmen = sichtbares Hauptbild */
    const w = vw * s, hh = vh * s, fs = o.frame.style;
    fs.left = ((vw - w) / 2).toFixed(1) + 'px'; fs.top = ((vh - hh) / 2).toFixed(1) + 'px'; fs.width = w.toFixed(1) + 'px'; fs.height = hh.toFixed(1) + 'px'; fs.right = 'auto'; fs.bottom = 'auto';
    if (p > .2 && p < .985) delete o.frame.dataset.dockHide; else o.frame.dataset.dockHide = '1';
  });
}
