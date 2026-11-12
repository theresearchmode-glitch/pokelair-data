# Preview kit: how the "NastyPlot Full Redesign" artifact is built and published

Artifact: https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf (last published: version 52, Nov 11 ~10:10 PM Eastern, commit 636aa5c).

## Files here
- `index.html`: the artifact's page. It forwards straight to `foundation.html#team` (Sim, Nov 11).
- `gallery.html`: the old mock-up card gallery, published as `gallery.html`.
  **It contains two claims that are wrong for the built page** (Sim's sweep, Nov 11): "all inside the length limits" and
  "same numbers as today's site". Do not republish it as is. New wording needs Sim's OK first (visual change).
- `rebuild-preview.sh`: builds `foundation.html` (the real new site, built with `--preview-data`).
- `scripts/`: the Playwright checks used on Nov 11 night (iPhone WebKit sweeps ios*.js, iPad layout ipad.js, header fit
  boxlink.js, jump-link and suggestion-row repro bug2.js). Paths inside are the old chat's scratch folder; change them to yours.

## Files NOT here (they stay on the artifact)
The artifact also holds the mock-up pages (home, build, battle, ratings, mybox, myteam, firstvisit, sheet, sheet-forms .html),
`thumbs/`, `art/`, `tokens.css` and the 346 sprites in `v2art/` (the same files as `app/src/v2/art/`, minus meta.json).
A publish only replaces the files you pass; files left out are kept. To fetch one, use the Artifact tool's read action with its path.
The mock-up pages are built from `docs/rebuild/mocks/*.tpl.html`.

## Publish steps (only after Sim says yes to every visual change in it; see docs/rebuild/RULES.md)
1. `S=<scratch> PREVIEW=1 bash docs/rebuild/preview-kit/rebuild-preview.sh` (prints COPY-OK).
2. Copy `index.html` into `$S/redesign/`.
3. Artifact publish: file_path `$S/redesign/index.html`, url the artifact above,
   files `{"foundation.html": "$S/redesign/foundation.html"}`.
4. Artifact list, scope files: must show 387 files with 346 `v2art/*.webp`. Tell Sim the version number and the file count.
