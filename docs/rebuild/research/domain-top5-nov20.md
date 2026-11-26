# Top 5 domain endings for NastyPlot, other than .com and .gg (Nov 20, 2026)

Look-only research for Sim. Nothing was bought, registered or signed up for. Nobody was contacted. No personal data was sent anywhere.
Checks ran Fri Nov 20, 2026, 8:16 to 8:22 PM EST (clock: `TZ=America/New_York date`).
Labels: **checked** (source or command + result) or **my judgement / not checked**. Prices are USD, before tax, and can change any day.
Builds on `domain-research-nov20.md` and `domain-gg-nov20.md`. Where this report disagrees with them, it says so.

## Summary: the top 5

5-year total = first year + 4 renewals at today's price, at the registrar named.

| Rank | Domain | Available? | 1st year | Renewal | 5-yr total | Best registrar | One-line reason |
|---|---|---|---|---|---|---|---|
| 1 | **nastyplot.app** | Yes (checked) | $8.20 | $14.20 | **$65.00** | Cloudflare (Porkbun $8.75 / $14.93, 5-yr $68.47) | Reads as "the NastyPlot app", cheap, HTTPS forced by every browser, a Pokémon tool already uses it (pokebase.app). |
| 2 | **nastyplot.org** | Yes (checked) | $8.50 | $11.20 | **$53.30** | Cloudflare (Porkbun $7.98 / $11.84, 5-yr $55.34) | Best-remembered and most trusted ending after .com in the one survey we have, and the cleanest abuse record of the big three. |
| 3 | **nastyplot.net** | Yes (checked) | $11.86 | $11.86 (rising) | **$59.30** today; about **$63.66** after the Mar 2027 rise (estimate) | Cloudflare (Porkbun $12.52 / $12.52) | The classic Pokémon fan-site ending (Serebii, PokémonDB, Bulbagarden, Liquipedia), clean record. |
| 4 | **nastyplot.games** | Yes (checked) | $8.24 | $30.38 | **$129.76** | Porkbun (Cloudflare $26.20 / $26.20, 5-yr $131.00) | Says "gaming" in the address itself, with a fair abuse record; but renewals cost about 2.5 times .org. |
| 5 | **nastyplot.team** | Yes (checked) | $4.63 | $32.44 | **$134.39** | Porkbun (Cloudflare $28.20 / $28.20, 5-yr $141.00) | Best word fit for a team builder ("nastyplot.team"); costly renewals and an abuse rate like .app. |

Honourable mentions: **.dev** (cleanest and cheap, but reads "developer"), **.page** (flat $10.20 a year, clean, but a bland word), **.me** (fine but costs more and says nothing).
Avoid: **.us** (no privacy allowed: Sim's real name and address would be public), **.io** (country code may be retired; $50+ renewals), **.co** (a typo of the stranger's .com), **.ai** ($80 a year), **.tv** ($25 a year, means video), **.game** ($340 a year), and the cheap-bait endings with bad abuse records (.xyz, .club, .fun, .win, .live, .pro, .info, .site, .online, .wiki, .world, .fyi, .one, .zone).

**The one-paragraph answer** is at the end (Part 4).

**Where I disagree with the earlier report** (`domain-research-nov20.md`):
- It called .app's reputation "clean". The registry-wide yearly phishing table says otherwise: .app scores 80.2 phishing domains per 10,000, about 1.5 times .com (53.7) (checked, Interisle CSV below). It is still far better than .xyz (118) or .info (190). It does not change .app's rank, but "clean" was wrong.
- It suggested .net as the second redirect. On the evidence, .org is a slightly better second name than .net: remembered more (32% vs 25%), trusted more (3.3 vs not measured), less abuse (29.8 vs 46.2) and cheaper. .net still wins on Pokémon fan-site tradition. Both are cheap; I would take both if budget allows.
- Its quarterly .xyz figure (37.2) and .com figure (17.2) are 3-month numbers. The yearly numbers here (118.2 and 53.7) are not comparable with those; use one table at a time.

---

## Part 1: availability, all 36 endings checked

