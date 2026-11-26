# Game plan: Wed Nov 25, 4:01 PM → Wed Dec 2 (Reg M-D + the balance patch)
Written Tue Nov 24 (light-usage day) for Sim's review. Everything on this account (Sim, Nov 24), split between:
- **HH** (this chat, main thread): core code, decisions, merges, pushes, publishing, messages to Sim.
- **Helper 1 and Helper 2** (this chat, from 4:00 PM Wed: 2 helpers is the standard again): build jobs, each in its own copy.
- **PC chat** (Sim's PC, same account, faster, doesn't restart): long runs only: full checks, screenshot batches, page sweeps.
  HH writes each PC brief as a ready-to-paste prompt; results come back as a commit on an alt/* branch or a zip.
- **GitHub** (free): the full check on every push to claude/design6; the daily data job; the Preview at 7:41 AM.

## The two deadlines
1. **The switch** (the redesign goes live) must happen **before Dec 1**, so M-D is built once, on the new site only.
2. **Dec 2**: M-C ends 01:59 UTC (formats.mjs REG_END, checked); the balance patch lands; M-D starts (reported, not official yet).
   Roster, start time and Mega Heatran's Ability: **not announced** (search Nov 24).

## Decisions only Sim makes (asked early so nothing waits)
- D1 ANSWERED (Sim, Tue Nov 24): switch target **Sat Nov 28** for sure (fallback Sun Nov 29). The switch itself always needs Sim's yes.
- D2 ANSWERED (Sim, Tue Nov 24): Sim is not around much on Thanksgiving: Thursday runs on HH's authority; one picture summary Thu night.
- D3 (Fri): go / no-go for the switch, after the full check on one commit and Sim's own use of the Preview.
- D4 (roster day): the M-D change report (what's added, removed, changed) before it goes live.

## Wed Nov 25, 4:01 PM – about 10 PM (setup + start the two long pieces)
| Who | Job | Done when |
|---|---|---|
| HH | Resume: re-enable hourly check, helpers to 2 (work-check NEED), GitHub runs since 1517, Preview has Option A | runs green, Preview published |
| HH | Ask D1, D2. Send the decisions summary so far (authority log since 9:55 AM Tue) | Sim answered |
| HH | **M-D #1 regulation profile**: one source (formats.mjs SITE_REG grows: name, Showdown id, dates, rules, outside-source ids) that the page, the data job and sources.mjs / official.mjs all read; the 83 "M-C" texts in 41 page files read it | grep finds no hard-coded "M-C" outside the profile; reg-test + v2-minors pass |
| Helper 1 | DONE EARLY Nov 24 (other acc, gen-roster.mjs, rebuilds data.js identically). Wed: **#4 sprite script** instead; then roster-day dry run end to end | sprite script works for Mega Heatran 10311 |
| Helper 2 | **Switch blockers** from the Game Plan "The switch" list: saved-data contract (v2-saved), "What's new" note, underdog on empty screens, anything else still todo there | each ticked with its check |
| PC chat | Full check of the latest commit (every GitHub step + WebKit groups + qcheck-all) as the switch baseline | report on alt/pc-fullcheck-nov25 |

## Thu Nov 26 (Thanksgiving: lighter for Sim)
| Who | Job |
|---|---|
| HH | **M-D #6** model and ratings never mix regulations: no team-strength part until the M-D model passes its test (labelled); rating snapshots carry their regulation; "since yesterday" / weekly / trends reset at the switch (G3, G4, G6) |
| Helper 1 | Roster generator: finish + review; then **#4 sprite script** (PokéAPI → inked webp → SPRITE_ID, one command; Mega Heatran 10311 as the test) |
| Helper 2 | **Practice switch build**: made-up M-D data (M-C + Mega Heatran, Ability "not announced yet") on a branch; the date switch (0.7) and thin-data labels "Day N of Reg M-D: X events so far" (0.8) |
| PC chat | Page sweep of the practice switch: every page, 390 / 820 / 1440, day + night, with zero M-D events → list of empty or broken spots with pictures |

## Fri Nov 27
| Who | Job |
|---|---|
| HH | Fix the sweep's findings (day-one empty states, #5); **#7** every-4-hours schedule ready to flip (update.yml + refresh + Preview); **#8 watcher** (Showdown M-D format, Limitless M-D events, official news → GitHub issue); **Limitless alarm** (phone alert if the data job can't reach Limitless or finds no new events for 2+ days) and the **"tournament data paused" note** on the site |
| Helper 1 | **M-D test teams** (G11): fixture teams so the audits test something on day one; re-pinnable Showdown commit in test.yml |
| Helper 2 | Switch: final checks list from the Game Plan (full check on one commit, final polish pass) |
| PC chat | Full check on the switch candidate commit |
| Sim | Uses the Preview for real; **D3 go / no-go** in the evening |
| 10 PM | (authority now runs to Sat 10 PM) |

## Sat Nov 28 (switch day, done together with Sim; Sun as fallback; HH authority ends 10 PM with the summary)
- Morning: Sim's yes → publish the new site live with sprites and fonts; undo plan (docs/undo-plan.md, re-checked Fri) at hand.
- The live data refresh and the Preview job point at the new site; check both the next morning.
- Watch the first day: behaviour, data, Search, saved teams carry over. Rollback kept two weeks.

## Sun Nov 29 – Tue Dec 1 (ready for roster day)
- Dec 2 patch prepared as patches, held: LEARN adds incl. Mega forms + the 22 Psych Up Pokémon (docs/rebuild/test-runs/
  patch-dec2-psychup.md), infosheet Rock Slide 20%, run.mjs:147 Hustle Rock Slide 72 → 76, generators re-run once Showdown has
  the patch (patch-dec2-map.md).
- Daily: watcher; nothing new on the live site unless it's a fix.
- G9: find M-D's exact start time if published.

## Wed Dec 2 (roster + patch day)
1. Patch: re-pin Showdown, run gen-move-meta / gen-info-text, apply the held patches, calc-check, legality, threat-check, golden.
2. M-D roster (when Showdown or the official list has it): gen-roster + sprite script → change report → **D4 Sim** → publish.
3. Switch the data to every 4 hours for 14 days; "Reg M-D is here" note; Mega Heatran's Ability "not announced yet" if still so.
4. Phase 3 for two weeks: daily names / sets / ratings check; retrain the model when M-D games are enough.

## Usage
Wed–Fri are medium-heavy days (2 helpers + PC chat). Lighter option if needed: Helper 2's switch-blocker work moves to HH and the
PC chat, 1 helper only.

## Already done (Nov 24)
Live data unblocked (threat-check); daily Preview data; A1-M9 sturdier; Option A on the Pokémon page; info-sheet lines fact-checked;
Dec 2 patch map + Psych Up list; polish triage (fixes coming from the other account as patches).

## After Dec 2: December to launch (Sim approved the order, Nov 24)
Docs: public-site-plan.md (all on Cloudflare, nastyplot.org), RULES-ONE-PAGE-draft.md, honest-review-nov24.md.
| When | What | Done when |
|---|---|---|
| Dec 3-4 | Rules down to one page (Sim's review of the draft); hooks match it; old rules archived | Sim's yes; hooks quiet |
| Dec 3-5 | Public site: `--public` build reads the tested JSON over HTTP; data copy to Cloudflare R2 each morning (also our data backup) | same numbers as the Claude build on the same day |
| Dec 5-8 | Practice public site on a hidden Cloudflare URL; every test against it; real-phone speed test | all tests pass there |
| Dec 5-12 | **Showdown-only backup numbers**: the data job builds usage, sets and win rates from Showdown replays and switches to them, labelled, when Limitless is down | a test with Limitless "switched off" still produces labelled numbers |
| Dec 8-12 | Feedback (Worker + D1 + Turnstile), Web Analytics, Email Routing, owner page behind Access | privacy test: no ID, email or name stored |
| Dec 10-14 | Export teams on the Claude site, Import on nastyplot.org | a tester's teams survive the move |
| Dec 10-16 | **Official events (Victory Road) as a second tournament source** | their top cuts show beside Limitless's |
| Dec 12-20 | Speed: per-page scripts; first visit under 2.5 s on 4G on a real phone | measured |
| Dec 14-24 | 3-5 real testers use nastyplot.org (hidden link) for a week | their notes triaged |
| Dec 20-30 | Strength Score only if it beats today's on the walk-forward test; privacy page; Limitless terms read | gate passed or skipped |
| January | Launch with Sim's yes; Claude version stays as the private preview | live on nastyplot.org |

## FOUND Nov 24 12:4x (checked): switch gap — the new site's data the live refresh doesn't deliver
The new site reads meta/info (info-sheet counts) and meta/post (Mystery Gifts / news) (03-persistence.js META_KEYS; build.mjs 79).
The live data refresh writes neither, and main's daily job makes neither (update.mjs on main: 0 mentions of info.json; main has
no out/post.json). Sizes: info.json 84 KB, post.json 23 KB (under the 200 KB split). Fix BEFORE Sat (Fri at the latest):
1. main's update.mjs gets the info step (from design6) so out/info.json is made daily and tested; out/post.json moves to main.
2. The data refresh task also writes meta/info and meta/post (needs Sim's OK: we never edit that task without it).

## Found Nov 24 (checked): suggest-gaps on TODAY's data
On frozen test data: ALL PASSED (that's what GitHub runs). On today's data: 2 FAILED. A Swift Swim Mega Swampert team with no rain
now gets its rain setter (Pelipper) as the 3rd Fix-it plan, not in the first two (my box and whole roster, 6 Pokémon). The data
moved, and the "needs rain" pull isn't strong enough to stay on top. Real suggestion-quality issue (a player would want rain first).
To do (Wed/Thu, HH): make "a Swift Swim / Chlorophyll / Sand Rush Mega with no weather" rank its weather setter first regardless of
the day's data, and run suggest-gaps on today's data as well as frozen.
