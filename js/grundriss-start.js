/* Runde 43: startet den realistischen Grundriss (js/grundriss.js mit three.js) erst, wenn eine Karte [data-gr] näher kommt;
   bis dahin zeigt jede Karte ihr Bild (Poster). Für grundrisse.html und die Seiten der Concepts (Sektion #w-plan),
   in Framer die Komponente Wald Plan. */
export function startGrundriss() {
  const roots = document.querySelectorAll('[data-gr]');
  if (!roots.length) return;
  let done = false;
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) go(); }, { rootMargin: '1200px 0px' });
  function go() {
    if (done) return; done = true; io.disconnect();
    import('./grundriss.js').catch(e => { console.warn('Grundriss 3D nicht geladen', e); roots.forEach(r => r.classList.add('is-fallback')); });
  }
  roots.forEach(r => io.observe(r));
}
