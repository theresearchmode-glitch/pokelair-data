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

### Re-check of our tools with the preview grade (Nov 8, experiments/built-teams.mjs, GRADE_MODEL)
| | before (live grade) | after (preview grade) |
|---|---|---|
| real teams with an unmet check and no fix offered | 33 of 49 | **2 of 49** (both the Nice winner's six, "w3") |
| built / suggested teams, same | 10 of 21 | 1 of 22 (rolled-back engine) |
| grade minus how similar real teams did: real top cut | +3.7 pts | **+0.9** |
| Build for Me, box (live engine) | +5.3 | −4.6 (now a bit low; 9 teams) |
| Build for Me, whole roster (live engine) | +10.7 | +3.7 |
| suggestions | +3.4 | +1.9 |
| no-Mega builds | 98 / 98 | 1 to 36 |
Rolled-back engine still picks 4/7-check teams: stays off.

### Open items closed (Nov 8)
1. "Box builds graded ~5 low": an artifact. The 3 no-Mega builds were compared with real teams whose 6th Pokémon was the Mega.
   Box builds WITH a Mega: −0.5 pts on average (spot on). No change.
2. Two real teams with no fix: if every fix costs more than 3 grade points, the cheapest one is now shown with its cost and
   "a real trade-off". Re-check: 0 of 49 real teams and 0 of 22 tool teams left without a fix (was 33 / 10).
3. Rolled-back engine: stays off (not used).
4. Speed control / Fake Out "a bit harsh": real later rounds show teams without speed control doing as the grade expects
   (+0.6, range −3.8 to +5.0). Not proven wrong; no change made on a guess.
Tests: ALL PASSED. Preview republished (Version 2).

### Step 4 · "Careful and honest on unusual teams" (Nov 8)
- Checked first: on later real rounds, games where a side's grade was "Low" sureness (289) were predicted BETTER than the grade
  claimed (picked 66.4%, best edge scale 1.55×). An extra penalty for unusual teams isn't supported, so none was added.
- Build for Me's live engine returns real proven sixes first (graded, own record shrunk); its teams are within −0.5 (box, with a
  Mega) to +3.7 (whole roster) of how similar real teams did.
- Plain warning added: under the grade, only when "how sure" is Low: "Few real games back this mix yet, so it's a best guess".
  Checked on a phone-size page (rare six → shown; well-known six → not shown). Tests: ALL PASSED.
Step 4 is complete except Sim's review (d4-ok).

## Step 3 completed on team-sheet single games (Nov 8, 5,250 Showdown best-of-3-format games, each one game)
Independent of the grade's training data, with real sets.
| | live grade | preview grade |
|---|---|---|
| picks the winner | 54.5% | 54.5% |
| log-loss at the page's confidence (lower = better) | 0.6851 | **0.6831** |
| confidence that fits (page 0.87) | 0.88 ±0.27 | 0.89 ±0.23 |
Preview slightly better (not tested for significance). No factor proven to be missed beyond the grade (joint model, ranges by
team); "no Mega Stone" −21 ±16 but on ~0% of teams (too few to tell); leaning: 5+ physical attackers +6.0 ±5.9.
**One-game confidence revised:** sheet games say the page's confidence is right for one game (1.02×, ±0.26); with the ladder
(0.82×) and best-of-1 rounds (0.6×) weighted by precision, ≈0.87 → ONE_GAME_K 0.7 → 0.85.
**Sealed set:** starts with events on Nov 9, so it has no games yet; Step 4's sealed check runs once 1–2 weeks of events exist.

## Live (Nov 9, 00:2x UTC, Sim: "Put it live now")
main 71a7abc; live page Version 125; live meta/model v25 (team basics, pairs ÷4, monSd). Sim's saved teams on the live data:
D3 88, d4 72, Doubles 1 72, Doubles 2 74 (same as the approved preview). Daily model now builds this way by default.

## Foundation Phase 2 (Build for Me), Nov 9
- Box mode, honestly: under the best box team, "To reach an A: catch X for Y" (or the best single catch if it adds 3+
  points), decided by the real grade; now in the live engine (it only existed in the rolled-back one). Sim's box, 1 Mega:
  "catch Garchomp for Hydreigon" (that six: 630 real games, 59%). Speed: rough pass on names, grade only 12 → +0.3 s.
