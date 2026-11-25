# Home length at 1440 (Nov 23, hW, direction work for Sim)

Goal: Home is 5,471 px = 6.08 screens at 1440x900; the cap for reference pages is 4 screens (3,600 px). Sim left Home's length as
his call, so these are two options to pick from, built as real CSS/JS on branches (nothing merges until Sim picks).

## Before: where the height goes (1440x900, day, `--v2 --preview-data` build of 5a10220b)
Measured with a scratch Playwright script (section top and height from getBoundingClientRect). Bands overlap by their slanted cut
(72 px), so "takes" is the distance to the next band's top.

| Part | Takes | What fills it | Empty width / air |
|---|---|---|---|
| Header + Preview notice | 139 | | |
| Hero (stampede) | 929 | first screen 761 (scene + plates + ledge), herd ticker 144 | none: full bleed |
| Top 10 strip | 245 | heading row + 2 rows of 5 | none |
| Six band | 1,085 | line-up column 958 (headline 230, New here? 371, six 261, buttons 52); receipt 670; plan 702 | a strip about 256 tall x 680 wide sits empty above the receipt and plan (they end level with the taller line-up) |
| Tools band | 1,855 | heading 94; Speed race 163; 3 rows of plates (413, 304, 238); Events / How We Calculate 100; More tools 61 | Damage Calc and Battle plates are mostly air; the 4 small plates share 238 px for one picture each |
| Post band | 1,038 | heading row + Pelipper 110; gift parcel 383 + 4 past-gift stamps 288; Dispatch paper 632 | the paper's four more-stories cells hold one line each in 130-150 px |
| Footer | 180 | | |

Side space: content is 1,233 of 1,440 px (96 px gutters) at 1440 and 1,713 of 1,920 at 1920, so at 1280-1440 there is little unused
width; the room is vertical (the six band's empty strip, airy plates, the stamps and more stories).

Arithmetic that decides the options: the stampede plus header is already 1.19 screens. The six band cannot go much under ~900 px
(its receipt and plan are 670-700 px tall), so tools + post + top 10 have to fit about 1.4 screens together. Packing alone (paddings,
4-across rows) measured ~4.5 screens; reaching 4.0 needs the tools band in the iPad layout (Tools B) and the post in the phone layout
(Post X) on desktop too, plus either a shorter stampede (A) or the post joining the tools band (B).

## Shared by both options (branch hw-homelen)
- Bands keep 40 px above and below their content at 1100+, not 64 (the slanted cut stays).
- The top 10 rides the hero's red flag at 1100+: the strip turns ink like the hero's ledge, the ten sit on the tilted red flag; the herd
  ticker (ratings 3-20) steps aside there (the ten name the same Pokémon, SEE ALL RATINGS has the rest).
- New here? reads across in three steps at 1280+.
- Tools band desktop rack at 1100+: Tools B (Sim chose it for phones and iPads, Nov 18) laid out wide: the Speed Tiers race, then
  Ratings, Damage Calc, Winning Teams (Load Team, Copy for Showdown kept) and Battle in one row, then the other seven tools as picture chips
  in one row (Team Preview Practice joins the chips at 1100+ only), then More tools.

## Option A: shorter stampede, four bands (branch hw-homelen-A)
- Tagline on one line at 1100+, a step smaller, so the herd stays big under it.
- On 1440x900-shaped screens (1380+ wide, no wider than 17:10) the stampede is 340 px shorter, so the top 10's flag ends on the first screen.
  Other shapes keep the full stampede (qcheck found the plates meeting the tagline at 1280x900 and 1920x900 when trimmed).
- Post X on desktop: the red band, heading and Pelipper stay; the gift parcel beside the Dispatch's masthead, lead story and Next event.
  Past-gift stamps, the second slip, the Sent line and more stories are one tap away (All 10 Gifts, All 69 Stories).

## Option B: full stampede, three bands (branch hw-homelen-B)
- The stampede keeps its whole first screen (first screen identical to today).
- The post joins the tools band as its last row (beige, Post X): the red band, its heading and the Pelipper step aside on desktop.

## Lengths (fresh browser per width, day; px = screens)
| | 390x844 | 1280x800 | 1440x900 | 1920x1080 |
|---|---|---|---|---|
| Before | 6,933 = 8.21 | 5,998 = 7.50 | 5,471 = 6.08 | 5,738 = 5.31 |
| A | 6,933 = 8.21 | 3,900 = 4.88 | 3,594 = 3.99 | 4,156 = 3.85 |
| B | 6,933 = 8.21 | 3,570 = 4.46 | 3,597 = 4.00 | 3,794 = 3.51 |

Phones unchanged (every change is 1100+ only). 1280x800 stays over 4 in both (its screen is 100 px shorter).

## qcheck (`ROUTES=home WIDTHS=320,390,820,1280,1440,1920`, both themes)
- Before: `42 findings, 2 new` (1440 only, because 1440 isn't in the known list: OVERLAP "The Champions" x "Dispatch", day and night).
- A: `46 findings, 6 new`. B: `46 findings, 6 new`. The same 6 in both: the 1440 pair above (already in today's page), plus at 1280
  (day and night) OVERLAP "The Champions" x "Dispatch" and SIZE 28.7 px (A) / 30.1 px (B) "A New Mystery Gift": Post X keeps the gift and
  the paper side by side from 1100, where today they stack under 1360, so the small paper's masthead and lead are tighter there.

Pictures: docs/rebuild/pics/nov23/homelen/ (before, A, B: 1440 full page, 1440 first screen, 390 first screen; day).
