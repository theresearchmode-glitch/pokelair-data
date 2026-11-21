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
