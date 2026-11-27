// Builds the PokéLair page from src/ (parts.json lists the order). Output: dist/page.html, published as the artifact.
import fs from 'node:fs'; import crypto from 'node:crypto';
import {perfDoc} from './data-docs.mjs';
const parts = JSON.parse(fs.readFileSync(new URL('./parts.json', import.meta.url)));
import {fileURLToPath} from 'node:url';
// fileURLToPath works on Windows too (URL.pathname gives "/C:/..." there)
const dir = fileURLToPath(new URL('.', import.meta.url));
// Faster first load (Nov 2): the big data tables in src/data/*.js are written as `const X=<JSON>;`. A browser reads the same
// data from a JSON.parse('...') string much faster than from a JS object literal (it skips the full JavaScript parser), so
// each such line of 20 KB or more is rewritten that way. Only lines that are exactly `const NAME=<valid JSON>;` change, and
// the value is checked to come back identical; anything else is left alone. `node app/build.mjs --no-json-parse` turns it off.
const asJsonParse = (src) => process.argv.includes('--no-json-parse') ? src : src.split('\n').map(l => {
  const m = /^const ([A-Za-z_$][\w$]*)=(.*);$/.exec(l); if (!m || m[2].length < 20000) return l;
  let v; try { v = JSON.parse(m[2]); } catch (e) { return l; }
  const lit = "'" + m[2].replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(new RegExp('\\u2028', 'g'), '\\u2028').replace(new RegExp('\\u2029', 'g'), '\\u2029') + "'";
  if (/<\/script/i.test(lit) || JSON.stringify(JSON.parse(Function('return ' + lit)())) !== JSON.stringify(v)) return l;
  return `const ${m[1]}=JSON.parse(${lit});`; }).join('\n');
