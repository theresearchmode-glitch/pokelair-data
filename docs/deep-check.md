# Deep Check — notes and results

Started Nov 8, 2026. Plan: Plans page, "Deep Check: nothing basic missed". Rules: CLAUDE.md "How we test".

## Step 1 · What decides a battle (master list, draft for Sim)

Sources: VGC Guide (vgcguide.com: speed control, Protect, items, Trick Room, island Pokémon, playstyle and pace, Bo1 vs Bo3),
Victory Road (Champions regulations), Pokémon.com (Reg M-C overview), MetaVGC guides, ChampDex archetype guides,
MonTeams VGC framework, r/VGC team-building checklist thread (excerpt only, Reddit can't be fetched).

Format rules (Reg M-C, Sep 9 – Dec 2 2026): bring 6, pick 4; no two Pokémon of the same species; no two holding the same
item; level 50; Megas allowed incl. Z Megas (Absol, Garchomp, Lucario); 7 min own time, 20 min game.
One Mega per battle: not stated on Victory Road or Pokémon.com, but in 20,000 ladder replays (40,000 sides) no side ever
Mega Evolved twice; 17% of sides didn't Mega at all.

| # | Factor | What experts say |
|---|---|---|
| 1 | Mega | Bring at least one; "balance" teams = Intimidate + redirection + a Mega |
| 2 | Speed control | At least two kinds: Tailwind / Trick Room plus Icy Wind, Electroweb, Thunder Wave, priority, Scarf |
| 3 | Turn-1 support | Fake Out and Intimidate (Incineroar, Rillaboom) |
| 4 | Redirection | Follow Me / Rage Powder to protect setup turns |
| 5 | Protect | On at least 4 of 6 |
| 6 | Spread damage | Moves that hit both foes |
| 7 | A win condition / clear plan | Tailwind, Trick Room, rain, sun, sand, hyper offense, balance, Perish trap |
| 8 | Plans that fit together | Setter + the Pokémon that need it; no Trick Room with very fast attackers; no two clashing weathers |
| 9 | Priority / cleanup | Sucker Punch, Extreme Speed, Grassy Glide finish weakened foes |
| 10 | Every 4 of 6 works | Any four you bring should still cover each other |
| 11 | No "island" Pokémon | A Pokémon the opponent can safely ignore is a wasted slot |
| 12 | Answers to the meta | Ready for the top threats and the common modes (anti-Trick Room, anti-weather, anti-Intimidate: Defiant, Competitive, Clear Amulet) |
| 13 | Type balance | No big stack of shared weaknesses |
| 14 | Physical / special mix | All-physical teams fold to Intimidate |
| 15 | Items | Item clause, items that fit the role (Sash, Sitrus, Choice, Herbs, Covert Cloak) |
| 16 | Speed tiers and stat points | Outspeed or survive what matters; Champions uses stat points |
| 17 | Pace | Hyper offense (≤8 turns), bulky offense (8–12), defensive (10–15, timer risk) |
| 18 | Bo1 vs Bo3 | Bo3 rewards adaptable teams; surprise factor |
| 19 | Pivoting | Parting Shot, U-turn, switching to reuse Fake Out and Intimidate |
| 20 | Backups for key roles | Two Fake Out users, a second Tailwind setter, a way to flip Trick Room back |
| 21 | Answers to Fake Out | Inner Focus, Psychic Terrain, Covert Cloak, ghosts |

19–21 from a YouTube transcript (Champions team-building guide for beginners, b7VisU9fDLI). Note: its example team uses
Reg F Pokémon, so it shows general doubles thinking, not M-C specifics. YouTube transcripts can be read (not the video
itself); top players' Champions videos are a source for Step 1 and later checks.

### From creators' videos (read from transcripts, Nov 8)
Videos: WolfeyVGC with Disguised Toast "how to build a team" (FNQR-6pT8zE), Wolfey "Everything you need to know about
Champions" (zkFbx0Y-LrI) and "How I became #1 ranked in Champions" (lKMl8qWVf1A), TheBattleRoom "A complete guide to team
building in Champions" (I9bXHtYnzGY), Skraw "Team building basics for Champions" (X2irT53Dhhc), TheDelybird "The systematic
approach to teambuilding" (YN718-hqrxw). Several examples are from older formats; the principles carry over.

| # | Factor | Who says it |
|---|---|---|
| 22 | "Good teams have speed control and bad teams don't"; really it's about moving first: priority (Aqua Jet), Scarf, natural speed count too | Wolfey |
| 23 | Something to do against the meta's most common core (Sneasler + Basculegion + Kingambit) | Wolfey |
| 24 | Every Pokémon needs a job ("why do I even have Kingambit on this team?") | Wolfey |
| 25 | Varied roles and attack types: not six of the same kind; physical AND special so one answer doesn't wall you | Wolfey, Skraw |
| 26 | A second Mega is for a different matchup (Wolfey's #1 team: second Mega just for sun). Two Megas = options, not double strength | Wolfey |
| 27 | Wide Guard against a spread-heavy format | Wolfey |
| 28 | Team answers to each common archetype: sun, rain, Trick Room, bulky Floette | Wolfey, Delybird |
| 29 | What hurts the meta: burns vs a mostly physical meta, Leech Seed + burn chip | Wolfey |
| 30 | Redundant (backup) roles; tight synergy but enough flexibility | TheBattleRoom |
| 31 | Defensive core and switching: Intimidate cycling, a switch-in for each common attack | Skraw |
| 32 | Immunities: a Grass type or Safety Goggles vs Spore; a way around Rage Powder | Skraw, Delybird |
| 33 | Second "modes" (reverse Trick Room, a second weather) for bad matchups | Delybird |
| 34 | Stat points: bulk first (HP about Def + SpD); speed benchmarks vs common threats; in-game recruits are trained badly | Wolfey, Delybird |
| 35 | Pokémon you never bring are dead slots; play-testing finds them (we can measure this from replays) | Delybird |
| 36 | Items available in the format differ (M-A lacked Assault Vest, Choice Band, Life Orb) | Wolfey |

Research on grading lineups: draft-prediction work for team games (DOTA 2, League of Legends) models each pick, pairs
(synergy) and counters (opposition), and reports gains from team-wide traits. "Optimizer's curse" (Smith & Winkler):
picking the top-scoring option from many lands on the ones the model overrates most; fixes are shrinking uncertain
scores (Bayesian) and staying close to real, tested options.

## Step 1 · What can the grade see? (checked in the code, Nov 8)

Grade = species strength + pair strength (pairs on 30+ teams) + set features (items/moves on 40+ decks) − player skill,
then the "upside needs proof" cuts below, then matchups (small) and the six's own record. Files: model.mjs,
app/src/app/35-win-model.js (teamX, mixCredit, structCredit, strengthX).

| Factor | Counted? | How |
|---|---|---|
| Mega | Partly | No Mega cuts the team's above-average edge by 15%. A guess, never sized from results. Real no-Mega teams win 34%. |
| Speed control | Partly | Missing: −15% of the above-average edge (guess) |
| Fake Out / Intimidate / redirection | Partly | One combined check, −15% (guess) |
| Spread damage | Partly | −15% (guess) |
| Weather/terrain a Pokémon needs but nothing sets | Partly | −15% (guess) |
| Trick Room with ≤1 slow attacker | Partly | −30% (sized from real results, Oct 27) |
| Dead items, Scarf on the Trick Room setter | Partly | −15% each |
| **Key flaw** | — | These cuts only shrink the part ABOVE average. A missing basic can never make a team below average, however strong its six are. |
| Two Megas | Partly | The two strongest Megas both count in full, though only one can Mega per game |
| Benched Pokémon | No | All six get credit; replays show some are brought 2–12% of the time |
| Protect on 4+ | No | Only as a per-Pokémon move feature |
| Redirection on its own | No | Folded into the lead-support check |
| Plan clashes (Trick Room + fast Tailwind attackers, two weathers) | No | Build for Me blocks two weather setters; the grade doesn't count either |
| Priority / cleanup | No | |
| 4-of-6 flexibility | No | |
| Island Pokémon | No | |
| Physical/special mix, anti-Intimidate | No | |
| Speed tiers vs the meta | No | |
| Pace / playstyle | No | |
| Type balance | Partly | Shown as a tip; tested Nov 8, small effect |
| Answers to the meta | Partly | Matchups (small weight) and learned matchups |
| Item and species clause | Yes | Duplicate species can't be graded; duplicate items resolved |
| Unusual teams | Partly | Untried mixes lose up to half their edge (by tested pairs); no warning shown |
| Player skill | Yes | Fitted and removed |
| Recency | Yes | Half-life 14 days |

Correction (Nov 8): I told Sim earlier that the grade counted none of the team basics. Wrong, from memory: it counts some,
with guessed sizes that can only shrink a strong team's edge. This is why the "check in the code" rule exists.

## Step 2 · Our data: what we have and what's missing (Nov 8)

| Source | What it holds | Can't tell us |
|---|---|---|
| Limitless tournaments (out/matches.json) | 420 events, 5,440 players, 39,352 results, full team sheets (Pokémon, item, Ability, 4 moves, nature) | Which 4 were brought or led; stat points; game-by-game results |
| Victory Road official events (official.json) | Top-cut teams of official events | Full results of every round |
| Showdown ladder replays (out/replays.json) | 20,000 games: both sixes, the 4 brought, leads, which Mega was used, ratings, winner | Items (so whether a Pokémon that didn't Mega held a Mega Stone); the players are mostly not tournament level (median rating 1264) |
| Usage stats (meta_tour, meta_ladder, meta_ingame) | How often each Pokémon, move, item, Ability and nature is used | Why; anything about results |
| Popular complete sets (`cs`) | Most common full set per Pokémon | First daily run Nov 9 |

Gaps found in our data:
1. **Each "game" is really a round.** (Sim, Nov 8: focus on single games first; Champions ranked is best of 1.) Limitless gives one winner per round, so a best-of-3 counts as one result and we
   don't know the game score (2-0 vs 2-1). We've been calling these "games". The grade's sureness should account for it.
2. **1,369 rounds (3.5%) have no winner** (draws, no-shows or missing results). They're treated as half a win each.
3. **Tiny events count the same as big ones.** Half of events have 29 players or fewer, some as few as 3. Small online
   events may be weaker or more casual.
4. **No bring data for tournaments.** Only ladder replays show the 4 brought, and ladder play is a different level.
5. **No stat points anywhere.** Speed comparisons use guessed spreads.
6. **Ladder replays can't show Mega Stones that weren't used.** A team that held a stone but didn't Mega looks like a
   no-Mega team there.
7. **The ladder sample is mostly mid-level players** (median 1264, top tenth above 1594; 7,572 sides unrated).

### Single games first (Sim, Nov 8)
Champions ranked (in-game) is matched by rank, one battle at a time (champions.pokemon.com: Ranked, Casual, Private modes).
Showdown has a separate "(Bo3)" Champions format; our 20,000 replays come from the regular one, so each is ONE game.
Official Regionals (Louisville, Frankfurt, Gdańsk…) are best of 3. Limitless events mix both, per phase (API "mode": BO1/BO3,
e.g. Xperience Play $500: Swiss BO1, top cut BO3; Talon's Fight Club: all BO3). Fetching every event's mode (data/tour-details).

### Replay data quality (Nov 8)
- 20,000 games, no duplicates, Oct 22 – Nov 8 only: the file keeps the newest 20,000, so older games are thrown away.
- "Brought" means *seen*: only 13,247 games (66%) show all 4 for both sides. If a game ended before the 4th came out, that
  Pokémon looks benched. Bring rates from replays undercount the back line.
- Mega forms only show when used, and items aren't recorded, so an unused Mega Stone is invisible.
- Skill: 16,214 games have both players rated; 4,054 have both 1400+, 2,421 both 1500+. Most games are mid-ladder.
- 47 mirror games (same six on both sides), likely rental teams.

## Step 3 · First single-game results (Nov 8, experiments/deep-factors.mjs)
20,000 Showdown ladder games (Oct 22 – Nov 8), never used to train the grade, so an independent test.
- **The grade barely predicts single ladder games: right 52.3% of the time** (coin flip 50%). For comparison the higher-rated
  player wins only 54.7%, so single ladder games are very noisy. On tournament rounds the grade gets about 56%.
- **The grade is about twice too sure for one game.** Best-fit confidence 0.41 vs the 0.87 the page uses (fitted on
  tournament rounds, mostly best of 3). Before the refit its log-loss was worse than a coin flip (0.6934 vs 0.6931).
- Factors, after refitting confidence (side with it vs without, two date slices, ± = 95% range):
  - ~~Wide Guard: underrated~~ **WITHDRAWN after independent review**: 70% of 'Wide Guard' sides are just Pelipper, and with ranges grouped by six it fails the later slice.
  - ~~Spore answer: overrated~~ **WITHDRAWN**: no Spore users exist in these games at all; it was really 'has a Grass type' (Rillaboom, Whimsicott, Sinistcha) and disappears in a joint model.
  - Not proven either way (a ±1.5 range still allows a real 3-point effect; 'not significant' is not 'about right'): speed control, lead support, Fake Out, Intimidate, two Fake Out users,
    redirection, Tailwind, Trick Room, priority, Protect on 4+.
  - Leaning one way but not in both slices: Tailwind AND Trick Room on one team (−3.0, −1.6), two weather setters (+0.6, +5.6),
    5+ physical attackers (−1.1, −3.5), spread damage (+1.4, +3.3).
  - **Mega can't be tested with these replays**: they only show a Mega when it was used, so "has a Mega" really means
    "Mega Evolved this game". Needs data with team sheets.
- Limits: mostly mid-ladder players; typical sets assumed (replays don't show items); factors judged on the six, not the 4 brought.

## Outside help found (Nov 8)
- **VGC-Bench** (UT Austin, Stone lab; arXiv 2506.10326): 88,905 Champions Showdown games (Reg M-A, M-B) with OPEN TEAM SHEETS
  (full items, Abilities and moves) on Hugging Face (cameronangliss/vgc-battle-logs, MIT licence). Older regulations, but
  sets are known, so Mega Stones and items can be tested properly.
- Showdown's Champions "(Bo3)" format forces open team sheets; each game is still one game, with full sets and stronger players.
- Papers on the same problem: pre-game win modelling for League of Legends maps (2026), drafted deck strength in Magic (2026).

### Megas with team sheets (VGC-Bench, Nov 8)
11,028 Champions Showdown games with open team sheets (Reg M-A single games 6,861; M-B single 324; M-B best-of-3 games
3,843; the 550 MB M-A best-of-3 file not used yet). Each game counted once. Mega Stone = item ending in "-ite".
- Sides with 0 stones: only 110 (0.5%), won 45.5% (±9: too few to tell). 1 stone 48.9% (9,912), 2 stones **51.0%** (11,915),
  3 stones 40.3% (119, too few). Two Mega options do a little better than one, which fits Wolfey's "second Mega for a matchup".
- Stone vs no stone head to head: 106 games, 54.7%: too few to tell.
- 14% of teams holding a stone never Mega Evolved in that game, which confirms our ladder replays can't test Megas.
- So no-Mega teams are rare everywhere; the main evidence stays the tournament rounds (34% over 264 rounds).
Older regulations, so for methods and for factors that don't depend on which Pokémon are legal.

### How many tournament rounds are single games? (Limitless API, all 420 events, Nov 8)
365 events are best of 3 throughout, 46 mix (usually best-of-1 Swiss, best-of-3 top cut), only 9 are all best of 1.
By rounds: **5,323 rounds (13.5%) are single games, 34,029 (86.5%) are best of 3.** So the grade was learned almost entirely
from best-of-3 rounds, which explains why it's too confident for one game. Saved per event in data/tour-modes.json
([phase type, rounds, mode]). Single-game data for the grade: ladder replays, best-of-1 rounds, and individual games from
Showdown's best-of-3 format (being collected, with team sheets).

## Independent review (helper agent, Nov 8) and what changes
No code bugs found (winner index checked against the replays). Problems with how I read the results, all accepted:
1. Factors were guessed from each species' typical set; replays hold no moves or items. Fix: read the moves actually used in
   each game's log, and use team-sheet games (best-of-3 Showdown, VGC-Bench) where sets are known.
2. ± ranges too narrow: the same rental sixes appear up to ~500 times. Fix: ranges grouped by six (cluster-robust) by default.
3. The two date slices share 42% of their sixes. Fix: split by six (each six in one half only), or test on later games.
4. One factor at a time misleads. Fix: one joint model with the grade, the rating difference (7 pts per 100 rating, a big
   effect) and the most popular Pokémon as inputs, as the standard check. In it, two Fake Out users come out −2.3 to −3.4 pts:
   follow up, along with Tailwind + Trick Room.
5. Which Mega shows in a replay depends on how the game went (the loser's back row is forced out), and that leaked into the
   grade's own input. Fix: grade replay sixes with no Mega information, the same for both sides.
6. Confidence: 0.41 is real for the ladder but the ladder is a different crowd. Fix: fit it on tournament single-game rounds.
   Done (dev set, later games): best-of-1 rounds (945) want 0.60× the page's confidence (±0.37), best-of-3 rounds (5,325)
   1.08× (±0.17). So for one game the page is too sure (about 0.5 instead of 0.87); for best of 3 it's about right.
7. Wording overclaimed and ~19 factors were tested with no correction for testing that many. Fix: report "not proven" and
   use a stricter bar when many factors are tested at once.
Also: replays feed bring/lead rates into limitless.json, so they aren't 100% separate from the page's data (not who won).

## Step 3 v2 · Rebuilt measurement (experiments/deep-factors2.mjs, Nov 8)
Joint model (all factors + the 15 most common Pokémon + rating gap), ranges grouped by team, halves split by team, strict bar.
**Ladder, 20,000 single games, typical sets, no Mega information (LADDER=1):**
- Confidence that fits: **0.71 ±0.30** (page 0.87). Most of the earlier 0.41 came from the Mega leak and the missing rating.
  Together with best-of-1 tournament rounds (0.60× page, ±0.37): the page is somewhat too sure for one game; best of 3 fine.
- Player rating matters a lot: **6.8 win-chance pts per 100 rating.** The grade can't see the player, so single games will
  always be noisy for a team grade (picks the winner 52.1%).
- **No factor is proven to be missed by the grade** in ladder single games. Leaning (not proven): two Fake Out users −2.7 ±2.4,
  Tailwind AND Trick Room −1.8 ±1.4, 5+ physical attackers −3.1 ±2.4. Fake Out, Intimidate, redirection, Tailwind, Trick Room,
  priority, Wide Guard, Protect, spread, Scarf, Sash: each within about ±2 of zero, i.e. the grade isn't missing them by
  more than ~2 pts, but sets are guessed here.
**Team-sheet single games (Showdown best-of-3 format): 500 so far, far too few (ranges ±8 to ±20). Collecting more.**

### Tournament data quality (Nov 8)
6,333 teams that played: every name is on the M-C roster (0 misread), 1 team lists the same species twice (filtered by the
grade's duplicate check), Mega options per team: 0 = 56, 1 = 1,545, 2 = 4,690, 3+ = 42 (legal: different Mega Stones).
Mega forms come from the team sheet (the stone held), not from play, so tournament data has no Mega leak.

### Sim's D3 vs d4 (Nov 8): pair bonuses drive grades but don't predict
D3 (Basculegion, Kingambit, Mega Gengar, Mega Dragonite, Farigiraf, Rillaboom) 95 vs d4 (Garchomp, Dragonite, Kingambit,
Rillaboom, Mega Charizard Y, Mega Raichu Y) 69. Same readiness (88% vs 86%), 7/7 checks both, Pokémon strengths summed 0.44 vs
0.45. The whole gap is pair bonuses: +0.31 vs +0.05 (Basculegion + Kingambit +0.138, the largest; Mega Charizard Y +
Rillaboom −0.082, the most negative). The model's own held-out test: with pairs 56.9% / log-loss 0.6802, without pairs
57.2% / 0.6800. Pairs spread real teams' grades by sd 0.089 (Pokémon part 0.135) without adding accuracy. Proposed test:
grade without / with shrunk pairs on independent data (later rounds, best-of-1 rounds, ladder). Waiting for Sim's OK.

## Step 3 results from the three helpers + pair test (Nov 8)

**Correction (verified in code): the grade applies NO basics cut at all.** CH.strengthOf (60-concept-h.js:66) uses
strengthX(...).x0, the strength BEFORE structCredit; the Nov 7 change made the 7 checks "advice only" after a test on real
teams (the flawed kind). structCredit only reaches winVs / winVsField. The "Partly" rows above for Mega, speed control,
lead support and spread are wrong: those are "No" in the grade.

**Broken-team tests** (experiments/broken-teams.mjs; 30 strong real teams, one basic removed; real cost from 37,691 rounds,
controlling for player and the six's strength; ranges grouped by team):
| Removed | Grade change (win pts) | Real cost (win pts) | Verdict |
|---|---|---|---|
| Mega | −7.4 (−3.4 without own record) | −13.7 [−21, −5] | too soft, 2–4× |
| Protect on ≤2 | −0.7 (10 of 30 went UP) | −4.1 [−6.1, −2.1] | too soft |
| any speed control | −3.5 | +1.1 [−0.7, +2.9] | too harsh |
| Tailwind / Trick Room | −1.5 | +0.1 | about right |
| turn-1 support | −1.1 | −0.9 | about right |
| Fake Out | −1.4 | +1.4 [0, +2.8] | slightly harsh |
| spread | −1.1 | +0.1 | about right |
Also: a six's own record is looked up by names only, so it keeps its bonus whatever moves change; Protect is valued per
Pokémon with some negative values (Rillaboom −0.085); the model has no Abilities (sheets lack them); one sheet has genders
read as items ("Charizard@m").

**Counting** (experiments/counting-checks.mjs): benched Pokémon: strength of the often-brought half of a six predicts
winners (+0.48 ±0.26), the rarely-brought half predicts nothing (−0.04 ±0.29), so their credit looks wasted; simple
bring-rate weighting +1.5 ±1.7 (not proven). Look inflated: Venusaur, Kingambit, Delphox, Sinistcha, Aegislash, Mawile.
Two Megas: 2-Mega sides beat 1-Mega sides by +3.2 ±2.6 beyond the grade; today's rule about right. Bo1 vs Bo3 strengths:
no shift visible at this size; confidence is the real difference. "Who you beat": unknown.

**Our tools' teams** (experiments/built-teams.mjs): no-Mega builds graded 98.1 and 97.9; tools' teams overshoot their real
5-of-6 neighbours by +5 to +11 win pts (real top cut +3.7); grade vs neighbours' real win rate r = 0.09 at the top; builds have
half the spread users of real teams; v2 box builds run Tailwind + Trick Room on 56% (real 28%); "none would improve it":
33 of 49 real teams with an unmet check got no fixing suggestion (cause: plans must raise the grade by 2, gOK).

**Pair bonuses** (dev models, 6,270 later rounds, compare.mjs): no pairs −0.0001 log-loss / +0.15 pick (no difference);
pairs shrunk 4× +0.0002 / +0.14 (no difference). Pairs add no accuracy either way. Sim's saved teams (dev models):
D3 88 / 84 / 87 and d4 75 / 89 / 82 (now / no pairs / shrunk 4×).

## Step 4 · First fix: team-wide basics learned inside the model (Nov 8, branch only)
model.mjs TEAM_FEATS=1 learns team-level terms from the same tournament rounds; the page adds them in teamX
(teamBasicsOf / teamBasicsX, 35-win-model.js) when the model ships a `team` block (old models: no change).
- Learned (full data): **no Mega −0.49, Protect on ≤2 −0.16** (model units). In win chance ≈ −12 and −4 pts, matching the
  independent broken-team estimates (−14 to −18; −4 to −7). 'No speed control' (+0.04) and 'no Fake Out' (+0.10) came out as
  small bonuses: left out, the grade never rewards lacking a basic.
- Later rounds (dev, compare.mjs): no difference in overall accuracy (expected: real teams nearly all have the basics).
- **Broken-team test now passes for Mega and Protect**: removing the Mega costs −15.0 win pts (was −7.4), little Protect
  −4.5 (was −0.7). Still too harsh: removing speed control −4.6 / Fake Out −2.8 vs real ≈ 0 (per-Pokémon set features).
- Pairs: shrinking 4× in the fit barely shrinks well-proven pairs (Basculegion + Kingambit stays big); no pairs at all is
  equally accurate. Sim's saved teams (full models): live / basics + pairs ÷4 / basics + no pairs:
  Doubles 1 72 / 72 / 66 · Doubles 2 77 / 74 / 65 · D3 95 / 88 / 81 · d4 69 / 72 / 78.

### Step 4 · more fixes (Nov 8, branch only)
- One-game win chance (Battle, realMatch): edges × 0.7 (best-of-1 rounds fit 0.6×, ladder 0.8×).
- A six's own record counts only for Pokémon on a set like the one real players ran (no move outside its 6 most-run, no
  item outside its 3 most-run); imported real sheets keep it.
- Suggestions: every unmet check gets one plan that meets it if it costs ≤3 grade points, with "Meets the … check, for N
  grade points" written on the card (fixes "none would improve it").
- "Teams without Megas" notice now says they're rare (≈1 in 100) and win about a third of games.
- Data: genders read as items are dropped (update.mjs).
- Not done (not proven or later): bring-rate weighting (+1.5 ±1.7), Build for Me ranking by real 5-of-6 neighbours,
  per-Pokémon speed/Fake Out values still a bit harsh, Tailwind + Trick Room clash (leaning, not proven).
**Sim's box with the new grade (live engine):** 1 Mega 89 / 89 / 84, 2 Megas 90 / 87 / 84, all 7/7 except one 6/7;
0 Megas 11 / 5 / 5 (was 66 / 52 / 46; the rolled-back engine's 98 no-Mega team is gone). Tests: ALL PASSED.

### Too lenient before, or too harsh now? (Nov 8, Sim)
The grade is a rank among real tournament teams. Checked against how similar real teams (5+ of the same 6, 30+ games) did,
for the 82 real top-cut teams in out/teams.json, graded by name with typical sets:
| version | A | B | C or lower | grade vs real r |
|---|---|---|---|---|
| live | 57 teams, 55.5% | 10, 55.5% | 15, 52.0% | 0.42 |
| preview (team basics, pairs ÷4) | 24, **56.6%** | 36, **54.7%** | 22, **53.3%** | **0.43** |
| preview + "like for like" scale (typical builds) | 53, 55.6% | 12, 54.3% | 17, 53.1% | 0.39 |
The live grade was too lenient: its A's and B's did exactly as well as each other, so "A" meant nothing extra. The preview's
letters line up with real results in order. The like-for-like scale undid that (and on later rounds put D above C), so it
was dropped. Most of the downward swing comes from the Nov 8 14:34 set-range change already on main (the live model was built
at 10:12), so the live site moves this way with the next daily run regardless.
Build for Me, Sim's box, 2 Megas, preview grade: 90 (similar real teams 57.3%, 1,007 games), 87 (53.9%, 115), 84 (52.9%, 2,888).
