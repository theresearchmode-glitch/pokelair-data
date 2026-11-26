# Other account: overnight jobs (Mon Nov 23 night -> Tue Nov 24 morning)

You are helping on NastyPlot (Sim's project; Sim is he/him). Read CLAUDE.md and docs/rebuild/RULES.md first.
Rules: work on your own branches (alt/*), never main or claude/design6; never publish artifacts; times only from
`bash docs/rebuild/now.sh`; label every claim checked / not checked; every check reports command + exact result line + meaning;
no model names in commits. If `git commit` is blocked, deliver patch files + a report as last time. Fix only setup, never
change tests to make them pass. Start from the tip of claude/design6 (it was pushed for you tonight; note its commit).
Frozen data for tests: `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/`.

## JOB 1, branch `alt/len1280b`: option pictures for the 3 pages still over 3 screens at 1280x800 (report + pictures, decided by Sim)
Events (3.28), Speed Tiers (3.12), Test Run (3.23) at 1280x800 (cap 3.00 = 2,400 px). Last night's ideas:
- Speed Tiers: the six blue bands as one-line rows (name, YOURS and "outspeeds" on one line).
- Test Run: each pile row on one line (place + event + "gets through" + counts), or use the side panel's spare height.
- Events: tickets four across with the date on top instead of a stub, or "Coming up" moved into the hero's empty right side.
For each page build up to 2 options (A, B) as real CSS/JS on the page, scoped to 1280-1439.98 unless the change is clearly right at all
widths (then say so). Rules: no generic AI design (CLAUDE.md), the kit only, keep the look bold, no folds/tabs that hide content, no
removed content. For each option: length at 1280x800, 1366x768, 1440x900 and 390x844 (experiments/page-lengths.mjs), before/after
pictures at 1280 (label with docs/rebuild/preview-kit/label-picture.cjs; the recommended option's label must contain RECOMMENDED),
qcheck for that route, tap-size, and the behaviour group (Events: D-meta-shell; Speed Tiers and Test Run: C-battle). One option per
page marked RECOMMENDED with a one-line reason. Deliver each option as its own patch or commit. Nothing merges until Sim picks.

## JOB 2, branch `alt/fullcheck2`: every GitHub check on today's tip (report only)
Same as last night's Job 2 (every `run:` step of .github/workflows/test.yml in order, plus WebKit A/B/C/D, qcheck-all on every page,
polish-check all views 320-2560), on the claude/design6 tip you start from. Rerun every failure alone to tell real from flake.
List: real failures, flakes, "FIXED?" lines, qcheck known findings no longer seen (do not rewrite qcheck-known.json). Commit the report
to alt/fullcheck2 (docs/rebuild/test-runs/fullcheck-nov24.md).

## JOB 3 (only if 1 and 2 finish), branch `alt/phone-sweep`: phone polish sweep (report only)
TARGET=v2 polish-check on every page at 320-699 (STEP=20) day and night, plus a screenshot of each page at 320, 360, 390 and 414.
Rank what a person would notice first (text spilling, lone words or letters, uneven rows, cramped tap targets). No fixes: a report
with pictures (docs/rebuild/research/phone-sweep-nov24.md).
