# Reg M-D watcher, Limitless alarm, data every 4 hours (game plan #7 / #8), Nov 24

Branch `alt/watcher`. **Base: claude/design6 at a5a8da03**, not a82b547b: `git fetch origin claude/design6` then `git cat-file -t a82b547b`
→ "fatal: Not a valid object name a82b547b" (not pushed yet). a5a8da03 was the branch's newest commit. The patch adds two new files and
edits update.yml only, so it should apply on a82b547b too (not checked: a82b547b isn't available). Nothing was opened on GitHub.

## a) Reg M-D watcher + b) Limitless alarm: md-watch.mjs + .github/workflows/md-watch.yml
- **md-watch.mjs**, read-only, about 5 requests a day:
  - Showdown's raw config/formats.ts (default branch), 1 request
  - ONE page of Limitless's newest VGC tournaments (the API reg.mjs uses; its limit is 50 per 5 minutes), 1 request
  - the two official news lists (the Champions news feed post-news.mjs reads, and news.pokemon-home.com/en/json/list.json, where the
    Dec 2 patch was posted), 2 requests
  - The next regulation is worked out, not typed: formats.mjs `nextRegIds(activeReg().id)` → M-D.
  - Writes a report: what was spotted, and whether Limitless is paused (no answer, or newest saved tournament in data/index.json 2+ days old).
- **md-watch.yml**, daily at 13:23 UTC (after the data job) and by hand. A manual run is a dry run by default; `fake_found` /
  `fake_limitless` pretend a sighting or an outage. Issues:
  - "Reg M-D spotted: <where>": once per place, never a duplicate (a title that exists, open or closed, is skipped)
  - "Limitless data paused since <date>": one open at most; text refreshed, a comment only when the date moves; closed with
    "Data flows again"

### Real run, today (checked)
`WATCH_INDEX=<main's data/index.json> WATCH_DRY=1 node md-watch.mjs` →
```
md-watch: next M-D; spotted nothing; Limitless ok
  Showdown formats.ts: no Reg M-D format
  Limitless: none of the newest 100 tournaments is marked M-D
  official news: 534 posts in 2 lists, no title names Reg M-D
  Limitless: newest saved tournament 2026-11-24 (0 days old)
--- WOULD CLOSE any open "Limitless data paused since …" issue (data flows)
```
Note: on claude/design6's own data/index.json the newest tournament is 2026-11-18, so the same run says "WOULD OPEN … paused since 2026-11-18".
That's because design6 doesn't get the daily data commits (main does: newest 2026-11-24, 592 tournaments). Scheduled workflows run on main,
so on GitHub it reads main's file. `WATCH_INDEX` exists for this test only.

### Dry runs (faked; the issue text it WOULD open)
1. `WATCH_FAKE_FOUND=showdown,limitless,news` → three issues: "Reg M-D spotted: Showdown", "Reg M-D spotted: Limitless", "Reg M-D spotted:
   official news", each with what was found, where, and "Next: docs/reg-md-plan.md Phase 1 (gen-roster.mjs, add-sprites.mjs)".
2. `WATCH_FAKE_LIMITLESS=down` → "Limitless data paused since 2026-11-24 / Limitless did not answer today (one request to its tournaments API)."
3. `WATCH_FAKE_LIMITLESS=stale` → "Limitless data paused since 2026-11-19 / No new Limitless event since 2026-11-19 (5 days; the alarm starts at 2)."
Full texts: dry.txt in the zip.

### The workflow's issue logic, tested on a fake GitHub (harness.cjs runs md-watch.yml's own script)
| Scenario | What it would do |
|---|---|
| nothing open; 3 sightings + paused | CREATE the 3 "spotted" issues and "Limitless data paused since 2026-11-24" |
| "spotted: Showdown" exists (closed) | CREATE only Limitless and official news (Showdown skipped: no duplicate) |
| paused issue open, same date | UPDATE #7 (text only, no comment) |
| paused issue open, date moved | UPDATE #7 title + COMMENT "Still paused; now: 2026-11-24." |
| data flows again | COMMENT "Data flows again." + close #7 |
Both workflow files parse (`yaml.safe_load`: ok). Not checked: a real run on GitHub.

## c) Data every 4 hours, ready to flip (update.yml)
- A second cron `7 1,5,13,17,21 * * *`; the job runs on it only when the repository variable **FAST_DATA is 1**:
  `if: github.event_name != 'schedule' || github.event.schedule == '7 9 * * *' || vars.FAST_DATA == '1'`.
  With the daily 9:07 that gives 1, 5, 9, 13, 17, 21 UTC.
- `concurrency: update-data` (no cancel): a run waits for the one before it instead of overlapping (the job can take 150 minutes).
- Truth table (the same expression, evaluated in node):
```
schedule          7 9 * * *              FAST_DATA=(unset) -> RUNS
schedule          7 1,5,13,17,21 * * *   FAST_DATA=(unset) -> skipped
schedule          7 1,5,13,17,21 * * *   FAST_DATA=1       -> RUNS
schedule          7 1,5,13,17,21 * * *   FAST_DATA=0       -> skipped
workflow_dispatch                        FAST_DATA=(unset) -> RUNS
```
- **Flip ON:** GitHub → the repository → Settings → Secrets and variables → Actions → **Variables** tab → New repository variable:
  name `FAST_DATA`, value `1`. (Or `gh variable set FAST_DATA --body 1`.) The next 4-hourly time does work.
- **Flip OFF:** delete the variable, or set it to `0` (`gh variable delete FAST_DATA`). Back to daily at once.
- Off is the default. While off, the five extra times show as "skipped" runs (no work, no email).
- watchdog.mjs reads the last 30 runs (watchdog.mjs:17), so its "last success within 26 h" check still finds the daily run (checked by reading).
- **Limit (not done here):** this makes the DATA every 4 hours. The site's morning refresh and the Preview still read it once a day;
  game plan #7 also names "refresh + Preview", which are outside update.yml.

## Not checked
A real GitHub run of either workflow (no push); the GitHub variables UI wording (from GitHub's docs as I know them, not looked at here).
