// Grade audit (Sim, Oct 30: "accuracy is key"): which signal best predicts real results for a team with no record of its own?
// Candidates, each scored on events none of them saw:
//   ready  = readiness for the top 30 threats (today's base)       grade = ready − 6 per missed team check (today's grade)
//   model  = team-strength model trained on older games only       near4/near5 = records of older teams sharing 4+ / 5+ Pokémon
// Tests: (1) the newest 20% of Limitless events, game by game: did the higher-scored team win?
//        (2) official RK9 events (never in any training data): did top-8 teams score above the rest (AUC)?
// Usage: TRAIN_ONLY=1 node model.mjs && node app/build.mjs && node experiments/grade-eval.mjs [out.json]
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), APP = ROOT + 'app/', OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const MODEL = rd('model_train.json'); if (!MODEL) throw new Error('run TRAIN_ONLY=1 node model.mjs first');
const L = rd('limitless.json'), M = rd('matches.json'), OFF = rd('official.json');
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': MODEL, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
// same split as model.mjs: last 20% of events by date held out
const evDates = M.events.map(e => e[1]), order = [...evDates.keys()].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1);
const cut = new Set(order.slice(Math.floor(order.length * .8)));
const teams = M.teams.map(k => k.split('|')), feats = M.feats;
const deckSet = d => { const out = {}; for (const f of (M.decks[d] || [])) { const s = feats[f], i = s.indexOf('@'), j = s.indexOf(':');
  if (i > 0 && (j < 0 || i < j)) { const n = s.slice(0, i); (out[n] = out[n] || {mv: []}).it = s.slice(i + 1); } else if (j > 0) { const n = s.slice(0, j); (out[n] = out[n] || {mv: []}).mv.push(s.slice(j + 1)); } } return out; };
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]), train = G.filter(g => !cut.has(g[3])), test = G.filter(g => cut.has(g[3]));
// older teams' records (train events only)
const rec = new Map(); for (const g of train) for (const [t, w] of [[g[0], g[2]], [g[1], 1 - g[2]]]) { const r = rec.get(t) || rec.set(t, {w: 0, g: 0}).get(t); r.w += w; r.g++; }
const base = [...rec.values()].reduce((a, r) => a + r.w, 0) / [...rec.values()].reduce((a, r) => a + r.g, 0);
const recT = [...rec].map(([t, r]) => ({set: new Set(teams[t]), ...r}));
const near = (names, k, K = 30) => { let w = 0, g = 0; for (const r of recT) { let o = 0; for (const n of names) if (r.set.has(n)) o++; if (o >= k && o < 6) { const wt = o === 5 ? 1 : .35; w += r.w * wt; g += r.g * wt; } } return g ? {v: (w + base * K) / (g + K), g} : null; };
// teams to score: every deck in a held-out game, plus every official team
const decks = new Map(); for (const g of test) for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) { const k = t + '#' + d; if (!decks.has(k)) { const ds = deckSet(d); decks.set(k, {names: teams[t], team: teams[t].map(n => ({n, it: ds[n] && ds[n].it || null, mv: ds[n] ? ds[n].mv.slice(0, 4) : []}))}); } }
const offRows = []; for (const e of (OFF && OFF.events) || []) for (const t of e.teams) offRows.push({ev: e.name, place: t.st, names: t.mons.map(m => m.n), team: t.mons.map(m => ({n: m.n, it: m.i || null, mv: (m.mv || []).slice(0, 4), a: m.a || null}))});
console.log(`train games ${train.length}, test games ${test.length}, test decks ${decks.size}, official teams ${offRows.length}`);
const page = APP + 'gradeeval.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1200, height: 900}})).newPage();
pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
await pg.evaluate(() => window.__ev(`window.__score=function(tm){S.slots=tm.map(x=>({n:x.n,a:x.a||null,lock:false,it:x.it?{doubles:x.it}:undefined,mv:x.mv&&x.mv.length?{doubles:x.mv}:undefined}));fixSlots();
  const ms=members();if(ms.length!==6)return null;const RD=prepOf(ms);if(!RD)return null;const CK=proChecks(ms,true);const miss=CK.items.filter(x=>!x.skip&&!x.ok).length;
  let x=null;try{x=strengthX(ms.map(m=>m.p.n),ms).x0}catch(e){}return {ready:RD.score,grade:RD.score-6*miss,miss,model:x}};0`));
