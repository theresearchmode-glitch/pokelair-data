# Maggi M14 — `v2-overlap.mjs` flake root cause & fix

- **Time:** Fri Nov 27 12:34 PM EST 2026
- **Branch:** `alt/maggi-m14-overlap` (from `origin/claude/design6` `978d8213`)
- **Files changed:** `app/test/v2-overlap.mjs` (waiting & measurement atomicity only; **zero rule changes**)
- **What I'd need to know that you haven't told me:** Nothing missing.
- **Status (wrap-up):** **Done** — M14 is 100% complete and verified. **Not done:** none. **Next step:** review & merge `alt/maggi-m14-overlap` (`app/test/v2-overlap.mjs`).

## Root cause — 100% test race in `app/test/v2-overlap.mjs` (NOT a real layout bug)

1. **`img.np-lg` and `footer.np-foot nav a` (`Privacy`, `Contact`) never overlap in real layout.**
   - Checked (`team@360/night`, `app/dist/v2.html` from `978d8213`, sampling `scrollHeight` and element rects from `200 ms` to `4000 ms`):
     - At `200..1700 ms` (while `#team`'s background Suggestions pass is still running): `H = 3263`, `img.np-lg` is at `y = 2840..2872`, `Privacy`/`Contact` are at `y = 3131..3175` (**291 px below** `img.np-lg`).
     - At `2200..4000 ms` (after Suggestions finishes, growing the page by **+306 px**): `H = 3569`, `img.np-lg` is at `y = 3146..3178`, `Privacy`/`Contact` are at `y = 3437..3481` (still **291 px below** `img.np-lg`).
2. **How `app/test/v2-overlap.mjs` created the exact `32% / 44%` false positive:**
   - `openView` (`app/test/v2-overlap.mjs:188`) waited a fixed `1300 ms` after `location.hash = '#team'` — **before** `#team`'s background Suggestions pass finished (`1700..2200 ms`).
   - Inside `MEASURE` (`app/test/v2-overlap.mjs:63–98`), the test collected all text line boxes `T` synchronously first (lines 63–75), **and then** ran an `async` loop calling `await solidAt(p)` (`await p.decode()`, lines 88–98) that yielded to the event loop on every `<img>` before reading `p.getBoundingClientRect()` for `P`.
   - When the `+306 px` Suggestions redraw landed **during** that `await p.decode()` loop, `MEASURE` compared **stale `T` boxes** of `Privacy`/`Contact` (`y = 3131..3175`, ink box `3146.5..3159.5`) against the **shifted `P` box** of `img.np-lg` (`y = 3146..3178`), hitting the exact solid pixels of the NastyPlot logo (`32%` / `44%`).

### Exact deterministic reproduction (before fix)
- **Command:** Extracted unmodified `MEASURE` from `app/test/v2-overlap.mjs` on `team@360/night` (`978d8213`), simulated CI runner `img.decode()` latency (`15 ms` per decode) so `MEASURE` spans the `1700..2200 ms` height transition:
  - `waitMs=1700: total=2, footHits=2`
    - `HIT: PICTURE div > footer.np-foot > nav > a "Privacy" | covers img.np-lg "NastyPlot" 32% of the line (solid pixels)`
    - `HIT: PICTURE div > footer.np-foot > nav > a "Contact" | covers img.np-lg "NastyPlot" 44% of the line (solid pixels)`
  - `waitMs=1900: total=2, footHits=2`
    - `HIT: PICTURE div > footer.np-foot > nav > a "Privacy" | covers img.np-lg "NastyPlot" 32% of the line (solid pixels)`
    - `HIT: PICTURE div > footer.np-foot > nav > a "Contact" | covers img.np-lg "NastyPlot" 44% of the line (solid pixels)`
- Exact match to GitHub run 46019686113 (`"team@360/night: footer.np-foot nav a Privacy/Contact covers img.np-lg NastyPlot 32%/44%"`).

## Baseline full runs (3× on `978d8213` and 3× on `5d111577`, including under parallel build load)

Each full run covered all 27 routes × 4 widths (`320,360,390,430`) × 2 themes (`day` and `night` run in parallel so each half finishes in ~5.6 min under the VM's 10-min single-command cap). `git diff 5d111577..978d8213 -- app/test/v2-overlap.mjs app/test/v2-overlap-known.json` was empty.

| Commit | Run | Load | Day result | Night result |
|---|---|---|---|---|
| `978d8213` | 1 of 3 | normal | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 336s)` | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 335s)` |
| `978d8213` | 2 of 3 | normal | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 334s)` | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 335s)` |
| `978d8213` | 3 of 3 | parallel `app/build.mjs` loop | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 343s)` | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 341s)` |
| `5d111577` | 1 of 3 | normal | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 336s)` | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 336s)` |
| `5d111577` | 2 of 3 | normal | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 336s)` | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 337s)` |
| `5d111577` | 3 of 3 | parallel `app/build.mjs` loop | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 343s)` | `0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 344s)` |

## Fix in `app/test/v2-overlap.mjs` (waiting & atomicity only — zero rule changes)

1. **Atomic `T`/`P` snapshot in `MEASURE` (`app/test/v2-overlap.mjs:57–98`):** Pre-decode and cache all `<img>` alpha masks into `AC` **before** measuring any bounding boxes, and make `solidAt(p)` synchronous. `T` (text boxes) and `P` (picture boxes) are now always captured in the same synchronous frame with zero `await` between them, making stale-`T` vs fresh-`P` comparisons impossible.
2. **Height-settle wait in `openView` (`app/test/v2-overlap.mjs:196–203`):** After `document.fonts.ready`, poll `document.documentElement.scrollHeight` every `50 ms` until unchanged for `250 ms` (capped at `3000 ms`) so background redraws settle before `MEASURE` starts.

## Proof after fix

1. **Deterministic reproduction (same `15 ms` `img.decode()` latency, `waitMs = 1300, 1500, 1700, 1900`):**
   - `FIXED waitMs=1300: total=0, footHits=0`
   - `FIXED waitMs=1500: total=0, footHits=0`
   - `FIXED waitMs=1700: total=0, footHits=0` (was `2 hits: 32%, 44%`)
   - `FIXED waitMs=1900: total=0, footHits=0` (was `2 hits: 32%, 44%`)
2. **Full fixed `v2-overlap.mjs` on `978d8213` (all 27 pages × 4 widths × 2 themes):**
   - Day (exit 0): `self-test: 8 planted bugs caught, 7 deliberate look-alikes passed` / `v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 387s)`
   - Night (exit 0): `self-test: 8 planted bugs caught, 7 deliberate look-alikes passed` / `v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 1 themes; 387s)`

## Not checked
- GitHub Actions runner itself (all pushes use `[skip ci]`).
