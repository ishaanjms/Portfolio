// Custom figures share Hairline's unchanged kernel, passive tour and frame loop.
function hairline(spec) {
  document.querySelectorAll('[data-hairline-figure="' + spec.name + '"]').forEach(stage => {
    stage.setAttribute('data-hairline', spec.name);
    stage.setAttribute('data-hairline-theme', stage.dataset.figureTheme || 'light');
    HL.inject(document);
    const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
    const read = { textContent: 'rest' };
    spec.mount({ stage, svg, read }, spec.range[1]);
    HL.tour(stage, spec.tour);
  });
}
