# Is the Strength Score still predicting as well as when it was approved? (helper report)

Written: 6:12 PM, Tue Nov 17, 2026 (from `bash docs/rebuild/now.sh`). Look-only helper. No tracked file changed except this one;
no git state changed; everything ran on a copy in /tmp/helper-drift/. The sealed set was not opened or scored.

## Short answer

1. On the games we may look at (all before Nov 9), the score predicts exactly as on Nov 9: 55.86% picks, log-loss 0.68088 vs the
   frozen 55.81% / 0.68083. No drift there. But those are the same games as at approval: every game added since is sealed.
2. Production's own daily check (already published) has warned for 6 days: held-out picks 56.3% (Nov 9) to 55.0% (Nov 17),
   log-loss 0.6806 to 0.6839, model stretch 0.865 to 0.726. That window now holds sealed games. A real drop is possible: unsure.
3. Bands still in order on Oct 27 to Nov 8 games: under 60 won 29.6%, 60s 40.3%, 70s 48.1%, 80s 53.6%, 90+ 58.6%.
4. Matchups still add (removing them is worse beyond chance). Own record adds nothing measurable. Readiness, Mega, Protect: stable.
5. Biggest weak spot: 88% of games are best-of-3 match results. On real single games the score is too confident (edge scale 0.73).

What to do next (my recommendation): run the sealed check now (reason: its own rule says look once 3,000+ decided games exist,
and about 5,371 rows have built up since Nov 9; it is the only honest test of drift on new data).

## 1. Accuracy now vs the frozen baseline

