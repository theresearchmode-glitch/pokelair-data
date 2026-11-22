# Info sheets for Moves, Abilities and Items: research (Nov 22)

Owner: this chat designs it, mocks it up and writes the hand-off. The main chat builds it (Sim, Nov 22).
Decisions (Sim, Nov 22, 10:19 AM): use a pop-up sheet, not a page. Plan Moves, Abilities and Items together as one design, and build Moves first. It is a Step 1 step on the Plans page.
All checks were look-only, on claude/design6 at 9c478049 / b22fdc2e. The scratch scripts that produced each number are named in the text.
**Measured** means a script or the data was read, with its result. **Unsure** means not confirmed.

## 1. What we already have (measured)
- **Moves:** data.js `MOVES` has 510 moves. With move-meta.js (from the pinned Showdown champions mod, commit 1242c1e, Oct 27) that gives type, category, power, accuracy, priority, target, and flags (contact, sound, punch, bite, slicing, pulse, bullet, wind), secondaries and hits-through-Protect. move-acc.js holds the 113 moves under 100% accuracy.
- **Learnsets:** data.js `LEARN` covers 349 Pokémon (Rock Slide: 154 learners). It is shipped in the page. It was hand-built in October and has no generator.
- **Abilities:** data.js `ABIL` has 216 one-line texts, covering every Ability on the roster, including the new Champions Abilities.
- **Items:** items-list.js `REGMC_ITEMS` has 166 names. **There is no item text anywhere.** The only item effects live in the calc's tables (39-damage-calc-speed.js:95, :378).
- **Calc text we can reuse:** `calcResultNotes` / `calcNoResultText` (39-damage-calc-speed.js:467-476).
- **Sheet system:** `V2.sheet` (shell.js:156) already provides role=dialog, aria-modal, an inert page behind it, Tab kept inside, Escape and the back button to close, and focus returning to the opener, even when one sheet replaces another.
- **Tap hook:** every move draws through `V2.kMove` (kit.js:50-68); passing `attrs` makes it a button. Today 0 callers pass it. The main chat keeps kMove stable for us (decisions.md, Nov 22, 10:22 AM).
- **Ability and item names** render as plain text in monsheet.js:56, pokemon.js:64-76, team.js:85/186/190/212, team-frame.js:32, build-plot.js:98, build-sheet.js:22, sets.js:49-51 and calc.js:371.
- **Search** (`V2.openSearch`) already finds moves, items and Abilities, but picking one opens Winning Teams filtered by it, not a sheet.

## 2. Accuracy of the Champions data (measured unless marked)
- **Move text:**
  - Showdown has a desc/shortDesc for all 510 of our moves. Champions text sits as `champions: {}` entries in data/text/moves.ts.
  - 17 moves have Champions-specific text and 447 use the mainline text unchanged.
  - 41 differ only in numbers or flags, so their numbers must come from the mod.
  - **5 behave differently with no Champions text:** Milk Drink, Curse, Encore, Disable, No Retreat. We write these ourselves.
- **PP:**
  - The sheet must show the **in-battle PP**, which is (base/5+1)×4 with base capped at 20, so 5→8, 10→12, 15→16, 20→20. On top of that, the mod sets Protect, Wish, Sandstorm, Snowscape and Strength Sap to 5 base (8 in battle) and Night Slash to 20.
  - Matches Serebii on all 8 samples: Rock Slide 12, Protect 8, Fake Out 12, Heat Wave 12, Tailwind 16, Trick Room 8, Spore 16, Follow Me 20.
  - PP Ups: **unsure**, so leave them out.
- **Learnsets:**
  - Our LEARN matches Showdown on 349/349 Pokémon and 21,643 pairs.
  - **One bug:** Meowstic-F-Mega copies the male list. It has 5 moves it shouldn't (Wish, Imprison, Misty Terrain, Quick Guard, Mean Look) and is missing 2 (Extrasensory, Future Sight).
  - Generating LEARN from Showdown is simple and would fix this. Megas use their base form's list. Legal Pokémon are formats-data entries that aren't Illegal or Nonstandard.
- **Regulations:** Showdown has mods `champions` (Reg M-C) and `championsregmb` (M-B). No M-D yet.
- **Dec 2 patch:**
  - **Not in Showdown yet.** PR https://github.com/smogon/pokemon-showdown/pull/12475 is open (updated Nov 20).
  - It adds no text changes, so Rock Slide's text would still say 30% flinch. We override it.
  - Psych Up learners: 21 in the PR vs 22 in our notes. **Unsure**, check against the official page.
- **Ability text that is wrong for Champions** in our ABIL:
  - **Unseen Fist:** ours says "except Max Guard". In Champions it is contact moves only, at 1/4 damage through protection.
  - **Healer:** ours says 30%; in Champions it is 50%.
  - Incomplete: Berserk / Anger Shell (Sheer Force), Emergency Exit / Wimp Out, Run Away (now prevents trapping), Regenerator.
  - Flash Fire and Stalwart change Dec 2.
