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

const normMode = m => { const s = String(m || '').toUpperCase(); return /^BO\d+$/.test(s) ? s.toLowerCase() : 'unknown'; };

// Tag a single pairing row with its round format ('bo1' | 'bo3' | 'bo5' | 'unknown') from data/tour-modes.json phases.
// Uses explicit 1-based `phase` from Limitless pairings when present; falls back to cumulative round ranges for cached 4-field rows.
export function roundMode(phases, round, phase = null) {
  if (!Array.isArray(phases) || !phases.length) return 'unknown';
  const modes = phases.map(p => normMode(p && p[2]));
  if (phase != null && Number.isInteger(+phase) && +phase >= 1 && +phase <= phases.length) return modes[+phase - 1];
  const uniq = new Set(modes.filter(m => m !== 'unknown'));
  if (uniq.size === 1 && modes.every(m => m !== 'unknown')) return modes[0];
  if (round == null || !Number.isFinite(+round) || +round < 1) return 'unknown';
  const r = +round;
  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    const [type, rounds] = phases[i];
    const isBracket = /BRACKET/i.test(String(type || ''));
    if (isBracket && i === phases.length - 1) return modes[i];
    acc += (+rounds || 0);
    if (r <= acc) return modes[i];
  }
  const last = phases[phases.length - 1];
  return /BRACKET/i.test(String((last && last[0]) || '')) ? modes[modes.length - 1] : 'unknown';
}

// Event-level summary for out/matches.json events[i][3]: 'bo1' | 'bo3' | 'bo5' | 'mixed' | 'unknown'.
export function eventMode(phases) {
  if (!Array.isArray(phases) || !phases.length) return 'unknown';
  const modes = phases.map(p => normMode(p && p[2])).filter(m => m !== 'unknown');
  if (!modes.length) return 'unknown';
  const uniq = new Set(modes);
  return uniq.size === 1 ? modes[0] : 'mixed';
}
