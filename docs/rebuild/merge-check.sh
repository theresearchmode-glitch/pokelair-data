#!/usr/bin/env bash
# merge-check.sh: the gate before a merge commit is pushed to claude/design6 or main (Sim, Nov 25: "make sure we aren't making
# these mistakes"). Usage, after `git merge` and before `git push`:
#   REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/alt/gemini-XX [main|claude/design6]
# The target (the branch the merge goes into) is the 2nd argument, or else the branch you are on (main or claude/design6);
# anything else is refused. Kip job 43: each target runs its own test list (see TESTS below): claude/design6 the redesign's list,
# main the checks .github/workflows/test.yml runs for main's code (code tests on its frozen out/, then data checks on today's).
# After Sat Nov 28 (design6 merged into main) main runs design6's code: point main at tests_design6 then.
# It blocks each mistake made on Nov 25:
#   1. a merge pushed before the helper's last check came back (j19 -> My Box pictures 240px tall): REPORT_OK=1 must be set by HH
#      only after the helper's final report for that branch has been received AND read.
#   2. a merge of a branch whose newest commit GitHub has not passed: checks GitHub's latest run on that branch's tip.
#   3. tests run on a half-merged tree (conflict markers): refuses while any file is unmerged or has a conflict marker.
#   4. a push made before a FAIL line was read: every test is judged by its exit code, in the order GitHub runs them, and the
#      script itself refuses (exit 1) on any failure. Nothing is left to reading.
# On success it writes .git/merge-ok/<HEAD sha> holding "<HEAD sha> <target>"; the pre-push hook (docs/rebuild/pre-push-hook.sh)
# refuses a push to claude/design6 or main that carries a merge commit without a stamp for THAT branch.
set -u
SRC="${1:-}"; TARGET="${2:-}"; ROOT="$(git rev-parse --show-toplevel)"; cd "$ROOT"
[ -n "$SRC" ] || { echo "usage: REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch merged> [main|claude/design6]"; exit 2; }
[ -n "$TARGET" ] || TARGET="$(git symbolic-ref -q --short HEAD 2>/dev/null)"
case "$TARGET" in main|claude/design6) ;; *) echo "merge-check: target '${TARGET:-none}' is not main or claude/design6. Give it as the 2nd argument, or run on that branch."; exit 2;; esac
# the repo's playwright wants chromium_headless_shell-1148; this machine's default folder (/opt/pw-browsers) may not have it
PW_SCRATCH=/tmp/claude-0/-home-user-pokelair-data/204a9d61-5900-570f-b954-256bbb6b60d7/scratchpad/pw1148
if [ ! -d "${PLAYWRIGHT_BROWSERS_PATH:-/nonexistent}/chromium_headless_shell-1148" ] && [ -d "$PW_SCRATCH/chromium_headless_shell-1148" ]; then export PLAYWRIGHT_BROWSERS_PATH="$PW_SCRATCH"; fi
FAILS=0; LOG="$(mktemp -d)"
step() { local name="$1"; shift; if bash -c "$*" >"$LOG/$name.txt" 2>&1; then echo "  PASS  $name   ($(grep -v '^\s*$' "$LOG/$name.txt" | tail -1 | cut -c1-110))"; else echo "  FAIL  $name   ($(grep -v '^\s*$' "$LOG/$name.txt" | tail -1 | cut -c1-110))"; grep -E 'FAIL' "$LOG/$name.txt" | head -5 | sed 's/^/          /' | cut -c1-200; FAILS=$((FAILS+1)); fi; }

