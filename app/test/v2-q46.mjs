// Sim Q46 A (Nov 19, 8:33 PM): in the Arena calc each name plate is a button that opens "Choose the attacker" / "Choose the defender"
// (the site's search sheet, Pokémon only): focus in the search box, the 12 most-used Pokémon before typing, typing filters, Enter or a tap
// picks; the sheet closes, the calc shows the new Pokémon (the hidden #dcA / #dcD picker changes and the verdict is worked out again),
// focus returns to the plate; Escape closes without a change. At 390 and 1440, light and dark; no page errors. Exit 1 on any failure.
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const st = p => p.evaluate(() => ({a: document.querySelector('#dcA') && document.querySelector('#dcA').value, d: document.querySelector('#dcD') && document.querySelector('#dcD').value,
  dn: (document.querySelector('[data-arnname=d]') || {}).textContent || '', an: (document.querySelector('[data-arnname=a]') || {}).textContent || '', v: (document.querySelector('.pc-ans') || {}).textContent || ''})); /* Nov 21: Plot the hit (Sim approved): the answer (.pc-ans: damage in HP, the defender's HP, the verdict); was the Arena's .arn-verdict */
const sheet = p => p.evaluate(() => { const s = document.querySelector('[role=dialog]'); return s ? {label: s.getAttribute('aria-label'), hits: [...s.querySelectorAll('.np-hit b')].map(b => b.textContent.trim()), q: document.activeElement && document.activeElement.matches('[data-arnq]')} : null; });
for (const th of ['light', 'dark']) for (const W of [390, 1440]) {
  const phone = W < 700, c = await b.newContext({viewport: {width: W, height: phone ? 844 : 900}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})}), p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await p.waitForTimeout(4500); const tag = `${th} ${W}`;
  const s0 = await st(p); ok(!!s0.d && !!s0.a, `${tag}: the Arena's pickers are on the page (attacker ${s0.a}, defender ${s0.d})`);
  if (!(await p.locator('[data-arnpick=dcD]').count())) { ok(false, `${tag}: the name plates are buttons that open the picker sheet (none found)`); await c.close(); continue; }
  ok(await p.evaluate(() => { const s = document.querySelector('#dcD'); return s.tabIndex === -1 && s.getAttribute('aria-hidden') === 'true'; }), `${tag}: today's picker is hidden and out of the tab order`);
  await p.locator('[data-arnpick=dcD]').click(); await p.waitForTimeout(700); let sh = await sheet(p);
  ok(sh && sh.label === 'Choose the defender' && sh.q && sh.hits.length === 12, `${tag}: the defender plate opens "${sh && sh.label}" with focus in the search box and ${sh && sh.hits.length} most-used Pokémon`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500); ok(!(await sheet(p)) && (await st(p)).d === s0.d, `${tag}: Escape closes it without a change`);
  await p.locator('[data-arnpick=dcD]').click(); await p.waitForTimeout(700); await p.keyboard.type('incin'); await p.waitForTimeout(400); sh = await sheet(p);
  ok(sh && sh.hits[0] === 'Incineroar', `${tag}: typing "incin" finds Incineroar first (${sh && sh.hits.slice(0, 3).join(', ')})`);
  await p.keyboard.press('Enter'); await p.waitForTimeout(1500); const s1 = await st(p), foc = await p.evaluate(() => document.activeElement && document.activeElement.matches('[data-arnpick=dcD]'));
  ok(!(await sheet(p)) && s1.d === 'Incineroar' && /Incineroar/.test(s1.dn) && s1.v !== s0.v && /Incineroar(?:'s HP: \d+–\d+ (?:of|damage ·) \d+ HP| has \d+ HP)/.test(s1.v) /* Nov 21: Plot the hit (Sim approved): the answer names the new defender; % first (commit 3be28375) reads "…% of Incineroar's HP: x–y of N HP" */, `${tag}: Enter picks it: defender ${s1.d}, plate "${s1.dn.trim()}", verdict worked out again ("${s1.v.slice(0, 40)}")`);
  ok(foc, `${tag}: focus returns to the defender plate (${foc})`);
  await p.locator('[data-arnpick=dcA]').click(); await p.waitForTimeout(700); sh = await sheet(p); ok(sh && sh.label === 'Choose the attacker', `${tag}: the attacker plate opens "${sh && sh.label}"`);
  await p.keyboard.type('garch'); await p.waitForTimeout(400); await p.locator('[role=dialog] [data-arnpickmon]').first().click(); await p.waitForTimeout(1500); const s2 = await st(p);
  ok(/Garchomp/.test(s2.a) && /Garchomp/.test(s2.an), `${tag}: a tap picks the attacker (${s2.a}, plate "${s2.an.trim()}")`);
  ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close();
}
await b.close(); console.log(fails.length ? `v2-q46: ${fails.length} failed` : 'v2-q46: all passed'); process.exit(fails.length ? 1 : 0);
