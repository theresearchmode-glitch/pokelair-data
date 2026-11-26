# Kip job 36: full-site security scan + code review (Nov 25; Sim: "another engine having eyes on our system"). Send AFTER job 35.
Three parts, one Gemini chat each (each fits in one go): paste the box, then upload that part's file.
- 36A server + data pipeline (kip-job36-A-server.txt, 0.5 MB): build, Worker, wrangler, every GitHub workflow, every data job, sources/.
- 36B page logic (kip-job36-B-app.txt, 1.6 MB): app/src/app/*.js.
- 36C new site (kip-job36-C-v2.txt, 1.3 MB): app/src/v2/*.js + head.html.
All from branch alt/kip34-fixes at c1b35754 (what goes live: the redesign + public build + Worker + deploy).

```
You are helping on NastyPlot, a Pokémon Champions website (Sim's project; Sim is he/him), going public at nastyplot.org on Dec 2-3.
Read CLAUDE.md (first in the uploaded file). Code review and security only: NO design or wording changes.
Hard rules: work only from the uploaded file; never invent code (ask for a file by path). Label every claim "checked (how)" or
"not checked"; "I'm unsure" beats a confident wrong answer. Proof per finding: input -> what happens now -> what should happen.
Smallest fix as a unified diff. All code as plain text (never HTML-escaped). Severity: CRITICAL (exploitable or data-losing now),
HIGH, MEDIUM, LOW. Kids use this site: privacy findings count double. Earlier reviews already fixed (don't repeat unless still
broken): feedback origin/size/Turnstile hostname+action/rate limits, @handle scrubbing, Worker 503s, deploy token scope, CSP hashes.

JOB 36 (this file is part A, B or C; say which): a full security scan AND code review.
Security: XSS and HTML injection (every innerHTML / insertAdjacentHTML / template string built from data, URL hash, team codes,
pasted teams, localStorage, fetched JSON); prototype pollution (JSON merges, object keys from data); open redirects and URL handling;
regex denial of service on user input; anything that sends data off the device; secrets or personal data in code; supply chain
(workflow actions, npm scripts, downloaded data trusted without checks); GitHub workflow injection (${{ }} of untrusted text in
run:, workflow_run trust, permissions); data jobs that fetch outside sites (timeouts, size caps, bad JSON, path traversal in file names).
Code review: real bugs (wrong results, crashes, NaN, race conditions, memory leaks, listeners added on every redraw), dead code that
could mislead, and anything that breaks on Safari/iPhone. Skip style opinions.
Deliver: findings ranked CRITICAL first with file:line, proof, diff, checked/not checked; then one line per area: what you tried and
what you found (even "nothing"); then files you'd want next.
```
