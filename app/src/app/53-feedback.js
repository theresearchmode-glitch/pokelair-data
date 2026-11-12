// ---------- feedback: a quick way for testers to say what's off ----------
// Anonymous (pre-launch privacy pass, Nov 2; many players are kids). Each viewer has one document, feedback/<opaque id>:
// the db rules at publish let each viewer write only their own document, so the path carries the platform's opaque viewer
// id (never a name, email or handle) and nothing inside identifies them. A message stores only: the text (with email
// addresses, phone numbers and @handles removed before saving), its kind, the page, phone or desktop, and the date (no
// time); its key is random. The box never asks for contact details. Only the owner can read everyone's.
// The button only shows for viewers whose sharing level can save data (Contributor and up).
var FB = {ref: null, ok: false, from: null, kind: 'idea', busy: false};
(async () => { try { const c = window.__NP_CLAUDE || window.claude; if (!c || !c.use) return; const [d, u] = await Promise.all([c.use('db'), c.use('user')]); if (!d || !u) return;
  const own = !!(u.isOwner && u.isOwner()); if (typeof u.can === 'function' && u.can('data.write') === false && !own) return;
  const id = await u.id(); if (!id) return; FB.ref = d.doc('feedback/' + id); FB.ok = true; FB.db = d;
  document.querySelectorAll('.fbbtn,.fbmis').forEach(b => b.hidden = false); if (view === 'home') safe('home', renderHome); } catch (e) {} })();
const FB_KINDS = [['bug', 'Something broke'], ['confusing', 'Confusing'], ['idea', 'Idea'], ['like', 'I like this'], ['mistake', 'Wrong info']];
/* ---------- report a mistake (trust pass): one tap on a Pokémon sheet or a damage calc result opens the feedback sheet as
   "Wrong info" with what was on screen filled in (which Pokémon and its numbers, or the whole calc and its result), so the
   person only says what's wrong, if they want to. Saved in the same feedback/<id> doc with the context as field c.
   Shown only to viewers who can save (FB.ok), like the Feedback button. */
const FB_MIS_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>';
function fbMisBtn(key, label) { return `<button type="button" class="fbmis" data-fbmis="${esc(key)}"${FB.ok ? '' : ' hidden'}>${FB_MIS_ICON}${esc(label || 'Report a mistake')}</button>`; }
/* what was on screen, as plain lines */
function fbMisContext(key) { key = String(key || ''); try {
  if (key === 'calc') return {title: 'Damage calc', text: (typeof dc === 'object' && dc.lastCtx) || 'Damage calc'};
  if (key.startsWith('mon:')) { const p = byName.get(key.slice(4)); if (!p) return null; const r = rating(p), src = r.src || {}, st = setFor(p) || {}, pf = activePerf(), L = [];
    L.push(`${p.d} · rated ${RS(r.total)} (${rRange(r)}, ${lTier(r.total).k} tier${rankTxt(p) ? ', ' + rankTxt(p) : ''})`);
    if (src.tour) L.push(`Tournaments: ${src.tour[0]}% of teams, ${src.tour[1]}% won, ${(+src.tour[2]).toLocaleString('en-US')} games`);
    if (st.mv && st.mv.length) L.push('Moves shown: ' + st.mv.slice(0, 5).map(([n, v]) => n + (v == null ? '' : ' ' + (+v).toFixed(1) + '%')).join(', '));
    if (st.it && st.it.length) L.push('Items shown: ' + st.it.slice(0, 3).map(([n, v]) => n + (v == null ? '' : ' ' + (+v).toFixed(1) + '%')).join(', '));
    if (st.ab && st.ab.length) L.push('Ability shown: ' + st.ab[0][0]);
    if (pf && pf.updated) L.push('Data from ' + String(pf.updated).slice(0, 10));
    return {title: p.d + ' info sheet', text: L.join('\n'), mon: p.n}; } } catch (e) {} return null; }
