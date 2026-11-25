// Schema.org JSON-LD validation for the public build (Node 22, zero dependencies).
// Usage: node experiments/jsonld-test.mjs
import fs from 'node:fs';
import {
  SITE_ORIGIN, websiteJsonLd, pokemonBreadcrumbJsonLd, pokemonPageGraphJsonLd, jsonLdScriptTag,
} from '../app/public-jsonld.mjs';

let failed = 0;
const check = (id, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ': ' + detail : ''}`);
  if (!ok) failed++;
};

const isHttpsUrl = s => typeof s === 'string' && /^https:\/\/nastyplot\.org(\/|$)/.test(s);

// LD-1: Read home row from docs/rebuild/seo-titles-draft.md (values strictly from existing data)
let homeDesc = '';
{
  const lines = fs.readFileSync('docs/rebuild/seo-titles-draft.md', 'utf8').split('\n');
  for (const line of lines) {
    if (!line.startsWith('| home ')) continue;
    const c = line.split('|').slice(1, -1).map(x => x.trim());
    homeDesc = c[3] || '';
  }
  check('LD-1-seo-draft-home-desc', homeDesc.length > 20, `len=${homeDesc.length}`);
}

// LD-2: WebSite required schema.org fields + NO bogus SearchAction (public site has no /?q= search URL)
{
  const ws = websiteJsonLd({desc: homeDesc});
  const ok = ws['@context'] === 'https://schema.org' &&
    ws['@type'] === 'WebSite' &&
    ws.name === 'NastyPlot' &&
    ws.url === SITE_ORIGIN + '/' &&
    ws.description === homeDesc &&
    !('potentialAction' in ws);
  check('LD-2-website-schema-no-searchaction', ok, JSON.stringify(ws));
}

// LD-3: BreadcrumbList required schema.org fields for /pokemon/<name>
{
  const bc = pokemonBreadcrumbJsonLd('Charizard-Mega-Y', 'Mega Charizard Y');
  const items = bc && bc.itemListElement;
  const ok = bc &&
    bc['@context'] === 'https://schema.org' &&
    bc['@type'] === 'BreadcrumbList' &&
    Array.isArray(items) && items.length === 3 &&
    items.every((it, i) => it['@type'] === 'ListItem' && it.position === i + 1 && typeof it.name === 'string' && it.name.length > 0 && isHttpsUrl(it.item)) &&
    items[0].item === 'https://nastyplot.org/' &&
    items[1].item === 'https://www.google.com/url?sa=E\&source=gmail\&q=https://nastyplot.org/meta' &&
    items[2].name === 'Mega Charizard Y' &&
    items[2].item === 'https://nastyplot.org/pokemon/Charizard-Mega-Y';
  check('LD-3-pokemon-breadcrumb-schema', ok, JSON.stringify(items));
}

// LD-4: Combined @graph on /pokemon/<name> has valid WebSite + BreadcrumbList
{
  const g = pokemonPageGraphJsonLd('Incineroar', 'Incineroar', {desc: homeDesc});
  const ok = g['@context'] === 'https://schema.org' &&
    Array.isArray(g['@graph']) && g['@graph'].length === 2 &&
    g['@graph'][0]['@type'] === 'WebSite' &&
    g['@graph'][1]['@type'] === 'BreadcrumbList' &&
    !('@context' in g['@graph'][0]) && !('@context' in g['@graph'][1]);
  check('LD-4-pokemon-graph-schema', ok);
}

// LD-5: jsonLdScriptTag produces valid JSON inside <script type="application/ld+json"> and escapes </script
{
  const tag = jsonLdScriptTag(websiteJsonLd({desc: 'Test </script> safe'}));
  const m = tag.match(/^<script type="application\/ld\+json" id="np-jsonld">([\s\S]+)<\/script>$/);
  let parsed = null;
  if (m) parsed = JSON.parse(m[1]);
  check('LD-5-script-tag-safe-json', !!m && !tag.includes('</script> safe') && parsed && parsed['@type'] === 'WebSite');
}

// LD-6: app/build.mjs gates JSON-LD strictly behind PUBLIC and adds nothing to body
{
  const b = fs.readFileSync('app/build.mjs', 'utf8');
  const ok = b.includes("await import('./public-jsonld.mjs')") &&
    b.includes('jsonLdScriptTag(wsLd)') &&
    b.includes('BreadcrumbList') &&
    !b.includes('SearchAction');
  check('LD-6-build-public-only-no-searchaction', ok);
}

// LD-7: Built app/dist/v2.html (when present and public) has valid parseable JSON-LD in <head>
if (fs.existsSync('app/dist/v2.html')) {
  const html = fs.readFileSync('app/dist/v2.html', 'utf8');
  if (html.includes('window.__NP_PUBLIC=1')) {
    const m = html.match(/<script type="application\/ld\+json" id="np-jsonld">([\s\S]*?)<\/script>/);
    const obj = m ? JSON.parse(m[1]) : null;
    check('LD-7-dist-v2-has-valid-jsonld', !!(obj && obj['@context'] === 'https://schema.org' && obj['@type'] === 'WebSite' && obj.url === 'https://nastyplot.org/'));
  }
}

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
if (failed) process.exit(1);
