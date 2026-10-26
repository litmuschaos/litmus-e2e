// Motion helpers. Everything animates transform, opacity or stroke offsets, so nothing changes layout, and every
// helper falls back to the final state when the viewer asked for reduced motion.

const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
export function reduced() { return mq.matches; }
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const ease = (p) => 1 - Math.pow(1 - p, 3);

/** Counts from the value shown before (or 0) to the new one, so a changing build morphs instead of restarting. */
export function countUp(el, to, format = (v) => String(Math.round(v)), dur = 900) {
  if (to == null || !isFinite(to)) { el.textContent = format(to); el.dataset.v = ''; return; }
  const from = el.dataset.v !== undefined && el.dataset.v !== '' ? Number(el.dataset.v) : 0;
  el.dataset.v = String(to);
  if (reduced() || from === to) { el.textContent = format(to); return; }
  const t0 = performance.now();
  el.textContent = format(from);
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = format(from + (to - from) * ease(p));
    if (p < 1) requestAnimationFrame(tick); else el.textContent = format(to);
  };
  requestAnimationFrame(tick);
}

/** Adds .in to .reveal elements when they scroll into view, in a staggered order. */
let io;
export function reveal(root) {
  const items = [...root.querySelectorAll('.reveal')];
  if (reduced() || !('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return; }
  io = io || new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  let n = 0;
  for (const el of items) {
    // what is already on screen appears at once, only what scrolls in is staggered
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) { el.style.transition = 'none'; el.classList.add('in'); continue; }
    el.style.setProperty('--i', String(Math.min(n++, 8)));
    io.observe(el);
  }
}

/** Runs a DOM swap inside a View Transition, so shared elements morph and the rest cross-fades. */
export function swap(update) {
  if (reduced() || typeof document.startViewTransition !== 'function') { update(); return Promise.resolve(); }
  try {
    const t = document.startViewTransition(() => { update(); });
    return t.finished.catch(() => {});
  } catch (e) { update(); return Promise.resolve(); }
}

// spotlight: one delegated listener, the cursor position goes to the card as custom properties
let raf = 0, lastEvt = null;
export function installSpotlight() {
  if (!finePointer.matches) return;
  document.addEventListener('pointermove', (e) => {
    lastEvt = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const el = lastEvt.target.closest && lastEvt.target.closest('.glass');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', lastEvt.clientX - r.left + 'px');
      el.style.setProperty('--my', lastEvt.clientY - r.top + 'px');
    });
  }, { passive: true });
}

/** 3D tilt that follows the pointer, eased back on leave. */
export function tilt(el, max = 6) {
  if (reduced() || !finePointer.matches) return el;
  let frame = 0;
  el.addEventListener('pointermove', (e) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`;
    });
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  return el;
}

/** Buttons that lean towards the cursor. */
export function magnetic(el, pull = 0.25) {
  if (reduced() || !finePointer.matches) return el;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * pull, y = (e.clientY - (r.top + r.height / 2)) * pull;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  return el;
}

/**
 * Embers that drift out of a point and scatter on pointer movement. One canvas, at most `count` particles, paused when
 * the canvas is off screen or the tab is hidden. Returns a stop function. Does nothing under reduced motion.
 */
export function embers(canvas, { color = '255,92,108', count = 36 } = {}) {
  if (reduced()) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  let w = 0, h = 0, dpr = 1, running = false, id = 0, visible = true;
  const ps = [];
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (burst) => {
    const a = Math.random() * Math.PI * 2, sp = burst ? 1.2 + Math.random() * 2.6 : 0.15 + Math.random() * 0.5;
    return { x: w / 2, y: h / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 80 + Math.random() * 90, r: 0.8 + Math.random() * 1.8 };
  };
  const frame = () => {
    id = 0;
    if (!running || !visible) return;
    ctx.clearRect(0, 0, w, h);
    while (ps.length < count && Math.random() < 0.35) ps.push(spawn(false));
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life += 1; p.x += p.vx; p.y += p.vy; p.vx *= 0.995; p.vy *= 0.995;
      const k = 1 - p.life / p.max;
      if (k <= 0) { ps.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(${color},${(k * 0.85).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
    id = requestAnimationFrame(frame);
  };
  const kick = () => { if (!id && running && visible) id = requestAnimationFrame(frame); };
  const scatter = () => { for (let i = 0; i < 14; i++) ps.push(spawn(true)); kick(); };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const vis = new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); });
  vis.observe(canvas);
  const onHidden = () => { running = !document.hidden; kick(); };
  document.addEventListener('visibilitychange', onHidden);
  canvas.parentElement.addEventListener('pointerenter', scatter);
  running = true;
  resize();
  scatter();
  return () => {
    running = false;
    if (id) cancelAnimationFrame(id);
    ro.disconnect(); vis.disconnect();
    document.removeEventListener('visibilitychange', onHidden);
  };
}
