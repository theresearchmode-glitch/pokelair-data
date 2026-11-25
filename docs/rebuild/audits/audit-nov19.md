# Fresh-eyes audit of the new site (claude/design6 at a100ec7b)

Written Wed Nov 18, 2026, 9:13 PM Eastern by `docs/rebuild/now.sh` (the file is named nov19 as the brief asked).
Built page: `cd app && node build.mjs --v2 --preview-data --art=../src/v2/art/` -> app/dist/v2.html (3753 KB, guard line "clean"),
sprites linked as app/dist/sp -> app/sp. Look-only: no code changed. Pictures: `docs/rebuild/pics/nov19/audit-*.png`
(each one carries its finding number, page, width and theme on the picture).

## Score: 16/20 (Good), up from 15/20 on Nov 17

Scored on the same five areas, 0-4 each, as audit-v199-nov17.md.

| # | Area | Score | Main reason (measured unless marked) |
|---|------|-------|--------------------------------------|
| 1 | Accessibility | 3 | Keyboard is now good: Remove moves focus to "+ Add Spot 5", Apply to "Undo", Esc returns focus to "Why This Score? ›" (kbd test at 1280). Still: iPad top menu links 36-43 px wide (finding 10); hero tagline 3.1:1 (finding 8). |
| 2 | Speed | 3 | Suggestions ready 1.9 s (390) / 2.1 s (1280) on this machine; 5.9 s / 8.6 s with the CPU slowed 4x like a phone. Unsure: another browser job was running, so these are upper bounds. Not a full speed audit. |
| 3 | Colour and theming | 4 | Day and night both finished on every page I looked at (29 pages x 3 widths x 2 themes). No new contrast problem except the hero tagline. |
| 4 | Every window width | 3 | 0 sideways scroll, 0 page errors, 0 broken images in 204 loads (29 pages x 390/820/1280 x day/night, plus 15 pages at 320 and 1920). Last audit's 700-780 button clash and Battle's empty desktop half are fixed. Still some half-empty spots (findings 13, 14). |
| 5 | Finish and consistency | 3 | Feels like one product, and most of last audit's words are fixed. But the same number is told differently in several places (findings 1-6): this is now the weakest area. |

How the 16 compares: areas 1, 2, 3 and 5 hold their Nov 17 scores (3, 3, 4, 3); area 4 goes from 2 to 3 because the three
width bands that broke on Nov 17 (My Team buttons at 700-780, Track cards at 1100-1280, Battle at 1280) now pass, checked by
screenshot at 740 and 1280. Nothing went down. It is not higher because findings 1-6 are a real "two statements that disagree"
problem (rule C3) on the pages a player trusts most.

Genuinely good (3 lines):
- A new player can do the whole loop on a phone with no dead ends: sample team, score, Why This Score (88 + 1 + 3 = 92, adds up), suggestions, Apply, Undo, Remove, Undo, all with one toast and one Undo each.
- No sideways scroll, no page error, no broken picture in 204 page loads; keyboard focus lands in the right place after every action I tried.
- Night mode is as finished as day; Battle, Meta Grandstand and My Team now use desktop width well (1280 and 1920).

## How this was checked
- Sweep (scratchpad sweep.cjs): 29 registered pages x 390, 820, 1280 x day and night = 174 full-page screenshots and measurements
  (height, scrollWidth vs clientWidth, page errors, console errors, broken images); then 15 main pages at 320 and 1920, day (30 more).
- New-player flows at 390, day (flow.cjs): open My Team, tap a card, Remove, Undo, Remove again, Suggestions, Apply, Undo.
- Sheets at 390 (sheets.cjs): Why This Score?, More, Share as Image, Saved Teams, Import a Team, See All Suggestions, Things to Know,
  Log a Game, Enter Their Six, Team Preview Practice. Each opened, screenshot, then Esc: 0 sheets left open, focus inside each sheet.
- Keyboard at 1280 (kbd.cjs): focus after open card, Remove, Apply, and after closing a sheet.
- Suggestions timing (sugtime.cjs), with and without 4x CPU slow-down.
- The repo's own full check, app/test/qcheck-all.mjs (320, 390, 820, 1280, 1920, day and night, every page and view): result in the last section.
- Then my own eyes on about 60 screenshots and crops.
- Not checked: Safari's engine (no WebKit browser on this machine), real iPhone/iPad, 360/430/600/1024/1100/1440 widths except where named.

