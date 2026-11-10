# Feature inventory, group A: Team

Look-only inventory made Nov 10 for the rebuild, from the source in `app/src/app/*.js` and `app/src/body.html`, checked against the
built page (`app/dist/page.html` of Nov 10 22:30) rendered in Chromium with the real data in `out/*.json` (the
`experiments/polish-check.mjs` harness, copied to a scratch folder). Widths checked: 1440 (desktop) and 390 (phone).

Scope: Home (`home`), My Team (`report`), Team Sheet (`sheet`), Saved teams (`teams`), My Box (`box`), Compare (`compare`), the
Pokémon info sheet (Info / Meta / Rating), adding a Pokémon, set editing, Showdown import/export/copy, lock/remove, Undo, share
(images and links), Your games (log a game), and the overlays these pages open (threat sheet, edit panel, share box, tips).

How to read an entry
- **Sees / does**: what the player sees and can do, every control and state.
- **Code**: file (in `app/src/app/`) and function or `data-*` attribute. Many features are drawn by an old renderer and then
  re-dressed by a later theme module (60-concept-h, 74-arena, 75-arena-team...); both are named when both matter.
- **Data**: what it reads/writes. `S.x` = the saved state object (`01-state.js`), stored in browser storage `cc2.state` and in the
  account document `data/users/<uid>/state` (one field per part, `03-persistence.js`). `META.x` = daily data documents `meta/<x>`
  (read only). `LS key` = a `localStorage` key (JSON). See also `docs/rebuild/saved-data.md` (another inventory) for the full
  storage contract.
- **Test**: steps a person would do and what they should see. Written with visible words, labels and roles only.

Shapes used below
- slot: `{n: roster name or '', a: chosen Ability or null, lock: bool, mv?: {doubles: [4 move names]}, it?: {doubles: item},
  sp?: {doubles: {nat, v:[hp,atk,def,spa,spd,spe]} | {nat, assumed:true}}}` (`02-set-data.js normSlots`). A field is present
  only when the player changed it; otherwise the popular set fills in.
- saved team: `{id, name (≤40), slots, format:'doubles', saved: time}`, max 10 (`S.teams`).
- log entry: `{t: time, r: 'W'|'L', b: up to 4 brought (first two = leads), tm: the six, o: up to 6 of theirs}` (`S.log`, max 400).

---

## 1. Home (`home`)

Home is drawn by `28-home.js renderHome` / `60-concept-h.js` (old parts) and re-dressed by `74-arena.js AR.home` (top half).

### HOME-01 Tagline headline
- Sees: big slanted "Sharply raise / your win rate." (second line in PLOT blue).
- Code: `74-arena.js AR.home` (`.ar-tag`).
- Data: none.
- Test: open the site; the first heading reads "Sharply raise your win rate."

### HOME-02 Most used Pokémon hero
- Sees: the #1 most-used Pokémon as a big art tile: "Most used, #1", "35.6% of teams", "bring Sneasler". Tap opens its info sheet.
- Code: `74-arena.js AR.home` (`data-lt`), `CH.metaSix`, `MG.pct`.
- Data: usage from `META.doubles_tour` / current format (`U()`, `pickUse`).
- Test: open Home; tap the big "Most used, #1" card; the info sheet for that Pokémon opens.

### HOME-03 Runners-up (#2, #3)
- Sees: two strips with name and % (e.g. "Rillaboom 35.5%"); tap opens info sheet.
- Code: `AR.home` `runner()` (`data-lt`).
- Test: tap "Rillaboom 35.5%"; its info sheet opens.

### HOME-04 Data source and date line
- Sees: "Most used in October, Showdown ladder 1630+. Data as of Nov 10".
- Code: `MG.srcLine()` (71-manga), `showDataDate`.
- Data: dates of the `meta/*` documents.
- Test: the line under the runners names a month, a source and "Data as of <date>". (Unsure: the hero % is described as share of
  teams but the caption names the Showdown ladder; see Unsure list.)

### HOME-05 This week in the ratings
- Sees: "This week in the ratings" with up to ~4 chips "Whimsicott ▲ 5", "Volcarona ▼ 2"; tap opens info sheet. Hidden when the
  data has no moves.
- Code: `74-arena.js AR.week` (`data-lt`).
- Data: `META.track.mv.list`.
- Test: a chip shows a name and an up/down arrow with a number; tapping it opens that Pokémon's info sheet whose rating matches the
  chip's aria label.

### HOME-06 Three start buttons
- Sees: with a team: "Score my team" (primary, → My Team), "Build a team" (→ Build), "Plan a match" (→ Battle). With no team:
  "Build me a team" is primary and comes first, then "Score my team", "Plan a match".
- Code: `AR.home` `tools` (`data-view`).
- Test: with a team, tap "Score my team" → My Team opens. Clear the team, return Home → "Build me a team" is first.

### HOME-07 "Already have a team? Import from Showdown"
- Sees: a link that opens My Team with the Import panel open, cursor in the paste box.
- Code: `74-arena.js` `[data-arimport]` handler → `setView('report')` then clicks `#importBtn`.
- Test: tap "Import from Showdown"; My Team opens with an "Import a team" box and a "Replace my team" button.

