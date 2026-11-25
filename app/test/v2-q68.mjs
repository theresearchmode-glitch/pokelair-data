// Sim Q68 A (Nov 20): the KO Board's desktop ladder (1024+ wide, .arn-kbfull .kob-r rows) shows ONLY the move name on each row's
// second line ("Weather Ball"), not "your X's Weather Ball" / "Weather Ball into your X". The spoken label keeps the full sentence
// word for word. At 1024, 1280 and 1440, light and dark, both directions ("Your hits on them" / "Their hits on you"): every ladder
// row's second line equals that row's move (data-dckbm), is not cut (scrollWidth <= clientWidth + 1), and the row's aria-label still
// holds the full sentence ("<threat>: your <yours>'s <move> does" / "<threat>'s <move> into your <yours>:"). No page errors.
// Could fail: on the build before Q68 A the second line reads "your X's <move>" / "<move> into your X", so the first check fails.
//   PAGE=app/dist/v2.html node app/test/v2-q68.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const wait = (p, ms = 500) => p.waitForTimeout(ms);
for (const W of [1024, 1280, 1440]) for (const th of ['light', 'dark']) {
  const tag = `${W} ${th}`, c = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th}), p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await wait(p, 4500);
  await p.locator('.arn-kb > summary').click(); await wait(p, 900);
  for (const dir of ['mine', 'theirs']) { const dt = `${tag} ${dir}`;
    if (dir === 'theirs') { await p.locator('[data-dcdir="theirs"]:visible').first().click(); await wait(p, 1500); }
    const R = await p.evaluate(dir => { const rows = [...document.querySelectorAll('.arn-kbfull .kob-r')].filter(x => x.getClientRects().length);
      const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return {n: rows.length, bad: rows.map(x => { const mv = x.querySelector('.mv'), t = mv ? mv.textContent.trim() : null, m = x.dataset.dckbm, d = V2.disp(x.dataset.dckb), o = V2.disp(x.dataset.dckbo),
        lab = x.getAttribute('aria-label') || '', full = dir === 'mine' ? new RegExp('^(KO: )?' + esc(`${d}: your ${o}'s ${m} does `) + '\\d+–\\d+%') : new RegExp('^(KO: )?' + esc(`${d}'s ${m} into your ${o}: `) + '\\d+–\\d+%');
        const why = []; if (t !== m) why.push(`line "${t}" not "${m}"`); if (mv && mv.scrollWidth > mv.clientWidth + 1) why.push(`cut ${mv.scrollWidth}>${mv.clientWidth}`); if (!full.test(lab)) why.push(`label "${lab}"`);
        return why.length ? `${d}: ${why.join(', ')}` : null; }).filter(Boolean), ex: rows[0] ? [rows[0].querySelector('.mv').textContent, rows[0].getAttribute('aria-label')] : null}; }, dir);
    ok(R.n === 30, `${dt}: 30 ladder rows shown (${R.n})`);
    ok(R.n && !R.bad.length, `${dt}: every row's second line is only its move, not cut, and its label keeps the full sentence${R.bad.length ? ` (${R.bad.length} wrong; first: ${R.bad[0]})` : ` (e.g. "${R.ex && R.ex[0]}" / "${R.ex && R.ex[1]}")`}`);
  }
  ok(!errs.length, `${tag}: no page errors${errs.length ? ': ' + errs[0] : ''}`);
  await c.close(); }
await b.close(); console.log(`v2-q68: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
