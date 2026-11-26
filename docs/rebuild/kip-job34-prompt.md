# Kip job 34: launch review of everything that goes to nastyplot.org (Nov 25). Upload docs/rebuild/kip-job34-files.txt with this.

```
You are helping on NastyPlot, a Pokémon Champions website (Sim's project; Sim is he/him). Repository: github.com/theresearchmode-glitch/pokelair-data.
Read CLAUDE.md (in the uploaded file, first) before anything else.

Hard rules:
- NO design or visual changes of any kind. If a fix would change how the site looks, stop and report it instead.
- You can't reach the repo: work only from the uploaded file. Suggested code = a unified diff against those files. Never invent code you
  haven't been shown; if you need another file, ask for it by path.
- Never change a test to make it pass. Never delete files or features. Real data only.
- No guessing: label every claim "checked (how)" or "not checked". "I'm unsure" beats a confident wrong answer.
- S2 Time zones: every time names its zone; GitHub Actions = UTC. S3 Proof per finding: input -> what happens now -> what should happen.
- S4 Smallest change. S5 Severity on every finding: BLOCKER (must fix before the quiet launch Dec 2-3), HIGH, MEDIUM, LOW.
- S8 All code as plain text, never HTML-escaped. Kids use this site: privacy findings count double.

JOB 34: an adversarial pre-launch review of the public site's server side and deploy, on branch alt/batch-nov25 at 3b35c8de
(the uploaded file: full copies of the files below + the code diff against claude/design6).
Try to break it. For each area, say what you tried and what you found, even when it's "nothing found".
1. worker/feedback.mjs + feedback-lib.mjs (POST /api/feedback and /api/count; D1; Turnstile siteverify with hostname + action;
   Workers rate-limit binding FEEDBACK_RL; origin check; 16 KB cap; contact scrubbing). Abuse: spam, oversized or slow bodies,
   header tricks, token replay, inflating the counter, SQL injection, anything that stores an IP, user agent or other personal data,
   error paths that leak details, anything that would make the Worker throw (a thrown Worker = a 500 for that request).
2. wrangler.toml: assets (not_found_handling 404-page, run_worker_first), workers_dev/preview_urls false, ratelimits, D1. Anything that
   would make the site answer 200 for unknown addresses (soft 404), serve the source map, or route /data/* through the Worker.
3. public-site.mjs: the deploy folder (what's copied, what's left out, the names check, Cloudflare's 20,000 file / 25 MiB limits),
   and that every document the page asks for exists (03-persistence.js public loader).
4. .github/workflows/deploy.yml (+ promote.yml, which triggers it): runs only with variable DEPLOY_ENABLED=true; secrets exposure;
   workflow_run trust (could a fork or another branch trigger a deploy?); checkout of 'live'; the D1 schema step; the smoke test and its
   automatic rollback; the hand rollback input; pinned versions (wrangler@4.45.0, actions by tag).
5. app/build.mjs public block: the CSP (_headers: hashes only, Turnstile's script + frame, optional Web Analytics), X-Robots-Tag lines,
   the per-Pokémon pages' head (title/canonical/og), 404.html, sitemap, _redirects. Injection: can a Pokémon name or data value
   break out of an attribute or a JSON-LD block?
6. Privacy: compare app/src/v2/pages/about.js's public rows with what the code really does (docs/rebuild/privacy-public-draft-nov25.md
   is the approved text). List any sentence that is not true of the code you were shown.

Deliver: findings ranked BLOCKER first, each with file:line, proof (S3), the smallest diff, and "checked"/"not checked". Then one line per
area with what you tried. Name the file you'd want next if something couldn't be judged from what you were shown.
```
