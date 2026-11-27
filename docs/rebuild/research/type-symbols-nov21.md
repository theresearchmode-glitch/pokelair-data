# Type symbols: where they fit, and which ones we may use (helper hS, Sat Nov 21, 2026, 3:13 PM)

Look-only research for Sim's ask (Nov 21): "we have not used pokemon's type symbols at all on the website ... never without a label".
No site code, tests or tokens were changed. Nothing was downloaded into the repo.
Time from `bash docs/rebuild/now.sh` (3:11 PM at the start, 3:13 PM when the write-up began).

**Sim's rule, for every spot below: a type symbol never appears alone. Its type word is always beside it.**

## 1. The repo has no type symbols today (checked)

What I ran (from the repo root):

```
find . \( -path '*/node_modules' -o -path ./.git -o -path ./.claude -o -path ./docs/rebuild/pics \) -prune -o -type f \
  \( -iname '*.svg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.jpg' \) -print \
  | grep -iE '/(normal|fire|water|grass|electric|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)[._-]|type-?icon|typeicon|types?/'
grep -rnoE '<svg[^>]*class="[^"]*type' app/src
grep -rnE 'typeIcon|type-icon|typeSym|typeGlyph' app/src
```

Result: 23 file hits, all of them Type Chart mock-up screenshots in docs/rebuild/mocks/types/ (T1-T3, U1-U4, TA, TB, skyline...).
Zero hits outside that folder. Both greps over app/src: no output.
Every .svg in the repo is a NastyPlot logo, favicon, the old Shady Paw file or the cohesion mock-up logo.
Plain meaning: the site has no type symbols. Types are shown only as words on their type colour.

## 2. Every place a type is shown today (checked by reading the code)

How types are drawn now (checked, app/src/v2):
- `V2.typeChip` (shell.js:18): the type word on its colour (`.np-type`, a slanted chip, components.css:22). Used about 30 times.
- `V2.kMove` (kit.js:57): Sim's new move ticket (chosen Nov 21, 2:38 PM). The tag `.k-mt` shows the type word on its colour. Today used only on the Pokémon page (pokemon.js:54) and the info sheet (monsheet.js:33).
- `--ty-*` colours (tokens.css:75) also paint backgrounds with no word: Pokémon floors, spotlight plates, event tickets, archetype scenes.

