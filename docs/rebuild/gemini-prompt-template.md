# Gemini prompt template (Sim, Nov 24): code reviews and non-design tasks only
Gemini has NO GitHub or network access (Gemini, Nov 24). So every job comes as a text file Sim uploads: the diff or files to work on +
the code they depend on. Gemini answers with findings or a unified diff; HH applies, tests and checks it here.
Paste the block below into Gemini, with the JOB section filled in by HH. HH reviews everything Gemini delivers before it merges.

```
You are helping on NastyPlot, a Pokémon Champions website (Sim's project; Sim is he/him). Repository: github.com/theresearchmode-glitch/pokelair-data.
Read CLAUDE.md (the project rules, one page) before anything else.

Hard rules:
- NO design or visual changes of any kind (no CSS, layout, colours, fonts, wording on the page) unless the job below says so
  exactly. If a fix would change how the site looks, stop and report it instead.
- You can't reach the repo: work only from the files Sim uploads. If you suggest code, give it as a unified diff against those files.
  Never invent code you haven't been shown; if you need another file, ask for it by path.
- Never change a test to make it pass. Never delete files or features. Real data only.
- No guessing: read the code or run it before you claim anything. Label every claim "checked (how)" or "not checked".
- Every check you run: give the command, the exact result line, and what it means in plain words.
- Times only from the clock (`TZ=America/New_York date`), never typed from memory.
- Commit messages: plain English, what and why. Do not mention AI models in commits.
- Tests need Node 22 and Playwright (Chromium). Frozen test data: `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/`.
  Build: `node app/build.mjs --v2 --preview-data` (must print "guard: clean"). Main checks: `node app/test/run.mjs`,
  `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` (also main2, groups), and the steps in .github/workflows/test.yml.

JOB:
<filled in by HH: base branch + commit, the goal, files involved, what "done" means, which checks to run>

Deliver: the branch name (or the patch files), and a short report: what you changed and why (file:line), every check line before and
after, anything you were unsure about or didn't finish.
```

## Stricter rules, added to every Gemini job from job 2 on (Nov 24, after job 1's review: 6 of 8 findings real, 2 fixes redone)
- S1 Order: quote the rule that sets any priority/sort order before changing it; if none, ask HH ("Order question for HH").
- S2 Time zones: every time names its zone; Actions/cron = UTC; visitors = their own zone; test UTC-midnight edges.
- S3 Proof per fix: input -> old result -> new result, or no diff.
- S4 Smallest change: only the lines the finding needs.
- S5 Severity on every finding (job-specific scale).
- S6 "I'm unsure" beats a confident wrong answer.
Job 2 package (md-watch review): built from origin/main 6db70843 + CLAUDE.md, saved in HH's scratchpad as gemini-job2-md-watcher.txt.
