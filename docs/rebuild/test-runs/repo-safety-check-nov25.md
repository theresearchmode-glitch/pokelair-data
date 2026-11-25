# Public-repo safety check (HH, Wed Nov 25, started 3:38 PM; Sim asked; report only so far)
Repo theresearchmode-glitch/pokelair-data is PUBLIC (checked: GitHub API private:false).

## Done (checked how)
1. Secrets: NONE found. git grep on current files and `git log --all -p` over the whole history for GitHub tokens (ghp_, github_pat_),
   OpenAI-style sk- keys, AWS AKIA keys, Slack xox* tokens, Google AIza keys, "-----BEGIN ... PRIVATE KEY": 0 matches. No .env /
   secret / credential / .pem / .key / id_rsa file ever committed (git log --all --name-only).
2. Player data: pseudonymous. out/teams.json, out/official.json, data/t2/*, data/p/*, data/rk9/* use codes like "P5964608819", not
   names; the code is keyed by the NP_PID_KEY secret (update.yml), so it can't be reversed from public data. Tournament NAMES can
   contain an organiser's handle (e.g. "biffpipp's Battle Frontier") — that's the public event title on Limitless.
3. Workflows (main + design6): no pull_request_target, no issue/comment/PR-text pasted into run: steps (script injection), secrets
   passed through env only; every workflow declares permissions.
4. Sim's personal email: removed from all current files today (278813c2, main 44ea888e); still in OLD commits (history kept by Sim's choice).

## For Sim (decisions)
- data/rk9/ (official-event team lists gathered Nov 10-17; 9 files) vs Sim's rule "no RK9 scraping" (rule 22). Pseudonymous, but it is
  RK9 data in a public repo. Keep, or remove from current files (history keeps it)? Removing = a deletion: needs Sim's OK.

## Second half (4:01-4:10 PM, checked by scripts: scratchpad safety2.sh)
5. Windows username "simra" in file paths: 62 tool scripts/docs -> replaced with C:/Users/<you> (commit after 4 PM; all scripts still
   parse). Old commits keep it.
6. First name: "Sim (Simran)" in docs/rebuild/START-HERE.md:13, :325 and the Nov 24 archive. FOR SIM: keep or cut. "Raj" appears too.
7. Test fixtures contain FAKE emails/phones (experiments/feedback-guard-test.mjs: kid.player99@gmail.com, 555-...). Fine (fake, tests).
8. Ids in docs: claude.ai artifact links, trigger and session ids (about 80 mentions). An id alone needs the owner's login, EXCEPT the
   Preview artifact, shared as "anyone with the link": its link is public in this repo, so anyone can view the Preview. FOR SIM: fine
   (it's going public anyway) or re-share it "only me" until the switch.
9. npm audit: 0 vulnerabilities in production dependencies (what the site ships). 13 in dev/test tools (critical: tar; high: playwright
   1.49.1, pokemon-showdown, node-gyp, sqlite3, nodemailer...) - CI only, never in the site. Upgrade after launch (tests pin 1.49.1).
10. Actions pinned by tag (actions/checkout@v5, setup-node@v5, github-script@v8, upload-artifact@v4), not by commit: low risk;
    pin by commit hash later.

## Last part (4:35 PM, Nov 25; the scheduled reminder; checked by grep and by reading worker/ and app/build.mjs)
11. Locations, school, age: none found (git grep for school/age/"years old"/city/address in all current files except out/ and data/;
    the 3 hits are words like "class" in plan text). Nothing to fix.
12. Worker CORS/input: worker/feedback-lib.mjs refuses other sites' Origin and cross-site Sec-Fetch-Site, caps the body at 16 KB,
    scrubs emails/phones/@handles, needs Turnstile (tests: feedback-guard-test 44 checks, feedback-worker-test). OK.
13. CSP: the public build writes one Content-Security-Policy plus nosniff and no-referrer for every path (app/build.mjs:208). OK.
14. Source map: a split build writes dist/v2.js.map (app/build.mjs:192). Low risk (the source is public in this repo anyway); the
    deploy workflow (queue item 6) leaves it out of the deployed folder, as launch review E asks.
Nothing left on this check except Sim's two calls (item 6: "Sim (Simran)" in START-HERE; item 8: Preview link sharing).
