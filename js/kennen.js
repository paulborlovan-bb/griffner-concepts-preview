/* 01 KENNENLERNEN. Drei Fragen, daraus ein erstes Raumprogramm. Rechts nur das Arbeitsmodell in 3D mit Möbeln (bau3d.js) und die Fläche. */
import { $, store, h } from './core.js';
import { QUESTIONS, cleanAnswers, program } from '../data/content.js';
import { initBau, bauUpdate } from './bau3d.js';

let form, total;

export const answers = () => cleanAnswers(store.get().answers);

export function initKennen() {
  form = $('[data-ask]'); total = $('[data-sheet-total]');
  initBau();
  QUESTIONS.forEach((q, qi) => {
    const fs = h('fieldset', { 'data-reveal': String(qi * 100) });
    fs.innerHTML = `<legend><span class="ask__n">${q.label}</span></legend>`;
    const chips = h('div', { class: 'chips' });
    q.opts.forEach(([v, l]) => {
      const b = h('button', { type: 'button', class: 'chip', 'data-k': q.key, 'data-v': v, 'aria-pressed': 'false' }, l);
      b.addEventListener('click', () => pick(q, v));
      chips.appendChild(b);
    });
    fs.appendChild(chips); form.appendChild(fs);
  });
  render();
  store.on((s, patch) => { if ('answers' in patch) render(); });
}

function pick(q, v) {
  const a = answers();
  if (q.multi) {
    /* Mehrere Antworten möglich: an und aus */
    const list = a[q.key].filter(k => k !== v);
    if (list.length === a[q.key].length) list.push(v);
    a[q.key] = list;
  } else a[q.key] = v;
  store.set({ answers: a, touched: true });
}

function render() {
  const a = answers();
  form.querySelectorAll('.chip').forEach(b => {
    const cur = a[b.dataset.k];
    b.setAttribute('aria-pressed', String(Array.isArray(cur) ? cur.includes(b.dataset.v) : cur === b.dataset.v));
  });
  /* Rechts nur das Modell und die Fläche, keine Liste: die Räume stehen im Modell */
  const P = program(a);
  total.textContent = `Rund ${Math.round(P.total / 5) * 5} m²`;
  bauUpdate(P, a);
}
