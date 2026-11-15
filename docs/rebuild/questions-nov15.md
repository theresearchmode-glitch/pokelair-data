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
    reason: no word ever breaks, and the ticket gets shorter. Other choice: keep it and rely on hyphenation. Could you glance at Events on
    an iPhone mini/SE size (375 wide) if you have one?
