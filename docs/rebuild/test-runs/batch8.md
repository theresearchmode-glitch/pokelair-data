# batch8 (Job FF), Thu Nov 26, 2026

**Code branch:** alt/batch8, tip **7f4b1b9a** (no [skip ci]: GitHub's real run). Built on origin/alt/calc-tile-phone d2fb5489, which sits on ba95fd61.

## What's in it

| commit | what |
|---|---|
| d2fb5489 | HH's phone calc tile + game-style HP bar (Sim OK) |
| 4d2c974d | merge origin/alt/preflight-skip 575ba798, no conflicts |
| 4d07c5a3 | sweep finds, see below |
| c269eb46 | qcheck fixes for GitHub run 45920631512, see below |
| 3c34df56 | qcheck-known.json: 26 findings removed, see below |
| 7f4b1b9a | empty top commit for the real run |

**Sweep finds (4d07c5a3)**
- (a) V2.f3Words puts the regulation words in `.nw`, so "M-D." never sits alone.
- (b) The Search placeholder is "Pokémon, move, item or page" under 430 wide. The long one stays from 430.
- Checks in v2-minors, both failed first on 4d2c974d:
  - PS-1: "26 widths split" before, "all one line" after.
  - PS-2: "349px in 222px at 320" before, "all good" after.

**qcheck fixes (c269eb46)**
- Each receipt bar gets an invisible `::after` tap area, 8px above and below: 28→44px on phones, 34→50px at 820.
- The h1 is 34px from 430 to 909 wide. The 4.4vw clamp gave 36.1px at 820.
- Proof:
  - Before (4d07c5a3, full run): "85 findings, 40 new", the same 40 as GitHub.
  - After (c269eb46, full run): "45 findings, 0 new".

**qcheck-known.json (3c34df56)**
- 26 removed. They were the Stampede hero's own findings, read one by one: plate overlaps, the old h1 overlap, SIZE 31.2px "97", and its stats line at 820.
- 6 kept although not seen, because the hero change does not explain them:
  - calc 390 SIZE 30.4px "%" (day and night)
  - home 820 "The Champions" x "Dispatch" (day and night)
  - home 1920 "Its Strength Score" x "94" (day and night)
- Home+calc rerun with the pruned list: "45 findings, 0 new", 6 no longer seen.

## Local run on 3c34df56 (same code as 7f4b1b9a), frozen out/, every exit code

| step | exit | time | last line |
|---|---|---|---|
| build-pd | 0 | 4s | built dist/v2.html (4323 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| minors-groups | 0 | 533s | v2-minors (groups):all passed |
| minors-main2 | 0 | 592s | v2-minors (main2):all passed |
| minors-main1 | 0 | 705s | v2-minors (main1):all passed |
| qcheck | 0 | 1292s | qcheck-all: 28 pages + 11 views x 5 widths x 2 themes, 45 findings, 0 new; 1289s |
| guard | 0 | 3s | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in t |
| q72 | 0 | 274s | v2-q72: all passed |
| q23 | 0 | 30s | v2-q23: all passed |
| q19 | 0 | 64s | v2-q19: all passed |
| unbounded | 0 | 62s | v2-unbounded: none outside the named exception across 29 pages |
| build-art | 0 | 4s | built dist/v2.html (3084 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| A-team | 0 | 837s | behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 837s  (adapter v2) |
| D-meta-shell | 0 | 472s | behaviour: 118 pass, 0 FAIL, 41 known bugs, 0 fixed?, 7 skipped; 472s  (adapter v2) |
| overlap | 0 | 642s | v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 641s) |
| tap-once | 0 | 15s | tap-once: all pass |

**Public chain (same tip)**

| # | exit | time | last line |
|---|---|---|---|
| 0 | 0 | 24s | v2-public: all passed |
| 1 | 0 | 14s | seo-check: ALL PASSED |
| 2 | 0 | 0s | prerender-test: all passed |
| 3 | 0 | 0s | PASS PUB-6: {"gatedBehindPublic":true} |
| 4 | 0 | 28s | pokemon-pages-test: all passed |
| 5 | 0 | 4s | static-pages-test: all passed |
| 6 | 0 | 0s | (Use `node --trace-warnings ...` to show where the warning was created) |
| 7 | 0 | 59s | teamcheck-count-test: all passed |
| 8 | 0 | 25s | turnstile-page-test: all passed |
| 9 | 0 | 36s | pub-links-test: all passed |
| 10 | 0 | 0s | security-csp-test --self-test: PASS (positive + 2 negative assertions verified) |
| 11 | 0 | 8s | security-csp-test: PASS (4 hashed inline scripts, static pages pokemon.html + 404.html, 0 CSP violations, 0 external req |
| 12 | 0 | 12s | public-dataready-test: all passed |
| 13 | 0 | 101s | split-routes-cross-test: all passed |
| 14 | 0 | 20s | privacy-public: all passed |
| 15 | 0 | 58s | v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none) |
| 16 | 0 | 7s | PASS A11Y-6: {"exists":true,"ariaLive":null} |
| 17 | 0 | 25s | v2-saved: all passed |
| 18 | 0 | 2s | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in t |
| 19 | 0 | 0s | tokens-doc: up to date (769 tokens) |
| 20 | 0 | 0s | test-ids: 487 tests, every ID unique inside its group |

**Calc tile:** no test failed on it.
- Height: 310px at 390 and 318px at 320, the same in WebKit and Chromium.

## WebKit look (iPhone SE + iPhone 15, Home and Search)

- Home: "Reg M-D." stays together.
  - Preview build at the SE: "…team before / Reg M-D." The before build at some widths split "M-D." off.
  - With the Preview's data note, the SE's Score My Team sits under the tab bar. This was known from Job DD. The live build has no note and fits (Job EE sweep).
- Search placeholder: "Pokémon, move, item or page" fits on both phones.

## Pictures (labelled; recommended band green)

docs/rebuild/pics/nov27/batch8/ holds:
- Home before/after: WebKit iPhone 15 + iPhone SE, light and dark.
- Search before/after: same devices.
- The calc tile after: WebKit iPhone 15 / iPhone SE, and Chromium 390 / 320.

## Not checked

- Real devices.
- WebKit A-team and behaviour B/C. GitHub runs them.
