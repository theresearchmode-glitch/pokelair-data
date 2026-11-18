# Audit v199 design items: Today vs options (pictures for Sim)

Made Nov 17, 7:44 PM Eastern (clock: `TZ=America/New_York date` = Tue Nov 17 19:44:47 EST 2026).
Built page: `node build.mjs --v2 --preview-data` from claude/design6 at 7a0d532e, copied to app/src/v2/zz-mock.html (helper worktree only).
Options are mock-ups: CSS (and for #14 B, #18 B, #19 A a DOM move) injected into the built page. No source file changed, nothing committed.
Every picture has its labels on the image. Numbers below are measured in Chromium unless marked "by eye" or "unsure".

## #5 Empty desktop halves

### Battle (before their six is in), 1100-1365
Pictures: `audit-5-battle.png` (1280, 1440, 1100), `audit-5-battle-night.png`.
Measured problem: at 1280 the right half beside Their Six is empty (Their Six block is 1073 px wide, the button about 200).
At 1440 (today's 1366+ rule) Your Games moves right, but the headline drops to 3 lines and Your Games floats mid-height.
- Today: headline, Their Six, then Your Games as a long row under it.
- Option A: headline full width (2 lines). Under it, Their Six | Your Games as two even columns with a thin rule between.
  "Everything below fills in..." moves under the Enter button. One layout for 1100 and up (replaces today's 1366 rule).
  Your Six starts 111 px higher at 1280 and 57 px higher at 1440.
- Option B: Option A plus six dashed "?" slots in Their Six (shows what to fill in). New visual piece, so it needs Sim's yes as one.
- Recommended: **A**. Why: it fills the half with what's already there, keeps the big 2-line headline, and the page gets shorter.

### Home headline, 1100-1339
Pictures: `audit-5-home.png` (1280, 1180), `audit-5-home-night.png`.
Measured problem: intro and buttons sit under the headline (Sim's Q2, Nov 16, when side by side made the headline 4 lines).
About 520 x 300 px is empty to the right. Face-off starts at y 519.
- Today: as above.
- Option A: the 1920 layout (headline left, intro and buttons right), with the headline column held at its own width.
  So it stays 2 lines: measured 122 px tall at 1100, 1150, 1280 and 1339; nothing runs past the edge.
  Under 1280 the buttons go Score My Team full width, Build Me a Team | Battle under it (the phone pattern).
  Face-off 137 px higher at 1280, 85 px higher at 1180.
- Option B: the headline grows to fill the width (120 px at 1280, 108 px at 1180), with intro and buttons on one row under it.
  Boldest look. Face-off 44 px lower at 1280, 21 px lower at 1180. The size is fluid (my mock fits it per width), so it is unsure
  that it can stay on the type scale's display sizes at every odd width.
- Recommended: **A**. Why: it fixes what Sim's Q2 worried about (the headline stays 2 lines) and pulls the face-off up the screen.

## #14 Hero stat labels on phones (Ratings, Usage, Popular Sets heroes)
Pictures: `audit-14-hero-stats-390.png`, `audit-14-hero-stats-320.png`, `audit-14-hero-stats-night.png`.
Measured problem (390): label lines 3 / 1 / 2 ("On tournament teams" / "Win rate" / "Base Speed"); Usage 2 / 3 / 1.
Correction to the audit: the numbers already share one line today (measured: the same top on all three, e.g. 781 / 781 / 781).
What looks uneven is the labels' tops (730 / 764 / 747). At 320 the "Base Speed" column ends 1-3 px past the hero box today.
- Today: as above.
- Option A: "On tournament teams" becomes "Of teams"; labels kept on one line from 360 up.
  At 390: all three labels 1 line on all three pages. At 320: Ratings and Usage have one 2-line label, Sets two.
  Under 360 the labels may wrap again (on one line, "Base Speed" was cut off at 320).
- Option B: the three numbers move to their own full-width row under the sprite: number first, label under, full words kept.
  At 390: "On tournament teams" 2 lines, the others 1; numbers all on one line. At 320 it is 3 lines.
  The hero gets taller (by eye; not measured).
- Recommended: **A**. Why: it's the smallest change, and from 360 up every label and number sits on one even line.
  Unsure: is "Of teams" clear enough for a new player? "Usage" can't be used: Usage already has a "Usage rank" stat.

## #18 Pokémon page at 768 (iPad portrait)
Pictures: `audit-18-pokemon-768.png` (Charizard, it has forms), `audit-18-pokemon-700-820.png` (A at 700, 820, night).
Measured problem: the card is 360 px wide, centred in a 657 px column (about 150 px empty each side). The forms strip
holds 3 tiles at their own width, about 2/3 of the row.
- Today: as above. Rating starts at y 560, forms at y 1016.
- Option A: card left, rating block right: the desktop layout, from 700 up instead of 900. Forms as 3 even tiles.
  Forms move up to y 696; the section links ("Is it good?" ...) move up 321 px.
- Option B: card left and Base Stats right (two even blocks), rating full width under them. Rating moves down to y 608
  (48 px lower).
- Recommended: **A**. Why: the rating (the page's main answer) stays at the top, and the page loses about a third of a screen.
- Caveat for A (by eye, at 700): "F tier" wraps to 2 lines, and the three numbers (0.1% 39% 152) nearly touch. A needs a
  smaller number size between 700 and about 740 before it ships. 768 and 820 look right.

## #19 This Week, "Most Used This Week" on phones
Picture: `audit-19-thisweek-mostused.png` (390, 320, night).
Measured problem: under 430 there are 3 + 2 tiles (row 2 centred, 2 of 3). The li boxes don't overlap (measured, 0 pairs).
By eye: the top three tiles have no gap, so their slanted colour plates meet and cross at the corners.
- Today: section 321 px tall at 390.
- Option A: a 5-row list in the "Pokémon on the Move" row style: rank 1-5, sprite, name, "of teams", share on the right.
  482 px at 390 (161 px taller); holds at 320 (one 2-line name: "Mega Charizard Y").
- Option B: one strip of 5 smaller tiles (as from 430 up): 230 px at 390 (91 px shorter). "Mega Charizard Y" goes to 2 lines.
  It fails at 320: names break mid-word ("Kingambi / t", "Incineroa / r"), so it needs 3 + 2 again under about 360.
- Recommended: **A**. Why: even rows at every phone width, it matches the list right above it, and the ranks read at a glance.

## #20 Phone bottom bar: the current page's label sits lower
Pictures: `audit-20-phone-bar.png` (390 Battle, Meta, night; shown 2x), `audit-20-phone-bar-320.png`.
Measured problem: the current label's text top is at 818.3 vs 807.5 for the other four: **10.8 px lower** (Battle, Meta and Home
all the same). Cause, from the code: shell.css gives the blue mark (`::before`) its own grid row, which pushes the word down.
- Today: as above.
- Option A: the blue mark sits on the bar's top edge (28 px wide). All five labels on one line (measured 807.5 for all five).
- Option B: the blue mark sits just above the word (22 px, the same place as today). All five labels on one line (measured).
- Recommended: **B**. Why: it keeps today's look and only fixes the drop. A reads more like an iOS tab bar, if Sim wants that.

## Not checked
- Safari / iPhone rendering of the options (Chromium only).
- experiments/polish-check.mjs was not run on the mocks (they aren't site changes); run it on whichever option ships.
- Option sizes at every odd width: checked only at the widths named in each picture (plus Home A at 1100, 1150, 1339).
