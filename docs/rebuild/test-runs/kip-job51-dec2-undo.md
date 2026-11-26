# Kip job 51: Dec 2 undo drill (`experiments/dec2-undo-drill.mjs`)

Written Thu Nov 26, 10:05 AM (ET). Branch `alt/gemini-dec2-undo` from `origin/main` `03cd5e41`.

## Files written or depended on by Dec 2 (checked by reading code)
- **Daily data switch commit (`Limitless data 2026-12-02`, `.github/workflows/update.yml`):**
  - `out/reg.json` (`reg.mjs:38` — switches `id` `M-C → M-D` via `detectReg` / `regDue`)
  - `out/regstate.json` (`regstate.mjs:28` — `reg: 'M-D'`, `day: 1`)
  - `out/archive/M-C/*` (`reg-guard.mjs:69` — archives every stale M-C file before emptying/restamping; note: in `update.yml`, `reg-guard.mjs` line 82 runs before `track.mjs` line 91, so `track.json` is archived to `out/archive/M-C/track.json`; `track.mjs:18` only writes `out/track_M-C.json` if `track.mjs` runs before `reg-guard.mjs`)
  - Stamped `out/*.json` (`limitless.json`, `meta_tour.json`, `info.json`, `teams.json`, `history.json`, `matches.json`, `model.json`, `model_shadow.json`, `meta_ladder.json`, `events.json`, `official.json`, `perf.json`, `practice.json`, `weekly.json`, `sources.json`, `crosscheck.json`, `replays.json`, `replays_bo3.json`)
  - `out/track.json` (`track.mjs:21,55` — empty stamped `M-D` track file)
  - `out/ratings_log.json` (`ratings-snapshot.mjs:24` — `reg: 'M-D'`, preserves `byReg['M-C']`, adds `byReg['M-D']`)
  - `out/scoreboard.json` (`scoreboard.mjs:54` — `reg: 'M-D'`, preserves `byReg['M-C']`, adds `byReg['M-D']`)
  - `out/split/*` (`split-docs.mjs` — rebuilt from `out/*.json`)
  - `data/index.json`, `data/t/*`, `data/t2/*`, `data/p/*` (`update.mjs` — any Dec 2 M-D events; safely filtered out by `sameReg` once `out/reg.json` is back to `M-C`)
- **Control & code files (if also changed on Dec 1–2):**
  - `.github/workflows/update.yml` (`REG_AUTO_SWITCH: '0'` holds both date-based `regDue` and count-based `REG_SWITCH` switches in `formats.mjs:109`)
  - `regulation.json` (`"site"`) and `app/` (if the Dec 1 roster / Dec 2 balance patch commits also landed)

## Drill results (`node experiments/dec2-undo-drill.mjs`, scratch repo only)
Real repo's `out/` and `regulation.json` were never touched (`git status` clean except new files).

### 1. Full undo drill (`exit 0`, 15/15 PASS)
- Step 1 (pre-switch M-C commit, `2026-12-01`): `split-docs` (exit 0), `git init` / `add` / `commit` (exit 0) → 23 files in `out/`, `reg=M-C`.
- Step 2 (Dec 2 switch, `2026-12-02T12:00:00Z`, M-D event in `data/index.json`): `reg.mjs` (0), `reg-guard.mjs` (0), `model.mjs` (0), `regstate.mjs` (0), `scoreboard.mjs` (0), `track.mjs` (0), `split-docs.mjs` (0), `git commit` (0) → `out/reg.json` switched to `M-D`, `out/archive/M-C/{limitless,track}.json` created.
- Step 3 (documented undo, `docs/undo-plan.md` §3):
  - U1: commit `REG_AUTO_SWITCH: '0'` in `.github/workflows/update.yml` (exit 0)
  - U2: `git revert --no-edit <switch commit>` (exit 0)
- Step 4 (file-by-file comparison): all 23 files in `out/` byte-identical to pre-switch M-C; `out/archive/M-C` removed; `scoreboard.json` and `ratings_log.json` back to `M-C` with zero `M-D` keys.
- Step 5 (post-undo run on Dec 2 `16:00Z` with M-D event still in `data/index.json`): `reg.mjs` (0) stays `id=M-C` with `now.id=M-D` banner only; `reg-guard.mjs` (0) empties/archives nothing; `regstate.mjs` (0) stays `M-C`; `health.mjs --now=2026-12-02` (0).

### 2. Failure proofs (skipping either documented undo step fails the drill)
- `node experiments/dec2-undo-drill.mjs --skip-hold` → `dec2-undo-drill: 5 FAILED` (`exit 1`): next `reg.mjs` run immediately re-switches `out/reg.json` to `M-D` (`now.id=null`), `regstate.mjs` switches to `M-D`, `reg-guard.mjs` archives M-C, `health.mjs` fails.
- `node experiments/dec2-undo-drill.mjs --skip-revert` → `dec2-undo-drill: 8 FAILED` (`exit 1`): `out/` files remain `M-D`, `out/archive/M-C` remains, `scoreboard.json` keeps `M-D`, post-undo run stays `M-D`.

## Doc gaps noticed in `docs/undo-plan.md` (report only, no doc/code edits)
1. `docs/undo-plan.md` §3 still describes only the old count-based switch (`20 events and 1,200 players`), not the Nov 24 date-based switch (`regDue`). `REG_AUTO_SWITCH: '0'` already holds both (verified in drill), so the procedure works as written, just the explanation is dated.
2. If the Dec 1 roster commit (`regulation.json` `"site": "M-D"`) or Dec 2 balance patch also landed on `main`, reverting only the data commit leaves `regulation.json` `"site": "M-D"` (safe while `out/reg.json` exists with `id: "M-C"`, but `activeReg()` would fall back to `SITE_REG` = `M-D` if `out/reg.json` were ever missing). Reverting the code/roster commit too restores `regulation.json` and `app/`.

## Not checked
- Running `update.mjs`, `replays.mjs`, `official.mjs`, or `ratings-snapshot.mjs` (Playwright/network steps) inside the scratch drill; the drill runs the offline regulation-switch chain (`reg`, `reg-guard`, `model`, `regstate`, `scoreboard`, `track`, `split-docs`, `health`).
