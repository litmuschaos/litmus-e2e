// Live view of the runs in progress. The data of the dashboard is static, so this panel asks the public GitHub Actions
// API from the browser. It refreshes about once a minute (responses are cached for a minute by GitHub, repeated
// requests do not use up the rate limit), pauses in a hidden tab and stops quietly when the API is not reachable.
import { h, icon } from '../dom.js';
import * as D from '../data.js';

const API = 'https://api.github.com';

async function api(path) {
  const res = await fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } });
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
    const err = new Error('rate limit');
    err.limited = true;
    err.retryAt = reset > Date.now() ? reset : Date.now() + 10 * 60000;
    throw err;
  }
  if (res.status === 404) { const err = new Error('not found'); err.missing = true; throw err; }
  if (!res.ok) throw new Error('GitHub answered ' + res.status);
  return res.json();
}

function elapsed(iso, now) {
  if (!iso) return '–';
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  return D.fmtDuration(s);
}

export function liveView(ctx) {
  const latest = ctx.builds.map((b) => b.latest).find((l) => l && l.repository);
  const repo = D.repoOf(latest);
  const files = D.workflowFiles(latest);
  if (!repo || !files.size) return null;

  const title = h('b', {}, 'Live');
  const status = h('span', { class: 'live-status' }, 'Checking the runs…');
  const stamp = h('span', { class: 'live-stamp muted' });
  const list = h('ul', { class: 'live-list plain' });
  const root = h('section', { class: 'glass live reveal', 'data-live': 'idle', 'aria-labelledby': 'live-h' },
    h('div', { class: 'row between' },
      h('h2', { id: 'live-h', class: 'live-h' }, h('i', { class: 'live-dot', 'aria-hidden': 'true' }), title, status),
      stamp),
    list);

  let timer = 0, stopped = false, runs = [], progress = new Map(), tick = 0;

  const draw = () => {
    const now = Date.now();
    const active = runs.filter((r) => r.active);
    root.dataset.live = active.length ? 'running' : 'idle';
    status.textContent = active.length ? `${active.length} ${active.length === 1 ? 'workflow is' : 'workflows are'} running` : runs.length ? 'Nothing is running, the latest finished runs' : 'Nothing is running right now';
    list.replaceChildren(...runs.map((r) => {
      const p = progress.get(r.id);
      const bar = h('span', { class: 'live-bar', role: 'progressbar', 'aria-label': r.name + ' progress', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': r.active && p ? p.percent : r.active ? null : 100 },
        h('i', { style: `--w:${r.active ? (p ? p.percent : 4) : 100}%`, class: r.active ? '' : (r.conclusion === 'success' ? 'ok' : 'bad') }));
      const what = r.active
        ? (p ? `${p.done} of ${p.total} jobs done${p.failed ? `, ${p.failed} failed` : ''}${p.running.length ? ' · ' + p.running.slice(0, 2).map((x) => x.job + (x.step ? ': ' + x.step : '')).join(' · ') : ''}` : r.status === 'queued' ? 'Waiting for a runner' : 'Starting')
        : `${r.conclusion === 'success' ? 'Passed' : r.conclusion === 'cancelled' ? 'Cancelled' : 'Failed'} ${D.fmtAgo(r.updatedAt, now)}`;
      const url = D.safeUrl(r.url);
      return h('li', { class: 'live-row ' + (r.active ? 'on' : r.conclusion === 'success' ? 'pass' : 'fail') },
        h('span', { class: 'live-name' }, r.name, h('span', { class: 'chip mono' }, r.branch || ''), r.required ? null : h('span', { class: 'chip' }, 'optional')),
        bar,
        h('span', { class: 'live-what' }, what),
        h('span', { class: 'mono live-time', 'data-start': r.active ? r.startedAt : null }, r.active ? elapsed(r.startedAt, now) : ''),
        url ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, 'Run', icon('external')) : null);
    }));
    stamp.textContent = 'Updated ' + new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' }).format(new Date()) + (active.length ? ', refreshes every minute' : '');
  };

  const pause = (why) => { root.dataset.live = 'paused'; status.textContent = why; stamp.textContent = ''; list.replaceChildren(); };

  const poll = async () => {
    if (stopped) return;
    let next = 120000;
    try {
      if (document.hidden) { next = 30000; } else {
        const data = await api(`/repos/${repo}/actions/runs?per_page=50`);
        runs = D.liveRuns(data.workflow_runs, files);
        const active = runs.filter((r) => r.active && r.status === 'in_progress');
        await Promise.all(active.map(async (r) => {
          try { progress.set(r.id, D.jobProgress((await api(`/repos/${repo}/actions/runs/${r.id}/jobs?per_page=100`)).jobs)); } catch (e) { if (e.limited) throw e; }
        }));
        draw();
        next = runs.some((r) => r.active) ? 30000 : 120000;
      }
    } catch (e) {
      if (e.missing) { root.remove(); stopped = true; return; }
      if (e.limited) { pause('Live view paused, the GitHub API limit of this network is used up'); next = Math.max(60000, e.retryAt - Date.now()); }
      else if (!runs.length) { pause('Live view is not available right now'); next = 180000; }
    }
    timer = setTimeout(poll, next);
  };

  // the elapsed time of the running workflows counts every second, without asking the API
  tick = setInterval(() => {
    if (document.hidden) return;
    const now = Date.now();
    root.querySelectorAll('.live-time[data-start]').forEach((el) => { el.textContent = elapsed(el.dataset.start, now); });
  }, 1000);
  ctx.onLeave(() => { stopped = true; clearTimeout(timer); clearInterval(tick); });
  poll();
  return root;
}
