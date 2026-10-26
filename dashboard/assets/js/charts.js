import { h, svg, withTip, reducedMotion } from './dom.js';
import { fmtRate, fmtDuration } from './data.js';

/** Pass rate ring. The value is also written as text in the center. */
export function ring(rate, color, label) {
  const r = 40, c = 2 * Math.PI * r;
  const arc = svg('circle', { class: 'arc', cx: 50, cy: 50, r, fill: 'none', stroke: color, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-dasharray': c, 'stroke-dashoffset': c });
  const el = h('div', { class: 'ring', role: 'img', 'aria-label': label + ': ' + (rate == null ? 'no result' : fmtRate(rate) + ' passed') },
    svg('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }, svg('circle', { class: 'track', cx: 50, cy: 50, r, fill: 'none', 'stroke-width': 10 }), arc),
    h('div', { class: 'center' }, h('span', {}, fmtRate(rate), h('small', {}, 'passed'))));
  const target = rate == null ? c : c * (1 - rate / 100);
  if (reducedMotion()) arc.setAttribute('stroke-dashoffset', target);
  else requestAnimationFrame(() => requestAnimationFrame(() => arc.setAttribute('stroke-dashoffset', target)));
  return el;
}

/** Stacked bar of passed/failed/error/skipped with a 2px gap between the segments. */
export function stackedBar(counts) {
  const sum = counts.passed + counts.failed + counts.error + counts.skipped;
  const el = h('div', { class: 'sbar', role: 'img', 'aria-label': `${counts.passed} passed, ${counts.failed} failed, ${counts.error} error, ${counts.skipped} skipped` });
  if (!sum) return el;
  for (const k of ['passed', 'failed', 'error', 'skipped']) if (counts[k]) el.append(h('i', { class: k, style: `width:${(100 * counts[k]) / sum}%` }));
  return el;
}

/** One column per build, colored by the status of the build. Click opens the build in the history. */
export function timeline(items, onPick) {
  const wrap = h('div', { class: 'timeline', role: 'group', 'aria-label': 'Status of the latest builds, oldest first' });
  items.forEach((b, i) => {
    const cls = b.status === 'passed' || b.status === 'failed' || b.status === 'incomplete' ? b.status : 'none';
    const btn = h('button', { type: 'button', class: cls, style: `--i:${i}`, 'aria-label': `${b.id}: ${b.status}${b.rate != null ? ', ' + fmtRate(b.rate) + ' passed' : ''}` });
    withTip(btn, () => [b.id, b.status[0].toUpperCase() + b.status.slice(1) + (b.rate != null ? ' · ' + fmtRate(b.rate) + ' passed' : '')]);
    if (onPick) btn.addEventListener('click', () => onPick(b));
    wrap.append(btn);
  });
  return wrap;
}

/**
 * Line chart over builds. series: [{name, color, points:[{x:id, y:number|null}]}]. A gap is drawn where a build has no value.
 * Each point has a larger hit target with a tooltip, the last point of every series is labeled directly.
 */
export function lineChart({ series, yMin = 0, yMax = 100, format = fmtRate, ariaLabel, height = 200 }) {
  const W = 640, H = height, m = { l: 40, r: 70, t: 12, b: 26 };
  const xs = series[0] ? series[0].points.map((p) => p.x) : [];
  const n = xs.length;
  const x = (i) => m.l + (n <= 1 ? (W - m.l - m.r) / 2 : (i * (W - m.l - m.r)) / (n - 1));
  const y = (v) => m.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - m.t - m.b);
  const root = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': ariaLabel });
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = yMin + ((yMax - yMin) * i) / ticks;
    root.append(svg('line', { class: 'grid-line', x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }), svg('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, format(v)));
  }
  const labelEvery = Math.max(1, Math.ceil(n / 7));
  xs.forEach((id, i) => { if (i % labelEvery === 0 || i === n - 1) root.append(svg('text', { x: x(i), y: H - 6, 'text-anchor': 'middle' }, id.slice(5))); });
  const labelYs = [];
  for (const s of series) {
    let d = '', pen = false;
    s.points.forEach((p, i) => {
      if (p.y == null) { pen = false; return; }
      d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.y).toFixed(1);
      pen = true;
    });
    const path = svg('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    root.append(path);
    if (!reducedMotion() && path.getTotalLength) {
      try { const len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; path.getBoundingClientRect(); path.style.transition = 'stroke-dashoffset 1s ease'; requestAnimationFrame(() => { path.style.strokeDashoffset = 0; }); } catch (e) { /* drawing without animation */ }
    }
    let last = -1;
    s.points.forEach((p, i) => { if (p.y != null) last = i; });
    s.points.forEach((p, i) => {
      if (p.y == null) return;
      const dot = svg('circle', { class: 'dotmark', cx: x(i), cy: y(p.y), r: i === last ? 4.5 : 3.5, fill: s.color });
      root.append(dot);
    });
    if (last >= 0) {
      // direct label at the end of the line, pushed down when it would overlap the label of another series
      let ly = y(s.points[last].y) + 4;
      while (labelYs.some((o) => Math.abs(o - ly) < 13)) ly += 13;
      labelYs.push(ly);
      root.append(svg('text', { class: 'series-label', x: x(last) + 9, y: ly }, s.name));
    }
  }
  // hit targets, one per build, above the marks
  for (let i = 0; i < n; i++) {
    const hit = svg('rect', { class: 'hit', x: x(i) - Math.max(8, (W - m.l - m.r) / Math.max(n - 1, 1) / 2), y: m.t, width: Math.max(16, (W - m.l - m.r) / Math.max(n - 1, 1)), height: H - m.t - m.b });
    withTip(hit, () => [xs[i], ...series.map((s) => s.name + ': ' + (s.points[i].y == null ? 'no result' : format(s.points[i].y)))]);
    root.append(hit);
  }
  const legend = h('div', { class: 'legend' }, series.map((s) => h('span', {}, h('i', { style: `background:${s.color}` }), s.name)));
  return { root, legend };
}

export const durationFormat = (v) => fmtDuration(v);
