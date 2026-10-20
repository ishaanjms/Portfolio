const {
  Cam, fit, proj, facing, circ, prism, rrect, ringAt, poly, open,
  mk, solid, put, spring, stepS, pointer, register, disposer, clamp, rad,
} = HL;

// A globe on a timing dial: a single longitude drifts from a fixed reference.
// The motion is a visual metaphor, not a measured Earth-rotation forecast.
function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.55);
  fit(C, [[-75, -75, 0], [75, 75, 5], [-75, 75, 0], [75, -75, 0], [0, 0, 120]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk('g', {}, svg), R = 47, Z = 66, tilt = rad(23.5);
  let reach = value, lastAngle = NaN, over = null;
  const angle = spring(rad(18));
  const circle = (r) => circ(r, 96);
  put(solid(g), prism(P, front, circle(75), circle(73), 0, 5));
  mk('path', { d: poly(ringAt(P, circle(64), 5.1)), class: 'nf lo' }, g);
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2, long = i % 4 === 0, r = long ? 63 : 67;
    const points = rrect(r, -0.65, 71, 0.65, 0.6, 3).map(q => ({
      u: q.u * Math.cos(a) - q.v * Math.sin(a),
      v: q.u * Math.sin(a) + q.v * Math.cos(a),
      nu: q.nu * Math.cos(a) - q.nv * Math.sin(a),
      nv: q.nu * Math.sin(a) + q.nv * Math.cos(a),
    }));
    mk('path', { d: poly(ringAt(P, points, 5.2)), class: 'nf sil' }, g);
  }
  const reference = rrect(51, -1.4, 62, 1.4, 1.2, 4).map(q => ({
    ...q, u: (q.u - q.v) / Math.SQRT2, v: (q.u + q.v) / Math.SQRT2,
  }));
  mk('path', { d: poly(ringAt(P, reference, 5.3)), class: 'nf sil' }, g);
  put(solid(g), prism(P, front, circle(15), circle(13.7), 5, 10));
  put(solid(g), prism(P, front, circle(5), circle(4.3), 10, 20));

  const earth = (lon, lat) => {
    const x = R * Math.cos(lat) * Math.cos(lon);
    const y = R * Math.cos(lat) * Math.sin(lon);
    const z = R * Math.sin(lat);
    return [x * Math.cos(tilt) + z * Math.sin(tilt), y, Z - x * Math.sin(tilt) + z * Math.cos(tilt)];
  };
  const north = earth(0, Math.PI / 2), south = earth(0, -Math.PI / 2);
  mk('path', { d: open([P(...south), P(...north)]), class: 'nf sil' }, g);
  const center = P(0, 0, Z);
  mk('path', { d: poly(Array.from({ length: 96 }, (_, i) => {
    const a = i / 96 * Math.PI * 2;
    return [center[0] + R * C.S * Math.cos(a), center[1] + R * C.S * Math.sin(a)];
  })), class: 'sil' }, g);
  // Keep only the front hemisphere; the far grid must not show through Earth.
  function visiblePath(points) {
    let path = '', run = [];
    for (const q of [...points, null]) {
      const visible = q && (q[0] * 0.612372 + q[1] * 0.612372 + (q[2] - Z) * 0.5 >= 0);
      if (visible) run.push(P(...q));
      else if (run.length) { path += open(run); run = []; }
    }
    return path;
  }
  [-50, -25, 0, 25, 50].forEach(lat => {
    mk('path', { class: 'nf lo', d: visiblePath(Array.from({ length: 193 }, (_, j) => earth(j / 192 * Math.PI * 2, rad(lat)))) }, g);
  });
  const meridians = Array.from({ length: 8 }, () => mk('path', { class: 'nf lo' }, g));
  const prime = mk('path', { class: 'nf hi' }, g);
  const line = (lon) => visiblePath(Array.from({ length: 97 }, (_, i) => earth(lon, -Math.PI / 2 + i / 96 * Math.PI)));
  function draw(a) {
    if (a === lastAngle) return;
    lastAngle = a;
    meridians.forEach((el, i) => el.setAttribute('d', line(i / 8 * Math.PI * 2 + a)));
    prime.setAttribute('d', line(Math.PI / 4 + a));
  }
  // The near pole cap sits on top, the far cap is hidden behind the globe.
  const cap = solid(g);
  put(cap, prism(P, front, circle(2.4).map(q => ({ ...q, u: q.u + north[0], v: q.v + north[1] })),
    circle(1.8).map(q => ({ ...q, u: q.u + north[0], v: q.v + north[1] })), north[2], north[2] + 3));
  const B = register(stage, (dt) => {
    const moving = stepS(angle, dt);
    draw(angle.x);
    return moving;
  });
  bag.add(B.unregister);
  function target() {
    angle.t = over ? rad(clamp((over[0] - 200) / 95, -1, 1) * reach) : rad(18);
    read.textContent = over ? (Math.abs(angle.t) < rad(2) ? 'aligned' : angle.t > 0 ? 'ahead' : 'behind') : 'rest';
    B.wake();
  }
  bag.add(pointer(stage, {
    move: p => { over = p; target(); },
    leave: () => { over = null; target(); },
  }));
  bag.add(() => svg.replaceChildren());
  read.textContent = 'rest';
  return { set(v) { reach = v; target(); }, destroy: bag.dispose };
}

hairline({
  name: 'earth-time',
  means: 'A globe turns above a timing dial; its reference meridian drifts and returns to alignment.',
  rules: [1, 3, 4, 5, 6, 7, 8, 10],
  range: [12, 28, 42],
  tour: [[145, 166], [270, 166], [200, 166], null],
  mount,
});
