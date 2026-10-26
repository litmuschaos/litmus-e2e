import { h, icon, badge, link, announce } from '../dom.js';
import { stackedBar } from '../charts.js';
import * as D from '../data.js';

export function emptyState(title, text) {
  return h('div', { class: 'card empty' }, icon('inbox'), h('h2', {}, title), h('p', { style: 'margin:0 auto;max-width:60ch' }, text));
}

export function skeleton() {
  return h('div', { class: 'stack', 'aria-busy': 'true', 'aria-label': 'Loading' },
    h('div', { class: 'skel', style: 'height:120px' }),
    h('div', { class: 'grid cols-4' }, [0, 1, 2, 3].map(() => h('div', { class: 'skel', style: 'height:90px' }))),
    h('div', { class: 'grid cols-2' }, [0, 1].map(() => h('div', { class: 'skel', style: 'height:220px' }))));
}

/** A list of experiments or specs with search, filters, sorting and rows that expand into their test cases. */
export function resultList({ groups, jobs, workflows, state, history, label, nameLabel, onState }) {
  const wrap = h('div', {});
  const uid = Math.random().toString(36).slice(2, 7);

  const field = (id, text, control) => h('label', { class: 'field', for: id }, text, control);
  const search = h('input', { type: 'search', id: 's' + uid, value: state.q, placeholder: 'Name or error text', autocomplete: 'off', 'aria-controls': 'r' + uid });
  const status = h('select', { id: 'st' + uid }, [['all', 'All statuses'], ['failed', 'Failed'], ['error', 'Error'], ['skipped', 'Skipped'], ['passed', 'Passed']].map(([v, t]) => h('option', { value: v, selected: state.status === v }, t)));
  const wf = h('select', { id: 'wf' + uid }, [h('option', { value: 'all' }, 'All workflows'), ...workflows.map((w) => h('option', { value: w.id, selected: state.workflow === w.id }, w.name))]);
  const sort = h('select', { id: 'so' + uid }, [['status', 'Status, failures first'], ['failures', 'Most failures'], ['name', 'Name'], ['duration', 'Longest first']].map(([v, t]) => h('option', { value: v, selected: state.sort === v }, t)));
  const reset = h('button', { class: 'btn', type: 'button' }, 'Reset');
  const list = h('div', { id: 'r' + uid });

  const render = () => {
    const rows = D.sortGroups(D.filterGroups(groups, state), state.sort);
    list.replaceChildren();
    if (!groups.length) list.append(emptyState('No results in the latest build', 'None of the workflows of this suite produced test results.'));
    else if (!rows.length) list.append(emptyState('Nothing matches', 'Change or reset the filters.'));
    rows.forEach((g, i) => list.append(row(g, i)));
    announce(`${rows.length} of ${groups.length} ${label} shown`);
    count.textContent = `${rows.length} of ${groups.length} ${label}`;
  };
  const row = (g, i) => {
    const id = 'e' + uid + i;
    const open = state.open.has(g.id);
    const body = h('div', { class: 'exp-body', id, role: 'region', 'aria-label': g.id + ' test cases' }, h('div', {}, h('div', { class: 'exp-inner' }, g.tests.map((t) => testCase(t, history)))));
    const head = h('button', { class: 'exp-head', type: 'button', 'aria-expanded': String(open), 'aria-controls': id },
      icon('chevron'),
      h('span', { class: 'exp-name' }, g.id, h('span', { class: 'exp-sub' }, g.workflows.map((w) => D.workflowName(state.latest, w)).join(', '))),
      badge(g.status),
      h('span', { class: 'hide-s' }, stackedBar(g.counts)),
      h('span', { class: 'hide-s muted', style: 'text-align:right' }, D.fmtDuration(g.durationSec)));
    head.firstChild.classList.add('chev');
    head.addEventListener('click', () => {
      const now = head.getAttribute('aria-expanded') !== 'true';
      head.setAttribute('aria-expanded', String(now));
      if (now) state.open.add(g.id); else state.open.delete(g.id);
    });
    return h('div', { class: 'exp rise', style: `--i:${Math.min(i, 8)}` }, head, body);
  };
  const apply = () => { onState && onState(); render(); };
  search.addEventListener('input', () => { state.q = search.value; apply(); });
  status.addEventListener('change', () => { state.status = status.value; apply(); });
  wf.addEventListener('change', () => { state.workflow = wf.value; apply(); });
  sort.addEventListener('change', () => { state.sort = sort.value; apply(); });
  reset.addEventListener('click', () => { Object.assign(state, { q: '', status: 'all', workflow: 'all', sort: 'status' }); search.value = ''; status.value = 'all'; wf.value = 'all'; sort.value = 'status'; apply(); });
  const count = h('span', { class: 'muted', style: 'align-self:center;font-size:13px' });
  wrap.append(h('div', { class: 'controls', role: 'search', 'aria-label': 'Filter ' + label }, field('s' + uid, 'Search', search), field('st' + uid, 'Status', status), field('wf' + uid, 'Workflow', wf), field('so' + uid, 'Sort', sort), reset, count), list);
  if (jobs && jobs.length) wrap.append(jobsBlock(jobs));
  render();
  return wrap;
}

function testCase(t, history) {
  const strip = history ? D.testStrip(history, t.id) : [];
  const hasHistory = strip.some((s) => s);
  return h('div', { class: 'case' },
    badge(t.status),
    h('div', { class: 'name' }, t.name, h('div', { class: 'muted', style: 'font-size:12.5px' }, D.fmtDuration(t.durationSec), t.job ? ' · ' + t.job : '', t.source === 'job' ? ' · job level result' : '')),
    h('div', {}, hasHistory ? h('span', { class: 'strip', role: 'img', 'aria-label': 'Last results, oldest first: ' + strip.map((s) => ({ p: 'passed', f: 'failed', e: 'error', s: 'skipped' }[s] || 'no result')).join(', ') }, strip.map((s) => h('i', { class: s || 'none', title: { p: 'passed', f: 'failed', e: 'error', s: 'skipped' }[s] || 'no result' }))) : null,
      t.url && D.safeUrl(t.url) ? h('div', { style: 'text-align:right;margin-top:4px' }, link(D.safeUrl(t.url), 'Logs')) : null),
    t.message ? h('pre', { tabindex: '0', 'aria-label': 'Failure message of ' + t.name }, t.message) : null);
}

function jobsBlock(jobs) {
  const bad = jobs.filter((j) => j.status !== 'passed');
  if (!bad.length) return null;
  return h('section', { class: 'card', style: 'margin-top:16px' }, h('h2', {}, 'Jobs that did not run their tests'),
    h('p', { class: 'muted', style: 'margin-top:0' }, 'These jobs failed while preparing the environment or were skipped, so no test result exists for them. They are counted as errors or skipped, never as passed.'),
    h('div', { class: 'table-wrap' }, h('table', {}, h('caption', { class: 'sr-only' }, 'Jobs without test results'),
      h('thead', {}, h('tr', {}, ['Job', 'Status', 'Reason', 'Logs'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, bad.map((j) => h('tr', {}, h('td', {}, h('b', {}, j.name.replace('job: ', '')), h('div', { class: 'muted', style: 'font-size:12.5px' }, j.workflow)), h('td', {}, badge(j.status)), h('td', { class: 'mono' }, j.message), h('td', {}, j.url && D.safeUrl(j.url) ? link(D.safeUrl(j.url), 'Logs') : '–')))))));
}
