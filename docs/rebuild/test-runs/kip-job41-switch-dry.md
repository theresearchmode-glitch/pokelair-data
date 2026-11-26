# Saturday Switch Dress Rehearsal (Job 41)

Rehearsed on branch `alt/gemini-switch-dry` (`origin/main` `156129e0` merged with `origin/claude/design6` `250e56e2`, merge commit `36ccc632`). Every claim below is **checked (how)** or **not checked**.

---

## 1. Exact Merge Conflicts & Resolutions (5 files; 0 `out/` or `data/` conflicts)

Command: `git switch -c alt/gemini-switch-dry origin/main && git merge --no-ff --no-commit origin/claude/design6`

| # | File | Conflict | Exact Resolution |
|---|---|---|---|
| 1 | `.github/workflows/test.yml` (2 hunks) | (a) `paths:` array diverged (`main` added `regulation.json`, `no-rk9-test.mjs`, `date-switch-test.mjs`, `freshness-test.mjs`, `bo3-tagging-test.mjs`, `shadow-model-test.mjs`, `dec2-landing-fixes-test.mjs`; `design6` added `post-*`, `worker/**`, `public-site*`, `syntax-check.mjs`, etc.). (b) Lines 142–147: `main` had `no-rk9-test.mjs` + `date-switch-test.mjs`; `design6` had `syntax-check.mjs`. | (a) Union of both `paths` lists (deduplicated). (b) Kept all three steps: `no-rk9-test.mjs`, `date-switch-test.mjs`, `syntax-check.mjs`. |
| 2 | `.github/workflows/update.yml` (1 hunk) | Lines 60–74: `main` had `shadow-scoreboard.mjs` (with `PREV_MATCHES`) + `MODEL_SHADOW=... node model.mjs`; `design6` had `post-news.mjs` + `post-data-test.mjs` + plain `node model.mjs`. | Kept `design6`'s `post-news.mjs` + `post-data-test.mjs`, followed immediately by `main`'s `shadow-scoreboard.mjs` + `MODEL_SHADOW=... node model.mjs`. |
| 3 | `formats.mjs` (1 hunk) | Lines 73–82: `main` computed `REG_END` dynamically from `regulation.json` (`REG_FILE.regs`); `design6` hardcoded `{'M-C': '2026-12-02T01:59:00Z'}` with the HOME news 878 comment. | Kept `main`'s dynamic `REG_END` from `regulation.json` + `design6`'s HOME news 878 comment. |
| 4 | `official.mjs` (1 hunk) | Lines 22–33: `main` reads `ACT` / `RGP` / `RG_ID` / `STAMP_REG` from `regulation.json`; `design6` hardcoded `REG = 'M-C'`, `REG_START = '2026-09-01'`. | **CRITICAL:** Kept `main`'s `regulation.json`-driven header. Taking `design6` on Saturday would break Reg M-D official-event filtering. |
| 5 | `update.mjs` (1 hunk) | Lines 183–191: `main` guarded `/ nTeams` against 0-team division on `tour.rows` / `tour.megas`; `design6` added `megaN: MG` to `results`. | Combined both: kept `main`'s `/ nTeams` and `design6`'s `megaN: MG`. |

Verified zero conflict markers: `rg -n "^(<<<<<<<|=======|>>>>>>>)" .github/workflows/test.yml .github/workflows/update.yml formats.mjs official.mjs update.mjs` -> exit `1` (0 matches).

---

## 2. Test Results on `alt/gemini-switch-dry` (`36ccc632`)

