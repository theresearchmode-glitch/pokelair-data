// A shorter Events page on phones (Sim's Q31, Nov 19): under 700 wide the Ticket Wall opens on the big latest-result ticket plus 6 small
// tickets (was 12), then "Show More · N left"; each Show More still adds 12. The wall's gaps tighten on phones (12px above each small
// ticket, was 24; 16px between the wall's parts, was 24). Tablet and desktop unchanged (1 big + 12 small). The filters (All / Official /
// 100+ players) keep working with the new cap and reset Show More as before. 390 x 844 phone page length at most 4.4 screens
// (it was 5.70). Light and dark: no ticket out of the screen, no name out of its ticket, nothing scrolls sideways. Exit 1 on any failure.
// Nov 22 (Events on the kit, proposal): the big ticket is now plan step 1 (article.ev2-latest: the latest result's six as roster cards)
// and the small tickets are the wall's kit tickets (button.ev2-tk, the date stub on the LEFT); the wall's gaps are the grid's own (12px on
// phones, 20px from 700). The counts (1 + 6, Show More adds 12, filters reset it) are unchanged.
//   PAGE=app/dist/v2.html node app/test/v2-q31.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (W, th, phone) => { const c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})});
  const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#events', {timeout: 90000}); await p.waitForTimeout(4000); return [p, errs, c]; };
const wall = p => p.evaluate(() => { const m = document.querySelector('#main .ev-more'), t = m ? (m.textContent || '').replace(/\s+/g, ' ').trim() : '';
  return {big: document.querySelectorAll('#main .ev2-latest').length, small: document.querySelectorAll('#main .ev2-wall > .ev2-tk').length, more: t, left: +((t.match(/· (\d+) left/) || [])[1] || 0)}; });
const count = (p, k) => p.evaluate(k => window.__ev(`(ev => ${k === 'official' ? "ev.filter(e => e.src === 'official')" : k === 'big' ? 'ev.filter(e => e.players >= 100)' : 'ev'}.length)(META.events.events)`), k);
const tap = async (p, sel) => { await p.click(sel); await p.waitForTimeout(700); };
// the words themselves (a Range), not the name's box. Known before Q31, not part of it: under 360 an official ticket's one-line
// "Official event · Winner's team" label (sugs.css nowrap) pushes its name into the stub; listed as a note, waiting on Sim.
const boxes = p => p.evaluate(() => { const W = innerWidth, bad = [], known = [];
  for (const t of document.querySelectorAll('#main .ev-wall .ev2-tk')) { const r = t.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1) bad.push('ticket ' + Math.round(r.left) + '-' + Math.round(r.right));
    const n = t.querySelector('.ev2-name'), s = t.querySelector('.ev2-stub'); if (n && s) { const g = document.createRange(); g.selectNodeContents(n);
      const rs = [...g.getClientRects()], left = Math.min(...rs.map(q => q.left)), right = Math.max(...rs.map(q => q.right)), z = s.getBoundingClientRect();
      if (left < z.right - 1) bad.push('name into the stub by ' + Math.round(z.right - left) + 'px: ' + n.textContent.slice(0, 32));
      if (right > r.right + 1) bad.push('name out of the ticket by ' + Math.round(right - r.right) + 'px: ' + n.textContent.slice(0, 32)); }
    for (const q of t.querySelectorAll('.ev2-k, .ev2-stub small, .ev2-stub b, .ev2-six img')) { const z = q.getBoundingClientRect(); if (z.width && (z.right > r.right + 1 || z.bottom > r.bottom + 1)) bad.push('out of the ticket: ' + (q.textContent || q.alt || 'picture').slice(0, 24)); } }
  return {bad, known, side: document.documentElement.scrollWidth > W}; });
const note = (bx, msg) => { if (bx.known.length) console.log(`  note  ${msg}: known before Q31, not counted: ${bx.known.length} official ticket(s), e.g. ${bx.known[0]}`); };

