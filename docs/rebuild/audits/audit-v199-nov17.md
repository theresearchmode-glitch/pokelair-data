# Fresh-eyes audit of the rebuild (build from claude/design6, Nov 17)

Built page: `node build.mjs --v2 --preview-data` -> app/dist/v2.html (3429 KB, guard line "clean").
Look-only. Nothing in the repo was edited or committed.

## Score: 15/20 (Good)

| # | Area | Score | Main reason |
|---|------|-------|-------------|
| 1 | Accessibility | 3 | Focus rings now show (0 controls without one on 7 pages); contrast clean. Some taps still small (iPad menu 35 px wide, a few links 20-26 px tall). |
| 2 | Speed | 3 | Not re-measured in this run. Carried from the Nov 17 speed work. Unsure. |
| 3 | Colour and theming | 4 | Light and dark both look finished. No text under 4.5:1 on solid colour in 23 pages x 2 themes. |
| 4 | Every window width | 2 | No sideways scroll anywhere (432 page loads). But text runs out of its box in 3 width bands (700-780, 1100-1280, 1280), and two desktop pages leave an empty half. |
| 5 | Finish and consistency | 3 | Feels like one product. Same control looks different page to page; a few numbers and words disagree. |

Verdict:
- Big step up from 14/20 and 11/20 (Nov 16): no page errors, no sideways scroll, focus fixed, titles per page.
- What's left is mostly "in-between widths" (iPad split view, small laptop windows) and consistency.
- Nothing is broken for a phone player; a sharp eye still finds about a dozen things.

## How this was checked
- 24 routes x 9 widths (320, 390, 700, 768, 1024, 1100, 1280, 1366, 1920) x day and night = 432 page loads.
  Chromium, full-page screenshots in `sweep/`, measurements in `sweep.json`.
- Script checks per load: sideways scroll, cut text, text on text, font sizes off the scale, tap size (touch widths),
  headline font, line height, broken images, unnamed buttons, page errors.
- Contrast scan (390, day and night, 23 pages). Keyboard focus check (7 pages, 45 tab stops each, day and night).
- Safari engine (WebKit, iPhone 13) on 9 pages. Phone flows: Enter Their Six, Import a Team.
- Then my own eyes on about 70 screenshots.
- Results with no finding: sideways scroll 0/432, page errors 0/432, broken images 0, buttons with no name 0,
  font sizes off the scale 0, paragraph line height off 1.5: 0.

## Findings, ranked by how much a real player would notice

### 1. My Team buttons: words run through their slanted borders at 700-780 wide (certain)
- Page: My Team, the Share as Image / Saved Teams / More group. Day and night.
- "Share as Imag|e" and "|Saved Teams 1|" cross the slanted edges at 700 and 740; near-touch at 780.
- This is iPad split view and small windows. Measured on screenshots at 640-1100.
- Pictures: `f-team-actions-widths.png` (640 to 1100, top to bottom), `f-team-actions-700-day.jpg`, `f-team-actions-700-night.jpg`.
- Fix idea: in this band, stack the 4 actions in one column under the score, or shorten "Share as Image" to "Share".

### 2. Track Record cards: text crosses the dashed tear line into the "Rated" column at 1100-1280 (certain)
- Page: Track Record, "The Calls" cards. Day (night same layout).
- Measured gap from text to the Rated column: -15 to -46 px at 1100 and 1180, -14 px at 1280.
  Fine at 390-1024 and 1366+.
- "Called It" stamp also wraps to "CALLED / IT" on some cards and not others, and crosses the tear line.
- The card says "Rated 94" twice (in the text and in the big number).
- Pictures: `f-track-card-1180.png`, `f-track-card-1280.jpg`.
- Fix idea: in 1100-1300, put the Hits and Misses columns one above the other, or drop "Rated N ·" from the text line.

### 3. Meta's Tournaments tabs change shape from page to page on phones (certain)
- Pages: Winning Teams vs Events / Archetypes / This Week, at 390. Day.
- Same tab bar: one line on Winning Teams, two lines ("Winning / Teams", "This / Week") on the other three.
  The bar jumps in height as you switch tabs.
