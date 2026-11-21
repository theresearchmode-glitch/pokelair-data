// Shoots the real built Damage Calc's scene in every weather and terrain. With SCENE=path, the scene art (.arn-bg) is replaced by
// that module's art (a look-only mock-up: nothing in the site changes). Usage: node shoot.mjs <outname> [scene.mjs]
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
const REPO = 'C:/Users/simra/code/pl-mascot'; const { chromium } = createRequire(REPO + '/package.json')('playwright');
const PAGE = path.resolve(REPO, 'app/dist/v2.html'), OUT = process.argv[2], ART = process.argv[3];
const art = ART ? await import(pathToFileURL(path.resolve(ART)).href + '?' + Date.now()) : null;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const STATES = [['', ''], ['sun', ''], ['rain', ''], ['sand', ''], ['snow', ''], ['', 'grassy'], ['', 'electric'], ['', 'psychic'], ['', 'misty'], ['rain', 'electric'], ['sun', 'grassy'], ['snow', 'misty']];
const NM = { '': 'Clear', sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow' }, TN = { '': 'no terrain', grassy: 'Grassy', electric: 'Electric', psychic: 'Psychic', misty: 'Misty' };
const b = await chromium.launch(); const shots = [];
for (const [dev, o] of [['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
  const c = await b.newContext(o), p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', 'night'); } catch (e) {} });
  await p.goto('file://' + PAGE + '#calc'); await p.waitForSelector('.arn-scene', { timeout: 20000 }); await p.waitForTimeout(1500);
  for (const [w, t] of STATES) { if (dev === 'desktop' && !['sun|', 'rain|electric', 'snow|', '|psychic'].includes(w + '|' + t)) continue;
    await p.click(`[data-dcw="${w}"]`); await p.waitForTimeout(250); await p.click(`[data-dcterr="${t}"]`); await p.waitForTimeout(400);
    if (art) await p.evaluate(h => { const bg = document.querySelector('.arn-bg'); bg.outerHTML = h; }, art.scene(w || 'clear', t || 'none'));
    if (art && art.CSS) await p.evaluate(css => { if (!document.getElementById('mockcss')) { const s = document.createElement('style'); s.id = 'mockcss'; s.textContent = css; document.head.appendChild(s); } }, art.CSS + (art.CSS2 || '') + (art.CSS3 || '') + (art.CSS4 || '') + (art.CSS5 || '') + (art.CSS6 || ''));
    if (art && art.JS) await p.evaluate(art.JS);
    await p.evaluate(() => document.fonts.ready); await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(300);
    const el = await p.$('.arn-scene'); const r = await el.boundingBox();
    shots.push({ dev, label: `${NM[w]} · ${TN[t]}`, size: `${Math.round(r.width)}x${Math.round(r.height)}`, src: 'data:image/png;base64,' + (await el.screenshot()).toString('base64') }); }
  await c.close(); }
const cell = s => `<figure style="margin:0"><figcaption style="font:800 17px system-ui;margin-bottom:8px">${s.label}</figcaption><img src="${s.src}" style="display:block;width:100%;border-radius:12px"></figure>`;
const s = await b.newPage({ viewport: { width: 2060, height: 900 } });
await s.setContent(`<body style="margin:0;padding:28px;background:#EFECE6"><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:22px 16px">${shots.filter(x => x.dev === 'phone').map(cell).join('')}</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:26px">${shots.filter(x => x.dev === 'desktop').map(cell).join('')}</div></body>`);
await s.waitForTimeout(600); await s.screenshot({ path: OUT, fullPage: true });
for (const x of shots) fs.writeFileSync(OUT.replace(/\.png$/, '') + '-' + x.dev + '-' + x.label.replace(/[^a-z]+/gi, '-').toLowerCase() + '.png', Buffer.from(x.src.split(',')[1], 'base64'));
await b.close(); console.log(shots.map(x => x.dev + ' ' + x.label + ' ' + x.size).join('\n'));
