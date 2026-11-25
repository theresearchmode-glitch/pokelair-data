#!/usr/bin/env bash
# The ONLY source of times (Sim, Nov 13: "as accurate as possible with the time"). Every time written anywhere (messages,
# checklist notes, docs, commits) is copied from this output, in the same step, never typed or reused from an earlier reading.
# Prints: Eastern clock time (with seconds), date, and the checklist timestamp (ms since 1970) for the 't' field.
TZ=America/New_York date "+time: %-I:%M %p (%-I:%M:%S)  date: %a %b %-d, %Y"
echo "t: $(date +%s%3N)"
