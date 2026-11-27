# batch9 (Job II), Fri Nov 27, 2026, 1:34 AM

**Code branch:** alt/batch9, tip **50abdee8**, pushed with [skip ci]. HH gives it the real GitHub run after the switch.
It is built on origin/alt/batch8 7f4b1b9a.
50abdee8 has the same tree as a41a712a, the tree every local step below ran on (tree 9a46c32b).

## What's in it (merged in this order)
| commit | what | conflicts |
|---|---|---|
| 1558561d | merge origin/alt/maggi-m2-f3fixes bcbcad56 (F3-4..7, HOME-06 Battle check) | none: git merged pubhome-f3.js, v2-minors.mjs and A-team.mjs by itself |
| 70bbb4da | merge origin/alt/maggi-m3-f3cleanup 70ff358e (F3-8..10, V2.f3Seo removed, V2._f3 keyed on the regulation) | none: pubhome-f3.js and v2-minors.mjs merged by themselves |
| a41a712a | merge origin/alt/helper-dec2patch fc49e36d (apply-dec2-patch.mjs + test, md-roster-step step 8, test.yml step) | none |
| 50abdee8 | merge origin/claude/design6 ee87a267 (batch8 merged; it moved during the run) | none, and no file changes (design6's tree = batch8's) |

**Both sides kept (checked by reading the merged diff):**
- Maggi's lines touch different lines from batch8's, so nothing overlaps.
  - Maggi's code changes: f3Rate, the evReg fallback, f3Link, the lead's "against N teams", the f3Data cache key, and f3Seo removed.
  - Her test changes: F3-4..10, added after F3-3 in v2-minors main2.
- batch8's `.nw` span in V2.f3Words is still there (grep: 1 hit in pubhome-f3.js).
- batch8's tap areas and h1 size are CSS, which neither Maggi branch touches.
- batch8's PS-1/PS-2 checks stay in v2-minors.
- Nothing else used V2.f3Seo (`git grep f3Seo -- ':!docs'`: only F3-10, which checks that it's gone).

## Maggi's new checks fail first (batch8 code + batch9's v2-minors.mjs, PART=main2, frozen out/)
Result: `v2-minors (main2):5 failed`, exit 1. The failing lines:
- **F3-4:** `{"reg":"M-D","evReg":"","old":false,"meta":"Winning team · ValkrixVGC Champion...`. It should read "The last Reg M-C winning team".
- **F3-5:** the hrefs on the Claude build are `"/pokemon/camerupt-mega"`... They should be `#pokemon=`.
- **F3-6:** `"Add your six. NastyPlot rings it up out of 100 against 0 real tournament teams..."`.
- **F3-7:** an unrated Beedrill gets `unRate: 9`; it should be null.
- **F3-10:** `aReg "M-C"` after Dec 2 from the stale cache, and `seo "function"`.
- **F3-8 (contrast) and F3-9 (fold) pass on batch8 too.** They guard what is already true, so they are not fix checks.
- **HOME-06 also passes on batch8:** `A-team --only=HOME-06` gave `1 pass`. The M2 change makes the empty-team check stricter
  (it also needs Battle), and batch8 already shows Battle, so this check could not fail there.
On batch9 every F3-4..10 line passes (minors-main2 below).

## Local run on a41a712a, frozen out/ 0c992f69, one step at a time (step | exit | time | last line)
```
build-pd | 0 | 4s | built dist/v2.html (4323 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)
minors-groups | 0 | 526s | v2-minors (groups):all passed
minors-main2 | 0 | 608s | v2-minors (main2):all passed
minors-main1 | 0 | 704s | v2-minors (main1):all passed
qcheck | 0 | 1302s | qcheck-all: 28 pages + 11 views x 5 widths x 2 themes, 45 findings, 0 new; 1299s
guard | 0 | 3s | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)
q72 | 0 | 335s | v2-q72: all passed
q23 | 0 | 31s | v2-q23: all passed
q19 | 0 | 69s | v2-q19: all passed
unbounded | 0 | 63s | v2-unbounded: none outside the named exception across 29 pages
build-art | 0 | 4s | built dist/v2.html (3084 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)
A-team | 0 | 886s | behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 886s  (adapter v2)
D-meta-shell | 0 | 479s | behaviour: 118 pass, 0 FAIL, 41 known bugs, 0 fixed?, 7 skipped; 479s  (adapter v2)
overlap | 0 | 645s | v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 644s)
tap-once | 0 | 16s | tap-once: all pass
pub00-v2-public | 0 | 26s | v2-public: all passed
pub01-seo | 0 | 15s | seo-check: ALL PASSED
pub02-prerender | 0 | 0s | prerender-test: all passed
pub03-public-build | 0 | 0s | PASS PUB-6: {"gatedBehindPublic":true}
pub04-pokemon-pages | 0 | 29s | pokemon-pages-test: all passed
pub05-static-pages | 0 | 5s | static-pages-test: all passed
pub06-feedback | 0 | 0s | ALL PASSED (44)
pub07-count | 0 | 62s | teamcheck-count-test: all passed
pub08-turnstile | 0 | 27s | turnstile-page-test: all passed
pub09-pub-links | 0 | 38s | pub-links-test: all passed
pub10-csp-self | 0 | 1s | security-csp-test --self-test: PASS (positive + 2 negative assertions verified)
pub11-csp | 0 | 9s | security-csp-test: PASS (4 hashed inline scripts, static pages pokemon.html + 404.html, 0 CSP violations, 0 external requests, 0 cookies, XSS blocked)
pub12-dataready | 0 | 13s | public-dataready-test: all passed
pub13-split-routes | 0 | 101s | split-routes-cross-test: all passed
pub14-privacy | 0 | 23s | privacy-public: all passed
pub15-words | 0 | 59s | v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none)
pub16-a11y | 0 | 7s | PASS A11Y-6: {"exists":true,"ariaLive":null}
pub17-saved | 0 | 27s | v2-saved: all passed
pub18-guard | 0 | 3s | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)
pub19-tokens | 0 | 0s | tokens-doc: up to date (769 tokens)
pub20-test-ids | 0 | 0s | test-ids: 487 tests, every ID unique inside its group
apply-dec2-patch-test | 0 | 1s | apply-dec2-patch-test: ALL 29 PASSED
rules-fixes | 0 | 3s | 14/14 passed (dist/page.html)
run-mjs | 0 | 183s | ALL PASSED
md-roster-step-test | 0 | 85s | md-roster-step-test: ALL PASSED
syntax | 0 | 13s | syntax-check: all 429 scripts parse
```

The steps match batch8's list (Job FF): minors x3, qcheck-all, guard, q72/q23/q19, unbounded, A-team, D-meta-shell, overlap, tap-once
(Chromium), and the public chain 0-20. Added: apply-dec2-patch-test, rules-fixes-test, app/test/run.mjs, md-roster-step-test and
syntax-check.
- qcheck: "45 findings, 0 new", the same as batch8.
- A-team "139 pass" and D-meta-shell "118 pass", the same as batch8.

## Not checked
- GitHub's run ([skip ci], as asked).
- WebKit A-team / tap-once (GitHub runs them).
- Behaviour groups B and C (the GitHub matrix).
- No pictures: the merged branches are logic and test changes, with no visual change.
