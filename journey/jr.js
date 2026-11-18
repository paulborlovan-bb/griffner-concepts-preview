/* GRIFFNER Journey, fünf Vorschläge. Gemeinsame Texte und Helfer.
   Texte: 01 bis 03 von der Concepts Seite (Dein Weg, live), 04 bis 14 aus dem Services Entwurf (Besser bauen, Monat 0 bis 10).
   Die Reihe der 14 Schritte ist unser Vorschlag und noch nicht freigegeben. */

export const STEPS = [
  { t: 'Kennenlernen', d: 'Wir hören zu, bevor wir zeichnen.', m: 'Vorab', ph: 0, mo: -3 },
  { t: 'Grundstück', d: 'Wir lesen deinen Ort. Gelände, Bäume, Sonne.', m: 'Vorab', ph: 0, mo: -2 },
  { t: 'Inspiration', d: 'Vier Concepts zum Weiterdenken.', m: 'Vorab', ph: 0, mo: -1 },
  { t: 'Vertrag', d: 'Persönlicher Projektmanager ab dem ersten Tag.', m: 'Monat 0', ph: 1, mo: 0 },
  { t: 'Dein Plan', d: 'Grundriss, Ansichten, Lage stehen fest.', m: 'Monat 1', ph: 1, mo: 1 },
  { t: 'Eingereicht', d: 'Unterlagen vollständig, wir liefern jedes Dokument.', m: 'Monat 2', ph: 2, mo: 2 },
  { t: 'Bemusterung', d: 'Besuch in Griffen, Ausstattung festlegen.', m: 'Monat 3', ph: 1, mo: 3 },
  { t: 'Baubescheid', d: 'Die Gemeinde gibt grünes Licht.', m: 'Monat 4', ph: 2, mo: 4 },
  { t: 'Planung fixiert', d: 'Geht in Fertigung, ab hier ändert sich nichts mehr.', m: 'Monat 5', ph: 1, mo: 5 },
  { t: 'Baustart', d: 'Das Fundament entsteht.', m: 'Monat 6', ph: 3, mo: 6 },
  { t: 'Dein Haus entsteht', d: 'Eine Woche Manufaktur in Griffen, dann steht es mit Dach und Fenstern.', m: 'Monat 7', ph: 3, mo: 7 },
  { t: 'Haustechnik', d: 'Heizung, Lüftung, Strom, Wasser.', m: 'Monat 8', ph: 3, mo: 8 },
  { t: 'Innenausbau', d: 'Türen, Böden, Bäder. Jetzt wird es deins.', m: 'Monat 9', ph: 3, mo: 9 },
  { t: 'Einzug', d: 'Wir gehen ein letztes Mal gemeinsam durch dein Haus. Dann schließt du selbst auf.', m: 'Monat 10', ph: 4, mo: 10 }
].map((s, i) => ({ ...s, nr: String(i + 1).padStart(2, '0') }));

/* Phasen wie im Services Entwurf (Projektsteuerung: Planung, Behörden, Bau, Übergabe), davor das Kennenlernen */
export const PHASES = ['Kennenlernen', 'Planung', 'Behörden', 'Bau', 'Übergabe'];

export const INTRO = {
  info: 'Journey',
  h: 'Vom ersten Gespräch bis zum Schlüssel.',
  lead: 'Ein Projektmanager an deiner Seite. Und der Schlüssel in zehn Monaten.'
};
export const OUTRO = {
  info: 'Dein Haus',
  h: '10 Monate. Dein Traumhaus ist bezugsfertig.',
  lead: 'Während andere noch planen, lebst du schon.',
  cta: 'Kontakt aufnehmen', href: 'https://griffner.com/contact#contact-form'
};

