# Gifts and news data for The Post Room and The Champions Dispatch (app/src/data/post.js)

Written: Tue Nov 17, 2026, 9:24 PM ET (Wed Nov 18, 02:24 UTC), from `bash docs/rebuild/now.sh`. Post-data helper.
Builds on docs/rebuild/research/mystery-gift-sources-nov18.md (read that first for the wider source research).
Every claim is marked **checked** (how) or **unsure** (why). Not live: post.js waits for Sim's OK on the sources.

## What was gathered (counts, checked by `node experiments/post-data-test.mjs` and the site's own `V2.postNow()`)

| Part | Count | Notes |
|---|---|---|
| Gifts | **36** | **5 live** on Nov 18 (UTC), **31 past** (24 Pokémon, 7 items). None left unplaced. |
| Live | 5 | Training Ticket ×2 (code, ends Nov 22), Pawmot (Monthly Challenge Series Nov, ends Nov 23 01:59 UTC), Inteleon (Battle Pass M-8, ends Dec 1 01:59 UTC), Quick Coupons ×100 (code, ends Dec 31), Vivillon Trainer Icon (campaign, ends Jan 31 2027 14:59 UTC) |
| From the official feed | 25 | 7 Monthly Challenge Series prizes, 3 Global Challenge prizes, the Warm-Up Challenge prize, 8 free Battle Pass Pokémon, the early-download Dragonite + 100 Quick Coupons, mobile-release Raichu, Vivillon icon, NAIC Blastoise, Worlds Incineroar |
| From outlets (no official page found) | 11 | 8 serial-code gifts, 3 Worlds Twitch-drop items (personal codes, so no code listed) |
| Codes verified | **6** | LA1CTRA1N1NG27, 10M1NTRNR (live); NA1CCHAMP, L12ARD0NPJCS26, DRAG0NDANCEPTC26, CHAMP10N (ended). Each printed by 2+ reputable outlets, none by an official channel. |
| Codes not verified | **2 left out** | 100 Quick Coupons Jun 17-Aug 31 (one outlet), Worlds Outfit Set password (not printed by 2 outlets read). `note` says "Code not verified". |
| Held (found, not placed) | 3 | 5,000 VP Worlds code (2 outlets, but no end date: it would show as live forever), 500 VP NAIC code (one outlet), 50 Quick Coupons co-streamer reward (one outlet, no dates). |
| Nature / Ability / moves | 4 Pokémon | Worlds Incineroar (LevelUp), Charizard (Vice), Gyarados and Machamp (Nintendo Life). Natures only for Incineroar: no other source prints one. |
| Series rounds | **7** | Monthly Challenge Series May-Nov 2026, each with its gift (all from official pages). |
| News | **67** | Every item in the official English feed today: Maintenance 17, Tournament 12, Battle Pass 8, Ranked Battles 8, Announcement 7, Roster 6, Campaign 3, Regulations 3, Championships 1, Update 1, Issue 1. **Interviews: 0** (see below). |

The shape of every field is documented in post.js's header comment.

## Sources and their terms

| Source | What it gave | Terms status | Requests |
|---|---|---|---|
| **Official in-game news feed**: champions-news.pokemon-home.com/en/json/list.json and /en/page/{id}.html | All 67 news headlines, dates, categories, links; 25 gifts with exact UTC periods from the pages' own text | Official (The Pokémon Company's game news). Undocumented; no published terms; robots.txt 404 (checked in the Nov 17 research). We store headline, date, category and link only: no article text, no banner images (no licence found). | 1 list + 26 pages, once, 3 s apart, User-Agent "NastyPlot/1.0 (fan site)" |
| champions.pokemon.com/en-us/news/ (official EN site) | nothing | Answered 403 (Incapsula bot wall) to our identified request, robots.txt too. Treated as a refusal: not retried, not worked around. | 2 |
| Nintendo Life (2 news posts + codes guide) | codes, end days, Machamp/Gyarados Ability and moves | Normal copyright. Read by a person only to confirm codes and dates (facts); nothing copied but the code, dates and move names. | read once each |
| Nintendo Everything (Nov 11 post + codes list) | codes, start/end days | same | read once each |
| LevelUp (2 articles) | 10M1NTRNR, Worlds rewards, Incineroar nature and moves | same | read once each |
| Critical Hits (Brazil), Vice, Insider Gaming (2), Analytics Insight | second sources for codes and end times | same | read once each |
| **Not used**: op.gg, Serebii | - | Terms forbid copying (op.gg Terms 2026-09-14; Serebii "All Content ©"). The test fails if either appears in a `src`. | 0 |
| Not used: Champdex, Bulbapedia, Pokébip, PikaMMO, guide farms (allthings.how, frvr, nerdschalk...) | - | Champdex syncs from Serebii; Bulbapedia is CC BY-NC-SA (ShareAlike); the rest are not reputable enough to count as a second source. | 0 |

