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
  'Spengler': 'fassade', 'Terrasse, Carport und Überdachungen': null,
  'Wärme': 'technik', 'Elektro': 'technik', 'Sanitärinstallation': 'technik', 'Estrich und Fußbodenaufbau': 'parkett',
  'Böden, Treppe, Türen': 'treppe', 'Bodenbelag': 'parkett', 'Fliesen': null, 'Innentüren': null, 'Sanitäreinrichtung': null, 'Oberflächen': 'wand', 'Übergabe': null
};
/* EIGEN: Abschluss der drei Stufen und der Weg nach draußen (Leistungsumfang) */
export const RUND = {
  schluss: 'Schlüsselfertig. Du kannst einziehen.',
  info: 'Rund ums Haus', h: 'Und alles, was dazugehört.',
  txt: 'Schlüsselfertig ist das Haus. Auf Wunsch bauen wir weiter, vom Fundament bis zum Garten, mit demselben Ansprechpartner.',
  liste: ['Fundament', 'Das Haus', 'Innenausbau und Interior', 'Carport', 'Terrasse', 'Pool', 'Garten', 'Sauna, Glashaus, Gartenhütte'],
  link: 'Im 3D Modell ansehen'
};

/* ================= Runde 49: Services Übersicht im Design v2 (Kunde, „GRIFFNER Services v2“, 11.11.2026) =================
   Ein gepinnter Film über das Haus (Runde 51: das Haus aus dem Gartenplan mit Satteldach, im ganzen Garten), zwölf Kapitel, unten die Leiste in drei Teilen,
   danach das gelbe Feld „Starte mit dem Projektcheck“. Texte wörtlich aus dem Entwurf (S2Services). Kapitel k mit Gewicht
   (Bildschirmhöhen je Einheit 1,5): 5 und 10 haben zwei Hälften (5 / 5.5, 10 / 10.5). */
