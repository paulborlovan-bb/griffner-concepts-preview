/* Projekt-Galerie (projects-galerie.html): alle Projekte in einer Liste für die fünf Varianten und das Projektfenster.
   Quelle 1: data/referenzen.js (Häuser aus „Weitere Referenzprojekte“ und GRIFFNER Building).
   Quelle 2: GRIFFNER Living und das Floating House wie live auf griffner.com/projects (Texte von dort, je ein Bild, Link zur Projektseite).
   Ein Bild = { t: kleines Vorschaubild (600 px), l: großes Bild fürs Fenster, alt, r: Seitenverhältnis, pos }.
   Vorschaubilder: assets/img/projekte/galerie/<name>.jpg (sips, 600 px, siehe Notiz in projects-galerie.html).
   Keine Familiennamen: die Vorschau ist öffentlich. */
import { REFERENZEN } from './referenzen.js';

const G = 'assets/img/projekte/galerie/', P = 'assets/img/projekte/', R = 'assets/img/projekte/ref/';
const RATIO = {'berge-1': 1.5, 'berge-2': 1.499, 'berge-3': 1.499, 'berge-4': 1.499, 'box-pool-1': 1.5, 'box-pool-2': 1.498, 'box-pool-3': 0.668, 'box-pool-4': 1.333, 'box-pool-5': 1.333, 'bungalow-flair-1': 1.5, 'bungalow-flair-2': 1.5, 'bungalow-flair-3': 0.667, 'bungalow-flair-4': 1.5, 'bungalow-flair-5': 1.5, 'bungalow-flair-6': 1.5, 'bungalow-flair-7': 1.5, 'bungalow-flair-8': 1.5, 'designhaus-1': 1.399, 'designhaus-2': 1.333, 'designhaus-3': 1.333, 'designhaus-4': 1.334, 'designhaus-5': 1.333, 'dunkle-fassade-1': 1.333, 'dunkle-fassade-2': 0.8, 'hang-pool-1': 1.333, 'hang-pool-2': 1.5, 'hang-pool-3': 1.5, 'hang-pool-4': 1.5, 'hang-pool-5': 1.5, 'hang-pool-6': 1.5, 'hang-pool-7': 1.5, 'hang-pool-8': 1.5, 'traum-gruen-1': 1.333, 'traum-gruen-2': 1.333, 'traum-gruen-3': 1.333, 'traum-gruen-4': 1.333, 'traum-gruen-5': 1.333, 'traum-gruen-6': 1.333, 'traum-gruen-7': 1.333, 'traum-gruen-8': 1.333, 'wienerwald-1': 1.502, 'wienerwald-2': 1.5, 'wienerwald-3': 1.5, 'wienerwald-4': 1.5, 'wienerwald-5': 0.667, 'wienerwald-6': 1.5, 'bld-griffen-green': 1.502, 'bld-juwi': 1.505, 'bld-koralpe': 1.334, 'bld-park': 1.501, 'bld-wien': 1.499, 'fh-1': 1.461, 'fh-2': 1.334, 'fh-3': 1.499, 'fh-4': 1.5, 'fh-5': 1.499, 'fh-6': 1.5, 'hero-floating-house': 1.499, 'liv-eisteich': 1.5, 'liv-grundlsee': 1.775, 'liv-hang': 1.449, 'liv-pfarrhof': 1.499, 'liv-waldrand': 1.499, 'liv-waldviertel': 1.499, 'liv-weitblick': 1.499, 'liv-wien': 1.5};

const one = (key, alt, pos) => ({ t: G + key + '.jpg', l: P + key + '.jpg', alt, r: RATIO[key] || 1.5, pos });
const live = slug => ({ href: 'https://griffner.com/projects/' + slug, label: 'Zur Projektseite' });

