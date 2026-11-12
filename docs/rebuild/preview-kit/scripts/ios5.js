// iPhone WebKit sweep of My Box, Compare, Team Sheet and the empty My Team: sideways scroll at several widths; My Box add sheet while typing
const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/redesign/foundation.html';
(async () => { const b = await pw.webkit.launch(); const errs = [];
  for (const h of ['box', 'compare', 'sheet', 'team-empty']) { const row = [];
    for (const w of [300, 320, 375, 390, 430]) { const c = await b.newContext({...pw.devices['iPhone 13'], viewport: {width: w, height: 800}, colorScheme: 'dark'}); const p = await c.newPage(); p.on('pageerror', e => errs.push(h + ': ' + e.message));
      await p.goto('file://' + F + '#' + h); await p.waitForTimeout(4000); await p.evaluate(() => scrollTo(400, 0));
      row.push(w + ':' + (await p.evaluate(() => (document.documentElement.scrollWidth - innerWidth) + '/' + scrollX))); await c.close(); }
    console.log(h.padEnd(11), 'extra width/scrollX', row.join('  ')); }
  const c = await b.newContext({...pw.devices['iPhone 13'], colorScheme: 'dark'}); const p = await c.newPage();
  await p.goto('file://' + F + '#box'); await p.waitForTimeout(4000);
  const add = p.locator('[data-bxadd]').first(); if (await add.count()) { await add.tap(); await p.waitForTimeout(600); const i = p.locator('.np-sheet input').first(); await i.tap(); await i.type('Garch'); await p.waitForTimeout(400);
    console.log('box add sheet', JSON.stringify(await p.evaluate(() => { const s = document.querySelector('.np-sheetwrap .np-sheet').getBoundingClientRect(), ir = document.querySelector('.np-sheet input').getBoundingClientRect(); return {kbo: document.documentElement.classList.contains('kbo'), sheet: [Math.round(s.top), Math.round(s.bottom)], input: [Math.round(ir.top), Math.round(ir.bottom)], font: getComputedStyle(document.querySelector('.np-sheet input')).fontSize, vh: innerHeight, docW: document.documentElement.scrollWidth}; }))); }
  else console.log('no box add button');
  if (errs.length) console.log('errors', errs.slice(0, 3)); await b.close(); })();
