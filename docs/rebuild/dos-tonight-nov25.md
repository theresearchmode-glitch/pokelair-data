# Dos: tonight's two jobs (Wed Nov 25, from 5 PM; Sim watches job 1)
Copy each box as is into the "NPD - Local" chat. Job 1 first, job 2 after it.

## Job 1: Cloudflare setup for nastyplot.org (Sim is watching)
```
DOS JOB: Cloudflare setup for nastyplot.org (Sim is watching). Use Sim's logged-in Chrome.
RULES: never type, paste or show any secret/token/key value in chat or files; copy-paste them only straight into the
GitHub/Cloudflare fields named below. Do NOT create DNS records, deploy anything, or change anything not listed. Stop and
ask Sim if a page looks different from these steps. At the end, report what you did (no secret values), with screenshots.

Cloudflare dashboard → zone nastyplot.org:
1. SSL/TLS → Edge Certificates: "Always Use HTTPS" ON; "Minimum TLS Version" 1.2; HSTS: enable, max-age 6 months,
   include subdomains OFF, preload OFF, no-sniff ON.
2. Caching → Configuration: "Browser Cache TTL" = "Respect Existing Headers".
3. Email → Email Routing: enable; create custom address hello@nastyplot.org forwarding to Sim's Gmail. (Cloudflare will add
   its own MX/TXT email records itself — allow that one prompt.) Sim clicks the verify link in his Gmail.
4. Security → WAF → Rate limiting rules: create 1 rule "feedback": URI path equals /api/feedback, method POST,
   5 requests per 10 seconds per IP, action Block for 10 seconds.
Cloudflare dashboard → account level:
5. Turnstile: add widget "NastyPlot feedback", hostname nastyplot.org, mode Managed. Copy the SITE key into your report
   (it is public). The SECRET key: paste it ONLY into GitHub step 8 as TURNSTILE_SECRET.
6. Workers & Pages → D1: create database "nastyplot-feedback". Report its database ID (not secret).
7. My Profile → API Tokens → Create custom token "nastyplot-deploy": Account · Workers Scripts · Edit; Account · D1 · Edit;
   Zone · Workers Routes · Edit (zone nastyplot.org only); Zone · DNS · Edit (zone nastyplot.org only). TTL: none.
   Paste it ONLY into GitHub step 8 as CLOUDFLARE_API_TOKEN.
GitHub (github.com/theresearchmode-glitch/pokelair-data → Settings → Secrets and variables → Actions):
8. Secrets: CLOUDFLARE_API_TOKEN, TURNSTILE_SECRET. Variables: CLOUDFLARE_ACCOUNT_ID (from the Cloudflare dashboard URL/
   overview; not secret).
9. Settings → Branches → add a rule for "main": block force pushes and deletions. (Nothing else yet.)
Report: each step done / skipped (why), the Turnstile SITE key, the D1 database ID, and screenshots without secret values.
```

## Job 2: full baseline on the redesign as it is tonight
```
DOS JOB: full baseline on the redesign as it is tonight (same as this morning's run).
git fetch origin && git checkout --detach origin/claude/design6 (report the sha); frozen data
0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/; art junctions as before; every "(frozen data)" / "new site" job in
.github/workflows/test.yml; every step even after a failure. Today's two Windows test bugs are fixed (v2-saved,
md-day-one-test), so both should pass now: say if not. Write docs/rebuild/test-runs/dos-design6-nov25-night.md in the
same format, compare each failure to this morning's, git checkout -- out/, push to alt/dos-design6-night.
```

After job 1: tell HH it's done; HH checks each setting read-only through the Cloudflare connection.
