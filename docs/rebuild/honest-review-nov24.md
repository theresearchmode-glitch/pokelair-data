# NastyPlot: an honest review (HH, Tue Nov 24)
Sim asked: "if this was done 100% your way ... the good, the bad, the ugly ... what's the best step forward". Straight answers.
Every fact is marked **checked** (how) or **my view** (judgement, not measured).

---

## 1. The short version
- **The product is good and the data is real.** The redesign has a real identity, and the numbers come from real games.
- **Our biggest risk isn't design. It's what happens after January 1:** a public site that isn't a Claude page yet, a heavy
  first load, and a score whose edge over plain win rates is small. I'd shift focus there right after M-D.
- **Our process has grown heavier than the work needs.** Too many rules, logs and checks cost usage and still let a 3-day data
  outage slip through. I'd cut it down hard.

---

## 2. The good (keep all of this)
1. **Real data, honestly labelled.** 17,002 teams, 96,547 games, 544 tournaments (checked: today's refresh). Cross-checks
   against Pikalytics, official top 64 and Liquipedia came back clean today (checked).
2. **A live site that can't take bad data.** Tests gate the live branch. That's why the Nov 22-24 outage showed *old* numbers
   instead of *wrong* ones. The design was right; we just weren't watching it (see §4).
3. **The redesign has its own look.** Unbounded slanted, the plot bars, the receipts and tickets, the real art. It doesn't
   look like a template (my view; it's what your rule asked for).
4. **Honesty in the product.** "Best guess", data sources named, thin data said out loud. Rare on Pokémon sites (my view).
5. **The two-account pattern works.** In one morning the other account found two wrong tips on the info sheets, a wrong item
   in a test, and that the A1-M9 "bug" and the art "bug" weren't bugs (checked: its reports today).

---

## 3. The bad (fix these)
1. **The Strength Score's edge is small.** The team model is right 56.4% of the time, against 54.1% for plain win rates
   (checked: today's refresh, 8,723 test games). That's real, but it's a 2-point edge. A 0-100 number can make it look more
   certain than it is.
   → Keep the score, but lean harder on the *advice* (suggestions, matchups, sets), and keep saying it's a strength estimate.
   Ship the planned Strength Score (Step 3) only if it beats today's score on the walk-forward test, as you already ruled.
2. **No plan on paper for the public site.** The site saves teams, feedback and usage through Claude-only storage
   (checked: `window.claude` in 8 files, including saved teams). I couldn't find a written plan for hosting, storage, a domain,
   or moving players' saved teams (checked: searched the docs). The public launch is about 5 weeks away.
   → Write and test that plan right after M-D, not in late December.
3. **The first visit is heavy.** 2.75 s on 4G against a 2.5 s goal (checked: Game Plan). The new site's main script is about
   3.7 MB before compression (checked: v2.js 3,768,041 bytes). Most visitors will be on phones.
   → After the switch: split the script so each page loads only what it needs.
4. **We depend on one live source.** Limitless carries everything; op.gg rankings paused since Nov 17 and Pikalytics has been
   frozen since about Nov 9 (checked: CLAUDE.md / logs). If Limitless changes its API, the site stops updating.
   → A second source that works on its own (Showdown ladder replays are the best candidate), plus an alarm if Limitless fails.
5. **We don't know which pages people use.** No usage numbers per page at all (checked: CLAUDE.md's privacy rules; usage
   counts are planned as totals only). We built about 26 pages (checked: 51 page files) without knowing which ones matter.
   → At launch: anonymous page-view totals only (no IDs, COPPA-safe), then cut or merge what nobody uses.

---

## 4. The ugly (my own mistakes and our process)
1. **The live site sat on old data for 3 days and nobody noticed** (Nov 22-24, checked: GitHub runs 1434-1515). I was
   watching the redesign branch, not main. Fixed today, and the 7:41 job now shouts if tests fail, but it shows the gap: we
   check a lot of things and missed the one that mattered most.
2. **Today I made two careless errors:** a commit message that said a fix was in when the script had stopped before writing it,
   and a test run on the wrong commit. Both caught and corrected, but they're exactly what "no guessing" is meant to prevent.
3. **The rules have outgrown their use.** 798 lines across 3 files (checked), many marked "replaced". The decision log is 2,464
   lines (checked). 53 docs in docs/rebuild (checked). The stop-hook still says "ALWAYS 3 HELPERS" when the rule is 1-2
   (checked: today's hook output). This costs usage every turn and makes conflicts easy.
   → One short rules page (about 60 lines), old versions moved to an archive file, the hooks matched to it.
4. **Too many places to look.** Game Plan, old Plans page, HANDOVER, main-queue, decisions, game plan doc. You shouldn't need
   to know where anything lives.
   → One Game Plan page for you; everything else is my working notes.

---

## 5. If it were 100% my way: changes
**Upgrades**
- Make **"What do I change?"** the heart of the site: the team page leads with the 1-3 changes that matter most, the score sits
  under them. Players come to win more, not for a number (my view).
- **Matchup advice from real games** gets more room: "against Incineroar + Flutter Mane leads, teams like yours win 58%".
  It's our real edge over other sites (my view; the data exists in matches.json).
- **Best-of-3 data** (Regionals, Worlds) as its own step after M-D, as CLAUDE.md already plans. Most serious players play Bo3.

**Removals or merges (once page numbers exist, not before)**
- Candidates to merge: Practice + Test Run; Track Record into Methodology; This Week + Weekly digest. My guess only; I'd decide
  with page-view totals after launch, not now.

**Process**
- Rules: one short page (above).
- Checks: keep the tests that guard real things (data, calc, saved teams, legality, the score). Drop look-only checks that
  keep re-flagging known, judged findings.
- One alert channel: anything that blocks live data or a test on main sends you a phone notification the same morning.

---

## 6. What we should be doing and aren't
1. A written public-launch plan (hosting, storage, domain, moving saved teams, privacy page). **Biggest gap.**
2. Watching main's daily tests every morning, automatically (now partly done by the 7:41 job; make it a real alert).
3. Talking to a few real players before January: 3-5 people using the Preview for a week will tell us more than another
   polish sweep (my view).
4. Measuring the first visit on a real mid-range phone, not just the lab number.

---

## 7. The best step forward
1. **Now to Dec 2:** the game plan as agreed: switch Saturday, M-D ready, patch Dec 2. Don't add anything else.
2. **Dec 3-10:** cut the rules to one page; write and test the public-launch plan (hosting, storage, saved teams).
3. **Dec 10-20:** speed (split the script), the second data source, the alert channel, 3-5 real testers.
4. **Dec 20-Jan:** the Strength Score only if it wins the walk-forward test; launch prep.
5. **After launch:** page-view totals → merge or cut pages nobody uses; then Bo3.
