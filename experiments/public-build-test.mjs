// Public site build invariants (job 19: merged jobs 6+7, Node-only).
// Usage: node experiments/public-build-test.mjs     (run after: node app/build.mjs --v2 --public)
import fs from 'node:fs';
import vm from 'node:vm';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const rd = p => fs.readFileSync(ROOT + p, 'utf8');
const results = [];
const check = (id, ok, detail) => results.push({id, ok: !!ok, detail: String(detail || '')});

// PUB-1: SEO draft static titles <= 60 chars, descriptions <= 155 chars
// (HH note: Home title is currently 62 chars in docs/rebuild/seo-titles-draft.md; this check intentionally fails until HH edits it.)
{
  const lines = rd('docs/rebuild/seo-titles-draft.md').split('\n');
  const badTitle = [], badDesc = [];
  let count = 0;
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    const c = line.split('|').slice(1, -1).map(x => x.trim());
    if (c.length !== 4 || c[0] === 'Page (code)' || c[0].startsWith('---')) continue;
    const [page, addr, title, desc] = c;
    if (addr.includes('{')) continue;
    count++;
    if (title.length > 60) badTitle.push(`${page} (${title.length} chars): ${title}`);
    if (desc.length > 155) badDesc.push(`${page} (${desc.length} chars)`);
  }
  check('PUB-1', count >= 20 && badTitle.length === 0 && badDesc.length === 0,
    JSON.stringify({checked: count, badTitle, badDesc}));
}

// PUB-2: Built public dist/v2.html has __NP_PUBLIC, __NP_SEO, no test-hook eval, no Google Fonts
{
  const distPath = ROOT + 'app/dist/v2.html';
  if (!fs.existsSync(distPath)) {
    check('PUB-2', false, 'app/dist/v2.html not found (run: node app/build.mjs --v2 --public)');
  } else {
    const html = fs.readFileSync(distPath, 'utf8');
    const hasPub = html.includes('window.__NP_PUBLIC=1');
    const hasSeo = html.includes('window.__NP_SEO=');
    const noEval = !html.includes('window.__ev=');
    const noGFonts = !/fonts\.(googleapis|gstatic)\.com/.test(html);
    check('PUB-2', hasPub && hasSeo && noEval && noGFonts,
      JSON.stringify({hasPub, hasSeo, noEval, noGFonts}));
  }
}

// PUB-3: Public static assets (robots.txt, sitemap.xml, _redirects, _headers)
{
  const need = ['app/dist/robots.txt', 'app/dist/sitemap.xml', 'app/dist/_redirects', 'app/dist/_headers'];
  const missing = need.filter(f => !fs.existsSync(ROOT + f));
  if (missing.length) {
    check('PUB-3', false, 'missing: ' + missing.join(', '));
  } else {
    const robots = rd('app/dist/robots.txt');
    const sitemap = rd('app/dist/sitemap.xml');
    const redirects = rd('app/dist/_redirects');
    const headers = rd('app/dist/_headers');
    const ok = robots.includes('Sitemap: https://nastyplot.org/sitemap.xml') &&
      sitemap.includes('<loc>https://nastyplot.org/gifts</loc>') &&
      sitemap.includes('<loc>https://nastyplot.org/privacy</loc>') &&
      redirects.includes('/* /v2.html 200') &&
      headers.includes('Cache-Control:');
    check('PUB-3', ok, JSON.stringify({robots: robots.length, sitemap: sitemap.length, redirects: redirects.length, headers: headers.length}));
  }
}

// PUB-4: Clean-URL routing (/gifts, /privacy -> about=priv) and teamLinkBase() public fallback
{
  const sh = rd('app/src/v2/shell.js');
  const tl = rd('app/src/app/45-team-links.js');
  const m = sh.match(/V2\.PUB_PATHS = \{[\s\S]*?\};\nV2\.PUB_FROM_PATH = [\s\S]*?return null; \};/);
  let routeOk = false;
  if (m) {
    const ctx = {V2: {pages: {about: {}, gifts: {}, home: {}, pokemon: {}}}};
    vm.createContext(ctx);
    vm.runInContext(m[0], ctx);
    const priv = ctx.V2.PUB_FROM_PATH('/privacy');
    const gifts = ctx.V2.PUB_FROM_PATH('/gifts');
    const mon = ctx.V2.PUB_FROM_PATH('/pokemon/Incineroar');
    routeOk = priv && priv.r === 'about' && priv.sub === 'priv' &&
      gifts && gifts.r === 'gifts' &&
      mon && mon.r === 'pokemon' && mon.sub === 'Incineroar';
  }
  const tlOk = tl.includes("window.__NP_PUBLIC ? 'https://www.google.com/url?sa=E\&source=gmail\&q=https://nastyplot.org/' : TL_ART");
  check('PUB-4', routeOk && tlOk, JSON.stringify({routeOk, tlOk}));
}

// PUB-5: 03-persistence.js has single unified META_KEYS.forEach handler (no duplicated handler)
{
  const p = rd('app/src/app/03-persistence.js');
  const count = (p.match(/META_KEYS\.forEach/g) || []).length;
  check('PUB-5', count === 1 && p.includes('window.__NP_PUBLIC'), JSON.stringify({metaKeysForEachCount: count}));
}

// PUB-6: build.mjs gates --split-css, --split-routes, and C1 minify behind PUBLIC
{
  const b = rd('app/build.mjs');
  const ok = b.includes("const SPLIT_CSS = PUBLIC && process.argv.includes('--split-css');") &&
    b.includes("const SPLIT_ROUTES = PUBLIC && process.argv.includes('--split-routes');") &&
    b.includes("if (PUBLIC)") &&
    b.includes("minifyWhitespace: true");
  check('PUB-6', ok, JSON.stringify({gatedBehindPublic: ok}));
}

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.id}: ${r.detail}`);
  if (!r.ok) failed++;
}
if (failed) process.exitCode = 1;
