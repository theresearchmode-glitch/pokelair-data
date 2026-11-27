// Fail-first guard for M13: verifies prerendered pages with /routes/*.js delayed 2 s
// never show a blank screen and keep CLS <= 0.02 at iPhone 15 viewport (393x659).
// Usage:
//   SITE=site-m13-new node experiments/m13-prerender-cls-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium, webkit, devices} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.resolve(ROOT, process.env.SITE || 'site-m13-new');
if (!fs.existsSync(path.join(SITE, 'index.html'))) {
  console.error('m13-prerender-cls-test: missing site dir ' + SITE + ' (run node public-site.mjs <dir> first)');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

function resolveFile(dir, urlPath) {
  const clean = urlPath.replace(/^\/+|\/+$/g, '');
  if (!clean) return path.join(dir, 'index.html');
  const asDir = path.join(dir, clean, 'index.html');
  if (fs.existsSync(asDir)) return asDir;
  const asHtml = path.join(dir, clean + '.html');
  if (fs.existsSync(asHtml)) return asHtml;
  const exact = path.join(dir, clean);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return exact;
  return null;
}

const srv = http.createServer((req, rsp) => {
  const u = (req.url || '/').split('?')[0];
  const f = resolveFile(SITE, u);
  if (!f) { rsp.writeHead(404); rsp.end('not found'); return; }
  rsp.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(rsp);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const baseUrl = `http://127.0.0.1:${srv.address().port}`;

const PAGES = ['/', '/team', '/meta', '/pokemon/garchomp', '/calc'];
let passes = 0, fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); cond ? passes++ : fails++; };

// 1. Chromium at iPhone 15 viewport (393x659): measures true Layout Instability CLS + no blank screen
const cb = await chromium.launch({headless: true});
try {
  for (const cur of PAGES) {
    const ctx = await cb.newContext({
      viewport: {width: 393, height: 659},
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
      reducedMotion: 'reduce',
    });
    const p = await ctx.newPage();
    await p.route('**/routes/*.js*', async route => {
      await new Promise(r => setTimeout(r, 2000));
      await route.continue();
    });
    await p.addInitScript(() => {
      window.__cls = 0;
      window.__shifts = [];
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) {
            window.__cls += e.value;
            window.__shifts.push({
              t: Math.round(e.startTime),
              v: +e.value.toFixed(4),
              els: (e.sources || []).map(s => s.node ? s.node.tagName + '.' + (s.node.className || '') : 'null'),
            });
          }
        }
      }).observe({type: 'layout-shift', buffered: true});
    });
    await p.goto(baseUrl + cur, {waitUntil: 'domcontentloaded', timeout: 30000});
    await p.waitForTimeout(300);
    const early = await p.evaluate(() => {
      const m = document.getElementById('main');
      return {h: m ? Math.round(m.getBoundingClientRect().height) : 0, len: m ? m.innerText.replace(/\s+/g, ' ').trim().length : 0};
    });
    await p.waitForTimeout(3200);
    const late = await p.evaluate(() => ({
      cls: +window.__cls.toFixed(4),
      shifts: window.__shifts,
      len: (document.getElementById('main')?.innerText || '').replace(/\s+/g, ' ').trim().length,
    }));
    await ctx.close();
    ok(early.len > 20 && early.h >= 659 && late.cls <= 0.02,
      `chromium 393x659 ${cur}: earlyH=${early.h}px, earlyLen=${early.len}, CLS=${late.cls}${late.shifts.length ? ' shifts=' + JSON.stringify(late.shifts) : ''}`);
  }
} finally {
  await cb.close();
}

// 2. WebKit iPhone 15: no blank screen + footer starts below viewport (>= 659px) before /routes/*.js arrives
const wb = await webkit.launch({headless: true});
try {
  for (const cur of PAGES) {
    const ctx = await wb.newContext({...devices['iPhone 15'], reducedMotion: 'reduce'});
    const p = await ctx.newPage();
    await p.route('**/routes/*.js*', async route => {
      await new Promise(r => setTimeout(r, 2000));
      await route.continue();
    });
    await p.goto(baseUrl + cur, {waitUntil: 'domcontentloaded', timeout: 30000});
    await p.waitForTimeout(300);
    const early = await p.evaluate(() => {
      const m = document.getElementById('main');
      const ft = document.querySelector('footer.np-foot');
      return {
        h: m ? Math.round(m.getBoundingClientRect().height) : 0,
        len: m ? m.innerText.replace(/\s+/g, ' ').trim().length : 0,
        footTop: ft ? Math.round(ft.getBoundingClientRect().top) : 9999,
      };
    });
    await p.waitForTimeout(3200);
    const late = await p.evaluate(() => {
      const m = document.getElementById('main');
      return {len: m ? m.innerText.replace(/\s+/g, ' ').trim().length : 0, pre: !!document.querySelector('#main [data-np-pre]')};
    });
    await ctx.close();
    ok(early.len > 20 && early.h >= 659 && early.footTop >= 659 && !late.pre && late.len > 20,
      `webkit iPhone 15 ${cur}: earlyH=${early.h}px, footTop=${early.footTop}px, hydrated=${!late.pre}, lateLen=${late.len}`);
  }
} finally {
  await wb.close();
}

srv.close();
console.log(`\nm13-prerender-cls-test: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
