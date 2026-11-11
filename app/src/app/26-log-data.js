// ---------- Your games: the data steps (R4, Nov 11; shared by today's page and the new build) ----------
// moved from 26-battle-log.js (logKey) and 64-my-record.js (the record, what the log says, logging and removing a game)
const logKey = names => names.slice().sort().join('|');
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
// log one game with the open six: the two leads (only if both were picked), their team (up to 6); keeps the newest 400
function logGame(r, leads, opp) { const ms = members(); if (ms.length !== 6) return null; if (!Array.isArray(S.log)) S.log = [];
  const x = {t: Date.now(), r, b: leads.length === 2 ? leads.slice() : [], tm: ms.map(m => m.p.n), o: opp.slice(0, 6)};
  S.log.push(x); if (S.log.length > 400) S.log = S.log.slice(-400); return x; }
function unlogGame(t) { S.log = (S.log || []).filter(x => x.t !== t); }
