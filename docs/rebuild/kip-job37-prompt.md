# Kip job 37: Strength Score bands that mean something (Nov 25; Sim: fix the bands BEFORE launch)
Same Gemini chat as job 35 if possible (it has the files). Otherwise upload kip-job35-files.txt + kip-job35-matches.json again.

```
JOB 37 (follow-up to your job 35; same rules: CLAUDE.md, checked/not checked, rule 21, plain-text code, no design or wording).
Your job 35 found the bands are top-heavy: 75.5% of real tournament team-games score 80+ ("Tournament ready"), 20.1% score 90+
("Top tier"), so the words don't separate teams. Sim wants this fixed before the public launch (Dec 2-3): changing everyone's score
after launch would be worse. The band WORDS stay (90+ Top tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a
basic); what changes is how a team's win chance vs the field (CH.fieldWin, e) becomes the 0-100 number (today CH.ssOfE:
80 + 122 * (e - 0.5), clamped; 58-strength.js:16-26).
Assume the job-35 Idea #1 model (zero-centered ridge, no evidK; HH is landing it) when you compute e. If you can't, use today's
and say so.
1. Measure today's mapping on held-out games (your 4 strict 7-day windows): for each band, share of team-games and actual win
   rate, with 95% event-clustered CIs.
2. Propose and measure these mappings (same table for each), each a smooth, monotonic function of e (no cliffs), stable day to
   day (show the day-over-day change of a fixed team's score), and defined from data the daily job already has (dist.q etc.):
   A. Percentile: the score says how a team ranks among real tournament teams of the last 45 days: 90+ = top 5%, 80+ = top 25%,
      70+ = top 60%, 60+ = top 90%, under 60 = bottom 10%.
   B. Win-chance anchored: 90+ = wins at least 58% vs the field, 80+ = 53%, 70+ = 48%, 60+ = 43% (say if these anchors are right).
   C. Your own best proposal, if better than A and B.
   For each: is every band's win rate significantly above the band below (monotonic, CIs not overlapping or say which do)?
   What score does a brand-new-Pokémon team get? What happens on Reg M-D day 1-7 (few games)? Any NaN / out-of-range risk?
3. Recommend one, with the one-line reason, and give the code: the new CH.ssOfE (58-strength.js) and anything model.mjs must
   add to out/model.json for it (e.g. percentile points), as unified diffs against the files you were shown, plus a standalone
   experiments/kip37-bands.mjs that prints the tables above from out/matches.json.
Deliver: the tables, the recommendation, the diffs, the script, and what you are unsure about.
```
