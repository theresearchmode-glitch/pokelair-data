# Undo plan (Nov 7, 2026)

How to reverse a bad update fast, especially on regulation switch day. Three things can go wrong, each with its own undo.
The live site, the daily data and the switch are independent, so undo only the part that broke.

## 1. The live page looks wrong (a site change)
Every publish is a saved version of the artifact (https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk; Version 100 = Nov 7
health check fixes). Fastest undo, about 2 minutes:
1. In a Claude session on this repo: `git log --oneline main` and pick the last good commit (each publish is a commit on main).
2. `git checkout <good commit> -- app/` then `node app/build.mjs`.
3. Publish `app/dist/page.html` to the same artifact URL (the Artifact tool, same `url`). Sprites (`sp/`) stay as they are.
4. Then fix forward on the preview branch, and restore `app/` to main's version when the fix is ready.
The page's data is separate (the morning refresh), so rolling the page back never loses data.

## 2. The daily data is wrong (a data-job change or a bad source day)
The data job commits "Limitless data YYYY-MM-DD" to main every morning; the 6:52 AM refresh copies `out/` into the page.
1. Find the bad commit: `git log --oneline main -- out/`.
2. `git revert <bad data commit>` on main and push. The next refresh copies the reverted (yesterday's) files.
3. To push them to the page right away, fire the "NastyPlot data refresh" scheduled task by hand.
4. A broken step on its own keeps yesterday's file (every step is `|| node skip.mjs`), and two skipped days in a row open
   the "Daily data problem" issue (health.mjs), so a single bad source rarely needs this.

## 3. The regulation switch went wrong
The data job switches by itself when the new regulation has 20 events and 1,200 players (formats.mjs REG_SWITCH).
- **Hold the switch** (banner only, numbers stay on the old regulation): set `REG_AUTO_SWITCH: '0'` in the env of
  .github/workflows/update.yml and push. Remove it to let the switch happen.
- **Undo a switch that already happened**: hold it as above, set out/reg.json back to the old regulation (git revert the
  data commit that switched; reg.mjs logs "switched from ... to ..."), push, and fire the refresh.
- The page follows out/reg.json: with the old regulation active, its built-in M-C backups come back into use automatically
  (builtinOk() in 16-outside-performance-data.js).

## Checks after any undo
- Open the live page on phone and desktop: Home, My team, Meta, a Pokémon sheet, Battle.
- The "Daily data problem" issue on GitHub is closed (or says why it's open).
- `node app/test/run.mjs` and `node app/test/prelaunch.mjs` pass on the restored build.
