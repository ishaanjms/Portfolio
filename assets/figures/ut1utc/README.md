# Earth Time — UT1–UTC thumbnail

A globe on a timing dial. The highlighted meridian rotates away from the fixed
dial reference and returns toward alignment. Motion is a visual metaphor, not
a quantitative simulation of Earth's rotation or leap-second timing.

- `earth-time.js` is the custom figure, using Hairline's unchanged kernel.
- `hairline-earth-time.html` is its self-contained interactive preview; add
  `?play=1` to start the tour.
- The portfolio mounts the same figure as a passive, fully clickable cover.
- The tour visits behind, ahead, aligned, then the rest pose.
- Intensity sets the angular reach to 12, 28, or 42 degrees.

The source passes Hairline's static validator. Browser review covered the
rest/answer poses, 240px size, both themes and intensity extremes. All poses
settled, contained their geometry in the frame, and rendered without errors.

Hairline skill and build/validation tools:
https://github.com/lucasmarkes/hairline/tree/main/skills/hairline-create

After changing `earth-time.js`, use the official `build.mjs` to regenerate
`hairline-earth-time.html`, then `validate.mjs` to check it. The benchmark
and kernel must remain unchanged. Review with the documented query controls
before updating the static SVG fallback.
