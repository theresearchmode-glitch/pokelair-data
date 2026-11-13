# Rules for working on NastyPlot (Sim, Nov 11 night). Read before any work.

CLAUDE.md points here. These rules came from the Nov 11 chat after Sim found that the records and the Preview were wrong.
Where an older line in CLAUDE.md says otherwise (e.g. "Faster flow: put fixes live directly", "decide on your own
recommendation" under authority), the rules below win.

## 00t. Times come only from the clock (Sim, Nov 13, rule written 8:54 AM Eastern by the clock: "I am very very punctual about timing")
Every time written anywhere (messages to Sim, checklist notes and 't' fields, docs, commit messages, scheduled task prompts) is
copied from `bash docs/rebuild/now.sh` run in the SAME step, never typed, estimated ("6:2x", "~3:25") or reused from an earlier
reading. decisions.md entries go through log-decision.sh (it reads the clock itself). Checklist notes carry no hand-written
time: the 't' field comes from now.sh. Every session runs `git config core.hooksPath .githooks` first: the commit-msg guard
refuses placeholder/estimated times and times later than the clock.

## 00. Honesty and openness (Sim, Nov 12, 5:12 PM Eastern; applies AT ALL TIMES, to every chat; never to be repeated)
Written after Claude told Sim "I'm fixing these now" at 4:02 PM and then stopped for an hour while holding her authority.
1. Sim's questions come first, always. When Sim asks a question, it is answered before anything else, every time. No question
   of hers goes unanswered.
2. WORKING or STOPPED, loud and clear. Every message to Sim starts with **WORKING** or **STOPPED**. If work stops, say so and why;
   Sim never has to find out by asking. Under authority, never end a turn while work remains: an open question gets the
   recommended default, logged with the clock's time, and work continues; keep a wake-up scheduled a few minutes ahead as a
   backstop.
3. Nothing claimed before it's real. Never say something is being done unless the very next action starts it. Never say
   something is done or checked unless it was actually run.
4. Every check shows its proof: the command, its result line quoted exactly, and the plain-English meaning. Not checked = say
   "not checked".
5. Mistakes are reported at once: the moment something told to Sim is found to be wrong, tell her first, before other work.

## 00b. Pictures right next to every design question (Sim, Nov 12, 7:15 PM Eastern; for now and always)
Every design question to Sim carries its picture(s) in the SAME message, right next to the question: send the files with that
question (one question per message when pictures differ), never "see the picture above". She should never scroll up and down
the chat to match a picture to a question. When Sim is away at her computer, reach her with a phone notification.
Unanswered questions come back (Sim, Nov 12, 8:23 PM): if Sim replies but skips one of Claude's questions, raise that
question again in the next message, with its picture(s) again right next to it. Keep a short "still waiting on you" list at the
end of messages until each one is answered. Never drop a question silently.
Every picture is labelled (Sim, Nov 12, 9:30 PM: "I can't answer ... bc you stopped labeling the pictures with which option it is"): the
question number and option name are printed ON the picture itself (e.g. "Q1 · OPTION B1 · Speed line"), not only in the caption.
The recommended option says so ON its picture too (Sim, Nov 12, 10:15 PM): e.g. "Q5 · OPTION A · RECOMMENDED · log always shown".
EVERY option gets its own labelled picture, even "no change" / "wait" (a picture of the page as it stays, labelled e.g. "Q6 · OPTION B · no change") (Sim, Nov 12, 10:24 PM: "I don't know which one is A and which one is B").

## 00d. The Rebuild Checklist is always up to date (Sim, Nov 12, 11:20 PM Eastern; TOP PRIORITY, permanent)
The Rebuild Checklist page (https://claude.ai/artifact/E99Mux9sZxxBuvFXEsKW1V; guide: docs/rebuild/checklist.md) is the shared
record of where every page stands. Keep it current at all times:
1. Any time a step changes (mock-up approved, built, tests run, checks run, on the Preview, Sim's OK), or something is found missing
   or unsure, update the checklist in the SAME message as the work, before moving on. No batching for later.
2. Five states: done (blue), partly (amber, the note says what is left), unsure (purple, the note says why), blocked (red), not started.
   Mark "unsure" whenever Claude is not certain; never tick done without the check that proves it.
3. Every missing feature or open question becomes its own open item; close it only when it is checked.
4. At the start of every chat, read the checklist; at the end of every work session, confirm it matches HANDOVER.md.
5. A page is "Built" only when every one of today's features for it (docs/rebuild/inventory) is found on the new site.

## 00c. Every recommendation comes with a short reason (Sim, Nov 12, 8:55 PM Eastern; for now and always)
Whenever Claude recommends something (an option, a default, a design, a next step), it gives a short, quick reason why, right
next to the recommendation: one line in plain words. Example: "I recommend C. Why: blue and red stay easy to tell apart for
colour-blind players, and fewer approved pages change."

## 0. No yes-man (Sim, Nov 12, ~9 AM Eastern; applies AT ALL TIMES, to every chat)
"If I am saying something that you do not agree with or are not sure of, make that be known AT ALL TIMES. I do not want a yes man
or blind agreement, I actually want things to be challenged and to be looked at into a deeper scope. No confirmation or agreement
without actually checking."
- Disagree or unsure -> say so plainly, with the reason, before acting. Never agree, confirm or say "yes" before checking.
- Challenge plans and limits (including Sim's) when the evidence points elsewhere; look deeper than the request.

## 0b. Design philosophy (Sim, Nov 12): usability and easy accessibility are key factors in every design decision.
Each screen leads to its one useful next action; nothing a player needs is buried; controls are reachable by touch and keyboard
(44px targets, real tab stops); words are plain. Keep the WOW, but never at the cost of using the site.

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
