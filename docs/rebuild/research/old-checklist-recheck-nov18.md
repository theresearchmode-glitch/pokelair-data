# Old Rebuild Checklist: six "unsure if still open" items, rechecked on the new site

Written: time: 11:28 PM (11:28:48)  date: Tue Nov 17, 2026 (Eastern, from `bash docs/rebuild/now.sh`; the file name keeps the
"nov18" asked for). Look-only: no site code changed. Branch claude/design6 at 0e2dc5c5.

Items: i15, i17, i21, i39, i41, i45 from docs/rebuild/history/rebuild-checklist-export-nov18.json (all last noted Nov 13).
Paths are under app/src/v2/ unless they start otherwise.

## How it was checked
- Code: read pages/build.js, build-sheet.js, sugs.js, team.js, pokemon.js, feedback.js, meta.js, stampede*.js, shell.js, head.html,
  and the old site's app/src/app/22-auto-build.js and 53-feedback.js for the old behaviour.
- Looked at the page: `node build.mjs --v2 --preview-data`, then Playwright (Chromium, one browser at a time; scripts in the
  session scratchpad, not committed): Home, Search, Day/Night, Meta Ratings with Megas, the Pokémon page, Build, All Suggestions.
- Behaviour tests on the frozen-data art build (out/ from 0c992f69, `--art=../src/v2/art/`, copied to app/dist/art.html,
  out/ restored with `git checkout HEAD -- out/`; `git status` clean afterwards).

