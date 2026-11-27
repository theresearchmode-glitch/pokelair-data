# Job 62 — Switch-Day Preflight Script (`alt/gemini-preflight`)

Branched from `origin/claude/design6` (`58137089`). Read-only; zero page or model changes.

## Deliverables
- [`experiments/switch-preflight.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/experiments/switch-preflight.mjs): read-only runbook step 1 check printing `PASS` / `FAIL` / `CHECK BY HAND` per line, exiting `1` on any `FAIL`:
  1. No `update.yml` run active (`in_progress` / `queued` / `waiting` / `requested` / `pending`) on `main` (via `gh api`, or `CHECK BY HAND` if `gh` unavailable/unreadable — never guesses).
  2. `main`'s latest `test.yml` run is `completed/success`.
  3. `live` branch == `main` OR the `live` commit has a green `test.yml` run.
  4. Repository variable `FAST_DATA` is not `"1"` (via `gh api repos/.../actions/variables`, or `CHECK BY HAND` if unreadable).
  5. `origin/claude/design6`'s latest `test.yml` run is `completed/success`.
  6. `out/regstate.json` and `out/post.json` state per step 5 (valid JSON, `news` non-empty, valid `ran` when present, `PREFLIGHT_REQUIRE_RAN=1` enforces `ran` post-switch).
- [`docs/rebuild/switch-runbook-nov28.md`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/docs/rebuild/switch-runbook-nov28.md#L27-L29): added one line in step 1 pointing to `node experiments/switch-preflight.mjs`.

## Verification (`checked`)
- **Syntax (`node --check experiments/switch-preflight.mjs`):** exit 0.
- **Live run (`node experiments/switch-preflight.mjs`):**
  - `PASS` no `update.yml` run in progress on `main` (`#45879849803 completed/success`)
  - `PASS` `main` latest `test.yml` green (`#45884041363`, `e7e2ad16`)
  - `PASS` `live` == `main` (`e7e2ad16`)
  - `PASS` `FAST_DATA` is not `"1"` (unset)
  - `FAIL` `claude/design6` latest `test.yml` NOT green (`#45875380160: completed/cancelled`) -> exit `1`
  - `PASS` `out/regstate.json` absent (expected before step 5) & `out/post.json` valid (69 stories)
- **No-`gh` fallback (`PREFLIGHT_NO_GH=1`):** prints 5 `CHECK BY HAND` lines (never guesses) + 2 `out/` PASS lines, exit 0.
- **Fixture proofs (`PREFLIGHT_FIXTURE=/tmp/preflight-case.json`):**
  - All-green fixture -> `ALL PASSED`, exit `0`
  - `update.yml` `in_progress` -> `FAIL`, exit `1`
  - `main` `test.yml` `failure` -> `FAIL`, exit `1`
  - `live != main` and `live` commit not green -> `FAIL`, exit `1`
  - `FAST_DATA = "1"` -> `FAIL`, exit `1`
  - `claude/design6` `test.yml` `cancelled` -> `FAIL`, exit `1`
  - Corrupt `out/regstate.json` -> `FAIL`, exit `1`
  - `out/post.json` missing `ran` with `PREFLIGHT_REQUIRE_RAN=1` -> `FAIL`, exit `1`
