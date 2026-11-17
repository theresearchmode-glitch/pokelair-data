# Nov 12 notes, re-checked on the current build (time: 11:09 AM, Tue Nov 17, 2026, from now.sh)

Build: claude/design6 at 469667c6, `node build.mjs --v2 --preview-data` (sample team), served over local HTTP from app/src/v2/
so fonts and sprites load. Chromium unless stated; WebKit = Safari's engine. Temp page removed afterwards. Pictures are in this folder.

| Note | Status | Evidence (checked, how) | Picture |
|---|---|---|---|
| A8 bars: text behind can't be read | CLOSED | Bars still carry the A8 fix: both bars `bg …/0.96` + `blur(14px)`, solid fallback under `@supports not` (shell.css 70-73). Show-through measured as the contrast between each bar with the page behind it and with the page hidden, 4 scroll spots, day+night, at 320, 390, 393x852 and an iPhone 13: Chromium max **1.07:1**; WebKit max **1.14:1**. WebKit is a worst case: a test page showed headless WebKit draws NO backdrop blur (darkest pixel 0) while Chromium does (169). Last text clears the bottom bar by 44px (743 vs 787 at 390). Sim confirmed on her iPhone Nov 12 (decisions.md l.61; her words "text is more legible" are ambiguous). Caveat: with no blur, the 34px tier numbers ("92 S tier") show as a faint trace at 2x | A8-bars-current.png, a8/*.png |
| A10 divider symmetry in the six (phone) | NO LONGER APPLIES | The six became "The Hand" (Sim's pick, Nov 14; decisions.md l.854). Lead/Back/Bench are stacked on phones and side by side from 1100px. No vertical dividers: `.sx-grp:nth-child(3)::before{content:none}`, group borders 0 at every width tested. Each group has one 1px rule under its heading; Lead's is blue +2px on purpose (audit #5, pages.css 2026). Headers level at 1280 (all y=466) | A10-six-current.png |
| A12/A13 one main button; selected segments quieter | CLOSED | Main buttons (.np-btn) per screen: default sample team **0**; 5-of-6 state (Update Team + Apply) **max 1 per screen** at 390 and 1280, day and night. Selected segments: day light blue `(0.84,0.92,0.96)` with PLOT text vs a black main plate (Sim's A13 option C); night dark navy `(45,67,90)` with blue text vs the bright blue main gradient `(99,192,248)` | A12-A13-five-1280-current.png, A12-A13-sugs-390-current.png |
| A15 2x2 Matchups switcher backgrounds | CLOSED | At 320/390/393 the switcher is 2x2 (four 44px cells) on ONE wash background. Only the chosen cell is tinted. Day and night look even by eye. 768+ is one row of four. (The 390 crop is partly under the bottom bar, a screenshot artifact; 320 shows the same layout) | A15-switcher-current.png |
| A15 desktop column balance | STILL OPEN (partly) | The big empty band is gone (32px from work area to footer at every width). The columns are now Suggestions (left) vs Team Checks + Your Games (right). The right ends earlier by **188px at 1280**, 106 at 1440, 165 at 1024, 82 at 1920, 72 at 768 | A15-columns-1280-current.png |
| 'Edit Set' shown twice | CLOSED | Visible "Edit Set" on My Team: **1** at 320/390/393/768/1280/1440, day and night (the editing strip; decision 3aa5fa6, Sim Nov 12 "Edit Set in the Set section only") | probe-390-strip.png |
| Stand-outs rows repeat their group word | NO LONGER APPLIES | The group headings were removed in the Nov 12 height cut (matchups.js l.39: "no group headings, each row carries its verdict badge"). Stand-Outs are now Cards with at most 4+4 (Sim's Q1 B, Nov 13). The badge is each card's only verdict label, so nothing repeats | STANDOUTS-390-current.png, STANDOUTS-1280-current.png |
| My Box Box 1/Box 2 markers 44px | CLOSED | Both markers **44x44**, adjacent, at 320/390/768/1280, day and night, Chromium and WebKit. Tapping 1px inside each edge hits the marker (4 of 4 points each). Done in d7357e8 (Nov 12, item 21) | BOX-markers-current.png |
| A1 My Team phone length (target ~4 screens, folds closed) | STILL OPEN | Folds closed: 390x844 **4,805 = 5.69 screens**; 393x852 4,782 = 5.61; 320 5,385 = 6.38. Folds open: 7,276 = 8.62 / 7,254 = 8.51 / 8,059 = 9.55. Target 4 screens = 3,376 at 390. c13's own limit (4,150 + 70 footer) is also over at 390, 320 and 1440 (1440 2,489 vs 2,360). Where it goes at 390: hero+six+strip 2,073 (strip 357), Matchups 992, Suggestions 626, Team Checks 244 (2,715 open), Your Games 203, footer 377. Grown since Nov 16 (5.0 closed): **not yet explained** | A1-length-390-current.png |

## Fix ideas (still-open items only; all visual, so Sim decides with pictures)
- **A15 columns:** two options.
  - Move "Adjust Suggestions" into the right column under Your Games. Why: it is the block that hangs below. About 240px move right, so check it doesn't flip the imbalance.
  - Or stack Your Games' three parts (score / note / Log a Game) on the right. Why: the right side gains height, and it un-squeezes the text.
- **A1 length:** three options.
  - Your Games as one line, "Your Games: none yet · Log a Game ›" (say-it-once.md already says one line on My Team). Saves about 150px.
  - Put "Adjust Suggestions" behind a fold. Saves about 250px; it hides the settings, which was the reason it was kept open.
  - With folds open, Team Checks alone grows by 2,470px: show only the failing checks when its fold opens.
  - Then find out what grew after Nov 16 before any cut (git bisect with c13 at 390).

## Side findings (not in the notes; seen while checking)
- **Your Games at phone width:** squeezed into three columns. "None logged yet" wraps to 3 lines and its note to 7 (SIDE-yourgames-390.png).
- **Hand Cards at 1280:** Garchomp's and Sneasler's type tags stack (Dragon over Ground) while the other cards' tags sit side by side. Their names therefore sit higher than the rest (A10-six-current.png, bottom). This breaks the C11 symmetry rule. Cause not checked.
- **c13-check.mjs on file:// pages:** logs 4 Chromium CORS errors for fonts/unbounded-latin.woff2 when the page sits in app/src/v2. The 390 height came out the same as over HTTP (4,805).
