// Player fields in NastyPlot data (privacy, Sim Nov 10-11; code review C-C2, Nov 17): the same spots scrub-names.mjs treats as
// a player: any string under a "player" or "who" key, and the first entry of a 4-item standings row whose 4th item is a list
// ([player, place, record, mons] in events.top). Used to scrub the test fixture and to check that no real name is left.
// Allowed values: a player ID ("P" + 10 digits, pid.mjs) or a neutral stand-in ("Player 12", as the Preview build writes).
export const OK = s => /^P\d{10}$/.test(String(s)) || /^Player \d+$/.test(String(s)) || !String(s).trim();
const KEYS = new Set(['player', 'who']);

// calls fn(value, set) for every player field in o; set(v) replaces the value in place
export function eachPlayer(o, fn) {
  if (Array.isArray(o)) {
    if (o.length === 4 && typeof o[0] === 'string' && Array.isArray(o[3])) fn(o[0], v => { o[0] = v; });
    o.forEach(x => { if (x && typeof x === 'object') eachPlayer(x, fn); });
    return; }
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) { const v = o[k];
    if (typeof v === 'string' && KEYS.has(k)) fn(v, x => { o[k] = x; });
    else if (v && typeof v === 'object') eachPlayer(v, fn); }
  // This Week's new-in-top-cut rows: [.., .., .., .., .., player] (build.mjs anonymises r[5] the same way)
  if (Array.isArray(o.fresh)) for (const r of o.fresh) if (Array.isArray(r) && typeof r[5] === 'string') fn(r[5], v => { r[5] = v; });
}

// one stand-in per distinct name, shared across every file passed through the same `map`
export const anonymiser = (map = new Map()) => (v, set) => { if (OK(v)) return; if (!map.has(v)) map.set(v, 'Player ' + (map.size + 1)); set(map.get(v)); };
