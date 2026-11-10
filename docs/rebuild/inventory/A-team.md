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

---

## 3. Edit panel and set editing (EDIT)

The whole original team editor (`#team` section with `#slots`) lives inside a slide-up dialog `#chEdit` ("Edit team"), built by
`60-concept-h.js chTeamInit`; it shows one slot (`data-slot=i`) or all six (`all`, for Save / Import / Export). Slot editors are drawn
by `07-render-slots.js slotHtml` (lazily, `slotsFlush` / `slotsIdle`) with blocks from `08-render-all.js spreadBlock`,
`29-fix-planner.js abilBlock/itemBlock/movesBlock`.

### EDIT-01 Open / close the edit panel
- Sees: opens from "Edit set" (set card), tapping a sheet card, an empty tile/slot, Save/Import/Export. Title "Edit Mega Charizard Y" /
  "Add a Pokémon" / "Edit team"; "Done" closes; tapping the dimmed backdrop, Escape (unless a name list is open) or the Back button
  close it; page behind can't scroll; focus moves into the panel, stays inside (Tab wraps) and returns to the opener on close.
- Code: `chEditOpen/chEditClose/chEditStrip`, `[data-chedit]`, `#chEditDone`, `#chEditScrim`; focus `75-arena-team.js`
  (`ARB.trap`, `ARB.back`); Back button `32-views.js OVERLAYS`.
- Test: tap a tile, "Edit set" → panel titled "Edit <name>"; press Escape → closed, focus on "Edit set" again.

### EDIT-02 Six-slot strip inside the panel
- Sees: a row of six mini sprites ("Edit X") and "+" ("Add a Pokémon in slot N"); the current one marked; tapping switches the panel
  to that slot.
- Code: `chEditStrip` (`.chedstrip`, `data-chedit`).
- Test: in the panel tap the third sprite → title changes to that Pokémon.

