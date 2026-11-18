/* Markup der Concepts als Akte, je Haus einer (Kundenwunsch 2026-11-05, Referenz stillform.homes, Video des Kunden):
   1. Name des Hauses, lose Bilder darum, in der Mitte die Bildfolge als kleine Karte mit Pfeilen
   2. die Karte wächst zur Bildfolge des Hauses (70 bis 75 % breit), beim Scrollen wechseln die Bilder
   3. die Bildfolge schrumpft zum kleinen Bild am Anfang des großen Satzes, der Satz läuft Wort für Wort herein,
      darunter Linie und großer Aufruf zur Seite des Hauses. Alles in einem gepinnten Bild, nur über das Scrollen.
   Links eine Liste der Häuser zum Springen. Auf der Concepts Seite ohne Einleitung, der große Titel ist ein eigenes Feld
   („Zum Beispiel so.“), Liste und Aufruf zeigen die Namen (Runde 13 und 14). Kein DOM hier: tools/pages.mjs schreibt das Markup
   in index.html (Kapitel 03) und in die Seiten der Concepts (Nächstes Concept). js/akte.js bewegt es. */

const NN = n => String(n).padStart(2, '0');
/* Texte kommen in Framer aus den Eigenschaften der Komponente, darum immer maskieren */
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Bilder aus Framer (…/images/x.jpg?width=W&height=H): mehrere Größen aus dem CDN (scale-down-to), der Browser nimmt die
   kleinste, die auf diesem Bildschirm (auch Retina) noch scharf ist. Bisher lud jede Karte und jedes Bild der Bildfolge das
   Original (bis 4800 px). sizes = angezeigte Breite; beim Zuschnitt (object-fit: cover) zählt die Höhe mal Seitenverhältnis.
   Framer rendert das Markup ohne Fenster, darum hier eine großzügige Schätzung aus den Maßen von js/akte.js (layout);
   js/akte.js setzt sizes nach dem Vermessen genau. Alle Bilder laden spät (loading="lazy"), js/akte.js holt sie rechtzeitig. */
