# Job 68 — Full Public-Site SEO Audit (`alt/gemini-seo-audit`, on `alt/gemini-speed-webkit` `d0d93f85`)

Audited every HTML file (`374` files: `369` indexable pages + `2` on-device pages `/box`, `/compare` + `3` non-indexable `404.html`, `pokemon/404.html`, `v2.html`), `sitemap.xml`, `robots.txt`, `_redirects`, and `_headers` in the real deploy folder (`node public-site.mjs` with `origin/main` `out/`, restored cleanly after; `out/` untouched).

## 1. Findings & Fixes (Before vs After `experiments/seo-audit.mjs`)

| Severity | Category | Finding (Before, on `d0d93f85`) | Action / Proof (After) |
|---|---|---|---|
| **HIGH** | Static Pokémon internal links | **59 Pokémon pages** (`pokemon/abomasnow.html`, `pokemon/absol.html`, `pokemon/charizard.html`, etc.) had `<a href="#pokemon=<mega>">` hash links instead of real `/pokemon/<slug>` links in raw static HTML (before `v2.js` ran), plus static `#<tool>` links on prerendered first screens. | **Fixed (non-visual):** wrapped `V2.preScreen` return values in `V2.pubLinks(...)` (`app/src/v2/shell.js`). `seo-audit.mjs`: **`59 -> 0` static `#pokemon=` links**; all 59 now emit crawlable `<a href="/pokemon/<slug>">`. |
| **MEDIUM** | Duplicate `<h1>` on tool pages | **20 tool pages** (`about`, `archetypes`, `battle`, `box`, `build`, `calc`, `compare`, `events`, `gifts`, `how-it-works`, `natures`, `practice`, `sets`, `speed`, `test-run`, `this-week`, `track-record`, `types`, `usage`, `winning-teams`) shipped **2 `<h1>` tags** in raw HTML (visible first-screen `<h1>` + visually-hidden `PRE[key]` `<h1>`). | **Fixed (non-visual):** in `app/build.mjs` `addPre`, when the page HTML already contains a visible `<h1>`, downgrade `<h1` -> `<h2` inside the visually-hidden `PRE[key]` block (leaving `/`, `/team`, `/meta` untouched for `prerender-test.mjs`). `seo-audit.mjs`: **`20 -> 0` duplicate-`<h1>` pages** (`369/369` indexable pages have exactly 1 `<h1>`). |
| **PASS** | `<title>` & `<meta name="description">` | `1` `<title>` and `1` `<meta name="description">` per page, all unique across `371` non-404 pages, all titles `<= 60` chars, all descriptions `70–160` chars. | `0` issues. |
| **PASS** | Canonicals, `og:url`, `noindex` | Exact `1` canonical matching `https://nastyplot.org<path>` and `og:url` on all `371` non-404 pages; `404.html` has no canonical and has `noindex`; `pokemon/404.html` has `noindex`; `_headers` sets `X-Robots-Tag: noindex` only on `/v2`, `/404`, `/pokemon/404`. | `0` issues. |
| **PASS** | `sitemap.xml` & `robots.txt` | `sitemap.xml` lists all `369` indexable pages (`1` Home + `1` `/pokemon` + `346` Pokémon + `21` tools; excludes `/box`, `/compare`, `404`, `v2`) exactly once, every URL resolves to `200` in the deploy folder, valid `<lastmod>` date on all `369`. `robots.txt` allows `/` and names `https://nastyplot.org/sitemap.xml`. | `0` issues. |
| **PASS** | JSON-LD | Parses cleanly on all `374` HTML files, valid `https://schema.org` `@context` and `@type` (`WebSite`, `CollectionPage`, `BreadcrumbList`, `ListItem`), required fields present, `0` duplicate `@id`. | `0` issues. |
| **PASS** | Pokémon `<h1>` & internal link crawl | All `346/346` Pokémon pages have exactly `1` `<h1>` containing the Pokémon's display name. Crawled every `<a href>` across all `374` HTML files: `0` broken internal links (`404` or relative). | `0` issues. |
| **PASS** | Words (Reg M-C / official) | `0` future `"Reg M-C"` claims (all future copy says `"before Reg M-D."` / `"Reg M-D in 5 days."`; `"Reg M-C"` appears only on current/past tournament names and current legality `"Legal in/for Reg M-C"`). `0` claims that NastyPlot is official (footer states `"unofficial, fan-made tool, not affiliated with Nintendo, The Pokémon Company or Game Freak"`; other `"official"` mentions refer to official events/rules/API/news). | `0` issues; no wording changed. |

## 2. Verification Matrix (Exit Codes)
| Check | Result | Exit Code |
|---|---|---:|
| `SEO_DIST=/tmp/site-66 node experiments/seo-audit.mjs` (BEFORE) | **FAIL** (`20` duplicate `<h1>` + `59` static `#pokemon=` links) | `1` |
| `SEO_DIST=/tmp/site-68 node experiments/seo-audit.mjs` (AFTER) | **ALL PASSED (`0` issues across `374` HTML files, `369` sitemap URLs)** | `0` |
| `node app/test/prerender-test.mjs` | **14/14 ALL PASSED** | `0` |
| `node experiments/pokemon-pages-test.mjs` | **ALL PASSED** | `0` |
| `node experiments/static-pages-test.mjs` | **ALL PASSED** | `0` |
| `node experiments/security-csp-test.mjs` | **PASS (0 violations)** | `0` |
| `node experiments/public-build-test.mjs` | **PASS (PUB-1..PUB-6)** | `0` |
| `node app/test/v2-public.mjs` | **ALL PASSED** | `0` |
