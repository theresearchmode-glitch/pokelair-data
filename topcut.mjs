// Top-cut evidence for the ratings (Oct 27, v3): for every Pokémon, how often it reaches top cut at Limitless events,
// how that compares with how often it's brought (conversion), and its win rate. Recent events count more (21-day
// half-life) and bigger events count more for top cut. The page turns this into the 0-100 rating (13-rating.js).
// Used by update.mjs (daily) and runnable alone to patch out/limitless.json: node topcut.mjs
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
// top cut by event size (Limitless conventions: top 8 for most events, bigger cuts for big ones)
export const cutSize = p => p < 16 ? 2 : p < 32 ? 4 : p < 96 ? 8 : p < 192 ? 16 : 32;
// V2: [{d, p, e: [{pl, w, l, dk}]}] as update.mjs keeps them; nameOf(set) -> page name or null
// M: out/matches.json (games with both teams, for player skill); REP: Showdown replays ([{p, b, l}]) for bring/lead rates
export function topcut(V2, nameOf, M = null, REP = null, half = 21, stab = true) {
  const evs = V2.map(T => { const ents = (T.e || []).filter(p => p.dk && p.dk.length === 6).map(p => ({ms: [...new Set(p.dk.map(nameOf).filter(Boolean))], pl: p.pl, w: p.w || 0, l: p.l || 0})).filter(x => x.ms.length === 6);
    const cut = cutSize(T.p || ents.length); return {d: String(T.d).slice(0, 10), p: T.p || ents.length, ents, top: ents.filter(x => x.pl != null && x.pl <= cut)}; }).filter(E => E.ents.length >= 8);
  if (!evs.length) return null;
  const asOf = evs.map(E => E.d).sort().pop(), S = new Map(), g = n => { let o = S.get(n); if (!o) S.set(n, o = {f: 0, t: 0, ex: 0, w: 0, gm: 0}); return o; };
  let F = 0, Tt = 0, W = 0, GM = 0;
  for (const E of evs) { const age = (new Date(asOf) - new Date(E.d)) / 864e5, rw = Math.pow(.5, Math.max(0, age) / half), sw = Math.log2(Math.max(8, E.p) / 4);
    const cnt = new Map(); for (const x of E.ents) for (const m of x.ms) cnt.set(m, (cnt.get(m) || 0) + 1);
    for (const x of E.ents) { F += rw; W += rw * x.w; GM += rw * (x.w + x.l); for (const m of x.ms) { const o = g(m); o.f += rw; o.w += rw * x.w; o.gm += rw * (x.w + x.l); } }
    if (E.top.length) { const ew = rw * sw; Tt += ew * E.top.length; for (const x of E.top) for (const m of x.ms) g(m).t += ew;
      for (const [m, c] of cnt) g(m).ex += ew * E.top.length * c / E.ents.length; } }
  // rating-weighted usage (Smogon-style): every entry weighted by the chance its player is above the 70th percentile
  // of skill, skill = Elo over every Limitless game in order (matches.json). Tested: adds to the forward test.
  let RW = 0; const rwm = new Map();
  if (M && Array.isArray(M.m) && Array.isArray(M.teams)) { const MT = M.teams.map(k => k.split('|')), evD = (M.events || []).map(e => String(e[1]));
    const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]).map(g => ({A: g[0], B: g[1], r: g[2], ev: g[3], pa: g[4], pb: g[5], rd: g[6] || 0, d: evD[g[3]] || ''})).sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.rd - b.rd);
    const elo = new Map(), get = p => elo.get(p) ?? 1500;
    for (const x of G) { const a = get(x.pa), b = get(x.pb), e = 1 / (1 + Math.pow(10, (b - a) / 400)); elo.set(x.pa, a + 24 * (x.r - e)); elo.set(x.pb, b - 24 * (x.r - e)); }
    const els = [...elo.values()].sort((a, b) => a - b), q70 = els[Math.floor(els.length * .7)] || 1500, seen = new Set();
    for (const x of G) { const rw = Math.pow(.5, Math.max(0, (new Date(asOf) - new Date(x.d)) / 864e5) / half);
      for (const [p, t] of [[x.pa, x.A], [x.pb, x.B]]) { const k = x.ev + '|' + p; if (seen.has(k)) continue; seen.add(k); const w = rw / (1 + Math.exp(-(get(p) - q70) / 40)); RW += w; for (const m of MT[t]) rwm.set(m, (rwm.get(m) || 0) + w); } } }
  const r3 = x => Math.round(x * 1000) / 1000, rows = {};
  // [% of teams, % of top-cut teams, conversion (top-cut share ÷ expected, 6 teams of prior), win %, recency-weighted games,
  //  rating-weighted % of teams (null without game data), hidden-gem stability 0-1 (below)]
  for (const [n, o] of S) rows[n] = [r3(100 * o.f / F), r3(100 * o.t / (Tt || 1)), r3((o.t + 6) / (o.ex + 6)), r3(o.gm ? 100 * o.w / o.gm : 50), Math.round(o.gm), RW ? r3(100 * (rwm.get(n) || 0) / RW) : null];
  // hidden-gem stability (stress test, Oct 28): the share of 20 resamples (each dropping a random 10% of teams) in which
  // the Pokémon still meets the gem bar (300+ games, top cut 15%+ more often than its usage predicts, wins 1+ point more
  // than average). Hydreigon was a gem on the full data but in only 12 of 30 resamples: a coin flip, not a finding.
  if (stab) { const hit = new Map(), K = 20; let s = 9301;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    for (let k = 0; k < K; k++) { const sub = V2.map(T => ({...T, e: (T.e || []).filter(() => rnd() >= .1)})), r = topcut(sub, nameOf, null, null, half, false);
      if (!r) continue; const b = 100 * r.base; for (const [n, x] of Object.entries(r.rows)) if (x[4] >= 300 && x[2] >= 1.15 && x[3] > b + 1) hit.set(n, (hit.get(n) || 0) + 1); }
    for (const n in rows) rows[n].push(r3((hit.get(n) || 0) / K)); }
  // team preview from Showdown replays (shown on the sheet, not scored until there are enough games):
  // {species: [games on a team, % brought, % led]}
  // keyed by species as team preview shows it (a Mega is logged under its Mega name once it evolves, so fold it back)
  const sp = n => brKey(String(n || ''));
  const br = {}; for (const R of REP || []) for (let s = 0; s < 2; s++) { const team = ((R.p || [])[s] || []).map(sp), b = new Set((((R.b || [])[s]) || []).map(sp)), l = new Set((((R.l || [])[s]) || []).map(sp)); if (!b.size) continue;
    for (const m of team) { const o = br[m] || (br[m] = [0, 0, 0]); o[0]++; if (b.has(m)) o[1]++; if (l.has(m)) o[2]++; } }
  for (const k in br) { const o = br[k]; br[k] = [o[0], Math.round(100 * o[1] / o[0]), Math.round(100 * o[2] / o[0])]; }
  return {asOf, half, events: evs.length, cutEvents: evs.filter(E => E.top.length).length, base: r3(W / GM), rows, games: (REP || []).length, br, bw: coBring(REP)}; }
