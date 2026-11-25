// ---------- Compare on the kit (reskin proposal, Nov 22): HEAD TO HEAD ----------
// Was "The Face-Off" (Nov 14: a fight poster, a tale of the tape, "Only Team X handles" columns). The face-off stays as the hero (two corners,
// Team A in Plot blue, Team B in the site's "them" magenta (Sim Q1, Nov 15), VS between); the one idea is the tug of war: the top 30 threats one team handles and the other
// can't, each row pulled toward the team with the answer (three slanted blocks a side: Beats it 3, Handles it 2, Shaky 1, No answer 0, the
// word always written beside them). Every number comes from cxInfo / cxFacts (the same work My Team does); nothing new is worked out.
V2.CMP_LV = ['No answer', 'Shaky', 'Handles it', 'Beats it'];
// one team's matchup counts over the top 30: c[level], ok = beats or handles
V2.cmpTally = I => { if (!I || !I.RD) return null; const c = [0, 0, 0, 0]; for (const r of I.RD.rows) c[r.level]++; return {c, ok: c[2] + c[3], n: I.RD.rows.length}; };
// the corner's star: its likely lead (teamLineup, as the Face-Off did), bursting out of the top of the corner on wide screens
V2.cmpStar = ms => { try { const L = teamLineup(ms); if (L && L.lead && L.lead[0]) return L.lead[0]; } catch (e) {} return ms[0]; };
V2.cmpHalf = (side, R, I, O) => { const E = V2.esc, ms = teamRating(R.slots).ms, G = I.G, s = side.toLowerCase();
  const done = G && O.G && !G.partial && !O.G.partial, d = done ? Math.round(G.s) - Math.round(O.G.s) : 0;
  return `<div class="cxf-half cmp-half ${s}">${(h => h && SPRITE_ID[h.p.n] != null ? `<span class="cmp-star" aria-hidden="true"><img src="${V2.art(SPRITE_ID[h.p.n], true)}" alt="" loading="lazy" decoding="async"></span>` : '')(V2.cmpStar(ms))}<div class="cxf-id"><span class="cmp-badge u" aria-hidden="true">${side}</span><div><h2 class="u cmp-nm"><span class="vh">Team ${side}: </span>${E(R.name).replace(/(\d)-(\d)/g, '$1\u2011$2') /* '9-2' never breaks at its dash */}</h2><p>${E(V2.cxSub(R))} · <button type="button" class="np-link" data-cxp="${side}" aria-label="Change team ${side}">Change</button></p></div></div>
    ${G ? `<div class="cmp-score"><b class="u">${Math.round(G.s)}</b><div class="cmp-sw"><span class="u">${E(CH.wordOf(G.s))}${G.partial ? ' so far' : ''}</span><small>${G.partial ? `Strength Score so far · ${(G.st && G.st.partialN) || ms.length} of 6 picked` : `Strength Score · ${E(CH.recLine(G, true))}`}</small>${d > 0 ? `<small class="cmp-ahead">${d} point${d === 1 ? '' : 's'} ahead</small>` : ''}</div></div>` : '<p class="fine cmp-score">No Strength Score yet</p>'}
    <ul class="cmp-six">${ms.map(m => `<li>${V2.mon(m.p.n, {iw: 64, bare: true})}<b>${E(m.d).replace(/ (\S)$/, '\u00a0$1') /* never a lone 'Y' on its own line */}</b></li>`).join('')}</ul></div>`; };
// the tug of war: totals, then "Only Team A handles" rows (pulled left, blue), then "Only Team B handles" rows (pulled right, magenta)
V2.cmpTug = (IA, IB, rows) => { const E = V2.esc, LV = V2.CMP_LV, T = V2.cmpTally(IA), U = V2.cmpTally(IB);
  if (!T || !U) return '<p class="fine">Matchups need both teams worked out.</p>';
  const thr = rows.find(r => r.k === 'thr') || {a: [], b: []}, lvl = (I, n) => (I.thr.get(n) || {level: 0}).level;
  const bk = l => `<span class="cmp-bk" data-l="${l}"><i></i><i></i><i></i></span>`;
  const row = r => { const a = lvl(IA, r.t.n), b = lvl(IB, r.t.n);
    return `<li class="cmp-r" role="group" aria-label="${E(r.t.d)}: Team A ${LV[a]}, Team B ${LV[b]}"><span class="cmp-s a${a >= 2 ? ' on' : ''}" aria-hidden="true"><i class="cmp-w">${LV[a]}</i>${bk(a)}</span><span class="cmp-t" aria-hidden="true"><img src="${V2.art(SPRITE_ID[r.t.n])}" alt="" loading="lazy" decoding="async"><b>${V2.rowName(r.t.d)}</b></span><span class="cmp-s b${b >= 2 ? ' on' : ''}" aria-hidden="true">${bk(b)}<i class="cmp-w">${LV[b]}</i></span></li>`; };
  const grp = (side, L) => { const s = side.toLowerCase(), more = L.slice(5);
    return `<p class="cmp-gh ${s}"><span class="cmp-badge u" aria-hidden="true">${side}</span><span>Only Team ${side} handles <b class="u">${L.length}</b></span></p>${L.length ? `<ul class="cmp-rows ${s}">${L.slice(0, 5).map(row).join('')}</ul>${more.length ? `<p class="fine cmp-also ${s}">Also only Team ${side}: ${more.map(r => E(r.t.d)).join(', ')}.</p>` : ''}` : `<p class="fine cmp-also ${s}">None of the top threats: every one Team ${side} handles, Team ${side === 'A' ? 'B' : 'A'} handles too.</p>`}`; };
  const both = IA.RD.rows.filter(r => r.level >= 2 && lvl(IB, r.t.n) >= 2).length, none = IA.RD.rows.filter(r => r.level === 0 && lvl(IB, r.t.n) === 0).length;
  const step = IA.RD.rows.filter(r => { const b = lvl(IB, r.t.n); return b !== r.level && (b >= 2) === (r.level >= 2); }).length;
  const tot = (side, X) => `<p class="cmp-tt ${side.toLowerCase()}"><b class="u">${X.ok}</b><span>Team ${side} beats or handles</span><small>${X.c[3]} Beats it · ${X.c[2]} Handles it · ${X.c[1]} Shaky · ${X.c[0]} No answer</small></p>`;
  return `<div class="cmp-tug"><p class="cmp-cap">Matchups (damage calc, top ${T.n})</p><div class="cmp-tot">${tot('A', T)}<p class="cmp-of u" aria-hidden="true">of&nbsp;${T.n}</p>${tot('B', U)}</div>
    <div class="cmp-rope">${grp('A', thr.a || [])}${grp('B', thr.b || [])}</div>
    <p class="fine cmp-even">Both beat or handle ${both}${none ? ` · neither has an answer to ${none}` : ''}${step ? ` · ${step} more differ by one step (Beats it against Handles it, or Shaky against No answer)` : ''}.</p></div>`; };
