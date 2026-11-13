/* Services (Entwurf, Runde 45): alle Texte der beiden Seiten leistungen.html (Übersicht) und leistungsumfang.html (Leistungsumfang).
   Quelle: hausbaugehtbesser.com (Startseite) und hausbaugehtbesser.com/leistungsumfang, Stand 10.11.2026, wörtlich übernommen.
   Eigene Zeilen (nicht aus der Quelle) sind mit EIGEN markiert und in TEXTE.md gelistet. Du-Form, keine Gedankenstriche, kein Ausrufezeichen. */

/* Die acht Dinge, Reihenfolge wie auf /leistungsumfang. Runde 65 (Kunde): neue Bilder, je acht-<key>.jpg im Bildordner. key = Teil im 3D Haus (js/schnitthaus.js, Concept Bold) und Muster (js/muster3d.js) */
export const ACHT = [
  {
    key: 'openspace', nr: '01', name: 'Open Space®', kurz: 'Open Space®',
    claim: 'Decke und Dach ruhen vor allem auf den Außenwänden. Raum für einen freien Grundriss.', // Runde 68 (Kunde)
    griffner: 'Wenige Lastenpunkte ermöglichen ein flexibles Raumkonzept. Der Grundriss folgt deinem Leben.',
    ueblich: 'Tragende Innenwände. Jede Änderung kostet einen Aufpreis.',
    fakten: ['2 Ableitungspunkte', '9,80 m Raumbreite ohne Wand', '0 tragende Innenwände'],
    bild: 'assets/img/acht-openspace.jpg', alt: 'Offener Wohnraum mit Sofa, Essplatz und Küche, nur eine Holzstütze, große Glasfront zum Garten'
  },
  {
    key: 'wand', nr: '02', name: 'Premium Wand', kurz: 'Premium Wand',
    claim: 'Neun Schichten aus natürlichen Materialien für ein gesundes Raumklima.', // Runde 68 (Kunde)
    griffner: '42,25 cm aus Holz, Holzfaser und Zellulose, diffusionsoffen. Natürliche Dampfbremse, keine Folien. Sie regelt die Feuchte von selbst.',
    ueblich: 'Dünnere Wand mit Kunststoffdämmung.',
    fakten: ['42,25 cm stark', 'U-Wert 0,147 W/m²K', 'ohne PVC-Folien'],
    bild: 'assets/img/acht-wand.jpg', alt: 'Hell verputzte Außenwand mit tiefer Fensterlaibung und Blätterschatten'
  },
  {
    key: 'dach', nr: '03', name: 'Natürliche Dachdämmung', kurz: 'Natürliche Dachdämmung',
    claim: 'Holzfaser und Zellulose halten die Sommerhitze lange draußen.', // Runde 68 (Kunde)
    griffner: 'Die Holzfaser-Zellulosedämmung speichert die Hitze des Tages und gibt sie erst nachts ab. Draußen 34 Grad, oben schläfst du.',
    ueblich: 'Leichte Dämmung, das Dachgeschoß heizt sich auf.',
    fakten: ['U-Wert 0,13 W/m²K', 'bis zum First offen', 'Raumhöhen bis zu 5 m im Obergeschoss'],
    bild: 'assets/img/acht-dach.jpg', alt: 'Haus mit Satteldach aus Metall, Lärchenfassade und großen Glasflächen am Waldrand'
  },
  {
    key: 'fenster', nr: '04', name: 'Holz-Alu-Fenster', kurz: 'Holz-Alu-Fenster',
    claim: 'Dreifach verglast, innen warmes Holz, außen wetterfestes Aluminium.', // Runde 68 (Kunde)
    griffner: 'Dreifachverglasung, verdeckte Beschläge. Innen Holz, außen Aluminium, das ohne Anstrich auskommt.',
    ueblich: 'Kunststofffenster in Weiß, innen wie außen.',
    fakten: ['Ug 0,6 W/m²K', 'verdeckt liegende Beschläge', 'innen Natur, Weiß oder Schwarz'],
    bild: 'assets/img/acht-fenster.jpg', alt: 'Holz-Alu-Fenster mit Eichenrahmen und Blick in einen grünen Hof'
  },
  {
    key: 'decke', nr: '05', name: 'Sichtbare Holzdecke', kurz: 'Sichtbare Holzdecke',
    claim: 'Massivholz in Sichtqualität, natur oder weiß lasiert.', // Runde 68 (Kunde)
    griffner: 'Massivholz oder Tram, natur oder weiß lasiert. Du entscheidest, welche Struktur über dir liegt.',
    ueblich: 'Abgehängte Gipsdecke, weiß gestrichen.',
    fakten: ['Massivholz oder Tram', 'natur oder weiß lasiert', 'in Sichtqualität'],
    bild: 'assets/img/acht-decke.jpg', alt: 'Raum mit heller, sichtbarer Holzdecke, großen Fenstern und einem Ledersessel'
  },
  {
    key: 'parkett', nr: '06', name: 'Naturparkett', kurz: 'Naturparkett',
    claim: 'Eiche, gebürstet und naturmatt, abschleifbar für Generationen.', // Runde 68 (Kunde)
    griffner: 'Echtes Eichenparkett, kein Dekor auf Folie. Abschleifbar, und mit den Jahren schöner.',
    ueblich: 'Laminat oder Vinyl, austauschbar statt reparierbar.',
    fakten: ['Eiche als Diele', 'gebürstet, naturmatt versiegelt', '21,5 cm Aufbau mit Flächenheizung'],
    bild: 'assets/img/acht-parkett.jpg', alt: 'Eichenparkett mit Sessel vor einem bodentiefen Fenster'
  },
  {
    key: 'raumhoehe', nr: '07', name: '2,72 Meter Raumhöhe', kurz: '2,72 Meter Raumhöhe',
    claim: 'Bei offenem First sogar bis zu fünf Meter.', // Runde 68 (Kunde)
    griffner: '22 cm mehr als üblich, in jedem Raum. Auf Wunsch 2,92 Meter.',
    ueblich: '250 cm, im Obergeschoß oft weniger.',
    fakten: ['2,72 m in jedem Raum', 'auf Wunsch 2,92 m', '22 cm mehr als üblich'],
    bild: 'assets/img/acht-raumhoehe.jpg', alt: 'Hoher Wohnraum mit Holzdecke, Sofa und großem Fenster in den Garten'
  },
  {
    key: 'fassade', nr: '08', name: 'Fassade nach deiner Wahl', kurz: 'Fassade nach deiner Wahl',
    claim: 'Holz, Putz, Steinoptik oder Fassadenplatten. Die hinterlüftete Konstruktion lässt dir bei der Gestaltung freie Wahl.', // Runde 68 (Kunde)
    griffner: 'Lärche, Putz oder beides. Für eine flexible Gestaltung. Immer hinterlüftet.',
    ueblich: 'Holz nur gegen Aufpreis.',
    fakten: ['Lärche oder Putz', 'immer hinterlüftet', 'Fassadenbahn als zweite wasserführende Ebene'],
    bild: 'assets/img/acht-fassade.jpg', alt: 'Flachdachhaus mit Fassade aus Lärche und Putz, davor Wiese und ein Baum'
  }
];

