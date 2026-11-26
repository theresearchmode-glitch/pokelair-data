# One command for a new Pokémon's pictures: experiments/add-sprites.mjs (reg-md-plan Phase 0.3), Nov 24

Branch `alt/sprites` from `claude/design6` at **739ff579** (rebased from 0d681a32; the two differ only by gen-roster.mjs + docs).

`node experiments/add-sprites.mjs <PokéAPI id | Showdown name | id:Name> [...] [--write] [--crowd]`

## What each picture is and how it's made today (each rule checked against the repo's own files)
| File | Used by | How | Check |
|---|---|---|---|
| app/sp/<id>.webp (512px, navy ink outline) | old site | PokéAPI HOME render → `python3 -I app/sprite-ink.py` | rebuilt sp/6 and sp/10035 **byte for byte** (`cmp`) |
| docs/rebuild/art/up1024/<id>.webp (1024px, q90) | source of the new site's art | HOME render → Real-ESRGAN `realesrgan-x4plus-anime` x4 **on Sim's PC GPU** → edge clean (bleed, erode 1px, feather 0.6px; bleed only if >3% area lost) | can't run here; the script prints the PC command. The edge clean is in experiments/add-sprites.py, written from the approved recipe in gpu-jobs.md; the PC script isn't in the repo, so it is **not proven byte-equal** |
| app/src/v2/art/<id>.webp (384px, q84 m4) + meta.json | new site | `python3 experiments/v2-art.py --meta-only` (writes only missing files) | rebuilt **16 of 20** sampled byte for byte; the other 4 same size, mean pixel difference 0.6-0.8 / 255 (an encoder version difference, my guess) |
| app/src/v2/art-s/<id>.webp (240px, q88 m6) | new site (small sprites) | no script existed; found by testing: fit 240 from the 384px art | rebuilt **20 of 20** sampled byte for byte |
| SPRITE_ID in app/src/app/15-visual-helpers.js | both sites | hand edit | printed; added with `--write` (after the base species' entries) |
| app/src/v2/art/crowd-*.webp + crowd.json | Home hero crowd | `python3 -I experiments/v2-crowd-sheets.py` | run with `--crowd`, else the line to run is printed |

meta.json: v2-art.py recomputes every entry, and here one rounds 1 step differently (981: 132 → 131). So the command keeps the old
text byte for byte and only appends a new Pokémon's entry, exactly as Python wrote it.

## Checks
- `node experiments/add-sprites.mjs 6` (an existing Pokémon): `git status` shows no change; every file it rewrote (sp/6, art/6, art-s/6,
  meta.json) is byte-identical.
- With art/6, art-s/6 and the "6" meta entry deleted, the same command rebuilt both files byte-identical and appended
  `"6":[251,161,35,0.002]` (the same values).
- `node experiments/add-sprites.mjs 10311` (Mega Heatran): named "Heatran-Mega" from PokéAPI; made app/sp/10311.webp; "new site: WAITING
  for the upscale (needs Sim's PC GPU)"; printed `realesrgan-ncnn-vulkan.exe -i 10311.png -o 10311-x4.png -n realesrgan-x4plus-anime -s 4
  -g 0` and where to put the result; printed the SPRITE_ID line `"Heatran-Mega":10311`. With `--write` it added it (at the end: no base
  Heatran entry).
- `node app/build.mjs --v2 --preview-data` with Heatran's sprite and SPRITE_ID in: "v2 guard: clean"; the line is in the built page. Then
  Heatran was taken back out (it isn't in the roster); "v2 guard: clean" again.
- Pictures (pictures/ in the zip, labelled): Mega Heatran beside Mega Charizard Y at the real file sizes, day (#FBFAF7) and night (#1B1A22).
  Heatran's sp/ is the real output. Its art/ and art-s/ are a **STAND-IN** (2x Lanczos + the edge clean, not the GPU upscale), labelled
  so on the pictures and never written to app/.

## Needs Sim's PC
The 4x upscale. Everything after it runs here: put the x4 PNG at experiments/out/sprites/x4/<id>.png and run the command again.
