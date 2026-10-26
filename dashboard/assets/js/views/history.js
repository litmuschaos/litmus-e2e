import { h, badge, link, icon } from '../dom.js';
import { lineChart, timeline } from '../charts.js';
import * as D from '../data.js';
import { emptyState } from './common.js';

export function historyView({ latest, history }) {
  const bs = D.builds(history);
  if (!bs.length) return h('div', { class: 'stack' }, h('h1', {}, 'History'), emptyState('No history yet', 'The history is built from the nightly runs, it fills in as builds complete.'));
  const bdd = D.suiteSeries(history, 'bdd'), fe = D.suiteSeries(history, 'frontend');
  const rates = [...bdd, ...fe].map((s) => s.rate).filter((v) => v != null);
  const floor = rates.length ? Math.max(0, Math.floor((Math.min(...rates) - 5) / 10) * 10) : 0;
  const rateChart = lineChart({ yMin: floor, ariaLabel: 'Pass rate of each suite per build', series: [
    { name: 'BDD', color: 'var(--series-1)', points: bdd.map((s) => ({ x: s.id, y: s.rate })) },
    { name: 'Frontend', color: 'var(--series-2)', points: fe.map((s) => ({ x: s.id, y: s.rate })) }] });
  const dur = D.durationSeries(history);
  const maxDur = Math.max(1, ...dur.map((d) => d.value || 0));
  const durChart = lineChart({ ariaLabel: 'Duration of each build', yMin: 0, yMax: Math.ceil(maxDur / 600) * 600, format: (v) => D.fmtDuration(v), series: [{ name: 'Duration', color: 'var(--series-1)', points: dur.map((d) => ({ x: d.id, y: d.value })) }] });

  const withTable = (title, chart, rows) => {
    const tbl = h('div', { class: 'table-wrap', hidden: true }, h('table', {}, h('caption', {}, title + ' as a table'), h('thead', {}, h('tr', {}, rows.head.map((t) => h('th', { scope: 'col' }, t)))), h('tbody', {}, rows.body.map((r) => h('tr', {}, r.map((c) => h('td', {}, c)))))));
    const btn = h('button', { class: 'btn viewtoggle', type: 'button', 'aria-pressed': 'false' }, 'Show as table');
    btn.addEventListener('click', () => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? 'Show chart' : 'Show as table'; tbl.hidden = !on; chartBox.hidden = on; });
    const chartBox = h('div', {}, chart.root, chart.legend);
    return h('div', {}, chartBox, tbl, btn);
  };

  const ago = (iso) => D.fmtAgo(iso);
  const failing = D.failingInWindow(history, 14);
  const strips = failing.slice(0, 25);
  const recur = (latest.metrics && latest.metrics.recurringFailures) || [];

  const buildRows = [...bs].reverse().map((b) => h('tr', {},
    h('td', {}, h('b', {}, b.id), h('div', { class: 'muted', style: 'font-size:12.5px' }, ago(b.startedAt))),
    h('td', {}, badge(b.status)),
    h('td', { class: 'num' }, D.fmtRate(D.passRate(b.suites.bdd.counts))), h('td', { class: 'num' }, D.fmtRate(D.passRate(b.suites.frontend.counts))),
    h('td', { class: 'num' }, D.fmtDuration(b.durationSec)),
    h('td', {}, h('span', { class: 'chips' }, Object.entries(b.workflows).filter(([, w]) => w.runUrl && D.safeUrl(w.runUrl)).map(([id, w]) => link(D.safeUrl(w.runUrl), D.workflowName(latest, id), { 'aria-label': `${D.workflowName(latest, id)} run of ${b.id}, ${w.status}`, class: 'tag' }))))));

  const stripTable = h('div', { class: 'table-wrap' }, h('table', {}, h('caption', {}, `Tests that failed in the last ${Math.min(14, bs.length)} builds, oldest result first. A gap means the test has no result in that build.`),
    h('thead', {}, h('tr', {}, [h('th', { scope: 'col' }, 'Test'), h('th', { scope: 'col' }, 'Results'), h('th', { scope: 'col', class: 'num' }, 'Failures')])),
    h('tbody', {}, strips.map((f) => { const d = D.describeId(f.id); const s = D.testStrip(history, f.id); return h('tr', {}, h('td', {}, h('b', {}, d.group), h('div', { class: 'muted', style: 'font-size:12.5px;overflow-wrap:anywhere' }, d.suite === 'frontend' ? 'frontend · ' : '', d.name.replace(/^job: /, 'job '))), h('td', {}, h('span', { class: 'strip', role: 'img', 'aria-label': s.map((x) => ({ p: 'passed', f: 'failed', e: 'error', s: 'skipped' }[x] || 'no result')).join(', ') }, s.map((x) => h('i', { class: x || 'none' })))), h('td', { class: 'num' }, f.failures)); }))));

  return h('div', { class: 'stack' },
    h('div', {}, h('h1', {}, 'History'), h('p', { class: 'lede' }, `${bs.length} nightly build${bs.length === 1 ? '' : 's'}, from ${bs[0].id} to ${bs[bs.length - 1].id}. Older builds are kept in the published history file, the newest build is the current result.`)),
    h('section', { class: 'card rise', 'aria-labelledby': 'tl' }, h('h2', { id: 'tl' }, 'Build status'), timeline(bdd.map((s, i) => ({ id: s.id, status: bs[i].status, rate: null }))),
      h('div', { class: 'legend' }, h('span', {}, h('i', { style: 'background:var(--good);height:10px' }), 'passed'), h('span', {}, h('i', { style: 'background:var(--bad);height:10px' }), 'failed'), h('span', {}, h('i', { style: 'background:var(--warn);height:10px' }), 'incomplete'))),
    h('div', { class: 'grid cols-2' },
      h('section', { class: 'card rise', style: '--i:1', 'aria-labelledby': 'rt' }, h('h2', { id: 'rt' }, 'Pass rate'), h('p', { class: 'muted', style: 'margin:-6px 0 10px;font-size:13px' }, `Per suite, required workflows only. The axis starts at ${floor}%. A build without a result for a suite leaves a gap, it is not drawn as 0%.`), withTable('Pass rate', rateChart, { head: ['Build', 'BDD', 'Frontend'], body: bs.map((b, i) => [b.id, D.fmtRate(bdd[i].rate), D.fmtRate(fe[i].rate)]) })),
      h('section', { class: 'card rise', style: '--i:2', 'aria-labelledby': 'dt' }, h('h2', { id: 'dt' }, 'Duration'), h('p', { class: 'muted', style: 'margin:-6px 0 10px;font-size:13px' }, 'From the start of the first workflow to the end of the last one.'), withTable('Duration', durChart, { head: ['Build', 'Duration'], body: bs.map((b) => [b.id, D.fmtDuration(b.durationSec)]) }))),
    h('section', { class: 'card rise', style: '--i:3', 'aria-labelledby': 'rf' }, h('h2', { id: 'rf' }, 'Failures in the last 14 builds'),
      strips.length ? stripTable : h('p', { class: 'muted' }, 'No test failed in this window.'),
      failing.length > strips.length ? h('p', { class: 'muted' }, `${failing.length - strips.length} more not shown.`) : null,
      recur.length ? h('p', { class: 'muted', style: 'margin-bottom:0' }, `${recur.length} test${recur.length > 1 ? 's are' : ' is'} failing in two or more consecutive builds.`) : null),
    h('section', { class: 'card rise', style: '--i:4', 'aria-labelledby': 'bl' }, h('h2', { id: 'bl' }, 'All builds'),
      h('div', { class: 'table-wrap' }, h('table', {}, h('caption', { class: 'sr-only' }, 'Builds, newest first'), h('thead', {}, h('tr', {}, ['Build', 'Status', 'BDD pass rate', 'Frontend pass rate', 'Duration', 'Runs'].map((t, i) => h('th', { scope: 'col', class: i === 2 || i === 3 || i === 4 ? 'num' : '' }, t)))), h('tbody', {}, buildRows)))));
}
