# What the Strength Score can't see yet, and which data would fix the biggest gaps
Written Tue Nov 17, 2026, 6:01 PM EST (clock: docs/rebuild/now.sh). Look-only helper. I edited no site code, ran no git
command that changes anything, and did not open the sealed test set. Data was read from origin/main (Nov 17) into /tmp/helper-gaps.
Labels: **checked** (file:line or URL) · **measured** (number, how) · **unsure** (why). No player names.

## 0. Short answer
1. The score sees which Pokémon a team uses, its sets (items, Abilities, moves), Mega or no Mega, Protect on 2 or fewer, readiness
   for the top 30 threats (at a small weight) and the six's own record. It is learned only from Limitless rounds. Most of those
   rounds are best of 3, and it is judged on the same kind of rounds. (checked)
2. It cannot see: which 4 get brought, natures and stat points, synergy inside the four, the field a ranked player really faces,
   or single-game results. 6,309 recent tournament games have no best-of-1/best-of-3 label. (checked, measured)
3. The biggest single data gap is not a factor. It is the judge: we don't have enough labelled single games to tell whether any
   fix helps. Several tests ended "unknown: too little data". (measured; see section 3)
4. Top 5 data steps: (1) label every round's format and build a single-game scoreboard; (2) keep every Showdown game instead of the
   newest 20,000; (3) learn from Showdown's open-team-sheet single games too; (4) bring rates; (5) readiness weighted by the field
   ranked players face, plus Reg M-D stat points. Only step 5's new outside source needs Sim's OK on terms; every daily-job
   change needs her go.
5. Expected gains are small, about 0.0005-0.002 log-loss per step (my guess, sized from past wins such as matchups −0.0014).
   Player skill matters about twice as much as the team (measured), so no data step will make one game easy to call.

## 1. How the score is built today (checked in the code)
- Strength Score = `CH.strengthOf` (app/src/app/58-strength.js:76): `x0` from the win model, eased by at most a quarter when the
  mix is untried (tested pairs), then `+ 0.003 × (readiness − 79)` (58-strength.js:75), then `+` the six's own record (`CH.sixOf`,
  58-strength.js:33, τ .1 in six.mjs:14). The result is shown as a chance against today's tournament teams (`CH.fieldWin`, :65).
- `x0` = `teamX` (35-win-model.js:44): Σ each Pokémon + Σ pairs (shrunk 4×) + each member's set features + team terms. Only the two
  strongest Megas count. Set features are centred and clamped to the real range (`setOne`, :25). A set the player didn't change
  counts as a typical build (:22). Dead items lose their set credit (`strengthX`, :93).
- Team terms that ship: `noMega −0.6156`, `protectLow −0.1667` (model.mjs:46; live model of Nov 17: 43,694 games, 495 events,
  322 Pokémon, 265 pairs, 921 set features (174 item, 140 Ability, the rest moves), calib 0.726, half-life 14 days). (measured: read
  origin/main out/model.json)
- `structCredit` (speed control, lead support, spread, weather and Trick Room plans) does NOT reach the score: `strengthOf` reads
  `x0`, before it. (checked :93 and 58-strength.js:76; also deep-check.md, Nov 8-9)
- Readiness = `THR.teamReport` (55-threats.js:343): 1-on-1 damage calcs, both ways, against the top 30 threats. Threats are
  weighted by recency-weighted **top-cut** share (:330). Their sets come from top-cut sheets (15+ sets). Spreads come from Smogon
  1630+ `commonSpread`, or your own spread (`fromMember`, :77).
- Training data: `out/matches.json` from update.mjs:194. Each Limitless round (one winner per round) becomes one game, with the
  item, Ability and moves of each Pokémon. **No nature, no stat points, no best-of-1/best-of-3 flag.** Draws are dropped
  (model.mjs). (checked)
- Learned matchups (`ctr.mjs`) and lead values (`leads.mjs`, from ladder replays) are shipped but used only in Battle, never in the
  score (ctr.mjs:35; 35-win-model.js:181). (checked)
- The judges (walk-forward.mjs, accuracy-gate.mjs, site-board.mjs, compare.mjs) have no best-of-1 filter. They score all Limitless
  rounds, which are ~86.5% best of 3. (checked: grep found no `tour-modes`/`BO1` in them)

