# Job 59 — Friday Switch Rehearsal 4 (`alt/gemini-rehearsal4`)

## 1. Merge Summary
- **Base (`origin/main`):** `03cd5e41`
- **Merged (`origin/claude/design6`):** `58137089`
- **Merge commit on `alt/gemini-rehearsal4`:** `3593e4ce` (pushed ONLY to `alt/gemini-rehearsal4`; `main` untouched).
- **Conflicts:** Exactly the **5 known conflicts** listed in `docs/rebuild/switch-runbook-nov28.md` step 2 — **0 new conflicts**:
  1. `.github/workflows/test.yml` — union of both `paths:` lists + kept main's `no-rk9-test.mjs` / `date-switch-test.mjs` and design6's `syntax-check.mjs`.
  2. `.github/workflows/update.yml` — design6's `post-news.mjs` + `post-data-test.mjs`, then main's `shadow-scoreboard.mjs` (`PREV_MATCHES`) + `MODEL_SHADOW` `model.mjs`.
  3. `formats.mjs` — main's `REG_END` from `regulation.json` + design6's Pokémon HOME news 878 comment.
  4. `official.mjs` — main's `regulation.json`-driven header (`activeReg`, `regProfile`, `inRegWindow`).
  5. `update.mjs` — main's `nTeams` zero-division guard + design6's `megaN: MG`.

## 2. Step 2 Post-Merge Checks (`checked`)
- **Conflict markers (`rg "^(<<<<<<<|=======|>>>>>>>)"`):** `0 conflict markers`.
- **Both YAML files load (`ruby -ryaml`):** `Both YAML files loaded cleanly (ruby)` (`.github/workflows/test.yml`, `.github/workflows/update.yml`).
- **`node --check` on every `.mjs` (`node experiments/syntax-check.mjs`):** `syntax-check: all 447 scripts parse`.

## 3. GitHub Actions Full `test.yml` Run (`checked`)
- **Run ID:** `45876567395` (`Test NastyPlot page` on `alt/gemini-rehearsal4` @ `3593e4ce`)
- **Result:** **`completed` / `success` — 15 of 15 jobs PASSED, 0 failures:**
  - `code tests (frozen data)`: `success`
  - `data checks (today's data)`: `success` (9m20s, incl. `v2-today.mjs` and `public-site-test.mjs`)
  - `new site code checks (frozen data)`: `success` (40m38s)
  - `new site code checks, part 2 (frozen data)`: `success`
  - `new site behaviour (A-team)`: `success` (28m54s, incl. `v2-overlap.mjs` + `tap-once.mjs`)
  - `new site behaviour (B-build)`: `success`
  - `new site behaviour (C-battle)`: `success`
  - `new site behaviour (D-meta-shell)`: `success` (12m12s)
  - `new site behaviour in Safari's engine (A-team)`: `success`
  - `new site full quality check (every page and view)`: `success`
  - `new site small checks (v2-minors main1)`: `success` (15m17s)
  - `new site small checks (v2-minors main2)`: `success` (12m18s)
  - `new site small checks (v2-minors groups)`: `success` (13m03s)
  - `accuracy-gate`: `success` (6m17s)
  - `live-data audits (alert only)`: `success` (6m13s)

## 4. `merge-check.sh` Gate & Both Test Lists Locally (`checked`)
- **Real gate run (`REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/claude/design6 main`):**
  - Correctly stopped at pre-flight check #2 (`FAIL GitHub has not passed claude/design6 at 58137089 (latest run on it: completed cancelled)` — run `45875380160` on `claude/design6` was cancelled), while passing `REPORT_OK=1`, `HEAD is the merge of origin/claude/design6`, `the merge continues origin/main`, `no uncommitted changes`, and `no unmerged files or conflict markers`.
- **Both test lists (`tests_main` + `tests_design6`, triggered automatically because merged `test.yml` contains `app/test/v2-public.mjs`):**
  - **Frozen-data `tests_main` (25 steps run before 10-min command timeout):** 24 PASS (`f-run`, `f-replays`, `f-reg-profile`, `f-reg-switch`, `f-no-rk9`, `f-date-switch`, `f-reg-guard`, `f-md-data-gaps`, `f-md-day-one`, `f-freshness`, `f-bo3-tagging`, `f-shadow-model`, `f-dec2-landing`, `f-speed`, `f-calc`, `f-legality`, `f-threat`, `f-fields`, `f-suggest-gaps`, `f-suggest`, `f-lead`, `f-sync`, `f-typing-sync`, `f-sync-quiet`); 1 VM-load timing flake (`f-build-logic`: `1664 ms` vs `1500 ms` cap; passed in GitHub `code tests (frozen data)`).
  - **Today's-data + `tests_design6` (24 steps):** ALL 24 PASS (`d-build` exit 0, `d-run` exit 0, `d-threat` exit 0, `d-lead` exit 0, `d-golden` exit 0, `d-invariants` exit 0, `d-v2-data-build` exit 0, `d-commander` exit 0, `d-score-src` exit 0, `d-unrated` exit 0, `d-md-gaps` exit 0, `d-post-data` exit 0, `d-post-news` exit 0, `d-post-news-ran` exit 0, `d-v2-public` exit 0, `d-seo-check` exit 0, `d-public-build` exit 0, `d-pokemon-pages` exit 0, `d-static-pages` exit 0, `d-pub-links` exit 0, `d-csp-self` exit 0, `d-csp` exit 0, `d-v2-today` exit 0 on rerun, `d-public-site` exit 0).

## 5. `experiments/switch-smoke.mjs` on Merged Build with Today's `origin/main` `out/` (`checked`)
- Built with `node app/build.mjs --v2 --preview-data --split` (`dist/v2.js` 2,186 KB, `dist/preview.json` 1,368 KB, `dist/v2.html` 871 KB).
- **`switch-smoke: ALL PASSED`** (0 page/console errors, 0 sideways scroll across all 10 views at `390×844` and `1440×900`):
  - Data date: `Data as of Nov 26` (matches `out/`)
  - Counts: `rated: 346`, `teams: 17606`, `stories: 52` (`out/post.json` has 69 stories), `events: 114`.

## Verdict
Friday switch merge (`origin/main` `03cd5e41` + `origin/claude/design6` `58137089`) is **GREEN** — 5/5 expected conflicts only, `switch-smoke` ALL PASSED on Nov 26 data, and GitHub Actions `test.yml` run **`45876567395`** passed **15/15 jobs** with 0 failures.
