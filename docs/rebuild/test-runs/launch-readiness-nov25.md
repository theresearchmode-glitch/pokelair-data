# Launch readiness for nastyplot.org (launch helper, Wed Nov 25, 2:12 PM; report only; checks by build, tests, Cloudflare API GET, GitHub API)
Big findings (helper-checked; HH re-checks each before acting):
A. Feedback can't work publicly: no Turnstile widget is ever loaded (no challenges.cloudflare / cf-turnstile in app/src); worker answers 403;
   CSP would block Turnstile (script-src 'self', no frame-src). Tests pass only because nothing loads it.
B. Nothing exists on Cloudflare yet: no Workers, Pages, D1, Turnstile, DNS records. Zone nastyplot.org active, Free plan, DNSSEC on.
C. wrangler.toml runs /data/* through the Worker (run_worker_first): 17 data files per visit -> about 5,800 visits/day cap on Free.
D. The public privacy text describes the Claude version ("Saved to your Claude account") - untrue on nastyplot.org (about.js:7-11).
E. The public source map (v2.js.map, 6.2 MB, source comments) would be uploaded; no .assetsignore.
F. Sim's personal email: in the public bundle (56-about-data.js:37, lightly scrambled), the data job's User-Agent (http.mjs:4, official.mjs:22)
   and docs/legal-sources.md; the GitHub repo is PUBLIC (API private:false) and main is not protected. hello@nastyplot.org not set up.
Also: worker checks Turnstile success only (add hostname/action), no rate limit, no size/Origin cap, no server-side scrub of emails/phones;
zone: Always Use HTTPS off, min TLS 1.0, HSTS off, Browser Cache TTL 4 h; no deploy workflow; public loader can't read split (_2) data files;
no index.html/404.html; no public-site watchdog; Limitless ToS not read in full (plan had it Dec 14-31: too late).
10 must-dos in order: 1 Cloudflare base setup (Sim's clicks: D1, Turnstile, scoped token, HTTPS/TLS/HSTS, cache, Email Routing);
2 wrangler routing (/data static, index/404); 3 clean output folder, no source map; 4 data + art into it (whole files, from live, no-names);
5 deploy workflow + smoke test + rollback; 6 feedback working and safe; 7 public privacy page + hello@; 8 preview deploy with noindex + tests;
9 Limitless ToS in full; 10 protect main, public-site watchdog, connect the domain.
