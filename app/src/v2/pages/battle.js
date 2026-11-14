// ---------- Battle (R5, Nov 12-13): "how do I play this match", from the approved mock-up (docs/rebuild/mocks/battle.tpl.html) ----------
// Every number comes from today's shared Battle logic (46-battle-data.js battlePlan, 40-turn-one-data.js, 35 realMatch,
// 17 oppTeam); nothing here works anything out. Piece 1: the head (the answer + the real-games verdict), the two sixes
// (theirs; yours as Lead / Back / Leave home) and turn one in move order. Their six is entered in a sheet: type names, or pick
// one of the top tournament teams (38-gauntlet-data.js gauntletTeams), as today.
V2.btUi = V2.btUi || {find: ['', '', '', '', '', '']};
V2.btOppWho = () => { const opp = S.opp.filter(Boolean); if (!opp.length) return ''; const k = opp.slice().sort().join('|');
  return ui.oppFrom && ui.oppFrom.key === k ? (ui.oppFrom.label || (ui.oppFrom.who && typeof teamWho === 'function' ? teamWho({player: ui.oppFrom.who}) : '') || '') : ''; };
V2.btPk = (n, sub, extra) => `<button type="button" class="bt-pk" data-v2mon="${V2.esc(n)}" aria-label="${V2.esc(V2.disp(n))}${sub ? ', ' + V2.esc(sub) : ''}: open its info">${V2.mon(n, {iw: 96, bare: true, tag: true})}<b>${V2.tileName(V2.disp(n))}</b>${sub ? `<small>${V2.esc(sub)}</small>` : '<small>&nbsp;</small>'}${extra || ''}</button>`;
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
  return `<div class="bt-side bt-theirs"><div class="bt-labrow"><h2 class="bt-lab u">Their Six</h2>${theirs.length ? '<button type="button" class="np-link" data-btclear>Clear</button>' : ''}</div>${six}
    <div class="row bt-acts${V2.btSheet() ? ' two' : ''}"><button type="button" class="np-btn${theirs.length ? '2' : ''}" data-btopp><span>${theirs.length ? 'Change Their Six' : 'Enter Their Six'}</span></button>${V2.btSheet() ? '<button type="button" class="np-btn2" data-btcopy><span>Copy for Showdown</span></button>' : ''}</div>
</div>`; };
V2.battleMine = (mine, P) => { if (!P) return ''; const r = P.r, g = (cls, lab, idx) => idx.length ? `<div class="bt-grp ${cls}"><p class="bt-gl"><i aria-hidden="true"></i>${lab}</p><div class="bt-pair">${idx.map(i => V2.btPk(mine[i].p.n, V2.btItem(mine[i]))).join('')}</div></div>` : '';
  return `<div class="bt-side bt-mine"><h2 class="bt-lab u">Your Six</h2><div class="bt-grps">${g('lead', 'Lead', r.lead)}${g('back', 'Back', r.back)}${g('home', 'Leave home', r.bench)}</div>
    <p class="fine">Lead pair tested on 13,000 ladder games: players who led with this pair won more than their rating predicted.${P.twoMegas ? ' Only one Mega can Mega Evolve this battle.' : ''}</p></div>`; };
V2.battleTurn = P => { const T = P && P.turnOne; if (!T || !T.beats || !T.beats.length) return ''; const E = V2.esc;
  const steps = T.beats.map((b, i) => `<li><i class="n u">${i + 1}</i>${V2.mon(b.x.p.n, {iw: 52, bare: true})}<div><p class="who"><span class="${b.me ? 'you' : 'them'}">${b.me ? 'You' : 'Them'}</span> ${E(b.x.d)} · ${b.speed} Speed${b.prio ? `, ${b.prio > 0 ? '+' : '−'}${Math.abs(b.prio)} priority` : ''}</p><p class="mv">${E(b.act)}</p><p class="why">${E(b.why)}</p></div></li>`).join('');
  const F0 = T.field || {}, fld = F0.weather || T.terrain ? `${fieldWords(F0)}${F0.wBy ? ` (${F0.wBy.d})` : ''}${F0.negated && F0.weather ? ", cancelled by Cloud Nine / Air Lock while it's out" : ''}${F0.traced ? '. A Trace user may copy it' : ''}` : ''; // today's words (40-turn-one.js drawTurnOne)
  return `<section class="bt-turn"><h2 class="u">Turn One, in Move Order</h2><p class="bt-sub">Your ${E(T.leads.map(x => x.d).join(' + '))} vs their likely ${E(T.opp.map(x => x.d).join(' + '))}</p>
    <ol class="bt-steps">${steps}</ol>${T.warn && T.warn.length ? `<p class="bt-warn"><i>Watch</i> ${V2.keepForm(T.warn.map(E).join('; '))}. Consider Protect.</p>` : ''}${fld ? `<p class="bt-field">Field on turn 1: <b>${E(fld)}</b></p>` : ''}</section>`; };
