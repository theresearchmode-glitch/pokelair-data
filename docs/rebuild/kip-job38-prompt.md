# Kip job 38: the Dec 1-2 switch-over audit (Reg M-D starts + the Dec 2 balance patch), Nov 25
One Gemini chat: paste the box, then upload docs/rebuild/kip-job38-files.txt (0.48 MB, 42 files).
Base: claude/design6 (the redesign with the launch batch merged) + the Dec 2 patch branch alt/patch-dec2.

```
You are helping on NastyPlot, a Pokémon Champions website (Sim's project; Sim is he/him). It goes public at nastyplot.org on
Dec 2-3, the same days Reg M-D starts and a balance patch lands. Read CLAUDE.md first (it is the first file in the upload).
Code review, test design and simulation only: NO design or wording changes.

Hard rules: work only from the uploaded file; never invent code (ask for a file by path). Label every claim "checked (how)" or
"not checked"; "I'm unsure" beats a confident wrong answer. Proof per finding: input -> what happens now -> what should happen.
Smallest fix, as a unified diff against the uploaded file. All code as plain text (never HTML-escaped). Time zones: every time names
its zone; GitHub Actions cron is UTC; visitors see their own zone; test the UTC-midnight edges. Never change a test to make it pass.
Severity: CRITICAL (on Dec 2 the site would show wrong or mixed M-C/M-D numbers, lose data, or break), HIGH, MEDIUM, LOW.

THE MOMENT: Reg M-D starts Dec 2 02:00 UTC (Tue Dec 1, 6 PM Pacific / 9 PM Eastern). The balance patch arrives with it.
Rule: M-C and M-D numbers are NEVER mixed. Until there's enough M-D data, the site keeps showing M-C numbers and says so.
Files that run this: regstate.mjs, reg.mjs, reg-guard.mjs, reg-stamp.mjs, md-watch.mjs (+ workflow), formats.mjs,
update.mjs, update.yml (the daily data job), promote.yml (data reaches live only after tests pass), model.mjs, six.mjs,
ctr.mjs, model-guard.mjs, health.mjs, perf.mjs, events.mjs, official.mjs, scoreboard.mjs, track.mjs, ratings-snapshot.mjs.
On the page: regInfo() in 24-sheet-data.js, V2.mdCountdown / V2.regDay / V2.regYoung / V2.dataNote in shell.js.
The plan HH wrote: docs/rebuild/md-start-night-plan.md. The patch: experiments/apply-dec2-patch.mjs + patch-dec2-test.mjs + the
two patch maps. Existing tests: md-day-one-test, reg-guard-test, reg-test, reg-switch-test, unrated-test.

JOB 38: find every way the switch can go wrong BEFORE it happens, and hand us the fixes and the missing tests.

1. Timeline walk-through. For each moment, say what each job and the page do, reading the code (file:line), and whether it's right:
   a) Mon Nov 30 / Tue Dec 1 daily runs (countdown showing);
   b) Dec 2 00:00-02:00 UTC (the countdown's last hours; a visitor in Los Angeles vs Tokyo);
   c) Dec 2 02:00 UTC exactly, and the first daily run after it (find the cron times in update.yml);
   d) M-D day one with 0 M-D events, then 3, then the switch threshold (find "need"), then the first M-D model run;
   e) a tournament dated Dec 1 local time that is already Dec 2 in UTC (which regulation does each job put it in?);
   f) a source that reports M-D games early, late, or with the wrong format string;
   g) md-watch firing before, during and after the start.
2. The never-mixed rule. Hunt for any path where M-C and M-D games, teams, usage, ratings, history or the model could mix:
   caches, "last N days" windows that straddle the start, files reg-guard archives or empties (data-loss risk?), history kept per
   regulation, ratings-snapshot, track, scoreboard and the shadow model.
3. The patch. Is apply-dec2-patch.mjs idempotent (run twice = same result)? What if it runs before or after the roster step
   (24 new M-D Pokémon + 4 Megas)? What if the official patch differs from the map? Does patch-dec2-test really fail on a bad patch?
4. Failure modes: what the site shows if the daily job fails on Dec 2, if promote is blocked by a failing test, or if a source is
   down. Is anything left saying "M-C" or "Reg M-D in N days" after the start, anywhere?
5. Tests. List the cases above that NO current test covers. Write them as new test cases (diffs to md-day-one-test.mjs or
   reg-switch-test.mjs), each one able to fail on the bug it guards (show the input that makes it fail).
6. The plan. Does docs/rebuild/md-start-night-plan.md match what the code actually does? List every step that is wrong, missing,
   or in the wrong order.

Deliver: findings ranked CRITICAL first (file:line, proof, diff, checked/not checked); the new test cases; the plan corrections;
then one line per area 1-6: what you tried and what you found (even "nothing"); then files you'd want next.
```
