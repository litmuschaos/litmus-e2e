import { h, icon, badge, link, statusLabel } from '../dom.js?v=4bda9f31e2';
import * as D from '../data.js?v=4bda9f31e2';
import { strip } from '../charts.js?v=4bda9f31e2';
import { buildDot } from './common.js?v=4bda9f31e2';

let open = null; // { el, back, opener }

export function closeDrawer(restore = true) {
  if (!open) return;
  const { el, back, opener, onKey } = open;
  document.removeEventListener('keydown', onKey, true);
  el.classList.remove('in'); back.classList.remove('in');
  const done = () => { el.remove(); back.remove(); };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) done(); else setTimeout(done, 260);
  document.body.classList.remove('locked');
  open = null;
  if (restore && opener && document.contains(opener)) opener.focus({ preventScroll: true });
}

/** Side sheet with the detail of one experiment: its tests per build, the failure, the duration and the trend. */
export function openDrawer(key, ctx) {
  closeDrawer(false);
  const all = ctx.builds;
  const index = D.experimentIndex(all);
  const exp = index.find((e) => e.key === key);
  let selected = ctx.current.key;
  const title = h('h2', { id: 'dr-title', class: 'mono' }, exp ? exp.id : key);
  const body = h('div', { class: 'drawer-body' });
  const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close the details', onclick: () => ctx.closeX() }, icon('x'));
  const el = h('aside', { class: 'drawer glass', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dr-title', 'data-b': selected },
    h('header', { class: 'drawer-head' }, h('div', {}, h('p', { class: 'kicker' }, exp ? (exp.suite === 'frontend' ? 'Frontend spec' : 'Experiment') + ' · ' + exp.category : 'Experiment'), title), close), body);
  const back = h('div', { class: 'backdrop', onclick: () => ctx.closeX() });

  const render = () => {
    el.dataset.b = selected;
    body.replaceChildren();
    if (!exp) { body.append(h('p', { class: 'note' }, 'This experiment is not in the published results of any build.')); return; }
    const tabs = h('div', { class: 'seg-tabs', role: 'tablist', 'aria-label': 'Build' }, all.map((b) => {
      const g = exp.builds[b.key];
      return h('button', { role: 'tab', type: 'button', 'aria-selected': String(b.key === selected), 'data-b': b.key, onclick: () => { selected = b.key; render(); } },
        buildDot(b.key), g ? h('span', { class: 'tab-state ' + (g.status === 'passed' ? 'ok' : g.status === 'skipped' ? 'warn' : 'bad') }, statusLabel(g.status)) : h('span', { class: 'tab-state none' }, b.state === 'ready' ? 'not run' : 'no run'));
    }));
    body.append(tabs);
    const b = all.find((x) => x.key === selected);
    const g = exp.builds[selected];
    if (!g) {
      body.append(h('div', { class: 'note-box' }, h('b', {}, `${exp.id} has no result in ${D.buildInfo(selected).long}.`), h('p', {}, b.state === 'ready' ? 'The experiment is not part of the tests of that build.' : 'That build has no published run yet.')));
      return;
    }
    const letters = D.groupStrip(b.history, exp.key, 30);
    const f = D.flips(letters);
    const c = g.counts;
    body.append(
      h('div', { class: 'facts' },
        h('div', {}, h('span', { class: 'label' }, 'Status'), badge(g.status)),
        h('div', {}, h('span', { class: 'label' }, 'Passed'), h('b', { class: 'mono' }, `${c.passed}/${D.total(c)}`)),
        h('div', {}, h('span', { class: 'label' }, 'Duration'), h('b', { class: 'mono' }, D.fmtDuration(g.durationSec))),
        h('div', {}, h('span', { class: 'label' }, 'Workflow'), h('b', {}, g.workflows.map((w) => D.workflowName(b.latest, w)).join(', ')))),
      h('section', {}, h('h3', {}, 'Trend'),
        letters.length ? [strip(letters, 'Recent results of ' + exp.id), h('p', { class: 'note' }, `${letters.length} recorded ${letters.length === 1 ? 'run' : 'runs'}, oldest on the left.` + (f >= 2 ? ` It changed between passing and failing ${f} times, so it is flaky.` : ''))] : h('p', { class: 'note' }, 'No history for this build yet.')));
    // job level failure: the first failed step names where the run broke
    const jobs = [];
    for (const w of (D.buildOf(b).workflows || [])) if (g.workflows.includes(w.id) && (g.counts.failed || g.counts.error)) for (const j of w.jobs || []) if (j.firstFailedStep) jobs.push({ w, j });
    if (jobs.length) body.append(h('section', {}, h('h3', {}, 'Failed steps'), h('ul', { class: 'plain' }, jobs.map(({ w, j }) => h('li', {}, h('i', { class: 'dotmark bad', 'aria-hidden': 'true' }), h('span', { class: 'mono' }, j.firstFailedStep), h('span', { class: 'sub' }, `${j.name} · ${w.name}`), j.url && D.safeUrl(j.url) ? link(D.safeUrl(j.url), 'Job log') : null)))));
    body.append(h('section', {}, h('h3', {}, `Steps (${g.tests.length})`), h('ol', { class: 'steps' }, g.tests.map((t) => {
      const url = t.url && D.safeUrl(t.url);
      return h('li', { class: 'step ' + (t.status === 'passed' ? 'ok' : t.status === 'skipped' ? 'warn' : 'bad') },
        h('span', { class: 'step-mark' }, icon(t.status)),
        h('div', {}, h('span', { class: 'step-name' }, D.shortName(t.name)), h('span', { class: 'sub mono' }, `${D.fmtDuration(t.durationSec)}${t.job ? ' · ' + t.job : ''}`),
          t.message ? h('pre', { class: 'log', tabindex: '0', 'aria-label': 'Failure output' }, t.message) : null),
        url ? link(url, 'Log') : null);
    }))));
  };
  render();

  document.body.append(back, el);
  document.body.classList.add('locked');
  requestAnimationFrame(() => { el.classList.add('in'); back.classList.add('in'); });
  const onKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); ctx.closeX(); return; }
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll('a[href],button,[tabindex="0"]')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!el.contains(document.activeElement)) { first.focus(); e.preventDefault(); }
    else if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  };
  document.addEventListener('keydown', onKey, true);
  open = { el, back, opener: document.activeElement, onKey };
  close.focus({ preventScroll: true });
}
