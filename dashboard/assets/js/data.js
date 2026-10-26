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

// ---- builds: Nightly, Release Candidate and General Availability share one data contract.
// Nightly lives in data/, the release builds in data/rc/ and data/ga/. A missing file is "no run yet", not an error.

export const BUILDS = [
  { key: 'nightly', label: 'Nightly', long: 'Daily Nightly', dir: '', blurb: 'Built from the default branch every day.' },
  { key: 'rc', label: 'RC', long: 'Release Candidate', dir: 'rc/', blurb: 'Built for the release candidate of the next version.' },
  { key: 'ga', label: 'GA', long: 'General Availability', dir: 'ga/', blurb: 'Built for the version that is generally available.' },
];
export const BUILD_KEYS = BUILDS.map((b) => b.key);
export function buildInfo(key) { return BUILDS.find((b) => b.key === key) || BUILDS[0]; }

async function getJson(base, dir, name, fetcher) {
  let res;
  const pre = typeof window !== 'undefined' && window.__pre && window.__pre[dir + name];
  if (pre) delete window.__pre[dir + name];
  try { res = (pre && (await pre)) || (await fetcher(base + 'data/' + dir + name, { cache: 'no-cache' })); } catch (e) { return { error: 'the network request for ' + dir + name + ' failed' }; }
  if (res.status === 404) return { missing: true };
  if (!res.ok) return { error: dir + name + ' answered ' + res.status };
  try { return { value: await res.json() }; } catch (e) { return { error: dir + name + ' is not valid JSON' }; }
}

/** Loads one build. state is 'ready' (latest and/or history usable), 'empty' (nothing published yet) or 'error'. */
export async function loadBuild(base, key, fetcher = fetch) {
  const dir = buildInfo(key).dir;
  const out = { key, state: 'empty', latest: null, history: null, problems: [] };
  const [l, h] = await Promise.all([getJson(base, dir, 'latest.json', fetcher), getJson(base, dir, 'history.json', fetcher)]);
  for (const [name, r, field] of [['latest.json', l, 'latest'], ['history.json', h, 'history']]) {
    if (r.error) out.problems.push(r.error);
    else if (r.value) out[field] = check(r.value, dir + name, out.problems);
  }
  if (out.latest || out.history) out.state = 'ready';
  else if (out.problems.length) out.state = 'error';
  return out;
}

export async function loadAll(base = '', fetcher = fetch) { return Promise.all(BUILD_KEYS.map((k) => loadBuild(base, k, fetcher))); }

export function buildOf(b) { return (b && b.latest && b.latest.build) || null; }

/** Version of a build: an explicit version or tag of the run, else the short commit, else null. */
export function versionOf(b) {
  const x = buildOf(b);
  if (!x) return null;
  return x.version || x.tag || (x.sha ? x.sha.slice(0, 7) : null);
}

/** Counts of the required suites of a build, merged for the headline. The suites keep their own numbers elsewhere. */
export function headline(b) {
  const x = buildOf(b);
  if (!x) return null;
  const counts = addCounts(Object.values(x.suites || {}).map((s) => s.counts));
  return { status: x.status, counts, rate: passRate(counts), total: total(counts), executed: executed(counts) };
}

/** Pass rate per build of the history, over the suites together. */
export function rateSeries(history) {
  return builds(history).map((b) => {
    const c = addCounts(Object.values(b.suites || {}).map((s) => s.counts));
    return { id: b.id, status: b.status, rate: passRate(c), startedAt: b.startedAt };
  });
}

const CATEGORY_RULES = [
  ['network', /network|dns|http|latency|loss|corruption|duplication|partition/i],
  ['IO', /io-stress|disk|fill|ebs|volume|storage/i],
  ['node', /^node|node-|kubelet|taint|drain|restart|vm-|vmware|ec2|azure|gcp|instance/i],
  ['pod', /^pod|container|cpu|memory|autoscaler|multiple|affected|stress/i],
];

/** pod, node, network, IO, frontend, or component/other for the platform and engine checks. */
export function categoryOf(suite, group) {
  if (suite === 'frontend') return 'frontend';
  for (const [name, re] of CATEGORY_RULES) if (re.test(group)) return name;
  return 'other';
}
export const CATEGORIES = ['pod', 'node', 'network', 'IO', 'frontend', 'other'];

