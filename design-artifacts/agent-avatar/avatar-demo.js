// Portfolio integration for the supplied AgentAvatar demo.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labelFor = name => name.charAt(0).toUpperCase() + name.slice(1);

  document.querySelectorAll('[data-agent-avatar]').forEach(host => {
    const preview = host.dataset.preview === 'passive';
    const mount = host.querySelector('.avatar-mount');
    const label = host.querySelector('[data-avatar-label]');
    const states = host.querySelector('[data-avatar-states]');
    const themes = host.querySelector('[data-avatar-themes]');
    const follow = host.querySelector('[data-avatar-follow]');
    const blink = host.querySelector('[data-avatar-blink]');
    const reel = ['happy', 'idle', 'thinking', 'working', 'surprised', 'confused', 'listening', 'error', 'sad', 'sleeping'];
    let state = preview && !reduceMotion ? reel[0] : 'idle';
    let inView = false, reelTimer = null, reelIndex = 0;
    let avatar;

    function onState(name) {
      state = name;
      if (label) label.textContent = labelFor(name);
      if (states) states.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.state === name));
      });
    }

    function scheduleReel() {
      clearTimeout(reelTimer);
      reelTimer = null;
      if (!preview || reduceMotion || !inView || document.hidden) return;
      reelTimer = window.setTimeout(() => {
        reelIndex = (reelIndex + 1) % reel.length;
        avatar.setState(reel[reelIndex]);
        scheduleReel();
      }, 2800);
    }

    function syncActivity() {
      const active = inView && !document.hidden;
      if (active && !reduceMotion) avatar.resume();
      else avatar.pause();
      scheduleReel();
    }

    // Reduced motion shows a settled expression instead of a looping animation.
    function settle() {
      if (reduceMotion) avatar.renderStill();
    }

    function createAvatar(theme) {
      if (avatar) avatar.destroy();
      avatar = new AgentAvatar(mount, { shadow: true, theme, state, autoBlink: !reduceMotion });
      avatar.on('state', onState);
      if (follow) avatar.followPointer(follow.getAttribute('aria-pressed') === 'true');
      onState(state);
      avatar.renderStill();
      syncActivity();
    }

    if (!preview) {
      follow.disabled = reduceMotion;
      blink.disabled = reduceMotion;
      AgentAvatar.states.forEach(name => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.state = name;
        button.textContent = labelFor(name);
        button.addEventListener('click', () => { avatar.setState(name); settle(); });
        states.appendChild(button);
      });
      Object.entries(AgentAvatar.themes).forEach(([name, theme]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'avatar-swatch';
        button.setAttribute('aria-label', labelFor(name));
        button.setAttribute('aria-pressed', String(name === 'ink'));
        button.style.setProperty('--avatar-swatch', theme.color);
        button.addEventListener('click', () => {
          themes.querySelectorAll('button').forEach(swatch => swatch.setAttribute('aria-pressed', String(swatch === button)));
          createAvatar(name);
        });
        themes.appendChild(button);
      });
      follow.addEventListener('click', () => {
        const enabled = follow.getAttribute('aria-pressed') !== 'true';
        follow.setAttribute('aria-pressed', String(enabled));
        avatar.followPointer(enabled);
      });
      blink.addEventListener('click', () => { avatar.blink(); });
    }

    createAvatar('ink');
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncActivity();
    });
    observer.observe(host);
    document.addEventListener('visibilitychange', syncActivity);
    window.addEventListener('pagehide', () => { inView = false; syncActivity(); });
    window.addEventListener('pageshow', () => { inView = host.getBoundingClientRect().bottom > 0 && host.getBoundingClientRect().top < window.innerHeight; syncActivity(); });
  });
})();
