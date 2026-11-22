#!/usr/bin/env bash
# Stop hook (Sim, Nov 20): before a turn ends, check that 3 helpers are really working. If not, block the stop once and say why.
# Escape hatch ONLY when there is no approved work at all: touch docs/rebuild/.no-approved-work (and log why with log-decision.sh).
in=$(cat)
[ "$(echo "$in" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0
[ -f /home/user/pokelair-data/docs/rebuild/.no-approved-work ] && exit 0
sid=$(echo "$in" | jq -r '.session_id // empty')
out=$(bash /home/user/pokelair-data/docs/rebuild/work-check.sh "$sid" 2>/dev/null)
n=$(echo "$out" | sed -n 's/^HELPERS_ACTIVE=//p'); n=${n:-0}
if [ "$n" -lt 1 ]; then  # Sim, Nov 22, 1:29 AM: 1 helper is the rule
  jq -n --arg r "WORK CHECK (Sim's rule, CLAUDE.md 'ALWAYS WORKING, ALWAYS 3 HELPERS'): only $n of 2 helpers are active. Before ending the turn: refill the free slot(s) with approved build work, make sure the main thread has its next task started, and set a wake-up. Facts:
$out" '{decision:"block", reason:$r}'
fi
exit 0
