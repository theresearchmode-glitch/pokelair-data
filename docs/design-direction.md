# NastyPlot design direction

Decided by Sim (Simran), Nov 4 2026, after four rounds of mockups (21 concepts). Follow this for any visual work on NastyPlot.

## The direction: Character Select + Pictogram

The site is built around a fighting-game **character select** screen, done with modern restraint, with small elements borrowed from the **Pictogram** concept.

From Character Select (the core identity):
- Italic condensed caps display type with energy, clean body text, mono for numbers and labels.
- One bold accent: magenta. Everything else calm (off-white ground; near-black in dark mode).
- A roster of Pokémon in skewed square cells with upright sprites, a P1 cursor, and a big "selected" panel showing usage, win rate and speed.
- A VS splash for matchups (your leads vs the top threats).
- Your six as a team-order slot bar.

From Pictogram (used with restraint):
- 18 flat geometric type symbols (45°/90° construction on a 24px grid, one ink colour) as the site's icon set: type chips, filters, coverage grid, nav.
- Pastel type colours in small doses: stripes, chips, the selected panel's tint.
- Strict 12-column grid and lowercase mono labels.

## Sim's rules

- **No cards, ever.** This is VGC, not TCG. No card metaphors (tarot, trading cards), no Pokémon in a card-shaped box with a picture above text. Character-select roster cells are approved; team members are shown as slots, rows, line-ups or on floor lines.
- **Colourful, never tiring.** Sim loves colour, but it must still feel fresh on the 1,000th visit: one colour-rich moment per page, calm surfaces elsewhere, colour in meaningful doses, at most two strong hues per screen, no saturated full-bleed backgrounds behind reading areas, motion plays once (no looping attention-grabbers).
- **On theme.** Visual ideas come from the world players live in: games, anime, cartoons, VGC itself. Not unrelated metaphors (sheet music, weather, textiles, sports tracks were rejected as out of place).
- **Original, not copied.** Evoke game genres; never copy Nintendo or Game Freak screens, logos, fonts or the Poké Ball.
- **Alignment.** Every sprite sits in a fixed slot anchored at its feet. Measure each sprite's empty space at the bottom (alpha bounding box) and offset by it so feet land on the platform, floor line or pedestal. Never enlarge a 256px sprite past about 1.5×, or it looks soft.
- **Keep every feature.** A redesign must keep every tool reachable: Build (build me a team, cores), My team (grade, threats, defense, offense, fixes, best additions, saved/compare teams, my box), Battle (matchup, battle log, speed tiers, damage calc, archetypes, gauntlet, team preview practice), Meta (ratings, usage, sets, cores, events, teams, type matchups, weekly), search, and light/dark.
- **Real data only.** Use real numbers from `out/`; label any example (win chance, damage rolls, sample battles) as an example. Flag small samples (e.g. Charizard: 52 teams).

## Rejected, for reference

Device (hardware), Arcana (cards), and the off-topic round-2 ideas (Score, Forecast, Weave, Lanes). The previous site look (cream boxes, black outlines, yellow buttons, manga speed lines) felt lazy and templated.
