# Kip job 55: Core Web Vitals speed audit & `app/test/speed-check.mjs`

Written Thu Nov 26, 11:14 AM (ET). Branch `alt/gemini-speed-check` from `origin/claude/design6` `9bab576f`.
No page code changed (report + test only; HH decides which fixes to take).

## Test setup (`app/test/speed-check.mjs`)
- Public site built on frozen `out/` (`0c992f69`, restored cleanly afterwards): `node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public`.
- Served over local HTTP with gzip for text assets (`.html`, `.js`, `.css`, `.json`, `.svg`), matching Cloudflare Pages transfer.
- Each of the 10 key public pages runs in a fresh Playwright context at **390×844** (mobile), cache disabled, **Fast 3G** (`1.6 Mbps` down, `750 kbps` up, `150 ms` RTT), and **4× CPU slowdown** via CDP.
- **Strict budgets (not loosened):** `LCP < 2500 ms`, `CLS < 0.1`, `first-load transfer < 1.50 MB` (`1,572,864` bytes).

## Measured results on today's public build (`speed-check: 9 FAILED`, `exit 1`)

| Page | Route | LCP (ms) | LCP element | CLS | Transfer (KB, gzip) | Reqs | Budget | Top 3 resources |
|---|---|---:|---|---:|---:|---:|---|---|
| Home | `/` | **11,532** | `h1.u.sdh-h` | 0 | **2,197.2** | 37 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/` (168.9 KB), `/data/results.json` (58.9 KB) |
| Pokémon A–Z | `/pokemon` | **1,771** | `h1.k-h1.u` | 0 | **265.6** | 7 | **PASS** | `/v2.css` (144.1 KB), `instrument-sans` (56.1 KB), `unbounded` (49.9 KB) |
| Pokémon: Garchomp | `/pokemon/garchomp` | **11,052** | `b.k-name.u` | 0 | **2,315.8** | 26 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `/data/results.json` (58.9 KB) |
| Pokémon: Incineroar | `/pokemon/incineroar` | **11,018** | `b.k-name.u` | 0 | **2,353.0** | 23 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `/data/results.json` (58.9 KB) |
| Pokémon: Mega Absol | `/pokemon/absol-mega` | **11,085** | `h1.k-h1.u` | 0 | **2,315.8** | 26 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `/data/results.json` (58.9 KB) |
| Natures | `/natures` | **10,941** | `p.k-lead.ra-lede` | 0 | **2,136.2** | 22 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `instrument-sans` (56.1 KB) |
| Popular Sets (items) | `/sets` | **10,996** | `h1.k-h1.u` | 0 | **2,247.9** | 31 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `/data/results.json` (58.9 KB) |
| Meta / Ratings | `/meta` | **11,069** | `p.ra-lede` | 0 | **2,249.2** | 40 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `/data/results.json` (58.9 KB) |
| News & Gifts | `/gifts` | **10,875** | `h1.k-h1.u` | 0 | **2,118.5** | 26 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `instrument-sans` (56.1 KB) |
| My Team | `/team` | **11,293** | `h1.tm-name.k-h1` | 0 | **2,137.3** | 29 | FAIL (LCP, transfer) | `/v2.js` (1,794.9 KB), `/v2.css` (144.1 KB), `instrument-sans` (56.1 KB) |

**CLS is 0.0000 on all 10 pages.** `/pokemon` passes all budgets (`1.77 s` LCP, `266 KB`), proving static HTML without `v2.js` hits the `< 2.5 s` target cleanly.

## Top 5 fixes by size of win (with `file:line`)

1. **Stop inlining 1.56 MB of base64 item WebPs into `v2.js` on `--public` (`app/build.mjs:60`) — ~1.18 MB gzipped / ~6 s LCP win**
   - `app/build.mjs:60` checks `!process.argv.includes('--one-art-size') || process.argv.includes('--item-files')`. Because `--public` is run with `--one-art-size` and without `--item-files`, `ITEM_IMG` inlines 174 base64 `data:image/webp` strings totaling **1,563 KB** directly into `v2.js`, pushing `v2.js` to **3.65 MB raw / 1,795 KB gzipped** (already over the 1.5 MB transfer budget alone). Making `PUBLIC` imply `--item-files` (serving `art/items/*.webp` on demand) immediately drops all 9 SPA pages under the 1.5 MB transfer budget (~1.0–1.15 MB) and cuts ~6 s off Fast 3G LCP.
2. **Enable `--split-routes` by default on `--public` and avoid render-blocking `<script src="/v2.js">` (`app/build.mjs:99,180,203`) — ~2–4 s LCP win**
   - Every SPA page currently downloads and parses all 57 page scripts in one monolithic blocking `<script src="/v2.js">` before rendering its `<h1>` / LCP text. Enabling `--split-routes` for `--public` (already implemented in `app/build.mjs`) plus static-rendering the initial hero/heading (or deferring non-critical scripts) lets landing pages paint their LCP element without waiting for the entire app bundle.
3. **Use shared `/v2.css` on `index.html` instead of inlining 844 KB of `<style>` (`app/build.mjs:198,298-299`) — ~144 KB gzipped HTML win on `/`**
   - `app/build.mjs:298-299` extracts `/v2.css` for the sub-pages (`ph`), but `index.html` (`/`) keeps the full **844 KB raw (~144 KB gzipped)** `<style>` inline (making `/` `168.9 KB` gzipped HTML instead of ~25 KB and uncacheable across pages). Enabling `SPLIT_CSS` for `--public` shares one immutable `/v2.css` across every page including `/`.
4. **Trim `/v2.css` (820 KB raw / 144 KB gzipped) — especially for static pages like `/pokemon` (`app/build.mjs:298`, `app/static-pages.mjs`) — ~100+ KB gzipped win**
   - `/v2.css` bundles all 27 CSS layers (including large legacy/tool styles) and accounts for **54%** of `/pokemon`'s entire transfer (`144.1 KB` of `265.6 KB`). Splitting a minimal static/shell CSS or dropping unused v1 rules from the v2 public stylesheet cuts transfer and CSS parse time on every page.
5. **Load only the `/data/*.json` files needed by the active route on first paint (`app/src/app/03-persistence.js:68-74`) — ~100–250 KB + 10–15 requests win**
   - `03-persistence.js:74` subscribes to all 17 `META_KEYS` immediately on page load, triggering parallel `/data/*.json` fetches (including `/data/results.json` at `58.9 KB` gzipped) even on `/natures` or `/gifts` where most of them are not needed for first paint. Prioritizing the current route's data (and deferring the rest until after first paint / idle) reduces Fast 3G contention with LCP resources.

## Verification
- `node app/test/speed-check.mjs` → ran all 10 pages cleanly, reported exact numbers, exited `1` (`speed-check: 9 FAILED`, budgets not loosened).
- `node experiments/syntax-check.mjs` → `syntax-check: all 418 scripts parse` (exit 0).
- Not wired into `test.yml` (today's build fails 9/10 pages on the strict budgets; HH decides when to gate it after taking fixes).
