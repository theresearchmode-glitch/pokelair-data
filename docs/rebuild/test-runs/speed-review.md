# Speed review: Kip's jobs 57 and 58 (Job AA), Thu Nov 26, 2026, 1:51 PM Eastern (now.sh)
HH's helper. I reviewed:
- alt/gemini-speed-fix1 **c540120c** (job 57)
- alt/gemini-split-routes **e6504b08** (job 58, on top of 57)
- base for both: day-batch3 **76515304**

Fixes are on **alt/speed-review**, on e6504b08, each with a test that failed first. Nothing merged, published or deployed.

## Verdict, short
- **Job 57: correct, but almost no gain on the real site.** `public-site.mjs` already builds with `--item-files`, so on the deploy the item pictures were already files: v2.js is 2,098,930 bytes before and after.
  - Kip's "before" (LCP 11.5 s) was a test build without `--item-files`. The real site was about 5.3 s.
  - What 57 changes on the deploy: index.html 961,873 → 118,351 bytes (shared /v2.css). The first visit is about the same; later visits reuse the cached CSS.
- **Job 58: the real gain (about −0.6 s LCP, −110 KB on every app page), but it broke 10 things.** Nine were crashes in pages and clicks whose helper lives in another page's file, plus the lost feedback links. All 10 are fixed on alt/speed-review (below), with the same speed.

## speed-check (Kip job 55's app/test/speed-check.mjs; 390x844, 4x CPU, Fast 3G)
Measured on the folder `public-site.mjs` deploys, with main 03cd5e41's out/. Each cell is LCP / transfer.

| Page | base 76515304 | job 57 | job 58 | speed-review fix |
|---|---|---|---|---|
| / | 5339 ms / 1076 KB | 5223 / 1076 | 4622 / 949 | **4610 / 955** |
| /pokemon | 1702 / 266 | 1685 / 266 | 1696 / 266 | 1698 / 266 |
| /pokemon/garchomp | 5266 / 1032 | 5240 / 1032 | 4681 / 920 | **4653 / 921** |
| /pokemon/incineroar | 5209 / 1025 | 5227 / 1025 | 4638 / 914 | 4653 / 914 |
| /pokemon/absol-mega | 5243 / 1030 | 5283 / 1030 | 4654 / 919 | 4659 / 919 |
| /natures | 5054 / 1005 | 5058 / 1005 | 4422 / 887 | 4410 / 887 |
| /sets | 5074 / 1005 | 5112 / 1005 | 4523 / 888 | 4487 / 889 |
| /meta | 5079 / 1005 | 5173 / 1005 | 4526 / 892 | 4511 / 893 |
| /gifts | 5124 / 986 | 5039 / 986 | 4435 / 884 | 4416 / 884 |
| /team | 5286 / 1113 | 5288 / 1102 | 4544 / 884 | 4552 / 903 |

- CLS is 0 everywhere.
- Every version prints "speed-check: 9 FAILED": the 2.5 s LCP budget is still far off. v2.js is 540 KB gzip on job 58.
- One fix attempt was slower, and I changed it:
  - The first try loaded every other page's file as soon as the page drew. Pokémon pages went 4681 → 5575 ms, because the extra files shared the line with the big picture.
  - Now they load 4 s after the page's load event.

## What breaks with job 58 (exact steps; experiments/split-routes-cross-test.mjs, each case opened cold)
**Steps:** open the public site at the address, wait for it to draw, then:
1. **/build** → click a core's "Teams with It" → `Cannot set properties of undefined (setting 'f')` (V2.wtUi is in Winning Teams' file).
2. **/build** → a result's "Compare ›" → `V2.cxGo is not a function`.
3. **/winning-teams** → "Set as Opponent" → `V2.btSetOpp is not a function`.
4. **/events** → open the placings → **"This page didn't load"** (`V2.wtCard is not a function`).
5. **/events** → "Set as Opponent" in the placings → same.
6. **/test-run** → "Battle this team" → `V2.btSetOpp is not a function`.
7. **/this-week**: just opening it → **"This page didn't load"** (`V2.ticket is not a function`).
8. **/** → News → the next-event calendar → `Cannot set properties of undefined (setting 'open')`.
9. **/battle** → "Their six" → type "Gar" → `V2.buildHits is not a function`.
10. **/pokemon/garchomp**: **"Report a Mistake" and the footer's "Send Feedback" are missing.** V2.FB lives in feedback.js's file, and the page checks `V2.FB && V2.FB.ok`.

**Results:**
- On e6504b08: "split-routes-cross-test: 10 failed".
- The same clicks pass on job 57 (no split): 11 of 11 (the earlier 11-case version; case 10 was added later).
- Search → "Build Around a Core" and "7 pages by the menu, no reload" passed on both.
- **Also not covered anywhere in CI before this:** test.yml builds the public site without `--split-routes`, so no GitHub check ever opened a split page. Only public-site-test builds the deploy folder, and it checks files, not pages.

