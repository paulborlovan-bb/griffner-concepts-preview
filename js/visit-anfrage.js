/* /visit Formular „Besuch anfragen“, Runde 1 (visit-anfrage.html, 2026-11-27).
   Fünf Formulare, alle nur zur Ansicht: Absenden prüft und zeigt den Dank, gesendet wird nichts.
   Der CRM-Kasten baut live dieselben Felder wie SmoothScroll crmPayload() für das Sellsation-Formular „Homepage Besuch“:
   Vorname, Nachname, E-Mail, Telefon (customer.mobilePhone), Postleitzahl, Wohnort „x“, Land aus der Postleitzahl
   (4 Ziffern AT, 5 Ziffern DE, beim Musterhaus Prag CZ), Adressquelle nach Besuch (9351 Campus, 9350 Musterhäuser, 9352 Kundenhaus,
   sonst 9349) und die Nachricht (customField17344). Neu in der Nachricht sind nur die Zeilen Zeitraum, Rückruf und Möchte sehen.
   data-wenn="Besuch:A,B" zeigt einen Teil nur bei dieser Wahl; versteckte Eingaben werden deaktiviert und gehen nicht mit.
   data-pflicht="Name" an einer Gruppe = eine Wahl ist Pflicht. data-schritte = zwei Schritte (01). data-vorschlag = Musterhaus nach PLZ (04). */
import { loop, reveal, $, $$ } from './core.js';
import { initChrome, frame } from './chrome.js';
import { run, sw, esc } from './varianten.js';

const QUELLE = { Campus: '9351 · Visit › Campus', Musterhaus: '9350 · Visit › Musterhäuser', Kundenhaus: '9352 · Visit › Kundenhaus' };
const NAME = { Besuch: 'was du sehen willst', Zeitraum: 'ungefähr wann', Musterhaus: 'welches Musterhaus', Einverständnis: 'das Einverständnis', 'E-Mail': 'E-Mail' };

const plzRein = s => s.replace(/^[A-Za-z]{1,2}\s*-?\s*/, '').replace(/[\s-]/g, '');
const landAus = (plz, haus) => /^\d{5}$/.test(plzRein(plz)) ? (/prag/i.test(haus) ? 'CZ' : 'DE') : 'AT';

/* Nächstes Musterhaus grob nach der Postleitzahl (nur Vorschlag, änderbar). Österreich nach der ersten Ziffer, Deutschland Süd/Ost → München, sonst Schwarzwald */
export function naechstes(raw) {
  const p = plzRein(raw || '');
  if (/^\d{4}$/.test(p)) {
    const a = +p[0], ab = +p.slice(0, 2);
    if (a <= 2) return 'Wien';
    if (a === 3) return ab === 33 || ab === 39 ? 'Linz' : 'Wien';
    if (a === 4) return 'Linz';
    if (a === 5 || a === 6) return 'Salzburg';
    if (a === 7) return ab >= 74 ? 'Graz' : 'Wien';
    if (a === 8) return 'Graz';
    if (a === 9) return 'Griffen';
  }
  if (/^\d{5}$/.test(p)) return [0, 1, 8, 9].includes(+p[0]) ? 'München' : 'Schwarzwald';
  return '';
}

function werte(form) {
  const fd = new FormData(form);
  const v = k => fd.getAll(k).map(x => String(x).trim()).filter(Boolean).join(', ');
  let art = v('Besuch'), haus = v('Musterhaus');
  if (art.includes('|')) { const [a, h] = art.split('|'); art = a; haus = h; }
  return {
    art, haus, zeitraum: v('Zeitraum'), tageszeit: v('Tageszeit'), erreichbar: v('Erreichbar'), sehen: v('Sehen'),
    vorname: v('Vorname'), nachname: v('Nachname'), email: v('E-Mail'), tel: v('Telefon'), plz: v('Postleitzahl'),
  };
}

/* Zeilen der CRM-Nachricht; neu = Zeile, die es heute nicht gibt */
function nachricht(w) {
  const nah = naechstes(w.plz);
  const besuch = w.art === 'Musterhaus'
    ? (w.haus ? `Musterhaus ${w.haus}` : `Musterhaus, das nächste zur Postleitzahl${nah ? ` (${nah})` : ''}`)
    : (w.art || 'nicht gewählt');
  const tz = w.tageszeit === 'Egal' ? 'Tageszeit egal' : w.tageszeit;
  return [
    { t: `Besuch: ${besuch}`, neu: w.art === 'Musterhaus' && !w.haus },
    (w.zeitraum || tz) && { t: `Zeitraum: ${[w.zeitraum, tz].filter(Boolean).join(', ')}`, neu: true },
    w.erreichbar && { t: `Rückruf: am besten ${w.erreichbar}`, neu: true },
    w.sehen && { t: `Möchte sehen: ${w.sehen}`, neu: true },
    w.plz && { t: `Postleitzahl: ${w.plz}` },
    { t: 'Wohnort fragt das Besuchsformular nicht ab (im CRM Platzhalter), Land aus der Postleitzahl.' },
    { t: '' },
    { t: '(Formular auf griffner.com/visit)' },
  ].filter(Boolean);
}

