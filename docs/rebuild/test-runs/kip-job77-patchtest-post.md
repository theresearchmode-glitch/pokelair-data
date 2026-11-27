# Job 77 — Post-Patch Mode for `experiments/apply-dec2-patch-test.mjs`

- **Branch:** `alt/gemini-patchtest-post` (branched from `origin/alt/dec2-runbook` `3e4fc7ec`)
- **Problem:** In Job 74's Dec 2 dry run, `experiments/apply-dec2-patch-test.mjs` failed `12 FAILED (18 passed)` once `apply-dec2-patch.mjs --write` landed, because it copied the repo's own files and assumed they were unpatched.

## Fix (`experiments/apply-dec2-patch-test.mjs`)

- Probes the target tree (`--root <dir>`, default repo root) by running `experiments/apply-dec2-patch.mjs` in dry-run mode (using the script's own done-predicates):
  1. **Pre-patch mode** (`DRY RUN, 6 file(s) would change` and zero `: already done` lines): runs the existing 30 checks directly against `ROOT` (`ALL 30 PASSED`).
  2. **Post-patch mode** (`nothing to change` and zero `->` edits): records check `0` PASS confirming the current repo files are fully patched, loads the 6 pre-patch target files from git commit `978d8213` via `git show` (with shallow-clone `git fetch --depth=1 origin 978d8213` / `HEAD~1` fallback), and runs all 30 existing checks on those pre-patch copies (`ALL 31 PASSED`).
  3. **Half-patched / unexpected state** (e.g., 1–5 files patched or any edit undone): fails immediately (`exit 1`) with the exact pending edit(s).

## Verification (`checked`)

| Case | Command | Exit | Result |
|---|---|---:|---|
| Before fix (patched scratch tree, Job 74) | `node experiments/apply-dec2-patch-test.mjs` | **1** | `apply-dec2-patch-test: 12 FAILED (18 passed)` |
| Clean pre-patch repo (`alt/gemini-patchtest-post`) | `node experiments/apply-dec2-patch-test.mjs` | **0** | `apply-dec2-patch-test: ALL 30 PASSED` |
| Fully patched scratch tree (`apply-dec2-patch --write --force`) | `node experiments/apply-dec2-patch-test.mjs --root /tmp/j77-patched` | **0** | `PASS 0. post-patch mode: current repo files are fully patched` -> `apply-dec2-patch-test: ALL 31 PASSED` |
| Half-patched scratch tree (reverted `app/test/run.mjs` `76 -> 72`) | `node experiments/apply-dec2-patch-test.mjs --root /tmp/j77-patched` | **1** | `FAIL 0. repo is half-patched or unexpected (... DRY RUN, 1 file(s) would change: app/test/run.mjs)` -> `apply-dec2-patch-test: 1 FAILED (0 passed)` |
