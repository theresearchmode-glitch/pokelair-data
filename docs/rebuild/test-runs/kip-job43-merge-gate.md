# Kip job 43: the merge gate for merges into main

Written Wed Nov 25, 11:58 PM (ET). Branch `alt/gemini-merge-gate` from `origin/claude/design6` `c062acf1`.

## What changed
**`docs/rebuild/merge-check.sh`**
- New optional 2nd argument: the target. `REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch> [main|claude/design6]`.
  With no 2nd argument it uses the branch you are on. Anything other than `main` / `claude/design6` (or a detached HEAD) is
  refused with exit 2 before anything runs.
- Test list chosen by the target:
  - `claude/design6` -> `tests_design6`: the same 13 `step` lines as before (checked: `diff` of the `step` lines from
    `origin/claude/design6` and the new function is empty).
  - `main` -> `tests_main`: the blocking `node` steps of **main's** `.github/workflows/test.yml` (`origin/main` `f4017535`), same
    order. Job "code tests" (28 steps) runs on the frozen `out/` of the `TEST_DATA` commit, read from the merge's own `test.yml`.
    Then `out/` goes back to HEAD and the "data checks" (build, run, threat, lead, golden) and "accuracy-gate" (build,
    accuracy-gate) jobs run on today's `out/`. "live-data audits" is not included: on GitHub it is `continue-on-error` and never
    blocks. `out/` is put back with `git restore --source=HEAD --staged --worktree -- out/` after the frozen block and again on
    exit (trap), so files that only exist in the frozen data don't stay behind.
    Checked: drift check, `node` steps parsed from `git show origin/main:.github/workflows/test.yml` (all jobs except
    live-audits) vs the gate's main `step` commands -> identical, 35 steps.
- Every existing safety check is still there, in the same order: REPORT_OK, GitHub green on the source tip, HEAD is the merge
  of the source, no uncommitted changes, no unmerged files or conflict markers, exit code per test.
- **One new check:** `origin/<target>` has to be an ancestor of the merge's first parent ("the merge continues
  origin/<target>"). Without it, a merge made on main but run as `claude/design6` would run the wrong list and still get stamped.
- The stamp `.git/merge-ok/<sha>` now holds `<sha> <target>` (before, just `<sha>`).

**`docs/rebuild/pre-push-hook.sh`**
- Still refuses a push to `main` or `claude/design6` that carries an unstamped first-parent merge.
- New: the stamp's target must match the branch being pushed. So a merge checked with design6's list can't go to main, and
  the other way round. **Stamps written by the old script (no target) are refused.** Re-run the gate for any merge that's
  waiting to be pushed, and re-install the hook (`cp docs/rebuild/pre-push-hook.sh "$(git rev-parse --git-common-dir)/hooks/pre-push"`).

**`experiments/merge-gate-test.mjs`** (new), wired into `.github/workflows/test.yml` (`paths` + a step after `post-news-test.mjs`).
It builds a scratch repo with a local bare `origin` (never GitHub). Every `node <script>` the gate names is swapped for a fake
that logs its name, its arguments and which `out/` it saw. A fake `gh` on PATH answers green or red. Takes about 15 s.

## Fail first (old scripts from design6 `c062acf1`): `merge-gate-test: 8 FAILED`
```
  FAIL  1a. merge into main (target read from the branch): exit 0, stamp "7021e8d2..."          (no target in stamp)
  FAIL  1b. main runs test.yml's main list ... #0: ran "app/build.mjs @today", expected "app/test/run.mjs @frozen"
  FAIL  1d. merge into claude/design6: exit 0, stamp "3e86cab2..."
  FAIL  2a. main: golden.mjs failing -> exit 0, no stamp        (the old list never runs golden: a main breakage gets through)
  FAIL  3f. a merge made on main but gated as claude/design6 stops it (wrong target) (exit 0, 16 tests run)
  FAIL  3g. an unknown target is refused (exit 0)
  FAIL  3h. no target and not on main/claude/design6 is refused (exit 0)
  FAIL  4c. hook refuses a merge stamped for claude/design6 pushed to main
```
The other 16 already passed on the old scripts, i.e. design6's list, the 5 safety checks, and the hook's unstamped / stamped /
other-branch behaviour all still work as before.

## Pass after: `merge-gate-test: ALL PASSED` (24/24, exit 0)
```
  PASS  1a. merge into main (target read from the branch): exit 0, stamp "639c88c4... main"
  PASS  1b. main runs test.yml's main list: frozen out/ for code tests, today's for data checks
  PASS  1c. after the main run the tree is clean again (frozen out/ put back, nothing staged or left over)
  PASS  1d. merge into claude/design6: exit 0, stamp "cf03ef0d... claude/design6"
  PASS  1e. claude/design6 runs the same list as before job 43
  PASS  1f. target given as the 2nd argument works too (exit 0)
  PASS  2a. main: golden.mjs failing -> exit 1, no stamp
  PASS  2b. ... and the tree is still clean afterwards
  PASS  2c. claude/design6: unrated-test.mjs failing -> exit 1, no stamp
  PASS  3a-3e. REPORT_OK unset / GitHub red / HEAD not the merge / dirty tree / conflict marker: exit 1, 0 tests run, no stamp
  PASS  3f. a merge made on main but gated as claude/design6 stops it (wrong target) (exit 1, 0 tests run, no stamp)
  PASS  3g. an unknown target is refused (exit 2)
  PASS  3h. no target and not on main/claude/design6 is refused (exit 2)
  PASS  4a. hook refuses an unstamped merge pushed to main
  PASS  4b. hook refuses an unstamped merge pushed to claude/design6
  PASS  4c. hook refuses a merge stamped for claude/design6 pushed to main
  PASS  4d. hook lets the stamped merge into claude/design6 through (exit 0)
  PASS  4e. hook lets the stamped merge into main through (exit 0)
  PASS  4f. hook ignores branches other than main / claude/design6 (exit 0)
```
Also: `bash -n` on both scripts OK; `node experiments/syntax-check.mjs` -> `all 412 scripts parse`.

## For HH
- After Sat Nov 28, main *is* design6's code, and main's `test.yml` becomes design6's. At that point `main)` in the `case` line
  should call `tests_design6` (one-word change; the header comment says so). Until then the main list follows main's file.
- On a real merge into main the list is long (`calc-check 2000`, `accuracy-gate` trains two models), so expect it to take
  minutes, like the GitHub jobs it copies.

## Not checked
- A real gate run on a real merge in the pokelair-data clone (fake test scripts only; the real test scripts were not run through
  the new gate). The list itself was checked against main's `test.yml` (drift check above).
- Whether CI's runner allows `git init -b` (needs git 2.28+; ubuntu-latest ships newer). This runs when the branch is pushed.
