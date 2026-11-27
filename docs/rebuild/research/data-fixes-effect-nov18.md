# Effect of the two prepared data fixes (Tue Nov 17, 2026, 9:20 PM, from docs/rebuild/now.sh)

Look-only helper measurement. Nothing was committed or pushed. Labels: **measured** (number + how), **checked** (how), **unsure** (why).

- Fix 1 = commit 3cc71131: themed-event filters (formats.mjs OFF_FORMAT words, plus the staple-ratio rule for 8+ team events).
- Fix 2 = commit 6c6d227f: one spelling per item, Ability and move (names.mjs canonSet, applied in update.mjs; lkey reads odd stone spellings).
- Background: docs/rebuild/research/data-integrity-nov17.md (findings 3 and 4).

## Short answer

| | Fix 1 (themed events) | Fix 2 (one spelling) |
|---|---|---|
| Records | 12 events left out, 339 games (316 before Nov 9) | 58 sides change their six (Mega now read); 2,175 sides (2.4%) change a set spelling; protectLow flips on 16 decks |
| Default sets | 3 of 100 change, all near-ties | 0 of 100 change; 66 duplicate-spelling rows leave the sets page |
| Usage | 44 numbers move, at most 0.4 points | 0 (ratings' usage table); 1 sets-page number by 0.1 |
| Ratings | 70 shown ratings move (28 by 2+), 3 tier letters | 2 move, 0 tier letters |
| Strength Score (walk-forward) | No difference in any format | Worse beyond chance on best-of-3 and all rounds (tiny); no difference on best-of-1 |
| Tests | pass | pass |
| My recommendation | **Ship** | **Don't ship as is.** Ship the stone reading and the display fold; keep the grade's set features as typed until the cause is found |

## How it was measured (checked)

- Data: the worktree's data/ and out/ are origin/main's Nov 17 data (git diff HEAD origin/main -- data out: empty).
- Harness: _fx/ in the worktree (untracked; delete when done). Each version's code was taken with `git archive`:
  base = 4d348f5b, fix 1 = 3cc71131, fix 2 = 6c6d227f. update.mjs was run offline (its Limitless fetch returns nothing).
- **Measured:** the offline base run reproduces the published out/matches.json, meta_tour.json, limitless.json, teams.json
  and history.json exactly (apart from the "updated" stamps).
- Two builds per version:
  - "full": every event, as the daily job builds it. Used only for structural counts (events, sheets, usage, default sets).
  - "pre": only events dated before 2026-11-09 (and replays before then). Used for ratings, models and the scoreboard.
    The event filters ran on all events first, as in production; then the date cut was applied.
- **Sealed set.** I never opened experiments/sealed.json. The copies got a stub `{"from":"2026-11-09"}` (the date in
  docs/sealed-pass-rules.md). Every matches file fed to a model or the scoreboard had 0 events dated on or after 2026-11-09
  (checked in an3.mjs). The only post-Nov 9 numbers here are counts: 1 event, 23 games.
  golden.mjs, run as a test in the worktree, reads the real sealed.json's start date itself, as it always does.
- Machine: shared with other helpers (load 5-17 on 4 cores). Heavy jobs ran one at a time.

## 1. Records changed

### Fix 1: events left out (measured, an1.mjs on the full builds)

| Date | Caught by | Games | Full sheets | Event |
|---|---|---|---|---|
| Sep 25 | name | 43 | 16 | Thalera Champions Cheese #17 - GEN 3 Edition |
| Oct 12 | staple ratio | 31 | 15 | Matcha Gotcha's Tourney (PRIVATE) |
| Oct 16 | name | 47 | 18 | Thalera Champions Cheese #18 - Só Evos Especiais |
| Oct 23 | name | 40 | 15 | Thalera Champions Cheese #19 - POKÉMONAS |
| Oct 25 | name | 9 | 7 | VGC UU Regulation M-C Weekly #1 |
| Oct 28 | staple ratio | 34 | 16 | VGC: Torneo Express - Temática Halloween |
| Oct 31 | name | 37 | 15 | VGC UU Regulation M-C "Houston Regional 2027" |
| Nov 1 | staple ratio | 11 | 9 | Outlanders Halloween Special: Ominous Wind |
| Nov 7 | name | 16 | 11 | Outlanders Silver&Gold: Gen 2 Showdown |
| Nov 7 | name | 5 | 4 | VGC UU Regulation M-C Bi-Weekly #1 |
| Nov 8 | name | 43 | 21 | Single Type Cup Championships #1 |
| Nov 11 | staple ratio | 23 | 14 | Copa Ranciarda III (sealed window: count only) |

- **Measured:** 12 events, 339 games in matches.json (45,571 → 45,232).
  - Before Nov 9: 316 games. By round format (data/tour-modes.json): 139 best-of-1, 134 best-of-3, 43 unknown.
  - Sealed window: 1 event, 23 games (count only).
  - Limitless teams in the ratings' tables: 15,470 → 15,332. Sets page (last 28 days): 7,942 → 7,830 teams.
- **Checked:** these are the integrity doc's 10 events plus 2 caught by name (Só Evos, UU Bi-Weekly #1).
- **Unsure:** 2 events have names that don't say "restricted" (Matcha Gotcha's PRIVATE, Copa Ranciarda III). The staple ratio
  flags them (0.34, 0.18). Same doubt as the integrity doc.
