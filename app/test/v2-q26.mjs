// Restore Last Team (Sim's Q26 A, Nov 19, design review #2): after Clear Team, once the 10 s Undo is gone, the empty My Team offers
// "Restore Last Team" naming the team it brings back; Restore puts back the exact six (sets, items, the open saved team) and the button
// goes; adding a Pokémon to the empty team drops it too. Kept in the page's memory like the Undo, so after a reload neither is offered.
// 320 / 390 / 1440, light and dark: the button is inside the screen and 44px+ tall. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q26.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (W, th) => { const p = await b.newPage({viewport: {width: W, height: 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(4000); return [p, errs]; };
const state = p => p.evaluate(() => window.__ev('JSON.stringify({slots: S.slots, loadedId: S.loadedId || null, name: (S.teams.find(t => t.id === S.loadedId) || {}).name || ""})'));
const btn = p => p.evaluate(() => { const x = document.querySelector('#main [data-v2restore]'); if (!x) return null; const r = x.getBoundingClientRect(), t = x.closest('.tm-e-rest');
  return {txt: (x.textContent || '').trim(), label: x.getAttribute('aria-label') || '', cap: t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '', l: r.left, r: r.right, h: r.height, w: innerWidth, side: document.documentElement.scrollWidth > innerWidth}; });
const clear = async p => { await p.click('#main [data-v2more]'); await p.waitForTimeout(600); await p.click('.np-sheet [data-v2clear]'); await p.waitForTimeout(1000); };

// 1. 390 light: the full story, with the real 10 s Undo running out
{ const [p, errs] = await open(390, 'light'); const before = await state(p), B = JSON.parse(before), n0 = B.slots.filter(x => x && x.n).length;
  ok(n0 === 6 && !!B.name, `390: a named six to start (${n0}, "${B.name}")`);
  await clear(p); await p.mouse.move(2, 2); await p.evaluate(() => document.activeElement && document.activeElement.blur()); /* the toast waits while hovered or focused */
  await p.waitForTimeout(10500);
  const undo = await p.evaluate(() => !!document.querySelector('.np-toast #toastUndo')), x = await btn(p);
  ok(!undo, `390: the Undo is gone after 10 s (${undo})`);
  ok(!!x && /Restore Last Team/.test(x.txt) && x.label.includes(B.name) && x.cap.includes(B.name), `390: the empty My Team shows Restore Last Team naming "${B.name}" (${x ? x.txt + ' | ' + x.cap : 'no button'})`);
  if (x) { await p.click('#main [data-v2restore]'); await p.waitForTimeout(1200); }
  const after = await state(p);
  ok(after === before, `390: Restore brings back the exact six with their sets, items and name (${after === before ? 'identical' : 'differs'})`);
  ok(!(await btn(p)), '390: after Restore the button is gone');
  const put = () => p.evaluate(b => window.__ev(`S.slots = ${JSON.stringify(b.slots)}; fixSlots(); S.loadedId = ${JSON.stringify(b.loadedId)}; render()`), B);
  if (after !== before) { await put(); await p.waitForTimeout(800); } /* before the change: put the six back by hand so the rest still runs */
  // reload: kept in memory like the Undo, so it is not offered after a reload (the team stays empty, as Clear Team left it)
  await clear(p); ok(!!(await btn(p)), '390: Clear Team again: the button is back');
  await p.reload(); await p.waitForTimeout(4000);
  ok(!(await btn(p)), '390: after a reload the button is not offered (kept in memory like the Undo; nothing is saved)');
  // adding a Pokémon to the empty team drops the button and forgets the team
  await put(); await p.waitForTimeout(800);
  await clear(p); ok(!!(await btn(p)), '390: cleared again: the button shows');
  const add = await p.$('#main [data-v2add]');
  if (add) await add.click(); else await p.evaluate(() => window.__ev('V2.addToTeam(V2.underdog())'));
  await p.waitForTimeout(1200);
  const n1 = await p.evaluate(() => window.__ev('S.slots.filter(x => x && x.n).length')), mem = await p.evaluate(() => window.__ev('!!(V2.ui && V2.ui.lastClear)'));
  ok(n1 === 1 && !(await btn(p)) && !mem, `390: adding a Pokémon after Clear Team drops the button and forgets the team (${n1} on the team, kept ${mem})`);
  await p.evaluate(() => window.__ev('S.slots = S.slots.map(() => blank()); S.loadedId = null; render()')); await p.waitForTimeout(800);
  ok(!(await btn(p)), '390: emptied again by hand: no button (the cleared team was forgotten)');
  ok(!errs.length, `390: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await p.close(); }

// 2. 320 / 390 / 1440, light and dark: inside the screen, 44px+, nothing scrolls sideways
for (const th of ['light', 'dark']) for (const W of [320, 390, 1440]) {
  const [p, errs] = await open(W, th); await clear(p); await p.evaluate(() => window.__ev('ui.undo = null')); await p.waitForTimeout(300);
  const x = await btn(p);
  ok(!!x && x.l >= 0 && x.r <= x.w && x.h >= 44 && !x.side, `${th} ${W}: Restore Last Team inside the screen and 44px+ (${x ? `${Math.round(x.l)}-${Math.round(x.r)} of ${x.w}, ${Math.round(x.h)}px tall, sideways ${x.side}` : 'no button'})`);
  ok(!errs.length, `${th} ${W}: no page errors (${errs.length})`); await p.close(); }
await b.close(); console.log(`v2-q26: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
