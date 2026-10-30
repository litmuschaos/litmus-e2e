import { icon, announce, hideTip } from './dom.js?v=4bda9f31e2';
import * as D from './data.js?v=4bda9f31e2';
import { reveal, swap, installSpotlight, magnetic } from './motion.js?v=4bda9f31e2';
import { skeleton } from './views/common.js?v=4bda9f31e2';
import { overview } from './views/overview.js?v=4bda9f31e2';

// the overview is loaded with the page, the other views and the overlays when they are first needed
const ROUTES = { overview: async () => overview, readiness: async () => (await import('./views/readiness.js?v=4bda9f31e2')).readinessView, experiments: async () => (await import('./views/experiments.js?v=4bda9f31e2')).experiments, frontend: async () => (await import('./views/experiments.js?v=4bda9f31e2')).frontend, history: async () => (await import('./views/history.js?v=4bda9f31e2')).historyView, about: async () => (await import('./views/about.js?v=4bda9f31e2')).about };
const drawer = () => import('./views/drawer.js?v=4bda9f31e2');
const TITLES = { overview: 'Overview', readiness: 'Release readiness', experiments: 'Experiments', frontend: 'Frontend E2E', history: 'History', about: 'Data' };
const main = document.getElementById('main');
const switcher = document.getElementById('switcher');
let builds = null;
let leave = [];
let rendered = null; // { route, b, sig }

// ---- the URL: #/route?b=rc&q=...&x=drawer
function parse() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const params = new URLSearchParams(query || '');
  const route = ROUTES[path || 'overview'] ? path || 'overview' : 'overview';
  const b = D.BUILD_KEYS.includes(params.get('b')) ? params.get('b') : 'nightly';
  return { route, params, b };
}
function hashOf(route, params) {
  const q = params.toString();
  return '#/' + (route === 'overview' ? '' : route) + (q ? '?' + q : '');
}
function sigOf(route, params) {
  const p = new URLSearchParams(params);
  p.delete('x');
  return route + '?' + p.toString();
}
function setParams(patch) {
  const { route, params } = parse();
  for (const [k, v] of Object.entries(patch)) { if (v == null || v === '') params.delete(k); else params.set(k, v); }
  history.replaceState(null, '', hashOf(route, params));
  rendered = { ...rendered, sig: sigOf(route, params) };
  syncLinks();
}
function href(route, extra = {}) {
  const cur = parse();
  const p = new URLSearchParams();
  const bsel = cur.params.get('b');
  if (bsel) p.set('b', bsel);
  if (route === cur.route) for (const [k, v] of cur.params) if (k !== 'x') p.set(k, v);
  for (const [k, v] of Object.entries(extra)) { if (v == null) p.delete(k); else p.set(k, v); }
  if (p.get('b') === 'nightly') p.delete('b');
  return hashOf(route, p);
}
function go(route, extra) { location.hash = href(route, extra); }
function selectBuild(key) {
  const { route, params } = parse();
  params.delete('x');
  if (key === 'nightly') params.delete('b'); else params.set('b', key);
  location.hash = hashOf(route, params);
}

