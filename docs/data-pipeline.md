# NastyPlot Data Pipeline (Developer & Operations Guide)

Plain-language guide to `.github/workflows/update.yml` (base `a2e588bc`).
Every fact below comes from the files in this repo (`update.yml`, `health.mjs`, `update.mjs`, `formats.mjs`, `regulation.json`, `reg.mjs`, `reg-guard.mjs`, `regstate.mjs`, `sources.mjs`, `md-watch.mjs`).
Anything whose script file was not in the review package is marked **not checked**.

---

## 1. When the job runs

- **Daily run:** `7 9 * * *` UTC (4:07 AM New York winter, 5:07 AM summer; GitHub may start up to ~1 hour late).
- **4-hourly mode (ready to flip):** `7 1,5,13,17,21 * * *` UTC. Only runs when GitHub repository variable `FAST_DATA` is `1`. Otherwise those runs exit immediately as skipped.
- **Manual run:** `workflow_dispatch` (sets `MAX_FETCH=400` in `update.mjs` instead of `40`).
- **Concurrency:** `group: update-data`, `cancel-in-progress: false`. Runs queue one at a time (timeout: 150 minutes).
- **Permissions:** `contents: write` (commit `data/` and `out/`) and `issues: write` (manage the single "Daily data problem" issue).

---

## 2. Every step of `update.yml` in order

