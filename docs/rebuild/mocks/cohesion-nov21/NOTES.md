# Cohesion mock-ups: notes per page (Nov 21, 2026)

Every page in PAGES.md, in its order. Each page: today's features and where they went, the data source, changes from the PAGES.md idea, and any house rule not met.
Pictures: docs/rebuild/pics/nov21/cohesion/all/<nn>-<id>-<width>[-night].png. Gallery: index.html. Checks: a Playwright script measured each page at 390 and 1440 wide (sizes off the type scale, Unbounded under 15px, cut or spilling text, taps under 44px, sideways scroll, lone tiles, length in screens).

Shared kit: all new parts were added to kit2.css (marked "ADDED Nov 21"), never copied per page. Generator scripts that wrote the pages: tools/.

## Phone height at 390 wide (THEME.md section 4: no longer than today; no show/hide folds or tabs)

| # | page | mock-up | today | |
|---|---|---|---|---|
| 01 | home | 5657px (6.70 screens) | 6527px (7.73 screens) | shorter or same |
| 02 | build | 2474px (2.93 screens) | 3071px (3.64 screens) | shorter or same |
| 03 | team | 3623px (4.29 screens) | 3734px (4.42 screens) | shorter or same |
| 03 | team-b | 3664px (4.34 screens) | 3734px (4.42 screens) | shorter or same |
| 05 | sheet | 3028px (3.59 screens) | 3373px (4.00 screens) | shorter or same |
| 06 | box | 2249px (2.66 screens) | 2402px (2.85 screens) | shorter or same |
| 07 | compare | 1213px (1.44 screens) | 1328px (1.57 screens) | shorter or same |
| 08 | battle | 1763px (2.09 screens) | 1768px (2.09 screens) | shorter or same |
| 09 | calc | 2594px (3.07 screens) | 2187px (2.59 screens) | LONGER by 407px |
| 10 | speed | 2580px (3.06 screens) | 2952px (3.50 screens) | shorter or same |
| 11 | types | 2089px (2.48 screens) | 2798px (3.32 screens) | shorter or same |
| 15 | usage | 3163px (3.75 screens) | 3554px (4.21 screens) | shorter or same |
| 16 | sets | 2965px (3.51 screens) | 3148px (3.73 screens) | shorter or same |
| 17 | archetypes | 1516px (1.80 screens) | 2443px (2.89 screens) | shorter or same |
| 18 | tournaments | 2652px (3.14 screens) | 3386px (4.01 screens) | shorter or same |
| 20 | weekly | 3539px (4.19 screens) | 4694px (5.56 screens) | shorter or same |
| 21 | news | 3241px (3.84 screens) | 3870px (4.59 screens) | shorter or same |
| 22 | gifts | 2616px (3.10 screens) | 3668px (4.35 screens) | shorter or same |
| 27 | pokemon | 3535px (4.19 screens) | 3828px (4.54 screens) | shorter or same |

## 01 home · keeps its own hero (`pages/home.html`)
Data source: today's built page `#home`, claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9; 13,631 tournament teams).

Today's features -> where in the mock-up:
- "Sharply raise your win rate." over the herd, the four biggest (Sneasler 97, Rillaboom 97, Kingambit 96, Incineroar 95), the "345 Pokémon … 13,631 teams" line, All Ratings › -> the hero band (crowd picture behind, kit roster cards with their ratings).
- Score My Team, Build Me a Team -> "SCORE MY TEAM." is the page's one pink move; Build Me a Team is a blue button beside it.
- The moving ratings strip (Mega Charizard Y 94 … Volcarona 85) and its pause button -> the pink strip under the hero (clipped and moving, as today).
- Call six out of the herd: New here? (Get a team / Read your Strength Score / Plan each match), Copy a Top Team, Got It, the sample six with items and the two Lead marks, Build Me a Team, Import a Team, the Strength Score report (94/100, Top tier, Top 1%, the five bands, Matchups / Suggestions / Team Checks), Open My Team -> step 1.
- Walk in with a turn 1 plan: their likely leads (Rillaboom, Farigiraf), yours (Mega Charizard Y · Weather Ball, Garchomp · Dragon Claw), the sample-leads text and the Game Plan sentence, Battle -> step 2.
- Same herd. Twelve tools.: all 12 tools with their line and their one live fact; More tools (Test Run, Compare Teams, This Week, Track Record, Usage, My Box) -> step 3, 4 across.
- The post is in.: Mystery Gifts (live code LA1CTRA1N1NG27, 1 day left, Copy Code, the four past gifts, 10M1NTRNR with 40 days left, All 10 Gifts) and Champions News (No. 69 · Saturday, November 21, 2026, five stories, the next event LAIC live now, All 69 Stories) -> step 4, two panels.

