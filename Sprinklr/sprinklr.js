(function () {
  const demo = document.querySelector('[data-spr-demo]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let demoVisible = false;

  function syncPlayback() {
    if (!demo) return;
    const playing = !reduceMotion.matches && demoVisible && !document.hidden;
    const source = playing ? demo.dataset.animation : demo.dataset.poster;
    if (demo.getAttribute('src') !== source) demo.setAttribute('src', source);
    demo.alt = playing
      ? 'Product recording showing desktop and mobile device preview inside Sprinklr Survey Builder'
      : 'CFM Device Switcher project preview';
  }

  if (demo) {
    reduceMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    new IntersectionObserver(entries => {
      demoVisible = entries[0].isIntersecting;
      syncPlayback();
    }, { rootMargin: '100px 0px' }).observe(demo);
    syncPlayback();
  }

  const links = [...document.querySelectorAll('.spr-index a')];
  const sections = [...document.querySelectorAll('.spr-content > [id]')];
  function setCurrent(id) {
    links.forEach(link => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  links.forEach(link => link.addEventListener('click', () => setCurrent(link.hash.slice(1))));
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    if (visible.length) {
      const section = visible[visible.length - 1].target;
      setCurrent(section.dataset.navSection || section.id);
    }
  }, { rootMargin: '-12% 0px -64% 0px' });
  sections.forEach(section => sectionObserver.observe(section));
})();
