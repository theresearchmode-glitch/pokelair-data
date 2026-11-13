# Feature audit B: Home (HOME-01..16) and Build (B-build.md), today's site vs the rebuild

FOUND 62 · PARTLY 30 · MISSING 4 · NOT REBUILT YET 12 · UNSURE 1 (109 IDs: HOME 16, BUILD 8, AUTO 16, CORES 13, COV 12, SUGG 19, SETS 8, ARCH 5, X 12)

Look-only audit. Method: read docs/rebuild/inventory/A-team.md (HOME-01..16) and B-build.md (every bold ID, and X-01..X-12); then read
app/src/v2/pages/home.js, build.js, sugs.js, team.js, six.js, matchups.js, monsheet.js, shell.js, bridge.js, body.html and app/parts-v2.json, and
grepped app/src/v2 for each feature's words, data attributes and shared functions. Code only: nothing was run in a browser, so every verdict
is "from the code", not "seen". Paths below are under app/src/v2/ unless they start with app/.

Things that affect several rows:
- Links to pages that aren't rebuilt yet (#meta, #sets, #method): `V2.route()` (shell.js:142) sends any hash that isn't a page to Home. In the
  Preview build #meta shows the "Coming next" page (coming.js:5-9); #sets and #method have no placeholder, so in every build they land on Home.
- The All Suggestions page is now a sheet over My Team (sugs.js:88-102) holding the planner's plans (My Team's first, then `P.more`). Today's
  separate swap-card list (23-coverage.js `computeRecs` / `renderRecs`) isn't used anywhere in v2 (grep `computeRecs|renderRecs`: no hits).
- body.html:4 keeps `#useAbil` (checked) and `#swapMega` as hidden checkboxes for the shared logic. Swap my Mega has a visible slider; Count abilities doesn't.
- 51-usage.js is not in app/parts-v2.json `logic`, so the rebuild counts no usage.

