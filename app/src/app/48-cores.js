// ---------- Winning cores: pairs, trios and full teams from real tournament results ----------
// From the results document (RES): every pair and trio seen on enough tournament teams, and the exact six-Pokémon
// lists ("proven teams"). Sorted by win rate (pulled toward average when there are few entries) or by how often they
// show up. Each row says what the core does, and can be added to your team or searched in Top teams.
// coreUi, CORE_MIN, coreRows, coreTagCache, coreTags, corePlan, andList, coreConfirmText: moved unchanged to 47-core-data.js (Nov 12; shared with the new build)
function renderCores() {
  const el = $('coreOut'); if (!el) return;
  if (!RES) { el.innerHTML = '<div class="empty-note">Cores appear once tournament results have loaded.</div>'; return; }
  const rows = coreRows(), cap = 10 + coreUi.more * 15, base = +RES.base || .5;
  const seg = (k, opts) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button type="button" data-core${k}="${v}" aria-pressed="${coreUi[k] === v}">${t}</button>`).join('')}</div>`;
  const mon = coreUi.mon && byName.get(coreUi.mon);
  const ctl = `<div class="corectl">${seg('kind', [['pairs', 'Pairs'], ['trios', 'Trios'], ['teams', 'Full teams']])}${seg('sort', [['win', 'Top rated'], ['use', 'Most used']])}
    <div class="corefind">${mon ? `<span class="corechip">${sprite(mon, 'tiny')}${esc(mon.d)}<button type="button" data-corex="1" aria-label="Clear">×</button></span>` : '<div class="cb"><input class="field" id="coreMonIn" placeholder="With a Pokémon…" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Only cores with this Pokémon"></div>'}</div></div>`;
  const what = coreUi.kind === 'pairs' ? `two Pokémon on the same team, ${CORE_MIN.pairs}+ teams` : coreUi.kind === 'trios' ? `three Pokémon on the same team, ${RES.minCore || 6}+ teams` : `the exact six, ${CORE_MIN.teams}+ entries`;
  // one plain line, the full explanation behind the "?" (Sim, Nov 5: a whole fold for one line was a bad use of space)
  const coreWhy = coreWhyText(what, base);
  const intro = `<p class="t2 coreintro coreline">From ${(+RES.teams || 0).toLocaleString('en-US')} tournament teams. Average team wins ${winFmt(100 * base)} of games. ${coreUi.sort === 'win' ? 'Ranked by win rate, pulled toward the average.' : 'Ranked by how many teams used it.'} ${tipText('cores', 'How cores are ranked', coreWhy.replace(/<[^>]+>/g, ''))}</p>`;
  if (!rows.length) { el.innerHTML = ctl + intro + '<div class="empty-note">No cores match. Try another Pokémon.</div>'; bindCoreIn(); return; }
    const list = rows.slice(0, cap).map((x, i) => { const key = x.ns.join('|'), tags = coreTags(x.ns), ps = x.ns.map(n => byName.get(n));
    const conf = coreUi.confirm === key;
    const names = ps.map(p => esc(p.d)).join(x.ns.length > 3 ? ', ' : ' + ');
    return `<div class="corerow tyacc${x.ns.length > 3 ? ' six' : ''}" style="${tyv(ps[0], ps[1])}"${dbAttr('core:' + key)}><span class="corerk">${i + 1}</span>
      <div class="coremain"><div class="coresprs">${ps.map(p => sprH(p, 'coresp')).join('')}</div><div class="corenames">${names}</div>
        ${tags.length ? `<div class="coretags">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}</div>
      <div class="corestat" title="${pctTxt(x.use)} of all tournament teams"><b title="${coreUi.sort === 'use' ? 'Win rate' : `Win rate, pulled toward average until there are enough games (raw: ${winFmt(100 * x.wr)})`}">${winFmt(100 * (coreUi.sort === 'use' ? x.wr : x.score))}<i> wins</i></b><span class="dbsec ${(coreUi.sort === 'use' ? x.d : x.score - base) >= 0 ? 'up' : 'dn'}">${(coreUi.sort === 'use' ? x.d : x.score - base) >= 0 ? '+' : '−'}${ptsTxt(Math.abs(100 * (coreUi.sort === 'use' ? x.d : x.score - base)))} points vs avg</span><small class="dbsec">${thinFor(x.n, 'recteams') ? 'Early read, ' : ''}${x.n.toLocaleString('en-US')} ${x.ns.length > 3 ? 'entr' + (x.n === 1 ? 'y' : 'ies') : 'teams'}</small>${x.tog != null ? `<small class="dbsec" title="Adjusted win rate minus what its members win on their own">${x.tog >= 0 ? "+" : "−"}${ptsTxt(Math.abs(100 * x.tog))} points together</small>` : ''}<small class="dbsec">${pctTxt(x.use)} of all teams</small>${dbBtn('core:' + key, 'team count and how much better together')}</div>
      <div class="row corebtns">${conf ? `<span class="inline-confirm" style="color:var(--ink)">${esc(coreConfirmText(x.ns))}</span><button class="btn sm primary" type="button" data-coreuse="${esc(key)}" data-sure="1">Replace</button><button class="btn sm" type="button" data-corecx="1">Cancel</button>`
        : `<button class="btn sm" type="button" data-coreuse="${esc(key)}">${x.ns.length > 3 ? 'Load team' : 'Add to my team'}</button>${x.ns.length <= 3 ? `<button class="linkbtn" type="button" data-corefind="${esc(key)}">Teams with it</button>` : `<button class="linkbtn" type="button" data-corepractice="${esc(key)}">Practice against</button>${sdBtn('core:' + key)}`}`}</div></div>`; }).join('');
  el.innerHTML = ctl + intro + `<div class="corelist">${list}</div>` + (rows.length > cap ? `<div class="morebar"><button class="btn sm" type="button" data-coremore="1">Show more (${rows.length - cap} left)</button></div>` : '');
  bindCoreIn(); }
function bindCoreIn() { const i = $('coreMonIn'); if (i) bindMonInput(i, p => { coreUi.mon = p.n; coreUi.more = 0; renderCores(); }); }
function useCore(ns, sure) {
  const cur = S.slots.filter(s => byName.get(s.n)), have = new Set(cur.map(s => s.n));
  // Nov 9 (Sim: "pressed Load team and nothing happened, no pop up"): the in-row "Replace your team?" question was easy to miss,
  // so the team now loads straight away, like "Use this team" in Build for Me, with Undo in the toast
  // a six that appears in a recent event loads with that player's moves and items (Nov 9: names alone gave every Pokémon its most
  // common set, and some top teams then graded a C; with their own sheets 80% of online top-4 teams grade B or better)
  if (ns.length > 3 && typeof loadSheet === 'function' && META.events && META.events.events) { const k = ns.slice().sort().join('|');
    for (const ev of META.events.events) for (const t of ev.top || []) if (t && t.mons && t.mons.length === 6 && t.mons.map(m => m.n).sort().join('|') === k) { loadSheet(t); return true; } }
  if (ns.length > 3) { keepUndo(); S.slots = normSlots(ns.map(n => ({n, a: null, lock: false}))); S.format = 'doubles'; S.loadedId = null; render(); setView('build'); toast(cur.length ? 'Loaded the team (your old team is one tap away: Undo)' : 'Loaded the team', !!cur.length); return true; }
  const c = corePlan(ns);
  keepUndo(); S.slots = normSlots(c.next.slice(0, 6)); S.format = 'doubles'; render(); setView('build');
  toast(`Added ${ns.filter(n => !have.has(n)).map(n => byName.get(n).d).join(' + ') || 'the core'}${c.dropped.length ? ' · removed ' + c.dropped.join(', ') : ''}${c.megas > 2 ? ` · ${c.megas} Megas on the team now` : ''}`, true); return true; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-corekind],[data-coresort],[data-corex],[data-coremore],[data-coreuse],[data-corecx],[data-corefind],[data-corepractice]'); if (!b) return; const d = b.dataset;
  if (d.corekind) { coreUi.kind = d.corekind; coreUi.more = 0; coreUi.confirm = null; }
  else if (d.coresort) { coreUi.sort = d.coresort; coreUi.more = 0; }
  else if (d.corex) { coreUi.mon = null; coreUi.more = 0; }
  else if (d.coremore) coreUi.more++;
  else if (d.corecx) coreUi.confirm = null;
  else if (d.coreuse) { const ns = d.coreuse.split('|'); if (useCore(ns, !!d.sure)) { coreUi.confirm = null; return; } coreUi.confirm = d.coreuse; }
  else if (d.corefind) { if (typeof tsSet === 'function') { tsSet(d.corefind.split('|').map(n => ({k: 'mon', v: n}))); setView('top'); } return; }
  else if (d.corepractice) { S.opp = d.corepractice.split('|').slice(0, 6); while (S.opp.length < 6) S.opp.push(''); persist(); setView('matchup'); toast('Loaded as your opponent'); return; }
  keepScroll(() => renderCores()); });