/* Wahl im 3D Haus und im Muster (EIGEN: Bezeichnungen der Knöpfe, Inhalte aus dem Leistungsumfang) */
export const WAHL = {
  fassade: { label: 'Fassade', opts: [['holz', 'Lärche'], ['putz', 'Putz'], ['beides', 'Beides']] },
  fenster: { label: 'Innen', opts: [['natur', 'Natur'], ['weiss', 'Weiß'], ['schwarz', 'Schwarz']] },
  decke: { label: 'Decke', opts: [['massiv', 'Massivholz'], ['tram', 'Tram']], opts2: [['natur', 'Natur'], ['weiss', 'Weiß lasiert']] }
};

/* Übersicht (leistungen.html) */
export const UEBERSICHT = {
  hero: {
    info: 'Services', h1: 'Hausbau geht besser.', sub: 'Besser planen. Besser bauen. Besser leben.',
    txt: 'Wir bauen Häuser aus Holz, wie sonst niemand sie baut. Für Menschen, die wissen, dass ein Zuhause mehr ist als vier Wände und ein Dach.',
    fakten: [['Seit 1950', 'in Griffen, Kärnten'], ['9.985+', 'Häuser gebaut'], ['85 %', 'Made in Austria']]
  },
  gewohnt: {
    h: 'Beim Hausbau hat man sich an vieles gewöhnt.',
    liste: ['Aufpreise für jeden Wunsch.', 'Endloses Warten.', 'Das Gefühl, weitergereicht zu werden.', 'Häuser, bei denen man erst nach Jahren merkt, wo gespart wurde.'],
    end: 'Wir finden: das geht besser.', end2: 'Auf dem ganzen Weg zu deinem Haus.'
  },
  drei: [
    { id: 's-planen', nr: '01', h: 'Besser planen.', txt: 'Frei planen mit unserem eigenen Architekturteam. Grundrissänderungen ohne Aufpreis, dank Open Space Konzept.', bild: 'assets/img/svc-planen.jpg', alt: 'Zwei Menschen aus dem Architekturteam besprechen einen Plan' },
    { id: 's-bauen', nr: '02', h: 'Besser bauen.', txt: 'Zehn Monate bis zum Einzug, garantierter Festpreis. Ein Projektmanager begleitet dich bis zum Schlüssel.', bild: 'assets/img/svc-bauen.jpg', alt: 'Fertigungshalle der Manufaktur in Griffen mit Wandelementen' },
    { id: 's-leben', nr: '03', h: 'Besser leben.', txt: 'GRIFFNER Wand, Holz-Alu-Fenster, sichtbare Holzdecken, mehr Raumhöhe. Wohngesund und sparsam, ein Leben lang.', bild: 'assets/img/wald-innen.jpg', alt: 'Wohnraum mit Holz, Licht und Blick ins Grüne' }
  ],
  planen: {
    h: 'Frag nicht, was extra kostet. Frag, was du willst.',
    txt: 'Bei den meisten Anbietern kostet jede Änderung extra, weil die Innenwände das Haus tragen. Bei uns trägt das patentierte Open Space Konzept dein Haus über wenige Punkte. Fast keine Innenwand muss tragen. Du gestaltest frei, mit echten Architektur- und Design-Profis an deiner Seite.',
    stift: 'Andere geben dir einen Grundriss. Wir geben dir einen Stift.',
    /* EIGEN: Namen der Grundrisse, nach den Reitern auf hausbaugehtbesser.com, dazu „Selbst zeichnen“ */
    tabs: [['wohnen', 'Offenes Wohnen'], ['arbeiten', 'Arbeiten zu Hause'], ['bewegung', 'Bewegung zu Hause'], ['kinder', 'Mit Kindern'], ['stift', 'Selbst zeichnen']],
    stiftHint: 'Zieh mit dem Finger oder der Maus eine Linie, dann steht dort eine Wand. Die zwei Punkte bleiben, alles andere ist deins.',
    metrik: [['2', 'Ableitungspunkte, 3,27 m Abstand'], ['9,80 m', 'Raumbreite ohne Wand'], ['2,72 m', 'Raumhöhe'], ['0', 'tragende Innenwände']]
  },
  bauen: {
    h: 'Ein Projektmanager an deiner Seite. Und der Schlüssel in zehn Monaten.',
    txt: 'Beim Hausbau geht die meiste Zeit beim Warten verloren. Bei uns nicht: ein Projektmanager und aufeinander abgestimmte Prozesse führen dich zügig durch die ganze Journey, bis zum Schlüssel in zehn Monaten.',
    monate: [
      ['0', 'Vertrag', 'Persönlicher Projektmanager ab dem ersten Tag.'],
      ['1', 'Dein Plan', 'Grundriss, Ansichten, Lage stehen fest.'],
      ['2', 'Eingereicht', 'Unterlagen vollständig, wir liefern jedes Dokument.'],
      ['3', 'Bemusterung', 'Besuch in Griffen, Ausstattung festlegen.'],
      ['4', 'Baubescheid', 'Die Gemeinde gibt grünes Licht.'],
      ['5', 'Planung fixiert', 'Geht in Fertigung, ab hier ändert sich nichts mehr.'],
      ['6', 'Baustart', 'Das Fundament entsteht.'],
      ['7', 'Dein Haus entsteht', 'Eine Woche Manufaktur in Griffen, dann steht es mit Dach und Fenstern.'],
      ['8', 'Haustechnik', 'Heizung, Lüftung, Strom, Wasser.'],
      ['9', 'Innenausbau', 'Türen, Böden, Bäder. Jetzt wird es deins.'],
      ['10', 'Einzug', 'Wir gehen ein letztes Mal gemeinsam durch dein Haus. Dann schließt du selbst auf.']
    ],
    end: '10 Monate. Dein Traumhaus ist bezugsfertig.', end2: 'Während andere noch planen, lebst du schon.'
  },
  leben: {
    h: 'Das Beste an deinem Haus wirst du nie sehen.',
    txt: 'Du optimierst deinen Schlaf, dein Training, dein Essen. Und den Ort, an dem 90 Prozent davon stattfinden? Die meisten Häuser lösen ihre Probleme mit Geräten: Lüftungsanlage gegen schlechte Luft, Klimagerät gegen Hitze, Luftbefeuchter gegen trockene Winterluft. Wir haben die Probleme vorher gelöst, in der Konstruktion.',
    info: 'Der Leistungsumfang, schwarz auf weiß', h2: 'Serienmäßig, was woanders extra kostet.',
    hint: 'Tippe auf das Haus oder auf eine Nummer.', /* EIGEN */
    end: 'Du baust einmal. Wir bauen für das eine Mal.'
  },
  mehr: { h: 'Der Ort, an dem du 90 Prozent deines Lebens verbringst, verdient mehr als das Übliche.', link: 'Den kompletten Leistungsumfang ansehen',
    bild: 'assets/img/wald-garten-ecke-1800.jpg', alt: 'Concept Bold zwischen Kiefern, zwei Ebenen mit dunklem Rahmen und Lärche, Visualisierung' },
  cta: { h: 'Jetzt weißt du, worauf es ankommt.', txt: 'Hol dir den GRIFFNER Katalog mit allen Häusern und dem kompletten Leistungsumfang. Kostenlos und unverbindlich.' }
};

