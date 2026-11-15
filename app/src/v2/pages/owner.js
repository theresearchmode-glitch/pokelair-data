// ---------- usage counts and the owner's page (Sim, Nov 15: "we definitely want this ... only we can see") ----------
// Counting is today's (51-usage.js), unchanged in what it keeps: each viewer's document usage/<anonymous id> holds, per visit
// (a random key), the date (no time), phone or desktop, and counts of pages opened ("view:calc") and buttons tapped ("btn:...",
// named by the button's id or its first data attribute; folds as "open:<class>"). Nothing typed, no teams, no names. The same
// documents as today's site, so both sites' counts add up. Viewers whose access level can't save data aren't counted.
// '#owner' shows the counts (usageTally, shared) and the feedback, only when the page says the viewer is its owner.
V2.USE = {ref: null, db: null, sid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), c: {}, sent: '', busy: false, ok: false, keys: 0};
V2.OWN = false;
V2.track = k => { const U = V2.USE; if (!k) return; k = String(k).slice(0, k.slice(0, 4) === 'err:' ? 100 : 40); if (!(k in U.c)) { if (U.keys >= 150) return; U.keys++; } U.c[k] = (U.c[k] || 0) + 1; };
V2.useFlush = async () => { const U = V2.USE; if (!U.ok || U.busy) return; const j = JSON.stringify(U.c); if (j === U.sent || j === '{}') return; U.busy = true;
  try { await U.ref.update({s: {[U.sid]: Object.assign({d: new Date().toISOString().slice(0, 10), w: innerWidth < 760 ? 'phone' : 'desktop', c: JSON.parse(j)}, V2.useExtra())}}); U.sent = j; }
  catch (e) { if (e && (e.code === 'invalid_argument' || e.code === 'permission_denied' || e.code === 'not_granted')) U.ok = false; }
  finally { U.busy = false; } };
