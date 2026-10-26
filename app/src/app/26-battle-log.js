// ---------- Battle log: your own results, by team, Pokémon and lead pair ----------
const logKey = names => names.slice().sort().join('|');
function logStats(entries) { const w = entries.filter(e => e.r === 'W').length; return {w, l: entries.length - w, n: entries.length, pct: entries.length ? Math.round(100 * w / entries.length) : 0}; }
function teamRecord(ms) { if (!S.log || !S.log.length || ms.length < 6) return null; const k = logKey(ms.map(m => m.p.n)); const e = S.log.filter(x => x.tm.length === 6 && logKey(x.tm) === k); return e.length ? logStats(e) : null; }
function renderLog() {
  const form = $('logForm'), out = $('logStats'); if (!form || !out) return;
  if (!Array.isArray(S.log)) S.log = [];
  const ms = members(); let pick = (ui.logPick || []).filter(n => ms.some(m => m.p.n === n));
  // until you change it, the log starts from the four Battle mode suggested (leads first)
  const fromPlan = !ui.logTouched && !pick.length && view === 'matchup' && Array.isArray(bmUi.four) && bmUi.four.length === 4 && bmUi.four.every(n => ms.some(m => m.p.n === n));
  if (fromPlan) pick = bmUi.four.slice(); else ui.logPick = pick;
  ui.logShown = pick;
  if (ms.length < 4) form.innerHTML = '<div class="empty-note">Add at least 4 Pokémon to your team to log a battle.</div>';
  else form.innerHTML = `<div class="logpicks">${ms.map(m => { const i = pick.indexOf(m.p.n);
      return `<button type="button" class="logpick${i >= 0 ? ' on' : ''}" data-logpick="${esc(m.p.n)}" aria-pressed="${i >= 0}">${sprite(m.p, 'mini')}<span>${esc(m.d)}</span>${i >= 0 ? `<b class="logord">${i < 2 ? 'Lead' : 'Back'} ${i + 1}</b>` : ''}</button>`; }).join('')}</div>
    <div class="logacts"><span class="vsub">${fromPlan ? 'Filled in from the plan · tap to change' : pick.length + '/4 picked'}${S.opp.some(Boolean) ? ` · saved with their ${S.opp.filter(Boolean).length}` : ''}</span>
      <button class="btn logwin" type="button" data-logres="W"${pick.length === 4 ? '' : ' disabled'}>Win</button><button class="btn logloss" type="button" data-logres="L"${pick.length === 4 ? '' : ' disabled'}>Loss</button></div>`;
  const L = S.log; if (!L.length) { out.innerHTML = '<div class="empty-note">No battles logged yet. Your record by team, Pokémon and lead pair shows up here.</div>'; return; }
  const all = logStats(L), tr = teamRecord(ms);
  const byMon = new Map(), byLead = new Map(), byOpp = new Map();
  for (const e of L) { for (const n of e.b) { const a = byMon.get(n) || []; a.push(e); byMon.set(n, a); }
    if (e.b.length >= 2) { const k = logKey(e.b.slice(0, 2)); const a = byLead.get(k) || []; a.push(e); byLead.set(k, a); }
    for (const n of e.o) { const a = byOpp.get(n) || []; a.push(e); byOpp.set(n, a); } }
  const dn = n => (byName.get(n) || {}).d || n;
  const row = (label, st) => `<div class="logrow"><span class="lgl">${label}</span><span class="lgbar"><i style="--w:${st.pct}%"></i></span><b>${st.w}-${st.l}</b><span class="vsub">${st.pct}%</span></div>`;
  const mons = [...byMon].map(([n, e]) => [n, logStats(e)]).sort((a, b) => b[1].n - a[1].n).slice(0, 8);
  const leads = [...byLead].map(([k, e]) => [k, logStats(e)]).filter(x => x[1].n >= 2).sort((a, b) => b[1].pct - a[1].pct || b[1].n - a[1].n).slice(0, 4);
  const opps = [...byOpp].map(([n, e]) => [n, logStats(e)]).filter(x => x[1].n >= 3).sort((a, b) => a[1].pct - b[1].pct).slice(0, 4);
  const when = t => { try { return new Date(t).toLocaleDateString([], {month: 'short', day: 'numeric'}); } catch (e) { return ''; } };
  out.innerHTML = `<div class="logsum"><div><b>${all.w}-${all.l}</b><span>overall · ${all.pct}%</span></div>${tr ? `<div><b>${tr.w}-${tr.l}</b><span>this team · ${tr.pct}%</span></div>` : ''}<div><b>${L.length}</b><span>battles logged</span></div></div>
    <div class="loggrid"><div class="stat"><h4>Your Pokémon</h4>${mons.map(([n, st]) => row(esc(dn(n)), st)).join('')}</div>
      ${leads.length ? `<div class="stat"><h4>Lead pairs (2+ games)</h4>${leads.map(([k, st]) => row(k.split('|').map(x => esc(dn(x))).join(' + '), st)).join('')}</div>` : ''}
      ${opps.length ? `<div class="stat"><h4>Toughest opponents (3+ games)</h4>${opps.map(([n, st]) => row(esc(dn(n)), st)).join('')}</div>` : ''}</div>
    <details class="loglist"><summary>Recent battles</summary>${L.slice(-15).reverse().map(e => `<div class="logitem"><span class="res ${e.r === 'W' ? 'w' : 'l'}">${e.r}</span><span class="t2">${when(e.t)}</span><span class="lgb">${e.b.map(n => esc(dn(n))).join(', ')}${e.o.length ? ` <span class="vsub">vs ${e.o.slice(0, 3).map(n => esc(dn(n))).join(', ')}${e.o.length > 3 ? '…' : ''}</span>` : ''}</span><button type="button" class="x" data-logdel="${e.t}" aria-label="Delete this battle">×</button></div>`).join('')}</details>`;
}
document.addEventListener('click', e => { const t = e.target; if (!t || !t.closest) return; const g = t.closest('[data-logpick],[data-logres],[data-logdel]'); if (!g) return; const d = g.dataset;
  if (d.logpick) { ui.logTouched = true; const p = ui.logShown || ui.logPick || []; ui.logPick = p.includes(d.logpick) ? p.filter(x => x !== d.logpick) : (p.length >= 4 ? p : [...p, d.logpick]); renderLog(); return; }
  if (d.logres) { const p = ui.logShown || ui.logPick || []; if (p.length !== 4) return; if (!Array.isArray(S.log)) S.log = [];
    S.log.push({t: Date.now(), r: d.logres, b: p.slice(), tm: members().map(m => m.p.n), o: S.opp.filter(Boolean)}); if (S.log.length > 400) S.log = S.log.slice(-400);
    ui.logPick = []; ui.logTouched = false; persist(); renderLog(); safe('verdict', () => render()); toast(d.logres === 'W' ? 'Win logged' : 'Loss logged'); return; }
  if (d.logdel) { const k = +d.logdel; S.log = (S.log || []).filter(x => x.t !== k); persist(); renderLog(); toast('Battle deleted'); } });

