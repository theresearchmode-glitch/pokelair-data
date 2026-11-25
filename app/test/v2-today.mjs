// The new site on TODAY's data (switch readiness Nov 18, "Tests 3"). Every other new-site check runs on the frozen test data, so a bad
// day of data could break the page players get after the switch and still be promoted live. This smoke test builds the page the way
// it is published live (node app/build.mjs --v2 --public --split --one-art-size; only the art folder differs), serves it over http
// (the --split page fetches v2.js), and answers its data store with today's daily documents from out/, stored as the morning refresh
// stores them: one document per file (the list of split-docs.mjs, plus meta/perf built by data-docs.mjs), and a document over the size
// limit in two parts (meta/<k> + meta/<k>_2) split exactly as split-docs.mjs splits it. A signed-in account with nothing saved, so every
// page opens as a new visitor sees it. app/test/v2-sync.mjs (not in CI) compares the new page's numbers with the old page's; this one
// opens the routes and looks for anything broken.
// Fails (exit 1) on:
//   D1  a daily document missing from out/ or unreadable, or too big to store even in two parts
//   D2  a document the page was given but threw away while cleaning it (it would quietly use its built-in numbers), or a core
//       document (teams, events, model; results has no date of its own) without a date the page can read (the "Data as of" line). Needs the test hook, so
//       it runs on a second build with the hook (the same build without --public); everything else runs on the public build.
//   and on every route opened (each a fresh load, as a visitor opening a link):
//   P1  a page error or a console error (a page that fails to draw logs one: V2.safeDraw)
//   P2  the main section missing, still loading after 15 s, nearly empty, showing "This page didn't load.", or showing a page's
//       no-data notice ("... appear here after the next data refresh", "no data yet"): what a missing or emptied document looks like
//   P3  NaN / undefined / null / Infinity / [object ...] in the visible text
//   P4  a Strength Score that is not a whole number from 0 to 100; My Team must show one
//   P5  ratings: the Meta page's list (at least 20 Pokémon, each a number 0-100 and a tier) and the Pokémon page's rating and tier
//   P6  a broken picture, or any file the page asks for answering an error (404 etc.)
// What it can't see: whether a number is RIGHT (the data checks and logic checks judge that), layout and looks (qcheck-all, frozen
// data), Safari's engine, News when meta/post is broken (the page falls back to post.js; v2-post-doc.mjs tests that), and anything
// drawn only after a tap (sheets, Build for Me's result).
// Usage: node app/test/v2-today.mjs     (OUT=<folder> reads the daily files from another folder, for the failure proofs)
// Leaves app/dist/v2.html + v2.js as the public --split build.
import {chromium} from 'playwright'; import {spawnSync} from 'node:child_process'; import http from 'node:http'; import fs from 'node:fs';
import path from 'node:path'; import {fileURLToPath} from 'node:url'; import {perfDoc} from '../data-docs.mjs'; import {split, join, canon} from '../../split-docs.mjs';
const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url))), APP = path.join(ROOT, 'app'), OUT = path.resolve(process.env.OUT || path.join(ROOT, 'out'));
const T0 = Date.now(), fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); return c; };
const LIMIT = 200000, HARD = 262144, B = x => Buffer.byteLength(JSON.stringify(x)); // split-docs.mjs's limits

// D1: today's documents, as the refresh writes them
const bad = [], rd = f => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch (e) { bad.push(`${f} ${e.code === 'ENOENT' ? 'missing' : 'unreadable (' + String(e.message).slice(0, 60) + ')'}`); return null; } };
const L = rd('limitless.json') || {};
const WHOLE = {results: L.results, perf: perfDoc(L, rd('perf.json')), doubles_tour: rd('meta_tour.json'), teams: rd('teams.json'), history: rd('history.json'),
  model: rd('model.json'), doubles: rd('meta_ladder.json'), doubles_ingame: rd('meta_ingame.json'), events: rd('events.json'), track: rd('track.json'),
  practice: rd('practice.json'), weekly: rd('weekly.json'), calendar: rd('calendar.json'), post: rd('post.json')};
