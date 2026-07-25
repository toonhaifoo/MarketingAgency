# Digital Unlimited

A one-page marketing agency website built as plain static HTML/CSS/JS — no framework, no build step, no package manager.

![Site screenshot](docs/screenshot.png)

## Structure

The core site is three files:

- `index.html` — all page markup
- `styles.css` — all styling
- `script.js` — all client-side behavior

Plus a handful of static SEO/metadata files: `robots.txt`, `sitemap.xml`, and `favicon.svg`.

The page is organized as a single scrolling document with one section per feature: Hero, About, Services, Why Us, Portfolio, Testimonials, Process, and Contact. Header and footer navigation both link to these sections via anchors.

## Features

- Sticky header
- Mobile navigation toggle
- Scroll-reveal animations (fail-safe: content stays visible if JS doesn't load)
- Animated stat counters
- Contact form with client-side validation, submitting to Formspree via `fetch()` (configured with a live form ID in the `FORMSPREE_ENDPOINT` constant in `script.js`)
- SEO basics: canonical URL, Open Graph/Twitter Card tags, JSON-LD `Organization` structured data, `robots.txt`, and `sitemap.xml`

## Running locally

There's no build tooling — just open `index.html` directly in a browser:

```powershell
Start-Process "index.html"
```

## Deployment

The site deploys automatically to GitHub Pages via a GitHub Actions workflow on push to `main`.
