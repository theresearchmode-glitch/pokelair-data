# Type Chart: Sim's pick "Skyline" (Nov 14)

Sim sent this brief and the 12 pictures beside it (dark left, light right) from the design chat. Sim, same message:
"of course as usual we use our rules and how we operate. the other chat doesn't know how we work, it just helps with
being our designer." So: our rules win where the brief disagrees, and every change is listed for Sim.

Pictures: 01 desktop Garchomp · 02 phone Garchomp · 03 iPad Garchomp · 04 laptop 1280 Garchomp · 05 desktop Mega
Charizard Y · 06 phone Mega Charizard Y · 07 desktop Kingambit · 08 phone Kingambit · 09 desktop Fire only · 10 phone
Fire only · 11 desktop nothing picked · 12 phone nothing picked.

## The idea
The 18 attacking types are 18 towers in a small city; the taller the tower, the harder that type hits. Weak: tall,
red edge. Normal: short, faded. Resists: low, blue edge. Immune: flat plate. Below it, "Attacking with its own types"
is a separate, simpler design: one street per own type, only the types that matter standing on it.

## 0. Stays exactly as built
Tools bar, eyebrow, headline ("What hits Garchomp hard." / "What hits what."), look-up box, team buttons, the
"Showing …, ability …" line, "Or pick one or two types" + Clear, the 18 type buttons, the "Full type chart" fold.
All numbers from the same shared type logic. The Pokémon card at its current size; the big type tiles when only
types are picked. Replaces ONLY the result area.

## 1. Layout
Desktop/laptop: two columns under the type buttons. Left 320: card (or tiles), legend, Ability note, "Sorted from
hits hardest (back) to can't touch it (front)." Right: "Taking hits as [type chips]", the city centred. Below both,
full width: "Attacking with its own types". iPad: same, left column 260. Phone: one column: card, Ability note,
"Taking hits as", city, legend, "Sorted…" line, then the streets.

## 2. The city
All 18 types always; sorted highest multiplier first, ties in the usual type order. Six to a row, three rows; first
six = back row (so a tall tower never stands in front of a shorter one). Isometric 2:1; each type a lot (diamond)
with a tower on it, footprint ~86% of the lot. Wide: DIAMOND layout (along a row: down-right; new row: down-left).
Narrow: SLANTED BLOCK (along a row down-right; new row straight below). Column ≥ 576 wide: diamond, lot up to
160×80 (1440: 160; 1280: 150); else slanted block, lot up to 120×60 (iPad 120; 390 phone 102). Heights at 160 lot:
4× 230, 2× 136, 1× 46, ½ 22, ¼ 10, 0 none; scale with the lot.
Towers: roof in the type colour, left wall darker, right wall darker still, thin floor lines, faint roof light.
Weak: full colour + 3-wide red roof edge; 4× also a soft red glow. Normal: faded ~halfway to the page colour, no edge.
Resists: full colour + 3-wide blue roof edge. Immune: flat plate in ink with a 3-wide outline in the type colour.
Lots: table surface with a thin edge (Damage Calc table tokens).
Labels on every roof: full desktop size two lines (multiplier slanted headline font 20, 4× at 28; name 13); normal
shows name only. Smaller sizes one line "4× Ice" (multiplier 15, name 13). White on coloured roofs, ink on faded,
page colour on immune plates.
Legend (4 lines with a colour square): "Tall, red edge: it is weak here" · "Short and faded: normal damage" ·
"Low, blue edge: it resists" · "Flat plate: immune".

## 3. Attacking with its own types (streets)
Label, then "Everything not standing here takes normal damage." One street per own type: banner in that type's
colour with a ray pattern in a corner, the name in the slanted headline font and small "ATTACKS". Groups with a
caption (multiplier headline font 22 + small capitals): "2× HITS HARD" tall towers · "½ HALF DAMAGE" low blocks ·
"0 NO EFFECT" flat plates (only when not empty; the first two always show, "Nothing" when empty). Front-on blocks with
a little depth and floor lines in the TARGET type's colour, name underneath, on a thin slab. No red/blue edges here.
Sizes: desktop 46 wide, 110 / 30 tall, names 15; phone 40 wide, 84 / 22, names 13, six across.
Desktop two types: side by side under full-width banners. Desktop one type: square banner on the left. iPad: stacked,
banner on the left. Phone: stacked, full-width banner, groups wrap.

## 4. Other states
Types only: type tiles take the card's place. Nothing picked: keep "Pick one or two types above, or look up a
Pokémon." and a quiet city (usual type order, all normal height, faded more, names only; no legend, no streets).
Ability note under the legend (wide) or under the card (phone).

## 5-7. Known problems, not drawn, conflicts (from the designer)
Tight roof labels at small sizes ("½ Fighting"); light-mode faded towers read pastel; card art pokes above on iPad;
Dragon street half empty. Not drawn: under 390 (320 needs its own answer), 700-820, very wide; Ability note; two types
without a Pokémon; empty team. Accessibility: needs a real text version; roof contrast not measured. The 4× glow is a
blur: test scrolling, drop if it costs. No motion; towers not tappable. Sizes and black/white shading must move to our
tokens and scale.

## 8. Words that differ from today
Removed "Everything not listed hits it for normal damage." and the five band headings (the legend carries them).
"2× on / ½× on / No effect" become "2× Hits hard / ½ Half damage / 0 No effect". New: the legend lines, the "Sorted…"
line, "Everything not standing here takes normal damage.", the quiet city when nothing is picked.