- Known-answer tests (experiments/golden.mjs) with the live grade: 8 of 10.
  Fixed test flaws: build-around compared a 2-Mega build with 1-Mega real teams; the Apply check read hidden text (now
  textContent): Apply = promised grade 6 of 6; build-around 10 of 10; boxes 3 of 3; 1 / 2 Megas within 0 of the best real team.
  Still failing: (a) "0 Megas must grade B": the expectation predates the finding that no-Mega teams win 34%; needs Sim's OK
  to change. (b) "75% of Limitless top-4 teams grade B+": 65%. 10 of the 19 low ones contain a Pokémon seen on under 1,500
  team-games (new Megas: Drampa, Scovillain, Chandelure, Altaria; Araquanid, Floette-Eternal), vs 7 of 35 of the B+ ones.
  Likely cause to test next: thin-data Pokémon are pulled toward average. Open problem on the grade, so Phase 2 stays open.

## Nov 9 (later): Sim's reports, thin-data check, Trick Room check
- Golden case "0 Megas" changed (Sim: "do what you think is best"): the build must hold no Mega and grade below the 1-Mega build. 9/10 pass;
  the open one is top-4 online teams B+ (65% vs 75%).
- Thin-data teams (a Pokémon with <150 earlier team-games): on later games the grade points the right way but is too timid
  (needs ~1.5x bigger edges; 95% range 1.15-2.1; both halves). Not caused by matchups, own record, untried-pair caution or sets.
  The extra evidence pull (n/(n+1000)) is part of it: removing it (EVID_K=0) improves later-game log-loss by 0.0009 (95%: 0.0002-0.0016,
  both halves, 54/88 events) and lines letters up better; the timidity only drops to ~1.45x. Not shipped: full-model checks pending.
- Trick Room without 2 slow teammates (Sim: Farigiraf suggested to fast d7): tested as a team factor. Later games say NO: it made
  predictions worse (+0.0005 log-loss, 95% +0.0002..+0.0009). Farigiraf-TR teams with <2 slow teammates won 49.7% later vs 47.0% the grade
  expected (2+ slow: 51.1% vs 49.5%). Off by default (TR_FEAT=1). Farigiraf on fast teams is mostly Armor Tail (blocks Fake Out/priority).
- Fixed (branch, not live): Load team on Full teams loads with Undo (the in-row question was missed); lock button on Your Six cards.
- Top-4 test flaw found (Sim: "if top teams are not scoring well the grade is off"): it graded each team with default sets. With their
  own team sheets 43/54 online top-4 teams grade B+ (80%, median 91.5); golden now 10/10. The lowest are sixes with long weak records
  (Raichu-Y/Volcarona/Garchomp-Z six: 960-1169 over 2,129 games). Site fix: Full teams "Load team" uses a recent event's sheet for that six.
- Evidence pull: keep 1000 for now. Full models: K=0 grades a made-up rare six 89 (Scrafty, 25 teams, valued like Sneasler), K=100 83,
  K=300 75, 1000 62. Build for Me chases the highest grade, so noisy high values on rare Pokémon are a real risk; the later-game gain
  (0.0004-0.0009) does not justify it yet. Revisit with a per-Pokémon check rather than one dial.

## Nov 9 (afternoon): the top-cut scare, complete sets, Accuracy Lab

**What failed.** GitHub went red at 11:42 UTC, the first run on today's data, and the first data with complete tournament sets
(update.mjs `cs`, added Nov 8 20:49). Every test since the complete-sets change had run on data without them: a test gap.
- Pelipper's complete set has no Tailwind, so two threat rows flipped. Correct for that set (Zard Y faster, Ancient Power
  86-102%). Rows now name the set they test; a new row checks the complete set is "soft".
- Leads: +1.2 for Fake Out even next to the team's own Psychic Terrain. Now -1. Replays: led-with-our-pair +3.1 -> +3.2 pts
  (~2,770 games), too few affected games to measure an effect.
- Apply wrote the newcomer's Ability as "chosen" (graded exactly) while the card graded a typical build: rank off by a point.
  Now unchosen unless the suggestion picked it.
- Top-cut share 80% -> 72%. Investigated, not a worse grade:
  - Same teams, either model: 80% / 80%. The 58 most recent teams rotate; the same grade read 72-81% day to day.
  - 436 top-4 teams with the players' own sheets: old model 86%, Deep Check 72%, today 74%. Without each six's own record:
    74 / 71 / 70%. About 12 points of the old 86% counted teams' own wins (circular).
  - Forward (trained before Oct 25, 200 later top-4 teams): old model code 68%, today 70%.
  - Sets are real signal (held out: 0.6853 without, 0.6813 with); set strength 60 beats 200 / 600 / 2000 (I first guessed
    weaker sets would do as well: wrong). golden's sheets now load through the site's own memberOf (Mega Abilities).

