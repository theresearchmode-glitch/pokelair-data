#!/usr/bin/env node
// deploy-smoke.mjs — read-only launch smoke test for nastyplot.org (Job 70).
//
// Usage:
//   node experiments/deploy-smoke.mjs                      # serves ./site (from `node public-site.mjs site`)
//   node experiments/deploy-smoke.mjs /path/to/site        # serves a local public-site.mjs folder
//   node experiments/deploy-smoke.mjs https://nastyplot.org # tests a live deployment (read-only; never sends forms)
//   Options: --dir <folder> | --url <baseUrl> | --concurrency <N> (default 8 local, 4 remote)
//
// Checks:
//   1. /robots.txt (200, allows /, declares sitemap.xml)
//   2. /404 (status 404, <meta name="robots" content="noindex">)
//   3. /sitemap.xml (200, non-empty <loc> list)
//   4. Every URL in sitemap.xml:
//        - HTTP 200, exactly one non-empty <title>, <link rel="canonical"> equals the URL
//        - Chromium load: 0 pageerror, 0 failed same-site requests (status >= 400 or network error),
//          real first-screen content (not the loading screen or error notice) within 5 s
//   5. One Pokémon page (/pokemon/garchomp or first /pokemon/<slug> in sitemap): H1 matches name,
//      interactive ability info sheet opens cleanly (read-only)
//   6. /team cold-open buttons: Import sheet (and Why/More if sample team is shown) open & close cleanly
//      with 0 errors and 0 form submissions
//
// Output: one line per failure and "deploy-smoke: ALL PASSED" (exit 0) or exit 1.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function parseArgs(argv) {
  let url = null, dir = null, concurrency = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url' && argv[i + 1]) url = argv[++i];
    else if (a === '--dir' && argv[i + 1]) dir = argv[++i];
    else if (a === '--concurrency' && argv[i + 1]) concurrency = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (/^https?:\/\//i.test(a)) url = a;
    else if (!a.startsWith('-')) dir = a;
  }
  return {url, dir, concurrency};
}

function startLocalServer(siteDir) {
  const absDir = path.resolve(siteDir);
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) {
    throw new Error(`Site folder not found: ${absDir} (build one with: node public-site.mjs site)`);
  }
  const srv = http.createServer((req, res) => {
    const cleanPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const send404 = () => {
      const f404 = path.join(absDir, '404.html');
      if (fs.existsSync(f404)) {
        res.writeHead(404, {'content-type': 'text/html; charset=utf-8'});
        fs.createReadStream(f404).pipe(res);
      } else {
        res.writeHead(404, {'content-type': 'text/plain; charset=utf-8'});
        res.end('Not Found');
      }
    };
    if (cleanPath === '/404' || cleanPath === '/404.html') return send404();
    const rel = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');
    const candidates = [
      path.join(absDir, rel),
      path.join(absDir, rel + '.html'),
      path.join(absDir, rel, 'index.html'),
    ];
    let file = null;
    for (const c of candidates) {
      if (!c.startsWith(absDir)) continue;
      if (fs.existsSync(c) && fs.statSync(c).isFile()) { file = c; break; }
    }
    if (!file) return send404();
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {'content-type': MIME[ext] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const {port} = srv.address();
      resolve({srv, baseUrl: `http://127.0.0.1:${port}`});
    });
  });
}

