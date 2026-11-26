# Dec 1–2 Reg M-D Switch-Over & Balance Patch Audit (Job 40)

Audited against the merged Dec 2 picture (`scratch/dec2-picture` `d6ecd557`, local-only):
- `origin/claude/design6` (`f90cd2ce`)
- `origin/main` (`7b567771`)
- `origin/alt/patch-dec2` (`47607635`)
- Frozen test data: `0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/`

Every claim below is labelled **checked (how)** or **not checked**. Fixes are split cleanly into two branches with zero file overlap:
- Data-job fixes + test: `alt/gemini-md-data` (from `origin/main` `7b567771`)
- Page/roster fixes + test + this report: `alt/gemini-md-page` (from `origin/claude/design6` `f90cd2ce`)

---

## 1. Ranked Findings

### CRITICAL-1: `liveUsage('doubles')` mixes Reg M-C `data.js` usage (`p.u`) with Reg M-D sets all December (`app/src/app/01-state.js:37-41`) — **FIXED on `alt/gemini-md-page`**
- **Status:** checked (Playwright on `app/dist/v2.html` + `experiments/md-switch-page-gaps-test.mjs`)
- **Proof:**
  - *Input:* Reg M-D day 3 (`META.reg = {id: 'M-D', since: '2026-12-02'}`, `META.results = null`, `META.doubles.top = []` because Smogon publishes monthly stats only after December ends, `META.doubles_tour.top = [{r:1, n:'Garchomp', u:45}, {r:2, n:'Pikachu', u:20}]`).
  - *What happened before:* `liveUsage('doubles')` checked only `META['doubles']` (empty all December) and returned `null`. `U(p)` then fell back to hardcoded Reg M-C `p.u` from `data.js` (`U(Incineroar) = 31.7`, `U(Pikachu) = 0`), causing `THR.threatList()` (`55-threats.js:333`) to pair top-30 Reg M-C threat weights with Reg M-D sets, excluding new M-D staples (`u: 0`), and leaving `V2.scoreSrc({v:1})` stuck on `"Graded against Reg M‑C's teams until Reg M‑D results arrive"` even after M-D tournament results arrived.
  - *What should happen:* When `META.doubles.top` is empty, `liveUsage('doubles')` falls back to `META.doubles_tour` (`top` + `more`). On M-D day 1 with 0 events (`META.doubles_tour.top` empty), `liveUsage` still returns `null` (preserving `V2.scoreSrc`). As soon as 1+ M-D event populates `META.doubles_tour`, `U(p)` uses M-D tournament usage only (`U(Pikachu) = 20`, `U(Incineroar) = 0`). On Reg M-C (`META.doubles.top` has 60 rows), behavior is unchanged.
- **Smallest fix:** 3 lines in `app/src/app/01-state.js:37-40`.

### HIGH-1: `experiments/gen-roster.mjs:48` deletes `Meowstic-F` on Dec 2 night (`experiments/gen-roster.mjs:48`) — **FIXED on `alt/gemini-md-page`**
- **Status:** checked (ran `node experiments/gen-roster.mjs --ps node_modules/pokemon-showdown --write` in `/tmp` copy + `experiments/md-switch-page-gaps-test.mjs`)
- **Proof:**
  - *Input:* Running `node experiments/gen-roster.mjs --ps node_modules/pokemon-showdown --write` on Dec 2 night to add the 24 new M-D Pokémon + 4 Megas.
  - *What happened before:* `HAND_OMIT` still contained `'Meowstic-F'` (written before `rules-fixes` added `Meowstic-F` to `ROSTER` and `LEARN`). Output: `Roster 346 -> 345 entries`. Removing `Meowstic-F` immediately breaks `experiments/rules-fixes-test.mjs` checks 1a and 1b, turning `main` red and blocking `promote.yml` on launch night.
  - *What should happen:* `gen-roster.mjs` keeps `Meowstic-F` in `ROSTER` and `LEARN`.
- **Smallest fix:** Clear `HAND_OMIT = {}` in `experiments/gen-roster.mjs:48`.

