// Baut die Framer Code-Komponente JourneyWeg (Runde 14, 2026-11-24): die Seite /journey nach dem Entwurf „Dein Weg“ (J10Journey)
// mit den eigenen Zeichnungen in „Wie wir das möglich machen.“ und den schöner eingebundenen Einträgen in „Besser leben.“.
// Runde 22 (2026-11-24): weißer Übergang „Was deine Journey noch besser macht.“ statt der schwarzen Titelseite, Schlussbild
// „Eines Tages schaust du zurück. Und lächelst.“ (Entwurf) statt „Von Anfang an ein gutes Gefühl.“ mit Knopf. Neue Feldnamen, damit alte Werte nicht greifen.
// Runde 23 (2026-11-24, Entwurf v10): Momente in den 14 gelben Feldern, steilere Kamera am Desktop, danach „Weil du es genau so wieder machen würdest.“ (Feld schluss3).
// Runde 24 (2026-11-24): iOS 26 Safari (Adressleiste oben) legt sticky-Bühnen unter die Leiste, sie rücken um die gemessene Fläche nach unten (--jw-obs);
// Schlussbild am Telefon erst das Foto, darunter die Headline; keine Fotokante unter dem Schwarz. Diagnose: /journey?jdiag
// Runde 25 (2026-11-24): am Telefon sind „Was deine Journey noch besser macht.“ und die Schluss-Headlines so groß wie die Hero-Headline (heroFs).
// Runde 25b: am Telefon kommt das Schlussbild weiß herein, das Foto blendet bildfüllend auf, zieht sich nach oben in seinen Rahmen und die schwarze Fläche steigt von unten (endBox, data-endwb, data-endpn).
// Quellen: basis.js, inhalt.js, weg-zeichnung.js, weg.js, weg.css (Vorschau: weg.html). Ersetzt JourneyEinstieg, JourneyGehen und JourneyLeben.
// Aufruf: cd griffner-konzepte/journey && node framer-bau-weg.mjs. Ziel: griffner/framer-code/JourneyWeg.tsx (erzeugt, nicht von Hand ändern).
import { readFileSync, writeFileSync } from 'node:fs';
import { DEF } from './weg.js';

const here = new URL('.', import.meta.url).pathname;
const OUTDIR = new URL('../../griffner/framer-code/', import.meta.url).pathname;
const src = f => readFileSync(here + f, 'utf8');
const noExport = s => s.replace(/^export (async function|const|let|function|class) /gm, '$1 ').replace(/^import .*$/gm, '');
const sect = f => `/* ---------- ${f} ---------- */\n${noExport(src(f))}\n`;
const mod = (name, f, names) => `/* ---------- ${f} ---------- */\nconst ${name} = (() => {\n${noExport(src(f))}\nreturn { ${names} };\n})();\n`;
const cssOf = (...fs) => fs.map(src).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s{2,}/g, ' ');

/* Fotos des Entwurfs, in Framer hochgeladen (2400 px, Qualität 80) */
const BILD = {
  weg: 'https://framerusercontent.com/images/OnyU0vHMXRCLs7597ROVJY7K9A.jpg',
  angekommen: 'https://framerusercontent.com/images/MciebrW3wttsi2dqkRoLusftZNs.jpg',
  terrasse: 'https://framerusercontent.com/images/mJp2wjsRSiX2ap5RQuiNySnZ7c.jpg',
  zurueck: 'https://framerusercontent.com/images/L2ltYOHmX9dUkIBQfBJ1Icrxbw.jpg'
};

const S = (title, def, extra = {}) => ({ type: 'ControlType.String', title, defaultValue: def, ...extra });
const T = (title, def, extra = {}) => S(title, def, { displayTextArea: true, ...extra });
const ctl = o => JSON.stringify(o, null, 4).replace(/"(ControlType\.\w+)"/g, '$1');
const obj = (title, controls, defaultValue, maxCount) => ({ type: 'ControlType.Array', title, maxCount, control: { type: 'ControlType.Object', controls }, defaultValue });

