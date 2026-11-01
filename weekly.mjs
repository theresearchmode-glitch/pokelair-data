// Weekly digest (step 5b): out/weekly.json, "What changed this week" — the last 7 days of tournament teams against the 7 before.
// Reads the raw team sheets update.mjs already keeps (data/t2: every player's six with items, moves and abilities) and the
// official events rk9.mjs keeps (data/rk9). Writes only changes the sample supports:
//  - usage: % of full teams at standard Reg M-C Limitless events (whole fields), each week
//  - tech: an item, move or ability's share among one Pokémon's teams
//  - styles: % of teams with a Trick Room or Tailwind user, or a weather or terrain setter (from the real sheets)
//  - new in top cut: Pokémon and Pokémon + item pairs in an event's top 8 for the first time this regulation
// A change is reported only when (1) both weeks have enough teams, (2) it is big (points), (3) a two-proportion z-test puts it
// at 3+ standard errors, and (4) it survives dropping the single event that pushes it most (one big event can't make a trend).
// The page shows the counts with every line, and its footnote reads the thresholds from TH below. Run after update.mjs and rk9.mjs.
import fs from 'node:fs';
import {offFormat, oddEvents} from './formats.mjs';
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const DAY = 864e5, CAP = 250 * 1024;
const TH = {teams: 200, z: 3, pts: 2, monTeams: 60, techPts: 6, techMin: 12, cutPlayers: 32, cut: 8};
// Limitless names -> NastyPlot names: the same rules as update.mjs and events.mjs (key() reads the Mega from the item, lmap() the form)
const ROSTER = new Set(readJSON('roster.json', [])), names = ROSTER, REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'};
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
// the event's own calendar day (Limitless times are UTC; evening events in the Americas start after midnight UTC), as events.mjs
const evDay = d => { const t = new Date(d).getTime(); return isFinite(t) ? new Date(t - 6 * 3600e3).toISOString().slice(0, 10) : String(d).slice(0, 10); };
const dayN = s => Math.round(new Date(s + 'T12:00:00Z').getTime() / DAY);
const dayS = n => new Date(n * DAY).toISOString().slice(0, 10);
// team styles, read from the real sheets: a Trick Room or Tailwind user, or a weather or terrain setter (a Mega's own ability
// counts: the sheet lists the base ability, so Charizardite Y means Drought). Keys match the page's archetypes (ARCH).
const SET_AB = {Drizzle: 'rain', Drought: 'sun', 'Sand Stream': 'sand', 'Snow Warning': 'snow', 'Psychic Surge': 'psy', 'Grassy Surge': 'grassy', 'Seed Sower': 'grassy', 'Electric Surge': 'elec', 'Misty Surge': 'misty'};
const MEGA_AB = {}; try { const s = fs.readFileSync('app/src/data/data.js', 'utf8'), m = s.match(/^const ROSTER=(\[.*?\]);?\s*$/m);
  for (const p of m ? JSON.parse(m[1]) : []) if (p.m && Array.isArray(p.a)) for (const a of p.a) if (SET_AB[a]) MEGA_AB[p.n] = a; } catch (e) { console.log('::warning::weekly: Mega abilities not read, so Mega weather setters count only by their base ability'); }
const styles = (ns, dk) => { const s = new Set(); dk.forEach((m, i) => { const mv = new Set(m.mv || []); if (mv.has('Trick Room')) s.add('tr'); if (mv.has('Tailwind')) s.add('tw');
  const a = SET_AB[m.a] || SET_AB[MEGA_AB[ns[i]]]; if (a) s.add(a); }); return s; };

// 1) every standard Reg M-C Limitless event, as the other steps choose them
const index = readJSON('data/index.json', {tournaments: {}});
const ids0 = Object.keys(index.tournaments).filter(id => !offFormat(index.tournaments[id].name)), odd = oddEvents(ids0, id => readJSON(`data/t/${id}.json`, null), () => {});
const EV = ids0.filter(id => !odd.has(id)).map(id => { const T = readJSON(`data/t2/${id}.json`, null); return T && T.d ? {id, name: T.name || '', day: evDay(T.d), p: T.p || 0, e: T.e || []} : null; }).filter(Boolean);
if (!EV.length) { console.log('::warning::weekly: no tournament sheets found; out/weekly.json left unchanged'); process.exit(0); }
const end = Math.max(...EV.map(T => dayN(T.day))), inA = n => n > end - 7 && n <= end, inB = n => n > end - 14 && n <= end - 7;
// 2) per week: teams, Pokémon, each Pokémon's items/moves/abilities, styles; per event too (for the one-event check)
const week = () => ({n: 0, mon: new Map(), opt: new Map(), sty: new Map(), ev: new Map()});
const W = {a: week(), b: week()};
const inc = (m, k, d = 1) => m.set(k, (m.get(k) || 0) + d);
for (const T of EV) { const dn = dayN(T.day), w = inA(dn) ? W.a : inB(dn) ? W.b : null; if (!w) continue;
  const pe = {n: 0, c: new Map()}; w.ev.set(T.id, pe);
  for (const p of T.e) { if (!Array.isArray(p.dk) || p.dk.length !== 6) continue; const ns = p.dk.map(lname); if (ns.some(n => !n) || new Set(ns).size !== 6) continue;
    w.n++; pe.n++;
    p.dk.forEach((m, i) => { const n = ns[i]; inc(w.mon, n); inc(pe.c, 'p:' + n);
      const o = [m.i ? 'i:' + m.i : null, m.a ? 'a:' + m.a : null, ...[...new Set(m.mv || [])].map(x => 'm:' + x)].filter(Boolean);
      for (const x of o) { inc(w.opt, n + '\t' + x); inc(pe.c, 'o:' + n + '\t' + x); } });
    for (const s of styles(ns, p.dk)) { inc(w.sty, s); inc(pe.c, 's:' + s); } } }
