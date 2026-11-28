# Kip job 78: pre-launch security + code review (Sim, Sat Nov 28: "security and code reviews ... make sure we are looking good everywhere")
Paste the box into Kip (Antigravity). Written by HH. nastyplot.org goes live quietly Sun Nov 29 evening; design cutoff Sun 12 PM Eastern.

```
Kip, job 78: a REVIEW job before Sunday's launch. Report only. No fixes on main or claude/design6. You may push ONE branch,
alt/gemini-launch-review, holding your report (docs/rebuild/test-runs/kip-job78-launch-review.md) and, only for HIGH findings, a
proposed patch as a separate commit that HH reviews. Same rules as always (kip-onboarding.md + CLAUDE.md): never main or
claude/design6, never force-push or delete, never commit out/, never change an existing test to make it pass, no design/CSS/page
wording, no guessing (every claim "checked (how)" or "not checked"), times from `TZ=America/New_York date`. Push ONCE, at the end.
`git fetch` first; review origin/main (what goes live) and say the commit you reviewed.

Severity scale: HIGH = could leak data or secrets, let someone change the site, break the launch or harm a visitor (kids use the
site). MEDIUM = real bug or weakness with a narrow path. LOW = hardening / tidy-up. For every finding: file:line, what's wrong,
a concrete input or request that shows it (S3: input -> what happens now -> what should happen), the smallest fix, and severity.

PART A: security (highest value first)
1. The Worker: worker/feedback.mjs, worker/feedback-lib.mjs, worker/schema.sql, wrangler.toml (run_worker_first, ratelimits, D1).
   Check: input validation and size limits on /api/feedback and /api/count, SQL built only with bound parameters, the rate limit,
   CORS / Origin checks, what is stored (privacy rule: no names, emails or IDs; feedback anonymous), error answers that leak
   internals, method handling (GET/POST/OPTIONS/others), anything a script could abuse to fill D1 or cost money.
   Run experiments/feedback-worker-test.mjs and experiments/count-worker-test.mjs; report the lines.
2. Deploy: .github/workflows/deploy.yml and practice-deploy.yml. Secrets only in env, never echoed; tokens with the least scope
   the steps need; nothing from a pull request or a branch other than main/live can deploy; the rollback path; third-party actions
   pinned. Also update.yml / promote.yml / test.yml: any `${{ github.event.* }}` or other untrusted text used inside `run:`?
3. The built public site: run `node public-site.mjs site`, then check site/_headers (CSP, frame-ancestors, X-Content-Type-Options,
   Referrer-Policy, Permissions-Policy), that no source map, .env, key, token, email address or internal note is in site/, and
   that robots.txt / sitemap.xml are as intended. Run experiments/public-site-test.mjs and experiments/privacy-public-test.mjs.
4. The page code (app/src/v2/**, app/src/app/**): every place text from outside goes into innerHTML (imported Showdown teams,
   team names, team-code links in the URL, localStorage, data/*.json, feedback text). Confirm it passes through V2.esc (or is
   set as textContent). Try a team name and an import with `<img src=x onerror=alert(1)>` and a team link built to carry one;
   say what the page does (run it in Playwright on app/dist/v2.html built with `node app/build.mjs --v2 --preview-data`).
5. The repository is public: search the CURRENT files for secrets, personal details (names, emails, phone numbers) and private
   notes that shouldn't be public. Use `git grep -nE` with sensible patterns; report counts and the top hits, not the secrets.
6. `npm audit --omit=dev` and `npm audit`: report the summary lines; say which findings reach the public site (most dev tools
   never ship).

PART B: code review (correctness)
7. Review the diffs that landed in the last 3 days: `git log --since="2026-11-25" --oneline origin/main` and
   `git diff <first-of-those>^ origin/main -- app/ worker/ public-site.mjs .github/` (skip out/, docs/, pictures). Look for real
   bugs: wrong conditions, unhandled empty data, timezone mistakes (S2), things that break on a phone, dead code left behind.
8. Also review branch origin/alt/home-herd against origin/claude/design6 (Home "herd" background + the six in two rows of three;
   two tests updated for Sim's decisions). Code only: is V2.sdsHerd safe on empty or partial data, is it accessible (hidden from
   screen readers, no tab stops), does anything leak or slow the page.

Deliver: the branch name, the report path, and in the report a table of findings (severity, file:line, one line each), then the
details, then every command you ran with its exact last line. If you run out of usage, push what you have with "UNFINISHED: <what
is left>" at the top of the report.
```

HH checks every finding before anything merges (merge-check.sh), and tells Sim the HIGH ones at once.
