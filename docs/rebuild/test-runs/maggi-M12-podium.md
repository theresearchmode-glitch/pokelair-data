# Maggi M12 — Home podium sprite stacking order (`612d0364` vs `3bc82b35^`)

- **Time:** Fri Nov 27 08:02:24 AM EST 2026
- **Branch:** `alt/maggi-m12-podium` (from `origin/alt/host-wrapper-fix` `612d0364`)
- **Test file added:** `experiments/podium-cover-test.mjs`
- **Code changes:** None (report + test file only, as requested).
- **What I'd need to know that you haven't told me:** Nothing missing.

## Verdict (settling the two checks on `612d0364`)

1. **On phones (`iPhone 15` 393, `iPhone SE` 320, `Chromium 390`, `430`), HH's WebKit iPhone 15 render is right — `3bc82b35` fixed the Ratings podium sprite over the Damage Calculator tile.**
   - Checked (Playwright WebKit & Chromium, `elementFromPoint` + rendered overlap-strip pixel count, light & dark, wrapped & unwrapped, frozen `out/` `0c992f69` AND `origin/main` `out/`):
     - `612d0364` WebKit iPhone 15: `overlapPx: 19.9`, `topEl: "img"` (in `.sdt-p.sdt-ra.sdt-ink`), rendered pixels in the 19.9 px overlap strip = **`2667 / 10260` (26.0% sprite pixels drawn OVER `.sdt-dc`)**.
     - `612d0364` Chromium 390: `overlapPx: 19.9`, `topEl: "img"`, rendered pixels = **`305 / 1140` (26.8% sprite pixels drawn OVER `.sdt-dc`)**.
   - **Why the helper's picture showed it cut:** On `3bc82b35^` (before the `z-index: 1` line), WebKit iPhone 15 and iPhone SE fail with `a.sdt-go [in .sdt-p.sdt-dc]` covering all 24/24 top-edge points (`nonBg: 0 / 10260 = 0.0%`), whereas Chromium 390 still draws the sprite on top (`topEl: "img"`, `323 / 1140 = 28.3%`). Also, on `612d0364` itself, **WebKit at `>= 1100px` (`iPad Pro 11 landscape`, 1194×834) STILL cuts the `#1` Ratings podium sprite** (Finding 1 below).

2. **Root cause of the WebKit vs Chromium split:**
   - In DOM order, `.sdt-ra` comes **before** `.sdt-dc`, while CSS `order` places `.sdt-dc` (`order: -5`) visually above `.sdt-ra` (`order: -2`).
   - `.sdt-p` has `position: relative; isolation: isolate` (`app/src/v2/css/sd-tools.css:14`).
   - When `z-index` is `auto`, **Chromium** paints grid items in CSS `order` (`.sdt-ra` on top), while **WebKit** paints `isolation: isolate` stacking contexts in **DOM order** (`.sdt-dc` on top).

## Three findings on `612d0364`

| # | Scope | Browsers / viewports | Covering element | Cause |
|---|---|---|---|---|
| **1 (cross-tile cut)** | `Ratings(.sdt-ra)` `#1` sprite (`art/903.webp`) | **WebKit `iPad Pro 11 landscape` (1194×834)**, light & dark, wrapped & unwrapped, both `out/` sets | `a.sdt-go [in .sdt-p.sdt-dc]` (24/24 pts; `overlapPx: 3.9`; `0/720 = 0.0%` sprite pixels drawn) | `3bc82b35` put `.sdt-grid>.sdt-ra,.sdt-grid>.sdt-bt{z-index:1}` inside `@media (max-width:699.98px)` (`sd-tools.css:484`), leaving `z-index: auto` at `>= 1100px` where `.sdt-pod`'s `-48px` top margin still overlaps `.sdt-dc` by `3.9px`. |
| **2 (own card link)** | `Battle(.sdt-bt)` sprites (`art/10035.webp`, `art/10087.webp` / `art/903.webp`) | **WebKit `iPad Pro 11 landscape` (1194)** and **Chromium `1100` & `1440`**, light & dark, wrapped & unwrapped, both `out/` sets | `a.sdt-go [in .sdt-p.sdt-bt.sdt-ink]` (24/24 pts) | `.sdt-bt>.sdt-vs` (`sd-tools.css:406`) has `position: relative; isolation: isolate` with `z-index: auto` (0), trapping `.sdt-side` (`z-index: 2`, line 97) below `.sdt-go::after` (`z-index: 1`, line 22). Visually transparent, but intercepts clicks on Battle Pokémon buttons. |
| **3 (intra-stage `"VS"`)** | `Battle(.sdt-bt)` right sprite | **WebKit `iPhone 15`, `iPhone SE`** and **Chromium `390`, `430`** (15–21 pts); also 2–9 pts at `1100`/`1194`/`1440` once Finding 2 is fixed | `b.u.sdt-vsw [in .sdt-p.sdt-bt.sdt-ink]` | Intra-stage overlap: `"VS"` (`b.u.sdt-vsw`) has `z-index: 3` (line 104) above `.sdt-side` (`z-index: 2`), and its box extends over the adjacent right sprite's top-left corner. Not a separate tile. |

Wrapped vs unwrapped (`docs/maggi/files/host-wrapper-head.html`) and light vs dark produced **identical** stacking results in every single case.

## Exact commands and results

