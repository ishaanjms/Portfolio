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
    'a, button, [role="button"], .proj, .project-card, .bento-card, .tools-section'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

// Soft page transitions for internal navigation.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);

  if (!reduceMotion) {
    document.body.classList.add('page-enter');
    window.setTimeout(() => document.body.classList.remove('page-enter'), 520);
  }

  function shouldTransition(event, link) {
    if (reduceMotion || event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (!link || link.target || link.hasAttribute('download')) return false;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) return false;
    if (destination.pathname === window.location.pathname && destination.hash) return false;

    return true;
  }

  function createGhost(link) {
    const media = link.querySelector('.project-media, .proj-thumb-wrap, figure, img');
    const sourceImage = media && media.matches('img') ? media : media && media.querySelector('img');
    if (!media || !sourceImage) return null;

    const rect = media.getBoundingClientRect();
    if (rect.width < 24 || rect.height < 24) return null;

    const ghost = document.createElement('div');
    ghost.className = 'page-transition-ghost';
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    ghost.style.borderRadius = getComputedStyle(media).borderRadius || '20px';

    const image = sourceImage.cloneNode(false);
    image.removeAttribute('id');
    ghost.appendChild(image);
    document.body.appendChild(ghost);

    return { ghost, rect };
  }

  function expandGhost(ghostData) {
    if (!ghostData) return;

    const { ghost, rect } = ghostData;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scale = Math.max(viewportWidth / rect.width, viewportHeight / rect.height) * 1.04;
    const targetX = (viewportWidth - rect.width * scale) / 2;
    const targetY = (viewportHeight - rect.height * scale) / 2;

    requestAnimationFrame(() => {
      ghost.style.borderRadius = '0px';
      ghost.style.opacity = '0.94';
      ghost.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${scale})`;
    });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!shouldTransition(event, link)) return;

    event.preventDefault();
    document.body.classList.add('is-transitioning', 'cursor-hidden');

    const rect = link.getBoundingClientRect();
    overlay.style.setProperty('--transition-x', `${rect.left + rect.width / 2}px`);
    overlay.style.setProperty('--transition-y', `${rect.top + rect.height / 2}px`);

    const ghostData = link.classList.contains('project-card') || link.classList.contains('proj')
      ? createGhost(link)
      : null;

    requestAnimationFrame(() => {
      overlay.classList.add('is-active');
      expandGhost(ghostData);
    });

    window.setTimeout(() => {
      window.location.href = link.href;
    }, ghostData ? 380 : 230);
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('is-transitioning', 'cursor-hidden');
    overlay.classList.remove('is-active');
    document.querySelectorAll('.page-transition-ghost').forEach(ghost => ghost.remove());
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
