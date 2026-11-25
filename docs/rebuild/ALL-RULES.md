# All of Sim's rules for NastyPlot, in one place

Gathered on Nov 12, 2026, 8:55 PM Eastern, from CLAUDE.md, docs/rebuild/RULES.md, docs/rebuild/design-system.md and your
account settings. Each rule says when you gave it, where known. Where two rules disagree, the newer one wins; replaced rules are
listed at the end. The full wording stays in those files; this is the plain-words version to read through.

---

## 1. How Claude talks to you

1. **Your questions come first, always.** Every question you ask is answered before anything else, and none goes unanswered.
2. **WORKING or STOPPED.** Every message starts with one of the two. If work stops, Claude says so and why, without you asking.
3. **Nothing claimed before it's real.** Claude never says something is being done unless the very next step starts it. It never
   says something is done or checked unless it was actually run.
4. **Every check shows its proof:** the command, the exact result line, and what it means in plain words. If something wasn't
   checked, Claude says "not checked".
5. **Mistakes are reported at once.** The moment something Claude told you turns out to be wrong, it tells you first.
6. **Every claim is labelled:** "checked" or "measured" (with how), or "my guess, not yet tested". If Claude is unsure, it says
   "I'm unsure" and why. A guess is never presented as a fact.
7. **No guessing, for anything, even small things** (where a file lives, how something works, what a test needs). Read it or run
   it first. "I think" is never enough.
8. **No yes-man.** If Claude disagrees or is unsure, it says so plainly, with the reason. Nothing is agreed to or confirmed
   without checking first. Plans and limits, including yours, get challenged when the evidence points elsewhere.
9. **Be 100% frank.** If something seems missing, Claude says so unasked. Earlier wrong statements are corrected as soon as
   they are found.
10. **Times always come from the clock** (Nov 12). No time is ever typed from memory or estimated. This covers messages, docs,
    commit messages and the decision log.
11. **Pictures right next to every design question** (Nov 12, 7:15 PM). They go in the same message, beside the question, never
    "see the picture above".
12. **Skipped questions come back** (Nov 12, 8:23 PM). If you reply but skip a question, Claude asks it again in the next
    message, with its pictures again, and keeps a short "still waiting on you" list until each one is answered.
12b. Every picture is labelled (Nov 12): the question number and option name are printed on the picture itself. The recommended option says "RECOMMENDED" on its picture too. Every option gets its own labelled picture, even "no change".
13. **Every recommendation comes with a short, quick reason** (Nov 12, 8:55 PM): one line in plain words saying why.
14. **When you're away,** a phone notification reaches you when a decision is needed.
16. **The Rebuild Checklist is always up to date (TOP PRIORITY, Nov 12).** Every step change, missing feature or doubt goes on it in the same message as the work; purple means Claude is unsure.
15. **We are partners.** You bring the ideas, Claude does the research and the proper work, and each helps the other in both.

## 2. How the work is done

1. **No design decision without you. Ever.** Every visual or design choice goes to you first, with screenshots, and waits for
   your yes, even under executive authority. Nothing visual goes on the Preview or the live site without your yes.
2. **Quality over speed.** One item at a time: before/after pictures and your yes for anything visual, then a use test on the
   built page, then the result lines. Claude reads the whole page with its own eyes before anything is published.
3. **Stop means stop.** When you say pause or stop, nothing else happens until you say go.
4. **One thing at a time:** at most one grade change and one site change in progress. Each is finished (tested, reviewed, live,
   or dropped) before the next. Look-only work (sweeps, measurements, background runs) can run alongside, and Claude tells you
   when it is multitasking.
5. **No new features until what we have is finished and refined** (Nov 9). Never remove functionality.
6. **Order of work** (Nov 10): first the rebuild into the new design, then Regulation M-D, then the launch plan. The January
   launch work is parked until you say.
7. **Plans are always checklists** on the NastyPlot Plans page. New plans are added there, steps are ticked with the date and a
   short note, and unscheduled ideas go in "Ideas, not scheduled yet" so nothing is lost.
8. **Usage warning** (Nov 6). Before heavy work, Claude warns you with a rough size (light / medium / heavy), says what makes it
   heavy, offers a lighter option, and lets you decide.
9. **Ultracode** (Nov 9). When you describe a task, Claude says up front whether ultracode would really help, with a rough usage
   multiple. It's off by default.
10. **Helper agents** (Nov 10). For the rebuild, Claude uses them where they genuinely help and tells you when it does.
11. **Your local PC chat** (Nov 11). When a job would go faster on your Windows PC, Claude says so and gives you a ready-to-paste
    prompt. That prompt says to fix only the setup, never the code or tests.
12. **Executive authority.** When you give it:
    - Claude confirms at once, restating the scope and the end time.
    - It decides everything except visual or design choices on its own recommendation.
    - It logs every decision in decisions.md and never ends a turn while work remains.
    - It summarises the decisions when the time is up.
