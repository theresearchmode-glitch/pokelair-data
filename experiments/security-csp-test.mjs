// Security + CSP smoke test for the public build (Kip job 24, Part 1).
// Serves app/dist/ over localhost with every header from app/dist/_headers applied,
// opens the page in Playwright Chromium, and FAILS if:
//   1. Any required security header (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options) is missing.
//   2. CSP contains 'unsafe-inline' or 'unsafe-eval' in script-src, or lacks frame-ancestors 'none'.
//   3. Any inline <script> in dist/v2.html lacks a matching sha256 hash in script-src.
//   4. Any CSP violation fires (securitypolicyviolation event or console CSP error).
//   5. Any network request leaves localhost (external third-party host).
//   6. Any cookie is set (document.cookie non-empty).
//   7. A crafted #team=<base64 XSS payload> executes script or injects unescaped HTML.
//
// Run full browser check (after `node app/build.mjs --v2 --public --split --split-css --split-routes`):
//   node experiments/security-csp-test.mjs
// Run offline header/hash/logic self-test (no browser or dist/ needed):
//   node experiments/security-csp-test.mjs --self-test
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

export function parseHeadersFile(text) {
  const rules = [];
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      cur = {pattern: line.trim(), headers: {}};
      rules.push(cur);
    } else if (cur) {
      const idx = line.indexOf(':');
      if (idx > 0) cur.headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return rules;
}

export function headersForPath(rules, urlPath) {
  const out = {};
  for (const r of rules) {
    const pat = r.pattern;
    const match = pat === '/*' || pat === urlPath || (pat.endsWith('/*') && urlPath.startsWith(pat.slice(0, -1)));
    if (match) Object.assign(out, r.headers);
  }
  return out;
}

export function verifyCspAndHtml(html, headersText) {
  const rules = parseHeadersFile(headersText);
  const rootHdrs = headersForPath(rules, '/v2.html');
  const csp = rootHdrs['Content-Security-Policy'] || '';
  assert.ok(csp, 'Missing Content-Security-Policy header on /*');
  assert.equal(rootHdrs['X-Content-Type-Options'], 'nosniff', 'Missing X-Content-Type-Options: nosniff');
  assert.equal(rootHdrs['Referrer-Policy'], 'no-referrer', 'Missing Referrer-Policy: no-referrer');
  assert.ok(rootHdrs['Permissions-Policy'], 'Missing Permissions-Policy');
  assert.equal(rootHdrs['X-Frame-Options'], 'DENY', 'Missing X-Frame-Options: DENY');
  assert.ok(/frame-ancestors\s+'none'/.test(csp), "CSP must include frame-ancestors 'none'");
  const scriptSrc = (csp.match(/script-src\s+([^;]+)/) || ['', ''])[1];
  assert.ok(scriptSrc, 'CSP missing script-src');
  assert.ok(!scriptSrc.includes("'unsafe-inline'"), "script-src must not allow 'unsafe-inline'");
  assert.ok(!scriptSrc.includes("'unsafe-eval'"), "script-src must not allow 'unsafe-eval'");
  assert.ok(!/<script\b[^>]*\bonerror\s*=/i.test(html), 'Inline onerror= attribute found on <script> tag');
  const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(inlineScripts.length > 0, 'Expected at least one inline bootstrap <script> in v2.html');
  for (const m of inlineScripts) {
    const h = `'sha256-${crypto.createHash('sha256').update(m[1], 'utf8').digest('base64')}'`;
    assert.ok(scriptSrc.includes(h), `Inline <script> hash ${h} missing from script-src`);
  }
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html), 'Google Fonts URL found in HTML');
  assert.ok(!/google\.com\/url/.test(html), 'Google redirect URL found in HTML');
  return {csp, inlineCount: inlineScripts.length};
}

