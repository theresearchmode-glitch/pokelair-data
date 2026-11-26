// Mobile 4G page-speed benchmark (job 19 / job 14 Part A; manual Playwright run).
// Measures FCP, LCP, TBT (long tasks > 50 ms), JS parse/eval time, and wire bytes at 390x844, 4x CPU, 4G (9 Mbps / 40 ms RTT).
// Usage: PAGE=app/dist/v2.html node experiments/speed.mjs
//    or: URL=http://127.0.0.1:8787/ node experiments/speed.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const ROUTES = ['#home', '#team', '#calc', '#meta', '#pokemon=Incineroar'];
const RUNS = +(process.env.RUNS || 3);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

function startStatic(dir) {
  const srv = http.createServer((req, res) => {
    const clean = (req.url || '/').split('?')[0];
    let fp = path.join(dir, clean === '/' ? 'v2.html' : clean);
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(dir, 'v2.html');
    const ext = path.extname(fp);
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    fs.createReadStream(fp).pipe(res);
  });
  return new Promise(resolve => srv.listen(0, '127.0.0.1', () => resolve({srv, url: `http://127.0.0.1:${srv.address().port}/`})));
}

const median = arr => { const s = arr.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

let server = null;
let baseUrl = process.env.URL || '';
if (!baseUrl) {
  const pagePath = process.env.PAGE ? (process.env.PAGE.startsWith('/') ? process.env.PAGE : ROOT + process.env.PAGE) : ROOT + 'app/dist/v2.html';
  if (!fs.existsSync(pagePath)) throw new Error(`Page not found: ${pagePath}`);
  const st = await startStatic(path.dirname(pagePath));
  server = st.srv;
  baseUrl = st.url + path.basename(pagePath);
}

const browser = await chromium.launch();
try {
  console.log(`Target: ${baseUrl} (${RUNS} runs/route, 390x844, 4x CPU, 9 Mbps / 40 ms RTT)\n`);
  console.log('Route                  | FCP ms | LCP ms | TBT ms | Parse ms | Wire KB');
  console.log('-----------------------+--------+--------+--------+----------+--------');

  for (const route of ROUTES) {
    const samples = [];
    for (let i = 0; i < RUNS; i++) {
      const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 3});
      const pg = await ctx.newPage();
      const cdp = await ctx.newCDPSession(pg);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 40,
        downloadThroughput: (9 * 1024 * 1024) / 8,
        uploadThroughput: (1.5 * 1024 * 1024) / 8
      });
      await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});

      let wireBytes = 0;
      cdp.on('Network.loadingFinished', ev => { wireBytes += ev.encodedDataLength || 0; });

      await pg.addInitScript(() => {
        localStorage.setItem('cc2.welcomed', '"1"');
        window.__perf = {lcp: 0, tbt: 0};
        try {
          new PerformanceObserver(list => {
            for (const e of list.getEntries()) window.__perf.lcp = e.startTime;
          }).observe({type: 'largest-contentful-paint', buffered: true});
          new PerformanceObserver(list => {
            for (const e of list.getEntries()) if (e.duration > 50) window.__perf.tbt += e.duration - 50;
          }).observe({type: 'longtask', buffered: true});
        } catch (e) {}
      });

      await pg.goto(baseUrl + route, {waitUntil: 'networkidle', timeout: 30000}).catch(() => {});
      await pg.waitForTimeout(800);

      const m = await pg.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] || {};
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        return {
          fcp: fcpEntry ? fcpEntry.startTime : 0,
          lcp: (window.__perf && window.__perf.lcp) || 0,
          tbt: (window.__perf && window.__perf.tbt) || 0,
          parse: Math.max(0, (nav.domContentLoadedEventEnd || 0) - (nav.responseEnd || 0))
        };
      });
      samples.push({...m, wireKb: wireBytes / 1024});
      await ctx.close();
    }

    const row = {
      fcp: Math.round(median(samples.map(x => x.fcp))),
      lcp: Math.round(median(samples.map(x => x.lcp))),
      tbt: Math.round(median(samples.map(x => x.tbt))),
      parse: Math.round(median(samples.map(x => x.parse))),
      wireKb: Math.round(median(samples.map(x => x.wireKb)))
    };
    console.log(
      `${route.padEnd(22)} | ${String(row.fcp).padStart(6)} | ${String(row.lcp).padStart(6)} | ${String(row.tbt).padStart(6)} | ${String(row.parse).padStart(8)} | ${String(row.wireKb).padStart(7)}`
    );
  }
} finally {
  await browser.close();
  if (server) server.close();
}
