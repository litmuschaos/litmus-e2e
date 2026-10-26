import { h, icon } from '../dom.js';
import * as D from '../data.js';

export function about({ latest, history, problems }) {
  const b = latest && latest.build;
  const fresh = [
    ['Report generated', latest ? D.fmtDate(latest.generatedAt) + ' (' + D.fmtAgo(latest.generatedAt) + ')' : 'not available'],
    ['Latest build', b ? `${b.id}, started ${D.fmtAgo(b.startedAt)}${b.stale ? ', stale' : ''}` : 'none'],
    ['Builds in the history', String(D.builds(history).length)],
    ['Repository', latest ? latest.repository : 'unknown'],
  ];
  const cfg = (latest && latest.config) || { workflows: [] };
  return h('div', { class: 'stack' },
    h('div', {}, h('h1', {}, 'Data'), h('p', { class: 'lede' }, 'Where the numbers come from and how they are calculated. Nothing on this site is typed in, every value is read from the two files below.')),
    problems && problems.length ? h('div', { class: 'banner bad', role: 'alert' }, icon('error'), h('div', {}, h('b', {}, 'Problems loading the data'), h('ul', {}, problems.map((p) => h('li', {}, p))))) : null,
    h('section', { class: 'card' }, h('h2', {}, 'Freshness'), h('dl', { style: 'display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;margin:0' }, fresh.flatMap(([k, v]) => [h('dt', { class: 'muted' }, k), h('dd', { style: 'margin:0' }, v)])),
      h('p', { style: 'margin-bottom:0' }, h('a', { href: 'data/latest.json' }, 'latest.json'), ' · ', h('a', { href: 'data/history.json' }, 'history.json'))),
    h('section', { class: 'card' }, h('h2', {}, 'Definitions'), h('dl', { class: 'defs' }, ...[
      ['Build', 'A nightly cycle: the 24 hour window starting at 12:00 UTC. The newest run of each nightly workflow on the default branch represents it.'],
      ['Build status', 'Passed when every required workflow passed. Failed when a required workflow failed. Incomplete when a required workflow did not run, was cancelled or is still running. A partial result is never shown as passed.'],
      ['Passed, failed, error, skipped', 'Failed is a test that ran and did not pass. Error is a job that failed before its tests could run, for example the cluster did not start. Skipped did not run. Skipped and error are never counted as passed.'],
      ['Pass rate', 'passed / (passed + failed + error). Shown per suite, the experiment BDD and frontend E2E suites are never merged into one rate. Setup tests (install, deploy, cleanup) are not counted as tests.'],
      ['Required and optional', 'Optional workflows (the cloud experiments) need credentials. Their results are shown, but they do not decide the status of the build.'],
      ['Newly failing, recovered, failing repeatedly', 'Compared with the previous build, and over consecutive builds. Computed from the results kept in history.json.'],
      ['Flaky', 'Reported only with evidence: at least 4 results in the last 14 builds, both passes and failures, and at least 2 changes between them.'],
      ['Coverage', 'Experiments with a test file in tests/, components/ or platform/ against those run by a nightly workflow and those that produced a result in the latest build.'],
      ['Infrastructure failure', 'The run failed at a step that prepares the environment (cluster, install, credentials), before its tests ran.']].flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]))),
    h('section', { class: 'card' }, h('h2', {}, 'Workflows'), h('div', { class: 'table-wrap' }, h('table', {}, h('caption', { class: 'sr-only' }, 'Configured workflows'), h('thead', {}, h('tr', {}, ['Workflow', 'Suite', 'Required'].map((t) => h('th', { scope: 'col' }, t)))), h('tbody', {}, cfg.workflows.map((w) => h('tr', {}, h('td', {}, w.name, w.note ? h('span', { class: 'muted' }, ' · ' + w.note) : null), h('td', {}, w.suite), h('td', {}, w.required ? 'yes' : 'no'))))))));
}
