# SEO review of the public build (SEO helper, Wed Nov 25, 2:00 PM; skills seo-check + on-page-seo; report only)
Build: origin/claude/design6 4d2b1912 + HH's Pokémon-pages work (then uncommitted, now 145ffd1d). Served like Cloudflare Pages.

Top 10 fixes, biggest Google impact first (helper's checks; HH has not re-checked each yet):
1. Links are "#" links (39 of 40 on /pokemon/garchomp; menu builds href="#k"): Google can't follow them. Fix: real addresses
   (/calc, /pokemon/garchomp) with pushState in the public build; keep # as aliases. Medium-big.
2. No content before scripts: tool pages (/team, /calc, /meta...) have the generic title/description and no canonical in raw HTML.
   Fix: own HTML file per tool page with title/description/canonical (small); build-time render of Pokémon page content (medium).
3. Art and data aren't in the public output (--art=../src/v2/art/; /data/*.json missing; catch-all returns HTML). No deploy step
   exists yet. Fix: build with --art=/art/ and copy art + out/*.json in the deploy. Small.
4. Soft 404s: /zzz and /pokemon/mega-heatran return 200. Fix: list the 24 tool addresses in _redirects, drop the catch-all, add a
   404.html (underdog, rule 23), noindex on the not-found view; add the Reg M-D Pokémon before launch. Small/medium.
5. Pokémon page titles lack "Pokémon Champions" and searched words; og:description generic. Wording: Sim decides. Small.
6. og:image file missing (/og-icon.png), no og:url. Fix: brand-kit image (never redrawn), og:url = canonical. Small.
7. JSON-LD thin: BreadcrumbList only by script; add WebApplication on tools, ItemList on /meta. Small.
8. Headlines lack search words (/calc "Plot the hit." ...). Keep the bold headline (rule 14); keyword in the small line above. Visual: needs pictures. Small.
9. Main Pokémon art has alt="" on its own page. Fix: alt="<name>" on the main art only. Small.
10. Sitemap: no lastmod; includes on-device pages (/box). Page weight: v2.js 3.5 MB. Small (sitemap), big (weight).
Already good: robots.txt, 370-address sitemap, own title/description/canonical on Pokémon files, one h1 per page, unique titles,
clean lowercase addresses, lang/viewport, brand icons at root, strong security headers, no console errors on 10 pages.
