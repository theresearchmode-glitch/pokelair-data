# Strength Score (Sim, Nov 9)

The 0-100 grade becomes a **Strength Score**: how strong the team is altogether, derived from all the factors we have studied and
measured. Not "what percentage of other teams it beats" (that may be a small line under it). It ships only if it predicts real wins
at least as well as today's grade; otherwise back to the drawing board. Plan: Plans page, "Strength Score: the big one".

## Phase 0 · Groundwork (Nov 9)

### The bar to beat (frozen in experiments/strength-baseline.json)

| Test | Today's grade |
|---|---|
| Walk-forward, 4 weeks (18,618 later games, each week trained only on earlier games) | log-loss 0.68083 · higher grade wins 55.81% · calibration gap 1.07 pts · top-4 teams B or better 266/392 |
| Never-get-worse gate (last 2 weeks, 7,795 games) | log-loss 0.68046 · top-4 B or better 128/188 |
| Exact-site scoreboard (the built page, 6,270 later games from Oct 27, no sealed games) | picks 56.68% · log-loss 0.68008 · calibration gap 0.4 pts |
| Suggestions vs real results (1,207 real teams) | Suggestion 1 +1.2 points real · under 60 +2.6 · 60+ −0.2 while promising +3.2 |

Sealed test set: from Nov 9; 1 event (94 games) so far. Untouched; the final check waits for a week or two of events.

### What today's grade counts (checked in the code, Nov 9; replaces the Nov 8 table in deep-check.md)

Grade (CH.strengthOf, 60-concept-h.js) = team strength x0 (35-win-model.js teamX: Σ Pokémon + Σ pairs + set features + team
terms) × caution for untried mixes (upside only) + matchups (0.003 per readiness point vs an average of 79) + the six's own record
(six.mjs, τ .1), then shown as a rank among real tournament teams of the last 45 days. structCredit's "−15%" cuts are NOT used by the
grade (measured Nov 9: removing them changed no prediction).

| Factor | In today's grade? | What real results say (measured) | Source |
|---|---|---|---|
| Each Pokémon's strength | Yes (model.mjs, player skill removed) | Picks the better six in real one-swap pairs only 52.4% among viable Pokémon (coin flip); separates weak from strong | real-swaps-site.mjs |
| Sets (items, moves, Abilities) | Yes, centred on the usual set | Typical build predicted winners 55.3% vs 54.5-54.8% for exact popular set (Nov 8) | CLAUDE.md, Sets on teams |
| Pairs on the same six | Yes, shrunk 4× | Add no accuracy (Nov 8); same-six pairs no difference on ladder (Nov 9) | lead-pairs.mjs |
| Mega | Yes: no Mega = −0.73 (model team term) | Real no-Mega teams win 34%; check +1.3 points skill-adjusted (0.6 to 1.6) | checks-real.mjs |
| Protect on 2 or fewer | Yes: −0.16 | Learned from real rounds (model v6) | model.mjs |
| No major weak spot (no type hits 3+ more than resist) | No (shown only) | +0.9 points (0.1 to 2.3) | checks-real.mjs |
| Weak spots spread out (at most one type hits 3+) | No (shown only) | +1.3 points (0.4 to 2.7) | checks-real.mjs |
| Ready for the top threats (calc readiness) | Yes, small weight (0.003/point) | Strongest check: +3.5 points (2.4 to 4.7) when 75%+ ready | checks-real.mjs |
| Learned matchups (which Pokémon beat which) | No in the grade | Against THIS opponent: better for one game (56.68 → 57.50% picks); averaged over the field as a grade: worse (55.85%) | site-board.mjs, best-four.mjs, four-synergy.mjs |
| The six's own record | Yes (τ .1) | No difference beyond chance (kept) | walk-forward, Nov 9 |
| Untried mixes | Yes: caution on the upside | — | 35-win-model.js |
| Items that work (Item Clause, dead items) | Yes: dead items lose their set credit | Not testable on real sheets (0 with a problem) | checks-real.mjs |
| Speed control, spread damage, lead support | No (notes since Nov 9) | No benefit: −0.6, +0.1, −1.6 points | checks-real.mjs |
| Two lead Pokémon together | No | Nothing beyond which four were brought | four-synergy.mjs |
| Synergy inside the brought four | No | Unknown: too little data (13,265 ladder games) | four-synergy.mjs |
| Player skill | Removed from team values | About twice as big as the team (skill alone picks 59.5%, team 53.7%) | skill-vs-team.mjs |
| Physical/special mix, 3+ of one type, one-win-condition teams | No | Not measured yet (from expert videos) | deep-check.md research |

