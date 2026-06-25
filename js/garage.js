// Garage page interactions
(function () {
  const chips = document.querySelectorAll('.filter-chip');
  const groups = document.querySelectorAll('.project-group');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;

      chips.forEach(item => item.classList.toggle('active', item === chip));

      groups.forEach(group => {
        const shouldShow = filter === 'all' || group.dataset.group === filter;
        group.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });
})();
