# Kip job 48: Saturday merge into `main` runs both test lists

Written Thu Nov 26, 7:46 AM (ET). Branch `alt/gemini-merge-both` from `origin/claude/design6` `9bab576f`.

## What changed
1. **`docs/rebuild/merge-check.sh`:**
   - Under `case "$TARGET" in main)`, after `tests_main` finishes (and has restored today's `out/` via `put_out_back`), if `.github/workflows/test.yml` contains `app/test/v2-public.mjs`, it also runs `tests_design6`.
   - Before Saturday (plain `main` whose `test.yml` has no `app/test/v2-public.mjs`), target `main` runs `tests_main` only — unchanged.
   - On Saturday's switch merge into `main` (and after), target `main` automatically runs both `tests_main` and `tests_design6` with no manual edit in between; any failure in either list blocks the `main` stamp.
   - Every existing safety check and `pre-push-hook.sh` behaviour is untouched.
2. **`experiments/merge-gate-test.mjs`:**
   - Added section `5` (`5a`–`5e`): creates a scratch branch `alt/sat-switch` adding `run: node app/test/v2-public.mjs` to `.github/workflows/test.yml`, merges it into `main`, and verifies:
     - `5a`: exit 0 and stamp `<HEAD> main`.
     - `5b`: runs the full combined list (`MAIN_FROZEN` + `MAIN_TODAY` + `D6`, 51 invocations).
     - `5c`: working tree is clean afterwards.
     - `5d`: failing a design6-list test (`app/test/v2-public.mjs`) exits 1 and writes no stamp for `main`.
     - `5e`: failing a main-list test (`experiments/golden.mjs`) still exits 1 and writes no stamp for `main`.

## Fail first (unmodified `docs/rebuild/merge-check.sh`): `merge-gate-test: 2 FAILED`
```
  FAIL  5b. Saturday merge runs BOTH lists (main + design6) length 35 vs 51
  FAIL  5d. Saturday merge: failing design6-list test (v2-public.mjs) blocks main stamp (exit 0, stamp=3123b5ec... main)
```

## Pass after (checked: ran each, exit 0)
- `bash -n docs/rebuild/merge-check.sh` -> `bash-syntax-ok`
- `node experiments/merge-gate-test.mjs` -> `merge-gate-test: ALL PASSED` (29/29)
- `node experiments/syntax-check.mjs` -> `syntax-check: all 418 scripts parse`

## Not checked
- Full GitHub Actions workflow run (runs on push).
- Real Saturday merge running the real test scripts (tested on fake scripts in a scratch repo with a local bare `origin`).
