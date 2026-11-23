/* GRIFFNER Journey, Runde 10 (2026-11-23): die Texte der Seite /journey, wörtlich aus dem Text vom Kunden.
   Großschreibung macht das CSS (wie die Text-Stile der Website), hier stehen die Texte in normaler Schreibung.
   Die Framer Komponenten (framer-bau.mjs) machen aus jedem Text ein Eingabefeld; das hier sind die Vorgaben. */

/* 1 · Einstieg: Headline, dann die Sätze als Zeilen, die beim Scrollen hell werden (wie Über uns), am Ende das Feld und ein Satz */
export const EINSTIEG = {
  h: 'Gib uns 14 Tage deiner Zeit. Um den Rest kümmern wir uns.',
  zeilen: [
    'Ein Haus zu bauen kostet meist unzählige Abende, Wochenenden und Telefonate.',
    'Bei uns sind es 14 Tage.',
    'An diesen Tagen entscheidest du, wie du leben willst und wie dein Haus aussieht.',
    'Alles dazwischen übernehmen wir, mit der Erfahrung aus über 75 Jahren Hausbau.',
    'So wird das wichtigste Projekt deines Lebens auch das schönste.'
  ],
  satzA: 'Das ist die GRIFFNER Journey,',
  satzB: 'dein Weg vom ersten Gespräch bis zum Schlüssel.'
};

/* 2 · Die 14 Tage. ph: vor diesem Tag beginnt eine neue Phase (schwarzer Bildschirm mit dem Namen). k: Stichworte, mit „ · “ getrennt. */
export const TAGE = [
  { ph: 'Besser planen.', t: 'Architekturkonzept', d: 'Du erzählst uns, wie du lebst und wohnen willst. Daraus entstehen die ersten Ideen für Räume und Stil.', k: 'Raumbedarf · Erste Architekturideen · Stilrichtung · Fragen für den Grundstückstermin · Dein persönlicher Projektmanager' },
  { t: 'Machbarkeitsanalyse', d: 'Vor Ort prüfen wir Baurecht, Zufahrt und Ausrichtung und skizzieren, wo Haus und Garten liegen könnten.', k: 'Baurecht · Gelände und Ausrichtung · Zufahrt und Erschließung · Gespräch mit der Gemeinde · Erste Skizze für Haus und Garten' },
  { t: 'Budgetanalyse', d: 'Wir stellen alle Kosten vom Haus bis zum Garten zusammen und klären, was sofort kommt und was später.', k: 'Haus und Unterbau · Haustechnik und Anschlüsse · Zufahrt und Außenanlagen · Baunebenkosten · Prioritäten · Vorschläge zur Optimierung' },
  { t: 'Varianten', d: 'Wir zeigen dir mehrere Varianten als Skizze und 3D-Modell. Du wählst die, mit der wir weiterplanen.', k: 'Baukörperstudien · Skizzen und 3D-Modelle · Raumaufteilung und Tageslicht · Bezug zum Garten · Kosten je Variante' },
  { t: 'Entwurfsplanung', d: 'Aus deiner Variante wird ein Entwurf. Du entscheidest über Fassade, Dach und Fenster, wir planen den Garten mit.', k: 'Lageplan · Grundrisse, Schnitte und Ansichten · Außenvisualisierungen · Planung der Außenanlagen · Vorprüfung von Statik und Haustechnik · Aktualisierte Kosten' },
  { t: 'Innenarchitektur', d: 'Ein guter Entwurf endet nicht an der Fassade. Deshalb denken wir Einrichtung, Materialien und Farben schon in der Planung mit.', k: 'Moodboards · Innenvisualisierungen · Konzept für Einrichtung, Materialien und Farben · Vorgespräch mit der Baubehörde · Vertragsunterlagen vorab' },
  { t: 'Beauftragung', d: 'Du besuchst die Manufaktur, wir klären Leistungsumfang, Kosten und Termine. Dann beauftragst du uns mit deinem Projekt.', k: 'Organisation deines Besuchs · Führung durch die Manufaktur · Vorbemusterung · Detaillierte Kostenberechnung · Leistungsumfang und Terminrahmen · Auswahl der Fachbetriebe' },
  { ph: 'Besser bauen.', t: 'Projektstart', d: 'Du lernst alle Beteiligten kennen, wir legen den Zeitplan fest. Ab jetzt bekommst du jede Woche ein Update.', k: 'Projektteam · Zeitplan bis zur Übergabe · Meilensteine · Zuständigkeiten · Wöchentliches Update' },
  { t: 'Einreichung', d: 'Auf deinem Grundstück bestätigst du Lage und Höhe des Hauses. Dann reichen wir die Pläne bei der Gemeinde ein.', k: 'Vermessung und Bodengutachten · Zufahrt und Anschlüsse · Einreichplanung · Energieausweis · Nachbarzustimmungen · Bauverhandlung' },
  { t: 'Detailplanung', d: 'Parallel zur Einreichung planen wir Küche, Bad, Licht und Elektrik und bereiten den Design Day vor.', k: 'Raumgestaltung · Küche und Bad · Beleuchtung · Elektro- und Haustechnikplanung · Material- und Produktauswahl · Vorbereitung des Design Day' },
  { t: 'Design Day', d: 'In Griffen wählst du Böden, Fliesen, Türen und Bad aus und siehst bei jeder Auswahl, was sie kostet.', k: 'Muster im Zusammenspiel · Kosten jeder Auswahl · Abstimmung der Gewerke · Übernahme in die Ausführungsplanung' },
  { t: 'Freigabe', d: 'Du prüfst mit uns die finalen Pläne. Mit deiner Freigabe geht dein Haus in die Fertigung.', k: 'Ausführungspläne · Statik · Haustechnik und Elektro · Anschluss an Keller oder Fundament · Übergänge zu Pool, Zaun und Zufahrt · Vergabe der Gewerke' },
  { t: 'Montage', d: 'Nach der Abnahme des Fundaments wird dein Haus in Griffen gefertigt und vor Ort montiert. Du bist dabei.', k: 'Abnahme des Fundaments · Fertigung in der Manufaktur · Montage · Koordination der Gewerke · Qualitätskontrollen · Baudokumentation' },
  { t: 'Übergabe', d: 'Wir gehen mit dir durch Haus und Haustechnik und übergeben alle Unterlagen. Dann schließt du selbst auf.', k: 'Abnahme · Einweisung in die Haustechnik · Pläne und Baudokumentation · Garantieunterlagen · Pflege- und Wartungshinweise · Servicekontakte' }
];
export const SZENE = { kopf: 'Darum kümmern wir uns', tag: 'Tag' };

