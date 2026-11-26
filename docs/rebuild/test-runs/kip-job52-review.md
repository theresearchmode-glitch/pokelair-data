# Kip job 52: independent code review of `origin/alt/day-batch` (`233c32a7`)

Written Thu Nov 26, 10:11 AM (ET). Branch `alt/gemini-review-daybatch` (report only; no code changes).
Reviewed ONLY the four requested areas on `origin/alt/day-batch` (`233c32a7`) against `origin/claude/design6` (`9bab576f`):
- `app/src/v2/css/sd-tools.css` (lines 455–489: phone rack, `@media (max-width:699.98px)`, `.sdt-pct3`)
- `app/src/v2/css/tokens.css` (line 67: `--d-calctight`)
- `app/src/v2/pages/stampede-tools.js` (line 85: `sdt-pct3` condition, plus line 42 + `dmgP` / `ptsTxt`)
- `app/test/v2-minors.mjs` (lines 1329–1346: "Stampede tiles 4" Damage Calc band check)

**How checked:** read the diffs and full sections via `git show origin/alt/day-batch:...`, then built `origin/alt/day-batch` in a temporary worktree (`node app/build.mjs --v2 --preview-data`) and measured `clipPath`, `fontSize`, `scrollWidth/clientWidth`, and slanted-edge clearance across 18 viewport widths (`320, 360, 375, 380, 390, 414, 699, 700, 744, 820, 900, 960, 1024, 1099, 1100, 1200, 1280, 1440`) in headless Chromium (Playwright) for `"94–100%"`, `"100–100%"`, `"8.5–9.9%"`, and `"88–99%"`.

---

## Findings

### 1. High — Wide 2-digit ranges (e.g. `"88–99%"`) overflow the slanted right edge at 380–390px and 1200–1280px, and `v2-minors.mjs` does not catch it
- **Where:** `app/src/v2/pages/stampede-tools.js:85`, `app/src/v2/css/sd-tools.css:461,488`, `app/test/v2-minors.mjs:1334,1337-1340`
- **Failing case:** Any 2-digit–2-digit range with wide glyphs such as `"88–99%"` (6 chars, neither side has `length > 2`, so `stampede-tools.js:85` does **not** add `.sdt-pct3` and the number stays at `--d-calc: clamp(56px, 5.6vw, 88px)`).
- **Measured (Playwright on `origin/alt/day-batch` `233c32a7`):**
  - `380px`: `font-size: 56px`, `ins=16px`, clearance `-15px` (mid) / `-16px` (bottom)
  - `390px`: `font-size: 56px`, `ins=16px`, clearance `-5px` (mid) / `-6px` (bottom)
  - `1200px`: `font-size: 67.2px`, `ins=24px`, clearance `-14px` (mid) / `-19px` (bottom)
  - `1280px`: `font-size: 71.68px`, `ins=24px`, clearance `-4px` (mid) / `-9px` (bottom)
- **Why the test misses it:**
  1. `v2-minors.mjs:1334` checks the real number only against `P` (the unslanted rectangle) — it never runs the slanted-edge `room` calculation on the real number, only on the injected `'94–100%'` with `.sdt-pct3` (lines 1339–1340).
  2. `v2-minors.mjs` never injects a wide 2-digit range (`"88–99%"`) without `.sdt-pct3`.

### 2. Medium — `"100–100%"` (guaranteed OHKO) pokes past the bottom of the slant at 1200px; `v2-minors.mjs` only tests `"94–100%"` and measures at the vertical midpoint
- **Where:** `app/src/v2/pages/stampede-tools.js:42,85`, `app/src/v2/css/tokens.css:67`, `app/test/v2-minors.mjs:1337,1339`
- **Failing case:** When `bestHitOn` returns a guaranteed OHKO, `stampede-tools.js:42` clamps both `lo` and `hi` to `100`, and line 85 renders `"100–100%"` (8 chars, does not collapse equal `lo === hi` to one number). That is wider than `'94–100%'` (7 chars), which `v2-minors.mjs:1337` calls "the widest number the calc can show".
- **Measured (Playwright on `origin/alt/day-batch` `233c32a7`):**
  - `"100–100%"` with `.sdt-pct3` (`--d-calctight: clamp(40px, 4.4vw, 70px)`): at `1200px` (`font-size: 52.8px`, `ins=24px`), midpoint clearance is `+2px`, **bottom clearance is `-2px`** (the bottom-right corner of `%` crosses the slant).
