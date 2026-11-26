# WebKit recheck of the combined batch (HH's Job Q), Thu Nov 26, 08:45-09:05 AM Eastern (`date`)
Look and measure only. Nothing was fixed.

## Setup
- **Build:** origin/alt/rack-batch 9c0ce26f, which is kl-batch2 + HH's home-rack (the calc's `sdt-pct3` and `--d-calctight`; Pick 4 on the band's bottom edge under 700) + the webkit-batch report.
  - Frozen out/ (0c992f69, checked out first, restored after, never committed).
  - `node app/build.mjs --v2 --preview-data --art=../src/v2/art/`, served over http (127.0.0.1:8913).
- **Engine:** WebKit 2359 (Playwright 1.63, scratchpad pwpkg, `PLAYWRIGHT_BROWSERS_PATH=pw-webkit`).
- **Devices** (isMobile, touch, iPhone/iPad user agents), light and dark:
  - iPhone 390x844 (3x)
  - SE 375x667 (2x)
  - iPad mini 744x1133
  - iPad 820x1180
  - landscape 1180x820
- **Not checked:** a real iPhone or iPad.

## 1. Calc number "94–100%" with `sdt-pct3`: PASS everywhere
- The frozen data's number is "81–96%" (two digits), so I put in "94–100%" and added `sdt-pct3`.
- I measured the text's own line boxes against the band's box: whole, one line, and px in from each side. Light and dark are identical.

| Device | Size | Lines | In from left | In from right |
|---|---|---|---|---|
| iPhone 390 | 40px | 1 | 32 | 86 |
| SE 375 | 34px | 1 | 32 | 107 |
| iPad mini 744 | 64px | 1 | 56 | 208 |
| iPad 820 | 64px | 1 | 56 | 284 |
| landscape 1180 | 51.9px | 1 | 631.6 | **45** |

- At 1180 it was 40px past the edge in Job O (66px type); now it is 45px inside.
- Pictures wkr-01..04.

## 2. Battle "VS" and the Pick 4 tag
- **Opaque sprite pixels** under each (the sprite drawn at its rendered size, alpha over 32):
  - VS: sprite pixels inside VS's text box.
  - Pick 4: sprite pixels inside the tag's box.
- **Box overlap:** the sprite's whole box including its transparent margin. Light and dark are the same, within a few px².

| Device | VS: opaque px² (box px²) | Pick 4: opaque px² (box px²) |
|---|---|---|
| iPhone 390 | 593 (1,529) | **15** (217) |
| SE 375 | 593 (1,529) | **15** (37 + 217) |
| iPad mini 744 | 459 (1,001) | 385 (1,690) |
| iPad 820 | 459 (1,001) | 350 (1,515) |
| landscape 1180 | 125 (724) | 502 over three sprites: 12 + 103 + 387 (107 + 204 + 306 + 1,531) |

- **Phones: Pick 4 is now clear**, touching 15 px² of the last sprite's feet (wkr-05).
- **VS:** at 390 its text box holds 593 px² of the right sprite's top.
  - In the picture the VS glyphs sit just over the right sprite's head (wkr-05). The text box is taller than the letters, so the real overlap of letters and sprite is smaller (not measured glyph by glyph).
- **iPads and 1180:** the Pick 4 tag still covers 350-502 px² of sprite (the 700+ rule is unchanged); the VS covers 125-459 px² (wkr-06, wkr-07). On the iPads this is the rack HH approved, not a new change.

## 3. Spicy pill (SP-7's measure, WebKit, the longest label put in): PASS
| Width | Lines | In from left / right |
|---|---|---|
| 360 | 2 | 0.8 / 0.8 |
| SE 375 (light and dark) | 2 | 0.8 / 0.8 |
| iPhone 390 (light and dark) | 2 | 0.8 / 0.8 |
| 430 | 1 | 2.2 / 33.6 |
| iPad mini, iPad, 1180 | 1 | 2.2 / 113-293 |

Pictures wkr-08 and wkr-09.

## 4. Sideways scroll, page errors, My Team
- 32 loads (5 devices x 2 themes x Home, My Team, My Team with Spicy on; plus 360 and 430): no sideways scroll, no page errors.
- My Team at 390, frozen data, Spicy off: 3990px = **4.727 screens**, with "Optional swaps:" shown, so the cap is 4.78. Same in light and dark.
  - Today's no-swap state was checked in Job N (4.346).
- Other sizes (screens of their own window): SE 6.016 (4.755 counted in 844px screens), iPad mini 3.999, iPad 3.757 (dark 3.735), landscape 3.665.

## Remaining, ranked (proposals only)
1. **Battle "VS" on phones:** lift it about 8px or move it off the right sprite's head. Reason: of the four rack items, it is the one still touching a sprite on the commonest iPhone width (593 px² of sprite inside its text box).
2. **Pick 4 on iPads and 1180:** the same bottom-edge placement as phones. Reason: it covers 350-502 px² of sprites there. That is the approved iPad rack, so it's Sim's or HH's call.

## Pictures: docs/rebuild/pics/nov26/wkr-01..09 (labelled)
