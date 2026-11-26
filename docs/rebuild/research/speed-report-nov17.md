# NastyPlot v2: why start-up is slow on a mid-range phone

Look-only measurement. Report written Tue Nov 17 11:40 AM EST 2026 (clock). No site code was edited and nothing was committed.

## How it was measured

- Page: `node build.mjs --v2 --preview-data`, from the working tree at 2d5dd79e. Other sessions' uncommitted edits were present.
  Copied to `scratchpad/speed/v2.html` (3,612,260 bytes). Art is served from `app/src/v2/art`.
- A local server sends text files gzip -9 (brotli on a second port). Headless Chromium 153 (Playwright).
  - Phone: 412x823 at DPR 1.75. Fresh profile and cache off for each run.
  - Throttling: CDP CPU 4x. "4G" = 9 Mbps / 1.5 Mbps / 165 ms. "Slow 4G" = 1.44 Mbps / 0.675 Mbps / 562 ms.
- Counts are medians: 3-5 runs per case for metrics, 3 traces per page for the breakdowns.
- Function attribution:
  - Chrome traces with the V8 sampler, mapped back to source files through an esbuild source map of the exact shipped script.
    The rebuilt script was checked byte-identical to the one in v2.html.
  - Plus Long Animation Frame (LoAF) entries for untraced runs.
- Caveats (please read):
  - The machine was shared with other sessions running browsers (load average 3.4-4.1 on 4 cores).
    Run-to-run noise on "main content" is about ±300 ms. Differences smaller than that are not shown reliably by untraced runs.
  - Tracing inflates times by roughly 30-40%. The 1 s freeze is ~1.04 s traced and 0.66-1.02 s untraced here.
  - This CPU (Xeon 2.1 GHz) is faster than the outside review's machine, so the review's absolute numbers are higher.
    The proportions match.
- Tools (all in `scratchpad/speed/tools/`): `run.cjs` (metrics/trace), `tasks.cjs`, `phases.cjs`, `prof.cjs` and `selftot.cjs`
  (attribution), `scroll.cjs`, `cov.cjs` (coverage), `mapbuild.mjs` and `where.cjs` (source map). Raw data is in `scratchpad/speed/out/`.

## Baseline numbers (measured, untraced, 4x CPU, gzip)

| | FCP | LCP | Main content drawn | TBT | Longest task |
|---|---|---|---|---|---|
| Home, 4G (5 runs) | 824 ms | 1,588 | 2,733 | 1,336 | 701 |
| My Team, 4G (5 runs) | 872 | 1,756 | 3,019 | 2,195 | 737 |
| My Team, 4G (5 interleaved runs) | – | – | 2,611 | 1,926 (5 s window) | ~620 |
| Home, slow 4G (3 runs) | 2,684 | 6,848 | 8,030 | 2,189 | 713 |
| My Team, slow 4G (3 runs) | 2,644 | 6,784 | 8,024 | 2,068 | 769 |

"Main content drawn" means the loading panel in `#main` was replaced by the page (MutationObserver). FCP is the static header plus
loading panel. LCP is a header text span, so it is not the main content.

## 1. Where the start-up main-thread time goes

Traced, 4x CPU, 4G. Median of 3 traces per page, in ms.

