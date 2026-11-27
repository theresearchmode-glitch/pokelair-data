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