### HOME-08 All 11 Tools grid
- Sees: "Everything NastyPlot does / All 11 Tools." and 11 cards with a name and one line: Battle Mode, Teams, Type Chart, Ratings,
  Damage Calc, Events, Test Run, Popular Sets, Speed Tiers, Archetypes, Winning Cores. Each opens that page.
- Code: `60-concept-h.js` Home (`.chhtools`, `data-view`), moved up by `AR.home`.
- Test: tap each card; the page named on it opens.

### HOME-09 The Champion's six (latest event winner)
- Sees: "The Champion's six", "Latest winner", event name, "<Player/Champion>, 9-1, Nov 9, 66 players", six art tiles with item under
  each (tap = info sheet), "Same six as yours" when it matches, buttons "Load this team", "Copy for Showdown", "All 113 events ›".
- Code: `AR.champ`, `AR.home`; `data-evload` (49-events.js: first tap with a team turns the button into "Tap again to replace your
  team", second tap within 6 s loads the sheet with Undo via `loadSheet`); `data-sdcopy="ev:<id>#<k>"`; `data-view="events"`.
- Data: `META.events`; loading writes `S.slots` (full sets: moves, items, ability, nature where published).
- Test: with a team, tap "Load this team" → button reads "Tap again to replace your team"; tap again → My team becomes the
  Champion's six and an Undo toast shows. Tap "Copy for Showdown" → toast "Copied — paste into Showdown's teambuilder".

### HOME-10 "vs" Your six panel
- Sees: your team's name (or "Your six goes here"), sample-team note when it's the sample, "Your team: 6/6 Sun team" (with weather
  word), six art tiles ordered lead/back/bench (tap = info sheet), a game plan line ("Game plan vs the Champion's six: lead A + B,
  back C + D, bench E + F."; "vs the meta's top six" without a champion; ", your leads" when you set leads), and "Open my team" plus
  "Prep vs the Champion ›" (sets the Champion's six as Battle opponent and opens Battle). Empty team: six "+ Add a Pokémon" tiles and
  "Add your six" (all open My Team, not a specific slot).
- Code: `AR.home` (`data-lt`, `data-view="report"`, `data-evvs`, `data-view="build"`), `CH.fourVs`, `CH.four`, `AR.userLeads`,
  weather `wxKeyOf` (66-extras-b).
- Data: `members()`, `S.leads`, `META.events`; `data-evvs` writes `S.opp`.
- Test: with the sample team, Home shows "Sun Tailwind (sample)" and a game plan line naming lead/back/bench. Tap "Prep vs the
  Champion ›" → Battle opens and toast "Opponent set: …".

### HOME-11 Sample-team note
- Sees: "This is a sample team, here to show how NastyPlot works." with "Build your own" and "Import a team". Shown on Home and My
  Team while the team's name ends in "(sample)".
- Code: `74-arena.js AR.sampleNote`, `AR.isSample`; first-visit sample is `DEFAULT_TEAM` in `00-main.js` (also saved as the first
  saved team).
- Test: fresh visitor (empty storage) → Home and My Team both show the note. "Import a team" opens the Import panel.

### HOME-12 Welcome card (first visit only)
- Sees: "New here? How NastyPlot works", 3 numbered steps (Get a team / Read your scouting report / Plan each match), "The team below
  is a sample…", buttons "Build me a team", "Copy a top team", "Got it". Any of them marks it seen for good.
- Code: `46-onboarding.js welcomeCard`, `[data-welcomex]`.
- Data: LS `cc2.welcomed`.
- Test: clear site data, open Home → card shows; tap "Got it" → card gone and stays gone after reload.

### HOME-13 What's New fold
- Sees: a one-line fold "What's New, 6 updates: Threat prep, Move accuracy…" with × to dismiss; opening lists 6 updates. Shown only
  on the first visit after an update (stays for that browser session); never shown to first-time visitors.
- Code: `53-feedback.js whatsNewCard` (`WHATS_NEW`), `[data-wnewx]`; wrapper by `74-arena.js AR.parts`.
- Data: LS `cc2.seenNew`, sessionStorage `np.wnew`.
- Test: set `cc2.seenNew` to an old id, reload Home → fold shows; tap × → it disappears and doesn't return on reload.

### HOME-14 Top of the Meta (ratings list)
- Sees: "NastyPlot ratings: from 13,826 tournament teams / Top of the Meta.", a two-way switch "Top rated | Hidden gems", a hint line,
  10 rows "Sneasler S 97 #1" (tap = info sheet), "All ratings ›".
- Code: `28-home.js` (`data-hgems`, `data-lt`), `homeMini` (re-dressed in 74-arena).
- Data: ratings from `rating()`; `ui.homeGems` (not saved).
- Test: tap "Hidden gems" → list changes to rarely used Pokémon and the hint explains them; tap a row → info sheet.

### HOME-15 More on Home fold
- Sees: fold "More on Home: Doubles is played in pairs, what changed, winning cores, your battles". Inside:
  - "Doubles Is Played in Pairs." 4 pairs with % brought together and games (tap = info sheet of the second Pokémon);
  - "What changed this week" Rising/Falling 3+3 with "#25 → #18" (tap = info sheet), "Rankings ›" (→ Usage);
  - "Winning Cores" 3 trios with win % and teams (→ Cores), "All cores ›";
  - "Your battles: Log your games…" with "Log a game" (→ Battle page's Battle log, not My Team's log).
  - Footer sources line ("13,826 Reg M-C tournament teams, 78,575 games…").
- Code: `60-concept-h.js` Home (`CH.fold('more', …)`), `37-home-trends.js`.
- Data: LS `cc2.chf.more` (open/closed); `META.history`, results/replays data.
- Test: open the fold, reload → it stays open. Tap "Log a game" → Battle page opens.

### HOME-16 Weather chip on Home's team card
- Sees: when the team sets weather/terrain, a small labelled animated chip ("Sun team").
- Code: `66-extras-b.js` `CH.wrap('renderHome')`, `wxLayer`.
- Test: sample team → "Sun team" appears next to the team line. (Reduced motion: still, no movement.)

---

## 2. My Team (`report`)

Page built by `60-concept-h.js chTeamInit` (moves the original `#team`, `#fixes`, `#repFold` nodes into four numbered parts and two
overlays) and `chTeamRender`, then re-dressed by `74-arena.js AR.team` / `AR.parts`, `75-arena-team.js`, `64-my-record.js`,
`66-extras-b.js`. Reached from the bottom bar "My team" (shows "6/6" count), Home, Saved teams Open, `data-view="build"` (alias).

### TEAM-01 Header: kicker and team name
- Sees: "My team: 6 of 6, Sun team" (count + weather/terrain word), then the team's name as the page heading: the saved team's name
  when one is open, else the archetype label ("Sun, Grassy Terrain, Tailwind", "Balance (Fake Out pressure)"), "No team yet" when
  empty. Long names get a smaller size.
- Code: `74-arena.js AR.team`, `27-team-page.js teamTitleFor`, `66-extras-b.js wxKeyOf/wxName`.
- Data: `S.loadedId`, `S.teams`, archetype of `members()`.
- Test: load a saved team → heading is its name. Clear team → "No team yet", "My team: 0 of 6".

### TEAM-02 Removed-Pokémon note ("gone" note)
- Sees: a status line when a slot holds a Pokémon that's not legal in this regulation any more (kept, not shown).
- Code: `06-helpers.js goneNote/goneOf`; used in `AR.team` and Saved teams.
- Test: put a non-roster name in a saved slot (dev only) → note appears saying it's left out. (Hard for a player to trigger.)

### TEAM-03 Strength Score block
- Sees: "Strength Score" (or "Strength Score so far" for 1-5 Pokémon), a ring filled to the score in its band colour with the
  number, the band word (90+ Top tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic), "Teams scoring like
  this win about 60% against today's tournament teams", small rank "Top 1% of tournament teams", optional "Few real games back this
  mix yet, so it's a best guess", and "Why this score?". Ring pops/counts up when the score changes (not with reduced motion).
  Old fallback (model not loaded): "Grade" with a letter and "/100".
- Code: `74-arena.js AR.team` (`G.v===2` branch), `60-concept-h.js CH.gradeOf, CH.strengthOf, CH.partialOf, CH.wordOfL, CH.gcol,
  CH.pctTxt, CH.sticky, CH.gradeMotion`; `65-design-c.js` sparkle when it rises.
- Data: `META.model`, `META.results` (a six's own record), LS `np.gl` (letter buffer so a daily data change of 1-2 points doesn't flip
  the band).
- Test: sample team → "93, Top tier". Remove one Pokémon → label becomes "Strength Score so far". With no team, no score shows.

### TEAM-04 "Why this score?" breakdown
- Sees: toggles a panel: "93, Top tier. Teams scoring like this win about 60%… (top 1%…)", parts that add up (e.g. "89 from how its
  Pokémon, pairs and sets do in real tournament games", "+1 for its matchups (ready for 21/30)", "+3 from this exact six's own 659
  real games"), test evidence line with "More", "How sure: High/…", the band legend, and "How the grade works →" (→ How we calculate,
  grade section).
- Code: `[data-chgrade]` handler `60-concept-h.js`, `CH.gradeWhy` (`#chGwhy`), `ui.gwhy`; "More" from `70-riso2.js` long-text helper.
- Test: tap "Why this score?" → panel opens and the button's expanded state is on; the numbers listed add up to the big number.

### TEAM-05 Switch team fold
- Sees: "Switch team · N saved" fold under the title listing up to 8 other saved teams (mini sprites + name); tapping one opens it
  (same as Saved teams Open, with Undo toast).
- Code: `74-arena.js AR.switcher` (`data-load`), handler `34-events.js d.load`.
- Data: reads `S.teams`; writes `S.slots`, `S.loadedId`.
- Test: with 2+ saved teams, open "Switch team", tap another team → heading changes to its name and toast "Opened "…"" with Undo.

### TEAM-06 "Team Sheet" button
- Sees: "Team Sheet" next to Switch team; opens the Team Sheet page.
- Code: `[data-tsopen]` (`76-team-sheet.js`).
- Test: tap "Team Sheet" → page titled "Team Sheet" listing all six sets.

### TEAM-07 Jump bar (phones and tablets)
- Sees: a sliding picker "Suggestions | Matchups | How it plays | Sets"; tapping scrolls to that part, opens it if folded, keeps the
  chosen item highlighted after redraws, moves focus to its heading.
- Code: `74-arena.js AR.jumps`, `[data-arjump]`, `AR.jumpOn`; slider look `76-slide.js`.
- Test: phone width, tap "Sets" → page scrolls to "All Six Sets" and its team sheet fold is open.

### TEAM-08 Your Six stage (tiles)
- Sees: "Your six" heading and six big art tiles ordered lead, back, bench (Megas with a two-colour contour), empty slots as "+ Add a
  Pokémon". Tapping a tile shows its set card (TEAM-10) and marks the tile; tapping again hides it. Phone: "Tap a Pokémon to see its
  set" hint while none is open; tablets/desktop open the first lead's set automatically on first view; phones wait.
- Code: `74-arena.js AR.team` stage (`data-chset`, `AR.art`, `AR.emptyArt` with `data-chedit`), handler `70-riso2.js [data-chset]`
  (`ui.rzSet`), selection ring `74-arena.js`.
- Test: tap Garchomp's tile → a set card for Garchomp appears; tap it again → card closes.

### TEAM-09 Lock and Remove on a tile
- Sees: on each tile a padlock button ("Lock X: suggestions never swap out a locked Pokémon"; yellow when locked; tooltip "Locked:
  suggestions keep it") and an × ("Remove X from your team"). On phones they show only on the tapped tile.
- Code: `AR.team` (`data-lock`, `data-chrm`); lock handler `34-events.js d.lock` (`S.slots[i].lock`); remove handler
  `60-concept-h.js [data-chrm]` (`keepUndo`, toast "Removed X" with Undo).
- Data: writes `S.slots[i].lock` / blanks the slot.
- Test: tap the padlock on Whimsicott → its label becomes "Unlock Whimsicott…"; suggestions never offer to swap Whimsicott out.
  Tap × on Basculegion → toast "Removed Basculegion · Undo"; tap Undo → "Change undone" and it's back.

### TEAM-10 Set card (tapped Pokémon)
- Sees: avatar on its type field, name, type tags, its place in the plan ("Leads with Garchomp vs the meta's top six" / "In the back
  with …" / "On the bench"), rating number with "S tier rating", Item, Ability, Nature (+"yours" or "most run"), Stat points as words
  ("32 SpA, 32 Spe, 2 HP") (+"yours"/"most run"), the four moves as strips edged in the move's type colour, and buttons "Edit set",
  "Set as lead" (only when not already a lead), "Info sheet ›".
- Code: `74-arena.js rzSetHtml` (overrides `70-riso2.js` version), `AR.natCells`, `AR.roleOf`, `AR.lineup`.
- Data: `members()` (popular set where unchanged), `setFor`, `commonSpread`.
- Test: tap a tile → card lists item, ability, nature, stat points and 4 moves; "Edit set" opens the edit panel on that Pokémon;
  "Info sheet ›" opens its info sheet.

### TEAM-11 Set as lead / Use NastyPlot's pick
- Sees: "Set as lead" on a non-lead's set card makes it lead with the current first lead (toast "X now leads"); the game plan line then
  says "your pick" and offers "Use NastyPlot's pick" (toast "Back to NastyPlot's lead pick"). Home's plan follows it too.
- Code: `74-arena.js [data-arlead]`, `AR.userLeads`.
- Data: writes `S.leads` (2 names). Note: in the committed code `S.leads` is saved only in browser storage, not the account document
  (the working tree is being changed to add it; see Unsure).
- Test: open Basculegion's card, tap "Set as lead" → plan line "lead Basculegion + …"; tap "Use NastyPlot's pick" → back.

### TEAM-12 Game plan line under the six
- Sees: "Game plan vs the meta's top six: lead A + B, back C + D, bench E + F." (or "in team order" for under 4 / no planner, "your
  pick" after Set as lead).
- Code: `AR.plan`, `AR.lineup` (`MG.lineup`, `CH.four` = Battle mode planner vs the 6 most-used).
- Test: sample team shows a line naming two leads, two back, two bench.

### TEAM-13 Team actions row
- Sees: "Saved Teams" (→ Saved teams), "My Box" (→ My Box), "Compare with…" (→ Compare with My team as A), "Copy for Showdown",
  "Save team" / "Update saved team" (when a saved team is open), "Share", "⋯" menu with "Import", "Export", "Clear team". With an
  empty team: Save, Share, Export and Clear team are hidden; Import stays.
- Code: `chTeamRender` (`#chActs`: `data-view`, `data-cxgo="cur|"`, `sdBtn('mine')`), moved original buttons `#saveBtn #shareBtn
  #importBtn #exportBtn #clearTeam` (body.html), `08-render-all.js render` sets Save label.
- Test: open a saved team → button reads "Update saved team"; new team → "Save team". Empty team → only Saved Teams, My Box and ⋯
  (Import) remain.

### TEAM-14 Clear team
- Sees: ⋯ → "Clear team" empties all six; toast "Team cleared" with Undo; ⋯ menu closes.
- Code: `34-events.js #clearTeam` (`keepUndo`, `S.loadedId=null`), double-tap guard.
- Test: ⋯ → Clear team → "No team yet"; Undo restores the six and the open saved team.

### TEAM-15 Matchups summary (header stats)
- Sees: "Matchups" with three numbers "4 Favoured / 22 Even / 4 Unfavoured", "vs the top 30 threats in real games", a three-part bar,
  and "Damage calc: covers 21 of 30". (Older modes kept in code: `window.NP_MUHEAD` 2 or 3.)
- Code: `74-arena.js AR.team` (`MH` option 1), `CH.realVs`, `CH.hand`, `prepOf`.
- Data: `META.results`/model for real-game verdicts; damage-calc readiness.
- Test: the three numbers add to 30 and match the counts in the Matchups section legend.

### TEAM-16 Legal and team-checks badge
- Sees: "Legal" (or "Not legal yet"), "Team checks 4/4" with 4 pips; tooltip "Based on our reading of the Reg M-C rules. Check the
  official rules before an event."
- Code: `AR.team` `leg`; `ui.vsum.legal`, `ui.vsum.CK` from `renderVerdict`/`proChecks`.
- Test: sample → "Legal, Team checks 4/4". A team with two Megas of the same species can't happen (species clause), but two same items
  (only possible via edit) → see Item Clause in TEAM-21.

### TEAM-17 Your games (this six)
- See section LOG (LOG-01…LOG-07).

### TEAM-18 Weather backdrop on the header
- Sees: a quiet animated backdrop (rain streaks, sun rays, sand, snow, leaves, sparks, mist) when the team sets weather/terrain; paused
  off screen and in hidden tabs; static under reduced motion.
- Code: `66-extras-b.js` `CH.wrap('chTeamRender')` (`.chthead` — the old header, now mostly covered by the arena header; unsure how
  visible it is in the arena layout), `wxLayer`.
- Test: sample team (sun) → a sun effect behind the header; reduced-motion setting → no movement.

### TEAM-19 Empty team state
- Sees: Darkrai picture (from `window.NP_MASCOT`), "Add your six and NastyPlot scouts the top 30 threats for you. Start with one, or
  let NastyPlot build six from real winning teams.", "Add your first Pokémon ➜" (opens the add panel on slot 1), "Build me a team"
  (→ Build), six "+ Add a Pokémon" tiles; parts 1-3 hidden; part 4 says "Tap a slot to add a Pokémon".
- Code: `74-arena.js AR.team` empty branch, `60-concept-h.js chTeamRender` (hides `#chP1..3`).
- Test: Clear team → this state appears; tap "Add your first Pokémon" → add panel with the name box focused.

### TEAM-20 Partial team (1-5)
- Sees: "Strength Score so far" (rated as if empty slots were typical), Matchups and checks "so far", empty tiles "+ Add a Pokémon",
  suggestions can be "+ X added" (adds, not swaps), "Your games" hidden (needs 6), "Compare with…", Save, Share available.
- Code: `CH.partialOf`, `renderMyRec` (removed when not 6), `CH.sugs`.
- Test: two Pokémon → score labelled "so far"; first suggestion reads "+ Whimsicott added"; no "Your games" card.

### Part 1 · Suggestions (`#chP1`)

### SUG-01 Suggest from (pool switch)
- Sees: "Suggest from: My Box | Box + catch | Whole roster" (sliding picker). Changing it reworks suggestions; toast "Suggestions only
  use your box" / "Your box first, then the best Pokémon to catch" / "Suggestions use the full roster".
- Code: `60-concept-h.js [data-chpool]` (same setting as the old `#poolSel`).
- Data: LS `cc2.pool` (`ui.pool`), default "boxfill".
- Test: tap "Whole roster" → toast; reload → still "Whole roster".

### SUG-02 Megas on team (0 / 1 / 2)
- Sees: "Megas on team 0 | 1 | 2". Toast "Teams aim for 2 Megas" / "Teams without Megas: rare (about 1 in 100 tournament teams), and
  they win about a third of their games". Same control on Build and All suggestions.
- Code: `34-events.js d.megas` (`S.megaGoal`, `S.maxMega`).
- Data: writes `S.megaGoal`, `S.maxMega` (account-synced).
- Test: tap 0 → toast about teams without Megas; reload → 0 still selected.

### SUG-03 Swap my Mega? (No / Yes)
- Sees: "Swap my Mega? No | Yes"; toast "Plans can now swap your Mega" / "Your Mega is protected again".
- Code: `60-concept-h.js [data-chswapm]` → toggles hidden `#swapMega` checkbox (in Plan settings on All suggestions).
- Data: not saved (checkbox state only; resets on reload — unsure if intended).
- Test: tap Yes → toast; suggestions may now replace the Mega.

### SUG-04 Suggestion cards
- Sees: up to 3 suggestions, the first shown, then "Show N more suggestion(s)" opens the next in place and becomes "See all
  suggestions ›" (→ All suggestions page). Each card: sprites "out → in" (or "+ in"), "Basculegion for Rillaboom" / "Whimsicott
  added", the score change "+8 (83 → 91), Top tier", a kind line ("Fix …", "Small edge about 3 more wins in 100 games in real play",
  "Option …"), "Apply" (first is primary), and "Why? N reasons" fold (weak spots before → after, threats covered/lost with the calc,
  checks fixed, offense, "often paired with"). Multi-change suggestions list one row per change. While suggestions are worked out the
  old list stays faded and not tappable ("Working out suggestions for your team…"); the list never shrinks under the finger for the
  same team.
- Code: `60-concept-h.js CH.sugs` (`data-plan`, `data-sugmore`, `data-view="coverage"`), `36-lanes.js LANE.line/apply`,
  `29-fix-planner.js` planner (`planJobStart` in 08-render-all, background slices), `planGrade`, `gradeChip`; min-height hold
  `74-arena.js AR.parts`.
- Data: reads box, roster, model, results, `S.excl` (never suggest), locks, `S.megaGoal`.
- Test: sample team at phone width; see "Apply" on the first card; open "Why?" → a list of reasons; tap "Show 2 more suggestions" →
  two more cards and the link becomes "See all suggestions ›".

### SUG-05 Apply a suggestion
- Sees: tapping Apply swaps the Pokémon in (typical build), page keeps its place, toast "Applied: X and Y" with Undo, and an Undo bar
  above the suggestions (SUG-06). A Pokémon you just swapped out is not offered straight back.
- Code: `34-events.js d.plan` (`ui.swOut`, `undoMark`, `keepScroll`), `72-keep-place.js` keeps the tapped control in place, double-tap
  guard (`TAP_ACT`, 450 ms).
- Data: writes `S.slots`.
- Test: tap Apply on "Basculegion for Rillaboom" → Rillaboom's tile is replaced by Basculegion; toast "Applied: Basculegion…".

### SUG-06 Undo bar (stacked undo of applied suggestions)
- Sees: "Applied <label>  Undo" above the suggestions after each Apply (also after quick add / set tip); Undo steps back one at a time
  (up to 8); toast "Undone: <label>". Disappears once the team is changed some other way.
- Code: `06-helpers.js undoMark/undoTop/undoBarHtml/undoBarSync`, `[data-undobar]`; host `.chundohost` (60-concept-h).
- Data: `ui.undoStack` (memory only; cleared when another device changes the team).
- Test: Apply twice → bar shows the second; Undo → bar shows the first; Undo → team is back to start.

### SUG-07 Protect fix card
- Sees: when only 0-2 of the six run Protect and some usual sets do: "Fix: only N of your six run Protect: teams with … won about 15
  fewer games in 100…", "Their usual sets run it: X and Y", button "Add Protect" (puts Protect in each named set, replacing its least
  popular move; toast with Undo).
- Code: `36-lanes.js LANE.protCard/protApply`, `[data-protfix]`.
- Data: writes `S.slots[i].mv.doubles`.
- Test: edit sets so only one Pokémon has Protect → the card appears; "Add Protect" → the named Pokémon now show Protect in their moves.

### SUG-08 "Nothing to fix" card
- Sees: "Nothing to fix. Your team has every basic and no swap clearly beats it in real games.", "Your edge now comes from how you
  play it…", buttons "Battle" and "Sets".
- Code: `36-lanes.js LANE.noneCard` (`data-view="matchup"`, `data-view="sets"`).
- Test: sample team at phone width shows this card above the options.

### SUG-09 Side-grade / no-gain messages
- Sees: when nothing raises the score: "Nothing raises this team's Strength Score right now. These swaps keep every check and about
  the same grade, with a different look:" (up to 3), or "…and every other swap would lower it." with "See all suggestions ›"; or "No
  single change from this pool raises the team's Strength Score. Try another pool above…"; a game-plan gap note when nothing in the pool
  can fix it.
- Code: `CH.sugs` (`ui.plans.more`, `gapNote`).
- Test: a top-tier team with "My Box" pool → one of these messages instead of Apply cards.

### SUG-10 Problems and Team Checks fold
- Sees: fold "Problems and Team Checks · 7 to look at, 4/4 checks, legal". Opening it also opens the first problem that has a fix.
  Contains:
  - problem rows (severity tag + text): Item clash, game-plan gaps (speed control, support, weather/terrain, Trick Room fit), "Megas"
    (none), Weakness ("Ice 3 weak (Garchomp (4×)…), only 1 resists"), Nobody resists, 4× weak, Offense gaps, Same weak as resist,
    unused weather setter, Fringe pick, Game plan (OK);
  - each fixable row folds open to "Quick add" picks (up to 3 + one "Hidden gem"): sprite, name, types, tags (Mega / In your box / To
    catch / Hidden gem / idea tag), why ("Resists Ice, often paired with Incineroar"), a covered-threat line, button "Swap out X" or
    "Add", and "Ready +2%" / "Good fit"; "Fixed by a pick above." / no-fix explanations;
  - "Show N more" / "Show less" (first 4 shown);
  - Team checks card: "2 of 4 checks", explanation, ✓/✗/~ list (Mega Evolution, No major weak spot, Weak spots spread out, Ready for
    the top threats) with what it has/misses and "100% of 113 recent event winners…", then "Notes, not counted" (Speed control, Spread
    damage, Lead support);
  - Verdict block: "Ready for 85% of the top 30 threats, handles 24 of 30", "85% ready ?", "2/4 checks ?", "Legal", "Legal & items"
    lines, "No answer for", "Shaky against", "Checklist", "Type balance", rules note.
- Code: fold `chTeamInit mk('rfix')` (`#chfFix`); `09-quick-add.js renderProblems/renderQuick` (`#needs`, `data-qa`, `#needsMore`);
  `08-render-all.js render` (`#chkCard`), `renderVerdict` (`#verdict`); tips `46-onboarding.js` (`data-tip`); auto-open
  `74-arena.js` toggle handler; Apply handler `34-events.js d.qa`.
- Data: LS `cc2.chf.rfix` (open state), `np.ckwin` (measured winner rates cache); quick add writes `S.slots`.
- Test: harness team (Charizard Y, Garchomp, Incineroar, Whimsicott, Rillaboom, Sneasler) → fold says "7 to look at, 2/4 checks";
  open the "Ice" row → "Quick add" with "Swap out Rillaboom"; tap it → toast with Undo and the Undo bar.

### SUG-11 "?" explainer tips
- Sees: small "?" buttons next to terms (Ready for the top threats, Checklist, rating, bars, How to read our numbers, spread, tiers);
  tap shows a bubble (with a small Darkrai) and a link to How we calculate; tap outside, Escape or scrolling closes it.
- Code: `46-onboarding.js TIPS, tip(), tipText()`, `[data-tip]`, `#tipPop`; `methodTipLink`.
- Test: tap "?" next to "85% ready" → bubble titled "Ready for the top threats"; press Escape → closes.

### Part 2 · Matchups (`#chP2`)

### MU-01 Matchups view switch
- Sees: "Top 10 | Top 12 grid | All 30" (remembered).
- Code: `CH.seg('thr')`, `[data-chsegv]` handler `60-concept-h.js`.
- Data: LS `cc2.seg.thr`.
- Test: pick "All 30", reload → still "All 30".

### MU-02 Top 10 threats list
- Sees: intro "Verdicts from real tournament games: …", 10 numbered rows (by top-cut share): sprite, name, real-games verdict
  (Favoured / Even match / Unfavoured) and "Calc: Beats it / Handles it / Shaky / No answer"; then "The next 20, worst first" as small
  tiles; legend "Unfavoured 4 · Even match 22 · Favoured 4" and "Damage calc: No answer 0, Shaky 9, Handles it 9, Beats it 12". Phones
  and tablets show 5 rows and "Show 5 more" / "Show top 5 only". Each row/tile opens the threat sheet (MU-05).
- Code: `60-concept-h.js CH.threats10`, `CH.legendRow`, `CH.realVs`, `[data-tlmore]`, `[data-chthr]`.
- Test: phone → 5 rows and "Show 5 more"; tap → 10 rows. Tap "Archaludon" → threat sheet opens on Archaludon.

### MU-03 Top 12 grid
- Sees: table: your six as columns, top 12 threats as rows (worst first), cells ✓ answers / ~ partial / ✗ loses 1-on-1 / – no direct
  matchup (colour + shape), legend, "Tap one for the full matchup". Tapping a row opens the threat sheet.
- Code: `61-concept-h-pages.js CH.chart`, `CH.cellOf`, `[data-chhthr]` (60-concept-h line ~459).
- Test: choose "Top 12 grid" → 12 rows with 6 cells each; tap a row → threat sheet for that Pokémon.

### MU-04 All 30 (threat preparation + biggest threats)
- Sees: "Threat preparation: Ready for 81% of the top 30 threats", groups No answer / Shaky (open) and Handles it / Beats it (closed),
  each threat a fold with calc reasons (✓/~/✗ lines, "It beats X 1-on-1", field and its usual set); then "Biggest threats" list (Meta
  Pokémon that hit several of yours hard): name, types, "Hits 5 of yours super effectively (…)", answer, "Hardest hit: … up to 135% to
  Basculegion", level tag; may have a show-all button.
- Code: `08-render-all.js renderThreatCard` (`#thrCard`, `ui.thrOpen` remembers open rows), `renderThreats` (12-meta-threats /
  17-matchup-threats-teams, `#threats`, `#threatsAllBtn`).
- Test: choose "All 30" → "Threat preparation" with groups; open a threat → reasons and "its usual set".

### MU-05 Threat sheet (scouting report bottom sheet)
- Sees: dialog "Scouting report: top 30 threats", "9 threats need a plan." (or "Ready for every top threat."), a ring with the grade
  letter and "58% wins"/score, the score sum line with "?", "handles 21 of the top 30", legend, a tile per threat (tap toggles its
  detail), the selected threat's detail (sprite, "% of top cuts", evidence, level, a dot per your Pokémon ✓/~/✗/–), up to 5 worst threats
  listed, "Team checks: 4/4" ✓/✗, "Best fix: <change> (score move)" with "Apply this fix ➜" (closes the sheet after applying), "Full
  report", "Close", × close. Escape and the backdrop close it; focus returns to the opener; Back button closes it.
- Code: `60-concept-h.js chScoutOpen/chScoutRender/chScoutClose` (`#chScout`, `#chScrim`, `data-chthr`, `data-chclose`,
  `data-chfull`, `data-plan="0"`), focus/keys `75-arena-team.js`.
- Test: tap a threat in Top 10 → sheet opens on it; tap another tile inside → its detail shows; press Escape → closed and focus back
  on the row.

### Part 3 · How your team plays (`#chP3`)

### PLAY-01 Game Plan fold
- Sees: fold "Game Plan · leads, backups and what to watch" (summary also lists archetype tags, e.g. "Sun + Grassy terrain + …").
  Inside: archetype chips and rows with status Covered / Missing / Partly / Optional: Speed control, Backup speed, Weather, Terrain,
  Lead support, Priority attacks, Answer to their speed control, Hits your own side (spread moves hitting partners, safe partners).
- Code: `08-render-all.js renderGamePlan` (`#gplan`, `.gpcard`), fold `mk('rgplan')`.
- Data: LS `cc2.chf.rgplan`.
- Test: open "Game Plan" → "Speed control: Covered, Whimsicott with Tailwind".

### PLAY-02 Types fold (Offense / Defense)
- Sees: fold "Types · What you hit and what hits you" with switch "Offense: what you hit | Defense: what hits you".
  Offense: "You OHKO or 2HKO 30 of the top 30 threats", "18/18 types hit super effectively", "Nothing 2HKOs", "Nobody hits super
  effectively", "Types only" warning; "Full Tables" fold: every defending type with best multiplier and who hits it (move), and "Against
  the top 20 <source> Pokémon" table (threat, best, your best hit).
  Defense: "N more weaknesses than resistances", "of the top 30 threats beat 3+ of yours 1-on-1", chips More weak than resist / Nobody
  resists / Even split, the full type grid (attack type × your six, Weak/Resist/Net), and with 2+ Megas "Only one Mega Evolves per
  battle, so the chart reads X as the Mega… Show: A · B" (switch which Mega).
- Code: `08-render-all.js render` (`#offCard`, `#offTypes`, `#defCard`, `#grid`), `09-quick-add.js renderOffMeta` (`#offMeta`),
  `megaPickHtml` (`data-megapick`), fold `mk('rtypes')`, `CH.seg('types')`.
- Data: LS `cc2.chf.rtypes`, `cc2.seg.types`; `ui.megaPick` (memory); `ui.metaSrc` picks the meta source for the top-20 table.
- Test: open Types → Defense → a table with one row per attacking type; with Charizard Y and another Mega, "Show:" buttons switch the
  read Mega.

### Part 4 · All Six Sets (`#chP4`)

### SETS-01 Open team sheet fold
- Sees: fold "Open Team Sheet · 6 sets, Reg M-C, bring 6, pick 4" (closed by default on phones; remembered). Inside, one card per
  Pokémon (same card as the Team Sheet page): sprite, name, Item, Ability, 4 moves, a one-line note ("↑ Lead vs the meta's six · …" or
  a KO note), nature "+SpA −Atk", spread source ("Most common spread"/yours/assumed), six stats at level 50 with stat points below and
  nature +/−; a "−" remove button; tapping the card opens the edit panel; empty slots are "+ Add a Pokémon" cards; key line at bottom.
- Code: `74-arena.js AR.parts` (`CH.fold('sheet2')`, `#chSets`), `60-concept-h.js chTeamRender` (`#chSheetOut`, `TS.card(m,{fold})`,
  `TS.addCard`), `data-chedit`, `data-chrm`; Enter/Space opens (`div.chrow` / article role=button).
- Data: LS `cc2.chf.sheet2`.
- Test: open the fold, tap Whimsicott's card → edit panel "Edit Whimsicott". Tap "−" → removed with Undo toast.

### SETS-02 How Scoring Works fold
- Sees: fold at the bottom "How Scoring Works" with paragraphs (Ready for the top threats, Team checks, Defense, Offense, Plans,
  NastyPlot rating, Archetypes, data source), long ones behind "More".
- Code: moved from All suggestions' `details.foot` by `chTeamInit` (`data-chf="rhow"`), "More" by `70-riso2.js`.
- Data: LS `cc2.chf.rhow`.
- Test: open it → "Ready for the top threats: the 30 Pokémon that make top cut most often…".

### SETS-03 Mega halo on sheet rows
- Sees: a soft prismatic halo behind Mega rows in the sheet (decorative).
- Code: `66-extras-a.js` (`npmega` on `.chrow` — the old row; unsure it still applies to the new TS cards).
- Test: none needed beyond a visual check.

