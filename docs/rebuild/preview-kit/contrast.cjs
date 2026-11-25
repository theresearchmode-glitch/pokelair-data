// Contrast sweep: for every visible text element on flat (solid) backgrounds, flag ratio < 4.5 (< 3 for text 24px+ or 19px bold).
// node contrast.cjs <page.html> <light|night> [width]
const {chromium} = require('playwright');
const PAGES = ['home', 'team', 'build', 'battle', 'tournaments', 'events', 'archetypes', 'weekly', 'track', 'meta', 'usage', 'sets', 'compare', 'gauntlet', 'practice', 'speed', 'calc', 'types', 'box'];
(async () => {
  const [pf, th, w] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: +(w || 1280), height: 900}});
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th);
  let total = 0;
  for (const h of PAGES) {
    await p.goto('file://' + pf + '#' + h); await p.waitForTimeout(1800);
    const bad = await p.evaluate(() => {
      const L = c => { const srgb = /^color\(srgb/.test(c), m = (c.replace(/^color\(srgb/, '').match(/[\d.]+/g) || [0, 0, 0]).map(Number); const a = m.length > 3 ? m[3] : 1; return {l: m.slice(0, 3).map(v => { if (!srgb) v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }), a}; };
      const lum = x => .2126 * x.l[0] + .7152 * x.l[1] + .0722 * x.l[2];
      const bgOf = e => { while (e) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none' || cs.filter !== 'none' || +cs.opacity < 1) return null; const c = L(cs.backgroundColor); if (c.a >= .99) return c; if (c.a > 0) return null; e = e.parentElement; } return L(getComputedStyle(document.body).backgroundColor); };
      const out = [];
      document.querySelectorAll('body *').forEach(e => {
        if (!e.getClientRects().length) return;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < 1) return;
        const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
        const fg = L(cs.color); if (fg.a < .99) return;
        const bg = bgOf(e); if (!bg) return;
        const a = lum(fg), c = lum(bg), ratio = (Math.max(a, c) + .05) / (Math.min(a, c) + .05);
        const size = parseFloat(cs.fontSize), big = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
        if (ratio < (big ? 3 : 4.5)) out.push(ratio.toFixed(2) + ' "' + e.textContent.trim().slice(0, 28) + '" .' + String(e.className).split(' ')[0] + ' ' + cs.color);
      });
      return [...new Set(out)].slice(0, 6);
    });
    if (bad.length) { total += bad.length; console.log(h + ': ' + bad.join(' | ')); }
  }
  console.log('flagged', total);
  await b.close();
})();
