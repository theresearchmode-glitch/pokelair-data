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
