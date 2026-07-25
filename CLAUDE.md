# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A one-page marketing agency website ("Digital Unlimited") built as plain static HTML/CSS/JS — no framework, no build step, no package manager. The entire site is three files:

- `index.html` — all page markup
- `styles.css` — all styling
- `script.js` — all client-side behavior

## Commands

There is no build, lint, or test tooling in this repo, and none is needed — the site is deployable as-is. Node (v24+) is installed and on PATH, but only to run the Playwright MCP server via `npx` (see below); Python is not installed (only the Microsoft Store alias stub is on PATH). Node being available doesn't imply npm/build tooling should be added — this stays a plain static site by design.

To preview changes, open `index.html` directly in a browser:

```powershell
Start-Process "index.html"
```

There is no local dev server. To verify a change, prefer the Playwright MCP server (configured in `.mcp.json`, runs via `npx @playwright/mcp`): navigate it to the `file:///c:/Agentic AI/Working/index.html` URL, then use its snapshot/screenshot/console-message tools directly — this is simpler and more reliable than the headless-Edge fallback below.

If Playwright MCP isn't available, fall back to headless Edge:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --no-sandbox --run-all-compositor-stages-before-draw --virtual-time-budget=5000 --screenshot="out.png" --window-size=1440,3200 "file:///c:/Agentic AI/Working/index.html"
```

Notes on that approach:
- Always pass `--run-all-compositor-stages-before-draw --virtual-time-budget=5000` (or higher) — without it, screenshots can capture mid-CSS-transition and falsely look broken (e.g. `.reveal` elements caught mid-fade).
- This headless Edge build has a **hard ~496px minimum viewport width** — requesting `--window-size` narrower than that (e.g. 390 for a phone) silently renders at ~496px while the screenshot canvas is still cropped to the requested width, producing a false "content is cut off / overflowing" appearance. Don't diagnose overflow bugs from a screenshot alone at small widths; confirm with an actual `document.documentElement.scrollWidth` vs `window.innerWidth` check first (e.g. inject a script that writes both into `document.title`, then `--dump-dom` and read the `<title>`).
- Kill stray `msedge` processes between runs (`Get-Process msedge | Stop-Process -Force`) — a leftover instance sharing the default profile causes "Multiple targets are not supported in headless mode" failures.
- Cross-origin `file://` access (e.g. reading into an iframe pointed at another local file) requires `--allow-file-access-from-files`, otherwise `contentDocument` silently returns `null`.

The site deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. The `/github-push` slash command runs the full publish flow (secret scan → commit → push → sync Pages/About/topics via `gh`).

## Architecture

**Single page, section-per-feature.** `index.html` is one long document; the header nav and footer nav both link to section `id`s via anchors (`#about`, `#services`, `#why-us`, `#portfolio`, `#testimonials`, `#process`, `#contact`). Section order in the DOM is the section order on the page — there's no routing or dynamic composition.

**`styles.css` structure**, top to bottom: CSS custom properties in `:root` (colors, radii, shadows, container width, header height) → base element resets → reusable primitives (`.container`, `.btn` variants, `.eyebrow`, `.section-heading`) → one block per page section, in the same order they appear in the HTML → reveal-animation rules at the very end.

Grid layouts intentionally use `repeat(n, minmax(0, 1fr))` rather than bare `repeat(n, 1fr)`. A bare `1fr` track won't shrink below its content's min-content size, so a long word/number in one card can force the whole grid — and therefore the page — wider than the viewport. Keep this pattern when adding new multi-column grids.

**`script.js` is one file, no modules/bundler**, organized as independent feature blocks (sticky header, mobile nav toggle, scroll reveal, stat counters, contact form validation, footer year) that each wire up their own DOM listeners on load. There's no shared framework/state — if you add a new interactive feature, add it as its own self-contained block following the same pattern.

**Reveal-on-scroll is fail-safe by design.** `.reveal` elements are visible by default; they're only hidden pending animation once `<html>` gets a `js-reveal` class, which `script.js` adds as its very first line. If `script.js` fails to load or errors, the class is never added and content stays visible (no permanently-blank page). When an element is already inside the viewport at load time, `script.js` marks it `in-view` synchronously (via `getBoundingClientRect()`) instead of waiting on `IntersectionObserver`, which only fires asynchronously — this avoids a flash of hidden content for above-the-fold sections. Preserve this pattern (visible-by-default, JS opts into hiding) if you touch the reveal logic.

**Contact form submits to Formspree.** `#contact-form` in the Contact section does client-side validation, then POSTs JSON via `fetch()` to the `FORMSPREE_ENDPOINT` constant in `script.js` (`https://formspree.io/f/{YOUR_FORM_ID}`). `{YOUR_FORM_ID}` is a placeholder — swap in a real Formspree form ID before going live.
