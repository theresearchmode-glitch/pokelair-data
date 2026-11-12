# My Team: where today's four folds go in the new build (placement mock-ups, Nov 12)

Pictures only. Nothing in app/src changed. Every "after" picture is the built new page (app/dist/v2.html, built from
claude/design6 at 1fa9bc7 with `--art=../src/v2/art/`) with the proposed markup injected in the browser, using the new
build's own classes (np-link, np-slide, np-type, np-btn2, tm-ck, tm-sub, fine, sg2-sev, the Things to Know fold look, sheets
via V2.sheet). Every "before" picture is today's built page (app/dist/page.html). Data: out/*.json fed the way
experiments/c13-check.mjs feeds it (so the team is the sample team, Sun Tailwind). Light mode, deviceScaleFactor 2,
widths 390 and 1440. A dashed blue outline marks what is new; it is not part of the design.

`0-combined-sheet.png` has all of them on one page.

## Page height (My Team limits: 390 = 3,700, 1440 = 1,800)

Measured on the mock-up page (document height, Chromium only), same method as c13-check.mjs. Baseline matched c13's
numbers exactly: 3,699 / 1,776.

| What | 390 | 1440 |
|---|---|---|
| Baseline (today's new build) | 3,699 | 1,776 |
| 1. Game Plan link as the first words of the six's game plan line (recommended) | 3,699 (+0) | 1,776 (+0) |
| 1b. Game Plan link at the END of that line instead | 3,722 (+23, over) | 1,776 (+0) |
| 2. Types inside Things to Know, fold closed (recommended) | 3,699 (+0) | 1,776 (+0) |
| 2b. Types as its own closed row under Things to Know | 3,805 (+106, over) | 1,881 (+105, over) |
| 2c. Game Plan AND Types as two closed rows in Team Checks | 3,910 (+211, over) | 1,987 (+211, over) |
| 3. Team Sheet: changes are inside the sheet | +0 | +0 |
| 4. How Scoring Works inside the Why this score? sheet | +0 | +0 |

Open states: Things to Know open is 4,965 (390) / 2,955 (1440) today already, without my change: over the limits. With
the Types part added it is 5,281 / 3,240 (+316 / +285). Rule C1's "every section open" worst state was already failing
before this proposal (not caused by it, but it gets worse). The Game Plan sheet scrolls inside itself (content 746 px at
390, 695 at 1440); sheets don't count toward page height.

In plain words: with the recommended placements the closed page stays exactly as tall as now at both widths. Any
placement that adds a visible row does not fit the phone limit (it has 1 px left) or the desktop limit (24 px left).

## Per feature

### 1. Game Plan
Today: a fold "Game Plan · leads, backups and what to watch" in part 3 "How Your Team Plays". Archetype tags (Sun,
Tailwind), then rows with a status word (Covered / Missing / Partly / Optional) and who does it: Speed control, Backup speed,
Weather, Terrain, Lead support, Priority attacks, Answer to their speed control, Hits your own side. Open/closed is
remembered (PLAY-01).
After: the six's game plan line ("Game plan vs the meta's top six: lead ...") starts with a "Game Plan ›" link; it opens
a Game Plan sheet with the same rows, in Team Checks' row style with the status word as a tag.
Why: it sits next to the line it explains, it is one tap, and it costs 0 px. The link is 85 x 44 (tap height via the
same negative-margin pattern the build uses for `.np-or .np-link`).
Unsure / not yet checked:
- The 44 px tap area overlaps the line under it; c13's "reaches" tap test has not been run on it.
- "Game Plan › vs the meta's top six: ..." reads a little odd; the link replaces the words "Game plan". Sim's call.
- Speed control and Lead support are also Team Checks notes: the same thing shown twice (rule C3). Options: keep both
  (the plan says WHO does it, the check says pass/fail), or drop those two rows from the sheet.
- PLAY-01 looks for a fold titled Game Plan and that it is remembered; a sheet needs the v2 test adapter to open it
  instead (remembering open/closed no longer applies to a sheet).

### 2. Types
Today: a fold "Types · What you hit and what hits you" beside Game Plan: Offense / Defense switch, summary lines, type
lists, a Mega pick when the team has two Megas (PLAY-02), and a nested "Full Tables" fold with the type grid.
After: a "Types" part at the end of the Things to Know fold (its summary reads "7 things, types, legal"): the same
Offense / Defense switch (np-slide), summary, type lists as type tags, and "Full Tables ›" (meant to open the grid as a
sheet; not mocked).
Why: Things to Know already has a one-line "Type balance" row, so Types belongs there (that row would be replaced by this
part, not shown twice), and it costs 0 px closed. Team Checks is also where the type checks ("No major weak spot", "Weak
spots spread out") live.
Unsure / not yet checked:
- One more tap than today to reach (open Things to Know, scroll to its end). If Sim finds that buried, option 2b is
  its own row, but it does not fit the limits (+106).
- The Mega pick for a two-Mega team and the Full Tables sheet are not in the mock-up.
- Things to Know's own rule that rearranges the desktop columns when it opens (sugs.css `:has(.sg2-fold[open])`) also
  applies here; a separate fold using the class sg2-fold would trigger it too, which is why option 2b's picture uses a
  copy of the look under another class.

### 3. Open Team Sheet
Today: a fold "Open Team Sheet · 6 sets, Reg M-C, bring 6, pick 4" on My Team (closed on phones, open on wider screens).
One card per Pokémon: Item, Ability, four moves, the nature with + and −, "Most common spread", six stats with stat points,
"↑ Lead vs the meta's six" on the two leads, tap a card to edit its set, and a "−" on each card that removes it with Undo
(SETS-01).
New build today: the Team Sheet sheet (jump bar button from 700 px; More menu on phones) already has, per card: Item,
Ability, four moves (type colours), nature + and −, the spread line, six stats with stat points, plus Copy for Showdown.
Missing: tap to edit, the "−" remove with Undo, and the lead mark. The mock-up adds an "Edit Set" button (np-btn2) and the
lead mark under each card.
Recommendation: today's fold is covered by the existing sheet once Edit Set and the lead mark are added. For Remove I
recommend NOT putting a "−" on every card: the six's own "− Remove" (with Undo) already does it one tap away, and six
remove buttons in a reading view are easy to hit by mistake. That changes SETS-01, so it is Sim's call.
Unsure / not yet checked:
- On phones the sheet is only in the More menu (two taps); there is a `.tm-tsact` CSS rule for a phone button but no
  markup uses it. Whether phones need a direct button: Sim's call.
- Tapping Edit Set from the sheet should swap the sheet for the Edit Set sheet (V2.sheet does swap); not tried.

### 4. How Scoring Works
Today: a fold at the foot of My Team with the full explainer (Ready for the top threats, Team checks, Defense, Offense,
Plans, the Pokémon rating), each paragraph cut to its first sentence with "More" (SETS-02, X-12).
After: a "How Scoring Works" fold at the end of the "Why this score?" sheet, first sentence plus More.
Why: it explains the score, and "Why this score?" is where a player asks that; 0 px on the page.
Unsure / not yet checked:
- The text uses old words from before the word list ("Ready for the top threats", "readiness", "Plans", "partly"), and
  SETS-02 checks for exactly "Ready for the top threats: the 30 Pokémon...". Moving it means rewording it, which changes
  the test. Sim decides.
- The Pokémon rating paragraph is not about the team's score; it belongs on How We Calculate.
- That sheet already ends with "How the Strength Score works" linking to #method; the new build has no #method page that
  I could find in src/v2 (not yet checked what the link shows), so it may break rule C10. The fold could replace the link
  until that page is rebuilt.
- Much of it repeats the "?" tips on Matchups and Team Checks (same facts, other words): rule C3 risk.

## Not checked at all
320 and 820 widths, dark mode, WebKit, tab order, the C13 check on the mock-ups, a use test. These are placement
pictures, not a build. The page also shows broken threat thumbnails in today's site's grid when run from app/dist without
sprites (outside the crops; not related).

Scripts used (scratchpad, not committed): load both pages with the c13 data, inject markup, measure scrollHeight, crop.
