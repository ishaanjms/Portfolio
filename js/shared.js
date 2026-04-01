// ─── Shared across all pages ────────────────────────────────────────────────

// ─── Custom cursor (desktop only) ────────────────────────────────────────────
(function () {
  if (window.matchMedia('(hover: none)').matches) return;

  document.body.classList.add('custom-cursor');

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -200, my = -200, rx = -200, ry = -200;
  let firstMove = true;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    // Snap ring to cursor on first move — prevents crawl-in from off-screen
    if (firstMove) { rx = mx; ry = my; firstMove = false; }
  });
  document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
  document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));

  // Pause RAF when tab is hidden to save CPU
  let rafId;
  function lerp() {
    if (!document.hidden) {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
    }
    rafId = requestAnimationFrame(lerp);
  }
  rafId = requestAnimationFrame(lerp);

  document.querySelectorAll(
    'a, button, [role="button"], .proj, .bento-card, .tools-section'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

// Hamburger nav toggle
document.getElementById('nav-toggle').addEventListener('click', function () {
  this.classList.toggle('open');
  document.querySelector('.nav-right').classList.toggle('open');
});

// Scroll reveal via IntersectionObserver
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.footer-section, .anim-fade-up').forEach(el => revealObserver.observe(el));