function syncLinks() {
  const { route, params, b } = parse();
  document.querySelectorAll('#nav a').forEach((a) => {
    a.href = href(a.dataset.route);
    if (a.dataset.route === route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const idx = Math.max(0, D.BUILD_KEYS.indexOf(b));
  switcher.style.setProperty('--idx', idx);
  switcher.querySelectorAll('button').forEach((btn) => {
    const on = btn.dataset.b === b;
    btn.setAttribute('aria-checked', String(on));
    btn.tabIndex = on ? 0 : -1;
    const bd = builds && builds.find((x) => x.key === btn.dataset.b);
    btn.classList.toggle('gap', !!bd && bd.state !== 'ready');
  });
  document.documentElement.dataset.build = b;
  return params;
}

function makeCtx(route, params, b) {
  const current = builds.find((x) => x.key === b);
  const ctx = {
    builds, current, route, params, href, go, selectBuild, setParams,
    onLeave: (fn) => leave.push(fn),
    retry: async () => { builds = null; await render(true); },
    openExperiment: (key) => { const p = parse().params; p.set('x', key); history.pushState(null, '', hashOf(route, p)); drawer().then((m) => m.openDrawer(key, ctx)); },
    closeX: () => { drawer().then((m) => m.closeDrawer()); const p = parse().params; p.delete('x'); history.replaceState(null, '', hashOf(parse().route, p)); },
  };
  return ctx;
}

async function load() {
  if (builds) return;
  main.replaceChildren(skeleton());
  builds = await D.loadAll('');
}

async function render(force) {
  const { route, params, b } = parse();
  hideTip();
  await load();
  const sig = sigOf(route, params);
  const x = params.get('x');
  // only the drawer changed: no redraw of the page behind it
  if (!force && rendered && rendered.sig === sig && rendered.b === b) {
    if (x) (await drawer()).openDrawer(x, makeCtx(route, params, b)); else (await drawer()).closeDrawer();
    return;
  }
  const first = !rendered;
  const sameRoute = rendered && rendered.route === route;
  leave.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
  leave = [];
  if (rendered) (await drawer()).closeDrawer(false);
  syncLinks();
  const ctx = makeCtx(route, params, b);
  const info = D.buildInfo(b);
  document.title = (route === 'overview' ? '' : TITLES[route] + ' · ') + info.label + ' · LitmusChaos E2E Dashboard';
  let view;
  try {
    view = (await ROUTES[route]())(ctx);
  } catch (err) {
    console.error(err);
    view = document.createElement('p');
    view.className = 'note';
    view.textContent = 'This page could not be drawn: ' + err.message;
  }
  const apply = () => {
    main.replaceChildren(view);
    reveal(main);
  };
  if (first) apply(); else await swap(apply);
  rendered = { route, b, sig };
  if (!first) {
    if (!sameRoute) { main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  }
  announce(TITLES[route] + ', ' + info.long);
  if (x) (await drawer()).openDrawer(x, ctx);
}

// ---- build switcher: a radio group with a sliding pill
D.BUILDS.forEach((bd) => {
  const btn = switcher.querySelector(`[data-b="${bd.key}"]`);
  btn.addEventListener('click', () => selectBuild(bd.key));
});
switcher.addEventListener('keydown', (e) => {
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (!keys[e.key]) return;
  e.preventDefault();
  const i = D.BUILD_KEYS.indexOf(parse().b);
  const next = D.BUILD_KEYS[(i + keys[e.key] + 3) % 3];
  selectBuild(next);
  requestAnimationFrame(() => switcher.querySelector(`[data-b="${next}"]`).focus());
});

// ---- theme: system, light or dark
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

// ---- palette and shortcuts
const palBtn = document.getElementById('palette-btn');
const paletteCtx = () => { const { route, params, b } = parse(); return makeCtx(route, params, b); };
const palette = (c) => import('./palette.js?v=4bda9f31e2').then((m) => m.openPalette(c));
palBtn.addEventListener('click', () => { if (builds) palette(paletteCtx()); });
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (builds) palette(paletteCtx()); return; }
  const t = e.target;
  const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) {
    const s = document.querySelector('.search input');
    if (s) { e.preventDefault(); s.focus(); }
  }
});
window.addEventListener('open-experiment', (e) => { if (builds) paletteCtx().openExperiment(e.detail); });
document.querySelectorAll('.magnetic').forEach((el) => magnetic(el));
installSpotlight();

let chain = Promise.resolve();
const schedule = () => { chain = chain.then(() => render(false)).catch((e) => console.error(e)); };
window.addEventListener('hashchange', schedule);
window.addEventListener('popstate', schedule);
document.documentElement.dataset.ready = '1';
schedule();
