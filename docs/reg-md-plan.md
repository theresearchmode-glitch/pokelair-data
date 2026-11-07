# Reg M-D game plan (Nov 7, 2026) — reviewed by Sim; Phase 0 not started

## 1. What we know (research, Nov 7)
| Fact | Status | Source |
|---|---|---|
| Reg M-C runs until **Dec 1**; M-D starts **Dec 1 or 2** | Official schedule (Nintendo of America), Game8 says Dec 2 | GameRant, CQ Esports (Sep 2), Game8 |
| **Mega Heatran** arrives with M-D, the **first Legendary** in Champions | Officially announced, widely reported | GameRant, CQ Esports |
| Mega Heatran: Fire/Steel, stats 91/120/106/175/141/67, sprite exists (PokéAPI id 10311) | Confirmed data; **ability not published yet** | PokéAPI |
| Rest of the M-D roster, new Megas, rule changes | **Unknown** (only unverified leak videos) | — |
| Last switch (M-B to M-C): 35 Pokémon/forms added, **none removed**, 4 new items, rules unchanged | Checked against Showdown | docs/reg-md-research.md |
| Showdown keeps the old regulation as its own data set (`championsregmb`); no M-D format yet | Checked today (formats.ts) | Showdown GitHub |
| No Limitless events listed as M-D yet | Checked today (our calendar) | out/calendar.json |
| Last time our switch rule (20 events and 1,200 players) was met **Sep 20, ~12 days after M-C began** | From our saved events | data/index.json |

## 2. Everything on our side tied to M-C (inventory)
| Area | Where | How it changes for M-D | Ready today? |
|---|---|---|---|
| Regulation name and rules | `formats.mjs` SITE_REG; page REG_NAME / PAGE_REG / BUILTIN_REG; 47 "Reg M-C" texts in 30 page files; paste importer message | One regulation profile, every text reads from it | No: scattered |
| Pokémon data (types, stats, abilities, moves, learnsets, default box) | `app/src/data/data.js` (ROSTER, ABIL, MOVES, LEARN, DEFAULT_BOX) | Rebuild from Showdown's champions data | **No generator**: hand-built in October |
| Move details and accuracy | `move-meta.js`, `move-acc.js` | `experiments/gen-move-meta.mjs` from Showdown (pinned commit) | Yes, re-pin the commit |
| Legal items (new Mega stones, e.g. Heatranite) | `items-list.js` from `data/regmc-items.txt` | `experiments/gen-items-list.mjs` with an M-D list | Partly: list typed by hand |
| Sprites | `app/sp/<id>.webp` + `SPRITE_ID`, PokéAPI HOME renders through `app/sprite-ink.py`, published next to the page | Fetch, ink and publish the new ones | Manual steps, no script |
| In-game sets (popular sets per Pokémon) | `SETS` in data.js (snapshot Oct 22) | Refresh once M-D sets exist; new Pokémon have none on day 1 | Manual |
| Built-in backups | RESULTS, PERF_RAW in data.js | Already switch off under a new regulation (builtinOk) | **Yes** (done Nov 7) |
| Daily data job | `reg.mjs`, `formats.mjs`, `names.mjs`, `weekly.mjs`, `events.mjs` | Detects M-D, switches at 20 events / 1,200 players, unknown names warn | **Yes**; Mega Heatran's Limitless name must be added |
| Team-strength model (part of the grade) | `model.json` / `model.mjs` | Trained on M-C games; retrain once M-D games exist | Retrain step exists |
| Ratings | `13-rating.js` | New Pokémon get the formula rating until usage arrives | Works, to be checked |
| Saved teams with a Pokémon M-D drops | gone-note | Already explained on My team and Saved teams | **Yes** |
| Tests pinned to M-C | `test.yml` Showdown commit, legality-check, fields-audit, calc-check; new audits use top M-C teams | Re-pin; audits need M-D teams (none on day 1) | Needs a plan |
| Legendary rules | none in our code (no "restricted" logic) | Only if M-D adds a restricted rule (not expected) | n/a |

## 3. Risks and how the plan handles them
1. **Roster unknown until about Dec 1.** Build everything so it runs from Showdown's data in one command; practise now on made-up M-D data (M-C + Mega Heatran).
2. **Showdown may publish late.** Fallback: add announced Pokémon by hand from PokéAPI/Bulbapedia data, with the same checks.
3. **Mega Heatran's ability unknown.** Show "Ability not announced yet" and leave it out of damage that depends on it, rather than guess.
4. **About 12 days of "old numbers" after launch** (the switch rule). Decision for Sim, see section 5.
5. **Day-one empty states**: no usage, no sets, no real teams, no threats list. Review every page in the practice switch.
6. **New audits need real M-D teams**: on day one they fall back to M-C teams that are still legal, with Mega Heatran fixture teams.
7. **Rollback**: docs/undo-plan.md (page, data, hold the switch with REG_AUTO_SWITCH=0).

## 4. Phases
**Phase 0, groundwork (now to about Nov 21, preview only, nothing live):**
- 0.1 Regulation profile: one place for the name, Showdown id, dates and rules; every "Reg M-C" text reads from it.
- 0.2 Roster generator from Showdown's champions data. Proof: it rebuilds today's data.js identically (except fixes we approve).
- 0.3 Sprite script: PokéAPI to inked webp to `SPRITE_ID`, for any new Pokémon in one command.
- 0.4 Items list generator for a new regulation (adds new Mega stones).
- 0.5 Practice switch on made-up M-D data (M-C + Mega Heatran): every page on phone and desktop, light and dark, day-one empty states, then fixes.
- 0.6 Tests that run on a new regulation (re-pinnable Showdown commit, fixture teams).

