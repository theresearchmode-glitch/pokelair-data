/* ---------- Your games: the battle log fed back into the team (Nov) ----------
   S.log (26-battle-log.js, saved with the rest of your state by 03-persistence.js) holds one entry per game:
   {t: time, r: 'W'|'L', b: the Pokémon you brought (first two = leads), tm: your six, o: their Pokémon}. A record counts only
   games logged with these exact six (matched by species, order ignored). Kept apart from the grade's tournament record:
   "Your games" here, "Tournament record" there. Plain counts, never a win chance. */
const MYREC_MIN = 5;
function myGames(ms) { if (!ms || ms.length !== 6 || !Array.isArray(S.log) || !S.log.length) return null; const k = logKey(ms.map(m => (m.p || m).n));
  const e = S.log.filter(x => x.tm && x.tm.length === 6 && logKey(x.tm) === k); if (!e.length) return null; const w = e.filter(x => x.r === 'W').length;
  return {n: e.length, w, l: e.length - w, e}; }
/* what the log says, once there are enough games: who you lose to, which archetypes, which leads */
function myInsights(G) { if (!G || G.n < MYREC_MIN) return null; const out = [], L = G.e.filter(x => x.r === 'L'), W = G.e.filter(x => x.r === 'W');
  const dn = n => (byName.get(n) || {}).d || n;
  if (!L.length) out.push(`No losses yet in ${G.n} games with this six.`);
  else { const Lo = L.filter(x => x.o.length), Wo = W.filter(x => x.o.length);
    if (!Lo.length) out.push(`None of your ${L.length} loss${L.length === 1 ? '' : 'es'} has their team logged, so there's nothing to say about who beats you yet.`);
    else { const cnt = new Map(); for (const x of Lo) for (const n of new Set(x.o)) cnt.set(n, (cnt.get(n) || 0) + 1);
      const top = [...cnt].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 2);
      const base = Lo.length === L.length ? `your ${L.length} losses` : `the ${Lo.length} losses with their team logged (${L.length} in all)`;
      /* one line: each Pokémon with how many of those losses it was on, and (for contrast) how many of the logged wins */
      if (top.length) { const inW = n => Wo.filter(x => x.o.includes(n)).length;
        out.push(`You lose most to ${top.map(([n, c]) => `${dn(n)} (${c} loss${c === 1 ? '' : 'es'}${Wo.length ? `, ${inW(n)} win${inW(n) === 1 ? '' : 's'}` : ''})`).join(' and ')}. Counted over ${base}${Wo.length ? ` and the ${Wo.length} wins with their team logged` : ''}.`); }
      /* archetypes: from their team as logged (4+ Pokémon), read the same way as everywhere else in the app */
      const La = Lo.filter(x => x.o.length >= 4), ac = new Map();
      for (const x of La) { let lab = ''; try { lab = teamPlanLabel(x.o); } catch (e) {} for (const p of new Set(String(lab).split(' · ').filter(Boolean))) ac.set(p, (ac.get(p) || 0) + 1); }
      const ta = [...ac].filter(([p, c]) => c >= 2 && !/^Balance/.test(p)).sort((a, b) => b[1] - a[1])[0];
      if (ta) out.push(`${ta[0]} teams: ${ta[1]} of the ${La.length} losses where you logged 4+ of their Pokémon.`);
      if (!top.length && !ta) out.push(`No opposing Pokémon shows up in more than one of ${base}.`); } }
  /* leads: the first two you brought */
  const byLead = new Map(); for (const x of G.e) if (x.b.length >= 2) { const k = logKey(x.b.slice(0, 2)); (byLead.get(k) || byLead.set(k, []).get(k)).push(x); }
  const leads = [...byLead].sort((a, b) => b[1].length - a[1].length).slice(0, 2);
  const nl = G.e.filter(x => x.b.length >= 2).length;
  if (leads.length) out.push(`Most used leads (${nl} game${nl === 1 ? '' : 's'} with leads logged): ${leads.map(([k, e]) => { const w = e.filter(x => x.r === 'W').length; return `${k.split('|').map(dn).join(' + ')} ${w}–${e.length - w}`; }).join(' · ')}.`);
  if (!nl) out.push('No leads logged yet: tap your two leads before the result to see how each lead does.');
  return out; }
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
  if (d.qlres) { const ms = members(); if (ms.length !== 6) return; if (!Array.isArray(S.log)) S.log = [];
    const leads = q.leads.length === 2 ? q.leads.slice() : [], x = {t: Date.now(), r: d.qlres, b: leads, tm: ms.map(m => m.p.n), o: q.opp.slice(0, 6)};
    S.log.push(x); if (S.log.length > 400) S.log = S.log.slice(-400); persist();
    q.open = false; q.leads = []; q.opp = []; q.last = {t: x.t, r: x.r}; renderMyRec(); safe('battle log', renderLog); safe('saved teams', renderSaved); return; }
  if (d.qlundo) { const k = +d.qlundo; S.log = (S.log || []).filter(x => x.t !== k); q.last = null; persist(); renderMyRec(); safe('battle log', renderLog); safe('saved teams', renderSaved); toast('Game removed'); } });
