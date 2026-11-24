/* GRIFFNER Journey, Runde 14 (2026-11-24): die Seite /journey nach dem neuen Entwurf „Dein Weg“ (Handoff J10Journey, Claude Design).
   Eine durchgehende Kamerafahrt durch eine gezeichnete 3D-Welt (Canvas 2D, eigene Projektion): Hero, Manifest, GRIFFNER Journey,
   die 14 Tage mit Start, Zwischenziel und Ziel, „14 Tage deiner Zeit.“, Tag 15, Besser leben; danach „Wie wir das möglich machen.“
   und das Schlussbild mit Knopf. Logik, Kamera und Zeichnen sind aus dem Entwurf übernommen (Klasse Component in J10Journey.dc.html).
   Änderungen des Kunden gegenüber dem Entwurf:
   - „Wie wir das möglich machen.“: statt der Zeichnungen des Entwurfs die eigenen Zeichnungen aus Runde 11 (weg-zeichnung.js).
   - „Besser leben.“: Bild, Text und die vier Einträge bleiben, die Einträge sind schöner eingebunden: Nummer und Merkzeile, die Linien
     zeichnen sich nacheinander und laufen bis an das Bild, die Liste endet auf der Unterkante des Bildes, der aktive Eintrag trägt
     die gelbe Notiz. Telefon: ein Eintrag nach dem anderen unter dem Bild, mit Zähler.
   Auf der Website (Framer, JourneyWeg) kommen Kopfzeile, das gelbe Feld, das Kontaktformular und die Fußzeile von der Website;
   deps.scrollTo gleitet mit Lenis, deps.reduce schaltet die Bewegung ab, deps.still zeigt eine ruhige Fassung (Framer Canvas). */
import { esc, srcset } from './basis.js';
import { zeichnung } from './weg-zeichnung.js';
import { LEBEN } from './inhalt.js';

const K = n => LEBEN.kapitel.find(k => k.art === n) || {};
export const DEF = {
  hero: ['Gib uns 14 Tage deiner Zeit.', 'Um den Rest kümmern wir uns.'],
  manifest: 'Ein Haus zu bauen kostet meist unzählige Abende, Wochenenden und Telefonate. Bei uns sind es 14 Tage, an denen du entscheidest, wie du leben willst. Alles dazwischen übernehmen wir, mit der Erfahrung aus über 75 Jahren. So wird das wichtigste Projekt deines Lebens auch das schönste.',
  journey: 'Das ist die GRIFFNER Journey.',
  phasen: [
    { name: 'Besser planen.', range: 'Tag 01 bis 07', desc: 'Vom ersten Gespräch bis zum Auftrag.' },
    { name: 'Besser bauen.', range: 'Tag 08 bis 14', desc: 'Vom Projektstart bis zur Übergabe.' },
    { name: 'Besser leben.', range: 'Ab Tag 15', desc: 'Vom Einzug an, ein Leben lang.' }
  ],
  marken: [['Start', 'Besser planen.'], ['Zwischenziel', 'Besser bauen.'], ['Ziel', 'Besser leben.']],
  tag: 'Tag', kwKnopf: 'Darum kümmern wir uns',
  tage: [
    ['Architekturkonzept', 'Wir lernen deinen Alltag und deine Wünsche kennen und entwickeln daraus die architektonische Idee für dein Haus.', ['Kennenlernen deines Projektmanagers', 'Analyse von Wohnbedarf und Lebensgewohnheiten', 'Definition der benötigten Räume', 'Erste architektonische Ideen', 'Stilrichtung und Referenzen']],
    ['Machbarkeitsanalyse', 'Vor Ort prüfen wir Baurecht, Gelände und Erschließung und zeigen, wie sich dein Haus am besten in das Grundstück fügt.', ['Prüfung von Bebauungsplan und Baurecht', 'Analyse von Topografie und Ausrichtung', 'Zufahrt und Erschließung', 'Abstimmung mit der Gemeinde', 'Erste Situierung von Haus und Außenanlagen']],
    ['Budgetanalyse', 'Wir erfassen die Gesamtkosten deines Projekts vom Haus bis zu den Außenanlagen und setzen gemeinsam mit dir die Prioritäten.', ['Kostenrahmen für Haus und Unterbau', 'Haustechnik und Anschlüsse', 'Erschließung und Außenanlagen', 'Baunebenkosten', 'Priorisierung nach Umsetzungszeitpunkt', 'Aufzeigen von Optimierungspotenzial']],
    ['Varianten', 'Wir entwickeln mehrere Varianten als Skizze und 3D-Modell. Du wählst die Grundlage für deinen Entwurf.', ['Baukörperstudien', 'Vorentwürfe mit Skizzen und 3D-Modell', 'Vergleich von Raumaufteilung und Belichtung', 'Bezug zu Garten und Umgebung', 'Kostenschätzung je Variante']],
    ['Entwurfsplanung', 'Aus der gewählten Variante entsteht dein Entwurf, mit Fassade, Dach und Fenstern sowie der Planung der Außenanlagen.', ['Lageplan', 'Grundrisse, Schnitte und Ansichten', 'Außenvisualisierungen', 'Planung der Außenanlagen', 'Vorprüfung von Statik und Haustechnik', 'Aktualisierte Kostenschätzung']],
    ['Innenarchitektur', 'Ein guter Entwurf endet nicht an der Fassade. Deshalb denken wir Einrichtung, Materialien und Farben schon in der Planung mit.', ['Einrichtungskonzept', 'Material- und Farbkonzept', 'Moodboards', 'Innenvisualisierungen', 'Vorabstimmung mit der Baubehörde', 'Vertragsunterlagen zur Durchsicht']],
    ['Beauftragung', 'Bei deinem Besuch in Griffen legen wir gemeinsam Leistungsumfang, Gesamtinvestition und Terminrahmen fest.', ['Organisation deines Besuchs', 'Führung durch die Manufaktur', 'Kennenlernen der Geschäftsführung', 'Vorbemusterung', 'Detaillierte Kostenberechnung', 'Auswahl der Fachbetriebe']],
    ['Projektstart', 'Wir bringen alle Projektbeteiligten an einen Tisch und legen den Zeitplan bis zur Übergabe fest.', ['Vorstellung des Projektteams', 'Zeitplan bis zur Übergabe', 'Meilensteine und Zuständigkeiten', 'Aufgabenplan für alle Beteiligten', 'Start des wöchentlichen Projektupdates']],
    ['Einreichung', 'Wir legen vor Ort die exakte Lage deines Hauses fest, reichen die Pläne ein und begleiten das Bewilligungsverfahren.', ['Situierung auf dem Grundstück', 'Vermessung und Bodengutachten', 'Planung von Zufahrt und Anschlüssen', 'Einreichplanung mit Energieausweis', 'Einholung der Nachbarzustimmungen', 'Begleitung der Bauverhandlung']],
    ['Detailplanung', 'Parallel zum Verfahren planen wir Küche, Bad, Beleuchtung und Haustechnik im Detail und bereiten den Design Day vor.', ['Raumgestaltung', 'Küchen- und Badplanung', 'Lichtplanung', 'Elektro- und Haustechnikplanung', 'Vorauswahl von Materialien und Produkten', 'Vorbereitung des Design Day']],
    ['Design Day', 'In Griffen wählst du Böden, Fliesen, Türen und Sanitär im Zusammenspiel, mit voller Kostentransparenz bei jeder Auswahl.', ['Bemusterung im Gesamtbild', 'Kostenübersicht je Auswahl', 'Abstimmung der Schnittstellen zwischen den Gewerken', 'Übernahme in die Ausführungsplanung']],
    ['Freigabe', 'Wir prüfen mit dir die finale Ausführungsplanung. Mit deiner Freigabe beginnt die Fertigung in unserer Manufaktur.', ['Zusammenführung aller Fachplanungen', 'Prüfung von Statik, Haustechnik und Elektro', 'Anschluss an Keller oder Fundament', 'Schnittstellen zu Pool, Zaun und Zufahrt', 'Vergabe der Gewerke', 'Freigabe der Fertigung']],
    ['Montage', 'Nach der Abnahme des Fundaments fertigen wir dein Haus in unserer Manufaktur und montieren es auf deinem Grundstück.', ['Abnahme des Fundaments', 'Fertigung in der Manufaktur', 'Montage vor Ort', 'Baubesprechungen', 'Koordination aller Gewerke', 'Qualitätskontrollen und Baudokumentation']],
    ['Übergabe', 'Wir gehen gemeinsam durch dein Haus, erklären die Haustechnik und übergeben alle Unterlagen. Dann schließt du selbst auf.', ['Gemeinsame Abnahme', 'Einweisung in die Haustechnik', 'Übergabe von Plänen und Baudokumentation', 'Garantieunterlagen', 'Pflege- und Wartungshinweise', 'Kontakte für Service und Notfall']]
  ].map(([t, d, k]) => ({ t, d, k })),
  finale: ['14 Tage deiner Zeit.', 'Um den Rest kümmern wir uns.'],
  ankommen: { info: 'Tag', zahl: '15', woerter: ['Einatmen.', 'Ausatmen.', 'Angekommen.'] },
  leben: {
    info: 'Ab Tag', zahl: '15', h: 'Besser leben.', lead: 'Mit dem Schlüssel endet dein Projekt, aber nicht unsere Begleitung.',
    /* f: Merkzeile über dem Titel (Runde 14, aus dem Text des Eintrags) */
    punkte: [
      { t: 'Jahrescheck.', f: 'Nach einem Jahr', d: 'Ein Haus zeigt sich erst im Lauf eines ganzen Jahres. Deshalb kommen wir nach einem Jahr zurück und hören, wie es sich bei dir lebt.' },
      { t: 'GRIFFNER Care.', f: 'Jederzeit', d: 'Auch Jahre nach dem Einzug kennen wir dein Haus bis ins Detail. Und wir sind da, wann immer du uns brauchst.' },
      { t: 'Open House.', f: '20 Baufamilien', d: 'Werde eine von 20 Baufamilien, die ihr Zuhause für Besucher öffnen. Niemand erzählt ehrlicher, wie es sich in einem GRIFFNER Haus lebt.' },
      { t: 'GRIFFNER Club.', f: 'Einmal im Jahr', d: 'Einmal im Jahr laden wir alle ein, die mit uns gebaut haben. Ein Treffen voller Geschichten, Ideen und neuer Bekanntschaften.' }
    ]
  },
  sys: {
    kopf: 'Wie wir das möglich machen.',
    themen: [
      { h: 'GRIFFNER Planungssystem.', text: 'Architektur, Innenarchitektur, Haustechnik, Unterbau und Außenanlagen planen wir in einem gemeinsamen System. So greift jede Entscheidung in die nächste, und Kosten und Termine bleiben jederzeit im Blick.', art: 'schichten', schichten: K('schichten').schichten },
      { h: 'Ein Vertragspartner.', text: 'Mit deinem Auftrag übernehmen wir die Verantwortung für alles, was wir gemeinsam vereinbaren. Ob Fachbetriebe aus unserem Netzwerk oder Partner deines Vertrauens: Wir koordinieren alle Gewerke rund um dein Haus.', art: 'partner', marken: K('partner').marken },
      { h: 'Wochenupdate.', text: 'Ab dem Projektstart weißt du jede Woche, was erledigt ist, was als Nächstes ansteht und wo dein Projekt bei Kosten und Terminen steht. Persönlich, online oder per E-Mail.', art: 'update', punkte: K('update').punkte, marken: K('update').marken },
      { h: 'Besuch in Griffen.', text: 'Zweimal kommst du zu uns nach Griffen. Beim ersten Besuch erlebst du, wo und von wem dein Haus gebaut wird. Beim zweiten wählst du, was es zu deinem Zuhause macht. Auf Wunsch holen wir dich ab, und wenn du noch bleiben möchtest, klingt dein Besuch am Wörthersee oder am Feuerberg aus.', art: 'griffen', marken: K('griffen').marken }
    ]
  },
  schluss: { h: 'Von Anfang an ein gutes Gefühl.', lead: 'Dein Tag 01 beginnt mit einem Gespräch.', knopf: 'Gespräch vereinbaren', href: '#contact' },
  kapitel: ['Dein Weg', 'Die Journey', 'Besser planen', 'Besser bauen', 'Besser leben', 'Planungssystem', 'Vertragspartner', 'Wochenupdate', 'Besuch in Griffen'],
  bilder: { weg: 'img/weg-griffen.jpg', angekommen: 'img/weg-angekommen.jpg', terrasse: 'img/weg-terrasse.jpg', manufaktur: 'img/weg-manufaktur.jpg' },
  alt: { manufaktur: 'Gregor in der GRIFFNER Manufaktur in Griffen' }
};