## 2. "What can the score see?" (Nov 17, from the code)
Sees = Yes / Indirectly (only through which Pokémon and sets are on the team) / Notes only (shown, not counted) / No.

| What decides real battles | Sees it? | How, and with what data | What real results say (measured, in the repo) |
|---|---|---|---|
| Each Pokémon's strength | Yes | `mons`, Limitless rounds, player skill fitted out, shrunk n/(n+1000) | Sorts weak from strong. Between viable Pokémon it is about a coin flip: picks the better six in real one-swap pairs 52.4% (real-swaps-site.mjs; deep-check.md) |
| Sets: items, Abilities, moves | Yes | centred set features, clamped to real range (35-win-model.js:25) | Sets are real signal: held-out 0.6853 without vs 0.6813 with (deep-check.md, Nov 9) |
| Natures | No | not a model feature (update.mjs:194). Readiness uses the common nature only | **unknown**: never tested. Data exists on 100% of sheets (125,262 of 125,262, data-inventory-nov17.md) |
| Stat points (spreads) | Indirectly, readiness only | Smogon 1630+ top spread, or the user's spread, in damage calcs | **unknown**. No results source has per-team spreads (data-inventory §3) |
| Mega | Yes | `noMega` team term; only 2 strongest Megas count | Real no-Mega teams win 34%. Broken-team check matches real (−19.4 vs −18.2 win pts; strength-score.md) |
| Protect | Yes | `protectLow` (Protect family on ≤2) + per-move features | −4.4 in score vs −6.8 real (strength-score.md Phase 4) |
| Speed control (Tailwind, Trick Room, Icy Wind, Scarf) | Indirectly; Notes only | per-move features; readiness counts the Tailwind/Trick Room the team runs | No measured benefit: −0.6 (−1.7 to +0.5) (checks-real.mjs). Score −4.6 when removed vs real +0.7 (broken-teams.mjs). Ladder ±2 of zero (deep-factors2.mjs) |
| Fake Out / Intimidate / redirection | Indirectly; Notes only | per-move and per-Ability features; Intimidate inside readiness calcs | Lead support −1.6 (−2.6 to −0.4) (checks-real.mjs); Fake Out removal +1.4 real (broken-teams) |
| Spread damage | Indirectly; Notes only | per-move features; spread modifier in calcs | +0.1 (−1.1 to +1.4), no benefit (checks-real.mjs) |
| Type coverage (defence) | Indirectly | through Pokémon; shown as tips | Alone helps (+1.3 spread-out weak spots), but once Pokémon and sets count: unknown (strength-fit.mjs Fit 1 vs Fit 2) |
| Type coverage (offence) | Indirectly | through Pokémon and readiness | Ladder r = 0.003; Fit 1: +0.39/type, unknown |
| Matchups vs top threats (readiness) | Yes, small weight | 0.003 per point, 1-on-1 calcs vs top 30 by top-cut share | The only factor that adds beyond the Pokémon: +1.05 per 10 points (0.38 to 1.76) (strength-fit.mjs). A bigger weight (.0038) made no difference (compare.mjs) |
| Matchups vs THIS opponent (learned) | No (Battle only) | ctr.mjs | Helps one game (56.68 → 57.50% picks). As a field average it is worse (55.85%) (site-board.mjs) |
| Archetype (weather, Trick Room, hyper offense) and plan clashes | No | 18-archetypes.js is display only. `trNoSlow` was tested and is off | Trick Room with <2 slow made predictions worse (+0.0005). Tailwind + Trick Room −1.8 ±1.4, leaning, not proven (deep-factors2.mjs) |
| Physical/special mix, 3+ of one type | No | — | Fit 1: +1.06 and −1.33, both unknown (strength-fit.mjs) |
| Item Clause, items that work | Yes | `resolveItems`, `itemWorks`, dead items lose credit | Not testable on real sheets: 0 with a problem (checks-real.mjs) |
| Which 4 are brought (bring 4 of 6) | No | all six count fully | Often-brought half predicts +0.48 ±0.26; rarely-brought half −0.04 ±0.29. Bring-rate weighting +1.5 ±1.7, not proven (counting-checks.mjs) |
| Leads / lead pairs | No (Battle only) | leads.mjs, ladder | Lead pair adds nothing once the brought four is known (four-synergy.mjs) |
| Synergy inside the four | No | — | **unknown**: 13,265 ladder games too few (four-synergy.mjs) |
| Two Megas as options | Yes, capped at 2 | `teamX` | 2-Mega sides +3.2 ±2.6 beyond the grade; the rule is about right (counting-checks.mjs) |
| The six's own record | Yes, τ .1 | six.mjs | No difference beyond chance; kept (walk-forward, Nov 9) |
| Player skill | Removed by design | fitted out in training | About 2× the team: skill alone 59.5%, team alone 53.7% (skill-vs-team.mjs) |
| Single game vs best of 3 | No (score). Battle's one-game chance only | rounds are unlabelled in training | Confidence that fits one game: best-of-1 rounds 0.60×, ladder 0.82×, sheet games 1.02× (deep-check.md) |
| Meta drift | Yes | half-life 14 days; field = last 45 days | — |
| In-game ranked play (the real target) | No | no public results source | **unknown**: we can't measure it at all (data-sources.md) |