### HIGH-2: `ratings-snapshot.mjs:17-23` saves 346 unrated stat-floor placeholders (`tc: null`) into `out/ratings_log.json` on M-D day 1 — **FIXED on `alt/gemini-md-data`**
- **Status:** checked (Playwright + `node experiments/md-switch-data-gaps-test.mjs`)
- **Proof:**
  - *Input:* M-D day 1 with 0 M-D events (`rating(p).tc === null` for every Pokémon; `rating(p).total` returns stat-floor placeholders `6..30`, e.g., Gyarados `30`, Incineroar `30`, Garchomp `23`, hidden as `"Not rated yet"` on the site).
  - *What happened before:* `ratings-snapshot.mjs:17` wrote all 345/346 stat-floor placeholders into `byReg['M-D']` (`mdDays=1, firstDayMons=345`). `track.mjs` and `scoreboard.mjs` then grade real M-D tournaments against those never-shown placeholders.
  - *What should happen:* Save only Pokémon with real tournament evidence (`rating(p).tc != null`). On 0-rated days, still refresh `out/ratings_log.json` (`reg: 'M-D'`, `updated`, empty `byReg['M-D']: []`, preserving `byReg['M-C']`), which passes `health.mjs:64` `thinRule`.
- **Smallest fix:** Filter `ROSTER.filter(p => rating(p).tc != null)` and skip appending an empty day in `ratings-snapshot.mjs:17-25`.

### HIGH-3: `reg-guard.mjs:9-40` leaves stale `regstate.json` and `model_shadow.json` on switch day and flags `shadow_scoreboard.json` / `post.json` / `post-suggest.json` as `unknown` — **FIXED on `alt/gemini-md-data`**
- **Status:** checked (`guardOut()` in Node + `experiments/md-switch-data-gaps-test.mjs`)
- **Proof:**
  - *Input:* Switch day (`out/reg.json` = `M-D`) with M-C `regstate.json`, `model_shadow.json`, `shadow_scoreboard.json`, `post.json`, `post-suggest.json`.
  - *What happened before:* `guardOut()` returned `unknown: ['model_shadow.json', 'post-suggest.json', 'post.json', 'regstate.json', 'shadow_scoreboard.json']` and left M-C `regstate.json` (which fails `health.mjs:78` `wrong regulation (M-C, expected M-D)`) and M-C `model_shadow.json` untouched on disk.
  - *What should happen:* `regstate.json` and `model_shadow.json` are emptied and stamped `M-D` (with M-C copies archived first); `shadow_scoreboard.json` (multi-reg `byReg`), `post.json`, and `post-suggest.json` are in `EXEMPT`.
- **Smallest fix:** Add 3 entries to `EXEMPT` and 2 cases to `emptyFor` in `reg-guard.mjs:9-39`.

### HIGH-4: `model.mjs:20-23,254` with `MODEL_SHADOW=1` leaves stale M-C `out/model_shadow.json` on switch day — **FIXED on `alt/gemini-md-data`**
- **Status:** checked (ran `MODEL_SHADOW=1 node model.mjs` in `/tmp` copy + `experiments/md-switch-data-gaps-test.mjs`)
- **Proof:**
  - *Input:* M-D day 1 (`0` games, `0` events) with `MODEL_SHADOW=1` and existing M-C `out/model_shadow.json` (`ships: true`).
  - *What happened before:* `model.mjs:22-23` wrote a stamped not-ready `M-D` `out/model.json` and exited 0, leaving M-C `out/model_shadow.json` (`reg: 'M-C', ships: true`) untouched. Same if `>= 5` events exist but `!ships` at line 254.
  - *What should happen:* Write a stamped not-ready `M-D` `out/model_shadow.json` unless a shipped same-reg shadow model already exists.
- **Smallest fix:** Mirror the not-ready write for `MODEL_SHADOW_OUT` in `model.mjs:20-31,261-268`.

