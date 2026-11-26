# Small touches, pass 3 (HH's Job F), Thu Nov 26, 03:21 to 03:37 AM Eastern (`date`)
Looked and measured only. One clear bug is fixed. Everything else here is a finding or a proposal.
- Branch: alt/touches-pass3, from claude/design6 b96f3a5e.
- Build: `node app/build.mjs --v2 --preview-data --art=../src/v2/art/`, on the frozen out/ data.
- Playwright 1.49.1, Chromium only (WebKit not checked). The page's default sample team.

## What was measured (108 page loads, a script; checked)
- Pages: Battle, Damage Calculator, Team Preview Practice, Test Run, Events, Gifts, This Week, Track Record.
- Search: the sheet's results for "sneas", "fire", "adamant" and "leftovers".
- Sizes: 1100x800, 1180x820, 1366x768, 1920x1080, 820x1180, 390x844 and 320x640, all light. Dark at 1440x900 and 390x844.
- Per load, the script recorded:
  - sideways scroll (scrollWidth > window)
  - CSS ellipsis or line clamp that cuts text
  - text cut by an overflow:hidden box
  - visible elements past the window edge, leaving out any inside an overflow-x auto/scroll/hidden/clip box, closed `<details>`, `[hidden]`/`[inert]`/visually-hidden boxes, and fixed bars
  - overlaps between text boxes (same heading excluded, overlap at least 30% of a line's height)
  - grids or wrapping rows of like tiles whose last row is short
  - page height in screens
  - page errors
- A second pass looked for "…" written into the text by the page's own code, which the CSS checks cannot see.

Results:
- **Sideways scroll: none in all 108 loads.**
- Elements past the edge: none.
- CSS ellipsis or clamp: none.
- Page errors: none.

## Findings
| # | Page | Size | What | Picture | Status |
|---|---|---|---|---|---|
| 1 | Test Run (also Battle's opponent line, and the rows' screen-reader labels) | every size | Long event names are cut mid-word: "Buenos Aires Special Champi…". 14 of the event names in the data were cut this way (8 on Test Run's rows today), e.g. "Champions League VGC Novemb…" and "Intimidators Champions Chal…". Cause: evShort (app/src/app/06-helpers.js) cut every name over 28 letters at letter 27. It could also split an emoji. | touches3-1 (before 1100), touches3-2 (after 1100), touches3-3 (before 390), touches3-4 (after 390) | **FIXED** (TP3-1). Checked: fails on design6, passes after. |
| 2 | Test Run | 1100x800 / 1180x820 | 5.01 / 4.93 screens (the cap for tools is 3). Under the sticky "Top of the pile" panel the right column is empty beside the 16 Coin Flips. Each row is tall because the event name wraps to 2-3 lines in a narrow column. | touches3-5 | Proposal only (a layout change). Checked by measurement and picture. |
| 3 | Test Run | 1440x900 (dark) / 1366x768 | 3.23 / 3.42 screens, over the cap of 3. | (as 2) | Proposal. Checked by measurement. |
| 4 | Track Record | 1440x900 (dark) / 1366x768 / 1100x800 | 3.08 / 3.55 / 3.41 screens. | none | Unsure whether the cap of 3 applies: it is a list page under Meta. Checked by measurement only. |
| 5 | Damage Calculator | 1100x800 / 1180x820 / 1366x768 | 3.29 / 3.21 / 3.10 screens (2.76 at 1440x900). | none | Over 3 only on short windows. Unsure whether the cap is meant for 1440x900 only (rule 15 names 1440x900 for the first screen). |
| 6 | Events | 1100x800 / 1180x820 | 3.44 / 3.46 screens (2.84 at 1440x900). | none | Same as 5. |
| 7 | This Week | 1100x800 / 1180x820 / 1366x768 | 4.13 / 4.06 / 4.18 screens (cap 4; 3.45 at 1440x900). | none | Same as 5. |

## Flagged by the script, then checked by looking: not bugs
- Gifts: "Copy Code" and "No code: …" show as overlapping the "Source:" line. This comes from the text boxes' line heights. The pictures show the glyphs clear of each other (checked, 1366x768).
- Gifts at 390: "Show" in the stamp filter is in a 1x1 clipped box. This is visually hidden on purpose: screen readers hear "Show all · 8". Checked by picture.
- This Week: the "New tech?" and "The weather?" headings show as overlapping their captions. The picture shows "New tech ?" and its caption apart. Checked.
- Track Record: "Biggest Hits / Called It" headings are in 1x1 boxes. These are visually hidden headings for screen readers; the stamps show the words. Checked by picture.
- Damage Calculator: the chip rows (Hits both foes … Critical hit at 1100; the five weathers at 820) wrap 3 + 2. These are ordinary chip rows, and at 820 the weathers fill the row. Checked by picture.
- Test Run's legend ("Your answer to each: …") came out as "3 + 1" in the tile check. It is one line at 1366 and at 1100. The check was confused by the inline items' heights. Checked by picture.
- Search: all four results lists fit at 390. The sheet is 233-571px tall, with no sideways scroll and no "…". Checked by picture and measurement.

## Page height in screens (scrollHeight / window height; caps from rule 15: tools and lists 3, This Week 4)
| Page | 1100x800 | 1180x820 | 1366x768 | 1920x1080 | 820x1180 | 390x844 | 320x640 | 1440x900 dark | 390x844 dark |
|---|---|---|---|---|---|---|---|---|---|
| Battle | 1.53 | 1.49 | 1.39 | 1 | 1.18 | 2.09 | 3.05 | 1.17 | 2.09 |
| Damage Calculator | 3.29 | 3.21 | 3.1 | 2.33 | 2.42 | 3.38 | 4.63 | 2.76 | 3.38 |
| Team Preview Practice | 1.65 | 1.61 | 1.66 | 1.14 | 1.17 | 1.91 | 2.78 | 1.4 | 1.86 |
| Test Run | 5.01 | 4.93 | 3.42 | 2.69 | 2.79 | 3.06 | 4.13 | 3.23 | 3.06 |
| Events | 3.44 | 3.46 | 2.9 | 2.31 | 2.91 | 3.74 | 5.09 | 2.84 | 3.74 |
| Gifts | 2.77 | 2.71 | 2.81 | 1.9 | 2.09 | 3.25 | 4.76 | 2.36 | 3.25 |
| This Week | 4.13 | 4.06 | 4.18 | 2.8 | 3.73 | 4.9 | 6.93 | 3.45 | 4.9 |
| Track Record | 3.41 | 3.33 | 3.55 | 2.69 | 2.72 | 3.95 | 5.3 | 3.08 | 3.95 |
Phones have no screen cap (rule 15: short, natural scrolling). Their numbers are shown for reference.

## Ranked fix list
1. **Event names cut mid-word (done, TP3-1).** Reason: "Champi…" reads as broken on Test Run, Battle and in screen-reader labels, on every size.
2. **Test Run at 1100-1280 (proposal, needs Sim's yes with pictures).** Reason: it is 5 screens with an empty right column. Two ways to fix it, both unbuilt:
   - let the event name use the row's full width (one line), or
   - put the Coin Flips in two columns once the panel ends.
3. **Test Run at 1366-1440 (proposal).** Reason: 3.2-3.4 screens against a cap of 3. Fix 2 would likely bring it under (not checked).
4. **Track Record at 1440x900, 3.08 (ask first).** Reason: 0.08 over, only if the cap of 3 applies to it.
5. **Short windows, Calculator / Events / This Week (ask first).** Reason: over their caps only below 900px tall. Rule 15 may mean 1440x900 only.

## The fix (TP3-1)
- app/src/app/06-helpers.js, evShort: a name over 28 letters is cut at its last whole word within 28. If there is no space after letter 12, it is cut at 26 whole characters, so emoji stay whole. Trailing `| · ; , : –` are trimmed before the "…".
- This is shared logic, so today's page (the Practice opponent list) gets the same whole-word cut.
- Check: app/test/v2-minors.mjs TP3-1, part main2 (`ONLY=TP3` runs it alone). It covers every event in the tournament data, Test Run's rows at 1100x800, and the rows' aria-labels.
  - design6 b96f3a5e: "FAIL TP3-1: … mid-word: Buenos Aires Special Champi… | Intimidators Champions Chal… | …" and "v2-minors:1 failed".
  - After the fix: "pass TP3-1: … (14 cut names, 8 on Test Run's rows, 8 in their labels; mid-word: none)".

## Runs on the branch (this container, frozen out/, `node app/build.mjs --v2 --preview-data`)
- `node app/test/v2-guard.mjs` -> "v2 guard: clean (...)".
- Full `node app/test/v2-minors.mjs` -> "v2-minors:1 failed" (308 pass, TP3-1 among them). The one failure: "My Team at 390 is at most
  4.78 screens long (with optional swaps) (4.81 screens, 4056px)". design6 b96f3a5e measures the same here: 4056px, 4.81 screens,
  "Optional swaps" shown, with the same measurement. Not caused by this change. (HH: GitHub's main2 passed on the night batch.)
- Note: a full v2-minors run left out/post.json modified in the worktree (1 line). It was restored with `git checkout`, and it is not
  in any commit.
