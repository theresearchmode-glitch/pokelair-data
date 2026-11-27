// seo-audit.mjs (Job 68, Nov 26): full static SEO audit of the real public-site.mjs deploy folder.
// Checks every HTML file in SITE_DIR (default: site/, or SEO_DIST=<dir>):
//   1. <title> (1 per page, unique across indexable pages, length <= 60) & <meta name="description"> (1 per page, unique, 70-160 chars)
//   2. <link rel="canonical"> (1 per indexable page, matches https://nastyplot.org<path>, matches og:url); noindex ONLY on 404/v2/noindex pages
//   3. sitemap.xml (every indexable page listed once, no duplicates, all URLs resolve to 200 files, valid lastmod) & robots.txt
//   4. JSON-LD (parses cleanly, valid schema.org @context/@type/fields, no duplicate @id)
//   5. Pokémon pages (<h1> has the Pokémon's name, internal links use /pokemon/<slug>), full internal link crawl (0 broken links)
//   6. Words (no future "Reg M-C" claims, no claim that NastyPlot is official)
// Run: SEO_DIST=/tmp/site-66 node experiments/seo-audit.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.resolve(process.env.SEO_DIST || path.join(ROOT, 'site'));

if (!fs.existsSync(path.join(SITE, 'index.html'))) {
  console.error(`seo-audit: deploy folder not found in ${SITE}`);
  process.exit(1);
}

const decodeEnt = s => String(s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

const walkHtml = (dir, base = '') => {
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const rel = base ? base + '/' + e.name : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push({rel, full});
  }
  return out.sort((a, b) => a.rel.localeCompare(b.rel));
};

const htmlFiles = walkHtml(SITE);
const redirects = fs.existsSync(path.join(SITE, '_redirects')) ? fs.readFileSync(path.join(SITE, '_redirects'), 'utf8') : '';
const headers = fs.existsSync(path.join(SITE, '_headers')) ? fs.readFileSync(path.join(SITE, '_headers'), 'utf8') : '';

const NON_INDEXABLE = new Set(['404.html', 'pokemon/404.html', 'v2.html']);
const ON_DEVICE_NO_SITEMAP = new Set(['/box', '/compare']);

const relToPath = rel => {
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\.html$/, '');
};

// Resolve an internal path against the deploy folder (Cloudflare Pages rules)
const resolveUrlPath = p => {
  let clean = p.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return fs.existsSync(path.join(SITE, 'index.html'));
  clean = clean.replace(/\/+$/, '');
  const f1 = path.join(SITE, clean);
  if (fs.existsSync(f1) && !fs.statSync(f1).isDirectory()) return true;
  const f2 = path.join(SITE, clean + '.html');
  if (fs.existsSync(f2)) return true;
  const f3 = path.join(SITE, clean, 'index.html');
  if (fs.existsSync(f3)) return true;
  // Check _redirects 200 rules
  for (const ln of redirects.split('\n')) {
    const parts = ln.trim().split(/\s+/);
    if (parts.length >= 3 && parts[0] === clean && parts[2] === '200') return true;
  }
  return false;
};

const findings = [];
const add = (sev, cat, msg) => findings.push({sev, cat, msg});

const titles = new Map();
const descs = new Map();
const indexablePaths = new Set();
const badTitles = [], badDescs = [], badCanon = [], badNoindex = [], badLd = [], badPkH1 = [], badLinks = [], hashLinks = [], wordIssues = [];

