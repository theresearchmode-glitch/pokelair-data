// seo-check.mjs (Kip job 50, Nov 26): search-readiness checks over every HTML page the public build writes.
// Expects the public build in app/dist/ (run: node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public)
// or SEO_DIST=<folder> (used by broken-page self-tests).
// Checks:
//   1. one <title>, unique across pages, 15-65 chars; one meta description, unique, 50-160 chars
//   2. one <link rel="canonical"> with absolute https://nastyplot.org/ URL matching the page's path; no noindex
//   3. html lang set; every <img> has alt (static + rendered); exactly one <h1> (static on non-SPA pages, rendered on all routes)
//   4. every JSON-LD block parses as JSON and has @context and @type (or @graph items with @type)
//   5. sitemap.xml lists every indexable page once with its canonical URL and nothing that isn't a page;
//      robots.txt allows crawling and names the sitemap.
// Run: node app/test/seo-check.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.resolve(process.env.SEO_DIST || path.join(ROOT, 'app/dist'));
const ORIGIN = 'https://nastyplot.org';
// Non-public v1 artifacts (page.html, test.html) and intentional noindex/error copies (404.html, pokemon/404.html, v2.html)
const SKIP_FILES = new Set(['page.html', 'test.html', 'v2.html', '404.html', 'pokemon/404.html']);
// On-device pages intentionally omitted from sitemap.xml (app/build.mjs:232: player's own box/teams)
const SITEMAP_OMIT = new Set(['/box', '/compare']);

let fails = 0;
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };

const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[1] ?? m[2] ?? '') : null;
};

// Walk DIST for public HTML files
const files = [];
const walk = (dir, rel = '') => {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), r);
    else if (e.name.endsWith('.html') && !SKIP_FILES.has(r)) files.push(r);
  }
};
if (!fs.existsSync(DIST)) { console.error(`seo-check: dist folder not found: ${DIST}`); process.exit(1); }
walk(DIST);
files.sort();
ok(files.length > 0, `found ${files.length} public HTML pages in ${path.relative(ROOT, DIST) || DIST}`);

const titleIssues = [], descIssues = [], canonIssues = [], noindexIssues = [], langIssues = [], imgStaticIssues = [], ldStaticIssues = [];
const titles = new Map(), descs = new Map(), canonByFile = new Map(), fileByUrl = new Map();

