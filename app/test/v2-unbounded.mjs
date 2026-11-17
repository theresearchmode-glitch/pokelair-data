// Type rule (Sim, Nov 11): Unbounded only at 15px and up; smaller text is Instrument Sans (design audit Nov 16, P2 #2 found 22
// rules at 13px). Opens every page with the sample six, by day and night, at a phone and a desktop width, and lists any visible
// text drawn in Unbounded under 15px (computed style, so classes set in the HTML count too). Exit 1 if any is found.
//   PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 390, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const routes = await p.evaluate(() => Object.keys(V2.pages).filter(r => !/^(sheet|team-empty|coming|gallery)$/.test(r)));
const hits = new Map();
for (const theme of ['day', 'night']) for (const w of [390, 1440]) { await p.setViewportSize({width: w, height: 900});
  for (const r of routes) { await p.evaluate(([r, t]) => { document.documentElement.dataset.theme = t; location.hash = '#' + r; }, [r, theme === 'night' ? 'night' : 'day']); await p.waitForTimeout(500);
    const found = await p.evaluate(() => { const out = [];
      for (const e of document.querySelectorAll('#app *, .np-head *, .np-foot *')) { if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) continue;
        const cs = getComputedStyle(e); if (!/Unbounded/i.test(cs.fontFamily.split(',')[0])) continue; const px = parseFloat(cs.fontSize); if (px >= 15) continue;
        const cls = (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') || e.nodeName.toLowerCase();
        const par = e.parentElement && typeof e.parentElement.className === 'string' && e.parentElement.className ? '.' + e.parentElement.className.trim().split(/\s+/)[0] + ' ' : '';
        out.push([par + cls, px, e.textContent.trim().slice(0, 24)]); }
      return out; });
    for (const [sel, px, t] of found) { const k = sel + ' @' + px + 'px'; if (!hits.has(k)) hits.set(k, {where: new Set(), t}); hits.get(k).where.add(`${r} ${w} ${theme}`); } } }
await b.close();
for (const [k, v] of hits) console.log(`  ${k}  "${v.t}"  on ${[...v.where].slice(0, 3).join(', ')}${v.where.size > 3 ? ` +${v.where.size - 3} more` : ''}`);
console.log(`v2-unbounded: ${hits.size ? hits.size + ' kinds of text in Unbounded under 15px' : 'none'} across ${routes.length} pages`);
process.exit(hits.size ? 1 : 0);