- Picture: `f-meta-subtabs-390.png`.
- Fix idea: one rule for all four pages (one line with smaller padding, or always two lines).

### 4. The Pokémon / Tournaments tabs sit in a different place on each Meta page (certain)
- This Week: tabs at the very top, above the headline.
- Events: tabs under the hero and under the Next Events card (about 1.3 phone screens down).
- Ratings, Usage, Sets, Winning Teams: tabs under the hero.
- Screens: `sweep/weekly_390_day.s0.jpg`, `sweep/events_390_day.s0.jpg`, `sweep/meta_390_day.s0.jpg`.
- Fix idea: same spot on every Meta page, right under the headline block.

### 5. Empty desktop halves: Battle and the Home headline (certain)
- Battle at 1280: right half empty beside "Their Six" (x 300-1170). At 1920, "Your Games" floats far right with a wide gap.
- Home at 1280: right of "Sharply raise your win rate." is empty (about 520 x 300 px). 1920 is fine
  (intro and buttons move to the right there).
- Screens: `sweep/battle_1280_day.jpg`, `sweep/battle_1920_night.jpg`, `sweep/home_1280_day.s0.jpg`.
- Fix idea: Battle: Their Six on the left, Your Games on the right from 1100 up. Home: use the 1920 layout from about 1180 up.

### 6. Home "Your Corner" tiles: "Lead" is cut off at 1280 (certain)
- Page: Home, Garchomp tile shows "Choice Scarf · Leac" (the slanted tile edge cuts it).
- Charizard's "Lead" wraps to a 2nd line beside it, so the two lead tiles don't line up.
- Measured: "Lead" ends 5 px from the tile edge at 1280. Also wraps on 2 lines at 700-1180.
- Picture: `f-home-lead-clip-1280.jpg`.
- Fix idea: show "Lead" as the tile's underline label (it already has a blue underline), not after the item.

### 7. Speed Tiers says "top 20" in the headline and "top 30 threats" in every line under it (certain)
- Page: Speed Tiers. Headline "Your six vs the top 20." The six summary lines: "outspeeds 55% of the top 30 threats".
  Rendered text: "top 20" once, "top 30" six times.
- Screen: `sweep/speed_1280_day.jpg`.
- Fix idea: count against the same 20 shown on the track, or say "of the top 30 (20 shown)".

### 8. "Rated" counts disagree: 345 vs 321 (certain that both show; unsure it confuses players)
- Meta: "345 rated". Sets hero: "Rated 94, #5 of 321". Pokémon page: "#7 of 321 with results".
- How We Calculate explains 321 = Pokémon with tournament results. The pages that show it don't.
- Screens: `sweep/meta_390_day.s0.jpg`, `sweep/sets_390_day.s0.jpg`.
- Fix idea: Meta says "345 rated · 321 with results", or the rank line says "of 321 with results" everywhere.

### 9. Source chips don't fill the row, and selected words touch the slanted edge (certain)
- Usage (Ranked ladder / Online tournaments / Showdown ladder) and Popular Sets (Best data / Tournaments / Showdown), 320-430.
- About 80-90 px empty on the right; each label wraps to 2 lines on Usage; "Ranked" and "Best data" touch the slant.
- Wording: Sets says "Tournaments / Showdown"; the word list says data sources are always
  "Online tournaments / Showdown ladder".
- Picture: `f-usage-sources-phone.png`.
- Fix idea: 3 equal columns filling the row; Sets uses the word-list names.

### 10. Text behind the phone bottom bar can still be read (unsure)
- Rule C9. In the Safari engine (iPhone 13), "Top of the format", "Solar Beam", "33–39%", "126–149%" read clearly
  through the bar. In Chromium it's fainter but "No games logged yet..." still shows.