const LIVING = [
  { id: 'weitblick', kat: 'haus', info: 'Donautal / Niederösterreich / AT', name: 'Haus mit Weitblick',
    text: 'Drei Geschosse auf einem terrassierten Hang, im Rücken das Waldviertel, vorne der Blick ins Donautal. 300 Quadratmeter, 2,72 Meter hohe Räume und eine freischwebende Treppe mit Glasseiten.',
    link: live('weitblick'), img: [one('liv-weitblick', 'Weißes Haus mit Holzelementen am Hang über dem Donautal, davor Garten und Pool am Abend')] },
  { id: 'waldrand', kat: 'haus', info: 'Südkärnten / AT', name: 'Haus am Waldrand',
    text: 'Ein Holzhaus wie eine zusammengesteckte Spange. Aus einer Bleistiftskizze geplant und in 14 Tagen am Hang aufgestellt.',
    link: live('waldrand'), img: [one('liv-waldrand', 'Haus am Waldrand in Südkärnten')] },
  { id: 'grundlsee', kat: 'haus', info: 'Grundlsee / Steiermark / AT', name: 'Haus am Grundlsee',
    text: 'Ferienhaus, Familienhaus und Alterssitz. 30 Meter über dem See, innen bis zu 4,50 Meter hoch und so gebaut, dass es Lawinen standhält.',
    link: live('grundlsee'), img: [one('liv-grundlsee', 'Haus am Grundlsee in der Steiermark')] },
  { id: 'waldviertel', kat: 'haus', info: 'Waldviertel / AT', name: 'Haus im Waldviertel',
    text: '182,5 Quadratmeter mit so wenig Wänden wie möglich. Tagsüber energieautark.',
    link: live('waldviertel'), img: [one('liv-waldviertel', 'Haus im Waldviertel')] },
  { id: 'hang', kat: 'haus', info: 'Kärnten / AT', name: 'Haus am Hang',
    text: '139 Quadratmeter für eine Familie mit zwei Kindern. Vom Keller bis zum Einzug in sechs Monaten.',
    link: live('hang'), img: [one('liv-hang', 'Haus am Hang in Kärnten mit Pool')] },
  { id: 'pfarrhof', kat: 'haus', info: 'Rudelzhausen / DE', name: 'Haus am Pfarrhof',
    text: 'Eine schwarze Holzfassade, zurückhaltend zum alten Pfarrhof und offen zum Teich.', credit: 'Fotos: Griffnerhaus / keller-fotografie.de',
    link: live('pfarrhof'), img: [one('liv-pfarrhof', 'Haus am Pfarrhof mit schwarzer Holzfassade am Teich')] },
  { id: 'eisteich', kat: 'haus', info: 'Niederösterreich / AT', name: 'Haus am Eisteich',
    text: '450 Quadratmeter auf 8000 Quadratmetern Grund, an einem Teich, der 1800 erstmals erwähnt wurde. Innen Altholz aus einem 300 Jahre alten Stadl.',
    facts: [['Award', 'Hausbau Design Award 2025, Silber']],
    link: live('eisteich'), img: [one('liv-eisteich', 'Haus am Eisteich in Niederösterreich')] },
  { id: 'wien-bungalow', kat: 'haus', info: 'Wien / AT', name: 'Bungalow in Wien',
    text: '150 Quadratmeter auf einer Ebene, geplant nach dem Vorbild einer Spa-Villa aus dem Lieblingsurlaub.',
    link: live('wien'), img: [one('liv-wien', 'Bungalow in Wien mit Garten')] },
];

const FLOATING = {
  id: 'floating-house', kat: 'haus', info: 'Musterhaus / Griffen / Kärnten / AT', name: 'Floating House',
  text: 'Das erste Wohnhaus, das Studio F. A. Porsche entworfen hat. Gefertigt und gebaut von GRIFFNER in Griffen, in jedem Detail so präzise, wie es gezeichnet war.',
  facts: [['Design', 'Studio F. A. Porsche'], ['Raumhöhe', 'bis 5,85 m'], ['Rohbau', 'in zwei Wochen']],
  link: live('floating-house'),
  img: [
    one('hero-floating-house', 'Floating House in Griffen, Ansicht aus dem Garten zur Blauen Stunde'),
    one('fh-1', 'Floating House, Fassadenbänder und schwarzes Glas im Erdgeschoss'),
    one('fh-2', 'Floating House, Fassade mit raumhohen Fenstern und Loggia'),
    one('fh-3', 'Floating House, Blick von der Galerie in den Essbereich'),
    one('fh-4', 'Floating House, freischwebende Treppe mit Glasabschluss'),
    one('fh-5', 'Floating House, Salon mit Billardtisch'),
    one('fh-6', 'Floating House bei Tag, Holzfassade und Einfahrt'),
  ],
};

/* Referenzen: s = Basisname in ref/ (Vorschau aus -l.webp), src = einzelnes Bild in assets/img/projekte/ */
const fromRef = p => ({
  ...p,
  img: p.img.map(i => {
    if (i.s) return { t: G + i.s + '.jpg', l: R + i.s + '-l.webp', alt: i.alt, r: RATIO[i.s] || 1.5, pos: i.pos };
    const key = i.src.split('/').pop().replace(/\.jpg$/, '');
    return { t: G + key + '.jpg', l: i.src, alt: i.alt, r: RATIO[key] || 1.5, pos: i.pos };
  }),
});
const REFS = REFERENZEN.map(fromRef);

/* Reihenfolge: Floating House vorn, dann neue Häuser, Living und Building im Wechsel, damit es eine Sammlung bleibt */
const byId = Object.fromEntries([FLOATING, ...LIVING, ...REFS].map(p => [p.id, p]));
const ORDER = ['floating-house', 'hang-pool', 'weitblick', 'koralpe', 'wienerwald', 'waldrand', 'traum-gruen', 'juwi', 'grundlsee', 'bungalow-flair',
  'eisteich', 'park', 'designhaus', 'pfarrhof', 'berge', 'griffen-green', 'waldviertel', 'box-pool', 'hang', 'wien', 'dunkle-fassade', 'wien-bungalow'];
export const GALERIE = [...ORDER.map(id => byId[id]).filter(Boolean), ...Object.values(byId).filter(p => !ORDER.includes(p.id))];
