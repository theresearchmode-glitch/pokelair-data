# My Team and Meta on phones: what makes them long, and 3 ways each to shorten them (look-only)
Helper write-up, measured between 10:35 PM and 11:09 PM Nov 19 by the clock (now.sh), on t1rules 5c1d1bcf.
Sim's rule (Nov 19): "make sure our pages are not running super long on mobile."
Nothing was changed in the site code. Every option is CSS/JS put into the built page with Playwright; the files are in
docs/rebuild/research/team-meta-length-nov20/ (mA/mB = Meta, tA/tB = My Team; sec.cjs measures, pic.cjs takes pictures).

## How measured
- Build: `node build.mjs --v2 --preview-data --art=../src/v2/art/` -> app/dist/v2.html (sprites: dist/sp linked to app/sp).
- `node sec.cjs <page> <width> <light|dark> <injections>`: 844 tall, touch, opens the page, waits for loading, applies the
  option, scrolls through once, reads `document.documentElement.scrollHeight`. Screens = height / 844 (same as page-length-390-nov19.md).
- My Team uses the sample team (Sun Tailwind, 92), as the Nov 19 list did. A second "weaker team" (Snorlax, Drampa, Politoed,
  Vivillon, Corviknight, Hippowdon; weak.js sets S.slots) was measured too, because a real player's team usually has
  suggestions and failed checks, which makes the page longer.
- Light and dark give the same heights for every row below (checked at 320, 375 and 390).

## Today
| page | 320 | 375 | 390 | 390, weaker team |
|---|---|---|---|---|
| My Team | 5.34 | 4.11 | 4.07 | 4.80 |
| Meta | 4.21 | 4.06 | 4.04 | - |

### My Team at 390 (sample team), heights in px (sec.cjs SEC=...)
- Header bar 60
- Hero 1304 = band 38 + score head 429 (name + score 133, "Teams scoring like this..." line, Why/Team Sheet links, the
  Saved / Share as Image / Saved Teams / More buttons 100) + the six 758 (cards 564, "Tap a Card" 20, Game Plan 115)
- Jump bar (Matchups / Suggestions / Team Checks) 45
- Work area 1647 = Matchups 784 (intro, counts, calc line 191; view picker 88; Stand-Outs 446) + Suggestions 345 +
  Team Checks 244 + Your Games 89, with 40px gaps
- Footer about 380
- Weaker team: Suggestions 744, Team Checks 726 (the work area grows to about 2240).
- At 320 the six goes two cards a row in three groups: the cards alone are 1055 (hero 1877). That is why 320 is 5.3.

What makes it long: the four work sections are stacked one under another, and on a real team two of them get long.
The hero (1.5 screens) is the approved Hand; I left it alone (any cut there is a design change for Sim).

### Meta at 390, heights in px
- Header bar 60
- Top 1023 = title, tabs, sub-tabs, links 382 + search, count and 6 filters 253 + the #1 spotlight 352
- "The Grandstand" title + view switch 82
- Six tiers 1578, each about 263 = colour band 42 + a separate line with the tier's words and "See All" 44 + one row
  of tiles 154 (+ gaps)
- Legend line 39, About the ratings 95, footer about 440

What makes it long: six tiers, and each spends a whole extra line on its words and See All.

## My Team options (390 sample / 390 weaker team; 375; 320)
| option | what changes | 390 | 390 weaker | 375 | 320 |
|---|---|---|---|---|---|
| today | - | 4.07 | 4.80 | 4.11 | 5.34 |
| A Fold in Matchups | the 4 Favoured stand-outs fold behind "Show 4 Favoured ›" (real button, aria-expanded/aria-controls, toggles a class); view picker one row of 4 | 3.88 | 4.76 | 3.92 | 5.00 |
| B Tabs (RECOMMENDED) | the existing bar under the six becomes real tabs on phones (role=tablist/tab/tabpanel, arrow keys): one of Matchups / Suggestions / Team Checks shows at a time; Your Games stays under it; Suggestions tab shows its count ("Suggestions 3") | 3.27 | 2.96 | 3.32 | 4.38 |
| C A + B | both | 3.08 | 2.92 | 3.12 | 4.03 |

