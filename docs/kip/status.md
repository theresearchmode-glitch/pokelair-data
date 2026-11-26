# Kip status (one line per job: job | started/done/blocked/question | branch sha | what | time)
41 | started | - | switch dress rehearsal | Wed Nov 25, 10:45 PM
41 | done | alt/gemini-switch-dry 9fe92088 | switch dress rehearsal (5 conflicts, found health.mjs post.json blocker) | Wed Nov 25, 11:37 PM
42 | started | - | Dec 1 night roster step (md-roster-step.mjs + fixture test) | Wed Nov 25, 11:37 PM
42 | done | alt/gemini-md-roster 126416dc | md-roster-step.mjs + fixture test (all passed) | Wed Nov 25, 11:43 PM
43 | started | - | merge-check.sh support for main + scratch tests | Wed Nov 25, 11:43 PM
46 | started | - | news freshness blocker (health.mjs + post-news.mjs ran timestamp) | Wed Nov 25, 11:44 PM
46 | done | alt/gemini-news-ran-data c78d15e2 (into main) + alt/gemini-news-ran-page bdb62e1c (into design6) | health dates post.json by ran||updated; post-news writes ran on success, keeps old ran on failure; combined proof passes; NOTE one-line edit to existing post-news-test.mjs docOk, see report | Wed Nov 25, 11:53 PM
43 | started | - | merge-check.sh for main + design6 (resumed after 46) | Wed Nov 25, 11:53 PM
43 | done | alt/gemini-merge-gate 0d5df189 | merge-check.sh picks the test list by target (main = main's test.yml incl. frozen out/, design6 list unchanged), new wrong-target check, stamp+hook name the branch; merge-gate-test 8 FAILED before, 24/24 after | Wed Nov 25, 11:59 PM
44 | started | - | quiet launch-day alarms (md-watch regAt + health/md-watch 0-event days) | Wed Nov 25, 11:59 PM
44 | done | alt/gemini-quiet-alarms 91911b8d | md-watch uses regAt and skips paused on quiet API-200 days; update stamps apiOk:true and health warns instead of failing on quiet launch days; quiet-launch-alarms-test 5 FAILED before, 13/13 after; md-day-one 22/22 | Thu Nov 26, 6:29 AM
45 | started | - | flaky app/test/prelaunch.mjs (run.mjs) diagnosis & fix | Thu Nov 26, 6:29 AM
45 | done | alt/gemini-flaky-prelaunch efb7aaa6 | replaced blind sleeps in prelaunch.mjs with readiness/DOM/store condition waits (all 27 assertions untouched); 3.2s delay fails OLD and passes NEW; 20/20 idle + 3/3 load-6 pass after | Thu Nov 26, 7:44 AM
48 | started | - | merge-check.sh target main runs both test lists when test.yml has v2 steps | Thu Nov 26, 7:44 AM
48 | done | alt/gemini-merge-both 51cf6b51 | merge-check.sh target main automatically runs tests_main + tests_design6 when test.yml has app/test/v2-public.mjs; merge-gate-test 2 FAILED before, 29/29 after | Thu Nov 26, 7:47 AM
49 | started | - | Dec 2 balance patch hand-written half + patch-dec2-test.mjs | Thu Nov 26, 9:43 AM
49 | done | alt/gemini-patch-dec2 99b5cd54 | Dec 2 hand-written half (47 LEARN pairings incl. Megas + Castform weather forms, Flash Fire + Stalwart ABIL, infosheet 20%, run.mjs 76); generated files untouched; patch-dec2-test 52 FAILED before, 57/57 after; legality-check exit 0 | Thu Nov 26, 9:47 AM
50 | started | - | search-ready public pages test (app/test/seo-check.mjs) | Thu Nov 26, 9:47 AM
50 | done | alt/gemini-seo-test 3707f22c | app/test/seo-check.mjs checks all 371 public HTML pages + 28 rendered routes + sitemap.xml + robots.txt, wired into test.yml; real build 13/13 PASS, broken copy 7 FAILED | Thu Nov 26, 9:54 AM
51 | started | - | Dec 2 undo drill (experiments/dec2-undo-drill.mjs) | Thu Nov 26, 10:03 AM
51 | done | alt/gemini-dec2-undo d3c2f6a2 | experiments/dec2-undo-drill.mjs simulates Dec 2 switch + docs/undo-plan.md undo in scratch repo (15/15 PASS; --skip-hold 5 FAILED; --skip-revert 8 FAILED) | Thu Nov 26, 10:07 AM
52 | started | - | independent code review of origin/alt/day-batch | Thu Nov 26, 10:07 AM
52 | done | alt/gemini-review-daybatch 5e41e3a9 | code review of origin/alt/day-batch (report only): found wide 2-digit '88–99%' slant overflow at 380-390/1200-1280px uncaught by v2-minors, '100–100%' -2px bottom slant at 1200px (mid vs bottom + only '94–100%' injected), silent ins=0 fallback on clipPath parse | Thu Nov 26, 10:13 AM
53 | started | - | seo-check.mjs robustness (never crash on broken pages) | Thu Nov 26, 10:39 AM
53 | done | alt/gemini-seo-test2 a176b544 | seo-check.mjs wraps launch/server/per-route checks in try/catch + waits for .np-load clear; two-page break shows BOTH failures (2 FAILED, exit 1), bad browser shows clean FAIL (no stack trace), real build ALL PASSED | Thu Nov 26, 10:42 AM
54 | started | - | switch-day smoke test (experiments/switch-smoke.mjs) + runbook step 8 | Thu Nov 26, 10:42 AM
54 | done | alt/gemini-switch-smoke 0d484879 | experiments/switch-smoke.mjs checks 10 views at 390x844 + 1440x900; design6 + origin/main out/ (Nov 26, 346 rated, 17606 teams, 114 events, 52 stories) ALL PASSED; fails on missing post.json and injected pageerror | Thu Nov 26, 10:51 AM
55 | started | - | Core Web Vitals speed check (app/test/speed-check.mjs) + top 5 wins | Thu Nov 26, 10:51 AM
55 | done | alt/gemini-speed-check 139d4fec | app/test/speed-check.mjs (390x844, 4x CPU, Fast 3G): /pokemon PASS (1.77s, 266 KB, CLS 0); 9 SPA pages FAIL (LCP 10.9-11.5s, 2.07-2.30 MB, dominated by 1.79 MB gz v2.js with 1.56 MB inlined base64 ITEM_IMG); top 5 fixes with file:line in report | Thu Nov 26, 11:15 AM
56 | started | - | 12 Reg M-D fixture teams + experiments/md-fixtures-test.mjs | Thu Nov 26, 11:15 AM
56 | done | alt/gemini-md-fixtures 6af5a0b6 | 12 Reg M-D fixture teams + md-fixtures-test.mjs (72/72 legal, all scored 73.5-88.9; broken fixture 13 FAILED exit 1) | Thu Nov 26, 11:24 AM
57 | started | - | public speed fixes 1+3 (external item webp files + shared v2.css on index.html) | Thu Nov 26, 12:20 PM
57 | done | alt/gemini-speed-fix1 c540120c | public external item webp files + shared /v2.css on index.html (LCP 11.6->5.6s, v2.js gz 1797->662 KB; all public tests pass in both build orders; 17/20 byte-identical + 3/20 1px subpixel) | Thu Nov 26, 12:52 PM
58 | started | - | --split-routes on --public: measure LCP/bytes + full public test list, report what breaks before fixing | Thu Nov 26, 12:52 PM
