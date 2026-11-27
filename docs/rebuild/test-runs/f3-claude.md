# Job DD: Final 3 as Home on both builds (f3-claude), Nov 26-27, 2026

**Code branch:** alt/f3-claude, tip **ba95fd61**. It has no [skip ci], so it gets the real GitHub run.
Kip builds on this branch; every change was added as a new commit, with no history rewrite.
**Report and pictures:** alt/f3-claude-report ([skip ci]).

## What changed (one component, both builds)

**Home layout (`V2.f3Home`)**
- Final 3's hero replaces only the Stampede's hero.
- Top 10, your six, tools rack and post band stay below it, in today's order.
- This applies to nastyplot.org and the Claude build (live artifact + Preview); `V2.F3_CLAUDE` is on (Sim, Nov 26).
- Before this, the public Home was the hero alone. That was a functionality loss (rule 18), fixed here.

**h1 (Sim, option A)**
- One h1 holds the slogan, drawn like the brand lockup: "Sharply raise" in ink, "your win rate." in PLOT blue.
- Inside the same h1, a smaller line reads "Rate your Pokémon Champions team before Reg M-D." ("for" from Dec 2).
  - Size: 22px with normal letter spacing; 15px on phones.
  - It stops before the panel's slanted edge.

**First screen at 1280+**
- The hero measures what sits above it (a data note) and its taller column (words or receipt).
- It ends at the window's bottom: Preview 1440x900, hero 139→900.

**Phones (<700)**
- Each Pokémon takes one row: small picture, name, item + type label, and its bar.
- Tighter receipt; the stamp sits on the torn edge; h1 one step smaller under 430; the type legend is hidden (each row carries its type).
- **The lead's first clause "Add your six." is hidden under 700.** This keeps the Home within Sim's 7.95 at 390 now that the slogan line is back.

**Bars**
- Spoken name now starts with the visible number: "94, Mega Charizard Y's Rating" (pl-5d).

**Start buttons**
- They carry data-sdgo.
- Order: Score My Team first, Build Me a Team second, with or without a team (HH, option b).

**Test changes**
- The Stampede's own hero checks open Home with that hero (`window.__NP_SDHERO`), so they keep guarding it.
- New checks: F3-1, F3-2, F3-3, and pl-5d's `.f3-bar`.
- Updated checks: HOME-01 and HOME-06.
- HQ Tools B cap is 7.95 at 390 (Sim, Nov 26: the Preview-only data note).

## Checks that could fail (each failed first)

| check | old build | result there | new build |
|---|---|---|---|
| v2-public order check | design6 52fa60e6 | FAIL `{"hero":1,"top":-1,"six":-1,"tools":-1,"post":-1}` | pass |
| F3-1, F3-2, F3-3, pl-5d `.f3-bar` | design6 (Stampede hero) | FAIL, exactly these 4 (main1 "1 failed", main2 "3 failed"); everything else passed there | pass |
| HOME-01 | old F3 (3948dbc0) | FAIL "first heading reads 'Rate your Pokémon Champions team before Reg M-D.'" | pass |
| HOME-06 | old F3 (3948dbc0) | FAIL "with a team buttons are Battle" | pass |
| HQ Q7a | GitHub run on 99e172ba | FAIL "crowd 0" | hero hook added (3948dbc0), groups "all passed" |
| v2-unbounded | 99e172ba | 1: phone score line Unbounded 13px | 0 (15px) |
| v2-q19 | 99e172ba | crash on `.sdh-h` | 0 (hero hook) |

## Local run on ba95fd61, frozen out/ (0c992f69), every exit code