const str = (v, d) => { const s = String(v ?? '').trim(); return s || d; };
const list = (v, d) => Array.isArray(v) && v.length ? v : d;
const kw = k => (Array.isArray(k) ? k : String(k ?? '').split(/\s*[·•\n]\s*/)).map(s => String(s).trim()).filter(Boolean);
/* Texte aus Framer (oder DEF) säubern; leere Felder nehmen den Text des Entwurfs */
export function clean(c = {}) {
  const D = DEF, L = c.leben || {}, Sy = c.sys || {}, Sc = c.schluss || {}, A = c.ankommen || {};
  const tage = list(c.tage, D.tage).map((x, i) => ({ t: str(x?.t, (D.tage[i] || {}).t || ''), d: str(x?.d, (D.tage[i] || {}).d || ''), k: kw(x?.k).length ? kw(x.k) : ((D.tage[i] || {}).k || []) })).filter(x => x.t);
  while (tage.length < 14) tage.push(D.tage[tage.length]);
  return {
    hero: [0, 1].map(i => str((c.hero || [])[i], D.hero[i])),
    manifest: str(c.manifest, D.manifest),
    journey: str(c.journey, D.journey),
    phasen: [0, 1, 2].map(i => ({ ...D.phasen[i], ...Object.fromEntries(Object.entries((c.phasen || [])[i] || {}).filter(([, v]) => str(v))) })),
    marken: [0, 1, 2].map(i => [str(((c.marken || [])[i] || [])[0], D.marken[i][0]), str(((c.marken || [])[i] || [])[1], D.marken[i][1])]),
    tag: str(c.tag, D.tag), kwKnopf: str(c.kwKnopf, D.kwKnopf),
    tage: tage.slice(0, 14),
    finale: [0, 1].map(i => str((c.finale || [])[i], D.finale[i])),
    ankommen: { info: str(A.info, D.ankommen.info), zahl: str(A.zahl, D.ankommen.zahl), woerter: [0, 1, 2].map(i => str((A.woerter || [])[i], D.ankommen.woerter[i])) },
    leben: {
      info: str(L.info, D.leben.info), zahl: str(L.zahl, D.leben.zahl), h: str(L.h, D.leben.h), lead: str(L.lead, D.leben.lead),
      punkte: list(L.punkte, D.leben.punkte).map((p, i) => ({ t: str(p?.t, ''), d: str(p?.d, ''), f: String(p?.f ?? (D.leben.punkte[i] || {}).f ?? '').trim() })).filter(p => p.t || p.d).slice(0, 4)
    },
    sys: { kopf: str(Sy.kopf, D.sys.kopf), themen: list(Sy.themen, D.sys.themen).slice(0, 4).map((t, i) => ({ ...D.sys.themen[i], ...Object.fromEntries(Object.entries(t || {}).filter(([, v]) => v != null && v !== '')) })) },
    schluss: { h: str(Sc.h, D.schluss.h), lead: str(Sc.lead, D.schluss.lead), knopf: str(Sc.knopf, D.schluss.knopf), href: str(Sc.href, D.schluss.href) },
    kapitel: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => str((c.kapitel || [])[i], D.kapitel[i])),
    bilder: { ...D.bilder, ...Object.fromEntries(Object.entries(c.bilder || {}).filter(([, v]) => v)) },
    alt: { ...D.alt, ...Object.fromEntries(Object.entries(c.alt || {}).filter(([, v]) => v)) }
  };
}

/* Bild: Framer-Bilder mit srcset (scale-down-to), sonst nur src */
const img = (u, attrs, sizes = '100vw') => { const ss = srcset(u, [640, 1024, 1600, 2400]); return `<img src="${esc(u)}"${ss ? ` srcset="${ss}" sizes="${sizes}"` : ''} ${attrs}>`; };
const lazy = (u, attrs, sizes = '100vw') => { const ss = srcset(u, [640, 1024, 1600, 2400]); return `<img data-src="${esc(u)}"${ss ? ` data-srcset="${ss}" sizes="${sizes}"` : ''} ${attrs}>`; };
const INFO = 'font-family:var(--font-text);font-weight:500;font-size:var(--fs-info-web);letter-spacing:var(--tracking-info-web);text-transform:uppercase;font-variant-numeric:tabular-nums';
const DISP = 'font-family:var(--font-display);font-weight:300;letter-spacing:0;text-transform:uppercase;font-feature-settings:\'liga\' 0';
const DISPM = 'font-family:var(--font-display);font-weight:500;letter-spacing:.04em;text-transform:uppercase;font-feature-settings:\'liga\' 0';
const pad = n => String(n).padStart(2, '0');

