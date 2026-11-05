/* 02 GRUNDSTÜCK. Texte, Ortswahl und Fortschritt. Das Geländemodell selbst steckt in grund3d.js:
   Grenze, Bestand, Sonne, dann wird das Haus gesetzt und gedreht. Am Ende frei wählbar. */
import { $, $$, E, win, prog, loop, store, h } from './core.js';
import { SITES, SITE_STEPS } from '../data/content.js';
import { initG3, g3Site, g3Tick } from './grund3d.js';

let D;

export function initGrund() {
  D = { pin: $('[data-g-pin]'), steps: $('[data-g-steps]'), tabs: $('[data-g-tabs]'), size: $('[data-g-size]') };
  D.st = SITE_STEPS.map(([a, b], i) => {
    const el = h('div', { class: 'gstep' }, `<span class="info">0${i + 1} / 0${SITE_STEPS.length}</span><h3 class="gstep__h">${a}</h3><p class="txt">${b}</p>${i === SITE_STEPS.length - 1 ? '<p class="gstep__note" data-g-note></p>' : ''}`);
    D.steps.appendChild(el); return el;
  });
  D.note = $('[data-g-note]');
  SITES.forEach(s => {
    const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', 'data-site': s.key }, s.label);
    b.addEventListener('click', () => { store.set({ site: s.key }); });
    D.tabs.appendChild(b);
  });
  initG3(SITES, store.get().site || 'eben');
  build();
  store.on((st, patch) => { if ('site' in patch) build(); });
  loop.add({ tick });
}

function build() {
  const key = store.get().site || 'eben';
  const site = SITES.find(s => s.key === key) || SITES[0];
  $$('[data-site]', D.tabs).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.site === site.key)));
  D.size.textContent = 'Grundstück ' + site.size;
  if (D.note) D.note.textContent = site.note;
  g3Site(site.key);
  loop.poke();
}

function tick() {
  const narrow = innerWidth < 820;
  const { p, on } = prog(D.pin); if (!on) return;
  const nSt = D.st.length;
  D.st.forEach((el, i) => {
    const a = i / nSt, b = (i + 1) / nSt;
    const o = i === nSt - 1 ? E(p, a, a + .04) : win(p, a, b, .04);
    el.style.opacity = o.toFixed(3);
    /* Telefon: Schritte stehen oben unter dem Modell, sonst mittig neben dem Modell */
    el.style.transform = narrow ? `translateY(${((1 - E(p, a, a + .06)) * 18).toFixed(1)}px)` : `translateY(calc(-50% + ${((1 - E(p, a, a + .06)) * 24).toFixed(1)}px))`;
  });
  g3Tick(p);
  D.tabs.classList.toggle('is-on', p > .82);
  D.size.style.opacity = E(p, .04, .12).toFixed(3);
}
