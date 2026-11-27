# nastyplot.app: everything Sim should know about .app (Nov 20, 2026)

Look-only research for Sim. Nothing bought, registered or signed up for. Nobody contacted. No personal data sent.
Checks ran Fri Nov 20, 2026, 8:29 to 8:32 PM EST (clock: `TZ=America/New_York date`).
Labels: **checked** (source or command + result) or **my judgement / not checked**. USD, before tax.
Builds on `domain-research-nov20.md`, `domain-gg-nov20.md`, `domain-top5-nov20.md`. Corrections are marked **Correction**.

## Summary (10 lines)

1. **Verdict on .app: yes, a sound and trustworthy main address** (my judgement, from the checks below). nastyplot.app is still free (checked: registry RDAP 404, DNS NXDOMAIN, tonight).
2. **Run by Google** (Charleston Road Registry, a Google company) since the May 2018 launch, under a normal ICANN contract. The 2023 Google Domains sale to Squarespace did not touch it: that was Google's shop, not the registry (checked: IANA and DNS still name Charleston Road Registry today).
3. **Top thing 1: HTTPS is forced.** Every browser refuses plain http:// on any .app site. You need a TLS certificate before the site loads at all. Free hosts (Cloudflare Pages, GitHub Pages, Netlify) add one by themselves.
4. **Top thing 2: prices are protected by ICANN rules.** Renewal rises need 180 days' notice, and you can renew up to 10 years at the old price first (checked: base registry agreement 2.10). Only one rise since 2018: $12 to $14 wholesale, Aug 1, 2024.
5. **Top thing 3: the abuse rate is real but not a worry for us.** 80.2 phishing domains per 10,000 (checked), 1.5x .com; 31% of them come from one cheap registrar. Filters and Google score sites one by one (my judgement).
6. **Cost:** Cloudflare $8.20 then $14.20/yr (5 years $65.00); Porkbun $8.75 then $14.93/yr (checked live: Porkbun API).
7. **Privacy:** WHOIS privacy is allowed and free; no ID check. A Porkbun .app name shows "Whois Privacy, Private by Design, LLC" publicly (checked: RDAP of pokebase.app).
8. **Premium risk:** none seen. Porkbun lists one standard price; checkout is the final word (not checked at checkout).
9. **thenastyplot.com: No.** Free (checked), but people drop "the" and land on the stranger's nastyplot.com. Not worth $11.81/yr even as a redirect (my judgement, agrees with the earlier report).
10. **If Sim picks .app:** buy it at Cloudflare or Porkbun about a month before launch, 2FA, auto-renew, lock, DNSSEC; checklist in Part 7.

---

## Part 1: who runs .app, and how steady it is

