// Battle Turn One (Sim's Q28 A, Nov 19; Nov 22: also reads the target page's move rows, .btg-b, where the move list replaced the play-by-play cards): a card with no target has no empty strip beside its text, 320-2560. At 1366+ (Sim's Q27 A, Nov 19): the four cards sit 2 x 2, and both cards in a row are the same height (before: each was
// centred in its row, so the shorter one sat lower, e.g. 124 + 96px). Several real opponents, light and dark, 1366-2560; also checks no card
// overflows its text and nothing scrolls sideways. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-pbppair.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
let rows = 0, uneven = [], over = [], noTgt = 0, strip = [];
for (const th of ['light', 'dark']) for (const W of [320, 390, 700, 820, 1099, 1100, 1366, 1440, 1920, 2560]) {
  const p = await b.newPage({viewport: {width: W, height: 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#battle', {timeout: 90000}); await p.waitForTimeout(2500);
  const n = await p.evaluate(() => window.__ev('(META.events && META.events.events || []).length'));
  for (let i = 0; i < Math.min(n, 12); i++) {
    await p.evaluate(i => window.__ev(`S.opp = META.events.events[${i}].top[0].mons.map(m => m.n); V2.redraw()`), i); await p.waitForTimeout(250);
    const m = await p.evaluate(() => { const bs = [...document.querySelectorAll('.pbp-band, .btg-b')].map(x => x.getBoundingClientRect());
      const ov = [...document.querySelectorAll('.pbp-band, .pbp-tx, .btg-b, .btg-mv, .btg-why')].filter(x => x.scrollWidth > x.clientWidth + 1).length;
      /* Q28 A: a card with no target leaves no empty column: its text reaches the Speed block (or the card's inner edge when Speed is
         hidden) within one grid gap */
      const st = [...document.querySelectorAll('.pbp-band, .btg-b')].filter(x => !x.querySelector('.pbp-tgt:not(.none)')).map(x => { const tx = x.querySelector('.pbp-tx, .btg-mv').getBoundingClientRect(),
        sp = x.querySelector('.pbp-spe'), cs = getComputedStyle(x), gap = parseFloat(cs.columnGap) || 0, R = sp && getComputedStyle(sp).display !== 'none' ? sp.getBoundingClientRect().left - gap : x.getBoundingClientRect().right - parseFloat(cs.paddingRight);
        return Math.round(R - tx.right); });
      return {bs: bs.map(r => [Math.round(r.top), Math.round(r.height)]), ov, st, side: document.documentElement.scrollWidth > innerWidth}; });
    noTgt += m.st.length; for (const g of m.st) if (g > 1) strip.push(`${th} ${W} ev${i}: ${g}px empty beside the text`);
    if (m.bs.length < 2 || W < 1366) { if (m.ov || m.side) over.push(`${th} ${W} ev${i}: ${m.ov} text overflow, sideways scroll ${m.side}`); continue; }
    for (let k = 0; k + 1 < m.bs.length; k += 2) { rows++; const [a, c] = [m.bs[k], m.bs[k + 1]]; if (Math.abs(a[0] - c[0]) > 1 || Math.abs(a[1] - c[1]) > 1) uneven.push(`${th} ${W} ev${i} row ${k / 2 + 1}: ${a[1]}px at ${a[0]} vs ${c[1]}px at ${c[0]}`); }
    if (m.ov || m.side) over.push(`${th} ${W} ev${i}: ${m.ov} text overflow, sideways scroll ${m.side}`); }
  await p.close(); }
ok(rows > 0 && !uneven.length, `both Turn One cards in a row have the same top and height at 1366-2560 (${rows} rows, ${uneven.length} uneven${uneven.length ? ', e.g. ' + uneven[0] : ''})`);
ok(noTgt > 0 && !strip.length, `a Turn One card with no target has no empty strip beside its text, 320-2560 (Sim's Q28 A) (${noTgt} such cards, ${strip.length} with a strip${strip.length ? ', e.g. ' + strip[0] : ''})`);
ok(!over.length, `no Turn One card text overflows and nothing scrolls sideways (${over.length}${over.length ? ', e.g. ' + over[0] : ''})`);
await b.close(); console.log(`v2-pbppair: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
