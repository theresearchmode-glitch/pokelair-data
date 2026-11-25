#!/usr/bin/env bash
# pre-push gate (Sim, Nov 25): a push to claude/design6 or main that carries a merge commit needs that merge's stamp from
# docs/rebuild/merge-check.sh (helper report read, GitHub green on the source, no conflict markers, every test passed).
# Install: cp docs/rebuild/pre-push-hook.sh "$(git rev-parse --git-common-dir)/hooks/pre-push" && chmod +x it.
D="$(git rev-parse --git-common-dir)/merge-ok"; bad=0
while read -r lref lsha rref rsha; do
  case "$rref" in refs/heads/claude/design6|refs/heads/main) ;; *) continue;; esac
  [ "$lsha" = "0000000000000000000000000000000000000000" ] && continue
  range="$lsha"; [ "$rsha" != "0000000000000000000000000000000000000000" ] && range="$rsha..$lsha"
  for m in $(git rev-list --merges "$range"); do
    [ -f "$D/$m" ] || { echo "pre-push REFUSED: merge $(git log --oneline -1 "$m" | cut -c1-80) has no merge-check stamp. Run: REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch>"; bad=1; }
  done
done
exit $bad
