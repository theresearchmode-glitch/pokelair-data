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

## Morning (Sim awake; updated time: 6:59 AM (6:59:24)  date: Tue Nov 17, 2026 by the clock)
- Q1 done: Edit Set dropdowns draw our own arrow (Preview v193; pics/nov17/edit-dropdown-before-after-*.png).
- Q3 done: player names to IDs on main; GitHub run read the key (222,584 names, guard clean).
- Sim's iPhone finds fixed (Preview v194): Matchups Top 10 verdicts back on the right; Build cards without Core/role labels;
  'Best core' is now 'Best trio' (always three Pokémon).
- Quality check now opens every view (it missed Top 10); full run going, then into GitHub's checks.
- Plans page: 'After the redesign' checklist (56 items with sources).
- Your question: "private costs money, correct?" Partly. Checked on docs.github.com (GitHub's plans; Actions billing):
  a private repo itself is free, but our test runs (GitHub Actions) are free only on public repos; private repos get
  2,000 free minutes a month. Not yet measured: our monthly minutes, but one run has several jobs (one alone up to 55 min)
  and we run many a day, so it would very likely go over and cost money. So the repo stays public, as you chose.
  What stays open: old player names are still in the public git history. Removing them needs a history rewrite and a
  force-push to main; that is your call, and I won't do it without your yes.
- Waiting on Sim: the switch to live (one explicit yes).

## Late morning (updated time: 10:29 AM (10:29:01)  date: Tue Nov 17, 2026 by the clock)
Two outside reviews worked through, item by item (docs/rebuild/audits/player-review-nov17.md, prelaunch-checks-nov17.md; Plans
page sections "Player review (Nov 17)" and "Pre-launch checks (Nov 17)"). Every fix: re-checked first, a test that fails before,
pictures. Preview v196 has them all.
- Done: numbers say their source; no old numbers before today's (loading screen, with your animation); Home "Most used last month.";
  tied ratings share a rank; Mirror match; weak spots; pairs "brought together"; sample box; Stand-Outs even rows; Winning Teams
  search on the first phone screen; Speed "You +1"; Megas' fixed Ability; contrast; 44px tap areas; clearer Import messages; Track
  Record groups on the tier lines (on this branch, live with the switch).
- Not shipped, for you: 4d "what really beats it" (measured: one Pokémon's real-game effect is about 1 point, too small to call;
  options A keep the type chart (recommended), B show the small numbers, C wait for error ranges); 4a tap-to-pick grid and 4e Add to
  calendar (new controls; recommended after the switch / with the public site).

## Next regulation: proposal (pre-launch item 4; your decision)
Checked: one setting exists (PAGE_REG = 'M-C'), but "M-C" is typed out 65 times in 39 source files and the legal-item list is fixed.
1. One switch: every page reads the regulation from the daily data (perf.json "reg", already there) instead of typing "M-C".
   Why: the day it changes, nothing needs editing by hand.
2. Old numbers: ratings, Winning Teams, Events and Track Record are archived per regulation and start fresh, with a "Reg M-C" view
   kept. Why: mixing two regulations' results would mislead.
3. Saved teams and box Pokémon that turn illegal are flagged with a note, never deleted. Why: players keep what they built.
4. A one-line notice on the day it changes (the page already has a "New regulation" note for the data side).
Size: medium (a day of careful work + tests). Nothing starts without your yes.

## Where this conflicts with earlier rules or decisions
- Nov 9 "no new features until finished": review section 4 asks for additions; I did the ones that fix wrong or missing information
  (4b +1, 4c) and put the new controls (4a, 4e) to you.
- RULES.md "no design decision without Sim's yes and pictures": under your authority I made small looks (loading screen, mirror label,
  chip and Stand-Outs rows); all are Preview-only with pictures sent; nothing went live.
- 3h on main: your yes covered changing main's data job, but main's live page labels its own groups, so I built it on this branch
  instead (live with the switch). Tell me if you want main changed now.
- Pushes cancel the previous GitHub run, so I batch pushes and let runs finish.