V2.battleEmpty = (mine, theirs) => mine.length < 4 ? `<p class="bt-empty">Add at least 4 Pokémon on My Team first. <a class="np-link" href="#team">Go to My Team ›</a></p>`
  : !theirs.length ? `<p class="bt-empty">Everything below fills in once their six is in: which four to bring, who leads, and turn one.</p>${(() => { try { const D = V2.teamData(); return D && !D.empty && V2.sixHtml ? `<section class="bt-yours"><h2 class="u">Your Six</h2><p class="bt-sub">From My Team. Change it there.</p>${V2.sixHtml(D)}</section>` : ''; } catch (e) { return ''; } })() /* Sim, Nov 13 (Battle Q3 B): the empty Battle shows who you're bringing */}` : '';
V2.pages.battle = {place: 'battle', draw() { const {mine, theirs, P} = V2.btPlan();
  return `<div class="bt2">${V2.battleToolsBar()}${V2.battleHead(mine, theirs, P)}<section class="bt-body"><div class="bt-sixes">${V2.battleTheirs(theirs, P)}${V2.battleMine(mine, P)}</div>${V2.battleTurn(P)}</section>${P ? `<section class="bt-plan"><div class="bt-pl">${V2.battleRead(theirs, P)}</div>${V2.battleWatch(P)}</section>` : ''}${V2.battleTabs(theirs, P)}${V2.battleDetail(mine, theirs, P)}${V2.battleMoreTools()}${V2.battleLog(P)}${V2.battleEmpty(mine, theirs)}</div>`; }};

// ---------- their six: a sheet with six name boxes and the top tournament teams (today's entry ways) ----------
V2.btOppSheet = () => { const E = V2.esc, opp = S.opp.slice(0, 6); while (opp.length < 6) opp.push('');
  const slot = (n, i) => byName.get(n) ? `<div class="bt-oslot on">${V2.mon(n, {iw: 48, bare: true})}<b>${V2.rowName(V2.disp(n))}</b><button type="button" class="bd-x" data-btox="${i}" aria-label="Remove ${E(V2.disp(n))}">×</button></div>`
    : `<div class="bt-oslot"><label class="np-field bd-find">${V2.ICON.search}<input type="search" data-btfind="${i}" value="${E(V2.btUi.find[i] || '')}" placeholder="Pokémon ${i + 1}" aria-label="Their Pokémon ${i + 1}: type its name" autocomplete="off"></label><div class="bd-hits" data-bthits="${i}"></div></div>`;
  let teams = []; try { teams = gauntletTeams().slice(0, 10); } catch (e) {}
  const team = (t, i) => `<li><button type="button" class="bt-oteam" data-btteam="${i}"><span class="bt-osix" aria-hidden="true">${t.mons.slice(0, 6).map(n => V2.mon((n && n.n) || n, {iw: 36, bare: true})).join('')}</span><span><b>${E(t.who)}</b><small>${E(t.ev || '')}</small></span></button></li>`;
  const rec = V2.btRecent(), all = (META.teams && META.teams.teams) || [];
  const recent = rec.length ? `<h3 class="bt-oh">Recent Opponents</h3><ul class="bt-oteams">${rec.map((x, i) => `<li><button type="button" class="bt-oteam" data-btrecent="${i}" aria-label="Load ${E(x.map(n => V2.disp(n)).join(', '))}"><span class="bt-osix" aria-hidden="true">${x.map(n => V2.mon(n, {iw: 36, bare: true})).join('')}</span><span><b>${E(x.map(n => V2.disp(n)).slice(0, 2).join(', '))} +4</b><small>Faced before</small></span></button></li>`).join('')}</ul>` : '';
  const more = all.length ? (V2.btUi.allTeams ? `<h3 class="bt-oh">All ${all.length} Tournament Teams</h3><ul class="bt-oteams bt-oall">${all.map((t, i) => `<li><button type="button" class="bt-oteam" data-btteamall="${i}"><span class="bt-osix" aria-hidden="true">${t.mons.slice(0, 6).map(n => V2.mon(n, {iw: 28, bare: true})).join('')}</span><span><b>${E(teamWho(t))}</b><small>${E(evShort(t.event))} · ${E(teamPlanLabel(t.mons))}</small></span></button></li>`).join('')}</ul>`
    : `<button type="button" class="np-link bt-oallb" data-btall>Show All ${all.length} Tournament Teams</button>`) : '';
  return `<div class="bt-osheet"><h2 class="u">Their Six</h2><p class="bt-sub">Type them as you see them at team preview, pick one of ${all.length} top tournament teams, or a recent opponent (${rec.length || 'none yet'}).</p><div class="bt-oslots">${opp.map(slot).join('')}</div>
    ${recent}${teams.length ? `<h3 class="bt-oh">Or Pick a Top Tournament Team</h3><ul class="bt-oteams">${teams.map(team).join('')}</ul>` : ''}${more}</div>`; };
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
  if (d.btopp != null) { V2.sheet(V2.btOppSheet(), {label: 'Their Six'}); return; }
  if (d.btclear != null) { V2.btSetOpp([], null); V2.redraw(); toast('Cleared their six'); return; }
  if (d.btox != null) { const o = S.opp.slice(); o[+d.btox] = ''; V2.btSetOpp(o, null); V2.btOppRefresh(); const f = document.querySelector(`.bt-osheet [data-btfind="${+d.btox}"]`); if (f) f.focus(); return; }
  if (d.btpick) { const [i, n] = d.btpick.split('|'), o = S.opp.slice(0, 6); while (o.length < 6) o.push(''); const p = byName.get(n); if (!p) return;
    if (o.some(x => x && byName.get(x) && byName.get(x).b === p.b)) { toast(`${p.d} is already in their six`); return; }
    o[+i] = n; V2.btUi.find[+i] = ''; V2.btSetOpp(o, null); V2.btOppRefresh(); const next = document.querySelector('.bt-osheet [data-btfind]'); if (next) next.focus(); return; }
  if (d.btteam != null) { let t = null; try { t = gauntletTeams()[+d.btteam]; } catch (x) {} if (!t) return; const ns = t.mons.map(m => (m && m.n) || m).filter(n => byName.get(n));
    V2.btSetOpp(ns, {who: t.player, label: t.who, key: ns.slice().sort().join('|'), ev: t.ev || ''}); /* who = the player (17 realSheetFor matches on it, as Home's prep does); label = what we show */ V2.closeSheet(); V2.redraw(); toast(`Their Six: ${t.who}`); } });
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
  const nm = n => E((byName.get(n) || {}).d || n).replace(/ ([XYZ])$/, '\u00a0$1'); // 'Charizard Y' stays together (Nov 12 rule: form letters never alone on a line)
  const real = R ? `<div class="bt-real"><h2 class="u">From Real Games</h2>${R.key.length ? '<p class="bt-sub">The pairings that stand out:</p>' : ''}<!-- Battle Q2 B (Sim, Nov 13): the verdict and game count are said once, at the top -->
    ${R.key.length ? `<ul class="bt-pairs">${R.key.map(k => `<li><i class="${k.v > 0 ? 'he' : 'hu'}">${k.v > 0 ? 'Helps you' : 'Hurts you'}</i><span>Your ${nm(k.a)} vs their ${nm(k.b)}</span></li>`).join('')}</ul>` : '<p class="fine">No Pokémon pairing here stands out in real results.</p>'}</div>` : '';
  return `<div class="bt-read"><h2 class="u">The Read</h2><p class="bt-sub">What decides this match</p>${big}${fo}</div>${real}`; };
