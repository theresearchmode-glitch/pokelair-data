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

## Still to check (continues after 4 PM)
- Other personal details in docs: names, Windows user paths (e.g. C:\Users\<name> in pasted reports), locations, school/age info.
- IDs that could be misused: artifact ids, trigger ids, session ids in docs (an artifact id alone doesn't grant access; check sharing).
- worker/ + public build: CSP, CORS, input handling (feedback guard reviewed today), source map in the deploy (launch review E).
- Dependencies: package-lock audit (npm audit) and action pinning.
