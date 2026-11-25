# Known failures on the new site, sorted (look-only, Nov 17)

Build: `node build.mjs --v2 --art=../src/v2/art/` on claude/design6 (HEAD 469667c6), page copied to this folder as v2.html.
Runs: `PAGE=v2.html ADAPTER=v2 node app/test/behaviour/run.mjs <group>` for all four groups (outputs run-*.txt here).
Probes: probe.mjs, probeD.mjs, probeE.mjs, probeF.mjs here (Playwright through the same harness and adapters; nothing in the repo changed).

Categories: (a) real gap on the new site; (b) test written for the old site's design or wording, the new site does it differently on purpose
(or does the same thing in other words); (c) adapter gap: the feature is there, the test can't reach or read it.
"checked (how)" = run or read; "pending Sim" = a design question parity-nov15.md item 3 still lists as open (no later decision found in decisions.md).

Known-list sources: known-v2.json (B-build 31, D-meta-shell 45) plus in-test `known:` marks that apply on both sites
(A-team 4: MU-05c, SAVED-02b, CMP-04b, HOME-10b; B-build 2: SUGG-07b, SUGG-14b; D 2: BROKEN-10, SHELL-16).
Totals: A 4, B 33, C 0, D 47 = 84.

## Run results (checked: full runs, this build)
- A-team: 137 pass, 1 FAIL, 4 known, 2 skipped (892 s). The FAIL is NOT on the known list: EDIT-12 "the name box is not focused (focus on
  'Team name, up to 40 characters')". The test wants the label exactly 'Team name' (A-team.mjs:653); commit 808e0f25 (Pre-launch 6a-6e,
  "team names show N/40") changed the aria-label. Test or label needs a one-line fix, or CI stays red.
- B-build: 58 pass, 0 FAIL, 33 known. C-battle: 83 pass, 0 FAIL, 0 known, 4 skipped. D-meta-shell: 112 pass, 0 FAIL, 47 known, 7 skipped.
- 0 "FIXED?" in any group. Every known entry failed with the message its row quotes.

## Counts (main category per entry; "b + a" counted as b, its real part listed under (a) below)

