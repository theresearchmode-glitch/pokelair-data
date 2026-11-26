// Clear Team keeps its Undo in reach (Sim's design review, Nov 18, P1 #1: "Undo shows for only about 4 seconds, focus jumps to the
// page heading"). After My Team > More > Clear Team: the toast's Undo is still up at 8 s (it lasts 10 s, longer than other Undos,
// because Clear empties all six), the focus is on that Undo (not the heading), and pressing Enter brings all six back.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-clear.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch();
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
for (const W of [390, 1280]) {
  const p = await b.newPage({viewport: {width: W, height: 900}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(5000);
  const n0 = await p.evaluate(() => document.querySelectorAll('#main [data-tmsel]').length);
  await p.click('#main [data-v2more]'); await p.waitForTimeout(600); await p.click('.np-sheet [data-v2clear]'); await p.waitForTimeout(1200);
  await p.mouse.move(2, 2); /* the pointer off the toast, so its own pause doesn't help */
  const f = await p.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.tagName) + ':' + (a.textContent || '').trim().slice(0, 20) : 'none'; });
  await p.waitForTimeout(6800); /* about 8 s after the tap */
  const up = await p.evaluate(() => !!document.querySelector('.np-toast #toastUndo'));
  ok(n0 === 6, `${W}: the sample six to start (${n0})`);
  ok(/^toastUndo:/.test(f), `${W}: after Clear Team the focus is on the toast's Undo (${f})`);
  ok(up, `${W}: the Undo is still up about 8 s after Clear Team (${up})`);
  if (up) { await p.focus('.np-toast #toastUndo'); await p.keyboard.press('Enter'); await p.waitForTimeout(1500); }
  const n1 = await p.evaluate(() => document.querySelectorAll('#main [data-tmsel]').length);
  ok(n1 === 6, `${W}: Undo brings all six back (${n1})`);
  ok(errs.length === 0, `${W}: no page errors (${errs.length})`); await p.close(); }
await b.close();
console.log(`v2-clear: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
