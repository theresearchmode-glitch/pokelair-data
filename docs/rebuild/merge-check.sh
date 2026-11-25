#!/usr/bin/env bash
# merge-check.sh: the gate before a merge commit is pushed to claude/design6 or main (Sim, Nov 25: "make sure we aren't making
# these mistakes"). Usage, after `git merge` and before `git push`:
#   REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/alt/gemini-XX
# It blocks each mistake made on Nov 25:
#   1. a merge pushed before the helper's last check came back (j19 -> My Box pictures 240px tall): REPORT_OK=1 must be set by HH
#      only after the helper's final report for that branch has been received AND read.
#   2. a merge of a branch whose newest commit GitHub has not passed: checks GitHub's latest run on that branch's tip.
#   3. tests run on a half-merged tree (conflict markers): refuses while any file is unmerged or has a conflict marker.
#   4. a push made before a FAIL line was read: every test is judged by its exit code, in the order GitHub runs them, and the
#      script itself refuses (exit 1) on any failure. Nothing is left to reading.
# On success it writes .git/merge-ok/<HEAD sha>; the pre-push hook (docs/rebuild/pre-push-hook.sh) refuses a push to
# claude/design6 or main that carries a merge commit without that stamp.
set -u
SRC="${1:-}"; ROOT="$(git rev-parse --show-toplevel)"; cd "$ROOT"
[ -n "$SRC" ] || { echo "usage: REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch merged>"; exit 2; }
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/tmp/claude-0/-home-user-pokelair-data/204a9d61-5900-570f-b954-256bbb6b60d7/scratchpad/pw1148}"
FAILS=0; LOG="$(mktemp -d)"
step() { local name="$1"; shift; if bash -c "$*" >"$LOG/$name.txt" 2>&1; then echo "  PASS  $name   ($(grep -v '^\s*$' "$LOG/$name.txt" | tail -1 | cut -c1-110))"; else echo "  FAIL  $name   ($(grep -v '^\s*$' "$LOG/$name.txt" | tail -1 | cut -c1-110))"; grep -E 'FAIL' "$LOG/$name.txt" | head -5 | sed 's/^/          /' | cut -c1-200; FAILS=$((FAILS+1)); fi; }

echo "merge-check for $(git log --oneline -1 | cut -c1-90)  (merging $SRC)"
# 1. the helper's report
if [ "${REPORT_OK:-}" = "1" ]; then echo "  PASS  helper report received and read (REPORT_OK=1, set by HH)"; else echo "  FAIL  REPORT_OK=1 not set: the helper's final report for $SRC must be in and read first"; FAILS=$((FAILS+1)); fi
# 2. GitHub on the source tip
TIP=$(git rev-parse "$SRC" 2>/dev/null); BR="${SRC#origin/}"
RUN=$(gh api "repos/theresearchmode-glitch/pokelair-data/actions/runs?branch=$BR&per_page=5" --jq "[.workflow_runs[]|select(.head_sha==\"$TIP\")][0]|[.status,.conclusion]|@tsv" 2>/dev/null)
if [ "$RUN" = "$(printf 'completed\tsuccess')" ]; then echo "  PASS  GitHub passed $BR at ${TIP:0:8}"; else echo "  FAIL  GitHub has not passed $BR at ${TIP:0:8} (latest run on it: ${RUN:-none})"; FAILS=$((FAILS+1)); fi
# 3. no half-merge
U=$(git diff --name-only --diff-filter=U); M=$(git grep -l -E '^(<<<<<<< |>>>>>>> )' -- ':!*.png' ':!*.jpg' ':!*.webp' 2>/dev/null | head -5)
if [ -z "$U$M" ]; then echo "  PASS  no unmerged files or conflict markers"; else echo "  FAIL  unmerged / conflict markers: $U $M"; FAILS=$((FAILS+1)); fi
[ "$FAILS" -eq 0 ] || { echo "merge-check: STOPPED before the tests ($FAILS problem(s)). Nothing may be pushed."; exit 1; }
# 4. tests, judged by exit code, in GitHub's order where order matters
step build          "node app/build.mjs"
step run            "node app/test/run.mjs"
step invariants     "node experiments/strength-invariants.mjs"
step v2-data-build  "node app/build.mjs --v2 --preview-data"
step commander      "PAGE=app/dist/v2.html node experiments/commander-test.mjs"
step score-src      "PAGE=app/dist/v2.html node experiments/score-src-test.mjs"
step unrated        "PAGE=app/dist/v2.html node experiments/unrated-test.mjs"
step a11y           "PAGE=app/dist/v2.html node experiments/a11y-code.mjs"
step v2-public      "node app/test/v2-public.mjs"
step public-build   "node experiments/public-build-test.mjs"
step csp-self       "node experiments/security-csp-test.mjs --self-test"
step csp            "node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public && node experiments/security-csp-test.mjs"
step saved          "node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs"
rm -rf "$LOG"
if [ "$FAILS" -eq 0 ]; then D="$(git rev-parse --git-common-dir)/merge-ok"; mkdir -p "$D"; git rev-parse HEAD > "$D/$(git rev-parse HEAD)"; echo "merge-check: ALL PASSED. Stamp written; the push may go."; exit 0
else echo "merge-check: $FAILS FAILED. Do not push; fix or report."; exit 1; fi
