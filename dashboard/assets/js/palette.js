// Command palette: Ctrl/Cmd+K jumps to a page, a build, an experiment or a run.
import { h, icon } from './dom.js';
import * as D from './data.js';

let el = null, prevFocus = null;

export function closePalette() {
  if (!el) return;
  el.remove(); el = null;
  document.body.classList.remove('locked');
  if (prevFocus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true });
}

export function openPalette(ctx) {
  if (el) { closePalette(); return; }
  prevFocus = document.activeElement;
  const items = [];
  for (const [r, name] of [['', 'Overview'], ['readiness', 'Release readiness'], ['experiments', 'Experiments'], ['frontend', 'Frontend E2E'], ['history', 'History'], ['about', 'Data']]) items.push({ type: 'Page', label: name, run: () => ctx.go(r || 'overview') });
  for (const b of D.BUILDS) items.push({ type: 'Build', label: b.long, hint: ctx.builds.find((x) => x.key === b.key).state === 'ready' ? '' : 'no run yet', run: () => ctx.selectBuild(b.key) });
  for (const e of D.experimentIndex(ctx.builds)) items.push({ type: e.suite === 'frontend' ? 'Spec' : 'Experiment', label: e.id, hint: e.category, run: () => ctx.openExperiment(e.key) });
  for (const b of ctx.builds) for (const x of D.builds(b.history).slice(-30).reverse()) items.push({ type: 'Run', label: `${D.buildInfo(b.key).label} · ${x.id}`, hint: x.status, run: () => ctx.go('history', { b: b.key }) });
  items.push({ type: 'Action', label: 'Toggle theme', run: () => document.getElementById('theme').click() });

  const input = h('input', { type: 'text', id: 'pq', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'plist', 'aria-autocomplete': 'list', placeholder: 'Jump to a build, experiment, run or page', autocomplete: 'off', spellcheck: 'false' });
  const list = h('ul', { id: 'plist', role: 'listbox', 'aria-label': 'Results' });
  let shown = [], sel = 0;
  const draw = () => {
    const q = input.value;
    shown = items.map((it) => ({ it, s: D.fuzzy(q, it.label + ' ' + it.type) })).filter((x) => x.s != null).sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.it);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.replaceChildren(...(shown.length ? shown.map((it, i) => h('li', { role: 'option', id: 'po' + i, 'aria-selected': String(i === sel), onclick: () => run(it), onpointermove: () => { if (sel !== i) { sel = i; mark(); } } }, h('span', { class: 'ptype' }, it.type), h('span', { class: 'plabel mono' }, it.label), it.hint ? h('span', { class: 'phint' }, it.hint) : null)) : [h('li', { class: 'pempty', role: 'presentation' }, 'Nothing matches')]));
    input.setAttribute('aria-activedescendant', shown.length ? 'po' + sel : '');
  };
  const mark = () => { [...list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === sel))); input.setAttribute('aria-activedescendant', 'po' + sel); const o = list.children[sel]; if (o && o.scrollIntoView) o.scrollIntoView({ block: 'nearest' }); };
  const run = (it) => { closePalette(); it.run(); };
  input.addEventListener('input', () => { sel = 0; draw(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === 'Enter' && shown[sel]) { e.preventDefault(); run(shown[sel]); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    else if (e.key === 'Tab') e.preventDefault();
  });
  el = h('div', { class: 'palette-wrap', onclick: (e) => { if (e.target === el) closePalette(); } },
    h('div', { class: 'palette glass', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Command palette' }, h('div', { class: 'palette-in' }, icon('search'), input, h('kbd', {}, 'Esc')), list));
  document.body.append(el);
  document.body.classList.add('locked');
  draw();
  input.focus();
}
