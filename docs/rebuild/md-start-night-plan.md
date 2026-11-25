# Reg M-D start night: Tue Dec 1, 2026 (US evening) = Wed Dec 2, 02:00 UTC — the exact plan (HH, Nov 25, 3:40 PM)
Times: M-C ends 01:59 UTC Dec 2 (Tue Dec 1 5:59 PM PT / 8:59 PM ET); M-D starts 02:00 UTC (6:00 PM PT / 9:00 PM ET).
Source of truth: Pokémon HOME news 878 (in-game). pokemon.com's "Wed Dec 2 6 PM PST" is a slip (checked Nov 25).

## Before (by Mon Nov 30)
- The Dec 2 balance-patch batch is ready and tested on ONE branch (patch-dec2-map.md + patch-dec2-psychup.md: move accuracies,
  Flash Fire / Stalwart texts, the Psych Up list...), with experiments/rules-fixes-test.mjs passing against a faked clock after 01:59Z.
  Reason: from 01:59Z that test fails CI until the patch data is in, and a red main blocks Promote (live data would freeze).
- The "Reg M-D has started; numbers switch at the next update" line (design6) merged, pictures shown to Sim.
- Re-read HOME news 878 and the in-game notice for any change to the times (a day early, so there's time to adjust).

## On the night (HH, Sim watching if he likes; times ET)
1. 8:45 PM: check main's last test run is green and no data job is running (gh api).
2. 8:59 PM (01:59Z): M-C ends. The site still shows M-C data, the countdown hides, the "M-D has started" line shows from 9:00 PM.
3. 9:00 PM: confirm M-D is live from an official source (in-game news / official account). If not: wait, recheck every 15 min, change nothing.
4. 9:05 PM: land the patch batch on main through a test branch (GitHub green first; the merge gate for any merge).
5. 9:05 PM, or right after step 4 is green: run "Update Limitless data" by hand (workflow_dispatch) so the switch to M-D doesn't wait
   for the 09:07 UTC daily run (a 3-7 hour hole otherwise). Watch: data job -> tests -> Promote -> live.
6. After Promote: check live's out/reg.json says M-D, since 2026-12-02; the site shows "Day 1 of Reg M-D", "Not rated yet", the
   Strength Score labelled "Graded against Reg M-C's teams until Reg M-D results arrive".
7. Tell NP - Marketing M-D is live (their post still waits for nastyplot.org to be live, Dec 2-3).
8. Log everything with its time; morning summary to Sim.

## If something goes wrong
- Tests red after the patch: fix forward on a branch; live keeps yesterday's data (it never moves while main is red).
- Data job fails: its last good data stays live (each step keeps the old file); rerun by hand after a fix.
- Official times change: update regulation.json + tests first, then everything else.

## Changes from Scout's review (Nov 25, 5:53 PM; docs/rebuild/test-runs/scout-reports-nov25.txt), adopted
- HIGH 1: the night's test branch is made from origin/main with ONLY the 4 patch commits cherry-picked (8b1a2dd8, a381ae97,
  33daaf70, 47607635 or their rebased copies), never the whole alt/patch-dec2 branch (it carries 44 design6 commits).
- HIGH 2: the 24 new M-D Pokémon + 4 Megas are not in our data yet. Add a roster step AFTER the patch: confirm the roster
  generator, run it, then re-run experiments/apply-dec2-patch.mjs (a regenerated LEARN would drop the patch's moves) and
  require patch-dec2-test 103/103. Sim OKs the change list.
- MEDIUM 3: get that main+patch test branch GREEN on Tue Dec 1 afternoon (it passes before 01:59Z too). At 9 PM ET only: confirm
  M-D live AND the balance patch in the game (MEDIUM 5: news 877 gives no hour), merge gate, push main, start the data job.
- MEDIUM 4: FAST_DATA stays off until the patch is on main (step 1 checks it).
