# Saturday Nov 28: the switch (the redesign becomes main). Runbook v2, written Wed Nov 25 night by HH from Kip's job-41 rehearsal.
Replaces the step list in switch-runbook-nov19.md (keep that file for the detail of the artifact publish, R1-R4). Source of the
conflict list and the findings: docs/rebuild/test-runs/kip-job41-switch-dry.md on alt/gemini-switch-dry (rehearsed merge 36ccc632).
Sim says yes on the day; nothing here runs before that.

## Must be landed BEFORE Saturday (status as of Wed 11:43 PM is in decisions.md)
1. Kip job 40 fixes: page side in design6 (a2c7f240), data side on main (f4017535). DONE.
2. **Kip job 46: the news freshness blocker.** DONE: page half in design6 (night batch b96f3a5e), data half on main b6fafa71 (Nov 26 morning, Sim's OK). After the merge, main's health.mjs dates out/post.json by `checked` (a person's last
   gift check), so every daily run would fail "News & Mystery Gifts: data from 2026-11-18, 8 days old (limit 3)" and freeze live
   data. Fix: post-news.mjs stamps `ran` on each successful run; health dates post.json by `ran`. Two branches + proof on a merge.
3. Kip job 47 (Turnstile drawn twice): DONE, merged in design6 9bab576f (helper Job I; cause: redraw replaced the widget box).
4. The score batch: score fix on main (alt/score-ebfix4, auto fast-forward on green), option C + gate threshold + recScore on design6
   (alt/bands-c2 + dea859e4). Under C the accuracy gate counts teams favoured to win (CH.ssOfE(.5)), so it keeps its baseline.
4b. Kip job 48: merge-check.sh target main runs BOTH lists. DONE (Kip, verified by HH Thu Nov 26 morning: merge-gate-test ALL PASSED
   incl. 5d/5e, a failing test from either list blocks the main stamp). It switches on by itself when the merge's own test.yml has
   app/test/v2-public.mjs, so on Saturday ONE run of `REPORT_OK=1 bash docs/rebuild/merge-check.sh <scratch> main` covers both lists.
   In alt/day-batch (gate running Thu morning); rehearsal 3 (helper Job R, alt/switch-rehearsal3) checks it on a real scratch merge.
5. experiments/reg-test.mjs: 3 failures once main's regulation.json meets design6 (Kip job 40 MEDIUM-3; job 41 section 5 has the
   proposed change). It is not in test.yml, so it doesn't block; decide with Sim whether to update it.

## Thu Nov 26 afternoon: Friday is the proposed day (Sim open to switching early; HH rec Fri Nov 27 morning, before the
Stuttgart Regional weekend). Evidence so far:
- Rehearsal 4 (Kip job 59, alt/gemini-rehearsal4 577d22ce): main 03cd5e41 + design6 58137089, the 5 known conflicts only,
  switch-smoke ALL PASSED, GitHub run 45876567395 15/15 green.
- switch-smoke on a batch5 build with today's main data: ALL PASSED (346 rated, 17,676 teams, 114 events, Data as of Nov 26).
- Steps 6-7 dry run (helper Job T): build command fixed (no --public), step 7 before step 6, 369 files, 0 sp/.
Still needed before Friday: batch 6 merged into design6 + green; Sim's go after using the Preview tonight; redo the merge on
Friday's tips (design6 will have moved) and run merge-check target main (both lists, Kip 48).

## Rehearsal 2 (Thu Nov 26, night): PASSED
alt/switch-rehearsal2 1039d5ea = main + design6 b96f3a5e + Kip 46 data half: the 5 conflicts resolved exactly as step 2 below says;
merge-check's main list + design6 list locally 48 of 48; GitHub's full test.yml run on it: success (run 45785844537).
Report: docs/rebuild/test-runs/switch-rehearsal2-nov26.md. On Saturday, redo the same merge on the day's tips (design6 will have moved).

## Saturday, in order
1. **Preflight (from GitHub, not the clock):** run `node experiments/switch-preflight.mjs` (checks no update.yml run in progress,
   main + design6 test.yml green, live == main or green, FAST_DATA != `1`, and out/regstate.json + out/post.json state). Save the
   live artifact's index.html (sha256 prefix, version id) for the undo.
2. **Merge** `origin/claude/design6` into main on a scratch branch. Expect these 5 conflicts (job 41 section 1):
   - test.yml: union of both `paths:` lists (keep main's regulation/no-rk9/date-switch/freshness/bo3/shadow/dec2 tests and
     design6's syntax-check + public tests); keep every run step from both.
   - update.yml: design6's post-news.mjs + post-data-test.mjs, THEN main's shadow-scoreboard.mjs (PREV_MATCHES) and the
     MODEL_SHADOW model.mjs line.
   - formats.mjs: main's REG_END from regulation.json (+ design6's HOME news 878 comment).
   - **official.mjs: main's regulation.json-driven header. Taking design6's copy would revert it to a hard-coded REG = 'M-C'.**
   - update.mjs: main's nTeams zero-division guard AND design6's `megaN: MG`.
   Then: 0 conflict markers (rg), `node --check` on the .mjs files, both YAML files load.
3. **Gate:** `REPORT_OK=1 bash docs/rebuild/merge-check.sh <scratch branch> main` (Kip 43 + 48: main's list AND design6's list,
   automatically). Record the step count and every exit code. Push main only when everything passes.
4. **GitHub:** "Test NastyPlot page" green on main, then "Promote to live" advances `live`.
5. **First merged data run:** dispatch "Update Limitless data" on main, so out/regstate.json, out/post.json (with `ran`), ckwin,
   megaN and track.json bands land. Tests green again, live advances. (regstate.json is missing until this run: expected, job 41 #2.)
   CHECK out/post.json has a `ran` field after this run (`node -e "console.log(require('./out/post.json').ran)"`). If the news feed
   failed on this first run, post.json has no `ran`, health.mjs says "News & Mystery Gifts: no date" and the run fails (HH, Thu Nov 26,
   reading health.mjs:31 + update.yml:63/130). Fix: dispatch the data run again once the feed answers.
5b. **Step 7 BEFORE step 6** (helper Job T, Thu Nov 26, F4): update the refresh task's prompt first (text ready in
   docs/rebuild/refresh-prompt-switch.md on alt/switch-dryrun67; save today's prompt first) and fire one refresh, so News, Gifts and
   the info-sheet counts have data the moment the new page is up. Safe early: the old page has no post/info META keys (checked).
6. **Publish the redesign to the live artifact:** BUILD WITH `cd app && node build.mjs --v2 --art=v2art/ --one-art-size --split`
   (NOT the nov19 doc's `--public`: since Nov 25 `--public` builds the Cloudflare site with root paths that break on the artifact;
   Job T F1). Dry run Thu Nov 26: 369 files, 360 art, 0 sp/, 15.05 MB, fonts identical to live's 7, every page loads at 390/1440. switch-plan.py with today's art count (360 art files, not the 350 in the old doc),
   R1 -> R4 as in switch-runbook-nov19.md (omit capabilities and contract); check the file count and zero sp/ files.
7. **Refresh task:** save its prompt first, then add out/post.json -> meta/post AND out/info.json -> meta/info (17 META_KEYS now,
   not 16), plus the split/cleanup lists; one refresh with Sim's go.
8. **Verify** on phone and desktop (Home, My Team, Meta, News, Gifts, Track Record, a saved team), log everything, keep the undo ready
   all day.

## Undo
Re-publish the saved live index.html version; main can be reset only with Sim's explicit OK (rewriting main's history is on the
never-without-Sim list). Prefer a forward fix.
