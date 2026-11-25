# qcheck fix and triage, Nov 18 (look-only on the pages)

- Written 1:35 AM Wed Nov 18, 2026 EST (from `bash docs/rebuild/now.sh`).
- Branch `claude/design6` at `90b5bd01`. Page: `node app/build.mjs --v2 --preview-data` (frozen Nov 10 data), `app/dist/v2.html`.
- Follows items 5, 6 and 7 of `full-run-nov18-night.md`. No page code changed; only `app/test/qcheck.cjs`.
- One browser at a time. Load average 4 to 6 (other sessions on the machine).
- Setup note: `app/dist/` has no sprite files (`sp/*.webp`), here and in CI. Every Pokémon picture shows as a broken image.
  The boxes keep their sizes, so the findings below do not depend on it. Screenshots show the broken-image icons.

## Job 1: qcheck counts `::before` hit layers

**The gap.** qcheck's tap test (`qcheck.cjs` line 35) counted an invisible hit layer only on `::after`, and only by its
negative insets (`top:-12px`...). Two kinds of real 44px areas were missed:
- `::before` layers (components.css 167-169, rule C8). Commit 96b9c89c moved My Team's "Import a Team ›" / "Build Me a Team ›"
  onto one, so qcheck saw 20px.
- Layers sized by width/height, not insets: C8's `width:max(100%,44px)` centred, and Home's tool plates, whose link `::after`
  is `inset:0` across the whole plate (sd-tools.css line 19, "stretched link").

**The fix.** For both `::after` and `::before` (absolute, with content): take the larger of the inset growth and the layer's
own computed width/height. A layer with `pointer-events:none` doesn't count, because it takes no taps.

**Proof it still catches small targets** (scratch page, 4 links, 20px tall, `WIDTHS=390`):
- Old qcheck: `day 390: 3 findings` (small link, `::before` 44 layer, `::before` with pointer-events:none). The `::after` inset link passed.
- New qcheck: `day 390: 2 findings`: `TAP 130x20 "Small link no layer"`, `TAP 178x20 "Before layer ignores"`.
- Meaning: the 20px link with no layer is still flagged. A dead layer is still flagged. Only a real 44px layer now passes.

**Proof the removed findings were false** (hit test at 390, `elementFromPoint` inside the claimed area):
- My Team: "Build Me a Team ›" and "Import a Team ›" (20px links): taps 21px above and below their centre land on the link (`hits 1111`).
- Home tool plates: taps at the plate corners and edge middles land on the link: 10 plates `1111`, 2 plates `1101`.
  The miss is one corner where another button sits on the plate. So the plate is the tap area.

**Full run, before and after** (`PAGE=app/dist/v2.html node app/test/qcheck-all.mjs`):
- Before: `qcheck-all: 26 pages + 19 views x 5 widths x 2 themes, 457 findings, 352 new; 1615s`
- After: `qcheck-all: 26 pages + 19 views x 5 widths x 2 themes, 259 findings, 154 new; 1594s`
- Only removals, nothing new appeared (diff of the two NEW lists).

| Page | New before | New after | What went |
|---|---|---|---|
| team (main + 11 views) | 154 | 22 | 132 TAP "Import a Team ›" / "Build Me a Team ›" (`::before`, false) |
| home | 136 | 70 | 66 TAP on the 12 tool plate titles (stretched `::after`, false) |
| gifts | 48 | 48 | none |
| news | 14 | 14 | none |
| calc, types (known list) | 105 known | 105 known | unchanged; all other pages 0 |

Note: the earlier report counted team 132 and home 130. Since then, team gained 22 (`TAP 38x44 "?"`, real, see below) and home 6.

## Job 2: triage (Mystery Gifts, News, Home)

Each distinct finding counted once; widths and themes listed. "Real" means seen in a screenshot or measured, with its cause.

### Real defects

1. **News: the masthead has no space around the name** (OVERLAP "Dispatch" x "Wed, Nov 18, 2026", 390 and 820, day and night).
   - Seen: at 390 and 820 the "p" of "Dispatch" almost touches the date; "The Champions" sits on the top rule.
   - Measured: `.dp-name` margin is `0px 0px` at 320/390/820/1280; the name's box ends where the date's begins (390: 310 / 310).
   - Cause: sd-dispatch.css line 14 `.dp-paper :is(h1,h2,h3,p,ul,ol){margin:0}` (specificity 0,1,1) beats line 33
     `.dp-name{margin:var(--s3) 0 var(--s4)}` (0,1,0). The 12px / 16px never apply on the big paper.
     Home's small paper is unaffected (`.dp-small .dp-name`, 0,2,0, wins). Other `.dp-*` margins in that file may hit the same reset (not checked).
2. **Home: the six band's "Mega Charizard Y" tags run past the board** (CLIPPED by `sds-board`, 320 and 1280, day and night).
   - Seen: at 1280 (board 251px wide) both tags are cut: the right one loses part of the "Y", the left one starts at the edge.
     At 320 the right tag's slanted end is cut flat at the board's cut corner; the text is whole.
   - Cause: sd-six.css line 103 `.sds-tg{white-space:nowrap...}` at 13px Unbounded, inside a board with `clip-path` (narrow
     board column at 1280). The `.nar` fallback (line 105) isn't applied to this name. qcheck flags only the right tag.
