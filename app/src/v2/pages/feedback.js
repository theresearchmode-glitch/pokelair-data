// ---------- Send Feedback (Sim approved the draft's look, Nov 15, Q12 "recommended") ----------
// One question, the five kinds, a box, Send. Saved exactly as today's Feedback button saves it (53-feedback.js): the viewer's own
// document feedback/<anonymous id>, one entry {t: the text after fbScrub (emails, phone numbers, @handles removed), k: kind,
// v: the page they came from, w: phone or desktop, d: the date only}. No contact field. The Preview only pretends to save
// (its stand-in database keeps nothing), so there it says so instead of thanking anyone.
V2.FB = {ref: null, ok: false, kind: 'idea', busy: false, from: ''};
(async () => { try { const c = window.__NP_CLAUDE || window.claude; if (!c || !c.use) return; const [d, u] = await Promise.all([c.use('db'), c.use('user')]); if (!d || !u) return;
  const own = !!(u.isOwner && u.isOwner()); if (typeof u.can === 'function' && u.can('data.write') === false && !own) return;
  const id = await u.id(); if (!id) return; V2.FB.ref = d.doc('feedback/' + id); V2.FB.ok = true; if (V2.redraw) V2.redraw(); } catch (e) {} })(); /* feedback links show only where feedback can be saved (Nov 15, SHELL-20c) */
