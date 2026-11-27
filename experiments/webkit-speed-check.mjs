// webkit-speed-check.mjs (Job 67, Nov 26): verifies the 64c+65+66 speed chain on WebKit (iPhone 15, iPhone SE, iPad Pro 11).
// Network throttling (150 ms RTT + 1.6 Mbit/s = 200 KB/s) is enforced at the local HTTP server so it works identically in WebKit
// (CDP 4x CPU throttling is Chromium-only; WebKit 18.2 exposes paint/navigation/resource, not largest-contentful-paint or layout-shift).
// Checks:
//   1. Font-swap overlap guard (.woff2 blocked) across iPhone 15, iPhone SE, iPad Pro 11 on / and /pokemon/garchomp.
//   2. Prerender vs hydrated layout jump (equivalent CLS + no old Home .sdh flash + 0 broken imgs) on / and /team across all 3 devices.
//   3. Slow-network (150 ms RTT, 200 KB/s) FCP, hydration time, transfer KB (< 1.5 MB), and 0 page errors across all 10 speed-check pages on iPhone 15 (+ key pages on iPhone SE & iPad Pro 11).
// Run: SPEED_DIST=/tmp/site-66 node experiments/webkit-speed-check.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {webkit, devices} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.env.SPEED_DIST || path.join(ROOT, 'app/dist'));
const T = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png'};
const GZ = new Set(['.html', '.js', '.css', '.json', '.svg']);
const BUDGET_BYTES = 1.5 * 1024 * 1024;

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error(`webkit-speed-check: build not found in ${DIST}`);
  process.exit(1);
}

const gzCache = new Map();
function makeServer(throttle) {
  return http.createServer((q, r) => {
    let p = decodeURIComponent((q.url || '/').split('?')[0]);
    if (p === '/') p = '/index.html';
    let f = path.join(DIST, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + '.html') ? f + '.html' : '';
    if (!f) { r.writeHead(404); return r.end('404'); }
    const ext = path.extname(f);
    let buf, headers;
    if (GZ.has(ext) && /\bgzip\b/.test(String(q.headers['accept-encoding'] || ''))) {
      buf = gzCache.get(f);
      if (!buf) { buf = zlib.gzipSync(fs.readFileSync(f), {level: 6}); gzCache.set(f, buf); }
      headers = {'content-type': T[ext] || 'application/octet-stream', 'content-encoding': 'gzip', 'content-length': buf.length};
    } else {
      buf = fs.readFileSync(f);
      headers = {'content-type': T[ext] || 'application/octet-stream', 'content-length': buf.length};
    }
    if (!throttle) { r.writeHead(200, headers); return r.end(buf); }
    // Fast 3G simulation: 150 ms RTT + 200 KB/s (1.6 Mbit/s)
    const delayMs = 150 + Math.round((buf.length / (200 * 1024)) * 1000);
    setTimeout(() => { if (!r.writableEnded) { r.writeHead(200, headers); r.end(buf); } }, delayMs);
  });
}

const fastSrv = makeServer(false), slowSrv = makeServer(true);
await Promise.all([
  new Promise(res => fastSrv.listen(0, '127.0.0.1', res)),
  new Promise(res => slowSrv.listen(0, '127.0.0.1', res))
]);
const fastBase = `http://127.0.0.1:${fastSrv.address().port}`;
const slowBase = `http://127.0.0.1:${slowSrv.address().port}`;

const br = await webkit.launch();
let fails = 0;
const DEVS = ['iPhone 15', 'iPhone SE', 'iPad Pro 11'];

