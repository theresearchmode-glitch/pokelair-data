# Job W: public pages' words in their static HTML — WIP, PAUSED (HH's priority change to Job X), Thu Nov 26, 2026
HH's helper. Branch alt/prerender-home, on origin/alt/day-batch3 76515304. Nothing merged, published or deployed.

## Where it stopped
The work is done and checked except for one last screenshot run.
- **Stopped during:** that run (r6/r7, "animations settled" screenshots) was killed before it finished.
- **Not done:**
  - the run against the front-page proposals A/B;
  - merging design6 in.

## What it does (committed)
**c039f91e**:
- **shell.js V2.preBlock(route):** ONE writer for every page.
  - It builds `<section class="vh" data-v2pre>`: an h1, an intro, the main links, and for Home and Ratings the top 10 as /pokemon/ links.
  - Words come from the page's own `V2.pages[route].seo()` if it has one, else its SEO title and description (seo-titles-draft.md).
- **home.js V2.pages.home.seo():** reads the drawn h1 and the line under it. That is The Stampede's `.sdh-say`, or `.k-lead` / `.ph-b-lead` for the public-home proposals.
- **build.mjs (--public only):**
  - opens the page once with the day's out/ data (DOC_SOURCES + perfDoc, the same documents public-site.mjs publishes);
  - waits for Home's first real draw;
  - writes each block into the static #main of index.html and the 23 tool pages, beside today's loading panel.
  - v2.html, 404 and the Pokémon pages are unchanged.
- **Why visually hidden:** before the script runs the screen is exactly today's (the loading panel), and the first draw replaces #main as before. So there is no flash and no jump.
  - The trade-off: people without JavaScript still see only the loading panel. Search engines and link previews read the words.

**bcec9330**:
- app/test/prerender-test.mjs, the no-JS check on /, /team and /meta: one h1 with real words outside scripts, an intro, 5+ page links, the top 10 links, and the block inside #main.
- The same check added to test.yml after seo-check.

**9f284931**, **needs HH's yes** (a test changed):
- experiments/pokemon-pages-test.mjs required index.html === v2.html byte for byte.
- Now it is "v2.html plus exactly one data-v2pre block".
- The changed check still fails without the block: it printed "FAIL index.html is the same page as v2.html plus Home's static words (... 0 word block)" on today's build.

## Checks so far
- **The no-JS test fails on today's build:** day-batch3 76515304, public build, prints "prerender-test: 14 failed" (0 h1 outside scripts on /, /team, /meta).
- **The same test passes with the change:** "prerender-test: all passed". The static h1s are:
  - "The Pokémon Champions coach Sharply raise your win rate."
  - "Team Rater: Strength Score for your team"
  - "Pokémon Champions Tier List & Ratings"
- **GitHub's order on frozen data 0c992f69** (each exit 0 unless noted):
  - v2-public "all passed"
  - seo-check "ALL PASSED"
  - prerender-test "all passed"
  - public-build-test PASS
  - pokemon-pages-test: 1 failed before the test change above, "all passed" after it
  - static-pages-test "all passed"
  - pub-links-test "all passed"
  - security-csp-test --self-test PASS
  - the --split public build, then security-csp-test "PASS (4 hashed inline scripts ... 0 CSP violations ...)", seo-check "ALL PASSED", prerender-test "all passed"
- **With JS, today's site vs new site** (both built by public-site.mjs from main 03cd5e41's out/; /, /team, /meta × 390/1440 × light/dark):
  - **#app DOM after load: identical** in all 12 cases.
  - **The data-v2pre block is gone** after the first draw in all 12.
  - **With JS off, the first screens are pixel-identical** (0 changed px) in all 12.
  - **CLS is identical to today's:**

    | Page | 390 | 1440 |
    |---|---|---|
    | / | 0.0406 | 0.0434 |
    | /team | 0.0321 | 0.0710 |
    | /meta | 0.0185 | 0.0704 |

    So the change adds 0. But today's own CLS is over HH's 0.02 target. The sources (layout-shift entries at about 1.25 s, after the first draw):
    - Home: .sdh-front, .sdh-ledge and .sdh-plates settling;
    - My Team: .mtf-inf, .mtf-ia, the np-link;
    - Ratings: .ra-spotw, .gs-sinfo.

    This is pre-existing and visible, not fixed here.
  - **Screenshots after load** (reduced motion):
    - 0 changed px in 11 of 12 cases.
    - /meta at 390 showed about 335 px changed in one theme per run (light in one run, dark in another), always the same 35x39 px spot at the #5 plate's sprite edge, with an identical DOM.
    - With motion on, / at 390 differed in the translucent bottom phone bar (it blurs the moving hero behind it).
    - Base vs base runs showed 0 once each, so whether these are noise is **not settled**. The "animations finished + images decoded" run that would settle it was the one killed.

## To finish (when resumed)
1. Re-run t-scripts/cmp.cjs with SETTLE=1, for base vs new and base vs base, 3 times each.
2. Check A/B: merge alt/public-home-v1 in a scratch worktree, build with --home=a/b, run prerender-test.
3. Merge design6 in when day-batch3 lands there.
4. Write the final report.
