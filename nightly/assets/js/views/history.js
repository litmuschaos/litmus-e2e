import { h, icon, showTip, hideTip, announce } from '../dom.js?v=2bc8c8a764';
import * as D from '../data.js?v=2bc8c8a764';
import { strip, letterText, letterTone } from '../charts.js?v=2bc8c8a764';
import { pageHead, buildDot, buildGap } from './common.js?v=2bc8c8a764';

const WINDOWS = [['7', 'Last 7'], ['14', 'Last 14'], ['30', 'Last 30'], ['all', 'All']];

/** One lane: rows are experiments, columns the builds of the history, cells the worst result of the experiment. */
function lanesOf(b, n) {
  const list = D.builds(b.history).filter((x) => x.results);
  const cols = n === 'all' ? list : list.slice(-Number(n));
  const keys = new Set();
  for (const x of cols) for (const id of Object.keys(x.results)) if (!id.includes('/job:')) keys.add(D.groupOfId(id));
  const rate = D.rateSeries(b.history).slice(-cols.length);
  return { cols, keys, rate };
}

export function historyView(ctx) {
  const root = h('div', { class: 'stack' }, pageHead('Run history', 'Every run, every experiment', 'One cell per run and experiment. Amber corners mark a change from the run before; rows that flip between passing and failing are flaky.'));
  const ready = ctx.builds.filter((b) => b.history && D.builds(b.history).length);
  const state = { all: ctx.params.get('all') === '1', n: WINDOWS.some((w) => w[0] === ctx.params.get('n')) ? ctx.params.get('n') : '14', flaky: ctx.params.get('flaky') === '1', q: ctx.params.get('q') || '', cell: Number(ctx.params.get('z')) || 18, at: null };
  if (!ready.length) {
    root.append(buildGap(ctx.current, ctx.retry));
    return root;
  }
  const shown = () => (state.all ? ctx.builds.filter((b) => b.history && D.builds(b.history).length) : [ctx.current]);
  if (!ctx.current.history || !D.builds(ctx.current.history).length) {
    if (!state.all) { root.append(buildGap(ctx.current, ctx.retry)); return root; }
  }

  const body = h('div', { class: 'heat-wrap' });
  const inspector = h('div', { class: 'inspector', 'aria-live': 'polite' });
  const count = h('p', { class: 'count', 'aria-live': 'polite' });
  const scrub = h('input', { type: 'range', min: 0, max: 0, value: 0, id: 'scrub', 'aria-label': 'Select a run, newest on the right' });
  let cells = [];

  const toggle = (id, text, key, on) => h('label', { class: 'switch' }, h('input', { type: 'checkbox', id, checked: on ? true : null, onchange: (e) => { state[key] = e.target.checked; ctx.setParams({ [key === 'all' ? 'all' : key]: e.target.checked ? '1' : null }); state.at = null; draw(); } }), h('span', {}, text));
  const winSel = h('div', { class: 'chips', role: 'group', 'aria-label': 'Number of runs' }, WINDOWS.map(([v, t]) => h('button', { class: 'chip-btn', type: 'button', 'aria-pressed': String(state.n === v), 'data-v': v, onclick: () => { state.n = v; state.at = null; ctx.setParams({ n: v === '14' ? null : v }); winSel.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === v))); draw(); } }, t)));
  const zoom = h('input', { type: 'range', min: 10, max: 34, step: 2, value: state.cell, id: 'zoom', 'aria-label': 'Zoom', oninput: (e) => { state.cell = Number(e.target.value); body.style.setProperty('--cell', state.cell + 'px'); ctx.setParams({ z: state.cell === 18 ? null : state.cell }); } });
  const search = h('input', { type: 'search', placeholder: 'Find an experiment', id: 'hq', value: state.q, 'aria-label': 'Find an experiment', autocomplete: 'off', oninput: (e) => { state.q = e.target.value; ctx.setParams({ q: state.q || null }); draw(); } });

  const tipFor = (cell, row, lane, i) => {
    const letter = cell.dataset.r;
    const spark = strip(row.strip.slice(Math.max(0, i - 14), i + 1), 'Runs up to this one');
    const wrap = h('div', {}, h('b', {}, row.key), h('span', {}, `${D.buildInfo(lane.b.key).label} · run ${lane.cols[i].id}`, h('br')), h('span', { class: 'tip-' + letterTone(letter) }, letterText(letter)), spark);
    showTip(cell, [wrap]);
  };
  const select = (col) => {
    state.at = col;
    for (const c of cells) c.classList.toggle('col', Number(c.dataset.col) === col);
    const parts = [];
    for (const l of lanes) {
      const i = l.cols.length - 1 - (maxCols - 1 - col);
      if (i < 0 || i >= l.cols.length) { parts.push(h('span', { class: 'ins', 'data-b': l.b.key }, buildDot(l.b.key), ' no run at this position')); continue; }
      const r = l.rate[i];
      parts.push(h('span', { class: 'ins', 'data-b': l.b.key }, buildDot(l.b.key), h('b', { class: 'mono' }, ' ' + l.cols[i].id), ' · ', l.cols[i].status, ' · ', D.fmtRate(r.rate)));
    }
    inspector.replaceChildren(...parts);
  };
  let lanes = [], maxCols = 0;

  const draw = () => {
    hideTip();
    lanes = shown().map((b) => ({ b, ...lanesOf(b, state.n) }));
    maxCols = Math.max(1, ...lanes.map((l) => l.cols.length));
    const keys = [...new Set(lanes.flatMap((l) => [...l.keys]))].sort();
    const rows = keys.map((key) => {
      const rl = lanes.map((l) => { const s = l.cols.map((x) => D.groupResult(x.results, key)); return { l, s }; });
      return { key, strip: rl[0].s, lanes: rl, flaky: rl.some((x) => D.flips(x.s) >= 2) };
    }).filter((r) => (!state.flaky || r.flaky) && (!state.q.trim() || D.fuzzy(state.q, r.key) != null));
    rows.sort((a, b) => (b.flaky - a.flaky) || badScore(b) - badScore(a) || a.key.localeCompare(b.key));
    cells = [];
    const grid = h('div', { class: 'heat', role: 'grid', 'aria-label': 'Results per run and experiment', style: `--cols:${maxCols}` });
    grid.append(h('div', { class: 'heat-row head', role: 'row' }, h('span', { class: 'heat-label', role: 'columnheader' }, 'Experiment'), h('span', { class: 'heat-axis', role: 'presentation' }, h('span', {}, 'older'), h('span', {}, 'newer'))));
    rows.forEach((row, ri) => {
      row.lanes.forEach(({ l, s }, li) => {
        const tr = h('div', { class: 'heat-row' + (row.flaky ? ' flaky' : ''), role: 'row' },
          li === 0 ? h('span', { class: 'heat-label', role: 'rowheader', title: row.key }, h('a', { href: '#', class: 'xlink mono', onclick: (e) => { e.preventDefault(); ctx.openExperiment(row.key); } }, row.key), row.flaky ? h('span', { class: 'badge warn flicker' }, 'Flaky') : null) : h('span', { class: 'heat-label', role: 'presentation' }),
          h('span', { class: 'lane', 'data-b': l.b.key, style: `--pad:${maxCols - s.length}` }, state.all ? h('i', { class: 'lane-dot', 'aria-hidden': 'true', title: D.buildInfo(l.b.key).label }) : null,
            s.map((r, i) => {
              const col = maxCols - s.length + i;
              const prev = i ? s[i - 1] : null;
              const flip = i && r && prev && ((r === 'p') !== (prev === 'p')) && r !== 's' && prev !== 's';
              const c = h('button', { type: 'button', role: 'gridcell', tabindex: ri === 0 && li === 0 && i === s.length - 1 ? 0 : -1, class: `cell ${letterTone(r)}${flip ? ' flip' : ''}${i === s.length - 1 && (r === 'f' || r === 'e') ? ' now' : ''}`, 'data-r': r || 'n', 'data-col': col, 'data-ri': ri * lanes.length + li, 'aria-label': `${row.key}, ${D.buildInfo(l.b.key).label} run ${l.cols[i].id}: ${letterText(r)}` });
              c.addEventListener('pointerenter', () => tipFor(c, { key: row.key, strip: s }, l, i));
              c.addEventListener('focus', () => { tipFor(c, { key: row.key, strip: s }, l, i); select(col); });
              c.addEventListener('pointerleave', hideTip);
              c.addEventListener('blur', hideTip);
              c.addEventListener('click', () => select(col));
              cells.push(c);
              return c;
            })));
        grid.append(tr);
      });
    });
    grid.addEventListener('keydown', gridKeys);
    const scroller = h('div', { class: 'heat-scroll', tabindex: -1 }, rows.length ? grid : h('div', { class: 'glass gap small' }, h('h2', {}, 'No experiments to show'), h('p', {}, 'The filters leave nothing. Clear the search or the flaky filter.')));
    panning(scroller);
    body.style.setProperty('--cell', state.cell + 'px');
    body.replaceChildren(scroller);
    scrub.max = String(maxCols - 1);
    scrub.value = String(state.at == null ? maxCols - 1 : state.at);
    select(Number(scrub.value));
    count.textContent = `${rows.length} experiments, ${maxCols} ${maxCols === 1 ? 'run' : 'runs'}${maxCols < 3 ? '. History builds up with every published run.' : ''}`;
    announce(count.textContent);
    requestAnimationFrame(() => { scroller.scrollLeft = scroller.scrollWidth; });
  };
  const badScore = (r) => r.lanes.reduce((n, x) => n + x.s.filter((v) => v === 'f' || v === 'e').length, 0);

  const gridKeys = (e) => {
    const cur = document.activeElement;
    if (!cur || !cur.classList.contains('cell')) return;
    const rowEl = cur.closest('.heat-row');
    const rowCells = [...rowEl.querySelectorAll('.cell')];
    let next = null;
    const i = rowCells.indexOf(cur);
    if (e.key === 'ArrowRight') next = rowCells[i + 1];
    else if (e.key === 'ArrowLeft') next = rowCells[i - 1];
    else if (e.key === 'Home') next = rowCells[0];
    else if (e.key === 'End') next = rowCells[rowCells.length - 1];
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      let sib = rowEl;
      do { sib = e.key === 'ArrowDown' ? sib.nextElementSibling : sib.previousElementSibling; } while (sib && !sib.querySelector('.cell'));
      if (sib) { const cs = [...sib.querySelectorAll('.cell')]; next = cs.find((c) => c.dataset.col === cur.dataset.col) || cs[Math.min(i, cs.length - 1)]; }
    } else return;
    e.preventDefault();
    if (next) { cur.tabIndex = -1; next.tabIndex = 0; next.focus(); next.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  };

  const panning = (el) => {
    let x0 = 0, s0 = 0, drag = false;
    el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.target.closest('a,button')) return; drag = true; x0 = e.clientX; s0 = el.scrollLeft; el.setPointerCapture(e.pointerId); el.classList.add('grabbing'); });
    el.addEventListener('pointermove', (e) => { if (drag) el.scrollLeft = s0 - (e.clientX - x0); });
    const end = () => { drag = false; el.classList.remove('grabbing'); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  };

  scrub.addEventListener('input', () => {
    const col = Number(scrub.value);
    select(col);
    const c = cells.find((x) => Number(x.dataset.col) === col);
    if (c) c.scrollIntoView({ block: 'nearest', inline: 'center' });
  });

  root.append(
    h('section', { class: 'glass toolbar reveal', 'aria-label': 'History controls' },
      h('label', { class: 'search', for: 'hq' }, icon('search'), search),
      h('div', { class: 'filters' }, toggle('ov', 'Overlay all builds', 'all', state.all), toggle('fl', 'Flaky only', 'flaky', state.flaky), winSel,
        h('label', { class: 'range' }, h('span', {}, 'Zoom'), zoom)),
      count),
    h('section', { class: 'glass panel heat-panel reveal', 'aria-label': 'Heatmap' },
      body,
      h('div', { class: 'scrub-row' }, h('label', { for: 'scrub', class: 'label' }, 'Scrub through runs'), scrub, inspector),
      h('p', { class: 'legend key' }, h('span', {}, h('i', { class: 'cell ok' }), ' Passed'), h('span', {}, h('i', { class: 'cell bad' }), ' Failed or error'), h('span', {}, h('i', { class: 'cell warn' }), ' Skipped'), h('span', {}, h('i', { class: 'cell none' }), ' No result'), h('span', {}, h('i', { class: 'cell ok flip' }), ' Changed since the previous run'))));
  draw();
  return root;
}
