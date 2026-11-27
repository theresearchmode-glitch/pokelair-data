# Maggi's job queue (HH writes; newest at the bottom). Started time: 8:31 PM (8:31:04)  date: Thu Nov 26, 2026.
Read docs/maggi/README.md first (rules + mailbox + the always-on watcher), then docs/rebuild/kip-onboarding.md and CLAUDE.md.

## JOB M1: bug review of tonight's Home change, before tomorrow's 8:30 AM switch (report only, no code changes)
Diff: `git diff origin/claude/design6...origin/alt/f3-claude` (branch alt/f3-claude, tip ba95fd61: the "Final 3" Home on both builds,
the slogan h1, test changes). Look for BUGS only (not looks): JavaScript errors, a value that can be undefined/NaN, a link or button
that goes nowhere, data that could be stale or mixed between Reg M-C and M-D, anything that differs between the Claude build
(`node app/build.mjs --v2 --preview-data`) and the public build (`--v2 --split --one-art-size --art=../src/v2/art/ --public`),
test changes that weaken a check. Run both builds and `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` on the branch.
Each finding: severity (blocker for the switch / fix after / minor), file:line, proof. Report on branch alt/maggi-m1-review ([skip ci]).

## JOB M2: then wait for HH (run the watcher)

## HH review of M1 (time: 9:11 PM (9:11:29)  date: Thu Nov 26, 2026): excellent, graded A. Every finding checked against the code; 1, 3 and 4 matter before Dec 2.

## JOB M2: fix your own M1 findings 1-5 (code and tests only; no visual change)
Branch alt/maggi-m2-f3fixes from origin/alt/f3-claude (ba95fd61). The helper is building alt/batch8 on top of ba95fd61 tonight (CSS tap areas, an h1 size, the
calc tile, the Search placeholder, "Reg M-D" no-break span in V2.f3Words); keep your edits to the lines your findings name so HH can merge both.
1. evReg fallback to the dataset's regulation (regInfo().id) when the event name has no "(Reg X-Y)": after Dec 2 02:00 UTC the old winner reads "The last Reg M-C winning team".
2. V2.f3Link: "/pokemon/<slug>" only on the public build (window.__NP_PUBLIC); the Claude build keeps "#pokemon=<name>".
3. No "against 0 real tournament teams": omit that clause when teams is 0 or RES is null (as stampede-hero.js:41 does).
4. V2.f3Rate returns null for V2.unrated(p) (bar shows the dash, aria "not rated"), as meta.js does.
5. Restore the Battle check in A-team.mjs HOME-06 (empty team: "Score My Team|Build Me a Team|Battle").
Each fix: a check that FAILS on ba95fd61 and passes after (fake clock for 1 and 4, RES=null for 3, the Claude build for 2). Put the checks in
app/test/v2-minors.mjs (a new "F3-4..7" group near F3-1..3) or the A-team behaviour test, as fits.
Then run: both builds, v2-minors main1/main2/groups, A-team behaviour (Chromium), v2-public. Exit codes in the report.
Push ONCE with a real GitHub run (no [skip ci]) when all pass. Status line + report as always.
Finding 6 (test gaps) and 7 (dead code, the cache key): JOB M3, after M2: add F3 contrast + the 1000x650 / 393x659 fold checks for both start
buttons; remove V2.f3Seo if truly unused (grep the public build scripts too); key V2._f3 on the regulation as well. Same rules, own branch from your M2 branch.

## HH (time: 9:58 PM (9:58:49)  date: Thu Nov 26, 2026): M2 received (bcbcad56), thank you. I cancelled its GitHub run (45931112402) on purpose, not because it failed: tonight's switch batch (alt/batch8) needs the test queue first. I'll combine M2 + M3 with batch8 into one later batch and run GitHub once for all of it.
From now on push with "[skip ci]" (no GitHub run) unless the job says otherwise; HH runs GitHub on the combined batch.

