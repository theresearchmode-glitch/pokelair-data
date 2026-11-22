// Send Feedback (#feedback) direction mock-up, Nov 22 (helper hM). Call: "Keep as drawn" = Sim's PC mock (origin/claude/cohesion-mocks
// pages/feedback.html): the form as a plot sentence ("It's [something broke] [confusing] [an idea] [I like this] [wrong info] and here's the
// note:"), the box, the pink SEND IT., and "Anonymous. Always." beside it on desktop (so the page stays about today's length). MOCK-UP ONLY:
// injected into the real built page (test hook __ev). Every hook stays: data-fbk2 (the five kinds, FB_KINDS), #fbText2, data-fbsend2,
// data-fbmsg2, data-fbctxoff, data-abtmail / #abtMail. Words for the kinds are today's, lower-cased to read as a sentence.
(() => { const E = V2.esc, F = V2.FB, K = typeof FB_KINDS === 'object' ? FB_KINDS : [];
const css = `<style>
.fbm .k-head .k-kicker{display:table;width:max-content}
.fbm-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px);gap:24px 56px;align-items:start}
.fbm .k-sent{margin-top:0;font-size:var(--t28)}
.fbm-box{display:block;margin:16px 0 0}
.fbm-box textarea{display:block;width:100%;min-height:132px;padding:12px 16px;border:3px solid var(--k-plot);border-radius:0;background:var(--k-card);color:var(--k-ink);font:500 var(--t17)/1.5 var(--b);resize:vertical}
.fbm-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;margin-top:4px}.fbm-row .k-go{margin-top:16px}
.fbm-row .fine{font-size:var(--t13);font-weight:600;color:var(--k-ink2)}
.fbm-anon{padding:20px 24px;background:var(--k-card);box-shadow:inset 4px 0 0 var(--k-plot),0 6px 18px var(--k-card-shadow)}
.fbm-anon h2{margin:0 0 8px;font-size:var(--t28);line-height:1.1;color:var(--k-ink)}.fbm-anon p{margin:0 0 8px;font-size:var(--t15);line-height:1.5;color:var(--k-ink2)}
@media (max-width:959.98px){.fbm-two{grid-template-columns:minmax(0,1fr)}}
@media (max-width:699.98px){.fbm .k-sent{font-size:var(--t15);gap:6px}.fbm .k-w{padding:0 8px}.fbm .k-sec{display:none}.fbm .k-n{display:none}.fbm .inf-fb{padding-top:20px}.fbm-anon h2{margin-bottom:4px}.fbm .k-plan{padding-bottom:16px}.fbm-box textarea{min-height:104px}.fbm-row .k-go{margin-top:12px}.fbm-anon p{font-size:var(--t13)}.fbm-anon{padding:16px}.fbm-anon h2{font-size:var(--t22)}}
</style>`;
const kw = {bug: 'something broke', confusing: 'confusing', idea: 'an idea', like: 'I like this', mistake: 'wrong info'};
const head = `<div class="k-head"><p class="k-kicker">ABOUT · TIP US OFF</p><h1 class="k-h1 u">Tell us <em>what's off.</em></h1><p class="k-lead">Spotted a bug, a wrong number or a better idea? It goes straight to the people who make NastyPlot.</p></div>`;
const sent = V2.kSent(["It's", ...K.map(([k, t]) => ({w: kw[k] || t, on: F.kind === k, attrs: {'data-fbk2': k}})), "and here's the note:"], {label: 'What kind of note is it?', hint: false});
const form = `<section class="inf-fb">${sent}<label class="fbm-box"><span class="vh">Your note</span><textarea id="fbText2" maxlength="1000" rows="5" placeholder="What happened, or what would help?">${E(F.draft || '')}</textarea></label>${F.ctx ? `<p class="fine inf-ctx">Sent with what was on screen: <b>${E(F.ctx)}</b> <button type="button" class="np-link" data-fbctxoff>Don't send it</button></p>` : ''}
  <div class="fbm-row">${V2.kGo('SEND IT.', {'data-fbsend2': true})}<span class="fine" role="status" data-fbmsg2>Saved with the page you came from, phone or desktop, and the date.</span></div></section>`;
const anon = `<aside class="fbm-anon"><h2 class="u">Anonymous. Always.</h2><p>We never ask for your name or email. Anything that looks like an email, phone number or @handle is removed before it's saved.</p><div class="abtmail" id="abtMail"><button type="button" class="np-link k-link" data-abtmail="show" style="border:0;background:none;padding:0;cursor:pointer">Show Email&nbsp;›</button></div></aside>`;
document.querySelector('#main').innerHTML = css + `<div class="ra gsp infp fbm">${head}${V2.kPlan(V2.kStep(1, 'The tip.', 'what kind of note is it?', `<div class="fbm-two">${form}${anon}</div>`))}</div>`; scrollTo(0, 0); })();
