# Job 56 — Reg M-D Fixture Teams (`alt/gemini-md-fixtures`)

## Deliverables
- `experiments/fixtures/md-teams.json` — 12 realistic Regulation M-D VGC doubles teams (6 Pokémon each, 72 full sets: `name`, `item`, `ability`, `moves` [4], `nature`, `points` [6 integers in `0..32`, sum `<= 66`], Species Clause, Item Clause).
- `experiments/md-fixtures-test.mjs` — verifies every set against `regulation.json` (`regs['M-D']`), `experiments/regmc-legal.txt`, `app/src/data/data.js` (`ROSTER`), `data/regmc-items.txt` (+ `Heatranite`, `Tatsugirinite`), Showdown's `Dex.mod('champions')`, and `TeamValidator('gen9championsvgc2026regmc')` (with explicit allowlist only for the announced M-D additions and official Dec 2 balance patch moves), then scores every team with `out/model.json` using the Strength Score formula from `app/src/app/35-win-model.js` + `app/src/app/60-concept-h.js` + `team-basics.mjs`.
- Zero changes to any page, model, or `out/` file.

## Strength Scores (Current Model: `M-C`, `2026-11-26`)

| # | Team | Archetype | Score | Band | Win% | Rank% | In M-C Model |
|---:|---|---|---:|---|---:|---:|---:|
| 1 | Mega Heatran Balance | Mega Heatran | 88.9 | Tournament ready | 57.3% | 83.7% | 5/6 |
| 2 | Dondozo + Tatsugiri Commander | Dondozo + Tatsugiri | 81.9 | Tournament ready | 51.5% | 54.1% | 4/6 |
| 3 | Hard Trick Room | Trick Room | 77.4 | Solid | 47.8% | 35.6% | 6/6 |
| 4 | Tailwind Hyper Offense | Tailwind | 76.1 | Solid | 46.8% | 30.7% | 5/6 |
| 5 | Sun Charizard Y | Sun | 80.8 | Tournament ready | 50.6% | 49.5% | 5/6 |
| 6 | Rain Archaludon | Rain | 76.3 | Solid | 46.9% | 31.3% | 6/6 |
| 7 | Dec 2 Psych Up Alakazam + Dozo | Dec 2 Psych Up | 74.0 | Solid | 45.1% | 24.1% | 4/6 |
| 8 | Dec 2 Roost Hydreigon + Mega Heatran | Dec 2 Roost Hydreigon | 75.1 | Solid | 46.0% | 27.7% | 5/6 |
| 9 | Sand Tyranitar + Excadrill | Sand | 83.7 | Tournament ready | 53.0% | 61.7% | 6/6 |
| 10 | Snow Aurora Veil | Snow | 73.5 | Solid | 44.7% | 22.6% | 5/6 |
| 11 | Psyspam Gardevoir + Armarouge | Psychic Terrain | 80.9 | Tournament ready | 50.7% | 50.1% | 5/6 |
| 12 | MaushApe + Mega Metagross Balance | Balance | 77.9 | Solid | 48.3% | 37.7% | 6/6 |

Unseen M-D Pokémon (`Heatran`, `Heatran-Mega`, `Dondozo`, `Tatsugiri`) contribute `0` in `model.mons` / `model.pairs` / `model.sets` and score cleanly with zero errors.

## Legality Notes
- **M-D announced additions (`regulation.json`):** `Heatran`, `Heatran-Mega` (`Heatranite`, official ability `Water Compaction` per `regulation.json`), `Dondozo` (`Order Up` verified in `Dex.mod('champions')` learnset), `Tatsugiri` (`Commander`).
- **Dec 2 balance patch moves:** Team #7 uses `Psych Up` on `Alakazam-Mega` (one of the 22 official Dec 2 `Psych Up` species); Team #8 uses `Roost` on `Hydreigon`. On M-C species, `TeamValidator('gen9championsvgc2026regmc')` is still run on the full set and only the specific official Dec 2 move error is exempted.
- **Champions-specific move differences caught on initial run:** First run of `md-fixtures-test.mjs` failed (18 failures) because `Incineroar` cannot learn `Knock Off` in Champions (replaced with `Darkest Lariat`), `Archaludon` cannot learn `Body Press` (replaced with `Draco Meteor`), `Metagross-Mega` cannot learn `Heavy Slam` (replaced with `Iron Head`), and `Floette-Mega`'s learnset chain needed `species.changesFrom` (`Floette-Eternal`).

## Verification
- **Pass-after (`checked` by running `node experiments/md-fixtures-test.mjs`):** `ALL PASSED (12 teams, 72 sets verified legal and scored)`, exit 0.
- **Fail-before / negative test (`checked` by running `node experiments/md-fixtures-test.mjs /tmp/broken-md-teams.json`):** Injected 5 defects into a temporary copy (non-M-D species `Flutter Mane`, illegal Champions move `Knock Off` on `Incineroar`, illegal item `Choice Band`, duplicate `Focus Sash` Item Clause violation, and 96 > 66 stat points). Reported `13 FAILED` with clear messages, no stack trace, exit 1.
- **Syntax check (`checked` by running `node --check experiments/md-fixtures-test.mjs`):** exit 0.
- **Not checked:** Browser UI rendering of these teams (not requested; no page code touched).
