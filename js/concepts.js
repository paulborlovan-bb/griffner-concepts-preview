/* 03 INSPIRATION. Weniger Text, mehr Bewegung (Referenz stillform.homes): jedes Concept beginnt als kleines Bild in der Mitte,
   das sich zum Vollbild öffnet, der Name steigt Buchstabe für Buchstabe auf. Dann wischen die Ansichten durch, mit großem Zähler
   und einem Wort pro Bild. Am Ende rückt das Bild nach rechts und links steht nur das Nötigste.
   Alles kommt aus CONCEPTS in data/content.js: ein neues Concept braucht nur einen neuen Eintrag. */
import { $, $$, E, seg, lerp, prog, loop, store, h } from './core.js';
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

let CH = [];
const pad = n => String(n).padStart(2, '0');
/* Weiche Kurve für das Öffnen, damit das kleine Bild sichtbar wächst statt aufzuspringen */
const SS = (p, a, b) => { const t = seg(p, a, b); return t * t * (3 - 2 * t); };

export function initConcepts() {
  const host = $('[data-chapters]');
  const n = CONCEPTS.length;
  $('#k-concepts .h-xl').textContent = `${NUM[n] || n} Ideen zum Weiterdenken.`;
  $('[data-c-count]').textContent = `${join(CONCEPTS.map(c => c.name))}. Keine fertigen Häuser, sondern Haltungen.`;
  CH = CONCEPTS.map(c => {
    const frames = [{ img: c.img, cap: 'Von außen.', pos: c.pos }, ...c.views.map(v => ({ ...v, pos: '50% 50%' }))];
    const el = h('article', { class: 'cc', id: 'c-' + c.id, 'aria-label': 'Concept ' + c.name });
    el.innerHTML = `
      <div class="cc__sticky">
        <div class="cc__frames" data-frames>
          ${frames.map((f, i) => `<figure class="cc__f"><img src="${f.img}" alt="${i ? `Concept ${c.name}, ${f.cap.replace('.', '')}` : `Concept ${c.name}, Visualisierung`}" style="object-position:${f.pos}" decoding="async"${i ? ' loading="lazy"' : ''}></figure>`).join('')}
          <div class="cc__shade"></div>
        </div>
        <div class="cc__frame" data-frame id="c-${c.id}-frame" data-dock="edge" data-dock-x=".72" data-dock-trigger="c-${c.id}" data-dock-hide="1"></div>
        <div class="cc__top info" data-top><span>Concept ${c.nr} / ${c.name}</span><span>${c.facts.join(' / ')}</span></div>
        <p class="cc__name" data-name aria-hidden="true"><span>${[...c.word].map(ch => `<i>${ch}</i>`).join('')}</span></p>
        <div class="cc__seq" data-seq aria-hidden="true">
          <p class="cc__cap" data-cap>${frames[0].cap}</p>
          <span class="cc__cnt"><b data-cnt>01</b><small>/ ${pad(frames.length)}</small></span>
          <div class="cc__bar"><i data-bar></i></div>
        </div>
        <div class="cc__panel" data-panel>
          <span class="info">Concept ${c.nr}${c.ph ? ' <span class="cc__ph">/ Werte vorläufig</span>' : ''}</span>
          <h3 class="cc__word">${c.word}</h3>
          <p class="cc__lead">${c.lead}</p>
          <ul class="facts info">${c.facts.map(f => `<li>${f}</li>`).join('')}</ul>
          <p class="cc__fit"><span class="info">Für dich</span><b data-fit></b></p>
          <div class="cc__acts"><button type="button" class="btn-line info" data-fav aria-pressed="false">Merken</button><a class="btn-line info" href="${c.href}">Mehr zu ${c.name}</a></div>
        </div>
        <span class="tag cc__tag" data-tag>${c.cap}</span>
      </div>`;
    host.appendChild(el);
    const q = s => $(s, el);
    const o = {
      c, el, frames, box: q('[data-frames]'), figs: $$('.cc__f', el), ims: $$('.cc__f img', el), frame: q('[data-frame]'), top: q('[data-top]'),
      name: q('[data-name]'), letters: $$('[data-name] i', el), seq: q('[data-seq]'), cap: q('[data-cap]'), cnt: q('[data-cnt]'), bar: q('[data-bar]'),
      panel: q('[data-panel]'), tag: q('[data-tag]'), fit: q('[data-fit]'), fav: q('[data-fav]'), act: 0
    };
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
  const a = answers(), favs = new Set(store.get().favs || []);
  CH.forEach(o => {
    const f = fit(o.c, a);
    o.fit.textContent = f.score ? `Passt zu dir, weil du ${join(f.reasons)}.` : 'Passt nicht ganz. Genau dafür kann man mischen.';
    const on = favs.has(o.c.id);
    o.fav.setAttribute('aria-pressed', String(on)); o.fav.textContent = on ? 'Gemerkt' : 'Merken';
  });
}

function tick() {
  const narrow = innerWidth < 820;
  CH.forEach(o => {
    const { p, on } = prog(o.el);
    if (narrow) { if (o.wasWide !== false) { o.wasWide = false; o.box.style.clipPath = ''; o.figs.forEach(f => { f.style.clipPath = ''; }); o.ims.forEach(i => { i.style.transform = ''; }); o.letters.forEach(l => { l.style.transform = ''; }); [o.name, o.top, o.seq, o.panel, o.tag].forEach(e => { e.style.cssText = ''; }); o.frame.style.cssText = ''; } o.frame.dataset.dockHide = '1'; return; }
    o.wasWide = true;
    if (!on) return;
    const vw = innerWidth, vh = innerHeight, n = o.frames.length;
    /* Öffnen: kleines Bild in der Mitte wird zum Vollbild. Am Ende rückt es nach rechts. */
    const open = SS(p, 0, .17), split = SS(p, .66, .79);
    const iT = lerp(30, 0, open), iS = lerp(37, 0, open);
    const left = lerp(iS, 42, split), right = iS * (1 - split), top = lerp(iT, 12, split), bottom = lerp(iT, 9, split);
    o.box.style.clipPath = `inset(${top.toFixed(2)}% ${right.toFixed(2)}% ${bottom.toFixed(2)}% ${left.toFixed(2)}%)`;
    /* Ansichten wischen von rechts herein, jedes Bild zoomt beim Kommen leicht zurück */
    let act = 0;
    o.figs.forEach((f, i) => {
      const a = i ? .28 + (i - 1) * (n > 2 ? .3 / (n - 2) : 0) : 0, w = i ? E(p, a, a + .08) : 1;
      if (i) f.style.clipPath = `inset(0 0 0 ${((1 - w) * 100).toFixed(2)}%)`;
      if (w > .5) act = i;
      const z = i ? lerp(1.16, 1.03, E(p, a, a + .2)) : lerp(1.24, 1.03, open);
      o.ims[i].style.transform = `scale(${z.toFixed(4)}) translate3d(${(split * 4).toFixed(2)}%,0,0)`;
    });
    if (act !== o.act) {
      o.act = act; o.cap.textContent = o.frames[act].cap; o.cnt.textContent = pad(act + 1);
      o.cap.classList.remove('is-new'); void o.cap.offsetWidth; o.cap.classList.add('is-new');
    }
    o.bar.style.transform = `scaleX(${E(p, .2, .64).toFixed(4)})`;
    o.seq.style.opacity = (E(p, .2, .26) * (1 - E(p, .62, .67))).toFixed(3);
    /* Name: Buchstaben steigen auf, gehen, wenn die Ansichten kommen */
    o.letters.forEach((l, j) => { const t = E(p, .05 + j * .012, .14 + j * .012); l.style.transform = `translate3d(0,${((1 - t) * 110).toFixed(1)}%,0)`; });
    o.name.style.opacity = (1 - E(p, .2, .26)).toFixed(3);
    o.top.style.opacity = (E(p, .12, .2) * (1 - E(p, .62, .66))).toFixed(3);
    const pn = E(p, .74, .86);
    o.panel.style.opacity = pn.toFixed(3);
    o.panel.style.transform = `translateY(${((1 - pn) * 32).toFixed(1)}px)`;
    o.panel.classList.toggle('is-on', pn > .5);
    o.tag.style.opacity = E(p, .8, .86).toFixed(3);
    o.tag.style.left = left.toFixed(2) + '%';
    o.tag.style.bottom = bottom.toFixed(2) + '%';
    /* Andockrahmen = sichtbarer Bildausschnitt */
    const fs = o.frame.style;
    fs.left = (left / 100 * vw).toFixed(1) + 'px'; fs.right = (right / 100 * vw).toFixed(1) + 'px';
    fs.top = (top / 100 * vh).toFixed(1) + 'px'; fs.bottom = (bottom / 100 * vh).toFixed(1) + 'px';
    fs.width = 'auto'; fs.height = 'auto';
    if (p > .3 && p < .985) delete o.frame.dataset.dockHide; else o.frame.dataset.dockHide = '1';
  });
}
