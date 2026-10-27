// Daily PokéLair data job: pulls new Reg M-C tournaments from the Limitless public API (staying under its limit of
// 50 requests per 5 minutes), keeps every standing in data/, and rebuilds out/limitless.json:
//  - adj: each Pokémon's own share of team wins (one model over every team, so partners don't get credit)
//  - results: Pokémon win rates, proven pairs and cores, and the exact winning team lists ("proven teams")
// v2 (Oct 26): also keeps every player's full team sheet (moves, items, abilities), each tournament's pairings (who beat
// whom), and builds out/meta_tour.json (sets from real teams), out/teams.json (recent top finishes), out/history.json
// (daily usage ranks for trends) and out/matches.json (game-level results for the team model).
// PokéLair's daily refresh copies these files into the page's data. Run: node update.mjs
import fs from 'node:fs';
import {topcut} from './topcut.mjs';
const API = 'https://play.limitlesstcg.com/api', FORMAT = 'M-C', MAX_FETCH = +(process.env.MAX_FETCH || 40), GAP_MS = +(process.env.GAP||6500);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
fs.mkdirSync('data/t', {recursive: true}); fs.mkdirSync('data/t2', {recursive: true}); fs.mkdirSync('data/p', {recursive: true}); fs.mkdirSync('out', {recursive: true});
const index = readJSON('data/index.json', {tournaments: {}});
let calls = 0;
async function get(path) {
  for (let k = 0; k < 6; k++) {
    if (calls++) await sleep(GAP_MS);
    const r = await fetch(API + path, {headers: {'User-Agent': 'pokelair-data (personal team-builder stats)'}});
    if (r.status === 429) { await sleep(((+r.headers.get('retry-after')) || 60) * 1000 + 2000); continue; }
    if (!r.ok) throw new Error(path + ' ' + r.status);
    return r.json();
  }
  throw new Error(path + ' kept hitting the rate limit');
}
// mega form from the held item: "Raichunite X" -> "Raichu|MX"
const key = m => { const it = m.item || ''; const z = it.match(/^(.*)ite( [XYZ])?$/); return z && it !== 'Eviolite' ? m.name + '|M' + (z[2] ? z[2].trim() : '') : m.name; };

// 1) tournament list, then standings for new ones and for anything from the last 3 days (results can still change)
const list = [];
for (let page = 1; page < 30; page++) { const r = await get(`/tournaments?game=VGC&format=${FORMAT}&limit=100&page=${page}`); if (!r.length) break; list.push(...r); }
// v2 files (full sheets + pairings) are backfilled for older tournaments too, newest first, within MAX_FETCH.
const now = Date.now(), hasP = id => fs.existsSync(`data/p/${id}.json`);
const has2 = id => { const T = readJSON(`data/t2/${id}.json`, null); return !!(T && T.v === 3) && hasP(id); };
const todo = list.filter(t => !index.tournaments[t.id] || !has2(t.id) || (now - new Date(t.date)) < 3 * 864e5)
  .sort((a, b) => (index.tournaments[a.id] ? 1 : 0) - (index.tournaments[b.id] ? 1 : 0) || new Date(b.date) - new Date(a.date)).slice(0, MAX_FETCH);
