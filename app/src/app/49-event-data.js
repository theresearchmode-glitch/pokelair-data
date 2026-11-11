// ---------- event helpers shared by today's page and the new build (R4, Nov 11; moved from 49-events.js) ----------
const evDate = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return d; } };
const placeTxt = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th';
// one tournament team by its key '<event id>#<index>'
function evTeam(key) { const E = META.events; if (!E) return null; const [id, k] = key.split('#'); const ev = E.events.find(e => e.id === id); return ev && ev.top[+k] ? {ev, t: ev.top[+k]} : null; }
// every team of every event, with its key (team search and Compare's winners list)
function tsPool() { const E = META.events; if (!E) return []; const out = [];
  E.events.forEach(ev => ev.top.forEach((t, k) => out.push({ev, t, key: ev.id + '#' + k}))); return out; }
