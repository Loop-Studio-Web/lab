<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/loop-logo-on-dark.svg">
  <img src="docs/img/loop-logo-on-light.svg" alt="Loop Studio" height="56">
</picture>

# Loop Studio Lab

**Front-end experiments and UI components,<br>kept small, self-contained and a little bit playful.**

[![Live](https://img.shields.io/badge/lab-live-fe3b30?style=flat-square&labelColor=0b0b0c)](https://loop-studio-web.github.io/lab/) ![stack-vanilla%20JS%20%C2%B7%20React%20%C2%B7%20Astro](https://img.shields.io/badge/x?style=flat-square&labelColor=0b0b0c&color=fe3b30) ![license-all%20rights%20reserved](https://img.shields.io/badge/x?style=flat-square&labelColor=0b0b0c&color=fe3b30)

[**Open the Lab →**](https://loop-studio-web.github.io/lab/)

</div>

<br>

## What this is

A sandbox. Before an idea goes into a client project, it lives here first: a slider with an odd effect, a toast that behaves, a booking widget that actually books. Nothing is a framework, nothing is a design system. Each folder is one experiment you can open on its own.

The site is plain static files served as-is by GitHub Pages, so there is **no build step** in this repo. Open a folder's `index.html` and it works.

## Experiments

| Folder | What it is | Tech |
|---|---|---|
| [`calendario/`](calendario) | Memo calendar with a hand-written WebGL background (build only; sources are in a private repo) | Astro · WebGL |
| [`booking-widget/`](booking-widget) | Appointment booking flow (compiled build) | React |
| [`google-reviews-widget/`](google-reviews-widget) | Reviews carousel with sample data (compiled build) | React |
| [`three-js-animation/`](three-js-animation) | 3D scene driven by scroll | Three.js |
| [`skyTracker/`](skyTracker) | Weather app: city search and forecast through a small proxy | JS |
| [`animals-webpage/`](animals-webpage) · [`movies-slider/`](movies-slider) · [`slider-fruit-soda/`](slider-fruit-soda) · [`slider-magic-effects/`](slider-magic-effects) · [`vertical-slider/`](vertical-slider) | Five takes on the full-screen slider | CSS · JS |
| [`starbucks-coffee/`](starbucks-coffee) | A coffee landing page study ("Loop Studio Coffee") | CSS · JS |

## Components

Twenty-eight demo pages in [`components/`](components), one folder each (`index.html`, usually with its own CSS and JS). Most gather several variants of the same idea, so there are well over a hundred small pieces in all. Every page opens on its own, on a fixed dark stage, with real buttons, keyboard and touch support and `prefers-reduced-motion` respected. Shared base styles, fonts, photos and the studio signature live in [`components/_shared/`](components/_shared).

- **Layout:** [bento spotlight](components/bento-spotlight) (also in its [own repo](https://github.com/Loop-Studio-Web/bento-spotlight)), pricing toggle, stepper and timeline
- **Navigation:** sticky navbar, hamburger, menu with reflection, tabs and segmented controls
- **Interaction:** buttons, switches (light/dark), like
- **Forms:** text fields, arc time picker, star rating
- **Cards:** cards, flip cards
- **Feedback:** toast, loaders and progress, cookie notice, copy to clipboard
- **Effects:** animated backgrounds, text effects, cursors, animated borders, bell
- **Gallery and media:** rotating 3D gallery, accordion gallery, video popup, logo marquee

## Using it

```bash
git clone https://github.com/Loop-Studio-Web/lab.git
cd lab
# open any folder's index.html, or serve the root:
npx serve .
```

## Notes

- Some experiments show third-party photos, films or brand names **for demonstration only**. They keep their own licences and owners; see [LICENSE](LICENSE).
- The code is published so you can read it and learn from it. It is **not open source**: reuse needs written permission, which you can ask for at [theloopstudio.org/contatti](https://theloopstudio.org/contatti/).
- The finished, full-page work lives in a sibling repo: [**vetrine**](https://github.com/Loop-Studio-Web/vetrine).

<br>

---

<div align="center"><sub>Built by <a href="https://theloopstudio.org">Loop Studio</a> · web design, photo &amp; video, social</sub></div>