| Page / file + function | What it shows now | Would symbol + word help? | Where it would go |
|---|---|---|---|
| Type Chart, types.js `V2.pages.types.draw` (picks :39, tiles :48, groups `grp` :54, "attacks" banners :55) | 18 pick buttons (word only), big type tiles, the skyline groups (`.blk` word under a tower), "Fire attacks" banners | Yes, most of all. The page IS types; 18 words are slow to scan; symbols add the most flare here | In each pick button before the word; big symbol in the `tc-tile`; small symbol in each `.blk` label and each banner |
| Type Chart grid, types.js `V2.tcGrid` :19-20 | 18x18 table, row headers are type words | Partly. Row headers only; column headers are already cramped | Row header, before the word, desktop only |
| Pokémon page, pokemon.js `V2.pkTypes` :78 and card :18 | "What beats it": 4x weak / 2x weak / Resists / Immune boxes of type chips; the Pokémon's own types | Yes. Weakness lists are read by shape; symbols speed it up | Inside each chip (`typeChip`) |
| Info sheet, monsheet.js :25 (types), :42 (weak/resist lines) | Same as above, in the sheet | Yes, same reason | Inside each chip |
| Move ticket, kit.js `V2.kMove` :57 | Tag `.k-mt` = type word on colour | Yes. It is the one move look Sim wants everywhere, so it carries the symbol to every move | Small symbol before the word in `.k-mt` |
| My Team Edit Set, team.js :208 (head), :210-212 ("Weak to" / "Resists" with 4x, ¼x marks) | Chips + multiplier | Yes, quick read of weak spots | Inside each chip |
| My Team slot, six.js :17, :18, :89; team-frame.js :25 | The Pokémon's two types | Some flare, small reading gain | Inside each chip |
| My Team moves, six.js :14, :42, :91; team-frame.js :12, :21; Team Sheet team.js :78 | Move names on their type colour, **no type word** (colour alone) | Not as extra chips (too crowded). Fix by moving these to `V2.kMove` when the reskin reaches them; the ticket then brings word + symbol | Via `kMove` only |
| Damage Calc "Plot the hit", calc-plot.js `V2.pcAnswer` :45-51 | Answer line: "**Fire** Flamethrower does" (type word `pc-ty` on colour) | Yes, flare in the page's big answer | Symbol before the word in `pc-ty` |
| Damage Calc moves, calc-plot.js `V2.pcMove` :54-56; calc.js `arnMv` :282, `arnMvRow` :298 | Move buttons in type colour; type word in small text ("Fire · verdict") | Small gain; buttons are already full | Optional tiny symbol in the `<small>` line; low priority |
| Compare, compare.js `weak` / `unres` :34-35 | "Weak spots" / "Not resisted": up to 4 chips + "+n" | Yes, side-by-side compare is read by shape | Inside each chip |
| Matchups, matchups.js :78 | Each top threat's types as chips | Some gain | Inside each chip |
| Suggestions, sugs.js :148, :227, :230, :309, :328 | Chips in suggestion rows and the type table | Some gain; table rows are dense | Chips yes; the defence table (`ty2-tb`) no |
| Ratings, meta.js :24 (rows), :62 (spotlight), :84 (type filter buttons, word only) | Two chips per row, ~300 rows; filter of 18 type buttons | Filter buttons: yes (same as Type Chart picks). Rows: no (see below) | Filter buttons only, plus the spotlight |
| Popular Sets spotlight sets.js :22; Usage spotlight usage.js :67 | Chips under the big name | Flare, small | Inside each chip |
| Home Type Chart plate, stampede-tools.js :63 (desktop flags) | 18 flags in type colours, each with its word | Yes, flare on Home; the words are already there | Symbol on each flag beside its word |
| Home phone chip, stampede-tools.js :103 | 6 colour squares with no words (decoration, aria-hidden) | Only if each square also gets its word, which will not fit. **Keep as colour squares** (Sim's rule) | No |
| Practice practice.js :5, Box box.js :48, search sheet shell.js :213, Guide guide.js :33 | Chips | Some gain, comes free with `typeChip` | Inside each chip |
| Speed Tiers, speed.js | No types shown | No | - |

Note (checked, by the grep above): about 30 of these spots draw through the one helper `V2.typeChip`. One change there reaches all of them at once. That is a design change for Sim's yes with pictures first; it also changes chip widths, so pages may grow on phones (not measured).

### Top 6, best first

1. **Type Chart page** (types.js): the whole page is about types, so symbols add the most flare and make the 18 picks faster to find.
2. **Pokémon page + info sheet "What beats it"** (pokemon.js `V2.pkTypes`, monsheet.js :42): weakness lists are scanned by shape; a symbol is quicker than reading 6 words.
3. **The move ticket** (kit.js `V2.kMove`, `.k-mt`): it is going everywhere moves appear, so one small symbol there marks every move's type site-wide.
4. **My Team Edit Set "Weak to / Resists"** (team.js :205-212): the player's own weak spots, read every time they edit; symbols make the list quick to check.
5. **Damage Calc answer line** (calc-plot.js `V2.pcAnswer`, `pc-ty`): the page's big moment; a symbol beside "Fire" adds flare where people look first.
6. **Compare "Weak spots / Not resisted"** (compare.js :34-35): two teams side by side; matching symbols let the eye compare them fast.

Close runners-up: Home's Type Chart plate (flare), the Ratings type filter buttons (same as #1's picks).

### Where symbols would add clutter (don't put them here)

- **Ratings rows** (meta.js :24): ~300 rows with two chips each; symbols would widen every row and lengthen the phone page.
- **The full 18x18 grid's column headers** (types.js :19): already too tight at 390 wide.
- **My Team move lists that are colour-only today** (six.js, team-frame.js, Team Sheet `tt-mv`): adding word + symbol chips would crowd the slot; move them to the `kMove` ticket instead.
- **Colour-only decoration**: Pokémon floors and plates (`--b1/--b2`, `--ta/--tb` in meta, sets, usage, build-sheet), event tickets (events.js :12), the Home phone chip squares. A symbol there would have no word, which breaks Sim's rule.
- **Archetype scenes** (archetypes.js :5): the colours stand for weather and field styles (Trick Room is drawn in Ghost colour). A Ghost symbol there would say the wrong thing.
- **Share images** (share-slab.js, share-tape.js): they are drawn on a canvas; symbols need extra drawing code. Later, if ever.
- **The Suggestions defence table** (sugs.js :329): dense grid, no room.