let fetched = 0, logged = false;
const mv = m => ({n: m.name || '', i: m.item || '', a: m.ability || '', mv: Array.isArray(m.attacks) ? m.attacks.map(String) : Array.isArray(m.moves) ? m.moves.map(String) : [], t: m.tera || '', nt: m.nature || ''});
for (const t of todo) {
  try { const s = await get(`/tournaments/${t.id}/standings`);
    if (!logged && s[0]) { console.log('sample standing', JSON.stringify(s[0]).slice(0, 600)); }
    const e = s.map(x => [String(x.player || x.name || ''), x.record ? x.record.wins : 0, x.record ? x.record.losses : 0, (x.decklist || []).map(key)]);
    fs.writeFileSync(`data/t/${t.id}.json`, JSON.stringify({d: t.date, p: t.players, e}));
    const e2 = s.map(x => ({id: String(x.player || ''), nm: String(x.name || ''), pl: x.placing ?? null, w: x.record ? x.record.wins : 0, l: x.record ? x.record.losses : 0, ti: x.record ? (x.record.ties || 0) : 0, dk: (x.decklist || []).map(mv)}));
    fs.writeFileSync(`data/t2/${t.id}.json`, JSON.stringify({v: 3, d: t.date, p: t.players, name: t.name, e: e2}));
    let pr = [];
    if (hasP(t.id) && (now - new Date(t.date)) >= 3 * 864e5) { logged = true; index.tournaments[t.id] = {d: t.date, p: t.players, name: t.name}; fetched++; continue; }
    try { const P = await get(`/tournaments/${t.id}/pairings`);
      if (!logged && P[0]) console.log('sample pairing', JSON.stringify(P[0]).slice(0, 300));
      pr = (Array.isArray(P) ? P : []).map(x => [x.round ?? null, String(x.player1 ?? ''), String(x.player2 ?? ''), x.winner == null ? null : String(x.winner)]); } catch (err) { console.log('no pairings', t.id, err.message); }
    fs.writeFileSync(`data/p/${t.id}.json`, JSON.stringify(pr));
    logged = true;
    index.tournaments[t.id] = {d: t.date, p: t.players, name: t.name}; fetched++;
  } catch (err) { console.log('skip', t.id, err.message); }
}
fs.writeFileSync('data/index.json', JSON.stringify(index));
console.log(`list ${list.length} tournaments, fetched ${fetched}, cached ${Object.keys(index.tournaments).length}`);

// 2) all teams with a full six and 3+ games
const E = []; let first = null, last = null;
for (const id of Object.keys(index.tournaments)) { const T = readJSON(`data/t/${id}.json`, null); if (!T) continue;
  first = !first || T.d < first ? T.d : first; last = !last || T.d > last ? T.d : last;
  for (const [pl, w, l, ks] of T.e) { const m = [...new Set(ks)]; if (m.length === 6 && w + l >= 3) E.push({m, w, l}); } }
const keys = [...new Set(E.flatMap(e => e.m))], ki = new Map(keys.map((k, i) => [k, i])); E.forEach(e => e.ix = e.m.map(k => ki.get(k)));
let W = 0, G = 0; for (const e of E) { W += e.w; G += e.w + e.l; } const base = W / G;

// 3) teammate-adjusted share of the win: logistic model over every team, ridge-shrunk (fit with Adam)
function fit(lb, iters) { const n = keys.length, b = new Float64Array(n), mb = new Float64Array(n), vb = new Float64Array(n); let a = 0, ma = 0, va = 0;
  for (let t = 1; t <= iters; t++) { const gb = new Float64Array(n); let ga = 0;
    for (const e of E) { let eta = a; for (const j of e.ix) eta += b[j]; const d = (e.w + e.l) / (1 + Math.exp(-eta)) - e.w; ga += d; for (const j of e.ix) gb[j] += d; }
    for (let j = 0; j < n; j++) gb[j] += 2 * lb * b[j];
    const c1 = 1 - .9 ** t, c2 = 1 - .999 ** t; ma = .9 * ma + .1 * ga; va = .999 * va + .001 * ga * ga; a -= .05 * (ma / c1) / (Math.sqrt(va / c2) + 1e-8);
    for (let j = 0; j < n; j++) { mb[j] = .9 * mb[j] + .1 * gb[j]; vb[j] = .999 * vb[j] + .001 * gb[j] ** 2; b[j] -= .05 * (mb[j] / c1) / (Math.sqrt(vb[j] / c2) + 1e-8); } }
  return b; }
const B = fit(30, 500);