const controls = {
  hero1: S('Hero Zeile 1', DEF.hero[0]), hero2: S('Hero Zeile 2', DEF.hero[1]),
  manifest: T('Manifest', DEF.manifest),
  journey: S('Journey Titel', DEF.journey),
  phasen: obj('Phasen', { name: S('Name', ''), range: S('Tage', ''), desc: S('Satz', '') }, DEF.phasen, 3),
  marken: obj('Wegmarken', { zeile: S('Zeile', ''), titel: S('Titel', '') }, DEF.marken.map(([zeile, titel]) => ({ zeile, titel })), 3),
  tag: S('Wort für Tag', DEF.tag), kwKnopf: S('Knopf Stichworte', DEF.kwKnopf),
  tage: obj('Tage', { titel: S('Titel', ''), text: T('Text', ''), stichworte: T('Stichworte', '', { description: 'Mit · getrennt oder eins je Zeile' }) },
    DEF.tage.map(t => ({ titel: t.t, text: t.d, stichworte: t.k.join(' · ') })), 14),
  finale1: S('14 Tage Zeile 1', DEF.finale[0]), finale2: S('14 Tage Zeile 2', DEF.finale[1]),
  ankZeile: S('Tag 15 Zeile', DEF.ankommen.info), ankZahl: S('Tag 15 Zahl', DEF.ankommen.zahl),
  ankWoerter: { type: 'ControlType.Array', title: 'Tag 15 Wörter', maxCount: 3, control: { type: 'ControlType.String' }, defaultValue: DEF.ankommen.woerter },
  lebenZeile: S('Besser leben Zeile', DEF.leben.info), lebenZahl: S('Besser leben Zahl', DEF.leben.zahl),
  lebenTitel: S('Besser leben Titel', DEF.leben.h), lebenSatz: T('Besser leben Satz', DEF.leben.lead),
  punkte: obj('Besser leben Einträge', { titel: S('Titel', ''), merk: S('Merkzeile', '', { description: 'Kleine Zeile neben der Nummer, leer = keine' }), text: T('Text', '') },
    DEF.leben.punkte.map(p => ({ titel: p.t, merk: p.f, text: p.d })), 4),
  ubTitel: S('Übergang Titel', DEF.sys.kopf, { description: '/ = neue Zeile' }),
  themen: obj('System Themen', { titel: S('Titel', ''), text: T('Text', '') }, DEF.sys.themen.map(t => ({ titel: t.h, text: t.text })), 4),
  schluss1: S('Schluss Zeilen', DEF.schluss.h, { description: '/ = neue Zeile' }), schluss2: S('Schluss Nachsatz', DEF.schluss.h2, { description: '/ = neue Zeile' }),
  schluss3: S('Schluss danach', DEF.schluss.h3, { description: 'Ersetzt danach die Headline an derselben Stelle. / = neue Zeile' }),
  kapitel: { type: 'ControlType.Array', title: 'Leiste Kapitel', maxCount: 9, control: { type: 'ControlType.String' }, defaultValue: DEF.kapitel },
  bildWeg: { type: 'ControlType.ResponsiveImage', title: 'Bild Hero' },
  bildAngekommen: { type: 'ControlType.ResponsiveImage', title: 'Bild Tag 15' },
  bildTerrasse: { type: 'ControlType.ResponsiveImage', title: 'Bild Besser leben' },
  bildZurueck: { type: 'ControlType.ResponsiveImage', title: 'Bild Schluss' }
};