// two-proportion z (pooled); positive when week A is higher
const zOf = (x1, n1, x2, n2) => { if (!n1 || !n2) return 0; const p = (x1 + x2) / (n1 + n2), se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2)); return se ? (x1 / n1 - x2 / n2) / se : 0; };
// the change has to hold without the one event that pushes it most: for a rise, drop each event of week A in turn (and
// for a fall, each event of week B); the smallest remaining gap still has to be `need` points. den/ck give the
// denominator (all teams, or the teams with that Pokémon) and the counter key inside each event.
function robust(up, xA, nA, xB, nB, ck, dk, need) {
  const evs = up ? W.a.ev : W.b.ev; let worst = Infinity;
  for (const pe of evs.values()) { const dx = pe.c.get(ck) || 0, dn = dk ? (pe.c.get(dk) || 0) : pe.n; if (!dx && !dn) continue;
    const gap = up ? (xA - dx) / Math.max(1, nA - dn) - xB / nB : (xB - dx) / Math.max(1, nB - dn) - xA / nA; worst = Math.min(worst, gap); }
  return (worst === Infinity ? Math.abs(xA / nA - xB / nB) : worst) * 100 >= need; }
const nA = W.a.n, nB = W.b.n, enough = nA >= TH.teams && nB >= TH.teams;
const r1 = x => Math.round(x * 10) / 10;
// 3) usage
const up = [], down = [];
if (enough) for (const n of new Set([...W.a.mon.keys(), ...W.b.mon.keys()])) { const xA = W.a.mon.get(n) || 0, xB = W.b.mon.get(n) || 0, d = 100 * (xA / nA - xB / nB), z = zOf(xA, nA, xB, nB);
  if (Math.abs(d) < TH.pts || Math.abs(z) < TH.z || Math.max(xA, xB) < 20) continue;
  if (!robust(d > 0, xA, nA, xB, nB, 'p:' + n, null, TH.pts / 2)) continue;
  (d > 0 ? up : down).push([n, xA, xB, r1(d), r1(z)]); }
up.sort((a, b) => b[3] - a[3]); down.sort((a, b) => a[3] - b[3]);
// 4) tech: an option's share among one Pokémon's teams (Pokémon on 60+ teams both weeks); rises only, the biggest first
const tech = [];
if (enough) for (const [k, xA] of W.a.opt) { const [n, o] = k.split('\t'), mA = W.a.mon.get(n) || 0, mB = W.b.mon.get(n) || 0; if (mA < TH.monTeams || mB < TH.monTeams || xA < TH.techMin) continue;
  const xB = W.b.opt.get(k) || 0, d = 100 * (xA / mA - xB / mB), z = zOf(xA, mA, xB, mB); if (d < TH.techPts || z < TH.z) continue;
  if (!robust(true, xA, mA, xB, mB, 'o:' + k, 'p:' + n, TH.techPts / 2)) continue;
  tech.push([n, o.slice(0, 1), o.slice(2), xA, mA, xB, mB, r1(d), r1(z)]); }
tech.sort((a, b) => b[7] - a[7]);
// one line per Pokémon at most (its biggest change), so a single new set doesn't fill the list with its four moves
const techOut = []; { const seen = new Set(); for (const t of tech) { if (seen.has(t[0])) continue; seen.add(t[0]); techOut.push(t); } }
// 5) styles
const sty = {up: [], down: []};
if (enough) for (const k of new Set([...W.a.sty.keys(), ...W.b.sty.keys()])) { const xA = W.a.sty.get(k) || 0, xB = W.b.sty.get(k) || 0, d = 100 * (xA / nA - xB / nB), z = zOf(xA, nA, xB, nB);
  if (Math.abs(d) < TH.pts || Math.abs(z) < TH.z || !robust(d > 0, xA, nA, xB, nB, 's:' + k, null, TH.pts / 2)) continue; (d > 0 ? sty.up : sty.down).push([k, xA, xB, r1(d), r1(z)]); }
