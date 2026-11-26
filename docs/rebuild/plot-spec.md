# The Plot: Build page spec for the builder

Mock-up source: scratchpad `q90i/plot9.html` (states by query: `?s=after`, `&st=hatch|none|king|search|cases`, `&t=night`, `&hv=1`).
Reference pictures: `docs/rebuild/pics/nov20/Q98/` (final answer block and states) and `Q95/` (before page, search open, Save disabled, 0 to catch).
Every number below is measured from the mock-up. Sizes are px.

## 1. Colours and their one job

| Role | Day | Night |
|---|---|---|
| Page | `#FBFAF7` | `#12121B` |
| Ink (text, structure, Save, tier and Ability chips) | `#17161A` | `#E4E0DA` |
| Ink 2 / Ink 3 (quiet text) | `#48454F` / `#66636E` | `#C4BFCB` / `#B0AAB8` |
| Rule | `rgba(23,22,26,.14)` | `rgba(228,224,236,.16)` |
| PLOT blue: only what you tap to change the plot (source, Megas, Pokémon search, suggestion chips, Switch to Plan) | fill `#0078BF`, text/outline `#0068AD` | fill `#0078BF`, text/outline `#62BEF7` |
| Logo red: only action and score (Hatch, Load Team, seal, "N to catch", to-catch dot, the plot line) | `#E8364F`; red text on white `#C41E35` | same |
| White answer plates (numbers in Why it works, records, core win %) | `#FFFFFF` with 2 px ink edge | `#E9E5DE` |
| Ink band (sections 5 and 6) | `#17161A`, text `#FBFAF7`, quiet text `#C4BFCB` | `#1D1C29` |

Type-colour plates for the six (white text on all): Water `#1F6672`, Fire `#A66A24`, Fairy `#A2477F`, Dragon `#5B479F`, Dark `#5C4A3E`, Grass `#3F7F38`.
Only these six were tuned. Other types need a hex in the same family (similar lightness and saturation; Water must stay away from PLOT blue, Fire from logo red). The plate uses the Pokémon's first type.

## 2. Type

- Headlines, big numbers, plates: Unbounded 800, synthetic italic, letter-spacing -0.02em, line-height 1.05.
- Body and labels: Instrument Sans.
- Section headings: 24/28 desktop, 20/24 phone, one size everywhere. Subtitle 15 (13 phone), Ink 3.

## 3. Layout frame and the plot line

- Container max-width 1440, centred. Padding left / right: 120 / 64 (1200 and up), 88 / 32 (701 to 1199), 32 / 12 (700 and down).
- The plot line: 2 px logo red, vertical, 44 px left of the content edge (36 mid, 18 phone). Numbered nodes: 28 px circles (22 phone), 2 px red border, page-colour fill, 13 px bold number. Steps: 1 the plot, 2 The accomplices, 3 Why it works, 4 Got a Plan B?, 5 Plots that worked, 6 Partners in crime, then a filled red end node ("The end. Or is it?" + HATCH ANOTHER).
- Before building the line is solid beside step 1 and dashed (55% opacity) below; steps 2 to 4 are faint (42%) with dashed nodes. After building it is solid throughout.
- Section top padding 28 (22 phone). Grid gap for the six 12 (4 phone). Three-column grids: gap 24 x 48.

## 4. Plates

- Shape: background skewed -9deg, radius 4. Padding 0.06em x 0.32em. Every plate hugs its words; nothing stretches to fill a line.
- Chosen = filled blue with a tick. Other choice = blue outline (0.05em). Unset search = blue outline with search icon and caret.
- Every tappable thing is at least 44 px tall and wide, with at least 8 px between targets.

## 5. Before page: the one giant sentence

