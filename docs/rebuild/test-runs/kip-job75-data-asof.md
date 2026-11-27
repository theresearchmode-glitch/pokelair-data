# Job 75 — Home "Data as of" Date When `/data/*.json` Fails (`--split-routes`)

- **Branch:** `alt/gemini-data-asof` (branched from `origin/claude/design6` `978d8213`)
- **Problem:** Under `node public-site.mjs site` (`--split --split-routes --public`), Job 65 stubbed out the built-in `RESULTS`/`PERF_RAW` fallback snapshot. If every `/data/*.json` request failed, Home kept its prerendered numbers on screen, but `V2.asOf()` returned `""` and the footer `<span class="np-asof">` disappeared.

## Fix (`app/src/v2/shell.js`)

1. **`V2.preScreen`**: Stamps `data-np-asof="YYYY-MM-DD"` (from the build data's `RESULTS.updated` / `activePerf().updated`) onto every prerendered root element (`[data-np-pre]`), including Home and Pokémon pages.
2. **`V2.fmtAsOf` / `V2.preAsOf` / `V2.asOf`**: Caches `[data-np-asof]` on boot (`V2._preAsOf`) and uses it as the final fallback in `V2.asOf()` (after live `dataDateText()` and built-in `activePerf()`), formatting with the exact existing `"Data as of <Mon> <D>"` (+ `"(N days old)"` when `> 2` days) logic.
3. **`V2.shell`**: Reuses the exact existing `<span class="np-asof">...</span>` element in `<footer>`, rendering `V2.asOf()` when `V2.dataReady()`, or `V2.preAsOf()` while displaying a prerendered screen before `/data/` arrives. Zero wording or layout change.

## Verification

### 1. Fail-first proof on `978d8213` (`experiments/public-asof-test.mjs`, `checked`)
```
$ node public-site.mjs site && node experiments/public-asof-test.mjs site
  FAIL  Home with /data/*.json aborted: asof="", hasNumbers=true, errs=0
  FAIL  Home with /data/*.json returning 500: asof="", hasNumbers=true, errs=0
public-asof-test: 2 FAILED (exit 1)
```

### 2. After fix (`checked`)

| Suite | Command | Exit | Result |
|---|---|---:|---|
| `public-asof-test` | `node experiments/public-asof-test.mjs site` | **0** | **ALL PASSED** (`asof="Data as of Nov 24 (3 days old)."` on both aborted and HTTP 500 `/data/*.json`, `errs=0`) |
| `page-speed-check` | `SPEED_DIST=site node experiments/page-speed-check.mjs` | **0** | **10/10 PASS** (Home `443ms / CLS 0.0085 / 814.9 KB`, `/meta` `1213ms`, `/team` `477ms`) |
| `public-dataready-test` | `node experiments/public-dataready-test.mjs` | **0** | **ALL PASSED** (built-in `"Data as of Nov 1"` fallback intact without `--split-routes`, never flashed when `/data/` is 1 s late, `CLS 0.0000`, `0` page errors) |
