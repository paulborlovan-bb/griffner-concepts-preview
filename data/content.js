/* GRIFFNER Concepts, Inhalte. Alle Texte und Daten an einem Ort, damit neue Concepts nur hier dazukommen.
   Platzhalter sind mit ph: true markiert und vor dem Livegang mit dem Kunden abzustimmen. */

export const CONCEPTS = [
  {
    id: 'wald', nr: '01', name: 'Wald', word: 'WALD.',
    lead: 'Ein Haus, das sich unter die Föhren duckt und sich zum Wald hin ganz öffnet.',
    fuer: 'Für Menschen, die lieber im Garten sitzen als davor.',
    text: 'Oben schützt ein dunkler Rahmen, unten öffnet sich das Wohnen auf ganzer Breite zum Wald.',
    facts: ['171 m²', '2 Ebenen', 'Flachdach'],
    img: 'assets/img/wald-garten-ecke-1800.jpg', pos: '50% 62%',
    cap: 'Abb. 01 / Visualisierung / GRIFFNER Architektur und Design',
    views: [
      { img: 'assets/img/wald-eingang.jpg', cap: 'Ankommen.' },
      { img: 'assets/img/wald-sessel.jpg', cap: 'Drinnen.' },
      { img: 'assets/img/wald-fenster.jpg', cap: 'Draußen.' }
    ],
    fits: { who: ['zwei', 'familie'], work: ['zuhause', 'kunden'], love: ['garten', 'buecher', 'kochen', 'weite'] },
    m2: 171, href: 'wald.html'
  },
  {
    id: 'duene', nr: '02', name: 'Düne', word: 'DÜNE.',
    lead: 'Ein Geschoß unter einem langen Dach.',
    fuer: 'Für Menschen, die Weite brauchen und keine Treppe.',
    text: 'Der Giebel öffnet sich in ganzer Höhe zur Landschaft. Der Wind bleibt draußen.',
    facts: ['142 m²', '1 Ebene', 'Satteldach'], ph: true,
    img: 'assets/img/duene-1.jpg', pos: '50% 60%',
    cap: 'Abb. 02 / Visualisierung / GRIFFNER Architektur und Design',
    views: [
      { img: 'assets/img/duene-2.jpg', cap: 'Ankommen.' },
      { img: 'assets/img/duene-3.jpg', cap: 'Draußen.' }
    ],
    fits: { who: ['allein', 'zwei', 'generationen'], work: ['buero', 'zuhause'], love: ['weite', 'rueckzug', 'morgen', 'werkstatt'] },
    m2: 142, href: '#'
  },
  {
    id: 'summer', nr: '03', name: 'Summer', word: 'SUMMER.',
    lead: 'Ein Haus für lange Abende draußen.',
    fuer: 'Für Menschen, die den Sommer draußen verbringen und gern Gäste haben.',
    text: 'Ein weites Dach greift über die Terrasse. Die Schiebefenster verschwinden in der Wand, drinnen und draußen werden ein Raum.',
    facts: ['158 m²', '2 Ebenen', 'Flachdach mit Vordach'], ph: true,
    img: 'assets/img/summer-1.jpg', pos: '50% 55%',
    cap: 'Abb. 03 / Platzhalterbild, Visualisierung Summer folgt',
    views: [
      { img: 'assets/img/summer-2.jpg', cap: 'Garten.' }
    ],
    fits: { who: ['zwei', 'familie'], work: ['buero'], love: ['garten', 'gaeste', 'kochen', 'morgen'] },
    m2: 158, href: '#'
  }
];

/* Die Sammlung wächst: zehn Arbeitsmodelle in einer Reihe. 01 bis 03 sind offen, 04 bis 10 sind Platzhalter (ph),
   Namen und Formen vorläufig, bis die Concepts wirklich kommen. Formparameter siehe house3d.js CONCEPTS. */