### 2a. Today's `out/` (`data-checks`, `live-audits`, `accuracy-gate`, `update.yml` offline checks)
| Step | Exit | Exact Last Line |
|---|---:|---|
| `node app/build.mjs` | 0 | `slim: 3503 KB -> 3045 KB (dead CSS 195 KB: 284 rules, 343 selectors; short prefix 173 KB; never-used old rules 0 = 0 KB)` |
| `node app/test/run.mjs` | 0 | `ALL PASSED` |
| `node experiments/threat-check.mjs` | 0 | `PASS` |
| `node experiments/lead-logic.mjs` | 0 | `ALL PASSED` |
| `node experiments/golden.mjs` | 0 | `10 of 10 known-answer cases pass` |
| `node app/test/v2-today.mjs` | 0 | `v2-today: all passed (45 s)` |
| `node experiments/public-site-test.mjs` | 0 | `public-site-test: all passed` |
| `node experiments/suggest-audit.mjs 30 5` | 0 | `SUGGESTIONS AUDIT PASSED` (note: must run after `node app/build.mjs`; `public-site-test` clears `app/dist/`) |
| `node experiments/fields-audit.mjs` (alert-only) | 1 | `items players run that the engine never reads (and not listed as deliberately not modelled): Dragonitete (0.01% of slots)` |
| `node experiments/suggest-gaps.mjs` | 0 | `ALL PASSED` |
| `node experiments/accuracy-gate.mjs` | 0 | `GATE PASSED` |
| `node experiments/post-data-test.mjs` | 0 | `ALL PASS` |
| `node scrub-names.mjs --check` | 1 | `::error::scrub-names: NP_PID_KEY is missing (add it under the repository's Settings > Secrets and variables > Actions)` |
| `node health.mjs` | 1 | `::error::News & Mystery Gifts: data from 2026-11-18, 8 days old (limit 3)` (also `::error::Regulation day counts: regstate.json file missing`) |

