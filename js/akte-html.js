/* Markup der Concepts als Akte, je Haus einer (Kundenwunsch 2026-11-05, Referenz stillform.homes, Video des Kunden):
   1. Name des Hauses, lose Bilder darum, in der Mitte die Bildfolge als kleine Karte mit Pfeilen
   2. die Karte wächst zur Bildfolge des Hauses (70 bis 75 % breit), beim Scrollen wechseln die Bilder
   3. die Bildfolge schrumpft zum kleinen Bild am Anfang des großen Satzes, der Satz läuft Wort für Wort herein,
      darunter Linie und großer Aufruf zur Seite des Hauses. Alles in einem gepinnten Bild, nur über das Scrollen.
   Links eine Liste der vier Häuser zum Springen. Kein DOM hier: tools/pages.mjs schreibt das Markup
   in index.html (Kapitel 03) und in die Seiten der Concepts (Nächstes Concept). js/akte.js bewegt es. */

const NN = n => String(n).padStart(2, '0');

/* Alle Bilder eines Hauses, das Hauptbild zuerst, ohne Doppelte */
export function poolOf(c) {
  const p = c.page || {};
  const list = [c.img, p.hero && p.hero.img, p.fig && p.fig.img, p.band && p.band.img, ...(c.views || []).map(v => v.img), ...(p.licht || []).map(l => l.img)];
  return [...new Set(list.filter(Boolean))];
}

/* Ein Akt. i = Platz des Hauses, n = Anzahl, one = als Nächstes Concept auf einer Hausseite */
export function aktHtml(c, i, n, { one = false } = {}) {
  const pool = poolOf(c), cards = pool.slice(1, 7), kind = /Foto/.test(c.cap) ? 'Foto' : 'Visualisierung';
  const fid = `ak-${c.id}-frame`;
  /* Das kleine Bild im Satz ist das Bild, bei dem die Bildfolge nach drei Wechseln ankommt */
  const thumb = pool[3 % pool.length];
  const words = c.text.split(/\s+/).map(w => `<span class="ak__w"><span>${w}</span></span>`).join(' ');
  return `
<article class="ak" id="ak-${c.id}" data-ak="${c.id}">
  <div class="ak__stage" data-ak-stage>
    <div class="ak__sticky">
      <div class="ak__title" data-ak-title>
        <span class="info">${one ? `Nächstes Concept / ${NN(i + 1)} von ${NN(n)}` : `Concept ${NN(i + 1)} / ${NN(n)}`}</span>
        <h3 class="ak__h">${c.name}.</h3>
        <p class="ak__fuer">${c.fuer}</p>
      </div>
      <div class="ak__cards" aria-hidden="true">${cards.map(src => `<figure class="ak__card" data-ak-card><img src="${src}" alt="" loading="lazy" decoding="async"></figure>`).join('')}</div>
      <div class="ak__about" data-ak-about>
        <span class="info ak__kap" data-ak-kap>Concept ${NN(i + 1)} / ${c.name} / Die Antwort im Raum</span>
        <p class="ak__say"><span class="ak__thumb" data-ak-thumb><img src="${thumb}" alt="" loading="lazy" decoding="async"></span>${words}</p>
        <div class="ak__rule" data-ak-rule></div>
        <div class="ak__row" data-ak-row>
          <a class="ak__go" href="${c.href}">Concept ${c.name} ansehen</a>
          <ul class="facts info ak__facts">${c.facts.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="ak__frame" id="${fid}" data-ak-frame data-dock="edge" data-dock-x=".8" data-dock-trigger="${fid}" data-dock-hide="1" role="group" aria-roledescription="Bildfolge" aria-label="Bilder von Concept ${c.name}">
        <div class="ak__slides" data-ak-slides>${pool.map((src, k) => `<div class="ak__slide" data-ak-slide${k ? ' aria-hidden="true"' : ''}><img src="${src}" alt="Concept ${c.name}, Bild ${k + 1} von ${pool.length}, ${kind}" style="object-position:${k ? '50% 50%' : (c.pos || '50% 50%')}"${k ? ' loading="lazy"' : ''} decoding="async"></div>`).join('')}</div>
        <div class="ak__ui" data-ak-ui>
          <span class="info ak__count" data-ak-count>01 / ${NN(pool.length)}</span>
          <span class="info ak__cap">${c.cap}</span>
        </div>
        <div class="ak__arrows" data-ak-arrows><button type="button" class="ak__arrow" data-ak-prev aria-label="Vorheriges Bild" tabindex="-1">←</button><button type="button" class="ak__arrow" data-ak-next aria-label="Nächstes Bild" tabindex="-1">→</button></div>
      </div>
    </div>
  </div>
</article>`;
}

/* Kapitel 03 auf der Concepts Seite: Liste links, Einleitung, vier Akte */
export function akteHtml(list) {
  const n = list.length;
  return `
      <div class="aks" data-aks>
        <nav class="aks__nav" aria-label="Die ${n} Concepts">
          <div class="aks__navin">
            <span class="info aks__navk">Kapitel 03 / Inspiration</span>
            <ol class="aks__list">${list.map((c, i) => `
              <li><a class="aks__link" href="#ak-${c.id}" data-ak-link="${c.id}"><span class="info">${NN(i + 1)}</span><span class="aks__name">${c.name}</span><i aria-hidden="true"></i></a></li>`).join('')}
            </ol>
          </div>
        </nav>
        <div class="aks__main">
          <div class="aks__intro">
            <span class="info aks__k">Kapitel 03 / Inspiration</span>
            <h2 class="h-xl" data-reveal="0">Vier Lebensgefühle. Vier Concepts.</h2>
            <p class="txt aks__p" data-reveal="120">Jedes unserer Concepts ist aus einem Lebensgefühl entstanden. Sie sind keine fertigen Häuser, sondern Ideen zum Weiterdenken.</p>
          </div>${list.map((c, i) => aktHtml(c, i, n)).join('')}
        </div>
      </div>
`;
}

/* Nächstes Concept auf einer Hausseite: derselbe Akt, links nur der Hinweis und der Weg zu allen */
export function nextHtml(list, nx) {
  const i = list.indexOf(nx), n = list.length;
  return `
      <div class="aks aks--one" data-aks>
        <nav class="aks__nav" aria-label="Weitere Concepts">
          <div class="aks__navin">
            <span class="info aks__navk">Nächstes Concept / ${NN(i + 1)} von ${NN(n)}</span>
            <a class="aks__all info" href="index.html#k-concepts">Alle Concepts</a>
          </div>
        </nav>
        <div class="aks__main">${aktHtml(nx, i, n, { one: true })}
        </div>
      </div>
`;
}
