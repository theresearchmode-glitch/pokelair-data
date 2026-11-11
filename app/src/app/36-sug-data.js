// ---------- Suggestions: settings and words shared with the rebuild (R4, Nov 11) ----------
// Moved unchanged out of today's drawing and click code (34-events.js, 60-concept-h.js), so today's page and the rebuild
// change the same settings the same way and say the same words. Proof: experiments/same-sugctl.mjs.

// Suggest from: My box / Box + catch / Whole roster (kept in this browser, cc2.pool); returns the toast
const POOL_SAY = {box: 'Suggestions only use your box', boxfill: 'Your box first, then the best Pokémon to catch', all: 'Suggestions use the full roster'};
function setPool(v) { ui.pool = ['box', 'boxfill', 'all'].includes(v) ? v : 'boxfill'; LS.set('cc2.pool', ui.pool); return POOL_SAY[ui.pool]; }