Changes from the PAGES.md idea and why:
- The hero keeps the herd idea and the strip, but the Pokémon are kit roster cards, not today's free-standing crowd: one card for the whole site (THEME.md 2.4).
- Pelipper (today's post carrier) is not drawn; the post step uses the kit's panels. Question for Sim: bring Pelipper back as the post step's picture?
- The Game Plan line still says "lead … back … bench" because today's Home says it. Sim said on Nov 21 "we dont do lead back bench anymore" (for My Team); flag for the real reskin.

Kit additions: four-across grid.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why:
- The check flags the moving strip's names as off-screen: they're clipped on purpose, as today (it scrolls).

Check (390 / 1440): every other rule passes. Length 7.68 / 4.69 screens (today 7.73 / 5.84).

## 02 build · THE PLAN (`pages/build.html`)
Data source: today's built page `#build`, claude/design6 built Nov 21, the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- "Build · real winning teams · Reg M-C doubles" and the lead -> kicker and lead line.
- The plot sentence (My Box / Whole Roster, 0 / 1 / 2 Megas, build around Any Pokémon) -> the kit's plot sentence; the hint keeps today's words.
- Build from / Megas on team (79% …) / Build around a Pokémon (type a name, or tap Sneasler, Rillaboom, Incineroar, Kingambit) -> three notes under the sentence.
- HATCH IT. / Build Me a Team, How It Works › -> the page's one pink move, with the link under it.
- Steps 2-4 (The accomplices, Why it works, Got a Plan B?: "waiting for your plot") -> same steps; desktop shows three empty slots for the accomplices.
- Corviknight underdog ("waiting to see what you hatch", "Today's underdog. Somebody's favourite.", open its info) -> card + scribble in step 2.
- Plots that worked: 3 winning teams (record, place, players, date, event, six, LOAD TEAM, Full sets, Copy for Showdown, Set as Opponent, Compare) -> step 5, one panel each.
- Partners in crime: Pairs / Trios / Full Teams, Top Rated / Most Used, With a Pokémon search, the 533-pairs line, How Cores Are Ranked, 8 pairs (win %, vs avg, teams, points together, Teams with It, ADD), Show 16 More Pairs -> step 6: a sentence for the switches and list rows. Phone shows 4 pairs + "Show 15 More Pairs ›", as today's phone page does.

Changes from the PAGES.md idea and why:
- The pairs are list rows with both Pokémon, not roster cards: 8 pairs as cards would be 16 cards, and the win % and ADD are the point of each row.
- New headline "Draw up the plan." (today the h1 is hidden). Wording for Sim to confirm.
- The quick picks (Sneasler, Rillaboom, Incineroar, Kingambit) are blue links; today they are buttons with a small picture.

Kit additions: outlined blue button (ADD, LOAD TEAM), 3-across grid, empty slot, pair pictures in a row, a big record, panel first line, show-on-one-size helpers, two-line list rows on phones.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why:
- (fixed for section 4) Phone now 2.93 screens. On phones: the three notes are one line, steps 2-4 merged, the winning teams are dense rows with LOAD, 4 pairs + Show 15 More (adds rows).

Check (390 / 1440): every rule passes (0 off-scale, 0 Unbounded under 15px, 0 cut, 0 small taps, no sideways scroll, 0 lone tiles). Length 4.60 / 3.22 screens (today 3.64 / 2.48).

## 03 team · THE CREW (two versions: A `pages/team.html` on paper, B `pages/team-b.html` "the war room")
Data source: today's built page `#team` (sample team "Sun Tailwind"), claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- Status line "My team · 6 of 6 · Sun team · Legal for Reg M-C ✓" -> above the kicker.
- Team name + "(sample)" + sample note -> headline and lead line.
- Build Me a Team, Import a Team -> the plot sentence ("New crew? [build me a team] or [import a team]").
- Strength Score 94, Top tier, win line, Top 1% -> the score block under the lead.
- Why This Score?, Team Sheet, Share as Image, Saved Teams (1), More, Saved ✓ -> the link row under the score.
- Jump links (Matchups / Suggestions / Team Checks) -> in the hint under the sentence.
- Your six (tap one), each with item · Ability, rating, tier, four moves -> Step 1 roster (score, name, tier); the tapped one's item, Ability and moves in the detail strip under it (one tap away for the others).
- Detail: ‹ 1 of 6 ›, types, Item, Ability, Nature (most used), Stat points (most used), four moves, Edit Set, Replace, Remove, Lock, Pokémon Page -> Step 1 detail strip.
- Suggestions: "Nothing to fix…" text, Battle ›, Popular Sets ›, Optional swaps, +1 94 → 95, Sneasler → Mega Floette, To catch, the small-change note, Apply, Why? 13 reasons, See All Suggestions, Never Suggest, Refresh Suggestions, Adjust Suggestions + its settings line -> Step 2 "The upgrade".
- Game Plan line, "Who leads depends on who you face", Plan it in Battle ›, Legal for Reg M-C, Team Sheet -> Step 3; Plan it in Battle is the page's one big pink move "PLAN IT IN BATTLE.".
- Matchups: intro, 4 Favoured / 22 Even match / 4 Unfavoured, damage-calc line, Stand-Outs / Top 10 / Top 12 Grid / All 30, the 8 stand-out threats with verdicts and the "Mirror · Calc: beats it" note -> Step 4 (counts, sentence, list rows with verdict tags).
- Team Checks: ✓ all pass, the "?" help, "What is Handles the top threats?", Things to Know (7 minor weak spots, type chart, legal) -> Step 5 check list.
- Your Games: none logged, the 5-games note, Log a Game -> Step 6.

Changes from the PAGES.md idea and why:
- No separate big hero card for the chosen Pokémon: the tapped card in the roster is marked, and its set opens in a strip right under the six. A second giant card repeated the same Pokémon and added ~400px.
- The 8 threats are list rows with verdict tags (two across on phone), not roster cards: as cards the phone page was 6.7 screens.
- Weather Ball is shown in Normal colour (its own type); today's page doesn't say how it colours it in sun.
- B frames only the crew step in today's approved black frame with the pink shadow; everything else is the same as A.

Kit changes made for this page (shared): night tokens; kicker and verdict tag 13 -> 15px and lead 18 -> 17px (house rules: Unbounded never under 15px, type scale); score block, chosen card, detail strip, kv pairs, type chips, move plates, pager, swap, list rows (+ two-across "tiles" on phone), check list, form field, panel, counts; tighter phone rhythm; on phones a 3-across card sets its name in slanted Instrument Sans 15px (slanted Unbounded can't fit "Basculegion" in a ~100px card).

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why:
- (fixed for section 4) Phone now 4.29 screens, under today. On phones the secondary lines (the win line, the suggestion note, the check explanations) are one line or move to the tap; Suggestions and the Game Plan merged into one step; Team Checks and Your Games merged.
- Night pictures made for A only (B is already dark in its frame).

Check (390 / 1440): off-scale 0, Unbounded under 15px 0, cut or spilling text 0, taps under 44px 0, sideways scroll no, lone tiles 0. Length 5.47 / 3.89 screens (today 4.42 / 2.90).

## 04 team-empty · RECRUIT YOUR CREW
Not made yet.

## 05 sheet · THE DOSSIER (`pages/sheet.html`, the Team Sheet)
Data source: today's Team Sheet for the sample team (My Team › Team Sheet ↗, `V2.openTeamSheet()`), claude/design6 built Nov 21 with the repo's data files.
Note: the address `#sheet` in today's Preview build opens a DEMO of the Pokémon info layer (Garchomp) over My Team, not the Team Sheet. This mock-up is the Team Sheet, as PAGES.md describes #5. The "today" phone height below is the `#sheet` demo page; the Team Sheet layer itself is shorter.

Today's features -> where in the mock-up:
- ← My Team, Copy for Showdown, Share as Image -> the link row; "COPY FOR SHOWDOWN." is the page's pink move.
- "Sun Tailwind (sample) · Reg M-C doubles · level 50", "Spreads: each one's most common" -> headline and lead.
- The legend (tap a column to edit its set; big number = the stat at level 50; team best in that stat; ▲ raised / ▼ lowered by nature; points = stat points 0–32) -> the hint above the cards.
- Per Pokémon (01–06): name, item, Ability, nature with its +/− stats, four moves, the six stats at level 50 with points, ▲/▼, and team best -> one dossier card each (kit roster card, item/Ability/nature, move plates, a six-stat strip; team best is blue with a blue underline).

Changes from the PAGES.md idea and why: none.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 06 box · YOUR STASH (`pages/box.html`)
Data source: today's built page `#box` (sample box: 36 Pokémon, 2 boxes; Absol open), claude/design6 built Nov 21 with the repo's data files.

Today's features -> where in the mock-up:
- ← My Team; "My Box · 36 Pokémon (sample) · 2 boxes" and the sample-box note -> link, headline, lead.
- Add a Pokémon + -> the page's pink move "ADD A POKÉMON +".
- Arrange by A–Z / Type / Newest / Oldest / Rating -> the plot sentence.
- ◀ Box 1 ▶, "30 of 36 · A to S", the 30 Pokémon, "On your team" mark -> step 1: the pager and a wall of 30 (blue underline = on your team; pink ring = the one open).
- The open Pokémon (Absol, Dark, Rated 26 · F tier; forms Absol 26 / Mega Absol 33 / Mega Absol Z 51; <0.1% of teams; win rate too few, 22 games; base Speed 75; Swap Into My Team, Pokémon Page, Build Around It, Remove from Box) -> step 2 hero.
- Your Team (the six), Open My Team, Copy Box Link, Open a Box Link, Reset Box, the "saved in this browser only" note -> step 3.

Changes from the PAGES.md idea and why:
- Today's Your Team strip labels the six Lead / Back / Bench. Sim said on Nov 21 "we dont do lead back bench anymore", so the mock-up shows the six without those labels. Question for Sim: confirm the labels go here too.
- On phones the wall shows pictures only (names on tap): 30 names would not fit 5 across.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 07 compare · HEAD TO HEAD (`pages/compare.html`)
Data source: today's built page `#compare` (A = your team, B not picked; three latest winners offered), claude/design6 built Nov 21 with the repo's data files. The winners' sixes come from the same build's Events data.

Today's features -> where in the mock-up:
- ← My Team, "Compare Teams · two teams side by side" -> link, headline, lead.
- A: Sun Tailwind (sample), my team, open now, Change, its six -> step 1, left (phones: one row of six pictures).
- B: Pick Team B -> step 1, right: six empty slots.
- Take on a latest winner (Grassy Terrain · Hard Trick Room / Psychic Terrain · Trick Room / Grassy Terrain · Tailwind, each "Won … · Nov 8") -> step 2, one panel each (phones: dense rows) with "pick team B".
- Saved, more winners or paste a team › -> step 2's link.
- "Pick two teams… every row is worked out the same way as on My Team" -> lead and the hint.

Changes from the PAGES.md idea and why:
- The winners' panels show their six as small pictures; today's page shows only the style and event line. The pictures come from the same build's data (Events), so nothing is invented.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 08 battle · THE GAME PLAN (`pages/battle.html`)
Data source: today's built page `#battle` before their six is entered (the sample team), claude/design6 built Nov 21 with the repo's data files.

Today's features -> where in the mock-up:
- Battle sub-tabs (Damage Calculator, Battle, Team Preview Practice, Test Run, Speed Tiers, Type Chart) -> link row at the top (phone also gets the four tools as panels in step 5, as today's phone page lists them).
- "Battle a team · Team preview", "Who are you facing? Plan the match.", the lead -> kicker, headline, lead.
- The "?" help on team preview -> "What is team preview? ›" in the hint.
- Their Six (six "?" slots), Enter Their Six, the "Everything below fills in…" line -> step 1 face-off: their six as empty slots, "ENTER THEIR SIX." is the page's pink move.
- Your Six (the six names), Change on My Team › -> step 1, roster cards.
- Your Games: no games logged, 0 of 4 picked (tap to change), Pick Your Four First ›, Log from a Showdown Replay › -> step 4.
- Picking a top tournament team (today in the lead) -> the plot sentence "They brought [their six] or [a top tournament team]".

Changes from the PAGES.md idea and why:
- No turn-1 arrows: today's page has no data for them until their six is entered. Steps 2 and 3 ("Bring four, lead two", "Turn one") show "waiting for their six", the same way Build shows its waiting steps.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why:
- (fixed for section 4) Phone now 2.09 screens (same as today): your six is one row of six pictures on phones, their six is one row of slots, steps 2-3 merged, the tool panels become a link row, the repeated lead line is dropped on all widths (the plot sentence says it).
- On phone, the "›" after "Damage Calculator" wraps onto its own line in its panel.

Check (390 / 1440): every rule passes. Length 3.33 / 2.58 screens (today 2.09 / 1.40).

## 09 calc · PLOT THE HIT (`pages/calc.html`)
Data source: today's built page `#calc` (Mega Charizard Y's Heat Wave into Sneasler in Sun), claude/design6 built Nov 21, the repo's data files (the page's own banner dates the saved copy Nov 9). The % numbers are worked out from today's HP numbers (138–163 of Sneasler's 157 HP = 88–104%; Solar Beam 52–62 = 33–39%; Weather Ball 198–234 = 126–149%). KO Board % are today's own.