| Phase | Home | My Team | What it is |
|---|---|---|---|
| HTML bytes: decode, tokenize, body finish | ~550-650 | ~550-650 | ParseHTML ~185-207, TextResourceDecoder ~100-170, BodyLoadingFinished 40-70, PumpTokenizer 50-70. Scales with the 3.6 MB HTML. |
| Preview data script, compile | 54 | 47 | Parsing the 1.17 MB string literal in `<head>` (Preview only) |
| Preview data script, run (JSON.parse) | 72 | 62 | JSON.parse of 1,165,576 chars of daily data (Preview only). Standalone: 48 ms. |
| CSS parse | 102 | 81 | 464 KB of CSS. pages.css alone is 374 KB without comments. |
| Main script, compile (on the main thread) | 273 | 185 | 1.77 MB inline script. The whole closure is parsed eagerly; inner functions are pre-parsed. |
| Main script, run | 111 | 114 | Tables (00-main.js byName/norm etc., ~16 ms) + data-table JSON.parse (~11 ms sampled; 14 ms total standalone) + first draw of the loading shell (V2.draw ~21 ms) + listeners |
| Daily-document callbacks (cleaners) | 461 | 549 | cleanEvents ~120-175 ms **twice**, noteDataDate/toLocaleDateString 40-70, cleanMeta, cleanPractice. About 40% of this is duplicate (see 2a). |
| **Data-arrival redraw = the ~1 s freeze** | **1,036** | **1,039** | See below |
| ...of which style + layout | 127 | 157 | |
| Second full redraw (700 ms timer) | 341 | 108 | Pure waste (see 2a) |
| Background: suggestions planner | – | 5,410 (15 tasks >50 ms, longest 321-451) | team.js `step` running planAllG |
| Background: winners-pass trigger at ~10 s | – | 86 | sugs.js `go`. The daily ckwin snapshot matched, so only one redraw. |
| Long tasks, total | 2,925 | 4,461 | |

Embedded data size:
- Preview daily data: 1,165,576 chars (255.6 KB gzip). By document:
  - results 264 KB, events 232 KB, model 228 KB, practice 131 KB, doubles 92 KB, doubles_tour 82 KB.
  - Smaller: track 36 KB, perf 31 KB, history 28 KB, teams 21 KB, doubles_ingame 9 KB, calendar 7 KB, weekly 3 KB.
- Built-in tables in the script: data.js 515 KB raw (SETS 163, RESULTS 155, LEARN 81, ROSTER 51, PERF_RAW 31, ABIL 19, MOVES 13).
  Also NP_LOGO 74 KB and MOVE_META 22 KB.
- All big tables already ship as `JSON.parse('...')`. Measured JSON.parse at 4x: 14 ms for all of them (SETS 5.0, RESULTS 4.3, LEARN 1.9).
- **The embedded data's JSON.parse is not the problem.** The cost is in compiling and tokenizing a 3.6 MB HTML file, and in the
  work done when the data arrives.

**The ~1 s freeze is one task.** It is the redraw that runs inside the last daily document's callback.
`03-persistence.js` metaJoin → emit → `scheduleRender` (bridge.js:14 "draw now") → `V2.redraw` → page `draw()`.

Inside it on My Team (traced, inclusive ms):
- `V2.teamData` 413:
  - `proChecks` → `prepOf` 241 → `teamReport` 235 (threat duels, damage calc).
  - Also `CH.four` 45 and `V2.planStart` 38 (sets up the planner generator).
- `V2.sixHtml` 301, almost all of it `ratings()` 291 (13-rating.js:71).
  It works out the rating of every ROSTER Pokémon on first use after the data arrives, through setFor/defSet, perfModel and metaAbility.
- Other section HTML: about 60-100.
- `V2.redraw` itself: 205 ms self (shell.js:291-292). That is the template parse and `V2.morphKids` merge, plus the style and
  layout it forces (layout 128, text shaping 40).

On Home: `V2.homeFight` 362 (`V2.scoreNow` 263, the team score → teamReport), `V2.homeMeta` 225 (`lairRows` → `ratings()` 220), then
the DOM merge and layout of about 100-200.

So the freeze is roughly:
- ratings table: ~25-30%
- your team's analysis: ~25-30%
- HTML for the rest of the page: ~20%
- DOM merge plus layout: ~20-25%

## 2. What runs at start that the first screen doesn't need

a) **Every daily document is processed twice, and that triggers a second full redraw.** (Measured.)
   - `metaJoin` subscribes to `meta/<k>` and `meta/<k>_2`. When the empty `_2` answers, it calls `emit()` again.
   - That re-runs the cleaner (cleanEvents ~120-175 ms again) and bumps `metaVersion`.
   - The last `_2` answer (calendar_2) arrives after `dataReady`. It sets the 700 ms `scheduleRender` timer, which brings:
     - a second full redraw: Home 213-388 ms, My Team 91-190 ms traced
     - `ratings()` computed again (`ratingCache` key includes metaVersion)
     - **the suggestions planner thrown away and restarted** (`planKeyOf` includes metaVersion): ~0.5-0.7 s of CPU wasted.
   - Test copy `x1-noemit2.html`: one minified line changed so `_2` emits only if it exists or existed.
     - Same final page text (hash checked on Home and My Team).
     - Doc callbacks before the redraw: 549 → 320 ms traced. One cleanEvents instead of two. No second redraw.
     - TBT: My Team −321 ms (interleaved runs: 1,926 → 1,605) and −424 ms (5-run sets). Home −246 ms (1,336 → 1,090).
     - Home time to quiet: 3.76 → 2.57 s.
     - Main content drawn: no difference beyond the noise in interleaved runs (2,611 vs 2,661).
       Expected about −150-230 ms from the traced callback time removed; not shown at this noise level.
