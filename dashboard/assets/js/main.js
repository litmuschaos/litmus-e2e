import { h, icon, announce, hideTip } from './dom.js';
import { load } from './data.js';
import { skeleton, emptyState } from './views/common.js';
import { overview } from './views/overview.js';
import { experiments } from './views/experiments.js';
import { frontend } from './views/frontend.js';
import { historyView } from './views/history.js';
import { about } from './views/about.js';

const ROUTES = { overview, experiments, frontend, history: historyView, about };
const TITLES = { overview: 'Overview', experiments: 'Experiments', frontend: 'Frontend E2E', history: 'History', about: 'Data' };
const main = document.getElementById('main');
let data = null;
let current = null;

function parse() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const name = path || 'overview';
  return { name: ROUTES[name] ? name : 'overview', params: new URLSearchParams(query || '') };
}

function nav(name) { location.hash = '#/' + (name === 'overview' ? '' : name); }

async function render(first) {
  const { name, params } = parse();
  hideTip();
  document.querySelectorAll('#nav a').forEach((a) => { if (a.dataset.route === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.title = (name === 'overview' ? '' : TITLES[name] + ' · ') + 'Litmus E2E Nightly';
  if (!data) {
    main.replaceChildren(skeleton());
    data = await load('');
  }
  let view;
  try {
    if (!data.latest && !data.history) {
      view = h('div', { class: 'stack' }, h('h1', {}, 'Nightly results'),
        emptyState('The data could not be loaded', 'data/latest.json and data/history.json are missing or unreadable. On a first deployment the Nightly-Report workflow has to run once. ' + data.problems.join(' ')));
    } else {
      view = ROUTES[name]({ latest: data.latest || { build: null, config: { suites: [], workflows: [] } }, history: data.history, problems: data.problems }, nav, params);
    }
  } catch (err) {
    console.error(err);
    view = emptyState('This page could not be drawn', 'The data has an unexpected shape: ' + err.message);
  }
  main.replaceChildren(view);
  if (!first || current) { main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  announce(TITLES[name] + ' page');
  current = name;
}

// theme: system, light or dark
const themeBtn = document.getElementById('theme');
const MODES = ['auto', 'light', 'dark'];
function setTheme(mode, store = true) {
  if (mode === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = mode;
  const label = { auto: 'system', light: 'light', dark: 'dark' }[mode];
  themeBtn.setAttribute('aria-label', 'Theme: ' + label + '. Activate to change.');
  themeBtn.title = 'Theme: ' + label;
  themeBtn.replaceChildren(icon(mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'auto'));
  themeBtn.dataset.mode = mode;
  if (store) { try { mode === 'auto' ? localStorage.removeItem('e2e-theme') : localStorage.setItem('e2e-theme', mode); } catch (e) { /* storage may be blocked */ } }
}
let stored = 'auto';
try { stored = localStorage.getItem('e2e-theme') || 'auto'; } catch (e) { /* storage may be blocked */ }
setTheme(MODES.includes(stored) ? stored : 'auto', false);
themeBtn.addEventListener('click', () => setTheme(MODES[(MODES.indexOf(themeBtn.dataset.mode) + 1) % 3]));

window.addEventListener('hashchange', () => render(false));
render(true);
