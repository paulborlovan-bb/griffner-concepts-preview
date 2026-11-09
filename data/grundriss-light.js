/* Runde 39: Concept Light als realistischer Grundriss (grundrisse.html, js/grundriss.js).
   Alles in Punkt aus den CAD Plänen (A4 EG und OG vom 2026-11-02), 1 m = 28,35 pt, Norden oben, y nach unten.
   Wände aus data/plan-geo.js (plan-eg, plan-og); das Obergeschoß liegt um off [17,3; −9,9] verschoben auf dem Erdgeschoß
   (gemessen an der Ostwand und der Nordwand, die in beiden Plänen übereinander stehen).
   Flächen: die Pläne nennen die Nettoraumflächen nach DIN 277, die stehen als a genau so in der Liste (ohne „ca.“).
   Material nach den Bildern: unten heller gespaltener Kalkstein, Holz im Osten (Nordseite neben dem Eingang, Ostseite, Südseite
   zwischen den Fenstern, Runde 40), oben helles Holz, Fassade im Osten ohne Absatz zwischen den Geschoßen (Runde 42),
   zwei dünne Flachdächer mit dunkler Kante, Glasgeländer auf der Terrasse, Carport mit Holzlamellen. Böden: Parkett in Eiche
   wie in allen Häusern, Bäder und WC in Stein (Runde 41).
   Nicht im Plan, aber auf den Bildern: der Pool im Süden und Fenster des Büros nach Norden (Plan gilt). */