Today's features -> where in the mock-up:
- Battle sub-tabs (Damage Calculator, Battle, Team Preview Practice, Test Run, Speed Tiers, Type Chart) -> link row above the kicker.
- "Plot the hit", swap them, attacker and defender pickers (your six + every Pokémon), the move picker -> headline + the plot sentence ("[Mega Charizard Y] hits [Sneasler] with [Heat Wave]"), swap them in the hint.
- The result: Heat Wave does 138–163, Sneasler has 157 HP, Faints 1 time in 4, hangs on with 1–19 HP the other three -> step 1, the graph-paper hero: % big, HP under it (option A), pink marker ring, attacker and target cards, the arrow.
- The move: Heat Wave / Solar Beam / Weather Ball with their results, All moves -> step 2 move plates.
- the sky (Clear, Sun, Rain, Sand, Snow), the ground (None, Grassy, Electric, Psychic, Misty), this turn (Hits both foes, Screen up, Helping Hand, Friend Guard, Critical hit) -> step 3 choice rows.
- the muscle's kit / the target's kit (Item, Ability, Nature, points, stage − ±0 +; most used set) -> step 4, two panels.
- KO Board: your six against the top 30, 18 down in one hit · 8 can go down · 4 survive, and its list -> step 5 counts + the first six KOs; "OPEN THE KO BOARD." is the page's pink move.
- How the Calc Works ›, Notes on this hit › -> under the pink move.

