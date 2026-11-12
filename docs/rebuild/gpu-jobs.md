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

## Edge check review (main chat, Nov 10)
Reviewed docs/rebuild/art/edge-check.png (commit 2619980). APPROVED: use the "after" treatment (edge colour bled in from the
body, alpha eroded 1 px, re-feathered 0.6 px). Before had a clear pale rim on Dusk (Sneasler, Charizard's wing, Darkrai);
after has none, and at 1x the art is just as sharp. Go ahead with step 3 (all 346), with two additions:
- Thin parts: the 1 px erosion can thin or erase very fine details (Kingambit's white wisps are the thinnest seen). For
  every sprite, compare opaque area before vs after; list any that lose more than 3% and keep the un-eroded alpha for those
  (bleed only), so no detail disappears.
- In the contact sheet, put those listed sprites first so they're easy to review.

## Full upscale review (main chat, Nov 10)
Reviewed commit 9f392f5: 346 of 346 present (docs/rebuild/art/up1024, 24 MB, 52 s on the 3080), contact sheet on light and
Dusk. APPROVED for the rebuild. Side-by-side at the same size on Dusk (Garchomp 445): the new art is crisp with clean edges
and no halo; today's 512 px inked sprite is softer with a faint rim. 48 thin-detail sprites kept the un-eroded edge (bleed
only), as asked; none show a rim on the sheet. Design note taken into docs/rebuild/design-system.md: near-black Pokémon
(10250-10252, 491, 823) vanish on Dusk without a panel. Today's live site keeps its current sprites; the new art ships with
the rebuild (R3), not before.

Windows note (Nov 11): the same-*.mjs proofs, full-check.mjs and polish-check.mjs used Linux-only paths and failed in seconds on
Windows ("NO RESULT LINE"). Fixed: fileURLToPath / path.resolve / pathToFileURL, as harness.mjs already did. Pull before running.

## Job 3: the full check run (whenever the main chat asks; Sim, Nov 11)
The main chat names a base commit (the last fully checked one). Then:
1. `git pull origin claude/design6`, then `npm ci` only if node_modules is missing or `node app/test/run.mjs` can't find playwright.
2. `node experiments/full-check.mjs <base> <label>` (1-2 hours; it changes no code). It writes
   `docs/rebuild/test-runs/full-check-<label>.txt`.
3. Commit only that file and push. Report the summary lines (every "==" heading with its result line).
Fix only setup (a missing install, a path), never the code or the tests. If a check fails, don't retry it more than once: report
it exactly as printed.
