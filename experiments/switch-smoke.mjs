// switch-smoke.mjs (Kip job 54, Nov 26): automated switch-day smoke test for runbook step 8 ("verify on phone and desktop").
// Usage: node experiments/switch-smoke.mjs [path/to/v2.html]
// Optional env: SMOKE_OUT=<folder containing out/ JSON files> (default: repo out/)
// Serves the built page over local HTTP, seeds a saved team in localStorage + out/ data via window.claude, and visits
// 10 views at both 390x844 (phone) and 1440x900 (desktop):
//   Home, My Team (with saved team "Rain Check"), Meta, News, Gifts, Track Record, This Week, #pokemon/Garchomp, Speed Tiers, Events.
// Checks: 0 page errors, 0 console errors, non-empty main content, no sideways scroll, data date matches out/,
// and non-zero counts (Ratings, events, teams, news/post.json). Exits 1 with a clear list on any problem.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {perfDoc} from '../app/data-docs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.resolve(process.argv[2] || path.join(ROOT, 'app/dist/v2.html'));
const OUT = path.resolve(process.env.SMOKE_OUT || path.join(ROOT, 'out'));

const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };

if (!fs.existsSync(PAGE)) {
  console.log(`  FAIL  built page not found: ${PAGE}`);
  process.exit(1);
}

const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const POST = rd('post.json');
const DOCS = {
  'meta/results': L && L.results,
  'meta/perf': L ? perfDoc(L, rd('perf.json')) : null,
  'meta/doubles_tour': rd('meta_tour.json'),
  'meta/teams': rd('teams.json'),
  'meta/model': rd('model.json'),
  'meta/doubles': rd('meta_ladder.json'),
  'meta/doubles_ingame': rd('meta_ingame.json'),
  'meta/events': rd('events.json'),
  'meta/history': rd('history.json'),
  'meta/track': rd('track.json'),
  'meta/weekly': rd('weekly.json'),
  'meta/calendar': rd('calendar.json'),
  'meta/practice': rd('practice.json'),
  'meta/post': POST
};
for (const k of Object.keys(DOCS)) if (DOCS[k] == null) delete DOCS[k];

// Check required out/ files & compute expected "Data as of <Mon D>" from DATA_CORE (limitless/teams/events/model)
ok(Boolean(POST && Array.isArray(POST.news) && POST.news.length > 0), `out/post.json present with news (${POST && Array.isArray(POST.news) ? POST.news.length : 0} stories)`);
const coreMs = ['limitless.json', 'teams.json', 'events.json', 'model.json']
  .map(f => rd(f))
  .map(v => v && (v.updated || v.pulled || v.date))
  .map(t => t ? Date.parse(String(t).length === 10 ? t + 'T12:00:00' : t) : NaN)
  .filter(Number.isFinite);
const expectedDate = coreMs.length ? new Date(Math.min(...coreMs)).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '';
ok(Boolean(expectedDate), `expected data date from out/: "${expectedDate}"`);

// Seeded saved team (same shape as app/test/v2-saved.mjs)
const SLOTS = [
  {n: 'Incineroar', a: 'Intimidate', lock: false},
  {n: 'Rotom-Wash', a: null, lock: true},
  {n: 'Garchomp', a: 'Rough Skin', lock: false, mv: {doubles: ['Earthquake', 'Dragon Claw', 'Protect', 'Rock Slide']}, it: {doubles: 'Sitrus Berry'}},
  {n: 'Ninetales-Alola', a: null, lock: false},
  {n: 'Kingambit', a: null, lock: false},
  {n: 'Basculegion-F', a: null, lock: false}
];
const SEED_STATE = {
  slots: SLOTS,
  box: SLOTS.map(s => s.n),
  teams: [{id: 'tRainCheck1', name: 'Rain Check', slots: SLOTS, format: 'doubles', saved: 1762790000000}],
  loadedId: 'tRainCheck1', format: 'doubles', maxMega: 2, megaGoal: 1, megaV: 1, boxV: 2,
  opp: ['', '', '', '', '', ''], excl: [], log: [], leads: [], recentOpp: []
};

