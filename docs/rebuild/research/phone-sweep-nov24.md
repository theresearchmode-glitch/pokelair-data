# Phone polish sweep (overnight JOB 3, alt/phone-sweep), report only

Written 12:10 AM Tue Nov 24, 2026 (docs/rebuild/now.sh). Base: `claude/design6` at **136e7cd9**, frozen data 0c992f69 in out/.
Build: `node app/build.mjs --v2 --preview-data --art=../src/v2/art/` -> "built dist/v2.html (4239 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)".
No fixes made.

## What ran (checked)
- `TARGET=v2 VIEWS=<29 views> STEP=20 W1=699 STYLE_W=320,360,390,414 node experiments/zz-polish-phone.mjs`: a temporary copy of
  experiments/polish-check.mjs whose only change is an upper width limit (`W1`, here 699; the original always runs to 2560). Deleted after.
  Views: home, build, team, battle, calc, practice, gauntlet (Test Run), speed, types, meta, usage, sets, natures, archetypes, tournaments,
  events, weekly, news, gifts, track, method, about, feedback, box, pokemon=Garchomp, compare, team-empty, sheet, guide.
  Layout checks at 320-680 every 20 px (day); style checks at 320/360/390/414, day and night.
  Result line: `polish check: spill 17, uneven 24, lone 79, tap 10, lineh 19, glow 9, boxes 13, space 183; page errors 0; 432s` (exit 0).
- Full-page screenshots of 26 pages at 320, 360, 390 and 414 (phone context, touch, day): 104 pictures. The 390 set is in `pics/full-390/`;
  all four widths were taken (not committed: 34 MB).

## Ranked: what a person notices first (my judgement from the findings and the pictures; "checked" = seen in a picture)

1. **Pokémon page, "Brought with it most": the percentages run off their cards** at 320-360 (`a.pk-pc` "Charizard 65%" +12 px at 320,
   +7 at 340, +2 at 360). Checked in `crops/2-pokemon-partners-320.png`: the big blue % sits over the card's edge and the next card.
2. **Too-small tap targets** (the phone rule is 44 px):
   - Home's tool plate titles are links only as tall as their text: "Ratings" 19 px, "Winning Teams" 21, "Speed Tiers" 25, "Damage
     Calculator" 37 (360-414), "Team Preview Practice" 41 (414). (`crops/3-home-tool-titles-390.png`)
   - Battle "0 of 4 picked" 26 px (`crops/4-battle-0of4-390.png`); Build "How Cores Are Ranked" link 18 px (`crops/7-build-cores-link-390.png`).
   - Pokémon page item names as buttons: "Choice Scarf" 33 px, "Life Orb" 30 px; Popular Sets "Modest" 42 px.
3. **Meta pages' tab row: uneven labels** at 320-360 on Winning Teams, Events, Archetypes, This Week: "Winning Teams" and "This Week"
   break onto two lines, "Events" and "Archetypes" stay one (checked: `crops/5-meta-tabs-320.png`).
4. **Track Record: "TOTAL 230×" spills its receipt by 9 px at every phone width 320-680** (`p.trk-tot`). In the picture
   (`crops/1-track-total-320.png`) the "×" reaches the receipt's right edge; not obviously cut, so lower than 1-3 (judgement).
5. **Small spills (2-4 px)**: Speed Tiers row "203 Mega Garchomp Z" +4 px at 360 (`crops/6-speed-row-360.png`: tight, not cut);
   My Team / team sheet "Mega Charizard Y Unfavoured" row +3 px at 320; team sheet "Build Around It" button +4 px at 320.
6. **Uneven button rows** (some labels wrap, others not): My Team header actions ("Saved Teams 1 ›" 2 lines vs "More ⋯" 1) 320-400;
   Winning Teams "Copy for Showdown / Set as Opponent / Compare" 320-520; Usage and Popular Sets source chips 440-520; Damage Calc
   "Hits both foes / Screen up / Helping Hand" 340-400; Speed Tiers control chips at 320; Meta tier rows ("Hisuian Arcanine 8…").
7. **Lone items (one thing alone on the last row)**, the most visible: Pokémon page type line (11 chips, e.g. 5+5+1 at 420-440, 4+3+3+1 at
   320), News series list 4+3, Test Run key 4+1 at 580-680, Home bands 4+1 at 520-640, How We Calculate bands 4+1 at 560-680, Damage Calc
   turn switches 3+2. Many 2+1 rows are three-item rows (move tickets, matchup rows) that are designed to wrap; listed in the raw output.
8. **Style notes** (seen only by measurement): line height 1.3-1.4 on small two-line notes (19), "glow" on This Week's weather tiles
   and the guide's "Top tier" (9), four or five stacked shades on move tickets, Home kicker, Gifts button, Damage Calc photos (13),
   183 spacing values off the 4 px grid (mostly the header's computed margins 57.2 / 24.1 px and similar, as on desktop).

## Not checked
- Night-theme screenshots (night ran in the style checks only).
- Landscape phones, tablets 700-1099, real iPhone Safari (WebKit was not used here).
- Whether any finding is already on a known list (polish-check has no known list).

## Files
`phone-sweep-nov24.md` (this), `polish-out.txt` (every finding line), `polish.json` (raw), `crops/` (the pictures named above),
`pics/full-390/` (26 full pages at 390).
