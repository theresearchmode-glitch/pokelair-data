# Job 78 — Pre-Launch Security & Code Review

- **Date (America/New_York):** Sat Nov 28 04:47:56 AM EST 2026 (`TZ=America/New_York date`)
- **Branch reviewed (Parts A & B.7):** `origin/main` at `fa15f917625b7b6ddcce1a6201979813e8b6798b` (`fa15f917`)
- **Branch reviewed (Part B.8):** `origin/alt/home-herd` at `d3d72d47` against `origin/claude/design6` at `978d8213`
- **Review branch:** `alt/gemini-launch-review` (report only; **0 HIGH findings**, so no proposed patch commit was needed)

---

## Summary of Findings

| Severity | File:Line | One-line summary |
|---|---|---|
| **MEDIUM** | `worker/feedback-lib.mjs:22`, `wrangler.toml` | `REQUIRE_ORIGIN` is unset in `wrangler.toml`, so bare non-browser `POST /api/count` requests without `Origin`/`Sec-Fetch-Site` succeed (no Turnstile on `/api/count`). |
| **MEDIUM** | `docs/rebuild/decisions.md:2609` | Logs the Cloudflare Email Routing forwarding Gmail destination in the public repo, contrary to Sim's Nov 25 decision (`decisions.md:2569`) to keep personal/Gmail addresses out of tracked files. |
| **LOW** | `worker/feedback.mjs:25` | `405 Method Not Allowed` on `/api/feedback` omits the `Allow: POST` response header (present on `/api/count` at line 51). |
| **LOW** | `worker/schema.sql:2-8` | `feedback` table has no index on `at`, so the daily cron `DELETE FROM feedback WHERE at < ?` performs a full table scan. |
| **LOW** | `.github/workflows/test.yml:1-35` | No top-level `permissions: contents: read` declared (only `live-audit` at line 606 sets explicit permissions; other jobs inherit repo default `GITHUB_TOKEN` scope). |
| **LOW** | `.github/workflows/deploy.yml:43,47` (+ other workflows) | Official `actions/*` (`checkout@v5`, `setup-node@v5`, `upload-artifact@v4`, `github-script@v8`) use mutable major tags rather than pinned commit SHAs; `practice-deploy.yml:69` and `update.yml:69-70` interpolate `${{ vars.* }}` inside `run:` instead of `env:`. |
| **LOW** | `site/*.html` (built from `app/src/v2/`) | Two benign internal design-decision comments (`Sim, Nov 11`, `Sim, Nov 18`) remain in inline `<style>`/`<script>` blocks of built public HTML pages (no secrets or PII). |
| **LOW** | `origin/alt/home-herd` (`app/src/v2/pages/stampede-six.js:109-112`, `sd-six.css:8-15`) | `V2.sdsHerd` renders 96 `<img>` nodes (48 unique sprites, ~82 with CSS `filter`) even on phones where the 5-column grid is 20 rows tall and mostly clipped by `overflow: hidden`. |

**HIGH findings:** None (0). Launch-blocking security or correctness issues were not found.

---

## Detailed Findings

### M1 — `worker/feedback-lib.mjs:22` + `wrangler.toml` (**MEDIUM**)
- **What's wrong:** `originAllowed()` permits requests that send neither `Origin` nor `Sec-Fetch-Site` unless `env.REQUIRE_ORIGIN` is truthy. `wrangler.toml` does not set `REQUIRE_ORIGIN = "1"`. While `/api/feedback` is still gated by Cloudflare Turnstile, `/api/count` has no Turnstile check, so any bare `curl` / script without browser headers can increment daily totals and consume D1 write quota up to the 30 req/min/IP rate limit.
- **Concrete request (S3):**
  - **Input:** `curl -X POST https://nastyplot.org/api/count -H 'Content-Type: application/json' -d '{"k":"teamcheck"}'` (no `Origin`, no `Sec-Fetch-Site`).
  - **What happens now:** `originAllowed()` returns `true` (`REQUIRE_ORIGIN` is unset); Worker writes to D1 `counts` and returns `204`.
  - **What should happen:** Worker rejects bare non-browser requests with `403 {"error":"Bad origin"}`.