Changes from the PAGES.md idea and why:
- Graph paper is only behind the hero (step 1), as THEME.md says; today the whole calc sits on it.
- The attacker and target are kit roster cards, not today's polaroid photos (one card for the whole site).
- The pink move is "OPEN THE KO BOARD." (the calc has no single submit; the KO Board is its biggest next step). Wording for Sim.

Kit additions: stepper (− value +), labelled choice rows, the "on" ring for move plates.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why:
- Phone 3.07 screens, still LONGER than today (2.59). On phones the conditions are one sentence of blue words, the kits sit side by side, the KO list shows 4 + Show 14 More (adds rows), the hero is shorter. The rest is the two kits, which today sits in folds; THEME.md 4 says no folds. Question for Sim: keep both kits showing (longer) or show only the values you changed?
- On phone the pink ring around Sneasler touches the words "the target".

Check (390 / 1440): every rule passes. Length 4.07 / 2.84 screens (today 2.59 / 1.60).

## 10 speed · THE RACE (`pages/speed.html`)
Data source: today's built page `#speed` (Track view, Your Weather: sun), claude/design6 built Nov 21 with the repo's data files.

Today's features -> where in the mock-up:
- Battle sub-tabs -> link row at the top.
- "Who moves first. Your six vs the top 20.", the lead (weather: sun, from your team) -> headline and lead.
- Track / List; Your Tailwind, You +1, Their Tailwind, Them −1, They're Paralyzed, Trick Room; Your Weather (sun), No Weather, Sun, Rain, Sand, Snow -> the plot sentence.
- The track: all 26 (your six and the top 20) with their Speed, fastest first, "← Moves first … Moves last →", the share note -> step 1 "The race": one lane each, your six in blue, the rest grey, a race-track grid behind.
- Each of your six: outspeeds X% of the top 30 threats, and the "can't outspeed … / 3 more Speed points…" note -> step 2, list rows with bars.
- The level 50 / 31 IVs / assumed spreads / weather Abilities note -> step 2's hint.

