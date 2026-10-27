// Battle mode check: for real Showdown games, does the page's "bring these four" pick match what the WINNING side
// actually brought, better than simple baselines? Uses the built page's own planMatchup (run in Chromium with the repo
// data), so it tests exactly what users see. Usage: node experiments/bring-test.mjs [minRating]
import fs from 'node:fs'; import {execFileSync} from 'node:child_process'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', MIN = +(process.argv[2] || 0);
execFileSync('node', [APP + 'build.mjs'], {stdio: 'ignore'});
const page = APP + 'dist/bring.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), R = rd('replays.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const games = R.games.filter(g => g.r[0] >= MIN && g.r[1] >= MIN);
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const res = await pg.evaluate(G => { window.__G = G; return window.__ev(`(() => { const G = window.__G;
  const mk = names => names.map(n => byName.get(n)).filter(Boolean).map(p => ({...abMember(p), i: -1}));
  let n = 0, plannerHits = 0, popHits = 0, randHits = 0, leadHits = 0, popLeadHits = 0;
  // baseline: bring the 4 Pokémon most often brought in the whole sample (by bring rate when on the team)
  const on = new Map(), br = new Map(), ld = new Map();
  for (const g of G) for (const s of [0, 1]) { for (const x of g.p[s]) on.set(x, (on.get(x) || 0) + 1); for (const x of g.b[s]) br.set(x, (br.get(x) || 0) + 1); for (const x of g.l[s]) ld.set(x, (ld.get(x) || 0) + 1); }
  const rate = (m, x) => (m.get(x) || 0) / (on.get(x) || 1);
  for (const g of G) { const w = g.w, me = g.p[w], them = g.p[1 - w]; if (g.b[w].length !== 4) continue;
    const mine = mk(me), theirs = mk(them).map(m => oppMember(m.p)); if (mine.length !== 6 || theirs.length !== 6) continue;
    let r; try { r = planMatchup(mine, theirs, true); } catch (e) { continue; }
    const pick = [...r.lead, ...r.back].map(i => mine[i].p.n), lead = r.lead.map(i => mine[i].p.n), real = new Set(g.b[w]), realLead = new Set(g.l[w]);
    n++; plannerHits += pick.filter(x => real.has(x)).length; leadHits += lead.filter(x => realLead.has(x)).length;
    const pop = me.slice().sort((a, b) => rate(br, b) - rate(br, a)).slice(0, 4); popHits += pop.filter(x => real.has(x)).length;
    const popLead = me.slice().sort((a, b) => rate(ld, b) - rate(ld, a)).slice(0, 2); popLeadHits += popLead.filter(x => realLead.has(x)).length;
    randHits += 4 * 4 / 6; }
  return {games: n, bring: {planner: plannerHits / n / 4, mostBrought: popHits / n / 4, random: randHits / n / 4}, lead: {planner: leadHits / n / 2, mostLed: popLeadHits / n / 2, random: 2 / 6}}; })()`); }, games);
console.log(JSON.stringify({minRating: MIN, ...res}, null, 1)); await b.close();
