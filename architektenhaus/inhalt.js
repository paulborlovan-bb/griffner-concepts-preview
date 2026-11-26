/* /architektenhaus, Fassung 3 (2026-11-26). Paul zu Fassung 2: „too crowded, too much text, simpler, more smooth and flowey“.
   Darum: eine einzige Bühne, ein Gedanke pro Bildschirm (Überschrift + ein Satz), die Zeichnung wandelt sich beim Scrollen.
   Jeder Text als [Deutsch, English]. {E} = Entwurf (Architekten bestätigen bis 9.12.), {Z} = Zahl folgt. Keine Preise.
   Fakten nur von griffner.com (Journey, /projects/waldrand, Concepts, „Die Freiheit eines Architekten …“, seit 1950). */

export const T = {
  meta: {
    title: ['Architektenhaus aus Holz planen / GRIFFNER', 'Planning an architect-designed timber house / GRIFFNER'],
    entwurf: ['Entwurf', 'Draft'],
    zahl: ['Zahl folgt', 'Number to follow'],
  },

  hero: {
    info: ['Architektenhaus aus Holz', 'Architect-designed timber house'],
    h1: ['Wie plane ich ein Architektenhaus aus Holz?', 'How do I plan an architect-designed timber house?'],
    lead: ['Mit einem Architekten, der für dein Grundstück und dein Leben plant. Und einer Manufaktur, die genau so baut.',
      'With an architect who plans for your plot and your life. And a Manufaktur that builds exactly that.'],
    knopf: ['Katalog bestellen', 'Order the catalogue'],
    scroll: ['Scrollen', 'Scroll'],
  },

  motto: [['Die Freiheit eines Architekten.', 'The freedom of an architect.'], ['Die Sicherheit von 75 Jahren Hausbau.', 'The security of 75 years of building houses.']],

  schritte: [
    { art: 'grund', h: ['Dein Grundstück.', 'Your plot.'],
      p: ['Sonne, Blick, Hang. Wir planen dein Haus für genau diesen Ort.', 'Sun, view, slope. We plan your house for exactly this place.'] },
    { art: 'partner', h: ['Ein Partner für alles.', 'One partner for everything.'],
      p: ['Statt vieler Firmen hast du einen Vertragspartner. Wir koordinieren alle Gewerke rund um dein Haus.', 'Instead of many firms you have one contract partner. We coordinate all trades around your house.'] },
    { art: 'plan', h: ['Alles in einem Plan.', 'Everything in one plan.'],
      p: ['Architektur, Innenarchitektur und Haustechnik greifen ineinander. Kosten und Termine bleiben im Blick.', 'Architecture, interior design and building services fit together. Costs and dates stay in view.'] },
    { art: 'griffen', h: ['Gefertigt in Griffen.', 'Made in Griffen.'],
      p: ['Präzise und unter Dach, in unserer Manufaktur. {E} Dann steht dein Haus in wenigen Tagen. {Z}', 'Precisely and under a roof, in our Manufaktur. Then your house stands in a few days.'] },
    { art: 'foto', h: ['Kein Rendering.', 'Not a rendering.'],
      p: ['Das Haus am Waldrand. Aus einer Bleistiftskizze geplant, in 14 Tagen am Hang aufgestellt.', 'Haus am Waldrand. Planned from a pencil sketch, set up on its slope in 14 days.'],
      link: [['Das ganze Haus ansehen', 'See the whole house'], '/projects/waldrand'] },
    { art: 'zuhause', h: ['Dann schließt du auf.', 'Then you unlock the door.'],
      p: ['14 Tage deiner Zeit. Um den Rest kümmern wir uns.', '14 days of your time. We take care of the rest.'],
      link: [['So läuft deine Journey', 'How your Journey works'], '/journey'] },
  ],

  marken: {
    grund: ['Dein Grundstück', 'Your plot'], haus: ['Dein Haus', 'Your house'], morgen: ['Morgen', 'Morning'], abend: ['Abend', 'Evening'], blick: ['Der Blick', 'The view'],
    du: ['Du', 'You'], partner: ['Ein Partner', 'One partner'],
    gewerke: [['Planung', 'Planning'], ['Baumeister', 'Builder'], ['Haustechnik', 'Services'], ['Elektro', 'Electrics'], ['Küche und Bad', 'Kitchen and bath'], ['Garten', 'Garden']],
    schichten: [['Architektur', 'Architecture'], ['Innenarchitektur', 'Interior'], ['Haustechnik', 'Services'], ['Unterbau', 'Foundations'], ['Außenanlagen', 'Outdoors']],
    dach: ['Dach', 'Roof'], waende: ['Wände', 'Walls'], griffen: ['aus Griffen', 'from Griffen'], platte: ['Bodenplatte', 'Base slab'], vorort: ['vor Ort', 'on site'],
    fertig: ['Dein Haus', 'Your house'], fenster: ['Dein Zuhause', 'Your home'],
    foto: ['Foto, kein Rendering', 'Photo, not a rendering'],
    fotoAlt: ['Haus am Waldrand von GRIFFNER in Südkärnten, Holzhaus am Hang', 'Haus am Waldrand by GRIFFNER in South Carinthia, timber house on a slope'],
  },

  faq: {
    info: ['Häufige Fragen', 'Questions'],
    fragen: [
      [['Was ist ein Architektenhaus aus Holz?', 'What is an architect-designed timber house?'],
        ['Ein Haus, frei geplant für ein Grundstück und die Menschen darin. Bei GRIFFNER gefertigt in Griffen und auf deinem Grundstück montiert.',
          'A house planned freely for one plot and the people in it. At GRIFFNER it is made in Griffen and assembled on your plot.']],
      [['Kann ich ganz frei planen?', 'Can I plan completely freely?'],
        ['Ja, kein GRIFFNER Haus wurde zweimal gebaut. Du kannst auch bei einem unserer vier Concepts beginnen oder mit deinem eigenen Architekten kommen. {E}',
          'Yes, no GRIFFNER house has been built twice. You can also start from one of our four Concepts or bring your own architect.']],
      [['Wie läuft die Planung ab?', 'How does planning work?'],
        ['Vom Erstgespräch über Varianten und Entwurf bis zur Übergabe. Für dich sind es 14 Tage deiner Zeit, den Rest übernehmen wir.',
          'From the first talk through variants and design to the handover. For you it is 14 days of your time; we do the rest.']],
      [['Wie lange dauert es bis zum Einzug?', 'How long until I move in?'],
        ['Das hängt vom Projekt und von der Bewilligung ab. Den Terminrahmen legen wir bei der Beauftragung gemeinsam fest. {E}',
          'That depends on the project and the permit. We set the time frame together when you place the order.']],
      [['Brauche ich schon ein Grundstück?', 'Do I need a plot already?'],
        ['Nein. Hast du eines, prüfen wir vor Ort, was darauf möglich ist. {E}', 'No. If you have one, we check on site what is possible.']],
      [['Was kostet ein Architektenhaus aus Holz?', 'What does it cost?'],
        ['Das hängt von Größe, Grundstück und Ausstattung ab. Leistungsumfang und Gesamtinvestition legen wir gemeinsam fest, bevor gebaut wird.',
          'That depends on size, plot and fit-out. We agree scope and total investment together before anything is built.']],
    ],
  },

  next: {
    info: ['Dein nächster Schritt', 'Your next step'],
    h: ['Fang mit dem Katalog an.', 'Start with the catalogue.'],
    p: ['Gebaute Häuser, unsere Concepts und alles, was in einem GRIFFNER Haus steckt.', 'Houses we have built, our Concepts and everything that goes into a GRIFFNER house.'],
    knopf: ['Katalog bestellen', 'Order the catalogue'],
    link2: ['Oder ein Musterhaus besuchen', 'Or visit a show house'],
  },

  mehr: {
    info: ['Weiterlesen', 'Read on'],
    links: [
      [['Fertighaus ist nicht gleich Fertighaus.', 'Not all prefab houses are alike.'], '/fertighaus', ['Ab 15. Dezember', 'From 15 December']],
      [['Holzhaus oder Massivhaus?', 'Timber or masonry?'], '/holzhaus-oder-massivhaus', ['Ab 15. Dezember', 'From 15 December']],
      [['Die vier Concepts.', 'The four Concepts.'], '/concepts', null],
    ],
  },
};