False alarms set aside (checked):
- Share as Image said "Could not draw the image in this view." from file://. Served over http (python http.server) it draws the card. A file:// quirk.
- Missing pictures in full-page screenshots (Home "Popular Sets" tile, This Week "New in Top Cut"): lazy-loaded; scrolled into view they load (all 4 New in Top Cut images naturalWidth 347-384).
- Console "Access to font ... blocked" on every load: file:// origin null. Not a site bug.
- scrollWidth 1265 vs clientWidth 1280 at 1280/1920: the desktop scrollbar, not overflow.

## Findings, most important first

### 1. Pokémon page and Usage tell two different stories for the same Pokémon's set (certain both show; medium-high)
- Where: Pokémon page (#pokemon=sneasler), "How to build it", 1920 and 1280, day (night the same text). Usage (#usage), "How Sneasler is played", 1280.
- What: on the Pokémon page the Typical set says Item **White Herb (or Focus Sash)**, while the Items list right beside it ranks
  **Psychic Seed 30%, Grassy Seed 29%, White Herb 23%**. The Moves list says Dire Claw 91%, Protect 64%, Fake Out 59% ("in-game ranked battles").
  Usage shows the same Pokémon as Protect 78%, Dire Claw 73%, Fake Out 42%, White Herb 41%, Focus Sash 19% "of 3,130 teams", with no source named.
  The "Usually" chips are also out of order (Fake Out 59% before Protect 64%).
- Why it matters: C3 (two statements that disagree, on one screen); CLAUDE.md "Sets on teams" (the popular set must agree with established
  sites and disagreements get explained). A player can't tell which item to run. The likely cause is three sources (tournament sets, ranked
  ladder, Showdown) shown side by side with the source only in 13 px grey under one list. Unsure which one each block reads; I did not trace the code.
- Pictures: `audit-01-pokemon-build-sources-1920-day.png`, `audit-01b-usage-howplayed-1280-day.png`.
- Fix idea: name the source on every list ("Tournament sets" / "Ranked ladder"), or show one source per block, and sort the chips.

### 2. My Team says "Nothing to fix", but All Suggestions lists a suggestion with Apply as the main button (certain; medium)
- Where: My Team, sample team (Sun Tailwind, 92), 390 day; same text at 1280.
- What: Suggestions says "**Nothing to fix.** Your team has every basic and no swap clearly beats it". "See All Suggestions ›" opens a sheet
  titled "**1 suggestion**": swap your S-tier 97 Sneasler for Mega Floette, "**±0 92 → 92**", with a big black **Apply**.
  Last audit's #15 ("Nothing to fix" beside "7 weak spots") is also still there, and "Refresh Suggestions" still has no "›".
- Why it matters: C3 and C4 (a button louder than what it does: the main button on a change that does nothing). A new player may apply it
  and lose their best Pokémon for no gain.
- Picture: `audit-02-nothing-to-fix-vs-1-suggestion-390-day.png`.
- Fix idea: the sheet says "No change beats your team; these are sideways options", and a ±0 swap gets a quiet button.

### 3. Filling an empty spot is called "a small change: real games can't tell it apart from what you have" (certain; medium)
- Where: My Team, 390 day, after Remove Garchomp (5 of 6). Suggestion 1 = add Mega Camerupt to spot 5.
- What: the label "Option · a small change: real games can't tell it apart from what you have" is the sideways-swap wording, used on an add
  to an empty spot. The card's left half (the "out" side) is empty, so the add sits at the right edge.
- Why it matters: C3 (the words disagree with what the card does); "using space well". A player with 5 Pokémon is told the 6th doesn't matter.
- Picture: `audit-03-empty-spot-small-change-390-day.png`.
- Fix idea: adds get their own line ("Fills spot 5"); the add card uses the full width.

