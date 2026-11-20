// Scan S2 (Nov 20): My Team shows "Saved Teams" once. After an import (a new six, not saved yet, with other saved teams) the page had a
// "Saved Teams 1 saved ›" link right above the "Saved Teams 1" button; the button stays (the action row, on every team) and its sheet still
// opens a saved team (Open, with Undo). 390 and 1440, with one and two saved teams. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-s2.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const SUN = ['Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler', 'Charizard'], RAIN = ['Pelipper', 'Archaludon', 'Basculegion', 'Incineroar', 'Garchomp', 'Sneasler'];
const TR = ['Hatterene', 'Torkoal', 'Incineroar', 'Amoonguss', 'Ursaluna', 'Kingambit'];
for (const W of [390, 1440]) for (const nSaved of [1, 2]) { const c = await b.newContext({viewport: {width: W, height: 900}}); const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(2500);
  await p.evaluate(([sun, rain, tr, n]) => window.__ev(`(()=>{const sl=a=>a.map(x=>({n:x,a:null,lock:false}));S.teams=[{id:'tR',name:'Rain test',slots:sl(${JSON.stringify(rain)}),format:'doubles',saved:1},{id:'tT',name:'Room six',slots:sl(${JSON.stringify(tr)}),format:'doubles',saved:2}].slice(0,${n});S.slots=sl(${JSON.stringify(sun)});fixSlots();S.loadedId=null;if(typeof clearCaches==='function')clearCaches();render()})()`), [SUN, RAIN, TR, nSaved]);
  await p.waitForTimeout(2500);
  const tag = `${W}, ${nSaved} saved`;
  const vis = await p.evaluate(() => [...document.querySelectorAll('#main a, #main button')].filter(e => e.getClientRects().length && !e.closest('[hidden],[inert]') && /^\s*Saved Teams/i.test(e.innerText)).map(e => e.innerText.replace(/\s+/g, ' ').trim()));
  ok(vis.length === 1, `${tag}: "Saved Teams" shown once (${vis.length}: ${vis.join(' | ')})`);
  ok(await p.evaluate(() => !!document.querySelector('#main [data-v2saved]')), `${tag}: the kept one is the action-row button`);
  await p.click('#main [data-v2saved]'); await p.waitForTimeout(800);
  const sh = await p.evaluate(() => { const s = document.querySelector('.np-sheet .svt2'); return s ? s.innerText : ''; });
  ok(/Rain test/.test(sh), `${tag}: its sheet lists the saved team`);
  await p.click('.svt2 [data-svact="open"][aria-label="Open Rain test"]'); await p.waitForTimeout(1500);
  const now = await p.evaluate(() => window.__ev('S.slots.map(s=>s.n).filter(Boolean).join("|")'));
  ok(now === RAIN.join('|'), `${tag}: Open loads it (${now})`);
  const undo = await p.evaluate(() => !!document.querySelector('#toastUndo') || /Undo/.test((document.querySelector('.np-toast, [role="status"]') || {}).innerText || ''));
  ok(undo, `${tag}: with an Undo`);
  ok(!errs.length, `${tag}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-s2: ${fails.length} FAILED` : 'v2-s2: all passed'); process.exit(fails.length ? 1 : 0);