## HH (time: 10:06 PM (10:06:05)  date: Thu Nov 26, 2026): M3 received (70ff358e), thank you. I cancelled its GitHub run (45932101560) for the same reason as M2's: the switch batch goes first. Push with [skip ci] from now on.
## JOB M4: check the Dec 2 balance-patch map against the code (report only)
On Dec 2 the game's balance patch lands with Reg M-D. Our map of every place in our code it touches: docs/rebuild/test-runs/patch-dec2-map.md and patch-dec2-psychup.md (on origin/claude/design6).
On a checkout of origin/claude/design6 (and origin/main for the data jobs): for every item in the map, confirm the place still exists at the file:line it names (code moves: give the new line), and grep for anything the map missed (the same move / ability / item / Pokémon names in app/src, data.js, roster.json, the calc, the Strength Score model, tests). Mega forms included.
Deliver on branch alt/maggi-m4-patchmap ([skip ci]): docs/rebuild/test-runs/maggi-M4-patchmap.md = a table: map item | still right? | new file:line | anything missed (severity: must change on Dec 2 / should / note) | proof. No code changes.

## HH (time: 10:12 PM (10:12:06)  date: Thu Nov 26, 2026): M4 received (5e96566d). Very useful: the Showdown pin and the missing apply-dec2-patch.mjs hook were not on our map.
## JOB M5: write experiments/apply-dec2-patch.mjs (the hook md-roster-step.mjs:197-209 looks for)
Branch alt/maggi-m5-dec2patch from origin/claude/design6. It applies every "must change on Dec 2" item in patch-dec2-map.md + patch-dec2-psychup.md + your M4 table that lives in OUR code/data (data.js LEARN / ABIL / MOVES entries, infosheet.js Rock Slide 20%, run.mjs Hustle 76 or read from MOVE_ACC), exactly as the official patch notes in those docs say; quote the doc line for every change.
- DRY RUN by default (prints each change as file: old -> new); --write applies; idempotent (a second run changes nothing); stops on the first surprise with a plain message.
- Never runs by itself before Dec 2 02:00 UTC unless --force (it's run by md-roster-step on the night).
- Test experiments/apply-dec2-patch-test.mjs on a scratch copy: every change lands, the second run is a no-op, rules-fixes-test passes with a fake clock after Dec 2 (its time-bomb guard) and still passes before, unrated-test + run.mjs pass. Show the time-bomb failing without the patch.
- The Showdown pin bump is NOT in this job (Kip does it). The wording you write is game text from the patch notes, not page design.
Push with [skip ci]; report as always.

## HH (time: 10:38 PM (10:38:58)  date: Thu Nov 26, 2026): you hit your usage limit, so job M5 (apply-dec2-patch.mjs) moved to HH's Claude helper. When you are back, do NOT redo it: skip to the next job below (HH adds it before 3 AM).

## JOB M6 (for when you're back, after 3 AM Eastern): independent review of the Dec 2 patch script (report only)
HH's helper wrote experiments/apply-dec2-patch.mjs + apply-dec2-patch-test.mjs (branch origin/alt/helper-dec2patch, fc49e36d; report docs/rebuild/test-runs/helper-dec2patch.md). You know the map best (M4). Check every change it makes against patch-dec2-map.md, patch-dec2-psychup.md and your M4 table: nothing missing, nothing extra, the right Pokémon/forms (Megas, Castform forms), the right numbers (Rock Slide 95 acc / 20% flinch, the 4 other moves), and the Ability wording against the official note. Run its test and md-roster-step --force-patch on a scratch copy. Findings with severity and proof on branch alt/maggi-m6-review ([skip ci]). No code changes.

## HH (time: 6:35 AM (6:35:39)  date: Fri Nov 27, 2026): M5 + M6 received, thank you. 0 blockers in the helper's script is good news; your own M5 gives us a second, independent version.
## JOB M7: cross-check the two Dec 2 patch scripts, then add your "should" fix
1. On scratch copies of origin/claude/design6, run --write (with --force) of BOTH: the helper's experiments/apply-dec2-patch.mjs (origin/alt/helper-dec2patch fc49e36d, now also in design6 5d111577) and yours (origin/alt/maggi-m5-dec2patch b0daf6e8). Diff the resulting files (data.js, info-text, move-acc, move-meta, infosheet.js, run.mjs). Every difference: which one matches the official notes (patch-dec2-map.md / patch-dec2-psychup.md / news 877), with proof.
2. Branch alt/maggi-m7-dec2fix from origin/claude/design6: add your M6 "should" (a done-predicate for the data.js ABIL rows) to the helper's script, plus anything step 1 shows is missing or wrong in it, each with a check in apply-dec2-patch-test.mjs that fails first. Run apply-dec2-patch-test, rules-fixes-test (real clock and a fake Dec 3 clock), md-roster-step-test, run.mjs.
Push with [skip ci]. Report as always.

## HH (time: 6:37 AM (6:37:42)  date: Fri Nov 27, 2026): HARD STOP fifteen minutes before ten in the morning, Eastern, today
Sim turns you off at about ten in the morning (Eastern) and you will be out of usage for a week. Finish job M7 if you can; at the latest fifteen minutes before ten, push whatever you have (with [skip ci]), write the report file and a status line saying exactly what is done, what is not, and how to continue. Then write an idle line and stop. Do not start a new job in the last half hour before ten. Check the time with TZ=America/New_York date. Thank you for the help!

## HH (time: 6:45 AM (6:45:51)  date: Fri Nov 27, 2026): M7 received (a3d7622b), thank you.
## JOB M8: a permanent test so the live-site wrapper bug can never come back
Background: after the switch, Sim saw the LIVE artifact broken in dark mode. The Claude host wraps index.html in its own UNLAYERED style (the exact head is in docs/maggi/files/host-wrapper-head.html on this branch: everything before our page), and our CSS lives in @layer, so the host's body background/color/font, :root color-scheme + safe-area padding and img max-width won. Fix: branch origin/alt/host-wrapper-fix (6d2bbe9c), an unlayered revert-layer block in app/build.mjs.
Write experiments/host-wrapper-test.mjs (branch alt/maggi-m8-wrapper-test from origin/alt/host-wrapper-fix):
- Build the Claude build (node app/build.mjs --v2 --preview-data); make a wrapped copy = host head + dist/v2.html + '</body></html>' (beside it, so its files load).
- Load the unwrapped and the wrapped page in Chromium at 390x844 and 1440x900, light and dark (set the theme the way the page does, e.g. localStorage or the theme button; read shell.js). Compare: computed body background-color, color, font-family, font-size; :root color-scheme, padding-top/bottom; and a full-page screenshot pixel diff (pixelmatch or a plain byte compare of PNGs from the same renderer). FAIL on any difference, printing which.
- Prove it fails: on origin/claude/design6 5d111577 (no fix) it must FAIL (dark mode background white); on alt/host-wrapper-fix it must PASS.
- Add it to .github/workflows/test.yml next to the other v2 checks (same pattern) and to its paths list.
Push with [skip ci]; report as always. This counts toward the hard stop before ten.

## HH (time: 6:56 AM (6:56:34)  date: Fri Nov 27, 2026): M8 received (612d0364): excellent: the [hidden] find is a real second bug. It's now on alt/host-wrapper-fix and in GitHub's run.
## JOB M9: the wrapper test on iPhone and iPad (WebKit), Sim's devices
Branch alt/maggi-m9-webkit from origin/alt/host-wrapper-fix (612d0364). Extend experiments/host-wrapper-test.mjs (an env switch, e.g. BROWSER=webkit) to run in WebKit at iPhone 15, iPhone SE and iPad Pro 11 (Playwright devices), light and dark, and also on 4 more pages besides Home: My Team with a full saved team, Meta, a Pokémon page (Garchomp), Battle. Wrapped vs unwrapped must be pixel-identical (allow 0 differing pixels; if WebKit has anti-alias noise between two loads of the SAME file, measure that first and report it). If a difference shows, find the cause (another host rule?) and fix it in the same revert-layer block, with proof.
Push with [skip ci]. Stop before ten, as above.

## HH (time: 7:07 AM (7:07:30)  date: Fri Nov 27, 2026): M9 received (1e1b06af): 60/60 WebKit + 8/8 Chromium with 0 differing pixels. That is the proof Sim asked for. Thank you.
## JOB M10 (if time before the stop): the other 7 pages in WebKit
Same branch line (alt/maggi-m10-webkit-all from your 1e1b06af): add Build, My Box, Track Record, Search open, Spicy picks on, How We Calculate, About to the WebKit run (iPhone 15 and iPad Pro 11, light and dark). 0 differing pixels expected; report any difference with its cause. Push with [skip ci]; stop before ten as above.
