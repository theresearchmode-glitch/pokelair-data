// "Updated from your other device" only when another device really changed something (Nov 7, Sim: the page kept saying it).
// Two devices on one made-up account, with the real data loaded, the account echoing every save back to every device (also a
// late, older copy, as the real one can). Counts the "Updated from your other device" notes and the saves:
//   - left alone for 8 s: no notes, no saves (no ping-pong between devices);
//   - after one change on the PC: the phone gets it once, the PC never says it, and the saves stop.
// Usage: node experiments/sync-quiet.mjs [page.html]     exit code 1 on failure
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const SRC = process.argv[2] || ROOT + 'app/dist/page.html', page = ROOT + 'app/sync-quiet.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(SRC, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const L = rd('limitless.json'), META = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const KEY = 'data/users/u1/state';
const store = {[KEY]: {slots: ['Incineroar', 'Garchomp', 'Kingambit', 'Sneasler', 'Rillaboom', 'Whimsicott'].map(n => ({n, a: null, lock: false})), box: ['Incineroar', 'Garchomp', 'Pelipper'], teams: [], loadedId: null, format: 'doubles', maxMega: 2, megaGoal: 1, opp: []}};
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); }, pages = []; let writes = [];
const b = await chromium.launch(), errs = [];
async function device(name) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}}), pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(name + ': ' + e.message));
  await pg.exposeFunction('__dbGet', p => store[p] ? JSON.parse(JSON.stringify(store[p])) : null);
  await pg.exposeFunction('__dbSet', async (p, d, merge) => { const old = store[p]; store[p] = merge ? {...store[p], ...d} : d; writes.push(name + ':' + Object.keys(d).filter(k => k !== '_dev').join(','));
    for (const o of pages) { o.pg.evaluate(([p, v]) => window.__push(p, v), [p, store[p]]).catch(() => {}); setTimeout(() => o.pg.evaluate(([p, v]) => window.__push(p, v), [p, old]).catch(() => {}), 1200); } });
  await pg.addInitScript(META => { window.__PL_TEST = 1; localStorage.setItem('cc2.welcomed', '"1"'); const subs = {};
    window.__push = (p, v) => { (subs[p] || []).forEach(cb => cb({exists: true, data: () => JSON.parse(JSON.stringify(v)), metadata: {hasPendingWrites: false}})); };
    window.__notes = 0; const watch = () => { const t = document.getElementById('toast'); if (!t) return setTimeout(watch, 50); new MutationObserver(() => { if (!t.hidden && /other device/.test(t.textContent)) window.__notes++; }).observe(t, {childList: true, characterData: true, subtree: true, attributes: true}); }; watch();
    window.claude = {use: async n => n === 'db' ? {doc: p => p.startsWith('meta/') ? ({onSnapshot: cb => { setTimeout(() => cb({exists: !!META[p], data: () => META[p]}), 5); return () => {}; }, get: async () => ({exists: false})})
      : ({get: async () => { const v = await window.__dbGet(p); return {exists: !!v, data: () => v}; }, set: d => window.__dbSet(p, d, false), update: d => window.__dbSet(p, d, true),
          onSnapshot: cb => { (subs[p] = subs[p] || []).push(cb); window.__dbGet(p).then(v => v && cb({exists: true, data: () => v, metadata: {hasPendingWrites: false}})); return () => {}; }})} : n === 'user' ? {id: async () => 'u1'} : null}; }, META);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000); const d = {name, pg}; pages.push(d); return d; }
const ev = (d, c) => d.pg.evaluate(c => window.__ev(c), c), notes = d => d.pg.evaluate(() => window.__notes);
const A = await device('PC'), B = await device('phone');
await A.pg.waitForTimeout(4000); writes = []; await A.pg.evaluate(() => { window.__notes = 0; }); await B.pg.evaluate(() => { window.__notes = 0; });
await A.pg.waitForTimeout(8000);
ok(writes.length === 0 && await notes(A) === 0 && await notes(B) === 0, `left alone: no saves and no "other device" notes (saves ${writes.length}, notes PC ${await notes(A)}, phone ${await notes(B)})`);
writes = [];
await ev(A, "S.box.push('Sylveon');render()"); await A.pg.waitForTimeout(9000);
const nA = await notes(A), nB = await notes(B);
ok(await ev(B, "S.box.includes('Sylveon')"), 'the PC\'s change reaches the phone');
ok(nA === 0, `the PC never says "Updated from your other device" about its own change (${nA})`);
ok(nB <= 1, `the phone says it once at most (${nB})`);
ok(writes.length <= 2, `the saves stop (no back-and-forth): ${writes.length} saves: ${writes.join(' ')}`);
ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''));
await b.close(); fs.unlinkSync(page);
console.log(fails.length ? fails.length + ' FAILED' : 'ALL PASSED'); process.exit(fails.length ? 1 : 0);
