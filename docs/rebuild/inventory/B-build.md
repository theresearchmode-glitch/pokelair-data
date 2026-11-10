# Feature inventory B: Build

Scope: the panes `build`, `auto` (Build for me), `cores` (Winning cores, shown on Build), `coverage` (All suggestions),
`sets` (Popular sets), `arch` (Archetypes), plus the suggestion system (Suggestions, More ideas / More suggestions,
lanes Fix / Small edge / Option, Apply, Undo) wherever it appears on these pages and on My team.

Method (Nov 10, look-only): read every module named below, and drove the built page `app/dist/page.html` (built 22:30,
after the last source change at 22:25) in Chromium with the real data in `out/*.json`, using the harness from
`experiments/polish-check.mjs` (copied to a scratch folder, not the repo). Team used: Mega Charizard Y, Garchomp,
Incineroar, Whimsicott, Rillaboom, Sneasler; also an empty team, a four-Pokémon team and a two-Pokémon box.
Where an entry says **seen** it was observed in the running page; **code** means read in the source only.

---

## 0. How these pages are reached and what they share

Important for the rebuild: the six "panes" are not six pages any more. Later modules move their contents around.

| Pane | What the player actually gets | Where that happens |
|---|---|---|
| `build` | Never shown. `setView('build')` is an alias for `report` (My team) (`VIEW_ALIAS` in 32-views.js). Its `#team` section (the six set editors, Save/Share/Import/Export/Clear) is moved into the slide-up **Edit panel** (`#chEdit`); its "Fix these" column moves into My team › Suggestions › "Problems and team checks"; its "Suggestions" column (`#sugs` + Plan settings) moves to All suggestions › "Bigger plans". What stays in the pane is `#teamHero`, which is drawn but never visible. | `chTeamInit()` 60-concept-h.js |
| `auto` | **Build** page: Build me a team (hero, options, results) + "Build around a core" (the cores section, moved in) + "Start from a recent winner". | 22-auto-build.js, 61-concept-h-pages.js (`chBuildInit`, `abAroundRender`, "one page per job", "Build page order"), 75-arena-build.js |
| `cores` | Never shown on its own: `cores` is an alias for `auto`; the `#cores` section lives inside the Build page. Opening "Build around a core" from the menu opens Build and scrolls to the cores (seen at 390 and 1280 wide). | 32-views.js `VIEW_ALIAS`, 61-concept-h-pages.js line ~290-299 |
| `coverage` | **All suggestions** page (back link "← My team"): one-Pokémon swaps, then "Bigger plans" (fold) holding the multi-change plans and Plan settings. Its "How scoring works" footer is moved to the bottom of My team. | 23-coverage.js, 29-fix-planner.js, 60-concept-h.js, 61-concept-h-pages.js |
| `sets` | **Popular sets**, a section of the Pokémon (Meta) page (switch Rating · Usage · Sets). | 21-sets.js, 75-arena-meta.js |
| `arch` | **Archetypes**, a section of Tournaments (switch Winning teams · Events · Archetypes). | 42-archetype-guides.js, 75-arena-meta.js |

Shared behaviour that applies to every control below (each is a feature in its own right; listed once here):

- **X-01 Page navigation.** Every `data-view` button calls `setView`. A page switch adds a browser-history step (no URL
  change), so the phone/browser Back button steps back through pages and lands at the old scroll position; Back first closes
  any open sheet/menu. Last page is remembered (`localStorage cc2.view`). Code: 32-views.js `setView`, `navHist`, popstate.
  Test: open Build, then All suggestions, press Back → Build at the same scroll position; reload → same page opens.
- **X-02 Toasts with Undo.** Changes that replace team members show a toast with an **Undo** button (`#toastUndo`), up 6 s
  (plain toasts 2.2 s). Undo restores the six and the loaded-team id from `ui.undo`. Some confirmation toasts show the Darkrai
  picture (`TOAST_DK` list). Code: 06-helpers.js `toast`, `keepUndo`. Test: add a core → toast "Added …" with Undo → tap
  Undo → the old six returns, toast "Change undone".
- **X-03 Double-tap guard.** A second tap within 450 ms after Apply/Save/Use/Add/Load is ignored. Code: 34-events.js
  `TAP_ACT` (covers `data-plan`, `data-absave`, `data-abuse`, `data-rec`, `data-qa`, `data-evload`, `data-abaround`…).
  Test: double-tap Apply quickly → only one change, one Undo step.
- **X-04 Sliding pickers.** Any 2-3 choice switch whose labels have icons (Megas 0·1·2, My box·Box + catch·Whole roster,
  Pairs·Trios·Full teams, Top rated·Most used, Best data·Tournaments·Showdown, Rating·Usage·Sets, Winning teams·Events·
  Archetypes, No·Yes) is drawn as an iPhone-style slider with an icon over each name; the circle slides to the new choice.
  Same buttons and `aria-pressed`. Code: 76-slide.js. Test: tap "1" in Megas on team → the circle slides to 1; screen
  reader still reads three pressed/unpressed buttons.
- **X-05 Clear (×) in Pokémon boxes.** `#abAroundIn`, `#coreMonIn`, `#setMonIn`, `#exclAdd` get an × that empties the box and
  keeps the keyboard up. Code: 61-concept-h-pages.js `CLR_SEL`, `clrWrap`. Test: type "gar" in "With a Pokémon…" → × shows
  → tap × → box empty, still focused.
- **X-06 Pokémon name boxes (combobox).** Type part of a name ("mega sal", "hisuian arc"); a list opens; ↑/↓ move, Enter
  picks, Esc closes just the list; mouse/tap picks. "No matches. Try fewer letters." when nothing fits. Code: 05-combobox.js,
  `bindMonInput`. Test: in Build around, type "farig", press Enter → chip "Farigiraf ×".
- **X-07 Phone lift for Pokémon boxes.** On screens ≤1000 px, focusing Build around or the cores filter scrolls it up so the
  list opens above the bottom bar. Code: 75-arena-build.js (focusin on `#abAroundIn,#coreMonIn`).
- **X-08 Title Case.** Headings and slider labels are shown in Title Case ("Build Me a Team", "One Pokémon In, One Out").
  Code: 97-title-case.js (TCASE). Test: visible, no action.
- **X-09 Usage counting.** Every button/summary tap is counted anonymously as `btn:<id or first data-* name>`, every page
  open as `view:<page>`, saved to db `usage/<opaque viewer id>` every 30 s. Code: 51-usage.js. No player-visible effect.
- **X-10 Info sheet from any sprite tile.** Tiles carrying `data-lt` (built-team tiles, recent-winner tiles) open the
  Pokémon info sheet (`#lairSheet`). Code: 25-ratings-page.js / 61-concept-h-pages.js "sheet anywhere".
- **X-11 Data loading.** All these pages draw from daily db documents (read-only): `meta/results` (cores, pairs, proven
  sixes, records, per-Pokémon results; built-in `RESULTS` fallback), `meta/events` (recent winners), `meta/teams` (archetype
  counts), `meta/doubles_tour`, `meta/doubles`, `meta/doubles_ingame` (sets, usage), `meta/model` (Strength Score, real-games
  verdicts), `meta/perf` (ratings). Each may arrive in two parts (`meta/<k>_2`). Pages redraw as pieces arrive; a redraw
  waits while you type. Code: 03-persistence.js `metaJoin`, 08-render-all.js `scheduleRender`, `bgRender`.
- **X-12 Your settings and team are saved.** `S` (six, box, saved teams, Megas on team, never-suggest list…) is saved to
  `localStorage cc2.state` and the account doc `data/users/<uid>/state`, part by part, and merged live from other devices.
  Code: 03-persistence.js. Test: change Megas on team to 1, reload → still 1.

---

## 1. BUILD: the `build` pane (now: the Edit panel, "Problems and team checks", "Bigger plans")

Note: the six set editors themselves (name, ability, item, moves, stat points, nature, weak/resists) are drawn by
07-render-slots.js / 29-fix-planner.js `abilBlock`, `itemBlock`, `movesBlock` / 33-move-edits.js and are part of My team's
editing. They are listed here only at the level of the pane shell so nothing falls between inventories; the per-field detail
belongs with My team (group A). Flagged in "Unsure" below.

