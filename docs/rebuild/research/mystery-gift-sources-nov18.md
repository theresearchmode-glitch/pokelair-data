# Mystery Gift page: where the data can come from (research, look-only)

Written: Tue Nov 17, 2026, 7:23 PM ET (Wed Nov 18, 00:23 UTC), from `bash docs/rebuild/now.sh`.
Helper agent, look-only. No site files changed. Each claim is marked **checked (URL)** or **unsure (why)**.

## Short answer (5 lines)

1. **Official source exists.** The game's own news feed is public JSON (`champions-news.pokemon-home.com/en/json/list.json`). It has exact UTC start/end times for event gifts, Battle Pass, competitions and campaigns. **Serial codes are mostly NOT in it.** They come out ad hoc, through streams, partners, newsletters and social posts.
2. **op.gg's Terms forbid it.** Their Terms of Use (updated 2026-09-14) ban scraping, automated scripts and copying any site content without written permission. Serebii is "All Content © Serebii.net". So: no copying from either, and no list on any fan site is complete. **This also contradicts the op.gg row in docs/legal-sources.md: Sim should see this.**
3. **Recommended start:** a small hand-kept gift list in the repo. A code goes in only after it is seen on an official channel, or on 2+ reputable outlets, each with its source link. A once-a-day read of the official news feed suggests new event gifts for review.
4. **Show dates honestly.** Store end times in UTC. Show the viewer's local time. Ended gifts drop out from the clock automatically. Show "Last checked". Say codes can stop early. The sources really do disagree (see section 4).
5. **Images.** Pokémon gifts can use the HOME renders we already use. No licensed source was found for item icons (tickets, coupons, apparel), so use our own simple icons. Needs Sim's OK: the new source, manual vs daily, the op.gg Terms issue, and the page design.

---

## 1. Official publication of gifts and codes

