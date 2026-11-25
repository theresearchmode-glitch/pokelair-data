# Accessibility check, check216.html (look-only)
Method limits first: contrast on plain backgrounds is exact (computed colours). Where an ancestor has a gradient/image (8,823 of 12,788 text items; mostly translucent tints, .ff/.hm-rk/.np-score), I did NOT trust CSS: I screenshotted each route with text made transparent and measured the real pixels under each text box (median pixel = verdict, 10th percentile = worst spot). Boxes that include page background around the chip, and sticky/fixed bars in full-page shots, can mislead; those are flagged "unsure". 888 gradient items were off-screenshot and skipped. Day+night, 390 and 1440, 22 routes. Fold/tip tests ran at 390 (folds) and 1440 (tips) in day mode only.

## Findings, most serious first
1. [CONTRAST, day] pokemon=kingambit / sneasler, `dt` stat names, 15px bold (needs 4.5): Defense amber rgb(181,131,0) on (244,240,234) = 2.98; HP 4.35; Attack 4.40; Speed 4.45. Exact (plain background). Meaning: the "Defense" label is hard to read; the other three miss by a hair.
2. [CONTRAST, day] method, `b` "60s" band word, amber rgb(233,168,0), 16px bold: median 2.00 (gradient tint, measured from pixels). Meaning: the 60s band word is nearly unreadable in day mode (also check the np-score "60s" on team if it is this colour; team band words were not flagged).
3. [CONTRAST, both] archetypes + weekly, `b.u` / `span.ar-nm.u` white text, 13-24px: "Sun" chip 1.82 (13px/900, 15px/900, 24px, 28px, 22px "29%"); "No. 1/No. 2" 3.47 at night; `span.c1/c2/c3` white 3.47-3.53 at 13px; `span.tk-k` "Winner's team" white a0.92 3.63 (events, weekly). Meaning: white text on the yellow/amber Sun-weather colour fails badly; other white-on-colour labels are 3.5, short of 4.5.
4. [CONTRAST] "Mega" label, `span.mg`: day rgb(0,104,173) on tinted ground 3.07 (tournaments, 13px), 4.1-4.4 (team, calc, home .ffm, 13-17px); types 28px "Mega" 2.27 day. Night rgb(98,190,247): 1.19-1.46 on types 28px (probably a light tile behind it, unsure), 3.27-3.67 on tournaments/calc. Meaning: the blue Mega tag is under 4.5 on tinted cards in several places.
5. [CONTRAST, unsure] usage day 390 `a.on` white "Usage" 1.04 (also "Ratings"/"Winning Teams" in the same measurement): active tab pill; the pill is probably sticky so the full-page shot sampled the wrong pixels. Probably a measurement artefact; please eyeball the active tab text.
6. [CONTRAST, borderline] `em.ff-ld` "Lead" day blue 4.60 median but 10th percentile 1.24 (small tag on a coloured card edge, 13px); `span.mg` 4.1-4.4 (see 4).
7. [PASS, as asked] Type chips `span.np-type` (white on type colours): lowest 4.60 (Fire-ish 190,87,24), 4.62-4.71 others, day and night, 13px: all pass, very thin margin. `button.tc-tp` pressed chips 4.62-4.65 pass; unpressed type buttons median 9.0 (day) / 9.6 (night), but 10th percentile 3.9 / 2.75 at the gradient edges (unsure). np-link (new link colour): day 5.4-5.6 median, "Show ›" 4.62 median / 4.53 worst; night 7.7-9.1. Passes. Tier tags (.tier-tag, .ra-tk, .gs-blk) and .np-score band words: not flagged except the "60s" in item 2.
8. [FOCUS] check 4 (5 routes x 30 Tabs = 150 stops, 148 landed on an element): every control shows a 3px solid outline (many also a blue ring); no element lacked an indicator except `input` "Find a Pokémon or type" (meta): the input itself has outline none, but its wrapper `.np-field` gets a solid outline on :focus-within, so it passes in practice. Two Tab stops left the page (focus on body/browser UI), not a defect.
9. [TIPS] "?" `button.sg2-tip` exist only on team (2: Checklist, Handles the top threats) and meta (2: "How to read our numbers" etc.). home, method, pokemon=kingambit have 0 tips (nothing to test).
   | route | reachable by Tab | Enter opens | Escape closes |
   | home | n/a (0 tips; 200 Tabs no tip) | n/a | n/a |
   | team | yes (57 Tabs) | yes (retest; first automated pass read "no" at once, repeat runs 2 of 2 yes, popup 340px wide) | yes, focus stays on the tip |
   | meta | yes (11 Tabs) | yes | yes, focus stays on the tip |
   | method | n/a (0 tips) | n/a | n/a |
   | pokemon=kingambit | n/a (0 tips) | n/a | n/a |
   Notes: popup has role=dialog, tip has aria-expanded + aria-label "What is ...?". On open, focus remains on the tip button, not moved into the dialog: fine for a tip, but a screen-reader user is not taken to the text unless aria-controls/describedby links it (aria-controls is null). Meaning: tips work by keyboard; popup text is not programmatically tied to the button.
10. [FOLDS] All <details> (team 3, build 3, meta 1, events 1, weekly 1, calc 3, types 1, gauntlet 1, method 10, about 7): every one has a visible <summary>, and clicking a summary toggled it (sampled up to 3 per page).
11. [FOLDS, expanders] aria-expanded buttons toggle correctly on pokemon=kingambit/sneasler ("All Moves and Items", "Show ›": false/true/false). Tip buttons gave false/false/true in the bulk run, but a direct clean test (team 390 and 1440, meta 1440) gave open, closed as expected, so I treat that as a test artefact, not a bug. A few expanders ("Types 18", "Ranks 11-60 ›", "Show All 30 ›", "Open a Box Link", gauntlet rows) replaced their own button when clicked, so I could not read a second value: they expand one-way (no collapse button) or re-render; unverified whether they collapse.
12. [FOLDS, buttons showing content without aria] Sampled 14 non-aria buttons per route (about 300 total) for big visible-count changes: events "Gdansk Regional Results ›" (np-link, 816 to 1691 elements, no aria-expanded/pressed; it re-rendered, so it may navigate/replace instead of expand) and archetypes weather rows `.ar-reg` (213 to 171, no aria). Meaning: two spots reveal or change content with no state announced. Sampling only; not exhaustive, ~25 timed-out clicks on meta/gauntlet after rerenders were not measured.

## Couldn't measure / caveats
- Gradient items are pixel-sampled, so +-0.3 noise; chips are small. Items with transparent text (giant watermarks .mc-giant, .inf-no) excluded.
- Not tested: night mode for folds/tips/focus, 390 for tips/focus, forced-colors, screen-reader output, popup positioning offscreen.
- First bulk script for folds+tips hung on re-rendering pages; I split it (c2, c34).

## Commands / files (all in /tmp/claude-0/-home-user-pokelair-data/25f65f15-063e-5621-be2b-3a9994dfed43/scratchpad/agents/a11y/)
node c1.cjs  (plain-bg contrast, c1.json; analysed with an1.cjs)
node c1b.cjs; python3 -W ignore an1b.py; python3 -W ignore sp.py  (pixel-sampled gradient contrast, shots/*.png, c1b.json)
node c34.cjs (tips + focus, c34.json); node t.cjs, t2.cjs, t3.cjs (tip/input follow-ups)
node c2.cjs (folds, c2.json)
