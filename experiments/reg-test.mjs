// Regulation change handling (Nov 1): feeds made-up data with a new regulation and checks
//   1) detection (formats.mjs detectReg): a new regulation in the newest week is seen, the numbers stay on the old one until
//      it has enough events, then switch; Showdown-only evidence is seen too; a quiet week changes nothing
//   2) no mixing: the event filters (sameReg, inRegWindow) keep exactly one regulation's events
//   3) the page: the calm banner on Home and the Meta pages (not elsewhere), the right words, nothing when there's no new one
// Usage: node experiments/reg-test.mjs [shotDir]
import fs from 'node:fs'; import {createRequire} from 'node:module';
import {detectReg, sameReg, inRegWindow, activeReg, regOf, REG_SWITCH, SITE_REG} from '../formats.mjs';
const fails = []; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const day = (base, k) => new Date(Date.parse(base + 'T12:00:00Z') + k * 864e5).toISOString().slice(0, 10);
// 40 days of Reg M-C events, then a new Reg M-D starting on Nov 2 with a few events
const mc = Array.from({length: 120}, (_, i) => ({format: 'M-C', date: day('2026-09-25', Math.floor(i / 3)), players: 40}));
const md = n => Array.from({length: n}, (_, i) => ({format: 'M-D', date: day('2026-11-02', Math.floor(i / 4)), players: 70}));
const sv = [{format: 'SVI', date: '2026-11-05', players: 300}]; // another game's format: ignored
console.log('detection');
let r = detectReg([...mc, ...sv], {}, null, '2026-11-03');
ok(r.id === 'M-C' && !r.now, 'only Reg M-C events: stays on Reg M-C, no banner');
r = detectReg([...mc.filter(t => t.date < '2026-10-28'), ...md(6), ...sv], {}, null, '2026-11-04');
ok(r.id === 'M-C' && r.now && r.now.id === 'M-D' && r.now.since === '2026-11-02', `newest week mostly Reg M-D (6 events): detected, started Nov 2, numbers stay on Reg M-C`);
ok(r.seen['M-C'] && r.seen['M-D'] && !r.seen.SVI, 'counts per regulation kept apart (other games ignored)');
const mixedWeek = detectReg([...mc, ...md(2)], {}, null, '2026-11-03');
ok(mixedWeek.id === 'M-C' && !mixedWeek.now, 'two new-format events in a week still mostly Reg M-C: no banner');
const big = md(REG_SWITCH.events + 4);
r = detectReg([...mc.filter(t => t.date < '2026-10-28'), ...big], {}, r, '2026-11-09');
ok(r.id === 'M-D' && !r.now && r.since === '2026-11-02' && r.switched && r.switched.from === 'M-C', `enough Reg M-D data (${big.length} events, ${big.length * 70} players): switches, since Nov 2`);
ok(/regmd$/.test(r.sd), 'Showdown format follows the switch (' + r.sd + ')');
const back = detectReg([...mc], {}, r, '2026-11-10');
ok(back.id === 'M-D', 'once switched it never falls back to the old regulation');
r = detectReg(mc, {gen9championsvgc2026regmd: {n: 51, first: '2026-11-02'}}, null, '2026-11-03');
ok(r.id === 'M-C' && r.now && r.now.id === 'M-D' && r.now.from === 'showdown', 'Showdown replays of the next format alone: banner, numbers unchanged');
console.log('no mixing');
const index = {a: {d: '2026-10-20', name: 'Weekly'}, b: {d: '2026-10-21', name: 'Weekly', f: 'M-C'}, c: {d: '2026-11-03', name: 'Weekly', f: 'M-D'}};
ok(regOf(index.a) === SITE_REG.id, 'events saved before Nov 1 (no format stored) count as Reg M-C');
ok(Object.keys(index).filter(id => sameReg(index[id], 'M-C')).join() === 'a,b', 'Reg M-C numbers use only Reg M-C events');
ok(Object.keys(index).filter(id => sameReg(index[id], 'M-D')).join() === 'c', 'Reg M-D numbers use only Reg M-D events');
const win = {since: '2026-09-01', end: '2026-11-02'};
ok(inRegWindow('2026-10-24', win) && !inRegWindow('2026-11-07', win) && !inRegWindow('2026-08-20', win), 'official events: only inside the regulation\'s dates');
const tmp = new URL('./reg-test-tmp.json', import.meta.url).pathname;
fs.writeFileSync(tmp, JSON.stringify(detectReg([...mc.filter(t => t.date < '2026-10-28'), ...md(6)], {}, null, '2026-11-04')));
const A = activeReg(tmp); fs.unlinkSync(tmp);
ok(A.id === 'M-C' && A.end === '2026-11-02' && A.sd === SITE_REG.sd, 'active regulation while the new one builds: Reg M-C, window ends Nov 2');
// the page
console.log('page');
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname, OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), P = rd('perf.json') || {};
const page = APP + 'reg-test.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const shots = process.argv[2]; if (shots) fs.mkdirSync(shots, {recursive: true});
const b = await chromium.launch();
async function load(reg, theme) { const D = {'meta/results': L.results, 'meta/perf': {tour: P.tour, ingame: P.ingame, adj: L.adj, updated: L.updated.slice(0, 10), reg}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/events': rd('events.json')};
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true}), pg = await ctx.newPage();
  pg.on('pageerror', e => fails.push('page error: ' + e.message));
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null};
    try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"x"'); } catch (e) {} }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3500); if (theme) await pg.evaluate(t => window.__ev(`setTheme('${t}')`), theme); return pg; }
