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
