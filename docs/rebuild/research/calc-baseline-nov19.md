# Damage Calculator: baseline before the redesign (Nov 19, 3:57 PM)
Sim, Nov 19, 3:55 PM: the calculator will be redesigned ("too messy, too much going on"); his prompt and mock-ups follow. The mock-ups give
the direction; our rules give the colours, sizes, fonts, spacing and corners. This file records today's page so the redesign can be checked
against it: nothing may be lost (CLAUDE.md: never remove functionality).

**Measured** (Preview build of 1936b67e, built-in data, default state #calc, Chromium; script in the session scratchpad, calcbase/m.cjs):
- 390 x 844 phone: 2,945px = **3.49 screens**; 61 visible controls, 17 of them inputs/selects; 0 page errors.
- 1440 x 900 desktop: 1,560px = 1.73 screens; 67 visible controls (the Battle tabs row adds 6); 0 page errors.
- Pictures: research/calc-baseline/calc-390.png, calc-1440.png (full page).

**What the page holds today** (visible controls and headings, default state):
- Attacker card (Mega Charizard Y): pick Pokémon; quick move buttons with their % and KO (Solar Beam 33-39% 3HKO, Weather Ball 126-149%);
  move picker (any move); set: points per stat (32 max), nature, item, Ability, stat stage -2..+2.
- Swap attacker and defender.
- Defender card (Sneasler): pick Pokémon; set: points per stat, item, Ability.
- Field: Weather, Terrain; toggles Hits both foes (spread), Screen up, Helping Hand, Friend Guard, Critical hit.
- The KO Board: "Your hits on them" / "Their hits on you"; groups "18 down in one hit", "8 can go down", "4 survive"; one button per top
  threat (about 30) with the best hit on each; "Your best hit on each top threat".
- "How the Calc Works ›" link.
- Not measured here: states after opening a set or a picker, other attackers, a team loaded from My Team.

Use: after the redesign, rerun the same measurement and list; every item above must still be reachable (or Sim agreed to drop it).
