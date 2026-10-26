import { h, icon, badge, link } from '../dom.js';
import * as D from '../data.js';
import { ring, sparkline, trendChart, stackedBar, srTable } from '../charts.js';
import { countUp, embers, tilt, magnetic } from '../motion.js';
import { pageHead, buildDot, runMeta, buildGap, idLink, testTitle } from './common.js';
import { liveView } from './live.js';

const SUITE_NAMES = { bdd: 'Experiment BDD', frontend: 'ChaosCenter frontend E2E' };
const VERDICT = {
  failed: 'Failing', error: 'Failing', passed: 'All green', incomplete: 'Incomplete', skipped: 'Skipped',
};

function verdictOf(hd) {
  if (hd.status === 'failed') {
    const n = hd.counts.failed + hd.counts.error;
    return { big: String(n), small: n === 1 ? 'test failing' : 'tests failing', numeric: n };
  }
  if (hd.status === 'passed') return { big: 'All green', small: `${hd.counts.passed} tests passed`, numeric: null };
  return { big: VERDICT[hd.status] || hd.status, small: 'the build did not finish every required workflow', numeric: null };
}

function hero(b, ctx) {
  const info = D.buildInfo(b.key);
  const hd = D.headline(b);
  const wrap = h('section', { class: 'hero glass', 'data-b': b.key });
  if (!hd) {
    return buildGap(b, ctx.retry);
  }
  const v = verdictOf(hd);
  const failing = hd.status === 'failed';
  wrap.dataset.state = failing ? 'fail' : hd.status === 'passed' ? 'pass' : 'warn';
  const rateEl = h('b', { class: 'ring-num' }, '–');
  const ringBox = h('div', { class: 'ring-box', style: 'view-transition-name:hero-ring' },
    failing ? h('canvas', { class: 'embers', 'aria-hidden': 'true' }) : null,
    ring({ rate: hd.rate, status: hd.status, size: 220, stroke: 12, build: b.key }),
    h('div', { class: 'ring-center' }, h('span', { class: 'ring-label' }, 'Pass rate'), h('span', { class: 'ring-value' }, rateEl, hd.rate != null ? h('small', {}, '%') : null)));
  wrap.append(
    h('div', { class: 'hero-copy' },
      h('p', { class: 'kicker' }, buildDot(b.key, info.long)),
      h('h1', { class: 'verdict', 'aria-live': 'polite' }, h('span', { class: 'verdict-big glitch', 'data-text': v.big }, v.big)),
      h('p', { class: 'lede' }, `${v.small}. ${hd.executed} executed${hd.counts.skipped ? ', ' + hd.counts.skipped + ' skipped' : ''} across the experiment BDD and frontend suites${hd.counts.error ? '; ' + hd.counts.error + ' did not run to a result' : ''}.`),
      runMeta(b),
      h('div', { class: 'cta' },
        magnetic(h('a', { class: 'btn primary', href: ctx.href('experiments') }, 'Open experiments', icon('arrow'))),
        magnetic(h('a', { class: 'btn', href: ctx.href('readiness') }, 'Release readiness')))),
    ringBox);
  countUp(rateEl, hd.rate, (x) => (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, ''), 1100);
  if (failing) { const c = ringBox.querySelector('canvas'); ctx.onLeave(embers(c, { count: Math.min(40, 12 + hd.counts.failed * 3) })); }
  return wrap;
}

function stripCard(b, ctx, selected) {
  const info = D.buildInfo(b.key);
  const hd = D.headline(b);
  const series = b.history ? D.rateSeries(b.history).slice(-14).map((s) => s.rate) : [];
  const status = hd ? hd.status : b.state === 'error' ? 'error' : 'not_run';
  const rateEl = h('b', { class: 'mono' }, '–');
  const card = h('a', { class: 'glass strip-card', href: ctx.href(ctx.route, { b: b.key }), 'data-b': b.key, 'data-state': hd ? (hd.status === 'failed' ? 'fail' : hd.status === 'passed' ? 'pass' : 'warn') : 'none', 'aria-current': selected ? 'true' : null, style: `view-transition-name:strip-${b.key}`,
    onclick: (e) => { e.preventDefault(); ctx.selectBuild(b.key); } },
    h('div', { class: 'strip-top' }, buildDot(b.key, info.long), hd ? badge(status) : h('span', { class: 'badge none' }, b.state === 'error' ? 'Unreadable' : 'No run yet')),
    h('div', { class: 'strip-mid' },
      h('div', { class: 'mini-ring' }, ring({ rate: hd ? hd.rate : null, status, size: 72, stroke: 7, build: b.key }), h('span', { class: 'mini-ring-v' }, rateEl, hd && hd.rate != null ? h('small', {}, '%') : null)),
      sparkline(series, { w: 132, h: 40 })),
    h('div', { class: 'strip-bot' }, hd ? [h('span', {}, D.fmtAgo(D.buildOf(b).startedAt)), D.versionOf(b) ? h('span', { class: 'mono' }, D.versionOf(b)) : null] : h('span', {}, b.state === 'error' ? 'Data could not be read' : 'Waiting for the first run')));
  if (hd) countUp(rateEl, hd.rate, (x) => (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, ''));
  else rateEl.textContent = '–';
  return tilt(card, 5);
}

