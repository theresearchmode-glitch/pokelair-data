# Full polish sweep, Nov 19 (8e18eb97, TARGET=v2, all views, 320-2560, light and dark)
Command: TARGET=v2 node experiments/polish-check.mjs polish-full-nov19.json -> "polish check: spill 2, lone 32, tap 2, lineh 1, glow 3, space 32; page errors 0; 151s"
Read by eye (Claude, 2:2x PM):
- spill 2: empty My Team at 320, the six top picks' tiles: every word inside its tile in the screenshot; all six measure the same +8px,
  so the check reads a box narrower than the text block. Not a defect (judged by eye; picture scratchpad te320.png).
- tap 2: "Build Me a Team ›" / "Import a Team ›" in the sample note: 20px boxes with an extended tap layer; CI's tap-size C8 passes them.
- glow 3: "Top tier" band word in night mode (team, sheet, guide). lineh 1: Team Sheet small spans at 1.3. Long-standing; not checked
  against an older sweep (no stored baseline with these categories). For Sim's final review.
- lone 32 / space 32: mostly the footer's 5 links wrapping 4+1 or 3+2 at some widths, and the style guide (Preview only). Footer worth a look.
Not checked: a baseline comparison (no earlier full-sweep JSON in the repo with these categories).
