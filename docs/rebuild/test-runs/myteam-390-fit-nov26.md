# My Team at 390: fit the no-swap state under 4.35 (Sim: "fix it"; HH's Job K, under HH's design authority), Thu Nov 26, 06:00-06:50 AM Eastern (`date`)
Branch alt/myteam-390-fit, from claude/design6 dcefa24f.

## What changed (phones only, under 700px; 700 and up unchanged)
1. **3a. One row of links.** With "Nothing to fix" and no swap card, Suggestions had two link rows:
   - "Battle › Popular Sets ›" (44px)
   - then "See All Suggestions › Never Suggest › Refresh Suggestions" (52px)

   Now the note and the links sit in one box (`V2.sgNbox`, sugs.js) and, on phones, the five links share one row.
   - Same order as before, so keyboard order = visual order.
   - Each link is a two-line stack, as See All already was. "Popular Sets ›" became "Popular / Sets ›" (its "Sets ›" in the same `sg2-l2` span the other links use).
   - Type stays 13px (the scale's smallest, as See All was). Every link keeps its 44px tap height. Nothing is hidden.
   - 360-519: spread across the row.
   - 520-699: from the left, with a 32px gap.
   - Under 360: three, then two, in even thirds, so no link is left alone on a row.
2. **3b. Spacing (phones).** 8px over the note (was 16), 4px over the links (was 8), and 8px over Adjust Suggestions (was 16; team-frame.css, because the 16 comes from there).

## Heights (390x844 light, `node app/build.mjs --v2 --preview-data`, the check's own waits)
| State | Data | design6 dcefa24f | this branch | cap |
|---|---|---|---|---|
| Today, no swap | main's out/ (Nov 25) | 3740px, 4.431 | **3668px, 4.346** | 4.35 |
| No swap, deterministic (sample team, Suggest from My Box) | frozen 0c992f69 | 3716px, 4.403 | **3644px, 4.318** | 4.35 |
| With the optional swap (the old check's state) | frozen 0c992f69 | 3990px, 4.727 | 3990px, 4.727 (unchanged) | 4.78 |

- WebKit (iPhone 390x844, isMobile, over http) on today's data: design6 3741px (4.432) → this branch 3669px (4.347). The links are on 1 row there too.
- The margin is thin: today's page is 3px under the cap.

### Fit check (today's data, Chromium)
- 360, 375, 390, 430, 519, 520 and 699: one row of 5, nothing past the edge, no sideways scroll.
- 320 and 359: 3 + 2, nothing past the edge.
- Heights (design6 → this branch):
  - 320: 4267 → 4139
  - 375: 3769 → 3697
  - 390: 3740 → 3668
  - 430: 3702 → 3630
  - 699: 3185 → 3113
  - 820: 4108 → 4108 (unchanged)
  - 1440x900: 2626 → 2626 (unchanged)

## The new check: MT390-1 (app/test/v2-minors.mjs, main2, next to the old one; `ONLY=MT390` runs it alone)
- **The state:** the sample team and its box, as the page makes them, with Suggest from set to My Box (`cc2.pool = "box"`). On the frozen data no swap from the box helps, so Suggestions says "Nothing to fix" with no swap card.
- **It checks:** "Nothing to fix" is shown; there is no "Optional swaps:"; the page is at most 4.35 screens; the links sit on one row; there is no sideways scroll.
- **design6 dcefa24f** (frozen data): "FAIL MT390-1: … (4.403, 3716px); its 3 links (Battle › | Popular Sets › | Never Suggest ›) on 2 row(s)".
- **this branch:** "pass MT390-1: … (4.318, 3644px); its 3 links … on 1 row(s)".
- In this state "See All" and "Refresh" don't show (no swap at all), so the row has 3 links. Today's data shows all 5, and the fit check above covers that.

## Other checks
- `node app/test/v2-guard.mjs` → "v2 guard: clean (...)".
- Full `node app/test/v2-minors.mjs` on the frozen out/ (`git checkout 0c992f69… -- out/ && git reset -q -- out/` first, `git checkout HEAD -- out/` after) → "v2-minors:all passed" (312 pass). It includes the old check, "My Team at 390 is at most 4.78 screens long (with optional swaps) (4.73 screens, 3990px)", and MT390-1.

## Pictures: docs/rebuild/pics/nov26/mt390fit-1..6
1. before, 390 light
2. after, 390 light (recommended)
3. before, 390 dark
4. after, 390 dark (recommended)
5. after, 320
6. after, 699