// the page they came from: the last page opened before Send Feedback (first read once every page has registered)
{ const note = () => { const r = V2.route(); if (r && r !== 'feedback') V2.FB.from = r === 'pokemon' ? (location.hash || '').slice(1, 60) : r; }; /* a Pokémon page says which Pokémon (Nov 15) */ setTimeout(note, 0); addEventListener('hashchange', note); }
V2.pages.feedback = {place: '', draw() { const F = V2.FB, K = typeof FB_KINDS === 'object' ? FB_KINDS : [];
  return `<div class="ra gsp infp"><div class="gs-top wt-top ev-top"><section class="ra-h"><p class="np-eyebrow"><span>Send Feedback</span></p><h1 class="u"><span>Tell us</span> <span class="pl">what's off.</span></h1><p class="ra-lede">Spotted a bug, a wrong number or a better idea? It goes straight to the people who make NastyPlot.</p></section>
    <div class="ra-spotw"><aside class="ev-plate"><p class="ev-pk u">Anonymous</p><p class="ev-none">We never ask for your name or email. Anything that looks like an email, phone number or @handle is removed before it's saved.</p><div class="abtmail" id="abtMail"><button type="button" class="np-link" data-abtmail="show">Show Email</button></div></aside></div></div>
    <section class="inf-fb"><p class="inf-q u" id="fbQ">What kind of note is it?</p><div class="ev-f" role="group" aria-labelledby="fbQ">${K.map(([k, t]) => `<button type="button" class="np-chip" data-fbk2="${k}" aria-pressed="${F.kind === k}">${V2.esc(t)}</button>`).join('')}</div>
      <label class="np-field inf-box"><span class="vh">Your note</span><textarea id="fbText2" maxlength="1000" rows="6" placeholder="What happened, or what would help?">${V2.esc(F.draft || '')}</textarea></label>${F.ctx ? `<p class="fine inf-ctx">Sent with what was on screen: <b>${V2.esc(F.ctx)}</b> <button type="button" class="np-link" data-fbctxoff>Don't send it</button></p>` : ''}
      <div class="row"><button type="button" class="np-btn" data-fbsend2><span>Send</span></button><span class="fine" role="status" data-fbmsg2>Saved with the page you came from, phone or desktop, and the date.</span></div></section></div>`; }};
// typed text survives a redraw (code review A6: the box was drawn empty, e.g. when saving access arrived after load)
document.addEventListener('input', e => { if (e.target && e.target.id === 'fbText2') { V2.FB.draft = e.target.value; if (e.target.value.trim().length >= 3) V2.fieldOk(e.target); } }); /* the mark goes once it's long enough to send (#6) */
V2.fbSend = async () => { const F = V2.FB, ta = document.getElementById('fbText2'), msg = document.querySelector('[data-fbmsg2]'), btn = document.querySelector('[data-fbsend2]'); if (!ta || F.busy) return;
  const t = ta.value.trim(); if (t.length < 3) { msg.textContent = 'Write a few words first.'; V2.fieldErr(ta, msg); return; } /* review Nov 19 #6: the box is marked and gets the focus */
  if (window.__NP_PREVIEW) { msg.textContent = "This is the preview: it can't save messages. Send Feedback works on the real site."; return; }
  if (!F.ok) { msg.textContent = "Can't send from here: your access level can't save data."; return; }
  F.busy = true; btn.disabled = true; msg.textContent = 'Sending…'; const k = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6), sc = fbScrub(t.slice(0, 1000));
  const entry = {t: sc.t, k: F.kind, v: F.from || 'home', w: innerWidth < 760 ? 'phone' : 'desktop', d: new Date().toISOString().slice(0, 10)}; if (F.ctx) entry.c = fbScrub((F.ctx.slice(0, 300) + (F.ctxNums ? '\n' + F.ctxNums : '')).slice(0, 1200)).t; /* Report a Mistake: what was on screen (Nov 15, CALC-08), plus a Pokémon's numbers (Nov 18, OL-i39) */
  try { const s = await F.ref.get(); if (s.exists) await F.ref.update({m: {[k]: entry}}); else await F.ref.set({m: {[k]: entry}});
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
  let ctx = ''; try { if (b.dataset.fbmistake === 'calc') { const r = document.querySelector('.arn-verdict'), w = document.querySelector('.dc2'); const nm = w ? ['a', 'd'].map(k => { const e = w.querySelector(`[data-arnname="${k}"]`); return e ? e.textContent.trim() : ''; }).filter(Boolean) : []; /* the Arena (Nov 19): attacker and defender from their name plates */ ctx = ((nm.length === 2 ? nm[0] + ' into ' + nm[1] + ': ' : '') + (r ? [...r.children].map(p => p.textContent).join(' ') : '')).replace(/\s+/g, ' ').trim(); } /* who hit whom, then the result */
    else ctx = ((document.querySelector('#main .pk-is h1') || {}).textContent || '').trim(); } catch (x) {}
  let nums = ''; if (b.dataset.fbmistake === 'pokemon') try { const p = V2.monFromHash(); if (p) nums = V2.fbMonNums(p); } catch (x) {}
  V2.FB.kind = 'mistake'; V2.FB.ctx = ctx.slice(0, 300); V2.FB.ctxNums = nums; });
/* Nov 18 (OL-i39): the Pokémon's numbers, sent with its Report a Mistake but not shown (the page shows only the name), as today's
   report sent them (53-feedback.js fbMisContext): rating and range, tier, rank, tournament share / wins / games, the moves, items and
   Ability shown, and the data date. Only site data: nothing about the viewer. */
V2.fbMonNums = p => { const r = rating(p), src = r.src || {}, st = setFor(p) || {}, pf = activePerf(), L = [], rk = rankTxt(p);
  L.push(`${p.d} · rated ${RS(r.total)} (${rRange(r)}, ${lTier(r.total).k} tier${rk ? ', ' + rk : ''})`);
  if (src.tour) L.push(`Tournaments: ${src.tour[0]}% of teams, ${src.tour[1]}% won, ${(+src.tour[2]).toLocaleString('en-US')} games`);
  if (st.mv && st.mv.length) L.push('Moves shown: ' + st.mv.slice(0, 5).map(([n, v]) => n + (v == null ? '' : ' ' + (+v).toFixed(1) + '%')).join(', '));
  if (st.it && st.it.length) L.push('Items shown: ' + st.it.slice(0, 3).map(([n, v]) => n + (v == null ? '' : ' ' + (+v).toFixed(1) + '%')).join(', '));
  if (st.ab && st.ab.length) L.push('Ability shown: ' + st.ab[0][0]);
  if (pf && pf.updated) L.push('Data from ' + String(pf.updated).slice(0, 10));
  return L.join('\n'); };