// 4) Limitless names -> PokéLair names
const ROSTER = readJSON('roster.json', []), names = new Set(ROSTER), REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'};
function lmap(k) { let [n, mega] = k.split('|'); if (/^Eternal Flower Floette$/.test(n) && mega == null) return 'Floette-Eternal'; n = n.replace(/^Eternal Flower /, '');
  { const r = n.match(/^(Wash|Heat|Frost|Fan|Mow) Rotom$/); if (r) n = 'Rotom-' + r[1]; }
  n = n.replace(/'/g, '’').replace(/^Lycanroc (Dusk|Midnight)$/, 'Lycanroc-$1').replace(/^Low Key Toxtricity$/, 'Toxtricity-Low-Key').replace(/^Paldean Tauros (Aqua|Blaze|Combat) Breed$/, 'Tauros-Paldea-$1');
  let m = n.match(/^(Hisuian|Alolan|Galarian|Paldean) (.*)$/); if (m) n = m[2] + '-' + REG[m[1]];
  n = n.replace(/ ♀$/, '-F').replace(/ ♂$/, '');
  m = n.match(/^(.*?) \((.*)\)$/); if (m) n = m[1] + ({'Dusk Form': '-Dusk', 'Midnight Form': '-Midnight', 'Low Key Form': '-Low-Key'}[m[2]] || '');
  if (mega != null) { const s = mega.slice(1); for (const c of [n + '-Mega' + (s ? '-' + s : ''), n.replace(/-F$/, '') + '-F-Mega', n + '-Mega']) if (names.has(c)) return c; return null; }
  if (names.has(n)) return n; const b = n.split('-')[0]; return names.has(b) ? b : null; }
const nm = keys.map(lmap);

// 5) per-Pokémon numbers, pairs (25+ teams), cores (40+ teams), proven team lists
const shrink = (w, g, K) => Math.round(1000 * (w + K * base) / (g + K)) / 1000;
const mon = new Map();
keys.forEach((k, j) => { const n = nm[j]; if (!n) return; let w = 0, g = 0, t = 0; for (const e of E) if (e.ix.includes(j)) { w += e.w; g += e.w + e.l; t++; }
  const o = mon.get(n) || {w: 0, g: 0, t: 0, bs: 0}; o.w += w; o.g += g; o.t += t; o.bs += B[j] * g; mon.set(n, o); });
const P = new Map(), C3 = new Map(), comp = new Map();
for (const e of E) { const m = [...new Set(e.ix.map(j => nm[j]).filter(Boolean))].sort(); if (m.length < 6) continue; const g = e.w + e.l;
  const ck = m.join('|'), co = comp.get(ck) || {n: 0, w: 0, g: 0}; co.n++; co.w += e.w; co.g += g; comp.set(ck, co);
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = m[i] + '|' + m[j], o = P.get(k) || {n: 0, w: 0, g: 0}; o.n++; o.w += e.w; o.g += g; P.set(k, o);
    for (let l = j + 1; l < 6; l++) { const k3 = k + '|' + m[l], q = C3.get(k3) || {n: 0, w: 0, g: 0}; q.n++; q.w += e.w; q.g += g; C3.set(k3, q); } } }
const day = d => new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
const src = `${E.length.toLocaleString('en-US')} Reg M-C tournament teams, ${G.toLocaleString('en-US')} games (Limitless, ${Object.keys(index.tournaments).length} events, ${day(first)} – ${day(last)})`;
const out = {updated: new Date().toISOString(), tournaments: Object.keys(index.tournaments).length, teams: E.length, games: G, base: Math.round(base * 1e4) / 1e4,
  adj: {label: `Limitless · ${Object.keys(index.tournaments).length} Reg M-C tournaments (${day(first)} – ${day(last)}), ${E.length.toLocaleString('en-US')} teams, ${G.toLocaleString('en-US')} games · each Pokémon's own share of the win (teammates accounted for)`,
    rows: [...mon].map(([n, o]) => [n, Math.round(1000 * o.bs / (o.g || 1)) / 1000, o.g, o.t, Math.round(1000 * o.w / (o.g || 1)) / 10])},
  results: {source: src, teams: E.length, base: Math.round(base * 1e4) / 1e4, minCore: 40,
    mons: Object.fromEntries([...mon].map(([n, o]) => [n, [o.t, shrink(o.w, o.g, 40)]])),
    pairs: Object.fromEntries([...P].filter(([, o]) => o.n >= 25).map(([k, o]) => [k, [o.n, shrink(o.w, o.g, 40)]])),
    cores: [...C3].filter(([, o]) => o.n >= 40).map(([k, o]) => [...k.split('|'), o.n, shrink(o.w, o.g, 40)]).sort((a, b) => b[4] - a[4]),
    proven: [...comp].map(([k, o]) => [k.split('|'), o.n, shrink(o.w, o.g, 20), o.g]).filter(x => x[2] >= base + .01 && (x[1] >= 2 || x[3] >= 8)).map(x => x.slice(0, 3)).sort((a, b) => b[2] - a[2] || b[1] - a[1])}};