const empty = Object.keys(WHOLE).filter(k => !WHOLE[k] || typeof WHOLE[k] !== 'object');
ok(!bad.length && !empty.length, `D1 every daily document is in ${OUT.startsWith(ROOT + path.sep) ? path.relative(ROOT, OUT) : OUT}/ and readable (${Object.keys(WHOLE).length - empty.length} of ${Object.keys(WHOLE).length}${bad.length ? '; ' + bad.join(', ') : ''}${empty.length ? '; no document: ' + empty.join(', ') : ''})`);
const DOCS = {}, parts = [];
for (const [k, v] of Object.entries(WHOLE)) { if (!v || typeof v !== 'object') continue;
  if (B(v) <= LIMIT) { DOCS['meta/' + k] = v; continue; }
  const {a, b} = split(v), id = `${k}-v2-today`; a._part = {id, n: 1}; b._part = {id, n: 2};
  const same = canon(join(a, b)) === canon(v); parts.push(`${k} ${B(a)} + ${B(b)}`);
  if (!ok(same && B(a) <= HARD && B(b) <= HARD, `D1 ${k} (${B(v)} bytes) stores as two parts that fit and join back the same (${B(a)} + ${B(b)}, same: ${same})`)) continue;
  DOCS['meta/' + k] = a; DOCS['meta/' + k + '_2'] = b; }
console.log(`  note  stored in two parts, as the refresh does: ${parts.join(', ') || 'none'}`);

const build = (args, name) => { const r = spawnSync(process.execPath, [path.join(APP, 'build.mjs'), '--v2', '--split', '--one-art-size', '--art=../src/v2/art/', ...args], {encoding: 'utf8', cwd: ROOT});
  if (!ok(r.status === 0 && fs.existsSync(path.join(APP, 'dist/v2.js')), `the ${name} builds (--v2 --split --one-art-size${args.length ? ' ' + args.join(' ') : ''})`)) { console.log(r.stdout.slice(-800), r.stderr.slice(-800)); process.exit(1); } };

// a plain static server over app/ (the page at /dist/v2.html, its art at /src/v2/art/, fonts at /dist/fonts/)
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.css': 'text/css'};
const srv = http.createServer((q, s) => { const f = path.join(APP, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(APP + path.sep)) { s.writeHead(403); s.end(); return; }
  fs.readFile(f, (e, buf) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); s.end(buf); }); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const BASE = `http://127.0.0.1:${srv.address().port}/dist/v2.html`;
