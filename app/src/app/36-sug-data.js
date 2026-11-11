// ---------- Suggestions: settings and words shared with the rebuild (R4, Nov 11) ----------
// Moved unchanged out of today's drawing and click code (34-events.js, 60-concept-h.js), so today's page and the rebuild
// change the same settings the same way and say the same words. Proof: experiments/same-sugctl.mjs.

// Suggest from: My box / Box + catch / Whole roster (kept in this browser, cc2.pool); returns the toast
const POOL_SAY = {box: 'Suggestions only use your box', boxfill: 'Your box first, then the best Pokémon to catch', all: 'Suggestions use the full roster'};
function setPool(v) { ui.pool = ['box', 'boxfill', 'all'].includes(v) ? v : 'boxfill'; LS.set('cc2.pool', ui.pool); return POOL_SAY[ui.pool]; }
// Megas on team: 0 / 1 / 2 (saved with the team's state, so it follows the account); returns the toast
function setMegaGoal(n) { S.megaGoal = Math.max(0, Math.min(2, +n || 0)); S.maxMega = Math.max(1, S.megaGoal); recCache = {key: null, val: null};
  return S.megaGoal ? `Teams aim for ${S.megaGoal} Mega${S.megaGoal > 1 ? 's' : ''}` : 'Teams without Megas: rare (about 1 in 100 tournament teams), and they win about a third of their games'; }
// the team checks card's words (moved from render(), 08-render-all.js)
const CK_TXT = {intro: 'What recent event winners usually have, measured live from the Events data. A missing check is a gap to know about, not a verdict: plenty of winning teams miss one, and play decides most games. A ~ means only partly there, and doesn\'t count as passed.',
  notes: 'Notes, not counted', notesWhy: 'In 38,513 real games, with player skill taken into account, teams with these won no more often.'};
// the problems list when nothing is wrong (moved from renderProblems, 09-quick-add.js)
const PROB_TXT = {clear: 'All clear', clearWhy: 'No type problems, and the team has speed control and support.'};
// " · " lists said in words (moved unchanged from rzDots, 70-riso2.js, R4 Nov 11; the rebuild's Suggestions use it on the same texts):
// a missing value ("— ·") in words, "who · what" in a list with ";" as "who with what", other dots as lead (", " or ": ") then ", "
function undotText(v, lead, list) { v = v.replace(/—\s*·\s*/g, 'no power, ');
  /* "Whimsicott · Tailwind; Basculegion · Aqua Jet": who with what */
  if (list) v = v.replace(/([A-Za-zé'’-]+(?: [A-Z][A-Za-zé'’-]+)*) · ([A-Z][A-Za-z'’ -]+?)(?=;|,|$| ·)/g, '$1 with $2'); if (/^\s*·\s*$/.test(v)) return lead;
  let first = true; return v.replace(/\s*·\s*/g, () => { const r = first ? lead : ', '; first = false; return r; }).replace(/^,\s*/, ', ').replace(/,\s*,/g, ',').replace(/:\s*,/g, ':'); }
// Swap my Mega? No / Yes: the hidden "Let plans swap my Mega" box the planner reads (#swapMega); returns the toast
function swapMegaSay(on) { return on ? 'Plans can now swap your Mega' : 'Your Mega is protected again'; }
function setSwapMega(on) { const sw = $('swapMega'); on = !!on; if (!sw || sw.checked === on) return null; sw.checked = on; return swapMegaSay(on); }
