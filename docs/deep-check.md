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
