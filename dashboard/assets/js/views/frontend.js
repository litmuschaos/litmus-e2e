import { h, tip } from '../dom.js';
import { lineChart } from '../charts.js';
import * as D from '../data.js';
import { resultList, emptyState } from './common.js';

const state = { q: '', status: 'all', workflow: 'all', sort: 'status', open: new Set(), latest: null };

export function frontend({ latest, history }) {
  const b = latest && latest.build;
  if (!b) return h('div', { class: 'stack' }, h('h1', {}, 'Frontend E2E'), emptyState('No nightly build yet', 'Frontend results appear after the first nightly run.'));
  state.latest = latest;
  const fe = b.suites.frontend;
  const wfs = b.workflows.filter((w) => w.suite === 'frontend');
  const { groups, jobs } = D.groupTests(latest.tests, 'frontend');
  const workflows = wfs.map((w) => ({ id: w.id, name: w.name }));
  const series = D.suiteSeries(history, 'frontend');
  const withRate = series.filter((s) => s.rate != null);

  const tile = (label, value, hint) => h('div', { class: 'card kpi rise' }, h('div', { class: 'label' }, hint ? tip(hint, label) : label), h('div', { class: 'value' }, String(value)));
  const tiles = h('div', { class: 'grid cols-4' },
    tile('Pass rate', D.fmtRate(D.passRate(fe.counts)), 'passed / (passed + failed + error) of the Cypress test cases in this build.'),
    tile('Passed', fe.counts.passed), tile('Failed', fe.counts.failed + fe.counts.error), tile('Skipped', fe.counts.skipped, 'Skipped tests did not run, they are not counted as passed.'));
  tiles.querySelectorAll('.card').forEach((c, i) => c.style.setProperty('--i', i));

  const status = wfs.map((w) => h('li', {}, h('b', {}, w.name), ': ', w.status === 'not_run' ? 'did not run in this build' : w.status === 'in_progress' ? 'still running' : w.status, w.failureKind === 'infrastructure' ? ' (failed before the tests ran, see the first failed step on the overview)' : ''));

  const chart = withRate.length >= 2 ? (() => { const lo = Math.max(0, Math.floor((Math.min(...withRate.map((s) => s.rate)) - 5) / 10) * 10); const c = lineChart({ yMin: lo, series: [{ name: 'Frontend E2E', color: 'var(--series-2)', points: series.map((s) => ({ x: s.id, y: s.rate })) }], ariaLabel: 'Frontend E2E pass rate per build' }); return h('div', {}, c.root, c.legend); })()
    : h('p', { class: 'muted', style: 'margin:0' }, 'The trend needs at least two builds with frontend results.');

  return h('div', { class: 'stack' },
    h('div', {}, h('h1', {}, 'Frontend E2E'), h('p', { class: 'lede' }, `ChaosCenter Cypress results of build ${b.id}. These are separate from the experiment BDD results, the two suites are never merged into one rate.`)),
    h('ul', { class: 'muted', style: 'margin:0;padding-left:18px' }, status),
    tiles,
    h('section', { class: 'card rise', style: '--i:2', 'aria-labelledby': 'fe-trend' }, h('h2', { id: 'fe-trend' }, 'Reliability over time'), chart),
    h('section', { class: 'card rise', style: '--i:3', 'aria-labelledby': 'fe-res' }, h('h2', { id: 'fe-res' }, 'Specs'),
      resultList({ groups, jobs, workflows, state, history, label: 'specs' })));
}