for (const rel of files) {
  const html = fs.readFileSync(path.join(DIST, rel), 'utf8');
  const expectedPath = rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/, '');
  const expectedUrl = ORIGIN + expectedPath;
  fileByUrl.set(expectedUrl, rel);

  // 1a. <title>
  // only the page's own <title> in <head>: an inline SVG's <title> (an accessibility label in the body) is not a page title (GitHub run 45852023139: 6 per page)
  const hEnd = html.search(/<\/head>/i), head = hEnd > 0 ? html.slice(0, hEnd) : html;
  const tM = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  if (tM.length !== 1) titleIssues.push(`${rel}: ${tM.length} <title> tags`);
  else {
    const t = decode(tM[0][1].trim());
    if (t.length < 15 || t.length > 65) titleIssues.push(`${rel}: title length ${t.length} ("${t}")`);
    if (titles.has(t)) titleIssues.push(`${rel}: duplicate title "${t}" (same as ${titles.get(t)})`);
    else titles.set(t, rel);
  }

  // 1b. <meta name="description">
  const dM = [...html.matchAll(/<meta\b[^>]*\bname\s*=\s*(?:"description"|'description')[^>]*>/gi)];
  if (dM.length !== 1) descIssues.push(`${rel}: ${dM.length} meta description tags`);
  else {
    const d = (attr(dM[0][0], 'content') || '').trim();
    if (d.length < 50 || d.length > 160) descIssues.push(`${rel}: description length ${d.length} ("${d}")`);
    if (descs.has(d)) descIssues.push(`${rel}: duplicate description "${d}" (same as ${descs.get(d)})`);
    else descs.set(d, rel);
  }

  // 2. <link rel="canonical"> + no noindex
  const cM = [...html.matchAll(/<link\b[^>]*\brel\s*=\s*(?:"canonical"|'canonical')[^>]*>/gi)];
  if (cM.length !== 1) canonIssues.push(`${rel}: ${cM.length} canonical tags`);
  else {
    const u = attr(cM[0][0], 'href') || '';
    canonByFile.set(rel, u);
    if (u !== expectedUrl) canonIssues.push(`${rel}: canonical "${u}" !== "${expectedUrl}"`);
  }
  const robM = [...html.matchAll(/<meta\b[^>]*\bname\s*=\s*(?:"robots"|'robots')[^>]*>/gi)];
  if (robM.some(m => /noindex/i.test(m[0]))) noindexIssues.push(`${rel}: ${robM[0][0]}`);

  // 3 (static). html lang + static img alt
  const htmlTag = html.match(/<html\b[^>]*>/i);
  if (!htmlTag || !/\blang\s*=\s*(?:"[a-z]{2,}|'[a-z]{2,})/i.test(htmlTag[0])) langIssues.push(`${rel}: ${htmlTag ? htmlTag[0] : 'no <html>'}`);
  const noScript = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
  for (const m of noScript.matchAll(/<img\b[^>]*>/gi)) {
    if (attr(m[0], 'alt') === null) imgStaticIssues.push(`${rel}: ${m[0].slice(0, 80)}`);
  }

  // 4 (static). JSON-LD
  for (const m of html.matchAll(/<script\b[^>]*\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const obj = JSON.parse(m[1]);
      const hasCtx = Boolean(obj && obj['@context']);
      const hasType = Boolean(obj && (obj['@type'] || (Array.isArray(obj['@graph']) && obj['@graph'].length > 0 && obj['@graph'].every(n => n && n['@type']))));
      if (!hasCtx || !hasType) ldStaticIssues.push(`${rel}: missing @context/@type`);
    } catch (e) { ldStaticIssues.push(`${rel}: invalid JSON-LD (${e.message})`); }
  }
}

const fmt = arr => arr.length ? arr.slice(0, 5).join('; ') + (arr.length > 5 ? ` (+${arr.length - 5} more)` : '') : 'all ok';
ok(titleIssues.length === 0, `1a. one unique <title> (15-65 chars) on all ${files.length} pages (${fmt(titleIssues)})`);
ok(descIssues.length === 0, `1b. one unique meta description (50-160 chars) on all ${files.length} pages (${fmt(descIssues)})`);
ok(canonIssues.length === 0, `2a. one matching absolute canonical URL on all ${files.length} pages (${fmt(canonIssues)})`);
ok(noindexIssues.length === 0, `2b. no noindex on any indexable public page (${fmt(noindexIssues)})`);
ok(langIssues.length === 0, `3a. html lang set on all ${files.length} pages (${fmt(langIssues)})`);
ok(imgStaticIssues.length === 0, `3b. every static <img> has alt (${fmt(imgStaticIssues)})`);
ok(ldStaticIssues.length === 0, `4a. every static JSON-LD parses with @context and @type (${fmt(ldStaticIssues)})`);

// 5. sitemap.xml & robots.txt
const smPath = path.join(DIST, 'sitemap.xml');
const robPath = path.join(DIST, 'robots.txt');
if (!fs.existsSync(smPath)) {
  ok(false, '5a. sitemap.xml exists (missing)');
} else {
  const smXml = fs.readFileSync(smPath, 'utf8');
  const locs = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  const locSet = new Set(locs);
  const smIssues = [];
  if (locs.length !== locSet.size) smIssues.push(`duplicate <loc> entries (${locs.length} total, ${locSet.size} unique)`);
  for (const [rel, u] of canonByFile) {
    const p = u.slice(ORIGIN.length);
    if (!SITEMAP_OMIT.has(p) && !locSet.has(u)) smIssues.push(`missing page ${rel} (${u})`);
  }
  for (const u of locSet) {
    if (!fileByUrl.has(u)) smIssues.push(`sitemap URL has no built HTML page: ${u}`);
  }
  ok(smIssues.length === 0, `5a. sitemap.xml lists all ${locSet.size} indexable pages once with canonical URLs and no extra URLs (${fmt(smIssues)})`);
}

if (!fs.existsSync(robPath)) {
  ok(false, '5b. robots.txt exists (missing)');
} else {
  const rob = fs.readFileSync(robPath, 'utf8');
  const hasUA = /^User-agent:\s*\*/m.test(rob);
  const allows = /^Allow:\s*\/$/m.test(rob) && !/^Disallow:\s*\/$/m.test(rob);
  const hasSm = /^Sitemap:\s*https:\/\/nastyplot\.org\/sitemap\.xml$/m.test(rob);
  ok(hasUA && allows && hasSm, `5b. robots.txt allows crawling and names https://nastyplot.org/sitemap.xml (ua=${hasUA}, allow=${allows}, sitemap=${hasSm})`);
}

// 3c + 4b (rendered in Playwright): every top-level route + sample of Pokémon pages renders exactly one <h1>, all <img> have alt, and rendered JSON-LD is valid
const topRoutes = files.filter(f => !f.includes('/')).map(f => f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));
const pokeFiles = files.filter(f => f.startsWith('pokemon/'));
const samplePoke = ['pokemon/garchomp.html', 'pokemon/incineroar.html', 'pokemon/absol-mega.html']
  .filter(f => pokeFiles.includes(f));
