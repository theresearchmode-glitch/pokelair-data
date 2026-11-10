# My Box: the chosen concept (Sim, Nov 10)

Sim, Nov 10: "that's the concept that I want to go with for the my box." Drawn in the retired "NastyPlot redesign concept"
chat at 22:42-22:45 on Nov 10, after Sim asked how My Box would look in the redesign, "inspired by an actual Pokémon box
from endgame", blended into the light, atmospheric feel. Everything that chat said and made is copied here; nothing
depends on it any more.

Files: mybox-concept.jpeg (the render Sim saw, desktop 1440 wide), box.tpl.html + box.cjs (its source; box.cjs fills the
template with the site's own sample box of 36 and the real ratings), current-box-then.jpeg (today's page as that chat
captured it, for comparison).

## The design (from the game)
- Boxes of 30: six across, five down. 36 Pokémon = Box 1 (30) + Box 2 (6). Left/right arrows and the box name on top
  ("Box 1", "30 of 36 · A to S"), slanted page dots underneath.
- Wallpaper per box, mixed from the colours of the Pokémon inside it (one soft colour per corner), with the ray motif laid
  softly over it. Changes as Pokémon are added or removed.
- Cursor: the picked Pokémon lifts onto a white tile with a shadow, and its summary opens on the right (where the game
  shows one).
- Party beside the box: "Your team" row of six under the box (with Lead / Back / Bench), drag between box and team to swap.
- Marks: a small blue slanted mark on every Pokémon on your team; the key "On your team" sits in the left column.

## What keeps it light
- No frames or cells: each Pokémon stands on the wallpaper with its own soft shadow.
- The box is the only coloured surface; around it, open space, type and thin rules.
- Names visible under every Pokémon (the games don't; Sim wants clear labels).

## Layout (desktop): three columns
- Left: eyebrow "My team · The Pokémon you own", big slanted "My Box", "36 Pokémon · 2 boxes", the line about Build for Me
  and suggestions picking from the box, Add a Pokémon (slanted box with +), "Arrange by" (A–Z, Type, Newest, Oldest,
  Rating), Copy box link / Open a box link / Reset box, the saved-where line, the "On your team" key.
- Middle: the box, then "Your team".
- Right: the selected Pokémon on a tilted ray panel in its own colours, "Rated 92 · S tier" plate, name, type chips,
  "On your team", three numbers (usage % of teams, win rate, base Speed), Open info sheet (filled slanted button),
  Build around it, Swap into my team, Remove from box.
- Phone (described, not drawn): box full width, summary slides up from the bottom when you tap a Pokémon.

## Changes from today's page (as that chat stated them)
- Remove moved from an × on every tile to the selected Pokémon's panel (one extra tap).
- New: flipping between boxes, drag to team, the summary panel with Open info sheet / Build around it / Swap into my team.

## What the rebuild must still settle (main chat review)
- Agreed rules it breaks, to fix when building: the sort choices, type labels and "On your team" tag are rounded pills
  (R0: one slanted chip style, no rounded pills). Dark mode (Dusk) not drawn. Phone not drawn.
- Every feature My Box has today must survive: check against docs/rebuild/inventory/A-team.md (My Box entries) and the
  saved-data map (box order, sorting choice boxV, excluded list, box link #box=).
- Drag needs a tap alternative (phones, keyboard) and must not fight scrolling.
- Wallpaper colours must keep names readable (contrast check on every box, light and dark).
- More than 60 Pokémon: more boxes; the arrows, dots and "Box N" must scale. An empty box and a box of 1 need their own look.
