/* Runde 48: Grundstück für „Alles aus einer Hand“ (js/grundstueck3d.js) und die Linienzeichnung im Leistungsumfang.
   Lage frei nach einem Gartenplan (Maßstab 1:100, ohne Namen, ohne Planverfasser, den Plan selbst zeigen wir nicht):
   1 m = 34 px auf dem Foto des Plans, x nach rechts, z nach unten (Straße oben), Ursprung mitten im Garten.
   Höhen: Fußboden Haus 0, Garten −0,45 m. Maße in m. Das Haus ist frei nach Concept Bold (zwei Geschoße, Flachdach, dunkler Rahmen, Lärche). */
export const LAWN = -0.45;

/* Grundstücksgrenze im Uhrzeigersinn, oben die Straße */
export const PLOT = [[-15.9, -17.2], [11.8, -16.8], [14.3, -15.8], [14.3, 7.1], [2.4, 22.9], [-7.4, 0.4], [-12.6, -6.6]];

export const HAUS = { x0: -2.9, x1: 9.3, z0: -13.2, z1: -5.2 };            // zwei Geschoße
export const ANBAU = [
  { k: 'technik', x0: -5.4, x1: 0.6, z0: -16.2, z1: -13.2, h: 3.0 },      // Technik und Abstellraum zur Straße
  { k: 'eingang', x0: -5.4, x1: -2.9, z0: -12.0, z1: -8.6, h: 3.0 },      // Eingang zum Carport
  { k: 'essen', x0: 1.2, x1: 5.2, z0: -5.2, z1: -3.2, h: 3.0, glas: 1 }   // Essplatz, verglast, zum Garten
];
export const CARPORT = { x0: -12.1, x1: -5.4, z0: -16.2, z1: -10.6, dach: { x0: -7.0, x1: -5.4, z0: -10.6, z1: -8.6 } };
export const SAUNA = { x0: 9.7, x1: 11.8, z0: -15.9, z1: -13.3 };          // Outdoor-Sauna 2,1 × 2,6 m

/* Holzterrassen auf Hausniveau: Streifen zur Sauna, Lounge, vor der Küche */
export const DECKS = [
  { k: 'streifen', x0: 9.3, x1: 12.1, z0: -13.3, z1: -5.2 },
  { k: 'lounge', x0: 5.2, x1: 13.0, z0: -5.2, z1: -1.6 },
  { k: 'kueche', x0: -2.9, x1: 1.2, z0: -5.2, z1: -3.2 }
];
export const UEBERDACHUNG = { x0: 5.2, x1: 9.3, z0: -5.2, z1: -2.6 };    // Terrassenüberdachung
export const POOLDECK = { x0: 3.8, x1: 12.9, z0: -1.6, z1: 3.8 };         // 5 cm über dem Rasen
export const POOL = { x0: 4.2, x1: 11.2, z0: 0.3, z1: 3.3 };              // 7 × 3 m
export const DUSCHE = [12.5, -0.9];
export const ESSPLATZ = { x0: -4.5, x1: 1.6, z0: -2.75, z1: 1.6 };        // Platten im Garten, Tisch und Sonnensegel
export const KRAEUTER = [{ x0: -4.9, x1: -4.1, z0: -5.9, z1: -3.4 }, { x0: -3.9, x1: -3.1, z0: -5.9, z1: -3.4 }];
export const HOCHBEETE = [{ x0: 1.2, x1: 2.8, z0: 7.0, z1: 7.6 }, { x0: 3.8, x1: 5.4, z0: 7.0, z1: 7.6 }];
export const GLASHAUS = { x0: 3.6, x1: 5.6, z0: 7.9, z1: 10.9 };          // 2 × 3 m
export const HUETTE = { x0: 1.2, x1: 3.2, z0: 8.4, z1: 10.4 };            // 2 × 2 m

/* Bäume: x, z, Kronenradius, Art (gelb = hellgrün wie im Plan, dunkel) */
export const BAEUME = [
  [3.5, -15.0, 1.8, 'gelb'], [7.5, -15.0, 1.9, 'gelb'],
  [12.8, -11.6, 1.3, 'dunkel'], [12.6, -8.7, 1.4, 'dunkel'], [13.0, -6.5, 1.2, 'dunkel'],
  [-13.6, -11.4, 2.4, 'dunkel'], [-8.6, -3.4, 2.6, 'dunkel'],
  [0.2, 3.6, 3.0, 'gelb'], [7.0, 6.0, 1.9, 'dunkel'], [10.0, -2.5, 1.1, 'gelb'], [-4.2, -7.2, 0.9, 'gelb']
];
export const BUESCHE = [[2.6, 12.8], [4.0, 13.4], [-1.5, 8.5], [9.2, 9.8], [5.0, 15.0], [-3.6, 4.6], [6.4, 12.0], [1.4, 18.0]];
export const BEEREN = [[8.8, 7.0], [9.6, 7.4], [10.4, 7.1], [11.2, 7.5], [12.0, 7.2], [12.8, 7.4]];
/* Hecken entlang der Grenze, 0,8 m eingerückt */
export const HECKEN = [[[13.5, -15.0], [13.5, 6.6]], [[13.66, 6.62], [1.76, 22.42]], [[-6.67, 0.08], [3.13, 22.58]]];
/* Steinmauer am Hang (links unten fällt das Gelände zum Nachbarn ab) */
export const MAUER = [[-12.6, -6.6], [-7.4, 0.4], [2.4, 22.9]];
