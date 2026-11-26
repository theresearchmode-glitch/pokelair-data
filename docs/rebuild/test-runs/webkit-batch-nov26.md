# WebKit (Safari's engine) look at the coming batch (HH's Job O), Thu Nov 26, 07:55-08:20 AM Eastern (`date`)
Look and measure only. Nothing was fixed.

## Setup
- **Build:** origin/alt/kl-batch 14325eb1 plus origin/alt/home-rack 0778b6f9, merged locally (it merged cleanly, v2-minors.mjs included; not pushed).
  - Today's out/ from origin/main (aea648c1, Nov 26 11:51 UTC).
  - `node app/build.mjs --v2 --preview-data --art=../src/v2/art/`, served over http (127.0.0.1:8913).
- **Engines:** Playwright 1.63 WebKit 2359 (scratchpad pwpkg, `PLAYWRIGHT_BROWSERS_PATH=pw-webkit`), with Chromium 1243 from the same package for comparison.
- **Devices** (isMobile, touch; iPhone/iPad user agents), light and dark:
  - iPhone 390x844 (3x)
  - iPhone SE 375x667 (2x)
  - iPad mini 744x1133
  - iPad 820x1180
  - iPad landscape 1180x820
- **Across all 30 loads** (5 devices x 2 themes x Home / My Team / My Team with Spicy on): no sideways scroll, no page errors.
- **Not checked:** a real iPhone or iPad (Linux WebKit is not iOS Safari).

## Home tools rack
| Item | Result | How checked |
|---|---|---|
| Calc band, number | **Problem at 390 and at 1180.** "94–100%" ends past the band's right edge. At 390: 10px in WebKit, 8px in Chromium; the "%" is clipped by the slanted edge (wkb-06). At 1180x820: 40px in WebKit, 38px in Chromium; the "%" is lost (wkb-07). **The 1180 case is already on design6/kl-batch** (same 40px there, measured on a kl-batch build without the rack), so it isn't from the rack. 375 (34px type), 744, 820 and 1440 fit. | The text's own line boxes (Range rects) against the band's box. |
| Calc band, sprites | PASS: both inside the band at every size (88px at 390/375, 96 on iPads, 90 at 1180). | Picture rects against the band. |
| 4 cards, titles | PASS: titles inside their cards. Cards are 2x2 on iPhone 390 and iPads, one per row on SE 375. | Every visible element of each card against the card's box; titles had no overflow. |
| 4 cards, pictures | Pictures rise above the cards' tops: 8-80px at 390 (the tallest is the Ratings podium's top sprite), 24-44px on iPads. **Desktop 1440 does the same** (-44/-24px), so I read it as the rack's design, not a fault (unsure). | Picture top minus card top, at every size, 1440 included. |
| Battle sprites | PASS: each sprite inside its own side. **Minor at 390:** the "VS" sits over the right Mega Charizard Y's head (wkb-08). | Sprite rects against each side's box; picture. |
| Practice | **Minor at 390:** the "Pick 4" tag covers part of the sprites (wkb-08). | Picture. |
| Chips | PASS: 7 chips. On phones 2+2+2+1, the last one full width (358 of 358 at 390; 343 of 343 at 375). On iPads and 1180 one row of 7. | Chip rects. |
| Sideways scroll | PASS: none on any device. | scrollWidth against the window. |

Pictures:
- wkb-01: iPhone light, whole rack
- wkb-02: SE dark
- wkb-03: iPad mini light
- wkb-04: iPad dark
- wkb-05: landscape light

## My Team at 390 (K): PASS
- WebKit iPhone 390x844, today's data, Spicy off: 3669px = **4.347 screens** (cap 4.35), the same in light and dark.
- The five links are on 1 row (picture wkb-09). SE 375: 1 row too.
- From 744 up the links keep their two rows, as designed: K changed phones only.

## Spicy on (L)
- Labels fit their pills (text inside the pill, nothing cut) on every device: PASS.
- iPads and 1180: all three labels on one line, inside their cards (wkb-11).
- **Minor at 390 (light) and SE (both themes):** "Rare pick, plenty of games (1,598)" wraps to two lines, and the slanted pill's right corner ends **3px past the card** (wkb-10).
  - At 390 it is sub-pixel close: one line in dark (357px in a 358px card), two in light.
- No sideways scroll. The header reads "Pokémon fewer than 5% of teams use. Each card says how much data is behind it."

## Ranked fixes (proposals only)
1. **Calc band number at 1180 (and 1100-1279), pre-existing.**
   - Step the number down (as 375 already does at 34px) or let the hit block take more of the band.
   - Reason: on a landscape iPad (and 1100-1279 laptops) the "%" of the headline number is lost. That is the most visible fault in this batch.
2. **Calc band number at 390.**
   - The rack's phone step (34px under 380) could run to 390-430, or the band's right padding could cover the slant.
   - Reason: on the commonest iPhone width the "%" touches and is clipped by the slanted edge.
3. **Spicy pill at 375-390.**
   - Keep the slanted pill inside the card when it wraps, e.g. margin-right equal to the slant on phones.
   - Reason: a 3px overhang that Sim's eye for edges will catch.
4. **Battle VS / Practice tag at 390.**
   - Nudge "VS" up or narrow it, and give the Practice tag a little room over the sprites.
   - Reason: small overlaps on the phone rack. A look change, so it needs pictures and a yes.

## Pictures: docs/rebuild/pics/nov26/wkb-01..11 (labelled; problems and minors named in the band)
