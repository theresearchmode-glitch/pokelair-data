// first-screen-guard.mjs (Job 64c fix, Nov 26): regression guard for two first-screen bugs caught in HH's review of 6950745e:
//   1. Fallback font line overlap: with .woff2 blocked, every visible multi-line .u headline on / and /pokemon/garchomp
//      at 390x844 and 1440x900 must have non-overlapping line boxes (Range.getClientRects).
//   2. Throttled CLS: on / and /team at 390x844 under Fast 3G (1.6 Mbps / 750 kbps / 150 ms RTT) + 4x CPU, total CLS
//      through load + hydration must stay strictly under 0.1.
// Run: SPEED_DIST=site node experiments/first-screen-guard.mjs  (after `node public-site.mjs`, or against app/dist/)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.env.SPEED_DIST || path.join(ROOT, 'app/dist'));
const T = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png'};
const GZ = new Set(['.html', '.js', '.css', '.json', '.svg']);

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error(`first-screen-guard: build not found in ${DIST}`);
  process.exit(1);
}

const gzCache = new Map();
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent((q.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  let f = path.join(DIST, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + '.html') ? f + '.html' : '';
  if (!f) { r.writeHead(404); return r.end('404'); }
  const ext = path.extname(f);
  if (GZ.has(ext) && /\bgzip\b/.test(String(q.headers['accept-encoding'] || ''))) {
    let g = gzCache.get(f);
    if (!g) { g = zlib.gzipSync(fs.readFileSync(f), {level: 6}); gzCache.set(f, g); }
    r.writeHead(200, {'content-type': T[ext] || 'application/octet-stream', 'content-encoding': 'gzip', 'content-length': g.length});
    return r.end(g);
  }
  const b = fs.readFileSync(f);
  r.writeHead(200, {'content-type': T[ext] || 'application/octet-stream', 'content-length': b.length});
  r.end(b);
});

await new Promise(res => srv.listen(0, '127.0.0.1', res));
const base = `http://127.0.0.1:${srv.address().port}`;
const br = await chromium.launch({args: ['--disable-dev-shm-usage']});
let fails = 0;

// 1. Font fallback overlap guard (.woff2 blocked)
for (const [rt, w, h] of [['/', 390, 844], ['/', 1440, 900], ['/pokemon/garchomp', 390, 844], ['/pokemon/garchomp', 1440, 900]]) {
  const c = await br.newContext({viewport: {width: w, height: h}});
  const pg = await c.newPage();
  await pg.route('**/*.woff2', route => route.abort());
  await pg.goto(base + rt, {waitUntil: 'domcontentloaded', timeout: 30000});
  await pg.waitForTimeout(400);
  const bad = await pg.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('#main .k-h1.u, #main h1.u, #main .f3-h1')) {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || el.closest('.vh')) continue;
      const r0 = el.getBoundingClientRect(); if (r0.width < 20 || r0.height < 20) continue;
      const range = document.createRange(); range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter(x => x.width > 1 && x.height > 1).sort((a, b) => a.top - b.top);
      const lines = [];
      for (const rc of rects) {
        const last = lines[lines.length - 1];
        if (last && Math.abs((rc.top + rc.bottom) / 2 - (last.top + last.bottom) / 2) < Math.min(rc.height, last.height) * 0.4) {
          last.top = Math.min(last.top, rc.top); last.bottom = Math.max(last.bottom, rc.bottom);
        } else lines.push({top: rc.top, bottom: rc.bottom, height: rc.height});
      }
      if (lines.length < 2) continue;
      let maxOv = 0;
      for (let i = 0; i < lines.length - 1; i++) maxOv = Math.max(maxOv, lines[i].bottom - lines[i + 1].top);
      if (maxOv > 0.5) out.push({sel: el.tagName + '.' + [...el.classList].join('.'), lines: lines.length, maxOv: +maxOv.toFixed(1)});
    }
    return out;
  });
  if (bad.length) { fails++; console.log(`  FAIL  font-overlap ${rt} ${w}x${h}: ${JSON.stringify(bad)}`); }
  else console.log(`  PASS  font-overlap ${rt} ${w}x${h}: 0 px overlap`);
  await c.close();
}

// 2. Throttled CLS guard (390x844, Fast 3G + 4x CPU)
for (const rt of ['/', '/team']) {
  const c = await br.newContext({viewport: {width: 390, height: 844}});
  const pg = await c.newPage();
  await pg.addInitScript(() => {
    window.__shifts = [];
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        const srcs = (e.sources || []).map(s => {
          const n = s.node;
          const id = n ? (n.tagName + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : 'null';
          return {node: id, prev: [Math.round(s.previousRect.y), Math.round(s.previousRect.height)], cur: [Math.round(s.currentRect.y), Math.round(s.currentRect.height)]};
        });
        window.__shifts.push({t: Math.round(e.startTime), val: +e.value.toFixed(4), srcs});
      }
    }).observe({type: 'layout-shift', buffered: true});
  });
  const cdp = await c.newCDPSession(pg);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
  await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 200 * 1024, uploadThroughput: 93.75 * 1024});
  pg.once('domcontentloaded', () => { cdp.send('Emulation.setCPUThrottlingRate', {rate: 4}).catch(() => {}); });
  await pg.goto(base + rt, {waitUntil: 'load', timeout: 45000});
  await pg.waitForTimeout(3000);
  const shifts = await pg.evaluate(() => window.__shifts);
  const cls = shifts.reduce((s, x) => s + x.val, 0);
  if (cls >= 0.1) { fails++; console.log(`  FAIL  throttled-CLS ${rt}: CLS=${cls.toFixed(4)} (>= 0.1) | shifts=${JSON.stringify(shifts)}`); }
  else console.log(`  PASS  throttled-CLS ${rt}: CLS=${cls.toFixed(4)} (< 0.1)`);
  await c.close();
}

await br.close();
srv.close();
console.log(`first-screen-guard: ${fails ? fails + ' FAILED' : 'ALL PASSED'}`);
process.exit(fails ? 1 : 0);
