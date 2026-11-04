# NastyPlot page source

The artifact is built from these files: `node app/build.mjs` joins the parts listed in `parts.json` into `dist/page.html`.

- `src/head.html`, `src/style.css`, `src/body.html`, `src/foot.html`: page shell, styles and markup
- `src/theme/*.css`: the colour manga theme (riso, riso2, manga), appended after `polish.css`; `@R` in them is expanded by the build to a strong `:root` prefix
- `src/data/data.js`: built-in data (roster, moves, learnsets, sets snapshot)
- `src/engine/types.js`: type chart and team type engine
- `src/app/NN-*.js`: page code, one file per feature, loaded in number order
- `sp/*.webp`: inked Pokémon sprites (256×256, colour manga), published next to the page as `sp/<id>.webp` (ids in `SPRITE_ID`)

`node app/test/run.mjs` builds the page and tests every view on desktop and phone with the data in `out/`. GitHub runs it on every change to `app/`.

## NastyPlot Redesign (separate page)

`node app/build-redesign.mjs` builds `dist/redesign.html`: the same app plus the Light touch Character Select layer
(`src/redesign/select.css`, `src/redesign/select.js`, listed in `parts-redesign.json`), Pictogram type glyphs and the
redesign fonts. The live page (`node app/build.mjs` → `dist/page.html`) is unchanged. Published as "NastyPlot Redesign";
its database was seeded once from `out/` the same way the morning refresh fills the live page. See `docs/design-direction.md`.
