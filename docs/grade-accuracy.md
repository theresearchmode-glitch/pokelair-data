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
