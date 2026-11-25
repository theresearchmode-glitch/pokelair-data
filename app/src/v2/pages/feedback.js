// ---------- Send Feedback (Sim approved the draft's look, Nov 15, Q12 "recommended") ----------
// One question, the five kinds, a box, Send. Saved exactly as today's Feedback button saves it (53-feedback.js): the viewer's own
// document feedback/<anonymous id>, one entry {t: the text after fbScrub (emails, phone numbers, @handles removed), k: kind,
// v: the page they came from, w: phone or desktop, d: the date only}. No contact field. The Preview only pretends to save
// (its stand-in database keeps nothing), so there it says so instead of thanking anyone.
V2.FB = {ref: null, ok: false, kind: 'idea', busy: false, from: ''};
if (window.__NP_PUBLIC) { window.__npTurnstileCb = tok => { window.__npTurnstileToken = typeof tok === 'string' ? tok : ''; }; }
(async () => { try { if (window.__NP_PUBLIC) { V2.FB.ok = true; if (V2.redraw) V2.redraw(); return; }
  const c = window.__NP_CLAUDE || window.claude; if (!c || !c.use) return; const [d, u] = await Promise.all([c.use('db'), c.use('user')]); if (!d || !u) return;
  const own = !!(u.isOwner && u.isOwner()); if (typeof u.can === 'function' && u.can('data.write') === false && !own) return;
  const id = await u.id(); if (!id) return; V2.FB.ref = d.doc('feedback/' + id); V2.FB.ok = true; if (V2.redraw) V2.redraw(); } catch (e) {} })(); /* feedback links show only where feedback can be saved (Nov 15, SHELL-20c) */
// the page they came from: the last page opened before Send Feedback (first read once every page has registered)
{ const note = () => { const r = V2.route(); if (r && r !== 'feedback') V2.FB.from = r === 'pokemon' ? (location.hash || '').slice(1, 60) : r; }; /* a Pokémon page says which Pokémon (Nov 15) */ setTimeout(note, 0); addEventListener('hashchange', note); }
// Send Feedback on the kit (Sim approved Nov 22, 12:37 PM; mock docs/rebuild/mocks/reskin-nov22/feedback-mock = his PC mock as drawn): the form
// reads as one plot sentence, "It's [something broke] [confusing] [an idea] [I like this] [wrong info] and here's the note:", the box, the pink
// SEND IT., and "Anonymous. Always." beside it on desktop. Hooks kept: data-fbk2 (FB_KINDS), #fbText2, data-fbsend2, data-fbmsg2, data-fbctxoff, #abtMail.
V2.FB_SAY = {bug: 'something broke', confusing: 'confusing', idea: 'an idea', like: 'I like this', mistake: 'wrong info'};
V2.pages.feedback = {place: '', draw() { const F = V2.FB, K = typeof FB_KINDS === 'object' ? FB_KINDS : [], E = V2.esc;
  const head = `<div class="k-head"><p class="k-kicker np-eyebrow">ABOUT · TIP US OFF</p><h1 class="k-h1 u">Tell us <br class="fb2-br"><em>what's off.</em></h1><p class="k-lead">Spotted a bug, a wrong number or a better idea? It goes straight to the people who make NastyPlot.</p></div>`;
  const sent = V2.kSent(["It's", ...K.map(([k, t]) => ({w: V2.FB_SAY[k] || t, on: F.kind === k, attrs: {'data-fbk2': k}})), "and here's the note:"], {label: 'What kind of note is it?', hint: false});
  const form = `<section class="inf-fb fb2-form">${sent}<label class="fb2-box"><span class="vh">Your note</span><textarea id="fbText2" maxlength="1000" rows="5" placeholder="What happened, or what would help?">${E(F.draft || '')}</textarea></label>${F.ctx ? `<p class="fine inf-ctx">Sent with what was on screen: <b>${E(F.ctx)}</b> <button type="button" class="np-link" data-fbctxoff>Don't send it</button></p>` : ''}
    <div class="fb2-row">${V2.kGo('SEND IT.', {'data-fbsend2': true})}<span class="fine" role="status" data-fbmsg2>Saved with the page you came from, phone or desktop, and the date.</span></div></section>`;
  const anon = `<aside class="fb2-anon"><h2 class="u">Anonymous. Always.</h2><p>We never ask for your name or email. Anything that looks like an email, phone number or @handle is removed before it's saved.</p><div class="abtmail" id="abtMail"><button type="button" class="np-link k-link fb2-mail" data-abtmail="show">Show Email&nbsp;›</button></div></aside>`;
  return `<div class="ra gsp infp fb2">${head}${V2.kPlan(V2.kStep(1, 'The tip.', 'what kind of note is it?', `<div class="fb2-two">${form}${anon}</div>`))}</div>`; }};