for (const th of ['light', 'dark']) {
  // phones: 1 big + 6, Show More adds 12, filters keep working and reset Show More
  for (const W of [320, 390, 699]) { const [p, errs, c] = await open(W, th, true), all = await count(p, 'all');
    let x = await wall(p); ok(x.big === 1 && x.small === 6, `${th} ${W}: 1 big + 6 small tickets on first load (${x.big} + ${x.small})`);
    ok(x.left === all - 7 && /^Show More · \d+ left/.test(x.more), `${th} ${W}: "${x.more}" says ${all - 7} left (of ${all})`);
    await tap(p, '#main [data-evmore]'); x = await wall(p); ok(x.small === 18 && x.left === all - 19, `${th} ${W}: Show More adds 12 (${x.small} small, ${x.left} left)`);
    let bx = await boxes(p); note(bx, `${th} ${W} after Show More`); ok(!bx.bad.length && !bx.side, `${th} ${W}: after Show More nothing out of its box, nothing sideways (${bx.bad.slice(0, 3).join('; ') || 'clean'}${bx.side ? ', scrolls sideways' : ''})`);
    const gap = await p.evaluate(() => Math.round(parseFloat(getComputedStyle(document.querySelector('#main .ev2-wall')).rowGap)) + '/' + Math.round(parseFloat(getComputedStyle(document.querySelector('#main .ev-wall')).rowGap)));
    ok(gap === '12/12', `${th} ${W}: 12px between the small tickets, 12px wall gap (${gap})`);
    for (const k of ['official', 'big']) { await tap(p, `#main [data-evf="${k}"]`); const n = await count(p, k); x = await wall(p);
      const want = Math.min(n, 7) - 1; ok(x.big === (n ? 1 : 0) && x.small === want && x.left === Math.max(0, n - 7), `${th} ${W}: filter ${k}: ${n} events, ${x.big} big + ${x.small} small, ${x.left} left (want ${want} small, ${Math.max(0, n - 7)} left)`);
      const pr = await p.evaluate(k => document.querySelector(`#main [data-evf="${k}"]`).getAttribute('aria-pressed'), k); ok(pr === 'true', `${th} ${W}: filter ${k} is pressed`);
      bx = await boxes(p); note(bx, `${th} ${W} filter ${k}`); ok(!bx.bad.length && !bx.side, `${th} ${W}: filter ${k}: nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`); }
    await tap(p, '#main [data-evf="all"]'); x = await wall(p); ok(x.small === 6 && x.left === all - 7, `${th} ${W}: back to All: Show More reset, 6 small (${x.small}, ${x.left} left)`);
    bx = await boxes(p); note(bx, `${th} ${W}`); ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box, nothing sideways (${bx.bad.slice(0, 3).join('; ') || 'clean'}${bx.side ? ', scrolls sideways' : ''})`);
    if (W === 390) { await p.evaluate(() => scrollTo(0, 0)); const H = await p.evaluate(() => document.documentElement.scrollHeight);
      ok(H / 844 <= 4.4, `${th} 390: page length ${H}px = ${(H / 844).toFixed(2)} screens (at most 4.4; was 5.70)`); }
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
  // tablet and desktop: unchanged, 1 big + 12, Show More adds 12
  for (const W of [700, 1440]) { const [p, errs, c] = await open(W, th, false), all = await count(p, 'all');
    let x = await wall(p); ok(x.big === 1 && x.small === 12 && x.left === all - 13, `${th} ${W}: unchanged, 1 big + 12 small, ${x.left} left (${x.big} + ${x.small})`);
    await tap(p, '#main [data-evmore]'); x = await wall(p); ok(x.small === 24, `${th} ${W}: Show More adds 12 (${x.small})`);
    const gap = await p.evaluate(() => Math.round(parseFloat(getComputedStyle(document.querySelector('#main .ev2-wall')).rowGap)));
    ok(gap === 20, `${th} ${W}: 20px between the tickets (${gap})`);
    const bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length})`); await c.close(); }
}
// a window dragged across 700: the cap follows (one redraw when the band changes)
{ const [p, errs, c] = await open(1000, 'light', false); let x = await wall(p); const a = x.small;
  await p.setViewportSize({width: 500, height: 844}); await p.waitForTimeout(800); x = await wall(p); const m = x.small;
  await p.setViewportSize({width: 1000, height: 844}); await p.waitForTimeout(800); x = await wall(p);
  ok(a === 12 && m === 6 && x.small === 12, `resize 1000 > 500 > 1000: ${a} > ${m} > ${x.small} small tickets`); ok(!errs.length, `resize: no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(`v2-q31: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
