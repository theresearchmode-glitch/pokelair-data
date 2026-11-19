// Remove in the My Team panel keeps the page still (Sim, Nov 18, desktop: "every time you press remove the page jumps up and it's
// really annoying"). The Nov 17 rule stays: if the new Add spot would be off the screen (a phone, the panel far below the six), it is
// brought into view with the least movement; when it is already on screen nothing moves.
// Checks, sample team: at 1440 and 1100, tap the third Card, scroll the panel into
// view, press Remove: the page moves under 8px and at least 44px of the Add spot is on screen (tappable), with the focus. At 390 with the Add spot scrolled off the
// top: after Remove it is on screen, below the sticky header.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-rmjump.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch();
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const run = async (W, offTop) => { const p = await b.newPage({viewport: {width: W, height: W < 700 ? 844 : 900}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(5000);
  await p.evaluate(() => { const c = document.querySelectorAll('#main [data-tmsel]')[2]; c.scrollIntoView({block: 'center'}); c.click(); }); await p.waitForTimeout(1200);
  const head = await p.evaluate(() => (document.querySelector('.np-head') || {}).offsetHeight || 0);
  // the panel's Remove on screen; for the off-screen case, scroll down so the six is above the screen
  await p.evaluate(([off, h]) => { const r = document.querySelector('#main [data-v2rm]'); r.scrollIntoView({block: off ? 'end' : 'center'}); if (off) scrollBy(0, 400); }, [offTop, head]); await p.waitForTimeout(800);
  const y0 = await p.evaluate(() => scrollY);
  await p.evaluate(() => { const r = document.querySelector('#main [data-v2rm]'); if (r.getBoundingClientRect().bottom > innerHeight) r.scrollIntoView({block: 'nearest'}); }); const y1 = await p.evaluate(() => scrollY);
  await p.click('#main [data-v2rm]'); await p.waitForTimeout(2500);
  const r = await p.evaluate(h => { const a = document.activeElement, add = a && a.matches('[data-v2addto]') ? a : null, q = add && add.getBoundingClientRect();
    return {y: scrollY, focus: !!add, top: q ? Math.round(q.top) : null, on: !!q && Math.min(q.bottom, innerHeight) - Math.max(q.top, h) >= 44}; }, head);
  await p.close(); return {y0: y1, ...r, errs: errs.length}; };
for (const W of [1440, 1100]) { const r = await run(W, false);
  ok(Math.abs(r.y - r.y0) < 8 && r.focus && r.on && !r.errs, `${W}: Remove keeps the page still (moved ${r.y - r.y0}px), at least 44px of the Add spot is on screen (tappable), with the focus (${r.focus}, top ${r.top}), no errors (${r.errs})`); }
// 820 (iPad): the six is two across with six Pokémon and three across with five plus the Add spot, so Remove re-flows every Card and
// the Add spot can land off the screen; there the page moving to show it is right. The re-flow itself is a design question for Sim
// (Nov 18), so 820 checks only that the Add spot ends up tappable with the focus, and prints how far the page moved.
{ const r = await run(820, false);
  ok(r.focus && r.on && !r.errs, `820 (the six re-flows on Remove): the Add spot ends up tappable with the focus (moved ${r.y - r.y0}px, top ${r.top})`); }
{ const r = await run(390, true);
  ok(r.focus && r.on && !r.errs, `390, Add spot off the top: after Remove it is on screen below the header (top ${r.top}, moved ${r.y - r.y0}px), focus ${r.focus}`); }
await b.close();
console.log(`v2-rmjump: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
