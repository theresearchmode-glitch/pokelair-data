# Brief for helper agents on the rebuild (R4, Nov 11)

You are bringing one group of today's My Team features into the new build ("v2") for Sim's NastyPlot. CLAUDE.md applies in
full: real data only, never remove functionality, no guessing (read the code or run it before claiming), label claims as
measured or guess, no model identifiers in commits. Sim's standard: quality is never traded for speed.

## How the codebase works
- Today's live page: `node app/build.mjs` builds app/dist/page.html from app/parts.json (files under app/src/app, one closure).
- The new build: `node app/build.mjs --v2` builds app/dist/v2.html from app/parts-v2.json: v2 shell/pages (app/src/v2/*.js,
  pages/*.js, css/*.css) on top of today's SHARED logic files (the "logic" list). The guard (app/test/v2-guard.mjs) runs first:
  colours only from css/tokens.css, type and spacing on the scale, no !important, no id selectors.
- Read app/src/v2/shell.js (V2.sheet, V2.slide, V2.toast, V2.mon, V2.redraw, V2.pages, routes by hash), app/src/v2/bridge.js,
  and app/src/v2/pages/team.js (My Team: V2.teamData, V2.pages.team.draw). Design rules: CLAUDE.md "How Sim likes work done",
  "Studio-level polish", the Word list, and docs/rebuild/design-system.md. Approved My Team mock: docs/rebuild/mocks/.

## The pattern for every feature (all five gates, in order)
1. Logic stays shared, never copied: if the feature's working-out lives inside today's drawing code, move the data part into a
   shared function (a new or existing file listed in both app/parts.json and the logic list of app/parts-v2.json); today's
   page then calls it. Look at how 30-saved-data.js, 31-box-data.js, 62-compare-data.js were done (git log -p).
2. Proof today's page is unchanged: write experiments/same-<feature>.mjs in the style of experiments/same-box.mjs (drive
   today's real buttons through many steps, compare state + HTML between a BEFORE page and an AFTER page), get N/N identical,
   then plant a small change in the AFTER page and show the check catches it. Before = today's page built from the commit you
   started from; after = your working tree. Report both numbers. Probe the new build for every free identifier the moved code
   calls (missing ones fail silently behind typeof checks).
3. The new design: build the feature in the new build's own markup and CSS (tokens and components only), to the approved
   look, in day and night. New JS in app/src/v2/pages/<your-group>.js and CSS in app/src/v2/css/<your-group>.css (add both
   to app/parts-v2.json); keep edits to team.js to small, clearly marked hooks, so merging stays easy.
4. Behaviour tests: `PAGE=<your v2.html> ADAPTER=v2 node app/test/behaviour/run.mjs A-team --only=<your IDs>`; your IDs pass
   (fix the adapter app/test/behaviour/adapters/v2.A-team.mjs only for real markup differences, never to make a test pass
   without the behaviour). Restore app/test/behaviour/results.json afterwards (run.mjs overwrites it).
5. Polish: screenshots at 320, 360, 390, 600, 768, 1024, 1280, 1920, 2560 wide, day and night; zero sideways scroll, no text
   out of its box, no lone tile, no empty half; `TARGET=v2 VIEWS=team node experiments/polish-check.mjs` with no new finding.
   Look at your screenshots yourself.

## Rules for helpers
- Work only in your own git worktree; commit there (clear messages ending with the two attribution lines the main chat uses:
  "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" and "Claude-Session: https://claude.ai/code/session_01YGeTVPJGrP9daUZDnJ8skY");
  never push, never publish an artifact, never touch the live site or app/dist of the main checkout.
- If a feature needs a design choice the mock-up doesn't settle, choose the option that keeps today's behaviour and fits the
  word list, and list the choice in your report for the main chat to confirm with Sim.
- Final report: per feature: proof numbers (N/N + control), behaviour test IDs passing, screenshot paths, choices made, anything
  unsure (labelled "unsure").
