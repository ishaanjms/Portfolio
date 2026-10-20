# Hairline 0.5.1

Source: https://github.com/lucasmarkes/hairline
Package: https://www.npmjs.com/package/@lucasmarkes/hairline/v/0.5.1
Author: Lucas Marques. MIT licensed; see LICENSE.

The original vanilla ESM distribution is hosted locally so project thumbnails
do not depend on a CDN. The source-map URL was removed. A local `playbackRate`
option scales the native tour clock (default 1, clamped to 0.25–4); Cloud Profiler
uses 1.8 for more noticeable motion, with shorter travel, dwell and start delays.
Other figures retain their default pacing. Motion preferences and visibility
handling still run through Hairline's original loop.
Cloud Profiler uses Terrain; the Artifacts collection uses Phosphor's native
pattern loop. Both retain off-screen pausing and reduced-motion support.
The custom figures use the separate hairline-create kernel.
