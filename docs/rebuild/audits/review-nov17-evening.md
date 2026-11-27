# Fresh-eyes code review, Nov 17 evening

Started 7:19 PM (clock: `bash docs/rebuild/now.sh` -> "time: 7:19 PM, Tue Nov 17, 2026"); written 7:35 PM (same command).

Scope: `git log 69d55567..HEAD` on claude/design6 (19 commits, HEAD 7a0d532e) plus 4d348f5b on origin/main.
4d348f5b (daily data job) is the same code as b26989e9 here (`git diff 4d348f5b b26989e9` on the three files: empty).
Look-only. Nothing in /home/user/pokelair-data was edited except this file. Builds and runs were done in /tmp copies:
- /tmp/review = `git archive HEAD` (no docs/), built with `node app/build.mjs --v2 --preview-data`
  (and again with `--art=v2art/ --preview-data --one-art-size`).
- /tmp/review-old = `git archive 69d55567`, same build, for before/after comparisons.
- Probe scripts: /tmp/review/probe/p1.mjs ... p5.mjs (Playwright, Chromium).

Baseline result: `PAGE=app/dist/v2.html node app/test/v2-minors.mjs` on HEAD -> "v2-minors: all passed" (4 m 59 s).
`node experiments/tour-modes-test.mjs` -> "tour-modes: all passed".
Meaning: nothing below is a red test; these are things the tests do not catch.

## Findings, most serious first

### 1. Daily data job: the new round-format step can stall the whole day's data (medium; checked by reading, not run live)
- update.mjs:79-83 runs `updateModes` inside the `node update.mjs` step, before any output is built. That step has no
  `|| node skip.mjs`, and the job has `timeout-minutes: 150` (.github/workflows/update.yml:12).
- Each call goes through `get()` (update.mjs:31-40): 6.5 s gap, up to 6 tries on 429, each sleeping `retry-after` (default 60 s).
  `politeFetch` (http.mjs) sets no timeout, so a server that accepts and never answers waits for undici's default (300 s).
- Up to 120 extra calls a day (MAX_MODES). Scenario: Limitless /details hangs or rate-limits during the run.
  120 x 300 s = 10 h, or 120 x ~6 min of 429 sleeps. The 150-min job timeout cancels the run: no commit, every later step
  (official, events, model, perf...) skipped. Before this change the same exposure was ~80 calls (standings + pairings);
  now it is ~200, and the new 120 come before the core outputs.
- Normal case is fine: 108 events to backfill = ~12 min (as the commit says).
- Fix: give the modes step a time budget (stop after e.g. 10 min, or after 3 failures in a row), and an
  `AbortSignal.timeout(30000)` on its fetches. Or move it to its own step after update.mjs: `node tour-modes-run.mjs || node skip.mjs ...`.

### 2. Meta tabs under 1100: keyboard and screen-reader order no longer match what is on screen (medium; measured)
- pages.css:1878 shows the tabs right after the intro line with CSS `order`, but the DOM keeps them after the whole head.
- Measured at 390 (probe p1), focus order on Ratings: "?" tip (y 459) > How Ratings Work (517) > Track Record (517) >
  Pokémon tab (348) > Tournaments (348) > Ratings/Usage/Popular Sets (404). So focus goes down, then jumps back up.
  Same on Usage (links 535 then tabs 406) and Popular Sets (477 then 348). Screen readers read in DOM order, so they hear the links first.
  WCAG 2.4.3 Focus Order / 1.3.2 Meaningful Sequence.
- At 1100+ it got worse too: the DOM is now head > tabs > spotlight, but the tabs sit under both columns.
  Events at 1280: tabs (y 621) are focused before the upcoming-events links in the right column (y 236-502).
  Ratings at 1280: tabs (600) before the spotlight's "Pokémon Page" (447). Before today it was head > spotlight > tabs.
- The tournaments pages (Winning Teams, Events, Archetypes) have nothing focusable after the lede, so there the phone order is right.
- Fix: put the order in the HTML, not in CSS. Split `head` into intro (eyebrow, h1, lede) and extras (ra-kick, ra-links) and emit
  intro > tabs > extras > spotlight. Then place them with grid areas at 1100+. Showing the tabs after the lede at 1100+ too
  would make it one order everywhere, but that is a design choice for Sim (pictures needed).
- The new Q2 check (v2-minors.mjs:228) only measures where the tabs are on screen, so it can't catch this.