- **Smallest fix:** Add `[vars]` -> `REQUIRE_ORIGIN = "1"` in `wrangler.toml` (note: a determined script can still spoof `Origin: https://nastyplot.org`, so rate limiting remains the primary abuse control, but `REQUIRE_ORIGIN = "1"` blocks casual/bare scripts and matches browser-only callers).
- **Status:** checked (read `worker/feedback.mjs`, `worker/feedback-lib.mjs`, `wrangler.toml`).

### M2 — `docs/rebuild/decisions.md:2609` (**MEDIUM**)
- **What's wrong:** Line 2609 records the Cloudflare Email Routing forwarding target (`hello@ -> <redacted>@gmail.com`) in a tracked file in this public repository. `docs/rebuild/decisions.md:2569` explicitly notes Sim's Nov 25 decision to remove personal/Gmail addresses from every tracked file.
- **Concrete example (S3):**
  - **Input:** `rg -n '@gmail' docs/rebuild/decisions.md`
  - **What happens now:** Prints line 2609 containing the forwarding Gmail address.
  - **What should happen:** Only `hello@nastyplot.org` (or a generic label like `Sim's Gmail`) appears in tracked docs.
- **Smallest fix:** Replace the Gmail address on `docs/rebuild/decisions.md:2609` with `Sim's Gmail`. (Note: git history already contains it, though removing it from `HEAD` prevents casual scraping of the live repo.)
- **Status:** checked (`rg` across tracked files).

### L1 — `worker/feedback.mjs:25` (**LOW**)
- **What's wrong:** `if (req.method !== 'POST') return json({error: 'Use POST'}, 405);` on `/api/feedback` does not include the RFC 9110 `Allow: POST` header, whereas `/api/count` at line 51 sets `headers: {Allow: 'POST'}`.
- **Concrete request (S3):**
  - **Input:** `GET /api/feedback`
  - **What happens now:** Returns `405` without an `Allow` header.
  - **What should happen:** Returns `405` with `Allow: POST`.
- **Smallest fix:** Pass `{Allow: 'POST'}` as the third argument to `json(...)` on line 25 (matching line 51).
- **Status:** checked (read `worker/feedback.mjs`).

### L2 — `worker/schema.sql:2-8` (**LOW**)
- **What's wrong:** `feedback` table has no index on `at`, so the daily cron purge `DELETE FROM feedback WHERE at < ?` scans all rows.
- **Concrete input (S3):**
  - **Input:** Daily cron trigger (`0 5 * * *`) after thousands of feedback rows accumulate.
  - **What happens now:** Full table scan on `feedback`.
  - **What should happen:** Index range scan on `at`.
- **Smallest fix:** Append `CREATE INDEX IF NOT EXISTS idx_feedback_at ON feedback(at);` to `worker/schema.sql`.
- **Status:** checked (read `worker/schema.sql` and `worker/feedback.mjs:62-68`).

### L3 — `.github/workflows/test.yml:1-35` (**LOW**)
- **What's wrong:** `test.yml` does not set a top-level `permissions: contents: read` block; only the `live-audit` job (line 606) declares explicit permissions (`contents: read`, `issues: write`). All other jobs inherit the repository's default `GITHUB_TOKEN` permissions.
- **Concrete input (S3):**
  - **Input:** Any `push` or `workflow_run` triggering `test.yml` when repository default Actions permissions are read-write.
  - **What happens now:** Test jobs receive `contents: write` despite only needing read access.
  - **What should happen:** Top-level `permissions: contents: read` restricts all test jobs to read-only, while `live-audit` keeps its job-level `issues: write`.
- **Smallest fix:** Add top-level `permissions:\n  contents: read` near the top of `.github/workflows/test.yml`.
- **Status:** checked (read `.github/workflows/test.yml` and grepped `permissions:` across `.github/workflows/`).

### L4 — `.github/workflows/deploy.yml:43,47` (+ other workflows) (**LOW**)
- **What's wrong:** Workflow steps reference official GitHub actions by mutable major tags (`actions/checkout@v5`, `actions/setup-node@v5`, `actions/upload-artifact@v4`, `actions/github-script@v8`) rather than pinned commit SHAs. Additionally, `practice-deploy.yml:69` (`if [ -n "${{ vars.CF_ANALYTICS_TOKEN }}" ]`) and `update.yml:69-70` (`${{ vars.MODEL_SHADOW || '0' }}`) interpolate repository variables directly into `run:` shell commands rather than passing them through `env:`. (Repository `vars.*` are admin-controlled, not untrusted PR input, so risk is minimal.)
- **Concrete input (S3):**
  - **Input:** Upstream compromise of a mutable `@v5` tag, or a repo variable containing shell metacharacters.
  - **What happens now:** Tag resolves dynamically at workflow runtime; `vars.*` is expanded before bash parses the command.
  - **What should happen:** Actions pinned to full 40-char commit SHAs with version comments; `vars.*` passed via `env:`.