V2.battleWatch = P => { if (!P) return ''; const E = V2.esc, W = P.watch || [];
  return `<div class="bt-watch"><h2 class="u">Watch Out</h2><p class="bt-sub">${W.length ? `${W.length} of their six can shut something down` : 'Nothing on their side shuts down your four'}</p>${W.length ? `<div class="bt-rows">${W.map(w => `<div class="bt-r">${V2.mon(w.o.p.n, {iw: 52, bare: true})}<div><b>${V2.rowName(V2.disp(w.o.p.n))}</b>${w.out.map(([c, t, d]) => `<p class="tg"><em class="${c === 'lo' ? 'lo' : c === 'hi' ? 'hi' : 'mid'}">${E(t)}</em> ${V2.keepForm(E(d))}</p>`).join('')}</div></div>`).join('')}</div>` : '<p class="fine">Nothing on their side shuts down your four.</p>'}</div>`; };

// ---------- piece 3: the detail tabs (mock: one pane open at a time, closed until you open one) ----------
// Damage both ways, Who moves first and Deeper read, from battlePlan (damage, speed, prio, r) and today's shared helpers
// (koShort / dmgP / koText / dmgRange, fieldWords, archMatchup, deeperThreats). The switches are today's: they change bmUi.
V2.btUi.tab = V2.btUi.tab || (() => { const t = LS.get('cc2.v2.bttab', null); return ['dmg', 'spd', 'deep'].includes(t) ? t : null; })(); // the open tab is remembered on this device (audit X-03; today remembered Deeper Read under cc2.chf.mufold)
V2.btChip = (attr, on, t) => `<button type="button" class="np-chip" ${attr} aria-pressed="${!!on}">${V2.esc(t)}</button>`;
V2.battleTabs = (theirs, P) => { if (!P) return ''; const n = P.chosen.length * theirs.length, t = V2.btUi.tab;
  const b = (k, lab) => `<button type="button" class="bt-tab${t === k ? ' on' : ''}" data-bttab="${k}" aria-expanded="${t === k}" aria-controls="bt-pane">${lab}</button>`; /* no counts beside the names (Sim, Nov 12: too wordy) */
  return `<nav class="bt-tabs" aria-label="Detail">${b('dmg', '<span>Damage</span> <span>Both Ways</span>')}${b('spd', '<span>Who Moves</span> <span>First</span>')}${b('deep', '<span>Deeper</span> <span>Read</span>')}</nav>`; };
