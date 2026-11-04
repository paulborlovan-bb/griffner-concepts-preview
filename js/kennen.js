/* 01 KENNENLERNEN. Drei Fragen, daraus ein erstes Raumprogramm. Das Arbeitsmodell in 3D baut sich daraus auf (bau3d.js). */
import { $, store, h } from './core.js';
import { QUESTIONS, DEFAULT_ANSWERS, program, sentence } from '../data/content.js';
import { initBau, bauUpdate, bauHot, roomKeys } from './bau3d.js';

let form, say, list, notes, total;

export const answers = () => ({ ...DEFAULT_ANSWERS, ...(store.get().answers || {}) });

export function initKennen() {
  form = $('[data-ask]'); say = $('[data-sheet-say]'); list = $('[data-sheet-list]'); notes = $('[data-sheet-notes]'); total = $('[data-sheet-total]');
  initBau();
  list.addEventListener('pointerover', e => { const li = e.target.closest('li[data-key]'); bauHot(li ? li.dataset.key : null); });
  list.addEventListener('pointerleave', () => bauHot(null));
  QUESTIONS.forEach((q, qi) => {
    const fs = h('fieldset', { 'data-reveal': String(qi * 100) });
    fs.innerHTML = `<legend><span class="info">Frage 0${qi + 1}${q.multi ? ' / Mehrere möglich' : ''}</span><span class="ask__n">${q.label}</span></legend>`;
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
    const set = new Set(a[q.key]);
    set.has(v) ? set.delete(v) : set.add(v);
    if (set.size > 4) return;
    a[q.key] = [...set];
  } else a[q.key] = v;
  store.set({ answers: a, touched: true });
}

function render() {
  const a = answers();
  form.querySelectorAll('.chip').forEach(b => {
    const cur = a[b.dataset.k];
    b.setAttribute('aria-pressed', String(Array.isArray(cur) ? cur.includes(b.dataset.v) : cur === b.dataset.v));
  });
  const P = program(a);
  say.textContent = sentence(a);
  total.textContent = `Rund ${Math.round(P.total / 5) * 5} m²`;
  const keys = roomKeys(P.rooms);
  list.innerHTML = P.rooms.map((r, i) => `<li data-key="${keys[i]}"><b>${r.room}${r.note ? `<br><span>${r.note}</span>` : ''}</b><span>${r.m2} m²</span></li>`).join('');
  notes.innerHTML = P.notes.map(n => `<li>${n}</li>`).join('');
  bauUpdate(P, a);
}
