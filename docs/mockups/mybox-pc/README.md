# My Box: "The PC" design direction

Status: **design direction chosen by Sim (Nov 23, 2026). Not built yet, not approved for the live site.**
These are mock-ups (pictures of the page), made to give the real build a target. Normal rules apply:
Preview before live, one site item at a time, and Sim's review before anything counts as done.

## Files

| File | What it is |
|---|---|
| `images/pc-desk-night.png` | Desktop, 1440 px wide, night theme (2x) |
| `images/pc-desk-day.png` | Desktop, 1440 px wide, day theme (2x) |
| `images/pc-phone-night.png` | Phone, 390 px wide, night theme (3x) |
| `images/pc-phone-day.png` | Phone, 390 px wide, day theme (3x) |
| `mockup-source.html` | The HTML/CSS the pictures were rendered from. Opens on its own in a browser. URL options: `?t=night` or `?t=day`, add `&v=phone` for the phone layout. View the phone layout in a 390 px window. |
| `assets/` | The fonts and the 32 sprites the source needs (copied from the NastyPlot Full Redesign artifact) |

The source HTML is a **mock-up**, not production code. Rebuild the page inside the real app (app/src, the redesign's
tokens.css) rather than pasting this in. Use it for exact sizes, colours and layering.

## Where it came from

- Starting point: the **My Box** section of the shared artifact "NastyPlot Full Redesign"
  (https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf, page `foundation.html#box`). Sim's words: one of her favourite sections
  "because of how well it acts like a real Pokémon box from endgame and how clean it looks", but it needed to fit the
  site's theme better.
- Three directions were tried (The Plate, The PC, The Spotlight). **Sim picked The PC.** It was then refined to this version.
- It is built only from the redesign's own visual language:
  - slanted parallelogram shapes (clip-path)
  - Unbounded slanted headlines with the sticker outline on dark backgrounds, and solid ink on the day page
  - Instrument Sans for body text
  - the striped blue stage
  - the logo's pink and blue
  - the type colours and tier colours from tokens.css

## The layout (desktop, 1440 px)

Page margins 96 px. Under the page heading, the body is **one grid with three columns**: 304 px | flexible | 316 px,
with 28 px gaps. It has three rows: a 56 px header row, the body, and an 84 px footer row. All three columns start and
end on the same lines. This was deliberate (Sim cares about symmetry and no empty strips); keep it.

1. **Page heading**
   - The kicker "My Team · The Pokémon you own", then "My **Box**" in Unbounded at 80 px.
   - A one-line explanation underneath: "Build for Me and Suggestions pick from these when set to 'My Box'."
   - On the right, three counts: **36** Pokémon (sample) · **2** Boxes · **6** On your team.
   - The third count carries the "on your team" corner flag, so it doubles as the key for the flags in the box.
2. **Left column: Your Six**
   - The header row reads "Your Six" and "Open My Team ›".
   - Six slanted rows stretch to fill the column. Each row has:
     - the sprite, the name ("MEGA" small label above when it's a Mega form)
     - the item · Ability line from the team's real set
     - the rating number and a tier chip
     - a left edge and background tint in the Pokémon's first type colour
   - Footer row: the team's Strength Score card (93, "Top tier", "Strength Score · Sun Tailwind (sample)").
3. **Middle column: the box**
   - Header row: a slanted bar with pink ◀ ▶ arrows, "Box 1", "30 of 30", and two small skewed dots showing which box you're on.
     The bar is black in day and white in night.
   - Body: the blue wallpaper (striped blue stage gradient, light from top-right, halftone dots fading in from bottom-left).
     It holds a **6 × 5 grid (30 slots, like the game's box)**. Each slot has:
     - a thin slanted outline
     - a soft floor shadow and the sprite
     - the name in 12 px white
     - a white corner flag when the Pokémon is on your team
   - Selected slot: white fill, 3 px yellow (#FFC71F) slanted outline, the sprite lifted 6 px, a blue floor glow,
     and the **cursor** above it: a pink-over-blue double chevron taken from the "raise" arrow in the homepage headline.
   - Footer row:
     - "Arrange by" (small caps label) with A–Z / Type / Newest / Oldest / Rating
     - on the right, "+ Add a Pokémon" (solid) and "Box Link" (light) buttons
4. **Right column: the card** (spans all three rows)
   - A trading-card style panel with a holo foil edge (gradient yellow → pink → purple → blue → light blue) and cut corners.
   - The type-colour strip at the top reads "Box 1 · Slot 2" and "Not on your team".
   - Below the strip:
     - the art, with a faint outlined rating number behind it
     - the name, the type chips
     - the big rating (90) with an S tier chip and "Rating among 345 Pokémon"
     - Usage / Win rate / Speed, and the data source line ("Online tournaments, Nov 17")
   - The buttons are **Swap into My Team** (main) and **Build Around It**, with links "Pokémon Page ›" and "Remove from Box".
   - The mock-up shows Archaludon, because it is NOT on the team. Showing "Swap into My Team" for a Pokémon already on the
     team would be wrong; the real build must handle that state (e.g. Garchomp: show "On your team", no swap).

## Phone (390 px)

From top to bottom:
1. The heading and the three counts.
2. Your Six as a strip of six tiles, with "93 Top tier" in its header.
3. The box bar.
4. The full 6 × 5 box. It shows sprites only, with no names, so it fits.
5. Full-width Arrange by buttons.
6. The card, with the buttons stacked.
7. "+ Add a Pokémon" and "Box Link" at the bottom.

Labels match desktop exactly ("Swap into My Team" everywhere).

## Data shown (all real)

Every number comes from the Preview's saved data snapshot (Nov 17) inside the Full Redesign artifact, read off the live page:
- the box contents in A–Z order
- each Pokémon's rating and tier, types, usage, win rate and base Speed
- the sample team "Sun Tailwind" with its Strength Score of 93
- each team member's item and Ability

Nothing was invented. In the real build all of this comes from the app's data, not from the mock-up.

## New things this design adds (need Sim's OK under "finish what we have first")

The current My Box does not have these. Each one is a change to agree with Sim before building:
- the 6 × 5 grid (the current page shows 5 across)
- the pink/blue chevron cursor on the selected slot
- slot numbers ("Box 1 · Slot 2")
- the trading-card panel with the foil edge
- item · Ability shown in Your Six on this page
- the box-position dots in the box bar

Everything else already exists on the current page, with the same labels:
- Add a Pokémon, Copy / Open a Box Link, Reset Box
- Arrange by
- Pokémon Page, Build Around It, Swap into My Team, Remove from Box
- the forms list
- the "on your team" marker

Note: **Reset Box** and the **Forms** list are not shown in this mock-up. They exist today and must not be dropped
(Sim's rule: never remove functionality). Place them in the real build: Forms in the card, Reset Box beside Box Link.

## Open items (not designed yet)

- **Every window size:** only 1440 px and 390 px were designed. Tablet, narrow desktop, odd window shapes and live resizing still
  need a layout. Around ~1100 px the three columns must become two (e.g. the card moves under the box or Your Six becomes a strip).
- **Large art:** the redesign only has high-resolution art for Garchomp's forms, so Archaludon looks soft on the card. The build needs large art
  for every Pokémon, or a card layout sized for the sprites.
- **Phone names:** the phone box hides names under sprites (they show in the card when tapped). Check with Sim.
- **Performance:** keep Sim's rules: no `will-change` layers on filtered sprites, and sprite glow off on mouse screens except feature sprites.
- **Darkrai:** Darkrai does not belong on this page (it never sits beside grades, ratings or data).
