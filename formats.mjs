import fs from 'node:fs';
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

// ---------- regulations (Nov 1): never mix two regulations in the same numbers ----------
// The site is built for SITE_REG. reg.mjs (first step of the daily job) looks at the newest Limitless VGC tournaments of every
// format and at Showdown replays of the next regulation's format, and writes out/reg.json:
//   {id, name, since, sd}  the regulation every number is built from ("active"); all steps read it through activeReg()
//   now                    a newer regulation being played that doesn't have enough data yet (the page shows a calm banner)
//   seen                   per regulation: events, players, first and last day, events in the newest week
// While a newer one is short of REG_SWITCH, everything stays on the active regulation and nothing from the new one is counted
// (Limitless is fetched by format, Showdown by format id, RK9 events by date window). Once it has enough, the active
// regulation switches to it and every step starts over from its own events only. REG_AUTO_SWITCH=0 holds the switch
// (banner only) for a manual check.
export const SITE_REG = {id: 'M-C', sd: 'gen9championsvgc2026regmc', since: '2026-09-01'};
export const REG_SWITCH = {events: 20, players: 1200};
export const REG_AUTO_SWITCH = (typeof process !== 'undefined' && process.env && process.env.REG_AUTO_SWITCH) !== '0';
export const regName = id => 'Reg ' + id;
const REG_ID = /^[A-Z]-[A-Z]$/;
// Showdown's id for a regulation: Reg M-C is gen9championsvgc2026regmc; the year part of a later one isn't known in advance
export const sdGuess = (id, year) => `gen9championsvgc${year}reg${String(id).replace('-', '').toLowerCase()}`;
export const sdReg = fmt => { const m = String(fmt || '').match(/^gen9championsvgc\d{4}reg([a-z])([a-z])$/); return m ? `${m[1].toUpperCase()}-${m[2].toUpperCase()}` : null; };
export const nextRegIds = id => { const [a, b] = String(id).split('-'); return b && b < 'Z' ? [`${a}-${String.fromCharCode(b.charCodeAt(0) + 1)}`] : []; };
export function readReg(file = 'out/reg.json') { try { const r = JSON.parse(fs.readFileSync(file, 'utf8')); return r && REG_ID.test(r.id) ? r : null; } catch (e) { return null; } }
// the regulation the numbers are built from, and the window its events fall in (end = the day a newer one started, if any)
export function activeReg(file) { const r = readReg(file);
  if (!r) return {...SITE_REG, name: regName(SITE_REG.id), end: null};
  return {id: r.id, name: regName(r.id), sd: r.sd || (r.id === SITE_REG.id ? SITE_REG.sd : sdGuess(r.id, String(r.since || '').slice(0, 4))), since: r.since || SITE_REG.since, end: r.now && r.now.id !== r.id ? r.now.since : null}; }
// an event's regulation: saved with it from Nov 1; older saved events are all Reg M-C (the only format the job ever fetched)
export const regOf = e => (e && typeof e.f === 'string' && e.f) || SITE_REG.id;
export const sameReg = (e, id) => regOf(e) === id;
export const inRegWindow = (date, reg) => { const d = String(date || '').slice(0, 10); return !!d && d >= reg.since && (!reg.end || d < reg.end); };
// list: Limitless tournaments of any format [{format, date, players}]; sd: {showdownFormat: {n, first}} from replay searches;
// prev: yesterday's out/reg.json. Pure, so experiments/reg-test.mjs can feed it made-up data.
export function detectReg(list, sd, prev, today) {
  today = today || new Date().toISOString().slice(0, 10);
  let id = prev && REG_ID.test(prev.id) ? prev.id : SITE_REG.id, since = (prev && prev.since) || SITE_REG.since, sdId = (prev && prev.sd) || SITE_REG.sd;
  const fam = id.split('-')[0] + '-', seen = {}, rows = (Array.isArray(list) ? list : []).map(t => ({f: String(t && t.format || ''), d: String(t && t.date || '').slice(0, 10), p: +(t && t.players) || 0}))
    .filter(t => t.f.startsWith(fam) && REG_ID.test(t.f) && /^\d{4}-\d{2}-\d{2}$/.test(t.d));
  const last = rows.reduce((a, t) => t.d > a ? t.d : a, ''), cut = last ? new Date(Date.parse(last) - 6 * 864e5).toISOString().slice(0, 10) : '';
  for (const t of rows) { const s = seen[t.f] = seen[t.f] || {events: 0, players: 0, first: t.d, last: t.d, week: 0};
    s.events++; s.players += t.p; if (t.d < s.first) s.first = t.d; if (t.d > s.last) s.last = t.d; if (t.d >= cut) s.week++; }
  // the regulation being played now: most events in the newest week (a tie goes to the one that started later)
  const nowId = Object.keys(seen).sort((a, b) => seen[b].week - seen[a].week || (seen[b].first > seen[a].first ? 1 : -1))[0];
  const sdFor = r => { const k = Object.keys(sd || {}).find(f => sdReg(f) === r && +sd[f].n > 0); return k || sdGuess(r, today.slice(0, 4)); };
  let now = null;
  if (nowId && nowId !== id && seen[nowId].first >= since) now = {id: nowId, since: seen[nowId].first, events: seen[nowId].events, players: seen[nowId].players, week: seen[nowId].week, from: 'limitless'};
  // no tournaments yet, but the next regulation's ladder has started on Showdown (20+ replays): say so too
  if (!now) for (const [f, x] of Object.entries(sd || {})) { const r = sdReg(f); if (r && r !== id && !seen[r] && x && +x.n >= 20 && x.first) now = {id: r, since: String(x.first).slice(0, 10), events: 0, players: 0, week: 0, ladder: +x.n, from: 'showdown'}; }
  let switched = prev && prev.switched || null;
  if (now && REG_AUTO_SWITCH && now.events >= REG_SWITCH.events && now.players >= REG_SWITCH.players) { switched = {from: id, to: now.id, on: today}; id = now.id; since = now.since; sdId = sdFor(id); now = null; }
  return {id, name: regName(id), since, sd: sdId, site: SITE_REG.id, now: now ? {...now, name: regName(now.id), need: REG_SWITCH} : null, switched, seen, checked: today}; }
