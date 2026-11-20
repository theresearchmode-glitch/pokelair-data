// Scan S33 (Nov 20): the page-not-found screen ('#nonsense') and "No Pokémon here." ('#pokemon=<unknown>') carry today's underdog: the same
// featured Pokémon V2.underdog() names for the empty My Team, with one line; its sprite opens its info; no Strength Score, tier or team data
// beside it; Go to Home stays the one main button. 320, 390, 820, 1440, 2560, light and dark: nothing sideways, the underdog on the first
// screen, every line inside its box. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-s33.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const [hash, name] of [['#nonsense', 'not found'], ['#pokemon=notamon', 'No Pokémon here']]) for (const th of ['light', 'dark']) for (const W of [320, 390, 820, 1440, 2560]) {
  const H = W < 700 ? 844 : 900, c = await b.newContext({viewport: {width: W, height: H}, colorScheme: th}); const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(2000);
  await p.evaluate(h => { location.hash = h; }, hash); await p.waitForTimeout(1200);
  const x = await p.evaluate(() => { const dog = document.querySelector('#main .nf-dog'), st = dog && dog.querySelector('[data-v2mon]'), r = dog && dog.getBoundingClientRect();
    const out = dog ? [...dog.querySelectorAll('p,span,b')].filter(e => { const a = e.getBoundingClientRect(), q = dog.getBoundingClientRect(); return a.width && (a.left < q.left - 1 || a.right > q.right + 1); }).length : -1;
    return {dog: !!dog, mon: st ? st.dataset.v2mon : '', want: window.__ev('V2.underdog()'), line: dog ? dog.innerText.replace(/\s+/g, ' ').trim() : '', top: r ? Math.round(r.top + scrollY) : 0, bot: r ? Math.round(r.bottom + scrollY) : 0,
      grade: dog ? /Strength Score|\b[SABCDF] tier|\d+%|Favoured|Unfavoured|Top tier|Needs work|Missing a basic|Your team/.test(dog.closest('#main').innerText) : null, mains: [...document.querySelectorAll('#main .np-btn')].filter(e => e.getClientRects().length).length,
      side: document.documentElement.scrollWidth > innerWidth, out, tap: st ? Math.min(st.getBoundingClientRect().width, st.getBoundingClientRect().height) : 0}; });
  const tag = `${name} ${th} ${W}`;
  ok(x.dog && x.mon === x.want, `${tag}: today's underdog shown (${x.mon || 'none'}; V2.underdog() ${x.want})`);
  ok(/Today's underdog/i.test(x.line) && x.line.includes(`Lost?`), `${tag}: with its one line ("${x.line}")`);
  ok(x.grade === false, `${tag}: no score, tier or team data on the screen`);
  ok(x.mains <= 1, `${tag}: at most one main button (${x.mains})`);
  ok(x.bot <= H, `${tag}: the underdog on the first screen (${x.top}-${x.bot} of ${H})`);
  ok(!x.side && x.out === 0 && x.tap >= 44, `${tag}: nothing sideways, no text out of its box (${x.out}), sprite tap ${Math.round(x.tap)}px`);
  if (W === 320 && x.dog) { /* the longest name in the 12-day rotation, at the narrowest width */
    const y = await p.evaluate(() => { const ns = [...new Set(Array.from({length: 14}, (_, i) => window.__ev(`V2.underdog(new Date(Date.now() + ${i} * 864e5))`)))], L = ns.sort((a, b) => V2.disp(b).length - V2.disp(a).length)[0];
      const keep = V2.underdog; V2.underdog = () => L; V2.redraw(); const dog = document.querySelector('#main .nf-dog'), q = dog.getBoundingClientRect();
      const out = [...dog.querySelectorAll('p,span,b')].filter(e => { const a = e.getBoundingClientRect(); return a.width && (a.left < q.left - 1 || a.right > q.right + 1); }).length; V2.underdog = keep; V2.redraw();
      return {L, n: ns.length, out, side: document.documentElement.scrollWidth > innerWidth}; });
    ok(y.out === 0 && !y.side, `${tag}: the longest name of the rotation (${y.L}, of ${y.n}) stays inside its box (${y.out})`); }
  if (W === 390 && th === 'light' && x.dog) { await p.click('#main .nf-dog [data-v2mon]'); await p.waitForTimeout(900); const h = await p.evaluate(() => location.hash); ok(h === '#pokemon=' + x.want.toLowerCase(), `${tag}: tapping it opens its Pokémon page (${h})`); }
  ok(!errs.length, `${tag}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-s33: ${fails.length} FAILED` : 'v2-s33: all passed'); process.exit(fails.length ? 1 : 0);