if (process.argv.includes('--self-test')) {
  const sampleScript = 'window.__NP_PUBLIC=1;';
  const hash = crypto.createHash('sha256').update(sampleScript, 'utf8').digest('base64');
  const goodHtml = `<!doctype html><html><head><script>${sampleScript}</script></head><body><div id="app"></div></body></html>`;
  const goodHdrs = [
    '/*',
    `  Content-Security-Policy: default-src 'none'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'`,
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: no-referrer',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '  X-Frame-Options: DENY'
  ].join('\n');
  const res = verifyCspAndHtml(goodHtml, goodHdrs);
  assert.equal(res.inlineCount, 1);
  // Prove the test can fail: tampered inline script must throw
  assert.throws(() => verifyCspAndHtml(goodHtml.replace('=1;', '=2;'), goodHdrs), /hash .* missing from script-src/);
  // Prove the test can fail: unsafe-inline in script-src must throw
  assert.throws(() => verifyCspAndHtml(goodHtml, goodHdrs.replace("'self'", "'self' 'unsafe-inline'")), /unsafe-inline/);
  console.log('security-csp-test --self-test: PASS (positive + 2 negative assertions verified)');
  process.exit(0);
}

const distDir = path.resolve('app/dist');
const htmlPath = path.join(distDir, 'v2.html');
const hdrsPath = path.join(distDir, '_headers');
assert.ok(fs.existsSync(htmlPath), `Missing ${htmlPath} — run public build first`);
assert.ok(fs.existsSync(hdrsPath), `Missing ${hdrsPath} — run public build first`);

const html = fs.readFileSync(htmlPath, 'utf8');
const hdrsText = fs.readFileSync(hdrsPath, 'utf8');
const {inlineCount} = verifyCspAndHtml(html, hdrsText);
const rules = parseHeadersFile(hdrsText);

const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'};

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'https://www.google.com/url?sa=E\&source=gmail\&q=http://127.0.0.1');
  const rel = u.pathname === '/' ? '/v2.html' : u.pathname;
  const fp = path.join(distDir, rel);
  const hdrs = headersForPath(rules, rel);
  // Strip upgrade-insecure-requests on local https://www.google.com/url?sa=E\&source=gmail\&q=http://127.0.0.1 test server only
  if (hdrs['Content-Security-Policy']) hdrs['Content-Security-Policy'] = hdrs['Content-Security-Policy'].replace(/;\s*upgrade-insecure-requests/g, '');
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    res.writeHead(200, {'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream', ...hdrs});
    fs.createReadStream(fp).pipe(res);
  } else if (rel.startsWith('/data/')) {
    res.writeHead(404, {'Content-Type': 'application/json', ...hdrs});
    res.end('{}');
  } else {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', ...hdrs});
    fs.createReadStream(htmlPath).pipe(res);
  }
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;

const {chromium} = await import('playwright');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const cspViolations = [];
  const externalReqs = [];
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', e => {
      window.__cspViolations.push({directive: e.violatedDirective, blocked: e.blockedURI, sample: e.sample});
    });
  });
  page.on('request', req => {
    const url = req.url();
    if (!url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:')) {
      externalReqs.push(url);
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error' && /Content Security Policy|CSP/i.test(msg.text())) cspViolations.push(msg.text());
  });

  // 1. Load home page under full CSP
  await page.goto(`${origin}/#home`, {waitUntil: 'networkidle'});
  const domViolations = await page.evaluate(() => window.__cspViolations);
  const cookies = await page.evaluate(() => document.cookie);
  assert.equal(domViolations.length, 0, `CSP violations on #home: ${JSON.stringify(domViolations)}`);
  assert.equal(cspViolations.length, 0, `Console CSP errors: ${JSON.stringify(cspViolations)}`);
  assert.equal(externalReqs.length, 0, `External requests detected: ${JSON.stringify(externalReqs)}`);
  assert.equal(cookies, '', `Unexpected cookies set: ${cookies}`);

  // 2. Load crafted XSS payload in #team= link
  const xssPayload = Buffer.from(JSON.stringify({v: 1, f: 'doubles', n: '<img src=x onerror="window.__XSS=1">', s: [['Garchomp']]})).toString('base64url');
  await page.goto(`${origin}/#team=${xssPayload}`, {waitUntil: 'networkidle'});
  const xssFired = await page.evaluate(() => Boolean(window.__XSS));
  assert.equal(xssFired, false, 'XSS payload executed via #team= link!');

  console.log(`security-csp-test: PASS (${inlineCount} hashed inline scripts, 0 CSP violations, 0 external requests, 0 cookies, XSS blocked)`);
} finally {
  await browser.close();
  server.close();
}
