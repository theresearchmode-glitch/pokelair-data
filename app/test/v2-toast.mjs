// One Undo time everywhere: 10 s (Sim's design review #2, Nov 18; was 6 s, switch-readiness small item): a status message with an Undo button stays 10 s, the same as every
// other Undo message (V2.undoToast, My Box's bxToast); a message without Undo keeps 4 s. Before this, the shared toast(text, undo)
// that Apply, Remove and other team changes use (app/src/v2/bridge.js) gave its Undo only the 4 s default.
// Checks on #team at 1280: shared toast with Undo still up at 9 s and gone by 11.5 s; without Undo gone by 5 s; V2.undoToast and My Box's still up at 9 s.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-toast.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; }); /* the page's test hook, window.__ev(code), as in v2-trwarm.mjs */
const ev = code => p.evaluate(c => window.__ev(c), code);
const errs = []; p.on('pageerror', e => errs.push(e.message));
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(5000);
await p.mouse.move(5, 5); /* a toast under the pointer waits; keep the pointer off it */
const up = () => p.evaluate(() => !!document.querySelector('.np-toast'));
const at = async ms => { await p.waitForTimeout(ms); return up(); };
// 1. the shared toast with an Undo point
await ev(`ui.undo = JSON.stringify(S.slots); toast('Applied a test change', true)`);
const hasBtn = await p.evaluate(() => !!document.querySelector('.np-toast #toastUndo'));
ok(hasBtn, 'shared toast(text, undo) shows its Undo button');
const u9 = await at(9000), u115 = await at(2500);
ok(u9, `with Undo: still up at 9 s (${u9})`); ok(!u115, `with Undo: gone by 11.5 s (${u115})`);
// 2. the shared toast without Undo keeps the short time
await ev(`toast('Saved', false)`); const n5 = await at(5000);
ok(!n5, `without Undo: gone by 5 s, as before (${n5})`);
// 3. the other Undo message, for reference
await ev(`V2.undoToast('Game removed', () => {})`); const r9 = await at(9000);
ok(r9, `V2.undoToast: still up at 9 s (${r9})`);
await ev(`V2.bxToast('Removed from My Box')`); const x9 = await at(9000);
ok(x9, `My Box's Undo: still up at 9 s (${x9})`);
await p.waitForTimeout(2500);
ok(errs.length === 0, `no page errors (${errs.length})`);
await b.close();
console.log(`v2-toast: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
