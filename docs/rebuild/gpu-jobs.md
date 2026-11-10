# Jobs for the local chat on Sim's PC (RTX 3080)

Sim, Nov 10: a local Claude Code chat on her Windows PC can use the RTX 3080 for image work. This file is that chat's brief.
Rules for that chat: CLAUDE.md applies. Work on branch `claude/design6` (pull first). Never edit `app/`, never publish an
artifact, never touch the live site. Commit only into the folders named below, push, and say what you did. No model
identifiers in commits.

## Job 1: save the redesign chat's files (do this first; Windows may clear the temp folder)
Copy everything from
`C:\Users\simra\AppData\Local\Temp\claude\469e588db1a22171\bb823294-4095-4fd5-ba18-59326258ebc4\scratchpad`
into `docs/redesign/source/` in the repo, EXCEPT the Real-ESRGAN tool folder `esrgan\` (binaries, keep it on the PC in a
safe place outside Temp, e.g. `C:\Users\simra\tools\realesrgan\`, and note the path in docs/redesign/source/README.md).
Keep `out/` (full-size renders, incl. nastyplot-mybox-concept.png and nastyplot-mybox-iphone.png), `up/` and the templates
and scripts. If the total is over ~150 MB, keep the PNGs in `out/` but convert `up/` and other big PNGs to WebP quality 92.

## Job 2: upscale every Pokémon (clean, no outline)
Sim chose (R0, Nov 10): clean sprites with no outline, all 345 upscaled with `realesrgan-x4plus-anime`.
1. Sources: the PokéAPI HOME renders, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/<id>.png`
   for every id in `SPRITE_ID` in `app/src/app/15-visual-helpers.js` (345 of them) plus Darkrai, id 491. Download to a
   work folder outside the repo. Report any id that fails to download; do not substitute art from anywhere else.
2. First a test of 6 (Sneasler 903, Garchomp 445, Whimsicott 547, Kingambit 983, Charizard 6, Darkrai 491): upscale x4,
   save at 1024 px, then make a check sheet with each one on light #FBFAF7 and on the dark Dusk background #1B1A22, at
   1x and zoomed 3x on an outer edge. Look for the light fringe/halo on the dark side. If there is one, fix it by cleaning
   the alpha edge (e.g. erode the alpha by 1 px at 1024 and re-feather, or premultiply-alpha before upscaling) and show
   the before/after. Commit the sheet to `docs/rebuild/art/edge-check.png` and push, then STOP and tell Sim, so the main
   chat can review it.
3. After the main chat (or Sim) says the edges are fine: run all 346. Save each as WebP, 1024 px on the long side, quality
   90, transparent, trimmed and centred the same way for all, to `docs/rebuild/art/up1024/<id>.webp`. Also make
   `docs/rebuild/art/contact-sheet.webp` (all 346 small, on light and on dark). Commit and push. Report: count done,
   time taken, total size, any that look wrong (list ids).
