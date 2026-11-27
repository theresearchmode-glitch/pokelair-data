# Switch rehearsal: merge origin/main into claude/design6 (Wed Nov 25, 7:29-8:58 AM by now.sh)

Local only. Nothing pushed. Merge commit fd5b2256c3670726999e9f4cf87e6a29cffcedce
(parents 71fa996d = design6, b19b8044 = main). The worktree was removed at the end, so this sha is
dangling and may be garbage-collected; the code resolutions are saved as
/tmp/claude-0/-home-user-pokelair-data/204a9d61-5900-570f-b954-256bbb6b60d7/scratchpad/switch-rehearsal-code-resolutions.patch
(diff design6 -> merged for the 3 code files).

Note: origin/claude/design6 moved during the rehearsal (71fa996d -> 53309650, 6 doc/lab/log commits).
Rehearsal used 71fa996d. Saturday's numbers will differ.

## Headline (checked, by running)
- Only 33 files conflicted today (not 37): 29 out/*, md-watch.mjs, md-watch.yml, 08-render-all.js, 18-archetypes.js.
  test.yml, update.yml, track.mjs, update.mjs merged on their own (update.mjs keeps main's Dec 2 safety: checked by diff).
- Code resolutions are fine: old page ALL PASSED, guard clean, reg-switch / commander / score-src all pass.
- **6 v2-minors checks FAIL after the merge (main1: 3, main2: 2, groups: 1). All 6 are caused by main's newer DATA,
  not by the code resolutions**: unmerged design6 passes all three parts; design6 code + the merged out/ and data/
  reproduces exactly the same 6 FAILs. So GitHub's test.yml would go red on the merge on Saturday.
  **These must be fixed on claude/design6 BEFORE Saturday** (bring main's data into design6 early and make the tests/layouts
  hold with real current data).

## Conflicts and resolutions
### Data: took main's version (main's daily data is the truth) - 29 files
out/calendar.json, out/crosscheck.json, out/events.json, out/history.json, out/limitless.json, out/matches.json,
out/meta_tour.json, out/model.json, out/official.json, out/official_compare.json, out/perf.json, out/practice.json,
out/ratings_log.json, out/recheck.json, out/reg.json, out/replays.json, out/replays_bo3.json, out/scoreboard.json,
out/sources.json, out/split/events.json, out/split/events_2.json, out/split/index.json, out/split/model.json,
out/split/model_2.json, out/split/results.json, out/split/results_2.json, out/teams.json, out/track.json, out/weekly.json.
(No data/* file conflicted; main's data/p, data/t, data/t2, data/official, data/index.json arrived cleanly.)

### Code: 4 files
- md-watch.mjs and .github/workflows/md-watch.yml (both "added on both sides"): took main's.
  Why: design6's copy is byte-identical to main@6db70843 (checked: `git diff --stat 6db70843 HEAD` empty); main's
  668f235e review fixes sit on top, so main's is a strict superset. FEED stays inline (md-watch.mjs:19).
- app/src/app/08-render-all.js:162: kept design6's line (calls fixMetaSrc(), the v2 single fix-point) and inserted
  main's `ui.metaView` fallback right after it (88207ab2, op.gg paused). Both intents kept.
- app/src/app/18-archetypes.js:202-205: kept design6's date-checked cleanHistory (code review B10) and took main's
  trendKey reading ui.metaView.
- Extra (not a conflict, a semantic fix): app/src/v2/pages/usage.js:11 `V2.usAs` now swaps ui.metaView as well as
  ui.metaSrc. Why: v2's Usage page makes trend badges follow its own source by swapping ui.metaSrc around trendFor;
  after main's change trendKey reads ui.metaView, so without this the v2 badges would silently follow 'tour'.
  I'm unsure whether any v2 test covers trend badges on a non-tour source (not checked) - worth one look.

## Test results (exact last lines; merged worktree unless stated)
| Check | Merged | Unmerged design6 71fa996d | design6 code + merged data |
|---|---|---|---|
| node app/build.mjs | `slim: 3497 KB -> 3041 KB ...` exit 0 | - | - |
| node app/test/run.mjs | `ALL PASSED` | - | - |
| node app/build.mjs --v2 --preview-data | `built dist/v2.html (4485 KB; ...)`, `v2 guard: clean (...)` | guard clean | built |
| PART=main1 v2-minors | `v2-minors (main1):3 failed` (713 s) | `v2-minors (main1):all passed` | `v2-minors (main1):3 failed` |
| PART=main2 v2-minors | `v2-minors (main2):2 failed` (431 s) | `v2-minors (main2):all passed` | `v2-minors (main2):2 failed` |
| PART=groups v2-minors | `v2-minors (groups):1 failed` (480 s) | `v2-minors (groups):all passed` | `v2-minors (groups):1 failed` |
| experiments/md-watch-test.mjs | does not exist (on either branch) | | |
| experiments/reg-switch-test.mjs | `ALL PASSED` | | |
| commander-test.mjs | `commander-test: all passed` | | |
| score-src-test.mjs | `score-src-test: all passed` | | |

The 6 FAILs (same text in merged and in design6-code + merged-data):
1. main1: Player review 3e: a threat also on your team says "Mirror" ... (`; 0 wrong of 7`) - looks like no Mirror row exists in the new data (test may need a team that has one).
2. main1: Player review 3d: Stand-Outs rows are even at every width (`2+1+2+2` at 320-1024) - 7 Stand-Outs with the new data.
3. main1: Stampede tiles 4: Damage Calc band 1100-2560: damage number cut off, HP line out of band (new matchup -> longer text/number).
4. main2: My Team at 390 at most 4.3 screens (`4.46 screens, 3768px`).
5. main2: phones Stand-Outs four across ... (`rows 2+1+2+2`) - same root as 2.
6. groups: HQ Q13f hero sprites never cover tagline (`393x660: 0.18% of 31049 tagline pixels covered`, limit 0.15%) - different hero sprites in new data.
Rules 13/14: items 2, 3, 5, 6 are real look problems with today's data (odd row, cut-off number), not just test noise.

## Saturday command sequence (do not run before Sim's yes)
```
bash docs/rebuild/now.sh; df -h /tmp                                  # keep > 6 GB free
git -C /home/user/pokelair-data fetch origin main claude/design6
S=<scratchpad>; git -C /home/user/pokelair-data worktree add --detach $S/sw origin/claude/design6
ln -s /home/user/pokelair-data/node_modules $S/sw/node_modules; cd $S/sw
git merge --no-ff --no-commit origin/main
# data: main wins
F=$(git diff --name-only --diff-filter=U | grep -E '^(out|data)/'); git checkout --theirs -- $F && git add $F
# md-watch: main wins if design6 still has the 6db70843 copy (check: git diff --stat 6db70843 HEAD -- md-watch.mjs .github/workflows/md-watch.yml is empty)
git checkout --theirs -- md-watch.mjs .github/workflows/md-watch.yml && git add md-watch.mjs .github/workflows/md-watch.yml
# 08-render-all.js / 18-archetypes.js: by hand as above (or git apply the saved patch on a clean tree if they still match); then usage.js V2.usAs
git diff --name-only --diff-filter=U        # must print nothing
grep -rn '^<<<<<<<\|^>>>>>>>' app/src *.mjs .github   # must print nothing
git commit   # message ends: blank line + Claude-Session line
export PLAYWRIGHT_BROWSERS_PATH=<scratchpad>/pw1148      # REQUIRED for --v2 (without it the build dies: chromium not found)
node app/build.mjs && node app/test/run.mjs                           # expect ALL PASSED
node app/build.mjs --v2 --preview-data                                # expect "v2 guard: clean"
for P in main1 main2 groups; do PART=$P PAGE=app/dist/v2.html node app/test/v2-minors.mjs; done   # ~27 min total; expect all passed
node experiments/reg-switch-test.mjs
PAGE=app/dist/v2.html node experiments/commander-test.mjs; PAGE=app/dist/v2.html node experiments/score-src-test.mjs
# then (Sim's yes): push the merge to claude/design6, let GitHub's tests pass, then main (Sim's go)
git worktree remove --force $S/sw
```

## Risks
- **Biggest: the 6 data-caused v2-minors FAILs.** CI on design6 is green only because design6 carries old data. Fix before
  Saturday: merge main into design6 now (or a test branch) so its CI runs on current data, then fix the 4 look issues
  and the 2 brittle tests. Each new day of data can add new ones - re-run the merge on Friday.
- A daily data commit can land on main between our merge and the push to main (the 9:07 UTC job; FAST_DATA=1 would
  make it every 4 hours). Plan the switch away from the run, or re-merge right before pushing. Not checked: whether FAST_DATA is on.
- experiments/reg-switch-test.mjs is not in any workflow (checked: grep of .github/workflows); it only runs by hand.
- design6 keeps moving; the conflict list will grow by the out/* files each data day touches (data side is mechanical).
- PLAYWRIGHT_BROWSERS_PATH must be set for the v2 build (checked: first try failed without it).
- v2-minors takes ~27 min for the three parts here; budget for it.
- I'm unsure the v2 trend badge fix (usage.js) is covered by a test.
