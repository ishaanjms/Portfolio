# Ishaan Jain — Portfolio

Personal portfolio website for Ishaan Jain, Interaction Designer.

## Pages

- **Home** — Hero interaction and featured project showcase
- **About** — Bio, skills marquee, experience, education, achievements, certifications
- **Garage** — Side projects and experiments in a filterable project grid
- **Project pages** — Individual case studies live in their own folders

## Stack

Vanilla HTML, CSS, JavaScript — no frameworks or build tools.

## Folder Conventions

```
/
├── index.html              # Home page
├── about/index.html        # About page
├── garage/index.html       # Garage page
├── npl/                    # NPL dashboard case study and media
├── ut1utc/                 # UT1-UTC forecasting case study and figures
├── greene/                 # Greene's Counsel case study and media
├── cloud/                  # Cloud density profiler case study and media
├── docqna/                 # Protected DocQnA case study
├── Sprinklr/               # Sprinklr device switcher case study
├── IISc/                   # IISc project page
├── lagrange/               # Lagrange project page
├── css/
│   ├── shared.css          # Nav, footer, global styles
│   ├── animations.css      # Keyframes and scroll reveals
│   ├── home.css            # Home hero and project cards
│   ├── about.css           # About page styles
│   └── garage.css          # Garage grid styles
├── js/
│   ├── shared.js           # Shared navigation/footer behavior
│   └── home.js             # Home page interaction
└── assets/
    ├── icons/              # Product, tool, certification, and skill icons
    ├── thumbnails/         # Project card thumbnails
    ├── profile/            # Portrait and avatar
    ├── logo/               # Favicon and site/social logos
    └── Ex-logos/           # Experience/company logos
```

Keep project-specific screenshots, posters, gifs, and figures inside the matching project folder. Keep reusable icons and logos inside `assets/` so they can be referenced consistently across pages.
