/* Services (Entwurf, Runde 45): alle Texte der beiden Seiten leistungen.html (Übersicht) und leistungsumfang.html (Leistungsumfang).
   Quelle: hausbaugehtbesser.com (Startseite) und hausbaugehtbesser.com/leistungsumfang, Stand 10.11.2026, wörtlich übernommen.
   Eigene Zeilen (nicht aus der Quelle) sind mit EIGEN markiert und in TEXTE.md gelistet. Du-Form, keine Gedankenstriche, kein Ausrufezeichen. */

/* Die acht Dinge, Reihenfolge wie auf /leistungsumfang. key = Teil im 3D Haus (js/schnitthaus.js, Concept Bold) und Muster (js/muster3d.js) */
export const ACHT = [
  {
    key: 'openspace', nr: '01', name: 'Patentiertes Open Space Konzept', kurz: 'Open Space, patentiert',
    claim: 'Keine Innenwand trägt. Der Grundriss folgt deinem Leben.',
    griffner: 'Wenige Lastenpunkte ermöglichen ein flexibles Raumkonzept. Der Grundriss folgt deinem Leben.',
    ueblich: 'Tragende Innenwände. Jede Änderung kostet einen Aufpreis.',
    fakten: ['2 Ableitungspunkte', '9,80 m Raumbreite ohne Wand', '0 tragende Innenwände'],
    bild: 'assets/img/wald-innen.jpg', alt: 'Offener Wohnraum mit Sofa, Essplatz und großen Fenstern zum Wald'
  },
  {
    key: 'wand', nr: '02', name: 'Die GRIFFNER Wand', kurz: 'Die GRIFFNER Wand',
    claim: 'Neunschichtig, diffusionsoffen. Gesünder wohnen, ein Leben lang.',
    griffner: '42,25 cm aus Holz, Holzfaser und Zellulose, diffusionsoffen. Natürliche Dampfbremse, keine Folien. Sie regelt die Feuchte von selbst.',
    ueblich: 'Dünnere Wand mit Kunststoffdämmung.',
    fakten: ['42,25 cm stark', 'U-Wert 0,147 W/m²K', 'ohne PVC-Folien'],
    bild: 'assets/img/svc-wand.jpg', alt: 'Ein Mitarbeiter in der Manufaktur in Griffen an einem Wandelement'
  },
  {
    key: 'dach', nr: '03', name: 'Dach mit Holzfaser-Zellulosedämmung', kurz: 'Dach mit Holzfaser-Zellulosedämmung',
    claim: 'Draußen 34 Grad, im Schlafzimmer angenehm. Ohne Klimagerät.',
    griffner: 'Die Holzfaser-Zellulosedämmung speichert die Hitze des Tages und gibt sie erst nachts ab. Draußen 34 Grad, oben schläfst du.',
    ueblich: 'Leichte Dämmung, das Dachgeschoß heizt sich auf.',
    fakten: ['U-Wert 0,13 W/m²K', 'bis zum First offen', 'Raumhöhen bis zu 5 m im Obergeschoss'],
    bild: 'assets/img/duene-2.jpg', alt: 'Haus mit Satteldach und Holzfassade in den Dünen'
  },
  {
    key: 'fenster', nr: '04', name: 'Holz-Alu-Fenster', kurz: 'Holz-Alu-Fenster',
    claim: 'Dreifachverglasung, innen Holz in Natur, Weiß oder Schwarz lasiert, außen Aluminium.',
    griffner: 'Dreifachverglasung, verdeckte Beschläge. Innen Holz, außen Aluminium, das ohne Anstrich auskommt.',
    ueblich: 'Kunststofffenster in Weiß, innen wie außen.',
    fakten: ['Ug 0,6 W/m²K', 'verdeckt liegende Beschläge', 'innen Natur, Weiß oder Schwarz'],
    bild: 'assets/img/wald-fenster.jpg', alt: 'Holzfenster mit Blick in den Wald, davor ein Vorhang'
  },
  {
    key: 'decke', nr: '05', name: 'Sichtbare Holzdecke', kurz: 'Sichtbare Massivholzdecke',
    claim: 'Echtes Holz über dir, in Sichtqualität, statt abgehängtem Gipskarton.',
    griffner: 'Massivholz oder Tram, natur oder weiß lasiert. Du entscheidest, welche Struktur über dir liegt.',
    ueblich: 'Abgehängte Gipsdecke, weiß gestrichen.',
    fakten: ['Massivholz oder Tram', 'natur oder weiß lasiert', 'in Sichtqualität'],
    bild: 'assets/img/svc-decke.jpg', alt: 'Wohnraum mit sichtbarer Holzdecke, Balken und offener Galerie'
  },
  {
    key: 'parkett', nr: '06', name: 'Naturparkettböden', kurz: 'Naturparkettböden',
    claim: 'Echtes Eichenparkett, kein Dekor auf Folie.',
    griffner: 'Echtes Eichenparkett, kein Dekor auf Folie. Abschleifbar, und mit den Jahren schöner.',
    ueblich: 'Laminat oder Vinyl, austauschbar statt reparierbar.',
    fakten: ['Eiche als Diele', 'gebürstet, naturmatt versiegelt', '21,5 cm Aufbau mit Flächenheizung'],
    bild: 'assets/img/wald-sessel.jpg', alt: 'Sessel auf Eichenparkett vor einem großen Fenster'
  },
  {
    key: 'raumhoehe', nr: '07', name: 'Raumhöhe 2,72 Meter', kurz: 'Raumhöhe 2,72 Meter',
    claim: '22 cm mehr als üblich, in jedem Raum. Für spürbare Weite.',
    griffner: '22 cm mehr als üblich, in jedem Raum. Auf Wunsch 2,92 Meter.',
    ueblich: '250 cm, im Obergeschoß oft weniger.',
    fakten: ['2,72 m in jedem Raum', 'auf Wunsch 2,92 m', '22 cm mehr als üblich'],
    bild: 'assets/img/svc-hoehe.jpg', alt: 'Hoher, heller Raum mit Treppe und großen Fenstern'
  },
  {
    key: 'fassade', nr: '08', name: 'Fassade in Holz oder Putz', kurz: 'Fassade in Holz oder Putz',
    claim: 'Frei kombinierbar, mit vielen Gestaltungsmöglichkeiten. Immer hinterlüftet.',
    griffner: 'Lärche, Putz oder beides. Für eine flexible Gestaltung. Immer hinterlüftet.',
    ueblich: 'Holz nur gegen Aufpreis.',
    fakten: ['Lärche oder Putz', 'immer hinterlüftet', 'Fassadenbahn als zweite wasserführende Ebene'],
    bild: 'assets/img/wald-eingang.jpg', alt: 'Eingang mit senkrechter Holzfassade aus Lärche'
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
  haus: 'Haus mit Satteldach im Schnitt', drehen: 'Ziehen dreht das Haus', ganzesHaus: 'Ganzes Haus',
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
  acht: { info: 'Der Unterschied', h: 'Acht Dinge, die bei uns immer dabei sind.', txt: 'In jeder Ausbaustufe, ohne Sternchen. Anderswo verursachen sie einen Aufpreis oder es gibt sie gar nicht.' },
  inbegriffen: ['Andere nennen es', 'Aufpreis.', 'Wir nennen es', 'inbegriffen.'],
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

/* ================= Runde 49: Services Übersicht im Design v2 (Kunde, „GRIFFNER Services v2“, 11.11.2026) =================
   Ein gepinnter Film über das Haus (Runde 52: wieder der Film des Entwurfs v2, das Haus ist Concept Free), zwölf Kapitel, unten die Leiste in drei Teilen,
   danach das gelbe Feld „Starte mit dem Projektcheck“. Texte wörtlich aus dem Entwurf (S2Services). Kapitel k mit Gewicht
   (Bildschirmhöhen je Einheit 1,5): 5 und 10 haben zwei Hälften (5 / 5.5, 10 / 10.5). */
export const FILM = {
  /* Runde 55 (Kunde, 2026-11-12): neuer Entwurf „GRIFFNER Services v2“ (S2Services). Der Film läuft wie im Entwurf über P 0 bis 12 mit
     den Gewichten des Entwurfs. Dazu (Wunsch des Kunden) drei schwarze Zwischentitel vor Besser planen, Besser bauen und Besser leben
     (pausen: bei P, Gewicht), die Leiste unten größer, die Links in den Kapiteln entfernt. Texte wörtlich aus dem Entwurf. */
  gewichte: [1.6, 1.6, 1, 1, 1, 4.6, 2, 2, 2, 2.2, 2, 1],
  pausen: [
    { at: 4, w: 1, n: '01 / 03', t: 'Besser planen.' },
    { at: 6, w: 1, n: '02 / 03', t: 'Besser bauen.' },
    { at: 8, w: 1, n: '03 / 03', t: 'Besser leben.' }
  ],
  /* Einstieg: vier Zeilen, Wort für Wort (Entwurf hb0 bis hb3). Das Wort „Produkt“ wird durchgestrichen, „Leben“ gelb unterstrichen */
  hero: { id: 'produkt', k: 'Services', h1: 'Hausbau wird oft wie ein Produkt behandelt.', h2: 'Wir behandeln ihn wie das, was er ist: dein Leben.', t1: 'Und dein Leben hört nicht an der Haustür auf.', t2: 'Unsere Services auch nicht.', strike: 'Produkt', unter: 'Leben' },
  /* Kapitel: ch = P des Kapitels, a/b = Bereich in P (sonst ch bis ch + 1), gr = Größe der Überschrift (m = mittel, s = klein, l = groß) */
  kapitel: [
    { ch: '2', id: 'projekt', h: 'Wir denken dein ganzes Projekt.', txt: 'Vom Grundstück bis zum Schlüssel. Auch das, was du selbst beauftragst oder erst später baust.', mw: 10 },
    { ch: '3', id: 'ueberblick', h: 'Alles, was dein Projekt braucht.', txt: 'Ein Plan für alles. Ein Projektmanager, der ihn zusammenhält.', mw: 9, pw: 24 },
    { ch: '4', id: 'machbarkeit', h: 'Machbarkeitsanalyse.', txt: 'Wir prüfen vor Ort, ob dein Projekt auf deinem Grundstück, mit deinen Wünschen und in deinem Budget aufgeht.', gr: 's' },
    { ch: '5', a: 5, b: 5.19, id: 'bebauung', h: 'Bebauungsstudie für dein ganzes Grundstück.', txt: 'Was sofort kommt, was später und was irgendwann. Alles gedacht, nicht alles auf einmal.', gr: 's' },
    { ch: '5.25', a: 5.19, b: 5.38, id: 'budget', h: 'Budgetanalyse.', txt: 'Haus, Garage, Zufahrt, Garten: Du siehst von Anfang an, was dein ganzes Projekt kostet.', gr: 's' },
    { ch: '5.5', a: 5.38, b: 5.571, id: 'entwurf', h: 'Entwurfsplanung.', txt: 'Unser Architekturteam entwirft dein Haus gemeinsam mit dir. Für dein Grundstück und dein Leben, nicht aus der Schublade.', gr: 's' },
    { ch: '5.75', a: 5.571, b: 5.666, id: 'openspace', h: 'Open Space® Planungsprinzip.', txt: 'Wenige tragende Wände, viel Freiheit. Du planst deinen Grundriss nach deinem Leben.', gr: 's' },
    { ch: '5.8', a: 5.666, b: 5.905, id: 'innenarchitektur', h: 'Innenarchitektur.', txt: 'Innenarchitekten begleiten dich bei Materialien und Farben, damit dein Haus innen genauso stimmig wird wie außen.', gr: 'm' },
    { ch: '5.875', a: 5.905, b: 6, id: 'gesamtkosten', h: 'Gesamtkosten­investition.', txt: 'Am Ende der Planung kennst du die Investition für dein ganzes Projekt. Haus, Garage, Zufahrt und Garten in einer Zahl, bevor gebaut wird.', gr: 's' },
    { ch: '6', a: 6, b: 6.5, id: 'gu', h: 'Generalunternehmer­leistungen.', txt: 'Bodenplatte, Zaun, Zufahrt und weitere Inklusivleistungen.', gr: 'm' },
    { ch: '6.5', a: 6.5, b: 7.5, id: 'pmgt', h: 'Projekt­management.', txt: 'Wir überwachen Kosten, Termine und Qualität und führen die Behördengespräche für dich.', gr: 'm' },
    { ch: '7.5', a: 7.5, b: 8, id: 'pm', h: 'Projektmanager.', txt: 'Dein Projektmanager hält alles zusammen und dich am Laufenden, vom ersten Plan bis zur Schlüsselübergabe. Du musst nicht wissen, wen du anrufen sollst. Er ruft dich an.', mw: 10 },
    { ch: '8', a: 8, b: 9, id: 'bausystem', h: 'Gesundes Bausystem.', txt: 'Wände, Decken und Dach aus Holz und natürlichen Dämmstoffen. Für ein Raumklima, das Sommer wie Winter im Gleichgewicht bleibt.', gr: 'm' },
    { ch: '9', a: 9, b: 10, id: 'ausstattung', h: 'Hochwertige Ausstattung.', gr: 'm',
      hot: [['fenster', 'Holz-Alu-Fenster'], ['parkett', 'Eichenparkett'], ['fliesen', 'italienische Fliesen'], ['bad', 'Bäder mit Markenarmaturen']], hint: 'Tippe auf ein Detail' },
    { ch: '10.2', a: 10, b: 10.5, id: 'betrieb', h: 'Niedrige Betriebs- und Erhaltungs­kosten.', txt: 'Unsere Häuser erzeugen über das Jahr mehr Energie, als sie verbrauchen. Was du nicht selbst brauchst, fließt ins Netz.', gr: 'm',
      bal: ['Erzeugung', 'Verbrauch', 'Über das Jahr ist die Erzeugung größer als der Verbrauch.'] },
    { ch: '10.5', a: 10.5, b: 11, id: 'kundendienst', jahr: 'Jahr', h: 'Eigener Kundenservice.', bt: 'Kundendienst.', txt: 'Unser Kundendienst kennt dein Haus und ist da, wenn etwas ist. Auch Jahre nach dem Einzug.', mw: 10 },
    { ch: '11', id: 'haltung', h: 'Wir bauen nicht hundertmal dasselbe Haus.', einmal: ['Wir bauen ', 'deins.', ' Einmal.'], gr: 'l' }
  ],
  /* Sprungmarken im Film als P (die Seite rechnet daraus die Lage mit den Zwischentiteln). s-planen, s-bauen, s-leben: Zwischentitel */
  marken: [['s-ueberblick', 3.5], ['s-projektcheck', 4.3], ['s-aussen', 5.06], ['s-projektplan', 5.06], ['s-hausplanung', 5.45], ['s-fundament', 6.15], ['s-pm', 7.6], ['s-bausystem', 8.1], ['s-innen', 9.1], ['s-kundendienst', 10.6]],
  /* Leiste unten: drei Teile mit Bereich in P und Unterzeilen [bis P, Name] (Entwurf). Sprung zum Zwischentitel des Teils */
  leiste: [
    { name: 'Besser planen.', href: 's-planen', r: [4, 6], sub: [[5, 'Machbarkeit'], [5.19, 'Bebauungsstudie'], [5.38, 'Budgetanalyse'], [5.571, 'Entwurfsplanung'], [5.666, 'Open Space®'], [5.905, 'Innenarchitektur'], [6, 'Gesamtkosten']] },
    { name: 'Besser bauen.', href: 's-bauen', r: [6, 8], sub: [[6.5, 'Generalunternehmer'], [7.5, 'Projektmanagement'], [8, 'Projektmanager']] },
    { name: 'Besser leben.', href: 's-leben', r: [8, 11], sub: [[9, 'Bausystem'], [10, 'Ausstattung'], [10.5, 'Betriebskosten'], [11, 'Kundenservice']] }
  ],
  zurueck: '← Zurück zum Haus',
  /* Punkte im Haus (Ausstattung): Titel, Text, zwei Fakten. Wörtlich aus dem Entwurf */
  punkte: {
    fenster: { t: 'Holz-Alu-Fenster.', x: 'Innen Holz, außen Aluminium, das ohne Anstrich auskommt. Dreifach verglast, mit verdeckt liegenden Beschlägen.', f: [['Ug 0,6', 'W/m²K, 3-fach-Verglasung'], ['Raffstore', 'Elektrisch, Z-Lamelle 60 mm']] },
    parkett: { t: 'Eichenparkett.', x: 'Echtes Eichenparkett, kein Dekor auf Folie. Abschleifbar, und mit den Jahren schöner.', f: [['Eiche', 'Echtholz, abschleifbar'], ['Üblich', 'Laminat oder Vinyl']] },
    fliesen: { t: 'Italienische Fliesen.', x: 'Ruhige, großformatige Fliesen aus Italien, gemacht für Jahrzehnte.', f: [['Italien', 'Großformatig, wenige Fugen'], ['Langlebig', 'Für Jahrzehnte']] },
    bad: { t: 'Bäder mit Markenarmaturen.', x: 'Hier beginnt und endet dein Tag. Darum planen wir das Bad mit dir und statten es mit Armaturen namhafter Hersteller aus.', f: [['Markenarmaturen', 'Namhafte Hersteller'], ['Geplant', 'Mit unserem Designteam']] }
  },
  /* Beschriftungen im Modell [Schlüssel, Titel, Zeile, von P, bis P, {Art}], wörtlich aus dem Entwurf. a: Anker im Modell (sonst der
     Schlüssel), free: Marke steht an ihrem Punkt, stack: Spalte neben dieser Überschrift (Desktop), pr: Zeit in Seiten-P, strike: durchgestrichen */
  marken3d: [
    ['h-modell', 'Modell 142', 'Satteldach, 142 m²', -.5, .52, { a: 'dach', strike: [.24, .34], t0: 1.4, free: 1, stack: '[data-hero] h1' }],
    ['h-preis', 'Ab 389.000 €', 'Belagsfertig', -.5, .52, { a: 'fassade', strike: [.27, .37], t0: 1.7, free: 1, stack: '[data-hero] h1' }],
    ['h-extras', 'Extras', 'Gegen Aufpreis', -.5, .52, { a: 'decke', strike: [.3, .4], t0: 2, free: 1, stack: '[data-hero] h1' }],
    ['au-terrasse', 'Terrasse', '', 1.52, 1.97, { a: 'terrasse', free: 1 }], ['au-carport', 'Garage und Zufahrt', '', 1.58, 1.97, { a: 'carport', free: 1 }],
    ['au-pool', 'Pool', '', 1.64, 1.97, { a: 'pool', free: 1 }], ['au-sauna', 'Sauna', 'Im Haus', 1.7, 1.97, { a: 'sauna', free: 1 }], ['au-garten', 'Garten', '', 1.76, 1.97, { a: 'garten', free: 1 }],
    ['lay-plan', 'Projektplanung', 'Budget, Baurecht, Schritte und Architektur.', 3.3, 3.98, { kind: 'layer', jump: 's-projektcheck' }],
    ['lay-fund', 'Fundament', 'Die Bodenplatte ist serienmäßig.', 3.38, 3.98, { kind: 'layer', jump: 's-fundament' }],
    ['lay-huelle', 'Exterior', 'Gesünder wohnen geht nicht.', 3.42, 3.98, { kind: 'layer', jump: 's-bausystem' }],
    ['lay-innen', 'Interior', 'Parkett, Fliesen, Bad, Türen.', 3.46, 3.98, { kind: 'layer', jump: 's-innen' }],
    ['lay-aussen', 'Rund ums Haus', 'Zufahrt, Pool, Sauna, Garten.', 3.5, 3.98, { kind: 'layer', jump: 's-aussen' }],
    ['lay-key', 'Projektmanager', 'Vom Vertrag bis zum Schlüssel.', 3.54, 3.98, { kind: 'layer', jump: 's-pm' }],
    ['flaeche', 'Grundstück', '768 m²', 4.3, 5], ['dimx', '32,00 m', '', 4.45, 5], ['dimz', '24,00 m', '', 4.5, 5],
    ['bau', 'Baufenster', 'Baurecht geprüft', 4.6, 5], ['boden', 'Baugrund', 'Vor Ort geprüft', 4.7, 5],
    ['bs-carport', 'Garage und Zufahrt', '', 5.05, 5.25, { a: 'carport', free: 1 }], ['bs-terrasse', 'Terrasse', '', 5.08, 5.25, { a: 'terrasse', free: 1 }],
    ['bs-pool', 'Pool', '', 5.11, 5.25, { a: 'pool', free: 1 }], ['bs-sauna', 'Sauna', 'Im Haus', 5.14, 5.25, { a: 'sauna', free: 1 }], ['bs-garten', 'Garten', '', 5.17, 5.25, { a: 'garten', free: 1 }],
    ['b-haus', 'Hauspreis', '', 5.285, 5.52, { a: 'c-haus', free: 1, strike: [5.31, 5.335], stack: '[data-ch="5.25"] h2', ord: 4, gap: 44, fd: .03 }],
    ['b-garage', 'Garage', '', 5.32, 5.52, { a: 'c-garage', free: 1, stack: '[data-ch="5.25"] h2', ord: 3, gap: 44, fd: .03 }],
    ['b-zufahrt', 'Zufahrt', '', 5.35, 5.52, { a: 'c-zufahrt', free: 1, stack: '[data-ch="5.25"] h2', ord: 2, gap: 44, fd: .03 }],
    ['b-garten', 'Garten', '', 5.38, 5.52, { a: 'c-garten', free: 1, stack: '[data-ch="5.25"] h2', ord: 1, gap: 44, fd: .03 }],
    ['b-top', 'Gesamtkosten', 'Dein ganzes Projekt', 5.4, 5.52, { a: 'c-top', free: 1, stack: '[data-ch="5.25"] h2', ord: 0, gap: 44, fd: .03 }],
    ['arch', 'Eigenes Architekturteam', 'Architektur und Design', 5.53, 5.74], ['einreich', 'Einreichplanung', 'Samt Energieausweis', 5.57, 5.74],
    ['osp', 'Wenige Lastenpunkte', 'Der Rest ist frei', 5.79, 5.88, { free: 1, fd: .03 }],
    ['g-top', 'Gesamtkosten­investition', 'Dein ganzes Projekt', 5.95, 6.0, { a: 'c-top', free: 1, stack: '[data-ch="5.875"] h2', ord: 0, gap: 44, fd: .02 }],
    ['g-garten', 'Garten', '', 5.947, 6.0, { a: 'c-garten', free: 1, stack: '[data-ch="5.875"] h2', ord: 1, gap: 44, fd: .02 }],
    ['g-zufahrt', 'Zufahrt', '', 5.933, 6.0, { a: 'c-zufahrt', free: 1, stack: '[data-ch="5.875"] h2', ord: 2, gap: 44, fd: .02 }],
    ['g-garage', 'Garage', '', 5.919, 6.0, { a: 'c-garage', free: 1, stack: '[data-ch="5.875"] h2', ord: 3, gap: 44, fd: .02 }],
    ['g-haus', 'Haus', '', 5.905, 6.0, { a: 'c-haus', free: 1, stack: '[data-ch="5.875"] h2', ord: 4, gap: 44, fd: .02 }],
    ['doc1', 'Kostenüberwachung', '', 6.2, 6.95, { free: 1, stack: '[data-ch="6.5"] h2', ord: 0 }], ['doc3', 'Terminüberwachung', '', 6.28, 6.95, { free: 1, stack: '[data-ch="6.5"] h2', ord: 1 }],
    ['doc2', 'Qualitätsüberwachung', '', 6.36, 6.95, { free: 1, stack: '[data-ch="6.5"] h2', ord: 2 }], ['doc0', 'Behördengespräche', 'Einreichung, Bauverhandlung', 6.44, 6.95, { free: 1, stack: '[data-ch="6.5"] h2', ord: 3 }],
    ['slab', 'Bodenplatte', 'Inklusive', 7.14, 7.48, { stack: '[data-ch="6"] h2', ord: 0, gap: 44, fd: .04 }],
    ['gu-zufahrt', 'Zufahrt', 'Inklusive', 7.22, 7.48, { a: 'carport', free: 1, stack: '[data-ch="6"] h2', ord: 1, gap: 44, fd: .04 }],
    ['zaun', 'Zaun', 'Inklusive', 7.3, 7.48, { free: 1, stack: '[data-ch="6"] h2', ord: 2, gap: 44, fd: .04 }],
    ['daemm', 'Dach', 'Natürliche Dämmung', 8.14, 8.44, { free: 1, pr: 1, fd: .04 }], ['decke', 'Holzdecke', 'Sichtbar', 8.3, 8.56, { free: 1, pr: 1, fd: .04 }],
    ['wallx', 'Wand', 'Neun Schichten aus Holz', 8.53, 8.8, { free: 1, pr: 1, fd: .04 }], ['moist', 'Diffusionsoffen', 'Ohne PVC-Folien', 8.58, 8.8, { free: 1, pr: 1, fd: .04 }],
    ['hoehe', '2,72 m Raumhöhe', 'Serienmäßig', 8.8, 8.95, { free: 1, pr: 1, fd: .03 }], ['ueblich', '2,50 m', 'Üblich', 8.82, 8.95, { free: 1, pr: 1, fd: .03 }],
    ['fensterI', 'Holz-Alu-Fenster', '', 8.56, 9.47, { kind: 'hot', hot: 'fenster', free: 1 }], ['parkett', 'Eichenparkett', '', 8.58, 9.47, { kind: 'hot', hot: 'parkett', free: 1 }],
    ['fliesen', 'Italienische Fliesen', '', 8.6, 9.47, { kind: 'hot', hot: 'fliesen', free: 1 }], ['bad', 'Markenarmaturen', '', 8.62, 9.47, { kind: 'hot', hot: 'bad', free: 1 }],
    ['iaChips', 'Materialien und Farben', '', 9.55, 9.97, { free: 1, fd: .04 }],
    ['pvA', 'Photovoltaik', 'Strom vom eigenen Dach', 10.14, 10.47, { free: 1, pr: 1, fd: .03 }], ['netz', 'Überschuss', 'Fließt ins Netz', 10.27, 10.47, { free: 1, pr: 1, fd: .03 }],
    ['pm-key', 'Dein Projektmanager', 'Bis zur Schlüsselübergabe', 10.3, 10.5, { a: 'key' }],
    ['van', 'GRIFFNER Kundendienst', 'Vor Ort, wenn du uns brauchst', 10.7, 10.96, { free: 1 }]
  ],
  modell: 'Concept Free',
  /* Runde 55: neu im Entwurf, nach dem Film: drei Wege ins Detail (in Framer eine native Sektion) */
  weiter: { h: 'Das ganze Projekt im Detail.', karten: [
    { k: 'Planungsleistungen', t: 'Besser planen.', x: 'Wie wir dein Projekt prüfen, durchrechnen und mit dir planen, bevor gebaut wird.', l: 'Zu den Planungsleistungen', href: 'leistungsumfang.html' },
    { k: 'Bauleistungen und Ausstattung', t: 'Besser bauen.', x: 'Wie wir bauen und womit wir ausstatten.', xb: 'Von der Hülle bis zu Fenstern, Parkett und Bad.', l: 'Zu Bau und Ausstattung', href: 'leistungsumfang.html' },
    { k: 'Für alle, die es genau wissen wollen', t: 'Leistungsumfang.', x: 'Jede Leistung im Detail. Was serienmäßig dabei ist und was du dazu wählen kannst.', l: 'Zum Leistungsumfang', href: 'leistungsumfang.html' }
  ] },
  /* Runde 55: nur noch der Knopf (Entwurf), der Link „Alle Leistungen im Detail“ ist weg */
  cta: { h: 'Starte mit dem Projektcheck.', txt: 'Kostenlos, unverbindlich und mit einem Ergebnis, das du in der Hand hältst.', btn: 'Projektcheck anfragen', btnHref: 'https://griffner.com/contact' }
};