## 3. Symbols we may use on a public site (checked on the sources, Nov 21)

How checked: web search, then the GitHub pages and raw LICENSE / README files fetched with curl from raw.githubusercontent.com, and one sample SVG of each read as text. I checked that all 18 files exist for candidates A and B (HTTP 200 for each of normal...fairy). I did NOT render the icons to look at them; style notes come from the SVG code and the READMEs.

### A. partywhale/pokemon-type-icons (recommended to show Sim first)
- URL: https://github.com/partywhale/pokemon-type-icons (files in /icons, e.g. /icons/fire.svg)
- Licence: MIT, LICENSE file present. Quote: "Copyright (c) 2022 James Watkins. Permission is hereby granted, free of charge, to any person obtaining a copy of this software ... to use, copy, modify, merge, publish, distribute ... subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software."
- README: "This is a recreation of the type icons found in Brilliant Diamond, Shining Pearl, Legends: Arceus, Scarlet, and Violet. ... Free to use under MIT license."
- Format: SVG, viewBox 256x256, a coloured circle plus one white flat shape (fire.svg: `<circle ... r="128"/>` + white `<path>`). All 18 present.
- Style fit: flat, one colour, no gradients: fits a flat site. The round badge does not match our slanted shapes, but MIT allows changes, so we could keep only the white shape and set it inside our own slanted chip in our own `--ty-*` colour. That is a design choice for Sim.
- Risk: it is a fan recreation (drawn by hand), not ripped game files, but the designs copy the official in-game icons, which belong to Nintendo / Game Freak / The Pokémon Company. The MIT licence covers only James Watkins' drawing, not TPC's design. We must also include his copyright notice (the footer's "Sources and Credits" list, shell.js:555, is a natural home).

### B. duiker101/pokemon-type-svg-icons (not recommended)
- URL: https://github.com/duiker101/pokemon-type-svg-icons
- Licence: **none**. No LICENSE file (raw LICENSE = HTTP 404; the GitHub page lists only icons, .gitignore, README.md, index.html, style.css). README says only: "Very simple set of SVG icons for Pokemon types for any use." and links an "Original source" on Dribbble (https://dribbble.com/shots/4862612-Pokedex-iOS-app).
- Format: SVG 512x512, white shapes on no background. All 18 present.
- Style fit: flat white shapes; would sit well on our coloured chips.
- Risk: no real licence, and the drawings seem to come from another designer's Dribbble shot. I could not open that Dribbble page to see who made it or on what terms (not checked). Too unclear for a public site.

### C. Elginive/pokemon-type-icons (not recommended)
- URL: https://github.com/Elginive/pokemon-type-icons (also posted on DeviantArt)
- Licence: **none**. No LICENSE file (HTTP 404 on main and master). README: "I did my best to recreate and create a vector version of them. Free to use. Credit is always appreciated, but not necessary."
- Format: vector, Scarlet/Violet style recreation. I did not check the file list or format.
- Risk: same official-design question as A, plus no written licence.

Also seen: @pokemonle/icons-svg (MIT, "Copyright (c) 2023-present, The Open Web Community"). Its fire.svg uses the same path data as partywhale's (checked: both start `M101.14 196.71c-18.04-4.97...`), so it looks like a copy of A under a different name. If we use these shapes, take them from the original (A) and credit James Watkins. Not checked whether pokemonle credits him.

Things I'm unsure of, said plainly:
- I'm not a lawyer. Fan sites (Showdown, Bulbapedia, Serebii, Pikalytics) commonly show type icons, and our footer already says NastyPlot is unofficial and fan-made. But no licence can grant TPC's rights, so the risk is low but not zero.
- The safest option is our own original type symbols, drawn new and not copying the game's shapes. That is a design decision and needs Sim's yes with pictures.
- I did not look at any icon on screen, at 13-15 px, or in dark mode. Small sizes may lose detail (Dragon, Psychic and Fairy shapes are detailed). This needs a mock-up before anything else.

## 4. Next steps (for Sim to decide; nothing is started)
- Pick a source: A (MIT recreation, needs the credit line) or our own original set.
- Mock-ups of the top spots, with symbol + word, light and dark, 390 and 1440, before any code.
- If approved: one change in `V2.typeChip` + `V2.kMove`, then measure page heights at 390 (chips get wider).
