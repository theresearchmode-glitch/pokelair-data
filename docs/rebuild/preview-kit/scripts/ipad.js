const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = process.env.F;
(async () => { const b = await pw.chromium.launch();
  for (const w of [700, 768, 820, 900, 1024, 1179, 1180, 1440, 390]) { const p = await b.newPage({viewport: {width: w, height: 900}}); await p.goto('file://' + F + '#team'); await p.waitForTimeout(9000);
    const r = await p.evaluate(() => { const g = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
      const W = document.querySelector('.tm-work').getBoundingClientRect(), kids = [...document.querySelectorAll('.tm-work [class*="tm-"][id], .tm-work > *')];
      const ends = {}; for (const s of ['#mu', '#sugs', '#checks', '.tm-yg', '.tm-mus', '.tm-sgs', '.tm-cks']) { const e = document.querySelector(s); if (e) { const b = e.getBoundingClientRect(); ends[s] = [Math.round(b.left), Math.round(b.bottom + scrollY)]; } }
      return {doc: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth - innerWidth, ends}; });
    console.log(w, JSON.stringify(r)); await p.close(); }
  await b.close(); })();
