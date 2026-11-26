# Heading sizes on every page (audit Group 2 item 3), measured Nov 22
Measured: experiments-style script heads.cjs on the built page (copy tm, v2-hm.html), 25 pages, 1440 and 390 wide, visible h1/h2/h3 font sizes in px.
Clock at write: time: 11:04 AM (11:04:26)  date: Sun Nov 22, 2026

## What it shows (checked)
- Reskinned kit pages agree already: h1 84 / h2 40 at 1440, h1 41 / h2 26 at 390
  (team, calc, practice, Test Run, speed, types, archetypes, Pokémon page, compare).
- Pages not reskinned yet agree with each other on the OLD scale: h1 64 / h2 28-34, phone h1 34 / h2 24-28
  (battle, meta, usage, sets, tournaments, events, gifts, track, method, about, feedback, box).
  Note: usage/battle/sets are merged reskins but keep the 64/28 header; check whether that was approved that way (not yet checked).
- So most of the "too many sizes" is the reskin half done, not a separate problem. It closes as each page is reskinned.
- Real outliers:
  - Home: h2 in 4 sizes (34/53/68/75), h3 in 6 sizes. Home is Sim's call (DESKTOP LENGTH RULE note).
  - News: h1 71, h2 17/20/22/65 (in the reskin queue; fix there).
  - This Week: h1 120 (in the reskin queue).
  - Track Record: an h2 at 15px (in the reskin queue).
  - Winning Teams: h3 in 4 sizes (13/17/22/34); being reskinned now by helper hW1.
- Build: no visible h1 on purpose (hidden h1 "Build", class vh, build-plot.js:32/80). Fine for screen readers.

## Plan
No separate site-wide change. Each reskin uses the kit scale (h1 84/41, h2 40/26, h3 one size); the reskin checklist now says so.
