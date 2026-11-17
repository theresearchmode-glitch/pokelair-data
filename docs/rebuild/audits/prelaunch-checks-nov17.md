# Pre-launch checks (outside review, Nov 17): tracking

Sim sent this review on Nov 17 (morning) with "recommended for all is good to go". Each item: re-check on the current
branch, fix, a test that fails before, pictures for Sim. Status words: OPEN, FIXED, FOR SIM, LAUNCH PLAN (January work,
parked by Sim's Nov 9 rule until she says), NO CHANGE (checked).

## Verified correct by the reviewer (keep; a selling point at launch)
- Damage Calc: 30,838 hits identical to @smogon/calc in all 16 rolls (40 top Pokémon, weather, terrain, crits, Helping
  Hand, screens, Friend Guard, -1 to +2); the 362 marked failing are right (Armor Tail, Psychic Terrain, Soundproof).
- Speed Tiers match Showdown (no toggle, their Tailwind, them -1, paralysis; Trick Room reverses).
- Keyboard focus visible (one exception, 5b), search traps and returns focus, skip link works.
- One title and one main heading per page; reduced motion stops animation; no sideways scroll at 320.
- Broken saved data, blocked saving, empty team, missing images, broken links, bad pastes handled cleanly.

## 1. Pages show old numbers first, then swap (fix first)
- 1 FIXED (tests running) Every page draws with the built-in data, then about 1.2 s later redraws with the current data: Home 10,209 -> 13,826
  teams, Sneasler 46.6% -> 35.6%; Game Plan lead/bench flips; Strength Score 92 -> 93; Ratings S tier 9 of 228 -> 11 of
  321. Fix: numbers, plans and ratings drawn only from the final data; a neutral placeholder until it's ready.
  Done: numbers are drawn only once all 15 daily documents have answered (or there's no data store, or after 8 s); until then the
  main area shows the logo and "Getting today's numbers…" (role=status, fades in after 300 ms so a fast load never flashes it).
  The last document draws at once (the 700 ms wait is skipped). Measured with the store 1.2 s late (app/test/data-swap.mjs, now in
  GitHub's checks): before, 8 failures (10,209 -> 13,826; 46.6 -> 35.6; Game Plan flip; 92 -> 93; 9 -> 11; no loading sign); after, 0,
  today's numbers first at about 1.4 s (before: old ones at 0.1 s, today's at about 1.9 s). Pictures: pics/nov17/loading-{320,390,1440}-{light,dark}.png.
  Also helps 2b (slow 4G now shows the logo and a loading line once the page's code has run).

## 2. First load on phones (simulated mid-range phone)
- 2a OPEN 1.4-1.6 MB per first visit; 4G: Home usable 2.4 s, My Team 2.8 s; main content 2.1 s / 3.8 s.
- 2b OPEN Slow 4G: ~3 s (2.75-5.75 s) showing only header icons and tab bar: no logo, words or loading sign.
- 2c OPEN Start-up blocks the processor 1.1-1.8 s, one single 1 s freeze (taps do nothing).
- 2d OPEN My Team one ~200 ms scroll hitch.
- Goals: logo + headline + progress within ~1 s on slow 4G; no 1 s freeze; My Team main content within 2.5 s on 4G.

## 3. Before the public site (January)
- 3a LAUNCH PLAN Saving goes through Claude's page storage; public site needs its own; About "Everything We Save" rewrite
  (same as player review 3i).
- 3b LAUNCH PLAN Link previews: no og:/twitter: tags (logo package has social/link-preview-1200x630.png).
- 3c LAUNCH PLAN No web manifest (icons exist).
- 3d LAUNCH PLAN #hash routes: search engines see Home only; decide on real addresses (e.g. each Pokémon page).
- 3e NO CHANGE (checked) "This Preview uses a saved copy of the data" banner must be tied to preview mode only. Checked: it shows only when window.__NP_PREVIEW is set (shell.js V2.dataNote), which only the --preview-data build sets; build.mjs refuses --public with --preview-data (ran it: "--public and --preview-data do not mix"); a --v2 --public build has __NP_PREVIEW=1 0 times; GitHub's v2-public.mjs fails if it ever appears.

## 4. The next regulation (decide now)
- 4 FOR SIM "M-C" appears 112 times; legal items are a fixed M-C list; no single regulation setting; saved teams don't
  record their regulation. Needs: one switch, what happens to ratings / Winning Teams / Events / Track Record, flag (not
  delete) illegal saved teams and box Pokémon, a notice on the day.

## 5. Accessibility (axe-core WCAG 2.2 AA, 96 views, plus manual)
- 5a OPEN Tap targets 19-22 px: Winning Teams "Set as Opponent ›" / "Compare ›"; My Team "Game Plan ›"; Battle "Change on
  My Team ›"; Track Record "How Ratings Work ›"; Feedback "Show Email"; About Fine Print (5 links); Events "Victory Road
  season calendar"; search fields on Winning Teams and Type Chart (check the visible box vs the 22 px input).
- 5b NO CHANGE (checked; unsure what the reviewer saw) Ratings search ("Find a Pokémon or type") shows no focus ring by keyboard. Checked by Tab in Chromium and WebKit, 390 and 1440, both Meta views: focus lands on the box and a 3px blue ring is drawn round the visible box (components.css .np-field:focus-within); the inner input itself has outline none, which is likely what the check read. Pictures: scratchpad raq-390.png / raq-1440.png (ring visible).
- 5c FIXED Garchomp forms strip "92 · S tier" blue on light blue 4.13:1 (< 4.5:1); check other forms strips. Cause: the label runs at 85% opacity; on the current form's blue tile that is 4.14:1 (computed from the raw colours; full opacity 5.5:1). The current tile's label is now at full opacity. Measured with app/test/forms-contrast.mjs (12 Pokémon with forms, day and night, 54 labels; now in GitHub's checks): 11 under 4.5:1 before (all the current tile in day mode, 4.14), 0 after. Pictures: pics/nov17/forms-contrast-{before,after}.png.
- 5d OPEN (lower priority) 930 buttons: spoken name doesn't start with the visible words (voice control).

## 6. Messages when something goes wrong
- 6a OPEN Import typos ("Garchmp") say "not on the M-C roster": suggest the closest name.
- 6b OPEN A sentence pasted as a team: say it doesn't look like a team (as the empty paste does).
- 6c OPEN Item Clause at import (4x Choice Scarf imports silently): flag it at import.
- 6d OPEN Team names cut at 40 characters mid-word without warning: show the limit while typing.
- 6e OPEN Unreadable saved data falls back to the sample team silently: tell the player in one line.

## Where this meets earlier rules or decisions (for Sim)
- 3a-3d are January launch work, parked by Sim's Nov 9 rule ("the January launch work is parked until Sim says"). Listed,
  not started.
- 6a-6c and 6e add messages inside existing tools: small additions, against the Nov 9 "no new features until finished"
  rule only loosely (they finish Import rather than add a tool); doing them under "recommended for all".
- 4 needs Sim's plan; a proposal goes in the summary.