V2.battleDamage = (theirs, P) => { const E = V2.esc, C = P.chosen, F1 = P.field || {};
  const pc = h => h ? (h.r.max < h.r.hp ? dmgP(100 * h.r.max / h.r.hp) : String(Math.min(999, Math.round(100 * h.r.max / h.r.hp)))) + '%' : '–';
  const one = h => h && h.r && koShort(h.r) === 'OHKO'; // knocks out in one hit on every roll (not when a Focus Sash holds)
  const cell = (h, side) => `<div class="bt-hx ${side}"><span class="s">${side === 'y' ? 'You' : 'Them'}</span><b class="${one(h) ? (side === 'y' ? 'ko-good' : 'ko-bad') : ''}">${pc(h)}</b><i>${h ? E(koShort(h.r)) : ''}</i><span class="mv">${h ? E(h.mv.name) : ''}</span></div>`;
  const wx = [['auto', `Leads: ${F1.weather || F1.terrain ? fieldWords(F1).replace(/\b[a-z]/g, c => c.toUpperCase()) : 'None'}`], ['', 'No Weather'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']].map(([k, t]) => V2.btChip(`data-btw="${k}"`, bmUi.weather === k, t)).join('');
  const head = `<tr><th scope="col">Your four ↓ · their six →</th>${theirs.map(o => `<th scope="col">${V2.mon(o.p.n, {iw: 40, bare: true})}<span>${V2.rowName(o.d)}</span></th>`).join('')}</tr>`;
  const rows = C.map((m, i) => `<tr><th scope="row">${V2.mon(m.p.n, {iw: 40, bare: true})}<span>${V2.rowName(m.d)}</span></th>${theirs.map((o, j) => { const {a, d} = P.damage[i][j];
    return `<td title="${a ? `${E(m.d)} ${E(a.mv.name)}: ${E(dmgRange(a.r))}, ${E(koText(a.r))}` : ''}${d ? ` · ${E(o.d)} ${E(d.mv.name)}: ${E(dmgRange(d.r))}, ${E(koText(d.r))}` : ''}">${cell(a, 'y')}${cell(d, 't')}</td>`; }).join('')}</tr>`).join('');
  // phones (Nov 12): the same numbers as one block per Pokémon of yours, their six as rows, so nothing scrolls sideways
  const ln = (h, side) => `<span class="bt-dv ${side}"><b class="${one(h) ? (side === 'y' ? 'ko-good' : 'ko-bad') : ''}">${pc(h)}</b> <i>${h ? E(koShort(h.r)) : ''}</i><small>${h ? E(h.mv.name) : ''}</small></span>`;
  const list = `<div class="bt-dl">${C.map((m, i) => `<section><h3>${V2.mon(m.p.n, {iw: 40, bare: true})}<span>${V2.rowName(m.d)}</span></h3><div class="bt-dlh" aria-hidden="true"><span></span><span>You hit</span><span>They hit</span></div>
    <ul>${theirs.map((o, j) => { const {a, d} = P.damage[i][j]; return `<li><span class="nm">${V2.mon(o.p.n, {iw: 32, bare: true})}<span>${V2.rowName(o.d)}</span></span>${ln(a, 'y')}${ln(d, 't')}</li>`; }).join('')}</ul></section>`).join('')}</div>`;
  return `<h2 class="u">Damage Both Ways</h2><p class="bt-sub">Your four against their six: your best hit on them, and their best hit on you</p>
    <div class="bt-chips" role="group" aria-label="Weather">${wx}</div><div class="bt-chips" role="group" aria-label="Intimidate">${V2.btChip('data-bti="intMe"', bmUi.intMe, "You're Intimidated")}${V2.btChip('data-bti="intThem"', bmUi.intThem, "They're Intimidated")}</div>
    <div class="bt-tw bt-dgw"><table class="bt-dg">${head}${rows}</table></div>${list}
    <p class="fine">Top roll as % of HP, each side's usual set, with how many hits it takes: OHKO, 2HKO, 3HKO (a % = only that share of rolls do it). Blue: you knock it out in one hit; red: they knock yours out in one hit.</p>`; };
// Who moves first as a speed line (Sim chose B1, Nov 12, 9:30 PM): desktop and iPad sideways (1024+), the ten in move order on one floor, first mover
// on the left, each with its Speed number above (yours in blue) on one level line; phones keep the bars (ten can't stand side by side)
V2.battleSpeedLine = rows => { const E = V2.esc; if (!rows.length) return '';
  const note = q => [q.s && q.s.scarf ? 'Choice Scarf' : '', q.wxUp ? E(q.ab) : '', q.unb ? `${q.unb} after its item` : ''].filter(Boolean).join(' · ');
  return `<div class="bt-sline" style="--n:${rows.length}" aria-hidden="true">${rows.map((q, i) => { const tie = q.tie || (rows[i - 1] && rows[i - 1].v === q.v) || (rows[i + 1] && rows[i + 1].v === q.v);
    return `<div class="bt-sc${q.me ? ' me' : ''}"><span class="num u">${q.v}</span>${V2.mon(q.x.p.n, {bare: true})}<span class="nm"><span class="sd">${q.me ? 'You' : 'Them'}</span>${V2.rowName(q.x.d)}${note(q) || tie ? `<small>${[note(q), tie ? 'Speed tie' : ''].filter(Boolean).join(' · ')}</small>` : ''}</span></div>`; }).join('')}</div>
    <p class="bt-sorder" aria-hidden="true"><span>${V2.ICON.back}Moves first</span><span>Moves last${V2.ICON.fwd}</span></p>`; };
V2.battleSpeed = P => { const E = V2.esc, rows = P.speed, mx = P.speedMax, sd = P.spDrop;
  const tg = [['tw', 'Your Tailwind'], ['twOpp', 'Their Tailwind'], ['icy', sd.length ? `Them −1 (after your ${sd[0]})` : 'Them −1'], ['par', "They're Paralyzed"], ['tr', 'Trick Room']].map(([k, t]) => V2.btChip(`data-bts="${k}"`, bmUi[k], t)).join('');
  const prio = P.prio.map(q => `${q.move} ${q.prio > 0 ? '+' : '−'}${Math.abs(q.prio)}${q.grassy ? ' (Grassy Terrain)' : ''} (${q.who})`);
  return `<h2 class="u">Who Moves First</h2><p class="bt-sub">${bmUi.tr ? 'Slowest moves first (Trick Room)' : 'Fastest first'} · your four and their six</p><div class="bt-chips" role="group" aria-label="Speed conditions">${tg}</div>
    ${P.weather ? `<p class="fine">Weather: ${E(P.weather)} (set it under Damage Both Ways).</p>` : ''}
    ${V2.battleSpeedLine(rows)}<ol class="bt-spd">${rows.map(q => `<li class="${q.me ? 'me' : ''}">${V2.mon(q.x.p.n, {iw: 40, bare: true})}<div class="nm"><span class="sd">${q.me ? 'You' : 'Them'}</span> ${V2.rowName(q.x.d)}<small>${[q.s && q.s.scarf ? 'Choice Scarf' : '', q.wxUp ? E(q.ab) : '', q.unb ? `${q.unb} after its item` : '', q.tie ? 'Speed tie' : ''].filter(Boolean).join(' · ') || '&nbsp;'}</small></div><i class="bar" style="--w:${Math.max(4, 100 * q.v / mx).toFixed(1)}%" aria-hidden="true"></i><b class="v u">${q.v}</b></li>`).join('')}</ol>
    ${prio.length ? `<p class="fine">Moves that skip the Speed order (higher bracket goes first, Speed only breaks ties inside a bracket): ${E(prio.join(', '))}.</p>` : ''}
    <p class="fine">Your side: your items (and your spreads where you set them). Their side assumed: the most common spreads, natures and items. Ties are a coin flip.</p>`; };
V2.battleDeep = (mine, theirs, P) => { const E = V2.esc, r = P.r; let notes = [], thr = [];
  try { notes = r.A && r.B ? archMatchup(r.A, r.B, mine) : []; } catch (e) {} try { thr = deeperThreats(r, theirs); } catch (e) {}
  const sg = v => { const q = Math.round(v * 4) / 4; return (q > 0 ? '+' : q < 0 ? '−' : '') + Math.abs(q); }; /* today's rounding: nearest quarter (18-archetypes.js) */
  const grid = `<div class="bt-tw"><table class="bt-mg"><tr><th scope="col">You ↓ · them →</th>${theirs.map(o => `<th scope="col" title="${E(o.d)}">${V2.mon(o.p.n, {iw: 36, bare: true})}</th>`).join('')}</tr>${mine.map((m, i) => `<tr><th scope="row">${V2.rowName(m.d)}</th>${theirs.map((o, j) => { const v = r.h.M[i][j]; return `<td class="${v >= .75 ? 'p' : v <= -.75 ? 'm' : ''}">${sg(v)}</td>`; }).join('')}</tr>`).join('')}</table></div>`;
  return `<h2 class="u">Deeper Read</h2><p class="bt-sub">Archetypes, their threats, the full matchup grid</p><div class="bt-deep"><div>
    ${r.A && r.B ? `<p class="bt-av"><span>You: ${E(r.A.label)}</span><span class="vs">vs</span><span>Them: ${E(r.B.label)}</span></p>` : ''}
    ${notes.map(n => `<p class="bt-note"><em class="${n.tone === 'good' ? 'good' : n.tone === 'bad' ? 'bad' : 'mid'}">${n.tone === 'good' ? 'Edge' : n.tone === 'bad' ? 'Watch' : 'Note'}</em> <b>${E(n.t)}</b>: ${E(n.d)}</p>`).join('')}
    ${thr.length ? thr.map(t => `<p class="bt-note"><em class="${t.ans.length ? 'mid' : 'bad'}">Watch</em> <b>${E(theirs[t.j].d)}</b>: ${t.by.map(g => `${E(g.move)} hits ${E(g.hit.map(i => mine[i].d).join(', '))}`).join('; ')} (super effective). ${t.ans.length ? 'Answer: ' + E(t.ans.map(i => mine[i].d).join(', ')) + '.' : 'No clean answer in your four.'}</p>`).join('') : '<p class="bt-note"><em class="good">Clear</em> None of their Pokémon threatens several of your picks at once.</p>'}</div>
    <div>${grid}<p class="fine">Columns, left to right: ${E(theirs.map(o => o.d).join(', '))}. Plus means you hit them harder than they hit you, with each side's most common moves and abilities. Speed breaks ties.</p></div></div>`; };
V2.battleDetail = (mine, theirs, P) => { if (!P || !V2.btUi.tab) return ''; const t = V2.btUi.tab;
  return `<section class="bt-pane" id="bt-pane">${t === 'dmg' ? V2.battleDamage(theirs, P) : t === 'spd' ? V2.battleSpeed(P) : V2.battleDeep(mine, theirs, P)}</section>`; };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bttab],[data-btw],[data-bts],[data-bti]'); if (!b) return; const d = b.dataset;
  if (d.bttab) { V2.btUi.tab = V2.btUi.tab === d.bttab ? null : d.bttab; LS.set('cc2.v2.bttab', V2.btUi.tab); V2.redraw(); return; }
  if (d.btw != null) bmUi.weather = d.btw; else if (d.bts) bmUi[d.bts] = !bmUi[d.bts]; else if (d.bti) bmUi[d.bti] = !bmUi[d.bti]; V2.redraw(); });

