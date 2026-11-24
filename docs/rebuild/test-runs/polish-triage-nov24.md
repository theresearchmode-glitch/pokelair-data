# Polish triage: last night's polish-check findings, judged by eye (Nov 24, 10:04 AM by the clock)

Source: docs/rebuild/research/polish-all-nov24-night.txt (commit 75cda4b4): `spill 27, uneven 23, lone 93, tap 10, bodyhead 3,
lineh 17, glow 8, boxes 13, space 185; page errors 0`. Built page: claude/design6 at 33ec968b, frozen data 0c992f69,
`node app/build.mjs --v2 --preview-data --art=../src/v2/art/` → "v2 guard: clean". Pictures: day, 2x, spot marked with a pink
dashed outline (tools/mark.cjs). No fixes made.

## Result: 6 real findings, not 10
I looked at 30 spots at 1440 / 1280 / 820 / 390. Only 6 are things a person would notice; the rest are fine on purpose (below).
I'd rather list 6 than pad to 10.

| # | Page, width | What's wrong | Smallest fix I'd suggest (kit only; my guess, not tried) |
|---|---|---|---|
| 1 | Speed Tiers, 1440 and 1280 | The control rows (You / Them, Field / Weather) fill about half the width; the right side is empty. Fine at 820. | At 1280+ put Field and Weather on the same row after Them, so the chips make one even line. Same chips, nothing new. |
| 2 | Damage Calc, 1440 | The sentence "Mega Charizard Y hits Sneasler with Heat Wave" breaks with "Heat Wave" alone on line 2; a quarter of line 1 stays empty. | Fit the sentence's display size to the width as Build's Plot sentence does (`--d-plot`), so it sits on one line at 1280-1440; or `text-wrap: balance` for even lines. |
| 3 | Build, Winning Cores, 1440 | Facts split mid-fact: "+1 / point together" and "375 teams / (2.8%)". | Wrap each fact ("701 teams (5.1%)", "+1 point together") in a no-break span so lines break only at the "·". |
| 4 | Home, Battle tile, 1440 | "1 plan." alone on the last line of "Scout their six, get a turn 1 plan." | `text-wrap: pretty` on the tile blurbs (no single word ending a tile). |
| 5 | My Team, 1280 | The five action links break 3 + 2 (Edit Set, Replace, Remove / Lock, Pokémon Page). Minor. | One row of five at 1100+ with the gap a step smaller, if it fits. Not measured. |
| 6 | Battle and Build, 390 | Buttons inside a sentence are under 44 px tall: "0 of 4 picked" 26 px (Battle), "How Cores Are Ranked" 18 px (Build). Rule C8 says 44. | The kit's invisible hit layer (the `::after` `max(100%,44px)` pattern in components.css, C8): no visual change. Borderline: inline links are a usual exception, but our C8 lists none. |

## Judged fine on purpose (grouped)
- **spill (27):** My Team's score panel and Track's "230×" are slanted, and their overhang is what got counted. Both sit cleanly
  (checked by eye, 1440). Pokémon page partner cards (+12 px) and the sheet's Build Around It (+5 px) are at 320 and 720 only,
  not the four widths. Not looked at.
- **space (185):** almost all are centring and auto margins (`header nav marginLeft` 118.8 px on every page at 1440). Speed
  Tiers' "600 px padding" is the speed bar's track (checked by eye).
- **lone (93):** deliberate layouts (checked by eye at 1440/1280): Home's big Damage Calc tile with four below, Home's top 10
  (repeated ranks are ties), My Box's three columns, the KO Board, move tickets, Sets' item and ability row, Events'
  "Coming up." row. Most of the rest are at 320 or 400-1200 in-between widths. Not looked at.
- **uneven (23):** nearly all at 320-800 (the Winning Teams / Events / Archetypes / This Week tabs wrap "Winning Teams" at
  320). Not looked at.
- **tap (10):** Home's tool links (19-37 px) are fine: the whole tile is the link (checked: taps on the 358x138 px tile land on
  it). Pokémon page Choice Scarf / Life Orb / Modest: HH's pending tablet tap fixes. Battle and Build: #6.
- **glow (8):** This Week's weather tiles glow on purpose so white text reads over the pictures (checked by eye).
- **boxes (13):** the move ticket's type band over its body counts as extra shades. It looks clean in night mode (checked
  by eye, My Team 1440). The Damage Calc picture, Gifts' Copy Code and Home's kicker were not looked at.
- **lineh (17) and bodyhead (3):** small captions at 1.3-1.4 line height, and 20 px lead lines (Damage Calc label, Track's
  "The ratings called…", Events' count). Damage Calc and Track looked fine; the rest were not looked at one by one.

## Not checked
Night mode beyond the one move ticket; WebKit; the in-between widths. Method's colour bands: my selector caught a hidden copy,
so not judged.