**BUILD-01 Edit panel (the pane's team section, slid up over My team)**
- Sees/does: tapping a Pokémon card, "Edit set", or an empty slot on My team opens a panel titled "Edit <name>" / "Add a
  Pokémon" / "Edit team" with a **Done** button, a strip of the six as mini sprites (tap to switch; "+" for empty), and
  "Remove <name> from the team". Backdrop tap, Done, Esc and Back close it. Tab stays inside it. Opening an empty slot
  focuses its name box (phone keyboard opens).
- Code: 60-concept-h.js `chTeamInit` (moves `#team` into `#chEdit`), `chEditOpen`, `chEditStrip`, `chEditClose`;
  `data-chedit`, `data-chrm`, `#chEditDone`, `#chEditScrim`; 32-views.js Tab trap.
- Reads/writes: `S.slots` (remove writes, with Undo).
- Test: on My team tap the 2nd Pokémon's card → panel "Edit Garchomp" opens with six mini sprites; tap the 3rd sprite →
  title changes; tap "Remove …" → it's gone, toast with Undo; press Esc → panel closes.

**BUILD-02 Team actions row (Save team / Update saved team, Share, ⋯ Import, Export, Clear team)**
- Sees/does: Save opens a save panel (name, Save new / Update, Cancel; Enter saves); Share opens the share card; ⋯ opens a
  small menu (Import, Export, Clear team) that opens toward whichever side has room and closes after a pick. On an empty team
  only Import shows. Opening any of them from My team opens the Edit panel in "Edit team" mode.
- Code: body.html `#saveBtn`, `#shareBtn`, `details.moremenu`, `#importBtn`, `#exportBtn`, `#clearTeam`; 34-events.js;
  30-saved-teams.js `renderSavePanel`; 19-showdown-paste.js; 60-concept-h.js (moved into `#chActs`, hidden when empty).
- Reads/writes: `S.teams` (max 10), `S.slots`, `S.loadedId`.
- Test: with a team, tap Save team → name box → type "Test" → Enter → toast "Saved "Test"", button now "Update saved team".
  ⋯ › Clear team → six empty, toast with Undo.

**BUILD-03 Card view switch (Full sets / Grid)**
- Sees/does: "The six" header with a two-choice switch for the editor cards. Stored per device.
- Code: body.html `#sixHead [data-tview]`; 27-team-page.js; 07-render-slots.js `slotsAfter`. Storage `cc2.tview`.
  Opening the editor on one slot forces Full.
- Test: open Edit team, tap Grid → cards compact; reload → Grid kept.

**BUILD-04 Lock a Pokémon**
- Sees/does: "LOCK"/"LOCKED" on each editor card (and a lock button beside each tile on My team) — locked Pokémon are never
  swapped out by suggestions.
- Code: 07-render-slots.js `data-lock`; 74-arena.js lock on My team tiles; 34-events.js `d.lock`; used by
  29-fix-planner.js `canOut`, 48-cores.js `corePlan`.
- Reads/writes: `S.slots[i].lock`.
- Test: lock Rillaboom → All suggestions no longer offers "Swap out Rillaboom"; adding a core never removes Rillaboom.

**BUILD-05 "New team: where do you want to start?" card**
- Sees/does: on an empty team, three big buttons: **Build for me** (→ Build), **Copy a top team** (→ Winning teams),
  **Browse the meta** (→ Usage).
- Code: body.html `#startCard` (`data-view="auto|top|meta"`); 08-render-all.js shows it when the team is empty.
- Unsure whether it is still visible anywhere: it lives inside the Edit panel, which My team's own empty state replaces
  ("Add your first Pokémon" / "Build me a team"). Test: clear the team, open Edit team → check whether the card appears.

**BUILD-06 Problems and team checks (the pane's "Fix these" column)**
- Sees/does: on My team › Suggestions, a fold "Problems and team checks" with a summary line ("7 to look at, 2/4 checks,
  legal"). Inside: one row per problem with a severity tag: Item clash, game-plan gaps (speed control, lead support, weather,
  terrain, Trick Room attackers), Megas (no Mega), Weakness (X weak, only N resist), Nobody resists, 4× weak, Offense (no
  super-effective hits on …), Same weak as resist, idle weather/terrain setter, Fringe pick, Game plan (what works), or
  "All clear". First 4 rows show; **Show N more / Show less**. A row that has fixes is a fold "N fixes" holding **Quick add**
  picks (sprite, types, Mega/Box/TO CATCH/HIDDEN GEM tags, reason, threat line, **Add** / **Swap out X** button, "Ready +N%"
  or "Good fit"). A proven-team note ("This exact team has won at real events. Treat these as optional tweaks") leads when the
  six is a proven winner. Empty team: "Add Pokémon to see what the team needs."
- Code: 09-quick-add.js `renderProblems`, `renderQuick`, `#needsMore`; `data-qa`; 34-events.js `d.qa`; 08-render-all.js
  `plansDraw` (provnote); 60-concept-h.js moves `cols[0]`, `#chkCard`, `#verdict` into `#chfFix`.
- Reads/writes: `S.slots` (Quick add writes, with Undo and an Undo-bar entry).
- Test: team with no speed control → open the fold → a "Speed control" row with "N fixes" → open it → tap Add on a pick →
  that Pokémon joins, toast "Added X" with Undo.

**BUILD-07 Plan settings (fold inside All suggestions › Bigger plans)**
- Sees/does: fold "Plan settings" with a summary ("Box + catch · 2 Megas · 3 never-suggest"). Inside:
  - **Pick from** dropdown: My box / Box + catch (your box, plus the usual picks to catch) / Whole roster. Toast says what it
    means. Same setting as "Suggest from" on My team.
  - **Megas on team 0 · 1 · 2** (third copy of the same setting; see AUTO-04).
  - **Let plans swap my Mega** checkbox (toast "Plans can now swap your Mega" / "Your Mega is protected again"); same
    setting as "Swap my Mega? No/Yes" on My team.
  - **Count abilities** checkbox (default on; toast "Plans updated"). Turns ability effects (Levitate, Intimidate…) on/off
    for the whole analysis, not only plans.
  - **Refresh plans** button (clears caches, toast "Plans refreshed").
  - **Never suggest**: a Pokémon box "Exclude a Pokémon from plans" (only lists Pokémon not yet excluded; excluding a base
    form also excludes its Mega; toast "X won't be suggested"), chips with × ("Allow X again"), **Clear all** when 2+, and a
    note "N excluded" / "Nothing excluded".
- Code: body.html `#plset`, `#poolSel`, `#swapMega`, `#useAbil`, `#replanBtn`, `#exclAdd`, `#exclList`; 34-events.js
  (`poolSel`, `useAbil`, `swapMega`, `replanBtn`, `d.unexcl`); 31-box.js `renderPoolCtl`, `renderExcl`, `bindMonInput($('exclAdd'))`;
  61-concept-h-pages.js `CH.restyle($('plset'))`.
- Reads/writes: `ui.pool` → `localStorage cc2.pool`; `S.excl` (account doc + cc2.state, max 100); `#swapMega`, `#useAbil`
  are not saved (reset on reload).
- Test: exclude Kingambit → no suggestion anywhere (My team, All suggestions, Build for me) contains Kingambit; tap × on its
  chip → toast "Kingambit can be suggested again". Change Pick from to Whole roster → My team's "Suggest from" shows
  Whole roster too.

**BUILD-08 Team hero (`#teamHero`)** — drawn every redraw but inside the never-shown pane. See "Dead".

---

## 2. AUTO: Build for me (`auto` pane)

**AUTO-01 Page head and explainer**
- Sees/does: kicker "Build · real winning teams", big slanted title "Build me a team", line "Winning tournament teams you
  can field from your box." Before any build: a fold **How it works** ("Six that work together, the why, and how ready they
  are") with three numbered points (Six that work together / The why / Ready for the top threats).
- Code: body.html `#autobuild .abhero`; 61-concept-h-pages.js `chBuildInit`; 22-auto-build.js `abStart`;
  `CH.foldNode(... 'abhow' ...)`.
- Test (seen): open Build → title and "How It Works" fold, closed; open it → three points.

**AUTO-02 Build from: My box / Whole roster**
- Sees/does: two-choice switch; My box shows "N in your box" under it; Whole roster says "quick build, anything legal".
  If a team was already built, switching rebuilds straight away.
- Code: `data-absrc` (body.html), 34-events.js `d.absrc`, 31-box.js `renderPoolCtl` (`#abBoxN`).
- Reads/writes: `ui.abSrc` → `localStorage cc2.absrc`; reads `S.box`.
- Test (seen): tap Whole roster, then Build → a different set of teams (in the test: "Proven team, Strength Score 91");
  reload → Whole roster still selected. In My box mode, Pokémon outside the box carry "To catch".

**AUTO-03 Pool rules (no control; behaviour)**
- Box mode uses Box Pokémon with usage ≥ 8 (any in off-meta), Whole roster uses viable Pokémon (rating ≥ 62 or usage ≥ 25);
  never excluded (Never suggest) or trap Pokémon. Under 6 usable: empty note "Only N usable Pokémon in your box for doubles.
  Add more in My box, or switch to Whole roster." (seen with a 2-Pokémon box: "Only 4 usable…", see Unsure).
- Code: 22-auto-build.js `abPool`, `renderAutoBuild` empty notes.

**AUTO-04 Megas on team 0 · 1 · 2 (shared setting)**
- Sees/does: slider "Megas on team" (tooltip: "73% of tournament teams and 81% of event winners carry 2 Mega options. Only one
  can Mega Evolve per battle."). Builds give exactly that many Megas. Toast: "Teams aim for N Mega(s)" or for 0 "Teams without
  Megas: rare (about 1 in 100 tournament teams), and they win about a third of their games". On Build with results showing,
  changing it rebuilds; on another page it clears the built results. Same setting appears on My team, All suggestions and
  Plan settings (4 copies, one value).
- Code: `data-megas` (body.html ×3, 60-concept-h.js ×1); 34-events.js `d.megas`; 02-set-data.js `megaGoal`.
- Reads/writes: `S.megaGoal` (+ legacy `S.maxMega`) → account doc / cc2.state.
- Test (seen): Build with 2, then tap 0 → toast about no-Mega teams; new result has no Mega ("Strength Score 63, Needs work"
  in the test).

**AUTO-05 Build around a Pokémon (optional)**
- Sees/does: label "Build around a Pokémon · optional" and a box "Your favourite Pokémon…". Picking one shows a chip
  (sprite, name, × "Stop building around X") on its type colour, and the main button reads **Build around X**. Picking or
  clearing a pick wipes any results shown. Every team built then contains that Pokémon (proven teams that ran it first, at
  least 50% ready and with speed control; otherwise searched teams). If it can't be built with the Mega count: "No strong team
  with exactly N Megas from this pool. … or build without the pick." The pick is not saved (gone on reload).
- Code: 61-concept-h-pages.js `abAroundRender`, `#abAroundIn`, `data-abaroundclr`; 75-arena-build.js (chip colour);
  22-auto-build.js `ui.abLock` in `provenBuildGen`, `buildBestGen0`, `buildBestGen_`.
- Reads/writes: `ui.abLock` (memory only).
- Test (seen): type "farig", Enter → chip "Farigiraf ×", button "Build around Farigiraf" → Build → every option includes
  Farigiraf; tap × → chip gone, results gone, box focused.

**AUTO-06 "Build around it" from elsewhere**
- Sees/does: the Pokémon info sheet (Ratings) has **Build around it**; it closes the sheet, opens Build, sets the pick,
  switches to Whole roster if the Pokémon isn't in your box, and starts building at once. (The Sleepers cards also have it,
  but Sleepers are switched off.)
- Code: 25-ratings-page.js `data-abaround`; 52-sleepers.js click handler (`data-abaround`, `data-abaroundx`).
- Test: Ratings › tap a Pokémon not in your box › Build around it → Build page, "Build around X" chip, Whole roster
  selected, spinner, then teams containing X.

**AUTO-07 Build me a team (main button), busy state, errors**
- Sees/does: the yellow **Build me a team ➜** button. While building: button disabled + aria-busy, spinner line "Building
  your teams… checking each against the top 30 threats." (spinner stops under reduced motion). The page stays responsive
  (works in ~30 ms steps). If settings change mid-build the newer build wins. On failure: toast "Auto-build hit a problem. Try
  again." and the start view returns. After results, the button stays (not yellow any more; "Use this team" is the yellow one).
- Code: `#abBtn`; 34-events.js; 22-auto-build.js `runAutoBuild`, `abDrive`, `abRunId`, `abKey`; 75-arena-build.js
  `ARBLD.build` (primary toggling).
- Reads/writes: `ui.ab`, `ui.abIdx` (memory only; results are lost on reload).
- Test (seen): tap Build me a team → spinner text appears and the button is disabled → within ~1-15 s a team card shows.

**AUTO-08 Result card: the built team (stage)**
- Sees/does: one card at a time, showing:
  - kicker: **Proven team** / **Proven team, 1 swap** / **Fresh take** / **Your build**;
  - title: the team's archetype words ("Sun, Tailwind", "Grassy Terrain, Hard Trick Room");
  - "Option k of n";
  - **Strength Score** big number with its band word (Top tier / Tournament ready / Solid / Needs work / Missing a basic,
    "so far" when partial) and the rank line ("Top 8% of tournament teams"); a "Few real games back this mix yet, so it's a
    best guess" note when evidence is thin; tooltip from the grade badge;
  - the six as big art tiles, each with its item underneath (tap → info sheet);
  - "23/30 ready for top threats" + "7 shaky" / "1 with no answer, 4 shaky" / "Every top threat has an answer";
  - "3/4 team checks" with pips and "Missing: weak spots spread out" (full list in tooltip);
  - game-plan chips (Speed control, Weather, Terrain, Lead support, Pivot, Hazards…) and "2 Mega options";
  - fold **Sets and roles** ("Items, abilities, roles and ratings for each of the six"): each row sprite on type field,
    name @ item, confidence chip, type tags, In your box / TO CATCH, OFF-META, role (Tailwind/Trick Room/Fake Out/Redirect/
    Priority/Setup/Attacker/weather name) + "· MEGA", rating tag;
  - "Why" bullets: proven source ("6 players brought this exact team at Limitless events (38 games), winning about 56% of
    them, with Mega Metagross where you have Mega Charizard Y"), best winning core ("Basculegion + Kingambit + Whimsicott: 327
    tournament teams, 57.3% wins"), readiness ("86% ready for the top 30 threats: handles 23, 7 shaky, 0 with no answer"),
    "X isn't in your box: the best one to catch for this team", two-weather warning, and in box mode a catch tip ("Best single
    catch: Farigiraf for Empoleon, which takes this team from 74 to …" or "To reach 90+ (Top tier): catch …");
  - Fresh take line: "A fresh take: built on raw power and fit instead of popularity, with at most 2 meta staples. Fewer
    people will have prepared for it."
- Code: 22-auto-build.js `abDescribe`, `abTS`, `renderAutoBuild` (`col`), `boxCatchGen`, `provenBuildGen`;
  61-concept-h-pages.js (halftone six + "Sets and roles" fold); 75-arena-build.js `ARBLD.stage` (replaces the halftone card).
- Reads: `meta/results` (proven, records, cores), `meta/model`, `meta/perf`, `S.box`.
- Test (seen): Build → card shows kicker, title, "Option 1 of 4", "Strength Score 88 Tournament ready Top 8%…", six tiles
  with items, readiness and checks lines, why bullets; open Sets and roles → six rows with roles.

**AUTO-09 Proven teams first; fresh take as option 2**
- Behaviour: real winning sixes you can field (all, or all but one: the gap filled from your pool) lead, ranked by the
  Strength Score; at most 3 options, each differing by 3+ Pokémon; speed control preferred; no weather clashes, idle weather
  or known flaws. After the main options show, a **Fresh take** (off-meta search, ≥60% ready, within 10 of the best, ≥2
  off-meta picks) is worked out in the background and slides in as option 2 (or at the end if you already moved on). Not with
  Build around.
- Code: 22-auto-build.js `provenBuildGen`, `buildBestGen_`, `addFreshTakeGen`, `runAutoBuild`.
- Test (seen): first view "Option 1 of 3", a moment later "Option 1 of 4"; Try another → "Fresh take".

**AUTO-10 Use this team**
- Sees/does: yellow **Use this team ➜**. Replaces your six with the built six (names only; each gets its popular tournament
  set), opens My team, toast "Using the built team. Fix it and the game plan now describe it." with Undo.
- Code: `data-abuse`; 34-events.js `d.abuse`.
- Reads/writes: `S.slots`, `S.format`, `S.loadedId=null`.
- Test (seen): tap Use this team → My team shows the six; Undo in toast restores the old six.

**AUTO-11 Save (built team)**
- Sees/does: **Save** stores the built six as a saved team named after its archetype ("Tailwind"); toast `Saved "Tailwind"`.
  Saving the same six again: toast `Already saved as "Tailwind"`. Disabled with tooltip "10 saved teams already" at 10.
- Code: `data-absave`; 34-events.js.
- Reads/writes: `S.teams` (account doc).
- Test (seen): Save → toast; Save again → "Already saved as …"; Saved teams page lists it.

**AUTO-12 Try another**
- Sees/does: cycles to the next option ("Option 2 of 4"), wraps after the last. Only shown with 2+ options.
- Code: `data-abnext`; 22-auto-build.js `abNext`.
- Test (seen): Try another twice → option 2 (Fresh take), option 3 (Proven team, 1 swap).

**AUTO-13 Copy for Showdown (built team)**
- Sees/does: copies the six as Showdown text (names, items, abilities, moves from popular sets) and shows the copy sheet.
- Code: `sdBtn('ab:doubles')` → 56-showdown-copy.js (`data-sdcopy`).
- Test: tap Copy for Showdown → sheet with text; paste into Showdown teambuilder imports 6 Pokémon.

**AUTO-14 Empty / no-result states**
- "No strong team with exactly N Mega(s) from this pool. Add Mega-capable Pokémon to your box, switch to Whole roster, or
  change Megas on team." (box) / "Try a different number of Megas on team or build without the pick." (whole roster);
  "Only N usable Pokémon in your box…"; "No legal team from this pool." Each sits under a small "Doubles" label.
- Code: 22-auto-build.js `renderAutoBuild` `col`.
- Test (seen): box of 2 → "Only 4 usable Pokémon in your box for doubles…".

**AUTO-15 Start from a recent winner (fold)**
- Sees/does: fold "Start from a recent winner · 3 winning teams, full sets, ready to load", the last three 1st-place teams
  from official events or 64+ player events. Each card: place and record, event name · date · players, the six as tiles
  (each on its type field, Megas named "Mega X"), archetype chips, and **Load team** (if you have a team: first tap turns it
  into "Tap again to replace your team", second tap within 6 s loads with the player's exact items/moves; toast "<player>'s
  team loaded with its moves and items" with Undo; opens My team), **Sets / Hide sets** (shows each set inline),
  **Practice against** (sets it as the Battle opponent, opens Battle, toast "Opponent set: …"), **Compare** (opens Compare
  with your team), **Copy for Showdown**.
- Code: 22-auto-build.js `abStart` (picks), 49-events.js `teamSheetCard`, `loadSheet`, click handler (`data-evload`,
  `data-evsets`, `data-evvs`), 63-compare.js (`data-cxgo`), 61-concept-h-pages.js "Build page order" fold `abwin`,
  75-arena-build.js `ARBLD.sheets`.
- Reads: `meta/events`.
- Test: open the fold → 3 cards → Sets → moves listed → Load team twice → My team has that six with the player's items.

**AUTO-16 Page order**
- Build page reads: Build me a team (hero + options) · How it works · Build around a core · Start from a recent winner.
  The cores section is re-attached after each redraw so it never gets lost.
- Code: 61-concept-h-pages.js "Build page order" wrapper.

---

## 3. CORES: Build around a core (section on the Build page)

**CORES-01 Section head and intro**
- Sees/does: kicker "Pick a pair or trio that wins, then fill the rest", title "Build around a core". One line: "From 13,826
  tournament teams. Average team wins 51.0% of games. Ranked by win rate, pulled toward the average." (or "Ranked by how many
  teams used it.") and a **?** that explains cores and the ranking (shrinkage, "together", player-skill caveat).
- Code: 48-cores.js `renderCores` (`intro`, `tipText('cores', …)`); 61-concept-h-pages.js `CH.pagehead`.
- Test (seen): tap ? → explanation text.

**CORES-02 Kind: Pairs · Trios · Full teams**
- Pairs: two Pokémon on 60+ teams. Trios: three on `RES.minCore` (6)+ teams. Full teams: exact sixes with 3+ entries.
  Changing kind resets "Show more". Not saved.
- Code: `data-corekind`; `coreUi.kind`; `CORE_MIN`.
- Test (seen): tap Trios → "Mega Delphox + Incineroar + Sinistcha … 55.0% wins"; Full teams → rows of six with Load team.

**CORES-03 Sort: Top rated · Most used**
- Top rated = win rate pulled toward the average (as if 300 average teams also ran it; 20 for full teams). Most used = team
  count; the shown % is then the raw win rate.
- Code: `data-coresort`; `coreRows`.
- Test (seen): Most used → intro says "Ranked by how many teams used it."

**CORES-04 Filter by a Pokémon ("With a Pokémon…")**
- Sees/does: a Pokémon box; picking shows a chip (sprite, name, ×, on its type colour); only cores with that Pokémon (any
  form of the species) are listed; × clears.
- Code: `#coreMonIn`, `bindCoreIn`, `data-corex`; 75-arena-build.js chip colour.
- Test (seen): pick Incineroar → "Incineroar + Rillaboom …", "Incineroar + Sneasler …".

**CORES-05 Core rows**
- Sees/does: rank number, sprites (each on its type field, Mega contour), names ("A + B" or comma list for six), up to two
  tags (archetype, Trick Room, Tailwind, Speed control, Fake Out, Redirection, Intimidate, Mega), big "54.8% wins" (tooltip
  with raw rate). **Details** / **Hide details** reveals: "+4.2 points vs avg", "Early read," for thin data, "N teams/
  entries", "+x points together" (vs its members alone; pairs/trios only), "% of all teams". The top 3 show as big cards; #4
  onward sit in a fold "More cores · #4 to #N and Show more".
- Code: 48-cores.js `renderCores`, `coreTags`; 15-visual-helpers.js `dbBtn`/`dbAttr` (`data-dbdt`, `data-dbbox`);
  61-concept-h-pages.js (big cards, `coremore` fold); 75-arena-build.js `ARBLD.cores`.
- Test (seen): tap Details on #1 → "+4.2 points vs avg 262 entries 1.9% of all teams Hide details".

**CORES-06 Show more**
- **Show more (N left)** adds 15 rows (starts at 10).
- Code: `data-coremore`. Test (seen): one tap → 25 rows.

**CORES-07 Add to my team (pair / trio)**
- Sees/does: puts the core first on your team; your others keep their order; on a full team the least needed make room
  (never a locked one, Megas last, never your only Tailwind/Trick Room, only Fake Out/redirection/Intimidate kept). Opens My
  team. Toast "Added A + B · removed X, Y · N Megas on the team now" with Undo (or "Added the core" when both were already
  on the team).
- Code: `data-coreuse`; 48-cores.js `useCore`, `corePlan`.
- Reads/writes: `S.slots`.
- Test (seen): team full, Add a pair → My team, toast with Undo; Undo → old six.

**CORES-08 Load team (full teams)**
- Sees/does: replaces your six. If the exact six was played at a recent event, it loads with that player's items and moves
  (toast "<player>'s team loaded with its moves and items"); otherwise names only (toast "Loaded the team (your old team is one
  tap away: Undo)"). No confirm step (Nov 9 change). Opens My team.
- Code: 48-cores.js `useCore` (`loadSheet`).
- Test (seen): Full teams › Load team → toast "Challenger's team loaded with its moves and items", Undo offered.

**CORES-09 Teams with it (pair / trio)**
- Opens Winning teams with a search filter for those Pokémon (chips "Incineroar ×", "Rillaboom ×", Clear).
- Code: `data-corefind` → `tsSet` (49-events.js).
- Test (seen): Teams with it → Tournaments › Winning teams, filter chips shown.

**CORES-10 Practice against (full teams)**
- Sets the six as your Battle opponent, opens Battle, toast "Loaded as your opponent".
- Code: `data-corepractice`; writes `S.opp`.
- Test (seen): view becomes Battle with their six filled in.

**CORES-11 Copy for Showdown (full teams)** — `sdBtn('core:'+key)`; 56-showdown-copy.js. Test: sheet with six blocks.

**CORES-12 Empty states** — "Cores appear once tournament results have loaded." (no results doc); "No cores match. Try another
Pokémon." (filter matches nothing). Code: 48-cores.js `renderCores`.

**CORES-13 Opening the cores** — menu "Build around a core", Jump search "Winning cores" → Build page, scrolled to the cores.
Code: 32-views.js `MENU`, 50-jump.js `JUMP_TOOLS`, 61-concept-h-pages.js `[data-view="cores"]` listener.
Test (seen): from Home, menu › Build around a core → Build, cores section at the top of the screen.

---

## 4. COV: All suggestions (`coverage` pane)

**COV-01 Page head**
- Sees/does: "← My team" back link; kicker "Every swap and plan for your team", title "All suggestions", hint "Pokémon that
  ready your team for more of the top threats without breaking it, best first." Reached from My team "See all
  suggestions ›", the menu (My team › All suggestions), Jump search ("Best additions").
- Code: body.html `[data-pane="coverage"]`; 32-views.js `BACK`; 61-concept-h-pages.js `CH.wrap('renderRecs')`.

**COV-02 Opening is non-blocking**
- When suggestions need working out, the page shows at once with "Working out the best swaps for your team…" (spinner) and
  fills in a frame later; the bigger plans come after.
- Code: 32-views.js `setView` (`coverage` branch).
- Test: change the team, open All suggestions → spinner line, then cards.

**COV-03 Controls: Megas on team; Suggest from My box · Whole roster**
- Megas: the shared setting (AUTO-04). Suggest from: a separate setting from My team's 3-way "Suggest from" (this one has
  only My box / Whole roster). Whole roster needs a rating of 50+; box picks 35+.
- Code: `data-megas`, `data-recsrc`; 34-events.js `d.recsrc`; 23-coverage.js `computeRecs`.
- Reads/writes: `ui.recSrc` → `localStorage cc2.recsrc`.
- Test (seen): tap Whole roster → list changes; reload → still Whole roster.

**COV-04 Swap / add cards ("One Pokémon in, one out" or "Pokémon to add")**
- Sees/does: heading "One Pokémon in, one out" (full team) or "Pokémon to add" (fewer than 6); hidden when empty. Each card:
  sprite on type field, name, type tags, team count ("2,021 teams"), Mega / In your box / To catch, role, HIDDEN GEM or
  SIDE-GRADE or idea tag, tier+rating ("S tier 92"); grade chip "+3 (83 → 86)"; change chips (Weak 5 → 2, Unresisted, Offense
  x/18); game-plan gap lines in bold ("Gives your rain…"); threat lines ("Covers Incineroar: Handles it → Beats it" with the
  calc line, "Loses Garchomp: Beats it → Handles it"); "Not in your sun: leave its setter out"; why line ("Adds weather, often
  paired with Sneasler, replaces Rillaboom"); trade-off lines in warning colour; hidden-gem line ("Hidden gem: … It fits this
  team as cleanly as the usual picks."); side-grade line ("A different look that keeps every check and stays close on the
  numbers."). Button **Swap out X** / **Add to team**.
- Ranking/rules: never lowers the Strength Score (needs +TS_GAIN, or closes a game-plan gap within 3), never lowers team
  checks, never breaks weather/terrain/Trick Room/lead support, one card per Pokémon; up to 6 + 2 hidden gems first.
- Code: 23-coverage.js `computeRecs`, `renderRecs` (`card`); 61-concept-h-pages.js `.chswk` heading; 75-arena-team.js
  `ARB.recs` (type fields, tags spelled out).
- Reads: model, results, box, never-suggest list, Megas, Swap-my-Mega.
- Test (seen): 4-Pokémon team → "Pokémon to add", Mega Charizard Y card "Add to team"; full team → "Swap out Rillaboom" cards.

**COV-05 Swap/Add apply**
- Sees/does: tapping the card's button changes the team in place (stays on the page), toast "Rillaboom → Basculegion" /
  "Added X" with Undo; the step joins the Undo bar list.
- Code: `data-rec`; 34-events.js `d.rec` (`keepUndo`, `undoMark`, `keepScroll`).
- Reads/writes: `S.slots`.
- Test (seen): tap Add to team → toast "Added Mega Charizard Y Undo"; toast Undo → "Change undone", old six.

**COV-06 Show first 3 / more**
- Sees/does: only 3 cards show; a strip "N more swaps · Showing 3 of N" (or "More swaps and ideas") unfolds the rest /
  "Show fewer". Separately, **More suggestions** ("N more options, including rarely used picks and side-grades"; shorter on
  phones) loads 6 more per tap under a "More suggestions · Rarely used picks and different options" label; at the end
  "That's every option from your box that keeps your checks." + **Back to the top picks** (scrolls back). If there are no
  clean picks but there are more, the first page of "more" opens by itself.
- Code: 61-concept-h-pages.js `CH.more(... 'recs' ...)` (`data-chmore="recs"`); 23-coverage.js `#recMoreBtn`,
  `#recMoreReset`, `ui.recMore`.
- Test (seen): full team → both "More suggestions" and "1 More Swap · Showing 3 of 4" visible (see Duplicated).

**COV-07 Nothing improves**
- "Nothing in your box improves this team without costing something (every swap gives up some defense, offense, readiness
  for a top threat or a game-plan job). Try "Whole roster" to see what to catch." then "Closest options, with their
  trade-off" (up to 3 soft cards with a Trade-off line).
- Code: 23-coverage.js `renderRecs`.

**COV-08 Too few Pokémon**
- Under 2 Pokémon: "Add at least two Pokémon on My team to get suggestions." + **Go to My team**.
- Code: 23-coverage.js `renderRecs`. Test (seen): empty team → that note and button.

**COV-09 Game-plan gap note on All suggestions**
- When nothing in the pool closes a game-plan gap, the same note as My team shows above the cards, ending "try "Whole roster"
  above".
- Code: 61-concept-h-pages.js `chRecsGap`.

**COV-10 Team checks list (princ)** — drawn (`#princ`, "Team checks · N of M checks", ✓ ~ ✕ i rows, folded on phones) but
hidden by `CH.wrap('renderRecs')` (`pr.hidden = true`). See Dead.

**COV-11 Bigger plans (fold)**
- Sees/does: fold "Bigger plans · Two or more changes at once" under the swaps, holding the Undo bar, Plan settings
  (BUILD-07), the item-fix card, set tips, gap note, and the multi-change suggestion cards (SUGG-03), "More suggestions",
  and the hint "Item problems first, then the plans that ready the team for the most top threats. Your Mega and locked
  Pokémon stay put." One-change plans already shown as swap cards above are hidden here and the rest renumbered; if none is
  left: "Every one-change suggestion is a swap above. Tap More suggestions for ones with two or more changes."
- Code: 60-concept-h.js (`$('planSec').append(cols[1])`); 61-concept-h-pages.js `CH.wrap('renderPlans')` fold `bigplans`,
  `chPlansDedup`.
- Test (seen): open fold → "Suggestion 1, 2 changes +8 (83 → 91), Top tier · Small edge …".

**COV-12 How scoring works** — the long explainer that belonged to this page is moved to the bottom of My team (fold "How
scoring works"). Content: readiness definition, team checks, defense, offense, plans, rating, archetypes, data sources.
Code: body.html `details.foot`; 60-concept-h.js moves it.

---

## 5. SUGG: the suggestion system

**SUGG-01 Where suggestions appear**
- My team › part 1 "Suggestions · What to change, best first" (top 1-3 cards); All suggestions (swap cards + Bigger plans);
  the threat sheet's "Best fix" (Apply this fix); Quick add inside Problems. All read the same planner output.
- Code: 29-fix-planner.js `planFixesG`; 08-render-all.js `planJobStart` (background, ~30 ms steps), `planLRU` (last 8
  teams cached), `planKeyOf`; 60-concept-h.js `CH.sugs`, `chScoutRender` (`chbest`).

**SUGG-02 "Suggest from" / "Megas on team" / "Swap my Mega?" on My team**
- Sees/does: three sliders above the cards: Suggest from (My box · Box + catch · Whole roster; toast explains), Megas on team
  0·1·2, Swap my Mega? No · Yes. They are the same settings as Plan settings (Pick from, Megas, Let plans swap my Mega).
- Code: 60-concept-h.js `chTeamInit` part 1 markup, `data-chpool`, `data-chswapm`, `data-megas`.
- Reads/writes: `ui.pool` (cc2.pool), `S.megaGoal`, `#swapMega` (not saved).
- Test (seen): tap Whole roster → toast "Suggestions use the full roster"; Plan settings' Pick from shows Whole roster.

**SUGG-03 Suggestion card (My team)**
- Sees/does: for each: "out → in" sprites (or "+ in"), "**Basculegion** for Rillaboom" (one line per change; two or more
  changes stack one row each), Strength Score chip "+8 (83 → 91), Top tier" (falls back to readiness change), the lane line
  (SUGG-06), **Apply** (yellow on the first, plain on others), **Why? N reasons** fold with the same reasons as the full card
  plus "Weak spots: x → y".
- Code: 60-concept-h.js `CH.sugs`; `gradeChip`, `readyDelta`.
- Test (seen): My team shows "→ Basculegion for Rillaboom → Kingambit for Incineroar +8 (83 → 91), Top tier Apply Small edge
  about 3 more wins in 100 games in real play Why? 13 reasons".

**SUGG-04 Suggestion card (All suggestions › Bigger plans)**
- Sees/does: "Suggestion N · K changes", grade chip, lane line, one row per change ("Rillaboom → [sprite] Basculegion",
  confidence chip, types, Mega, In your box/TO CATCH, rating, HIDDEN GEM/idea tag, "Adaptability @ Life Orb · 19.4% usage"),
  first two reasons then "**N more reasons**" fold; reasons include bold gap fixes ("Meets the "Speed control" check, for 2
  grade points (a real trade-off…)"), threat changes, "Fixes two Choice Scarf", "Fixes the Ice weakness", "Adds a resist
  to …", game-plan Covers/Improves/Weakens lines, archetype fit lines, "Ready for top threats: 23/30 → 25/30", "New weak spot:
  …" / "No new weak spots", "Offense: 16 → 17 of 18" / "Offense stays at 18 of 18 types", "X is often paired with Y and Z".
  Side-grade note "A different look: keeps your type rating and speed control without being clearly better." Button **Apply
  suggestion N** (ideas: "Apply this"). Plans that lower readiness by 5+ sort after the others.
- Code: 29-fix-planner.js `renderPlans`; 61-concept-h-pages.js `chPlansDedup` (renumbering).
- Test (seen): open Bigger plans → card with "10 more reasons" fold → open it → more lines.

**SUGG-05 Planner rules (behaviour players rely on)**
- Never lowers the Strength Score (except fixing an illegal item, max −3); must raise it by `TS_GAIN`+ and be 75%+ "sure";
  never removes speed control, a weather the team relies on, or creates a weather clash / idle weather / Trick Room flaw;
  never leaves 4+ weak to one type; never more Megas than asked; never swaps out locked Pokémon, or your Mega unless "Swap my
  Mega" is on (and a Mega only for a Mega); never lowers team checks; never adds more item problems; never swaps a staple
  (15%+ usage) for a rare pick; Pokémon from Never suggest and ones you just swapped out with Apply (until you change the
  team otherwise) are never offered. Up to 3 plans, no shared incoming Pokémon. One plan always fixes missing speed control,
  the most serious game-plan gap, item problems, and each unmet team check (with its honest grade cost, even above 3 points).
  Ties within the margin of error are shuffled per team (same team → same order) for variety. Box + catch adds a small cost
  to Pokémon not in your box.
- Code: 29-fix-planner.js `planFixesG` (`keepsPlan`, `gOK`, `qual`, `PLAN_TIE`, Deep Check block), `swOutNow`.
- Test: lock all but one, apply → only that one changes; after applying "Sylveon for Primarina", Primarina is not offered
  back.

**SUGG-06 Lanes: Fix / Small edge / Option**
- Sees/does: a line under each suggestion: **Fix** "two of your Pokémon hold the same item, so the team can't be registered;
  this frees it" / "adds a Mega: teams with no Mega won about 23 fewer games in 100" / "makes the team ready for the top
  threats…"; **Small edge** "about N more wins in 100 games in real play" (only when the model gain is 4+ points, shown at
  ~35%); **Option** "covers a team note; real games show no clear edge either way" / "a small change: real games can't tell it
  apart from what you have". Order: fixes, then small edges, then options; plain options below the bar move to the front of
  More ideas.
- Code: 36-lanes.js `LANE.of`, `LANE.apply`, `LANE.line`; used in 60-concept-h.js `CH.sugs`, 29-fix-planner.js
  `renderPlans`, 23-coverage.js card (broken there, see Broken).
- Test (seen): My team card shows "Small edge about 3 more wins in 100 games in real play".

**SUGG-07 Add Protect (set fix card)**
- Sees/does: when only 0-2 of your six run Protect and some of them usually do: a card "**Fix** only N of your six run
  Protect: teams with one or none won about 15 fewer games in 100 than teams with three", "Their usual sets run it: A and B",
  button **Add Protect** → Protect replaces each one's least-used move; toast "Protect added: it's in each set now, change it
  any time" with Undo. Shown above the cards on My team and in Bigger plans.
- Code: 36-lanes.js `LANE.protFix`, `protCard`, `protApply`, `data-protfix`.
- Reads/writes: `S.slots[i].mv.doubles`.
- Test: give two Pokémon custom moves without Protect → card appears → Add Protect → their sets now list Protect.

**SUGG-08 Nothing to fix**
- Sees/does: card "**Nothing to fix.** Your team has every basic and no swap clearly beats it in real games." / "Your edge now
  comes from how you play it: plan each matchup in Battle, and tune your sets." with **Battle** and **Sets** buttons. Then,
  when nothing raises the score, side-grades: "Nothing raises this team's Strength Score right now. These swaps keep every
  check and about the same grade, with a different look:" (up to 3, never more than 2 points worse, never a Pokémon you just
  swapped out). If none: "Nothing raises this team's Strength Score right now, and every other swap would lower it." + See all.
- Code: 36-lanes.js `noneCard`; 60-concept-h.js `CH.sugs` (side mode); 29-fix-planner.js `renderPlans` (none branch).
- Test (seen): after applying the top suggestion → "Nothing to fix…", Battle/Sets buttons, a side-grade "Mega Floette for
  Sneasler ±0 (91 → 91)".

**SUGG-09 Apply**
- Sees/does: Apply writes the plan's Pokémon into their slots (Ability kept as "typical" unless the planner chose one), adds
  the step to the Undo bar, remembers what it swapped out, keeps the scroll position, toast "Applied: Basculegion and
  Kingambit" plus the score move "+8 (83 → 91), Top tier" and Undo. From the threat sheet, Apply also closes the sheet.
- Code: 34-events.js `d.plan`; 65-design-c.js (score move appended to the toast); 60-concept-h.js (`#chScout [data-plan]`).
- Reads/writes: `S.slots`, `ui.swOut`, `ui.swKey`, `ui.undoStack`.
- Test (seen): Apply → toast "Applied: Basculegion and Kingambit +8 (83 → 91), Top tier Undo".

**SUGG-10 Undo bar**
- Sees/does: a bar "Applied **X for Y, Z for W**" + **Undo** above the suggestions (My team and Bigger plans). Up to 8
  applied steps are kept; Undo steps back one at a time ("Undone: …"). The bar disappears as soon as the team is changed some
  other way. Separate from the toast's one-step Undo.
- Code: 06-helpers.js `undoMark`, `undoTop`, `undoBarHtml`, `undoBarSync`, `data-undobar`; hosts `.chundohost` created in
  `renderPlans` and `chTeamRender`.
- Reads/writes: `ui.undoStack` (memory only; cleared when another device changes the team).
- Test (seen): Apply → bar shows on both pages; Undo → "Undone: Basculegion for Rillaboom, Kingambit for Incineroar", original
  six back.

**SUGG-11 Show more / See all suggestions (My team)**
- Sees/does: the first card shows; **Show N more suggestion(s)** opens the next two in place (focus moves to the next
  Apply) and turns into **See all suggestions ›** (→ All suggestions). Remembered per team.
- Code: 60-concept-h.js `CH.sugs`, `data-sugmore` handler, `ui.sugMore`.
- Test: team with 3 suggestions → Show 2 more → 3 cards → See all suggestions › → All suggestions page.

**SUGG-12 More suggestions (More ideas) in Bigger plans**
- Sees/does: **More suggestions** "N more suggestions, including different options and rarely used picks" adds 3 per tap
  (ideas never lower the score by more than half a point; up to 12 new-Pokémon ideas + side-grades for a full team, 18 total);
  at the end "That's every suggestion that keeps your type rating and speed control." + **Show fewer**.
- Code: 29-fix-planner.js `more`, `renderPlans` `#planMoreBtn`, `#planMoreReset`, `ui.planMore`.
- Test (seen): "17 more suggestions…" → tap → 3 more cards.

**SUGG-13 Working / stale state**
- While the plans are being worked out after an edit, what was there stays but fades and can't be tapped (aria-busy); an empty
  spot shows "Working out the best suggestions for your team…" / "…fix plans…". When ready, the area redraws keeping what you
  were looking at in place.
- Code: 08-render-all.js `PLAN_WAIT`, `planStale`, `planFresh`, `planWait`, `planDone`.
- Test: change a Pokémon on My team → suggestions grey out briefly, then refresh without the page jumping.

**SUGG-14 Empty / no-plan messages**
- My team: nothing when the team is empty (part hidden); "No single change from this pool raises the team's Strength Score.
  Try another pool above, or see Threats below for what to watch." Bigger plans: "Add at least one Pokémon to get plans.";
  "No change from this pool raises the team's Strength Score (it's at 83). Keep this team, or try "Whole roster" or unlock a
  Pokémon."; "This team has no type problems, and no change from this pool makes it meaningfully better. Keep it."; "No change
  from this pool improves the team. Try "Whole roster" or unlock a Pokémon."
- Code: 60-concept-h.js `chTeamRender`; 29-fix-planner.js `renderPlans`.

**SUGG-15 Game-plan gap note and Mega-over-goal note**
- "<gap note> Nothing in your box fixes it without weakening the team: try "Box + catch" or "Whole roster"." and "Your team
  has 2 Megas and Megas on team is set to 1. Turn on "Let plans swap my Mega" to see swaps without them." Shown on My team,
  Bigger plans and All suggestions.
- Code: 29-fix-planner.js (`out.gapNote`); 60-concept-h.js `CH.sugs` (`chgapnote`); 61-concept-h-pages.js `chRecsGap`.

**SUGG-16 Fix your items first (item-fix card)**
- Sees/does: when items break the team: "Fix your items first" listing "Item Clause / Clashes with Trick Room / Item does
  nothing: <why>" each with **Give X Y**; toast "Gave X Y" with Undo. Shown at the top of Bigger plans; plans that fix the item
  problem also say "Fixes …".
- Code: 54-items.js `itemFixHtml`, `data-itfix`.
- Reads/writes: `S.slots[i].it.doubles`.
- Test: give two Pokémon Sitrus Berry → card "Item Clause…" → Give … → toast, card gone.

**SUGG-17 Set check tips**
- Sees/does: "Set check: what most players run": for an item/Ability/move you chose that under 5% of tournament players run,
  "**X: Y** instead of Z (item/Ability/move)", "N% of M tournament X hold Y; …", "This tip comes from what players run, not
  from the grade." + **Use Y** (Undo bar entry "Y on X", toast with Undo). Item Clause respected; Megas' stones skipped.
- Code: 57-set-tips.js `setTips`, `setTipsHtml`, `data-settip`; shown via 29-fix-planner.js `renderPlans` (`itf`).
- Test: set Garchomp's item to something rare → tip "Garchomp: Choice Scarf instead of …" → Use → item changed.

**SUGG-18 Quick add** — see BUILD-06 (one-change picks under each problem row).

**SUGG-19 Best fix in the threat sheet** — "Best fix · +8 (83 → 91)" with out→in sprites and **Apply this fix ➜**
(`data-plan="0"`); closes the sheet after applying. Code: 60-concept-h.js `chBestPlan`, `chScoutRender`.

---

## 6. SETS: Popular sets (`sets` pane)

**SETS-01 Page head and section switch**
- Sees/does: Pokémon page tabs (Pokémon · Tournaments), slider Rating · Usage · **Sets**; kicker "Popular sets · what
  players run", title "Popular sets", hint "What players run on any Pokémon."
- Code: body.html `#sets .teamsw`; 32-views.js `SUB_OF`; 61-concept-h-pages.js `CH.pagehead`.

**SETS-02 Look up a Pokémon**
- Box "Look up a Pokémon" (any Pokémon); picking shows its sets and empties the box.
- Code: `#setMonIn`, 31-box.js `bindMonInput`.
- Reads/writes: `ui.setMon` → `localStorage cc2.setMon`.
- Test: type "kingam", Enter → Kingambit's sets; reload → Kingambit still shown.

**SETS-03 Your team picker**
- "Your team" row: your six as small art tiles; tap one to show its sets (selected one highlighted). Hidden with no team.
- Code: 21-sets.js `#setQuick` (`data-setmon`); 75-arena-meta.js `ARM.polish` (turns them into art tiles).
- Test (seen): six tiles shown; tap Garchomp → Garchomp's card. (First open highlights none: see Broken.)

**SETS-04 Which Pokémon opens first**
- Last looked up (saved) → else your first team member → else the top-rated Pokémon; "Look up a Pokémon to see its popular
  sets." only if none.
- Code: 21-sets.js `renderSets`.

**SETS-05 Pokémon header**
- Big sprite, name, type tags, Mega, Box, tier chip "S tier · rated 94 · #5 of 321 Pokémon with tournament results"; if on
  your team: "Your Mega Charizard Y: Drought @ Charizardite Y (your pick), Heat Wave, Protect…, (your moves)".
- Code: 21-sets.js `renderSets`.

**SETS-06 Source switch: Best data · Tournaments · Showdown**
- Best data = merged (official in-game stats first, then Showdown/tournament where missing; Mega-specific rows); the others
  show that list's own row. Card subtitle: rank and usage line ("#3 · 1,234 teams · 54% wins · <source>") or main source
  ("Showdown ladder, 1630+ rating (this Mega)").
- Code: `data-setsrc`; `SET_SRC`; 34-events.js `d.setsrc`.
- Reads/writes: `ui.setSrc` → `localStorage cc2.setSrc`. Reads `META.doubles_ingame`, `doubles_tour`, `doubles`, built-in `SETS`.
- Test (seen): Tournaments → numbers change; reload → Tournaments kept.

**SETS-07 Set card**
- Moves (top 8, as bars with %), Item (top 4 chips), Ability (top 3), Nature (top 3), Teammates (top 6 as tappable tiles
  with %, tap → that Pokémon's sets and scroll to the top; unknown ones disabled), source footnote ("From Showdown 1630+
  (Mega-specific) · Its stone and ability are fixed · 307,430 Showdown battles"; also "Shares stats with the same-ability
  plumage…", "The game's file is missing its top moves"). Empty list: "Not among the top Pokémon in this list. "Best data"
  covers every Pokémon." / "No data loaded yet".
- Code: 21-sets.js `setCard`, `setSources`, `mainSource`, `rankLine`; 34-events.js `d.setmon`.
- Test (seen): Teammates tile Kingambit → Kingambit's card.

**SETS-08 Ways in** — My team editor "Full popular sets ›" (`data-fullset`, closes the editor), info sheet sets link
(`data-lsets`), "Nothing to fix" card's **Sets** button, menu Meta › Popular sets, Jump search. Code: 34-events.js,
25-ratings-page.js, 36-lanes.js.

---

## 7. ARCH: Archetypes (`arch` pane)

**ARCH-01 Page head and switch**
- Tournaments switch Winning teams · Events · **Archetypes**; kicker "Archetypes · the team styles you will face", title
  "Archetypes", hint "The team styles you'll face most, how they win, and how to play into them. Tap a guide to open it."
- Code: body.html `#guides`; 61-concept-h-pages.js `CH.pagehead`.

**ARCH-02 Share line** — "From the latest 90 top tournament teams." or "Usage numbers appear once top teams load."
Reads `meta/teams`. Code: 42-archetype-guides.js `renderGuides`.

**ARCH-03 Guide list (8 styles, most common first)**
- Tailwind, Trick Room, Rain, Sun, Sand, Snow, Psychic Terrain, Grassy Terrain; each a fold with name, "49%" and "44 of 90
  top teams" (basis), and up to 5 key-Pokémon sprites (each on its type field).
- Code: `GUIDE`, `GUIDE_ORDER`, `renderGuides`; 75-arena-meta.js (sprite fields, comma fix).
- Test (seen): 8 folds in descending share.

**ARCH-04 Guide body**
- What it does (one paragraph), **Key Pokémon** (up to 6: Trick Room/Tailwind = top users of the move at 30%+; weather/
  terrain = setters/abusers by usage), **How to beat it** (numbered tips), and with a team **What your team has**: each of your
  Pokémon with the tools it brings (moves like Fake Out/Taunt/Wide Guard, abilities like Drizzle/Intimidate, useful types) and
  a ✓; or "**Nothing on your team directly answers it.** One of the ideas above would help."
- Code: 42-archetype-guides.js `renderGuides` (`yours`, `keyMons`).
- Test: open Trick Room → Key Pokémon, tips; with Incineroar on the team → "Incineroar · Fake Out ✓".

**ARCH-05 Archetype labels elsewhere** — `teamArchetype` / `archChips` produce the words ("Sun, Tailwind", "Hard Trick
Room", "TailRoom") used on built teams, winners, My team game plan. Code: 18-archetypes.js, 10-team-strategy.js `ARCH`.

---

## 8. Dead, duplicated or broken

Broken (verified):
1. **All suggestions swap cards never show their lane line (Fix / Small edge / Option).** `renderRecs` calls
   `LANE.of(pl, ms, gB)` but `gB` only exists inside `computeRecs`; the ReferenceError is swallowed by the try/catch, so the
   line is always empty (seen: 0 `.chlane` in `#recList`; calling `LANE.of` by hand works). 23-coverage.js line ~119.
2. **Popular sets "Your team" picker highlights nothing on first open** when no Pokémon was looked up before: `#setQuick` is
   drawn before `ui.setMon` is set to the first team member (seen: all six `aria-pressed=false`). 21-sets.js `renderSets`.
3. **Build result checks line shows a stray "checks"**: "3/4 team checks · checks · Missing: …" — the moved `.minick` keeps
   its own "checks" word (seen in innerText). 75-arena-build.js `ARBLD.stage`.
4. **Stale wording**: "Use this team" toast says "Fix it and the game plan now describe it" (no "Fix it" any more); Quick add's
   empty text says set Pick from to "box, then fill gaps" (option is "Box + catch"); Build for me empty notes start with a
   "Doubles" label (single format now). 34-events.js, 09-quick-add.js, 22-auto-build.js.

Dead code / dead UI:
5. **`build` and `cores` panes are empty shells**: both are aliases (`VIEW_ALIAS`); `#teamHero` (`renderTeamHero`,
   27-team-page.js) is drawn on every render into the hidden `build` pane and never seen.
6. **Cores inline confirm** ("Replace X and Y?", Replace / Cancel, `data-corecx`, `data-sure`, `coreConfirmText`,
   `coreUi.confirm`): `useCore` always returns true, so the confirm never shows (Nov 9 change). 48-cores.js.
7. **Build for me "grade v2" engine** (`AB_GRADE_V2 = false`, `abY`, `abGradeC`, the box-catch block inside
   `buildBestGen_`): switched off (rolled back Nov 8). `abY` is still used by the planner's shortlist. 22-auto-build.js.
8. **Sleepers** (`SHOW_SLEEPERS = false`): cards with "Build around it" never show. 52-sleepers.js.
9. **All suggestions' Team checks list** (`#princ`, `principles`) is drawn then hidden on every render. 23-coverage.js +
   61-concept-h-pages.js.
10. **Home "Where are you?" variant B** (`npPaths('b')`, `data-nppath`) only with `localStorage np.mock="paths-b"`.
    98-proposals.js.
11. `abNext`/`abTeam` keep a `fmt` key ("doubles") from the singles era; `withFormat` is a no-op. Harmless.

Duplicated:
12. **Two "more" controls on the same All suggestions list**: CH.more's "N more swaps · Showing 3 of N" and the original
    "More suggestions · N more options…" button both show at once (seen).
13. **Megas on team appears 4 times** (Build hero, My team Suggestions, All suggestions head, Plan settings) and "Suggest
    from" exists twice with different choices (My team: 3 choices `ui.pool`; All suggestions: 2 choices `ui.recSrc`, a
    separate setting). Swap-my-Mega exists as a checkbox and as a No/Yes slider.
14. **Page names disagree**: `coverage` is "All suggestions" (title, menu), "Best additions" (Jump search, original h2), "Swaps"
    (code comments); `cores` is "Build around a core" (menu, heading) and "Winning cores" (Jump search, original h2).
15. **Recent-winner cards** on Build duplicate Winning teams/Events cards (same `teamSheetCard`), intentionally.

Inconsistent (code reading, not verified in play):
16. Swap cards (`data-rec`) and Quick add (`data-qa`) write the newcomer's Ability as chosen (`a: x.c.mem.ability`), while
    Apply (`data-plan`) writes it only when the planner chose it (Nov 9 fix so the result matches the card). Swap cards and
    Quick add may therefore land a rank point off their card. They also don't add to `ui.swOut`, so the swapped-out Pokémon can
    be offered straight back.

## 9. Unsure

- Whether the BUILD-05 "New team" start card is still visible anywhere (inside the Edit panel on an empty team?). Not opened.
- Whether the per-slot set editor fields (ability, item, moves, spread, nature, Weak/Resists, Reset to popular, Use <rec>)
  are covered by the My team inventory (group A); I listed them only as the pane shell.
- "Only 4 usable Pokémon in your box" with a 2-Pokémon box: probably Mega forms of box Pokémon count separately (`inBox`),
  not checked.
- "Use this team" loads names only; I did not check that the items/abilities My team then assigns match the items shown on
  the built card (both come from `assignItems`, so likely the same).
- Undo bar after a swap card on All suggestions appeared empty 0.6 s after the tap; it is probably drawn once the bigger plans
  finish recomputing (`undoBarSync` runs from `renderPlans`). Not waited for.
- "Build your own" on My team's sample-team note goes to `data-view="build"`, which is My team itself (alias) — possibly a
  no-op; outside this group's pages, noted for group A.
- The Build hero line "Winning tournament teams you can field from your box." stays the same when Whole roster is chosen.
- Phone-only differences checked only at 390 wide for the Build page order (same order as desktop).

## Counts

BUILD 8 · AUTO 16 · CORES 13 · COV 12 · SUGG 19 · SETS 8 · ARCH 5 · shared X 12 → 93 entries.
