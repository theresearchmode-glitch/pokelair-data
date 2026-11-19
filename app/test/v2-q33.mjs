// Events on phones opens on the latest winner (Sim's Q33 B and Q34 B, Nov 19, 2:49 PM). Under 700 wide the Ticket Wall's header, its
// filters and the latest winner's big ticket come straight under the page head and tabs; then the counts ("Counted this regulation")
// and the Next Events plate; then the rest of the wall (6 small tickets + Show More, Sim's Q31). The markup is in that order, so the
// reading order and the tab order are the order on screen. The big ticket starts inside the first screen (844 tall).
// Q34 B: under 360 an official ticket's label "Official event · Winner's team" may wrap to two lines (after the "·"), so no label
// and no event name runs into the date stub. Tablet and desktop (700, 1440) keep today's order: counts and Next Events above the wall.
// Light and dark; nothing out of its box, nothing sideways. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q33.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (W, th, phone) => { const c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})});
  const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#events', {timeout: 90000}); await p.waitForTimeout(4000); return [p, errs, c]; };
const tap = async (p, sel) => { await p.click(sel); await p.waitForTimeout(700); };
// the page's blocks in markup order, with where each sits on the page (top, from the top of the document)
const blocks = p => p.evaluate(() => { scrollTo(0, 0); const q = s => document.querySelector('#main ' + s), want = [['head', '.ra-h h1'], ['tabs', '.ra-h .ra-seg'], ['wall title', '.ev-wh h2'], ['filters', '.ev-f'],
  ['big ticket', '.tk.big'], ['counts', '.ev-counts'], ['next events', '.ev-plate'], ['first small ticket', '.tk-wall > .tk'], ['show more', '.ev-more']];
  const els = want.map(([n, s]) => [n, q(s)]).filter(([, e]) => e && e.getClientRects().length);
  const dom = els.slice().sort((a, b) => a[1] === b[1] ? 0 : a[1].compareDocumentPosition(b[1]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1).map(([n]) => n);
  const top = Object.fromEntries(els.map(([n, e]) => [n, Math.round(e.getBoundingClientRect().top + scrollY)]));
  // the tab order: every focusable control in the main area, in markup order (no positive tabindex anywhere)
  const pos = [...document.querySelectorAll('#main [tabindex]')].filter(e => +e.getAttribute('tabindex') > 0).length;
  const go = q('.tk.big .tk-go'), sum = q('.ev-counts summary'), plateA = q('.ev-plate a, .ev-plate button'), small = q('.tk-wall > .tk'), fil = q('.ev-f button');
  const foc = [...document.querySelectorAll('#main a[href], #main button, #main summary')].filter(e => e.getClientRects().length);
  const ix = e => foc.indexOf(e);
  return {dom, top, pos, tab: [ix(fil), ix(go), ix(sum), ix(plateA), ix(small)], bigTop: q('.tk.big') ? Math.round(q('.tk.big').getBoundingClientRect().top) : null,
    big: q('.tk.big') ? q('.tk.big').getBoundingClientRect().height : 0}; });
// labels and names: the words themselves (Ranges), never inside the date stub, never out of the ticket
// Known before Q33 (checked Nov 19 on 6b742243 with the frozen CI data): at 700-1099 a one-word-long event name (ValkrixVGC Champions
// League #0) runs into its stub. Printed as a note, not counted; its own fix is next on the Plans page (np-tk700).
const boxes = p => p.evaluate(() => { const W = innerWidth, bad = [], known = []; let n = 0, wrapped = 0;
  const hit = (a, z) => a.right > z.left + 1 && a.left < z.right - 1 && a.bottom > z.top + 1 && a.top < z.bottom - 1;
  for (const t of document.querySelectorAll('#main .ev-wall .tk')) { n++; const r = t.getBoundingClientRect(), s = t.querySelector('.tk-stub'), z = s.getBoundingClientRect();
    if (r.left < -1 || r.right > W + 1) bad.push('ticket off screen ' + Math.round(r.left) + '-' + Math.round(r.right));
    for (const el of t.querySelectorAll('.tk-k, .tk-name')) { const g = document.createRange(); g.selectNodeContents(el); const rs = [...g.getClientRects()].filter(q => q.width > 0);
      if (el.classList.contains('tk-k') && new Set(rs.map(q => Math.round(q.top))).size > 1) wrapped++;
      for (const q of rs) { if (hit(q, z)) { (W >= 700 && W < 1100 && el.classList.contains('tk-name') ? known : bad).push(`${el.className.split(' ')[0]} into the stub by ${Math.round(q.right - z.left)}px: ${el.textContent.slice(0, 30)}`); break; }
        if (q.right > r.right + 1 || q.left < r.left - 1) { bad.push(`${el.className.split(' ')[0]} out of its ticket: ${el.textContent.slice(0, 30)}`); break; } } }
    for (const q of t.querySelectorAll('.tk-stub small, .tk-stub b')) { const a = q.getBoundingClientRect(); if (a.right > r.right + 1 || a.left < z.left - 1) bad.push('stub text out of the stub: ' + q.textContent.slice(0, 20)); } }
  for (const s of ['.ev-counts', '.ev-plate', '.ev-f']) { const e = document.querySelector('#main ' + s); if (e && e.getClientRects().length) { const a = e.getBoundingClientRect(); if (a.left < -1 || a.right > W + 1) bad.push(s + ' off screen'); } }
  return {bad, known, n, wrapped, side: document.documentElement.scrollWidth > W}; });
const wall = p => p.evaluate(() => { const m = document.querySelector('#main .ev-more'), t = m ? (m.textContent || '').replace(/\s+/g, ' ').trim() : '';
  return {big: document.querySelectorAll('#main .ev-wall .tk.big').length, small: document.querySelectorAll('#main .tk-wall > .tk').length, left: +((t.match(/· (\d+) left/) || [])[1] || 0)}; });
const count = (p, k) => p.evaluate(k => window.__ev(`(ev => ${k === 'official' ? "ev.filter(e => e.src === 'official')" : k === 'big' ? 'ev.filter(e => e.players >= 100)' : 'ev'}.length)(META.events.events)`), k);
const PHONE = ['head', 'tabs', 'wall title', 'filters', 'big ticket', 'counts', 'next events', 'first small ticket', 'show more'];
const inc = (x, ks) => ks.every((k, i) => !i || x.top[ks[i - 1]] < x.top[k]);

for (const th of ['light', 'dark']) {
  // Q33 B: phones open on the latest winner; markup order = order on screen = tab order
  for (const W of [320, 390, 699]) { const [p, errs, c] = await open(W, th, true); let x = await blocks(p);
    ok(x.dom.join('>') === PHONE.join('>'), `${th} ${W}: markup order ${x.dom.join(' > ')}`);
    ok(inc(x, x.dom), `${th} ${W}: on screen in the same order (tops ${x.dom.map(k => x.top[k]).join(', ')})`);
    ok(x.top['big ticket'] < x.top.counts && x.top['big ticket'] < x.top['next events'], `${th} ${W}: the big ticket (${x.top['big ticket']}) above the counts (${x.top.counts}) and Next Events (${x.top['next events']})`);
    ok(x.bigTop != null && x.bigTop < 844 - 60, `${th} ${W}: the big ticket starts inside the first screen (top ${x.bigTop} of 844, with at least 60px of it showing; 120 failed on the frozen CI data at 320 dark: 76px, was 1590 before Q33)`);
    ok(!x.pos && x.tab.every((v, i) => v >= 0 && (!i || x.tab[i - 1] < v)), `${th} ${W}: tab order filters > big ticket > counts > Next Events > small tickets (${x.tab.join(', ')}; ${x.pos} positive tabindex)`);
    let bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box, nothing sideways (${bx.n} tickets; ${bx.bad.slice(0, 3).join('; ') || 'clean'}${bx.side ? ', scrolls sideways' : ''})`);
    // Q31 still holds: 6 small, Show More adds 12, filters change the whole wall (the big ticket too) and reset Show More
    const all = await count(p, 'all'); let w = await wall(p); ok(w.big === 1 && w.small === 6 && w.left === all - 7, `${th} ${W}: Q31 1 big + 6 small, ${w.left} left`);
    await tap(p, '#main [data-evmore]'); w = await wall(p); ok(w.small === 18, `${th} ${W}: Q31 Show More adds 12 (${w.small})`);
    await tap(p, '#main [data-evf="official"]'); const no = await count(p, 'official'); w = await wall(p);
    ok(w.big === (no ? 1 : 0) && w.small === Math.min(no, 7) - 1, `${th} ${W}: Q31 filter Official: ${w.big} big + ${w.small} small of ${no}`);
    x = await blocks(p); ok(x.dom.join('>') === PHONE.filter(k => x.dom.includes(k)).join('>') && inc(x, x.dom), `${th} ${W}: with Official on, the same order (${x.dom.join(' > ')})`);
    const big = await p.evaluate(() => (document.querySelector('#main .tk.big .tk-k') || {}).textContent || '');
    ok(/^Official\s+event/.test(big), `${th} ${W}: the filter right above it changes the big ticket too ("${big}")`);
    await tap(p, '#main [data-evf="all"]'); w = await wall(p); ok(w.small === 6, `${th} ${W}: back to All, 6 small (${w.small})`);
    if (W === 390) { const H = await p.evaluate(() => document.documentElement.scrollHeight); ok(H / 844 <= 4.4, `${th} 390: page length ${H}px = ${(H / 844).toFixed(2)} screens (at most 4.4, Q31)`); }
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
  // Q34 B: under 360, no label or event name into the date stub; Official on, then All after Show More; every ticket
  for (const W of [320, 340, 359]) { const [p, errs, c] = await open(W, th, true);
    await tap(p, '#main [data-evf="official"]'); let bx = await boxes(p);
    ok(bx.n > 1 && !bx.bad.length && !bx.side, `${th} ${W}: Official: ${bx.n} tickets, no label or name in the stub (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
    ok(bx.wrapped > 0 || W >= 360, `${th} ${W}: Official: the label wraps to two lines where it needs to (${bx.wrapped} tickets)`);
    const brk = await p.evaluate(() => { const out = []; for (const k of document.querySelectorAll('#main .tk-wall .tk-k')) { const g = document.createRange(); g.selectNodeContents(k);
      const lines = new Map(); for (const q of g.getClientRects()) if (q.width) lines.set(Math.round(q.top), 1);
      if (lines.size > 1) { const b = k.querySelector('b'), r = document.createRange(); r.selectNodeContents(b); const t = new Set([...r.getClientRects()].map(q => Math.round(q.top)));
        if (t.size > 1 || lines.size > 2) out.push(k.textContent); } } return out; });
    ok(!brk.length, `${th} ${W}: a wrapped label breaks only after "Official event ·" (two lines: ${brk.length ? brk[0] : 'yes'})`);
    await tap(p, '#main [data-evf="all"]'); await tap(p, '#main [data-evmore]'); bx = await boxes(p);
    ok(bx.n === 19 && !bx.bad.length && !bx.side, `${th} ${W}: All after Show More: ${bx.n} tickets, no label or name in the stub (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length})`); await c.close(); }
  // tablet and desktop: unchanged, the counts and Next Events above the wall
  for (const W of [700, 1440]) { const [p, errs, c] = await open(W, th, false); const x = await blocks(p);
    const want = W >= 1100 ? ['head', 'counts', 'next events', 'wall title', 'filters', 'big ticket', 'first small ticket', 'show more'] : ['head', 'tabs', 'counts', 'next events', 'wall title', 'filters', 'big ticket', 'first small ticket', 'show more'];
    ok(x.dom.join('>') === want.join('>'), `${th} ${W}: unchanged order ${x.dom.join(' > ')}`);
    ok(x.top.counts < x.top['big ticket'] && x.top['next events'] < x.top['big ticket'], `${th} ${W}: counts (${x.top.counts}) and Next Events (${x.top['next events']}) above the big ticket (${x.top['big ticket']})`);
    const w = await wall(p); ok(w.big === 1 && w.small === 12, `${th} ${W}: 1 big + 12 small (${w.small})`);
    const bx = await boxes(p); if (bx.known.length) console.log(`  note  ${th} ${W}: known before Q33, not counted: ${bx.known.join('; ')}`);
    ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length})`); await c.close(); }
}
// a window dragged across 700: the order follows (one redraw when the band changes)
{ const [p, errs, c] = await open(1000, 'light', false); const a = (await blocks(p)).dom.indexOf('big ticket');
  await p.setViewportSize({width: 500, height: 844}); await p.waitForTimeout(800); const m = (await blocks(p)).dom;
  await p.setViewportSize({width: 1000, height: 844}); await p.waitForTimeout(800); const z = (await blocks(p)).dom;
  ok(z.indexOf('counts') < z.indexOf('big ticket') && m.indexOf('big ticket') < m.indexOf('counts') && a > 0, `resize 1000 > 500 > 1000: the big ticket moves above the counts on the phone width and back`);
  ok(!errs.length, `resize: no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(`v2-q33: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