| # | Step / Command | Reads | Writes | Regulation rule | If skipped / fails |
|---|---|---|---|---|---|
| 1 | `actions/checkout@v5` + `setup-node@v5` (Node 22) | Repo `main` | Workspace | None | Job stops. |
| 2 | `node scrub-names.mjs` (`NP_PID_KEY` / `THE_NP_PID_KEY`) | Saved data files (`not checked` exact file list) | Replaces player names with `P` + 10-digit IDs | All data | **Hard stop** (no `skip.mjs`). Without the key, job fails so no player name is ever saved. |
| 3 | `node reg.mjs` | Limitless VGC list (3 pages), Showdown replay search (`nextRegIds`), `out/reg.json`, `regulation.json` | `out/reg.json` | Detects active reg; switches by date (`today >= nextProf.since`) or `REG_SWITCH` backstop | Keeps yesterday's `out/reg.json`; logs to `out/skips.json` via `skip.mjs`. |
| 4 | `node replays.mjs` | Showdown replays (`not checked` internals) | `out/replays.json` | Uses active reg's Showdown format `sd` (`not checked` inside script; verified in `update.mjs` consumer) | Yesterday's file stays; logged in `out/skips.json`. |
| 5 | `REPLAY_FMT=bo3 node replays.mjs` | Showdown Bo3 open-sheet replays (`not checked`) | `out/replays_bo3.json` | Active reg Bo3 format (`not checked`) | Optional; yesterday's file stays; logged in `out/skips.json`. |
| 6 | `node practice.mjs` | Saved replays (`not checked`) | `out/practice.json` | Active reg (`not checked`) | Yesterday's file stays; logged in `out/skips.json`. |
| 7 | `node update.mjs` (`NP_PID_KEY`, `MAX_FETCH=40` or `400`) | Limitless API (`/tournaments`, `/standings`, `/pairings`), `data/index.json`, `data/t/*`, `data/t2/*`, `data/p/*`, `data/tour-modes.json`, `out/replays.json`, `out/teams.json`, `roster.json` | `data/index.json`, `data/t/*`, `data/t2/*`, `data/p/*`, `data/tour-modes.json`, `out/limitless.json`, `out/meta_tour.json`, `out/info.json`, `out/teams.json`, `out/history.json`, `out/matches.json` | Fetches `FORMAT = activeReg().id` plus post-`REG_END` events tagged with prior reg. Filters with `sameReg()`, `offFormat()`, and `oddEvents()`. Stamps outputs with `stampReg()`. | **Hard stop** (no `skip.mjs`) if base win rate not in `(0.4, 0.6)` or team count drops >20% vs yesterday on same reg. Outputs left unchanged. |
| 8 | `node official.mjs` (`NP_PID_KEY`) | Victory Road event pages, VR Pastes, Liquipedia API (`not checked` internals) | `out/official.json`, `out/official_compare.json` (and refreshes Official events in `out/teams.json`) | Active reg date window (`inRegWindow`) (`not checked` inside script) | Keeps previous `out/official.json`; logged in `out/skips.json`. (RK9 removed Nov 1 per rk9.gg/terms 5.3; old table frozen in `out/official_perf.json`.) |
| 9 | `node events.mjs` | Saved tournament sheets (`not checked`) | `out/events.json` | Active reg (`not checked`) | Yesterday's file stays; logged in `out/skips.json`. |
| 10 | `node weekly.mjs` | On-disk team sheets, no network (`not checked`) | `out/weekly.json` | Active reg (`not checked`) | Yesterday's file stays; logged in `out/skips.json`. |
| 11 | `node calendar.mjs` | Victory Road season calendar (`not checked`) | `out/calendar.json` | Season-wide (exempt from `reg-guard.mjs`) | Yesterday's file stays; logged in `out/skips.json`. |
| 12 | `node model.mjs` | `out/matches.json` (`not checked` full list) | `out/model.json` | Active reg (`not checked`) | Yesterday's file stays; logged in `out/skips.json`. |
| 13 | `node six.mjs` | `out/matches.json`, `out/model.json` (`not checked`) | Adds per-six records to `out/model.json` | Active reg (`not checked`) | Yesterday's `sixes` stays; logged in `out/skips.json`. |
| 14 | `node ctr.mjs` | `out/matches.json`, `out/model.json` (`not checked`) | Adds learned matchups to `out/model.json` | Active reg (`not checked`) | Yesterday's matchups stay; logged in `out/skips.json`. |
| 15 | `node model-guard.mjs` | Today's vs committed `out/model.json` (`not checked`) | Keeps yesterday's `out/model.json` if today's fails accuracy/rank guard | Active reg (`not checked`) | Logged in `out/skips.json` when guard rejects new model. |
| 16 | `node leads.mjs` | Ladder replays (`not checked`) | Adds lead values to `out/model.json` (`not checked`) | Active reg (`not checked`) | Logged in `out/skips.json`. |
| 17 | `node ladder.mjs` | Smogon monthly ladder stats (`not checked`) | `out/meta_ladder.json` | Active reg (`not checked`) | Yesterday's file stays; logged in `out/skips.json`. |
| 18 | `node sources.mjs` | Showdowntier (`/formats/<id>/index.html`), Pikalytics (`/ai/pokedex/<id>` + top 40 pages), `regulation.json` | `out/sources.json` (also calls `skip.mjs` for any failing source) | Reads `regSources(RG.id)`. Null ID -> "not available yet". Runs `sourcePageCheck()` to reject pages from another regulation. | Missing source left out; problem recorded in `out/sources.json` and `out/skips.json`. |
| 19 | Playwright + Chromium install (`op.gg` **PAUSED Nov 18**) | npm + Chromium | Local runner only (`meta_ingame.json` untouched) | op.gg paused due to op.gg Terms of Use; browser still installed for snapshot steps | Logged in `out/skips.json`; snapshot steps below may skip if browser missing. |
| 20 | `node reg-guard.mjs` (pre-`perf`) | `out/*.json`, `out/reg.json`, `regulation.json` | Archives mismatched files to `out/archive/<reg>/`; writes `emptyFor()` shapes | Active reg (`activeReg().id`) | Runs before `perf.mjs` so `perf.mjs` never copies the old regulation's numbers. Never fails the job. |
| 21 | `node perf.mjs` | `out/limitless.json`, `out/sources.json`, `out/meta_ladder.json`, `out/meta_ingame.json`, `out/official_perf.json`, `out/reg.json` (`not checked` internals) | `out/perf.json` | Active reg (copies `reg` object from `out/reg.json`) | Yesterday's file stays; logged in `out/skips.json`. |
| 22 | `node regstate.mjs` | `out/reg.json`, `out/matches.json`, `regulation.json` | `out/regstate.json` (`{reg, day, events, players, games, since, updated}`) | Counts events/players/games only if `matches.reg === RG.id` | Yesterday's file stays; logged in `out/skips.json`. |
| 23 | `node crosscheck.mjs` | Our `out/` files + `out/sources.json` + `out/official.json` (`not checked`) | `out/crosscheck.json` | Active reg (`not checked`) | Yesterday's file stays; logged in `out/skips.json`. |
| 24 | `node ratings-snapshot.mjs` | Built page + `out/perf.json` via Chromium (`not checked`) | `out/ratings_log.json` (`byReg[REG]`) | Keeps all regulations in one file (`byReg`) | Yesterday's snapshots stay; logged in `out/skips.json`. |
| 25 | `node scoreboard.mjs` | `out/ratings_log.json`, events (`not checked`) | `out/scoreboard.json` | Exempt from `reg-guard.mjs` (keeps history) | Yesterday's file stays; logged in `out/skips.json`. |
| 26 | `node track.mjs` | `out/ratings_log.json`, subsequent events (`not checked`) | `out/track.json` | Active reg (`not checked`) | Yesterday's file stays; logged in `out/skips.json`. |
| 27 | `node scrub-names.mjs && node scrub-names.mjs --check` | All data & `out/` files (`not checked`) | Strips any straggler names; exits 1 if any remain | All data | **Hard stop** before commit so no player name is ever pushed. |
| 28 | `node reg-guard.mjs` (post-build) | `out/*.json`, `out/reg.json` | Archives mismatched files; writes `emptyFor()` shapes | Active reg | Runs before `split-docs.mjs` so split docs never carry old-reg data. Never fails the job. |
| 29 | `node split-docs.mjs` | `out/*.json` (`not checked` internals) | `out/split/*.json` + `out/split/index.json` (splits docs >200 KB into 2 parts for 262,144 B page storage limit) | Reads guarded `out/` | Logged in `out/skips.json`; `health.mjs` alarms if missing or any part >240 KB. |
| 30 | `Commit` | All staged `data/` and `out/` changes | Commits as `pokelair-bot` (`Limitless data YYYY-MM-DD`); rebases + retries push 3× | — | Fails job if push fails after 3 retries. |
| 31 | `node health.mjs` (`if: always()`) | All `out/*.json`, `out/split/index.json`, `out/skips.json`, `data/index.json` | `$GITHUB_STEP_SUMMARY` + `$HEALTH_REPORT` | Checks `stampOf(d) === REG`; allows `thin` shapes on days 1–14 of a new regulation | Exits 1 on missing/broken/stale/2-day-repeated-skip/oversized split doc (good data is already committed). |
| 32 | `Daily data problem issue` (`if: always()`) | `$HEALTH_REPORT`, `job.status`, `steps.health.outcome` | Opens, updates, or closes single GitHub issue titled `"Daily data problem"` | — | Only comments when the problem list changes; auto-closes on first healthy run. |

