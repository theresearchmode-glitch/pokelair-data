# Test Run and Track Record fit (HH's Job G, under HH's design authority), Thu Nov 26, from 04:10 AM Eastern (`date`)
- Branch: alt/testrun-fit, from claude/design6 b96f3a5e.
- Build: `node app/build.mjs --v2 --preview-data`, on the frozen out/ data. Pictures were taken with the sprites (`--art`).
- Chromium only.

## Correction to my Job F report (small-touches pass 3, finding 2)
I said the right column of Test Run at 1100-1280 was empty beside the 16 Coin Flips. That came from a full-page picture.
- The "Top of the pile" panel is sticky (`.dr-side{position:sticky;top:96px}`).
- While scrolling the Coin Flips, its top part stays in view beside them (picture fit-07, scrolled, viewport only).
- The real problem was the length: each row gave its event name 160px, so the name ran to 3 lines and the row was about 124px, with half of the row bare.

## What changed (CSS only; app/src/v2/css/pages.css, three blocks at the end)
1. **Test Run, rows beside the open team (a column 440-599px wide: 1100-1279).**
   - The row's left part (place, event, counts) is now `1.2fr` against `1fr` for "Gets through". Before, it was a fixed 160px.
   - The event name now sits on one line.
   - Row padding is 8px top and bottom (was 16/12).
   - Rows are about 77px (were about 124px).
   - Same parts, same order. Phones (a column under 440px) are unchanged.
2. **Test Run, 1440 and up.** Two existing rules now carry on to 1440 and up:
   - the 1280-1439 spacing (alt/len1280, Nov 23: steps 40px apart, piles 24px, the page ending 16px under its note)
   - the one-line "You answer all six." rows (alt/len1280b, Nov 24: 44px tall)
   The headline keeps its own 1440 layout. Nothing is hidden.
3. **Track Record, 1100 and up.** The page ended 128px under its last link: 64px under the plan and 64px under the page. Now it is 16 + 32 = 48px. Nothing else moves.

## Page height (scrollHeight; screens = height / window height)
| Page | Size | design6 b96f3a5e | this branch |
|---|---|---|---|
| Test Run | 1440x900 light | 2909px, 3.23 | 2609px, **2.90** |
| Test Run | 1440x900 dark | 2909px, 3.23 | 2609px, **2.90** |
| Test Run | 1180x820 | 4040px, 4.93 | 3323px, 4.05 |
| Test Run | 1100x800 | 4009px, 5.01 | 3293px, 4.12 |
| Test Run | 1366x768 | 3.42 | 3.42 (unchanged: 1280-1439 already had the spacing; the rows there are the wide layout) |
| Test Run | 1920x1080 | 2.69 | 2.42 |
| Test Run | 820x1180 / 390x844 | 2.79 / 2586px | 2.79 / 2586px (unchanged) |
| Track Record | 1440x900 light and dark | 2770px, 3.08 | 2690px, **2.99** |
| Track Record | 1180x820 / 1100x800 | 2729px / 3.41 | 2649px / 3.31 |
| Track Record | 390x844 | 3325px | 3325px (unchanged) |
Note: Track Record at 1440x900 is 10px under the cap. A new line of content there would push it back over.

## Checks (run in this container)
- `node app/test/v2-guard.mjs` -> "v2 guard: clean (...)".
- New v2-minors checks TF-1 and TF-2 (part groups; `ONLY=TF` runs them alone):
  - design6: "FAIL TF-1: … (light 3.232, dark 3.232) … (4.927, at most 4.5)" and "FAIL TF-2: … (3.078, 2770px)".
  - this branch: "pass TF-1: … (light 2.899, dark 2.899) … (4.052, at most 4.5), all 20 rows kept, no sideways scroll" and
    "pass TF-2: … (2.989, 2690px)".
- Fit check, both pages at 1100, 1180, 1366, 1440, 1920, 820 and 390:
  - no sideways scroll, no element past the edge outside a scroller or closed fold, no CSS ellipsis
  - no overlap between the parts of any Test Run row
- Keyboard order: the DOM is unchanged, and each row's parts are placed in DOM order (place and event, who gets through, counts).
- Full `node app/test/v2-minors.mjs` -> "v2-minors:1 failed" (309 pass, TF-1 and TF-2 among them). The one failure is "My Team at 390
  is at most 4.78 screens long (with optional swaps) (4.81 screens, 4056px)". design6 b96f3a5e measures the same 4056px here (Job F).
- Which test writes out/post.json (found): v2-minors MQ-9c runs experiments/post-news-test.mjs. That file's line 46 runs post-news.mjs
  with FEED_FILE, POST_FILE and SUGGEST_FILE set but no POST_OUT. post-news.mjs then writes its default, out/post.json, adding
  `"ran":"<now>"` (seen here: `"ran":"2026-11-26T09:33:26.712Z"`, file time 09:33:26 UTC, during the groups part).
  A likely one-line fix (not made; it is outside this job): add `POST_OUT: path.join(tmp, 'post2.json')` to that call's env.
  out/post.json was restored with `git checkout` and is not in any commit.

## Pictures: docs/rebuild/pics/nov26/fit-01..18 (before and after; recommended = green band)
- Test Run: 1440 light, 1440 dark, 1180 full page, 1180 scrolled to the Coin Flips, 390.
- Track Record: 1440 light, 1440 dark, 1180, 390.
