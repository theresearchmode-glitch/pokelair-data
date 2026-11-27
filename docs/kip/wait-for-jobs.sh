#!/bin/bash
# Kip mailbox watcher: returns as soon as HH changes docs/kip/queue.md on alt/kip-jobs, or after 50 minutes.
# WAIT_SECS (default 120) is the gap between checks; ROUNDS (default 25) how many checks.
git fetch -q origin alt/kip-jobs || { echo "FETCH FAILED: check git/network, then run me again"; exit 1; }
seen=$(git rev-parse origin/alt/kip-jobs:docs/kip/queue.md)
for i in $(seq 1 ${ROUNDS:-25}); do
  sleep ${WAIT_SECS:-120}
  git fetch -q origin alt/kip-jobs || continue
  cur=$(git rev-parse origin/alt/kip-jobs:docs/kip/queue.md)
  if [ "$cur" != "$seen" ]; then echo "NEW WORK: queue.md changed ($(TZ=America/New_York date '+%-I:%M %p')). Read it now."; exit 0; fi
done
echo "NO CHANGE in the last checks ($(TZ=America/New_York date '+%-I:%M %p')). Write an idle line, then run me again."
