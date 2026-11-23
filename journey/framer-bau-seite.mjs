// Baut die Framer Code-Komponenten der Seite /journey (Runde 10, 2026-11-23; Runde 11 am selben Tag: Halte-Scrollen, Leben als ein Bildschirm mit Zeichnungen; Runde 12: Halte-Scrollen schneller, folgt dem Finger, nicht gesperrt) aus den Teilen der Vorschlagsseite gehen.html:
//   JourneyEinstieg: einstieg.js (wie der Anfang von Über uns)
//   JourneyGehen:    gehen-szene.js (die 14 Tage mit dem Paar) und stapel.js (Der Stapel), beide aus derselben Liste der Tage
//   JourneyLeben:    leben.js (Ab Tag 15, fünf Kapitel, Abschluss mit Knopf)
// Gemeinsam: basis.js, basis.css, inhalt.js (alle Texte; hier werden sie zu Eingabefeldern in Framer).
// Aufruf: cd griffner-konzepte/journey && node framer-bau.mjs (baut auch JourneyGehen2/3 aus Runde 9) oder node framer-bau-seite.mjs.
// Ziel: griffner/framer-code/Journey*.tsx (erzeugt, nicht von Hand ändern).
import { readFileSync, writeFileSync } from 'node:fs';
import { TAGE, SZENE, STAPEL, EINSTIEG, LEBEN } from './inhalt.js';

const here = new URL('.', import.meta.url).pathname;
const OUTDIR = new URL('../../griffner/framer-code/', import.meta.url).pathname;
const src = f => readFileSync(here + f, 'utf8');
const noExport = s => s.replace(/^export (async function|const|let|function|class) /gm, '$1 ').replace(/^import .*$/gm, '');
const sect = f => `/* ---------- ${f} ---------- */\n${noExport(src(f))}\n`;
/* Ein Teil der Seite als eigener Bereich (gleiche Namen wie DEF, markup, mount in mehreren Teilen) */
const mod = (name, f, names) => `/* ---------- ${f} ---------- */\nconst ${name} = (() => {\n${noExport(src(f))}\nreturn { ${names} };\n})();\n`;
const cssOf = (...fs) => fs.map(src).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s{2,}/g, ' ');
const LIZENZ = readFileSync(new URL('./familie-echt-LIZENZ.txt', import.meta.url), 'utf8');
const URL3 = 'https://framerusercontent.com/assets/ttpcYC8BdRagbY1NydB6vu9Z4s.gz'; // familie-echt.bin.gz (das Paar, WebP 512), Runde 9
const URL3S = 'https://framerusercontent.com/assets/7wb8HI39JrQuLr6s7fcBUJPY97I.gz'; // familie-echt-s.bin.gz (das Paar für Telefone, WebP 256), Runde 9

const S = (title, def, extra = {}) => ({ type: 'ControlType.String', title, defaultValue: def, ...extra });
const ctl = o => JSON.stringify(o, null, 4).replace(/"(ControlType\.\w+)"/g, '$1');
const head = (title, files) => `// @ts-nocheck
// GRIFFNER Journey, Seite /journey (Runde 12): ${title}
// ERZEUGT von griffner-konzepte/journey/framer-bau-seite.mjs aus ${files.join(', ')}.
// Nicht von Hand ändern: dort ändern und neu bauen. Alle Texte sind Eingabefelder (rechts in Framer).
`;
const FRAMER = `/* ---------- Framer ---------- */
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
/* Teil im Bild? (für das gelbe Feld der Website) */
const vis = (el: any, a = 1, b = 0) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight * a && r.bottom > innerHeight * b }
const glatt = (y: number) => store.lenis ? store.lenis.scrollTo(y, { duration: 1.6 }) : window.scrollTo({ top: y, behavior: "smooth" })
`;
const LAYOUT = `/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 */`;
const write = (name, tsx) => { writeFileSync(OUTDIR + name + '.tsx', tsx); console.log('geschrieben', OUTDIR + name + '.tsx', (tsx.length / 1024).toFixed(1) + ' KB'); };
const IMPORTS = `import { useEffect, useRef } from "react"
import { RenderTarget, addPropertyControls, ControlType } from "framer"
import { store, registerDock } from "./GriffnerStore.tsx"
`;

