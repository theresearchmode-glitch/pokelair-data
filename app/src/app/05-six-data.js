// ---------- the six on My Team (R4, Nov 11): who leads, and the game plan's words ----------
// Shared by today's page (71-manga.js, 74-arena.js) and the new build (src/v2/pages/six.js). Data only, no HTML.

// the planner's four against the meta's six (CH.four, Battle mode's planner), the rest on the bench; team order when the
// planner can't say (under 4 Pokémon, or no usage data yet). by: 'meta' | 'order'
function lineupBase(ms) { let F = null; try { F = CH.four(ms); } catch (e) {} const has = n => ms.some(m => m.p.n === n);
  if (F && F.lead && F.lead.every(has) && (F.back || []).every(has)) { const lead = F.lead.slice(0, 2).map(n => ms.find(m => m.p.n === n)), back = (F.back || []).slice(0, 2).map(n => ms.find(m => m.p.n === n)); return {lead, back, home: ms.filter(m => !lead.includes(m) && !back.includes(m)), by: 'meta'}; }
  return {lead: ms.slice(0, 2), back: ms.slice(2, 4), home: ms.slice(4), by: 'order'}; }
// your lead pick (Sim, Nov 5): S.leads holds two names you chose with "Set as lead"; it wins over NastyPlot's pick while both
// are on the team. "Use NastyPlot's pick" clears it.
function userLeads(ms) { const U = (S.leads || []).map(n => ms.find(m => m.p.n === n)).filter(Boolean); return U.length === 2 && U[0] !== U[1] ? U : null; }
// the lineup My Team shows: lead, back, bench; by: 'meta' | 'order' | 'you'
function teamLineup(ms) { const L = lineupBase(ms), U = userLeads(ms);
  if (U) { const rest = [...L.lead, ...L.back, ...L.home].filter(m => !U.includes(m)); return {lead: U, back: rest.slice(0, 2), bench: rest.slice(2), by: 'you'}; }
  return {lead: L.lead, back: L.back, bench: L.home, by: L.by}; }
// what the game plan line says the plan is against / who picked it
const PLAN_VS = {meta: "vs the meta's top six", you: 'your pick', order: 'in team order'};

