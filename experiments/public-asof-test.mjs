#!/usr/bin/env node
// public-asof-test.mjs (Job 75): on the deployed public build (`node public-site.mjs site`, with --split-routes),
// if every /data/*.json request fails/aborts, Home must still display its "Data as of ..." date in the footer
// (.np-asof) from the prerendered first screen's build date.
//
// Usage:
//   node public-site.mjs site
//   node experiments/public-asof-test.mjs site
//
// Fails before the Job 75 fix (on origin/claude/design6 978d8213) because --split-routes drops the built-in
// fallback snapshot and the prerendered first screen did not carry its build date.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.resolve(process.argv[2] || path.join(ROOT, 'site'));
if (!fs.existsSync(path.join(SITE, 'index.html'))) {
  console.error(`public-asof-test: site folder not found: ${SITE} (run: node public-site.mjs site)`);
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  let f = path.join(SITE, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + '.html') ? f + '.html' : '';
  if (!f) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
});

await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch({args: ['--disable-dev-shm-usage']});
let fails = 0;

try {
  // 1. /data/*.json aborted (network failure)
  for (const [label, mode] of [
    ['Home with /data/*.json aborted', 'abort'],
    ['Home with /data/*.json returning 500', '500'],
  ]) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}});
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.route(/\/data\/.*\.json/, route => mode === 'abort' ? route.abort('failed') : route.fulfill({status: 500, body: ''}));
    await page.goto(base + '/', {waitUntil: 'domcontentloaded', timeout: 15000});
    await page.waitForTimeout(3000);
    const r = await page.evaluate(() => {
      const asofEl = document.querySelector('footer.np-foot .np-asof');
      const asof = asofEl ? asofEl.textContent.trim() : '';
      const hasNumbers = Boolean(document.querySelector('#main .f3-hero, #main .f3-bar, #main h1'));
      return {asof, hasNumbers, preAttr: document.querySelector('[data-np-asof]')?.getAttribute('data-np-asof') || ''};
    });
    const ok = /^Data as of [A-Z][a-z]{2} \d{1,2}/.test(r.asof) && r.hasNumbers && !errs.length;
    if (!ok) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}: asof="${r.asof}", hasNumbers=${r.hasNumbers}, errs=${errs.length}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  srv.close();
}

console.log(`public-asof-test: ${fails ? fails + ' FAILED' : 'ALL PASSED'}`);
process.exit(fails ? 1 : 0);
