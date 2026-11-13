// ---------- Battle (R5, Nov 12-13): "how do I play this match", from the approved mock-up (docs/rebuild/mocks/battle.tpl.html) ----------
// Every number comes from today's shared Battle logic (46-battle-data.js battlePlan, 40-turn-one-data.js, 35 realMatch,
// 17 oppTeam); nothing here works anything out. Piece 1: the head (the answer + the real-games verdict), the two sixes
// (theirs; yours as Lead / Back / Leave home) and turn one in move order. Their six is entered in a sheet: type names, or pick
// one of the top tournament teams (38-gauntlet-data.js gauntletTeams), as today.
V2.btUi = V2.btUi || {find: ['', '', '', '', '', '']};
V2.btOppWho = () => { const opp = S.opp.filter(Boolean); if (!opp.length) return ''; const k = opp.slice().sort().join('|');
  return ui.oppFrom && ui.oppFrom.key === k ? (ui.oppFrom.label || (ui.oppFrom.who && typeof teamWho === 'function' ? teamWho({player: ui.oppFrom.who}) : '') || '') : ''; };
V2.btPk = (n, sub, extra) => `<button type="button" class="bt-pk" data-v2mon="${V2.esc(n)}" aria-label="${V2.esc(V2.disp(n))}${sub ? ', ' + V2.esc(sub) : ''}: open its info">${V2.mon(n, {iw: 96, bare: true})}<b>${V2.nameHtml(V2.disp(n))}</b>${sub ? `<small>${V2.esc(sub)}</small>` : '<small>&nbsp;</small>'}${extra || ''}</button>`;
V2.btItem = m => { try { return (m && (m.item || (m.it && m.it.n) || (typeof m.it === 'string' ? m.it : ''))) || ''; } catch (e) { return ''; } };
V2.btPlan = () => { const mine = members(), theirs = oppTeam(); if (mine.length < 4 || !theirs.length) return {mine, theirs, P: null};
  let P = null; try { P = battlePlan(mine, theirs); } catch (e) { console.error(e); } return {mine, theirs, P}; };
V2.battleHead = (mine, theirs, P) => { const E = V2.esc, who = V2.btOppWho(), R = P && P.real, dbl = S.format === 'doubles';
  const vcls = R ? ({Favoured: 'vf', 'Even match': 've', Unfavoured: 'vu'}[R.word] || 've') : '';
  const h = !P ? `<h1 class="u"><span>Who are you facing?</span><span class="pl">Plan the match.</span></h1>`
    : `<h1 class="u"><span>Bring these ${P.chosen.length === 4 ? 'four' : P.chosen.length}.</span><span class="pl">${dbl ? 'Lead the pair.' : 'Lead this one.'}</span></h1>`;
  const ev = who && ui.oppFrom && ui.oppFrom.ev ? ui.oppFrom.ev : '';
  const vs = theirs.length ? `<p class="bt-vs">Vs ${who ? `<b>${E(who)}</b>${ev ? ` at ${E(ev)}` : ''}` : 'their six'}${theirs.length < 6 ? ` · ${theirs.length} of 6 entered` : ''}</p>` : `<p class="bt-vs">Enter their six as you see them at team preview, or pick a top tournament team.</p>`;
  const verdict = R ? `<div class="bt-verdict"><p class="k">From real games</p><b class="u ${vcls}">${E(R.word)}${R.full ? '' : ' so far'}</b><small>${homeNum(R.games)} tournament games</small></div>` : '';
  return `<section class="bt-head"><div><p class="np-eyebrow">Battle a team · ${V2.btSheet() ? 'Their real open team sheet' : 'Team preview'}</p>${h}${vs}</div>${verdict}</section>`; };
