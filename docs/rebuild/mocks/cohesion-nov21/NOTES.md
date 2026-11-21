# Cohesion mock-ups: notes per page (Nov 21, 2026)

Every page in PAGES.md, in its order. Each page: today's features and where they went, the data source, changes from the PAGES.md idea, and any house rule not met.
Pictures: docs/rebuild/pics/nov21/cohesion/all/<nn>-<id>-<width>[-night].png. Gallery: index.html. Checks: a Playwright script measured each page at 390 and 1440 wide (sizes off the type scale, Unbounded under 15px, cut or spilling text, taps under 44px, sideways scroll, lone tiles, length in screens).

Shared kit: all new parts were added to kit2.css (marked "ADDED Nov 21"), never copied per page. Generator scripts that wrote the pages: tools/.

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

Rules not met and why:
- Phone length 4.60 screens (today 3.64). The bigger headline and the three-across notes cost the most.

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

Rules not met and why:
- Phone length: 5.47 screens (today 4.42). Every feature is kept, and the bigger header and cards cost about one screen. Shorter would mean dropping the detail strip or the threat list on phone. Question for Sim.
- Night pictures made for A only (B is already dark in its frame).

Check (390 / 1440): off-scale 0, Unbounded under 15px 0, cut or spilling text 0, taps under 44px 0, sideways scroll no, lone tiles 0. Length 5.47 / 3.89 screens (today 4.42 / 2.90).

## 04 team-empty · RECRUIT YOUR CREW
Not made yet.

## 05 sheet · THE DOSSIER
Not made yet.

## 06 box · YOUR STASH
Not made yet.

## 07 compare · HEAD TO HEAD
Not made yet.

## 08 battle · THE GAME PLAN
Not made yet.

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

Rules not met and why:
- Phone length 4.07 screens (today 2.59). Today folds the kits and the KO Board; this shows them in natural scrolling (Sim, Nov 20: prefer natural scrolling over folds). Question for Sim: fold the kits on phone to get back near 3?
- On phone the pink ring around Sneasler touches the words "the target".

Check (390 / 1440): every rule passes. Length 4.07 / 2.84 screens (today 2.59 / 1.60).

## 10 speed · THE RACE
Not made yet.

## 11 types · THE MATCHUPS
Not made yet.

## 12 practice · THE DRILL
Not made yet.

## 13 gauntlet · THE DRY RUN
Not made yet.

## 14 meta · THE LINE-UP
Not made yet.

## 15 usage · WHO'S ON THE JOB
Not made yet.

## 16 sets · THE LOADOUTS
Not made yet.

## 17 archetypes · THE PLAYBOOKS
Not made yet.

## 18 tournaments · THE WINNING CREWS
Not made yet.

## 19 events · THE JOBS
Not made yet.

## 20 weekly · THE BRIEFING
Not made yet.

## 21 news · WORD ON THE STREET
Not made yet.

## 22 gifts · THE LOOT
Not made yet.

## 23 track · THE RECEIPTS
Not made yet.

## 24 method · SHOW OUR WORK
Not made yet.

## 25 about · THE CREW BEHIND IT
Not made yet.

## 26 feedback · TIP US OFF
Not made yet.

## 27 pokemon · THE FILE
Not made yet.

## 28 notfound · WRONG TURN
Not made yet.

## 29 owner · (internal)
Not made yet.

