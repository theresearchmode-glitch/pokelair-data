# From the design chat, Nov 11 (late): what was not yet in the repo

Saved by the separate design/PC chat at Sim's request so a new rebuild chat starts with nothing missing.
Read docs/rebuild/RULES.md and HANDOVER.md first; this folder only adds to them.

## 1. Selected Pokémon: three redesigns waiting on Sim's pick

Sim does not like the tilted panel or the floor ring behind the selected Pokémon. Three standalone redesigns
were drawn for her. She has NOT chosen yet. Do not build any of them, and do not polish the current ring,
until she picks.

- `nastyplot-selected-stage.png`: A, Centre stage (the design chat's recommendation)
- `nastyplot-selected-podium.png`: B, Podium (weakest of the three)
- `nastyplot-selected-beam.png`: C, Light from above (puts colour behind the Pokémon again)

`source/selre.cjs` is the script that drew them (read it for the CSS; it runs only on Sim's PC).

## 2. Points raised with Sim that are not in HANDOVER.md

- Page weight: each built page is one 2.6 MB file with all data inlined (the Build mock-up is 5.7 MB). Fine in
  the Claude artifact, slow on a phone on mobile data. The public site needs a plan to split the data out.
- Art and name ownership for a public site still has no answer. Launch is January 2027.
- The rebuild's "same as today" proofs carry today's known bugs across (17 marked known in the behaviour
  tests). Sim has not decided whether the rebuild fixes them or ships them. Ask her.
- An outside check after every page: Sim tests on her iPhone, and the design chat can run an independent
  sweep of the published artifact. "Checked" in a report must name the check, the commit and the result line.

## 3. The sweep scripts

`source/sweep.cjs` and `source/sweep2.cjs` produced the My Team fix plan (docs/rebuild/my-team-fix-plan.md).
They load a local copy of the published foundation.html at 320 / 390 / 820 / 1440 / 2560, day and night,
click every control at 390 and 1440, and probe sheets, remove/undo/apply, reload and tab order. They borrow
Playwright from another checkout on Sim's PC and have hard-coded paths, so treat them as a reference for
rule C13's automated check, not as something to run as-is. Known false alarms in them: the contrast check
misreads selected segments, and the "jump" figure includes the scroll the script itself does.

Not swept: My Box, the info sheet, the contents of each sheet, real iPhone or iPad Safari.