## 3. Data gaps: what would close each one
"How much" = what exists now (Reg M-C), then what to expect for Reg M-D (from Dec 2). Sizes are measured from origin/main on
Nov 17 unless marked.

| # | Gap | Data that closes it | Legal source (docs/legal-sources.md) | How much: M-C now / M-D | Effort |
|---|---|---|---|---|---|
| G1 | Rounds have no best-of-1/best-of-3 label; the judges mix them | Limitless `/tournaments/{id}/details` → `phases[].mode` | Same public API, 1 call per new event, inside its rate (6.5 s) | 76 events / 6,309 games unlabelled (data/tour-modes.json is a one-off of 420 events). Labelled: 4,881 best-of-1 games in 48 events. ~55 events and ~5,000 round results a week, ~12% best of 1 / M-D: from day 1 if the daily job asks per event | small; daily-job change: Sim's go |
| G2 | Showdown games are dropped past the newest 20,000 | Keep a compressed monthly archive (or a larger cap); spread fetches across the day | Showdown public replay API, no robots.txt, ≥1 s pace via http.mjs | Ladder: ~600-700 new a day (several days stop at exactly 600 = the cap), so 20,000 ≈ 3.5 weeks (Oct 25-Nov 17). Open-sheet format: 11,002 in 14 days (~800/day), hits the cap in ~10 days. Size gzipped: 61 B/ladder game, 127 B/sheet game ≈ 4 MB a month / M-D: Showdown keeps each regulation separate, so M-D games start at 0 | small-medium; Sim's go (daily job, repo size) |
| G3 | The score never learns from single games or from full-sheet games outside Limitless | Showdown open-team-sheet games (each one game, full item, Ability, moves, nature; rating as skill) | same as G2 | 11,002 now, ~800/day (G2 decides how many we keep). Ratings: median 1257, 90th 1431, only 29 games with both 1500+. Ladder: median 1293, 90th 1618 / M-D: the first M-D games with sets, weeks before Limitless has many M-D rounds | medium (model.mjs input + tests); Sim's go (grade change) |
| G4 | Which 4 are brought | per-Pokémon / per-six bring rates from replays (`b`, already parsed) | same as G2 | All 4 seen on both sides: 13,409 of 20,000 ladder, 7,948 of 11,002 sheet games / grows with G2 | medium; grade change: Sim's go |
| G5 | Threats weighted by tournament top cut, not by what a ranked player meets | threat weights from ladder usage (Smogon 1630+, already pulled) and the in-game order (op.gg, already pulled) | already used sources | Smogon Oct: 1,649,648 best-of-1 battles; op.gg order only / M-D: Smogon's first M-D month lands early January (data-inventory G5) | small (weights) |
| G6 | Stat points are guesses for Reg M-D until January | in-game spreads: championsbattledata.com API or op.gg Pokédex | **needs Sim's OK**: new outside source; championsbattledata asks for attribution and no redistribution as a data feed; op.gg non-commercial with a citation (data-inventory §5 D2) | M-C: Smogon covers 100 of 100 tournament Pokémon at 1630+ / M-D: nothing from Smogon until early January | medium |
| G7 | Natures | already on every sheet; add `Mon~Nature` features | no new source | 125,262 of 125,262 sheet Pokémon (data-inventory) | small; a model change, tested like any |
| G8 | Game scores inside best-of-3 rounds; game 1 vs games 2-3 | Limitless: none found (data-sources.md). Showdown open-sheet replays may mark the game number in the log | — | **unsure**: I did not check whether a Showdown best-of-3 log names "game N of 3" or links the set's games | check 1 log first |
| G9 | In-game ranked results | none public (data-sources.md, Nov 8; not re-checked today) | an opt-in, anonymous "log your ranked games" on the public site would be our own data: **needs Sim's OK + a privacy review** (COPPA: kids play) | 0 | large; after launch at the earliest |
| G10 | Speed control used in a game, not just carried | already parsed: `f` in replays (Tailwind/Trick Room turn, Fake Outs, Speed drops, paralysis) | no new source | in all 31,002 stored games | small (a test, no new data) |

