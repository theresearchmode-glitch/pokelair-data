// "Less on every page" (Nov 8, Sim: "I dont wnat 19 things next to the grade its just overwhelming"): how much each page
// asks a reader to take in on a phone (390 px), with a full team and an opponent. Per page: screens tall, words shown,
// explanation paragraphs (20+ words), small grey notes, "?" tips and buttons. Usage: node experiments/page-load.mjs [page.html]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium, devices} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8')), SRC = process.argv[2] || ROOT + 'app/dist/page.html';
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/teams': (() => { try { return rd('teams.json'); } catch (e) { return null; } })()};
const page = ROOT + `app/phone-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(SRC, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const TEAM = ['Annihilape', 'Arcanine-Hisui', 'Dragonite', 'Kingambit', 'Garchomp', 'Rillaboom'].map(n => ({n, a: null, lock: false})), OPP = ['Sneasler', 'Basculegion', 'Kingambit', 'Rillaboom', 'Salamence-Mega', 'Floette-Mega'];
const VIEWS = ['home', 'report', 'auto', 'teams', 'compare', 'matchup', 'coverage', 'types', 'ratings', 'meta', 'top', 'sets', 'box', 'speed', 'calc', 'gauntlet', 'arch', 'cores', 'events', 'method'];
const b = await chromium.launch(), ctx = await b.newContext({...devices['iPhone 13'], colorScheme: 'dark'}), pg = await ctx.newPage();
await pg.addInitScript(([D, TEAM, OPP]) => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; const st = {slots: TEAM, box: [], teams: [], format: 'doubles', maxMega: 2, megaGoal: 2, opp: OPP, excl: [], log: []};
  window.claude = {use: async n => n === 'db' ? {doc: p => p.startsWith('meta/') ? ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})}) : ({get: async () => ({exists: true, data: () => st}), set: async () => {}, update: async () => {}, onSnapshot: () => () => {}})} : n === 'user' ? {id: async () => 'u'} : null}; }, [D, TEAM, OPP]);
await pg.goto('file://' + page); await pg.waitForTimeout(3500);
const rows = [];
for (const v of VIEWS) { await pg.evaluate(v => window.__ev(`setView('${v}')`), v).catch(() => {}); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && !e.closest('[hidden],details:not([open]) > :not(summary)'); };
    const H = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), words = (document.body.innerText || '').split(/\s+/).filter(Boolean).length;
    const paras = [...document.querySelectorAll('p,li,.t2,small')].filter(e => vis(e) && (e.innerText || '').split(/\s+/).length >= 20).length;
    const notes = [...document.querySelectorAll('.t2,small,.vsub,.note')].filter(vis).length, tips = [...document.querySelectorAll('.tip,[data-tip],.qtip,button')].filter(e => vis(e) && /^\?$/.test((e.innerText || '').trim())).length;
    const btns = [...document.querySelectorAll('button,a')].filter(vis).length; const noteTxt = [...document.querySelectorAll('.t2,small,.vsub,.note,p')].filter(e => vis(e) && !e.closest('footer,.ar-foot,#foot')).map(e => (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 140)).filter(Boolean); return {noteTxt, screens: +(H / innerHeight).toFixed(1), words, paras, notes, tips, btns}; });
  rows.push({v, ...r}); }
await b.close(); fs.unlinkSync(page);
rows.sort((a, c) => c.words - a.words);
console.log('page        screens  words  long-paras  notes  ?tips  buttons');
if (process.env.NOTES) for (const r of rows.filter(r => process.env.NOTES.split(',').includes(r.v))) console.log(`\n== ${r.v}\n` + [...new Set(r.noteTxt)].map(t => '  · ' + t).join('\n'));
for (const r of rows) console.log(`${r.v.padEnd(12)}${String(r.screens).padStart(6)}${String(r.words).padStart(7)}${String(r.paras).padStart(11)}${String(r.notes).padStart(7)}${String(r.tips).padStart(7)}${String(r.btns).padStart(9)}`);
