# DRAFT: CLAUDE.md design rules for the new system (Plans step ar-claude-md; apply RIGHT AFTER the switch, with Sim's OK)

Written Fri Nov 20 under authority, as prep. Nothing in CLAUDE.md changes until the switch is done and Sim says yes.

## What changes
CLAUDE.md still describes the OLD site in several places. After the switch the new site (app/src/v2) is the only site, so these
sections should be replaced or pointed at the new system:

| CLAUDE.md section today | After the switch |
|---|---|
| "Type system (Nov 7, Sim chose)" | Keep the rule (Unbounded slanted for headlines and big numbers, Instrument Sans body, tagline). Add: sizes only as `var(--t13..--t34)` and `--d64/96/120/168` display sizes; enforced by app/test/v2-guard.mjs at every build. |
| "Design scale (Nov 7)" | Replace with the token names: text `--t13 --t15 --t16 --t17 --t20 --t22 --t24 --t26 --t28 --t34` (+ display `--d64 --d96 --d120 --d168`); spacing `--s1..--s24` (4px grid; 1/2/6px allowed); corners `--r-s 4 / --r-m 6 / --r-l 10 / --r-xl 18`. Colours ONLY in app/src/v2/css/tokens.css. |
| "Studio-level polish, every change (Nov 10)" | Keep the standard and the "keep the WOW" rule. Replace the tool: `experiments/polish-check.mjs` (TARGET=v2) for one page, `app/test/qcheck-all.mjs` for the full sweep (27 pages + 18 views x 5 widths x 2 themes; "0 new" required), `experiments/c13-check.mjs` for page length. |
| "Desktop sprite glow is off on mouse screens..." | Check against the new site's glow rules (design-system.md section 4b) and keep only what still applies. |
| "Every Preview or live publish must carry the 345 sprite files (sp/*.webp)" | After the switch: the live page carries v2.js, 7 fonts and 350 v2art/*.webp (359 files total, docs/rebuild/switch-runbook-nov19.md); check the file list after every publish. |
| "Faster flow (Nov 10): skip the Preview for today's site" / "Watch the build live (Nov 11)" | Retire: there is one site. Keep "nothing goes live without Sim's explicit go". |
| "Empty and loading screens: a rotating featured Pokémon" | Keep. Add: done in V2.underdog() (12 lowest-rated with >= 1% of teams, one a day); never beside grades. |
| Word list | Keep as is (it matches the new site). Add: "Sheet N of M", "Revisions", "Spec", "Notes" are Build's Blueprint words (Sim, Nov 20). |

## New short section to add (proposed text)
**Design system (new site, after the switch):** the single source is docs/rebuild/design-system.md (colours, type, space, glow,
motion, components, page templates, checks). Every change: one page's polish check plus its own test; every batch: the full check
(qcheck-all "0 new"). The build stops on any guard break (no !important outside reduced motion, no id selectors, type and spacing on
the scale, colours only in tokens.css). Pages keep their approved concepts: Home = The Stampede; Gifts = The Post Room; News = The
Champions Dispatch; Build = the Blueprint build sheet with a light NastyPlot touch (Sim, Nov 20: keep its "building world"); Damage
Calculator = The Arena + KO Board.

## Not decided here (ask Sim after the switch)
- Whether to move the old-site history sections (Nov 6-11 notes) into an archive file to keep CLAUDE.md short.
- Whether design-system.md needs a "draft 2" pass for everything built since Nov 17.
