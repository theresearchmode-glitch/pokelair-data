# Feature inventory, group C: Battle

Look-only inventory for the rebuild. Every player-facing feature on the Battle pages, so none is lost.
Made Nov 10, 2026 from the code in `app/src/app/*.js`, `app/src/body.html` and the CSS, plus the built page
(`app/dist/page.html`, built 22:30 Nov 10, newer than every source file) opened in Chromium with the real data in `out/*.json`
and the test team Mega Charizard Y, Garchomp, Incineroar, Whimsicott, Rillaboom, Sneasler (390 and 1440 wide).
Nothing in `app/` was changed.

How to read an entry:
- **Sees / does**: what the player sees and can do, with every state.
- **Code**: file and function, element id or `data-*` attribute. Several "theme" modules add markup after a page draws
  (they wrap the render function with `CH.wrap`), so one feature often has two or three code places.
- **Data**: what it reads and writes. `S` is the saved state (browser `localStorage` key `cc2.state`, and the Claude account
  document `data/users/<uid>/state` through `persist()`); `META.*` are the daily data documents (`meta/<name>`); `LS` keys are
  browser storage. "Memory only" means it is lost on reload.
- **Test**: what a person would do and what they should see. No class names.

Page names as the player sees them: Battle (`matchup`), Damage calc (`calc`), Speed tiers (`speed`), Type chart (`types`),
Test run (`gauntlet`), Team preview practice (`practice`), Track record (`track`). Speed tiers, Damage calc and Type chart share
a three-way switch. Test run, Practice and the three tools show "← Battle" at the top; Track record shows "← Pokémon ratings"
(it belongs to the Meta group in the menu; see TRACK below).

---

## NAV: getting to the Battle pages

**NAV-01 Battle tab in the main navigation**
- Sees / does: "Battle" in the bottom bar (phones) and sidebar (wide screens). The tab stays highlighted on every Battle sub-page
  (Test run, Practice, Speed tiers, Damage calc, Type chart).
- Code: `32-views.js` `GROUPS`, `VIEW_PARENT`, `setView()`; `[data-view="matchup"]`. Alias `battle` → `matchup` (`VIEW_ALIAS`).
- Data: `LS cc2.view` (last page, reopened on load); browser history gets one step per page switch (no URL change).
- Test: tap Battle; the page "Team preview … vs their six" opens and Battle is highlighted. Open Speed tiers from inside it:
  Battle stays highlighted. Reload: the same page opens.

**NAV-02 Menu entries ("⋯" / sidebar), group "Battle"**
- Sees / does: Battle a team, Team preview practice, Test run, Speed tiers, Damage calc, Type chart, each with an icon. Track record
  is in the "Meta" group.
- Code: `32-views.js` `MENU`, icons built in the same file.
- Test: open the menu; the six Battle entries are listed in that order and each opens its page.

**NAV-03 Back link "← Battle" (and "← Pokémon ratings" on Track record)**
- Sees / does: a back button at the top of Test run, Practice, Speed tiers, Damage calc, Type chart.
- Code: `32-views.js` `BACK`, inserted as `button.chback[data-view]`.
- Test: open Damage calc from the menu, tap "← Battle": the Battle page opens.

**NAV-04 Tool switch: Speed tiers · Damage calc · Type chart**
- Sees / does: a three-choice sliding picker (icon over each name; the chosen circle slides) at the top of those three pages.
- Code: `body.html` `.seg.toolsw [data-view]` in each of the three panes; turned into a slider by `76-slide.js` (`SLIDE.scan`).
- Data: remembers the last choice position per group in memory (`SLIDE.mem`) only for the slide animation.
- Test: on Speed tiers tap Damage calc: the calc opens and the circle sits on Damage calc. Works with keyboard (Tab + Enter).

**NAV-05 "More ways to prep" tool cards on Battle**
- Sees / does: four large buttons under the Battle content: Damage calc (Any attacker into any defender), Test run (Your team
  against the latest top teams), Speed tiers (Who moves first across the meta), Type chart (What hits what).
- Code: `61-concept-h-pages.js` "one page per job" block, `#chTools [data-view]`.
- Test: on Battle, scroll to "More ways to prep", tap each card: the right page opens.

**NAV-06 Entry points from other pages that load an opponent into Battle**
- Sees / does: "Practice against" on Winning teams (`data-ttvs`), on Events (`data-evvs`), on Cores (`data-corepractice`);
  "Practice in Battle mode" on Test run (TEST-06); Home tiles and links ("Plan a match", "Battle log ›", "Log a game",
  `data-view="matchup"`); the Home proposal "I have a match soon / Plan the matchup" (`98-proposals.js`); `[data-battle]`
  anywhere opens Battle (`47-battle-mode.js`, no element currently carries it, see DEAD list).
- Code: `18-archetypes.js` (`data-ttvs`), `49-events.js` (`data-evvs`), `48-cores.js` (`data-corepractice`), `28-home.js`,
  `60-concept-h.js` (Home battles summary), `74-arena.js` (Home "Plan a match"), `98-proposals.js`.
- Data: writes `S.opp` (their six) and memory `ui.oppFrom = {who, key}` (who the six belongs to, used for the open team sheet).
- Test: on Winning teams tap "Practice against" on a team: Battle opens with that six as their team and a toast "Opponent set: …".
  The heading says "Their real open team sheet" and names the event and placing.

---

## BATTLE: Battle mode (pane `matchup`)

Order on screen (phone, after all theme layers): page head → their six (with the clear button) → recent opponents → The read →
Plan / Speed / Damage switch → Bring four card, From real games, Watch out, Turn one, Speed card, Damage card → Damage calc card →
Practice against a top team (select) → Team preview practice entry → Deeper read fold → More ways to prep → Battle log fold.
(`71-manga.js` `MG.battle` moves the calc card, the select and the practice entry below the plan.)

**BATTLE-01 Page head "Team preview / <your team name> vs <their archetype>"**
- Sees / does: kicker "Team preview" (or "Their real open team sheet" when their six matches a known tournament team sheet);
  a big slanted headline "<your team's name, e.g. Sun Tailwind> vs <their archetype, e.g. Rain, Psychic Terrain, TailRoom>"
  ("Your team" when you have none; "their six" until 3 of theirs are in). Under it a line "Type their six as you see them at team
  preview" while 1-5 are in (hidden at 0 and 6). When it is a real sheet: "The Champion went 8-1 and finished 1st at <event>
  (758 players)" and the headline becomes "Vs <player>" with the archetype line under it. Long headlines get a smaller size.
- Code: `61-concept-h-pages.js` `CH.wrap('renderBattle')` (builds `.chbmhead`), `chOppName()`; `71-manga.js` `MG.battle`
  ("Vs <player>"); `75-arena-battle.js` `ARBAT.battle`, `ARBAT.head` (size classes). Team name from `teamTitleFor`, archetype
  from `teamArchetype` (18-archetypes).
