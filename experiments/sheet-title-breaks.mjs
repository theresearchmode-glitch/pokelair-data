// Sheet titles on phones (hL, Nov 24): does any item / move / Ability / nature title break inside a word or leave a lone letter on a line?
// node experiments/sheet-title-breaks.mjs app/dist/v2.html [out.json] [shotsDir]   (INFO=1: made-up usage so the Ability photo shows)
import {chromium} from 'playwright'; import fs from 'node:fs'; import path from 'node:path';
const PAGE = path.resolve(process.argv[2]), OUT = process.argv[3], SHOTS = process.argv[4];
const WIDTHS = [320, 360, 375, 390, 414, 600];
const b = await chromium.launch(), res = {};
for (const w of WIDTHS) {
  const ctx = await b.newContext({viewport: {width: w, height: 800}}), q = await ctx.newPage();
  await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500); await q.evaluate(() => document.fonts.ready);
  /* INFO=1: made-up usage for every move, item and Ability (numbers invented for this measurement only) so the Ability photo and the share lines show, as on the live site */
  if (process.env.INFO) await q.evaluate(() => window.__ev(`(() => { const u = [['garchomp', 50, 60]], o = k => Object.fromEntries(Object.keys(INFO_TEXT[k]).map(n => [n, [100, u, 1]])); META.info = {N: 1000, period: 'test', mv: o('mv'), it: o('it'), ab: o('ab')}; })()`));
  const r = await q.evaluate(async () => {
    const names = {it: [...Object.keys(INFO_TEXT.it), ...V2.IS_NOT_IN], mv: Object.keys(INFO_TEXT.mv), ab: Object.keys(INFO_TEXT.ab), nt: V2.ntAll()};
    const lines = h => { const out = []; const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let t, prevTop = null, cur = '';
      while ((t = tw.nextNode())) for (let i = 0; i < t.data.length; i++) { const rg = document.createRange(); rg.setStart(t, i); rg.setEnd(t, i + 1); const rc = [...rg.getClientRects()].filter(x => x.width > 0)[0];
        const ch = t.data[i]; if (!rc) { cur += ch; continue; } const top = Math.round(rc.top); if (prevTop !== null && top > prevTop + 4) { out.push(cur); cur = ''; } prevTop = top; cur += ch; }
      out.push(cur); return out; };
    const res = [];
    for (const k of ['it', 'mv', 'ab', 'nt']) for (const n of names[k]) {
      V2.openInfo(k, n); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const s = document.querySelector('.np-sheet .is-tab h2'); if (!s) { res.push({k, n, none: 1}); continue; }
      const L = lines(s), mid = L.slice(0, -1).some((l, i) => /[^\s-]$/.test(l) && /^\S/.test(L[i + 1])), lone = L.some(l => /^\s*\S\s*$/.test(l));
      res.push({k, n, L, mid, lone, fs: parseFloat(getComputedStyle(s).fontSize), w: Math.round(s.getBoundingClientRect().width), stk: !!document.querySelector('.np-sheet .is-pn.is-stk'), photo: !!document.querySelector('.np-sheet .is-photo'), sw: s.scrollWidth > s.clientWidth + 1});
      V2.closeSheet(true, true); }
    return res; });
  res[w] = r;
  const bad = r.filter(x => x.mid || x.lone || x.sw);
  const by = {}; for (const x of r) if (!x.none) by[x.k + x.fs] = (by[x.k + x.fs] || 0) + 1;
  const stk = {}; for (const x of r) if (x.stk) stk[x.k] = (stk[x.k] || 0) + 1;
  console.log(`${w}: stacked ${JSON.stringify(stk)}, ability photos ${r.filter(x => x.photo).length}; ${r.filter(x => !x.none).length} titles, ${r.filter(x => x.mid).length} mid-word, ${r.filter(x => x.lone).length} lone letter, ${r.filter(x => x.sw).length} overflow, no sheet ${r.filter(x => x.none).map(x => x.n).join('/') || '-'}; sizes ${JSON.stringify(by)}`);
  for (const x of bad.slice(0, 12)) console.log('   ', x.k, x.n, JSON.stringify(x.L), x.fs + 'px', 'h2 ' + x.w + 'px');
  if (SHOTS) for (const [k, n] of [['it', 'Charizardite X'], ['it', 'Garchompite Z'], ...(process.env.EXTRA || '').split('|').filter(Boolean).map(s => s.split(':'))]) {
    await q.evaluate(([k, n]) => V2.openInfo(k, n), [k, n]); await q.waitForTimeout(700);
    await q.screenshot({path: `${SHOTS}/${k}-${n.replace(/\W+/g, '-').toLowerCase()}-${w}.png`, clip: {x: 0, y: 0, width: w, height: 420}});
    await q.evaluate(() => V2.closeSheet(true, true)); }
  await ctx.close();
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify(res));
// the widest titles (single longest word in px is what matters; report the longest names by letters)
await b.close();
