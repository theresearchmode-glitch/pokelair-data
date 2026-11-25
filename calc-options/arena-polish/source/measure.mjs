// Measures the mock-up scene at several widths: buttons under 44px, sideways scroll, words cut off inside the scene's controls,
// plates/verdict overlapping each other. Also saves before/after pictures for Sim.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
const REPO = 'C:/Users/simra/code/pl-mascot'; const { chromium } = createRequire(REPO + '/package.json')('playwright');
const PAGE = path.resolve(REPO, 'app/dist/v2.html'), art = await import(pathToFileURL(path.resolve(process.argv[2])).href);
const b = await chromium.launch(); const out = [];
for (const W of [320, 390, 820, 1100, 1440]) for (const [w, t] of [['sun', ''], ['rain', 'electric'], ['', 'psychic']]) {
  const c = await b.newContext({ viewport: { width: W, height: 900 }, hasTouch: W < 1000 }), p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#calc'); await p.waitForSelector('.arn-scene', { timeout: 20000 }); await p.waitForTimeout(1200);
  await p.click(`[data-dcw="${w}"]`); await p.waitForTimeout(200); await p.click(`[data-dcterr="${t}"]`); await p.waitForTimeout(300);
  if (!process.argv[3]) await p.evaluate(h => { document.querySelector('.arn-bg').outerHTML = h; }, art.scene(w || 'clear', t || 'none'));
  await p.evaluate(css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }, art.CSS + art.CSS2 + art.CSS3 + (art.CSS4 || '') + (art.CSS5 || '') + (art.CSS6 || '')); await p.evaluate(art.JS);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const m = await p.evaluate(() => { const S = document.querySelector('.arn-scene'), small = [], cut = [], hit = [];
    S.querySelectorAll('button').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.height < 43.5 || r.width < 43.5)) small.push((e.textContent.trim() || e.getAttribute('aria-label') || '?').slice(0, 20) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); });
    S.querySelectorAll('.arn-pills button,.arn-plate b,.arn-hpt,.arn-verdict p,.arn-tag b').forEach(e => { if (e.scrollWidth > e.clientWidth + 1) cut.push(e.textContent.trim().slice(0, 20)); });
    const box = [...S.querySelectorAll('.arn-plate,.arn-verdict,.arn-tag,.arn-swap,.arn-pills')].filter(e => e.getClientRects().length).map(e => [e.className.split(' ')[0] + (e.className.includes('dp') ? '-d' : e.className.includes('ap') ? '-a' : ''), e.getBoundingClientRect()]);
    for (let i = 0; i < box.length; i++) for (let j = i + 1; j < box.length; j++) { const a = box[i][1], c = box[j][1]; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) hit.push(box[i][0] + '/' + box[j][0]); }
    return { sw: document.documentElement.scrollWidth > innerWidth, small, cut, hit }; });
  out.push(`${W} ${w || 'clear'}+${t || 'none'}: ${m.sw ? 'SIDEWAYS ' : ''}small ${m.small.length}${m.small.length ? ' (' + m.small.join(', ') + ')' : ''}, cut ${m.cut.length}${m.cut.length ? ' (' + m.cut.join(', ') + ')' : ''}, overlaps ${m.hit.length}${m.hit.length ? ' (' + m.hit.join(', ') + ')' : ''}`);
  await c.close(); }
await b.close(); console.log(out.join('\n'));