function crmZeigen(form, box, gesendet) {
  const w = werte(form);
  const zeile = (k, v, leer = '–', cls = '') => `<dt>${k}</dt><dd class="${v ? cls : 'is-leer'}">${v ? esc(v) : leer}</dd>`;
  const msg = nachricht(w).map(z => z.neu ? `<span class="is-neu">${esc(z.t)}</span>` : esc(z.t)).join('\n');
  box.innerHTML = `
    <div class="crm__kopf"><p class="crm__t">So kommt es im CRM an</p><p class="crm__s${gesendet ? ' is-sent' : ''}">${gesendet ? 'würde jetzt gesendet' : 'Sellsation · Homepage Besuch'}</p></div>
    <dl>
      ${zeile('Adressquelle', QUELLE[w.art] || '9349 · Homepage (neu) Visit')}
      ${zeile('Vorname', w.vorname)}${zeile('Nachname', w.nachname)}
      ${zeile('E-Mail', w.email)}${zeile('Telefon', w.tel)}
      ${zeile('Postleitzahl', plzRein(w.plz))}
      ${zeile('Wohnort', 'x')}
      ${zeile('Land', w.plz ? landAus(w.plz, w.haus) : '', 'aus der Postleitzahl')}
      <dt>Nachricht</dt><dd class="crm__msg">${msg}</dd>
    </dl>
    <p class="crm__fuss">Gelb = neue Zeile in der Nachricht. Alle Felder wie heute, in Sellsation ändert sich nichts. Google Ads, GA4 und Meta melden den Besuch wie bisher.</p>`;
}

/* Teile nach der Wahl zeigen; versteckte Eingaben aus */
function wenn(form) {
  $$('[data-wenn]', form).forEach(el => {
    const [k, vals] = el.dataset.wenn.split(':');
    const cur = ($(`[name="${k}"]:checked`, form) || {}).value || '';
    el.hidden = !vals.split(',').includes(cur);
  });
  $$('input,select,textarea', form).forEach(i => { i.disabled = !!i.closest('[data-wenn][hidden]'); });
}

const telOk = s => (s.match(/\d/g) || []).length >= 6;
const mailOk = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const plzOk = s => /^\d{4,5}$/.test(plzRein(s));

function pruefe(scope, form) {
  const fehlt = [];
  $$('[data-pflicht]', scope).forEach(set => {
    if (set.closest('[hidden]')) return;
    const n = set.dataset.pflicht, ok = !!$(`[name="${n}"]:checked:not(:disabled)`, form);
    set.classList.toggle('is-fehlt', !ok);
    if (!ok) fehlt.push(NAME[n] || n);
  });
  $$('input[required],select[required]', scope).forEach(i => {
    if (i.disabled || i.closest('[hidden]')) return;
    const v = (i.value || '').trim();
    let ok = i.type === 'checkbox' ? i.checked : !!v;
    if (ok && i.name === 'E-Mail') ok = mailOk(v);
    if (ok && i.name === 'Telefon') ok = telOk(v);
    if (ok && i.name === 'Postleitzahl') ok = plzOk(v);
    (i.type === 'checkbox' ? i.closest('.vf__ok') : i).classList.toggle('is-fehlt', !ok);
    if (!ok) {
      const n = NAME[i.name] || i.name;
      fehlt.push(v && i.name === 'Postleitzahl' ? 'Postleitzahl (4 oder 5 Ziffern)' : v && i.name === 'E-Mail' ? 'eine gültige E-Mail' : v && i.name === 'Telefon' ? 'eine Telefonnummer' : n);
    }
  });
  const err = $$('[data-err]', scope).pop();
  if (err) err.textContent = fehlt.length ? `Bitte noch: ${fehlt.join(', ')}.` : '';
  return !fehlt.length;
}

