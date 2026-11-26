// The kit's taps (adapters/v2.A-team.mjs tapFound) must tap ONCE, also when the page is slow to answer the tap.
// Found Nov 19 (EDIT-03 failing now and then in full runs: on a loaded machine and in WebKit, "tile not shown locked"): Playwright's
// click gives up after its 900 ms timeout when the page is still busy handling the click, although the click HAS landed (measured: a
// click whose handler takes 1.5 s throws "Timeout 900ms exceeded" and the handler ran once). tapFound took that as a missed tap and
// tapped again: Edit Set's Lock button had been redrawn (a new element), so the retry found the new "Locked" button and unlocked it
// (diag log: toggleLock(0) -> true, then a second click at the new button's centre, toggleLock(0) -> false); a Card that the redraw
// keeps (same element) got a forced second tap instead.
// Checks: with the page made slow on purpose (each Lock toggle and each Card tap kept busy 1.5 s, longer than the 900 ms timeout),
// one panelLock() toggles once (reads "Locked", the slot is locked), and one tapTile() runs the Card's tap once.
// Could fail: yes, before the fix both checks failed (Lock toggled twice: back to "Lock"; the Card's tap ran twice).
// Can't detect: a tap that is still queued in the browser when tapFound looks (tapFound waits a moment before it looks).
// Run: PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs   (exit 1 on any failure)
import {open, setGroup, closeAll, TEAM} from './harness.mjs';
setGroup('A-team');
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const BUSY = 1500;
try {
  const r = await open({team: TEAM});
  await r.ui.go('My Team', 300); await r.ui.waitText(/Strength Score/, 12000); await r.ui.settle();
  // Card tap: count how often the Card's own tap handler runs, and keep it busy
  await r.pg.evaluate(ms => { window.__cardTaps = 0; document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#main [data-tmsel]')) { window.__cardTaps++; const t = performance.now(); while (performance.now() - t < ms); } }, true); }, BUSY);
  let err = ''; try { await r.ui.tapTile('Mega Charizard Y'); } catch (e) { err = ', ' + String(e.message).slice(0, 80); }
  ok(await r.pg.evaluate(() => window.__cardTaps) === 1, 'one tapTile() taps the Card once (taps: ' + await r.pg.evaluate(() => window.__cardTaps) + err + ')');
  await r.pg.evaluate(() => { window.__cardTaps = -1e9; }); /* the Card check is done; later taps don't count */
  await r.close();
}
catch (e) { ok(false, 'Card part ran to the end: ' + String(e.message || e).slice(0, 200)); }
try {
  const r = await open({team: TEAM});
  await r.ui.go('My Team', 300); await r.ui.waitText(/Strength Score/, 12000); await r.ui.settle();
  // Lock: each toggle kept busy; one panelLock() must leave it locked
  await r.ui.openEditPanel('Mega Charizard Y');
  ok(await r.ui.panelLockText() === 'Lock', 'Edit Set opens with "Lock"');
  await r.ui.peek(`(() => { const o = toggleLock; window.__locks = 0; toggleLock = function () { window.__locks++; const t = performance.now(); while (performance.now() - t < ${BUSY}); return o.apply(this, arguments); }; })()`);
  await r.ui.panelLock(); await r.pg.waitForTimeout(500);
  const locks = await r.pg.evaluate(() => window.__locks), txt = await r.ui.panelLockText(), on = await r.ui.peek('S.slots[0].lock');
  ok(locks === 1 && txt === 'Locked' && on === true, `one panelLock() toggles once (toggles: ${locks}, button: ${txt}, slot locked: ${on})`);
  ok(!r.errs.length, 'no page errors' + (r.errs.length ? ': ' + r.errs.join(' | ') : ''));
  await r.close();
} catch (e) { ok(false, 'Lock part ran to the end: ' + String(e.message || e).slice(0, 200)); }
await closeAll();
console.log(fails.length ? `\ntap-once: ${fails.length} FAIL` : '\ntap-once: all pass'); process.exit(fails.length ? 1 : 0);