Not used, on purpose: RK9 (terms forbid it), pokedata.ovh (no terms; may be RK9 data), Pokémon Zone (answers 403),
project-red-data (no licence). VGC-Bench (MIT, older regulations) is fine for testing methods but not for M-C or M-D values.
(checked: legal-sources.md, data-sources.md)

## 4. Which gaps matter most for single-game wins (evidence)
- **Player skill** is the largest thing in a game, and the score leaves it out by design: skill 0.90 vs team 0.46 logit SD
  (skill-vs-team.mjs). So a better team score moves single-game picks by tenths of a point, not whole points. (measured)
- **Within the team**, only the Pokémon and sets (`x0`), the Mega, Protect and readiness have measured, beyond-chance effects.
  Everything else is "no benefit" or "unknown". (measured, section 2)
- **The "unknown" rows are almost all data-limited**: bring 4 (+1.5 ±1.7), synergy in the four (13,265 games too few), physical/
  special mix and 3+ shared type (ranges cross 0), set factors on single games (500 sheet games then, ±8 to ±20). They need more
  single games with sets, which G1-G3 supply. (measured)
- **The judge itself is off target**: the score is trained and judged on rounds that are 86.5% best of 3, while the product is
  for single games. Confidence differs by game type (0.60× / 0.82× / 1.02×). Unknown: whether the *order* of teams (not just the
  confidence) differs between best of 1 and best of 3. Earlier read: "no shift visible at this size" (counting-checks.mjs).
  Test that could fail: score later best-of-1 rounds and sheet games with (a) today's model and (b) a model trained only on
  best-of-1 + sheet games; if (b) does not win on log-loss beyond chance, order doesn't differ.
- **Readiness** is the only add-on that survives on top of `x0`, but how its threats are weighted was never tested.
  Unknown whether a ranked-field weighting helps.
- **Matchups vs a known opponent** help one game but not the team score (site-board.mjs). That is a Battle feature, not a data gap.

## 5. Ranked plan: top 5 data improvements
Every step: one at a time, Sim's go before any daily-job or grade change, walk-forward + compare.mjs keep/drop, the
never-get-worse gate, and a judge that does not use the score that built it.

### 1. Label every round's format, then build a single-game scoreboard
- What: the daily job reads `phases[].mode` for each new Limitless event (G1). A scoreboard scores only single games: best-of-1
  rounds + Showdown open-sheet games + ladder games, each trained only on earlier data.
- Value: high. It turns "Single games first" into a measured bar, and steps 2-5 can't be judged fairly without it. Expected
  change to the score itself: none (it is a judge).
- Effort: small (1 extra call per new event; the scoreboard reuses walk-forward.mjs).
- Risks: best-of-1 rounds are few (~600 a week), so ranges stay wide. Report ranges, never single numbers.
- Proof it works: it has to fail a scrambled-strength score (as accuracy-gate does: 1/188 FAIL), and it has to reproduce the known
  confidence fit (best-of-1 ≈ 0.6×, sheet games ≈ 1.0×) on the same games.

### 2. Keep every Showdown game (archive past 20,000) and stop losing games to the 600 cap
- What: monthly gzip archives of games that drop off, and fetches spread over the day (G2).
- Value: high for testing. Within ~6 weeks it should roughly double or triple the single games with sets (my estimate from the
  measured ~800/day). It gives "unknown" tests (bring 4, synergy in four) the size they lacked. For M-D, the only early
  single-game data with sets.
- Effort: small-medium. ~4 MB a month gzipped (measured rate × measured size). Stays under the 600-per-run politeness unless
  Sim agrees to more runs.