| Claim | Label |
|---|---|
| The registry is **Charleston Road Registry Inc.**, which trades as Google Registry. | checked: [IANA .app record](https://www.iana.org/domains/root/db/app) lists "Charleston Road Registry Inc." / Google Inc.; `app` NS = ns-tld1..5.charlestonroadregistry.com (DNS query, tonight) |
| ICANN registry agreement dated **14 May 2015**, type "Base, Non-Sponsored" (the normal contract, not a brand-only one). | checked: [ICANN agreement page](https://www.icann.org/en/registry-agreements/details/app) |
| Google won .app at a 2015 ICANN auction for $25 million. | checked second-hand: search summary of [Wikipedia](https://en.wikipedia.org/wiki/.app_(top-level_domain)) |
| Launch: announced May 1, 2018; paid early access to May 7; open to all from May 8, 2018. | checked: [Google blog](https://blog.google/technology/developers/introducing-app-more-secure-home-apps-web/), [Google Developers, "now open"](https://developers.googleblog.com/en/app-is-now-open-for-general-registration/) |
| Size: about **1.22 million** .app names (May 2025 - Apr 2026). | checked: Interisle CSV row `app,1219963,...` |
| **Price history:** one rise since launch. Wholesale $12 to **$14**, effective **Aug 1, 2024** (all six Google endings +$2; premium names unchanged). | checked: [cctld.ru, Jul 11, 2024](https://cctld.ru/en/media/news/industry/36557). **Correction:** the top-5 report said "the year looks like 2024, not confirmed"; it is now confirmed. No 2025 or 2026 rise found (checked: searches). |
| Today's retail: Cloudflare $14.20 renewal = $14 wholesale + $0.20 ICANN fee. | my judgement (the sums match; Cloudflare's own live price not loaded) |
| **Price protection:** ICANN's base agreement requires 30 days' notice for a rise on new names, **180 days for renewals**, uniform renewal prices for all owners, and lets registrars renew **up to 10 years at the old price** before a rise. | checked: [base agreement, section 2.10](https://newgtlds.icann.org/sites/default/files/agreements/agreement-approved-31jul17-en.html) (text read tonight) |
| Google's own pricing page gives no notice period and says it may change its rate card "from time to time". | checked: [.app pricing policy](https://registry.google/policies/pricing/app). The ICANN contract's 180 days still applies over it (my judgement). |
| Grace periods: 45 days after expiry to renew; then 30 days' redemption after deletion. | checked: same pricing policy page |
| Unsure: the 2024 rise was reported publicly only 3 weeks ahead. Registrars may have been told earlier; I did not find the registrar notice. | not checked |
| **Outages:** no report found of .app names failing to resolve. Only a registrar's availability-check issue (Openprovider, date not shown) and a planned Google Registry maintenance on Jul 23, 2026. | checked: search; [Openprovider status](https://statuspage.openprovider.eu/incident/866890), [Namecheap notice](https://www.namecheap.com/status-updates/?p=102106). Absence of reports is not proof of none. |
| **Rules for owners:** anyone may register; no identity or residency rule. The only special rule is the HTTPS warning registrars must show before purchase (and a rule for two-letter names). | checked: [.app registration policy](https://registry.google/policies/registration/app) |
| Acceptable use: Google's [Domain Name Abuse Policy](https://www.registry.google/policies/domain-name-abuse) bans phishing, malware, spam, etc. Google may cancel names that break it. | checked (search summary of the policy page) |
| **Squarespace sale (2023):** Google sold **Google Domains, its registrar (shop)**, to Squarespace; deal closed Sep 7, 2023. The **registry** (the wholesaler that runs .app itself) is a separate company and stayed with Google. | checked: IANA, DNS and RDAP (pubapi.registry.google) all still show Charleston Road Registry / Google tonight; sale facts from [9to5Google](https://9to5google.com/2023/06/15/google-domains-squarespace/) and [Google support](https://support.google.com/domains). |
| **Could Google sell the registry later?** Yes, in principle. But any change of control counts as an assignment under ICANN's contract: it needs ICANN's written approval and 30 days' notice, and the same contract, with its price-notice rules, goes with it. | checked: base agreement section 7.5 text |
| If a registry ever failed, ICANN's emergency back-end operator (EBERO) keeps names resolving. | my understanding, not checked tonight |

Plain meaning: .app is run by a large, stable owner under the standard ICANN contract. Price rises are slow and announced. The Squarespace story was about a different business.

## Part 2: how .app works technically

| Point | Label |
|---|---|
| Chromium's built-in HSTS preload list has `{ "name": "app", "policy": "public-suffix", "mode": "force-https", "include_subdomains": true }`. Same for .dev and .page. Firefox, Safari and Edge use this list too. | checked: `curl` of [transport_security_state_static.json](https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json), line 35. Other browsers using it: my understanding. |
| Meaning: typing `nastyplot.app` or `http://nastyplot.app` makes the browser go straight to `https://`. If there is no valid certificate, the visitor sees an error and **cannot click past it**. | my understanding of HSTS (standard behaviour), not tested on a live .app site of ours |
| So the certificate must exist **before** pointing the name at the site. Cloudflare Pages, GitHub Pages and Netlify issue free Let's Encrypt (or similar) certificates by themselves once the custom domain is added; a few minutes of a "not secure" error is normal during setup. | my judgement / known host behaviour, not checked tonight |
| Real example: `http://pokebase.app/` answers **301 to https://pokebase.app/** (the server redirects too, for old tools that ignore the list). | checked: `curl -w "%{http_code} %{redirect_url}"` = `301 https://pokebase.app/` |
| **DNSSEC:** the .app zone is signed (`app` DS record `23684 8 2 ...`, AD flag true). Owners can add their own DNSSEC; registrars support it. | checked: DNS query; pokebase.app RDAP shows `zoneSigned: true, delegationSigned: false` (signed at the host, not linked at the registry: a common half-done setup) |
| **Email works normally.** HSTS is a browser rule only. pokebase.app uses Cloudflare Email Routing (MX `route2.mx.cloudflare.net`). | checked: MX query |
| **Local testing:** unaffected. We test on localhost or the Claude artifact, not on a .app name. Only a made-up local name ending in .app would be forced to HTTPS. | my judgement |
| **Redirects:** redirect names on other endings (e.g. nastyplot.org) also need HTTPS for a clean hop; Cloudflare does this free. A redirect *to* .app always lands on HTTPS. | my judgement |
| Old browsers without the preload list would load http first; the server's 301 covers them. | my judgement |

## Part 3: trust and reputation

**Does ".app" look like an app-store link?** No measurement exists. I found no study or survey on whether visitors expect a download from a .app address (checked: search; results were promotional blog posts only). My judgement: "app" now means web apps too (cash.app is a web page as well as a phone app). NastyPlot *is* a web app (team builder, calc), so the word fits. One small risk: a parent may look for "NastyPlot" in the App Store and not find it. A line on the home page ("works in your browser, nothing to install") would answer that. **Unsure; not tested.**

**Phishing / abuse** (checked: [Interisle CSV, May 2025 - Apr 2026](https://www.cybercrimeinfocenter.org/s/Phishing-TLDstats-May2025-Apr2026.csv), re-downloaded tonight):

| Ending | Names | Phishing domains | Per 10,000 | Attacker-registered per 10,000 | Phishing *attacks* | Top registrar's share |
|---|---|---|---|---|---|---|
| .app | 1,219,963 | 9,785 | **80.2** | 51.9 | 137,606 | NiceNIC, 31% |
| .com | 161,935,002 | 869,180 | 53.7 | 35.7 | 1,116,228 | NiceNIC, 17% |
| .net | 12,205,093 | 56,360 | 46.2 | 32.1 | 104,278 | NiceNIC, 21% |
| .org | 11,817,837 | 35,176 | 29.8 | 19.5 | 56,102 | NiceNIC, 17% |
| .dev | 645,956 | 1,218 | 18.9 | 11.8 | 109,818 | Dynadot, 25% |
| .page | 35,332 | 104 | 29.4 | 17.3 | 4,738 | Dynadot, 19% |

- The 80.2 is **verified** (earlier report was right). Context: 1.5x .com, but far below .xyz (118) and .info (190) from the earlier report.
- 31% of .app phishing domains came through **one cheap registrar (NiceNIC)**. So the abuse is concentrated in one channel, not spread across normal owners (checked: CSV column; reading is my judgement).
- **Hosting subdomains:** .app has 137,606 phishing *attacks* on only 9,785 *domains*; .dev has 109,818 attacks on 1,218 domains. That pattern means many attacks sit on a few base names with many subdomains (e.g. hosting platforms such as pages.dev, which Interisle names). My judgement: the per-domain score (80.2) counts each registered name once, so it is not blown up by hosting subdomains, but the attack count is. Interisle's free-hosting article names pages.dev, windows.net, blogspot and Vercel's v0.dev, not vercel.app (checked: [Interisle Substack](https://interisle.substack.com/p/phishing-landscape-2026-how-phishers)). **Whether vercel.app / web.app are inside the .app counts: not confirmed.**
- My judgement: this will not hurt a normal site. Google Safe Browsing, Microsoft and mail filters score each domain on its own behaviour. A clean site with real content, HTTPS and proper email records builds its own reputation.

**School and parental filters:** I found no filter that blocks or flags .app as a whole (checked: search). GoGuardian lets schools **block all uncategorized sites** and, since Sep 2026, write TLD-wide rules (checked: [GoGuardian](https://www.goguardian.com/product-update/goguardian-admin-launches-url-matching-for-more-precise-rule-enforcement)). Meaning: any brand-new site, on any ending, may be blocked at some schools until filters categorise it. This affects .com equally. The word "nasty" is the bigger filter risk (earlier report). Submitting the site to the main filter vendors for categorisation after launch would help (my judgement).

**Email providers:** no evidence that Gmail or Outlook treat .app differently (not found). Set SPF, DKIM, DMARC if we ever send email (my judgement).

**Google Search:** Google says its systems "treat new gTLDs like other gTLDs" and keywords in the ending give "neither an advantage nor a disadvantage" (checked: [Google Search Central, Jul 2015](https://developers.google.com/search/blog/2015/07/googles-handling-of-new-top-level)). It does not name .app, but .app is one of those new gTLDs. No newer contrary statement found.

## Part 4: who uses .app

| Name | What it is | Label |
|---|---|---|
| **pokebase.app** | "PokéBase - Pokémon Database, Tools & Resources": companion for Pokémon GO, **Champions** and TCG Pocket; tier lists, damage calcs, team builders. A direct neighbour of NastyPlot. Registered Apr 28, 2025 at Porkbun, privacy on. | checked: page title and description (HTTP 200), RDAP |
| cash.app | Cash App (Block); loads, title "Cash App". | checked: HTTP 200 + title |
| duolingo.app, bumble.app | resolve in DNS (owner/use not checked). | checked: DNS only |
| **pokemon.app** | registered **Mar 29, 2018** (the launch sunrise) through CSC Corporate Domains, a brand-protection registrar; does not load a site. Probably held defensively by The Pokémon Company, **owner not confirmed**. Meaning: Pokémon's owners protect their name on .app; "nastyplot" is a move name, not their trademark, so no clash expected (my judgement). | checked: RDAP + curl (no answer) |
| showdown.app | resolves; owner unknown, not Pokémon Showdown (not checked). | checked: DNS only |
| pikalytics.app, tinder.app | not in DNS. | checked: NXDOMAIN |

## Part 5: privacy

- Free WHOIS privacy is allowed on .app; Google's registration policy has no identity or address rule (checked: policy page above).
- **What the public sees** (checked: RDAP lookups of pokebase.app tonight):
  - Google's registry RDAP shows **no owner at all**: only the registrar (Porkbun LLC), its abuse email/phone, dates and status.
  - Porkbun's own RDAP shows owner = **"Whois Privacy", "Private by Design, LLC", 500 Westover Dr Pmb 9816, Sanford, NC**, and a web contact form instead of an email.
- So with privacy on, Sim's name, address and email are not public. A privacy service will still hand data over on a valid legal request (my judgement; same for all gTLDs).
- COPPA note: buying a domain collects nothing from visitors; it is unrelated (my judgement).
- Contrast: .us forbids privacy (earlier report).

## Part 6: cost and where to buy

| Registrar | 1st year | Renewal | 5-yr total | Label |
|---|---|---|---|---|
| **Cloudflare** | $8.20 | $14.20 | **$65.00** | checked second-hand: [Porkbun's calculator](https://porkbun.com/about/domain-cost-calculator/app), competitor prices checked 2026-11-01; Cloudflare says it charges registry cost with no markup ([Cloudflare .app page](https://www.cloudflare.com/application-services/products/registrar/buy-app-domains)). Live Cloudflare price: not checked (needs login). |
| **Porkbun** | $8.75 (or $7.75 with its $1 first-year coupon) | $14.93 | $68.47 | checked: live API `pricing/get`, HTTP 200, `app: registration 8.75, renewal 14.93, transfer 14.93` |
| Dynadot | - | ~$14.50 | - | checked second-hand: search summary of [costgoat](https://costgoat.com/compare/domains/app) |
| Namecheap | - | ~$23.18 | - | same; avoid on renewals |

- **Multi-year:** registries allow 1 to 10 years (checked: base agreement). Prepaying locks today's price against future rises. No real discount beyond that (my judgement). Suggest 2 to 5 years.
- **Premium risk:** Google flags premium names with a higher price and must show it before purchase (checked: pricing policy). "nastyplot" is not a dictionary word; Namecheap flagged it as not premium on Nov 20 (earlier report). Final answer only at checkout.
- Cloudflare Registrar requires the site's DNS to be on Cloudflare; fine for us (my understanding, not checked tonight).
- Availability tonight: `curl -s https://pubapi.registry.google/rdap/domain/nastyplot.app` = **HTTP 404 "nastyplot.app not found"**; control google.app = 200; DNS Status 3 (NXDOMAIN). Also thenastyplot.app = 404 (free).

## Part 7: risks and the checklist

| Risk | Likelihood | What to do |
|---|---|---|
| Someone registers nastyplot.app before launch | Low but real; the name has been looked up a lot this week | Buy now or soon. Waiting until a month before launch saves nothing but risks the name (my judgement; see note). |
| Certificate missing or expired: site shows an unbypassable error | Low with a free host that auto-renews | Use Cloudflare Pages/GitHub Pages; check the padlock before announcing; watch expiry emails. |
| Forgetting to renew | Low with auto-renew | Auto-renew + a card that won't expire + prepay several years. 45-day grace exists. |
| Account takeover / domain hijack | Low | 2FA (hardware key or app, not SMS), registrar lock on, unique password. |
| Price rise | Low, slow | 180 days' notice by contract; prepay up to 10 years if one is announced. |
| Google sells or drops the registry | Very low | ICANN approval needed; contract carries over. Nothing to do. |
| Filters / parents unsure about ".app" | Unknown (no data) | Clear home page saying "free website, works in your browser"; submit to filter vendors after launch. |
| People type nastyplot.com by habit | Real for every non-.com choice | Can't fix (a stranger owns it). Use the full address everywhere, links and QR codes. |

**Note vs the brief:** the brief says "buy ~a month before launch". I disagree mildly: an unused name costs $8 to $9 now and the main risk is losing it. Buying now (or by December) costs at most one extra year's fee. Sim's call.

**Checklist if Sim picks .app**
1. Buy nastyplot.app at Cloudflare ($8.20) or Porkbun ($8.75). Consider 2-5 years.
2. Turn on 2FA on the registrar account (hardware key or authenticator app).
3. Turn on auto-renew; check the card on file.
4. Confirm the registrar lock (transfer lock) is on.
5. Confirm WHOIS privacy is on (both registrars do it free).
6. Turn on DNSSEC (one click at Cloudflare).
7. Add the custom domain on the host; wait for the certificate; check `https://nastyplot.app` shows the padlock before telling anyone.
8. Point any extra names (e.g. nastyplot.org) at it with a 301 redirect over HTTPS.
9. If email is ever sent from it: SPF, DKIM, DMARC.
10. After launch: submit the site to Google Search Console and to the main school filter vendors.

## Part 8: "should i do thenastyplot.com?"

- Availability: **free** (checked: `https://rdap.verisign.com/com/v1/domain/thenastyplot.com` = HTTP 404; control google.com = 200; DNS NXDOMAIN). Price $11.81/yr at Porkbun (checked: live API).
- **For:** it is a .com, the ending people trust and remember most; cheap; renews flat.
- **Against:**
  - People shorten names. "The NastyPlot" becomes "nastyplot.com", which a **stranger owns**. Every slip sends our visitors (kids included) to a site we don't control.
  - "The" is easy to forget when saying it aloud, writing it, or searching for it.
  - The brand is "NastyPlot", not "The NastyPlot". The address would not match the logo.
  - As a mere redirect, almost nobody would ever type it, so it buys little protection.
- **Answer: No** (my judgement). Not as the main address, and not worth buying as a redirect either. This agrees with the earlier report. If Sim wants a .com in the family later, the only one worth having is nastyplot.com itself.

## What I could not check

- Cloudflare's live .app price (needs a login); Porkbun's calculator copy is from Nov 1.
- Checkout-level premium status of nastyplot.app.
- Whether registrars got 180 days' notice of the Aug 2024 rise.
- Whether vercel.app / web.app style hosting abuse is inside .app's 80.2 score.
- Any survey on how people or parents read ".app"; any school filter's default for .app.
- A full outage history (only searches; Google Registry has no public status history I found).
- Owner of pokemon.app (registrar is CSC; owner redacted).

## Sources

- IANA .app: https://www.iana.org/domains/root/db/app ; IANA RDAP list: https://data.iana.org/rdap/dns.json
- ICANN .app agreement: https://www.icann.org/en/registry-agreements/details/app
- ICANN base agreement (sections 2.10, 7.5): https://newgtlds.icann.org/sites/default/files/agreements/agreement-approved-31jul17-en.html
- Google Registry .app pricing policy: https://registry.google/policies/pricing/app
- Google Registry .app registration policy: https://registry.google/policies/registration/app
- Google Registry abuse policy: https://www.registry.google/policies/domain-name-abuse
- Launch: https://blog.google/technology/developers/introducing-app-more-secure-home-apps-web/ , https://developers.googleblog.com/en/app-is-now-open-for-general-registration/
- 2024 price rise: https://cctld.ru/en/media/news/industry/36557
- Squarespace sale: https://9to5google.com/2023/06/15/google-domains-squarespace/ , https://support.google.com/domains
- Chromium HSTS preload list: https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json
- Interisle CSV: https://www.cybercrimeinfocenter.org/s/Phishing-TLDstats-May2025-Apr2026.csv ; hosting article: https://interisle.substack.com/p/phishing-landscape-2026-how-phishers
- Google Search on new gTLDs: https://developers.google.com/search/blog/2015/07/googles-handling-of-new-top-level
- GoGuardian rules: https://www.goguardian.com/product-update/goguardian-admin-launches-url-matching-for-more-precise-rule-enforcement
- Prices: Porkbun API `https://api.porkbun.com/api/json/v3/pricing/get`; https://porkbun.com/about/domain-cost-calculator/app ; https://www.cloudflare.com/application-services/products/registrar/buy-app-domains ; https://costgoat.com/compare/domains/app
- Outage search hits: https://statuspage.openprovider.eu/incident/866890 , https://www.namecheap.com/status-updates/?p=102106
- RDAP used: https://pubapi.registry.google/rdap/domain/<name> , https://cart-before.porkbun.horse/rdap/domain/pokebase.app , https://rdap.verisign.com/com/v1/domain/thenastyplot.com