const files = ['basis.js', 'inhalt.js', 'weg-sys3d.js', 'weg.js', 'weg.css'];
const tsx = `// @ts-nocheck
// GRIFFNER Journey, Seite /journey (Runde 14, 2026-11-24): der Entwurf „Dein Weg“ als eine Komponente. Eine Kamerafahrt durch die 14 Tage,
// Tag 15, Besser leben (Bild mit Headline und vier Einträgen), Übergang „Was deine Journey noch besser macht.“, vier 3D-Szenen, Schlussbild (Runde 22).
// ERZEUGT von griffner-konzepte/journey/framer-bau-weg.mjs aus ${files.join(', ')}.
// Nicht von Hand ändern: dort ändern und neu bauen. Alle Texte sind Eingabefelder (rechts in Framer).
import { useEffect, useRef } from "react"
import { RenderTarget, addPropertyControls, ControlType } from "framer"
import { store, registerDock } from "./GriffnerStore.tsx"

const CSS = ${JSON.stringify(cssOf('weg.css'))}
${sect('basis.js')}${sect('inhalt.js')}${mod('WS', 'weg-sys3d.js', 'Szene, szeneDaten')}const Szene = WS.Szene
${mod('JW', 'weg.js', 'DEF, markup, mount, clean')}
/* ---------- Framer ---------- */
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
const IO = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const glatt = (y: number) => store.lenis ? store.lenis.scrollTo(y, { duration: Math.min(2.4, 1.1 + Math.abs(y - window.scrollY) / window.innerHeight * .18), easing: IO }) : window.scrollTo({ top: y, behavior: "smooth" })
/* Runde 13: auf /journey gleitet Lenis (SmoothScroll.tsx) 1,6 s statt 1,25 s; der letzte Journey-Teil stellt den alten Wert wieder her */
const RUHIG = 1.6
const ruhig = () => {
    const w: any = window, R = w.__jgRuhig || (w.__jgRuhig = { n: 0, L: null, d: 0, t: 0 })
    const set = () => { const L: any = store.lenis; if (!L || !L.options || R.L === L) return; if (R.L && R.L.options) R.L.options.duration = R.d; R.L = L; R.d = L.options.duration; L.options.duration = Math.max(RUHIG, R.d || 0) }
    if (R.n++ === 0) { set(); R.t = setInterval(set, 500) }
    let on = true
    return () => { if (!on) return; on = false; if (--R.n > 0) return; clearInterval(R.t); if (R.L && R.L.options) R.L.options.duration = R.d; R.L = null }
}
const BILD = ${JSON.stringify(BILD)}
const bild = (v: any, d: string) => (v && (v.src || (typeof v === "string" ? v : ""))) || d
function cfgOf(p: any) {
    return {
        hero: [p.hero1, p.hero2], manifest: p.manifest, journey: p.journey,
        phasen: (p.phasen || []).map((x: any) => ({ name: x?.name, range: x?.range, desc: x?.desc })),
        marken: (p.marken || []).map((x: any) => [x?.zeile, x?.titel]),
        tag: p.tag, kwKnopf: p.kwKnopf,
        tage: (p.tage || []).map((x: any) => ({ t: x?.titel, d: x?.text, k: x?.stichworte })),
        finale: [p.finale1, p.finale2],
        ankommen: { info: p.ankZeile, zahl: p.ankZahl, woerter: p.ankWoerter },
        leben: { info: p.lebenZeile, zahl: p.lebenZahl, h: p.lebenTitel, lead: p.lebenSatz, punkte: (p.punkte || []).map((x: any) => ({ t: x?.titel, f: x?.merk ?? "", d: x?.text })) },
        sys: { kopf: p.ubTitel, themen: (p.themen || []).map((x: any) => ({ h: x?.titel, text: x?.text })) },
        schluss: { h: p.schluss1, h2: p.schluss2, h3: p.schluss3 },
        kapitel: p.kapitel,
        bilder: { weg: bild(p.bildWeg, BILD.weg), angekommen: bild(p.bildAngekommen, BILD.angekommen), terrasse: bild(p.bildTerrasse, BILD.terrasse), zurueck: bild(p.bildZurueck, BILD.zurueck) },
        alt: { zurueck: (p.bildZurueck && p.bildZurueck.alt) || undefined },
    }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 */
export default function JourneyWeg(props: any) {
    const ref = useRef<HTMLDivElement>(null)
    const cfg = cfgOf(props)
    const html = JW.markup(cfg)
    useEffect(() => {
        const root = ref.current
        if (!root) return
        const still = RenderTarget.current() === RenderTarget.canvas, reduce = reduceMotion()
        const h = JW.mount(root, cfg, { reduce, still, scrollTo: glatt, lenis: () => store.lenis })
        const offs: any[] = []
        const offR = !still && !reduce ? ruhig() : null
        if (!still) {
            /* Das gelbe Feld der Website fährt als Läufer auf der Kapitel-Leiste mit (wie das gelbe Rechteck des Entwurfs).
               trigger: die Leiste liegt in keiner <section>, der Connector nimmt sonst nur Andockpunkte in Sektionen */
            const jw = root.querySelector(".jw")
            if (!reduce && jw) { jw.classList.add("has-dock"); offs.push(registerDock({ el: h.runner, kind: "box", id: "jw-leiste", solid: true, when: h.railOn, trigger: () => jw })); offs.push(() => jw.classList.remove("has-dock")) }
            /* Kopfzeile: über dem schwarzen Film und den Vollbild-Fotos weiß; über Weiß (Besser leben, System) im Differenz-Modus */
            const z1 = { el: h.film, on: h.dark }, z2 = { el: h.end, on: () => true }
            store.darkZones.add(z1); store.darkZones.add(z2)
            offs.push(() => { store.darkZones.delete(z1); store.darkZones.delete(z2) })
        }
        return () => { offs.forEach(f => f()); offR && offR(); h.dispose(); root.classList.remove("is-still") }
    }, [html])
    return (
        <div style={{ width: "100%" }}>
            <style data-jw-css="weg" dangerouslySetInnerHTML={{ __html: CSS }} />
            <div ref={ref} data-jw="JourneyWeg" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}
JourneyWeg.displayName = "Journey Weg"
addPropertyControls(JourneyWeg, ${ctl(controls)})
`;
writeFileSync(OUTDIR + 'JourneyWeg.tsx', tsx);
console.log('geschrieben', OUTDIR + 'JourneyWeg.tsx', (tsx.length / 1024).toFixed(1) + ' KB');