echo "merge-check for $(git log --oneline -1 | cut -c1-90)  (merging $SRC)"
# 1. the helper's report
if [ "${REPORT_OK:-}" = "1" ]; then echo "  PASS  helper report received and read (REPORT_OK=1, set by HH)"; else echo "  FAIL  REPORT_OK=1 not set: the helper's final report for $SRC must be in and read first"; FAILS=$((FAILS+1)); fi
# 2. GitHub on the source tip
TIP=$(git rev-parse "$SRC" 2>/dev/null); BR="${SRC#origin/}"
# Kip job 30 F4: the test workflow only (test.yml), on exactly this commit; newest attempt first
RUN=$(gh api "repos/theresearchmode-glitch/pokelair-data/actions/workflows/test.yml/runs?branch=$BR&head_sha=$TIP&per_page=5" --jq "[.workflow_runs[]][0]|[.status,.conclusion]|@tsv" 2>/dev/null)
if [ "$RUN" = "$(printf 'completed\tsuccess')" ]; then echo "  PASS  GitHub passed $BR at ${TIP:0:8}"; else echo "  FAIL  GitHub has not passed $BR at ${TIP:0:8} (latest run on it: ${RUN:-none})"; FAILS=$((FAILS+1)); fi
# Kip job 30 F1: HEAD must be the merge of exactly $SRC (its 2nd parent), and nothing uncommitted may help the tests pass
if [ "$(git rev-parse -q --verify HEAD^2 2>/dev/null)" = "$TIP" ]; then echo "  PASS  HEAD is the merge of $SRC"; else echo "  FAIL  HEAD is not a merge of $SRC (HEAD^2 $(git rev-parse --short -q --verify HEAD^2 2>/dev/null || echo none), $SRC ${TIP:0:8})"; FAILS=$((FAILS+1)); fi
# Kip job 43: the merge is on $TARGET's own line (origin/$TARGET is inside its first parent), so the right list is run
if git merge-base --is-ancestor "origin/$TARGET" HEAD^1 2>/dev/null; then echo "  PASS  the merge continues origin/$TARGET"; else echo "  FAIL  the merge's first parent does not contain origin/$TARGET: wrong target, or git fetch first"; FAILS=$((FAILS+1)); fi
if git diff --quiet && git diff --cached --quiet; then echo "  PASS  no uncommitted changes in tracked files"; else echo "  FAIL  uncommitted changes in tracked files (the stamp is for the commit, not the working copy)"; FAILS=$((FAILS+1)); fi
# 3. no half-merge
U=$(git diff --name-only --diff-filter=U); M=$(git grep -l -E '^(<<<<<<< |>>>>>>> )' -- ':!*.png' ':!*.jpg' ':!*.webp' 2>/dev/null | head -5)
if [ -z "$U$M" ]; then echo "  PASS  no unmerged files or conflict markers"; else echo "  FAIL  unmerged / conflict markers: $U $M"; FAILS=$((FAILS+1)); fi
[ "$FAILS" -eq 0 ] || { echo "merge-check: STOPPED before the tests ($FAILS problem(s)). Nothing may be pushed."; exit 1; }
# 4. tests, judged by exit code, in GitHub's order where order matters. TESTS: one list per target.
# claude/design6: the redesign's list (unchanged by Kip job 43)
tests_design6() {
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
}
# main (Kip job 43): what .github/workflows/test.yml runs for main's code (origin/main f4017535), in its order. Job "code tests" on
# the frozen out/ of its TEST_DATA commit (read from the merge's own test.yml), then "data checks" and "accuracy-gate" on today's
# out/. "live-data audits" is alert-only on GitHub (never blocks), so it is not gated here. out/ is put back afterwards.
put_out_back() { git restore -q --source=HEAD --staged --worktree -- out/ 2>/dev/null; }
tests_main() {
local TD; TD=$(sed -n 's/^ *TEST_DATA: *\([0-9a-f]\{40\}\).*/\1/p' .github/workflows/test.yml 2>/dev/null | head -1)
if [ -z "$TD" ]; then echo "  FAIL  no TEST_DATA commit in .github/workflows/test.yml (main's code tests run on that out/)"; FAILS=$((FAILS+1)); return; fi
git cat-file -e "$TD^{commit}" 2>/dev/null || git fetch -q origin "$TD" 2>/dev/null
trap put_out_back EXIT
if ! git checkout -q "$TD" -- out/ 2>/dev/null; then echo "  FAIL  cannot check out the frozen out/ of ${TD:0:8} (git fetch first)"; FAILS=$((FAILS+1)); put_out_back; return; fi
echo "  code tests on the frozen out/ of ${TD:0:8}:"
step f-run          "node app/test/run.mjs"
step f-replays      "node experiments/replays-test.mjs"
step f-reg-profile  "node experiments/reg-profile-test.mjs"
step f-reg-switch   "node experiments/reg-switch-test.mjs"
step f-no-rk9       "node experiments/no-rk9-test.mjs"
step f-date-switch  "node experiments/date-switch-test.mjs"
step f-reg-guard    "node experiments/reg-guard-test.mjs"
step f-md-data-gaps "node experiments/md-switch-data-gaps-test.mjs"
step f-md-day-one   "node experiments/md-day-one-test.mjs"
step f-freshness    "node experiments/freshness-test.mjs"
step f-bo3-tagging  "node experiments/bo3-tagging-test.mjs"
step f-shadow-model "node experiments/shadow-model-test.mjs"
step f-dec2-landing "node experiments/dec2-landing-fixes-test.mjs"
step f-speed        "node experiments/speed-check.mjs"
step f-calc         "node experiments/calc-check.mjs 2000"
step f-legality     "node experiments/legality-check.mjs"
step f-threat       "node experiments/threat-check.mjs"
step f-fields       "node experiments/fields-audit.mjs"
step f-suggest-gaps "node experiments/suggest-gaps.mjs"
step f-suggest      "node experiments/suggest-audit.mjs 30 5"
step f-build-logic  "node experiments/build-logic.mjs"
step f-lead         "node experiments/lead-logic.mjs"
step f-sync         "node experiments/sync-logic.mjs"
step f-typing-sync  "node experiments/typing-sync.mjs"
step f-sync-quiet   "node experiments/sync-quiet.mjs"
step f-golden       "node experiments/golden.mjs"
step f-same-grade   "node experiments/same-grade.mjs"
step f-plan-cache   "node experiments/plan-cache-test.mjs"
put_out_back
echo "  data checks and accuracy gate on today's out/:"
step d-build        "node app/build.mjs"
step d-run          "node app/test/run.mjs"
step d-threat       "node experiments/threat-check.mjs"
step d-lead         "node experiments/lead-logic.mjs"
step d-golden       "node experiments/golden.mjs"
step a-build        "node app/build.mjs"
step a-accuracy     "node experiments/accuracy-gate.mjs"
}
echo "  tests for $TARGET:"
case "$TARGET" in main) tests_main;; claude/design6) tests_design6;; esac
rm -rf "$LOG"
if [ "$FAILS" -eq 0 ]; then D="$(git rev-parse --git-common-dir)/merge-ok"; mkdir -p "$D"; echo "$(git rev-parse HEAD) $TARGET" > "$D/$(git rev-parse HEAD)"; echo "merge-check: ALL PASSED for $TARGET. Stamp written; the push to $TARGET may go."; exit 0
else echo "merge-check: $FAILS FAILED. Do not push; fix or report."; exit 1; fi
