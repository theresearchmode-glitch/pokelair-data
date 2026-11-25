# Speed and robustness deep pass (helper, Nov 16, on check317)

# NastyPlot rebuild (check317.html): performance and robustness audit, deeper pass (look-only)

**Setup.** Headless Chromium (Playwright) on a shared 4-core VM with no GPU. "4x" means CDP CPU throttle at 4x, roughly a mid-range phone. "Slow 4G" means 150 ms latency and 1.6 Mbps down. I ran a small gzip server of my own (port 8766, same folder, now stopped) to stand in for a host that compresses. Medians are over 3 to 5 runs unless a count is given. Expect ±30% noise.

I threw away one 1x run at 390 because I had run a census at the same time and it disturbed the timings. The numbers below come from a clean rerun.

Nothing under /home/user/pokelair-data was edited. Scripts and raw output are in /tmp/claude-0/-home-user-pokelair-data/25f65f15-063e-5621-be2b-3a9994dfed43/scratchpad/agents/perf2/ (load.out, inp-4x-390.out, inp-1x-390-clean.out, inp-1x-1440.out, scroll.out, plus the screenshots).

**Correction to last night's report.** It said the 67 MB JS heap "is the embedded data". That is wrong. Home alone holds 10.9 MB after garbage collection. A first visit to My Team adds +52.3 MB, and every other route together adds about 3 MB. Details in M5.

## HIGH (a user would feel it)

**H1. My Team keeps the phone busy for about 13 s after the first visit, and again every day the data changes.**
- Measured at 4x, fresh storage, #team, over 20 s:
  - 72 long tasks after content appears; longest 378 ms.
  - Total blocking time (TBT) after content: 3,376 ms. The last task ends at 14.9 s.
  - Repeat visit (result cached in `np.ckwin`): 19 tasks, TBT 1,071 ms, ends at 6.4 s.
  - At 1x: 5 tasks, longest 117 ms, ends at 2.1 s.
- Effect on taps (4x): input delay reached 788 ms. Day/night toggle on Team: median 576 ms (1056/720/424/576/424). Open Team Sheet: 400 ms, falling to 248 ms once the planner is idle.
- Cause, confirmed with a CPU profile during "open Team Sheet":
  - The "checklist claims" job `ckWinRefresh` in app/src/app/06-helpers.js:177-200 accounts for 1,886 ms of script in 1.5 s at 4x (`step` → `tsOf` → `teamReport` → `duel`).
  - `step()` checks its 3-8 ms budget only *between* winning teams. One team (`tsOf` + `proChecks`) takes about 50-400 ms at 4x, so every slice becomes a long task.
  - Its cache key includes DATA_AT, so it reruns on every daily data change.
  - On top of that, the suggestions planner (`V2.planStart`, pages/team.js:29-35) runs in 30 ms slices. Each slice can overrun by one `next()`.
- Fix:
  - Compute the ckWin rates in the daily data job; they depend only on event winners and the model. Ship them with the data.
  - Failing that, run the job in a Web Worker.
  - Minimum fix: yield between `tsOf` and `proChecks`, and pause the job while the visitor is interacting.

**H2. Slow networks show a blank page for 8 to 23 s.**
- First contentful paint, 4x CPU, home:

| Network | Compression | FCP |
|---|---|---|
| Slow 4G | gzip | 8.0 s (5 runs) |
| Slow 4G | none | 23.0 s |
| Slow 3G | gzip | 22.1 s |

- The first paint (2.1 s on Slow 4G, 7.2 s on Slow 3G) is an empty background.
- Cause:
  - One 3.87 MB HTML file (1.04 MB gzipped).
  - `<div id="app">` is empty until the 2.2 MB app script has run.
  - The 1.17 MB preview-data `<script>` sits before both `<style>` blocks.
  - There is no `<noscript>`.
- Fix:
  - Put a static first screen in body.html's #app: logo plus one loading line, which can later be the featured underdog Sim approved. That loading line is a design change and needs Sim's yes.
  - Move the data and app scripts after the CSS.
  - **Unsure:** whether the artifact host serves gzip or brotli. If it doesn't, Slow 4G FCP is about 23 s; this needs checking on the real host.

**H3. On a mid-range phone, common taps take 250-400 ms (fine at 1x).**
- INP at 4x, 390 wide, median of 5. Clean 1x medians in brackets:

| Action | 4x | 1x |
|---|---|---|
| Meta Find box, per keystroke | 360 | 112 |
| Remove a Pokémon | 384 | 88 |
| Apply a suggestion | 352 | 72 |
| Grandstand → List | 312 | 96 |
| Megas filter | 256 | 72 |
| Open header Search | 232 | 80 |
| Day/night toggle on Meta | 224 | 64 |
| Build tabs | 104 | 40 |
| Pokémon page "Show" fold | 88 | 40 |
| Nav tap Home → Meta | 56 | 32 |

