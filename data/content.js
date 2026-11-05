/* GRIFFNER Concepts, Inhalte. Alle Texte und Daten an einem Ort, damit neue Concepts nur hier dazukommen.
   Platzhalter sind mit ph: true markiert und vor dem Livegang mit dem Kunden abzustimmen. */

/* Fotos von griffner.com (Framer CMS, Projekte) als Platzhalter, bis es Visualisierungen der Concepts gibt */
const WEB = 'https://framerusercontent.com/images/';

/* Vier Lebensgefühle, vier Concepts. Texte "Für Menschen" und "Die Antwort im Raum" vom Kunden (2026-11-05).
   form: Arbeitsmodell in house3d.js CONCEPTS. page: Inhalte der eigenen Seite (stille.html usw., erzeugt von tools/pages.mjs). */
export const CONCEPTS = [
  {
    id: 'stille', nr: '01', name: 'Stille', word: 'STILLE.', form: 'wald',
    fuer: 'Für Menschen, die nach einem vollen Tag ankommen und still werden wollen.',
    text: 'Ein ruhiger, dunkler Baukörper, der sich zwischen die Bäume stellt. Holzlamellen filtern Licht und Blicke, das auskragende Obergeschoss schützt. Innen ist es warm, außen bleibt die Welt draußen.',
    facts: ['171 m²', '2 Ebenen', 'Flachdach'],
    img: 'assets/img/wald-garten-ecke-1800.jpg', pos: '50% 62%',
    cap: 'Abb. 01 / Visualisierung / GRIFFNER Architektur und Design',
    views: [
      { img: 'assets/img/wald-eingang.jpg', cap: 'Ankommen.' },
      { img: 'assets/img/wald-sessel.jpg', cap: 'Drinnen.' },
      { img: 'assets/img/wald-fenster.jpg', cap: 'Draußen.' }
    ],
    fits: { who: ['allein', 'zwei'], live: ['arbeiten'], wichtig: ['rueckzug'] },
    m2: 171, href: 'stille.html',
    page: {
      hero: { img: 'assets/img/wald-garten.jpg', alt: 'Concept Stille, zweigeschoßiges Haus mit Flachdach zwischen Bäumen, Visualisierung', top: 'Zwei Ebenen mit Auskragung / Visualisierung' },
      zahlenH: 'Oben Schutz. Unten Wald.',
      zahlen: [['171', 'm²', 'Wohnfläche gesamt', 1], ['101,44', 'm²', 'Erdgeschoß'], ['69,55', 'm²', 'Obergeschoß'], ['2', '', 'Ebenen', 1], ['Flach', '', 'Dachform']],
      fig: { img: 'assets/img/wald-strasse.jpg', alt: 'Concept Stille von der Zufahrt, Visualisierung', cap: 'Abb. 02 / Ankommen / Visualisierung' },
      film: { video: 'assets/video/wald-pause.mp4', poster: 'assets/video/wald-pause.jpg', label: 'Kurzer Film, Concept Stille zwischen Bäumen', cap: 'Film / Visualisierung' },
      licht: [
        { img: 'assets/img/wald-innen.jpg', alt: 'Wohnraum mit Bücherwand, Sofa und raumhohen Fenstern, Visualisierung', tag: 'Abb. 03 / Wohnen / Visualisierung', cap: 'Wohnen, Essen und Kochen in einem Raum' },
        { img: 'assets/img/wald-essen.jpg', alt: 'Esstisch vor dem Fenster zum Wald, Visualisierung', tag: 'Abb. 04 / Essen / Visualisierung', cap: 'Der Tisch steht, wo der Wald am nächsten ist' },
        { img: 'assets/img/wald-decke.jpg', alt: 'Strickdecke auf einem Hocker, Holzboden im Fischgrät, Visualisierung', tag: 'Abb. 05 / Detail / Visualisierung', cap: 'Holz am Boden, Holz an der Wand' }
      ],
      lichtSay: 'Drinnen sitzen und trotzdem im Wald sein.',
      plan: true
    }
  },
  {
    id: 'einfachheit', nr: '02', name: 'Einfachheit', word: 'EINFACHHEIT.', form: 'duene', ph: true,
    fuer: 'Für Menschen, die das Wesentliche suchen und alles auf einer Ebene wollen.',
    text: 'Ein modernes Barnhouse: ein Satteldach, ein großer Giebel aus Glas, Holz und Stein. Alles liegt auf einer Ebene, ohne Treppen, und unter dem offenen Dach entsteht ein Raum, der nicht mehr sein will, als er ist.',
    facts: ['142 m²', '1 Ebene', 'Satteldach'],
    img: 'assets/img/duene-1.jpg', pos: '50% 60%',
    cap: 'Abb. 02 / Visualisierung / GRIFFNER Architektur und Design',
    views: [
      { img: 'assets/img/duene-2.jpg', cap: 'Ankommen.' },
      { img: 'assets/img/duene-3.jpg', cap: 'Draußen.' }
    ],
    fits: { who: ['allein', 'zwei', 'generationen'], live: ['draussen'], wichtig: ['ebene', 'offen'] },
    m2: 142, href: 'einfachheit.html',
    page: {
      hero: { img: 'assets/img/duene-1.jpg', alt: 'Concept Einfachheit, Haus mit Satteldach und Glasgiebel, Visualisierung', top: 'Eine Ebene unter dem Satteldach / Visualisierung' },
      zahlenH: 'Ein Dach. Eine Ebene.',
      zahlen: [['142', 'm²', 'Wohnfläche gesamt', 1], ['1', '', 'Ebene', 1], ['0', '', 'Treppen', 1], ['Sattel', '', 'Dachform']],
      fig: { img: 'assets/img/duene-2.jpg', alt: 'Concept Einfachheit, Ankommen unter dem langen Dach, Visualisierung', cap: 'Abb. 02 / Ankommen / Visualisierung' },
      band: { img: 'assets/img/duene-3.jpg', alt: 'Concept Einfachheit von der Gartenseite, Visualisierung', cap: 'Abb. 03 / Draußen / Visualisierung' },
      licht: [
        { img: WEB + 'DS9pFqgfFYqAglCs94KEi84z2E.jpg', alt: 'Essplatz unter einer Holzdecke, Foto', tag: 'Abb. 04 / Wohnen / Foto, Platzhalter', cap: 'Ein Raum unter dem offenen Dach' },
        { img: WEB + 'yUyYdoKFQZKqKrIkwklWpPDNk.jpg', alt: 'Wohnraum mit Holz und Blick ins Grüne, Foto', tag: 'Abb. 05 / Blick / Foto, Platzhalter', cap: 'Glas im Giebel, Licht bis in die Tiefe' },
        { img: WEB + 'A4JqmOFGCgPWiDedinKXtdLU6s.jpg', alt: 'Holzwand mit Sessel, Foto', tag: 'Abb. 06 / Detail / Foto, Platzhalter', cap: 'Holz und Stein, sonst nichts' }
      ],
      lichtSay: 'Ein Raum, der nicht mehr sein will, als er ist.'
    }
  },
  {
    id: 'leichtigkeit', nr: '03', name: 'Leichtigkeit', word: 'LEICHTIGKEIT.', form: 'summer', ph: true,
    fuer: 'Für Menschen, die am liebsten draußen leben und gern Gäste haben.',
    text: 'Weite Dachüberstände spenden Schatten, raumhohe Fenster öffnen das Haus zu Terrasse und Pool, oben läuft eine Dachterrasse über die ganze Breite. Ein Haus für lange Abende, das sich wie Urlaub anfühlt.',
    facts: ['158 m²', '2 Ebenen', 'Dachterrasse'],
    img: WEB + 'D2dvU723pCo0LPWhJQ7TszrGAZ8.jpg', pos: '50% 55%',
    cap: 'Abb. 03 / Foto, Platzhalter bis zur Visualisierung',
    views: [
      { img: WEB + 'Unpl4PriPV66mKCB4Z3z6BNiU.jpg', cap: 'Draußen.' },
      { img: WEB + 'hIzLm0JqGbCfJyRp1j0sU8F7Hc.jpg', cap: 'Abends.' }
    ],
    fits: { who: ['zwei', 'kinder'], live: ['gaeste', 'draussen'], wichtig: ['offen', 'licht'] },
    m2: 158, href: 'leichtigkeit.html',
    page: {
      hero: { img: WEB + 'D2dvU723pCo0LPWhJQ7TszrGAZ8.jpg', alt: 'Weißes Haus mit weiten Dachüberständen und raumhohen Fenstern, Foto', top: 'Zwei Ebenen mit Dachterrasse / Foto, Platzhalter' },
      zahlenH: 'Draußen ist das zweite Wohnzimmer.',
      zahlen: [['158', 'm²', 'Wohnfläche gesamt', 1], ['2', '', 'Ebenen', 1], ['1', '', 'Dachterrasse', 1], ['Flach', '', 'Dachform']],
      fig: { img: WEB + 'UF5oPuAOaTho1Yzsax78ykNPTe8.jpg', alt: 'Haus mit Dachterrasse und Garten von oben, Foto', cap: 'Abb. 02 / Von oben / Foto, Platzhalter' },
      band: { img: WEB + 'hIzLm0JqGbCfJyRp1j0sU8F7Hc.jpg', alt: 'Haus und Pool am Abend, Foto', cap: 'Abb. 03 / Abends / Foto, Platzhalter' },
      licht: [
        { img: WEB + '14QAOsBFBNn4ZxbBiuIyu7R0Z0.jpg', alt: 'Heller Wohnraum mit raumhohen Fenstern, Foto', tag: 'Abb. 04 / Wohnen / Foto, Platzhalter', cap: 'Raumhohe Fenster zur Terrasse' },
        { img: WEB + 'SXbkxuksx0QXTehHKkv5oNpigM.jpg', alt: 'Essplatz vor der Glasfront, Foto', tag: 'Abb. 05 / Essen / Foto, Platzhalter', cap: 'Der Tisch steht fast schon draußen' },
        { img: WEB + 'GKnuRBnUYGIkfnsAm8njyQ4JU.jpg', alt: 'Zwei Sessel im Licht, Foto', tag: 'Abb. 06 / Detail / Foto, Platzhalter', cap: 'Schatten unter dem weiten Dach' }
      ],
      lichtSay: 'Ein Haus, das sich wie Urlaub anfühlt.'
    }
  },
  {
    id: 'weitblick', nr: '04', name: 'Weitblick', word: 'WEITBLICK.', form: 'hang', ph: true,
    fuer: 'Für Menschen, die ihre Aussicht nicht hinter Wänden verstecken wollen.',
    text: 'Das Obergeschoss kragt über den gläsernen Sockel hinaus und richtet sich mit einer großen Glasfront auf die Landschaft. Unten öffnet sich das Wohnen zum Garten, oben gehört der Raum dem Blick.',
    facts: ['185 m²', '2 Ebenen', 'Auskragung'],
    img: WEB + 'rUtKW4GqlLLBQmqVXILK5afEZGI.jpg', pos: '50% 50%',
    cap: 'Abb. 04 / Foto, Platzhalter bis zur Visualisierung',
    views: [
      { img: WEB + 'S5wq8LaRxuE8KWfr8X7uLremE.jpg', cap: 'Draußen.' },
      { img: WEB + 'akgUOvcI77asKhnC9ditt1tvV0.jpg', cap: 'Drinnen.' }
    ],
    fits: { who: ['zwei', 'kinder'], live: ['arbeiten', 'sport'], wichtig: ['licht'] },
    m2: 185, href: 'weitblick.html',
    page: {
      hero: { img: WEB + 'FgqcPVVxOsp6bfePRyWpzND3ylQ.jpg', alt: 'Weißes Haus mit auskragendem Obergeschoss am Abend, davor ein Pool, Foto', top: 'Zwei Ebenen mit Auskragung / Foto, Platzhalter' },
      zahlenH: 'Unten Garten. Oben Blick.',
      zahlen: [['185', 'm²', 'Wohnfläche gesamt', 1], ['2', '', 'Ebenen', 1], ['Glas', '', 'Front zur Landschaft'], ['Flach', '', 'Dachform']],
      fig: { img: WEB + 'MivYWJEaGgbGD41Wrk5KtjDWPqU.jpg', alt: 'Haus am Hang von oben, Foto', cap: 'Abb. 02 / Am Hang / Foto, Platzhalter' },
      band: { img: WEB + 'S5wq8LaRxuE8KWfr8X7uLremE.jpg', alt: 'Terrasse unter dem auskragenden Obergeschoss, Foto', cap: 'Abb. 03 / Unter dem Obergeschoss / Foto, Platzhalter' },
      licht: [
        { img: WEB + 'akgUOvcI77asKhnC9ditt1tvV0.jpg', alt: 'Wohnraum mit Glasfront zur Terrasse, Foto', tag: 'Abb. 04 / Wohnen / Foto, Platzhalter', cap: 'Die Glasfront gehört der Landschaft' },
        { img: WEB + 'dwSiRsZPRfR256KgbCD7stEgR3I.jpg', alt: 'Essplatz vor der Glasfront, dahinter die Küche, Foto', tag: 'Abb. 05 / Essen / Foto, Platzhalter', cap: 'Unten öffnet sich das Wohnen zum Garten' },
        { img: WEB + 'vBroLID0qE6B0yeBV2vSpP0BnII.jpg', alt: 'Weiße Küche mit Kochinsel, Foto', tag: 'Abb. 06 / Kochen / Foto, Platzhalter', cap: 'Kochen mit Blick ins Tal' }
      ],
      lichtSay: 'Oben gehört der Raum dem Blick.'
    }
  }
];

