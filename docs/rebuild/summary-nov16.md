# Morning summary for Sim (authority 12:30 PM Sun Nov 15 to 8:00 AM Mon Nov 16)

DRAFT, kept up to date through the night; sent at 7:40 AM with the pictures beside each question.
Every decision is in docs/rebuild/decisions.md (from the 1:03 PM entry on). Pictures: docs/rebuild/pics/nov16/.

## What changed (grouped; each was checked, tested, committed and put on the Preview)
- Pokémon page: forms (A), partners two across to 899, folds on every width (A), Report a Mistake, page length 9,535 -> 4,840 at 320.
- The switch: every Pokémon tap opens its page; the old sheet is retired; tests translated.
- Build: no more flicker while building (last result stays, faded); the blue score frame is gone.
- Footer back (A); Never Suggest list (A); Fix your items first; set check tips.
- Parity with today's site: stale-data / new-regulation note, Day/Night carries over, rules caption, Usage order, ~20 smaller gaps.
- Function sweep (10 sure findings), code review A1-A6, B1-B5, B9-B14, C2, C3, C6-C8, regression sweep, full layout sweep at 13 widths.
- Commits: work in Auto mode again (the blocker was a model-name line in the commit message; Sim approved the settings file).

## Questions (each with pictures in the message)
1. A core's share on phones (today hover-only). Pictures: core-pct-now.png, core-pct-A.png. Recommend A: '671 teams (4.9%)' on the line that already
   shows the count. Why: touch players never see a hover title; no new element.
2. Fold styles: 8 kinds today. Picture: folds-today.png. Recommend: one style for text folds (title + one-line summary + › on the right, as Damage Calc
   and 'More on Home'); How We Calculate tiles stay tiles. Why: one look = players learn it once.
3. Winning Teams champion names at 700-1024. Pictures: wt-names-A-one-size-900.png (live now), wt-names-B-per-card-900.png. Recommend B: only the
   name that needs it shrinks. Why: five names keep the big slanted look ('keep the WOW'); the one smaller name is on the outer card.
4. Undo inside an open sheet: the toast sits under the backdrop (your Nov 11 rule), so its Undo can't be used while a sheet is open (e.g. Remove in
   Edit Set: no Undo shows at all). Pictures: undo-in-sheet-now.png, undo-in-sheet-A.png. Recommend A: 'Removed Whimsicott · Undo' inside the sheet, in the
   Undo bar style Suggestions already uses. Why: Undo should always be reachable.
5. Game Plan link: tap area 47px tall but only 19px above its centre (the checker wants 21). Fix moves the line 2px down. Picture: (to make).
6. Plan settings (Count abilities, Refresh plans): where they live. Pictures: (to make).

## After the switch (Sim, Q1 A)
- Cross-device sync (code review B8), its own step tested on two devices; delete the old site's dead code (C1).

## Before the switch (checklist)
- Publish the live page with the same runtime capabilities as today's live artifact (read it first).