---

## 3. Regulation rules & the date switch

- **Single source of truth:** `regulation.json` holds `"site"` (`"M-C"`) and each regulation's entry (`name`, `sd`, `since`, `end`, `sources`, `items`, `rules`).
- **Off-format filtering (`formats.mjs`):**
  - `OFF_FORMAT` regex skips themed/restricted cups by name (Spooky, Monotype, Monoregion, UU, Gen 1–8, Draft, Little Cup, etc.). Raw files stay in `data/`.
  - `oddEvents()` automatically excludes events with 20+ teams missing a 20%+ staple (expected on 8+ teams) or 8+ teams whose top-10 staple count is under half normal.
- **Official end dates (`REG_END` / `regAt`):** Limitless sometimes tags events after a regulation ends with the old tag. Any event dated at or after `REG_END[id]` (`2026-12-02T01:59:00Z` for M-C) is reclassified to `nextRegIds(id)[0]` (`M-D`). `update.mjs` also checks the previous format's recent pages for such mis-tagged events.
- **Date-based switch (`detectReg` in `formats.mjs`):**
  - When `nextProf = regProfile(nextRegIds(id)[0])` has a `since` date (e.g., `2026-12-02` for M-D), `reg.mjs` switches on launch day (`today UTC >= nextProf.since`), even if Limitless/Showdown are unreachable that morning (`dateDue`).
  - `REG_SWITCH` (`{events: 20, players: 1200}`) stays as a backstop only when the next regulation has no `since` date in `regulation.json`.
  - Setting env `REG_AUTO_SWITCH=0` holds the switch (shows a banner only) for manual review.
