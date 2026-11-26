# Kip job 50: search-ready public pages test (`app/test/seo-check.mjs`)

Written Thu Nov 26, 9:53 AM (ET). Branch `alt/gemini-seo-test` from `origin/claude/design6` `9bab576f`.

## What was built & tested
Built the public site on frozen `out/` (`0c992f6977bc1cecc4e03eb269969a82b99681cf`, restored cleanly afterwards; zero `out/` changes committed):
`node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public`
This wrote **371 public HTML pages** (`index.html`, 23 tool pages, `pokemon.html`, 346 `pokemon/<slug>.html`) plus intentional `noindex` error/app copies (`404.html`, `pokemon/404.html`, `v2.html`), `sitemap.xml` (369 URLs), and `robots.txt`.

## What changed
- **`app/test/seo-check.mjs` (new):** checks every public HTML page in `app/dist` (or `SEO_DIST=<dir>` for testing):
  1. One unique `<title>` (15–65 chars) and one unique `<meta name="description">` (50–160 chars) on every page.
  2. One `<link rel="canonical">` matching `https://nastyplot.org<path>`, and no `noindex` meta tag on any indexable page.
  3. `<html lang="...">` set and every static `<img>` has `alt` across all 371 pages; plus Playwright DOM check across all 25 top-level routes (`/`, 23 tool pages, `/pokemon`) and 3 sample Pokémon routes (`/pokemon/garchomp`, `/pokemon/incineroar`, `/pokemon/absol-mega`) verifying **exactly one `<h1>`** and **every rendered `<img>` has `alt`**.
  4. Every `<script type="application/ld+json">` (both static and after client-side `syncLd()`) parses as JSON with `@context` and `@type` (or `@graph` items all carrying `@type`).
  5. `sitemap.xml` lists every indexable page once with its canonical URL and no extra non-page URLs (allowing only `/box` and `/compare` omitted by design in `app/build.mjs:232`); `robots.txt` has `User-agent: *`, `Allow: /`, and `Sitemap: https://nastyplot.org/sitemap.xml`.
- **`.github/workflows/test.yml`:** added `'app/test/seo-check.mjs'` to `paths:` and wired `node app/test/seo-check.mjs` right after `node app/test/v2-public.mjs` in the public job.
- No generator code changes were needed.

## Audit findings on the real public build (notes for HH)
- **Titles:** 15–60 chars across all 371 pages, 100% unique (shortest: `about.html` `"About NastyPlot"` 15 chars; longest: `pokemon/absol-mega.html` 60 chars).
- **Descriptions:** 77–160 chars across all 371 pages, 100% unique (shortest: `gifts.html` 77 chars; longest: `pokemon/tauros-paldea-combat.html` 160 chars).
- **Static vs rendered `<h1>`:** Only `pokemon.html` carries an `<h1>` in static HTML; the 370 SPA pages ship the static header + loading panel and render their single `<h1>` client-side (verified 28/28 routes render exactly one `<h1>`). Flagging in case HH/Sim ever want a static `<h1>` in the initial HTML for crawlers that don't execute JS.
- **`/box` and `/compare`:** Both HTML files (`box.html`, `compare.html`) are written with canonical URLs and no `noindex` tag, while `app/build.mjs:232` intentionally omits them from `sitemap.xml` ("on-device pages... nothing to index"). `seo-check.mjs` respects that intentional omission; flagging in case HH wants `noindex` on `/box` and `/compare` too.

## Verification
1. **Real public build (frozen `out/` `0c992f69`):** `node app/test/seo-check.mjs` → `seo-check: ALL PASSED` (`13/13`, exit 0).
2. **Deliberately broken temp copy (`SEO_DIST=/tmp/...`):** removed canonical from `about.html`, duplicated description on `gifts.html`, broke JSON-LD and added an `<img>` without `alt` on `pokemon.html`, removed `/team` from `sitemap.xml` → `seo-check: 7 FAILED` (exit 1), catching `1b`, `2a`, `3b`, `3d`, `4a`, `4b`, `5a`.
3. `node experiments/syntax-check.mjs` → `syntax-check: all 418 scripts parse` (exit 0).

## Not checked
- Full GitHub Actions workflow run (runs on push).
- Rendering all 346 `pokemon/*.html` routes individually in Playwright (all 346 are checked statically; 3 representative Pokémon routes + all 25 top-level routes are rendered in Playwright to keep the test fast in CI).
