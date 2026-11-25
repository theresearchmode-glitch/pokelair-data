# NastyPlot Full Redesign: design review, full site (from Sim, Nov 18 evening)

Received from Sim in chat; reviewed version 1795048572-e677 (Preview v206). 22 findings (P0 0, P1 4, P2 12, P3 6).
This replaces the earlier 13-item note (same reviewer). Text kept close to what Sim sent.

## Keep these
- No sideways page scrolling on any page tested at 320 wide.
- Pop-ups handle focus and Esc properly.
- Moving ratings can be paused; reduced motion is respected.
- Mystery Gift codes mark numbers in blue (1 vs I).
- Type Chart backs its 3D blocks with a plain text list.
- Broken team and box links explain what went wrong.

## Findings
1. [P1, effort L] Battle > Turn One, Play by Play: the plan breaks the game's rules (flinched Pokémon still act; Fake Out twice then Garchomp still attacks; Earthquake hits your own Sneasler for up to 161%; both opposing leads shown as Mega; 'Fake Out then Close Combat' as one turn-one step). Fix: flinched lose their action, one Mega per side, later-turn moves split out, never recommend a move that KOs your partner without a clear warning.
2. [P1, effort S] Clear Team and My Box: Undo disappears too quickly (Clear Team about 4 s, focus to the heading, no restore on the empty page; My Box remove about 6 s). Fix: one Undo time of at least 10 s, paused on hover/focus; 'Restore last team' on the empty My Team.
3. [P1, effort M] Damage Calc > KO Board: the 30 Pokémon have no visible names. Fix: name and damage on hover and keyboard focus; short names or a list on phones.
4. [P1, effort S] Track Record: the headline doesn't match the receipt (25% for 90+ vs 0.1% under 53, about 250x; headline says 20x). Fix: check the calculation; make headline and rows agree, or state exactly what 20x compares.
5. [P2, effort S] Small text links site-wide below 44px (Build Me a Team, Import a Team, Why This Score?, Team Sheet, Go to My Team, How right have they been? 20px; Change the four you brought 26px; Read the Story 32px; 'Win logged' Undo 38x20). Fix: one shared 44px hit area, no visible change.
6. [P2, effort M] Form errors easy to miss (Import plain text; Edit Set keeps an invalid 99 and explains only in a toast; empty Feedback only a toast, focus dropped). Fix: one inline error pattern: message beside the field, error styling, aria-invalid, aria-describedby, focus to the field.
7. [P2, effort S] Log a Game and Battle > Your Games: Win looks already selected. Fix: equal weight, or selection + Save Game.
8. [P2, effort M] My Team > Matchups: 'Unfavoured' and 'Calc disagrees: Beats it' on one card; row heights break. Fix: one main verdict + a short consistent note; equal heights.
9. [P2, effort M] Battle: 'Favoured' vs the Champion while the plan shows both recommended leads KO'd on turn one. Fix: explain what Favoured is based on and connect it to the risky opening, or recommend a safer lead.
10. [P2, effort S] Home hero: 'your win rate.' 3.17:1 with the crowd behind. Fix: white/lighter line, calmer crowd behind the headline.
11. [P2, effort S] My Team cards on phones: 'Mega' lost in the art. Fix: solid plate or a badge away from the art.
12. [P2, effort M] Meta on phones: search about 950px down at 390x844. Fix: compact hero, or search and filters above the featured Pokémon.
13. [P2, effort M] Team Preview Practice on phones: both teams don't fit; unpicked cards dimmed from the start (type labels about 3.5:1); code order differs from screen order. Fix: compact 3x2 for your six, no starting dim, code order = screen order.
14. [P2, effort S] Usage: op.gg read paused since Nov 18 but Usage opens on op.gg data with no date or paused label. Fix: 'Last updated [date], updates paused', or default to a source still updating.
15. [P2, effort S] Edit Set > Item: duplicates ('Leftovers' / 'Left Over', 'Life Orb' / 'Life orb'). Fix: merge in the item data and combine their numbers.
16. [P2, effort S] All Mock-ups gallery out of date. Fix: update status and count; real Meta page instead of the Ratings card.
17. [P3, effort S] Home copy: playful lines hide what sections do. Fix: keep the voice, add a plain descriptor.
18. [P3, effort S] Pokémon count: Home '345 rated' vs '#5 of 321 with results'. Fix: '321 of 345 have tournament results' where the rank appears.
19. [P3, effort S] Meta filters on phones: options off-screen. Fix: two rows or a clear scroll cue.
20. [P3, effort S] Odd addresses: unknown ones silently show Home; 'No Pokémon here' keeps the previous tab title; #owner shows an empty owner page to anyone. Fix: a simple not-found page, update the tab title, hide #owner from visitors.
21. [P3, effort S] Edit Set on phones: the Close X overlaps the dropdowns when the panel scrolls. Fix: a solid sticky header for Close.
22. [P3, effort S] Compare Teams: raw event name with promo text and emoji. Fix: clean promotional text and emoji from event names before display.

## How it was tested
All main and secondary pages at 1440, 390 and 320; contrast in day and night; flows: Battle plan, Edit Set, My Box, Compare, Practice,
Test Run, Import, Search, Feedback validation, bad links.

## Not covered
Real screen readers and physical phones; all 345 Pokémon pages (2 sampled); Share image output; a real Feedback submission.
