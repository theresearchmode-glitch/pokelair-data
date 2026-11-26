# Job U: missing daily documents and the Home hero box (Thu Nov 26, 2026, 11:17 AM Eastern, now.sh)
HH's helper. Worktree at origin/alt/day-batch2 **5d2d0c72**, branch alt/missing-docs. Nothing published; main, design6, live, artifacts and
Cloudflare untouched.

## 1. Missing documents (F3 from Job T)

### Setup
- **Build, the artifact way:** `cd app && node build.mjs --v2 --art=v2art/ --one-art-size --split`, with origin/main 03cd5e41's out/ ("built dist/v2.html (870 KB; ...)").
- **Serving:** the page, v2.js, fonts and v2art are served by `python3 -m http.server 8913`.
- **Stand-in host:** an init script sets `window.__NP_CLAUDE`, which answers onSnapshot from today's out/ the way the refresh writes them.
  - Missing docs come in two kinds:
    - **answered** (`exists:false` after 5 ms);
    - **SILENT** (onSnapshot never calls back).
  - Each case: Home, 3 runs per width, medians shown.
- **What is timed:**
  - "first paint" = first-contentful-paint;
  - "data ready" = `V2._dataOk` true;
  - "Data as of Nov 26" = the moment that line appears.
- Script: scratchpad t-scripts/missing.cjs (not committed).

### Before the fix (5d2d0c72)
| Case | 390: first paint / data ready / "Data as of" | 1440: first paint / data ready / "Data as of" |
|---|---|---|
| all present (singles/status answered exists:false) | 229 / 384 / 640 ms | 248 / 334 / 617 ms |
| singles + status SILENT | 212 / **8,460** / 8,460 ms | 217 / **8,480** / 8,480 ms |
| post + info missing, answered | 203 / 330 / 548 ms | 197 / 335 / 542 ms |
| post + info SILENT | 195 / **8,436** / 8,436 ms | 212 / **8,439** / 8,439 ms |
| all four SILENT | 196 / **8,470** / 8,470 ms | 224 / **8,456** / 8,456 ms |

In every case "Getting today's numbers" was seen 3 of 3 times, and every run ended on "Data as of Nov 26."

What this means:
- **A missing document costs nothing if the host answers it.**
- **A silent one holds the numbers back for the full 8 s.** The cause is the code at **app/src/v2/shell.js:537**:
  `V2.dataReady`: `META_KEYS.every(k => META_SEEN.has(k)) || performance.now() > 8000`. META_SEEN is filled only by an answer (03-persistence.js:74).
- First paint is not affected (about 200 ms in every case): it comes from the static first screen, followed by the "Getting today's numbers" panel.

### Will the real host answer a missing document?
**By the platform's contract: yes, unless the store itself can't be reached.**
- **Checked by reading** the runtime contract's db.d.ts (0.2.99, loaded with the artifact-capabilities skill):
  - onSnapshot "fires with the current state once the store answers";
  - a non-existent document reads as `exists: false` in onSnapshot.
- Silence happens only "while the store cannot be reached (offline, or a network that holds, drops or blocks its requests)". In that case every document is
  silent, and the 8 s fallback is the intended behaviour (the contract itself advises a 10 s timer).
- **Not checked on the real host:** live is contract 0.2.90, not 0.2.99, and no real-database run was possible without publishing.
  So I treat the risk as low but not zero.

### The fix I made (code only; no visible change except less waiting in the silent case)
- On **alt/missing-docs**, app/src/v2/shell.js adds `V2.META_NOWAIT = new Set(['singles', 'status'])`, and dataReady becomes
  `META_KEYS.every(k => META_SEEN.has(k) || V2.META_NOWAIT.has(k))`.
- Why only these two: they have no producer (no out/ file, no refresh line), so waiting for them can never bring a real number.
  post and info do have producers, so they still count. Their silence is covered by Job T's F4: do step 7 before step 6.
- **Visible change:** none when the host answers. The page's own output is the same; singles/status still subscribe and, if they ever
  arrived, would redraw as before (scheduleRender).

