# Full test run, Nov 18 night (look-only)

- Branch `claude/design6`, HEAD `503c7e84090ab4c8d8da9d5aee49c5beccc52b78` ("Decision log: Sim's recommended-for-all on the Stampede questions").
- Started 10:39 PM Nov 17 EST, main run ended 12:17 AM Nov 18 EST, re-runs ended 12:31 AM, report written 12:32 AM (all from the clock).
- No site code and no tests were changed. `out/` was restored to HEAD after the frozen-data part (`git status`: clean apart from the `node_modules` link).
- Machine: 4 cores. Other sessions shared it: load average went from 1 up to 9 during the run (noted on each step below).

## Setup fixed first (setup only, no code)

The cloud machine had restarted (up 8 min at the start). `node_modules/pokemon-showdown` pointed into a scratch folder that the restart
had wiped, so the Showdown-based checks could not have run. I cloned smogon/pokemon-showdown at the pinned commit `1242c1e2`
into the same scratch path, installed its own packages and ran `node build`. The link in the main checkout works again.
This is a scratch folder: the next restart wipes it again.

## How it was run

Copied from `.github/workflows/test.yml` (jobs: behaviour-v2, quality-v2, test, data-checks, accuracy-gate), in one sequence,
one step at a time, with these differences asked for in the brief:
- Behaviour groups ran on the frozen snapshot (`out/` of `0c992f69`), built with `cd app && node build.mjs --v2 --art=../src/v2/art/`
  and copied to `app/dist/art.html`. CI uses today's data and `dist/v2.html`. Z-smoke was added (CI runs A to D only).
- The code-test page checks used the `--preview-data` build, copied to `app/dist/preview.html` (CI uses `dist/v2.html`; same build).
- The Safari-engine job (WebKit, A-team) was **not run**: the machine has the pinned Playwright 1.49.1, and CI installs 1.63 for it.
  It is also "reported, not blocking" in CI.

## Results, per group (exact result lines)

### Behaviour (frozen data, art build)

| Group | Result line | Time / load |
|---|---|---|
| A-team | `behaviour: 128 pass, 13 FAIL, 1 known bugs, 0 fixed?, 2 skipped; 898s  (adapter v2)` | load 7.7 |
| B-build | `behaviour: 63 pass, 1 FAIL, 27 known bugs, 0 fixed?, 0 skipped; 625s  (adapter v2)` | load 9.1 |
| C-battle | `behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 456s  (adapter v2)` | load 4.9 |
| D-meta-shell | `behaviour: 115 pass, 2 FAIL, 42 known bugs, 0 fixed?, 7 skipped; 482s  (adapter v2)` | load 3.0 |
| Z-smoke | `behaviour: 3 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 12s  (adapter v2)` | load 3.1 |

Meaning: 16 FAILs. 15 come from the new Home (below). 1 (B-build X-12) is a flake.

### Code tests (frozen data)

All passed, with their last line:
- run.mjs `ALL PASSED` (`STRESS CHECKS CLEAN`, `page errors: 0`)
- v2-guard `v2 guard: clean`; no-names `2182 player fields checked, 0 not an ID or stand-in`
- v2-caches `-> ok`; v2-folds, v2-redraws, v2-trwarm, v2-sixof, v2-shown-score, v2-ckwin, v2-paste, share-fz, data-swap, forms-contrast, tap-size: `all passed`
- perf-docs `7 of 7 perf.json parts`; test-ids `486 tests, every ID unique inside its group`; v2-public passed; v2-words passed
- replays-test, tour-modes-test, speed-check, calc-check 2000, legality-check, threat-check (`PASS`), fields-audit, suggest-gaps,
  suggest-audit 30 5, build-logic, lead-logic, sync-logic, typing-sync, sync-quiet, golden, same-grade: all exit 0.

Failed:
- **v2-partial** `v2-partial: 1 failed` (Home, see below)
- **v2-minors** crashed (see below); before the crash, 3 FAILs, all Home known
- **v2-unbounded** `v2-unbounded: 2 new kinds of text in Unbounded under 15px (not stamps/tags or fitted names) across 27 pages` (1 Home, 1 Mystery Gifts)
- **tokens-doc** `tokens-doc: design-system.md is out of date with tokens.css; run node app/test/tokens-doc.mjs --write`

