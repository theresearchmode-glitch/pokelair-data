// ---------- About & Legal (Sim approved the draft's look, Nov 15, Q12 "recommended") ----------
// "The Fine Print" rows beside "Everything We Save". The words are today's (ABT_PARTS in src/app/56-about-data.js, shared with
// today's page), each part's full text under its row. Privacy is the new site's own, written from what its code saves
// (checked Nov 15): teams go to the Claude account under an anonymous ID (03-persistence.js, the same as today); feedback from
// Send Feedback (53-feedback.js rules); usage counts as today (pages/owner.js, Sim Nov 15); settings stay in this browser
// (np2.* keys); fonts come from NastyPlot's own files (build.mjs refuses a Google Fonts link); no cookies anywhere in src/.
V2.ABT_SAVED = [
  ['Your teams', 'Your Claude account', "Your current team, saved teams, box, the opponent team you're testing and your battle log are saved under an anonymous ID (not your name), so they're there next time. Anyone who can open this page could technically read that saved data, so don't put anything private in team names."],
  ['Usage counts', 'Anonymous', "How many times each page or button was used in a visit, with the date, your screen size group (phone, tablet or desktop), day or night mode and how long the page took to show. If something breaks, the error message is counted too, with anything that looks like an email, phone number or @handle removed. Never what you type, and no first- or last-visit dates. Only NastyPlot's owner can read these."],
  ['Feedback', 'Only what you send', "The message you send from Send Feedback, its kind, the page you came from, phone or desktop and the date (not the time). Email addresses, phone numbers and @handles typed into a message are removed before it's saved. There's no field for contact details. Only the owner can read feedback."],
  ['One anonymous ID', 'Never a name or email', "The page's storage only lets each person write their own records, so your teams, usage counts and feedback are each filed under the same anonymous ID that Claude gives this page. It's a random code, not your name, email or username, and NastyPlot never looks up who an ID belongs to."],
  ['On this device only', 'This browser', "Your theme, which sections are open, tab, sort and filter choices, and a copy of your teams stay in this browser's storage. They never leave your device; clearing your browser data removes them."],
  ['Fonts', "NastyPlot's own files", 'Fonts load from NastyPlot itself, so no font service sees a request from your device.']];
V2.ABT_TITLE = {what: 'What NastyPlot Is', disc: 'Disclaimer & Trademarks', data: 'Where the Data Comes From', warr: 'No Guarantee', names: 'Player Names', contact: 'Removal & Contact', free: 'Not for Money'};
V2.pages.about = {place: '', draw() { const E = V2.esc, want = ((location.hash || '').split('=')[1] || '');
  const parts = (typeof ABT_PARTS === 'function' ? ABT_PARTS('') : []).filter(p => p[0] !== 'priv').map(p => p.map(x => typeof x === 'string' ? x.split("which threats you're ready for").join('which threats you have an answer for') : x)); /* word list (Nov 16): Matchups is about answers, not readiness */
  /* a link to a part scrolls there once per arrival, never on a redraw (code review A1-I4: Day/Night jumped back to it) */
  if (want && V2._abtAt !== V2.drawN) { V2._abtAt = V2.drawN; setTimeout(() => { const d = document.getElementById('abt-' + want); if (d) d.scrollIntoView({block: 'start'}); }, 60); }
  /* Nov 22 (HH, design authority for the empty-space fixes, Sim 8:48 PM): at 1100+ the first two rows (what NastyPlot is, the disclaimer)
     start open, so The Fine Print fills its column beside the receipt with real words instead of empty space (no fold to open) */
  const wide = !want && innerWidth >= 1100;
  const rows = parts.map(([k, , , sub, body], i) => `<details class="inf-row" id="abt-${k}"${want === k || (wide && i < 2) ? ' open' : ''}><summary><b>${E(V2.ABT_TITLE[k] || k)}</b><span>${sub}</span></summary><div class="inf-fine">${V2.wl(body).replace(/class="chghost abtshow"/, 'class="np-link"').replace(/>Show email</, '>Show Email<')}</div></details>`).join('');
  /* reskin (Nov 22, Sim approved direction A "the receipt", 12:36 PM, with its words "EVERYTHING WE SAVE" and "Your name or email: NEVER"; mock
     docs/rebuild/mocks/reskin-nov22/about-mock.inject.js): the kit head with the promise as four tilted stamps; "Everything we save" printed as
     NastyPlot's receipt (the Track Record's paper: white in both themes), each thing kept a line item with a dotted leader to where it lives;
     beside it The Fine Print rows as today (ids abt-*, #about=<part>, Show Email). The words are today's (V2.ABT_SAVED, ABT_PARTS) */
  const saved = V2.ABT_SAVED.map(([a, b, full]) => `<li><p class="inf-rc"><b>${E(a)}</b><i aria-hidden="true"></i><span>${E(b)}</span></p><p class="abt-d">${E(full)}</p></li>`).join('');
  const stamps = ['Free', 'No ads', 'Fan-made', 'Unofficial'].map(t => `<li>${t}</li>`).join('');
  const rc = `<section class="inf-saved abt-rc" id="abt-priv" aria-labelledby="abtRcH"><p class="abt-rn u" aria-hidden="true">NastyPlot</p><h2 class="abt-rk" id="abtRcH"><span aria-hidden="true">* * * </span>Everything We Save<span aria-hidden="true"> * * *</span></h2>
    <ul>${saved}</ul><p class="abt-tot"><span>Your name or email</span><b class="u">Never</b></p><p class="abt-end">NastyPlot never asks for your name, email or any contact details, and never reads them from your Claude account. Nothing else: no cookies, no ads or trackers. Want your saved data or feedback deleted? Email us (Removal & Contact).</p></section>`;
  return `<div class="ra gsp infp abt"><header class="k-head"><p class="k-kicker np-eyebrow">ABOUT · THE CREW BEHIND IT</p><h1 class="k-h1 u">Made by fans, <em>for doubles players.</em></h1><p class="k-lead">A team builder for Pokémon Champions VGC doubles.</p><ul class="abt-st u" aria-label="The promise">${stamps}</ul></header>
    ${V2.kPlan(V2.kStep(1, 'The receipt.', 'everything we save, and where it lives', `<div class="abt-two">${rc}<section class="abt-fine"><h2 class="k-h2 u">The fine print.</h2>${rows}</section></div>`))}</div>`; }};
// "Show Email": the address is only put together on the tap (legalMail, shared), so it never sits in the page as text
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-abtmail]'); if (!t || !t.closest('.infp')) return;
  const box = document.getElementById('abtMail'), m = typeof legalMail === 'function' ? legalMail() : ''; if (!box || !m) return;
  if (t.dataset.abtmail === 'show') { box.innerHTML = `<a class="np-link" href="mailto:${V2.esc(m)}">${V2.esc(m)}</a> <button type="button" class="np-link" data-abtmail="copy">Copy</button>`; return; }
  if (t.dataset.abtmail === 'copy') { try { navigator.clipboard.writeText(m).then(() => V2.toast('Email copied'), () => V2.toast('Press and hold the address to copy it')); } catch (er) { V2.toast('Press and hold the address to copy it'); } } });