/* EIGEN (Runde 46): Bedienung, Knöpfe und kurze Hinweise */
export const UI = {
  weiter: 'Weiterlesen', weniger: 'Weniger', mehrDazu: 'Mehr dazu', mehrErfahren: 'Mehr erfahren',
  haus: 'Haus mit Satteldach im Schnitt', bau: 'Dein Haus entsteht', drehen: 'Ziehen dreht das Haus', ganzesHaus: 'Ganzes Haus',
  zurueck: 'Zur Übersicht Services', vergleich: 'Im Vergleich', schliessen: 'Schließen',
  position: 'Position', positionen: 'Positionen', bereich: 'Bereich', bereiche: 'Bereiche',
  stufeWaehlen: 'Wähle eine Stufe. Das Haus zeigt, was dazukommt.', stufe: 'Stufe', alle: 'Alle', ansehen: 'ansehen'
};

/* Schnitt Notizen im 3D Haus (aus „Besser leben“ auf der Startseite, gekürzt auf die Maße) */
export const SCHNITT = {
  wand: ['Die Wand', '42,25 cm'], dach: ['Das Dach', 'Offener First'], decke: ['Die Decke', 'Massivholz'],
  boden: ['Der Fußboden', '21,5 cm'], hoehe: ['Raumhöhe', '2,72 m'], fenster: ['Die Fenster', 'Dreifachglas']
};
/* Was im Schnitt steckt, je Teil (Startseite, Abschnitt „Besser leben“) */
export const DETAIL = {
  wand: 'Neun Schichten, diffusionsoffen, kunststofffrei. Sie hält deine Luftfeuchtigkeit das ganze Jahr zwischen 35 und 65 Prozent, ohne Gerät, ohne Strom.',
  dach: 'Kein Dachboden, derselbe Aufbau wie in der Wand, mit Holzfaser-Zellulosedämmung. Die speichert die Hitze des Tages und gibt sie erst nachts ab, wenn du längst gelüftet hast.',
  decke: 'Massivholz und Holztram in Sichtqualität statt Beton. Sie hält die Raumfeuchte im Gleichgewicht.',
  fenster: 'Holz-Alu, dreifach verglast. Innen Holz, das du siehst und spürst. Außen Aluminium, das Wetter und Jahrzehnte aushält.',
  parkett: '21,5 cm Aufbau mit Flächenheizung statt Heizkörper. Im Winter wärmt sie von unten, im Sommer läuft dasselbe System rückwärts und kühlt lautlos.'
};

/* Leistungsumfang (leistungsumfang.html) */
export const UMFANG = {
  hero: { info: 'Der GRIFFNER Leistungsumfang', h1: 'Vergleich uns ruhig. Genau das wollen wir.', txt: 'Ein Haus vergleicht man nicht am Quadratmeterpreis, sondern an dem, was drin steckt. Deshalb legen wir alles offen. Frag beim Vergleich ruhig nach, wer da mithält.' },
  acht: { info: 'Der Unterschied', h: 'Acht Merkmale, die jedes GRIFFNER Haus ausmachen.', txt: 'Dazu begleitet dich in jedem Projekt dein persönlicher Projektmanager, von der Planung bis zur Übergabe.' }, // Runde 68 (Kunde)
  inbegriffen: ['Andere nennen es', 'Aufpreis.', 'Wir nennen es', 'inbegriffen.'], // Runde 61: Sektion entfernt (Kunde)
  /* Runde 61 (Kunde, Entwurf „GRIFFNER Projektumfang“): neuer Einstieg statt Hero, drei Teile springen zu ihren Sektionen */
  auftakt: {
    info: 'Der GRIFFNER Projektumfang', // Runde 67: Seite heißt jetzt Projektumfang (/services/projektumfang)
    h1: 'Dein Projekt endet nicht an der Haustür. Unsere Services auch nicht.',
    txt: 'Kein Projekt gleicht dem anderen. Darum stellen wir den Umfang gemeinsam mit dir zusammen, vom Grundstück über dein Haus bis zum Garten.',
    h2: 'So setzt sich dein Projekt zusammen.',
    teile: [
      { t: 'Immer dabei.', x: 'Deine persönliche Projektbegleitung von der Planung bis zur Übergabe und die Qualität, die jedes GRIFFNER Haus ausmacht.', ziel: 'u-acht' }, // Runde 67
      { t: 'Dein Ausbau.', x: 'Ausbaufertig, belagsfertig oder schlüsselfertig. Du entscheidest, wie weit wir gehen.', ziel: 'u-stufen' },
      { t: 'Rund ums Haus.', x: 'Zufahrt, Garage, Pool, Garten und Einrichtung, koordiniert mit ausgewählten Partnern.', ziel: 'u-rund' }
    ],
    /* Runde 67 (Entwurf S5Umfang): Beschriftungen in der Zeichnung bei „Immer dabei“ (Figur, Haus) */
    marken: ['Projektbegleitung', 'Qualität']
  },
  stufen: { info: 'Der Lieferumfang, schwarz auf weiß', h: 'So entsteht dein Haus.', txt: 'Ausbaufertig, belagsfertig, schlüsselfertig. Jede Stufe schließt die vorige ein. Alles, was hier steht, ist im Preis inbegriffen.' },
  dazu: {
    info: 'Dazu kommt', h: 'Was in keiner Liste steht.',
    txt: 'Manches lässt sich nicht in Positionen fassen und entscheidet trotzdem darüber, wie gut dein Haus in dreißig Jahren dasteht.',
    liste: [
      'Ein eigenes Architektur- und Designteam, das dein Zuhause mit dir plant',
      'Ein eigener Projektmanager, der dich durch die Bauphase begleitet und alles koordiniert',
      '95 % deines Hauses entstehen in der eigenen Manufaktur in Griffen',
      'Über 75 Jahre Erfahrung im Holzbau, aus einer Hand geplant und gebaut',
      'Ein Ansprechpartner für alle Gewerke, keine Koordination zwischen Firmen',
      'Trockene Bauweise ohne Trocknungszeiten, wohngesund ab dem ersten Tag',
      'Nachwachsende Baustoffe, die CO2 binden statt es freizusetzen',
      'Wertbeständig durch Massivholz, Markenprodukte und zeitloses Design',
      'Eigener Kundendienst, auch Jahre nach dem Einzug'
    ]
  },
  cta: { h: 'Willst du es ganz genau wissen?', txt: 'Im GRIFFNER Katalog: der komplette Leistungsumfang und alle Häuser. Kostenlos und unverbindlich. Und im persönlichen Gespräch gehen wir jede Position mit dir durch.' }
};