function fbMistake(key) { const c = fbMisContext(key); if (!c) return; FB.kind = 'mistake'; FB.ctx = c; fbOpen(); }
function fbOpen(fromMenu) { if (fromMenu) FB.ctx = null; if (!FB.ctx && FB.kind === 'mistake') FB.kind = 'idea'; FB.from = view; const C = FB.ctx; let w = $('fbSheet'); if (!w) { w = document.createElement('div'); w.id = 'fbSheet'; w.className = 'fbwrap'; document.body.appendChild(w); }
  w.hidden = false; w.innerHTML = `<div class="fbbox" role="dialog" aria-modal="true" aria-labelledby="fbT"><div class="fbh"><b id="fbT">${C ? 'Report a mistake' : 'Send feedback'}</b><button type="button" class="fbx" data-fbx="1" aria-label="Close">×</button></div>
    ${C ? `<p class="t2">This is sent with it, so you only need to say what's wrong (optional).</p><div class="fbctx"><b>${esc(C.title)}</b>${esc(C.text)}</div>`
      : `<p class="t2">Something off, confusing or missing? A line or two helps. We see the page you were on (${esc(VIEW_TITLE[FB.from] || FB.from)}).</p>
    <div class="seg fbkind" role="group" aria-label="Kind of feedback">${FB_KINDS.map(([k, t]) => `<button type="button" data-fbk="${k}" aria-pressed="${FB.kind === k}">${t}</button>`).join('')}</div>`}
    <textarea id="fbText" maxlength="1000" rows="${C ? 3 : 4}" placeholder="${C ? 'What looks wrong? (optional)' : 'What happened, or what would help?'}" aria-describedby="fbAnon"></textarea>${FB_ANON.replace('<p ', '<p id="fbAnon" ')}
    <div class="fbfoot"><span class="t2" id="fbMsg" role="status"></span><button type="button" class="btn go sm" id="fbSend">Send</button></div></div>`;
  setTimeout(() => { const t = $('fbText'); if (t) t.focus(); }, 30); }
/* personal details typed by mistake are removed before saving: email addresses, phone numbers (9+ digits, so damage
   ranges like "45.2 - 53.1%" and EV spreads stay) and @handles (not Showdown's "Mon @ Item", which has a space) */
function fbScrub(t) { let n = 0; t = String(t || '')
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, () => { n++; return '[email removed]'; })
  .replace(/\+?\d[\d\s().-]{7,}\d/g, m => (m.match(/\d/g) || []).length >= 9 ? (n++, '[number removed]') : m)
  .replace(/(^|[\s(])@[A-Za-z0-9_.]{2,}/g, (m, a) => { n++; return a + '[handle removed]'; });
  return {t, n}; }
const FB_ANON = '<p class="fbanon">Anonymous — please don\'t include personal info like your name or email.</p>';
function fbClose() { const w = $('fbSheet'); if (w) w.hidden = true; }
async function fbSend() { const ta = $('fbText'), msg = $('fbMsg'), btn = $('fbSend'); if (!ta || FB.busy) return; const t = ta.value.trim();
  const C = FB.kind === 'mistake' ? FB.ctx : null; if (t.length < 3 && !C) { msg.textContent = 'Write a few words first.'; return; }
  if (!FB.ok) { msg.textContent = "Can't send from here: your access level can't save data."; return; }
  FB.busy = true; btn.disabled = true; msg.textContent = 'Sending…'; const k = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6), sc = fbScrub(t.slice(0, 1000));
  const entry = {t: sc.t, k: FB.kind, v: FB.from || view, w: innerWidth < 760 ? 'phone' : 'desktop', d: new Date().toISOString().slice(0, 10)}; if (C) entry.c = String(C.title + '\n' + C.text).slice(0, 1200);
  try { const s = await FB.ref.get(); if (s.exists) await FB.ref.update({m: {[k]: entry}}); else await FB.ref.set({m: {[k]: entry}});
    track('feedback:' + FB.kind); fbClose(); toast((C ? 'Thanks! Mistake reported.' : 'Thanks! Feedback sent.') + (sc.n ? ' Personal details were removed.' : '')); if (C) { FB.ctx = null; FB.kind = 'idea'; } }
  catch (e) { msg.textContent = "Couldn't send. Try again in a moment."; btn.disabled = false; }
  finally { FB.busy = false; } }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-fbopen],[data-fbmis],[data-fbx],[data-fbk],#fbSend');
  if (!b) { if (e.target && e.target.id === 'fbSheet') fbClose(); return; }
  if (b.dataset.fbmis) fbMistake(b.dataset.fbmis); else if (b.dataset.fbopen) fbOpen(true); else if (b.dataset.fbx) fbClose(); else if (b.id === 'fbSend') fbSend();
  else if (b.dataset.fbk) { FB.kind = b.dataset.fbk; document.querySelectorAll('[data-fbk]').forEach(x => x.setAttribute('aria-pressed', x.dataset.fbk === FB.kind)); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fbClose(); });
const fbWhen = d => { try { const t = new Date(d); return isNaN(t) ? String(d || '') : t.toLocaleString(undefined, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}); } catch (e) { return ''; } };
// owner only: everyone's feedback, newest first
async function renderFeedback() { const el = $('fbOut'); if (!el || !FB.db) return; el.innerHTML = '<p class="t2">Loading…</p>'; let snap;
  try { snap = await FB.db.collection('feedback').get(); } catch (e) { el.innerHTML = '<p class="t2">Couldn\'t load feedback.</p>'; return; }
  const all = []; snap.docs.forEach((doc, i) => Object.values((doc.data() || {}).m || {}).forEach(x => all.push({...x, who: i + 1})));
  all.sort((a, b) => String(b.d).localeCompare(String(a.d)));  /* older messages carry a full time, newer ones the date only */
  if (!all.length) { el.innerHTML = '<p class="t2">No feedback yet.</p>'; return; }
  const kind = Object.fromEntries(FB_KINDS);
  el.innerHTML = `<p class="t2">${all.length} message${all.length === 1 ? '' : 's'} from ${snap.docs.length} ${snap.docs.length === 1 ? 'person' : 'people'}.</p><div class="fblist">${all.slice(0, 60).map(x =>
    `<div class="fbitem"><div class="fbmeta"><span class="fbtag ${esc(x.k || '')}">${esc(kind[x.k] || x.k || '')}</span>${esc(VIEW_TITLE[x.v] || x.v || '')} · ${esc(x.w || '')} · person ${x.who} · ${esc(fbWhen(x.d))}</div><div>${esc(x.t || '')}</div>${x.c ? `<div class="fbctx">${esc(x.c)}</div>` : ''}</div>`).join('')}</div>`; }
document.addEventListener('toggle', e => { const d = e.target; if (d && d.id === 'fbBox' && d.open) renderFeedback(); }, true);

// ---------- what's new: a short note shown once after each update ----------
// Bump WHATS_NEW.id with each release worth announcing. First-time visitors get the welcome card instead, so they're
// marked as having seen this one.
// WHATS_NEW: moved unchanged to 05-home-data.js (Nov 12; shared with the new build)
function whatsNewCard() { let seen = '', welcomed = ''; try { seen = LS.get('cc2.seenNew', ''); welcomed = LS.get('cc2.welcomed', ''); } catch (e) {}
  if (!welcomed) { try { LS.set('cc2.seenNew', WHATS_NEW.id); } catch (e) {} return ''; }
  // shown for the visit right after an update only (Sim, Nov 5): the first Home of that visit marks it seen, and it stays for
  // the rest of that visit (sessionStorage), then it's gone until the next update
  let sess = ''; try { sess = sessionStorage.getItem('np.wnew') || ''; } catch (e) {}
  if (seen === WHATS_NEW.id && sess !== WHATS_NEW.id) return '';
  try { LS.set('cc2.seenNew', WHATS_NEW.id); sessionStorage.setItem('np.wnew', WHATS_NEW.id); } catch (e) {}
  // a one-line fold: the list opens on tap (Oct 29, so Home fits in about three phone screens)
  return `<details class="wnew" id="wnewCard"><summary class="wnh"><span class="wk">What's new</span><span class="wns">${WHATS_NEW.items.length} updates: ${WHATS_NEW.items.slice(0, 2).map(([t]) => esc(t)).join(', ')}…</span><button type="button" class="fbx" data-wnewx="1" aria-label="Dismiss">×</button></summary>
    <ul>${WHATS_NEW.items.map(([t, d]) => `<li><b>${esc(t)}</b> <span>${esc(d)}</span></li>`).join('')}</ul></details>`; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-wnewx]'); if (!b) return; e.preventDefault();
  try { LS.set('cc2.seenNew', WHATS_NEW.id); sessionStorage.removeItem('np.wnew'); } catch (er) {} const c = $('wnewCard'); if (c) c.remove(); });
