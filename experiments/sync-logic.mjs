// Multi-device sync and box links (Nov 7, Sim): two or more devices on one account, sharing the same account document.
// A change on one device reaches the others live; a device holding older data that changes one thing saves only that thing
// (never overwriting a newer box); a device whose saved copy loads late never overwrites the account with what was in its
// browser; box links Add and Replace correctly and refuse junk. Uses made-up data only. Usage: node experiments/sync-logic.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), page = APP + 'sync-logic.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const BOX = ['Incineroar','Garchomp','Kingambit','Sneasler','Rillaboom','Whimsicott','Gholdengo','Archaludon','Pelipper','Basculegion','Sylveon','Farigiraf','Corviknight','Tyranitar','Charizard','Primarina','Milotic','Staraptor','Raichu','Dragonite'];
const store = {'data/users/u1/state': {slots: ['Incineroar','Garchomp','Kingambit','Sneasler','Rillaboom','Whimsicott'].map(n => ({n, a: null, lock: false})), box: BOX.slice(), teams: [], loadedId: null, format: 'doubles', maxMega: 2, megaGoal: 1, opp: [], excl: [], log: []}};
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); }; const pages = []; let writes = [];
const b = await chromium.launch(); const errs = [];
async function device(name, {getDelay = 0, live = true, local = null} = {}) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(name + ': ' + e.message));
  await pg.exposeFunction('__dbGet', p => store[p] ? JSON.parse(JSON.stringify(store[p])) : null);
  await pg.exposeFunction('__dbSet', async (p, d, merge) => { if (merge && !store[p]) throw Object.assign(new Error('missing'), {code: 'invalid_argument'}); store[p] = merge ? {...store[p], ...d} : d; writes.push(name + ':' + Object.keys(d).join(',')); for (const o of pages) if (o.live) await o.pg.evaluate(([p, v]) => window.__push && window.__push(p, v), [p, store[p]]).catch(() => {}); });
  await pg.addInitScript(([getDelay, local]) => { window.__PL_TEST = 1; localStorage.setItem('cc2.welcomed', '"1"'); if (local) localStorage.setItem('cc2.state', JSON.stringify(local)); const subs = {};
    window.__push = (p, v) => { (subs[p] || []).forEach(cb => cb({exists: true, data: () => JSON.parse(JSON.stringify(v)), metadata: {hasPendingWrites: false}})); };
    window.claude = {use: async n => n === 'db' ? {doc: p => ({get: async () => { await new Promise(r => setTimeout(r, getDelay)); const v = await window.__dbGet(p); return {exists: !!v, data: () => v}; },
      set: d => window.__dbSet(p, d, false), update: d => window.__dbSet(p, d, true), onSnapshot: cb => { if (p.startsWith('data/')) { (subs[p] = subs[p] || []).push(cb); window.__dbGet(p).then(v => v && cb({exists: true, data: () => v, metadata: {hasPendingWrites: false}})); } else setTimeout(() => cb({exists: false, data: () => null}), 5); return () => {}; }})} : n === 'user' ? {id: async () => 'u1', isOwner: () => true} : null}; }, [getDelay, local]);
  await pg.goto('file://' + page); await pg.waitForTimeout(2500); const d = {name, pg, live}; pages.push(d); return d; }
const ev = (d, c) => d.pg.evaluate(c => window.__ev(c), c);
const A = await device('PC'), B = await device('phone');
ok(await ev(A, 'S.box.length') === 20 && await ev(B, 'S.box.length') === 20, 'both devices open with the account box (20)');
ok(/Claude account/.test(await ev(A, "$('boxSync').textContent")), 'My box says the box is saved to the Claude account');
// 1. PC adds a Pokémon to the box -> phone gets it live
await ev(A, "S.box.push('Glimmora');render()"); await A.pg.waitForTimeout(1500);
ok(await ev(B, 'S.box.length') === await ev(A, 'S.box.length') && store['data/users/u1/state'].box.length === await ev(A, 'S.box.length'), 'a box change on the PC reaches the phone live'); writes.splice(0);
// 2. stale device: phone stops hearing updates; PC adds more; phone edits its team -> store keeps the PC's box
B.live = false; await ev(A, "for(const n of ['Milotic','Kommo-o'])if(!S.box.includes(n))S.box.push(n);render()"); await A.pg.waitForTimeout(1500);
const boxPC = store['data/users/u1/state'].box.length;
await ev(B, "S.slots[0]={n:'Garchomp',a:null,lock:false};render()"); await B.pg.waitForTimeout(1500);
ok(store['data/users/u1/state'].box.length === boxPC && store['data/users/u1/state'].slots[0].n === 'Garchomp' && writes.filter(w => w.startsWith('phone:')).every(w => w === 'phone:slots'), 'a phone with an older box that changes its team saves only the team (the newer box stays)'); writes.splice(0);
B.live = true;
// 3. box link: copy from PC, add/replace on a third device with a small box
const code = await ev(A, 'boxCode()'); const nA = await ev(A, 'S.box.length');
const C = await device('friend', {}); store['data/users/u1/state'].box; // same account for simplicity: use replace/add checks on C's own S
await ev(C, "S.box=['Hydreigon'];render()"); await C.pg.waitForTimeout(800);
await C.pg.evaluate(() => window.__ev("setView('box')")); await C.pg.waitForTimeout(400);
await C.pg.click('#boxLinkOpen'); await C.pg.fill('#boxLinkField', 'https://claude.ai/artifact/x#box=' + code); await C.pg.click('#boxLinkAdd'); await C.pg.waitForTimeout(500);
const afterAdd = await ev(C, 'S.box.length'); ok(afterAdd === nA + 1, 'Add puts the link’s Pokémon into the box without doubles (' + afterAdd + ')');
await C.pg.evaluate(() => { document.getElementById('boxLinkIn').hidden = false; }); await C.pg.fill('#boxLinkField', code); await C.pg.click('#boxLinkReplace'); await C.pg.waitForTimeout(500);
ok(await ev(C, 'S.box.length') === nA, 'Replace makes the box exactly the link’s Pokémon');
await C.pg.evaluate(() => { const p = document.getElementById('boxLinkIn'); p.hidden = false; }); await C.pg.fill('#boxLinkField', 'nonsense'); await C.pg.click('#boxLinkAdd'); ok(/doesn.t look like a box link/.test(await C.pg.evaluate(() => document.getElementById('boxLinkMsg').textContent)), 'a pasted non-link is refused with a plain message');
// 4. startup race: a device whose account copy arrives late, with an old small box in the browser, edits at once
await C.pg.waitForTimeout(1500); const before = store['data/users/u1/state'].box.length;
const D = await device('old-tab', {getDelay: 4000, local: {slots: [], box: ['Hydreigon'], teams: []}}); await ev(D, "S.box.push('Kingambit');render()"); await D.pg.waitForTimeout(4000);
ok(store['data/users/u1/state'].box.length === before && await ev(D, 'S.box.length') === before, 'a device whose saved copy loads late never overwrites the account with its browser’s old box');
ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
await b.close(); fs.unlinkSync(page); console.log(fails.length ? fails.length + ' FAILED' : 'ALL PASSED'); process.exit(fails.length ? 1 : 0);
