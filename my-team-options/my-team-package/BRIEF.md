# My Team redesign: build brief

Sim approved this direction on Sat Nov 21, 2026 ("Now this is really fantastic"), then asked for refinements and a shorter phone page. These pictures are the result (5:51 AM ET). Show Sim screenshots before anything goes live.

## The pictures (look at these first)
- my-team-desktop-light.png (1440 wide)
- my-team-phone-light.png (390 wide)
- source/party4.mjs: the mock-up's HTML and CSS. source/pk.mjs holds the shared base CSS it reads. Port from these; don't redraw.

## The idea
Three parts in one black frame with a pink drop shadow:
1. **Your six:** the team as a simple numbered list.
2. **The one you tapped:** shown big, with its whole set and its buttons.
3. **Suggestions:** beside it.

What Sim liked is how clear and direct this is. Keep that.

## What Sim rejected on the way here (do not bring back)
- **Lead / Back / Bench:** "we dont do lead back bench anymore". The six are equal spots, with no groups.
- **The Box and drag-and-drop:** "I don't like the whole drag and drop aspect… I don't think we need the box".
- **Outside metaphors:** a police line-up, stickers, fight posters ("random concepts that have nothing to do with pokemon or team building").
- **The graph-paper background.** That belongs to the Damage Calc's "The Plot" only ("i dont want the same plot background on every page").

## The layout
### Header (above the frame)
- A status line: "My team · 6 of 6 · Sun team · Legal for Reg M-C ✓".
- The team name, big.
- The sample-team line, then "Build Me a Team ›" and "Import a Team ›" as two full-size buttons side by side.
  - This fixes the 820-wide tap failure from the Nov 20 PC check (v2-q69 / tap-size: two 20px links stacked 19px apart).
- The Strength Score, big and blue, with its band word and the win line.
- The action links: Why This Score?, Team Sheet, Share as Image, Saved Teams, More, Saved ✓.

### The frame, desktop (1000+): three columns, 372 / 1fr / 400
- **Your six** (bar: "Your six · tap one to see it"). Six rows. Each row has:
  - its number and picture,
  - name, item · Ability,
  - rating and tier,
  - four moves in type colours (2×2),
  - a left edge in its first type's colour.
  - The chosen row is yellow, with a small arrow pointing into the middle panel.
- **The one you tapped** (bar: ‹ name, "4 of 6", ›).
  - A stage in the Pokémon's two type colours, with the rating big in the corner and an "S tier" tag.
  - Under it: types, Item and Ability boxes, the four moves as big type-coloured bars.
  - Then Edit set, Replace, Remove. Remove is the red outline button.
- **Suggestions** (yellow bar).
  - The "Nothing to fix…" text, with Battle › and Popular Sets ›.
  - Suggestion 1 as a dark card: "+1 94 → 95", Sneasler → Mega Floette (To catch), the reason line, Apply, "Why? 13 reasons ›".
  - See All Suggestions ›, Never Suggest ›, Refresh Suggestions ›.
  - Adjust Suggestions › with its settings line.

### The frame, phone (under 1000)
Sim: "optimize the mobile version so it's not like 15 screens long". It measures 3.1 screens at 390 wide (it was 4.9).
- **Your six** are one row of six taps: picture, rating, name. The chosen one is yellow.
- **The tapped Pokémon opens right under that row:** a short stage (168px), types, item, Ability, four moves, then Edit set / Replace / Remove in one row.
- **Trade-off Sim accepted:** on phone only the tapped Pokémon's set shows; the others are one tap or one ‹ › press away. Desktop shows all six sets.
- Suggestions follow, tightened.

### Under the frame
- **Game Plan ›** bar.
- **Jump links:** Matchups, Suggestions, Team Checks, Your Games.
- **Matchups:**
  - The intro line, the three counts (4 Favoured, 22 Even match, 4 Unfavoured), the Damage calc line.
  - Four tabs: Stand-Outs, Top 10, Top 12 Grid, All 30.
  - The eight stand-out threats, with a blue top edge for Favoured and a red one for Unfavoured.
  - Phone: the tabs fit one line; the threats are short rows two across.
- **Team Checks** and **Your Games** as today.

## Every feature of today's My Team is kept
Check the build against today's page; nothing may be dropped. Per Pokémon: rating, tier, types, item, Ability, four moves, edit, replace, remove. Adding a Pokémon to an empty spot is NOT drawn yet (see below).

## New wording to confirm with Sim before it ships
- "Your six · tap one to see it"
- "4 of 6" in the detail bar
- Game Plan line: "How to play this six against the meta's top six." It replaces the old lead/back/bench sentence.

## Still to design (not in the mock; show Sim options)
1. **An empty spot** (5 of 6) and adding a Pokémon. Suggestion: a dashed row "+ Add a Pokémon".
2. **A brand-new visitor with no team.**
3. **Dark mode.** The mock is light only.
4. **Reordering the six** without drag-and-drop, if that is still wanted.
5. **Where the Game Plan's lead advice now lives,** since Lead/Back/Bench is gone from this page.

## Checked in the mock (measured at 1440 and 390 wide)
- 0 taps under 44px, 0 cut-off words, no sideways scroll.
- Length: 1.96 screens on desktop, 3.11 on phone.

## Known flaws
- **Phone:** the names under the six are small (9.5px) and nearly fill their tiles. Check long names (e.g. "Mega Charizard Y" wraps to three lines).
- **Desktop:** the tapped Pokémon's moves show twice (in its row and in the detail). The Suggestions panel has empty space at the bottom.
- Only one state is drawn (the sample team, Sneasler tapped, one optional suggestion).

## Before showing Sim
- polish-check at 320–2560, light and dark (VIEWS=team).
- Every test.yml job. The My Team tests will need new selectors.
- Screenshots to Sim. Nothing goes live without his OK.
