# Kip's job queue, from Wed Nov 25 night (jobs 41-45). Paste the box into Kip (Antigravity).
Sim, Nov 25: "I want to use Kip as much as we can." Kip works down this list in order, one branch and one report per job.

```
Kip, job 40 was graded A by HH (verified: your data test fails 7 checks on main's code, the page test fails 3 on design6's,
and every existing ruleset test still passes). Thank you. Your two branches are in GitHub now; HH merges them after it passes.

From now on you have a QUEUE: jobs 41-45 below, in order. For each job: one branch alt/gemini-<topic>, one commit batch,
push once when the job is done, write the report into docs/rebuild/test-runs/kip-job<N>-<topic>.md ON THAT BRANCH, then go
straight on to the next job. Same rules as always (kip-onboarding.md + CLAUDE.md): never main or claude/design6, never merge
into them, never force-push or delete, never commit out/, never change an existing test to make it pass, no design/CSS/page
wording. If a job is blocked, write why in its report and move to the next one. GitHub runs tests on every push and the queue
is the team's bottleneck (one batch at a time, 40-70 min), so push each branch ONCE, when its job is finished. Don't dispatch runs.
Always `git fetch` first and branch from the newest origin tips (design6 and main move during the night).

JOB 41: Saturday's switch, a full dress rehearsal (highest value).
On Sat Nov 28 the redesign (claude/design6) is merged into main. Rehearse it now so Saturday is boring.
- Branch alt/gemini-switch-dry from origin/main. `git merge origin/claude/design6` (yes: on YOUR branch this merge is the job).
  Resolve the conflicts with your job-40 map; record each conflict and the exact resolution.
- Then run EVERY step of .github/workflows/test.yml that can run on a Linux machine (frozen out/ where the workflow uses it,
  today's out/ where it does), plus update.yml's test steps. Report each command, exit code and last line. For any failure,
  say whether it also fails on plain design6 / plain main (run it there) and what the fix would be (report, don't change tests).
- Read docs/rebuild/switch-runbook-nov19.md (and switch-readiness-nov18.md). List every step that is now wrong, missing or out
  of order, given what you found. Write the corrected step list in your report.
- Also include experiments/reg-test.mjs (your MEDIUM-3): propose the exact test change, with the reason, for HH and Sim to approve.

JOB 42: the Dec 1 night roster step, made one command.
On Dec 1 night the 24 new Reg M-D Pokémon + 4 Megas must be added (your job-40 correction 2 lists the places: data.js via
experiments/gen-roster.mjs --write, roster.json, SPRITE_ID in app/src/app/15-visual-helpers.js, sprites via
experiments/add-sprites.mjs, items lists, PAGE_REG, regulation.json "site").
- Write experiments/md-roster-step.mjs: one script that runs those steps in order, in DRY-RUN by default (prints every change,
  writes nothing) and with --write applies them. It must stop on the first error with a plain message.
- We don't know the new Pokémon yet. Test it on a FIXTURE: a fake regulation adding 2 existing Showdown Pokémon that aren't in
  our roster + 1 Mega. Write experiments/md-roster-step-test.mjs that runs it on a scratch copy and checks every file changed as
  expected, that running it twice changes nothing more (idempotent), and that rules-fixes-test, unrated-test and
  pokemon-pages-test still pass after it. Show the test failing on a broken step.
- Base it on the newest origin/claude/design6 (the switch merges design6 into main, so this lands everywhere).

JOB 43: make the merge gate work for merges into main.
docs/rebuild/merge-check.sh (on design6) gates merges into claude/design6 and main, but its test list is the redesign's, so it
cannot gate a merge into main today (HH hit this tonight). Today main and design6 differ; after Saturday they're the same.
- On a branch from origin/claude/design6: make the test list depend on the target branch (pass the target as an argument or read it
  from the branch being pushed), keeping today's design6 list exactly as it is. For main, use the checks .github/workflows/test.yml
  runs for main's code.
- Keep every existing safety check (report read, GitHub green on the source tip, HEAD is the merge, clean tree, no conflict
  markers, exit code per test). docs/rebuild/pre-push-hook.sh must keep refusing an unstamped merge to either branch.
- Test it: a fake merge in a scratch repo for each target; prove a failing test blocks the stamp; prove the hook refuses an
  unstamped push (to a local bare repo, never to GitHub's main).

JOB 44: your LOW-1, plus the health alarms on quiet launch days.
- md-watch.mjs:45 ignores regAt; md-watch.mjs:60-67 and health.mjs:100-101 raise "paused"/"no new tournament" alarms on days with
  zero events even when the API answers fine. Fix on a branch from origin/main (data jobs run from main), smallest change each:
  an empty-but-healthy day is not an outage; a real outage (API errors, no response) still alarms.
- Tests that fail first and pass after, with a fake clock (as md-day-one-test does).

JOB 45: the flaky page test.
Tonight `node app/test/run.mjs` failed once ("FAIL pre-launch suite", from app/test/prelaunch.mjs) inside docs/rebuild/merge-check.sh
on a merge of alt/phone-speed2 into design6, then passed on a rerun of the same code. A flaky gate wastes everyone's time.
- On a branch from origin/claude/design6: run app/test/prelaunch.mjs (and run.mjs) many times (at least 20), with today's out/ and
  with the frozen out/, also under CPU load (another build running), and find which check fails and why.
- Fix the cause, not the symptom: no longer timeouts unless you prove the cause is a too-short wait for something that really
  takes longer, and say what it waits for. Show it failing before (or the failure rate) and 20+ passes after.

After job 45, write one line per job (branch, SHA, done/blocked) at the end of the job-45 report, then stop.
```
