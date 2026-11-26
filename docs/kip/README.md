# Kip's mailbox (Sim, Nov 25: "put his work on git so I don't have to send stuff back and forth")

Two branches, nothing else changes:
- **alt/kip-jobs** (HH writes, Kip reads): `docs/kip/queue.md` = Kip's job list, newest jobs at the bottom, each with a number.
- **alt/gemini-status** (Kip writes, HH reads): `docs/kip/status.md` = one line per job as Kip works.

## When Sim says "Kip, check your jobs"
1. `git fetch origin` then read `git show origin/alt/kip-jobs:docs/kip/queue.md`.
2. Work the first job that status.md doesn't list as done or blocked, as the queue says (own branch alt/gemini-<topic>,
   report file on that branch, push once when done).
3. After each job (and when you start one), update status.md on alt/gemini-status and push it:
   `<job number> | started|done|blocked | <branch> <sha or -> | <one line: what, or why blocked> | <time from TZ=America/New_York date>`
4. Then go on to the next job. When nothing is left, write "idle" as the last line and stop.

## When Sim says "HH, check Kip"
HH: `git fetch origin`, read origin/alt/gemini-status:docs/kip/status.md, then each finished job's report on its branch,
review, verify by running, merge through the gate, and answer in queue.md (a "HH notes" line under the job) if anything is needed.

## Rules for the mailbox
- Only docs on these two branches (docs-only pushes start no GitHub test run).
- Kip never edits alt/kip-jobs; HH never edits alt/gemini-status.
- Questions for HH go in status.md as `<job> | question | - | <the question> | <time>`; HH answers in queue.md.