- **Smallest fix:** Pin `actions/*` to commit SHAs in `deploy.yml` / `practice-deploy.yml` first, and pass `CF_ANALYTICS_TOKEN` via `env:` on `practice-deploy.yml:69`.
- **Status:** checked (`rg -n 'uses:|\$\{\{' .github/workflows/`).

### L5 — `site/*.html` built from `app/src/v2/` (**LOW**)
- **What's wrong:** Two benign internal design-decision comments (`/* NastyPlot hosts its two fonts itself (Sim, Nov 11: ...)` and `/* Q10 (Sim, Nov 18, answer A): ...`) are preserved in inline `<style>`/`<script>` blocks of built HTML files in `site/`. No secrets, tokens, emails, or source maps are present.
- **Concrete input (S3):**
  - **Input:** `curl -s https://nastyplot.org/calc | grep 'Sim,'`
  - **What happens now:** Returns two CSS/JS design-decision comments.
  - **What should happen:** Optional tidy-up: strip internal comments during public build if desired.
- **Smallest fix:** Strip `/* ... */` comments in the inline head CSS/JS templates during `--public` build (optional).
- **Status:** checked (`node public-site.mjs site` + `rg --no-ignore` scan of `site/`).

### L6 — `origin/alt/home-herd`: `app/src/v2/pages/stampede-six.js:109-112`, `sd-six.css:8-15` (**LOW**)
- **What's wrong:** `V2.sdsHerd` emits 96 `<i>` tiles (up to 48 unique `/art-s/*.webp` sprites repeated twice, ~82 with CSS `filter: grayscale(1) brightness(.55) contrast(1.1)`) inside a rotated, masked container. On phones (`<= 699.98px`), `grid-template-columns: repeat(5, minmax(0, 1fr))` makes the grid 20 rows tall, most of which is clipped by `.sds { overflow: hidden }`, yet all 96 `<img>` elements remain in the DOM near the viewport and trigger decode/paint work on scroll.
- **Concrete input (S3):**
  - **Input:** Scrolling to Band 2 on Home on a 390px phone.
  - **What happens now:** Browser lays out 96 filtered `<i>` tiles (20 rows) and fetches/decodes up to 48 sprites even though over half the rows are clipped.
  - **What should happen:** Phones skip rendering tiles beyond the visible rows.
- **Smallest fix:** Add `@media (max-width:699.98px){.sds-herd i:nth-child(n+41){display:none}}` in `app/src/v2/css/sd-six.css`.
- **Status:** checked (`git diff origin/claude/design6..origin/alt/home-herd`, read `shell.js:39-44`, `kit.js:139`, `tokens.css:97`).

---

## Section-by-Section Verification Log

### PART A.1 — The Worker (`worker/feedback.mjs`, `worker/feedback-lib.mjs`, `worker/schema.sql`, `wrangler.toml`)
- **Input validation & size limits:** checked (read code + ran tests). `readCapped` enforces byte caps even without `Content-Length` (`16384` bytes `/api/feedback`, `256` bytes `/api/count`). Feedback text 3–2000 chars, `kind` allowlisted (`bug|confusing|idea|like|mistake`), `page` validated against strict route regex `^[a-z0-9=/_.%-]{1,60}$` (rejects emails/phones). Count `k` allowlisted (`teamcheck` only).
- **SQL injection:** checked (read code). 100% parameterized D1 `prepare(...).bind(...)`; zero string concatenation into SQL.
- **Rate limiting:** checked (`wrangler.toml` + `feedback.mjs`). `FB_LIMIT` (5/60s) on `/api/feedback` and `CNT_LIMIT` (30/60s) on `/api/count`, keyed by `CF-Connecting-IP` (not stored in D1). Note: fail-open if binding missing in local dev (`if (env.FB_LIMIT)`).
- **CORS / Origin checks:** checked. No `Access-Control-Allow-Origin` header (same-origin only). `originAllowed()` checks `Origin` / `Sec-Fetch-Site`, but `REQUIRE_ORIGIN` is unset in `wrangler.toml` -> **M1**.
- **Privacy & storage:** checked. `scrubContact()` strips plain & spelled-out emails, phone numbers, and `@handles` before D1 insert. D1 stores only `(at, page, kind, text)` and `(day, k, n)` — no IP, UA, cookies, or user IDs. Daily cron purges feedback older than 180 days.
- **Error handling:** checked. Unexpected exceptions return generic `503 {"error":"Try again later"}` without stack traces or SQL details.
- **Method handling:** checked. `POST` only on both routes; `/api/count` returns `405` + `Allow: POST`, `/api/feedback` returns `405` without `Allow` -> **L1**.
- **Worker tests:** checked — `experiments/feedback-worker-test.mjs` -> `ALL PASSED`; `experiments/count-worker-test.mjs` -> `ALL PASSED (36)`.

