/* Referenzen für projects.html, gerendert von initBand() in js/projects.js (ein Bauteil für beide Listen).
   Ein Projekt = info (Art / Ort / Land), name, optional text, facts [[Label, Wert]], link {href, label}, img [{s|src, alt, pos}].
   s: Basisname in assets/img/projekte/ref/ (es gibt -m.webp 960 px und -l.webp 1920 px), src: ein einzelnes Bild.
   Neues Projekt: Bilder exportieren (siehe Notiz in projects.html), Eintrag anlegen, fertig. Reihenfolge = Reihenfolge auf der Seite.
   Keine Familiennamen: die Vorschau ist öffentlich. Texte aus den Homestories gekürzt; ohne Text im Ordner bleibt text leer. */

export const REF_HOMES = [
  {
    id: 'hang-pool', info: 'Haus am Hang / Niederösterreich / AT', name: 'Traumhaus am Hang',
    text: 'Drei Ebenen am Hang, jede mit eigener Freifläche. Oben ein Balkon über die ganze Länge, ganz unten der Infinity-Pool.',
    facts: [['Wohnfläche', '200 m²'], ['Ebenen', '3'], ['Wellness', '40 m²'], ['Highlight', 'Infinity-Pool']],
    img: [
      { s: 'hang-pool-1', alt: 'Weißes Haus am Hang mit Pool, von oben' },
      { s: 'hang-pool-2', alt: 'Terrasse mit Pool vor dem Haus am Hang' },
      { s: 'hang-pool-3', alt: 'Freischwebende Treppe mit Glasgeländer' },
      { s: 'hang-pool-4', alt: 'Heller Wohnraum mit großen Fenstern' },
      { s: 'hang-pool-5', alt: 'Küche und Essplatz' },
      { s: 'hang-pool-6', alt: 'Wohnraum mit Klavier und Glasfront' },
      { s: 'hang-pool-7', alt: 'Badezimmer mit Wanne' },
      { s: 'hang-pool-8', alt: 'Schlafzimmer mit Blick ins Grüne' },
    ],
  },
  {
    id: 'wienerwald', info: 'Bungalow / Niederösterreich / AT', name: 'Bungalow im Wienerwald',
    text: 'Ein Bungalow in L-Form, im Wohnraum offen bis unter den First. Große Schiebetüren lassen Wohnen und Garten ineinander übergehen.',
    facts: [['Wohnfläche', '295 m²'], ['Form', 'L mit Wohnkeller'], ['Dach', 'Satteldach mit PV'], ['Fertig', '2023']],
    img: [
      { s: 'wienerwald-1', alt: 'Bungalow mit Satteldach in hügeliger Wiese' },
      { s: 'wienerwald-2', alt: 'Garten mit Schaukel und Naturpool vor dem Bungalow' },
      { s: 'wienerwald-3', alt: 'Wohnraum offen bis unter den First' },
      { s: 'wienerwald-4', alt: 'Küche, Essplatz und Wohnbereich in einem Raum' },
      { s: 'wienerwald-5', alt: 'Freistehende Badewanne vor grüner Wand' },
      { s: 'wienerwald-6', alt: 'Flur mit Bildern und Garderobe' },
    ],
  },
  {
    id: 'traum-gruen', info: 'Bungalow / Bayern / DE', name: 'Ein Traum im Grünen',
    text: 'Ein Bungalow in U-Form mit Einliegerwohnung, alles auf einer Ebene. Die naturbelassene Lärchenfassade darf grau werden.',
    facts: [['Wohnfläche', '192 m²'], ['Baujahr', '2018'], ['Fassade', 'Lärche'], ['Award', 'Hausbau Design Award 2019, Silber']],
    img: [
      { s: 'traum-gruen-1', alt: 'Bungalow mit Lärchenfassade am Pool' },
      { s: 'traum-gruen-2', alt: 'Innenhof mit Baum und Sitzbank' },
      { s: 'traum-gruen-3', alt: 'Wohnraum mit Kamin und Holzboden' },
      { s: 'traum-gruen-4', alt: 'Küche mit Regalen und grüner Wand' },
      { s: 'traum-gruen-5', alt: 'Essplatz vor grüner Wand' },
      { s: 'traum-gruen-6', alt: 'Eingang mit großer Uhr' },
      { s: 'traum-gruen-7', alt: 'Bad mit integrierter Sauna' },
      { s: 'traum-gruen-8', alt: 'Schlafzimmer mit Birkenstamm' },
    ],
  },
  {
    id: 'bungalow-flair', info: 'Bungalow am Hang', name: 'Bungalow mit Flair',
    text: 'Gebaut werden durfte nur im vorderen Teil des Hanggrundstücks. Bodentiefe Fenster, 2,72 Meter hohe Räume und unter dem Pultdach bis zu 3,14 Meter.',
    facts: [['Wohnfläche', '250 m²'], ['Fassade', 'Lärche'], ['Raumhöhe', 'bis 3,14 m']],
    img: [
      { s: 'bungalow-flair-2', alt: 'Bungalow mit Lärchenfassade über der Garage' },
      { s: 'bungalow-flair-1', alt: 'Terrasse mit Glasschiebetüren' },
      { s: 'bungalow-flair-3', alt: 'Bungalow im Abendlicht über der Wiese' },
      { s: 'bungalow-flair-4', alt: 'Wohnraum mit Blick ins Tal' },
      { s: 'bungalow-flair-5', alt: 'Essplatz und Küche' },
      { s: 'bungalow-flair-6', alt: 'Küche mit Holztheke' },
      { s: 'bungalow-flair-7', alt: 'Bad mit freistehender Wanne' },
      { s: 'bungalow-flair-8', alt: 'Schlafzimmer mit bodentiefem Fenster' },
    ],
  },
  {
    id: 'designhaus', info: 'Haus mit Walmdach / Bayern / DE', name: 'Designhaus ohne Wenn und Aber',
    text: 'Rund um den Alltag der Bauherren geplant, mit viel Glas, Sichtestrich und einer Terrasse am Wasserbecken. Nach vier Monaten Bauzeit war Einzug.',
    facts: [['Wohnfläche', '195,6 m²'], ['Linie', 'SQUARE'], ['Raumhöhe', '2,72 m'], ['Bauzeit', '4 Monate']],
    img: [
      { s: 'designhaus-1', alt: 'Haus mit Walmdach und großen Fenstern' },
      { s: 'designhaus-2', alt: 'Terrasse mit Wasserbecken am Abend' },
      { s: 'designhaus-3', alt: 'Wasserbecken mit Blumen vor dem Haus' },
      { s: 'designhaus-4', alt: 'Eingang mit Holzfassade' },
      { s: 'designhaus-5', alt: 'Bad mit Wanne und Blick ins Land' },
    ],
  },
  {
    id: 'berge', info: 'Einfamilienhaus', name: 'Haus vor den Bergen',
    img: [
      { s: 'berge-1', alt: 'Haus mit Holzfassade und Balkonen vor Bergen' },
      { s: 'berge-2', alt: 'Essplatz unter einer Holzdecke' },
      { s: 'berge-3', alt: 'Essplatz mit großen Fenstern' },
      { s: 'berge-4', alt: 'Ledersessel am Fenster' },
    ],
  },
  {
    id: 'box-pool', info: 'Einfamilienhaus', name: 'Haus mit Pool',
    img: [
      { s: 'box-pool-1', alt: 'Haus am Hang mit beleuchteter Terrasse am Abend' },
      { s: 'box-pool-2', alt: 'Pool vor der Terrasse mit Holzverkleidung' },
      { s: 'box-pool-3', alt: 'Pool entlang der Hausfront' },
      { s: 'box-pool-4', alt: 'Essplatz und Küche' },
      { s: 'box-pool-5', alt: 'Wohnzimmer mit Ledersofa' },
    ],
  },
  {
    id: 'dunkle-fassade', info: 'Holzhaus / DE', name: 'Holzhaus mit dunkler Fassade',
    text: 'Wellness und Ökologie standen ganz oben. Drei Bäder, eine Sauna und viel sichtbares Holz für ein gesundes Raumklima.',
    facts: [['Energie', 'KfW 40 NH, QNG'], ['Photovoltaik', '18 kWp'], ['Bäder', '3 und Sauna']],
    link: { href: 'https://www.youtube.com/watch?v=Fc_bwfT3HZY', label: 'Homestory ansehen' },
    img: [
      { s: 'dunkle-fassade-1', alt: 'Dreigeschossiges Holzhaus mit dunkler Fassade' },
      { s: 'dunkle-fassade-2', alt: 'Holzhaus mit Photovoltaik auf dem Dach', pos: '50% 40%' },
    ],
  },
];