**How checked** (all checked, Nov 20, 8:17 to 8:20 PM EST):
- (a) RDAP: the registry's own RDAP server, found from IANA's official list `https://data.iana.org/rdap/dns.json`, then `curl -s <server>/domain/nastyplot.<tld>`. For endings IANA lists no server for (.io .co .me .us .gg) I used `https://rdap.org/domain/nastyplot.<tld>` and the registry's server (rdap.identitydigital.services for .io/.me, rdap.registry.co for .co, rdap.nic.us for .us).
- (b) DNS, two resolvers: `https://cloudflare-dns.com/dns-query?name=nastyplot.<tld>&type=NS` and, for the 12 main candidates, `https://dns.google/resolve?...`. Status 3 = NXDOMAIN = the name does not exist in DNS.
- (c) Control test, so a 404 means something: every RDAP server answered 200 for a name that does exist (google.app, google.io, google.co, google.me, google.us, nic.zone, nic.live and so on). So the servers work and the 404s are real "not found" answers.
- `dig` is not installed on this machine, so DNS was checked over HTTPS instead (same data).

| Ending | RDAP server | RDAP for nastyplot.<tld> | DNS | Verdict |
|---|---|---|---|---|
| .com | rdap.verisign.com | **200, registered** | has 3 NS | **Taken** (excluded) |
| .gg | none (rdap.org) | 404 | NXDOMAIN | Free (excluded) |
| .app | pubapi.registry.google | 404 "nastyplot.app not found" | NXDOMAIN (both) | Free |
| .net | rdap.verisign.com/net | 404 | NXDOMAIN (both) | Free |
| .org | rdap.publicinterestregistry.org | 404 | NXDOMAIN (both) | Free |
| .dev | pubapi.registry.google | 404 | NXDOMAIN (both) | Free |
| .page | pubapi.registry.google | 404 | NXDOMAIN (both) | Free |
| .io | rdap.org + identitydigital | 404 / 404 | NXDOMAIN (both) | Free |
| .co | rdap.org + rdap.registry.co | 404 / 404 | NXDOMAIN (both) | Free |
| .me | rdap.org + identitydigital | 404 / 404 | NXDOMAIN (both) | Free |
| .us | rdap.org + rdap.nic.us | 404 / 404 | NXDOMAIN (both) | Free |
| .tv | rdap.nic.tv | 404 | NXDOMAIN (both) | Free |
| .games | identitydigital | 404 | NXDOMAIN (both) | Free |
| .team | identitydigital | 404 | NXDOMAIN (both) | Free |
| .game | rdap.centralnic.com | 404 | NXDOMAIN | Free |
| .tools .pro .info .plus .ai .zone .live .world .guide .tips .gold .ninja .fyi | identitydigital | 404 each | NXDOMAIN each | Free |
| .site .online .fun .tech | rdap.radix.host | 404 each | NXDOMAIN each | Free |
| .win .club .wiki .one | rdap.nic.win / .club / .wiki / .one | 404 each | NXDOMAIN each | Free |
| .xyz .lol | rdap.centralnic.com | 404 each | NXDOMAIN each | Free |

Plain meaning: every ending except .com is unregistered today.

**Premium price?** RDAP does not say. Namecheap's lookup on Nov 20 flagged none of .app .net .org .co .io .team .pro .games .site .xyz as premium (checked, earlier report). **.dev, .page, .me, .us, .tv: premium status not checked.** "nastyplot" is not a dictionary word, so premium is unlikely (my judgement). Only checkout confirms the price.

---

## Part 2: the long list

Prices: Porkbun from its live public API today (checked: `curl -s -X POST https://api.porkbun.com/api/json/v3/pricing/get`). Cloudflare from cfdomainpricing.com/prices.json, a **third-party copy dated Sep 24 to Oct 13, 2026** (Cloudflare shows real prices only inside an account; not confirmed live). Porkbun also lists a $1-off first-year coupon (one per account; not included below).
Phishing: Interisle / Cybercrime Information Center yearly table, **May 1, 2025 to Apr 30, 2026**, phishing domains per 10,000 registered names (checked: CSV `https://www.cybercrimeinfocenter.org/s/Phishing-TLDstats-May2025-Apr2026.csv`). Higher is worse. **.com = 53.7 for comparison.** "Not in table" = too small or not measured.

