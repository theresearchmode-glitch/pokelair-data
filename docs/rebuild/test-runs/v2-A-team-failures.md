# Group A (Team) on the new build: every FAIL, classified (Nov 12)

Date: 2026-11-12. Build: claude/design6 at 599de2c (`node app/build.mjs --v2`, normal data, copied to scratchpad v2-classify.html).
Command: `PAGE=<copy of app/dist/v2.html> ADAPTER=v2 node app/test/behaviour/run.mjs A-team`

Run conditions (measured): the run started 12:13:25 UTC and loaded the test file as committed at 51759e5 (the runner imports it at
start; an uncommitted edit to A-team.mjs, the NEW-wording switch for SUG-10/SUG-11/MU-02, landed at 12:14:57, after the start).
Another session was building and running behaviour tests on the same machine at the same time, so the 771 s time is slower than
usual; no FAIL looked timing-related. Compared with the Nov 12 parked-branch run (test-runs/nov11-night/behaviour-A-team-v2-parked-ipad.log,
same 57/75/6/4/2): the same 75 FAIL IDs with the same messages, and the same known / fixed? / skipped tests (the parked log printed HOME-10b twice; this run once).

Summary line (verbatim): `behaviour: 57 pass, 75 FAIL, 6 known bugs, 4 fixed?, 2 skipped; 771s  (adapter v2)`

Counts of the 75 FAIL tests: **page not built yet** 50, **real failure** 25.

Categories:
- **page not built yet**: the test needs a page, sheet or part the new build doesn't have yet (Home, Battle, Popular Sets, How We
  Calculate, Winning Teams, Build, or a My Team part still on docs/rebuild/r4-team-gaps.md's to-build list). These should turn
  into passes or real failures only when that part is built.
- **real failure**: the part exists but differs from what the test expects. Three kinds, named in each reason:
  intended change or wording the test hasn't caught up with; the test reading today's internal ids; the test adapter being out of
  date (the build has the feature, the adapter doesn't drive it). None of them is a confirmed bug in the build itself.

How to use this for "nothing else changed": the next run should give the same FAIL IDs with the same messages; any new ID, or a
changed message, is the thing to look at.

## Update, Nov 12 (later): the 25 "real failure" tests updated (branch helper/v2-tests)

Only app/test/behaviour/A-team.mjs and the two A-team adapters changed; nothing under app/src/. Each updated test checks the
new build's own words or design exactly (the `NEW` switch); today's page keeps today's expectations. Builds: claude/design6 at
bd154ec, `node app/build.mjs` and `node app/build.mjs --v2`, copied to the scratchpad before the runs.

Result lines (verbatim):
- New build, before: `behaviour: 55 pass, 77 FAIL, 6 known bugs, 4 fixed?, 2 skipped; 1144s  (adapter v2)` (two other runs on the
  machine at the same time; SAVED-05 and X-05 failed only under that load: both pass when run alone, `3 pass, 0 FAIL` with SUG-07)
- New build, after (run alone): `behaviour: 79 pass, 53 FAIL, 6 known bugs, 4 fixed?, 2 skipped; 713s  (adapter v2)`
- Today's page, before: `behaviour: 132 pass, 0 FAIL, 10 known bugs, 0 fixed?, 2 skipped; 1591s  (adapter current)`
- Today's page, after (run alone): `behaviour: 132 pass, 0 FAIL, 10 known bugs, 0 fixed?, 2 skipped; 1178s  (adapter current)`
  (an earlier after-run with another run beside it had SUG-07 fail, "no Protect fix card"; SUG-07 uses no changed code and passed alone.)

In plain words: 22 of the 25 now pass on the new build; every other FAIL line, known bug, fixed? and skip is the same as before
(compared line by line). The 53 FAILs are now: page not built yet 51 (the 50 before, plus TEAM-19, which passes everything up to
its Build Me a Team → Build step), and 2 left failing on purpose because their design is open (SHARE-01, SAVED-09).

Proof each updated test can fail: a deliberately wrong copy of the new build (scratchpad mutate.mjs: one wording or behaviour
change per test, e.g. "Paste a Team" → "Import a Team", the disabled save button at 10 removed, a picture added to toasts) gave
`behaviour: 0 pass, 22 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 171s  (adapter v2)` for the 23 updated tests minus EDIT-01
(TEAM-19 included), each failing on the changed spot. EDIT-01's focus check was proved with a probe: with the sheet open and focus moved to a page button it reads false.

Not added to docs/rebuild/test-edits.md (this branch was limited to the tests and this file); the per-test notes are in the table below.

## Update, Nov 12 afternoon: Team Sheet and Matchups summary tests (branch helper-tests-nov12)

Sim approved (Nov 12) the new build's Team Sheet (a sheet over My Team: eyebrow "← My Team · <team title> · Reg M-C doubles ·
level 50", heading "Team Sheet", "Copy for Showdown" (today's "Copy as text", same exportPaste text) and "Share as Image" (closes
the sheet, opens "Share Your Team" with the Team Sheet kind picked), key line "Tap a card to edit its set · Big number: …", cards
that open Edit Set by click / Enter / Space, and the empty "No team yet. …" with "Add a Pokémon" opening search), and the
Matchups summary moved out of the header to the top of the Matchups section ("N Favoured N Even match N Unfavoured" adding to 30,
the bar, "Damage calc: No answer a, Shaky b, Handles it c, Beats it d" adding to 30).

