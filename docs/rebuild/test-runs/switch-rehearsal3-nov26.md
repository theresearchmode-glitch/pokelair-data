# Saturday switch, rehearsal 3 (HH's Job R, with Kip 48's merge-check), Thu Nov 26, 09:00-10:18 AM Eastern (`date`)
Scratch branch alt/switch-rehearsal3. Never main. No stamp was left behind (section 3).

## 1. The merges (on origin/main 03cd5e41, in this order)
| Commit | Merge | Conflicts |
|---|---|---|
| 365564f6 | origin/claude/design6 9bab576f | the **5 known ones**, nothing new |
| b8ffd926 | origin/alt/kip-batch3 b77e7771 (Kip 48 merge-check with both lists, Kip 45 prelaunch waits) | none |
| f97afa68 | origin/alt/rack-batch 9c0ce26f (K + L + P, Home rack, webkit-batch report) | none |

The 5 conflicts were resolved as switch-runbook-nov28.md step 2 says (the runbook is on origin/alt/t3-pending, 4353800c):
- **test.yml:** union of both `paths:` lists (88 entries) and every run step from both. The second region keeps main's no-rk9 + date-switch and design6's syntax-check.
  - Compared with rehearsal 2 (1039d5ea): nothing of its 187 run steps or 86 paths is missing.
  - Extra here: main's newer `quiet-launch-alarms-test.mjs` step and two newer paths (`experiments/quiet-launch-alarms-test.mjs`, `md-watch.mjs`).
- **update.yml:** design6's post-news.mjs + post-data-test.mjs, then main's shadow-scoreboard (PREV_MATCHES) and the MODEL_SHADOW model.mjs line. Byte-identical to rehearsal 2.
- **formats.mjs:** main's REG_END from regulation.json, plus the HOME news 878 note. Byte-identical to rehearsal 2.
- **official.mjs:** main's regulation.json-driven header (not design6's hard-coded `REG = 'M-C'`). Byte-identical to rehearsal 2.
- **update.mjs:** main's `nTeams` guard and design6's `megaN: MG`.
  - The only difference from rehearsal 2 is main's newer `apiOk: true` (outside the conflict).

Checks after the merges:
- Conflict markers: `git grep -l -E '^(<<<<<<< |>>>>>>> )'` → 0 files.
- `node --check` on every tracked .mjs: 437 files, 0 failed.
- Both YAML files load (python yaml): test.yml 10 jobs, update.yml 1 job.

## 2. Kip 48's merge-check (`docs/rebuild/merge-check.sh`, as merged here)
**The real script:** `REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/alt/rack-batch main`, exit 1. It stopped before the tests:
```
  PASS  helper report received and read (REPORT_OK=1, set by HH)
  FAIL  GitHub has not passed alt/rack-batch at 9c0ce26f (latest run on it: in_progress)
  PASS  HEAD is the merge of origin/alt/rack-batch
  PASS  the merge continues origin/main
  PASS  no uncommitted changes in tracked files
  PASS  no unmerged files or conflict markers
merge-check: STOPPED before the tests (1 problem(s)). Nothing may be pushed.
```
- That is the gate working: GitHub's run on rack-batch 9c0ce26f (45834210518) ended "cancelled" after its A-team jobs had failed (section 4).

**A copy with only the GitHub-tip check skipped** (scratch merge-check-nogh.sh, not committed; it also never writes a stamp) ran the tests, so the lists could be timed.
- Its line "PASS GitHub passed …" is forced by the copy; read it as SKIPPED.

| Run | HEAD | Lists run | Steps | Result | Time (UTC) |
|---|---|---|---|---|---|
| 1 | f97afa68 (the real merge) | **tests_main (35) + tests_design6 (13)**, switched on automatically: "design6 tests (.github/workflows/test.yml includes app/test/v2-public.mjs)" | **48** | **48 PASS, 0 FAIL**, exit 0 | 14:35:11 → 14:58:10 (23 min) |
| 2 | c216c5af (throwaway: same merge amended, same parents b8ffd926 + 9c0ce26f, with the one test.yml line naming app/test/v2-public.mjs removed; grep count 0) | **tests_main only** (no "design6 tests" header) | **35** | 35 PASS, exit 0 | 14:58:41 → 15:16:37 (18 min) |

