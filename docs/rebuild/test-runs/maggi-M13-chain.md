# Maggi M13 — Independent review of merged speed chain (`978d8213` vs `0ccfa209`)

- **Time:** Fri Nov 27 11:33:32 AM EST 2026
- **Branch:** `alt/maggi-m13-chain` (from `origin/claude/design6` `978d8213`)
- **Comparison:** `node public-site.mjs site-m13-new` (`978d8213`, 1650 files) vs `node public-site.mjs site-m13-old` (`0ccfa209`, 1130 files), both built with today's `origin/main` `out/`.
- **What I'd need to know that you haven't told me:** Nothing missing.

## Summary

| Check | Scope | Checked (how) | Result |
|---|---|---|---|
| **Sitemap & `robots.txt`** | All 369 URLs | Checked (parsed `sitemap.xml`, compared `robots.txt` byte-for-byte) | **Identical:** 369 vs 369 (`onlyOld: 0, onlyNew: 0`), `robots.txt` identical |
| **Static SEO (`title`, `meta description`, `canonical`, `robots`, `JSON-LD` `@type`s)** | All 369 pages | Checked (parsed every built HTML file) | **0 diffs** across all 369 pages |
| **Static `<h1>`** | All 369 pages | Checked (body `<h1>` outside `<script>`/`<template>`) | **Expected speed-chain improvement:** `multiH1Old=0, multiH1New=0`. On 346 `/pokemon/*` pages `0ccfa209` had `0` static `<h1>`s while `978d8213` has the prerendered `<h1>` (`"The file on Venusaur."` etc.); on 18 tool pages `0ccfa209` had the old static fallback `<h1>` while `978d8213` has the live prerendered `<h1>`. **Live hydrated `<h1>`: 0 diffs across all 369 pages.** |
| **Internal links (static + live)** | All 369 pages | Checked (resolved every internal `<a href>` against built site files) | **0 newly broken links** (`brokenLinksOld: 0, brokenLinksNew: 0, brokenLiveLinksNew: 0`) |
| **Live rendered `title`, `h1`, console errors** | All 369 pages | Checked (Playwright Chromium crawl of all 369 × 2 pages) | **0 diffs** (`live title: 0, live h1: 0, live newConsoleErrs: 0`) |
| **Hydrated visible text length (≤ 2%)** | All 369 pages | Checked (Playwright Chromium waiting for `V2.dataReady()`, route chunk done, and `[data-np-pre]` replaced) | **0 diffs > 2%** (`maxPct = 0.00%` across all 369 pages) |
| **Search (10 queries)** | `garchomp, trick room, intimidate, rain, sneasler, focus sash, tailwind, kingambit, meta, team` | Checked (Playwright Chromium `V2.openSearch()`, compared top 8 hits per query) | **10 / 10 exact MATCH** |
| **WebKit iPhone 15 + Chromium 393×659 with `/routes/*.js` delayed 2 s** | `/`, `/team`, `/meta`, `/pokemon/garchomp`, `/calc` | Checked (`experiments/m13-prerender-cls-test.mjs` — WebKit does not support `PerformanceObserver('layout-shift')`, so measured both Chromium CLS and WebKit `earlyH`/`footTop`) | **1 real bug found & fixed:** `/calc` had **`CLS = 0.3096`** (`earlyH = 395px < 659px`, `FOOTER.np-foot` jumped out of viewport when `/routes/calc.js` arrived). Fixed with 1 line in `app/src/v2/shell.js:461` → **`CLS = 0` (`10 passed, 0 failed`)**. |

---

## Real bug found & fixed (with fail-first test)

### Bug: `/calc` prerender shorter than viewport (`395px < 659px`) caused `CLS = 0.3096` when `/routes/calc.js` arrived
- **Cause:** `V2.preScreen` (`app/src/v2/shell.js:460–465`) set `rootEl.style.minHeight = '100svh'` **only** for `route === 'home'` (line 463), not for the `else` branch (all other prerendered tool pages). On `/calc`, trimming `rootEl.children` to 4 children produced a `395px` prerender block, placing `footer.np-foot` inside the 659 px iPhone 15 viewport at `y = 455px`. When `/routes/calc.js` arrived 2 s later and expanded `#main` to `2447px`, `footer.np-foot` shifted out of the viewport (`CLS = 0.3096`).
- **Fix (`app/src/v2/shell.js:461`):** Moved `rootEl.style.minHeight = '100svh';` one line up (above `if (route === 'home')`) so every `[data-np-pre]` prerendered first screen keeps the footer below the fold until its route chunk hydrates. Zero change to the hydrated page.
- **Fail-first proof (`experiments/m13-prerender-cls-test.mjs`):**
  - **Before fix (`978d8213`):**
    - `FAIL  chromium 393x659 /calc: earlyH=395px, earlyLen=427, CLS=0.3096 shifts=[{"t":2532,"v":0.3096,"els":["FOOTER.np-foot"]}]`
    - `m13-prerender-cls-test: 9 passed, 1 failed`
  - **After fix (`app/src/v2/shell.js:461`, rebuilt `public-site.mjs`):**
    - `PASS  chromium 393x659 /: earlyH=885px, earlyLen=1317, CLS=0`
    - `PASS  chromium 393x659 /team: earlyH=3299px, earlyLen=2111, CLS=0`
    - `PASS  chromium 393x659 /meta: earlyH=1228px, earlyLen=1148, CLS=0`
    - `PASS  chromium 393x659 /pokemon/garchomp: earlyH=1781px, earlyLen=1034, CLS=0`
    - `PASS  chromium 393x659 /calc: earlyH=659px, earlyLen=427, CLS=0`
    - `PASS  webkit iPhone 15 /` .. `/calc`: all 5 `earlyH >= 659px`, `footTop >= 659px`, `hydrated=true`
    - `m13-prerender-cls-test: 10 passed, 0 failed`

### Note on `/team` local HTTP 404
- On local static HTTP server, `/team` logged one expected `404` for `/api/count` (the Cloudflare Worker counter endpoint, not present in a local static folder; same on `0ccfa209`).

## Not checked
- Full `v2-minors.mjs` or `deploy-smoke` against live `nastyplot.org` (not part of M13).
- `site-m13-old` and `site-m13-new` were deleted after testing and `out/` was restored to `HEAD`.
