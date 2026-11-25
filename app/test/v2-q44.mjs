// Sim Q44 A (Nov 19, 8:33 PM): How We Calculate on phones 360-599 (one column of tiles there): each of the ten parts shows its big outline
// number beside its words (two columns inside the tile); the number keeps its size; nothing out of its tile; the page is at least 0.2
// screens shorter at 390 than the same page with the stacked tiles (same data). Under 360 and 600 up: unchanged (stacked).
// Tapping a part still opens its working. Light and dark; nothing sideways; no page errors. Exit 1 on any failure.
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const th of ['light', 'dark']) for (const W of [320, 360, 390, 599, 600, 1440]) {
  const phone = W < 700, c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})}), p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#method', {timeout: 90000}); await p.waitForTimeout(4500);
  const x = await p.evaluate(() => { const S = [...document.querySelectorAll('#main .inf-tile>summary')], bad = [];
    for (const s of S) { const r = s.getBoundingClientRect(); for (const k of s.querySelectorAll('*')) { const g = document.createRange(); g.selectNodeContents(k); for (const q of g.getClientRects()) if (q.width && (q.right > r.right + 1 || q.left < r.left - 1)) bad.push(k.textContent.trim().slice(0, 20)); } }
    const cols = S.map(s => getComputedStyle(s).gridTemplateColumns.split(' ').length), no = document.querySelector('#main .inf-no');
    return {n: S.length, cols: [...new Set(cols)].join(','), nofs: no ? getComputedStyle(no).fontSize : '', bad, side: document.documentElement.scrollWidth > innerWidth, H: document.documentElement.scrollHeight}; });
  const tag = `${th} ${W}`, row = W >= 360 && W < 600;
  ok(x.n === 10, `${tag}: ten parts (${x.n})`);
  ok(row ? x.cols === '2' : x.cols === '1', `${tag}: ${row ? 'number beside the words (2 columns in every tile)' : 'stacked as before (1 column)'}: ${x.cols}`);
  ok(x.nofs === '34px', `${tag}: the big number keeps its size (${x.nofs})`);
  ok(!x.bad.length && !x.side, `${tag}: nothing out of its tile, nothing sideways (${x.bad.slice(0, 3).join('; ') || 'clean'})`);
  if (W === 390) { const H0 = await p.evaluate(() => { const st = document.createElement('style'); st.textContent = '.inf-tiles>.inf-tile>summary{grid-template-columns:minmax(0,1fr)!important;padding-block:20px 24px!important}.inf-tiles>.inf-tile>summary>.inf-no{grid-row:auto!important}'; document.head.append(st); const h = document.documentElement.scrollHeight; st.remove(); return h; });
    ok((H0 - x.H) / 844 >= 0.2, `${tag}: page ${(x.H / 844).toFixed(2)} screens, ${((H0 - x.H) / 844).toFixed(2)} shorter than stacked (${(H0 / 844).toFixed(2)}; at least 0.2)`); }
  await p.click('#main .inf-tile>summary'); await p.waitForTimeout(400); const open = await p.evaluate(() => document.querySelector('#main .inf-tile').open);
  ok(open, `${tag}: tapping a part opens its working (${open})`); ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close();
}
await b.close(); console.log(fails.length ? `v2-q44: ${fails.length} failed` : 'v2-q44: all passed'); process.exit(fails.length ? 1 : 0);
