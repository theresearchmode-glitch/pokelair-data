# My Box: "The PC" build brief (HH, Mon Nov 23)

Sim chose the design (docs/mockups/mybox-pc/: README.md, images/, mockup-source.html + assets/) and approved, at 7:48 AM,
the six new items: the 6 × 5 grid on phones too, the pink/blue chevron cursor, slot numbers ("Box 1 · Slot 2"), the foil
trading card, item · Ability in Your Six, and the box dots. Design authority (HH) runs to 6 PM. Sim sees pictures of every step.

## Rules
- CLAUDE.md first: no generic AI design, the kit only (kit.js / kit tokens), the word list, studio polish, type scale
  13/15/16/17/20/22/24/26/28/34, 4px grid, NOTHING under 13px (the mock-up's 11-12px labels become 13px), slanted shapes.
- Never remove functionality. Today's page (app/src/v2/pages/box.js, CSS .bx-* in pages.css) has: sort (A–Z/Type/Newest/
  Oldest/Rating), page arrows (30 per box), pick a tile (summary panel; phones: bottom sheet), Forms row in the summary, Add a
  Pokémon (search), Remove with Undo, Reset Box (asks twice, Undo), Box Link copy/open, "Add to my box" from a link, sync line,
  sample-box note, empty box (featured underdog, Add buttons), Add/Swap Into My Team, Info Sheet / Pokémon Page, Build Around It.
  All stay. Forms go in the card; Reset Box beside Box Link.
- "Swap into My Team" never shows for a Pokémon already on the team: the card's strip reads "On your team", the main button
  becomes Build Around It. A full team says "Swap into My Team"; a team with room says "Add to My Team" (today's V2.addState).
- Real data only: ratings/tiers (rating(), lTier, RS), Usage / Win rate (lairHead H.hU, H.hW, with the "Too few" rule),
  base Speed, the data source line, the team's real sets (item · Ability) and its Strength Score + band word.
- Large art: app/src/v2/art/*.webp is 384px for every Pokémon (V2.mon with a large iw uses it); the card uses that.
- Performance: no will-change on filtered sprites; glow off on mouse screens except feature sprites (the card art).
- No Darkrai. Search must still find My Box.

## Layout
- 1440 (and >= ~1180): one grid, 304px | minmax(0,1fr) | 316px, gaps 28px; rows 56px header / body / 84px footer; every column
  starts and ends on the same lines. Left: Your Six (six slanted rows tinted with the first type, sprite, name, MEGA label,
  item · Ability, rating + tier chip) + Strength Score card. Middle: box bar (pink arrows, "Box N", "30 of 30", dots) / 6×5 on
  the blue wallpaper / Arrange by + Add a Pokémon + Box Link + Reset Box. Right: the foil card spanning all rows.
- ~700-1179: two columns. Your Six becomes a strip of six tiles (with "Strength Score 93 Top tier" in its header) across the
  top; then box (left) and card (right). Find the switch points by measuring; no squeezed or empty columns at odd widths.
- < 700: phone (images/pc-phone-*.png): heading + counts, Your Six strip, box bar, 6×5 sprites only (no names), Arrange by full
  width, the card inline (no bottom sheet), Add / Box Link / Reset Box.
- Keyboard: arrow keys move the cursor in the box; Enter picks; focus visible; aria labels say name, slot, on your team.
- Day and night themes as the images.

## Checks (every step)
- `node app/build.mjs --v2 --preview-data --art=../src/v2/art/` ("guard: clean"); frozen data `git checkout
  0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/` (never commit out/).
- Behaviour A-team (BOX-01..07 and the rest; art-only build `--v2 --art=../src/v2/art/`, `PAGE=app/dist/v2.html ADAPTER=v2 node
  app/test/behaviour/run.mjs A-team`): update the adapter (app/test/behaviour/adapters/v2*.mjs) only where selectors moved, never
  the test's meaning. 139 pass expected.
- qcheck `ROUTES=box`, tap-size, polish-check VIEWS=box (320-2560), v2-minors groups/main1/main2, any test that greps .bx-.
- Lengths: before (390 2402, 820 2038, 1024 1987, 1280 1858, 1440 1440 px at 900 tall). 1440 must stay within one screen
  where it can (cap 3 screens); phones no longer than 2402 unless Sim OKs (the inline card replaces the bottom sheet: measure
  and report).
- Pictures: 1440, 1280, 1100, 1024, 820, 390, 320, day and night, plus the on-your-team card state, in docs/rebuild/pics/nov23/mybox/.
