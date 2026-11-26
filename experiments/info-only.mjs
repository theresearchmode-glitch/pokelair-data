// info-only.mjs (Nov 24): builds ONLY out/info.json (moves/items/Abilities/natures counts, last 28 days) from data/ in the current folder,
// for the redesign Preview while main's daily job does not make it yet. Usage (cwd = a checkout of live with data/): OUTF=path node <repo>/experiments/info-only.mjs
// Daily PokéLair data job: pulls new Reg M-C tournaments from the Limitless public API (staying under its limit of
// 50 requests per 5 minutes), keeps every standing in data/, and rebuilds out/limitless.json:
//  - adj: each Pokémon's own share of team wins (one model over every team, so partners don't get credit)
//  - results: Pokémon win rates, proven pairs and cores, and the exact winning team lists ("proven teams")
// v2 (Oct 26): also keeps every player's full team sheet (moves, items, abilities), each tournament's pairings (who beat
// whom), and builds out/meta_tour.json (sets from real teams), out/teams.json (recent top finishes), out/history.json
// (daily usage ranks for trends) and out/matches.json (game-level results for the team model).
// PokéLair's daily refresh copies these files into the page's data. Run: node update.mjs
import {pid, hasKey} from '../pid.mjs';
import {updateModes} from '../tour-modes.mjs';
import fs from 'node:fs';
import {topcut} from '../topcut.mjs';
import {offFormat, oddEvents, activeReg, sameReg} from '../formats.mjs';
import {politeFetch} from '../http.mjs';
import {lkey, lmap, reportUnknown, canonSet, canonReport, canonNature} from '../names.mjs';
// the regulation every number is built from (out/reg.json from reg.mjs; Reg M-C until a newer one has enough data)
const RG = activeReg();
const API = 'https://play.limitlesstcg.com/api', FORMAT = RG.id, MAX_FETCH = +(process.env.MAX_FETCH || 40), GAP_MS = +(process.env.GAP||6500);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
fs.mkdirSync('data/t', {recursive: true}); fs.mkdirSync('data/t2', {recursive: true}); fs.mkdirSync('data/p', {recursive: true}); fs.mkdirSync('out', {recursive: true});
const index = readJSON('data/index.json', null) || {tournaments: {}};
const KEEP0 = Object.keys(index.tournaments).filter(id => sameReg(index.tournaments[id], FORMAT) && !offFormat(index.tournaments[id].name)), ODD = oddEvents(KEEP0, id => readJSON(`data/t/${id}.json`, null));
const KEEP = KEEP0.filter(id => !ODD.has(id));
const day = d => new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
const V2T = KEEP.map(id => { const T = readJSON(`data/t2/${id}.json`, null); return T ? {id, ...T} : null; }).filter(Boolean)
  .sort((a, b) => new Date(a.d) - new Date(b.d));
const V2 = V2T.map(T => ({...T, e: (T.e || []).map(p => ({...p, dk: (p.dk || []).map(canonSet)}))}));
canonReport('update');
const key = lkey; const nameOf = m => lmap(key({name: m.n, item: m.i}));
const pct = (c, n, k) => [...c].sort((a, b) => b[1] - a[1]).slice(0, k).map(([x, v]) => [x, Math.round(1000 * v / n) / 10]);
const DAY = 864e5, lastD = V2.length ? new Date(V2[V2.length - 1].d).getTime() : Date.now();
// 1b) info sheets (Sim approved the design Nov 22, 11:29 AM; docs/rebuild/info-sheets/HANDOFF.md): for every move, item and Ability, how many
//     of the last 28 days' full team sheets run it and who runs it. Counted straight from the raw sheets, not from the top-12 lists above
//     (those double-count: Protect would read 409%, and hide 183 moves). Each entry: [teams, top 8 users [name, how many of its teams run it, its teams], how many different Pokémon run it].
//     Same KEEP filter, 28-day window, canonSet spelling and nameOf names as meta_tour. Writes out/info.json only.
//     Natures (Dossier step 3, Nov 23): counted the same way from the sheet's nature (names.mjs canonNature: misspellings folded, unreadable
//     ones left out); a nature belongs to one Pokémon, so each nature entry also carries how many Pokémon run it (4th field), and ntN is
//     how many Pokémon had a readable nature (the share on the Nature sheet is 'of tournament Pokémon').
{ const K = {mv: new Map(), it: new Map(), ab: new Map(), nt: new Map()}, per = new Map(); let N = 0, ntN = 0;
  for (const T of V2) { if (lastD - new Date(T.d) > 28 * DAY) continue;
    for (const p of T.e) { if (p.dk.length !== 6) continue; const ns = p.dk.map(nameOf); if (ns.some(n => !n)) continue; N++;
      const seen = {mv: new Set(), it: new Set(), ab: new Set(), nt: new Set()};
      p.dk.forEach((m, i) => { const n = ns[i]; per.set(n, (per.get(n) || 0) + 1);
        const add = (k, x) => { if (!x) return; let o = K[k].get(x); if (!o) K[k].set(x, o = {t: 0, m: 0, u: new Map()}); if (!seen[k].has(x)) { seen[k].add(x); o.t++; } o.m++; o.u.set(n, (o.u.get(n) || 0) + 1); };
        for (const x of new Set(m.mv)) add('mv', x); add('it', m.i); add('ab', m.a); const nt = canonNature(m.nt); if (nt) { ntN++; add('nt', nt); } }); } }
  const pack = (M, mons) => Object.fromEntries([...M].sort((a, b) => b[1].t - a[1].t).map(([x, o]) => [x, [o.t, [...o.u].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([n, c]) => [n, c, per.get(n)]), o.u.size, ...(mons ? [o.m] : [])]]));
  const recent = V2.filter(T => lastD - new Date(T.d) <= 28 * DAY);
  fs.writeFileSync(process.env.OUTF, JSON.stringify({N, source: `Limitless team sheets · ${N.toLocaleString('en-US')} teams from ${recent.length} ${RG.name} tournaments`,
    period: recent.length ? `${day(recent[0].d)} – ${day(recent[recent.length - 1].d)}` : '', mv: pack(K.mv), it: pack(K.it), ab: pack(K.ab), ntN, nt: pack(K.nt, true)}));
  console.log(`info: ${N} teams, ${K.mv.size} moves, ${K.it.size} items, ${K.ab.size} Abilities, ${K.nt.size} natures (${ntN} of ${6 * N} Pokémon with a readable nature)`); }