| Ending | Kind | Porkbun 1st / renew | Cloudflare 1st / renew | Cheapest 5-yr | Phishing /10k | Verdict |
|---|---|---|---|---|---|---|
| .app | generic (Google) | $8.75 / $14.93 | $8.20 / $14.20 | $65.00 CF | 80.2 | **Top 5 (#1)** |
| .org | generic (PIR) | $7.98 / $11.84 | $8.50 / $11.20 | $53.30 CF | 29.8 | **Top 5 (#2)** |
| .net | generic (Verisign) | $12.52 / $12.52 | $11.86 / $11.86 | $59.30 CF (rising) | 46.2 | **Top 5 (#3)** |
| .games | generic (Identity Digital) | $8.24 / $30.38 | $26.20 / $26.20 | $129.76 PB | 33.4 | **Top 5 (#4)** |
| .team | generic (Identity Digital) | $4.63 / $32.44 | $28.20 / $28.20 | $134.39 PB | 80.3 | **Top 5 (#5)** |
| .dev | generic (Google) | $8.75 / $12.87 | $8.20 / $12.20 | $57.00 CF | 18.9 | Honourable mention |
| .page | generic (Google) | $10.81 / $10.81 | $10.20 / $10.20 | $51.00 CF | 29.4 (small sample) | Honourable mention |
| .me | country (Montenegro) | $17.27 / $17.27 | $16.56 / $16.56 | $76.82 Dynadot | 45.5 | Honourable mention |
| .us | country (USA) | $4.43 / $7.00 | $6.50 / $6.50 | $32.43 PB | 45.4 | **Avoid**: no privacy |
| .io | country (Chagos) | $28.12 / $51.80 | $32 / $50 | $232 CF | 35.0 | Avoid |
| .co | country (Colombia) | $15.76 / $31.20 | $30 / $30 | $140.56 PB | 41.9 | Avoid |
| .tv | country (Tuvalu) | $26.26 / $26.26 | $25 / $25 | $125 CF | 19.3 | Avoid (cost, meaning) |
| .ai | country (Anguilla) | $82.70 / $82.70 | $80 / $80 | $400 CF | 12.2 | Avoid (cost) |
| .xyz | generic | $1.29 / $14.21 | $12.30 / $11.20 | $57.10 CF | 118.2 | Avoid |
| .info | generic | $3.60 / $22.14 | $21.20 / $21.20 | $92.16 PB | 189.7 | Avoid |
| .pro | generic | $3.09 / $22.14 | $21.20 / $21.20 | $91.65 PB | 1,200.1 | Avoid |
| .site | generic | $1.96 / $28.84 | $4.99 / $27.70 | $115.79 CF | 166.7 | Avoid |
| .online | generic | $1.96 / $28.84 | $4.99 / $27.70 | $115.79 CF | 142.8 | Avoid |
| .fun | generic | $2.57 / $31.41 | $4.99 / $30.20 | $125.79 CF | 141.6 | Avoid |
| .win | generic | $4.61 / $5.64 | $4.18 / $5.18 | $24.90 CF | **1,640.7** | Avoid (worst here) |
| .club | generic | $4.12 / $15.96 | $15.20 / $15.20 | $67.96 PB | 334.2 | Avoid |
| .live | generic | $2.57 / $31.41 | $25.20 / $25.20 | $126 CF | 739.8 | Avoid |
| .wiki | generic | $2.06 / $26.26 | $25.20 / $25.20 | $107.10 PB | 415.6 | Avoid |
| .world | generic | $2.57 / $37.59 | $32.20 / $32.20 | $152.93 PB | 400.0 | Avoid |
| .zone | generic | $8.24 / $34.50 | $30.20 / $30.20 | $146.24 PB | 191.2 | Avoid |
| .fyi | generic | $5.66 / $5.66 | $5.20 / $5.20 | $26 CF | 291.5 | Avoid |
| .one | generic | $4.63 / $20.08 | not sold | $84.95 PB | 221.6 | Avoid |
| .lol | generic | $1.54 / $26.26 | $25.20 / $20.20 | $106.00 CF | 96.0 | Avoid |
| .tech | generic | $6.99 / $50.98 | $9.99 / $49.20 | $206.79 CF | 43.7 | Avoid (renewal) |
| .plus | generic | $9.78 / $47.89 | $42.20 / $42.20 | $201.34 PB | 48.3 | Avoid (renewal) |
| .tools | generic | $9.78 / $32.44 | $28.20 / $28.20 | $139.54 PB | not in table | Avoid (renewal, meaning) |
| .guide | generic | $6.18 / $34.50 | $32.20 / $32.20 | $144.18 PB | not in table | Avoid (renewal) |
| .tips | generic | $8.24 / $28.32 | $24.20 / $24.20 | $121 CF | not in table | Avoid (renewal) |
| .ninja | generic | $5.66 / $28.32 | $24.20 / $24.20 | $118.94 PB | not in table | Avoid (renewal) |
| .gold | generic | $5.66 / $92.17 | $80.20 / $80.20 | $374.34 PB | not in table | Avoid (renewal) |
| .game | generic | $340.37 / $340.37 | $300.20 / $300.20 | $1,501 CF | not in table | Avoid (whole ending is premium-priced) |

Plain meaning: many endings look cheap ($1 to $5) only for year one, then renew at $25 to $50. The cheap-forever group with clean records is small: .org, .page, .dev, .net, .app.

---

## Part 3: details per ending (top 5 and mentions)

### 1. nastyplot.app
- **Price** (checked): Cloudflare $8.20 / $14.20 (third-party copy, Oct 13); Porkbun $8.75 / $14.93 (live API); Dynadot $8.00 sale / $14.50 (checked: [dynadot.com/domain/app](https://www.dynadot.com/domain/app)); Namecheap $7.48 / $22.98 (earlier report). Namecheap's renewal is the trap here.
- **Price history**: Google Registry raised all its endings by $2 once, .app from $12 to $14 wholesale (checked second-hand via search; the year looks like 2024, not confirmed). No 2025 or 2026 rise found (checked: search). Google's pricing policy gives no notice period (checked: [registry.google .app pricing policy](https://registry.google/policies/pricing/app)). It is an ICANN generic ending, so registries must give registrars advance notice of rises (my understanding, not re-checked today).
- **Abuse** (checked): 80.2 per 10,000, 9,785 phishing names out of 1.22 million; worse than .com (53.7). Reason unknown. Abuse of hosting subdomains like vercel.app rose in 2025 (checked second-hand: search summary of Interisle), but I could not confirm whether that is in this count. My judgement: it will not hurt a normal site's email or filtering; Google and Microsoft score domains one by one.
- **HTTPS forced** (checked): Chromium's preload list has `"name": "app" ... "force-https", "include_subdomains": true`. Every browser refuses plain HTTP. Free hosts give certificates, so no cost.
- **Rules** (checked: Dynadot page): open to anyone; privacy allowed; renewal grace 30 days, then 30-day restore period (restore fee $128.36 at Dynadot), then 5 days pending delete.
- **Fit** (my judgement): "nasty plot dot app" passes the radio test. It reads as "the app", which suits a team builder and calc. A Pokémon tool already uses it: pokebase.app resolves today (checked: DNS). Parents know "app" from phones.
- **Risk**: People who forget the ending will try .com, the stranger's name (true of every ending here).

### 2. nastyplot.org
- **Price** (checked): Cloudflare $8.50 / $11.20; Porkbun $7.98 / $11.84; Dynadot $7.99 / $11.64 (checked: [dynadot.com/domain/prices](https://www.dynadot.com/domain/prices)).
- **Abuse** (checked): 29.8 per 10,000, about half of .com.
- **Trust and memory** (checked, earlier report: [GrowthBadger](https://growthbadger.com/top-level-domains/)): trust 3.3 of 5 (.com 3.5); recalled 32% of the time (.com 44%, .net 25%). One survey, 2019-2022.
- **Rules**: open to anyone, no need to be a nonprofit; privacy allowed (my understanding, widely known; not re-checked today). Price-cap history: ICANN removed .org's price caps in 2019 and a sale of the registry was blocked in 2020 (my knowledge, not re-checked today). No big rise since that I know of (not checked).
- **Fit** (my judgement): reads "community / not selling you anything", which fits a free fan tool and reassures parents. Weaker gaming feel.

### 3. nastyplot.net
- **Price** (checked): Cloudflare $11.86 flat; Porkbun $12.52 flat; Dynadot $12.52 flat.
- **Price rise coming** (checked: [Domain Name Wire, Aug 27, 2026](https://domainnamewire.com/2026/08/27/verisign-announces-net-price-increase/)): Verisign's wholesale .net goes from $10.91 to $12.00 on **Mar 1, 2027**. Its contract allows up to 10% a year. Expect about $12.95 at Cloudflare after that (my estimate: same markup-free price plus the $1.09 rise).
- **Abuse** (checked): 46.2, a bit better than .com.
- **Fit** (checked: DNS): serebii.net, pokemondb.net, bulbagarden.net, labmaus.net and esports wiki liquipedia.net all resolve today. Players already associate .net with Pokémon sites. Memory is the weak point (25%).

### 4. nastyplot.games
- **Price** (checked): Porkbun $8.24 then $30.38; Cloudflare $26.20 flat. Cheapest 5 years: Porkbun $129.76.
- **Abuse** (checked): 33.4, better than .com, small ending (65,530 names).
- **Fit** (my judgement): the address says what the site is about. Plural "games" for a one-game tool is slightly odd. Some school filters block the games category anyway; the ending may make that more likely (my judgement, not checked).
- **Price risk**: Identity Digital runs it and has announced a price update on 226 of its endings (checked that the notice exists: [Spaceship knowledgebase](https://www.spaceship.com/knowledgebase/price-update-on-226-identity-digital-domain-extensions/); the page itself returned 403, so the date and amount are **not checked**, nor whether .games is in it).

### 5. nastyplot.team
- **Price** (checked): Porkbun $4.63 then $32.44; Cloudflare $28.20 flat. 5 years: $134.39 at Porkbun.
- **Abuse** (checked): 80.3, same as .app, small ending (61,154 names).
- **Fit** (my judgement): "nastyplot.team" is the neatest wording for a team builder. Same Identity Digital price-update risk as .games.

### Honourable mentions
- **.dev** (Google): $8.20 / $12.20 at Cloudflare, 5-yr $57.00; best abuse score here (18.9); HTTPS forced (checked, preload list); privacy allowed, 30-day grace + 30-day restore (checked: [Dynadot .dev](https://www.dynadot.com/domain/dev)). Downside (my judgement): to players it reads as "developer" or a test copy of the site. Good as a cheap staging address.
- **.page** (Google): flat $10.20 at Cloudflare, $10.81 Porkbun, $10.92 Dynadot (checked: [Dynadot .page](https://www.dynadot.com/domain/page)); 29.4 abuse but a tiny ending (35,332 names); HTTPS forced (checked). The word adds nothing.
- **.me** (Montenegro): $16.56 Cloudflare, $17.27 Porkbun, $9.22 then $16.90 Dynadot (checked). Abuse 45.5. "nastyplot.me" reads like a personal page. Country ending, run by Identity Digital's systems (RDAP server checked); price history not checked.

### Avoid, with reasons
- **.us**: cheapest stable price ($7 a year), but **privacy is banned**: "Registrars and resellers ... may not offer anonymous or proxy registration services" (checked: [usTLD privacy policy, updated Aug 29, 2019](https://about.us/policies/us-privacy-services-policy); Dynadot says the same, checked). Sim's real name, address, email and phone would be public in WHOIS. Also needs a US connection (nexus). For a solo owner of a kids' site, that is a clear no (my judgement).
- **.io**: $50 to $53.50 renewals (checked). The UK-Mauritius Chagos treaty (signed May 2025) is not in force yet; sources disagree on whether .io would ever be retired, estimates 5 to 10 years if so (checked second-hand: [ICANN blog, 2024](https://www.icann.org/en/blogs/details/the-chagos-archipelago-and-the-io-domain-14-11-2024-en), Domain Incite). No gaming meaning.
- **.co**: $30 to $31 renewals (checked). One letter from .com, and the .com is a stranger's.
- **.ai**: $80 to $83 a year (checked). Several registrars sell it only for 2 years at a time (my knowledge, not checked today).
- **.tv**: $25 to $26 a year (checked); means video/streaming; a fair abuse score (19.3).
- **.game**: $300 to $340 a year (checked). The whole ending is priced as premium.
- **Bait endings** (.xyz .club .fun .win .live .pro .info .site .online .wiki .world .fyi .one .zone .lol): abuse 96 to 1,640 per 10,000 (checked), and most renew at $20 to $38. Bad neighbourhood for a kids' site; more likely to be blocked whole by network admins (anecdotal, earlier report).
- **.tools .plus .guide .tips .ninja .gold .tech**: year one $6 to $10, then $28 to $92 (checked). No reason to pay that.

---

## Part 4: the one-paragraph answer

If not .com or .gg, make **nastyplot.app** the main address: it reads as "the NastyPlot app", costs $8.20 then $14.20 a year at Cloudflare (about $65 over 5 years), every browser forces HTTPS on it, and a Pokémon tool (pokebase.app) already uses it; its abuse rate is 1.5 times .com's, which I do not expect to matter for a normal site (my judgement). Also register **nastyplot.org** ($8.50, then $11.20) and **nastyplot.net** ($11.86, rising to about $12.95 from March 2027) as redirects to the main site, because they are the endings people guess after .com and both are cheap and clean. Cost at Cloudflare: **$28.56 in year 1, then $37.26 a year** (about $38.35 once .net rises). At Porkbun instead: $29.25, then $39.29 a year. Leaner: .app + .org only, $16.70, then $25.40 a year. Skip .games and .team as extras: they are nice words but cost $26 to $32 a year each to keep. If Sim later buys nastyplot.gg (Porkbun only), keeping everything at Porkbun costs about $2 a year more than Cloudflare and puts all names behind one login; that trade is his call.

---

## What I could not check

- Cloudflare's live prices (needs an account). Figures are a third-party copy dated Sep 24 to Oct 13, 2026.
- Namecheap and Spaceship prices for most endings: their pages returned HTTP 403 here. Namecheap figures for .app/.net/.co come from the earlier Nov 20 report.
- Premium status of nastyplot.dev, .page, .me, .us, .tv (only checkout shows it).
- Spamhaus's current per-ending table (its stats page returned 404; its Apr-Sep 2025 update names only .top and .xyz). Netcraft and ICANN DAAR: not checked.
- Which endings US school or parental filters block by default: no published list found.
- The Identity Digital price update (date, size, which endings): page returned 403.
- .org's and .me's recent price history; .ai's minimum term; whether .app's phishing count includes hosting-subdomain abuse.
- Consumer-trust data for .app, .games, .team, .dev, .page: the only survey found covers 8 endings and none of these.

---

## Sources

- IANA RDAP bootstrap: https://data.iana.org/rdap/dns.json
- RDAP redirector: https://rdap.org/
- Registry RDAP servers used: pubapi.registry.google, rdap.verisign.com, rdap.publicinterestregistry.org, rdap.identitydigital.services, rdap.registry.co, rdap.nic.us, rdap.nic.tv, rdap.centralnic.com, rdap.radix.host, rdap.nic.win, rdap.nic.club, rdap.nic.wiki, rdap.nic.one
- DNS over HTTPS: https://cloudflare-dns.com/dns-query and https://dns.google/resolve
- Porkbun price API: `POST https://api.porkbun.com/api/json/v3/pricing/get`
- Cloudflare price copy (third party): https://cfdomainpricing.com/prices.json
- Dynadot: https://www.dynadot.com/domain/prices , https://www.dynadot.com/domain/app , https://www.dynadot.com/domain/dev , https://www.dynadot.com/domain/page , https://www.dynadot.com/domain/us
- Interisle yearly phishing CSV (May 2025 - Apr 2026): https://www.cybercrimeinfocenter.org/s/Phishing-TLDstats-May2025-Apr2026.csv (index: https://www.cybercrimeinfocenter.org/phishing-landscape-2026)
- Interisle quarterly table (May-Jul 2026): https://www.cybercrimeinfocenter.org/phishing-activity-in-tlds-may-july-2026
- Chromium HSTS preload list: https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json
- usTLD privacy policy: https://about.us/policies/us-privacy-services-policy
- .net price rise: https://domainnamewire.com/2026/08/27/verisign-announces-net-price-increase/ and https://itp.cdn.icann.org/en/files/correspondence/stewart-to-lindqvist-27-08-2026-en.pdf
- Google Registry .app pricing policy: https://registry.google/policies/pricing/app
- .io and Chagos: https://www.icann.org/en/blogs/details/the-chagos-archipelago-and-the-io-domain-14-11-2024-en , https://domainincite.com/31642-io-safe-for-now-as-trump-puts-chagos-deal-on-ice
- Identity Digital price update notice: https://www.spaceship.com/knowledgebase/price-update-on-226-identity-digital-domain-extensions/
- Spamhaus update Apr-Sep 2025: https://www.spamhaus.org/resource-hub/domain-reputation/domain-reputation-update-april-september-2025/
- Trust and memory survey (via earlier report): https://growthbadger.com/top-level-domains/
- Earlier reports: docs/rebuild/research/domain-research-nov20.md , docs/rebuild/research/domain-gg-nov20.md
