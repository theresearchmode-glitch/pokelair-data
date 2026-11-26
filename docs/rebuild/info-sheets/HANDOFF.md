# Info sheets for Moves, Abilities and Items: hand-off for the build (Nov 22)

This chat designed it and Sim approved it. The main chat builds it, one step at a time, with its usual checks.
Read this file, then RESEARCH.md (all findings, with numbers), then look at the approved pictures in `r3-labelled/`.
The mock-up code is `tools/mock.cjs`. It is a **reference** for markup and CSS, not code to paste in: it injects HTML into the
published Preview with V2.sheet and uses mock numbers from `tools/sample-28.json`.

## Sim's decisions (Nov 22, times from the PC's Windows clock, Eastern)
- **10:19 AM.** A pop-up sheet (V2.sheet), not a page. Moves, Abilities and Items are planned together as one design, and Moves are built first. It is a step in Step 1 of the Plans page.
- **Round 1, 10:34 AM.** "Not as huge, seems like we're shouting at our playerbase", but "dont get rid of the fun and creativity, that's essential".
- **Round 2, 10:55 AM.** Approved the recommended options:
  - (1) the calmer volume;
  - (2) "Usual suspects" rows read "X% of [Pokémon] run it", not the share of all users;
  - (3) no move ticket repeated under the name (the type is a chip on the tab).
- **Then:** "nothing clearly distincts an item from a move from an Ability ... be creative".
- **Round 3, approved 11:29 AM** ("looks good to me. move forward"). Each kind is its own case-file object:
  - **Move = case file:** a slanted ticket in the move's type colour (the same shape as the move tickets across the site), faint speed lines, a kicker reading "CASE FILE · MOVE".
  - **Ability = ID card:** a dark rounded card (`--plate`), a 12px logo-blue strip down the left, a big faint fingerprint (SVG), a "TRAIT ON FILE" stamp, a kicker reading "ID CARD · ABILITY".
  - **Item = evidence tag:** a manila tag shape with a punched hole, a string and a dashed tear line, a red "EVIDENCE" stamp (hidden under 700px wide), a kicker reading "EVIDENCE · ITEM".
  - **Section-head markers match the kind:** a slanted bar for moves, a ring for Abilities, a tag for items.

## The sheet, top to bottom (all three kinds)
1. **The tab.** It holds the kicker, the name (Unbounded, slanted, t34; t28 on phone) and the sub line:
   - Moves: type chip + Physical/Special/Status.
   - Abilities: "Ability" + the TRAIT ON FILE stamp.
   - Items: "Held item".

   On the right is the share: "46% of tournament teams" (on phones it sits under the name). Behind it, the name as giant outlined letters, decorative and aria-hidden.
2. **One plain sentence** saying what it does (t17).
3. **Moves only: a "CHANGES DEC 2" stamp** beside the sentence while a patch note applies (accuracy 90% → 95% · flinch 30% → 20% for Rock Slide). It shows for the first weeks after the Dec 2 patch, like the site note planned in CLAUDE.md.
4. **A stat strip** (small labels t13, values Unbounded t20; t17 on phone, 3 columns):
   - Move: Power, Accuracy, **PP (in battle)**, Priority, Hits (Both foes / One foe / ...), Contact.
   - Ability: Teams, Pokémon run it, Can have it.
   - Item: Teams, Pokémon run it, Uses per battle.
5. **"On the field."** ("what it means in doubles"): 2 to 4 short lines. See the checklist below.
6. **"Usual suspects."** ("who runs it, and how often · tap one to open it"):
   - The top 6 users, 3 columns on desktop and 1 on phone.
   - Each row: sprite 48px, name, "62%", "of 2,634 Garchomp run it".
   - A source line under it: "Online tournaments, last 28 days (dates) · N teams".