const AK_W = [512, 1024, 1600, 2048, 2400, 3200];
const akF = n => (Math.round(n * 1000) / 1000).toString();
function akImg(src, sizes, attrs) {
  const m = /^(https:\/\/framerusercontent\.com\/images\/[^?#"]+)\?width=(\d+)&height=(\d+)$/.exec(String(src || ''));
  if (!m) return `<img src="${src}"${attrs}>`;
  /* scale-down-to begrenzt die längere Seite: ein Hochformat ist danach schmaler, die Angabe …w ist die echte Breite */
  const w = +m[2], h = +m[3], a = w / h, L = Math.max(w, h), q = `width=${m[2]}&height=${m[3]}`;
  const set = AK_W.filter(x => x < L).map(x => `${m[1]}?scale-down-to=${x}&${q} ${Math.round(w * x / L)}w`).concat(`${src} ${w}w`).join(', ');
  return `<img src="${src}" srcset="${set}" sizes="${sizes(a)}" data-ak-ar="${akF(a)}"${attrs}>`;
}
/* Bildfolge: Telefon W = 100vw − 32, H = min(100vh − 126, 1.32 W); Desktop W ≤ 85vw, H ≤ 74vh.
   Karten und das kleine Bild im Satz zeigen dieselben Bilder wie die Bildfolge: gleiche sizes, damit jedes Bild nur
   einmal lädt (eine eigene kleine Größe für die Karten hieße zweimal laden, im Test mehr statt weniger). */
const akSlide = a => `(max-width: 759px) max(100vw - 32px, min(100vh - 126px, 132vw - 42px) * ${akF(a)}), max(85vw, 74vh * ${akF(a)})`;

/* Alle Bilder eines Hauses, das Hauptbild zuerst, ohne Doppelte */
export function poolOf(c) {
  if (c.pool && c.pool.length) return c.pool;
  const p = c.page || {};
  const list = [c.img, p.hero && p.hero.img, p.fig && p.fig.img, p.band && p.band.img, ...(c.views || []).map(v => v.img), ...(p.licht || []).map(l => l.img)];
  return [...new Set(list.filter(Boolean))];
}

/* Ein Akt. i = Platz des Hauses, n = Anzahl, one = als Nächstes Concept auf einer Hausseite, go = Aufruf zur Seite des Hauses */
export function aktHtml(c, i, n, { one = false, go = true } = {}) {
  const pool = poolOf(c), cards = pool.slice(1, 7), kind = /Foto/.test(c.cap || '') ? 'Foto' : 'Visualisierung', name = esc(c.name);
  /* Großer Titel: eigenes Feld, sonst der Name. Endet er schon mit einem Satzzeichen, kommt kein Punkt dazu */
  const raw = String(c.titel || c.name || '').trim(), dot = /[.!?…]$/.test(raw) ? '' : '.';
  const short = name;
  const fid = `ak-${c.id}-frame`;
  /* Das kleine Bild im Satz ist das Bild, bei dem die Bildfolge nach drei Wechseln ankommt */
  const thumb = pool[3 % pool.length];
  const words = String(c.text || '').split(/\s+/).filter(Boolean).map(w => `<span class="ak__w"><span>${esc(w)}</span></span>`).join(' ');
  return `
<article class="ak" id="ak-${c.id}" data-ak="${c.id}">
  <div class="ak__stage" data-ak-stage>
    <div class="ak__sticky">
      <div class="ak__title" data-ak-title>
        <h3 class="ak__h"><a class="ak__hl" href="${esc(c.href)}">${esc(raw)}${dot}</a></h3>${String(c.fuer || '').trim() ? `
        <p class="ak__fuer">${esc(c.fuer)}</p>` : ''}
      </div>
      <div class="ak__cards" aria-hidden="true">${cards.map(src => `<figure class="ak__card" data-ak-card>${akImg(src, akSlide, ' alt="" loading="lazy" decoding="async"')}</figure>`).join('')}</div>
      <div class="ak__about" data-ak-about>
        <p class="ak__say"><span class="ak__thumb" data-ak-thumb>${akImg(thumb, akSlide, ' alt="" loading="lazy" decoding="async"')}</span>${words}</p>
        <div class="ak__rule" data-ak-rule></div>
        <div class="ak__row" data-ak-row>${go ? `
          <a class="ak__go" href="${esc(c.href)}" aria-label="${esc(`Concept ${c.name} ansehen`)}">${esc(c.go || 'Concept ansehen')}</a>` : ''}
          <ul class="facts info ak__facts">${(c.facts || []).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="ak__frame" id="${fid}" data-ak-frame data-dock="edge" data-dock-x=".8" data-dock-trigger="${fid}" data-dock-hide="1" role="group" aria-roledescription="Bildfolge" aria-label="Bilder von Concept ${short}">
        <div class="ak__slides" data-ak-slides>${pool.map((src, k) => `<div class="ak__slide" data-ak-slide${k ? ' aria-hidden="true"' : ''}>${akImg(src, akSlide, ` alt="Concept ${short}, Bild ${k + 1} von ${pool.length}, ${kind}" style="object-position:${k ? '50% 50%' : (c.pos || '50% 50%')}" loading="lazy" decoding="async"`)}</div>`).join('')}</div>
        <a class="ak__open" href="${esc(c.href)}" tabindex="-1" aria-hidden="true"></a>
        <div class="ak__ui" data-ak-ui>
          <span class="info ak__count" data-ak-count>01 / ${NN(pool.length)}</span>
        </div>
        <div class="ak__arrows" data-ak-arrows><button type="button" class="ak__arrow" data-ak-prev aria-label="Vorheriges Bild" tabindex="-1">←</button><button type="button" class="ak__arrow" data-ak-next aria-label="Nächstes Bild" tabindex="-1">→</button></div>
      </div>
    </div>
  </div>
</article>`;
}

/* Kapitel 03 auf der Concepts Seite: Liste links mit den Namen, rechts die Akte mit ihrem Titel und dem Aufruf „Concept ansehen“
   (Runde 21: ohne den Namen, der steht nur noch im aria-label), ohne Einleitung */
export function akteHtml(list) {
  const n = list.length;
  return `
      <div class="aks" data-aks>
        <nav class="aks__nav" aria-label="Die ${n} Concepts">
          <div class="aks__navin">
            <ol class="aks__list">${list.map((c, i) => `
              <li><a class="aks__link" role="button" tabindex="0" data-ak-link="${c.id}"><span class="info">${NN(i + 1)}</span><span class="aks__name">${esc(c.name)}</span><i aria-hidden="true"></i></a></li>`).join('')}
            </ol>
          </div>
        </nav>
        <div class="aks__main">${list.map((c, i) => aktHtml(c, i, n)).join('')}
        </div>
      </div>
`;
}

/* Nächstes Concept auf einer Hausseite: derselbe Akt, links nur der Hinweis und der Weg zu allen */
export function nextHtml(list, nx, all = 'Alle Concepts') {
  const i = Math.max(0, list.indexOf(nx)), n = list.length;
  return `
      <div class="aks aks--one" data-aks>
        <nav class="aks__nav" aria-label="Weitere Concepts">
          <div class="aks__navin">
            <a class="aks__all info" href="index.html#k-concepts">${esc(all)}</a>
          </div>
        </nav>
        <div class="aks__main">${aktHtml({ ...nx, titel: "" }, i, n, { one: true })}
        </div>
      </div>
`;
}