/* Die Sammlung wächst: zehn Arbeitsmodelle in einer Reihe. 01 bis 04 sind offen, 05 bis 10 sind Platzhalter (ph),
   Namen und Formen vorläufig, bis die Concepts wirklich kommen. Formparameter siehe house3d.js CONCEPTS. */
export const SAMMLUNG = [
  { nr: '01', name: 'Stille', state: 'Offen', href: 'stille.html', form: 'wald' },
  { nr: '02', name: 'Einfachheit', state: 'Offen', href: 'einfachheit.html', form: 'duene' },
  { nr: '03', name: 'Leichtigkeit', state: 'Offen', href: 'leichtigkeit.html', form: 'summer' },
  { nr: '04', name: 'Weitblick', state: 'Offen', href: 'weitblick.html', form: 'hang' },
  { nr: '05', name: 'Geborgenheit', state: 'Bald', ph: true, form: { L0: 13, D: 10, H1: 3, L1: 13, H2: 3, sx: 0, up: 1, R: 0, gl: .6, gu: .6, ge: 0, slope: 0 } },
  { nr: '06', name: 'Freiheit', state: 'Bald', ph: true, form: { L0: 12, D: 9, H1: 3.1, L1: 12, H2: 3, sx: 0, up: 1, R: 3.4, gl: .5, gu: .4, ge: 0, slope: 0 } },
  { nr: '07', name: 'Klarheit', state: 'Bald', ph: true, form: { L0: 24, D: 6.5, H1: 3.2, L1: 24, H2: 0, sx: 0, up: 0, R: 0, gl: .9, gu: 0, ge: 0, slope: 0 } },
  { nr: '08', name: 'Gelassenheit', state: 'Bald', ph: true, form: { L0: 10, D: 10, H1: 3, L1: 14, H2: 3, sx: -2, up: 1, R: 3, gl: .6, gu: .6, ge: 0, slope: 0 } },
  { nr: '09', name: 'Nähe', state: 'Bald', ph: true, form: { L0: 14, D: 9, H1: 3.4, L1: 14, H2: 0, sx: 0, up: 0, R: 5, gl: .5, gu: 0, ge: 1, slope: 0 } },
  { nr: '10', name: 'Weite', state: 'Bald', ph: true, form: { L0: 8, D: 8, H1: 3, L1: 12, H2: 3, sx: 3, up: 1, R: 0, gl: .6, gu: .8, ge: 0, slope: .6 } }
];

