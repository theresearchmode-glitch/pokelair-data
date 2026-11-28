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

## Prompt 2 (HH, time: 7:07 PM (7:07:49)  date: Fri Nov 27, 2026): analytics snippet + narrow the token
---
Hi Dos, it's Sim again. Two small Cloudflare follow-ups for HH. Same rules: no token or key values in chat or files; I paste them myself; report names and done/not done only.

1. Web Analytics (Observability > Analytics > Web analytics > nastyplot.org): switch from "Automatic setup" to "Enable with JS Snippet installation" (our site's security rules block the auto-injected script; our build adds the snippet itself, correctly). Copy ONLY the token value from the snippet (the text after "token": in data-cf-beacon), then GitHub → repo theresearchmode-glitch/pokelair-data → Settings → Secrets and variables → Actions → Variables → New repository variable → name CF_ANALYTICS_TOKEN → I paste → Add variable. (This token is public by design: it ends up in the page; a variable is fine.)
2. API token "nastyplot-deploy": My Profile → API Tokens → nastyplot-deploy → Edit → Account Resources: change "All accounts" to Include → just my account → Save. Don't roll or regenerate it (that would change the secret); only narrow the scope. If Cloudflare forces a new value, stop and tell me; then I update the GitHub secret CLOUDFLARE_API_TOKEN myself.
3. Report for HH: done/not done for each, and anything that looked different. No values.