async function scoreAll(list) { const out = []; for (let i = 0; i < list.length; i += 100) { const part = list.slice(i, i + 100);
  out.push(...await pg.evaluate(ts => ts.map(t => { try { return window.__score(t); } catch (e) { return null; } }), part)); if (i % 1000 === 0) process.stdout.write(`${i}/${list.length} `); } return out; }
const dk = [...decks.values()], ds = await scoreAll(dk.map(d => d.team)); dk.forEach((d, i) => { d.s = ds[i]; });
const os = await scoreAll(offRows.map(r => r.team)); offRows.forEach((r, i) => { r.s = os[i]; });
await b.close(); fs.unlinkSync(page); console.log('');
for (const d of dk) { const n4 = near(d.names, 4), n5 = near(d.names, 5); d.n4 = n4 && n4.v; d.n5 = n5 && n5.v; }
for (const r of offRows) { const n4 = near(r.names, 4), n5 = near(r.names, 5); r.n4 = n4 && n4.v; r.n5 = n5 && n5.v; }
const keyOf = (t, d) => t + '#' + d, S = (k, f) => { const d = decks.get(k); return d && d.s ? f(d) : null; };
const PRED = {ready: d => d.s.ready, grade: d => d.s.grade, model: d => d.s.model, near4: d => d.n4, near5: d => d.n5};
const rep = {games: {}, official: {}};
for (const [name, f] of Object.entries(PRED)) { let hit = 0, n = 0, cov = 0;
  for (const g of test) { const a = S(keyOf(g[0], g[7]), f), c = S(keyOf(g[1], g[8]), f); if (a == null || c == null) continue; cov++; if (a === c) { hit += .5; n++; continue; } n++; if ((a > c) === (g[2] === 1)) hit++; }
  rep.games[name] = {acc: +(hit / n).toFixed(4), games: n, of: test.length}; }
const auc = (pos, neg) => { let w = 0, n = 0; for (const a of pos) for (const c of neg) { w += a > c ? 1 : a === c ? .5 : 0; n++; } return n ? +(w / n).toFixed(3) : null; };
const OP = {ready: r => r.s && r.s.ready, grade: r => r.s && r.s.grade, model: r => r.s && r.s.model, near4: r => r.n4, near5: r => r.n5};
for (const [name, f] of Object.entries(OP)) { const byEv = new Map(); for (const r of offRows) { const v = f(r); if (v == null) continue; (byEv.get(r.ev) || byEv.set(r.ev, []).get(r.ev)).push({v, place: r.place}); }
  const per = []; let pos = [], neg = []; for (const [, E] of byEv) { const p = E.filter(x => x.place <= 8).map(x => x.v), q = E.filter(x => x.place > 8).map(x => x.v); const a = auc(p, q); if (a != null) per.push(a); pos = pos.concat(p); neg = neg.concat(q); }
  rep.official[name] = {auc_per_event: per.length ? +(per.reduce((a, x) => a + x, 0) / per.length).toFixed(3) : null, events: per.length, teams: pos.length + neg.length}; }
console.log(JSON.stringify(rep, null, 1));
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({rep, test: test.map(g => [keyOf(g[0], g[7]), keyOf(g[1], g[8]), g[2], g[3]]), decks: Object.fromEntries([...decks].map(([k, d]) => [k, {s: d.s, n4: d.n4, n5: d.n5, names: d.names}])), off: offRows.map(r => ({ev: r.ev, place: r.place, s: r.s, n4: r.n4, n5: r.n5}))}));
