# NastyPlot (Sim's project)

This repo is Sim's (Simran's). These are her standing preferences for any session working on it.

## READ FIRST (Sim, Nov 11 night): docs/rebuild/RULES.md and docs/rebuild/HANDOVER.md
- docs/rebuild/RULES.md: the rules that win over anything older below. In short: NO design or visual decision without Sim's
  yes and screenshots, even under authority; every "checked" names built page or mock-up, the result line, and a
  plain-English meaning; quality over speed, one item at a time; stop means stop; Part C rules C1-C13 for every page.
- docs/rebuild/HANDOVER.md: where the rebuild stands, open bugs, questions waiting on Sim, last check results, commands.
- docs/rebuild/my-team-fix-plan.md: Sim's My Team fix plan (Part A bugs in order, Part B causes, order of work).

## Honesty and openness (Sim, Nov 12, 5:12 PM; never to be repeated): docs/rebuild/RULES.md section 00
Sim's questions come first, always, and none goes unanswered. Every message starts with WORKING or STOPPED; if work stops, say
so and why; under authority never end a turn while work remains (default + log + keep going; keep a wake-up scheduled). Never
claim something is being done or is done unless it truly is. Every check: command, exact result line, plain meaning. Report a
wrong statement to Sim the moment it's found.

## Times are always read from the clock (Sim, Nov 12)
Sim is strict and punctual about times. Never type a time from memory or estimate it ("~3:25"). Every time written anywhere
(decisions.md, docs, messages to Sim, commit messages) comes from the clock first: `TZ=America/New_York date`. For the decision
log use `bash docs/rebuild/log-decision.sh "..."`, which stamps the entry with the clock's time itself.

## Pictures next to every design question (Sim, Nov 12, 7:15 PM; for now and always): docs/rebuild/RULES.md section 00b
Each design question carries its picture(s) in the same message, right next to it; never "see the picture above".

## No yes-man (Sim, Nov 12): always say when you disagree or are unsure; challenge, look deeper; never confirm or agree
without checking first. (docs/rebuild/RULES.md section 0.)

## Design philosophy (Sim, Nov 12): usability and easy accessibility are key factors in every design decision
(docs/rebuild/RULES.md section 0b).

## Usage warning (Sim, Nov 6)
Before starting a task that will be heavy on usage, warn Sim first and let her decide. Heavy means things like: many helper
agents, long multi-hour runs with lots of back-and-forth, big redesigns or full-site rewrites, repeated large screenshot
batches, or anything likely to take more than about an hour of active work. Give a rough size (light / medium / heavy), what
makes it heavy, and a lighter option if one exists. Background computer time (a script running on its own) is cheap; say so.
Ultracode (Sim, Nov 9): when Sim describes a task, say up front whether turning ultracode on (many helper agents plus skeptic
agents) would really help it, with a rough usage multiple, so she can turn it on herself. Default: off; it mainly helps big look-only
audits and research sweeps, not our one-change-at-a-time work.

## How Sim likes work done
- Preview before live: nothing goes to the live artifact without her explicit go (unless she says "publish when done" for that change).
- Faster flow (Sim, Nov 10, latest, overrides the line above for now): skip the Preview for today's site; send Sim screenshots
  and put fixes live directly. The rebuild lives on its own artifact, "NastyPlot Full Redesign", until the switch.
