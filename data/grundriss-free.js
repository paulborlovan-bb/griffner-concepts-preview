/* Runde 35: Concept Free als realistischer Grundriss für das Telefon (free-grundriss.html, js/grundriss.js).
   Alles in Punkt aus den CAD Plänen (2G FRAME EG und OG vom 2026-11-03), 1 m = 28,35 pt, Norden oben, y nach unten.
   Wände kommen aus data/plan-geo.js (plan-free-eg, plan-free-og), hier steht nur, was die Pläne nicht als Fläche haben:
   Räume mit Boden und Namen, Fenster und Türen in den Außenwänden, Möbel mit Art und Richtung, die Treppe.
   Das Obergeschoß hat seine eigenen Plan Koordinaten, off schiebt es auf das Erdgeschoß (wie in js/plan3d.js).
   Möbel: [Art, x, y, Breite, Tiefe, {f: Vorderseite n|o|s|w (dorthin schaut man, wenn man davor sitzt), ...}].
   Fenster: [x0, y0, x1, y1 (die Öffnung in der Wand), Brüstung m, Sturz m, Art glas|schiebe|tuer|tor, {sp: Sprossen}].
   Flächen in m² rechnet js/grundriss.js aus den Rechtecken (Innenmaß), gezeigt als „ca.“. */
