# Kip job 46: news freshness blocker (`ran` in out/post.json)

Written Wed Nov 25, 11:52 PM (ET). Found in job 41: once `post-news.mjs` lands on `main`, `health.mjs` dated `out/post.json`
by `checked` (when a person last checked the gift list, 2026-11-18), so every daily run would fail "News & Mystery Gifts: stale".

## Two branches (merge each into its own target)

| Branch | Base | Tip | Merge into |
|---|---|---|---|
| `alt/gemini-news-ran-data` | `origin/main` `f4017535` | `c78d15e2` | `main` |
| `alt/gemini-news-ran-page` | `origin/claude/design6` `c062acf1` | see status.md (commit on top of `fcace781`) | `claude/design6` |

### Data branch (`main`)
- `health.mjs:65`: `post.json` date is `d => d.ran || d.updated` (was `checked`). `checked` is never used for age.
- New `experiments/news-freshness-test.mjs`, wired into `.github/workflows/test.yml` (`paths` + step right after `freshness-test.mjs`).
- Fail first (old `health.mjs`): `news-freshness-test: 3 FAILED` (checked: ran it before the `health.mjs` edit).
- Pass after: `news-freshness-test: ALL PASSED`, `freshness-test.mjs: ALL PASSED` (checked: ran both, exit 0).
- Safe alone on `main` today: case 4 of the test, no `post-news.mjs` in the folder, old `checked` and no `ran` -> exit 0
  (the file stays `optional` / no age check while `post-news.mjs` is absent).

### Page branch (`claude/design6`)
- `post-news.mjs`: `postDoc(P, ran)` adds `ran` (ISO time) only when given. Success path passes `new Date().toISOString()`.
  Failed fetch / changed feed (`keep()`) re-writes the doc with the **previous** `ran` read from the old `out/post.json`
  (none if there was no old file), so a failure never makes the news look fresh. `POST.checked` is untouched.
- New `experiments/post-news-ran-test.mjs` (3 cases), wired into `test.yml` (`paths` + step right after `post-news-test.mjs`,
  both with `if: ${{ !cancelled() }}`).
- Fail first (old `post-news.mjs`): `post-news-ran-test: 2 FAILED` (cases 1 and 2; case 3 "no prior file -> no ran" already held).
- Pass after (checked: ran each, exit 0):
  - `node experiments/post-news-ran-test.mjs` -> `post-news-ran-test: ALL PASSED`
  - `node experiments/post-news-test.mjs` -> `ALL PASS`
  - `node experiments/post-data-test.mjs` -> `ALL PASS`
  - `node experiments/syntax-check.mjs` -> `syntax-check: all 412 scripts parse`
- Safe alone on `design6`: design6's `health.mjs` has no `post.json` row at all, so the extra key changes nothing there;
  the page reads `post.json` keys by name (`post-data-test.mjs` passes with `ran` present).

> **HH, please look: I changed one line of an existing test.** `experiments/post-news-test.mjs:26` (`docOk`) required the doc's
> keys to be exactly `checked,gifts,series,held,news`. Job 46 adds `ran` to that output on purpose, so the unchanged test fails
> against the new `post-news.mjs` (checked: stashed my edit and ran it -> `FAILED: 2`, "the daily document is written in POST's
> shape" and "carries the two new stories at the top"). The edit allows one extra key `ran`, only if it parses as a date;
> every other check in `docOk` (exact other keys, news/gifts/series/checked equal to post.js) is unchanged. If you'd rather
> keep that test strict, the alternative is to put `ran` in a separate file; say so and I'll redo it.

## Combined-merge proof (scratch only, not pushed)
`claude/design6` has not touched `health.mjs` since its merge base with `main` (checked: `git diff --stat <base>
origin/claude/design6 -- health.mjs` is empty), so after the Saturday switch `health.mjs` is the data branch's file.
Scratch worktree = page branch `fcace781` + `health.mjs` from `alt/gemini-news-ran-data`; ran the real `post-news.mjs`
(fixture feed) into `out/post.json`, then the real `health.mjs --now=2026-11-26` on a fixture `out/` (same fixture as
`news-freshness-test.mjs`). Output:

```
post.js checked = 2026-11-18T02:21:50Z
A. post-news success: exit=0 ran=2026-11-26T04:52:23.511Z checked=2026-11-18T02:21:50Z; health exit=0
  PASS  A. old checked + fresh ran (written by post-news.mjs) passes health.mjs
B. post-news failed fetch: exit=1 ran=2026-11-20T09:07:00.000Z; health exit=1 :: - News & Mystery Gifts: data from 2026-11-20, 6 days old (limit 3)
  PASS  B1. failed fetch leaves ran unchanged
  PASS  B2. old ran fails health.mjs as stale
j46-combined: ALL PASSED
```
Worktree removed afterwards. The two `test.yml` edits touch neighbouring lines, so merging both branches into one tree gives a
small `test.yml` conflict: keep both new steps.

## Not checked
- The full GitHub test run (it runs when this branch is pushed).
- A real post-news.mjs fetch from the live feed (fixture feed only, no network calls to the source).

## Notes
- Running `post-news-test.mjs` / `post-data-test.mjs` locally left `out/post.json` modified; restored with
  `git checkout HEAD -- out/` before committing. No `out/` file is in either branch.