Other tabs in B, 390: Suggestions tab 2.75 (weaker 3.22), Team Checks 2.64 (weaker 3.20).
- A, why: the Unfavoured four (the problems) stay; the good news is one tap away. Small gain (0.2, and 0.04 on the weaker team).
- B, why: the bar is already there and sticky; it now switches instead of scrolling, so the page is as long as one section.
  Nothing is removed: every section is one tap away and keeps all its content.
- C, why: a little shorter than B, but adds a second fold for 0.1-0.2 of a screen.
- Built for real, B needs: the chosen tab kept in V2.ui (so a redraw keeps it), jumpSync off on phones, the grid's
  named rows dropped in tab mode (else the hidden sections leave 40px gaps: measured 3.37 with them, 3.27 without), and
  desktop (700+) unchanged. Desktop was not touched by any option (all CSS is inside max-width:699.98px).
- B's risk, said plainly: a player sees Suggestions only if they tap the tab. The count on the tab is my answer to that;
  I'm unsure it is enough, so it is a question for Sim. Not checked: screen-reader output (only the roles were set).

## Meta options
| option | what changes | 390 | 375 | 320 |
|---|---|---|---|---|
| today | - | 4.04 | 4.06 | 4.21 |
| A Words in the band | each tier's words ("Top of the format") sit under "90+" inside its colour band, and See All moves onto the band (underlined, tier ink); the separate line goes | 3.74 | 3.76 | 3.96 |
| B Fold D and F | D and F tiers fold behind one "Show D and F tiers ›" button (296 more Pokémon, rated under 60), real button with aria-expanded/aria-controls; "Show Fewer" folds them again | 3.55 | 3.57 | 3.73 |
| C A + B (RECOMMENDED) | both | 3.35 | 3.38 | 3.55 |

- A, why: the band already says the tier; putting its words and See All on it saves one line per tier and drops nothing.
  At 320 the words wrap to two lines inside the band and See All stays on it (picture LEN-meta-C-both-320).
  Contrast: the words use the band's own --tier-ink, as the band's count already does.
- B, why: most players look for the top tiers; D and F stay one tap away, plus in Search and the List view.
  Against it: Sim's underdog idea celebrates low-rated Pokémon; folding F hides them a little more. Sim's call.
- C, why: the biggest cut (4.0 to 3.4) and each half is simple.

## Recommendation
- My Team: B (tabs). One clear change, biggest cut: 4.1 to 3.3 (weaker team 4.8 to 3.0), nothing removed.
- Meta: C (words in the band + fold D and F). 4.0 to 3.4, every tier and Pokémon still one tap away.
- Not solved by any option: My Team at 320 stays 4.0-4.4 because the six goes two-a-row there (cards 1055px).
  That is the approved Hand, so it is a separate question for Sim.

## Side notes
- `document.body.scrollWidth` is 8px wider than the screen on My Team (the cards' big watermark names, .mc-giant);
  `documentElement.scrollWidth` equals the screen width, so there is no sideways page scroll. Measured with inj/sw.js (scratchpad).

## Pictures (docs/rebuild/pics/nov20, 390 wide at 2x unless named)
My Team: LEN-team-0-today-390, LEN-team-A-fold-matchups-390, LEN-team-B-tabs-RECOMMENDED-390, LEN-team-B-tabs-dark-390,
LEN-team-B-tabs-suggestions-tab-390, LEN-team-B-tabs-320, LEN-team-C-tabs-plus-fold-390, LEN-team-whole-today-vs-B (1x).
Meta: LEN-meta-0-today-390, LEN-meta-A-words-in-band-390, LEN-meta-B-fold-D-F-390, LEN-meta-C-both-RECOMMENDED-390,
LEN-meta-C-both-dark-390, LEN-meta-C-both-320, LEN-meta-C-both-opened-390, LEN-meta-whole-today-vs-C (1x).
