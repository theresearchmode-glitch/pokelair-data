# Turnstile drawn once per form (HH's Job I, Kip job 47), Thu Nov 26, 04:58 AM Eastern onward (`date`)
Branch alt/turnstile-once, from claude/design6 b96f3a5e.

## 1. The test as it was, on design6 b96f3a5e (checked)
- `node experiments/turnstile-page-test.mjs` -> "turnstile-page-test: all passed" (exit 0), so on this run it did not fail.
- Kip's run on design6 250e56e2 failed ("2 failed", widget rendered twice, token `tok-2-0`). The cause, found below, depends on
  timing: it fails only when the page happens to redraw between opening Send Feedback and sending. The old test never made a redraw
  on purpose, so it passed or failed with the machine's speed.

## 2. Why the widget was drawn again (checked by reading the code and by the new check)
- `V2.redraw` merges the new HTML into the live page (`V2.morph`). An element whose `data-*` attributes differ is replaced, not changed in place.
- Send Feedback marked its Turnstile box with `el.dataset.on = '1'` once the widget was drawn (feedback.js). The fresh HTML has no `data-on`, so on every redraw the merge replaced the box with an empty one.
- That threw away Cloudflare's iframe with it. `after()` then saw an unmarked box, removed the old widget and drew a new one, and cleared the token the visitor already had.
- In real use, every redraw (a theme switch, or anything else that redraws the page while it is open) meant a new Cloudflare check. Sending right after a redraw said "One moment: we're checking you're a person". Only one box shows at a time, because the old one went with the old element. So "drawn twice" is twice in a row, not two at once.

## 3. The fix (smallest change, two files, no visual change)
- app/src/v2/shell.js, `V2.morph`: a node marked `data-v2own` (one a script owns) is kept exactly as it is by a redraw, with whatever the script put inside it. It is still removed or replaced when the page around it changes.
- app/src/v2/pages/feedback.js:
  - the box is `<div class="fb2-ts" id="fbTs" data-v2own>`;
  - "drawn already" is a property on the node (`el._tsOn`), not a `data-*` attribute, so the merge no longer sees a difference.
- Result:
  - one widget per form;
  - a redraw keeps the widget and its token;
  - leaving Send Feedback and opening it again (a new form, a new node) draws one fresh widget, removing the old one; api.js is not fetched again;
  - the token flow is unchanged: sent once, used once, then the widget is reset.
- Known limit (not checked on the real widget): after a theme switch, the kept widget keeps the theme it was drawn with. It is "interaction-only", so it shows only when Cloudflare asks the visitor to click.

## 4. The test (experiments/turnstile-page-test.mjs)
- The stand-in `turnstile` now puts one box into the element per render (and `remove` takes it out), so the checks can count widgets on the page.
- New check: with the widget drawn, a redraw (`V2.redraw()`) and a theme switch keep one widget and its token.
- New check: Home, then Send Feedback again, draws one fresh widget, the old one is removed, and api.js is fetched once in all.

Widget counts (render = calls to `turnstile.render`; onPage / inForm = widgets in the page / in #fbTs; tok = the visitor's token):

| | design6 b96f3a5e | this branch |
|---|---|---|
| opened | render 1, onPage 1, tok-1-0 | render 1, onPage 1, tok-1-0 |
| after a redraw + theme switch | **render 3**, onPage 1, **tok-3-0** | render 1, onPage 1, tok-1-0 |
| first message's token | tok-3-0 (expected tok-1-0) | tok-1-0 |
| Send Feedback reopened | render 4, onPage 1 | render 2, onPage 1, api.js 1 request |

- Exact lines on design6 (source files from b96f3a5e, the new test): "FAIL a redraw and a theme switch keep the one widget and its token (before {"render":1,"onPage":1,"inForm":1,"tok":"tok-1-0"}, after {"render":3,"onPage":1,"inForm":1,"tok":"tok-3-0"})", "FAIL the message carries the widget's token (["tok-3-0"])", "FAIL reopening Send Feedback draws one fresh widget … ({"render":4,…})", then "turnstile-page-test: 3 failed".
- On this branch: "turnstile-page-test: all passed".

## 5. Other checks (this container)
- `node experiments/security-csp-test.mjs --self-test` -> "PASS (positive + 2 negative assertions verified)".
- Public build + `node experiments/security-csp-test.mjs` -> "PASS (4 hashed inline scripts, static pages pokemon.html + 404.html, 0 CSP violations, 0 external requests, 0 cookies, XSS blocked)".
- `node experiments/privacy-public-test.mjs` -> "privacy-public: all passed".
- `node app/test/v2-guard.mjs` -> "v2 guard: clean (...)".
- Full v2-minors: see section 6.

## 6. Full v2-minors (frozen out/, `node app/build.mjs --v2 --preview-data`)
- "v2-minors:1 failed" (307 pass). The one is "My Team at 390 is at most 4.78 screens long (with optional swaps) (4.81 screens,
  4056px)", the same 4056px design6 b96f3a5e measures here (small touches pass 3, Job F); not caused by this change.
- The run rewrote out/post.json again (the post-news-test leak HH has fixed on alt/test-no-out, not on design6 yet); restored with
  `git checkout`, not committed.
