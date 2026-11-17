# Overnight summary for Sim (Nov 16 night to Nov 17), draft written time: 2:57 AM (2:57:47)  date: Tue Nov 17, 2026 by the clock

Preview: v192 (397 files, 346 v2art). Branch claude/design6. Nothing went to main or live.

## Done (each one tested; numbers are measured)
- Suggestions (code review FP-1, FP-2, FP-4): Quick add scores a swap the same as Apply; Why? no longer lists type changes
  a two-Mega swap didn't make; "just swapped out" clears after any set edit. Test app/test/v2-planner.mjs fails before, passes after.
- Team Card / Poster (FP-5): a very long team name was drawn at one size and spaced for a smaller one (lines touched).
  Fixed. Picture after: pics/nov17/team-card-long-name-after.png. Names are capped at 40 characters, so real teams may
  never have hit it (not tested).
- Tests wait for the page to be ready, not a fixed 1.5 s (C-I7): same results in all four groups, +0.6% time.
- Safari's engine (C-I8): the My Team tests now run in WebKit too: 138 pass, 0 fail. The 4 first failures were the tests
  reading text differently, not site bugs. The full quality check on every page ran in WebKit with real fonts: nothing
  Safari-only. Both now run in GitHub's checks (the quality check fails on any new finding; the Safari job only reports).
  Checked on GitHub (run on 383b3d4): all 9 jobs pass; Safari engine 26.6: My Team 138 pass, 0 fail.
- Measured and left alone (with reasons in decisions.md):
  - contain: paint on glow sections (B-m4) cut into the glow (20-75 thousand pixels per page), no scroll gain: not applied.
  - Memory after My Team (B-m6): +23 MB, flat, not a leak: no change.

## Decided against my own earlier recommendation (you approved it; tell me if you disagree)
- The daily "checklist numbers" step stays off main until the switch. Checked: today's live page never reads those
  numbers, and the step needs a file main doesn't have. It goes in with the new site at the switch.

## Waiting on you
1. Glance at Edit Set on your iPhone (My Team, tap Edit Set, look at the Ability box). In Safari's engine on Linux the
   dropdown draws its own grey box inside our slanted field; Chrome doesn't. I'm unsure an iPhone does it too.
   Pictures: pics/nov17/edit-dropdown-webkit.png (grey box) and pics/nov17/edit-dropdown-chrome.png (as designed).
   If your iPhone shows the grey box, my recommendation: hide the phone's own box and draw our arrow (reason: the
   field then looks the same on every device). That's a look change, so it waits for your yes.
2. Unsure, for older iPhones: in an older Safari engine (WebKit 18.2, the Linux test build) the page jumps up about 700 px
   after Apply on My Team, because that engine loses the page's scroll range after a redraw. Newer Safari (26.6) doesn't.
   If you or a friend has an iPhone still on iOS 18: scroll down on My Team, tap Apply on a suggestion, see if the page jumps.
   I couldn't fix it in that engine (every way of restoring the scroll stops at its wrong limit), and it's not proven on a
   real iPhone, so nothing changed on the site.
3. NP_PID_KEY: it must be under Settings > Secrets and variables > Actions > Repository secrets, then I redo the main
   names fix (the daily job needs it).
4. The switch to live, when you're ready.
