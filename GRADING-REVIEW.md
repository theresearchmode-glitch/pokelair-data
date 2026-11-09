# NastyPlot team grading: what we've struggled with, what we've measured, what's still open

Written Nov 9, 2026 for an outside reviewer. Self-contained: you shouldn't need anything else to follow it. Every number is
**measured** unless it says otherwise, and each one names the script that produced it (all in `experiments/`, data in `out/`).
"Unknown" always means "too little data to tell", never "no effect". Deeper logs: `docs/strength-score.md`,
`docs/deep-check.md`, `docs/grade-accuracy.md`.

---

## 1. What the site is and what we're trying to do

NastyPlot is a team-building helper for **Pokémon Champions VGC doubles** (regulation M-C, Sep 9 – Dec 2 2026): you bring 6
Pokémon, pick 4 each game, one Mega Evolution per game, Item Clause, open team sheets. Players type in a team (or let the site
build one) and get:

- a **Strength Score** 0–100 with a band word (90+ Top tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic);
- **Suggestions** ("Suggestion 1, 2, 3"): one- or two-Pokémon swaps, each showing how much the score would go up;
- **Matchups**: how the team does against the 30 most common threats; **Battle mode**: which four to bring against an opponent's six.

The goal (the owner's words): *"give the best team building advice we possibly can"*, while being honest that **how a player
plays the team, and their skill, matter a lot.** The score must rate the **team**, not the player.

### Rules we hold ourselves to (relevant to any proposed fix)
- A change counts only if it passes a check **independent** of the thing changed (real later results). Never judge a change
  with the same score that drove it.
- A test only counts if it could have failed. Too few games → "unknown".
- Single games first (ranked play is best of 1); best-of-3 rounds are a separate, later step.
- The score must not get worse at predicting real wins (a CI gate enforces this, `experiments/accuracy-gate.mjs`).
- Kids use the site: no personal data collected. Please don't add any.

---

## 2. The data

| File (in `out/`) | What it holds | Can't tell us |
|---|---|---|
| `matches.json` | Limitless tournaments: 431 events, ~38,500 results with **full team sheets** (Pokémon, item, Ability, 4 moves, nature); players are anonymous indices | Which 4 were brought or led; game-by-game scores (86.5% of rounds are best of 3, so one "result" = one round); stat points |
| `replays.json` | 20,000 Showdown ladder **single games** (Oct 22 – Nov 9): both sixes, the 4 brought, the leads, both ladder ratings, winner | Items/moves (a Mega shows only if used); mostly mid-level players (median rating ~1264); "brought" = seen (66% of games show all 4) |
| `replays_bo3.json` | Showdown best-of-3-format games, each one game, with open sheets | Only ~5,000 so far |
| `model.json` | The trained model the site ships (see §3) | |
| `teams.json`, `events.json`, `official.json` | Top-cut teams of events | Full round results |
| `meta_*.json` | Usage stats | Anything about results |

Known data gaps: no stat points anywhere; tiny events (half have ≤29 players) count the same as big ones; 3.5% of rounds have no
winner (counted as half a win); the ladder and tournaments are different levels of play.

---

## 3. How the score is computed today

Code: `app/src/app/60-concept-h.js` (`CH.strengthOf`, `CH.ssOfE`) and `app/src/app/35-win-model.js` (`teamX`, `ctrVal`).
Model training: `model.mjs` (repo root), output `out/model.json`.

1. **Team strength x0** = Σ each Pokémon's value + Σ pair values (pairs of Pokémon on the same six, shrunk 4×) + set features
   (items/moves/Abilities, centred on the usual set; an unchanged set counts as a typical build) + two team terms
   (no Mega −0.73; Protect on ≤2 members −0.16). Values are learned from real tournament results by a logistic model
   **with each player's skill fitted alongside**, so the values are meant to be about the team, not the player.
2. **× caution for untried mixes** (upside only).
3. **+ matchups**: 0.003 × (readiness − 79), where readiness = damage-calc coverage of the top 30 threats, both ways.
4. **+ the six's own record** (shrunk, τ 0.1).
5. Converted to win chance vs a typical tournament team: `e = σ(0.865 × (x − 0.349))`, then
   **Score = clamp(80 + 122 × (e − 0.5), 0, 100)**. So 1 score point ≈ 0.82 win-chance points.

A suggestion's "+X" is simply score(after) − score(before); applying a suggestion gives exactly that score (tested).

Where real tournament sheets land (10,575 sheets): 10% 70.2 · 25% 74.9 · median 80.0 · 75% 84.3 · 90% 87.8 · 98% 92.2.

---

## 4. How well it predicts (the good news)

| Test | Result |
|---|---|
| Walk-forward, 4 weeks, each week trained only on earlier events (18,618 later games; `walk-forward.mjs`) | higher score wins **55.8%**; log-loss 0.68083; calibration gap 1.07 pts (said 52→won 51, 57→58, 62→61, 67→66, 73→75) |
| Exact built page, 6,270 later games (`site-board.mjs`) | picks 56.7% |
| Top-4 teams before their event (`accuracy-gate.mjs`) | 187 of 188 scored 70+ |
| Removing a basic from 30 strong teams (`broken-teams.mjs`) | Mega −19.4 win pts (real −18.2), Protect −4.4 (real −6.8), spread −1.1 (real −1.5): drops match real results |

Score bands on later games (`site-board.mjs`), all in order and each within its range of what it promised:

| Score | Won | Expected | Games |
|---|---|---|---|
| 60–64 | 37.9% (±4.8) | 40.0% | 414 |
| 65–69 | 40.9% (±3.1) | 42.7% | 994 |
| 70–74 | 46.0% (±2.1) | 44.8% | 2,277 |
| 75–79 | 49.8% (±1.9) | 48.4% | 2,542 |
| 80–84 | 53.0% (±1.6) | 52.5% | 3,725 |
| 85–89 | 54.4% (±2.2) | 56.4% | 1,988 |
| 90+ | 58.5% (±4.1) | 60.1% | 559 |

**The ceiling.** Player skill is about **twice** as big as the team (`skill-vs-team.mjs`, 21,945 games): skill alone picks the
winner 59.5%, team alone 53.7%, both 60.3% (logit spread 0.90 vs 0.46). On the ladder, rating is worth 6.8 win-chance points per
100 rating points. So a team-only score will always look weak game to game; ~56% is near what's possible.

---

## 5. The struggles, in order

### 5.1 The early grade was a rank, and it mostly measured the wrong things (Nov 7)
The first grade (`grade-check.mjs`) leaned on hand-set "readiness" and a checklist; on later games readiness alone picked 51.8%,
the checklist 51.8%. Almost all its signal came from teams' own past records (circular). → Rebuilt around a model learned from
real results.

### 5.2 A no-Mega team graded 98 (Nov 8)
Real no-Mega teams win **34%**, but the grade never looked at the team as a whole, and every test only used real teams, where
nearly everyone already runs a Mega. → Team-level terms learned inside the model (no Mega, little Protect). Lesson: test on
deliberately broken teams and on teams our own tools build, not just real teams.

### 5.3 Pair bonuses drove grades without predicting anything (Nov 8)
Two teams with the same Pokémon strengths, readiness and checks scored 95 vs 69 entirely from pair bonuses. With pairs: 56.9% /
log-loss 0.6802; without: 57.2% / 0.6800. Pairs spread grades (sd 0.089) without adding accuracy. → Shrunk 4×.

### 5.4 The rank-based grade swung day to day (Nov 9)
As a rank among real teams, a small strength change moved a team past many others: typical daily move 14.6 points, letter changed
for 60% of teams. → The Strength Score (§3) maps win chance directly: typical move 3.5, band changed 21% (`stability.mjs`).
It predicts **exactly** as well as the old grade (same ordering; keep/drop test: no difference).

### 5.5 Team checks that experts call essential didn't show in results (Nov 9, `checks-real.mjs`)
All 10,575 sheets, 38,513 games, player skill fitted, win-chance points: ready for top threats **+3.5** (2.4 to 4.7), Mega +1.3,
weak spots spread out +1.3, no major weak spot +0.9 — help. Speed control −0.6 (−1.7 to +0.5), spread damage +0.1, lead support
−1.6 — no measurable benefit. Caveat: only ~8% of real teams lack speed control, mostly on purpose, so real games can't measure
its worth; nearly every top player uses it. Kept counted through the Pokémon/sets; shown as notes, not scored.

Once Pokémon and sets are in the model, **only readiness still adds beyond chance** (+1.05 per 10 points, 0.38 to 1.76). The
type checks (+0.9, +1.3 alone) are mostly carried by *which* Pokémon a team uses, so adding them on top would count them twice
(`strength-fit.mjs`).

### 5.6 Matchups learned from real games help one game, not the team score
"How my Pokémon do against THESE Pokémon", learned from results (`best-four.mjs`, `four-synergy.mjs`, `site-board.mjs`):
- predicting a specific game: picks 56.7% → **57.5%**, better beyond chance, on tournaments AND on the ladder;
- averaged over the whole meta as a team score: 55.85%, **worse**.
So they live in Battle mode, not the score. Synergy *inside* the four brought: unknown (too little data).

### 5.7 THE MAIN OPEN PROBLEM: suggestions over-promise for teams that are already decent

**How we check suggestions** (`sugg-real.mjs`): for real teams with 10+ games, compute the site's Suggestion 1, then compare the
real win rate of real teams that share 5 of 6 Pokémon with the "after" team vs those that share 5 of 6 with the "before" team
(the starting team itself left out of both sides; 30+ games each side; 95% ranges by resampling teams).

**Results (all 1,207 real teams; 408 Suggestion 1s with enough games):**

| Starting team | Promised (win-chance pts) | Real | n |
|---|---|---|---|
| under 60 | +4.8 | **+2.6** (+1.8 to +3.5) | 218 |
| 60–85 | +3.2 | **−0.2** (−1.1 to +0.7) | 169 |
| 85+ | +1.9 | −2.3 (−5.3 to +0.9) | 21 (too few) |

Independent replication on the 807 teams not in the first 400-team run: under 60 +2.4 (+1.4 to +3.5), 60+ −0.3 (−1.5 to +0.9).
On the current Strength Score build (400 teams): Suggestion 1 shows +4.6 score points (≈ +3.8 win-chance), real +1.5 (0.6 to 2.4)
→ overall about **2.5× too big**, and for 60+ teams no measurable gain at all.

(Note: these bands were found on the older rank grade's 60/85 cut points. The pattern is solid; the exact cut on the new 0–100
score hasn't been re-derived.)

**What we ruled out as the cause (each measured):**
- Only rank 1 is overrated (optimizer's curse alone): Suggestions 2 and 3 for 60–85 also deliver −0.4 and −0.7.
- Matchups or the six's own record: the promise is **all** in the Pokémon-and-pairs part (+3.2 of +3.2).
- Thin data: suggested Pokémon are well measured (Kingambit, Basculegion, Farigiraf, Mega Floette; 5,000–29,000 games each).
- Diminishing returns (strong teams gain less from an upgrade; `diminishing.mjs`): curvature −0.006 (−0.021 to +0.008), within
  chance; even the worst end explains ~20% of the gap at most.
- Player skill in the real-side measure (`sugg-skill.mjs`): skill-adjusted, under 60 +2.1, 60–85 −0.1. Not a skill artefact.
- Breaking a proven pair (`sugg-pairs.mjs`): no worse.
- One swap vs two (bigger run): −0.0 vs −0.4, no difference.
- Suggestions that raise matchups: did no better (−0.8 vs +0.5 unchanged).

**What we did find:**
- **Real one-swap pairs** (two real sixes sharing 5 Pokémon, values learned on the other half of tournaments): a simple model's
  value gap picks the better six 55.1% (50.9 to 58.8); **the site's own model picks 52.4% (48.7 to 56.4)** on 1,562 pairs —
  barely above a coin flip. Its own uncertainty doesn't help: when "sure" (|z| ≥ 1.5) it picks 51.4% (`real-swaps.mjs`,
  `real-swaps-site.mjs`).
- So for the swaps real players make, between viable Pokémon, the model's small value differences are mostly noise, and picking
  the best of hundreds of candidate swaps adds that noise up into several score points.
- **Why weak teams still gain is NOT explained.** We first thought "weak teams get weak-for-strong swaps". Tested swap by swap,
  using the swapped-out Pokémon's usage (under 3/5/8/12% usage = "upgrade"): upgrades +0.7 to +0.9, others +1.3 to +1.7 — no
  separation. So the explanation doesn't hold per swap; only the starting score separates them. **Cause still unknown.**

**Limits of the check itself:** the real side is noisy and shrunk (before/after neighbours overlap, so compare bands, not
promise vs real one-for-one); it measures teams like the "after" team, not whether *this player* wins more after changing; it's
tournament data only; sets and spreads unseen.

**Design tension (the owner's concern, important for any fix):** players need to feel suggestions make an impact, and reaching
90+ must stay possible. A suggestion's number must equal the real score change (Apply must give what it promised), so we can't
just shrink the displayed gain without squashing the whole score. Stretching the scale doesn't help either: it multiplies the
noise by the same factor. Rejected so far: labelling 60+ swaps "Different option" with no points (owner rejected it); a wider
tie window for variety (3 points cut the real gain from +1.2 to +0.8, within chance).

### 5.8 Battle mode's "bring these four" (Nov 9, `bring-test.mjs`, `plan-test.mjs`)
On 13,265 ladder games: each extra Pokémon of our four that a player brought → +1.3 win pts (±1.0), vs +1.0 (±1.1) for the
four most often brought. Matching the winner's actual four: ours 71.5%, most-brought 78.4%, random 66.7%. Leading with our pair:
+3.2 pts vs ratings.
Adding learned matchups (`CTR_W` in `17-matchup-threats-teams.js`, off by default): weight chosen on games before Oct 30, judged
once on 4,031 later games: +2.0 (±1.8) vs +0.8 (±1.8) today. Right direction, not beyond chance; the lead got worse
(2.5 → 0.9). Not shipped; re-judge on more games.

---

## 6. Open questions where fresh eyes would help most

1. **Suggestions for teams scoring 60+**: how do we give honest advice when the model can't separate one viable Pokémon from
   another? What would a better "after" estimate look like (e.g. ranking swaps by real 5-of-6 neighbour results, a Bayesian
   shrink toward "no difference" for near-ties, a separate swap model trained on real one-swap pairs)?
2. **Why do suggestions work for weak teams but not per swap type?** What separates them, if not the swapped-out Pokémon's usage?
3. **How should the score and suggestion gains be presented** so they're truthful but still feel like real upgrades? (Ideas
   floated, none decided: show the score as a range; split suggestions into proven "fixes" vs "fine-tuning" described by what
   changes; milestones like bands and threats handled.)
4. **Is a better team score possible at all** given skill dominates? Things the score can't see: which four are brought,
   synergy inside the four, stat points, player familiarity with a Pokémon.
5. **Speed control**: experts and top players say it matters; real data can't show it because nearly everyone runs it. How
   should a score treat factors like that?

## 7. How to reproduce

Node 22+, Playwright with Chromium. Build the page: `node app/build.mjs` (writes `app/dist/page.html`). Most experiments run the
built page in Chromium so they test exactly what users see. Examples:

```bash
node experiments/sugg-real.mjs 400
```

```bash
node experiments/real-swaps-site.mjs
```

```bash
node experiments/walk-forward.mjs
```

```bash
node experiments/plan-test.mjs
```

Each script's header comment says what it measures, what it can't see, and its options. `experiments/ci-local.sh` runs every
check that CI runs. A sealed test set (events from Nov 9 on) is untouched; please don't tune anything on it.
