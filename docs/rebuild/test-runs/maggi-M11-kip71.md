# Maggi M11 — Independent verification of Kip job 71 (`80c0d935`)

- **Time:** Fri Nov 27 07:38:40 AM EST 2026
- **Branch checked:** `origin/alt/gemini-speed-chain` at `80c0d935` (`fix: resolve kip-chain-review M1-M4 & F1 + add chunk-failure & returning-visitor guards (Job 71) [skip ci]`)
- **Reference checklist:** `origin/alt/kip-chain-review:docs/rebuild/test-runs/kip-chain-review.md` (items M1, M2, M3, M4, F1)
- **What I'd need to know that you haven't told me:** Nothing missing.

## Summary

| Item | Status | Checked (how) | Verdict |
|---|---|---|---|
| **M1** | **fixed** | Checked (built `--public` site `node public-site.mjs site-m11`, served over local HTTP, Playwright Chromium aborted `/routes/calc.js` and `/routes/team.js` and waited 4 s) | 1 request, 1 `<script>` tag, shows `"This page didn't load."` error state (no retry storm) |
| **M2** | **fixed** | Checked (Playwright Chromium on `/pokemon/garchomp` with `/routes/info-text.js` aborted, tapped `Rough Skin` Ability button, waited 3 s) | 1 request, 1 `<script>` tag, opens info sheet with fallback `ABIL` text (no retry storm) |
| **M3** | **fixed** | Checked (Playwright Chromium on `/team` with returning-visitor saved six in `localStorage` and `/data/*.json` delayed 3 s, sampled at 0.3 s, 0.6 s, 1.5 s, 4.5 s) | No sample team or score `92` shown during load; shows `"Getting today's numbers…"` then the user's saved team (`"My Own Team"`, score `35`) |
| **M4** | **fixed** | Checked (frozen `out/` at `0c992f69`, `rm -rf app/dist && node app/build.mjs --v2 --preview-data`, ran exact `Sprites A (Nov 17)` logic from `app/test/v2-minors.mjs:1079-1084` in Playwright Chromium) | `PASS  Sprites A (Nov 17): small spots use the 240px files (91 on 5 pages) and no sprite set larger than 80px gets one (0)` |
| **F1** | **fixed** | Checked (`git diff origin/claude/design6...80c0d935 -- app/src/v2/pages/team.js` + Playwright Chromium Tab-order walk on `/team` at 1440×900) | `team.js` matches `design6` (`mtfHead` intact); Tab visits `Why This Score? ›` (`y=305`) → `Team Sheet ↗` → `Share as Image ›` → `Saved Teams 1 ›` (`y=361`) → `More ⋯` → `Saved ✓` before the six and set editor |

All 5 items (**M1, M2, M3, M4, F1**) are **fixed**.

---

## Detailed checks

### M1 — Failed route chunk retry storm (`/routes/calc.js`, `/routes/team.js`)
- **Checked (how):** Built public site with `node public-site.mjs site-m11`, served over local HTTP, loaded `/calc` with `/routes/calc.js` aborted and `/team` with `/routes/team.js` aborted in Playwright Chromium, waited 4 s after load, counted network requests and `<script>` tags for the chunk, and read `#main` text.
- **Exact result:**
  - `/calc` with `/routes/calc.js` aborted: `reqs: 1, scripts: 1`, `#main`: `"PAGE · DIDN’T LOAD This page didn’t load. Something went wrong drawing it. Reload to try again; the rest of the site still works. RELOAD."`
  - `/team` with `/routes/team.js` aborted: `reqs: 1, scripts: 1`, `#main`: same `"This page didn’t load."` error state.
- **Plain meaning:** Previously looped 1,910 / 1,745 requests in 4 s; now stops after 1 failed attempt and renders the error screen cleanly. Also verified in `app/src/v2/shell.js` (`_failed: true` sentinel skips re-loading and bypasses `isPre`/`preHtml`).

### M2 — Failed `info-text.js` chunk retry storm on Ability tap
- **Checked (how):** On the same `--public` build, loaded `/pokemon/garchomp`, aborted `/routes/info-text.js`, clicked the `Rough Skin` Ability button once, waited 3 s, counted requests and `<script>` tags for `info-text.js`, and inspected the opened info sheet.
- **Exact result:**
  - `reqs: 1, scripts: 1, sheetOpen: true`
  - Sheet text: `"✕ ROUGH SKIN ID CARD · ABILITY Rough Skin Ability TRAIT ON FILE Pokemon making contact with this Pokemon lose 1/8 of their max HP. ..."`
