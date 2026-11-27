# Maggi Job M2: Fix M1 findings 1–5 on `alt/f3-claude`

- **Date:** Thu Nov 26 09:54:20 PM EST 2026
- **Branch:** `alt/maggi-m2-f3fixes` (branched from `origin/alt/f3-claude` `ba95fd61`)
- **What I'd need to know that you haven't told me:** Nothing missing.

## Changes (code and tests only; no visual change)
Strictly scoped to the lines named in M1 findings 1–5 (avoiding `V2.f3Words` lines 36/40 so `alt/batch8` merges cleanly):

1. **`app/src/v2/pages/pubhome-f3.js:25`** (M1 #1): Fall back `evReg` to `reg` (`regInfo().id`) when `ev.name` has no `"(Reg X-Y)"` tag, so after Dec 2 02:00 UTC an older Reg M-C winner is labelled `"The last Reg M-C winning team"`.
2. **`app/src/v2/pages/pubhome-f3.js:32`** (M1 #2): Gate `/pokemon/${s}` in `V2.f3Link` on `window.__NP_PUBLIC`, so the Claude build keeps `#pokemon=<name>` and only the public build emits `/pokemon/<slug>`.
3. **`app/src/v2/pages/pubhome-f3.js:41`** (M1 #3): Guard the `" against N real tournament teams"` clause in `.f3-lead` on `teams` being truthy, so `RES = null` or `RES.teams = 0` never prints `"against 0 real tournament teams"`.
4. **`app/src/v2/pages/pubhome-f3.js:12`** (M1 #4): Return `null` from `V2.f3Rate` when `V2.unrated(p)` is true, so unrated Pokémon show `–` and `aria-label="<name>, not rated"` during a new regulation's first 28 days.
5. **`app/test/behaviour/A-team.mjs:88`** (M1 #5): Restore the `Battle` button check on the empty-team `HOME-06` assertion (`b.join('|') === 'Score My Team|Build Me a Team|Battle'`).
6. **`app/test/v2-minors.mjs:1508-1533`**: Add `F3-4`, `F3-5`, `F3-6`, `F3-7` right after `F3-3` in `part('main2')`.

---

## New tests: fail-before proof (on unfixed `ba95fd61`) → pass-after proof

### Fail-before run (frozen test data `0c992f69`, unfixed `pubhome-f3.js`)
Command: `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs | awk '{print; fflush(); if (/F3-7/) exit 0}'`
- `FAIL  F3-4 (M2 #1): after Dec 2 02:00 UTC with Reg M-C data, evReg falls back to regInfo().id and the receipt reads "The last Reg M-C winning team" ({"reg":"M-D","evReg":"","old":false,"meta":"Winning team · ValkrixVGC Champions League #09 |Shiny Golisopod | · Nov 8 · 57 players","errs":0})`
- `FAIL  F3-5 (M2 #2): V2.f3Link uses "#pokemon=..." on the Claude build and "/pokemon/<slug>" only with window.__NP_PUBLIC ({"hrefs":["/pokemon/camerupt-mega","/pokemon/sylveon","/pokemon/rillaboom","/pokemon/farigiraf","/pokemon/incineroar","/pokemon/raichu-mega-y"],"cl":"/pokemon/charizard-mega-y","pub":"/pokemon/charizard-mega-y","errs":0})`
- `FAIL  F3-6 (M2 #3): when RES is null or teams is 0, the lead omits "against 0 real tournament teams" ({"n0":"Add your six. NastyPlot rings it up out of 100 against 0 real tournament teams, then shows its Matchups and exactly what to change.","z0":"Add your six. NastyPlot rings it up out of 100 against 0 real tournament teams, then shows its Matchups and exactly what to change.","errs":0})`
- `FAIL  F3-7 (M2 #4): V2.f3Rate returns null for V2.unrated(p) while keeping numeric ratings for rated Pokémon ({"unMon":"Beedrill","isUn":true,"unRate":9,"rdRate":null,"errs":0})` *(note: also caught `x.tc > 0` vs truthy `x.tc` in `F3-7` and fixed it before the pass run)*

### Pass-after run (frozen test data `0c992f69`, fixed `pubhome-f3.js`)
Command: `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs`
- `pass  F3-4 (M2 #1): ... ({"reg":"M-D","evReg":"M-C","old":true,"meta":"The last Reg M-C winning team · ValkrixVGC Champions League #09 |Shiny Golisopod | · Nov 8 · 57 players","errs":0})`
- `pass  F3-5 (M2 #2): ... ({"hrefs":["#pokemon=Camerupt-Mega","#pokemon=Sylveon","#pokemon=Rillaboom","#pokemon=Farigiraf","#pokemon=Incineroar","#pokemon=Raichu-Mega-Y"],"cl":"#pokemon=Charizard-Mega-Y","pub":"/pokemon/charizard-mega-y","errs":0})`
- `pass  F3-6 (M2 #3): ... ({"n0":"Add your six. NastyPlot rings it up out of 100, then shows its Matchups and exactly what to change.","z0":"Add your six. NastyPlot rings it up out of 100, then shows its Matchups and exactly what to change.","errs":0})`
- `pass  F3-7 (M2 #4): ... ({"unMon":"Beedrill","isUn":true,"unRate":null,"rdMon":"Venusaur","rdRate":83,"errs":0})`

---

## Checks run (commands, exact results, exit codes)

1. **Syntax check** — checked:
   - Command: `node experiments/syntax-check.mjs`
   - Result: `syntax-check: all 427 scripts parse` — **exit 0**
   - Meaning: All 427 JS files parse cleanly.

2. **Claude preview build** — checked:
   - Command: `rm -rf app/dist && node app/build.mjs --v2 --preview-data`
   - Result: `v2 guard: clean (...)` / `v2: static first screen 99 KB` / `built dist/v2.html (4322 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)` — **exit 0**
   - Meaning: Claude preview build succeeds cleanly.

3. **Public split build** — checked:
   - Command: `rm -rf app/dist && node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public`
   - Result: `v2 guard: clean (...)` / `v2 --split: dist/v2.js 2061 KB` / `public: static words for 24 pages (home: Sharply raise your win rate. Rate your Pokémon Champions team before Reg M-D.)` / `built dist/v2.html (872 KB; ...)` — **exit 0**
   - Meaning: Public split build succeeds cleanly with static Home words.

4. **Public build suite (`v2-public.mjs`)** — checked:
   - Command: `node app/test/v2-public.mjs`
   - Result: `v2-public: all passed` — **exit 0**
   - Meaning: All public build checks pass with zero page errors.

5. **`v2-minors.mjs` (`ONLY=HQ`, clean `app/dist/`)** — checked:
   - Command: `ONLY=HQ PAGE=app/dist/v2.html node app/test/v2-minors.mjs`
   - Result: `v2-minors:all passed` — **exit 0**
   - Meaning: All HQ checks (including `HQ Q13f`, `HQ Q7a`, `HQ Tools B`) pass on a clean `app/dist/`.

6. **`v2-minors.mjs` (`PART=main2`)** — partial (hit VM ~10-minute command timeout):
   - Command: `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs`
   - Result: **exit -1** (timeout at ~9m50s) after **106 pass**, **1 FAIL** (`Item pictures in Search (stand-ins)` — caused by `app/dist/art/` being a leftover directory from the prior `--public` build instead of a symlink to `app/src/v2/art`; verified fixed on clean `app/dist/` in check 5). All 7 `F3-1..7` checks passed.

7. **`v2-minors.mjs` (`PART=groups`)** — partial (hit VM ~10-minute command timeout):
   - Command: `PART=groups PAGE=app/dist/v2.html node app/test/v2-minors.mjs`
   - Result: **exit -1** (timeout at ~9m50s); `AS-1..11`, `SP-1..7`, `TF-1..2`, `HQ Tools B` passed; `HQ Q13f`/`HQ Q7a` failed on that run due to the same leftover `app/dist/art/` directory and both passed in check 5 on clean `app/dist/`.

8. **`A-team` behaviour (Chromium)** — partial (hit VM ~10-minute command timeout):
   - Command: `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` (on `node app/build.mjs --v2 --art=../src/v2/art/`)
   - Result: **exit -1** (timeout at ~9m51s) after **69 pass, 0 fail** (3 known, 1 skip) through `EDIT-09`, including `pass  HOME-01` and `pass  HOME-06` (with restored `Battle` check).

## Unfinished / note on CI
- Local `v2-minors` (`PART=main1`, `main2`, `groups`) and full `A-team` exceed this VM's ~10-minute single-command timeout (`PART=main1` was not re-run locally after M2 since M2 made no edits to `main1` checks or `main1`-only code; M1 ran `main1` through line 1168 with 99/99 passes).
- Pushing `alt/maggi-m2-f3fixes` once **without `[skip ci]`** triggers GitHub Actions' full 35-minute-timeout suite (`main1`, `main2`, `groups`, `A-team`, `v2-public`, etc.).
