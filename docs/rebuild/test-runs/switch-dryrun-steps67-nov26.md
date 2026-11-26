# Switch dry run, runbook steps 6-7 (Job T), Thu Nov 26, 2026, 10:58 AM Eastern (now.sh)
HH's helper. **Nothing was published. No artifact, scheduled task, main, design6, live or Cloudflare was changed.**
Read only: Artifact `list` (files) and `read` (index.html) of the live artifact; get_trigger of the data refresh.
Worktree at origin/alt/day-batch2 **5d2d0c72** with origin/main's out/ (**03cd5e41**, today's data; split/index.json made 2026-11-26T11:51:51Z).
out/ was put back after (`git checkout HEAD -- out/`) and is not in any commit.

## Summary
- **Step 6 can work, but NOT with the build command in switch-runbook-nov19.md.** Its `--public` flag now makes the Cloudflare site
  (details in F1). Use the switch checklist's command instead: `cd app && node build.mjs --v2 --art=v2art/ --one-art-size --split`.
- With that build and switch-plan.py: final **369 files** = page + v2.js + 7 fonts + **360 v2art**, **0 sp/**, 15,053,355 bytes.
  Every step stays within the limits.
- The 7 pages loaded at 390 and 1440 from the published layout over http: **14 of 14 OK**, with 0 errors, 0 failed requests and 0 sp/ requests.
- The old page during R1-R3 (the mixed pages) also passed: 25 views, 0 broken pictures.
- **Step 7:** the new prompt text is in docs/rebuild/refresh-prompt-switch.md. **META_KEYS = 17** (checked).
  The refresh will write 15 of them: singles and status have no producer.

## Step 6: what would be published

### Build (the one to use)
`cd app && PLAYWRIGHT_BROWSERS_PATH=<chromium 1148> node build.mjs --v2 --art=v2art/ --one-art-size --split`. Result lines:
```
v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)
v2 --split: dist/v2.js 3711 KB (publish them beside the page)
v2: static first screen 99 KB
built dist/v2.html (870 KB; 27 CSS layers, 8 data files, 57 scripts, 62 shared logic files)
```
dist/ = v2.html (992,946 bytes), v2.js (3,802,825), fonts/ (7 files). The page loads `v2.js?v=b85aba6f9a79` (relative). It has no `__NP_PUBLIC`
(`grep -c "__NP_PUBLIC=1"` = 0).

### switch-plan.py
`python3 docs/rebuild/switch-plan.py <scratch>/t-plan` printed:
```
R1 entries 152 files after 511 missing 0
R2 entries 248 files after 469 missing 0
R3 entries 206 files after 473 missing 0
R4 entries 106 files after 369 missing 0
final 369 files, 0 sp/. Page per step: R1 old page as is; R2/R3 switch-mixed-page.py OLD ids_R2/ids_R3; R4 app/dist/v2.html.
```
Exit 0. What this means: every step is at most 255 entries and at most 511 files, and every picture the page asks for exists at every version.

| Step | Adds | Nulls | Upload bytes (+ page) | Files after |
|---|---|---|---|---|
| R1 | 152 v2art | 0 | 3,498,234 (+ old page 3,068,985) | 511 |
| R2 | 103 v2art | 145 sp | 2,285,290 (+ mixed page 3,071,002) | 469 |
| R3 | 105 v2art | 101 sp | 4,181,472 (+ mixed page 3,071,688) | 473 |
| R4 | v2.js | 99 sp + 6 old fonts | 3,802,825 (+ new page 992,946) | 369 |

- **Art count today: 360** .webp in app/src/v2/art (`ls | grep -c '\.webp$'`). The 4 other entries (crowd.json, meta.json, items.json, items/) are
  inlined by the build and not published.
- The ids for the mixed pages:
  - ids_R2: 246 sprites. The Nov 19 rehearsal had 254; the art names changed, so the first 255 sorted files hold fewer sprites.
  - ids_R3: all 345.
- **Live today (checked, Artifact list, files):** version **1794491686-b0d0**, 359 files: index.html (3,068,985 bytes, sha256 cb649884...),
  13 fonts and 345 sp/. This is exactly what switch-plan.py assumes at R1. Stored: contract 0.2.90, capabilities db (6 rules), downloads, mcp, sample, user.
- **Fonts:** the 7 fonts in dist/fonts match the live artifact's 7 same-named fonts (sha256 prefix and byte size, all 7). So R4 needs no font upload.

### The published layout, checked as a folder
I built a folder from live's file set with R1..R4 applied:
- index.html = dist/v2.html, v2.js, 7 fonts, and v2art from app/src/v2/art.

Counts on that folder:
- `find . -type f | wc -l` = **369**
- `find . -path '*sp/*' | wc -l` = **0**
- `ls v2art | wc -l` = **360**
- `du -sb .` = **15,053,355**
- `find . -type f -size +16M | wc -l` = **0**

Against the limits: 16 MB per file (largest is v2.js at 3.8 MB), 511 files per version (369), and 256 MB per version (15 MB). Each publish is at most 255 entries and under 64 MB (the largest is about 7.3 MB).

### Page loads (Chromium 1148, served with `python3 -m http.server 8913` from that folder)
Setup:
- A stand-in database answers the way the live artifact will after step 7. It serves 18 documents, built from today's out/ exactly as the new refresh prompt says:
  - split parts for results, model and events;
  - perf merged with adj;
  - post and info.
- singles and status are absent (exists:false).
- Each page was loaded, waited for network idle plus 1.5 s, then scrolled to the bottom and back.

Script: scratchpad t-scripts/dry67.cjs (not committed).
```
OK   390 Home         4321ms js1 fonts2 v2art51 sp0 outside0 errs0 fails0 broken0 stuckfalse sw375 h7075 ... Data as of Nov 26.
OK   390 My Team      3924ms js1 fonts2 v2art14 sp0 outside0 errs0 fails0 broken0 stuckfalse sw375 h3710 h1="Sun Tailwind (sample)" Data as of Nov 26.
OK   390 Meta         3779ms ... v2art17 sp0 ... errs0 fails0 broken0 ... Data as of Nov 26.
OK   390 News         3679ms ... v2art15 sp0 ... h1="The Champions Dispatch." Data as of Nov 26.
OK   390 Gifts        3593ms ... v2art2  sp0 ... h1="Special delivery. No postage due." Data as of Nov 26.
OK   390 Track Record 3722ms ... v2art6  sp0 ... h1="We called it. Check the receipts." Data as of Nov 26.
OK   390 Pokemon      3943ms ... v2art21 sp0 ... h1="The file on  Garchomp." Data as of Nov 26.
OK   1440 (same 7 pages) ... all OK: sp0 outside0 errs0 fails0 broken0, sw1425, Data as of Nov 26.
pages failing 0
```
Exit 0. What each column means:
- `outside` counts requests to any other host.
- `fails` counts HTTP 400+ responses or failed requests.
- `errs` counts page errors and console errors.
- `broken` counts loaded images with no pixels.
- `stuck` means "Getting today's numbers" was still showing.
- `sw` is the scroll width (no sideways scroll).

The 14 screenshots are in scratchpad t-shots/ (not committed).

**This check could fail; two controls show it:**
1. Same run with no database (`MODE=nodb`): every page shows "Data as of Nov 1 (25 days old)". So the Nov 26 above really came from today's out/
   through the stand-in database.
2. v2art/445.webp (Garchomp) removed: `FAIL 390 Pokemon ... errs1 fails1 broken6` with `404 http://127.0.0.1:8913/v2art/445.webp`, and
   "pages failing 9". The file was put back afterwards (`ls v2art | wc -l` = 360).

### The old page during R1-R3 (mixed pages)
Setup:
- The live index.html was read with Artifact read: 3,068,985 bytes, sha256 cb649884..., version 1794491686-b0d0.
- `switch-mixed-page.py` printed "replaced 8 sprite paths; ids on v2art: 246" (R2) and "... 345" (R3).
- Each stage's exact file set was staged (sp/ from cb49701, 345 files). Fonts were not staged, so font 404s are ignored in this check.
- At 390 and 1440, all 25 old views were clicked, and each was scrolled through.

Results:
```
R1  OK 390 views 25 sp-requests 65 v2art-requests 0  failed 0 broken 0 errors 0 | OK 1440 sp 76 v2art 0  ... 0 0 0
R2  OK 390 views 25 sp-requests 21 v2art-requests 44 failed 0 broken 0 errors 0 | OK 1440 sp 22 v2art 54 ... 0 0 0
R3  OK 390 views 25 sp-requests 0  v2art-requests 65 failed 0 broken 0 errors 0 | OK 1440 sp 0  v2art 76 ... 0 0 0
```
What this means: no broken picture at any step. Limits of this check: default states only, and no real database (the old page used its built-in data).

## Step 7: the refresh prompt
- Full new prompt, changes table and today's prompt saved word for word: **docs/rebuild/refresh-prompt-switch.md**. The scheduled task was NOT edited.
- META_KEYS checked: app/src/app/03-persistence.js:7 =
  `['doubles','doubles_ingame','doubles_tour','singles','status','teams','history','perf','results','model','events','track','practice','weekly','calendar','post','info']`
  = **17**. Refresh after the change: 15 written (results, perf, 11 in step 3, post, info).
- singles and status: nothing writes them, and no out/ file exists for them.
- Changes compared to today's prompt, checked with difflib on the two blocks. Exactly these are added:
  - post.json and info.json to the download list;
  - meta/post and meta/info to the set list;
  - `post, info` to the split page-name list (which the _2 delete rule also uses);
  - a read-back for both;
  - a summary line for both.
- Files exist on the branch the refresh reads:
  - `git cat-file -s origin/live:out/info.json` = 85034
  - `origin/live:out/post.json` = 22645
  - live = 03cd5e41
  - Both are under the 200,000-byte split line.

## F. Anything in steps 6-7 that would fail or is unclear
- **F1 (would fail): switch-runbook-nov19.md section 3a/3d build command `--v2 --public --split --one-art-size --art=v2art/`.**
  Since Nov 25, `--public` is the Cloudflare public-site build. I built it to check (scratchpad t-dist-pub). It:
  - (a) points every file at the site root: `src="/v2.js?v=f16aa2266c15"`, `/fonts/`, art from `/v2art/` (shell.js:4);
  - (b) sends feedback to `/api/feedback` with Turnstile instead of the artifact's feedback/{self} (feedback.js:8, :44);
  - (c) links Pokémon names to `/pokemon/<name>` (meta.js:23);
  - (d) writes 45 files into dist/ (_headers, _redirects, pokemon/, sitemap, ...).

  On the artifact, the root paths are not the artifact's published paths. The Artifact tool's own rule: "relative and with no leading slash".
  So the page would very likely load no script, fonts or art. Not tested on the host; it was not published.
  **Fix: use the checklist's command (no `--public`, no `--preview-data`)**, as above, and correct switch-runbook-nov19.md 3a/3d and switch-plan.py's last
  print line if wanted (it only says "R4 app/dist/v2.html", which is right).
- **F2 (small cost of F1's fix):** without `--public`, the build keeps app/src/v2/test-hook.js. It is 2 lines and does something only if
  `window.__PL_TEST` is set before load. The JS is also minified for whitespace only (3.80 MB instead of 3.66 MB). Both are harmless; there is no build flag that
  drops only the hook. Unsure whether HH wants one.
- **F3 (unclear, still untested): the 8-second wait.** The new page draws numbers only when every META_KEY has answered, or after 8 s (shell.js:537).
  Today the live database has no meta/singles, meta/status, meta/post or meta/info. Whether the host answers onSnapshot for a missing document is
  still not tested on a real database (switch-runbook-nov19 1d). My stand-in answers at once, so the 3.6-4.3 s loads above do not prove it.
  Check on step 8: time from open to "Data as of" on the live link. If it is about 8 s, that is the cause.
- **F4 (order): do step 7 BEFORE step 6, or fire the refresh right after R4.**
  - Until the refresh writes them, the new page has no meta/post (News and Gifts fall back to the built-in list) and no meta/info (info sheets show
    no counts), and F3 may add the 8 s wait.
  - Writing them early is safe by code: the old live page's META object has no post or info key (read from the live index.html).
- **F5 (expected, from runbook step 5):** origin/live:out/post.json has no `ran` (checked 2026-11-18T02:21:50Z, 69 news). Main has no post-news.mjs
  until the merge. The step 5 data run must add `ran` before the health check passes.
- **F6 (unclear wording):** runbook step 7 says "17 META_KEYS now, not 16". That is what the page reads; the refresh writes 15. Not a failure, but
  someone reading it as "write 17" would look for singles/status files that don't exist.
- **F7 (note, checked):** the switch checklist (Nov 24) says the final list keeps 13 fonts (index + v2.js + 354 art + 13 fonts = 369). switch-plan.py removes the
  6 old fonts and has 360 art (1 + 1 + 7 + 360 = 369). Same total by coincidence; the plan's list is the one that matches today's art.
- **F8 (hazard kept from nov19 3f):** after step 5's data run, meta/track (bands 80/70/60) reaches the live database only at the next refresh. Keep
  step 6 (or the old page's lifetime) before that refresh, or the old page shows wrong Track Record labels.
- **Noticed, not investigated:** the 1440 Home screenshot shows a thin outline rectangle at the hero's left edge (about x 0-120, y 445-605). It may be
  part of the hero art. Not a step 6-7 item.

## Cleanup
- out/ restored (`git checkout HEAD -- out/`, untracked out/ files removed).
- The http servers (8913, 8914) were stopped.
- The worktree was removed after the push.
- Nothing is left running.
