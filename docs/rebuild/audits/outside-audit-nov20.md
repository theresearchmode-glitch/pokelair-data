# Fresh outside audit of the new site (Nov 20)

Written Fri Nov 20, 2026, 6:46 AM Eastern (time from `docs/rebuild/now.sh`).
Plans step: "Final polish pass and a fresh outside audit score". Look-only: no site code changed.

Built page: `4ca1257b` + merge of `432c6c3a` (today's site + My Team tabs, Meta change, Q64) = local `e99ee377`,
frozen data `out/` from `0c992f69`. `cd app && node build.mjs --v2 --preview-data --art=../src/v2/art/`
-> dist/v2.html (3736 KB, guard line "v2 guard: clean"). Sprites linked as app/dist/sp -> app/sp (345 files).
Pictures: `docs/rebuild/audits/outside-nov20/` (deviceScaleFactor 2, JPEG, labelled on the picture).

## Score: 16/20 (Good). Nov 17: 15/20. Nov 19: 16/20.

Same five areas, 0-4 each, as `audit-v199-nov17.md` (and `audit-nov19.md`).

| # | Area | Nov 17 | Nov 19 | Nov 20 | Main reason (how checked) |
|---|------|--------|--------|--------|---------------------------|
| 1 | Accessibility | 3 | 3 | 3 | Keyboard is clean: 40 Tab presses on 10 pages x day/night at 1440, 0 stops without a ring except the two search boxes (ring drawn on the box around them, dismissed on Nov 17), 0 hidden stops (kbd.cjs). Still: iPad top menu 36-43 px wide; about 10 text links 16-26 px tall on touch; text readable through both glass bars. |
| 2 | Speed | 3 | 3 | 3 | Not re-measured. Carried from first-visit-nov19.md (My Team 2.75 s on 4G vs 2.5 s goal). Unsure. |
| 3 | Colour and theming | 4 | 4 | 4 | Night looked finished on every night shot I opened (about 25 of 108). My own contrast script failed (it cannot see backgrounds drawn by pseudo-elements, so it reported false 1.2:1s); I stopped it and did not rely on it. So contrast is by eye only today. |
| 4 | Every window width | 2 | 3 | 3 | 0 sideways scroll, 0 page errors, 0 broken pictures in 216 loads (27 pages x 390/768/1024/1440 x day/night). But two new desktop text problems (F1, F2) and one tablet empty half (F5). |
| 5 | Finish and consistency | 3 | 3 | 3 | The new parts (Arena, KO Board tabs, My Team tabs, the Dispatch, the Gifts parcels) look studio-grade in both themes. What keeps it at 3: small consistency slips across pages (chip widths, link words, This Week's header, Track Record's bands). |

Why not 17: F1 and F2 are on the two pages a player uses most (My Team, Damage Calc) at ordinary laptop widths, and the
tablet/link tap sizes from Nov 17 are still open. Why not lower: nothing is broken, and every Nov 17 width band that failed
(700-780 buttons, 1100-1280 Track cards, Battle 1280) still passes.

Three things that are genuinely good:
- Damage Calc's Arena reads like a game screen at every width, and the KO Board tabs on phones (4 across, full names) work well.
- My Team on phones: the Matchups / Suggestions / Team Checks tabs make the page 2,693 px at 390 (3.2 screens), down from about 4 screens.
- News and Gifts: the paper and parcel looks hold in light and dark, and the phone versions are short (News 3,870 px, Gifts 3,668 px).

## How this was checked
- Sweep (scratchpad aud20/sweep.cjs): 27 pages (Object.keys(V2.pages) minus sheet, team-empty, coming, gallery, guide; plus
  owner and notfound) x 390x844 touch / 768 touch / 1024 touch / 1440 x day and night = 216 loads. Each page scrolled top to
  bottom first so lazy pictures load, then: scrollWidth vs clientWidth, page errors, pictures not loaded, font sizes off the
  scale, tap targets under 44 on touch widths, h1/h2 font. Full-page screenshots kept in the scratchpad.
- Results with no finding: sideways scroll 0/216; page errors 0/216; pictures that failed 0 (the 1-5 "not loaded" per page are
  lazy pictures in side-scrolling shelves; the files exist, checked with ls).
- My own eyes on about 70 screenshots and crops: every page at 390 day, the new parts at 768/1024/1440, night at 390 and 1440.
- Measured one by one: the Sneasler break (sneas.cjs, 10 widths), KO ladder cut lines (4 widths), hero fact gaps (bounding boxes).
- The repo's full check `app/test/qcheck-all.mjs` at 390,768,1024,1440 day and night: result at the end of this file.
- Not checked: real iPhone/iPad, Safari's engine, speed, a working contrast scan, every sheet and every state.
- Lesson for the next audit (measured): full-page screenshots on this site can show a different layout from the real
  window (the KO tiles went 6 across without names in a 2,451 px tall capture, 4 across with names in a real 844 px window).
  Every finding below was confirmed in a normal window, not a full-page capture.

## Findings

### P1 (a player will notice; fix before the switch)

**F1. My Team 1440: "Sneasler" breaks mid-word in Suggestion 1.**
- Page My Team, 1440 wide, day (night same layout). Shows "Sneasle / r" beside the arrow to Mega Floette.
- Measured (sneas.cjs, every single word that renders on 2+ lines on My Team): only at 1440 among 390/768/1024/1100/1180/1280/
  1366/1440/1600/1920; the name's box is 59 px wide. A longer name (e.g. "Basculegion") would break at more widths: my guess, not tested.
- The row also has a wide empty gap between "+1 / 94 -> 95" and the swap.
- Picture: `outside-nov20/f01-team-sneasler-break-1440-day.jpg`.
- Fix: never break a name inside a word (no overflow-wrap: anywhere on it) and give the swap row the empty space left of it.

**F2. Damage Calc desktop: the KO Board ladder cuts off the move on almost every row.**
- Page Damage Calc, KO Board open (the full-width ladder, Q58 C), day and night.
- Each row reads "your Mega Charizard Y's ..." and stops before the move. Measured, rows whose move line is cut:
  30 of 30 at 1024, 30 of 30 at 1280, 25 of 30 at 1440, 0 of 30 at 1920.
- The move is the point of the board ("your best hit on each"), so the player has to tap each row to learn it.
- Picture: `outside-nov20/f02-ko-ladder-moves-cut-1280-day.jpg`.
- Fix: drop "your" and "Mega" in the line ("Charizard Y · Heat Wave") or put the move first ("Heat Wave · Charizard Y").

### P2 (noticeable on a closer look)

**F3. Usage (and Meta) hero facts on phones: two numbers read as one.**
- Usage 390 day: "38.1% 48.0%"; labels "Usage rank Of teams Win rate" run together too. Meta 390: "37.6% 51.9% 120".
- Measured: the number boxes are 4 px apart (Usage 214-281 and 285-359; Meta 216-281 and 285-354).
- Note: Sim approved W4 (Nov 19, 8:40 AM: 4 px less gap at 360-420 so 'Base Speed' fit). This is what that left. Listed here
  because the numbers now touch; Sim may still prefer it.
- Picture: `outside-nov20/f03-usage-hero-facts-390-day.jpg`.
- Fix: put the three facts in a row under the sprite at full width on phones, or show 2 facts.

**F4. Tap targets still under 44 px on touch (C8). Most of these were already on Nov 17's list.**
- Measured in the sweep: iPad 768 top menu Build 36 x 44, Meta 37, Home 43, Battle 43 (54 loads each).
- Text links 16-26 px tall at 390/768/1024: "All Mystery Gifts ›" 108x16 (News), "Build Me a Team ›" 122x20 and "Import a Team ›"
  109x20 (My Team), "Set as Opponent ›" 126x20 (Test Run, 6 per page), "Compare ›" 74x20 (Winning Teams), "How It Works ›" 101x20
  (Build), "0 of 4 picked" 104x26 (Battle), "All Ratings ›" 92x20, "Every Pokémon, by tier ›" 168x19.
- iPad landscape (1024 touch, from qcheck-all): News headlines 21-30 px tall (5 links), Home's news card headlines 23-24 px.
- Not counted: the skip link (hidden until focused) and the logo (28x44, known).
- Picture: `outside-nov20/f04-tablet-menu-768-day.jpg`.
- Fix: the 44 px tap area the other action links already have; 12 px menu gap at 700-1099.

**F5. My Team 768 (iPad portrait): Suggestions runs about 1,000 px beside an empty right column.**
- Team Checks and Your Games end; Suggestions with Adjust Suggestions open goes on alone (rule: no empty halves).
- Picture: `outside-nov20/f05-team-768-empty-column.jpg`.
- Fix: at 700-1099 stack Team Checks and Your Games under Suggestions, or fold Adjust Suggestions as on desktop.

**F6. Text behind the glass bars can be read (C9), in Chromium.**
- 390: footer text "Game Freak; Pokémon names are trademarks of" reads through the bottom bar (f11 picture), and the KO Board
  title through it (f10). Top bar: "every account. Real codes never ask for" (Gifts, f13), "Rillaboom" (Usage), the Matchups names
  at 1440 (f01 source shot).
- Sim chose the glass (Nov 11: "i liked the glass", 92% opaque), so this is also in "already decided". Rule C9 still says never
  legible. Unsure how a real iPhone draws it (Nov 17 #10 asked for one look on Sim's phone).
- Fix: keep the glass, add more blur or a solid 100% bar under 700 wide.

**F7. Track Record shows the old rating groups and a row that reads as a contradiction (carried from Nov 17 #17).**
- 1440 day: "Rated 70-89 · 29 of 29 Pokémon made a top 8 · 8.7%", "Rated 90+ · 11 of 11 · 25%", groups 90 / 70-89 / 53-69 / under 53
  (the site's bands are 80 / 70 / 60). The % is "share of top-8 teams" while the line under says "29 of 29".
- Unsure: may come from the Preview's Nov 9 data having no "bands" stamp (Nov 17 note). Worth one check on today's data.
- Picture: `outside-nov20/f08-track-old-bands-1440-day.jpg`.
- Fix: label the % ("on 8.7% of top-8 teams") and confirm the bands on today's data.

**F8. Home on phones is taller than its limit (unsure the builds compare).**
- Measured: 6,527 px at 390 (7.7 screens of 844) on the Preview build. experiments/c13-check.mjs has 6,350 for Home 390
  ("measured 6,240 + margin, Nov 18, not Sim-agreed"); Sim's Nov 19 8:12 AM choice aimed at about 6.9 screens.
- Unsure: the Preview banner adds about 70 px and c13 may build without it. Run `c13-check` on this build to settle it.

### P3 (polish)

**F9. Usage podium on phones: "Mega Charizard / Y" wraps, so #5's numbers sit lower than #4, #6, #7.** 390 day.
  Picture `f06-usage-podium-rows-390-day.jpg`. Fix: "Charizard Y" with the Mega tag above, as on the Grandstand.
**F10. Home 1024: the Events and How We Calculate titles start at different x (367 vs 340 px), and More tools uses about a third of
  the row (x 47-392 of 1024, read off the picture) in 3 uneven columns.** Picture `f07-home-1024-more-tools.jpg`. Fix: one left edge; More tools in 6 equal columns.
**F11. Home 1024: "Same herd. Twelve / tools." leaves one word on the second line, with the right half empty.**
  Picture `f15-home-herd-1024-day.jpg`. Fix: break after "herd." as on phones.
**F12. Filter chips that don't fill their row or differ in width.** Events 390 ("All 115 / Official 8 / 100+ players 25": about
  45 px empty at the right), Gifts 390 ("All 7" much narrower than "Pokémon 4"). Pictures `f12-events-chips-390-day.jpg`,
  `f13-gifts-chips-390-day.jpg`. Fix: equal columns filling the row, as the Usage source chips now do.
**F13. This Week's header is built differently from the other three Tournaments pages.** Centred "This Week" title above the
  Pokémon / Tournaments tabs, eyebrow "Meta · last 7 days"; the others have the slanted two-line headline then the tabs.
  The tab bars themselves now match (Nov 17 #3 fixed). Picture `f14-thisweek-vs-tournaments-390.jpg`.
**F14. Same action, different words.** Events: "Show All 30 ›"; News: "All 30 Next Events ›". Usage: "3 more›" / "2 more›" (no
  space before ›) beside "Ratings ›". My Team: "Refresh Suggestions" has no › while its two neighbours do (Nov 17 #15).
  Meta: S/A/B shelves say "See All N ›", C says "10 Pokémon" (390). News masthead "50 stories in the past 12 months" beside
  "All 69 Stories ›" (both may be right; reads oddly).
**F15. Track Record 1440: "Week by Week" is one sentence ("once there are 3 weeks of events") under a big headline, with the
  right 60% empty.** Fix: fold it into How We Check until the chart exists.
**F16. Usage 1440: "Also ranked 61-100" is one long 13 px paragraph of 40 names.** Fix: the same fold it has on phones.

## Already decided by Sim (not counted in the score); listed because I think they still hurt a little
- KO Board ladder (Q58 C): with 18 / 8 / 4 rows, the right two columns are empty for most of the board's height at 1024-1440
  (f02 picture). Sim chose the ladder; F2 is the part that is not a choice.
- Centred lone last tiles (Sim, Nov 18 1:45 PM, Q1 A): Calc condition chips 3 + 2 at every width (`f10-calc-chips-390-day.jpg`),
  KO Board tab's last row 2 of 4 at 390 (`f09-ko-tiles-last-row-390-day.jpg`), Test Run's lone "4th place" at 1440.
- "Mirror" line on Matchups cards (Q20 A): it makes the first row uneven at 390 and 1440 (`f11-team-matchups-row-390-day.jpg`).
- Hero fact gap W4 (F3) and the glass bars (F6): see above.
- Arena scene the same picture in dark (Q49) and the headline chevron (Q30): fine to my eye.

## Checked and dismissed
- 10.8 px move names on Damage Calc 768: they are inside the closed "Your best hit on each top threat" fold; opened, they are 13 px.
- Calc h1 "Damage Calculator · level 50 doubles" in Instrument Sans 32 px: the hidden heading (Q54 Keep).
- Track Record's receipt heading in Instrument Sans: part of the receipt look, not a page headline.
- 1-5 pictures "not loaded" on Meta/Method/Archetypes: lazy pictures in side-scrolling shelves; files exist.
- My contrast script's 1.15-1.33 results on Home: backgrounds drawn by ::before; the tiles read fine on screen.
- Arena name plates sit across from their Pokémon at 390/768: the Pokémon games' own layout (foe plate top-left), intended.
- Full-page captures 398-402 wide at 390 (My Team, Winning Teams): the known screenshot quirk (Nov 17).

## Repo full check (qcheck-all.mjs, 390/768/1024/1440, day and night)
Command: `PAGE=app/dist/v2.html WIDTHS=390,768,1024,1440 node app/test/qcheck-all.mjs` (Chromium build 1148, 1269 s).
Result line: `qcheck-all: 27 pages + 18 views x 4 widths x 2 themes, 70 findings, 54 new; 1269s`.
Plain meaning: 54 findings are not in qcheck-known.json, but that list was recorded at 320/390/820/1280/1920, so most "new"
ones are simply at widths it never looked at (768/1024/1440). At 390, the one width both share, there are 0 new findings.
I looked at the new ones by eye:
- OVERLAP (Home 115/events, 13,631/tournament teams, Strength Score/94, The Champions/Dispatch; Gifts CONTENTS/name; News
  CAMPAIGN/headline; Type Chart headline): tight line boxes on slanted Unbounded text and tilted cards. On screen nothing touches
  (checked at 1024 Gifts, 1024 Home score card, 768 Type Chart, 1440 News). False alarms, same kind as the known calc ones.
- SIZE: Home 32.8 px "95/96/97" hero plates (1024) and 39.6 px "/100" (768), News 37.7 px masthead (768): fluid display sizes
  above 34 (display sizes are allowed by the scale); the 32.8 ones sit between 28 and 34. P3: pin the plates to 34.
- TAP (1024 touch, real): News headline links 21-30 px tall ("Season M-8 Battle Passes", "Ranked Battles...", "The Mega
  Evolution...", "Obtain a Vivillon..."), and the same links on Home's news card. Added to F4.
- OFFSCREEN (My Team, "Defense" view, 768, day and night): type chips (.ed-ty in sg2-fb > ty2) measured at x 704-785 in a
  768 window. I could not see them on screen (they sit in Suggestion 1's folded part). Unsure; worth a look with the fold open.

## Files
- Pictures: `docs/rebuild/audits/outside-nov20/f01-...` to `f15-...` (labels on each picture).
- Scripts and the 216 full-page shots are in the session scratchpad (`aud20/`), not committed (size).