Changes from the PAGES.md idea and why:
- Lanes run fastest first, top to bottom (not a left-to-right track), so 26 Pokémon fit on a phone without sideways scrolling.
- Headline split as "Who moves / first." with "Your six vs the top 20." in the lead, so no word sits alone on a line.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 11 types · THE MATCHUPS (`pages/types.html`)
Data source: today's built page `#types` (Mega Charizard Y, Ability Drought, from your team), claude/design6 built Nov 21 with the repo's data files.

Today's features -> where in the mock-up:
- Battle sub-tabs -> link row at the top.
- "What hits Mega Charizard Y hard.", "Showing … (from your team)" -> headline and lead.
- Your six (tap one), Look up a Pokémon -> the row of six pictures and the search link.
- Or pick one or two types (Clear + the 18 types) -> a grid of type buttons (Fire and Flying on).
- Taking hits as Fire / Flying: every type with its multiplier (4× Rock; 2× Water, Electric; ½ Fire, Fighting, Steel, Fairy; ¼ Grass, Bug; 0 Ground; the rest 1×), the summary lines, "Everything not listed…" -> step 1: a clean chart grid, hardest first, red edge = weak, blue edge = resists, plus the summary counts.
- Today's 3D-block legend (tall red edge… flat plate) -> not needed: the chart colours say it directly.
- Attacking with its own types (Fire: 2× Grass, Ice, Bug, Steel; ½ Fire, Water, Rock, Dragon. Flying: 2× Grass, Fighting, Bug; ½ Electric, Rock, Steel) -> step 2, two panels side by side.
- Full type chart (every attacking type against every defending type) ›, the one fold today -> a link (no fold).

