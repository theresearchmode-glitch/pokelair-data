// ---------- Suggestions: settings and words shared with the rebuild (R4, Nov 11) ----------
// Moved unchanged out of today's drawing and click code (34-events.js, 60-concept-h.js), so today's page and the rebuild
// change the same settings the same way and say the same words. Proof: experiments/same-sugctl.mjs.

// Suggest from: My box / Box + catch / Whole roster (kept in this browser, cc2.pool); returns the toast
const POOL_SAY = {box: 'Suggestions only use your box', boxfill: 'Your box first, then the best Pokémon to catch', all: 'Suggestions use the full roster'};
function setPool(v) { ui.pool = ['box', 'boxfill', 'all'].includes(v) ? v : 'boxfill'; LS.set('cc2.pool', ui.pool); return POOL_SAY[ui.pool]; }
// Megas on team: 0 / 1 / 2 (saved with the team's state, so it follows the account); returns the toast
function setMegaGoal(n) { S.megaGoal = Math.max(0, Math.min(2, +n || 0)); S.maxMega = Math.max(1, S.megaGoal); recCache = {key: null, val: null};
  return S.megaGoal ? `Teams aim for ${S.megaGoal} Mega${S.megaGoal > 1 ? 's' : ''}` : 'Teams without Megas: rare (about 1 in 100 tournament teams), and they win about a third of their games'; }
// Swap my Mega? No / Yes: the hidden "Let plans swap my Mega" box the planner reads (#swapMega); returns the toast
function swapMegaSay(on) { return on ? 'Plans can now swap your Mega' : 'Your Mega is protected again'; }
function setSwapMega(on) { const sw = $('swapMega'); on = !!on; if (!sw || sw.checked === on) return null; sw.checked = on; return swapMegaSay(on); }
