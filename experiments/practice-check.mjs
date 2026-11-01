// Team preview practice check (Nov): plays 20 rounds headlessly by tapping the page like a player (10 with a real six
// from the game, 10 with your own team), then checks every number the reveal shows against out/practice.json, worked out
// again here from the raw file: each Pokémon's games / brought % / led %, the similar-games count and the most common
// four's count, whether "matched the strong players' four" is right, and the streak kept in this browser.
// Also opens the page with no practice data and with an empty team (must not break). Usage: node experiments/practice-check.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module'; import {fileURLToPath} from 'node:url';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const RAW = rd('practice.json'); if (!RAW) { console.log('FAIL: out/practice.json missing (run node practice.mjs)'); process.exit(1); }
const L = rd('limitless.json'), base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'practice-check.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(); const fails = [], errs = [];
async function open(D) { const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}); const pg = await ctx.newPage(); pg.setDefaultTimeout(8000); pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(([D]) => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.removeItem('np.practice'); } catch (e) {} }, [D]);
  await pg.goto('file://' + page); await pg.waitForTimeout(4500); return pg; }
/* a tap the way the page sees it (the fixed bottom bar can cover a button mid-scroll) */
const tap = (pg, sel) => pg.$eval(sel, x => x.click());
const ev = (pg, c) => pg.evaluate(c => window.__ev(c), c);
const D = RAW.dict, bs = n => String(n).replace(/-Mega.*$/, ''), pc = (a, n) => n ? Math.round(100 * a / n) : 0;
const oppTable = oi => { const m = {}; for (const [i, n, br, ld] of RAW.opp[oi][2]) m[D[i]] = [n, br, ld]; return m; };
const pg = await open({...base, 'meta/practice': RAW});
await ev(pg, `S.slots=[{n:'Staraptor-Mega'},{n:'Gholdengo'},{n:'Raichu-Mega-Y'},{n:'Primarina'},{n:'Rillaboom'},{n:'Incineroar'}];fixSlots();render();setView('practice');0`);
await pg.waitForTimeout(400);
const cleaned = await ev(pg, `META.practice.rounds.length`); if (cleaned !== RAW.rounds.length) fails.push(`only ${cleaned} of ${RAW.rounds.length} rounds survived cleaning`);
let streak = 0, best = 0, played = 0, matched = 0, rounds = 0, hints = 0, noTarget = 0;
for (let k = 0; k < 20; k++) {
  const mode = k < 10 ? 'real' : 'mine';
  if (k === 10) await tap(pg, '[data-prhome]');
  if (k === 0 || k === 10) { await tap(pg, `[data-prmode="${mode}"]`); await tap(pg, '[data-prgo]'); } else await tap(pg, '[data-prnext]');
  await pg.waitForTimeout(150);
  const st = await ev(pg, `({mode: pr.mode, oi: pr.oi, ri: pr.ri >= 0 ? META.practice.rounds[pr.ri].i : -1, six: pr.six.slice()})`);
  if (st.mode !== mode) fails.push(`round ${k}: mode ${st.mode}, wanted ${mode}`);
  // pick: a random four, two of them to lead, by tapping
  const order = st.six.slice().sort(() => Math.random() - .5), four = order.slice(0, 4), lead = four.slice(0, 2);
  for (const n of four) await tap(pg, `[data-prpick="${n}"]`);
  for (const n of lead) await tap(pg, `[data-prpick="${n}"]`);
  const dis = await pg.$eval('[data-prrev]', x => x.disabled); if (dis) { fails.push(`round ${k}: Reveal still disabled after 4 + 2`); continue; }
  await tap(pg, '[data-prrev]'); await pg.waitForTimeout(250); rounds++;
  const dom = await pg.evaluate(() => ({rates: [...document.querySelectorAll('.prrate')].map(x => ({n: x.dataset.prmon, g: +x.dataset.prg, b: +x.dataset.prb, l: +x.dataset.prl, txt: x.textContent})),
    pair: (x => x ? {n: +x.dataset.prn, k: +x.dataset.prk, txt: x.textContent} : null)(document.querySelector('.prpair')), res: (x => x ? x.className : '')(document.querySelector('.prres')), banner: (document.querySelector('.prres') || {}).textContent || '',
    store: (() => { try { return JSON.parse(localStorage.getItem('np.practice')); } catch (e) { return null; } })()}));
  const T = oppTable(st.oi);
  // each Pokémon's numbers
  for (const n of st.six) { const r = dom.rates.find(x => x.n === n), c = T[bs(n)];
    if (!r) { fails.push(`round ${k}: no row for ${n}`); continue; }
    if (!c) { if (r.g !== 0 || !/No games with it/.test(r.txt)) fails.push(`round ${k}: ${n} shows data the file doesn't have`); continue; }
    if (r.g !== c[0] || r.b !== pc(c[1], c[0]) || r.l !== pc(c[2], c[0])) fails.push(`round ${k}: ${n} shows ${r.g}/${r.b}%/${r.l}%, file says ${c[0]}/${pc(c[1], c[0])}%/${pc(c[2], c[0])}%`);
    if (!r.txt.includes(`Brought ${pc(c[1], c[0])}%`) || !r.txt.includes(`${c[0].toLocaleString('en-US')} game`)) fails.push(`round ${k}: ${n} text doesn't match its numbers: ${r.txt}`);
    if (c[0] < 10 && !/treat as a hint/.test(r.txt)) fails.push(`round ${k}: ${n} has ${c[0]} games but no small-sample note`); }
  // the target four and the match
  let target = null;
  if (mode === 'real') { const R = RAW.rounds[st.ri], p = R[9]; target = p[1].map(i => D[i]);
    if (!dom.pair || dom.pair.n !== p[0] || dom.pair.k !== p[2]) fails.push(`round ${k}: similar games ${dom.pair && dom.pair.n}/${dom.pair && dom.pair.k}, file says ${p[0]}/${p[2]}`);
    if (p[0] < 10 && !/treat as a hint/.test(dom.pair.txt)) fails.push(`round ${k}: only ${p[0]} similar games but no hint note`); if (p[0] < 10) hints++;
    if (!st.six.every((n, i) => n === D[R[1][i]])) fails.push(`round ${k}: the six isn't the recorded player's six`); }
  else { const rows = st.six.filter(n => (T[bs(n)] || [0])[0] >= 5).sort((a, b) => T[bs(b)][1] / T[bs(b)][0] - T[bs(a)][1] / T[bs(a)][0] || T[bs(b)][0] - T[bs(a)][0]); target = rows.length >= 4 ? rows.slice(0, 4) : null; }
  const same = (a, b2) => a.length === b2.length && a.every(x => b2.some(y => bs(y) === bs(x)));
  if (!target) { noTarget++; if (!/none/.test(dom.res)) fails.push(`round ${k}: no target but a score was shown`); }
  else { const m = same(four, target); played++; if (m) { matched++; streak++; best = Math.max(best, streak); } else streak = 0;
    if (/yes/.test(dom.res) !== m) fails.push(`round ${k}: banner says ${dom.res}, recomputed match is ${m}`); }
  if (!dom.store || dom.store.streak !== streak || dom.store.best !== best || dom.store.played !== played || dom.store.matched !== matched) fails.push(`round ${k}: stored score ${JSON.stringify(dom.store)}, expected ${JSON.stringify({streak, best, played, matched})}`);
  // no win-odds language anywhere on the page
  const txt = await pg.evaluate(() => document.getElementById('prOut').textContent);
  if (/% to win|chance to win|win chance|you will win|odds/i.test(txt)) fails.push(`round ${k}: win-odds wording`); }
