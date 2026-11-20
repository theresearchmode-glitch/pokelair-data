# Site scan of the new design (Nov 20)

Written Fri Nov 20, 2026, 8:39 AM Eastern (time from `docs/rebuild/now.sh`). Look-only: no site code or tests changed.
Asked by Sim: polish, missing good-to-have features, usability friction, off concept, not NastyPlot enough, too boring.

Built page: t1rules `71d21dd3`, frozen data `out/` from `0c992f69`, Preview build
(`node build.mjs --v2 --preview-data --art=../src/v2/art/`, Chromium 1148): "v2 guard: clean", dist/v2.html 3736 KB.
Served over local http (file:// blocks the fonts). Sprites linked beside the page (345).
Pictures: `docs/rebuild/pics/nov20/scan/` (deviceScaleFactor 2, webp, each under 210 KB).

Not re-reported: everything in `outside-audit-nov20.md` and the fixes already in progress (Build/Import gap 700-819,
44 px headline taps, My Team 700-1099 layout, Home iPad, podium MEGA tag, chips, "3 more ›", "29 of 29", first-visit lengths).

## How this was checked
- Viewport screenshots (not fullPage), scrolled screen by screen: 25 pages at 390 day and night, 768, 870, 1024, 1440 day
  and night, 1920; a brand-new visitor and a filled team (Garchomp, Kingambit, Sneasler, Basculegion, Archaludon, Azumarill)
  on My Team, Calc, Battle, Practice, Test Run, Compare. About 560 screenshots, looked at by eye in contact sheets.
- Every load: 0 sideways scroll, 0 page errors, 0 console errors (all widths, both themes). Plain meaning: nothing broken.
- Flows used by script with taps: Build Me a Team, Import (Showdown paste), Calc defender change, Battle "Enter Their Six",
  Search (a hit and a miss), empty My Team, page not found, unknown Pokémon.
- DOM measures: headline fonts (every h1/h2 is Unbounded slanted except the two already dismissed on Nov 20), sprite sizes.
- Other sites checked (web, today): ChampTeams.gg landing page, VGC Multi Calc, Pikalytics calc page, MetaVGC home,
  Victory Road replica-teams page (search result), a Reddit post about PokeFeed (rental-code sharing).
- Not checked: real iPhone/iPad, Safari, speed, contrast, every sheet and state, keyboard.

## Phone page lengths at 390 (screens of 844 px, new visitor, measured)
Home 7.73 (limits being fixed) · This Week 5.56 · Build after a build 4.68 (1.66 before) · News 4.59 · Events 4.39 ·
Gifts 4.35 · Usage 4.19 · Method 4.06 · Track Record 4.05 · Tournaments 4.01 · Sets 3.73 · Speed 3.50 · Meta 3.45 ·
Type Chart 3.32 · About 3.27 · My Team 3.19 (filled team same) · Empty My Team 3.10 · Test Run 3.11 (filled 4.04) ·
Archetypes 2.89 · Box 2.85 · Battle 2.09 · Calc 2.02 · Practice 1.94 · Feedback 1.66 · Compare 1.33 · Pokémon (no name) 1.12.
Tablet/odd widths are longer than phones on some pages: Home 8.67 at 1024 and 8.82 at 870; Events 5.20 / 5.46; Meta 5.25 / 5.32;
This Week 5.57 / 5.65 (screens of 768 and 900 px).

## Top 10: do these before the switch

| # | ID | What | Size | Visual? |
|---|----|------|------|---------|
| 1 | S16 | Build: after "Build Me a Team", Load Team is 3.2 screens down | High | Visual (Sim's yes) |
| 2 | S1 | Team Checks: "most recent event winners" repeated under every check; "only 0 resist" | High | Non-visual (copy bug) |
| 3 | S24 | Retired words "Ready for / not ready for" in Team Checks | Medium | Non-visual |
| 4 | S28 | Build page is the plainest page on the site | High | Visual |
| 5 | S18 | My Team phone: Suggestions sit behind the 2nd tab even when the team "Needs work" | Medium | Visual |
| 6 | S26 | Bottom/top menu "Battle" opens the Damage Calculator, not the Battle page | Medium | Visual (label/route, ask Sim) |
| 7 | S17 | Build defaults to "My Box", which for a new visitor is a 36-Pokémon sample box | Medium | Non-visual (default) |
| 8 | S2 | My Team after an import shows "Saved Teams" twice | Medium | Visual (small) |
| 9 | S33 | Page not found / unknown Pokémon: plain text, no underdog | Medium | Visual |
| 10 | S13 | Compare Teams does not start with My Team as Team A | Medium | Non-visual |

## After the switch / ideas
S8 replica (rental) team codes · S25 privacy text for the public site (before January) · S10 usage trend on the Pokémon page ·
S11 copy the calc result line · S12 paste the opponent's team in Battle · S9 import preview · S14 install to home screen ·
S15 move / item / Ability pages · S34 a livelier search miss.

## Findings

### 1. Polish

**S1. Team Checks: a stray line repeated under every check.** Group 1 (and 4). My Team, filled team, 390 / 768 / 1440, day.
- Under "Mega Evolution", "No major weak spot" and "Handles the top threats" the same grey line "most recent event winners"
  sits alone, with no sentence around it. Also "Ground hits 3 of yours and only 0 resist" reads wrong.
- Checked (screenshots at 768 and 1440; the phrase comes from a stats line meant to read "…than the most recent event winners").
- Picture: `s01-team-checks-repeated-line-1440-day.webp`. High.
- Fix: finish the sentence once (or drop it) and say "none of them resists Ground". Reason: C3 says no line repeated, no broken copy.
- Non-visual (copy).

**S2. "Saved Teams" twice after an import.** Group 1. My Team, 390 day.
- After Replace My Team: a "Saved Teams 1 saved ›" link sits right above a "Saved Teams 1" button.
- Checked (import flow screenshot). Picture: `s02-saved-teams-twice-390-day.webp`. Medium.
- Fix: keep the button, drop the link. Reason: C3, the same thing shown twice. Visual (small).

**S3. "No Pokémon here." at 1440: the link breaks inside its name.** Group 1. `#pokemon=<unknown>`, 1440 day.
- "Every / Pokémon, by tier ›" wraps in a narrow column while the right 70% of the page is empty.
- Checked (screenshot). Picture: `s33b-no-pokemon-1440-day.webp`. Low. Fix: one-line link at full width. Visual.

**S4. Empty My Team labels the top row "Spot 1, Spot 3, Spot 5".** Group 1. `#team-empty`, 390 day.
- The Lead / Back / Bench columns number down, so the first row reads 1, 3, 5. Odd for a new player.
- Checked (screenshot `team-empty`). Low. Fix: "Add" only, or number across. Visual.

**S5. My Team top line wraps after an import.** Group 1. 390 day. "6 OF 6 · GRASSY TERRAIN / TEAM · LEGAL FOR REG M-C" on two
  lines. Checked (s02 picture). Low. Fix: shorten ("6 of 6 · Grassy Terrain · Legal"). Visual.

**S6. Events at 768-1099: one ticket per row.** Group 1 (and 3). Events, 1024 day.
- The Ticket Wall shows one full-width ticket per row, so Events is 5.20 screens at 1024 and 5.46 at 870.
- Checked (heights measured; screenshot). Picture: `s06-events-one-ticket-per-row-1024-day.webp`. Medium.
- Fix: two tickets per row from 700 wide. Reason: uses the space and halves the scroll. Visual.

**S7. "Tap a Card to edit, replace or remove it" is coloured like a link but is plain text.** Group 1 (and 3). My Team, 390.
- Checked (DOM: a `<p class="mt-hint">` in link blue rgb(0,104,173); picture `s18-…`). Low.
- Fix: grey hint text. Reason: blue means "tap me" everywhere else. Visual.

### 2. Missing good-to-have features

**S8. Replica (rental) team codes.** After the switch. Winning Teams, Build, My Team.
- Champions players share teams by in-game code; Victory Road keeps a replica-team archive, VGCPastes posts codes, PokeFeed
  is built around them. NastyPlot's teams can be copied for Showdown but not loaded in the game.
- Checked (grep: no "replica" / "rental" / "Team ID" in app/src/v2; web search above). Medium.
- Fix: show the code beside "Copy for Showdown" when the source has one. Non-visual data, small visual.

**S9. Import shows no preview.** Paste a Team sheet, 390.
- You paste, then "Replace My Team" at once; skipped moves only show in a toast afterwards ("Not in Champions, skipped: Knock Off").
- Checked (flow). Low. Fix: show the six sprites and any skipped moves before the button. Undo already exists, so later. Visual.

**S10. No usage trend on a Pokémon's page.** Pikalytics shows usage over time. Checked (grep: "trend" only in usage.js). Low. Idea.

**S11. Calc: no "copy result" line.** Showdown's calc and VGC Multi Calc copy "252 SpA Charizard Heat Wave vs …: 88-104%".
Checked (grep calc.js: no copy/clipboard). Low. Idea, non-visual button.

**S12. Battle: the opponent's six is typed one by one.** Battle sheet "Their Six": six search boxes, or a top tournament team.
- ChampTeams' Battle Mode lets you paste the opponent's team. Checked (flow screenshot; sheet controls listed). Medium.
- Fix: a "Paste their team" box, and tap-to-add sprites of the top 30 under the boxes. Reason: team preview is 90 seconds.

**S14. Install to home screen** (public launch). Not checked beyond grep (no manifest words in pages). Idea.
**S15. Move, item and Ability pages.** Search finds items ("Garchompite Z · On 124 winning team sheets") but grep found no
  item/move page route. Not checked further. Idea.

### 3. Usability friction

**S16. Build: the main button is 3 screens below the result.** Build, 390 day, new visitor.
- After "Build Me a Team" the page grows from 1.66 to 4.68 screens. "Load Team" is at 2,667 px (3.2 screens), below the six cards,
  the Spec form, four Revisions and the Notes. The first screen after the tap shows the score but none of the six.
- Checked (measured element positions; 4 screenshots). Picture: `s16-build-load-team-far-down-390-day.webp`. High.
- Fix: a sticky "Load Team" bar (or the button right under the six), Spec and Notes folded. Reason: one main action per screen (C4).
- Visual.

**S17. Build starts from a sample box.** Build, every width, new visitor.
- "Build from: My Box" is selected, but a new visitor's box is "36 Pokémon (sample)". The result says "All six are in your box".
- Checked (Build and Box screenshots). Medium.
- Fix: default to Whole Roster until the player has edited their box. Reason: the result is not really "theirs". Non-visual.

**S18. My Team on phones: Suggestions hidden behind a tab.** 390, filled team scoring 67 "Needs work".
- Matchups is the open tab; Suggestion 1 ("+23, 67 → 90, Azumarill → Mega Charizard Y") needs a tap on "Suggestions 3".
- Checked (screenshot). Picture: `s18-team-tabs-matchups-first-390-day.webp`. Medium.
- Fix: open Suggestions first when the score is under 70. Reason: the fix is the thing a weak team needs. Visual.

**S19. Three ways of counting the same thing on My Team.** Filled team, 1440.
- Matchups: "5 Favoured · 23 Even · 2 Unfavoured". Under it: "Damage calc: No answer 3, Shaky 12, Handles it 7, Beats it 8".
  Team Checks: "Ready for only 63% … not ready for Rillaboom", while Rillaboom's card says "Favoured · Calc: no answer".
- Checked (screenshots). Picture: `s19-matchups-three-counts-1440-day.webp`. Medium.
- Fix: one sentence in Team Checks that points to Matchups ("Shaky or no answer vs 15 of 30, see Matchups"). Reason: C3. Non-visual.

**S20. Speed Tiers and Test Run say "top 20"; the rest of the site says "top 30".** Speed: headline "Your six vs the top 20",
  rows "outspeeds 5% of the top 30 threats" (explained only in small print). Checked (screenshots 390/1440). Low.
  Fix: same number in the headline as in the rows. Non-visual.

**S21. Home calls the sample team "Your".** Home, 390 / 1440, new visitor. "Your six · Sun Tailwind (sample)" and
  "Your Strength Score 94". Checked (screenshot `s21-home-your-score-sample-390-day.webp`). Low.
  Fix: "A sample six" / "Its Strength Score" until the player has a team. Non-visual.

**S22. Long phone pages (Sim's "not scrolling 10 times").** See the table: 9 pages over 4 screens at 390, This Week the longest
  after Home (5.56). Checked (measured). Medium. Fix: the same fold-and-limit pass Home is getting, This Week and News first. Visual.

**S26. The menu's "Battle" opens the Damage Calculator.** Every width.
- Menu "Battle" goes to `#calc`; the Battle page itself is the 2nd sub-tab. "Who are you facing? Plan the match." is one tap further.
- Checked (menu links read from the page: Battle=#calc). Medium. Unsure whether Sim chose this; I found no note.
- Fix: open the Battle page, or name the menu item "Calc". Reason: the label should match the page. Ask Sim.

**S27. Home's "Winning Cores" tile opens the Build page.** It lands on Build's top, with Cores as a second tab further down.
  Checked (link list: Winning Cores=#build). Low. Fix: open Build with the Cores tab selected. Non-visual.

**S13. Compare Teams doesn't use My Team.** Compare, 390 / 1440, with a filled team. Both slots stay "Pick Team A / Pick Team B".
  Checked (filled-team run: same 1,120 px page). Picture: `s13-compare-not-prefilled-1440-day.webp`. Medium.
  Fix: Team A = My Team by default. Non-visual.

### 4. Off concept

**S24. Retired words in Team Checks.** My Team. "Handles the top threats: Ready for only 63% of the top 30 threats; not ready for
  Rillaboom…". The word list (Nov 9) retired "readiness / ready for the top 30" for **Matchups**. The words come from
  `app/src/app/06-helpers.js` (label 'Ready for the top threa…'). Checked (screenshot + grep). Medium.
  Fix: "Has an answer to 19 of the top 30; no answer to Rillaboom…". Non-visual.

**S25. Privacy text tied to a Claude account.** About, every width. "Your teams · Your Claude account … an anonymous ID that Claude
  gives this page". Right for the Claude page now; wrong for the public site in January (CLAUDE.md: nothing Claude-only without a
  plan). Checked (screenshot). Medium, after the switch. Fix: a public-site version of "Everything We Save". Non-visual.

**S33 is also off concept** (empty screens should carry the featured underdog, Sim Nov 11). See group 6.

### 5. Not NastyPlot enough

**S28. Build is the plainest page.** Build, 1440 / 1920 day (390 similar).
- One headline, one form row, then three Recent Winner rows with 40-80 px sprites pushed to the far right. No colour field, no big
  sprite, no slanted panel. It is the page behind the site's main button. 1.03 screens at 1440, mostly empty.
- Checked (screenshot; DOM: all 36 sprites 40-80 px). Picture: `s28-build-plain-1440-day.webp`. High.
- Fix: a colour band with the six "?" ray panels (like the Practice card) that fill in when you build. Reason: keep the WOW
  on the most-used tool. Visual.

**S29. Speed Tiers: tiny sprites on a pale band.** Speed, 1440 day. 20 of 26 sprites are under 40 px (measured); names and numbers
  float in a scattered grid. Home's Speed Tiers tile is bolder than the page itself.
  Checked (DOM + screenshot `s29-speed-tiny-sprites-1440-day.webp`). Medium. Fix: Home's blue band and 60 px sprites. Visual.

**S30. Battle on desktop: "Their Six" is a lone button.** Battle, 1440 day. Picture `s30-battle-their-six-empty-1440-day.webp`.
  Checked. Medium. Fix: six "?" slots (as on Practice) that open the sheet. Reason: shows what to do and looks like the game. Visual.

**S32. Recent Winners rows.** Build and Home, desktop: small sprites far from the event name, plain rows. Checked (screenshots). Low.
  Fix: sprites beside the name, larger. Visual.

### 6. Too boring

**S33. Page not found and "No Pokémon here." are plain text.** 390 night and 1440 day.
- "Nothing here." + a button, then empty space. No featured underdog, while empty My Team and Box have one (Dragapult today).
- Checked (screenshots `s33-not-found-390-night.webp`, `s33b-no-pokemon-1440-day.webp`; `V2.underdog` used in box.js, home.js,
  team.js only). Medium. Fix: today's underdog with one playful line ("Lost? Dragapult's been here all along."). Visual.

**S31. Compare Teams before picking: two dashed boxes.** 390 / 1440. Picture `s31-compare-empty-1440-day.webp`. Checked. Low.
  Fix: fill A with My Team (S13) and show B's choices (latest winners) right away. Visual.

**S34. Search miss.** "Nothing called "qwxyz". Try part of the name." and nothing else. Checked (flow). Low.
  Fix: list today's top 6 under it. Visual.

**S35. My Team "Working out the best changes for your team…".** New visitor, 768 / 1440, 3 s after load: a text line in an empty
  column. Checked (screenshots; it fills in later). Low. Fix: a small slanted loading bar or the underdog line. Visual.

## Things that are good (checked by eye)
- Home, Meta, Archetypes, Events tickets, Gifts and News keep the bold look at every width and in night mode.
- Calc's Arena and the Type Chart blocks are the strongest pages on phones.
- No sideways scroll, no errors, every headline Unbounded slanted (measured).

## Counts per group
1 Polish: 7 (S1-S7) · 2 Missing features: 7 (S8-S12, S14, S15) · 3 Usability: 10 (S13, S16-S22, S26, S27) ·
4 Off concept: 2 (S24, S25; S1 and S33 also count) · 5 Not NastyPlot enough: 4 (S28-S30, S32) · 6 Too boring: 4 (S31, S33-S35).
Total 34 findings (S23 not used). Visual (Sim's yes with pictures): S2-S7, S9, S12, S16, S18, S22, S26, S28-S35.
Non-visual: S1, S8 (data), S10, S11, S13, S17, S19-S21, S24, S25, S27.


## Main-thread check (Nov 20)
- S26 is NOT a finding: Sim chose it (decisions.md, '9:53 AM: Sim chose B: the top bar's 'Battle' opens Damage Calculator (the first tab)'). Checked by grep.
- S1 checked in code: app/src/app/06-helpers.js proLine() returns the fallback 'most recent event winners' when the measured rate is missing, so it shows as a lone line.
- S24 checked in code: 06-helpers.js line 123 still writes 'Ready for ... of the top 30 threats'.
- S20 checked: not a mistake. Test Run = top 20 tournament teams (38-gauntlet-data.js slice(0,20)); Speed Tiers track = 20 most-used threats not on your team, with a key line naming all top 30. No change; a 'top 20 teams' headline is an optional copy tweak for Sim.