- Watch the build live (Sim, Nov 11): while the rebuild is being built, the "NastyPlot Full Redesign" artifact
  (https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf) is republished after EVERY finished step (each piece of a page, not only
  whole pages), with its index card text saying what's new, so Sim can watch the new site come together. Check its file list
  (v2art/*.webp, 346 files) after each publish.
  Sim, Nov 11: the Preview opens straight into the new site (index.html forwards to foundation.html, built with
  --preview-data), so it reads as one real site growing; pages not rebuilt yet show "Coming next" with their approved mock-up
  (pages/coming.js, Preview builds only). The old card gallery stays as gallery.html.
- Every Preview or live publish must carry the 345 sprite files (sp/*.webp) beside the page; check the artifact's file list
  (Artifact list, scope files) before sending Sim a link (Nov 9: a Preview went out with no sprites).
- Real data only, never remove functionality, be careful. Ask when unsure.
- Authority (Sim, Nov 11): when Sim gives Claude decision-making authority (e.g. "executive control until 7PM EST"), reply first with
  an express confirmation that you understand and got it, restating the scope and the end time. Decide on your own recommendation
  until then, log every decision in docs/rebuild/decisions.md, and give her a summary of the decisions when the time is up.
- Lean usage: no helper agents unless she agrees, minimal screenshots.
- Local PC chat (Sim, Nov 11): Sim has a local Claude Code chat on her Windows PC (RTX 3080, faster than the cloud machine,
  doesn't restart). Whenever a task would go faster there (test runs, polish checks, screenshot batches, image work on the
  GPU, anything heavy in a browser), say so up front and give her a ready-to-paste prompt: what to pull, what to run, where
  to save results (commit to the working branch), and "fix only setup, never the code or tests". Briefs live in
  docs/rebuild/gpu-jobs.md or docs/rebuild/test-runs/.
- She tests on iPhone, iPad and the Claude desktop app on Windows (mouse wheel, 100% scaling). Desktop sprite glow is off on mouse
  screens except feature sprites, for smooth scrolling; never give filtered sprites their own layers (will-change), it made it worse.
- She has a sharp eye for symmetry and small details; keep layouts even and labels clear.
- Every window size must look right (Sim, Nov 9): the layout has to survive any resize, including odd window shapes and dragging
  the window while a page is open. Check odd widths, not only phone / tablet / desktop.
- Using space well is very, very important to her, on every page and every screen size: no empty strips beside text,
  no half-filled rows. Prefer even columns or side-by-side layouts over narrowing content.
- Seamless and clean, in light AND dark mode: no boxes stacked inside boxes in different shades (page > card > cell
  should be at most page + one card colour), dividers are thin soft rules (--ar-rule), not heavy dark lines.
- Type system (Nov 7, Sim chose): every headline, big number and the tagline use the logo's font, Unbounded, slanted
  (synthetic italic, font-synthesis: style), no pink offset "misprint" shadow; body and small labels use Instrument Sans.
  Tagline: "Sharply raise your win rate." with "your win rate." in the logo's PLOT blue.
- Design scale (Nov 7): text 13/15/16/17/20/22/24/26/28/34 (+ display), spacing on a 4px grid (1/2/6 allowed),
  corners 4/6/10/18/round, paragraphs line-height 1.5.

## Studio-level polish, every change (Sim, Nov 10)
After many fast changes the formatting rules slipped (an outside polish review found half-slanted headlines, sizes off the
scale, text falling out of boxes, lone tiles, empty desktop halves). The standard is a high-quality design studio: every tiny
detail right. So:
- Every site change runs experiments/polish-check.mjs (all pages, 320-2560 wide, light and dark) before it goes to the Preview
  (Sim, Nov 10: a small one-spot fix only needs the page it touches checked, e.g. VIEWS=ratings, not the full sweep),
  and introduces no new finding. Look at the flagged spots with your own eyes; the check finds, it doesn't judge.
- The rules it measures are the rules above: the type scale, the 4px grid, Unbounded slanted for every headline and big number
  (the whole headline, not half), line height 1.5, no text out of its box or wrapping unevenly beside its neighbours, no lone
  tile or half-filled row, no empty half on desktop, no boxes in boxes, one size per kind of control.
- New components (sliders, chips, tiles) are checked at their narrowest and widest real size before they ship.
- Keep the WOW (Sim, Nov 10: "hard to obtain and very easy to lose"). Polish fixes the details; it never flattens the look:
  the big slanted Unbounded headlines and numbers, bold colour fields, large sprites, the slanted boxy shapes and the sliders
  stay as strong as they are. When a fix could go "safer and plainer" or "right and just as bold", choose bold. Compare
  before/after screenshots of each batch for impact, not only for rule-following.

## Plans are always checklists (Sim, Nov 8)
ORDER OF WORK (Sim, Nov 10, latest): 1) the rebuild into the new design, 2) then integrating Regulation M-D, 3) then the
launch plan. Rebuild plan: docs/rebuild-plan.md and the Plans page section "Rebuild into the new design" (Claude leads; Sim
approves the direction, each page and the switch; nothing starts until she says go). What the redesign chat decided and made:
docs/redesign/HANDOFF.md and docs/redesign/concepts/ (that chat is retired; everything runs through this one). Look polish on
today's design is frozen; bug fixes continue. R0 decisions (Sim, Nov 10) are in docs/rebuild-plan.md; Helper agents (Sim, Nov 10, latest): for the
rebuild, use them wherever they genuinely help, without asking first; just tell her when you do (she'll say if it's a problem).
Changes to the site still land one at a time.
Earlier focus (Nov 10): the NastyPlot Focus page (https://claude.ai/artifact/1AgBoBNeSXHGRDu8kpYPGX, source
docs/focus-plan.html; ticks in its own db collection "progress"): grading fixes from the outside review (GRADING-REVIEW.md),
then site cleanup. Tick steps there. The older Plans page below keeps the full history and ideas.
Every plan made for Sim lives as a checklist on the NastyPlot Plans page (https://claude.ai/artifact/22pgABvJfs2yYfJaPu5yjZ,
source docs/foundation-plan.html; ticks are in its db collection "progress"). Add each new plan there as its own section,
tick steps as they're done (with the date and a short note), and put every idea that isn't scheduled yet in "Ideas, not
scheduled yet" so nothing gets lost. Keep the page current at all times.

## Sets on teams (Sim, Nov 8)
Most players don't know what moves to run. Any team the site builds or that a player types in SHOWS each Pokémon's most common
COMPLETE tournament set (item + Ability + four moves that real players run together, update.mjs `cs`). In the grade, a set the
player hasn't changed counts as a typical build of that Pokémon (Sim chose this Nov 8 after a test: typical build predicted
winners 55.3% vs 54.5-54.8% for grading the exact popular set). Whatever the player changes is graded exactly as they chose. Our popular-set numbers must agree with established
sites (Pikalytics tournaments, Pokémon Zone, MetaVGC, PokéBase); crosscheck.mjs checks this daily, and any disagreement gets
explained, not ignored.

## When a phase counts as done (Sim, Nov 8)
A phase is done only when it passes a check that is INDEPENDENT of the thing being changed: real later results, and Sim's own
review. Never judge a change with the same score that drove it (Build for Me picked teams by the grade and was then "checked" with
the grade, so it passed while Sim found it worse). If Sim's review or real use disagrees with the numbers, the phase stays open
until the disagreement is explained and fixed. Never start the next phase while an earlier one has an open problem.

## Public launch (Sim, Nov 8)
NastyPlot launches to the public sometime in January 2027, as a normal public website (not only the private Claude page).
Build with that in mind: a brand-new visitor with no saved teams must have a clean first experience; nothing may depend on
Claude-only features without a plan for the public site; kids play Pokémon, so the privacy rules below are strict.

## Empty and loading screens: a rotating featured Pokémon (Sim, Nov 11; replaces Darkrai and Shady Paw)
**Shady Paw is cut. He is NOT the NastyPlot mascot and must not be used anywhere (Sim, Nov 11). Darkrai is cut from the
rebuild too.** NastyPlot has no mascot for now; a real one is a separate project for later.
Sim, Nov 11: Darkrai was "forcing a mascot at an unnecessary time". In the rebuild, empty and loading screens show a featured
Pokémon that rotates, plus one line of copy. Sim's idea and its point: spotlight the Pokémon that never get one. The featured
Pokémon comes from the bottom of our own ratings ("underdog"): even the lowest-rated Pokémon is somebody's favourite, so it gets
its moment on our site, with playful, affectionate copy (celebrate it, never mock it). It rotates so many different Pokémon get a
turn; pick from the bottom of the ratings, preferring ones with enough games for the rating to mean something. The first underdog is Flapple (Sim: "it's the cutest"). Rotation rule (Sim approved, Nov 11): Flapple first, then one a day from the 12 lowest-rated Pokémon
that have real games (at least 1% of teams), since the very bottom of the ratings has almost no games (Flapple: 43
tournament games, 0.1% of teams). Every new spot is shown to Sim first. Never beside grades or a team's data. The live site keeps its current Darkrai
spot (empty My Team) until the rebuild replaces it. A real NastyPlot mascot is its own project for later, in a separate chat.
Darkrai and Shady Paw files stay in docs/mascot/ as history.

## The grade is a Strength Score (Sim, Nov 9)
The 0-100 grade must say how strong the team is altogether, derived from all the factors we have studied and measured (Pokémon and
sets, the 4 basics, readiness for the top threats, learned matchups, the team's own record...). NOT "what percentage of other teams
it beats": that may appear as a small line under the score, never as the score itself. It ships only if it predicts real wins at
least as well as today's grade (walk-forward scoreboard, keep/drop rule, never-get-worse gate); otherwise back to the drawing board.
Plan: "What we learned about matchups and synergy" > "Strength Score" on the Plans page.
Design approved (Nov 9): 100 = has everything winning teams have and no weak spots; a solid tournament team about 80, the best-built
90+, a missing basic drops clearly (60s), beginner 30-50; each factor moves it in proportion to its measured effect on real wins;
team, not player (records count only after player skill is taken out); a small rank line underneath. Guiding principle (Sim): give the
best team-building advice possible, and be honest that how players use the team and their skill matter a lot.

## Privacy and safety
- COPPA: no names or emails collected; feedback stays anonymous.
- The contact email is shown only after "Show email". No RK9 scraping.
- No model identifiers in commits.

## How we test (Sim, Nov 8, after the no-Mega 98)
A no-Mega team graded 98 while real no-Mega teams win 34%: the grade never counted the team as a whole, and every test only
looked at real teams, where nearly everyone already has a Mega. To stop gaps like this:
- Start from the game, not the data: before changing the grade, list what decides real battles (expert guides, top players,
  Sim) and check in the CODE that the grade can see each one. Keep the "What can the grade see?" table current.
- A test only counts if it could have failed. Say what it could and couldn't detect. Too few teams to tell = "unknown",
  never "no effect" or "doesn't matter".
- Test where the grade is used: real teams AND the teams Build for Me and suggestions make AND deliberately broken teams
  (remove the Mega, speed control, Protect, Fake Out/Intimidate: the grade must drop about as much as real results say).
- Never tell Sim something is done or doesn't matter without these. The Deep Check plan on the Plans page comes first.

## Single games first (Sim, Nov 8)
Pokémon Champions ranked play and online competitions are single games (best of 1). Get the grade right for ONE game
first: build and test on single-game data (Showdown ladder replays, best-of-1 tournament rounds). Best-of-3 VGC events
(Regionals, Worlds, most Limitless events) are a later, separate step; don't mix their round results in as if they were games.

## How we work together (Sim, Nov 8)
Sim and Claude are partners: Sim brings the ideas, Claude does the research and the proper work, and each helps the other in
both. Be 100% frank. If unsure, say "I'm unsure" and why; never fill a gap with a guess presented as fact, never a made-up
answer. If something seems missing, say so plainly, unasked. Do the due diligence at every step (check sources, check the
code, test before claiming); no shortcuts. Correct earlier wrong statements as soon as they're found.

## Word list (Sim approved, Nov 9)
One name per idea, everywhere on the site:
- **Strength Score** (was "Grade", Nov 9, Preview; final with Sim's review): the team's number out of 100, with its band word: 90+ Top tier,
  80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic (colours: blue, purple, neutral, amber, muted grey-brown;
  never red). The rank among tournament teams is only the small line under it. "Rating" is only for a single Pokémon, always with "tier"
  for its letter ("S tier", "A tier"), so a Pokémon's tier never reads like a team's score.
- **Matchups**: how the team does against the top threats (not "readiness" / "ready for the top 30" / "Threats" as the idea's name).
  The four levels: **Beats it / Handles it / Shaky / No answer** (were Well handled / Handled / Shaky / Unanswered).
  The real-games word under each threat: **Favoured / Even match / Unfavoured** (Sim, Nov 9; Nov 10: no "Real games:" prefix, "it's too much"; the section says once that verdicts come from real games).
- **Suggestions**, numbered "Suggestion 1" (not Fix it / plans / ideas). (The "Different option" label was removed Nov 9: Sim rejected it.)
- **Team checks**: the 4 basics, plus 3 notes (not checklist / game plan / pillars). Sim, Nov 9: speed control, spread damage and
  lead support are notes, not counted (real games: teams with them won no more often, experiments/checks-real.mjs).
- Plain words: player skill (not Elo), wins more than average (not win edge), reaches top cut more often than its use predicts (not
  conversion), today's tournament teams (not field), points (not pts), Test run (not Gauntlet); data sources are always Official events /
  Online tournaments / Ranked ladder (the in-game one) / Showdown ladder (Sim, Nov 10: a separate source, keep both names).
- Kept as players know them: Archetypes, spread, top cut, usage, set, Mega, speed control, Tailwind, Trick Room, core, hidden gem, best guess.

## Focus and honesty (Sim, Nov 9)
After Claude's honest review, Sim agreed:
- No new features until what we have is finished and refined (Sim, Nov 9). Work = finishing, fixing and refining what
  exists (Team Sheet, share image, the grade) and the process fixes. (Darkrai's Preview spot is gone: replaced by the featured
  underdog, see above; Shady Paw is cut.)
- Multitask where it helps (Sim, Nov 9): look-only work (sweeps, measurements, background runs) can run alongside a change; always
  tell Sim when we are multitasking. Changes themselves stay one at a time:
- One thing at a time: at most ONE grade/model change and ONE site item in progress. Finish (tested, reviewed, live or
  dropped) before starting the next. Small batches. Don't skip ahead of an open step on the Plans page.
- NO GUESSING (Sim, Nov 9): check before acting or claiming anything, including small things (where a file lives, how a
  script loads its data, what a test needs). Read the code or run it first; "I think" is never enough.
- Every claim to Sim is labelled: **measured** (with the number and the test) or **my guess, not yet tested**. No conclusions
  from partial runs.
- Live is protected: the daily data/model reaches the live site only if it passes the checks; otherwise yesterday's stays.
- Code tests run on a frozen data snapshot (they fail only when code breaks); daily data checks run separately and alert.
- Before pushing to main, run every check GitHub runs (.github/workflows: golden.mjs, same-grade.mjs, suggest-audit.mjs and the
  rest), not only app/test/run.mjs (Nov 9: two check scripts still read the old letters and turned main red).
- The January launch work is parked until Sim says.