### 2b. Frozen `out/` (`0c992f69`, `code tests` + `v2-checks` / `v2-checks-2` core & public-site steps)
| Step | Exit | Exact Last Line |
|---|---:|---|
| `node app/build.mjs` | 0 | `slim: 3503 KB -> 3045 KB (...)` |
| `node app/test/run.mjs` | 0 | `ALL PASSED` |
| `node experiments/replays-test.mjs` | 0 | `ok   teams with an unknown Pokémon are skipped` |
| `node experiments/reg-profile-test.mjs` | 0 | `all passed` |
| `node experiments/reg-switch-test.mjs` | 0 | `ALL PASSED` |
| `node experiments/no-rk9-test.mjs` | 0 | `pass no data job or page file reads it` |
| `node experiments/date-switch-test.mjs` | 0 | `ALL PASSED` |
| `node experiments/syntax-check.mjs` | 0 | `syntax-check: all 419 scripts parse` |
| `node experiments/reg-guard-test.mjs` | 0 | `ALL PASSED` |
| `node experiments/md-day-one-test.mjs` | 0 | `ALL 22 TESTS PASSED` |
| `node experiments/backup-sources-test.mjs` | 0 | `6/6 passed (backup-sources-test)` |
| `node experiments/tour-modes-test.mjs` | 0 | `tour-modes: all passed` |
| `node experiments/post-data-test.mjs` | 0 | `ALL PASS` |
| `node experiments/post-news-test.mjs` | 0 | `ALL PASS` |
| `node experiments/freshness-test.mjs` | 0 | `ALL PASSED` |
| `node experiments/bo3-tagging-test.mjs` | 0 | `bo3-tagging-test: PASS (all 18 assertions passed)` |
| `node experiments/shadow-model-test.mjs` | 0 | `shadow-model-test: PASS (byte-identical live model, valid combo shadow + bc d=4, paired scoreboard across 2 days)` |
| `node experiments/dec2-landing-fixes-test.mjs` | 0 | `ALL PASSED` |
| `node experiments/speed-check.mjs` | 0 | `reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378` |
| `node experiments/calc-check.mjs 2000` | 0 | `exact or explained: 99.97%` |
| `node experiments/rules-fixes-test.mjs` | 0 | `14/14 passed (dist/page.html)` |
| `node experiments/mega-calc-crosscheck.mjs` | 0 | `PASS: 0 unexplained Mega calc mismatches` |
| `node experiments/legality-check.mjs` | 0 | `Mega stones per official team: {"1":110,"2":402}` |
| `node experiments/threat-check.mjs` | 0 | `PASS` |
| `node experiments/fields-audit.mjs` | 0 | `PASS: every VGC-relevant field is in the data and used by the engine` |
| `node experiments/suggest-gaps.mjs` | 0 | `ALL PASSED` |
| `node experiments/suggest-audit.mjs 30 5` | 0 | `SUGGESTIONS AUDIT PASSED` |
| `node experiments/build-logic.mjs` | 1 | `FAIL a normal build finishes in under 1.5 s unthrottled (1686 ms)` |
| `node experiments/lead-logic.mjs` | 0 | `ALL PASSED` |
| `node experiments/sync-logic.mjs` | 0 | `ALL PASSED` |
| `node experiments/typing-sync.mjs` | 0 | `PASS` |
| `node experiments/sync-quiet.mjs` | 0 | `ALL PASSED` |
| `node experiments/golden.mjs` | 0 | `10 of 10 known-answer cases pass` |
| `node experiments/same-grade.mjs` | 0 | `ALL PASSED` |
| `node experiments/plan-cache-test.mjs` | 0 | `ALL PASSED` |
| `node experiments/strength-invariants.mjs` | 0 | `PASS J11-5: {"n":30,"bad":0}` |
| `node app/test/v2-guard.mjs` | 0 | `v2 guard: clean (...)` |
| `node app/test/no-names.mjs` (+ built `v2.html`) | 0 | `no-names: 1083 player fields checked, 0 not an ID or stand-in` / `2182 player fields checked, 0 not an ID or stand-in` |
| `PAGE=app/dist/v2.html node experiments/commander-test.mjs` | 0 | `commander-test: all passed` |
| `PAGE=app/dist/v2.html node experiments/score-src-test.mjs` | 0 | `score-src-test: all passed` |
| `PAGE=app/dist/v2.html node experiments/unrated-test.mjs` | 0 | `unrated test: all passed` |
| `PAGE=app/dist/v2.html node experiments/rank-tiebreak-test.mjs` | 0 | `rank-tiebreak test: all passed` |
| `PAGE=app/dist/v2.html node app/test/v2-post-doc.mjs` | 0 | `ALL PASS` |
| `node app/test/tokens-doc.mjs` | 0 | `tokens-doc: up to date (696 tokens)` |
| `node app/test/perf-docs.mjs` | 0 | `perf-docs: behaviour fixture "meta/perf" has 7 of 7 perf.json parts; built doc has 7` |
| `node app/test/test-ids.mjs` | 0 | `test-ids: 487 tests, every ID unique inside its group` |
| `node app/test/v2-public.mjs` | 0 | `v2-public: all passed` |
| `node experiments/public-build-test.mjs` | 0 | `PASS PUB-6: {"gatedBehindPublic":true}` |
| `node experiments/pokemon-pages-test.mjs` | 0 | `pokemon-pages-test: all passed` |
| `node experiments/feedback-worker-test.mjs` | 0 | exit 0 (passed) |
| `node experiments/feedback-guard-test.mjs` | 0 | `ALL PASSED (44)` |
| `node experiments/count-worker-test.mjs` | 0 | `ALL PASSED (36)` |
| `node experiments/teamcheck-count-test.mjs` | 0 | `teamcheck-count-test: all passed` |
| `node experiments/turnstile-page-test.mjs` | 1 | `turnstile-page-test: 2 failed` (widget rendered twice, token `tok-2-0`) |
| `node experiments/pub-links-test.mjs` | 0 | `pub-links-test: all passed` |
| `node experiments/security-csp-test.mjs --self-test` + browser | 0 | `security-csp-test: PASS (4 hashed inline scripts, 0 CSP violations, 0 external requests, 0 cookies, XSS blocked)` |
| `node experiments/privacy-public-test.mjs` | 0 | `privacy-public: all passed` |
| `node app/build.mjs --v2 && node experiments/v2-words.mjs` | 0 | `v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none)` |
| `node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/a11y-code.mjs` | 0 | `PASS A11Y-6: {"exists":true,"ariaLive":null}` |
| `node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs` | 0 | `v2-saved: all passed` |

*Not run locally (will run on GitHub Actions upon pushing `alt/gemini-switch-dry`):* the long multi-job suites `behaviour-v2` (4 groups), `quality-v2` (`qcheck-all.mjs`), `v2-minors` (3 parts), the individual `v2-q*` / `v2-s*` files inside `v2-checks`/`v2-checks-2`, and `behaviour-webkit` (WebKit 26.6, `continue-on-error: true`).

---