export default {
  name: 'Free', key: 'free',
  K: 28.35,
  floor: 'eiche',
  desc: 'Erdgeschoß in Stein, Obergeschoß in Lärche, Satteldach mit Giebeln aus Glas über den Loggien.',
  view: [-.62, .42],
  /* Höhen in m: Erdgeschoß, Obergeschoß, Decke, Schnitt im Grundriss (so hoch stehen die Wände, solange ein Geschoß allein steht) */
  h: { eg: 2.9, og: 2.75, slab: .34, cut: 2.1 },
  floors: [
    {
      key: 'eg', name: 'Erdgeschoß', short: 'EG', geo: 'plan-free-eg',
      crop: [360, 185, 820, 725],
      /* Außenkanten der Hauswände (für die Steinfassade), Sockel (Haus, Terrasse im Norden, Vorplatz im Süden) */
      out: { x0: [371], x1: [807.7], y0: [253.5], y1: [641.2] }, skin: 'stein',
      house: [371, 253.5, 807.7, 641.2],
      base: [[371, 253.5, 807.7, 641.2], [552.5, 196.8, 779.4, 253.5], [552.5, 641.2, 779.4, 683.8]],
      /* niedrige Mauern außerhalb des Hauses (Vorplatz) */
      low: b => b[1] > 641,
      rooms: [
        { n: 'Wohnen', list: 'Wohnen, Essen und Kochen', f: 'eiche', r: [[563.9, 264.9, 796.3, 398.5], [629.3, 398.5, 796.3, 476.8]], at: [592, 306] },
        { n: 'Essen', part: 1, at: [738.3, 366] },
        { n: 'Kochen', part: 1, at: [745, 441] },
        { n: 'Sauna', list: 'Sauna und Duschen', f: 'fliese', r: [[382.4, 264.9, 552.5, 358.4]], at: [436, 279] },
        { f: 'fichte', r: [[382.4, 264.9, 467.4, 324.6]] },
        { n: 'Abstellraum', f: 'beton', r: [[382.4, 363.6, 465.7, 448.1]], at: [426, 418] },
        { n: 'Technik', f: 'beton', r: [[469.2, 363.6, 552.5, 448.1]], at: [500, 405] },
        { n: 'Garage', f: 'beton', r: [[382.4, 459.5, 552.5, 629.8]], at: [466, 471] },
        { n: 'WC', f: 'fliese', r: [[563.9, 482, 625.7, 520.5]], at: [588, 496] },
        { n: 'Eingang', list: 'Eingang mit Garderobe', f: 'fliese', r: [[563.9, 577.4, 663.3, 629.8], [629.3, 476.8, 663.3, 577.4], [563.9, 526.9, 625.7, 573.8]], at: [618, 604] },
        { n: 'Speis', f: 'eiche', r: [[668.6, 482, 796.3, 527.4]], at: [726, 497] },
        { n: 'Büro', f: 'eiche', r: [[668.6, 530.9, 796.3, 629.8]], at: [742, 580] },
        { n: 'Terrasse', f: 'platten', r: [[552.5, 196.8, 779.4, 253.5]], at: [662, 226], out: 1 },
        { f: 'platten', r: [[552.5, 641.2, 779.4, 683.8]] }
      ],
      rugs: [[586, 293, 64, 74, 'sand'], [706, 284, 64, 82, 'kalk']],
      windows: [
        [382.9, 253.5, 527.9, 264.9, 0, 2.6, 'glas', { sp: 4 }],
        [593.3, 253.5, 738.5, 264.9, 0, 2.6, 'schiebe'],
        [796.3, 282.3, 807.7, 379.5, 0, 2.6, 'glas', { sp: 2 }],
        [796.3, 428.4, 807.7, 454.7, 1, 2.3, 'glas'],
        [796.3, 488.8, 807.7, 503.9, 1.2, 2.3, 'glas'],
        [796.3, 545.7, 807.7, 600.4, .5, 2.4, 'glas', { sp: 1 }],
        [586.4, 629.8, 645.1, 641.2, 0, 2.4, 'tuer'],
        [396.6, 629.8, 538.3, 641.2, 0, 2.3, 'tor'],
        [371, 367.8, 382.4, 393.6, 1.1, 2.2, 'glas']
      ],
      furn: [
        /* Wohnen: Sofa über Eck, Couchtisch, Lowboard mit Fernseher an der Wand */
        ['sofa', 623.4, 279.1, 45.1, 24.1, { f: 's', arms: 'l', c: 'kalk' }],
        ['sofa', 642.8, 303.2, 25.7, 57.6, { f: 'w', arms: 'r', c: 'kalk' }],
        ['coffee', 604, 318.7, 18, 33.8],
        ['lowboard', 564.4, 285, 11.1, 86, { f: 'o' }],
        ['plant', 567, 380, 13, 13, { big: 1 }],
        ['plant', 780, 270, 13, 13, { big: 1 }],
        /* Essen */
        ['table', 724.5, 296.2, 28.2, 56.3, { lamp: 1 }],
        ['chair', 715, 299.3, 9.4, 13.3, { f: 'o' }], ['chair', 715, 317.3, 9.4, 14.1, { f: 'o' }], ['chair', 715, 335.8, 9.4, 13.9, { f: 'o' }],
        ['chair', 752.7, 299.3, 9.4, 13.3, { f: 'w' }], ['chair', 752.7, 317.3, 9.4, 14.1, { f: 'w' }], ['chair', 752.7, 335.8, 9.4, 13.9, { f: 'w' }],
        /* Kochen: Insel mit Kochfeld und Spüle, Barhocker, Hochschränke */
        ['island', 701.4, 393.6, 94.9, 28.3, { cook: [727, 406, 15, 14], sink: [768, 409, 13, 10], seat: 'n' }],
        ['stool', 711.2, 384.3, 11, 11], ['stool', 729.2, 384.3, 11, 11], ['stool', 747.8, 384.3, 11, 11],
        ['pendant', 716.7, 401], ['pendant', 735, 401], ['pendant', 753.3, 401],
        ['tall', 668.5, 459.9, 68.1, 17.2, { f: 'n', oven: 1 }], ['tall', 762.1, 459.9, 33.8, 17.2, { f: 'n' }],
        /* Speis */
        ['shelf', 668.5, 482, 17.2, 28.3, { f: 'o' }], ['shelf', 668.5, 510.3, 68.1, 16.7, { f: 'n' }],
        ['counter', 736.6, 510.3, 59.3, 16.7, { f: 'n', sink: 1 }],
        /* Büro */
        ['desk', 711.2, 531.1, 42.4, 16.6, { f: 's' }], ['ochair', 727, 548, 12, 12, { f: 'n' }],
        ['sofa', 706.7, 604.5, 51, 24.9, { f: 'n', arms: 'b', c: 'sand' }],
        ['plant', 781, 534, 11, 11],
        /* Eingang und Garderobe */
        ['wardrobe', 564.4, 579, 16.6, 50, { f: 'o' }],
        ['wardrobe', 563.9, 526.9, 61.8, 10, { f: 's' }], ['wardrobe', 608.7, 537, 16.6, 36.6, { f: 'w' }],
        /* WC */
        ['toilet', 592.3, 506.5, 11.3, 14, { f: 'n' }], ['basin', 608, 512, 13.5, 8.5, { f: 'n' }],
        /* Sauna, Duschen, Pflanzen am Fenster */
        ['bench', 382.4, 292.9, 85, 31.7, { f: 'n' }], ['stove', 385.8, 269.4, 15.2, 19.4],
        ['glass', 467.4, 264.9, 2, 26.9],
        ['shower', 397, 331, 16, 16], ['shower', 435, 331, 16, 16],
        ['plant', 530, 267, 11, 11], ['plant', 541, 289, 11, 11], ['shelf', 535.5, 316, 16.5, 40, { f: 'w', towels: 1 }],
        /* Technik, Abstellraum */
        ['tech', 535.3, 365, 17.2, 82, { f: 'w' }],
        ['shelf', 382.4, 396, 12, 50, { f: 'o' }], ['shelf', 396, 436, 50, 12, { f: 'n' }],
        /* Terrasse unter dem Obergeschoß */
        ['osofa', 562, 203, 54, 18, { f: 's' }], ['otable', 574, 226, 26, 13, { h: .38 }],
        ['table', 700, 213, 44, 24, { out: 1 }],
        ['ochair', 693, 216, 9, 9, { f: 'o', out: 1 }], ['ochair', 693, 228, 9, 9, { f: 'o', out: 1 }],
        ['ochair', 744, 216, 9, 9, { f: 'w', out: 1 }], ['ochair', 744, 228, 9, 9, { f: 'w', out: 1 }],
        ['plant', 762, 202, 14, 14, { big: 1 }], ['plant', 624, 202, 12, 12],
        /* Vorplatz */
        ['plant', 654, 652, 12, 12, { big: 1 }],
        /* Runde 39: Holzlamellen vor der Südseite (Eingang und Büro), so hoch wie das Erdgeschoß */
        ['slats', 663, 641.2, 133, 5, { h: 2.9, gap: .1, fin: .05 }]
      ],
      /* Autos in der Garage: Mitte x, y, Länge, Breite, Lack, Schnauze */
      cars: [[430.8, 549.8, 134, 50, 0xE9E7E2, 'n'], [500, 549.8, 134, 50, 0x3f4042, 'n']],
      /* Treppe (U mit Wendelstufen): Lauf 1 nach Westen, Wendel um das Auge, Lauf 2 nach Osten, oben im Flur des Obergeschoßes */
      stair: {
        run1: { y: [399.6, 432.4], x: [631.2, 623.5, 615.8, 608, 600.4] },
        wind: { c: [599.3, 438.7], rect: [563.9, 399.6, 600.4, 477.3], n: 8 },
        run2: { y: [445, 477.3], x: [600.4, 608, 615.8, 623.5, 631.2] }
      }
    },
    {
      key: 'og', name: 'Obergeschoß', short: 'OG', geo: 'plan-free-og',
      crop: [590, 130, 838, 637], off: [-47.8, 56.9],
      out: { x0: [600.3], x1: [827.2], y0: [196.6, 139.9], y1: [584.4, 626.9] }, skin: 'holz', baseSide: 'holz',
      house: [600.3, 196.6, 827.2, 584.4],
      base: [[600.3, 139.9, 827.2, 626.9]],
      /* Satteldach, First von Nord nach Süd, Stehfalz dunkel; Giebel über den Loggien aus Glas mit einem hellen Feld in der Mitte (Runde 39, wie auf den Bildern) */
      roofs: [{ type: 'gable', r: [600.3, 139.9, 827.2, 626.9], rise: 3.4, axis: 'y', edge: 'holz', gables: [{ at: 196.6, kind: 'glas', mid: .26, mat: 'putz' }, { at: 584.4, kind: 'glas', mid: .26, mat: 'putz' }] }],
      rooms: [
        { n: 'Eltern', list: 'Eltern', f: 'eiche', r: [[611.7, 208.1, 712, 336.7]], at: [655, 322] },
        { n: 'Bad', list: 'Bad bei den Eltern', f: 'fliese', r: [[712, 208.1, 815.8, 336.7], [716.4, 336.7, 815.8, 363.6]], at: [786, 296] },
        { n: 'Bad', list: 'Bad', f: 'fliese', r: [[716.4, 370, 815.8, 432.6]], at: [786, 403] },
        { n: 'WC', f: 'fliese', r: [[768, 439, 815.8, 469.9]], at: [784, 461] },
        { n: 'Kind', list: 'Kind, Westseite', f: 'eiche', r: [[611.7, 473.5, 707.1, 573], [707.1, 473.5, 724.1, 520.7]], at: [672, 556] },
        { n: 'Kind', list: 'Kind, Ostseite', f: 'eiche', r: [[727.6, 473.5, 815.8, 573], [710.6, 525.9, 727.6, 573]], at: [758, 556] },
        { f: 'eiche', r: [[680.5, 342, 711.1, 469.9], [611.7, 442, 711.1, 469.9], [611.7, 423.5, 673.5, 442]] },
        { n: 'Loggia', list: 'Loggia im Norden', f: 'deck', r: [[611.7, 139.9, 815.8, 196.6]], at: [714, 170], out: 1 },
        { n: 'Loggia', list: 'Loggia im Süden', f: 'deck', r: [[611.7, 584.4, 815.8, 626.9]], at: [714, 608], out: 1 }
      ],
      /* Treppenauge von oben gesehen: die Stufen des Erdgeschoßes, nach unten dunkler */
      void: [611.7, 342, 678.5, 420],
      rugs: [[628, 236, 62, 76, 'sand'], [628, 489, 44, 50, 'kalk'], [752, 489, 44, 50, 'kalk']],
      windows: [
        [641.1, 196.6, 786.3, 208.1, 0, 2.5, 'schiebe'],
        [638.6, 573, 693.3, 584.4, 0, 2.5, 'glas', { sp: 1 }],
        [734.1, 573, 788.8, 584.4, 0, 2.5, 'glas', { sp: 1 }],
        [600.3, 351.8, 611.7, 366.8, .9, 2.3, 'glas'], [600.3, 396.6, 611.7, 411.6, .9, 2.3, 'glas'], [600.3, 441.4, 611.7, 456.4, .9, 2.3, 'glas'],
        [815.8, 399.3, 827.2, 414.3, 1, 2.3, 'glas'], [815.8, 450.4, 827.2, 465.4, 1.2, 2.3, 'glas']
      ],
      furn: [
        /* Eltern */
        ['bed', 619.9, 245.2, 57.3, 56, { head: 'w' }], ['night', 620, 232.5, 11, 11], ['night', 620, 302.5, 11, 11],
        ['lowboard', 709.1, 242.2, 12, 62.3, { f: 'w', h: 1.1 }],
        ['plant', 690, 213, 11, 11],
        /* Bad bei den Eltern: Wanne frei im Raum, Doppelwaschtisch, Schrank, Dusche und WC */
        ['tub', 753.1, 226.4, 21.1, 42.1, { free: 1 }], ['vanity', 753.1, 270.7, 21.1, 41.5, { f: 'w', n: 2 }],
        ['wardrobe', 798.8, 208.4, 16.9, 128, { f: 'w' }],
        ['glass', 759, 342, 1.5, 21.6], ['shower', 726, 343, 18, 18],
        ['toilet', 801, 343.5, 14.8, 13, { f: 'w' }],
        /* Bad */
        ['tub', 716.8, 371, 47.7, 20.2], ['vanity', 746.8, 416.9, 39.3, 15.7, { f: 'n', n: 2, mirror: 1 }],
        ['cab', 717, 421.5, 21, 11, { f: 'n' }], ['cab', 794, 421.5, 21, 11, { f: 'n' }],
        /* WC */
        ['toilet', 795.6, 439, 12.6, 14.5, { f: 's' }], ['basin', 776, 439, 13, 8, { f: 's' }],
        /* Waschen */
        ['washer', 639, 424, 17, 16.5, { f: 's' }], ['washer', 656.5, 424, 17, 16.5, { f: 's' }],
        /* Kinder */
        ['bed', 613, 495.6, 56.8, 40.1, { head: 'w', single: 1, c: 'salbei' }], ['desk', 612.2, 539.3, 16.6, 33.2, { f: 'o' }], ['ochair', 631, 549, 11, 11, { f: 'w' }],
        ['wardrobe', 707.2, 473.5, 16.9, 46.5, { f: 'w' }],
        ['bed', 757.8, 495.6, 56.8, 40.1, { head: 'o', single: 1, c: 'sand' }], ['desk', 798.5, 539.3, 16.6, 33.2, { f: 'w' }], ['ochair', 784, 549, 11, 11, { f: 'o' }],
        ['wardrobe', 710.8, 525.9, 16.9, 47, { f: 'o' }],
        /* Loggien mit Glasgeländer */
        ['rail', 611.7, 139.9, 204.1, 1.6], ['rail', 611.7, 625.3, 204.1, 1.6], ['rail', 678.5, 342, 1.6, 46],
        ['ochair', 662, 152, 16, 16, { f: 'n', out: 1, lounge: 1 }], ['ochair', 752, 152, 16, 16, { f: 'n', out: 1, lounge: 1 }],
        ['otable', 706, 157, 15, 15, { h: .45, round: 1 }],
        ['plant', 618, 146, 12, 12, { big: 1 }], ['plant', 797, 146, 12, 12, { big: 1 }],
        ['ochair', 690, 596, 16, 16, { f: 's', out: 1, lounge: 1 }], ['otable', 712, 600, 13, 13, { h: .45, round: 1 }],
        ['plant', 618, 600, 11, 11]
      ]
    }
  ]
};
