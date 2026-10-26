// Loading and deriving the numbers shown by the dashboard. Everything here is pure except load(),
// so it can be tested in Node. No value is invented: counts come from latest.json, trends from history.json.

export const STATUS_ORDER = ['failed', 'error', 'skipped', 'passed'];

export async function load(base = '') {
  const get = async (name) => {
    const res = await fetch(base + 'data/' + name, { cache: 'no-cache' });
    if (!res.ok) throw new Error(name + ' answered ' + res.status);
    return res.json();
  };
  const result = { latest: null, history: null, problems: [] };
  const [latest, history] = await Promise.allSettled([get('latest.json'), get('history.json')]);
  if (latest.status === 'fulfilled') result.latest = check(latest.value, 'latest.json', result.problems); else result.problems.push(latest.reason.message);
  if (history.status === 'fulfilled') result.history = check(history.value, 'history.json', result.problems); else result.problems.push(history.reason.message);
  return result;
}

export function check(doc, name, problems) {
  if (!doc || typeof doc !== 'object' || doc.schemaVersion !== 1) {
    problems.push(name + ' has an unsupported format');
    return null;
  }
  return doc;
}

export function safeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' ? u.href : null;
  } catch (e) { return null; }
}

// ---- numbers

export function executed(c) { return (c.passed || 0) + (c.failed || 0) + (c.error || 0); }
export function passRate(c) { const n = executed(c); return n ? (100 * c.passed) / n : null; }
export function total(c) { return executed(c) + (c.skipped || 0); }
export function fmtRate(v) { return v == null ? '–' : (Math.round(v * 10) / 10).toString().replace(/\.0$/, '') + '%'; }

export function addCounts(list) {
  const out = { passed: 0, failed: 0, skipped: 0, error: 0 };
  for (const c of list) for (const k of Object.keys(out)) out[k] += (c && c[k]) || 0;
  return out;
}

export function fmtDuration(sec) {
  if (sec == null || !isFinite(sec)) return '–';
  sec = Math.round(sec);
  if (sec < 60) return sec + 's';
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m < 60) return m + 'm' + (s ? ' ' + String(s).padStart(2, '0') + 's' : '');
  const h = Math.floor(m / 60);
  return h + 'h ' + String(m % 60).padStart(2, '0') + 'm';
}

export function fmtDate(iso, opts = { dateStyle: 'medium', timeStyle: 'short' }) {
  if (!iso) return '–';
  const d = new Date(iso);
  return isNaN(d) ? '–' : new Intl.DateTimeFormat(undefined, opts).format(d);
}

export function fmtAgo(iso, now = Date.now()) {
  if (!iso) return '–';
  const s = (now - new Date(iso).getTime()) / 1000;
  if (!isFinite(s)) return '–';
  if (s < 90) return 'just now';
  const units = [[60, 'minute'], [3600, 'hour'], [86400, 'day']];
  let best = ['second', 1];
  for (const [secs, name] of units) if (s >= secs) best = [name, secs];
  const n = Math.round(s / best[1]);
  return n + ' ' + best[0] + (n === 1 ? '' : 's') + ' ago';
}

// ---- grouping of the tests of the latest build

export function worst(counts) {
  if (counts.failed) return 'failed';
  if (counts.error) return 'error';
  if (executed(counts) === 0 && counts.skipped) return 'skipped';
  return 'passed';
}

/** Groups the tests of a suite by experiment (bdd) or spec (frontend). Setup and job level entries are returned apart. */
export function groupTests(tests, suite) {
  const groups = new Map();
  const jobs = [];
  const setup = [];
  for (const t of tests || []) {
    if (t.suite !== suite) continue;
    if (t.kind === 'job') { jobs.push(t); continue; }
    if (t.kind === 'setup') { setup.push(t); continue; }
    let g = groups.get(t.group);
    if (!g) { g = { id: t.group, workflows: new Set(), counts: { passed: 0, failed: 0, skipped: 0, error: 0 }, durationSec: 0, tests: [] }; groups.set(t.group, g); }
    g.workflows.add(t.workflow);
    g.counts[t.status] += 1;
    g.durationSec += t.durationSec || 0;
    g.tests.push(t);
  }
  const list = [...groups.values()].map((g) => ({ ...g, workflows: [...g.workflows].sort(), status: worst(g.counts) }));
  return { groups: list, jobs, setup };
}

