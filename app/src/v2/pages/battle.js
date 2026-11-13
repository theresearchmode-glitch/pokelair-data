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
  return `<section class="bt-head"><div><p class="np-eyebrow">Battle a team</p>${h}${vs}</div>${verdict}</section>`; };
V2.battleTheirs = (theirs, P) => { const E = V2.esc, ll = P ? P.likelyLead || [] : [];
  const six = theirs.length ? `<div class="bt-row6">${theirs.map(o => V2.btPk(o.p.n, V2.btItem(o), ll.includes(o) ? '<span class="bt-ll">Likely lead</span>' : '')).join('')}</div>` : '';
  return `<div class="bt-side bt-theirs"><h2 class="bt-lab u">Their six</h2>${six}
    <div class="row bt-acts"><button type="button" class="np-btn${theirs.length ? '2' : ''}" data-btopp><span>${theirs.length ? 'Change Their Six' : 'Enter Their Six'}</span></button>${theirs.length ? '<button type="button" class="np-link" data-btclear>Clear</button>' : ''}</div></div>`; };
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
  return `<div class="bt2">${V2.battleHead(mine, theirs, P)}<section class="bt-body"><div class="bt-sixes">${V2.battleTheirs(theirs, P)}${V2.battleMine(mine, P)}</div>${V2.battleTurn(P)}</section>${V2.battleEmpty(mine, theirs)}</div>`; }};

// ---------- their six: a sheet with six name boxes and the top tournament teams (today's entry ways) ----------
V2.btOppSheet = () => { const E = V2.esc, opp = S.opp.slice(0, 6); while (opp.length < 6) opp.push('');
  const slot = (n, i) => byName.get(n) ? `<div class="bt-oslot on">${V2.mon(n, {iw: 48, bare: true})}<b>${V2.rowName(V2.disp(n))}</b><button type="button" class="bd-x" data-btox="${i}" aria-label="Remove ${E(V2.disp(n))}">×</button></div>`
    : `<div class="bt-oslot"><label class="np-field bd-find">${V2.ICON.search}<input type="search" data-btfind="${i}" value="${E(V2.btUi.find[i] || '')}" placeholder="Pokémon ${i + 1}" aria-label="Their Pokémon ${i + 1}: type its name" autocomplete="off"></label><div class="bd-hits" data-bthits="${i}"></div></div>`;
  let teams = []; try { teams = gauntletTeams().slice(0, 10); } catch (e) {}
  const team = (t, i) => `<li><button type="button" class="bt-oteam" data-btteam="${i}"><span class="bt-osix" aria-hidden="true">${t.mons.slice(0, 6).map(n => V2.mon((n && n.n) || n, {iw: 36, bare: true})).join('')}</span><span><b>${E(t.who)}</b><small>${E(t.ev || '')}</small></span></button></li>`;
  return `<div class="bt-osheet"><h2 class="u">Their six</h2><p class="bt-sub">Type them as you see them at team preview.</p><div class="bt-oslots">${opp.map(slot).join('')}</div>
    ${teams.length ? `<h3 class="bt-oh">Or pick a top tournament team</h3><ul class="bt-oteams">${teams.map(team).join('')}</ul>` : ''}</div>`; };
V2.btOppRefresh = () => { if (V2._sheet && V2._sheet.wrap.querySelector('.bt-osheet')) { const s = V2._sheet.wrap.querySelector('.bt-osheet'); s.outerHTML = V2.btOppSheet(); } V2.redraw(); };
V2.btSetOpp = (list, from) => { S.opp = list.slice(0, 6); while (S.opp.length < 6) S.opp.push(''); ui.oppFrom = from || null; persist(); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-btopp],[data-btclear],[data-btox],[data-btpick],[data-btteam]'); if (!b) return; const d = b.dataset;
  if (d.btopp != null) { V2.sheet(V2.btOppSheet(), {label: 'Their six'}); return; }
  if (d.btclear != null) { V2.btSetOpp([], null); V2.redraw(); toast('Cleared their six'); return; }
  if (d.btox != null) { const o = S.opp.slice(); o[+d.btox] = ''; V2.btSetOpp(o, null); V2.btOppRefresh(); return; }
  if (d.btpick) { const [i, n] = d.btpick.split('|'), o = S.opp.slice(0, 6); while (o.length < 6) o.push(''); const p = byName.get(n); if (!p) return;
    if (o.some(x => x && byName.get(x) && byName.get(x).b === p.b)) { toast(`${p.d} is already in their six`); return; }
    o[+i] = n; V2.btUi.find[+i] = ''; V2.btSetOpp(o, null); V2.btOppRefresh(); const next = document.querySelector('.bt-osheet [data-btfind]'); if (next) next.focus(); return; }
  if (d.btteam != null) { let t = null; try { t = gauntletTeams()[+d.btteam]; } catch (x) {} if (!t) return; const ns = t.mons.map(m => (m && m.n) || m).filter(n => byName.get(n));
    V2.btSetOpp(ns, {who: t.player, label: t.who, key: ns.slice().sort().join('|'), ev: t.ev || ''}); /* who = the player (17 realSheetFor matches on it, as Home's prep does); label = what we show */ V2.closeSheet(); V2.redraw(); toast(`Their six: ${t.who}`); } });
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-btfind]'); if (!i) return; const k = +i.dataset.btfind; V2.btUi.find[k] = i.value;
  const h = document.querySelector(`[data-bthits="${k}"]`); if (h) h.innerHTML = V2.buildHits(i.value).replace(/data-bdpick="([^"]*)"/g, (m, n) => `data-btpick="${k}|${n}"`); });
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-btfind]'); if (!i) return; const k = +i.dataset.btfind;
  if (e.key === 'Enter') { const h = document.querySelector(`[data-bthits="${k}"] [data-btpick]`); if (h) { e.preventDefault(); h.click(); } }
  else if (e.key === 'Escape' && i.value) { e.stopPropagation(); V2.btUi.find[k] = ''; i.value = ''; const h = document.querySelector(`[data-bthits="${k}"]`); if (h) h.innerHTML = ''; } });