V2.battleTheirs = (theirs, P) => { const E = V2.esc, ll = P ? P.likelyLead || [] : [];
  const six = theirs.length ? `<div class="bt-row6">${theirs.map(o => V2.btPk(o.p.n, V2.btItem(o), ll.includes(o) ? '<span class="bt-ll">Likely lead</span>' : '')).join('')}</div>` : '';
  return `<div class="bt-side bt-theirs"><div class="bt-labrow"><h2 class="bt-lab u">Their six</h2>${theirs.length ? '<button type="button" class="np-link" data-btclear>Clear</button>' : ''}</div>${six}
    <div class="row bt-acts${V2.btSheet() ? ' two' : ''}"><button type="button" class="np-btn${theirs.length ? '2' : ''}" data-btopp><span>${theirs.length ? 'Change Their Six' : 'Enter Their Six'}</span></button>${V2.btSheet() ? '<button type="button" class="np-btn2" data-btcopy><span>Copy for Showdown</span></button>' : ''}</div>
</div>`; };
V2.battleMine = (mine, P) => { if (!P) return ''; const r = P.r, g = (cls, lab, idx) => idx.length ? `<div class="bt-grp ${cls}"><p class="bt-gl"><i aria-hidden="true"></i>${lab}</p><div class="bt-pair">${idx.map(i => V2.btPk(mine[i].p.n, V2.btItem(mine[i]))).join('')}</div></div>` : '';
  return `<div class="bt-side bt-mine"><h2 class="bt-lab u">Your six</h2><div class="bt-grps">${g('lead', 'Lead', r.lead)}${g('back', 'Back', r.back)}${g('home', 'Leave home', r.bench)}</div>
    <p class="fine">Lead pair tested on 13,000 ladder games: players who led with this pair won more than their rating predicted.${P.twoMegas ? ' Only one Mega can Mega Evolve this battle.' : ''}</p></div>`; };
V2.battleTurn = P => { const T = P && P.turnOne; if (!T || !T.beats || !T.beats.length) return ''; const E = V2.esc;
  const steps = T.beats.map((b, i) => `<li><i class="n u">${i + 1}</i>${V2.mon(b.x.p.n, {iw: 52, bare: true})}<div><p class="who"><span class="${b.me ? 'you' : 'them'}">${b.me ? 'You' : 'Them'}</span> ${E(b.x.d)} · ${b.speed} Speed${b.prio ? `, ${b.prio > 0 ? '+' : '−'}${Math.abs(b.prio)} priority` : ''}</p><p class="mv">${E(b.act)}</p><p class="why">${E(b.why)}</p></div></li>`).join('');
  const F0 = T.field || {}, fld = F0.weather || T.terrain ? `${fieldWords(F0)}${F0.wBy ? ` (${F0.wBy.d})` : ''}${F0.negated && F0.weather ? ", cancelled by Cloud Nine / Air Lock while it's out" : ''}${F0.traced ? '. A Trace user may copy it' : ''}` : ''; // today's words (40-turn-one.js drawTurnOne)
  return `<section class="bt-turn"><h2 class="u">Turn one, in move order</h2><p class="bt-sub">Your ${E(T.leads.map(x => x.d).join(' + '))} vs their likely ${E(T.opp.map(x => x.d).join(' + '))}</p>
    <ol class="bt-steps">${steps}</ol>${T.warn && T.warn.length ? `<p class="bt-warn"><i>Watch</i>${T.warn.map(E).join('; ')}. Consider Protect.</p>` : ''}${fld ? `<p class="bt-field">Field on turn 1: <b>${E(fld)}</b></p>` : ''}</section>`; };
V2.battleEmpty = (mine, theirs) => mine.length < 4 ? `<p class="bt-empty">Add at least 4 Pokémon on My Team first. <a class="np-link" href="#team">Go to My Team ›</a></p>`
  : !theirs.length ? `<p class="bt-empty">Everything below fills in once their six is in: which four to bring, who leads, and turn one.</p>` : '';
V2.pages.battle = {place: 'battle', draw() { const {mine, theirs, P} = V2.btPlan();
  return `<div class="bt2">${V2.battleHead(mine, theirs, P)}<section class="bt-body"><div class="bt-sixes">${V2.battleTheirs(theirs, P)}${V2.battleMine(mine, P)}</div>${V2.battleTurn(P)}</section>${P ? `<section class="bt-plan"><div class="bt-pl">${V2.battleRead(theirs, P)}</div>${V2.battleWatch(P)}</section>` : ''}${V2.battleTabs(theirs, P)}${V2.battleDetail(mine, theirs, P)}${V2.battleEmpty(mine, theirs)}</div>`; }};

