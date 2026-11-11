# Decisions made for Sim (one list for every page; Sim's review, Nov 11, item 20)

Claude decides small things under executive control; Sim can overrule any of them. Every new entry is also told to Sim in chat.
Sim's own decisions are marked "Sim". Newest first.

## Every page
- Nov 11 (Sim's review item 7, Claude did): every button, link and toggle is at least 44px tall on phones and tablets (a link inside a
  sentence is exempt). experiments/polish-check.mjs now measures this on every page ("tap"); sheets and the empty My Team were measured
  by a separate scratch check. Header logo, nav, Search, footer links, back links, Open My Team, Info Sheet and the Why link were fixed.

## My Team
- Nov 11 (Sim): the selected Pokémon stands on a floor ring in its own colour (idea 2), no panel behind it.
- Nov 11 (Sim): action strip under the six (− Remove, Lock, Set as Lead, Edit Set); a locked Pokémon shows a padlock before its item.
- Nov 11 (Sim): Matchups opens on the stand-outs (Unfavoured, Favoured) with "See all 30"; Team Checks fold to one line when all pass;
  Set shows only details and moves; the band meter lives only in Why this score?; Save Team, Share, Saved Teams visible, the rest in More.
- Nov 11 (Claude): the new build keeps its Matchups view under its own saved key (np2.seg.thr), so today's page never meets "Stand-outs".
- Nov 11 (Claude): narrow Matchups shows the four view buttons as a 2 by 2 (each label on one line) instead of a sliding row.
- Nov 11 (Claude): on phones under 400px the Saved Teams count is hidden in the action row (the header's Switch Team shows it).
- Nov 11 (Claude): on wide screens the win line, rank and Why this score? sit under the score, the six fill the right side.
- Nov 11 (Claude): header reads "My Team · 6 of 6 · Sun team" with the team name as the page heading; Legal mark in the jump bar
  (in the header on windows under 960px).
- Nov 11 (Claude): Your Games sits under Suggestions on desktop.
- Nov 11 (Claude): Title Case on buttons and headings; the new words follow the word list (Strength Score, Matchups).
- Earlier (Claude): EDIT-08 says how the Strength Score moved; TEAM-07/08 the new jump bar at every width.
- Nov 11 (Sim): the featured underdog replaces Darkrai on empty screens (TEAM-19, BOX-07, X-03).

## Compare
- Nov 11 (Claude): "Why These Scores" (not "Why these grades"), both teams side by side; the tested-on line and the key once below.
- Nov 11 (Claude): "← My Team" back link in the eyebrow (also My Box).

## My Box
- Nov 11 (Claude), CHANGED: the box search now leaves out Pokémon already in the box (as today's site and BOX-02 expect).
  This replaces the earlier decision to show them greyed with "In your box". Sim can pick either.
- Nov 11 (Claude): the box search is named "Add a Pokémon to your box".

## Data
- Nov 11 (Claude, proposed, not done): the daily ratings log also saves the shown 0-100 number next to the raw total, so a raw 89
  and a shown 94 can't be mixed up again.
