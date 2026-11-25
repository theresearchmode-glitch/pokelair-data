# What the live site (artifact 5VBfLTR5sM4JU5NswJYyGk) is built from (checked Nov 12, Claude)

- Live version 154 (published Nov 11 11:06 UTC) is EXACTLY a build of claude/design6 commit **cb49701** (`node app/build.mjs`
  with esbuild installed for the minify step): the published page minus the artifact wrapper is byte-identical (checked Nov 12).
  It is NOT a build of main: main lacks the Nov 10-11 fixes that went live straight from claude/design6 (Sim's Nov 10 "faster
  flow"), including the re-inked Darkrai (0bc7468) and the Instrument Sans width axis (cb41502).
- Live version 155 (Nov 12, ~9:50 AM Eastern, Sim's go) = cb49701 + `live-v155-fonts.patch` (fonts hosted by NastyPlot: 9eabdd6's
  font change, with Instrument Sans swapped for Google's width-axis files and rules, matching the live page's request
  `ital,wdth,wght@0,75..100,400..700;1,75..100,500`). page.html sha256 c64ed33bd9e7a39d...; 13 fonts/*.woff2 beside it.
  Checked against the real live page (wrapped the same way): Google font requests 4 -> 0 in 6 views; same faces loaded in all 6;
  screenshots identical 3/6, the other 3 differ only where a live-vs-live control also differs (late-loading sprites / noise).
- To rebuild live: `git worktree add X cb49701 && cd X && git apply --index <repo>/docs/rebuild/live/live-v155-fonts.patch &&
  node app/build.mjs` (esbuild must be installed, or the page is unminified ~160 KB bigger), publish app/dist/page.html with
  app/dist/fonts/*.woff2 as fonts/<name>. Sprites sp/ stay on the artifact.
- OPEN (for Sim): main is behind the live site. Pushing main's today's-site code live would undo the Nov 10-11 fixes.