/* 05: Felder so breit wie ihr Text */
const ctx = document.createElement('canvas').getContext('2d');
function breite(el) {
  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const sel = el.tagName === 'SELECT';
  const t = sel ? el.options[el.selectedIndex].text : (el.value || el.placeholder);
  const max = el.closest('.vs').clientWidth - (sel ? 26 : 6);
  el.style.width = Math.ceil(Math.min(ctx.measureText(t).width + (sel ? 6 : 3), max)) + 'px';
  if (sel) el.classList.toggle('is-leer', !el.value);
}

function formular(form) {
  const box = $(`[data-crm="${form.id}"]`);
  const body = $('.vf__body', form), danke = $('[data-danke]', form), tabs = $('.vf__tabs', form);
  const schritte = $$('.vf__schritt', form);
  const zeig = () => crmZeigen(form, box, false);

  const schritt = n => {
    schritte.forEach(s => { s.hidden = s.dataset.s !== String(n); });
    $$('[data-tab]', form).forEach(t => t.classList.toggle('is-cur', t.dataset.tab === String(n)));
  };
  if (schritte.length) {
    $('[data-weiter]', form).addEventListener('click', () => { if (pruefe(schritte[0], form)) { schritt(2); $('input', schritte[1]).focus({ preventScroll: true }); } });
    $('[data-zurueck]', form).addEventListener('click', () => schritt(1));
    $$('[data-tab]', form).forEach(t => t.addEventListener('click', () => {
      if (t.dataset.tab === '1') schritt(1); else if (pruefe(schritte[0], form)) schritt(2);
    }));
  }

  /* 04: Musterhaus nach Postleitzahl vorschlagen, bis man selbst wählt */
  const haus = form.hasAttribute('data-vorschlag') ? $('select[name="Musterhaus"]', form) : null;
  const vorschlagen = () => {
    if (!haus || haus.dataset.hand) return;
    const n = naechstes($('[name="Postleitzahl"]', form).value);
    haus.value = n; $('[data-vorschlag-info]', form).hidden = !n;
  };
  if (haus) haus.addEventListener('change', () => { haus.dataset.hand = '1'; $('[data-vorschlag-info]', form).hidden = true; });

  const satz = $$('.vs__i', form);
  const satzBreite = () => satz.forEach(breite);

  form.addEventListener('input', e => {
    const t = e.target;
    t.classList?.remove('is-fehlt'); t.closest?.('.vf__ok')?.classList.remove('is-fehlt'); t.closest?.('[data-pflicht]')?.classList.remove('is-fehlt');
    if (t.name === 'Postleitzahl') vorschlagen();
    if (t.classList?.contains('vs__i')) breite(t);
    zeig();
  });
  form.addEventListener('change', e => {
    if (e.target.name === 'Besuch') { wenn(form); vorschlagen(); }
    e.target.closest?.('[data-pflicht]')?.classList.remove('is-fehlt');
    if (e.target.classList?.contains('vs__i')) breite(e.target);
    zeig();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const scope = schritte.length ? schritte[1] : body;
    if (!pruefe(scope, form)) return;
    const w = werte(form);
    crmZeigen(form, box, true);
    $$('[data-name]', form).forEach(s => { s.textContent = w.vorname ? `, ${w.vorname}` : ''; });
    $$('[data-wenn-danke]', form).forEach(p => { p.hidden = p.dataset.wennDanke !== w.art; });
    const rr = $('[data-dt-rueckruf]', form);
    if (rr) rr.textContent = `Wir rufen dich innerhalb eines Werktags an${w.erreichbar ? `, am besten am ${w.erreichbar}` : ''}.`;
    if (body) body.hidden = true;
    schritte.forEach(s => { s.hidden = true; }); if (tabs) tabs.hidden = true;
    danke.hidden = false;
    const r = form.getBoundingClientRect(); if (r.top < 0) scrollBy({ top: r.top - 100, behavior: 'smooth' });
  });

  $('[data-nochmal]', form).addEventListener('click', () => {
    form.reset(); if (haus) { delete haus.dataset.hand; $('[data-vorschlag-info]', form).hidden = true; }
    $$('.is-fehlt', form).forEach(x => x.classList.remove('is-fehlt')); $$('[data-err]', form).forEach(x => { x.textContent = ''; });
    danke.hidden = true; if (body) body.hidden = false; if (tabs) tabs.hidden = false; if (schritte.length) schritt(1);
    wenn(form); satzBreite(); zeig();
  });

  wenn(form); satzBreite(); zeig();
  if (satz.length) {
    if (document.fonts) document.fonts.ready.then(satzBreite);
    addEventListener('resize', satzBreite);
  }
}

run('chrome', initChrome);
$$('form.vf').forEach(f => run(f.id, () => formular(f)));
run('sw', sw);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
