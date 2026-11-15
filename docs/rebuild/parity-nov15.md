# Parity sweep before go-live (Nov 15, started time: 3:26 PM (3:26:20)  date: Sun Nov 15, 2026)

Source: helper-written test adapters (Meta/shell group: 73 -> 97 passing, commit 8a298a9 merged) and the Build group triage (running).
Each failing test was sorted against decisions.md and the approved mock-ups. "Checked" = read in code or run.

## Deliberate differences Sim approved (not gaps)
- No ⋯ page menu: header = Back, logo, Forward, 5 tabs, Search, My Box, Day/Night (Nov 11: "never a sixth menu place"). Every page is reachable:
  checked by a script (every V2.pages route has an inbound link; Calc / Test Run / Practice / Types through V2.BT_TOOLS in the Battle tools bar).
- This Week is the 4th Tournaments view (Q8, Nov 15). Welcome card words (approved first-visit mock-up). Owner data on #owner (Sim: recommended).
- One accent colour (--plot) for all sections (the new design system). "Team Checks" wording (word list).
- Privacy (ABOUT-02): the promises are in About's "Everything We Save" (approved info-page drafts, Q12): checked on the page: no cookies,
  no ads or trackers, fonts served locally, deletion by email. Not a fold called "Privacy"; same content.

## Real bugs / lost functions, no design change: fix one at a time (all 7 built Nov 15, tests running; see decisions.md)
1. Welcome card "Copy a Top Team" opens Ratings (#meta), should open Winning Teams (SHELL-17b).
2. "About the ratings" fold not remembered across a reload (SHELL-14).
3. A tapped filter chip moves 56 px (keep your place, SHELL-31).
4. A second Ctrl+K does not close Search (JUMP-01).
5. "Send Feedback" shows for viewers who cannot save (SHELL-20c).
6. "Report a Mistake" missing on the Pokémon page (the sheet had it, SHELL-20b).
7. Search lost tools (empty list, "speed" -> Speed Tiers) and the rating on Pokémon rows (JUMP-02/03/05, RULE-RATING-ONE-NUMBER).

## Gaps that need a picture and Sim's yes (design)
- Footer: tagline, "Sources and Credits", Privacy and Contact links (SHELL-06, DUP-12, ABOUT-04). Mock-up pictures ready
  (scratchpad q/foot-now-*.png, q/foot-mock-*.png). Recommended: restore them as in the mock-up (credits matter for the public launch).

## Decided under Claude's authority (no change), with reasons
- Theme Auto / Light / Dark (THEME-02): the new site already follows the device until you choose (head.html); one Day/Night button is
  simpler. Only "go back to following the device" is missing: minor.
- My Team tab "x/6" count (NAV-01): My Team's own header says "x of 6"; the header's five tabs stay as Sim approved them.
- Stale-data note (SHELL-04): Sim decided (My Team Q4 C): date beside the score, age in the footer ("Data as of Nov 10 (5 days old)").
- New-regulation banner (SHELL-05): belongs to the Reg M-D step (order of work: after the rebuild).

## Unsure / left as is for now
- Toast length 4 s vs today's 2 s (SHELL-07b); no page fade on switch (SHELL-32b); Events calendar 2 rows and 13 tickets before Show More
  (EVT-02/04, Ticket Wall design); ArrowDown in search focuses the first result (JUMP-04).

## Update (time: 5:10 PM (5:10:14)  date: Sun Nov 15, 2026): Build and Battle helpers (test helpers merged: Build 30 -> 57 passing, Battle 59 -> 79)
Fixed since: Set as Opponent names the team (NAV-06); Report a Mistake carries the calc / the Pokémon (CALC-08 behaviour; test reads the box);
Teams with It on cores (CORES-09); Full Popular Sets in Edit Set (EDIT-09 / SETS-08); Paste its log (LOG-02 / X-13); Battle comma (X-08);
Never Suggest list visible and undoable (Sim Q3 A; was a hidden filter); footer credits / Privacy / Contact (Sim Q2 A); Pokémon page folds (Sim Q1 A).
Build: the page no longer switches layout while building (last Blueprint stays, faded); the fresh take's row is held (no late jump);
the thin blue frame around the score is gone (Sim).
Still open (genuine gaps, in this order):
1. "Fix your items first" card with one-tap "Give X Y" + Undo (SUGG-16; 54-items.js itemFixHtml not used in v2). Item Clause is flagged but not fixable in one tap.
2. Set check tips ("X: Y instead of Z", SUGG-17; 57-set-tips.js not in parts-v2.json).
3. All Suggestions has no pool switch of its own (BUILD-04, COV-03/06) and its sheet design (Bigger Plans fold, notes, Undo bar) is waiting on Sim.
4. Plan settings: Count abilities, Refresh plans (AUTO-03/04, BUILD-07, SUGG-02); Never suggest now done.
5. A core's "% of all teams" only as a hover title (touch can't see it).