### What this suggests for the design (my reading, for Phase 1 with Sim; not decided)

- The three checks that help win but aren't in the number (no major weak spot, weak spots spread out, ready for the top threats)
  are natural Strength Score parts; their sizes are measured.
- The Mega is already in, with a large weight that matches real results.
- Pokémon strength separates weak from strong but not strong from strong, so among good teams the score should not swing much on
  Pokémon swaps alone.
- Learned matchups help one game, not the grade; they belong in Battle (separate plan).

## Design checklist: battle principles the score must respect (Sim, Nov 9)

Sim: "make sure that our new grade keeps in mind the basic principles of pokemon battles and champions that we went over. megas and
all those things." Rule for every item: its weight comes from real results; anything that doesn't hold up is shown as a note but
does not move the score.

Champions rules
- [ ] Mega Evolution: only one Mega per game (a second stone never double-counts); no Mega is a big penalty (real no-Mega teams win 34%).
- [ ] Bring 4 of 6: the six is a toolbox; a niche sixth Pokémon brought only for some matchups is not punished.
- [ ] Single games first: built and tested on best-of-1 results (ranked play); best-of-3 later and separate.
- [ ] Item Clause and items that work: no duplicate items; items that can't activate on this team don't count.
- [ ] Sets as players run them: moves, item, Ability, stat points, nature; an unchanged set counts as the typical build.

Team-building principles (guides, videos, our data)
- [ ] Strong Pokémon and sets (counted today).
- [ ] No major weak spot (+0.9 measured) and weak spots spread out (+1.3): not in today's number; candidates.
- [ ] Ready for the top threats (+3.5 measured, the strongest): today a small weight; candidate for much more.
- [ ] Protect on most of the team (counted today).
- [ ] Speed control, spread damage, lead support: notes only (no win benefit measured), still shown.
- [ ] Not measured yet (test before any weight): physical/special mix, 3+ of one type, a team that collapses without one Pokémon.

Types (Sim, Nov 9: "you are taking into mention type weaknesses / offenses / coverages too right?")
- [ ] Defensive types: no major weak spot (+0.9 measured) and weak spots spread out (+1.3): candidates (see above).
- [ ] Offensive coverage of all 18 types: no link to winning on 20,000 ladder games (r = 0.003); re-test on tournament games with
      player skill taken out in Phase 2 before deciding.
- [ ] Coverage of what you actually face: "ready for the top threats" = damage calcs both ways against the 30 most common threats
      (+3.5 measured, the strongest factor): candidate for a much bigger role.

## Phase 1 · Design (APPROVED by Sim, Nov 9: "precisely")

Guiding principle (Sim): "our goal is to give the best team building advice we possibly can and then from there we understand and
players understand that how the players use the team and player skill matter alot." The score rates the team; the site says plainly
that play and skill matter a lot too.

