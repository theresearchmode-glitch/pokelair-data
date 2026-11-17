# Player review of the redesign (Sim sent it Nov 17, saved time: 7:15 AM (7:15:40)  date: Tue Nov 17, 2026 by the clock)

Sim: "go about it as you see best fit. I'm not going to have access to the chat." Rules kept: Preview only, one change at a
time, re-check each finding on the current branch first, a test that fails before each fix, pictures for Sim, nothing live.
Status per point: OPEN / FIXED (commit) / CHECKED-NOT-REAL / FOR SIM (needs her decision or conflicts with a rule).

Reviewer's summary: 24 pages at 390, 320, 1440, day and night; data copy dated Nov 10; no new tools wanted: polish, fill gaps
inside existing tools, make features findable. Keep: no errors, no sideways scroll, night mode, ~20 s to a full Battle plan,
KO Board, Test Run's piles, Track Record.

## 1. Numbers that disagree between pages (trust; first)
- 1a FIXED Sneasler "of teams": 35.6% Home (Showdown ladder, Oct) / 37.7% Ratings + Usage / 39% This Week.
- 1b FIXED Mega Charizard Y "of teams": 21.6% empty My Team / 17.1% Popular Sets / 25% This Week.
- 1c FIXED Team styles: Archetypes Tailwind 49% / TR 17% (of 90 top-cut teams) vs This Week 56% / 31% (all teams that week).
- 1d FIXED Volcarona page: "Usually" has Overheat (38% of sets) but the Moves list leaves it out; check other Pokémon.
- 1e FIXED Pokémon page Speed uses the player's own item without saying so (Garchomp 231 = Choice Scarf). (checked: it is the usual set's Scarf, not the player's own; the label now says "with Choice Scarf")
- 1f FIXED "Strong players" = 1,300+ in Team Preview Practice but 1630+ on Home and Popular Sets. (checked: two scales, not one word used twice: replay rating 1,300+ vs Smogon's 1630+ stats cut-off; Practice's footnote now says so; 'strong players' is used only on Practice)
- Fix asked: every % names its base the same way everywhere; numbers with the player's set say so; one definition of
  "strong players" or each label says which.