export function markup(c0) {
  const c = clean(c0), B = c.bilder;
  const words = c.manifest.split(/\s+/).filter(Boolean);
  const endW = c.schluss.h.split(/\s+/).filter(Boolean);
  const lebenH = esc(c.leben.h).replace(' ', '<br>');
  return `<div class="jw" data-j3="1" style="position:relative;color:var(--griffner-weiss);font-family:var(--font-text)">
<div id="weg-film" data-tfilm="1" data-room="j-schwarz" style="position:relative;height:1900vh">
  <div id="planen" style="position:absolute;left:0;top:0;width:1px;height:1px"></div>
  <div id="bauen" style="position:absolute;left:0;top:0;width:1px;height:1px"></div>
  <div id="leben" style="position:absolute;left:0;top:0;width:1px;height:1px"></div>
  <div data-tstage="1" class="jw-stage" style="position:sticky;top:0;height:100vh;height:100svh;min-height:520px;overflow:hidden;background:var(--griffner-schwarz)">
    <canvas data-tcan="1" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;display:block"></canvas>
    <div data-hphoto="1" aria-hidden="true" style="position:absolute;inset:0;overflow:hidden">
      ${img(B.weg, `data-jh-img="1" alt="" fetchpriority="high" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%;transform:scale(1.05);transition:transform 2600ms cubic-bezier(.2,.7,.2,1)"`)}
      <div data-hshade="1" style="position:absolute;inset:0;background:var(--bildschutz)"></div>
    </div>
    <div data-chero="1" style="position:absolute;left:var(--page-margin);right:var(--page-margin);bottom:clamp(44px,9vh,104px)">
      <h1 style="margin:0;${DISP};font-size:clamp(40px,min(7vw,12vh),150px);line-height:.94;max-width:11em;text-wrap:balance">
        ${c.hero.map(l => `<span style="display:block;overflow:hidden;padding:.2em 0 .04em;margin:-.2em 0 -.04em"><span data-jh-l="1" style="display:block;transform:translate3d(0,105%,0);transition:transform 1150ms cubic-bezier(.2,.7,.2,1)">${esc(l)}</span></span>`).join('')}
      </h1>
    </div>
    <div data-cman="1" style="position:absolute;left:var(--page-margin);right:var(--page-margin);top:clamp(120px,17vh,170px);bottom:clamp(44px,9vh,104px);display:grid;align-content:center;opacity:0;visibility:hidden">
      <p style="margin:0;max-width:21em;font-family:var(--font-display);font-weight:300;letter-spacing:0;font-size:clamp(24px,min(3.5vw,5.6vh),68px);line-height:1.14;text-wrap:pretty">${words.map(w => `<span data-mw="1" style="color:var(--griffner-anthrazit);transition:color 420ms cubic-bezier(.2,.7,.2,1)">${esc(w)} </span>`).join('')}</p>
    </div>
    <div data-cph="1" style="position:absolute;left:var(--page-margin);right:var(--page-margin);bottom:clamp(44px,9vh,104px);display:grid;row-gap:clamp(28px,5vh,56px);opacity:0;visibility:hidden">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:20px clamp(32px,5vw,96px)">
        <h2 style="flex:1 1 480px;max-width:12em;margin:0;${DISP};font-size:clamp(38px,min(5.8vw,10vh),112px);line-height:.94;text-wrap:balance">${esc(c.journey)}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:20px var(--grid-gutter)">
        ${c.phasen.map((ph, i) => `<button type="button" class="jw-hov" data-cgo="${['planen', 'bauen', 'leben'][i]}" style="display:grid;row-gap:10px;justify-items:start;align-content:start;margin:0;padding:18px 0 0;border:0;border-top:1px solid var(--griffner-weiss);background:none;color:inherit;text-align:left;cursor:pointer;font-family:var(--font-text);transition:opacity 300ms">
            <span style="${DISPM};font-size:clamp(18px,1.4vw,22px);line-height:1.05">${esc(ph.name)}</span>
            <span style="font-weight:500;font-size:var(--fs-info-web);letter-spacing:var(--tracking-info-web);text-transform:uppercase;color:var(--griffner-kalk)">${esc(ph.range)}</span>
            <span style="font-size:16px;line-height:var(--leading-body)">${esc(ph.desc)}</span>
          </button>`).join('')}
      </div>
    </div>
    ${c.tage.map((p, k) => `<div data-ctext="1" style="position:absolute;left:var(--page-margin);right:var(--page-margin);bottom:clamp(40px,8vh,96px);display:grid;justify-items:start;opacity:0;visibility:hidden">
        <p style="margin:0;display:flex;gap:.6em;${INFO}"><span>${esc(c.tag)}</span><span style="color:var(--griffner-gelb)">${pad(k + 1)}</span><span>/ 14</span></p>
        <h3 data-cth="1" style="margin:clamp(8px,1.6vh,18px) 0 0;${DISP};font-size:96px;line-height:.94;white-space:nowrap">${esc(p.t)}.</h3>
        <p style="margin:clamp(12px,2vh,24px) 0 0;max-width:28em;font-size:clamp(17px,1.4vw,22px);line-height:1.35;text-wrap:pretty">${esc(p.d)}</p>
        <p data-ckw="1" style="display:none;margin:clamp(14px,2vh,22px) 0 0;max-width:46em;font-size:15px;line-height:1.6;color:var(--griffner-weiss);text-wrap:pretty;opacity:0;transition:opacity 600ms cubic-bezier(.2,.7,.2,1)">${p.k.map(esc).join('&nbsp; ·&nbsp; ')}</p>
        <button type="button" class="jw-hov" data-ckwb="1" aria-expanded="false" style="display:inline-flex;align-items:center;gap:14px;min-height:44px;margin:clamp(10px,1.6vh,18px) 0 0;padding:0;border:0;background:none;color:inherit;cursor:pointer;${INFO};transition:opacity 300ms"><span data-cplus="1" aria-hidden="true" style="display:grid;place-items:center;width:26px;height:26px;border:1px solid var(--griffner-weiss);font-size:16px;line-height:1;letter-spacing:0;transition:transform 600ms cubic-bezier(.2,.7,.2,1)">+</span><span>${esc(c.kwKnopf)}</span></button>
      </div>`).join('')}
    <div data-fwbg="1" aria-hidden="true" style="position:absolute;inset:0;background:var(--griffner-weiss);opacity:0;visibility:hidden"></div>
    <div data-fwin="1" aria-hidden="true" style="position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;background:var(--griffner-gelb);visibility:hidden">
      ${lazy(B.angekommen, `data-fkit="1" alt="" decoding="async" style="position:absolute;left:0;top:0;width:100px;height:100px;object-fit:cover;object-position:0% 30%;opacity:0"`)}
      <div data-fksh="1" style="position:absolute;left:0;top:0;width:100px;height:100px;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 28%);opacity:0"></div>
      ${lazy(B.terrasse, `data-fwimg="1" alt="" decoding="async" style="position:absolute;left:0;top:0;width:100px;height:100px;object-fit:cover;object-position:62% 30%;opacity:0"`, '(max-width: 819px) 92vw, 36vw')}
      <div data-s15="1" style="position:absolute;left:0;top:0;width:100px;height:100px;color:var(--griffner-schwarz);opacity:0">
        <div data-s15b="1" style="position:absolute;left:0;top:0;right:0;bottom:0;display:grid;place-items:center;box-sizing:border-box;padding:0 var(--page-margin);color:var(--griffner-weiss);text-align:center"><div data-s15x="1" style="display:grid;justify-items:center">
          <p data-s15i="1" style="margin:0;display:flex;gap:.6em;${INFO}"><span>${esc(c.ankommen.info)}</span><span style="padding-bottom:2px;border-bottom:4px solid var(--griffner-gelb)">${esc(c.ankommen.zahl)}</span></p>
          <h2 data-s15n="1" style="margin:clamp(16px,2.6vh,28px) 0 0;${DISP};font-size:96px;line-height:.94">${c.ankommen.woerter.map(w => `<span data-s15r="1" style="display:block;overflow:hidden;padding:.2em 0 .04em;margin:-.2em 0 -.04em;white-space:nowrap"><span data-s15l="1" style="display:inline-block">${esc(w)}</span></span>`).join('')}</h2>
        </div></div>
      </div>
      <div data-fwsh="1" style="position:absolute;left:0;top:0;width:100px;height:100px;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 28%);opacity:0"></div>
    </div>
    <div data-c15="1" class="jw-c15" style="position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;color:var(--griffner-schwarz);opacity:0;visibility:hidden">
      <div data-c15in="1" class="jw-c15in">
        <div data-c15h="1" class="jw-c15h">
          <p style="margin:0;display:flex;gap:.6em;${INFO}"><span>${esc(c.leben.info)}</span><span style="padding-bottom:2px;border-bottom:4px solid var(--griffner-gelb)">${esc(c.leben.zahl)}</span></p>
          <h2 class="jw-c15t" style="margin:clamp(14px,2.4vh,26px) 0 0;${DISP};line-height:.92">${lebenH}</h2>
          <p class="jw-c15lead" style="margin:clamp(18px,3vh,32px) 0 0;max-width:19em;line-height:1.35;text-wrap:pretty">${esc(c.leben.lead)}</p>
        </div>
        <div data-c15l="1" class="jw-lp-l" style="--n:${c.leben.punkte.length}">
          <p class="jw-lp-k" data-c15k="1" aria-hidden="true"><span data-c15kn="1">01</span><span>/ ${pad(c.leben.punkte.length)}</span><span class="jw-lp-kt">${c.leben.punkte.map(() => '<i></i>').join('')}</span></p>
          ${c.leben.punkte.map((p, i) => `<div class="jw-lp" data-lp="1">
            <i class="jw-lp__ln" aria-hidden="true"></i>
            <p class="jw-lp__n"><span class="jw-lp__z">${pad(i + 1)}</span>${p.f ? `<span class="jw-lp__f">${esc(p.f)}</span>` : ''}</p>
            <h3 class="jw-lp__t">${esc(p.t)}</h3>
            <p class="jw-lp__x">${esc(p.d)}</p>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div data-cfin="1" style="position:absolute;left:var(--page-margin);right:var(--page-margin);bottom:clamp(40px,8vh,96px);opacity:0;visibility:hidden">
      <h2 style="margin:0;${DISP};font-size:clamp(34px,min(5.4vw,9vh),104px);line-height:.94;text-wrap:balance"><span style="display:block">${esc(c.finale[0])}</span><span data-fl2="1" style="display:block;opacity:0">${esc(c.finale[1])}</span></h2>
    </div>
  </div>
</div>

<div data-sys="1" data-room="j-weiss" style="position:relative;height:260vh;color:var(--griffner-schwarz);background:var(--griffner-weiss)">
  ${c.sys.themen.map(() => '<div data-chap="1" data-smk="1" style="position:absolute;left:0;top:0;width:1px;height:1px"></div>').join('')}
  <div style="position:sticky;top:0;height:100vh;height:100svh;overflow:hidden">
    <div data-skick="1" style="position:absolute;left:var(--page-margin);right:calc(var(--page-margin) + 48px);top:clamp(120px,17vh,170px);display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 24px;padding-bottom:16px;border-bottom:1px solid var(--griffner-kalk)">
      <h2 style="margin:0;${DISPM};font-size:clamp(18px,1.6vw,26px);line-height:1.05">${esc(c.sys.kopf)}</h2>
      <span style="display:flex;gap:.5em;${INFO}"><span data-skn="1" style="padding-bottom:2px;border-bottom:4px solid var(--griffner-gelb)">01</span><span>/ ${pad(c.sys.themen.length)}</span></span>
    </div>
    <div data-stxw="1" style="position:absolute;left:var(--page-margin);top:50%;transform:translateY(-50%);width:min(36vw,32em);display:grid;grid-template-columns:minmax(0,1fr)">
      ${c.sys.themen.map(t => `<div data-stx="1" style="grid-area:1/1;align-self:center;opacity:0;visibility:hidden">
        <h2 style="margin:0;${DISP};font-size:clamp(36px,min(4.4vw,8vh),84px);line-height:.94;text-wrap:balance">${esc(t.h)}</h2>
        <p style="margin:clamp(18px,3vh,32px) 0 0;max-width:27em;font-size:clamp(16px,1.25vw,19px);line-height:var(--leading-body);text-wrap:pretty">${esc(t.text)}</p>
      </div>`).join('')}
    </div>
    <div data-svis="1" aria-hidden="true" style="position:absolute;left:46%;right:120px;top:12%;bottom:12%">
      ${c.sys.themen.map(t => `<div class="wz wz--${esc(t.art)}" data-wz="1"><div class="lb__fig">${zeichnung(t)}</div></div>`).join('')}
    </div>
  </div>
</div>

<nav data-rail="1" aria-label="Kapitel" style="position:fixed;z-index:4;left:0;top:0;width:0;height:0;pointer-events:none;opacity:0;color:var(--griffner-weiss);transition:opacity 600ms cubic-bezier(.2,.7,.2,1)">
  <span data-rline="1" style="position:absolute;left:0;top:0;width:1px;height:0;background:var(--griffner-anthrazit);transition:background-color 600ms cubic-bezier(.2,.7,.2,1)"></span>
  <span data-rfill="1" style="position:absolute;left:0;top:0;width:1px;height:0;background:var(--griffner-weiss);transition:background-color 600ms cubic-bezier(.2,.7,.2,1)"></span>
  ${c.kapitel.map((name, i) => `<button type="button" class="jw-press" data-rgo="${i}" aria-label="${esc(name)}" style="position:absolute;left:0;top:0;width:44px;height:44px;margin:0;padding:0;border:0;background:none;color:inherit;cursor:pointer;pointer-events:none">
      <span data-rtick="1" style="position:absolute;left:18px;top:21.5px;width:9px;height:1px;background:currentColor"></span>
      <span data-rlab="1" style="position:absolute;right:38px;top:50%;transform:translateY(-50%);display:flex;gap:0;font-family:var(--font-text);font-weight:500;font-size:10px;letter-spacing:var(--tracking-info-web);text-transform:uppercase;font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0;transition:opacity 400ms cubic-bezier(.2,.7,.2,1)"><span>${esc(name)}</span><span data-rday="1"></span></span>
    </button>`).join('')}
  <div data-trunner="1" aria-hidden="true" style="position:absolute;left:0;top:0;width:14px;height:11px;pointer-events:none"><i class="jw-runner"></i></div>
</nav>

<section data-endimg="1" data-room="j-schwarz" style="position:relative;height:280vh">
  <div style="position:sticky;top:0;height:100vh;height:100svh;overflow:hidden;background:var(--griffner-schwarz)">
    ${lazy(B.manufaktur, `data-endi="1" alt="${esc(c.alt.manufaktur)}" decoding="async" style="position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:50% 100%;transform-origin:50% 100%"`)}
    <div data-endsh="1" aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 28%)"></div>
    <div data-endb="1" aria-hidden="true" style="position:absolute;inset:0;background:var(--griffner-schwarz);opacity:0"></div>
    <div data-endc="1" style="position:absolute;left:var(--page-margin);right:var(--page-margin);bottom:clamp(16px,3vh,40px);display:grid;row-gap:clamp(12px,2vh,20px);color:var(--griffner-schwarz)">
      <h2 data-endh="1" style="margin:0;color:var(--griffner-schwarz);${DISP};font-size:64px;line-height:.94"><span data-endl="1" style="display:block;white-space:nowrap">${endW.map(w => `<span style="display:inline-block;overflow:hidden;padding:.22em .02em .04em;margin:-.22em 0 -.04em;vertical-align:top"><span data-endw="1" style="display:inline-block;transform:translate3d(0,110%,0)">${esc(w)}</span></span>`).join(' ')}</span></h2>
      <div data-endcta="1" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 32px;opacity:0">
        <p style="margin:0;font-size:clamp(17px,1.4vw,22px);line-height:1.3">${esc(c.schluss.lead)}</p>
        <a href="${esc(c.schluss.href)}" data-endbtn="1" class="jw-btn" style="display:inline-flex;align-items:center;gap:14px;min-height:48px;padding:0 24px;background:var(--griffner-schwarz);color:var(--griffner-weiss);text-decoration:none;${INFO};transition:background-color 300ms cubic-bezier(.2,.7,.2,1)"><span>${esc(c.schluss.knopf)}</span><span aria-hidden="true">→</span></a>
      </div>
    </div>
  </div>
</section>
</div>`;
}

/* ---------- Ablauf: aus J10Journey (Klasse Component), angepasst an die Website ---------- */
class Weg {
  constructor(root, c, deps) {
    this.root = root.querySelector('[data-j3]') || root; this.c = c; this.deps = deps || {};
    this.red = !!this.deps.reduce;
    this.PTS = Array.from({ length: 14 }, (_, k) => ({ x: Math.round((-1000 * Math.sin(k * .36) - 200) / 400) * 400 + 200, z: 200 + k * 1200 }));
    this.P = 4.5;
    this.GO = { planen: [0, 0], bauen: [8, 0], leben: [16, 0] };
    this.alive = true;
    this.pos = -6.5; this.tau = -6.5; this.active = -9; this.open = -1; this.lastM = 0; this.H = 0;
    this.bind(); this.intro();
    this.onResize = () => { clearTimeout(this.rt); this.rt = setTimeout(() => this.measure(), 80); };
    this.onScroll = () => { this.lastS = performance.now(); if (this.alive) { try { this.tick(); } catch (e) { } } };
    this.onUser = () => { this.gid = (this.gid || 0) + 1; };
    ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, this.onUser, { passive: true }));
    this.onHash = () => this.jumpHash(true);
    addEventListener('resize', this.onResize);
    addEventListener('scroll', this.onScroll, { passive: true });
    addEventListener('hashchange', this.onHash);
    const run = () => { if (!this.alive) return; try { this.tick(); } catch (e) { if (!this.err) { this.err = 1; console.error('[Journey Weg]', e); } } };
    const raf = () => { if (!this.alive) return; run(); this.raf = requestAnimationFrame(raf); };
    this.raf = requestAnimationFrame(raf);
    this.iv = setInterval(() => { if (performance.now() - (this.lt || 0) > 200) run(); }, 120);
    document.fonts && document.fonts.ready.then(() => { if (this.alive) { this.measure(); this.jumpHash(false); } });
    this.mt = setTimeout(() => this.alive && this.measure(), 900);
    /* Die Bilder nach dem Hero laden, sobald die Seite steht (nicht vor dem Hero-Foto) */
    const later = () => { if (!this.alive) return; this.root.querySelectorAll('img[data-src]').forEach(im => { if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.src = im.dataset.src; im.removeAttribute('data-src'); }); };
    if (document.readyState === 'complete') this.lt2 = setTimeout(later, 600); else addEventListener('load', this.onLoad = () => { this.lt2 = setTimeout(later, 600); }, { once: true });
    this.lt3 = setTimeout(later, 4000);
    this.tick();
  }
  dispose() {
    this.alive = false;
    cancelAnimationFrame(this.raf); clearInterval(this.iv); clearTimeout(this.mt); clearTimeout(this.rt); clearTimeout(this.lt2); clearTimeout(this.lt3);
    removeEventListener('resize', this.onResize); removeEventListener('scroll', this.onScroll); ['wheel', 'touchstart', 'keydown'].forEach(ev => removeEventListener(ev, this.onUser)); removeEventListener('hashchange', this.onHash); removeEventListener('click', this.onBtn, true);
    this.onLoad && removeEventListener('load', this.onLoad);
  }
  op(t) { return t < -1 ? t : t < 0 ? -1 + Math.min(.5, t + 1) : t < 1 ? -.5 + .5 * t : t < 7 ? t - 1 : t < 9 ? 6 + (t - 7) / 2 : t < 15 ? t - 2 : t < 17 ? 13 : t - 4; }
  camT(t) {
    const ez = v => .35 * v + .65 * v * v * (3 - 2 * v), c = v => Math.max(0, Math.min(1, v));
    const mix = (a, b, u) => { const k = ez(c(u)), l = (x, y) => x + (y - x) * k; return { C: { x: l(a.C.x, b.C.x), y: l(a.C.y, b.C.y), z: l(a.C.z, b.C.z) }, L: { x: l(a.L.x, b.L.x), y: l(a.L.y, b.L.y), z: l(a.L.z, b.L.z) } }; };
    if (t < -1) return this.camera(t);
    if (t < 0) return mix(this.camBack(.7), this.camAt(-.75), t + 1);
    if (t < 15) return this.camAt(t < 1 ? -.75 + .75 * t : this.op(t));
    if (t < 17) return this.camAt(13 + .85 * ez(c((t - 15) / 1.2)));
    return this.camera(t - 4);
  }
  tick() {
    const now = performance.now();
    if (!this.H && now - this.lastM > 250) { this.lastM = now; this.measure(); }
    this.frame();
  }
  intro() {
    const R = this.root;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      R.querySelectorAll('[data-jh-l]').forEach((l, i) => { l.style.transitionDelay = (250 + i * 170) + 'ms'; l.style.transform = 'none'; });
      const im = R.querySelector('[data-jh-img]'); if (im) im.style.transform = 'scale(1)';
    }));
  }
  bind() {
    const R = this.root, q = s => R.querySelector(s), qa = s => [...R.querySelectorAll(s)];
    this.tfilm = q('[data-tfilm]'); this.tstage = q('[data-tstage]'); this.can = q('[data-tcan]'); this.ctx = this.can.getContext('2d');
    this.fl2 = q('[data-fl2]'); this.fwin = q('[data-fwin]'); this.s15 = q('[data-s15]'); this.fkit = q('[data-fkit]'); this.fksh = q('[data-fksh]'); this.s15b = q('[data-s15b]'); this.s15ls = qa('[data-s15l]'); this.s15rs = qa('[data-s15r]'); this.s15i = q('[data-s15i]'); this.s15x = q('[data-s15x]'); this.s15n = q('[data-s15n]'); this.fwbg = q('[data-fwbg]'); this.fwimg = q('[data-fwimg]'); this.fwsh = q('[data-fwsh]'); this.c15 = q('[data-c15]'); this.c15in = q('[data-c15in]'); this.c15h = q('[data-c15h]'); this.c15l = q('[data-c15l]'); this.c15items = qa('[data-lp]'); this.c15k = q('[data-c15k]'); this.c15kn = q('[data-c15kn]'); this.c15kt = qa('.jw-lp-kt i'); this.hero = q('[data-chero]'); this.cman = q('[data-cman]'); this.mws = qa('[data-mw]'); this.hphoto = q('[data-hphoto]'); this.himg = q('[data-jh-img]'); this.hshade = q('[data-hshade]'); this.hh1 = this.hero.querySelector('h1'); this.ph = q('[data-cph]'); this.texts = qa('[data-ctext]'); this.ths = qa('[data-cth]'); this.fins = qa('[data-cfin]');
    this.kwb = qa('[data-ckwb]'); this.kws = qa('[data-ckw]'); this.plus = qa('[data-cplus]');
    this.nav = q('[data-rail]'); this.rline = q('[data-rline]'); this.rfill = q('[data-rfill]'); this.rbtn = qa('[data-rgo]'); this.rticks = qa('[data-rtick]'); this.rlabs = qa('[data-rlab]'); this.rdays = qa('[data-rday]'); this.runner = q('[data-trunner]');
    this.chs = qa('[data-chap]'); this.rooms = qa('[data-room]');
    this.rbtn.forEach(b => {
      const on = () => { clearTimeout(this.rht); this.rhov = true; }, off = () => { this.rht = setTimeout(() => { this.rhov = false; }, 300); };
      b.addEventListener('mouseenter', on); b.addEventListener('mouseleave', off); b.addEventListener('focus', on); b.addEventListener('blur', off);
    });
    this.anc = { planen: q('#planen'), bauen: q('#bauen'), leben: q('#leben') };
    this.sys = q('[data-sys]'); this.smk = qa('[data-smk]'); this.stxw = q('[data-stxw]'); this.skn = q('[data-skn]'); this.skick = q('[data-skick]'); this.stx = qa('[data-stx]'); this.stp = this.stx.map(s => s.querySelector('p')); this.svis = q('[data-svis]'); this.wz = qa('[data-wz]');
    this.endS = q('[data-endimg]'); this.endI = q('[data-endi]'); this.endW = qa('[data-endw]'); this.endH = q('[data-endh]'); this.endB = q('[data-endb]'); this.endC = q('[data-endc]'); this.endCta = q('[data-endcta]');
    const cs = getComputedStyle(R);
    this.fD = cs.getPropertyValue('--font-display').trim() || 'sans-serif';
    this.fT = cs.getPropertyValue('--font-text').trim() || 'sans-serif';
    this.onClick = e => {
      const rg = e.target.closest('[data-rgo]'); if (rg) { const y = this.yjump && this.yjump[+rg.dataset.rgo]; if (y != null) this.glide(y); return; }
      const c = e.target.closest('[data-cgo]'); if (c) { const s = this.GO[c.dataset.cgo]; if (s) this.go(s[0], s[1]); return; }
      const b = e.target.closest('[data-ckwb]'); if (b) { this.toggleKw(this.kwb.indexOf(b)); return; }
    };
    R.addEventListener('click', this.onClick);
    /* Knopf „Gespräch vereinbaren“ (Runde 14): steht unter der Komponente ein Formular (Kontakt-Sektion der Website), gleitet die Seite dorthin,
       an den Anfang der Sektion; sonst gilt der Link (Framer: /contact#contact-form). Auf window in der Capture-Phase, weil der Router
       der Website Klicks auf Links sonst vorher übernimmt. */
    this.onBtn = e => {
      const eb = e.target && e.target.closest && e.target.closest('[data-endbtn]'); if (!eb || !R.contains(eb)) return;
      const h = eb.getAttribute('href') || '', FOL = Node.DOCUMENT_POSITION_FOLLOWING;
      const f = [...document.querySelectorAll('form')].find(x => (R.compareDocumentPosition(x) & FOL) && x.getBoundingClientRect().height > 0);
      let y = null;
      if (f && (h.startsWith('#') || /contact|kontakt/i.test(h))) { const yb = R.getBoundingClientRect().bottom + scrollY, yf = f.getBoundingClientRect().top + scrollY; y = yf - yb < innerHeight * 1.5 ? yb : yf - 120; }
      else if (h.startsWith('#')) { const t = document.getElementById(h.slice(1)); if (t) y = t.getBoundingClientRect().top + scrollY; else { e.preventDefault(); e.stopImmediatePropagation(); location.href = '/contact#contact-form'; return; } }
      if (y != null) { e.preventDefault(); e.stopImmediatePropagation(); this.glide(y); }
    };
    addEventListener('click', this.onBtn, true);
  }
  go(state, off, instant) {
    if (!this.H) return;
    const y = this.tfilm.getBoundingClientRect().top + scrollY + (state + 2 + this.P + off) * this.L * this.H;
    instant ? this.jump(y) : this.glide(y);
  }
  jump(y) { const L = this.deps.lenis && this.deps.lenis(); L ? L.scrollTo(y, { immediate: true, force: true }) : scrollTo({ top: y, behavior: 'instant' }); }
  glide(y) {
    y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
    if (this.red) return this.jump(y);
    if (this.deps.scrollTo) return this.deps.scrollTo(y);
    const y0 = scrollY, d = y - y0, id = this.gid = (this.gid || 0) + 1;
    if (Math.abs(d) < 2) return;
    const dur = Math.min(2600, 700 + Math.sqrt(Math.abs(d) / innerHeight) * 520), t0 = performance.now();
    const e = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const step = () => { if (this.gid !== id) return; const u = Math.min(1, (performance.now() - t0) / dur); scrollTo({ top: y0 + d * e(u), behavior: 'instant' }); if (u < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  jumpHash(smooth) {
    const h = (location.hash || '').slice(1), s = this.GO[h];
    if (s && this.H) this.go(s[0], s[1], !smooth);
  }
  toggleKw(k) {
    this.open = this.open === k ? -1 : k;
    this.kws.forEach((el, i) => {
      const on = i === this.open;
      if (on) { el.style.display = 'block'; el.style.opacity = 0; requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = 1; })); }
      else { el.style.display = 'none'; el.style.opacity = 0; }
    });
    this.plus.forEach((p, i) => { p.style.transform = i === this.open ? 'rotate(45deg)' : 'none'; });
    this.kwb.forEach((b, i) => b.setAttribute('aria-expanded', i === this.open ? 'true' : 'false'));
  }

  S(p) {
    const P = this.PTS, n = P.length - 1;
    if (p <= 0) return { x: P[0].x + (P[1].x - P[0].x) * p, z: P[0].z + (P[1].z - P[0].z) * p };
    if (p >= n) return { x: P[n].x + (P[n].x - P[n - 1].x) * (p - n), z: P[n].z + (P[n].z - P[n - 1].z) * (p - n) };
    const i = Math.min(n - 1, Math.floor(p)), t = p - i, a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)];
    const cr = (a, b, c, d) => .5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
    return { x: cr(a.x, b.x, c.x, d.x), z: cr(a.z, b.z, c.z, d.z) };
  }
  T(p) { const a = this.S(p - .05), b = this.S(p + .05), dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1; return { x: dx / l, z: dz / l }; }
  camAt(p) {
    const mob = this.mob, BACK = mob ? 1150 : 760, SIDE = mob ? 360 : 860, HGT = mob ? 420 : 340, LOOK = mob ? 380 : 1050;
    const s = this.S(p), t = this.T(p), r = { x: t.z, z: -t.x }, L = this.S(p + 2.4);
    return { C: { x: s.x - t.x * BACK - r.x * SIDE, y: HGT, z: s.z - t.z * BACK - r.z * SIDE }, L: { x: L.x + r.x * LOOK, y: 0, z: L.z + r.z * LOOK } };
  }
  camBack(k, az) {
    const W = this.W, H = this.H, F = this.F, zc = 7800, cx = 0, span = 8600;
    if (this.mob) { const d = span * F / (H * .29) * (1 - .04 * k); return { C: { x: cx, y: d * .94, z: zc - d * .34 }, L: { x: cx, y: 0, z: zc } }; }
    const d = span * F / (W * .42) * (1 - .04 * k), el = 1.08 + .06 * k;
    az = az || 0; return { C: { x: cx + d * Math.cos(el) * Math.cos(az), y: d * Math.sin(el), z: zc + d * Math.cos(el) * Math.sin(az) }, L: { x: cx, y: 0, z: zc } };
  }
  /* Einstieg des Bretts (0 bis 1). Runde 15, Telefon: erst steht „Das ist die GRIFFNER Journey.“ allein, dann geht der Text
     und das Brett baut sich auf (tau -2,5 bis -1,1); am Desktop läuft es hinter dem Text (tau -3,45 bis -1,1). */
  iaT(t) { const a = this.mob ? 2.5 : 3.45, b = this.mob ? 1.4 : 2.35; return Math.max(0, Math.min(1, (t + a) / b)); }
  camera(p) {
    const ez = v => .35 * v + .65 * v * v * (3 - 2 * v);
    const mix = (a, b, u, lift) => { const k = ez(Math.max(0, Math.min(1, u))), l = (x, y) => x + (y - x) * k; return { C: { x: l(a.C.x, b.C.x), y: l(a.C.y, b.C.y) + (lift || 0) * Math.sin(Math.PI * k), z: l(a.C.z, b.C.z) }, L: { x: l(a.L.x, b.L.x), y: l(a.L.y, b.L.y), z: l(a.L.z, b.L.z) } }; };
    if (p < -1) { const u = ez(this.iaT(p)); return this.camBack(-1.1 + 1.8 * u, .2 * (1 - u)); }
    if (p < 0) return mix(this.camBack(.7), this.camAt(0), p + 1);
    if (p < 13) return this.camAt(p);
    if (p < 14) return mix(this.camAt(13.85), this.camBack(0), p - 13);
    if (p < 15) return mix(this.camBack(0), this.camBack(1), p - 14);
    return this.camBack(1 + .25 * Math.min(1, (p - 15) / 2));
  }

  measure() {
    if (!this.tstage || !this.alive) return;
    const st = this.tstage, W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
    this.W = W; this.H = H;
    const mob = this.mob = W < 820, m = this.m = this.hero.offsetLeft || 40;
    this.dpr = Math.min(2, devicePixelRatio || 1);
    this.can.width = Math.round(W * this.dpr); this.can.height = Math.round(H * this.dpr);
    this.F = Math.min(H * 1.12, W * (mob ? 1.05 : 1.2));
    let mw = 1; this.ths.forEach(h => { h.style.fontSize = '100px'; mw = Math.max(mw, h.offsetWidth); });
    const fs = Math.min(100 * (W - 2 * m) * (mob ? .98 : .72) / mw, H * .13, 150);
    this.ths.forEach(h => { h.style.fontSize = fs + 'px'; });
    const bT = mob ? '64px' : 'clamp(40px,8vh,96px)', bH = mob ? '64px' : 'clamp(44px,9vh,104px)';
    this.texts.forEach(t => { t.style.bottom = bT; }); this.hero.style.bottom = bH; this.ph.style.bottom = bH; this.fins.forEach(f => { f.style.bottom = bT; });
    this.applyHero(W, H, m, mob, bH);
    this.L = { zuegig: .62, normal: .8, ruhig: 1.05 }[this.c.tempo] || .8;
    this.tfilm.style.height = Math.round(((26.6 + this.P) * this.L + 1.3) * H) + 'px';
    Object.keys(this.GO).forEach(k => { const s = this.GO[k]; this.anc[k].style.top = Math.round((s[0] + 2 + this.P + s[1]) * this.L * H) + 'px'; });
    this.active = -9; this.key = null;
    this.layoutSys(W, H, m, mob);
    { const eh = this.endH, el = eh && eh.firstElementChild; if (el) { eh.style.fontSize = '100px'; el.style.whiteSpace = 'nowrap'; const w = el.scrollWidth || 1000; el.style.whiteSpace = mob ? 'normal' : 'nowrap'; eh.style.fontSize = (mob ? Math.min(W * .11, 56) : Math.min((W - 2 * m) / w * 100, H * .13, 150)) + 'px'; } }
    this.fwimg.style.objectPosition = mob ? '48% 28%' : '50% 40%';
    this.layoutLeben(W, H, m, mob);
    { const RS = this.winRectS(); Object.assign(this.s15.style, { width: RS.w + 'px', height: RS.h + 'px' });
      this.fkit.style.objectPosition = mob ? '50% 50%' : '50% 0%';
      this.fksh.style.background = 'var(--bildschutz)';
      const sc = Math.max(RS.w / 3, RS.h / 2), ih = 2 * sc, oy = mob ? (RS.h - ih) * .5 : 0, head = oy + .485 * ih;
      const top = Math.round(Math.max(mob ? 140 : 156, H * .22)), avail = Math.max(120, head - top - H * .035);
      Object.assign(this.s15b.style, { placeItems: 'start center', paddingTop: top + 'px', paddingBottom: '0px' });
      this.s15n.style.fontSize = '100px'; const w1 = Math.max(...this.s15rs.map(l => l.offsetWidth)) || 300, hb = this.s15x.offsetHeight - this.s15n.offsetHeight;
      this.s15n.style.fontSize = Math.min((RS.w - 2 * m) * (mob ? 1 : .8) / w1 * 100, (avail - hb) / 2.9, 170) + 'px'; }
    this.layoutRail();
  }
  /* Besser leben (Runde 14): links Zeile, Headline und Satz oben, die vier Einträge unten; die Liste endet auf der Unterkante des Bildes,
     ihre Linien laufen bis an das Bild. Telefon: Bild oben, darunter erst die Headline, dann ein Eintrag nach dem anderen. */
  layoutLeben(W, H, m, mob) {
    const R1 = this.winRect1(), c = this.c15, inn = this.c15in, hd = this.c15h, li = this.c15l, its = this.c15items, h2 = hd.querySelector('h2'), lead = hd.querySelector('.jw-c15lead');
    this.root.classList.toggle('jw-mob', mob);
    h2.style.fontSize = ''; lead.style.fontSize = ''; its.forEach(it => { it.style.fontSize = ''; });
    const B = { h2: parseFloat(getComputedStyle(h2).fontSize), lead: parseFloat(getComputedStyle(lead).fontSize) };
    if (mob) {
      const top = R1.y + R1.h + Math.round(Math.max(20, H * .03)), ch = H - top - 56;
      Object.assign(c.style, { left: '0', top: top + 'px', width: W + 'px', height: (H - top) + 'px' });
      Object.assign(inn.style, { position: 'absolute', left: m + 'px', right: m + 'px', top: '0', height: ch + 'px' });
      let g = 1; for (let n = 0; n < 24 && hd.offsetHeight > ch && g > .55; n++) { g -= .04; h2.style.fontSize = Math.max(34, B.h2 * g) + 'px'; }
      let f = 1; const tall = () => Math.max(...its.map(it => it.offsetHeight)) + this.c15k.offsetHeight + 14;
      for (let n = 0; n < 16 && tall() > ch && f > .78; n++) { f -= .03; its.forEach(it => { it.style.fontSize = (f * 100).toFixed(0) + '%'; }); }
      return;
    }
    Object.assign(c.style, { left: '0', top: R1.y + 'px', width: R1.x + 'px', height: R1.h + 'px' });
    Object.assign(inn.style, { position: 'absolute', left: m + 'px', right: '0', top: '0', height: R1.h + 'px' });
    li.classList.toggle('is-eng', R1.x - m < 640);
    const fits = () => hd.offsetHeight + li.offsetHeight + Math.max(24, H * .04) <= R1.h;
    let g = 1; for (let n = 0; n < 24 && !fits() && g > .62; n++) { g -= .04; h2.style.fontSize = Math.max(40, B.h2 * g) + 'px'; lead.style.fontSize = Math.max(17, B.lead * Math.max(.82, g)) + 'px'; }
    let f = 1; for (let n = 0; n < 12 && !fits() && f > .8; n++) { f -= .03; its.forEach(it => { it.style.fontSize = (f * 100).toFixed(0) + '%'; }); }
  }
  /* Wie wir das möglich machen: Kopfzeile, links Headline und Text je Thema, rechts die Zeichnung.
     Runde 15, Telefon: je Thema ein Bildschirm; unter der Headline erst der Text, dann an seiner Stelle die Zeichnung (nichts liegt übereinander) */
  layoutSys(W, H, m, mob) {
    const T = Math.round(H * (mob ? 4 : 2.2)); this.sys.style.height = (H + T) + 'px';
    (mob ? [0, .27, .52, .77] : [0, .27, .52, .8]).forEach((f, i) => { if (this.smk[i]) this.smk[i].style.top = Math.round(f * T) + 'px'; });
    const kb = this.skick.offsetTop + this.skick.offsetHeight;
    { const hs = this.stx.map(s => s.querySelector('h2')), cw = mob ? W - 2 * m : Math.round(Math.min(W * .36, 520)); let mw = 1;
      hs.forEach(h => { h.style.fontSize = '100px'; });
      hs.forEach(h => { const sp = document.createElement('span'); sp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit;text-transform:inherit'; h.appendChild(sp); h.textContent.split(/\s+/).forEach(w => { sp.textContent = w; mw = Math.max(mw, sp.offsetWidth); }); sp.remove(); });
      const fs = Math.min(100 * cw / mw, H * (mob ? .075 : .11), 84); hs.forEach(h => { h.style.fontSize = fs + 'px'; }); }
    Object.assign(this.stxw.style, mob ? { top: (kb + 24) + 'px', transform: 'none', width: 'auto', right: m + 'px' } : { top: 'calc(50% + ' + Math.round(kb / 2) + 'px)', transform: 'translateY(-50%)', width: 'min(36vw,32em)', right: 'auto' });
    this.stp.forEach(p => { p.style.fontSize = ''; });
    if (mob) {
      this.stx.forEach(s => { s.style.alignSelf = 'start'; });
      const hh = Math.max(...this.stx.map(s => s.querySelector('h2').offsetHeight));
      Object.assign(this.svis.style, { left: m + 'px', right: m + 'px', top: Math.round(kb + 24 + hh + Math.max(20, H * .03)) + 'px', bottom: '64px' });
    } else { this.stx.forEach(s => { s.style.alignSelf = 'center'; }); Object.assign(this.svis.style, { left: Math.round(m + Math.min(W * .36, 520) + Math.max(40, W * .04)) + 'px', right: (m + 48) + 'px', top: Math.round(kb + Math.max(36, H * .06)) + 'px', bottom: Math.round(H * .08) + 'px' }); }
    /* die Karte des Wochenupdates passt immer in ihre Fläche */
    const sh = this.svis.clientHeight, sw = this.svis.clientWidth;
    this.svis.querySelectorAll('.lb__up').forEach(up => { up.style.transform = ''; const k = Math.min(1, (sh - 8) / Math.max(1, up.offsetHeight), sw / Math.max(1, up.offsetWidth)); up.style.transform = k < 1 ? 'translate(-50%,-50%) scale(' + k.toFixed(3) + ')' : ''; });
  }
  applyHero(W, H, m, mob, bH) {
    this.hero.style.bottom = bH; this.hshade.style.display = ''; this.hphoto.style.background = 'none';
    Object.assign(this.himg.style, { inset: '0', left: '0', top: '0', width: '100%', height: '100%', objectPosition: mob ? '50% 40%' : '22% 40%' });
    this.hh1.style.fontSize = Math.min(W * (mob ? .105 : .082), H * .125, 168) + 'px';
  }

  drawMarks(TT, tc, pr, NEAR, fw, fi) {
    const x = this.ctx, W = this.W, cl = v => v < 0 ? 0 : v > 1 ? 1 : v, fr = 1 - Math.max(fw, fi);
    if (fr <= 0) return;
    const H = this.H, sm = v => v * v * (3 - 2 * v), MK = this.c.marken;
    [[MK[0][0], MK[0][1], .5, .36, 0], [MK[1][0], MK[1][1], 8, .36, 1], [MK[2][0], MK[2][1], 16.15, .8, 2]].forEach(([lab, hl, at, ty, n]) => {
      const d = TT - at, hot = sm(cl(1 - Math.abs(d) / (d > 0 ? (n === 0 ? .45 : .75) : n === 2 ? .55 : 1.15))), a = fr * hot; if (a <= .01) return;
      const hs = Math.min(W * (this.mob ? .1 : .072), 140); let qx = W / 2, qy = Math.max(H * ty, Math.max(150, H * .2) + hs * 1.1) - d * 70 + (1 - hot) * 24;
      if (n === 2) { const c0 = this.S(15.7), t = this.T(14.3), rr = { x: t.z, z: -t.x }, u = 150 * .62, v = -450 * .62, c = tc(c0.x + rr.x * u + t.x * v, 0, c0.z + rr.z * u + t.z * v);
        if (c[2] > NEAR) { const sx = this.cx0p + c[0] * this.Fp / c[2], sy = this.cy0p - c[1] * this.Fp / c[2]; x.font = '300 ' + hs.toFixed(1) + 'px ' + this.fD; const tw = x.measureText(hl.toUpperCase()).width;
          qx = Math.max(this.m + tw / 2, Math.min(W - this.m - 48 - tw / 2, sx)); qy = Math.min(H - Math.max(36, H * .07), sy + hs * 1.5) - d * 70 + (1 - hot) * 24; } }
      x.globalAlpha = a; x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.font = '300 ' + hs.toFixed(1) + 'px ' + this.fD; x.letterSpacing = '0px'; x.fillText(hl.toUpperCase(), qx, qy);
      const ls = Math.max(10, Math.min(14, hs * .14)); x.font = '500 ' + ls.toFixed(1) + 'px ' + this.fT; x.letterSpacing = '0.16em';
      const ly = qy - hs * .92 - ls * .9; x.fillText(lab.toUpperCase(), qx, ly);
      const lw = x.measureText(lab.toUpperCase()).width; x.fillStyle = '#FFB200'; x.fillRect(qx - lw / 2, ly + ls * .5, lw, 3);
    });
    x.globalAlpha = 1; x.letterSpacing = '0px';
  }
  drawStops(TT, tc, pr, clip, NEAR, fogS, fw, fi) {
    const x = this.ctx, cl = v => v < 0 ? 0 : v > 1 ? 1 : v, rp = (v, a, b) => cl((v - a) / (b - a));
    const seg = (a, b) => { const s = clip(a, b); if (s) { x.moveTo(s[0][0], s[0][1]); x.lineTo(s[1][0], s[1][1]); } };
    const fr = 1 - Math.max(fw, fi);
    [[-400, 0], [8000, 8]].forEach(([zb, at]) => {
      const hot = cl(1 - Math.abs(TT - at) * 1.2), a0 = tc(-1600, 0, zb), a1 = tc(1600, 0, zb), a = cl(1 - ((a0[2] + a1[2]) / 2 - 1800) / 12500) * fr; if (a <= 0) return;
      x.globalAlpha = a * (.45 + .55 * hot); x.strokeStyle = '#FFFFFF'; x.lineWidth = 1.5; x.beginPath(); seg(a0, a1); x.stroke();
    });
    const hA = rp(TT, 12.5, 14.5) * (1 - fw); if (hA <= 0) return;
    const c0 = this.S(15.7), t = this.T(14.3), r = { x: t.z, z: -t.x }, K = .62;
    const W3 = (u, v, y) => tc(c0.x + (r.x * u + t.x * v) * K, y * K, c0.z + (r.z * u + t.z * v) * K);
    const faces = [];
    const box = (b, wins) => { const [u0, u1, v0, v1, y0, y1] = b;
      faces.push({ p: [W3(u0, v0, y0), W3(u1, v0, y0), W3(u1, v0, y1), W3(u0, v0, y1)], w: (wins || []).map(([a0, a1, b0, b1]) => [W3(a0, v0, b0), W3(a1, v0, b0), W3(a1, v0, b1), W3(a0, v0, b1)]) });
      faces.push({ p: [W3(u0, v1, y0), W3(u1, v1, y0), W3(u1, v1, y1), W3(u0, v1, y1)], w: [] });
      faces.push({ p: [W3(u0, v0, y0), W3(u0, v1, y0), W3(u0, v1, y1), W3(u0, v0, y1)], w: [] });
      faces.push({ p: [W3(u1, v0, y0), W3(u1, v1, y0), W3(u1, v1, y1), W3(u1, v0, y1)], w: [] });
      faces.push({ p: [W3(u0, v0, y1), W3(u1, v0, y1), W3(u1, v1, y1), W3(u0, v1, y1)], w: [] }); };
    box([-900, 900, -450, 450, 0, 330], [[-820, -120, 30, 300]]); box([-300, 1200, -400, 400, 330, 620], [[300, 1120, 380, 580]]);
    const poly = q => { if (q.some(c => c[2] < NEAR)) return false; x.beginPath(); q.forEach((c, i) => { const s = pr(c); i ? x.lineTo(s[0], s[1]) : x.moveTo(s[0], s[1]); }); x.closePath(); return true; };
    const lit = rp(TT, 15.7, 16.3);
    faces.map(f => Object.assign(f, { z: f.p.reduce((s, c) => s + c[2], 0) / 4 })).sort((a, b) => b.z - a.z).forEach(f => {
      if (!poly(f.p)) return; x.globalAlpha = hA; x.fillStyle = '#000000'; x.fill(); x.strokeStyle = '#FFFFFF'; x.globalAlpha = hA * .85; x.lineWidth = 1.2; x.stroke();
      f.w.forEach(q => { if (!poly(q)) return; if (lit > 0) { x.globalAlpha = hA * lit; x.fillStyle = '#FFB200'; x.fill(); } x.globalAlpha = hA * .7; x.stroke(); });
    });
    x.globalAlpha = 1;
  }

  draw(pos) {
    const W = this.W, H = this.H, x = this.ctx, TT = this.tau == null ? pos : this.tau, cam = this.camT(TT), C = cam.C; let F = this.F;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); x.clearRect(0, 0, W, H);
    let fx = cam.L.x - C.x, fy = cam.L.y - C.y, fz = cam.L.z - C.z; const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
    let rx = fz, rz = -fx; const rl = Math.hypot(rx, rz); rx /= rl; rz /= rl;
    const ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;
    const fw = (p => p * p * (3 - 2 * p))(Math.max(0, Math.min(1, (pos - 13.3) / .7))), bgo = 1 - (v => v * v * (3 - 2 * v))(Math.max(0, Math.min(1, (pos - 15.1) / .45))), fi = 1 - (v => v * v * (3 - 2 * v))(Math.max(0, Math.min(1, (TT + 1) / .9))), cx0 = W * (.5 + (this.mob ? 0 : .06) * fi + (this.mob ? 0 : .13) * (pos > -1.3 && pos < 13.6 ? 1 - Math.max(fw, fi) : 0)), cy0 = H * (.36 + (this.mob ? .02 : .1) * fw + (this.mob ? -.02 : -.035) * fi), NEAR = 30;
    F *= 1 - (this.mob ? .05 : .2) * fi;
    this.Fp = F; this.cx0p = cx0; this.cy0p = cy0;
    const tc = (px, py, pz) => { const dx = px - C.x, dy = py - C.y, dz = pz - C.z; return [dx * rx + dz * rz, dx * ux + dy * uy + dz * uz, dx * fx + dy * fy + dz * fz]; };
    const pr = c => [cx0 + c[0] * F / c[2], cy0 - c[1] * F / c[2]];
    const clip = (a, b) => {
      if (a[2] < NEAR && b[2] < NEAR) return null;
      if (a[2] < NEAR) { const t = (NEAR - a[2]) / (b[2] - a[2]); a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]; }
      if (b[2] < NEAR) { const t = (NEAR - b[2]) / (a[2] - b[2]); b = [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t, NEAR]; }
      return [pr(a), pr(b)];
    };
    const cl = v => v < 0 ? 0 : v > 1 ? 1 : v, rp = (v, a, b) => cl((v - a) / (b - a));
    const fogG = z => cl(1 - (z - 900) / 7800), fogS = z => cl(1 - (z - 2500) / 15000);

    const G = 400, B = 7, buckets = Array.from({ length: B + 1 }, () => []);
    const gx0 = Math.floor((C.x - 8000) / G) * G, gx1 = C.x + 8000, gz0 = Math.floor((C.z - 1200) / G) * G, gz1 = C.z + 10000;
    const add = (ax, az, bx, bz) => { const a = tc(ax, 0, az), b = tc(bx, 0, bz), k = Math.round(fogG((a[2] + b[2]) / 2) * B); if (!k) return; const s = clip(a, b); if (s) buckets[k].push(s); };
    for (let gx = gx0; gx <= gx1; gx += G) for (let gz = gz0; gz < gz1; gz += G) add(gx, gz, gx, gz + G);
    for (let gz = gz0; gz <= gz1; gz += G) for (let gx = gx0; gx < gx1; gx += G) add(gx, gz, gx + G, gz);
    x.lineWidth = 1; x.strokeStyle = '#444442';
    buckets.forEach((arr, k) => { if (!arr.length) return; x.globalAlpha = Math.pow(k / B, 1.4) * .7 * bgo * (1 - .7 * Math.max(0, Math.min(1, (pos + 1.2) / .6)) * (1 - Math.max(0, Math.min(1, (pos - 13.2) / .5)))); x.beginPath(); arr.forEach(s => { x.moveTo(s[0][0], s[0][1]); x.lineTo(s[1][0], s[1][1]); }); x.stroke(); });

    const ride = (pos > -1.3 && pos < 15.2) ? 1 - Math.max(fw, fi) : 0;
    if (Math.max(fw, fi, ride) > 0) {
      const G2 = 400, NX = 8, NZ = 42, X0 = -1600, Z0 = -800, ins = 24, out = bgo;
      const quad = (a, b, y, i2) => { y = y || 0; const n = i2 == null ? ins : i2; return [tc(a + n, y, b + n), tc(a + G2 - n, y, b + n), tc(a + G2 - n, y, b + G2 - n), tc(a + n, y, b + G2 - n)]; };
      const path = q => { if (q.some(c => c[2] < NEAR)) return false; q.forEach((c, i) => { const s = pr(c); i ? x.lineTo(s[0], s[1]) : x.moveTo(s[0], s[1]); }); x.closePath(); return true; };
      const yc = {}; this.PTS.forEach((P, k) => { yc[Math.floor(P.x / G2) + ',' + Math.floor(P.z / G2)] = k; });
      const IA = this.ia == null ? 1 : this.ia, intro = fi > 0 && pos < 0;
      const eo = v => 1 - Math.pow(1 - v, 3), sms = v => v * v * (3 - 2 * v);
      const pHead = -0.7 + 14.4 * (v => .25 * v + .75 * sms(v))(rp(IA, .1, .86)), pC = pHead + 3.4 * rp(IA, .72, 1);
      this.pHead = intro ? pHead : null;
      if (!this.CA) { this.CA = []; for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) { const cx = X0 + ix * G2 + G2 / 2, cz = Z0 + iz * G2 + G2 / 2; let bp = 0, bd = 1e9; for (let p = -1; p <= 14; p += .05) { const s = this.S(p), d = Math.hypot(s.x - cx, s.z - cz); if (d < bd) { bd = d; bp = p; } } this.CA.push(bp + bd / 650 + (((ix * 97 + iz * 211) % 41) / 41) * .45); } }
      const oA = Math.max(fw * out, fi * sms(rp(IA, 0, .12))), cf = z => cl(1 - (z - 1800) / 12500); x.strokeStyle = '#444442'; x.lineWidth = 1;
      for (let iz = 0; iz < NZ; iz++) { const zc = tc(0, 0, Z0 + iz * G2 + G2 / 2)[2], al = Math.max(oA, ride * .9 * cf(zc)); if (al <= .01) continue; x.globalAlpha = al; x.beginPath(); for (let ix = 0; ix < NX; ix++) path(quad(X0 + ix * G2, Z0 + iz * G2)); x.stroke(); }
      x.fillStyle = '#444442';
      for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) {
        const a = X0 + ix * G2, b = Z0 + iz * G2; if (yc[Math.floor(a / G2) + ',' + Math.floor(b / G2)] != null) continue;
        const h = ((ix * 73 + iz * 151) % 17) / 17 * .07, tE = rp(pos, 13.5 + iz / NZ * .9 + h, 13.65 + iz / NZ * .9 + h) * out;
        const ar = this.CA[iz * NX + ix], tI = fi * eo(rp(pC, ar - .2, ar + .6)), gR = eo(rp(Math.min(pos, 13) + 1.1, ar - .25, ar + .55)), keep = Math.min(1, ride + (pos > 13 ? fw * out : 0)), tR = keep * gR * (ride > 0 ? 1 - (1 - cf(tc(a + G2 / 2, 0, b + G2 / 2)[2])) * (1 - fw) : 1), t = Math.max(tE, tI, tR);
        if (t <= 0) continue; const gr = tI >= tE && tI >= tR ? tI : tR >= tE ? gR : 1; x.globalAlpha = Math.min(1, t * 1.4) * (tR >= tE && tR >= tI ? .55 + .45 * Math.max(fw, fi) : 1); x.beginPath(); if (path(quad(a, b, 0, ins + (G2 / 2 - ins) * (1 - gr)))) x.fill();
      }
      if (intro) this.PTS.forEach((P, k) => {
        const a = Math.floor(P.x / G2) * G2, b = Math.floor(P.z / G2) * G2, u = rp(pHead, k - .06, k + .34); if (u <= 0) return;
        const bk = 1 + 2.9 * Math.pow(u - 1, 3) + 1.9 * Math.pow(u - 1, 2), u2 = rp(pHead, k - .02, Math.min(k + 1.1, 13.65));
        x.globalAlpha = fi * Math.min(1, u * 5); x.fillStyle = '#FFB200'; x.beginPath(); if (path(quad(a, b, 0, G2 / 2 - (G2 / 2 - ins) * bk))) x.fill();
        if (u2 > 0 && u2 < 1) { x.globalAlpha = fi * (1 - u2) * .9; x.strokeStyle = '#FFB200'; x.lineWidth = 1.5; x.beginPath(); if (path(quad(a, b, 0, ins - 230 * eo(u2)))) x.stroke(); }
      });
      const gth = (v => v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2)(rp(pos, 15.3, 15.9)), R0 = this.winRect0(), TG = [[R0.x, R0.y], [R0.x + R0.w, R0.y], [R0.x + R0.w, R0.y + R0.h], [R0.x, R0.y + R0.h]];
      x.fillStyle = '#FFB200';
      if (pos < 15.92 && !intro) this.PTS.forEach((P, k) => {
        const t = rp(pos, 13.55 + k * .028, 13.68 + k * .028); if (t <= 0) return;
        const q = quad(Math.floor(P.x / G2) * G2, Math.floor(P.z / G2) * G2); if (q.some(c => c[2] < NEAR)) return;
        let s = q.map(pr); const cx = s.reduce((a, p) => a + p[0], 0) / 4, cy = s.reduce((a, p) => a + p[1], 0) / 4;
        s = s.map(p => ({ p, a: Math.atan2(p[1] - cy, p[0] - cx) })).sort((u, v) => u.a - v.a);
        let b = 0, bd = 9; s.forEach((o, i) => { const d = Math.abs(o.a + 2.356); if (d < bd) { bd = d; b = i; } });
        s = s.slice(b).concat(s.slice(0, b)).map(o => o.p);
        x.globalAlpha = t; x.beginPath();
        s.forEach((p, i) => { const X = p[0] + (TG[i][0] - p[0]) * gth, Y = p[1] + (TG[i][1] - p[1]) * gth; i ? x.lineTo(X, Y) : x.moveTo(X, Y); });
        x.closePath(); x.fill();
      });
    }

    x.globalAlpha = .7 * bgo; x.strokeStyle = '#CACACA'; x.lineWidth = 1.3; x.setLineDash([3, 8]); x.beginPath();
    let prev = null;
    const ph = this.pHead, pEnd = ph == null ? 14.35 : 14.35 + (ph - 14.35) * fi;
    for (let p = -2.6 + 1.9 * fi; p <= Math.min(pEnd, 15.35); p += .06) { const s = this.S(p), c = tc(s.x, 0, s.z); if (prev) { const sg = clip(prev, c); if (sg) { x.moveTo(sg[0][0], sg[0][1]); x.lineTo(sg[1][0], sg[1][1]); } } prev = c; }
    x.stroke(); x.setLineDash([]);
    if (this.pHead != null && this.pHead < 13.9 && this.pHead > -.6) { const s = this.S(this.pHead), c = tc(s.x, 0, s.z); if (c[2] > NEAR) { const q = pr(c); const dA = fi * (1 - Math.max(0, Math.min(1, ((this.ia || 0) - .84) / .08))); x.globalAlpha = dA; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(q[0], q[1], 3.5, 0, 7); x.fill(); x.globalAlpha = dA * .35; x.beginPath(); x.arc(q[0], q[1], 9, 0, 7); x.fill(); } }
    this.drawStops(TT, tc, pr, clip, NEAR, fogS, fw, fi);

    if (ride > 0 && pos < 13.9) {
      const G2 = 400, ins = 24, cfz = z => cl(1 - (z - 1800) / 12500), fade = 1 - rp(pos, 13.3, 13.8);
      const Q = (a, b, y, n) => [tc(a + n, y, b + n), tc(a + G2 - n, y, b + n), tc(a + G2 - n, y, b + G2 - n), tc(a + n, y, b + G2 - n)];
      const P2 = q => { if (q.some(c => c[2] < NEAR)) return false; x.beginPath(); q.forEach((c, i) => { const s = pr(c); i ? x.lineTo(s[0], s[1]) : x.moveTo(s[0], s[1]); }); x.closePath(); return true; };
      const nf = Math.max(10, Math.min(15, W / 1440 * 13));
      this.PTS.map((P, k) => ({ k, P, z: tc(P.x, 0, P.z)[2] })).sort((a, b) => b.z - a.z).forEach(({ k, P, z }) => {
        if (z < NEAR) return;
        const a = Math.floor(P.x / G2) * G2, b = Math.floor(P.z / G2) * G2, fz = cfz(z) * ride * fade; if (fz <= .01) return;
        const u = rp(pos, k - .4, k + .02), hot = cl(1 - Math.abs(pos - k) * 1.25);
        if (u <= 0) { x.strokeStyle = '#FFFFFF'; x.lineWidth = 1; x.globalAlpha = fz * .75; if (P2(Q(a, b, 0, ins))) x.stroke(); }
        else {
          const bk = 1 + 2.9 * Math.pow(u - 1, 3) + 1.9 * Math.pow(u - 1, 2), n = G2 / 2 - (G2 / 2 - ins) * Math.min(1.04, bk), hg = (24 + 96 * hot) * Math.min(1, u * 1.6);
          const Bq = Q(a, b, 0, n), Tq = Q(a, b, hg, n);
          [0, 1, 2, 3].map(i => { const f = [Bq[i], Bq[(i + 1) % 4], Tq[(i + 1) % 4], Tq[i]]; return { f, z: f.reduce((s, c) => s + c[2], 0) / 4 }; }).sort((p, q) => q.z - p.z)
            .forEach(({ f }) => { x.globalAlpha = fz * .78; x.fillStyle = '#000000'; if (P2(f)) { x.fill(); x.globalAlpha = fz * .62; x.fillStyle = '#FFB200'; x.fill(); } });
          x.fillStyle = '#FFB200';
          x.globalAlpha = fz; if (P2(Tq)) x.fill();
        }
        const lp = tc(a + G2 / 2, 0, b - 70); if (lp[2] < NEAR) return;
        const q = pr(lp); x.font = '500 ' + nf + 'px ' + this.fT; x.letterSpacing = '0.14em'; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillStyle = '#FFFFFF';
        x.globalAlpha = fz * (u > 0 ? .55 + .45 * hot : .6); x.fillText(String(k + 1).padStart(2, '0'), q[0], q[1] + 6);
      });
    }
    this.drawMarks(TT, tc, pr, NEAR, fw, fi);
    x.globalAlpha = 1;
  }

  winRect1() { const W = this.W, H = this.H, m = this.m || 40, t = Math.round(Math.max(this.mob ? 96 : 128, H * .17)); if (this.mob) { const w = W - 2 * m, h = Math.round(Math.min(H * .4, w * 1.5)); return { x: m, y: t, w, h }; } const bm = Math.round(Math.max(48, H * .08)), h = H - t - bm, w = Math.round(Math.min(h * 2 / 3, W * .42)); const w2 = Math.round(Math.min(w, W * .36)); return { x: W - m - 48 - w2, y: t, w: w2, h: Math.round(w2 * 1.5) }; }
  winRectS() { return { x: 0, y: 0, w: this.W, h: this.H }; }
  winRect0() { const W = this.W, H = this.H, w = Math.min(W * (this.mob ? .3 : .16), 240), h = w * .8; return { x: W / 2 - w / 2, y: H * .44 - h / 2, w, h }; }
  layoutRail() {
    const W = innerWidth, H = innerHeight, mob = this.rmob = W < 820, n = this.rbtn.length, m = this.m || 40;
    this.rx = Math.round(W - Math.max(24, m / 2));
    this.rlen = mob ? W - 2 * m : Math.min(H * .5, (n - 1) * 46);
    this.ry0 = mob ? H - 22 : Math.round(H / 2 - this.rlen / 2);
    const step = this.rlen / (n - 1);
    this.rbtn.forEach((b, i) => {
      b.style.left = (mob ? m + i * step - 22 : this.rx - 22) + 'px';
      b.style.top = (mob ? this.ry0 - 22 : this.ry0 + i * step - 22) + 'px';
      Object.assign(this.rticks[i].style, mob ? { left: '21.5px', top: '18px', width: '1px', height: '9px' } : { left: '18px', top: '21.5px', width: '9px', height: '1px' });
      this.rlabs[i].style.display = mob ? 'none' : 'flex';
    });
    Object.assign(this.rline.style, mob ? { left: m + 'px', top: this.ry0 + 'px', width: this.rlen + 'px', height: '1px' } : { left: this.rx + 'px', top: this.ry0 + 'px', width: '1px', height: this.rlen + 'px' });
    Object.assign(this.rfill.style, mob ? { left: m + 'px', top: this.ry0 + 'px', height: '1px' } : { left: this.rx + 'px', top: this.ry0 + 'px', width: '1px' });
    this.rkey = null;
  }
  rail(pos, now) {
    if (this.rlen == null) return;
    const H = innerHeight, sy = scrollY, n = this.rbtn.length, U = this.L * this.H, F0 = this.tfilm.getBoundingClientRect().top + sy;
    const PU = this.P * U, yj = this.yj = [F0, F0 + PU + U, F0 + PU + 2 * U, F0 + PU + 10 * U, F0 + PU + 18 * U].concat(this.chs.map(s => s.getBoundingClientRect().top + sy));
    this.yjump = yj.slice(); this.yjump[4] = F0 + PU + 18 * U;
    const yp = yj.map((y, i) => i < 5 ? y : y - H * .45);
    let f;
    if (pos < 14) f = pos < 0 ? pos + 2 : pos < 7 ? 2 + pos / 7 : 3 + (pos - 7) / 7;
    else { f = n - 1; for (let i = 4; i < n - 1; i++) if (sy < yp[i + 1]) { f = i + Math.max(0, Math.min(1, (sy - yp[i]) / Math.max(1, yp[i + 1] - yp[i]))); break; } }
    f = Math.max(0, Math.min(n - 1, f));
    const d = f * this.rlen / (n - 1), m = this.m || 40;
    if (this.rmob) { this.runner.style.transform = 'translate3d(' + (m + d - 7).toFixed(1) + 'px,' + (this.ry0 - 5).toFixed(1) + 'px,0)'; this.rfill.style.width = d.toFixed(1) + 'px'; }
    else { this.runner.style.transform = 'translate3d(' + (this.rx - 6.5).toFixed(1) + 'px,' + (this.ry0 + d - 5.5).toFixed(1) + 'px,0)'; this.rfill.style.height = d.toFixed(1) + 'px'; }
    const cur = Math.min(n - 1, Math.floor(f + .002)), lr = (this.sys || this.chs[this.chs.length - 1]).getBoundingClientRect();
    const on = sy > H * .2 && lr.bottom > H * .5;
    if (on !== this.ron) {
      this.ron = on; this.nav.style.opacity = on ? 1 : 0;
      this.rbtn.forEach(b => { b.style.pointerEvents = on ? 'auto' : 'none'; b.tabIndex = on ? 0 : -1; });
    }
    const py = this.rmob ? this.ry0 : H / 2; let light = (this.c15._o || 0) > .3;
    if (!light) for (const r of this.rooms) { const b = r.getBoundingClientRect(); if (b.top <= py && b.bottom > py) { light = /salbei|kalk|sand|weiss/.test(r.dataset.room || ''); break; } }
    if (light !== this.rlight) { this.rlight = light; this.nav.style.color = light ? '#000000' : '#FFFFFF'; this.rline.style.background = light ? '#000000' : '#444442'; this.rfill.style.background = light ? '#000000' : '#FFFFFF'; }
    const mode = this.rhov ? 2 : now - (this.lastS || 0) < 1500 ? 1 : 0;
    const day = cur === 2 || cur === 3 ? ' / ' + this.c.tag + ' ' + String(Math.max(0, Math.min(13, Math.round(pos))) + 1).padStart(2, '0') : '';
    const k = mode + '|' + cur + '|' + day;
    if (k !== this.rkey) {
      this.rkey = k;
      this.rlabs.forEach((l, i) => { l.style.opacity = i === cur ? (mode ? 1 : 0) : mode === 2 ? .64 : 0; });
      this.rdays.forEach((s, i) => { s.textContent = i === cur ? day : ''; });
    }
  }
  /* Kopfzeile der Website: dunkler Raum oder Vollbild-Foto unter der Kopfzeile → reines Weiß (darkZones) */
  dark() { return !!this.darkTop; }

  frame() {
    if (!this.H) { this.lt = performance.now(); return; }
    const cl = v => v < 0 ? 0 : v > 1 ? 1 : v, rp = (v, a, b) => cl((v - a) / (b - a)), sm = v => v * v * (3 - 2 * v);
    const S = (el, o, tf) => { o = Math.round(o * 1000) / 1000; if (el._o !== o) { el._o = o; el.style.opacity = o; } if (tf != null && el._t !== tf) { el._t = tf; el.style.transform = tf; } };
    const V = (el, o, d) => { S(el, o, 'translate3d(0,' + (-d * 18).toFixed(1) + 'px,0)'); const v = o > .01 ? 'visible' : 'hidden'; if (el._v !== v) { el._v = v; el.style.visibility = v; } };
    const red = this.red, H = this.H;
    const now = performance.now(), dt = Math.min(500, now - (this.lt || now)); this.lt = now;
    const kS = red ? 1 : 1 - Math.pow(.9, Math.max(1, dt / 16.7));

    const fr = this.tfilm.getBoundingClientRect();
    const raw = Math.max(0, -fr.top) / (this.L * H), tgt = Math.min(26.6 + this.P, raw) - 2 - this.P;
    this.tau += (tgt - this.tau) * kS; if (Math.abs(tgt - this.tau) < .0004) this.tau = tgt;
    const tau = this.tau, pos = this.pos = this.op(tau);
    this.ia = red ? 1 : this.iaT(tau);
    const key = tau.toFixed(4) + '|' + this.W + '|' + H + '|' + this.ia.toFixed(3);
    if (key !== this.key && fr.top < H && fr.bottom > 0) { this.key = key; this.draw(pos); }

    const vis = d => { const a = Math.abs(d); return a <= .16 ? 1 : a >= .46 ? 0 : sm(1 - (a - .16) / .3); };
    const hh = pos + 6.5;
    S(this.hero, 1 - sm(rp(hh, .4, .72)), 'translate3d(0,' + (-sm(rp(hh, .3, .72)) * 60).toFixed(1) + 'px,0)');
    const ho = 1 - sm(rp(hh, .55, .95)); S(this.hphoto, ho);
    V(this.cman, sm(rp(hh, .8, 1.05)) * (1 - sm(rp(hh, 2.4, 2.68))), hh < 1.05 ? rp(hh, .8, 1.05) - 1 : rp(hh, 2.4, 2.68));
    { const n = Math.round(rp(hh, 1.0, 2.25) * this.mws.length); if (n !== this.mwn) { this.mwn = n; this.mws.forEach((w, i) => { w.style.color = i < n ? '#FFFFFF' : '#444442'; }); } }
    const pin = sm(rp(hh, 2.62, 2.95));
    S(this.can, sm(rp(hh, 2.55, 3)));
    const hv = ho > .01 ? 'visible' : 'hidden'; if (this.hphoto._v !== hv) { this.hphoto._v = hv; this.hphoto.style.visibility = hv; }
    if (this.mob) { const go = sm(rp(tau, -2.8, -2.5)); V(this.ph, pos < -1 ? pin * (1 - go) : 0, hh < 2.95 ? pin - 1 : go); }
    else V(this.ph, pos < -1 ? pin : vis(pos + 1), pos < -1 ? (hh < 2.95 ? pin - 1 : 0) : pos + 1);
    this.texts.forEach((el, k) => { const d = tau - (k + 1 + (k >= 7 ? 1 : 0)); V(el, vis(d), d); });

    { const o = sm(rp(pos, 13.55, 13.9)) * (1 - sm(rp(pos, 15.2, 15.5))), d = pos < 13.9 ? (pos - 13.9) * 1.5 : pos > 15.2 ? (pos - 15.2) * 1.5 : 0; V(this.fins[0], o, d); S(this.fl2, sm(rp(pos, 14.25, 14.6)), 'translate3d(0,' + ((1 - sm(rp(pos, 14.25, 14.6))) * 16).toFixed(1) + 'px,0)'); }
    const act = pos < -.5 || pos > 13.5 ? -1 : Math.round(pos);
    if (act !== this.active) { if (this.open >= 0) this.toggleKw(this.open); this.active = act; }
    { const wr = pos > 17.05 ? 'j-weiss' : 'j-schwarz'; if (this.tfilm.dataset.room !== wr) this.tfilm.dataset.room = wr; }
    {
      if (pos < 15.88 && this.fwbg._v === 'visible') { this.fwbg._v = 'hidden'; this.fwbg.style.visibility = 'hidden'; S(this.fwbg, 0); }
      const on = pos >= 15.88, fv = on ? 'visible' : 'hidden'; if (this.fwin._v !== fv) { this.fwin._v = fv; this.fwin.style.visibility = fv; }
      if (on) {
        const ei = v => v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2, R0 = this.winRect0(), RS = this.winRectS(), R1 = this.winRect1(), e1 = ei(rp(pos, 15.9, 16.4)), e2 = ei(rp(pos, 17.0, 17.6));
        const L2 = (a, b, t) => a + (b - a) * t, A = { x: L2(R0.x, RS.x, e1), y: L2(R0.y, RS.y, e1), w: L2(R0.w, RS.w, e1), h: L2(R0.h, RS.h, e1) };
        const rx = L2(A.x, R1.x, e2), ry = L2(A.y, R1.y, e2), rw = L2(A.w, R1.w, e2), rh = L2(A.h, R1.h, e2);
        const k = rx.toFixed(1) + ',' + ry.toFixed(1) + ',' + rw.toFixed(1) + ',' + rh.toFixed(1);
        if (k !== this.fwk) { this.fwk = k; Object.assign(this.fwin.style, { left: rx + 'px', top: ry + 'px', width: rw + 'px', height: rh + 'px' }); Object.assign(this.s15.style, { left: (RS.x - rx) + 'px', top: (RS.y - ry) + 'px' }); [this.fkit, this.fksh].forEach(el => Object.assign(el.style, { left: (RS.x - rx) + 'px', top: (RS.y - ry) + 'px', width: RS.w + 'px', height: RS.h + 'px' })); [this.fwimg, this.fwsh].forEach(el => Object.assign(el.style, { left: (R1.x - rx) + 'px', top: (R1.y - ry) + 'px', width: R1.w + 'px', height: R1.h + 'px' })); }
        const po = pos > 17.02 ? 1 : 0, wp = sm(rp(pos, 17.05, 17.5)); { const cp = 'inset(' + ((1 - wp) * 100).toFixed(2) + '% 0 0 0)'; if (this.fwimg._cp !== cp) { this.fwimg._cp = cp; this.fwimg.style.clipPath = cp; } } S(this.fwimg, po, 'scale(' + (1.08 - .08 * sm(rp(pos, 17.1, 20.4))).toFixed(4) + ')'); S(this.fwsh, 0); const bo = sm(rp(pos, 15.95, 16.25));
        S(this.fksh, pos > 17.55 ? 0 : sm(rp(pos, 16.12, 16.42))); S(this.fkit, pos > 17.55 ? 0 : sm(rp(pos, 16.12, 16.42)), 'scale(' + (1.02 + .05 * sm(rp(pos, 16.28, 16.5)) - .07 * sm(rp(pos, 16.5, 16.72))).toFixed(4) + ')');
        S(this.fwbg, bo); { const bv = bo > .01 ? 'visible' : 'hidden'; if (this.fwbg._v !== bv) { this.fwbg._v = bv; this.fwbg.style.visibility = bv; } }
        const so = (pos > 15.98 ? 1 : 0) * (1 - sm(rp(pos, 16.95, 17.15))); S(this.s15, so); S(this.s15x, 1, 'translate3d(0,' + (-sm(rp(pos, 16.95, 17.15)) * 20).toFixed(1) + 'px,0)');
        { const ti = sm(rp(pos, 16.26, 16.4)); S(this.s15i, ti, 'translate3d(0,' + ((1 - ti) * 16).toFixed(1) + 'px,0)');
          { const [l0, l1, l2] = this.s15ls, a0 = sm(rp(pos, 16.28, 16.5)), a1 = sm(rp(pos, 16.5, 16.72)), a2 = sm(rp(pos, 16.72, 16.88)), dim = 1 - .55 * a2;
            S(l0, a0 * (1 - .55 * a1) * dim, 'scale(' + (.94 + .06 * a0).toFixed(4) + ')'); l0.style.letterSpacing = (a0 * .1).toFixed(4) + 'em';
            S(l1, a1 * dim, 'scale(' + (1.06 - .06 * a1).toFixed(4) + ')'); l1.style.letterSpacing = ((1 - a1) * .16).toFixed(4) + 'em';
            S(l2, 1, 'translate3d(0,' + ((1 - a2) * 110).toFixed(1) + '%,0)'); l2.style.letterSpacing = '0em'; } }
      }
      V(this.c15, sm(rp(pos, 17.45, 17.8)), pos < 17.8 ? (rp(pos, 17.45, 17.8) - 1) * 1.2 : 0);
      this.lebenFrame(pos, S, sm, rp);
    }
    /* Kopfzeile: über Schwarz und dem Vollbild-Foto weiß; über Weiß (auch während das gelbe Feld wächst) im Differenz-Modus */
    this.darkTop = fr.top <= 44 && fr.bottom >= 44 ? !(pos >= 15.97 && pos < 16.3) && pos < 17.05 : false;

    if (this.endS) { const r = this.endS.getBoundingClientRect(); if (r.top < H && r.bottom > 0) {
      const p = cl(-r.top / Math.max(1, r.height - H));
      const ex = sm(rp(p, .68, .97));
      S(this.endI, 1, 'translate3d(' + (this.mob ? 0 : -9) + '%,0,0) scale(' + (1.2 - .03 * sm(cl((H - r.top) / (H * 1.6))) + .06 * ex).toFixed(4) + ')');
      S(this.endB, ex); S(this.endC, 1 - sm(rp(p, .66, .84)), 'translate3d(0,' + (-sm(rp(p, .66, .86)) * 40).toFixed(1) + 'px,0)');
      { const t = red ? 1 : sm(rp(p, .36, .48)); S(this.endCta, t, 'translate3d(0,' + ((1 - t) * 16).toFixed(1) + 'px,0)'); this.endCta.style.pointerEvents = t > .5 ? 'auto' : 'none'; }
      this.endW.forEach((w, i) => { const t = red ? 1 : (v => 1 - Math.pow(1 - v, 3))(rp(p, .03 + i * .055, .15 + i * .055)); S(w, 1, 'translate3d(0,' + ((1 - t) * 110).toFixed(1) + '%,0)'); });
    } }
    this.rail(pos, now);

    if (this.sys) {
      const r = this.sys.getBoundingClientRect();
      if (r.bottom > -H && r.top < 2 * H) {
        const T = Math.max(1, r.height - H), ut = cl(-r.top / T);
        this.su = this.su == null ? ut : this.su + (ut - this.su) * kS; if (Math.abs(ut - this.su) < .0005) this.su = ut;
        const u = this.su, io = (a, b) => rp(u, a, b);
        if (this.mob) {
          /* Telefon (Runde 15): vier Themen je ein Viertel; die Headline bleibt, der Text geht, dann kommt an seiner Stelle die Zeichnung */
          { const n = '0' + (u < .2375 ? 1 : u < .4875 ? 2 : u < .7375 ? 3 : 4); if (this.skn.textContent !== n) this.skn.textContent = n; }
          this.stx.forEach((el, i) => {
            const a = i * .25, b = a + .25, tin = i ? sm(io(a, a + .025)) : 1, tout = i < 3 ? sm(io(b - .025, b)) : 0, th = tin * (1 - tout);
            const c = a + (i ? .13 : .09), pf = 1 - sm(io(c, c + .03)), dv = sm(io(c + .015, c + .045)), z = this.wz[i];
            V(el, th, u < a + .1 ? tin - 1 : tout);
            S(this.stp[i], pf, 'translate3d(0,' + (-(1 - pf) * 14).toFixed(1) + 'px,0)');
            if (!z) return; const t = th * dv; V(z, t, dv < 1 ? (dv - 1) * .8 : tout);
            const on = t > .5; if (on && !z._on) { z._on = 1; z.classList.add('is-on'); } else if (!on && t < .02 && z._on) { z._on = 0; z.classList.remove('is-on'); }
          });
          return;
        }
        this.stp.forEach(p => S(p, 1, 'none'));
        const t0 = 1 - sm(io(.2, .25)), t1 = sm(io(.27, .32)) * (1 - sm(io(.46, .51))), t2 = sm(io(.52, .57)) * (1 - sm(io(.73, .78))), t3 = sm(io(.8, .85));
        { const n = '0' + (u < .26 ? 1 : u < .515 ? 2 : u < .79 ? 3 : 4); if (this.skn.textContent !== n) this.skn.textContent = n; }
        V(this.stx[0], t0, io(.2, .25)); V(this.stx[1], t1, u < .4 ? io(.27, .32) - 1 : io(.46, .51)); V(this.stx[2], t2, u < .65 ? io(.52, .57) - 1 : io(.73, .78)); V(this.stx[3], t3, io(.8, .85) - 1);
        /* Runde 14: die eigenen Zeichnungen; sie laufen ab, sobald ihr Thema da ist, und beginnen von vorn, wenn es wiederkommt.
           Das erste Thema startet erst, wenn die Sektion den Bildschirm füllt. */
        const tt = [t0 * sm(cl((H - r.top) / (H * .6))), t1, t2, t3];
        this.wz.forEach((z, i) => {
          const t = tt[i] || 0; V(z, t, i === 0 && u < .2 ? sm(cl((H - r.top) / (H * .6))) - 1 : 0);
          const on = t > .5; if (on && !z._on) { z._on = 1; z.classList.add('is-on'); } else if (!on && t < .02 && z._on) { z._on = 0; z.classList.remove('is-on'); }
        });
      }
    }
  }
  /* Runde 15: Kopf und Einträge erben die Sichtbarkeit (nie 'visible' in der versteckten Sektion, sonst fangen sie Klicks auf
     „Darum kümmern wir uns“); am Telefon stehen die Texte der Einträge immer voll da.
     Besser leben (Runde 14), Desktop: die Einträge kommen nacheinander (Linie zeichnet sich bis an das Bild, dann Text);
     der zuletzt gekommene trägt die gelbe Notiz an seiner Nummer. Telefon: Headline, dann ein Eintrag nach dem anderen mit Zähler. */
  lebenFrame(pos, S, sm, rp) {
    const its = this.c15items, n = its.length; if (!n) return;
    const T = (el, tf) => { if (el._t !== tf) { el._t = tf; el.style.transform = tf; } };
    if (this.mob) {
      const hd = 1 - sm(rp(pos, 18.05, 18.35)); S(this.c15h, hd, 'translate3d(0,' + (-(1 - hd) * 40).toFixed(1) + 'px,0)'); this.c15h.style.visibility = hd > .01 ? 'inherit' : 'hidden';
      const span = Math.max(.4, (20.3 - 18.35) / n);
      let cur = 0;
      its.forEach((it, i) => {
        const a = 18.35 + i * span, inn = sm(rp(pos, a, a + span * .32)), out = i < n - 1 ? sm(rp(pos, a + span * .82, a + span * 1.02)) : 0, o = inn * (1 - out);
        if (pos >= a) cur = i;
        S(it, o, 'translate3d(0,' + ((1 - inn) * 26 - out * 26).toFixed(1) + 'px,0)'); it.style.visibility = o > .01 ? 'inherit' : 'hidden';
        [...it.children].slice(1).forEach(ch => S(ch, 1, 'none'));
        T(it.firstElementChild, 'scaleX(' + inn.toFixed(3) + ')');
        it.classList.toggle('is-akt', true);
      });
      this.lpA = null;
      const ko = sm(rp(pos, 18.25, 18.4)); S(this.c15k, ko);
      if (this.c15kn._n !== cur) { this.c15kn._n = cur; this.c15kn.textContent = String(cur + 1).padStart(2, '0'); this.c15kt.forEach((k, i) => k.classList.toggle('is-on', i <= cur)); }
      return;
    }
    S(this.c15h, 1, 'none'); this.c15h.style.visibility = 'inherit'; S(this.c15k, 0);
    let akt = -1;
    its.forEach((it, i) => {
      const a = 18.0 + i * .34, ln = sm(rp(pos, a, a + .3)), tx = sm(rp(pos, a + .1, a + .42));
      if (tx > .5) akt = i;
      S(it, 1, 'none'); it.style.visibility = 'inherit';
      T(it.firstElementChild, 'scaleX(' + ln.toFixed(3) + ')');
      [...it.children].slice(1).forEach((ch, j) => { const t = sm(rp(pos, a + .1 + j * .05, a + .42 + j * .05)); S(ch, t, 'translate3d(0,' + ((1 - t) * 14).toFixed(1) + 'px,0)'); });
    });
    if (akt !== this.lpA) { this.lpA = akt; its.forEach((it, i) => it.classList.toggle('is-akt', i === akt)); this.c15l.classList.toggle('is-voll', akt === n - 1); }
  }
}

