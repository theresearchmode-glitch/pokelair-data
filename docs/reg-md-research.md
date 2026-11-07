# Reg M-D research (Nov 7, 2026)

What is known before Reg M-D, gathered to plan NastyPlot's switch. Confirmed facts first, then expectations.

## Confirmed
- **Dates so far** (Bulbapedia, Victory Road): Reg M-A Apr 8 – Jun 17, Reg M-B Jun 17 – Sep 9, Reg M-C Sep 9 – **Dec 2, 2026**
  (Victory Road's rules page). So Reg M-D most likely starts **Dec 2, 2026** (Game8 says the same). Each regulation ran ~3 months.
- **Tournament organisers are already listing Reg M-D events** on Limitless for December (e.g. London Corviknights Weekly Tour 25,
  Talon's Fight Club #114 on Dec 18). Our daily job reads Limitless formats, so these are what will trigger the switch.
- **No official M-D roster, Megas or rule text is published yet** (Nov 7). Showdown has no M-D format yet either.
- **How the last switch worked (M-B → M-C)**, checked against Showdown's own data:
  - 35 Pokémon/forms **added**, **none removed**: Wigglytuff, Persian (+Alola), Perrserker, Farfetch'd, Sirfetch'd, Mr. Mime,
    Swalot, Salamence (+Mega), Mega Absol Z, Mega Garchomp Z, Mega Lucario Z, Gogoat, Golisopod (+Mega), Rillaboom, Cinderace,
    Inteleon, Thievul, Toxtricity (both forms), Grapploct, Pincurchin, Indeedee (M and F), Arboliva, Baxcalibur (+Mega), Pawmot,
    Squawkabilly (4 colours), Mabosstiff.
  - 4 new items: Psychic, Misty, Electric and Grassy Seed.
  - **Rules unchanged**: auto level 50, Mega Evolution allowed, item clause, species clause, bring 6 pick 4, open team sheets.
- **Showdown keeps each old regulation as its own data set** (M-B lives in the `championsregmb` mod; the current one is `champions`).
  When M-D arrives, the current set should become M-D and M-C should move to its own set, so the new legal list can be read
  straight from Showdown. Our 345 Pokémon match Showdown's current M-C list exactly (only in-battle forms differ:
  Castform weather forms, Aegislash Blade).

## Expected, not confirmed (community talk)
- Adds Pokémon and Megas again, most likely without removing any (the pattern so far).
- Mega Heatran is widely expected, and with it possibly non-restricted legendaries or mythicals for the first time.
- A Pokémon Champions celebration event Dec 8–14 is thought to line up with the new regulation.

## What this means for NastyPlot
- Main risk is **new Pokémon** NastyPlot doesn't know yet (no stats, moves, sprites; usage would drop them).
  Handle new arrivals first; removals stay supported but are less likely.
- If legendaries arrive, check sprites, the ratings model and any "restricted" rule.
- Watch for the M-D Showdown format (`gen9championsvgc2026regmd`) and the `championsregmc` mod; that's the day the rebuild
  script can run for real.