- **Champions rules a sheet must state correctly** (from the champions mod, `conditions.ts` and `scripts.ts`):
  - Paralysis: 1/8 chance to lose the turn.
  - Sleep: 2-3 turns.
  - Freeze: 25% chance to thaw each turn, always thawed by turn 3.
  - Spread moves: 0.75×.
  - Critical hits: 1.5×.
  - Moves through Protect: 1/4 damage.
  - Fake Out and First Impression: only on the first turn out.
  - Levitate, Lightning Rod, Storm Drain, Sap Sipper, Good as Gold, Armor Tail, Queenly Majesty, Dazzling, Prankster, Inner Focus, Overcoat and Soundproof: no Champions change, so mainline behaviour.
- **Items:**
  - Bought in-game with VP (700, or 1000 for Life Orb and similar), per Serebii.
  - **Not in Champions:** Safety Goggles, Covert Cloak, Clear Amulet, Loaded Dice, Choice Band, Choice Specs, Assault Vest.
  - Pokémon Zone lists 161 held items; ours has 166. **Unsure**, check.
- **Credit:** the text is MIT. Ship the licence notice with it, worded: "Move, Ability and item text adapted from Pokémon Showdown (MIT License), © Guangcong Luo and contributors."

## 3. Usage numbers (measured, scratchpad usage.mjs and sample.mjs)
- **Source:** the full Online tournament team sheets in `data/t2/` (Limitless).
  - All dates: 19,602 teams from 490 events, Sep 12 to Nov 18.
  - **Last 28 days (Oct 21 to Nov 18): 7,870 teams.**
  - Every team has a W-L record.
- **Official events:** out/official.json has 512 teams. Their numbers agree within about 1-5 points: Protect 100, Fake Out 71.7, Focus Sash 68.0.
- **No team sheets exist** for the Showdown ladder (aggregates only) or the Ranked ladder (rank order only).
- **The top-12 lists can't be used:**
  - Summing them double-counts: Protect would come out 409%.
  - They hide 183 moves (9 of them on 20+ teams).
  - They drop most users: Protect has 268 real users vs 96 in the lists.
  - So usage must be computed from the raw sheets in update.mjs.
- **Last 28 days, % of teams with it:**
  - Moves: Protect 99.6, Fake Out 66.3, Close Combat 58.6, Tailwind 52.9, Rock Slide 46.0, Wide Guard 18.0.
  - Items: Focus Sash 69.3, Sitrus 53.6.
  - Abilities: Intimidate 53.6.
- **Two numbers per user**, both measured. Example: Rock Slide users, Garchomp 1,621.
  - (a) Share of all users: Garchomp is 1,621 of the Rock Slide users.
  - (b) **How often that Pokémon runs it:** 62% of 2,634 Garchomp. Tyranitar runs it 99% of the time, Excadrill 85%.
  - (b) is the one players act on.
- **Thin data:**
  - 211 of 510 moves are on fewer than 20 teams (all dates); in the last 28 days, 282 are.
  - Items: 79 of 199. Abilities: 114 of 239.
  - Margin of error at n=20 is ±22 points.
  - Rule: under 20 teams, show "Rarely used (on N teams)". Show the per-user split only at 50+ teams.
- **Dirty names:** "Last Respect", "Sword dance", "High Horespower", "Poison Tourch", "Rought Skin", "Left Over", "Frosslasite", "Pixie Plate". They need the canon map (10-team-strategy.js:101 / names.mjs canonSet) and `nameOf` for site names, e.g. Hisuian Arcanine → Arcanine-Hisui.
- **Win rate when run:**
  - Computable, but raw numbers are confounded by player skill, by the Pokémon itself, and by best-of-3 rounds.
  - Leave it out until player skill is taken out (CLAUDE.md rule).
- **Trend:**
  - No history file holds moves or items.
  - The raw sheets carry dates, so it can be recomputed any time. Example: Rock Slide 30.4% (week of Sep 14) → 49.2% (week of Nov 9).
  - Optional, later.
- **Size:** a table for every move, item and Ability with the top 8 users is about 68 KB, or 20 KB gzipped (28-day window).

## 4. Other sites (look-only)
- **Serebii Champions Attackdex:** the richest page. Stats, Champions PP, flags and all learners, but no usage, and it is still pre-patch.
- **Pokémon Zone:** the closest competitor. Moves ranked by tournament usage; item and Ability pages with uses, top Pokémon, common partners and placements.
- **Pikalytics:** moves appear only inside each Pokémon's page.
- **Showdown dex:** "Pokémon with this Ability" plus "unavailable Pokémon".
- **Nobody combines** what a thing does + doubles notes in plain words + who actually runs it and how often + legal learners for the current regulation.

## 5. Design direction (for the mock-ups; Sim decides from pictures)
- **One shared sheet** for all three kinds:
  1. Header: name, kind, and type/category for moves.
  2. One plain sentence saying what it does.
  3. "In doubles" lines.
  4. Usage: % of tournament teams, with the source named.
  5. Who runs it: each Pokémon with "runs it X% of the time", tappable.
  6. Who else can learn it (moves) or has it (Abilities).
  7. Links: "See winning teams with it ›"; for moves, also the calc.
- **Per kind:**
  - Moves: power, accuracy, in-battle PP, priority, target.
  - Abilities: a "Mega Ability" tag.
  - Items: how to get it, and a "one use" tag. A Mega Stone opens its Pokémon.
- **Tapping a Pokémon inside a sheet** swaps to its sheet, with a back chip. Search opens the sheet.
- Thin data shows "Rarely used". Never empty bars.