// ---------- piece 4a: the Battle log (mock-up: four from the plan, Win / Loss, a Showdown replay; today's record and recent battles) ----------
// Same data and rules as today's 26-battle-log.js (S.log entries {t, r, b, tm, o}; four picked, leads first; 400 kept) and 41-replay-data.js.
V2.btUi.logPick = V2.btUi.logPick || []; V2.btUi.logTouched = false;
V2.btLogPick = P => { const ms = members(); let p = V2.btUi.logPick.filter(n => ms.some(m => m.p.n === n));
  if (!V2.btUi.logTouched && !p.length && P && P.four && P.four.length === 4 && P.four.every(n => ms.some(m => m.p.n === n))) return {pick: P.four.slice(), fromPlan: true};
  return {pick: p, fromPlan: false}; };
V2.battleLog = P => { const E = V2.esc, ms = members(); if (ms.length < 4) return ''; const L = Array.isArray(S.log) ? S.log : [], {pick, fromPlan} = V2.btLogPick(P);
  const dn = n => (byName.get(n) || {}).d || n, all = L.length ? logStats(L) : null, tr = L.length ? teamRecord(ms) : null;
  const order = pick.length === 4 ? `lead ${E(dn(pick[0]))} + ${E(dn(pick[1]))}, back ${E(dn(pick[2]))} + ${E(dn(pick[3]))}` : `${pick.length} of 4 picked`;
  const four = `<button type="button" class="bt-lfour" data-btlfour aria-label="Change the four you brought: ${order}"><b>${order}</b></button> (tap to change)`;
  const whose = fromPlan ? "the plan's four" : 'your four';
  const say = L.length ? `<p class="bt-lrec"><span><b class="u">${all.w}–${all.l}</b> overall · ${all.pct}%</span>${tr ? `<span><b class="u">${tr.w}–${tr.l}</b> this team · ${tr.pct}%</span>` : ''}<span><b class="u">${L.length}</b> battles logged</span></p><p class="bt-lsay">Next game: log it with ${whose}: ${four}.</p>`
    : `<p class="bt-lsay">No games logged yet. After the match, log the result with ${whose}: ${four}.</p>`;
  V2.btUi.logPicksHtml = `<div class="bt-lpicks" role="group" aria-label="The four you brought, leads first">${ms.map(m => { const i = pick.indexOf(m.p.n);
    return `<button type="button" class="bt-lp${i >= 0 ? ' on' : ''}" data-btlp="${E(m.p.n)}" aria-pressed="${i >= 0}">${V2.mon(m.p.n, {iw: 40, bare: true})}<span>${V2.rowName(m.d)}</span><small>${i >= 0 ? (i < 2 ? 'Lead ' : 'Back ') + (i + 1) : '&nbsp;'}</small></button>`; }).join('')}</div>`;
  const off = pick.length === 4 ? '' : ' disabled';
  return `<section class="bt-log"><div class="bt-lgl"><h2 class="u">Battle Log</h2>${say}${(() => { const f = [fromPlan ? 'Filled in from the plan' : pick.length === 4 ? '4/4 picked' : '', S.opp.some(Boolean) ? `saved with their ${S.opp.filter(Boolean).length}` : ''].filter(Boolean).join(' · '); return f ? `<p class="fine">${f.charAt(0).toUpperCase() + f.slice(1)}</p>` : ''; })()}</div>
    <div class="row bt-lacts"><span class="bt-lg">${off ? '<button type="button" class="np-link" data-btlfour>Pick your four first ›</button>' : ''}<button type="button" class="np-btn2" data-btlres="W"${off}><span>Win</span></button><button type="button" class="np-btn2" data-btlres="L"${off}><span>Loss</span></button></span>
      <span class="bt-lg"><button type="button" class="np-link" data-btreplay>Log from a Showdown Replay ›</button>${L.length ? '<button type="button" class="np-link" data-btrecord>Your Record ›</button>' : ''}</span></div></section>`; };
