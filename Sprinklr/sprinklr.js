(function () {
  const surveyPreview = document.querySelector('.survey-preview');
  const simulatorPanel = document.querySelector('.simulator-panel');
  const deviceButtons = document.querySelectorAll('.device-controls button');
  const alignmentControls = document.querySelector('.alignment-controls');
  const panelSublabel = document.querySelector('.panel-sublabel');

  const alignmentOptions = {
    web: {
      label: 'Web alignment',
      defaultValue: 'left-centered',
      options: [
        ['left-centered', 'Left Centered'],
        ['right-centered', 'Right Centered'],
        ['left-filled', 'Left Filled'],
        ['right-filled', 'Right Filled'],
        ['between', 'Between Title And Answer']
      ]
    },
    mobile: {
      label: 'Mobile alignment',
      defaultValue: 'top',
      options: [
        ['top', 'Top'],
        ['between', 'Between Title And Answer'],
        ['bottom', 'Bottom']
      ]
    },
    tablet: {
      label: 'Tablet alignment',
      defaultValue: 'top',
      options: [
        ['top', 'Top'],
        ['between', 'Between Title And Answer'],
        ['bottom', 'Bottom']
      ]
    },
    custom: {
      label: 'Custom viewport alignment',
      defaultValue: 'top',
      options: [
        ['top', 'Top'],
        ['between', 'Between Title And Answer'],
        ['bottom', 'Bottom']
      ]
    }
  };

  function renderAlignmentControls(device) {
    const config = alignmentOptions[device] || alignmentOptions.web;
    panelSublabel.textContent = config.label;
    alignmentControls.innerHTML = config.options.map(([value, label], index) => (
      `<button type="button" ${index === 0 ? 'class="active"' : ''} data-align="${value}">${label}</button>`
    )).join('');
    surveyPreview.dataset.align = config.defaultValue;
  }

  deviceButtons.forEach(button => {
    button.addEventListener('click', () => {
      const device = button.dataset.device || 'web';
      deviceButtons.forEach(item => item.classList.toggle('active', item === button));
      surveyPreview.dataset.device = device;
      simulatorPanel.dataset.customActive = device === 'custom' ? 'true' : 'false';
      renderAlignmentControls(device);
    });
  });

  alignmentControls.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    alignmentControls.querySelectorAll('button').forEach(item => {
      item.classList.toggle('active', item === button);
    });
    surveyPreview.dataset.align = button.dataset.align || 'top';
  });

  const options = {
    required: {
      label: 'Least change',
      title: 'Add Web Alignment and Mobile Alignment in the right bar.',
      copy: 'This solved the requested control gap, but it did not solve the bigger visibility problem because creators still had to preview elsewhere.'
    },
    preferred: {
      label: 'Better direction',
      title: 'Add a device toggle in the builder top menu.',
      copy: 'This brought the preview decision into the builder, letting creators switch between web, mobile, tablet, and custom views while authoring.'
    },
    best: {
      label: 'Best shipped direction',
      title: 'Make the builder a responsive authoring surface.',
      copy: 'This was the strongest version: a device-aware authoring model with responsive canvas behavior, custom dimensions, validation limits, and configuration safety.'
    }
  };

  const optionButtons = document.querySelectorAll('.solution-tabs button');
  const solutionCard = document.querySelector('.solution-card');

  optionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const option = options[button.dataset.option] || options.required;
      optionButtons.forEach(item => item.classList.toggle('active', item === button));
      solutionCard.querySelector('span').textContent = option.label;
      solutionCard.querySelector('h3').textContent = option.title;
      solutionCard.querySelector('p').textContent = option.copy;
    });
  });
})();
