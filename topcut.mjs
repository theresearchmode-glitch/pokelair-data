// Top-cut evidence for the ratings (Oct 27, v3): for every Pokémon, how often it reaches top cut at Limitless events,
// how that compares with how often it's brought (conversion), and its win rate. Recent events count more (21-day
// half-life) and bigger events count more for top cut. The page turns this into the 0-100 rating (13-rating.js).
// Used by update.mjs (daily) and runnable alone to patch out/limitless.json: node topcut.mjs
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
// top cut by event size (Limitless conventions: top 8 for most events, bigger cuts for big ones)
export const cutSize = p => p < 16 ? 2 : p < 32 ? 4 : p < 96 ? 8 : p < 192 ? 16 : 32;
// V2: [{d, p, e: [{pl, w, l, dk}]}] as update.mjs keeps them; nameOf(set) -> page name or null
export function topcut(V2, nameOf, half = 21) {
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
  const r3 = x => Math.round(x * 1000) / 1000, rows = {};
  // [% of teams, % of top-cut teams, conversion (top-cut share ÷ expected, 6 teams of prior), win %, recency-weighted games]
  for (const [n, o] of S) rows[n] = [r3(100 * o.f / F), r3(100 * o.t / (Tt || 1)), r3((o.t + 6) / (o.ex + 6)), r3(o.gm ? 100 * o.w / o.gm : 50), Math.round(o.gm)];
  return {asOf, half, events: evs.length, cutEvents: evs.filter(E => E.top.length).length, base: r3(W / GM), rows}; }
// standalone: rebuild from data/t2 and patch out/limitless.json (results.tc)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rd = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
  const ROSTER = rd('roster.json', []), names = new Set(ROSTER), REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'};
  const key = m => { const it = m.i || ''; const z = it.match(/^(.*)ite( [XYZ])?$/); return z && it !== 'Eviolite' ? m.n + '|M' + (z[2] ? z[2].trim() : '') : m.n; };
  const lmap = k => { let [n, mega] = k.split('|'); if (/^Eternal Flower Floette$/.test(n) && mega == null) return 'Floette-Eternal'; n = n.replace(/^Eternal Flower /, '');
    { const r = n.match(/^(Wash|Heat|Frost|Fan|Mow) Rotom$/); if (r) n = 'Rotom-' + r[1]; }
    n = n.replace(/'/g, '’').replace(/^Lycanroc (Dusk|Midnight)$/, 'Lycanroc-$1').replace(/^Low Key Toxtricity$/, 'Toxtricity-Low-Key').replace(/^Paldean Tauros (Aqua|Blaze|Combat) Breed$/, 'Tauros-Paldea-$1');
    let m = n.match(/^(Hisuian|Alolan|Galarian|Paldean) (.*)$/); if (m) n = m[2] + '-' + REG[m[1]];
    n = n.replace(/ ♀$/, '-F').replace(/ ♂$/, ''); m = n.match(/^(.*?) \((.*)\)$/); if (m) n = m[1] + ({'Dusk Form': '-Dusk', 'Midnight Form': '-Midnight', 'Low Key Form': '-Low-Key'}[m[2]] || '');
    if (mega != null) { const s = mega.slice(1); for (const c of [n + '-Mega' + (s ? '-' + s : ''), n.replace(/-F$/, '') + '-F-Mega', n + '-Mega']) if (names.has(c)) return c; return null; }
    if (names.has(n)) return n; const b = n.split('-')[0]; return names.has(b) ? b : null; };
  const V2 = fs.readdirSync('data/t2').map(f => rd('data/t2/' + f, null)).filter(T => T && T.v === 3);
  const tc = topcut(V2, m => lmap(key(m))), L = rd('out/limitless.json', null);
  if (!tc || !L || !L.results) { console.log('topcut: nothing to write'); process.exit(0); }
  L.results.tc = tc; fs.writeFileSync('out/limitless.json', JSON.stringify(L));
  console.log(`topcut: ${Object.keys(tc.rows).length} Pokémon, ${tc.events} events (${tc.cutEvents} with top cut), as of ${tc.asOf}`); }
