import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as D from '../dashboard/assets/js/data.js';

const fx = (name, file) => JSON.parse(readFileSync(new URL(`./fixtures/${name}/${file}.json`, import.meta.url)));

test('pass rate leaves skipped tests out and has no value without results', () => {
  assert.equal(D.passRate({ passed: 3, failed: 1, error: 0, skipped: 5 }), 75);
  assert.equal(D.passRate({ passed: 0, failed: 0, error: 0, skipped: 2 }), null);
  assert.equal(D.passRate({ passed: 1, failed: 0, error: 1, skipped: 0 }), 50);
  assert.equal(D.fmtRate(null), '–');
  assert.equal(D.fmtRate(96.27), '96.3%');
  assert.equal(D.fmtRate(100), '100%');
});

test('durations and dates', () => {
  assert.equal(D.fmtDuration(null), '–');
  assert.equal(D.fmtDuration(42), '42s');
  assert.equal(D.fmtDuration(125), '2m 05s');
  assert.equal(D.fmtDuration(3600 + 8 * 60), '1h 08m');
  const now = Date.parse('2026-10-26T12:00:00Z');
  assert.equal(D.fmtAgo('2026-10-26T11:59:30Z', now), 'just now');
  assert.equal(D.fmtAgo('2026-10-26T09:00:00Z', now), '3 hours ago');
  assert.equal(D.fmtAgo('2026-10-25T09:00:00Z', now), '1 day ago');
  assert.equal(D.fmtAgo(null, now), '–');
});

test('only https links are used', () => {
  assert.equal(D.safeUrl('https://github.com/a/b'), 'https://github.com/a/b');
  assert.equal(D.safeUrl('javascript:alert(1)'), null);
  assert.equal(D.safeUrl('http://example.com'), null);
  assert.equal(D.safeUrl('nonsense'), null);
});

test('grouping separates setup and job level results from the experiments', () => {
  const latest = fx('mixed', 'latest');
  const { groups, jobs, setup } = D.groupTests(latest.tests, 'bdd');
  assert.ok(groups.length > 20);
  assert.ok(setup.length > 0);
  assert.ok(jobs.every((j) => j.kind === 'job'));
  assert.ok(!groups.some((g) => g.id === 'app-deploy'));
  const bad = groups.find((g) => g.id === 'disk-fill');
  assert.equal(bad.status, 'failed');
  assert.equal(bad.counts.failed, 1);
  const frontend = D.groupTests(latest.tests, 'frontend').groups.map((g) => g.id);
  assert.ok(frontend.includes('UI/chaoshub') && frontend.includes('REST APIs/login'));
});

test('a group without executed tests is skipped, not passed', () => {
  assert.equal(D.worst({ passed: 0, failed: 0, error: 0, skipped: 2 }), 'skipped');
  assert.equal(D.worst({ passed: 2, failed: 0, error: 1, skipped: 0 }), 'error');
});

test('filtering and sorting', () => {
  const { groups } = D.groupTests(fx('mixed', 'latest').tests, 'bdd');
  assert.equal(D.filterGroups(groups, { status: 'failed' }).length, groups.filter((g) => g.status === 'failed').length);
  assert.ok(D.filterGroups(groups, { q: 'POD-NETWORK' }).every((g) => g.id.includes('pod-network')));
  assert.ok(D.filterGroups(groups, { q: 'verdict' }).length > 0);
  assert.equal(D.filterGroups(groups, { q: 'no such thing' }).length, 0);
  assert.equal(D.sortGroups(groups, 'status')[0].status, 'failed');
  const byDuration = D.sortGroups(groups, 'duration');
  assert.ok(byDuration[0].durationSec >= byDuration[1].durationSec);
});

test('history series keep a gap where a suite has no result', () => {
  const history = fx('mixed', 'history');
  const fe = D.suiteSeries(history, 'frontend');
  const missing = fe.find((s) => s.id === '2026-10-17');
  assert.equal(missing.rate, null);
  assert.equal(fe.length, history.builds.length);
  assert.ok(D.durationSeries(history).every((d) => d.value > 0));
});

test('test strips line up with the builds', () => {
  const history = fx('mixed', 'history');
  const id = D.failingInWindow(history, 14).find((f) => f.id.includes('disk-fill')).id;
  const strip = D.testStrip(history, id, 14);
  assert.equal(strip.length, 14);
  assert.equal(strip[strip.length - 1], 'f');
});

test('real data of a fork with failing infrastructure is read as errors', () => {
  const latest = fx('real-fork', 'latest');
  assert.equal(latest.build.status, 'failed');
  assert.equal(latest.build.suites.bdd.counts.passed, 0);
  assert.ok(latest.build.suites.bdd.counts.error > 0);
  assert.equal(D.passRate(latest.build.suites.frontend.counts), null);
});

