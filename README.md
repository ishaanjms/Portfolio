# Ishaan Jain — Portfolio

Personal portfolio website for Ishaan Jain, focused on product design, AI tools, scientific systems, enterprise workflows, and visual/brand experiments.

The site is intentionally lightweight: plain HTML, CSS, and JavaScript with no framework or build step.

For future editing support, see `agent.md`.

## Pages

- **Home** — Intro, selected work, and portfolio navigation.
- **About** — Bio, skills marquee, expandable experiences, education, achievements, and certifications.
- **Garage** — Curated project library grouped by Product Design, Scientific Tools, AI Systems, and Visual / Brand.
- **Project pages** — Individual case studies and visual explorations live in their own folders.

## Project Pages

- `Sprinklr/` — CFM Device Switcher case study.
- `npl/` — Atomic Clock Live Monitor case study, including system brief, lab hardware context, dashboard IA, interaction demos, and conference context.
- `ut1utc/` — UT1-UTC leap-second prediction case study.
- `cloud/` — Cloud Profiler data-tool project.
- `docqna/` — DocQnA AI Assistant project.
- `greene/` — Greene's Counsel AI prototype.
- `adagrad/` — Adagrad gamified learning project.
- `boat/` — boAt Lifestyle brand-system exploration.
- `lagrange/` — Lagrange visual identity project.
- `IISc/` — IISc visual/project page.

## Structure

```text
/
├── index.html
├── agent.md
├── about/
│   └── index.html
├── garage/
│   └── index.html
├── css/
│   ├── shared.css
│   ├── animations.css
│   ├── home.css
│   ├── about.css
│   └── garage.css
├── js/
│   ├── constants.js
│   ├── shared.js
│   ├── home.js
│   ├── about.js
│   └── garage.js
├── assets/
│   ├── icons/
│   ├── thumbnails/
│   ├── profile/
│   ├── logo/
│   └── Ex-logos/
├── Sprinklr/
├── npl/
│   ├── assets/
│   │   ├── hero/
│   │   ├── lab/
│   │   ├── diagrams/
│   │   ├── screens/
│   │   └── videos/
│   ├── index.html
│   └── project.css
├── ut1utc/
├── cloud/
├── docqna/
├── greene/
├── adagrad/
├── boat/
├── lagrange/
└── IISc/
```

## Asset Conventions

- Keep shared icons, thumbnails, profile images, and logos inside `assets/`.
- Keep project-specific screens, figures, videos, posters, GIFs, and mockups inside the matching project folder.
- NPL hardware/context photos live in `npl/assets/lab/`.
- Experience/company logos live in `assets/Ex-logos/`.
- Square logo backups and alternate logo exports live in `assets/logo/square logos/`.
- `IA NPL.png` is currently referenced by the NPL information architecture section.

## Local Preview

Because this is a static site, it can be opened directly in a browser from `index.html`. For smoother local navigation between folders, use any simple static server from the project root.

## Notes

- Shared navigation and footer behavior should stay in `js/shared.js`.
- Shared visual language should stay in `css/shared.css`.
- Page-specific styling should stay in the matching CSS file.
- Avoid moving user-added media out of project folders unless the asset is reused across multiple pages.
- Keep `agent.md` updated when conventions, page structure, or major asset locations change.