## 3. Failure Analysis (Merge-Induced vs Pre-Existing)

1. **BLOCKER (MERGE-INDUCED) — `health.mjs:66` fails EVERY daily run after Saturday's merge (`News & Mystery Gifts: data from 2026-11-18, 8 days old (limit 3)`):**
   - **Checked:** On plain `main`, `post-news.mjs` does not exist, so `health.mjs:66` sets `noAgeCheck: !fs.existsSync('./post-news.mjs')` -> `true` (skipped). The moment `design6` merges into `main`, `post-news.mjs` exists -> `noAgeCheck` becomes `false` -> `health.mjs` checks `d => d.checked || d.updated`. Because `post-news.mjs:89` deliberately leaves `POST.checked` alone (`2026-11-18T02:21:50Z`, when a human last checked Mystery Gifts), `health.mjs` will fail EVERY daily `update.yml` run starting Saturday!
   - **Fix:** Either set `noAgeCheck: true` on `health.mjs:66` (shape-only, as `switch-runbook-nov19.md:69` noted) OR have `post-news.mjs` write `updated: new Date().toISOString()` into `out/post.json` (leaving `checked` untouched) and change `health.mjs:66` to `d => d.updated || d.checked`.
2. **HIGH (FIRST-RUN GAP) — `health.mjs:41` reports `Regulation day counts: regstate.json file missing`:**
   - **Checked:** `out/regstate.json` is not committed yet on `main` (`156129e0`). Running `update.yml` once after Saturday's merge generates it (along with `out/post.json`, `ckwin`, `megaN`, and `track.json` bands).
3. **PRE-EXISTING ON `origin/claude/design6` — `experiments/turnstile-page-test.mjs` (`2 failed`):**
   - **Checked on plain `origin/claude/design6` (`250e56e2`):** Fails identically (`exit=1`, `widget drawn with our site key...` rendered twice, token `["tok-2-0"]`). Not caused by the merge. Fix: guard the Turnstile render call in Send Feedback so a redraw does not render a second widget into the same container.
4. **PRE-EXISTING / VM CPU — `experiments/build-logic.mjs` (`1 FAILED`):**
   - **Checked on plain `origin/claude/design6` (`250e56e2`):** Fails identically on this VM (`1706 ms > 1500 ms` vs `1686 ms` on merged branch). All logic assertions pass.
5. **ALERT-ONLY LIVE DATA — `live-audit:fields-audit`:** Flags `Dragonitete (0.01% of slots)` on today's `out/` (already mapped in `names.mjs:73` `ITEM_TYPO`; clears on the next `update.mjs` run). Does not block CI or `promote.yml`.

---

## 4. Audit of `switch-runbook-nov19.md` & `switch-readiness-nov18.md` + Corrected Saturday Switch Step List

