# Work queue: from Wed Nov 25, 4:01 PM (after the usage reset) through the night to Thu Nov 26, 8 AM (Sim: nonstop; nothing waits for him except the Cloudflare job with Dos)
How it runs: the hourly work check (trig_01Vq2hj3TiUjVrcP9obYbRva, :35 each hour) wakes HH; HH + ONE helper work down this list
in order; every merge into claude/design6 or main goes through `REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch>`
(helper report read, GitHub green on the source, every test); every visual change gets before/after pictures saved for Sim's
morning look (design authority to 10 PM Sun, Sim Nov 25) and is logged with its time. Morning report to Sim at 7:55 AM.

QUALITY FIRST (Sim, Nov 25 3:28 PM: "EXTRA THOROUGH ... quality and polish are the top priority"): speed never beats checks.
Every item: read before changing; a test that fails first; the merge gate; pictures at 390/768/1440 light+dark for anything visible,
looked at by HH before it's called done; design and code review skills on real changes (CLAUDE.md rule 26). If unsure, stop that
item, write down why, and move to the next.

Never overnight without Sim: anything on the live site artifact (5VBfLTR5sM4JU5NswJYyGk) or the switch itself; publishing to
nastyplot.org; Cloudflare/GitHub settings; rewriting git history; rotating keys; deleting anything. These are listed for the morning.

## The queue (top first; skip an item only if blocked, and say why)
1. **M-D start (dates are RIGHT; corrected 3:33 PM):** Pokémon HOME news 878 (in-game source): Dec 2 02:00 UTC to Mar 3 2027 01:59 UTC =
   regulation.json. pokemon.com's "Wed Dec 2 6 PM PST" is a slip. To do (helper's Plan A, report Nov 25 3:31 PM): (a) note the sources in
   regulation.json + a test pinning since/end to the HOME text; (b) close the 3-7 h hole after the start: a page line "Reg M-D has started;
   numbers switch at the next update" while the data still says M-C after REG_END_MC (pictures to Sim) + plan a hand-run data job at about
   02:05 UTC Dec 2; (c) DEFUSE rules-fixes-test.mjs:174, which fails CI from 2026-12-02T01:59Z unless the new Flash Fire/Stalwart text is in
   data.js (check the balance patch notes: news 877/patch page; if the text isn't known yet, make the test wait for the data, not the clock).
   RISK (HH 3:35 PM): after the switch this test is in main's CI; from 2026-12-02T01:59Z it fails until the Dec 2 patch data lands
   (patch-dec2-map.md + patch-dec2-psychup.md: move accuracies, Flash Fire/Stalwart, Psych Up list...). A red main blocks Promote and
   freezes the live data. Plan the patch landing as ONE tested batch, ready on a branch by Dec 1, landed right after the start
   (with the hand-run data job); the test's clock check stays as the safety net. Texts: kip-job16 quotes the official 877 page.
1b. **Remove data/rk9** (Sim, Nov 25 3:44 PM; RK9 terms §5.3(3) forbid automated extraction): first make every reader work without it
   (origin/main: official.mjs, perf.mjs, weekly.mjs, health.mjs, update.yml, app/src/app/63-method.js, scrub-names.mjs,
   experiments/ts-signals.mjs — git grep rk9), keep official-event data from Victory Road/PokePaste/Liquipedia only, tests that fail
   first (no file under data/rk9 read; data job + health pass without it), test branch -> GitHub green -> main fast-forward, then design6.
   Current files only (history keeps it). Also check the site's words (Method/sources text) don't still name RK9 as a source.
2. **Merge alt/gemini-routes, then alt/gemini-seo2** into design6 (gate; wrangler.toml: keep workers_dev=false, preview_urls=false,
   run_worker_first=["/api/feedback"] from design6 AND not_found_handling="404-page" from routes).
3. **Public-repo safety check** (started 4:05 PM): fix what is safe (remove a secret/personal detail from current files, tighten a
   workflow); list for Sim what isn't (history rewrite, key rotation, repo visibility).
4. **Anonymous team-check counter + Cloudflare cookieless Web Analytics** for the quiet launch (marketing's KPI baseline): a count
   only, no IDs, through the feedback Worker + D1; CSP updated; tests that fail first; privacy text updated. Tell NP - Marketing when shipped.
5. **Turnstile on the feedback form** (needs the SITE key from Dos's Cloudflare job tonight): load api.js on the feedback page only,
   CSP script-src/frame-src for challenges.cloudflare.com, Worker checks hostname + action (launch review S1/S2).
6. **Deploy workflow** for nastyplot.org (Workers static assets): after Promote, build --public into a clean folder (no source map,
   only allowed files), copy data (whole files, no-names check) + art, `wrangler deploy` with the scoped token, smoke test, rollback
   command. Built and tested on a branch; NOT switched on until Sim's go (launch review H4/H5/H6/S7/S8).
7. **Public privacy page** (launch review P1): the public version's words (no Claude account; device-only teams; feedback scrubbed
   and deleted after 180 days; Cloudflare security/IPs; hello@ behind "Show email"). Draft for Sim's OK in the morning.
8. **/pokemon list page** linking all 346 (SEO audit #9) and a **light static 404** with the underdog (#10): new visuals -> build on a
   branch with pictures for Sim; don't merge until he's seen them.
9. **Phone speed** (SEO audit #3, LCP about 12 s): keep the static first screen's hero/h1 on the first draw instead of rebuilding;
   measure before/after (same Playwright mobile settings); merge only if pixels match and LCP drops.
10. **Look fixes from the iPhone/iPad check** (docs/rebuild/test-runs/webkit-look-check-nov25.md items 3-7): pictures for Sim.
11. **Game Plan** updated every 45-60 min; Preview republished after each merged batch (7:41 AM daily task also runs).

## Squad overnight
- Dos (Sim's PC): job 2, the night baseline on design6 (docs/rebuild/dos-tonight-nov25.md), if Sim sends it after the Cloudflare job.
- Kip / Scout: only if Sim sends something before bed.

## Morning (7:55 AM report to Sim)
NOW / JUST DONE / NEXT, each merged item with its checks, pictures waiting for his look, decisions only he can make.
