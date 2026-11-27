# Job 67 — Speed Chain on iPhone/iPad (WebKit 18.2) + Chromium (`alt/gemini-speed-webkit`, on `c75b8716`)

Checked the full `64c + 65 + 66` speed chain (`c75b8716`) on the real deploy folder (`node public-site.mjs` with `origin/main` `out/`, restored cleanly after; `out/` untouched) in **WebKit 18.2** (`iPhone 15`, `iPhone SE`, `iPad Pro 11`) and **Chromium**.

**Result: No app code changes needed.** All checks passed in WebKit and Chromium. Added reusable script `experiments/webkit-speed-check.mjs`.

## 1. What Could and Couldn't Be Throttled / Measured in WebKit
- **Network throttling (`150 ms` RTT + `1.6 Mbit/s` = `200 KB/s`):** enforced directly in the local Node HTTP server (`experiments/webkit-speed-check.mjs`), so both WebKit and Chromium received the exact same slow-network latency and throughput.
- **CPU throttling (`4x`):** Chromium-only (CDP `Emulation.setCPUThrottlingRate`); WebKit ran at `1x` CPU.
- **WebKit 18.2 `PerformanceObserver.supportedEntryTypes`:** `["mark", "measure", "navigation", "paint", "resource"]` — WebKit does **not** expose `largest-contentful-paint` or `layout-shift`. Therefore:
  - Speed in WebKit is measured via `first-contentful-paint` (FCP), full hydration ready time, and gzip transfer bytes (`< 1.50 MB`).
  - Layout stability in WebKit is measured directly by comparing prerendered (`v2.js` held) vs hydrated (`V2._dataOk` + `V2.redraw()`) bounding boxes (`dY(h1)`, `dH(h1)`, `dY(sub)`) and computing equivalent CLS (`eqCLS < 0.1`), plus checking for old Home (`.sdh`) flash and broken images.

## 2. WebKit Font-Swap Overlap Check (`.woff2` Blocked vs Real `Unbounded`)
Note: WebKit's `Range.getClientRects()` includes font ascent+descent box padding (~1.25 em) even for real `Unbounded` at `line-height: 1.0`. Visually verified on iPhone 15 `0 ms` fallback screenshot: bold, crisp, zero touching glyphs, and strictly tighter than real `Unbounded` on every device (`6/6 PASS`):

| Device | Route | Fallback (`woff2` blocked) | Real `Unbounded` | Status |
|---|---|---:|---:|---|
| **iPhone 15** (`390x844`) | `/` | `5 px` (`3L`) | `7 px` (`3L`) | **PASS** |
| **iPhone 15** (`390x844`) | `/pokemon/garchomp` | `8 px` (`2L`) | `11 px` (`2L`) | **PASS** |
| **iPhone SE** (`375x667`) | `/` | `5 px` (`4L`) | `7 px` (`5L`) | **PASS** |
| **iPhone SE** (`375x667`) | `/pokemon/garchomp` | `6 px` (`2L`) | `8 px` (`2L`) | **PASS** |
| **iPad Pro 11** (`834x1194`) | `/` | `7 px` (`2L`) | `10 px` (`3L`) | **PASS** |
| **iPad Pro 11** (`834x1194`) | `/pokemon/garchomp` | `11 px` (`2L`) | `16 px` (`2L`) | **PASS** |

## 3. WebKit Prerender vs Hydrated Layout Match (`/`, `/team`)
**`6/6 PASS`** — exact `0 px` delta on every device, `0` flash of old Home (`.sdh`), `0` broken images, `0` page errors:

| Device | Route | `dY(h1)` | `dH(h1)` | `dY(sub)` | `eqCLS` | Old Home Flash | Broken Imgs |
|---|---|---:|---:|---:|---:|---|---:|
| **iPhone 15** | `/` | `0 px` | `0 px` | `0 px` | `0` | `false` | `0` |
| **iPhone 15** | `/team` | `0 px` | `0 px` | `0 px` | `0` | `false` | `0` |
| **iPhone SE** | `/` | `0 px` | `0 px` | `0 px` | `0` | `false` | `0` |
| **iPhone SE** | `/team` | `0 px` | `0 px` | `0 px` | `0` | `false` | `0` |
| **iPad Pro 11** | `/` | `0 px` | `0 px` | `0 px` | `0` | `false` | `0` |
| **iPad Pro 11** | `/team` | `0 px` | `0 px` | `0 px` | `0` | `false` | `0` |