| Item | Verdict |
|---|---|
| i15 Build result card extras | PARTLY (most extras still missing; two parts settled by Sim) |
| i17 All Suggestions card facts | PARTLY (In your box / To catch fixed; the rest waits on Sim's sheet design) |
| i21 Site menu, Auto theme, reachability | PARTLY (menu moved by Sim's design; all three places reachable; no way back to "follow the device") |
| i39 Report a Mistake on the Pokémon page | PARTLY (back and working; it sends only the name, not the numbers the old one sent) |
| i41 Flaky Build test X-10 | DONE |
| i45 Megas ranking on Meta | DONE |

## i15: Build result card extras: PARTLY
Old list (audit/B-home-build.md lines 41, 45, 47, 51): Sets and roles fold, "Few real games back this mix", catch tip,
"X isn't in your box", two-weather warning, plan chips beyond 3, proven-team note, "N in your box" line, Megas 73%/81% tip.
The Build answer is now Sim's Blueprint sheet (build-sheet.js; brief docs/rebuild/mocks/build-blueprint/BRIEF.md, Sim's pick,
decisions.md line 858). Checked by code and on the page (a Whole Roster build, 4 options; result text read in Playwright).

- Sets and roles fold: STILL OPEN in part. Each figure shows item and tier, plus "to catch" / "off-meta" (build-sheet.js
  `V2.bpFig`, lines 15-20). No Ability, no confidence chip, no type words (checked: not in the sheet text). Role labels were
  removed on purpose: MOVED BY DESIGN (Sim, decisions.md line 1229, Nov 17 6:18 AM: role headings "make it more confusing").
  The AUTO-08 test comment says Abilities are not shown "(reported)"; I found no Sim decision dropping Abilities (unsure).
- "Few real games back this mix": PARTLY. Not on the sheet (checked: not in the text). The same fact sits one tap away:
  Build's "Why This Score?" opens `V2.whyHtml` (build.js line 153), which prints "How sure: Low. Few real games back this exact
  mix…" when it is low (team.js line 366). Checked in code only; the team built here was not Low, so not seen on screen.
  My Team shows the note on its hero (team.js line 414); Build does not.
- Catch tip ("Best single catch…" / "To reach 90+…") and "X isn't in your box: the best one to catch": STILL OPEN. The shared
  engine still writes them into each team's `why` list (app/src/app/22-auto-build.js lines 120-121, 231, 250), but the new
  sheet reads `t.why` only for the best-trio line (build-sheet.js line 12, build.js line 64 regex), so they are never shown.
  Checked: grep finds neither text in app/src/v2; the build's `why` lines were read in the page (`__ev`).
  Today's equivalent: only the "N to catch" / "All six are in your box" line (build-sheet.js line 41).
- Two-weather warning: STILL OPEN as far as I can tell. No weather warning on the sheet (grep of build.js / build-sheet.js;
  the word "Weather" on the sheet is a plan chip). Unsure how often it would show: the engine already refuses two weather
  setters on a built team (22-auto-build.js lines 150-154), and I did not find the old warning's exact text.
- Plan chips beyond 3: STILL OPEN. `chips = (t.gp || []).slice(0, 3)` (build-sheet.js line 38; build.js line 59). Checked on
  the page: option B "Rain · Grassy Terrain · Tailwind" has 4 chips from the engine (Speed control, Weather, Terrain, Lead
  support), so "Lead support" is dropped. No Sim decision found on a 3-chip cap (decision 8, line 559, only moved the Mega count).
- Proven-team note ("This exact team has won at real events. Treat these as optional tweaks", BUILD-06, My Team): STILL OPEN.
  grep finds no "won at real events" / "optional tweak" in app/src/v2. The Build sheet shows the proven record as a Note
  ("56.9% wins, This exact six at events, 49 players, 295 games"), which is a different thing.
- "N in your box" line under Build from: MOVED BY DESIGN for the count (Sim, decisions.md line 607, Nov 12 10:51 PM: "Build My
  Box switch without count"). `nBox` is still computed and unused (build.js line 9). Unsure whether "quick build, anything
  legal" was meant to go with it.
- Megas on team 73% / 81% tip: STILL OPEN. No tooltip or title on the Megas slider (checked on the page: no title attributes in
  `.bd-meg`); How It Works has three points, none about Megas (build.js line 37). The 0-Megas toast is there (AUTO-04 passes).
- Tests (frozen art build): AUTO-02, AUTO-04, AUTO-08, BUILD-06 pass. They could not fail on these extras: the new-site branches
  were written to the Blueprint and skip the fold, the line and the tip.

## i17: All Suggestions cards: PARTLY
Checked by code (sugs.js lines 34-48, 120-131) and on the page (Load Team from Build, See All Suggestions, card text read).
- Box / catch on each card: DONE (Nov 17, `V2.sgOwn`, sugs.js lines 35-36; seen: "Sneasler → Garchomp In your box").
- Still missing on each card: types, role, tier, hidden-gem tag, "Ability @ Item", chips. The card shows sprite, name,
  box/catch, the score move, the lane line, Apply and "Why?" (`V2.sgCard`, sugs.js line 39).
- End-of-list text: none. After the last card there is nothing (seen with 1 suggestion); "Show 12 More ›" only while more remain.
- "Try Whole roster" advice: not in the sheet; an empty sheet says "No suggestions for this team from this pool." (sugs.js
  line 130). The advice is on My Team's gap note (known-v2.json COV-09).
- Closest-option cards: the sheet shows the side options with "Keeps every check and your speed control / About the same
  Strength Score" (sugs.js line 42) when nothing raises the score. Unsure this is the old "closest option" card exactly.
- Status: the sheet's layout is a design question waiting on Sim (parity-nov15.md item 3; decisions.md line 1285; Plans step
  np-allsugs). Tests COV-04, COV-06, COV-07, SUGG-04, SUGG-12 ran on the art build: all "known" with that reason.

## i21: Site menu, Auto theme, Compare / Saved Teams / All Suggestions: PARTLY
- No ⋯ menu: MOVED BY DESIGN (Sim, Nov 11: "never a sixth menu place", decisions.md lines 351-352; parity-nov15.md line 7;
  known-v2.json NAV-03b, SHELL-02). Header seen: Back, logo, Forward, 5 tabs, Search, My Box, Day/Night. NAV-03v passes.
- Compare: DONE. Home (The Stampede) "More tools" lists "Compare Teams ›" (stampede-tools.js line 87; seen on the page), and
  Search "Compare" lists "Compare Teams"; choosing it opened #compare (checked in Playwright).
- Saved Teams and All Suggestions: DONE. Search lists both as pages (shell.js lines 193-194); choosing each from Home opened
  My Team with that sheet open (checked in Playwright). Also on My Team itself (team.js lines 281, 423, 428; sugs.js line 73).
- Auto theme: PARTLY. With nothing saved the page follows the device, including live switches (head.html lines 8-10);
  THEME-02v passes. Missing: once Day/Night is tapped, there is no way back to following the device (checked: `np2.theme` is
  "night" after one tap, "day" after two, never cleared). This was "decided under Claude's authority (no change)… minor"
  (parity-nov15.md line 28), not a Sim decision; so it stays open for Sim.

## i39: Report a Mistake on the Pokémon page: PARTLY
- The link is back: "Report a Mistake ›" in part 6 "Why it rates N" (pokemon.js line 124), shown only where feedback can be
  saved (`V2.FB.ok`, feedback.js lines 6-9). Send Feedback is now its own page (feedback.js).
- Checked on the art build at 390 wide (touch), Incineroar: the link is visible in part 6; tapping it opens #feedback as
  "Wrong info" with "Sent with what was on screen: Incineroar"; Send gave "Thanks! Feedback sent." and saved
  `{k: "mistake", v: "pokemon=Incineroar", c: "Incineroar", w: "phone"}` to feedback/<id> (stubbed store).
- Tests: SHELL-20c passes (hidden for viewers who can't save). SHELL-20b is "known": wording only (page, not a dialog;
  "Feedback sent", not "Mistake reported"), reason in known-v2.json.
- Left: the old report carried the Pokémon's numbers (rating and range, tier, rank, tournament share / wins / games, moves and
  items shown; app/src/app/53-feedback.js lines 20-26). The new one sends only the name (feedback.js line 39). The Damage Calc
  report does carry its result. No decision found dropping the numbers (unsure if deliberate).