/* ---------- JourneyEinstieg ---------- */
{
  const files = ['basis.js', 'inhalt.js', 'einstieg.js', 'basis.css', 'einstieg.css'];
  const controls = {
    titel: S('Headline', EINSTIEG.h, { displayTextArea: true }),
    zeilen: { type: 'ControlType.Array', title: 'Zeilen', maxCount: 12, control: { type: 'ControlType.String', displayTextArea: true }, defaultValue: EINSTIEG.zeilen },
    satzA: S('Satz grau', EINSTIEG.satzA, { displayTextArea: true }),
    satzB: S('Satz weiß', EINSTIEG.satzB, { displayTextArea: true })
  };
  write('JourneyEinstieg', `${head('Einstieg wie Über uns: Headline, Zeilen werden beim Scrollen hell, am Ende das Feld mit einem Satz.', files)}${IMPORTS}
const CSS = ${JSON.stringify(cssOf('basis.css', 'einstieg.css'))}
${sect('basis.js')}${sect('inhalt.js')}${mod('Einstieg', 'einstieg.js', 'DEF, markup, mount')}${FRAMER}
${LAYOUT}
export default function JourneyEinstieg(props: any) {
    const ref = useRef<HTMLDivElement>(null)
    const cfg = { h: props.titel, zeilen: props.zeilen, satzA: props.satzA, satzB: props.satzB }
    const html = Einstieg.markup(cfg)
    useEffect(() => {
        const root = ref.current
        if (!root) return
        const still = RenderTarget.current() === RenderTarget.canvas, reduce = reduceMotion()
        const h = Einstieg.mount(root, cfg, { reduce, still })
        let off: any = null
        /* Am Ende dockt das gelbe Feld der Website am Feld an (wie withUManDock auf Über uns) */
        if (!still) { root.classList.add("has-dock"); off = registerDock({ el: h.feld, kind: "box", id: "je-feld", solid: true, when: h.feldOn }) }
        return () => { off && off(); h.dispose(); root.classList.remove("has-dock", "is-static") }
    }, [html])
    return (
        <div style={{ width: "100%" }}>
            <style data-jg-css="einstieg" dangerouslySetInnerHTML={{ __html: CSS }} />
            <div ref={ref} className="jg" data-jg="JourneyEinstieg" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}
JourneyEinstieg.displayName = "Journey Einstieg"
addPropertyControls(JourneyEinstieg, ${ctl(controls)})
`);
}

