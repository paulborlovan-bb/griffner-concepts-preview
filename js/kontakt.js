/* KONTAKT. Ein Formular für beide Seiten, statt nur eines Knopfs. Die Nachricht füllt sich mit dem, was du auf der Seite gewählt hast,
   solange du sie nicht selbst änderst. Prototyp: es wird nichts gesendet, das Formular bestätigt nur. */
import { $, $$ } from './core.js';

const G = 'https://griffner.com';
const field = (name, label, type, ac, req, ph = '', wide = false) =>
  `<label class="kf__f${wide ? ' kf__f--wide' : ''}"><span class="info">${label}${req ? '' : ' <em>optional</em>'}</span><input name="${name}" type="${type}" autocomplete="${ac}"${req ? ' required' : ''}${ph ? ` placeholder="${ph}"` : ''}></label>`;

export function initKontakt(host, { prefill, say = 'Lass uns reden.' } = {}) {
  if (!host) return;
  host.innerHTML = `
    <form class="kf" novalidate aria-label="Kontaktformular">
      <p class="cta__box-say">${say}</p>
      <div class="kf__grid">
        ${field('vorname', 'Vorname', 'text', 'given-name', true)}
        ${field('nachname', 'Nachname', 'text', 'family-name', true)}
        ${field('email', 'E-Mail', 'email', 'email', true)}
        ${field('tel', 'Telefon', 'tel', 'tel', false)}
        ${field('ort', 'Wo soll dein Haus stehen?', 'text', 'off', false, 'PLZ und Ort', true)}
        <fieldset class="kf__f kf__f--wide"><legend class="info">Wie möchtest du reden?</legend><div class="kf__how">${['Telefon', 'Video', 'In Griffen'].map((l, i) => `<label><input type="radio" name="wie" value="${l}"${i ? '' : ' checked'}><span class="info">${l}</span></label>`).join('')}</div></fieldset>
        <label class="kf__f kf__f--wide"><span class="info">Nachricht <em>optional</em></span><textarea name="msg" rows="4"></textarea></label>
      </div>
      <label class="kf__ok"><input type="checkbox" name="ok" required><span>Ich bin einverstanden, dass GRIFFNER meine Angaben verwendet, um mir zu antworten. <a href="${G}/privacy">Datenschutz</a></span></label>
      <div class="kf__acts"><button class="btn-solid info" type="submit">Anfrage senden</button><span class="info kf__note">Vorschau, es wird nichts gesendet</span></div>
      <p class="kf__err" aria-live="polite"></p>
    </form>
    <div class="kf__done" hidden tabindex="-1">
      <p class="cta__box-say">Danke.</p>
      <p class="txt">Wir melden uns bei dir. Bis dahin kannst du dir in Ruhe die Concepts ansehen.</p>
      <span class="info kf__note">Vorschau, es wurde nichts gesendet</span>
    </div>`;
  const form = $('.kf', host), msg = $('textarea', form), err = $('.kf__err', form), done = $('.kf__done', host);
  let auto = '';
  const fill = () => { if (!prefill) return; const t = prefill(); if (msg.value === auto || !msg.value.trim()) { msg.value = t; auto = t; } };
  fill();
  form.addEventListener('input', e => { e.target.closest('.kf__f, .kf__ok')?.classList.remove('is-bad'); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', form).filter(i => i.type === 'checkbox' ? !i.checked : i.type === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim()) : !i.value.trim());
    $$('.is-bad', form).forEach(x => x.classList.remove('is-bad'));
    bad.forEach(i => i.closest('.kf__f, .kf__ok').classList.add('is-bad'));
    if (bad.length) { err.textContent = bad.length === 1 && bad[0].type === 'checkbox' ? 'Bitte bestätige noch den Datenschutz.' : 'Bitte fülle die markierten Felder aus.'; bad[0].focus(); return; }
    err.textContent = '';
    form.hidden = true; done.hidden = false; done.focus({ preventScroll: true });
  });
  return { refresh: fill };
}
