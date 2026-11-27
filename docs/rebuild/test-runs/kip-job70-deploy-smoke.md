# Job 70 — Deploy Smoke Test for `nastyplot.org`

- **Branch:** `alt/gemini-deploy-smoke` (branched from `origin/alt/gemini-speed-mdday` `a41fc6dd`)
- **Script:** `experiments/deploy-smoke.mjs`
- **Mode:** Strictly read-only (`GET`/`HEAD`/`OPTIONS` only; `/api/count` beacons are intercepted locally with HTTP 204 so live counters are never incremented; any other non-read-only request is aborted and fails the run). Never submits forms.

## Usage

```bash
# Default: serves ./site (built via `node public-site.mjs site`)
node experiments/deploy-smoke.mjs

# Specific local folder
node experiments/deploy-smoke.mjs /path/to/site

# Live deployment (Dec 2-3 launch check)
node experiments/deploy-smoke.mjs https://nastyplot.org
```

Optional flags: `--dir <folder>`, `--url <baseUrl>`, `--concurrency <N>` (default `8` local, `4` remote).

## What It Checks

1. **`/robots.txt`**: HTTP 200, allows `/`, declares `Sitemap: ...sitemap.xml`.
2. **`/404`**: HTTP 404 and `<meta name="robots" content="noindex">`.
3. **`/sitemap.xml`**: HTTP 200 and non-empty `<loc>` list (`369` URLs in current public build).
4. **Every URL in `sitemap.xml`**:
   - Raw HTTP status `200`, exactly one non-empty `<title>`, `<link rel="canonical">` equals the URL.
   - Chromium load: `0` `pageerror`, `0` failed same-site requests (`status >= 400` or network failure, ignoring navigation-canceled `net::ERR_ABORTED` on idle prefetches), real first-screen content (no visible `.np-loading`, no `"This page didn't load"`, visible `h1` or text) within `5 s`.
5. **Pokémon page check** (`/pokemon/garchomp` or first `/pokemon/<slug>` in sitemap, cold context): `h1` matches the Pokémon name, clicking `[data-v2info="ab"]` opens `.np-sheet .is2 .is-lead` cleanly with `0` errors.
6. **`/team` cold-open buttons** (cold context, read-only): opens and closes `[data-v2import]` plus sample-team `[data-v2why]` / `[data-v2more]` (or `[data-v2search]` on empty Reg M-D day-one state) with `0` errors and `0` form submissions.

## Verification

### 1. Real `public-site.mjs` deploy (`./site`) — PASS (`checked` by running script)

```
$ node public-site.mjs site && node experiments/deploy-smoke.mjs
public-site: 1650 files in site (data: 14 documents, 3 empty: singles, status, info; left out: v2.js.map)
deploy-smoke: ALL PASSED (369 sitemap URLs + robots.txt + 404 + pokemon + /team cold-open in 158.6s)
```
Exit code: `0`.

### 2. Broken folder proof (`/tmp/site-70-broken`) — FAIL (`checked` by running script)

Mutations applied to a full copy of `./site`:
- Deleted `pokemon/garchomp.html` (missing sitemap page)
- Injected `<script>throw new Error("smoke-test-injected-js-error");</script>` into `about.html`

```
$ node experiments/deploy-smoke.mjs /tmp/site-70-broken
FAIL /about: 1 page error(s): smoke-test-injected-js-error
FAIL /pokemon/garchomp: HTTP 404 (expected 200)
FAIL pokemon-check (/pokemon/garchomp): h1 "Nothing here. Wrong turn." does not match "garchomp"
FAIL pokemon-check (/pokemon/garchomp): missing [data-v2info="ab"] ability button
FAIL pokemon-check (/pokemon/garchomp): failed same-site request: 404 /pokemon/garchomp
deploy-smoke: 5 FAILED (369 sitemap URLs checked in 160.3s)
```
Exit code: `1`.

### 3. Live `https://nastyplot.org` — `not checked` (not yet live / not run against external production host).