test('ids are described for the lists', () => {
  assert.deepEqual(D.describeId('bdd/pod-delete/BDD of pod-delete experiment Should x'), { suite: 'bdd', group: 'pod-delete', name: 'BDD of pod-delete experiment Should x' });
  assert.deepEqual(D.describeId('frontend/UI/chaoshub/chaoshub Create new ChaosHub'), { suite: 'frontend', group: 'UI/chaoshub', name: 'chaoshub Create new ChaosHub' });
  assert.equal(D.shortName('BDD of disk-fill experiment Check for disk-fill experiment Should check the verdict'), 'Should check the verdict');
});

test('unsupported documents are rejected', () => {
  const problems = [];
  assert.equal(D.check({ schemaVersion: 2 }, 'x.json', problems), null);
  assert.equal(D.check(null, 'y.json', problems), null);
  assert.equal(problems.length, 2);
});

// ---- Nightly, RC and GA

const loadScenario = async (scn) => {
  const fetcher = async (url) => {
    const m = /^data\/(.*)$/.exec(url);
    try {
      const body = (await import('node:fs')).readFileSync(new URL(`./fixtures/${scn}/${m[1]}`, import.meta.url), 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(body) };
    } catch (e) { return { ok: false, status: 404, json: async () => { throw e; } }; }
  };
  return D.loadAll('', fetcher);
};

test('a build without published files is "empty", a damaged one is "error", never a guess', async () => {
  const [n, rc, ga] = await loadScenario('rc-regress');
  assert.equal(n.state, 'ready');
  assert.equal(rc.state, 'ready');
  assert.equal(ga.state, 'empty');
  assert.equal(ga.latest, null);
  const broken = await loadScenario('ga-broken');
  assert.equal(broken[2].state, 'ready'); // history is readable, latest is not
  assert.ok(broken[2].problems.some((p) => /not valid JSON/.test(p)));
  assert.equal(broken[2].latest, null);
  const none = await loadScenario('empty');
  assert.deepEqual(none.map((b) => b.state), ['ready', 'empty', 'empty']); // a first deployment publishes an empty nightly
  assert.equal(D.buildOf(none[0]), null);
});

test('the headline merges the suites and the version falls back to the commit', async () => {
  const [n, rc, ga] = await loadScenario('three-builds');
  assert.equal(D.versionOf(n), 'a1b2c3d');
  assert.equal(D.versionOf(rc), 'v3.10.0-rc.1');
  assert.equal(D.versionOf(ga), 'v3.9.0');
  const hd = D.headline(n);
  assert.equal(hd.status, 'failed');
  assert.equal(hd.counts.failed, 3);
  assert.equal(D.headline({ latest: null }), null);
});

test('readiness reports tests that pass in an earlier stage and fail in a later one, and never counts a missing stage', async () => {
  const r = D.readiness(await loadScenario('rc-regress'));
  assert.deepEqual(r.stages, ['nightly', 'rc']);
  assert.equal(r.regressions.length, 3);
  assert.ok(r.regressions.every((x) => x.from === 'nightly' && x.to === 'rc'));
  assert.ok(r.diverging.length >= 3);
  const ok = D.readiness(await loadScenario('three-builds'));
  assert.deepEqual(ok.stages, ['nightly', 'rc', 'ga']);
  assert.equal(ok.regressions.length, 0, 'improvements are not regressions');
  assert.deepEqual(D.readiness(await loadScenario('empty')).stages, []);
});

test('experiments are indexed across builds and carry a category', async () => {
  const all = await loadScenario('three-builds');
  const idx = D.experimentIndex(all);
  const disk = idx.find((e) => e.key === 'bdd/disk-fill');
  assert.equal(disk.category, 'IO');
  assert.deepEqual(Object.keys(disk.builds).sort(), ['ga', 'nightly', 'rc']);
  assert.equal(disk.builds.nightly.status, 'failed');
  assert.equal(disk.builds.rc.status, 'passed');
  assert.equal(D.categoryOf('frontend', 'UI/login'), 'frontend');
  assert.equal(D.categoryOf('bdd', 'pod-network-loss'), 'network');
  assert.equal(D.categoryOf('bdd', 'node-drain'), 'node');
  assert.equal(D.categoryOf('bdd', 'pod-delete'), 'pod');
});

test('fuzzy search ranks substrings first and skips non matches', () => {
  assert.ok(D.fuzzy('pod del', 'pod-delete') != null);
  assert.ok(D.fuzzy('pdl', 'pod-delete') != null);
  assert.equal(D.fuzzy('zzz', 'pod-delete'), null);
  assert.ok(D.fuzzy('delete', 'pod-delete') > D.fuzzy('pdlt', 'pod-delete'));
  assert.equal(D.fuzzy('', 'x'), 0);
});

test('flips count changes between passing and failing, skipped results are ignored', () => {
  assert.equal(D.flips(['p', 'p', 'f', 'p', 'f']), 3);
  assert.equal(D.flips(['p', 's', 'p', null, 'p']), 0);
  assert.equal(D.flips([]), 0);
});

test('what changed comes from the metrics of the build', async () => {
  const [n] = await loadScenario('three-builds');
  const w = D.whatChanged(n);
  assert.equal(w.newlyFailing.length, 2);
  assert.ok(w.slowest.length <= 5);
  assert.deepEqual(D.whatChanged({ latest: null }).newlyFailing, []);
});
