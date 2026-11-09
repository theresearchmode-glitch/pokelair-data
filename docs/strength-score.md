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