New check **MD-1 / MD-2** in app/test/v2-minors.mjs (`ONLY=MD`; it also runs in PART=main2):
- MD-1: with meta/singles + meta/status silent, Home's numbers are in within 3 s.
- MD-2 (control): with meta/teams silent, the page still waits.

Results, on the frozen data 0c992f69, `node app/build.mjs --v2 --preview-data`:

Before the fix (5d2d0c72 + the test only):
```
  FAIL  MD-1: with meta/singles and meta/status silent (no producer), Home has today's numbers within 3 s, not after the 8 s wait (ready false, loading panel true, at 3253 ms)
  pass  MD-2 (control): with meta/teams silent, the page still waits for it (ready false, loading panel true, at 3266 ms)
v2-minors:1 failed
```
After the fix:
```
  pass  MD-1: ... (ready true, loading panel false, at 3262 ms)
  pass  MD-2 (control): ... (ready false, loading panel true, at 3245 ms)
v2-minors:all passed
```

Artifact build after the fix (same timing script, 3 runs, medians):
| Case | 390 data ready | 1440 data ready |
|---|---|---|
| all present | 330 ms | 316 ms |
| singles + status SILENT | **343 ms** (was 8,460) | **345 ms** (was 8,480) |
| post + info missing, answered | 327 ms | 329 ms |
| post + info SILENT | 8,487 ms (unchanged, by design) | 8,465 ms |
| all four SILENT | 8,502 ms (unchanged) | 8,470 ms |

Regression checks on the fix (frozen data 0c992f69, preview build):
- `PART=main2 node app/test/v2-minors.mjs` printed "v2-minors (main2):all passed", exit 0, with 106 pass lines including MD-1 and MD-2.
- `LT_ALERT=1 node app/test/v2-longtask.mjs` printed "v2-longtask: all passed", exit 0. That is the other test that reads dataReady.
- **Not run locally:** main1 and groups. The change touches only dataReady; GitHub runs them on the branch.

**My recommendation:** merge it only if you want the belt-and-braces. Reason: the contract says a missing document is answered, so the
real gain is only in the unlikely case where the host is silent for one document. It is cheap and has no visible change.

## 2. The thin outline box at the left of the Home hero (1440)
**What it is:** it is not a design bug. **It is Chromium's broken-image frame around Garchomp's picture, which was missing in my own control run.**
- In Job T, the negative control deleted v2art/445.webp (Garchomp) and re-ran every page. That run overwrote t-shots/db-1440-Home.png, the picture I
  looked at. So the "box" was the missing-image test, not the real page. My Job T note was wrong; I am correcting it here.
- **Element (checked):** `elementsFromPoint` at the box gives `div.sdh-m` with an `img src="v2art/445.webp"`.
  - Style `left: -37px; top: 370px; width: 159px; height: 159px`; box [-37, 446, 159, 159], matching the rectangle exactly.
  - No border, outline, box-shadow or filter (computed styles).
  - It is built at app/src/v2/pages/stampede-hero.js:34, with CSS at app/src/v2/css/sd-hero.css:31-32.
- **Proof (Chromium, 1440x900):**
  - Normal: `{"complete":true,"w":367}`, no box, in light and dark.
  - With v2art/445.webp answered 404 (`page.route`): `{"complete":true,"w":0}` and the box appears, in light and dark.
  - The checks at device scale 1 and 2, fresh and after scrolling, all show no box when the file is there.
- Pictures:
  - docs/rebuild/pics/nov26/job-u-hero-box-light.jpg
  - docs/rebuild/pics/nov26/job-u-hero-box-dark.jpg
  - In each, left is normal and right is 445 blocked.
- **design6:** the box cannot appear while every v2art file exists. The same hero code is on design6 (day-batch2 is design6 + batches), so the
  same thing would happen there only with a missing picture.
- **Not fixed (as asked).** One idea, not applied: `.sdh-m img` could hide a failed image (an onerror hook, or skip drawing). It only matters if a
  v2art file is ever missing on live. switch-plan.py already checks that every sprite exists at each step.

## Cleanup
- out/ was restored and is in no commit.
- The http server (8913) was stopped.
- The worktree was removed after the push.
