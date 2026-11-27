// speed-check.mjs (Kip job 55, Nov 26): Core Web Vitals & transfer budget check over the 10 key public pages.
// Expects the public build in app/dist/ (node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public)
// or SPEED_DIST=<folder>.
// Runs each page in a fresh browser context at 390x844 (mobile) with Playwright CDP:
//   - CPU 4x slowdown (Emulation.setCPUThrottlingRate)
//   - Fast 3G network (1.6 Mbps down, 750 kbps up, 150 ms RTT)
//   - Local HTTP server with gzip for text assets (matching Cloudflare Pages transfer)
// Measures: LCP (ms), CLS, total transfer bytes, request count, and top 3 largest resources.
// Budgets (strict — do not loosen): LCP < 2500 ms, CLS < 0.1, first-load transfer < 1.5 MB (1,572,864 bytes).
// Run: SPEED_DIST=site node experiments/page-speed-check.mjs  (after `node public-site.mjs`, or `node experiments/page-speed-check.mjs` against app/dist/)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.resolve(process.env.SPEED_DIST || path.join(ROOT, 'app/dist'));

const BUDGET = {lcpMs: 2500, cls: 0.1, transferBytes: 1.5 * 1024 * 1024};
const PAGES = [
  ['Home', '/'],
  ['Pokémon A-Z', '/pokemon'],
  ['Pokémon: Garchomp', '/pokemon/garchomp'],
  ['Pokémon: Incineroar', '/pokemon/incineroar'],
  ['Pokémon: Mega Absol', '/pokemon/absol-mega'],
  ['Natures', '/natures'],
  ['Popular Sets (items)', '/sets'],
  ['Meta / Ratings', '/meta'],
  ['News & Gifts', '/gifts'],
  ['My Team', '/team']
];

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.log(`  FAIL  public build not found in ${DIST} (run: node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public)`);
  process.exit(1);
}

const mime = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2'};
const compressible = new Set(['.html', '.js', '.css', '.json', '.svg']);
const gzCache = new Map();

const srv = http.createServer((req, res) => {
  try {
    const raw = decodeURIComponent((req.url || '/').split('?')[0]);
    let f = path.join(DIST, raw === '/' ? '/index.html' : raw);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = f + '.html';
    if (!fs.existsSync(f) && raw.startsWith('/art/')) f = path.join(ROOT, 'app/src/v2', raw);
    if (!fs.existsSync(f) && raw.startsWith('/art-s/')) f = path.join(ROOT, 'app/src/v2/art', raw.slice(7));
    if (!fs.existsSync(f) && raw.startsWith('/data/')) {
      const k = raw.slice(6).replace(/\.json$/, '');
      const map = {results: 'limitless.json', doubles_tour: 'meta_tour.json', doubles: 'meta_ladder.json', doubles_ingame: 'meta_ingame.json'};
      const alt = path.join(ROOT, 'out', map[k] || (k + '.json'));
      if (fs.existsSync(alt)) f = alt;
    }
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    const ext = path.extname(f);
    const ae = String(req.headers['accept-encoding'] || '');
    if (compressible.has(ext) && /\bgzip\b/.test(ae)) {
      let buf = gzCache.get(f);
      if (!buf) { buf = zlib.gzipSync(fs.readFileSync(f), {level: 6}); gzCache.set(f, buf); }
      res.writeHead(200, {'Content-Type': mime[ext] || 'application/octet-stream', 'Content-Encoding': 'gzip', 'Content-Length': buf.length});
      res.end(buf);
    } else {
      const buf = fs.readFileSync(f);
      res.writeHead(200, {'Content-Type': mime[ext] || 'application/octet-stream', 'Content-Length': buf.length});
      res.end(buf);
    }
  } catch (e) { res.writeHead(500); res.end('500'); }
});

let fails = 0;
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };
const results = [];
let b = null;

