# iPhone / iPad look check in WebKit (Safari's engine) — helper, Wed Nov 25 (design6 6806b683; Playwright 1.63.0 WebKit 2359 vs Chromium)
Served over http (file:// blocks the web fonts in WebKit). 60 WebKit + 60 Chromium shots, 10 pages, iPhone 15 / iPad Pro 11 / landscape.
No sideways scroll, no broken images, no page errors in any of 120 shots.
Problems, most visible first:
1. Safari only: the dashed red timeline line is missing on phones (My Team, Winning Teams, Events, News): WebKit drops a dashed
   border at left:calc(-8px - 1.5px) = -9.5px (kit.css:135, phone .k-plan::before); -9px/-10px draws it (2,727 red px vs 0).
2. Home iPhone first screen: "Score My Team" / "Build Me a Team" sit under the fixed bottom tab bar (bar at y=602 of 659).
3. News iPhone: the "series so far" gift row is uneven (4, then 2, then a gap, then a wider Nov tile).
4. Pokémon page iPad landscape: about 370px empty under the left hero card.
5. Meta iPad portrait: "Jump to" chips leave "F · 277" alone on a second line.
6. Home iPad landscape: top-10 band numbers (94, 91) press the band's right edge; Ratings tool tile crowds its 3 labels.
7. Events iPad portrait: the 6th sprite on each ticket is cut by the card's edge.
8. Smaller: Meta iPhone Grandstand 4th card peeks at the edge (a scroller, probably meant); header blur not drawn by Linux WebKit
   (real iOS should blur: not checked on a device); My Team suggestions fill about 2.4 s in WebKit vs 1.5 s Chromium here.
Clean: Battle, Build, My Box, Meta iPad landscape, Pokémon page iPhone/iPad portrait, Winning Teams/Events iPad landscape, News iPad, My Team iPad.
Shots (scratch, not durable): scratchpad/wkshots/ and wkshots-cr/.
