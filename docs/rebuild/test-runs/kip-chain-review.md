# Job JJ: independent code review of Kip's speed chain (report only)

HH's helper, Fri Nov 27, 2:53 AM (clock: docs/rebuild/now.sh).
- **Reviewed:** origin/alt/gemini-deploy-smoke **eb89d52e** (jobs 64c, 65, 66, 67, 68, 69, 70).
- **Base, checked:** its merge-base with origin/claude/design6 (ee87a267) is **99e172ba**, not ba95fd61. `git merge-base --is-ancestor ba95fd61 eb89d52e` says no. So the chain predates the slogan/HOME-01/HOME-06 commit.
- **Diff read:** `git diff 99e172ba eb89d52e`, 36 files. No code changed; nothing pushed except this report.

## Verdict
**Not ready to merge: 4 must-fix items.**
- M1-M3 are bugs on the public build only, each proven by running it.
- M4 is an existing test that goes red.
- Also: 1 fix-after (Claude build) and some minor notes.
- After the fixes, the test merge with design6 is clean apart from one small conflict (resolved below).

## Must fix before merge
**M1. A failing page file loads forever** (public build; regression in app/src/v2/shell.js `V2.loadRoute`, line 652).
- Kip changed the early return from `if (V2.pages[r] && set.every(...))` to `if (set.every(k => ... done))`.
- When a chunk fails, its `.catch` puts in an error page and calls V2.draw. V2.draw calls loadRoute again, which no longer returns early, so it fetches again, forever.
- Proof (public site served locally, Playwright, `/routes/calc.js` made to fail, then `#calc` opened):
  - design6: `1 requests in 4 s ... main: PAGE · DIDN'T LOAD This page didn't load.`
  - chain: `1910 requests in 4 s, 1910 script tags ... main: Getting today's numbers…`
  - Same with `/routes/team.js`: `1745 requests in 4 s`.
- On a phone with a dropped connection this is a request storm, and the page never says it failed.
- Fix: keep design6's `V2.pages[r] &&` condition, or stop after one failure. Then add a split-routes-cross-test case that blocks one chunk and expects the "didn't load" notice.

**M2. An ability or item button loops forever if `info-text` doesn't arrive** (job 65, app/src/v2/pages/infosheet.js:31 `V2.openInfo`).
- `V2.needRoute` runs its callback on failure too (`.then(fn, fn)`). The callback is `V2.openInfo`, which finds INFO_TEXT still missing and asks again.
- Proof (`/pokemon/garchomp`, `/routes/info-text.js` failing, one tap on the ability):
  - `1999 requests in 4 s, 1999 script tags, sheet open false`.
  - design6: the sheet opens, because info-text is in the main file there.
