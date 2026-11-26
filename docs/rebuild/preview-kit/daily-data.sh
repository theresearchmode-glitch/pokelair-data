#!/bin/bash
# daily-data.sh (Sim, Nov 24: "make the redesign have the data updates too please. i want that to be accurate while im using it").
# Rebuilds the redesign Preview on the newest TESTED data: the `live` branch (it only moves after GitHub's full test run passes).
# Steps: fetch live; worktree of it in $S/livedata (out/ + data/); info.json rebuilt by experiments/info-only.mjs (main's job doesn't
# make it yet); post.json from this repo's out/ (main has none); then rebuild-preview.sh with OUT=$S/livedata/out PREVIEW=1.
# Prints DATA-DATE=<limitless.json updated> and the build's last lines. Publishing stays a separate step (Artifact publish of
# $S/redesign/index.html with foundation.html, v2.js, preview.json). Usage: S=<scratch> bash docs/rebuild/preview-kit/daily-data.sh
set -eo pipefail
REPO=$(cd "$(dirname "$0")/../../.." && pwd); S=${S:-/tmp/np-preview}
cd "$REPO"; git fetch -q origin live
rm -rf "$S/livedata"; git worktree prune; git worktree add -q --detach "$S/livedata" origin/live
( cd "$S/livedata" && OUTF="$S/livedata/out/info.json" node "$REPO/experiments/info-only.mjs" | tail -1 )
cp "$REPO/out/post.json" "$S/livedata/out/post.json"
echo "DATA-DATE=$(node -e "console.log(require('$S/livedata/out/limitless.json').updated)")  live=$(git rev-parse --short origin/live)"
rm -rf "$S/bc3"; OUT="$S/livedata/out" PREVIEW=1 S="$S" bash "$REPO/docs/rebuild/preview-kit/rebuild-preview.sh" 2>&1 | tail -4
