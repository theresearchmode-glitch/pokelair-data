// Typing in Add a Pokémon while the account sync is busy (Nov 7, Sim: the box "keeps clearing itself"). Usage: node experiments/typing-sync.mjs
// X a Pokémon, then type in its empty slot while the account sends back (a) a late, older copy of this page's own save and
// (b) a real change from another device (a box edit). The name box must keep what was typed, and the other device's change lands.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium, devices} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8')), SRC = process.argv[2] || ROOT + 'app/dist/page.html';
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + 'app/typing2.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(SRC, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), ctx = await b.newContext({...devices['iPhone 13'], colorScheme: 'dark'}), pg = await ctx.newPage();
const TEAM = ['Annihilape', 'Arcanine-Hisui', 'Dragonite', 'Kingambit', 'Garchomp', 'Rillaboom'].map(n => ({n, a: null, lock: false}));
await pg.addInitScript(([D, TEAM]) => { localStorage.setItem('cc2.welcomed', '"1"');
  let st = {slots: TEAM, box: ['Pikachu'], teams: [], format: 'doubles', maxMega: 2, megaGoal: 2, opp: [], excl: [], log: []}; const subs = [], hist = [];
  const send = (v, ms) => subs.forEach(f => setTimeout(() => f({exists: true, data: () => JSON.parse(JSON.stringify(v)), metadata: {}}), ms));
  window.__other = () => { st = {...st, box: [...st.box, 'Sneasler'], _dev: 'other-device'}; window.__sent = (window.__sent||0) + 1; send(st, 10); };
  window.claude = {use: async n => n === 'db' ? {doc: p => p.startsWith('meta/') ? ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})
    : ({get: async () => ({exists: true, data: () => JSON.parse(JSON.stringify(st))}),
        set: async v => { hist.push(st); st = JSON.parse(JSON.stringify(v)); send(st, 30); send(hist[hist.length - 1], 1800); },
        update: async v => { const old = st; st = {...st, ...JSON.parse(JSON.stringify(v))}; send(st, 30); send(old, 1800); },   // the late, older copy
        onSnapshot: cb => { subs.push(cb); return () => {}; }})} : n === 'user' ? {id: async () => 'test-user'} : null}; }, [D, TEAM]);
await pg.goto('file://' + page); await pg.waitForTimeout(3500);
await pg.evaluate(() => window.__ev(`setView('report')`)); await pg.waitForTimeout(2500);
/* Nov 9: wait (up to 10 s) until the element is drawn; GitHub's slower machine tapped before My Team had rendered */
const tapSel = async sel => { await pg.waitForFunction(s => [...document.querySelectorAll(s)].some(x => x.getBoundingClientRect().height > 0), sel, {timeout: 10000}); const e = await pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().height > 0), sel); await e.evaluate(x => x.scrollIntoView({block: 'center', behavior: 'instant'})); await pg.waitForTimeout(150); let bb = await e.boundingBox();
  /* Nov 9: a re-render can replace the element after it was found, leaving this handle detached (boundingBox null for good:
     'Cannot read properties of null', 1 run in 6). Look it up again on each retry; fail with the selector if it never shows. */
  for (let i = 0; !bb && i < 20; i++) { await pg.waitForTimeout(250); const f = await pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().height > 0) || null, sel); const el = f.asElement(); if (el) { await el.evaluate(x => x.scrollIntoView({block: 'center', behavior: 'instant'})); bb = await el.boundingBox(); } }
  if (!bb) throw new Error(`tap: ${sel} never became tappable`); await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); };
await tapSel('.ar-rmx[data-chrm="4"]'); await pg.waitForTimeout(300);
await tapSel('[data-chedit="4"]'); await pg.waitForTimeout(400);
const seen = [];
for (const [k, ch] of [...'Garchomp'].entries()) { if (k === 4) await pg.evaluate(() => window.__other()); await pg.keyboard.type(ch); await pg.waitForTimeout(330);
  seen.push(await pg.evaluate(() => { const i = document.querySelector('#chEdit #pk4'); return i ? i.value : '(no box)'; })); }
console.log('box after each letter:', seen.join(' · '));
const ok = seen[seen.length - 1] === 'Garchomp' && seen.every((v, i) => v === 'Garchomp'.slice(0, i + 1));
await pg.waitForTimeout(400); await pg.keyboard.press('Escape'); await pg.waitForTimeout(200); await tapSel('#chEditDone'); await pg.waitForTimeout(900);
const box = await pg.evaluate(() => window.__ev('S.box.join()')), slot4 = await pg.evaluate(() => window.__ev('S.slots[4].n||"(empty)"'));
console.log('slot 5 after typing:', slot4, '| box (other device added Sneasler):', box);
const pass = ok && /Sneasler/.test(box) && slot4 === '(empty)'; console.log(pass ? 'PASS' : 'FAIL');
await b.close(); fs.unlinkSync(page); process.exit(pass ? 0 : 1);