b) **The suggestions planner starts immediately on My Team.** It costs 4.4-5.8 s of CPU at 4x (traced), in 12-15 tasks over 50 ms,
   longest 263-451 ms. On a phone the suggestions are below the first screen.
c) **About 25% of the script never runs on Home/My Team start.** JS coverage of both loads, 12 s each:
   - 48 files are under 10% executed: 441,797 of 1,768,298 chars.
   - Pages: battle, build, pokemon, calc, meta, box, winning, events, usage, types, compare, build-sheet, practice, thisweek,
     track, share-slab/tape, sets, speed, guide, owner, gauntlet, archetypes.
   - Shared logic: 22-auto-build, 44-share-images, 23-coverage, 45-team-links, 21-sets, and data files for those pages.
   - It is still downloaded, decoded, tokenized and pre-parsed. Estimated ~25% of the 185-273 ms compile and ~130-150 KB gzip.
d) **Built-in fallback data that the daily data replaces.** RESULTS is 155 KB raw / 26 KB gzip and PERF_RAW 31 KB.
   This is bytes only: JSON.parse is ~5 ms.
e) **The 15 daily documents all gate the first numbers.** `V2.dataReady` waits for every key in META_KEYS.
   - practice (131 KB) is used only by the Practice page.
   - track, history, calendar and weekly may not be needed by the Home/My Team first screen. My guess, not yet checked page by page.
   - In the Preview all documents answer within milliseconds, so this costs nothing here.
   - On the live store the slowest document decides when numbers appear. Not measured: there is no live store here.
f) Small one-off costs:
   - `noteDataDate → dataDateText → toLocaleDateString`: 40-70 ms traced on first call, mostly locale setup.
   - Preview only: the head data script, 100-200 ms traced plus its share of HTML decoding.

## 3. The My Team scroll hitch (reproduced)