### EDIT-03 Slot header card
- Sees: slot number, Lock button ("Lock"/"Locked"), name, type chips, tags Mega / In your box, rating tag ("S tier 94"), usage bar
  "21.6% of teams", held item line (italic "assumed" style when not chosen: "Assumed: you haven't set an item, so this is the one most
  players run").
- Code: `07-render-slots.js slotHtml` (`data-lock`, `ratingTag`, `topItems`); × remove `data-clear` (shown in "Edit team" mode).
- Test: in the panel tap "Lock" → it reads "Locked"; the tile's padlock shows locked too.

### EDIT-04 Nature picker
- Sees: "Nature" with tag "Most run" or "Your pick" + "Use <top nature>"; a dropdown of all 21 natures, most-run first, each with
  "+Spe −Atk" and share %, ★ on the most run. Picking saves at once (toast "Nature saved").
- Code: `08-render-all.js spreadBlock` (`data-spnat`, `data-spnatreset`), handlers in 08-render-all.
- Data: writes `S.slots[i].sp.doubles = {nat, v}` or `{nat, assumed:true}`.
- Test: choose "Modest" → toast "Nature saved"; the set card shows "Modest · yours"; "Use Timid" puts it back.

### EDIT-05 Stat points editor
- Sees: "Stat Points" with tag "Most common" / "Yours" + "Use most common" / "assumed"; live total "66 of 66" (turns warning when over);
  six number boxes HP Atk Def SpA SpD Spe (0-32); "Save stat points"; messages "Each box takes a whole number, 0-32", "That's 70
  points; Champions allows 66", "Pick a nature". Toasts "Stat points saved", "Using the most common stat points".
- Code: `spreadBlock` (`data-spi`, `data-spsave2`, `data-spptsreset`, `#sptot<i>`, `#spmsg<i>`); `SP_TOTAL`.
- Data: writes `S.slots[i].sp.doubles.v`.
- Test: type 32 in HP → total "98 of 66" and Save shows "That's 98 points; Champions allows 66"; fix to a valid spread → "Stat points
  saved" and the Team Sheet shows the new stats.

### EDIT-06 Ability picker
- Sees: "Ability" tag "Most used" / "Only ability" / "Mega ability" / "Suggested · no usage data" / "Your pick" + "Use <ability>";
  dropdown of its abilities with share % and ★. Toast "<A>: the most-used ability" or "<A> set (most players run <B>)".
- Code: `29-fix-planner.js abilBlock` (`#ab<i>`, `data-abreset`); change handler `34-events.js` (`/^ab\d$/`).
- Data: writes `S.slots[i].a` (null = most used).
- Test: pick a rarer ability → toast names the common one; "Use Prankster" restores it.

### EDIT-07 Item picker
- Sees: "Item" tag "Most used" / "No usage data" / "Your pick" + "Use <usual item>" / "<item> is on a teammate" (Item Clause moved it);
  dropdown: "(no item)" when none, group "Most used in doubles" (top 8 with %, ★), group "Other items" (every item players run in
  Champions). Megas show "Mega stone" and a fixed stone. Warning "Clashes with Trick Room…" for Choice Scarf on a Trick Room team.
  Toast "<item> · ready for 85% → 87% of the top threats" (+ "clashes with Trick Room").
- Code: `29-fix-planner.js itemBlock/itemPool` (`#it<i>`, `data-iti`, `data-itreset`); `34-events.js` change handler; `assignItems`.
- Data: writes `S.slots[i].it.doubles`.
- Test: give Whimsicott "Sitrus Berry" → toast with readiness; tag "Your pick" and "Use Focus Sash".

### EDIT-08 Moves (four pickers)
- Sees: "Moves" with "Tournament set"/"Popular … set"/"Showdown set"/"likely moves (no usage data)" or "Your set" + "Reset to
  popular"; "power · % used"; four tiles each showing move name, type chip, power and % used, opening a dropdown: "(no move)", group
  "Popular in doubles" with %, group "All moves it learns"; a move already in another tile is disabled. Toast "<move> replaces <old> ·
  Offense 18 → 17 of 18 · rarely used" or "<P> can't learn <move>"; reset toast "Back to the popular set · Offense …".
- Code: `29-fix-planner.js movesBlock` (`#mv<i>_<j>`, `data-mvi`, `data-mvreset`), `33-move-edits.js setMove`, `34-events.js`.
- Data: writes `S.slots[i].mv.doubles` (removed when equal to the popular four).
- Test: change move 4 → toast mentions Offense count; "Reset to popular" brings the popular four back.

### EDIT-09 "Full popular sets ›"
- Sees: link under the moves; closes the panel and opens Popular sets on this Pokémon.
- Code: `[data-fullset]` (34-events.js), LS `cc2.setMon`.
- Test: tap it → Popular sets page for that Pokémon.

### EDIT-10 Weak / Resists / ability text fold
- Sees: fold "Weak: Water Electric Rock 4×" → "Resists: …" chips and the ability's description; Mega/ability modifiers note
  (`modText`).
- Code: `slotHtml` (`details.slmore`).
- Test: open the fold → Resists list and ability text.

### EDIT-11 Remove from the team (in panel)
- Sees: "Remove <name> from the team" at the bottom; removes with Undo toast and the panel switches to "Add a Pokémon" for that slot.
- Code: `chEditStrip` (`.chedrm`, `data-chrm`).
- Test: tap it → toast "Removed X · Undo"; title becomes "Add a Pokémon".

### EDIT-12 "Edit team" (all six) mode
- Sees: when opened via Save/Import/Export: all six editors stacked (each with Lock and ×), plus the Save / Import / Export panel at the
  top. A "Full sets | Grid" card-view switch exists in markup but is not visible (see Dead list).
- Code: `chEditOpen(null)` from `#saveBtn/#importBtn/#exportBtn` capture handler; `07-render-slots.js` `data-tview` (hidden).
- Test: tap "Save team" → panel "Edit team" with the save box and six set editors.

---

## 4. Adding a Pokémon (ADD)

### ADD-01 Name box with live search (combobox)
- Sees: "Add a Pokémon" box in an empty slot (panel opens with it focused so phones raise the keyboard). Typing part of a name ("mega
  sal", "hisuian arc", "garch") lists up to 8 matches: sprite, name, type chips, "In your box" tag, share of tournament teams ("9.7%",
  "<0.1%", "–"). ArrowUp/Down move, Enter picks, Escape closes the list only, mouse/tap picks. "No matches. Try fewer letters."; Species
  Clause: Pokémon whose species is already on the team are left out ("Garchomp is already here" / "Those are already here"). Picking
  adds it (toast "<name> added"), the panel title becomes "Edit <name>".
- Code: `05-combobox.js openMenu/bindMonInput/kb/monOpt`, `04-search.js searchMon` (scores exact, prefix, in-box, usage),
  `07-render-slots.js slotsAfter` (species clause pool), clear × `61-concept-h-pages.js clrWrap` (`data-clr`).
- Data: writes `S.slots[i] = {n, a:null, lock:false}`.
- Test: empty slot, type "mega sal" → "Mega Salamence" listed; Enter → toast "Mega Salamence added". Type "garch" with Garchomp on the
  team → "Those are already here".

### ADD-02 Typing is protected from redraws
- Sees: a redraw (data arriving, another device's change) while typing keeps the text, cursor and list.
- Code: `07-render-slots.js renderSlots` (restores focus/value), `03-persistence.js typingInBox/waitTyping`, `08-render-all.js typingNow`.
- Test: start typing in a name box while the page is still loading data → text is not wiped.

### ADD-03 Other ways to add (entry points in this scope)
- Sees: "Add to team" on the info sheet (PKMN-03), quick add / suggestions (SUG-04, SUG-10), "Add your first Pokémon" (TEAM-19), Home
  empty tiles (HOME-10), "Load this team" (HOME-09), Import (IO-01), team links (SHARE-06).
- Test: covered in those entries.

---

## 5. Showdown import / export / copy (IO)

### IO-01 Import a team (paste)
- Sees: ⋯ → "Import" (or "Import a team" / "Import from Showdown" links) opens "Import a team" with × close, a big box "Paste a NastyPlot
  team link, or a Showdown team (from Showdown, Pokémon Zone, Pikalytics or Victory Road).", "Replace my team", "Pokepaste links can't be
  opened from here; copy the team text instead.", rules note. Replace reads up to 6 blocks: species (forms, genders, Mega from stone),
  item, Ability, EVs/IVs → stat points, nature, moves. Unknown Pokémon/moves/items are skipped and reported, never guessed; one per
  species; a nature with no EVs → most common points with that nature (assumed); totals over 66 skipped. Toast "Imported 2 Pokémon. Not
  in Reg M-C, left out: Mewtwo. Not in Champions, skipped: Choice Band (Garchomp), Bogus Move (Incineroar)" with Undo. A pasted team
  link/code is loaded the same way (SHARE-06). Nothing found → note under the box.
- Code: `19-showdown-paste.js parsePaste/renderPastePanel/speciesFromPaste/pasteSpread`, `34-events.js #importBtn/#pasteLoad/
  [data-pastex]`, `45-team-links.js decodeTeam/applyShared`.
- Data: writes `S.slots` (with `mv`, `it`, `sp`), `S.loadedId=null`; `ui.paste`.
- Test: paste a Showdown export with an illegal Pokémon → toast lists what was left out; Undo restores the old team.

### IO-02 Export to Showdown
- Sees: ⋯ → "Export" opens "Export to Showdown" with × close, a read-only box with the team in Showdown format, "Copy" (toast "Copied" or
  "Press Ctrl+C or Cmd+C to copy"), note that items/natures/points are yours or the most common, never two on one item.
- Code: `19-showdown-paste.js exportPaste/renderPastePanel`, `#pasteCopy`.
- Test: Export → text starts with "Charizard @ Charizardite Y", "Ability: Drought", "Level: 50", "EVs:", "Timid Nature", moves.

### IO-03 Copy for Showdown (one tap)
- Sees: "Copy for Showdown" buttons (My Team actions, Saved team cards, Home champion, Events…) copy the team; toast "Copied — paste
  into Showdown's teambuilder" (+ "Some details weren't published — filled with the most common set"). If the browser blocks copying,
  a dialog "Copy for Showdown" shows the text selected with "Select all" and "Done".
- Code: `56-showdown-copy.js sdBtn/sdResolve/sdCopyText/sdSheetOpen` (`data-sdcopy="mine" | "saved:<id>" | "ev:<id>#<k>" | "tt:" |
  "gaunt:" | "ab:" | "core:" | "opp"`, `data-sdsel`, `data-sdx`).
- Test: tap "Copy for Showdown" on My Team → toast; paste elsewhere → 6 Showdown blocks.

### IO-04 Copy as text (Team Sheet page)
- Sees: "Copy as text" → toast "Team copied as text" (or "Copy failed: use Export on My Team").
- Code: `76-team-sheet.js [data-tscopy]` (`exportPaste`, `copyText`).
- Test: Team Sheet → "Copy as text" → toast.

---

## 6. Share (SHARE)

### SHARE-01 Share box (images)
- Sees: "Share" opens a dialog: title ("Share card" / "Team poster" / "Team Sheet"), × close, a three-way switch "Team Card | Team
  Poster | Team Sheet", a "Light | Dark" style switch, the image, "Save image", "Copy team link", and "On a phone you can also press and
  hold the image to save or share it." Escape / backdrop / Back close it; focus returns. With no team: toast "Add some Pokémon first".
- Code: `44-share-card.js openShareCard/closeShare` (`#shareBox`, `#shareSave`, `#shareLink`, `[data-shareclose]`), kinds
  `66-extras-b.js wxShareDecor` (`data-shkind`, `CH.shareKind`), style `61-concept-h-pages.js` (`data-chshm`, `CH.shareMode`), focus
  `75-arena-team.js`.
- Data: none saved (`CH.shareKind`, `CH.shareMode` in memory).
- Test: tap Share → image shows; tap "Team Poster" → portrait image; tap "Dark" → dark version.

### SHARE-02 Team Card image (1200×675)
- Sees: team name on a slanted tab (shrinks/wraps to fit), "Pokémon Champions, VGC doubles, Reg M-C", archetype plate, the Strength
  Score numeral with "Strength Score: <band word>" and "Matchups: beats or handles X of the top 30", six art tiles with each item, tagline,
  "NastyPlot, unofficial fan tool".
- Code: `75-arena-team.js ARB.card` (replaces `44-share-card.js buildShareCard` drawing), `ARB.facts/posterFacts`, `ARB.score`.
- Test: Share → Team Card shows the same score number as My Team.

### SHARE-03 Team Poster image (1080×1350)
- Sees: "My team, Pokémon Champions, Reg M-C doubles", big name, archetype, six tiles 3×2, score numeral with "Strength Score" and band
  word (or "The grade comes with a full six" for partial teams), tagline, logo line.
- Code: `75-arena-team.js ARB.poster` (`buildTeamPoster`); also from Saved teams ⋯ "Team poster" (SAVED-07).
- Test: Share → Team Poster → numeral equals the score.

### SHARE-04 Team Sheet image (1080×1350)
- Sees: name, "Reg M-C doubles · level 50", key line, 2×3 cards: sprite, name, Item, Ability, Nature with +/−, 4 moves in type colours,
  six stats with points, spread source; logo.
- Code: `76-team-sheet.js buildSheetImage` (also "Share as image" on the Team Sheet page).
- Test: Team Sheet page → "Share as image" → box titled "Team Sheet" with that image.

### SHARE-05 Save image
- Sees: "Save image" saves "<team name> - NastyPlot.png" via the Claude downloads capability ("Saved." / "Not saved." / "Saving is not
  available here. Press and hold the image instead."); outside Claude it downloads directly.
- Code: `44-share-card.js` box click handler (`claude.use('downloads')`).
- Test: in Claude, tap Save image → save prompt → "Saved.".

### SHARE-06 Team link (copy and open)
- Sees: "Copy team link" (share box) copies `<site>#team=<code>` (inside Claude the base is the live artifact URL); toast "Team link
  copied", button flashes "Copied"; if blocked, the link is shown under the image. Opening a link shows a bar "Shared team <name or first
  3 names> · Load it · Not now"; Load replaces the team (Undo) and opens My Team (toast "Loaded "…" (N Pokémon)"); the hash is removed
  either way. The code carries names, changed abilities, moves, items, nature+points, and the saved team name.
- Code: `45-team-links.js teamCode/teamLink/copyTeamLink/decodeTeam/applyShared/checkSharedLink` (`#shareLink`, `[data-copylink]`,
  `#sharedBar`, `data-sharedload`, `data-sharedx`), called from `99-start.js`.
- Data: URL hash `#team=`; writes `S.slots`.
- Test: copy a link, open it in a new tab → bar "Shared team …"; "Load it" → that team with Undo; "Not now" → bar gone, team unchanged.

---

## 7. Your games: log a game (LOG)

### LOG-01 Your games card
- Sees: on a full six: "Your games: this six" and "None logged yet." or "3–1 · 4 games you logged"; button "Log a game" / "Close".
  Hidden for teams of fewer than 6. Kept apart from the tournament record.
- Code: `64-my-record.js myRecCard/renderMyRec/myGames` (`#myRec`, `data-qlopen`).
- Data: reads `S.log` entries whose six match (species, any order).
- Test: full team → card shows "None logged yet."

### LOG-02 Log a game form
- Sees: "Your two leads · optional": six buttons (pick up to 2, toggles); "Their team · optional": chips with × and an "Add their
  Pokémon" search box (up to 6); "Use their N from Battle mode: …" when Battle has an opponent; "Win" / "Loss"; "Have a Showdown replay?
  Paste its log" (→ Battle page replay box). Escape closes; keyboard focus moves to the first lead.
- Code: `64-my-record.js` (`data-qllead`, `#qlOppIn` bound with `bindMonInput`, `data-qloppx`, `data-qlbm`, `data-qlres`,
  `data-qlreplay`), focus `75-arena-team.js`.
- Data: `ui.ql` (memory) until saved; reads `S.opp`.
- Test: tap "Log a game", pick two leads, tap "Use their 2 from Battle mode", tap "Win" → card shows "1–0".

### LOG-03 Save a result and Undo
- Sees: after Win/Loss: "Win logged. Undo"; Undo removes it (toast "Game removed").
- Code: `data-qlres` (pushes to `S.log`, max 400, `persist`), `data-qlundo`.
- Data: writes `S.log`.
- Test: log a Loss then tap Undo → record back to previous.

### LOG-04 Insights after 5 games
- Sees: under 5 games: "Log N more games with this six to see who you lose to most and how your leads do." From 5: "You lose most to X
  (2 losses, 0 wins) …", archetype line ("Trick Room teams: 2 of the 3 losses…"), "Most used leads (…): A + B 3–1 · …", "No losses yet…",
  "No leads logged yet…".
- Code: `64-my-record.js myInsights`.
- Test: log 5 games (with their teams) → a "You lose most to …" line appears.

### LOG-05 Record on Saved teams and Compare
- Sees: Saved team cards show "Your games 1–0 with this six"; Compare has a "Your games with this six" row.
- Code: `30-saved-teams.js` (`myGames`), `63-compare.js cxRows` (`mine`).
- Test: log a game, open Saved teams → that team shows its record.

---

## 8. Team Sheet page (`sheet`)

### SHEET-01 Page head and back link
- Sees: "← My Team" back link, kicker "<team name>: Reg M‑C doubles, level 50", title "Team Sheet".
- Code: `76-team-sheet.js renderSheet`, `CH.head`; back link in body.html (`data-view="report"`).
- Test: open Team Sheet → back link returns to My Team.

### SHEET-02 Actions
- Sees: "Share as image" (opens share box on Team Sheet), "Copy as text" (IO-04), key line "Big number: the stat at level 50, small
  number: stat points (0–32), +/− nature".
- Code: `[data-tsshare]`, `[data-tscopy]`.

### SHEET-03 Six set cards
- Sees: one card per Pokémon (desktop 3×2, iPad 2 columns, phone 1): sprite, name, Item, Ability, 4 moves in type colours ("No move"),
  nature with +/−, spread source ("Most common spread", yours, "your nature on the most common points"), six stats with level-50 value
  and points. Tap or Enter/Space → My Team with that Pokémon's edit panel open.
- Code: `TS.card` (`data-tsedit`), `TS.stats`, `memberSpread`, `calcStat`, `natMul`.
- Test: tap Garchomp's card → My Team opens with "Edit Garchomp".

### SHEET-04 Empty state
- Sees: "No team yet. Add Pokémon on My Team and their full sets show here." and "Open My Team".
- Code: `renderSheet` empty branch.
- Test: clear team, open Team Sheet → this message.

---

## 9. Saved teams (`teams`)

### SAVED-01 Save team / Update saved team
- Sees: "Save team" opens (in the edit panel) "Save this doubles team": name box (max 40, placeholder "Team name, e.g. Rain Archaludon",
  prefilled with the open team's name and selected), "Update "<name>"" (when a saved team is open), "Save as new" (disabled at 10 with
  "You have 10 saved teams. Update an open team or delete one…"), "Cancel". Enter saves (update when available). Toast "Saved "<name>"".
  Empty name → "Untitled team".
- Code: `30-saved-teams.js renderSavePanel`, `34-events.js #saveBtn/#saveOver/#saveNew/#saveCancel`, keydown Enter on `#saveName`.
- Data: writes `S.teams` (`{id,name,slots copy,format,saved}`), `S.loadedId`. Storage full → toast "Storage is full. Delete a saved team."
- Test: new team → Save team → type "Test" → Save as new → toast "Saved "Test"" and the button now reads "Update saved team".

### SAVED-02 Page head, count and where it's stored
- Sees: "← My Team", "In this browser" kicker, "Saved Teams" with count "(3/10)", line "Up to 10 teams. Saved to your Claude account and
  kept in step across your devices." or "…Saved in this browser only: this device isn't connected to your Claude account.".
- Code: `renderSaved` (`#savedCount`, tooltip about older singles teams), `03-persistence.js syncNote` (`#saveWhere`).
- Test: open Saved teams outside Claude → "Saved in this browser only…".

### SAVED-03 Sort
- Sees: "Recent | Name | Readiness".
- Code: `[data-sort]` (34-events.js), `ui.sort` (memory, default recent). "Readiness" sorts by the old readiness %, not Strength Score.
- Test: tap "Name" → alphabetical.

### SAVED-04 Saved team card
- Sees: name, "Open now" tag for the open team, six art tiles (empty slots as blanks), gone note, Strength Score badge (number in band
  colour, word) or "2/6 Pokémon", "4/4 checks", "Your games 1–0 with this six", buttons "Compare", "Open", "Copy for Showdown", "⋯".
- Code: `renderSaved` (`CH.gradeBadge`, `proChecks`, `myGames`), arena tiles `75-arena-team.js ARB.saved`.
- Data: `S.teams`, `S.log`.
- Test: a saved full six shows a number and "N/4 checks".

### SAVED-05 Open a saved team
- Sees: "Open" loads it into My Team and switches there; toast "Opened "<name>"" with Undo.
- Code: `34-events.js d.load` (`fixSlots`, `S.loadedId`).
- Test: Open → My Team heading is the team's name; Undo returns the previous team.

### SAVED-06 Rename / Delete (⋯ menu)
- Sees: ⋯ → "Team poster", "Rename", "Delete". Rename: inline name box + "Save" / "Cancel" (Enter saves). Delete: "Delete <name>?"
  "Delete" / "Keep". Toast "Deleted "<name>"". Deleting the open team un-links My Team (team stays). Menu closes on outside tap, Escape,
  after an action, and when focus leaves it; opens toward the side with room.
- Code: `renderSaved` (`data-rn`, `data-rnok`, `data-rnx`, `data-del`, `data-delok`, `data-delx`), `66-extras-b.js` adds Team poster,
  menus `72-keep-place.js`, `61-concept-h-pages.js`, `75-arena-team.js`.
- Data: writes `S.teams`, `S.loadedId`.
- Test: ⋯ → Rename → type "Rain" → Enter → card renamed. ⋯ → Delete → "Delete" → card gone.

### SAVED-07 Team poster for a saved team
- Sees: ⋯ → "Team poster" opens the share box with that team's poster (file "<name> poster - NastyPlot.png").
- Code: `66-extras-b.js [data-poster]` (`SHARE_KIND`).
- Test: ⋯ → Team poster → poster with that team's name.

### SAVED-08 Compare two saved teams
- Sees: "Click/Tap Compare on two teams to see them side by side." hint; tapping "Compare" marks it "Picked ✓" and shows a bar "Compare:
  <name> is picked. Pick one more saved team, or [Compare with my current team] · Cancel"; the second pick opens Compare.
- Code: `30-saved-teams.js cmpPanel` (`data-cmp`, `data-cmpx`), `cxGo`.
- Data: `ui.cmp` (memory).
- Test: tap Compare on two teams → Compare page with both.

### SAVED-09 Empty state
- Sees: Darkrai, "No saved teams yet. Open My team and tap Save team, or let NastyPlot build six for you.", "Open My team", "Build me a
  team".
- Code: `75-arena-team.js ARB.saved`.
- Test: delete all saved teams → this message.

### SAVED-10 Hidden older singles teams
- Sees: teams saved in the retired singles mode are kept in storage, not shown, but still use a slot (count tooltip says so).
- Code: `renderSaved` (`format==='singles'` filter).

---

## 10. My Box (`box`)

### BOX-01 Page head, count and sync line
- Sees: "← My Team", "The Pokémon you own", "My Box", "36 Pokémon", "Build for me and the suggestions pick from these when set to "My
  box".", sync line (account vs this browser).
- Code: `31-box.js renderBox` (`#boxCount`), `syncNote` (`#boxSync`).

### BOX-02 Add a Pokémon to the box
- Sees: "Add a Pokémon" search box (same combobox; base forms only, not ones already in the box), clear ×; toast "<name> added to your
  box".
- Code: `31-box.js` `bindMonInput($('boxAdd'))`; empty-state button "Add a Pokémon" focuses it (`data-arbfocus`, 75-arena-team).
- Data: writes `S.box` (names in the order added).
- Test: type "Dondozo", Enter → toast; tile appears.

### BOX-03 Box tiles and remove
- Sees: each owned Pokémon as an art tile with its name and an × ("Remove <name>"); toast "Removed X from your box" with Undo ("Box
  restored").
- Code: `renderBox` (`data-unbox`), `34-events.js d.unbox`, `toastBox` (`#toastBoxUndo`, `ui.boxUndo`), `ARB.box`.
- Test: × on Absol → toast with Undo → Undo brings it back.

### BOX-04 Sort
- Sees: "Sort: A–Z | Type | Newest | Oldest | Rating" (remembered).
- Code: `[data-boxsort]` (31-box.js), LS `cc2.boxSort`.
- Test: tap Rating → highest-rated first; reload → still Rating.

### BOX-05 Reset box
- Sees: "Reset box" → first tap "Tap again to reset" (3.5 s), second resets to the default list; toast with Undo.
- Code: `34-events.js #boxReset` (`DEFAULT_BOX`).
- Test: tap twice → box back to default; Undo restores.

### BOX-06 Box links
- Sees: "Copy box link" (toast "Box link copied (36 Pokémon)"; if blocked, shows the link in the field "Copy the link above."); "Open a
  box link" reveals "Paste a box link or code from another device, account or friend", a box, "Add to my box", "Replace my box" and a
  message line ("That doesn't look like a box link…", "N Pokémon in that link aren't in Reg M-C, so they were left out."). Opening a site
  URL with `#box=` opens My Box with the link filled in and a note; nothing changes until Add or Replace (both with Undo).
- Code: `45-team-links.js boxCode/boxLink/decodeBox/applyBox/checkBoxLink` (`#boxLinkCopy #boxLinkOpen #boxLinkAdd #boxLinkReplace
  #boxLinkField #boxLinkMsg`).
- Data: URL hash `#box=`; writes `S.box`.
- Test: Copy box link, Open a box link, paste it, "Add to my box" → toast "Everything in that link is already in your box".

### BOX-07 Empty box
- Sees: Darkrai, "Your box is empty. Add the Pokémon you own, and Build for me and the suggestions pick from them.", "Add a Pokémon".
- Code: `ARB.box`.

---

## 11. Compare (`compare`)

### CMP-01 Open Compare
- Sees: from My Team "Compare with…" (My team as A, pick B), Saved teams (two picks), Events / Winning teams "Compare" (other pages).
  Page: "← My Team", kicker "Compare · two teams side by side", "Compare teams".
- Code: `63-compare.js cxGo/renderCompare` (`data-cxgo`), `CH.pagehead`.
- Test: My Team → "Compare with…" → A shows your team, B says "Pick team B".

### CMP-02 Team headers A and B
- Sees: badge A/B, name, source ("My team, open now", "Saved team", "Champion · <event>", "From a Showdown paste"), six sprites/tiles,
  "Change"; an empty side is a button "Pick team B · My team, saved, winning or pasted". "Swap A and B".
- Code: `cxHead` (`data-cxpick`), `[data-cxswap]`.
- Test: with both picked, "Swap A and B" swaps the columns.

### CMP-03 Team picker
- Sees: "Pick team B" (+ "Cancel"): "My Team" (open team; greyed "Already team A" when on the other side, not tappable), "Saved Teams",
  "Winning teams · event winners, newest first" (6, then "Show 10 more winners"), "Any other tournament team: tap Compare on its card in
  Winning teams.", "Paste a Showdown team" box + "Use this team" (note "No Pokémon found…" or toast with the first import note).
- Code: `cxPicker` (`data-cxset`, `data-cxwmore`, `data-cxpaste`, `#cxPaste`, `data-cxpickx`), disabled same team `75-arena-team.js`.
- Data: `ui.cx` (memory); never changes `S.slots`.
- Test: pick "Rain test" → comparison appears.

### CMP-04 Comparison result
- Sees: "Working out both teams…" spinner, then "What's different" bullet sentences (up to 6, Team A/B highlighted) or "These two line up
  the same on every row below.", rows that differ: Strength Score (number + word + "659 real games"/"Our estimate"), Ready for the top 30
  threats (x/30, handles, shaky/no answer), Top threats only this team handles (sprites, "+1 more"), each team check ✓/✗/? (incl. Speed
  control), Speed (fastest/slowest with outspeed %), Tailwind / Trick Room, Weather / terrain ("(nothing uses it)"), Weak to (2+ more
  than resist), Types nobody resists, Types it hits super effectively, Archetype, Your games with this six; "Why these grades" fold (both
  breakdowns + legend); "Same on both · N rows" fold (remembered for the session); footnote.
- Code: `cxRows/cxInfo` (cached per team + data version), `[data-cxsame]` toggle (`ui.cx.same`).
- Test: compare sample vs "Rain test" → "What's different" lists Tailwind and sun vs rain.

---

## 12. Pokémon info sheet (PKMN)

Opened by any `data-lt="<name>"` (Home tiles, set card "Info sheet ›", ratings, brought-with rows, …). Built by
`25-ratings-page.js lairSheet`, re-dressed by `61-concept-h-pages.js` (hero numbers, data blocks), `67-sheet-tabs.js` (tabs),
`71-manga.js`/`74-arena.js AR.sheet` (hero), `73-desktop-sheet.js` (desktop two columns), `66-extras-a.js` (type theme, S foil).

### PKMN-01 Open / close
- Sees: a bottom sheet (phone) or large two-column panel (desktop ≥1024px, left column fixed, right scrolls). "✕" close, backdrop tap,
  Escape and Back close it; focus returns to what opened it; page links inside close it first. Resizing across 1024px rebuilds it.
- Code: `lairSheet/lairClose` (`#lairSheet`, `data-lclose`, `ui.lsheet`), `DSK.layout`.
- Test: tap a Pokémon on Home → sheet opens; Escape → closed, focus back on that tile.

### PKMN-02 Hero
- Sees: type-coloured band with the sprite and a speed-line burst, rating numeral (e.g. 89) with "A tier, #12 of 321 with results" plate
  and "?" (rating tip), name, slanted type tags, "Mega" / "In your box" / "HIDDEN GEM" marks, three numbers ("14% of teams of 13.8k",
  "51.3% win rate 9,625 games", "80 Speed at level 50"). S tier gets a holographic foil.
- Code: `AR.sheet`, `61-concept-h-pages.js` (`.chlstats`), `rankTxt`, `66-extras-a.js`.
- Test: open Farigiraf → "89", "A tier, #12 of 321 with results".

### PKMN-03 Actions on the sheet
- Sees: "Add to team" (fills the first empty slot; toast "<name> added to your team"; sheet redraws) or "On your team" / "<X> is already
  on your team (one per species)" / "Team full"; "Build around it" (→ Build with this Pokémon as the core pick); "Popular Sets" (→
  Popular sets for it); "Report a mistake" (only for viewers who can save data: opens feedback prefilled with what was on screen).
- Code: `lairSheet` (`data-laddteam`, `data-abaround`, `data-lsets`), `53-feedback.js fbMisBtn` (`data-fbmis`).
- Data: `data-laddteam` writes `S.slots`.
- Test: with 5 Pokémon, open a new one → "Add to team" → toast and the sheet now says "On your team".

### PKMN-04 Tabs Info | Meta | Rating
- Sees: tab bar "Info · stats, types", "Meta · moves, items", "Rating · why, data"; last tab remembered; ArrowLeft/Right/Home/End move
  between tabs; a clear sideways swipe on phones switches tabs; switching keeps the tab bar where it is.
- Code: `67-sheet-tabs.js LST.show` (`data-lstab`), LS `cc2.lstab`.
- Test: open Meta, close, open another Pokémon → it opens on Meta.

### PKMN-05 Info tab
- Sees: "Usually: <item>, <nature>, <points> / <4 moves>" with "Full set ›" (→ Meta tab); Base stats bars (Mega shows +/− vs base form
  and a note); Abilities (most used first, "Most used, 98%", descriptions, notes for Mega/only ability); Type matchups (4× weak, 2× weak,
  Resists ½, ¼, Immune, plus "With <ability> … not counted above" changes); Speed at level 50 rows (What players run, Max points, Max +
  nature, Choice Scarf, In Tailwind, weather ability, Trick Room build) each with "outspeeds N% of the top 30"; "Speed Tiers →".
- Code: `LST.info`, `LST.speeds`, `LST.matchups`, `[data-lstabgo]`.
- Test: Info tab of Farigiraf lists "Armor Tail Most used, 98%" and "Trick Room build 72".

### PKMN-06 Meta tab
- Sees: Typical Set (Ability %, Item(s), Nature(s), Stat points, Moves), "Moves: in-game ranked battles" with %, "Items" with %, "Brought
  with" (partner, %, games; tap = that partner's sheet), note on how % is measured; "No tournament or ladder sets yet…" when there's no
  data.
- Code: `61-concept-h-pages.js` data block (`.chlsdata`), moved by `LST`; desktop grouping `DSK.layout`.
- Test: Meta tab → "Brought with Incineroar 67% 1,144 games"; tap it → Incineroar's sheet.

### PKMN-07 Rating tab
- Sees: "Why it rates 89" with bars (Top-cut presence, Picked by strong players, Converts to top cut, Win rate; each "Top N% of Pokémon"
  + detail) and "?" (bars tip), explanation (with "More"), "Profile: power, typing, tools" fold; fallback text for no results; trap note
  ("Suggestions skip this one…"); "What the data says" rows (Same players test, Team preview from replays, Limitless tournaments,
  Official VGC events, In-game Ranked Doubles, Showdown 1760+, Showdown ladder); "Other tier lists" (external links, open in a new tab);
  "How ratings work →", "Track Record →".
- Code: `lairSheet` (`rating`, `pilotFor`, `bringLead`, `activePerf`), links `npLink`, `data-view="track"`.
- Test: Rating tab → four bars and "What the Data Says".

---

## 13. Cross-cutting behaviour on these pages (X)

### X-01 Saving and syncing the team
- Sees: every change saves at once to this browser and (inside Claude, signed in) to the account ~0.7 s later; each part (slots, box,
  saved teams, open team, Mega goal, Battle opponent, never-suggest list, log…) saves on its own so an older device can't overwrite a newer
  change; another device's change arrives live with toast "Updated from your other device" / "Your box was updated from your other
  device", but waits while you type; Undo history is cleared when another device changes the team. Storage full → "Storage is full.
  Delete a saved team."
- Code: `03-persistence.js persist/flush/takeRemote/syncNote` (`DEV` stamp, `savedHist`).
- Data: LS `cc2.state`; account doc `data/users/<uid>/state` fields `slots, box, teams, loadedId, format, maxMega, megaGoal, opp, boxV,
  excl, megaV, log` (committed code). `leads` and `recentOpp` are in `cc2.state` only in the committed code; the working tree of
  `03-persistence.js` is being changed right now to add them (not by me).
- Test: open the site in two tabs signed in; change the team in one → the other shows "Updated from your other device".

### X-02 First-visit defaults
- Sees: a brand-new visitor gets the sample six "Sun Tailwind (sample)" (also saved as their first saved team, open), the default box
  (36 Pokémon), the welcome card on Home, What's New suppressed.
- Code: `01-state.js` (`DEFAULT_TEAM`, `DEFAULT_BOX`), `46-onboarding.js`, `53-feedback.js`.
- Test: clear storage → My Team shows "Sun Tailwind (sample)" with the sample note; Saved teams lists it as "Open now".

### X-03 Toasts with Undo
- Sees: a bottom toast for each action (2.2 s; 6 s with "Undo"); Darkrai picture on plain confirmations (Saved, Copied, Imported, Opened,
  Deleted, Team cleared…). Undo puts back the team (and open saved team) from just before the change; box toasts restore the box.
- Code: `06-helpers.js toast/keepUndo` (`#toastUndo`, `TOAST_DK`), `31-box.js toastBox`.
- Test: remove a Pokémon → toast "Removed X · Undo" → Undo → "Change undone".

### X-04 Double-tap guard
- Sees: a second tap within 0.45 s after Apply, quick add, remove, load, Add to team, Build around, Clear team is ignored.
- Code: `34-events.js TAP_ACT`.
- Test: double-tap "Apply" → only one change applied (one Undo step).

### X-05 Keep your place
- Sees: redraws after a tap (Apply, quick add, plans finishing) keep the tapped control under the finger and don't jump the page; a new
  page opens at its top; Back returns to the previous scroll position.
- Code: `72-keep-place.js` (`KP`), `31-box.js keepScroll`, `32-views.js setView/VIEW_SCROLL`.
- Test: scroll to Suggestions, Apply → the page doesn't jump to the top.

### X-06 Back button and dialogs
- Sees: each page switch is a browser history step; Back first closes whatever is open on top (edit panel, threat sheet, info sheet,
  search, share box, feedback, menu) and keeps the page's scroll.
- Code: `32-views.js navHist/ovSync/popstate/OVERLAYS`.
- Data: `history.state {npv, ov}` (no URL change).
- Test: open the info sheet, press Back → sheet closes, still on the same page.

### X-07 Remembered folds and views
- Sees: these stay as left on this device: Problems and team checks (`rfix`), Game Plan (`rgplan`), Types (`rtypes`), Open team sheet
  (`sheet2`), How scoring works (`rhow`), More on Home (`more`), Matchups view, Types view, info-sheet tab, box sort, suggest-from pool.
- Code: `CH.fold`, toggle listener in `60-concept-h.js`.
- Data: LS `cc2.chf.<key>`, `cc2.seg.thr`, `cc2.seg.types`, `cc2.lstab`, `cc2.boxSort`, `cc2.pool`, `cc2.tview`, `cc2.view`.
- Test: open "Game Plan", reload My Team → still open.

### X-08 Sliding pickers
- Sees: every 2-3 choice switch (Top rated/Hidden gems, Suggest from, Megas 0/1/2, Swap my Mega, Matchups views, Offense/Defense, Team
  Card/Poster/Sheet, Light/Dark, jump bar) is an iPhone-style slider with an icon per choice; same buttons, pressed state and keyboard.
- Code: `76-slide.js` (`data-slt`, `.ar-slider`).
- Test: tap "Box + catch" → the highlight slides to it and the button reports pressed.

### X-09 Title Case and naming
- Sees: page and section titles in Title Case ("Your Six", "Saved Teams", "How Scoring Works"); team names keep their own casing; "Mega
  Charizard Y" never splits its letter; " · " lists become commas; all-caps tags become sentence case ("Most run", "Your pick").
- Code: `97-title-case.js` (`data-notc` opt-out), `71-manga.js`, `70-riso2.js`, `ARB.nb/AR.nm`.
- Test: a saved team named "rain test" shows exactly "rain test".

### X-10 Light / dark
- Sees: the whole scope in light and dark; share images have their own Light/Dark switch.
- Code: `32-views.js setTheme` (LS `cc2.theme`), sun/moon header button (61/74).

### X-11 Search (Ctrl K / "/")
- Sees: header search lists Pokémon, tools and your saved teams; choosing a saved team opens it (same as Open).
- Code: `50-jump.js` (`data-jumpbtn`, `data-jo`).
- Test: press Ctrl K, type a saved team's name → Enter → it opens on My Team.

### X-12 Text helpers
- Sees: long paragraphs show the first sentence and "More"; a "?" never wraps alone onto a line.
- Code: `70-riso2.js` (long text), `74-arena.js AR.glue`.

### X-13 Entry points out of this scope (keep the links)
- My Team → All suggestions (`coverage`, "See all suggestions ›"), Battle and Popular sets ("Nothing to fix"), Build ("Build me a team"),
  How we calculate ("How the grade works →"), Battle page replay box ("Paste its log"); Home → every tool; info sheet → Build around it,
  Popular sets, Speed tiers, How ratings work, Track record. Note: the Plan settings that live only on All suggestions (Never suggest
  list `S.excl`, "Count abilities" `#useAbil`, "Refresh plans", Pick from select, "Let plans swap my Mega" checkbox) and the Set check
  tips / item fixes (`data-settip`, `data-itfix`) affect My Team's numbers and suggestions but are shown only on All suggestions.

---

## 14. Looks dead, duplicated or broken

Dead or hidden (code that still runs, nothing a player can reach):
1. `#teamHero` / `renderTeamHero` / `data-tjump` (27-team-page.js): drawn into the hidden `build` pane on every render; never seen.
2. "Full sets | Grid" card-view switch (`data-tview`, `.sixhead`, LS `cc2.tview`): in the edit panel markup but not visible; the edit panel
   forces "full" anyway.
3. `#repFold` scouting report fold and `#defense` section are hidden by `chTeamInit`; the threat sheet's "Full report" button
   (`data-chfull`) opens and scrolls to this hidden fold, so it does nothing visible (looks broken).
4. Old spread editor handlers `data-spedit` / `data-spsave` / `data-spclear` (08-render-all.js): nothing renders those attributes now.
5. `#chTeamsMenu` / `#chTeamsBtn` handler (60-concept-h.js): no element with those ids exists.
6. `44-share-card.js buildShareCard` drawing, `70-riso2.js rzSetHtml`, `MG.team`, `MG.home`: replaced by later modules (kept as chain
   wrappers only).
7. Weather backdrop on `.chthead` (66-extras-b.js) and Mega halo on `.chrow` (66-extras-a.js) target the older header/rows, which the
   arena layout covers or no longer draws; unsure whether any of it still shows.
8. `#startCard` ("New team / Where do you want to start?") in the hidden build pane: superseded by the empty My Team state.

Duplicated:
9. Two "Log a game" features: My Team's Your games form (LOG) and Home's "Your battles: Log a game" which goes to the Battle page's own
   Battle log. Both write `S.log`.
10. The Megas 0/1/2 and swap-Mega controls exist on My Team, Build and All suggestions (same setting, by design).
11. The same threat appears twice in the threat sheet (detail block and the worst-5 list) when it's among the worst 5.
12. Compare's empty side shows "Pick team B" twice (header button and picker heading).

Looks broken or inconsistent (seen in the render, Nov 10 data):
13. Mega Charizard Y's nature: set card says "Timid · most run", the editor's dropdown says "Timid (0.0%) ★", while the Team Sheet and the
    "Open team sheet" fold say "Modest · Most common spread". Two sources disagree (`setFor().na` vs `commonSpread`/`memberSpread`), and a
    "0.0%" most-run nature looks wrong.
14. Threat sheet "Best fix: ±0 (93 → 93)" with an "Apply this fix" button: offers a change that doesn't raise the score.
15. Threat sheet ring still shows the old grade letter ("A", "58% wins") instead of the Strength Score number and band word.
16. Sample note's "Build your own" on My Team points to `build`, which is My Team itself: nothing visible happens.
17. Home's empty tiles say "Add a Pokémon to slot N" but only open My Team (not that slot's add panel).
18. Saved teams sort "Readiness" sorts by the old readiness %, not by the Strength Score shown on the cards.
19. Compare still lists "Speed control" as a team check row (it's a note, not counted, since Nov 9); Compare and "Threat preparation" say
    readiness as "81%" where My Team says "21/30".
20. Item-change toast still says "ready for 85% → 87% of the top threats" (old % wording).
21. What's New text is from Oct 28 and mentions "the Feedback button at the bottom of any page", which is hidden for most viewers.
22. "Swap my Mega?" isn't saved (the hidden checkbox resets on reload) while "Megas on team" is saved.

---

## 15. Unsure

1. Whether the All suggestions page (`coverage`) belongs to this group; I only listed its links and the controls that live only there.
2. #13 above: which nature is right for Mega Charizard Y, and whether the "0.0%" is a data or code issue.
3. A 2-Pokémon team scores "82, Tournament ready, so far" (empty slots rated as typical builds). By design per the code comments, but
   it may read oddly to players; not judged here.
4. HOME-04 caption: the hero says "% of teams" but the caption names "Showdown ladder 1630+"; I didn't trace which source `MG.srcLine`
   and `MG.pct` actually use.
5. `S.leads` and `S.recentOpp` account sync: committed code saves them only in browser storage; `app/src/app/03-persistence.js` has
   uncommitted changes adding them (another session). The rebuild should follow whatever lands.
6. "Report a mistake" and "Send feedback" only appear for viewers who can save data; I couldn't see them in the harness (no db write).
7. Exactly which old-layer decorations (weather backdrop, Mega halo, S foil on the info sheet) are still visible under the arena CSS:
   not checked with screenshots.
8. Touch-only behaviour (info-sheet swipe between tabs, phone keyboard focus on the add box) read from code, not tested on a device.
9. Escape on My Team: `chEditClose` and `chScoutClose` both listen for Escape globally; when a name list is open only the list closes
   (by design); not tested with nested overlays (info sheet over the edit panel).

---

## Count

HOME 16 · TEAM 20 · SUG 11 · MU 5 · PLAY 2 · SETS 3 · EDIT 12 · ADD 3 · IO 4 · SHARE 6 · LOG 5 · SHEET 4 · SAVED 10 · BOX 7 · CMP 4 ·
PKMN 7 · X 13 = 132 entries (each covers every control and state listed in it).
