# Reg M-D game plan (Nov 7, 2026) — for Sim's review, nothing built yet

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

## 5. Decisions for Sim (before Phase 0 starts)
1. **When the page switches to M-D**: (a) keep the automatic rule (20 events + 1,200 players, about 12 days last time), (b) switch the page on launch day with clear "early data, N events so far" labels, or (c) a lower bar (e.g. 8 events + 400 players, about 3-4 days).
2. **Keep M-C visible after the switch?** (a) no, the new regulation only, as now; (b) a read-only "Last regulation (M-C)" view of the final numbers.
3. **Mega Heatran's unknown ability**: show "not announced yet" (recommended) or wait to add it.

## 6. Size
Phase 0: medium (scripts and a practice run; most checking runs on its own). Phase 1: light to medium on roster day. Phases 2-3: light daily checks.