### What is now wrong, missing, or out of order in the Nov 18–19 docs
1. **Wrong art count (`switch-runbook-nov19.md:116-124,155`):** Lists **350** `v2art/` files (`359` total). `design6` now has **360** art files (checked in Scout's Nov 25 report and `switch-plan.py` fix `004e4be8`).
2. **Wrong conflict list (`switch-readiness-nov18.md:131`, `switch-runbook-nov19.md:34`):** Lists 28 conflicts (including 8 old-site files and `out/`). Today's merge has **only 5 conflicts** (`test.yml`, `update.yml`, `formats.mjs`, `official.mjs`, `update.mjs`) and **0 `out/` conflicts**. Most importantly, **`official.mjs` is NOT mentioned** in the old runbook, yet taking `design6`'s copy would revert `official.mjs` to hardcoded `REG = 'M-C'`.
3. **Missing `health.mjs:66` `post.json` blocker:** `switch-runbook-nov19.md:67-69` noted the risk as a proposal, not realizing `main`'s `health.mjs:66` actually shipped the `post.json` age check gated on `fs.existsSync('post-news.mjs')`. Must be fixed BEFORE Saturday's switch or daily `health.mjs` turns red immediately.
4. **Missing `meta/info` in refresh task (`switch-runbook-nov19.md:54,78-81`):** `03-persistence.js:7` now has **17** `META_KEYS` (added `info` from `out/info.json` on Nov 22), not 16. The refresh task prompt needs both `out/post.json` -> `meta/post` AND `out/info.json` -> `meta/info`.
5. **Missing `FAST_DATA` / `MODEL_SHADOW` check in `update.yml`:** Verify `FAST_DATA` is NOT `1` during the switch window, and verify the merged `update.yml` keeps `shadow-scoreboard.mjs` + `MODEL_SHADOW` + `post-news.mjs` + `ckwin-snapshot.mjs`.
6. **Outdated test-run status (`switch-readiness-nov18.md:14-16,74-92`):** The Nov 18 blocker items (`v2-checks` split, `v2-today`, `if: github.event_name != 'workflow_run'` on frozen-data v2 jobs, `v2-split`) are all already landed in `design6`'s `test.yml`.

### Corrected Saturday Switch Step List
1. **Pre-switch (Friday):** Fix `health.mjs:66` (`post.json` age check) and `turnstile-page-test.mjs` (double render), and land `alt/gemini-md-data` + `alt/gemini-md-page` from Job 40.
2. **Preflight (Saturday morning, via `gh api` — not the clock):** Confirm no `update.yml` run is in progress, `main`'s latest `test.yml` is green, and `FAST_DATA` is off (`!= 1`). Save live `index.html` (verify `sha256` prefix `cb649884`) and version ID in a durable location.
3. **Merge `claude/design6` -> `main`:** Resolve the 5 conflicts per Section 1 above (especially keeping `main`'s `official.mjs` and `formats.mjs` `REG_END`, plus both `post-news` and `shadow-scoreboard`/`MODEL_SHADOW` in `update.yml`). Verify `rg` finds 0 conflict markers.
4. **Gate & Push:** Run `REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/claude/design6`, push `main`, wait for GitHub Actions `Test NastyPlot page` to go green and `Promote to live` to advance `live`.
5. **First merged data run:** Trigger `Update Limitless data` (`workflow_dispatch`) on `main` so `out/regstate.json`, `out/post.json`, `ckwin`, `megaN`, and `track.json` bands `[80,70,60]` land on `main` -> tests green -> `live` advances.
6. **Publish redesign to live artifact:** Run `python3 docs/rebuild/switch-plan.py` (with current 360 art count), publish R1 -> R2 -> R3 -> R4 (omitting `capabilities` and `contract`), verify file count and zero `sp/` files.
7. **Update refresh task:** Save existing prompt first, then add `out/post.json` -> `meta/post` and `out/info.json` -> `meta/info` (and split/cleanup lists), and trigger one refresh with Sim's go.
8. **Verify on phone & desktop** (Home, My Team, Meta, News, Gifts, Track Record, saved teams) and log in `decisions.md`.

---

## 5. Proposed Fix for `experiments/reg-test.mjs` (Job 40 MEDIUM-3 — Not Applied, For HH & Sim Approval)

**Why it fails on the merged branch (`3 failed`, exit 1):**
Lines 24–28 of `experiments/reg-test.mjs` call `detectReg(..., '2026-11-09')` with 24 M-D events (1,680 players) expecting a count-based switch to `M-D` on Nov 9. Since `main`'s `regulation.json` now defines `"M-D": {"since": "2026-12-02"}`, `formats.mjs:113` (`if (nextProf && nextProf.since)`) intentionally refuses to switch before `2026-12-02`.

**Proposed minimal change to `experiments/reg-test.mjs:23-28`:**
Pass `'2026-12-02'` (or test count-based switching with a regulation that has no `since` date in `regulation.json`, e.g., `M-E` after switching to `M-D`, matching `date-switch-test.mjs` check 6):
- Line 24: change `'2026-11-09'` -> `'2026-12-02'` (with `M-D` events dated from `'2026-12-02'`), OR
- Better: keep lines 24–28 asserting the new date-based behavior on `'2026-11-09'` (`r.id === 'M-C'` — never switches early before `M-D.since`) AND add a check on `'2026-12-02'` (`r.id === 'M-D'`, `switched.by === 'date'`, `back` on `'2026-12-03'` never falls back to `M-C`).
- Existing `experiments/reg-test.mjs` was left untouched per rule "Never change an existing test to make it pass."