### Quality check (qcheck-all, preview build, frozen data)

`qcheck-all: 26 pages + 19 views x 5 widths x 2 themes, 429 findings, 324 new; 1617s`

New findings by page: home 130, team (all 11 views) 132, gifts 48, news 14.

### Data checks (today's data) and the accuracy gate

- `node app/build.mjs` built; run.mjs `ALL PASSED`; threat-check `PASS`; lead-logic `ALL PASSED`; golden `10 of 10 known-answer cases pass`.
- accuracy-gate `GATE PASSED` (`log-loss on 7819 later games: 0.68063 · baseline 0.68046 · allowed up to 0.68546`).

## Home ("The Stampede"), reported separately

The 4 known v2-minors items:
- Player review 3a: FAIL (`Home doesn't call a past month's numbers "right now" ()`), every run.
- pl-5d: FAIL (`.hm-used none | .hm-rk none`), every run.
- Audit v199 #6: FAIL (`closest none / ... px from the slant`), every run.
- **HOME-10b: PASSES now** (`Add a Pokémon / spot 3 / name box focused`), in both full v2-minors runs. Can come off the "known to fail" list.

Other Home failures (all read against the code: the old Home's parts are not drawn when `V2.STAMPEDE` is on, `home.js` line 189):
- A-team: HOME-01, 02, 03, 04, 05, 05b, 08, 09, 10, 12, 13, 14, 15 (13 FAILs). Each looks for an old-Home part (tagline heading,
  Most used hero, #2/#3 tiles, data line, rating-move chips, Tools list, Champion's six, six "+ Add" tiles, welcome card, What's New,
  Top of the Meta, More on Home).
- D-meta-shell SHELL-17b (`nothing visible to tap matching /^Copy a top team$/`) and SHELL-18 (`no What's new card for a returning
  visitor after an update`). Real, re-run alone once (load 4.2): same. Cause checked (read code): `V2.homeWelcome()` and `V2.homeNew()`
  are called only by the old Home draw; no stampede*.js file draws a welcome card or What's New. So first-visit welcome and
  What's New are gone from the site while the Stampede is on (a missing feature, not only a test gap).
- v2-partial: `FAIL  Home: the belt says "Strength Score so far" for a 3-Pokémon team ()`. Real, re-run once: same. Cause checked
  (read test + code): the test reads `#app .fn-belt` (old Home). The Stampede six band does say "so far" (`stampede-six.js` line 70),
  but as `<word> so far` in `.sds-w`, with no "Strength Score". Test target or wording to settle.
- v2-unbounded: `.sds-tk .sds-tg.u @13px "Rillaboom"` (Stampede six band tag, Unbounded at 13px), on home 390/1440, day and night.
- qcheck: 130 new Home findings (TAP 72, OVERLAP 46, SIZE 8, CLIPPED 4). Not judged one by one here; the page is mid-build.

## Real failures outside Home

1. **v2-minors crashes partway (SUGG-09 check, line 324).** 3 of 3 runs (full run load 2.4-5; alone at load 4.4 and 2.5), always
   at the same place: `elementHandle.click: Element is not attached to the DOM` on `a.click()` for `#tm-sg [data-v2plan]`.
   Only 73 of the file's checks print, so **every check after line 324 did not run** this time (v2-minors is not a full answer).
   Cause, unsure (read the code, not proven): the test grabs the first Apply button once `waitForSelector` sees it, then scrolls
   and clicks that same handle. Since 27e7420f (the planner now works one threat per step, 02:04 UTC) and e33e7ac7 (Apply place
   hold, 02:50 UTC), Suggestions seems to redraw again after the first Apply appears, so the grabbed button is replaced before
   the click. The check was added in adcc7063 (01:46 UTC), before both. Fix would be in the test (re-query the button, or wait
   for the planner to finish) or in the page (don't redraw a settled list); I can't tell which without a probe.
2. **tokens-doc: the design doc's token list is out of date.** Deterministic. Cause checked (git log + diff): tokens.css gained the
   Post Room (`--pr-*`), Dispatch (`--dp-*`, `--d-paper` and others) and Stampede (`--sd-*`, `--d-sd*`) tokens in 1560981e, 4fe09710
   and b7dd3a1c; design-system.md was last regenerated in 43468b43. Fix: `node app/test/tokens-doc.mjs --write` (not run: look-only).
3. **A token clash found while reading that diff: `--sd-you` and `--sd-them` are set twice in the day `:root`.** Checked (tokens.css
   lines 24 and 79; users sd-tools.css line 86, sd-six.css line 92). Line 24 (tools band) sets `#62BEF7` / `#F08AD8`; line 79 (six band)
   sets `#0068AD` / `#B4238F`. The later one wins, so in day the tools band's your/their names on the ink plates get the dark blue
   and magenta meant for paper. At night only line 115 sets them (`#62BEF7` / `#F08AD8`), so the six band's paper gets the light
   colours the comment says it must not ("day values: they sit on paper in both themes"). No test catches this. Effect on screen:
   unsure (not looked at); low contrast is likely in both spots. This is the Home page, but the tokens are shared.
4. **v2-unbounded: `.pr-stats .ev-pk @13px "Live right now"` (Mystery Gifts, The Post Room)**, on gifts 390/1440 day and night.
   Deterministic, re-run once: same. Cause checked: `.ev-pk` is the event stamp, already allowed in two other places
   (`.ev-counts .ev-pk.u`, `.ev-plate .ev-pk.u`). The new place isn't on the allowed list (v2-unbounded.mjs line 13). It's a stamp,
   so this probably needs adding to the list with Sim's OK, not a code change. Unsure that it's meant.
5. **qcheck, My Team: 132 new TAP findings** (`TAP 110x20 "Import a Team ›"`, `TAP 122x20 "Build Me a Team ›"`) at 320, 390 and 820,
   day and night, on the main view and all 11 views. Checked (git show + qcheck.cjs line 35): 96b9c89c (Audit v199 #22, 00:30 UTC Nov 18)
   took the 44px line height off these links and left the 44px tap area on a `::before` layer (components.css 167-168). qcheck counts
   only an `::after` layer as part of the target, so it sees 20px. v2-minors measured these same links at 44px (`tap 44`).
   So: a checker gap, not a real small target. The fix is to teach qcheck.cjs about `::before` (or re-record the known list).
6. **qcheck, Mystery Gifts (48 new):** TAP on the inline source links ("nintendoeverything.c", "nintendolife.com",
   "criticalhits.com.br", "levelup.com", "the official news"; 16-19px tall), TAP 39x44 "Home" (narrow) at 320-820, and
   OVERLAP "CONTENTS" x the gift name ("100 Quick Coupons", "Vivillon Trainer I") at 390, 1280 and 1920. New page (4be8df43).
   Unsure which are real: I did not get a clear look at the label (my screenshot was covered by the sticky nav).
7. **qcheck, News / The Champions Dispatch (14 new):** TAP 108x16 "All Mystery Gifts ›" (320-820); OVERLAP "Dispatch" x
   "Wed, Nov 18, 2026" (390, 820); SIZE 32.6px "The Champions" and "Dispatch" at 390 (off the type scale). Screenshot at 390:
   the masthead lines sit very close (the date's capitals almost touch "Dispatch"): a tight overlap, small but real. The 32.6px is a fitted (clamp) masthead size; it may count as display type. Unsure.

## Flakes

- **B-build X-12** (`Megas not 1 after reload`): failed once in the group run at load 9.1. Re-run alone twice (load 3.4 and 4.7):
  `behaviour: 1 pass, 0 FAIL` both times. Flake under load (the reload waits a fixed 1.5 s).

## Not done

- Safari-engine job (needs Playwright 1.63).
- The v2-minors checks after line 324 (they never ran; see item 1).