**Phase 1, when the roster is out (Showdown M-D data or the official list, about Dec 1):**
- Run the generators, then a change report for Sim (Pokémon, forms, moves and items added or removed).
- Sprites, tests, preview; Sim approves; publish the new page.

**Phase 2, switch day(s):**
- The daily job counts M-D events; the page follows the switch rule Sim chooses (section 5). Banner meanwhile.

**Phase 3, first two weeks:**
- Daily check of names, sets and ratings; retrain the team-strength model once there are enough M-D games; refresh in-game sets; re-run all audits on real M-D teams.

## 5. Sim's decisions (Nov 7)
1. **Switch on launch day.** Showing M-C numbers for ~12 days into M-D would make the site wrong for two weeks, which is
   unacceptable. The page switches to M-D on the day it starts (by date, not by event count) and says plainly that the data is
   very thin and based on our own numbers, ratings, tests and data so far ("Day N of Reg M-D: X events, Y players so far").
   - **Faster data during the first one to two weeks:** the data job and the page refresh run several times a day (e.g. every
     4 hours) instead of once, then go back to daily. The repo is public, so GitHub's runs cost nothing; Limitless's limit
     (50 requests / 5 minutes) is far above what one run needs.
   - Day one may have no finished M-D tournaments: every page must read well with zero M-D results (ratings fall back to the
     formula, sets to "no M-D sets yet", threats to the ladder) and fill in as events finish.
2. **M-D only after the switch.** The public launch is early January, when M-C is long past; no "last regulation" view.
3. **Mega Heatran's ability: "not announced yet"** until it is official; real stats and typing, nothing guesses its effect.

**Launch timing note:** NastyPlot's public launch is planned for early January 2027, about a month into M-D.

## 4b. Extra Phase 0 work from these decisions
- 0.7 Date-based switch: the regulation profile carries M-D's start date; on that date the page and the daily job switch
  (REG_AUTO_SWITCH and the event-count rule stay as the backstop if the date slips, e.g. the game update is late).
- 0.8 "Thin data" labelling on every page that shows numbers, driven by how many M-D events and players exist.
- 0.9 Launch-window schedule: a ready-to-flip setting for the data job and the refresh (every 4 hours for 14 days, then daily),
  plus a daily health summary during that window.

## 6. Size
Phase 0: medium (scripts and a practice run; most checking runs on its own). Phase 1: light to medium on roster day. Phases 2-3: light daily checks.

## 7. Gaps found in the final pre-Phase-0 check (Nov 7) — proposed, for Sim's approval
**Would show wrong or mixed numbers on launch day:**
- G1 Outside sources still point at M-C by name: Pikalytics (`sources.mjs`, gen9championsvgc2026regmc), Showdowntier
  (`formats/dmc`), official events (`official.mjs`, REG 'M-C' and start date 2026-09-01). After the switch they would keep
  feeding M-C numbers into the cross-checks. Fix: every source reads the regulation profile; a source with no M-D page yet
  says "not available yet" instead of falling back to M-C.
- G2 The "restricted event" detector (formats.mjs staples alarm) learns which Pokémon are staples from the current
  regulation's events. With only a handful of M-D events it could wrongly throw out normal events (or keep themed ones).
  Fix: a minimum event count before it judges, and a test on day-one-sized data.
- G3 Team-strength model (part of the grade): trained on games of the active regulation; with few M-D games it may not pass
  its own quality test and would keep the M-C model, whose numbers don't fit M-D. Fix: an explicit rule for the first weeks
  (no team strength until the M-D model passes its test, labelled), so grades don't silently mix regulations.
- G4 Ratings track record and scoreboard: M-C rating snapshots must never be graded against M-D tournaments. Fix: snapshots
  carry their regulation; the record restarts (or shows "since M-D began").

**Will look empty or odd for a while:**
- G5 Smogon's monthly ladder stats only exist after a month ends: M-D's first numbers arrive in early January. The ladder
  view uses Showdown replays and Showdowntier until then, labelled.
- G6 "Since yesterday", weekly digest and trend arrows would compare M-D's first day with M-C's last day. Fix: reset at the
  switch ("new regulation, no comparison yet").
- G7 Your games log (games you logged on My team): keep the history, tag each game with its regulation, show M-D games by
  default.

**Things to have ready, not build:**
- G8 Official source of truth for the roster on launch day: the official announcement / patch notes (first), then Serebii and
  Bulbapedia, with Showdown's data used for the actual numbers. A watcher checks daily from Nov 20: Showdown M-D format,
  Limitless M-D events, official news, and opens a GitHub issue the moment any appears, so the switch never waits on someone
  noticing.
- G9 Exact start time and time zone of M-D (the game updates at a set hour). The date-based switch uses it; until it's known,
  the switch also waits for the first M-D event.
- G10 Existing Pokémon may change too (a stat, ability or move change in the update). The roster script's change report lists
  changes to existing Pokémon, not only additions and removals.
- G11 Tests on switch day: the daily data commit runs the GitHub tests, and several audits use top tournament teams, which
  will be empty. They need M-D fixture teams so they test something real instead of passing on nothing.
- G12 Announcing the switch on the site: a short "Reg M-D is here" note in What's new, linking to how the early numbers work.
