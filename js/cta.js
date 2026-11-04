/* CTA. Fasst zusammen, was du auf der Seite gewählt hast. Nichts wird gesendet, alles bleibt in deinem Browser. */
import { $, store, reduce } from './core.js';
import { CONCEPTS, SITES, MIX, program, sentence } from '../data/content.js';
import { answers } from './kennen.js';
import { best } from './concepts.js';

const NAME = Object.fromEntries(CONCEPTS.map(c => [c.id, c.name]));
let dl;
export function initCta() {
  dl = $('[data-know]');
  $('[data-forget]').addEventListener('click', () => {
    try { localStorage.removeItem('griffner-konzepte-v1'); } catch (e) { /* nichts gemerkt */ }
    store.set({ answers: undefined, touched: false, site: undefined, mix: undefined, mixTouched: false, favs: [] });
    scrollTo({ top: document.getElementById('k-kennen').getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' });
  });
  render();
  store.on(render);
}
const link = (id, t) => `<a href="#${id}">${t}</a>`;
function render() {
  const s = store.get(), a = answers();
  const rows = [];
  rows.push(['Du', s.touched ? sentence(a) : null, link('k-kennen', 'Erzähl uns von dir')]);
  rows.push(['Raumprogramm', s.touched ? `Rund ${Math.round(program(a).total / 5) * 5} m², ${program(a).rooms.length} Räume` : null, link('k-kennen', 'Noch offen')]);
  const site = SITES.find(x => x.key === s.site);
  rows.push(['Grundstück', site ? `${site.label}, ${site.size}` : null, link('k-grund', 'Noch offen')]);
  const favs = (s.favs || []).map(id => NAME[id]).filter(Boolean);
  const b = best();
  rows.push(['Concepts', favs.length ? `Gemerkt: ${favs.join(', ')}` : (s.touched && b.score ? `Am nächsten: ${b.c.name}` : null), link('k-concepts', 'Noch keins gemerkt')]);
  rows.push(['Mix', s.mixTouched && s.mix ? MIX.map(r => `${r.label} ${NAME[s.mix[r.key]]}`).join(', ') : null, link('k-mix', 'Noch nicht gemischt')]);
  dl.innerHTML = rows.map(([k, v, empty]) => `<dt class="info">${k}</dt><dd class="${v ? '' : 'is-empty'}">${v || empty}</dd>`).join('');
}
