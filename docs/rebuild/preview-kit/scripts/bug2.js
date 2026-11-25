const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = process.env.F || '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/redesign/foundation.html';
(async () => { const b = await pw.webkit.launch();
  for (const w of [390, 700, 768, 820, 900, 1024, 1180, 1440]) { const c = await b.newContext(w < 700 ? {...pw.devices['iPhone 13']} : {viewport: {width: w, height: 900}}); const p = await c.newPage();
    await p.goto('file://' + F + '#team'); await p.waitForTimeout(9000);
    const r = await p.evaluate(() => { const jumps = [...document.querySelectorAll('[data-tmjump]')].map(a => a.textContent.trim() + '>' + a.dataset.tmjump + (document.getElementById(a.dataset.tmjump) ? '' : ' MISSING'));
      const sw = [...document.querySelectorAll('.tm-sug li')].map(li => { const s = li.querySelector('[class*="sw"]') || li; const b = s.getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height); });
      const narrow = [...document.querySelectorAll('.tm-sug li *')].filter(e => e.children.length === 0 && e.textContent.trim().length > 3 && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < 20).map(e => e.className + ':' + e.textContent.trim()).slice(0, 4);
      return {jumps, sw, narrow}; });
    // tap the Matchups jump link and see where it lands
    const j = p.locator('[data-tmjump]').filter({hasText: /Matchups/}).first(); let land = 'no link';
    if (await j.count()) { await j.click(); await p.waitForTimeout(1200); land = await p.evaluate(() => { const t = document.getElementById(document.querySelector('[data-tmjump*="mu"],[data-tmjump]').dataset.tmjump); const all = [...document.querySelectorAll('[data-tmjump]')]; const m = all.find(a => /Matchups/.test(a.textContent)); const el = document.getElementById(m.dataset.tmjump); return {scrollY: Math.round(scrollY), targetTop: el ? Math.round(el.getBoundingClientRect().top) : null, cls: el && el.className}; }); }
    console.log(w, JSON.stringify(r), JSON.stringify(land)); await c.close(); }
  await b.close(); })();
