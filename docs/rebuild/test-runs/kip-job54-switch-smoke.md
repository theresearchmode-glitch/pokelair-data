# Kip job 54: switch-day smoke test (`experiments/switch-smoke.mjs`)

Written Thu Nov 26, 10:51 AM (ET). Branch `alt/gemini-switch-smoke` from `origin/claude/design6` `9bab576f`.

## What was added
- **`experiments/switch-smoke.mjs`** (`node experiments/switch-smoke.mjs [path/to/v2.html]`, optional `SMOKE_OUT=<dir>`):
  - Serves the built `v2.html` (and its split assets / `art/`) over local HTTP, seeds a saved team (`Rain Check`, 6 Pokémon) in `localStorage`, and feeds `out/` documents via `window.claude`.
  - Visits **10 views** at both **390×844 (phone)** and **1440×900 (desktop)**: Home (`#home`), My Team (`#team`), Meta (`#meta`), News (`#news`), Gifts (`#gifts`), Track Record (`#track`), This Week (`#weekly`), Pokémon (`#pokemon=Garchomp`), Speed Tiers (`#speed`), and Events (`#events`).
  - Checks on every view: zero `pageerror`s (incl. initial load), zero `console.error`s, non-empty `#main` (`>= 40` chars, not Not Found), no sideways scroll (`scrollWidth <= innerWidth + 1`), saved team `"Rain Check"` loaded on `#team`, Garchomp rendered on `#pokemon=Garchomp`, data date matches `out/` (`DATA_CORE`), and non-zero counts (rated Pokémon, tournament teams, events, news stories + `out/post.json` present). Exits `1` with a full list on any failure.

## Verification
1. **Design6 build (`app/dist/v2.html`, design6 `out/`):** `switch-smoke: ALL PASSED` (`exit 0`, 22/22)
   - `asOf: "Data as of Nov 24"`, `rated: 346`, `teams: 17002`, `events: 114`, `stories: 52` (phone & desktop).
2. **Today's data (`origin/main` `out/`, exported to `/tmp`):** `switch-smoke: ALL PASSED` (`exit 0`, 22/22)
   - `asOf: "Data as of Nov 26"`, `rated: 346`, `teams: 17606`, `events: 114`, `stories: 52` (phone & desktop).
3. **Failure proof (a) — `out/post.json` removed (`SMOKE_OUT=/tmp/smoke-nopost`):**
   - `FAIL  out/post.json present with news (0 stories)` → `switch-smoke: 1 FAILED` (`exit 1`).
4. **Failure proof (b) — page error injected into `v2.html`:**
   - `FAIL  phone 390x844 · Home (#home): pageerror: injected-smoke-error`
   - `FAIL  desktop 1440x900 · Home (#home): pageerror: injected-smoke-error`
   - `switch-smoke: 2 FAILED` (`exit 1`).
5. `node experiments/syntax-check.mjs` → `syntax-check: all 418 scripts parse`.

## Runbook step 8 note for HH
`docs/rebuild/switch-runbook-nov28.md` does not exist on `origin/claude/design6` (`9bab576f`) yet (only `switch-runbook-nov19.md` is on `design6`), so I did not create a conflicting copy here. Line to add under step 8 in `docs/rebuild/switch-runbook-nov28.md`:
> Run `node experiments/switch-smoke.mjs app/dist/v2.html` (checks 10 views at 390×844 and 1440×900, saved team, data date, and non-zero counts; must exit 0).
