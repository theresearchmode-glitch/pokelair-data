// ---------- Battle a team, once their six is in (Nov 14): Sim's pick "Play-by-Play" (docs/rebuild/mocks/battle-playbyplay/BRIEF.md) ----------
// A face-off poster with both full sixes (you PLOT blue, them the site's existing pink --pick: Sim, Nov 14, no new colours), then turn one
// told move by move down a centre line, each move on its mover's side. Same plan, same helpers, same words as battle.js (btPlan, turnOne,
// btItem, btSheet); everything under the play-by-play is battle.js's own sections, untouched.
V2.pbpMon = (n, sub, big) => `<button type="button" class="pbp-mon${big ? ' big' : ''}" data-v2mon="${V2.esc(n)}" aria-label="${V2.esc(V2.disp(n))}${sub ? ', ' + V2.esc(sub) : ''}: open its info sheet">${V2.mon(n, {bare: true})}<b>${V2.esc(V2.disp(n))}</b>${sub ? `<small>${V2.esc(sub)}</small>` : ''}</button>`;
V2.pbpPoster = (mine, theirs, P) => { const r = P.r, ll = P.likelyLead || [], rest = theirs.filter(o => !ll.includes(o)), mon = (m, big) => V2.pbpMon(m.p.n, V2.btItem(m), big);
  const grp = (lab, idx) => idx.length ? `<div class="pbp-g"><p class="pbp-gl u">${lab}</p><div class="pbp-row">${idx.map(i => mon(mine[i])).join('')}</div></div>` : '';
  return `<section class="pbp-poster" aria-label="Your six against their six">
    <div class="pbp-half you"><h2 class="u">Your Six</h2><p class="pbp-gl u">Lead</p><div class="pbp-leads">${r.lead.map(i => mon(mine[i], true)).join('')}</div>
      <div class="pbp-bench">${grp('Back', r.back)}${grp('Leave home', r.bench)}</div></div>
    <i class="pbp-vs u" aria-hidden="true">VS</i>
    <div class="pbp-half them"><h2 class="u">Their Six</h2><p class="pbp-gl u">Likely lead</p><div class="pbp-leads">${ll.map(o => mon(o, true)).join('')}</div>
      <div class="pbp-bench"><div class="pbp-g"><p class="pbp-gl u">The other four</p><div class="pbp-row">${rest.map(o => mon(o)).join('')}</div></div></div></div></section>`; };
// one move of turn one: today's act and why lines, with the move, its target and the damage drawn from them (no new numbers)
V2.pbpBeat = (b, i, T) => { const E = V2.esc, all = [...T.leads, ...T.opp], m = String(b.act).match(/^(.+?) into (.+)$/) || String(b.act).match(/^(Fake Out) (.+)$/);
  const tgt = m ? all.find(x => x.d === m[2]) : null, move = m ? m[1] : b.act, why = String(b.why || ''), dmg = tgt && !/^Fake Out/.test(b.act);
  const pct = dmg ? +(why.match(/up to (\d+)%/) || [])[1] || (/^KOs/.test(why) ? 100 : 0) : 0, ko = dmg && (/\bOHKO\b/.test(why) || /^KOs/.test(why)), hk = dmg && !ko ? (why.match(/\b(\dHKO)\b/) || [])[1] : '';
  const say = `Move ${i + 1}, ${b.me ? 'you' : 'them'}: ${b.x.d}, ${b.speed} Speed${b.prio ? `, ${b.prio > 0 ? '+' : '−'}${Math.abs(b.prio)} priority` : ''}, ${b.act}, ${why}${ko ? ', a knockout' : ''}.`;
  return `<li class="pbp-beat ${b.me ? 'you' : 'them'}" style="--r:${i + 1}" aria-label="${E(say)}"><i class="pbp-n u" aria-hidden="true">${i + 1}</i><div class="pbp-band" aria-hidden="true">${V2.mon(b.x.p.n, {iw: 72, bare: true})}
    <div class="pbp-tx"><p class="pbp-who">${b.me ? 'You' : 'Them'} · ${E(b.x.d)}</p><p class="pbp-mv u">${E(move)}</p>${tgt ? `<p class="pbp-into">into ${E(tgt.d)}</p>` : ''}<p class="pbp-why">${E(why)}</p>${dmg && pct ? `<i class="pbp-hp" style="--w:${Math.min(100, pct)}%"></i>` : ''}</div>
    ${tgt ? `<span class="pbp-tgt${ko ? ' ko' : ''}">${V2.mon(tgt.p.n, {iw: 56, bare: true})}${ko ? '<b class="u">KO</b>' : hk ? `<b class="hk">${hk}</b>` : ''}</span>` : '<span class="pbp-tgt none"></span>'}
    <p class="pbp-spe"><b class="u">${b.speed}</b><small>Speed</small>${b.prio ? `<em>${b.prio > 0 ? '+' : '−'}${Math.abs(b.prio)} priority</em>` : ''}</p></div></li>`; };
V2.pbpTurn = P => { const T = P && P.turnOne; if (!T || !T.beats || !T.beats.length) return ''; const E = V2.esc, F0 = T.field || {};
  const fld = F0.weather || T.terrain ? `${fieldWords(F0)}${F0.wBy ? ` (${F0.wBy.d})` : ''}${F0.negated && F0.weather ? ", cancelled by Cloud Nine / Air Lock while it's out" : ''}${F0.traced ? '. A Trace user may copy it' : ''}` : ''; // today's words (battle.js battleTurn)
  return `<section class="pbp-turn bt-turn"><div class="pbp-th"><h2 class="u">Turn One, Play\u00a0by\u00a0Play</h2><p class="bt-sub">Fastest moves first. Your ${E(T.leads.map(x => x.d).join(' + '))} vs their likely ${E(T.opp.map(x => x.d).join(' + '))}</p></div>
    <ol class="pbp-steps">${T.beats.map((b, i) => V2.pbpBeat(b, i, T)).join('')}</ol>
    ${T.warn && T.warn.length ? `<p class="bt-warn pbp-warn"><i class="u">Watch</i> ${V2.keepForm(T.warn.map(E).join('; '))}. Consider Protect.</p>` : ''}${fld ? `<p class="bt-field">Field on turn 1: <b>${E(fld)}</b></p>` : ''}</section>`; };
V2.pbpActs = (theirs, P) => `<div class="pbp-acts"><p class="fine">Lead pair tested on 13,000 ladder games: players who led with this pair won more than their rating predicted.${P.twoMegas ? ' Only one Mega can Mega Evolve this battle.' : ''}</p>
  <div class="row"><button type="button" class="np-btn2" data-btopp><span>Change Their Six</span></button>${V2.btSheet() ? '<button type="button" class="np-btn2" data-btcopy><span>Copy for Showdown</span></button>' : ''}<button type="button" class="np-link" data-btclear>Clear</button></div></div>`;
(() => { const before = V2.pages.battle.draw; V2.pages.battle.draw = () => { const {mine, theirs, P} = V2.btPlan(); if (!P || !theirs.length || !P.r || !P.r.lead) return before();
  return `<div class="bt2 pbp">${V2.battleToolsBar()}${V2.battleHead(mine, theirs, P)}${V2.pbpPoster(mine, theirs, P)}${V2.pbpTurn(P)}${V2.pbpActs(theirs, P)}<section class="bt-plan"><div class="bt-pl">${V2.battleRead(theirs, P)}</div>${V2.battleWatch(P)}</section>${V2.battleTabs(theirs, P)}${V2.battleDetail(mine, theirs, P)}${V2.battleMoreTools()}${V2.battleLog(P)}</div>`; }; })();
