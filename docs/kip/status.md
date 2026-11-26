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