- **Plain meaning:** Previously looped 1,999 requests and never opened the sheet; now requests `info-text.js` once and opens the sheet immediately using the built-in `ABIL` fallback.

### M3 — Returning visitor on `/team` flashing sample team while data loads
- **Checked (how):** On the same `--public` build, pre-seeded `localStorage` with a saved 6-Pokémon team (`Pikachu, Snorlax, Gengar, Dragonite, Tyranitar, Gardevoir`, name `"My Own Team"`), delayed `/data/*.json` by 3 s, opened `/team`, and sampled DOM state at 0.3 s, 0.6 s, 1.5 s, and 4.5 s.
- **Exact result:**
  - `@0.3s`, `@0.6s`, `@1.5s`: `pre: false, hasSampleWord: false, hasScore92: false, snippet: "Getting today’s numbers…"`
  - `@4.5s`: `h: "My Own Team"`, score `35` (`Missing a basic`), `hasOwn: true, hasSampleWord: false`.
- **Plain meaning:** Returning visitors no longer see the pre-rendered sample team or score `92` flash before their own team arrives.

### M4 — `v2-minors` `Sprites A (Nov 17)` regression
- **Checked (how):** Checked out frozen test data (`git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/ && git reset -q -- out/`), rebuilt `rm -rf app/dist && node app/build.mjs --v2 --preview-data`, ran the exact 5-page check from `app/test/v2-minors.mjs:1079-1084` (`[390,'build'], [390,'speed'], [1280,'calc'], [1280,'battle'], [390,'team']`) in Playwright Chromium, then restored `out/` (`git checkout HEAD -- out/`).
- **Exact result:**
  - Build: `built dist/v2.html (4330 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)`
  - Per-page counts:
    - `390 build`: `sm: 48, big: 0, all: 49, over80Count: 1` (sample: `src="art/925.webp"`, `srcset="art-s/925.webp 240w, art/925.webp 384w"`)
    - `390 speed`: `sm: 20, big: 0, all: 26, over80Count: 6` (sample: `src="art/445.webp"`, `srcset="art-s/445.webp 240w, art/445.webp 384w"`, `--iw: 104`)
    - `1280 calc`: `sm: 6, big: 0, all: 8, over80Count: 0`
    - `1280 battle`: `sm: 0, big: 0, all: 6, over80Count: 0`
    - `390 team`: `sm: 17, big: 0, all: 17, over80Count: 0`
  - Exact check line: `PASS  Sprites A (Nov 17): small spots use the 240px files (91 on 5 pages) and no sprite set larger than 80px gets one (0)`
- **Plain meaning:** All 7 sprites larger than 80 px now use the 384 px `src` while keeping the `240w, 384w` `srcset`, and the 91 small spots continue to use `art-s/`.

### F1 — Keyboard Tab order on `/team` at 1440 px
- **Checked (how):** Checked `git diff origin/claude/design6...80c0d935 -- app/src/v2/pages/team.js` and walked `Tab` focus order on `/team` at 1440×900 in Playwright Chromium on the `--public` build.
- **Exact result:**
  - `git diff origin/claude/design6...80c0d935 -- app/src/v2/pages/team.js`: empty (no diff from `design6`).
  - First `#main` Tab stops on `/team` at 1440×900: `Why This Score? › (y=305)` → `Team Sheet ↗ (y=305)` → `Share as Image › (y=305)` → `Saved Teams 1 › (y=361)` → `More ⋯ (y=361)` → `Saved ✓ (y=361)` → then the six slots and set editor.
- **Plain meaning:** Reverted the `mtfHead` split cleanly; focus moves top-to-bottom without jumping back up to `Why This Score? ›`.

## Not checked
- Full `v2-minors.mjs` (`PART=main1`/`main2`/`groups`), `deploy-smoke`, `page-speed-check`, `first-screen-guard`, `split-routes-cross-test`, and `experiments/chain-review-guard.mjs` were not re-run in this job; M11 scoped specifically to independent verification of M1, M2, M3, M4, and F1 from `kip-chain-review.md`.
