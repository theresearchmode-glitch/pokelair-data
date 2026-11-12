# Decisions made for Sim (one list for every page; Sim's review, Nov 11, item 20)

Claude decides small things under executive control; Sim can overrule any of them. Every new entry is also told to Sim in chat.
Sim's own decisions are marked "Sim". Newest first.

## Authority
- Nov 11 (Sim): authority extended to 9:00 PM Eastern, same instructions (decide on Claude's recommendation, log here, summary at the end).
- Nov 11, 6:02 PM Eastern (Sim): Claude has executive decision-making authority until 7:00 PM Eastern; decisions on Claude's
  recommendation, each logged here and summarised to Sim at 7 PM.

## Every page
- Nov 11 (Claude, under Sim's 6-7 PM authority; review item 19): the player-name sweep found no name on screen on either build, but
  the Preview build wrote 756 real player names into its page source (--preview-data). Fixed in build.mjs: each name becomes the same
  neutral stand-in ("Player 12") everywhere, so team matching still works; measured 0 of 756 in the new Preview source (756 of 756 in
  the old one, so the count can fail). Published right away, ahead of the last Suggestions proofs (the Preview is private, not live;
  privacy first). Still open, Sim's call: names reach visitors' browsers in the daily data (meta/events, meta/teams, meta/weekly) until
  the Player IDs work goes live (needs the NP_PID_KEY secret); the About page still says players can ask to have their name removed.
- Nov 11 (Claude, under Sim's 6-7 PM authority; review item 18): the data's date ("Data as of Nov 10", plus "(N days old)" when
  stale, the shared rule from today's site) is in the footer of every page, and on My Team as a quiet line under the rank.
- Nov 11 (Sim, review item 12, after the colour audit): (1) type colours used as tints (My Team move rows, the move picker bar,
  the My Box wallpaper) follow the rule: hue kept, saturation 72%+, lightness 56% (--tyn-* in tokens.css); near-grey types (Normal, Dark)
  stay neutral grey. (2) Type chips with white text stay outside the pool rule but are darkened, hue kept, until every one measures
  4.6:1 or better (was 5 of 18 at 4.5+). (3) The picked Pokémon's panel in My Box takes that Pokémon's own colour. (4) Grey Pokémon keep
  their coloured floor (some share a similar blue). Pokémon floor colours already followed the rule (346 of 346, measured).
- Nov 11 (Sim): approved everything so far: review items 7, 8, 9; the Matchups helper's choices (Top 10 in 1-5 / 6-10 columns,
  5 + Show 5 more on phones, the next 20 as tiles, Top 12 grid with colour + shape, All 30 grouped with calc reasons, Best fix only
  when it raises the score, the ring shows the Strength Score); and the link rename to "How the Strength Score works".
- Nov 11 (Sim's review item 7, Claude did): every button, link and toggle is at least 44px tall on phones and tablets (a link inside a
  sentence is exempt). experiments/polish-check.mjs now measures this on every page ("tap"); sheets and the empty My Team were measured
  by a separate scratch check. Header logo, nav, Search, footer links, back links, Open My Team, Info Sheet and the Why link were fixed.
- Nov 11 (Sim's review item 9, measured): on phones, nothing on any page ends behind the bottom menu. The polish check now scrolls each page
  to the end at phone widths and lists any text or control behind the menu ("under"). Measured 0 on all six new-build pages at 320, 390
  and 600 wide; the check was proven to catch it by removing the footer's bottom space on purpose (3 footer links 21px behind).
  The new-build check now visits all six pages by default (team, team-empty, box, compare, sheet, guide), not only the style guide.

## My Team
- Nov 11 (Claude, under Sim's 7-9 PM authority; review item 13): the featured underdog stands on a floor ring and pool in its own colour
  (Flapple: gold) on the style guide, empty My Team and empty My Box; the loose red/blue cloud and glow are gone. On empty My Team the
  page's one filled button stays "Build Me a Team" (rule: one main action per screen), so the underdog's "Add Flapple to My Team" is
  outlined; on the style guide sample "Build around it" stays filled. The breathing pool is kept (it sits on the floor, not a cloud).
- Nov 11 (Claude, under Sim's 6-7 PM authority): accepted the Suggestions helper's choices: All Suggestions is a sheet over My Team;
  "Swap my Mega?" is remembered in this browser (np2.swapMega; today's page resets it on reload); "Problems and Team Checks" is a fold
  at the foot of Team Checks, closed by default as today; " · " lists become words by today's shared rule; the "?" bubble has no mascot.
- Nov 11 (Sim's #5, done under her authority): "Nothing to fix" is one quiet paragraph with Battle and Sets as links, not a headline
  (beside optional swaps the big headline read as a contradiction); the swaps under it are introduced as "Optional swaps:".
  Known gap: the Sets link goes to a page the new build doesn't have yet (as does Battle, which shows "Coming next").
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
- Nov 11 (Claude, under Sim's 6-7 PM authority; Sim called the first version "super sloppy"): the picked Pokémon's panel: the rating
  label moved to the top corner on one line (it sat on the floor ring), the Pokémon's colour rises from the floor instead of a flat
  wash, and the phone sheet stacks picture, name and types (the name broke mid-word in a narrow column).
- Nov 11 (Sim's review item 8, Claude did): the light rays are gone from the box wallpaper and the picked Pokémon's panel (rays are for the
  Home hero only). The blue mark's key ("On your team") moved from the box-link tools at the bottom to just above the grid, shown
  only when that box has a team member.
- Nov 11 (Claude), CHANGED: the box search now leaves out Pokémon already in the box (as today's site and BOX-02 expect).
  This replaces the earlier decision to show them greyed with "In your box". Sim can pick either.
- Nov 11 (Claude): the box search is named "Add a Pokémon to your box".

## Data
- Nov 11 (Claude, proposed, not done): the daily ratings log also saves the shown 0-100 number next to the raw total, so a raw 89
  and a shown 94 can't be mixed up again.
