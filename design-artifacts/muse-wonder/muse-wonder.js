// Adapted from the supplied Muse Wonder artifact.
(() => {
  const host = document.querySelector('.muse-stage');
  if (!host) return;
  const passivePreview = host.dataset.preview === 'passive';
  const cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), title = host.querySelector('.muse-title');
  if (!ctx) return;
  let rafId = null, inView = true, elapsed = 0;
  const WORDS = ['PRODUCT', 'DESIGN', 'RESEARCH', 'IDEATE', 'CREATE', 'TEST', 'ITERATE'];
  const REST_WORD = 'DESIGN';
  const SYMS = '@*^<>·:;#+%&=~1✺';
  const MONO = '"JetBrains Mono","SF Mono",ui-monospace,Menlo,Consolas,"Liberation Mono",monospace';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAXL = Math.max(...WORDS.map(word => word.length)), REST = 0.15;
  const rnd = s => s[(Math.random() * s.length) | 0];
  const sstep = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };

  let W, H, dpr, cols, rows, pitch, rowP, letterP, fontPx, ox, oy, cells, heat, R, Rinf, hole;
  const ptr = { x: 0, y: 0, on: false };

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pitch = Math.max(88, Math.min(W / 9.6, 140));
    rowP = pitch * 0.24; letterP = pitch * 0.75 / MAXL; fontPx = pitch * 0.15;
    cols = Math.max(3, Math.floor((W - 60) / pitch));
    rows = Math.ceil(H / rowP) + 1;
    ox = (W - cols * pitch) / 2 + pitch / 2;
    oy = rowP * 0.9;
    R = pitch * 0.62;                    // tight radius: block / braille / colon trail
    Rinf = Math.max(170, W * 0.2);       // wide radius: brightness + word change

    // cells that would collide with the title stay empty
    const bounds = cv.getBoundingClientRect(), titleBounds = title.getBoundingClientRect();
    const sx = W / bounds.width, sy = H / bounds.height;
    const tr = {
      left: (titleBounds.left - bounds.left) * sx,
      right: (titleBounds.right - bounds.left) * sx,
      top: (titleBounds.top - bounds.top) * sy,
      bottom: (titleBounds.bottom - bounds.top) * sy
    };
    hole = new Uint8Array(cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = ox + c * pitch, y = oy + r * rowP;
      if (cx + pitch * 0.4 > tr.left - 10 && cx - pitch * 0.4 < tr.right + 10 &&
          y > tr.top - rowP * 0.6 && y - rowP < tr.bottom + rowP * 0.4) hole[r * cols + c] = 1;
    }
    cells = Array.from({ length: cols * rows }, () => ({
      word: REST_WORD, old: null, shown: null, t0: 0, a: REST, e: 0, thr: 0.18 + Math.random() * 0.4,
      hot: false, alt: REST_WORD, glitch: null, pending: undefined
    }));
    heat = new Float32Array(cols * rows * MAXL);
  }

  // slow drifting field that decides which words are present (the gaps)
  const presence = (c, r, t) => (Math.sin(c * 0.85 + t * 0.20 + r * 0.15) + Math.sin(r * 0.55 - t * 0.16 + c * 0.2) +
                                 Math.sin(c * 0.5 + r * 0.45 + t * 0.12) + Math.sin(c * 1.7 - r * 1.3 + t * 0.07)) / 4;
  function wants(k, c, r, t, e) {
    if (hole[k]) return false;
    const dx = (c - (cols - 1) / 2) / (cols * 0.27), dy = (r - rows * 0.5) / (rows * 0.12);
    return presence(c, r, t) + e * 0.7 - Math.exp(-(dx * dx + dy * dy)) * 1.0 > -0.5;
  }

  function pointerPosition(e) {
    const bounds = cv.getBoundingClientRect();
    ptr.x = (e.clientX - bounds.left) * W / bounds.width;
    ptr.y = (e.clientY - bounds.top) * H / bounds.height;
    ptr.on = true;
    requestFrame();
  }
  if (!passivePreview) {
  host.addEventListener('pointermove', pointerPosition);
  host.addEventListener('pointerdown', pointerPosition);
  host.addEventListener('pointerleave', () => { ptr.on = false; });
  host.addEventListener('pointercancel', () => { ptr.on = false; });
  host.addEventListener('pointerup', e => { if (e.pointerType === 'touch') ptr.on = false; });
  window.addEventListener('blur', () => { ptr.on = false; });
  host.addEventListener('focus', () => { ptr.x = W * 0.35; ptr.y = H * 0.4; ptr.on = true; requestFrame(); });
  host.addEventListener('blur', () => { ptr.on = false; });
  host.addEventListener('keydown', e => {
    const directions = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] };
    if (e.key === 'Escape') { ptr.on = false; return; }
    if (!directions[e.key]) return;
    e.preventDefault();
    const [dx, dy] = directions[e.key];
    ptr.x = Math.max(0, Math.min(W, ptr.x + dx));
    ptr.y = Math.max(0, Math.min(H, ptr.y + dy));
    ptr.on = true;
    requestFrame();
  });
  }

  const T0 = performance.now(); let prev = T0;
  function requestFrame() {
    if (rafId === null && inView && !document.hidden) rafId = requestAnimationFrame(frame);
  }
  function frame(now) {
    rafId = null;
    if (!inView || document.hidden) return;
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    if (!reduce) elapsed += dt;
    const t = reduce ? 0 : elapsed;
    if (passivePreview && !reduce) {
      ptr.on = true;
      ptr.x = W * (0.5 + 0.3 * Math.sin(t * 0.45));
      ptr.y = H * (0.5 + 0.25 * Math.sin(t * 0.6 + 1));
    }
    ctx.clearRect(0, 0, W, H);
    ctx.font = `400 ${fontPx}px ${MONO}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

    if (!reduce && Math.random() < 0.15) {                // rare stray glitch in the resting state
      const c = cells[(Math.random() * cells.length) | 0];
      if (c.shown) c.glitch = { i: (Math.random() * c.word.length) | 0, ch: rnd(SYMS), until: now + 150 + Math.random() * 450 };
    }

    for (let r = 0; r < rows; r++) {
      const y = oy + r * rowP;
      for (let c = 0; c < cols; c++) {
        const k = r * cols + c, cell = cells[k], cx = ox + c * pitch;

        // excitement: rises fast near the pointer, fades slowly afterwards
        let target = 0;
        if (ptr.on && !reduce) {
          const d = Math.hypot(cx - ptr.x, y - fontPx * .35 - ptr.y);
          target = Math.pow(sstep(0, 1, 1 - d / Rinf), 1.5);
        }
        cell.e = target > cell.e ? cell.e + (target - cell.e) * Math.min(1, dt * 18) : Math.max(0, cell.e - dt * 1.5);

        // hot cells swap DESIGN for words from the product design process
        if (!cell.hot && cell.e > cell.thr) { cell.hot = true; cell.alt = rnd(WORDS); }
        else if (cell.hot && cell.e < cell.thr - 0.08) cell.hot = false;
        else if (cell.hot && Math.random() < dt * 0.12) cell.alt = rnd(WORDS);
        const desired = cell.hot ? cell.alt : REST_WORD;

        const want = wants(k, c, r, t, cell.e);
        if (cell.shown === null) {                         // load: reveal from the top
          cell.shown = false; cell.pending = want;
          cell.t0 = reduce ? -1e5 : now + r * 30 + Math.random() * 400;
        }
        if (cell.pending !== undefined && now >= cell.t0) {
          cell.old = null; cell.shown = cell.pending; cell.pending = undefined; cell.word = desired;
        } else if (cell.pending === undefined && now > cell.t0 + 1200 && want !== cell.shown) {
          cell.old = cell.shown ? cell.word : null; cell.shown = want; cell.t0 = now; if (want) cell.word = desired;
        } else if (cell.pending === undefined && cell.shown && desired !== cell.word && now > cell.t0 + 450) {
          cell.old = cell.word; cell.word = desired; cell.t0 = now;
        }

        cell.a = REST + 0.72 * cell.e;                     // brighter the closer to the pointer

        const e = now - cell.t0, len = cell.word.length;
        for (let i = 0; i < MAXL; i++) {
          const lx = cx + (i - (len - 1) / 2) * letterP, hi = k * MAXL + i;

          // tight heat around the pointer: block -> braille -> colon -> letter
          if (ptr.on && !reduce) {
            const d = Math.hypot(lx - ptr.x, y - fontPx * .35 - ptr.y);
            if (d < R) heat[hi] = Math.max(heat[hi], 1 - d / R);
          }
          const h = heat[hi]; heat[hi] = Math.max(0, h - dt * 1.4);

          let ch = null, a = cell.a;
          const kk = e - i * 55;
          if (kk < 0) { if (cell.old) ch = cell.old[i] || null; }
          else if (kk < 360 && !reduce) {                  // letters dissolve into colons/dots, then settle
            const q = Math.random();
            ch = q < 0.6 ? ':' : q < 0.72 ? '⠿' : q < 0.9 ? rnd(SYMS) : null; a = Math.max(a, 0.3);
          } else if (cell.shown) ch = cell.word[i] || null;

          if (cell.glitch && cell.glitch.i === i) {
            if (now < cell.glitch.until) { ch = cell.glitch.ch; a = 0.35; } else cell.glitch = null;
          }
          if (!ch) continue;

          if (h > 0.6) {
            ctx.fillStyle = `rgba(236,236,240,${0.55 + h * 0.4})`;
            ctx.fillRect(lx - letterP * 0.3, y - fontPx * 0.78, letterP * 0.6, fontPx * 0.88);
            continue;
          }
          if (h > 0.3) { ch = ((now / 90 + hi) | 0) % 3 ? '⠿' : '⣿'; a = 0.7; }
          else if (h > 0.08) { ch = ':'; a = 0.7; }

          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fillText(ch, lx, y);
        }
      }
    }
    if (!reduce) requestFrame();
  }

  function syncActivity() {
    if (!inView || document.hidden) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      ptr.on = false;
    } else {
      prev = performance.now();
      requestFrame();
    }
  }
  new ResizeObserver(() => { resize(); requestFrame(); }).observe(host);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncActivity(); }).observe(host);
  document.addEventListener('visibilitychange', syncActivity);
  window.addEventListener('pagehide', () => { inView = false; syncActivity(); });
  window.addEventListener('pageshow', () => { inView = true; syncActivity(); });
  resize();
  requestFrame();
})();