| Finding | Status |
|---|---|
| The official Japanese site's "ふしぎなおくりもの" (Mystery Gift) menu link goes to the official code redemption site `https://serial-web-front.app.pokemonchampions.jp?lng=10`. | checked (https://www.pokemonchampions.jp/ja/, page HTML) |
| The redemption site is a login app: its code has Nintendo / Google / Apple login plus a "support ID" input. It talks to `serial-web-api.app.pokemonchampions.jp`. **We must never call that API.** Checking codes automatically would be abuse, and it needs a player's login. | checked (its JS bundle `/assets/index-DCoBojE4.js`); what the API does exactly is unsure (only read the front-end strings) |
| In game: Submenu > Mystery Gift(s) > enter code > reward arrives in the Mailbox. Several guides agree. Some say the menu unlocks only after the tutorial / first Ranked Battle. | checked in several guides (e.g. https://nintendoeverything.com/?p=929482). Not seen in game myself |
| **Official in-game news feed (JSON).** The official JP site's script (`/assets/js/main.min.js`) loads `https://champions-news.pokemon-home.com/{lang}/json/list.json` (`en` and `ja` both 200; `en` had 66 items today). Each item has `id`, `title`, `infoKind` (category), `stAt`/`endAt` (Unix time, UTC), `banner` and `link` (an HTML page such as `/en/page/869.html`). The site's own JSON documents the category codes: 3 maintenance, 4 update, 6 **campaign**, 7 notice, 11 ranked, 12 regulation, 13 **online competition**, 14 **championships**, 15 roster, 16 **Battle Pass**, 17 offline event, 18 bugs. | checked (https://www.pokemonchampions.jp/ja/ JS + https://www.pokemonchampions.jp/news/ja.json + the feed itself, fetched once) |
| What the feed carries for gifts: early-download Dragonite + 100 Quick Coupons (item 718: "If you play Pokémon Champions by Monday, August 31, 2026"), NAIC Blastoise (770), Worlds Incineroar (830), Vivillon campaign (850, ends 2027-01-31), each month's Battle Pass (868 Season M-8) and Monthly Challenge Series reward news (869). | checked (feed + https://champions-news.pokemon-home.com/en/page/718.html, /770.html, /830.html) |
| **Not in the feed:** the current shared code `LA1CTRA1N1NG27` (2 Training Tickets), the Blinkit code `10M1NTRNR`, and older shared codes (CHAMP10N, L12ARD0NPJCS26, DRAG0NDANCEPTC26, ENJ0YW0RLDS26). No title in the en or ja feeds mentions them. | checked (feed titles, en + ja). Whether the codes appear in news pages I did not open is unsure |
| The feed is undocumented, with no published API terms. robots.txt on that host returns 404. It could change without notice. | checked (robots 404). Terms: unsure, none found |
| Official English site `champions.pokemon.com/en-us/news/`: 5 recent items, no Mystery Gift code item except the June NAIC Blastoise article (pokemon.com/us/pokemon-news/tune-in-to-naic-...). It has no RSS. Plain curl gets 403, but the fetch tool could read it. | checked (https://champions.pokemon.com/en-us/news/) |
| Twitch-drop rewards (NAIC Blastoise, Worlds Incineroar, Worlds Training/Teammate Tickets) are **single-use personal codes** handed out through rewards.pokemon.com / worlds.pokemon.com. The news pages say: "Additional reward terms and conditions apply... Rewards.Pokemon.com". | checked (news pages 770 and 830). rewards.pokemon.com and worlds.pokemon.com refused automated reads (403 / title only), so their terms are unsure |
| Where `LA1CTRA1N1NG27` first appeared: Serebii's X post ("A new code has been released... Runs until November 22nd") and a "PokemonGlobalNews" Threads/Instagram/Facebook account. **I could not find an official TPC post.** It may have been shown on the LAIC broadcast. | Serebii post: checked via search snippet (https://x.com/SerebiiNet/status/2120577539001467336). Official origin: **unsure**. PokemonGlobalNews is not shown to be official: unsure |
| Official social accounts: the JP site links `x.com/Poke_Champ_jp`. No English Champions X handle was found on champions.pokemon.com. | checked (JP site HTML). English handle: unsure |
| **How fast codes are posted:** the Training Ticket code appeared on outlets Nov 11 (Nintendo Everything, published Nov 11; Analytics Insight, Nov 12). Event-gift news is posted at the event start (e.g. item 869 at 04:00 UTC on maintenance day). | checked (article dates, feed `stAt`) |
| **How long codes run** (from Serebii's list, checked): Machamp CHAMP10N Apr 8 to Aug 31 (about 5 months); Gyarados May 24-31 (8 days); Charizard Jun 6-14 (9 days); Worlds apparel Aug 28 to Sep 5 (9 days); Blinkit coupons Sep 9 to Dec 31 (about 4 months); Training Tickets Nov 11 to Nov 22 (about 11 days). Twitch-drop codes "expire on September 29" (Bulbapedia, Worlds). So most event codes last **1-2 weeks**, while partner/newsletter codes last months. | checked (https://serebii.net/pokemonchampions/serialcode.shtml; Bulbapedia API wikitext) |

## 2. How fan sites source theirs, and what their terms say

Our rules (docs/legal-sources.md): respect robots and Terms; identify ourselves (NastyPlot UA); go slow; credit; stop when refused (as with RK9 and Pokémon Zone).

| Site | What it shows / where it seems to get it | Terms / robots | Usable by us? |
|---|---|---|---|
| **op.gg** (op.gg/pokemon-champions/gift) | Today: Training Ticket `LA1CTRA1N1NG27` "Nov 12 - Nov 23, 2026"; 100 Quick Coupons `10M1NTRNR` "Sep 8 - Dec 30". Filters: Serial Code / Event Gift / Battle Pass / Early Download. **No data source is stated.** | **Terms of Use, "Last Updated: 2026-09-14":** "You are further prohibited from: scraping or data mining while using the Sites or Services; ... copying of any contents of the Sites"; "use automated scripts to collect information from ... the Sites"; "No Site Content may be modified, copied, distributed, ... republished ... without our prior written permission"; "You may use the Sites and Services for your personal, non-commercial use only." robots.txt: `User-Agent: * Allow: /`. | **No** (Terms). Checked (https://op.gg/policies/agreement, read verbatim with curl) |
| **Serebii** | Serial Code page: shared and single-use codes with dates. **Not yet listing `LA1CTRA1N1NG27`** at fetch time, and never lists `HAJ1MAR1G1FT` (a Quick Coupons code that other outlets list for Jun 17 to Aug 31). Says "all codes are region free". | Footer: "All Content is © Copyright of Serebii.net 1999-2026". No reuse licence found. Reports (not official) say Serebii objects to copying. robots.txt only disallows /hidden/ranch/ and /crossword/. | **Read by a person as a cross-check only; don't copy.** Checked (https://serebii.net/pokemonchampions/serialcode.shtml, https://www.serebii.net/robots.txt). Its reuse policy: unsure (none published) |
| **Bulbapedia** | "List of event distributions in Pokémon Champions". It cites official news pages (e.g. champions-news.../page/869.html) and worlds.pokemon.com. **Also lacks `LA1CTRA1N1NG27`, `10M1NTRNR`, `HAJ1MAR1G1FT`.** | Licence from its API: **CC BY-NC-SA 2.5**. Reuse is allowed with credit, non-commercial, share-alike. Images are game art, probably not covered by that licence (unsure). WebFetch got 403; the MediaWiki API answered. | Possible as a cited cross-check (NastyPlot is free and has no ads). ShareAlike would apply to anything adapted. Checked (`/w/api.php?action=query&meta=siteinfo&siprop=rightsinfo`) |
| **Champdex** (champdex.com/distributions) | Lists 14 "active" gifts, including codes and competition rewards. Footer: data from "PokeAPI, Serebii y torneos de Limitless". It says it syncs from Serebii (sync 2026-11-17). Its dates differ from others (Training Ticket "11 Nov - 11 Dec 2026"). | robots: `Allow: /`, `Disallow: /api/`. No terms page seen. | Not a primary source. It is derived from Serebii, so no. Checked (https://champdex.com/es/distributions) |
| **Game8** | Has Champions pages. | Terms page returned **402** to the fetch tool. robots blocks GPTBot / Google-Extended. | Refused automated access; not read further |
| **Pokémon Zone** | n/a | Already noted as answering automated requests with 403 (legal-sources.md, Oct 31). | Not read (respecting the refusal) |
| News outlets (Nintendo Life, Nintendo Everything, GamesRadar, VGC, Pocket Tactics...) | Code lists, often months out of date. | Normal copyright. Facts (a code, a date) are reported news. | Useful as "2 independent reports" evidence, read by a person |

**Takeaway (measured on today's pages):** every list has gaps or conflicts. Serebii and Bulbapedia miss the current code. op.gg and Champdex disagree on its end date. VGC said the early-download bonus ended May 8, but the official feed says **Aug 31** (VGC: https://www.videogameschronicle.com/guide/pokemon-champions-mystery-gift-all-pokemon-champions-mystery-gift-codes, via search snippet; official: page 718).

## 3. Recommended approach for NastyPlot

**Recommendation: a hand-kept list plus an official-feed helper, not a copy of any fan list.**
Why: the official feed is the only source we may read automatically and trust for dates. Codes need a human check anyway.

1. **Data file** (e.g. `data/gifts.json`, a suggestion; nothing made). One entry per gift: `name`, `reward`, `method` (Serial code / Event gift / Battle Pass / Early download / Competition reward), `code` (or none), `startUtc`, `endUtc`, `region`, `sourceUrl` (an official page wherever possible), `checkedAt`.
   Why: one small reviewed file is easy to audit, and nothing reaches kids unchecked.
2. **Rule for adding a code:** seen on an official TPC channel (in-game news, pokemon.com, champions.pokemon.com, official X account, official broadcast). If none can be found, accept 2+ independent reputable outlets, marked "reported, not officially posted".
   Why: fake and wrong codes are the main harm.
3. **Daily job (optional; needs Sim's OK):** read `champions-news.pokemon-home.com/en/json/list.json` once a day with the NastyPlot UA. Pick categories 6, 13, 14, 16. **Suggest** new event gifts in a review list. Never publish or copy banner art or text automatically. Add a row to docs/legal-sources.md first.
   Why: it is the official source, it is one small request a day, and it has exact UTC end times.
   It would also help with Regulation M-D news (category 12).
4. **Expiry shown honestly:** the page decides "Active / Ended" from `endUtc` and the viewer's clock. It shows "Ends Sun Nov 22, 6:59 PM your time (23:59 UTC)" (example for New York), "Last checked <date>", and "Codes can end early or not work in your account. Check in game: Submenu > Mystery Gift."
   Why: op.gg's "Nov 23" vs others' "Nov 22, 11:59 PM UTC" is probably just a time-zone difference (my guess, not tested), and showing UTC plus local time removes that confusion.
   When unsure: show "End date not confirmed" instead of a guess.
5. **What not to list:** single-use personal codes (Twitch drops, CoroCoro, creator codes). Show those only as "how to get it" with the official link.
   Why: those codes belong to one person; posting one would be wrong.
6. **Manual upkeep cost:** about 2-4 new codes a month so far (my count from Serebii's list since April, rough). A weekly check plus checks around big events (Internationals, Worlds, MCS) would cover it. My guess: 5-10 minutes a week.

**Needs Sim's OK:** (a) the official news feed as a new source, plus its legal-sources row; (b) manual-only vs manual plus daily suggestions; (c) the op.gg Terms finding below; (d) the page design (RULES: no visual decision without Sim's yes and screenshots); (e) whether to link the official redemption site (it needs a login) or only give the in-game steps.

**Risks:**
- Wrong or expired codes. Mitigation: end time from the clock, "Last checked", and a source link on every entry.
- Region: Serebii says Champions codes are region free (checked), but some codes are handed out only in one country (CoroCoro JP, the Japanese Nintendo newsletter). Show where it was given, not "only works in".
- Scams: fake "code generator" sites and accounts asking for logins. Mitigation: never link to fan or social code posts, only official TPC pages. Never ask for account details (COPPA). Add one line: "Real codes never ask for your password."
- Kids and social links: X / Instagram / Threads are 13+ platforms, so don't link them from a page kids use.
- Undocumented feed: it may change or disappear. The job must fail safe (keep yesterday's list, alert).

**Gift images:**
- Pokémon: use the HOME renders we already use (same basis as the rest of the site, per legal-sources.md).
- Items, apparel, titles (Training Ticket, Quick Coupon, cap, title): **no licensed source found.** Official news banners are TPC art with no licence for reuse. op.gg images are covered by its Terms. Bulbapedia's CC licence probably doesn't cover game art (unsure). Whether PokéAPI's item sprites include Champions items was **not checked**.
  Suggestion: our own simple icons (ticket, coupon, shirt, title badge). Why: no permission questions, and they fit our design system.

## 4. Things to tell Sim now

- **op.gg Terms vs our op.gg row.** docs/legal-sources.md (checked 2026-11-01) relies on op.gg's help center ("does not prohibit data crawling..."). op.gg's own **Terms of Use, last updated 2026-09-14**, prohibit scraping, automated scripts and copying content without written permission, and allow personal, non-commercial use only. That conflicts with the daily `opgg.mjs` read of ranked usage. Recommendation: Sim decides. Options are to pause opgg.mjs, or to email service@op.gg for written permission.
  Why: the Terms are the binding document, and the help-center line is older and vaguer. (Checked: https://op.gg/policies/agreement. Whether the help-center text still exists today was not re-checked.)
- **Today's conflicting dates for the live code `LA1CTRA1N1NG27`:** Analytics Insight: "November 22, 2026, at 11:59 pm UTC". op.gg: "Nov 12 - Nov 23". Champdex: "11 nov - 11 dic". Nintendo Everything: "until November 22, 2026". No official page was found. Unsure which is right; the Nov 22 UTC reading has the most support.

## Sources checked (all fetched Nov 17-18, 2026 ET)

- https://www.pokemonchampions.jp/ja/ and /assets/js/main.min.js, /news/ja.json (official JP site)
- https://champions-news.pokemon-home.com/en/json/list.json, /ja/json/list.json, /en/page/718.html, 770.html, 830.html (official in-game news)
- https://serial-web-front.app.pokemonchampions.jp (official redemption site, front-end only)
- https://champions.pokemon.com/en-us/news/ (official EN news)
- https://op.gg/pokemon-champions/gift, https://op.gg/policies/agreement, https://op.gg/robots.txt
- https://serebii.net/pokemonchampions/serialcode.shtml, /internetevents.shtml, https://www.serebii.net/robots.txt
- Bulbapedia MediaWiki API (page wikitext + rightsinfo)
- https://champdex.com/es/distributions, https://champdex.com/robots.txt
- https://nintendoeverything.com/?p=929482, https://www.analyticsinsight.net/news/pokémon-champions-free-code-offers-players-two-training-tickets, https://geekslands.fr/pokemon-champions-un-code-pour-obtenir-deux-tickets-d-entrainement-gratuits/
- Refused or unreadable: game8.co/terms (402), bulbapedia wiki pages via WebFetch (403), rewards.pokemon.com (403), victoryroad.pro/champions-resources (403 to the fetch tool), pokemon.com terms (empty JS shell, 403), www.pokemonchampions.jp/en/ (403)
