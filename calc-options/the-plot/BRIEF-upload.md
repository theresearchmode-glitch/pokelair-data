# Damage Calc "The Plot": build brief

Sim approved this direction on Sat Nov 21, 2026, 5:12 AM ET ("this is great"). It replaces the Arena as the Damage Calc's design. Show Sim screenshots before anything goes live.

## The pictures (look at these first)
- the-plot-4-desktop-light.png (1440 wide)
- the-plot-4-phone-light.png (390 wide)
- source/plot4.mjs: the mock-up's full HTML and CSS. Port from it; don't redraw.

## The idea
A nasty plot is a scheme, so the Damage Calc is the board where you plot the hit.

## The vocabulary: three things only
Sim rejected a version with seven kinds of object ("clashing… really confusing") and a version where everything was a sticky note ("killed all of the character"). Do not add tape, pins, string, hanging tags, stamps, folders, torn paper or cards.

1. **Photos:** the two Pokémon.
   - White-framed photos, tilted. "the muscle" is the attacker (blue tint); "the target" is the defender (pink tint, circled in marker).
   - Each photo is the button that opens "Choose the attacker / defender" (keep Q46 A).
2. **Marker:**
   - The hit is a hand-drawn black arrow from attacker to target.
   - The damage is written big under the arrow, in the move's type colour.
   - A red marker circle always means "chosen": the move, the sky (weather), the ground (terrain), each "this turn" switch that is on, and the verdict.
   - Moves are highlighter swipes in their type's colour (rough-edged blocks, white words). "All moves" is a dashed outline.
   - Weather and terrain are icons and words written straight on the board, in each one's own colour.
3. **Sticky notes:** only the two sets ("the muscle's kit" blue, "the target's kit" pink): Item, Ability, Nature, Points, Stage − / +.

Other parts:
- **Background:** the graph-paper board (cream paper, fine blue grid with a heavier line every 120px). Sim tried solid blue and black and rejected both.
- **KO Board:** the site's own dark slanted bar.
- **Links:** plain underlined links.
- **Swap:** a drawn double arrow, "swap them".

## Numbers: real HP, not percentages
Sim, Nov 21: "i want to use real numbers instead of percentages anyway."
- The answer reads "Heat Wave does 137–161 damage. Sneasler has 155 HP." Then "Faints 1 time in 4" and "hangs on with 0–18 HP the other three".
- **The mock's numbers are ROUGH stand-ins.** The build must use the engine's real damage rolls and the defender's real HP.
- "Faints 1 time in 4", "faints 1 in 4", "always faints", "3+ hits" and "hangs on" are new wording. Confirm them with Sim against the word list before they ship.

## Colour rule
Sim: "colors should mean something." Every colour here has a meaning:
- Blue = attacker; pink = defender (photos and notes).
- Type colours = moves, and the damage number.
- Red marker = chosen.
- Weather and terrain colours = their own.

## Every feature kept (none may be dropped)
- Attacker and defender pickers; swap.
- The damage and the verdict.
- 3 usual moves plus All moves.
- Weather (5) and terrain (5).
- The 5 switches: Hits both foes, Screen up, Helping Hand, Friend Guard, Critical hit.
- Both sets with stage steps.
- KO Board.
- How the Calc Works, Put this hit on the table, Notes on this hit.

## Layout
- **Desktop (1000+):** 4 columns, 280 / 1fr / 1fr / 280.
  - Row 1: title, swap.
  - Row 2: attacker photo, the answer (2 columns), defender photo.
  - Rows 3–4: attacker's note on the left; the moves, then sky and ground side by side, in the middle; defender's note on the right.
  - Row 5: KO Board, this turn, links.
- **Phone:** the two photos side by side, then the answer right under them (the verdict ends at 584px at 390 wide). Then moves 2×2, sky, ground, this turn, the two notes side by side, KO Board, links.

## Checked in the mock (measured at 1440 and 390 wide)
- 0 taps under 44px, 0 cut-off words, no sideways scroll.
- Length: 1.11 screens on desktop, 2.05 on phone.

## Known flaws to fix in the build
1. The red "chosen" circle is hard to see on a red (Fire) move swipe. Give the circle a white edge, or use another mark for chosen on moves.
2. The unchosen "this turn" options are light grey; check their contrast.
3. The mock is light mode only. Dark mode needs a design (Sim rejected a black wall), so show Sim options.
4. Only one state is drawn (Sun, no terrain, a hit that can knock out). Still to draw: no move picked, immune, no result, and long names (Mega names, "Stomping Tantrum").
5. The tilts and the hand-drawn marks will trip polish-check's alignment rules. They are deliberate; agree the exceptions with Sim.

## Before showing Sim
- Check 320–2560 wide with experiments/polish-check.mjs (VIEWS=calc).
- Run every test.yml job. The calc's own tests will need new selectors.
- Send Sim screenshots. Nothing goes live without his OK.
