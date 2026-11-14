# Info sheet redesign: how it gets built (Claude's plan, Fri Nov 13, 7:39 PM Eastern; brief: BRIEF.md)

Code today: app/src/v2/pages/monsheet.js `V2.monHtml` builds the header (`head`: .ms-art sprite 240, .ms-hd = rate, name, types,
nums, acts) and the forms strip (`fstrip`); the tabs follow. Every number comes from today's shared functions.
CORRECTION (7:45 PM): experiments/same-info.mjs checks TODAY's site (lairSheet), not the new sheet, so it proves nothing here.
The check for this work: the new sheet's text for every Pokémon, before vs after, outside the stage, must be identical
(the stage only adds the base stats, from the same p.st the Base Stats section uses).

## Steps (one at a time; each: build, polish check on the sheet, c13 heights, sheet text before/after, pictures with real sprites
## beside Sim's mock-ups, light + dark; nothing to the Preview without Sim's go)
1. Stage (phone first): a new `.ms-stage` replaces `.ms-art` at the top of the sheet.
   - Fixed stage colours as NEW tokens in tokens.css (same in light and dark: it is a lit place), e.g. --stage-bg, --stage-floor,
     --stage-line, --stage-ink, --stage-ink-2; the Pokémon's own colour (--cp) and its two type colours from the type tokens.
   - Crowd lights: soft radial gradients (no filter: blur on moving layers; no will-change: Sim's scroll rule).
   - Floor with perspective lines (CSS gradients); the Pokémon left on its usual floor glow (V2.mon sel).
   - Screen right: inline SVG web (HP, Attack, Defense, Speed, Sp. Def, Sp. Atk clockwise from the top; 160 = outer ring,
     clamp above), numbers + names at the corners, the highest stat larger and white with a bright point; tilted toward the
     Pokémon; cables; glow frame in --cp; light spill on the floor.
   - Type strip (two type colours; one colour for one type) as the join.
   - Screen reader: the web is aria-hidden; the stage gets one label ("Base stats: HP 108, Attack 130, ..."), since the Info
     tab's Base Stats section repeats them in full.
   - Close button: round, on the stage's top-right.
   - Sizes on our scale: phone stage ~ 332 tall (4 px grid), Pokémon ~164, screen ~228 x 232; 320 wide: both ~80%.
2. Headline block: name + types left, rating/tier/rank right (rating on the display scale: 56/48 in the mock-up -> nearest
   approved display size, to check in tokens.css); three numbers in even columns with thin --ar-rule dividers; "Too few" / words
   instead of a lone dash (rule 10.1, Box Q3 B); buttons at equal widths; forms as one row of tiles with the slanted bar.
3. Desktop "Side Stage": left column ~480 (stage + headline), right = tabs + content in two balanced columns; left column
   sticky, fills the sheet's height (stage grows), not clipped under ~900 tall (scrolls with the page there).
4. iPad upright: stage full width ~352, pair centred; headline in two even halves; content in two columns.
5. Brief section 7 checks: Add to My Team state, a stat > 160, > 3 forms, keyboard + screen reader, scroll smoothness on
   Windows (mouse wheel), 1366 x 768 with forms.

Words kept as today unless Sim says otherwise: "Speed at level 50" (mock-up split it), "Forms · tap one to open it".