### 4. Damage Calc: the KO Board captions don't match the tiles under them (certain, measured; medium-low)
- Where: Damage Calc (#calc), 1280 day (the side wings are hidden on phones).
- What: left wing caption "THE KO BOARD · 18 DOWN IN ONE HIT" sits over 15 tiles; right wing "8 CAN GO DOWN · 4 SURVIVE" sits over 15 tiles,
  3 of which carry a KO badge. Measured in the DOM: `.dc2-wing` left 15 buttons, right 15 buttons with 3 "KO".
  The 30 threats are split 15/15, but the captions count 18/12.
- Why it matters: C3 (a count that does not match the list under it).
- Picture: `audit-04-calc-koboard-counts-1280-day.png`.
- Fix idea: split the wings 18/12 like the captions, or caption each wing with what it holds.

### 5. Usage: "gives no percentages" next to percentages (certain both show; unsure it confuses; medium-low)
- Where: Usage, 820 and 1280, day and night.
- What: source "Ranked ladder" is selected; the line reads "The ten most used, in order. This list ranks them; it gives no percentages."
  The hero card above still shows "Of teams 38.3%" and "Win rate 51.9%" (tournament numbers; same as Meta). The empty My Team page
  shows "35.6% of ladder teams" for the same Sneasler.
- Why it matters: C3; word list (data sources are always Official events / Online tournaments / Ranked ladder / Showdown ladder:
  each number should say which).
- Picture: `audit-05-usage-source-vs-percent-820-day.png`, and `audit-16-empty-team-winner-390-day.png`.
- Fix idea: a small source line under the hero stats ("Online tournaments"), or the hero follows the source chip.

### 6. Track Record still uses the old rating groups (certain on this Preview data; medium-low)
- Where: Track Record (#track), 1280 day (all widths).
- What: "Rated 90+ / 70-89 / 53-69 / Under 53", "11 of 11 Pokémon made a top 8" beside 27%. Meta uses S 90+, A 80+, B 70+, C 60+, D 50+.
  Same as last audit's #17. It was expected to fix itself with new data; on today's Preview build it has not.
- Why it matters: C3 across pages; word list (one name per idea).
- Picture: `audit-06-track-old-groups-1280-day.png`.
- Fix idea: confirm whether the live data carries the "bands" stamp; if not, the page should read the 90/80/70/60/50 groups itself.

### 7. Events: the first "Recent" link is centred, the other two are left-aligned (certain; low but very visible)
- Where: Events (#events), Next Events card, 390 day (night the same).
- What: "Buenos Aires Special Championship Results ›" wraps to 2 lines and is centred; "Gdańsk Regional Results ›" and
  "Puebla Regional Results ›" start at the left edge.
- Why it matters: C11 symmetry; Sim's eye for alignment.
- Picture: `audit-07-events-recent-centred-390-day.png`.

### 8. Home hero: "your win rate." is hard to read over the crowd (certain on the number; medium)
- Where: Home, all widths, day (night uses the same colours: `--sd-line2:#9BDCFF` on `--sd-hero`).
- What: light blue #9BDCFF on #0078BF is 3.1:1 (my calculation, WCAG formula), the bare minimum for large text, and the sprite crowd
  runs behind the letters, so parts of "win rate" sit on white and yellow sprites. At 1280 and 1920 the line is the first thing a visitor sees.
- Why it matters: rule 0b (usability first, keep the WOW but never at the cost of reading); CLAUDE.md tagline. Unsure whether Sim has
  already approved this exact look; the polish sweep of Nov 18 night noted the sprites covering it at 1440.
- Picture: `audit-08-home-hero-tagline-1280-day.png`.
- Fix idea: a darker band or soft scrim behind line 2 only, or the crowd kept below the tagline's baseline.

### 9. My Team action group is lopsided, and "Top 1%" is said three times (certain; low-medium)
- Where: My Team, 390, 820, 1280, 1920, day and night.
- What: "Saved ✓" is plain text in the grid's first cell; the other three cells are outlined buttons. At 1280 "Top 1% of tournament teams"
  shows in the strip, in the text and (night/day) again near the score; "Team Sheet ↗" shows twice (last audit #22, unchanged).
- Why it matters: C11 symmetry; say it once.
- Picture: `audit-09-team-actions-asym-390-1280-day.png`.

### 10. iPad top menu links are still under 44 px wide (certain, measured; low-medium)
- Where: header, 820 and 1024, touch. Day and night.
- What: Build 36 px, Meta 37, Home 43, Battle 43 (all 44 tall); 8 px gaps at 820. Same as last audit's #11; not fixed.
  At 820 there is a Back arrow but no Forward arrow (1024 has both).
- Why it matters: C8 (44x44 on touch widths); rule 0b. Sim tests on iPad.
- Picture: `audit-10-header-820-day.png`.

### 11. Battle "Your Six" is in a different order from My Team, and one tile is taller (certain; low)
- Where: Battle, 820 and 1280, day.
- What: My Team (Lead / Back / Bench): Charizard Y, Garchomp, Whimsicott, Sneasler, Basculegion, Kingambit.
  Battle: Charizard Y, Whimsicott, Basculegion, Kingambit, Garchomp, Sneasler. At 820 "Mega / Charizard Y" wraps, so its tile is taller.
- Why it matters: C11; a player planning leads sees their six reshuffled.
- Picture: `audit-11-battle-yoursix-820-day.png`.

### 12. Home tools: "Twelve tools" and empty bands in the tiles (certain; low)
- Where: Home, "Same herd. Twelve tools.", 1280 day (also 820).
- What: the 12 big tiles include How We Calculate (a page, not a tool), then "More tools" lists 6 more. Damage Calc has about 100 px of empty
  tile above its picture; Winning Cores, Archetypes and Popular Sets have tall empty middles. (The polish sweep of Nov 18 night reported the
  Damage Calc and Test Run bands; still present.)
- Why it matters: C3 (count); using space well.
- Picture: `audit-12-home-tools-gaps-1280-day.png`.

### 13. Winning Teams at 820: "Your Team" card leaves its right half empty (certain; low)
- Where: Winning Teams (#tournaments), 820 day.
- What: the 4/4 checks, tags, names and six fanned cards all sit in the left half; the right half of the card is blank.
- Why it matters: using space well (no half-filled rows).
- Picture: `audit-13-winning-yourteam-820-day.png`.

### 14. Usage "How Sneasler is played": two of four columns end after 3 rows (certain; low)
- Where: Usage, 1280 day.
- What: Moves has 8 rows, Items 5, Abilities 3, Natures 3; the space under Abilities and Natures stays empty.
- Why it matters: using space well. (A decisions.md note of Nov 16 packed Natures beside Moves at three columns; at four columns it isn't.)
- Picture: `audit-14-usage-howplayed-space-1280-day.png`.

### 15. Speed Tiers chips: half the first phone screen, and "Sun" offered twice (certain; low)
- Where: Speed Tiers, 390 day.
- What: 12 chips take about 380 px. "Your Weather (sun)" is selected and "Sun" is also a chip. Last audit's #12, partly changed.
- Picture: `audit-15-speed-chips-390-day.png`.

### 16. Empty My Team: "Or Start from a Winner" shows six top-rated Pokémon, not a winning team (certain; low)
- Where: My Team with no team (#team-empty), 390 day.
- What: the heading promises a winner; the grid is "Today's six highest-rated Pokémon". Its numbers are "% of ladder teams", while every other
  Pokémon card on the site says "of teams" from tournaments.
- Why it matters: C3; first experience for a brand-new January visitor.
- Picture: `audit-16-empty-team-winner-390-day.png`.

## Known items, re-checked (not counted as new)
- Height overs on Battle, Usage, Meta: page heights measured in this run (day): Home 7.5 phone screens at 390 and 6.0 at 820; Events 5.7; This Week 5.8;
  My Team 4.0 (390) and 5.4 at 320; Meta 3.9; Usage 4.4; Battle 2.3. I did not compare these to the C13 limit table.
- iPad (820) My Team reshuffle on Remove: not re-tested.
- Grandstand alignment: looks fixed at 820 and 1280 (Hisuian Arcanine wraps, its number still lines up).
- Last audit fixed and seen fixed: #1 My Team buttons at 740; #3 Meta tab bar (now two lines on every Tournaments page); #5 Battle desktop; #13 Grandstand;
  #14 hero stat labels on one line; News "Copy Code" (polish sweep #1) now shows in full.
- Last audit still open: #11 taps (finding 10), #15 and #22 (findings 2 and 9), #17 (finding 6), #21 Compare starts with both sides empty.

## Notes for the main thread (not findings about the site)
- CLAUDE.md in this branch still says Darkrai is on the empty My Team (Nov 9) and "never red" for the score bands. START-HERE (Nov 11 note:
  Darkrai cut) and tokens.css (Nov 13: red allowed for Missing a basic) say otherwise. The site follows the newer decisions; CLAUDE.md is stale.
- Safari's engine was not tested here (no WebKit build on this machine).

## qcheck-all result
Command: `PAGE=app/dist/v2.html WIDTHS=320,390,820,1280,1920 node app/test/qcheck-all.mjs` (Chromium 131, file://).
Result line: `qcheck-all: 26 pages + 19 views x 5 widths x 2 themes, 189 findings, 6 new; 1631s` (exit code 1, because of the 6 new).
The 6 new are all Home text-box overlaps, day and night alike:
- 1280: "Incineroar" x "96" (hero plate); 1920: "Your Strength Score" x "92" (receipt); 820: "15,732" x "tournament teams" (tools strip).
- Looked at by eye on screenshots: none of the letters touch. They are line boxes of the big slanted numbers, the same kind as the 36 Home
  findings judged and listed on Nov 18 (commit 612174dd). False alarms in my judgement, but they turn the check red: the known list needs
  these 6 added (after the main thread's own look), or the GitHub qcheck job will likely fail too (unsure: GitHub's machine measured 1 px differently before, Nov 17). "15,732" over "tournament teams" at 820 is tight
  (about 2 px), worth one look by Sim's eye.
- "(6 known findings no longer seen: remove them with KNOWN=write after a look)": 6 old entries are now clean.