// Local HTTP server serving PAGE's directory, with fallbacks to app/ and app/src/v2/art/ for /art/*
const pageDir = path.dirname(PAGE);
const pageBase = '/' + path.basename(PAGE);
const mime = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2'};
const srv = http.createServer((req, res) => {
  try {
    const raw = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidates = [
      path.join(pageDir, raw === '/' ? pageBase : raw),
      path.join(ROOT, 'app', raw),
      raw.startsWith('/art/') ? path.join(ROOT, 'app/src/v2', raw) : null,
      raw.startsWith('/art-s/') ? path.join(ROOT, 'app/src/v2/art', raw.slice(7)) : null
    ].filter(Boolean);
    const f = candidates.find(p => fs.existsSync(p) && !fs.statSync(p).isDirectory());
    if (!f) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, {'Content-Type': mime[path.extname(f)] || 'application/octet-stream'});
    fs.createReadStream(f).pipe(res);
  } catch (e) { res.writeHead(500); res.end('500'); }
});

const ROUTES = [
  ['Home', '#home'],
  ['My Team (saved)', '#team'],
  ['Meta', '#meta'],
  ['News', '#news'],
  ['Gifts', '#gifts'],
  ['Track Record', '#track'],
  ['This Week', '#weekly'],
  ['Pokémon (Garchomp)', '#pokemon=Garchomp'],
  ['Speed Tiers', '#speed'],
  ['Events', '#events']
];