// typed text survives a redraw (code review A6: the box was drawn empty, e.g. when saving access arrived after load)
document.addEventListener('input', e => { if (e.target && e.target.id === 'fbText2') { V2.FB.draft = e.target.value; if (e.target.value.trim().length >= 3) V2.fieldOk(e.target); } }); /* the mark goes once it's long enough to send (#6) */
V2.fbSend = async () => { const F = V2.FB, ta = document.getElementById('fbText2'), msg = document.querySelector('[data-fbmsg2]'), btn = document.querySelector('[data-fbsend2]'); if (!ta || F.busy) return;
  const t = ta.value.trim(); if (t.length < 3) { msg.textContent = 'Write a few words first.'; V2.fieldErr(ta, msg); return; } /* review Nov 19 #6: the box is marked and gets the focus */
  if (window.__NP_PREVIEW) { msg.textContent = "This is the preview: it can't save messages. Send Feedback works on the real site."; return; }
  if (!F.ok) { msg.textContent = "Can't send from here: your access level can't save data."; return; }
  F.busy = true; btn.disabled = true; msg.textContent = 'Sending…'; const k = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6), sc = fbScrub(t.slice(0, 1000));
  const entry = {t: sc.t, k: F.kind, v: F.from || 'home', w: innerWidth < 760 ? 'phone' : 'desktop', d: new Date().toISOString().slice(0, 10)}; if (F.ctx) entry.c = fbScrub((F.ctx.slice(0, 300) + (F.ctxNums ? '\n' + F.ctxNums : '')).slice(0, 1200)).t; /* Report a Mistake: what was on screen (Nov 15, CALC-08), plus a Pokémon's numbers (Nov 18, OL-i39) */
  try { if (window.__NP_PUBLIC) { const tok = window.__npTurnstileToken || (document.querySelector('[name="cf-turnstile-response"]') || {}).value || ''; const res = await fetch(window.NP_FEEDBACK_URL || '/api/feedback', {method: 'POST', headers: {'Content-Type': 'application/json', 'CF-Turnstile-Response': tok}, body: JSON.stringify({text: sc.t, page: String(F.from || 'home').slice(0, 40), kind: String(F.kind).slice(0, 20)})}); if (!res.ok) throw new Error('HTTP ' + res.status); }
    else { const s = await F.ref.get(); if (s.exists) await F.ref.update({m: {[k]: entry}}); else await F.ref.set({m: {[k]: entry}}); }
    ta.value = ''; F.draft = ''; F.ctx = ''; F.ctxNums = ''; const cx = document.querySelector('.inf-ctx'); if (cx) cx.remove(); msg.textContent = 'Thanks! Feedback sent.' + (sc.n ? ' Personal details were removed.' : ''); V2.toast('Thanks! Feedback sent.' + (sc.n ? ' Personal details were removed.' : '')); }
  catch (e) { msg.textContent = "Couldn't send. Try again in a moment."; }
  finally { F.busy = false; btn.disabled = false; } };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fbk2],[data-fbsend2]'); if (!b) return;
  if (b.dataset.fbk2) { V2.FB.kind = b.dataset.fbk2; document.querySelectorAll('[data-fbk2]').forEach(x => x.setAttribute('aria-pressed', x.dataset.fbk2 === V2.FB.kind)); return; }
  V2.fbSend(); });

