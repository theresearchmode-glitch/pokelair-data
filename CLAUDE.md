# NastyPlot (Sim's project)

This repo is Sim's (Simran's). These are her standing preferences for any session working on it.

## Usage warning (Sim, Nov 6)
Before starting a task that will be heavy on usage, warn Sim first and let her decide. Heavy means things like: many helper
agents, long multi-hour runs with lots of back-and-forth, big redesigns or full-site rewrites, repeated large screenshot
batches, or anything likely to take more than about an hour of active work. Give a rough size (light / medium / heavy), what
makes it heavy, and a lighter option if one exists. Background computer time (a script running on its own) is cheap; say so.

## How Sim likes work done
- Preview before live: nothing goes to the live artifact without her explicit go (unless she says "publish when done" for that change).
- Real data only, never remove functionality, be careful. Ask when unsure.
- Lean usage: no helper agents unless she agrees, minimal screenshots.
- She tests on iPhone, iPad and the Claude desktop app on Windows (mouse wheel, 100% scaling). Desktop sprite glow is off on mouse
  screens except feature sprites, for smooth scrolling; never give filtered sprites their own layers (will-change), it made it worse.
- She has a sharp eye for symmetry and small details; keep layouts even and labels clear.
- Using space well is very, very important to her, on every page and every screen size: no empty strips beside text,
  no half-filled rows. Prefer even columns or side-by-side layouts over narrowing content.
- Seamless and clean, in light AND dark mode: no boxes stacked inside boxes in different shades (page > card > cell
  should be at most page + one card colour), dividers are thin soft rules (--ar-rule), not heavy dark lines.
- Type system (Nov 7, Sim chose): every headline, big number and the tagline use the logo's font, Unbounded, slanted
  (synthetic italic, font-synthesis: style), no pink offset "misprint" shadow; body and small labels use Instrument Sans.
  Tagline: "Sharply raise your win rate." with "your win rate." in the logo's PLOT blue.
- Design scale (Nov 7): text 13/15/16/17/20/22/24/26/28/34 (+ display), spacing on a 4px grid (1/2/6 allowed),
  corners 4/6/10/18/round, paragraphs line-height 1.5.

## Plans are always checklists (Sim, Nov 8)
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

## Mascot (Sim, Nov 8)
Shady Paw is the chosen mascot, but nothing of him goes on the site until Sim is 100% happy with the design. Always show her
images of exactly how it would look for approval first; a placeholder drawing lost his character and was taken down.
Sim liked the mock-up integration (side profile / bold lines / sketch styles, ink plus one site accent) but wants him used
sparingly: NOT in Your Six, Add a Pokémon or the Battle preview, and never beside grades, ratings or data. Allowed spots:
an empty My Team (no team yet), other empty screens, small notices (saved, grade went up), tip bubbles, loading.

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
- **Grade**: the team's letter (A+ to F). "Rating" is only for a single Pokémon, always with "tier" for its letter ("S tier", "A tier"),
  so a Pokémon's tier never reads like a team's grade.
- **Matchups**: how the team does against the top threats (not "readiness" / "ready for the top 30" / "Threats" as the idea's name).
  The four levels: **Beats it / Handles it / Shaky / No answer** (were Well handled / Handled / Shaky / Unanswered).
- **Suggestions**, numbered "Suggestion 1" (not Fix it / plans / ideas); a side-grade is a **Different option**.
- **Team checks**: the 7 basics (not checklist / game plan / pillars).
- Plain words: player skill (not Elo), wins more than average (not win edge), reaches top cut more often than its use predicts (not
  conversion), today's tournament teams (not field), points (not pts), Test run (not Gauntlet); data sources are always Official events /
  Online tournaments / Ranked ladder.
- Kept as players know them: Archetypes, spread, top cut, usage, set, Mega, speed control, Tailwind, Trick Room, core, hidden gem, best guess.

## Focus and honesty (Sim, Nov 9)
After Claude's honest review, Sim agreed:
- No new features until what we have is finished and refined (Sim, Nov 9). Work = finishing, fixing and refining what
  exists (Team Sheet, share image, Shady Paw's one spot on the Preview, the grade) and the process fixes.
- One thing at a time: at most ONE grade/model change and ONE site item in progress. Finish (tested, reviewed, live or
  dropped) before starting the next. Small batches. Don't skip ahead of an open step on the Plans page.
- Every claim to Sim is labelled: **measured** (with the number and the test) or **my guess, not yet tested**. No conclusions
  from partial runs.
- Live is protected: the daily data/model reaches the live site only if it passes the checks; otherwise yesterday's stays.
- Code tests run on a frozen data snapshot (they fail only when code breaks); daily data checks run separately and alert.
- The January launch work is parked until Sim says.
