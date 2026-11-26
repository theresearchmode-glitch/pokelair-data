# My Team page height: where it goes and what to cut (look-only, Nov 12)

Preview measured: scratchpad/redesign/foundation.html#team (sample team "Sun Tailwind", 6 of 6), 9 s wait for suggestions.
Phone = WebKit iPhone 13 (390x844); iPad = Chromium 820x1180; desktop = Chromium 1440x900. Scripts: helpers/hmeasure.js, hdeep.js, hproto.js, hcombo.js (raw: hmeasure.json, hdeep.txt, hproto.json).

## 1. Page height today (MEASURED)
| | phone | iPad | desktop |
|---|---|---|---|
| Document height | **4308** | **3775** | **2223** |
| Target | 3400 | 3500 | 1800 |
| Over by | 908 | 275 | 423 |
Light and dark gave identical heights at all three sizes (measured). Today's heights are a little under the earlier 4354 / 3797 (data or build changed since); the earlier figures were not re-checked.

### Blocks (MEASURED px, % of page)
| Block | phone | iPad | desktop |
|---|---|---|---|
| Header | 60 (1%) | 76 (2%) | 76 (3%) |
| Hero total (padding 40/32) | 1142 (27%) | 945 (25%) | 590 (27%) |
| - name + score (tm-lock) | 165 | 211 | 211 |
| - win line / rank / as-of / links (tm-info) | 151 | 151 | 151 |
| - the six + action strip + game plan (tm-six) | 598 | 355 | 352 (right column) |
| - Save / Share / Saved / More (tm-acts) | 108 | 108 | 108 |
| Jump bar (sticky) | 45 (1%) | 45 (1%) | 45 (2%) |
| Work area total (padding 32/64) | 2807 (65%) | 2599 (69%) | 1403 (63%) |
| - Set | 468 | 468 (full width) | 468 (left col) |
| - Matchups | 990 | 1289 (338px column) | 876 (right col) |
| - Suggestions | 735 | 666 (full width) | 605 (left col) |
| - Team Checks | 269 | 269 | 221 |
| - Your Games | 89 | 89 | 89 |
| Footer | 254 (6%) (88px bottom pad for the phone bar) | 110 (3%) | 109 (5%) |
Desktop work area: left column (Set + Suggestions) 1112, right (Matchups + Checks + Games) 1267: the right column sets the height.

## 2. What eats the space (MEASURED unless marked)
- **iPad empty strip, the single biggest waste.** Grid is "set set / mu ck / mu yg / sg sg". Matchups sits in a 338px column where each threat row wraps to two lines (89-90px per row vs 57 on phone), so Matchups is 1289 tall while Checks + Your Games beside it end after ~400px: an **~890px empty strip** right of Matchups, then Suggestions starts full width below.
- **Matchups** (phone 990): intro text 90 (4 lines), legend 51, damage-calc line 20, view picker 88 (2x2 buttons), two headed lists of 4 rows (each heading ~60 incl. margins) 227+227, "other 22" line 44. The list headings repeat what every row's verdict chip already says (Unfavoured / Favoured).
- **Suggestions** (phone 735): three sliders 183 (two rows, buttons 56 tall because icons stack over labels under 520px), "Nothing to fix" 134, card 254 (score, swap, Apply on its own 52px row, Why? row), "See all" 44.
- **Team Checks**: heading + sub 45 + "All 4 basics..." 44, then a second fold "Problems and Team Checks" 107 (title wraps to 2 lines on phone): the words "Team Checks" are shown twice.
- **Set**: four fact rows 41 each in one column even at 600-724px wide (half the width empty); moves 2x2 (96) even at 724px.
- **Hero**: on desktop the left column (score + info + 2 rows of buttons = ~518) is taller than the six (352): ~170px empty under the six. "Data as of" takes its own 20px line.
- Six on phone (598): 3 pair-columns of 111px, each 2 tiles stacked: big sprites, left alone (bold look).