/* Kapitel 01, Kennenlernen. Fragen und Antworten vom Kunden (2026-11-05). */
export const QUESTIONS = [
  { key: 'who', label: 'Wer wohnt bei dir?', multi: false, hint: 'Eine Antwort', opts: [['allein', 'Allein'], ['zwei', 'Zu zweit'], ['kinder', 'Mit Kindern'], ['generationen', 'Mehrere Generationen']] },
  { key: 'live', label: 'Wie lebst du?', multi: true, hint: 'Mehrere Antworten möglich', opts: [['arbeiten', 'Arbeiten zuhause'], ['gaeste', 'Gerne Gäste'], ['sport', 'Platz für Sport'], ['draussen', 'Am liebsten draußen']] },
  { key: 'wichtig', label: 'Was ist dir wichtig?', multi: false, hint: 'Eine Antwort', opts: [['offen', 'Ein offener Raum'], ['rueckzug', 'Rückzugsorte für alle'], ['ebene', 'Alles auf einer Ebene'], ['licht', 'Viel Licht']] }
];

export const DEFAULT_ANSWERS = { who: 'kinder', live: ['arbeiten', 'draussen'], wichtig: 'licht' };

/* Gespeicherte Antworten aus älteren Runden (andere Fragen) nicht übernehmen: nur gültige Werte zählen */
export function cleanAnswers(raw) {
  const a = { ...DEFAULT_ANSWERS };
  if (!raw || typeof raw !== 'object') return a;
  QUESTIONS.forEach(q => {
    const ok = new Set(q.opts.map(o => o[0])), v = raw[q.key];
    if (q.multi) { if (Array.isArray(v)) a[q.key] = v.filter(k => ok.has(k)); }
    else if (ok.has(v)) a[q.key] = v;
  });
  return a;
}