Real examples (today's grade vs real results; typical sets; built page of Nov 9):
| Team | Real | Today's grade | Ready for top threats | Checks failed |
|---|---|---|---|---|
| Dragonite / Mega Gengar / Incineroar / Rillaboom / Scrafty / Snorlax | 65 games, 72.3% (one player: 52 games at 77%; the other two players 7-6 combined) | 45.7 (C), expects 50% | 77% | none |
| Archaludon / Farigiraf / Mega Garchomp Z / Mega Golisopod / Politoed / Sneasler | 154 games, 50.0% (20 players) | 52.4 (C), expects 50.9% | 81% | none |
| Ceruledge / Dragonite / Mega Gardevoir / Indeedee-F / Mega Lopunny / Sneasler | 55 games, 30.9% | 21.4 (D), expects 45.8% | 58% | not ready for top threats |
| Basculegion / Mega Gardevoir / Mega Golisopod / Indeedee-F / Pelipper / Sneasler | 141 games, 34.0% | 24.5 (D+), expects 46.4% | 71% | major weak spot; partly ready |
Lesson: a six's record can belong to one strong player; the score must rate the team, with player skill taken out.

Decisions for Sim:
1. What 100 means. Draft: "has everything winning teams have and no weak spots: the strongest kind of team in today's meta".
2. Where teams land. Draft: a solid, typical tournament team about 80; the best-built teams 90+; a team missing a basic (no Mega,
   a big shared weakness, not ready for the top threats) drops clearly (60s); a beginner team 30-50.
3. How much each factor moves it: in proportion to its measured effect on real wins (one shared scale), never a guess.
4. Team, not player: real records count only after player skill is taken out.
5. Under the score, one small line: how it compares to today's tournament teams.

## Phase 2 · Weights (Nov 9)

Fit 1: every factor together, plus each player's skill (experiments/strength-fit.mjs), on 10,575 real team sheets, 38,513 tournament
games, 100 resamples by tournament. The Pokémon + pairs + sets number (x0) comes from the model trained on these same games, so its
size is too big (sizing only, not proof). Mega and Protect are already inside x0, so their rows here mean "extra beyond what x0 counts".

| Factor | Win-chance points per unit | 95% range | Verdict |
|---|---|---|---|
| Pokémon + pairs + sets (per model unit) | +27.39 | 27.25 to 30.03 | helps (in-sample, sizing only) |
| Ready for the top threats (per 10 points) | +1.05 | 0.38 to 1.76 | helps beyond chance, even on top of x0 |
| Has a Mega (extra) | −3.97 | −13.43 to 8.09 | unknown |
| No major weak spot | −0.50 | −1.67 to 1.10 | unknown |
| Weak spots spread out | +0.82 | −0.40 to 2.39 | unknown |
| Offensive coverage (per type hit super effectively) | +0.39 | −0.07 to 0.80 | unknown |
| Attacking types nothing on the team resists (per type) | −0.36 | −0.79 to 0.12 | unknown |
| Protect (extra, per member) | −0.09 | −0.55 to 0.33 | unknown |
| An item problem | −0.52 | −2.50 to 1.13 | unknown |
| 2+ physical and 2+ special attackers | +1.06 | −0.56 to 2.69 | unknown |
| 3+ members sharing a type | −1.33 | −3.65 to 1.02 | unknown |

Reading: once Pokémon, sets and player skill are counted, readiness for the top threats is the only factor that still adds beyond
chance. The type checks measured alone earlier (+0.9, +1.3) overlap with what the Pokémon themselves already carry. "Unknown" is not
"no effect". 
Fit 2: the same without x0 (each factor's size on its own, player skill still fitted; 40 resamples):

| Factor | Win-chance points per unit | 95% range | Verdict |
|---|---|---|---|
| Ready for the top threats (per 10 points) | +1.56 | 0.84 to 1.99 | helps |
| Has a Mega | +19.69 | 10.75 to 27.12 | helps |
| No major weak spot | −0.19 | −1.24 to 1.54 | unknown |
| Weak spots spread out | +1.70 | 0.35 to 3.27 | helps |
| Offensive coverage (per type hit super effectively) | +0.47 | 0.17 to 0.92 | helps |
| Attacking types nothing on the team resists (per type) | −0.84 | −1.18 to −0.55 | hurts |
| Protect (per member) | +1.00 | 0.46 to 1.44 | helps |
| An item problem | +0.25 | −1.80 to 1.75 | unknown |
| 2+ physical and 2+ special attackers | +0.68 | −1.13 to 2.53 | unknown |
| 3+ members sharing a type | −3.27 | −5.73 to −1.67 | hurts |

Reading (measured): on their own, the Mega, Protect on most of the team, typing (spread-out weak spots, no undefended attacking
types, no 3+ shared type, offensive coverage) and readiness all go with winning. Once the Pokémon and sets are counted, only
readiness still adds: the rest is mostly carried by WHICH Pokémon and sets a team uses. So adding them on top would count them twice.

### Draft 0-100 scale (Nov 9, my proposal, not yet tested)

Strength z = x0 + 0.0038 × (readiness − 79) (readiness weight from Fit 1: 1.05 points per 10 ÷ 27.39; today's grade uses 0.003, inside
the measured range). Score = 80 + 122 × (chance to beat a typical tournament team − 50%), chance = σ(0.865 × (z − 0.349)), kept in 0-100.
Monotone in z, so its win-prediction is that of z (Phase 3 tests it).

Where real tournament sheets land (10,575): 2% 62.9 · 10% 70.2 · 25% 74.9 · median 80.0 · 75% 84.3 · 90% 87.8 · 98% 92.2.
No Mega (55 sheets): median 52.3 (45-61). Readiness under 70 (1,731): median 76.8. 3+ sharing a type (815): median 75.3.
Against Sim's anchors: typical 80 ✓, best 90+ ✓, no Mega lands in the 50s, lower than the "60s" draft, because the measured effect is
that big (real no-Mega teams win 34%).

Sim, Nov 9: keep the score out of 100 (not out of 10: on real sheets 80% land 70-88, so out of 10 nearly all would read 7, 8 or 9).
No Mega landing in the 50s (measured) instead of the draft "60s": Sim agreed. Letter bands to be set in Phase 3 so each letter
really wins more than the one below (today C 51.4% vs D 52.2% couldn't be told apart).

## Phase 3 · Proof (Nov 9)

Exact-site scoreboard (built page, model trained only on games before Oct 27, 6,270 later games in 88 tournaments, no sealed games):
- Today's grade: picks 56.68% · log-loss 0.68008. Strength Score number (matchups .0038): picks 56.68% · log-loss 0.68000.
- Keep/drop rule (compare.mjs): log-loss −0.00009 (95% −0.00017 to 0.00003) → NO DIFFERENCE. So the matchup weight stays .003 (the
  simpler version); the Strength Score predicts exactly as well as today's grade (bar met). The change is the scale and its meaning.
- The 0-100 scale on later games, every side and game once (site-board.mjs, ssBands):

| Score | Won | Expected | Teams | Games |
|---|---|---|---|---|
| under 60 | 22.0% (±15.3) | 38.8% | 13 | 41 |
| 60-64 | 37.9% (±4.8) | 40.0% | 102 | 414 |
| 65-69 | 40.9% (±3.1) | 42.7% | 231 | 994 |
| 70-74 | 46.0% (±2.1) | 44.8% | 420 | 2,277 |
| 75-79 | 49.8% (±1.9) | 48.4% | 440 | 2,542 |
| 80-84 | 53.0% (±1.6) | 52.5% | 425 | 3,725 |
| 85-89 | 54.4% (±2.2) | 56.4% | 193 | 1,988 |
| 90+ | 58.5% (±4.1) | 60.1% | 34 | 559 |

Every band won more than the one below, and each within its range of what it promised. Bands about 10 points apart are clearly
different; 5 points apart are not always (80-84 vs 85-89 overlap). Letters should be about 10 points wide.

### Phase 4 step A checks (Nov 9, built Preview page)

- Page tests: ALL PASSED (engine, then with the My Team ring).
- Day-to-day stability (stability.mjs, 490 teams typed without sets, the real Nov 8 → Nov 9 daily models; a big model day: the team
  basics and shrunk pairs went live in between): Strength Score typical move 3.5 points (90% under 7.5, biggest 13.7), letter changed
  for 20.8%. Today's grade on the same models and teams: typical 14.6 (90% under 34.2, biggest 56.6), letter changed for 60.4%.
  The rank-based grade swings because a small strength change moves a team past many others; the score moves only as much as its win
  chance does. About 4× steadier. (Own teams also keep the 1.5-point letter buffer.)
- Broken teams (broken-teams.mjs, 30 strong real teams, median score 88.5): removing the Mega −23.7 score points (win −19.4 vs real
  −18.2 ✓; strong teams land ~65); Protect on 2 or fewer −5.4 (−4.4 vs real −6.8 ✓); spread −1.3 (−1.1 vs −1.5 ✓); Intimidate −0.2
  (vs +0.2 ✓); speed control −5.6 (−4.6; real results +0.7, but only ~8% of tournament teams lack it and mostly on purpose, so real games
  can't measure its worth; nearly universal use by top players says it is worth something. Sim, Nov 9: keep it counted through the
  Pokémon and sets as now, notes wording unchanged); turn-1 support −2.7 (−2.2 vs +2.5). Correction: "no Mega lands in the 50s" is for typical teams;
  strong teams without a Mega land about 65.
- Never-get-worse gate (accuracy-gate.mjs, last 2 weeks, each trained only on earlier events, 7,795 games): log-loss 0.68046 =
  baseline 0.68046 (identical, as expected: same ranking); GATE PASSED. Top-cut part: 187 of 188 top-4 teams scored 70+ ("Solid" or
  better) before their event. Not comparable with the old 68% bar: 70 on the old grade meant top 30% by rank, 70 on the Strength Score
  is about the bottom quarter of real teams. By rank, top-cut fairness is unchanged by construction (same ranking).

## Step D · Suggestions (Nov 9, look only so far)

sugg-real.mjs on the Strength Score build, 400 real teams with 10+ games (whole roster):
- Repeats (Sim's concern, measured): over all Suggestion 1s, Kingambit 20%, Basculegion 18%, Farigiraf 10%, Sneasler 8%, Kommo-o 7%,
  Mega Floette 7%; the top 3 Pokémon are 48% of every Suggestion 1. 43 different Pokémon appear across the top 3 suggestions.
- Honesty: Suggestion 1 shows +4.6 score points on average (≈ +3.8 win-chance points); the closest real teams' win rate rises +1.5
  (95% 0.6 to 2.4). Real, but the shown gain is about 2.5× too big. Suggestions 1-3: shown +3.8, real +1.0 (0.3 to 1.6).