if (!samplePoke.length && pokeFiles.length) samplePoke.push(...pokeFiles.slice(0, 3));
const routesToRender = [...topRoutes, ...samplePoke.map(f => '/' + f.replace(/\.html$/, ''))];

const mime = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2'};
const srv = http.createServer((req, res) => {
  try {
    let u = (req.url || '/').split('?')[0];
    if (u === '/') u = '/index.html';
    let f = path.join(DIST, u);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = f + '.html';
    if (!fs.existsSync(f)) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, {'Content-Type': mime[path.extname(f)] || 'application/octet-stream'});
    fs.createReadStream(f).pipe(res);
  } catch (e) { res.writeHead(500); res.end('500'); }
});
const h1Issues = [], imgDomIssues = [], ldDomIssues = [], renderErrors = [];
let b = null;
try {
  await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const port = srv.address().port;
  b = await chromium.launch();
  const pg = await b.newPage({viewport: {width: 1280, height: 900}});
  for (const r of routesToRender) {
    try {
      await pg.goto(`http://127.0.0.1:${port}${r}`, {waitUntil: 'domcontentloaded', timeout: 20000});
      await pg.waitForFunction(() => document.querySelectorAll('h1').length > 0 && !document.querySelector('.np-load'), null, {timeout: 8000}).catch(() => {});
      const res = await pg.evaluate(() => {
        const h1Count = document.querySelectorAll('h1').length;
        const imgsNoAlt = [...document.querySelectorAll('img')].filter(e => !e.hasAttribute('alt')).length;
        const lds = [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => e.textContent || '');
        return {h1Count, imgsNoAlt, lds};
      });
      if (res.h1Count !== 1) h1Issues.push(`${r}: ${res.h1Count} <h1>`);
      if (res.imgsNoAlt > 0) imgDomIssues.push(`${r}: ${res.imgsNoAlt} <img> without alt`);
      for (const txt of res.lds) {
        try {
          const obj = JSON.parse(txt);
          const hasCtx = Boolean(obj && obj['@context']);
          const hasType = Boolean(obj && (obj['@type'] || (Array.isArray(obj['@graph']) && obj['@graph'].length > 0 && obj['@graph'].every(n => n && n['@type']))));
          if (!hasCtx || !hasType) ldDomIssues.push(`${r}: rendered JSON-LD missing @context/@type`);
        } catch (e) { ldDomIssues.push(`${r}: rendered JSON-LD invalid (${e.message})`); }
      }
    } catch (e) {
      renderErrors.push(`${r}: ${String(e && e.message || e).split('\n')[0]}`);
    }
  }
} catch (e) {
  renderErrors.push(`browser/server error: ${String(e && e.message || e).split('\n')[0]}`);
} finally {
  if (b) await b.close().catch(() => {});
  try { srv.close(); } catch (e) {}
}

if (renderErrors.length) ok(false, `3-render. rendered checks ran cleanly (${fmt(renderErrors)})`);
ok(renderErrors.length === 0 && h1Issues.length === 0, `3c. exactly one <h1> on all ${routesToRender.length} rendered routes (${fmt(h1Issues.length ? h1Issues : renderErrors)})`);
ok(renderErrors.length === 0 && imgDomIssues.length === 0, `3d. every rendered <img> has alt on all ${routesToRender.length} routes (${fmt(imgDomIssues.length ? imgDomIssues : renderErrors)})`);
ok(renderErrors.length === 0 && ldDomIssues.length === 0, `4b. every rendered JSON-LD parses with @context and @type (${fmt(ldDomIssues.length ? ldDomIssues : renderErrors)})`);

console.log(fails ? `seo-check: ${fails} FAILED` : 'seo-check: ALL PASSED');
process.exit(fails ? 1 : 0);