7. **"Also capable."** For moves, "can learn it: N Pokémon in Reg M-C". For Abilities, "can have it". Then 20 sprites at 40px and "Show all N ›". Mega forms are left out of move learners (they share the base form's list); Abilities list each species once.
8. **Links:** "Try It in the Calc ›" (moves) and "Winning Teams With It ›".

**Size and length:**
- Desktop sheet width min(880px, 100% − 64px). The close button sits above the tab, not floated beside it, so content uses the full width.
- Measured phone height (390×844): Rock Slide 1.8 screens, Intimidate 1.6, Focus Sash 1.3.

**Colours** (the white text on the tab keeps the day colour in night mode):
- Move tab: `--ty-<Type>`.
- Ability strip: `--logo-blue`.
- Item: **two new tokens needed**: manila `#E9D5A1` (tag), its hole ring `#C9B27A`, and the stamp/accent red `#C41E35` (= day `--pick-text`).
- Night must keep the tag manila with dark ink, as in focus-sash-1440-night.png.

## Behaviour
- **Opening a sheet:**
  - Every move name opens its sheet. Pass `attrs` to `V2.kMove`, which renders it as a `<button>`. The main chat kept kMove stable for this.
  - Ability and item names, where they render, open their sheets. Places: monsheet.js:56, pokemon.js:64-76, team.js:85/186/190/212, team-frame.js:32, build-plot.js:98, build-sheet.js:22, sets.js:49-51, calc.js:371.
  - Search: picking a move, item or Ability opens its sheet, not Winning Teams. Winning Teams is the link inside the sheet.
- **Tapping a Pokémon** inside a sheet swaps to that Pokémon (its page, the same as `data-v2mon` today). The opener's focus return already works when one sheet replaces another (`prev.back`).
- **Accessibility:** V2.sheet already provides dialog, inert page, Tab trap, Escape and the back button. Use the label = the name. The fingerprint, giant letters, string and stamps are decorative (aria-hidden), and the kicker words carry the kind for screen readers.
- **Thin data:**
  - Under 20 teams: "Rarely used (on N teams)" in place of the share.
  - Usual suspects only shows at 50+ teams.
  - With 0 teams: "Not run on any tournament team in Reg M-C yet". Keep the sentence, stats and learners.

## Data (all measured in RESEARCH.md)
- **Usage:**
  - Computed in update.mjs from the raw Online tournament sheets `data/t2/` (the same KEEP filter as meta_tour), over the last 28 days. **Not** from the top-12 `mv` lists, which double-count (Protect would read 409%) and hide 183 moves.
  - Names go through `canonSet` and `nameOf` (e.g. Hisuian Arcanine → Arcanine-Hisui), and the misspellings get folded ("Last Respect", "Rought Skin", "Left Over"...).
  - Size: about 20 KB gzipped for every move, item and Ability with the top 8 users.
- **No win rate** until player skill is taken out (CLAUDE.md). A trend line is possible later from the dated sheets.
- **Text:**
  - Moves come from Showdown `data/text/moves.ts`, using the `champions` entries where present.
  - **Write our own override text** for: Milk Drink, Curse, Encore, Disable, No Retreat; Unseen Fist (contact only, 1/4 damage through protection), Healer (50%), Run Away (now prevents trapping); and after Dec 2, Rock Slide (20% flinch), Flash Fire (the boost stays through Mega), Stalwart (also ignores Substitute).
  - Our ABIL text is wrong today for Unseen Fist and Healer.
  - Items have no text anywhere yet; write a sentence for each legal item.
  - Ship the MIT notice: "Move, Ability and item text adapted from Pokémon Showdown (MIT License), © Guangcong Luo and contributors."
- **PP:** in-battle PP = (base/5+1)×4 with base capped at 20, so 5→8, 10→12, 15→16, 20→20. The mod also sets Protect, Wish, Sandstorm, Snowscape and Strength Sap to a base of 5 (8 in battle), and Night Slash to 20. Matches Serebii on all 8 samples. Show no PP Ups.
- **Learnsets:**
  - Our LEARN matches Showdown on 21,643 pairs. Fix **Meowstic-F-Mega**: it copies the male's list, so it has 5 moves it shouldn't (Wish, Imprison, Misty Terrain, Quick Guard, Mean Look) and is missing 2 (Extrasensory, Future Sight).
  - Better: generate LEARN from Showdown `data/mods/champions/learnsets.ts`.
  - The Dec 2 learner additions (PR smogon/pokemon-showdown#12475, not merged on Nov 22; Psych Up count 21 vs our 22, check against the official page) land with the Dec 2 work.
- **Items not in Champions:** Safety Goggles, Covert Cloak, Clear Amulet, Loaded Dice, Choice Band, Choice Specs, Assault Vest. Give no sheet; when searched, show one line: "Not in Pokémon Champions."

## Sim must check these hand-written "On the field" lines before they ship
None of these has a Champions change in Showdown's champions mod (checked); they follow mainline rules.
- **Rock Slide:**
  - "Hits both foes, each for 0.75× damage"
  - "Never hits your partner"
  - "Blocked by Protect and Wide Guard"
  - "Flinch only works if it moves first"
- **Intimidate:**
  - "Hits both foes at once"
  - "Works again each time it switches back in"
  - "Defiant and Competitive foes get a boost instead"
  - "Inner Focus, Oblivious, Own Tempo and Scrappy ignore it"
- **Focus Sash:**
  - "Fake Out or any chip damage first breaks it"
  - "Multi-hit moves can still finish it"
  - "Best on fast, frail Pokémon"

**Hand-written lines are only for the most-used ~20 items and Abilities, plus moves where a rule matters.** Everything else shows the auto lines a move's data gives: spread 0.75×, hits partner, contact, priority, blocked by Protect / Wide Guard / Quick Guard, sound, first turn only.

## Suggested build order (one change at a time, as usual)
1. Data: a usage table from data/t2 in update.mjs; LEARN fix (Meowstic-F-Mega) or a generator; PP; text and overrides.
2. The Move sheet + tappable move tickets everywhere.
3. The Ability sheet, then the Item sheet (+ the new tokens).
4. Search opens the sheets. Dec 2 stamp and text updates on Dec 2.

Every step needs a picture for Sim and its checks before the next one.

## Files in this folder
| Path | What it is |
|---|---|
| `RESEARCH.md` | All findings and numbers |
| `HANDOFF.md` | This file |
| `r3-labelled/` | **The approved design** (10 pictures) |
| `r2-labelled/`, `r1-labelled/` | Earlier rounds, kept for history only |
| `r1-pics/`, `r2-pics/`, `r3-pics/` | The same pictures without labels |
| `tools/mock.cjs` | Round 3 mock-up (markup and CSS reference) |
| `tools/mock-r1.cjs` | Round 1 mock-up |
| `tools/usage.mjs` | Usage measurement (reads a checkout, writes only its own folder) |
| `tools/sample.mjs` | Usage measurement, the version that produced the mock numbers |
| `tools/sample-28.json` | The measured numbers used in the mock-ups |

Note: the tools use paths on Sim's PC (Playwright from pl-pcrun, the downloaded Preview files in a scratch folder named in tools/pv-shot.cjs). Change those two paths to rerun elsewhere.
