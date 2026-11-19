// Deliberately broken teams (Nov 18, steady team-wide basics): take real strong teams that run exactly one Mega, swap the Mega
// for its own base form (same Pokémon, no Mega), and read what the built page says, with a given model.json:
//   Strength Score before and after · the broken team's win chance against the original · against an average tournament team.
// Also, in Node with the same model: on every real round where a no-Mega team met a Mega team (out/matches.json), the model's
// average chance for the no-Mega side vs how often it really won (in-sample: the model has seen these games).
// Real results to match: no-Mega teams win about 26-28% against Mega teams.
// Usage: MODEL=<model.json> node experiments/mega-remove.mjs [teams=40]      (build the page first: node app/build.mjs)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const MODEL = JSON.parse(fs.readFileSync(process.env.MODEL || OUT + 'model.json', 'utf8')), N = +(process.argv[2] || 40), L = rd('limitless.json');
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': MODEL, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json')};
// real rounds, no-Mega vs Mega, with the model's raw team numbers (species + pairs + team basics; as experiments/board.mjs without sets)
{ const M = rd('matches.json'), teams = M.teams.map(k => k.split('|')), mega = t => teams[t].some(n => /-Mega/.test(n)), T = MODEL.team || {};
  const x = (t, d) => { const m = teams[t]; let v = 0; for (const n of m) v += MODEL.mons[n] || 0;
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MODEL.pairs || {})[k] || 0; }
    if (T.noMega && !mega(t)) v += T.noMega;
    if (T.protectLow && d != null && M.decks && M.decks[d]) { const f = M.decks[d].map(j => M.feats[j]); if (m.filter(n => f.includes(n + ':Protect')).length <= 2) v += T.protectLow; }
    return v; };
  let n = 0, said = 0, won = 0; for (const g of M.m) { if (g[2] === .5 || g[0] === g[1] || mega(g[0]) === mega(g[1])) continue; const [a, b] = mega(g[0]) ? [g[1], g[0]] : [g[0], g[1]], [da, db] = mega(g[0]) ? [g[8], g[7]] : [g[7], g[8]];
    said += 1 / (1 + Math.exp(-MODEL.calib * (x(a, da) - x(b, db)))); won += mega(g[0]) ? 1 - g[2] : g[2]; n++; }
  console.log(`REAL no-Mega vs Mega rounds: ${n} · the model said ${(said / n * 100).toFixed(1)}% for the no-Mega side · it won ${(won / n * 100).toFixed(1)}% (in-sample, without sets)`); }
const page = ROOT + `app/megarm-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000); fs.unlinkSync(page);
const R = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{ const mk = ns => ns.map(n => abMember(byName.get(n))), g = ns => { try { return gradeTeam(mk(ns)); } catch (e) { return null; } };
  const base = p => ROSTER.find(q => q.b === p.b && !q.m && !isExcl(q));
  const evTops = ((META.events && META.events.events) || []).filter(e => e.src === 'limitless' && e.players >= 32).flatMap(e => e.top.filter(t => t.place && t.place <= 4 && t.mons.length === 6).map(t => t.mons.map(m => m.n)));
  const seen = new Set(), out = [];
  for (const ns of evTops) { const key = ns.slice().sort().join('|'); if (seen.has(key) || out.length >= ${N}) continue; seen.add(key);
    const ps = ns.map(n => byName.get(n)); if (ps.some(p => !p)) continue; const megas = ps.filter(p => p.m); if (megas.length !== 1) continue; const bp = base(megas[0]); if (!bp || ns.includes(bp.n)) continue;
    const br = ns.map(n => n === megas[0].n ? bp.n : n), g0 = g(ns), g1 = g(br); if (g0 == null || g1 == null) continue;
    out.push({mons: ns, mega: megas[0].n, base: bp.n, before: g0, after: g1, vsOrig: winVs(br, ns, mk(br), mk(ns)), vsField: winVsField(br, false).p, origVsField: winVsField(ns, false).p}); }
  const seenB = new Set(), weak = ROSTER.filter(p => !p.m && !isExcl(p)).sort((a, b) => viability(a) - viability(b)).filter(p => !seenB.has(p.b) && seenB.add(p.b)).slice(0, 6).map(p => p.n);
  return JSON.stringify({out, weak: {mons: weak, g: g(weak)}}); })()`));
await b.close();
const o = R.out, av = f => o.reduce((a, t) => a + f(t), 0) / o.length;
console.log(`STRONG TEAMS minus their Mega: ${o.length} top-4 teams with one Mega · score ${av(t => t.before).toFixed(1)} → ${av(t => t.after).toFixed(1)} (drop ${av(t => t.before - t.after).toFixed(1)}) · broken vs its original ${(av(t => t.vsOrig) * 100).toFixed(1)}% · broken vs an average tournament team ${(av(t => t.vsField) * 100).toFixed(1)}% (original ${(av(t => t.origVsField) * 100).toFixed(1)}%) · broken teams under 60: ${o.filter(t => t.after < 60).length}`);
console.log(`WEAKEST SIX: ${R.weak.g == null ? '—' : R.weak.g.toFixed(1)} (${R.weak.mons.join(', ')})`);
if (errs.length) console.log('page errors: ' + errs.slice(0, 3).join(' | '));
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(R, null, 1));
