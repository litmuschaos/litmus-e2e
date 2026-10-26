// Inline SVG charts. Draw-in animations use stroke-dashoffset on pathLength-normalised paths (see .draw in the
// stylesheet), colours come from custom properties so every chart follows the build accent and the theme.
import { h, svg, withTip } from './dom.js';
import { fmtRate } from './data.js';

const STATUS_CLASS = { passed: 'ok', failed: 'bad', error: 'bad', skipped: 'warn', incomplete: 'warn', in_progress: 'warn', cancelled: 'warn', not_run: 'warn' };
export function tone(status) { return STATUS_CLASS[status] || 'warn'; }

/** Health ring. The arc is drawn from 0 to the pass rate; a null rate is drawn as a dashed empty ring. */
export function ring({ rate, status, size = 160, stroke = 10, build }) {
  const r = (size - stroke) / 2, c = size / 2;
  const has = rate != null;
  const arc = svg('circle', { class: 'ring-arc', cx: c, cy: c, r, 'stroke-width': stroke, pathLength: 100, 'stroke-dasharray': '100', 'stroke-dashoffset': has ? '100' : '100', 'stroke-linecap': 'round', transform: `rotate(-90 ${c} ${c})` });
  const el = svg('svg', { class: 'ring ' + (has ? tone(status) : 'none'), viewBox: `0 0 ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true', focusable: 'false', 'data-build': build || null },
    svg('circle', { class: 'ring-track', cx: c, cy: c, r, 'stroke-width': stroke, 'stroke-dasharray': has ? null : '2 7', 'stroke-linecap': 'round' }),
    arc);
  if (has) {
    const to = 100 - Math.max(0.5, Math.min(100, rate));
    requestAnimationFrame(() => requestAnimationFrame(() => arc.setAttribute('stroke-dashoffset', String(to))));
  }
  return el;
}

function pathOf(points) {
  let d = '', pen = false;
  for (const p of points) {
    if (!p) { pen = false; continue; }
    d += (pen ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    pen = true;
  }
  return d;
}

/** Tiny trend line of pass rates (0-100). null values leave a gap, one value is drawn as a dot. */
export function sparkline(values, { w = 120, h: ht = 36, label = 'Pass rate trend' } = {}) {
  const real = values.filter((v) => v != null);
  const root = svg('svg', { class: 'spark', viewBox: `0 0 ${w} ${ht}`, width: w, height: ht, role: 'img', 'aria-label': real.length ? `${label}: ${real.length} builds, latest ${fmtRate(real[real.length - 1])}` : label + ': no data' });
  if (!real.length) { root.append(svg('line', { class: 'spark-none', x1: 2, y1: ht / 2, x2: w - 2, y2: ht / 2 })); return root; }
  const lo = real.length === 1 ? 0 : Math.max(0, Math.min(...real) - 5);
  const hi = 100;
  const n = values.length;
  const pts = values.map((v, i) => (v == null ? null : [n === 1 ? w / 2 : 3 + (i * (w - 6)) / (n - 1), 3 + (ht - 6) * (1 - (v - lo) / (hi - lo || 1))]));
  if (real.length > 1) {
    const d = pathOf(pts);
    const last = pts.filter(Boolean);
    root.append(
      svg('path', { class: 'spark-area', d: d + `L${last[last.length - 1][0].toFixed(1)} ${ht}L${last[0][0].toFixed(1)} ${ht}Z` }),
      svg('path', { class: 'spark-line draw', d, pathLength: 1 }));
  }
  const lp = pts.filter(Boolean).pop();
  root.append(svg('circle', { class: 'spark-dot', cx: lp[0], cy: lp[1], r: 3 }));
  return root;
}

/** Visually hidden table that carries the numbers of a chart. */
export function srTable(caption, head, rows) {
  return h('table', { class: 'sr-only' }, h('caption', {}, caption),
    h('thead', {}, h('tr', {}, head.map((x) => h('th', { scope: 'col' }, x)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => h(i ? 'td' : 'th', i ? {} : { scope: 'row' }, c))))));
}

/**
 * Pass rate of the builds over time, one line per series ({key, label, points:[{id, rate}]}). Series are aligned on
 * the right, the newest build is the last point.
 */
export function trendChart(series, { w = 720, h: ht = 220 } = {}) {
  const pad = { l: 36, r: 12, t: 12, b: 24 };
  const iw = w - pad.l - pad.r, ih = ht - pad.t - pad.b;
  const longest = Math.max(1, ...series.map((s) => s.points.length));
  const all = series.flatMap((s) => s.points.map((p) => p.rate)).filter((v) => v != null);
  const lo = all.length ? Math.max(0, Math.floor((Math.min(...all) - 5) / 10) * 10) : 0;
  const x = (i, n) => pad.l + (longest === 1 ? iw / 2 : ((longest - n + i) * iw) / (longest - 1));
  const y = (v) => pad.t + ih * (1 - (v - lo) / (100 - lo || 1));
  const root = svg('svg', { class: 'trend', viewBox: `0 0 ${w} ${ht}`, role: 'img', 'aria-label': 'Pass rate per build over time' });
  for (let v = lo; v <= 100; v += (100 - lo) / 4 || 25) {
    root.append(svg('line', { class: 'grid-line', x1: pad.l, x2: w - pad.r, y1: y(v), y2: y(v) }), svg('text', { class: 'axis', x: pad.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, Math.round(v) + '%'));
  }
  const dots = [];
  for (const s of series) {
    const n = s.points.length;
    const pts = s.points.map((p, i) => (p.rate == null ? null : [x(i, n), y(p.rate)]));
    if (pts.filter(Boolean).length > 1) root.append(svg('path', { class: 'trend-line draw', d: pathOf(pts), pathLength: 1, 'data-build': s.key }));
    s.points.forEach((p, i) => {
      if (!pts[i]) return;
      const dot = svg('circle', { class: 'trend-dot', cx: pts[i][0], cy: pts[i][1], r: 4.5, tabindex: 0, role: 'img', 'data-build': s.key, 'aria-label': `${s.label}, build ${p.id}, pass rate ${fmtRate(p.rate)}` });
      withTip(dot, () => [`${s.label} · ${p.id}`, 'Pass rate ' + fmtRate(p.rate), p.version ? 'Version ' + p.version : '']);
      dots.push(dot);
    });
  }
  root.append(...dots);
  return root;
}

/** Stacked bar of the counts of a suite. */
export function stackedBar(counts, label) {
  const total = (counts.passed || 0) + (counts.failed || 0) + (counts.error || 0) + (counts.skipped || 0);
  const seg = (cls, n) => (n ? h('span', { class: 'seg ' + cls, style: `flex:${n}` }) : null);
  return h('div', { class: 'stack-bar', role: 'img', 'aria-label': `${label}: ${counts.passed || 0} passed, ${counts.failed || 0} failed, ${counts.error || 0} errors, ${counts.skipped || 0} skipped of ${total}` },
    total ? [seg('ok', counts.passed), seg('bad', (counts.failed || 0) + (counts.error || 0)), seg('warn', counts.skipped)] : h('span', { class: 'seg none', style: 'flex:1' }));
}

const LETTER = { p: 'ok', f: 'bad', e: 'bad', s: 'warn' };
const LETTER_TEXT = { p: 'passed', f: 'failed', e: 'error', s: 'skipped' };
export function letterText(l) { return LETTER_TEXT[l] || 'no result'; }
export function letterTone(l) { return LETTER[l] || 'none'; }

/** A row of small cells, one per build, for the recent results of an experiment. */
export function strip(letters, label) {
  return h('span', { class: 'strip', role: 'img', 'aria-label': label + ': ' + (letters.length ? letters.map(letterText).join(', ') : 'no history') },
    letters.map((l) => h('i', { class: letterTone(l) })));
}
