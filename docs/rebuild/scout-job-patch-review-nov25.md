# Scout job (Nov 25): independent check of the Dec 2 balance patch batch + the M-D start night (launch week; highest value left)
Paste the box into Scout's chat (the other account). Report only; push only to alt/other-* branches.

```
SCOUT JOB: independent check of the Dec 2 balance patch batch before it lands on M-D night (Tue Dec 1, 9 PM ET = Dec 2 02:00 UTC).
Repo github.com/theresearchmode-glitch/pokelair-data. Read CLAUDE.md first (honesty rules: every claim checked (how) or not checked).
Branch alt/patch-dec2 (from claude/design6). Official source: Pokémon HOME news 877, saved as
docs/rebuild/test-runs/patch-dec2-official-877.html. Our notes: docs/rebuild/test-runs/patch-dec2-map.md, patch-dec2-psychup.md,
docs/rebuild/md-start-night-plan.md.
1. Compare EVERY change on the official page with the branch's data, word by word and number by number:
   experiments/apply-dec2-patch.mjs and the files it changed (app/src/data/data.js LEARN + ABIL, move-acc.js, move-meta.js,
   info-text.js, app/src/v2/pages/infosheet.js). Anything missing, wrong, or extra? Are the Mega forms right to get the new moves?
2. Search the whole repo for anything ELSE the patch changes that we missed (Rock Slide 30%/90%, the four 100% moves, Flash Fire,
   Stalwart, the new learnset pairs) in text, tests, calc logic, legality checks, golden files.
3. Run on the branch with the frozen data (git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/): node
   experiments/patch-dec2-test.mjs, experiments/rules-fixes-test.mjs (also with its date check forced past 2026-12-02T01:59Z),
   experiments/fields-audit.mjs, experiments/legality-check.mjs, experiments/calc-check.mjs 2000, node app/test/run.mjs (after
   node app/build.mjs). Give each command's last line.
4. Read docs/rebuild/md-start-night-plan.md: is anything in the order of the night risky (a red main blocking Promote, the hand-run
   data job, timing in UTC vs ET)? Say what you'd change.
Report: findings ranked (CRITICAL / HIGH / MEDIUM / LOW) with file:line and proof; every check line; anything unsure. Don't merge anything.
```
