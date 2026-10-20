// Garage page interactions
(function () {
  const chips = document.querySelectorAll('.filter-chip');
  const groups = document.querySelectorAll('.project-group');
  let filter = 'all';

  function render() {
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
})();
