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
// 820 (iPad): Nov 20 (Sim: no Lead / Back / Bench on My Team; leads are Battle's call). Was Q9 C (Nov 18: Remove keeps Lead / Back /
// Bench, cards above and beside hold within 2px). Now: after Remove (5 of 6: the building view, whose "Your Six" heading stays) the six stay ONE group in slot order, with no Lead / Back /
// Bench words; EVERY other Card stays where it was (within 1px, rounding) and the Add Card takes the removed Card's place, in its slot.
{ const p = await b.newPage({viewport: {width: 820, height: 1180}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(5000);
  await p.evaluate(() => { const c = document.querySelectorAll('#main [data-tmsel]')[2]; c.scrollIntoView({block: 'center'}); c.click(); }); await p.waitForTimeout(1200);
  await p.evaluate(() => { const r = document.querySelector('#main [data-v2rm]'); if (r.getBoundingClientRect().bottom > innerHeight) r.scrollIntoView({block: 'nearest'}); }); await p.waitForTimeout(600);
  /* each slot's top and left (a Card moving sideways counts too: Nov 20) */
  const pos = () => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('#main .mh-slot')].map(s => { const k = s.querySelector('.mh-add') ? 'ADD' : (s.querySelector('[data-tmsel]').getAttribute('aria-label') || '').split(',')[0], r = s.getBoundingClientRect(); return [k, [Math.round(r.top), Math.round(r.left)]]; })));
  const order = () => p.evaluate(() => [...document.querySelectorAll('#main .mh-slot')].map(s => { const a = s.querySelector('[data-v2addto]'); return a ? 'ADD' + a.dataset.v2addto : (s.querySelector('[data-tmsel]').getAttribute('aria-label') || '').split(',')[0]; }).join('|'));
  const before = await pos(), ord0 = await order(), removed = await p.evaluate(() => (document.querySelector('#main .mh-slot.on [data-tmsel]').getAttribute('aria-label') || '').split(',')[0]);
  const slotOf = await p.evaluate(() => +document.querySelector('#main .mh-slot.on [data-tmsel]').dataset.tmsel); /* data-tmsel = the team slot (0-5) */
  await p.click('#main [data-v2rm]'); await p.waitForTimeout(2500);
  const after = await pos(), ord1 = await order(), groups = await p.evaluate(() => [...document.querySelectorAll('#main .mh-gh b')].map(b => b.textContent.trim()).join('|'));
  const roleWords = await p.evaluate(() => { const h = document.querySelector('#main .mh-hand'); return h ? (h.innerText.match(/\b(Lead|Back|Bench)\b/g) || []).join(',') : 'no Hand'; });
  /* Nov 20: every other Card holds still (top and left within 1px): first the Cards above and beside the removed one (the old Q9 C
     strength, now 1px), then, as its own line, the Cards in the rows below it */
  const near = (a, c) => Math.abs(a[0] - c[0]) <= 1 && Math.abs(a[1] - c[1]) <= 1;
  const others = Object.keys(before).filter(k => k !== removed && k !== 'ADD'), mv = k => !(k in after) || !near(after[k], before[k]), say = k => `${k} ${before[k]}->${after[k] || 'gone'}`;
  const movedUp = others.filter(k => before[k][0] <= before[removed][0] + 1 && mv(k)).map(say), movedDown = others.filter(k => before[k][0] > before[removed][0] + 1 && mv(k)).map(say);
  const addAt = !!after.ADD && near(after.ADD, before[removed]);
  /* slot order: the Add card sits in the removed Card's own slot, everything else in the same order as before */
  const sameOrder = slotOf >= 0 && ord1 === ord0.split('|').map(k => k === removed ? 'ADD' + slotOf : k).join('|');
  ok(groups === 'Your Six' && !roleWords && !movedUp.length && addAt && sameOrder && !errs.length, `820 (Nov 20): after Remove one group "${groups}" (Lead / Back / Bench words: ${roleWords || 'none'}), no Card above or beside it moves (${movedUp.join(', ') || 'none'}), the Add Card takes ${removed}'s place (${before[removed]} -> ${after.ADD}) in slot ${slotOf + 1} (order ${ord1})`);
  ok(!movedDown.length, `820 (Nov 20): no Card in the rows below the removed one moves either (${movedDown.join(', ') || 'none'})`);
  await p.close(); }
{ const r = await run(390, true);
  ok(r.focus && r.on && !r.errs, `390, Add spot off the top: after Remove it is on screen below the header (top ${r.top}, moved ${r.y - r.y0}px), focus ${r.focus}`); }
await b.close();
console.log(`v2-rmjump: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