/* Ausbaustufen, wörtlich vom Leistungsumfang */
export const STUFEN = [
  {
    nr: '01', name: 'Ausbaufertig', title: 'GRIFFNER ausbaufertig', sub: 'Hülle, Dach, Fenster, Türen.',
    gruppen: [
      ['Beratung und Planung', [
        'Persönlicher Projektmanager vom ersten Schritt bis zur Übergabe',
        'Beratung durch Architektur- und Design-Profis',
        'Erhebung der Bebauungsbestimmungen für dein Grundstück',
        'Situierung des Hauses und Höhenaufnahme am Grundstück',
        'Besichtigung der Zufahrt vor der Montage',
        'Unterstützung bei allen behördlichen Wegen',
        'Begleitung bei den Fragen rund um die Finanzierung',
        'GRIFFNER Open Space: wenige Lastenpunkte ermöglichen ein flexibles Raumkonzept',
        'Einreichplanung samt Energieausweis',
        'Werkplanung deines Hauses bis ins letzte Detail',
        'Statik, abgestimmt auf Standort und Bauplatz',
        'Detaillösungen aus der Erfahrung von über 75 Jahren Holzbau',
        'Planung der Schnittstellen zu Baumeister und Eigenleistung',
        'GRIFFNER Bauleiter ab dem ersten Termin auf deinem Grundstück'
      ]],
      ['Baustelle', [
        'Kran, LKW, Gerüst und Baustellen-WC für die Montage',
        'Erhöht regensichere Dachhaut in einem Arbeitsgang, dein Haus steht von Anfang an trocken',
        'Rohbautreppe für die Bauphase',
        'Baustellenabfallentsorgung'
      ]],
      ['Die GRIFFNER Wand', [
        'Dreischaliger Aufbau, hinterlüftet, 42,25 cm stark, ohne PVC-Folien',
        'Eigene Installationsebene, Leitungen bleiben jederzeit zugänglich',
        'U-Wert 0,147 W/m²K, diffusionsoffener Aufbau',
        'Ökologische Baustoffe: Holz, Holzwerkstoffplatten, Holzfaser, Zellulose, Gipsfaserplatte',
        'Trockene Bauweise, wohngesund ab dem ersten Tag',
        'Fassade in Putz und Holz, aufwertbar auf Platte, Stein, Glas oder PV-Panel'
      ]],
      ['Fassade', [
        'Holzfassade in Lärche unbehandelt, Rhombus mit offener Fuge, aufwertbar in vorvergrauten oder dunklen Farbtönen',
        'Horizontal oder vertikal, je nach Architektur des Hauses',
        'oder Putzfassade, auf der Baustelle geputzt oder werkseitig vorgefertigt',
        'Vollflächige Fassadenbahn als zweite wasserführende Ebene',
        'Verbesserung des sommerlichen Hitzeschutzes durch hinterlüftete Fassade',
        'Sockelbleche in pulverbeschichtetem Aluminium'
      ]],
      ['Dach', [
        'Flachdach in Massivholz',
        'Sparren-Pfettendach bis zum First offen, Raumhöhen bis zu 5 m im Obergeschoss',
        'Dacheindeckung in Betondachstein',
        'Zwischensparrendämmung aus Holzfaser und Zellulose, U-Wert 0,13 W/m²K',
        'Wärmedämmung beim Flachdach, U-Wert 0,14 W/m²K',
        'Sicherheitsset für Arbeiten am Dach, für Rauchfangkehrer, PV-Installateure und Wartungspersonal',
        'Lastabtragung der PV bereits berücksichtigt'
      ]],
      ['Geschossdecke', [
        'Decken- und Dachkonstruktion für dein Haus einzeln bemessen, nach Statik und Grundriss als Massivholzdecke oder Tramdecke',
        'Massivholzdecke in Sichtqualität, Farbe frei wählbar (natur oder weiß lasiert)',
        'Sichttramdecke mit sichtbaren Balken, Farbe frei wählbar (natur oder weiß lasiert)',
        'Raumhöhe 272 cm'
      ]],
      ['Fenster', [
        'Holz-Alu-Fenster mit 3-fach-Verglasung, Ug 0,6 W/m²K',
        'Verdeckt liegende Beschläge, kein sichtbares Scharnier',
        'Innenseite in Natur lasiert, Weiß lasiert oder Schwarz, frei wählbar',
        'Verbundsicherheitsglas in allen bodentiefen Elementen',
        'Fensterbänke innen in Holz, außen in Aluminium, dicht an die Fassade angeschlossen'
      ]],
      ['Haustür', [
        'Hochwertige, robuste Haustür in Holz-Aluminium mit Seitenteil',
        'Schallschutz 27 dB, einbruchhemmende Mehrfachverriegelung',
        'Stangengriff außen, Drücker innen, Edelstahl gebürstet',
        'Elektrischer Türöffner, abgestimmt auf die Gegensprechanlage'
      ]],
      ['Beschattung und Insektenschutz', [
        'Raffstore elektrisch bedienbar, stufenlos verstellbare Z-Lamelle 60 mm',
        'Insektenschutz in Fensterfarbe, mindestens ein Element pro Raum'
      ]],
      ['Feuchtemonitoring', [
        'Feuchtemonitoring im Bad, direkt auf der Holzdecke',
        'Feuchtemonitoring im Flachdach'
      ]],
      ['Spengler', [
        'Spenglerarbeiten, Fensterbänke außen, Regenrinnen, Fallrohre, Geschoßtrennungen und Sockelbleche in beschichtetem Aluminium'
      ]],
      ['Terrasse, Carport und Überdachungen', [
        'Terrassenüberdachung lt. Plan, mit Attika, EPDM-Abdichtung im Gefälle und Attikaverblechung',
        'Carport mit Eingangsüberdachung lt. Plan, in derselben Ausführung'
      ]]
    ]
  },
  {
    nr: '02', name: 'Belagsfertig', title: 'GRIFFNER belagsfertig', sub: 'Zusätzlich zu Ausbaustufe 1.',
    gruppen: [
      ['Wärme', [
        'Wärmepumpe Viessmann Vitocal 250-A inklusive Kühlfunktion',
        'Kühlen im Sommer über dieselbe Fußbodenheizung',
        'Warmwasserspeicher 300 Liter',
        'Fußbodenheizung in allen Räumen, händisch regelbar'
      ]],
      ['Elektro', [
        'Komplette Elektroinstallation inklusive Sicherungs- und Erdungsanlage',
        'Anzahl der Auslässe lt. Plan, abgestimmt auf dein Haus',
        'Schalter und Steckdosen in hochwertigem Markendesign',
        'Alle bodengeführten Leitungen im Schutzrohr, jederzeit nachziehbar',
        'Rauchmelder in allen Wohn- und Schlafräumen',
        'Gegensprechanlage',
        'Patchkasten für das Hausnetzwerk',
        'Vorbereitung für Photovoltaik',
        'Vorbereitung für die Wallbox'
      ]],
      ['Sanitärinstallation', [
        'Sanitäre Rohinstallation in korrosionsfreiem Verbundrohr',
        'Gartenwasseranschluss mit Frostschutzarmatur',
        'Vorbereitung für Entkalkungsanlage und Zirkulationsleitung'
      ]],
      ['Estrich und Fußbodenaufbau', [
        'Fußbodenaufbau 21,5 cm in fünf Ebenen',
        'Massiv-Estrich, ummantelt jedes Heizungsrohr vollflächig',
        'Hohe Schüttungsebene, in der die Haustechnik verschwindet',
        'Wärme- und Trittschalldämmung unterhalb des Estrichs'
      ]]
    ]
  },
  {
    nr: '03', name: 'Schlüsselfertig', title: 'GRIFFNER schlüsselfertig', sub: 'Zusätzlich zu Ausbaustufe 1 und 2.',
    gruppen: [
      ['Böden, Treppe, Türen', ['Treppe und Geländer in Eiche, inklusive Setzstufen']],
      ['Bodenbelag', ['Eichenparkett als Diele, gebürstet und naturmatt versiegelt', 'Erhöhte Sesselleiste aus Massivholz, passend zum Boden']],
      ['Fliesen', [
        'Großformatige italienische Feinsteinzeugfliesen für Boden, Wand und Sockel',
        'Wandfliesen raumhoch bis 240 cm in der Dusche',
        '120 cm bei WC und Waschtisch, überall dort wo Wasser hinkommt',
        'An den übrigen Wänden Sockelfliesen, darüber freie Wandfläche in Wandfarbe',
        'Vielfältige Farbtöne zur Wahl',
        'Abschlussschienen in eloxiertem Aluminium'
      ]],
      ['Innentüren', ['Markeninnentüren in Weiß matt, gefälzt mit Umfassungszarge, 2,15 m Höhe', 'Drücker und Rosette in Edelstahl gebürstet oder Schwarz']],
      ['Sanitäreinrichtung', [
        'Sanitärkeramik und Armaturen namhafter Markenhersteller',
        'Bodengleiche Dusche 140 x 90 cm mit Edelstahlrinne',
        'Walk-In-Glasabtrennung 140 x 200 cm',
        'Showerpipe mit Kopf- und Handbrause und Thermostat',
        'Doppelwaschtisch 130 cm mit Unterschrank, vier Auszüge',
        'LED-Lichtspiegel 130 x 60 cm',
        'Wand-WC spülrandlos mit Absenkautomatik',
        'Badewanne 180 x 80 cm mit Wannenmischer und Brauseset',
        'Handwaschbecken im Gäste-WC mit Unterschrank'
      ]],
      ['Oberflächen', ['Spachtelung in Oberflächengüte Q3', 'Zweifacher deckender Anstrich mit Silikatfarbe']],
      ['Übergabe', ['Projektmanagement und Bauleitung']]
    ]
  }
];
/* EIGEN (Runde 47): je Stufe in einer Zeile, was dazukommt (Stufe 1 = Quelle). Steht unter dem Namen der Stufe. */
export const STUFEN_KURZ = ['Hülle, Dach, Fenster, Türen.', 'Wärme, Elektro, Sanitär, Estrich.', 'Böden, Fliesen, Bad, Türen, Wände.'];
/* EIGEN: was das Modell je Stufe neu zeigt (steht in der geöffneten Stufe) */
export const STUFEN_MODELL = [
  'Hülle, Dach, Fenster und Haustür stehen, innen die rohe Gipsfaserplatte und die Rohbautreppe.',
  'Dazu Wärmepumpe, Fußbodenheizung im Estrich, Elektro und Sanitär. Am Schnitt siehst du die Rohre unter dem Estrich.',
  'Dazu Eichenparkett, die Treppe in Eiche, gestrichene Wände und die Innentüren. Du kannst einziehen.'
];