export function sortGroups(list, key, dir = 1) {
  const rank = { failed: 0, error: 1, skipped: 2, passed: 3 };
  const by = {
    name: (a, b) => a.id.localeCompare(b.id),
    status: (a, b) => rank[a.status] - rank[b.status] || a.id.localeCompare(b.id),
    duration: (a, b) => b.durationSec - a.durationSec,
    failures: (a, b) => (b.counts.failed + b.counts.error) - (a.counts.failed + a.counts.error) || a.id.localeCompare(b.id),
  }[key] || ((a, b) => a.id.localeCompare(b.id));
  return [...list].sort((a, b) => by(a, b) * dir);
}

export function filterGroups(list, { q = '', status = 'all', workflow = 'all' }) {
  const needle = q.trim().toLowerCase();
  return list.filter((g) => {
    if (status !== 'all' && g.status !== status) return false;
    if (workflow !== 'all' && !g.workflows.includes(workflow)) return false;
    if (!needle) return true;
    return g.id.toLowerCase().includes(needle) || g.tests.some((t) => t.name.toLowerCase().includes(needle) || (t.message || '').toLowerCase().includes(needle));
  });
}

// ---- history

export function builds(history) { return (history && history.builds) || []; }

/** Pass rate of a suite per build. A build in which the suite executed nothing has no rate (null), it is not 0%. */
export function suiteSeries(history, suite) {
  return builds(history).map((b) => {
    const s = b.suites && b.suites[suite];
    return { id: b.id, status: s ? s.status : 'incomplete', rate: s ? passRate(s.counts) : null, counts: s ? s.counts : null };
  });
}

export function durationSeries(history) {
  return builds(history).map((b) => ({ id: b.id, value: b.durationSec, status: b.status }));
}

/** The last n results of a test, oldest first, null where the build has no result for it. */
export function testStrip(history, testId, n = 14) {
  return builds(history).slice(-n).map((b) => (b.results && b.results[testId]) || null);
}

export function failingInWindow(history, n = 14) {
  const seen = new Map();
  for (const b of builds(history).slice(-n)) {
    for (const [id, st] of Object.entries(b.results || {})) {
      if (st === 'f' || st === 'e') seen.set(id, (seen.get(id) || 0) + 1);
    }
  }
  return [...seen.entries()].map(([id, failures]) => ({ id, failures })).sort((a, b) => b.failures - a.failures || a.id.localeCompare(b.id));
}

/** Readable name of a test id: suite/group/name[@job]. */
export function describeId(id) {
  const parts = id.split('/');
  const suite = parts.shift();
  const rest = parts.join('/');
  if (rest.startsWith('job:') || parts.length === 1) return { suite, group: parts[0], name: rest };
  const group = parts[0] === 'UI' || parts[0] === 'REST APIs' ? parts.slice(0, 2).join('/') : parts[0];
  const name = parts.slice(group.split('/').length).join('/');
  return { suite, group, name };
}

export function workflowName(latest, id) {
  const w = ((latest && latest.config && latest.config.workflows) || []).find((x) => x.category === id);
  return w ? w.name : id;
}

/** Shortens the Ginkgo spec text "BDD of x experiment Check for x experiment Should ..." for lists. */
export function shortName(name) {
  return (name || '').replace(/^BDD of [^]*? experiment (?:Check for [^]*? experiment )?/, '').replace(/^BDD of /, '') || name;
}