Changes from the PAGES.md idea and why:
- PAGES.md says "your team's weak spots marked"; today's page shows one Pokémon at a time, so the chart marks that Pokémon's weak spots. A whole-team view would be a new feature: question for Sim.
- The 3D blocks are dropped, as PAGES.md says.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 12 practice · THE DRILL
Not made yet.

## 13 gauntlet · THE DRY RUN
Not made yet.

## 14 meta · THE LINE-UP
Not made yet.

## 15 usage · WHO'S ON THE JOB (`pages/usage.html`)
Data source: today's built page `#usage` (online tournaments), claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- Sub-tabs (Pokémon, Tournaments, Ratings, Usage, Popular Sets), Ratings ›, Popular Sets › -> link row and the hero's links.
- "Who gets picked right now.", lead -> headline, lead.
- Ranked ladder / Online tournaments / Showdown ladder, Find a Pokémon, the Limitless source line -> the plot sentence and its hint.
- Most used: Rillaboom #1, Grass, 38.1% of teams, 48.0% win rate, Pokémon Page, Rated 97 · S tier -> step 1 hero; "SEE HOW IT'S PLAYED." jumps to step 3.
- The Podium: the ten most used with %, teams and ▲▼ change -> step 2, a ranked list with bars.
- How Rillaboom is played (moves, items, abilities, natures with %, of 3,172 teams; win rate line), teammates (Incineroar 52% … Mega Floette 20%), "% = share of its sets" -> step 3. Phone shows 5 moves, 3 items, 3 teammates with "N more ›" links, as today's phone page does.
- Ranks 11–60 ›, Also ranked 61–100 (the list) -> step 2's link, step 4.