| Test | Frozen (Nov 9) | Today (this run) | Change | Label |
|---|---|---|---|---|
| Walk-forward, 4 weeks (Oct 12 to Nov 8) | 18,618 games · ll 0.68083 · picks 55.81% · gap 1.07 pts | 18,642 games · ll 0.68088 · picks 55.86% · gap 1.05 pts | ll +0.00005, picks +0.05 | measured (walk-forward.mjs) |
| Last 2 weeks (gate) | 7,795 games · ll 0.68046 | 7,819 games · ll 0.68063 (main session's own run today, out/wf/gate) | +0.00017, within the 0.005 allowance | measured (accuracy-gate.mjs, read its summary) |
| Exact-site scoreboard, Oct 27 to Nov 8 | 6,270 games · picks 56.68% · ll 0.68008 · gap 0.4 | 7,030 games in 99 events · picks 56.51% · ll 0.67997 · gap 0.8 | ll −0.0001, picks −0.17 | measured (site-board.mjs) |
| Top-4 teams scoring 80+ before their event (4 weeks) | n/a (baseline used old "B or better": 266/392) | 302 of 350 (86%) | not comparable | measured; unsure why n is 350 not 392 |

Per week (walk-forward): picks 54.54 / 56.54 / 56.31 / 56.32%, log-loss 0.6832 / 0.6789 / 0.6786 / 0.6826. No steady decline
before the seal. The last week's log-loss is at the worse end; too little to call a trend (unsure).

Why "no drift" here is weak evidence (checked): the pre-Nov 9 data is unchanged. Today's main data has 432 events / 40,200 rows
before Nov 9; the Nov 10 snapshot had the same 432 events / 40,200 rows. So this re-run tests that the CODE has not drifted
(it hasn't: my numbers match the main session's own Nov 17 run, out/wf/pbase, to the last digit). It cannot test new data.
The exact-site run scores 99 events / 7,030 games vs 88 / 6,270 on Nov 9. Unsure why exactly: the Nov 9 morning data already
had 100 events in those dates (7,458 rows; today 101 / 7,482), so the original run probably used an earlier (Nov 8) snapshot.

### The new data since approval is sealed (checked, counts only)

- Main's out/matches.json (Nov 17): 495 events, 45,571 rows, dates Sep 12 to Nov 16. Of these, 63 events / 5,371 rows are dated
  Nov 9 or later: the sealed set. I counted rows by event date only; I did not read winners or score any of them.
- The sealed rule (docs/sealed-pass-rules.md) says look on the first day on or after Nov 16 with 3,000+ decided games. Undecided
  rows run 2-6.5% per week, so this is very likely past 3,000 (my estimate, not counted, to keep outcomes unread).
- Showdown ladder games after Nov 9 09:56 UTC (reserved for Check 2): 5,245 in replays.json, 5,252 in replays_bo3.json (counts by
  time only). Check 2 needs 4,000.

### Production's daily scoreboard (already published; NOT a substitute for the sealed check)

out/scoreboard.json on main (model only: Pokémon + pairs + sets; trained on the oldest 80% of events, tested on the newest 20%):

| Day | Held-out picks | Calibrated log-loss | Raw win rates pick | Model edge over raw | Stretch (calib) | Test events |
|---|---|---|---|---|---|---|
| Nov 9 | 56.33% | 0.68058 | 54.65% | +1.7 | 0.865 | 87 |
| Nov 10 | 56.08% | 0.68256 | 54.30% | +1.8 | 0.779 | 88 |
| Nov 11 | 56.16% | 0.68209 | 54.70% | +1.5 | 0.798 | 90 |
| Nov 12 | 54.80% | 0.68441 | 54.47% | +0.3 | 0.705 | 91 |
| Nov 14 | 55.00% | 0.68307 | 54.25% | +0.8 | 0.762 | 95 |
| Nov 17 | 55.01% | 0.68390 | 54.12% | +0.9 | 0.726 | 99 |

- Measured (read from out/scoreboard.json and out/model.json in main's history): picks fell about 1.3 points, the stretch fell
  16% (the model's win chances got flatter), and the warning "Win model held-out accuracy ... vs recently" fired Nov 12-17.
  The model still shipped every day (the guard allows +0.005 log-loss).
- Checked: no commit to model.mjs, model-settings.json, six.mjs, ctr.mjs, update.mjs, formats.mjs or skip.mjs between Nov 9 and
  Nov 16. So the drop came with the data (newer events entering the test window), not a code change.
- Unsure (why): it could be the meta moving late in M-C, a different mix of events (more single-game or smaller events), or event
  quality. Raw win rates barely moved (54.7 to 54.1), so the team values got less useful, not only the games harder.
  Finding out needs the sealed games, so I stopped here.
- Each daily number is about 7,700 games; a 1.3-point drop is about 2 standard errors. Overlapping windows, so the 6 days are not
  6 separate signals.

## 2. Calibration by band (Oct 27 to Nov 8, each side and game once; model trained before Oct 27)

| Score | Side-games | Won | Expected | ± (95%, naive) | Nov 9 (same bands, from strength-score.md) |
|---|---|---|---|---|---|
| under 60 | 159 | 29.6% | 35.2% | ±7.8 | 22.0% (41) |
| 60s | 1,651 | 40.3% | 41.6% | ±2.4 | 40.0% (1,408) |
| 70s | 5,207 | 48.1% | 47.3% | ±1.4 | 48.0% (4,819) |
| 80s | 6,202 | 53.6% | 53.7% | ±1.2 | 53.5% (5,713) |
| 90+ | 841 | 58.6% | 59.4% | ±3.4 | 58.5% (559) |

- Measured (site-board.mjs ssBands, the built page of main as of Nov 17): every band wins more than the one below; each is within
  its range of what it promised. 70s to 80s: +5.5 points, well beyond ±1.8. 90+ vs 80s: +5.0, points the right way.
- Finer bands: 85-89 won 54.2% vs 56.1% expected (2,209), the one band a little under its promise, within ±2.1.
- Letters, every side and game: A 55.3 · B 52.9 · C 47.1 · D 44.5 · F 36.6%: in order (Nov 8: A 54.3 · B 53.4 · C 47.2 · D 44.7 · F 37.2).
- What it can't see: these are mostly best-of-3 rounds (see 4). The ± ignores that one team plays many games (real ranges wider).
- Not single games: I did not split bands by best-of-1, too few such games per band (about 1,000 BO1 rounds in this slice).

## 3. Which factors carry the score now

Out of sample (exact-site, 7,030 later games, compare.mjs, 2,000 tournament resamples; "site" = what the page shows):

| Change to the site's score | Log-loss gap (95% range) | Verdict | Nov 8-9 |
|---|---|---|---|
| Remove matchups (readiness vs top threats) | +0.00040 (0.00006 to 0.00081) | worse beyond chance: matchups still add | REJECT removal (same) |
| Remove the six's own record | −0.00014 (−0.00061 to 0.00036) | no difference | no difference (same) |
| Strength Score weight .0038 instead of .003 | −0.00007 (−0.00018 to 0.00002) | no difference | −0.00009, no difference (same) |
| Matchups ×2 | −0.00019 (−0.00058 to 0.00015) | no difference | no difference (same) |
| Learned matchups vs the field instead | picks 55.58%, ll 0.68107 | worse | worse (same) |
| No sheet, default sets | picks 54.30% vs 56.51% | sets on the sheet add about 2.2 points | same direction |

In sample, each player's skill fitted alongside (strength-fit.mjs on the 10,564 sheets, Nov 9 production model for x0):

| Factor | Fit 1 today (with x0) | Nov 9 Fit 1 | Fit 2 early (before Oct 12) | Fit 2 late (Oct 12 to Nov 8) | Nov 9 Fit 2 |
|---|---|---|---|---|---|
| Pokémon + pairs + sets (per unit) | +27.17 (26.71 to 30.06) | +27.39 | — | — | — |
| Ready for top threats (per 10) | +1.02 (0.40 to 1.81) | +1.05 | +1.33 (0.85 to 2.21) | +1.69 (0.85 to 2.66) | +1.56 |
| Has a Mega | −3.70 (unknown) | −3.97 | +21.45 (14.25 to 30.77) | +18.77 (9.13 to 28.90) | +19.69 |
| Protect (per member) | −0.07 (unknown) | −0.09 | +1.19 (0.84 to 1.91) | +1.39 (0.96 to 2.21) | +1.00 |
| Offensive coverage (per type) | +0.42 (0.10 to 0.70) | +0.39 (unknown) | +0.96 (0.50 to 1.67) | −0.07 (−0.44 to 0.29) | +0.47 |
| 2+ physical and 2+ special | +1.13 (unknown) | +1.06 | −0.81 (unknown) | +2.27 (0.09 to 4.10) | +0.68 |
| 3+ members sharing a type | −1.43 (unknown) | −1.33 | −4.98 (−8.08 to −2.91) | −3.61 (−7.23 to −0.99) | −3.27 |
| Types nobody resists (per type) | −0.34 (−0.74 to −0.00) | −0.36 | −0.83 | −0.85 | −0.84 |

- Measured: the factors the score uses (Pokémon/sets via x0, readiness, Mega and Protect inside x0) kept their sign and size.
- Measured: offensive coverage changed between halves (helps early, ranges do not overlap with late). Mixed attackers flipped
  sign (unknown early, helps late). Neither is in the score, so the score is not affected; worth a note for any future weight.
- Unsure: Fit 1 today shows offensive coverage "helps beyond chance" (Nov 9 said unknown); the range just clears 0 and the fit is in
  sample (x0 trained on these same games). Fit 2 halves use 40 resamples only.
- The early and late halves are in sample, so they show stability over time, not predictive power.

## 4. Weak spots in the data feeding the score

1. New data is all sealed (checked, above). Until the sealed check runs, drift on new games is unknown.
2. Single games are a small minority (measured, data-weak.mjs, data/tour-modes.json): of pre-seal rows with a known round type,
   4,881 are best-of-1 and 34,381 best-of-3 (12.4% single games). Each row is a round result, so most "games" are match results.
3. The score is too confident on single games (measured, bo1-cal.mjs on the walk-forward predictions):
   - best-of-1 rounds: 1,919 games, picks 54.30% (±2.2), log-loss 0.68579, best edge scale 0.73 (95% 0.46 to 0.96, by tournament);
     "said 62.1% → won 56.5%" (310 games).
   - best-of-3 rounds: 15,885 games, picks 56.04% (±0.8), log-loss 0.68001, edge scale 0.97 (0.87 to 1.06): right size.
   - Meaning: a shown 62% is about 57% for one game. Pokémon Champions ranked play is single games (CLAUDE.md, Single games
     first). Only 25 event-weeks have BO1 rounds, so the size is rough; the direction is beyond chance.
4. data/tour-modes.json is stale (checked): it covers 420 events as of Nov 8. In the last pre-seal week, 12 events (870 rows) have
   no round type, and no newer event has one. Any single-game split of the sealed games will be blind without refreshing it.
5. Undecided rows rose in the last pre-seal week: 6.5% vs 2.1-4.4% before (measured). Unsure why; they are left out of every test.
6. Late M-C weeks are thinner (measured): 4,029 and 4,265 rows (weeks of Oct 26 and Nov 2) vs 5,400-6,900 in late Sep to mid Oct.
7. Player skill (measured, production eval): with known players the model picks 57.1% vs 55.0% for teams alone, so skill still
   outweighs the team. Skill is taken out of the team values (model.mjs) and of the six's own record (six.mjs header); the own
   record still adds nothing measurable (row above).
8. Sources not mixed (checked): out/matches.json holds 0 Showdown ("sd-") events; the score learns from tournaments only.
9. A few players play a lot (measured): the top 1% of players are in 10.9% of player-rows; median 8 rows per player.
10. This branch's out/ is frozen at Nov 10 (checked: out/scoreboard.json and out/model.json say 2026-11-10); main has Nov 17.
    Scoreboard runs from claude/design6 use Nov 10 data.
11. Matchup readiness in any backtest uses the threat list of the data snapshot given to the page (known small leak, Nov 7). I used
    the Nov 9 morning snapshot so no post-seal data reached the page.

## Method (exact commands)

All in /tmp/helper-drift/ (scripts in /tmp/helper-drift/scripts/). Code = origin/main at d0662883 (Nov 17 19:24 UTC).

```
git -C /home/user/pokelair-data archive origin/main | tar -x -C /tmp/helper-drift/main
# sealed.json was NOT read: replaced in the copy by {"from":"2026-11-09","devTestFrom":"2026-10-27"} (dates from the docs)
node scripts/preseal.mjs <main out/matches.json> main/out/matches.json      # keep events dated before 2026-11-09 only
# replays*.json in the copy: games before 2026-11-09T09:56Z only (Check 2 reserve)
# out/limitless, meta_tour, teams, meta_ladder, meta_ingame, model.json in the copy = commit b5d954f9 (Nov 9 data, pre-seal)
ln -s /home/user/pokelair-data/node_modules main/node_modules; (cd main && node app/build.mjs)
cd main && node experiments/walk-forward.mjs drift4 4
# dev model, trained only before Oct 27 (as walk-forward trains: later events dropped):
MATCHES=/tmp/helper-drift/matches_pre1027.json MODEL_OUT=out/model_dev_site.json node model.mjs
MATCHES=out/matches_train.json MODEL_FILE=out/model_dev_site.json node six.mjs
MATCHES=out/matches_train.json MODEL_FILE=out/model_dev_site.json node ctr.mjs        # calib 0.859 (Nov 9 run: .872)
MATCHES=out/matches_dev.json SB_MODEL=out/model_dev_site.json BOARD_DATE=2026-10-27 node experiments/site-board.mjs /tmp/helper-drift/sb_pred.json /tmp/helper-drift/sb_summary.json
node experiments/compare.mjs /tmp/helper-drift/sb_pred.json "site today (sets + caution + matchups .003 + own record)" "<row>"
node experiments/strength-factors.mjs /tmp/helper-drift/factors_nov9model.json      # 10,564 sheets, 0 not loadable
RS=100 node experiments/strength-fit-split.mjs factors_nov9model.json                # copy of strength-fit.mjs + MATCHES/FROM_D/TO_D
ONLY=ready10,mega,stackOK,w3OK,off,unres,protect,items,mixed,dup3 RS=40 [TO_D=2026-10-12 | FROM_D=2026-10-12] node experiments/strength-fit-split.mjs ...
node scripts/by-mode.mjs main main/out/wf/drift4 "+ own sets + this six's own record  [site today, minus matchups]"
node scripts/bo1-cal.mjs main main/out/wf/drift4 "<same row>"
node scripts/data-weak.mjs main
```

What these tests could and could not detect:
- Could fail: the walk-forward and site-board would show worse log-loss if today's code had broken the score; compare.mjs
  would flag matchups or own record changing role; the bands could have come out of order.
- Cannot see: anything about games after Nov 8 (sealed by design); effects smaller than the ranges shown; the teams our tools build.
