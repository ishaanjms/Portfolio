const { Cam, proj, facing, rings, circ, ringAt, prism, solid, put, poly, open,
  mk, bezier, clamp, lerp, r2, inject, register, reducedMotion } = HL;

const stage = document.querySelector('[data-artifacts-turntable]');
const camera = Cam(42, 0.48, 1.55);
camera.ox = 190;
camera.oy = 172;

const project = proj(camera);
const front = facing(camera);
const svg = mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
const path = (parent, d, style) => mk('path', { d, class: style }, parent);
const dot = (parent, [cx, cy], radius) =>
  mk('ellipse', { cx: r2(cx), cy: r2(cy), rx: radius, ry: radius, class: 'dot' }, parent);
const outline = (ring, z) => poly(ringAt(project, ring, z));
const circle = (x, y, radius, z) => outline(circ(radius, 44).map(point => ({
  u: x + point.u, v: y + point.v
})), z);

const [shell, bevel] = rings(-73, -53, 73, 53, 12, 2);
const [lid] = rings(-68, -48, 68, 48, 8, 2);
put(solid(svg), prism(project, front, shell, bevel, -14, 0));
path(svg, outline(shell, 0), 'sil');
path(svg, outline(lid, 0), 'nf lo');
path(svg, open([[28, 53, -5], [57, 53, -5]].map(point => project(...point))), 'nf sil');
const lamp = dot(svg, project(20, 53, -6), 1.65);

const recordX = -18;
const recordY = 3;
const recordZ = 3;
path(svg, circle(recordX, recordY, 44, 1), 'sil');
path(svg, circle(recordX, recordY, 43, recordZ), 'sil hi record-surface');

for (const radius of [39, 35, 31, 27, 23, 19]) {
  path(svg, circle(recordX, recordY, radius, recordZ), 'nf sil');
}

const label = path(svg, circle(recordX, recordY, 11, recordZ), 'sil record-sleeve');
label.setAttribute('opacity', '0.95');
dot(svg, project(recordX, recordY, recordZ), 1.85);
const grooveGlints = [path(svg, '', 'nf hi'), path(svg, '', 'nf lo')];

const pivotX = 49;
const pivotY = -33;
path(svg, circle(pivotX, pivotY, 10, 1), 'sil');
path(svg, circle(pivotX, pivotY, 8, 6), 'sil record-sleeve');
path(svg, circle(51, 29, 7, 1), 'sil');
path(svg, circle(51, 29, 6, 4), 'sil');
path(svg, open([project(50, 26, 4), project(54, 28, 4)]), 'nf hi');

const arm = path(svg, '', 'nf hi record-arm');
const cartridge = path(svg, '', 'sil hi');

const ease = bezier(0.45, 0, 0.2, 1);
const ramp = (time, start, end) => ease(clamp((time - start) / (end - start), 0, 1));
const loopDuration = 8;
const stillFrame = 3.6;
let elapsed = stillFrame;

function draw(time) {
  const needle = ramp(time, 0.3, 1.45) - ramp(time, 6.3, 7.45);

  // The record's highlights follow its projected circumference as it spins.
  for (const [i, glint] of grooveGlints.entries()) {
    const angle = time / loopDuration * 6 * Math.PI + i * Math.PI;
    const radius = i === 0 ? 35 : 39;
    const arc = Array.from({ length: 8 }, (_, n) => {
      const theta = angle + n * 0.045;
      return project(recordX + radius * Math.cos(theta), recordY + radius * Math.sin(theta), recordZ);
    });
    glint.setAttribute('d', open(arc));
  }

  const angle = lerp(88, 145, needle) * Math.PI / 180;
  const armPoint = (distance, offset, z) => project(
    pivotX + distance * Math.cos(angle) - offset * Math.sin(angle),
    pivotY + distance * Math.sin(angle) + offset * Math.cos(angle),
    z
  );
  arm.setAttribute('d', open([armPoint(0, 0, 8), armPoint(48, 0, 8), armPoint(67, 6, 5)]));
  cartridge.setAttribute('d', poly([
    armPoint(64, 3, 6), armPoint(73, 5, 5), armPoint(73, 10, 4), armPoint(64, 8, 5)
  ]));
  lamp.setAttribute('opacity', r2(0.3 + 0.7 * needle));
}

inject(document);
stage.setAttribute('data-hairline', 'turntable');
stage.setAttribute('data-hairline-theme', 'light');
register(stage, dt => {
  const still = reducedMotion();
  elapsed = still ? stillFrame : (elapsed + dt) % loopDuration;
  draw(elapsed);
  return !still;
});
