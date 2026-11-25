# Data every 4 hours, ready to flip (game plan #7, Fri Nov 27)
Written 6:40 AM Wed Nov 25 (clock: docs/rebuild/now.sh). Scope: the first 2 weeks of Reg M-D (from Dec 2). NOTHING here is switched on.
Base: origin/main b19b8044. Nothing in this file is applied to any workflow on any branch; HH applies it.

## 0. What I found first (it changes the job)
- **The switch already exists on main** (checked: `git log -- .github/workflows/update.yml` → a90eac30, Nov 24 17:56 UTC,
  "update.yml every 4 hours behind FAST_DATA=1, default off"). update.yml has a second cron `7 1,5,13,17,21 * * *` and the job
  `if: github.event_name != 'schedule' || github.event.schedule == '7 9 * * *' || vars.FAST_DATA == '1'`, plus
  `concurrency: update-data` (no overlap). So the turn-on is already ONE edit: repo variable FAST_DATA=1.
- **Bug, costing runs today with the switch OFF** (checked, `gh api .../workflows/396544706/runs` and `.../396954185/runs?branch=main`):
  data runs #42 (Nov 24 22:00 UTC) and #43 (Nov 25 09:47 UTC) ended `skipped`, and each still started a full
  "Test NastyPlot page" run (#1523 22:00→22:15, #1559 09:47→10:01) and a Promote. Cause (checked by reading test.yml): its
  `workflow_run: types: [completed]` trigger fires on every completion, skipped included. That is up to 5 wasted test runs a day (GitHub dropped some times: 2 seen so far)
  while the switch is off. Fix in section 1 (test.yml part). Not harmful to data (Promote only moves `live` forward).
- **Turning on FAST_DATA alone does NOT make the site fresher.** The live page only changes when the "NastyPlot data refresh"
  task copies `live` into it, and that task runs once a day (checked, get_trigger trig_014evvWRoLJicqGyvhYQCStx:
  `CRON_TZ=America/New_York 52 6 * * *`). The Preview job is also daily (trig_014FJu3gufbrwjZwJhnax2EE: `41 7 * * *` ET).
  So the turn-on needs the refresh cron changed too (section 3).
- Which of #43 / #44 was the 9:07 daily run: I'm unsure. #44 (10:10, success) fits the daily slot; #43 (09:47, skipped) is most
  likely a very late 1:07 or 5:07 firing (GitHub queues scheduled runs under load). The 1:07 and 5:07 times have no other run.

## 1. The patch (validated, not applied)
What it does:
- update.yml: the extra 4-hourly runs read only Limitless and Showdown. official.mjs (Victory Road, VR Pastes, Liquipedia),
  calendar.mjs (Victory Road) and sources.mjs (Pikalytics, Showdown Tier) run only on the daily run and runs by hand.
  Reason: docs/legal-sources.md promises those sites "once a day" (Pikalytics "≤41 requests a day", Showdown Tier "one page a
  day"); 6x would break our own written promise. Their files stay from the daily run (each step already keeps the old file).
- update.yml: a 4-hourly commit is named "Limitless data 2026-12-02 13:44Z (4-hourly)"; the daily one keeps its name.
  Checked nothing parses that message (`git grep "Limitless data"` over *.mjs *.sh *.js *.yml *.cjs on design6: only titles).
- test.yml: the 4 jobs skip when the data run that triggered them ended skipped or cancelled (fixes the bug above).
  Push runs, runs by hand and runs after a real data commit are unchanged.
- docs/legal-sources.md: the "Once a day" line says what the 4-hourly weeks do (honest public wording).

Validation (checked, commands run in a scratch copy of b19b8044):
- `git apply --check all.diff` → "Checking patch .github/workflows/update.yml... test.yml... docs/legal-sources.md" (applies clean).
- `python3 -c "yaml.safe_load(...)"` on both patched files → "yaml ok" for each.
- `actionlint -shellcheck= update.yml test.yml` (actionlint-py from PyPI) → exit 0 on the original and on the patched files.
  Shell lint was off (shellcheck not installed). Not run on GitHub: not checked that `env.DAILY` reads 'true'/'false' at run
  time (GitHub turns a true/false expression in `env:` into the text 'true'/'false'; I'm confident, not tested).

```diff
--- a/.github/workflows/update.yml
+++ b/.github/workflows/update.yml
@@ -20,6 +20,11 @@
     if: github.event_name != 'schedule' || github.event.schedule == '7 9 * * *' || vars.FAST_DATA == '1'
     runs-on: ubuntu-latest
     timeout-minutes: 150
+    env:
+      # 'true' on the 9:07 daily run and runs by hand, 'false' on the extra 4-hourly runs. The sites we promised to read
+      # once a day (Victory Road, VR Pastes, Liquipedia, Pikalytics, Showdown Tier: docs/legal-sources.md) are read only
+      # when it is 'true'; the 4-hourly runs read Limitless and Showdown only and keep the other files from the daily run.
+      DAILY: ${{ github.event_name != 'schedule' || github.event.schedule == '7 9 * * *' }}
     steps:
       - uses: actions/checkout@v5
       - uses: actions/setup-node@v5
@@ -50,6 +55,7 @@
       # (RK9 was read here until Nov 1; its terms, rk9.gg/terms 5.3, forbid automated extraction, so rk9.mjs and
       # rk9-field.mjs were removed. The whole-field table they made is kept frozen in out/official_perf.json.)
       - run: node official.mjs || node skip.mjs "official events skipped (previous out/official.json kept)"
+        if: env.DAILY == 'true'
         env:
           NP_PID_KEY: ${{ secrets.NP_PID_KEY || secrets.THE_NP_PID_KEY }}
       - run: node events.mjs || node skip.mjs "events skipped"
@@ -57,6 +63,7 @@
       - run: node weekly.mjs || node skip.mjs "weekly digest skipped"
       # upcoming official VGC events from Victory Road's season calendar (out/calendar.json; keeps yesterday's file on failure)
       - run: node calendar.mjs || node skip.mjs "calendar skipped"
+        if: env.DAILY == 'true'
       - run: node model.mjs || node skip.mjs "model skipped"
       # each six's own record with player skill and opponents taken out, added to out/model.json for grade v2 (Nov 7)
       - run: node six.mjs || node skip.mjs "six records skipped"
@@ -70,6 +77,7 @@
       - run: node ladder.mjs || node skip.mjs "ladder stats skipped"
       # other sites' numbers: Showdowntier, Pikalytics (rating inputs, tier lists, cross-check)
       - run: node sources.mjs || node skip.mjs "outside sources skipped"
+        if: env.DAILY == 'true'
       # op.gg read PAUSED (Nov 18): op.gg's Terms of Use ban automated collection and copying without written permission
       # (docs/rebuild/research/opgg-terms-check-nov18.md). The last good meta_ingame.json stays; the browser install stays
       # because the ratings and win snapshots below use it. To resume: put "&& node opgg.mjs" back once op.gg agrees in writing.
@@ -96,7 +104,8 @@
           git config user.email "pokelair-bot@users.noreply.github.com"
           git add -A
           git diff --cached --quiet && exit 0
-          git commit -m "Limitless data $(date -u +%F)"
+          # the daily commit keeps its usual name; a 4-hourly one adds the time, so six commits a day can be told apart
+          if [ "$DAILY" = true ]; then git commit -m "Limitless data $(date -u +%F)"; else git commit -m "Limitless data $(date -u +'%F %H:%MZ') (4-hourly)"; fi
           # code can change on main while the job runs; replay the data commit on top and retry
           for i in 1 2 3; do git pull --rebase origin main && git push && exit 0; sleep 10; done
           exit 1
--- a/.github/workflows/test.yml
+++ b/.github/workflows/test.yml
@@ -22,6 +22,9 @@
   # changed a result. Change TEST_DATA only on purpose (e.g. a new regulation), to a commit whose data passes every check.
   test:
     name: code tests (frozen data)
+    # not after a data run that did nothing: a 4-hourly time with FAST_DATA off ends "skipped" (and a cancelled run
+    # committed nothing); without this, each of those started the full test run and Promote (Nov 24 22:00, Nov 25 9:47)
+    if: github.event_name != 'workflow_run' || (github.event.workflow_run.conclusion != 'skipped' && github.event.workflow_run.conclusion != 'cancelled')
     runs-on: ubuntu-latest
     timeout-minutes: 35
     steps:
@@ -99,6 +102,9 @@
   # result (Nov 9: complete sets flipped a Pelipper verdict, a lead and the grade checks). Still blocks the live branch.
   data-checks:
     name: data checks (today's data)
+    # not after a data run that did nothing: a 4-hourly time with FAST_DATA off ends "skipped" (and a cancelled run
+    # committed nothing); without this, each of those started the full test run and Promote (Nov 24 22:00, Nov 25 9:47)
+    if: github.event_name != 'workflow_run' || (github.event.workflow_run.conclusion != 'skipped' && github.event.workflow_run.conclusion != 'cancelled')
     runs-on: ubuntu-latest
     timeout-minutes: 35
     steps:
@@ -125,6 +131,9 @@
   # fails the workflow (so it never holds back the live site); it opens or refreshes one "Live-data audit" issue, closed when clean.
   live-audits:
     name: live-data audits (alert only)
+    # not after a data run that did nothing: a 4-hourly time with FAST_DATA off ends "skipped" (and a cancelled run
+    # committed nothing); without this, each of those started the full test run and Promote (Nov 24 22:00, Nov 25 9:47)
+    if: github.event_name != 'workflow_run' || (github.event.workflow_run.conclusion != 'skipped' && github.event.workflow_run.conclusion != 'cancelled')
     runs-on: ubuntu-latest
     timeout-minutes: 30
     continue-on-error: true
@@ -172,6 +181,9 @@
   # by a model trained only on earlier events, against the approved baseline (experiments/accuracy-baseline.json). Its own job,
   # so training the two models can't push the main test job past its time limit.
   accuracy-gate:
+    # not after a data run that did nothing: a 4-hourly time with FAST_DATA off ends "skipped" (and a cancelled run
+    # committed nothing); without this, each of those started the full test run and Promote (Nov 24 22:00, Nov 25 9:47)
+    if: github.event_name != 'workflow_run' || (github.event.workflow_run.conclusion != 'skipped' && github.event.workflow_run.conclusion != 'cancelled')
     runs-on: ubuntu-latest
     timeout-minutes: 40
     steps:
--- a/docs/legal-sources.md
+++ b/docs/legal-sources.md
@@ -12,7 +12,10 @@
   The op.gg step (a headless browser) appends the same string to its browser User-Agent.
 - **Paced.** `http.mjs` spaces requests to the same host at least 1 second apart (1.1 s, with slack); scripts with their own
   longer pauses keep them (Limitless 6.5 s, outside sources 1.5 s).
-- **Once a day.** `.github/workflows/update.yml` runs once a day; Smogon stats are only downloaded when a new month is out.
+- **Once a day** (one exception below). `.github/workflows/update.yml` runs once a day; Smogon stats are only downloaded when a new month is out.
+  Exception: for the first 2 weeks of a new regulation (repository variable FAST_DATA=1) it also runs every 4 hours, and those
+  extra runs read only Limitless (same 6.5 s spacing and per-run cap) and Pokémon Showdown (same pacing and cap). Every other
+  site is still read once a day.
 - **Credit.** Every source is named in the page footer and on the About & legal page, with a link.
 - **Removal.** Anyone can ask for anything to be changed or removed at simran.jsbagga@gmail.com (shown on the About page).
 
```

## 2. The schedule (UTC) and why
- Six runs: **1:07, 5:07, 9:07, 13:07, 17:07, 21:07 UTC** (= 8:07 PM, 12:07 AM, 4:07 AM, 8:07 AM, 12:07 PM, 4:07 PM Eastern; Dec 2-16
  is all EST, UTC-5). Kept as already on main: even 4-hour gaps; the 9:07 daily stays one of the six, so the `'7 9 * * *'` text that
  marks the daily run (and the 6:52 AM refresh slot) does not move; :07 is off :00.
- Real start times are late: the last 8 successful daily runs started 39-65 minutes after 9:07 (checked: #35-#41 and #44, run_started_at 09:46-10:11).
  GitHub says the top of the hour is busiest. Moving to e.g. :37 might start sooner: not checked, so not proposed (it would also
  move the daily marker and the refresh alignment).
- Chain timing (checked from run times): data job 33-45 min (8 scheduled runs Nov 18-25; Nov 17 was 21 min) → tests 14-15 min
  (#1523, #1559, #1560) → Promote under 1 min (#56-#61). Cron to `live`: about 1 h 30 to 2 h 10.
- So the refresh runs 2 h 45 after each cron, as it does today (9:07 → 11:52 UTC = 6:52 AM EST):
  **3:52, 7:52, 11:52, 15:52, 19:52, 23:52 UTC = `CRON_TZ=America/New_York 52 2,6,10,14,18,22 * * *`**. Margin ≥ 35 min on the
  slowest day seen. If a data run is late, that refresh copies the previous data (its step 1 only stops if data is 2+ days old): no harm.

## 3. Turn on (the night before, Tue Dec 1; runbook-dec2.md already lists it)
1. Land section 1 on main first (code change: Sim's go for main). Any day before Dec 1 is fine; it also stops today's wasted test runs.
2. Settings > Secrets and variables > Actions > Variables > New repository variable: `FAST_DATA` = `1`.
   (or `gh variable set FAST_DATA --body 1 --repo theresearchmode-glitch/pokelair-data`)
3. Refresh task (HH may edit it, Sim's standing OK Nov 24): `update_trigger trig_014evvWRoLJicqGyvhYQCStx`
   cron_expression `CRON_TZ=America/New_York 52 2,6,10,14,18,22 * * *` (schedule only, no prompt change).
4. Preview (trig_014FJu3gufbrwjZwJhnax2EE): leave daily. Reason: it wakes HH's own session and builds for ~15 min each time;
   after the Sat Nov 28 switch the redesign IS the live site, so the refresh is what players see. (Only if Sim wants the
   Preview fresh too: `41 7,15 * * *`.)
5. Check the first fast run: Actions > Update Limitless data shows a run at ~1:07-2:15 UTC that is NOT "skipped", a commit
   "... (4-hourly)", then a test run and Promote; `live/out/limitless.json` "updated" moves; the 2:52 AM ET refresh reports it.

## 4. Turn off (Dec 16, 14 days; runbook "FAST_DATA off after 14 days")
1. Delete the variable or set `FAST_DATA` = `0` (`gh variable delete FAST_DATA --repo theresearchmode-glitch/pokelair-data`).
   The five extra times then end "skipped" in seconds and (with section 1) start no tests.
2. Refresh back to daily: `update_trigger trig_014evvWRoLJicqGyvhYQCStx` cron `CRON_TZ=America/New_York 52 6 * * *`.
3. Preview back to `41 7 * * *` only if step 4 above was used. Log both with log-decision.sh.

## 5. Risks, with evidence
- **Actions minutes: $0.** The repo is public (checked: `gh api repos/... --jq .visibility` → "public"); GitHub's timing API
  shows `"billable":{"UBUNTU":{"total_ms":0}}` for data runs #44 and #43. Runner time grows from about 85 job-minutes a day
  (data ~35 + 4 test jobs ~14 each + Promote) to about 520, ~7,300 over 14 days. If the repo ever went private, the Free plan's
  2,000 minutes a month would run out in about 4 days: keep it public while FAST_DATA is on. Concurrent-job limit (20) not near:
  4 test jobs every 4 h plus design6 pushes.
- **Rate limits.** Limitless: update.mjs waits 6.5 s between calls (GAP_MS), backs off on 429 (Retry-After + 2 s), at most 40
  tournaments per scheduled run (MAX_FETCH); docs/legal-sources.md cites Limitless's "50 requests per 5 minutes". Per run nothing
  changes; runs are 4 h apart, so the 5-minute limit is never shared. Limitless's terms for a public site: NOT checked (already on
  the game plan before launch). Showdown replays: replays.mjs, 350 ms pause plus http.mjs's 1.1 s per host, at most 600 new games
  and 60 search pages per run; MIT data, no robots.txt (legal-sources.md). 6x a day can mean up to 3,600 replay requests a day if
  that many games exist; real counts not checked. replays.json keeps the newest 20,000 games, so more games a day = fewer days kept.
- **Duplicate commits / collisions.** `concurrency: update-data`, cancel-in-progress false: runs never overlap (timeout 150 min,
  gap 240 min). Commit is skipped only when nothing changed, but every run writes timestamps (update.mjs:135 `updated:
  new Date().toISOString()`, ratings_log.json `updated`), so expect one commit per run, 6 a day: that is intended (each one is
  tested before `live` moves). Code pushes to main meanwhile: the Commit step already rebases and retries 3 times. Weekly /
  monthly jobs commit other files (out/recheck.json), so no conflict. test.yml's group `test-refs/heads/main` cancels an older
  main test run if a newer one starts; cancelled runs email nobody (comment in test.yml).
- **Emails.** Issues are already de-duplicated ("Daily data problem": body refreshed, comment only when the problem list changes).
  But GitHub emails a failed scheduled run each time: a broken source could mean up to 6 emails a day instead of 1. health.mjs
  gives daily sources 2 days before failing, which limits it. Not changed here.
- **Model drift through the guard.** model-guard.mjs compares with the last committed model (HEAD), allowing 0.005 log-loss and
  rank correlation 0.85 per step. With 6 steps a day, the total change allowed in a day is larger than today. I'm unsure it
  matters; worth one look at out/scoreboard after the first 2 days.
- **Ratings snapshot.** One per UTC date (ratings-snapshot.mjs keeps `d` = date, later runs replace it), so the 21:07 run's
  snapshot is the one kept. Fair-test honesty holds: scoreboard.mjs:36 and track.mjs:20 only judge a snapshot on events dated
  AFTER its date (checked by reading).
- **Watchdog** (daily 12:47 UTC): fine with 6 runs (reads 30 runs, uses the last success; "live data" red after 30 h). It will not
  notice a 4-hourly run missing; the daily data job and refresh reports would. Optional later: an amber at 8 h while FAST_DATA=1.
- **Claude usage.** The refresh is a fresh Claude session each time (Nov 24 run: 2 min 46 s). 6 a day = 6 sessions a day for 14
  days. Token cost not measured.
