# NastyPlot stress.html: performance stress test (look-only)
Headless Chromium (Playwright) on a 4-core cloud VM, files served from disk through npopen-style routing (no network delay).
Numbers are measured but noisy: headless, no GPU, shared CPU. Treat differences under ~30% as noise. Scripts: perf.cjs, probe*.cjs; raw data: raw-*.json, log-*.txt.

## 1. Load (390x844, 3 runs each, median shown)
File: stress.html = 3,856,587 bytes (1.04 MB gzipped). Inside it: app script 2.21 MB, preview data blob `D` 1.17 MB, CSS 441 KB, roster JSON 51 KB.
How: PerformanceObserver 'paint' / 'largest-contentful-paint' / 'longtask' via addInitScript; navigation timing; "ready" = #main has children and >20 chars of text. 4x = CDP Emulation.setCPUThrottlingRate 4.
| Route | CPU | First paint | FCP (=LCP) | DOMContentLoaded | Ready | Long tasks | Longest |
|---|---|---|---|---|---|---|---|
| #home | 1x | 220 ms | 576 ms | 555 ms | 702 ms | 2 | 306 ms |
| #team | 1x | 172 ms | 548 ms | 552 ms | 955 ms | 4 | 309 ms |
| #home | 4x | 464 ms | 1,940 ms | 1,939 ms | 2,391 ms | 5 | 1,241 ms |
| #team | 4x | 492 ms | 1,992 ms | 2,049 ms | 2,735 ms | 7 | 1,245 ms |
The first paint is an empty shell; real content appears with FCP. One ~300 ms (1x) / ~1.2 s (4x) task blocks the page during startup: parsing and running the 3.4 MB of inline script. No 404s, no page errors.

