# Reskin: a Pokémon's page "THE FILE" (#pokemon) — brief

Sources: inventory.md section "pokemon"; PC mock `git show 90b3979d:docs/rebuild/mocks/cohesion-nov21/pages/pokemon.html`
(picture 27-pokemon-1440/390); review hV: desktop works (bursting hero, stat bars, How to build it, partners as cards);
problems: the "Jump to" sentence is 6 chips (6 rows on phones), "The rest of the file" is 4 panels behind "Show ›" (folds by another
name), the phone hero gap with the pink move wrapping 3 lines, 99% / 5.9% spilling past the edge on phones.

Build (kit):
1. Kit header: kicker "POKÉMON · THE FILE", h1 = the Pokémon's name (form line above), lead = its tier + one fact.
2. Hero: V2.kHero(V2.kCard(n, {size:'hero', score, tier}), facts row (usage %, win rate, base Speed) + V2.kGo('BUILD AROUND IT.')
   + quiet links (Add to team, Compare, Set as Opponent — whatever today's page has; inventory). Phone: card on top, facts row,
   pink move one line (HYBRID 6).
3. Steps: 1 How to build it (most used complete set + items/abilities/moves/spreads with %), 2 Its partners (kit roster small cards),
   3 How it matches up (good / bad matchups as rows with kit tags), 4 The numbers (stats bars, rating ingredients, history).
4. No "Jump to" chip wall: the plan steps are the map. Every number fits its box at 320 (v2-overlap).
5. Every feature and hook from the inventory; phone no longer than today (3,796 px at 390).
Tests: D-meta-shell (pokemon checks), v2-overlap, kit-page, v2-minors POKE groups (grep pk-).

## UPDATE Nov 21, 2:55 PM: Sim's decisions on HH's mock-up (these win over the build list above)
Mock-up: docs/rebuild/mocks/pokemon-file/index.html (Incineroar, real data); pictures docs/rebuild/pics/nov21/pokemon-file/
(E-plotcard-*, F-*) and docs/rebuild/pics/nov21/moves/. Sim: "I love it" (E + the damage-bar flare + move tickets).
- Header: kicker "CASE FILE #0727 · POKÉMON" (the real National Pokédex number, 4 digits; Sim loves it), in INK, not pink.
  h1 "The file on <name>." (name in Plot blue), lead = "Pokémon Champions · VGC doubles, Reg M-C. Rated from N real tournament teams."
- Hero card (the kit card, hero size), sharper: flat tint of type 1 in the art area; its BACKDROP is the Pokémon's own plot:
  its share of top-cut teams per week (events.json top finishers, weeks with 100+ top-cut teams), drawn as the site's slanted
  bars on an ink baseline; newest week in type-1 colour, older weeks in type-2 colour. Score + tier in the name row, never on the art.
  Under the card: the trend tag ("▼ Falling" / "▲ Rising") + "Top-cut teams 38% → 22% in 5 weeks: the bars behind it.", then the
  Champions basics (Legal in Reg M-C · Level 50 · Points 0–32 · No Mega / Has a Mega).
- Beside the card: verdict line (one short line in character, e.g. "The format's bouncer. Fake Out, Intimidate, Parting Shot, gone."),
  4 facts (of tournament teams, win rate + games, brought from preview, leads the game), then "How to build it": item / Ability /
  nature / stat points, the 4 moves as KIT MOVE TICKETS (V2.kMoves, with share %), USE THIS SET. (the one pink move), Build around it,
  Copy for Showdown, Every move and item ›.
- Order of steps (Sim): 1 The rap sheet. (base stats, speed with Tailwind / Trick Room / max, why it rates N + the honest
  same-players line), 2 Known associates. (partners as kit cards + crews that won with it: record, event, six, its exact set),
  3 Hit list. And who's hunting it. (matchups: real damage both ways vs the top 30, KO / Likely / Maybe tags, each row a slanted
  damage bar in the MOVE's type colour with a black tick at 100% = the KO line; weak-to types + what walls it).
- NO red scribbles, NO stamps, NO pink kicker (Sim: "the red was too much"); NO gradient cover band (Sim: done badly).
- Rules: no generic AI design (CLAUDE.md); type symbols only with a label (none in the repo yet; helper to check source/licence).
- Phone at 390 no longer than today; the mock measured 3,792 px with everything above.
