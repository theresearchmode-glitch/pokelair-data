# Player review of the redesign (Sim sent it Nov 17, saved time: 7:15 AM (7:15:40)  date: Tue Nov 17, 2026 by the clock)

Sim: "go about it as you see best fit. I'm not going to have access to the chat." Rules kept: Preview only, one change at a
time, re-check each finding on the current branch first, a test that fails before each fix, pictures for Sim, nothing live.
Status per point: OPEN / FIXED (commit) / CHECKED-NOT-REAL / FOR SIM (needs her decision or conflicts with a rule).

Reviewer's summary: 24 pages at 390, 320, 1440, day and night; data copy dated Nov 10; no new tools wanted: polish, fill gaps
inside existing tools, make features findable. Keep: no errors, no sideways scroll, night mode, ~20 s to a full Battle plan,
KO Board, Test Run's piles, Track Record.

## 1. Numbers that disagree between pages (trust; first)
- 1a OPEN Sneasler "of teams": 35.6% Home (Showdown ladder, Oct) / 37.7% Ratings + Usage / 39% This Week.
- 1b OPEN Mega Charizard Y "of teams": 21.6% empty My Team / 17.1% Popular Sets / 25% This Week.
- 1c OPEN Team styles: Archetypes Tailwind 49% / TR 17% (of 90 top-cut teams) vs This Week 56% / 31% (all teams that week).
- 1d OPEN Volcarona page: "Usually" has Overheat (38% of sets) but the Moves list leaves it out; check other Pokémon.
- 1e OPEN Pokémon page Speed uses the player's own item without saying so (Garchomp 231 = Choice Scarf).
- 1f OPEN "Strong players" = 1,300+ in Team Preview Practice but 1630+ on Home and Popular Sets.
- Fix asked: every % names its base the same way everywhere; numbers with the player's set say so; one definition of
  "strong players" or each label says which.

## 2. Features players won't find
- 2a OPEN Home "Everything NastyPlot does" misses Team Preview Practice, Compare Teams, This Week, Track Record, Usage, My Box.
- 2b OPEN Your Games empty states don't say what logging unlocks (after 5 games: Build weighs own results; what you lose to).
- 2c OPEN Site search finds only Pokémon, saved teams, pages ("trick room" = No matches); add moves, items, abilities, styles
  and send each somewhere useful (Winning Teams search already works for these).
- 2d OPEN Winning Teams search sits ~1.5 phone screens down under "Your Team 4/4 checks": move it near the top.

## 3. Polish, page by page
- 3a OPEN Home "Most used in October" in mid-November: newest data or say how old.
- 3b OPEN Tied ratings ranked inconsistently (97/97 = #1/#2, 96/96 = #3/#3): one rule or show the decimal.
- 3c OPEN My Team Matchups: 22 of 30 "Even match": lead with the threats that need a plan.
- 3d OPEN Stand-Outs on a phone: 8 cards in rows of 3 (3+3+2): keep rows even.
- 3e OPEN Mirror threat (Mega Charizard Y vs your own Mega Charizard Y): leave out or label "mirror match".
- 3f OPEN "Things to Know: 7 things, types, legal": name what it holds.
- 3g OPEN Team Preview Practice pair %: reads like a win rate; it's "brought together": say so beside the number (Home too).
- 3h OPEN Track Record groups (90+, 70-89, 53-69, under 53) differ from tier lines (S 90 A 80 B 70 C 60 D 50).
- 3i FOR SIM About "Everything We Save" talks of the Claude account: needs public-site wording (January launch plan).
- 3j OPEN My Box first visit: 36 Pokémon unlabelled while the team says "(sample)": label it if it's a sample box.

## 4. Missing inside existing tools
- 4a OPEN Battle Their Six: tap-to-pick grid of the 30 most common Pokémon.
- 4b OPEN Speed Tiers: your own +1, Unburden after the item, their Choice Scarf.
- 4c OPEN Popular Sets: stat-point spreads with share; % for natures and teammates.
- 4d OPEN Pokémon page "What beats it": add the meta Pokémon that really beat it.
- 4e OPEN Events "Next Events": Add to calendar.

## Where this meets earlier rules or decisions (for Sim)
- Sim, Nov 9: "No new features until what we have is finished". Section 4 adds pieces inside existing tools; the reviewer
  calls them gaps, not new tools. Sim, Nov 17: "go about it as you see best fit" (worked on after 1-3, Preview only).
- RULES.md: no design or visual decision without Sim's yes and pictures. Everything here goes to the Preview with pictures
  and waits for her before live.
