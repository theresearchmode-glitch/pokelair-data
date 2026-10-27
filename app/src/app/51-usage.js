// ---------- usage counts: which pages and buttons people actually use ----------
// So the page can be redesigned around what's popular, not guesses. Anonymous: each viewer has one document,
// usage/<their opaque id>, holding only counts ("view:calc": 3, "btn:plan": 1) per visit. No names, no teams, nothing
// typed. Only the page's owner can read them (the db rules declared at publish). Viewers whose sharing level can't save
// data (Viewer, Commenter, signed out) simply aren't counted.
// var, not const: the first page switch (and its track call) runs before this file does
var USE = {ref: null, sid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), c: {}, sent: '', busy: false, ok: false, keys: 0};
function track(k) { if (!k) return; k = String(k).slice(0, 40); if (!(k in USE.c)) { if (USE.keys >= 150) return; USE.keys++; } USE.c[k] = (USE.c[k] || 0) + 1; }
// this visit's counts, merged into the viewer's document under its own key (absolute values, so a retry never double counts)
async function usageFlush() { if (!USE.ok || USE.busy) return; const j = JSON.stringify(USE.c); if (j === USE.sent || j === '{}') return; USE.busy = true;
  try { await USE.ref.update({last: new Date().toISOString().slice(0, 10), s: {[USE.sid]: {d: new Date().toISOString().slice(0, 10), w: innerWidth < 760 ? 'phone' : 'desktop', c: JSON.parse(j)}}}); USE.sent = j; }
  catch (e) { if (e && (e.code === 'invalid_argument' || e.code === 'permission_denied' || e.code === 'not_granted')) USE.ok = false; }
  finally { USE.busy = false; } }
(async () => { try { const c = window.claude; if (!c || !c.use) return; const [d, u] = await Promise.all([c.use('db'), c.use('user')]); if (!d || !u) return;
  if (typeof u.can === 'function' && u.can('data.write') === false && !(u.isOwner && u.isOwner())) return;
  const id = await u.id(); if (!id) return; USE.ref = d.doc('usage/' + id);
  const s = await USE.ref.get(); if (!s.exists) await USE.ref.set({first: new Date().toISOString().slice(0, 10), s: {}});
  USE.ok = true; track('visit'); setInterval(usageFlush, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') usageFlush(); });
  if (u.isOwner && u.isOwner()) { ui.usageOwner = true; ui.usageDb = d; } } catch (e) {} })();
// every button press, named by its id or its first data attribute (data-plan -> "btn:plan"); page changes as "view:..."
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('button,summary,a'); if (!b) return;
  if (b.dataset && b.dataset.view) return; // counted as a page view by setView
  const k = b.id ? b.id : b.dataset ? Object.keys(b.dataset)[0] : ''; if (k) track('btn:' + k);
  else if (b.tagName === 'SUMMARY') { const d = b.parentElement; track('open:' + ((d && d.className && String(d.className).split(' ')[0]) || 'details')); } }, true);
// owner only: what people use, from everyone's counts
async function usageReport() { const d = ui.usageDb; if (!d) return null; let snap; try { snap = await d.collection('usage').get(); } catch (e) { return null; }
  const tot = new Map(), ppl = new Map(); let people = 0, visits = 0, phone = 0;
  for (const doc of snap.docs) { const v = doc.data() || {}, mine = new Set(); people++;
    for (const s of Object.values(v.s || {})) { visits++; if (s.w === 'phone') phone++; for (const [k, n] of Object.entries(s.c || {})) { tot.set(k, (tot.get(k) || 0) + (+n || 0)); mine.add(k); } }
    for (const k of mine) ppl.set(k, (ppl.get(k) || 0) + 1); }
  const rows = [...tot].filter(([k]) => k !== 'visit').map(([k, n]) => ({k, n, p: ppl.get(k) || 0})).sort((a, b) => b.p - a.p || b.n - a.n);
  return {people, visits, phone, rows}; }
const USE_WORD = k => { const [t, n] = k.split(':'); if (t === 'view') return (VIEW_TITLE[n] || n) + ' (page)'; return (t === 'open' ? 'Opened ' : '') + n.replace(/([A-Z])/g, ' $1').toLowerCase(); };
async function renderUsage() { const el = $('usageOut'); if (!el || !ui.usageOwner) return; el.innerHTML = '<p class="t2">Loading…</p>'; const r = await usageReport();
  if (!r || !r.people) { el.innerHTML = '<p class="t2">No visits counted yet.</p>'; return; }
  el.innerHTML = `<p class="t2">${r.people} ${r.people === 1 ? 'person' : 'people'} · ${r.visits} visits · ${Math.round(100 * r.phone / Math.max(1, r.visits))}% on phones. Sorted by how many people used each one.</p>
    <table class="usetab"><thead><tr><th>Page or button</th><th>People</th><th>Times</th></tr></thead><tbody>${r.rows.slice(0, 40).map(x => `<tr><td>${esc(USE_WORD(x.k))}</td><td>${x.p}</td><td>${x.n}</td></tr>`).join('')}</tbody></table>`; }
document.addEventListener('toggle', e => { const d = e.target; if (d && d.id === 'usageBox' && d.open) renderUsage(); }, true);
