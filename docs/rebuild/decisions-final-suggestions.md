# Final suggestions from the redesign chat: decisions (Nov 10)

Sim, Nov 10: "I want you to be making the executive decision and figure out what's best to implement and what is not ...
your mission is to make this the absolute best most refined product you can." These are the redesign chat's last two
answers (22:51 and 22:53, Nov 10), each with Claude's decision and why. They are part of the rebuild plan.

## My Box second pass
| # | Suggestion | Decision | Why / how |
|---|---|---|---|
| 1 | Wallpaper tinted by the Pokémon standing in each area (sorting by Type becomes bands of colour) | YES | Makes the colour mean something. Tint per row, soft; names must pass contrast (item 6) on every row. |
| 2 | "Arrange by" changes the line under each name | YES, partly | Rating: the displayed score and tier. Type: a small type mark. Newest/Oldest: no line; the box stores order, not dates, and we won't invent dates. |
| 3 | Empty states (empty Box 2 slots, a new visitor's empty box) | YES | Empty slots: faint footprints so the 30 layout holds. Empty box: Darkrai (not Shady Paw, Nov 9), shown to Sim first like every Darkrai spot. |
| 4 | Select mode to remove several at once | YES | "Select" in the box header; tap to mark; "Remove 7" bar; Undo after. Removing must stay fast now that × left the tiles. |
| 5 | Mark on the pager when a box holds team members | YES | Small blue slanted mark on that box's dot. |
| 6 | Measure name contrast on the wallpaper | YES, a rule | Every box, light and dark, at least 4.5:1, checked by the polish check. |

## Across the site
| # | Suggestion | Decision | Why / how |
|---|---|---|---|
| 7 | One source for ratings | YES, a rule | One function gives the shown score everywhere (the Nov 10 bug: set card showed raw 89, Ratings 94; fixed live v149). The chat's 85-vs-92 came partly from its old copy of the site. A behaviour test will check the same Pokémon shows the same number on every page. |
| 8 | Upscaled art for all 345 | YES (already R0) | Needs Sim's PC (Real-ESRGAN anime model, ~1.5 min). Check the edge fringe on Dusk first. |
| 9 | Finish half-drawn screens (info sheet Meta/Rating tabs, dark mode, phone tabs) | YES | These are R2 mock-ups; every page gets light, Dusk, phone and desktop before building. |
| 10 | Long names at five across on phones | YES | One name size for all; long names break at a sensible point or the tile widens; never shrink just one name. |
| 11 | Motion: see it move, don't describe it | YES | R2 builds one moving prototype: the Pokémon lifting out of the box and the summary sliding up. Short, purposeful, off with reduced motion, and must not hurt scrolling on Sim's Windows desktop. |

## The design rules the chat proposed
Adopted as written, they match the rebuild plan: the Pokémon carry the page; colour is borrowed from them (fixed colours
only: logo blue, section marks, verdict colours, never red for a grade); one coloured surface per screen, no boxes in
boxes; NastyPlot's voice in fixed places (logo, slanted Unbounded headlines with the blue second half, ray panel,
slanted plates); the giant number only for the Strength Score; dense where you work, airy where you arrive; readable
first; no player names, real data only, nothing removed.

## Changes to the chat's own earlier ideas
- Drop the first six concepts, the placeholder wordmark and Bricolage: YES. Our logo, Unbounded and Instrument Sans only.
- Colour pools only on the Home hero and the Strength Score: REVERSED by Sim, Nov 10 ("the glow ... please make sure we dont
  lose that"). Glow on every scene with Pokémon, built cheap enough for smooth scrolling (design-system.md 4b).
- Its additions need a yes: decided here. Boxes of 30, drag to team (with a tap way to do the same), "Arrange by": YES,
  Sim chose the box concept. Speed rows on the info sheet ("outspeeds X% of the top 30"): YES, from our real speed data.
- Shorter Home (hero, Strength Score, pairs, team preview, tool list; speed and This Week stay in Meta): YES. Same as R0
  "trim the hero by one layer".

## Not taken, or already settled
- "Shady Paw's spots": replaced by Darkrai on Nov 9; Darkrai's spots stay as CLAUDE.md says (each new one shown to Sim).
- "The player-name question on today's Home": settled; our build shows no player names (checked Nov 10). The chat's
  copy of the site was old.
- "Build one page for real first, My Team": YES, My Team is the first page built in R3 (hardest, and Sim has seen it).
- "Keep the old look available until Sim says": YES, the old build stays as the live page until Sim approves the switch,
  and the rebuild ships to the same artifact so saved teams carry over (docs/rebuild/saved-data.md).