export const SAMMLUNG = [
  { nr: '01', name: 'Wald', state: 'Offen', href: 'wald.html', form: 'wald' },
  { nr: '02', name: 'Düne', state: 'Offen', href: '#c-duene', form: 'duene' },
  { nr: '03', name: 'Summer', state: 'Offen', href: '#c-summer', form: 'summer' },
  { nr: '04', name: 'Hang', state: 'Bald', ph: true, form: 'hang' },
  { nr: '05', name: 'Hof', state: 'Bald', ph: true, form: { L0: 13, D: 10, H1: 3, L1: 13, H2: 3, sx: 0, up: 1, R: 0, gl: .6, gu: .6, ge: 0, slope: 0 } },
  { nr: '06', name: 'Lichtung', state: 'Bald', ph: true, form: { L0: 12, D: 9, H1: 3.1, L1: 12, H2: 3, sx: 0, up: 1, R: 3.4, gl: .5, gu: .4, ge: 0, slope: 0 } },
  { nr: '07', name: 'Feld', state: 'Bald', ph: true, form: { L0: 24, D: 6.5, H1: 3.2, L1: 24, H2: 0, sx: 0, up: 0, R: 0, gl: .9, gu: 0, ge: 0, slope: 0 } },
  { nr: '08', name: 'Bucht', state: 'Bald', ph: true, form: { L0: 10, D: 10, H1: 3, L1: 14, H2: 3, sx: -2, up: 1, R: 3, gl: .6, gu: .6, ge: 0, slope: 0 } },
  { nr: '09', name: 'Kante', state: 'Bald', ph: true, form: { L0: 14, D: 9, H1: 3.4, L1: 14, H2: 0, sx: 0, up: 0, R: 5, gl: .5, gu: 0, ge: 1, slope: 0 } },
  { nr: '10', name: 'Alm', state: 'Bald', ph: true, form: { L0: 8, D: 8, H1: 3, L1: 12, H2: 3, sx: 3, up: 1, R: 0, gl: .6, gu: .8, ge: 0, slope: .6 } }
];

/* Kapitel 01, Kennenlernen */
export const QUESTIONS = [
  { key: 'who', label: 'Wer zieht ein?', multi: false, opts: [['allein', 'Ich allein'], ['zwei', 'Wir zu zweit'], ['familie', 'Familie mit Kindern'], ['generationen', 'Mehrere Generationen']] },
  { key: 'work', label: 'Wo arbeitest du?', multi: false, opts: [['buero', 'Im Büro'], ['zuhause', 'Oft zuhause'], ['kunden', 'Zuhause, mit Kundschaft']] },
  { key: 'love', label: 'Was darf nicht fehlen?', multi: true, opts: [['morgen', 'Morgenlicht'], ['kochen', 'Kochen für viele'], ['weite', 'Weite'], ['rueckzug', 'Rückzug'], ['garten', 'Garten'], ['gaeste', 'Gäste über Nacht'], ['buecher', 'Bücher'], ['werkstatt', 'Werkstatt']] }
];

export const DEFAULT_ANSWERS = { who: 'familie', work: 'zuhause', love: ['morgen', 'garten'] };

/* Erstes Raumprogramm aus den Antworten. Richtwerte zur Veranschaulichung, keine Planung. */
export function program(a) {
  const R = [];
  const add = (room, m2, note) => R.push({ room, m2, note });
  add('Wohnen, Essen, Kochen', a.love.includes('kochen') ? 62 : 48, a.love.includes('kochen') ? 'Ein Tisch für zehn.' : '');
  add('Eingang und Garderobe', 8);
  ({
    allein: () => add('Schlafen', 15),
    zwei: () => { add('Schlafen', 16); add('Ankleide', 6); },
    familie: () => { add('Schlafen', 16); add('Ankleide', 6); add('Kinderzimmer', 13); add('Kinderzimmer', 13); add('Zweites Bad', 6); },
    generationen: () => { add('Schlafen', 16); add('Zimmer', 13); add('Eigener Bereich mit Bad', 34, 'Ebenerdig, mit eigenem Zugang.'); }
  }[a.who] || (() => {}))();
  add('Bad', 9); add('WC', 3); add('Technik und Hauswirtschaft', 10);
  if (a.work === 'zuhause') add('Arbeiten', 12, 'Weg vom Trubel.');
  if (a.work === 'kunden') add('Arbeiten', 15, 'Mit eigenem Eingang.');
  if (a.love.includes('gaeste')) add('Gästezimmer', 12);
  if (a.love.includes('rueckzug')) add('Leseplatz', 8, 'Ein Ort nur für dich.');
  if (a.love.includes('werkstatt')) add('Werkstatt', 14);
  const notes = [];
  if (a.love.includes('morgen')) notes.push('Küche nach Osten.');
  if (a.love.includes('weite')) notes.push('Ein Luftraum über dem Wohnen.');
  if (a.love.includes('garten')) notes.push('Die Terrasse wird das zweite Wohnzimmer.');
  if (a.love.includes('buecher')) notes.push('Eine Wand nur für Bücher.');
  const total = R.reduce((s, r) => s + r.m2, 0);
  return { rooms: R, notes, total };
}

