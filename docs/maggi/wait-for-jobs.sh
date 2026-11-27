#!/bin/bash
# Maggi's mailbox watcher: returns when HH changes docs/maggi/queue.md on alt/maggi-jobs, or after 50 minutes.
start=$(git rev-parse -q --verify origin/alt/maggi-jobs:docs/maggi/queue.md 2>/dev/null || echo none)
git fetch -q origin alt/maggi-jobs 2>/dev/null
now=$(git rev-parse -q --verify origin/alt/maggi-jobs:docs/maggi/queue.md 2>/dev/null || echo none)
[ "${MAGGI_LAST:-}" != "" ] && start="$MAGGI_LAST"
if [ "$start" != "$now" ] && [ "${MAGGI_LAST:-}" != "" ]; then echo "NEW WORK (queue.md changed)"; exit 0; fi
for i in $(seq 1 25); do
  sleep 120; git fetch -q origin alt/maggi-jobs 2>/dev/null
  cur=$(git rev-parse -q --verify origin/alt/maggi-jobs:docs/maggi/queue.md 2>/dev/null || echo none)
  if [ "$cur" != "$now" ]; then echo "NEW WORK (queue.md changed at $(TZ=America/New_York date '+%-I:%M %p'))"; exit 0; fi
done
echo "NO CHANGE in 50 minutes (last checked $(TZ=America/New_York date '+%-I:%M %p'))"
