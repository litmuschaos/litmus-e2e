# LitmusChaos E2E Dashboard

A static site, plain HTML, CSS and ES modules without a build step or dependencies, so it can be published as it is to
GitHub Pages. All URLs are relative and the routes use the URL hash, it works from any path (`/litmus-e2e/`).

It shows three builds with one design system and one code base: the daily **Nightly** (violet), the **Release
Candidate** (amber) and **GA** (emerald). The selected build is part of the URL (`#/experiments?b=rc`), so every link
is shareable, and switching builds redraws the page in place.

| Route | Page |
|-------|------|
| `#/` | Summary strip of the three builds (status, pass rate, last run, trend), then the selected build: verdict, what changed since the last run, suites, failing tests, trend and workflows |
| `#/readiness` | Nightly, RC and GA side by side: pass rates, version of each run, regressions between stages, experiments that differ |
| `#/experiments`, `#/frontend` | Filterable grid with fuzzy search, chips for category, status and build, and a drawer (`x=`) with steps, failure output, duration and trend |
| `#/history` | Heatmap with a cell per run and experiment, zoom, scrubber, tooltips with a trend strip, flaky rows, overlay of all builds (`all=1`) |
| `#/about` | The published files, their state and how the numbers are defined |

The overview starts with a collapsed **Live** bar: the nightly workflows that are queued or running, their progress by jobs, the current step and the elapsed time, and the runs that finished in the last 20 minutes. The browser asks the public GitHub Actions API about once a minute (the repository comes from `latest.json`), pauses in a hidden tab, and the bar disappears when the API limit is reached or the repository is not found. Unauthenticated requests are limited to 60 per hour per network by GitHub, cached answers do not count.

Ctrl/Cmd+K opens the command palette (pages, builds, experiments, runs), `/` focuses the search.

## Data

| Path | Build |
|------|-------|
| `data/latest.json`, `data/history.json` | Nightly |
| `data/rc/…` | Release Candidate |
| `data/ga/…` | GA |

All are written by `scripts/report/build_report.py` (`scripts/report/schema.md`) and are not committed. A build whose
files are missing is shown as "no run yet", unreadable files as an error with a retry, never as zero or as a guess.
Version or tag come from `build.version`, else the short `build.sha`.

## Code

| File | Purpose |
|------|---------|
| `index.html`, `assets/styles.css` | Shell, design tokens (dark first, light theme, build accents, status colours), motion |
| `assets/js/data.js` | Loading, validation and the derived numbers (pure functions, tested in `dashboard-test/`) |
| `assets/js/charts.js` | SVG health ring, sparkline, trend chart, stacked bar |
| `assets/js/motion.js` | Count-up, reveal on scroll, View Transitions, spotlight, tilt, magnetic buttons, embers |
| `assets/js/views/` | One module per page, the drawer is shared. Only the overview is loaded with the page |
| `assets/fonts/` | Space Grotesk and JetBrains Mono (SIL Open Font License, see the license files) |

## Quality notes

* Status is felt and read: passing glows teal, failing pulses red with a short glitch on the headline number and
  embers around the ring, flaky and skipped flicker amber. Every status also has an icon and a label.
* Only `transform`, `opacity` and stroke offsets are animated, `prefers-reduced-motion` turns the aurora, the grid, the
  count-ups, the reveals and the view transitions off. Content never depends on an animation to become visible.
* Text from the results is inserted with `textContent` only, links are limited to `https`.
* WCAG AA: axe-core reports no violation on any page, build, theme or viewport of the test scenarios, keyboard
  access to the switcher (arrow keys), grid (arrows), palette and drawer (focus trap, Escape), charts have a table
  view for screen readers.
* Lighthouse on a gzip compressed static server (as GitHub Pages serves it): mobile 99 performance, desktop 100,
  accessibility 100, best practices 100, layout shift below 0.01.
* The motion is written for this site (no Framer Motion, GSAP or Lenis) to keep the site free of dependencies and
  a build step. Smooth scroll is left to the browser.