## The fix (alt/speed-review; code only, no visible change)
1. **app/build.mjs works out each page file's dependencies from the code itself:**
   - For each route file, it lists the other route files whose `V2.<name>` it uses and the main script doesn't define. This is `window.__NP_RDEPS`, written next to `__NP_ROUTES`.
   - A use that is only checked (`V2.x && …`, `V2.x ? …`) is not a dependency.
   - Today: battle→build; gauntlet→battle; build→compare, tournaments; events→battle, tournaments; tournaments→battle; weekly→archetypes, events; feedback→pokemon.
2. **shell.js `V2.loadRoute`** loads a page's file and its dependencies' files (each fetched once), then draws.
   - `V2.warmRoutes` fetches the remaining files 4 s after the load event.
   - `V2.needRoute(page, fn)` runs a main-script click after the file it needs has arrived. It runs at once when there are no route files, so the Claude build is unchanged.
   - Wired into: Home's Set as Opponent, My Team's saved-team Compare (×2), the box toast, the News calendar, and Search's Build Around a Core.
3. **`V2.FB = V2.FB || {ok: !!window.__NP_PUBLIC}`** in shell.js, so the feedback links draw from the first draw on the public site. feedback.js replaces the object when it runs.
4. **Tests:**
   - **experiments/split-routes-cross-test.mjs** (12 cases) went from "10 failed" (e6504b08) to **"all passed"**.
   - The same test was added to test.yml after the security-csp step, with its own `--split-routes` public build.

## Public test list (alt/speed-review)
**After a `--split --split-routes` public build:** all exit 0.
- seo-check: ALL PASSED
- pokemon-pages: all passed
- static-pages: all passed
- pub-links: all passed
- public-build-test: PASS
- security-csp: PASS, "4 hashed inline scripts … 0 CSP violations"
- split-routes-cross-test: all passed

**GitHub's order:** each exit 0.
- v2-public, then seo-check, public-build, pokemon-pages, static-pages, pub-links;
- security-csp --self-test;
- the `--split` build, then security-csp;
- the `--split-routes` build, then split-routes-cross-test;
- privacy-public;
- public-site-test on today's data ("all passed", v2.js 420 KB brotli).

On frozen data, public-site-test failed its no-names check on teams.json. In CI that check only runs on today's data, so this is not from these changes.

Final run of the whole list on the finished branch: the same results.
- In my order B, split-routes-cross-test said "no --split-routes build". pub-links-test, which runs before it, rebuilds app/dist itself without the flag.
- In GitHub's order (the step I added builds right before the test) it passed: "split-routes-cross-test: all passed".
- public-site-test (today's data): "all passed".
- On the deploy folder after the fix, vis.cjs: "fix failing 0" (28 runs).

## Visual + interaction pass (t-scripts/vis.cjs)
- **Steps:** /pokemon/garchomp, Search "Garchomp", an item sheet from Garchomp's page, My Team, an item sheet from My Team (the sample six with held items), Build, Gifts.
- **Sizes:** 390 and 1440, light and dark, on the deploy folder. That is 28 runs per version.
- **What fails a run:** a page error, a failed request (except the Worker's /api/count, which doesn't exist locally), a broken visible image, or a step that couldn't be done.

| Version | Failing runs |
|---|---|
| base | 0 of 28 |
| job 57 | 0 of 28 |
| fix | 0 of 28 |

- **base vs job 57 pixels:**
  - 25 of 28 identical.
  - team-1440-dark showed 2,450 px and teamitem-1440-dark 804 px, both on a sprite's anti-aliasing. Looked at side by side: the same picture.
  - teamitem-390-light: 1 px.
- **base vs fix pixels:** not compared. The fix only changes when files load, and its 28 runs have no errors and no broken images.
- **Not done:** WebKit, keyboard, the behaviour suites (for the Claude build, `V2.needRoute` runs the click at once, as before, by code).

## Notes for HH
- **Job 57's report overstates its gain.** On the real deploy it is only the shared /v2.css. Its item-file change matters only to builds without `--item-files`, which is the CI test build.
- **public-site.mjs counts files twice:** it now prints "1107/1129 files" where the folder has 941/963, because the build also copies art/items. Harmless: the folder is the same. But the 20,000-file guard counts wrong.
- **Remaining risk after the fix:** a page file that fails to download still shows "This page didn't load" (as before).
- **Two main-script uses are checked and silently skip when the file isn't there yet:** shell.js:243 opening an archetype guide and shell.js:244 pre-filling Winning Teams from a search term. With warmRoutes they work from about 4 s after load.
