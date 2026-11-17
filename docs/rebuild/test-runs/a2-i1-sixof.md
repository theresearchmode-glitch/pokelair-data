# A2-I1: a six's own record after edits (measured Nov 16 evening, for Sim's decision)

## The bug (checked: read 58-strength.js:37-41 and 08-render-all.js:262)
- CH.sixOf should drop the share of a six's own record for each Pokémon whose set was changed.
- `topItems()` returns `{src, it}`, but the code calls `.slice()` on it. That throws, the `try` swallows it, and
  `off()` always says "not changed". Every edited six keeps its whole record.

## How it was measured
- Script: scratchpad m-sixof.cjs (look-only; the fix is patched in memory on the Preview build check379).
- Real sheets: every event top team with all six Pokémon known: 976 teams. Distinct sheets whose six has its own record: 709.
  Each Pokémon is read with the moves and item its player registered, as 06-helpers.js reads event winners.
- Edited cases: 20 of those sixes, (a) one Pokémon given a move nobody runs in its top 6, (b) all six edited.

## Strict rule (as the code comment is written: a move outside the top 6, an item outside the top 3)
- Real sheets keeping the full record: 159 of 709. 5/6: 318. 4/6: 164. Lower: 68.
- Why: 685 Pokémon with a move outside their top 6; 186 with an item outside their top items.
- Score change: 414 sheets move by 0.05+. Mean -0.11, range -1.2 to +0.9. Rounded score changes: 102. Band word changes: 5.
- Problem: the same comment promises "an imported real team sheet keeps its record". Real players often run a 4th-slot move
  outside the top 6, so the strict rule breaks that promise for 78% of real sheets.

## Looser rule (a move or item real players ran on that Pokémon at all counts as "like theirs")
- Real sheets keeping the full record: 611 of 709. 5/6: 87. 4/6: 8. Lower: 3.
- Score change: 62 sheets move by 0.05+. Mean -0.01, range -0.6 to +0.2. Rounded score changes: 9. Band word changes: 0.
- Edited: one odd move -0.11 on average (min -0.5); all six edited: -0.49 on average (min -2.5), record share 0.

## What it can't tell
- Not a walk-forward test: real results come from real sheets, not edited teams, so the scoreboard can't judge edits.
- The effect is small either way (at most 2.5 points on a fully edited six).

## Recommendation
- The looser rule. It keeps the promise for real sheets, and edited teams stop borrowing a record they didn't earn.
