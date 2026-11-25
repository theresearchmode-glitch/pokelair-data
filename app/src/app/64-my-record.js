/* ---------- Your games: the battle log fed back into the team (Nov) ----------
   S.log (26-battle-log.js, saved with the rest of your state by 03-persistence.js) holds one entry per game:
   {t: time, r: 'W'|'L', b: the Pokémon you brought (first two = leads), tm: your six, o: their Pokémon}. A record counts only
   games logged with these exact six (matched by species, order ignored). Kept apart from the grade's tournament record:
   "Your games" here, "Tournament record" there. Plain counts, never a win chance. */
/* MYREC_MIN, myGames and myInsights live in 26-log-data.js (shared with the new build, R4 Nov 11) */
ui.ql = ui.ql || {open: false, leads: [], opp: [], last: null};
function myRecCard(ms) { const G = myGames(ms), ins = myInsights(G), q = ui.ql;
  const head = `<div class="myrech"><div style="min-width:0"><div class="chk">Your games · this six</div>${G ? `<div class="myrecn"><b>${G.w}–${G.l}</b><span class="t2">${G.n} game${G.n === 1 ? '' : 's'} you logged</span></div>` : '<div class="myrecn"><span class="t2">None logged yet.</span></div>'}</div>
    <button type="button" class="chghost" data-qlopen="1" aria-expanded="${q.open}">${q.open ? 'Close' : 'Log a game'}</button></div>`;
  const last = q.last && S.log.some(x => x.t === q.last.t) ? `<div class="qllast" role="status">${q.last.r === 'W' ? 'Win' : 'Loss'} logged.<button type="button" class="linkbtn" data-qlundo="${q.last.t}">Undo</button></div>` : '';
  const insight = G ? (ins ? `<ul class="myins">${ins.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : `<p class="t2 myins0">Log ${MYREC_MIN - G.n} more game${MYREC_MIN - G.n === 1 ? '' : 's'} with this six to see who you lose to most and how your leads do.</p>`) : '';
  let panel = '';
  if (q.open) { const lp = q.leads.filter(n => ms.some(m => m.p.n === n)), so = (S.opp || []).filter(n => byName.has(n));
    panel = `<div class="qlog"><div class="chk">Your two leads · optional</div>
      <div class="qlleads">${ms.map(m => { const i = lp.indexOf(m.p.n); return `<button type="button" class="qllead${i >= 0 ? ' on' : ''}" data-qllead="${esc(m.p.n)}" aria-pressed="${i >= 0}" aria-label="${esc(m.d)}${i >= 0 ? ', lead' : ''}">${sprite(m.p) || ''}<span>${esc(m.d)}</span></button>`; }).join('')}</div>
      <div class="chk">Their team · optional</div>
      <div class="qlopp">${q.opp.map((n, i) => `<span class="corechip">${sprite(byName.get(n), 'tiny') || ''}${esc((byName.get(n) || {}).d || n)}<button type="button" data-qloppx="${i}" aria-label="Remove ${esc((byName.get(n) || {}).d || n)}">×</button></span>`).join('')}
        ${q.opp.length < 6 ? `<div class="cb qlin"><input class="field" id="qlOppIn" placeholder="Add their Pokémon" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Add one of their Pokémon"></div>` : ''}</div>
      ${so.length && !q.opp.length ? `<button type="button" class="linkbtn" data-qlbm="1">Use their ${so.length} from Battle mode: ${esc(so.slice(0, 3).map(n => byName.get(n).d).join(', '))}${so.length > 3 ? '…' : ''}</button>` : ''}
      <div class="qlres"><button type="button" class="btn ar-btn qlwin" data-qlres="W">Win</button><button type="button" class="btn ar-btn qlloss" data-qlres="L">Loss</button></div>
      <p class="t2">Have a Showdown replay? <button type="button" class="linkbtn" data-qlreplay="1">Paste its log</button> and the leads and their six are filled in for you.</p></div>`; }
  return `<div class="myrec" id="myRec">${head}${last}${panel}${q.open ? "" : insight}</div>`; }
function renderMyRec() { const head = $('chTeam'); if (!head) return; const old = $('myRec'); const ms = members();
  if (ms.length !== 6) { if (old) old.remove(); return; }
  const w = document.createElement('div'); w.innerHTML = myRecCard(ms); const card = w.firstElementChild;
  const tg = head.querySelector('.ar-tcolR') || head.querySelector('.ar-tgrid'); /* Nov 10 (Sim: no empty strips): it sits in the team grid, under the actions */
  if (old && (!tg || tg.contains(old))) old.replaceWith(card); else { if (old) old.remove(); const at = head.querySelector('.chgwhy') || head.querySelector('.chthead'); if (tg) tg.append(card); else if (at) at.after(card); else head.append(card); }
  const inp = $('qlOppIn'); if (inp) bindMonInput(inp, p => { if (!ui.ql.opp.includes(p.n) && ui.ql.opp.length < 6) ui.ql.opp.push(p.n); renderMyRec(); const n = $('qlOppIn'); if (n) n.focus(); }, p => !ui.ql.opp.includes(p.n)); }
CH.wrap('chTeamRender', () => renderMyRec());
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-qlopen],[data-qllead],[data-qlres],[data-qlundo],[data-qloppx],[data-qlbm],[data-qlreplay]'); if (!b) return; const d = b.dataset, q = ui.ql;
  if (d.qlopen) { q.open = !q.open; if (q.open) { q.leads = []; q.opp = []; } renderMyRec(); return; }
  if (d.qllead) { q.leads = q.leads.includes(d.qllead) ? q.leads.filter(x => x !== d.qllead) : [...q.leads, d.qllead].slice(-2); renderMyRec(); return; }
  if (d.qloppx != null) { q.opp.splice(+d.qloppx, 1); renderMyRec(); return; }
  if (d.qlbm) { q.opp = (S.opp || []).filter(n => byName.has(n)).slice(0, 6); renderMyRec(); return; }
  if (d.qlreplay) { setView('matchup'); setTimeout(() => { const r = document.querySelector('#replayBox details'); if (r) { r.open = true; r.scrollIntoView({block: 'start'}); const t = $('replayIn'); if (t) t.focus(); } }, 60); return; }
  if (d.qlres) { const x = logGame(d.qlres, q.leads, q.opp); if (!x) return; persist();
    q.open = false; q.leads = []; q.opp = []; q.last = {t: x.t, r: x.r}; renderMyRec(); safe('battle log', renderLog); safe('saved teams', renderSaved); return; }
  if (d.qlundo) { const k = +d.qlundo; unlogGame(k); q.last = null; persist(); renderMyRec(); safe('battle log', renderLog); safe('saved teams', renderSaved); toast('Game removed'); } });