| Group | (a) real gap | (b) old-site design/wording | (c) adapter gap | Total |
|---|---|---|---|---|
| A-team | 2 | 1 | 1 | 4 |
| B-build | 3 | 27 (3 with an (a) part; ~10 wait on Sim's All Suggestions sheet design) | 3 | 33 |
| C-battle | 0 | 0 | 0 | 0 |
| D-meta-shell | 1 | 41 (2 with an (a) part; 5 with a (c) part) | 5 | 47 |
| All | 6 | 69 | 9 | 84 |

## (a) real gaps, ranked by how much a player would notice (each a separate small fix)
1. Suggestion cards never say "To catch" / "In your box" for the incoming Pokémon (COV-04, SUGG-04; also behind COV-03). Default pool is
   Box + Catch, so every suggestion can name a Pokémon the player doesn't own, with no warning. Today's site tags it. Small.
2. Home's empty "+ Add a Pokémon, slot N" tiles open the site Search, not the Add box for that slot (HOME-10b). This is the first thing a player with an empty team taps. Small.
3. Add Protect changes up to four movesets with no Undo (SUGG-07b, shared logic, both sites). Small.
4. Header search ranks items above the Pokémon: "garch" → Garchompite Z, Garchompite, then Garchomp (JUMP-03; came with the Nov 17 moves/items search). Small.
5. Apply on My Team makes the page jump about 100-120 px (SUGG-09: Suggestions top 300 → 198/179) when the sections above change height. This breaks Sim's keep-your-place rule. Small.
6. The new-regulation line dropped "N Reg M-D events so far, switches at N" (SHELL-05). Reg M-D started Nov 8, so this shows now. Small.
7. Compare lists Speed control, Spread damage and Lead support as ✓/✗ check rows, the same as the 4 counted basics (CMP-04b; the word list says they are notes). Small.
8. The Mega-over-goal note says 'Turn on "Let plans swap my Mega"', but the new control is "Swap my Mega?" No/Yes (SUGG-15). Tiny.
9. Cores can't be found in search ("core" → Encore, "cores" → nothing) (BROKEN-10 part). Small.
10. No × of the site's own in the Build-around / cores boxes (X-05). Chrome draws one. I'm unsure whether iPhone Safari does. Small, low impact.

## Side finds (not on the known list)
- EDIT-12 FAIL (above).
- Gap note text starts "None. Opposing sun or rain…" (the Weather row's own text), so v2 shows "Note: None. …" (shared 29-fix-planner.js:262).
- Pokémon page: "Report a Mistake ›" sits inside folded part 6, so it's hidden until opened. The Ratings list doesn't mark early reads (only the page does).
- Several known-list reasons are out of date: AUTO-03/04, BUILD-07 and SUGG-02 say "feature not built yet", but Plan settings is on My Team since Nov 15-16. COV-05, NAV-08, JUMP-04 and SHELL-07b say "possible real bug", but none is confirmed (see rows).
- The given build flag --art=../src/v2/art/ points at /home/user/pokelair-data/src/v2/art (doesn't exist; the art is in app/src/v2/art). Sprite paths in v2.html read "../src/v2/art/…". No test result depends on it.

## A-team (4)

| ID | What it checks | Cat | Evidence | Fix idea (a only) |
|---|---|---|---|---|
| MU-05c | Threat sheet "Best fix" never offers a ±0 change | c | Run: "nothing to tap: #main [data-muthr="Archaludon"]". Probe (fresh sample team): visible threat rows are Charizard-Mega-Y, Farigiraf, Salamence-Mega, Indeedee-F, Raichu-Mega-Y, Volcarona, Sinistcha, Golisopod-Mega; Archaludon isn't one. The rule itself is in v2: matchups.js:100-102 shows Best fix only when it raises the score. | Test/adapter: open a threat that is shown (or All 30 first); then the v2 mark can go. |
| SAVED-02b | Saved Teams shows "2/10" | b | Probe: head reads "← My Team · 2 of 10 saved" (both account and browser-only). Count is visible, only the format differs. | |
| CMP-04b | Compare shows Speed control as a note, not a counted check | a | Probe: Compare rows "Speed control ✓ ✗", "Spread damage ✓ ✓", "Lead support ✓ ✓" in the same ✓/✗ grid as the 4 basics (compare.js:16 `ck`, row labels from shared cxFacts). Word list (CLAUDE.md, Nov 9): these 3 are notes, not counted. My Team already splits them (sugs.js:163-164). | Mark the 3 note rows "note, not counted" or group them under a Notes line in Compare. Small. |
| HOME-10b | Home empty tile "Add a Pokémon to slot N" opens the add box for that slot | a | Run: "tile opened home without the slot-3 add box". Probe: the tile is `<button class="ff add" data-v2search aria-label="Add a Pokémon to slot 3">` (home.js:27); a real click opens the site Search (pages list, "Find a Pokémon, move, item…"), not the Add a Pokémon box, and the slot number is ignored. No Sim decision found. Same gap on today's site (inventory #17). | Open the Add a Pokémon sheet for that slot (V2.openAdd(i), six.js) from the tile. Small. |

## B-build (33)

| ID | What it checks | Cat | Evidence | Fix idea (a only) |
|---|---|---|---|---|
| X-01 | Back from All Suggestions returns to Build at the old scroll spot | b (+c) | All Suggestions is a sheet over My Team (decisions.md Nov 11 "All Suggestions is a sheet over My Team"), so Build → All Suggestions passes through My Team and Back lands on My Team ("report"). Scroll restore itself works with real taps: probe Build y=700 → tap My Team tab → Back = #build y=700. The adapter changes pages by setting location.hash with no tap, and v2 saves the scroll only on a tap/pagehide (shell.js:378-380, Sim Nov 14 iPhone scroll-bar fix), so hash-only navigation always comes back at 0. | |
| X-05 | Site's own × in Pokémon boxes empties the box and keeps the keyboard up | a | Build around / cores boxes are type="search" with no site ×; Chrome draws its own (::-webkit-search-cancel-button display:block, probe); Esc empties (build.js). No Sim decision found. I'm unsure whether iPhone Safari draws a × in these boxes. | Add a small × button inside the field (keeps focus). Small. Low impact (the pick itself has a × chip). |
| X-06 | Name box: no-match line, Esc closes only the list, Enter picks | b | Probe: no-match reads "No Pokémon called “zzqx”." (build.js:24) instead of "No matches. Try fewer letters."; Esc closes the list and also empties the box; Enter picks; ArrowDown moves into the list; Megas are listed now. Wording/behaviour of the new box, not a missing feature. | |
| X-08 | Title Case headings incl. "One Pokémon In, One Out" on All Suggestions | b | Build headings pass; the All Suggestions sheet is one list with no "One Pokémon In, One Out" section (sugs.js:117-125). Pending Sim (parity-nov15 item 3: sheet design). | |
| AUTO-03 | Tiny box note; Never-suggest Pokémon never built in | c | Tiny-box note passes (same check passes in AUTO-14). Second half calls adapter `neverSuggest`, which throws "not in v2 yet" (v2.B-build.mjs:385). Never Suggest exists: My Team "Never Suggest ›" sheet with Add / Allow Again (sugs.js:249-265, Sim Q3 A Nov 15). Known-list reason "not built yet" is out of date. | |
| AUTO-04 | Megas 0 rebuilds with warning toast; one Megas value on all pages | c | Fails at `area('Plan settings')` (adapter NO_AREA). Megas is one shared slider (sgmega) on My Team and Build (sugs.js:10); there is no separate Plan settings copy to disagree. | |
| AUTO-07 | Busy state with the spinner line, then a card | b | Probe: busy/disabled works; line is "Building from real winning teams…" (build.js:47), test wants "Building your teams… checking each against the top 30 threats." Wording. | |
| AUTO-13 | Copy for Showdown copies six blocks | b | Probe: 6 blocks copied; toast "Team copied for Showdown" (build.js:82, same words site-wide); test waits for /Copied/ (capital C, case-sensitive). | |
| AUTO-15 | Recent winners fold heading "3 winning teams, full sets, ready to load" | b | Probe: "Start from a Recent Winner 3 teams · full sets, ready to load" (Blueprint "Reference sheets"). Everything else in the test passes before this last check. Wording. | |
| BUILD-04 | A locked Pokémon is never swapped out | b | Fails tapping "Whole roster" inside the sheet: the sheet has no pool switch (follows My Team's Suggest from). Probe with My Team set to Whole Roster: no "Rillaboom →" in the sheet; adding a core kept locked Rillaboom. Lock rule works. | |
| BUILD-07 | Plan settings: Pick from, Swap my Mega, Count abilities, Refresh, Never suggest | c (+b) | Adapter helpers throw "not in v2 yet" (v2.B-build.mjs:381-386). All five exist on My Team since Nov 15-16: Suggest from, Megas, Swap my Mega?, Count abilities? (Sim Q6), Refresh Suggestions, Never Suggest sheet (sugs.js:7-24, 249-265). Toast words differ ("Suggestions refreshed", "Not counting abilities: types only"; test wants "Plans refreshed", "Plans updated") and there is no "1 excluded" count. | |
| COV-01 | All Suggestions head: kicker, hint, ← My Team | b | Probe: "18 suggestions / All Suggestions / The ones on My Team first, then every other change…" (sugs.js:123-124); back is the sheet's ✕. Pending Sim (sheet design). | |
| COV-03 | Suggest from inside All Suggestions, remembered separately (cc2.recsrc) | b | The sheet has no controls; one Suggest from on My Team (audit/B-home-build.md COV-03: duplicate removed, "confirm with Sim"; parity-nov15 item 3 pending). Related real gap: see COV-04 ("To catch"). | |
| COV-04 | "Pokémon to Add" / "One Pokémon In, One Out" cards with details | b + a | b: one list, compact cards, button "Apply" (pending Sim). a: the cards never say whether the incoming Pokémon is in your box or must be caught. Today's plan rows tag "TO CATCH" (29-fix-planner.js:368); v2 cards show sprite + name only (sugs.js:35). Default pool is Box + Catch, so "Rillaboom → Basculegion" doesn't tell the player they need to catch it. Quick add picks do tag it (sugs.js:145). | Add the "To catch" (and "In your box") tag beside the incoming Pokémon on suggestion cards (My Team and sheet). Small. |
| COV-05 | Apply in the sheet: stays on the page, toast "Added …", Undo | b | Probe: Apply closes the sheet (sugs.js:135 `if (fromAll) V2.closeSheet(true)`, since the first build Nov 11 commit 1ea6f32f), My Team shows "Applied … Undo" bar, toast "Applied: Mega Metagross and Glimmora". Undo works. Deliberate (A6 one message per Apply). Known-list "possible real bug" not confirmed. | |
| COV-06 | 3 cards, "N More Swaps · Showing 3 of N", More suggestions | b | Sheet shows My Team's cards + 12, then "Show 12 More ›" (sugs.js:125, 129). Pending Sim. | |
| COV-07 | Nothing improves: note pointing to Whole roster | b | Probe after Apply: My Team shows "Nothing to fix…" card; sheet lists one ±0 option. Old note text (23-coverage.js:130) not used in v2. | |
| COV-08 | Too few Pokémon: note and Go to My team | b | Probe: with one Pokémon, My Team and the sheet both suggest "+ Kingambit + Volcarona" instead of "Add at least two Pokémon…". Behaviour change, not a missing feature. No Sim decision found; I'm unsure it was deliberate (looks harmless). | |
| COV-09 | Game-plan gap note on All Suggestions | b | Probe: note shows on My Team ('Nothing in your box fixes it without weakening the team: try "Box + catch" or "Whole roster".'); the sheet shows no notes. Pending Sim. Side find (shared text, both sites): the note starts "None. Opposing sun or rain…" (the Weather row's text), so v2 reads "Note: None. …". | |
| COV-11 | Bigger plans fold with settings and hint | b | No Bigger plans fold; one list (sugs.js:117-125). Pending Sim. | |
| COV-12 | How Scoring Works at the bottom of My Team | b | Moved to the end of "Why this score?" (team.js:476, decisions.md Nov 12 ~12:47 PM, Sim). Probe: My Team page text has no "How Scoring Works". | |
| SUGG-02 | My Team sliders and Plan settings are the same settings | b | There is only one set of settings (My Team's "Adjust suggestions", sugs.js:7-12), so there is nothing to keep in step. | |
| SUGG-04 | Bigger plans card: rows with team counts, set line, "Apply suggestion N" | b + a | b: compact card (pending Sim). a: same "To catch" gap as COV-04. | (see COV-04) |
| SUGG-07b | Add Protect toast offers Undo | a | Run: "the toast offers no Undo". Shared logic, both sites: LANE.protApply (app/src/app/36-lanes.js:58-62) changes four sets and calls toast(…, true) without storing an undo step, so bridge.js:19 / 06-helpers.js:136 add no Undo (they need ui.undo). Changing four movesets with no way back. | Push an undo step in protApply before changing the sets (as applyPlan does). Small. |
| SUGG-09 | Apply keeps the place under the finger | a | Probe (1280×900): Suggestions top 300 → 198 after Apply (run: 300 → 179); no Apply button after (Nothing to fix). The sections above change height after the swap and the redraw only keeps scrollY (shell.js:291-292), so the view jumps ~100-120 px. Sim's keep-your-place rule. | After Apply, keep #tm-sg's top where it was (scroll by its top delta). Small. |
| SUGG-10 | Undo bar on My Team and inside Bigger plans | b | Probe: bar on My Team; the sheet has none (no Bigger plans). Applying from the sheet closes it, so the bar is then on screen. Pending Sim (parity item 3 lists "Undo bar"). | |
| SUGG-12 | Bigger plans "More suggestions" adds 3 | b | "Show N More ›" adds 12 (sugs.js:125,129). | |
| SUGG-14 | Bigger plans no-plan note "(it's at N)" | b | After Apply, My Team shows Nothing to fix; the sheet lists the ±0 option with Apply (A3: swaps wait behind See all). No Bigger plans note in v2. | |
| SUGG-14b | No-plan note uses the shown score; no early "no change" verdict | b | Run: no "(it's at N)." note: the sheet has no Bigger plans no-plan note at all; after Apply it lists "Suggestion 1 ±0 (91 → 91)". Both bugs the mark describes (decimal score, early "no change" verdict) belong to the old note, which v2 doesn't draw. The v2 half of the test can't fail as written. | |
| SUGG-15 | Mega-over-goal and gap notes on My Team and All Suggestions | b + a | Probe: both notes show on My Team; the sheet shows none (pending Sim). a (tiny): the note says 'Turn on "Let plans swap my Mega"' (29-fix-planner.js:264) but v2's control is "Swap my Mega?" No/Yes (sugs.js:11); audit/B-home-build.md SUGG-15 noted it. | On v2 say 'Set "Swap my Mega?" to Yes'. Small. |
| SUGG-16 | Fix your items first: Item Clause card, Give X Y, Undo | b | Moved to My Team (decisions.md Nov 15 5:31 PM). Probe: My Team shows "Fix Item Clause: Garchomp and Incineroar both hold Sitrus Berry… Give Incineroar Chople Berry". Test looks in the sheet. | |
| SUGG-17 | Set check tips "X: Y instead of Z", Use Y | b | Moved to My Team (decisions.md Nov 15 5:39 PM: "SUGG-16 / SUGG-17 still fail test-side"). Probe: "Tip Garchomp: Choice Scarf instead of Big Root (item)… Use Choice Scarf". Note line reads "Tips come from what players run, not from the Strength Score." | |
| SETS-08 | Ways into Popular Sets incl. Nothing-to-fix "Sets" button | b | Probe: the link is "Popular Sets ›" (Sim, Nov 14 naming); test taps /^Sets$/. | |

## C-battle (0)

None on the list. Checked: run 83 pass / 0 FAIL / 0 known / 4 skipped.

## D-meta-shell (47)

| ID | What it checks | Cat | Evidence | Fix idea (a only) |
|---|---|---|---|---|
| NAV-01 | Main tabs show live "x/6" | b | parity-nov15 "Decided under Claude's authority": My Team's own header says "x of 6"; header tabs stay as Sim approved. | |
| NAV-03b | ⋯ button "on" outside the five tabs | b | No ⋯ menu (Sim Nov 11 "never a sixth menu place"; batch 17 Nov 16: old-site tests updated to the new design, NAV-03v covers it). | |
| NAV-04 | This Week has no section switch | b | This Week is the 4th Tournaments view (Sim Q8, Nov 15), so it has the switch. | |
| NAV-05 | Tournaments slider = Winning Teams, Events, Archetypes | b | Same: "This Week" is the 4th item (Q8). | |
| NAV-06 | "← Meta" back links on This Week, How We Calculate, About, Track Record | b | v2 uses the header Back button (Sim Nov 12, shell.js:362-387), no in-page back links. | |
| NAV-08 | Back to the same scroll; closes sheet first; no page in the address | b + c | c: scroll — adapter navigates by hash with no tap; with real taps Back restores (probe: Ratings y=701 → tap Build tab → Back = #meta y=700). b: v2 keeps the page in the address on purpose (reload reopens it, BROKEN-04 passes); the Pokémon sheet is now a page (decisions.md Nov 15 3:24 PM). Known-list "possible real bug" not confirmed. | |
| NAV-10 | Keyboard focus stays inside an open Pokémon sheet | b | The sheet became the Pokémon page (Nov 15 3:24 PM); a page shouldn't trap focus. | |
| NAV-11 | Each section has its own colour | b | One accent (--plot) for all sections (parity-nov15 "Deliberate differences Sim approved"). | |
| JUMP-02 | Empty search lists 14 tools labelled "Tool" | b | Probe: lists places labelled "Page" with a description each ("Home · Start here", "Build · …"). Wording/count of the new search. | |
| JUMP-02b | "Tool" label hidden on phones | b | Probe at 390: "Page" label shows. New design. | |
| JUMP-03 | "garch" → Garchomp first, "Rated N, #N of M, Dragon/Ground"; saved team; accents; Nothing matches | b + a | b: row reads "92 · S tier Dragon Ground"; no-match line "Nothing called “zzzq”. Try part of the name."; saved team and accents work (probe). a: "garch" lists Garchompite Z and Garchompite (items, added Nov 17 8:12 AM player review 2c) above Garchomp; a player typing a Pokémon's name gets items first. | Rank Pokémon (and places) above moves/items/Abilities when the query matches a Pokémon name. Small. |
| JUMP-04 | Arrows + Enter, tools, saved team, Esc, backdrop | b | Probe: first ArrowDown moves focus onto the first result (the one Enter already picks), the second moves on; Enter on a Pokémon opens its page, not Ratings with a sheet. parity-nov15 "Unsure / left as is". Known-list "possible real bug" not confirmed. | |
| THEME-01 | Day/Night saves cc2.theme and matches the menu picker | b | v2 saves np2.theme and has no menu picker (known-list note; THEME-02v covers the new design and passes). | |
| SHELL-02 | Desktop header order incl. "More pages" | b | No ⋯ menu (Nov 11). | |
| SHELL-02b | Phone header incl. ⋯ | b | Same. | |
| SHELL-04 | Stale-data note names "Events, last updated <date>" on Home/Meta only | b | Probe: note shows on Home, Ratings, Events, This Week, not on About / My Team; it groups stale sources by day in lower case ("…; events, last updated Nov 8") (decisions.md Nov 15 6:15 PM). Test regex wants "Events, last updated". | |
| SHELL-05 | New-regulation banner with start date and "3 Reg M-D events so far, switches at 20" | a | Probe: "New regulation: Reg M-D started Nov 8, 2026. Numbers are from Reg M-C until there's enough Reg M-D data; the two are never mixed." The event count and switch point from today's banner (43-data-health.js:21) are not in v2's line (shell.js:197). Wording difference is fine; the progress count is lost, and Reg M-D is already running. | Append "N Reg M-D events so far, switches at N" (or the ladder line when 0) to V2.dataNote. Small. |
| SHELL-06 | Footer tagline, disclaimer, sources, Privacy fold | b | Probe: footer says "fan‑made" with a no-break hyphen (U+2011), so the test's "fan-made" doesn't match; Sources and Credits present; Privacy opens About's "Everything We Save", not a "Privacy" fold (approved info-page drafts, Q12, parity-nov15). | |
| SHELL-07b | Plain toast goes after ~2 s | b | All toasts last 4 s (shell.js:41), Undo toasts 6 s. parity-nov15 "Unsure / left as is". Not a missing feature. | |
| SHELL-09 | "?" tip has a small picture | b | Darkrai cut; "the '?' bubble has no mascot" (decisions.md Nov 11). | |
| SHELL-11 | Footer disclaimer folds to More/Less | b | New footer (Sim Q2 A, Nov 15) shows the one-sentence disclaimer whole. | |
| SHELL-13 | Usage source picker slides | b (+c) | Adapter has no `sliderMoved`; but the Usage source is a chip group (ra-chip, aria-pressed), not a slider (probe), so the check doesn't apply. The source change itself passes before it. | |
| SHELL-15 | "Details" shows sample sizes, label "Hide details" | b | Ratings has a view switch Grandstand / List with win rates (Grandstand, Sim's pick Nov 14). | |
| SHELL-17 | Welcome card words incl. "How NastyPlot works" | b | Approved first-visit mock-up words (parity-nov15). | |
| SHELL-20 | Feedback dialog names the page | b | Send Feedback is its own page (Q12): "Saved with the page you came from, phone or desktop, and the date." It doesn't print the page name. | |
| SHELL-20b | "Report a mistake" on the Pokémon sheet | c | It exists: pokemon.js:124, inside part 6 "Why it rates N", which is folded by default (decisions.md Nov 15 5:31 PM). Probe: "Report a Mistake ›" present, not visible until the part opens. | |
| SHELL-21 | Owner panels on Home | b | Owner data moved to #owner (parity-nov15, Sim: recommended); footer has an "Owner" link. | |
| SHELL-23 | Saved Teams says "Saved to your Claude account" | b | Probe: "Up to 10 teams. Saved and kept in step across your devices." (browser-only: "Saved in this browser only."). Wording without "Claude" (fits the public-launch rule). | |
| SHELL-24 | Shared link banner: "Not now" / "Load it" | b | Probe: sheet "Shared team … Open it as your team? Undo brings yours back." with "Load Team" / "Not Now". Wording. | |
| SHELL-28 | Darkrai on empty screens | b | Cut by Sim (Nov 11, CLAUDE.md). | |
| SHELL-32b | Page fades in on switch | b | No page fade in v2; parity-nov15 "Unsure / left as is". Only a guard for SHELL-32. | |
| RULE-RATING-ONE-NUMBER | Same rating on Ratings, sheet, search, Popular Sets | b (+c) | Rule holds (probe, Incineroar): Ratings 96, Pokémon page 96, search "96 · S tier", Popular Sets "96 S tier". Test fails closing the page with ✕ (it's a page) and its readers expect "Rated N" / "X tier, rated N". | |
| SHEET-01 | Sheet closes with ✕ / backdrop / Escape / Back | b | Pokémon page, not a sheet (Nov 15 3:24 PM); Back works. | |
| SHEET-02 | Header: "X tier, #N of M with results", types, % of teams, win rate, games | b | Probe: "#3 of 321 with results", "96 S tier", "35% of teams", "51% win rate", "27,422 games" all present, in a different order. | |
| SHEET-02b | Phone sheet fits the screen | c | Probe at 390: no page side-scroll (document 390); the "cut" items are inside the deliberate swipe rows pk-jumps and pk-fan (decisions.md Nov 15 5:31 PM: phone partners and jump links are swipe rows); .pk scrollWidth 398 vs 390 from those rows. | |
| SHEET-03 | Tabs Info / Meta / Rating, last tab remembered | b | One page with parts, no tabs (Sim, "A one page, the sheet retires"). | |
| SHEET-03b | First visit opens on Info | b | Same (no tabs). | |
| SHEET-04 | Info: Usually, Full set ›, Base Stats, "Most used, N%", weaknesses, speed | b | Probe: Usually, Typical set, Base Stats, "Intimidate (100%)", "2× weak: Water, Fighting, Ground, Rock", "Speed at Level 50 … outspeeds 10% of the top 30" present; no "Full set ›" (set shown inline). | |
| SHEET-06 | Rating part: Why It Rates, bars, What the Data Says + Limitless, other lists | c | Probe: "Why it rates 96", all four bars present; "What the data says" and the sources are inside folded part 6 (folds by design). Adapter reads before opening it. | |
| SHEET-07 | Add to team, Build around it, Popular Sets | b (+c) | Test closes with ✕ on a page; the actions exist ("Build Around It", "Popular Sets", "On your team ✓", "Your team is full…" seen in probes). | |
| EVT-02 | Calendar 4 rows, "N on the calendar", Show all N | b | Sim Q18 (Nov 15, answered "recommended is good for all"): keep 2 rows, no "N on the calendar"; probe: "Show All 30 ›". | |
| EVT-04 | 12 event cards, "Show more (N left)" | b (+c) | Probe: 13 = the latest result + 12 tickets (Q18), button "Show More · 100 left ›". | |
| ABOUT-02 | Eight folds incl. "Privacy", not remembered | b | Probe: 7 Fine Print rows + "Everything We Save" (approved Q12 info-page drafts; parity-nov15 lists ABOUT-02 as approved). | |
| ABOUT-04 | Footer "About & Legal" opens About at the top | b | Probe: footer link reads "About" (#about); Contact works. Wording. | |
| ABOUT-05 | Rules caption under legality statements | c | Probe: caption shows on My Team after opening Things to Know (sugs.js:168 regNote) and on the items card; adapter only looks with the fold closed and taps an "Import" that isn't on My Team with a full team. | |
| BROKEN-10 | Search finds every old menu page by its menu name | b + a | Probe: 20 of 24 found; missing "Build for Me", "Build Around a Core", "Battle a Team", "Pokémon Ratings" (old names: new ones are Build, Battle, Meta). a (small): nothing finds the cores at all ("core" → Encore, "cores" → nothing); audit/B-home-build.md CORES-13 noted it. | Add a "Cores" place in search that opens Build's Cores tab. Small. |
| SHELL-16 | A rarely used Pokémon's sheet says "Early read" | c | Probe: Flapple's page shows "Rating · likely 2–32 · early read". Test fails earlier because the v2 adapter's boardTiles has no `est` flag. Minor: the Ratings list itself doesn't mark early reads. | |
