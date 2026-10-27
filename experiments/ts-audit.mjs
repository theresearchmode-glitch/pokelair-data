// Team Score audit: scores real teams from held-out events (the model never saw them) with the page's own Team Score,
// and a few hand-made teams. Reports how well the score separates top finishers from the rest.
// Usage: MODEL=out/model_train.json node experiments/ts-audit.mjs [out.json]
// (make the train-only model first: TRAIN_ONLY=1 node model.mjs). Needs app/dist/page.html (node app/build.mjs).
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), APP = ROOT + 'app/', OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const MODEL = JSON.parse(fs.readFileSync(ROOT + (process.env.MODEL || 'out/model_train.json'), 'utf8'));
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': MODEL, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const M = rd('matches.json'), OFF = rd('official.json');
// held-out events: the same split as model.mjs (last 20% of events by date)
const evDates = M.events.map(e => e[1]), order = [...evDates.keys()].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1);
const TF = +(process.env.TEST_FROM || .8), cut = new Set(order.slice(Math.floor(order.length * TF)));
const teams = M.teams.map(k => k.split('|')), feats = M.feats;
const deckSet = d => { const out = {}; for (const f of (M.decks[d] || [])) { const s = feats[f], i = s.indexOf('@'), j = s.indexOf(':');
  if (i > 0 && (j < 0 || i < j)) { const n = s.slice(0, i); (out[n] = out[n] || {mv: []}).it = s.slice(i + 1); } else if (j > 0) { const n = s.slice(0, j); (out[n] = out[n] || {mv: []}).mv.push(s.slice(j + 1)); } } return out; };
// standings per held-out event: each player's record with the team/deck they played
const evs = new Map();
for (const g of M.m) { const [A, B, r, ev, pa, pb, , dA, dB] = g; if (!cut.has(ev)) continue; let E = evs.get(ev); if (!E) { E = new Map(); evs.set(ev, E); }
  for (const [p, t, d, w] of [[pa, A, dA, r], [pb, B, dB, 1 - r]]) { let s = E.get(p); if (!s) { s = {t, d, w: 0, n: 0}; E.set(p, s); } s.w += w; s.n++; } }
const rows = [];
for (const [ev, E] of evs) { const st = [...E.values()].filter(s => s.n >= 3).sort((a, b) => b.w - a.w || (b.w / b.n) - (a.w / a.n)); if (st.length < 16) continue;
  st.forEach((s, i) => { const ds = s.d != null ? deckSet(s.d) : {}; rows.push({src: 'limitless', ev, place: i + 1, size: st.length, wr: s.w / s.n, team: teams[s.t].map(n => ({n, it: ds[n] && ds[n].it || null, mv: ds[n] ? ds[n].mv.slice(0, 4) : []}))}); }); }
// official events (RK9 team sheets with placements): never in the model's games
for (const e of (OFF && OFF.events) || []) for (const t of e.teams) rows.push({src: 'official', ev: e.name, place: t.st, size: e.players, team: t.mons.map(m => ({n: m.n, it: m.i || null, mv: (m.mv || []).slice(0, 4), a: m.a || null}))});
// hand-made teams that show the complaints
const HAND = JSON.parse(process.env.HAND || 'null') || [
  {name: 'niche stack', team: ['Annihilape', 'Kommo-o', 'Scrafty', 'Venusaur-Mega', 'Hydreigon', 'Charizard-Mega-Y'].map(n => ({n}))},
  {name: 'niche stack 2', team: ['Annihilape', 'Kommo-o', 'Houndstone', 'Floette-Mega', 'Kingambit', 'Primarina'].map(n => ({n}))},
  {name: 'TR, one slow attacker', team: [{n: 'Farigiraf', mv: ['Trick Room', 'Psychic', 'Hyper Voice', 'Protect']}, {n: 'Incineroar'}, {n: 'Sneasler'}, {n: 'Garchomp'}, {n: 'Charizard-Mega-Y'}, {n: 'Torkoal'}]},
  {name: 'TR, coherent', team: [{n: 'Farigiraf', mv: ['Trick Room', 'Psychic', 'Hyper Voice', 'Protect']}, {n: 'Incineroar'}, {n: 'Torkoal'}, {n: 'Kingambit'}, {n: 'Charizard-Mega-Y'}, {n: 'Amoonguss'}]},
  {name: 'TR + Choice Scarf', team: [{n: 'Farigiraf', mv: ['Trick Room', 'Psychic', 'Hyper Voice', 'Protect']}, {n: 'Incineroar'}, {n: 'Torkoal'}, {n: 'Kingambit'}, {n: 'Charizard-Mega-Y'}, {n: 'Garchomp', it: 'Choice Scarf'}]},
  {name: 'duplicate items', team: [{n: 'Incineroar', it: 'Sitrus Berry'}, {n: 'Rillaboom', it: 'Sitrus Berry'}, {n: 'Sneasler'}, {n: 'Kingambit'}, {n: 'Charizard-Mega-Y'}, {n: 'Whimsicott'}]},
  {name: 'user 97 team', team: [{n: 'Raichu-Mega-X', mv: ['Fake Out', 'Protect', 'Volt Tackle', 'Volt Switch']}, {n: 'Sneasler', it: 'Psychic Seed', a: 'Unburden', mv: ['Close Combat', 'Dire Claw', 'Protect', 'Fake Out']},
    {n: 'Primarina', it: 'Leftovers', a: 'Liquid Voice', mv: ['Hyper Voice', 'Protect', 'Moonblast', 'Calm Mind']}, {n: 'Charizard-Mega-Y', mv: ['Heat Wave', 'Protect', 'Weather Ball', 'Solar Beam']},
    {n: 'Farigiraf', it: 'Sitrus Berry', a: 'Armor Tail', mv: ['Trick Room', 'Helping Hand', 'Psychic', 'Thunderbolt']}, {n: 'Hydreigon', it: 'Choice Scarf', a: 'Levitate', mv: ['Dark Pulse', 'Draco Meteor', 'Earth Power', 'Snarl']}]},
  {name: 'sample (Sun Tailwind)', team: ['Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit', 'Garchomp', 'Sneasler'].map(n => ({n}))}];