| ID | Short name | Verdict | Evidence / what's missing |
|---|---|---|---|
| HOME-01 | Tagline headline | FOUND | home.js:12 `<h1 class="u hm-tag">` "Sharply raise / your win rate." (second span `.pl`). |
| HOME-02 | Most used #1 hero | FOUND | home.js:10,16: #1 drawn bigger (`hm-used one`), "% of ladder teams · #1", tap → info sheet (`data-v2mon`). Today's "bring Sneasler" line isn't there (mock-up design). |
| HOME-03 | Runners-up #2, #3 | FOUND | home.js:16 `used(six[1],2)…used(six[2],3)` on the same floor, tap → info sheet. |
| HOME-04 | Source and date line | FOUND | home.js:16 `homeSrcLine()` (app/src/app/05-home-data.js:6-7: "Most used in <month>, <source>. <data date>"). |
| HOME-05 | This week in the ratings | FOUND | home.js:56-57 `V2.homeWeek` (META.track.mv), 82-83 column "This week in the ratings"; under 900 px it's a third switch view (67, 75). Rows → info sheet. |
| HOME-06 | Three start buttons | FOUND | home.js:6-7,14: with a team "Score My Team" (primary) / "Build a Team"; no team "Build Me a Team" first; then "Plan a Match". |
| HOME-07 | Import from Showdown | FOUND | home.js:15 `data-v2homeimport`; 154 goes to #team and opens `V2.openImport()` (team.js:286, "Paste a Team", "Replace My Team"). |
| HOME-08 | All 11 Tools grid | PARTLY | home.js:94-101: 12 tiles (11 tools + How We Calculate). Each opens only its parent page (battle / meta / build), not the tool: Teams, Ratings, Events, Popular Sets, Archetypes and How We Calculate → #meta (not rebuilt; Home outside the Preview); Type Chart, Damage Calc, Test Run, Speed Tiers → #battle top; Winning Cores → #build without the scroll to the cores (no `data-hmcores`). |
| HOME-09 | The Champion's six | PARTLY | home.js:24-32,147-152: event title, player, date, players, six with items (→ info sheet), Load This Team (2 taps, 6 s, Undo, `sheetSlots`), Copy for Showdown, "All N events ›". Missing: "Same six as yours" (grep: no hits). "All N events ›" → #meta, not rebuilt. |
| HOME-10 | "vs" Your six panel | FOUND | home.js:33-48: title + weather word, Strength Score, six ordered lead/back/bench, game plan line ("vs the Champion's six" / "vs the meta's top six" / ", your leads"), "Prep vs the Champion" (`data-hmprep` → S.opp, Battle, toast), "Open My Team ›". Empty team: six "+ Add a Pokémon" tiles (open search) and "Add Your Six". |
| HOME-11 | Sample-team note | FOUND | home.js:48 (and team.js:364 on My Team): "This is a sample team…", "Build your own", "Import a Team". |
| HOME-12 | Welcome card | PARTLY | home.js:128-134,143-144: "New here? How NastyPlot works.", 3 steps, saved in `cc2.welcomed`, "Got It". Missing: the card's own "Build me a team" button (the text says "Build a Team above"). "Copy a Top Team" → #meta, not rebuilt. |
| HOME-13 | What's New fold | FOUND | home.js:135-145: same rules (cc2.seenNew, np.wnew session, never on a first visit), "N updates: …", × dismiss. |
| HOME-14 | Top of the Meta | FOUND | home.js:63-76: "The Meta, right now.", Top Rated / Hidden Gems switch (kept in `np2.seg.homegems`), hint line, 10 rows with tier and rating (→ info sheet), "All ratings ›" (→ #meta, not rebuilt). Today's switch wasn't saved; this one is. |
| HOME-15 | More on Home fold | PARTLY | home.js:105-124: pairs (tap → 2nd Pokémon's info), What changed this week (Rising/Falling, "#25 → #18"), Winning cores (→ Build at the cores), Your battles (Log a Game → #battle), source footer, open/closed remembered (`np2.fold.homemore`). Missing: the "Rankings ›" link under What changed this week. |
| HOME-16 | Weather chip | PARTLY | home.js:47-48 shows the weather word as text in the "Your six · … · Sun team" line. Today's small animated chip (`wxLayer`) isn't drawn (grep `wxLayer`: no hits). Look only, nothing lost in function. |
| BUILD-01 | Edit panel | FOUND | team.js:143-215: "Edit Set" sheet, strip of the six to switch, Lock, Remove (toast with Undo); empty spot → add sheet (six.js:52). Back/Esc close it through `V2.sheet` (shell.js:57-75). |
| BUILD-02 | Save / Share / Import / Export / Clear | FOUND | team.js:370 Save Team / Update Saved Team / "Saved ✓", Share; 81-95 save sheet (Save as New, Cancel, 10 max); 336-345 More menu: Import, Export, Copy, Compare, Clear Team (last, Undo). |
| BUILD-03 | Card view switch Full / Grid | PARTLY | No switch (grep `tview`, `Grid`: no Build/Team hits). The same jobs: Team Sheet shows every full set (team.js:51-63), the hero tiles are the compact view (six.js). |
| BUILD-04 | Lock a Pokémon | FOUND | six.js:9,22,43-44 (padlock button and tile mark); team.js:176,214 (Edit Set "Lock"/"Locked", "Suggestions never swap out a locked Pokémon"). The shared planner honours it. |
| BUILD-05 | New team start card | PARTLY | Empty My Team (team.js:235-238): "Build Me a Team", "Add a Pokémon", "Import a Team", "Open a saved team". Missing: "Copy a top team" and "Browse the meta" (both go to Meta, not rebuilt). |
| BUILD-06 | Problems and team checks | PARTLY | sugs.js:110-158: "Things to Know" fold (cc2.chf.rfix), problem rows with severity, "N fixes" folds, Quick add picks (Mega / In your box / To catch / Hidden gem / Idea tags, why, threat line, button, fit), Show N more / Show less, opens the first fix; checks listed once in Team Checks (team.js:383). Missing: the proven-team note "This exact team has won at real events…" (today in app/src/app/08-render-all.js:74, which isn't in parts-v2.json; no v2 hit). |
| BUILD-07 | Plan settings | PARTLY | Checked part by part. **Pick from**: FOUND as My Team's "Suggest from" slider, same `ui.pool` setting and toast (sugs.js:7,15). **Megas on team**: FOUND (sugs.js:8,16). **Let plans swap my Mega**: FOUND as "Swap my Mega? No/Yes" (sugs.js:9,17; now kept in `np2.swapMega`). **Count abilities**: MISSING, `#useAbil` is a hidden always-checked box (body.html:4) and the planner runs with abilities on (team.js:30). **Refresh plans**: MISSING (grep `replan`: no hits). **Never suggest**: MISSING, no box, chips or Clear all (grep `excl`, `Never suggest`: no hits); a list saved earlier in S.excl still applies but can't be seen or changed. |
| BUILD-08 | Team hero (dead) | FOUND | Dead in today's site (never shown); nothing to rebuild. My Team's hero (team.js:350-372) does the job. |
| AUTO-01 | Page head and How it works | FOUND | build.js:7-8: "Build · real winning teams · Reg M-C doubles", "Build me a team.", line; How It Works is now a sheet with the 3 points (34-36; "Matchups" per the word list). |
| AUTO-02 | Build from My box / Whole roster | PARTLY | build.js:9,24: slider, saved `cc2.absrc`, rebuilds when results show; "To catch" tags on tiles (54). Missing: the "N in your box" / "quick build, anything legal" line under the switch (`nBox` is computed at build.js:6 but never shown). |
| AUTO-03 | Pool rules | FOUND | Shared engine (`runAutoBuild`/`abPool`, app/22-auto-build.js); the "Only N usable Pokémon…" note at build.js:46. |
| AUTO-04 | Megas on team 0·1·2 | PARTLY | build.js:10 slider `sgmega`; sugs.js:16 rebuilds on Build, clears results elsewhere, toast from `setMegaGoal`; one value shared with My Team. Missing: the explaining tooltip ("73% of tournament teams and 81% of event winners carry 2 Mega options…"; grep `73%`: no hits). |
| AUTO-05 | Build around a Pokémon | PARTLY | build.js:11-15,18-32: optional box, chip with × ("Stop building around X"), button "Build Around X", picking or clearing wipes results, × refocuses the box, no-Mega note (45). Different: the name list leaves Megas out (`!p.m`, build.js:19), so you can't build around a Mega Pokémon; today's combobox lists them. |
| AUTO-06 | "Build around it" from elsewhere | PARTLY | Info sheet and Home's underdog have "Build Around It" (`data-hmaround`, monsheet.js:14, home.js:80,88-89): sets the pick, switches to Whole Roster if not in your box, closes the sheet, opens Build. Missing: it doesn't start building (no `runAutoBuild()` in home.js:88-89); the player must tap Build. |
| AUTO-07 | Build button, busy, errors | FOUND | build.js:13-16 (`aria-busy`, disabled, "↻" after results), 32, 42 "Building from real winning teams…"; failure toast and newest-build-wins come from the shared runAutoBuild (app/22-auto-build.js:294-311, redraws v2 via render()/V2.redraw). Busy text shorter than today's "…checking each against the top 30 threats." |
| AUTO-08 | Result card | PARTLY | build.js:41-69: kind (Proven team / 1 swap / Fresh take / Built team + "N Mega options"), archetype title, "Option k of n", Strength Score + band + rank + breakdown with "Why This Score?" (131-134), six tiles with item, role and tier, To catch / Off-meta, matchups "x/30 with an answer, Shaky, No answer", team checks x/4 + notes met, proven record, best core, fresh-take line, up to 3 game-plan chips. Missing: the "Sets and roles" fold (Ability, confidence chip, type tags per Pokémon); the "Few real games back this mix yet" note; the box catch tip ("Best single catch…" / "To reach 90+…"); "X isn't in your box: the best one to catch"; the two-weather warning; chips beyond 3. |
| AUTO-09 | Proven first, fresh take | FOUND | Shared engine; the fresh take arrives later and v2 redraws (app/22-auto-build.js:305-311 `V2.redraw`); kind shown build.js:51,85. |
| AUTO-10 | Use this team | FOUND | build.js:72: replaces the six (names only), opens My Team, toast with Undo ("Suggestions and the game plan now describe it", the stale wording fixed). |
| AUTO-11 | Save built team | FOUND | build.js:65,73-74: "Already saved as …", disabled with "10 saved teams already", `Saved "name"`. |
| AUTO-12 | Try another | FOUND | Replaced by "Other options" listing every other built team with score and "Show this one ›" (build.js:82-90,105). |
| AUTO-13 | Copy for Showdown | FOUND | build.js:65,75 `slotsPaste` (popular sets), toast; falls back to "open Export on My Team". |
| AUTO-14 | Empty / no-result states | FOUND | build.js:45-46: the three notes, without the old "Doubles" label. |
| AUTO-15 | Start from a recent winner | PARTLY | build.js:116-129: same 3 picks, each a fold with record, date, players, event, six; inside: full sets, Load This Team (2 taps, Undo, exact sets), Copy for Showdown, Practice Against ›, Compare ›. Missing: the archetype chips on each card. |
| AUTO-16 | Page order | FOUND | build.js:127: head + options, answer, jump bar, then Other options + Recent winners beside the cores (approved mock-up order); cores drawn on every redraw. |
| CORES-01 | Head and intro | FOUND | build.js:98-100: "Build Around a Core", "Pick a pair or trio that wins…", the "From N tournament teams. Average team wins X%…" line; "How Cores Are Ranked ›" sheet with today's `coreWhyText` (171-174). |
| CORES-02 | Pairs · Trios · Full teams | FOUND | build.js:99,103 (`coreUi.kind`, resets Show more). |
| CORES-03 | Top rated · Most used | FOUND | build.js:96-100,103 (pulled-toward-average vs raw rate, hint text changes). |
| CORES-04 | Filter by a Pokémon | FOUND | build.js:147-159: "With a Pokémon…" box, chip with ×, Enter/Esc. (Its list also leaves Megas out; cores match any form, so the base name is enough.) |
| CORES-05 | Core rows | PARTLY | build.js:93-97: rank, sprites, names, up to 2 tags (Mega tag dropped by decision 10), win %, "± vs avg", teams, "+x points together", raw rate as hover title; all shown, no Details toggle needed. Missing: the "Early read," mark for thin data; "% of all teams" only as a mouse-hover title (no touch equivalent). |
| CORES-06 | Show more | FOUND | build.js:91,101,106: starts at 7 (today 10), +15 per tap, "Show N More Pairs". |
| CORES-07 | Add a pair/trio | FOUND | build.js:107-110: `corePlan` rules, opens My Team, toast "Added … · removed … · N Megas" with Undo. |
| CORES-08 | Load team (full teams) | PARTLY | build.js:108: loads names only with the Undo toast. Missing: loading the player's exact items and moves when the six was played at a recent event (today's `useCore` → `loadSheet`, "<player>'s team loaded with its moves and items"). |
| CORES-09 | Teams with it | MISSING | No button (grep `corefind`, `Teams With It`: no hits in v2). Its target, Winning teams on the Meta page, isn't rebuilt either. |
| CORES-10 | Practice against | FOUND | build.js:95,162-163 (S.opp, Battle, "Loaded as your opponent"). |
| CORES-11 | Copy for Showdown (full teams) | FOUND | build.js:95,164-165. |
| CORES-12 | Empty states | PARTLY | "No cores match. Try another Pokémon." FOUND (build.js:101). Missing: "Cores appear once tournament results have loaded." (grep `Cores appear`: no hits). |
| CORES-13 | Opening the cores | PARTLY | Home's cores and "All cores ›" scroll Build to the cores (home.js:117, build.js:166-169); phone jump bar "Cores" (138-144). Missing: the Home tools tile "Winning Cores" lands at the top of Build; search has no "Winning cores" entry (shell.js:89-97 searches the 5 places and Pokémon only). |
| COV-01 | Page head | FOUND | Sheet "All Suggestions" with count and explainer (sugs.js:96-97), opened from "See All Suggestions ›" (52,99-101). The back link became the sheet's close and Back. |
| COV-02 | Opening without waiting | FOUND | The See all link shows only once the plans are ready; while they're worked out My Team shows "Working out the best changes…" (sugs.js:45-47). |
| COV-03 | Megas; Suggest from (2 choices) | PARTLY | The sheet has no controls; it follows My Team's settings (sugs.js:6-9, named in the sheet text, 97). Today's separate 2-choice setting (`ui.recSrc`, cc2.recsrc) is gone, merged into Suggest from (inventory "Duplicated" 13). |
| COV-04 | Swap / add cards | PARTLY | The sheet lists the planner's plans as the same compact cards as My Team (sugs.js:30-37,90-95): out → in sprites, score move, lane line, Apply, Why? reasons. Missing from today's swap cards: team count, type tags, Mega / In your box / To catch, role, tier+rating, Hidden gem / Side-grade / Idea tag, change chips (Weak 5 → 2, Offense x/18), the "Not in your sun" line; "Pokémon to add" vs "One Pokémon in, one out" headings. |
| COV-05 | Apply a swap | FOUND | sugs.js:104-108: `applyPlan`, Undo, double-tap guard. Different: the sheet closes after Apply (today stays on the page). |
| COV-06 | First 3 / more | PARTLY | Sheet shows My Team's ones + 12, "Show N more" adds 12 (sugs.js:92-98,102). Missing: the end text "That's every option…" and "Back to the top picks". |
| COV-07 | Nothing improves | PARTLY | My Team says "Nothing raises this team's Strength Score right now…" and lists side swaps (sugs.js:56-60). Missing: today's "Closest options, with their trade-off" cards with a Trade-off line, and the "Try Whole roster" advice. |
| COV-08 | Too few Pokémon | FOUND | The sheet doesn't open with no team (sugs.js:99); the empty My Team page (team.js:235-238) replaces the note and "Go to My Team". |
| COV-09 | Game-plan gap note | FOUND | Shown on My Team above the cards (sugs.js:51, `P.gapNote`). |
| COV-10 | Team checks list (dead) | FOUND | Dead (hidden) in today's site; Team Checks live on My Team (team.js:383). |
| COV-11 | Bigger plans fold | PARTLY | The multi-change plans are in the All Suggestions sheet (sugs.js:91) and the Undo bar is on My Team (82). Missing: Plan settings (see BUILD-07), the item-fix card (SUGG-16), set tips (SUGG-17), the hint line; plans aren't deduplicated against a swap list (there's only one list). |
| COV-12 | How scoring works | FOUND | team.js:414-426 "How Scoring Works", today's 8 paragraphs with More/Less, at the end of "Why this score?". |
| SUGG-01 | Where suggestions appear | FOUND | My Team (sugs.js:40-64), All Suggestions sheet (88-102), threat sheet Best fix (matchups.js:92-113), Quick add (sugs.js:114-158); one planner run (team.js:29-36 `planAllG`). |
| SUGG-02 | Suggest from / Megas / Swap my Mega? | FOUND | sugs.js:6-17, same settings and toasts. |
| SUGG-03 | Suggestion card (My Team) | FOUND | sugs.js:30-37: "Suggestion N", score move "+8 83 → 91" + band word, out → in rows, lane line, Apply (main on the first), "Why? N reasons" with "Weak spots: x → y". |
| SUGG-04 | Suggestion card (Bigger plans) | PARTLY | The sheet uses the compact card (sugs.js:93-95) with reasons from `planWhy` in Why?. Missing per change row: confidence chip, types, Mega, In your box / TO CATCH, rating, Hidden gem / idea tag, "Ability @ Item · usage"; the first two reasons aren't shown outside the fold; button "Apply" (not "Apply suggestion N"). |
| SUGG-05 | Planner rules | FOUND | Shared `planAllG` / planner (team.js:29-33), `applyPlan` remembers swapped-out Pokémon (sugs.js:108). Note: always runs with abilities counted (team.js:30). |
| SUGG-06 | Lanes Fix / Small edge / Option | FOUND | sugs.js:31,36 `LANE.lineParts`; also used on the All Suggestions sheet (so today's broken swap-card lane is fixed there). |
| SUGG-07 | Add Protect card | FOUND | sugs.js:65-68 (`LANE.protFix`, `data-protfix` → shared handler, app/src/app/36-lanes.js:70). On My Team only. |
| SUGG-08 | Nothing to fix | PARTLY | sugs.js:69-73 (LANE.NONE words, Battle and Sets links), side swaps (58-60). The "Sets" link goes to #sets, which isn't a page: it lands on Home until Popular Sets is rebuilt. |
| SUGG-09 | Apply | FOUND | sugs.js:104-108: `applyPlan`, Undo, Undo bar, 450 ms guard; the toast shows only when the Undo bar is off screen (A6, sugs.js:79-81). The score move isn't added to the toast (it's on the card). |
| SUGG-10 | Undo bar | FOUND | sugs.js:82 `undoTop()`, `data-undobar` (shared handler app/src/app/06-helpers.js:147). On My Team only. |
| SUGG-11 | Show more / See all (My Team) | FOUND | sugs.js:49,52,61-62,84-86 (remembered per team in `ui.sugMore`, focus moves to the next Apply). |
| SUGG-12 | More suggestions | FOUND | All Suggestions sheet includes `P.more`, "Show N more" (sugs.js:91,98,102). The end message "That's every suggestion…" is gone. |
| SUGG-13 | Working / stale state | FOUND | sugs.js:45-47 (faded, `inert`, `aria-busy`), 145 for the fixes. |
| SUGG-14 | Empty / no-plan messages | FOUND | sugs.js:56-59 ("No single change from this pool raises…", "Nothing raises…"), sheet "No suggestions for this team from this pool." (98). The several Bigger-plans wordings are merged. |
| SUGG-15 | Gap note and Mega-over-goal note | FOUND | sugs.js:51 `P.gapNote`; the Mega note is added to gapNote by the planner (app/src/app/29-fix-planner.js:261). Its text says "Let plans swap my Mega" while the slider reads "Swap my Mega?". |
| SUGG-16 | Fix your items first card | MISSING | grep `itemFix`, `itfix`: no hits in v2. Item problems still show as problem rows in Things to Know, and plans that fix them say "Fixes…", but the "Give X Y" one-tap fix is gone. |
| SUGG-17 | Set check tips | MISSING | grep `setTips`, `settip`: no hits in v2. No "X: Y instead of Z" tips and no "Use Y". |
| SUGG-18 | Quick add | FOUND | sugs.js:116-121,155-158 (`quickList`, `applyQuick`, Undo bar). |
| SUGG-19 | Best fix in threat sheet | FOUND | matchups.js:92-94,113: "Best fix: <move>", out → in, Apply (closes the sheet); shown only when it raises the score. |
| SETS-01 | Page head and switch | NOT REBUILT YET | Popular Sets (Meta page). |
| SETS-02 | Look up a Pokémon | NOT REBUILT YET | Popular Sets. |
| SETS-03 | Your team picker | NOT REBUILT YET | Popular Sets. |
| SETS-04 | Which Pokémon opens first | NOT REBUILT YET | Popular Sets. |
| SETS-05 | Pokémon header | NOT REBUILT YET | Popular Sets. |
| SETS-06 | Source switch | NOT REBUILT YET | Popular Sets. |
| SETS-07 | Set card | NOT REBUILT YET | Popular Sets. |
| SETS-08 | Ways in | NOT REBUILT YET | Popular Sets. The ways in that exist today already point at it: Nothing to fix "Sets" (sugs.js:73, lands on Home for now). |
| ARCH-01 | Page head and switch | NOT REBUILT YET | Archetypes (Tournaments, Meta page). |
| ARCH-02 | Share line | NOT REBUILT YET | Archetypes. |
| ARCH-03 | Guide list | NOT REBUILT YET | Archetypes. |
| ARCH-04 | Guide body | NOT REBUILT YET | Archetypes. |
| ARCH-05 | Archetype labels elsewhere | FOUND | Shared logic used on rebuilt pages: built team titles `t.label` (build.js:67,85), My Team title `teamTitleFor` (team.js:359, home.js:39). |
| X-01 | Page navigation and Back | FOUND | shell.js:57-67 (Back closes a sheet first), 213-225 (each page change is a history step with its scroll position; the address keeps the page on reload). |
| X-02 | Toasts with Undo | FOUND | bridge.js:12 adds `#toastUndo`; the shared handler (app/src/app/06-helpers.js:149-150) undoes and says "Change undone". Shown 4 s (shell.js:32). The Darkrai picture is cut (CLAUDE.md). |
| X-03 | Double-tap guard | PARTLY | 450 ms guard on Apply and Quick add (sugs.js:106,157). Not on Build's Use / Save, core Add / Load, or Home / recent-winner Load (build.js:71-75,104-110; home.js:148-152). |
| X-04 | Sliding pickers | FOUND | shell.js:117-133 `V2.slide` (icons, aria-pressed buttons, arrow keys, `v2slide` event). |
| X-05 | Clear (×) in Pokémon boxes | PARTLY | Build around and the cores filter are `type="search"` boxes (build.js:12,151): Esc empties them (28,156), and only some browsers draw their own ×. No site × that empties the box and keeps the keyboard up. The set lookup and Never suggest boxes don't exist in v2. |
| X-06 | Pokémon name boxes (combobox) | PARTLY | build.js:18-32,147-159: typed list, Enter picks the first, Esc clears, tap picks. Missing: ↑/↓ to move through the list, Esc closing only the list, the list's combobox role; Megas aren't listed (`!p.m`); "No matches. Try fewer letters." is now "No Pokémon called “x”." |
| X-07 | Phone lift for Pokémon boxes | UNSURE | v2 lifts only boxes inside a sheet (shell.js:39-54). The Build around and cores boxes sit on the page, with no focus handler (grep `focusin`: shell.js only). Whether the list opens behind the phone bar can only be settled by focusing them on a phone (≤1000 px). |
| X-08 | Title Case | FOUND | Labels are written in Title Case in the markup (e.g. build.js:13 "Build Me a Team", 98 "Build Around a Core"). |
| X-09 | Usage counting | MISSING | app/src/app/51-usage.js isn't in app/parts-v2.json `logic`, and v2 has no equivalent (grep `btn:`, `usage/`: no hits). No visible effect, but the anonymous tap counts stop at the switch. |
| X-10 | Info sheet from any tile | FOUND | `data-v2mon` on built-team tiles, other options, core/winner sixes, Home rows (build.js:54,87; home.js:10,31,66). |
| X-11 | Data loading | FOUND | bridge.js:5-9 `render`/`scheduleRender` redraw in place as the daily documents arrive; 03-persistence.js is in parts-v2.json; focus and place are kept (shell.js:159-188). |
| X-12 | Settings and team saved | FOUND | `render()` saves on every change (bridge.js:7); megaGoal, pool, absrc and saved teams use today's keys. The Never suggest list is kept but can't be edited (BUILD-07). |

## MISSING and PARTLY, most important first

1. **BUILD-07 Plan settings**: Count abilities, Refresh plans and Never suggest have no control (Pick from, Megas, Swap my Mega are FOUND). Players with a Never suggest list can't see or clear it, though it still filters every suggestion.
2. **SUGG-16 Fix your items first**: MISSING. A broken item (Item Clause, a dead item, a Choice Scarf under Trick Room) has no one-tap "Give X Y" fix.
3. **SUGG-17 Set check tips**: MISSING. No "most players run Y instead of Z" tips or "Use Y".
4. **AUTO-08 Build result card**: no Sets and roles (Ability, confidence, types), no "Few real games" note, no catch tip ("Best single catch" / "To reach 90+"), no "X isn't in your box" line, no two-weather warning, at most 3 chips.
5. **COV-04 / SUGG-04 All Suggestions cards**: the compact card drops today's per-Pokémon facts (types, In your box / To catch, role, tier, Hidden gem / Side-grade tag, Ability @ Item · usage, Weak/Offense change chips); the reasons are only inside Why?.
6. **CORES-08 Load team (full teams)**: loads names only; today it loads the player's exact items and moves when the six was played at a recent event.
7. **AUTO-06 Build around it from the info sheet**: opens Build with the pick set but doesn't start building.
8. **AUTO-05 / X-06 Name boxes leave Megas out** (`!p.m`): you can't build around a Mega; also no ↑/↓ list navigation in the boxes.
9. **COV-11 Bigger plans**: Plan settings, item-fix card, set tips and the hint line are not in the All Suggestions sheet (overlaps 1-3).
10. **SUGG-08 / HOME-08 / HOME-09 / HOME-12 / HOME-14 links to unbuilt pages**: "Sets" (#sets) and How We Calculate land on Home; #meta links (All events, All ratings, Copy a Top Team, 6 tool tiles) land on Home outside the Preview. Tool tiles open the parent page, not the tool.
11. **COV-07 Nothing improves**: no "Closest options, with their trade-off" cards and no "Try Whole roster" advice.
12. **CORES-09 Teams with it**: MISSING (its target page isn't rebuilt either).
13. **BUILD-06 Problems**: the proven-team note "This exact team has won at real events. Treat these as optional tweaks" is missing.
14. **X-03 Double-tap guard**: only on Apply and Quick add; missing on Use This Team, Save, core Add/Load and Load This Team.
15. **COV-03 Suggest from on All Suggestions**: no controls in the sheet; the separate My box / Whole roster setting is merged into My Team's Suggest from (removes a duplicate; confirm with Sim).
16. **HOME-09 Champion's six**: "Same six as yours" is missing.
17. **BUILD-05 Start card**: "Copy a top team" and "Browse the meta" are missing from the empty My Team (both targets not rebuilt).
18. **AUTO-15 Recent winners**: archetype chips are missing on each card.
19. **HOME-12 Welcome card**: its own "Build me a team" button is missing.
20. **CORES-13 Opening the cores**: the Home tools tile "Winning Cores" and search don't scroll to or find the cores.
21. **CORES-05 Core rows**: "Early read" mark is missing; "% of all teams" is hover-only.
22. **CORES-12 Cores empty state**: "Cores appear once tournament results have loaded." is missing.
23. **AUTO-02 Build from**: the "N in your box" / "quick build, anything legal" line is missing.
24. **AUTO-04 Megas on team**: the 73% / 81% explanation tooltip is missing.
25. **X-09 Usage counting**: MISSING (51-usage.js not loaded); no player-visible effect.
26. **X-05 Clear ×**: no site × in the name boxes (Esc and the browser's own × only).
27. **HOME-15 More on Home**: the "Rankings ›" link under What changed this week is missing.
28. **COV-06 / SUGG-12 end of list**: "That's every option…" and "Back to the top picks" are missing.
29. **BUILD-03 Full / Grid switch**: gone; Team Sheet and the hero tiles cover both views.
30. **HOME-16 Weather chip**: the weather word is text, not the small animated chip.

UNSURE: **X-07 Phone lift**. Settle it by focusing Build's "Build around" and "With a Pokémon…" boxes on a phone-width window (≤1000 px) with the keyboard up, and checking that the name list isn't hidden behind the bottom bar.