export const PROPOSALS = [
  { file: 'gehen.html', name: 'Gehen', idea: 'Du gehst in 3D auf dein Haus zu. An jeder Station öffnet sich ein Schritt, das Haus entsteht am Ende des Wegs.' },
  { file: 'skizze.html', name: 'Skizze', idea: 'Eine Silhouette geht eine gezeichnete Linie hinauf, wie in der Skizze aus der Bildwelt. Jeder Pflock zeigt einen Schritt.' },
  { file: 'linie.html', name: 'Linie', idea: 'Eine ruhige senkrechte Zeitleiste auf Weiß. Das gelbe Feld läuft mit, die große Zahl zählt mit.' },
  { file: 'rad.html', name: 'Rad', idea: 'Ein Messrad mit 14 Teilstrichen dreht sich beim Scrollen. Am gelben Zeiger steht der aktuelle Schritt groß.' },
  { file: 'plan.html', name: 'Plan', idea: 'Der Weg als Ablaufplan: Phasen als Bahnen, Monate als Achse. Die Verbindung zeichnet sich von Feld zu Feld.' }
];

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
/* weicher Übergang von a bis b */
export const E = (x, a, b) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* Fortschritt einer hohen Sektion mit klebender Bühne: 0 oben, 1 wenn das Ende erreicht ist */
export function prog(el) {
  const r = el.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
  return { p: clamp(-r.top / span), on: r.top < innerHeight && r.bottom > 0 };
}

/* Kopfzeile wie griffner.com (Logo mittig, beim Scrollen die Wortmarke links) und die Leiste der Vorschläge */
export function chrome(n) {
  const P = PROPOSALS, i = n - 1, prev = P[(i + P.length - 1) % P.length], next = P[(i + 1) % P.length];
  const hd = document.createElement('header');
  hd.className = 'jh';
  hd.innerHTML = `
    <a class="jh__logo" href="https://griffner.com/" aria-label="GRIFFNER Startseite"><span class="jh__field"></span><span class="wm"></span></a>
    <a class="jh__marke" href="https://griffner.com/" aria-label="GRIFFNER Startseite" tabindex="-1"><span class="wm"></span></a>
    <nav class="jb" aria-label="Journey Vorschläge">
      <a class="jb__a" href="${prev.file}" aria-label="Voriger Vorschlag: ${prev.name}">‹</a>
      <span class="jb__now"><span class="jb__n">${n}/${P.length}</span> <span class="jb__name">${P[i].name}</span></span>
      <a class="jb__a" href="${next.file}" aria-label="Nächster Vorschlag: ${next.name}">›</a>
      <a class="jb__all" href="index.html">Alle</a>
    </nav>`;
  document.body.prepend(hd);
  const set = () => hd.classList.toggle('is-compact', scrollY > 40);
  addEventListener('scroll', set, { passive: true }); set();
}

export function introHTML(cls = '') {
  return `<div class="ji ${cls}"><p class="info ji__info">${INTRO.info}</p><h1 class="h-xl ji__h">${INTRO.h}</h1><p class="lead ji__lead">${INTRO.lead}</p><p class="info ji__hint" aria-hidden="true">Scrollen</p></div>`;
}
export function outroHTML(cls = '') {
  return `<div class="jo ${cls}"><p class="info">${OUTRO.info}</p><h2 class="h-xl jo__h">${OUTRO.h}</h2><p class="lead jo__lead">${OUTRO.lead}</p><a class="btn" href="${OUTRO.href}">${OUTRO.cta}<span aria-hidden="true">→</span></a></div>`;
}
/* Einfache Liste aller Schritte: für reduzierte Bewegung und als Lesefassung */
export function listHTML(cls = '') {
  return `<ol class="jl ${cls}">${STEPS.map(s => `<li class="jl__i"><span class="info jl__m">${s.nr} · ${s.m}</span><h3 class="h-l jl__t">${s.t}</h3><p class="txt jl__d">${s.d}</p></li>`).join('')}</ol>`;
}

/* Ein Bildschirm-Takt: läuft nur, solange jemand es braucht */
export function ticker(fn) {
  let on = false, raf = 0;
  const run = t => { raf = 0; if (fn(t) === true || on) raf = requestAnimationFrame(run); };
  return {
    poke() { if (!raf) raf = requestAnimationFrame(run); },
    hold(v) { on = v; if (v) this.poke(); }
  };
}