const WHO = { allein: 'Du ziehst allein ein', zwei: 'Du ziehst zu zweit ein', familie: 'Du ziehst mit deiner Familie ein', generationen: 'Du ziehst mit mehreren Generationen ein' };
const WORK = { buero: 'arbeitest im Büro', zuhause: 'arbeitest oft zuhause', kunden: 'empfängst Kundschaft zuhause' };
const LOVE = { morgen: 'Morgenlicht', kochen: 'Kochen für viele', weite: 'Weite', rueckzug: 'Rückzug', garten: 'deinen Garten', gaeste: 'Gäste über Nacht', buecher: 'Bücher', werkstatt: 'eine Werkstatt' };
export function sentence(a) {
  const l = a.love.map(k => LOVE[k]);
  const list = l.length > 1 ? l.slice(0, -1).join(', ') + ' und ' + l[l.length - 1] : l[0];
  return `${WHO[a.who]}, ${WORK[a.work]}${list ? ' und willst ' + list + ' nicht missen' : ''}.`;
}

/* Kapitel 02, Grundstück. Maße in Metern, Ursprung links oben, Norden oben. */
const WALD = [[3.2, 0], [14.1, 0], [14.1, 7.5], [9.5, 7.5], [9.5, 11.2], [0, 11.2], [0, 4.5], [3.2, 4.5]];
const LANG = [[0, 0], [8, 0], [8, 7], [8, 14], [8, 22], [0, 22], [0, 11], [0, 4]];
export const SITES = [
  {
    key: 'eben', label: 'Eben und weit',
    plot: [[0, 1], [40, 0], [41, 30], [1, 31]], size: '40 × 30 m',
    trees: [[5, 24], [8, 27.5], [33, 5], [36.5, 23], [31, 27], [4, 6], [27, 19], [36, 10]],
    house: WALD, terr: [[9.5, 7.5], [15.2, 7.5], [15.2, 11.2], [9.5, 11.2]],
    start: { x: 23, y: 16, r: 0 }, fit: { x: 16, y: 10.5, r: -12 },
    view: { from: [18, 16.5], to: [18, 30.5], spread: 9 },
    note: 'Das Wohnen dreht sich zur Abendsonne. Die Föhren bleiben stehen.'
  },
  {
    key: 'schmal', label: 'Schmal und tief',
    plot: [[12, 0], [28, 0], [28, 44], [12, 44]], size: '16 × 44 m',
    trees: [[15, 38], [25, 40], [25.5, 31], [14.5, 4]],
    house: LANG, terr: [[8, 13], [11.5, 13], [11.5, 22], [8, 22]],
    start: { x: 20, y: 22, r: 90 }, fit: { x: 18, y: 17, r: 0 },
    view: { from: [20, 28], to: [20, 44], spread: 6 },
    note: 'Auf schmalem Grund wird das Haus lang und schlank. Der Garten liegt hinten, ganz für dich.'
  },
  {
    key: 'hang', label: 'Am Hang',
    plot: [[0, 1], [40, 0], [41, 30], [1, 31]], size: '40 × 30 m, 12 % Gefälle',
    trees: [[5, 25], [34, 6], [37, 25], [3, 7], [30, 28]],
    house: WALD, terr: [[9.5, 7.5], [15.2, 7.5], [15.2, 11.2], [9.5, 11.2]],
    contours: true,
    start: { x: 20, y: 18, r: 30 }, fit: { x: 17, y: 8, r: 0 },
    view: { from: [17, 14], to: [17, 31], spread: 14 },
    note: 'Am Hang folgt das Haus dem Gelände. Oben die Zufahrt, unten der Blick ins Tal.'
  }
];
export const SITE_STEPS = [
  ['Wir lesen dein Grundstück.', 'Grenzen, Zufahrt, Nachbarn.'],
  ['Was da ist, bleibt.', 'Bäume, Blicke, Gelände.'],
  ['Die Sonne zeigt, wo gewohnt wird.', 'Morgens die Küche, abends die Terrasse.'],
  ['Erst dann setzen wir das Haus.', 'Es dreht sich zum Licht und weicht den Bäumen aus.'],
  ['Jeder Ort, ein anderes Haus.', 'Probier es aus.']
];