export const FILM = {
  gewichte: [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  kapitel: [
    { ch: '0', id: 'produkt', k: 'Services', h1: 'Das größte Projekt deines Lebens verdient mehr als ein Produkt.' },
    { ch: '1', id: 'ueblich', strikes: ['Modell wählen.', 'Extras nachzahlen.', 'Den Rest selbst organisieren.'], besser: ['Wir finden, Hausbau geht ', 'besser.'] },
    { ch: '2', id: 'projekt', h: 'Wir denken dein ganzes Projekt.', txt: 'Vom Grundstück bis zum Schlüssel. Auch das, was du selbst beauftragst oder erst später baust.' },
    { ch: '3', id: 'ueberblick', h: 'Alles, was dein Projekt braucht.', txt: 'Ein Plan für alles. Ein Projektmanager, der ihn zusammenhält.' },
    { ch: '4', id: 'projektcheck', h: 'Wissen, ob es aufgeht.', b: 'Der Projektcheck.', txt: 'Wir prüfen Grundstück, Baurecht und Baugrund und rechnen dein ganzes Projekt gegen dein Budget. Am Ende hältst du deinen Projektreport in der Hand.', link: ['Alles zum Projektcheck', 'leistungsumfang.html'] },
    { ch: '5', a: 5, b: 5.5, id: 'projektplan', h: 'Alles gedacht. Nicht alles auf einmal.', klein: 1, bt: 'Dein Projektplan.', txt: 'Wir denken dein ganzes Projekt von Anfang an mit und bauen es in Schritten, die zu deinem Budget passen.',
      plan: [['Sofort.', 'Haus und Zufahrt'], ['Später.', 'Terrasse und Garten'], ['Irgendwann.', 'Pool oder Sauna']] },
    { ch: '5.5', a: 5.5, b: 6, id: 'hausplanung', h: 'Geplant von echten Profis.', bt: 'Hausplanung.', txt: 'Unser eigenes Architektur- und Designteam plant dein Haus mit dir. Von der ersten Skizze über die Einreichung bis zur Werkplanung im letzten Detail.', link: ['Alles zur Hausplanung', 'leistungsumfang.html#u-dazu'] },
    { ch: '6', id: 'fundament', h: 'Unser Haus beginnt eine Etage tiefer.', bt: 'Fundament.', txt: 'Die Bodenplatte ist bei uns serienmäßig. Weil ein Haus nicht erst über der Erde beginnt.', link: ['Alles zum Fundament', 'leistungsumfang.html#u-stufen'] },
    { ch: '7', id: 'bausystem', h: 'Gesünder wohnen geht nicht.', bt: 'Exterior.', txt: 'Holz, Holzfaser und Zellulose. Keine Folien, trocken gebaut. Wohngesund ab dem ersten Tag.', link: ['Alles zum Exterior', 'leistungsumfang.html#u-acht'], hint: 'Tippe auf einen Punkt im Haus' },
    { ch: '8', id: 'innen', h: 'Hier wird es persönlich.', bt: 'Interior.', txt: 'Das Bausystem sorgt dafür, dass du gesund wohnst. Das Innere dafür, dass du gern nach Hause kommst.', link: ['Alles zum Interior', 'leistungsumfang.html#u-stufen'], hint: 'Tippe auf einen Raum' },
    { ch: '9', id: 'aussen', h: 'Dein Projekt endet nicht an der Hauswand.', bt: 'Rund ums Haus.', txt: 'Ob wir es bauen oder mit deinen Firmen koordinieren, es gehört von Anfang an zum Plan.', link: ['Alles rund ums Haus', 'leistungsumfang.html#u-rund'] },
    { ch: '10', a: 10, b: 10.5, id: 'pm', h: 'Vom Vertrag bis zum Schlüssel an deiner Seite.', bt: 'Dein Projektmanager.', txt: 'Ein Mensch kennt dein Projekt in jedem Detail und koordiniert alle Gewerke. Du musst nicht wissen, wen du anrufen sollst. Er ruft dich an.' },
    { ch: '10.5', a: 10.5, b: 11, id: 'kundendienst', jahr: 'Jahr', h: 'Wir sind auch danach da.', bt: 'Kundendienst.', txt: 'Unser Kundendienst kennt dein Haus und ist da, wenn etwas ist. Auch Jahre nach dem Einzug.' },
    { ch: '11', id: 'haltung', h: 'Wir bauen nicht hundertmal dasselbe Haus.', einmal: ['Wir bauen ', 'deins.', ' Einmal.'] }
  ],
  /* Sprungmarken im Film (Anteil der Filmhöhe in vh wie im Entwurf) */
  marken: [['s-ueberblick', 525], ['s-projektcheck', 652.5], ['s-projektplan', 780], ['s-hausplanung', 915], ['s-fundament', 1102.5], ['s-bausystem', 1245], ['s-innen', 1552.5], ['s-aussen', 1702.5], ['s-pm', 1815], ['s-kundendienst', 1965]],
  /* Leiste unten: drei Teile mit Bereich in P und Unterzeilen [bis P, Name] */
  leiste: [
    { name: 'Besser planen.', href: '#s-projektcheck', r: [4, 6], sub: [[5, 'Projektcheck'], [5.5, 'Projektplan'], [6, 'Hausplanung']] },
    { name: 'Besser bauen.', href: '#s-fundament', r: [6, 10.5], sub: [[7, 'Fundament'], [8, 'Exterior'], [9, 'Interior'], [10, 'Rund ums Haus'], [10.5, 'Projektmanager']] },
    { name: 'Besser leben.', href: '#s-kundendienst', r: [10.5, 11], sub: [[11, 'Kundendienst']] }
  ],
  zurueck: '← Zurück zum Haus',
  /* Punkte im Haus: Info, Titel, Text, zwei Fakten. Wörtlich aus dem Entwurf */
  punkte: {
    dach: { info: 'Besser bauen / Exterior / Dach', t: 'Satteldach.', x: 'Bis zum First offen, mit Raumhöhen bis zu 5 m im Obergeschoß. Die Holzfaser-Zellulosedämmung speichert die Hitze des Tages und gibt sie erst nachts ab.', f: [['U-Wert 0,13', 'W/m²K Zwischensparrendämmung'], ['PV-bereit', 'Lastabtragung berücksichtigt']] },
    wand: { info: 'Besser bauen / Exterior / Wand', t: 'Die GRIFFNER Wand.', x: '42,25 cm aus Holz, Holzfaser und Zellulose. Diffusionsoffen und ohne PVC-Folien, sie regelt die Feuchte von selbst.', f: [['U-Wert 0,147', 'W/m²K, dreischalig'], ['Installationsebene', 'Leitungen bleiben zugänglich']] },
    fenster: { info: 'Besser bauen / Exterior / Fenster', t: 'Holz-Alu-Fenster.', x: 'Innen Holz, außen Aluminium, das ohne Anstrich auskommt. Dreifach verglast, mit verdeckt liegenden Beschlägen.', f: [['Ug 0,6', 'W/m²K, 3-fach-Verglasung'], ['Raffstore', 'Elektrisch, Z-Lamelle 60 mm']] },
    fassade: { info: 'Besser bauen / Exterior / Fassade', t: 'Lärche oder Putz.', x: 'Lärche unbehandelt, Putz oder beides. Immer hinterlüftet, das verbessert den Hitzeschutz im Sommer.', f: [['Hinterlüftet', 'Zweite wasserführende Ebene'], ['Aufwertbar', 'Platte, Stein, Glas oder PV']] },
    hoehe: { info: 'Besser bauen / Exterior / Raumhöhe', t: '2,72 Meter Raumhöhe.', x: '22 cm mehr als üblich, in jedem Raum. Auf Wunsch 2,92 Meter.', f: [['2,72 m', 'Serienmäßig'], ['2,50 m', 'Üblich, im OG oft weniger']] },
    open: { info: 'Besser bauen / Interior / Grundriss', t: 'Open Space.', x: 'Wenige Lastenpunkte ermöglichen ein flexibles Raumkonzept. Der Grundriss folgt deinem Leben.', f: [['Patentiert', 'GRIFFNER Open Space'], ['Flexibel', 'Kaum tragende Innenwände']] },
    parkett: { info: 'Besser bauen / Interior / Boden', t: 'Naturparkett.', x: 'Echtes Eichenparkett, kein Dekor auf Folie. Abschleifbar, und mit den Jahren schöner.', f: [['Eiche', 'Echtholz, abschleifbar'], ['Üblich', 'Laminat oder Vinyl']] },
    fliesen: { info: 'Besser bauen / Interior / Fliesen', t: 'Großformatig.', x: 'Ruhige, großformatige Fliesen, gemacht für Jahrzehnte.', f: [['Großformat', 'Wenige Fugen'], ['Langlebig', 'Für Jahrzehnte']] },
    bad: { info: 'Besser bauen / Interior / Bad', t: 'Das Bad.', x: 'Hier beginnt und endet dein Tag. Darum planen wir es nicht nebenbei.', f: [['Geplant', 'Mit unserem Designteam'], ['Feuchtemonitoring', 'Direkt auf der Holzdecke']] },
    tuer: { info: 'Besser bauen / Interior / Türen', t: 'Innentüren.', x: 'Du nimmst sie jeden Tag dutzende Male in die Hand. Sie sollten sich auch so anfühlen.', f: [['Massiv', 'Gutes Gewicht in der Hand'], ['Ruhig', 'Flächenbündig geplant']] }
  },
  /* Beschriftungen im Modell [id, Titel, Zeile, von P, bis P, {Art}] (Entwurf). Runde 50: Grundstück aus Runde 48 (749 m², Straße 27,70 m,
     Ostseite 22,90 m). Runde 50b (Wahl des Kunden, Option A): im Projektplan „Später. Terrasse und Garten“.
     Runde 51: wieder der ganze Garten aus Runde 48 mit Carport und Sauna im Garten, das Haus mit Satteldach */
  marken3d: [
    ['lay-plan', 'Projektplanung', 'Budget, Baurecht, Schritte und Architektur.', 3.3, 3.98, { kind: 'layer', jump: 's-projektcheck' }],
    ['lay-fund', 'Fundament', 'Die Bodenplatte ist serienmäßig.', 3.38, 3.98, { kind: 'layer', jump: 's-fundament' }],
    ['lay-huelle', 'Exterior', 'Gesünder wohnen geht nicht.', 3.42, 3.98, { kind: 'layer', jump: 's-bausystem' }],
    ['lay-innen', 'Interior', 'Parkett, Fliesen, Bad, Türen.', 3.46, 3.98, { kind: 'layer', jump: 's-innen' }],
    ['lay-aussen', 'Rund ums Haus', 'Carport, Pool, Sauna, Garten.', 3.5, 3.98, { kind: 'layer', jump: 's-aussen' }],
    ['lay-key', 'Projektmanager', 'Vom Vertrag bis zum Schlüssel.', 3.54, 3.98, { kind: 'layer', jump: 's-pm' }],
    ['flaeche', 'Grundstück', '749 m²', 4.3, 5],
    ['dimx', '27,70 m', '', 4.45, 5], ['dimz', '22,90 m', '', 4.5, 5],
    ['bau', 'Baufenster', 'Baurecht geprüft', 4.6, 5], ['boden', 'Baugrund', 'Vor Ort geprüft', 4.7, 5],
    ['z0', 'Sofort', 'Haus und Zufahrt', 5.12, 5.5], ['z1', 'Später', 'Terrasse und Garten', 5.24, 5.5], ['z2', 'Irgendwann', 'Pool oder Sauna', 5.36, 5.5],
    ['arch', 'Eigenes Architekturteam', 'Architektur und Design', 5.56, 5.7], ['einreich', 'Einreichplanung', 'Samt Energieausweis', 5.66, 5.8], ['werk', 'Werkplanung', 'Bis ins letzte Detail', 5.76, 5.9], ['statik', 'Statik', 'Für deinen Bauplatz', 5.86, 5.99],
    ['slab', 'Bodenplatte', 'Serienmäßig', 6.4, 6.95],
    ['dach', 'Satteldach', '', 7.22, 7.97, { kind: 'hot' }], ['wand', 'Die GRIFFNER Wand', '', 7.25, 7.97, { kind: 'hot' }],
    ['fenster', 'Holz-Alu-Fenster', '', 7.28, 7.97, { kind: 'hot' }], ['fassade', 'Fassade', '', 7.31, 7.97, { kind: 'hot' }], ['hoehe', 'Raumhöhe', '', 7.34, 7.97, { kind: 'hot' }],
    ['daemm', 'Holzfaser-Zellulose', 'Speichert die Hitze des Tages', 0, 0, { fo: 'dach' }], ['moist', 'Diffusionsoffen', 'Regelt die Feuchte von selbst', 0, 0, { fo: 'wand' }], ['ueblich', '2,50 m', 'Üblich', 0, 0, { fo: 'hoehe' }],
    ['open', 'Open Space', '', 8.3, 8.97, { kind: 'hot' }], ['parkett', 'Naturparkett', '', 8.33, 8.97, { kind: 'hot' }], ['fliesen', 'Fliesen', '', 8.36, 8.97, { kind: 'hot' }],
    ['bad', 'Bad', '', 8.39, 8.97, { kind: 'hot' }], ['tuer', 'Innentüren', '', 8.42, 8.97, { kind: 'hot' }],
    ['carport', 'Carport und Zufahrt', '', 9.05, 9.95], ['sauna', 'Sauna', 'Im Garten, an der Terrasse', 9.22, 9.95], ['terrasse', 'Terrasse', '', 9.36, 9.95], ['pool', 'Pool', '', 9.46, 9.95], ['garten', 'Garten', '', 9.58, 9.95],
    ['key', 'Dein Projektmanager', 'Ein Mensch für alles', 10.34, 10.5],
    ['van', 'GRIFFNER Kundendienst', 'Vor Ort, wenn du uns brauchst', 10.7, 10.96]
  ],
  modell: 'Haus mit Satteldach',
  cta: { h: 'Starte mit dem Projektcheck.', txt: 'Kostenlos, unverbindlich und mit einem Ergebnis, das du in der Hand hältst.', btn: 'Projektcheck anfragen', btnHref: 'https://griffner.com/contact', link: 'Alle Leistungen im Detail', linkHref: 'leistungsumfang.html' }
};