const bar = async (pg, v) => { await pg.evaluate(v => window.__ev(`setView('${v}');scrollTo(0,0)`), v); await pg.waitForTimeout(250);
  return pg.evaluate(() => { const e = document.getElementById('regBar'); return e && !e.hidden && getComputedStyle(e).display !== 'none' ? e.textContent : ''; }); };
const newReg = detectReg([...mc.filter(t => t.date < '2026-10-28'), ...md(6)], {}, null, '2026-11-04');
let pg = await load({...newReg, seen: newReg.seen});
const home = await bar(pg, 'home');
ok(/New regulation \(Reg M-D\) started Nov 2, 2026/.test(home) && /numbers below are from Reg M-C until there's enough/.test(home), 'Home banner: ' + home.slice(0, 120));
ok(/6 Reg M-D events so far · switches at 20/.test(home) && /never mixed/.test(home), 'banner says how far along it is and that the two are never mixed');
ok(/Reg M-D/.test(await bar(pg, 'ratings')) && /Reg M-D/.test(await bar(pg, 'meta')), 'banner on the Meta pages (Pokémon ratings, Usage)');
ok(!(await bar(pg, 'calc')) && !(await bar(pg, 'report')), 'no banner on My team or the calc');
const head = await pg.evaluate(() => { window.__ev("setView('ratings')"); const k = document.querySelector('#lair .chpghead .chk'); return k ? k.textContent : ''; });
ok(/Reg M.C doubles/.test(head), 'ratings still say Reg M-C while the new one builds');
if (shots) { for (const t of ['light', 'dark']) { await pg.evaluate(t => window.__ev(`setTheme('${t}');setView('home');scrollTo(0,0)`), t); await pg.waitForTimeout(400); await pg.screenshot({path: `${shots}/reg-home-${t}.png`});
  await pg.evaluate(() => window.__ev("setView('meta');scrollTo(0,0)")); await pg.waitForTimeout(400); await pg.screenshot({path: `${shots}/reg-meta-${t}.png`}); } }
await pg.context().close();
pg = await load(P.reg || {id: 'M-C', since: '2026-09-01', now: null});
ok(!(await bar(pg, 'home')) && !(await bar(pg, 'ratings')), 'no banner when every event is Reg M-C (today\'s real data)');
await pg.context().close();
pg = await load({id: 'M-D', since: '2026-11-02', now: null, switched: {from: 'M-C', to: 'M-D', on: '2026-11-09'}});
const sw = await bar(pg, 'home');
ok(/Numbers are from Reg M-D/.test(sw) && /Reg M-C results are no longer counted/.test(sw), 'after a switch: says the numbers are Reg M-D only');
await pg.context().close();
pg = await load({id: 'bad', now: {id: 'zz'}});
ok(!(await bar(pg, 'home')), 'malformed regulation data: no banner, no error');
await pg.context().close();
await b.close(); fs.unlinkSync(page);
console.log(fails.length ? `\n${fails.length} failed` : '\nall passed'); process.exit(fails.length ? 1 : 0);