/* ---------- JourneyGehen: Szene und Stapel ---------- */
{
  const files = ['basis.js', 'inhalt.js', 'haus3d.js', 'figur3d.js', 'gang-daten.js', 'familie-echt.js', 'gehen-szene.js', 'stapel.js', 'basis.css', 'gehen-szene.css', 'stapel.css'];
  const controls = {
    schritte: {
      type: 'ControlType.Array', title: 'Tage', maxCount: 24,
      control: { type: 'ControlType.Object', controls: {
        titel: S('Titel', ''), text: S('Text', '', { displayTextArea: true }),
        stichworte: S('Stichworte', '', { displayTextArea: true, description: 'Mit · getrennt oder eins je Zeile' }),
        phase: S('Phase beginnt', '', { description: 'Name einer Phase, die vor diesem Tag beginnt (schwarzer Bildschirm), sonst leer' })
      } },
      defaultValue: TAGE.map(s => ({ titel: s.t, text: s.d, stichworte: s.k, phase: s.ph || '' }))
    },
    tag: S('Wort für Tag', SZENE.tag),
    stapelTitel: S('Stapel Satz', STAPEL.h, { displayTextArea: true }),
    bereich: S('Bereich (Vorlesen)', '', { description: 'Leer: „Deine Journey in N Tagen“' })
  };
  write('JourneyGehen', `${head('die 14 Tage mit dem Paar (3D), dann Der Stapel.', files)}// Das Paar: echte Menschen, Microsoft Rocketbox Avatar Library (Lizenz unten). Gang: Quaternius Universal Animation Library, CC0 1.0.
${LIZENZ.trim().split('\n').map(l => '// ' + l).join('\n')}
${IMPORTS}
const CSS = ${JSON.stringify(cssOf('basis.css', 'gehen-szene.css', 'stapel.css'))}
${sect('basis.js')}${sect('inhalt.js')}/* ---------- haus3d.js ---------- */
${noExport(src('haus3d.js'))}
${sect('figur3d.js')}${sect('gang-daten.js')}${sect('familie-echt.js')}const FAMILIE_URL = ${JSON.stringify(URL3)}
const FAMILIE_URL_S = ${JSON.stringify(URL3S)} // Telefon (bis 809 px): halbe Texturgröße
${mod('Szene', 'gehen-szene.js', 'DEF, markup, mount')}${mod('Stapel', 'stapel.js', 'DEF, markup, mount')}${FRAMER}
let threeP: Promise<any> | null = null
const three = () => threeP || (threeP = import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"))

${LAYOUT}
export default function JourneyGehen(props: any) {
    const ref = useRef<HTMLDivElement>(null), ref2 = useRef<HTMLDivElement>(null)
    const steps = (props.schritte || []).map((s: any) => ({ t: s?.titel, d: s?.text, k: s?.stichworte, ph: s?.phase }))
    const cfg = { steps, tag: props.tag, label: props.bereich || "" }
    const cfgS = { h: props.stapelTitel, steps, tag: props.tag }
    const html = Szene.markup(cfg), html2 = Stapel.markup(cfgS)
    useEffect(() => {
        const root = ref.current, root2 = ref2.current
        if (!root || !root2) return
        const still = RenderTarget.current() === RenderTarget.canvas, reduce = reduceMotion()
        const famUrl = familieUrl(FAMILIE_URL, FAMILIE_URL_S)
        /* Das gelbe Feld der Website: an der Leiste beim Tag, auf dem schwarzen Bildschirm einer Phase über ihrem Namen, am Ende über dem Stapel */
        let rail: any = null
        const offs: any[] = [], scene: any[] = []
        const tick = (api: any, i: number) => (api.rail[i] && api.rail[i].querySelector("i")) || api.rail[0]
        const h = Szene.mount(root, cfg, {
            three, makeHaus, figure, reduce, still, scrollTo: glatt,
            family: (T: any) => loadEchteFamilie(T, famUrl), prefetch: () => prefetchEchteFamilie(famUrl),
            onStep(i: number, api: any) { if (rail) rail.el = tick(api, api.railAt()) },
            /* Ohne 3D (kein WebGL): ruhige Fassung, die Andockpunkte der Szene fallen weg */
            onStatic() { scene.forEach(f => f()); scene.length = 0; root.classList.remove("has-dock") },
        })
        const hs = Stapel.mount(root2, cfgS, { reduce, still })
        /* Halte-Scrollen: jede Geste führt genau einen Halt weiter (zwei Phasen, 14 Tage, Stapel), die Leiste gleitet zum Tag */
        let halt: any = null
        if (!still && !reduce) { halt = schritte({ stops: () => [...h.stops(), ...hs.stops()], lenis: () => store.lenis }); h.goDay = (i: number) => halt.go(h.dayY(i)) }
        let zone: any = null
        if (!still) {
            root2.classList.add("has-dock")
            offs.push(registerDock({ el: hs.feld, kind: "box", id: "st-feld", solid: true, when: hs.feldOn }))
            if (!reduce) {
                root.classList.add("has-dock")
                rail = { el: tick(h, h.railAt()), kind: "box", id: "jg-tag", solid: true, key: () => String(h.railAt()), when: () => h.walking() && vis(h.stage, .6, .4) }
                scene.push(registerDock(rail))
                h.phases.forEach((f: any, j: number) => scene.push(registerDock({ el: f, kind: "box", id: "jg-phase" + j, solid: true, when: () => h.phaseOn() === j })))
            }
            zone = { el: root, on: () => true }
            store.darkZones.add(zone)
        }
        return () => {
            offs.forEach(f => f()); scene.forEach(f => f())
            halt && halt.dispose()
            zone && store.darkZones.delete(zone)
            h.dispose(); hs.dispose()
            root.classList.remove("has-dock", "is-static", "is-canvas", "is-nogl", "g--cloud"); root2.classList.remove("has-dock", "is-static")
        }
    }, [html, html2])
    return (
        <div style={{ width: "100%" }}>
            <style data-jg-css="gehen" dangerouslySetInnerHTML={{ __html: CSS }} />
            <div ref={ref} className="jg" data-jg="JourneyGehen" dangerouslySetInnerHTML={{ __html: html }} />
            <div ref={ref2} className="jg" data-jg="JourneyStapel" dangerouslySetInnerHTML={{ __html: html2 }} />
        </div>
    )
}
JourneyGehen.displayName = "Journey Gehen"
addPropertyControls(JourneyGehen, ${ctl(controls)})
`);
}

