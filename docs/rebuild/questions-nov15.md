# Questions waiting on Sim (collected time: 12:23 AM (12:23:13)  date: Sun Nov 15, 2026). Each goes to Sim with its pictures, one option marked RECOMMENDED with a reason.

1. Colour list (docs/rebuild/colour-audit.md, 18 items), the biggest: pink (--pick, them / Team B) vs red (--bad) too close in light mode;
   their Megas labelled "Mega" in our blue (blue = you); "Them" grey on Who Moves First but pink on the poster; Watch amber vs red; Delete in blue;
   a selected tab / Revision / weather chip that looks like the main button.
2. Battle page height limits (390 4,179 vs 4,100; 1440 2,331 vs 1,950; tabs open much taller).
3. Build: "496 games" (this six at events) vs "479 real games" (the model's games) — say which is which.
4. Build: the opened winner panel inside the Reference sheets frame (box in a box?); bottom tabs change style before/after building.
5. Weather Map section-9 items: the Your team's style plate, Your style tags, No. 1-8 ranks, the names; the guide's no-team message.
6. Weather Map is taller now (row heights from the counts so a bigger region always means more teams).
7. Track Record: the paper is white in dark mode too (the brief's design).
8. This Week's way in: "This Week ›" under Home's What Changed This Week (no Meta tab for it yet).
9. Game Plan strip (My Team, Battle) now left-aligned (was centred).
10. Naming leftovers: Share / Share as Image / Save Image / Team Poster; Tournaments vs Events; the replace-team confirmation wording.
11. The Slab share card (built; pictures: pictures-nov15/slab-*-built.webp, share-sheet-slab-390.webp): ship it as the 4th choice in the share
    sheet? Print and Aurora follow the same way once you say go.
12. The three info pages (drafts; pictures: pictures-nov15/info-draft-*.webp): How We Calculate as ten numbered tiles that open their
    working; About & Legal as "The Fine Print" rows beside "Everything We Save"; Send Feedback as one question, five kinds, a box. Yes, or changes?
13. Selected chips (re-audit Battle #9; picture: pictures-nov15/battle-chip-1280.webp): a picked chip is solid black everywhere on the site
    (Battle's weather, Events' filters, Ratings' filters), so it can look like a main button. RECOMMENDED: keep it as is (one look for every
    picked chip; the slanted shape and smaller size already tell it apart). Other choice: picked chips in PLOT blue site-wide.
14. Battle's top area at 1440+ (picture: pictures-nov15/battle-empty-right-1920.webp): the headline, Their Six and Your Games all sit on the
    left and the right half is empty (your space rule). RECOMMENDED: on wide screens, move Your Games (Win / Loss / Log from a Showdown
    Replay) into the empty right half beside the headline; it fills the gap and should make the page shorter (my guess, not measured; I measure before building). Other choice: leave it.
15. Team Sheet, after editing a set (re-audit #14; picture: pictures-nov15/team-sheet-1280-built.webp): tapping a column opens Edit Set,
    and closing it leaves you on My Team, the same as today's live site (checked: 76-team-sheet.js). RECOMMENDED: closing Edit Set
    brings you back to the Team Sheet you came from, so you can check the change and edit the next one without reopening it.
    Other choice: keep today's way.
16. Ratings date (Meta audit #7; picture: pictures-nov15/meta-data-date-1280.webp): the Preview says "data as of Nov 1" while the footer
    says Nov 10. Checked: the ratings code only uses the daily refresh while it is at most 3 days old; past that it drops it and shows
    the snapshot built into the page, which is even older (Nov 1). The live site refreshes daily, so this only shows if the daily job
    fails for 3+ days, but then the site falls back to OLDER ratings than it has. RECOMMENDED: when the refresh is past 3 days, keep
    using it (the newest we have) and say its date plainly; reason: older data is never better than newer data. This is shared rating
    logic, so I have not changed it. Other choice: keep today's rule.
17. Events tickets on small phones (audit C8; picture: pictures-nov15/events-ticket-320.webp): event names are now cleaned (no emoji or prize
    text; most fit in 2-3 lines at 320, were up to 9). Under 390 wide the name column is only ~95 px beside the big winner sprite, so a long
    word still breaks mid-word ("HOSPITA/L"). The page asks for proper hyphenation; iPhones may show "HOS-PITAL" instead, which I can't
    check from here (unsure). RECOMMENDED: under 390, move the winner sprite down beside the five so the name gets the full ticket width;
    reason: no word ever breaks (it may also make the ticket shorter: my guess, not measured). Other choice: keep it and rely on hyphenation. Could you glance at Events on
    an iPhone mini/SE size (375 wide) if you have one?

## Pictures and recommendations for questions 1-10 (added time: 4:56 AM (4:56:09)  date: Sun Nov 15, 2026; pictures from the real-data build, v156)
1. Colour (pictures: q1-compare-teamB-pink.webp, q1-unfavoured-red.webp): Team B / "them" pink sits right beside "Unfavoured" red, and in
   light mode the two read as one colour, so "the other team" looks like "bad". RECOMMENDED: give them / Team B a clearly different hue
   (the designer's original magenta from the briefs), keep red only for bad; reason: a colour should mean one thing. The other 17 colour
   items are in colour-audit.md; I suggest we go through them together in one sitting.
2. Battle height (pictures: q2-battle-390-full.webp, q2-battle-1440-full.webp; measured today: 390 is 4,179 px vs the 4,100 limit, 79 over;
   1440 is 2,331 px vs 1,950, 381 over). RECOMMENDED: at 390 raise the limit to 4,200 (79 px is less than one row); at 1440 do question 14
   (Your Games into the empty right half) and measure again; reason: fix the real waste first, not squeeze good content.
3. Build's two game counts (pictures: q3-build-496.webp, q3-build-479.webp): "83 players, 496 games" (this exact six at events) and "479
   real games, with its players' skill taken out" (Why This Score). Both are true. Checked in the code (six.mjs line 23): the score
   counts only games where BOTH teams' full six is known, and leaves out draws and mirror matches; the 496 counts every game this six played. RECOMMENDED: say it in words on both lines
   ("496 games at events" / "479 of them used for the score"); reason: two different numbers for one thing looks like a mistake.
4. Build's opened winner (picture: q4-build-reference-open.webp): the opened team sits inside the Reference Sheets frame. Measured (4:56 AM by the clock, computed
   styles): the opened panel has no background of its own, it shows the frame's paper (rgb 251,252,254), so no second shade. RECOMMENDED: keep; reason: it reads as a sheet
   pulled out of the binder, which is the Blueprint idea.
5. Weather Map section-9 items (picture: q5-weather-1440.webp: Your team's style plate, Your style tags, No. 1-8 ranks).
   RECOMMENDED: keep as built; reason: every item uses real counts and the plate answers "where does my team sit" at a glance.
6. Weather Map height (picture: q6-weather-390-full.webp; measured 2,233 px at 390). RECOMMENDED: keep; reason: the region sizes are the
   information (a bigger region means more teams), shrinking them would make the map lie.
7. Track Record paper in dark mode (picture: q7-track-night-390.webp). RECOMMENDED: keep the white receipt; reason: it is the brief's one
   bright object, and its text passes contrast (measured at 390 in night mode: lowest 5.86:1, the blue "20×" on white; the minimum is 4.5:1).
8. This Week's way in (picture: q8-home-more-fold.webp): today the only way in is "What Changed This Week" inside Home's closed "More on
   Home" fold, and the 12-tool grid has no This Week tile. RECOMMENDED: add "This Week" as a fourth tab beside Winning Teams / Events /
   Archetypes (where players already look at results); reason: today it is hidden two taps deep.
9. Game Plan strip (picture: q9-gameplan-strip.webp): now left-aligned. RECOMMENDED: keep left; reason: it starts where the cards'
   text starts, so the eye doesn't jump.
10. Naming leftovers: RECOMMENDED: "Share as Image" on every share button, "Save Image" only inside the share sheet, "Events" as the page name
    everywhere ("Tournaments" stays only as the group label in the Meta tabs); reason: one name per action (your Nov 14 rule).
