# Meta section notes (for when the Meta pages are rebuilt)

Ideas and asks for the Meta pages (ratings, usage, teams, events, weekly, archetypes, track record; rebuild-plan.md line 74).
Read this before the Meta rebuild starts. Each item: who asked, when (by the clock), what, and what exists today.

## 1. A ranking list of the top Megas (Sim, Nov 13, written 10:52 AM Eastern by the clock)
Sim: "I want to be able to see a list of the top megas as well so that its easy for people to see whats going on in the meta.
like we have the regular pokemon ranked i also want a ranking list of the megas."
- What: beside the regular Pokémon ranking, a ranked list of the Megas (the same rating and tier words, e.g. "S tier 94"), so a
  player sees at a glance which Megas lead the meta.
- What exists today (checked in the code, Nov 13): today's Ratings page has a "Megas" filter chip (app/src/app/25-ratings-page.js
  line 46: flags 'mega' / 'nomega'), which narrows the tier board to Megas; there is no list of its own, so you have to know to
  tap the filter. On the new site, Home's "The Meta, right now." list shows the top-rated Pokémon with Megas mixed in.
- Open questions for Sim when it's designed (with pictures, rule 00b): where it sits (its own tab / switch like Top Rated /
  Hidden Gems, or a section on the Meta page, or also on Home); how many rows; whether it ranks by rating, by usage among Mega
  teams, or shows both; whether Megas also stay in the main list.
