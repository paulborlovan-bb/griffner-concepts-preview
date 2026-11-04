/* 03 INSPIRATION. Jedes Concept öffnet sich aus einem Strich zum Vollbild, dann rückt das Bild zur Seite und gibt die Idee frei.
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
  return { score: r.length, reasons: r.slice(0, 3) };
}
export const best = () => { const a = answers(); return CONCEPTS.map(c => ({ c, ...fit(c, a) })).sort((x, y) => y.score - x.score)[0]; };

let CH = [];

export function initConcepts() {
  const host = $('[data-chapters]');
  const n = CONCEPTS.length;
  $('#k-concepts .h-xl').textContent = `${NUM[n] || n} Ideen zum Weiterdenken.`;
  $('[data-c-count]').textContent = `${join(CONCEPTS.map(c => c.name))}. Keine fertigen Häuser, sondern Haltungen. Die Sammlung wächst.`;
  CH = CONCEPTS.map(c => {
    const el = h('article', { class: 'cc', id: 'c-' + c.id, 'aria-label': 'Concept ' + c.name });
    el.innerHTML = `
      <div class="cc__sticky">
        <div class="cc__img" data-img><img src="${c.img}" alt="Concept ${c.name}, Visualisierung" style="object-position:${c.pos}" decoding="async"><div class="cc__shade"></div></div>
        <div class="cc__frame" data-frame id="c-${c.id}-frame" data-dock="edge" data-dock-x=".72" data-dock-trigger="c-${c.id}" data-dock-hide="1"></div>
        <div class="cc__top info" data-top><span>Concept ${c.nr} / ${c.name}</span><span>${c.facts.join(' / ')}</span></div>
        <p class="cc__name" data-name aria-hidden="true">${c.word}</p>
        <div class="cc__panel" data-panel>
          <span class="info">Concept ${c.nr}${c.ph ? ' <span class="cc__ph">/ Werte vorläufig</span>' : ''}</span>
          <h3 class="cc__word">${c.word}</h3>
          <p class="cc__lead">${c.lead}</p>
          <p class="txt">${c.text} ${c.fuer}</p>
          <ul class="facts info">${c.facts.map(f => `<li>${f}</li>`).join('')}</ul>
          <div class="cc__fit"><span class="info">Für dich</span><b data-fit></b></div>
          <div class="cc__acts"><button type="button" class="btn-line info" data-fav aria-pressed="false">Merken</button><a class="btn-line info" href="${c.href}">Mehr zu ${c.name}</a></div>
          <div class="cc__views">${c.views.map(v => `<figure><img src="${v.img}" alt="" loading="lazy"><figcaption class="tag">${v.cap}</figcaption></figure>`).join('')}</div>
        </div>
        <span class="tag cc__tag" data-tag>${c.cap}</span>
      </div>`;
    host.appendChild(el);
    const q = s => $(s, el);
    const o = { c, el, img: q('[data-img]'), im: q('[data-img] img'), frame: q('[data-frame]'), top: q('[data-top]'), name: q('[data-name]'), panel: q('[data-panel]'), tag: q('[data-tag]'), fit: q('[data-fit]'), fav: q('[data-fav]') };
    o.fav.addEventListener('click', () => {
      const f = new Set(store.get().favs || []); f.has(c.id) ? f.delete(c.id) : f.add(c.id); store.set({ favs: [...f] });
    });
    return o;
  });
  personal();
  store.on((s, patch) => { if ('answers' in patch || 'favs' in patch) personal(); });
  loop.add({ tick });
}

function personal() {
  const a = answers(), favs = new Set(store.get().favs || []), b = best();
  CH.forEach(o => {
    const f = fit(o.c, a);
    o.fit.textContent = f.score ? `Passt zu dir, weil du ${join(f.reasons)}.` : 'Passt nicht ganz zu dem, was du uns erzählt hast. Genau dafür kann man mischen.';
    const on = favs.has(o.c.id);
    o.fav.setAttribute('aria-pressed', String(on)); o.fav.textContent = on ? 'Gemerkt' : 'Merken';
  });
}

function tick() {
  const narrow = innerWidth < 820;
  CH.forEach(o => {
    let { p, on } = prog(o.el);
    if (narrow) { o.frame.style.cssText = ''; o.frame.dataset.dockHide = '1'; return; }
    if (!on) return;
    const vw = innerWidth, vh = innerHeight;
    const line = E(p, 0, .05), open = E(p, .03, .22), split = E(p, .45, .62);
    const v = lerp(49.9, 0, open), hz = lerp(50, 0, line);
    const left = lerp(hz, 42, split);
    const top = lerp(v, 0, split), bottom = v;
    const inT = lerp(top, 13, split), inB = lerp(bottom, 9, split), inR = lerp(hz, 0, split);
    o.img.style.clipPath = `inset(${inT.toFixed(2)}% ${inR.toFixed(2)}% ${inB.toFixed(2)}% ${left.toFixed(2)}%)`;
    o.im.style.transform = `scale(${lerp(1.22, 1.02, open).toFixed(4)}) translate3d(${(split * 6).toFixed(2)}%,0,0)`;
    const nm = E(p, .16, .28) * (1 - E(p, .45, .52));
    o.name.style.opacity = nm.toFixed(3);
    o.name.style.transform = `translateY(${((1 - E(p, .16, .3)) * 60).toFixed(1)}px)`;
    o.top.style.opacity = (E(p, .18, .28) * (1 - E(p, .45, .5))).toFixed(3);
    const pn = E(p, .52, .64);
    o.panel.style.opacity = pn.toFixed(3);
    o.panel.style.transform = `translateY(${((1 - pn) * 32).toFixed(1)}px)`;
    o.panel.classList.toggle('is-on', pn > .5);
    o.tag.style.opacity = E(p, .62, .68).toFixed(3);
    o.tag.style.left = left.toFixed(2) + '%';
    o.tag.style.bottom = inB.toFixed(2) + '%';
    /* Andockrahmen = sichtbarer Bildausschnitt */
    const fs = o.frame.style;
    fs.left = (left / 100 * vw).toFixed(1) + 'px'; fs.right = (inR / 100 * vw).toFixed(1) + 'px';
    fs.top = (inT / 100 * vh).toFixed(1) + 'px'; fs.bottom = (inB / 100 * vh).toFixed(1) + 'px';
    fs.width = 'auto'; fs.height = 'auto';
    if (p > .3 && p < .985) delete o.frame.dataset.dockHide; else o.frame.dataset.dockHide = '1';
  });
}