/** Subsequence match with a score, higher is better, null when the needle does not match. */
export function fuzzy(needle, hay) {
  needle = needle.toLowerCase().trim();
  hay = hay.toLowerCase();
  if (!needle) return 0;
  const direct = hay.indexOf(needle);
  if (direct >= 0) return 1000 - direct - hay.length * 0.01;
  let score = 0, last = -1, run = 0, i = 0;
  for (const ch of needle) {
    if (ch === ' ') continue;
    const at = hay.indexOf(ch, last + 1);
    if (at < 0) return null;
    run = at === last + 1 ? run + 1 : 0;
    score += 10 + run * 5 - Math.min(at - last, 10);
    last = at;
    i += 1;
  }
  return i ? score : 0;
}

/** Experiment (suite/group) of a test id such as bdd/pod-delete/name@job. */
export function groupOfId(id) {
  const d = describeId(id);
  return d.suite + '/' + d.group;
}

/** Worst result letter of the tests of a group in one history build: f, e, s, p, or null. */
export function groupResult(results, prefix) {
  let seen = null;
  for (const [id, st] of Object.entries(results || {})) {
    if (!id.startsWith(prefix + '/')) continue;
    if (st === 'f') return 'f';
    if (st === 'e') seen = 'e';
    else if (st === 's' && seen !== 'e') seen = 's';
    else if (st === 'p' && !seen) seen = 'p';
  }
  return seen;
}

