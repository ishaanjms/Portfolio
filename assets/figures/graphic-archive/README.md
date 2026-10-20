# Graphic Design Archive — Print tray

Six illustrated prints sit in a shallow tray. The selected print rises and
its neighbours fan after it, staggered by distance. Abstract circles, shapes
and layout rules represent poster and identity explorations.

`print-tray.js` is the custom figure, using Hairline's unchanged kernel.
`hairline-print-tray.html` is its self-contained preview; append `?play=1`
to run the tour through prints 2, 4 and 6, then back to rest.
The website mounts it through `js/hairline-thumbnails.js` as an inert preview.
The enclosing thumbnail links to the Graphic Design Archive.

The intensity values 0, 40 and 80 set the neighbour delay in milliseconds.
The figure uses fixed hit positions, one highlight, opaque sheets and tray
walls, eased motion, and off-screen pausing.

Built and validated with the official Hairline skill tools:
https://github.com/lucasmarkes/hairline/tree/main/skills/hairline-create

Browser review covered the rest and selected poses, 240px size, both themes,
and both intensity extremes. All geometry remained inside the frame and
rendered without errors.
