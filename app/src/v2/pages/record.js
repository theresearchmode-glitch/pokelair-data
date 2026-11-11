// ---------- Your Games (R4, Nov 11; one line on the page since Sim's review: the record or "None logged yet", and Log a Game): the games you log with this six, kept apart from the tournament record ----------
// Today's shared steps (26-log-data.js): myGames, myInsights, logGame, unlogGame. Shown once the team has all six (as today).
// The Showdown replay link arrives with the Battle page (it fills the leads and their six from a replay there).
V2.ql = {leads: [], opp: [], last: null, q: ''};
V2.ygSec = ms => { if (!ms || ms.length !== 6) return ''; const G = myGames(ms), ins = myInsights(G), E = V2.esc, L = V2.ql.last;
  const last = L && (S.log || []).some(x => x.t === L.t) ? `<p class="tm-yg-last" role="status">${L.r === 'W' ? 'Win' : 'Loss'} logged. <button type="button" class="np-link" data-ygundo="${L.t}">Undo</button></p>` : '';
  const more = G && !ins ? `<p class="tm-sub">Log ${MYREC_MIN - G.n} more game${MYREC_MIN - G.n === 1 ? '' : 's'} with this six to see who you lose to most and how your leads do.</p>` : '';
  return `<section class="tm-sec tm-yg" id="tm-yg"><h2 class="u">Your Games</h2>
    <div class="tm-yg-hd">${G ? `<p class="tm-yg-n"><b>${G.w}–${G.l}</b><span>${G.n} game${G.n === 1 ? '' : 's'} logged</span></p>` : '<p class="tm-yg-n tm-yg-0"><span>None logged yet</span></p>'}
    <button type="button" class="np-btn2" data-yglog><span>Log a Game</span></button></div>${last}
    ${ins ? `<ul class="tm-yg-ins">${ins.map(s => `<li>${E(s)}</li>`).join('')}</ul>` : more}</section>`; };

// the log sheet: leads (pick two, optional), their team (up to six, optional), then Win or Loss
V2.ygHtml = () => { const ms = members(), q = V2.ql, E = V2.esc, so = (S.opp || []).filter(n => byName.has(n));
  const lp = q.leads.filter(n => ms.some(m => m.p.n === n));
  const hits = q.q.trim() ? V2.find(q.q).mons.filter(p => !q.opp.includes(p.n)).slice(0, 6) : [];
  return `<div class="yg2"><div class="np-eyebrow">Your Games</div><h2 class="u">Log a Game</h2>
    <p class="tm-sub yg2-why">Log your games with this six to see your own record, who beats you most and how your leads do. They stay apart from the tournament record.</p>
    <h3 class="yg2-h">Your two leads <small>optional</small></h3>
    <div class="yg2-leads">${ms.map(m => { const on = lp.includes(m.p.n); return `<button type="button" class="yg2-l" data-yglead="${E(m.p.n)}" aria-pressed="${on}" aria-label="${E(m.d)}${on ? ', lead' : ''}">${V2.mon(m.p.n, {iw: 64, sel: on})}</button>`; }).join('')}</div>
    <h3 class="yg2-h">Their team <small>optional</small></h3>
    <div class="yg2-opp">${q.opp.map((n, i) => `<span class="yg2-o">${V2.mon(n, {iw: 48, bare: true})}<b>${E(V2.disp(n))}</b><button type="button" data-ygoppx="${i}" aria-label="Remove ${E(V2.disp(n))}">×</button></span>`).join('')}</div>
    ${q.opp.length < 6 ? `<label class="np-field yg2-q">${V2.ICON.search}<input type="search" data-ygq value="${E(q.q)}" placeholder="Add their Pokémon" aria-label="Add one of their Pokémon" autocomplete="off"></label>
      <div class="hits yg2-hits">${hits.map(p => `<button type="button" class="np-hit" data-ygopp="${E(p.n)}"><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy"><b>${V2.nameHtml(V2.disp(p.n))}</b></button>`).join('')}</div>` : ''}
    ${so.length && !q.opp.length ? `<button type="button" class="np-link yg2-bm" data-ygbm>Use their ${so.length} from Battle mode: ${E(so.slice(0, 3).map(n => byName.get(n).d).join(', '))}${so.length > 3 ? '…' : ''}</button>` : ''}
    <div class="yg2-res"><button type="button" class="np-btn" data-ygres="W">Win</button><button type="button" class="np-btn2" data-ygres="L"><span>Loss</span></button></div></div>`; };
V2.ygOpen = () => { V2.ql.leads = []; V2.ql.opp = []; V2.ql.q = ''; V2.sheet(V2.ygHtml(), {label: 'Log a game', small: true, focus: '[data-yglead]'}); };
V2.ygRe = focusQ => { const box = document.querySelector('.yg2'); if (!box) return; box.outerHTML = V2.ygHtml();
  if (focusQ) { const i = document.querySelector('[data-ygq]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-yglog],[data-yglead],[data-ygoppx],[data-ygopp],[data-ygbm],[data-ygres],[data-ygundo]'); if (!t) return; const d = t.dataset, q = V2.ql;
  if (d.yglog !== undefined) V2.ygOpen();
  else if (d.yglead) { q.leads = q.leads.includes(d.yglead) ? q.leads.filter(x => x !== d.yglead) : [...q.leads, d.yglead].slice(-2); V2.ygRe(); }
  else if (d.ygoppx !== undefined) { q.opp.splice(+d.ygoppx, 1); V2.ygRe(); }
  else if (d.ygopp) { if (!q.opp.includes(d.ygopp) && q.opp.length < 6) q.opp.push(d.ygopp); q.q = ''; V2.ygRe(true); }
  else if (d.ygbm !== undefined) { q.opp = (S.opp || []).filter(n => byName.has(n)).slice(0, 6); V2.ygRe(); }
  // only leads on this six are logged (today's page can keep an old team's pair: bug queue 2)
  else if (d.ygres) { const ms = members(), x = logGame(d.ygres, q.leads.filter(n => ms.some(m => m.p.n === n)), q.opp); if (!x) return; persist();
    q.last = {t: x.t, r: x.r}; q.leads = []; q.opp = []; V2.closeSheet(true); V2.redraw(); }
  else if (d.ygundo) { unlogGame(+d.ygundo); q.last = null; persist(); V2.redraw(); toast('Game removed'); } });
document.addEventListener('input', e => { if (e.target.matches && e.target.matches('[data-ygq]')) { V2.ql.q = e.target.value; V2.ygRe(true); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-ygq]')) { const h = document.querySelector('[data-ygopp]'); if (h) { e.preventDefault(); h.click(); } } });
