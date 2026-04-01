// ─── Shared across all pages ────────────────────────────────────────────────

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
