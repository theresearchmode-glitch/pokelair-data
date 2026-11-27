# Open audit findings re-checked on check216.html (Nov 16, look-only)
Method: Playwright at 320/360/390/820/1100/1440 (some 1920), day theme unless noted; range-rect text measurements plus screenshots I looked at. Shots in /tmp/claude-0/-home-user-pokelair-data/25f65f15-063e-5621-be2b-3a9994dfed43/scratchpad/agents/open/shots.
Short verdicts: 24 STILL REAL rows, about 11 FIXED groups, a few UNSURE. Audits' stale statuses (Nov 14-15) mostly predate tonight; polish items not listed were NOT re-tested.

## STILL REAL (fix suggestion in last column)
| audit | id | page@width | evidence | shot | fix |
|---|---|---|---|---|---|
| meta4 / nov15b | Events C8, nov15b #1 | Events@320 | 4 of 13 tickets: name text runs 2-12px into the stub (Trinity Championship, EXTRA LIFE, Pokexiaotian, RookideeVGC); up to 6 lines; 360+ clean | ev320-strip.png | give .tk-mid min-width:0 + overflow-wrap/hyphens or a smaller name size under 340px |
| meta4 | Events C5 | Events@1100/1440/1920 | left hero column text ends y=377, plate runs to y=724 (about 347px empty at 1440; 286px at 1100) | ev1440.png | move "113 events..." counts/legend under the headline, or let the plate sit beside a taller left block |
| meta4 | Events tab wrap | Events/Weekly/Archetypes sub-tabs@<=390 | "Winning Teams" and "This Week" are 2 lines (1 line at 430+; Winning Teams 1 line at 390 only on #tournaments). Tabs stay 44px high, so it is tidy but wraps | ev320-strip.png | shorten label to "Winning" / accept as designed; Sim call |
| meta4 | Archetypes P3 | Archetypes@1100/1440 | Grassy Terrain tile: sprites end at 39% of tile width at 1440 (50% at 1100); Tailwind 66%; Rain 68% | arch1440.png | spread/scale tile sprites to fill the width (justify space-between) |
| meta4 | Track P7 (lone word) | Track@320 | "?" sits alone on its own line under "A fair test: the ratings never saw these events" | tr320.png | nowrap-glue the "?" to the last word |
| nov15b | #2 / This Week B2 | This Week@320 | Most-risen/fallen rows: name text overlaps the points badge by 3px (Whimsicott, Archaludon), Mega Salamence touches (gap 1px); 360+ gap 37px+ | wk320.png | cap name width at badge-left minus 8px, let it wrap |
| naming/b-b-t | #25 SpA vs Sp. Atk | Calc | both styles on one page: "32 SpA points" and "32 Sp. Atk points", "0 SpD" vs "0 Sp. Def" | ca320.png | one spelling |
| b-b-t | #15 Speed "top 20/30" | Speed@all | headline "Your six vs the top 20" and footer "Your six above the line · the top 20 below", but every card says "outspeeds N% of the top 30 threats" | sp1100.png | decide if 20 or 30; make one |
| b-b-t | #3/#5 mid-word break | Battle empty@320 | "Whimsicot/t", "Basculegio/n" in Your Six cards (midword scan found only these two on all pages at 320/390/820) | b320.png | 3 columns too narrow at 320: 2 columns, or smaller name size |
| b-b-t | #10 Type Chart | Types@320 | "Fighting" chip label cut on the left ("ighting") | ty320.png | shrink chip font/padding at 320 |
| b-b-t | #9 Calc | Calc@320 | WEATHER/TERRAIN labels crossed by the dash line; "Charizard Y" touches the Swap disc; "Weather Ball" / "Guaranteed OHKO" run to the move card edge | ca320.png | add background to the label, move Swap, tighten move-card padding |
| b-b-t | blueprint clip | Build blueprint@320 | "88 from its Pokémon and sets · ±0 matchups": text ends x=298 but .bp clips at x=289 (9px cut: "matchup"). 360+ fine. Spec controls and the 1100-1280 name/score overlap are FIXED | bp320.png | wrap this line (min-width:0) |
| b-b-t | #32 Recent Winners "Open ›" | Build@320 | "Open ›" sits on top of the last sprite ("Ope" cut) in each Recent Winner row | bp320.png | put Open › on its own line or drop the 6th sprite on phones |
| home-meta | #2 hero stats | Usage/Sets@320 | numbers crowd: "37.7%" ends 233, "51.8%" starts 236 (3px); Sets hero "17.1% 53.7% 100" touch; Sets sprite still covers the "S tier, rated 94, #5 of 321" line | u320.png st320.png | 2 stats per row at 320, move sprite behind/above text |
| home-meta | podium clip | Usage@320 | podium "Indeedee (F)" text right edge 311 vs clip 305 (cut at "Indeede") | u320.png | shorten label / allow wrap |
| home-meta | #16 champion's corner | Home@320 | links "Open My Team › / Load Team › / Copy for Showdown / All 113 Events ›" stack with different alignments (two centred, two left) | h320.png | one alignment, one row/column rule |
| home-meta | #22 wording | Winning Teams@320 | still "3/4 checks, missing weak spots spread out" (orphan "out"); "TailRoom" chip still shown | st320.png | "3/4 checks · missing: Weak Spots Spread Out"; rename TailRoom |
| home-meta | #8 night chips | Events@390 night | pixel sample: selected chip (48,47,67) vs unselected (32,31,45) = 1.25:1 (a thin blue edge helps) | night-ev.png | stronger selected fill or filled accent |
| home-meta / b-b-t | tap boxes | @390 | box heights: Winning Teams "Set as Opponent ›" 126x20, "Compare ›" 74x20; Battle "0 of 4 picked" 26px, "Change on My Team ›" 19px; Build "How It Works ›" 20px (touch agent may cover hit areas) | n/a | min-height:44px |
| myteam | #15/#20 Team Sheet | Team Sheet@320-820 | "Most common spread" repeated in every nature cell; "▼ 0 points" arrows on zero; when scrolled at 320 the round ✕ sits on "Whimsicot" and clips it | sheets.png | one caption per row; hide arrow at 0; keep header strip above content |
| myteam | #22/#25/#16 Box | Box@1280 | Your Team row in slot order (Lead, Back, Bench, Bench, Lead, Back); "Too few" in the big-number slot; "Arrange by" bar stops at 490/583 px | box1280v.png | sort Lead/Back/Bench; use "—"; stretch bar |
| myteam | naming #15 | My Team ? bubbles | aria label still "What is Checklist?" | (txt/team.txt) | "What are Team Checks?" |
| compare | #5/Compare@320 | Compare@320 | "Sun · Rain · Tailwind" archetype word runs past the right gutter (x=630 vs col edge 617) | c320.png | smaller font or wrap |

## FIXED (measured or seen)
- Events B-series and ticket mid-word breaks at 360/390/430: 0 overflows, 0 mid-word breaks (ev3 scan).
- This Week B3 Share image: sheet opens, 311x353 image + Light/Dark/Save Image.
- Practice typo "5 of 6": gone from text. Calc "No item" for Mega Charizard Y: now Charizardite Y.
- Blueprint 1100-1280 name vs score: no overlap (bp1100v.png); Spec controls fit at 320/1100.
- Home 320 underdog block: "Somebody's favourite" and Build Around It button fully visible (h320.png).
- Winning Teams sub-tabs 320: "Archetypes" no longer cut. Calc 1440 Terrain tile fine; Speed 1100 sprites no overlap (sp1100.png).
- Compare: "Same on Both" now only same rows (Matchups moved to Also Different); Also Different has Team A / Team B headings (cmp-820 viewed); VS clear of names at 320/820; no mid-word breaks.
- My Team Edit Set: Modest marked with the star (most-run), Team Sheet Modest first: consistent.
- Meta intro "Nov 1" vs footer "Nov 10": no Nov 1 text left. Raw pipe event name fixed (now "RookideeVGC Qualifier"). Winning Teams hero counts now labelled ("90 top-cut teams · 32 from official events · 58 from the last 7 days").
- Naming: no "Open info sheet", "Show less" left in the text dumps. BUT Compare picker still has the button "Use This Team" (naming #3, STILL REAL: should be Load Team).

## UNSURE
- Sneasler 37.7% (Meta/Usage "on teams") vs 35.6% (Home "of ladder teams"): sources now labelled differently; not re-derived.
- Home two main buttons on one screen: Score My Team (top) and Set as Opponent are ~1500px apart at 320, not in one view.
- Build "496 vs 479 games" (ASK Sim), box-in-box, selected = main-button blue, Battle colour questions, page-height limits, and the reaudit polish lists (half-filled rows, desktop empty strips on Track/Compare, Play-by-Play card layout, Battle six-card layout at 1100-1920, damage chip black): NOT measured; they are Sim decisions or pure polish. battle-1440 screenshot looks even.
- Not re-run: Battle with a team entered (Play-by-Play 600-820, Their Six sheet), Practice, Test Run cards, My Team 320-600 8px side overflow (page scrollWidth minus innerWidth is -15 at every width and route, so no sideways scroll seen).
