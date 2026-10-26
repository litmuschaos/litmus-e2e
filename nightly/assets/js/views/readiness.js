import { h, icon, badge } from '../dom.js?v=2bc8c8a764';
import * as D from '../data.js?v=2bc8c8a764';
import { ring, trendChart, srTable, tone } from '../charts.js?v=2bc8c8a764';
import { countUp, tilt } from '../motion.js?v=2bc8c8a764';
import { pageHead, buildDot, runMeta, idLink, expLink, testTitle } from './common.js?v=2bc8c8a764';

function stage(b, ctx) {
  const info = D.buildInfo(b.key);
  const hd = D.headline(b);
  const rateEl = h('b', { class: 'mono' }, '–');
  const card = h('article', { class: 'glass stage reveal', 'data-b': b.key, 'data-state': hd ? (hd.status === 'failed' ? 'fail' : hd.status === 'passed' ? 'pass' : 'warn') : 'none' },
    h('div', { class: 'row between' }, buildDot(b.key, info.long), hd ? badge(hd.status) : h('span', { class: 'badge none' }, b.state === 'error' ? 'Unreadable' : 'No run yet')),
    h('div', { class: 'stage-ring' }, ring({ rate: hd ? hd.rate : null, status: hd ? hd.status : 'not_run', size: 120, stroke: 9, build: b.key }), h('span', { class: 'mini-ring-v big' }, rateEl, hd && hd.rate != null ? h('small', {}, '%') : null)),
    hd ? [h('dl', { class: 'kv' },
      h('div', {}, h('dt', {}, 'Version'), h('dd', { class: 'mono' }, D.versionOf(b) || 'not recorded')),
      h('div', {}, h('dt', {}, 'Run'), h('dd', {}, D.fmtDate(D.buildOf(b).startedAt))),
      h('div', {}, h('dt', {}, 'Tests'), h('dd', { class: 'mono' }, `${hd.counts.passed}/${hd.executed} passed`))), runMeta(b)]
      : h('p', { class: 'muted' }, b.state === 'error' ? 'The data of this build could not be read.' : info.blurb + ' No run is published yet.'));
  if (hd) countUp(rateEl, hd.rate, (v) => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, ''));
  return tilt(card, 4);
}

function bars(ctx) {
  const suites = [['all', 'All suites'], ['bdd', 'Experiment BDD'], ['frontend', 'Frontend E2E']];
  const rateOf = (b, s) => {
    const x = D.buildOf(b);
    if (!x) return null;
    if (s === 'all') return D.headline(b).rate;
    return x.suites && x.suites[s] ? D.passRate(x.suites[s].counts) : null;
  };
  return h('section', { class: 'glass panel reveal', 'aria-labelledby': 'rb' },
    h('h2', { id: 'rb' }, 'Pass rate side by side'),
    h('div', { class: 'cmp' }, suites.map(([id, name]) => h('div', { class: 'cmp-row' },
      h('span', { class: 'cmp-name' }, name),
      h('div', { class: 'cmp-bars' }, ctx.builds.map((b) => {
        const v = rateOf(b, id);
        return h('div', { class: 'cmp-bar', 'data-b': b.key },
          h('span', { class: 'cmp-label' }, D.buildInfo(b.key).label),
          h('span', { class: 'cmp-track' }, v == null ? h('i', { class: 'none', style: 'width:100%' }) : h('i', { style: `--w:${v}%` })),
          h('span', { class: 'cmp-val mono' }, v == null ? 'no run' : D.fmtRate(v)));
      }))))));
}

function trends(ctx) {
  const series = ctx.builds.filter((b) => b.history && D.builds(b.history).length).map((b) => ({ key: b.key, label: D.buildInfo(b.key).label, points: D.rateSeries(b.history).slice(-30).map((p) => ({ id: p.id, rate: p.rate })) }));
  if (!series.length) return null;
  return h('section', { class: 'glass panel reveal', 'aria-labelledby': 'rt' },
    h('h2', { id: 'rt' }, 'Pass rate over time'),
    h('div', { class: 'legend' }, series.map((s) => buildDot(s.key, s.label))),
    h('div', { class: 'chart-box' }, trendChart(series)),
    ...series.map((s) => srTable(s.label + ' pass rate per build', ['Build', 'Pass rate'], s.points.map((p) => [p.id, D.fmtRate(p.rate)]))));
}

export function readinessView(ctx) {
  const root = h('div', { class: 'stack' }, pageHead('Release readiness', 'Nightly, RC and GA side by side', 'How the same tests fare in each stage. A stage that has not run is shown as such and never counted as failing.'));
  const r = D.readiness(ctx.builds);
  root.append(h('div', { class: 'stage-grid' }, ctx.builds.map((b, i) => [stage(b, ctx), i < 2 ? h('span', { class: 'stage-arrow', 'aria-hidden': 'true' }, icon('arrow')) : null])));
  if (r.stages.length < 2) {
    root.append(h('div', { class: 'glass panel reveal' }, h('h2', {}, 'Nothing to compare yet'), h('p', { class: 'muted' }, r.stages.length ? `Only ${D.buildInfo(r.stages[0]).long} has a published run. Comparisons appear as soon as a second build has run.` : 'No build has a published run.')));
    return root;
  }
  root.append(bars(ctx), trends(ctx));
  const reg = r.regressions;
  root.append(h('section', { class: 'glass panel reveal', 'data-state': reg.length ? 'fail' : 'pass', 'aria-labelledby': 'rg' },
    h('h2', { id: 'rg' }, reg.length ? `Regressions between stages (${reg.length})` : 'No regressions between stages'),
    h('p', { class: 'muted' }, reg.length ? 'Tests that passed in an earlier stage and fail in the next one.' : `Every test that passed in an earlier stage also passes in the stages after it (${r.stages.map((k) => D.buildInfo(k).label).join(' → ')}).`),
    reg.length ? h('ul', { class: 'plain fails' }, reg.slice(0, 24).map((x) => { const t = testTitle(x.id, x.name); return h('li', {}, h('i', { class: 'dotmark bad', 'aria-hidden': 'true' }), idLink(x.id), h('span', { class: 'sub' }, t.name), h('span', { class: 'route' }, buildDot(x.from), icon('arrow'), buildDot(x.to)), x.message ? h('code', { class: 'msg' }, x.message.slice(0, 140)) : null); })) : null,
    reg.length > 24 ? h('p', { class: 'note' }, `${reg.length - 24} more not listed.`) : null));
  const dv = r.diverging;
  root.append(h('section', { class: 'glass panel reveal', 'aria-labelledby': 'dv' },
    h('h2', { id: 'dv' }, `Experiments that differ between builds (${dv.length})`),
    dv.length ? h('div', { class: 'table-wrap' }, h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Experiment'), ctx.builds.map((b) => h('th', { scope: 'col' }, buildDot(b.key))))),
      h('tbody', {}, dv.slice(0, 60).map((row) => h('tr', {}, h('th', { scope: 'row' }, expLink(row.key, row.group)), ctx.builds.map((b) => h('td', {}, row.st[b.key] ? badge(row.st[b.key]) : h('span', { class: 'badge none' }, 'not run'))))))))
      : h('p', { class: 'muted' }, 'All compared builds agree on every experiment.'),
    r.onlyIn.length ? h('p', { class: 'note' }, `${r.onlyIn.length} tests exist in a later stage but have no result in the stage before it, they are not compared.`) : null));
  return root;
}
