// Home round 3 (Fight Night refined, Nov 14): every number today's Home shows, from today's shared logic (home.js uses the same calls).
(() => { const ms = members(), s = V2.scoreNow ? V2.scoreNow() : null; let G = null; try { G = CH.gradeOf(prepOf(ms), proChecks(ms, true), ms); } catch (e) {}
  const C = homeChamp(); let F = null, vs = '';
  try { F = C && ms.length >= 4 ? CH.fourVs(ms, C.six.map(x => x.p.n)) : null; vs = "vs the Champion's six"; } catch (e) {}
  const byN = n => ms.find(m => m.p.n === n), lead = F ? F.lead.map(byN).filter(Boolean) : [], back = F ? F.back.map(byN).filter(Boolean).filter(m => !lead.includes(m)) : [];
  const bench = ms.filter(m => !lead.includes(m) && !back.includes(m)), ord = [...lead, ...back, ...bench].slice(0, 6);
  const rows = lairRows(), pick = x => ({n: x.p.n, d: x.p.d, r: RS(x.r.total), k: (lairRank(x.p) || {}).rank, t: x.p.t, tier: lTier(x.r.total).k});
  return {mine: ord.map(m => ({n: m.p.n, d: m.d, it: m.heldItem || m.item || '', role: lead.includes(m) ? 'lead' : back.includes(m) ? 'back' : 'bench'})),
    title: ms.length ? teamTitleFor(ms) : '', s, word: G ? CH.wordOf(G.s) : '', band: G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] : 'solid',
    plan: lead.length >= 2 ? {lead: lead.map(m => m.d), back: back.map(m => m.d), bench: bench.map(m => m.d), vs} : null,
    champ: C ? {ev: V2.evTitle(C.ev.name), who: teamWho(C.t), date: evDate(C.ev.date), players: C.ev.players || null, n: C.n, six: C.six.map(x => ({n: x.p.n, d: V2.disp(x.p.n), it: x.it || ''}))} : null,
    used: CH.metaSix().slice(0, 3).map(p => ({n: p.n, d: V2.disp(p.n), pct: homePct(p)})), src: homeSrcLine(),
    top: rows.slice(0, 10).map(pick), gems: rows.filter(x => isGem(x.p)).slice(0, 10).map(pick), week: V2.homeWeek().slice(0, 7),
    ud: V2.underdog(), tools: V2.HOME_TOOLS.map(t => ({n: t[0], d: t[1]})), teams: (typeof RES === 'object' && RES && RES.teams) || 0,
    news: (typeof WHATS_NEW === 'object' && WHATS_NEW.items) ? WHATS_NEW.items.length : 0 }; })()