/* Erstes Raumprogramm aus den Antworten. Richtwerte vom Kunden ("Richtwerte, angepasst", 2026-11-05), keine Planung.
   Mit Kindern: die Zahl der Kinder wird nicht gefragt, gerechnet wird mit zwei (Annahme, mit dem Kunden klären). */
export const KIDS = 2;
export function program(a) {
  const R = [], live = a.live || [];
  const add = (room, m2, note) => R.push({ room, m2, note });
  add('Wohnen, Essen, Kochen', 45 + (a.wichtig === 'offen' ? 10 : 0), a.wichtig === 'offen' ? 'Größer, ein offener Raum.' : '');
  /* Immer: Eingang, Bad, WC, Technik zusammen 29 m², fürs Modell aufgeteilt */
  add('Eingang', 7); add('Bad', 9); add('WC', 3); add('Technik', 10);
  add('Schlafzimmer', 16);
  if (a.who === 'kinder') { for (let i = 0; i < KIDS; i++) add('Kinderzimmer', 13); if (KIDS >= 2) add('Zweites Bad', 8); }
  if (a.who === 'generationen') add('Eigener Wohnbereich mit Bad', 40, 'Ebenerdig, mit eigenem Zugang.');
  if (live.includes('arbeiten')) add('Arbeitszimmer', 12);
  if (live.includes('gaeste')) add('Gästezimmer mit Duschbad', 18);
  if (live.includes('sport')) add('Fitnessraum', 15);
  if (a.wichtig === 'rueckzug') add('Nischen', 6, 'Rückzugsorte für alle.');
  /* Zum Schluss: Flure und Wege, 15 % der Räume */
  const net = R.reduce((s, r) => s + r.m2, 0);
  add('Flure und Wege', Math.round(net * .15));
  const notes = [];
  if (live.includes('draussen')) notes.push('Eine große Terrasse.');
  if (a.wichtig === 'ebene') notes.push('Alles auf einer Ebene.');
  if (a.wichtig === 'licht') notes.push('Mehr Glas.');
  const total = R.reduce((s, r) => s + r.m2, 0);
  return { rooms: R, notes, total, oneLevel: a.wichtig === 'ebene', terrace: live.includes('draussen'), light: a.wichtig === 'licht' };
}