/* Kapitel 04, Mischen. Jede Zeile nimmt eine Eigenschaft aus einem Concept. */
export const MIX = [
  { key: 'koerper', label: 'Baukörper', opts: { wald: 'Zwei Ebenen, oben auskragend', duene: 'Ein Geschoß, lang gestreckt', summer: 'Zwei Ebenen, oben zurückgesetzt' } },
  { key: 'dach', label: 'Dach', opts: { wald: 'Flachdach', duene: 'Satteldach', summer: 'Flachdach mit weitem Vordach' } },
  { key: 'licht', label: 'Öffnungen', opts: { wald: 'Raumhoch zum Garten', duene: 'Verglaster Giebel', summer: 'Schiebefenster rundum' } },
  { key: 'fassade', label: 'Fassade', opts: { wald: 'Dunkler Rahmen, Lärche', duene: 'Helles Holz', summer: 'Hell verputzt' } }
];
export const MIX_PARAMS = {
  koerper: {
    wald: { L0: 15, D: 9, H1: 3.1, L1: 16, H2: 3.1, sx: 2.6, up: 1 },
    duene: { L0: 22, D: 8, H1: 3.2, L1: 22, H2: 0, sx: 0, up: 0 },
    summer: { L0: 18, D: 10, H1: 3.2, L1: 10, H2: 3, sx: -3.6, up: 1 }
  },
  dach: { wald: { R: 0, ov: 0 }, duene: { R: 4.2, ov: 0 }, summer: { R: 0, ov: 1.8 } },
  licht: { wald: { gl: .86, gu: .55, ge: 0 }, duene: { gl: .5, gu: .3, ge: 1 }, summer: { gl: .96, gu: .9, ge: 0 } },
  fassade: { wald: { tone: 0 }, duene: { tone: .55 }, summer: { tone: 1 } }
};
export const DEFAULT_MIX = { koerper: 'wald', dach: 'wald', licht: 'wald', fassade: 'wald' };

/* Seite Concept Wald, Grundrisse. Echte Grundrisse Concept Wald (CAD, 1:100). Koordinaten in Punkt, 1 m = 28,35 pt. */
export const PLAN = {
  eg: {
    label: 'Erdgeschoß', sum: '101,44 m²', src: 'assets/img/plan-eg.svg',
    rooms: [
      { n: 'Wohnen, Essen, Kochen', m: '65,49 m²', x: 452, y: 348 },
      { n: 'Büro', m: '11,92 m²', x: 676, y: 198 },
      { n: 'Technik, Hauswirtschaft', m: '10,69 m²', x: 478, y: 226 },
      { n: 'WC, Dusche', m: '4,08 m²', x: 457, y: 161 },
      { n: 'Eingang', m: '', x: 580, y: 164 }
    ],
    notes: [
      { at: [452, 308], to: [326, 300], align: 'r', key: 'kochen', on: 'Ein Tisch für zehn.', off: 'Kochen mit Blick in den Garten.' },
      { at: [690, 154], to: [748, 128], align: 'l', key: 'work', on: 'Dein Arbeitsplatz, weg vom Trubel.', off: 'Ein Zimmer, das alles kann.' },
      { at: [648, 392], to: [560, 468], align: 'l', key: 'garten', on: 'Die Terrasse wird das zweite Wohnzimmer.', off: 'Abends sitzt du hier draußen.' }
    ]
  },
  og: {
    label: 'Obergeschoß', sum: '69,55 m²', src: 'assets/img/plan-og.svg',
    rooms: [
      { n: 'Zimmer', m: '13,04 m²', x: 654, y: 216 },
      { n: 'Zimmer', m: '13,04 m²', x: 658, y: 273 },
      { n: 'Schlafen', m: '11,62 m²', x: 456, y: 341 },
      { n: 'Galerie', m: '11,42 m²', x: 557, y: 330 },
      { n: 'Bad', m: '9,37 m²', x: 474, y: 183 },
      { n: 'Duschbad', m: '5,37 m²', x: 575, y: 189 },
      { n: 'Ankleide', m: '5,70 m²', x: 460, y: 229 }
    ],
    notes: [
      { at: [676, 250], to: [732, 250], align: 'l', key: 'familie', on: 'Zwei Kinderzimmer, gleich groß.', off: 'Ein Zimmer für Besuch, eins für dich.' },
      { at: [548, 280], to: [392, 300], align: 'r', key: 'weite', on: 'Die Galerie öffnet den Raum nach unten.', off: 'Ein Luftraum verbindet beide Ebenen.' }
    ]
  }
};