## i41: Flaky Build test X-10: DONE
- Sim tried it on his iPhone (decisions.md line 712, Nov 13 5:14 PM): the info sheet opened every time; closed as a test-speed
  problem. The v2 adapter waits 0.3 s before the tap (adapters/v2.B-build.mjs line 307; decisions.md line 708).
- Today on the frozen art build: `X-10` run alone 10 times: 10 of 10 pass
  ("behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped" each time). The tile is now a Blueprint figure (`.bd-six
  [data-v2mon]`, build-sheet.js line 17), so the test covers today's page.
- What the test can't show: why a tap inside the first 0.3 s was lost in the browser (cause never found; unsure). No person taps
  that fast, and Sim's phone test agreed.

## i45: Megas ranking on Meta: DONE
- Sim's own Meta brief "The Grandstand" designed it (decisions.md line 844, Nov 14 3:28 PM; brief
  docs/rebuild/mocks/meta-grandstand/BRIEF.md section 3, "Ratings: the Megas view"), built at line 849.
- Checked on the page (Meta, tap "Megas"): title "The Megas", 82 of 345 match, each Mega carries its rank among Megas ("#1 Mega
  Charizard Y 94… Mega number 1", "#2 Mega Raichu Y 93", "#3 Mega Floette 92"…), spotlight "The top Mega right now"; Megas stay
  in the main list too (meta.js lines 39-53, 85). RATE-03 (filters) passes.
- Open in meta-notes.md item 1 but answered by the brief: it lives as a view of Ratings, not its own tab; ranked by rating.

## What could and couldn't be seen
- Sprites don't load in a local preview build (picture paths), so screenshots show empty frames; text and counts were read.
- One build only (Whole Roster, the sample team); a My Box build with Pokémon to catch was not reached (the sample box covered
  all six), so the catch-tip lines were checked in the engine's data and the code, not on screen.
