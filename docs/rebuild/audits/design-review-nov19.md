# NastyPlot Full Redesign: design review (from Sim, Nov 18 evening)

Received from Sim in chat; reviewed version 1795048572-e677 (Preview v206), day and night, at 320, 390, 820, 1366 and 1440.
Findings: 13 (P0 0, P1 2, P2 8, P3 3). Text kept as Sim sent it.

## Keep these
- No sideways page scrolling on any of the 11 main pages tested at 320 wide.
- Pop-ups: focus moves in, Esc closes, focus returns to the opener.
- Moving ratings have a pause control; reduced motion is respected.
- Search and Import errors explain what to do next in plain language.

## P1 (fix before launch)
1. My Team > More > Clear Team: Undo disappears too quickly. Clear Team empties all six with no confirmation; Undo shows about 4 s, focus jumps to the heading, the empty page has no restore. Fix: Undo at least 10 s, timer paused on hover/focus; "Restore last team" on the empty My Team. (S)
2. Damage Calc > KO Board: the 30 Pokémon have no visible names (sprite + KO tag only; name only for screen readers). Fix: name and damage on hover and keyboard focus; on phones short names under the sprites or a list view. (M)

## P2 (fix before handoff)
3. Small text links site-wide below the 44px --tap size: Build Me a Team, Import a Team, Why This Score?, Team Sheet (20px tall), Change the four you brought (26px), How We Calculate and About links (19-20px), "Win logged" Undo (38x20), toast Undo (38px wide). Fix: shared text-link style gets a 44px hit area (padding or pseudo-element) without changing the look. (S)
4. Import a Team: the error is easy to miss ("This doesn't look like a team" as plain text; field not styled or linked; focus stays on the button). Fix: error colour and icon, aria-invalid, aria-describedby, focus back to the field. (S)
5. Log a Game: Win looks already selected (solid Win, outlined Loss; both save at once). Fix: equal weight, or a real selection plus Save Game. (S)
6. My Team > Matchups: conflicting verdict on one card (Mega Charizard Y "Unfavoured" and "Calc disagrees: Beats it"); the extra lines make the card taller. Fix: one main verdict + a short consistent note ("Real games: Unfavoured. Calc: Beats it."), equal card heights. (M)
7. Home hero: "your win rate." 3.17:1 on hero blue, crowd behind lowers legibility ("Sharply raise" 4.73:1). Fix: line 2 white or lighter; calm/darken the crowd behind the headline, both modes. (S)
8. My Team cards on phones: "Mega" gets lost in the art at 390 (worst on Mega Charizard Y, day). Fix: name on a solid/scrimmed plate, or "Mega" as a badge away from the art. (S)
9. Meta on phones: search and list start about 950px down at 390x844. Fix: compact the phone hero, or search and filters above the featured Pokémon. (M)
10. All Mock-ups gallery out of date ("updated Nov 13", "Next: Meta and the tools", Ratings card as coming). Fix: update status and count; replace the Ratings mock-up card with the real Meta page. (S)

## P3 (when possible)
11. Home copy: clever lines hide the meaning ("Call six out of the herd.", "The post is in.", "is in this charge"). Fix: keep the voice, add a plain descriptor ("The post is in. Latest Champions news."). (S)
12. Pokémon count inconsistent: Home "345 rated", Pokémon page "#5 of 321 with results". Fix: explain where it appears ("321 of 345 have tournament results"). (S)
13. Meta filters on phones: In my box and Types past the edge, only a clipped chip hints. Fix: wrap to two rows or a clear scroll cue. (S)

## Not covered
Real screen readers, physical iOS and Android devices, every secondary page.
