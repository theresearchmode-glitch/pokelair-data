# Dec 2 runbook: balance patch + Reg M-D (written Nov 24)
Inputs: test-runs/patch-dec2-map.md (every place the patch touches), test-runs/patch-dec2-psychup.md (official Psych Up list + all
new moves), experiments/gen-roster.mjs (roster + learnsets from Showdown), experiments/add-sprites.mjs (pictures), md-watch.mjs
(alerts), experiments/md-fixtures.mjs (test teams). M-C ends Dec 2 01:59 UTC (formats.mjs REG_END: events after it count as M-D).

## Key point found while writing this
gen-roster.mjs rebuilds LEARN from Showdown. So once Showdown has the patch, the new learnsets (Psych Up x22, Slack Off, Roost,
Tailwind, Wonder Room, Play Rough x7, and the Mega forms) come from ONE command instead of hand edits. Hand edits are only the
fallback if Showdown is late.

## The night before (Tue Dec 1)
- [ ] md-watch issues: anything "Reg M-D spotted"? Read it.
- [ ] Turn FAST_DATA on (repo variable FAST_DATA=1): data every 4 hours from Dec 2 for 2 weeks.
- [ ] The data refresh and the 7:41 Preview job: confirm both ran green today.

## The order that works (Kip job 74, Fri Nov 27: full dry run on a scratch copy with a fake Dec 2 clock; docs/rebuild/test-runs/kip-job74-dec2-dryrun.md)
Since this runbook was written, two scripts do most of it: experiments/apply-dec2-patch.mjs (the balance patch by hand-edit, date-gated
to 02:00Z Dec 2, idempotent) and experiments/md-roster-step.mjs (roster, items, sprites, regulation; its step 8 re-runs the patch).
1. Run md-roster-step.mjs --write AFTER 02:00Z Dec 2. Before that time it rewrites data.js and skips the patch (step 8 "NOT applied").
   If it ran early: run `node experiments/apply-dec2-patch.mjs --write` again after 02:00Z.
2. Then `node experiments/gen-move-meta.mjs` and `node experiments/gen-info-text.mjs`: md-roster-step does not run them, and new M-D
   Pokemon have no weight (SPECIES_WT) and new items/abilities no info text until they run (fields-audit fails on it).
3. If the Showdown pin does not yet have the patch (smogon/pokemon-showdown#12475), run apply-dec2-patch.mjs --write once more: step 2
   regenerated move-acc/move-meta/info-text from the old pin. Safe to repeat (done-predicates).
4. In the SAME commit, retire the apply-dec2-patch-test.mjs step in test.yml (or switch it to its post-patch mode if built by then): it
   copies the repo's data and expects it unpatched, so it fails (12 of 30) once the patch is committed.
5. fields-audit stays red on the 5 patched moves until the Showdown pin moves to a commit with #12475 (expected; the pin bump
   branch alt/helper-showdown-pin waits for that).
6. app/test/run.mjs needs the frozen out/ (design6); the empty M-D day-one out/ belongs on main/live only.

## Dec 2, part 1: the balance patch (all regulations)
1. [ ] Is it live? Official notes page + maintenance over (news.pokemon-home.com). Note the time.
2. [ ] Does Showdown have it? Check smogon/pokemon-showdown commits for the champions mod (Rock Slide 95 / flinch 20 in
       data/mods/champions or moves.ts). If not: wait (check every 2 h); the site keeps pre-patch numbers with a note meanwhile.
3. [ ] When it does: move the pin (gen-move-meta.mjs header, gen-info-text.mjs, test.yml's Showdown commit) to that commit.
4. [ ] Run, in order:
       - `node experiments/gen-move-meta.mjs <showdown>` → move-acc.js, move-meta.js (Rock Slide 95 / flinch 20; Screech, Metal
         Sound, Steel Wing, Frost Breath reach 100 and leave the accuracy list)
       - `node experiments/gen-info-text.mjs <showdown>` → info-text.js (Rock Slide 20%; Flash Fire / Stalwart text)
       - `node experiments/gen-roster.mjs --ps <showdown> --report $S/roster-dec2.md` (dry run) → read the change report: the new
         learnsets must show exactly the patch list (psychup.md), nothing else changed. Then `--write`.
       - infosheet.js:15 by hand: Rock Slide "30%" → "20%" (the only hand-written number).
       - app/test/run.mjs:147: Hustle Rock Slide accuracy 72 → 76 (90×0.8 → 95×0.8), or read it from MOVE_ACC.
5. [ ] Checks: calc-check, legality-check, threat-check, golden, same-grade, run.mjs, v2-minors main1/main2/groups, tap-size.
       By hand in the calc: Flash Fire boost after Mega Evolution; Stalwart vs Substitute (our calc models neither today: no change
       expected, confirm).
6. [ ] Site note: "Ratings and sets come from games before the Dec 2 patch" (first 2 weeks).
7. [ ] Push design6 → GitHub full check → main (Sim's go) → live.

## Dec 2, part 2: Reg M-D
1. [ ] Roster known? Official announcement first, then Showdown's M-D format (md-watch opens an issue when it appears).
2. [ ] `gen-roster.mjs --format <M-D id> --report` → the CHANGE LIST → **Sim says OK** → `--write`.
       If Showdown is late: `--add <file>` with the announced Pokémon from official data; Abilities not announced say so.
3. [ ] New Pokémon pictures: `add-sprites.mjs <ids>` (prints the PC upscale step: give Sim the ready prompt for his GPU).
4. [ ] New Mega stones: items list (gen-items-list.mjs) + item pictures (PC GPU, items512 route).
5. [ ] The regulation profile (built Wed Nov 25) → M-D: one change switches the name everywhere.
6. [ ] Day-one states (built Thu Nov 26): thin-data labels "Day N of Reg M-D: X events so far"; no M-C/M-D mixing.
7. [ ] Tests on fixture teams (md-fixtures) until real M-D teams exist.
8. [ ] "Reg M-D is here" note; banner/countdown (Fri Nov 27) flips to "live".
9. [ ] Data every 4 hours; check the first M-D events arrive and are counted as M-D.

## After (first 2 weeks)
- Daily: names, sets, ratings check; md-watch quiet; refresh + Preview green.
- Retrain the team model when there are enough M-D games (it must pass its own test first).
- FAST_DATA off after 14 days.

## Undo
docs/undo-plan.md section 3 (hold the switch: REG_AUTO_SWITCH=0; revert the data commit; fire the refresh).
