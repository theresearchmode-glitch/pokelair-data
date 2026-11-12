#!/bin/bash
# Build the new site's Preview page (foundation.html) from the repo, without touching app/dist.
# Usage (from anywhere):  S=/some/scratch/folder PREVIEW=1 bash docs/rebuild/preview-kit/rebuild-preview.sh
#   S        a scratch folder (default /tmp/np-preview). The Preview page lands at $S/redesign/foundation.html
#   PREVIEW  set to 1 to also make the Preview build (--art=v2art/ --preview-data: player names replaced by "Player N")
# Saved from the Nov 11 chat's scratch script extract/rebuild-mine.sh (same steps, folder made a variable).
# Takes up to ~15 minutes; run it with a 900 s timeout or in the background.
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"; S="${S:-/tmp/np-preview}"; mkdir -p "$S/redesign"; cd "$REPO"
rm -rf "$S/bc3" && mkdir -p "$S/bc3/app" && (cd app && tar cf - --exclude=./dist --exclude=./node_modules .) | (cd "$S/bc3/app" && tar xf -) && for d in out node_modules docs; do ln -s "$REPO/$d" "$S/bc3/$d"; done
(cd "$S/bc3" && node app/build.mjs --v2 2>&1 | tail -2) || exit 1
if [ -n "$PREVIEW" ]; then (cd "$S/bc3" && cp app/dist/v2.html app/dist/v2-plain.html && node app/build.mjs --v2 --art=v2art/ --preview-data 2>&1 | tail -1 && cp app/dist/v2.html "$S/redesign/foundation.html" && mv app/dist/v2-plain.html app/dist/v2.html); fi
# fonts (Nov 12): NastyPlot hosts its fonts itself; the page reads them from fonts/ beside it, so they are copied next to foundation.html
mkdir -p "$S/redesign/fonts" && cp "$REPO"/app/src/v2/fonts/*.woff2 "$S/redesign/fonts/" && echo "fonts: $(ls "$S/redesign/fonts" | wc -l) files"
echo COPY-OK
