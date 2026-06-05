(function () {
  const pillarCards = document.querySelectorAll('.gc-pillar-map article');
  const stageNodes = document.querySelectorAll('.gc-pillar-node');
  const stageLabels = {
    foundation: ['Schemas', 'Model', 'Backend', 'Reliability'],
    behaviour: ['Tone', 'Depth', 'Variation', 'Control'],
    connection: ['Input', 'Memory', 'Agency', 'Trust'],
    purpose: ['Ethics', 'Persona', 'Boundaries', 'Alignment'],
    evolution: ['History', 'Feedback', 'Updates', 'Drift']
  };

  pillarCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.pillar;
      pillarCards.forEach(item => item.classList.toggle('active', item === card));
      (stageLabels[key] || stageLabels.foundation).forEach((label, index) => {
        if (stageNodes[index]) stageNodes[index].textContent = label;
      });
    });
  });

  const modes = {
    surface: {
      label: 'Surface response',
      title: 'Clarify the immediate decision.',
      copy: 'Identify your priorities, test interests through small experiments, and avoid overcommitting before you have evidence.',
      steps: ['List what stability gives you.', 'List what exploration gives you.', 'Choose one low-risk experiment this month.']
    },
    philosophical: {
      label: 'Philosophical response',
      title: 'Treat uncertainty as a stage of exploration.',
      copy: 'The question is not whether you are lost. The question is whether you are gathering the right signals from the terrain around you.',
      steps: ['Notice which options sharpen your attention.', 'Separate fear of risk from fear of wasted potential.', 'Let identity emerge from repeated action.']
    },
    tactical: {
      label: 'Tactical response',
      title: 'Convert ambiguity into a decision loop.',
      copy: 'Map your interests into testable paths, run short experiments, review the evidence, and repeat until a direction has earned your confidence.',
      steps: ['Choose three paths and define one experiment for each.', 'Set a two-week review window.', 'Score every path by energy, leverage, learning, and market signal.']
    }
  };

  const modeButtons = document.querySelectorAll('.gc-mode-controls button');
  const output = document.querySelector('.gc-demo-output');

  modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = modes[button.dataset.mode] || modes.surface;
      modeButtons.forEach(item => item.classList.toggle('active', item === button));
      output.querySelector('.gc-output-label').textContent = mode.label;
      output.querySelector('h3').textContent = mode.title;
      output.querySelector('.gc-output-copy').textContent = mode.copy;
      output.querySelector('ol').innerHTML = mode.steps.map(step => `<li>${step}</li>`).join('');
    });
  });

  const logicViews = {
    compose: {
      chips: ['Schema valid', 'Persona aligned'],
      confidence: '0.82',
      clarity: 'High need for tactical clarity',
      reflection: 'Moderate need for reflection'
    },
    reason: {
      chips: ['Trace visible', 'Framework mapped'],
      confidence: '0.76',
      clarity: 'Behaviour mode is explainable',
      reflection: 'Purpose guardrail is active'
    },
    memory: {
      chips: ['Session context', 'History scoped'],
      confidence: '0.69',
      clarity: 'Previous uncertainty retained',
      reflection: 'Long-term memory not enabled'
    },
    safety: {
      chips: ['Advice bounded', 'No certainty claim'],
      confidence: '0.88',
      clarity: 'Strategic framing without prescription',
      reflection: 'Risk language softened'
    }
  };

  const logicButtons = document.querySelectorAll('.gc-logic-tabs button');
  const logicBoard = document.querySelector('.gc-interface-board');

  logicButtons.forEach(button => {
    button.addEventListener('click', () => {
      const view = logicViews[button.dataset.logic] || logicViews.compose;
      logicButtons.forEach(item => item.classList.toggle('active', item === button));
      logicBoard.dataset.view = button.dataset.logic;
      const chips = logicBoard.querySelectorAll('.state-chip');
      if (chips[0]) chips[0].textContent = view.chips[0];
      if (chips[1]) chips[1].textContent = view.chips[1];
      const notes = logicBoard.querySelectorAll('.insight-panel p');
      if (notes[0]) notes[0].textContent = view.clarity;
      if (notes[1]) notes[1].textContent = view.reflection;
      const score = logicBoard.querySelector('.logic-score strong');
      if (score) score.textContent = view.confidence;
    });
  });
})();
