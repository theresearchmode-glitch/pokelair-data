// Empty / partial team: tapping "Add a Pokémon" must open a working slot (input visible and focused), typing a name adds it.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = 'C:/Users/simra/code/pl-h/app/', OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'empty-edit.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const DUMP = process.env.DUMP;
for (const [label, team] of [['empty', []], ['two', ['Incineroar', 'Rillaboom']]]) {
  const pg = await (await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  await pg.evaluate(t => window.__ev(`(()=>{S.slots=${JSON.stringify(t)}.map(n=>({n}));try{fixSlots()}catch(e){};persist();render();setView('report')})()`), team); await pg.waitForTimeout(1500);
  if (DUMP) console.log(await pg.evaluate(() => document.getElementById('slots').innerHTML.slice(0, 1500)));
  const target = label === 'empty' ? '.chempty2 [data-chedit="0"]' : '#chSheetOut .chrow.empty';
  await pg.click(target); await pg.waitForTimeout(600);
  const st = await pg.evaluate(() => { const ed = document.getElementById('chEdit'), i = ed.dataset.slot; const vis = [...ed.querySelectorAll('.slots > *')].filter(x => x.offsetParent !== null); const inp = ed.querySelector('.slots input:not([type=hidden])'); const visInp = [...ed.querySelectorAll('input')].filter(x => x.offsetParent !== null); return {open: !ed.hidden, slot: i, vis: vis.map(x => x.id || x.className).join(','), inputs: visInp.length, focused: document.activeElement && document.activeElement.tagName + '#' + document.activeElement.id, h: Math.round(ed.getBoundingClientRect().height)}; });
  ok(st.open && st.inputs >= 1, `${label}: Add opens the editor with a visible name box (slot ${st.slot}; shown: ${st.vis || 'nothing'}; inputs ${st.inputs}; panel ${st.h}px)`);
  ok(/INPUT/.test(st.focused || ''), `${label}: the name box gets focus so the keyboard opens (${st.focused})`);
  await pg.screenshot({path: `C:/pl/empty_${label}.png`});
  if (st.inputs) { const inp = await pg.$('#chEdit input:focus') || await pg.$('#chEdit .slots input'); await inp.type('Garc'); await pg.waitForTimeout(400);
    const dd = await pg.evaluate(() => { const l = [...document.querySelectorAll('#chEdit [role="listbox"], #chEdit .acl, #chEdit .sugg, #chEdit ul')].find(x => x.offsetParent !== null); if (!l) return null; const r = l.getBoundingClientRect(), e = document.getElementById('chEdit').getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), edTop: Math.round(e.top), vh: innerHeight, n: l.children.length}; });
    ok(dd && dd.n > 0 && dd.bottom <= dd.vh * 0.62, `${label}: name suggestions show above where the keyboard sits (${JSON.stringify(dd)})`);
    await pg.screenshot({path: `C:/pl/empty_${label}_typing.png`}); await inp.type('homp'); await pg.waitForTimeout(400); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800);
    const n = await pg.evaluate(() => window.__ev('members().map(m=>m.d).join(", ")')); ok(/Garchomp/.test(n), `${label}: typing a name and Enter adds it (${n})`); }
  ok(!errs.length, `${label}: no page errors ${errs.join(' | ')}`); }
await b.close(); fs.unlinkSync(page); console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