/* 3 · Der Stapel: alle Stichworte der 14 Tage fallen zu einem Stapel zusammen, darüber dieser Satz */
export const STAPEL = { h: 'Um den Rest kümmern wir uns.' };

/* 4 bis 8 · Ab Tag 15, dann die vier Kapitel, alles in einer Sektion; 9 · Abschluss mit Knopf */
export const LEBEN = {
  phase: { info: 'Ab Tag 15', h: 'Besser leben.', lead: 'Mit dem Schlüssel endet dein Projekt, aber nicht unsere Begleitung.' },
  /* Runde 11 (Kunde: „remove the images and have just the animations and drawings“): keine Bilder mehr, je Kapitel eine Zeichnung.
     marken: Beschriftung der Zeichnung, je Marke [Zeile, Zeile] (Reihenfolge wie in leben.js beschrieben). */
  kapitel: [
    { tab: 'Ab Tag 15', art: 'leben', h: 'Besser leben.', text: 'Mit dem Schlüssel endet dein Projekt, aber nicht unsere Begleitung.',
      punkte: [
        ['Nach vier Jahreszeiten.', 'Nach einem Jahr im neuen Zuhause setzen wir uns wieder zusammen. Wie fühlen sich Licht, Raumklima und Haustechnik an? Dein Feedback macht unsere Häuser besser.'],
        ['Kundenservice.', 'Bei Fragen zu Pflege, Wartung und allem, was dein Haus betrifft, bleibt unser Kundenservice an deiner Seite. Ein Leben lang.'],
        ['Ambassador Programm.', 'Als eine von 20 Baufamilien öffnest du dein Zuhause für alle, die noch vor ihrem Projekt stehen, und erzählst, wie du es erlebt hast.'],
        ['Home Community.', 'Einmal im Jahr bringen wir GRIFFNER Hausbesitzer zusammen. Zum Austauschen, Kennenlernen und Feiern.']
      ],
      marken: [['Tag 15', 'Schlüssel'], ['Nach einem Jahr', 'Feedback'], ['Jedes Jahr', 'Home Community'], ['Ein Leben lang', 'Kundenservice']] },
    { tab: 'Alles in einem Plan', art: 'schichten', h: 'Alles in einem Plan.',
      text: 'Im GRIFFNER Planungssystem führen wir Architektur, Innenarchitektur, Haustechnik, Unterbau und Außenanlagen zusammen. So greift jede Entscheidung in die nächste, und Kosten, Termine und Qualität bleiben in jeder Phase im Blick.',
      schichten: ['Architektur', 'Innenarchitektur', 'Haustechnik', 'Unterbau', 'Außenanlagen'] },
    { tab: 'Ein Auftrag. Ein Partner.', art: 'partner', h: 'Ein Auftrag. Ein Partner.',
      text: 'Mit deinem Auftrag übernehmen wir die Verantwortung für alles, was wir gemeinsam vereinbaren. Wir koordinieren die Gewerke rund um dein Haus, mit Fachbetrieben aus unserem Netzwerk oder mit Partnern deines Vertrauens.',
      marken: [['Unterbau', ''], ['Haustechnik', ''], ['Elektro', ''], ['Küche und Bad', ''], ['Außenanlagen', ''], ['Pool und Zaun', ''], ['Ein Partner', '']] },
    { tab: 'Jede Woche', art: 'update', h: 'Jede Woche weißt du, wo du stehst.',
      text: 'Ab dem Projektstart bekommst du jede Woche ein Update, ganz wie du willst: persönlich, online oder per E-Mail.',
      punkte: [
        ['Erledigt.', 'Was abgeschlossen, entschieden und freigegeben ist.'],
        ['Als nächstes.', 'Der nächste Meilenstein und was wir dafür vorbereiten.'],
        ['Noch offen.', 'Was ansteht, wer zuständig ist und bis wann.'],
        ['Kosten und Termine.', 'Wo dein Projekt steht und was eine Änderung bewirkt.']
      ],
      marken: [['Wöchentliches Update', '']] },
    { tab: 'Zweimal Griffen', art: 'griffen', h: 'Zweimal Griffen.',
      text: 'Bei der Beauftragung lernst du die Manufaktur und die Menschen dahinter kennen, beim Design Day wählst du jedes Detail für dein Zuhause. Wenn es für dich passt, holen wir dich ab. Mit einem zusätzlichen Tag am Wörthersee oder am Feuerberg lässt du den Besuch in Ruhe ausklingen.',
      marken: [['Dein Zuhause', ''], ['Griffen', 'Manufaktur'], ['Tag 07', 'Beauftragung'], ['Tag 11', 'Design Day'], ['Wörthersee', ''], ['Feuerberg', '']] }
  ],
  cta: { h: 'Dein Tag 01 beginnt mit einem Gespräch.', knopf: 'Gespräch vereinbaren', href: '/contact#contact-form' }
};
