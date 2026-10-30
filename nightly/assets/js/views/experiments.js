import { h, icon, badge, announce } from '../dom.js?v=4bda9f31e2';
import * as D from '../data.js?v=4bda9f31e2';
import { strip } from '../charts.js?v=4bda9f31e2';
import { tilt } from '../motion.js?v=4bda9f31e2';
import { pageHead, buildDot, buildGap, runMeta } from './common.js?v=4bda9f31e2';

const STATUS_CHIPS = [['all', 'All'], ['failed', 'Failing'], ['flaky', 'Flaky'], ['skipped', 'Skipped'], ['passed', 'Passing']];

function view(ctx, { suite, title, kicker, lede }) {
  const b = ctx.current;
  const root = h('div', { class: 'stack' }, pageHead(kicker, title, lede));
  if (b.state !== 'ready' || !b.latest || !b.latest.build) {
    root.append(buildGap(b, ctx.retry));
    return root;
  }
  const mine = D.experimentIndex(ctx.builds).filter((e) => (!suite || e.suite === suite) && e.builds[b.key]);
  for (const e of mine) {
    e.strip = D.groupStrip(b.history, e.key, 14);
    e.flaky = D.flips(e.strip) >= 2;
  }
  const state = { q: ctx.params.get('q') || '', cat: ctx.params.get('cat') || 'all', status: ctx.params.get('status') || 'all' };
  const cats = suite === 'frontend' ? [] : D.CATEGORIES.filter((c) => mine.some((e) => e.category === c));
  const input = h('input', { type: 'search', id: 'xs', value: state.q, placeholder: 'Search experiments, tests, errors', autocomplete: 'off', 'aria-label': 'Search experiments', 'aria-controls': 'xgrid' });
  const count = h('p', { class: 'count', 'aria-live': 'polite' });
  const grid = h('div', { class: 'xgrid', id: 'xgrid' });
  const chipRow = (label, items, key) => h('div', { class: 'chips', role: 'group', 'aria-label': label },
    items.map(([v, t, n]) => h('button', { class: 'chip-btn', type: 'button', 'aria-pressed': String(state[key] === v), 'data-v': v, onclick: () => { state[key] = v; sync(); draw(); } }, t, n != null ? h('small', {}, n) : null)));
  const catBox = h('div', {}), statusBox = h('div', {});

  const matches = (e) => {
    if (state.cat !== 'all' && e.category !== state.cat) return false;
    const g = e.builds[b.key];
    if (state.status === 'flaky') { if (!e.flaky) return false; } else if (state.status !== 'all' && g.status !== state.status && !(state.status === 'failed' && g.status === 'error')) return false;
    return true;
  };
  const score = (e) => {
    if (!state.q.trim()) return 0;
    const g = e.builds[b.key];
    const s1 = D.fuzzy(state.q, e.id);
    let s2 = null;
    for (const t of g.tests) { const v = D.fuzzy(state.q, t.name + ' ' + (t.message || '')); if (v != null && (s2 == null || v > s2)) s2 = v; }
    if (s1 == null && s2 == null) return null;
    return Math.max(s1 == null ? -1e9 : s1, s2 == null ? -1e9 : s2 * 0.5);
  };
  const card = (e) => {
    const g = e.builds[b.key];
    const tone = g.status === 'passed' ? 'pass' : g.status === 'skipped' ? 'warn' : 'fail';
    const el = h('button', { class: 'glass xcard', type: 'button', 'data-state': e.flaky && tone === 'pass' ? 'flaky' : tone, 'data-b': b.key, 'aria-haspopup': 'dialog', onclick: () => ctx.openExperiment(e.key) },
      h('div', { class: 'row between' }, h('span', { class: 'tag' }, e.category), e.flaky ? h('span', { class: 'badge warn flicker' }, icon('skipped'), 'Flaky') : badge(g.status)),
      h('h3', { class: 'mono xname' }, e.id),
      h('div', { class: 'xmeta' }, h('span', { class: 'mono' }, `${g.counts.passed}/${D.total(g.counts)} passed`), h('span', { class: 'mono' }, D.fmtDuration(g.durationSec))),
      h('div', { class: 'row between' }, e.strip.length ? strip(e.strip, 'Recent results of ' + e.id) : h('span', { class: 'sub' }, 'No history yet'),
        h('span', { class: 'dots', role: 'img', 'aria-label': 'Status per build' },
          ctx.builds.map((x) => { const eg = e.builds[x.key]; return h('i', { 'data-b': x.key, class: eg ? (eg.status === 'passed' ? 'ok' : eg.status === 'skipped' ? 'warn' : 'bad') : 'none', title: D.buildInfo(x.key).label + ': ' + (eg ? eg.status : 'not run') }); }))));
    el.querySelector('.dots').setAttribute('aria-label', 'Status per build: ' + ctx.builds.map((x) => `${D.buildInfo(x.key).label} ${e.builds[x.key] ? e.builds[x.key].status : 'not run'}`).join(', '));
    return tilt(el, 4);
  };
  const draw = () => {
    const rows = mine.filter(matches).map((e) => ({ e, s: score(e) })).filter((r) => r.s != null);
    if (state.q.trim()) rows.sort((a, c) => c.s - a.s); else rows.sort((a, c) => rank(a.e) - rank(c.e) || a.e.id.localeCompare(c.e.id));
    grid.replaceChildren(...(rows.length ? rows.map((r) => card(r.e)) : [h('div', { class: 'glass gap small' }, h('h2', {}, mine.length ? 'Nothing matches' : 'No results in this build'), h('p', {}, mine.length ? 'Change the search or the filters.' : 'The build has no test results for this page.'), mine.length ? h('button', { class: 'btn', type: 'button', onclick: reset }, 'Clear filters') : null)]));
    const text = `${rows.length} of ${mine.length} ${suite === 'frontend' ? 'specs' : 'experiments'}`;
    count.textContent = text;
    announce(text + ' shown');
    grid.classList.remove('settle'); void grid.offsetWidth; grid.classList.add('settle');
  };
  const rank = (e) => { const s = e.builds[b.key].status; return s === 'failed' ? 0 : s === 'error' ? 1 : e.flaky ? 2 : s === 'skipped' ? 3 : 4; };
  const reset = () => { state.q = ''; state.cat = 'all'; state.status = 'all'; input.value = ''; sync(); draw(); };
  const sync = () => {
    ctx.setParams({ q: state.q || null, cat: state.cat === 'all' ? null : state.cat, status: state.status === 'all' ? null : state.status });
    catBox.replaceChildren(cats.length ? chipRow('Category', [['all', 'All', mine.length], ...cats.map((c) => [c, c, mine.filter((e) => e.category === c).length])], 'cat') : '');
    statusBox.replaceChildren(chipRow('Status', STATUS_CHIPS.map(([v, t]) => [v, t, v === 'all' ? mine.length : v === 'flaky' ? mine.filter((e) => e.flaky).length : mine.filter((e) => e.builds[b.key].status === v || (v === 'failed' && e.builds[b.key].status === 'error')).length]), 'status'));
  };
  input.addEventListener('input', () => { state.q = input.value; ctx.setParams({ q: state.q || null }); draw(); });
  sync();
  const buildChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Build' }, ctx.builds.map((x) => h('a', { class: 'chip-btn', href: ctx.href(ctx.route, { b: x.key }), 'aria-current': x.key === b.key ? 'true' : null, 'data-b': x.key, onclick: (ev) => { ev.preventDefault(); ctx.selectBuild(x.key); } }, buildDot(x.key), x.state === 'ready' ? null : h('small', {}, 'no run'))));
  root.append(
    h('section', { class: 'glass toolbar reveal', 'aria-label': 'Filters' },
      h('label', { class: 'search', for: 'xs' }, icon('search'), input, h('kbd', { 'aria-hidden': 'true' }, '/')),
      h('div', { class: 'filters' }, buildChips, catBox, statusBox), count),
    runMeta(b), h('h2', { class: 'sr-only' }, suite === 'frontend' ? 'Specs' : 'Results'), grid);
  draw();
  ctx.focusSearch = () => input.focus();
  return root;
}

export function experiments(ctx) {
  return view(ctx, { suite: null, title: 'Experiments', kicker: 'Every experiment and component check', lede: 'The BDD tests of the experiments and the ChaosCenter specs of the selected build. Open one for its steps, failure output, duration and trend.' });
}

export function frontend(ctx) {
  return view(ctx, { suite: 'frontend', title: 'Frontend E2E', kicker: 'ChaosCenter specs', lede: 'The Cypress specs that drive ChaosCenter, grouped by spec. UI specs click through the portal, REST API specs call the backend directly.' });
}
