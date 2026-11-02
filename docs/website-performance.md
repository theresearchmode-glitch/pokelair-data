# Website performance plan (for the move to Vercel)

Status: plan only, nothing implemented. Today NastyPlot is one built page (`app/dist/page.html`, about 2 MB, about 555 KB
gzipped) published as a claude.ai artifact, with its data arriving as artifact-database documents (`meta/<key>`). On a
static host the same app can load much less on every visit after the first, and start drawing sooner on the first.

## Where the time goes today (measured Nov 2, cold load, fake database, Chromium)

Phone = 390 px, 4x CPU slowdown. Median of 5 runs, in `scratchpad/nov/prelaunch/perf-*.json`.

| Step on a phone | About |
|---|---|
| HTML + 420 KB of CSS parsed, the 1.5 MB script compiled | 0.8–1.0 s |
| First full draw of the app (`render()`: team checks, ratings, threat report) | 0.6–0.8 s |
| Data documents arrive, numbers cleaned, one more full draw | 1–1.5 s, in pieces |

The script and CSS are the same on every visit, but because they are inside the HTML they are downloaded and parsed again
every time and can never be cached on their own.

## 1. Split the page into cached files

Build (`app/build.mjs`) writes, instead of one file:

| File | Contents | Changes |
|---|---|---|
| `index.html` | the body markup, a tiny inline boot script, `<link>`/`<script>` tags | every release |
| `app.<hash>.css` | style.css + concept-h.css + polish.css | release |
| `app.<hash>.js` | all of `src/app/*.js` and `src/engine` | release |
| `game.<hash>.js` | `src/data/data.js`, move/items/logos (the big static tables, about 700 KB) | rarely (new regulation, sets refresh) |
| `data/<key>.<date>.json` | today's `out/*.json` the page uses (the `meta/<key>` documents) | daily |
| `sp/<id>.webp` | sprites (already separate files) | rarely |

- The file name carries a content hash, so a file can be cached "forever" and a new release simply references new names.
- Use `<script defer>` for the JS so HTML parsing never waits; keep the data tables as `JSON.parse('…')` (already done in
  the build, about 15% faster to evaluate than an object literal) or ship them as `.json` and `fetch` them.
- Data: replace the artifact database's `onSnapshot` calls in `03-persistence.js` with `fetch('data/manifest.json')`, which
  lists today's file per key (`{"results": "data/results.2026-11-02.json", …}`). The manifest is tiny and uncached; the dated
  data files are cached forever. Keep the same clean* functions and the same "missing document" behaviour.
- Saved teams, feedback and usage counts need a small backend later (they live in the artifact database today); until then
  the browser-storage fallback already in `03-persistence.js` keeps teams working on one device.
- Optional later: split rarely used pages (damage calc, practice, gauntlet, archetype guides) into their own JS chunks loaded on
  first visit; the existing `lazy()` / "render on first visit" hooks are the natural seams.

## 2. Compression

- Vercel serves Brotli automatically for text files it hosts; nothing to configure. Brotli is about 15–20% smaller than gzip
  for this JS/CSS/JSON.
- For the largest files, pre-compress at build time with maximum Brotli (`.br`) only if measurements show a gain; Vercel's
  on-the-fly compression is usually close.
- Images: sprites are already WebP; keep `loading="lazy"` / `decoding="async"` for sprites not yet seen (15-visual-helpers.js).

## 3. Cache headers (`vercel.json`)

```json
{
  "headers": [
    { "source": "/(.*)\\.([0-9a-f]{8,})\\.(js|css)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/data/(.*)\\.(\\d{4}-\\d{2}-\\d{2})\\.json", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/sp/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=2592000" }] },
    { "source": "/data/manifest.json", "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] },
    { "source": "/", "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] }
  ]
}
```

- HTML and the data manifest always revalidate (cheap 304s), so a release or the morning data shows up at once.
- Everything with a hash or a date in its name is immutable.

## 4. Fonts

- Self-host the four Google Fonts (Archivo, Anton, Space Mono, Permanent Marker, plus the Unbounded logo subset) as WOFF2
  with `font-display: swap`, `<link rel="preload">` the two used above the fold (Archivo 400/700, Anton), and subset to Latin.
  That removes the render-blocking request to fonts.googleapis.com and the third-party request mentioned on the Privacy page.

## 5. Data pipeline

- The daily workflow (`.github/workflows/update.yml`) already builds `out/*.json` and runs the health gate. On Vercel, the
  deploy would copy the page's keys to `public/data/<key>.<date>.json` and write the manifest (a short script), then trigger a
  deploy (Vercel's Git integration does this on the data commit). This replaces the morning copy task.
- Keep each file under about 250 KB; `limitless.json` results could move from one document to per-section files if it grows.

## 6. How to check

- Keep `experiments/loadtime.mjs` / the `perf.mjs` harness: cold first visit and warm second visit, phone (4x CPU) and desktop.
- Lighthouse (mobile) on the preview deployment: target first contentful paint under 1.8 s and total blocking time under
  600 ms on a mid-range phone.
