// Garage page interactions
(function () {
  const chips = document.querySelectorAll('.filter-chip');
  const groups = document.querySelectorAll('.project-group');
  const previewMotion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const resetPreviews = [];
  let filter = 'all';

  function render() {
    resetPreviews.forEach(reset => reset());
    chips.forEach(chip => {
      const selected = chip.dataset.filter === filter;
      chip.classList.toggle('active', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });

    groups.forEach(group => {
      group.classList.toggle('is-hidden', filter !== 'all' && group.dataset.group !== filter);
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      render();
    });
  });
  render();

  document.querySelectorAll('.project-card').forEach(card => {
    const media = card.querySelector('.project-media');
    if (!media) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      media.classList.remove('is-exploring');
      ['--preview-rx', '--preview-ry', '--preview-x', '--preview-y'].forEach(property => {
        media.style.removeProperty(property);
      });
    }

    function update() {
      frame = 0;
      if (!previewMotion.matches) return;

      // Measure the stationary link so tilting the media cannot move its target.
      const bounds = card.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (pointerX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointerY - bounds.top) / media.offsetHeight * 2 - 1));
      media.style.setProperty('--preview-rx', `${-y * 2.5}deg`);
      media.style.setProperty('--preview-ry', `${x * 2.5}deg`);
      media.style.setProperty('--preview-x', `${x * 4}px`);
      media.style.setProperty('--preview-y', `${y * 4}px`);
      media.classList.add('is-exploring');
    }

    function track(event) {
      if (event.pointerType === 'touch' || !previewMotion.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    }

    media.addEventListener('pointerenter', track);
    media.addEventListener('pointermove', track);
    media.addEventListener('pointerleave', reset);
    media.addEventListener('pointercancel', reset);
    resetPreviews.push(reset);
  });

  function resetAllPreviews() {
    resetPreviews.forEach(reset => reset());
  }

  previewMotion.addEventListener('change', resetAllPreviews);
  window.addEventListener('blur', resetAllPreviews);
  window.addEventListener('scroll', resetAllPreviews, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetAllPreviews();
  });
})();
