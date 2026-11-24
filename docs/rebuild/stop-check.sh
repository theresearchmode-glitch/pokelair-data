#!/usr/bin/env bash
# Stop hook (Sim, Nov 20): before a turn ends, check that 3 helpers are really working. If not, block the stop once and say why.
# Escape hatch ONLY when there is no approved work at all: touch docs/rebuild/.no-approved-work (and log why with log-decision.sh).
in=$(cat)
[ "$(echo "$in" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0
[ -f /home/user/pokelair-data/docs/rebuild/.no-approved-work ] && exit 0
# Sim's own pause (Sim, Nov 24: "do what you think is best"): docs/rebuild/.sim-paused holds the resume time (epoch seconds).
# Until then no work check runs; after it, the file is ignored. Set ONLY on Sim's own words, logged with log-decision.sh.
P=/home/user/pokelair-data/docs/rebuild/.sim-paused
[ -f "$P" ] && [ "$(date +%s)" -lt "$(cat "$P" 2>/dev/null || echo 0)" ] && exit 0
sid=$(echo "$in" | jq -r '.session_id // empty')
out=$(bash /home/user/pokelair-data/docs/rebuild/work-check.sh "$sid" 2>/dev/null)
n=$(echo "$out" | sed -n 's/^HELPERS_ACTIVE=//p'); n=${n:-0}
if [ "$n" -lt 1 ]; then  # Sim, Nov 22, 1:29 AM: 1 helper is the rule
  jq -n --arg r "WORK CHECK (Sim's rule, CLAUDE.md 'ALWAYS WORKING, ALWAYS 3 HELPERS'): only $n of 2 helpers are active. Before ending the turn: refill the free slot(s) with approved build work, make sure the main thread has its next task started, and set a wake-up. Facts:
$out" '{decision:"block", reason:$r}'; exit 0
fi
# Nov 22 (Sim: "im not sure why you stop working when subagents are working ... i need to ensure it isnt"): the MAIN thread must have
# its own job running when a turn ends: a process whose pid is in docs/rebuild/.main-running, and docs/rebuild/main-queue.md
# edited in the last 45 min with a NOW line and 3+ NEXT lines.
D=/home/user/pokelair-data/docs/rebuild; why=""
pid=$(cat $D/.main-running 2>/dev/null | head -1); { [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; } || why="no main-thread job running (.main-running has no live pid)"
q=$D/main-queue.md; age=$(( ( $(date +%s) - $(stat -c %Y $q 2>/dev/null || echo 0) ) / 60 ))
[ "$age" -le 45 ] || why="$why; main-queue.md not updated for $age min"
[ "$(grep -c '^NEXT:' $q 2>/dev/null)" -ge 3 ] && grep -q '^NOW:' $q 2>/dev/null || why="$why; main-queue.md needs a NOW line and 3+ NEXT lines"
if [ -n "$why" ]; then jq -n --arg r "MAIN THREAD CHECK (Sim, Nov 22: the main thread never stops while helpers work): $why. Start the NOW job as a tracked background run, write its pid to docs/rebuild/.main-running, keep main-queue.md current, then continue." '{decision:"block", reason:$r}'; exit 0; fi
exit 0