## 4. Slow-Network Speed & Transfer (`150 ms` RTT + `1.6 Mbit/s`): WebKit vs Chromium
- **Chromium (`experiments/page-speed-check.mjs`, Fast 3G + 4x CPU, `390x844`):** `10/10 ALL PASSED` (LCP `429–1,212 ms`, CLS `0–0.0357`, transfer `133.4–1,100.7 KB`; `experiments/first-screen-guard.mjs`: `6/6 ALL PASSED`, `/` CLS `0.0019`, `/team` CLS `0.0055`).
- **WebKit 18.2 (`experiments/webkit-speed-check.mjs`, server-throttled `150 ms` RTT + `1.6 Mbit/s`, `1x` CPU):** **`18/18 ALL PASSED`** (`0` page errors):

| Device | Page | WebKit FCP | Hydrated Ready | Transfer (gzip) | Status |
|---|---|---:|---:|---:|---|
| **iPhone 15** | Home (`/`) | `673 ms` | `4,916 ms` | `1,110.3 KB` (`28 reqs`) | **PASS** |
| **iPhone 15** | Pokémon A-Z (`/pokemon`) | `1,105 ms` | `1,031 ms` | `132.3 KB` (`6 reqs`) | **PASS** |
| **iPhone 15** | Garchomp (`/pokemon/garchomp`) | `737 ms` | `3,646 ms` | `1,060.5 KB` (`24 reqs`) | **PASS** |
| **iPhone 15** | Incineroar (`/pokemon/incineroar`) | `723 ms` | `3,815 ms` | `1,054.3 KB` (`24 reqs`) | **PASS** |
| **iPhone 15** | Mega Absol (`/pokemon/absol-mega`) | `649 ms` | `3,778 ms` | `1,059.3 KB` (`24 reqs`) | **PASS** |
| **iPhone 15** | Natures (`/natures`) | `686 ms` | `4,211 ms` | `1,137.4 KB` (`31 reqs`) | **PASS** |
| **iPhone 15** | Popular Sets (`/sets`) | `917 ms` | `3,895 ms` | `1,167.8 KB` (`29 reqs`) | **PASS** |
| **iPhone 15** | Meta (`/meta`) | `759 ms` | `3,691 ms` | `1,103.7 KB` (`26 reqs`) | **PASS** |
| **iPhone 15** | Gifts (`/gifts`) | `679 ms` | `5,762 ms` | `1,025.4 KB` (`22 reqs`) | **PASS** |
| **iPhone 15** | My Team (`/team`) | `1,042 ms` | `4,054 ms` | `1,197.8 KB` (`29 reqs`) | **PASS** |
| **iPhone SE** | Home / A-Z / Garchomp / My Team | `658–1,036 ms` | `924–4,916 ms` | `132.3–1,146.1 KB` | **PASS** |
| **iPad Pro 11** | Home / A-Z / Garchomp / My Team | `600–1,132 ms` | `867–5,092 ms` | `131.0–1,146.1 KB` | **PASS** |

## 5. Cold-Route Buttons in WebKit (`split-routes-cross-test.mjs` in WebKit 18.2)
- **`25 / 26` PASSED** in WebKit 18.2 (every cold route, lazy module `info-text`/`team`/`build`/`battle`+`gauntlet`/`method`/`types`/`practice`/`compare`, Search action, and 7-page menu sweep passed with `0` errors).
- **1 localhost-HTTP-only console message (`Feedback (cold)`):** WebKit logged a cross-protocol console error when Cloudflare Turnstile's `https://challenges.cloudflare.com` iframe loaded inside the local `http://127.0.0.1` test server (`#fbText2` and `#main h1` rendered normally; production `https://nastyplot.org` is `https://` on both sides).