- Fix: on failure, open the sheet with ABIL / item text, or show a toast. Never call openInfo again from the failure path. (Search's info-text path made 1 request and did not loop.)

**M3. Returning visitors see the sample team on the first screen, with its Strength Score** (job 64, the prerendered tool pages).
- The first screens are drawn at build time in a fresh browser, so they show the sample team "Sun Tailwind (sample)", score 92. V2.draw keeps that screen until /data/*.json arrives.
- A visitor with their own team saved on the device (localStorage cc2.state) sees the sample's team and grade first.
- Proof (`/team`, own six Pikachu/Snorlax/Gengar/Dragonite/Tyranitar/Gardevoir, /data delayed 3 s):
  - 0.6 s in: `{"h":"Sun Tailwind (sample)","score":"92","six":"Charizard Y,Whimsicott,Basculegion,Kingambit,Garchomp,Sneasler","pre":true}`
  - after the data: `{"h":"My Own Team","score":"35","six":"Pikachu,Snorlax,Gengar,Dragonite,Tyranitar,Gardevoir","pre":false}`
- The same check on other pages, at 0.7 s in:
  - Sample names on screen and none of the visitor's: /box, /compare (also /team).
  - Sample names only: /build, /practice, /calc. These still show sample names after the data arrives too, so those may be the page's own content. Not judged.
  - Neither sample nor own names: /battle, /test-run.
- Taps on those prerendered buttons act on the visitor's real slots while the screen shows the sample's.
- This breaks "real data only / never a wrong grade".
- Fix: don't prerender the personal pages (team, box, compare, battle, build, practice, test-run, calc), or have an inline script drop `[data-np-pre]` when cc2.state exists. Home, the Pokémon pages and the data pages are not personal.

**M4 (an existing test goes red). v2-minors main1 `Sprites A (Nov 17)` fails** (job 66: V2.mon srcset in shell.js).
- Result line: `FAIL  Sprites A (Nov 17): small spots use the 240px files (98 on 5 pages) and no sprite set larger than 80px gets one (7)`.
- It fails on the chain and on the test merge. design6 passes it (the batch8 and batch9 runs).
- Kip's job 64c report says v2-minors was not run locally (VM timeout).
- No picture looks worse:
  - I checked the 7 sprites (1 on Build and 6 on Speed at 390) at DPR 1, 2 and 3.
  - At every DPR, the browser picks a file at least as wide as the drawn slot (`shown wider than the file: 0`).
  - The test reads `src`, and `src` is now the 240px file.
- Fix (code side, keeps the test as it is): for slots over 80px, give `src` the 384px file and keep srcset. Changing the test instead is HH's call.

## Fix after merge
**F1. Keyboard order on My Team, Claude build too** (app/src/v2/pages/team.js:494-499 splits mtfHead into mtfTop + mtfFoot).
- Screens are pixel-identical: design6 vs chain vs test merge at 1440 and 390, PIL diff bbox `None`.
- But the DOM order changed: at 1440 Tab now visits the six and the set editor, then jumps back up to "Why This Score?" (y 305).
  - design6: Why/Sheet/Share first.
  - chain: `jumps back up at: ["‹","Why This Score? ›","Matchups"]`.
- At 390 the chain's order fits the screen better than design6's.
- WCAG 2.4.3 (focus order) at desktop. Two `.mtf-head` divs now share its styles.

## Minor / notes (checked)
- **Lazy chunks vs the main file.**
  - Main-file code calls `abMember`/`abY` (now in the build chunk) in gradeNames (18-archetypes.js:164, inside try, result cached), 47-core-data.js and 29-fix-planner.js (typeof-guarded).
  - On today's pages they never run before the build chunk: the tournaments, events and weekly chunks pull it in, and Build/cores live in it.
  - Cold vs warm `#main` text was identical on /archetypes, /team, /meta, /, /pokemon/garchomp and /battle (0 differing lines). Same for /winning-teams and /events.
  - Latent risk: a new caller of gradeNames from another chunk would silently cache "no grade".
- **Tips:** the "?" tip handlers moved from sugs.js to kit.js and are no longer in sugs.js (grep: kit.js 6, sugs.js 0). No double handlers.
- **Claude build stays #hash** (Claude build, Home/Meta/Pokémon/Winning/Team/About: `dataH: 0`).
  - Home's receipt bars do use `/pokemon/<slug>` on the Claude build. That's the pre-existing f3Link bug Maggi fixed in alt/batch9 (F3-5), not this chain.
- **Claude live build** (`--split`): v2.js is now `<script defer>`, with the failure notice on DOMContentLoaded.
  - Checked: normal load draws Home with no errors.
  - With v2.js blocked, it shows "This page didn't load."
- **One h1 / theme:**
  - The prerendered home/team/meta turn their h1 into `div role=presentation` next to the hidden SEO h1. Tool pages turn the SEO h1 into h2. prerender-test passes.
  - Theme is set by the inline head script before paint (3 copies per page).
- **Fallback fonts** (tokens.css, fonts.css) apply to both builds while fonts load. Latin range only. first-screen-guard passes.

## Runs (frozen out/ unless said)
| Step | Result |
|---|---|
| Claude live build `cd app && node build.mjs --v2 --art=../src/v2/art/ --one-art-size --split` | exit 0, `built dist/v2.html (882 KB ...)` |
| Claude CI build + A-team, chain | exit 1, `137 pass, 2 FAIL`: HOME-01 (first heading "") and HOME-06 (Battle). The chain lacks ba95fd61, so expected. |
| A-team, test merge | exit 0, `139 pass, 0 FAIL, 4 known` |
| v2-minors main1, chain / test merge | exit 1 both, `1 failed` (Sprites A, M4) |
| split-routes-cross-test, chain / test merge | exit 0, `all passed` (its new cold cases don't block chunks, so M1/M2 pass it) |
| `node public-site.mjs site-jj` | exit 0 with today's out/ (frozen out/ fails the no-names check, `90 not an ID`) |
| page-speed-check | `speed-check: ALL PASSED` |
| first-screen-guard | `first-screen-guard: ALL PASSED` |
| deploy-smoke (local folder) | `deploy-smoke: ALL PASSED (369 sitemap URLs + robots.txt + 404 + pokemon + /team cold-open in 54.1s)` |
| syntax-check, test merge | `all 433 scripts parse` |

## Test merge with origin/claude/design6 (ee87a267), local only, not pushed
**1 conflict, in app/src/v2/shell.js `V2.openSearch`:**
- Kip added the info-text needRoute line. batch8 added the short placeholder.
- Resolution: Kip's version, with design6's placeholder put back exactly:
  `placeholder="${innerWidth < 430 ? 'Pokémon, move, item or page' : 'Find a Pokémon, move, item, team style or page'}"`.
- Both sides are kept.

Auto-merged without conflict: pubhome-f3.js (Kip's srcset/lazy plus batch8's tap areas, h1 and `.nw`) and the rest. The merged tree builds, passes A-team, and fails only Sprites A (M4).
