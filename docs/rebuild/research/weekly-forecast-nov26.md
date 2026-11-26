# Weekly meta forecast ("Week 1 of our public record"): can we beat "same as last week"? HH, Thu Nov 26 (time: 12:16 AM (12:16:01)  date: Thu Nov 26, 2026)
Status: research only, nothing built. For Sim's morning read. Script: experiments/forecast-backtest.mjs (run: `node experiments/forecast-backtest.mjs .`).

## What was tested (checked: ran the script on today's data/)
- Data: data/index.json + data/t2/<id>.json. Reg M-C events with 32+ players; top cut = placing 8 or better (same rule as events.json).
- A Pokémon's weekly share = top-cut teams with it / all top-cut teams that week (weeks start Monday UTC).
- Each week is forecast from earlier weeks only, scored on the 30 Pokémon most used the week before (nothing peeks ahead).
- Five simple forecasts: naive (same as last week), mean of 3 weeks, EWMA (half weight on the newest week), trend (last week + half its
  last move), damped (60% last week + 40% the 3-week mean).

## Result
```
tested weeks: 3 (a week counts only if it and the week before have 40+ top-cut teams)
naive   mean abs error 3.93 pts · best in 0 week(s) · direction calls 0/0
mean3   mean abs error 4.54 pts · best in 0 week(s) · direction calls 33/52
ewma    mean abs error 3.73 pts · best in 2 week(s) · direction calls 27/37
trend   mean abs error 4.88 pts · best in 0 week(s) · direction calls 16/39
damped  mean abs error 3.76 pts · best in 1 week(s) · direction calls 19/25
```
(mean abs error is in share points: 3.9 = off by 3.9 percentage points per Pokémon on average)

## What it means, plainly
1. **Too few weeks to know.** Reg M-C only has enough events from Nov 2 on, so 3 weeks can be tested. EWMA beat "same as last week" by
   0.2 points: that is noise on 3 weeks. Rule 21: too few = "unknown". We cannot say our forecast is better yet.
2. **Chasing risers is the worst idea.** The trend model was worst (4.88) and its up/down calls were right 16 of 39 times (41%):
   Pokémon that rose one week tended to fall back the next. Our Home "Rising" list is fine as a record of what happened, but it must
   never be worded as a prediction.
3. The smoothed forecasts (EWMA, damped) were the only ones at or below naive in all three weeks.

## Recommendation (for Sim to decide)
- Launch the forecast (~Dec 18) as an honest public record, not a claim: each week publish "our call" (EWMA share per top-30 Pokémon,
  plus the 3 biggest expected moves) next to the plain guess "same as last week", and grade both the week after on the same page.
  Reason: it can fail in public, which is what makes it worth trusting (rule 21), and kids learn that meta guesses are uncertain.
- Wording: "Week 1 of our public record. We don't know yet if we beat the simple guess; this page will show it, week by week."
- Reg M-D starts Dec 2, so Week 1 restarts on new data: the first forecast needs 2 weeks of M-D events (first call about Dec 14-16).
- Not checked yet: weighting by event size, per-event (not per-team) counting, and whether official events behave differently.
