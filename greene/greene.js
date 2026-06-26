(function () {
  const pillarCards = document.querySelectorAll('.gc-pillar-map button');
  const stageNodes = document.querySelectorAll('.gc-pillar-node');
  const pillarDetail = document.querySelector('.gc-pillar-detail');
  const pillars = {
    foundation: {
      title: 'Foundation',
      copy: 'Foundation defines the dependable technical base of the AI product: structured input, model orchestration, backend reliability, and schema decisions that make the system trustworthy before it becomes expressive.',
      labels: ['Schemas', 'Model', 'Backend', 'Reliability']
    },
    behaviour: {
      title: 'Behaviour',
      copy: 'Behaviour controls how the system varies: tone, depth, response mode, and calibrated non-determinism make the AI feel adaptive without becoming unpredictable.',
      labels: ['Tone', 'Depth', 'Variation', 'Control']
    },
    connection: {
      title: 'Connection',
      copy: 'Connection makes the interaction legible: conversational UI, context memory, user agency, and trust signals help users understand why a response fits their situation.',
      labels: ['Input', 'Memory', 'Agency', 'Trust']
    },
    purpose: {
      title: 'Purpose',
      copy: 'Purpose gives the AI boundaries: ethical constraints, persona alignment, governance, and optimization goals define what the system should and should not pursue.',
      labels: ['Ethics', 'Persona', 'Boundaries', 'Alignment']
    },
    evolution: {
      title: 'Evolution',
      copy: 'Evolution accounts for change over time: session history, feedback loops, model updates, and behavior monitoring shape how the product matures responsibly.',
      labels: ['History', 'Feedback', 'Updates', 'Drift']
    }
  };

  pillarCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.pillar;
      const pillar = pillars[key] || pillars.foundation;
      pillarCards.forEach(item => {
        const isActive = item === card;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      if (pillarDetail) {
        pillarDetail.querySelector('h3').textContent = pillar.title;
        pillarDetail.querySelector('p').textContent = pillar.copy;
      }
      pillar.labels.forEach((label, index) => {
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

})();
