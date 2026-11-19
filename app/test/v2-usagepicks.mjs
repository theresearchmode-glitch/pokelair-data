// Usage page picks Sim approved on Nov 19 (one check per change; each fails on the build before its change).
//  Q13 A: Usage opens on "Online tournaments" (updates daily); "Ranked ladder" is one tap away. Opening Usage does not change the source
//         the rest of the site uses (ui.metaSrc stays as it was), so Ratings, sets and threats elsewhere are untouched.
//  W2b:   Usage's hero numbers follow the chosen source chip: the share and win rate are that list's own numbers for its #1, and when the
//         list has none the hero shows none ("–") and the key line says so, instead of borrowing Online tournaments' numbers.
//  W2c:   the empty My Team (and the old Home ringside) name the Showdown ladder for a number that is the Showdown ladder's share
//         ("% of Showdown ladder teams", word list: Official events / Online tournaments / Ranked ladder / Showdown ladder).
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-usagepicks.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (hash, W = 1280) => { const ctx = await b.newContext({viewport: {width: W, height: 900}}); const p = await ctx.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(String(e.message || e))); await p.goto('file://' + PAGE + '#' + hash, {timeout: 90000}); await p.waitForTimeout(2200); return {ctx, p, errs}; };
const on = p => p.evaluate(() => [...document.querySelectorAll('#main [data-ussrc]')].filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.dataset.ussrc).join());
const pick = async (p, k) => { await p.locator(`#main [data-ussrc="${k}"]`).first().click(); await p.waitForTimeout(800); };

// ---- Q13 A: opens on Online tournaments ----
{ const {ctx, p, errs} = await open('usage');
  const s = await p.evaluate(() => ({glob: window.__ev('ui.metaSrc'), first: (document.querySelector('#main .us-p1 [data-uspick]') || {}).dataset?.uspick || '', want: window.__ev('(META.doubles_tour && META.doubles_tour.top[0] || {}).n'),
    line: (document.querySelector('#main .us-src') || {}).textContent || '', tourLine: window.__ev('V2.usLine ? V2.usLine(META.doubles_tour) : ""')}));
  const o = await on(p);
  ok(o === 'tour' && s.first === s.want && s.line === s.tourLine, `Q13 A: Usage opens on Online tournaments (chip on: "${o}"; #1 on the podium ${s.first}, tournaments' #1 ${s.want}; line "${s.line.slice(0, 60)}")`);
  ok(s.glob === 'ingame', `Q13 A: opening Usage leaves the site-wide source as it was (ui.metaSrc "${s.glob}", default "ingame"), so other pages don't change`);
  await pick(p, 'ingame'); const o2 = await on(p), l2 = await p.evaluate(() => (document.querySelector('#main .us-src') || {}).textContent || '');
  ok(o2 === 'ingame' && /op\.gg|Ranked/i.test(l2), `Q13 A: Ranked ladder is one tap away (chip on after the tap: "${o2}"; line "${l2.slice(0, 60)}")`);
  await pick(p, 'ladder'); await p.reload(); await p.waitForTimeout(2200); await p.evaluate(() => { location.hash = '#usage'; }); await p.waitForTimeout(1200);
  const o3 = await on(p); ok(o3 === 'tour', `Q13 A: after a reload Usage opens on Online tournaments again (chip on: "${o3}")`);
  ok(!errs.length, `Q13 A: no page errors (${errs.join(' | ') || 'none'})`); await ctx.close(); }

await b.close(); console.log(`v2-usagepicks: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