3. **Mystery Gifts: "Home" back link is 39px wide** (TAP 39x44 "Home", 320/390/820, day and night).
   - Measured 38.9 x 44. Cause: pages.css line 481 `.np-back` gives `min-height:var(--tap)` but no width rule and no C8 layer.
   - Small, but under the 44px rule C8.
4. **My Team (not one of the three pages, new since the night run): the "?" next to "None logged yet" is squeezed to 38px**
   (TAP 38x44 "?", 320 only, main view and all 11 views, day and night).
   - Seen: the "?" plate is visibly narrower than the Team Checks "?" (18px vs 24px); "None logged yet" wraps to two lines.
   - Cause: sugs.css line 118 `.sg2-tip{width:var(--tap)}` sits in the flex row pages.css line 382 `.tm-yg-n{display:flex}`
     with no `flex:none`, so it shrinks. pages.css line 1552 already gives `flex:none` in `.tr-foot` only.

### Needs Sim's decision (rule question, not a page bug)

5. **Fluid display sizes that land between scale steps** (SIZE; 4 kinds).
   - News 390: 32.6px "The Champions" / "Dispatch" (`--d-papertwo: clamp(24px,10cqi,72px)`).
   - Home 390: 31.2px "97" (`--d-sdnum`/`--d-sdpair`), 37.2px "Call six out of the herd." (`--d-sdsix: clamp(34px,10.4cqi,64px)`).
   - Home 1280: 36.2px "/100" (`--d-sdof`).
   - All are display tokens in tokens.css. CLAUDE.md allows "(+ display)". qcheck exempts only 40px and up.
   - Question: may display type shrink below 40px (between 34 and 40, or under 34)? If yes, qcheck should learn the display
     tokens. If no, the clamp floors go to 34 or 40. Unsure which Sim wants.
6. **Action links inside a sentence** (TAP; 4 kinds).
   - Gifts "Source: nintendoeverything.com and nintendolife.com", "criticalhits.com.br", "levelup.com", "the official news" (17-19px tall).
   - News "All Mystery Gifts ›" in the coupon (108x16; sd-dispatch.css line 111 makes `.dp-lk` inline there).
   - Home "All Ratings ›" (89-94 x 20, `.sdh-all` in `p.sdh-say`).
   - All at 320/390/820 (Home: 320/390/820), day and night.
   - The project's own C8 rule exempts links inside a sentence (`.np-link:not(p .np-link)`), and WCAG 2.5.8 has the same
     inline exception. So not a defect by the rule. But two source links sit 19.5px apart on phones, and the "›" ones read
     as actions. Sim's call whether "›" links get the 44px layer anyway. qcheck has no inline exception, so they'll stay flagged.

### False alarms (no visible problem)

7. **Text font boxes, not letters** (OVERLAP). Unbounded's font box is 1.4x its size, taller than the line height (1.0-1.2),
   so the boxes of stacked lines overlap while the letters don't. Checked in screenshots:
   - Gifts "CONTENTS" x the gift name ("100 Quick Coupons", "Vivillon Trainer Icon"), 390/1280/1920 (390 day, 1280 night seen):
     the label sits close above the name, nothing touches. The label's -1deg tilt adds to the box overlap.
   - Home "113" x "events" and "13,826" x "tournament teams" (tools band big numbers, 34px, all phone widths): clear gap.
   - Home hero plates "Rillaboom"/"Sneasler" x "97" (320, 1280), "Incineroar"/"Kingambit" x "96" (1280): name above number, clear.
   - Home "The Champions" x "Dispatch" on the small paper (all widths): tight by design, nothing touches (the h1 exemption
     doesn't cover it because the small paper uses `<p>`).
   - Home "Your Strength Score" x "93" (1920): about 12px clear; the report card is tilted.
8. **Home hero headline vs the name tags** (OVERLAP "your win rate." x "93"/"94"/"Mega Charizard Y"/"Mega Raichu Y", 1280/1920):
   the tags sit under the headline's last line, in the space below the letters. Only "your"'s "y" tail comes near, and the
   tags clear it. Unsure whether it stays clear with the real sprites (tags are placed over the crowd art; sprites were missing here).
9. **Home "Sharply raise" x "your win rate."** (320, 390): two spans of one headline sharing a line ("raise your"). A normal
   word gap; qcheck's headline exemption only covers stacked lines.

### Seen in passing (not qcheck findings)

- Home small paper at 390: the top line wraps unevenly ("NO. 67 · LATE / EDITION" against "WEDNESDAY, NOVEMBER / 18, 2026").
- Gifts label: "SERIAL CODE" heads "Sent Sep 9" (how it's given + sent date, postroom.js line 80). Reads oddly. Unsure it's meant.

## Scripts used (scratch, not committed)

Probe page, crop/measure scripts, rule finder and hit test lived in the session scratchpad. The two full runs' outputs are summarised above.
