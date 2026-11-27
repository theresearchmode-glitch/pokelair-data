# Kip job 35: Strength Score deep audit + improvement plan (Nov 25). The biggest job yet.
Upload docs/rebuild/kip-job35-files.txt (268 KB: all the score code + shapes of the data). Optional: kip-job35-matches.json (4.5 MB,
every real game the model learns from) if Gemini accepts it; say in the answer whether you had it.

```
You are helping on NastyPlot, a Pokémon Champions website (Sim's project; Sim is he/him). Repository: github.com/theresearchmode-glitch/pokelair-data.
Read CLAUDE.md (first in the uploaded file) before anything else. Code and research only: NO design or wording changes on the site.

Hard rules: work only from the uploaded files; never invent code you weren't shown (ask for a file by path). Label every claim
"checked (how)" or "not checked"; "I'm unsure" beats a confident wrong answer. Rule 21 applies to everything you propose: a change
counts only if an independent check passes (real later results), never the score that drove it; a test only counts if it could have
failed; too few teams = "unknown". Times name their zone (data jobs run in UTC). All code as plain text (never HTML-escaped).
Severity/priority on every finding: CRITICAL (the score is wrong or misleading today), HIGH, MEDIUM, LOW.

JOB 35: the Strength Score (out of 100; bands 90+ Top tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic)
is NastyPlot's main product and, after launch, all our focus. Do a full independent audit and give us the plan to make it the best
team score anywhere. Parts:
1. HOW IT WORKS, end to end, from the files: model.mjs fits weights from real games (out/matches.json: teams, decks, matches m),
   six.mjs / ctr.mjs / leads.mjs / pilot.mjs add their parts, out/model.json carries them, and the page (35-win-model.js,
   58-strength.js, 59-matchup-data.js, 36-lanes.js, 60-concept-h.js) turns a team into the 0-100 score + Team checks + Matchups.
   Write it as one plain explanation with the formula at each step (file:line). Note every place where the page and the data job
   could disagree.
2. CORRECTNESS + STATISTICS: leakage between training and the walk-forward/accuracy gate (experiments/walk-forward.mjs,
   accuracy-gate.mjs, accuracy-baseline.json); player skill vs team strength (is a strong player's win credited to the team?);
   shrinkage and small samples (rare Pokémon, rare pairs, new Megas); time decay (half-life); calibration (calib 0.925); the
   mapping from win chance to 0-100 and the bands (is "80 = Tournament ready" earned?); what happens on Reg M-D day one with few
   games; anything that can produce NaN, a score outside 0-100, or a jump when one game arrives.
3. THE SHADOW MODEL (MODEL_SHADOW=1, model.mjs line 252 on, shadow-scoreboard.mjs): is the paired daily comparison a fair test?
   What sample size / how many days before we can say "better" with 95% confidence? Write that rule as code.
4. IMPROVEMENT PLAN: the 10 best ideas, ranked by expected gain per effort, each with: what it changes, why it should help (cite
   the code + a source if outside knowledge), how we'd prove it on held-out later games (a test that could fail), the risk.
   Include at least: best-of-3 data (later and separate), opponent-strength adjustment, item/set effects, team-preview/lead effects,
   uncertainty shown to users ("unknown" when too few games).
5. CODE for the top 2 ideas as standalone experiment scripts (new files, e.g. experiments/kip35-*.mjs) that read out/ and print a
   held-out comparison against today's model, with no change to any existing file.

Deliver: Parts 1-5 in order; findings ranked CRITICAL first with file:line and proof (input -> what happens -> what should happen);
the two scripts as full files; a list of files you'd want next.
```