/* ================= Runde 48 (10.11.2026): alles aus einer Hand ================= */
/* Kundenwunsch: GRIFFNER baut auf Wunsch alles, vom Fundament über Haus und Interior bis zu Garten, Pool und Carport.
   Das Grundstück im 3D Modell (js/grundstueck3d.js, Lage aus data/grundstueck.js) ist nach einem Gartenplan nachgebaut, ohne Namen und ohne den Plan selbst.
   EIGEN, wo nicht anders vermerkt; Q = wörtlich aus dem Leistungsumfang oder von der Startseite (hausbaugehtbesser.com). */
export const GRUND = {
  kap: 'Alles aus einer Hand',
  h: 'Vom Fundament bis zum Garten.', /* EIGEN */
  txt: 'Ein Haus steht nicht allein. Darunter liegt das Fundament, drinnen die Einrichtung, draußen Carport, Terrasse, Pool und Garten. Wir planen und bauen alles mit dir, aus einer Hand.', /* EIGEN */
  schritte: [
    { key: 'grundstueck', h: 'Dein Grundstück.', txt: 'Alles beginnt mit dem Ort. Wir klären, was auf deinem Grundstück erlaubt ist, und setzen dein Haus richtig hinein.',
      fakten: ['Erhebung der Bebauungsbestimmungen für dein Grundstück', 'Situierung des Hauses und Höhenaufnahme am Grundstück'] /* Q */ },
    { key: 'fundament', h: 'Das Fundament.', txt: 'Bevor das Haus kommt, liegt das Fundament. Abgestimmt auf Boden, Statik und Gelände.',
      fakten: ['Statik, abgestimmt auf Standort und Bauplatz', 'GRIFFNER Bauleiter ab dem ersten Termin auf deinem Grundstück'] /* Q */ },
    { key: 'haus', h: 'Das Haus.', txt: 'Eine Woche Manufaktur in Griffen, dann steht es mit Dach und Fenstern.' /* Q, Monat 7 */,
      fakten: ['95 % deines Hauses entstehen in der eigenen Manufaktur in Griffen', 'Die GRIFFNER Wand, 42,25 cm', 'Holz-Alu-Fenster, dreifach verglast'] /* Q */ },
    { key: 'innen', h: 'Innenausbau und Interior.', txt: 'Türen, Böden, Bäder. Jetzt wird es deins. Auf Wunsch planen wir mit dir auch die Einrichtung.' /* 1. Satz Q, Rest EIGEN */,
      fakten: ['Eichenparkett als Diele, gebürstet und naturmatt versiegelt', 'Ein eigenes Architektur- und Designteam, das dein Zuhause mit dir plant'] /* Q */ },
    { key: 'carport', h: 'Carport.', txt: 'Mit Eingangsüberdachung, in derselben Ausführung wie dein Haus. Du kommst trocken an die Tür.',
      fakten: ['Carport mit Eingangsüberdachung lt. Plan', 'Vorbereitung für die Wallbox'] /* Q */ },
    { key: 'terrasse', h: 'Terrasse.', txt: 'Holz unter den Füßen, ein Dach darüber, die Lounge für den Abend.',
      fakten: ['Terrassenüberdachung lt. Plan, mit Attika und EPDM-Abdichtung im Gefälle' /* Q */, 'Holzterrasse mit Lounge'] },
    { key: 'pool', h: 'Pool.', txt: 'Drei mal sieben Meter, eingelassen ins Holzdeck. Geplant mit dem Haus, nicht danach.',
      fakten: ['Pool 3 × 7 m', 'Holzdeck und Außendusche'] },
    { key: 'garten', h: 'Garten.', txt: 'Rasen, Bäume, Hecken, Kräuter vor der Küche. Der Garten wird mitgeplant, wie die Räume im Haus.',
      fakten: ['Gartenwasseranschluss mit Frostschutzarmatur' /* Q */, 'Hochbeete, Beeren, Bäume'] },
    { key: 'extras', h: 'Sauna, Glashaus, Gartenhütte.', txt: 'Die kleinen Häuser im Garten. Aus derselben Hand wie das große.',
      fakten: ['Outdoor-Sauna 2,1 × 2,6 m', 'Glashaus 2 × 3 m', 'Gartenhütte 2 × 2 m'] },
    { key: 'alles', h: 'Ein Ansprechpartner.', txt: 'Vom Fundament bis zum letzten Baum. Ein Ansprechpartner für alle Gewerke, keine Koordination zwischen Firmen.' /* 2. Satz Q (Dazu kommt) */,
      fakten: [] }
  ],
  hint: 'Tippe auf eine Nummer und sieh dich um.'
};
export const GRUND_UI = { drehen: 'Ziehen dreht das Modell', zurueck: 'Ganzes Grundstück', weiter: 'Weiter', modell: 'Grundstück im Modell', schritt: 'Schritt', naeher: 'Näher', weiter2: 'Weiter weg' };

