// ─── Home page — typewriter ──────────────────────────────────────────────────
// Each phrase completes the headline: "Interaction Designer [phrase]"
// Colors run from accent (purple) through mid-tones, ending at primary (dark/black).
// Color stops are character-position-based: once cursor passes `from`, color shifts.

const HERO_PHRASES = [
  {
    text: "creating Practical Interfaces for AI tools and Complex Systems",
    // "creating "(0) "Practical "(9) "Interfaces "(19) "for AI tools "(30) "and Complex Systems"(43)
    colors: [
      { from: 0,  color: COLORS.accent  },
      { from: 9,  color: COLORS.blue    },
      { from: 19, color: COLORS.green   },
      { from: 30, color: COLORS.amber   },
      { from: 43, color: COLORS.primary },
    ],
  },
  {
    text: "designing experiences where Humans and Technology Connect",
    // "designing "(0) "experiences "(10) "where "(22) "Humans and "(28) "Technology Connect"(39)
    colors: [
      { from: 0,  color: COLORS.accent  },
      { from: 10, color: COLORS.teal    },
      { from: 22, color: COLORS.rose    },
      { from: 28, color: COLORS.orange  },
      { from: 39, color: COLORS.primary },
    ],
  },
  {
    text: "bridging Design and Engineering through thoughtful Products",
    // "bridging "(0) "Design "(9) "and Engineering "(16) "through "(32) "thoughtful Products"(40)
    colors: [
      { from: 0,  color: COLORS.accent  },
      { from: 9,  color: COLORS.green   },
      { from: 16, color: COLORS.blue    },
      { from: 32, color: COLORS.amber   },
      { from: 40, color: COLORS.primary },
    ],
  },
];

const typedEl   = document.getElementById('typed-text');
const cursorEl  = document.querySelector('.cursor');
let currentIdx  = Math.floor(Math.random() * HERO_PHRASES.length);

function cursorColor(phrase, pos) {
  let color = phrase.colors[0].color;
  for (const stop of phrase.colors) { if (pos >= stop.from) color = stop.color; }
  return color;
}

function typePhrase(phrase, onDone) {
  let i = 0;
  (function step() {
    if (i <= phrase.text.length) {
      typedEl.textContent = phrase.text.slice(0, i);
      cursorEl.style.color = cursorColor(phrase, i);
      i++;
      setTimeout(step, i === 1 ? TIMING.initialDelay : TIMING.typeSpeed);
    } else {
      setTimeout(onDone, TIMING.pauseAfterType);
    }
  })();
}

function erasePhrase(onDone) {
  (function step() {
    const current = typedEl.textContent;
    if (current.length > 0) {
      typedEl.textContent = current.slice(0, -1);
      setTimeout(step, TIMING.eraseSpeed);
    } else {
      setTimeout(onDone, TIMING.pauseBeforeType);
    }
  })();
}

function pickNext() {
  let next;
  do { next = Math.floor(Math.random() * HERO_PHRASES.length); }
  while (next === currentIdx && HERO_PHRASES.length > 1);
  return (currentIdx = next);
}

function loop() {
  const phrase = HERO_PHRASES[pickNext()];
  typePhrase(phrase, () => erasePhrase(loop));
}

// Kick off with a random phrase, then loop
typePhrase(HERO_PHRASES[currentIdx], () => erasePhrase(loop));

// ─── Hero watermark parallax ──────────────────────────────────────────────────
const watermark = document.querySelector('.hero-watermark');
if (watermark) {
  window.addEventListener('scroll', () => {
    watermark.style.transform = `translateY(calc(-50% + ${window.scrollY * -0.3}px))`;
  }, { passive: true });
}
