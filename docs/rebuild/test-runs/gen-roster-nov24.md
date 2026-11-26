# M-D roster generator: experiments/gen-roster.mjs (reg-md-plan Phase 0.2, gap G10), Nov 24

Branch `alt/gen-roster` from `claude/design6` at **33ec968b**. Showdown: `npm install github:smogon/pokemon-showdown#1242c1e2d9763ba5b85d33f13aecb89bae19ae3d`
and `node build` (as .github/workflows/test.yml:487-488) → `npm rc=0`, `build rc=0`.

## What it does
`node experiments/gen-roster.mjs --ps <showdown folder> [--format gen9championsvgc2026regmc] [--out f] [--report f.md] [--add extra.json] [--write]`
rebuilds ROSTER, ABIL, MOVES and LEARN in app/src/data/data.js from Showdown's data for one format, copies every other block as it is,
writes a new file (default experiments/out/data.generated.js; data.js only with --write) and prints a change report by name.

**Who is in the roster** (checked in Showdown's code and data; no list typed by hand):
- The format (config/formats.ts:296) is `mod: 'champions'`, ruleset Flat Rules (bans Mythical and Restricted Legendary, data/mods/champions/rulesets.ts:35-40).
- The mod's formats-data.ts marks unusable species `isNonstandard` ("Past" 1,000 of them) / `tier: "Illegal"`.
- So: exists, not isNonstandard, not banned by the format's rule table, not an in-battle-only form unless a Mega, not cosmetic
  (flagged, or a non-Mega form with the same types, stats and Abilities as its base, unless today's file has it).
- Learnsets: the mod's learnsets are already flat (all 15,764 entries "9M"). A form without its own uses the form it changes from
  (Floette-Mega → Floette-Eternal, Meowstic-F-Mega → Meowstic-F, as today's file does), then its base species.
- MOVES rows `[name, type index (engine/types.js TYPES), category, power, sound, spread]` (as read by 00-main.js:30), numbered in
  order of first use, walking the roster with each learnset in move-id order.

**Carried over by name, not from Showdown** (Showdown can't give these):
- `u` / `us` (the built-in usage fallback, 01-state.js:41)
- each existing Ability's text: ours says "×" where Showdown says "x"; a new one gets Showdown's text with x → ×
- DEFAULT_BOX, SETS, RESULTS, PERF_RAW and the comments between blocks, copied byte for byte
- each entry's key order
- **the roster order**: today's is hand-made (Perrserker beside Persian, Politoed before Alakazam, but Annihilape near the end),
  probably the game's own list; no rule from Showdown's data rebuilt it. Every existing Pokémon keeps its place. A new form goes
  after its family's forms (before their Megas); a new family goes after the closest lower Dex number.
- **one hand decision**, named in the script with its reason: `HAND_OMIT = {'Meowstic-F': …}`. The site folds Meowstic-F into
  Meowstic (the paste importer maps it, app/src/app/19-showdown-paste.js:76); only its Mega is separate.
- **SPRITE_ID is app code** (app/src/app/15-visual-helpers.js:6), not data.js. The report lists every roster entry without one
  for a hand edit.

## PROOF: Reg M-C rebuilds today's data.js identically
`node experiments/gen-roster.mjs --ps <showdown> --report experiments/out/regmc-proof.md` → report: "Roster 345 -> 345 entries;
moves 510 -> 510; Abilities 216 -> 216. Byte-identical to today's text: ROSTER yes, ABIL yes, MOVES yes, LEARN yes; whole file yes."
Added / removed / changed: none.
`cmp app/src/data/data.js experiments/out/data.generated.js` → no output (identical).
How it got there (each step checked against data.js, nothing in data.js changed):
- First run: types, stats, Abilities, learnsets and every move row matched with no fix. Only order and two roster entries differed.
- **Squawkabilly-Blue:** the "same as base" rule dropped it. Fixed: kept when today's file has it.
- **Meowstic-F:** Showdown has it as legal; today's file doesn't. Found to be a site decision (above), so it's carried as HAND_OMIT.
- **Order:** move-id order inside learnsets (muddywater before mudshot); battle-only LEARN entries after their Pokémon; roster
  order carried over (no Showdown rule fits it).
45 legal forms are left out by the rule (listed in regmc-proof.md): cosmetic Vivillon / Alcremie, in-battle forms (Castform weathers,
Aegislash-Blade, Minior-Meteor, Mimikyu-Busted, Cramorant, Eiscue-Noice, Morpeko-Hangry, Palafin-Hero, Ogerpon-Tera),
same-as-base forms (Polteageist-Antique, Sinistcha-Masterpiece, Maushold-Four), Meowstic-F (hand).

## Dry run for M-D: M-C + Mega Heatran (made up)
`--add experiments/out/md-dryrun-add.json` (Heatran-Mega, Fire/Steel, 91/120/106/175/141/67, no Ability given, PokéAPI 10311).
Report (md-dryrun-report.md): "Roster 345 -> 346; Abilities 216 -> 217".
- **Added:** Heatran-Mega, Ability "not announced yet", 68 moves as a stand-in (Showdown's Heatran learnset, filtered to moves in the
  champions mod, not checked against the game).
- **Warning:** its base form Heatran isn't in the roster (Heatran is `isNonstandard: Past` in M-C).
- **Ability added:** "not announced yet".
- **Needs a SPRITE_ID:** Heatran-Mega (PokéAPI id 10311).
- Placed after the Rotom forms (#479, the closest lower Dex number). No existing entry changed. data.js untouched.

## Tests with the generated M-C file swapped in for data.js (then put back)
Swapped in: `cp experiments/out/data.generated.js app/src/data/data.js` → "cmp with original: identical". After the tests, the original
was put back → `git diff` "clean". (Because the file is byte-identical, these runs prove the swap changes nothing; they can't show more.)
- `node app/build.mjs` (old page, for legality-check) → rc=0
- `SMOGCALC=<@smogon/calc 0.12.0> node experiments/legality-check.mjs` → rc=0. "REG M-C: 345 page species; 0 whose base species is not
  on the Reg M-C list"; "official RK9 teams with duplicate items (should be 0 under Item Clause): 0". It also prints its usual
  comparison with @smogon/calc ("species data differences (240)", mostly Abilities the page has and the calc's data doesn't). Same
  bytes as today, so the same output as today; not looked into here.
- `node app/test/run.mjs` → rc=0, "ALL PASSED"
- `node app/build.mjs --v2 --preview-data` → rc=0, "v2 guard: clean (…)"
- `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` → rc=0, pass 145, FAIL 0

## Risks and limits (say before roster day)
- **Showdown must have the M-D format** (a new format id, maybe a new mod as with championsregmb). Until it does, `--add` is the
  only way in, with hand-typed data.
- **Roster order is carried over:** a large M-D roster would put every new family by Dex number, while today's hand order follows
  some other list. Sim may want that list (not checked).
- **New Abilities get Showdown's English text** with "x" → "×", not our edited wording.
- **u / us are 0 for new Pokémon** until the usage data runs.
- **It doesn't touch move-meta.js / move-acc.js / info-text.js** (gen-move-meta.mjs and gen-info-text.mjs do), SPRITE_ID, items, or
  the Mega stones (stoneFor).