`scroll.cjs`: load My Team on 4G at 4x CPU, then scroll down in six 900 px flicks.
(Synthesized touch scrolls don't move the page in headless Chromium, so mouse gestures were used.)

- **Scrolling 0.5 s after main content: in 3 of 3 runs, one 200-250 ms frame stall plus 3-5 stalls of 80-100 ms.**
  Every one is a `TimerHandler:setTimeout` → `step` (v2/pages/team.js:37, the suggestions planner).
  - One stall was the sugs.js:54 IntersectionObserver firing `go` → ckWinRefresh (57 ms).
- **Scrolling 14 s after load, when everything has settled: no frame gap over 80 ms in 3 of 3 runs.**
- Why a slice runs 200-450 ms even though `step` stops at 30 ms: the budget is only checked between generator yields, and some
  single yields are long. Traced:
  - `planFixesG` set-up before the first yield, 290 ms: `poolOK` → `ratings()` recomputed (177 ms) because of 2a, plus
    itemProblemCount and assignItems.
  - One `tsOf(team)` → `teamReport` per candidate team: ~190 ms each.
  - The hidden-gems search set-up (`withOffMeta`): 205 ms.
  - `planWarmG` yields once per `prepOf(team)`.
- On a real phone the scroll itself runs off the main thread. What stalls is anything tied to the main thread during a scroll:
  the jump-bar marker, lazy images, and taps.

## 4. Bytes (first visit, measured transfer)

| | Uncompressed | gzip -9 | brotli |
|---|---|---|---|
| **HTML total** | 3,612 KB | **922 KB** | 700 KB |
| – preview daily data (Preview only) | 1,251 | 256 | 194 |
| – main script | 1,770 | 552 | 426 |
| &nbsp;&nbsp;data tables (data.js, logo, move-meta, items, types) | ~623 (minified) | ~165 | |
| &nbsp;&nbsp;shared logic, src/app (62 files) | ~572 (minified) | ~234 (per file) | |
| &nbsp;&nbsp;v2 pages (37 files) | ~522 (minified) | ~193 (per file) | |
| &nbsp;&nbsp;v2 shell, bridge, test hook | ~41 | ~14 | |
| – CSS | 464 | 79 | 64 |
| – static first screen | 102 | 19 | 11 |
| – other | 25 | | |
| Fonts | | 108.6 KB (Unbounded latin 51 + Instrument Sans latin 57.5) | |
| Images, Home | | 311 KB (13 webp sprites) | |
| Images, My Team | | 167 KB (318 KB once lower ones load) | |
| **Total first visit** | | **Home ≈ 1.34 MB, My Team ≈ 1.20-1.35 MB** | |

- With "no-store" headers the preloaded Unbounded font downloaded twice (+51 KB). With cacheable headers it downloaded once.
  How the artifact host behaves was not checked.
- The sprites are 384 px files shown at 44-80 px (or 77-140 device px).
  - Re-encoding the 13 Home sprites (webp q80, measured): 309 KB → 88 KB at 144 px, or 125 KB at 192 px.
- The live site will not embed the preview data (−256 KB gzip). It will still have to load those documents from the store.

## 5. Fixes, ranked by measured or estimated gain

Each fix lists what to change, the saving (labelled), the risk, and a test that proves it.

1. **Stop the duplicate document processing** (`app/src/app/03-persistence.js` metaJoin: re-emit on `_2` only when part 2 exists
   or changed).
   - Also only bump `metaVersion` and redraw when a document's content changed.
   - Saving, **measured** on a test copy:
     - TBT −246 ms (Home) and −321 to −424 ms (My Team).
     - Removes the second full redraw (110-390 ms), one cleanEvents (~120-140 ms), a ratings recompute (~180 ms) and the
       planner restart (~0.5-0.7 s CPU).
     - Home goes quiet 1.2 s sooner.
     - Main content: estimated −150-230 ms, below the noise here.
   - Risk: low. Two-part documents still join.
     - Not checked: whether the real store calls back once for a missing `_2` (it probably does, as in the Preview).
   - Test:
     - Count callbacks: 15, one per key.
     - One cleanEvents in a trace. No `bridge.js:15` redraw after main content.
     - Same `#main` text hash.
     - A two-part document (split-docs.mjs fixture) still joins.
2. **Break up the ~1 s data-arrival redraw.** The freeze is the goal's main blocker.
   - (a) Make `ratings()` cheap at start: 220-290 ms traced. Two options:
     - Ship the ratings map with the daily data, stamped like `E.ckwin`, for the default `ui.metaSrc`.
     - Or cache it in localStorage keyed by the data stamps (helps repeat visits only).
   - (b) Draw in two passes:
     - First the hero, score and six cards.
     - Then, in a later task, the below-the-fold sections (matchups, suggestions, team checks). Sections in
       `v2/pages/team.js draw()` and `home.js`.
   - (c) Optional: skip the template-parse-and-merge when the old `#main` is only the loading panel. Swap it in directly.
     Morph plus layout is about 205 ms.
   - Saving, **estimated from the profile**: the longest task drops from ~1.04 s traced (0.7 s untraced) to about 0.4-0.5 s
     traced. Main content about −200-300 ms.
   - Risk: medium. Ratings must match exactly (golden.mjs and same-grade.mjs). A two-pass draw must keep focus, scroll and
     `after()` behaviour.
   - Test:
     - LoAF/long-task max under 500 ms traced, with no task over 1 s, in 5 runs on Home and My Team.
     - The ratings map from the snapshot deep-equals `ratings()` computed in the page.
     - The `#main` text hash is unchanged.
3. **Calm the suggestions planner.** This is the scroll hitch, and 4.4-5.8 s of background CPU.
   - Start it like the winners pass already does (sugs.js `ckWinSoon`): when Suggestions comes within a screen, or after idle.
   - Run it in `requestIdleCallback` and pause while scrolling.
   - Make each yield smaller. Yield inside `teamReport`/`tsOf` per threat, and before and after the `planFixesG` set-up and
     the `withOffMeta` set-up. Fix 1 already removes the 177 ms ratings recompute from the set-up.
   - Saving, **measured** for the symptom: the stalls exist only while the planner runs (0 gaps over 80 ms once settled).
     Expected no frame gap over 100 ms (estimated).
   - Risk: low to medium. The suggestions must be identical, and today's page shares `planAllG`.
   - Test:
     - `scroll.cjs 500 3`: no frame gap over 100 ms, and no LoAF over 100 ms from `step`.
     - The same top three suggestions and Strength Score deltas as before, for the sample team and 3 saved teams.
4. **Move the main script into its own file** (`app/build.mjs`: write `dist/v2.js` and load it with `<script src>` at the same spot).
   - Saving, **measured** on a test copy:
     - First visit: main-thread HTML and compile work 600-700 → 240-260 ms traced (compile moves off the main thread).
       TBT −150 ms. The start-up task drops from 400-650 to 200-300 ms.
     - Main content: no change on a first visit.
     - Repeat visit with the script cached: main content 1,947 → 1,479 ms (−470 ms), TBT −294 ms, 552 KB less to download.
   - Risk: low to medium.
     - The Preview and live publish must carry the extra file (like the fonts and sprites).
     - Repeat-visit gains depend on the host's cache headers (not checked for the Claude artifact host).
     - The build's static-first-screen step must still work.
   - Test:
     - `REPEAT=2 node run.cjs team 4g metrics 3`.
     - Trace: no V8.ParseProgram over 50 ms on the main thread.
     - The artifact file list includes v2.js.
5. **Fewer bytes.**
   - (a) Brotli where the host allows it. **Measured**: HTML 922 → 700 KB. My Team main content on slow 4G 8.0 → 6.7 s (−1.3 s).
     About −0.27 s on 4G (noisy).
   - (b) Load the 48 not-needed-at-start files after the first draw or on route. **Estimated**: ~130-150 KB gzip and ~25% of
     compile. Risk medium (routes, search and `V2.pages` registration).
   - (c) A small sprite size for the small spots. **Measured re-encode**: Home −220 KB, My Team about −110 KB. It needs Sim's eye
     on the quality, because the large sprites stay large.
   - (d) Drop or lazy-load the built-in RESULTS fallback (26 KB gzip).
   - Test: transferred bytes per page in `run.cjs`. Slow 4G main content in 3 runs.
6. **Faster cleanEvents.** Memoize `canonMove`, `canonAbility` and `canonItem` by (name, Pokémon) in
   `app/src/app/10-team-strategy.js`, or canonicalize the event `dict` once.
   - Saving, **estimated**: canon* is ~86 of ~130 ms per pass, so about −70-100 ms before the main draw.
   - Risk: low. These are pure functions of static tables.
   - Test: `cleanEvents(out/events.json)` deep-equals before and after, and timed at 4x.
7. **Wait only for the documents the page needs** before drawing numbers (`V2.dataReady`).
   - Saving: **my guess, not yet tested**. Nothing in the Preview, possibly a lot on the live store.
   - Risk: medium. Pre-launch check 1 waits on purpose to avoid numbers swapping, so first confirm per page which documents
     its numbers read.
8. Small items:
   - Format the data date without the first `toLocaleDateString`: −40-70 ms traced (estimated).
   - Split pages.css (374 KB, parse 55-117 ms). Not measured per page: cascade layers make Chrome's CSS coverage count whole layers as used.
   - Preview only: put the preview data in a .json file fetched next to the page, to save 100-200 ms traced of head script.

**Against the goals** (estimates, not yet tested together):
- Fixes 1+2+6 remove about 0.5-0.8 s traced (~0.35-0.55 s untraced) of main-thread work before My Team's main content.
  That brings it from 2.6-3.0 s to about 2.2-2.5 s on this machine on 4G. Fix 5a adds about −0.3 s.
- Fix 2 is required for "no 1 s freeze". Fix 1 alone does not touch the first redraw.
- Fix 3 removes the scroll hitch.
