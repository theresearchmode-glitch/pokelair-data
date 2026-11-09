#!/bin/bash
# Every page check GitHub's "Test NastyPlot page" runs (test.yml), in one go, before pushing to main (Nov 9 lesson).
# Usage: bash experiments/ci-local.sh   (builds the page first). Prints one line per check and exits non-zero if any failed.
cd "$(dirname "$0")/.." || exit 2
node app/build.mjs >/dev/null 2>&1 || { echo "FAIL build"; exit 1; }
fails=0
for c in "app/test/run.mjs" "experiments/replays-test.mjs" "experiments/speed-check.mjs" "experiments/calc-check.mjs 2000" "experiments/legality-check.mjs" \
  "experiments/threat-check.mjs" "experiments/fields-audit.mjs" "experiments/suggest-gaps.mjs" "experiments/suggest-audit.mjs 30 5" "experiments/build-logic.mjs" \
  "experiments/lead-logic.mjs" "experiments/sync-logic.mjs" "experiments/typing-sync.mjs" "experiments/sync-quiet.mjs" "experiments/golden.mjs" "experiments/same-grade.mjs"; do
  if node $c > /tmp/ci-local-$$.log 2>&1; then echo "ok   $c"; else echo "FAIL $c"; grep -E "FAIL|Error" /tmp/ci-local-$$.log | head -5 | sed 's/^/       /'; fails=$((fails+1)); fi
done
rm -f /tmp/ci-local-$$.log; echo "$fails failed"; exit $((fails>0))
