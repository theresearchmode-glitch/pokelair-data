// Tournament pages (step 5): out/events.json, one entry per recent event with its top finishers' full team sheets.
// Limitless events with 32+ players from the last 30 days (top 8 each) and RK9 official events (top 16 each).
// Compact on purpose: the page keeps it in one document (256 KiB cap). Run after update.mjs and rk9.mjs.
import fs from 'node:fs';
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const ROSTER = new Set(readJSON('roster.json', []));
const DAY = 864e5, LIM_TOP = +(process.env.EV_TOP || 8), OFF_TOP = 16, DAYS = 30, MIN_PLAYERS = 32, CAP = 240 * 1024;
// Limitless names -> NastyPlot names: the same rules as update.mjs (key() reads the Mega from the item, lmap() the form)
const REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'}, names = ROSTER;
const key = m => { const it = m.item || ''; const z = it.match(/^(.*)ite( [XYZ])?$/); return z && it !== 'Eviolite' ? m.name + '|M' + (z[2] ? z[2].trim() : '') : m.name; };
function lmap(k) { let [n, mega] = k.split('|'); if (/^Eternal Flower Floette$/.test(n) && mega == null) return 'Floette-Eternal'; n = n.replace(/^Eternal Flower /, '');
  { const r = n.match(/^(Wash|Heat|Frost|Fan|Mow) Rotom$/); if (r) n = 'Rotom-' + r[1]; }
  n = n.replace(/'/g, '’').replace(/^Lycanroc (Dusk|Midnight)$/, 'Lycanroc-$1').replace(/^Low Key Toxtricity$/, 'Toxtricity-Low-Key').replace(/^Paldean Tauros (Aqua|Blaze|Combat) Breed$/, 'Tauros-Paldea-$1');
  let m = n.match(/^(Hisuian|Alolan|Galarian|Paldean) (.*)$/); if (m) n = m[2] + '-' + REG[m[1]];
  n = n.replace(/ ♀$/, '-F').replace(/ ♂$/, '');
  m = n.match(/^(.*?) \((.*)\)$/); if (m) n = m[1] + ({'Dusk Form': '-Dusk', 'Midnight Form': '-Midnight', 'Low Key Form': '-Low-Key'}[m[2]] || '');
  if (mega != null) { const s = mega.slice(1); for (const c of [n + '-Mega' + (s ? '-' + s : ''), n.replace(/-F$/, '') + '-F-Mega', n + '-Mega']) if (names.has(c)) return c; return null; }
  if (names.has(n)) return n; const b = n.split('-')[0]; return names.has(b) ? b : null; }
const lname = m => lmap(key({name: m.n, item: m.i}));
// every name, item, ability, nature and move is stored once in dict and referenced by its index
const dict = [], dix = new Map(), D = x => { x = String(x || ''); if (!dix.has(x)) { dix.set(x, dict.length); dict.push(x); } return dix.get(x); };
const sheet = (n, m) => [D(n), D(m.i), D(m.a), D(m.nt), (m.mv || []).slice(0, 4).map(D)];
const out = [];
// official events first (biggest and most watched)
for (const e of (readJSON('out/official.json', {events: []}).events || [])) {
  const top = e.teams.filter(t => t.st <= OFF_TOP && t.mons.length === 6 && t.mons.every(m => ROSTER.has(m.n))).sort((a, b) => a.st - b.st)
    .map(t => [t.player, t.st, '', t.mons.map(m => sheet(m.n, m))]);
  if (top.length) out.push({id: 'rk9-' + e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name: e.name, date: e.date, players: e.players, src: 'official', top}); }
// Limitless
const index = readJSON('data/index.json', {tournaments: {}});
const ids = Object.keys(index.tournaments);
const lastD = Math.max(...ids.map(id => new Date(index.tournaments[id].d).getTime()).filter(x => x > 0), 0);
for (const id of ids) { const T = readJSON(`data/t2/${id}.json`, null); if (!T || (T.p || 0) < MIN_PLAYERS || lastD - new Date(T.d) > DAYS * DAY) continue;
  const top = T.e.filter(p => p.pl != null && p.pl <= LIM_TOP && p.dk.length === 6).sort((a, b) => a.pl - b.pl).map(p => { const ns = p.dk.map(lname);
    return ns.every(Boolean) ? [p.nm, p.pl, `${p.w}-${p.l}${p.ti ? '-' + p.ti : ''}`, p.dk.map((m, i) => sheet(ns[i], m))] : null; }).filter(Boolean);
  // what the whole field brought: the 8 most common Pokémon among every full team
  const c = new Map(); let n = 0;
  for (const p of T.e) { if (p.dk.length !== 6) continue; const ns = p.dk.map(lname); if (!ns.every(Boolean)) continue; n++; for (const x of new Set(ns)) c.set(x, (c.get(x) || 0) + 1); }
  const field = [...c].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([x, k]) => [D(x), Math.round(1000 * k / n) / 10]);
  if (top.length >= 4) out.push({id, name: T.name, date: T.d.slice(0, 10), players: T.p, src: 'limitless', top, field}); }
out.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.players - a.players));
// keep under the document cap: drop the oldest small events first
console.log("qualifying", out.length);
let doc = {updated: new Date().toISOString(), source: `Limitless (${MIN_PLAYERS}+ players, last ${DAYS} days, top ${LIM_TOP}) + RK9 official events (top ${OFF_TOP})`, dict, events: out};
while (Buffer.byteLength(JSON.stringify(doc)) > CAP && doc.events.length > 10) { let k = -1;
  for (let i = doc.events.length - 1; i >= 0; i--) if (doc.events[i].src !== 'official') { if (k < 0 || doc.events[i].players < doc.events[k].players) k = i; if (doc.events.length - i > 15) break; }
  doc.events.splice(k, 1); }
// fail-safe (stress test, Oct 28): never replace yesterday's events with far fewer (a broken index or a bad day of data)
{ const prev = readJSON('out/events.json', null), n0 = prev && Array.isArray(prev.events) ? prev.events.length : 0;
  if (n0 >= 10 && doc.events.length < n0 * .5) { console.log(`::error::events: only ${doc.events.length} events (had ${n0}); kept the existing file`); process.exit(1); } }
fs.writeFileSync('out/events.json', JSON.stringify(doc));
console.log(`events: ${doc.events.length} (${doc.events.filter(e => e.src === 'official').length} official), ${Math.round(Buffer.byteLength(JSON.stringify(doc)) / 1024)} KiB`);