- The two runs differ only in that test.yml line. So **the auto-switch is what adds the 13 redesign steps**: the line present gives 48 steps, removed gives 35.
- A first try of run 2 stopped at "HEAD is not a merge of origin/alt/rack-batch". origin/alt/rack-batch had moved to a6443155 while I worked, from HH's fetch. Run 2 then used the commit 9c0ce26f as the source.

Run 1's step lines, every one exit 0:
- **main, frozen out/ 0c992f69 (28):** f-run, f-replays, f-reg-profile, f-reg-switch, f-no-rk9, f-date-switch, f-reg-guard, f-md-data-gaps, f-md-day-one, f-freshness, f-bo3-tagging, f-shadow-model, f-dec2-landing, f-speed, f-calc ("exact or explained: 99.97%"), f-legality, f-threat, f-fields, f-suggest-gaps, f-suggest, f-build-logic, f-lead, f-sync, f-typing-sync, f-sync-quiet, f-golden ("10 of 10"), f-same-grade, f-plan-cache.
- **main, today's out/ (7):** d-build, d-run, d-threat, d-lead, d-golden, a-build, a-accuracy ("GATE PASSED").
- **design6 (13):** build, run, invariants, v2-data-build, commander, score-src, unrated, a11y, v2-public, public-build, csp-self, csp, saved.

## 3. Clean-up checked
- After both runs: HEAD f97afa68 on alt/switch-rehearsal3, no tracked changes, the throwaway branch deleted.
- Stamps in `.git/merge-ok` for f97afa68, ec884b9c or c216c5af: 0. The real script stopped before stamping, and the copy never stamps.

## 4. GitHub's test.yml on alt/switch-rehearsal3 (f97afa68): run **45836192092**, **failure**
https://github.com/theresearchmode-glitch/pokelair-data/actions/runs/45836192092

Passed:
- code tests (frozen data)
- data checks
- accuracy-gate
- live-data audits
- v2-minors main1, main2 and groups
- behaviour B-build, C-battle and D-meta-shell
- full quality check
- new site code checks (frozen data)

**Failed (all from the Home rack, rack-batch 9c0ce26f; design6 9bab576f's own run passed, 45811456388):**
1. **behaviour A-team, Chromium and WebKit:** "FAIL HOME-09 Champion's six: load needs a second tap, loads with Undo; Copy for Showdown copies -> no champion line with record, date, players".
   - It already fails on alt/home-rack's own run (45826391485, WebKit job) and on rack-batch's (45834210518).
2. **new site code checks, part 2:**
   - `v2-q72.mjs`: "28 failed". Home at 700-1099: "Events and How We Calculate titles share one left edge (- / -)" and "the row spans the full width (first link 0-96px from the left edge, last 19-322px from the right)".
   - `v2-q23.mjs`: "1 failed". "the three plain lines are there … (2 missing, e.g. day 768 post …)".
   - `tokens-doc.mjs`: "design-system.md is out of date with tokens.css; run node app/test/tokens-doc.mjs --write". The new `--d-calctight` token.

Why the local gate passed and GitHub didn't:
- merge-check's design6 list does not include the behaviour suites, v2-q72, v2-q23 or tokens-doc. That is by design: it runs the redesign's core list, not all of test.yml.
- So on Saturday merge-check is necessary but not enough. GitHub's full test.yml on the merge (step 4 of the runbook) is still the real gate.

## 5. What this means for Saturday
1. The merge recipe (5 conflicts) is the same as rehearsal 2 and works on today's tips.
2. Kip 48's script picks both lists by itself (48 steps with the v2-public line, 35 without).
3. **The Home rack (rack-batch) is not ready to ride along as of 9c0ce26f:** HOME-09, v2-q72 (28), v2-q23 (1) and tokens-doc fail on GitHub. HH has since pushed rack-batch a6443155 (not tested here).

Disk: 11 GB free at the end. My worktree is removed after this report is pushed.
