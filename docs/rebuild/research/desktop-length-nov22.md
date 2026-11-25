# Desktop length rule: research and proposal (HH, Nov 22; Sim: "find out what the optimal sweet spot is")

## Evidence
- Nielsen Norman Group eyetracking (2018, nngroup.com/articles/scrolling-and-attention): 57% of page-viewing time above the fold,
  74% within the first two screenfuls. Attention drops steeply after that. (checked: their article, searched Nov 22)
- Our pages (measured Nov 22, experiments/page-lengths.mjs, frozen data, preview build, "screens" = page height / window height):
  see lengths-*.json in the scratchpad; summary table below.

## Proposal (draft, for Sim)
1. The answer is on the first screen at 1440x900: the page's main thing (the number, the verdict, the list's top) visible without scrolling.
2. The must-read part fits in two screens (where 74% of attention goes).
3. Length caps at 1440x900: tool and list pages at most 3 screens; reference pages (Home, Pokémon page, This Week, Meta) at most 4.
4. Never longer than the page was before its reskin unless Sim accepts the difference (same rule as phones).
5. Use the width: at 1280+ anything that stacks into a long single column (rows, cards, panels) goes two-up or beside its neighbour.
6. Checked automatically: page-lengths.mjs joins the per-page checks; a page over its cap is a finding.

## Measured (Nov 22, 9:1x AM; experiments/page-lengths.mjs; frozen data; --v2 --preview-data --art build; sample team; first state of each page)
Screens = page height / window height. "pre" = 4f7220bb (Nov 21 morning, before the reskin); "now" = today's batch.
| page | 1440 pre -> now | 390 pre -> now |
|---|---|---|
| Speed Tiers | 2.09 -> 4.04 | 3.52 -> 3.31 |
| Test Run | 2.09 -> 3.55 | 3.11 -> 3.11 |
| Damage Calc | 1.23 -> 2.85 | 2.02 -> 3.40 |
| My Team | 2.71 -> 3.67 | 3.13 -> 4.65 |
| Pokémon page | 3.41 -> 5.22 | 4.90 -> 6.27 |
| Home (unchanged) | 5.87 | 7.73 |
| every other page | within 0.4 screens of before | within 0.2 |
