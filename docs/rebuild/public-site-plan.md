# Public site plan (January 2027) — draft for Sim, Tue Nov 24 (updated: all on Cloudflare)
Sim (Nov 24): the domain **nastyplot.org** is already bought, through Cloudflare (checked: app/src/v2/head.html already points
og:image at nastyplot.org). "I want as much as possible and is safe to do done through Cloudflare." HH builds it.
Cloudflare connection here: signed in as the NastyPlot Cloudflare account (checked: whoami, nastyplotgaming@ account).

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

## 2. The plan: everything on Cloudflare
| Piece | Cloudflare product | Why |
|---|---|---|
| The site itself | **Workers static assets** (or Pages) on nastyplot.org | free, fast worldwide, same account as the domain |
| Daily data | the GitHub job (after the tests pass) uploads out/*.json to **R2** (or deploys them with the site); the page reads them | only tested data, like today; no database for reading |
| Saved teams | the visitor's own device (localStorage, already works) + team codes | no accounts = no personal data (kids) |
| Moving testers' teams | "Export my teams" on the Claude version, "Import" on nastyplot.org | Claude-synced teams can't be read from outside |
| Feedback / report a mistake | a small **Worker + D1** table, **Turnstile** to stop spam (no puzzles for normal people) | same anonymous design as today |
| Which pages people use | **Cloudflare Web Analytics** (no cookies, no IDs, totals only) | free, privacy-friendly, no code of ours storing anything |
| Contact email | **Email Routing** (e.g. hello@nastyplot.org forwards to Sim's inbox), still shown only after "Show email" | Sim's real address never appears |
| Owner page | a Worker page behind **Cloudflare Access** (only Sim's email can open it) | no passwords to manage |
| Security / speed | Cloudflare's free SSL, caching, DDoS protection, HTTP/3; per-page scripts; WebP images; self-hosted fonts | 2.75 s → under 2.5 s on 4G goal |
| Privacy page | plain words: nothing stored about you except on your device; feedback anonymous; no ads, no trackers | COPPA and trust |

## 3. Steps (after Dec 2), each with its check
1. **Already settled**: domain nastyplot.org, Cloudflare account connected. Sim only says yes to the launch itself.
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

## 5. Question for Sim (doesn't block the next 8 days)
1. OK with "no accounts, teams live on your device + team codes"? (My strong recommendation for kids' privacy.)