// ---------- their six: a sheet with six name boxes and the top tournament teams (today's entry ways) ----------
V2.btOppSheet = () => { const E = V2.esc, opp = S.opp.slice(0, 6); while (opp.length < 6) opp.push('');
  const slot = (n, i) => byName.get(n) ? `<div class="bt-oslot on">${V2.mon(n, {iw: 48, bare: true})}<b>${V2.rowName(V2.disp(n))}</b><button type="button" class="bd-x" data-btox="${i}" aria-label="Remove ${E(V2.disp(n))}">×</button></div>`
    : `<div class="bt-oslot"><label class="np-field bd-find">${V2.ICON.search}<input type="search" data-btfind="${i}" value="${E(V2.btUi.find[i] || '')}" placeholder="Pokémon ${i + 1}" aria-label="Their Pokémon ${i + 1}: type its name" autocomplete="off"></label><div class="bd-hits" data-bthits="${i}"></div></div>`;
  let teams = []; try { teams = gauntletTeams().slice(0, 10); } catch (e) {}
  const team = (t, i) => `<li><button type="button" class="bt-oteam" data-btteam="${i}"><span class="bt-osix" aria-hidden="true">${t.mons.slice(0, 6).map(n => V2.mon((n && n.n) || n, {iw: 36, bare: true})).join('')}</span><span><b>${E(t.who)}</b><small>${E(t.ev || '')}</small></span></button></li>`;
  const rec = V2.btRecent(), all = (META.teams && META.teams.teams) || [];
  const recent = rec.length ? `<h3 class="bt-oh">Recent opponents</h3><ul class="bt-oteams">${rec.map((x, i) => `<li><button type="button" class="bt-oteam" data-btrecent="${i}" aria-label="Load ${E(x.map(n => V2.disp(n)).join(', '))}"><span class="bt-osix" aria-hidden="true">${x.map(n => V2.mon(n, {iw: 36, bare: true})).join('')}</span><span><b>${E(x.map(n => V2.disp(n)).slice(0, 2).join(', '))} +4</b><small>Faced before</small></span></button></li>`).join('')}</ul>` : '';
  const more = all.length ? (V2.btUi.allTeams ? `<h3 class="bt-oh">All ${all.length} tournament teams</h3><ul class="bt-oteams bt-oall">${all.map((t, i) => `<li><button type="button" class="bt-oteam" data-btteamall="${i}"><span class="bt-osix" aria-hidden="true">${t.mons.slice(0, 6).map(n => V2.mon(n, {iw: 28, bare: true})).join('')}</span><span><b>${E(teamWho(t))}</b><small>${E(evShort(t.event))} · ${E(teamPlanLabel(t.mons))}</small></span></button></li>`).join('')}</ul>`
    : `<button type="button" class="np-link bt-oallb" data-btall>Show all ${all.length} tournament teams</button>`) : '';
  return `<div class="bt-osheet"><h2 class="u">Their six</h2><p class="bt-sub">Type them as you see them at team preview, pick one of ${all.length} top tournament teams, or a recent opponent (${rec.length || 'none yet'}).</p><div class="bt-oslots">${opp.map(slot).join('')}</div>
    ${recent}${teams.length ? `<h3 class="bt-oh">Or pick a top tournament team</h3><ul class="bt-oteams">${teams.map(team).join('')}</ul>` : ''}${more}</div>`; };
// their open team sheet when the six is a known tournament team (today's sdOppSheet: the player first, else any team with these six)
V2.btSheet = () => { const opp = (S.opp || []).filter(Boolean); if (opp.length !== 6) return null; const who = ui.oppFrom && ui.oppFrom.key === opp.slice().sort().join('|') ? ui.oppFrom.who : null;
  try { const x = (who && realSheetFor(opp, who)) || realSheetFor(opp); return x ? x.t : null; } catch (e) { return null; } };