/* Ausbaustufen als Geschichte (Runde 48): je Bereich der Teil im Haus, der hell bleibt (js/schnitthaus.js). null = ganzes Haus */
export const STUFEN_TEIL = {
  'Beratung und Planung': 'openspace', 'Baustelle': null, 'Die GRIFFNER Wand': 'wand', 'Fassade': 'fassade', 'Dach': 'dach',
  'Geschossdecke': 'decke', 'Fenster': 'fenster', 'Haustür': 'tuer', 'Beschattung und Insektenschutz': 'fenster', 'Feuchtemonitoring': 'dach',
  'Spengler': 'blech', 'Terrasse, Carport und Überdachungen': 'terrasse',
  'Wärme': 'technik', 'Elektro': 'technik', 'Sanitärinstallation': 'technik', 'Estrich und Fußbodenaufbau': 'parkett',
  'Böden, Treppe, Türen': 'treppe', 'Bodenbelag': 'parkett', 'Fliesen': null, 'Innentüren': null, 'Sanitäreinrichtung': null, 'Oberflächen': 'wand', 'Übergabe': null
};
/* EIGEN: Abschluss der drei Stufen und der Weg nach draußen (Leistungsumfang) */
export const RUND = {
  schluss: 'Schlüsselfertig. Du kannst einziehen.',
  info: 'Rund ums Haus', h: 'Und alles, was dazugehört.',
  txt: 'Schlüsselfertig ist das Haus. Auf Wunsch bauen wir weiter, vom Fundament bis zum Garten, mit demselben Ansprechpartner.',
  liste: ['Fundament', 'Das Haus', 'Innenausbau und Interior', 'Garage und Zufahrt', 'Terrasse', 'Pool', 'Garten', 'Sauna im Haus'],
  link: 'Im 3D Modell ansehen'
};

/* ================= Runde 56: Services Übersicht im Entwurf „GRIFFNER Services v2“ (Kunde, Stand 12.11.2026) =================
   Ein gepinnter Film über P 0 bis 12 mit dem Haus des Entwurfs, Einstieg „Hausbau ist komplex“, dann Besser planen (4 bis 6),
   Besser bauen (6 bis 8), Besser leben (8 bis 11), unten die Leiste in drei Teilen. Danach „Das ganze Projekt im Detail“ und das
   gelbe Feld. Texte wörtlich aus dem Entwurf (S2Services, Kopf „komplex“). */