- Data: reads `S.opp`, `META.events` (team sheets), `ui.oppFrom`.
- Test: empty Battle shows "Team preview · Your team vs their six" (or your team's name). Load Gdańsk champion from the select
  (BATTLE-05): kicker becomes "Their real open team sheet" and the line names the event and placing.

**BATTLE-02 Their six: six Pokémon boxes**
- Sees / does: six search boxes "Their Pokémon 1…6" (placeholder "1"…"6"). Typing opens a suggestion list (sprite, name, types,
  "Box" tag if in your box, share of tournament teams); arrow keys move, Enter or tap picks; a Pokémon already in their six is not
  offered. After a pick the next empty box gets focus. A filled slot shows the Pokémon as a type-coloured art tile with an "×"
  ("Remove <name>"); removing focuses that box again. Each box has a clear "×" while text is typed. Labelled "Their six" above.
- Code: `47-battle-mode.js` `renderBattle()` (`#bmOpp0-5`, `[data-bmx]`), `bindMonInput` (05-combobox.js); `61-concept-h-pages.js`
  `clrWrap` (× in the box); `75-arena-battle.js` `ARBAT.opp` (art tiles); `61-concept-h-pages.js` adds the "Their six" label.
- Data: writes `S.opp` (array of 6 names, saved to account and browser); `persist()` also feeds Recent opponents (BATTLE-04).
- Test: type "Kingam", press Enter: Kingambit appears as a tile and the cursor moves to box 2. Type "Kingam" again in box 2: it is
  not offered. Tap × on Kingambit: the slot is a box again and has focus. Reload: their six is still there.

**BATTLE-03 "Clear their six"**
- Sees / does: button in the page head, only when at least one of theirs is in. Empties all six, no confirm.
- Code: `47-battle-mode.js` `#bmClear`; moved into the head by `61-concept-h-pages.js`.
- Data: writes `S.opp = ['','','','','','']`.
- Test: with 6 in, tap "Clear their six": all six boxes are empty and the plan cards disappear.

**BATTLE-04 Recent opponents**
- Sees / does: "Recent opponents" row under their six: up to 4 one-tap buttons, each showing six tiny sprites (label "Load
  <six names>"). Every full six (all 6 known) typed or loaded is remembered (last 5, newest first); the current six is not shown.
  Tapping loads that six, toast "Recent opponent loaded".
- Code: `74-arena.js` (wraps `persist()` to record; `CH.wrap('renderBattle')` draws `.ar-recent`; `[data-arrecent]` click).
- Data: `S.recentOpp` (array of up to 5 sixes). Saved in browser `cc2.state` only; NOT in the account `snapshot()`/`fromDoc()`
  (see BROKEN list).
- Test: load six A, then clear and type six B. Under their six, a button with A's six sprites appears; tap it: six A is back with a
  toast.

**BATTLE-05 "Practice against a top team" select**
- Sees / does: labelled dropdown "Pick a tournament team…" listing ~90 tournament teams as "<Champion / Challenger, placing>,
  <event>, <archetype>". Picking one loads its six as theirs, toast "Loaded <player>'s team as the opponent". The select goes back
  to "Pick…" once their six no longer matches that team. Hidden when there is no team data.
- Code: `18-archetypes.js` `renderMatchup()` (`#oppTeamSel`, rebuilt when `metaVersion` changes); change handler in `34-events.js`;
  reset in `61-concept-h-pages.js` `CH.wrap('renderBattle')`.
- Data: reads `META.teams`; writes `S.opp`, `ui.oppFrom`.
- Test: pick the first team: their six fill in, toast names the player, head says "Their real open team sheet". Remove one of
  theirs: the select shows "Pick a tournament team…" again.

**BATTLE-06 Copy for Showdown (their open team sheet)**
- Sees / does: "Copy for Showdown" button with "Their open team sheet" under "Their six", only when their six is a known
  tournament team sheet. Copies the full sets (items, abilities, moves) to the clipboard; toast "Copied — paste into Showdown's
  teambuilder"; if the clipboard is blocked a sheet opens with the text selected, "Select all" and "Done".
- Code: `63-practice.js` `CH.wrap('renderBattle')` (`.prcopyopp`), `56-showdown-copy.js` `sdBtn('opp')`, `sdOppSheet`,
  `sdCopyText`, `sdSheetOpen` (`#sdSheet`, `[data-sdsel]`, `[data-sdx]`, Escape closes).
- Data: reads `META.events`, `S.opp`, `ui.oppFrom`; writes clipboard.
- Test: load a team from BATTLE-05, tap "Copy for Showdown", paste in a text editor: six Showdown-format sets.

**BATTLE-07 Empty and partial states**
- Sees / does:
  - fewer than 4 on your team: "Add at least 4 Pokémon on My team first." + "Go to My team" button, with a faint sprite of the
    most-used Pokémon behind (arena empty field);
  - 4+ on your team, none of theirs: "Type their Pokémon as you see them at team preview. Everything below fills in as you go.";
  - 1+ of theirs: the full plan appears (BATTLE-08…17). With 1 of theirs there is no likely lead; "From real games" needs 4+ on both
    sides; turn one needs 2+ of theirs.
- Code: `47-battle-mode.js` `renderBattle()`; `75-arena-battle.js` `ARBAT.battle` (empty field art).
- Test: with 3 Pokémon on your team, Battle shows the first message and "Go to My team" opens My team. With 4 and no opponent, the
  second message. Add Kingambit + Pelipper: the read, the four and turn one appear.

**BATTLE-08 The read**
- Sees / does: headed "The read": a hero band with your lead pair (two sprites, "Your lead <A> + <B>"); strip "Their likely lead
  <A> + <B>"; strip "Biggest threat <name>" with the reason (e.g. "Trick Room") unless the name already says it; a numeral
  "<n> Fake Out on their side". Updates as their six is typed. Shown only with 4+ of yours and 1+ of theirs.
- Code: three versions of `rzReadHtml()`: `70-riso2.js` (also wraps `renderBattle` to insert it after their six),
  `71-manga.js` (manga strip), `75-arena-battle.js` (assigns the live one: hero band + strips). Uses `planMatchup`, `likelyLead`,
  `bmWatch`. `71-manga.js` `MG.battle` also marks likely-lead slots in their six; `75-arena-battle.js` `ARBAT.opp` writes
  "Their likely lead: A + B" under their six when your team has under 4.
- Data: reads `S.opp`, your team.
- Test: with the test team vs Kingambit, Pelipper, Archaludon, Basculegion, Farigiraf, Indeedee (F): "Your lead Mega Charizard Y +
  Rillaboom", "Their likely lead Indeedee (F) + Pelipper", "Biggest threat Farigiraf, Trick Room", "0 Fake Out on their side".

**BATTLE-09 Plan / Speed / Damage switch (phones and tablets up to 760px)**
- Sees / does: a three-choice slider "Plan · Speed · Damage" above the cards; on narrow screens it shows only the chosen group of
  cards (Plan = bring four, real games, watch out, turn one; Speed = Who moves first; Damage = Damage both ways). Choice resets on
  reload.
- Code: `47-battle-mode.js` `[data-bmt]`, `bmUi.tab`, `.bmgrid[data-tab]` + `data-t` on each card; CSS `style.css` (max-width
  760px); slider from `76-slide.js`.
- Data: memory only (`bmUi.tab`).
- Test: at phone width tap "Speed": only the "Who moves first" card shows; tap "Damage": only the damage grid; "Plan": the four,
  real games, watch out and turn one. At 1440 wide see BROKEN-02.

**BATTLE-10 Bring these four. Lead the pair.**
- Sees / does: kicker "NastyPlot's pick: vs this six", headline "Bring these four. Lead the pair."; two groups "Lead" (2 art tiles)
  and "Back" (2 art tiles); "Leave home: <the other two>"; note "Tested on 13,000 ladder games: players who led with this pair won
  more than their rating predicted."; "Only one Mega can Mega Evolve this battle." when two Megas are brought; their likely lead line
  (hidden on this card when The read shows it); a numbered list of the two biggest things to watch (from Watch out).
- Code: `47-battle-mode.js` `renderBattle()` (`bring` card), `planMatchup()` (`17-matchup-threats-teams.js`: head-to-head
  scores, archetype bonuses, learned lead values `META.model.leads` × `LEAD_W=100`, `CTR_W=0`), `likelyLead` (18-archetypes);
  restyled by `61-concept-h-pages.js` (headline, `ol.chreasons`), `75-arena-battle.js` (`ARBAT.groups` Lead/Back headings).
- Data: reads your team (moves, items, abilities), `S.opp`, `META.model.leads`. Also sets memory `bmUi.four` (used by LOG-01).
- Test: with the test team vs the six above: Lead Mega Charizard Y + Rillaboom, Back Incineroar + Whimsicott, "Leave home:
  Garchomp, Sneasler". Put two Megas on your team so both are picked: the one-Mega note appears.

**BATTLE-11 From real games (matchup verdict for this six vs that six)**
- Sees / does: card "From real games · <n> tournament games" with a verdict word: Favored / Slight edge / Even / Slightly behind /
  Behind, with "so far" unless both sides have six; up to 3 lines "Helps you / Hurts you: Your <A> vs their <B>", or "No Pokémon
  pairing here stands out in real results." Needs 4+ on each side and the model data.
- Code: `47-battle-mode.js` (`real` card), `35-win-model.js` `realMatch()`, `ctrVal()` (pair matchups `META.model.ctr`),
  `ONE_GAME_K=.85`, `teamX`, `calibK`.
- Data: reads `META.model.ctr`, `META.model`.
- Test: with the six above the card says "39,052 tournament games / Favored" and lists three pairs. Remove two of theirs (4 left):
  the word ends "so far". Remove one more (3): the card disappears.
- Note: words differ from the approved word list (see BROKEN-03).

**BATTLE-12 Watch out (fold)**
- Sees / does: fold "Watch out · <n> of their six can shut something down" (or "Nothing on their side shuts down your four").
  Open: one row per opposing Pokémon with tagged lines: immunity abilities that blank your moves (Levitate, Flash Fire, Storm Drain,
  Lightning Rod…, naming your attackers), Intimidate (your physical attackers), Fake Out, Follow Me / Rage Powder, Trick Room
  (4 turns, 5 counting the turn it's set), Tailwind (3/4 turns), Prankster, Wide Guard vs your spread movers, Quick Guard vs your
  priority, Spiky Shield / Baneful Bunker / King's Shield vs your contact moves, Armor Tail / Queenly Majesty / Dazzling / Psychic
  Surge vs your priority, weather/terrain setters, "Mega: likely their Mega this game". Tags coloured by severity.
  Open/closed remembered per device.
- Code: `47-battle-mode.js` `bmWatch()`, `BM_IMMUNE`, `BM_WEATHER`; fold by `61-concept-h-pages.js` (`CH.foldNode … 'bmwatch'`).
- Data: `LS cc2.chf.bmwatch` (fold open state).
- Test: with Farigiraf in their six, open Watch out: "Farigiraf: Trick Room …" and "Armor Tail blocks priority and Fake Out from
  Incineroar, Rillaboom". Close, reload, the fold is still closed.

**BATTLE-13 Turn one, in move order**
- Sees / does: card "Turn one, in move order · your <A> + <B> vs their likely <C> + <D>": a numbered list of the four Pokémon in
  real move order (priority bracket, then Speed; Stall last), each "You/Them · <name> <Speed> Speed · +3" with the planned move
  (Fake Out their biggest threat, Tailwind/Trick Room when they are faster, otherwise best KO or most damage; spread moves "(hits
  both)", "also hits your <partner>" warnings, "Protect or switch" when nothing works) and one line why (damage %, KO chance, Sash
  holds). Their side: their hardest hit, or "Fake Out (if they have it)". "Watch: <their move> can KO <yours>. Consider Protect."
  "Field on turn 1: <sun + Psychic Terrain> (<setter>)", Cloud Nine / Air Lock and Trace notes. Doubles only; needs 2+ of theirs.
- Code: `40-turn-one.js` `turnOnePlan()`, `turnOneField` (field from leads), `bestHitOn`, `movePrio`, `allyHit`, `hitNote`
  (39-damage-calc-speed.js); `70-riso2.js` moves it full-width; `75-arena-battle.js` puts sprites on small type fields.
- Data: reads your sets and their usual sets.
- Test: with the six above: 1 "You: Rillaboom 107 Speed, +3 / Fake Out Pelipper", 2 Mega Charizard Y Weather Ball, 3-4 their moves;
  "Watch: Pelipper's Weather Ball can KO Rillaboom. Consider Protect."; "Field on turn 1 sun + Psychic Terrain (Mega Charizard Y)".

**BATTLE-14 Who moves first (speed card)**
- Sees / does: card "Who moves first · fastest first" (or "slowest moves first" under Trick Room): toggle buttons Your Tailwind,
  Their Tailwind, Them −1 (named after your speed-drop move, e.g. "after your Icy Wind"), They're paralyzed, Trick Room (any
  combination); "Weather: <x> (set it under Damage)"; a bar list of your four + their six sorted by Speed with value, "Scarf",
  weather-ability and "→ <n> after item" (Unburden) notes, and a "Tie" tag when one of yours ties one of theirs; a line listing every
  move that skips the Speed order with its bracket ("Fake Out +3 (Incineroar), Trick Room −7 (Farigiraf)…"); assumption note
  ("Their side assumed: most common spreads, natures and items. Ties are a coin flip.").
- Code: `47-battle-mode.js` (`speed` card), `bmSpeed()`, `spdCalc`, `likelySpeed`, `movePrio`; `[data-bms]`, `bmUi.tw/twOpp/icy/par/tr`.
- Data: memory only.
- Test: tap "Trick Room": the list reverses (slowest first) and the subtitle changes. Tap "Their Tailwind": their numbers double.

**BATTLE-15 Damage both ways (grid)**
- Sees / does: card with a weather picker "Leads: <field from the likely leads>" (Auto) / No weather / Sun / Rain / Sand / Snow
  (terrain from the leads always stays), toggles "You're Intimidated" / "They're Intimidated"; a grid, your four as rows and
  their six as columns: each cell shows your best hit on them (% of HP, move name) and their best hit on you, coloured by OHKO /
  2HKO / 3HKO; hover shows exact ranges and KO text. On phones each row of yours becomes a block with "vs <name>" on every cell.
  Legend under it.
- Code: `47-battle-mode.js` (`dmgCard`), `bmHit()` (accuracy, charge turn and recharge weighted), `damage()`, `koShort`;
  `[data-bmw]`, `[data-bmi]`; `75-arena-battle.js` `ARBAT.dmg` (full names, phone blocks).
- Data: memory only (`bmUi.weather`, `bmUi.intMe`, `bmUi.intThem`).
- Test: pick "Rain": Water hits rise, Fire hits fall in the grid. Tap "You're Intimidated": your physical hits drop.

**BATTLE-16 Damage calc card ("Real level-50 doubles damage")**
- Sees / does: "Pick an attacker to hit their <first of their six> (or the most-used <name>)" with a "?" tip ("What the calc
  counts"), your six (or Garchomp when you have none) as buttons → the defender. Tapping one opens Damage calc with that pair.
- Code: `61-concept-h-pages.js` `chCalcCard()`, `[data-dcgo="<atk>|<def>"]` handler (sets `dc.a`, `dc.d`, resets move and field,
  opens `calc`).
- Data: writes memory `dc`.
- Test: tap Garchomp on the card: Damage calc opens with Garchomp attacking their first Pokémon.

**BATTLE-17 Team preview practice entry**
- Sees / does: a button "4/6 · Team preview practice · Pick four and two leads against real ladder teams, then see what strong
  players chose ›" that opens Practice.
- Code: `63-practice.js` `CH.wrap('renderBattle')` (`#prEntry[data-view="practice"]`).
- Test: tap it: Team preview practice opens.

**BATTLE-18 Deeper read (fold)**
- Sees / does: fold "Deeper read · Archetypes, their threats, the full matchup grid". Inside, with 1+ of theirs:
  - "Archetype matchup": You <chips> vs Them <chips>; rows tagged Edge / Watch / Note (speed war, Trick Room vs Tailwind, weather
    and terrain wars, Perish trap…); "Likely lead: A + B (their speed and field setters, then Fake Out)";
  - "Their threats · to your four": up to 4 rows "Watch: <their Pokémon>: <move> hits <yours> super effectively. Answer: … /
    No clean answer in your 4…", or "Clear: None of their Pokémon threatens several of your picks at once.";
  - fold "Full matchup grid": your six × their six with +/- scores, and an explanation line.
  Empty: "Build your team on the Build tab first." / "Add their Pokémon above first."
- Code: `18-archetypes.js` `renderMatchup()` (`#mu`), `archMatchup()`, `archChips`; `17-matchup-threats-teams.js`
  `planMatchup`, `headToHead`; restyled by `61-concept-h-pages.js` (`CH.restyle($('muFold'),'mufold',…)`).
- Data: reads `#useAbil` ("Count abilities" setting on My team) — Battle's own plan always counts abilities (see UNSURE-04).
- Test: open Deeper read with the six above: archetype chips for both sides and at least one Edge/Watch row; open Full matchup
  grid: a 6×6 table of signed numbers.

**BATTLE-19 Hidden old opponent grid**
- Sees / does: nothing (the element is hidden). Six "Their Pokémon" boxes with type chips and ×.
- Code: `18-archetypes.js` `renderOppSlots()` (`#oppSlots[hidden]`, `#opp0-5`, `[data-unopp]`); handlers `34-events.js`.
- See DEAD-01.

**BATTLE-20 Notes, tips and long-text "More"**
- Sees / does: "?" tips that open a short explanation (`tipText`); long paragraphs cut to the first sentence with a "More" button
  (e.g. the damage legend), from `70-riso2.js` `rzTidy`; sentence-case and " · " → ", " text rewriting from `71-manga.js` `MG.caps`.
- Code: `46-onboarding.js` `tipText`/`tip`; `70-riso2.js` `rzTidy`; `71-manga.js` `MG.caps`, `MG.undot`.
- Test: tap "?" next to "Pick an attacker…": a bubble "What the calc counts" opens. Under the damage grid tap "More": the rest of
  the legend shows.

---

## LOG: logging games and your record

**LOG-01 Battle log: pick the four you brought**
- Sees / does: in the Battle log fold (on Battle) your six as toggle chips; tap up to four, in order; each shows "Lead 1/2" or
  "Back 3/4" and a line "Order: lead A + B, back C + D." under the chips. Until you touch it, it is pre-filled with Battle mode's
  four ("Filled in from the plan · tap to change"), else "<n>/4 picked"; "· saved with their <n>" when their six has Pokémon.
  Fewer than 4 on your team: "Add at least 4 Pokémon to your team to log a battle."
- Code: `26-battle-log.js` `renderLog()`, `[data-logpick]`, `ui.logPick`, `ui.logTouched`, `bmUi.four`; `75-arena-battle.js`
  `ARBAT.log` (order line); fold by `61-concept-h-pages.js` (`'bmlog'`).
- Data: memory only until logged. Fold state `LS cc2.chf.bmlog`.
- Test: with their six in, open Battle log: four chips are already on and read Lead 1, Lead 2, Back 3, Back 4 matching "Bring
  these four". Tap one off and another on: the line updates and "3/4"→"4/4 picked".

**LOG-02 Win / Loss buttons**
- Sees / does: "Win" and "Loss", disabled until exactly four are picked. Tapping saves the game (time, result, your four in order,
  your six, their six as typed), clears the pick, toast "Win logged" / "Loss logged". The fold's subtitle shows "<W>–<L> · <n>
  logged · log this game".
- Code: `26-battle-log.js` `[data-logres]`; subtitle `61-concept-h-pages.js` `CH.wrap('renderLog')`.
- Data: writes `S.log` (max 400 entries: `{t, r:'W'|'L', b:[4], tm:[6], o:[their]}`), saved to account and browser. Side effects:
  re-render of the whole app ("verdict"); with 5+ games the log changes Build for Me scoring (`22-auto-build.js` via
  `personalAdj()`) and a hidden `pYou` number (see UNSURE-05).
- Test: pick four, tap Win: toast "Win logged", record "1-0". Reload: still 1-0.

**LOG-03 Your record (stats under the log)**
- Sees / does: "<W>-<L> overall · <pct>%", "<W>-<L> this team · <pct>%" (only games with these exact six), "<n> battles logged";
  bars "Your Pokémon" (top 8 by games), "Lead pairs (2+ games)" (top 4 by win %), "Toughest opponents (3+ games)" (lowest win %);
  fold "Recent battles" (last 15, newest first: W/L, date, the four (or "Result only"), "(leads)" when only two, "vs <first 3
  of theirs>…", × to delete). Empty: "No battles logged yet. Your record by team, Pokémon and lead pair shows up here."
- Code: `26-battle-log.js` `renderLog()` (`#logStats`), `logStats`, `teamRecord`.
- Data: reads `S.log`.
- Test: log 2 wins with the same leads and 1 loss: "2-1 overall · 67%", a "Lead pairs" row appears for that pair.

**LOG-04 Delete a logged game**
- Sees / does: × on a row in "Recent battles" ("Delete this battle"), no confirm, toast "Battle deleted".
- Code: `26-battle-log.js` `[data-logdel]`.
- Data: removes from `S.log`.
- Test: open Recent battles, tap × on the top row: it disappears and the record drops by one.

**LOG-05 Log a game from a Showdown replay**
- Sees / does: fold "Log a game from a Showdown replay": instructions, a text box (placeholder "|player|p1|…"), "Log this game",
  "Choose replay file" (.html/.htm/.txt/.log). It finds your side (the one sharing 4+ species with your current six), your leads and
  up to four you sent in, their six from team preview, and the winner. Result line: "Win logged: <you> vs <them>, you brought …";
  errors: "No battle log found…", "This log has no team preview…", "Neither side matches your current team. Load the team you played
  with first.", "The log has no result yet…". Toast "Win/Loss logged from replay". Nothing is fetched from the internet.
- Code: `41-replay-import.js` `parseReplay`, `addReplay`, `renderReplayBox` (`#replayBox`, `#replayIn`, `#replayAdd`,
  `#replayFile`, `#replayOut` aria-live).
- Data: writes `S.log`.
- Test: paste "hello", tap Log this game: "No battle log found…". Paste a finished replay log of a game with your current six:
  "Win logged: … you brought …" and the record goes up by one. Choose a downloaded replay .html: same result.

**LOG-06 "Your games · this six" card (on My team)**
- Sees / does: on the My team page (only with exactly six): "Your games · this six" with "<W>–<L> · <n> games you logged" or
  "None logged yet."; button "Log a game" / "Close". Open panel: "Your two leads · optional" (tap two of your six; a third replaces
  the oldest), "Their team · optional" (add up to six with a search box; × removes), "Use their <n> from Battle mode: …" link,
  Win / Loss, "Have a Showdown replay? Paste its log" (opens Battle and the replay fold, focuses the text box). After logging: "Win
  logged. Undo". Insights after 5+ games with this six: who you lose to most (with loss/win counts), the archetype you lose to,
  most-used leads with records; below 5: "Log <n> more games with this six to see…".
- Code: `64-my-record.js` `myRecCard`, `renderMyRec`, `myGames`, `myInsights`, `MYREC_MIN=5`; `[data-qlopen]`, `[data-qllead]`,
  `[data-qloppx]`, `[data-qlbm]`, `[data-qlreplay]`, `[data-qlres]`, `[data-qlundo]`, `#qlOppIn`; focus handling in
  `75-arena-team.js`. (Belongs to the My team page, group B; listed here because it writes the same battle log.)
- Data: writes `S.log` (leads only when exactly two picked); memory `ui.ql`.
- Test: on My team with six, tap Log a game, tap two leads, tap Loss: "Loss logged. Undo" shows and the card reads 0–1. Tap Undo:
  back to "None logged yet."

**LOG-07 The log shown elsewhere (cross-reference)**
- Home: "Your battles" record "<W>–<L> · <pct>% wins · <n> logged" with the last 10 as W/L dots and "Battle log ›", or "Log your
  games… / Log a game" (`60-concept-h.js` Home, `28-home.js`).
- My team scouting report uses `teamRecord` (`08-render-all.js`); Saved teams and Compare teams show a record (`30-saved-teams.js`,
  `63-compare.js` `myGames`).
- Test: after logging a win, Home shows "1–0".

---

## CALC: Damage calc (pane `calc`)

**CALC-01 Page head and method link**
- Sees / does: "Common sets, auto-filled / Damage calc"; line "Level 50 doubles damage. Each side starts with its most common set."
  with "How the calc works →" (opens How we calculate at the calc section).
- Code: `body.html` `#dmgcalc`; `61-concept-h-pages.js` `CH.pagehead`; `[data-view="method"][data-msec="calc"]`.
- Test: tap "How the calc works →": How we calculate opens at the damage section.

**CALC-02 Attacker / defender pickers and defaults**
- Sees / does: two cards "Attacker" and "Defender" on type-coloured fields facing each other across a slanted "vs", each with sprite,
  name and "<nature>, <ability>", tag "assumed spread" / "estimated spread" (hover explains) until you change points or nature. Each
  has a "Pokémon" dropdown grouped "Your team" / "Top of the meta" / "Everyone" (all ~345). Defaults: attacker = your first Pokémon
  (else Garchomp); defender = the top threat that isn't the attacker (else Incineroar). Your own Pokémon use your item, ability and
  spread.
- Code: `39-damage-calc-speed.js` `renderCalc()`, `#dcA`, `#dcD`, `monOptions`, `dcSide`, `sideDefaults`, `dcSrc`;
  `61-concept-h-pages.js` (cards `.chdcband`); `75-arena-battle.js` `ARBAT.calc` (fields, vs rule).
- Data: memory `dc` (attacker, defender, move, field, per-Pokémon edits `dc.inv`). Lost on reload.
- Test: open Damage calc with the test team: attacker Mega Charizard Y, defender Sneasler. Pick Incineroar as defender: its card,
  sprite and result change.

**CALC-03 Move picker**
- Sees / does: the attacker's set as move strips (coloured by type; the chosen one pressed), plus a dropdown "Other moves" with every
  damaging move it learns ("Its set" / "Other moves" groups). Default: first damaging move of its set that isn't Fake Out.
- Code: `39-damage-calc-speed.js` `#dcMv`, `dcMoves`; `75-arena-battle.js` strips `[data-ardcmv]` (they set the select and fire its
  change).
- Test: tap "Solar Beam" strip: the result changes and the strip is pressed. Pick a move from Other moves: result updates.

**CALC-04 Set details (fold, per side)**
- Sees / does: fold "Set details · Points, nature, item, ability, stat stage" on each card. Attacker: Attack points / Sp. Atk points /
  Defense points (Body Press) (32 max, 28…0), Nature (21), Item (None, Life Orb, Choice Scarf, Expert Belt, Focus Sash, Sitrus Berry,
  Leftovers, type items, resist berries; a Mega shows its stone, locked), Ability, Stat stage −2…+2 ("Intimidate = −1"; Defense
  stage for Body Press); "Allies fainted 0-3" only for Supreme Overlord / Last Respects. Defender: HP / Def / Sp. Def points,
  Nature, Item, Ability, Stat stage. Defender points are kept legal: a change past 66 total takes the excess from the other two.
  Fold open state remembered per device.
- Code: `39-damage-calc-speed.js` `#dcASp #dcANat #dcAIt #dcAAb #dcABo #dcAFt #dcDHp #dcDNat #dcDDf #dcDSd #dcDIt #dcDAb #dcDBo`,
  change handler (66 cap), `CALC_ITEMS`, `NATURES`; fold `61-concept-h-pages.js` (`'dcset0'`, `'dcset1'`).
- Data: memory `dc.inv`; `LS cc2.chf.dcset0/1`.
- Test: defender HP 32, Def 32, then Sp. Def 32: Def drops to 2 (32+2+32 = 66). Set attacker nature to Timid: "assumed spread" tag
  disappears.

**CALC-05 Swap**
- Sees / does: "⇄ Swap" in the "vs" between the cards: attacker and defender trade places; the move resets to the new attacker's
  default.
- Code: `#dcSwap`.
- Test: tap Swap: the defender becomes the attacker and its own moves show.

**CALC-06 Field: weather, terrain, conditions**
- Sees / does: Weather (No weather, Sun, Rain, Sand, Snow), Terrain (No terrain, Grassy, Electric, Psychic, Misty), and toggles Hits
  both foes (defaults to the move's own spread), Screen up, Helping Hand, Friend Guard, Critical hit. Weather and terrain follow the
  attacker's own setter, then the defender's, then your team's, until you pick one ("field set by the Pokémon selected" note). The
  tapped button stays under your finger when the page redraws.
- Code: `[data-dcw]`, `[data-dcterr]`, `[data-dct]`, `dc.wSet/tSet`, `dcPin` (keeps position).
- Data: memory.
- Test: Mega Charizard Y attacking: Sun is pressed by itself. Tap Rain: Fire damage halves. Pick another attacker: weather follows it
  again.

**CALC-07 Result**
- Sees / does: big "<min>–<max>% of HP", a two-part HP bar, "<KO text, e.g. Guaranteed 2HKO / 20% chance to 2HKO> · <min>–<max> of
  <HP> HP · <n> hits · <type> is super effective / resisted"; notes (accuracy, charge turn, recharge, weight-based power, conditional
  power doubling, Dragon Darts, Disguise, turn order, contact, recoil, crit chance…), "Not counted: …"; "Fewest points to always
  survive: <HP> HP / <Def> Def (<total>). This spread already survives / does not." or "<name> can't survive this hit with any spread";
  set readout on two lines with a "?" ("What this calc assumes"). Special results: "No effect. <reason / is immune to X>", "Pick a
  damaging move.", explanations for counter moves, Endeavor, Spit Up, other variable moves, status moves. Focus Band and Sash in KO
  text.
- Code: `39-damage-calc-speed.js` `damage()`, `koText`, `koShort`, `bulkToSurvive`, `calcNotes`, `notCounted`, `moveAcc`,
  `chargesFirst`; `75-arena-battle.js` (result sheet, big numeral).
- Data: memory `dc.lastCtx` (text sent with Report a mistake).
- Test: Sneasler Close Combat into Mega Charizard Y: "45–52% of HP, 20% chance to 2HKO … Fighting is resisted". Garchomp Earthquake
  into Corviknight: "No effect."

**CALC-08 Report a mistake**
- Sees / does: "Report a mistake" under the result (hidden when feedback is unavailable); sends the shown attacker, defender, move,
  field and numbers.
- Code: `53-feedback.js` `fbMisBtn('calc')`, `[data-fbmis]`; context from `dc.lastCtx`.
- Data: anonymous feedback (feedback system; group with Feedback inventory).
- Test: where feedback is enabled, tap it: the feedback sheet opens pre-filled with the calc.

**CALC-09 Best hits table: your hits on them / their hits on you**
- Sees / does: fold "Your best hit on each top threat" (title changes with the direction) with a two-choice slider "Your hits on
  them" / "Their hits on you": a table of your six × the top 12 threats with max-roll % and move per cell, coloured OHKO (green) /
  2HKO (gold), "*" when the move has a catch (accuracy, charge); hover gives the range and KO text; each attacker's own weather or
  terrain counts. On phones each cell carries its column's sprite. Fold state remembered.
- Code: `39-damage-calc-speed.js` `renderHitTable()`, `[data-dcdir]`, `bestHitOn`; fold `61-concept-h-pages.js` (`'dctable'`);
  `62-polish.js` (phone tiles).
- Data: memory `dc.dir`; `LS cc2.chf.dctable`.
- Test: open the fold; tap "Their hits on you": rows become threats and columns your six; the heading reads "Each top threat's best
  hit on your team".

**CALC-10 Pinned mini-result ("dcStick")**
- Sees / does: on a "No effect" result only, a small bar "<attacker> → <defender> No effect · <move>" can show at the top while the
  full result is off screen; tapping scrolls to the result. The normal pinned result was switched off Nov 7.
- Code: `39-damage-calc-speed.js` `stick` (`false&&…` for normal results), `dcStickWatch`, `#dcStick` click. See DEAD-04.

---

## SPEED: Speed tiers (pane `speed`)

**SPEED-01 Page head**
- Sees / does: "Speed tiers: level 50 / Who moves first." and "Your six against the 20 most-used Pokémon, fastest first."
- Code: `body.html` `#speedtiers`; `61-concept-h-pages.js` `CH.pagehead`.

**SPEED-02 Conditions toggles**
- Sees / does: Your Tailwind, Their Tailwind, Their −1 Speed, They're paralyzed, Trick Room (any combination). Under Trick Room the
  order flips and "outspeeds" reads "moves before".
- Code: `39-damage-calc-speed.js` `[data-spd]`, `spdUi`.
- Data: memory only.
- Test: tap Trick Room: the slowest Pokémon is first; the note under the list says "Trick Room: the slowest moves first."

**SPEED-03 Weather picker**
- Sees / does: "Your weather (<sun> / none)" (Auto, the weather your team sets if exactly one), No weather, Sun, Rain, Sand, Snow.
  Swift Swim / Chlorophyll / Sand Rush / Slush Rush double in their weather.
- Code: `[data-spdwx]`, `spdUi.wx`, `sideField`.
- Test: with Venusaur in the list, pick Sun: Venusaur's Speed doubles and its line says "Chlorophyll ×2 in sun".

**SPEED-04 Your six vs the field (fold)**
- Sees / does: fold "Your six vs the field · How many of the top 30 threats each of your <n> outspeeds": one line per Pokémon of yours
  "<name> outspeeds <pct>% of the top 30 threats (<conditions>)"; with no toggles on, a tip "<n> more Speed points (<total>
  total) outspeeds <next threat>" or "can't outspeed <next> with this nature".
- Code: `39-damage-calc-speed.js` `renderSpeed()` (`.spdsums`), `outspeedOf`, `topThreatSpeeds` (THR.threatList(30)); fold
  `61-concept-h-pages.js` (`'spdsum'`).
- Data: `LS cc2.chf.spdsum`.
- Test: open the fold: six lines with percentages; turn on Their Tailwind: percentages fall and "(their Tailwind)" is added.

**SPEED-05 Race track / List view**
- Sees / does: two-choice slider "Race track" / "List view" (remembered per device). Race track: your six in blue lanes on top, the
  20 top threats in lanes below, placed left (fastest) to right on a Speed axis with ticks; markers never overlap; long gaps shortened;
  scrolls sideways when wider than the screen ("Swipe the track for the rest →" on touch, "Scroll the track…" with a mouse); each
  marker is a button with sprite, name, Speed and a full description (hover/screen reader); tapping opens that Pokémon's info sheet.
  Redraws on window resize. List view: one row per Pokémon: Speed, sprite, name, "YOU" / "TIE" tags, how the number was worked
  out ("<n> Speed points, <nature> (your spread / most common spread / estimated)", Choice Scarf, weather ability, Unburden, Stall,
  Quick Draw, Quick Feet, Iron Ball, Quick Claw notes, base Speed).
- Code: `65-design-c.js` `spdTrackHtml`, `NPR`, `[data-sprv]`, resize handler; `75-arena-battle.js` (wider lanes on desktop, 15px
  names); `39-damage-calc-speed.js` `.spdlist` rows, `spdAbNote`, `likelySpeed`; `[data-lt]` opens the sheet (ratings code).
- Data: `LS cc2.sprv` ('track' | 'list').
- Test: tap List view, reload: the list is still shown. On the track tap Garchomp: its info sheet opens. Narrow the window: the
  track redraws and scrolls sideways.

**SPEED-06 Empty state and footnote**
- Sees / does: no team: toggles still show, then "Add Pokémon on My team to place them against the top threats." + "Go to My team".
  Footnote "Level 50, 31 IVs. Theirs assumed: common sets ?" (tip "How speeds are worked out").
- Code: `renderSpeed()`; `tipText('spdhow')`.
- Test: clear your team, open Speed tiers: the message and button show.

---

## TYPES: Type chart (pane `types`)

**TYPES-01 Pick one or two types**
- Sees / does: 18 type buttons (arena type colours). Tap toggles; picking a third replaces the older one (keeps the last two).
  "Clear" (top right) empties the pick. Opens on something useful: your first team member's types (or the most-used Pokémon's when
  your team is empty) until you press Clear.
- Code: `20-types.js` `renderTypes()`; `34-events.js` `[data-type]`, `#typesClear`; `75-arena-battle.js` `ARBAT.types` (colours).
- Data: memory `ui.typesSel`, `ui.typesCleared`, `ui.typesAuto`.
- Test: Clear, tap Water, Fire, Grass: Fire and Grass stay pressed. Clear: "Pick one or two types above, or look up a Pokémon."

**TYPES-02 Look up a Pokémon**
- Sees / does: search box "Or look up a Pokémon" with suggestions; picking sets its types and shows "Showing <name> · ability <x>
  (from your team)" with its own "Clear". Abilities change the defence lines (e.g. Levitate, "<ability> changes Ground from 2× to
  0×").
- Code: `31-box.js` binds `#typeMonIn`; `#typeMon`, `[data-typesmonx]`; `mult(…, ab, true)`.
- Test: look up Heat Rotom (Levitate): "Showing Heat Rotom · ability Levitate", Ground is under Immune and a line says
  "Levitate changes Ground from …× to 0×".

**TYPES-03 Your team quick picks**
- Sees / does: "Your team" row of your Pokémon as small art buttons; tapping shows that Pokémon (the current one highlighted).
- Code: `#typeQuick`, `[data-typesmon]`; `75-arena-battle.js` art.
- Test: tap Garchomp: "Showing Garchomp, ability Rough Skin (from your team)".

**TYPES-04 Result: taking hits and attacking**
- Sees / does: "Taking hits as <types>": 4× weak, 2× weak, ½ resist, ¼ resist, Immune (type chips, "None"), "Everything not listed
  hits it for normal damage."; "Attacking with its own types (STAB)": per type "2× on", "½× on", "No effect".
- Code: `20-types.js` `renderTypes()` (`#typesOut`).
- Test: Fire/Flying shows Rock under 4× weak and Ground under Immune.

**TYPES-05 Full type chart (fold)**
- Sees / does: fold "Full type chart · Every attacking type against every defending type". Wide screens: 18×18 grid (2, ½, 0,
  blank) with "Rows attack, columns defend" note. Phones: "Attacking type" picker (18 buttons, default Fire) and three groups
  Super effective (2×) / Not very effective (½×) / No effect (0×).
- Code: `20-types.js` `renderTypeChart()` (`#typeChart`, drawn once), `renderTypeRow()` (`#typeRow`, `[data-tcatk]`, `ui.tcAtk`);
  fold `61-concept-h-pages.js` (`CH.restyle … 'typechart'`).
- Data: memory `ui.tcAtk`; fold state likely `LS cc2.chf.typechart` (UNSURE-07).
- Test: on a phone open the fold, tap Ghost: Ghost and Psychic under 2×, Dark under ½×, Normal under No effect.

---

## TEST: Test run (pane `gauntlet`)

**TEST-01 Page head and intro**
- Sees / does: "The latest top tournament teams / Take a test run."; fold "How it works · Same calcs as your scouting report, both
  ways" with the explanation (red "!" marks a Pokémon you have no answer to; preparation, not a forecast).
- Code: `38-gauntlet.js` `renderGauntlet()`; `61-concept-h-pages.js` `CH.pagehead`, fold `'gintro'`.

**TEST-02 Empty states**
- Sees / does: under 4 Pokémon: "Add at least 4 Pokémon on My team to run the gauntlet. You have <n>." + "Go to My team"; no team
  data: "Top tournament teams load with the daily data. Check back after the next refresh."
- Test: with 3 on the team: the message says "You have 3."

**TEST-03 Summary counts**
- Sees / does: three numbers "<n> you're better prepared", "<n> about even", "<n> they're better prepared" (difference of 2+ in
  how many each side is ready for).
- Code: `.gsum`; `gauntletPrep()` (threat engine `THR.vsThreat` both ways).

**TEST-04 One card per top team (20), least prepared first**
- Sees / does: tag "You: ready for <n> of their 6" (coloured), the player/placing ("Challenger, 2nd place"), "Them: ready for <n> of
  your <n>", event name; their six as small art with a red "!" on ones you have no answer to (hover: verdict and evidence);
  "Bring A + B up front, C + D in back. Watch <names>." Data from `META.teams` (top 20), else proven team lists from results.
- Code: `38-gauntlet.js` `gauntletTeams`, `gauntletScore`, `planMatchup`, cache `gauntCache` (key includes your sets, Mega goal,
  `#useAbil`); `75-arena-battle.js` `ARBAT.gauntlet` (art).
- Test: with 4+ on your team, the first card has the lowest "You: ready for"; a Pokémon you can't answer carries "!".

**TEST-05 Matchup prep (fold per card)**
- Sees / does: "You against their six" and "Their six against yours": one cell per Pokémon with its level (No answer / Shaky /
  Handles it / Beats it) and the calc evidence.
- Code: `details.gprep`; restyled `75-arena-battle.js`.
- Test: open Matchup prep on a card: 6 + your-count cells with level words.

**TEST-06 Practice in Battle mode**
- Sees / does: button on each card; loads that team as their six and opens Battle, toast "Loaded as your opponent".
- Code: `[data-gaunt]` handler in `38-gauntlet.js`.
- Data: writes `S.opp`, `ui.oppFrom`.
- Test: tap it on any card: Battle opens with that six and their sheet named in the head.

**TEST-07 Copy for Showdown (each team)**
- Code: `sdBtn('gaunt:<ix>')`, `56-showdown-copy.js` (full sheet when the event has it, else popular sets with a note).
- Test: tap it: toast "Copied…".

**TEST-08 Show more teams**
- Sees / does: first 3 cards shown; "<n> more teams · Showing 3 of 20" opens the rest; "Show fewer" folds them back.
- Code: `61-concept-h-pages.js` `CH.more(…, 3, 'gaunt', 'teams')`, `[data-chmore="gaunt"]`, `ui.chMore`.
- Data: memory.
- Test: tap "17 more teams": 20 cards; tap "Show fewer": 3.

**TEST-09 Footnote**
- Sees / does: "Real damage calcs, least prepared matchups first ?" (tip "How each verdict is worked out").

---

## PRAC: Team preview practice (pane `practice`)

**PRAC-01 Start screen**
- Sees / does: head "Battle · team preview practice / Pick your four."; "Pick four and two leads against a real ladder team ?";
  two-choice radio buttons: "Use my team · <team name> against real teams" (with your six as mini sprites; disabled with "Add six
  Pokémon on My team to use it (you have <n>)" unless exactly six) and "Practice with a real team · A strong player's six from the same
  game: compare your pick with theirs"; your score if you have played; "Start ➜"; "Go to My team" when you can't use your team;
  footnote "From the Showdown ladder (<dates>) ?". No data: "Practice games appear after the next data refresh."
- Code: `63-practice.js` `renderPractice()`, `[data-prmode]`, `[data-prgo]`, `cleanPractice` (meta/practice).
- Data: reads `META.practice`.
- Test: with 6 on your team "Use my team" is selected by default; with 4 it is disabled and "Practice with a real team" is selected.

**PRAC-02 Pick four, then two leads**
- Sees / does: "Their six · as seen at team preview" (six art tiles); who line ("Ladder player rated <r> · your side was played by
  someone rated <r>" or "Strong players faced this team … in <n> games"); steps "1 · Bring four <n>/4" and "2 · Lead two <n>/2";
  hint line (aria-live); your six as tappable art tiles: first four taps bring (tap again to unbring), then taps on brought ones mark
  leads (a third lead replaces the oldest); tapping a fifth: toast "Four are picked. Tap "Start the pick again" to change them."; a
  line "Bringing A, B, C, D. Leading A + B."; "Start the pick again"; "Reveal what strong players chose" (disabled until 4 + 2);
  "Skip this team"; "Change six". Recently shown teams are avoided (last 25/40).
- Code: `[data-prpick]`, `[data-prreset]`, `[data-prrev]`, `[data-prskip]`, `[data-prhome]`, `prStart`, `prPickRandom`;
  `75-arena-battle.js` `ARBAT.practice` (art, numerals, Bringing line).
- Data: memory `pr`.
- Test: tap four: "Now tap two of your four to lead." Tap two of them: Reveal becomes enabled.

**PRAC-03 Reveal**
- Sees / does: banner "You matched the strong players' four!" / "A different four from the strong players" with "Same two leads
  too" etc., streak text and "<m> of <n> matched so far" (or "No score this round" when fewer than 4 of yours have 5+ games against
  that team); "Your pick" (Lead/Back groups); in real-team mode "What this player chose · rated <r>" with their four, "They won/lost
  this game. Their opponent led … and also brought …", and "Players with a similar six against a similar team: <n> games. The most
  common four was brought in <k>…" with that four (and "only <n> similar games — treat as a hint" when under 10); in my-team mode
  "Strong players' four"; "Each of your six against this team": bar per Pokémon "Brought in <x>% of games · led in <y>% · <n>
  games" or "No games with it against this team", tags "YOU LED / YOU BROUGHT"; "Next team ➜", "Change six". Bars animate in.
- Code: `prReveal`, `prTarget`, `[data-prnext]`.
- Data: writes `LS np.practice` `{streak, best, played, matched}` (browser only, per device).
- Test: finish a pick and tap Reveal: the banner and both fours show; `played` goes up by one; Next team shows a new six.

**PRAC-04 Score**
- Sees / does: "<streak> in a row · <best> best · <m> of <n> matched" at the top once you have played.
- Data: `LS np.practice`.
- Test: play one round, go back to the start: the score line shows "of 1 matched".

---

## TRACK: Track record (pane `track`)

Note: the brief described `track` as "your logged games / track record". In the code it is the **ratings** track record (how
right NastyPlot's Pokémon ratings were at later events). The player's own logged games are LOG-01…07.

**TRACK-01 Head, stats and how-it-works**
- Sees / does: "Ratings · checked against later events / Track record / How right have our ratings been?"; "← Pokémon ratings";
  stats "<date> tracking since · <n> days of ratings saved · <n> events checked so far"; three steps "1 Ratings saved each morning /
  2 An event is played / 3 Its top 8 compared" and "A fair test: the ratings never saw these events ?".
- Code: `64-track.js` `renderTrack()`, `cleanTrack` (meta/track).
- Data: reads `META.track`.

**TRACK-02 Top-8 teams by rating band**
- Sees / does: "Top-8 teams, by the rating we gave": four bars Rated 90+ / 80–89 / 70–79 / Under 70 (cut points shown on the shown
  scale) with "<m> of <n> Pokémon made a top 8" and the average share of top-8 teams; "Early: only <n> events so far ?" under 10
  events; verdict line after 10 events "Pokémon we rated 90+ were on top-8 teams <x>× as often as … under 70."
- Code: `trBars`, `trRates`, `TR_MIN`.

**TRACK-03 Biggest hits / Biggest misses**
- Sees / does: two cards with up to 3 Pokémon each (sprite, name, "Rated <n> · on <n> top-8 teams in <n> events · won …", rating
  pill); misses also list highly rated Pokémon with no top 8 after 5 events; "Tap a Pokémon for its sheet."
- Code: `trMonRow`, `[data-lt]` (opens the Pokémon info sheet).
- Test: tap Sneasler in Biggest hits: its info sheet opens.

**TRACK-04 Week by week chart**
- Sees / does: line chart, one line per band, after 3 weeks of events; before that "From about <date> · A line for each rating band,
  once there are 3 weeks of events."
- Code: `trLines` (inline SVG).

**TRACK-05 Games check**
- Sees / does: "In <n> tournament games played after a saved rating at least 14 days old, the side whose six had the higher total
  rating won <x>%…" or "From about <date> · Needs ratings saved 14+ days earlier and 300+ games played since."
- Code: `T.fw`.

**TRACK-06 Coming as the data grows, Events checked, link**
- Sees / does: list of what appears later; fold "Events checked · <n> events, newest first" (up to 60: name, date, players,
  official, ratings date); "How ratings work →" link to How we calculate.
- Code: `CH.fold('trevents', …)`, `npLink('rating')`.
- Data: `LS cc2.chf.trevents`.

**TRACK-07 Empty states**
- Sees / does: no data: "Collecting · The first results appear here after the next morning's data refresh."; data but no event yet:
  "No event has been played after the first saved ratings yet…".

---

## MATCHUPS: threat lists with the approved level words (mostly on My team)

These show "Beats it / Handles it / Shaky / No answer" (damage-calc level, `CH.LV`, `THR_LV`) and "Favoured / Even match /
Unfavoured" (real games, `CH.realVs`). They live on the My team page (group B) and in Test run; listed here because the brief puts the
matchup threat lists in group C. Group B should cross-reference these IDs.

**MATCHUPS-01 Top 10 threats list (My team › Matchups)**
- Sees / does: "Verdicts from real tournament games: how teams with your Pokémon did against teams with each threat. Calc readings
  are underneath." Then the 10 most-common threats (rank, sprite, name, real-games word Favoured / Even match / Unfavoured with
  "Calc: <level>"; or only the calc level when there is no real-games data). Phones/tablets show 5 with "Show 5 more" / "Show top 5
  only". Then "The next 20, worst first" as small tiles (hover "<name>: Unfavoured, calc Shaky"). Tapping any threat opens the
  scouting sheet on it (MATCHUPS-03).
- Code: `60-concept-h.js` `CH.threats10`, `CH.realVs` (±1.5 points cut), `[data-tlmore]` (`ui.tlMore`), `[data-chthr]`,
  `#chThrTop`.
- Data: reads `prepOf(team)` (threat engine `55-threats.js`), `META.model.ctr`.
- Test: on My team with six, the list shows 10 threats with a word each; tap "Show 5 more" on a phone: 10 rows.

**MATCHUPS-02 Legend counts**
- Sees / does: "Unfavoured <n> · Even match <n> · Favoured <n>" and "Damage calc: No answer <n> · Shaky <n> · Handles it <n> · Beats
  it <n>" (only the calc row when there is no real-games data).
- Code: `CH.legendRow`.

**MATCHUPS-03 Scouting report sheet (one threat at a time)**
- Sees / does: bottom sheet "Scouting report · top 30 threats / <n> threats need a plan." (or "Ready for every top threat."), a small
  Strength Score ring, summary line and legend, all 30 threats as tiles (tap to select; selected shows its evidence and how each of
  your six does vs it with ✗ ~ ✓ ✓✓ dots), the worst 5 with evidence, "Team checks · <p>/<n>" with ✓/✗, "Best fix · <grade move>"
  with "Apply this fix ➜", "Full report", "Close", ×, Escape, tap outside. Back button closes it.
- Code: `60-concept-h.js` `chScoutOpen/Close/Render` (`#chScout`, `#chScrim`), `[data-chscout]`, `[data-chclose]`,
  `[data-chfull]`, `[data-plan]`; `32-views.js` overlays.
- Test: tap a threat in MATCHUPS-01: the sheet opens with that threat selected; Escape closes it.

**MATCHUPS-04 Your six vs the top 12 chart**
- Sees / does: table rows = top 12 threats (worst first), columns = your six, each cell a symbol for the level; legend; "Tap one for
  the full matchup." Tapping a row opens My team and the scouting sheet on it.
- Code: `61-concept-h-pages.js` `CH.chart`, `[data-chhthr]` (`60-concept-h.js`), `#chVsOut`.

**MATCHUPS-05 Threat preparation card (scouting report)**
- Sees / does: "Threat preparation · Ready for <x>% of the top 30 threats", "<n> with no answer"; groups No answer / Shaky (open) and
  Handles it / Beats it (closed), each threat a fold with what answers it (✓ solid, ~ soft, ✗ warnings, "It beats … 1-on-1"), field
  and its usual set. Opened rows remembered in memory.
- Code: `08-render-all.js` `renderThreatCard`, `THR_LV`, `ui.thrOpen`, `#thrCard`.

**MATCHUPS-06 Old "meta threats" list**
- Sees / does: up to 8 (4 on phones, "Show all <n>") top-20 meta Pokémon that hit several of yours: hits, answers, hardest hit;
  pill uses the scouting level words when available, else "Dangerous / Manageable / No answer".
- Code: `18-archetypes.js` `renderThreats()` (`#threats`, `#threatsAllBtn`), drawn lazily.
- See UNSURE-06 (whether it is still visible anywhere).

**MATCHUPS-07 Test run levels** — see TEST-05 (same level words).

---

## Cross-cutting behaviour in the Battle pages

- **X-01 Sprites as art tiles** everywhere (type-coloured slanted field, Mega mark): `75-arena-battle.js` `ARBAT.artify`, `ARBAT.bf`.
- **X-02 Sliders**: every 2-3 choice switch with icons becomes a sliding picker (tool switch, Plan/Speed/Damage, Your hits/Their
  hits, Race track/List view); 5-6 choice and multi-toggle groups stay buttons. `76-slide.js`.
- **X-03 Folds remember open/closed per device**: `LS cc2.chf.<key>` (`bmwatch`, `bmlog`, `mufold`, `dcset0`, `dcset1`, `dctable`,
  `spdsum`, `gintro`, `trevents`, `typechart`…). `61-concept-h-pages.js` `CH.fold`, `CH.foldNode`, `CH.restyle`.
- **X-04 Redraw keeps your place**: `keepScroll`, `dcPin` (calc), `72-keep-place.js`.
- **X-05 Back button**: closes open sheets first (scouting sheet, Copy sheet), then steps back through pages and restores scroll.
  `32-views.js`.
- **X-06 Double-tap guard**: a second tap within 0.45 s after some actions is ignored (applies to team actions, not Battle toggles).
  `34-events.js` `TAP_ACT`.
- **X-07 Multi-device sync**: `S.opp` and `S.log` are saved to the Claude account and update live from other devices
  (`03-persistence.js`).
- **X-08 Text rewriting**: sentence case, " · " → ", ", title case (`71-manga.js`, `97-title-case.js`), long text behind "More"
  (`70-riso2.js`). Tests reading exact text should expect these rewrites.
- **X-09 Keyboard**: search boxes (arrow keys, Enter, Escape), `[role="button"][data-lt]` opens with Enter/Space, Escape closes the
  scouting sheet and the Copy sheet, Tab stays inside open sheets.

---

## Dead, duplicated or broken

**DEAD-01 Hidden opponent grid**: `#oppSlots` is `hidden` in `body.html` but `renderOppSlots()` still draws six inputs `#opp0-5`
with `[data-unopp]` × buttons and binds search to them on every `renderMatchup()`. Never visible. (`74-arena.js` uses it only as a
fallback anchor.)

**DEAD-02 `#oppClear` handler**: `34-events.js` handles a button `#oppClear` that no code or markup creates.

**DEAD-03 `[data-qlog]` handler**: `38-gauntlet.js` logs a win/loss "with the suggested four" on `[data-qlog]`, but nothing renders a
`data-qlog` button.

**DEAD-04 Pinned calc result**: `39-damage-calc-speed.js` `stick` is `false&&…` for normal results (switched off Nov 7), yet the
"No effect" variant still renders `#dcStick`, with `dcStickWatch` and its IntersectionObserver. Half-removed: either remove all or
restore consistently.

**DEAD-05 `[data-battle]`**: the click handler in `47-battle-mode.js` opens Battle, but no element carries `data-battle`.

**DEAD-06 `24-matchup.js`** is an empty file (1 byte) still listed in `app/parts.json`.

**DEAD-07 `view==='battle'` in `08-render-all.js`**: `view` is never `'battle'` (aliased to `'matchup'`), so that branch never runs.
Harmless because `render()` calls `renderMatchup()` → `renderBattle()` anyway.

**DUP-01 `rzReadHtml` defined three times** (`70-riso2.js`, `71-manga.js`, `75-arena-battle.js`); only the last assignment is used.

**DUP-02 Likely lead shown in up to three places**: The read, the Bring card line (hidden by class when The read shows), and
`ARBAT.opp`'s line under their six (only when your team has under 4), plus the Deeper read's archetype block.

**DUP-03 Two speed lists, two "top threat" sets**: Speed tiers lists the 20 most-used (excluding yours, from `metaThreats(24)`), but
"Your six vs the field" counts the top 30 from `THR.threatList(30)`. The hint says 20, the fold says 30. Correct but confusing.

**DUP-04 Two ways to log a game** (Battle log on Battle, "Your games" on My team) plus replay import, all writing `S.log` with slightly
different shapes (Battle log always 4 picks; My team 0 or 2 leads; replay up to 4 sent-in).

**BROKEN-01 Recent opponents lost when signed in (likely; not tested with a real account)**: `S.recentOpp` is not in
`snapshot()` / `fromDoc()` (`03-persistence.js`). When the account document loads, `S = fromDoc(v)` replaces `S`, so the list is
dropped from memory and the next `persist()` writes `cc2.state` without it. Expected: recent opponents disappear after a reload for
signed-in players and never sync across devices.

**BROKEN-02 Plan / Speed / Damage switch shows on desktop but does nothing**: CSS hides `.bmtabs` above 760px, but after
`76-slide.js` turns it into a slider (`display:grid`), it is visible at 1440 (measured: 444×82 px, screenshot) while the filtering
CSS only applies up to 760px, so all cards show whatever is chosen.

**BROKEN-03 Real-games verdict words differ from the word list**: Battle's "From real games" says Favored / Slight edge / Even /
Slightly behind / Behind (`35-win-model.js` `realMatch`), while the approved words (CLAUDE.md, Nov 9) are Favoured / Even match /
Unfavoured, which My team uses (`CH.realVs`). US spelling "Favored" too.

**BROKEN-04 Old words in MATCHUPS-06**: "Dangerous / Manageable" pills are not in the word list (only used when the scouting level
isn't available).

---

## Unsure (not verified)

**UNSURE-01 MATCHUPS scope**: the level and real-games lists live on My team; I listed them here as the brief asked. Group B's file
should reference the same features so they are not counted twice or missed.

**UNSURE-02 Track record is not "your logged games"**: see the note at TRACK. I am not sure whether the brief meant Track record (ratings)
or the player's own record; both are covered.

**UNSURE-03 Practice "Use my team" target**: in my-team mode the "strong players' four" is ranked from per-Pokémon bring rates
against similar teams, not a real player's four; I did not check `out/practice.json` rows beyond one round.

**UNSURE-04 Count abilities setting**: Battle's plan, The read and turn one call `planMatchup(…, true)` (always count abilities),
while the Deeper read and Test run use the "Count abilities" checkbox (`#useAbil`) from My team's plan settings. With it off, the
Deeper read's "your four" could differ from "Bring these four". Not tested.

**UNSURE-05 Logged games change Build for Me**: with 5+ logged games, `personalAdj()` adds the player's own results into Build for
Me's scoring (`22-auto-build.js`) and computes a `pYou` number that nothing displays. This may conflict with "team, not player"
(CLAUDE.md, Strength Score). I did not test its effect.

**UNSURE-06 Is MATCHUPS-06 (`#threats`) still visible?** It sits in the old scouting report markup on My team; theme layers may hide or
move it. I did not check its visibility.

**UNSURE-07 Fold keys**: fold state keys for folds made with `CH.restyle` (Deeper read, Full type chart) come from `data-chf`; I read the
code but did not confirm the toggle handler records them the same way as `CH.fold` folds.

**UNSURE-08 Replay import edge cases**: tested a pasted log (works) and plain text (error message). File upload (`#replayFile`) and
nicknamed/Mega replays were read in code, not run.

**UNSURE-09 Copy for Showdown on Battle**: appears only when `.chbmk` ("Their six" label) exists and their six is a known sheet;
confirmed present after loading a top team; clipboard result not checked in the headless browser.