- Desktop lines: `My plot: build from` / `[MY BOX] or [✓ WHOLE ROSTER]` / `with [0][1][2] Megas, around` / `[⌕ ANY POKÉMON]. [HATCH IT.]`
- Fit rule: one font size for the whole sentence, the largest (capped at 84) at which the widest line fits the content width minus 10. At 1440 this gives 67.6. Line gap 0.13em, word gap 0.26em.
- Lines 2 to 4 are made to end on one edge: up to ±2% letter-spacing per line, then equal extra side padding on that line's plates (up to 24 px each side). Line 1 is a natural rag with the tap hint at its right.
- Phone lines (5): `My plot: build from` / `[MY BOX] [✓ WHOLE ROSTER]` (the two share the row) / `with [0][1][2] Megas,` / `around [⌕ ANY POKÉMON].` / `[HATCH IT.]` full width. Font 19.8 at 390; plates min-height 44.
- A chosen Pokémon: filled blue plate with its sprite, the name and a white × (0.64em circle).
- Search open: list under the plate, rows 52 tall, first row highlighted, sprite 40.
- Helper columns under the sentence: 4 across (2 x 2 mid, stacked on phone), 15 px (13 phone), 2 px top rule (blue for the three controls, red for the action). Suggestion chips 44 tall, 2 px blue outline, sprite 32.
- Faint step 2 shows three dashed places (104 tall, 56 phone) and the featured underdog (Flapple, 124 tall, 72 phone) with its one line. Underdog only on the empty page.
- Default source follows the site (`V2.bdSrcDefault`): Whole Roster for an untouched sample box.

## 6. After building: control row

- Same sentence at 15 px Unbounded on one line (1200 and up): text, source plates, Mega plates, search plate, then HATCH ANOTHER (red, 16 px) pushed to the right end. Plates 44 tall, 6 px apart; Mega plates 44 x 44.
- 701 to 1199: the row wraps to two lines.
- Phone: connecting words hidden; row 1 `[MY BOX] [✓ WHOLE ROSTER]`, row 2 `[0][1][2 MEGAS] [ANY POKÉMON]`, row 3 HATCH ANOTHER full width (17 px). All 44 tall, 8 px gaps.

## 7. The answer lockup (chosen: title + lineup on the plot line + seal)

Structure, 1200 and up: `The plot:` eyebrow (17/20, Ink 2), then one row: [title] [the six] on a 2 px red rule, and the seal at the right. The seal's bottom sits on the same line as the red rule.

- Row: stage height 100, red rule under it, 28 gap, seal column 196.
- Title: no box, site capitalisation, break only after the "·", balanced lines. Size by name length: up to 18 characters 52 (one line); 19 to 28 characters 40; longer 40. Phone: 22 for up to 18 characters, else 18. Mid widths: 60 / 40 / 40.
- The six: start 20 px after the title text, feet on the red rule, each with a soft ground shadow (ellipse 7 tall, 10% ink). Neighbours overlap by 4 px.
- Visual-size rule for the six: trim each sprite's transparent edge first. Height = min(K × (h/w)^0.4, cap), width from the trimmed ratio; if width exceeds 1.25 × cap, clamp width and recompute height. K / cap: 80 / 92 (1200 and up), 70 / 84 (701 to 1199), 47 / 58 (380 to 700), 38 / 48 (under 380). Measured at 1440 for the real team: 114x63, 89x75, 115x61, 78x82, 64x92, 82x79.
- To catch: a 12 px red dot at the sprite's top right, 2 px page-colour ring.
- Tappable cue: each sprite is a button (min target 44 x 44) that opens that Pokémon's info. Hover / focus: sprite lifts 4 px, shadow grows (12 tall, 26% ink), a small ink label "Name · open its info" appears above.
- Seal: upright, flat, red, radius 10, thin white inner ring 5 px in (4 phone). 196 x 120 desktop and mid; 122 x 92 phone. Inside: "STRENGTH SCORE" 13 px caps (9.5 phone), number Unbounded 60 (44 phone), band word 17 (13 phone). Same size and position for every score and band.
- Under 1200 the six leave the title row: title and seal share a row, then the six stand on a full-width red rule beneath.
- Meta line 1: tags (13 px bold, 2 px ink outline, radius 4; "N to catch" filled red) then the catch sentence (desktop only). Meta line 2 (15 px): rank line in bold, score breakdown, `Why This Score? ›`. On phone the breakdown is hidden here.
- States use the same lockup: Hatching = grey title "Hatching…", six dashed slots (56 x 72; 44 x 52 phone), dashed empty seal with "–". No team = title "No team yet", same slots and empty seal, then the site's note and next-step plates.

