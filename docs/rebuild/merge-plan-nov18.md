# Merging main into the redesign (claude/design6), plan, Nov 18

Checked with a dry run in a scratch copy (`git merge --no-commit --no-ff origin/main` on claude/design6): split point ff6bff40,
main 33 commits ahead, 28 files clash.

## 26 of the 28 are not real clashes
Main's 44c9a72b ("main = what is live") copied the branch's app/ at cb49701 into main. cb49701 is in claude/design6
(`git merge-base --is-ancestor`: yes), and for every clashing app/ and app/test/behaviour/ file except head.html,
`git diff cb49701 origin/main -- <file>` is empty. So main only holds an older copy of the branch's own file: take the branch side.
Files: 09-quick-add, 60-concept-h, 63-method, 63-weekly, 74-arena, 75-arena-team, 76-slide, 76-team-sheet; behaviour tests
A/B/C/D, adapters, fixture (3 .gz + FROZEN.txt), freeze, harness, run, .gitignore.

## The real ones
| File | What each side did | Plan |
|---|---|---|
| app/src/head.html | branch still links Google Fonts (Archivo, Instrument Sans) for today's site; main self-hosts every font (d24d31bf, Sim Nov 12: privacy) | take main's; the merged build.mjs already refuses a Google Fonts link |
| .github/workflows/update.yml | main reads the player-ID key under both names (ee6de084) and pauses the op.gg read (cfa6451e) | take main's in all 5 blocks; the branch's meta/post steps sit outside the clash and stay |
| .github/workflows/test.yml | both added test paths; the branch's test helper is also splitting v2-minors into parts | union of both path lists; redo after the test helper lands |
| out/events.json, out/track.json | daily data | take main's (newer data) |
| out/model.json | branch: Protect family counts (ea3e1172); main: teamHalf 0 (4441f1fb, live, fixed golden) | refit with both on main's data, compare on real wins (helper running), then pick |

## Order
1. Land the branch-tests helper (it changes test.yml).
2. Model refit result in (decides out/model.json).
3. Merge, resolve as above, run every test.yml step for the branch, then push to claude/design6 (not main).