### 1. `612d0364` with frozen `out/` (`0c992f69`) — full 36-case matrix
- **Command:** `git checkout 0c992f69 -- out/ && rm -rf app/dist && node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/podium-cover-test.mjs`
- **Result line:** `podium-cover-test: 8 passed, 28 failed` (exit 1)
  - `PASS` (8): `webkit | iPad Pro 11 portrait` (4/4), `chromium | 700x900` (4/4) — no overlap with `.sdt-dc` (`s1OverlapDcPx: -24.1`), 0 covered.
  - `FAIL` (4): `webkit | iPad Pro 11 landscape` (light/dark × wrapped/unwrapped) — **`Ratings(.sdt-ra) "art/903.webp"` covered by `a.sdt-go [in .sdt-p.sdt-dc]` (24 pts)** + both `Battle(.sdt-bt)` sprites covered by `a.sdt-go [in .sdt-p.sdt-bt.sdt-ink]` (24 pts).
  - `FAIL` (16): `webkit | iPhone 15`, `iPhone SE`, `chromium | 390`, `430` — **`Ratings(.sdt-ra)` 0 covered**; `Battle(.sdt-bt)` right sprite covered by `b.u.sdt-vsw` (15–21 pts).
  - `FAIL` (8): `chromium | 1100`, `1440` — **`Ratings(.sdt-ra)` 0 covered**; `Battle(.sdt-bt)` sprite(s) covered by `a.sdt-go [in .sdt-p.sdt-bt.sdt-ink]` (24 pts).

### 2. `612d0364` with today's `origin/main` `out/` — full 36-case matrix
- **Command:** `git checkout origin/main -- out/ && rm -rf app/dist && node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/podium-cover-test.mjs`
- **Result line:** `podium-cover-test: 8 passed, 28 failed` (exit 1)
  - Identical pass/fail breakdown across all 36 cases (same Finding 1 on `webkit | iPad Pro 11 landscape`, Finding 2 on `1100`/`1194`/`1440`, Finding 3 on phones).

### 3. Failure proof on `3bc82b35^` (before the `z-index: 1` line)
- **Command:** `git checkout 3bc82b35^ -- app/src/v2/css/sd-tools.css && rm -rf app/dist && node app/build.mjs --v2 --preview-data && WRAPPED=0 PAGE=app/dist/v2.html node experiments/podium-cover-test.mjs`
- **Result lines (phone width):**
  - `FAIL  webkit | iPhone 15 | light | unwrapped`: `sprite=Ratings(.sdt-ra) "art/903.webp" box={"left":74.8,"top":150.8,"right":134.8,"bottom":210.8,"width":60,"height":60} covered at (81.5,151.8, dy=1) by a.sdt-go [in .sdt-p.sdt-dc] (24 pts)`
  - `FAIL  webkit | iPhone 15 | dark | unwrapped`: same (`24 pts`)
  - `FAIL  webkit | iPhone SE | light | unwrapped`: `sprite=Ratings(.sdt-ra) "art/903.webp" box={"left":130,"top":118.4,"right":190,"bottom":178.4,"width":60,"height":60} covered at (136.7,119.4, dy=1) by a.sdt-go [in .sdt-p.sdt-dc] (24 pts)`
  - `FAIL  webkit | iPhone SE | dark | unwrapped`: same (`24 pts`)
  - `3bc82b35^ wk iPhone 15` pixel probe: `overlapPx: 19.9, topEl: "a.sdt-go [in .sdt-p.sdt-dc]", nonBg: 0, total: 10260, pct: 0`
  - `3bc82b35^ ch 390` pixel probe: `overlapPx: 19.9, topEl: "img [in .sdt-p.sdt-ra.sdt-ink]", nonBg: 323, total: 1140, pct: 28.3`

## Proposed smallest CSS fix (stacking order only)

In `app/src/v2/css/sd-tools.css`:
1. **Fix Finding 1 (cross-tile cut on WebKit `>= 1100px`):** Move `.sdt-grid>.sdt-ra,.sdt-grid>.sdt-bt{z-index:1}` out of `@media (max-width:699.98px)` (line 484) up into the `@media all` rack block right after line 403.
2. **Fix Finding 2 (own `a.sdt-go` covering Battle sprites at `>= 1100px`):** Add `z-index:2;` to `.sdt-ra>.sdt-pod,.sdt-bt>.sdt-vs,.sdt-pr>.sdt-pp,.sdt-ar>.sdt-wx` at line 406 (so `.sdt-vs` sits above `.sdt-go::after` `z-index: 1`, matching the comment on line 95).

- **Proof (tested locally on a temporary edit, then reverted):**
  - Re-ran `WRAPPED=0 PAGE=app/dist/v2.html node experiments/podium-cover-test.mjs` with those two stacking-order lines:
    - **`Ratings(.sdt-ra)`:** 0 covered across all 18 cases, including `webkit | iPad Pro 11 landscape` (`topEl: "img"`).
    - **`Battle(.sdt-bt)` `a.sdt-go`:** 0 covered across all 18 cases (completely eliminated at `1100`, `1194`, `1440`).
    - Only Finding 3 (`b.u.sdt-vsw` `"VS"` at `z-index: 3` inside `.sdt-bt`) remained.
- (Note: Finding 3 is an intra-stage text-over-sprite overlap where `"VS"` is explicitly `z-index: 3`; changing its layout/size would be design work and is left to HH.)

## Not checked
- Real physical iPhone hardware (only Playwright WebKit `iPhone 15` / `iPhone SE` / `iPad Pro 11` device profiles and Chromium were run).
- `out/` was restored to `HEAD` (`612d0364`) after all tests; `app/src/v2/css/sd-tools.css` was left untouched on this branch.
