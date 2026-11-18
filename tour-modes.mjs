// Round format per event (Sim, Nov 17: "single games first"; data helpers' finding: 88% of the games the Strength Score learns
// from are best-of-3 rounds and the format of every event since Nov 9 was unknown). For each Limitless event we hold, the daily job
// asks /tournaments/{id}/details once and keeps its phases as [type, rounds, mode] in data/tour-modes.json, e.g.
// [["SWISS",6,"BO1"],["SINGLE_BRACKET",1,"BO3"]]. Structural only: no results are read here.
// updateModes(index, get, opts) -> {modes, added, tried}; `get` is update.mjs's polite Limitless fetch.
export function phasesOf(details) {
  const P = details && Array.isArray(details.phases) ? details.phases : null;
  if (!P || !P.length) return null;
  const out = P.slice().sort((a, b) => (+a.phase || 0) - (+b.phase || 0)).map(p => [String(p.type || ''), +p.rounds || 0, String(p.mode || '').toUpperCase()]);
  return out.every(p => /^BO\d$/.test(p[2]) && p[1] > 0) ? out : null; // only complete answers are kept; a partial one is asked again next day
}
// Safety (review Nov 17): the step must never cost the daily job its run. It stops at `budgetMs` of its own time, and an error
// marked {stop: true} (e.g. rate-limited) ends it for the day; everything not asked waits for the next run.
export async function updateModes(index, get, {modes = {}, max = 40, now = Date.now(), log = () => {}, budgetMs = 20 * 60e3, clock = () => Date.now()} = {}) {
  const t0 = clock();
  const T = (index && index.tournaments) || {};
  // newest first, only events that have started (their date is past), only those without a stored format
  const need = Object.keys(T).filter(id => !modes[id] && Date.parse(T[id].d) <= now).sort((a, b) => Date.parse(T[b].d) - Date.parse(T[a].d)).slice(0, max);
  let added = 0;
  for (const id of need) {
    if (clock() - t0 > budgetMs) { log(`round formats: time budget used, ${need.length - need.indexOf(id)} left for the next run`); break; }
    try { const ph = phasesOf(await get(`/tournaments/${id}/details`)); if (ph) { modes[id] = ph; added++; } else log(`no round format yet for ${id}`); }
    catch (e) { log(`no details for ${id}: ${e.message}`); if (e && e.stop) { log('round formats: stopped for today'); break; } }
  }
  return {modes, added, tried: need.length};
}