13. **Never delete a project without your full confirmation** (account rule).

## 3. Checks and testing

1. **Every "checked" says where and what:** built page or mock-up (which file and commit), the exact result line, and what it
   means in plain words.
2. **Part C, for every page** (Nov 11):
   - **C1:** measure the real built page at 320, 390, 820 and 1440, in the default and the worst states, inside the height limits.
   - **C2:** no claim without a result.
   - **C3:** read the whole page as a new player.
   - **C4:** one main action per screen.
   - **C5:** no full-page redraw after first paint.
   - **C6:** one status message and one Undo per action.
   - **C7:** anything hidden can't be reached by keyboard.
   - **C8:** every tap target is 44×44 or larger.
   - **C9:** nothing behind the fixed bars is legible, and the last content clears the bottom bar.
   - **C10:** links only go to pages that exist.
   - **C11:** symmetry in every row of repeated things.
   - **C12:** a use test (click everything, tab through, open and close sheets, change and undo, reload; zero errors).
   - **C13:** an automated check covers these, and says which ones it doesn't cover.
3. **Studio-level polish** (Nov 10). Every site change runs the polish check (a small fix only checks its page), adds no new
   finding, and Claude looks at the flagged spots itself. New components are checked at their narrowest and widest size.
4. **Before pushing to main,** run every check GitHub runs, not only the main test.
5. **How we test** (Nov 8):
   - Start from the game: what decides real battles.
   - A test only counts if it could have failed. Too few teams to tell means "unknown", never "no effect".
   - Test real teams, the teams the site builds, and deliberately broken teams.
6. **A phase is done only when it passes an independent check:** real later results and your own review. It is never judged by
   the same score that drove the change. If you disagree with the numbers, the phase stays open.
7. **Single games first** (Nov 8). Build and test on best-of-1 data. Best-of-3 comes later and separately.
8. **Test like you use it:** iPhone, iPad and the Windows desktop app. Test in Safari's engine too, not only Chrome's.
9. **Live is protected.** Daily data reaches the live site only if it passes the checks. Code tests run on a frozen data snapshot.

## 4. The Preview and publishing

1. **The rebuild lives on "NastyPlot Full Redesign".** It's republished after every finished step, but only with your yes for
   anything visual. Its card text says what's new.
2. **Every publish carries the sprite files.** Claude checks the artifact's file list before sending you a link.
3. **Nothing goes to the live artifact without your explicit go.**

## 5. Design rules

**The look**
1. **The Pokémon carry the page:** their art is the largest, most vivid thing on every screen.
2. **Readable first:** contrast passes in day and night, every Pokémon is named, and no label is shrunk to fit.
3. **Usability and easy accessibility are key** in every design decision (Nov 12):
   - each screen leads to its one useful next action;
   - nothing a player needs is buried;
   - 44px targets, real keyboard stops;
   - plain words.
4. **Keep the WOW** (Nov 10: "hard to obtain and very easy to lose"):
   - the big slanted headlines and numbers, bold colour fields, large sprites, slanted boxy shapes and sliders stay strong;
   - when a fix could go plainer or stay bold, stay bold.
5. **Dense where you work** (My Team, Battle, My Box, info sheet), **airy where you arrive** (Home).

**Colour** (updated tonight)

6. **Borrowed colour is the theme:** each Pokémon's own colour in its floor glow, the selected panel and the box wallpaper. That
   stays exactly as it is.
7. **Meaning colours** (Nov 12, 8:46 PM): a small fixed set, used only for small status marks (tags, verdict words, warning
   labels, damage cells), never for large areas or backgrounds.
8. **One scheme for good and bad, everywhere** (Nov 12, 8:53 PM):
   - **blue = good** (Favoured, Beats it, wins, ✓);
   - **red = bad** (Unfavoured, No answer, losses, ✗, danger);
   - **amber = caution** only (Shaky, in-between warnings).
   No three schemes for the same system.
9. **Colour must always say something** (Nov 12): every colour on a screen means one thing (a type, a danger, a band, a verdict,
   the selected Pokémon). Pink means only "selected".
10. **One coloured surface per screen at most;** page plus one card colour; no boxes inside boxes.
11. **Seamless and clean in day and night:** dividers are thin soft rules, not heavy dark lines.

**Type, spacing and shapes**

- Names only on tabs, menus and navigation (Nov 12): no counts or extra detail beside them.
- Capitalisation (Nov 12): Title Case for buttons, tabs, menus and section headings; sentence case for sentences, descriptions and notes; short joining words (a, the, and, for, from…) lowercase.

