# My Team: fix plan + rules for the rest of the build (from Sim, Nov 11, ~11 PM Eastern)

Sim pasted this into the chat on Nov 11. It is kept here word for word so no later session loses it.
Part C (the rules) is also in docs/rebuild/RULES.md, which CLAUDE.md points to. Status of each item: docs/rebuild/HANDOVER.md.

---

From a sweep of the published "NastyPlot Full Redesign" artifact (foundation.html, My Team and
the empty My Team), Nov 11. Tested in Chromium at 320, 390, 820, 1440 and 2560 wide, day and
night; every visible control clicked at 390 and 1440; remove / undo / apply / reload / keyboard
flows run on desktop.

HOW TO READ THIS
- Not tested: real iPhone or iPad Safari, My Box, the contents of each sheet, scrolling speed,
  screen readers. Treat anything in those areas as unknown, not as passing.
- Each item says what was seen. Where I am inferring the cause, it says "likely". Confirm the
  cause before fixing.
- Nothing here asks to remove a feature. Where two things duplicate, merge them and keep every
  function. If a fix needs a design choice, bring Sim options with pictures first.
- Fix in the order given. Do not start another page until Part A is done and Part C is in place.

WHAT IS WORKING (do not break it)
- No JavaScript errors, no broken images, no sideways scroll at any width tested.
- All sheets (Why this score, Edit Set, Share, Saved Teams, Log a Game, Search): page behind does
  not scroll, focus stays inside, Escape and outside-click close, focus returns to the button,
  44px close button, labelled dialog.
- Remove gives Undo and restores the team and score exactly. State survives reload.
- No "undefined / NaN / null" text, no duplicate ids, no text under 13px, all images have alt.

PART A: BUGS, IN PRIORITY ORDER

A1. Page length is over the limit at every size, and the records say it is not.
  Measured, sample team, sections in their default state:
    phone 390: 4,309 (limit 3,400)     phone 320: 4,818
    iPad 820: 3,775 (limit 3,500)      desktop 1440: 2,223 (limit 1,800)
  It also grows in use: 2,500 on desktop after removing one Pokémon, 2,536 after applying a
  suggestion, 4,108 with every section opened.
  docs/rebuild/page-heights.md lists My Team as 1,737 / 2,587 / 1,699. Those are the mock-up's
  numbers. The gallery page says "3 sizes, all inside the length limits". Both are wrong for the
  real build. Correct both today, before any fix, so the record is honest.
  Where the height goes on phone: hero 1,142; Set 468; Suggestions 735; Matchups 990; Team
  Checks 269. Biggest wins, in order: A2, A3, A4 below, then the phone hero (the six in two rows
  plus nine actions).

A2. Team Checks appears twice and the page contradicts itself.
  - There is a "Team Checks" section ("All 4 basics and all 3 notes pass", Show) and directly
    under it a second section titled "Problems and Team Checks" that lists the same 4 checks and
    3 notes again.
  - Suggestions says "Nothing to fix." The next section says "7 to look at". One of the "Problems"
    is "Weakness: Flying, 2 weak" with "1 fix", while the check "No major weak spot" shows a tick.
  A new player cannot tell whether the team is fine. Make it one section with one headline
  verdict; list the checks once; word the minor notes so they cannot be read as failures
  (they are "things to know", not "problems") and make sure the count and the "Nothing to fix"
  line can never disagree. Keep every check, note and fix action.

A3. A suggestion that changes nothing gets the loudest button on the page.
  "Suggestion 1: ±0, 93 → 93, Sneasler → Mega Floette" with a full-size main "Apply" button and
  "Why? 12 reasons", directly under "Nothing to fix". When the best swap is ±0, show the quiet
  "nothing to fix" line and put optional swaps behind "See all suggestions". If Sim wants the
  ±0 swap kept visible, it uses a secondary button, never the main one.