function decodeXml(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function checkHtmlHead(html, expectedCanonical, label) {
  const issues = [];
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  if (titles.length !== 1) issues.push(`${label}: expected 1 <title>, found ${titles.length}`);
  else if (!titles[0][1].trim()) issues.push(`${label}: empty <title>`);

  const canonMatches = [...html.matchAll(/<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/gi)];
  if (canonMatches.length !== 1) {
    issues.push(`${label}: expected 1 canonical link, found ${canonMatches.length}`);
  } else {
    const hm = /\bhref\s*=\s*["']([^"']+)["']/i.exec(canonMatches[0][0]);
    const href = hm ? decodeXml(hm[1].trim()) : '';
    if (href !== expectedCanonical) {
      issues.push(`${label}: canonical mismatch (got "${href}", expected "${expectedCanonical}")`);
    }
  }
  return issues;
}

const failures = [];
function fail(msg) {
  failures.push(msg);
  console.log(`FAIL ${msg}`);
}

const opts = parseArgs(process.argv.slice(2));
let localSrv = null;
let baseUrl = opts.url ? opts.url.replace(/\/+$/, '') : null;
const isLocal = !baseUrl;

if (!baseUrl) {
  const targetDir = opts.dir ? path.resolve(opts.dir) : path.join(ROOT, 'site');
  try {
    const started = await startLocalServer(targetDir);
    localSrv = started.srv;
    baseUrl = started.baseUrl;
  } catch (e) {
    fail(`setup: ${e.message}`);
    process.exit(1);
  }
}

const targetOrigin = new URL(baseUrl).origin;
const concurrency = opts.concurrency || (isLocal ? 8 : 4);
const tStart = Date.now();

// 1. /robots.txt
try {
  const res = await fetch(`${baseUrl}/robots.txt`);
  const text = await res.text();
  if (res.status !== 200) fail(`/robots.txt: HTTP ${res.status} (expected 200)`);
  if (!/User-agent:\s*\*/i.test(text) || !/Allow:\s*\//i.test(text)) {
    fail('/robots.txt: missing User-agent: * / Allow: /');
  }
  if (!/Sitemap:\s*https?:\/\/\S+sitemap\.xml/i.test(text)) {
    fail('/robots.txt: missing Sitemap declaration');
  }
} catch (e) {
  fail(`/robots.txt: fetch error (${e.message})`);
}

// 2. /404 (status 404 + noindex)
try {
  const res = await fetch(`${baseUrl}/404`);
  const html = await res.text();
  if (res.status !== 404) fail(`/404: HTTP ${res.status} (expected 404)`);
  if (!/<meta\b[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["'][^"']*noindex/i.test(html) &&
      !/<meta\b[^>]*content\s*=\s*["'][^"']*noindex[^"']*["'][^>]*name\s*=\s*["']robots["']/i.test(html)) {
    fail('/404: missing <meta name="robots" content="noindex">');
  }
} catch (e) {
  fail(`/404: fetch error (${e.message})`);
}

// 3. /sitemap.xml
let sitemapUrls = [];
try {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  const xml = await res.text();
  if (res.status !== 200) {
    fail(`/sitemap.xml: HTTP ${res.status} (expected 200)`);
  } else {
    sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(m => decodeXml(m[1].trim()));
    if (!sitemapUrls.length) fail('/sitemap.xml: contains 0 <loc> URLs');
  }
} catch (e) {
  fail(`/sitemap.xml: fetch error (${e.message})`);
}

const browser = await chromium.launch({args: ['--disable-dev-shm-usage']});

try {
  // 4. Every URL in sitemap.xml: HTTP status/head + Chromium load
  if (sitemapUrls.length) {
    const context = await browser.newContext({viewport: {width: 1280, height: 800}});
    // Safety guard: strictly read-only against target origin (never send forms or increment live counters)
    await context.route('**/*', route => {
      const req = route.request();
      const m = req.method().toUpperCase();
      if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') {
        if (/\/api\/count(\?|$)/.test(req.url())) return route.fulfill({status: 204, body: ''});
        fail(`${req.url()}: blocked non-read-only ${m} request`);
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });

    const pages = await Promise.all(Array.from({length: Math.min(concurrency, sitemapUrls.length)}, () => context.newPage()));
    let nextIdx = 0;

    async function runWorker(page) {
      while (true) {
        const idx = nextIdx++;
        if (idx >= sitemapUrls.length) break;
        const loc = sitemapUrls[idx];
        let parsed;
        try { parsed = new URL(loc); } catch {
          fail(`${loc}: invalid URL in sitemap.xml`);
          continue;
        }
        const routePath = parsed.pathname + parsed.search;
        const fetchUrl = `${baseUrl}${routePath}`;
        // On the live canonical host (e.g. https://nastyplot.org), loc === fetchUrl.
        // On a local folder server (http://127.0.0.1:<port>), canonical must equal the sitemap <loc>.
        const expectedCanonical = targetOrigin === parsed.origin ? fetchUrl : loc;

        // 4a. Raw HTTP check (status 200, exactly one <title>, canonical === URL)
        try {
          const res = await fetch(fetchUrl);
          const html = await res.text();
          if (res.status !== 200) {
            fail(`${routePath}: HTTP ${res.status} (expected 200)`);
            continue;
          }
          for (const msg of checkHtmlHead(html, expectedCanonical, routePath)) fail(msg);
        } catch (e) {
          fail(`${routePath}: HTTP fetch error (${e.message})`);
          continue;
        }

        // 4b. Chromium load: 0 pageerror, 0 failed same-site requests, real content within 5 s
        const pageErrors = [];
        const badRequests = [];
        const onPageError = err => pageErrors.push(err.message || String(err));
        const onResponse = res => {
          try {
            if (new URL(res.url()).origin === targetOrigin && res.status() >= 400) {
              badRequests.push(`${res.status()} ${new URL(res.url()).pathname}`);
            }
          } catch {}
        };
        const onRequestFailed = req => {
          try {
            if (new URL(req.url()).origin === targetOrigin) {
              const errText = req.failure()?.errorText || 'failed';
              if (errText === 'net::ERR_ABORTED') return; // canceled idle prefetch on navigation
              badRequests.push(`${errText} ${new URL(req.url()).pathname}`);
            }
          } catch {}
        };
        page.on('pageerror', onPageError);
        page.on('response', onResponse);
        page.on('requestfailed', onRequestFailed);

        try {
          const navStart = Date.now();
          const resp = await page.goto(fetchUrl, {waitUntil: 'domcontentloaded', timeout: 15000});
          if (!resp || resp.status() !== 200) {
            fail(`${routePath}: Chromium status ${resp ? resp.status() : 'null'} (expected 200)`);
          } else {
            const remaining = Math.max(500, 5000 - (Date.now() - navStart));
            try {
              await page.waitForFunction(() => {
                const visibleLoading = document.querySelector('section.np-loading, .np-loading:not(.vh)');
                if (visibleLoading) return false;
                const main = document.querySelector('#main, main') || document.body;
                if (!main) return false;
                const text = (main.innerText || '').trim();
                if (text.length < 60) return false;
                if (/this page didn['’]t load/i.test(text)) return false;
                return Boolean(document.querySelector('h1')) || text.length >= 120;
              }, {timeout: remaining});
            } catch {
              const diag = await page.evaluate(() => ({
                loading: Boolean(document.querySelector('section.np-loading, .np-loading:not(.vh)')),
                textLen: ((document.querySelector('#main, main') || document.body)?.innerText || '').trim().length,
                broken: /this page didn['’]t load/i.test(document.body?.innerText || ''),
              })).catch(() => ({}));
              fail(`${routePath}: no real first-screen content within 5s (${JSON.stringify(diag)})`);
            }
            // Wait for deferred scripts + eager assets to finish loading and settle
            await page.waitForLoadState('load', {timeout: 5000}).catch(() => {});
            await page.waitForTimeout(150);
          }
        } catch (e) {
          fail(`${routePath}: Chromium load error (${String(e.message).split('\n')[0]})`);
        } finally {
          page.off('pageerror', onPageError);
          page.off('response', onResponse);
          page.off('requestfailed', onRequestFailed);
        }

        if (pageErrors.length) {
          fail(`${routePath}: ${pageErrors.length} page error(s): ${[...new Set(pageErrors)].slice(0, 2).join(' | ').slice(0, 180)}`);
        }
        if (badRequests.length) {
          fail(`${routePath}: ${badRequests.length} failed same-site request(s): ${[...new Set(badRequests)].slice(0, 3).join(', ')}`);
        }
      }
    }

    await Promise.all(pages.map(runWorker));
    await context.close();
  }

  // 5. Dedicated Pokémon page interactive check (cold context)
  {
    const pkLoc = sitemapUrls.find(u => /\/pokemon\/garchomp$/i.test(u)) || sitemapUrls.find(u => /\/pokemon\/[^/]+$/i.test(u));
    const pkPath = pkLoc ? new URL(pkLoc).pathname : '/pokemon/garchomp';
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.route('**/*', route => {
      const req = route.request();
      const m = req.method().toUpperCase();
      if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') {
        if (/\/api\/count(\?|$)/.test(req.url())) return route.fulfill({status: 204, body: ''});
        fail(`pokemon-check (${pkPath}): blocked non-read-only ${m} request to ${req.url()}`);
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
    const page = await ctx.newPage();
    const errs = [], bad = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('response', r => { try { if (new URL(r.url()).origin === targetOrigin && r.status() >= 400) bad.push(`${r.status()} ${new URL(r.url()).pathname}`); } catch {} });
    page.on('requestfailed', r => { try { if (new URL(r.url()).origin === targetOrigin && r.failure()?.errorText !== 'net::ERR_ABORTED') bad.push(`${r.failure()?.errorText || 'failed'} ${new URL(r.url()).pathname}`); } catch {} });
    try {
      await page.goto(`${baseUrl}${pkPath}`, {waitUntil: 'networkidle', timeout: 15000});
      const h1 = (await page.textContent('h1') || '').trim();
      const slugWord = pkPath.split('/').pop().split('-')[0];
      if (!h1 || !new RegExp(slugWord, 'i').test(h1)) {
        fail(`pokemon-check (${pkPath}): h1 "${h1}" does not match "${slugWord}"`);
      }
      const abBtn = page.locator('[data-v2info="ab"]').first();
      if (await abBtn.count()) {
        await abBtn.click();
        await page.waitForSelector('.np-sheet .is2 .is-lead', {timeout: 5000});
        const lead = (await page.textContent('.np-sheet .is2 .is-lead') || '').trim();
        if (lead.length < 10) fail(`pokemon-check (${pkPath}): ability info sheet lead too short`);
      } else {
        fail(`pokemon-check (${pkPath}): missing [data-v2info="ab"] ability button`);
      }
    } catch (e) {
      fail(`pokemon-check (${pkPath}): ${String(e.message).split('\n')[0]}`);
    }
    if (errs.length) fail(`pokemon-check (${pkPath}): page error: ${errs[0]}`);
    if (bad.length) fail(`pokemon-check (${pkPath}): failed same-site request: ${bad[0]}`);
    await ctx.close();
  }

  // 6. /team cold-open buttons (read-only: open/close dialogs, never submit forms)
  {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.route('**/*', route => {
      const req = route.request();
      const m = req.method().toUpperCase();
      if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') {
        if (/\/api\/count(\?|$)/.test(req.url())) return route.fulfill({status: 204, body: ''});
        fail(`/team cold-open: blocked non-read-only ${m} request to ${req.url()}`);
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
    const page = await ctx.newPage();
    const errs = [], bad = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('response', r => { try { if (new URL(r.url()).origin === targetOrigin && r.status() >= 400) bad.push(`${r.status()} ${new URL(r.url()).pathname}`); } catch {} });
    page.on('requestfailed', r => { try { if (new URL(r.url()).origin === targetOrigin && r.failure()?.errorText !== 'net::ERR_ABORTED') bad.push(`${r.failure()?.errorText || 'failed'} ${new URL(r.url()).pathname}`); } catch {} });
    try {
      await page.goto(`${baseUrl}/team`, {waitUntil: 'networkidle', timeout: 15000});
      await page.waitForFunction(() => !document.querySelector('section.np-loading, .np-loading:not(.vh)'), {timeout: 5000});

      const testSheetBtn = async (selector, label) => {
        const btn = page.locator(selector).first();
        if (!(await btn.count()) || !(await btn.isVisible())) return false;
        await btn.click();
        await page.waitForSelector('.np-sheet', {timeout: 5000});
        const closeBtn = page.locator('.np-sheet [data-v2close]').first();
        if (await closeBtn.count()) await closeBtn.click();
        else await page.keyboard.press('Escape');
        await page.waitForSelector('.np-sheet', {state: 'detached', timeout: 5000}).catch(() => {});
        return true;
      };

      const openedImport = await testSheetBtn('[data-v2import]', 'Import a Team');
      if (!openedImport) fail('/team cold-open: [data-v2import] button missing or not visible');

      // On populated sample team, also verify "Why This Score?" and "More" sheets open cleanly
      let extraTested = 0;
      if (await testSheetBtn('[data-v2why]', 'Why This Score?')) extraTested++;
      if (await testSheetBtn('[data-v2more]', 'More')) extraTested++;
      // On empty Reg M-D day-one team, verify "Add a Pokémon" search sheet opens cleanly
      if (!extraTested) {
        const openedSearch = await testSheetBtn('[data-v2search]', 'Add a Pokémon');
        if (!openedSearch) fail('/team cold-open: neither sample-team buttons nor [data-v2search] opened');
      }
    } catch (e) {
      fail(`/team cold-open: ${String(e.message).split('\n')[0]}`);
    }
    if (errs.length) fail(`/team cold-open: page error: ${errs[0]}`);
    if (bad.length) fail(`/team cold-open: failed same-site request: ${bad[0]}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  if (localSrv) await new Promise(r => localSrv.close(r));
}

const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
if (failures.length) {
  console.log(`deploy-smoke: ${failures.length} FAILED (${sitemapUrls.length} sitemap URLs checked in ${elapsed}s)`);
  process.exit(1);
}
console.log(`deploy-smoke: ALL PASSED (${sitemapUrls.length} sitemap URLs + robots.txt + 404 + pokemon + /team cold-open in ${elapsed}s)`);
process.exit(0);