### PART A.2 — Deploy & CI Workflows (`.github/workflows/*.yml`)
- **Secrets & echoing:** checked (`rg` + read `deploy.yml`, `practice-deploy.yml`, `update.yml`). `CLOUDFLARE_API_TOKEN` and `NP_PID_KEY` are only passed via `env:` on the specific steps that need them, never echoed, and never exposed to `npm ci` or build steps.
- **Branch & PR deploy guards:** checked. Zero workflows trigger on `pull_request` or `pull_request_target`. `promote.yml` triggers only on `workflow_run` of `"Test NastyPlot page"` on `branches: [main]` with `conclusion == 'success'` and fast-forwards `live` only (`--is-ancestor`). `deploy.yml` checks `vars.DEPLOY_ENABLED == 'true'`, checks out `ref: live`, and requires `workflow_dispatch` or `Promote to live` success on `main`. `practice-deploy.yml` is `workflow_dispatch` only and deploys solely to `nastyplot-practice`.
- **Rollback path:** checked (`deploy.yml:38-42, 69-75`). Manual `workflow_dispatch` with `rollback: true` runs `wrangler rollback --name nastyplot`; post-deploy smoke failure automatically rolls back.
- **`${{ github.event.* }}` in `run:`:** checked (`rg` across all 9 workflow files). Only `promote.yml:25` uses `SHA="${{ github.event.workflow_run.head_sha }}"` (a GitHub-generated 40-hex commit SHA, safe). No untrusted event text (PR titles, branch names, issue bodies, commit messages) enters any `run:` block.
- **Permissions & action pinning:** checked -> **L3**, **L4**.

### PART A.3 — Built Public Site (`node public-site.mjs site`)
- **`site/_headers`:** checked (`cat site/_headers`). Strict CSP: `default-src 'none'; script-src 'self' 'sha256-...' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests`. Also sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`, `Cross-Origin-Opener-Policy: same-origin`, `X-Frame-Options: DENY`, and `X-Robots-Tag: noindex` on `/v2`, `/404`, `/pokemon/404`.
- **Leak scan of `site/`:** checked (`find` + `rg --no-ignore` on `site/`). `0` source maps (`v2.js.map` explicitly left out), `0` `.env`/keys/tokens/emails/`pokelair`/`theresearchmode`/`firebase`/`googleapis.com`. Two benign CSS/JS design-decision comments present -> **L5**.
- **`robots.txt` & `sitemap.xml`:** checked (`cat site/robots.txt`, `wc -l`/`head`/`tail` `site/sitemap.xml`). `robots.txt` allows `/` and points to `https://nastyplot.org/sitemap.xml`; `sitemap.xml` has 372 lines (369 URLs under `https://nastyplot.org/`).
- **Tests:** checked — `experiments/public-site-test.mjs` -> `public-site-test: all passed`; `experiments/privacy-public-test.mjs` -> `privacy-public: all passed`.

