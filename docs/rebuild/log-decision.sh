#!/bin/bash
# Append an entry to docs/rebuild/decisions.md with the time read from the clock (Eastern), never typed by hand.
# Sim, Nov 12: "make sure you are ALWAYS writing the correct time ... I am very strict and punctual about it."
# Usage: bash docs/rebuild/log-decision.sh "what was decided or done (continuation lines are kept as written)"
T="$(TZ=America/New_York date '+%-I:%M %p')"
printf -- '- %s: %s\n' "$T" "$1" >> "$(dirname "$0")/decisions.md"
echo "logged at $T Eastern"