- Cause (trace of one Meta keystroke at 4x):
  - `V2.redraw` takes 323 ms. Of that, 166 ms is the `scrollTo(0, y)` at shell.js:254, which forces a synchronous style and layout of the whole page.
  - `V2.shell` takes 122 ms: header, page and footer HTML are rebuilt every time, then the whole tree is merged.
  - `V2.raRow` → `V2.raOnTeam` → `members()` is called once per row: 58 ms.
  - The Find box redraws the whole site on every `input` event with no debounce (pages/meta.js:97). 4 keys = 4 full redraws, 523-745 ms in total.
- Fix:
  - Debounce the Find box (~120 ms).
  - Redraw only #main, or the section that changed, instead of the whole shell.
  - Skip `scrollTo` when `scrollY` is unchanged.
  - Call `members()` once per draw.
- Caveat: Sim's iPhone is probably closer to 1-2x than 4x (my guess, not tested).

## MEDIUM (measurable)

**M1. Meta on desktop: layout shift 0.110 on every first load (over the 0.1 "good" line).**
- 5 of 5 runs, identical:
  - 0.095 at ~450-590 ms when the web fonts arrive. `.ra-h` moves down 28 px, and `.ra-sub`, `.gs-body` and `.gs-plate` move 56 px.
  - 0.015 later, from the data note (M2).
- With fonts delayed by 3 s, the 0.086 shift moves to 3.48 s, which proves the fonts cause it.
- Other pages:
  - My Team at 390: 0.034, from `.sx-grp.mh-grp` / `.mt-right` / `.tm-links` around 1.46 s, plus 0.017 at ~560 ms.
  - Slow 3G home: 0.060.
- Cause:
  - The fonts.css `<style>` is parsed only after the 1.17 MB data script.
  - Nothing preloads the fonts.
  - The fallback stack (`system-ui`) has different metrics, so lines wrap differently.
- Fix:
  - Add `<link rel=preload as=font type=font/woff2 crossorigin>` at the top of head.html for unbounded-latin.woff2 and instrument-sans-latin.woff2.
  - Add metric-matched fallback `@font-face` rules (`size-adjust`, `ascent-override`).
- When fonts fail completely: the fallback works, with no errors and no extra shift.

**M2. A redraw ~0.7 s after load pushes the page down and repeats the startup work.**
- `scheduleRender` (bridge.js:13) runs `clearCaches()` and `V2.redraw` 700 ms after the data documents arrive. At 1x on home it took 241 ms, which is about 1 s at 4x (the third startup long task).
- It inserts `V2.dataNote` ("This Preview uses a saved copy…", shell.js:178) at the top of #main, so the whole page shifts 24 px:
  - CLS 0.025 at 390 on Home and Meta.
  - On the live site the note only appears when data is stale. I measured the Preview only, so how often the shift happens live is unsure.
- Fix:
  - Draw the note in the first draw, or reserve its space.
  - Don't `clearCaches()` when the data didn't actually change.

**M3. Night-mode sprite glow is still on for mouse screens on many pages, against Sim's standing rule.**
- Elements with a CSS filter, 1440 wide, night:

| Page | Elements | Where |
|---|---|---|
| Calc | 196 | `.by`, `.dc2-kt`, `th .np-mon` |
| Events | 169 | `.tk-five`, `.tk-hero` |
| Gauntlet | 142 | pools in `.tp-five`, `.tp-lead`, `.tr-cell` |
| This Week | 83 | `.tk-five`, `.wk-mr`, `.wk-tm` |
| My Box | 80 | `.bx-t` |
| Build | 72 | `.bd-wsix`, `.bd-set` |
| Speed | 52 | `.sp2-m` |
| Home | 52 | `.ff`, `.hm-rk`, `.hm-mvn` |
| Tournaments | 24 | pools in `.mc-mon` |

- The only cover is the Nov 14 rule at css/pages.css:1974-1977 plus a few page rules, and they handle Meta's grandstand only. The filters themselves are in css/components.css:38-40.
- Raster time during a wheel scroll at 1440:

| Page | Night | Day |
|---|---|---|
| Events | 141-159 ms | 53-57 ms |
| Home | 123-124 ms | 22-27 ms |
| Pokémon page | 202-204 ms | 82-95 ms |

- Frames stayed at 16.7 ms here because raster runs off the main thread. Whether Sim feels it on his GPU is unsure.
- Fix: on `(hover:hover) and (pointer:fine)`, turn filters off by default and opt in only feature sprites (`.ft`, `.sel`, the spotlight). This is a visual change and needs Sim's yes and screenshots.
- On phones every sprite has a drop-shadow plus a blurred pool at night (gauntlet 240 elements, calc 196). I couldn't judge this headless (touch-gesture traces record no paint), so check on the iPhone.