### PART A.4 — Page Code XSS / `innerHTML` Audit & Playwright Verification
- **Static audit (`app/src/v2/**`, `app/src/app/**`):** checked (`rg` + inspected `team.js`, `compare.js`, `home.js`, `box.js`, `feedback.js`, `owner.js`, `events.js`, `postroom.js`, `06-helpers.js`, `45-team-links.js`, `bridge.js`, `infosheet.js`). Team names (`teamTitleFor`, `t.name`, `lo.name`, `x.n`), Showdown exports, shared team link names, `goneNote`, feedback drafts/context, `V2.kItem`/`V2.kAbil`, `toast()`, and `data/*.json` fields (event names, gift names, URLs validated via `V2.safeUrl` https-only) all pass through `V2.esc` / `esc` or `textContent`. `decodeTeam` strictly allowlists species (`byName`), abilities (`p.a`), and items (`pasteItemOK`).
- **Playwright verification on `app/dist/v2.html` (`--v2 --preview-data`):** checked with `<img src=x onerror=alert(1)>`:
  - **Team name (Save Team + Saved Teams sheet):** Rendered literally as `<img src=x onerror=alert(1)>` in `h1.tm-name` and `.svt2-card h3`; `0` alerts, `0` `img[src="x"]` elements, `0` page errors.
  - **Showdown import (`<img src=x onerror=alert(1)> (Garchomp) @ Life Orb ...`):** Imported cleanly as Garchomp (nickname ignored); `0` alerts, `0` `img[src="x"]` elements, `0` page errors.
  - **Team-code URL link (`#team=<base64url>` with `n: "<img src=x onerror=alert(1)>"`):** Shared team sheet `.shd2 h2` rendered literally as `<img src=x onerror=alert(1)>`; clicking Load Team succeeded cleanly; `0` alerts, `0` `img[src="x"]` elements, `0` page errors.

### PART A.5 — Public Repository Secret & PII Scan
- **Private keys / API tokens (`BEGIN PRIVATE KEY`, `AKIA...`, `ghp_`, `github_pat_`, `sk-`, `xox*`, `AIza...`):** checked — `0` hits.
- **Tracked `.env`, `.pem`, `.key`, `.p12` files:** checked (`git ls-files`) — `0` hits (`none`).
- **Emails in code & workflows (excl. `package-lock.json`, `out/`, `docs/`):** checked — `18` hits, all benign (`hello@nastyplot.org`, `pokelair-bot@users.noreply.github.com`, or synthetic test strings like `kid@gmail.com` / `kid.player@example.com`).
- **Personal email domains (`@(gmail|yahoo|outlook|hotmail|icloud|proton|me.com|live.com)` across tracked files excl. `*.html`, `package-lock.json`, `out/`):** checked — `6` hits total: 5 synthetic test fixtures + **1 real forwarding Gmail address** at `docs/rebuild/decisions.md:2609` -> **M2**.
- **US-style phone numbers in `docs/`:** checked — only synthetic `555-123-4567` in `docs/rebuild/kip-job34-files.txt:1606` (plus a false-positive screen-width list in `build-sheet-restyle-nov20.md:55`).

### PART A.6 — `npm audit`
- **`npm audit --omit=dev`:** checked — `found 0 vulnerabilities` (exit `0`). **Zero** production/runtime vulnerabilities reach the public site (the public site is static HTML/CSS/JS built from zero runtime npm dependencies).
- **`npm audit` (all deps, dev tools only):** checked — `13 vulnerabilities (2 low, 3 moderate, 7 high, 1 critical)` (exit `1`), all in dev/build/test packages (`pokemon-showdown` transitive chain: `@tootallnate/once`, `nodemailer`, `tar`, `uuid`; plus `esbuild <=0.24.2` dev-server advisory and `playwright <1.55.1` browser-download TLS advisory). None of these ship to `site/` or run in Cloudflare Workers.

### PART B.7 — 3-Day `origin/main` Diff Code Review
- **Scope:** `git log --since="2026-11-25" --oneline origin/main` spans from `b19b8044` (`Limitless data 2026-11-25`) through `fa15f917` (includes `572622d5` "The switch: merge the redesign into main" plus 24 files / 698+ / 200- in `572622d5..fa15f917`).
- **Checked (`public-site.mjs`, `app/crit-css.mjs`, `app/static-pages.mjs`, `app/build.mjs` `--cf-analytics`, `app/src/v2/pages/pubhome-f3.js`, `app/src/v2/pages/sugs.js`, `app/src/v2/shell.js`):**
  - **Empty data handling:** checked (`pubhome-f3.js:16-40`, `public-site.mjs:48-62`). `V2.f3Data` safely falls back when `homeChamp()` is empty, skips `against 0 real tournament teams` when `teams === 0`, and `public-site.mjs` writes `null` for unpopulated `META_KEYS` (`singles`, `status`) so the browser gets zero 404s.
  - **Timezone (S2):** checked (`pubhome-f3.js:13,19,37`). `V2.f3Date` anchors `YYYY-MM-DD` at `T12:00:00Z` with `timeZone: 'UTC'` (no off-by-one day shift in negative UTC offsets). `V2.REG_START_MD` compared against `Date.now()` via `Date.parse`.
  - **CSS pruning & CSP loader (`app/crit-css.mjs`):** checked. `CSS_LOADER_SCRIPT` is identical across pages (single SHA-256 hash in `_headers`), handles both already-loaded `l.sheet` and `load`/`error` events, plus `<noscript>` fallback.
  - **Dead code:** checked. Unused `V2.f3Seo` and duplicate `V2.tip` were already cleaned up in `572622d5..fa15f917`.
  - **Not checked in full:** line-by-line review of all 1,392 files from the initial `claude/design6` switch merge (`b19b8044^..572622d5`); focused on security-critical paths (Part A) and post-switch diffs (`572622d5..fa15f917`).

