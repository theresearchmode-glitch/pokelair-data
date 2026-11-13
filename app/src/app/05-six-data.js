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
// "Set as lead" (n: a team member's name: it leads with today's first lead) or "Use NastyPlot's pick" (n = ''): changes S.leads.
// Returns the member now leading, null when the pick went back to NastyPlot's, or false when nothing changes (it already leads).
function setLeadPick(n) { const ms = members(); if (n === '') { S.leads = null; return null; }
  const base = teamLineup(ms).lead.map(m => m.p.n); if (base.includes(n)) return false; S.leads = [n, base[0]]; return ms.find(m => m.p.n === n) || null; }
const leadMsg = pk => pk ? `${pk.d} now leads` : "Back to NastyPlot's lead pick";
// what the game plan line says the plan is against / who picked it
const PLAN_VS = {meta: "vs the meta's top six", you: 'your pick', order: 'in team order'};

// ---------- adding a Pokémon into a spot (ADD-01) ----------
// usage under each name: share of tournament teams (Limitless sheets), else the current format's usage
let useCacheV = -1, useMap = null;
function pickUse(p) { if (useCacheV !== metaVersion) { useCacheV = metaVersion; useMap = new Map(); const d = META.doubles_tour; if (d) [...(d.top || []), ...(d.more || [])].forEach(t => { if (typeof t.u === 'number') useMap.set(t.n, t.u); }); }
  if (S.format === 'doubles' && useMap.size) return useMap.get(p.n) || 0; try { return U(p); } catch (e) { return 0; } }
// as the name box shows it: "9.7%", "12%", "<0.1%", or "–" for none
const useText = p => { const u = pickUse(p); return u >= .1 ? u.toFixed(u >= 10 ? 0 : 1) + '%' : u > 0 ? '<0.1%' : '–'; };
// Species Clause: for spot i, a species already in another spot (any form) is not offered
const slotPool = i => p => !S.slots.some((o, j) => { const q = j !== i && byName.get(o.n); return q && q.b === p.b; });
// what the name box lists for q: up to 8 matches (searchMon: exact, start of name, in your box, usage), and a note when the pool
// leaves every match out ("Garchomp is already here" / "Those are already here")
function monChoices(q, pool) { const all = searchMon(q, 40), list = all.filter(p => !pool || pool(p)).slice(0, 8);
  return {list, note: all.length && !list.length ? (all.length === 1 ? all[0].d + ' is already here' : 'Those are already here') : null}; }

// ---------- the set card (TEAM-10) ----------
// its place in the plan, in today's words; nm formats a teammate's name (escName for HTML)
function roleText(m, L, nm = x => x.d) { const has = g => g.some(x => x.i === m.i), other = g => g.filter(x => x.i !== m.i).map(nm).join(' + ');
  if (has(L.lead)) return `Leads with ${other(L.lead) || 'its partner'}`; if (has(L.back)) return `In the back with ${other(L.back) || 'its partner'}`; return 'On the bench'; }
// nature and stat points (Sim, Nov 6): yours when set (paste, link or Edit Set), else what most players run; stat points read as
// words, biggest first ("32 Atk, 32 Spe, 2 HP", no-break spaces). natNote / ptsNote: 'yours' | 'most run' | ''
function natInfo(m) { let sp = m.spread, own = !!(sp && sp.nat && !sp.assumed), nat = sp && sp.nat, natNote = own ? 'yours' : '';
  let cs = null; try { cs = commonSpread(m.p); } catch (e) {}
  // Sim, Nov 13 (Natures Q1 B): show the complete spread (nature + points players run together), as the calcs and Team Sheet do;
  // the most-run nature on its own is only the fallback when there is no spread data
  if (!nat && cs && cs.nat) nat = cs.nat;
  if (!nat) { try { const st = setFor(m.p); if (st.na && st.na.length) nat = st.na[0][0]; } catch (e) {} }
  if (!nat && cs) nat = cs.nat; if (nat && !own) natNote = sp && sp.assumed ? 'yours' : 'most run';
  const pts = sp && !sp.assumed ? sp : cs, ptsNote = sp && !sp.assumed ? 'yours' : pts ? 'most run' : '';
  const L = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'], K = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const words = pts ? K.map((k, j) => [pts[k], L[j]]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).map(x => `${x[0]} ${x[1]}`).join(', ') : '';
  return {nat: nat || '', natNote, words, ptsNote}; }
// a Pokémon's rating out of 100 and its tier letter ("S"), or null when it can't be rated
function monRating(p) { let r = null, tier = ''; try { r = rating(p).total; tier = lTier(r).k; } catch (e) {} return r == null ? null : {n: RS(r), tier}; }