// "Report a Mistake" (Damage Calc, a Pokémon page): opens Send Feedback as "Wrong info" with what was on screen attached (today's fbMistake),
// shown on the page with "Don't send it"; nothing personal is in it (a calc result or a Pokémon's name)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fbmistake],[data-fbctxoff]'); if (!b) return;
  if (b.dataset.fbctxoff != null) { V2.FB.ctx = ''; V2.FB.ctxNums = ''; const c = b.closest('.inf-ctx'); if (c) c.remove(); return; }
  let ctx = ''; try { if (b.dataset.fbmistake === 'calc') { const r = document.querySelector('.pc-ans') || document.querySelector('.arn-verdict'), w = document.querySelector('.dc2'); /* Nov 21: Plot the hit: the answer is .pc-ans (the Arena's .arn-verdict is gone) */ const nm = w ? ['a', 'd'].map(k => { const s = w.querySelector(k === 'a' ? '#dcA' : '#dcD'), e = w.querySelector(`[data-arnname="${k}"]`); return s && s.selectedOptions[0] ? s.selectedOptions[0].text.trim() : e ? e.textContent.trim() : ''; }).filter(Boolean) : []; /* the full names from the pickers (Plot the hit's photo writes 'Charizard Y' with 'Mega' on its own line) */ /* the Arena (Nov 19): attacker and defender from their name plates */ ctx = ((nm.length === 2 ? nm[0] + ' into ' + nm[1] + ': ' : '') + (r ? [...r.children].map(p => p.textContent).join(' ') : '')).replace(/\s+/g, ' ').trim(); } /* who hit whom, then the result */
    else ctx = ((document.querySelector('#main #pk-name .pk-nm') || document.querySelector('#main .pk-is h1') || {}).textContent || '').trim().replace(/\.$/, ''); } /* reskin (Nov 21): the Pokémon page's h1 reads "The file on <name>." */ catch (x) {}
  let nums = ''; if (b.dataset.fbmistake === 'pokemon') try { const p = V2.monFromHash(); if (p) nums = V2.fbMonNums(p); } catch (x) {}
  V2.FB.kind = 'mistake'; V2.FB.ctx = ctx.slice(0, 300); V2.FB.ctxNums = nums; });
/* Nov 18 (OL-i39): the Pokémon's numbers, sent with its Report a Mistake but not shown (the page shows only the name), as today's
   report sent them (53-feedback.js fbMisContext): rating and range, tier, rank, tournament share / wins / games, the moves, items and
   Ability shown, and the data date. Only site data: nothing about the viewer. */
V2.fbMonNums = p => { const r = rating(p), src = r.src || {}, st = setFor(p) || {}, pf = activePerf(), L = [], rk = rankTxt(p);
  L.push(V2.unrated(p) ? `${p.d} · ${V2.NOT_RATED.toLowerCase()} (no tournament results)` : `${p.d} · rated ${RS(r.total)} (${rRange(r)}, ${lTier(r.total).k} tier${rk ? ', ' + rk : ''})`);
  if (src.tour) L.push(`Tournaments: ${src.tour[0]}% of teams, ${src.tour[1]}% won, ${(+src.tour[2]).toLocaleString('en-US')} games`);
  if (st.mv && st.mv.length) L.push('Moves shown: ' + st.mv.slice(0, 5).map(([n, v]) => n + (v == null ? '' : ' ' + (+v).toFixed(1) + '%')).join(', '));
  if (st.it && st.it.length) L.push('Items shown: ' + st.it.slice(0, 3).map(([n, v]) => n + (v == null ? '' : ' ' + (+v).toFixed(1) + '%')).join(', '));
  if (st.ab && st.ab.length) L.push('Ability shown: ' + st.ab[0][0]);
  if (pf && pf.updated) L.push('Data from ' + String(pf.updated).slice(0, 10));
  return L.join('\n'); };
