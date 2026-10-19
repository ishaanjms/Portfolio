/*!
 * AgentAvatar v0.1.0
 * A tiny, dependency-free animated SVG avatar for AI agents.
 * Character: the black ghost with the big white eyes.
 *
 * Usage:
 *   const avatar = new AgentAvatar('#mount', { size: 240 });
 *   avatar.setState('thinking');
 *   avatar.react('happy', 1800);      // play a state, then fall back to idle
 *   avatar.followPointer();           // eyes track the cursor
 *   avatar.setLevel(micOrTtsLevel);   // 0..1, drives listening
 *   avatar.handle('tool_start');      // map agent events to states
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AgentAvatar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  function svg(tag, attrs, parent) {
    var n = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ------------------------------------------------------------------ *
   * Geometry (character is drawn in a 470 x 450 space)
   * ------------------------------------------------------------------ */
  var CX = 235;            // horizontal centre of the body
  var FLOOR = 395;         // bottom of the feet (pivot for squash / stretch)
  var EYES = [{ x: 232, y: 180 }, { x: 292, y: 178 }];
  var ERX = 29, ERY = 31;  // eye radii
  var PRX = 11, PRY = 13;  // pupil radii
  var TRAVEL = 15;         // how far a pupil can move from centre

  var TORSO = 'M85 210A150 150 0 0 1 385 210V343H85Z';
  var FEET = [[85, 65], [160, 68], [238, 70], [318, 67]]; // [x, width]
  function footPath(x, w) {
    return 'M' + x + ' 330H' + (x + w) + 'V370A25 25 0 0 1 ' + (x + w - 25) + ' 395H' + (x + 25) +
      'A25 25 0 0 1 ' + x + ' 370Z';
  }

  /* ------------------------------------------------------------------ *
   * Animated parameters
   *   Every state returns target values for some of these. Anything it
   *   leaves out falls back to REST. Keys starting with "$" are direct
   *   additive offsets (use them for oscillations); everything else is
   *   run through a spring so transitions between states are smooth.
   * ------------------------------------------------------------------ */
  var REST = {
    x: 0, y: 0, sx: 1, sy: 1, rot: 0,   // body: offset, squash/stretch, lean (deg)
    lidT: 0, lidB: 0,                   // top lid / bottom lid coverage 0..1
    tilt: 0,                            // lid angle, + = inner corners down (angry), - = up (worried)
    asym: 0,                            // + closes left lid more, - closes right lid more
    eL: 1, eR: 1, ps: 1,                // eye scales, pupil scale
    gx: 0.3, gy: 0.15,                  // gaze -1..1 (default matches the artwork)
    f0: 0, f1: 0, f2: 0, f3: 0          // individual foot lift (negative = up)
  };

  var GROUP = {
    x: 'body', y: 'body', sx: 'body', sy: 'body', rot: 'body',
    lidT: 'eye', lidB: 'eye', tilt: 'eye', asym: 'eye', eL: 'eye', eR: 'eye', ps: 'eye',
    gx: 'gaze', gy: 'gaze',
    f0: 'feet', f1: 'feet', f2: 'feet', f3: 'feet'
  };

  // [stiffness, damping]. Lower damping = more bounce.
  var SPRING = { body: [170, 13], eye: [380, 30], gaze: [150, 20], feet: [300, 22] };

  /* ------------------------------------------------------------------ *
   * States
   *   update(t, c) -> params
   *     t : seconds since the state started
   *     c : { time, level }   (level is null unless setLevel() was called)
   *   look      false = ignore pointer / lookAt()
   *   wander    amount of idle eye wandering (0..1)
   *   blink     false = no automatic blinking
   *   breath    breathing amplitude
   *   indicators  floating symbols to show
   * ------------------------------------------------------------------ */
  var STATES = {
    idle: {
      wander: 1, breath: 0.012,
      update: function () { return {}; }
    },

    listening: {
      wander: 0.3, breath: 0.015,
      update: function (t, c) {
        var l = c.level == null ? 0.15 + 0.1 * Math.sin(c.time * 3) : c.level;
        return { rot: 3.5, sy: 1.03, sx: 0.99, eL: 1.1 + l * 0.12, eR: 1.1 + l * 0.12, ps: 1.15, gx: 0, gy: -0.05 };
      }
    },

    thinking: {
      look: false, indicators: ['dots'], breath: 0.01,
      update: function (t) {
        return {
          gx: 0.55 + 0.3 * Math.sin(t * 0.9), gy: -0.7 + 0.12 * Math.sin(t * 1.7),
          lidT: 0.1, tilt: 6, asym: 0.12, rot: -3, sy: 0.99, ps: 0.95
        };
      }
    },

    working: {
      look: false, indicators: ['spinner'], breath: 0.004,
      update: function (t) {
        var w = t * 13, o = {};
        o.tilt = 10; o.lidT = 0.26; o.ps = 0.95; o.sy = 0.98; o.sx = 1.01;
        o.gx = Math.sin(t * 2.6) > 0 ? 0.75 : -0.75; // eyes scan left / right
        o.gy = 0.2;
        o.$rot = Math.sin(w) * 0.9;
        o.$y = Math.abs(Math.sin(w)) * -1.5;
        for (var i = 0; i < 4; i++) o['$f' + i] = -Math.max(0, Math.sin(w + i * Math.PI / 2)) * 7; // feet shuffle
        return o;
      }
    },

    happy: {
      wander: 0.25, indicators: ['sparkle'], breath: 0.004,
      update: function (t) {
        var a = Math.abs(Math.sin(t * 6)), land = Math.pow(1 - a, 6);
        return {
          lidB: 0.5, ps: 1.1, eL: 1.04, eR: 1.04, gx: 0, gy: 0,
          $y: -a * 12, $sy: 0.06 * a - 0.1 * land, $sx: -0.04 * a + 0.06 * land, $rot: Math.sin(t * 3) * 3
        };
      }
    },

    surprised: {
      look: false, indicators: ['bang'], breath: 0.004,
      update: function (t) {
        return {
          eL: 1.22, eR: 1.22, ps: 0.55, sy: 1.07, sx: 0.97, gx: 0, gy: 0,
          $y: -26 * Math.sin(clamp(t / 0.4, 0, 1) * Math.PI)
        };
      }
    },

    confused: {
      look: false, indicators: ['q'], breath: 0.01,
      update: function (t) {
        return { rot: Math.sin(t * 1.7) * 6, asym: 0.4, eL: 0.95, eR: 1.18, gx: Math.sin(t * 1.7 + 1) * 0.7, gy: 0.1, tilt: -3 };
      }
    },

    error: {
      look: false, indicators: ['bang'], indColor: 'error', breath: 0.006,
      update: function (t) {
        return {
          tilt: -12, lidT: 0.12, ps: 0.7, sy: 0.97, gx: 0, gy: 0.35, eL: 1.05, eR: 1.05,
          $x: Math.sin(t * 45) * 5 * Math.exp(-t * 3.2),
          $rot: Math.sin(t * 38) * 2 * Math.exp(-t * 3)
        };
      }
    },

    sad: {
      look: false, breath: 0.008,
      update: function (t) {
        return { sy: 0.94, sx: 1.03, tilt: -15, lidT: 0.28, gx: 0, gy: 0.65, ps: 1.12, $rot: Math.sin(t) * 1.2 };
      }
    },

    sleeping: {
      look: false, blink: false, indicators: ['zzz'], breath: 0.03, breathRate: 1.1,
      update: function () {
        return { sy: 0.9, sx: 1.05, lidT: 0.86, lidB: 0, rot: 3, gx: 0, gy: 0.3 };
      }
    }
  };

  var ALIASES = {
    think: 'thinking', listen: 'listening',
    busy: 'working', tool: 'working', sleep: 'sleeping', fail: 'error', ok: 'happy',
    surprise: 'surprised', confuse: 'confused'
  };

  // agent-lifecycle events -> [state, auto-revert ms]
  var EVENTS = {
    user_speech_start: ['listening'], listen: ['listening'],
    user_speech_end: ['thinking'], thinking: ['thinking'], message_sent: ['thinking'],
    tool_start: ['working'], tool_end: ['thinking'],
    success: ['happy', 1800], done: ['happy', 1800],
    error: ['error', 2800], unclear: ['confused', 2400],
    idle: ['idle'], sleep: ['sleeping'], wake: ['surprised', 900]
  };

  /* ------------------------------------------------------------------ *
   * AgentAvatar
   * ------------------------------------------------------------------ */
  function AgentAvatar(target, options) {
    if (!(this instanceof AgentAvatar)) return new AgentAvatar(target, options);

    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error('AgentAvatar: mount element not found');

    var opts = options || {};
    var theme = opts.theme ? AgentAvatar.themes[opts.theme] : null;
    if (opts.theme && !theme) console.warn('AgentAvatar: unknown theme "' + opts.theme + '"');

    this.options = Object.assign({
      size: null,                 // px width; null = fill the container
      state: 'idle',
      color: '#000000',           // body
      eyeColor: '#ffffff',
      accent: '#7c5cff',          // thinking dots, spinner, sparkles, "?"
      errorColor: '#ff4d4d',
      shadow: false,              // soft ground shadow
      autoBlink: true,
      followPointer: false,
      respectReducedMotion: true,
      pupilColor: null            // defaults to the body colour
    }, theme || {}, opts);
    if (!this.options.pupilColor) this.options.pupilColor = this.options.color;

    this._id = ++uid;
    this._listeners = {};
    this._time = 0;
    this._last = null;
    this._stateStart = 0;
    this._revertAt = null;
    this._revertTo = 'idle';
    this._nextBlink = rand(1.5, 3.5);
    this._blinkStart = -10;
    this._wanderAt = 0;
    this._wander = { x: 0, y: 0 };
    this._lookOverride = null;
    this._pointer = null;
    this._lv = 0;
    this.level = null;
    this._paused = false;

    var reduce = typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._motion = this.options.respectReducedMotion && reduce ? 0.35 : 1;

    // spring + direct-offset state
    this._v = {}; this._vel = {}; this._d = {};
    for (var k in REST) { this._v[k] = REST[k]; this._vel[k] = 0; }

    this._build(host);

    this._state = null;
    this.setState(this.options.state in STATES ? this.options.state : 'idle');

    if (this.options.followPointer) this.followPointer(true);

    var self = this;
    this._raf = null;
    this._loop = function (now) {
      self._raf = null;
      if (self._paused) return;
      self._tick(now);
      if (!self._paused) self._raf = requestAnimationFrame(self._loop);
    };
    this.resume();
  }

  AgentAvatar.states = Object.keys(STATES);

  // Colour presets: new AgentAvatar(el, { theme: 'coral' })
  AgentAvatar.themes = {
    ink:       { color: '#000000', pupilColor: '#000000', eyeColor: '#ffffff', accent: '#7c5cff' },
    coral:     { color: '#ff5a4d', pupilColor: '#2a0c09', eyeColor: '#ffffff', accent: '#ff5a4d', errorColor: '#b3001b' },
    cobalt:    { color: '#2f5bff', pupilColor: '#0a1440', eyeColor: '#ffffff', accent: '#2f5bff' },
    mint:      { color: '#1fbf8a', pupilColor: '#05281d', eyeColor: '#ffffff', accent: '#14946a' },
    sunflower: { color: '#ffc629', pupilColor: '#2b2000', eyeColor: '#ffffff', accent: '#d99a00', errorColor: '#e5322d' }
  };

  /* ---------- DOM ---------- */
  AgentAvatar.prototype._build = function (host) {
    var o = this.options, id = this._id;
    this.host = host;

    var root = svg('svg', {
      viewBox: '35 -30 400 450', role: 'img', 'aria-label': 'Ghost avatar',
      xmlns: SVG_NS
    });
    root.style.display = 'block';
    root.style.overflow = 'visible';
    if (o.size) { root.style.width = o.size + 'px'; root.style.height = 'auto'; }
    else { root.style.width = '100%'; root.style.height = 'auto'; }
    this.svg = root;

    var defs = svg('defs', {}, root);

    this._shadow = svg('ellipse', { cx: CX, cy: FLOOR + 10, rx: 130, ry: 11, fill: o.color, opacity: 0 }, root);
    if (o.shadow) this._shadow.setAttribute('opacity', 0.12);

    // body (squash / stretch happens here, pivoting on the feet)
    this._body = svg('g', {}, root);
    svg('path', { d: TORSO, fill: o.color }, this._body);
    this._feet = FEET.map(function (f) {
      return svg('path', { d: footPath(f[0], f[1]), fill: o.color }, this._body);
    }, this);

    this._face = svg('g', {}, this._body);
    this._eyes = [0, 1].map(function (i) {
      var pos = EYES[i];
      var g = svg('g', {}, this._face);
      var cid = 'aa' + id + '-eye' + i;
      var cp = svg('clipPath', { id: cid }, defs);
      svg('ellipse', { rx: ERX, ry: ERY }, cp);
      var inner = svg('g', { 'clip-path': 'url(#' + cid + ')' }, g);
      svg('ellipse', { rx: ERX, ry: ERY, fill: o.eyeColor }, inner);
      var pupil = svg('ellipse', { rx: PRX, ry: PRY, fill: o.pupilColor }, inner);
      var lidTG = svg('g', {}, inner);
      var lidT = svg('rect', { x: -50, y: -100, width: 100, height: 100, fill: o.color }, lidTG);
      var lidB = svg('ellipse', { rx: 44, ry: 34, cy: 67, fill: o.color }, inner);
      return { pos: pos, g: g, pupil: pupil, lidTG: lidTG, lidT: lidT, lidB: lidB };
    }, this);

    this._buildIndicators(root);
    host.appendChild(root);
  };

  AgentAvatar.prototype._buildIndicators = function (root) {
    var A = this.options.accent;
    var ind = this._ind = {};
    function group(name) {
      var g = svg('g', { opacity: 0, visibility: 'hidden' }, root);
      ind[name] = { g: g, alpha: 0, want: 0, parts: [] };
      return ind[name];
    }
    var txt = { 'font-family': 'ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif', 'font-weight': 800, 'text-anchor': 'middle', fill: A };

    var d = group('dots');
    for (var i = 0; i < 3; i++) d.parts.push(svg('circle', { cx: 195 + i * 40, cy: 24, r: 9, fill: A }, d.g));

    var s = group('spinner');
    s.parts.push(svg('circle', {
      cx: 235, cy: 26, r: 17, fill: 'none', stroke: A, 'stroke-width': 6,
      'stroke-linecap': 'round', 'stroke-dasharray': '58 50'
    }, s.g));

    var z = group('zzz');
    for (i = 0; i < 3; i++) {
      var t = svg('text', Object.assign({ 'font-size': 30 }, txt), z.g);
      t.textContent = 'z';
      z.parts.push(t);
    }

    var q = group('q');
    var qt = svg('text', Object.assign({ x: 330, y: 70, 'font-size': 72 }, txt), q.g);
    qt.textContent = '?'; q.parts.push(qt);

    var b = group('bang');
    var bt = svg('text', Object.assign({ x: 335, y: 75, 'font-size': 76 }, txt), b.g);
    bt.textContent = '!'; b.parts.push(bt);

    var sp = group('sparkle');
    var star = 'M0 -1Q0.12 -0.12 1 0Q0.12 0.12 0 1Q-0.12 0.12 -1 0Q-0.12 -0.12 0 -1Z';
    sp.parts.push(svg('path', { d: star, fill: A }, sp.g));
    sp.parts.push(svg('path', { d: star, fill: A }, sp.g));
  };

  AgentAvatar.prototype._setIndicatorColor = function (kind) {
    var color = kind === 'error' ? this.options.errorColor : this.options.accent;
    for (var name in this._ind) {
      this._ind[name].parts.forEach(function (p) {
        if (name === 'spinner') p.setAttribute('stroke', color); else p.setAttribute('fill', color);
      });
    }
  };

  /* ---------- Public API ---------- */

  // Switch state. opts.duration (ms) returns to opts.then (default 'idle') afterwards.
  AgentAvatar.prototype.setState = function (name, opts) {
    name = ALIASES[name] || name;
    if (!STATES[name]) { console.warn('AgentAvatar: unknown state "' + name + '"'); return this; }
    opts = opts || {};
    var prev = this._state;
    this._state = name;
    this._stateStart = this._time;
    this._revertAt = opts.duration ? this._time + opts.duration / 1000 : null;
    this._revertTo = opts.then || 'idle';
    var st = STATES[name];
    this._setIndicatorColor(st.indColor);
    for (var k in this._ind) this._ind[k].want = (st.indicators || []).indexOf(k) >= 0 ? 1 : 0;
    this.svg.setAttribute('aria-label', 'Ghost avatar, ' + name);
    if (prev !== name) this._emit('state', name, prev);
    return this;
  };

  AgentAvatar.prototype.getState = function () { return this._state; };

  // Play a state briefly, then return to idle.
  AgentAvatar.prototype.react = function (name, ms) {
    return this.setState(name, { duration: ms || 1600 });
  };

  // Map an agent lifecycle event to a state (see EVENTS above).
  AgentAvatar.prototype.handle = function (eventName) {
    var m = EVENTS[eventName];
    if (!m) { console.warn('AgentAvatar: unknown event "' + eventName + '"'); return this; }
    return this.setState(m[0], m[1] ? { duration: m[1] } : undefined);
  };

  // Audio level 0..1 (mic input while listening). Pass null to go back to the default pulse.
  AgentAvatar.prototype.setLevel = function (v) {
    this.level = v == null ? null : clamp(v, 0, 1);
    return this;
  };

  // Look somewhere for a while. x, y in -1..1.
  AgentAvatar.prototype.lookAt = function (x, y, ms) {
    this._lookOverride = { x: clamp(x, -1, 1), y: clamp(y, -1, 1), until: this._time + (ms || 1500) / 1000 };
    return this;
  };

  AgentAvatar.prototype.blink = function () { this._blinkStart = this._time; return this; };

  AgentAvatar.prototype.followPointer = function (on) {
    var self = this;
    if (on === false) {
      if (this._onMove) window.removeEventListener('pointermove', this._onMove);
      this._onMove = null; this._pointer = null;
      return this;
    }
    if (this._onMove) return this;
    this._onMove = function (e) { self._pointer = { x: e.clientX, y: e.clientY, at: self._time }; };
    window.addEventListener('pointermove', this._onMove, { passive: true });
    return this;
  };

  AgentAvatar.prototype.on = function (evt, fn) {
    (this._listeners[evt] = this._listeners[evt] || []).push(fn);
    return this;
  };
  AgentAvatar.prototype.off = function (evt, fn) {
    this._listeners[evt] = (this._listeners[evt] || []).filter(function (f) { return f !== fn; });
    return this;
  };
  AgentAvatar.prototype._emit = function (evt) {
    var args = Array.prototype.slice.call(arguments, 1);
    (this._listeners[evt] || []).forEach(function (fn) { fn.apply(null, args); });
  };

  // Cancel the frame loop as well as the animation when an artifact is offscreen.
  AgentAvatar.prototype.pause = function () {
    this._paused = true;
    if (this._raf != null) cancelAnimationFrame(this._raf);
    this._raf = null;
    return this;
  };
  AgentAvatar.prototype.resume = function () {
    this._paused = false;
    this._last = null;
    if (this._raf == null) this._raf = requestAnimationFrame(this._loop);
    return this;
  };

  // A settled expression for reduced-motion views, with no scheduled frames.
  AgentAvatar.prototype.renderStill = function () {
    this.pause();
    var out = STATES[this._state].update(0, { time: 0, level: this.level });
    var pose = {};
    for (var k in REST) pose[k] = out[k] != null ? out[k] : REST[k];
    for (var name in this._ind) this._ind[name].alpha = this._ind[name].want;
    this._render(pose, 0, 0, 1);
    return this;
  };

  AgentAvatar.prototype.destroy = function () {
    this.pause();
    this.followPointer(false);
    if (this.svg.parentNode) this.svg.parentNode.removeChild(this.svg);
    this._listeners = {};
  };

  /* ---------- Animation loop ---------- */
  AgentAvatar.prototype._tick = function (now) {
    if (this._paused) return;
    if (this._last == null) this._last = now;
    var dt = Math.min((now - this._last) / 1000, 1 / 30);
    this._last = now;
    if (dt <= 0) return;
    this._time += dt;
    var time = this._time;

    if (this._revertAt != null && time >= this._revertAt) this.setState(this._revertTo);

    var st = STATES[this._state];
    var ts = time - this._stateStart;

    // audio level, smoothed
    if (this.level != null) this._lv += (this.level - this._lv) * (1 - Math.exp(-25 * dt));
    var out = st.update(ts, { time: time, level: this.level == null ? null : this._lv });

    // split into spring targets and direct offsets
    var target = {}, direct = {}, k;
    for (k in REST) target[k] = REST[k];
    for (k in out) {
      if (k.charAt(0) === '$') direct[k.slice(1)] = out[k]; else target[k] = out[k];
    }

    // breathing
    var amp = st.breath != null ? st.breath : 0.012;
    var br = Math.sin(time * (st.breathRate || 2.2)) * amp;
    direct.sy = (direct.sy || 0) + br;
    direct.sx = (direct.sx || 0) - br * 0.5;

    // gaze priority: lookAt() > pointer > state > wandering
    var gaze = this._resolveGaze(st, out, time);
    target.gx = gaze.x; target.gy = gaze.y;

    // blink
    var blink = 0;
    if (st.blink !== false && this.options.autoBlink && time >= this._nextBlink) {
      this._blinkStart = time;
      this._nextBlink = time + (Math.random() < 0.18 ? 0.3 : rand(2.2, 6));
    }
    var bt = time - this._blinkStart;
    if (bt >= 0 && bt < 0.17) blink = bt < 0.07 ? bt / 0.07 : 1 - (bt - 0.07) / 0.1;

    // integrate springs
    var sub = 2, h = dt / sub, g, kc, i;
    for (i = 0; i < sub; i++) {
      for (k in REST) {
        g = SPRING[GROUP[k]];
        this._vel[k] += ((target[k] - this._v[k]) * g[0] - this._vel[k] * g[1]) * h;
        this._v[k] += this._vel[k] * h;
      }
    }

    // direct offsets, low-passed so state changes never pop
    var keys = {}, m = this._motion;
    for (k in this._d) keys[k] = 1;
    for (k in direct) keys[k] = 1;
    var a = 1 - Math.exp(-40 * dt);
    var v = {};
    for (k in REST) v[k] = this._v[k];
    for (k in keys) {
      this._d[k] = (this._d[k] || 0) + ((direct[k] || 0) * m - (this._d[k] || 0)) * a;
      if (v[k] !== undefined) v[k] += this._d[k];
    }

    this._render(v, blink, time, dt);
  };

  AgentAvatar.prototype._resolveGaze = function (st, out, time) {
    var gx = out.gx != null ? out.gx : 0, gy = out.gy != null ? out.gy : 0;

    if (st.look !== false) {
      if (this._lookOverride && time < this._lookOverride.until) {
        return { x: this._lookOverride.x, y: this._lookOverride.y };
      }
      var p = this._pointer;
      if (p && time - p.at < 5) {
        var r = this.svg.getBoundingClientRect();
        var cx = r.left + r.width * 0.5, cy = r.top + r.height * 0.42;
        var s = Math.max(r.width * 1.5, 300);
        return { x: clamp((p.x - cx) / s, -1, 1), y: clamp((p.y - cy) / s, -1, 1) };
      }
    }

    if (st.wander) {
      if (time >= this._wanderAt) {
        var calm = Math.random() < 0.3;
        this._wander = calm ? { x: 0, y: 0 } : { x: rand(-0.85, 0.85), y: rand(-0.4, 0.45) };
        this._wanderAt = time + rand(1.2, 3.6);
      }
      return { x: gx + this._wander.x * st.wander, y: gy + this._wander.y * st.wander };
    }
    return { x: gx, y: gy };
  };

  AgentAvatar.prototype._render = function (v, blink, time, dt) {
    // body: scale + rotate about the middle of the feet
    this._body.setAttribute('transform',
      'translate(' + (CX + v.x) + ' ' + (FLOOR + v.y) + ') rotate(' + v.rot + ') scale(' + v.sx + ' ' + v.sy + ') translate(' + (-CX) + ' ' + (-FLOOR) + ')');

    for (var i = 0; i < 4; i++) this._feet[i].setAttribute('transform', 'translate(0 ' + v['f' + i] + ')');

    // shadow
    var lift = clamp(-v.y, 0, 40);
    this._shadow.setAttribute('transform', 'translate(' + (CX * (1 - (1 - lift / 160))) + ' 0) scale(' + (1 - lift / 160) + ' 1)');
    if (this.options.shadow) this._shadow.setAttribute('opacity', (0.12 * (1 - lift / 70)).toFixed(3));

    // face shifts slightly with gaze for a hint of depth
    var gx = clamp(v.gx, -1.2, 1.2), gy = clamp(v.gy, -1.2, 1.2);
    this._face.setAttribute('transform', 'translate(' + (gx * 5).toFixed(2) + ' ' + (gy * 3.5).toFixed(2) + ')');

    var px = gx, py = gy, len = Math.hypot(px, py);
    if (len > 1) { px /= len; py /= len; }

    var lids = [clamp(v.lidT + v.asym, 0, 1), clamp(v.lidT - v.asym, 0, 1)];
    var tilts = [v.tilt, -v.tilt];
    var scales = [v.eL, v.eR];

    for (i = 0; i < 2; i++) {
      var e = this._eyes[i];
      var cover = Math.max(lids[i], blink);
      e.g.setAttribute('transform', 'translate(' + e.pos.x + ' ' + e.pos.y + ') scale(' + scales[i].toFixed(3) + ')');
      e.pupil.setAttribute('transform', 'translate(' + (px * TRAVEL).toFixed(2) + ' ' + (py * TRAVEL).toFixed(2) + ') scale(' + v.ps.toFixed(3) + ')');
      e.lidTG.setAttribute('transform', 'rotate(' + tilts[i].toFixed(2) + ')');
      e.lidT.setAttribute('height', (-33 + cover * 66 + 100).toFixed(2));
      e.lidB.setAttribute('cy', (33 - clamp(v.lidB, 0, 1) * 41 + 34).toFixed(2));
    }

    this._renderIndicators(time, dt);
  };

  AgentAvatar.prototype._renderIndicators = function (time, dt) {
    var k = 1 - Math.exp(-12 * dt), I = this._ind, n, ind, p;
    for (n in I) {
      ind = I[n];
      ind.alpha += (ind.want - ind.alpha) * k;
      if (ind.alpha < 0.01 && ind.want === 0) {
        if (ind.g.getAttribute('visibility') !== 'hidden') ind.g.setAttribute('visibility', 'hidden');
        continue;
      }
      ind.g.setAttribute('visibility', 'visible');
      ind.g.setAttribute('opacity', ind.alpha.toFixed(3));
    }

    if (I.dots.alpha > 0.01) {
      I.dots.parts.forEach(function (c, i) {
        c.setAttribute('cy', (24 - 9 * Math.max(0, Math.sin(time * 6 - i * 0.8))).toFixed(2));
      });
    }
    if (I.spinner.alpha > 0.01) {
      I.spinner.parts[0].setAttribute('transform', 'rotate(' + ((time * 400) % 360).toFixed(1) + ' 235 26)');
    }
    if (I.zzz.alpha > 0.01) {
      I.zzz.parts.forEach(function (t, i) {
        p = (time * 0.3 + i / 3) % 1;
        var s = 0.6 + p * 0.7;
        t.setAttribute('transform', 'translate(' + (322 + p * 34).toFixed(1) + ' ' + (80 - p * 60).toFixed(1) + ') scale(' + s.toFixed(2) + ')');
        t.setAttribute('opacity', Math.sin(p * Math.PI).toFixed(2));
      });
    }
    if (I.q.alpha > 0.01) {
      I.q.parts[0].setAttribute('transform', 'rotate(' + (Math.sin(time * 3) * 8).toFixed(1) + ' 330 50)');
    }
    if (I.bang.alpha > 0.01) {
      I.bang.parts[0].setAttribute('transform', 'translate(0 ' + (Math.sin(time * 10) * 2).toFixed(2) + ')');
    }
    if (I.sparkle.alpha > 0.01) {
      var a = 14 + 5 * Math.sin(time * 5), b = 11 + 4 * Math.sin(time * 5 + 2);
      I.sparkle.parts[0].setAttribute('transform', 'translate(105 85) rotate(' + (time * 40 % 360).toFixed(1) + ') scale(' + a.toFixed(2) + ')');
      I.sparkle.parts[1].setAttribute('transform', 'translate(372 55) rotate(' + (-time * 40 % 360).toFixed(1) + ') scale(' + b.toFixed(2) + ')');
    }
  };

  return AgentAvatar;
});
