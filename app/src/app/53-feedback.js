// ---------- feedback: a quick way for testers to say what's off ----------
// Each viewer has one document, feedback/<their opaque id>, holding their messages by time. No names: only the text,
// what kind it is, the page they were on and phone or desktop. Only the owner can read everyone's (db rules at publish).
// The button only shows for viewers whose sharing level can save data (Contributor and up).
var FB = {ref: null, ok: false, from: null, kind: 'idea', busy: false};
(async () => { try { const c = window.claude; if (!c || !c.use) return; const [d, u] = await Promise.all([c.use('db'), c.use('user')]); if (!d || !u) return;
  const own = !!(u.isOwner && u.isOwner()); if (typeof u.can === 'function' && u.can('data.write') === false && !own) return;
  const id = await u.id(); if (!id) return; FB.ref = d.doc('feedback/' + id); FB.ok = true; FB.db = d;
  document.querySelectorAll('.fbbtn').forEach(b => b.hidden = false); if (view === 'home') safe('home', renderHome); } catch (e) {} })();
const FB_KINDS = [['bug', 'Something broke'], ['confusing', 'Confusing'], ['idea', 'Idea'], ['like', 'I like this']];
function fbOpen() { FB.from = view; let w = $('fbSheet'); if (!w) { w = document.createElement('div'); w.id = 'fbSheet'; w.className = 'fbwrap'; document.body.appendChild(w); }
  w.hidden = false; w.innerHTML = `<div class="fbbox" role="dialog" aria-modal="true" aria-labelledby="fbT"><div class="fbh"><b id="fbT">Send feedback</b><button type="button" class="fbx" data-fbx="1" aria-label="Close">×</button></div>
    <p class="t2">Something off, confusing or missing? A line or two helps. We see the page you were on (${esc(VIEW_TITLE[FB.from] || FB.from)}), never your name.</p>
    <div class="seg fbkind" role="group" aria-label="Kind of feedback">${FB_KINDS.map(([k, t]) => `<button type="button" data-fbk="${k}" aria-pressed="${FB.kind === k}">${t}</button>`).join('')}</div>
    <textarea id="fbText" maxlength="1000" rows="4" placeholder="What happened, or what would help?"></textarea>
    <div class="fbfoot"><span class="t2" id="fbMsg" role="status"></span><button type="button" class="btn go sm" id="fbSend">Send</button></div></div>`;
  setTimeout(() => { const t = $('fbText'); if (t) t.focus(); }, 30); }
function fbClose() { const w = $('fbSheet'); if (w) w.hidden = true; }
async function fbSend() { const ta = $('fbText'), msg = $('fbMsg'), btn = $('fbSend'); if (!ta || FB.busy) return; const t = ta.value.trim();
  if (t.length < 3) { msg.textContent = 'Write a few words first.'; return; }
  if (!FB.ok) { msg.textContent = "Can't send from here: your access level can't save data."; return; }
  FB.busy = true; btn.disabled = true; msg.textContent = 'Sending…'; const now = new Date(), k = now.getTime().toString(36);
  const entry = {t: t.slice(0, 1000), k: FB.kind, v: FB.from || view, w: innerWidth < 760 ? 'phone' : 'desktop', d: now.toISOString()};
  try { const s = await FB.ref.get(); if (s.exists) await FB.ref.update({m: {[k]: entry}}); else await FB.ref.set({m: {[k]: entry}});
    track('feedback:' + FB.kind); fbClose(); toast('Thanks! Feedback sent.'); }
  catch (e) { msg.textContent = "Couldn't send. Try again in a moment."; btn.disabled = false; }
  finally { FB.busy = false; } }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-fbopen],[data-fbx],[data-fbk],#fbSend');
  if (!b) { if (e.target && e.target.id === 'fbSheet') fbClose(); return; }
  if (b.dataset.fbopen) fbOpen(); else if (b.dataset.fbx) fbClose(); else if (b.id === 'fbSend') fbSend();
  else if (b.dataset.fbk) { FB.kind = b.dataset.fbk; document.querySelectorAll('[data-fbk]').forEach(x => x.setAttribute('aria-pressed', x.dataset.fbk === FB.kind)); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fbClose(); });