**M4. Sprites are about 5x heavier than needed.**
- Every sprite is ~384 px (`v2art/*.webp`, about 23 KB each) but is shown much smaller. Median shown width: calc 28 px, gauntlet 28, events 40, meta 64.
- No `srcset`, no `width`/`height`, no `decoding=async`.
- First-visit image downloads (phone, 3x screen):

| Page | Data |
|---|---|
| Calc | 3.75 MB (133 of 158 sprites load at once) |
| Gauntlet | 2.7 MB (3.2 MB on desktop) |
| Events | 1.7 MB |
| Meta (desktop) | 1.87 MB |
| Build | 1.1 MB |

- Measured: 20 sprites total 458 KB; the same 20 re-encoded at 128 px (WebP q80) total 93 KB.
- Fix: ship a 128 px set and choose it with `srcset`/`sizes` wherever `--iw` ≤ 64 px.

**M5. Memory: My Team adds 52 MB and the heap grows slowly.**
- After forced garbage collection, 390 wide:
  - Home: 10.9 MB.
  - After one pass over all routes: 67.5 MB. Then 68.3 → 68.6 → 68.8 → 69.0 MB over loops 2-5 (+0.3-0.4 MB per loop, not yet flat).
  - DOM nodes (1,035) and listeners (228) stay flat. 0 detached DOM nodes.
- The heap holds 525k "concatenated" strings, 1.03M strings and 490k objects.
- Likely cause (unverified; needs a retainer analysis): `duelCache` in app/src/app/55-threats.js:160-167, which uses long `sigOf()` string keys and holds up to 50,000 entries, plus `repCache` (600).
- Fix: shrink `duelCache` to a ~5k LRU with compact keys, or clear it when leaving My Team.

**M6. Home's first draw waits on scoring.**
- `V2.draw` takes 301 ms at 1x before first content:
  - `V2.homeFight` 262 ms (`V2.scoreNow` → `prepOf` / `teamReport` 175 ms).
  - `V2.homeMeta` / `ratings` 181 ms.
- `V2.fitUsed` (pages/home.js:159) adds 56 ms of forced layouts after every draw. `V2.fitWords` (monsheet.js:103) also alternates style writes and reads, on every redraw of every page.
- Fix: draw the score as a placeholder and fill it in when the browser is idle; batch the fit reads before the writes.

## LOW (polish and robustness)

- **L1. Offline after load.** All 23 routes still render, because the data is inside the page.
  - Sprites not yet seen show broken-image frames with glow: events 42/78, gauntlet 57/120, box 22/40, weekly 21/39 (screenshot offline-events.png).
  - Reloading offline fails; there is no service worker.
  - Fix: a capture-phase `error` listener that hides failed `<img>`; a service worker for the public site.
- **L2. Missing data.** With the preview-data script removed or truncated (syntax error), the page silently falls back to built-in numbers ("10,209 teams" instead of 13,826). No stale note was in the first 160 characters of text. **Unsure** how the live site behaves when the daily data fails.
- **L3. No `<noscript>`.** Visitors without JS see a blank page. Matters for the January public launch.
- **L4. Meta page height settles after load.** It shrinks 56 px (2,902 → 2,846) after load.
- **L5. Robustness passed:**
  - Garbage values in 13 storage keys × 7 kinds: 0 errors, all 23 routes render.
  - Storage blocked: all routes render and the theme toggles.
  - `draw()` throwing on 5 pages: "This page didn't load" appears with the header intact, and the next page works.
  - `after()` throwing, or a throwing click listener: no effect on the rest.
  - A shared helper (`V2.disp`) throwing: 19 pages show the fallback message, none go blank.

## Checked and fine

- **Sheets:** opening 8 different sheets at 390 and 1440 caused 0 layout shifts (`scrollbar-gutter:stable` on mouse screens).
- **Scrolling:**
  - Mouse wheel at 1440, 100 px per notch every 40 ms, day and night, on Meta, Home, Pokémon, Events and Calc: median and p95 16.7 ms; at most 3 slow frames out of about 1,400.
  - Touch gesture at 390, 1x and 4x: 0-1 slow frames.
  - Headless caveat as last night.
- **Fast interactions:** Build typing, Build tabs, Pokémon folds, Popular Sets sheet and nav taps all stay under 130 ms even at 4x.
- **Infinite animation:** the single one (`np-breathe`) is opacity only, so it costs almost nothing.
- **DOM size:** largest are calc 2,923 nodes, types 1,504, meta 1,344 (desktop).