Changes from the PAGES.md idea and why:
- "A ranked roster with bars" became list rows with bars (ten roster cards would double the phone length).
- The top Pokémon appears twice (hero and #1 in the list), so the list is a full ten with no lone row.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 16 sets · THE LOADOUTS (`pages/sets.html`, Mega Charizard Y from your team)
Data source: today's built page `#sets`, claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- Sub-tabs (Pokémon, Tournaments, Ratings, Usage, Popular Sets), Ratings ›, Usage › -> link row and the hint.
- "How it's built right now.", lead -> headline, lead.
- Look up a Pokémon; Best data / Online tournaments / Showdown ladder; "Showdown ladder, 1630+ rating (this Mega)" -> the plot sentence and its hint.
- Your Team row (tap one) -> the row of six small pictures.
- On your team: Mega Charizard Y, Fire/Flying, 94 S tier, #5 of 321, 16.9% of teams, 53.7% win rate, base Speed 100, Pokémon Page, Build Around It -> step 1 hero; "BUILD AROUND IT." is the pink move.
- Your set (Drought @ Charizardite Y · Heat Wave, Protect, Solar Beam, Weather Ball), Item always, Ability always (a Mega's is fixed) -> the loadout strip in step 1.
- Moves with % (Heat Wave 99 … Overheat 2), Nature (Timid, Modest, the no-numbers note), Stat points (three spreads with %), the 1630+ note -> step 2.
- Teammates (Kingambit, Garchomp, Farigiraf, Sneasler, Archaludon, Rillaboom), the source line (Showdown 1630+, 307,430 battles) -> step 3 and step 2's note.

Changes from the PAGES.md idea and why:
- One loadout (the chosen Pokémon's), not a wall of set cards: today's page shows one Pokémon at a time.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why:
- Desktop: the hero card has the kit's tall gap above it (the approved hero spacing, so the art can burst out). Left as the kit has it.
Check (390 / 1440): every rule passes.

## 17 archetypes · THE PLAYBOOKS (`pages/archetypes.html`)
Data source: today's built page `#archetypes` (latest 90 top tournament teams), claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- Sub-tabs, "What you'll face, style by style.", the lead -> link row, headline, lead.
- Your team's style: Tailwind + Sun (52%, 47 of 90; 41%, 37 of 90) -> step 1; "OPEN YOUR PLAYBOOK." is the page's pink move.
- The Weather Map: eight styles (No. 1–8) with % and counts, "your style" on Tailwind and Sun, "the bigger the region…", tap a region for its guide, the "more than 90" note -> step 2: one playbook per style, bigger for the most played, each with "Open the guide ›".

Changes from the PAGES.md idea and why:
- PAGES.md suggests each playbook's key Pokémon as a mini roster. Today's Archetypes page shows no Pokémon per style, so none are shown (real data only); the guide behind each book is where they would go. Question for Sim: add key Pokémon to each playbook from the style guides?
- Each book's colour is the type its style is named for (Tailwind Flying, Sun Fire, Grassy Grass, Rain Water, Trick Room and Psychic Terrain Psychic/Ghost, Sand Rock, Snow Ice), so colours keep their meaning.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 18 tournaments · THE WINNING CREWS (`pages/tournaments.html`)
Data source: today's built page `#tournaments`, claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- Sub-tabs (Pokémon, Tournaments, Winning Teams, Events, Archetypes, This Week) -> link row at the top.
- "The teams that won it.", lead, 90 top-cut teams · 32 official · 58 last 7 days -> headline and lead.
- Search winning teams, Official events 32 / Last 7 days 58, the "Top 4 … top 8" rule -> the plot sentence and its hint.
- Your Team card (4/4 checks, the four basics, Sun, Tailwind, your six, each opens its page) -> the panel under the sentence.
- The Winning Hands: the champion (2027 Gdańsk Pokémon Regional Championships · 758 players · official event; Gholdengo, Excadrill, Mega Tyranitar, Mega Staraptor, Sinistcha, Milotic; 3/4 checks, missing weak spots spread out; Sand, TailRoom; Load Team, Copy for Showdown, Set as Opponent, Compare; tap a card for its page) -> step 1, roster of six; Load Team is the pink "USE THIS TEAM." (THEME.md wording).
- 2nd and 3rd place (Challenger; their sixes, checks, styles, the same four actions) -> step 2, two panels, each with "use this team".
- More Winning Teams · 32 in all › -> step 2's link.

Changes from the PAGES.md idea and why:
- Only the champion gets roster cards; 2nd and 3rd are panels with small pictures, so the page isn't three walls of six cards.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 19 events · THE JOBS
Not made yet.

## 20 weekly · THE BRIEFING (`pages/weekly.html`)
Data source: today's built page `#weekly` (tournament teams Nov 3–9 against Oct 27–Nov 2), claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- Sub-tabs, "This Week", the two weeks' team and event counts (1,810 / 51; 1,769 / 57) -> link row, headline, lead.
- Share as Image -> the page's pink move.
- Pokémon on the Move: biggest rise Whimsicott (13% → 19%, ▲6), Kingambit, Mega Staraptor, Mega Salamence; biggest fall Incineroar (33% → 28%, ▼5), Mega Garchomp Z, Pelipper, Archaludon -> step 1: a roster card each for the biggest rise and fall, list rows for the rest.
- Ratings on the Move (Whimsicott ▲5 88, Mega Froslass ▲3 78, Mega Salamence ▲2 87, Mega Garchomp Z ▼2 87; tap one for its page) and Most Used This Week (Sneasler 39% … Mega Charizard Y 25%) -> step 2, side by side.
- New Tech (Dragon Dance, Rocky Helmet, Solar Beam, Gunk Shot with their % and team counts) and New in Top Cut (Arcanine, Leafeon, Paldean Tauros (Blaze), Lucario with place and event) -> step 3.
- Winners This Week (three 1st places with event, date, players) and The Weather (nine styles with %, three with their change) -> step 4.
- The "?" help on New Tech, The Weather and New in Top Cut, and How We Decide What Changed (today's one fold) -> step notes and the step 4 link (no fold).

Changes from the PAGES.md idea and why:
- Only the biggest rise and fall are roster cards; the rest are rows, so the page stays short.
- Winners are rows (today: tickets). Their sixes are not on today's This Week page, so none are shown.

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 21 news · WORD ON THE STREET (`pages/news.html`)
Data source: today's built page `#news` (No. 69, Saturday, November 21, 2026; news list checked Nov 17), claude/design6 built Nov 21 with the repo's data files.

Today's features -> where in the mock-up:
- Masthead (No. 69 · late edition, the date, free · unofficial), "The Champions Dispatch", 50 stories · 12 tournaments · 8 battle passes -> headline, lead and the newspaper hero's masthead.
- In the post: 3 gifts waiting, one ends tomorrow; Next event: LAIC, São Paulo, Nov 20–22, live now -> the two boxes beside the front page.
- Lead story: A New Mystery Gift Campaign (Nov 25, opens at its source), the Monthly Challenge Series May–November with each round's gift (Gallade, Tyranitar, Mawile, Alolan Raichu, Indeedee (F), Sirfetch'd, Pawmot) -> the front page.
- In Brief (six stories with kind and date, each opens at its source; Read the Story) -> step 1.
- Clip and Claim: 2 Training Tickets, code LA1CTRA1N1NG27, Copy Code, 1 day left, serial code Nov 11 – Nov 22, All Mystery Gifts -> step 2; "COPY CODE." is the page's pink move.
- The Back Page: latest result (ValkrixVGC Champions League #09, the winner's six), top ratings (Sneasler, Rillaboom, Kingambit, Incineroar, Mega Charizard Y), next events (LAIC, Malaysia Premier Ball League, Stuttgart Regional), All Ratings, All 30 Next Events, the four classifieds with their links -> step 3.
- Earlier Editions · 62 more stories › -> step 1's link.

Changes from the PAGES.md idea and why: none (the newspaper is kept as the hero, in the kit).

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 22 gifts · THE LOOT (`pages/gifts.html`)
Data source: today's built page `#gifts` (gift list checked Nov 17), claude/design6 built Nov 21 with the repo's data files.

Today's features -> where in the mock-up:
- "Special delivery. No postage due.", the lead -> headline and lead.
- Live right now: 3 to claim, 1 day until one ends, 10 gifts so far -> the counts under the lead.
- Waiting at the Counter: three parcels (2 Training Tickets, code LA1CTRA1N1NG27, sent Nov 11, collect by Nov 22, 1 day left; 100 Quick Coupons, 10M1NTRNR, Sep 9 to Dec 31, 40 days left; Vivillon Trainer Icon, event gift, no code, Oct 29 to Jan 31, 2027 until 9:59 AM, 71 days left, also inside Training Ticket ×6 and 666 VP), each Copy Code and its source; "blue characters are numbers" -> step 1: one parcel each with the code on the label (numbers in blue), the days-left stamp; the first COPY CODE is the page's pink move.
- How to collect (three steps, the "real codes never ask for your password" note) -> step 2.
- The Stamp Sheet: All 7 / Pokémon 4 / Items 3, the seven ended gifts with month, kind and end date, tap a Pokémon for its page, the checked/time-zone note -> step 3 (phones: one row each).

Changes from the PAGES.md idea and why: none (parcels kept; codes stay readable, numbers in blue).

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes.

## 23 track · THE RECEIPTS
Not made yet.

## 24 method · SHOW OUR WORK
Not made yet.

## 25 about · THE CREW BEHIND IT
Not made yet.

## 26 feedback · TIP US OFF
Not made yet.

## 27 pokemon · THE FILE (`pages/pokemon.html`, Incineroar)
Data source: today's built page `#pokemon=incineroar`, claude/design6 built Nov 21 with the repo's data files (the page's own banner dates the saved copy Nov 9).

Today's features -> where in the mock-up:
- Meta › Ratings › breadcrumb -> link row at the top.
- Name, Fire/Dark, #4 of 321 with tournament results, "Pokémon Champions · VGC doubles" -> headline, type chips, lead.
- 95 S tier, the rating bar (0–100), 35% of teams (of 13.6k), 51% win rate (27,028 games), 72 Speed at level 50 -> the hero card and its facts.
- Build Around It, Popular Sets, "Your team is full…" -> "BUILD AROUND IT." (the pink move), Popular Sets ›, the note.
- Base Stats (HP 95, Attack 115, Defense 90, Sp. Atk 80, Sp. Def 90, Speed 60, total 530) -> step 1, one bar row each, in the site's stat colours.
- Jump chips (Is it good? / How to build it / Who it teams with / What beats it / How fast it is / Why it rates 95) -> the plot sentence "Jump to …".
- How to build it: Usually (Fake Out 99%, Flare Blitz 95%, Parting Shot 96%, Throat Chop 32% of sets), Typical set (Intimidate 100%, Sitrus Berry or Chople Berry, Sassy or Impish, 31 HP, 20 SpD, 15 Def), Popular Sets moves and items with % (of 2,733 teams), All Moves and Items › -> step 2.
- Who it teams with: Rillaboom 59% · 3,160 games, Garchomp 62% · 2,310, Sneasler 57% · 1,648, Raichu 51% · 1,381, the "% = brought together…" note, Build Around It › -> step 3 roster.
- What beats it (2× weak: Water, Fighting, Ground, Rock), How fast it is (72 Speed · outspeeds 10% of the top 30), Abilities (Intimidate (100%) or Blaze), Why it rates 95 (Top-cut presence 99 · Picked by strong players 99 · Top cut beyond its use 77 · Win rate 86), each with Show › -> step 4, four panels.

Changes from the PAGES.md idea and why:
- Headline "The file on Incineroar." (new wording for Sim). Its "sets, partners, matchups" are steps 2–4 as PAGES.md suggests.
- "Raichu" (a partner) uses the plain Raichu picture because today's page names it "Raichu"; check whether it means Mega Raichu Y.

Kit additions: one-line bar rows; fact numbers 32 -> 34px (32 is off the type scale).

Phone length (section 4): see the heights table at the top of NOTES.md.
Rules not met and why: none.
Check (390 / 1440): every rule passes. Length 4.87 / 3.29 screens (today 4.54 / 3.05).

## 28 notfound · WRONG TURN
Not made yet.

## 29 owner · (internal)
Not made yet.

