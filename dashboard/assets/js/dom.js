// Small DOM helpers. Text always goes through textContent, so test names and error messages taken from the
// results can never be interpreted as markup.

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs, ...children) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) el.setAttribute(k, v);
  for (const c of children.flat(Infinity)) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

const PATHS = {
  passed: 'M20 6 9 17l-5-5',
  failed: 'M18 6 6 18M6 6l12 12',
  error: 'M12 8v5m0 3.5v.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  skipped: 'M5 12h14',
  incomplete: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  in_progress: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  not_run: 'M5 12h14',
  cancelled: 'M6 6l12 12M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  chevron: 'm9 6 6 6-6 6',
  info: 'M12 16v-4m0-4h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  external: 'M14 4h6v6m0-6L10 14M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5',
  search: 'm21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-13v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z',
  auto: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-18v18',
  x: 'M18 6 6 18M6 6l12 12',
  command: 'M15 9V6a3 3 0 1 1 3 3h-3Zm0 0v6m0-6H9m6 6v3a3 3 0 1 0 3-3h-3Zm0 0H9m0 0v3a3 3 0 1 1-3-3h3Zm0 0V9m0 0V6a3 3 0 1 0-3 3h3Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5',
  flask: 'M9 3h6m-5 0v6L4.5 19A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-1v5l3 2',
  database: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Zm8-3v14c0 1.7-3.6 3-8 3s-8-1.3-8-3V5m16 7c0 1.7-3.6 3-8 3s-8-1.3-8-3',
  compare: 'M7 4v16M17 4v16M3 8h8M13 16h8',
  home: 'm3 11 9-8 9 8M5 10v10h14V10',
  tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Zm5-5h.01',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2m20 0-3.5-7.3A2 2 0 0 0 16.7 3.5H7.3a2 2 0 0 0-1.8 1.2L2 12m20 0v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6',
};

export function icon(name, label) {
  const el = svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': label ? null : 'true', role: label ? 'img' : null, 'aria-label': label || null, focusable: 'false' }, svg('path', { d: PATHS[name] || PATHS.info }));
  return el;
}

const LABELS = { passed: 'Passed', failed: 'Failed', error: 'Error', skipped: 'Skipped', incomplete: 'Incomplete', in_progress: 'Running', not_run: 'Did not run', cancelled: 'Cancelled' };
export function statusLabel(s) { return LABELS[s] || s; }

export function badge(status, text) {
  return h('span', { class: 'badge ' + status }, icon(status), text || statusLabel(status));
}

export function link(url, text, extra) {
  return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', ...extra }, text, icon('external'));
}

export function announce(text) {
  const el = document.getElementById('live');
  if (el) el.textContent = text;
}

// ---- tooltip shared by the charts

let tipEl;
export function showTip(target, lines) {
  tipEl = tipEl || document.getElementById('tooltip');
  tipEl.replaceChildren(...lines.filter(Boolean).map((l, i) => (l instanceof Node ? l : i === 0 ? h('b', {}, l) : h('span', {}, l, h('br')))));
  tipEl.hidden = false;
  const r = target.getBoundingClientRect();
  const t = tipEl.getBoundingClientRect();
  let x = r.left + r.width / 2 - t.width / 2;
  x = Math.max(8, Math.min(x, window.innerWidth - t.width - 8));
  let y = r.top - t.height - 8;
  if (y < 8) y = r.bottom + 8;
  tipEl.style.left = x + 'px';
  tipEl.style.top = y + 'px';
}
export function hideTip() { if (tipEl) tipEl.hidden = true; }

export function withTip(el, linesFn) {
  const show = () => showTip(el, linesFn());
  el.addEventListener('mouseenter', show);
  el.addEventListener('focus', show);
  el.addEventListener('mouseleave', hideTip);
  el.addEventListener('blur', hideTip);
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
  return el;
}

export function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

/** Counts up to the value, unless the viewer asked for reduced motion. */
export function countUp(el, value, format = (v) => String(Math.round(v))) {
  if (reducedMotion() || !isFinite(value)) { el.textContent = format(value); return; }
  const start = performance.now(), dur = 700;
  const tick = (now) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = format(value * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick); else el.textContent = format(value);
  };
  el.textContent = format(0);
  requestAnimationFrame(tick);
}

export function tip(text, label) {
  return h('span', { class: 'tip', tabindex: '0', 'aria-label': label ? label + ': ' + text : text, title: text }, label);
}
