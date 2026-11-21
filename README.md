# IMPIT — Property Preservation Landing Page

Responsive marketing landing page for **IMPIT**, built from the Figma design
*"IMPIT Landing Page"* (1440 px artboard). Plain HTML, CSS and vanilla JavaScript —
no framework, no build step.

**Live:** https://impit-landing.vercel.app

## Features

- **Hero slider** — 4 photos with a wipe + push transition, slow zoom, autoplay (6.5 s),
  clickable slide indicator and touch swipe.
- **Fixed glass navbar** with a dropdown menu (staggered rows, blurred backdrop,
  focus trap, Esc / outside-click to close).
- **Sticky CTAs** — "Request Vendor" stays with the navbar on scroll, "See Our Coverage"
  hides; on tablet/mobile both move into the menu.
- **Client logo marquee**, animated stat counters, scroll-reveal animations.
- **Cards** (Who Choose Us / Who We Are) — top border re-draws left → right on hover,
  soft colour wash rises from the bottom.
- **Services accordion** — one panel open at a time, smooth height animation.
- **Company leaders switcher** — click a portrait to make it active
  (colour + chamfered 432 × 432) and swap the message with a soft cross-fade.
- **Parallax** on the hero and CTA backgrounds, scroll progress bar, back-to-top.
- Respects `prefers-reduced-motion`; keyboard accessible.

## Breakpoints

| Range | Layout |
|---|---|
| ≥ 1920 px | Capped at 1920, centred |
| 1200 – 1919 px | Design layout, fluidly scaled (1 unit = 1 px at 1440) |
| 768 – 1199 px | Tablet: stacked / two-column grids, CTAs inside menu |
| < 768 px | Mobile: single column |

## Project structure

```
.
├── index.html      # markup for all sections
├── styles.css      # design tokens, layout, animations, breakpoints
├── app.js          # slider, menu, accordion, leaders, reveals, parallax
├── assets/         # images and icons exported from Figma (+ supplied photos)
└── fonts/          # Suisse Intl (Regular / Medium / Semibold / Bold)
```

Sometype Mono is loaded from Google Fonts.

## Run locally

Any static server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

```bash
npx vercel deploy --prod
```

No build command or output directory is needed — Vercel serves the folder as-is.

## Editing content

- **Leader messages:** edit the JSON in `<script id="leadersData">` inside `index.html`.
- **Hero photos:** replace `assets/hero-bg.png`, `hero-2.jpg`, `hero-3.jpg`, `hero-4.jpg`
  (per-slide framing lives in `styles.css` under `.hero__slide[data-slide="…"]`).
- **Colours / type scale:** CSS variables at the top of `styles.css`.

## ⚠️ Font licence

`fonts/` contains **Suisse Intl Trial** files, which are licensed for evaluation only.
Replace them with a licensed copy (or remove them and use a fallback) before using this
site commercially or publishing the repository publicly.

## Credits

Designed & developed by **Manjurul Islam**.
Stock photography from Pexels.