const fbWhen = d => { try { const t = new Date(d); return isNaN(t) ? String(d || '') : t.toLocaleString(undefined, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}); } catch (e) { return ''; } };
// owner only: everyone's feedback, newest first
async function renderFeedback() { const el = $('fbOut'); if (!el || !FB.db) return; el.innerHTML = '<p class="t2">Loading…</p>'; let snap;
  try { snap = await FB.db.collection('feedback').get(); } catch (e) { el.innerHTML = '<p class="t2">Couldn\'t load feedback.</p>'; return; }
  const all = []; snap.docs.forEach((doc, i) => Object.values((doc.data() || {}).m || {}).forEach(x => all.push({...x, who: i + 1})));
  all.sort((a, b) => String(b.d).localeCompare(String(a.d)));
  if (!all.length) { el.innerHTML = '<p class="t2">No feedback yet.</p>'; return; }
  const kind = Object.fromEntries(FB_KINDS);
  el.innerHTML = `<p class="t2">${all.length} message${all.length === 1 ? '' : 's'} from ${snap.docs.length} ${snap.docs.length === 1 ? 'person' : 'people'}.</p><div class="fblist">${all.slice(0, 60).map(x =>
    `<div class="fbitem"><div class="fbmeta"><span class="fbtag ${esc(x.k || '')}">${esc(kind[x.k] || x.k || '')}</span>${esc(VIEW_TITLE[x.v] || x.v || '')} · ${esc(x.w || '')} · person ${x.who} · ${esc(fbWhen(x.d))}</div><div>${esc(x.t || '')}</div></div>`).join('')}</div>`; }
document.addEventListener('toggle', e => { const d = e.target; if (d && d.id === 'fbBox' && d.open) renderFeedback(); }, true);

// ---------- what's new: a short note shown once after each update ----------
// Bump WHATS_NEW.id with each release worth announcing. First-time visitors get the welcome card instead, so they're
// marked as having seen this one.
const WHATS_NEW = {id: '2026-10-28b', items: [
  ['Threat prep', 'Your scouting report now shows how many of the top meta threats your team is ready for, with a check, counter or warning for each. No more win odds.'],
  ['Move accuracy', 'A move that can miss is never counted as a sure answer. Weather, No Guard, Compound Eyes and Wide Lens are included.'],
  ['New ratings', 'Ratings now weigh top-cut finishes, strong players and recent events most.'],
  ['Team checks', 'Item Clause clashes, items that do nothing, and Trick Room teams without enough slow attackers are now caught.'],
  ['Game mechanics', 'Damage, turn order and field effects were checked against the battle simulator and thousands of real battles, and every mismatch was fixed.'],
  ['Feedback', 'Tell us what\'s off with the Feedback button at the bottom of any page.']]};
function whatsNewCard() { let seen = '', welcomed = ''; try { seen = LS.get('cc2.seenNew', ''); welcomed = LS.get('cc2.welcomed', ''); } catch (e) {}
  if (!welcomed) { try { LS.set('cc2.seenNew', WHATS_NEW.id); } catch (e) {} return ''; }
  if (seen === WHATS_NEW.id) return '';
  // a one-line fold: the list opens on tap (Oct 29, so Home fits in about three phone screens)
  return `<details class="wnew" id="wnewCard"><summary class="wnh"><span class="wk">What's new</span><span class="wns">${WHATS_NEW.items.length} updates · ${WHATS_NEW.items.slice(0, 2).map(([t]) => esc(t)).join(', ')}…</span><button type="button" class="fbx" data-wnewx="1" aria-label="Dismiss">×</button></summary>
    <ul>${WHATS_NEW.items.map(([t, d]) => `<li><b>${esc(t)}</b> <span>${esc(d)}</span></li>`).join('')}</ul></details>`; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-wnewx]'); if (!b) return; e.preventDefault();
  try { LS.set('cc2.seenNew', WHATS_NEW.id); } catch (er) {} const c = $('wnewCard'); if (c) c.remove(); });