// your record (today's Battle log stats, in a sheet): by Pokémon, lead pairs (2+ games), toughest opponents (3+), recent battles with delete
V2.btRecord = () => { const E = V2.esc, L = Array.isArray(S.log) ? S.log : []; if (!L.length) return '<div class="bt-rec"><h2 class="u">Your Record</h2><p class="bt-sub">No battles logged yet.</p></div>';
  const dn = n => (byName.get(n) || {}).d || n, all = logStats(L), tr = teamRecord(members()), byMon = new Map(), byLead = new Map(), byOpp = new Map();
  for (const e of L) { for (const n of e.b) byMon.set(n, [...(byMon.get(n) || []), e]); if (e.b.length >= 2) { const k = logKey(e.b.slice(0, 2)); byLead.set(k, [...(byLead.get(k) || []), e]); } for (const n of e.o) byOpp.set(n, [...(byOpp.get(n) || []), e]); }
  const row = (label, st) => `<li><span>${label}</span><i class="bar" style="--w:${st.pct}%" aria-hidden="true"></i><b>${st.w}–${st.l}</b><small>${st.pct}%</small></li>`;
  const mons = [...byMon].map(([n, e]) => [n, logStats(e)]).sort((a, b) => b[1].n - a[1].n).slice(0, 8);
  const leads = [...byLead].map(([k, e]) => [k, logStats(e)]).filter(x => x[1].n >= 2).sort((a, b) => b[1].pct - a[1].pct || b[1].n - a[1].n).slice(0, 4);
  const opps = [...byOpp].map(([n, e]) => [n, logStats(e)]).filter(x => x[1].n >= 3).sort((a, b) => a[1].pct - b[1].pct).slice(0, 4);
  const when = t => { try { return new Date(t).toLocaleDateString([], {month: 'short', day: 'numeric'}); } catch (e) { return ''; } };
  return `<div class="bt-rec"><h2 class="u">Your Record</h2><p class="bt-lrec"><span><b class="u">${all.w}–${all.l}</b> overall · ${all.pct}%</span>${tr ? `<span><b class="u">${tr.w}–${tr.l}</b> this team · ${tr.pct}%</span>` : ''}<span><b class="u">${L.length}</b> battles logged</span></p>
    <h3 class="bt-oh">Your Pokémon</h3><ul class="bt-rrows">${mons.map(([n, st]) => row(E(dn(n)), st)).join('')}</ul>
    ${leads.length ? `<h3 class="bt-oh">Lead Pairs (2+ Games)</h3><ul class="bt-rrows">${leads.map(([k, st]) => row(k.split('|').map(x => E(dn(x))).join(' + '), st)).join('')}</ul>` : ''}
    ${opps.length ? `<h3 class="bt-oh">Toughest Opponents (3+ Games)</h3><ul class="bt-rrows">${opps.map(([n, st]) => row(E(dn(n)), st)).join('')}</ul>` : ''}
    <h3 class="bt-oh">Recent Battles</h3><ul class="bt-rlist">${L.slice(-15).reverse().map(e => `<li><b class="r ${e.r === 'W' ? 'w' : 'l'}">${e.r === 'W' ? 'Win' : 'Loss'}</b><span>${E(when(e.t))}</span><span class="b">${e.b.length ? E(e.b.map(dn).join(', ')) : 'Pokémon not recorded'}</span><button type="button" class="np-link" data-btldel="${e.t}" aria-label="Delete this battle">Delete</button></li>`).join('')}</ul></div>`; };
