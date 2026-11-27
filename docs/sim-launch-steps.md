# Sim's steps for the quiet launch (nastyplot.org) — written by HH, time: 12:57 PM (12:57:01)  date: Fri Nov 27, 2026
Each step: where to click, what to type. HH can't see your GitHub settings from here (checked: the settings page is blocked for
this session), so step 0 is to look what's already there. Never paste a token or key into chat.

## 0. Look first (2 min)
GitHub → the repo pokelair-data → Settings → Secrets and variables → Actions.
- Secrets tab: is CLOUDFLARE_API_TOKEN listed?
- Variables tab: are CLOUDFLARE_ACCOUNT_ID, DEPLOY_ENABLED, FAST_DATA listed?
Tell HH which ones exist (just the names). Skip the steps below that are already done.

## 1. Cloudflare permission (the token) — Dec 1
1. dash.cloudflare.com → top right, your profile → API Tokens → Create Token → "Create Custom Token".
2. Name: NastyPlot deploy.
3. Permissions (four rows): Account · Workers Scripts · Edit | Account · D1 · Edit | Zone · Workers Routes · Edit | Zone · DNS · Edit.
4. Zone Resources: Include · Specific zone · nastyplot.org. Then Continue → Create Token, and copy it (shown once).
5. GitHub (step 0 page) → Secrets tab → New repository secret → Name CLOUDFLARE_API_TOKEN → paste → Add secret.

## 2. Account ID — Dec 1
1. Cloudflare dashboard → Workers & Pages → the right side shows "Account ID" → copy.
2. GitHub → Variables tab → New repository variable → Name CLOUDFLARE_ACCOUNT_ID → paste → Add variable.

## 3. Data every 4 hours — the night of Dec 1
GitHub → Variables tab → New repository variable → Name FAST_DATA → Value 1 → Add variable. (Off again after about 2 weeks: HH reminds you.)

## 4. Switch the deploy on — launch day (after HH says the practice deploy passed)
GitHub → Variables tab → New repository variable → Name DEPLOY_ENABLED → Value true → Add variable.
From then on, every tested update goes to nastyplot.org by itself; a failed check after a deploy rolls back by itself.

## 5. Google — launch day, after the site answers on nastyplot.org
1. search.google.com/search-console → Add property → "Domain" → nastyplot.org → Continue.
2. Google shows a TXT record. Cloudflare → nastyplot.org → DNS → Records → Add record → Type TXT, Name @, Content: paste → Save.
3. Back in Google → Verify (DNS can take a few minutes).
4. Search Console → Sitemaps → enter sitemap.xml → Submit (the site lists it at https://nastyplot.org/sitemap.xml; checked in app/build.mjs).

## Not checked by HH
- Cloudflare's menu names can move; if a button isn't where this says, send HH a screenshot.
- Whether the token permissions above are the minimum: they match the deploy workflow's own note (deploy.yml header).