## 2. Features players won't find
- 2a FIXED Home "Everything NastyPlot does" misses Team Preview Practice, Compare Teams, This Week, Track Record, Usage, My Box. (Home's list now has all six; HOME-08 checks 18 and that each opens its page)
- 2b FIXED Your Games empty states don't say what logging unlocks (after 5 games: Build weighs own results; what you lose to). (checked what 5 games unlock: personalAdj in Build, MYREC_MIN record insights; line added on My Team and Battle; Home has no empty games state)
- 2c FIXED Site search finds only Pokémon, saved teams, pages ("trick room" = No matches); add moves, items, abilities, styles (search finds moves, items, Abilities from the 976 winning team sheets and team styles; a move/item/Ability opens Winning Teams filtered by it, a style opens its guide)
  and send each somewhere useful (Winning Teams search already works for these).
- 2d FIXED Winning Teams search sits ~1.5 phone screens down under "Your Team 4/4 checks": under 1100 wide, Your Team now comes after the search and group chips (measured, 390x844: search 804px -> 546px, on the first screen; 320 wide: 856 -> 578; desktop unchanged). Test: v2-minors "Player review 2d" (fails before, passes after). Picture: pics/nov17/winning-search-390-after.png.

## 3. Polish, page by page
- 3a FIXED Home "Most used in October" in mid-November: newest data or say how old. Checked smogon.com/stats: October is the newest month (each posts on the 1st of the next). Heading "Most used right now." -> "Most used last month." (only while true, else "Most used on the ladder."); line "October, Showdown ladder 1630+. November's numbers arrive Dec 1." (the note drops after that date). Usage spotlight tag "Most used right now" -> "Most used". Month names in the big heading were tried and rejected: they spilled out of the box at 768-1100 (measured 6-118px). Tests: v2-minors 3a x4 (fail before, pass after). Pictures: pics/nov17/home-most-used-{390,1280}-{before,after}.png.
- 3b FIXED Tied ratings ranked inconsistently (97/97 = #1/#2, 96/96 = #3/#3): one rule or show the decimal. Cause: ranks followed the hidden raw score (95 vs 94), the page shows the rescaled one (97/97). Ties are now judged on the shown rating, so 97/97 are both #1 and the next is #3 (Sim's Nov 2 rule "ties share a rank", applied to what players see). Measured: 6 wrong pairs before, 0 after (321 rated). Test: v2-minors 3b. Pictures: pics/nov17/ratings-ties-{390,1280}-{before,after}.png.
- 3c NO CHANGE (checked) My Team Matchups: 22 of 30 "Even match": lead with the threats that need a plan. Checked on the built page (390 wide, sample team): the section already opens on Stand-Outs, the 4 Unfavoured first, then the 4 Favoured; the 22 Even match sit under "All 30" (Sim, Nov 11 and Nov 13 Q1 B). Nothing to change; tell Sim in case the reviewer saw an older build.
- 3d FIXED Stand-Outs on a phone: 8 cards in rows of 3 (3+3+2): keep rows even. Columns now follow the card count: under 405 wide 4 or 8 cards go 2 across (2+2, 2+2+2+2); 405-1099 wide 5 or 6 go 3 across (3+2, 3+3). Measured (sample, 8 cards): 2+2+2+2 at 320-404, 4+4 at 430-1024; simulated 4/5/6 even at every width; 7 stays 3+3+1 under 405 (known limit: 4 across cut the verdict words, Nov 15). Cost: one more row on phones. Found on the way: the build puts each CSS file in its own layer and sugs comes last, so the rule lives in sugs.css. Test: v2-minors 3d (fails before, passes after). Pictures: pics/nov17/standouts-{360,390}-{before,after}.png.
- 3e FIXED Mirror threat (Mega Charizard Y vs your own Mega Charizard Y): leave out or label "mirror match". Checked in code: the real-games verdict skips a Pokémon against itself (ctrVal returns nothing for the same name), so the verdict is how your other five do against it: real information, so labelled, not hidden. The row now says "Mirror match" on its own line (Stand-Outs and Top 10), and its screen-reader label says "mirror match: your other five against it". Test: v2-minors 3e (fails before, passes after; 0 of 8 other rows marked). Pictures: pics/nov17/mirror-{390,1280}-{before,after}.png.
- 3f FIXED "Things to Know: 7 things, types, legal": name what it holds. Checked in code: the items are weak spots (weakness, 4x weak, nobody resists, coverage gaps, missing Mega, game-plan gaps, fringe picks). Now "7 weak spots, type chart, legal" ("No weak spots" when none). Test: v2-minors 3f (fails before, passes after); A-team TEAM test accepts both wordings.
- 3g FIXED Team Preview Practice pair %: reads like a win rate; it's "brought together": say so beside the number (Home too). Each pair now reads "53% brought together" (Practice and Home's More on Home fold); the hint line stays (it adds "when both are on the team"). Measured: 0 tiles overflow at 320/390/1280. Test: v2-minors 3g (fails before, passes after). Pictures: pics/nov17/pairs-{320,390,1280}-{before,after}.png.
- 3h FIXED (on this branch; goes live with the switch) Track Record groups (90+, 70-89, 53-69, under 53) differ from tier lines. Sim, Nov 17: "recommended for all".
  Found: main has an older code layout and the live page there labels its own groups, so changing main's data job today would mislabel
  the live site until the switch. Done on this branch instead: track.mjs cuts at 80/70/60 (shown 90+, 80-89, 70-79, under 70), regroups
  every stored event from its own snapshot and stamps "bands" in track.json; the page reads the stamp (old labels without it), so labels
  always match the data. Measured on today's data (34 events, all with snapshot and top-8 list): 90+ unchanged at 25%; 80-89 10%, 70-79
  5.1%, under 70 0.2%; top/bottom 251x -> 109x (the page says "more than 20x" either way); each event's top-8 total unchanged.
  Tests: v2-minors 3h (fails before, passes after); TRACK-03/04 accept either set. Pictures: pics/nov17/track-groups-390-{before,after}.png.
- 3i FOR SIM About "Everything We Save" talks of the Claude account: needs public-site wording (January launch plan).
- 3j FIXED My Box first visit: 36 Pokémon unlabelled while the team says "(sample)": label it if it's a sample box. Checked: a first visit gets DEFAULT_BOX (01-state.js). While the box is unchanged: "36 Pokémon (sample) · 2 boxes" and "A sample box to start with: add the Pokémon you own and remove the rest." Any change drops it. Test: v2-minors 3j (fails before, passes after); A-team BOX test accepts both. Pictures: pics/nov17/box-sample-{390,1280}-{before,after}.png.

## 4. Missing inside existing tools
- 4a OPEN Battle Their Six: tap-to-pick grid of the 30 most common Pokémon.
- 4b OPEN Speed Tiers: your own +1, Unburden after the item, their Choice Scarf.
- 4c PART FIXED Popular Sets: stat-point spreads with share; % for natures and teammates. Checked: Tournaments and Showdown already show % for
  natures and teammates (Modest 66%, "Garchomp 59% of its teams"); "Best data" takes them from Showdown's sample sets, which have no numbers,
  so it now says where the numbers are (mixing sources would show Timid above Modest with the smaller %). Found and fixed on the way: on
  Tournaments, Megas showed the base form's Ability with % (Mega Charizard Y "Blaze 84%"); Popular Sets and Usage now say "Always Drought (a
  Mega's Ability is fixed)". Spreads with share: FOR SIM, needs new data from the daily job (the tournament data has no stat points).
  Tests: v2-minors 4c x3 (fail before, pass after). Pictures: pics/nov17/sets-mega-{tour,ingame}-1280.png.
- 4d OPEN Pokémon page "What beats it": add the meta Pokémon that really beat it.
- 4e OPEN Events "Next Events": Add to calendar.

## Where this meets earlier rules or decisions (for Sim)
- Sim, Nov 9: "No new features until what we have is finished". Section 4 adds pieces inside existing tools; the reviewer
  calls them gaps, not new tools. Sim, Nov 17: "go about it as you see best fit" (worked on after 1-3, Preview only).
- RULES.md: no design or visual decision without Sim's yes and pictures. Everything here goes to the Preview with pictures
  and waits for her before live.
