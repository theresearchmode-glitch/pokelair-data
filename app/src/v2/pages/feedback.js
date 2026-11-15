// ---------- Send Feedback (Sim approved the draft's look, Nov 15, Q12 "recommended") ----------
// One question, the five kinds, a box, Send. Saved exactly as today's Feedback button saves it (53-feedback.js): the viewer's own
// document feedback/<anonymous id>, one entry {t: the text after fbScrub (emails, phone numbers, @handles removed), k: kind,
// v: the page they came from, w: phone or desktop, d: the date only}. No contact field. The Preview only pretends to save
// (its stand-in database keeps nothing), so there it says so instead of thanking anyone.
V2.FB = {ref: null, ok: false, kind: 'idea', busy: false, from: ''};
(async () => { try { const c = window.__NP_CLAUDE || window.claude; if (!c || !c.use) return; const [d, u] = await Promise.all([c.use('db'), c.use('user')]); if (!d || !u) return;
  const own = !!(u.isOwner && u.isOwner()); if (typeof u.can === 'function' && u.can('data.write') === false && !own) return;
  const id = await u.id(); if (!id) return; V2.FB.ref = d.doc('feedback/' + id); V2.FB.ok = true; } catch (e) {} })();
// the page they came from: the last page opened before Send Feedback (first read once every page has registered)
{ const note = () => { const r = V2.route(); if (r && r !== 'feedback') V2.FB.from = r; }; setTimeout(note, 0); addEventListener('hashchange', note); }
V2.pages.feedback = {place: '', draw() { const F = V2.FB, K = typeof FB_KINDS === 'object' ? FB_KINDS : [];
  return `<div class="ra gsp infp"><div class="gs-top wt-top ev-top"><section class="ra-h"><p class="np-eyebrow"><span>Send Feedback</span></p><h1 class="u"><span>Tell us</span> <span class="pl">what's off.</span></h1><p class="ra-lede">Spotted a bug, a wrong number or a better idea? It goes straight to the people who make NastyPlot.</p></section>
    <div class="ra-spotw"><aside class="ev-plate"><p class="ev-pk u">Anonymous</p><p class="ev-none">We never ask for your name or email. Anything that looks like an email, phone number or @handle is removed before it's saved.</p><div class="abtmail" id="abtMail"><button type="button" class="np-link" data-abtmail="show">Show Email</button></div></aside></div></div>
    <section class="inf-fb"><p class="inf-q u" id="fbQ">What kind of note is it?</p><div class="ev-f" role="group" aria-labelledby="fbQ">${K.map(([k, t]) => `<button type="button" class="np-chip" data-fbk2="${k}" aria-pressed="${F.kind === k}">${V2.esc(t)}</button>`).join('')}</div>
      <label class="np-field inf-box"><span class="vh">Your note</span><textarea id="fbText2" maxlength="1000" rows="6" placeholder="What happened, or what would help?"></textarea></label>
      <div class="row"><button type="button" class="np-btn" data-fbsend2><span>Send</span></button><span class="fine" role="status" data-fbmsg2>Saved with the page you came from, phone or desktop, and the date.</span></div></section></div>`; }};
V2.fbSend = async () => { const F = V2.FB, ta = document.getElementById('fbText2'), msg = document.querySelector('[data-fbmsg2]'), btn = document.querySelector('[data-fbsend2]'); if (!ta || F.busy) return;
  const t = ta.value.trim(); if (t.length < 3) { msg.textContent = 'Write a few words first.'; return; }
  if (window.__NP_PREVIEW) { msg.textContent = "This is the preview: it can't save messages. Send Feedback works on the real site."; return; }
  if (!F.ok) { msg.textContent = "Can't send from here: your access level can't save data."; return; }
  F.busy = true; btn.disabled = true; msg.textContent = 'Sending…'; const k = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6), sc = fbScrub(t.slice(0, 1000));
  const entry = {t: sc.t, k: F.kind, v: F.from || 'home', w: innerWidth < 760 ? 'phone' : 'desktop', d: new Date().toISOString().slice(0, 10)};
  try { const s = await F.ref.get(); if (s.exists) await F.ref.update({m: {[k]: entry}}); else await F.ref.set({m: {[k]: entry}});
    ta.value = ''; msg.textContent = 'Thanks! Feedback sent.' + (sc.n ? ' Personal details were removed.' : ''); V2.toast('Thanks! Feedback sent.' + (sc.n ? ' Personal details were removed.' : '')); }
  catch (e) { msg.textContent = "Couldn't send. Try again in a moment."; }
  finally { F.busy = false; btn.disabled = false; } };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fbk2],[data-fbsend2]'); if (!b) return;
  if (b.dataset.fbk2) { V2.FB.kind = b.dataset.fbk2; document.querySelectorAll('[data-fbk2]').forEach(x => x.setAttribute('aria-pressed', x.dataset.fbk2 === V2.FB.kind)); return; }
  V2.fbSend(); });
