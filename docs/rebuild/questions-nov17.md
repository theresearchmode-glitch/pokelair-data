# Sim's decision batch (code review + design audit), Nov 16 evening

Pictures: docs/rebuild/pics/nov17/. Each item: options, my recommendation, one-line reason.

## Look (pictures)
1. **Red eyebrow + "VS" (#3)** — q3-red-eyebrow-vs.png. A keep red / B grey eyebrow, blue VS / C blue eyebrow, blue VS.
   Rec C: red stays for danger only; blue keeps the colour and the energy.
2. **Second blue button at night (#7)** — q7-second-main-button.png. A keep / B "Set as Opponent" as a dark plate / C outline.
   Rec B: one blue main action per screen; the plate still reads as a strong button. (By day both are already dark plates.)
3. **Small Unbounded labels (#2)** — unbounded-13px-before-after.png. A switch all 23 to Instrument Sans 700 (the rule) /
   B keep Unbounded for short stamps and tags on plates as a named exception; fix only text that differs from its neighbours.
   Rec B: the switch flattens "Called it", "Start here", "Biggest rise"; the stamps are part of the wow.
4. **Search sheet blur** — blur-search-sheet.png. A keep / B no blur, same dim / C no blur, deeper dim. On mouse screens only.
   Rec C on mouse screens: the reviewer measured 8-9 slow frames with blur, 0 without; C hides the page as well as blur did.
   Header and bottom bar blur: keep (about +1 ms a frame, no slow frames).
5. **"Saved Teams 1" (#12)** — q12-saved-teams-count.png. A keep the count / B drop it.
   Rec A: it tells a returning player a team is waiting. I'm unsure the names-only rule covers buttons.
6. **Eyebrow case** — eyebrows show in capitals (seen in q3). A capitals stay; the "sentence case" rule means how the text is
   written in the code / B change the look to sentence case. Rec A: it is the approved look in every picture so far.
7. **Breakpoints (#4)** — about 30 widths in the CSS vs 3 in the doc. A document the real ones now / B merge to about 6.
   Size of B: large (about 170 media rules, full width sweep after). Rec A now, B after the switch: lower risk.
8. **Orphan mock-ups** — home.html, build.html, battle.html (about 12 MB) sit in the Preview, linked from nowhere.
   A keep / B remove from the Preview only (the copies in docs/ stay). Rec B: faster Preview. Never removed without your yes.

## Score and data (numbers)
9. **A2-I1, edited teams keep their six's record** — test-runs/a2-i1-sixof.md. Bug: every edit keeps the full record.
   A strict fix (moves outside top 6): 550 of 709 real sheets lose part of their record / B looser fix (any move or item real
   players ran): 611 of 709 keep it whole; edits lose theirs. Effect small either way (max 2.5 points). Rec B.
10. **A2-I3, sticky letter** — the band colour holds the old band for 1.5 points; the word and number don't. Example:
    "81 · Tournament ready" drawn in Solid grey. A drop the buffer (number, word and colour always agree) / B make all three sticky.
    Rec A (also the reviewer's): one source, no mixed messages. Then A2-I2 ships with it (79.5 shows "80 · Tournament ready").
11. **A2-I5, Protect family** — the score counts only "Protect"; suggestions count Detect, Spiky Shield... Example: a team with
    5 of them still loses about 3.7 points and no suggestion says why. Fixing it changes the model, so it must pass the
    walk-forward test first. Rec: yes, run that test (background, cheap); you see the result before anything ships.
12. **A2-M6** — the first account load replaces the team; an edit made in that second is lost. Rec keep: merging could mix
    two teams. I'm unsure how often it happens (not measured).
13. **Usage counts per anonymous ID (owner.js)** — privacy. Rec: fine for the Preview; for the public site keep totals only,
    no ID at all (kids use the site).
14. **Names already in git history (C-C2)** — the branch is clean now. Cleaning history means rewriting main for every copy.
    Rec: don't rewrite; I'm unsure whether the repo is public; if it is, that changes my answer.
15. **Main's daily data stores real names** — the live page doesn't show them, but keeps them. Fixing needs your go and the
    NP_PID_KEY secret set on GitHub. Rec: yes, soon (privacy).
16. **Theme name** — the doc now says Night (the code's name); "Dusk" was the old name. Blue for good confirmed (your Nov 12 pick). OK?
17. **Old tests that expect the old site** — 5 tests want the "More pages" menu or an Auto/Light/Dark picker. Rec: update them to
    your approved new design.
18. **Old CSS at the switch (C-M4)** — Rec: remove the old site's CSS when the switch happens, not before.
