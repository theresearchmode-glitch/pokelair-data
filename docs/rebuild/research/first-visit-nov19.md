# First visit speed, Nov 19 (look-only helper, measured; same method as first-visit-nov18.md, tools re-implemented)
Code 2a6d768d. Preview build (--preview-data --one-art-size --split) and switch build (--public --split --one-art-size).
Phone 412x823 DPR 1.75, CPU 4x, 4G (9/1.5 Mbps, 165 ms) and slow 4G; 5 interleaved runs, load gate < 6 (load 3.5-8.7: < ~150 ms is noise).
Medians: My Team 4G 2,748 ms [2,625-2,887] (Nov 18: 2,968 base, 2,697 with --split); Home 4G 2,902; slow 4G My Team 8,295, Home 8,385; fast 560 / 720.
Longest task 294 ms (Nov 18: 510). Bytes: My Team 1,378 KB (1,090 before main content); Home 4,017 KB (Nov 18: 8,746; crowd sheets halved it).
Goal 2.5 s: gap ~250-320 ms on this machine. Where it goes (My Team 4G): v2.js arrives ~1.30 s, runs to ~1.75 s; then ~0.9-1.0 s start-up work
(ratings, team report, page HTML; reading of V2.warmDraw, not timed per step).
Contributors: (1) start-up work ~1 s CPU (precompute ratings/report in the daily data step: gain not measured, medium risk); (2) v2.js 592 KB
gzip, 49% runs at start (late files measured Nov 18: not adopted; minify saves only 16 KB); (3) Brotli vs gzip: slow 4G -1.3 s, 4G no change
(measured; the host decides; Claude host not checked); (4) preview.json 260 KB (Preview only); (5) CSS 95 KB gzip; (6) Home sprites load after
main content (data cost, not first-screen time). Tried: v2.js defer in head: no change.
Not measured: live database timing, Claude host HTTP/2 / compression / caching, real phones, repeat visits.
Recommendation (helper; agreed by Claude): pl-2a does not need to land before the switch; it follows (Brotli on the public host, then start-up work).