// 1. Font-overlap guard (.woff2 blocked vs real Unbounded) across all 3 Apple devices
// Note: WebKit includes font ascent+descent box padding in Range.getClientRects() even for real Unbounded at line-height: 1.0 (~7 px),
// so we fail if the fallback exceeds real Unbounded's own line-box overlap by more than 1 px.
console.log('=== 1. WEBKIT FONT-OVERLAP GUARD (.woff2 blocked vs real Unbounded) ===');
const measureOv = async (devName, rt, blockWoff) => {
  const c = await br.newContext(devices[devName]);
  const pg = await c.newPage();
  if (blockWoff) await pg.route('**/*.woff2', route => route.abort());
  await pg.goto(fastBase + rt, {waitUntil: 'domcontentloaded', timeout: 30000});
  await pg.waitForTimeout(400);
  const res = await pg.evaluate(() => {
    let maxOv = 0, linesN = 0;
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
      linesN = Math.max(linesN, lines.length);
      for (let i = 0; i < lines.length - 1; i++) maxOv = Math.max(maxOv, lines[i].bottom - lines[i + 1].top);
    }
    return {maxOv: +maxOv.toFixed(1), linesN};
  });
  await c.close();
  return res;
};
for (const devName of DEVS) {
  for (const rt of ['/', '/pokemon/garchomp']) {
    const fb = await measureOv(devName, rt, true), rl = await measureOv(devName, rt, false);
    const ok = fb.maxOv <= rl.maxOv + 1;
    if (!ok) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${devName} ${rt}: fallback=${fb.maxOv}px (${fb.linesN}L) <= real=${rl.maxOv}px (${rl.linesN}L)`);
  }
}

// 2. Prerender vs hydrated layout match + equivalent CLS on / and /team across all 3 Apple devices
console.log('\n=== 2. WEBKIT PRERENDER VS HYDRATED LAYOUT JUMP (/, /team) ===');
for (const devName of DEVS) {
  for (const rt of ['/', '/team']) {
    const dev = devices[devName];
    const vh = dev.viewport.height, vw = dev.viewport.width;
    // Capture prerendered boxes while v2.js is held
    const c1 = await br.newContext(dev);
    const p1 = await c1.newPage();
    await p1.route('**/v2.js*', () => {});
    await p1.goto(fastBase + rt, {waitUntil: 'commit', timeout: 20000});
    await p1.waitForSelector('#main .k-h1.u, #main h1.u, #main .f3-h1, #main .tm-name', {timeout: 10000});
    await p1.waitForTimeout(500);
    const pre = await p1.evaluate(() => {
      const pick = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {y: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width)}; };
      return {
        h1: pick('#main .k-h1.u, #main h1.u, #main .f3-h1, #main .tm-name'),
        sub: pick('#main .f3-lead, #main .mtf-score'),
        oldHome: !!document.querySelector('#main .sdh')
      };
    });
    await c1.close();

    // Capture hydrated boxes
    const c2 = await br.newContext(dev);
    const p2 = await c2.newPage();
    const errs = [];
    p2.on('pageerror', e => errs.push(e.message));
    await p2.goto(fastBase + rt, {waitUntil: 'load', timeout: 30000});
    await p2.waitForFunction(() => window.V2 && V2._dataOk && !document.querySelector('[data-np-pre]'), null, {timeout: 20000});
    await p2.waitForTimeout(500);
    const hyd = await p2.evaluate(() => {
      const pick = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {y: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width)}; };
      return {
        h1: pick('#main .k-h1.u, #main h1.u, #main .f3-h1, #main .tm-name'),
        sub: pick('#main .f3-lead, #main .mtf-score'),
        oldHome: !!document.querySelector('#main .sdh'),
        broken: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length
      };
    });
    await c2.close();

    const dyH1 = pre.h1 && hyd.h1 ? Math.abs(hyd.h1.y - pre.h1.y) : 999;
    const dhH1 = pre.h1 && hyd.h1 ? Math.abs(hyd.h1.h - pre.h1.h) : 999;
    const dySub = pre.sub && hyd.sub ? Math.abs(hyd.sub.y - pre.sub.y) : 0;
    const eqCls = +((Math.max(dyH1, dySub) / vh) * 0.7).toFixed(4);
    const ok = eqCls < 0.1 && !pre.oldHome && !hyd.oldHome && hyd.broken === 0 && errs.length === 0;
    if (!ok) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${devName} ${rt}: dY(h1)=${dyH1}px dH(h1)=${dhH1}px dY(sub)=${dySub}px eqCLS=${eqCls} oldHome=${pre.oldHome||hyd.oldHome} broken=${hyd.broken} errs=${errs.length}`);
  }
}

// 3. Slow-network (150 ms RTT, 1.6 Mbit/s) 10-page speed & transfer on iPhone 15 + key pages on iPhone SE & iPad Pro 11
const PAGES_10 = [
  ['Home', '/'], ['Pokémon A-Z', '/pokemon'], ['Garchomp', '/pokemon/garchomp'],
  ['Incineroar', '/pokemon/incineroar'], ['Mega Absol', '/pokemon/absol-mega'],
  ['Natures', '/natures'], ['Popular Sets', '/sets'], ['Meta', '/meta'],
  ['Gifts', '/gifts'], ['My Team', '/team']
];
console.log('\n=== 3. WEBKIT SLOW-NETWORK SPEED & TRANSFER (150ms RTT, 1.6 Mbit/s) ===');
for (const [devName, routes] of [['iPhone 15', PAGES_10], ['iPhone SE', PAGES_10.slice(0, 3).concat([PAGES_10[9]])], ['iPad Pro 11', PAGES_10.slice(0, 3).concat([PAGES_10[9]])]]) {
  for (const [label, rt] of routes) {
    const c = await br.newContext(devices[devName]);
    const pg = await c.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    let bytes = 0, reqs = 0;
    pg.on('response', async res => {
      reqs++;
      const cl = Number(res.headers()['content-length'] || 0);
      if (cl > 0) bytes += cl;
      else { const b = await res.body().catch(() => Buffer.alloc(0)); bytes += b.length; }
    });
    const t0 = Date.now();
    await pg.goto(slowBase + rt, {waitUntil: 'load', timeout: 45000});
    if (rt !== '/pokemon') await pg.waitForFunction(() => window.V2 && V2._dataOk, null, {timeout: 30000}).catch(() => {});
    const readyMs = Date.now() - t0;
    const fcp = await pg.evaluate(() => {
      const e = performance.getEntriesByName('first-contentful-paint')[0];
      return e ? Math.round(e.startTime) : null;
    });
    const ok = bytes < BUDGET_BYTES && (fcp == null || fcp < 2500) && errs.length === 0;
    if (!ok) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${devName.padEnd(11)} ${label.padEnd(13)} (${rt}): FCP=${fcp}ms ready=${readyMs}ms transfer=${(bytes/1024).toFixed(1)}KB (${reqs} reqs) errs=${errs.length}`);
    await c.close();
  }
}

await br.close();
fastSrv.close();
slowSrv.close();
console.log(`\nwebkit-speed-check: ${fails ? fails + ' FAILED' : 'ALL PASSED'}`);
process.exit(fails ? 1 : 0);
