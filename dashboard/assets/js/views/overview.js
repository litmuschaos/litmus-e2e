import { h, icon, badge, link, countUp, tip } from '../dom.js';
import { ring, timeline, stackedBar } from '../charts.js';
import * as D from '../data.js';
import { emptyState } from './common.js';

const HEADLINE = { passed: 'Nightly build passed', failed: 'Nightly build failed', incomplete: 'Nightly build incomplete' };

export function overview({ latest, history }, nav) {
  const b = latest && latest.build;
  if (!b) {
    return h('div', { class: 'stack' }, h('h1', {}, 'Nightly build'),
      emptyState('No nightly build yet', 'The nightly workflows have not run on the default branch within the history window, or the report was not generated yet. This page fills in after the first nightly run.'));
  }
  const wfs = b.workflows;
  const required = wfs.filter((w) => w.required);
  const optional = wfs.filter((w) => !w.required);
  const failedReq = required.filter((w) => w.status === 'failed');
  const notRunReq = required.filter((w) => !['passed', 'failed'].includes(w.status));
  const counts = D.addCounts(Object.values(b.suites).map((s) => s.counts));

  const suiteLine = latest.config.suites.map((su) => {
    const c = b.suites[su.id].counts;
    return `${su.name} ${D.fmtRate(D.passRate(c))} passed` + (c.failed + c.error ? ` (${c.failed + c.error} of ${D.total(c)} failed)` : '');
  }).join(' · ');
  let summary;
  if (b.status === 'passed') summary = `All ${required.length} required workflows passed. ${suiteLine}.`;
  else if (b.status === 'failed') summary = `${failedReq.length} of ${required.length} required workflows failed` + (notRunReq.length ? `, ${notRunReq.length} did not finish or run` : '') + `. ${suiteLine}.`;
  else summary = `${notRunReq.length} of ${required.length} required workflows did not run or finish, the result is partial. ${suiteLine}.`;

  const hero = h('section', { class: 'card hero rise', 'aria-labelledby': 'hero-title' },
    h('div', { class: 'hero-mark ' + b.status }, icon(b.status === 'passed' ? 'passed' : b.status === 'failed' ? 'failed' : 'incomplete')),
    h('div', {},
      h('h1', { id: 'hero-title' }, HEADLINE[b.status] || 'Nightly build'),
      h('p', { class: 'lede', style: 'margin:0' }, summary),
      h('div', { class: 'hero-meta' },
        h('span', {}, 'Build ', h('b', {}, b.id)),
        h('span', {}, 'Started ', h('b', {}, D.fmtDate(b.startedAt)), ' (', D.fmtAgo(b.startedAt), ')'),
        h('span', {}, 'Duration ', h('b', {}, D.fmtDuration(b.durationSec))),
        h('span', {}, 'Report generated ', h('b', {}, D.fmtAgo(latest.generatedAt))))),
    b.stale ? h('div', { class: 'banner bad', role: 'note' }, icon('error'), h('div', {}, h('b', {}, 'This is not a recent build. '), `The newest nightly build started ${D.fmtAgo(b.startedAt)}, more than ${latest.config.staleAfterHours} hours ago. The nightly workflows may be disabled, GitHub disables scheduled workflows after 60 days without repository activity.`)) : null,
    b.status === 'incomplete' ? h('div', { class: 'banner', role: 'note' }, icon('incomplete'), h('div', {}, h('b', {}, 'Partial result. '), 'Workflows that did not run or finish are not counted as passing: ', notRunReq.map((w) => w.name).join(', ') + '.')) : null);

  const kpi = (key, label, value) => h('div', { class: 'card kpi rise' }, h('div', { class: 'label' }, h('span', { class: 'dot ' + key }), label), h('div', { class: 'value', 'data-v': value }, String(value)));
  const kpis = h('section', { class: 'grid cols-4', 'aria-label': 'Test counts of the required suites' },
    kpi('passed', 'Passed', counts.passed), kpi('failed', 'Failed', counts.failed), kpi('error', 'Errors', counts.error), kpi('skipped', 'Skipped', counts.skipped));
  kpis.querySelectorAll('.card').forEach((c, i) => c.style.setProperty('--i', i + 1));
  kpis.querySelectorAll('.value').forEach((el) => countUp(el, Number(el.dataset.v)));

  const suiteCard = (s, i) => {
    const sb = b.suites[s.id];
    const series = D.suiteSeries(history, s.id).slice(-14);
    const failed = wfs.filter((w) => w.suite === s.id && w.required && w.status === 'failed').length;
    const color = s.id === 'bdd' ? 'var(--series-1)' : 'var(--series-2)';
    const ringColor = sb.status === 'passed' ? 'var(--good)' : sb.status === 'failed' ? 'var(--bad)' : 'var(--warn)';
    return h('article', { class: 'card rise', style: `--i:${i + 2}`, 'aria-labelledby': 'suite-' + s.id },
      h('div', { class: 'card-head' }, h('h2', { id: 'suite-' + s.id }, s.name), badge(sb.status)),
      h('div', { class: 'suite' },
        ring(D.passRate(sb.counts), ringColor, s.name + ' pass rate'),
        h('div', {},
          h('div', { class: 'countline' },
            h('span', {}, h('b', {}, sb.counts.passed), ' passed'), h('span', {}, h('b', {}, sb.counts.failed), ' failed'),
            h('span', {}, h('b', {}, sb.counts.error), ' errors'), h('span', {}, h('b', {}, sb.counts.skipped), ' skipped')),
          h('div', { style: 'margin-top:10px' }, D.executed(sb.counts) || sb.counts.skipped ? stackedBar(sb.counts) : h('p', { class: 'muted', style: 'margin:0' }, 'No result in this build.')),
          h('p', { class: 'muted', style: 'margin:8px 0 0;font-size:13px' }, failed ? `${failed} workflow${failed > 1 ? 's' : ''} failed.` : (sb.status === 'incomplete' ? 'Required workflow missing or unfinished.' : 'No failing workflow.')))),
      series.length ? h('div', { style: 'margin-top:14px' }, h('div', { class: 'muted', style: 'font-size:12.5px;margin-bottom:6px' }, (series.length === 1 ? 'Last build' : `Last ${series.length} builds`)), timeline(series, () => nav('history'))) : null,
      h('p', { style: 'margin:12px 0 0' }, h('a', { href: s.id === 'bdd' ? '#/experiments' : '#/frontend' }, s.id === 'bdd' ? 'Experiment results →' : 'Frontend results →')));
  };
  const suites = h('section', { class: 'grid cols-2', 'aria-label': 'Suites' }, latest.config.suites.map(suiteCard));

  const row = (w) => h('tr', {},
    h('td', {}, h('b', {}, w.name), w.note ? h('div', { class: 'muted', style: 'font-size:12.5px' }, w.note) : null),
    h('td', {}, w.suite === 'bdd' ? 'Experiment BDD' : 'Frontend E2E'),
    h('td', {}, badge(w.status)),
    h('td', {}, w.failureKind === 'infrastructure' ? tip('The run failed while preparing the environment (cluster, install, credentials), before its tests ran.', 'infrastructure') : w.failureKind === 'tests' ? 'tests' : h('span', { class: 'muted' }, '–')),
    h('td', {}, firstFailure(w)),
    h('td', { class: 'num' }, D.fmtDuration(w.durationSec)),
    h('td', {}, w.runUrl && D.safeUrl(w.runUrl) ? link(D.safeUrl(w.runUrl), 'Run', { 'aria-label': 'Open the run of ' + w.name }) : h('span', { class: 'muted' }, '–')));
  const table = (list, caption) => h('div', { class: 'table-wrap' }, h('table', {}, h('caption', {}, caption),
    h('thead', {}, h('tr', {}, ['Workflow', 'Suite', 'Status', 'Failure', 'First failed step', 'Duration', 'Logs'].map((t, i) => h('th', { scope: 'col', class: i === 5 ? 'num' : '' }, t)))),
    h('tbody', {}, list.map(row))));
  const cloudRan = optional.filter((w) => w.status !== 'not_run');
  const cloud = h('p', { class: 'muted', style: 'margin:16px 0 0;font-size:13px' },
    h('b', {}, 'Cloud experiments'), ` (${optional.map((w) => w.name).join(', ')}) are supported but not part of the nightly build, they need cloud credentials. `,
    cloudRan.length ? ['Results of the ones that ran: ', cloudRan.map((w) => h('span', { style: 'margin-right:6px' }, w.name, ' ', badge(w.status))), ' They do not decide the status of the build.'] : 'None of them ran in this build.');
  const workflows = h('section', { class: 'card rise', style: '--i:4', 'aria-labelledby': 'wf-title' },
    h('div', { class: 'card-head' }, h('h2', { id: 'wf-title' }, 'Workflows')),
    table(required, 'Required workflows, they decide the status of the build'),
    optional.length ? cloud : null);

  return h('div', { class: 'stack' }, hero, kpis, suites, insights(latest, history), workflows);
}