The outlet reads used Claude's own fetch tool (it sends its own User-Agent, not ours). Web searches were used to find the articles.

## What is unverified or unsure

- **No code is on an official channel.** All 6 rest on outlets (2-3 each). The redemption API was never called. **unsure** whether any still works.
- **Start of the live Training Ticket code (LA1CTRA1N1NG27):** first report Nov 11 (Nintendo Everything's article); Nintendo Everything's own list says Nov 1; the mock-up (op.gg) said Nov 12. Stored as Nov 11, marked `approx`.
- **End times given as days only** (most outlet codes): stored as 23:59:59 UTC of that day and marked `approx: ['end']`. A code can end earlier in the viewer's day; the page should say so (the mock-up's note already does).
- **Start times given as days only**: stored as 00:00 UTC, marked `approx`.
- **10M1NTRNR start**: Sep 9 (Critical Hits) vs Sep 10 (LevelUp, Nintendo Everything). Which partner gave it is not confirmed by the sources used.
- **Charizard end**: Jun 14 (Nintendo Everything, Vice) vs Jul 14 (Nintendo Life); Jun 14 used.
- **Worlds Outfit Set end**: Sep 3 (LevelUp) vs Oct 3 (a French fan site); Insider Gaming gives none.
- **Early-download Dragonite and NAIC Blastoise dates** are the official news item's display window, not the gift's own claim window (not on the page). Marked `approx`.
- **Competition prizes** (`how: 'Competition Prize'`, new): start = entry period start, end = event period end. You only get the Pokémon after finishing 3+ matches; the prize is claimed from the mailbox afterwards, so the claim deadline is unknown.
- **Battle Pass**: only the free pass's Pokémon is a gift; the Premium pass's Pokémon are in `premium` (paid). The feed shows the M-8 news until Dec 2 while its page says the season ends Dec 1 01:59 UTC; the page's date is used.
- **Interviews**: the official feed has none. The mock-up's three interviews come from fan translations (Serebii / op.gg of Famitsu), which we may not copy. Outlets (GamesRadar, VGC, GamerBraves...) have Hoshino interviews; listing their headlines + links would need Sim's OK.
- News titles are as published, except HTML tags (one `<i>`) and invisible zero-width spaces removed.

## Mock-up vs real data (for the page builders)

- Dispatch series row: the mock-up says **"No gift listed" for August and October**. The official pages say **Alolan Raichu (Aug)** and **Sirfetch'd (Oct)**; November is **Pawmot**.
- Post Room counts: the mock-up's "41 stamps / 43 so far / Pokémon 25, Items 16" were op.gg's. Ours: 36 in all, 31 past (24 Pokémon, 7 items). Extras that came in the same parcel (Quick Coupons, titles, Mega Stones) are listed in `extras`, not as separate stamps; Premium Battle Pass Pokémon (the mock-up's Swampert) are not gifts.
- Mock-up "Sent Nov 12" for the Training Ticket: ours is Nov 11, approximate.

## A daily automatic update: what it would need

- **Feed:** `https://champions-news.pokemon-home.com/en/json/list.json`, **once a day** (after the daily job; new items go up around 02:00-06:00 UTC on maintenance days). One request; the response carries a `hash`, so nothing changes when the hash is the same.
- **News (could be automatic):** add new items as headline, date, category, link. Same fields as today; no text, no images. If the feed fails or its shape changes, keep yesterday's list and alert (fail safe).
- **Gifts (suggest only):** for new items in categories 6 Campaign, 13 Online Competition, 14 Championships, 16 Battle Pass, fetch that one page and draft a gift entry (period and prize lines) into a review list. A person checks it before it goes into post.js.
- **Codes stay manual:** they are almost never in the feed; each needs a person to find 2 reputable outlets (or an official post). Never call the redemption API.
- The test (experiments/post-data-test.mjs) should run in the daily job and block the update if it fails.
- **Needs Sim's OK:**
  1. The official news feed as a source, and a new row in docs/legal-sources.md (it has none yet). Note: legal-sources.md says the daily job's User-Agent is `NastyPlot-data/1.0 (...)`; this read used "NastyPlot/1.0 (fan site)" as the brief asked. One string should be chosen.
  2. Outlets as the second-source rule for codes (Nintendo Life, Nintendo Everything, LevelUp, Critical Hits, Vice, Insider Gaming, Analytics Insight used here). Analytics Insight is the weakest; it only adds a time.
  3. News automatic vs reviewed; gifts suggest-only.
  4. Whether Maintenance notices (17 of 67) show on the Dispatch or are filtered out.
  5. Whether past codes should be kept in the data at all (stamps don't show them).
  6. The two new `how` words ('Competition Prize', 'Livestream Reward') and their stamp colours.
  7. Interviews from outlets (headline + link) or none.