12. **Type** (Nov 7):
    - Headlines, big numbers and the tagline use Unbounded, slanted (the whole headline, not half), with no pink offset shadow.
    - Body text and small labels use Instrument Sans.
    - Tagline: "Sharply raise your win rate." with "your win rate." in the logo's PLOT blue.
13. **Scale** (Nov 7):
    - Text sizes: 13/15/16/17/20/22/24/26/28/34, plus display sizes.
    - Spacing on a 4px grid.
    - Corners: 4/6/10/18/round.
    - Paragraph line height 1.5.
14. **Corners** (Nov 12, 8:46 PM):
    - Round is used only in chosen spots: count badges, dots on slider tracks, the day/night switch, small pop-up tips, and
      Pokémon circles in compact lists.
    - Buttons, plates and chips stay slanted; they're part of the WOW.
15. **The main action is always the filled slanted plate** (Nov 11). Secondary actions are outline buttons or text links.

**Layout**

16. **Using space well is very, very important:** no empty strips beside text, no half-filled rows, no lone tiles, no empty
    half on desktop. Prefer even columns or side-by-side layouts over narrowing content.
17. **Every window size must look right** (Nov 9), including odd widths and resizing while a page is open.
18. **Symmetry and small details:** keep layouts even and labels clear.
19. **Rows of Pokémon line up** (Nov 11): feet on one line, names on one line (a Mega never pushes its name down).

**Pokémon on screen**

20. **Every Pokémon stands on the floor** (Nov 11): a pool of its colour at its feet, never floating in a cloud or halo.
21. **Desktop sprite glow** is off on mouse screens (except feature sprites), for smooth scrolling. Filtered sprites never get
    their own layers.
22. **Empty and loading screens show a rotating featured underdog** (Nov 11):
    - Flapple first, then one a day from the 12 lowest-rated Pokémon with real games.
    - The copy is playful and affectionate, never mocking.
    - It never appears beside grades or a team's data.
    - Each new spot is shown to you first.
23. **Shady Paw is cut** and is not the mascot. **Darkrai is cut** from the rebuild. A real mascot is a separate project for later.

**Specific pieces**

24. **My Box access:** a small icon at the top next to Day/Night, never a sixth menu item. Options go to you with pictures first.
25. **Keep the frosted glass** on the bars, as long as text behind it is never legible.

## 6. What the site says and shows

1. **Real data only.**
2. **Sets on teams** (Nov 8):
   - Every team shows each Pokémon's most common complete tournament set.
   - In the grade, an unchanged set counts as a typical build; whatever the player changes is graded exactly.
   - Our popular sets must agree with established sites, and any disagreement is explained.
3. **The Strength Score** (Nov 9):
   - The 0–100 number says how strong the team is altogether, built from every factor we've studied, each weighted by its real
     effect on wins.
   - The bands: 100 has everything with no weak spots; a solid tournament team is about 80; the best-built are 90+; a missing
     basic drops it to the 60s; a beginner team is 30–50.
   - The rank among other teams is only a small line underneath, never the score itself.
   - It ships only if it predicts real wins at least as well as today's grade.
   - It is honest that how players use the team, and their skill, matter a lot.
4. **The word list** (Nov 9). One name per idea:
   - Strength Score, with its band words Top tier, Tournament ready, Solid, Needs work, Missing a basic.
   - "Rating" is only for one Pokémon, always with "tier".
   - Matchups: Beats it / Handles it / Shaky / No answer, and Favoured / Even match / Unfavoured with no "Real games:" prefix.
   - Suggestions; Team checks (4 basics plus 3 notes); Test run.
   - Plain words: player skill, wins more than average, today's tournament teams, points.
   - Data sources: Official events / Online tournaments / Ranked ladder / Showdown ladder.

## 7. Privacy and launch

1. **COPPA:** no names or emails collected; feedback stays anonymous. Kids play Pokémon, so privacy rules are strict.
2. **The contact email** shows only after "Show email". No RK9 scraping.
3. **No model names in commits.**
4. **Public launch in January 2027** as a normal website:
   - A brand-new visitor gets a clean first experience.
   - Nothing depends on Claude-only features without a plan.

---

## Replaced rules (kept so nothing is confusing)

- **"Never red"** was removed by you (Nov 12, 8:36 PM). Red is now the "bad" colour (section 5, rules 7–8).
- **"Fixed colours only for logo blue, section marks, bands and verdicts"** was loosened (Nov 12, 8:46 PM) to allow the meaning
  colours.
- **"Round only for avatars and slider knobs"** was replaced (Nov 12, 8:46 PM) by "round in chosen spots".
- **"Faster flow: put fixes live directly" (Nov 10)** and **"decide on your own recommendation" under authority** were replaced
  by section 2 rule 1 (no design decision without you).
- **Darkrai on empty screens** was replaced by the featured underdog. The live site keeps its Darkrai spot until the rebuild
  replaces it.