function firstFailure(w) {
  const bad = (w.jobs || []).filter((j) => j.firstFailedStep);
  if (!bad.length) return h('span', { class: 'muted' }, '–');
  const j = bad[0];
  return h('span', {}, h('span', { class: 'mono' }, j.firstFailedStep), bad.length > 1 ? h('span', { class: 'muted' }, ` (+${bad.length - 1} more job${bad.length > 2 ? 's' : ''})`) : null);
}

function insights(latest, history) {
  const m = latest.metrics || {};
  const cov = latest.coverage || {};
  const n = D.builds(history).length;
  const nameOf = (id) => { const d = D.describeId(id); return d.group + (d.name ? ' · ' + D.shortName(d.name.replace(/^job:/, 'job ')) : ''); };
  const list = (ids, max = 5) => ids.length ? h('ul', {}, ids.slice(0, max).map((i) => h('li', {}, nameOf(i.id || i), i.consecutiveBuilds ? ` (${i.consecutiveBuilds} builds in a row)` : '')), ids.length > max ? h('li', { class: 'muted' }, `and ${ids.length - max} more, see History`) : null) : h('p', { class: 'muted', style: 'margin:0' }, 'None.');
  const block = (title, body, why) => h('div', { class: 'insight' }, h('h3', {}, title, why ? tip(why, 'ⓘ') : null), body);
  const dc = m.durationChange;
  return h('section', { class: 'card rise', style: '--i:3', 'aria-labelledby': 'ins-title' },
    h('div', { class: 'card-head' }, h('h2', { id: 'ins-title' }, 'Insights'), h('span', { class: 'muted', style: 'font-size:13px' }, `Computed from ${n} build${n === 1 ? '' : 's'} of history`)),
    h('div', { class: 'grid cols-2 insights' },
      block('Newly failing', list(m.newlyFailing || []), 'Failing in the latest build and passing in the previous one. Needs two builds.'),
      block('Recovered', list(m.recovered || []), 'Failing in the previous build and passing in the latest one.'),
      block('Failing repeatedly', list(m.recurringFailures || []), 'Failing in two or more consecutive builds.'),
      block('Flaky', n < 4 ? h('p', { class: 'muted', style: 'margin:0' }, 'Not enough history yet. A test is reported as flaky after at least 4 results with passes and failures alternating.') : list((m.flakyTests || []).map((f) => ({ id: f.id, consecutiveBuilds: 0 }))), 'At least 4 results in the last 14 builds, passes and failures, and at least 2 changes between them.'),
      block('Duration', dc ? h('p', { style: 'margin:0' }, `${D.fmtDuration(dc.latestSec)} against ${D.fmtDuration(dc.previousSec)} in the previous build, `, h('b', {}, (dc.percent > 0 ? '+' : '') + dc.percent + '%')) : h('p', { class: 'muted', style: 'margin:0' }, 'Needs two builds with a duration.')),
      block('Experiment coverage', cov.scheduled && cov.scheduled.length ? h('p', { style: 'margin:0' }, h('b', {}, cov.executed.length), ` of ${cov.scheduled.length} scheduled experiments ran in this build`, cov.notScheduled.length ? ` · ${cov.notScheduled.length} defined but not scheduled (${cov.notScheduled.join(', ')})` : '') : h('p', { class: 'muted', style: 'margin:0' }, 'Not available.'), 'Experiments with a test in tests/, components/ or platform/ against those a nightly workflow runs and those that produced a result.')));
}