// Colour manga theme (Nov 4, Sim approved): src/theme/*.css are appended after polish.css inside the same <style> block.
// They write `@R` for a selector prefix strong enough to win over the older light/dark blocks without !important.
// `@C` (color.css) is one step stronger again, so the colour pass wins over manga.css without more !important.
// `@A` (arena*.css, Champions arena redesign, Nov 5) adds three more ids to `@C`, so arena wins over every older layer, including
// the older rules that carry an id of their own (#saveBtn, #homeOut, #lairSheet...).
// The rebuild's second build (R3, Nov 11; docs/rebuild/r3-foundation.md): node app/build.mjs --v2 writes dist/v2.html from
// parts-v2.json and stops; today's dist/page.html is not touched. CSS goes into cascade layers (tokens, base, components, shell,
// pages) so no selector ever needs to out-shout another. The data files and SPRITE_ID are shared with today's page.
if (process.argv.includes('--v2')) {
  /* --public: the build for real visitors (the live site at the switch, the public site in January). It leaves out the test hook
     (eval, code review C-I5), and pairs with no --preview-data, so the demo routes (#guide, #sheet, #team-empty; A1-M5) stay out too. */
  const PUBLIC = process.argv.includes('--public'); if (PUBLIC && process.argv.includes('--preview-data')) { console.error('--public and --preview-data do not mix'); process.exit(1); }
  const SPLIT_CSS = PUBLIC && process.argv.includes('--split-css');
  const SPLIT_ROUTES = PUBLIC && process.argv.includes('--split-routes');
  /* --cf-analytics=<site token> (Nov 25, queue item 4): Cloudflare's cookieless Web Analytics on the public site. Off unless given (Sim
     switches it on in the Cloudflare dashboard, which gives the token). With it, every public page gets Cloudflare's beacon script before
     </body> and the CSP allows exactly its script (script-src) and the address it reports to (connect-src); without it, no outside host
     at all (experiments/security-csp-test.mjs). Public builds only; the token must be letters and digits (it goes into the HTML). */
  const cfArg = process.argv.find(x => x.startsWith('--cf-analytics')), CF_TOKEN = cfArg ? cfArg.replace(/^--cf-analytics=?/, '') : '';
  if (cfArg && !PUBLIC) { console.error('--cf-analytics is for the public build only (add --public)'); process.exit(1); }
  if (cfArg && !/^[A-Za-z0-9]{16,64}$/.test(CF_TOKEN)) { console.error('--cf-analytics=<token>: the Web Analytics site token is 16 to 64 letters and digits'); process.exit(1); }
  const CF_SCRIPT = 'https://static.cloudflareinsights.com/beacon.min.js', CF_CONNECT = 'https://cloudflareinsights.com';
  // guard rails first: the build stops if the new CSS breaks the design rules (app/test/v2-guard.mjs)
  { const {spawnSync} = await import('node:child_process'); const g = spawnSync(process.execPath, [dir + 'test/v2-guard.mjs'], {stdio: 'inherit'}); if (g.status !== 0) process.exit(1); }
  const P = JSON.parse(fs.readFileSync(dir + 'parts-v2.json', 'utf8')), rd = f => fs.readFileSync(dir + f, 'utf8').replace(/\n$/, '');
  const layers = P.css.map(([n]) => n).join(', ');
  // code review C3 (Nov 15): /* */ comments are dropped from the shipped CSS (69 KB of 490), as the live build does; the source keeps them.
  // `--keep-comments` keeps them. JS comments are dropped by esbuild further down (code review B-I1).
  const noCom = c => process.argv.includes('--keep-comments') ? c : c.replace(/\/\*[\s\S]*?\*\//g, '');
  const css = `@layer ${layers};\n` + P.css.map(([n, f]) => `@layer ${n} {\n${noCom(rd(f))}\n}`).join('\n');
  const helpers = rd('src/app/15-visual-helpers.js'), i0 = helpers.indexOf('SPRITE_ID ='), sprite = helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1);
  JSON.parse(sprite); // fails the build if the shared sprite table ever stops being plain JSON
  const meta = fs.existsSync(dir + 'src/v2/art/meta.json') ? rd('src/v2/art/meta.json') : '{}';
  // the hero crowd's sprite sheets (Sim Q7a B, Nov 18; experiments/v2-crowd-sheets.py): where each picture sits in art/crowd-<n>.webp
  const crowd = PUBLIC ? 'null' : (fs.existsSync(dir + 'src/v2/art/crowd.json') ? rd('src/v2/art/crowd.json').trim() : 'null');
  // the real item pictures (Sim, Nov 23): experiments/v2-items.py writes art/items/<file>.webp and art/items.json (item name -> file) when
  // the PC's upscaled set is there; without it ITEM_IMG is {} and every item keeps our drawing (item-art.js). JSON.parse fails a bad map.
  const itemImg = fs.existsSync(dir + 'src/v2/art/items.json') ? JSON.stringify(JSON.parse(rd('src/v2/art/items.json'))) : '{}';
  /* Claude-hosted builds (--one-art-size: the Preview / live artifact) hold at most 511 files and already carry ~443, so the 166 item
     pictures go inside the page as data: URIs (192px WebP, about 1.2 MB) instead of files; the public site keeps the files (Nov 23) */
  /* --item-files / --public (phone speed, Nov 25-26): the public site has no 511-file limit, so --public always keeps the item
     pictures as files (art/items/) even with --one-art-size; inlined they were 1.56 MB of v2.js and phone LCP waited for them.
     Claude-hosted builds (--one-art-size without --public/--item-files) keep them inlined. */
  const itemImgOut = PUBLIC || !process.argv.includes('--one-art-size') || process.argv.includes('--item-files') ? itemImg : JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(itemImg)).map(([n, f]) => { const fp = dir + 'src/v2/art/items/' + f + '.webp'; return fs.existsSync(fp) ? [n, 'data:image/webp;base64,' + fs.readFileSync(fp).toString('base64')] : null; }).filter(Boolean)));
  // today's logic (P.logic, in today's order) is one closure: 00-main.js opens it, so the v2 shell and pages go inside it and it is
  // closed after the first draw. 15-visual-helpers.js brings SPRITE_ID itself when it is included.
  const L = P.logic || [], hasIds = L.some(f => f.endsWith('15-visual-helpers.js'));
  if (L.length && !L[0].endsWith('00-main.js')) throw new Error('parts-v2.json logic must start with src/app/00-main.js (it opens the closure)');
  /* code review C-I3 (Nov 16): the bundle is one closure, so two top-level functions with the same name silently let the later file win.
     The only ones allowed are the four hooks bridge.js answers for today's shared logic (render, scheduleRender, safe, toast); bridge.js is a
     v2 script, so it always comes after the logic. Any other duplicate stops the build. */
  { const BRIDGE = new Set(['render', 'scheduleRender', 'safe', 'toast']), where = new Map();
    for (const f of [...L, ...P.scripts]) for (const m of rd(f).matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) { if (!where.has(m[1])) where.set(m[1], []); where.get(m[1]).push(f); }
    const bad = [...where].filter(([n, fs]) => fs.length > 1 && !(BRIDGE.has(n) && fs.length === 2 && fs[1].endsWith('v2/bridge.js')));
    if (bad.length) { console.error('duplicate top-level functions: ' + bad.map(([n, fs]) => n + ' (' + fs.join(', ') + ')').join('; ')); process.exit(1); } }
  const PUBLIC_DEAD = PUBLIC ? new Set([
    'src/v2/pages/guide.js',
    'src/v2/pages/owner.js',
    'src/v2/pages/coming.js',
    'src/v2/pages/stampede-hero.js',
    'src/app/42-guide-data.js',
    'src/app/51-usage-data.js'
  ]) : null;
  const ROUTE_CHUNKS = {
    calc: ['src/v2/pages/calc.js', 'src/v2/pages/calc-plot.js'],
    battle: ['src/app/46-battle-data.js', 'src/v2/pages/battle.js', 'src/v2/pages/battle-pbp.js', 'src/v2/pages/battle-target.js'],
    gauntlet: ['src/app/38-gauntlet-data.js', 'src/v2/pages/gauntlet.js', 'src/v2/pages/test-piles.js'],
    practice: ['src/app/63-practice-data.js', 'src/v2/pages/practice.js'],
    compare: ['src/app/62-compare-data.js', 'src/v2/pages/compare.js', 'src/v2/pages/compare-faceoff.js'],
    build: ['src/app/22-auto-build.js', 'src/v2/pages/build.js', 'src/v2/pages/build-sheet.js', 'src/v2/pages/build-plot.js'],
    team: ['src/v2/pages/team-frame.js', 'src/v2/pages/matchups.js', 'src/v2/pages/sugs.js', 'src/v2/pages/record.js', 'src/v2/pages/share-slab.js', 'src/v2/pages/share-tape.js'],
    box: ['src/v2/pages/box.js'],
    events: ['src/v2/pages/events.js'],
    tournaments: ['src/v2/pages/winning.js'],
    archetypes: ['src/v2/pages/archetypes.js'],
    weekly: ['src/v2/pages/thisweek.js'],
    track: ['src/v2/pages/track.js'],
    natures: ['src/v2/pages/natures.js'],
    speed: ['src/v2/pages/speed.js'],
    types: ['src/app/20-types-data.js', 'src/v2/pages/types.js'],
    meta: ['src/v2/pages/meta.js'],
    usage: ['src/v2/pages/usage.js'],
    sets: ['src/v2/pages/sets.js'],
    pokemon: ['src/v2/pages/pokemon.js'],
    method: ['src/app/63-method-data.js', 'src/v2/pages/method.js'],
    about: ['src/v2/pages/about.js'],
    feedback: ['src/app/53-feedback-data.js', 'src/v2/pages/feedback.js'],
    'info-text': ['src/data/info-text.js']
  };
  const splitSet = SPLIT_ROUTES ? new Set(Object.values(ROUTE_CHUNKS).flat()) : null;
  const mainLogic = L.filter(f => !(PUBLIC_DEAD && PUBLIC_DEAD.has(f)) && !(splitSet && splitSet.has(f)));
  const logicSrc = mainLogic.map((f, i) => { let s = rd(f); if (SPLIT_ROUTES && i === 0) s = s.replace(/^\(function\(\)\{\r?\n?/, ''); return s; }).join('\n');
  const mainScripts = P.scripts.filter(f => !(PUBLIC && f.endsWith('test-hook.js')) && !(PUBLIC_DEAD && PUBLIC_DEAD.has(f)) && !(splitSet && splitSet.has(f)));
  const mainData = P.data.filter(f => !(splitSet && splitSet.has(f))).map(f => {
    let s = rd(f);
    /* Job 65: public --split --split-routes always ships /data/results.json and /data/perf.json; drop the stale baked-in fallbacks (use undefined, not null, since typeof null === 'object'). */
    if (PUBLIC && SPLIT_ROUTES && process.argv.includes('--split') && f.endsWith('data.js')) {
      s = s.replace(/^const RESULTS=.*;$/m, 'const RESULTS=undefined;').replace(/^const PERF_RAW=.*;$/m, 'const PERF_RAW=undefined;');
    }
    return asJsonParse(s);
  }).join('\n');
  const js = mainData + (hasIds ? '' : `\nconst SPRITE_ID=${sprite};`) + `\nconst ART_META=${meta};\nconst ART_CROWD=${crowd};\nconst ITEM_IMG=${itemImgOut};\n` + logicSrc + '\n' + mainScripts.map(rd).join('\n') + (PUBLIC_DEAD ? '\nV2.OWN=false;' : '') + '\nV2.draw();' + (L.length && !SPLIT_ROUTES ? '\n})();' : '');
  // where the pictures live: art/ beside the page by default; --art=<folder>/ when published next to other files (the redesign artifact)
  const artArg = (process.argv.find(x => x.startsWith('--art=')) || '').slice(6), artTag = artArg ? `<script>window.NP_ART=${JSON.stringify(artArg).replace(/</g, '\\u003c')};${process.argv.includes('--one-art-size') ? 'window.NP_ONE_ART=1;' : ''}</script>\n` : '';
  // --one-art-size (Nov 17): Claude-hosted builds (Preview, live artifact) use the 384px sprites only: an artifact holds at most 511 files,
  // too few for both sizes (346 + 346). The public site (January) keeps both sizes (sprites A).
  // --preview-data (redesign artifact only): a copy of today's daily data (out/*.json) answers the page's data requests, so a
  // preview shows the same numbers as the live site. Never used for the live site, which reads its own daily data.
  // Nov 12 (Sim's iPhone: no Strength Score, '#7 of 228' instead of '#7 of 321'): inside the Claude app window.claude can't be
  // replaced, so the data is also handed over as window.__NP_CLAUDE, which the page reads first.
  /* --split (Nov 18, first-visit speed; docs/rebuild/research/first-visit-nov18.md changes 1 and 2): the main script goes in dist/v2.js,
     loaded by a plain <script src> at the same spot (no preload tag: measured, a preload made slow 4G first paint worse, 2.8 -> 4.8 s),
     and with --preview-data the data goes in dist/preview.json. Measured: Chrome compiles an outside script off the main thread while it
     arrives. For hosted builds (the Preview, the live artifact); the file names carry a content hash (?v=) so a new page never runs with
     an old cached file. Without --split the page is one file, as the tests (file://) and CI read it. */
  const SPLIT = process.argv.includes('--split'), hash = t => crypto.createHash('sha256').update(t).digest('hex').slice(0, 12);
  let previewJson = null;
  for (const f of ['dist/v2.js', 'dist/v2.js.map', 'dist/v2.css', 'dist/preview.json']) fs.rmSync(dir + f, {force: true}); /* no stale split files beside a one-file build */
  fs.rmSync(dir + 'dist/routes', {recursive: true, force: true});
  let prevTag = '';
  if (process.argv.includes('--preview-data')) { const o = f => { try { return JSON.parse(fs.readFileSync(dir + '../out/' + f, 'utf8')); } catch (e) { return null; } }, L = o('limitless.json') || {};
    const D = {'meta/results': L.results, 'meta/perf': perfDoc(L, o('perf.json')), /* Nov 15: all of out/perf.json as the morning refresh writes it (ratings-snapshot.mjs); with adj alone the page fell back to its built-in Nov 1 ratings */ 'meta/doubles_tour': o('meta_tour.json'), 'meta/info': o('info.json'), /* info sheets (Nov 22): who runs each move, item and Ability */ 'meta/teams': o('teams.json'), 'meta/calendar': o('calendar.json'), 'meta/weekly': o('weekly.json'), 'meta/model': o('model.json'), 'meta/doubles': o('meta_ladder.json'), 'meta/events': o('events.json'), 'meta/track': o('track.json'), 'meta/history': o('history.json'), 'meta/practice': o('practice.json'), 'meta/doubles_ingame': o('meta_ingame.json'), /* Nov 18 (switch blocker 5): the Mystery Gifts and news list, as the daily job writes it (post-news.mjs); none = the page's built-in POST */ 'meta/post': o('post.json')};
    // privacy (Sim's review item 19, Nov 11): no real player name goes into the Preview's page source. Each name becomes the same
    // neutral stand-in everywhere it appears ("Player 12"), so matching a team to its own sets still works; none is shown on screen.
    { const ids = new Map(), anon = n => typeof n === 'string' && n ? (ids.has(n) || ids.set(n, 'Player ' + (ids.size + 1)), ids.get(n)) : n;
      for (const e of (D['meta/events'] || {}).events || []) for (const t of e.top || []) if (Array.isArray(t)) t[0] = anon(t[0]);
      for (const t of ((D['meta/teams'] || {}).teams || [])) if (t && 'player' in t) t.player = anon(t.player);
      for (const r of ((D['meta/weekly'] || {}).fresh || [])) if (Array.isArray(r)) r[5] = anon(r[5]); /* This Week's new-in-top-cut rows carry the player (never shown) */ }
    /* --split (first-visit speed, Nov 18; docs/rebuild/research/first-visit-nov18.md change 2): the data goes in preview.json beside the page,
       fetched from <head> as the page starts (no preload tag), so the page's own bytes arrive and draw sooner. Each answer waits for
       the file; if it can't be read (file://, or missing) every doc answers "not there", as a database with no data would. */
    const PV = SPLIT ? `const DP=fetch(${JSON.stringify('preview.json?v=' + hash(JSON.stringify(D)))}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(e=>{console.warn('preview.json: '+e);window.__NP_PVFAIL=String(e&&e.message||e);return {}});` /* review Nov 18 (C5): a 404 or other error answer is a failure, not data; V2.dataNote says so on every page */
      : `const D=JSON.parse(${JSON.stringify(JSON.stringify(D)).replace(/</g, '\\u003c')}) /* JSON.parse reads faster than an object literal (code review B-m5) */;`;
    const answer = SPLIT ? `DP.then(D=>setTimeout(()=>cb({exists:!!D[q],data:()=>D[q]}),5))` : `setTimeout(()=>cb({exists:!!D[q],data:()=>D[q]}),5)`;
    if (SPLIT) previewJson = JSON.stringify(D);
    prevTag = `<script>window.__NP_PREVIEW=1;(()=>{${PV}const real=window.claude,w={use:async n=>{if(n==='db')return {doc:q=>({onSnapshot:cb=>{${answer};return()=>{}},get:async()=>({exists:false}),set:async()=>{},update:async()=>{}})};return real&&real.use?real.use(n):null}};window.__NP_CLAUDE=w;try{window.claude=w}catch(e){}})();</script>\n`; }
  // fonts (Sim, Nov 11: privacy): hosted by NastyPlot itself, never Google's servers. fonts/ beside the page by default;
  // --fonts=<folder>/ when the files live elsewhere (as --art). The build fails if a Google Fonts link ever comes back.
  const fontsArg = (process.argv.find(x => x.startsWith('--fonts=')) || '').slice(8) || 'fonts/', fontCss = rd('src/v2/fonts/fonts.css').split('FONTS/').join(fontsArg);
  let head = rd(P.head); if (!head.includes('<!--NP-FONTS')) throw new Error('src/v2/head.html lost its <!--NP-FONTS--> marker');
  /* speed audit Nov 16 (Meta desktop shifted 0.110 on every first load when the fonts arrived): the two Latin files every page uses are
     preloaded, so the browser fetches them at once instead of after the page's scripts */
  const preload = ['unbounded-latin.woff2', 'instrument-sans-latin.woff2'].map(f => `<link rel="preload" href="${fontsArg}${f}" as="font" type="font/woff2" crossorigin>`).join('');
  head = head.replace(/<!--NP-FONTS[^>]*-->/, `${preload}<style>\n${fontCss}</style>`);
  /* the new logo's icons (Nov 16): generated by experiments/gen-logo-sly.mjs */
  if (head.includes('<!--NP-ICONS')) head = head.replace(/<!--NP-ICONS[^>]*-->/, fs.existsSync(dir + 'src/v2/icons.html') ? rd('src/v2/icons.html').trim() : ''); if (/fonts\.(googleapis|gstatic)\.com/.test(head)) throw new Error('a Google Fonts link is back in the v2 head');
  /* code review B-I1 (Nov 17): the scripts ship without comments and spare whitespace (esbuild, whitespace only: no renaming, so
     nothing that looks a name up changes). About 300 KB of comments came along before. --keep-comments skips it; without esbuild
     installed the page ships as before. */
  let esb = null;
  if (!process.argv.includes('--keep-comments')) { try { esb = (await import('node:module')).createRequire(import.meta.url)('esbuild'); } catch (e) { console.log('v2: esbuild not installed, scripts ship unminified'); } }
  let jsOut = js, jsMap = null, cssOut = css;
  const esbOpts = {loader: 'js', minify: true, target: 'es2020', drop: ['debugger'], charset: 'utf8', legalComments: 'none'};
  if (esb) {
    if (PUBLIC) {
      const r = esb.transformSync(js, {...esbOpts, sourcemap: SPLIT ? 'external' : false, sourcefile: 'v2.src.js'});
      jsOut = r.code; jsMap = r.map || null;
      cssOut = esb.transformSync(css, {loader: 'css', minify: true, charset: 'utf8', legalComments: 'none'}).code;
    } else {
      jsOut = esb.transformSync(js, {loader: 'js', minifyWhitespace: true, charset: 'utf8', legalComments: 'none'}).code;
    }
  }
  const routeManifest = {}, routeDeps = {}, routeRaw = {};
  if (SPLIT_ROUTES) {
    fs.mkdirSync(dir + 'dist/routes', {recursive: true});
    for (const [rk, files] of Object.entries(ROUTE_CHUNKS)) {
      const raw = files.filter(f => fs.existsSync(dir + f)).map(f => /^src\/data\/.*\.js$/.test(f) ? asJsonParse(rd(f)) : rd(f)).join('\n');
      if (!raw) continue;
      routeRaw[rk] = raw;
      const code = esb ? esb.transformSync(raw, esbOpts).code : raw;
      const fn = `${rk}.js`;
      fs.writeFileSync(dir + 'dist/routes/' + fn, code);
      routeManifest[rk] = `/routes/${fn}?v=${hash(code)}`; /* from the site root: /pokemon/x would look in /pokemon/routes/ (Nov 25) */
    }
    /* speed review (Nov 26): a page's file can call helpers that live in another page's file (Events draws Winning Teams' cards, This
       Week draws Events' tickets, "Set as Opponent" needs Battle's, Build's "Compare" needs Compare's: 9 crashes when a page was opened
       cold, experiments/split-routes-cross-test.mjs). Worked out here from the code itself, never by hand: for each page file, the other
       page files whose V2.<name> or top-level function it uses and the main script doesn't define. The page loads them with it (shell.js V2.loadRoute). */
    const defs = s => new Set([...s.matchAll(/\bV2\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)].map(m => m[1])), uses = s => new Set([...s.matchAll(/\bV2\.([A-Za-z_$][\w$]*)/g)].map(m => m[1]));
    const fnDefs = s => new Set([...s.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(m => m[1]));
    const mainDefs = defs(jsOut), mainFnDefs = fnDefs(js), chunkSrc = Object.fromEntries(Object.keys(routeManifest).map(rk => [rk, fs.readFileSync(dir + 'dist/routes/' + rk + '.js', 'utf8')]));
    const owner = {}, fnOwner = {};
    for (const [rk, s] of Object.entries(chunkSrc)) {
      for (const n of defs(s)) if (!mainDefs.has(n)) (owner[n] = owner[n] || new Set()).add(rk);
      for (const n of fnDefs(routeRaw[rk])) if (!mainFnDefs.has(n)) (fnOwner[n] = fnOwner[n] || new Set()).add(rk);
    }
    for (const [rk, s] of Object.entries(chunkSrc)) { const own = defs(s), ownFn = fnDefs(routeRaw[rk]), need = new Set();
      const soft = n => s.includes('V2.' + n + '&&') || s.includes('V2.' + n + '?'); /* only checked for (V2.FB && …, V2.buildHits ? …): optional, not a reason to load another page's file first */
      for (const n of uses(s)) if (!mainDefs.has(n) && !own.has(n) && owner[n] && !soft(n)) for (const o of owner[n]) if (o !== rk) need.add(o);
      for (const [n, owners] of Object.entries(fnOwner)) if (!ownFn.has(n) && new RegExp(`(?<!\\.)\\b${n}\\s*\\(`).test(routeRaw[rk])) {
        for (const o of owners) if (o !== rk && !routeRaw[rk].includes(`V2.needRoute('${o}'`) && !routeRaw[rk].includes(`V2.needRoute("${o}"`)) need.add(o);
      }
      if (need.size) routeDeps[rk] = [...need].sort(); }
  }
  let pubTag = '', seoRows = [], pokemonLd = null;
  if (PUBLIC) {
    const seoPath = dir + '../docs/rebuild/seo-titles-draft.md';
    const seoMap = {};
    if (fs.existsSync(seoPath)) {
      for (const line of fs.readFileSync(seoPath, 'utf8').split('\n')) {
        if (!line.startsWith('|')) continue;
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        if (cells.length !== 4 || cells[0] === 'Page (code)' || cells[0].startsWith('---')) continue;
        const [pgKey, addr, title, desc] = cells;
        if (addr.includes('{')) continue;
        const key = pgKey.split(/[\s(/]/)[0].toLowerCase();
        seoMap[key] = {path: addr, title, desc};
        seoRows.push({key, path: addr, title, desc});
      }
    }
    const {websiteJsonLd, jsonLdScriptTag, pokemonPageGraphJsonLd} = await import('./public-jsonld.mjs'); pokemonLd = (s, name) => jsonLdScriptTag(pokemonPageGraphJsonLd(s, name, seoMap.home || null));
    const wsLd = websiteJsonLd(seoMap.home || null);
    const ldRuntime = `(function(){var base=${JSON.stringify(wsLd).replace(/</g, '\\u003c')};function syncLd(){var el=document.getElementById('np-jsonld');if(!el)return;var p=String(location.pathname||'/').replace(/\\/+$/,'')||'/';if(p.indexOf('/pokemon/')===0){var slug='';try{slug=decodeURIComponent(p.slice(9)).replace(/\\.html$/,'')}catch(e){el.textContent=JSON.stringify(base);return}if(el.textContent.indexOf('"item":"https://nastyplot.org/pokemon/'+encodeURIComponent(slug)+'"')>=0)return;var label=null;try{var m=typeof byName==='object'&&byName&&byName.get(slug);if(m&&m.d)label=m.d;else if(typeof ROSTER==='object'&&window.V2&&V2.pubSlug){for(var i=0;i<ROSTER.length;i++)if(V2.pubSlug(ROSTER[i].n)===slug){label=typeof disp==='function'?disp(ROSTER[i].n):ROSTER[i].n;break}}}catch(e){}if(!label||document.querySelector('meta[name="robots"][content*="noindex"]')){el.textContent=JSON.stringify(base);return}var ws=Object.assign({},base);delete ws['@context'];el.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[ws,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'NastyPlot',item:'https://nastyplot.org/'},{'@type':'ListItem',position:2,name:'Pokémon A to Z',item:'https://nastyplot.org/pokemon'},{'@type':'ListItem',position:3,name:label,item:'https://nastyplot.org/pokemon/'+encodeURIComponent(slug)}]}]})}else{el.textContent=JSON.stringify(base)}}window.__npSyncJsonLd=syncLd;addEventListener('popstate',syncLd);addEventListener('hashchange',syncLd);var ps=history.pushState,rs=history.replaceState;if(ps)history.pushState=function(){var r=ps.apply(this,arguments);syncLd();return r};if(rs)history.replaceState=function(){var r=rs.apply(this,arguments);syncLd();return r};syncLd()})();`;
    pubTag = jsonLdScriptTag(wsLd) + '\n' + `<script>window.__NP_PUBLIC=1;window.__NP_SEO=${JSON.stringify(seoMap).replace(/</g, '\\u003c')};${SPLIT_ROUTES ? `window.__NP_ROUTES=${JSON.stringify(routeManifest).replace(/</g, '\\u003c')};window.__NP_RDEPS=${JSON.stringify(routeDeps).replace(/</g, '\\u003c')};` : ''}${ldRuntime}</script>\n`;
  }
  /* review Nov 18 (C6): if v2.js can't be fetched, the loading line gives way to the site's page error notice (V2.safeDraw's words).
     Security (Kip job 24, Nov 25): moved from an inline onerror attribute into a separate inline <script> right after it, which the
     public CSP allows by its sha256 hash, so script-src needs no 'unsafe-inline' or 'unsafe-hashes'. A plain <script src> blocks the
     parser, so this runs after v2.js has run or failed; !window.V2 means it never arrived. */
  const v2Fail = `document.addEventListener('DOMContentLoaded',function(){if(!window.V2){window.__NP_V2FAIL=1;var m=document.getElementById('main');if(m)m.innerHTML=${JSON.stringify('<section class="cm2"><div class="cm2-t"><h1 class="u">This page didn\u2019t load.</h1><p class="tm-sub">Part of the site didn\u2019t arrive. Reload to try again.</p></div></section>')}}})`;
  const mainTag = SPLIT ? `\n<script defer src="${'v2.js?v=' + hash(jsOut)}"></script>\n<script>${v2Fail}</script>\n` : `\n<script>\n${jsOut}\n</script>\n`;
  const styleTag = SPLIT_CSS ? `\n<link rel="stylesheet" href="${'v2.css?v=' + hash(cssOut)}">\n` : `\n<style>\n${cssOut}\n</style>\n`;
  const page = head.replace('<meta charset="utf-8">', m => m + pubTag + artTag + prevTag) + styleTag + rd(P.body) + mainTag + `</body></html>\n`;
  fs.mkdirSync(dir + 'dist', {recursive: true}); fs.writeFileSync(dir + 'dist/v2.html', page);
  if (SPLIT_CSS) fs.writeFileSync(dir + 'dist/v2.css', cssOut);
  if (SPLIT) { fs.writeFileSync(dir + 'dist/v2.js', jsOut); if (jsMap) fs.writeFileSync(dir + 'dist/v2.js.map', jsMap); if (previewJson) fs.writeFileSync(dir + 'dist/preview.json', previewJson);
    console.log(`v2 --split: dist/v2.js ${(jsOut.length / 1024).toFixed(0)} KB${SPLIT_CSS ? `, dist/v2.css ${(cssOut.length / 1024).toFixed(0)} KB` : ''}${previewJson ? `, dist/preview.json ${(previewJson.length / 1024).toFixed(0)} KB` : ''} (publish them beside the page)`); }
  /* Security headers for the public site (Kip job 24 part 1, Nov 25). script-src is 'self' plus the exact sha256 of every inline script the
     page carries (theme before paint, __NP_PUBLIC/__NP_SEO/JSON-LD runtime, NP_ART, the v2.js fallback), computed from the final HTML, so
     no 'unsafe-inline'/'unsafe-eval'. Data blocks (type="application/ld+json") don't run and need no hash. style-src keeps 'unsafe-inline'
     for style="" attributes (type chips, layout tokens). Checked by experiments/security-csp-test.mjs. */
  const securityHeaders = html => {
    const hashes = [];
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attrs = m[1], type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
      if (/\bsrc\s*=/i.test(attrs) || (type && !/^(text|application)\/(javascript|ecmascript)$|^module$/i.test(type))) continue;
      const h = `'sha256-${crypto.createHash('sha256').update(m[2], 'utf8').digest('base64')}'`;
      if (!hashes.includes(h)) hashes.push(h);
    }
    /* Turnstile (Nov 25, night plan 5): Cloudflare's script and its challenge frame, per developers.cloudflare.com/turnstile/reference/content-security-policy;
       the page loads them only on Send Feedback (feedback.js V2.tsLoad) */
    const TS = 'https://challenges.cloudflare.com';
    const csp = ["default-src 'none'", `script-src 'self' ${hashes.join(' ')} ${TS}${CF_TOKEN ? ' ' + CF_SCRIPT : ''}`.trim(), `frame-src ${TS}`, "style-src 'self' 'unsafe-inline'", "img-src 'self' data:", "font-src 'self'",
      `connect-src 'self'${CF_TOKEN ? ' ' + CF_CONNECT : ''}`, "manifest-src 'self'", "base-uri 'none'", "form-action 'none'", "object-src 'none'", "frame-ancestors 'none'", 'upgrade-insecure-requests'].join('; ');
    /* the app copies (/v2, /pokemon/404: the same page, 200 when asked for directly) and the light /404 say noindex; only they do, so /team doesn't inherit it */
    const noindex = ['/v2', '/v2.html', '/404', '/404.html', '/pokemon/404', '/pokemon/404.html'].map(p => `${p}\n  X-Robots-Tag: noindex\n`).join('');
    return noindex + ['/*', `  Content-Security-Policy: ${csp}`, '  X-Content-Type-Options: nosniff', '  Referrer-Policy: no-referrer',
      '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()', '  Cross-Origin-Opener-Policy: same-origin',
      '  X-Frame-Options: DENY', ''].join('\n');
  };
  let writeHeaders = null, ownFileRows = [], lastmod = '';
  if (PUBLIC) {
    fs.writeFileSync(dir + 'dist/robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://nastyplot.org/sitemap.xml\n');
    /* SEO fix 10 (Nov 25): <lastmod> = the data date, the oldest of the core parts the page's "Data as of" line stands on (results, teams,
       events, model: DATA_CORE in 02-set-data.js), read from out/ the same way (updated, pulled or date); the build date only if none
       has a date. The on-device pages (/box, /compare: a player's own box or teams, nothing to index) stay out. */
    const dataDates = []; for (const k of ['limitless', 'teams', 'events', 'model']) /* results = limitless.json's results (Kip job 34 #8b) */ for (const f of [`out/${k}.json`, `out/split/${k}.json`]) {
      try { const v = JSON.parse(fs.readFileSync(dir + '../' + f, 'utf8')), t = v && (v.updated || v.pulled || v.date); if (t && !isNaN(Date.parse(t))) { dataDates.push(new Date(Date.parse(String(t).length === 10 ? t + 'T12:00:00Z' : t)).toISOString().slice(0, 10)); break; } } catch (e) {} }
    lastmod = dataDates.sort()[0] || new Date().toISOString().slice(0, 10); if (!dataDates.length) console.log('public: no data date in out/, sitemap lastmod = build date ' + lastmod);
    const urls = seoRows.filter(r => !['/box', '/compare'].includes(r.path)).map(r => `  <url><loc>https://nastyplot.org${r.path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
    fs.writeFileSync(dir + 'dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    /* soft 404s (Nov 25, SEO): no '/* /v2.html 200' catch-all any more (every wrong address answered 200). Each tool address has its own
       rule, read from V2.PUB_PATHS (shell.js) so a new page can't be missed; anything else gets dist/404.html with status 404 (written below). */
    const pubM = rd('src/v2/shell.js').match(/^V2\.PUB_PATHS = (\{[^\n]*\});/m); if (!pubM) throw new Error('public build: V2.PUB_PATHS not found in shell.js');
    const pubPaths = [...new Set(Object.values(new Function('return ' + pubM[1])()))].filter(p => p !== '/');
    if (pubPaths.length < 15 || pubPaths.some(p => !/^\/[a-z0-9-]+$/.test(p))) throw new Error('public build: odd V2.PUB_PATHS: ' + pubPaths.join(' '));
    /* SEO fix 2 (Nov 25): a tool address with a row in the SEO map gets its own file (dist/team.html, written below; Pages serves it at
       /team), so it needs no rule; a rule stays only for an address without a file */
    ownFileRows = seoRows.filter(r => pubPaths.includes(r.path)); const ownFile = new Set(ownFileRows.map(r => r.path));
    /* Cloudflare audit (Nov 25, wrangler dev): a rule to /v2.html came back as a 307 to /v2 (html_handling) and the page showed "not found",
       so a remaining rule targets /v2; /<tool>/ answers 301 to /<tool> (it gave 404); the old /data/*, /art/*, /art-s/*, /fonts/*, /routes/*
       rules rewrote to themselves and are gone (files are served as they are; /data/* goes through the Worker). No splat lines left. */
    fs.writeFileSync(dir + 'dist/_redirects', pubPaths.map(p => `${p}/ ${p} 301\n`).join('') + pubPaths.filter(p => !ownFile.has(p)).map(p => `${p} /v2 200\n`).join(''));
    const cacheHeaders = '/v2.js\n  Cache-Control: public, max-age=31536000, immutable\n/v2.css\n  Cache-Control: public, max-age=31536000, immutable\n/static.css\n  Cache-Control: public, max-age=31536000, immutable\n/routes/*\n  Cache-Control: public, max-age=31536000, immutable\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/art/*\n  Cache-Control: public, max-age=2592000\n/art-s/*\n  Cache-Control: public, max-age=2592000\n/data/*\n  Cache-Control: public, max-age=300, stale-while-revalidate=3600\n';
    writeHeaders = html => fs.writeFileSync(dir + 'dist/_headers', securityHeaders(html) + cacheHeaders);
    writeHeaders(page);
  }
  /* Sim, Nov 16 (B-I3, option B): a static first screen. A phone used to show a blank page for about 2 s while the script ran (first paint
     2,016 -> 628 ms measured at 4x CPU with the header already in the HTML). The build opens the page it just made, copies the header and
     the phone bar the script draws (current-page marks removed: the right one is set by the first draw), and puts them in #app, so the
     same header shows at once and the first draw replaces it with no visible change. Skipped with --no-static or without Playwright. */
  if (!process.argv.includes('--no-static')) { let chromium = null; try { ({chromium} = await import('playwright')); } catch (e) { console.log('v2: playwright not installed, no static first screen'); }
    if (chromium) { const b = await chromium.launch(), pg = await b.newPage({viewport: {width: 1280, height: 900}});
      try { await pg.goto('file://' + dir + 'dist/v2.html#home'); await pg.waitForFunction(() => document.querySelector('#app .np-head'), null, {timeout: 15000});
        const parts = await pg.evaluate(() => { const g = s => { const e = document.querySelector('#app ' + s); if (!e) return ''; const c = e.cloneNode(true); c.querySelectorAll('[aria-current]').forEach(x => x.removeAttribute('aria-current')); return c.outerHTML; };
          return g('.np-skip') + g('.np-head') + '<main class="np-main" id="main">' + (window.V2 && V2.loadingHtml ? V2.loadingHtml() : '') + '</main>' + g('.np-bar'); }); /* pre-launch 2b (Nov 17): the loading panel from the first paint (slow 4G showed an empty page for ~3 s) */
        if (parts.includes('np-head') && page.includes('<div id="app"></div>')) { fs.writeFileSync(dir + 'dist/v2.html', page.replace('<div id="app"></div>', `<div id="app">${parts}</div>`)); console.log(`v2: static first screen ${(parts.length / 1024).toFixed(0)} KB`); }
      } catch (e) { console.log('v2: static first screen skipped (' + String(e.message).slice(0, 80) + ')'); } finally { await b.close(); } } }
  /* Job W (Nov 26, SEO) + Job 64 (speed program): in one Playwright session with today's out/ data, ask V2.preBlock for every page's SEO words
     (PRE) and, on --split --public, also its visible above-the-fold first screen (SCR for Home/tools, PK_SCR for all Pokémon) so each page's
     LCP element paints from static HTML before v2.js runs, with inline pruned critical CSS and CSP-safe async /v2.css. */
  const PRE = {}, SCR = {}, PK_SCR = {};
  const rosterForPre = PUBLIC ? (() => { const ln = fs.readFileSync(dir + 'src/data/data.js', 'utf8').split('\n')[0]; return JSON.parse(ln.slice(ln.indexOf('['), ln.lastIndexOf(']') + 1)); })() : [];
  if (PUBLIC && !process.argv.includes('--no-static')) { let chromium = null; try { ({chromium} = await import('playwright')); } catch (e) {}
    if (chromium) { const cwd = process.cwd(); let docs = null;
      try { process.chdir(dir + '..'); const {DOC_SOURCES} = await import(dir + '../split-docs.mjs'), {perfDoc} = await import(dir + 'data-docs.mjs');
        const rdo = f => { try { return JSON.parse(fs.readFileSync(dir + '../out/' + f, 'utf8')); } catch (e) { return null; } };
        docs = Object.fromEntries(Object.entries(DOC_SOURCES).map(([k, get]) => [k, get()])); docs.perf = perfDoc(rdo('limitless.json'), rdo('perf.json')); } catch (e) { docs = null; } finally { process.chdir(cwd); }
      if (!docs || !docs.results) console.log('public: no out/ data, pages keep only the loading panel in their static HTML');
      else {
        let srv = null;
        if (SPLIT) {
          const http = await import('node:http'), pathMod = await import('node:path');
          const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'};
          srv = http.createServer((q, s) => {
            const p = decodeURIComponent(q.url.split('?')[0]);
            const dm = p.match(/^\/data\/([a-z_0-9]+)\.json$/);
            if (dm) { s.writeHead(200, {'content-type': 'application/json'}); s.end(JSON.stringify(docs[dm[1]] ?? null)); return; }
            let f = pathMod.join(dir + 'dist', p);
            if ((!f.startsWith(dir + 'dist') || !fs.existsSync(f) || fs.statSync(f).isDirectory()) && p.startsWith('/art/')) f = pathMod.join(dir, 'src/v2', p);
            if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = dir + 'dist/v2.html';
            s.writeHead(200, {'content-type': T[pathMod.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s);
          });
          await new Promise(r => srv.listen(0, '127.0.0.1', r));
        }
        const b = await chromium.launch(), pg = await b.newPage({viewport: {width: SPLIT ? 390 : 1280, height: SPLIT ? 844 : 900}});
        try { await pg.addInitScript(D => { const snap = v => ({exists: v != null, data: () => v}); window.__NP_CLAUDE = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { const k = p.startsWith('meta/') ? p.slice(5) : ''; setTimeout(() => cb(snap(k && !k.endsWith('_2') ? D[k] : null)), 0); return () => {}; }, get: async () => snap(null), set: async () => {}, update: async () => {}})} : null}; }, docs);
          await pg.goto(srv ? `http://127.0.0.1:${srv.address().port}/` : 'file://' + dir + 'dist/v2.html#home');
          await pg.waitForFunction(() => window.V2 && V2._dataOk && document.querySelector('#main h1'), null, {timeout: 30000});
          const keys = seoRows.map(r => r.key), toolKeys = ownFileRows.map(r => r.key), pkNames = SPLIT ? rosterForPre.map(p => p.n) : [];
          const res = await pg.evaluate(async ({keys, toolKeys, pkNames, split}) => {
            const load = async rk => { if (!window.__NP_ROUTES || !window.__NP_ROUTES[rk]) return; const set = V2.routeSet ? V2.routeSet(rk) : [rk]; await Promise.all(set.map(k => V2.routeJs ? V2.routeJs(k).catch(() => {}) : Promise.resolve())); };
            const pre = Object.fromEntries(keys.map(k => [k, V2.preBlock ? V2.preBlock(k) : '']));
            const scr = {}, pk = {};
            if (split && V2.preBlock) {
              scr.home = V2.preBlock('home', {screenOnly: true});
              for (const k of toolKeys) { await load(k); scr[k] = V2.preBlock(k, {screenOnly: true}); }
              await load('pokemon');
              for (const n of pkNames) pk[n] = V2.preBlock('pokemon', {screenOnly: true, mon: n});
            }
            return {pre, scr, pk};
          }, {keys, toolKeys, pkNames, split: SPLIT});
          Object.assign(PRE, res.pre); Object.assign(SCR, res.scr); Object.assign(PK_SCR, res.pk);
          console.log(`public: static words for ${Object.values(PRE).filter(Boolean).length} pages (home: ${(String(PRE.home || '').match(/<h1>([^<]*)/) || [])[1] || 'none'})${SPLIT ? `; first screens: home=${SCR.home ? 'yes' : 'no'}, ${Object.values(SCR).filter(Boolean).length - (SCR.home ? 1 : 0)} tools, ${Object.values(PK_SCR).filter(Boolean).length} Pokémon` : ''}`);
        } catch (e) { console.log('public: static words skipped (' + String(e.message).slice(0, 80) + ')'); } finally { await b.close(); if (srv) srv.close(); } } } }
  const addPre = (html, key) => PRE[key] ? html.replace('<main class="np-main" id="main">', m => m + PRE[key]) : html;
  /* Public site, Nov 25 (Sim: quiet launch Dec 2-3; Kip job 31: one page per Pokémon is the fastest Google win).
     1. The page's own files load from the site root: on a two-level address (/pokemon/garchomp) a relative "v2.js" asked for
        /pokemon/v2.js and got the page back ("This page didn't load"). Done after the static first screen, which opens the file locally.
     2. One page per Pokémon, dist/pokemon/<slug>.html (Cloudflare Pages serves it at /pokemon/<slug>), with its own title, description
        and canonical address, so search engines see the right words before any script runs. Same slug rule as V2.pubSlug (pokemon.js). */
  if (PUBLIC) {
    let h = fs.readFileSync(dir + 'dist/v2.html', 'utf8');
    h = h.replace(/(src|href)="(v2\.(?:js|css)|fonts\/)/g, '$1="/$2').replace(/url\((['"]?)fonts\//g, 'url($1/fonts/'); /* quoted or not (Kip job 33 F5) */
    h = h.replace(/<link rel="icon" type="image\/svg\+xml" href="data:[^"]*">/, '<link rel="icon" type="image/svg+xml" href="/favicon.svg">')
      .replace(/<link rel="icon" type="image\/png" sizes="32x32" href="data:[^"]*">/, '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">')
      .replace(/<link rel="apple-touch-icon" sizes="180x180" href="data:[^"]*">/, '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">');
    /* SEO fix 6 (Nov 25): the link-preview picture is the brand kit's 720 px devil profile picture (4-social/facebook/facebook-profile-720.png,
       the one head.html's note names), copied as is to /og-image.png below; the old /og-icon.png was never published */
    const ogSrc = dir + '../docs/brand/nastyplot-brand-assets/4-social/facebook/facebook-profile-720.png'; if (!fs.existsSync(ogSrc)) throw new Error('public build: brand-kit og image missing');
    if (!h.includes('<meta property="og:image" content="https://nastyplot.org/og-icon.png">')) throw new Error('public build: og:image tag not found');
    h = h.replace('<meta property="og:image" content="https://nastyplot.org/og-icon.png">', '<meta property="og:image" content="https://nastyplot.org/og-image.png">'); fs.copyFileSync(ogSrc, dir + 'dist/og-image.png');
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    /* a page's own head: title + canonical, description, og:title, og:description (callbacks, so a '$' in a value is never a pattern) */
    /* SEO fix 6 (Nov 25): og:url = the canonical address, written with it */
    const ownHead = (html, title, desc, url) => html.replace(/<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>/g, '').replace(/<title>[^<]*<\/title>/, () => `<title>${esc(title)}</title><link rel="canonical" href="${url}"><meta property="og:url" content="${url}">`)
      .replace(/(<meta name="description" content=")[^"]*"/, (m, a) => `${a}${esc(desc)}"`).replace(/(<meta property="og:title" content=")[^"]*"/, (m, a) => `${a}${esc(title)}"`)
      .replace(/(<meta property="og:description" content=")[^"]*"/, (m, a) => `${a}${esc(desc)}"`);
    const homeRow = seoRows.find(r => r.path === '/'); if (homeRow) h = ownHead(h, homeRow.title, homeRow.desc, 'https://nastyplot.org/'); /* "/" (index.html) is Home */
    /* Web Analytics (--cf-analytics, above): Cloudflare's own snippet, added here so the Pokémon pages (made from h below) carry it too and the
       static first screen (opened from file:// above) never loads it */
    if (CF_TOKEN) { const at = h.lastIndexOf('</body>'); if (at < 0) throw new Error('public build: no </body> for the Web Analytics snippet');
      h = h.slice(0, at) + `<script defer src="${CF_SCRIPT}" data-cf-beacon='{"token": "${CF_TOKEN}"}'></script>\n` + h.slice(at); }
    fs.writeFileSync(dir + 'dist/v2.html', h);
    const roster = rosterForPre;
    const mainSrc = fs.readFileSync(dir + 'src/app/00-main.js', 'utf8'), regLine = mainSrc.match(/^const REG=.*$/m)[0], dispSrc = mainSrc.match(/^function disp\(n\)\{[\s\S]*?\n\}/m)[0];
    const disp = new Function(`${regLine}\n${dispSrc}\nreturn disp;`)();
    const slug = n => String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    /* the 840 KB stylesheet goes in one shared file (/v2.css) for the Pokémon pages: 346 inline copies made 322 MB (checked Nov 25) */
    let ph = h, v2CssRaw = ''; const st = [...h.matchAll(/<style>\n?([\s\S]*?)\n?<\/style>/g)].sort((x, y) => y[1].length - x[1].length)[0];
    if (st && st[1].length > 100000) { v2CssRaw = st[1]; fs.writeFileSync(dir + 'dist/v2.css', v2CssRaw); ph = h.replace(st[0], `<link rel="stylesheet" href="/v2.css?v=${hash(v2CssRaw)}">`); }
    const {pruneCss, applyCritCss} = SPLIT && v2CssRaw ? await import('./crit-css.mjs') : {pruneCss: null, applyCritCss: null};
    const putScreen = (html, scr, keepLoad) => scr ? html.replace(/<main class="np-main" id="main">[\s\S]*?<\/main>/, () => `<main class="np-main" id="main">${keepLoad ? '<span class="vh np-loading" aria-hidden="true"></span>' : ''}${scr}</main>`) : html;
    if (SPLIT) {
      h = putScreen(ph, SCR.home, true);
      if (pruneCss && v2CssRaw) h = applyCritCss(h, pruneCss(v2CssRaw, h));
      fs.writeFileSync(dir + 'dist/v2.html', h);
    }
    const pkCrit = SPLIT && pruneCss && v2CssRaw && Object.keys(PK_SCR).length ? pruneCss(v2CssRaw, ph + '\n' + ['Garchomp', 'Incineroar', 'Absol-Mega', 'Charizard-Mega-Y', 'Pikachu'].map(n => PK_SCR[n] || '').join('\n')) : '';
    const spriteIds = JSON.parse(sprite), artBase = (b => /^[a-z]/i.test(b) ? '/' + b : b)(artArg || 'art/');
    const seen = new Map(); fs.rmSync(dir + 'dist/pokemon', {recursive: true, force: true}); fs.mkdirSync(dir + 'dist/pokemon', {recursive: true}); /* only this build's pages (Kip job 33 F4) */
    for (const p of roster) {
      const s = slug(p.n); if (!s) throw new Error('public build: empty address for ' + p.n);
      if (seen.has(s)) throw new Error(`public build: ${p.n} and ${seen.get(s)} share the address /pokemon/${s}`); seen.set(s, p.n);
      const name = disp(p.n), title = (t => t.length <= 60 ? t : `${name}: Champions set, rating & partners`)(`${name} in Pokémon Champions: best set, rating & partners`) /* same as V2.pubTitle (pokemon.js) */, desc = `${name} in Pokémon Champions doubles: its best tournament set, its rating and its best partners, from real tournament results. Free, no account.`;
      const sid = spriteIds[p.n], pre = (SPLIT_ROUTES && routeManifest.pokemon ? `<link rel="preload" as="script" href="${routeManifest.pokemon}">` : '') + (sid == null || sid === '' ? '' : `<link rel="preload" as="image" href="${esc(artBase + sid + '.webp')}">`);
      let page = ownHead(ph, title, desc, `https://nastyplot.org/pokemon/${s}`).replace(/<script type="application\/ld\+json" id="np-jsonld">[\s\S]*?<\/script>/, () => pokemonLd(s, name)).replace('</head>', () => pre + '</head>');
      if (SPLIT && PK_SCR[p.n]) page = applyCritCss(putScreen(page, PK_SCR[p.n], false), pkCrit);
      fs.writeFileSync(dir + `dist/pokemon/${s}.html`, page);
    }
    /* SEO fix 2 (Nov 25): one file per tool page (dist/team.html at /team) with its own words from the SEO map, on the shared stylesheet */
    for (const r of ownFileRows) {
      let tp = ownHead(ph, r.title, r.desc, `https://nastyplot.org${r.path}`);
      if (SPLIT_ROUTES && routeManifest[r.key]) tp = tp.replace('</head>', () => `<link rel="preload" as="script" href="${routeManifest[r.key]}"></head>`);
      if (SPLIT && SCR[r.key]) {
        tp = putScreen(tp, SCR[r.key], true);
        if (pruneCss && v2CssRaw) tp = applyCritCss(tp, pruneCss(v2CssRaw, tp));
      } else if (SPLIT && pruneCss && v2CssRaw) {
        tp = applyCritCss(tp, pruneCss(v2CssRaw, tp));
      }
      fs.writeFileSync(dir + `dist${r.path}.html`, addPre(tp, r.key)); /* Job W + 64: static words + visible first screen */
    }
    const urls = [...seen.keys()].map(s => `  <url><loc>https://nastyplot.org/pokemon/${s}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
    fs.writeFileSync(dir + 'dist/sitemap.xml', fs.readFileSync(dir + 'dist/sitemap.xml', 'utf8').replace('</urlset>', urls + '\n</urlset>'));
    /* "/" (index.html) is v2.html + Home's SEO word block right after <main> (invariant checked by pokemon-pages-test.mjs & prerender-test.mjs) */
    fs.writeFileSync(dir + 'dist/index.html', addPre(h, 'home'));
    /* night queue 8 (Nov 26; SEO audit #9, #10): /pokemon, the A-to-Z page of every Pokémon page (plain links, in the sitemap), and a light
       static 404 with today's underdog; a wrong /pokemon/<name> keeps the app's own "No Pokémon here." view (dist/pokemon/404.html:
       Cloudflare serves the nearest 404.html). app/static-pages.mjs; checked by experiments/static-pages-test.mjs */
    { const {staticPages} = await import('./static-pages.mjs');
      const sp = await staticPages({dir, h, ph, ownHead, esc, pages: [...seen].map(([s, n]) => ({s, n})), lastmod});
      fs.writeFileSync(dir + 'dist/sitemap.xml', fs.readFileSync(dir + 'dist/sitemap.xml', 'utf8').replace('</urlset>', sp.sitemap + '\n</urlset>'));
      fs.appendFileSync(dir + 'dist/_redirects', '/pokemon/ /pokemon 301\n');
      console.log(`public: /pokemon (${(sp.sizeIndex / 1024).toFixed(0)} KB, ${seen.size} links) and a light 404 (${(sp.size404 / 1024).toFixed(1)} KB, underdog ${sp.underdog}; ${sp.asOf || 'no data date'})`); }
    /* the item pictures as external files beside the public build (art/items/*.webp, loaded only when an item picture is shown) */
    const itemArtDir = dir + 'src/v2/art/items/';
    if (fs.existsSync(itemArtDir)) { fs.mkdirSync(dir + 'dist/art/items', {recursive: true});
      for (const f of fs.readdirSync(itemArtDir)) if (f.endsWith('.webp')) fs.copyFileSync(itemArtDir + f, dir + 'dist/art/items/' + f); }
    /* the brand kit's icons at the site root (search engines look for /favicon.ico and a real icon URL; never redrawn, copied as is) */
    const icoDir = dir + '../docs/brand/nastyplot-brand-assets/3-website-icons/';
    for (const f of ['favicon.ico', 'favicon.svg', 'favicon-48.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) if (fs.existsSync(icoDir + f)) fs.copyFileSync(icoDir + f, dir + 'dist/' + f);
    console.log(`public: ${seen.size} Pokémon pages + sitemap entries, ${ownFileRows.length} tool pages; page files load from the site root; brand icons at the root`);
  }
  // the CSP hashes come from the page as finally written (the static first screen above rewrites it)
  if (writeHeaders) writeHeaders(fs.readFileSync(dir + 'dist/v2.html', 'utf8'));
  // the font files beside the built page (fonts/ is the default place the page reads them from)
  fs.mkdirSync(dir + 'dist/fonts', {recursive: true}); for (const f of fs.readdirSync(dir + 'src/v2/fonts')) if (f.endsWith('.woff2')) fs.copyFileSync(dir + 'src/v2/fonts/' + f, dir + 'dist/fonts/' + f);
  console.log(`built dist/v2.html (${(page.length / 1024).toFixed(0)} KB; ${P.css.length} CSS layers, ${P.data.length} data files, ${P.scripts.length} scripts${(P.logic || []).length ? `, ${P.logic.length} shared logic files` : ''})`);
  process.exit(0); }
const themeCss = s => s.replace(/@A/g, '@C:not(#_d):not(#_e):not(#_f)').replace(/@C/g, '@R:not(#_c)').replace(/@R/g, ':root:not(#_a):not(#_b)');
let out = parts.map(p => { const s = fs.readFileSync(dir + p, 'utf8').replace(/\n$/, ''); return /^src\/data\/.*\.js$/.test(p) ? asJsonParse(s) : /^src\/theme\/.*\.css$/.test(p) ? themeCss(s) : s; }).join('\n');
// Smaller page (Nov 1, load speed): whole-line // comments inside the app's plain <script> blocks are dropped, about 150 KB
// (57 KB gzipped, 10% of the download) that the phone no longer downloads or parses. Only lines that are nothing but a comment
// go; code, strings and the battle-log text block (<script type="text/plain">) are untouched. Checked by comparing an
// esbuild-minified copy of the scripts before and after (identical). `node app/build.mjs --keep-comments` keeps them.
let dropped = 0;
// The same for /* */ comments in the <style> block (about 10 KB gzipped more).
if (!process.argv.includes('--keep-comments')) {
  out = out.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => '<script>' + code.split('\n').filter(l => { const c = /^\s*\/\/[^\n]*$/.test(l); if (c) dropped++; return !c; }).join('\n') + '</script>');
  out = out.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => '<style>' + css.replace(/\/\*[\s\S]*?\*\//g, () => { dropped++; return ''; }) + '</style>'); }
// Darkrai on empty and loading screens (Sim, Nov 9; "just a pokemon we like", not a mascot; approved for live Nov 9). One small
// <script> sets window.NP_MASCOT to docs/mascot/darkrai.webp (PokeAPI HOME render 491, inked with app/sprite-ink.py); the app shows
// it only where window.NP_MASCOT is set (74-arena.js: the empty My Team).
{ const img = fs.readFileSync(dir + '../docs/mascot/darkrai.webp').toString('base64'), at = out.indexOf('<script');
  if (at < 0) throw new Error('no <script> in page'); out = out.slice(0, at) + `<script>window.NP_MASCOT='data:image/webp;base64,${img}';</script>` + out.slice(at); }
fs.mkdirSync(dir + 'dist', {recursive: true});
fs.writeFileSync(dir + 'dist/page.html', out);
// fonts (Sim, Nov 12): hosted by NastyPlot itself; the page reads them from fonts/ beside it, so they go next to page.html
if (/fonts\.(googleapis|gstatic)\.com/.test(out)) throw new Error('a Google Fonts link is back in the page');
fs.mkdirSync(dir + 'dist/fonts', {recursive: true}); for (const f of fs.readdirSync(dir + 'src/fonts')) if (f.endsWith('.woff2')) fs.copyFileSync(dir + 'src/fonts/' + f, dir + 'dist/fonts/' + f);
console.log(`built dist/page.html (${(out.length / 1024).toFixed(0)} KB from ${parts.length} parts${dropped ? `, ${dropped} comment lines dropped` : ''})`);
// Lighter page (Sim, Nov 5): drop CSS that can never match and minify (see slim.mjs). `--no-slim` skips it.
if (!process.argv.includes('--no-slim')) await import('./slim.mjs');
