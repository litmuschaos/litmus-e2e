import { h, tip } from '../dom.js';
import { stackedBar } from '../charts.js';
import * as D from '../data.js';
import { resultList, emptyState } from './common.js';

const state = { q: '', status: 'all', workflow: 'all', sort: 'status', open: new Set(), latest: null };

export function experiments({ latest, history }, nav, params) {
  const b = latest && latest.build;
  if (!b) return h('div', { class: 'stack' }, h('h1', {}, 'Experiments'), emptyState('No nightly build yet', 'Experiment results appear after the first nightly run.'));
  state.latest = latest;
  if (params.get('q') != null) state.q = params.get('q');
  const { groups, jobs, setup } = D.groupTests(latest.tests, 'bdd');
  const cov = latest.coverage || {};
  const bdd = b.suites.bdd;
  const workflows = b.workflows.filter((w) => w.suite === 'bdd').map((w) => ({ id: w.id, name: w.name }));

  const tile = (label, value, hint) => h('div', { class: 'card kpi rise' }, h('div', { class: 'label' }, hint ? tip(hint, label) : label), h('div', { class: 'value' }, String(value)));
  const tiles = h('div', { class: 'grid cols-4' },
    tile('Experiments run', groups.length, 'Experiments (test files) that produced at least one result in the latest build.'),
    tile('Passing', groups.filter((g) => g.status === 'passed').length, 'All test cases of the experiment passed.'),
    tile('Failing', groups.filter((g) => g.status === 'failed' || g.status === 'error').length, 'At least one test case failed or errored.'),
    tile('Pass rate', D.fmtRate(D.passRate(bdd.counts)), 'passed / (passed + failed + error) of the required BDD workflows. Skipped tests are not counted as passed.'));
  tiles.querySelectorAll('.card').forEach((c, i) => c.style.setProperty('--i', i));

  const coverage = h('section', { class: 'card rise', style: '--i:2', 'aria-labelledby': 'cov' },
    h('div', { class: 'card-head' }, h('h2', { id: 'cov' }, 'Coverage'), cov.executedPercent != null ? h('span', { class: 'muted' }, `${D.fmtRate(cov.executedPercent)} of scheduled experiments ran`) : null),
    h('div', { class: 'grid cols-2' },
      h('div', {}, h('h3', {}, 'By workflow'), h('div', { class: 'table-wrap' }, h('table', {}, h('caption', { class: 'sr-only' }, 'Experiments per workflow'), h('thead', {}, h('tr', {}, [h('th', { scope: 'col' }, 'Workflow'), h('th', { scope: 'col', class: 'num' }, 'Scheduled'), h('th', { scope: 'col', class: 'num' }, 'Ran'), h('th', { scope: 'col' }, 'Not run')])),
        h('tbody', {}, Object.entries(cov.byCategory || {}).map(([cat, list]) => {
          const ran = list.filter((x) => cov.executed.includes(x));
          const miss = list.filter((x) => !cov.executed.includes(x));
          return h('tr', {}, h('td', {}, D.workflowName(latest, cat)), h('td', { class: 'num' }, list.length), h('td', { class: 'num' }, ran.length), h('td', { class: miss.length ? 'mono' : 'muted' }, miss.length ? miss.join(', ') : '–'));
        }))))),
      h('div', {}, h('h3', {}, 'Defined but not scheduled'),
        cov.notScheduled && cov.notScheduled.length ? h('div', {}, h('p', { class: 'muted', style: 'margin:6px 0' }, 'These tests exist in the repository but no nightly workflow runs them.'), h('div', { class: 'chips' }, cov.notScheduled.map((x) => h('span', { class: 'tag' }, x)))) : h('p', { class: 'muted' }, 'Every defined experiment is scheduled.'))));

  const note = h('p', { class: 'muted', style: 'margin:0 0 12px;font-size:13px' }, `${setup.length} setup and cleanup test${setup.length === 1 ? '' : 's'} (install, deploy, cleanup) are not listed as experiments. `, 'Optional cloud workflows are included in the list and marked by their workflow.');

  return h('div', { class: 'stack' },
    h('div', {}, h('h1', {}, 'Experiments'), h('p', { class: 'lede' }, `Experiment BDD results of build ${b.id}. Each row is one experiment, expand it for its test cases and failure messages.`)),
    tiles, coverage,
    h('section', { class: 'card rise', style: '--i:3', 'aria-labelledby': 'res' }, h('div', { class: 'card-head' }, h('h2', { id: 'res' }, 'Results'), bdd.counts ? h('div', { style: 'min-width:180px' }, stackedBar(bdd.counts)) : null), note,
      resultList({ groups, jobs, workflows, state, history, label: 'experiments' })));
}
