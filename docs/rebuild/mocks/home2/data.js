// Home round 2 mock-ups (Sim, Nov 14: "too bland, no character"): the real numbers Home shows today, from today's shared logic.
(() => { const ms = members(), s = V2.scoreNow ? V2.scoreNow() : null; let G = null; try { G = CH.gradeOf(prepOf(ms), proChecks(ms, true), ms); } catch (e) {}
  const C = homeChamp(), six = CH.metaSix(), rows = lairRows(), W = (typeof weekMovers === 'function' ? [] : []);
  const pct = p => { try { return homePct(p); } catch (e) { return ''; } };
  let ud = null; try { ud = V2.underdog ? V2.underdog() : null; } catch (e) {}
  return {mine: ms.map(m => ({n: m.p.n, d: m.d, it: m.heldItem || m.item || '', t: m.p.t})), title: ms.length ? teamTitleFor(ms) : '', s, word: G ? CH.wordOf(G.s) : '', band: G ? G.band : '',
    champ: C ? {ev: V2.evTitle(C.ev.name), who: teamWho(C.t), date: evDate(C.ev.date), players: C.ev.players || null, six: C.six.map(x => ({n: x.p.n, d: V2.disp(x.p.n), it: x.it || x.item || ''}))} : null,
    used: six.slice(0, 3).map(p => ({n: p.n, d: V2.disp(p.n), pct: pct(p), t: p.t})), src: typeof homeSrcLine === 'function' ? homeSrcLine() : '',
    top: rows.slice(0, 10).map(x => ({n: x.p.n, d: x.p.d, r: RS(x.r.total), k: (lairRank(x.p) || {}).rank, t: x.p.t, tier: lTier(x.r.total).k})),
    teams: (typeof RES === 'object' && RES && RES.teams) || 0, ud }; })()
