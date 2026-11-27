M1 | started | alt/maggi-m1-review - | starting bug review of alt/f3-claude | Thu Nov 26 08:38:37 PM EST 2026
M1 | done | alt/maggi-m1-review e6f8ae14 | 0 switch blockers, 4 fix-after (Reg M-C/M-D evReg/0-teams/unrated + Claude /pokemon/ href), 3 minor; main1 99/99 pass before 10m timeout | Thu Nov 26 08:56:16 PM EST 2026
- | idle | - | waiting for HH | Thu Nov 26 09:04:43 PM EST 2026
M2 | started | alt/maggi-m2-f3fixes - | fixing M1 findings 1-5 with fail-before/pass-after tests | Thu Nov 26 09:13:12 PM EST 2026
M2 | done | alt/maggi-m2-f3fixes bcbcad56 | fixed M1 #1-5 + F3-4..7 (fail-before/pass-after), builds+v2-public+HQ+HOME-06 pass; CI running | Thu Nov 26 09:55:14 PM EST 2026
M3 | started | alt/maggi-m3-f3cleanup - | F3 contrast + 1000x650/393x659 fold checks, f3Seo check/removal, V2._f3 reg cache key | Thu Nov 26 09:55:25 PM EST 2026
M3 | done | alt/maggi-m3-f3cleanup 70ff358e | added F3-8..10 (contrast day/night, 1000x650/393x659 fold, reg cache key), removed unused V2.f3Seo; builds+v2-public+F3-1..10 pass; CI running | Thu Nov 26 10:05:28 PM EST 2026
M4 | started | alt/maggi-m4-patchmap - | checking Dec 2 balance-patch map against claude/design6 and main | Thu Nov 26 10:07:53 PM EST 2026
M4 | done | alt/maggi-m4-patchmap 5e96566d | audited Dec 2 patch map on design6+main: 5 shifted lines, missed Showdown 1242c1e pins in package.json+test.yml (must change), rules-fixes-test Dec 2 guard, md-roster-step hook | Thu Nov 26 10:11:09 PM EST 2026
M5 | started | alt/maggi-m5-dec2patch - | writing experiments/apply-dec2-patch.mjs and apply-dec2-patch-test.mjs | Thu Nov 26 10:13:54 PM EST 2026
M5 | done | alt/maggi-m5-dec2patch b0daf6e8 | added apply-dec2-patch.mjs + apply-dec2-patch-test.mjs (14/14 pass incl. time-bomb fail/pass, run.mjs, unrated-test); note md-roster-step:201 needs --write | Fri Nov 27 06:32:10 AM EST 2026
M6 | started | alt/maggi-m6-review - | independent review of origin/alt/helper-dec2patch (fc49e36d) | Fri Nov 27 06:32:27 AM EST 2026
M6 | done | alt/maggi-m6-review b10c9dfb | reviewed helper-dec2patch (fc49e36d) vs news 877 + M4: 0 blockers, 1 should (add done predicate on data.js ABIL rows), 2 minor; apply-dec2-patch-test 29/29 + md-roster-step --force-patch pass | Fri Nov 27 06:34:44 AM EST 2026
M7 | started | alt/maggi-m7-dec2fix - | cross-checking both Dec 2 patch scripts and adding data.js ABIL done-predicates + fail-first test | Fri Nov 27 06:37:19 AM EST 2026
M7 | done | alt/maggi-m7-dec2fix a3d7622b | cross-checked both scripts (helper wins, nothing wrong), added data.js ABIL done-predicates + fail-first check 8; all 30 patch-test + rules-fixes (real+Dec3) + md-roster-step-test + run.mjs pass | Fri Nov 27 06:45:14 AM EST 2026
M8 | started | alt/maggi-m8-wrapper-test - | writing experiments/host-wrapper-test.mjs + CI wiring + fail-before/pass-after proof | Fri Nov 27 06:47:55 AM EST 2026
M8 | done | alt/maggi-m8-wrapper-test 612d0364 | added host-wrapper-test.mjs + test.yml; caught 2nd wrapper bug ([hidden] display:none!important shifted header logo 40px left) and fixed in build.mjs:56 -> 0 differing pixels across 390/1440 light/dark | Fri Nov 27 06:55:02 AM EST 2026
M9 | started | alt/maggi-m9-webkit - | extending host-wrapper-test.mjs for WebKit (iPhone 15, iPhone SE, iPad Pro 11) + Home/Team/Meta/Garchomp/Battle | Fri Nov 27 06:57:28 AM EST 2026
M9 | done | alt/maggi-m9-webkit 1e1b06af | WebKit iPhone 15/SE/iPad Pro 11 x light/dark x 5 pages (Home/Team/Meta/Garchomp/Battle): 0 baseline noise, ALL 60 PASSED (0 differing pixels); Chromium ALL 8 PASSED | Fri Nov 27 07:06:16 AM EST 2026
M10 | started | alt/maggi-m10-webkit-all - | adding Build, My Box, Track Record, Search open, Spicy picks on, How We Calculate, About to WebKit host-wrapper-test | Fri Nov 27 07:08:54 AM EST 2026
M10 | done | alt/maggi-m10-webkit-all 4e2ccb91 | WebKit iPhone 15 + iPad Pro 11 x light/dark x 7 extra pages (Build/Box/Track/Search/Spicy/Method/About): ALL 56 PASSED (0 differing pixels); Chromium ALL 8 PASSED | Fri Nov 27 07:17:34 AM EST 2026
M11 | started | alt/maggi-m11-kip71 - | waiting for / reviewing Kip job 71 on alt/gemini-speed-chain | Fri Nov 27 07:20:05 AM EST 2026
M11 | done | alt/maggi-m11-kip71 c034ccce | Verified Kip job 71 (80c0d935): M1, M2, M3, M4, F1 all fixed (report docs/rebuild/test-runs/maggi-M11-kip71.md) | Fri Nov 27 07:39:33 AM EST 2026
- | idle | - - | M11 done; waiting for next job | Fri Nov 27 07:47:55 AM EST 2026
M12 | started | alt/maggi-m12-podium - | Starting M12: Home podium sprite stacking order investigation + podium-cover-test.mjs | Fri Nov 27 07:50:23 AM EST 2026
M12 | done | alt/maggi-m12-podium 25b3551a | Settled 612d0364: phones fixed (HH WebKit render right, 26% sprite px over .sdt-dc); WebKit iPad Pro 11 landscape still cut (z-index:1 only under 700px) + Battle a.sdt-go >=1100; proposed 2-line fix proven | Fri Nov 27 08:03:26 AM EST 2026