## 3. Proposed cuts (ranked by total saved). Saved px are MEASURED by injecting the CSS/JS into the Preview in Playwright (no repo file changed), each alone against today's page, unless marked "estimate".
| # | Cut | Where | phone | iPad | desktop | Risk |
|---|---|---|---|---|---|---|
| 1 | iPad: Suggestions move into the right column under Checks + Your Games, beside Matchups (fills the 890px strip) | css/pages.css:458 `.tm-work:has(.tm-yg)` areas -> `"set set" "mu ck" "mu yg" "mu sg"`, rows `auto auto auto 1fr`; same change in css/sugs.css:62 open-fold variants | 0 | **-707** | 0 | Low. Suggestions at 338px measured 735 tall, no overflow; columns end within ~165px of each other. Check 700-899 widths. |
| 2 | One Matchups list instead of two headed lists (chips already say Favoured / Unfavoured; count stays in the legend) | pages/matchups.js pane draw (`.mu-h3` + second `ol.mu-out`) | -60 | -60 | -59 | Low |
| 2b | (stronger option) Favoured list folded behind "4 Favoured ›" on phone/iPad; Unfavoured stays open | same | -219 | -352 (alone; less after #1) | n/a | Medium: hides good news behind a tap |
| 3 | Desktop: threat rows two-up inside the 600px Matchups column | css/matchups.css `.tm-mus .mu-out` at min-width:1180 | 0 | 0 | **-154** | Medium: names like "Mega Charizard Y" wrap to 2 lines, rows 61-62 vs 57 (uneven: needs verdict chip under the name or a size step) |
| 4 | Suggest-from sliders folded into one summary line ("From My Box · Megas: any · Change ›", 44px tap) | pages/sugs.js controls (`.sg2-ctl`) -> `<details>`; css/sugs.css | -143 | -119 | 0 alone (-? in combo) | Medium: controls one tap away; summary must name every current choice |
| 4b | (lighter) phone slider buttons icon-beside-label, 44px not 56 | css/sugs.css:14 container ≤519 | -24 | 0 | 0 | Low |
| 5 | Team Checks: the passing line and sub fold into the "Problems and Team Checks" fold, which becomes the section's one head (no "Team Checks" twice) | pages/team.js `ckSec` / `V2.ckBody`; pages/sugs.js `V2.fixFold` | -109 | 0 (not the tall column) | -86 | Low-medium: the "All 4 basics pass" line must stay visible in the fold's summary (it already says "4/4 checks") |
| 6 | Set facts two-up (Item/Ability, Nature/Stat points) from 520px; moves in one row of four from 700px | css/six.css `.sx-kv` (`@media (min-width:520px)` grid 2 cols); css/pages.css:141 `.tm-moves` 4 cols | -19 (kv) | -134 | 0 alone (c1 not limiting; counts in combo) | Low. Phone kv-2col only saves 19, skip on phone |
| 7 | Small phone trims: matchup views in one row of four, text only (-44); Apply beside the ±score (-48); "Data as of" on the rank line (-30, all sizes); work bottom padding 64->40 (-24, all sizes) | css/matchups.css:143; css/pages.css .tm-sug li; .tm-info .tm-asof; pages.css:22 .tm-work | -146 | -54 (+-44 views) | -53 | Low (check "Top 12 grid" fits at 320px: 4 x ~72px, unmeasured) |
| 8 | Desktop hero: actions move under the six, in one row (fills the empty space under the six) | css/pages.css:484 `.tm-hero` areas `"lock six" "info six" "info acts"` + one-row `.tm-acts` | 0 | 0 | -34 measured as prototyped (Saved Teams / More still wrapped to a 2nd row); **estimate -90** once in one row | Low-medium: moves the main button off the score side |

### Combined (MEASURED, all injected together)
- Phone, CSS-only set (2, 4b, 6-kv, 7): **4060** (-248). Phone, everything incl. 2b, 4, 5: **3605** (-703). Still ~205 over 3400.
- iPad, #1 only: **3068** (target met). #1 + 2 + 5 + 6 + 7-asof/padding: **2821**.
- Desktop, 3 + 6 + 7 + 8: **1954**. Adding 2, 4, 5 (and moving Your Games into the left column): 1910, but that left the columns uneven (left 1721, right 1490). Keeping Your Games on the right: **estimate ~1810** (left ends ~1592, right ~1619).

### Phone: the last ~200px (all ESTIMATES, not measured)
Matchups intro from 4 lines to 2 (-45, copy change: Sim's call); "Why this score?" / Legal links beside the rank instead of their own 44px row (-44); "Optional swaps:" label dropped into the card eyebrow (-31); footer bottom padding tuned to the phone bar height (88 -> ~72, -16); Game plan line under the six already 68 (3 lines) — leave. Together roughly -136: phone would land near ~3470. Getting to 3400 exactly likely needs 2b (Favoured folded) AND 4 (sliders folded).

## Notes / honesty
- Every number in section 1 and every "measured" delta comes from the Playwright runs above on this one sample team; a team with problems (open problem list, more suggestions) will be taller and the deltas differ.
- Deltas from injected CSS are prototypes, not the final code; text-overflow check found no clipped text in any combo, but uneven wraps were found in cut 3 (desktop two-up rows). Not run through experiments/polish-check.mjs.
- Screenshots taken: 4 (day-phone base, night-desk base, desk_all, ipad_all; one over the asked 3; ipad_all not viewed). All in this folder.
