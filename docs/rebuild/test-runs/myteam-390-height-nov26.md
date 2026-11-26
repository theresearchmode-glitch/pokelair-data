# My Team at 390: why local runs fail and GitHub passes (HH's Job J), Thu Nov 26, 05:30 AM Eastern onward (`date`)
Look and measure only. No fix, no test change.
- Code: claude/design6 b96f3a5e, unless a row says otherwise.
- Build: `node app/build.mjs --v2 --preview-data`.
- Viewport: 390x844, hasTouch, light, Chromium 1148. This is the check's own setup (app/test/v2-minors.mjs, the "Sim, Nov 18 (C)" block: open #team, wait 2.6 s, wait for no `.sg2-wait`, wait 1.2 s, then read `scrollHeight`).
- The probe copies those steps exactly (scratch .mt.mjs, not committed).

## 1. Why they differ (checked): the data
- GitHub's v2-minors job runs `git checkout 0c992f6977bc… -- out/` before building ("Use the frozen test data", test.yml).
- Every local run (mine, and the ones I called "frozen out/" in Jobs E, F, G and I) built from the worktree's own committed out/. On design6 that is out/ as of 4ec5aefa (Nov 24 data), not 0c992f69 (Nov 9 data).
  **Correction of my earlier reports:** those runs were on design6's committed out/, not on GitHub's frozen data. The "4.48" and "4.81" failures I called pre-existing on design6 come from that data. They are not failures on GitHub's terms.

| Inputs | Data (out/ from) | Height | Screens | "Optional swaps:" shown | Cap | Result |
|---|---|---|---|---|---|---|
| GitHub's terms | 0c992f69 (Nov 9) | 3990px | 4.73 | yes | 4.78 | pass |
| Local runs | design6 4ec5aefa (Nov 24) | 4056px | 4.81 | yes | 4.78 | FAIL |
| Today | main 4de4ec2a (= b19b8044, Nov 25; only official_perf.json removed) | 3740px | 4.43 | no | 4.35 | **over** |

The other inputs are the same in every run:
- fonts: Instrument Sans and Unbounded "loaded", from app/dist/fonts
- devicePixelRatio 1
- the same sample team: Mega Charizard Y, Whimsicott, Basculegion, Kingambit, Garchomp, Sneasler
- sprites present or missing: no height change (3740 both ways)
- the clock: 3740px with the clock set to Nov 25 17:30 UTC and to Nov 26 10:30 UTC

One trap found on the way: a copy of v2.html outside app/dist loses its web fonts and measures 4022 instead of 4056. The check must run on app/dist/v2.html, as it does.

## 2. Is the real page over its cap? Yes, with today's data (checked)
- Today's data gives the sample team no optional swap. So the cap is 4.35 (Sim's "Take 4.35", Nov 25), and the page is 3740px = 4.43 screens, **68px over**.
- GitHub never measures that state: on its frozen data the sample team shows an optional swap, so only the 4.78 branch is tested.
- Nothing grew since the cap was set (checked). The 4.35 commit itself (e19ce74a), 6806b683 (Nov 25 1:36 PM) and b96f3a5e all measure 3740px with today's data, and 3782px with the Nov 24 data.
- **Unsure:** e19ce74a's message says "checked at 390 on today's data: 3670px = 4.35". I could not reproduce 3670 on that commit with either day's data (Nov 24 or Nov 25; the clock was tried on b96f3a5e only). What differed in that measurement is unknown: possibly a different data copy, a different wait, or a different browser (not checked).

### Heights per section, today's data (px; y = from the top of the page)
| Part | Today (no swap) | GitHub's data (swap) |
|---|---|---|
| Hero (title, score, the six, the open card) | 1561 | 1561 |
| Step 1 "The upgrade and the plan" | 544 | 818 |
| - Suggestions: "Nothing to fix" box 106 + its links (Battle ›, Popular Sets ›) 44 + See All / Never / Refresh row 52 + Adjust Suggestions 70 | 312 | (one optional swap card instead) |
| - Who leads + PLAN IT IN BATTLE 83, Game Plan / Team Sheet row 44 | 135 | 135 |
| Step 2 "Who we're up against" (legend 57, bar 12, calc line 20, Show me chips 96, stand-outs 414) | 745 | 721 |
| Step 3 "Checks and record" | 341 | 341 |
| Footer | 377 | 377 |
| **Page** | **3740** | **3990** |

Picture mt390-4: in today's stand-outs, the third Unfavoured (Hisuian Arcanine) sits alone on its row before the Favoured begin. That's a half-filled row (rule 13). It costs no height: 7 tiles take 4 rows either way.

## 3. Proposals (ranked; nothing changed)
1. **Test/environment (needs HH's yes; I didn't touch the test).**
   - Local runs should use GitHub's data. Add `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/` before the build in every local v2-minors run (merge-check.sh, and the helper prompts), then restore out/ after.
   - Reason: the same check gives a different verdict only because of the data. This one difference is why every local run showed a failure GitHub never saw.
2. **Make the 4.35 state tested on GitHub (test change, HH's yes).**
   - Measure the no-swap state too, with a team that shows no optional swap on the frozen data, or by setting the pool so none shows.
   - Reason: today the cap Sim chose (4.35) is never checked on GitHub, which is how the real page could sit 68px over without a red run.
3. **The 68px on the real page (My Team is Sim's layout; pictures for him, no fix).** Smallest options, unbuilt:
   - (a) On phones, put "Battle › / Popular Sets ›" (under Nothing to fix) and "See All / Never Suggest / Refresh" in one row of links: about 44-52px. Reason: two link rows one after another, the biggest single saving without hiding anything.
   - (b) Then about 16-24px from step 1's spacing (the 16px gaps above "Nothing to fix" and above Adjust Suggestions). Reason: (a) alone may land just over.
   - (c) Or ask Sim whether 4.43 is fine for the no-swap state. Reason: the 4.35 number came from a 3670px measurement I can't reproduce (section 2).
4. **Rule 13 look (separate, small):** let the stand-outs' groups flow on so a lone third tile isn't left on its own row. Reason: Sim's symmetry eye. It's a look change, so it needs pictures and his yes.

## Pictures: docs/rebuild/pics/nov26/mt390-1..4
1. GitHub's data, full page
2. design6's out/, full page
3. today's data, full page
4. today's stand-outs
