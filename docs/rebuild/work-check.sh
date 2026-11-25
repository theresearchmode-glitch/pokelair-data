#!/usr/bin/env bash
# work-check.sh (Sim, Nov 20: "more consistent built in checks to make sure you're working").
# Prints the facts: helpers really active, test processes running, minutes since the last commit / decision, Plans age.
# Stopped helpers (TaskStop) never write a final reply: add their id to docs/rebuild/.helpers-ended so they are not counted.
# Usage: bash docs/rebuild/work-check.sh [session_id]   (exit 0 always; last line "HELPERS_ACTIVE=n")
sid="${1:-}"
if [ -z "$sid" ]; then T=$(ls -td /tmp/claude-*/-home-user-pokelair-data/*/tasks 2>/dev/null | head -1)
else T=$(ls -d /tmp/claude-*/*/"$sid"/tasks 2>/dev/null | head -1); fi
now=$(date +%s); active=0; names=""
# A helper counts as active when its transcript changed in the last 45 min (3 h if it is inside a tool call) and its last entry is not a finished reply (end_turn).
for f in "$T"/a*.output; do
  [ -f "$f" ] || continue
  grep -qx "$(basename "$f" .output)" /home/user/pokelair-data/docs/rebuild/.helpers-ended 2>/dev/null && continue
  age=$(( (now - $(stat -L -c %Y "$f")) / 60 ))  # -L: the .output files are links; their own time is when the helper started
  last=$(tail -n 1 "$f" | jq -r 'if .type=="assistant" then (.message.stop_reason // "") else "busy" end' 2>/dev/null)
  # a helper inside one long tool call (e.g. waiting on a test) writes nothing until it returns: allow 3 h for that, 45 min otherwise
  lim=180 # not finished (no final reply): a long tool call, a backgrounded wait or a queued message can leave the file quiet for a while
  [ "$age" -le "$lim" ] || continue
  # Nov 22: a helper that ended its turn to wait on its OWN background test run (listed in .helpers-waiting) still counts while a test runs
  waiting=0; grep -qx "$(basename "$f" .output)" /home/user/pokelair-data/docs/rebuild/.helpers-waiting 2>/dev/null && [ "$(pgrep -fc 'node .*app/test/' 2>/dev/null || echo 0)" -gt 0 ] && waiting=1
  if [ "$last" != "end_turn" ] || [ "$waiting" = 1 ]; then
    active=$((active+1))
    d=$(head -c 20000 "$f" | grep -o '"description":"[^"]*"' | head -1 | cut -d'"' -f4)
    names="$names\n  - $(basename "$f" .output) (${age} min since last step) ${d}"
  fi
done
tests=$(pgrep -fc 'node .*app/test/' 2>/dev/null || echo 0)
lc=$(( (now - $(git -C /home/user/pokelair-data log -1 --format=%ct)) / 60 ))
ld=$(( (now - $(stat -c %Y /home/user/pokelair-data/docs/rebuild/decisions.md 2>/dev/null || echo $now)) / 60 ))
lp=$(( (now - $(stat -c %Y /home/user/pokelair-data/docs/game-plan.html 2>/dev/null || echo $now)) / 60 ))
# Nov 22, 12 PM: 1 helper is the rule again; Sim (11:48 AM) allows ONE extra helper for reskin mock-ups only, until they are done: 2 while it runs, then set back to 1
echo "Work check $(TZ=America/New_York date '+%a %b %-d, %-I:%M:%S %p')"
echo "Helpers active: $active of ${NEED:-2}$names" | sed 's/\\n/\n/g'
echo "Test processes running (main thread or helpers): $tests"
echo "Minutes since last commit: $lc   since decision log: $ld   since Plans source edit: $lp"
[ "$active" -lt "${NEED:-2}" ] && echo "PROBLEM: fewer than ${NEED:-2} helper(s) on approved work. Refill now (CLAUDE.md 'Right now: Helpers')."
[ "$lp" -gt 60 ] && echo "PROBLEM: Plans page source older than 60 min (rule: update every 45-60 min)."
echo "HELPERS_ACTIVE=$active"
