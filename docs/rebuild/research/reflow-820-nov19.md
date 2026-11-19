# My Team at tablet widths: Remove re-flows the six (design options, for Sim)

Written Wed Nov 18, 8:49 PM Eastern by the clock (now.sh), helper on branch claude/design6 at 127c3d6d. Design option work only:
no committed code changed. Pictures: docs/rebuild/pics/nov19/reflow-*.png (label printed on each; "Q?" is a placeholder).

## The issue (checked)
At 700-1099 wide a full six shows Lead / Back / Bench (two Cards across per group); with fewer than six it shows "Your Six" in the
player's order, three across (Sim, Nov 15; app/src/v2/pages/six.js `V2.handHtml`, `mh-build`). Remove takes the team from six to
five, so the layout switches and every Card moves. app/test/v2-rmjump.mjs at 820 x 900 on this commit: "pass 820 (the six re-flows
on Remove): the Add spot ends up tappable with the focus (moved -267px, top 93)".

## How the options were made and measured (checked: these runs)
- Mock-up: six.js patched in a scratch build only (a `?reflow=A|B|C` switch), then the source restored (`git status` clean).
  The pictures use the same build. C's Add Card height was set to the Cards' height with page CSS in the test (a real build needs a CSS rule).
- Run: Chromium build 1148 (CI's browser), `--v2 --preview-data` build, sample team, the same steps as v2-rmjump: tap a Card, scroll
  its panel's Remove to the middle of the screen, press Remove, read 2.5 s later.
- "Page scrolled" = scrollY after minus before. "Add vs Card" = where the new Add spot's top lands on screen minus where the removed
  Card's top was. "On screen" = px of the Add spot visible below the sticky header (44 needed to tap).
- Every option: focus on the Add spot, 0 page errors.
- Found while measuring (checked): with five of six the block above the six (score, sample note, "Update Team") is 98-99px taller
  (378 -> 477px), so any option that holds the six still scrolls +98px; nothing on screen moves for that. And Chromium's scroll
  anchoring moves the page by itself on the redraw (892 -> 1046 in one trace, +154). Safari's behaviour here: not checked.
- At 820 the editing panel does not shut on Remove (only phones shut it); it moves to the next Card. Same in every option.

## Results, Remove on Whimsicott (the picture case)
| Option | 820 x 900 page / Add vs Card / on screen | 820 x 1180 page / Add vs Card / on screen | Cards move? |
|---|---|---|---|
| 0 no change | -267 / +58 / 220 | -127 / -82 / 220 | all re-flow |
| A hold the six's top | +98 / -307 / 0 (hidden) | +98 / -307 / 12 (hidden) | all re-flow |
| B Add spot where the Card was | -267 / +58 / 220 | -209 / 0 / 220 | all re-flow |
| C keep roles, Add Card in place | +98 / +1 / 119 of 160* | +98 / +1 / 220 | none |

## All six Cards at 820 x 900 (Add vs removed Card's place; on-screen px; page scroll)
| Card removed | 0 no change | A | B | C |
|---|---|---|---|---|
| Mega Charizard Y (Lead) | -55 / 123 / +154 | +1 / 179 / +98 | +59 / 220 / +40 | +1 / 119* / +98 |
| Garchomp (Lead) | +364 / 220 / +154 | +420 / 220 / +98 | +58 / 220 / +460 | +1 / 119* / +98 |
| Whimsicott (Back) | +58 / 220 / -267 | -307 / hidden / +98 | +58 / 220 / -267 | +1 / 119* / +98 |
| Sneasler (Back) | +57 / 220 / +154 | +113 / 220 / +98 | +58 / 220 / +153 | 0 / 119* / +304 |
| Basculegion (Bench) | +59 / 220 / -575 | -614 / hidden / +98 | +59 / 220 / -575 | +1 / 119* / +98 |
| Kingambit (Bench) | +59 / 220 / -155 | -194 / hidden / +98 | +59 / 220 / -155 | 0 / 118* / +304 |

\* 900 run before the Add Card was given the Cards' height (160px tall then); positions are unaffected. At 900 the removed Card's top
was at 34px, under the 77px header, so B and today both land the Add spot just below the header (+58): B only differs from today when
the removed Card was fully on screen (1180 picture: B 0px, today -82px).

1180 rows for all Cards: see the end of this file.

## Reading of the options (my view; not tested with players)
- 0 no change: the Add spot is always reachable, but every Card jumps and the page scrolls -575 to +154px depending on the Card.
- A: fails the usability rule. With the panel open the six's top is far above the screen, so holding it still leaves the Add spot
  hidden for 3 of 6 Cards at 900 (Whimsicott, Basculegion, Kingambit). Not recommended.
- B: the Add spot lands where the removed Card was (0px at 1180) and is always reachable, but every other Card still re-flows from
  2 across in groups to 3 across, so the page still visibly changes under the player.
- C: nothing moves (Add spot +0/+1px, every other Card stays). Lead / Back / Bench stay on screen with an Add Card until the player
  adds (back to a full six) or leaves My Team. This CHANGES Sim's Nov 15 rule ("roles are worked out once all six are in"): for that
  moment roles show with five. Rows stay even (the Add Card is in the removed Card's place, so no lone tile). Open points for C,
  not decided: the Add Card spans the Card + set width (pictured) vs the Card width only; what the group's note says with a gap;
  whether a second Remove keeps the roles (mock: yes, while every remaining Pokémon was in the remembered groups).

## Recommendation
C. Why: it is the only option where nothing on screen moves and the Add spot is exactly where the player was looking; A hides it.
If Sim wants to keep her Nov 15 rule unchanged, B is the fallback (Add spot in place, Cards still re-flow).

## Not checked / unsure
- Safari / iPad: not run (WebKit has different scroll anchoring); numbers are Chromium only.
- Other widths in 700-1099 (only 820 measured); 700-799 has one Card per row in groups (pages.css), so movement will differ.
- Night mode pictures: not taken.
- C's real build: not built; accessibility labels ("spot N" vs role) and the Game Plan line for a five-team in role layout not worked out.

## All six Cards at 820 x 1180 (iPad Air portrait; Add vs removed Card's place / on-screen px / page scroll)
| Card removed | 0 no change | A | B | C |
|---|---|---|---|---|
| Mega Charizard Y (Lead) | +181 / 220 / -82 | +1 / 220 / +98 | +1 / 220 / +98 | +1 / all* / +98 |
| Garchomp (Lead) | +600 / 220 / -82 | +420 / 220 / +98 | 0 / 220 / +518 | +1 / all* / +98 |
| Whimsicott (Back) | -82 / 220 / -127 | -307 / 12, hidden / +98 | 0 / 220 / -209 | +1 / 220 / +98 |
| Sneasler (Back) | +57 / 220 / +154 | +113 / 220 / +98 | +1 / 220 / +210 | 0 / all* / +304 |
| Basculegion (Bench) | -81 / 220 / -435 | -614 / hidden / +98 | +1 / 220 / -517 | +1 / all* / +98 |
| Kingambit (Bench) | -81 / 220 / -15 | -194 / 124 / +98 | +1 / 220 / -97 | 0 / all* / +304 |

\* run with the shorter (148px) Add Card; positions unaffected. Summary at 1180: B lands the Add spot 0-1px from the removed Card for
all six Cards; C 0-1px with no other Card moving; A hides it for 2 of 6 (Whimsicott, Basculegion); today misses by -82 to +600px.