- Risks: repo growth; the bo3-format ladder is a different crowd (median rating 1257). I'm unsure whether its ratings compare to
  the main ladder's, because it is a separate rating pool. The same rental six can appear hundreds of times, so tests must
  group ranges by six (deep-check.md review).
- Proof it works: count kept games per day vs the replay search's own count (could show we still drop games). Re-run
  four-synergy.mjs and counting-checks.mjs on the larger set and report whether the ranges narrow.

### 3. Let the score learn from single games with full sets (Showdown open-sheet games)
- What: add sheet games to model.mjs's training as one-game results, with rating standing in for skill, weighted against
  Limitless rounds (G3).
- Value: medium-high, size **unknown**. My guess, not tested: ≤0.001-0.002 log-loss on single games. It is the main route for
  sets, Abilities and natures to be learned from single games.
- Effort: medium (a second game source in model.mjs, a weight setting, the full test suite).
- Risks: ladder players differ from tournament players and could pull values toward ladder habits. Rental teams repeat. It could
  make tournament predictions worse, so both judges must pass.
- Proof it works: walk-forward on later best-of-1 rounds (not ladder: these are not the data added) AND the usual tournament
  walk-forward. Keep only if single games improve beyond chance and the tournament gate does not get worse.

### 4. Count the four that actually get brought (bring rates)
- What: weight each Pokémon's credit by how often it is brought on sixes like this one, learned from replays (G4).
- Value: medium. The direction is measured (+0.48 vs −0.04) but the size isn't proven (+1.5 ±1.7). It matches the approved
  principle "bring 4 of 6: a niche sixth isn't punished" and fixes "benched Pokémon get full credit".
- Effort: medium. Grade change, Sim's go.
- Risks: "brought" in a replay means "seen": a 4th that never came out looks benched (only 67% of ladder games show all 4 on both
  sides). Ladder bring habits may differ from tournaments.
- Proof it works: walk-forward + compare.mjs on later tournament rounds and on the step-1 single-game board. Plus a broken-team
  check that can fail: adding a never-brought sixth must not raise the score.

### 5. Readiness against the field ranked players face, and Reg M-D stat points
- What: (a) weight the top-30 threats by ladder/ranked usage (Smogon 1630+, op.gg order; already pulled) next to top-cut share
  (G5). (b) For M-D, in-game spreads from championsbattledata or op.gg until Smogon's first M-D month (G6).
- Value: (a) medium, **unknown**. Readiness is the one add-on with a measured effect, but its weighting was never tested. (b) keeps
  M-D damage calcs from running on fallback spreads for December. Prediction value unknown; the weight is small (.003/point).
- Effort: (a) small; (b) medium.
- Risks: (b) needs **Sim's OK** on a new outside source and its terms before the public launch. A ranked-weighted list could
  make tournament predictions worse.
- Proof it works: (a) on the step-1 single-game board and the tournament walk-forward, keep/drop. (b) cross-check spreads
  against Smogon's first M-D file when it lands (top spread same/different). Any disagreement is explained, not ignored.

### Cheap checks on data we already have (no new data; worth running while the above is waiting)
- Natures as features (G7): one model run with and without, judged on walk-forward. Could fail; small effort.
- Speed control used in games (G10): do sides that actually set Tailwind or Trick Room win more, rating-adjusted, on ladder and
  sheet games? This is the one place where experts and our numbers disagree, and the score still drops 4.6 when it is removed.
- Game numbers in Showdown best-of-3 logs (G8): read one log to see if games of a set can be linked (unsure today).

## 6. Not checked / unsure
- Whether Showdown best-of-3 logs mark the game number or link the games of one set.
- Whether the replay search offers more than ~600-700 new games a day (the cap hides it).
- Whether ratings on the best-of-3 ladder compare with the main ladder (separate pools).
- championsbattledata's and op.gg's terms for a public site after launch (data-inventory §8).
- Expected gains in section 5 are my guesses, sized from earlier measured effects; none of the five steps has been tested.

## 7. Corrections found
- data-sources.md (Nov 8) calls Showdown's best-of-3 format "stronger players". Measured today: its ratings are lower (median
  1257, 90th 1431) than the main ladder's (median 1293, 90th 1618), and only 29 of 11,002 games have both players at 1500+.
  Because it is a separate rating pool, this does not prove the players are weaker. "Stronger players" is not shown either.