// team preview pairs from Showdown replays: when A is brought and B is on the same team, how often B is brought too.
// {A: [[B, % brought together, games], ...]} (partners with 40+ games, most games first, top 8)
export function coBring(REP, min = 40) { const N = new Map(), K = new Map();
  for (const R of REP || []) for (let s = 0; s < 2; s++) { const team = [...new Set(((R.p || [])[s] || []).map(n => brKey(String(n || ''))))], b = new Set((((R.b || [])[s]) || []).map(n => brKey(String(n || '')))); if (!b.size) continue;
    for (const a of b) for (const c of team) if (c !== a) { const k = a + '|' + c; N.set(k, (N.get(k) || 0) + 1); if (b.has(c)) K.set(k, (K.get(k) || 0) + 1); } }
  const out = {}; for (const [k, n] of N) { if (n < min) continue; const [a, c] = k.split('|'); (out[a] || (out[a] = [])).push([c, Math.round(100 * (K.get(k) || 0) / n), n]); }
  for (const a in out) out[a] = out[a].sort((x, y) => y[2] - x[2]).slice(0, 8); return out; }
// team-preview species key for bring/lead rates: Megas fold into their species (the page looks Pokémon up the same way)
export const brKey = n => n === 'Floette-Mega' ? 'Floette-Eternal' : n.replace(/-Mega(-[XYZ])?$/, '');
// Limitless set -> page name (same rules as update.mjs), from roster.json
export function makeNameOf(ROSTER) { const names = new Set(ROSTER), REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'};
  const key = m => { const it = m.i || ''; const z = it.match(/^(.*)ite( [XYZ])?$/); return z && it !== 'Eviolite' ? m.n + '|M' + (z[2] ? z[2].trim() : '') : m.n; };
  const lmap = k => { let [n, mega] = k.split('|'); if (/^Eternal Flower Floette$/.test(n) && mega == null) return 'Floette-Eternal'; n = n.replace(/^Eternal Flower /, '');
    { const r = n.match(/^(Wash|Heat|Frost|Fan|Mow) Rotom$/); if (r) n = 'Rotom-' + r[1]; }
    n = n.replace(/'/g, '’').replace(/^Lycanroc (Dusk|Midnight)$/, 'Lycanroc-$1').replace(/^Low Key Toxtricity$/, 'Toxtricity-Low-Key').replace(/^Paldean Tauros (Aqua|Blaze|Combat) Breed$/, 'Tauros-Paldea-$1');
    let m = n.match(/^(Hisuian|Alolan|Galarian|Paldean) (.*)$/); if (m) n = m[2] + '-' + REG[m[1]];
    n = n.replace(/ ♀$/, '-F').replace(/ ♂$/, ''); m = n.match(/^(.*?) \((.*)\)$/); if (m) n = m[1] + ({'Dusk Form': '-Dusk', 'Midnight Form': '-Midnight', 'Low Key Form': '-Low-Key'}[m[2]] || '');
    if (mega != null) { const s = mega.slice(1); for (const c of [n + '-Mega' + (s ? '-' + s : ''), n.replace(/-F$/, '') + '-F-Mega', n + '-Mega']) if (names.has(c)) return c; return null; }
    if (names.has(n)) return n; const b = n.split('-')[0]; return names.has(b) ? b : null; };
  const nameOf = m => lmap(key(m)); nameOf.lmap = lmap; return nameOf; }
// standalone: rebuild from data/t2 and patch out/limitless.json (results.tc)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rd = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
  const V2 = fs.readdirSync('data/t2').map(f => rd('data/t2/' + f, null)).filter(T => T && T.v === 3);
  const R = rd('out/replays.json', null), REP = Array.isArray(R) ? R : R ? (Object.values(R).find(Array.isArray) || []) : [];
  const tc = topcut(V2, makeNameOf(rd('roster.json', [])), rd('out/matches.json', null), REP), L = rd('out/limitless.json', null);
  if (!tc || !L || !L.results) { console.log('topcut: nothing to write'); process.exit(0); }
  L.results.tc = tc; fs.writeFileSync('out/limitless.json', JSON.stringify(L));
  console.log(`topcut: ${Object.keys(tc.rows).length} Pokémon, ${tc.events} events (${tc.cutEvents} with top cut), as of ${tc.asOf}`); }
