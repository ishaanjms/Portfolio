// ─── Garage page — bento 3D tilt ─────────────────────────────────────────────

(function () {
  // Skip on touch-only devices (no hover capability)
  if (window.matchMedia('(hover: none)').matches) return;

  const TILT_MAX = 8;    // max rotation in degrees
  const SCALE    = 1.03; // slight scale-up on hover

  document.querySelectorAll('.bento-card').forEach(card => {
    // Inject glare element into each card
    const glare = document.createElement('div');
    glare.className = 'bento-glare';
    card.appendChild(glare);

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0 → 1 (left → right)
      const y = (e.clientY - rect.top)  / rect.height;  // 0 → 1 (top → bottom)

      const rotY =  (x - 0.5) * 2 * TILT_MAX;  // positive = tilt right
      const rotX = -(y - 0.5) * 2 * TILT_MAX;  // negative = tilt up when cursor is high

      // Instant on move, smooth on release
      card.style.transition = 'box-shadow 0.15s ease';
      card.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;

      // Shadow shifts direction opposite to tilt — looks physically grounded
      card.style.boxShadow  = `${-rotY * 1.2}px ${rotX * 1.2 + 12}px 28px rgba(0,0,0,0.13)`;

      // Glare follows cursor as a radial highlight
      glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.28) 0%, transparent 62%)`;
      glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease';
      card.style.transform  = '';
      card.style.boxShadow  = '';
      glare.style.opacity   = '0';
    });
  });
})();
