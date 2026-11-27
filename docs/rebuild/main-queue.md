# Main-thread queue (Sim, Nov 22: the main thread never stops while helpers work)
Updated: time: 9:51 AM (9:51:27)  date: Fri Nov 27, 2026
NOW: main 5c7839e2 GitHub run 46012888301 (dispatched; queue unblocked 9:35), then promote. design6 0ccfa209 (podium) run 46012768551 -> then publish live v161 from scratchpad/lvpub3 (built, v2.js unchanged c2b2e40e) + merge-check main.
NOW: helper Job MM: alt/speed-chain-merge 9fab017c (Kip's speed chain + 2 fixes), GitHub 46017074752; then gate into design6.
HANDOFF (9:51 AM, Kip + Maggi out for a week from ~10 AM): Kip: all jobs through 73 done, clean (alt/gemini-speed-chain 1170ae6e; 73 = report only: A-team 145/145 clean, v2-minors 0 regressions). Maggi: M1-M12 done, queue clear. Left for HH/helper: (1) Kip's chain -> helper Job MM (in progress); (2) Maggi M7 a3d7622b (apply-dec2-patch.mjs ABIL done-predicates + fail-first test) NOT merged anywhere -> HH: GitHub run + gate into design6, then main before Dec 2; (3) podium-cover-test is in design6 (0ccfa209).
NEXT: gate alt/maggi-m7-dec2fix (a3d7622b) after a GitHub run on it; Dec 2 patch night needs it on main.
NEXT: after podium + speed chain in design6: merge-check main + push; publish live; Preview republish.
NEXT: runbook note: a skipped data run can cancel a main test run (same concurrency group); log-branch pushes need [skip ci].
NEXT: Showdown pin bump (alt/helper-showdown-pin 6d84e7b1) on Dec 2 night with the probe.

## Nov 24 morning (Sim: live data fix + Preview daily data)
- NOW: GitHub run 1516 on main c565e865 (threat-check fix) -> Promote to live.
- NEXT: test daily-data.sh on the live branch; daily scheduled Preview refresh; ask Sim to fire the data refresh once live moves.

## Reg M-D (Sim, Nov 24: all on this account from 4:01 PM Wed Nov 25, split between this chat and the PC chat)
Order: switch decision; regulation profile (+ outside sources); model/ratings never mix regs; roster generator; sprite script;
practice switch on made-up M-D data (M-C + Mega Heatran) incl. day-one empty states + thin-data labels; every-4-hours data for
2 weeks; watcher; Dec 2 patch (map + Psych Up list in docs/rebuild/test-runs/); undo plan re-check; M-D fixture teams for tests;
Preview daily script + data refresh read the new reg; "Reg M-D is here" note. PC chat: heavy runs (full checks, screenshot batches).
