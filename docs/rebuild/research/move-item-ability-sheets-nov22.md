# Moves / Abilities / Items info sheets (Sim, Nov 22): heads-up from Sim's other chat

Sim (Nov 22): the other chat is designing a "moves, items, and abilities" feature; this chat keeps working as normal; Sim brings the
mock-ups in when finalized. The other chat's note says "Sun Nov 22, 3:19 PM"; by our clock it arrived about 10:2x AM Eastern
(3:19 PM is likely UTC, i.e. 10:19 AM Eastern; not checked).

Decision (as relayed): tap-to-see info sheets for Moves, Abilities and Items, one design, Moves built first. A pop-up sheet (V2.sheet,
swipe/close back), not a page. Research only, nothing built. Their findings (look-only at 9c478049), kept for when it lands here:
- Have: 510 Champions moves (data.js MOVES + move-meta.js, from pinned Showdown champions data 1242c1e via experiments/gen-move-meta.mjs);
  LEARN for 349 Pokémon (hand-built, no generator); calc move notes (39-damage-calc-speed.js); Ability text (data.js ABIL).
- Hook: every move draws through V2.kMove (kit.js); passing attrs makes it a button; today no caller does.
- Missing: move effect text; whole-format move usage (summable from meta_tour/meta_ladder/SETS); Champions PP (unconfirmed);
  LEARN needs the Dec 2 patch moves (by hand or a generator from Showdown data/mods/champions, MIT, credit Guangcong Luo and contributors).
- Suggested sheet: header facts; one plain sentence; doubles lines; usage + top users; who learns it (legal now); links to sets and calc;
  a "changed Dec 2" note. Ability interactions to check against Champions rules first.
Note for this chat (Sim, Nov 22): the WHOLE section is designed and set up by another chat. This chat does not build or touch it; it keeps V2.kMove stable so their work merges cleanly.

## Sim, Nov 22 (time: 11:29 AM (11:29:22)  date: Sun Nov 22, 2026)
- Search must find every move, item and Ability and open its sheet (today: only those on winning team sheets, to Winning Teams).
- The other chat sends a prompt, package and mock-up; the mock-up is a mock-up. We build it our way, with our rules and checks.
