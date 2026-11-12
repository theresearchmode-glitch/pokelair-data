# Rules for working on NastyPlot (Sim, Nov 11 night). Read before any work.

CLAUDE.md points here. These rules came from the Nov 11 chat after Sim found that the records and the Preview were wrong.
Where an older line in CLAUDE.md says otherwise (e.g. "Faster flow: put fixes live directly", "decide on your own
recommendation" under authority), the rules below win.

## 1. Rules Sim gave in chat (Nov 11, ~10:30-11:30 PM Eastern)

1. **No design decision without Sim. Ever.** Every visual or design choice goes to Sim first, with screenshots, and waits
   for her yes. This applies during executive authority too. Authority covers only non-visual work (bugs that change
   nothing on screen, checks, records, tests). Nothing visual goes to the Preview or the live site without her yes.
   (Sim: "NO DESIGN DECISIONS WILL SHOULD EVER EVER EVER BE MADE WITHOUT ASKING ME AND PROVIDING SCREENSHOTS FOR VISUALS.")
2. **Every "checked" says where and what.** Any time Claude tells Sim something is checked, it states:
   (a) built page or mock-up (and which file and commit), (b) the exact result line, (c) a plain-English sentence saying
   what that result means. No result line = not "checked".
   Example: "Built page (foundation.html, commit 636aa5c), polish-check.mjs: glow 1, space 11, page errors 0. In plain
   words: the page loads with no errors; one text has a glow, which breaks our no-glow rule; the 11 spacing flags are
   mostly false alarms from auto margins, and I've named any real ones."
3. **Quality over speed.** No racing a deadline. One item at a time: before/after screenshots and Sim's yes for anything
   visual, then a use test on the built page (click, tab, reload, not only measure), then the result lines. Read the
   whole page top to bottom with your own eyes before anything is published. If something needs more time, take it and
   say so.
4. **Stop means stop.** When Sim says pause or stop, do nothing else (no edits, builds, publishes or helpers) until she
   says go. Look-only tests already running may finish; report them, change nothing.
5. **My Box access:** a small icon at the top next to Day/Night. Never a sixth place in the top menu or the phone bar
   ("waaay too much"). Sim likes the idea of a Pokémon-style PC icon; options go to her with pictures first.
6. Sim likes the frosted glass on the bars (keep it; text behind must still never be legible, rule C9).
7. Sim's bug reports usually come from her iPhone in the Claude app, the iPad, or the Claude desktop app on Windows.
   Test in Safari's engine too (Playwright `webkit` with `devices['iPhone 13']`), not only Chromium.
8. When Sim gives authority: confirm expressly (scope + end time), log every decision in docs/rebuild/decisions.md,
   summary at the end (already in CLAUDE.md). Rule 1 still applies inside it.

## 2. Part C: rules for every page from here on (Sim's fix plan, Nov 11, word for word)

C1. Measure the real built page, never the mock-up. A page is not "done" and not on the gallery
    as "built" until its heights are measured at 320, 390, 820 and 1440, with real data, in the
    default state AND the worst state (longest name, a 5-of-6 team, after an Apply, every section
    open), and all are inside the limits. Put the numbers and the date in page-heights.md.
    If a page cannot fit, stop and bring Sim options. Do not ship it over and note it.
C2. No claim without a result. Any sentence on the gallery or in a report that says "checked",
    "same numbers", "inside the limits" must name the check and its result line. If the check
    has not been run on the current commit, the sentence comes off.
C3. Read the whole page once as a new player before calling it done. Look for: the same thing
    shown twice, two statements that disagree, a count that does not match the list under it,
    a button that is louder than what it does.
C4. One main action per screen, in both modes. Count them on a screenshot. Selected states are
    not allowed to look like the main action.
C5. No full-page redraw after first paint. Late data updates its own section, keeps focus where
    it was, and does not change the height of anything above the fold.
C6. One status message per action, one Undo.
C7. Anything hidden is not focusable.
C8. Every tap target 44x44 or larger on touch widths.
C9. Fixed bars: text behind them must never be legible, and the last content on the page must
    clear the bottom bar.
C10. Links only go to pages that exist. Unbuilt pages are marked, not faked.
C11. Symmetry check on every row of repeated things: same dividers, same label positions, same
     name-block shape for selected and unselected.
C12. A page counts as done only after a use test, not a picture test: click every control at
     390 and 1440, tab through the whole page once, open and close every sheet, do one
     change-and-undo, reload. Zero console errors. Write the result in the page's notes.
C13. Add these as an automated check that runs on every built page, so they are caught by the
     build and not by Sim: page height against the limit table, sideways scroll, broken images,
     tap targets under 44, focusable-but-hidden controls, lines of text repeated on the page,
     more than one main button visible, console errors. Say plainly which of C1 to C12 the
     automated check does not cover; those stay manual.

The full fix plan (Part A bugs, Part B causes, order of work) is in docs/rebuild/my-team-fix-plan.md.

## 3. Executive authority (Sim, Nov 12; also called "express authority")
When Sim says "I am giving you executive authority" (or "express authority"), Claude replies at once confirming it understood
the rules, heard her, and will carry on with this authority, restating the scope and the end time. Then, until that time:
- Claude keeps working on its own and is in charge: it decides on its own recommendation for everything EXCEPT visual or
  design choices. Those always wait for Sim, with pictures (rule 1). Sim will not be at her computer or reading the chat.
- Claude may start helper agents and subagents at its own discretion, keeping usage moderate (not heavy); it says afterwards
  which helpers ran and why.
- Every other rule still applies (checks with result lines, one item at a time, nothing published to the artifact without
  Sim's go, stop means stop). Every decision is logged in docs/rebuild/decisions.md; a summary goes to Sim when the time is up.