// recent opponents (today's 74-arena.js rule): every full six is remembered, newest first, five kept; the sheet offers four, not the current one
V2.btKey = a => a.slice().sort().join('|');
V2.btRecent = () => { const cur = V2.btKey((S.opp || []).filter(Boolean)); return (S.recentOpp || []).filter(x => Array.isArray(x) && x.length === 6 && x.every(n => byName.has(n)) && V2.btKey(x) !== cur).slice(0, 4); };
V2.btOppRefresh = () => { if (V2._sheet && V2._sheet.wrap.querySelector('.bt-osheet')) { const s = V2._sheet.wrap.querySelector('.bt-osheet'); s.outerHTML = V2.btOppSheet(); } V2.redraw(); };
V2.btSetOpp = (list, from) => { V2.btRemember(S.opp); S.opp = list.slice(0, 6); while (S.opp.length < 6) S.opp.push(''); ui.oppFrom = from || null;
  V2.btRemember(S.opp); persist(); };
// today's rule: every full six that was in their six is remembered (the one being replaced too), newest first, five kept
V2.btRemember = list => { const o = (list || []).filter(Boolean); if (o.length !== 6 || !o.every(n => byName.has(n))) return; const k = V2.btKey(o);
  S.recentOpp = [o.slice(), ...(S.recentOpp || []).filter(x => Array.isArray(x) && V2.btKey(x) !== k)].slice(0, 5); };
document.addEventListener('click', async e => { const b = e.target.closest && e.target.closest('[data-btcopy],[data-btall],[data-btrecent],[data-btteamall]'); if (!b) return; const d = b.dataset;
  if (d.btcopy != null) { const t = V2.btSheet(); if (!t) return; const r = sheetPaste(t.mons); toast((await V2.copy(r.text)) ? (r.filled ? 'Their team copied for Showdown. ' + SD_NOTE_TOUR : 'Their team copied for Showdown') : 'Copy blocked by the browser'); return; }
  if (d.btall != null) { V2.btUi.allTeams = true; V2.btOppRefresh(); return; }
  if (d.btrecent != null) { const x = V2.btRecent()[+d.btrecent]; if (!x) return; V2.btSetOpp(x, null); V2.closeSheet(); V2.redraw(); toast('Recent opponent loaded'); return; }
  if (d.btteamall != null) { const t = META.teams && META.teams.teams[+d.btteamall]; if (!t) return; const ns = t.mons.slice(0, 6).filter(n => byName.get(n));
    V2.btSetOpp(ns, {who: t.player, label: teamWho(t), key: V2.btKey(ns), ev: evShort(t.event)}); V2.closeSheet(); V2.redraw(); toast(`Loaded ${t.player}’s team as the opponent`); } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-btopp],[data-btclear],[data-btox],[data-btpick],[data-btteam]'); if (!b) return; const d = b.dataset;
  if (d.btopp != null) { V2.sheet(V2.btOppSheet(), {label: 'Their six'}); return; }
  if (d.btclear != null) { V2.btSetOpp([], null); V2.redraw(); toast('Cleared their six'); return; }
  if (d.btox != null) { const o = S.opp.slice(); o[+d.btox] = ''; V2.btSetOpp(o, null); V2.btOppRefresh(); const f = document.querySelector(`.bt-osheet [data-btfind="${+d.btox}"]`); if (f) f.focus(); return; }
  if (d.btpick) { const [i, n] = d.btpick.split('|'), o = S.opp.slice(0, 6); while (o.length < 6) o.push(''); const p = byName.get(n); if (!p) return;
    if (o.some(x => x && byName.get(x) && byName.get(x).b === p.b)) { toast(`${p.d} is already in their six`); return; }
    o[+i] = n; V2.btUi.find[+i] = ''; V2.btSetOpp(o, null); V2.btOppRefresh(); const next = document.querySelector('.bt-osheet [data-btfind]'); if (next) next.focus(); return; }
  if (d.btteam != null) { let t = null; try { t = gauntletTeams()[+d.btteam]; } catch (x) {} if (!t) return; const ns = t.mons.map(m => (m && m.n) || m).filter(n => byName.get(n));
    V2.btSetOpp(ns, {who: t.player, label: t.who, key: ns.slice().sort().join('|'), ev: t.ev || ''}); /* who = the player (17 realSheetFor matches on it, as Home's prep does); label = what we show */ V2.closeSheet(); V2.redraw(); toast(`Their six: ${t.who}`); } });
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-btfind]'); if (!i) return; const k = +i.dataset.btfind; V2.btUi.find[k] = i.value;
  const h = document.querySelector(`[data-bthits="${k}"]`); if (h) { h.innerHTML = V2.buildHits(i.value).replace(/data-bdpick="([^"]*)"/g, (m, n) => `data-btpick="${k}|${n}"`);
    const inSix = new Set((S.opp || []).filter(n => n && byName.get(n)).map(n => byName.get(n).b)); /* no Pokémon offered twice (today's rule) */
    h.querySelectorAll('[data-btpick]').forEach(x => { const p = byName.get(x.dataset.btpick.split('|')[1]); if (p && inSix.has(p.b)) x.remove(); }); } });
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-btfind]'); if (!i) return; const k = +i.dataset.btfind;
  if (e.key === 'Enter') { const h = document.querySelector(`[data-bthits="${k}"] [data-btpick]`); if (h) { e.preventDefault(); h.click(); } }
  else if (e.key === 'Escape' && i.value) { e.stopPropagation(); V2.btUi.find[k] = ''; i.value = ''; const h = document.querySelector(`[data-bthits="${k}"]`); if (h) h.innerHTML = ''; } });

