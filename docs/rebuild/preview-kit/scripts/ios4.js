// iPhone WebKit: remove a Pokémon, tap the empty "Add a Pokémon" spot, type in its search box; where are the sheet and the box?
const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/redesign/foundation.html';
const O = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/shots/ios';
(async () => { const b = await pw.webkit.launch(); const c = await b.newContext({...pw.devices['iPhone 13'], colorScheme: 'dark'}); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + F + '#team'); await p.waitForTimeout(6000);
  await p.locator('[data-tmsel]').nth(5).tap(); await p.waitForTimeout(400);
  await p.locator('[data-v2rm]').first().tap(); await p.waitForTimeout(800);
  const add = p.locator('.sx-add, [data-v2addslot], [data-sxadd]').first();
  if (!(await add.count())) { console.log('no add spot found'); console.log(await p.evaluate(() => [...document.querySelectorAll('.tm-six button')].map(b => b.className + '|' + b.textContent.trim().slice(0, 20)).join('\n'))); await b.close(); return; }
  await add.tap(); await p.waitForTimeout(700);
  const inp = p.locator('.np-sheet input').first(); await inp.tap(); await inp.type('Slow'); await p.waitForTimeout(500);
  console.log(JSON.stringify(await p.evaluate(() => { const s = document.querySelector('.np-sheetwrap .np-sheet'), i = s && s.querySelector('input'), r = s && s.getBoundingClientRect(), ir = i && i.getBoundingClientRect();
    return {kbo: document.documentElement.classList.contains('kbo'), vh: innerHeight, sheet: r && [Math.round(r.top), Math.round(r.bottom), Math.round(r.height)], input: ir && [Math.round(ir.top), Math.round(ir.bottom)], hits: s && s.querySelectorAll('.np-hit,button[data-v2add],button[data-sxpick]').length, docW: document.documentElement.scrollWidth}; })));
  await p.screenshot({path: O + '/add-sheet.png'});
  if (errs.length) console.log('errors', errs.slice(0, 3)); await b.close(); })();