export const FILM = {
  /* Gewichte des Entwurfs (Kopf „komplex“). Dazu (Wunsch des Kunden, Runde 55) drei schwarze Zwischentitel vor Besser planen,
     Besser bauen und Besser leben (pausen: bei P, Gewicht). Sonst eins zu eins wie im Entwurf. */
  gewichte: [2.4, 2.6, 1.4, 1, 1, 4.6, 2, 2, 2, 2.2, 2, 1],
  /* Runde 66 (Entwurf 13.11.): zwei eingeschobene Szenen, in denen P stehen bleibt (Entwurf INS): bei P 4 das Architekturkonzept
     (Tafel mit Wünschen, Alltag, Designideen), bei P 9.3 das Raumgefühl (Kamera geht ins Haus, Maße). w = Gewicht wie ein Kapitel */
  einschub: [{ p: 4, w: 1.7, key: 'stil' }, { p: 9.3, w: 1.8, key: 'raum' }],
  pausen: [
    { at: 4, w: 1, n: '01 / 03', t: 'Besser planen.' },
    { at: 6, w: 1, n: '02 / 03', t: 'Besser bauen.' },
    { at: 8, w: 1, n: '03 / 03', t: 'Besser leben.' }
  ],
  /* Einstieg „komplex“ (Entwurf hk0 bis hk5): Zeilen Wort für Wort, dazu die Wörter, die um die Baustelle kreisen */
  komplex: {
    id: 'komplex', z1: 'Hausbau ist komplex.', z2: 'Wir nehmen dir das ab.', z3: 'Nicht nur für dein Haus.', z4: 'Sondern für dein ganzes Projekt.', z5: 'GRIFFNER Services.',
    woerter: 'Grundstück. Behörden. Statik. Gewerke. Angebote. Termine. Baustelle. Kosten. Finanzierung. Vermessung. Bodengutachten. Einreichplanung. Bauverhandlung. Energieausweis. Förderungen. Verträge. Kran. Gerüst. Entsorgung. Anschlüsse. Lieferzeiten. Wetter. Nachbarn. Rechnungen. Abnahmen. Mängel. Haftung. Bauzeitplan. Baustrom. Kanal.'
  },
  /* Kapitel: ch = P des Kapitels, a/b = Bereich in P (sonst ch bis ch + 1), gr = Größe der Überschrift (m = mittel, s = klein, l = groß) */
  kapitel: [
    { ch: '4', id: 'machbarkeit', h: 'Machbarkeitsanalyse.', txt: 'Vor Ort prüfen wir Baurecht und Grundstück und zeigen dir, wie dein Haus dort am besten zur Geltung kommt.', gr: 's' },
    { ch: '5', a: 5, b: 5.2, id: 'budget', h: 'Budgetanalyse.', txt: 'Wir zeigen dir, was dein Budget ermöglicht, und bringen deine Wünsche und die Kosten in Einklang.', gr: 's' },
    { ch: '5.25', a: 5.2, b: 5.5, id: 'entwurf', h: 'Entwurfsplanung.', txt: 'Aus Stil, Grundstück und Budget entwickelt unser Architekturteam deinen Entwurf. Für dein Haus, frei geplant nach dem Open-Space-Prinzip, und für die Außenanlagen gleich mit.', gr: 's' },
    { ch: '5.5', a: 5.5, b: 5.78, id: 'innenarchitektur', h: 'Innenarchitektur.', txt: 'Von der Raumgestaltung bis zur Einrichtung entwickeln unsere Innenarchitekten ein Interieur, das zu dir und deinem Leben passt.', gr: 's' },
    { ch: '5.75', a: 5.78, b: 6, id: 'gesamt', h: 'Gesamtinvestition.', txt: 'Haus, Außenanlagen und alle Gewerke in einer klaren Übersicht. Eine verlässliche Grundlage für deine Entscheidung.', gr: 's' },
    /* Runde 66 (Entwurf 13.11.): Besser bauen = Projektsteuerung (mit Verlauf Kosten, Qualität, Termine), Baumanagement (Baustelle bis Außenanlagen), Projektmanager.
       Besser leben beginnt mit dem Bausystem (vorher Gebäudehülle) */
    { ch: '6', a: 6, b: 6.6, id: 'steuerung', h: 'Projektsteuerung.', txt: 'Von den Behördenwegen bis zu den Planungsbesprechungen behalten wir Kosten, Qualität und Termine in jeder Phase fest im Blick.', gr: 's' },
    { ch: '6.5', a: 6.6, b: 7.5, id: 'baumanagement', h: 'Baumanagement.', txt: 'Auf der Baustelle sorgen wir dafür, dass alles ineinandergreift, vom Unterbau über die Montage deines Hauses bis zu den Außenanlagen.', gr: 's' },
    { ch: '7.5', a: 7.5, b: 8, id: 'pm', h: 'Projektmanager.', txt: 'Ein persönlicher Ansprechpartner, der dein Vorhaben kennt und dich durch jede Phase begleitet.', gr: 's' },
    { ch: '8', a: 8, b: 9, id: 'bausystem', h: 'Bausystem.', txt: 'Wand, Dach und Decke aus natürlichen Materialien, die Feuchtigkeit aufnehmen und wieder abgeben. Für ein gesundes Raumklima zu jeder Jahreszeit.', gr: 'm' },
    { ch: '9', a: 9, b: 10, id: 'ausstattung', h: 'Innenausstattung.', gr: 'm',
      hot: [['parkett', 'Eichenparkett'], ['fliesen', 'großformatige italienische Fliesen'], ['bad', 'Bäder namhafter Hersteller']], nach: 'Materialien, deren Qualität man jeden Tag spürt.' },
    { ch: '10.2', a: 10, b: 10.5, id: 'betrieb', h: 'Betriebskosten.', txt: 'Eine sorgfältig gedämmte Gebäudehülle und dreifach verglaste Fenster halten den Energiebedarf dauerhaft niedrig, Jahr für Jahr.', gr: 'm' },
    { ch: '10.5', a: 10.5, b: 11, id: 'kundendienst', h: 'Kundenservice.', txt: 'Auch nach dem Einzug bleibt unser eigener Kundenservice an deiner Seite, wann immer du uns brauchst.', mw: 10 },
    { ch: '11', id: 'haltung', h: 'Wir bauen nicht hundertmal dasselbe Haus.', einmal: ['Wir bauen ', 'deins.', ' Einmal.'], gr: 'l' }
  ],
  /* Runde 57: Gesamtinvestition als Tabelle rechts (Entwurf data-ledger): je Zeile Name, Betrag (nur für die Länge der Balken:
     Wurzel des Anteils am größten Posten), Farbe, ab P, Umriss. Darunter „Gesamtinvestition“ mit einem Balken aus allen Posten.
     Solange die Tabelle steht, blendet das 3D aus (wie im Entwurf). */
  /* Runde 66 (Entwurf 13.11.): im Balken aus allen Posten steht das Haus gekürzt (segMax), damit die kleinen Posten lesbar bleiben */
  summe: { k: 'Gesamtinvestition', segMax: 300000, zeilen: [
    ['Bodenplatte', 64000, '#CACACA', 5.83], ['Haus', 598000, '#FFFFFF', 5.84], ['Garage', 46000, '#CACACA', 5.852], ['Zufahrt', 18000, '#444442', 5.864, 1],
    ['Terrasse', 24000, '#CFC3B3', 5.876], ['Pool', 62000, '#CACACA', 5.888], ['Sauna', 21000, '#887254', 5.9], ['Garten', 48000, '#8B907C', 5.912]
  ] },
  /* Runde 66 (Entwurf 13.11.): Architekturkonzept (eingeschoben bei P 4). Tafel mit drei Spalten (Wünsche, Alltag, Designideen) und neun
     gezeichneten Dingen; ein gelbes Feld wählt Viel Licht, Satteldach und Holz, die fliegen in die Hauszeichnung */
  konzept: { h: 'Architekturkonzept.', txt: 'Aus deinen Wünschen, deinem Alltag und deinen Designideen entwickelt unser Architekturteam das Konzept für dein Haus.',
    koepfe: ['Wünsche', 'Alltag', 'Designideen'], dinge: ['Satteldach', 'Flachdach', 'Kochen', 'Terrasse', 'Arbeiten', 'Viel Licht', 'Kamin', 'Holz', 'Schlafen'] },
  /* Runde 66: Projektsteuerung rechts (Entwurf data-psteu): Phasen oben, drei Linien (Kosten, Qualität, Termine) werden hinter dem gelben
     Strich ruhig, unten die Schritte, der aktuelle steht unter dem Strich */
  steuerung: { phasen: ['Planung', 'Behörden', 'Bau', 'Übergabe'], linien: ['Kosten', 'Qualität', 'Termine'], schritte: ['Behördenweg', 'Planungsbesprechung', 'Vergabe', 'Baustart', 'Montage', 'Abnahme'] },
  /* Runde 66: Raumgefühl (eingeschoben bei P 9.3): Kamera ins Haus, gelbe Maße, das gerade gemessene Stück im Satz gelb unterstrichen */
  /* Satz = u1 z1 u2 z2 u3 z3 (u gelb unterstrichen, wenn gemessen; zwischen u1, z1, u2 und nach z2 je ein Leerzeichen) */
  raum: { h: 'Raumgefühl.', u: ['Holz-Alu-Fenster', '2,72 Meter Raumhöhe', 'offenem First sogar bis zu fünf Meter'], z: ['und', ', bei', '. Räume voller Licht und Weite.'], masse: ['2,40 m', '2,72 m', 'bis 5,00 m'] },
  /* Sprungmarken im Film als P (die Seite rechnet daraus die Lage mit den Zwischentiteln). s-planen, s-bauen, s-leben: Zwischentitel */
  marken: [['s-ueberblick', 3.5], ['s-projektcheck', 4.3], ['s-projektplan', 5.05], ['s-hausplanung', 5.3], ['s-innen', 5.6], ['s-aussen', 5.86], ['s-fundament', 6.05], ['s-pm', 7.6], ['s-bausystem', 8.1], ['s-kundendienst', 10.6]],
  /* Leiste unten: drei Teile mit Bereich in P und Unterzeilen [bis P, Name] (Entwurf). Sprung zum Zwischentitel des Teils */
  leiste: [
    { name: 'Besser planen.', href: 's-planen', r: [4, 6], sub: [[5, 'Machbarkeit'], [5.2, 'Budgetanalyse'], [5.5, 'Entwurfsplanung'], [5.78, 'Innenarchitektur'], [6, 'Gesamtinvestition']] },
    { name: 'Besser bauen.', href: 's-bauen', r: [6, 8], sub: [[6.6, 'Projektsteuerung'], [7.5, 'Baumanagement'], [8, 'Projektmanager']] },
    { name: 'Besser leben.', href: 's-leben', r: [8, 11], sub: [[9, 'Bausystem'], [10, 'Innenausstattung'], [10.5, 'Betriebskosten'], [11, 'Kundenservice']] }
  ],
  /* Runde 66: Unterzeilen der Leiste während der eingeschobenen Szenen */
  leisteEin: { stil: 'Architekturkonzept', raum: 'Raumgefühl' },
  zurueck: '← Zurück zum Haus',
  /* Punkte im Haus (Ausstattung): Titel, Text, zwei Fakten. Wörtlich aus dem Entwurf */
  punkte: {
    parkett: { t: 'Eichenparkett.', x: 'Echtes Eichenparkett, kein Dekor auf Folie. Abschleifbar, und mit den Jahren schöner.', f: [['Eiche', 'Echtholz, abschleifbar'], ['Üblich', 'Laminat oder Vinyl']] },
    fliesen: { t: 'Italienische Fliesen.', x: 'Ruhige, großformatige Fliesen aus Italien, gemacht für Jahrzehnte.', f: [['Italien', 'Großformatig, wenige Fugen'], ['Langlebig', 'Für Jahrzehnte']] },
    bad: { t: 'Bäder mit Markenarmaturen.', x: 'Hier beginnt und endet dein Tag. Darum planen wir das Bad mit dir und statten es mit Armaturen namhafter Hersteller aus.', f: [['Markenarmaturen', 'Namhafte Hersteller'], ['Geplant', 'Mit unserem Designteam']] }
  },
  /* Beschriftungen im Modell [Schlüssel, Titel, Zeile, von P, bis P, {Art}], wörtlich aus dem Entwurf (svcLabels, Kopf „komplex“).
     a: Anker im Modell (sonst der Schlüssel), free: Marke steht an ihrem Punkt, stack: Spalte neben dieser Überschrift (Desktop),
     pr: Zeit in Seiten-P, kst: Kostenstapel, left: links vom Punkt, noline: ohne Strich, avoid: weicht anderen aus,
     ph: 0 = am Telefon aus (Runde 59, Kunde: die Marken bei „Nicht nur für dein Haus“ wandern dort und zeigen daneben) */
  marken3d: [
    ['v-zufahrt', 'Zufahrt.', '', 1.57, 2.5, { a: 'carport', free: 1, pr: 1, fd: .04, avoid: 1, ph: 0 }], ['v-zaun', 'Zaun.', '', 1.68, 2.5, { a: 'zaun', free: 1, pr: 1, fd: .04, avoid: 1, ph: 0 }],
    ['v-garage', 'Garage.', '', 1.78, 2.5, { a: 'garage', free: 1, pr: 1, fd: .04, avoid: 1, ph: 0 }], ['v-terrasse', 'Terrasse.', '', 1.88, 2.5, { a: 'terrasse', free: 1, pr: 1, fd: .04, avoid: 1, ph: 0 }],
    ['v-pool', 'Pool.', '', 1.98, 2.5, { a: 'pool', free: 1, pr: 1, fd: .04, avoid: 1, ph: 0 }], ['v-garten', 'Garten.', '', 2.08, 2.5, { a: 'garten', free: 1, pr: 1, fd: .04, avoid: 1, ph: 0 }],
    ['v-sauna', 'Sauna.', '', 2.18, 2.5, { a: 'sauna', free: 1, pr: 1, fd: .04, avoid: 1, ph: 0 }],
    ['lay-plan', 'Planung', 'Machbarkeit, Budget, Entwurf.', 3.3, 3.98, { kind: 'layer', e: [0, 1], jump: 's-projektcheck' }],
    ['lay-fund', 'Bauleitung', 'Kosten, Qualität, Termine.', 3.38, 3.98, { kind: 'layer', e: 2, jump: 's-fundament' }],
    ['lay-huelle', 'Holzbau', 'Wand, Dach, Decke.', 3.42, 3.98, { kind: 'layer', e: 3, jump: 's-bausystem' }],
    ['lay-innen', 'Innenarchitektur', 'Material, Farbe, Licht.', 3.46, 3.98, { kind: 'layer', e: 4, jump: 's-innen' }],
    ['lay-aussen', 'Außenanlagen', 'Zufahrt, Pool, Garten.', 3.5, 3.98, { kind: 'layer', e: 5, jump: 's-aussen' }],
    ['lay-key', 'Projektmanager', 'Einer für alles.', 3.54, 3.98, { a: 'key', kind: 'layer', e: 6, jump: 's-pm' }],
    ['gelaende', 'Gelände', 'Vor Ort vermessen', 4.3, 4.44],
    ['flaeche', 'Grundstück', '768 m²', 4.44, 4.72], ['dimx', '32,00 m', '', 4.42, 4.72], ['dimz', '24,00 m', '', 4.46, 4.72],
    ['huell', 'Baurecht', 'Geprüft', 4.56, 4.76], ['boden', 'Baugrund', 'Vor Ort geprüft', 4.6, 4.74],
    ['sonne', 'Ausrichtung', 'Sonne über den Tag', 4.8, 5, { free: 1, fd: .04, avoid: 1 }], ['blick', 'Aussicht', 'Der schönste Blick', 4.9, 5, { free: 1, fd: .03, avoid: 1 }],
    ['ghost', 'Dein Haus', 'Am besten Platz', 4.91, 5, { free: 1, fd: .03, avoid: 1 }],
    ['k-haus', 'Haus', '', 5.018, 5.198, { pr: 1, free: 1, fd: .008, kst: 1 }], ['k-garage', 'Garage', '', 5.027, 5.198, { pr: 1, free: 1, fd: .008, kst: 1 }],
    ['k-zufahrt', 'Zufahrt', '', 5.036, 5.198, { pr: 1, free: 1, fd: .008, kst: 1 }], ['k-terrasse', 'Terrasse', '', 5.045, 5.198, { pr: 1, free: 1, fd: .008, kst: 1 }],
    ['k-pool', 'Pool', '', 5.054, 5.198, { pr: 1, free: 1, fd: .008, kst: 1 }], ['k-sauna', 'Sauna', '', 5.063, 5.128, { pr: 1, free: 1, fd: .008, kst: 1, strike: [5.3975, 5.4075] }],
    ['k-garten', 'Garten', '', 5.072, 5.198, { pr: 1, free: 1, fd: .008, kst: 1 }],
    ['k-top', 'Kosten', '', 5.012, 5.198, { pr: 1, free: 1, fd: .008, kst: 1, center: 1, noline: 1 }], ['budget', 'Budget', '', 5.012, 5.198, { pr: 1, free: 1, fd: .008, kst: 1, center: 1, noline: 1 }],
    ['lvl', 'Im Einklang', '', 5.17, 5.2, { pr: 1, free: 1, fd: .008, kst: 1, center: 1, noline: 1 }],
    ['pm-key', 'Dein Projektmanager', 'Durch jede Phase', 10.3, 10.5, { a: 'key' }]
  ],
  modell: 'Ein GRIFFNER Haus',
  /* Nach dem Film: drei Wege ins Detail (in Framer eine native Sektion). Runde 56 (Kunde): nur der Leistungsumfang hat einen Link,
     die Seiten Besser planen und Besser bauen gibt es noch nicht */
  /* Runde 61 (Kunde): Planungsleistungen und Bauleistungen entfernt, nur der Leistungsumfang als Box */
  weiter: { h: 'Das ganze Projekt im Detail.', karten: [
    { k: 'Für alle, die es genau wissen wollen', t: 'Projektumfang.', x: 'Jede Leistung im Detail. Was serienmäßig dabei ist und was du dazu wählen kannst.', l: 'Zum Projektumfang', href: 'projektumfang.html' } // Runde 67: Seite umbenannt
  ] },
  /* Nur der Knopf (Entwurf) */
  cta: { h: 'Starte mit dem Projektcheck.', txt: 'Kostenlos, unverbindlich und mit einem Ergebnis, das du in der Hand hältst.', btn: 'Projektcheck anfragen', btnHref: 'https://griffner.com/contact' }
};