const b = await chromium.launch();
async function newPage(hook) { const ctx = await b.newContext({viewport: {width: 1280, height: 900}}), p = await ctx.newPage(); p.errs = []; p.http = [];
  p.on('pageerror', e => p.errs.push('page error: ' + String(e.message || e).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error') p.errs.push('console error: ' + m.text().slice(0, 160)); });
  p.on('response', r => { if (r.status() >= 400) p.http.push(r.status() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '')); });
  p.on('requestfailed', r => p.http.push('failed ' + r.url().replace(/^https?:\/\/[^/]+/, '')));
  await p.addInitScript(([D, hook]) => { if (hook) window.__PL_TEST = 1; const snap = v => ({exists: v != null, data: () => v, metadata: {}});
    const doc = k => ({onSnapshot: cb => { setTimeout(() => cb(snap(D[k])), 5); return () => {}; }, get: async () => snap(D[k]), set: async () => {}, update: async () => {}});
    window.claude = {use: async n => n === 'db' ? {doc} : n === 'user' ? {id: async () => 'u-v2-today'} : null}; }, [DOCS, hook]);
  return p; }
const settle = p => p.waitForFunction(() => { const m = document.querySelector('#main'); return !!(m && !m.querySelector('.np-loading') && m.textContent.trim().length); }, null, {timeout: 15000}).then(() => true, () => false);

// D2, on the build with the test hook
build([], 'build with the test hook');
{ const p = await newPage(true); await p.goto(BASE + '#home'); await settle(p); await p.waitForTimeout(400);
  const h = await p.evaluate(keys => { if (typeof window.__ev !== 'function') return {err: 'no test hook'};
    try { return window.__ev(`(${(keys => { const held = {}; for (const k of keys) held[k] = k === 'results' ? !!(META.results && RES === META.results) : META[k] != null;
      return {held, dated: DATA_CORE.filter(k => DATA_AT[k] != null), core: DATA_CORE, date: dataDateText()}; }).toString()})(${JSON.stringify(keys)})`); } catch (e) { return {err: String(e.message)}; } },
    Object.keys(WHOLE).filter(k => k !== 'post' && WHOLE[k]));
  const lost = h.held ? Object.keys(h.held).filter(k => !h.held[k]) : [];
  ok(!h.err && !lost.length, `D2 the page kept every document it was given (${h.err || (lost.length ? 'thrown away: ' + lost.join(', ') : Object.keys(h.held).length + ' kept')})`);
  /* meta/results carries no date of its own (limitless.json's results has no updated field); the page dates the data from the others */
  const undated = h.core ? h.core.filter(k => k !== 'results' && !h.dated.includes(k)) : ['?'];
  ok(!h.err && !undated.length && /^Data as of /.test(h.date), `D2 teams, events and model each carry a date the page reads ("${h.date || ''}"${undated.length ? '; no date: ' + undated.join(', ') : ''})`);
  ok(!p.errs.length, `D2 no page errors on the hook build${p.errs.length ? ': ' + p.errs.slice(0, 2).join(' | ') : ''}`);
  await p.context().close(); }

// P1-P6, on the public build (what players get)
build(['--public'], 'public build');
const p = await newPage(false);
/* the no-data notices the pages show when a daily document is missing or cleaned to nothing (a grep of app/src/v2, Nov 18). Left out: the
   Track Record's "High ratings that miss every top 8 show here after N events", which can be true on good data */
const NODATA_SRC = String.raw`appears? (here )?after the next (data |morning )?refresh|appear here after the next morning|check back after the next refresh|no data yet|no meta data loaded`;
const visit = async h => { await p.goto('about:blank'); p.errs.length = 0; p.http.length = 0; await p.goto(BASE + '#' + h); const drawn = await settle(p); await p.waitForTimeout(400);
  const s = await p.evaluate(async src => { const NODATA = new RegExp(src, 'i'), imgs = [...document.querySelectorAll('#app img')]; imgs.forEach(i => { i.loading = 'eager'; }); /* the lazy ones too */
    const broken = (await Promise.all(imgs.map(i => Promise.race([i.decode().then(() => null, () => i.getAttribute('src') || '(no src)'),
      new Promise(r => setTimeout(() => r(i.complete && i.naturalWidth ? null : (i.getAttribute('src') || '(no src)') + ' (not loaded in 5 s)'), 5000))])))).filter(Boolean);
    const m = document.querySelector('#main'), txt = (document.querySelector('#app') || document.body).innerText;
    const odd = (txt.match(/.{0,40}(\bNaN\b|\bundefined\b|\bnull\b|\bInfinity\b|\[object [A-Za-z]+\]).{0,40}/g) || []).map(x => x.replace(/\s+/g, ' ').trim());
    const t = (sel, el = document) => [...el.querySelectorAll(sel)].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    const rows = [...document.querySelectorAll('#app .gs-rows .gs-mon')].map(x => ({n: x.dataset.v2mon || '', sc: t('.gs-sc > .u', x).join(''), tier: (/(\S+) tier/.exec(x.getAttribute('aria-label') || '') || [])[1] || ''}));
    return {main: !!m, len: m ? m.innerText.trim().length : 0, failed: !!(m && /This page didn’t load\./.test(m.textContent)), nodata: m ? (m.innerText.match(NODATA) || [''])[0] : '', imgs: imgs.length, broken, odd, title: document.title,
      scores: t('#app .np-score b, #app .mtf-score .n') /* Nov 21: My Team frame (Sim approved): the header's big number */, rows, spot: {n: t('#app .ra-spot h2').join(''), sc: t('#app .ra-spot .gs-big b').join(''), tier: t('#app .ra-spot .gs-big i').join('')},
      pk: {h1: t('#app #pk-name').join(''), sc: t('#app .pk-rate b').join(''), tier: t('#app .pk-rate .tier-tag').join('')}}; }, NODATA_SRC);
  const tag = '#' + decodeURIComponent(h), num = x => /^\d{1,3}$/.test(x) && +x <= 100;
  ok(!p.errs.length, `P1 ${tag} no page or console errors${p.errs.length ? ': ' + [...new Set(p.errs)].slice(0, 3).join(' | ') : ''}`);
  ok(drawn && s.main && s.len >= 80 && !s.failed && !s.nodata, `P2 ${tag} draws its main section with data (${s.len} characters${!drawn ? '; still loading after 15 s' : ''}${s.failed ? '; says "This page didn’t load."' : ''}${s.nodata ? '; shows its no-data notice "' + s.nodata + '"' : ''}${!s.main ? '; no main section' : ''})`);
  ok(!s.odd.length, `P3 ${tag} no NaN / undefined / null / Infinity in the text${s.odd.length ? ': "' + s.odd.slice(0, 3).join('" | "') + '"' : ''}`);
  const badScore = s.scores.filter(x => !num(x));
  if (s.scores.length || h === 'team') ok(s.scores.length && !badScore.length, `P4 ${tag} Strength Score ${s.scores.join(', ') || 'missing'}${badScore.length ? ' (not a whole number 0-100: ' + badScore.join(', ') + ')' : ''}`);
  ok(!s.broken.length && !p.http.length, `P6 ${tag} all ${s.imgs} pictures load, no file answers an error${s.broken.length ? '; broken: ' + s.broken.slice(0, 3).join(', ') : ''}${p.http.length ? '; ' + [...new Set(p.http)].slice(0, 3).join(', ') : ''}`);
  return s; };

const ROUTES = ['home', 'team', 'build', 'battle', 'meta', 'news', 'gifts', 'tournaments', 'events', 'weekly', 'usage', 'archetypes', 'track', 'sets', 'speed', 'practice', 'gauntlet'];
let topMon = '';
for (const h of ROUTES) { const s = await visit(h);
  if (h === 'meta') { const badRows = s.rows.filter(r => !r.n || !/^\d{1,3}$/.test(r.sc) || +r.sc > 100 || !r.tier);
    ok(s.rows.length >= 20 && !badRows.length, `P5 #meta ratings list: ${s.rows.length} Pokémon, each with a rating 0-100 and a tier${badRows.length ? '; empty or odd: ' + badRows.slice(0, 3).map(r => JSON.stringify(r)).join(', ') : ''}`);
    ok(/^\d{1,3}$/.test(s.spot.sc) && +s.spot.sc <= 100 && / tier$/.test(s.spot.tier), `P5 #meta the spotlight shows ${s.spot.n}: "${s.spot.sc} ${s.spot.tier}" (the list starts with ${(s.rows[0] || {}).n} ${(s.rows[0] || {}).sc})`);
    topMon = (s.rows[0] || {}).n || ''; } }
// one Pokémon page: today's #1 on the Meta list (so the route follows today's data)
{ const slug = encodeURIComponent(String(topMon || 'Incineroar').toLowerCase()), s = await visit('pokemon=' + slug);
  ok(!!topMon && s.pk.h1.replace(/\s+/g, ' ').includes(topMon.replace(/-Mega.*/, '').replace(/-/g, ' ').split(' ')[0]) && s.title.startsWith(s.pk.h1.trim().replace(/^The file on /, '').replace(/\.$/, '')) /* reskin (Sim approved, Nov 21): the heading reads 'The file on <name>.'; the tab starts with the name */,
    `P5 #pokemon=${decodeURIComponent(slug)} opens that Pokémon's page (heading "${s.pk.h1}", tab "${s.title}")`);
  ok(/^\d{1,3}$/.test(s.pk.sc) && +s.pk.sc <= 100 && /^\S+ tier$/.test(s.pk.tier), `P5 #pokemon=${decodeURIComponent(slug)} rating "${s.pk.sc} ${s.pk.tier}"`); }
await b.close(); srv.close();
console.log(`v2-today: ${fails.length ? fails.length + ' failed' : 'all passed'} (${((Date.now() - T0) / 1000).toFixed(0)} s)`); process.exit(fails.length ? 1 : 0);