### MEDIUM-1: `weekly.mjs:42` and `practice.mjs:20` cause `health.mjs` to FAIL as stale on Dec 4 / Dec 7 if M-D has 0 events/replays — **FIXED on `alt/gemini-md-data`**
- **Status:** checked (ran `weekly.mjs`, `practice.mjs`, `health.mjs --now=2026-12-07` in `/tmp` copy + `experiments/md-switch-data-gaps-test.mjs`)
- **Proof:**
  - *Input:* Empty `M-D` `weekly.json` and `practice.json` dated `2026-12-02` with 0 M-D events/replays on `2026-12-05` / `2026-12-07`.
  - *What happened before:* Both scripts exited 0 without refreshing `updated`; `health.mjs --now=2026-12-07` exited 1 with `::error::This week vs last week: data from 2026-12-02, 5 days old (limit 2)` and `::error::Team preview practice: data from 2026-12-02, 5 days old (limit 4)`.
  - *What should happen:* When no non-empty same-reg file exists yet, write a fresh stamped empty file with current `updated`. When a non-empty same-reg file exists (`a.n > 0` / `rounds.length > 0`), preserve it unchanged (outage fail-safe).
- **Smallest fix:** 6 lines each in `weekly.mjs:42-48` and `practice.mjs:20-26`.

### MEDIUM-2: `V2.regDay` drops launch-night Americas M-D events dated `"2026-12-01"` (`app/src/v2/shell.js:327`) — **FIXED on `alt/gemini-md-page`**
- **Status:** checked (Playwright on `app/dist/v2.html` + `experiments/md-switch-page-gaps-test.mjs`)
- **Proof:**
  - *Input:* Limitless tournament starting `2026-12-02T02:30:00Z` (Dec 1, 9:30 PM ET). `regAt` / `sameReg` puts it in `M-D`; `events.mjs:18` stores `date: evDay(T.d)` = `"2026-12-01"`.
  - *What happened before:* `V2.regDay(Date.parse('2026-12-02T12:00:00Z'))` filtered `x >= r.since` (`"2026-12-02"`) and returned `"Day 1 of Reg M‑D · 0 events"`, disagreeing with `regstate.mjs` and `META.events.events`.
  - *What should happen:* Allow `prevDay` (`r.since - 1 day`) in `V2.regDay`'s filter (since `META.events` is already single-regulation via `events.mjs:46` + `reg-guard.mjs`), returning `"Day 1 of Reg M‑D · 1 event"`.
- **Smallest fix:** 2 lines in `app/src/v2/shell.js:327-328`.

### MEDIUM-3: `experiments/reg-test.mjs` has 3 failures once `main`'s `regulation.json` is merged — **REPORT ONLY (existing test untouched)**
- **Status:** checked (`node experiments/reg-test.mjs` on `scratch/dec2-picture` `d6ecd557`: `3 failed`, `exit: 1`)
- **Proof:** Lines 24–28 pass `'2026-11-09'` expecting count-based M-D switch (`24 events, 1680 players`). `formats.mjs:113` (`if (nextProf && nextProf.since)`) now intentionally blocks switching before `2026-12-02` because `regulation.json` defines `M-D.since = "2026-12-02"`. Not in `.github/workflows/test.yml`, so CI is unaffected, but HH should update or retire `reg-test.mjs` after the switch.

### LOW-1: `md-watch.mjs:45,60-67` ignores `regAt` and false-alarms on 0-event launch days — **REPORT ONLY**
- **Status:** checked (`md-watch.mjs` dry runs + code inspection)
- **Proof:**
  - Line 45 checks `String(t.format || '').toUpperCase() === next` without `regAt`, so Limitless events tagged `M-C` after `01:59Z` are not spotted as `M-D`.
  - Lines 60–67 read `data/index.json`'s newest tournament date; if 0 M-D events run on Dec 2–3, `age >= 2` opens `"Limitless data paused since 2026-12-01"` even when Limitless API returned HTTP 200. (Similarly, `health.mjs:100-101` alarms after 4 days with no new tournament in `data/index.json`.)