Seven tests got a new-build branch (`if (NEW) { … return; }` placed before today's code; today's lines are unchanged, the diff of
A-team.mjs is 47 added lines, 0 removed): **SHEET-01, SHEET-02, SHEET-03, SHEET-04, IO-04, SHARE-04, TEAM-15**. Adapter
(adapters/v2.A-team.mjs, 8 added lines, commented): `focusSheetCard(name)` (puts keyboard focus on a card so Enter / Space can be
pressed) and `matchupsBar()` (the bar is aria-hidden, so text can't see it: its three shares and the lines around it). SHEET-04 opens
the empty sheet with `peek('V2.openTeamSheet()')`, because the empty My Team has no More menu or Team Sheet link. Nothing under app/src changed.

Builds: claude/design6 at b5c1d9c, `node app/build.mjs --v2` and `node app/build.mjs` (esbuild installed), copied to the scratchpad.
Result lines (verbatim, `--only=SHEET-01,SHEET-02,SHEET-03,SHEET-04,IO-04,SHARE-04,TEAM-15`):
- New build, before: `behaviour: 0 pass, 7 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 33s  (adapter v2)`
- New build, after: `behaviour: 7 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 47s  (adapter v2)`
- Today's page, before: `behaviour: 7 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 53s  (adapter current)`
- Today's page, after: `behaviour: 7 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 55s  (adapter current)`

Proof each new branch can fail: one deliberately wrong copy of the built v2.html per test (one string replaced), each run alone
with `--only=<ID>`; every run printed `behaviour: 0 pass, 1 FAIL, 0 known bugs, 0 fixed?, 0 skipped; …  (adapter v2)`:

| ID | What was broken in the copy | FAIL line (verbatim message) |
|---|---|---|
| SHEET-01 | team title dropped from the eyebrow | Team Sheet head doesn't show / ← My Team · Sun Tailwind \(sample\) · Reg M-C doubles · level 50 Team Sheet Copy for Showdown / |
| SHEET-02 | "Share as Image" → "Share Image" | Team Sheet actions and key line doesn't show /Team Sheet Copy for Showdown Share as Image Tap a card to edit its set · … Mega Charizard Y / |
| SHEET-03 | `data-ts2edit` removed from the cards | click on Garchomp's card: the Team Sheet is still open |
| SHEET-03 | key handler answers Tab, not Enter / Space | Enter on Incineroar's card: the Team Sheet is still open |
| SHEET-03 | key handler answers Enter only | Space on Sneasler's card: the Team Sheet is still open |
| SHEET-04 | empty sheet's "Add a Pokémon" loses `data-v2search` | "Add a Pokémon" did not open search (null) |
| IO-04 | copies `exportPaste().toUpperCase()` | clipboard is not the Showdown export: CHARIZARD @ CHARIZARDITE Y |
| SHARE-04 | "Share as Image" picks the Team Card kind | "Team Sheet" not the picked kind |
| TEAM-15 | bar's Favoured share drawn from the Unfavoured count | the bar's fav share is 10, not 6 of 30 |
| TEAM-15 | "6 Favoured 21 Even match 3 Unfavoured" put back in the header (before "Why this score?") | a Matchups summary shows before the Matchups section: …Data as of Nov 10 6 Favoured 21 Even match 3 Unfavoured · Why this score? Lead Mega Char… |

## Update, Nov 12 evening: Export, Saved Teams head, first visit, Edit Set header, Save Team, Game Plan, Types, Team Sheet, How Scoring Works (branch helper-tests2-nov12)

Sim approved (Nov 12) these new-build designs; twelve tests got a new-build branch (`if (NEW) { … return; }` before today's code;
today's lines unchanged: A-team.mjs is 130 added lines, 0 removed): **IO-02, TEAM-13, SAVED-02, X-02, EDIT-03, EDIT-12, PLAY-01,
PLAY-02, X-07, SETS-01, SETS-02, X-12**. What each new branch checks:
- IO-02: More → "Export" opens "Export to Showdown" (exact sheet words), a readonly box equal to exportPaste(), "Copy" → toast "Copied"
  and the clipboard; with copying blocked in the browser (clipboard.writeText rejects, execCommand false) → "Press Ctrl+C to copy" and
  the whole text focused and selected.
- TEAM-13: every action incl. Team Sheet and the More row "Export" ("The Showdown text to read, select or copy", opens Export to
  Showdown); Saved Teams / My Box / Compare open; a saved team just opened shows "Saved ✓" (no "Update saved team", A11); empty team
  has no save / share / export / copy / clear, keeps Saved Teams and Import, and the header My Box icon opens My Box.
- SAVED-02: " ← My Team · 2 of 10 saved Saved Teams Up to 10 teams. Saved and kept in step across your devices." (account) and
  "… Saved in this browser only." (no account), each without the other's words; "← My Team" closes the sheet back on My Team.
- X-02: first visit heading "Sun Tailwind (sample)", the note "This is a sample team, here to show how NastyPlot works. Build your own ·
  Import a team", "Build your own" leads to #build (checked by its link: #build has no page in this build yet), "Import a team" opens
  "Paste a Team", the sample is saved and "Open now", Saved Teams closed with "← My Team", then My Box "36 Pokémon · 2 boxes".
- EDIT-03: Edit Set header starts exactly "Edit Set Mega Charizard Y Fire Flying <N> <X> tier rating <share> of teams" with N, X and the
  share from the shared logic (monRating, lairHead, V2.shareTxt); "Mega Ability" / "Mega Stone" tags; Lock → "Locked" + its line; the
  tile gets class locked, the "Locked" padlock and the name "…, locked"; Garchomp's tile does not.
- EDIT-12: "Save team" opens the Save Team sheet (title, focus in the "Team name" box, no set editors); Edit Set's strip lists the six
  in team order and its 6th button switches to Sneasler.
- PLAY-01: plan line starts "Game plan vs the meta's top six: lead"; "Game plan" opens the "Game Plan" sheet; eyebrow "My Team ·
  <teamArchetype label>"; every row (label, Covered/Partly/Missing/Optional, who, note) equals gamePlan(members()); Speed control
  Covered with Whimsicott · Tailwind; after a reload no sheet and no Game Plan fold.
- PLAY-02: inside Things to Know, Types starts on Offense ("You OHKO or 2HKO N of the top 30 threats", "N/18 types…"), no Mega pick
  there; Defense headline, "More weak than resist / Nobody resists / Even split", np2.seg.types = "def"; two-Mega line exact and the
  Mega Salamence pick switches it; "Full Tables ›" opens "Full Tables" (eyebrow "My Team · Types"): an 18-row offense table and the
  defense grid (Attack, the six, Weak, Resist, Net); Defense still chosen after a reload.
- X-07: Things to Know open, Defense and "Whole roster" kept after a reload; the Game Plan sheet is not.
- SETS-01 (lead's update): the Team Sheet sheet's six cards (item, Ability, stats); exactly the plan line's two leads carry "↑ Lead vs
  the meta's top six"; no remove control on any card (Sim dropped it); a card opens Edit Set; the six's "− Remove" removes with Undo.
- SETS-02 (lead's update): "How Scoring Works" is a closed fold, the last part of "Why this score?"; its first paragraph shows exactly
  "Matchups: the 30 Pokémon that make top cut most often (weighted by how often), and for each one whether your team is prepared. More";
  no "Ready for the top threats" (Sim approved the wording and this test change).
- X-12 (lead's update): 8 paragraphs, at least 6 with "More" (aria-expanded false) showing one sentence; More shows the rest (only that
  paragraph) and reads "Less" (true); Less folds it back to the same text.

Adapter (adapters/v2.A-team.mjs, 36 added and 4 changed lines, all commented "Nov 12"): `openExport` / `exportText` and
`pickTypeChartMega` were "not in v2 yet" throws and now use the built features; `teamAction` and `teamActions` know the Export row;
new `exportBox`, `moreMenuRows`, `tileLock`, `linkHref`, `gamePlanSheet`, `typesPart`, `typeTables`, `howScoring`, `tapHowMore`,
`teamSheetRemoves`. Nothing under app/src changed.

Builds: claude/design6 at 637d04a (before, first nine) and f926516 (everything else), `node app/build.mjs --v2` and `node app/build.mjs`,
copied to the scratchpad. Result lines (verbatim):
- New build, before (637d04a, the nine): `behaviour: 0 pass, 9 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 28s  (adapter v2)`
- New build, before (f926516, SETS-01, SETS-02, X-12 with neighbours TEAM-13b, SAVED-01, EDIT-02, IO-01, SHEET-03):
  `behaviour: 4 pass, 3 FAIL, 0 known bugs, 1 fixed?, 0 skipped; 46s  (adapter v2)` (the 3 FAILs are the three; TEAM-13b's fixed? as before)
- New build, after (f926516, the twelve plus those five neighbours): `behaviour: 16 pass, 0 FAIL, 0 known bugs, 1 fixed?, 0 skipped; 125s  (adapter v2)`
- Today's page, before (f926516, the twelve): `behaviour: 12 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 93s  (adapter current)`
- Today's page, after: `behaviour: 12 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 94s  (adapter current)`

Proof each new branch can fail: one deliberately wrong copy of the built v2.html per row (strings replaced once), each run alone with
`--only=<ID>`; every row printed `behaviour: 0 pass, 1 FAIL, 0 known bugs, 0 fixed?, 0 skipped; …  (adapter v2)`:

| ID | What was broken in the copy | FAIL message (shortened) |
|---|---|---|
| TEAM-13 | Export row's line shortened to "The Showdown text" | More menu has no "Export" row with its line: … {"label":"Export","sub":"The Showdown text"} … |
| IO-02 | export box not readonly | export box can be typed in |
| IO-02 | blocked copy focuses but doesn't select | export text not focused and selected: {"readOnly":true,"focused":true,"selected":0,"len":891} |
| SAVED-02 | account line says "Saved in this browser only." | Saved Teams head (account): ← My Team · 2 of 10 saved Saved Teams Up to 10 teams. Saved in this browser only. … |
| SAVED-02 | "← My Team" without href and data-v2close | "← My Team" did not close the sheet back to My Team (teams) |
| X-02 | sample note's "Import a team" loses data-v2import | "Import a team" did not open Import (null) |
| X-02 | "Build your own" points at #team | "Build your own" leads to #team |
| EDIT-03 | header says "of all teams" | Edit Set header reads "✕ Edit Set Mega Charizard Y Fire Flying 94 S tier rating 16% of all teams …" |
| EDIT-03 | tile's name loses ", locked" | tile not shown locked: {"label":"Mega Charizard Y, Lead","locked":true,"padlock":true,…} |
| EDIT-12 | Save sheet focuses its button and doesn't select the name | the name box is not focused (focus on "Save Team") |
| EDIT-12 | every strip button points at spot 1 | nothing to tap: .ed2 .ed-pk[data-k="5"] |
| PLAY-01 | status word "Covered" → "Done" | row 1 reads {"label":"Speed control","status":"Done",…} |
| PLAY-01 | archetype dropped from the eyebrow | eyebrow "My Team", want the archetype "Sun · Grassy Terrain · Tailwind" |
| PLAY-02 | Offense / Defense not saved | Defense not kept in np2.seg.types: null |
| PLAY-02 | Full Tables without the defense table | Full Tables parts: Offense: what you hit, 1 tables |
| PLAY-02 | Mega pick does nothing | Mega pick doesn't show /so this reads Mega Salamence as the Mega/ |
| X-07 | Offense / Defense not saved | Types view not kept |
| SETS-01 | "↑ Lead" on every card | Incineroar is not a lead but its card says "↑ Lead" … |
| SETS-02 | old words "Ready for the top threats: …" | first paragraph: Ready for the top threats: the 30 Pokémon that make top cut most often … |
| X-12 | "More" never turns into "Less" | "More" did not show the rest: {"len":1432,"was":131,"b":"More","x":"true"} |

Two first tries did not break anything (so they are not proof, and were replaced above): removing only `data-v2close` from "← My Team"
(its href="#team" still closes the sheet), and only changing the Save sheet's `focus:` option (the sheet still selects the name box).

Notes: (1) going to My Box with the Saved Teams sheet open was flaky in a probe (once it landed back on My Team, once on My Box: the
sheet's close and the hash change race); X-02 now closes the sheet first, as a player must. (2) In this (non-Preview) build "Build your
own" and "Build Me a Team" lead to #build, which has no page yet (TEAM-19 is "page not built yet"); rule C10 applies until Build exists.

## The 75 FAIL tests (Nov 12 run; Category and Reason updated for the 25 "real failure" rows)

| ID | Title (short) | Category | Reason | Failure message (shortened) |
|---|---|---|---|---|
| HOME-01 | Home leads with the tagline "Sharply raise your win rate." | page not built yet | Home page not in the new build. | not in v2 yet: Home page |
| HOME-02 | Most used #1 card opens that Pokémon's info sheet | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-03 | Runner-up strips (#2, #3) open their info sheets | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-04 | Data line names the month, the source and "Data as of <date… | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-05 | This week in the ratings: chips with arrow + number open th… | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-06 | Start buttons: "Score my team" first with a team, "Build me… | page not built yet | Home page. | not in v2 yet: Home page |
| HOME-07 | "Import from Showdown" opens My Team with the Import box re… | page not built yet | Home page ("Import from Showdown" button lives there). | nothing to tap: text Import from Showdown |
| HOME-08 | All 11 Tools: each card opens the page named on it | page not built yet | Home page (All 11 Tools). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-09 | Champion's six: load needs a second tap, loads with Undo; C… | page not built yet | Home page (Champion's six). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-10 | vs panel: your six, a lead/back/bench plan, Prep vs the Cha… | page not built yet | Home page (vs panel). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-11 | Sample-team note on Home and My Team; "Import a team" opens… | page not built yet | Home page (sample-team note); My Team's sample note not built either (see X-02). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-12 | Welcome card on first visit; "Got it" hides it for good | page not built yet | Home page (welcome card). | not in v2 yet: Home page (welcome card) |
| HOME-13 | What's New fold after an update; × dismisses it for good; n… | page not built yet | Home page (What's New fold). | no What's New fold after an update |
| HOME-14 | Top of the Meta: 10 rated rows, Hidden gems switch changes … | page not built yet | Home page (Top of the Meta). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-15 | More on Home fold: pairs, what changed, cores, "Log a game"… | page not built yet | Home page (More on Home fold). | no fold titled More on Home (not in v2 yet) |
| HOME-16 | Weather chip "Sun team" on Home's team card | page not built yet | Home page (team card weather chip). | no "Sun team" weather chip |
| TEAM-04 | "Why this score?" opens the breakdown; its parts add up to … | page not built yet | Breakdown works and adds up; fails only at its last step, the link to How We Calculate, a page not built yet. | link did not open How we calculate |
| TEAM-07 | Phone jump bar: Suggestions \| Matchups \| How it plays \| Set… | passes now (test updated Nov 12) | Was: Intended change (decided Nov 11, r4-team-gaps.md): new jump bar Set \| Matchups \| Suggestions \| Team Checks at every width; test not updated. **Nov 12:** Test now checks, on the new build: jump bar exactly Set \| Matchups \| Suggestions \| Team Checks at 390 and at 1280; "Set" marked at the top; tapping Suggestions brings its section from below the screen to the top half and marks Suggestions (not Set); no sideways scroll. Mutation proof: label "Suggestion" -> FAIL. | jump bar: Set\|Matchups\|Suggestions\|Team Checks |
| TEAM-08 | Your Six: six tiles lead/back/bench; tapping a tile shows i… | passes now (test updated Nov 12) | Was: Intended change (decided Nov 11): no "Your Six" heading, picked set always shows, no tap-again-to-hide; test not updated. **Nov 12:** Test now checks: six tiles in lead/back/bench order; NO "Your Six" heading and NO "Tap a Pokémon…" hint (absent by design); the first lead's set shows before any tap (phone and desktop); tapping Garchomp shows its set and marks its tile; tapping it again keeps the set. Mutation proof: a visible "Your Six" -> FAIL. | page doesn't show Your Six |
| TEAM-11 | Set as lead: plan says "your pick" (saved to the account); … | page not built yet | Set as lead, toast, plan line and account save pass; fails at "Home follows" (Home page not built). | not in v2 yet: Home page |
| TEAM-13 | Team actions row: Save/Update label, ⋯ menu; empty team kee… | page not built yet | Export to Showdown text panel not in the new build (only Copy for Showdown; r4 says "decide if still needed"). Note: later steps would also fail because the adapter always names the save button "Save team", never "Update saved team" (adapter out of date). **Nov 12:** the adapter now reports the save button by its own words; on a saved team just opened (unchanged) the new build shows "Saved ✓" (A11, approved), not "Update Saved Team", so that later step will need the same update as SAVED-01 once Export is decided. | no action Export in Save team\|Share\|Saved Teams\|Team Sheet\|Copy for Showdown\|Import\|Compare with…\|My Box\|Clea… |
| TEAM-15 | Matchups summary: Favoured/Even/Unfavoured add to 30 and ma… | page not built yet | Header Matchups summary ("N Favoured / N Even / N Unfavoured … in real games" + "Damage calc: covers N of 30") not built; still on the r4 to-build list. | no "N Favoured / N Even / N Unfavoured" summary |
| TEAM-19 | Empty team: Darkrai, invitation, "Add your first Pokémon" o… | page not built yet | Was: Intended change (Sim, Nov 11): empty My Team shows today's underdog and new copy ("Six spots, all yours."), no Darkrai, no six "+ Add" tiles; test still expects the old copy. **Nov 12:** Test updated to the new empty My Team (exact "Six spots, all yours." lead, Build Me a Team / Add a Pokémon / Import a team, today's underdog line and its Add/Info Sheet buttons; the ONLY picture is the underdog's sprite, so no Darkrai; no six "+ Add" tiles; no parts 1-3; Add a Pokémon opens a focused name box). All of that passes; it now fails only at its last step, Build Me a Team → Build page (not built). Mutation proof: "Six spots, all mine." -> FAIL at the lead line. | page doesn't show Add your six and NastyPlot scouts the top 30 threats for you. |
| SUG-08 | "Nothing to fix" card with Battle and Sets on a complete te… | page not built yet | "Nothing to fix" card passes; fails at its Battle button (Battle page not built). | Battle button did not open Battle |
| PLAY-01 | Game Plan fold: rows with Covered/Missing/Partly; Speed con… | page not built yet | Game Plan fold not built (r4 to-build list). | no fold titled Game Plan (not in v2 yet) |
| PLAY-02 | Types fold: Offense/Defense switch, type grid, Mega pick wi… | page not built yet | Types fold not built (r4 to-build list). | no fold titled Types (not in v2 yet) |
| SETS-01 | Open Team Sheet fold: one card per Pokémon; tapping opens i… | page not built yet | Open Team Sheet fold not built (r4 to-build list). | no fold titled Open Team Sheet (not in v2 yet) |
| SETS-02 | How Scoring Works fold explains Ready for the top threats | page not built yet | How Scoring Works fold not built (r4 to-build list). | no fold titled How Scoring Works (not in v2 yet) |
| EDIT-01 | Edit panel opens titled "Edit <name>"; Done, Escape and the… | passes now (test updated Nov 12) | Was: Test reads today's internal #chEdit element directly, which the new build doesn't have; the Edit Set sheet itself exists (test side, not a build bug). **Nov 12:** The focus check moved from the test's own #chEdit read into an adapter helper (focusInEditPanel; today: #chEdit, new build: the open Edit Set sheet). Proof: with the sheet open and focus moved to a page button, the helper reads false (probe); after Escape false. | page.evaluate: TypeError: Cannot read properties of null (reading 'contains') |
| EDIT-01b | Closing the edit panel puts focus back on "Edit set" | passes now (test updated Nov 12) | Was: Wording only: focus returns to "Edit Set" (Title Case rule); test wants "Edit set". **Nov 12:** New build expects "Edit Set" exactly, and also that the sheet closed and focus is on a button (the sheet itself is labelled "Edit Set"). Mutation proof: button text "Edit set" -> FAIL. | focus is on "Edit Set" |
| EDIT-03 | Slot header: Lock → "Locked" (tile shows locked), types, Me… | page not built yet | Edit Set slot header (types, tier, usage, tile lock state) not built (r4 to-build list). | slot header doesn't show /Fire Flying/ |
| EDIT-05 | Stat points: live total, over-66 warning, Save stat points;… | passes now (test updated Nov 12) | Was: Wording only: tag reads "Your pick", test wants "Yours" (total, warning and "Stat points saved" pass first). **Nov 12:** New build: the Stat points field itself must read "Stat points Your pick Use the most common 66 of 66 …"; the Team Sheet check reads the Garchomp card on the Team Sheet (the sheet sits over My Team, so the page text starts with My Team's) and needs "Your spread HP … 32" and "Spe … 0". Mutation proof: reset label changed -> FAIL. | page doesn't show /Yours/ |
| EDIT-06 | Ability picker: a rarer ability names the common one; "Use … | passes now (test updated Nov 12) | Was: Wording only: reset toast "Back to the most-used Ability" vs test /most-used ability/ (capital A). **Nov 12:** New build expects the reset toast to start "Back to the most-used Ability" (capital A). Mutation proof: lower-case "ability" -> FAIL. | no reset toast |
| EDIT-08 | Moves: change move 4 → toast mentions Offense; "Reset to po… | passes now (test updated Nov 12) | Was: Intended change (decided Nov 11): move toast says how the Strength Score moved, not "Offense"; test not updated. **Nov 12:** New build: toast exactly "<move> replaces <old move> · Strength Score <a → b | stays at N>" and no "Offense"; Moves field "Your pick Back to the popular set"; that button restores the four with toast "Back to the popular set · Strength Score …". Mutation proof: "in for" instead of "replaces" -> FAIL. | no "<move> replaces … Offense" toast |
| EDIT-09 | "Full popular sets ›" closes the panel and opens Popular se… | page not built yet | "Full popular sets ›" needs the Popular Sets page, not built. | nothing to tap: text Full popular sets › |
| EDIT-10 | Weak / Resists fold shows resistances and the ability text | page not built yet | Weak / Resists fold in Edit Set not built (r4 to-build list). | no fold titled Weak (not in v2 yet) |
| EDIT-12 | "Save team" opens "Edit team" with the save box and all six… | page not built yet | "Edit team" panel with save box and six editors not built; Save is a small separate sheet (r4 to-build list). | panel not "Edit team" |
| IO-01 | Import a team: legal Pokémon load, skipped ones reported, U… | passes now (test updated Nov 12) | Was: Wording only: import sheet is headed "Paste a Team" (aria-label "Import a team"); test reads the text for "Import a team". **Nov 12:** New build: sheet title exactly "Paste a Team", text starts "✕ Import Paste a Team A Showdown team or a NastyPlot team link.", "Replace My Team"; the rest unchanged. Mutation proof: title "Import a Team" -> FAIL. | page doesn't show /Import a team/ |
| IO-02 | Export to Showdown: Showdown text with item, Ability, Level… | page not built yet | Export to Showdown text panel not in the new build (adapter throws "not in v2 yet"). | not in v2 yet: Export to Showdown panel (only Copy for Showdown) |
| IO-03 | Copy for Showdown on My Team: toast and six Showdown blocks… | passes now (test updated Nov 12) | Was: Intended change: Copy for Showdown moved into My Team's More menu (Sim, Nov 11), so the test finds no visible button; its toast also reads "Team copied for Showdown", not the test's words. **Nov 12:** New build: Copy for Showdown is taken from My Team's More menu (adapter teamAction) and the toast must be exactly "Team copied for Showdown"; still six Showdown blocks on the clipboard. Mutation proof: toast "Copied for Showdown" -> FAIL. | nothing to tap: text Copy for Showdown |
| IO-04 | Team Sheet "Copy as text" copies the team | page not built yet | Team Sheet "Copy as text" not built (the sheet offers Copy for Showdown instead; r4 to-build list). | nothing to tap: text Copy as text |
| SHARE-01 | Share box: Team Card / Poster / Sheet switch, Light / Dark … | real failure (open, left failing) | Was: Test's last step calls today's internal $('shareBtn') for the empty team; the new build has no Share button on an empty team (test side; whether the empty-team message is wanted is open). **Nov 12:** Not changed. Its last step needs a decision: the new build shows no Share button on an empty team, and whether an "Add some Pokémon first" message is wanted is open (Sim). | page.evaluate: TypeError: Cannot read properties of null (reading 'click') |
| SHARE-02 | Team Card image is 1200×675 | passes now (test updated Nov 12) | Was: Wording only: share sheet title "Share Your Team", test wants "Share card" (image size passes). **Nov 12:** New build: title exactly "Share Your Team" and "Team Card" the picked kind; size 1200×675 unchanged. Mutation proof: title "Share This Team" -> FAIL. | title: Share Your Team |
| SHARE-03 | Team Poster image is 1080×1350 | passes now (test updated Nov 12) | Was: Wording only: share sheet title "Share Your Team", test wants a title with "poster" (image size passes). **Nov 12:** New build: title stays "Share Your Team", "Team Poster" picked and "Team Card" not; size 1080×1350 unchanged. Mutation proof: title "Share This Team" -> FAIL. | title: Share Your Team |
| SHARE-04 | Team Sheet page "Share as image" opens the box titled "Team… | page not built yet | Team Sheet "Share as image" not built (r4 to-build list). | nothing to tap: text Share as image |
| SHARE-06 | Team link: "Copy team link" copies #team=…; opening it offe… | passes now (test updated Nov 12) | Was: Wording only: shared-link bar button reads "Open This Team", test wants "Load it". **Nov 12:** New build: "Open This Team" (was "Load it"); after loading, the hash must be exactly "#team" (My Team's own route; the #team=… link is gone). Mutation proof: button "Load it" -> FAIL. | nothing to tap: text /^Load it$/ |
| LOG-01 | Your games card on a full six: "None logged yet." and "Log … | passes now (test updated Nov 12) | Was: Wording only: card reads "Your Games … Log a Game", test wants "Your games: this six" and "Log a game". **Nov 12:** New build: the card must read exactly "Your Games None logged yet Log a Game". Mutation proof: "Log a game" -> FAIL. | card: Your Games None logged yet Log a Game |
| LOG-02 | Log a game: two leads, their six from Battle mode, Win → "1… | page not built yet | Log form lacks "Paste its log" (replay link, comes with the Battle page). | log form doesn't show /Paste its log/ |
| LOG-05 | Logged games show on the matching saved team and in Compare | passes now (test updated Nov 12) | Was: Saved card shows "Your games 1–0" but not "… with this six" (wording); the Compare step would then hit an adapter gap (adapter maps only Open/Copy/Rename/Delete, though the build has Compare). **Nov 12:** Adapter now maps the saved card's Compare. New build: Sun six card "… 2/4 checks Your games 1–0 Open …", Rain test none; Compare row exactly "Your games with this six 1–0 1 game you logged None logged". Mutation proof: card "Games 1–0" -> FAIL. | Sun six card doesn't show /Your games 1–0 with this six/ |
| SHEET-01 | Team Sheet head: "<team name>: Reg M-C doubles, level 50", … | page not built yet | Team Sheet head line ("<team>: Reg M-C doubles, level 50") and "← My Team" back link not built (r4 to-build list). | page doesn't show /Sun Tailwind \(sample\): Reg M.C doubles, level 50 Team Sheet/ |
| SHEET-02 | Team Sheet actions and key line | page not built yet | Team Sheet "Share as image" / "Copy as text" / key line wording not built (r4 to-build list). | Team Sheet doesn't show Share as image |
| SHEET-03 | Six set cards (item, ability, moves, nature, stats); tappin… | page not built yet | Team Sheet cards don't open My Team's edit panel when tapped (r4 to-build list). | My Team did not open |
| SHEET-04 | Team Sheet with no team: "No team yet…" and "Open My Team" | page not built yet | Team Sheet with an empty team not built (button hidden and the sheet returns nothing with no team). | not in v2 yet: Team Sheet with this team (My Team shows no Team Sheet button) |
| SAVED-01 | Save team: name box, "Save as new" → toast "Saved "Test"", … | passes now (test updated Nov 12) | Was: Wording: save sheet says "Save Team / Give this six a name.", not "Save this doubles team". Later step also blocked by the adapter always calling the save button "Save team" (build shows "Update Saved Team"). **Nov 12:** New build: "Save Team" sheet (title, "Give this six a name. 0 of 10 saved Save Team Cancel"); toast exactly "Saved "Test""; the sheet closes; main button then "Saved ✓" (A11, approved) and becomes "Update Saved Team" after a change; saved to the account and open. Adapter: teamActions now reports the save button by its own words. Mutation proof: changed sheet line -> FAIL. | page doesn't show /Save this doubles team/i |
| SAVED-01b | Save panel: empty name saves as "Untitled team"; 10 saved t… | passes now (test updated Nov 12) | Was: Test reads today's internal #saveNew button; the new build does disable its save button at 10 (test side). **Nov 12:** The #saveNew read became: the button labelled "Save as new" (today) / "Save Team" (new build) in the open panel must be disabled at 10. Mutation proof: build without the disabled -> FAIL. | "Save as new" not disabled at 10 |
| SAVED-02 | Saved Teams head: count (N/10) and where it's stored (accou… | page not built yet | Saved Teams storage line ("Saved to your Claude account…" / "this browser only") and "← My Team" not built (r4 to-build list). | page doesn't show /Up to 10 teams\. Saved to your Claude account and kept in step across your devices\./ |
| SAVED-03 | Sort Recent \| Name \| Readiness; "Name" is alphabetical | passes now (test updated Nov 12) | Was: Intended wording (word list): sort reads Newest \| Name \| Matchups, test wants Recent \| Name \| Readiness. **Nov 12:** New build: Newest \| Name \| Matchups; "Newest" is the default, "Recent"/"Readiness" are absent, Name is alphabetical, Matchups sort keeps 3 cards and is marked. Mutation proof: label "Recent" -> FAIL. | Recent not default |
| SAVED-04 | Saved team card: name, six tiles, Strength Score badge or "… | passes now (test updated Nov 12) | Was: Wording only: partial card reads "2 of 6 picked", test wants "2/6 Pokémon". **Nov 12:** New build: partial card must read "Two Garchomp Incineroar Empty Empty Empty Empty 2 of 6 picked Open …". Mutation proof: "2/6 Pokémon" -> FAIL. | partial card doesn't show /2\/6 Pokémon/ |
| SAVED-07 | ⋯ → Team poster opens the share box with that team's poster | passes now (test updated Nov 12) | Was: Adapter out of date: the build has "Team Poster" on each saved card, but the adapter only maps Open/Copy/Rename/Delete and throws "not in v2 yet". Real behaviour not tested. **Nov 12:** Adapter now maps "Team poster" (aria-label "Team poster of <name>"); no test text changed. Poster 1080×1350 for Rain test. Mutation proof: label renamed -> FAIL (nothing to tap). | not in v2 yet: saved team action Team poster |
| SAVED-08 | Compare on two saved teams opens Compare with both | passes now (test updated Nov 12) | Was: Adapter out of date: the build has Compare on each saved card, but the adapter throws "not in v2 yet". Real behaviour not tested. **Nov 12:** Adapter now maps "Compare". New build expects "Pick one more saved team, or Compare with My Team · Cancel" (Title Case). Mutation proof: "Compare with my current team" -> FAIL. | not in v2 yet: saved team action Compare |
| SAVED-09 | No saved teams: Darkrai, "No saved teams yet…", "Open My te… | real failure (open, left failing) | Was: Empty Saved Teams wording differs ("No saved teams yet. Tap Save Team on My Team…"); Darkrai is cut by decision and the "Build me a team" step needs the Build page, so it can't pass yet either way. **Nov 12:** Not changed. Empty Saved Teams wording differs ("No saved teams yet. Tap Save Team on My Team to keep this six."), Darkrai is cut, and the sheet has no "Open My team" / "Build me a team" buttons; the empty-state design (and the Build page) is open, so the test is not rewritten. | page doesn't show /No saved teams yet\. Open My team and tap Save team, or let NastyPlot build six for you\./ |
| CMP-03 | Team picker: My Team (greyed when already A), saved teams, … | page not built yet | Picker lacks "Any other tournament team: tap Compare on its card in Winning Teams" (waits for the Winning Teams page). | picker doesn't show /Any other tournament team: tap Compare on its card in Winning [Tt]eams/ |
| PKMN-01 | Info sheet opens from Home; ✕ and Escape close it, focus re… | page not built yet | Starts from a Home tile (Home not built); the info sheet itself exists. | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-02 | Hero: rating numeral, "<letter> tier, #N of M with results"… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-03 | Add to team fills the first empty slot ("On your team" afte… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-04 | Tabs Info \| Meta \| Rating: last tab remembered; arrow keys … | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-05 | Info tab: usual set, base stats, abilities with "Most used"… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-06 | Meta tab: typical set, moves and items with %, "Brought wit… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-07 | Rating tab: "Why it rates N", four bars, What the Data Says… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| X-02 | First visit: sample six "Sun Tailwind (sample)", saved and … | page not built yet | First-visit sample note ("This is a sample team…") not built on My Team (r4 to-build list). | page doesn't show This is a sample team |
| X-03 | Toasts: Undo puts the team back ("Change undone"); plain co… | passes now (test updated Nov 12) | Was: Intended change (Sim, Nov 11): toasts carry no Darkrai; Undo and "Change undone" pass first. Test not updated. **Nov 12:** New build: Undo / "Change undone" as before; then, while the "Team cleared" toast shows, it must carry NO picture (null = no toast showing also fails). Mutation proof: a picture added to toasts -> FAIL. | no Darkrai on the confirmation |
| X-07 | Folds and views stay as left after reload (Game Plan, Types… | page not built yet | Game Plan / Types folds not built. | no fold titled Game Plan (not in v2 yet) |
| X-09 | A saved team name keeps its own casing ("rain test") | passes now (test updated Nov 12) | Was: Name casing passes; fails on the "Your Six" heading, removed on purpose (as TEAM-08). Test not updated. **Nov 12:** New build: casing checks unchanged; "Your Six" must be ABSENT and the opened team's six tiles drawn. Mutation proof: a visible "Your Six" -> FAIL. | page doesn't show Your Six |
| X-12 | Long paragraphs show the first sentence and "More" | page not built yet | How Scoring Works fold not built. | no fold titled How Scoring Works (not in v2 yet) |
| X-13 | Links out of this scope still work: replay "Paste its log" … | page not built yet | "Paste its log" (Battle) and How We Calculate not built. | nothing to tap: text Paste its log |

## Known (6)
- HOME-05b  This week chip's rating matches the info sheet it opens  -> not in v2 yet: Home page (This week in the ratings)
- MU-05c  Threat sheet "Best fix" never offers a change that doesn't raise the score  -> nothing to tap: #main [data-muthr="Archaludon"]
- SAVED-02b  Saved Teams shows how many of the 10 places are used ("2/10")  -> Saved Teams doesn't show /2\/10/
- CMP-04b  Compare lists Speed control as a note, not a counted team check  -> Speed control shown as a team check row
- HOME-11b  Sample note "Build your own" on My Team opens Build  -> nothing to tap: text /^Build your own$/
- HOME-10b  Home empty tile "Add a Pokémon to slot N" opens the add box for that slot  -> nothing to tap: label Add a Pokémon to slot 3

## Fixed? (4): marked known for today's site, pass on the new build
- TEAM-13b  Empty team: the ⋯ menu hides Export and Clear team (only Import stays)  -> marked known (inventory says Export and Clear team are hidden with an empty team; today they still show in the ⋯ menu (inventory or code is wrong: Sim to decide)) but passed: remove the mark
- SUG-03b  Swap my Mega? choice is kept after reload (like Megas on team)  -> marked known (inventory #22: "Swap my Mega?" is a hidden checkbox and resets on reload while "Megas on team" is saved) but passed: remove the mark
- MU-05b  Threat sheet ring shows the Strength Score number and band, not the old letter  -> marked known (inventory #15: the threat sheet ring still shows the old letter ("B 82.5") instead of the Strength Score and band word) but passed: remove the mark
- EDIT-07b  Item toast uses today's words (matchups), not the old "ready for N%" readiness  -> marked known (inventory #20: item toast still says "ready for 85% → 87% of the top threats") but passed: remove the mark

## Skipped (2)
- TEAM-18  Weather backdrop behind a sun team's header  (decorative animation on the old header, mostly covered by the arena layout (inventory unsure it shows); needs a visual check, not a behaviour test)
- X-01b  A change on another device arrives live ("Updated from your other device"), waiting while you type  (needs two signed-in devices sharing a real account; the kit's fake account has no live updates from another device)
