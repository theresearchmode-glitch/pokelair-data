# batch6 (Job CC), Thu Nov 26, 2026

**Branch:** alt/batch6 at **074c0f36** (top commit without [skip ci]).
- GitHub run 45895080759 on 074c0f36: **success**, all 16 checks green (42m55s).
- This report sits on its own branch (alt/batch6-report, [skip ci]), so alt/batch6's tip keeps its run.
- Every local run below used frozen out/ (0c992f69) except data-checks and accuracy-gate, which use today's out/, as GitHub does.

## What went in (in this order)

| step | source | conflicts |
|---|---|---|
| base | origin/alt/batch5 f62b2d56 | — |
| merge | origin/alt/speed-review eb9b0e2c | test.yml, 1 place: batch5's public-dataready-test step and speed-review's split-routes build + cross-test step both sat after security-csp. Kept both, dataready first (it needs the plain --split build that security-csp leaves), each with its own `if: ${{ !cancelled() }}`. YAML loads. |
| merge | origin/alt/typerows 0e65348d | none |
| merge | origin/alt/public-home-f3 bd810e84 | none (home.js auto-merged) |
| merge | origin/alt/prerender-home c853295e | app/build.mjs, 2 places: (1) tool pages: kept speed-review's split-routes `<link rel=preload>` and wrapped the result with `addPre(tp, r.key)`; (2) index.html: kept the Job 57 comment, writes `addPre(h, 'home')`. `node --check` ok. |
| fix | 54ccf47e | tokens-doc (see below) |
| merge | origin/alt/batch5 fd6a4eb7 | none (HH's md-teams.json restore) |
| merge | origin/alt/typerows e92c613c | none (TF-2 cap 3.05, Sim) |
| add | d4adc866 | F3 night panel a touch lighter (Sim, via HH) |
| fix | 71bc797d | pokemon-pages-test word-block count (HH said yes) |
| fix | 1fda4d7e | F3 root class `.f3` → `.f3-home` (Stampede plates) |
| top | 074c0f36 | empty commit, no [skip ci] |

## Real problems found and fixed (each with a failing check first)

1. **tokens-doc**
   - `node app/test/tokens-doc.mjs` → exit 1: "design-system.md is out of date with tokens.css".
   - Cause: F3 added tokens, and its commits were [skip ci], so GitHub never ran this.
   - `--write` then the check → exit 0: "up to date (769 tokens)".
2. **F3's root class hit the Stampede (mine, Job BB)**
   - Cause: pubhome-f3.css had `.f3{display:block;overflow-x:clip}`, and the app Home's plates are `li.f1`…`li.f6`.
   - A-team's `v2-overlap.mjs` → exit 1: "11 findings, 0 known, 11 new". Home 320/360/390, day and night: Rillaboom/Sneasler names overlap, Incineroar clipped.
   - Bisect with `ROUTES=home WIDTHS=320,360 THEMES=day VIEWS=0`: design6 0, batch5 0, speed-review 0, typerows 0, prerender-home 0, **public-home-f3 5**.
   - Fix: the class is now `f3-home` (JS + CSS). Home 4 widths × 2 themes: 11 → 0. The full overlap in the rerun: "0 findings … (27 pages x 4 widths x 2 themes)".
   - F3 page pictures before/after the rename: 390 pixel-identical. 1440 differs only in a 36 px column of receipt sprites, and the same build shot twice differs in the same column (load timing).
3. **pokemon-pages-test counted 2 word blocks (mine, Job W test)**
   - "FAIL index.html is the same page as v2.html plus Home's static words (… 2 word block)".
   - Cause: in an inline build, v2.js carries `<section class="vh" data-v2pre>` in V2.preBlock's own template.
   - Fix: count only the block right after `<main class="np-main" id="main">`. After: "1 word block", "pokemon-pages-test: all passed".
   - It still fails with the block taken out: "0 word block". HH approved this test change.

## Added: F3 night panel (Sim, via HH)

- `:root[data-theme="night"]{--f3-panel:#232233}`. The panel was #14131C, the light value, on the night page #12121B. Light mode is untouched.
- Checked with Playwright dark (computed colours):

| pair | before | after |
|---|---|---|
| panel on the page | 1.01:1 | 1.20:1 |
| scale words on the panel | — | 5.7:1 |
| pink stamp on the panel (20px bold, large text, needs 3) | 4.45:1 | 3.8:1 |

- Pictures, labelled, recommended band green: docs/rebuild/pics/nov26/f3-night-panel/ (before/after: dark 1440, 390, 390 receipt).
- Not a bug: in headless shots a 15 px dark strip shows at the right edge. That is html `scrollbar-gutter:stable` (main 1425 wide in 1440). Desktop draws its scrollbar there. Not checked on a real device.

## Local run 1, batch6 before the fixes (cb6f2150), every step, exit code

| job / step | exit | time | command | last line |
|---|---|---|---|---|
| v2-checks-2 3 | 0 | 2s | `node app/test/v2-guard.mjs` | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scal |
| v2-checks-2 4 | 0 | 4s | `node app/test/no-names.mjs && node app/build.mjs --v2 --preview-data && node app/test/no-names.mjs app/dist/v2` | no-names: 2182 player fields checked, 0 not an ID or stand-in |
| v2-checks-2 5 | 0 | 121s | `PAGE=app/dist/v2.html node app/test/v2-q60.mjs` | v2-q60: all passed |
| v2-checks-2 6 | 0 | 36s | `PAGE=app/dist/v2.html node app/test/v2-swapname.mjs` | v2-swapname: all passed |
| v2-checks-2 7 | 0 | 44s | `PAGE=app/dist/v2.html node app/test/v2-q68.mjs` | v2-q68: all passed |
| v2-checks-2 8 | 0 | 43s | `PAGE=app/dist/v2.html node app/test/v2-s1.mjs` | v2-s1: all passed |
| v2-checks-2 9 | 0 | 9s | `PAGE=app/dist/v2.html node app/test/v2-s26.mjs` | v2-s26: all passed |
| v2-checks-2 10 | 0 | 40s | `PAGE=app/dist/v2.html node app/test/v2-s17.mjs` | v2-s17: all passed |
| v2-checks-2 11 | 0 | 19s | `PAGE=app/dist/v2.html node app/test/v2-s13.mjs` | v2-s13: all passed |
| v2-checks-2 12 | 0 | 117s | `PAGE=app/dist/v2.html node app/test/v2-q69.mjs` | v2-q69: all passed |
| v2-checks-2 13 | 0 | 48s | `PAGE=app/dist/v2.html node app/test/v2-q78.mjs` | v2-q78: all passed |
| v2-checks-2 14 | 0 | 276s | `PAGE=app/dist/v2.html node app/test/v2-q72.mjs` | v2-q72: all passed |
| v2-checks-2 15 | 0 | 17s | `PAGE=app/dist/v2.html node app/test/v2-s16.mjs` | v2-s16: all passed |
| v2-checks-2 16 | 0 | 32s | `PAGE=app/dist/v2.html node app/test/v2-s2.mjs` | v2-s2: all passed |
| v2-checks-2 17 | 0 | 72s | `PAGE=app/dist/v2.html node app/test/v2-s33.mjs` | v2-s33: all passed |
| v2-checks-2 18 | 0 | 26s | `PAGE=app/dist/v2.html node app/test/v2-wnew.mjs` | v2-wnew: all passed |
| v2-checks-2 19 | 0 | 102s | `PAGE=app/dist/v2.html node app/test/v2-q83.mjs` | v2-q83: all passed |
| v2-checks-2 20 | 0 | 177s | `PAGE=app/dist/v2.html node app/test/v2-q84.mjs` | v2-q84: all passed |
| v2-checks-2 21 | 0 | 23s | `PAGE=app/dist/v2.html node app/test/v2-q16.mjs` | v2-q16: all passed |
| v2-checks-2 22 | 0 | 43s | `PAGE=app/dist/v2.html node app/test/v2-q17.mjs` | v2-q17: all passed |
| v2-checks-2 23 | 0 | 43s | `PAGE=app/dist/v2.html node app/test/v2-q22.mjs` | v2-q22: all passed |
| v2-checks-2 24 | 0 | 61s | `PAGE=app/dist/v2.html node app/test/v2-q19.mjs` | v2-q19: all passed |
| v2-checks-2 25 | 0 | 85s | `PAGE=app/dist/v2.html node app/test/v2-q18.mjs` | v2-q18: all passed |
| v2-checks-2 26 | 0 | 43s | `PAGE=app/dist/v2.html node app/test/v2-q14.mjs` | v2-q14: all passed |
| v2-checks-2 27 | 0 | 30s | `PAGE=app/dist/v2.html node app/test/v2-q23.mjs` | v2-q23: all passed |
| v2-checks-2 28 | 0 | 5s | `PAGE=app/dist/v2.html node app/test/v2-t1rules.mjs` | v2-t1rules: all passed |
| v2-checks-2 29 | 0 | 17s | `PAGE=app/dist/v2.html node app/test/v2-cxev.mjs` | v2-cxev: all passed |
| v2-checks-2 30 | 0 | 5s | `PAGE=app/dist/v2.html node app/test/v2-oddaddr.mjs` | v2-oddaddr: all passed |
| v2-checks-2 31 | 0 | 21s | `LT_ALERT=1 PAGE=app/dist/v2.html node app/test/v2-longtask.mjs` | v2-longtask: all passed |
| v2-checks-2 32 | 0 | 29s | `PAGE=app/dist/v2.html node app/test/v2-post-doc.mjs` | ALL PASS |
| v2-checks-2 33 | 0 | 62s | `PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs` | v2-unbounded: none outside the named exception across 29 pages |
| v2-checks-2 34 | 0 | 3s | `PAGE=app/dist/v2.html node app/test/v2-sixof.mjs` | v2-sixof: all passed |
| v2-checks-2 35 | 0 | 3s | `PAGE=app/dist/v2.html node app/test/v2-shown-score.mjs` | v2-shown-score: all passed |
| v2-checks-2 36 | 0 | 7s | `PAGE=app/dist/v2.html node app/test/v2-ckwin.mjs` | v2-ckwin: all passed |
| v2-checks-2 37 | 0 | 3s | `PAGE=app/dist/v2.html node app/test/v2-paste.mjs` | v2-paste: all passed |
| v2-checks-2 38 | 0 | 3s | `PAGE=app/dist/v2.html node app/test/share-fz.mjs` | share-fz: all passed |
| v2-checks-2 39 | 0 | 13s | `PAGE=app/dist/v2.html node app/test/data-swap.mjs` | data-swap: all passed |
| v2-checks-2 40 | 0 | 29s | `PAGE=app/dist/v2.html node app/test/forms-contrast.mjs` | forms-contrast: all passed |
| v2-checks-2 41 | 0 | 91s | `PAGE=app/dist/v2.html node app/test/tap-size.mjs` | tap-size: all passed |
| v2-checks-2 42 | 0 | 0s | `node app/test/tokens-doc.mjs` | tokens-doc: up to date (769 tokens) |
| v2-checks-2 43 | 0 | 0s | `node app/test/perf-docs.mjs` | perf-docs: behaviour fixture "meta/perf" has 7 of 7 perf.json parts; built doc has 7 |
| v2-checks-2 44 | 0 | 0s | `node app/test/test-ids.mjs` | test-ids: 487 tests, every ID unique inside its group |
| v2-checks-2 45 | 0 | 27s | `node app/build.mjs --v2 --preview-data --split && node app/test/v2-split.mjs` | v2-split:all passed |
| v2-checks-2 46 | 0 | 24s | `node app/test/v2-public.mjs` | v2-public: all passed |
| v2-checks-2 47 | 0 | 13s | `node app/test/seo-check.mjs` | seo-check: ALL PASSED |
| v2-checks-2 48 | 0 | 0s | `node app/test/prerender-test.mjs` | prerender-test: all passed |
| v2-checks-2 49 | 0 | 0s | `node experiments/public-build-test.mjs` | PASS PUB-6: {"gatedBehindPublic":true} |
| v2-checks-2 50 | 1 | 27s | `node experiments/pokemon-pages-test.mjs` | pokemon-pages-test: 1 failed |
| v2-checks-2 51 | 0 | 4s | `node experiments/static-pages-test.mjs` | static-pages-test: all passed |
| v2-checks-2 52 | 0 | 0s | `node experiments/feedback-worker-test.mjs && node experiments/feedback-guard-test.mjs` | (Use `node --trace-warnings ...` to show where the warning was created) |
| v2-checks-2 53 | 0 | 62s | `node experiments/count-worker-test.mjs && node experiments/teamcheck-count-test.mjs` | teamcheck-count-test: all passed |
| v2-checks-2 54 | 0 | 26s | `node experiments/turnstile-page-test.mjs` | turnstile-page-test: all passed |
| v2-checks-2 55 | 0 | 37s | `node experiments/pub-links-test.mjs` | pub-links-test: all passed |
| v2-checks-2 56 | 0 | 0s | `node experiments/security-csp-test.mjs --self-test` | security-csp-test --self-test: PASS (positive + 2 negative assertions verified) |
| v2-checks-2 57 | 0 | 8s | `node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public && node experiments/security-csp-` | security-csp-test: PASS (4 hashed inline scripts, static pages pokemon.html + 404.html, 0 CSP violat |
| v2-checks-2 58 | 0 | 12s | `node experiments/public-dataready-test.mjs` | public-dataready-test: all passed |
| v2-checks-2 59 | 0 | 83s | `node app/build.mjs --v2 --split --split-routes --one-art-size --art=../src/v2/art/ --public && node experiment` | split-routes-cross-test: all passed |
| v2-checks-2 60 | 0 | 19s | `node experiments/privacy-public-test.mjs` | privacy-public: all passed |
| v2-checks-2 61 | 0 | 58s | `node app/build.mjs --v2 && node experiments/v2-words.mjs` | v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none) |
| v2-checks-2 62 | 0 | 7s | `node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/a11y-code.mjs` | PASS A11Y-6: {"exists":true,"ariaLive":null} |
| v2-checks-2 63 | 0 | 25s | `node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs` | v2-saved: all passed |
| v2-minors:main1 3 | 0 | 3s | `node app/build.mjs --v2 --preview-data` | built dist/v2.html (4317 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| v2-minors:main1 4 | 0 | 698s | `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | v2-minors (main1):all passed |
| v2-minors:main2 3 | 0 | 3s | `node app/build.mjs --v2 --preview-data` | built dist/v2.html (4317 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| v2-minors:main2 4 | 1 | 468s | `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | v2-minors (main2):1 failed |
| v2-minors:groups 3 | 0 | 3s | `node app/build.mjs --v2 --preview-data` | built dist/v2.html (4317 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| v2-minors:groups 4 | 1 | 521s | `PART=groups PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | v2-minors (groups):2 failed |
| behaviour-v2:A-team 2 | 0 | 3s | `node app/build.mjs --v2 --art=../src/v2/art/` | built dist/v2.html (3079 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| behaviour-v2:A-team 3 | 0 | 836s | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` | behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 836s  (adapter v2) |
| behaviour-v2:A-team 4 | 1 | 641s | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` | v2-overlap: 11 findings, 0 known, 11 new (27 pages x 4 widths x 2 themes; 642s) |
| behaviour-v2:A-team 5 | 0 | 15s | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` | tap-once: all pass |
| v2-checks 4 | 0 | 2s | `node app/test/v2-guard.mjs` | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scal |

Notes on run 1:
- v2-checks part 1 was stopped after its first step (guard 0) to save time. GitHub ran it: green.
- Both v2-minors failures are **local-only**:
  - main2 "Item pictures in Search (stand-ins) … a working one img-dead".
  - groups "HQ Q13f … 14 hero pictures didn't load" and "HQ Q7a … loaded:false".
  - Cause: a fresh worktree has no app/dist/art or art-s (HH's checkout has them as symlinks to app/src/v2/art).
  - A fresh design6 58137089 build here gives the same "art/445.webp … 0" result.
  - Rerun on 1fda4d7e with dist/art and dist/art-s linked to the worktree's own app/src/v2: main2 "v2-minors (main2):all passed", groups "v2-minors (groups):all passed".

## Local run 2, batch6 after the fixes (1fda4d7e = code of 074c0f36), every step, exit code

| # | exit | time | command | last line |
|---|---|---|---|---|
| 0 | 0 | 2s | `node app/test/v2-guard.mjs` | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours |
| 1 | 0 | 3s | `node app/test/no-names.mjs && node app/build.mjs --v2 --preview-data && node app/test/no-names.mjs app/dist/v2.html` | no-names: 2182 player fields checked, 0 not an ID or stand-in |
| 2 | 0 | 272s | `PAGE=app/dist/v2.html node app/test/v2-q72.mjs` | v2-q72: all passed |
| 3 | 0 | 30s | `PAGE=app/dist/v2.html node app/test/v2-q23.mjs` | v2-q23: all passed |
| 4 | 0 | 0s | `node app/test/tokens-doc.mjs` | tokens-doc: up to date (769 tokens) |
| 5 | 0 | 27s | `node app/build.mjs --v2 --preview-data --split && node app/test/v2-split.mjs` | v2-split:all passed |
| 6 | 0 | 25s | `node app/test/v2-public.mjs` | v2-public: all passed |
| 7 | 0 | 13s | `node app/test/seo-check.mjs` | seo-check: ALL PASSED |
| 8 | 0 | 0s | `node app/test/prerender-test.mjs` | prerender-test: all passed |
| 9 | 0 | 0s | `node experiments/public-build-test.mjs` | PASS PUB-6: {"gatedBehindPublic":true} |
| 10 | 0 | 27s | `node experiments/pokemon-pages-test.mjs` | pokemon-pages-test: all passed |
| 11 | 0 | 4s | `node experiments/static-pages-test.mjs` | static-pages-test: all passed |
| 12 | 0 | 0s | `node experiments/feedback-worker-test.mjs && node experiments/feedback-guard-test.mjs` | (Use `node --trace-warnings ...` to show where the warning was created) |
| 13 | 0 | 58s | `node experiments/count-worker-test.mjs && node experiments/teamcheck-count-test.mjs` | teamcheck-count-test: all passed |
| 14 | 0 | 25s | `node experiments/turnstile-page-test.mjs` | turnstile-page-test: all passed |
| 15 | 0 | 36s | `node experiments/pub-links-test.mjs` | pub-links-test: all passed |
| 16 | 0 | 0s | `node experiments/security-csp-test.mjs --self-test` | security-csp-test --self-test: PASS (positive + 2 negative assertions verified) |
| 17 | 0 | 7s | `node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public && node experiments/security-csp-test.mjs` | security-csp-test: PASS (4 hashed inline scripts, static pages pokemon.html + 404.html, 0 CSP violations, 0 ex |
| 18 | 0 | 12s | `node experiments/public-dataready-test.mjs` | public-dataready-test: all passed |
| 19 | 0 | 82s | `node app/build.mjs --v2 --split --split-routes --one-art-size --art=../src/v2/art/ --public && node experiments/split-ro` | split-routes-cross-test: all passed |
| 20 | 0 | 20s | `node experiments/privacy-public-test.mjs` | privacy-public: all passed |
| 21 | 0 | 58s | `node app/build.mjs --v2 && node experiments/v2-words.mjs` | v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none) |
| 22 | 0 | 7s | `node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/a11y-code.mjs` | PASS A11Y-6: {"exists":true,"ariaLive":null} |
| 23 | 0 | 24s | `node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs` | v2-saved: all passed |
| 24 | 0 | 3s | `node app/build.mjs --v2 --art=../src/v2/art/` | built dist/v2.html (3079 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files) |
| 25 | 0 | 842s | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` | behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 842s  (adapter v2) |
| 26 | 0 | 641s | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` | v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 641s) |
| 27 | 0 | 15s | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` | tap-once: all pass |
| 28 | 0 | 5s | `node experiments/strength-invariants.mjs` | PASS J11-5: {"n":30,"bad":0} |
| 29 | 0 | 0s | `node app/build.mjs` | slim: 3505 KB -> 3045 KB (dead CSS 195 KB: 284 rules, 343 selectors; short prefix 173 KB; never-used old rules |
| 30 | 0 | 177s | `node app/test/run.mjs` | ALL PASSED |
| 31 | 0 | 5s | `node experiments/threat-check.mjs` | PASS |
| 32 | 0 | 5s | `node experiments/lead-logic.mjs` | ALL PASSED |
| 33 | 0 | 65s | `node experiments/golden.mjs` | 10 of 10 known-answer cases pass |
| 34 | 0 | 27s | `node app/test/v2-today.mjs` | v2-today: all passed (27 s) |
| 35 | 0 | 9s | `node experiments/public-site-test.mjs` | public-site-test: all passed |
| 36 | 0 | 0s | `node app/build.mjs` | slim: 3505 KB -> 3045 KB (dead CSS 195 KB: 284 rules, 343 selectors; short prefix 173 KB; never-used old rules |
| 37 | 0 | 162s | `node experiments/accuracy-gate.mjs` | GATE PASSED |

- Rows 0-26 use frozen out/. Rows 27-37 are data-checks + accuracy-gate on today's out/. Row 26 is strength-invariants (frozen, from the code-tests job).
- Every step exited 0.
- Not run locally (GitHub ran them, green): v2-checks part 1's other steps, behaviour B/C/D groups, WebKit A-team, quality-v2, the rest of the code-tests job, live audits.

## Unsure / not checked

- The night panel on a real iPhone or Windows screen (Sim's eye): not checked.
- Whether GitHub's v2-minors gets sprites the way HH's symlinks do: not checked. GitHub's v2-minors main2 and groups are green on 074c0f36.