V2.btLogSheet = () => { V2.battleLog(V2.btPlan().P); const {pick} = V2.btLogPick(V2.btPlan().P), dn = n => (byName.get(n) || {}).d || n, E = V2.esc;
  return `<div class="bt-lsheet"><h2 class="u">The Four You Brought</h2><p class="bt-sub">Tap in the order they came out: your two leads first, then the back two. ${pick.length}/4 picked.</p>${V2.btUi.logPicksHtml}
    <p class="fine">${pick.length === 4 ? `Order: lead ${E(dn(pick[0]))} + ${E(dn(pick[1]))}, back ${E(dn(pick[2]))} + ${E(dn(pick[3]))}` : 'Pick four to log the game.'}</p><div class="row"><button type="button" class="np-btn" data-v2close><span>Done</span></button></div></div>`; };
V2.btReplaySheet = () => `<div class="bt-rep"><h2 class="u">Log from a Showdown Replay</h2><p class="bt-sub">On the replay page, open the log (or download the replay), then paste the log here or choose the file. Load the team you played with first.</p>
  <textarea class="np-field" data-btrepin rows="5" placeholder="|player|p1|…" aria-label="Replay log"></textarea>
  <div class="row"><button type="button" class="np-btn" data-btrepgo><span>Log This Game</span></button><label class="np-btn2"><span>Choose Replay File</span><input type="file" data-btrepfile accept=".html,.htm,.txt,.log" hidden></label></div><p class="fine" data-btrepout aria-live="polite"></p></div>`;
