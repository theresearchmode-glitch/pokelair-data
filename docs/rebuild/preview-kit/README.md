# Preview kit: how the "NastyPlot Full Redesign" artifact is built and published

Artifact: https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf (last published: version 53, Nov 12 ~8:40 AM Eastern, commit 20d0404; 394 files incl. 7 fonts; 400 since v111 on Nov 13: + 6 real-page thumbs for Home, Build, Battle).

## Files here
- `index.html`: the artifact's page. It forwards straight to `foundation.html#team` (Sim, Nov 11).
- `gallery.html`: the "All mock-ups" page, published as `gallery.html`. Since Nov 18 (design review #16) it lists the 25 real pages
  plus My Team empty and the style guide (27 cards, no mock-ups left). Its card pictures are `thumbs/<name>-light.jpg` and
  `-dusk.jpg` here (1280x800 shots of a `--v2 --preview-data` build, saved 640x400 JPEG). pubprep.sh copies both into
  `$S/pub/redesign/`; publish them with the page (`"gallery.html"` and each `"thumbs/<file>.jpg"` in `files`).
- `rebuild-preview.sh`: builds `foundation.html` (the real new site, built with `--preview-data`).
- `scripts/`: the Playwright checks used on Nov 11 night (iPhone WebKit sweeps ios*.js, iPad layout ipad.js, header fit
  boxlink.js, jump-link and suggestion-row repro bug2.js). Paths inside are the old chat's scratch folder; change them to yours.

## Files NOT here (they stay on the artifact)
The artifact also holds the mock-up pages (home, build, battle, ratings, mybox, myteam, firstvisit, sheet, sheet-forms .html; no longer linked from gallery.html),
the mock-ups' old thumbs, `art/`, `tokens.css` and the 346 sprites in `v2art/` (the same files as `app/src/v2/art/`, minus meta.json).
A publish only replaces the files you pass; files left out are kept. To fetch one, use the Artifact tool's read action with its path.
The mock-up pages are built from `docs/rebuild/mocks/*.tpl.html`.

## Publish steps (only after Sim says yes to every visual change in it; see docs/rebuild/RULES.md)
1. `S=<scratch> PREVIEW=1 bash docs/rebuild/preview-kit/rebuild-preview.sh` (prints COPY-OK).
2. Copy `index.html` into `$S/redesign/`.
3. Artifact publish: file_path `$S/redesign/index.html`, url the artifact above,
   files `{"foundation.html": "$S/redesign/foundation.html", "v2.js": "$S/redesign/v2.js", "preview.json": "$S/redesign/preview.json"}`
   (Nov 18: the Preview build is `--split`; without v2.js the page never draws, without preview.json it has no data) plus the 7 font files, each as `"fonts/<name>.woff2":
   "$S/redesign/fonts/<name>.woff2"` (Nov 12: the fonts are hosted by NastyPlot itself; the page has no Google Fonts link).
4. Artifact list, scope files: must show 394 files (Nov 18: plus v2.js and preview.json, and the later additions in the header above): 346 `v2art/*.webp` and 7 `fonts/*.woff2`. Tell Sim the version number and
   the file count. (The first publish with the fonts adds them; later publishes keep them unless they change.)
   The list must also show `v2.js` and `preview.json` (review Nov 18, C5/C6), each the same size as the copy in `$S/redesign/`: without
   v2.js the page shows "This page didn't load."; without preview.json it shows "This Preview couldn't read today's data" and the
   built-in numbers. A link goes to Sim only when all of these are in the list.
