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


## How the first attempt resolved it (merge helper, Nov 18 evening; done on an older claude/design6, NOT landed: redo on the current branches)

```
Merge origin/main into the redesign branch (claude/design6)

Resolved per docs/rebuild/merge-plan-nov18.md. 28 files clashed.

Branch side (git checkout --ours), 22 files. For each, git diff cb49701 origin/main
was empty: main only held an older copy of the branch's own file (main's 44c9a72b
copied the branch's app/ at cb49701).
- app/src/app: 09-quick-add, 60-concept-h, 63-method, 63-weekly, 74-arena,
  75-arena-team, 76-slide, 76-team-sheet
- app/test/behaviour: .gitignore, A-team, B-build, C-battle, D-meta-shell,
  adapters/current.A-team, adapters/current.B-build, fixture/FROZEN.txt,
  fixture/events.json.gz, fixture/teams.json.gz, fixture/weekly.json.gz,
  freeze, harness, run

Main side (git checkout --theirs):
- app/src/head.html: main's self-hosted fonts (no Google Fonts link; the
  merged build refuses one)
- out/events.json, out/track.json: main's newer daily data (every other out/
  file auto-merged to main's copy; out/post.json is branch-only and stays)

.github/workflows/update.yml: main's side in all 5 blocks (the player-ID key is
read under both secret names; the op.gg read is paused, browser install kept).
The branch's news steps (post-news.mjs, post-data-test.mjs, out/post.json) sit
outside the clash and are still in the file.

.github/workflows/test.yml: union of both push path lists. The branch's list
already held every path in main's, so the result is the branch's list. No other
hunk clashed (v2-post-doc step kept).

out/model.json: neither side. The refit on main's data with both changes (the
whole Protect family from the branch, teamHalf 0 from main), with sixes, ctr and
leads. Walk-forward scoreboard: no difference from either side on real later
games (docs/rebuild/research/merge-model-nov18.md).

model.mjs, update.mjs, formats.mjs, app/test/run.mjs: auto-merged by
git (model-settings.json changed on main only).

Claude-Session: https://claude.ai/code/session_01YGeTVQdFPaKNkn33jSEpxs

```
Since then main gained b15afeac (rule holes), cbde1e63 and c77471d5 (model and split parts): take main's out/ data and re-run the model steps (incl. split-docs) on the merged code; the branch gained the Home tools, test split and checks. Expect the same kinds of clashes plus test.yml (the branch now has the v2-minors parallel parts).
