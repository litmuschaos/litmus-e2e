import { h, icon, badge, statusLabel } from '../dom.js';
import { buildInfo, buildOf, describeId, shortName, fmtAgo, fmtDate, versionOf, groupOfId } from '../data.js';
import { magnetic } from '../motion.js';

export function skeleton() {
  return h('div', { class: 'stack', 'aria-busy': 'true', 'aria-label': 'Loading the results' },
    h('div', { class: 'skel', style: 'height:300px;border-radius:24px' }),
    h('div', { class: 'grid cols-3' }, [0, 1, 2].map(() => h('div', { class: 'skel', style: 'height:150px' }))),
    h('div', { class: 'grid cols-2' }, [0, 1].map(() => h('div', { class: 'skel', style: 'height:240px' }))));
}

export function pageHead(kicker, title, sub) {
  return h('header', { class: 'page-head reveal' }, h('p', { class: 'kicker' }, kicker), h('h1', {}, title), sub ? h('p', { class: 'lede' }, sub) : null);
}

export function buildDot(key, label) {
  return h('span', { class: 'bdot', 'data-b': key }, h('i', { 'aria-hidden': 'true' }), label || buildInfo(key).label);
}

export function statusPill(status, text) { return badge(status, text); }

/** Version or tag and age of the run of a build, as small meta chips. */
export function runMeta(b) {
  const x = buildOf(b);
  if (!x) return null;
  const v = versionOf(b);
  return h('div', { class: 'meta' },
    v ? h('span', { class: 'chip mono' }, icon('tag'), v) : null,
    h('span', { class: 'chip', title: fmtDate(x.startedAt) }, icon('clock'), fmtAgo(x.startedAt)),
    x.stale ? h('span', { class: 'chip warn' }, 'Stale · ' + Math.round(x.ageHours) + ' h old') : null);
}

/** The state shown in place of a build that has no data: not run yet, or failed to load. */
export function buildGap(b, retry) {
  const info = buildInfo(b.key);
  const isErr = b.state === 'error';
  return h('section', { class: 'glass gap', 'data-b': b.key },
    h('div', { class: 'gap-art', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
    h('h2', {}, isErr ? `${info.label} results could not be loaded` : `${info.long} has no run yet`),
    h('p', {}, isErr
      ? 'The published files exist but could not be read. ' + b.problems.join(' ') + ' Nothing is shown rather than a guess.'
      : `${info.blurb} Nothing has been published for it, so there are no numbers to show. The page fills in on its own after the first run publishes data/${info.dir}latest.json.`),
    isErr && retry ? magnetic(h('button', { class: 'btn primary', type: 'button', onclick: retry }, 'Try again')) : null);
}

/** Readable test name with the experiment it belongs to. */
export function testTitle(id, fallbackName) {
  const d = describeId(id);
  return { group: d.group, name: shortName(fallbackName || d.name), suite: d.suite };
}

export function expLink(key, label, extra = {}) {
  return h('a', { href: '#', class: 'xlink mono', onclick: (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-experiment', { detail: key })); }, ...extra }, label);
}

export function idLink(id) {
  const key = groupOfId(id);
  const d = describeId(id);
  return expLink(key, d.group, { title: id });
}

export function statusText(s) { return statusLabel(s); }