for (const {rel, full} of htmlFiles) {
  const html = fs.readFileSync(full, 'utf8');
  const urlPath = relToPath(rel);
  const isNonIdx = NON_INDEXABLE.has(rel);
  const isOnDevice = ON_DEVICE_NO_SITEMAP.has(urlPath);
  if (!isNonIdx && !isOnDevice) indexablePaths.add(urlPath);

  // 1. Title & Description
  const tMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map(m => decodeEnt(m[1]).trim());
  const dMatches = [...html.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/gi)].map(m => decodeEnt(m[1]).trim());
  if (tMatches.length !== 1) badTitles.push(`${rel}: ${tMatches.length} <title> tags`);
  else if (!isNonIdx) {
    const t = tMatches[0];
    if (t.length === 0 || t.length > 60) badTitles.push(`${rel}: title len=${t.length} ("${t}")`);
    if (titles.has(t)) badTitles.push(`${rel}: duplicate title with ${titles.get(t)} ("${t}")`);
    else titles.set(t, rel);
  }
  if (dMatches.length !== 1) badDescs.push(`${rel}: ${dMatches.length} meta description tags`);
  else if (!isNonIdx) {
    const d = dMatches[0];
    if (d.length < 70 || d.length > 160) badDescs.push(`${rel}: desc len=${d.length} ("${d.slice(0, 80)}...")`);
    if (descs.has(d)) badDescs.push(`${rel}: duplicate desc with ${descs.get(d)}`);
    else descs.set(d, rel);
  }

  // 2. Canonical & noindex
  const cMatches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/gi)].map(m => m[1]);
  const ogUrl = (html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i) || [])[1] || '';
  const hasNoindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
  if (isNonIdx) {
    if (rel === '404.html' && cMatches.length > 0) badCanon.push(`${rel}: 404 has canonical`);
    if (rel !== 'v2.html' && !hasNoindex) badNoindex.push(`${rel}: missing meta noindex`);
  } else {
    const wantCanon = `https://nastyplot.org${urlPath}`;
    if (cMatches.length !== 1 || cMatches[0] !== wantCanon) badCanon.push(`${rel}: canonical=${JSON.stringify(cMatches)} want=${wantCanon}`);
    if (ogUrl !== wantCanon) badCanon.push(`${rel}: og:url=${ogUrl} want=${wantCanon}`);
    if (hasNoindex) badNoindex.push(`${rel}: unexpected meta noindex`);
  }

  // 3. JSON-LD
  const ldBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  if (!isNonIdx && ldBlocks.length === 0) badLd.push(`${rel}: no JSON-LD`);
  const pageIds = new Set();
  const VALID_TYPES = new Set(['WebSite', 'WebPage', 'CollectionPage', 'BreadcrumbList', 'ListItem', 'Organization', 'SearchAction', 'EntryPoint']);
  for (const raw of ldBlocks) {
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { badLd.push(`${rel}: invalid JSON-LD (${e.message})`); continue; }
    if (obj['@context'] !== 'https://schema.org') badLd.push(`${rel}: bad @context=${obj['@context']}`);
    const nodes = Array.isArray(obj['@graph']) ? obj['@graph'] : [obj];
    for (const nd of nodes) {
      if (!nd || typeof nd !== 'object') { badLd.push(`${rel}: non-object node`); continue; }
      if (!VALID_TYPES.has(nd['@type'])) badLd.push(`${rel}: unexpected @type=${nd['@type']}`);
      if (nd['@id']) {
        if (pageIds.has(nd['@id'])) badLd.push(`${rel}: duplicate @id=${nd['@id']}`);
        pageIds.add(nd['@id']);
      }
      if (nd['@type'] === 'WebSite' && (!nd.name || !nd.url)) badLd.push(`${rel}: WebSite missing name/url`);
      if (nd['@type'] === 'BreadcrumbList') {
        if (!Array.isArray(nd.itemListElement) || nd.itemListElement.length < 2) badLd.push(`${rel}: BreadcrumbList too short`);
        else for (const it of nd.itemListElement) {
          if (it['@type'] !== 'ListItem' || !it.position || !it.name || !it.item) badLd.push(`${rel}: malformed ListItem`);
        }
      }
      if (nd['@type'] === 'CollectionPage' && (!nd.name || !nd.url)) badLd.push(`${rel}: CollectionPage missing name/url`);
    }
  }

  const cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

  // 4. <h1> check (1 per indexable page; Pokémon pages must contain the Pokémon's display name)
  if (!isNonIdx) {
    const h1s = [...cleanHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => decodeEnt(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim());
    if (h1s.length !== 1) badPkH1.push(`${rel}: ${h1s.length} <h1> tags (${JSON.stringify(h1s)})`);
    else if (rel.startsWith('pokemon/') && rel !== 'pokemon/404.html') {
      const expectedName = (tMatches[0] || '').split(/ in Pokémon Champions|: Champions set/)[0].trim();
      if (expectedName && !h1s[0].toLowerCase().includes(expectedName.toLowerCase())) {
        badPkH1.push(`${rel}: h1="${h1s[0]}" missing name="${expectedName}"`);
      }
    }
  }

  // 5. Internal links crawl (on cleanHtml so JS string literals aren't mistaken for anchors)
  for (const m of cleanHtml.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)) {
    const href = decodeEnt(m[1]).trim();
    if (!href || href.startsWith('mailto:') || href.startsWith('https://') || href.startsWith('http://')) continue;
    if (href.startsWith('#')) {
      if (/^#pokemon=/i.test(href)) hashLinks.push(`${rel} -> ${href}`);
      continue;
    }
    if (href.startsWith('/')) {
      if (!resolveUrlPath(href)) badLinks.push(`${rel} -> ${href} (404)`);
    } else {
      badLinks.push(`${rel} -> relative href "${href}"`);
    }
  }

  // 6. Words check (visible text, excluding <script> and <style>)
  const body = decodeEnt(cleanHtml.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  if (/(?:before|coming(?:\s+in)?|next|upcoming)\s+Reg\s+M-C\b/i.test(body)) {
    const m = body.match(/.{0,30}(?:before|coming(?:\s+in)?|next|upcoming)\s+Reg\s+M-C.{0,30}/i);
    wordIssues.push(`${rel}: future Reg M-C claim: "${m[0].trim()}"`);
  }
  for (const om of body.matchAll(/.{0,35}\bofficial\b.{0,35}/gi)) {
    const snip = om[0].trim();
    if (/\bunofficial\b|official[- ](?:pok[eé]mon champions news|event|events|regionals|rules|api|news|in-game|10\b|this regulation)/i.test(snip)) continue;
    wordIssues.push(`${rel}: "official" mention: "${snip}"`);
  }
}

// 7. sitemap.xml & robots.txt
const smPath = path.join(SITE, 'sitemap.xml');
const rbPath = path.join(SITE, 'robots.txt');
const smIssues = [], rbIssues = [];
if (!fs.existsSync(smPath)) smIssues.push('sitemap.xml missing');
else {
  const sm = fs.readFileSync(smPath, 'utf8');
  const entries = [...sm.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?<\/url>/g)];
  const seenLocs = new Set();
  for (const [, loc, lm] of entries) {
    if (!loc.startsWith('https://nastyplot.org')) smIssues.push(`bad host: ${loc}`);
    if (seenLocs.has(loc)) smIssues.push(`duplicate in sitemap: ${loc}`);
    seenLocs.add(loc);
    if (!lm || !/^\d{4}-\d{2}-\d{2}$/.test(lm)) smIssues.push(`bad/missing lastmod on ${loc}: ${lm}`);
    const p = loc.replace(/^https:\/\/nastyplot\.org/, '') || '/';
    if (!resolveUrlPath(p)) smIssues.push(`sitemap URL 404 in deploy folder: ${loc}`);
  }
  for (const p of indexablePaths) {
    const loc = `https://nastyplot.org${p}`;
    if (!seenLocs.has(loc)) smIssues.push(`indexable page missing from sitemap: ${loc}`);
  }
  for (const loc of seenLocs) {
    const p = loc.replace(/^https:\/\/nastyplot\.org/, '') || '/';
    if (!indexablePaths.has(p)) smIssues.push(`non-indexable page in sitemap: ${loc}`);
  }
  console.log(`Sitemap: ${entries.length} URLs, ${indexablePaths.size} indexable pages`);
}
if (!fs.existsSync(rbPath)) rbIssues.push('robots.txt missing');
else {
  const rb = fs.readFileSync(rbPath, 'utf8');
  if (!/Allow:\s*\//.test(rb)) rbIssues.push('robots.txt missing Allow: /');
  if (/Disallow:\s*\//.test(rb)) rbIssues.push('robots.txt has Disallow: /');
  if (!/Sitemap:\s*https:\/\/nastyplot\.org\/sitemap\.xml/.test(rb)) rbIssues.push('robots.txt missing Sitemap URL');
}

const report = (label, arr, sev = 'FAIL') => {
  if (arr.length) {
    for (const m of arr.slice(0, 15)) add(sev, label, m);
    console.log(`  ${sev}  ${label}: ${arr.length} issue(s)`);
    for (const m of arr.slice(0, 10)) console.log(`         - ${m}`);
    if (arr.length > 10) console.log(`         ... (+${arr.length - 10} more)`);
  } else {
    console.log(`  PASS  ${label}: 0 issues`);
  }
};

console.log(`Checked ${htmlFiles.length} HTML files in ${SITE}`);
report('titles (1/page, unique, <=60 chars)', badTitles);
report('descriptions (1/page, unique, 70-160 chars)', badDescs);
report('canonicals & og:url', badCanon);
report('noindex rules', badNoindex);
report('JSON-LD validity & unique @id', badLd);
report('indexable page <h1> (exactly 1; Pokémon name present)', badPkH1);
report('static #pokemon= links (must be /pokemon/<slug>)', hashLinks);
report('broken internal links (404/relative)', badLinks);
report('sitemap.xml completeness & 200s', smIssues);
report('robots.txt', rbIssues);
report('words (future Reg M-C / official claims)', wordIssues);

const failCount = findings.filter(f => f.sev === 'FAIL').length;
console.log(`\nseo-audit: ${failCount ? failCount + ' FAILED' : 'ALL PASSED'}`);
process.exit(failCount ? 1 : 0);
