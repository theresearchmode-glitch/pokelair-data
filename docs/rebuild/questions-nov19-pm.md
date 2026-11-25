# Questions for Sim, Thu Nov 19 afternoon (ready for 4 PM; pictures in docs/rebuild/pics/nov19/)

Q32 · This Week on phones (5.9 -> 4.9 screens, measured): RECOMMENDED A = phone-only spacing (section gap 40 -> 24, weather tiles back
to 120px, smaller gaps) + two folds (Winners shows 1 ticket + "All of this week's winners on Events ›"; New Tech top 2 + "Show all 4 ›").
Why: keeps every design; the cut tickets are on Events, one tap away. Pictures: Q32-thisweek-today-full.png, Q32-thisweek-RECOMMENDED-full.png.
Not recommended: B (compact New in Top Cut with small sprites, 4.7 screens): costs the WOW.

Q33 · Events: is "who won lately" the main info? RECOMMENDED B = on phones the latest winner's big ticket comes first, under the headline
("Every result, event by event."), then the counts and Next Events. Why: the page promises results first; today the winner is on screen 2.
Pictures: Q33-A-events-first-screen-today.png, Q33-B-events-first-screen-RECOMMENDED.png.

Switch runbook (docs/rebuild/switch-runbook-nov19.md), 5 open questions (Promote was answered Nov 18, Q6 A):
S1 · May Claude make a PRIVATE scratch artifact to rehearse the switch publish (file counts, the 255-files limit) and test what the
     Preview never can: account saving, feedback, usage and the wait for missing data documents? RECOMMENDED yes. Why: the only way to
     find a switch-day surprise before players see it; nothing public, deleted only with your yes.
S2 · At the switch, remove the 6 old font files? RECOMMENDED yes (rollback can re-add them).
S3 · If a short broken window can't be avoided (depends on S1's answer about the 255 limit): switch in a quiet late-night hour? RECOMMENDED yes.
S4 · CLAUDE.md's "every live publish carries the 345 sp/*.webp" becomes "the 350 v2art files" after the switch. RECOMMENDED yes.
S5 · Add meta/post to the data refresh task now (it skips a missing file harmlessly) or on switch day? RECOMMENDED on switch day. Why: no
     change to the live task before the switch; nothing reads it yet.

Q34 · Events tickets under 360 wide (an old bug, found by the Q31 helper; not caused today): official tickets push "Official event · Winner's
team" and the event name into the date stub (Gdańsk 54px at 320). RECOMMENDED B = the label may wrap to two lines under 360 (sugs.css:264
keeps it on one line today). Why: nothing leaves its ticket; the ticket grows one line only on the smallest phones.
Pictures: Q34-A-ticket-320-today.png, Q34-B-ticket-320-RECOMMENDED.png.

Also for Sim's eye (decided under authority, revertible): Usage on phones, the share number is now 15px (was 13px by accident; the headline
font's smallest size); the small '%' after it stays 13px as designed. Picture: scratchpad usage-320-after.png (sprites missing in that quick build).