function changed(b, ctx) {
  const w = D.whatChanged(b);
  const list = (ids, tone, empty) => (ids.length
    ? h('ul', { class: 'plain' }, ids.slice(0, 6).map((id) => { const t = testTitle(id); return h('li', {}, h('i', { class: 'dotmark ' + tone, 'aria-hidden': 'true' }), idLink(id), h('span', { class: 'sub' }, t.name)); }))
    : h('p', { class: 'muted' }, empty));
  const onlyOne = w.buildsConsidered < 2;
  return h('section', { class: 'glass panel reveal', 'aria-labelledby': 'chg' },
    h('h2', { id: 'chg' }, 'What changed since the last run'),
    onlyOne ? h('p', { class: 'note' }, 'Only one run of this build is on record, so there is nothing to compare it with yet. The comparison starts with the second run.') : null,
    h('div', { class: 'grid cols-3 changed' },
      h('div', {}, h('h3', { class: 'bad-ink' }, `New failures (${w.newlyFailing.length})`), onlyOne ? h('p', { class: 'muted' }, 'Needs two runs.') : list(w.newlyFailing, 'bad', 'No test started failing.')),
      h('div', {}, h('h3', { class: 'ok-ink' }, `Recovered (${w.recovered.length})`), onlyOne ? h('p', { class: 'muted' }, 'Needs two runs.') : list(w.recovered, 'ok', 'Nothing recovered.')),
      h('div', {}, h('h3', {}, 'Slowest'),
        w.slowest.length ? h('ul', { class: 'plain' }, w.slowest.map((t) => h('li', {}, h('span', { class: 'mono dur' }, D.fmtDuration(t.durationSec)), h('span', { class: 'sub', title: t.id }, D.shortName(t.name || t.id))))) : h('p', { class: 'muted' }, 'No timings in the results.'))),
    w.durationChange && w.durationChange.percent != null ? h('p', { class: 'note' }, `The build took ${D.fmtDuration(w.durationChange.latestSec)}, ${Math.abs(w.durationChange.percent)}% ${w.durationChange.percent < 0 ? 'less' : 'more'} than the one before.`) : null);
}

function suites(b) {
  const x = D.buildOf(b);
  const defs = (b.latest.config && b.latest.config.suites) || [];
  return h('div', { class: 'grid cols-2' }, Object.entries(x.suites || {}).map(([id, s]) => {
    const name = (defs.find((d) => d.id === id) || {}).name || SUITE_NAMES[id] || id;
    const c = s.counts || {};
    const rate = D.passRate(c);
    const rateEl = h('b', { class: 'mono big' }, '–');
    const o = s.optionalCounts;
    const card = h('article', { class: 'glass panel reveal', 'data-state': s.status === 'failed' ? 'fail' : s.status === 'passed' ? 'pass' : 'warn' },
      h('div', { class: 'row between' }, h('h3', {}, name), badge(s.status)),
      h('p', { class: 'num-line' }, rateEl, rate != null ? h('small', {}, '%') : null, h('span', { class: 'muted' }, rate != null ? ' pass rate' : ' nothing executed')),
      stackedBar(c, name),
      h('p', { class: 'legend' }, h('span', { class: 'ok-ink' }, `${c.passed || 0} passed`), h('span', { class: 'bad-ink' }, `${(c.failed || 0) + (c.error || 0)} failed`), h('span', { class: 'warn-ink' }, `${c.skipped || 0} skipped`)),
      o && D.total(o) ? h('p', { class: 'note' }, `Not part of the status: ${D.total(o)} optional cloud checks (${o.passed || 0} passed).`) : null);
    countUp(rateEl, rate, (v) => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, ''));
    return card;
  }));
}