- Unsure: headless WebKit may not blur like a real iPhone. Worth one look on Sim's iPhone.
- Pictures: `f-webkit-bar-meta.png`, `f-webkit-bar-calc.png`, `f-webkit-bar-team.png`, `f-chromium-bar-battle.png`.
- Fix idea: 100% bar colour on touch screens (keep the glass on the header only).

### 11. Small tap targets on iPad and phones (certain, measured)
- Top menu at 700-1024 (iPad, touch): Build 35 px wide, Meta 36, Home 42, Battle 42 (44 needed).
  Menu gap is 8 px at 700-899, so it also looks crowded (`f-header-tablet.png`).
- Build "How It Works ›": 101 x 20 px at every touch width.
- Battle "0 of 4 picked": 103 x 26 px at every touch width.
- Damage Calc at 1024: "How the Calc Works ›" 150 x 20, Swap 75 x 31.
- Type Chart at 320: your-team buttons 41 px wide. Events at 320: "All 113" chip 43 px wide.
- Logo link 28 px wide at 320/390 (it is 44 tall).
- Fix idea: same 44 px tap area the other action links already got; menu gap 12 px with 4 px side padding on each link.

### 12. Speed Tiers: two sizes of the same chip, and a half row (certain, measured)
- Condition chips (Your Tailwind, You +1...) 15 px text; weather chips (No Weather, Sun...) 13 px. Same control, both 44 px tall.
- At 320 the chips take about 400 px (half the first screen) and end on "Sand, Snow" with an empty third slot.
- Screen: `sweep/speed_320_day.s0.jpg`.
- Fix idea: one chip size; weather as one "Weather: Sun ▾" chip on phones.

### 13. Meta Grandstand rows don't line up (certain)
- Names that wrap ("Hisuian Arcanine", "Alolan ...") or carry the Hidden Gem ◆ on its own line push their number down.
  Seen at 390 and 1280 (A, C and D shelves).
- Screens: `sweep/meta_1280_day.s1.jpg`, `sweep/meta_390_day.s1.jpg`.
- Fix idea: ◆ inline before the name; reserve 2 name lines on every shelf item.

### 14. Hero stat labels wrap unevenly on phones (certain)
- Meta and Usage heroes at 390: "On / tournament / teams" (3 lines) beside "Win rate" (1 line) and "Base / Speed" (2).
  Numbers end up on different lines. Sets hero the same.
- Screens: `sweep/meta_390_day.s0.jpg`, `sweep/usage_390_day.s0.jpg`.
- Fix idea: shorter label ("of teams"), or stats in a row under the sprite at full width.

### 15. My Team: "Nothing to fix" next to "7 weak spots" (certain both show; unsure it confuses)
- Suggestions: "Nothing to fix. Your team has every basic..."; Team Checks: "Things to Know · 7 weak spots".
  A new player may read these as disagreeing (rule C3).
- Below: "See All Suggestions ›", "Never Suggest ›", "Refresh Suggestions" stacked with big gaps; the last has no "›".
  (The All Suggestions sheet itself is a known open question; this is the link list.)
- Screen: `sweep/team_390_day.s2.jpg`.
- Fix idea: "Nothing to swap" (not "fix"); the three links in one row.

### 16. Word list slips (certain)
- My Team "Your Games": "After 5 logged games, Build for Me weighs..." The button everywhere says "Build Me a Team".
- "Count abilities?" (My Team) and "Rising items, moves and abilities" (This Week): "Abilities" is capitalised everywhere else.
- How We Calculate: "advice in the checklist" (word list: Team Checks, not checklist).
- Test Run: "Matchup prep ›" (not a page name; it opens Battle?). Unsure where it goes.
- Fix idea: one pass on these four strings.

### 17. Track Record shows the old rating groups in the Preview (unsure)
- Shows "Rated 90+ / 70-89 / 53-69 / Under 53". Player review 3h says the page reads the new 80/70/60 groups
  from a "bands" stamp; the Preview's saved data (Nov 10) has no stamp, so it falls back. Will likely fix itself with
  new data. Also "29 of 29 Pokémon made a top 8" beside "8.6%" reads oddly (100% vs 8.6%).