### PART B.8 — `origin/alt/home-herd` (`d3d72d47`) vs `origin/claude/design6` (`978d8213`)
- **Empty / partial data safety:** checked (`stampede-six.js:109-112`). `V2.sdsHerd` wraps `V2.ratedRows()` / `V2.raNums()` (both in main bundle: `shell.js:358`, `kit.js:139`) in `try/catch`, handles `mine || []`, and returns `''` if `rows.length < 12` (so Day-1 empty usage or partial data never throws or loops infinitely in `while (list.length < 96)`).
- **Accessibility:** checked. Wrapped in `<div class="sds-herd" aria-hidden="true">` with CSS `pointer-events: none`; `V2.mon(x.n, {bare: true, iw: 80})` (`shell.js:39-43`) emits only `<div>` / `<i>` / `<img alt="" loading="lazy" decoding="async">` — zero buttons, zero links, zero tab stops. Respects `@media (prefers-reduced-transparency:reduce){.sds-herd{display:none}}`.
- **Leaks & performance:** checked. Pure HTML string (no listeners/timers/leaks); `--sd-mask` is defined in `tokens.css:97`. Phone DOM/paint note logged as **L6**.
- **Tests updated (`app/test/v2-minors.mjs`):** checked. `F3-2` cap raised from `4` to `4.3` screens at 1440x900 and `Stampede polish 1b` updated to check per-row alignment (`rowSpread` with 40px row gap) for Sim's Nov 28 two-rows-of-three decision.

---

## Commands Run (with exact last line)

1. `node experiments/feedback-worker-test.mjs` (exit `0`)
   - Last line: `ALL PASSED`
2. `node experiments/count-worker-test.mjs` (exit `0`)
   - Last line: `ALL PASSED (36)`
3. `node public-site.mjs site` (exit `0`)
   - Last line: `public-site: 1650 files in site (data: 15 documents, 2 empty: singles, status; left out: v2.js.map)`
4. `node experiments/public-site-test.mjs` (exit `0`)
   - Last line: `public-site-test: all passed`
5. `node experiments/privacy-public-test.mjs` (exit `0`)
   - Last line: `privacy-public: all passed`
6. `node app/build.mjs --v2 --preview-data` (exit `0`)
   - Last line: `built dist/v2.html (4579 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)`
7. `node <scratch>/xss-check.mjs` (Playwright XSS check on `app/dist/v2.html`, exit `0`)
   - Summary: `alerts: 0, pageErrors: [], injectedImgsAfterSave: 0, injectedImgsInSavedSheet: 0, injectedImgsAfterImport: 0, injectedImgsInSharedSheet: 0, injectedImgsAfterSharedLoad: 0`
8. `npm audit --omit=dev` (exit `0`)
   - Last line: `found 0 vulnerabilities`
9. `npm audit` (exit `1`)
   - Last line: `13 vulnerabilities (2 low, 3 moderate, 7 high, 1 critical)` (followed by remediation note; last output line: `a different dependency.`)
10. `rg -in -g '!*.html' -g '!package-lock.json' -g '!out/**' '@(gmail|yahoo|outlook|hotmail|icloud|proton|me\.com|live\.com)' . | wc -l` (exit `0`)
    - Last line: `6`
11. `git ls-files | grep -E '(^|/)\.env|\.pem$|\.key$|\.p12$' || echo "none"` (exit `0`)
    - Last line: `none`
12. `TZ=America/New_York date` (exit `0`)
    - Last line: `Sat Nov 28 04:47:56 AM EST 2026`