const WHO = { allein: 'Du wohnst allein', zwei: 'Du wohnst zu zweit', kinder: 'Du wohnst mit Kindern', generationen: 'Du wohnst mit mehreren Generationen' };
const LIVE = { arbeiten: 'arbeitest zuhause', gaeste: 'hast gerne Gäste', sport: 'brauchst Platz für Sport', draussen: 'bist am liebsten draußen' };
const WICHTIG = { offen: 'Dir ist ein offener Raum wichtig.', rueckzug: 'Dir sind Rückzugsorte für alle wichtig.', ebene: 'Dir ist wichtig, dass alles auf einer Ebene liegt.', licht: 'Dir ist viel Licht wichtig.' };
export function sentence(a) {
  const l = (a.live || []).map(k => LIVE[k]).filter(Boolean);
  const list = l.length > 1 ? l.slice(0, -1).join(', ') + ' und ' + l[l.length - 1] : l[0];
  return `${WHO[a.who] || WHO.zwei}${list ? ', ' + list : ''}. ${WICHTIG[a.wichtig] || ''}`.trim();
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

/* Seite Concept Wald, Grundriss in 3D (js/plan3d.js). Nur Raumnamen, keine Flächen. Koordinaten in pt wie in PLAN. */
export const PLAN_3D = {
  eg: { cap: 'Erdgeschoß', labels: [['Kochen', 436, 286], ['Essen', 431, 351], ['Wohnen', 686, 322], ['Büro', 650, 196], ['Eingang', 590, 152], ['Terrasse', 648, 434]] },
  og: { cap: 'Obergeschoß', labels: [['Eltern', 452, 342], ['Kind', 668, 150], ['Kind', 668, 340], ['Galerie', 557, 300], ['Bad', 476, 186]] }
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
  { nr: '03', name: 'Inspiration', say: 'Vier Concepts zum Weiterdenken.', scene: 'ideen', cap: 'Stille, Einfachheit, Leichtigkeit, Weitblick' },
  { nr: '04', name: 'Mischen', say: 'Du nimmst, was dir gefällt. Wir fügen es zusammen.', scene: 'mischen', cap: 'Aus vielen wird eins' },
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
