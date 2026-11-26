# Rules for everyone building The Stampede, The Post Room and The Champions Dispatch (Nov 18)

Sim (Nov 18, 9:06 PM onward): "we use our rules and i know they have errors and mistakes we fix those here."
The mock-ups are pictures made by another chat that doesn't know our rules. They show the idea, the layout and the mood.
Where a mock-up and our rules disagree, OUR RULES WIN. List every such fix in your report (one line each: what the mock-up
shows, what we do, why). Those lines go to Sim with pictures.

## Read first
- /home/user/pokelair-data/CLAUDE.md (Sim's standing preferences) and docs/rebuild/RULES.md (Part C rules C1-C13).
- The page's own brief: docs/rebuild/stampede/BRIEF.md, docs/rebuild/postroom/BRIEF.md, docs/rebuild/dispatch/BRIEF.md.
- Mock-ups: docs/rebuild/{stampede,postroom,dispatch}/mockups/*.webp (desktop 1440 wide, phone 780 = 390 at 2x; light and dark).

## Our rules the mock-ups break (fix these)
- Type scale only: 13/15/16/17/20/22/24/26/28/34 (+ display sizes for the hero tagline, the newspaper name and big
  numbers, using the tokens in app/src/v2/css/tokens.css). Spacing on the 4px grid (1/2/6 allowed). Corners 4/6/10/18/round.
  Paragraph line-height 1.5.
- Every headline and big number: Unbounded, slanted (font-style:italic; font-synthesis:style), the WHOLE headline. Body and
  small labels: Instrument Sans. Use the existing classes/tokens (.u, var(--u), var(--b), --t13...--t34).
- Word list (CLAUDE.md "Word list"): Strength Score bands are Top tier / Tournament ready / Solid / Needs work / Missing a
  basic (the mock-up says "Ready": wrong). Colours from tokens (--band-top, --band-ready, --band-solid, --band-work, --band-miss).
  "Rating" only for a single Pokémon, with "tier" for its letter. Plain words. Data sources are Official events / Online
  tournaments / Ranked ladder / Showdown ladder.
- Real data only. Every number and name comes from the site's data and changes when it changes: 345 rated, 13,826 teams,
  113 events, ratings, types, base Speed, tournament usage, the latest winner. Never type a number from a mock-up.
  Gifts and news come only from app/src/data/post.js (filled by the post-data helper with source links).
- Never remove functionality. Today's Home features (behaviour tests HOME-01..16 in app/test/behaviour/*.mjs) must still
  exist somewhere: on the new Home, or already on another page (say which). A returning player with a saved team sees THEIR
  six, THEIR Strength Score and THEIR leads where the mock-up shows a new visitor's view.
- Colours only from tokens.css (the build's guard refuses colours elsewhere). New colours: add tokens (light AND dark) in
  tokens.css with a comment, prefixed --sd-, --pr- or --dp-.
- No boxes stacked inside boxes in different shades (page + one card colour at most); dividers are thin soft rules (--rule).
- Tap targets at least 44px. Every image that carries meaning has words for screen readers; decorative crowds are
  aria-hidden. Each Pokémon that is named is a button opening its page (data-v2mon="Name", as elsewhere).
- No motion yet: the mock-ups are still pictures; a motion proposal goes to Sim first. Respect prefers-reduced-motion.
- Every window size must look right: 320 to 2560 wide, odd widths too (340, 412, 600, 768, 820, 1024, 1100, 1180, 1366,
  1500, 1920, 2560), light and dark. No sideways scroll, no text out of its box, no lone tile or half-filled row, no empty
  half on desktop. Keep the WOW: bold slanted type, big sprites, strong colour fields. Choose "right and just as bold".
- Sprites: V2.mon(name, {bare:true}) draws a Pokémon (see other pages). Sprite files are shared (art/); the Claude-hosted
  page holds at most 511 files in total, so add no new image files without saying so; item pictures are our own inline SVG.
- Header, footer and the phone tab bar stay as they are.

## How to build and check
- Work ONLY in your own git worktree (Agent isolation). `ln -s /home/user/pokelair-data/node_modules node_modules`.
- Build: `cd app && node build.mjs --v2 --preview-data` (writes app/dist/v2.html). Open file://.../app/dist/v2.html#home
  (or #gifts, #news). For sprites in pictures, build with `--art=../src/v2/art/ --preview-data` and open from app/dist/.
- Pictures: Playwright (preinstalled), deviceScaleFactor 2 for pictures for Sim. On phones, don't use fullPage (it lays
  out at 398, not 390): set the window height to the page height instead.
- Checks: `PAGE=<copy of build> node app/test/v2-minors.mjs` (all must pass), `TARGET=v2 VIEWS=home node
  experiments/polish-check.mjs` (no new findings beyond the mock-up's intended overlaps; explain each), and add v2-minors
  checks for your part (each check must be able to fail: show it failing on the skeleton build first).
- Commit in your worktree: `git config core.hooksPath .githooks` first; messages: no '~' before numbers, no clock times,
  no AI model names; end with the line `Claude-Session: https://claude.ai/code/session_01YGeTVQdFPaKNkn33jSEpxs`. Don't push.
  Delete zz-* scratch files before committing. Commit your pictures under docs/rebuild/pics/nov18/.
- The machine is shared by many helpers: one browser at a time; re-run a failing timing test alone before calling it real.
- Label every claim: checked (how) / measured (number, how) / unsure (why). No guessing.

## Report (short)
Commit hash(es); what you built; the list of mock-up fixes (what / what we did / why); illustrations vs real data (which and
why); checks (command, exact result line, plain meaning); picture paths; open questions for Sim; anything unsure.
