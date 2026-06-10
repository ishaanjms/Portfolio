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
      label: 'Baseline implementation',
      title: 'Add Web Alignment and Mobile Alignment in the right bar.',
      copy: 'A low-risk approach that preserves the existing desktop setting while adding mobile placement options such as top, between title and answer, and bottom.'
    },
    preferred: {
      label: 'Near-term usability lift',
      title: 'Add a device toggle in the builder top menu.',
      copy: 'The adopted direction lets creators switch between web, mobile, tablet, and custom views, making responsive behavior visible while they author the survey.'
    },
    best: {
      label: 'Long-term product direction',
      title: 'Make the builder a responsive authoring surface.',
      copy: 'The long-term direction is accurate real-time rendering across device types, including custom dimensions, validation limits, and parity with respondent experience.'
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
