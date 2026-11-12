// ---------- event helpers shared by today's page and the new build (R4, Nov 11; moved from 49-events.js) ----------
const evDate = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return d; } };
const placeTxt = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th';
// one tournament team by its key '<event id>#<index>'
function evTeam(key) { const E = META.events; if (!E) return null; const [id, k] = key.split('#'); const ev = E.events.find(e => e.id === id); return ev && ev.top[+k] ? {ev, t: ev.top[+k]} : null; }
// every team of every event, with its key (team search and Compare's winners list)
function tsPool() { const E = META.events; if (!E) return []; const out = [];
  E.events.forEach(ev => ev.top.forEach((t, k) => out.push({ev, t, key: ev.id + '#' + k}))); return out; }

// an event team sheet as My Team slots, with its moves, Ability and items (moved unchanged from 49-events.js loadSheet, Nov 12: shared with the new build's Home)
function sheetSlots(t) { return normSlots(t.mons.map(m => { const p = byName.get(m.n); const mv = m.mv.filter(x => mvByName.has(x)); while (mv.length < 4) mv.push('');
    return {n: m.n, a: p.a.includes(m.a) ? m.a : null, lock: false, ...(mv.some(Boolean) ? {mv: {doubles: mv.slice(0, 4)}} : {}), ...(!p.m && m.i && typeof m.i === 'string' ? {it: {doubles: m.i}} : {})}; })); }
