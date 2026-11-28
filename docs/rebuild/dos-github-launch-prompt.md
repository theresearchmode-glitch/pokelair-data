# Dos prompt: switch the nastyplot.org deploy on (Sim, Sat Nov 28: launch tonight 7 PM Eastern)
Paste the box into Dos. Written by HH.

```
Dos, this is the NastyPlot launch switch. Sim is with you. Work in the browser on GitHub, repository
theresearchmode-glitch/pokelair-data. Never paste, print or screenshot a secret's value. Change only what this job says.

1. Open Settings -> Secrets and variables -> Actions.
2. Secrets tab: confirm these exist (names only): CLOUDFLARE_API_TOKEN, NP_PID_KEY (or THE_NP_PID_KEY). Report yes/no for each.
3. Variables tab: confirm these exist and report their VALUES (variables are not secret): CLOUDFLARE_ACCOUNT_ID (just say
   "present", don't type it out), CF_ANALYTICS_TOKEN (say "present"), DEPLOY_ENABLED (say its current value), FAST_DATA (value or
   "missing").
4. Set DEPLOY_ENABLED to exactly: true   (all lower case, no spaces, no quotes). If it's missing, "New repository variable" ->
   Name DEPLOY_ENABLED, Value true. If it exists, click its pencil icon and change the value to true. Save.
5. Do NOT change FAST_DATA (that's for Dec 1) or anything else.
6. Report back: steps 2-4 results, and the exact time you saved DEPLOY_ENABLED = true (look at your clock, say the time zone).
```

## What happens after (for Sim)
- From the moment DEPLOY_ENABLED is true, the next "Promote to live" on GitHub publishes the live branch to nastyplot.org and
  runs a smoke test on the real address. If the smoke test fails, it rolls back by itself.
- **Timing:** today's data update (started by HH at 7:30 AM) will finish, pass its tests and Promote in about 1-2 hours. If
  DEPLOY_ENABLED is already true by then, the site goes live THEN (with today's code, before the herd and the new tools). If you
  want it exactly at 7 PM, flip it at 7 PM, or flip it now and accept an earlier quiet start: either is safe; the herd and the
  tools then arrive with the evening merge (each tested update deploys by itself).
- Tell HH the moment it's saved; HH watches the deploy, checks pages on nastyplot.org and then walks you through Google Search
  Console (sim-launch-steps.md step 5, Dos can do the Cloudflare DNS part).
