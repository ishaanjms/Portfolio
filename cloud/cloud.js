(function () {
  const steps = {
    upload: {
      label: 'Selected step · 01',
      title: 'Start with a familiar upload pattern.',
      copy: 'The app opens in a low-pressure waiting state. Users are not shown analysis controls until an image exists, preventing premature decisions.',
      preview: '<div class="drop-zone"><strong>Choose an image...</strong><span>JPG · JPEG · PNG</span></div>'
    },
    crop: {
      label: 'Selected step · 02',
      title: 'Force a comparable analysis region.',
      copy: 'The cropper uses a square aspect ratio and the selected region is resized to 200x200 px, making downstream plots consistent across uploads.',
      preview: '<div class="crop-demo"><div></div></div>'
    },
    adjust: {
      label: 'Selected step · 03',
      title: 'Tune visibility before analysis.',
      copy: 'Gamma correction gives users an understandable control for making faint density differences easier to inspect before committing to analysis.',
      preview: '<div class="gamma-demo"><span></span><span></span><span></span><div class="slider"><i style="width: 66%"></i></div></div>'
    },
    analyze: {
      label: 'Selected step · 04',
      title: 'Reveal metrics and plots together.',
      copy: 'The explicit analyze action unlocks center-of-mass metrics, heatmap, 1D profiles, and the interactive 3D surface as a single interpretation package.',
      preview: '<div class="analysis-demo"><strong>COM X 103.42</strong><strong>COM Y 98.77</strong><div class="mini-heatmap"><i></i></div></div>'
    }
  };

  const buttons = document.querySelectorAll('.workflow-tabs button');
  const stage = document.querySelector('.workflow-stage');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const step = steps[button.dataset.step] || steps.upload;
      buttons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      stage.querySelector('.workflow-copy span').textContent = step.label;
      stage.querySelector('.workflow-copy h3').textContent = step.title;
      stage.querySelector('.workflow-copy p').textContent = step.copy;
      stage.querySelector('.workflow-preview').innerHTML = step.preview;
    });
  });
})();
