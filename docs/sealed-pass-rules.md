# Sealed-set check: pass rules (written Nov 10, before anyone looked)

Focus plan step f1-rules. These rules are fixed **before** the sealed games are scored, so the goalposts can't move afterwards.
If a rule turns out to be badly written, that is reported to Sim and the rule is changed only with her OK, in writing here,
with the date, **before** any re-look.

## The data
- Sealed set: Limitless tournament events on or after 2026-11-09 (`experiments/sealed.json`). On Nov 10: 1 event, 94 decided games.
- Model: trained only on games before 2026-11-09, as the site builds it (`model.mjs`, then `six.mjs`, `ctr.mjs` on those games).
- Scored by the built page itself (`experiments/site-board.mjs` with `SEALED=1`), every side and game once, each side with its
  own team sheet.
- **When to look:** the first day on or after Nov 16 when the sealed set has **at least 3,000 decided games**. If it hasn't
  reached 3,000 by Nov 23, look on Nov 23 with what there is, and label every result with its range; "too few to tell" is
  then a valid answer, not a pass.
- One look per question. No tuning, no re-runs with other settings.

## Check 1 · Does the Strength Score hold up?
The score passes if **all four** hold:

| # | Rule | Why this number |
|---|---|---|
| 1a | The higher-scoring side wins more than half: the 95% range of the pick rate (resampled by tournament) is entirely **above 50%** | It must still predict at all |
| 1b | Pick rate at least **53.0%** | Walk-forward baseline 55.8%; 53.0 allows for about ±2 points of chance at 3,000 games. Below it means it got clearly worse |
| 1c | Calibration: in every win-chance bin with 300+ games, said vs won within **4 points** | Baseline gap 1.07 points; 4 allows for chance in smaller bins |
| 1d | Bands in order: the 80s win more than the 70s, and 90+ win more than the 80s. The 70s-vs-80s gap must be above 0 beyond chance; 90+ vs 80s only needs to point the right way (few 90+ teams) | The bands must mean something |

Also reported (information, not pass/fail): log-loss vs the frozen baseline (0.68083), win rate per band with ranges, and the
top-4 teams' scores.

**If it fails:** nothing changes on the site automatically. Claude reports exactly which rule failed and by how much, and Sim
decides what happens next.

## Check 2 · Battle four-pick with real-game matchups (`CTR_W`)
- Data: Showdown ladder games **after Nov 9 09:56 UTC** only (the last game seen in the Nov 9 test), so none of them were
  looked at before. Needs **at least 4,000 games**; otherwise wait.
- Weight fixed at **100** (chosen on games before Oct 30). Compared with the switch off (0), same games, `experiments/plan-test.mjs`.
- **Keep** if: the per-Pokémon effect with the switch on, minus with it off, is above 0 with its 95% range (resampled by game)
  entirely above 0, **and** "led with our pair" is not worse beyond chance.
- Otherwise: the switch stays off. Reported to Sim either way.

## Check 3 · Trick Room (pre-registered Nov 8)
- Claim being tested: Trick Room teams win more than the score expects (Nov 8 dev games: +2.2 points, range +0.4 to +3.9).
- Same sealed games and model as Check 1; Trick Room team = the same role definition as `experiments/structure-check.mjs`.
- **Holds** if Trick Room sides' real win rate minus expected is above 0 with its 95% range (resampled by tournament) entirely
  above 0. Then a Trick Room adjustment becomes a candidate grade change (tested like any other; Sim decides).
- **Doesn't hold** if the range includes 0: no change.

## What these checks can't see
- Teams the site builds or suggests (Part 3 tests those).
- Ladder players (mid level) for Checks 1 and 3; tournament players for Check 2.
- Effects smaller than the ranges: with ~3,000 games a pick rate is good to about ±1.8 points.