// Sim, Nov 15 ("all recommended"): three more anonymous facts per visit. g: screen group (phone under 760 px wide, tablet under
// 1100, else desktop); m: day or night mode; l: how long the page took to show, in tenths of a second (first load only). Errors
// are counts like the rest: 'err:<page>:<message>', the message cut to 60 characters and passed through fbScrub, so an email,
// phone number or @handle can never ride along. Nothing else is added.
V2.useExtra = () => ({g: innerWidth < 760 ? 'phone' : innerWidth < 1100 ? 'tablet' : 'desktop', m: V2.theme() === 'night' ? 'night' : 'day', l: V2.USE.load || 0});
addEventListener('load', () => { try { V2.USE.load = Math.max(1, Math.round(performance.now() / 100)); } catch (e) {} });
V2.useErr = msg => { try { const m = (typeof fbScrub === 'function' ? fbScrub(String(msg || 'error')).t : 'error').replace(/\s+/g, ' ').slice(0, 60); V2.track('err:' + V2.route() + ':' + m); } catch (e) {} };
addEventListener('error', e => V2.useErr(e && e.message));
addEventListener('unhandledrejection', e => V2.useErr(e && e.reason && (e.reason.message || e.reason)));
(async () => { try { const c = window.__NP_CLAUDE || window.claude; if (!c || !c.use) return; const [d, u] = await Promise.all([c.use('db'), c.use('user')]); if (!d || !u) return;
  const own = !!(u.isOwner && u.isOwner()); if (own) { V2.OWN = true; V2.USE.db = d; if (V2.route() === 'owner') V2.redraw(); }
  if (window.__NP_PREVIEW) return; /* the Preview's stand-in database keeps nothing: don't pretend to count */
  if (typeof u.can === 'function' && u.can('data.write') === false && !own) return;
  const id = await u.id(); if (!id) return; const U = V2.USE; U.ref = d.doc('usage/' + id);
  const s = await U.ref.get(); if (!s.exists) await U.ref.set({s: {}});
  U.ok = true; V2.track('visit'); V2.track('view:' + V2.route()); setInterval(V2.useFlush, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') V2.useFlush(); }); } catch (e) {} })();
addEventListener('hashchange', () => { const r = V2.route(); if (r !== 'owner') V2.track('view:' + r); });
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('button,summary'); if (!b) return;
  const k = b.id ? b.id : b.dataset ? Object.keys(b.dataset)[0] : ''; if (k) V2.track('btn:' + k);
  else if (b.tagName === 'SUMMARY') { const d = b.parentElement; V2.track('open:' + ((d && d.className && String(d.className).split(' ')[0]) || 'details')); } }, true);
// the owner's page: what people use, then what they wrote. Page names: the five main ones by their names, the rest by their key
V2.ownPage = k => ({home: 'Home', team: 'My Team', build: 'Build', battle: 'Battle', meta: 'Meta'})[k] || (k ? k.charAt(0).toUpperCase() + k.slice(1) : 'Home');
V2.useWord = k => { const [t, n = ''] = k.split(':'); if (t === 'view') return V2.ownPage(n) + ' (page)'; return (t === 'open' ? 'Opened ' : '') + n.replace(/^v2/, '').replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').trim().toLowerCase(); };
// the extras (Sim, Nov 15): errors, screens and mode, load time, and pages used together in one visit (no order is kept)
V2.ownMore = (docs, r) => { const E = V2.esc, G = {}, M = {}, L = [], pair = new Map(); let seen = 0;
  for (const doc of docs) for (const v of Object.values((doc.data() || {}).s || {})) {
    if (v.g) { seen++; G[v.g] = (G[v.g] || 0) + 1; } if (v.m) M[v.m] = (M[v.m] || 0) + 1; if (v.l) L.push(v.l / 10);
    const pg = Object.keys(v.c || {}).filter(k => k.slice(0, 5) === 'view:').map(k => k.slice(5)).sort();
    for (let i = 0; i < pg.length; i++) for (let j = i + 1; j < pg.length; j++) { const k = pg[i] + '|' + pg[j]; pair.set(k, (pair.get(k) || 0) + 1); } }
  const errs = r.rows.filter(x => x.k.slice(0, 4) === 'err:'), pct = (n, t) => Math.round(100 * n / Math.max(1, t)) + '%';
  L.sort((a, b) => a - b); const med = L.length ? L[Math.floor(L.length / 2)] : 0, slow = L.length ? L[Math.floor(L.length * .9)] : 0;
  const pairs = [...pair].sort((a, b) => b[1] - a[1]).slice(0, 12);
  return `<h3 class="own-h">Errors</h3>${errs.length ? `<table class="own-tab"><thead><tr><th>Page and message</th><th>People</th><th>Times</th></tr></thead><tbody>${errs.slice(0, 30).map(x => `<tr><td>${E(x.k.slice(4))}</td><td>${x.p}</td><td>${x.n}</td></tr>`).join('')}</tbody></table>` : '<p class="fine">No errors counted.</p>'}
    <h3 class="own-h">Screens and Mode</h3>${seen ? `<p class="fine">Of ${seen} visits from the new site: ${['phone', 'tablet', 'desktop'].map(k => `${E(k)} ${pct(G[k] || 0, seen)}`).join(' · ')}; night mode ${pct(M.night || 0, seen)}.</p>` : '<p class="fine">Not counted yet (the new site counts these).</p>'}
    <h3 class="own-h">Load Time</h3>${L.length ? `<p class="fine">Half of visits showed the page within ${med.toFixed(1)} s; 9 in 10 within ${slow.toFixed(1)} s (${L.length} visits).</p>` : '<p class="fine">Not counted yet.</p>'}
    <h3 class="own-h">Used Together in One Visit</h3>${pairs.length ? `<table class="own-tab"><thead><tr><th>Pages</th><th>Visits</th></tr></thead><tbody>${pairs.map(([k, n]) => `<tr><td>${k.split('|').map(x => E(V2.ownPage(x))).join(' + ')}</td><td>${n}</td></tr>`).join('')}</tbody></table><p class="fine">Which pages people open in the same visit. The order isn't kept.</p>` : '<p class="fine">Not enough visits yet.</p>'}`; };
V2.ownerFill = async () => { const el = document.querySelector('[data-ownuse]'), fb = document.querySelector('[data-ownfb]'), d = V2.USE.db, E = V2.esc; if (!el || !d) return;
  let snap = null; try { snap = await d.collection('usage').get(); } catch (e) {}
  if (!snap) el.innerHTML = `<p class="fine">${window.__NP_PREVIEW ? "The preview can't read the counts. They show on the real site." : "Couldn't load the counts."}</p>`;
  else { const r = usageTally(snap.docs); el.innerHTML = !r.people ? '<p class="fine">No visits counted yet.</p>' : `<p class="own-sum"><span><b class="u">${r.people}</b> ${r.people === 1 ? 'person' : 'people'}</span><span><b class="u">${r.visits}</b> visits</span><span><b class="u">${Math.round(100 * r.phone / Math.max(1, r.visits))}%</b> on phones</span></p><p class="fine">Sorted by how many people used each one. Counts from today's site and the new one add up.</p>
    <table class="own-tab"><thead><tr><th>Page or button</th><th>People</th><th>Times</th></tr></thead><tbody>${r.rows.filter(x => x.k.slice(0, 4) !== 'err:').slice(0, 60).map(x => `<tr><td>${E(V2.useWord(x.k))}</td><td>${x.p}</td><td>${x.n}</td></tr>`).join('')}</tbody></table>${V2.ownMore(snap.docs, r)}`; }
  if (!fb) return; let fs = null; try { fs = await d.collection('feedback').get(); } catch (e) {}
  if (!fs) { fb.innerHTML = `<p class="fine">${window.__NP_PREVIEW ? "The preview can't read feedback. It shows on the real site." : "Couldn't load feedback."}</p>`; return; }
  const all = [], K = Object.fromEntries(typeof FB_KINDS === 'object' ? FB_KINDS : []); fs.docs.forEach((doc, i) => Object.values((doc.data() || {}).m || {}).forEach(x => all.push({...x, who: i + 1})));
  all.sort((a, b) => String(b.d).localeCompare(String(a.d)));
  fb.innerHTML = !all.length ? '<p class="fine">No feedback yet.</p>' : `<p class="fine">${all.length} message${all.length === 1 ? '' : 's'} from ${fs.docs.length} ${fs.docs.length === 1 ? 'person' : 'people'}, newest first.</p><ul class="own-fb">${all.slice(0, 80).map(x => `<li><p class="fine"><b>${E(K[x.k] || x.k || '')}</b> · ${E(V2.ownPage(x.v || 'home'))} · ${E(x.w || '')} · person ${x.who} · ${E(String(x.d || '').slice(0, 10))}</p><p>${E(x.t || '')}</p>${x.c ? `<pre class="own-ctx">${E(x.c)}</pre>` : ''}</li>`).join('')}</ul>`; };
V2.pages.owner = {place: '', draw() {
  if (!V2.OWN) return `<div class="ra gsp infp"><section class="ra-h"><p class="np-eyebrow"><span>Owner</span></p><h1 class="u"><span>Only for</span> <span class="pl">the site's owner.</span></h1><p class="ra-lede">This page shows anonymous counts to the people who run NastyPlot.</p></section></div>`;
  setTimeout(V2.ownerFill, 0);
  return `<div class="ra gsp infp"><section class="ra-h"><p class="np-eyebrow"><span>Owner · only you see this</span></p><h1 class="u"><span>What people</span> <span class="pl">use and say.</span></h1><p class="ra-lede">Anonymous counts and feedback. No names, nothing typed except feedback people chose to send.</p></section>
    <div class="inf-two"><section><h2 class="u">What People Use</h2><div data-ownuse><p class="fine">Loading…</p></div></section><section><h2 class="u">Feedback</h2><div data-ownfb><p class="fine">Loading…</p></div></section></div></div>`; }};