sty.up.sort((a, b) => b[3] - a[3]); sty.down.sort((a, b) => a[3] - b[3]);
// every style's share both weeks, for the page's small bar row (reported changes are marked by up/down)
const styAll = [...new Set([...W.a.sty.keys(), ...W.b.sty.keys()])].map(k => [k, W.a.sty.get(k) || 0, W.b.sty.get(k) || 0]).sort((a, b) => b[1] - a[1]);
// 6) new in top cut: top 8 of Limitless events with 32+ players and of official events; first time this regulation
const cut = [];
for (const T of EV) { if (T.p < TH.cutPlayers) continue; for (const p of T.e) { if (p.pl == null || p.pl > TH.cut || !Array.isArray(p.dk) || p.dk.length !== 6) continue;
  const ns = p.dk.map(lname); if (ns.some(n => !n)) continue; cut.push({day: dayN(T.day), ev: T.name, p: T.p, who: p.nm || '', pl: p.pl, mons: p.dk.map((m, i) => ({n: ns[i], i: m.i || ''}))}); } }
// official events: the existing out/official.json (this step makes no new requests anywhere)
for (const R of (readJSON('out/official.json', {events: []}).events || [])) { if (!R || !R.date) continue;
  for (const t of R.teams || []) { if (!(t.st <= TH.cut) || !t.mons || t.mons.length !== 6 || t.mons.some(m => !m.n || !ROSTER.has(m.n))) continue;
    cut.push({day: dayN(R.date), ev: R.name, p: R.players || 0, who: t.player || '', pl: t.st, off: 1, mons: t.mons.map(m => ({n: m.n, i: m.i || ''}))}); } }
cut.sort((a, b) => a.day - b.day || (b.off || 0) - (a.off || 0) || b.p - a.p || a.pl - b.pl);
const firstSeen = new Map(), fresh = new Map(); let cutA = 0;
for (const c of cut) { const isA = inA(c.day); if (isA) cutA++;
  for (const m of c.mons) for (const [k, kind] of [[m.n, 'p'], [m.i ? m.n + '\t' + m.i : null, 's']]) { if (!k) continue;
    if (!firstSeen.has(k)) { firstSeen.set(k, c.day); if (isA) fresh.set(k, {kind, n: m.n, i: kind === 's' ? m.i : '', k: 0, first: c}); }
    if (isA && fresh.has(k)) fresh.get(k).k++; } }
// only things whose first ever top cut is this week; a set only counts when its Pokémon has been in top cut before (else the Pokémon line says it)
const freshOut = [...fresh.values()].filter(f => f.kind === 'p' || !fresh.has(f.n)).sort((a, b) => (a.kind === 'p' ? 0 : 1) - (b.kind === 'p' ? 0 : 1) || b.k - a.k || b.first.p - a.first.p).slice(0, 10)
  .map(f => [f.kind, f.n, f.i, f.k, String(f.first.ev).slice(0, 90), String(f.first.who).slice(0, 40), f.first.pl, dayS(f.first.day), f.first.p]);
const wk = (w, lo, hi) => ({from: dayS(lo), to: dayS(hi), ev: w.ev.size, n: w.n});
const doc = {v: 1, updated: new Date().toISOString(), src: 'Limitless team sheets · standard Reg M-C events (whole fields) + official events (top 8, for new in top cut)', th: TH,
  a: wk(W.a, end - 6, end), b: wk(W.b, end - 13, end - 7), enough, cutA, up: up.slice(0, 8), down: down.slice(0, 8),
  top: [...W.a.mon].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([n, x]) => [n, x, W.b.mon.get(n) || 0]), tech: techOut.slice(0, 10), sty, styAll, fresh: freshOut};
// fail-safe: a week that suddenly has far fewer teams than the week before is a data problem, not a trend
if (enough && (nA < nB * .35 || nB < nA * .35)) { doc.enough = false; doc.up = []; doc.down = []; doc.top = []; doc.tech = []; doc.sty = {up: [], down: []}; console.log(`::warning::weekly: ${nA} teams this week vs ${nB} the week before, too uneven to compare; changes left out`); }
const s = JSON.stringify(doc); if (Buffer.byteLength(s) > CAP) { console.log('::error::weekly: out/weekly.json over 250 KB; left unchanged'); process.exit(1); }
fs.writeFileSync('out/weekly.json', s);
console.log(`weekly: ${doc.a.from}–${doc.a.to} (${nA} teams, ${doc.a.ev} events) vs ${doc.b.from}–${doc.b.to} (${nB} teams, ${doc.b.ev} events); up ${up.length}, down ${down.length}, tech ${techOut.length}, styles +${sty.up.length}/-${sty.down.length}, new in top cut ${freshOut.length}; ${Math.round(s.length / 1024)} KiB`);
