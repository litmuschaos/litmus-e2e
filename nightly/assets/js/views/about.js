import { h, icon, badge, link } from '../dom.js?v=c8e7261a28';
import * as D from '../data.js?v=c8e7261a28';
import { pageHead, buildDot } from './common.js?v=c8e7261a28';

export function about(ctx) {
  const root = h('div', { class: 'stack' }, pageHead('Data', 'Where the numbers come from', 'Nothing on this site is estimated. Every figure is read from the files below, which the report workflow writes from the GitHub Actions runs and their JUnit artifacts.'));
  const rows = ctx.builds.map((b) => {
    const info = D.buildInfo(b.key);
    const x = D.buildOf(b);
    const files = ['latest.json', 'history.json'].map((f) => h('a', { href: `data/${info.dir}${f}` }, `data/${info.dir}${f}`));
    return h('tr', {}, h('th', { scope: 'row' }, buildDot(b.key, info.long)),
      h('td', {}, b.state === 'ready' ? h('span', { class: 'badge passed' }, icon('passed'), 'Published') : b.state === 'error' ? h('span', { class: 'badge failed' }, icon('failed'), 'Unreadable') : h('span', { class: 'badge none' }, 'No run yet')),
      h('td', {}, x ? D.fmtDate(b.latest.generatedAt) : '–'),
      h('td', { class: 'mono' }, b.history ? D.builds(b.history).length : '–'),
      h('td', { class: 'files' }, files));
  });
  root.append(h('section', { class: 'glass panel reveal' }, h('h2', {}, 'Published data'),
    h('div', { class: 'table-wrap' }, h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['Build', 'State', 'Generated', 'Runs on record', 'Files'].map((t) => h('th', { scope: 'col' }, t)))), h('tbody', {}, rows))),
    ctx.builds.some((b) => b.problems.length) ? h('ul', { class: 'plain' }, ctx.builds.flatMap((b) => b.problems.map((p) => h('li', {}, h('i', { class: 'dotmark warn', 'aria-hidden': 'true' }), p)))) : null));
  root.append(h('section', { class: 'glass panel reveal prose' },
    h('h2', {}, 'How to read it'),
    h('ul', {},
      h('li', {}, h('b', {}, 'Status. '), 'A build is passed only when every required workflow ran and passed. One failing test turns it red; a missing or cancelled workflow makes it incomplete, never green.'),
      h('li', {}, h('b', {}, 'Pass rate. '), 'passed ÷ (passed + failed + error). Skipped tests and tests that never ran are not counted as passing.'),
      h('li', {}, h('b', {}, 'Builds. '), 'Nightly is built from the default branch every day. RC and GA are published the same way into data/rc/ and data/ga/. A build that has not produced data shows "no run yet".'),
      h('li', {}, h('b', {}, 'Release readiness. '), 'Compares the latest run of each stage that exists. A test that passed in an earlier stage and fails in a later one is a regression; a stage without a run is never counted as failing.'),
      h('li', {}, h('b', {}, 'Cloud experiments. '), 'AWS, Azure, GCP and VMware are supported but need credentials, so they are optional workflows and not part of the status.'),
      h('li', {}, h('b', {}, 'Flaky. '), 'At least two changes between passing and failing in the recent runs on record.'))));
  return root;
}
