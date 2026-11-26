# Polish sweep, Nov 18 night (look only)

Written Wed Nov 18, 2026, 1:11 AM (clock: `docs/rebuild/now.sh`). No site code changed.

## What was run

- Now: claude/design6 at e9b8bd6e. Before: 30d34063 (Nov 17 evening), in a detached worktree.
- Both built with `node build.mjs --v2 --art=../src/v2/art/ --preview-data`.
- Then `TARGET=v2 VIEWS=<every page> node experiments/polish-check.mjs`: widths 320-2560 (step 80), light; style checks at 390 / 820 / 1440, light and dark.
- Page errors: 0 in both runs.

Two corrections to the brief:
- **Not all pages by default.** With `TARGET=v2` and no `VIEWS`, the script checks only 6 pages (guide, team, team-empty, box, compare, sheet). I passed every registered page: 29 now, 27 before (#gifts and #news are new).
- **No sprites without `--art`.** The build named in the brief (`--v2 --preview-data`) loads no sprites from app/dist/. I ran both builds that way first, then again with `--art=../src/v2/art/`. The findings were the same, apart from one element name in one calc spacing line. The numbers below come from the sprite runs.

## Totals

**Before 320 findings, now 366.** By kind: spill 41 → 39, uneven 19 → 17, lone 118 → 124, tap 4 → 9, lineh 4 → 4, glow 14 → 13, boxes 2 → 7, space 118 → 153.

Every page, before → now (all kinds; without "space" in brackets):

| Page | All | Without space |
|---|---|---|
| home (now The Stampede) | 11 → 51 | 8 → 19 |
| gifts (new) | 0 → 6 | 0 → 3 |
| news (new) | 0 → 8 | 0 → 5 |
| sheet | 20 → 17 | 13 → 10 |
| team | 14 → 11 | 7 → 4 |
| speed | 6 → 5 | 3 → 2 |
| weekly | 17 → 16 | 13 → 12 |
| about, archetypes, battle, box, build, calc, compare, events, feedback, gauntlet, guide, meta, method, owner, pokemon, practice, sets, team-empty, tournaments, track, types, usage | unchanged | unchanged |

In plain words:
- Every new finding is on Home, #gifts or #news.
- No other page got worse.
- Team, Sheet, Speed and Weekly each lost findings. Gone: the "Pokémon Page ›" spill and the uneven pool slider in the set editor; the lone row in the set-edit actions; the weather chips on Speed; the top list on Weekly.

## Real new defects, most visible first

1. **News: the coupon's "Copy Code" button cuts off its own label ("Copy Cod").**
   - Where: the Clip and Claim coupon on #news, every width from 640 to 2560, light and dark.
   - Measured: the button is 82px wide with 0px side padding, so the slanted clip-path eats the first and last letters.
   - Below 640 the label is not cut, but the font is still plain Instrument Sans. On #gifts the same button uses the slanted Unbounded button style.
   - Cause: `app/src/v2/css/sd-dispatch.css:18`. `.dp-paper button{font:inherit;…;padding:0}` (specificity 0,1,1) beats `.np-btn{padding:0 var(--s8)}` (0,1,0).
   - Fix point: `.dp-cpn .np-btn.pr-copy` at line 107 should restore the padding and button font.
   - The check missed this: the text sits inside the box, and the clip-path hides it. I found it in a screenshot.
2. **Home, Battle tile: "VS" disappears behind the sprites.**
   - Where: 820 (light and dark), and partly at 390. It reads fine at 1440.
   - Each side's two 96px sprites are wider than their grid column, so they spill into the VS column. Whimsicott's white fluff sits right behind the white "VS".
   - Cause: `sd-tools.css:82-85` (`.sdt-vs` grid, `.sdt-side .np-mon{--iw:96px}`), plus line 142 at that breakpoint.
3. **Home, Test Run tile: tiny picture over a large empty area.**
   - Where: all widths.
   - The 1.2fr / 2fr columns are narrow, and `.np-mon .st{max-width:100%}` (`components.css:35`) squeezes the "three" sprites to about 30-40px. The text is pinned to the bottom, so the middle of the tile is empty: 107px at 390, 62px at 1440.
   - Check flag: "space … sdt-sm > div.sdt-tx marginTop".
   - Cause: `sd-tools.css:112-115` (`.sdt-tr`, `.sdt-three`), together with `.sdt-sm .sdt-tx{margin-top:auto}` (line 104).
4. **Home, Damage Calc tile: empty band under the subtitle.**
   - Where: 820 in both modes, where the band is 120px. Smaller at 1440: 37px.
   - The tile stretches to the Ratings tile's height, and `.sdt-hit{margin-top:auto}` (`sd-tools.css:90`) puts all the spare height above the damage picture.
   - Check flag: "space … sdt-dc > div.sdt-hit marginTop".
5. **Home, Strength Score receipt: band bars have unequal widths.**
   - Where: the narrow receipt, at 880-1500 wide.
   - The "Tournament ready" bar is about 77px; the others are 41-59px. Labels wrap unevenly ("Solid" on one line, the rest on two).
   - Cause: `sd-six.css:70`. `grid-template-columns:repeat(5,minmax(min-content,1fr))` lets the word "Tournament" widen its column.
   - Small, but it sits right under the big score.

## New findings that are false alarms

- **Home, "lone" receipt bands (4+1, 3+2, 2+2+1); #gifts, "lone" on `pr-meta`.** The receipt and the gift label are slightly rotated, so items in one row have tops a few px apart, and the check reads them as separate rows. The screenshots show one row.
- **Home, "lone" on `sds-in` (2+1, 1360-2560).** Three columns in one row with `align-items:end`. The tilted receipt is shorter, so its top is lower.
- **Home, "lone" on `sdt-six` (4+2, 5+1) and `sdt-pod` (2+1).** Both are one row aligned to the bottom. Two-line names and the podium's lower third step move the tops on purpose.
- **#news, "lone" on `dp-sr` (4+3, 320-800).** Deliberate: per the comment at `sd-dispatch.css:206`, a short last row's cells widen to fill it.
- **#news, "lone" on `dp-boxes`.** Below 700 the date takes its own full row and the two boxes share the next. Above 700 it is one centred row of three. The check reads DOM order and centred tops.
- **#news, "lone" on `dp-r2` (880-1040).** Two stories, then the coupon spanning both columns (`.dp-r2 > .dp-cpn{grid-column:1/-1}`). Intended.
- **"lone" on the footer nav, #gifts and #news (3+2, 4+1, 320-480).** The same footer as every other page. It was already flagged before tonight, so not new.
- **Home, "tap" on `a.sdt-go` (21-40px).** Each tile title is a stretched link: `.sdt-go::after{position:absolute;inset:0}` inside `.sdt-p{position:relative}`. The whole tile is the tap target.
- **Home, "boxes".**
  - `sdh-tag`: name tags floating over the hero crowd.
  - `sds-rb`: the "Open My Team" button on the receipt.
  - `sds-tg`: name tags on the lead diagram.
  - These are labels and a button over pictures or paper, not cards nested in cards.
- **Every new "space" finding: computed `margin:auto`.**
  - `.np-mon .st{margin:0 auto}`, the header's auto margins, `.sdt-vs / .sdt-hit / .sdt-sm .sdt-tx{margin-top:auto}`.
  - HANDOVER.md already lists auto margins as a known checker false positive.
  - Two of them point at real empty space (defects 3 and 4 above), so they are listed there.

## Seen in passing (not a check finding; for Sim's eye, not judged here)

- **Hero tagline.** At 1440 the hero sprites cover part of "your win rate." in the tagline. This looks like intended depth, but it does cost some readability.
- **Battle tile name labels.** At 1440 the names under the sprites are small blue and pink text on near-black. The contrast looks low; I did not measure it.

## Files

Raw outputs (scratch, not committed): `old.txt`/`new.txt` and `.json` from both runs, the comparison script `cmp.mjs`, and the screenshots in `shots/`. All are in the session scratchpad.
