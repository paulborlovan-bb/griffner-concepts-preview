/* Runde 39: Seite mit allen Grundrissen (grundrisse.html, erzeugt von tools/grundrisse-seite.mjs).
   Header, Menü und Footer wie die übrigen Seiten (chrome.js). Das 3D Modell (js/grundriss.js mit three.js) lädt erst,
   wenn die erste Karte näher kommt; bis dahin zeigt jede Karte ihr Bild (Poster). */
import { loop, reveal } from './core.js';
import { initChrome, frame } from './chrome.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());

const roots = document.querySelectorAll('[data-gr]');
if (roots.length) {
  let done = false;
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) go(); }, { rootMargin: '1200px 0px' });
  function go() {
    if (done) return; done = true; io.disconnect();
    import('./grundriss.js').catch(e => { console.warn('Grundriss 3D nicht geladen', e); roots.forEach(r => r.classList.add('is-fallback')); });
  }
  roots.forEach(r => io.observe(r));
}