### LOW-2: 60-second dead zone in `V2.mdCountdown` (`app/src/v2/shell.js:315-316`) — **VERIFIED INTENTIONAL**
- **Status:** checked (Playwright in `TZ=America/Los_Angeles` and `TZ=Asia/Tokyo`)
- **Proof:** Between `2026-12-02T01:59:00Z` (`REG_END_MC`) and `2026-12-02T02:00:00Z` (`REG_START_MD`), `now < endMs` is false and `now >= stMs` is false, so `V2.mdCountdown` returns `""` for 60 seconds. Matches `docs/rebuild/md-start-night-plan.md:14` ("8:59 PM (01:59Z): M-C ends... the countdown hides, the 'M-D has started' line shows from 9:00 PM").

---

## 2. Step 0 Conflict List & Resolutions (For Saturday's `design6` -> `main` Switch)

Created local `scratch/dec2-picture` from `origin/claude/design6` (`f90cd2ce`), merged `origin/main` (`7b567771`) -> **5 conflicts**, then merged `origin/alt/patch-dec2` (`47607635`) -> **1 conflict**:

| # | Merge | File | Conflict & Exact Resolution |
|---|---|---|---|
| 1 | `design6` + `main` | `.github/workflows/test.yml` | 2 hunks: union of `paths` array; keep both `syntax-check.mjs` (`design6`) and `date-switch-test.mjs` (`main`). |
| 2 | `design6` + `main` | `.github/workflows/update.yml` | 1 hunk: keep `design6`'s `post-news.mjs` + `post-data-test.mjs`, followed by `main`'s `shadow-scoreboard.mjs` (with `PREV_MATCHES`) BEFORE `MODEL_SHADOW=... node model.mjs`. |
| 3 | `design6` + `main` | `formats.mjs` | 1 hunk: keep `main`'s dynamic `REG_END` derived from `regulation.json` (`REG_FILE.regs`) + `design6`'s HOME news 878 comment. |
| 4 | `design6` + `main` | `official.mjs` | 1 hunk: **CRITICAL ON SATURDAY** — keep `main`'s `regulation.json`-driven `ACT` / `RGP` / `RG_ID` / `STAMP_REG` + `hello@nastyplot.org` `UA`. Taking `design6`'s copy would revert `official.mjs` to hardcoded `REG = 'M-C'`. |
| 5 | `design6` + `main` | `update.mjs` | 1 hunk: combine `main`'s `/ nTeams` zero-team division guard on `tour.rows` & `tour.megas` with `design6`'s `megaN: MG` on `results`. |
| 6 | + `alt/patch-dec2` | `.github/workflows/test.yml` | 1 hunk: add `'experiments/patch-dec2-test.mjs'` and `'experiments/apply-dec2-patch.mjs'` to `paths`. |

### Step 0 Test Suite Results on `scratch/dec2-picture` (`d6ecd557`, frozen `out/`)
- `node app/build.mjs` -> `slim: 3502 KB -> 3044 KB` (`exit 0`)
- `node app/build.mjs --v2 --preview-data` -> `v2 guard: clean`, `built dist/v2.html (4370 KB...)` (`exit 0`)
- `node experiments/reg-profile-test.mjs` -> `all passed` (`exit 0`)
- `node experiments/reg-switch-test.mjs` -> `ALL PASSED` (`exit 0`)
- `node experiments/date-switch-test.mjs` -> `ALL PASSED` (`exit 0`)
- `node experiments/reg-test.mjs` -> `3 failed` (`exit 1` — see MEDIUM-3)
- `node experiments/reg-guard-test.mjs` -> `ALL PASSED` (`exit 0`)
- `node experiments/md-day-one-test.mjs` -> `ALL 22 TESTS PASSED` (`exit 0`)
- `node experiments/freshness-test.mjs` -> `ALL PASSED` (`exit 0`)
- `node experiments/bo3-tagging-test.mjs` -> `bo3-tagging-test: PASS (all 18 assertions passed)` (`exit 0`)
- `node experiments/shadow-model-test.mjs` -> `shadow-model-test: PASS` (`exit 0`)
- `node experiments/dec2-landing-fixes-test.mjs` -> `ALL PASSED` (`exit 0`)
- `node experiments/patch-dec2-test.mjs` -> `103/103 checks passed` (`exit 0`)
- `node experiments/rules-fixes-test.mjs` -> `14/14 passed (dist/page.html)` (`exit 0`)
- `PAGE=app/dist/v2.html node experiments/unrated-test.mjs` -> `unrated test: all passed` (`exit 0`)