// ---------- piece 2: the read (biggest threat, Fake Out on their side, real-games pairings) and watch out ----------
// Biggest threat and Fake Out count: today's rule (75-arena-battle.js rzReadHtml): the first of their side Watch out marks 'hi',
// else the first listed. Real-games pairings and Watch out: today's words (47-battle-mode.js).
V2.battleRead = (theirs, P) => { if (!P) return ''; const E = V2.esc, W = P.watch || [], R = P.real; let thr = null;
  const hi = W.find(w => w.out.some(o => o[0] === 'hi')) || W[0]; if (hi) { const o = hi.out.find(x => x[0] === 'hi') || hi.out[0]; thr = {o: hi.o, t: o[1], d: o[2]}; }
  const fos = theirs.filter(o => (o.moves || []).some(x => x && x.name === 'Fake Out'));
  const big = thr ? `<div class="bt-big">${V2.btPk(thr.o.p.n, '').replace(/<b>[\s\S]*?<\/b><small>&nbsp;<\/small>/, '')}<div><p class="k">Biggest threat</p><h3 class="u">${V2.rowName(V2.disp(thr.o.p.n))}</h3><p>${E(thr.t)}${thr.d ? ': ' + E(thr.d) : ''}</p></div></div>` : '';
  const fo = `<div class="bt-fo"><b class="u">${fos.length}</b><p>Fake Out on their side<small>${fos.length ? E(fos.map(o => o.d).join(', ')) + ' can flinch one of your leads on turn 1' : 'Nobody on their side can flinch your leads on turn 1'}</small></p></div>`;
  const nm = n => E((byName.get(n) || {}).d || n);
  const real = R ? `<div class="bt-real"><h2 class="u">From real games</h2><p class="bt-sub">${homeNum(R.games || 0)} tournament games: ${E(R.word)}${R.full ? '' : ' so far'}.${R.key.length ? ' The pairings that stand out:' : ''}</p>
    ${R.key.length ? `<ul class="bt-pairs">${R.key.map(k => `<li><i class="${k.v > 0 ? 'he' : 'hu'}">${k.v > 0 ? 'Helps you' : 'Hurts you'}</i><span>Your ${nm(k.a)} vs their ${nm(k.b)}</span></li>`).join('')}</ul>` : '<p class="fine">No Pokémon pairing here stands out in real results.</p>'}</div>` : '';
  return `<div class="bt-read"><h2 class="u">The read</h2><p class="bt-sub">What decides this match</p>${big}${fo}</div>${real}`; };
V2.battleWatch = P => { if (!P) return ''; const E = V2.esc, W = P.watch || [];
  return `<div class="bt-watch"><h2 class="u">Watch out</h2><p class="bt-sub">${W.length ? `${W.length} of their six can shut something down` : 'Nothing on their side shuts down your four'}</p>${W.length ? `<div class="bt-rows">${W.map(w => `<div class="bt-r">${V2.mon(w.o.p.n, {iw: 52, bare: true})}<div><b>${V2.rowName(V2.disp(w.o.p.n))}</b>${w.out.map(([c, t, d]) => `<p class="tg"><em class="${c === 'lo' ? 'lo' : c === 'hi' ? 'hi' : 'mid'}">${E(t)}</em>${E(d)}</p>`).join('')}</div></div>`).join('')}</div>` : '<p class="fine">Nothing on their side shuts down your four.</p>'}</div>`; };

