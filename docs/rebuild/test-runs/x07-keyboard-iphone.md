# X-07: does the phone keyboard hide Build's name-box list? (real iPhone needed)

Why a real phone: a headless browser can't open an on-screen keyboard, so this can't be checked from the cloud machine.
What the code does today (checked by reading it): the new site keeps **sheets** above the keyboard (app/src/v2/shell.js,
lines 37-54, `--kb` and the `kbo` class). Build's "Build around" name box sits **on the page**, not in a sheet, so none of
that applies to it. Unsure whether the bottom tab bar (phones under 700px wide) then covers the suggestion list.

## Steps (about 3 minutes; on the iPhone, in Safari AND in the Claude app)
1. Open the Preview (NastyPlot Full Redesign), tap **Build**.
2. Tap the "Build around" name box. The keyboard opens.
3. Type `ga`. A list of Pokémon (Garchomp, Mega Garchomp Z...) should appear under the box.
4. Look: can you see the whole list, or does the bottom bar (Home / Build / My Team / Battle / Meta) or the keyboard
   cover part of it? Screenshot it either way.
5. Repeat on Battle: tap the opponent's name box, type `in`.

## What to send back
For each of the 4 cases (Safari Build, Safari Battle, Claude app Build, Claude app Battle): "all visible" or "covered",
plus the screenshot.

If you'd rather use the Mac: Xcode > Open Developer Tool > Simulator, iPhone 13, open the Preview link in Safari, and turn
on the software keyboard (I/O > Keyboard > Toggle Software Keyboard). The Claude app can't run in the Simulator, so the
Claude app cases still need the real phone.

## Also, while you're on the iPhone (Nov 13, PKMN-04): swipe between the info sheet's tabs
6. On My Team, tap a Pokémon's Info Sheet. Swipe sideways (right to left) across the sheet's panel: it should move
   Info → Meta → Rating. Swipe the other way to go back. A slow drag or a mostly up-and-down scroll should do nothing.
   Checked in Chromium with simulated touches (works); WebKit's test browser can't simulate touches, so only a real
   iPhone can confirm it. Send back: "works" or what happened.
