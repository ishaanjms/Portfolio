# Agent Support Notes

This portfolio is a static HTML/CSS/JS site. Keep edits small, visual, and consistent with the existing design language.

## Project Shape

- Home page: `index.html`, `css/home.css`, `js/home.js`
- Shared navigation, footer, cursor, page transitions: `css/shared.css`, `js/shared.js`
- About page: `about/index.html`, `css/about.css`, `js/about.js`
- Garage page: `garage/index.html`, `css/garage.css`, `js/garage.js`
- Project pages are folder-based case studies, usually with their own CSS and assets.

## Design Direction

- Use quiet, spacious layouts with restrained borders and soft contrast.
- Keep the cream background `#f7f5f0` unless the user explicitly asks for a page-specific experiment.
- Use `DM Sans` for most UI text and `DM Mono` for small labels, eyebrow text, numbers, and metadata.
- Avoid heavy cards, nested boxes, decorative clutter, and overly playful visual treatments.
- Let project media carry the story. Prefer larger visuals with short captions over dense explanatory blocks.

## Editing Rules

- Put page-specific styles in that page's CSS file.
- Use shared CSS only for truly site-wide nav, footer, cursor, and common foundation styles.
- Do not move user-added media unless it is clearly project-specific and needs to be referenced reliably.
- Keep image filenames readable when copying assets into a project folder.
- When adding screenshots or videos to a case study, check paths from that page's folder.

## NPL Case Study Notes

The NPL case study lives in `npl/`.

Recent structure:
- Hero dashboard image at `npl/assets/hero/dashboard-hero.png`
- Intro/overview section
- Short system brief explaining how the cesium fountain works
- Lab-context gallery using hardware photos in `npl/assets/lab/`
- Why it mattered
- Lab constraint
- System architecture
- Information architecture image using root asset `IA NPL.png`
- Style guide, interactions, outcomes, and conference/context sections

NPL lab assets:
- `npl/assets/lab/physics-package.png`
- `npl/assets/lab/optical-bench.png`
- `npl/assets/lab/data-logger.png`
- `npl/assets/lab/thermo-hygrometer.png`
- `npl/assets/lab/laser-hardware.png`

The NPL system brief is based on `AD-10.pdf`, a paper about the development of the NPLI cesium atomic fountain. Keep that section brief and portfolio-friendly.

## Verification

- For CSS edits, check brace balance before finishing.
- For asset edits, confirm files exist and page references match the relative path.
- For visual layout changes, inspect the relevant HTML and CSS together before editing.