try {
  await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const port = srv.address().port;
  b = await chromium.launch();

  for (const [label, route] of PAGES) {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    const pg = await ctx.newPage();
    const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
    // Fast 3G: 1.6 Mbps down (200 KB/s), 750 kbps up (93.75 KB/s), 150 ms RTT
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150, downloadThroughput: 200 * 1024, uploadThroughput: 93.75 * 1024
    });

    const reqMap = new Map();
    cdp.on('Network.requestWillBeSent', e => {
      reqMap.set(e.requestId, {url: e.request.url, encoded: 0});
    });
    cdp.on('Network.loadingFinished', e => {
      const r = reqMap.get(e.requestId);
      if (r) r.encoded = e.encodedDataLength || 0;
    });

    await pg.addInitScript(() => {
      window.__lcp = 0;
      window.__lcpEl = '';
      window.__cls = 0;
      try {
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) {
            if (e.startTime > window.__lcp) {
              window.__lcp = e.startTime;
              const el = e.element;
              window.__lcpEl = el ? `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.') : ''}` : '';
            }
          }
        }).observe({type: 'largest-contentful-paint', buffered: true});
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({type: 'layout-shift', buffered: true});
      } catch (e) {}
    });

    try {
      const url = `http://127.0.0.1:${port}${route}`;
      pg.once('domcontentloaded', () => { cdp.send('Emulation.setCPUThrottlingRate', {rate: 4}).catch(() => {}); });
      await pg.goto(url, {waitUntil: 'domcontentloaded', timeout: 45000});
      await pg.waitForFunction(() => document.querySelector('#main h1, main h1') && !document.querySelector('.np-load'), null, {timeout: 35000}).catch(() => {});
      await pg.evaluate(() => document.fonts.ready);
      await pg.waitForTimeout(800);

      const vitals = await pg.evaluate(() => ({lcp: Math.round(window.__lcp || 0), lcpEl: window.__lcpEl || '', cls: +(window.__cls || 0).toFixed(4)}));
      const reqs = [...reqMap.values()].filter(r => r.url.startsWith('http'));
      const totalBytes = reqs.reduce((s, r) => s + r.encoded, 0);
      const top3 = [...reqs].sort((a, b) => b.encoded - a.encoded).slice(0, 3)
        .map(r => `${r.url.replace(/^http:\/\/127\.0\.0\.1:\d+/, '')} (${(r.encoded / 1024).toFixed(1)} KB)`);

      const row = {label, route, lcpMs: vitals.lcp, lcpEl: vitals.lcpEl, cls: vitals.cls, transferKB: +(totalBytes / 1024).toFixed(1), transferBytes: totalBytes, reqs: reqs.length, top3};
      results.push(row);

      const probs = [];
      if (!(row.lcpMs > 0 && row.lcpMs < BUDGET.lcpMs)) probs.push(`LCP ${row.lcpMs}ms >= ${BUDGET.lcpMs}ms (${row.lcpEl})`);
      if (!(row.cls < BUDGET.cls)) probs.push(`CLS ${row.cls} >= ${BUDGET.cls}`);
      if (!(row.transferBytes < BUDGET.transferBytes)) probs.push(`transfer ${(row.transferBytes / 1048576).toFixed(2)} MB >= 1.50 MB`);
      ok(probs.length === 0, `${label} (${route}): LCP=${row.lcpMs}ms (${row.lcpEl}), CLS=${row.cls}, transfer=${row.transferKB} KB (${row.reqs} reqs) :: ${probs.length ? probs.join('; ') : 'within budget'} | top: ${top3.join(', ')}`);
    } catch (e) {
      ok(false, `${label} (${route}): error ${String(e && e.message || e).split('\n')[0]}`);
    } finally {
      await ctx.close();
    }
  }
} catch (e) {
  ok(false, `speed-check runner error: ${String(e && e.message || e).split('\n')[0]}`);
} finally {
  if (b) await b.close().catch(() => {});
  try { srv.close(); } catch (e) {}
}

console.log('\nJSON_RESULTS:' + JSON.stringify(results));
console.log(fails ? `speed-check: ${fails} FAILED` : 'speed-check: ALL PASSED');
process.exit(fails ? 1 : 0);
