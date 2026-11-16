/* Projekt-Galerie (projects-galerie.html): die acht Häuser aus „Weitere Referenzprojekte“ für alle Varianten und das Projektfenster.
   Quelle: data/referenzen.js (Häuser, kat 'haus'; Texte und Daten dort pflegen). Building und Living sind hier bewusst nicht dabei.
   Ein Bild = { t: Vorschau 600 px (galerie/<s>.jpg), m: 960 px, l: 1920 px (ref/<s>-m.webp, -l.webp), alt, r: Seitenverhältnis, pos }.
   Vorschaubilder: sips -s format jpeg -s formatOptions 52 -Z 600 bild --out assets/img/projekte/galerie/<s>.jpg, Seitenverhältnis in RATIO.
   Keine Familiennamen: die Vorschau ist öffentlich. */
import { REFERENZEN } from './referenzen.js';

const G = 'assets/img/projekte/galerie/', R = 'assets/img/projekte/ref/';
const RATIO = {'berge-1': 1.5, 'berge-2': 1.499, 'berge-3': 1.499, 'berge-4': 1.499, 'box-pool-1': 1.5, 'box-pool-2': 1.498, 'box-pool-3': 0.668, 'box-pool-4': 1.333, 'box-pool-5': 1.333, 'bungalow-flair-1': 1.5, 'bungalow-flair-2': 1.5, 'bungalow-flair-3': 0.667, 'bungalow-flair-4': 1.5, 'bungalow-flair-5': 1.5, 'bungalow-flair-6': 1.5, 'bungalow-flair-7': 1.5, 'bungalow-flair-8': 1.5, 'designhaus-1': 1.399, 'designhaus-2': 1.333, 'designhaus-3': 1.333, 'designhaus-4': 1.334, 'designhaus-5': 1.333, 'dunkle-fassade-1': 1.333, 'dunkle-fassade-2': 0.8, 'hang-pool-1': 1.333, 'hang-pool-2': 1.5, 'hang-pool-3': 1.5, 'hang-pool-4': 1.5, 'hang-pool-5': 1.5, 'hang-pool-6': 1.5, 'hang-pool-7': 1.5, 'hang-pool-8': 1.5, 'traum-gruen-1': 1.333, 'traum-gruen-2': 1.333, 'traum-gruen-3': 1.333, 'traum-gruen-4': 1.333, 'traum-gruen-5': 1.333, 'traum-gruen-6': 1.333, 'traum-gruen-7': 1.333, 'traum-gruen-8': 1.333, 'wienerwald-1': 1.502, 'wienerwald-2': 1.5, 'wienerwald-3': 1.5, 'wienerwald-4': 1.5, 'wienerwald-5': 0.667, 'wienerwald-6': 1.5};

/* Reihenfolge auf der Seite */
const ORDER = ['hang-pool', 'traum-gruen', 'wienerwald', 'bungalow-flair', 'designhaus', 'box-pool', 'berge', 'dunkle-fassade'];

export const GALERIE = ORDER.map(id => REFERENZEN.find(p => p.id === id)).filter(Boolean).map(p => ({
  ...p,
  img: p.img.map(i => ({ t: G + i.s + '.jpg', m: R + i.s + '-m.webp', l: R + i.s + '-l.webp', alt: i.alt, r: RATIO[i.s] || 1.5, pos: i.pos })),
}));