function workflows(b) {
  const x = D.buildOf(b);
  const req = x.workflows.filter((w) => w.required);
  const opt = x.workflows.filter((w) => !w.required);
  const row = (w) => {
    const c = w.counts || {};
    return h('tr', {}, h('th', { scope: 'row' }, w.name), h('td', {}, badge(w.status)),
      h('td', { class: 'mono' }, w.status === 'not_run' ? '–' : `${c.passed || 0}/${D.executed(c)}`),
      h('td', { class: 'mono' }, D.fmtDuration(w.durationSec)),
      h('td', {}, w.runUrl && D.safeUrl(w.runUrl) ? link(D.safeUrl(w.runUrl), 'Run') : '–'));
  };
  const table = (rows) => h('div', { class: 'table-wrap' }, h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['Workflow', 'Status', 'Passed', 'Duration', 'Log'].map((t) => h('th', { scope: 'col' }, t)))), h('tbody', {}, rows.map(row))));
  return h('section', { class: 'glass panel reveal', 'aria-labelledby': 'wf' },
    h('h2', { id: 'wf' }, 'Workflows'), table(req),
    opt.length ? h('details', { class: 'opt' }, h('summary', {}, `${opt.length} cloud workflows (AWS, Azure, GCP, VMware …) are supported but not run in this build`), table(opt)) : null);
}

function failures(b) {
  const bad = (b.latest.tests || []).filter((t) => (t.kind === 'test' || !t.kind) && (t.status === 'failed' || t.status === 'error'));
  if (!bad.length) return null;
  return h('section', { class: 'glass panel reveal', 'aria-labelledby': 'fl' },
    h('h2', { id: 'fl' }, `Failing tests (${bad.length})`),
    h('ul', { class: 'plain fails' }, bad.slice(0, 10).map((t) => h('li', {}, h('i', { class: 'dotmark bad', 'aria-hidden': 'true' }), idLink(t.id), h('span', { class: 'sub' }, D.shortName(t.name)), t.message ? h('code', { class: 'msg' }, t.message.slice(0, 160)) : null))),
    bad.length > 10 ? h('p', { class: 'note' }, `${bad.length - 10} more in `, h('a', { href: '#/experiments?status=failed&b=' + b.key }, 'Experiments'), '.') : null);
}

function trend(b) {
  const pts = D.rateSeries(b.history).slice(-30).map((p) => ({ id: p.id, rate: p.rate, version: null }));
  if (!pts.length) return null;
  return h('section', { class: 'glass panel reveal', 'aria-labelledby': 'tr' },
    h('h2', { id: 'tr' }, 'Pass rate over time'),
    pts.length < 2 ? h('p', { class: 'note' }, 'One run is on record. The line appears with the second run; history builds up with every run that is published.') : null,
    h('div', { class: 'chart-box' }, trendChart([{ key: b.key, label: D.buildInfo(b.key).label, points: pts }])),
    srTable('Pass rate per build', ['Build', 'Pass rate'], pts.map((p) => [p.id, D.fmtRate(p.rate)])));
}

export function overview(ctx) {
  const b = ctx.current;
  const root = h('div', { class: 'stack' });
  const live = liveView(ctx);
  root.append(
    ...(live ? [live] : []),
    h('div', { class: 'strip-grid reveal', role: 'group', 'aria-label': 'Builds' }, ctx.builds.map((x) => stripCard(x, ctx, x.key === b.key))),
    hero(b, ctx));
  if (b.state !== 'ready' || !D.buildOf(b)) {
    root.prepend(h('h1', { class: 'sr-only' }, 'Overview of ' + D.buildInfo(b.key).long));
    if (b.state === 'ready') root.append(h('p', { class: 'note' }, 'This build has history but no latest result.'));
    return root;
  }
  const x = D.buildOf(b);
  if (x.stale) root.append(h('div', { class: 'banner warn', role: 'status' }, icon('clock'), `The newest ${D.buildInfo(b.key).label} run started ${Math.round(x.ageHours)} hours ago. Nothing newer has been published, so this may not be the current state.`));
  root.append(changed(b, ctx), suites(b), h('div', { class: 'grid cols-2 wide-left' }, failures(b) || h('div', { class: 'glass panel reveal' }, h('h2', {}, 'No failing tests'), h('p', { class: 'muted' }, 'Every executed test passed in this build.')), trend(b)), workflows(b));
  return root;
}