---

## 3. Areas 1–5 Summary Lines

- **Area 1a (Nov 30 / Dec 1 daily runs):** **checked** (`detectReg` + Playwright `V2.mdCountdown`). `detectReg` stays `M-C` (`switched: null, now: null`). LA shows `"Dec 1, 5:59 PM (tomorrow)"` on Nov 30 and `"(today)"` on Dec 1; Tokyo shows `"Dec 2, 10:59 AM (in 2 days)"` on Nov 30 and `"(tomorrow)"` on Dec 1.
- **Area 1b (Dec 2 00:00–02:00 UTC, LA vs Tokyo):** **checked** (`detectReg` + Playwright). `01:07Z` FAST_DATA run stays `M-C` (`regDue` waits for `01:59Z`). Both LA (`4:30 PM PST Dec 1`) and Tokyo (`9:30 AM JST Dec 2`) show `"(today)"` at `00:30Z` and `01:58:59Z`; `01:59:00Z–01:59:59Z` returns `""` (LOW-2).
- **Area 1c (02:00 UTC & first daily run after):** **checked** (`detectReg` + Playwright). At `02:00:00Z`, `V2.mdCountdown` switches to `"Reg M-D has started: our numbers switch to it at the next data update."`; `detectReg` at `02:00:00Z` and `09:07:00Z` switches `id: 'M-D', since: '2026-12-02', by: 'date'`.
- **Area 1d (M-D day 1: 0 events -> 3 events -> REG_SWITCH -> first model):** **checked** (Node + Playwright). 0 events -> all `out/*.json` stamped `M-D` empty, `health.mjs` marks thin and exits 0, site shows `"Not rated yet"` and M-C Strength Score disclaimer. 3 events -> previously mixed M-C `p.u` into `U(p)` (CRITICAL-1, fixed) and saved 346 stat-floor placeholders (HIGH-2, fixed). `REG_SWITCH` (`20 events, 1200 players`) is only a backstop when `regulation.json` has no `since` date. First `model.mjs` run at 5+ events writes `ships: false` if it fails held-out check, and now also clears stale `model_shadow.json` (HIGH-4, fixed).
- **Area 1e (Dec 1 local time = Dec 2 UTC tournament, e.g. `2026-12-02T02:30:00Z`):** **checked** (Node + Playwright). `regAt`/`sameReg` put it in `M-D`; `events.mjs` stores `evDay = "2026-12-01"`; `V2.regDay` previously dropped it (MEDIUM-2, fixed).
- **Area 1f (early / late / unexpected format strings):** **checked** (`detectReg`, `regAt`, `sdReg`). 25 early M-D events on Dec 1 stay `M-C` with `now` banner; late M-C-tagged events on Dec 3 are reclassified to `M-D` by `regAt` and fetched by `update.mjs:52-57`; unexpected strings (`"Regulation M-D"`, `"VGC26MD"`) are ignored by `REG_ID = /^[A-Z]-[A-Z]$/` (`seen: {}`); `sdReg` accepts any 4-digit year (`2027regmd -> M-D`).
- **Area 1g (`md-watch.mjs` before/during/after):** **checked** (dry runs). Before switch watches `M-D`; after switch watches `M-E`; see LOW-1 for `regAt` and 0-event pause alarm.
- **Area 2 (Never-Mixed Hunt):** **checked** across every `out/*.json`, `data/` cache, and page cleaner. Found & fixed 4 leaks (`liveUsage`/`U(p)`, `ratings-snapshot.mjs`, `reg-guard.mjs`, `model.mjs` shadow). Verified `meta_ingame.json` (paused Nov 18) IS archived and emptied by `reg-guard.mjs` on switch day so Nov 17 M-C op.gg sets do not leak into M-D.
- **Area 3 (Dec 2 Balance Patch):** **checked** in `/tmp` copy of unpatched `origin/claude/design6`. Before patch: `41/103`. After run #1 of `apply-dec2-patch.mjs`: `103/103`. After run #2: `LEARN: 0 added`, all 5 file sha256 hashes identical (idempotent). Running `gen-roster.mjs --write` after patch drops `patch-dec2-test.mjs` to `59/103` (wipes all 44 `LEARN` additions) AND drops `Meowstic-F` (`346 -> 345`, HIGH-1, fixed); re-running `apply-dec2-patch.mjs` restores `103/103`. Fail proof: changing Rock Slide accuracy `95 -> 90` in `move-acc.js` fails `patch-dec2-test.mjs` (`102/103`, exit 1).
- **Area 4 (Failure Modes & 23-Route V2 Scan):** **checked** (Playwright across all 23 v2 routes at `2026-12-02T12:00:00Z` with M-D day-1 data). Zero stale `"M-C"`, `"Reg M-D in"`, `"NaN"`, or `"undefined"` on any route; the only `"M‑C"` text is the intentional Strength Score disclaimer on `#team`. Note: `app/src/app/44-share-card.js:46` has hardcoded `'REG M-C'`, but v2 uses `share-slab.js` (dynamic `regName()`).
- **Area 5 (`docs/rebuild/md-start-night-plan.md` Review):** **checked** against code; see corrections below.