## 8. The accomplices

- Six plates in a row at 1200 and up; 3 x 2 from 1199 down; 2 x 3 under 380.
- Plate: type colour, clipped parallelogram (12 px slant; 3 on phone), padding 0 14 12.
- Sprite: bursts above the plate, feet on one line. Equal-area rule on the untrimmed file: K = min(140, 0.72 × column width), height = min(K × sqrt(h/w), 1.04K), width clamped to column width + 6.
- Order inside: tier chip (ink, 15/26), MEGA label row (13/15, blank for non-Megas), name (Unbounded 15/20; 13/17 phone), fact line (13/20: "In your box", or a white strip with red text "Not in your box yet"), Item chip (white), Ability chip (ink), four move chips (30% black over the plate). Chips 13/18 with 3 px vertical padding, 3 px apart; Item and Ability labels in a 44 px left column (hidden on phone).
- Actions directly under: LOAD TEAM (red), SAVE (ink), COPY FOR SHOWDOWN (ink outline). Desktop: 24 px, 48 tall, 16 gap, equal extra padding so the three fill the row. Phone: Load Team full width 48 tall, Save and Copy side by side 44 tall.
- Save at 10 teams: 38% opacity plus the site's "10 saved teams already".

## 9. Lower sections

- Why it works: 2 x 2 grid of sentence lines (Unbounded 20; 13 on phone with 15 px plates), numbers on white plates, the site's small line under each (15, Ink 3). Trio sprites 40 x 36.
- Got a Plan B?: three columns (stacked on phone), 2 px ink top rule each. Kind label, score 44 (ink), band word 17 (ink), name 15 on one line, matchup line 13, the six as a small lineup on a red rule (K / cap 46 / 54; 38 / 44 phone) with to-catch dots, blue "Switch to Plan X" plate (44 tall).
- Plots that worked (ink band): three columns. Record on a white plate (24), "1st of N players · date", outlined LOAD TEAM at the right, event name with "Full sets ›", six sprites (56 tall; 38 phone), then Copy for Showdown, Set as Opponent ›, Compare ›.
- Partners in crime (ink band): one control row (Pairs / Trios / Full Teams, Top Rated / Most Used, "With a Pokémon…" field, all 44 tall, then the hint line with How Cores Are Ranked ›). Rows in two columns (one from 1199 down): sprites 50, name 15 bold, small line 13, Teams with It ›, win % Unbounded 22 with "wins · +x vs avg", outlined ADD. 8 rows desktop, 4 phone, then "Show N More ›".

## 10. Breakpoints

| Width | What changes |
|---|---|
| 1200 and up | Six in one row; lockup has the six in the title row; control row on one line; cores in two columns; helper columns 4 across. |
| 701 to 1199 | Six 3 x 2; lockup six move under the title on their own red rule; control row wraps; cores one column; helper columns 2 x 2. |
| 380 to 700 | Phone paddings; five-line sentence; compact control block; grids stack; Plan rows compact. |
| Under 380 | Six plates 2 x 3; smaller lockup sprites (38 / 48). |
| Over 1440 | Container stays 1440, centred; the ink band runs full width. |

## 11. Measured heights

- Desktop 1440 x 900: action row ends at 842.
- Phone 390: the six plates plus actions end at 1,268; whole page 3,451.
- 768: action row ends at 1,550. 1024: 1,451. 320: 1,716.

## 12. Known gaps

- Rank lines for Plans B, C, D were not read from the real page; the 64 "Needs work" case is a layout sample.
- The phone before sentence does not fill the width; long-name cases on phone were checked only at 390.
- Other type colours (beyond the six above) are not chosen yet.
