# Colour-meaning audit (Nov 14, 9:3x PM; read-only, helper agent)

Sim, Nov 14: "make sure there is uniformity between the colors for meanings and generally across the website too. thats a big deal."
Nothing has been changed from this file yet; every fix goes to Sim as a list with pictures first.

## What lines up today
Blue = Top tier / Beats it / Handles it / Favoured / ✓. Grey = Solid / Even match. Amber = Needs work / Shaky / Partly.
Red = Missing a basic / No answer / Unfavoured / ✗. Purple = Tournament ready only.

## Conflicts found (most confusing first; P = app/src/v2/css/pages.css, line numbers as of commit 49d7476)
1. Hidden gem in three colours: blue (P:1613 .ra-gem), purple (P:1904 .gs .ra-gem, the Grandstand key), pink (sugs.css:87 .sg2-tag.gem).
2. "Them" in three colours: pink (Battle Play-by-Play, Compare Team B), red (P:1510 .tr-tug .them, Test Run), grey (P:819 .who .them).
3. ✗ grey on My Team checks (P:47) and Compare (P:414), red on Matchups and Suggestions.
4. "Lead" red on Practice (P:1431, 1447, 1452), blue everywhere else.
5. "Not legal" amber (P:449), not red.
6. A KO is red on the Damage Calc whichever side takes it; blue on Battle when you land it.
7. Types page: ½× amber in the list but red in the grid; 0× red in the list but ink in the grid.
8. Red used as decoration: Home "live" eyebrow and the VS outline (P:1656, 1673).
9. Dead rule: P:798 makes Unfavoured amber, overridden to red at P:852.
10. "Watch" amber or red depending on the case.
11. Info sheet Mega stat drops grey (P:218), Team Sheet drops red.
12. "Raised / up" uses two token names for the same blue (good-text vs plot-text).
13. Blue carries about ten meanings (brand, link, selected, Mega, mine, you, Team A, lead, favoured, Beats it, Top tier, team best).
14. Tier and podium colours sit close to status colours (tier A orange near red, tier B purple near Tournament ready, gold near caution amber).
15. White text on night red: P:1229 .dc2-kt .stamp (--on-type on --bad).
16. "In your box" blue on Six (six.css:80), grey on Suggestions.
17. Damage Calc "Other moves" border: blue→pink gradient (P:1207); pink now means "them".
18. Token hygiene: --low unused; --bp-ink duplicates --plot-text; --good used as text at P:414; tier tokens have no night values.
Unsure (agent): .bt-r .tg em hi/mid/lo (threat severity?), .pp2-rate .bars .l (red "led in X%").