const VIEWPORTS = [
  {name: 'phone 390x844', width: 390, height: 844, isMobile: true, hasTouch: true},
  {name: 'desktop 1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false}
];

let b = null;
const summary = {};
try {
  await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const port = srv.address().port;
  b = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const ctx = await b.newContext({viewport: {width: vp.width, height: vp.height}, isMobile: vp.isMobile, hasTouch: vp.hasTouch});
    const pg = await ctx.newPage();
    const pageErrs = [], consoleErrs = [];
    pg.on('pageerror', e => pageErrs.push(e.message));
    pg.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });

    await pg.addInitScript(([D, ST]) => {
      const S = {};
      const doc = p => ({
        get: async () => ({exists: p in S, data: () => S[p]}),
        set: async d => { S[p] = JSON.parse(JSON.stringify(d)); },
        update: async d => { S[p] = Object.assign(S[p] || {}, JSON.parse(JSON.stringify(d))); },
        onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }
      });
      window.claude = {
        use: async n => n === 'db' ? {doc, collection: () => ({get: async () => ({docs: []})})}
          : n === 'user' ? {isOwner: () => false, can: () => true, id: async () => 'smoke_viewer'} : null
      };
      try {
        localStorage.setItem('cc2.welcomed', '"1"');
        localStorage.setItem('cc2.state', JSON.stringify(ST));
      } catch (e) {}
    }, [DOCS, SEED_STATE]);

    await pg.goto(`http://127.0.0.1:${port}${pageBase}#home`, {waitUntil: 'domcontentloaded', timeout: 60000});
    await pg.waitForFunction(() => document.querySelector('#main h1') && !document.querySelector('.np-load'), null, {timeout: 20000}).catch(() => {});
    await pg.waitForTimeout(400);

    summary[vp.name] = {};
    let peSeen = 0, ceSeen = 0;
    for (const [label, hash] of ROUTES) {
      await pg.evaluate(h => { location.hash = h; }, hash);
      await pg.waitForFunction(() => {
        const m = document.querySelector('#main');
        return m && m.textContent.trim().length > 40 && !m.querySelector('.np-load');
      }, null, {timeout: 12000}).catch(() => {});
      await pg.waitForTimeout(250);

      const info = await pg.evaluate(() => {
        const m = document.querySelector('#main');
        const txt = (m ? m.textContent : '').replace(/\s+/g, ' ').trim();
        const sw = document.documentElement.scrollWidth;
        const iw = window.innerWidth;
        const asOf = typeof window.V2 === 'object' && typeof V2.asOf === 'function' ? V2.asOf() : '';
        const notFound = Boolean(m && m.querySelector('[data-v2nf], [data-v2pknf]'));
        const monLinks = m ? m.querySelectorAll('[data-v2mon]').length : 0;
        const newsLinks = m ? m.querySelectorAll('.dp-hl, .nw2-ib a, .nw2-list a, a[href^="https://"]').length : 0;
        const numBefore = re => { const x = txt.match(re); return x ? Number(x[1].replace(/,/g, '')) : 0; };
        const evEl = m && m.querySelector('[data-evf="all"] .ev2-n, .ev-ns b');
        return {
          len: txt.length, txt: txt.slice(0, 600), sw, iw, asOf, notFound, monLinks, newsLinks,
          ratedN: numBefore(/(\d[\d,]*)\s*rated\s+Pok/i),
          teamsN: numBefore(/(\d[\d,]*)\s*(?:real\s+)?tournament\s+teams/i),
          eventsN: (evEl ? Number(evEl.textContent.replace(/[^\d]/g, '')) : 0) || numBefore(/(\d[\d,]*)\s*events\b/i),
          storiesN: numBefore(/(\d[\d,]*)\s*stories\b/i)
        };
      });

      const newPe = pageErrs.slice(peSeen), newCe = consoleErrs.slice(ceSeen);
      peSeen = pageErrs.length; ceSeen = consoleErrs.length;
      const probs = [];
      if (newPe.length) probs.push(`pageerror: ${newPe[0]}`);
      if (newCe.length) probs.push(`console.error: ${newCe[0]}`);
      if (info.len < 40) probs.push(`main empty (${info.len} chars)`);
      if (info.notFound) probs.push('rendered Not Found page');
      if (info.sw > info.iw + 1) probs.push(`sideways scroll (${info.sw}px > ${info.iw}px)`);
      if (hash === '#home') {
        if (expectedDate && !info.asOf.includes(expectedDate) && !info.txt.includes(expectedDate)) {
          probs.push(`data date mismatch (asOf="${info.asOf}", expected "${expectedDate}")`);
        }
        if (!(info.ratedN > 0)) probs.push(`Home rated Pokémon count is ${info.ratedN}`);
        if (!(info.teamsN > 0)) probs.push(`Home tournament teams count is ${info.teamsN}`);
        summary[vp.name] = {asOf: info.asOf, rated: info.ratedN, teams: info.teamsN};
      }
      if (hash === '#events') {
        summary[vp.name].events = info.eventsN;
        if (!(info.eventsN > 0)) probs.push(`Events count is ${info.eventsN}`);
      }
      if (hash === '#meta' && !(info.monLinks >= 10)) probs.push(`Meta shows only ${info.monLinks} Pokémon rows`);
      if (hash === '#team' && !info.txt.includes('Rain Check')) probs.push('saved team "Rain Check" not shown');
      if (hash === '#pokemon=Garchomp' && !/Garchomp/i.test(info.txt)) probs.push('Garchomp page did not render');
      if (hash === '#news') {
        summary[vp.name].stories = info.storiesN;
        if (!(info.storiesN > 0) && !(info.newsLinks > 0)) probs.push('News has 0 stories (out/post.json missing or empty)');
      }
      if (hash === '#gifts' && !/Mystery Gift|gift/i.test(info.txt)) probs.push('Gifts page missing Mystery Gift content');
      ok(probs.length === 0, `${vp.name} · ${label} (${hash}): ${probs.length ? probs.join('; ') : `ok (${info.len} chars, ${info.sw}/${info.iw}px)`}`);
    }
    await ctx.close();
  }
} catch (e) {
  ok(false, `smoke runner error: ${String(e && e.message || e).split('\n')[0]}`);
} finally {
  if (b) await b.close().catch(() => {});
  try { srv.close(); } catch (e) {}
}

console.log('Summary:', JSON.stringify(summary));
console.log(fails.length ? `switch-smoke: ${fails.length} FAILED` : 'switch-smoke: ALL PASSED');
process.exit(fails.length ? 1 : 0);