- **Outside-source guard (`sources.mjs` + `formats.mjs`):** Null source IDs in `regulation.json` log `"not available yet"` instead of reading old-regulation pages. `sourcePageCheck()` verifies Showdowntier names `Regulation <id>` and Pikalytics' sample events are at least half `<id>`.

---

## 4. The regulation guard (`reg-guard.mjs`)

- Runs **twice** in `update.yml`: once before `perf.mjs` (so `perf.json` cannot copy stale-regulation inputs) and once before `split-docs.mjs` (so `out/split/` never ships mixed regulations).
- **Never touches `data/`** (all raw tournament standings/pairings stay intact).
- **Exempt files** (never emptied): `reg.json`, `calendar.json`, `skips.json`, `official_perf.json`, `ratings_log.json` (per-reg `byReg`), `scoreboard.json` (multi-reg history).
- **Archive first:** Before emptying a mismatched file, `reg-guard.mjs` copies it once to `out/archive/<old-reg>/<file>` so no old regulation data is ever lost.
- **Empty shapes:** Replaces each mismatched (or unstamped post-switch) file with `emptyFor(file, reg, sd)` so the page and `health.mjs` (`thin` mode, days 1–14) handle day one cleanly.
- **Never fails the daily job:** Errors log a `::warning::` and exit 0.

---

## 5. Backups & watchers (Job 17)

- **`md-watch.mjs`** (run daily by `.github/workflows/md-watch.yml`, read-only):
  - Checks 3 places for the next regulation (`M-D`): Showdown `config/formats.ts`, Limitless VGC page 1 (with one 10 s retry), and two official news JSON feeds (`champions-news.pokemon-home.com` and `news.pokemon-home.com`). Opens one issue per sighting (`"Reg M-D spotted: <where>"`).
  - **Limitless pause alarm:** Opens `"Limitless data paused since <date>"` if Limitless fails both tries or `data/index.json`'s newest tournament is 2+ days old; closes automatically when data resumes.
- **Job 17 backup scripts** (alternative data backup fetchers / restore plan): **not checked** (Job 17's backup script files and `docs/rebuild/gameplan-detail-nov25.md` were not included in this `a2e588bc` package).

---

## 6. How to run each test & dry run

All commands run from the repo root with Node 22:

```bash
# Data health check (dry run against any folder/date)
node health.mjs --root=. --now=2026-11-24

# Freshness alarm tests (fake ages, thin days, paused/frozen sources)
node experiments/freshness-test.mjs

# Regulation detection & guard tests (not checked if reg-test.mjs exists on this branch)
REG_OFFLINE=1 node reg.mjs
node reg-guard.mjs

# M-D watcher dry run (no GitHub issues opened)
WATCH_DRY=1 WATCH_FAKE_FOUND=showdown,limitless,news WATCH_FAKE_LIMITLESS=stale node md-watch.mjs

# Core code & data test suite (see .github/workflows/test.yml for full CI matrix)
node app/test/run.mjs
node experiments/replays-test.mjs
node experiments/tour-modes-test.mjs
node experiments/post-data-test.mjs
node experiments/post-news-test.mjs
node experiments/speed-check.mjs
node experiments/calc-check.mjs 2000
node experiments/rules-fixes-test.mjs
node experiments/mega-calc-crosscheck.mjs
node experiments/legality-check.mjs
node experiments/threat-check.mjs
node experiments/fields-audit.mjs
node experiments/accuracy-gate.mjs
```