- **Note for the sealed look:** Copa Ranciarda III (23 games) would leave the sealed set. That is small, but it changes what
  Check 1 scores, so Sim should know before the look.

### Fix 2: game sides whose names change (measured, an1.mjs, fix 1 vs fix 1 + fix 2 full builds)

- Compared: 90,464 game sides. Rows that don't line up: 0 (same pairings, same order).
- **Six changes (Mega now read): 58 sides (0.06%), all before Nov 9.**
  - Raichu → Raichu-Mega-Y ×25; Garchomp → Garchomp-Mega-Z ×10; Lucario → Lucario-Mega-Z ×6;
    Garchomp + Raichu → both Megas ×6; Floette-Eternal → Floette-Mega ×6; Charizard → Charizard-Mega-Y ×3; Absol → Absol-Mega-Z ×2.
  - The noMega flag changes on 9 sides.
- **Set spelling changes: 2,175 sides (2.40%); 1,820 of the 79,768 sides before Nov 9.**
  - Largest: Staraptorite → Staraptite ×189 sides, Rillaboom U-Turn → U-turn ×119, Make it Rain → Make It Rain ×69,
    encore → Encore ×60, Venosaurite → Venusaurite ×50.
  - Distinct features 8,019 → 7,409. Distinct teams 6,900 → 6,893. Features on 40+ decks (the model's bar) 903 → 904.
  - protectLow flips on 64 sides (16 decks; matches the integrity doc's 16).
- Kept as written (update.mjs log): 93 items, 87 Abilities, 176 moves (e.g. "Last Respect" ×47, "Lighting Rod" ×14,
  "Passcho Berry" ×11). Fix 2 never guesses these.
- **Gap found (measured):** fix 2 does not re-read data/t.
  - data/t stores each Pokémon's key from the day it was fetched.
  - 16 team entries in 16 old events keep the old base-form reading: Raichu ×8, Garchomp ×5, and 3 others.
  - So limitless.json (the ratings' usage, win rates, adj, pairs, cores), history.json and oddEvents are byte-identical
    with and without fix 2. Only what is built from data/t2 changes: meta_tour, matches, the top-cut evidence, events.json.
  - Small, but the two halves of the site would disagree on those 16 teams. A one-off re-key of data/t would close it.

## 2. Published numbers

### Usage (measured, an2.mjs, full builds)
- **Fix 1:**
  - Ratings' usage table (limitless.json tour, all events): 44 numbers move; 6 Pokémon leave (319 → 313 rows).
  - Largest moves: Rillaboom 45.2 → 45.6, Incineroar 34.4 → 34.7, Charizard-Mega-Y 17.7 → 17.9. 5 move 0.2+, none 0.5+.
  - Sets page (last 28 days): 50 of the 100 published usage numbers move, at most 0.4 (Incineroar 31.4 → 31.8).
    35 usage ranks change. Altaria-Mega joins the 100; Mimikyu leaves.
- **Fix 2:** the ratings' usage table doesn't change at all (data/t gap above). Sets page: 1 number (Garchomp-Mega-Z 11.1 → 11.2).

### Default sets (measured, an2.mjs: `cs`, the most common complete set, for the 100 published Pokémon)
- **Fix 1: 3 of 100 change.** All three are the near-ties the integrity doc listed:
  - Maushold: Follow Me/Taunt → Bite/Feint (6.8% → 7.8%).
  - Mawile-Mega: Intimidate → Hyper Cutter (14.6% → 14.3%).
  - Typhlosion-Hisui: Overheat → Curse (13% → 14%).
  - Share of teams on the same default set changes for 73 (largest: Espathra 55.4% → 62.5%).
- **Fix 2: 0 of 100 change.**
  - 25 shares rise as spellings merge (largest: Venusaur-Mega 16.4% → 20.9%, Blaziken-Mega 56.1% → 59%).
  - 66 duplicate rows leave the published item, Ability and move lists (e.g. Rillaboom "U-turn" and "U-Turn",
    Incineroar "Intimidate" and "intimidate"). Without fix 2, the sets page shows these duplicates today.
  - 4 top-of-list moves swap places. Each was a near-tie, e.g. Rillaboom Grassy Glide 98.9% / Fake Out 98.7% → both 99%.

### Pokémon ratings (measured, an4.mjs)
Method: `rating(p).total` from the built page (ratings-snapshot.mjs's method) on the pre-Nov 9 builds, 345 Pokémon.
Shown number = the page's RS(). Tier letter = LTIERS.

- **Fix 1:**
  - 70 shown ratings move: 28 of the 100 highest, and 28 by 2+ points.
  - Largest: Tsareena 21 → 12, Arcanine 36 → 28, Scolipede-Mega 25 → 19, Inteleon 18 → 12, Clefable 40 → 36, Gliscor 40 → 36.
  - 3 tier letters change, all at a border: Snorlax D → F (51 → 49), Indeedee-F A → B (80 → 79), Dragapult D → C (59 → 60).
  - **Unsure:** the live ratings (with Nov 9+ events) would move by a similar but not equal amount; I did not build them.
- **Fix 2:** 2 move (Floette-Eternal 19 → 21, Raichu 22 → 23). 0 tier letters.

## 3. Strength Score: walk-forward scoreboard (measured)

- Method: experiments/split-scoreboard.mjs (origin/main 3eee1e76), the walk-forward.mjs method.
  - 4 weekly windows, Oct 12 to Nov 9 (exclusive).
  - model.mjs trained only on events before each cut, board.mjs with the trained stretch (BOARD_FIXCAL=1).
  - Row: "site today, minus matchups". Each version's own pre-Nov 9 matches.json.
- **Checked:** the base run reproduces the Nov 17 split numbers exactly (best-of-1: 1,919 games, 54.30%, 0.68579, edge scale 0.73;
  best-of-3: 15,885, 56.04%, 0.68001, 0.97; all: 18,642, 55.86%).

### Each version on its own games (95% ranges, 200 resamples by tournament)

| Version | Format | Games | Picks % | Log-loss | Edge scale |
|---|---|---|---|---|---|
| base | best-of-1 | 1,919 | 54.30 (52.55–55.91) | 0.68579 | 0.73 (0.46–0.96) |
| base | best-of-3 | 15,885 | 56.04 (55.14–56.87) | 0.68001 | 0.97 (0.87–1.06) |
| base | all | 18,642 | 55.86 (55.25–56.52) | 0.68088 | 0.93 |
| + fix 1 | best-of-1 | 1,818 | 54.62 (52.64–56.84) | 0.68416 | 0.78 (0.53–1.06) |
| + fix 1 | best-of-3 | 15,759 | 55.99 (55.12–56.83) | 0.68020 | 0.96 (0.86–1.07) |
| + fix 1 | all | 18,372 | 55.85 (55.13–56.62) | 0.68081 | 0.93 |
| + fix 1 + fix 2 | best-of-1 | 1,818 | 54.57 (52.73–56.60) | 0.68439 | 0.78 (0.51–1.09) |
| + fix 1 + fix 2 | best-of-3 | 15,759 | 55.89 (55.00–56.74) | 0.68042 | 0.97 (0.87–1.08) |
| + fix 1 + fix 2 | all | 18,372 | 55.75 (55.03–56.49) | 0.68101 | 0.93 |

The base rows score 270 more games (the themed events), so the rows aren't like for like. The verdict is the paired test below.

### Paired, same 18,372 games (experiments/compare.mjs, the agreed keep rule: 2,000 resamples by tournament)

| Comparison | Format | Log-loss gap (95%) | Picks gap, points (95%) | Verdict |
|---|---|---|---|---|
| fix 1 vs base | best-of-1 (1,818) | −0.00016 (−0.00049 to 0.00010) | −0.17 (−0.56 to 0.40) | no difference |
| fix 1 vs base | best-of-3 (15,759) | +0.00003 (−0.00006 to 0.00014) | +0.01 (−0.12 to 0.15) | no difference |
| fix 1 vs base | all | +0.00001 (−0.00009 to 0.00009) | −0.02 (−0.13 to 0.10) | no difference |
| fix 2 vs fix 1 | best-of-1 | +0.00023 (−0.00020 to 0.00069) | −0.06 (−0.63 to 0.55) | no difference |
| fix 2 vs fix 1 | best-of-3 | +0.00021 (0.00002 to 0.00043) | −0.11 (−0.27 to 0.05) | **worse beyond chance** |
| fix 2 vs fix 1 | all | +0.00020 (0.00002 to 0.00041) | −0.10 (−0.24 to 0.06) | **worse beyond chance** |
| both vs base | best-of-3 | +0.00025 (0.00002 to 0.00052) | −0.10 (−0.31 to 0.09) | **worse beyond chance** |
| both vs base | all | +0.00021 (−0.00002 to 0.00045) | −0.13 (−0.28 to 0.07) | no difference |

(Positive log-loss gap = the second version is worse. Unknown-format rounds, 795 games: no difference in every comparison.)

- **Which part of fix 2 costs it (measured, one extra run):** a variant with fix 2's stone reading but sheets left as typed.
  - Stone reading alone vs fix 1, all rounds: +0.00004 (−0.00002 to 0.00010). No difference.
  - The spelling fold on top: +0.00016 (0.00001 to 0.00034). Worse beyond chance.
  - So the spelling fold is the part that costs.
- **Unsure why.** My guess, not yet tested: a variant spelling ("protect", "Zoom lens") marks a less practised player. As its own
  feature it carried a little player signal, and the fold removes it.
- **Size:** about 0.1 pick points and 0.0002 log-loss. Tiny. Still, it fails the never-get-worse gate in CLAUDE.md, and it
  never improves any format.
- **Not checked:** a second walk-forward period, so whether this small loss is stable.

## 4. Tests (checked, worktree at 6c6d227f = both fixes, Nov 17 committed data)

| Check | Result line | Meaning |
|---|---|---|
| `node app/test/run.mjs` | `ALL PASSED` (exit 0, 0 FAIL lines) | the site builds and every page works with the fixed code |
| `node experiments/golden.mjs` | `10 of 10 known-answer cases pass` (exit 0) | known teams still grade as expected |
| `node experiments/same-grade.mjs` | `ALL PASSED` (exit 0) | every page shows one team the same grade |
| `node experiments/formats-test.mjs` | `formats: all passed` (exit 0) | fix 1's filters work. On base code: 10 checks fail, exit 1, so the test can fail |
| `node experiments/canon-test.mjs` | `canon: all passed` (exit 0) | fix 2's fold works. On base code: 16 checks fail, exit 1 |

formats-test also passes on the fix 1-only code. The tests ran on the committed data, not on data rebuilt with the fixes.

## 5. Recommendation (each is Sim's call)

1. **Fix 1: ship.** Reason: it removes 12 restricted events and costs the Strength Score nothing measurable in any format.
   - It lowers niche Pokémon's ratings that themed cups had propped up (Tsareena, Arcanine).
   - Before shipping: tell Sim that 2 left-out events are unsure, and that 1 sealed-window event (23 games) leaves the sealed set.
2. **Fix 2: don't ship as is.** Reason: the spelling fold makes the grade slightly worse beyond chance on best-of-3 and all rounds.
   That fails the never-get-worse gate, for no gain on best-of-1.
   - Its display part is clearly good: 66 duplicate rows gone from the sets page, Mega Stones read, protectLow right on 16 decks.
   - Suggested split, for the main session:
     - Keep the stone reading everywhere. It is neutral for the grade (measured above).
     - Fold spellings only for what players see: meta_tour, top-cut evidence, events.
     - Build matches.json's set features from the sheets as typed. The grade then equals the measured stone-only variant.
     - Re-key data/t once, so the 16 old teams agree with the rest.
   - Then re-run formats-test, canon-test (it checks update.mjs's text, so it needs updating) and the scoreboard.

## Appendix: harness (worktree _fx/, untracked; never committed)
- patch.mjs: offline `get`, UNTIL date cut, replay date cut in the copies' update.mjs. events.mjs got the same UNTIL cut.
- an1.mjs: records. an2.mjs: usage and default sets. an4.mjs: ratings. rsnap.mjs: ratings-snapshot.mjs writing to a file.
- an3.mjs / pool.mjs: paired comparison on common games (key = event id, round, order within the round).
  compare.mjs ran on pool.mjs's aligned files.
- chain.sh: the build and scoreboard order. Outputs: _fx/res/ (logs, an*.out, compare*.out) and _fx/<version>/out/wf/split/wf4/summary.json.
