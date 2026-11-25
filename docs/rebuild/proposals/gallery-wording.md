# Gallery card wording (fix plan step 1; for Sim's yes, NOT applied, NOT published)

File: docs/rebuild/preview-kit/gallery.html (published on the Preview as gallery.html). Two claims are wrong for the built page.

| Where | Now (wrong) | Proposed |
|---|---|---|
| Facts strip, line 49 | `3` sizes, all inside the length limits | `3` sizes measured: My Team is over the length limits, being fixed |
| My Team card tag, line 58 | Built from the code · same numbers as today's site | Built from today's code · numbers being checked against today's site |

Why the second one still can't say "same numbers": on Nov 12 the four proofs that disagreed were explained (same-six and same-info:
one intended fix, cb49701; same-compare and the behaviour FAIL: not reproduced here; same-share-v2: 12/12 identical), but the new
build's own behaviour tests still fail 75 of 142 (mostly pages and features not built yet), so "same numbers" would overclaim.
Once My Team's Part A is done and a full check passes on one commit, the tag can say "same numbers as today's site (full check <label>)".

Publishing it needs Sim's go (RULES.md). The Preview's other files are kept on a publish (preview-kit/README.md).
