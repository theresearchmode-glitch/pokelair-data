#!/usr/bin/env bash
# pre-push gate (Sim, Nov 25): a push to claude/design6 or main that carries a merge commit needs that merge's stamp from
# docs/rebuild/merge-check.sh (helper report read, GitHub green on the source, no conflict markers, every test passed).
# Install: cp docs/rebuild/pre-push-hook.sh "$(git rev-parse --git-common-dir)/hooks/pre-push" && chmod +x it.
D="$(git rev-parse --git-common-dir)/merge-ok"; bad=0
while read -r lref lsha rref rsha; do
  case "$rref" in refs/heads/claude/design6|refs/heads/main) ;; *) continue;; esac
  [ "$lsha" = "0000000000000000000000000000000000000000" ] && continue
  range="$lsha"; [ "$rsha" != "0000000000000000000000000000000000000000" ] && range="$rsha..$lsha"
  # Kip job 30 F2: only merges on the branch's own line (first parent), not old merges inside a merged branch's history;
  # F3b: if the range can't be listed (remote moved, not fetched), refuse instead of passing silently
  merges=$(git rev-list --merges --first-parent "$range") || { echo "pre-push REFUSED: cannot list commits in $range (git fetch first)"; exit 1; }
  # Kip job 43: the stamp must be for THIS branch (merge-check.sh writes "<sha> <target>"), so a merge checked with design6's list
  # can't go to main, nor the reverse
  br="${rref#refs/heads/}"
  for m in $merges; do
    t=""; [ -f "$D/$m" ] && read -r _ t < "$D/$m"
    [ -f "$D/$m" ] || { echo "pre-push REFUSED: merge $(git log --oneline -1 "$m" | cut -c1-80) has no merge-check stamp. Run: REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch> $br"; bad=1; continue; }
    [ "$t" = "$br" ] || { echo "pre-push REFUSED: merge $(git log --oneline -1 "$m" | cut -c1-80) was checked for '${t:-no branch (old stamp)}', not $br. Run: REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/<branch> $br"; bad=1; }
  done
done
exit $bad
