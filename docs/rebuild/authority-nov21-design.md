# Design authority summary, Sat Nov 21 (1:15 AM to 10:00 AM Eastern)

Draft, filled in through the night; sent to Sim at 10 AM with pictures beside each item.
Scope: refine the three new designs (My Team frame, the new Damage Calc "Plot the hit", Build's Plot) within their mock-ups;
every feature kept; nothing live, no switch, no deletes. Times are from log-decision.sh (docs/rebuild/decisions.md).

## My Team (the frame)
| Time | Decision | Why | Picture |
|---|---|---|---|
| 1:20 AM | Dark mode: frame stays black, panels stay paper | the frame reads as one object; 0 words under 4.5:1 | authority/myteam-dark-390.png, -1440.png |
| 1:21 AM | Lead advice stays in Battle; the Nov 20 line sits under the Game Plan bar | one tap to where leads are decided | authority/myteam-1040-frame-lead.png (bottom) |
| 1:21 AM | Empty spot: dashed "+ Add a Pokémon" row; "Add" tile on phones | you add where the Pokémon will stand | authority/myteam-st-five-1440.png, -390.png |
| 1:21 AM | New visitor keeps today's empty page | six empty rows would be a wall of "Add" | authority/myteam-st-empty-390.png, -1440.png |
| 1:21 AM | No reorder control | today's page has none; a new feature is Sim's call | none |
| 1:34 AM | Phone names whole on one line; "1 of 6" under a long name; Edit Set its own row | mid-word breaks, a spilling bar, a wrapped button | authority/myteam-party-*.png, myteam-set-*.png |
| 1:37 AM | 1000-1279: two columns, Suggestions full width; no white boxes; even link grid | moves and buttons were squeezed | authority/myteam-1040-frame-lead.png |
| 1:59 AM | Names narrowed to fit at every width (no '…'), only when they overflow; links one line each in a wide column | desktop cut 'Mega Charizar…'; every name was squeezed 1-2% by a 2px slip | authority/myteam-1040-frame-lead.png |
| 3:51 AM | FLAG: the frame opens the first Pokémon's set before any tap (your Nov 18 C said nothing until a tap) | the approved mock is three parts always shown; an empty middle breaks it | authority/myteam-1040-frame-lead.png |
| 3:58 AM | Long names on phones wrap at spaces; a single long word may narrow to 55%; never cut or split | 'Paldean Tauros (Combat)' was 57px past its 47px tile | authority/myteam-longnames-360.png |
| 4:02 AM | Phone status line in your earlier short form '6 of 6 · Grassy Terrain · Legal ✓' | the long form wrapped to 2 lines at 360-390 | (q84 all passed) |
| 4:04 AM | 320: Remove within 650px of the tapped Pokémon (types side by side, Lock after the buttons, lower stage, 36px move bars) | was 739px (your Nov 17 rule: 650) | authority/myteam-320-set-tight.png |
| 4:06 AM | Suggestions links 13px on phones; a one-line list at 375 and narrower | 'Suggestions ›' ran into the next link | authority/myteam-sglinks-390-13px.png |
| 3:53 AM | Your type rule: 'S tier' tags and row numbers in Instrument Sans; buttons 15px | 8 kinds of Unbounded under 15px | (v2-unbounded clean) |
| 5:12 AM | Header links start at the left of their columns (were centred) | 'Update Team' pushed 'Share as Image' 30-38px sideways after Remove | authority/myteam-links-left-820.png |
| 1:44 AM | Suggestions links: one even row of three (two lines each); a list under 360 | Refresh sat alone at 1440; 320 too narrow | authority/myteam-sglinks-320/390/1440.png |

Polish check (VIEWS=team, 320-2560, light and dark), measured 2:00 AM: spill 0, uneven 0, line height 0 (was spill 7, uneven 1, lone 8,
line height 1, boxes 3). Left: 7 'lone' readings that are deliberate layouts (the ‹ name / 1 of 6 › bar, score and header grids,
Suggestions full width at 1000-1279, the old footer) and 2 'boxes' (the mock's move bars and yellow bar). Contrast: 0 low, day and night.

Open for Sim: on phones under 480 the header's links move up 17-37px after Remove, because the score's band words change (Top tier to Tournament ready, 2 lines). Fixing it means a fixed-height score block.

Trade-off to flag: My Team on a phone is about 4 screens (3,810px at 390), not the brief's 3. Every part is a feature, and Sim said
on Nov 20 no more folds, so nothing was hidden.

## New Damage Calc ("Plot the hit")
| Time | Decision | Why | Picture |
|---|---|---|---|
| 12:17 AM | Title "Plot the hit" | Build is already "The plot" | calc-plot/ |
| 1:37 AM | Tablets: KO Board full width under 4 even columns | its tiles were 40px, under the 44px tap rule | authority/calc-night-760-koboard.png |
| 1:55 AM | Switches 5 across or 3 + 2, never one alone; no clipped letters; bigger ring on two-line labels; tablet photo names wrap, ▼ becomes a corner badge at 700-899 | polish-check: 4+1 rows, +8px name spill (now 0) | authority/calc-switches-320/1040.png, calc-photos-700-880.png |

## Build (The Plot)
| Time | Decision | Why | Picture |
|---|---|---|---|
| 12:48 AM | Test OL-i15 now checks "no tag alone on a row" | free-wrapping tags can't make equal rows | none (page unchanged) |
| 4:55 AM | Full Teams rows: LOAD TEAM on its own line on phones; on desktop names + LOAD TEAM under the sprites and win rate when the row is narrow | LOAD TEAM sat on the win rate (bug from piece 5) | authority/build-fullteams-after-390.png, -1280.png |
| 2:52 AM | Winner event names at 700-879: small-label font (Instrument Sans bold 15px), break only at spaces or hyphens | 'Champion/s-MC' broke mid-word in a 91px column | authority/build-event-name-700-860.png |

Questions waiting on Sim: page frame width at 1200+; the winner top row.