V2.btAddReplay = text => { const x = parseReplay(text), out = document.querySelector('[data-btrepout]');
  if (x.error) { if (out) out.textContent = x.error; return; } if (!Array.isArray(S.log)) S.log = [];
  S.log.push({t: Date.now(), r: x.r, b: x.b, tm: members().map(m => m.p.n), o: x.o}); if (S.log.length > 400) S.log = S.log.slice(-400); persist();
  if (out) out.textContent = `${x.r === 'W' ? 'Win' : 'Loss'} logged: ${x.me} vs ${x.them}, you brought ${x.b.map(n => (byName.get(n) || {}).d || n).join(', ')}.`;
  const ta = document.querySelector('[data-btrepin]'); if (ta) ta.value = ''; V2.redraw(); toast(x.r === 'W' ? 'Win logged from replay' : 'Loss logged from replay'); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-btlp],[data-btlfour],[data-btlres],[data-btreplay],[data-btrepgo],[data-btrecord],[data-btldel]'); if (!b) return; const d = b.dataset;
  if (d.btlp) { const {pick} = V2.btLogPick(V2.btPlan().P); V2.btUi.logTouched = true; V2.btUi.logPick = pick.includes(d.btlp) ? pick.filter(x => x !== d.btlp) : (pick.length >= 4 ? pick : [...pick, d.btlp]); V2.redraw();
    const sh = document.querySelector('.np-sheet .bt-lsheet'); if (sh) { sh.outerHTML = V2.btLogSheet(); const again = document.querySelector(`.bt-lsheet [data-btlp="${CSS.escape(d.btlp)}"]`); if (again) again.focus(); } return; }
  if (d.btlfour != null) { V2.sheet(V2.btLogSheet(), {label: 'The Four You Brought'}); return; }
  if (d.btlres) { const {pick} = V2.btLogPick(V2.btPlan().P); if (pick.length !== 4) return; if (!Array.isArray(S.log)) S.log = [];
    S.log.push({t: Date.now(), r: d.btlres, b: pick.slice(), tm: members().map(m => m.p.n), o: S.opp.filter(Boolean)}); if (S.log.length > 400) S.log = S.log.slice(-400);
    V2.btUi.logPick = []; V2.btUi.logTouched = false; persist(); V2.redraw(); toast(d.btlres === 'W' ? 'Win logged' : 'Loss logged'); return; }
  if (d.btreplay != null) { V2.sheet(V2.btReplaySheet(), {label: 'Log from a Showdown Replay'}); return; }
  if (d.btrepgo != null) { V2.btAddReplay((document.querySelector('[data-btrepin]') || {}).value); return; }
  if (d.btrecord != null) { V2.sheet(V2.btRecord(), {label: 'Your Record'}); return; }
  if (d.btldel) { const k = +d.btldel; S.log = (S.log || []).filter(x => x.t !== k); persist(); const s = document.querySelector('.np-sheet .bt-rec'); if (s) s.outerHTML = V2.btRecord(); V2.redraw(); toast('Battle deleted'); } });
document.addEventListener('change', e => { const t = e.target; if (!t || !t.matches || !t.matches('[data-btrepfile]') || !t.files || !t.files[0]) return;
  const fr = new FileReader(); fr.onload = () => { const s = String(fr.result || ''); const m = s.match(/<script type="text\/plain" class="battle-log-data">([\s\S]*?)<\/script>/); V2.btAddReplay(m ? m[1] : s); }; fr.readAsText(t.files[0]); t.value = ''; });

// ---------- piece 4b (BUILT ON THE BRANCH FOR SIM'S Q6, not on the Preview until she says yes): the Battle tools ----------
// Mock-up: a tools bar under the header on 700+ (Battle a team · Team preview practice · Test run · Speed tiers · Damage calc · Type chart,
// Battle log on the right) and, on phones, "More ways to prep" above the Battle log. Counts are today's: Test run = gauntletTeams(),
// Speed tiers = your six against the 20 most-used (39-damage-calc-speed.js slice(0,20)). Pages not rebuilt yet open the Preview's
// "Coming next" page (rule C10: marked, not faked).
V2.BT_TOOLS = () => { let n = 0; try { n = gauntletTeams().length; } catch (e) {}
  /* names in title case, no counts in the bar (Sim, Nov 12) */
  return [['practice', 'Team Preview Practice', '', 'Pick four and two leads against real ladder teams'], ['gauntlet', 'Test Run', '', `Your team into the latest ${n || ''} top teams`.replace('  ', ' ')],
    ['speed', 'Speed Tiers', '', 'Your six against the 20 most-used Pokémon'], ['calc', 'Damage Calc', '', 'Any attacker into any defender'], ['types', 'Type Chart', '', '18 types, or look up a Pokémon']]; };
V2.battleToolsBar = (cur = 'battle') => { const L = Array.isArray(S.log) ? S.log.length : 0, on = k => k === cur ? ' aria-current="page" class="on"' : '';
  return `<nav class="bt-tools" aria-label="Battle tools"><a href="#battle"${on('battle')}>Battle A Team</a>${V2.BT_TOOLS().map(([h, t, s]) => `<a href="#${h}"${on(h)}>${t}${s ? `<small>${s}</small>` : ''}</a>`).join('')}<a href="#battle" class="r" data-btlogjump>Battle Log</a></nav>`; };
V2.battleMoreTools = () => `<section class="bt-more"><h2 class="u">More Ways to Prep</h2><ul>${V2.BT_TOOLS().map(([h, t, s, d]) => `<li><a href="#${h}"><span>${t}<small>${V2.esc(d)}</small></span><i aria-hidden="true">›</i></a></li>`).join('')}</ul></section>`;
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-btlogjump]'); if (!a) return; e.preventDefault(); const l = document.querySelector('.bt-log'); if (l) l.scrollIntoView({behavior: 'smooth', block: 'start'}); });
// Battle Q3 B (Nov 13): a tile in Your Six on the empty Battle page opens that Pokémon's info sheet (as Build's six, Sim Nov 12)
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.bt-yours [data-tmsel]'); if (!t) return; e.preventDefault(); try { const D = V2.teamData(), m = D && D.ms[+t.dataset.tmsel]; if (m) V2.openMon(m.p.n); } catch (err) {} });
