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
