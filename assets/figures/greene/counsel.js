const { Cam, fit, proj, prism, rrect, circ, fillet, poly, ringAt,
  mk, solid, put, spring, stepS, pointer, register, disposer, rad } = HL;

// A question and a reply: three pieces of counsel lift out of a conversation.
function mount({ stage, svg, read }, value) {
  const bag = disposer(), C = Cam(45, 0.5, 1.15), turn = rad(12);
  const world = (u, v, z) => {
    const x = u * Math.cos(turn) - v * Math.sin(turn);
    const y = u * Math.sin(turn) + v * Math.cos(turn);
    return [(x + y) / Math.SQRT2, (y - x) / Math.SQRT2, z];
  };
  const ask = [[-120, -45], [-5, -45], [-5, 16], [-77, 16], [-99, 34], [-95, 16], [-120, 16]];
  const reply = [[-20, 10], [125, 10], [125, 100], [108, 100], [114, 118], [88, 100], [-20, 100]];
  fit(C, [...ask.map(p => world(...p, 40)), ...reply.map(p => world(...p, 7)), world(-3, 21, 39)], 200, 172);
  const camera = proj(C), P = (u, v, z) => camera(...world(u, v, z));
  const front = q => q.nu * Math.sin(turn) + q.nv * Math.cos(turn) >= 0;
  const g = mk('g', {}, svg), question = mk('g', { 'data-counsel-question': '' }, g);
  const askLift = spring(0), rows = [], rest = [5, 3, 1];
  let reach = value, selected = -1, lastAsk = NaN, touched = false;
  function outline(points, inset = 0) {
    const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    return fillet(points.map(p => [p[0] + Math.sign(cx - p[0]) * inset, p[1] + Math.sign(cy - p[1]) * inset]),
      [10, 10, 10, 2, 1.7, 2, 10], 7);
  }
  function bubble(parent, points, z, active = false) {
    const shape = outline(points), inner = outline(points, 1.7);
    // The opaque top masks the far thickness edge of the thin speech plate.
    mk('path', { d: poly(shape.map(p => P(...p, z - 3))), class: 'sil' }, parent);
    mk('path', { d: poly(shape.map(p => P(...p, z))), class: active ? 'sil hi' : 'sil' }, parent);
    mk('path', { d: poly(inner.map(p => P(...p, z))), class: 'nf lo' }, parent);
  }
  function bar(parent, x0, y0, x1, y1, z, cls = '') {
    const ring = rrect(x0, y0, x1, y1, (y1 - y0) / 2, 7);
    const inner = rrect(x0 + 0.5, y0 + 0.5, x1 - 0.5, y1 - 0.5, (y1 - y0 - 1) / 2, 7);
    const el = solid(parent);
    put(el, prism(P, front, ring, inner, z, z + 1.5));
    if (cls) el.sil.classList.add(cls);
    return el;
  }
  function drawQuestion(h) {
    if (h === lastAsk) return;
    lastAsk = h;
    question.replaceChildren();
    bubble(question, ask, 34 + h, touched && selected === -1);
    bar(question, -104, -29, -26, -24, 34.4 + h);
    bar(question, -104, -12, -53, -7, 34.4 + h);
    for (let i = 0; i < 3; i++) {
      const ring = circ(2, 24).map(q => ({ ...q, u: q.u - 102 + i * 9, v: q.v + 5 }));
      mk('path', { d: poly(ringAt(P, ring, 34.5 + h)), class: 'nf sil' }, question);
    }
  }
  bubble(g, reply, 9);
  for (let i = 0; i < 3; i++) {
    const row = { i, y: 28 + i * 24, sp: spring(rest[i]), drawn: NaN,
      g: mk('g', { 'data-counsel-row': i }, g) };
    row.center = P(45, row.y, 9 + rest[i]);
    rows.push(row);
  }
  function drawRow(row) {
    if (row.drawn === row.sp.x) return;
    row.drawn = row.sp.x;
    row.g.replaceChildren();
    const z = 9.3 + row.sp.x, y = row.y;
    const ring = rrect(-4, y - 7, 108, y + 10, 6, 7);
    const inner = rrect(-2.7, y - 5.7, 106.7, y + 8.7, 4.7, 7);
    const tile = solid(row.g);
    put(tile, prism(P, front, ring, inner, z - 1.4, z));
    tile.sil.classList.toggle('hi', row.i === (touched ? selected : 0));
    for (let k = 0; k <= row.i; k++) {
      const dot = circ(1.5, 20).map(q => ({ ...q, u: q.u + 6 + k * 5, v: q.v + y + 1 }));
      mk('path', { d: poly(ringAt(P, dot, z + 0.3)), class: 'nf sil' }, row.g);
    }
    bar(row.g, 29, y - 1, [94, 81, 89][row.i], y + 3, z + 0.2);
  }
  const B = register(stage, dt => {
    let moving = stepS(askLift, dt);
    drawQuestion(askLift.x);
    rows.forEach(row => { moving = stepS(row.sp, dt) || moving; drawRow(row); });
    return moving;
  });
  bag.add(B.unregister);
  const questionCenter = P(-62, -10, 34);
  function target(p) {
    touched = !!p;
    lastAsk = NaN;
    selected = -1;
    if (p) {
      const choices = [questionCenter, ...rows.map(row => row.center)];
      selected = choices.reduce((best, point, i) => Math.hypot(p[0] - point[0], p[1] - point[1]) <
        Math.hypot(p[0] - choices[best][0], p[1] - choices[best][1]) ? i : best, 0) - 1;
    }
    askLift.t = p && selected === -1 ? reach * 0.45 : 0;
    rows.forEach(row => {
      row.sp.t = p && selected >= 0 ? rest[row.i] + reach * Math.max(0, 1 - Math.abs(row.i - selected) * 0.65) : rest[row.i];
      row.drawn = NaN;
    });
    read.textContent = !p ? 'rest' : selected === -1 ? 'question' : ['perspective', 'options', 'next step'][selected];
    B.wake();
  }
  bag.add(pointer(stage, { move: p => target(p), leave: () => target(null) }));
  bag.add(() => svg.replaceChildren());
  read.textContent = 'rest';
  return { set(v) { reach = v; target(null); }, destroy: bag.dispose };
}

hairline({
  name: 'counsel',
  means: 'A question meets a thoughtful reply; pieces of guidance lift from the conversation.',
  rules: [1, 3, 4, 5, 6, 7, 8, 9, 10],
  range: [6, 14, 22],
  tour: [[105, 125], [240, 168], [235, 225], null],
  mount,
});
