# Job LL: the live page wrapped by the Claude host vs unwrapped (Fri Nov 27)

## Setup
- **Fix build:** origin/alt/host-wrapper-fix **612d0364**, built with `cd app && node build.mjs --v2 --art=v2art/ --one-art-size --split` and origin/main's out/ (restored after). v2.js is 3,819,177 bytes.
- **Wrapped and unwrapped pages, same folder:**
  - Wrapped = scratchpad/live-check/wrapper-head.txt + v2.html + `</body></html>`, saved as cmp/site/index.html.
  - Unwrapped = cmp/site/v2.html.
  - Same v2.js, fonts and v2art, so the host wrapper is the only difference.
- **Data:** today's meta documents from origin/main (b7d60ef3 out/, split parts per out/split/index.json) via the Job KK db stub.
- **Pages (12):** Home, Build, My Team, Battle, Meta, My Box, Pokémon Garchomp, Track Record, Search open, Spicy picks on, How We Calculate, About.
  - My Team and Spicy use a saved full team scoring 85 "Tournament ready" (Garchomp-Mega-Z, Delphox-Mega, Venusaur, Kingambit, Farigiraf, Torkoal).
  - Home full-page shots include the tools rack.
- **Views:** WebKit iPhone 15 / iPhone SE / iPad Pro 11 portrait + landscape, Chromium 1440x900 / 1280x800, light and dark. reducedMotion reduce, animations and transitions off, full-page shots. 144 pairs.

## Results
| Run | Pairs with any differing pixel |
|---|---|
| **612d0364 (final)** | **8 of 144**. All Chromium, each one sprite only (721-1,642 px). WebKit: **0 of 96**. |
| Same 8 views, unwrapped vs unwrapped (the same file twice) | 5 of 8 differ, with the same counts and boxes (e.g. Garchomp 1440 light: 1,362 px, bbox 852,2077-1006,2401) |
| Same 8 views, wrapped vs unwrapped again | 5 of 8 differ, a different 5 |
| Old fix build 6d2bbe9c (stopped at 95 of 144) | 91 of 95 differ, all only in the top 70 CSS px (the header) |
| Control, no fix: live wrapped live-check/index.html vs unwrapped (== lvpub/v2.html) | **3 of 3 differ**: Home iPhone 15 dark 5,809,361 px; Meta 1440 dark 4,216,266 px; Home 1440 light 946,792 px |

What each row means:
- **612d0364:** the 8 Chromium differences are render noise (a sprite caught mid-decode), not the wrapper. With 612d0364 the wrapped page renders like the Preview.
- **Old build:** the back/forward buttons carry `hidden`. Our CSS shows them (`display:grid`); the host's `[hidden]{display:none!important}` hid them, and the logo moved. Fixed in 612d0364 (checked: both `display=grid`).
- **Control:** the check catches the live bug.

## Computed styles (wrapped, 612d0364)
All 144 pairs: wrapped == unwrapped for:
- body background, color and font
- body margin
- :root color-scheme, padding and box-sizing
- the count of img with max-width 100%
- the count of [hidden] elements shown

Example iPhone 15 dark: body `rgb(18,18,27)` / `rgb(228,224,218)`, `16px Instrument Sans`, color-scheme `dark`, imgMax 70 of 76, hiddenShown 2.

Live without the fix, iPhone 15 dark: body `rgb(255,255,255)` / `rgb(0,0,0)`, `14px -apple-system`, color-scheme `light`, imgMax 76 of 76, hiddenShown 0.

## Sim's two iPhone bugs (WebKit iPhone 15, light)
- **(a) Home tools rack, Ratings podium sprites: a REAL PAGE BUG, also in the unwrapped page.**
  - The top sprite (Sneasler) is cut flat by the Damage Calculator tile above, in all three: unwrapped, wrapped no fix, wrapped + fix.
  - The fix does not change it.
- **(b) "Tournament ready" past the black score box: WRAPPER ONLY.**
  - Text right edge vs box right edge: unwrapped -5 px (fits); wrapped no fix +7 px (past); wrapped + fix -5 px (fits).

## Pictures (docs/rebuild/pics/nov27/wrapper-compare/)
- **Red bands:** A (rack bug), B (score box), the 3 control diffs, the old-build header diff.
- **Green bands:** the 8 noise diffs from 612d0364.

## Not checked
- Real devices.
- The host's safe-area padding: env() is 0 in emulation. The fix reverts padding-top/bottom, but an iPhone notch was not tested.
- Dark mode for (a).
