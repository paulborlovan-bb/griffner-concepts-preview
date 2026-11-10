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
  haus: 'Concept Bold im Schnitt', drehen: 'Ziehen dreht das Haus', ganzesHaus: 'Ganzes Haus',
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
