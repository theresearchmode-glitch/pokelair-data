# Rack fix 2 (HH's Job S): HOME-09 and v2-q23, Thu Nov 26, 10:20-10:45 AM Eastern (`date`)
Branch alt/rack-fix2, from origin/alt/rack-fix 78eb8276.
- **Both are test updates, not page changes.** The rack moved the content the tests looked for, exactly as desktop (1100+) has moved it since Sim's Home B (Nov 23). Sim approved the rack at every width, so the tests now look where the content lives.
- Nothing visible changed, so there are no pictures.
- app/test/v2-q72.mjs and sd-tools.css are untouched.
- **Runs:** frozen out/ 0c992f69, checked out first and restored after. Chromium 1148.
  - Behaviour runs on `node app/build.mjs --v2 --art=../src/v2/art/` (as test.yml's behaviour job).
  - The rest on `--v2 --preview-data`.

## 1. HOME-09 (behaviour A-team): test updated
**What the rack changed** (measured on Home, Winning Teams plate `.sdt-wt` vs chip; visible counts):
| Build | Home 820 | Home 1440 |
|---|---|---|
| design6 9bab576f | plate 1, chip 0, "This six won ValkrixVGC Champions League #09 on Nov 8: 57 players, 9-2.", Load Team 1, Copy for Showdown 1 | plate 0, chip 1, no line, no Load/Copy |
| rack-fix 78eb8276 | plate 0, chip 1, no line, no Load/Copy | plate 0, chip 1, no line, no Load/Copy |

- iPads now get desktop's Home exactly. HOME-09's own comment already said that on desktop "Load Team / Copy for Showdown live on the Winning Teams page"; it ran at 820 only because iPads kept the plate.
- On Winning Teams (#tournaments) at 820 and 1440, on both builds:
  - "1 The champion. 2027 Gdańsk Pokémon Regional Championships · 758 players · official event"
  - USE THIS TEAM. and Load Team (3 visible)
  - Copy for Showdown (3 visible)
- TOP-06 and SHELL-26 (D-meta-shell) also test that load and copy there.

**Change** (app/test/behaviour/A-team.mjs, new-site branch only; today's page keeps its Home checks):
- At 820, Home's Winning Teams is the rack's chip and there is no plate. Tapping it opens Winning Teams.
- Winning Teams' champion line is "1 The champion. <event> · N players".
- USE THIS TEAM. asks first ("Replace your current team?"), the first tap leaves the team, Replace loads the six, the Undo toast appears and Undo restores the team.
- Copy for Showdown on Winning Teams gives "Team copied for Showdown" and a Showdown team on the clipboard.
- The Events count checks (820 and 1440) are unchanged.

**Runs** (`PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team --only=HOME-09`):
- Before: "FAIL HOME-09 … -> no champion line with record, date, players", then "behaviour: 0 pass, 1 FAIL".
- After: "pass HOME-09 …", then "behaviour: 1 pass, 0 FAIL".
- The updated test fails on design6's iPad Home (its plate makes "chip 1, plate 0" false), so it can fail.
- WebKit was not run here: the repo's Playwright 1.49 has no WebKit 26.6. GitHub's WebKit job will run it.

**Not anywhere on the site now (for HH and Sim, not changed):**
- design6's Winning Teams plate (phones and iPads) showed the *latest online winner* with its date and record ("ValkrixVGC Champions League #09 on Nov 8 … 9-2").
- Winning Teams' first card is a different team (the official Gdańsk Regional champion), with players but no date or W-L.
- That latest-winner line has been missing on desktop since Nov 23 (Home B). With the rack it is gone at every width.
- If Sim wants it back, the place would be Winning Teams, and that is a content change. I didn't make it.

## 2. v2-q23 at 768: test updated
**What the rack changed:**
| Build | Home 768 | Home 1440 |
|---|---|---|
| design6 9bab576f | the red post band's heading row (`.sdp-top`, "The post is in.") shown with its plain line "Gift codes before they run out…" | heading row hidden, no plain line; "Mystery Gifts" and "Champions News" headings |
| rack-fix 78eb8276 | heading row hidden, no plain line; "Mystery Gifts" and "Champions News" headings | the same |

- The rack's sd-post.css puts desktop's post (Post X: the parcel beside the Dispatch, under their own headings) from 700 (was 1100). q23 already skips the post line from 1100 for this reason.
- **Change** (app/test/v2-q23.mjs): the post line is checked under 700 (was under 1100), with the reason in the comment. The six and tools lines are still checked at every width.
- **Runs** (`PAGE=app/dist/v2.html node app/test/v2-q23.mjs`):
  - Before: "FAIL the three plain lines are there … (2 missing, e.g. day 768 post …)", then "v2-q23: 1 failed".
  - After: "v2-q23: all passed".

## 3. Other runs (frozen out/, `--v2 --preview-data`)
- `ONLY=HQ node app/test/v2-minors.mjs` → "v2-minors:all passed" (17 pass).
- `PART=main1 node app/test/v2-minors.mjs` → "v2-minors (main1):all passed" (148 pass).
