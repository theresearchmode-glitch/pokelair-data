# Domain research for NastyPlot (Nov 20, 2026)

Look-only research for Sim. Nothing was bought, registered or signed up for. Nobody was contacted.
Checks were run Fri Nov 20, 2026, 7:48 to 7:54 PM EST (clock: `TZ=America/New_York date`).
Every claim is labelled **checked** (with the source or command) or **my judgement / not checked**. Prices are USD and can change any day.

## Summary (10 lines)

1. **nastyplot.com is taken** (checked: registered Jan 3, 2021 at DreamHost, expires Jan 3, 2027, no website on it). The other 15 names tested are all free (checked).
2. **First choice: nastyplot.gg** (my judgement). It is the ending competitive-gaming sites use (op.gg, u.gg, and Pokémon's own tournament tool rk9.gg), so players remember it as part of the name.
3. **Fallback: nastyplot.app** (about $9 first year, $15 after). Cheap, clean reputation, HTTPS is forced by every browser. Then nastyplot.net.
4. **Not recommended:** nastyplot.co (the nearest lookalike of a .com a stranger owns, and $30+/yr), nastyplot.xyz (worse abuse record, no upside), thenastyplot.com / getnastyplot.com / playnastyplot.com (people drop the prefix and land on the stranger's nastyplot.com).
5. **Also register and redirect:** nastyplot.app and nastyplot.net. Optional: nastyplot.org, nastyplot.co.
6. **Registrar pick: Porkbun** for everything (it sells .gg; Cloudflare does not). Near-cost prices, hardware-key login, few upsells. Best for security and price on .com/.net/.org/.app: Cloudflare Registrar.
7. **Cost (Porkbun, checked today):** .gg + .app + .net = **$73.07 in year 1, $79.25 per year after**. Budget route, nastyplot.app alone: about $9 then $15 a year. Hosting can be $0 (Cloudflare Pages).
8. **Risk 1:** type-in traffic leaks to nastyplot.com, which someone else owns and could put anything on. Watch its Jan 3, 2027 expiry. Do not count on getting it.
9. **Risk 2:** fan-site legal risk comes from the site's Pokémon content, not from the words "nasty plot" (no US trademark found for the phrase, checked). The Pokémon Company publishes no fan-site permission. Not legal advice.
10. **Risk 3:** filters. New domains are often blocked for their first weeks, and the word "nasty" may trip keyword filters at schools (my judgement, not checked). Register about a month before launch and test on family filters.

---

## Part 1: what makes a good domain

### 1.1 How much the ending matters

| Question | What the evidence says | Label |
|---|---|---|
| Trust | Survey of 1,500 people: trust scores out of 5 were .com 3.5, .co 3.4, .org 3.3, .us 3.3, .io near the bottom, .biz 2.9. The gaps are small. | checked: [GrowthBadger study](https://growthbadger.com/top-level-domains/). One study, 2019-2022, 8 endings only. No .gg, .app or .xyz in it. |
| Memorability | People recalled the .com address 44% of the time, .co 33%, .org 32%, .net 25%. When they misremember, they are 3.8 times more likely to guess .com than anything else. | checked: same study. This is the important number for NastyPlot. |
| Type-in traffic | Follows from the line above: whoever owns the .com gets the wrong guesses. | my judgement, based on the study |
| Search ranking | Google says new endings are treated like .com and .org. Keywords in the ending give no advantage or disadvantage. | checked: [Google Search Central, 2015](https://developers.google.com/search/blog/2015/07/googles-handling-of-new-top-level). Old, but I found no newer statement. |
| Country endings in search | Google lists the country endings it treats as generic: .ad .ai .as .bz .cc .cd .co .dj .fm .io .la .me .ms .nu .sc .sr .su .tv .tk .ws. **.gg is not on the list.** | checked: [Google's own page](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites). **Sources disagree:** [Nominus](https://www.nominus.com/blog/gg-domain-gaming-island-code) says Google treats .gg as generic; [tld-list](https://tld-list.com/blog/the-gg-domain-name) says it does not. Google's page supports tld-list. In practice op.gg, u.gg and mobalytics.gg rank worldwide, so the effect looks small (my judgement). |
| Having your own domain at all | 79% of people trust a business with its own domain more than one with only social media. | checked: [Domain Name Association survey, via PIR, 2021](https://pir.org/for-orgs/learning-center/resources/organizations-invested-in-domains/). Sponsored by the domain industry. |
| "Two-thirds find a longer .com more credible than a shorter name on another ending" | Reported second-hand. | not checked: quoted by [Sales and Marketing](https://salesandmarketing.com/domain-extensions-in-2025-balancing-trust-with-trendspotting/); I did not find the original survey. |

Plain reading: .com is still the default in people's heads. No other ending comes close on memory. Trust differences between mainstream endings are small.

### 1.2 Spam and abuse reputation by ending

Phishing domains per 10,000 registered names, May to July 2026 (higher is worse):

| Ending | Score | Ending | Score |
|---|---|---|---|
| .net | 15.3 | .site | 73.4 |
| .com | 17.2 | .top | 95.3 |
| .xyz | 37.2 | .pro | 245.6 |
| .info | 48.2 | .icu | 835.2 |

checked: [Cybercrime Information Center (Interisle), May-Jul 2026](https://www.cybercrimeinfocenter.org/phishing-activity-in-tlds-may-july-2026). .gg, .co, .io, .app and .team were not in the parts of the table I saw.

- **.xyz** is about twice as bad as .com on this measure. That is worse, not terrible. But $1.29 first-year prices (checked, Porkbun) attract throwaway registrations, and some network admins block the whole ending (anecdote only: [NextDNS users on Reddit](https://www.reddit.com/r/nextdns/comments/zlqwuf/what_top_leveldomains_tlds_do_you_block/)).
- **.pro** is 14 times worse than .com. Cloudflare's 2024 email study also found 73% of mail from .pro was spam or malicious (checked: [Cloudflare blog, Mar 2024](https://blog.cloudflare.com/top-level-domains-email-phishing-threats/)). Avoid.
- **.gg**: one registrar blog says phishing and spam are each 0.01% of .gg names (checked that the claim exists: [Nominus](https://www.nominus.com/blog/gg-domain-gaming-island-code); it sells .gg, so treat as a sales claim).
- **Spamhaus's own live table: not checked.** Its statistics page did not load from this machine (HTTP 404 on the page I tried).
- **Do schools or parental filters block whole endings?** Filter products let admins block by ending (checked: [BlueCat](https://bluecatnetworks.com/blog/which-top-level-domains-to-block-and-how-to-do-it-right/), [Spiceworks thread on school filters](https://community.spiceworks.com/t/scalefusions-7-best-internet-filtering-softwares-for-schools/1200775)). I found **no published list** showing which endings US schools block by default. Not checked beyond that.
- My judgement, not checked: schools usually block the "games" category whatever the ending. Security filters often block any domain younger than about 30 days. The word "nasty" in the address could trip crude keyword filters.

### 1.3 The .gg ending

- It is Guernsey's country code. Open to anyone since 2019. Gamers read it as "good game". checked: [tld-list](https://tld-list.com/blog/the-gg-domain-name), [Nominus](https://www.nominus.com/blog/gg-domain-gaming-island-code).
- Price is high because the registry's wholesale price is high. It was raised sharply around 2021. checked: tld-list; [Domain Name Wire, 2021](https://domainnamewire.com/2021/10/28/investing-in-gg-domains-is-going-to-become-more-expensive/) (headline only).
- Today: $51.80 a year at Porkbun, $53.50 at Dynadot, $68.98 then $82.98 at Namecheap, $100.04 then $199.98 at Gandi. checked today (sources in Part 2).
- Risks, my judgement: a small island registry sets the price and can raise it again. Country endings are not under ICANN's price or dispute rules. Cloudflare Registrar does not sell .gg (checked: absent from the [Cloudflare price list](https://cfdomainpricing.com/), a third-party copy). Parents who do not game may not recognise it.

### 1.4 .co, .app, .io

- **.co** is Colombia's code. Even GoDaddy, which sells it, says "some users may accidentally type .com out of habit" (checked: [GoDaddy](https://www.godaddy.com/resources/skills/most-common-domain-extensions)). For NastyPlot that mistake lands on a stranger's domain. Renewal is $30 to $45 a year (checked).
- **.app and .dev** are on the browsers' built-in "HTTPS only" list for the whole ending (checked: `"name": "app" ... "mode": "force-https", "include_subdomains": true` in [Chromium's preload list](https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json)). Meaning: every browser refuses plain HTTP on any .app address. Good for safety. The site just needs a certificate, which free hosts supply.
- **.io** means nothing for a Pokémon site and renews at about $50 (checked). Not worth it.

### 1.5 Prefixes, hyphens, length, saying it aloud

All my judgement; I found no solid study.

- "the", "get", "play" get dropped when people retype an address. thenastyplot.com minus "the" is exactly the stranger's nastyplot.com. That makes these the worst choice here, not a safe one.
- Hyphens (nasty-plot.com) must be said aloud ("nasty dash plot") and are also dropped. Same leak.
- Length: nastyplot is 9 letters. Fine. nastyplot.gg is 12 characters in total, as short as any option on the list.
- Radio test: "nasty plot dot g g" is clear. "Dot co" gets heard as "dot com". "Dot x y z" is clear but odd to non-tech people.

### 1.6 How comparable sites are named

All of these resolve today (checked: DNS lookup of each name, Nov 20).

| Site | Domain | Ending |
|---|---|---|
| Pikalytics | pikalytics.com | .com |
| Smogon | smogon.com | .com |
| Pokémon Showdown | pokemonshowdown.com | .com |
| Limitless | limitlessvgc.com, limitlesstcg.com | .com |
| Pokémon Zone | pokemon-zone.com | .com |
| MetaVGC | metavgc.com | .com |
| VGC Guide | vgcguide.com | .com |
| Serebii | serebii.net | .net |
| Pokémon Database | pokemondb.net | .net |
| Bulbagarden | bulbagarden.net | .net |
| LabMaus | labmaus.net | .net |
| Victory Road | victoryroad.pro (also holds victoryroadvgc.com) | .pro |
| PokéBase | pokebase.app | .app |
| PokéAPI | pokeapi.co | .co |
| PokéPaste | pokepast.es | .es (word play) |
| RK9 (official tournament tool) | rk9.gg | .gg |
| pkmn.gg | pkmn.gg | .gg |
| OP.GG, U.GG, Mobalytics, Tracker, start.gg, Blitz, Untapped | op.gg, u.gg, mobalytics.gg, tracker.gg, start.gg, blitz.gg, untapped.gg | .gg |
| Dotabuff, Lolalytics | dotabuff.com, lolalytics.com | .com |

Pattern: Pokémon reference sites are mostly .com or .net. Stats and "get better at the game" tools, which is what NastyPlot is, lean heavily to .gg.

### 1.7 Availability (checked, not guessed)

Three independent checks each: (a) registry RDAP, e.g. `curl -s https://rdap.org/domain/NAME` or the registry's own RDAP server; (b) DNS, `https://cloudflare-dns.com/dns-query?name=NAME&type=NS`; (c) Namecheap's availability lookup (through the Firecrawl data tool).

| Name | RDAP | DNS | Namecheap | Verdict |
|---|---|---|---|---|
| nastyplot.com | **Found.** Registered 2021-01-03, expires 2027-01-03, last changed 2025-12-02, registrar DreamHost, LLC, status "client transfer prohibited", nameservers ns1-3.dreamhost.com | Has nameservers | "Domain exists", not listed for sale | **Taken** |
| nastyplot.co | 404 not found (rdap.registry.co) | NXDOMAIN | available | Free |
| nastyplot.gg | No RDAP service for .gg | NXDOMAIN | available | Free (2 checks) |
| nastyplot.net | 404 (rdap.verisign.com) | NXDOMAIN | available | Free |
| nastyplot.org | 404 | NXDOMAIN | available | Free |
| nastyplot.app | 404 "nastyplot.app not found" | NXDOMAIN | available | Free |
| nastyplot.io | 404 (rdap.identitydigital.services) | NXDOMAIN | available | Free |
| nastyplot.xyz | 404 | NXDOMAIN | available | Free |
| nastyplot.team | 404 | NXDOMAIN | available | Free |
| nastyplot.pro | 404 | NXDOMAIN | available | Free |
| thenastyplot.com | 404 (rdap.verisign.com) | NXDOMAIN | available | Free |
| getnastyplot.com | 404 | NXDOMAIN | available | Free |
| playnastyplot.com | 404 | NXDOMAIN | available | Free |
| nasty-plot.com | 404 | NXDOMAIN | available | Free |
| nastyplot.games | 404 | NXDOMAIN | available | Free |
| nastyplot.site | 404 "Domain nastyplot.site..." | NXDOMAIN | available | Free |
| nastyplot.dev (extra) | 404 | NXDOMAIN | not asked | Free (2 checks) |

"Free" means no record found, so very likely available. None were flagged as premium-priced by Namecheap (checked). It is only certain at checkout.

**What is on nastyplot.com:**
- No website. DNS has no A record, no mail record and no TXT record for nastyplot.com, and www.nastyplot.com does not exist (checked: Cloudflare and Google DNS-over-HTTPS). `curl https://nastyplot.com` got HTTP 502 from this machine's proxy, which fits "nothing to connect to".
- Not parked with ads and not listed for sale on Namecheap's marketplace (checked: 0 listings). Other marketplaces (Afternic, Sedo, Dan): **not checked**.
- The owner's name is hidden, as normal. Not looked into further.
- The Internet Archive has a page saved from June 7, 2019 (checked: its availability API). So the name had an earlier life and was registered again in 2021. I **could not open the saved page** from this machine ("Blocked by egress policy").
- The record last changed on Dec 2, 2025, about a month before that year's expiry. That fits a yearly auto-renewal (my guess, not confirmed). If so, expect a renewal around early December 2026.

**If Sim ever wants the .com** (no contact was made):
- Wait and watch. If the owner does not renew on Jan 3, 2027, the name does not free up at once. Registrars keep an expired name roughly 35 to 45 days, then there is a 30-day redemption period, then about 5 days "pending delete" (checked for the typical timeline: [Porkbun's explainer](https://kb.porkbun.com/article/37-what-happens-after-a-domain-expires); DreamHost has a 30-day redemption period: [DreamHost help](https://help.dreamhost.com/hc/en-us/articles/215864937-Redeem-a-domain-registration)). So the earliest it could be free is about mid-March 2027 (my estimate). Too late for the launch, fine as a later upgrade.
- Backorder services try to catch a dropping name for a fee, charged only on success. Prices: not checked.
- A broker asks the owner on your behalf, so your name stays out of it. GoDaddy charges $99.99 non-refundable plus 20% of the sale price (checked: [GoDaddy](https://www.godaddy.com/domains/domain-broker); a third-party site says $119.99, so sources disagree). Sedo: $69 plus 15 to 20% (checked second-hand: [NameExperts](https://nameexperts.com/blog/business/best-domain-broker/)).
- Payment should go through an escrow service (a neutral middleman holds the money until the domain moves). Escrow fees: not checked.
- What the owner would ask: unknown. A brandable .com that the owner has kept for six years could be a few hundred dollars or several thousand (my guess, not tested).

### 1.8 Trademark and fan-site risk (not legal advice)

I am not a lawyer. This is a plain-words summary of what I could check.

- **Is "Nasty Plot" a registered US trademark?** No match. USPTO trademark search for the phrase "nasty plot" returned 0 live and 0 dead marks; "nastyplot" also 0 (checked Nov 20 via the Firecrawl USPTO tool, source tmsearch.uspto.gov). Other countries: not checked. A name can still have rights without registration.
- **What The Pokémon Company says:** its legal page says "Pokémon character names ... are trademarks of Nintendo" and that fan-made work gives no right to use Pokémon property "beyond a personal, noncommercial home use". It has **no fan-site policy and grants no permission** (checked: [pokemon.com legal information](https://www.pokemon.com/us/legal/information)). So every fan site runs on tolerance, not on a licence.
- **Domain disputes so far:** the reported cases are about domains with "pokemon" in them, and Nintendo won all of them (checked: [GigaLaw, 2016](https://giga.law/blog/2016/07/20/pokemon); [WIPO D2001-1070](https://www.wipo.int/amc/en/domains/decisions/html/2001/d2001-1070.html)). I found no dispute over a move name. Not an exhaustive search.
- **My judgement:** "nasty plot" is two ordinary English words, so the domain name itself is low risk. The real exposure is the site's content (sprites, names, data) and anything that looks official or makes money from Pokémon property. A domain ending does not change that.
- **How big fan sites handle it** (checked on their pages today):
  - Serebii and Pikalytics: "Pokémon and All Respective Names are Trademark & © of Nintendo 1996-2026".
  - Limitless: "The literal and graphical information presented on this website about the Pokémon Video Game is copyright The Pokémon Company (Pokémon), Nintendo, Game Freak and/or Creatures".
  - Victory Road: "Pokémon and all other names are the property of The Pokémon Company, Creatures Inc., Game Freak and Nintendo".
  - Suggestion: a footer line like these plus "unofficial, fan-made, not affiliated with or endorsed by Nintendo or The Pokémon Company". A short talk with a lawyer before the public launch would be money well spent (my judgement).
- **Is buying several endings worth it?** Partly. There are over a thousand endings, so nobody can cover them all, and the one that matters most (.com) is gone. A small set of cheap, well-known ones stops the easiest copycats. See 1.9.
- **Lookalike risk for a kids' audience:** real. A copycat on a nearby name could show ads or ask kids for details. What helps: own the obvious neighbours, always show the full address in the share image and socials, and never ask users to log in or enter personal data (the site already collects none), so a fake has nothing normal to imitate (my judgement).

### 1.9 Ranked recommendation

Prices are Porkbun's, pulled from its public price API today: first year / each year after.

| Rank | Domain | Price | One-line reason | Label |
|---|---|---|---|---|
| Ideal | nastyplot.com | n/a | The ending people guess. Taken, so not a plan. Watch it. | checked taken |
| **1** | **nastyplot.gg** | $51.80 / $51.80 | The gaming ending. Players keep it in mind as part of the name, which cuts wrong guesses to the stranger's .com. | my judgement |
| 2 | nastyplot.app | $8.75 / $14.93 | Cheap, clean record, HTTPS forced, fits a web tool. Best if budget wins. | my judgement |
| 3 | nastyplot.net | $12.52 / $12.52 | Classic Pokémon fan-site ending (Serebii, PokémonDB). Weak on memory (25%). | checked + judgement |
| No | nastyplot.co | $15.76 / $31.20 | One letter from a stranger's .com; pricey renewals. | my judgement |
| No | nastyplot.xyz | $1.29 / $14.21 | Twice .com's phishing rate, sometimes blocked, unfamiliar to parents. | checked + judgement |
| No | nastyplot.io | $28.12 / $51.80 | Costs like .gg without the gaming meaning. | my judgement |
| No | .team / .pro / .games / .site | $2 to $8 then $22 to $32 | Cheap bait, costly renewals; .pro and .site have bad abuse records. | checked |
| No | thenastyplot.com, getnastyplot.com, playnastyplot.com, nasty-plot.com | $11.81 each | Drop the extra bit and you are on the stranger's nastyplot.com. | my judgement |

Where I disagree with Sim's three candidates: none of nastyplot.co, nastyplot.xyz or thenastyplot.com is in my top three, for the reasons in the table. Honest limit: no survey I found measured .gg or .app, so ranks 1 and 2 are judgement, not measurement. If Sim prefers the cheapest good option, nastyplot.app as the main name is a sound choice.

**Also register and redirect to the main name:**
- nastyplot.app (the fallback; blocks the most natural "web app" copycat). $8.75 / $14.93.
- nastyplot.net (the ending Pokémon fans guess second). $12.52 / $12.52.
- Optional: nastyplot.org ($7.98 / $11.84) and nastyplot.co ($15.76 / $31.20). I would skip .co unless a copycat appears; it is the costliest one to keep.

---

## Part 2: where to buy, and how to do it safely

### 2.1 Registrar comparison

Prices: first year / renewal. "Checked" prices were pulled today from the registrar's own page or API unless noted.

| Registrar | .com | .gg | .app | .net | .co |
|---|---|---|---|---|---|
| Cloudflare | $10.46 / $10.46 (see note) | not sold | $8.20 / $14.20 | $11.86 / $11.86 | $30 / $30 |
| Porkbun | $11.81 / $11.81 | $51.80 / $51.80 | $8.75 / $14.93 | $12.52 / $12.52 | $15.76 / $31.20 |
| Namecheap | $12.08 / $19.98 | $68.98 / $82.98 | $7.48 / $22.98 | $12.48 / $18.58 | $5.98 / $45.48 |
| Dynadot | $11.62 / $11.62 | $53.50 / $53.50 | not checked | not checked | not checked |
| Gandi | $11.71 / $38.38 | $100.04 / $199.98 | not checked | not checked | $15.99 promo / $71.98 |
| Spaceship | about $10.18 / $10.18 (second-hand) | not checked | not checked | not checked | not checked |
| GoDaddy | promo under $1 / about $22 (second-hand) | not checked | not checked | not checked | not checked |
| Squarespace | about $20 / about $20 (second-hand) | not checked | not checked | not checked | not checked |

Sources and notes:
- Cloudflare: [cfdomainpricing.com/prices.json](https://cfdomainpricing.com/prices.json), a third-party copy dated Oct 13, 2026. Cloudflare shows its real prices only inside an account. **Not confirmed today:** one source says the .com wholesale price rose from $10.26 to $10.97 on Nov 1, 2026 ([NameSilo blog](https://www.namesilo.com/blog/en/domain-name-search/cheapest-com-domain-registrars-2026-comparing-real-long-term-costs)); if so, Cloudflare's .com is now about $11.17.
- Porkbun: its public API, `POST https://api.porkbun.com/api/json/v3/pricing/get` (checked today). A $1-off first-year coupon was listed.
- Namecheap: its pricing data via the Firecrawl Namecheap tool (checked today).
- Dynadot: [dynadot.com/domain/com](https://www.dynadot.com/domain/com), [/gg](https://www.dynadot.com/domain/gg) (checked today).
- Gandi: [gandi.net .com](https://www.gandi.net/en-US/domain/tld/com), [.gg](https://www.gandi.net/en-US/domain/tld/gg), [.co](https://www.gandi.net/en-US/domain/tld/co). Read by a text scrape today; the $38.38 .com renewal is so high that Sim should confirm it by eye if Gandi is ever considered.
- Spaceship, GoDaddy, Squarespace: their price pages did not load here. Figures are from comparison articles ([Dupple](https://dupple.com/learn/cheapest-domain-registrars), [Findstack](https://findstack.com/resources/domain-renewal-price)). Treat as rough.
- Sales tax, if any: not checked.

Features and track record:

| Registrar | Free WHOIS privacy | Login security | Locks | DNSSEC | Upsells | Known incidents |
|---|---|---|---|---|---|---|
| Cloudflare | Yes, on by default (checked: [docs](https://developers.cloudflare.com/registrar/)) | App codes and hardware keys (checked: [Cloudflare blog, 2020](https://blog.cloudflare.com/cloudflare-now-supports-security-keys-with-web-authentication-webauthn)) | Registry lock only on the Enterprise plan (checked: [docs](https://developers.cloudflare.com/registrar/custom-domain-protection/)) | One click, free (checked) | None seen (my judgement) | None found for the registrar (not exhaustive) |
| Porkbun | Yes (widely stated; not re-checked today) | Hardware keys and passwordless login (checked: [KB 119](https://kb.porkbun.com/article/119-how-to-secure-your-account-with-a-physical-security-key-using-webauthn), [KB 221](https://kb.porkbun.com/article/221-how-to-set-up-passwordless-login-on-porkbun)) | Domain lock (checked: [product page](https://porkbun.com/products/domain_locking)); no phone-verified registry lock found | Supported (not re-checked) | Light (my judgement) | None found (not exhaustive) |
| Namecheap | Yes (not re-checked) | App codes, U2F keys, passkey (checked: [Namecheap](https://www.namecheap.com/security/2fa-two-factor-authentication/)); one method at a time | Registry lock via "Domain Vault", limited endings (checked: [KB](https://namecheap.com/support/knowledgebase/article.aspx/10536/2289/what-is-registry-lock)) | Yes (checked) | Medium; renewals well above first year (checked prices) | Feb 2023: its email-sending account was abused to send phishing mail; Namecheap said its own systems were not breached (checked: [BleepingComputer](https://www.bleepingcomputer.com/news/security/namecheaps-email-hacked-to-send-metamask-dhl-phishing-emails/)) |
| Spaceship | Not checked | Passkeys (checked: [Spaceship blog](https://www.spaceship.com/blog/passkeys-intro/)) | Not checked | Not checked | Not checked | None found (not exhaustive) |
| Dynadot | Not checked | Hardware keys (checked: [Dynadot blog](https://www.dynadot.com/blog/security-key-authentication-update)) | Not checked | Not checked | Light (my judgement) | Oct 2023: a customer (Galxe) reported its Dynadot account was taken over (checked second-hand: [Daily Hodl](https://dailyhodl.com/2023/10/07/crypto-hacker-strikes-web3-platform-galxe-with-domain-attack-appears-to-have-stolen-around-200000)) |
| Gandi | Not checked | Not checked | Not checked | Not checked | n/a | Not a breach: bought out in 2023, then prices rose and free mailboxes ended (checked: [Tuta](https://tuta.com/blog/gandi-removes-free-mail-service)) |
| GoDaddy | Not checked | Not checked | Not checked | Not checked | Heavy (widely reported; my judgement) | The FTC finalised an order in May 2025 over security failures that led to several breaches from 2019 to 2022 (checked: [FTC](https://www.ftc.gov/news-events/news/press-releases/2025/05/ftc-finalizes-order-godaddy-over-data-security-failures)) |
| Squarespace (ex Google Domains) | Yes (stated on its page, second-hand) | Not checked | Not checked | Not checked | Pushes its site builder (my judgement) | July 2024: at least a dozen domains hijacked after the Google Domains move, blamed on weak account defaults (checked: [Krebs on Security](https://krebsonsecurity.com/2024/07/researchers-weak-security-defaults-enabled-squarespace-domains-hijacks/)) |

Other facts:
- Cloudflare Registrar requires Cloudflare's nameservers: "all domains on Cloudflare Registrar use Cloudflare nameservers" (checked: [Cloudflare FAQ](https://developers.cloudflare.com/registrar/faq/)). That is fine if the site sits behind Cloudflare anyway.
- Any registrar: a new domain cannot move to another registrar for 60 days (checked: same FAQ, citing ICANN's rule). Transfer-out fees at each registrar: not checked. The normal pattern is that the new registrar charges one year's renewal and the old one charges nothing (my understanding).
- "Registry lock" (a human phone check before any change) is aimed at big companies and is not on offer to a solo owner at a sensible price at any of these. A strong login plus the normal registrar lock is the realistic protection (my judgement).

**Picks:**
- **Best for security: Cloudflare Registrar.** No sales pressure, hardware-key login, and the DNS and the domain sit behind one hardened account. Limits: no .gg, and Cloudflare DNS is compulsory.
- **Best for cost: Cloudflare** for .com / .net / .org / .app (wholesale price). **Porkbun** is within about a dollar and is the cheapest checked for .gg.
- **Overall pick: Porkbun.** It is the only one of the two good ones that sells .gg, so every NastyPlot domain lives in one account with one strong login. Point its nameservers at Cloudflare's free DNS to get Cloudflare's hosting and protection too.
- If Sim picks nastyplot.app as the main name instead, use Cloudflare Registrar for everything.
- Avoid for this job: GoDaddy (breach record, upsells, high renewals), Squarespace (2024 hijacks, about double the price), Gandi (very high renewals).

### 2.2 Checklist for Sim

**Before buying**
1. Do not type the name into random "domain checker" sites. Some are said to register names people search for (reputation only; not checked). Check only at the registrar you will buy from, at the moment you are ready to pay. The checks in this report used registry lookups and one mainstream registrar.
2. Decide the main name and the extras first, so everything is bought in one sitting.
3. Buy about a month before launch. New domains are often distrusted by filters for their first weeks (my judgement).
4. Check today's price at checkout against this report. Decline every add-on (hosting, email, "premium DNS", SSL). None is needed.

**Buying**
5. Use an email address you will keep for years and that has its own 2-step login. If that mailbox is lost or hacked, the domain can be taken.
6. A long unique password from a password manager.
7. Turn on 2-step login straight away: an authenticator app at least, a hardware key or passkey if you have one. Save the backup codes on paper.
8. WHOIS privacy on (it hides your name and home address from the public record). Check it is on for every domain.
9. Auto-renew on, with a card that will not expire soon. Put a calendar reminder a month before each renewal anyway.
10. One year or more? My judgement: 2 years for the main name (fewer chances to lapse, and it locks today's price), 1 year for the extras.

**Right after**
11. Check the domain lock (also called registrar lock or transfer lock) is on.
12. Add the domains to a free Cloudflare account and switch the nameservers to Cloudflare's. Turn on DNSSEC (a signature that stops forged DNS answers). With Porkbun plus Cloudflare DNS this takes one extra copy-and-paste step at Porkbun.
13. Turn on "Always use HTTPS". Turn on HSTS only once the site works.
14. Redirect every extra ending, and www, to the one main address with a permanent (301) redirect.
15. Set up a contact address on the domain (for example hello@ the main name) that forwards to your real inbox, so your personal address never appears. Cloudflare and Porkbun both offer free forwarding (not re-checked today). Keep it behind the site's "Show email" button as now.
16. Add email anti-spoofing records (SPF, DKIM, DMARC), so nobody can send fake mail "from" NastyPlot. Cloudflare has a wizard for this (not re-checked).
17. Test the address on kid-safe filters (Cloudflare 1.1.1.3 for Families, OpenDNS FamilyShield, CleanBrowsing) and, if possible, on a school network. If it is blocked or uncategorised, ask each filter to categorise it as Games.
18. Put the unofficial fan-site line in the footer (section 1.8).

**Pointing the domain at the site later**
The site is a single-page static build, so any static host works. **Cloudflare Pages:** free; unlimited static requests and bandwidth, 500 builds a month, up to 100 custom domains per project, 20,000 files (checked: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)). The 345 sprite files fit easily. Connect the GitHub repo or upload the build folder, add the custom domain, and the certificate is issued automatically. **GitHub Pages:** free for public repos, with soft size and traffic limits (not checked today). **Netlify:** has a free tier whose terms have changed over time (not checked today). My pick is Cloudflare Pages, because the DNS is already there and there is no bandwidth bill if the site gets popular. Two things to plan before the switch: (1) anything that today depends on Claude-only features (saved ticks, feedback storage) needs a public replacement; (2) the daily data update needs a way to publish to the new host. Both are separate pieces of work, not part of buying a domain.

### 2.3 Total expected cost

Recommended setup at Porkbun (prices checked today; before any tax):

| Item | Year 1 | Each year after |
|---|---|---|
| nastyplot.gg (main) | $51.80 | $51.80 |
| nastyplot.app (redirect) | $8.75 | $14.93 |
| nastyplot.net (redirect) | $12.52 | $12.52 |
| DNS, HTTPS, hosting, email forwarding (Cloudflare free plan) | $0 | $0 |
| **Total** | **$73.07** | **$79.25** |

- Optional extras: nastyplot.org +$7.98 then +$11.84. nastyplot.co +$15.76 then +$31.20.
- Budget route: nastyplot.app as the main name plus nastyplot.net at Cloudflare: about $20.06 in year 1 and $26.06 a year after (from the Oct 13 third-party price list; not confirmed today).
- Buying nastyplot.com from its owner, if ever: unknown; plan on hundreds to thousands of dollars plus a broker's fee (my guess).
- Prices rise most years. .gg rose sharply once already.

---

## What I could not check

- The archived 2019 page for nastyplot.com (blocked from this machine), so I do not know what the name was used for before.
- Whether nastyplot.com is for sale on Afternic, Sedo or Dan (only Namecheap's marketplace was checked: no listing).
- Spamhaus's live "most abused endings" table (page did not load).
- Any hard list of endings that US schools or parental filters block by default (none found). The "nasty" keyword-filter worry is my judgement only.
- Survey data on .gg or .app trust and memorability (none found). The Atom 2024 survey page loaded without its numbers.
- Live prices at Spaceship, GoDaddy and Squarespace, and Cloudflare's price after the reported Nov 1 .com increase.
- Several feature cells for Spaceship, Dynadot, Gandi, GoDaddy and Squarespace (marked "not checked" in the table).
- Trademarks outside the US, and unregistered rights. Not legal advice.
- Backorder and escrow fees.

## Source list

Commands and tools (run Nov 20, 2026):
- `curl -s https://rdap.org/domain/<name>` and registry RDAP servers (rdap.verisign.com, rdap.registry.co, rdap.identitydigital.services, pubapi.registry.google, rdap.centralnic.com, rdap.publicinterestregistry.org)
- `curl -s -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=<name>&type=NS'` (also A, MX, TXT; and dns.google)
- `curl -s https://archive.org/wayback/available?url=nastyplot.com`
- `curl -s -X POST https://api.porkbun.com/api/json/v3/pricing/get`
- `curl -s https://cfdomainpricing.com/prices.json`
- Firecrawl data tools: Namecheap availability, pricing and marketplace; USPTO trademark search
- `whois` is not installed on this machine

Pages:
- GrowthBadger, domain extensions study: https://growthbadger.com/top-level-domains/
- Domain Name Association survey via PIR: https://pir.org/for-orgs/learning-center/resources/organizations-invested-in-domains/
- Google, new endings in search (2015): https://developers.google.com/search/blog/2015/07/googles-handling-of-new-top-level
- Google, generic country endings list: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Cybercrime Information Center, phishing by ending, May-Jul 2026: https://www.cybercrimeinfocenter.org/phishing-activity-in-tlds-may-july-2026
- Cloudflare, endings in email threats (2024): https://blog.cloudflare.com/top-level-domains-email-phishing-threats/
- BlueCat, blocking endings: https://bluecatnetworks.com/blog/which-top-level-domains-to-block-and-how-to-do-it-right/
- tld-list, .gg guide: https://tld-list.com/blog/the-gg-domain-name
- Nominus, .gg: https://www.nominus.com/blog/gg-domain-gaming-island-code
- Domain Name Wire, .gg price (2021): https://domainnamewire.com/2021/10/28/investing-in-gg-domains-is-going-to-become-more-expensive/
- GoDaddy, common endings: https://www.godaddy.com/resources/skills/most-common-domain-extensions
- Chromium HSTS preload list: https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json
- Pokémon legal information: https://www.pokemon.com/us/legal/information
- GigaLaw, Pokémon domain disputes: https://giga.law/blog/2016/07/20/pokemon
- WIPO decision D2001-1070: https://www.wipo.int/amc/en/domains/decisions/html/2001/d2001-1070.html
- Fan-site footers read today: serebii.net, pikalytics.com, limitlessvgc.com, victoryroad.pro
- Cloudflare Registrar docs and FAQ: https://developers.cloudflare.com/registrar/ and https://developers.cloudflare.com/registrar/faq/
- Cloudflare Custom Domain Protection: https://developers.cloudflare.com/registrar/custom-domain-protection/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Porkbun security keys and passwordless: https://kb.porkbun.com/article/119-how-to-secure-your-account-with-a-physical-security-key-using-webauthn and https://kb.porkbun.com/article/221-how-to-set-up-passwordless-login-on-porkbun
- Porkbun, after a domain expires: https://kb.porkbun.com/article/37-what-happens-after-a-domain-expires
- DreamHost, redeeming an expired domain: https://help.dreamhost.com/hc/en-us/articles/215864937-Redeem-a-domain-registration
- Namecheap 2-step login and registry lock: https://www.namecheap.com/security/2fa-two-factor-authentication/ and https://namecheap.com/support/knowledgebase/article.aspx/10536/2289/what-is-registry-lock
- Spaceship passkeys: https://www.spaceship.com/blog/passkeys-intro/
- Dynadot security keys: https://www.dynadot.com/blog/security-key-authentication-update
- Dynadot and Gandi price pages: https://www.dynadot.com/domain/gg , https://www.gandi.net/en-US/domain/tld/gg
- Krebs on Security, Squarespace hijacks (2024): https://krebsonsecurity.com/2024/07/researchers-weak-security-defaults-enabled-squarespace-domains-hijacks/
- FTC order against GoDaddy (2025): https://www.ftc.gov/news-events/news/press-releases/2025/05/ftc-finalizes-order-godaddy-over-data-security-failures
- BleepingComputer, Namecheap email incident (2023): https://www.bleepingcomputer.com/news/security/namecheaps-email-hacked-to-send-metamask-dhl-phishing-emails/
- GoDaddy broker service: https://www.godaddy.com/domains/domain-broker
- NameExperts, broker fees: https://nameexperts.com/blog/business/best-domain-broker/
- Price round-ups used for second-hand figures: https://dupple.com/learn/cheapest-domain-registrars , https://findstack.com/resources/domain-renewal-price , https://www.namesilo.com/blog/en/domain-name-search/cheapest-com-domain-registrars-2026-comparing-real-long-term-costs
