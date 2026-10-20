const { Cam, fit, proj, facing, rrect, prism, rings, ringAt, run, poly,
  open, hull, fillet, rad, mk, solid, put, tween, tset, tval, tdone,
  pointer, register, disposer } = HL;

// A shallow archive tray of art prints, each with a different composition.
function mount({ stage, svg, read }, value) {
  const N = 6, W = 88, H = 64, GAP = 15, WH = 14;
  const bag = disposer(), C = Cam(45, 0.5, 1.62);
  fit(C, [[-6, -14, -7], [W + 6, 96, 0], [W + 6, -14, 0], [-6, 96, 0], [0, -14, H + 22]], 200, 166);
  const P = proj(C), front = facing(C), g = mk('g', {}, svg);
  const [outer, inner] = rings(-6, -14, W + 6, 96, 7, 2);
  put(solid(g), prism(P, front, outer, inner, -7, 0));
  mk('path', { d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), class: 'sil' }, g);
  mk('path', { d: poly(ringAt(P, inner, WH)), class: 'nf' }, g);
  const shape = fillet([[0, 0], [W, 0], [W, H], [0, H]], [4, 4, 4, 4], 7);
  const cards = [];
  const circle = (x, y, r) => Array.from({ length: 65 }, (_, i) => {
    const a = i / 64 * Math.PI * 2;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r];
  });
  const rect = (x0, y0, x1, y1, radius = 2) => rrect(x0, y0, x1, y1, radius, 7).map(q => [q.u, q.v]);
  function composition(i) {
    if (i % 3 === 0) return [
      circle(31, 34, 18), rect(50, 13, 71, 54),
      [[13, 11], [44, 11]], [[13, 7], [32, 7]],
    ];
    if (i % 3 === 1) return [
      circle(32, 36, 17), circle(53, 36, 17),
      rect(15, 11, 70, 16), [[22, 7], [61, 7]],
    ];
    return [
      rect(14, 12, 34, 53), circle(55, 41, 15),
      [[43, 20], [73, 20]], [[43, 14], [66, 14]], [[43, 8], [59, 8]],
    ];
  }
  for (let i = 0; i < N; i++) {
    const group = mk('g', { 'data-archive-print': i }, g), rest = -13 + i * 1.3;
    cards.push({ i, rest, a: tween(rest), z: tween(i === N - 2 ? 7 : 0), drawn: '',
      back: mk('path', { class: 'lo' }, group), face: mk('path', { class: 'sil' }, group),
      shapes: composition(i).map(points => ({ points, el: mk('path', { class: 'nf' }, group) })) });
  }
  // The tray's near wall hides the bottoms of the prints, painted last.
  const ordered = points => points[0][0] <= points.at(-1)[0] ? points : points.slice().reverse();
  const iF = ordered(ringAt(P, run(inner, front), WH));
  const oT = ordered(ringAt(P, run(outer, front), WH));
  const oB = ordered(ringAt(P, run(outer, front), 0));
  mk('path', { d: poly([...iF, oT.at(-1), ...oB.slice().reverse(), oT[0]]), class: 'fo' }, g);
  mk('path', { d: open(oT), class: 'nf lo' }, g);
  mk('path', { d: open(iF), class: 'nf' }, g);
  mk('path', { d: open([oT[0], ...oB, oT.at(-1)]), class: 'nf sil' }, g);
  let stagger = value, active = -1;
  const anchors = cards.map(cd => P(W / 2, cd.i * GAP + H * Math.sin(rad(cd.rest)), H * Math.cos(rad(cd.rest))));
  function draw(cd, angle, lift) {
    const key = angle + '|' + lift;
    if (key === cd.drawn) return;
    cd.drawn = key;
    const a = rad(angle), y = cd.i * GAP;
    const project = (u, v, back = 0) => P(u, y + v * Math.sin(a) - back * Math.cos(a), v * Math.cos(a) + lift + back * Math.sin(a));
    cd.back.setAttribute('d', poly(shape.map(p => project(...p, 1.3))));
    cd.face.setAttribute('d', poly(shape.map(p => project(...p))));
    cd.shapes.forEach(s => s.el.setAttribute('d', (s.points.length > 2 ? poly : open)(s.points.map(p => project(...p)))));
    const selected = cd.i === (active < 0 ? N - 2 : active);
    cd.face.classList.toggle('hi', selected);
    cd.shapes.forEach((s, i) => s.el.classList.toggle('hi', selected && i === 0));
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    cards.forEach(cd => {
      draw(cd, tval(cd.a, now), tval(cd.z, now));
      moving = !tdone(cd.a, now) || !tdone(cd.z, now) || moving;
    });
    return moving;
  });
  bag.add(B.unregister);
  function select(next) {
    if (next === active) return;
    const from = next >= 0 ? next : active, now = performance.now();
    active = next;
    cards.forEach(cd => {
      const delay = Math.abs(cd.i - from) * stagger;
      tset(cd.a, next < 0 ? cd.rest : cd.i < next ? -24 : cd.i > next ? 20 : 0, now, delay);
      tset(cd.z, next < 0 ? (cd.i === N - 2 ? 7 : 0) : cd.i === next ? 18 : 0, now, delay);
      cd.drawn = '';
    });
    read.textContent = next < 0 ? 'rest' : 'print ' + (next + 1);
    B.wake();
  }
  bag.add(pointer(stage, {
    move: p => select(anchors.reduce((best, point, i) => Math.hypot(p[0] - point[0], p[1] - point[1]) <
      Math.hypot(p[0] - anchors[best][0], p[1] - anchors[best][1]) ? i : best, 0)),
    leave: () => select(-1),
  }));
  bag.add(() => svg.replaceChildren());
  read.textContent = 'rest';
  return { set(v) { stagger = v; }, destroy: bag.dispose };
}

hairline({
  name: 'print-tray',
  means: 'A tray of art prints opens one composition at a time, with the nearby sheets fanning after it.',
  rules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  range: [0, 40, 80],
  tour: [[249, 115], [205, 144], [157, 175], null],
  mount,
});
