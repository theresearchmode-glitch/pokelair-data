# Ready-to-paste prompt for Dos (Sim's PC chat): Cloudflare + GitHub setup for nastyplot.org — written by HH, time: 6:38 PM (6:38:06)  date: Fri Nov 27, 2026
(Sim pastes everything below the line into Dos when he's ready.)

---
Hi Dos, it's Sim. HH (my main Claude chat) needs the nastyplot.org deploy keys set up so he can run a practice deploy before we
launch. Please do these with me, step by step. Rules: never show a token or key in chat or in any file; I paste secrets myself
where you tell me; you only report NAMES and done/not done.

0. GitHub → repo theresearchmode-glitch/pokelair-data → Settings → Secrets and variables → Actions.
   Tell me which of these already exist (names only): secret CLOUDFLARE_API_TOKEN; variables CLOUDFLARE_ACCOUNT_ID, DEPLOY_ENABLED,
   FAST_DATA, CF_ANALYTICS_TOKEN. Skip below whatever exists.
1. Cloudflare API token: dash.cloudflare.com → My Profile → API Tokens → Create Token → Create Custom Token.
   Name "NastyPlot deploy". Permissions: Account · Workers Scripts · Edit; Account · D1 · Edit; Zone · Workers Routes · Edit;
   Zone · DNS · Edit. Zone Resources: Include · Specific zone · nastyplot.org. Create, then I copy it (it shows once).
   GitHub → Secrets tab → New repository secret → name CLOUDFLARE_API_TOKEN → I paste → Add secret.
2. Account ID: Cloudflare → Workers & Pages → copy "Account ID" from the right side.
   GitHub → Variables tab → New repository variable → name CLOUDFLARE_ACCOUNT_ID → paste → Add variable.
3. Do NOT add DEPLOY_ENABLED or FAST_DATA yet (launch day / the night before M-D; HH tells me when).
4. Optional, only if easy: Cloudflare → Web Analytics → add nastyplot.org → copy the site token → GitHub variable CF_ANALYTICS_TOKEN.
5. When done, give me a short report for HH: which names exist now (secret + variables), and anything that looked different from
   these steps (menu names move). No values.