A4. Matchups shows two verdicts that disagree on the same row.
  Example: "Mega Charizard Y · Calc: Beats it · Unfavoured". The intro explains there are two
  readings, but on the row it reads as a bug. Lead with one verdict per row (the real-games one)
  and show the calc reading only when it differs, with words that say so ("calc disagrees: beats
  it"), or move it into the row's sheet. Ask Sim which.

A5. The whole page redraws itself after it has loaded, and it throws the user out.
  Seen: tabbing through the top bar, focus jumped back to "Skip to the page" part-way and the
  Night button was skipped the first time round; twice a button I was about to click was
  replaced under the pointer. Likely cause: the full V2.draw() that runs when the suggestions
  finish computing ("Working out the best changes for your team…"). Fix: when late results
  arrive, update only the section that changed; never replace the element that has focus; and
  reserve the section's height first so nothing below it moves.

A6. Two status messages for one action.
  After Apply the status areas held "Applied Mega Floette for Sneasler · Undo" and "Applied:
  Mega Floette · Undo" together, so two Undo buttons. At load, two "Working out…" lines sit in
  the live regions. One message per action, one Undo, and clear the "working" text when done.

A7. The jump bar (Set / Matchups / Suggestions / Team Checks) never moves its underline.
  It stays on "Set" wherever you are on the page, on phone and desktop. Either follow the scroll
  position or drop the underline; a marker that is always wrong is worse than none.

A8. The phone bottom bar and top bar let the page show through.
  Pokémon names and items are readable through the bottom bar and sit on top of "Home / Build /
  My Team / Battle / Meta". Likely the frosted background has no blur in this build or the tint
  is too thin. The bars need a real blur plus enough tint that text behind is never legible,
  and a solid fallback where blur is not supported.

A9. Selected Pokémon (Sim has already said she does not like the current treatment).
  [UPDATE Sim, Nov 12: she chose NONE of the three redesigns (A Stage, B Podium, C Light from above) and keeps the
  current look (floor ring in the Pokémon's own colour, no panel, as on Preview v52). Whether the three small faults below
  are fixed is still her call; the 4px spill and the Mega line need before/after pictures first.]
  - "Mega" sits alone on its own blue line above "Charizard Y", only on the selected tile, so
    that tile's name block is a different shape from the other five.
  - The floor ring cuts across the art, and on phone the selected art is drawn 120px in a 111px
    tile and spills 4px outside it.
  Do not polish this version. Sim is choosing between redesigns from the design chat; wait for
  her pick, then build that one.

A10. Symmetry in the six, phone.
  There is a vertical divider between Back and Bench but none between Lead and Back. Either both
  or neither.

A11. "Update Saved Team" is the main button on a team that has not changed.
  On the untouched sample team the main action reads "Update Saved Team". Show a quiet "Saved"
  state when nothing has changed, and the main button only when there is something to save.

A12. Night mode has two blue main buttons on one screen.
  "Update Saved Team" and "Apply" are both the blue action. The agreed rule is one blue action
  per screen. A3 and A11 remove most of this; check it again after them.

A13. Too many black plates in day mode.
  On desktop, at once: Update Saved Team, Apply, and four selected segments (Stand-outs,
  Box + catch, 2, No). The main action no longer stands out. Selected segments get a quieter
  selected style than the main action.

A14. Controls inside closed sections are still there for keyboard users.
  With "Problems and Team Checks" closed, "Swap out Whimsicott", "Show 4 more", the Weakness row
  and two "?" buttons still have a size and a tab stop, off the bottom of the page. Closed means
  not focusable and not rendered.

A15. Small things.
  - The two "?" help buttons are 24x24. Minimum is 44x44 on touch.
  - The mode button says "Night" in day mode and "Day" in night mode with no pressed state. It
    is unclear whether it names the current mode or the one you will get. Give it a clear label.
  - Phone: the matchup view switcher wraps into a 2x2 block with uneven backgrounds.
  - Desktop: the left column ends about 160px before the right one, and there is a large empty
    band above the footer. Balance the columns.
  - "Sets", "How We Calculate", "About" and "Send Feedback" appear to open a placeholder that
    shows the Home mock-up picture (inferred from what the page requested; confirm). A link in
    a real page must not land on a picture of a different page. Until those pages exist, say
    "coming soon" on the link or hide it in the preview, and list it for Sim.

A16. The proofs do not support "same numbers as today's site" yet.
  From the full check run on Sim's PC, label nov11-r4b (report will be on the branch as
  docs/rebuild/test-runs/full-check-nov11-r4b.txt):
    same-six:      67 steps compared, 0 identical, 67 different
    same-compare:  21 compared, 1 different
    same-info:     350 sheets compared, 1 different
    same-share-v2: crashed, no result line
    behaviour A-team: 131 pass, 1 FAIL (same count on two runs in a row)
  Each of these is either a real difference or a proof that is out of date. Find out which, one
  by one, and write the answer next to the result. Until then, take "same numbers as today's
  site" off the gallery card.

PART B: WHY THIS HAPPENED (the pattern behind the list)
1. Things were recorded as passing from the mock-up, not from the built page (A1, A16).
2. Content was added section by section and nobody read the whole page top to bottom as a
   player, so sections repeat and contradict each other (A2, A3, A4).
3. The page was checked as a still picture, not while being used (A5, A6, A7, A14).
4. Each section picked its own "main" button (A11, A12, A13).

PART C: RULES FOR EVERY PAGE FROM HERE ON
(Kept in docs/rebuild/RULES.md, section 2.)

ORDER OF WORK
1. Correct page-heights.md and the gallery claims (A1, A16 wording). Small.
2. A5 and A6 (redraw and status). They affect every later page.
3. A2, A3, A4 (content). Needs Sim's choice on A4 and on whether ±0 swaps stay visible.
4. Re-measure. If still over the limit, bring Sim layout options for the phone hero.
5. A7, A8, A10 to A15.
6. A9: Sim keeps the current look (Nov 12); only the small faults, if she says so, with pictures first.
7. Build the C13 check, run it on My Team, My Box and the empty state, report the results.
8. Only then start the next page.

NOTES FROM SIM'S PC CHAT (full check nov11-r4b)
* `same-share-v2` still cannot run on this PC. I retried it once on its own: it fails with `MODULE_NOT_FOUND`. The script has a
  Linux-only folder written into it (`/home/user/pokelair-data/`) for both Playwright and the data files. The earlier path fix
  covered the `.mjs` scripts; this one is a `.cjs` file and was missed. That is a code fix, so I left it.
* `same-six`: 0 of 67 identical. Every step differs, which usually means the proof is comparing something that changed on
  purpose, but that needs confirming.
* `same-compare` and `same-info`: 1 different each. The report doesn't say which step or sheet.
* Behaviour A-team: 1 FAIL, the same count on both runs. This rerun was its one retry. The summary line doesn't name the failing test.

MORE FROM SIM (same message)
- Fonts come from Google's servers. Every visitor's device contacts Google to fetch them. For a site children use, with the
  strict privacy rules, host the two fonts ourselves.
- Ratings disagree between pages (Garchomp 85 on Ratings, 92 on My Team). One source is needed before Ratings is built.