// ---------- piece 3: the detail tabs (mock: one pane open at a time, closed until you open one) ----------
// Damage both ways, Who moves first and Deeper read, from battlePlan (damage, speed, prio, r) and today's shared helpers
// (koShort / dmgP / koText / dmgRange, fieldWords, archMatchup, deeperThreats). The switches are today's: they change bmUi.
V2.btUi.tab = V2.btUi.tab || null;
V2.btChip = (attr, on, t) => `<button type="button" class="np-chip" ${attr} aria-pressed="${!!on}">${V2.esc(t)}</button>`;
V2.battleTabs = (theirs, P) => { if (!P) return ''; const n = P.chosen.length * theirs.length, t = V2.btUi.tab;
  const b = (k, lab, small) => `<button type="button" class="bt-tab${t === k ? ' on' : ''}" data-bttab="${k}" aria-expanded="${t === k}" aria-controls="bt-pane">${lab}<small>${small}</small></button>`;
  return `<nav class="bt-tabs" aria-label="Detail">${b('dmg', 'Damage both ways', n + ' pairs')}${b('spd', 'Who moves first', P.speed.length + ' Pokémon')}${b('deep', 'Deeper read', 'pair grid')}<span class="bt-hint">${t ? 'Tap it again to close' : 'Open one for the detail'}</span></nav>`; };