// a perfect pick must score as a match: replay round 0 choosing the target
await tap(pg, '[data-prhome]'); await tap(pg, '[data-prmode="real"]'); await tap(pg, '[data-prgo]'); await pg.waitForTimeout(150);
{ const t = await ev(pg, `(() => { const t = prTarget(), f = x => pr.six.find(y => prBase(y) === prBase(x)) || x; return {four: t.four.map(f), lead: t.lead.map(f)}; })()`);
  for (const n of t.four) await tap(pg, `[data-prpick="${n}"]`);
  for (const n of t.lead) await tap(pg, `[data-prpick="${n}"]`);
  await tap(pg, '[data-prrev]'); await pg.waitForTimeout(200); const res = await pg.$eval('.prres', x => x.className + ' ' + x.textContent); if (!/yes/.test(res) || !/Same two leads/.test(res)) fails.push('choosing the strong players\' four and leads did not score a match: ' + res); }
await pg.context().close();
// no practice data, and an empty team: the page must still work
{ const p2 = await open(base); await ev(p2, `S.slots=[];fixSlots();render();setView('practice');0`); await p2.waitForTimeout(300);
  const t = await p2.evaluate(() => document.getElementById('prOut').textContent); if (!/after the next data refresh/.test(t)) fails.push('no data: missing empty note'); await p2.context().close(); }
{ const p3 = await open({...base, 'meta/practice': RAW}); await ev(p3, `S.slots=[];fixSlots();render();setView('practice');0`); await p3.waitForTimeout(300);
  const dis = await p3.$eval('[data-prmode="mine"]', x => x.disabled); if (!dis) fails.push('empty team: "Use my team" should be off');
  await tap(p3, '[data-prgo]'); await p3.waitForTimeout(200); const ok = await p3.$$eval('[data-prpick]', x => x.length); if (ok !== 6) fails.push('empty team: real-team round did not start');
  const wide = await p3.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); if (wide) fails.push('390px: page scrolls sideways');
  await p3.context().close(); }
// bad data: must be ignored, not crash
{ const p4 = await open({...base, 'meta/practice': {dict: ['Nope', 5], opp: [[[0, 1]], 'x'], rounds: [[9, 'a']]}}); await ev(p4, `setView('practice');0`); await p4.waitForTimeout(300);
  const t = await p4.evaluate(() => document.getElementById('prOut').textContent); if (!/after the next data refresh/.test(t)) fails.push('bad data: not treated as missing'); await p4.context().close(); }
await b.close(); fs.unlinkSync(page);
console.log(`${rounds} rounds played (10 real six, 10 my team); ${played} scored, ${matched} matched, ${noTarget} without enough data to score; ${hints} real rounds had fewer than 10 similar games (hint note checked).`);
if (errs.length) { console.log('page errors:', errs.slice(0, 5)); fails.push('page errors'); }
if (fails.length) { console.log('FAIL'); fails.slice(0, 40).forEach(f => console.log(' -', f)); process.exit(1); }
console.log('PASS: every number in the reveal matches out/practice.json');