/* ---------- JourneyLeben ---------- */
{
  const files = ['basis.js', 'inhalt.js', 'leben.js', 'basis.css', 'leben.css'];
  const ARTEN = [['leben', 'Haus und Zeitstrahl'], ['schichten', 'Ebenen werden ein Plan'], ['partner', 'Alles läuft in einem Feld zusammen'], ['update', 'Update baut sich auf'], ['griffen', 'Zwei Wege nach Griffen']];
  const markenText = k => (k.marken || []).map(([a, b]) => b ? `${a} · ${b}` : a).join('\n');
  const controls = {
    phaseZeile: S('Phase Zeile', LEBEN.phase.info),
    phaseTitel: S('Phase Titel', LEBEN.phase.h),
    phaseText: S('Phase Satz', LEBEN.phase.lead, { displayTextArea: true }),
    kapitel: {
      type: 'ControlType.Array', title: 'Kapitel', maxCount: 8,
      control: { type: 'ControlType.Object', controls: {
        reiter: S('Reiter', ''), titel: S('Titel', ''), text: S('Text', '', { displayTextArea: true }),
        art: { type: 'ControlType.Enum', title: 'Zeichnung', defaultValue: 'leben', options: ARTEN.map(a => a[0]), optionTitles: ARTEN.map(a => a[1]) },
        punkte: S('Punkte', '', { displayTextArea: true, description: 'Eine Zeile je Punkt: „Titel. Text“' }),
        schichten: S('Ebenen', '', { description: 'Nur bei „Ebenen“: mit · getrennt' }),
        marken: S('Beschriftung', '', { displayTextArea: true, description: 'Eine Zeile je Beschriftung der Zeichnung, zweite Zeile mit · : „Tag 15 · Schlüssel“' })
      } },
      defaultValue: LEBEN.kapitel.map(k => ({ reiter: k.tab, titel: k.h, text: k.text, art: k.art, punkte: (k.punkte || []).map(p => p.join(' ')).join('\n'), schichten: (k.schichten || []).join(' · '), marken: markenText(k) }))
    },
    ctaTitel: S('Abschluss Titel', LEBEN.cta.h, { displayTextArea: true }),
    knopf: S('Knopf', LEBEN.cta.knopf),
    knopfLink: { type: 'ControlType.Link', title: 'Knopf Link', defaultValue: LEBEN.cta.href }
  };
  write('JourneyLeben', `${head('Ab Tag 15: Phase Besser leben, fünf Kapitel auf einem Bildschirm (Scrollen führt Kapitel für Kapitel, Zeichnungen statt Bilder), Abschluss mit Knopf.', files)}${IMPORTS}
const CSS = ${JSON.stringify(cssOf('basis.css', 'leben.css'))}
${sect('basis.js')}${sect('inhalt.js')}${mod('Leben', 'leben.js', 'DEF, markup, mount')}${FRAMER}
function cfgOf(p: any) {
    return {
        phase: { info: p.phaseZeile, h: p.phaseTitel, lead: p.phaseText },
        kapitel: (p.kapitel || []).map((k: any) => ({
            tab: k?.reiter, h: k?.titel, text: k?.text, art: k?.art, punkte: k?.punkte, schichten: k?.schichten, marken: k?.marken,
        })),
        cta: { h: p.ctaTitel, knopf: p.knopf, href: p.knopfLink },
    }
}

${LAYOUT}
export default function JourneyLeben(props: any) {
    const ref = useRef<HTMLDivElement>(null)
    const cfg = cfgOf(props)
    const html = Leben.markup(cfg)
    useEffect(() => {
        const root = ref.current
        if (!root) return
        const still = RenderTarget.current() === RenderTarget.canvas, reduce = reduceMotion()
        /* Das gelbe Feld: über „Besser leben.“, dann am aktiven Reiter (wandert mit), am Ende über dem Abschluss */
        let tab: any = null
        const h = Leben.mount(root, cfg, { reduce, still, onKapitel(i: number, api: any) { if (tab) tab.el = api.tabFeld() } })
        const offs: any[] = []
        /* Halte-Scrollen: Phase, dann jedes Kapitel genau ein Halt; die Reiter gleiten zum Kapitel */
        let halt: any = null
        if (!still && !reduce) { halt = schritte({ stops: () => h.stops(), lenis: () => store.lenis }); h.go = (y: number) => halt.go(y) }
        let zone: any = null
        if (!still) {
            root.classList.add("has-dock")
            offs.push(registerDock({ el: h.phaseFeld, kind: "box", id: "lb-phase", solid: true, when: h.phaseOn }))
            tab = { el: h.tabFeld(), kind: "box", id: "lb-tab", solid: true, key: () => String(h.index()), when: h.tabsOn }
            offs.push(registerDock(tab))
            offs.push(registerDock({ el: h.ctaFeld, kind: "box", id: "lb-cta", solid: true, when: h.ctaOn }))
            zone = { el: root, on: () => true }
            store.darkZones.add(zone)
        }
        return () => { offs.forEach(f => f()); halt && halt.dispose(); zone && store.darkZones.delete(zone); h.dispose(); root.classList.remove("has-dock", "is-static") }
    }, [html])
    return (
        <div style={{ width: "100%" }}>
            <style data-jg-css="leben" dangerouslySetInnerHTML={{ __html: CSS }} />
            <div ref={ref} className="jg" data-jg="JourneyLeben" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}
JourneyLeben.displayName = "Journey Leben"
addPropertyControls(JourneyLeben, ${ctl(controls)})
`);
}