| step | exit | time | last line |
|---|---|---|---|
| build-pd | 0 | 4s | built dist/v2.html (4322 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| minors-groups | 0 | 544s | v2-minors (groups):all passed |
| minors-main2 | 0 | 586s | v2-minors (main2):all passed |
| minors-main1 | 0 | 714s | v2-minors (main1):all passed |
| guard | 0 | 2s | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in t |
| q72 | 0 | 274s | v2-q72: all passed |
| q23 | 0 | 30s | v2-q23: all passed |
| q19 | 0 | 63s | v2-q19: all passed |
| unbounded | 0 | 62s | v2-unbounded: none outside the named exception across 29 pages |
| build-art | 0 | 4s | built dist/v2.html (3083 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| A-team | 0 | 830s | behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 830s  (adapter v2) |
| D-meta-shell | 0 | 475s | behaviour: 118 pass, 0 FAIL, 41 known bugs, 0 fixed?, 7 skipped; 475s  (adapter v2) |
| overlap | 0 | 642s | v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 641s) |
| tap-once | 0 | 16s | tap-once: all pass |

**Public chain on the same tip**
- These rebuild app/dist, so they ran after the dist art links were removed.

| # | exit | time | last line |
|---|---|---|---|
| 0 | 0 | 24s | v2-public: all passed |
| 1 | 0 | 13s | seo-check: ALL PASSED |
| 2 | 0 | 0s | prerender-test: all passed |
| 3 | 0 | 0s | PASS PUB-6: {"gatedBehindPublic":true} |
| 4 | 0 | 27s | pokemon-pages-test: all passed |
| 5 | 0 | 4s | static-pages-test: all passed |
| 6 | 0 | 0s | (Use `node --trace-warnings ...` to show where the warning was created) |
| 7 | 0 | 59s | teamcheck-count-test: all passed |
| 8 | 0 | 25s | turnstile-page-test: all passed |
| 9 | 0 | 36s | pub-links-test: all passed |
| 10 | 0 | 0s | security-csp-test --self-test: PASS (positive + 2 negative assertions verified) |
| 11 | 0 | 8s | security-csp-test: PASS (4 hashed inline scripts, static pages pokemon.html + 404.html, 0 CSP violations, 0 external req |
| 12 | 0 | 12s | public-dataready-test: all passed |
| 13 | 0 | 100s | split-routes-cross-test: all passed |
| 14 | 0 | 20s | privacy-public: all passed |
| 15 | 0 | 58s | v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none) |
| 16 | 0 | 7s | PASS A11Y-6: {"exists":true,"ariaLive":null} |
| 17 | 0 | 24s | v2-saved: all passed |
| 18 | 0 | 2s | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in t |
| 19 | 0 | 0s | tokens-doc: up to date (769 tokens) |
| 20 | 0 | 0s | test-ids: 487 tests, every ID unique inside its group |

**Not run locally** (GitHub runs them): behaviour B/C groups, WebKit A-team, quality-v2, code tests, data checks, accuracy-gate.
- On 99e172ba, GitHub's code tests, data checks, accuracy-gate, C-battle and D-meta-shell were green.

## Measurements

**Home height in screens.**
- Method (HQ Tools B): returning visitor, What's New slip removed, height divided by the window height.
- Preview = file://, which loads no web fonts, like CI. Public = served over http with real fonts.

| width | Preview after | public after | Stampede before (Preview) |
|---|---|---|---|
| 320 | 8.79 | 8.63 | 8.58 |
| 360 | 8.60 | — | 8.40 |
| 375 | 8.34 | — | 8.20 |
| 390 | **7.929** (cap 7.95) | 7.83 | 7.82 |
| 414 | 7.84 | — | 7.74 |
| 430 | 7.80 | 7.70 | 7.63 |

- At 320-375 the Stampede Home was already over 7.85, so "every phone width ≤ 7.85" was not reachable without cutting content.
- 1440x900 Preview: 3.98 screens. The hero ends at 900 under the data note.
- Phone hero at 390: 1627px → about 885px.
- Score My Team, bottom against the fold above the tab bar (WebKit, real fonts):

| device | Claude build (Preview) | public |
|---|---|---|
| iPhone 15 (fold 602) | 461 | 376 |
| iPhone SE (fold 511) | 547, 36px under: inside the 80px short-phone allowance (Stampede hero 3b, Sim Nov 23 A) | 439, on the first screen |

- alt/f3-se-12 was dropped (HH): option A made it moot. The branch stays as it was.

## Pictures (labelled, recommended band green)

- docs/rebuild/pics/nov27/f3-slogan/, 20 files:
  - before/after, Claude build (Preview) and nastyplot.org, 1440x900 and 390, light and dark
  - iPhone SE after, both builds
- docs/rebuild/pics/nov26/f3-claude/, 21 files, from the first version (before option A):
  - whole Home before/after at 1440 and 390, phone hero before/after, WebKit iPhone and iPad
  - Their h1 is the old one.

## Unsure / not checked

- Real devices: not checked. All checks ran in Playwright Chromium and WebKit.
- The live artifact's own build (`--art=v2art/ --one-art-size --split`): not built here. It uses the same V2.f3Page as the Preview build that was tested.