const page = APP + 'tsaudit.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(process.env.PAGE || APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1200, height: 900}})).newPage();
pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
await pg.evaluate(() => window.__ev(`window.__score=function(tm){S.format='doubles';S.slots=tm.map(x=>({n:x.n,a:x.a||null,lock:false,it:x.it?{doubles:x.it}:undefined,mv:x.mv&&x.mv.length?{doubles:x.mv}:undefined}));fixSlots();
  const ms=members();if(ms.length!==6)return null;const wv=winVsField(ms.map(m=>m.p.n),true,ms);if(!wv)return null;const ts=teamScore({wv});
  return {s:ts.score,b:ts.before,miss:(wv.struct&&wv.struct.miss)||[],ded:ts.ded||[],label:ts.label,illegal:!!ts.illegal}};0`));
async function scoreAll(list) { const out = []; for (let i = 0; i < list.length; i += 200) { const part = list.slice(i, i + 200).map(r => r.team);
  out.push(...await pg.evaluate(ts => ts.map(t => { try { return window.__score(t); } catch (e) { return null; } }), part)); } return out; }
const sc = await scoreAll(rows); rows.forEach((r, i) => { r.ts = sc[i]; }); const hs = await scoreAll(HAND); HAND.forEach((h, i) => { h.ts = hs[i]; });
await b.close(); fs.unlinkSync(page);
// metrics
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : null; };
const auc = (pos, neg) => { let w = 0, n = 0; for (const a of pos) for (const c of neg) { w += a > c ? 1 : a === c ? .5 : 0; n++; } return n ? +(w / n).toFixed(3) : null; };
const rep = {};
for (const src of ['limitless', 'official']) { const R = rows.filter(r => r.src === src && r.ts); const g = f => R.filter(f).map(r => r.ts.s);
  const top8 = r => src === 'official' ? r.place <= 8 : r.place <= 8, rest = r => src === 'official' ? r.place > 16 : r.place > 8;
  // per event: share of the rest that outscore that event's winner
  const byEv = new Map(); for (const r of R) { if (!byEv.has(r.ev)) byEv.set(r.ev, []); byEv.get(r.ev).push(r); }
  let above = 0, restN = 0, aucE = []; for (const [, E] of byEv) { const w = E.find(r => r.place === 1); if (!w) continue; const re = E.filter(rest); above += re.filter(r => r.ts.s > w.ts.s).length; restN += re.length;
    const a = auc(E.filter(top8).map(r => r.ts.s), re.map(r => r.ts.s)); if (a != null) aucE.push(a); }
  rep[src] = {teams: R.length, events: byEv.size, winners_median: med(g(r => r.place === 1)), winners_q25: q(g(r => r.place === 1), .25), top4_median: med(g(r => r.place <= 4)), top8_median: med(g(top8)), rest_median: med(g(rest)),
    rest_q90: q(g(rest), .9), auc_top8_vs_rest_pooled: auc(g(top8), g(rest)), auc_top8_vs_rest_mean_per_event: aucE.length ? +(aucE.reduce((a, x) => a + x, 0) / aucE.length).toFixed(3) : null,
    share_of_rest_above_their_winner: restN ? +(above / restN).toFixed(3) : null, rest_scoring_90plus: R.filter(r => rest(r) && r.ts.s >= 90).length, winners_cut: R.filter(r => r.place === 1 && r.ts.b > r.ts.s).length + '/' + R.filter(r => r.place === 1).length,
    top8_any_cut: R.filter(r => top8(r) && r.ts.b > r.ts.s).length + '/' + R.filter(top8).length, top8_illegal: R.filter(r => top8(r) && r.ts.illegal).length};
  // what drives the highest-scoring non-top teams
  const hi = R.filter(r => rest(r) && r.ts.s >= 90), cnt = new Map(); for (const r of hi) for (const m of r.team) cnt.set(m.n, (cnt.get(m.n) || 0) + 1);
  rep[src].hi_rest_common = [...cnt].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([n, c]) => n + ' ' + c); }
rep.hand = HAND.map(h => ({name: h.name, score: h.ts && h.ts.s, before: h.ts && h.ts.b, miss: h.ts && h.ts.miss, ded: h.ts && h.ts.ded, illegal: h.ts && h.ts.illegal}));
console.log(JSON.stringify(rep, null, 1)); if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({rep, rows: rows.map(r => ({src: r.src, ev: r.ev, place: r.place, s: r.ts && r.ts.s, b: r.ts && r.ts.b, team: r.team.map(m => m.n)}))}));
