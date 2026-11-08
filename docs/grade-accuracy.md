# Grade accuracy, step 1 (Nov 7, 2026)

How well does the grade predict who wins? Measured honestly with `experiments/grade-check.mjs`: tournament events split by
date at Oct 26 (the last 20% of events are the "future"); every team graded with past data only (team strength from a model
trained on events before ~Oct 22; real records from past games only); then checked against 5,527 future games between
1,191 graded teams, and 207 teams with 10+ future games. Small leak: readiness uses today's top-30 threat list.

## In each future game, did the higher-scoring team win? (coin flip = 50%)
| Predictor | Right |
|---|---|
| Readiness alone (vs top 30 threats) | 51.8% |
| Missed checks alone | 51.8% |
| Team strength alone (model learned from real games) | 53.4% |
| Our check (readiness − checks + strength) | 53.1% |
| Past real win rate alone (teams with 30+ past games) | 55.8% |
| The grade as on the site (check + real results blended) | 53.6% |

## Teams with 10+ future games
| Predictor | Correlation with future win rate | Bottom third → top third win rate |
|---|---|---|
| Readiness alone | 0.05 | 53.1% → 55.1% |
| Missed checks alone | 0.00 | 53.7% → 54.1% |
| Team strength alone | 0.03 | 53.4% → 53.8% |
| Our check | 0.05 | 53.0% → 54.2% |
| Past real win rate alone | 0.23 | 52.4% → 54.0% |
| **The grade as on the site** | **0.26** | **49.1% → 56.2%** |

## What it means
- The grade as a whole does separate weaker from stronger teams (a 7-point win-rate gap between its bottom and top third),
  and almost all of that comes from real results.
- Readiness, the biggest part of the grade (and what suggestions mostly move), barely predicts winning on its own (51.8%,
  r 0.05). Its weights were set by hand, never learned from results.
- The team-strength model, the only part learned from real games, is the best of the check's parts (53.4%).
- Ceiling: who plays a team matters more than the six; a team-only prediction tops out around 56-57% of single games.
- Next (step 2): learn the grade's weights from real results, and test changes to readiness itself, judged by this check.

## Step 2 (Lite), Nov 7: set the 4 dials from real results

`experiments/grade-fit.mjs` tried 7,056 settings of the dials. The dials are: readiness weight, points off per missed check, team-strength weight, how fast the real record takes over (K), and the fewest games before the record counts. It chose the dials on one half of the later games (by date) and scored them on the other half, both ways round.

| Chosen on | Dials picked | Higher grade won (other half) | Log-loss (other half) |
|---|---|---|---|
| Half A | readiness ×0, −9 per check, strength ×0.5, K 10, from 10 games | 52.7% now → 53.4% | .6899 → .6921 (worse) |
| Half B | readiness ×0.25, −0 per check, strength ×0.5, K 400, from 10 games | 54.4% now → 54.1% | .6863 → .6860 (same) |

**Result:**
- The two halves pick opposite dials, and neither set beats today's dials on games it wasn't chosen on.
- Today's hand-set dials are about as good as any setting. The parts carry too little signal for re-weighting to help.
- **Decision:** keep the live grade as is. Gains must come from better parts (a better readiness) and more real games (step 3), not from the dials.

## Scoreboard (Nov 8): experiments/board.mjs, three date cut-offs (60/70/80% of events learned, the rest scored)

| version | picks the winner (60 / 70 / 80) | log-loss (80) |
|---|---|---|
| Pokémon + pairs only | 54.6 / 55.0 / 54.9 | .6861 |
| + its own items and moves (today, capped) | 55.8 / 55.8 / 55.4 | .6832 |
| + its own items and moves, no cap | 55.9 / 56.4 / 55.7 | .6813 |
| + own sets + the six's own record (site today, before matchups) | 56.1 / 55.8 / 56.3 | .6826 |
| context: the better player by past results | 58.7 / 58.5 / 59.8 | |
| context: team grade + player together | 59.8 / 60.0 / 60.0 | |

- Calibration is good everywhere (said vs won within about 1 point).
- Letters separate the bottom well (F wins ~43-45%) but A, B and C sit close (A ~55-56%, B ~54%, C ~51-53%).
- Uncapping sets wins on log-loss at all three cut-offs: the cap (10th-90th percentile of real builds) throws away real signal.
- Swap test (a player changes one Pokémon between events, 327 cases pooled): no version calls the direction better than
  chance (47-53%, ±3.5). Results per event vary too much (sd .21 in win rate) for 327 swaps to show the small real effect;
  this test can't judge suggestions yet.

## More data and more training (Nov 8, items 5 and "train our models more")
Date split: learned from games before Oct 29, scored on the ~4,000 tournament games after (experiments/board.mjs BOARD_DATE).

| version | picks the later winner | log-loss |
|---|---|---|
| tournaments only (as shipped) | 56.8% | .6824 |
| + Showdown ladder games, both players 1500+ (2,421) | 56.9% | .6824 |
| + ladder games 1300+ (6,537) | 56.7% | .6824 |
| + all 20,000 ladder games | 56.6% | .6825 |
| 600 training steps instead of 250 | 56.9% | .6824 |
| finer shrink grid (3/5/7/10/15; picked 5) | 56.7% | .6830 |

None beats the shipped model beyond noise, so nothing changed: the model already converges at 250 steps, its settings are
already near the best, and ladder games add nothing tournaments don't (casual ones slightly hurt). The finer grid looked
better on the model's own validation slice and worse on later games: the scoreboard is what decides.