- Screen: `sweep/track_1280_day.jpg`.
- Fix idea: confirm on the next data day; label the line "of them made at least one top 8".

### 18. Pokémon page at 768: narrow centred card with empty sides (certain)
- Hero card about 360 px wide in a 670 px column; forms strip fills only 3/4 of the row.
- Picture: `f-pokemon-768-top.jpg`.
- Fix idea: card on the left, rating block on the right from about 700 up.

### 19. This Week "Most Used": 3 + 2 tiles that overlap at the edges (certain)
- 390: three slanted tiles overlap each other's corners, then a row of 2.
- Screen: `sweep/weekly_390_day.s1.jpg`.
- Fix idea: 2 + 2 + 1 is worse; try a 5-row list like "Pokémon on the Move", or a 5-wide strip of smaller tiles.

### 20. Phone bar: the current page's label sits lower than the others (certain it shows; unsure if intended)
- The active label (e.g. "Battle") is about 10 px below the other four on every phone screenshot.
- Picture: `f-chromium-bar-battle.png`.
- Fix idea: keep the blue mark above without pushing the label down (all five on one baseline).

### 21. Compare Teams empty state talks about rows that aren't there (certain)
- "Every row below is worked out the same way as on My Team", with nothing below.
- Common task needs 2 picks even though My Team is the obvious Team A.
- Screen: `sweep/compare_390_day.jpg`.
- Fix idea: start with My Team as A; drop "every row below" until both are picked.

### 22. Small polish (certain unless marked)
- My Team at 1024: the intro line "...how NastyPlot / works. Build Me a Team › Import a Team ›" has a bigger gap
  before its 2nd line (the 44 px link area stretches the line). Same in Safari.
- My Team at 1280: "Team Sheet ↗" shows twice (header and tab bar); "Top 1% of tournament teams" twice (strip and text).
- Build: "Build around a Pokémon · optional" label plus "Optional" placeholder.
- My Box at 390: names at 75% width and -0.26 px spacing, 13 px (hard to read for kids; unsure it's a problem);
  the box panel sits 8 px from the screen edge where everything else uses 16 (likely deliberate).
- Home "Everything NastyPlot does" at 1280: 5 / 5 / 4 / 4 links (last row of two columns short).
- Style guide page still says the sample team scores 91; My Team shows 93 (page is hidden at launch).

## Known items not re-reported
My Team phone length and Remove needing a scroll; sprite file size; All Suggestions sheet layout;
Damage Calc number/label line boxes (the script did flag them at 1100+, as expected); centred lone tiles (kept by Sim);
Battle "Their Six" tap-to-pick grid (player review 4a, planned); About page's Claude-account wording (3i, for Sim).

## Checked and dismissed
- Full-page screenshots at 390 came out 398-402 wide on My Team, Winning Teams, Pokémon page. Probe: scrollWidth 390 at every
  scroll position, html/body overflow-x: clip. A screenshot quirk, not sideways scroll.
- Meta search box "no focus ring": a quirk of my script. Direct test: focus-visible true, ring drawn (Meta, Winning Teams,
  Type Chart, Build).
- How We Calculate "01-10" numbers at 1:1 contrast: outline numbers, decorative.
- Pokémon page h1 "cut" (clientWidth 1): the name shows correctly on screen.
- Safari-engine "Origin null" errors: from opening the file directly (fonts); not a site bug. Fonts fell back in that run,
  so Safari font rendering was not judged.
- "Showdowntier" on Meta: the real site's name, not glued words.

## Files
All in this folder: `f-*.png/jpg` (finding pictures), `sweep/` (432 full-page screenshots, `<route>_<width>_<theme>.jpg`;
`.sN.jpg` are tall pages cut into parts), `sweep.json` (all measurements), `text.json` (page text), `flow/`, `crop/`.

Note for the main thread: `git status` shows `app/test/v2-minors.mjs` modified and `app/src/v2/zz-b.html` untracked.
Neither is mine (this audit wrote only zz-audit* files, now deleted). Probably another session's work in progress.