### 3. Speed Tiers: weather chips now leave a lone chip at 600-759 (medium-low; measured before/after)
- pages.css: `.sp2-wx .np-chip{font-size:var(--t13)}` was removed (audit #12: one size per control). The bigger chips wrap.
- Probe p5, rows of the 6 weather chips:
  old `600:5+1 640:6 700:6 760:6`, new `600:5+1 640:5+1 700:5+1 760:6`.
  So 640-759 (iPad split view, small windows) gained a lone chip. That breaks Sim's "no lone tile / half-filled row" rule.
- The v2-minors check (v2-minors.mjs:229-234) prints "700: ... rows 5+1" and still passes, because it only checks rows under 600.
- Fix: extend the 3x2 or 2x3 grid rule to max-width 759.98 (or 899.98, to match `.sp2-ctl .chips`).
  Extend the check's row test to `x[0] < 900`.

### 4. The `.ra-h{display:contents}` rule changes pages it wasn't meant for, and the headline spacing is 16, not 12 (low; measured)
- pages.css:1878 sets `.gs-top{row-gap:var(--s3)}`, but the older rule at pages.css:1928 (`.gs-top{...;gap:var(--s4)}`, same
  media and specificity, later in the file) wins. Measured under 1100: row-gap 16px. Eyebrow-to-h1 and h1-to-lede are 16
  (were 12, the `.ra-h` gap). The comment "the headline keeps its 12px line spacing" is not true.
- The rule matches every `.gs-top>.ra-h`. That includes About, How We Calculate and Feedback (no tabs), which also moved
  from 12 to 16 (probe p1: about/feedback 390, 900, 1099 -> 16). That is a visual change Sim hasn't seen.
- Fix: `.gs-top{row-gap:var(--s3)}` after line 1928, or scope it (e.g. `.gs-top:has(>.ra-sub)`). Then re-check the Q2 gap (now +20 px).

### 5. Grandstand fix adds an empty 8px row under every Usage and Sets teammate tile (low; measured before/after)
- pages.css:1921 `.gs-row .gs-tx{grid-template-rows:auto 1fr auto var(--s2)}` matches every `.gs-row`, including Usage's
  "Usually alongside" shelf, Sets' teammates and Sets' bench. Those tiles have no "on your team" bar.
- Probe p3, space under the last line of each tile: old 0 px, new 8 px (390 and 1280, Usage and Sets).
- The Ratings tiers line up as intended: every row's numbers have one top at 700, 1100 and 1280, two-line names included.
  Usage mates' "% of its teams" lines also line up.
- Fix: limit the 4th row to the Ratings tiers (`.gs-rows .gs-row .gs-tx`, or set it only when `.gs-mine` can appear).
  Keep `auto 1fr auto` for the others.

### 6. v2-minors checks that can pass without checking anything (low; read)
- #13 Grandstand (v2-minors.mjs:254): `'|' + [...m.parentElement.parent ? [] : []]` is dead code (`.parent` is undefined).
  Rows are grouped by tile top only. If tiles are ever bottom-aligned, or two shelves share a top, it groups wrongly.
  Suggest grouping by `m.parentElement` (or the `.gs-rows` scroller on phones, where `.gs-row` is display:contents).
- #12 Speed chips (v2-minors.mjs:229-234): if the page draws no chips, sizes `''` and rows `''` both pass.
  Add `cs.length > 0 && wx.length === 6`.
- #6 Home Lead (v2-minors.mjs:204): `if (!L.length) return 99`, so a renamed class or a hidden tile passes. Fail on 0 found.
- #21 Compare (v2-minors.mjs:252): passes when no hint is shown. `/row below/` misses "rows below". Use `/rows? below/`.
- Sprites, one-size branch (v2-minors.mjs:261): `used === 0` is also true when no sprite is drawn at all.
  CI never builds with `--one-art-size`, so this branch only runs on Preview builds. Add `im.length > 0` (count all sprites).
- Timing: every new check waits a fixed 1.2-1.8 s after `goto`. Most fail safe when the page is late (99 / 'none' -> fail),
  apart from the cases above. The whole file now takes ~5 min locally. I saw no flake in one run. Not measured: how close to its limit the CI job runs.

### 7. tour-modes: smaller points (low; read, and one look at the API)
- experiments/tour-modes-test.mjs is not run by any workflow (`git grep tour-modes -- '*.yml'`: nothing). Its claim that it fails
  when the order breaks only holds if someone runs it. Add it to test.yml (it needs no network).
- An event whose details never carry a mode (or carry `rounds: 0`) is asked again every day forever, 6.5 s each.
  That is fine at today's numbers, but the work grows. Suggest storing a "tried N times" marker and giving up after ~7 days.
- Data meaning: in main's data/tour-modes.json all 290 SINGLE_BRACKET phases have `rounds: 1`, whatever the cut size.
  So for brackets `rounds` is not a round count. The two readers (experiments/broken-teams.mjs:22, counting-checks.mjs:153) fall back
  to the last phase's mode, which gives the right answer for "swiss then bracket". Any future code that adds rounds up would be wrong.
  Worth one line in tour-modes.mjs's header.
- File growth: one short entry per event (~60 bytes), written only when something is added. No concern.
- Limitless /details answered as the code expects for two missing events (one request each, 7 s apart):
  `phases:[{phase,type,rounds,mode}]`.

### 8. Pre-existing, noticed in passing (not today's change)
- track.js trSlip: the event title is escaped (`E(V2.evTitle(...))`) and then escaped again in aria-label.
  A title with "&" is spoken as "amp". Today's `<br>` change keeps this.

## Checked and fine
- Header arrows (sugs.css:337-338). Probe p2 at 320/340/359/360/390/413/414/500/700/759/760, back hidden and shown, forward hidden and shown:
  20 px each side at 320-759, 18 at 760. The logo's widened tap area never covers an arrow or the Search button. No sideways scroll.
  At 414-759, when forward is hidden (display:none), the logo's tap area ends 17+ px before Search.
- `--one-art-size`: the built page holds `window.NP_ONE_ART=1` before the code that reads it, the static first screen has no sprite
  `src`, and no `v2art-s/` path appears. Without `--art=` the flag is silently ignored (artTag needs artArg). That matches today's
  only caller (rebuild-preview.sh), but `--one-art-size` alone does nothing and says nothing.
- Track Record container query: `.trk-slips` is a one-column grid, so `container-type:inline-size` on the li doesn't collapse it.
  The v2-minors numbers (8 px clear at 320-1920) agree.
- Fonts are embedded (12 @font-face), so the position-based checks don't depend on the network.
