# Kip job 40 (git): the Dec 1-2 switch-over audit, Nov 25 (replaces job 38, which was written for old Kip's upload)
Paste the box into Kip (Antigravity). Big job: it may take a few hours. One report at the end.

```
Kip, job 40. Same rules as before (kip-onboarding.md + CLAUDE.md; your branches only, alt/gemini-*; never main or claude/design6;
never merge, force-push or delete; never commit out/; the commit guard on). Job 39 was graded A: thank you. Two notes from it:
- HH fixed both things you found (21st/22nd/23rd in rankEdge; syntax-check on Windows), now on alt/t2-pending.
- The repo is public, so commits should not carry a personal name: unless Sim tells you otherwise, run
  `git config user.name "Kip (Antigravity)"` in the repo first.

THE MOMENT: the game's new ruleset, Reg M-D, starts Dec 2 02:00 UTC (Tue Dec 1, 9 PM Eastern), and a balance patch lands with it.
NastyPlot goes public the same days. Rule: Reg M-C and Reg M-D numbers are NEVER mixed. Until there's enough M-D data, the site keeps
showing M-C numbers and says so. A mistake here shows wrong or mixed numbers to every first visitor. Find it before it happens.

WHERE THE CODE IS:
- The daily data jobs run from `main` (.github/workflows/update.yml; cron in UTC), today at origin/main.
- The page (the redesign) is `claude/design6`. On Sat Nov 28, design6 is merged into main ("the switch"), so on Dec 2 main = both.
- The balance patch: branch alt/patch-dec2 (experiments/apply-dec2-patch.mjs, patch-dec2-test.mjs; maps in
  docs/rebuild/test-runs/patch-dec2-map.md and patch-dec2-psychup.md).
- The plan HH wrote for Dec 1 night: docs/rebuild/md-start-night-plan.md.
- Ruleset code: regstate.mjs, reg.mjs, reg-guard.mjs, reg-stamp.mjs, md-watch.mjs (+ .github/workflows/md-watch.yml), formats.mjs,
  update.mjs, model.mjs, six.mjs, ctr.mjs, model-guard.mjs, health.mjs, perf.mjs, events.mjs, official.mjs, scoreboard.mjs, track.mjs,
  ratings-snapshot.mjs, .github/workflows/promote.yml. On the page: regInfo() in app/src/app/24-sheet-data.js; V2.mdCountdown,
  V2.regDay, V2.regYoung, V2.dataNote in app/src/v2/shell.js. Tests: experiments/md-day-one-test.mjs, reg-guard-test.mjs, reg-test.mjs,
  reg-switch-test.mjs, unrated-test.mjs.

STEP 0: build the Dec 2 picture locally (do NOT push it): a scratch branch from origin/claude/design6, `git merge origin/main`, then
`git merge origin/alt/patch-dec2`. List any conflicts and how you'd resolve them (that list is itself useful: the Saturday switch
will hit the same ones). Run the ruleset tests on it (frozen out/), and report every result line.

THE JOB:
1. Timeline walk-through. For each moment, say what each job and the page do (file:line) and whether it's right:
   a) Nov 30 / Dec 1 daily runs (the countdown showing);
   b) Dec 2 00:00-02:00 UTC (countdown's last hours; a visitor in Los Angeles vs Tokyo);
   c) 02:00 UTC exactly, and the first daily run after it;
   d) M-D day one with 0 M-D events, then 3, then the switch threshold (find "need"), then the first M-D model run;
   e) a tournament dated Dec 1 local time that is already Dec 2 in UTC (which ruleset does each job put it in?);
   f) a source that reports M-D games early, late, or with an unexpected format string;
   g) md-watch firing before, during and after the start.
   Wherever you can, don't just read: RUN it. Fake the clock (the jobs and tests take dates/env vars; find how md-day-one-test does it)
   and fake data files, and show the output.
2. Never mixed: hunt for any path where M-C and M-D games, teams, usage, ratings, history or the model could mix: caches,
   "last N days" windows that straddle the start, files reg-guard archives or empties (data-loss risk?), history per ruleset,
   ratings-snapshot, track, scoreboard, the shadow model.
3. The patch: is apply-dec2-patch.mjs idempotent (run twice = same result; prove it by running it twice)? What if it runs before or
   after the roster step (24 new M-D Pokémon + 4 Megas)? Does patch-dec2-test really fail on a bad patch (break it and show)?
4. Failure modes: what the site shows if the daily job fails on Dec 2, if promote is blocked by a failing test, or if a source is down.
   Is anything left saying "M-C" or "Reg M-D in N days" after the start, anywhere on the page?
5. The plan: does md-start-night-plan.md match what the code does? List every step that's wrong, missing or out of order.

DELIVER (one commit batch per branch, then push):
- docs/rebuild/test-runs/kip-job40-switch-audit.md: findings ranked CRITICAL (wrong/mixed numbers or data loss on Dec 2) / HIGH /
  MEDIUM / LOW, each with file:line, proof (input -> what happens now -> what should happen), the command you ran and its exact
  output, and checked/not checked. Then the Step 0 conflict list, the plan corrections, and one line per area 1-5 (even "nothing found").
- New tests for every gap you find, each one shown FAILING on the bug it guards and passing after the fix.
- Fixes, smallest change each, one commit per fix:
  - data-job fixes on a branch from origin/main named alt/gemini-md-data;
  - page/test fixes on a branch from origin/claude/design6 named alt/gemini-md-page.
  Put the report file on alt/gemini-md-page. If a fix needs both sides, say so and split it.
- Never change an existing test to make it pass. Never touch CSS, layout or the words on the page: if the right fix changes
  what visitors see, describe it in the report and stop there (HH and Sim decide).
- Don't run GitHub workflows yourself; HH queues them.
Report at the end in your usual format, plus the branch names and SHAs.
```
