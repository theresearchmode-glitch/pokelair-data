// Events played under extra rules (themed or restricted cups) aren't standard Reg M-C: their teams would skew usage, win rates
// and the team model (sweep, Oct 31: Spooky Cup had Incineroar at 0%, Monotype events are 72–100% single-type teams).
// Every pipeline step skips them by name. The raw files stay in data/ so nothing is lost if a name is matched by mistake.
export const OFF_FORMAT = /off[ -]?meta|spooky|mono ?type|small pok[eé]mon|ultra beast|draft|\bbst\b|-\s?1\s?%|under \d+\s?%|little cup|\bnfe\b/i;
export const offFormat = name => OFF_FORMAT.test(String(name || ''));

// The alarm for themed events whose names the filter above doesn't catch (Oct 31). Staples (Pokémon on 20%+ of all standard
// teams) always show up in a normal event: one expected on 8+ of an event's teams but on none of them is a chance of about 1 in
// 3,000, so the event is almost certainly played under extra rules. It's left out automatically and named in the daily job's
// log as a ::warning::. Tested on Oct 31 data: it flags Mudkip's Marsh Pit #7 (no Kingambit or Rillaboom on 43 teams) and
// Rising Stars S4 (no Rillaboom on 27), and no normal event. readT(id) returns the event's data/t file; "Raichu|MY" counts as Raichu.
export function oddEvents(ids, readT, log = console.log) {
  const base = k => String(k).split('|')[0], ev = [], tot = new Map(); let n = 0;
  for (const id of ids) { const T = readT(id); if (!T || !Array.isArray(T.e)) continue; const c = new Map(); let t = 0;
    for (const [, , , ks] of T.e) { const s = [...new Set((ks || []).map(base))]; if (s.length !== 6) continue; t++; for (const x of s) c.set(x, (c.get(x) || 0) + 1); }
    ev.push({id, t, c}); n += t; for (const [x, k] of c) tot.set(x, (tot.get(x) || 0) + k); }
  const staples = [...tot].map(([x, k]) => [x, n ? k / n : 0]).filter(([, sh]) => sh >= .2), out = new Set();
  for (const e of ev) { if (e.t < 20) continue; const gone = staples.filter(([x, sh]) => sh * e.t >= 8 && !e.c.get(x)).map(([x]) => x);
    if (gone.length) { out.add(e.id); log(`::warning::left out event ${e.id}: no ${gone.join(', ')} on any of its ${e.t} teams, so it looks like a restricted format`); } }
  return out;
}
