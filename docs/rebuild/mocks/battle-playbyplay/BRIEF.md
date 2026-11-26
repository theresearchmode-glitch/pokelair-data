BATTLE A TEAM — SIM'S PICK: "PLAY-BY-PLAY". Design brief, no code.

Sim chose this on Nov 14. Three pictures come with it (desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn from your built v2 Battle page (branch claude/design6 at 423360bb) with the sample team against the first winning team (V2.btSetOpp(META.teams.teams[0].mons.slice(0, 6), {k: 0})), so every name, move, number and sentence is what the page works out today. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 6 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

This brief covers the top of the page once their six is in: the headline, the verdict, both sixes and Turn One. The Read, Watch Out, From Real Games, the three tabs (Damage Both Ways, Who Moves First, Deeper Read), More Ways to Prep and the Battle Log are your built sections, untouched.

THE IDEA
The match as a face-off and a commentary. You are always PLOT blue and they are always the logo's pink (the same two colours as the new Compare page). Both full teams face each other on a poster, then turn one is told move by move down a centre line, each move on the side of whoever makes it.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything the page does today must still work: the tools bar, the eyebrow, the two-line headline, the verdict with its source and game count, their six with items and "Likely lead", Change Their Six, Copy for Showdown, Clear, your six in Lead / Back / Leave home with items, the lead-pair note, Turn One in move order with each move's speed, priority, target and damage line, the Watch warning, the field note, and everything below. Same data, same helpers, same numbers, same wording unless listed in section 7. Nothing is removed.

1. THE HEAD
The eyebrow and the headline ("Bring these four." / "Lead the pair." with the second line in PLOT blue). At the right, the verdict on a filled slanted plate: the small line "From real games", the word large ("Favoured"), and the game count. On iPad and iPhone the plate sits under the headline.

2. THE FACE-OFF POSTER
- One wide panel split on a diagonal: your half blue (left), their half pink (right), each a gradient to a darker shade with fine diagonal lines, and a tilted "VS" plate where they meet.
- All six of each team are on the poster. Sim asked for this specifically: not only the leads.
- Your half: "Your Six", then the small label "Lead" and your two leads large with name and item; under a thin rule, two small groups side by side, "Back" and "Leave home", each with its two Pokémon, name and item.
- Their half, mirrored: "Their Six", "Likely lead" with their two likely leads large (drawn facing yours), then "The other four" small with name and item.
- iPad: the same, smaller; bench names without items.
- iPhone: the halves stack, yours on top and theirs below, with the diagonal seam between and the VS plate on it. Leads keep their items; the bench shows names only.

3. TURN ONE, PLAY BY PLAY
- A heading "Turn One, Play by Play" with the sub-line "Fastest moves first." followed by today's matchup sentence.
- A dashed vertical line down the centre. Each move is a row: a slanted numbered plate on the line (1 to 4, in move order, in the mover's colour) and a slanted band on the mover's side, yours to the left in blue and theirs to the right in pink.
- Inside each band, in reading order: the attacker's picture; "You · Sneasler" or "Them · Mega Staraptor"; the move name as a headline ("Fake Out"); "into Mega Tyranitar"; today's damage line; a thin white bar showing how much of the target's HP it takes (capped at full); the target's picture; and the mover's Speed as a number with "+3 priority" on a small tag when it applies.
- When the damage line says OHKO, the target's picture is greyed and tilted with a red "KO" stamp across it. Otherwise a small tag shows the hits needed ("3HKO").
- Under the list: the Watch warning with "Watch" as a coloured headline word, and the field note.
- iPad: the same centre line, without the Speed number at the end of the band.
- iPhone: the line moves to the left edge with the numbers on it, and all four bands run full width in order, still coloured by side.

4. UNDER THE PLAY-BY-PLAY
One row: the lead-pair note on the left; Change Their Six, Copy for Showdown and Clear on the right (stacked on iPhone). Then the rest of the page as built.

5. KNOWN ROUGH SPOTS
- On iPad the bench names on the poster are small and tight.
- On iPad your existing Battle Log sentence wraps into a narrow column beside the Win and Loss buttons.
- The desktop picture was not re-opened after the last fix to step 4; the same fix shows correctly on iPad and iPhone.

6. WHERE THIS MAY CONFLICT WITH YOUR RULES
- Pink for "them" is new, as on Compare; it is not in tokens.css. White text sits on both colours: check contrast in both themes.
- The verdict plate is blue for "Favoured". "Even match" and "Unfavoured" need a treatment; they are not drawn. Blue also means "you" here, so the verdict should not borrow the pink.
- The KO stamp, the greyed target, the "3HKO" tag and the HP bar are new pictures of the damage line the page already writes. They add no numbers. The HP bar stops at full even when the line says 212%.
- The move's target is drawn as its own picture and its own line; today it is inside the sentence ("Brave Bird into Sneasler"). When a step has no single target, the band should simply show today's sentence.
- Their leads are mirrored to face yours. Some Pokémon look odd mirrored; treat it as optional.
- The poster replaces the two quiet rows of six and the right-hand Turn One column, so the top of the page is one column now, not two.
- "Lead" appears as a small label on the poster where today's group heading has a blue dash. Keep whichever your rules prefer.

7. WORDS THAT ARE NEW (Sim has seen them in the pictures; confirm before they ship)
"Turn One, Play by Play" (today "Turn One, in Move Order"), "Fastest moves first.", "The other four", "KO", and "into <Pokémon>" on its own line.

8. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- Before their six is entered ("Who are you facing? Plan the match."), a partly entered six, and the picker.
- "Even match" and "Unfavoured" verdicts, and a verdict with no real games behind it.
- Their six from team preview only, with no items and no known sets.
- Fewer than four moves in turn one, a spread move, a move with no damage, Protect, and a turn with Trick Room or Tailwind already up.
- Your team with fewer than six, or fewer than four.
- Widths between the three drawn, a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. Each band needs one spoken sentence, for example "Move 2, them: Mega Staraptor, 178 Speed, Brave Bird into Sneasler, up to 206% of its HP, a knockout."

9. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No real player names beyond what the page already shows. No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
battle-desktop.png
battle-ipad.png
battle-iphone.png
