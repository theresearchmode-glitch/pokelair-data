# Work queue: from Wed Nov 25, 4:01 PM (after the usage reset) through the night to Thu Nov 26, 8 AM (Sim: nonstop; nothing waits for him except the Cloudflare job with Dos)
How it runs: the hourly work check (trig_01Vq2hj3TiUjVrcP9obYbRva, :35 each hour) wakes HH; HH + ONE helper work down this list
in order; every merge into claude/design6 or main goes through `REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch>`
(helper report read, GitHub green on the source, every test); every visual change gets before/after pictures saved for Sim's
morning look (design authority to 10 PM Sun, Sim Nov 25) and is logged with its time. Morning report to Sim at 7:55 AM.

Never overnight without Sim: anything on the live site artifact (5VBfLTR5sM4JU5NswJYyGk) or the switch itself; publishing to
nastyplot.org; Cloudflare/GitHub settings; rewriting git history; rotating keys; deleting anything. These are listed for the morning.

## The queue (top first; skip an item only if blocked, and say why)
1. **M-D dates** (main's data pipeline): M-D runs Wed Dec 2 6:00 PM PST to Wed Mar 3 2027 5:59 PM PST = 2026-12-03T02:00Z to
   2027-03-04T01:59Z (checked on pokemon.com Nov 25); M-C end 2026-12-02T01:59Z stays. Use the helper's plan (M-D date-fix plan,
   Nov 25 afternoon). Test branch from main -> GitHub green -> fast-forward main; then design6. Every changed test fails first.
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
