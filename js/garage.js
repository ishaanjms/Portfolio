// Garage page interactions
(function () {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.project-card');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;

      chips.forEach(item => item.classList.toggle('active', item === chip));

      cards.forEach(card => {
        const categories = (card.dataset.category || '').split(' ');
        const shouldShow = filter === 'all' || categories.includes(filter);
        card.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });
})();