V2.battleDamage = (theirs, P) => { const E = V2.esc, C = P.chosen, F1 = P.field || {};
  const pc = h => h ? (h.r.max < h.r.hp ? dmgP(100 * h.r.max / h.r.hp) : String(Math.min(999, Math.round(100 * h.r.max / h.r.hp)))) + '%' : '–';
  const one = h => h && h.r && koShort(h.r) === 'OHKO'; // knocks out in one hit on every roll (not when a Focus Sash holds)
  const cell = (h, side) => `<div class="bt-hx ${side}"><span class="s">${side === 'y' ? 'You' : 'Them'}</span><b class="${one(h) ? (side === 'y' ? 'ko-good' : 'ko-bad') : ''}">${pc(h)}</b><i>${h ? E(koShort(h.r)) : ''}</i><span class="mv">${h ? E(h.mv.name) : ''}</span></div>`;
  const wx = [['auto', `Leads${F1.weather || F1.terrain ? ': ' + fieldWords(F1) : ': none'}`], ['', 'No weather'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']].map(([k, t]) => V2.btChip(`data-btw="${k}"`, bmUi.weather === k, t)).join('');
  const head = `<tr><th scope="col">Your four ↓ · their six →</th>${theirs.map(o => `<th scope="col">${V2.mon(o.p.n, {iw: 40, bare: true})}<span>${V2.rowName(o.d)}</span></th>`).join('')}</tr>`;
  const rows = C.map((m, i) => `<tr><th scope="row">${V2.mon(m.p.n, {iw: 40, bare: true})}<span>${V2.rowName(m.d)}</span></th>${theirs.map((o, j) => { const {a, d} = P.damage[i][j];
    return `<td title="${a ? `${E(m.d)} ${E(a.mv.name)}: ${E(dmgRange(a.r))}, ${E(koText(a.r))}` : ''}${d ? ` · ${E(o.d)} ${E(d.mv.name)}: ${E(dmgRange(d.r))}, ${E(koText(d.r))}` : ''}">${cell(a, 'y')}${cell(d, 't')}</td>`; }).join('')}</tr>`).join('');
  // phones (Nov 12): the same numbers as one block per Pokémon of yours, their six as rows, so nothing scrolls sideways
  const ln = (h, side) => `<span class="bt-dv ${side}"><b class="${one(h) ? (side === 'y' ? 'ko-good' : 'ko-bad') : ''}">${pc(h)}</b> <i>${h ? E(koShort(h.r)) : ''}</i><small>${h ? E(h.mv.name) : ''}</small></span>`;
  const list = `<div class="bt-dl">${C.map((m, i) => `<section><h3>${V2.mon(m.p.n, {iw: 40, bare: true})}<span>${V2.rowName(m.d)}</span></h3><div class="bt-dlh" aria-hidden="true"><span></span><span>You hit</span><span>They hit</span></div>
    <ul>${theirs.map((o, j) => { const {a, d} = P.damage[i][j]; return `<li><span class="nm">${V2.mon(o.p.n, {iw: 32, bare: true})}<span>${V2.rowName(o.d)}</span></span>${ln(a, 'y')}${ln(d, 't')}</li>`; }).join('')}</ul></section>`).join('')}</div>`;
  return `<h2 class="u">Damage both ways</h2><p class="bt-sub">Your four against their six: your best hit on them, and their best hit on you</p>
    <div class="bt-chips" role="group" aria-label="Weather">${wx}</div><div class="bt-chips" role="group" aria-label="Intimidate">${V2.btChip('data-bti="intMe"', bmUi.intMe, "You're Intimidated")}${V2.btChip('data-bti="intThem"', bmUi.intThem, "They're Intimidated")}</div>
    <div class="bt-tw bt-dgw"><table class="bt-dg">${head}${rows}</table></div>${list}
    <p class="fine">Top roll as % of HP, each side's usual set, with how many hits it takes: OHKO, 2HKO, 3HKO (a % = only that share of rolls do it). Blue: you knock it out in one hit; red: they knock yours out in one hit.</p>`; };
// Who moves first as a speed line (Sim chose B1, Nov 12, 9:30 PM): desktop and iPad (820+), the ten in move order on one floor, first mover
// on the left, each with its Speed number above (yours in blue) on one level line; phones keep the bars (ten can't stand side by side)
V2.battleSpeedLine = rows => { const E = V2.esc; if (!rows.length) return '';
  const note = q => [q.s && q.s.scarf ? 'Choice Scarf' : '', q.wxUp ? E(q.ab) : '', q.unb ? `${q.unb} after its item` : ''].filter(Boolean).join(' · ');
  return `<div class="bt-sline" style="--n:${rows.length}" aria-hidden="true">${rows.map((q, i) => { const tie = q.tie || (rows[i - 1] && rows[i - 1].v === q.v) || (rows[i + 1] && rows[i + 1].v === q.v);
    return `<div class="bt-sc${q.me ? ' me' : ''}"><span class="num u">${q.v}</span>${V2.mon(q.x.p.n, {bare: true})}<span class="nm"><span class="sd">${q.me ? 'You' : 'Them'}</span>${V2.rowName(q.x.d)}${note(q) || tie ? `<small>${[note(q), tie ? 'Speed tie' : ''].filter(Boolean).join(' · ')}</small>` : ''}</span></div>`; }).join('')}</div>
    <p class="bt-sorder" aria-hidden="true"><span>${V2.ICON.back}Moves first</span><span>Moves last${V2.ICON.fwd}</span></p>`; };
V2.battleSpeed = P => { const E = V2.esc, rows = P.speed, mx = P.speedMax, sd = P.spDrop;
  const tg = [['tw', 'Your Tailwind'], ['twOpp', 'Their Tailwind'], ['icy', sd.length ? `Them −1 (after your ${sd[0]})` : 'Them −1'], ['par', "They're paralyzed"], ['tr', 'Trick Room']].map(([k, t]) => V2.btChip(`data-bts="${k}"`, bmUi[k], t)).join('');
  const prio = P.prio.map(q => `${q.move} ${q.prio > 0 ? '+' : '−'}${Math.abs(q.prio)}${q.grassy ? ' (Grassy Terrain)' : ''} (${q.who})`);
  return `<h2 class="u">Who moves first</h2><p class="bt-sub">${bmUi.tr ? 'Slowest moves first (Trick Room)' : 'Fastest first'} · your four and their six</p><div class="bt-chips" role="group" aria-label="Speed conditions">${tg}</div>
    ${P.weather ? `<p class="fine">Weather: ${E(P.weather)} (set it under Damage both ways).</p>` : ''}
    ${V2.battleSpeedLine(rows)}<ol class="bt-spd">${rows.map(q => `<li class="${q.me ? 'me' : ''}">${V2.mon(q.x.p.n, {iw: 40, bare: true})}<div class="nm"><span class="sd">${q.me ? 'You' : 'Them'}</span> ${V2.rowName(q.x.d)}<small>${[q.s && q.s.scarf ? 'Choice Scarf' : '', q.wxUp ? E(q.ab) : '', q.unb ? `${q.unb} after its item` : '', q.tie ? 'Speed tie' : ''].filter(Boolean).join(' · ') || '&nbsp;'}</small></div><i class="bar" style="--w:${Math.max(4, 100 * q.v / mx).toFixed(1)}%" aria-hidden="true"></i><b class="v u">${q.v}</b></li>`).join('')}</ol>
    ${prio.length ? `<p class="fine">Moves that skip the Speed order (higher bracket goes first, Speed only breaks ties inside a bracket): ${E(prio.join(', '))}.</p>` : ''}
    <p class="fine">Your side: your items (and your spreads where you set them). Their side assumed: the most common spreads, natures and items. Ties are a coin flip.</p>`; };
V2.battleDeep = (mine, theirs, P) => { const E = V2.esc, r = P.r; let notes = [], thr = [];
  try { notes = r.A && r.B ? archMatchup(r.A, r.B, mine) : []; } catch (e) {} try { thr = deeperThreats(r, theirs); } catch (e) {}
  const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v * 10) / 10);
  const grid = `<div class="bt-tw"><table class="bt-mg"><tr><th scope="col">You ↓ · them →</th>${theirs.map(o => `<th scope="col" title="${E(o.d)}">${V2.mon(o.p.n, {iw: 36, bare: true})}</th>`).join('')}</tr>${mine.map((m, i) => `<tr><th scope="row">${V2.rowName(m.d)}</th>${theirs.map((o, j) => { const v = r.h.M[i][j]; return `<td class="${v >= .75 ? 'p' : v <= -.75 ? 'm' : ''}">${sg(v)}</td>`; }).join('')}</tr>`).join('')}</table></div>`;
  return `<h2 class="u">Deeper read</h2><p class="bt-sub">Archetypes, their threats, the full matchup grid</p><div class="bt-deep"><div>
    ${r.A && r.B ? `<p class="bt-av"><span>You: ${E(r.A.label)}</span><span class="vs">vs</span><span>Them: ${E(r.B.label)}</span></p>` : ''}
    ${notes.map(n => `<p class="bt-note"><em class="${n.tone === 'good' ? 'good' : n.tone === 'bad' ? 'bad' : 'mid'}">${n.tone === 'good' ? 'Edge' : n.tone === 'bad' ? 'Watch' : 'Note'}</em><b>${E(n.t)}</b>: ${E(n.d)}</p>`).join('')}
    ${thr.length ? thr.map(t => `<p class="bt-note"><em class="${t.ans.length ? 'mid' : 'bad'}">Watch</em><b>${E(theirs[t.j].d)}</b>: ${E(t.move)} hits ${E(t.hit.map(i => mine[i].d).join(', '))} super effectively. ${t.ans.length ? 'Answer: ' + E(t.ans.map(i => mine[i].d).join(', ')) + '.' : 'No clean answer in your four.'}</p>`).join('') : '<p class="bt-note"><em class="good">Clear</em>None of their Pokémon threatens several of your picks at once.</p>'}</div>
    <div>${grid}<p class="fine">Columns, left to right: ${E(theirs.map(o => o.d).join(', '))}. Plus means you hit them harder than they hit you, with each side's most common moves and abilities. Speed breaks ties.</p></div></div>`; };
V2.battleDetail = (mine, theirs, P) => { if (!P || !V2.btUi.tab) return ''; const t = V2.btUi.tab;
  return `<section class="bt-pane" id="bt-pane">${t === 'dmg' ? V2.battleDamage(theirs, P) : t === 'spd' ? V2.battleSpeed(P) : V2.battleDeep(mine, theirs, P)}</section>`; };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bttab],[data-btw],[data-bts],[data-bti]'); if (!b) return; const d = b.dataset;
  if (d.bttab) { V2.btUi.tab = V2.btUi.tab === d.bttab ? null : d.bttab; V2.redraw(); return; }
  if (d.btw != null) bmUi.weather = d.btw; else if (d.bts) bmUi[d.bts] = !bmUi[d.bts]; else if (d.bti) bmUi[d.bti] = !bmUi[d.bti]; V2.redraw(); });