fs.writeFileSync('out/limitless.json', JSON.stringify(out));
console.log(`teams ${E.length}, games ${G}, pokemon ${mon.size}, pairs ${Object.keys(out.results.pairs).length}, cores ${out.results.cores.length}, proven ${out.results.proven.length}`);

// ---------- v2 outputs ----------
const V2 = Object.keys(index.tournaments).map(id => { const T = readJSON(`data/t2/${id}.json`, null); return T ? {id, ...T} : null; }).filter(Boolean)
  .sort((a, b) => new Date(a.d) - new Date(b.d));
const nameOf = m => lmap(key({name: m.n, item: m.i}));
// 0) top-cut evidence for the ratings (who reaches top cut, conversion, win rate), into results.tc
{ const tc = topcut(V2, nameOf); if (tc) { out.results.tc = tc; fs.writeFileSync('out/limitless.json', JSON.stringify(out)); console.log(`topcut: ${Object.keys(tc.rows).length} Pokémon from ${tc.events} events`); } }
const pct = (c, n, k) => [...c].sort((a, b) => b[1] - a[1]).slice(0, k).map(([x, v]) => [x, Math.round(1000 * v / n) / 10]);
const DAY = 864e5, lastD = V2.length ? new Date(V2[V2.length - 1].d).getTime() : Date.now();
// 1) sets from real team sheets, last 28 days (sets drift; usage and win rates above use every event)
{ const S = new Map(); let nT = 0;
  for (const T of V2) { if (lastD - new Date(T.d) > 28 * DAY) continue;
    for (const p of T.e) { if (p.dk.length !== 6) continue; const ns = p.dk.map(nameOf); if (ns.some(n => !n)) continue; nT++;
      p.dk.forEach((m, i) => { const n = ns[i]; let o = S.get(n); if (!o) S.set(n, o = {t: 0, w: 0, g: 0, mv: new Map(), it: new Map(), ab: new Map(), tm: new Map(), na: new Map()});
        o.t++; o.w += p.w; o.g += p.w + p.l; if (m.nt) o.na.set(m.nt, (o.na.get(m.nt) || 0) + 1);
        for (const x of new Set(m.mv)) o.mv.set(x, (o.mv.get(x) || 0) + 1);
        if (m.i) o.it.set(m.i, (o.it.get(m.i) || 0) + 1); if (m.a) o.ab.set(m.a, (o.ab.get(m.a) || 0) + 1);
        ns.forEach((q, j) => { if (j !== i) o.tm.set(q, (o.tm.get(q) || 0) + 1); }); }); } }
  const rows = [...S].sort((a, b) => b[1].t - a[1].t).map(([n, o], i) => ({r: i + 1, n, u: Math.round(1000 * o.t / nT) / 10, teams: o.t, w: o.g ? Math.round(1000 * o.w / o.g) / 10 : null,
    mv: pct(o.mv, o.t, 12), it: pct(o.it, o.t, 6), ab: pct(o.ab, o.t, 4), na: pct(o.na, o.t, 4), tm: pct(o.tm, o.t, 10)}));
  const recent = V2.filter(T => lastD - new Date(T.d) <= 28 * DAY);
  fs.writeFileSync('out/meta_tour.json', JSON.stringify({format: 'doubles', kind: 'tour', source: `Limitless team sheets · ${nT.toLocaleString('en-US')} teams from ${recent.length} Reg M-C tournaments`,
    period: recent.length ? `${day(recent[0].d)} – ${day(recent[recent.length - 1].d)}` : '', updated: new Date().toISOString(), note: 'Moves, items, abilities and natures as players registered them.',
    top: rows.slice(0, 60), more: rows.slice(60, 100)}));
  console.log(`meta_tour: ${nT} teams, ${rows.length} Pokémon`); }