---

## 4. Corrections to `docs/rebuild/md-start-night-plan.md`

1. **Missing fix before roster step (line 32–34):** `gen-roster.mjs` currently omits `Meowstic-F`, which breaks `rules-fixes-test.mjs` 1a–1b. Land `alt/gemini-md-page` (or remove `Meowstic-F` from `HAND_OMIT`) BEFORE running `gen-roster.mjs --write`.
2. **Missing files in the roster step (line 32–34):** Adding the 24 new M-D Pokémon + 4 Megas requires updating **more than `app/src/data/data.js`**:
   - `roster.json` (used by `update.mjs`, `events.mjs`, `weekly.mjs`, `names.mjs`, `replays.mjs`, `ladder.mjs`, `perf.mjs` — without it, every new M-D Pokémon is dropped from tournament data with `::warning::`!)
   - `app/src/app/15-visual-helpers.js` (`SPRITE_ID` for new Pokémon/Megas, printed by `gen-roster.mjs`) + sprites (`experiments/add-sprites.mjs`)
   - `data/regmd-items.txt` (once official/Showdown item list is known; until then `names.mjs` safely falls back to `data/regmc-items.txt`) and `app/src/data/items-list.js`
   - `PAGE_REG = 'M-D'` (`app/src/app/24-sheet-data.js:108`) — until updated, `V2.dataNote` (`shell.js:359`) will keep showing `"Anything new in Reg M-D may be missing until NastyPlot is updated for it."`
   - `regulation.json` `"site": "M-D"` (once site data is updated for M-D)
3. **Commit cherry-pick note (line 30–31):** `8b1a2dd8` edits `app/src/v2/pages/infosheet.js` and `app/src/data/info-text.js`, which only exist on `main` AFTER Saturday Nov 28's `design6 -> main` switch. Confirm Saturday's switch is merged before building the Tue Dec 1 afternoon patch branch.
4. **Land both audit branches before Dec 1 night:** Merge `alt/gemini-md-data` (`reg-guard.mjs`, `model.mjs`, `ratings-snapshot.mjs`, `weekly.mjs`, `practice.mjs`) and `alt/gemini-md-page` (`01-state.js`, `shell.js`, `gen-roster.mjs`) before Tue Dec 1 so Dec 2 morning runs don't hit `ratings_log.json` placeholder poisoning, `model_shadow.json`/`regstate.json` leaks, or `U(p)` M-C/M-D mixing.