- **Why the test misses it:**
  1. Line 1337 injects `'94–100%'` instead of `'100–100%'`.
  2. Line 1339 computes the slanted edge at `r.top + r.height / 2` (line midpoint) instead of `r.bottom`. Because `clip-path: polygon(k 0, 100% 0, calc(100% - k) 100%, 0 100%)` slants inward toward the bottom, `r.bottom` is further right relative to the slant than the midpoint (`+2px` mid vs `-2px` bottom at `1200px`), so the test can pass while the bottom of `%` clips.

### 3. Low/Medium — `v2-minors.mjs:1339` silently disables the slanted-edge check if `clipPath` serialization changes
- **Where:** `app/test/v2-minors.mjs:1339`
- **Code:** `const ins = +((bc.clipPath.match(/calc\(100% - ([\d.]+)px\) 100%/) || [])[1] || 0);`
- **Checked:** In Chromium on this VM, `getComputedStyle(p, '::before').clipPath` currently serializes as `"polygon(24px 0px, 100% 0px, calc(100% - 24px) 100%, 0px 100%)"`, so `matchedIns = 24` works in Chromium today.
- **Risk:** If another engine (WebKit/Firefox) serializes the `calc()` term in a different order (e.g. `calc(-24px + 100%)` or `calc(100% + -24px)`), the regex silently falls back to `ins = 0` and the slanted-edge check passes without testing the slant. Reading `parseFloat(getComputedStyle(p).getPropertyValue('--k'))` (and failing if `!(ins > 0)`) would avoid silent pass-through.

### 4. Low — `v2-minors.mjs:1333` regex rejects `"<0.1"` if `dmgP` ever returns it
- **Where:** `app/test/v2-minors.mjs:1333` (vs `app/src/app/06-helpers.js:4` `ptsTxt` / `39-damage-calc-speed.js:356` `dmgP`)
- **Failing case:** If `0 < H.lo < 0.1`, `dmgP(H.lo)` returns `"<0.1"` (e.g. `"<0.1–0.2%"`), which fails `/^\d[\d.]*[–-]\d[\d.]*%$/`. Unlikely for `bestHitOn` (it picks the strongest move between #1 and #2), noted for completeness.

---

## Verified OK (no bug found)
- **`.5` decimals (e.g. `"8.5–9.9%"`):** `stampede-tools.js:85` checks `String(dmgP(H.hi)).length > 2 || String(dmgP(H.lo)).length > 2`. Because `ptsTxt` returns `"8.5"` (length 3), `.sdt-pct3` IS applied; measured in Playwright across all 18 widths (`320–1440px`) → fits both mid and bottom at every width.
- **`"94–100%"` with `.sdt-pct3`:** fits both mid and bottom across all 18 widths (`320–1440px`) in Chromium.
- **CSS rule matching & cascade (`sd-tools.css:455–489`, `tokens.css:67`):** Every media query and `.sdt-pct.sdt-pct3` selector matches as intended; `.sdt-grid>.sdt-dc .sdt-pct.sdt-pct3` (`0,3,0`) beats `.sdt-grid>.sdt-dc .sdt-pct` (`0,2,0`), and line 489 (`max-width:379.98px`) properly overrides line 488 (`max-width:699.98px`) at `320–379px`. (Minor stale comment on `sd-tools.css:476`: says `"half-width card"`, while line 477 makes those four cards `grid-column:1/-1` at the same `max-width:389.98px` breakpoint.)
- **Not checked:** WebKit rendering / WebKit `clipPath` serialization (Chromium only on this VM).
