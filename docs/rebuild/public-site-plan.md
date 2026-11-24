# Public site plan (January 2027) — draft for Sim, Tue Nov 24
Goal: NastyPlot as a normal public website, free to visit, fast on phones, safe for kids (COPPA), with today's data, and no
dependence on Claude-only features. Writing it now; building it after Dec 2 (game plan).

## 1. What depends on Claude today (checked: grep for `window.claude` in app/src, 8 files)
| Feature | How it works today | Where |
|---|---|---|
| Daily data | the refresh writes 16 documents into the artifact's database; the page listens to them | 03-persistence.js metaJoin, shell.js dataReady |
| Saved teams, box, settings | saved on the device (localStorage `cc2.state`) AND synced to the viewer's Claude account (`data/users/<id>/state`) | 03-persistence.js |
| Feedback / "report a mistake" | one anonymous document per viewer (`feedback/<opaque id>`), owner reads all | 53-feedback.js, v2 feedback.js |
| Usage counts | per-viewer counts (`usage/<id>`), owner page sums them | 51-usage.js, v2 owner.js |
| Share image / team sheet download | Claude's `downloads` capability | v2 team.js, thisweek.js |
| Viewer identity | Claude's `user` (opaque id, owner check) | the four above |
Everything else (pages, calc, scores, search, sprites, fonts) is plain HTML/JS and works anywhere (my view; to be proven by
the practice build in step 3 below).

## 2. The plan (recommendations, each with its reason)
| Piece | Recommendation | Why |
|---|---|---|
| Hosting | **Cloudflare Pages** (static files), free tier | fast worldwide CDN, free, the Cloudflare tools are already connected here; Vercel is the fallback |
| Domain | buy one Sim chooses (e.g. nastyplot.com / .gg, availability not checked) | a real name for a public site; ~$10-30/year |
| Daily data | the page fetches the tested JSON straight from the CDN (the `live` branch's out/ files, copied to the site each morning by the GitHub job after the tests pass) | no database needed; same "only tested data" rule as today |
| Saved teams | **device only** (localStorage, already works), plus "Copy my team code / Paste a team code" to move between devices | no accounts = no personal data = simplest COPPA position |
| Moving today's testers' teams | a one-time "Export my teams" button on the Claude version before the switch to public, and "Import" on the public site | Claude-synced teams can't be read from outside Claude |
| Feedback | a tiny Cloudflare Worker + D1 table: text (emails/phones/@handles stripped as today), kind, page, phone/desktop, date. No IDs, rate-limited | keeps today's anonymous design; free tier |
| Usage | page-view **totals per day per page** only (a Worker counter), no IDs, no cookies, no third-party analytics | answers "which pages matter" without tracking anyone |
| Share image | normal browser download (a link with `download`) | no Claude needed |
| Owner page | password-protected Worker page for feedback + totals | Sim's view of what people say and use |
| Privacy page | plain-words page: what we store (only on your device), feedback is anonymous, no accounts, no ads, contact via "Show email" | COPPA and trust |
| Speed | split the script per page; images already WebP; fonts self-hosted | 2.75 s → under 2.5 s on 4G goal (Game Plan) |

## 3. Steps (after Dec 2), each with its check
1. **Decisions from Sim** (Dec 3): domain name; Cloudflare account (Sim's own, free); owner password storage.
2. **Data from files** (Dec 3-5): a build flag `--public` where the page reads out/*.json over HTTP instead of the database.
   Check: the public build shows the same numbers as the Claude build on the same day (a script compares them).
3. **Practice public build** (Dec 5-8): deploy to a hidden Cloudflare Pages URL; run every test against it (behaviour,
   v2-minors, tap-size, qcheck), WebKit, and a real-phone speed test.
4. **Feedback + usage Workers** (Dec 8-12): with the privacy rules; tests that no ID, email or name is ever stored.
5. **Export/Import teams** (Dec 10-14): ship Export on the Claude site first so testers can save their teams.
6. **Speed** (Dec 12-20): per-page scripts; measured on a real mid-range phone.
7. **Privacy page, domain, final checks** (Dec 20-30), then launch in January with Sim's yes; the Claude version stays as a
   private preview for testing.

## 4. Risks
- Limitless's terms for showing its data on a public site: **not checked**; read before launch (we only use public API data).
- Pokémon images and names on a fan site: standard for fan sites, but keep a clear "not affiliated" line (my view; not legal advice).
- GitHub repo: data job and site source live there; it's public today per HANDOVER notes (not re-checked). Player names are
  already replaced by IDs (no-names check passes daily).
- Cost: hosting and Workers on free tiers; only the domain costs money (my estimate; Cloudflare's limits not re-checked).

## 5. Questions for Sim (none block the next 8 days)
1. Domain name ideas, and do you already own one?
2. Your own Cloudflare account, or another host you prefer?
3. OK with "no accounts, teams live on your device + team codes"? (My strong recommendation for kids' privacy.)