// 2) recent top finishes (events with 32+ players, last 14 days): top 4 of each, newest first, up to 60 teams
{ const out = [];
  for (const T of [...V2].reverse()) { if (lastD - new Date(T.d) > 14 * DAY || (T.p || 0) < 32) continue;
    for (const p of T.e.filter(p => p.pl != null && p.pl <= 4 && p.dk.length === 6).sort((a, b) => a.pl - b.pl)) {
      const ns = p.dk.map(nameOf); if (ns.some(n => !n)) continue;
      out.push({player: p.nm, event: `${T.name} · ${T.p} players`, record: `${p.w}-${p.l}${p.ti ? '-' + p.ti : ''} · #${p.pl}`, section: lastD - new Date(T.d) <= 7 * DAY ? 'Last 7 days' : 'Last 14 days', mons: ns}); }
    if (out.length >= 60) break; }
  fs.writeFileSync('out/teams.json', JSON.stringify({source: 'Limitless · top 4 of Reg M-C events with 32+ players', updated: new Date().toISOString(), teams: out.slice(0, 60)}));
  console.log(`teams: ${out.length}`); }
// 3) usage-rank history for trends: one entry per day for the last 21 days, each from the 14 days before it
{ const days = [];
  for (let k = 20; k >= 0; k--) { const end = lastD - k * DAY, c = new Map(); let n = 0;
    for (const id of Object.keys(index.tournaments)) { const T = readJSON(`data/t/${id}.json`, null); if (!T) continue; const t = new Date(T.d).getTime(); if (t > end || t <= end - 14 * DAY) continue;
      for (const [, w, l, ks] of T.e) { const ms = [...new Set(ks.map(lmap).filter(Boolean))]; if (ms.length !== 6) continue; n++; for (const m of ms) c.set(m, (c.get(m) || 0) + 1); } }
    if (!n) continue; days.push({d: new Date(end).toISOString().slice(0, 10), tour: Object.fromEntries([...c].sort((a, b) => b[1] - a[1]).slice(0, 80).map(([m], i) => [m, i + 1]))}); }
  fs.writeFileSync('out/history.json', JSON.stringify({days})); console.log(`history: ${days.length} days`); }
// 4) game-level results: every pairing with both teams known (for the team model and player skill)
{ const teamIx = new Map(), teams = [], players = new Map(), plist = [], M = [], featIx = new Map(), feats = [], deckIx = new Map(), decks = [];
  // each player's exact sets as features ("Garchomp@Choice Scarf", "Garchomp:Earthquake") for the win model
  const fix = f => { if (!featIx.has(f)) { featIx.set(f, feats.length); feats.push(f); } return featIx.get(f); };
  const dix = (ns, dk) => { const f = []; dk.forEach((m, i) => { if (m.i) f.push(fix(ns[i] + '@' + m.i)); for (const x of new Set(m.mv)) f.push(fix(ns[i] + ':' + x)); }); const k = f.sort((a, b) => a - b).join(','); if (!deckIx.has(k)) { deckIx.set(k, decks.length); decks.push(f); } return deckIx.get(k); };
  const tix = ns => { const k = [...ns].sort().join('|'); if (!teamIx.has(k)) { teamIx.set(k, teams.length); teams.push(k); } return teamIx.get(k); };
  const pix = k => { if (!players.has(k)) { players.set(k, plist.length); plist.push(k); } return players.get(k); };
  V2.forEach((T, ti) => { const P = readJSON(`data/p/${T.id}.json`, []); if (!P.length) return; const by = new Map();
    for (const p of T.e) { if (p.dk.length !== 6) continue; const ns = p.dk.map(nameOf); if (ns.some(n => !n)) continue; by.set(p.id, {t: tix(ns), pl: pix(p.nm.toLowerCase().trim() || p.id), d: dix(ns, p.dk)}); }
    for (const [r, a, b, win] of P) { const A = by.get(a), B = by.get(b); if (!A || !B) continue; const res = win === a ? 1 : win === b ? 0 : .5; M.push([A.t, B.t, res, ti, A.pl, B.pl, r, A.d, B.d]); } });
  fs.writeFileSync('out/matches.json', JSON.stringify({updated: new Date().toISOString(), events: V2.map(T => [T.id, T.d.slice(0, 10), T.p]), teams, players: plist.length, feats, decks, m: M}));
  console.log(`matches: ${M.length} games, ${teams.length} distinct teams, ${plist.length} players`); }