/* Ruhige Fassung (Framer Canvas, reduzierte Bewegung ohne Scroll-Engine): alles steht, die Kamerafahrt zeigt den Hero */
export function mount(root, c0, deps = {}) {
  const c = clean(c0);
  if (deps.still) {
    root.classList.add('is-still');
    root.querySelectorAll('img[data-src]').forEach(im => { im.src = im.dataset.src; if (im.dataset.srcset) im.srcset = im.dataset.srcset; });
    root.querySelectorAll('[data-jh-l]').forEach(l => { l.style.transform = 'none'; });
    root.querySelectorAll('[data-endw]').forEach(l => { l.style.transform = 'none'; });
    const ec = root.querySelector('[data-endcta]'); if (ec) ec.style.opacity = 1;
    const z = root.querySelector('[data-wz]'); if (z) { z.classList.add('is-on'); z.style.opacity = 1; z.style.visibility = 'visible'; }
    const s = root.querySelector('[data-stx]'); if (s) { s.style.opacity = 1; s.style.visibility = 'visible'; }
    return { dispose() { }, runner: root.querySelector('.jw-runner'), railOn: () => false, dark: () => false, lebenOn: () => false };
  }
  const J = new Weg(root, c, deps);
  return {
    dispose: () => J.dispose(), runner: root.querySelector('.jw-runner'),
    railOn: () => !!J.ron, dark: () => J.dark(), film: J.tfilm, end: J.endS,
    measure: () => J.measure(), weg: J
  };
}