## 2. Route switch (390x844; second pass, so warm; time from setting location.hash until a new #main is in the DOM, then one frame)
| Route | 1x drawn | 4x drawn | DOM nodes (page) |
|---|---|---|---|
| home | 32 | 117 | 693 |
| team | 54 | 163 (190 painted) | 925 |
| build | 19 | 89 | 695 |
| battle | 10 | 58 | 279 |
| meta | 29 | 156 | 915 |
| usage | 19 | 73 (130 painted) | 554 |
| sets | 21 | 69 | 428 |
| tournaments | 23 | 102 | 710 |
| events | 20 | 137 | 723 |
| archetypes | 19 | 87 (119 painted) | 423 |
| weekly | 22 | 76 | 588 |
| track | 15 | 110 (206 painted) | 487 |
| calc | 36 | 204 | **2,938** |
| speed | 16 | 88 | 490 |
| types | 13 | 61 | 1,516 |
| practice | 8 | 45 | 258 |
| gauntlet | 15 | 81 | 812 |
| method | 37 | 114 | 653 |
| box | 12 | 59 | 518 |
| compare | 6 | 27 | 179 |
| pokemon=kingambit | 14 | 63 | 721 |
**No route breaks the thresholds (300 ms normal / 1,200 ms at 4x).** First visits (cold, pass 1) are slower; worst cold ones at 4x: gauntlet 679 ms (one 608 ms long task), team 455 ms (246 ms task), tournaments 327 ms, calc 237 ms. Cold 1x worst: gauntlet 162 ms.
Note: the whole shell is re-rendered on each route (#main is a new element every time), not only the content.

## 3. Long tasks (>50 ms)
| When | Count | Longest |
|---|---|---|
| Page load 1x / 4x | 2-4 / 5-7 | ~306 ms / ~1,245 ms |
| Warm route switches 1x (all 21) | 0 | 0 |
| Warm route switches 4x | 9 of 21 routes had 1-2 | 167 ms (calc), 142 ms (team) |
| Cold first visit 4x | gauntlet 1, team 4, calc 7, archetypes 5 | 608 ms (gauntlet), 246 ms (team) |
| Wheel-scroll top to bottom (meta, team, weekly, events; 1280 and 390) | 1 in 8 runs | 64 ms (team, 1280) |

## 4. Scroll smoothness (mouse.wheel 120 px every 16 ms, rAF timestamps)
| Page | Width | Height | Frames | Median frame | p95 | Max | Dropped |
|---|---|---|---|---|---|---|---|
| meta | 1280 | 2,945 | 65 | 16.7 | 33.3 | 33.3 | 9.8% |
| team | 1280 | 2,513 | 53 | 16.7 | 16.8 | 49.9 | 5.4% |
| weekly | 1280 | 2,926 | 55 | 16.7 | 16.8 | 33.3 | 1.8% |
| events | 1280 | 2,566 | 48 | 16.7 | 16.8 | 16.8 | 0% |
| meta | 390 | 3,482 | 88 | 16.7 | 33.3 | 33.4 | 5.4% |
| team | 390 | 4,286 | 88 | 16.7 | 33.4 | 66.7 | 9.4% |
| weekly | 390 | 5,167 | 103 | 16.7 | 16.8 | 66.7 | 3.8% |
| events | 390 | 4,954 | 92 | 16.7 | 16.8 | 16.8 | 0% |
Meaning: smooth overall; meta and team drop up to ~10% of frames (single 33-67 ms frames). Headless software rendering exaggerates this; it does NOT show what Sim's Windows mouse-wheel or iPhone sees, so confirm on real devices (sprite filters/glow are the usual cost on GPU-less paint).

## 5. Memory (CDP Performance.getMetrics after forced GC, all 21 routes per loop, 6 loops)
| Loop | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| JS heap MB | 67.0 | 67.4 | 67.7 | 67.7 | 67.8 | 67.9 |
| DOM nodes / listeners | 1035 / 224 | same | same | same | same | same |
**No leak**: nodes and event listeners are flat; heap grows ~0.2 MB/loop and flattens (likely caches; not proven, a heap snapshot diff would tell). The 67 MB baseline is high for a phone: it is the embedded data. Biggest DOM: calc 2,938 nodes, types 1,516. **No route > 4,000.**

## 6. Rapid resize (390 > 1440 > 700 > 1100 > 320 > 1920, 200 ms apart, no reload) on team, meta, home, calc
| Route | Page horizontal overflow at any step | Stuck widths after | Page errors |
|---|---|---|---|
| team | none (scrollWidth = clientWidth every step) | none | 0 |
| meta | none | none | 0 |
| home | none | none | 0 |
| calc | none | none | 0 |
Elements extending past the right edge exist, but all sit inside intended scrollers or clipped boxes: meta `.gs-rows` (overflow-x:auto, 281 elements) and `.ra-filt` chips; team/calc decorative `.mc-giant`/`.mc-orbit`/`.mc-glow` inside `.mc-in` (overflow:hidden); home rank list `.hm-rk` in a scroller. My first pass flagged 176 width differences on #team vs a fresh 1920 load; re-checking with a longer wait (probe2.cjs) showed identical layouts, so that was my measurement timing (fresh page compared before its later sections finished), not a bug.

## 7. Images (1280x900, after render)
| Route | Images | Lazy | Route | Images | Lazy |
|---|---|---|---|---|---|
| home | 35 | 35 | weekly | 39 | 39 |
| team | 14 | 14 | track | 6 | 6 |
| build | 52 | 52 | calc | **158** | 158 |
| battle | 6 | 6 | speed | 26 | 26 |
| meta | 83 | 83 | types | 7 | 7 |
| usage | 17 | 17 | practice | 14 | 14 |
| sets | 13 | 13 | gauntlet | **142** | 142 |
| tournaments | 24 | 24 | method | 10 | 10 |
| events | 78 | 78 | box | 40 | 40 |
| archetypes | 25 | 25 | compare | 0 | 0 |
| | | | pokemon=kingambit | 6 | 6 |
Every image is loading="lazy"; 0 broken; 0 data-URI images; **no image file > 300 KB** served on any route.
Caveat: images seen once are re-rendered without lazy (SPR_SEEN), so counts are right but "lazy" reflects the attribute at first sight.

## Worst offenders
1. Startup: one 1.2 s blocking task at 4x CPU (≈ mid-range phone): parse+run of 3.4 MB inline JS (2.2 MB app + 1.2 MB data). FCP ~1.9-2.0 s, ready 2.4-2.7 s at 4x.
2. Cold first visit to #gauntlet at 4x: 608 ms long task (679 ms to draw). #team cold 455 ms.
3. 67 MB JS heap at rest (data held in memory).
4. calc: 2,938 DOM nodes and 158 images (largest page); 204 ms warm switch at 4x.
5. Scroll frame drops up to ~10% on meta and team (headless, likely overstated).

## Suggestions, ranked by impact
1. Move the 1.17 MB preview data blob out of the inline script into a JSON file fetched (or a `<script type="application/json">` parsed lazily per page). Reason: JSON.parse of a string is much faster than parsing it as JS, and pages could load only their slice; biggest win for the 1.2 s phone startup. (guess, not yet tested: expect several hundred ms off at 4x.)
2. Defer work not needed for the first screen (e.g. build per-page code/data on first visit rather than at startup). Reason: the startup long task is the only thing over a phone's comfort budget.
3. Profile #gauntlet's first render (608 ms task at 4x) and cache or split it. Reason: the single slowest interaction after load.
4. Split CSS (441 KB inline) or trim unused layers. Reason: style recalculation on every full-shell re-render scales with rule count; also bytes on first load.
5. Render only #main on route change instead of the whole shell. Reason: today the header/nav are rebuilt each time (#main is a new element); cheap now, but it adds to every switch at 4x.
6. calc: render the 158-sprite picker on demand (or virtualise). Reason: halves its DOM and image count.
7. Check scrolling on Sim's real devices (Windows mouse wheel, iPhone) before acting on the 5-10% drop numbers. Reason: headless software paint is not representative.
Not a problem today: route switch speed, memory leaks, DOM size limits, resize recovery, image sizes, lazy loading.
