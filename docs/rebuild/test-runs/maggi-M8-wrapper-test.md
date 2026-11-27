# Maggi Job M8: Permanent host-wrapper regression test (`experiments/host-wrapper-test.mjs`)

- **Date:** Fri Nov 27 06:54:28 AM EST 2026
- **Branch:** `alt/maggi-m8-wrapper-test` (branched from `origin/alt/host-wrapper-fix` `3bc82b35`, which includes `6d2bbe9c`)
- **What I'd need to know that you haven't told me:** Nothing missing — **bonus bug caught and fixed**: our full-page pixel-diff test caught a second unlayered host-wrapper rule (`[hidden]:not([hidden=until-found i]){display:none!important}`) that `6d2bbe9c` did not revert. On the wrapped page, it collapsed `.np-goback[hidden]` and `.np-gofwd[hidden]` (overriding `@layer shell`'s `visibility:hidden` slot preservation, Sim Nov 12 Decision 4 B) and shifted the header logo 40px left (`x=96` vs `x=136`). Added the 1-line `revert-layer` rule for `[hidden]` in `app/build.mjs:56`, bringing all 4 full-page screenshots to 0 differing pixels.

## Changes
1. **`experiments/host-wrapper-test.mjs`** (new):
   - Uses `PAGE` (or builds `node app/build.mjs --v2 --preview-data` if absent), writes a temporary `v2-host-wrapped.html` beside `v2.html` (`HOST_HEAD + v2.html + '</body></html>'` using the exact head from `docs/maggi/files/host-wrapper-head.html`), and deletes it in `finally`.
   - Loads unwrapped and wrapped `#home` in Chromium (`reducedMotion: 'reduce'`) at `390x844` and `1440x900`, light (`day`) and dark (`night`, via `localStorage` `np2.theme` + `cc2.theme` + `colorScheme`).
   - Compares computed `body` (`backgroundColor`, `color`, `fontFamily`, `fontSize`), `:root` (`colorScheme`, `paddingTop`, `paddingBottom`), and full-page PNG screenshots (exact pixel diff via in-browser `<canvas>`, failing on any non-zero pixel diff).
2. **`app/build.mjs:55-56`**:
   - Added `'html body [hidden]:not([hidden=until-found i]){display:revert-layer!important}'` to the unlayered `revert-layer` block so the host wrapper's `[hidden]` rule yields to `@layer shell`'s `.np-goback[hidden]` / `.np-gofwd[hidden]` while keeping normal `[hidden]` elements `display:none`.
3. **`.github/workflows/test.yml:5,286-288`**:
   - Added `experiments/host-wrapper-test.mjs` to `on.push.paths` and wired `PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs` right after `rank-tiebreak-test.mjs`.

---

## Proof: fail before → catch 2nd bug on `6d2bbe9c` → pass after (0 differing pixels)

1. **On `origin/claude/design6` (`5d111577`, no `revert-layer` fix)** — checked:
   - Command: `git checkout origin/claude/design6 -- app/build.mjs && node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs`
   - Result (**exit 1**): `host-wrapper-test: 8 FAILED (0 passed)`
   - Exact dark-mode failure line:
     `FAIL  1440x900 dark styles match (bodyBg: unwrapped="rgb(18, 18, 27)" vs wrapped="rgb(255, 255, 255)"; bodyColor: unwrapped="rgb(228, 224, 218)" vs wrapped="rgb(0, 0, 0)"; bodyFont: unwrapped="\"Instrument Sans\", system-ui, sans-serif" vs wrapped="-apple-system, BlinkMacSystemFont, sans-serif"; bodySize: unwrapped="16px" vs wrapped="14px"; rootScheme: unwrapped="dark" vs wrapped="light")`
   - Meaning: Proves the test catches the white-background dark-mode wrapper bug and all host overrides.

2. **On `origin/alt/host-wrapper-fix` (`6d2bbe9c` / `3bc82b35`, before `[hidden]` `revert-layer`)** — checked:
   - Result (**exit 1**): `host-wrapper-test: 4 FAILED (4 passed)` — all 4 style checks passed, all 4 full-page screenshots failed (`1092–11453` differing pixels, header logo shifted 40px left from `x=136` to `x=96` because `[hidden]:not([hidden=until-found i]){display:none!important}` collapsed `.np-goback[hidden]`).

3. **On `alt/maggi-m8-wrapper-test` (with `app/build.mjs:56` `[hidden]` `revert-layer`)** — checked:
   - Command: `node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs`
   - Exact result lines (**exit 0**):
     - `v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)`
     - `PASS  390x844 light styles match (bodyBg=rgb(251, 250, 247), rootScheme=light)`
     - `PASS  390x844 light full-page screenshot pixel-identical (655352 B, 0 differing pixels)`
     - `PASS  390x844 dark styles match (bodyBg=rgb(18, 18, 27), rootScheme=dark)`
     - `PASS  390x844 dark full-page screenshot pixel-identical (716502 B, 0 differing pixels)`
     - `PASS  1440x900 light styles match (bodyBg=rgb(251, 250, 247), rootScheme=light)`
     - `PASS  1440x900 light full-page screenshot pixel-identical (1003111 B, 0 differing pixels)`
     - `PASS  1440x900 dark styles match (bodyBg=rgb(18, 18, 27), rootScheme=dark)`
     - `PASS  1440x900 dark full-page screenshot pixel-identical (1074714 B, 0 differing pixels)`
     - `host-wrapper-test: ALL 8 PASSED`
   - Meaning: Wrapped and unwrapped pages are byte-for-byte, 0-pixel identical across both viewports and both themes.

4. **Syntax check** — checked:
   - Command: `node experiments/syntax-check.mjs`
   - Result: `syntax-check: all 429 scripts parse` — **exit 0**
