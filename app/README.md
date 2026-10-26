# NastyPlot page source

The artifact is built from these files: `node app/build.mjs` joins the parts listed in `parts.json` into `dist/page.html`.

- `src/head.html`, `src/style.css`, `src/body.html`, `src/foot.html`: page shell, styles and markup
- `src/data/data.js`: built-in data (roster, moves, learnsets, sets snapshot)
- `src/engine/types.js`: type chart and team type engine
- `src/app/NN-*.js`: page code, one file per feature, loaded in number order

`node app/test/run.mjs` builds the page and tests every view on desktop and phone with the data in `out/`. GitHub runs it on every change to `app/`.
