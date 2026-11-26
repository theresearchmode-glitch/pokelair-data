# SEO audit (seo-audit + technical-seo skills) — helper, Wed Nov 25 3:09 PM; public build of alt/gemini-routes f996daa0
Run under Cloudflare's own local runtime (wrangler 4.45.0 dev; older than the compatibility date; nothing deployed yet).
1 CRITICAL `/<path> /v2.html 200` -> Cloudflare's html_handling 307s to /v2, which shows "Page not found" + noindex (all 23 tool
  addresses). Fix: target `/v2 200` or give each tool page its own file (SEO helper 2 is doing this on alt/gemini-seo2).
2 CRITICAL the Worker didn't start: named non-function exports in worker/feedback.mjs -> FIXED on design6 (feedback-lib.mjs split, test G9).
3 Mobile LCP about 12 s on every page type (FCP 1.8-2.5 s; CLS 0): the script redraws the static first screen, so LCP waits for
  v2.js (1.7 MB compressed). Fix: keep the static hero/h1 nodes on first draw and/or split v2.js per page. Medium.
4 workers.dev and preview addresses would serve a full duplicate site: workers_dev = false, preview_urls = false (or X-Robots-Tag
  noindex off-host); www -> apex 301.
5 /v2 and /404 answer 200 as app copies: X-Robots-Tag noindex for /v2, /v2.html, /404 in _headers.
6 /team/ (trailing slash) gives 404: add `/<path>/ /<path> 301`.
7 BreadcrumbList uses the slug ("garchomp") and runs on not-found: use the display name; skip on not-found.
8 _redirects: self-rewrites (/data/*, /art/*, /art-s/*, /fonts/*, /routes/*) useless; specific lines before splats.
9 No /pokemon list page (404); 0 real "/..." links on any page: add a /pokemon index with plain links (visual: pictures to Sim).
10 Every wrong address downloads the 952 KB app as its 404: a light static 404.html with the underdog (visual).
Good: 370 sitemap URLs 200 after fix 1; Pokémon canonicals = sitemap; unique titles/descriptions; real 404s with noindex;
.html and trailing-slash Pokémon variants redirect; HTML max-age=0; versioned assets immutable; brotli; CLS 0; no CSP/script errors.