/** Experiments across all builds, one entry per suite/group, with the status of each build. */
export function experimentIndex(all) {
  const map = new Map();
  for (const b of all) {
    if (!b.latest) continue;
    for (const suite of ['bdd', 'frontend']) {
      const { groups } = groupTests(b.latest.tests, suite);
      for (const g of groups) {
        const key = suite + '/' + g.id;
        let e = map.get(key);
        if (!e) { e = { key, suite, id: g.id, category: categoryOf(suite, g.id), builds: {} }; map.set(key, e); }
        e.builds[b.key] = g;
      }
    }
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Last n results of a group, oldest first, null where the build has no result. */
export function groupStrip(history, key, n = 30) {
  return builds(history).slice(-n).map((b) => groupResult(b.results, key));
}

/** Number of changes between passing and failing in a strip, used to mark flaky rows. */
export function flips(strip) {
  let prev = null, n = 0;
  for (const s of strip) {
    if (s !== 'p' && s !== 'f' && s !== 'e') continue;
    const bad = s !== 'p';
    if (prev !== null && prev !== bad) n += 1;
    prev = bad;
  }
  return n;
}

const STAGE_ORDER = ['nightly', 'rc', 'ga'];

/**
 * Release readiness: how the tests of the latest build of each stage compare to the stage before it.
 * A regression is a test that passed in an earlier stage and fails or errors in a later one.
 * Only stages that ran are compared, a missing stage is never counted as failing.
 */
export function readiness(all) {
  const ran = STAGE_ORDER.map((k) => all.find((b) => b.key === k)).filter((b) => b && b.latest && b.latest.build);
  const statusOf = new Map();
  for (const b of ran) {
    const m = new Map();
    for (const t of b.latest.tests || []) if (t.kind === 'test' || !t.kind) m.set(t.id, t);
    statusOf.set(b.key, m);
  }
  const regressions = [];
  const onlyIn = [];
  for (let i = 1; i < ran.length; i++) {
    const from = ran[i - 1].key, to = ran[i].key;
    const a = statusOf.get(from), z = statusOf.get(to);
    for (const [id, t] of z) {
      const before = a.get(id);
      if (!before) { onlyIn.push({ id, stage: to, missingIn: from, status: t.status }); continue; }
      if (before.status === 'passed' && (t.status === 'failed' || t.status === 'error')) regressions.push({ id, from, to, name: t.name, group: t.group, suite: t.suite, message: t.message || '' });
    }
  }
  const rows = new Map();
  for (const b of ran) {
    for (const [id, t] of statusOf.get(b.key)) {
      const gk = t.suite + '/' + t.group;
      let r = rows.get(gk);
      if (!r) { r = { key: gk, suite: t.suite, group: t.group, status: {} }; rows.set(gk, r); }
      const cur = r.status[b.key] || { passed: 0, failed: 0, skipped: 0, error: 0 };
      cur[t.status] += 1;
      r.status[b.key] = cur;
    }
  }
  const diverging = [...rows.values()].map((r) => {
    const st = {};
    for (const [k, c] of Object.entries(r.status)) st[k] = worst(c);
    return { ...r, st, differs: new Set(Object.values(st)).size > 1 };
  }).filter((r) => r.differs).sort((a, b) => a.key.localeCompare(b.key));
  return { stages: ran.map((b) => b.key), regressions, onlyIn, diverging };
}

/** The "what changed since the last run" lists of a build, from metrics. Items are test ids. */
export function whatChanged(b) {
  const m = (b && b.latest && b.latest.metrics) || {};
  const idOf = (x) => (typeof x === 'string' ? x : x.id);
  return {
    newlyFailing: (m.newlyFailing || []).map(idOf),
    recovered: (m.recovered || []).map(idOf),
    slowest: (m.longestTests || []).slice(0, 5),
    flaky: m.flakyTests || [],
    durationChange: m.durationChange || null,
    buildsConsidered: m.buildsConsidered || 0,
  };
}

// ---- live view: the runs of the workflows that are running now, read from the GitHub Actions API by the browser

/** owner/name of the repository the data was generated for, null when it is not a plausible one. */
export function repoOf(latest) {
  const r = latest && latest.repository;
  return typeof r === 'string' && /^[\w.-]+\/[\w.-]+$/.test(r) ? r : null;
}

/** Workflow files (and the files they call) of the configured workflows, name by file. */
export function workflowFiles(latest) {
  const map = new Map();
  for (const w of (latest && latest.config && latest.config.workflows) || []) {
    for (const f of [w.file, ...(w.alsoFiles || [])]) if (f) map.set(f, w);
  }
  return map;
}

/**
 * The runs worth showing: the ones in progress or queued, and the ones that finished in the last `recentMin` minutes.
 * Only the workflows of the configuration are considered, newest first.
 */
export function liveRuns(runs, files, now = Date.now(), recentMin = 20) {
  const out = [];
  for (const r of runs || []) {
    const file = String(r.path || '').split('/').pop();
    const wf = files.get(file);
    if (!wf) continue;
    const active = r.status === 'in_progress' || r.status === 'queued' || r.status === 'waiting' || r.status === 'pending';
    const ended = r.updated_at ? new Date(r.updated_at).getTime() : 0;
    if (!active && !(r.status === 'completed' && now - ended < recentMin * 60000)) continue;
    out.push({ id: r.id, name: wf.name, category: wf.category, required: !!wf.required, status: r.status, conclusion: r.conclusion || null, branch: r.head_branch, sha: (r.head_sha || '').slice(0, 7), url: r.html_url, startedAt: r.run_started_at || r.created_at, updatedAt: r.updated_at, active });
  }
  return out.sort((a, b) => Number(b.active) - Number(a.active) || String(b.startedAt).localeCompare(String(a.startedAt)));
}

/** How far a run is, from its jobs: finished jobs and the steps of the running ones. null without jobs. */
export function jobProgress(jobs) {
  if (!jobs || !jobs.length) return null;
  let done = 0, failed = 0, frac = 0;
  const running = [];
  for (const j of jobs) {
    if (j.status === 'completed') { done += 1; if (j.conclusion === 'failure') failed += 1; continue; }
    if (j.status === 'in_progress') {
      const steps = j.steps || [];
      const fin = steps.filter((s) => s.status === 'completed').length;
      const cur = steps.find((s) => s.status === 'in_progress');
      if (steps.length) frac += fin / steps.length;
      running.push({ job: j.name, step: cur ? cur.name : null });
    }
  }
  const total = jobs.length;
  return { total, done, failed, running, percent: Math.min(100, Math.round(((done + frac) / total) * 100)) };
}