/* Kapitel 06, Einzug. Bildunterschriften zur Filmzeit in Sekunden. */
export const FILM = [
  [0, 6, 'Ankommen.'], [6, 8, 'Lärche und dunkler Rahmen.'], [8, 10, 'Drinnen.'], [10, 14, 'Draußen.'],
  [14, 16, 'Ruhe.'], [16, 20, 'Zusammen.'], [20, 22, 'Feierabend.'], [22, 25, 'Der Wald im Fenster.'], [25, 31, 'Dein Ort.']
];

export const RAIL = [
  ['k-kennen', '01', 'Kennenlernen'], ['k-grund', '02', 'Grundstück'], ['k-concepts', '03', 'Inspiration'],
  ['k-weg', '04', 'Dein Weg'], ['k-einzug', '05', 'Einzug']
];

/* Kapitel 04, Dein Weg. Sechs Schritte, jeder mit einem kleinen Arbeitsmodell (scene, siehe js/weg.js). */
export const WEG = [
  { nr: '01', name: 'Kennenlernen', say: 'Wir hören zu, bevor wir zeichnen.', scene: 'tisch', cap: 'Ein Tisch, viele Fragen' },
  { nr: '02', name: 'Grundstück', say: 'Wir lesen deinen Ort. Gelände, Bäume, Sonne.', scene: 'ort', cap: 'Dein Ort im Modell' },
  { nr: '03', name: 'Inspiration', say: 'Drei Concepts zum Weiterdenken.', scene: 'ideen', cap: 'Wald, Düne, Summer' },
  { nr: '04', name: 'Mischen', say: 'Du nimmst, was dir gefällt. Wir fügen es zusammen.', scene: 'mischen', cap: 'Aus drei wird eins' },
  { nr: '05', name: 'Bauen', say: 'Vorgefertigt in Griffen, aufgestellt in wenigen Tagen.', scene: 'bauen', cap: 'Element für Element' },
  { nr: '06', name: 'Einzug', say: 'Und dann wohnst du.', scene: 'einzug', cap: 'Licht an' }
];

/* Seite Concept Wald, Kapitel Ausprobieren: Wald als Arbeitsmodell zwischen Föhren. Maße und Sonne stehen in js/wald3d.js.
   [Wert, Titel, Zusatz]. Der erste Wert jeder Zeile ist Concept Wald, wie es gezeichnet ist. */
export const WALD_SPIEL = [
  { key: 'view', label: 'Ansicht', opts: [['plan', 'Grundriss', 'Zonen und Licht'], ['haus', 'Haus', 'Zwischen den Bäumen']] },
  { key: 'size', label: 'Größe', opts: [['kompakt', 'Kompakt', 'Rund 2 m kürzer'], ['original', 'Original', 'Wie gezeichnet'], ['gross', 'Großzügig', 'Rund 2,5 m länger']] },
  { key: 'og', label: 'Obergeschoß', opts: [['auskragend', 'Auskragend', 'Wie gezeichnet'], ['buendig', 'Bündig', 'Oben so lang wie unten'], ['kuerzer', 'Kürzer', 'Mehr Terrasse oben']] }
];
export const WALD_SPIEL_DEFAULT = { view: 'plan', size: 'original', og: 'auskragend', season: 'juni', time: 7 };
/* Ein Tag im Wald (js/waldtag.js): Reiter = Tageszeiten. time in Stunden, season wählt die Sonnenbahn. */
export const WALD_TAG = [
  { label: 'Morgen', season: 'juni', time: 7, say: 'Frühstück in der Morgensonne.' },
  { label: 'Mittag', season: 'juni', time: 13, say: 'Mittags steht die Sonne hoch über dem Garten.' },
  { label: 'Abend', season: 'juni', time: 18.5, say: 'Der Abend gehört der Terrasse.' },
  { label: 'Winter', season: 'dezember', time: 12, say: 'Die Wintersonne steht tief und reicht weit ins Haus.' }
];