**Accuracy Lab (Sim: "what's the best way to see actual improvements?" ... "Lets go for it").**
- experiments/walk-forward.mjs: 4 weekly cuts before the sealed set, each scored by a model trained only on earlier events,
  as the site grades (board.mjs + team rules + the model's own stretch). Baseline: 18,618 games, log-loss 0.68195, higher
  grade wins 55.49%, calibration gap 1.86 pts (said 67% -> won 62%), top-4 teams B or better 271/392 (69%).
- experiments/accuracy-gate.mjs (own CI job) replaces the fixed 75% bar: last 2 weeks vs experiments/accuracy-baseline.json;
  fails below baseline - 2 SE (61.9%) / 60%, or log-loss +0.005. Can fail: scrambled strengths -> 1/188 FAIL. Can't see: small
  changes (use walk-forward + compare.mjs). Log-loss alone barely moved on the scrambled grade (own record soaks it up).
- golden top-cut: 60% floor on 436 teams. Open: weekly settings re-check (step 4).
- **Decision (rule's first use, Nov 9):** the weekly re-check's full retune picked Pokémon shrink 3 over the locked 10 on
  validation games. Walk-forward, 18,618 later games in 221 tournaments: log-loss B − A +0.00014 (95% range −0.00029 to
  +0.00051), pick +0.14 pts (−0.17 to +0.45) → NO DIFFERENCE. Locked 10 kept; model-settings.json unchanged.

## Nov 9 (late morning ET): live protection, watchdog, split tests, health fixes
- Live branch: Promote moves `live` only after the full test run passes; the data refresh task reads live/out/.
- Found: commits by GitHub's own jobs never start other workflows, so fresh data was never tested and live could not move.
  test.yml now also runs when the daily data, weekly and monthly jobs finish. Proven: monthly finished 10:12 AM ET -> tests
  started by themselves -> code tests (frozen data), data checks (today's data), accuracy gate all green -> live 0c992f6 -> e51c5c1.
- Watchdog (12:47 UTC daily): red on failures AND jobs that silently stopped (proven with a 3-day time shift).
- Health fixes: dead RK9 cross-check removed; skipped cross-checks/sources alarm on day 2; Pikalytics reader dropped Mega
  Floette silently (N/A row, unknown name) -> 50/50 rows, 0/40 disagreements; by-design difference is information.
- Monthly check's first GitHub run: picks 54.74%, A 54.8% vs C 49.3%; threat matchups +0.7 +/-1.0 (unknown).
- Type coverage (Sim's question, 20,000 ladder games): offense r = 0.003 (no effect); stacked weaknesses -1.4 +/-0.9 overall
  but one half only (not confirmed; idea to test).

### Nov 9 (evening): two scoreboard fixes; the grade is well calibrated (measured)
- Found 1: walk-forward fitted the model's stretch on every event on or after the cut, i.e. on the week being scored (Nov 2 cut:
  51 of 52 events) plus one sealed-set event. Fix: each week trains exactly like production on the data as it stood at the cut
  (later games AND later events dropped; a guard stops the run if a week's model doesn't ship). My first attempt left the later
  events in, so 3 of 4 weekly models never shipped and I briefly reported fallback numbers as the grade's; caught, reverted.
- Found 2: the scoreboard's "site today" row used own-record τ .35; the site ships τ .1 (six.mjs). That row alone read
  "said 67% -> won 62%" (my earlier "overconfident at the top" claim was this row, not the site: wrong, corrected).
- Corrected scoreboard (4 weeks, 18,618 later games): log-loss 0.68083, higher grade wins 55.81%, calibration gap 1.07 pts:
  said 52->51, 57->58, 62->61, 67->66, 73->75 (328 games). Top-4 teams B or better 266/392 (68%).
- Own record (site τ .1) vs none: NO DIFFERENCE (log-loss -0.0001, 95% -0.0003 to +0.0001). Kept (never remove functionality).
  The stronger τ .35 version is clearly worse (KEEP-level gap 0.0017): don't strengthen it.
- Matched stretch for the refit model (CAL_MATCH): no effect (0.68238 vs 0.68241 on the old row); the refit's edges are only
  ~2% wider. Dropped.
- Gate baseline re-recorded on the corrected scoreboard (last 2 weeks: log-loss 0.68046, top-4 B+ 128/188); Sim approved.