/* GRIFFNER Building: Texte wie live (griffner.com/projects, inkl. „effizinete“), je ein Bild. Weitere Bilder einfach ergänzen. */
export const REF_BUILDING = [
  { id: 'koralpe', info: 'Hütte / Koralpe / Kärnten / AT', name: 'Schutzhaus Koralpe', text: 'Auf 1966 Metern Seehöhe, in drei Wochen aufgestellt.',
    img: [{ src: 'assets/img/projekte/bld-koralpe.jpg', alt: 'Schutzhaus Koralpe über dem Nebelmeer' }] },
  { id: 'juwi', info: 'Büro / Wörrstadt / DE', name: 'JUWI Firmenzentrale', text: 'Das hoch-energieeffizinete Bürogebäude bietet auf ca. 8.500 m² Platz für rund 300 Mitarbeiter und wurde u.a. mit dem Klimaschutzpreis ausgezeichnet.',
    img: [{ src: 'assets/img/projekte/bld-juwi.jpg', alt: 'Bürogebäude mit Holzfassade und Terrasse am Teich' }] },
  { id: 'park', info: 'Wohnbau / Graz / AT', name: 'Wohnen im Park', text: 'In einzigartiger Lage am Rosenhain in Graz wurden in einem rund 3.500 m² großen Park 3 Villen mit 7 Wohneinheiten errichtet.',
    img: [{ src: 'assets/img/projekte/bld-park.jpg', alt: 'Atrium in Holzbauweise mit Bar und Besprechungsräumen' }] },
  { id: 'griffen-green', info: 'Wohnbau / Griffen / AT', name: 'Griffen Green', text: 'Das Wohnprojekt wurde mit dem „Österreichischen Klimaschutzpreis 2011“ und dem „Energy Globe Award“ 2011 ausgezeichnet.',
    img: [{ src: 'assets/img/projekte/bld-griffen-green.jpg', alt: 'Wohnanlage mit Holzbalkonen vor einem Burgfelsen' }] },
  { id: 'wien', info: 'Wohnbau / Wien / AT', name: 'Wohnsiedlung Wien', text: 'Mitten in den Weinbergen von Wien wurden 10 Wohnhäuser errichtet.',
    img: [{ src: 'assets/img/projekte/bld-wien.jpg', alt: 'Häuser mit Holzfassade an einer ansteigenden Straße' }] },
];
