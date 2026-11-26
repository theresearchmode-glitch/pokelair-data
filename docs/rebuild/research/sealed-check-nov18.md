# Sealed check, Nov 18 (the one look; Sim's yes, Nov 17)

Run once, on a clean copy of main at 9ec472a1, with the Nov 18 data job's round formats. The job's log said "round formats: 115 new
of 115 asked, 535 events known", and all 535 events have a format.
Command: `node experiments/split-scoreboard.mjs --sealed --one-model --from 2026-11-09 --until 2026-11-19`.
--until is the day after the last event (Nov 18), fixed before the run. The model was trained only on events before Nov 9.
The look began at 2026-11-18T11:01:35Z, as recorded in SEALED-LOOK.json. A second look is refused.
Files: sealed-nov18/summary.json, sealed-nov18/run-output.txt, sealed-nov18/SEALED-LOOK.json.

## Result (95% ranges, 200 resamples by tournament)
| Rounds | Games | Picks the winner | Range | Edge scale | Calibration gap |
|---|---|---|---|---|---|
| Best-of-1 (single games; our focus) | 713 (7 events) | **56.1%** | 52.5 to 60.4 | 1.18 (0.65 to 1.86) | 0.74 pts |
| Best-of-3 | 5,168 (69 events) | **54.4%** | 52.5 to 56.0 | 0.80 (0.60 to 0.99) | 1.71 pts |
| All | 5,881 (70 events) | **54.6%** | 52.9 to 56.3 | 0.85 (0.65 to 1.02) | 1.47 pts |

Unknown format: 0 games. The "unknown format because" line was all zeros, so every game was labelled.

## Against the baseline (one model, Oct 27 to Nov 8; numbers in the task)
| Rounds | Baseline | Sealed | Change |
|---|---|---|---|
| Best-of-1 | 795 games, 55.47%, edge scale 0.74 | 713 games, 56.1%, 1.18 | +0.6 pts: same within chance (range 52.5-60.4 holds 55.47) |
| Best-of-3 | 5,397 games, 56.91%, edge scale 1.09 | 5,168 games, 54.4%, 0.80 | -2.5 pts: the baseline (56.91) is above the sealed range's top (56.0) |

## Against the pass rules (docs/sealed-pass-rules.md, Check 1, written Nov 10)
- When to look: 3,000+ decided games. There are 5,881, so the look was due.
- **1a**, pick-rate range entirely above 50%: all rounds 52.9-56.3, **pass**. Best-of-1 52.5-60.4, pass. Best-of-3 52.5-56.0, pass.
- **1b**, pick rate at least 53.0%: all 54.6%, **pass**. Best-of-1 56.1%, best-of-3 54.4%.
- **1c**, every win-chance bin with 300+ games within 4 points: all rounds 54.3 said / 52.7 won (1.6 pts) and 63.3 / 62.9 (0.4).
  **Pass.**
- **1d**, Strength Score bands in order: **not measured by this run.** split-scoreboard reports pick rate and calibration, not
  the bands. The rules say Check 1 is scored by experiments/site-board.mjs with SEALED=1, and that wasn't run. Unsure whether running
  it now counts as a second look: it asks a different question (the bands) of the same games. Sim decides.
- Checks 2 (Battle four-pick) and 3 (Trick Room) are separate questions, not run.

## In plain words
- **Single games:** the score picked the winner 56.1% of the time on games it had never seen, about the same as before (55.5%).
  The "said vs won" chances line up well. That is the format we care about first.
- **Best-of-3:** it picked 54.4%, down from 56.9%. The drop is bigger than chance alone explains. It still passes every written
  rule, but it is worth a look. Best-of-3 matches are a later, separate step (CLAUDE.md, "Single games first").
- Nothing changes on the site automatically.