const yl = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => +(a + (b - a) * i / n).toFixed(2));
export default {
  name: 'Light', key: 'light',
  K: 28.35,
  h: { eg: 2.8, og: 2.7, slab: .35, cut: 2.1 },
  floor: 'eiche',
  desc: 'Erdgeschoß in hellem Stein und Holz, Obergeschoß in Holz, zwei flache Dächer und die Terrasse oben.',
  build: 'Das Haus wird gebaut: erst das Erdgeschoß, dann die Vordächer, das Obergeschoß und das Dach.',
  floors: [
    {
      key: 'eg', name: 'Erdgeschoß', short: 'EG', geo: 'plan-eg',
      crop: [230, 85, 785, 440],
      out: { x0: [418.1, 338.7, 237.5, 769.4], x1: [738.5, 523.2, 778.2, 249.5], y0: [117.2, 245, 350.4, 95.9, 213.7], y1: [355.5, 434.9, 257, 433.5, 135.7] },
      skin: 'kalkstein',
      /* Holz (Runde 40 nach den Bildern): Süden zwischen Flügel und Ostecke, Norden östlich vom Eingang, die ganze Ostseite;
         die Wände des Carports. Stein bleibt: Norden bis zum Eingang, der Flügel im Westen und Süden, die Mauer an der Terrasse */
      skins: [[505, 338, 745, 362, 'holzhell'], [615, 110, 745, 135, 'holzhell'], [722, 128, 745, 345, 'holzhell'], [230, 90, 255, 260, 'holzhell']],
      mats: [[230, 90, 255, 260, 'holzhell']],
      house: [418.1, 117.2, 738.5, 355.5],
      base: [[418.1, 117.2, 738.5, 355.5], [338.7, 245, 523.2, 434.9], [523.2, 355.5, 778.2, 434.9], [237.5, 90, 418.1, 257], [418.1, 90, 646.3, 117.2]],
      /* Pfeile der Schiebetüren im Plan sind keine Wände */
      skip: [9, 19, 29, 31, 32, 35],
      /* die Wand unter der Treppe (Abstellraum darunter) endet unter den Stufen */
      caps: [[524.5, 264.7, 563.3, 268.3, 1.05]],
      /* Schiebetüren zur Technik: kein Türblatt */
      noDoor: [[512, 186.4], [510.8, 254.6]],
      rooms: [
        { f: 'beton', r: [[237.5, 90, 418.1, 257]] },
        { f: 'platten', r: [[418.1, 90, 646.3, 117.2]] },
        { n: 'Wohnen', list: 'Wohnen, Essen und Kochen', a: 65.49, r: [[350.1, 256.4, 511.8, 423.5], [511.8, 256.4, 524.5, 344.1], [524.5, 268.3, 727.1, 344.1], [563.3, 183.8, 624.4, 268.3], [627.9, 228.7, 727.1, 268.3]], at: [600, 300] },
        { n: 'Kochen', part: 1, at: [430, 285] },
        { n: 'Essen', part: 1, at: [431, 412] },
        { n: 'Büro', a: 11.92, r: [[627.9, 128.7, 727.1, 225.2]], at: [655, 200] },
        { n: 'Eingang', a: 9.25, r: [[492.5, 128.7, 624.4, 183.8]], at: [590, 165] },
        { n: 'Technik', list: 'Technik, Hauswirtschaft und Speis', a: 10.69, r: [[429.5, 189, 524.5, 252.8], [528, 189, 559.8, 264.7]], at: [470, 220] },
        { n: 'WC', list: 'WC mit Dusche', a: 4.08, f: 'stein', r: [[429.5, 128.7, 489, 183.8]], at: [468, 168] },
        { n: 'Terrasse', f: 'platten', r: [[523.2, 355.5, 769.4, 434.9]], at: [600, 410], out: 1 },
        { n: 'Carport', f: 'beton', r: [[249.5, 95.8, 418.1, 245]], at: [330, 225], out: 1 }
      ],
      rugs: [[636, 262, 66, 58, 'kalk'], [392, 360, 80, 48, 'sand']],
      windows: [
        /* Runde 40: kleines Fenster hoch im Stein; Eingang (Runde 41): dunkler Flügel im Osten so breit wie das Glas daneben */
        [454.5, 117.2, 475.3, 128.7, 1.65, 2.4, 'glas'],
        [562.5, 117.2, 620.1, 128.7, 0, 2.65, 'tuer', { leaf: 1.016, at: 'r', c: 'dunkel' }],
        /* Runde 42 (Bild): im Osten beide bis zum Boden, das beim Büro mit zwei Feldern */
        [727.1, 150.8, 738.5, 205.6, 0, 2.4, 'glas', { sp: 1 }],
        [727.1, 258.7, 738.5, 313.4, 0, 2.4, 'glas'],
        [535, 344.1, 618.1, 355.5, 0, 2.5, 'glas', { sp: 1 }],
        [680.4, 344.1, 723.8, 355.5, 0, 2.5, 'glas'],
        [338.7, 278.5, 350.1, 304.9, .9, 2.3, 'glas'],
        [338.7, 356.4, 350.1, 434.9, 0, 2.5, 'glas', { sp: 1 }],
        [350.1, 423.5, 452.8, 434.9, 0, 2.5, 'schiebe'],
        [511.8, 381, 523.2, 407.4, 0, 2.4, 'glas'],
        [418.1, 194.9, 429.5, 225.2, 0, 2.2, 'tuer', { leaf: 1.07 }]
      ],
      furn: [
        /* Kochen: Hochschränke und Zeile an der Nordwand, Insel mit Kochfeld, Hocker */
        ['tall', 350.1, 256.4, 60, 17, { f: 's', oven: 1 }], ['counter', 410.1, 256.4, 79.8, 17, { f: 's', sink: 1 }],
        ['island', 381.6, 298.8, 104.5, 28.3, { cook: [446, 306, 16, 14], seat: 's' }],
        ['stool', 385.8, 321.5, 11.4, 11.3], ['stool', 402.9, 321.5, 11.4, 11.3], ['stool', 385.8, 287.4, 11.4, 11.3], ['stool', 402.9, 287.4, 11.4, 11.3],
        ['pendant', 405, 313], ['pendant', 434, 313], ['pendant', 463, 313],
        /* Essen: Tisch für acht */
        ['table', 396.1, 366.8, 70.9, 34, { lamp: 1 }],
        ['chair', 400, 357.4, 13.3, 9.4, { f: 's' }], ['chair', 425, 357.4, 13.3, 9.4, { f: 's' }], ['chair', 450, 357.4, 13.3, 9.4, { f: 's' }],
        ['chair', 400, 400.8, 13.3, 9.4, { f: 'n' }], ['chair', 425, 400.8, 13.3, 9.4, { f: 'n' }], ['chair', 450, 400.8, 13.3, 9.4, { f: 'n' }],
        ['chair', 386.7, 377.2, 9.4, 13.3, { f: 'o' }], ['chair', 467, 377.2, 9.4, 13.3, { f: 'w' }],
        /* Wohnen: Sofa über Eck, runder Tisch, zwei Sessel, Sideboard */
        ['sofa', 627.9, 228.7, 25.5, 56.7, { f: 'o', arms: 'l', c: 'kalk' }],
        ['sofa', 653.4, 228.7, 51.3, 25.5, { f: 's', arms: 'r', c: 'kalk' }],
        ['otable', 664.9, 267.2, 25.6, 25.6, { round: 1, h: .36 }],
        ['chair', 700.4, 265.4, 18.9, 17, { f: 'w', lounge: 1 }], ['chair', 700.4, 291.5, 18.9, 16.9, { f: 'w', lounge: 1 }],
        ['lowboard', 621.5, 329.7, 55.2, 14.2, { f: 'n' }],
        ['plant', 710, 326, 13, 13, { big: 1 }], ['plant', 496, 406, 12, 12, { big: 1 }],
        /* Büro: Schreibtisch, Stuhl, zwei Sessel, Regal */
        ['desk', 679.1, 128.7, 22.6, 49.2, { f: 'o' }], ['ochair', 698.9, 146.2, 14.2, 14.2, { f: 'w' }],
        ['chair', 654.2, 133.6, 19.3, 19.4, { f: 'o', lounge: 1 }], ['chair', 655.8, 162.7, 19.8, 19.8, { f: 'o', lounge: 1 }],
        ['shelf', 627.9, 211, 99.2, 14.2, { f: 'n' }],
        /* WC mit Dusche */
        ['toilet', 435.1, 137.2, 17, 11.3, { f: 'o' }], ['shower', 429.5, 157.4, 22.6, 26.4], ['basin', 477.6, 132.9, 11.4, 19.7, { f: 'w' }],
        /* Eingang */
        ['wardrobe', 492.5, 128.7, 62.4, 17, { f: 's' }],
        ['shelf', 563.3, 208.7, 8.5, 59.6, { f: 'o' }],
        /* Technik, Hauswirtschaft, Speis */
        ['tech', 429.5, 189, 17.2, 34, { f: 'o' }], ['washer', 429.5, 230, 17, 17, { f: 'o' }],
        ['shelf', 462, 189, 34, 12, { f: 's' }], ['shelf', 528, 189, 31.8, 10, { f: 's' }],
        /* Terrasse: Tisch für sechs */
        ['table', 631.2, 381.2, 34, 22.7, { out: 1 }],
        ['ochair', 635, 372, 9, 9, { f: 's', out: 1 }], ['ochair', 652, 372, 9, 9, { f: 's', out: 1 }],
        ['ochair', 635, 404, 9, 9, { f: 'n', out: 1 }], ['ochair', 652, 404, 9, 9, { f: 'n', out: 1 }],
        ['ochair', 622, 388, 9, 9, { f: 'o', out: 1 }], ['ochair', 665.4, 388, 9, 9, { f: 'w', out: 1 }],
        ['osofa', 700, 412, 54, 18, { f: 'n' }],
        /* Carport: Holzlamellen zwischen den Wandscheiben im Westen */
        ['slats', 240.5, 135.7, 6, 78, { h: 2.8, gap: .26, fin: .07 }],
      ],
      cars: [[285.5, 155.5, 133, 51, 0xE9E7E2, 's'], [360, 157, 138, 54, 0x3f4042, 's']],
      /* Treppe: gerade nach Norden, Viertelwendel, zwei Stufen nach Osten (oben an der Galerie) */
      stair: {
        parts: [
          { dir: 'y', x: [528, 560], y: yl(312, 226.1, 11) },
          { c: [560, 226.1], rect: [528, 194, 560, 226.1], n: 4, a0: Math.PI, a1: 1.5 * Math.PI },
          { dir: 'x', y: [194, 226.1], x: [560, 570.5, 581] }
        ]
      },
      /* Vordächer und die Decke unter dem Obergeschoß: dünn, dunkle Kante, unten hell, oben Kies */
      /* Runde 42: die Decke unter dem Obergeschoß hat außen Holz wie die Fassade (im Osten und Norden ohne dunklen Absatz, Bild) */
      slabs: [{ r: [[213.5, 71.1, 646.3, 117.2], [213.5, 117.2, 418.1, 279.1], [315.3, 279.1, 418.1, 457.1], [418.1, 355.5, 802.3, 457.1], [738.5, 324.7, 802.3, 355.5]], t: .35, top: 'kies', side: 'anthrazit', under: 'weiss' },
        { r: [[418.1, 117.2, 738.5, 355.5]], t: .35, top: 'kies', side: 'holzhell', under: 'weiss' }]
    },
    {
      key: 'og', name: 'Obergeschoß', short: 'OG', geo: 'plan-og',
      crop: [315, 100, 768, 450], off: [17.3, -9.9],
      out: { x0: [400.8, 321.2], x1: [721.3, 761], y0: [127.1, 289.2, 358.3], y1: [365.4, 445.2] },
      skin: 'holzhell', baseSide: 'anthrazit',
      skins: [[315, 285, 405, 450, 'anthrazit'], [395, 435, 765, 450, 'anthrazit'], [715, 355, 765, 450, 'anthrazit']],
      house: [400.8, 127.1, 721.3, 365.4],
      base: [[400.8, 127.1, 721.3, 365.4], [321.2, 289.2, 400.8, 445.2], [400.8, 365.4, 761, 445.2], [721.3, 358.3, 761, 365.4]],
      /* Brüstung der Terrasse: niedrige Aufkantung, darauf Glas */
      low: b => (b[2] <= 401 && b[1] >= 289) || b[1] >= 437 || (b[0] >= 721.3 && b[1] >= 358), lowH: .15,
      skip: [31, 32],
      noDoor: [[476, 202.2], [476, 253.9]],
      rooms: [
        { n: 'Bad', list: 'Bad mit Wanne und Dusche', a: 9.37, f: 'stein', r: [[412.2, 138.5, 533.9, 200.4]], at: [480, 170] },
        { n: 'Bad', list: 'Duschbad', a: 5.37, f: 'stein', r: [[537.4, 138.5, 607.1, 200.4]], at: [575, 165] },
        { n: 'Ankleide', a: 5.70, r: [[412.2, 203.9, 507.2, 252.1]], at: [476, 228] },
        { n: 'Eltern', a: 11.62, r: [[412.2, 255.7, 507.2, 354]], at: [485, 300] },
        { n: 'Kind', list: 'Kind, Nordseite', a: 13.04, r: [[610.7, 138.5, 709.8, 236], [662.1, 236, 709.8, 253]], at: [665, 205] },
        { n: 'Kind', list: 'Kind, Südseite', a: 13.04, r: [[610.7, 256.5, 709.8, 354], [610.7, 239.5, 658.5, 256.5]], at: [665, 330] },
        { n: 'Galerie', a: 11.42, r: [[563.7, 203.9, 607.1, 354], [510.8, 302.5, 563.7, 354]], at: [585, 300] },
        { n: 'Terrasse', f: 'platten', r: [[328.3, 296.3, 400.8, 437.8], [400.8, 365.4, 753.9, 437.8]], at: [560, 400], out: 1 }
      ],
      /* Treppenauge (Luftraum über der Treppe) */
      void: [510.8, 203.9, 563.7, 302.5],
      rugs: [[425, 265, 44, 70, 'kalk']],
      windows: [
        /* Runde 40 (Bild 8): im Norden zwei kleine Fenster hoch oben mit Pfosten (eines ein Drittel, eines etwas mehr als die Hälfte
           vom Osten her), im Westen ein schmales hohes mit Kämpfer; im Osten mittelhoch mit Pfosten; im Süden zwei Felder */
        [437.3, 127.1, 458, 138.5, .1, 2.4, 'glas', { tr: [1.0] }],
        [546.6, 127.1, 601.4, 138.5, 1.4, 2.4, 'glas', { m: [571.3] }],
        [643.2, 127.1, 697.9, 138.5, 1.4, 2.4, 'glas', { m: [679.7] }],
        [709.8, 160.7, 721.3, 215.4, 1.0, 2.4, 'glas', { sp: 1 }],
        [709.8, 269, 721.3, 323.7, 1.0, 2.4, 'glas', { sp: 1 }],
        [400.8, 354, 474.3, 365.4, 0, 2.4, 'glas', { sp: 1 }],
        [400.8, 326.1, 412.2, 354, 0, 2.4, 'glas'],
        [531.9, 354, 586.6, 365.4, 0, 2.4, 'glas', { sp: 1 }],
        [651.8, 354, 706.5, 365.4, 0, 2.4, 'glas', { sp: 1 }]
      ],
      furn: [
        /* Bad mit Wanne und Dusche */
        ['toilet', 417.8, 151.4, 16.4, 11.4, { f: 'o' }], ['shower', 417.8, 174.9, 34.1, 25.5], ['glass', 451.2, 174.9, 1.5, 25.5],
        ['vanity', 463.4, 138.5, 47.8, 10.9, { f: 's', n: 2, mirror: 1 }], ['tub', 511.2, 149.4, 22.7, 51, { f: 'w' }],
        /* Duschbad */
        ['toilet', 543.1, 151.4, 18.4, 11.4, { f: 'o' }], ['shower', 537.4, 174.9, 34, 25.5], ['glass', 570.7, 174.9, 1.5, 25.5],
        ['basin', 594.4, 142.3, 12.7, 30.5, { f: 'w' }],
        /* Ankleide */
        ['wardrobe', 412.2, 203.9, 14.2, 48.1, { f: 'o' }], ['wardrobe', 426.4, 203.9, 32.6, 12.8, { f: 's' }],
        ['wardrobe', 426.4, 239.3, 32.6, 12.7, { f: 'n' }], ['wardrobe', 493, 203.9, 14.2, 48.1, { f: 'w' }],
        /* Eltern */
        ['bed', 414.2, 272.6, 56.7, 51, { head: 'w' }], ['night', 414.2, 258.1, 11, 11], ['night', 414.4, 327.3, 11, 11],
        ['lowboard', 495.9, 275.4, 11.3, 45.4, { f: 'w' }],
        /* Kind, Nordseite */
        ['bed', 610.7, 138.5, 34, 56.7, { head: 'n', single: 1, c: 'salbei' }], ['night', 646.1, 140, 10, 10],
        ['desk', 687.2, 166.8, 22.6, 42.5, { f: 'w' }], ['ochair', 672, 181, 14, 14, { f: 'o' }],
        ['wardrobe', 664, 236, 45.6, 17, { f: 'n' }],
        /* Kind, Südseite */
        ['bed', 610.7, 297.3, 34, 56.7, { head: 's', single: 1, c: 'sand' }], ['night', 646.1, 340.9, 10, 10],
        ['desk', 687.2, 275.1, 22.6, 42.6, { f: 'w' }], ['ochair', 674.8, 289.3, 11.3, 14.2, { f: 'o' }],
        ['wardrobe', 612.9, 239.5, 45.6, 17, { f: 's' }],
        /* Geländer am Treppenauge und auf der Brüstung der Terrasse */
        ['rail', 563.7, 236, 1.6, 66.5], ['rail', 510.8, 302.5, 52.9, 1.6],
        ['rail', 321.2, 292, 79, 1.6, { y: .15 }], ['rail', 324, 289.2, 1.6, 156, { y: .15 }], ['rail', 321.2, 440.7, 439.8, 1.6, { y: .15 }],
        ['rail', 756.6, 358.3, 1.6, 86.5, { y: .15 }], ['rail', 721.4, 361, 39.6, 1.6, { y: .15 }],
        /* Terrasse */
        ['ochair', 470, 400, 16, 16, { f: 'n', out: 1, lounge: 1 }], ['ochair', 495, 400, 16, 16, { f: 'n', out: 1, lounge: 1 }],
        ['otable', 485, 422, 13, 13, { h: .45, round: 1 }],
        ['plant', 335, 300, 13, 13, { big: 1 }], ['plant', 735, 420, 12, 12]
      ],
      /* Flachdach mit dünner dunkler Kante, etwa 0,8 m über die Wände */
      roofs: [{ type: 'flat', r: [[377.5, 104.7, 743.75, 387.5]], t: .32, top: 'kies', side: 'anthrazit', under: 'weiss' }]
    }
  ]
};
