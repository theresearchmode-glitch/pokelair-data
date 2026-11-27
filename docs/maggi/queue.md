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
<!-- watcher test 1795743090 -->
