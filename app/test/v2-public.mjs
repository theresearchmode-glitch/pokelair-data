// The build for real visitors (node app/build.mjs --v2 --public) carries no test hook and no demo routes (code review C-I5 +
// A1-M5, Nov 17): no eval in the shipped code, and #guide, #sheet and #team-empty exist only in the Preview. Builds it, opens it with
// the test flag set (which must do nothing), and checks the page still draws. Leaves app/dist/v2.html as the public build.
//   node app/test/v2-public.mjs
import {chromium} from 'playwright'; import {spawnSync} from 'node:child_process'; import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../', import.meta.url)), OUT = APP + 'dist/v2.html';
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const r = spawnSync(process.execPath, [APP + 'build.mjs', '--v2', '--public'], {encoding: 'utf8'});
ok(r.status === 0, 'the public build runs');
const h = fs.readFileSync(OUT, 'utf8');
ok(!/__ev\s*=/.test(h) && !/\beval\(/.test(h), 'no test hook (no __ev, no eval) in the page');
ok(!h.includes('__NP_PREVIEW=1'), 'no Preview data or stand-ins in the page');
ok(!/\bNP_SVG\s*=\s*(\{|JSON\.parse)/.test(h) && !h.includes('smallFlat'), 'no unused logo data (the old logo set and smallFlat; code review B-I4)');
{ const js = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1]).join('\n'), c = (js.match(/\/\* /g) || []).length + (js.match(/^\s*\/\/ /mg) || []).length;
  ok(c < 10, `the scripts ship without their comments (code review B-I1; ${c} comment marks left, about 2,700 before)`); }
const b = await chromium.launch(), p = await b.newPage({viewport: {width: 1280, height: 900}}), errs = [];
p.on('pageerror', e => errs.push(String(e))); await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + OUT + '#home'); await p.waitForTimeout(2500);
const s = await p.evaluate(() => ({ev: typeof window.__ev, h1: !!document.querySelector('#app h1'), hash: location.hash}));
ok(s.ev === 'undefined', 'the test flag opens no way in (window.__ev is ' + s.ev + ')');
ok(s.h1, 'Home draws');
for (const r of ['guide', 'sheet', 'team-empty']) { await p.goto('file://' + OUT + '#' + r); await p.waitForTimeout(800);
  /* Sim's Q24 A (Nov 19): an unknown address shows the not-found page ('Nothing here.'), no longer Home */
  const t = await p.evaluate(() => document.title); ok(t === 'Page not found · NastyPlot', `#${r} is not a page here: it shows the not-found page like any unknown address (tab title: ${t})`); }
/* Pokémon pictures with width/height attributes (public-site job 19, Nov 25) keep the box their CSS gives them: My Box's tiles were
   49 wide and 240 tall at 390 (the height attribute beat aspect-ratio:1), the Box page ~900px longer. Square and inside the tile. */
for (const w of [390, 1440]) { const q = await b.newPage({viewport: {width: w, height: 900}}); await q.goto('file://' + OUT + '#box'); await q.waitForTimeout(2500);
  const m = await q.evaluate(() => [...document.querySelectorAll('.mb-t img')].map(i => { const r = i.getBoundingClientRect(), t = i.closest('.mb-t').getBoundingClientRect(); return [+r.width.toFixed(1), +r.height.toFixed(1), +t.height.toFixed(1)]; }));
  const bad = m.filter(([iw, ih, th]) => Math.abs(iw - ih) > 1 || ih > th + 1);
  ok(m.length > 0 && !bad.length, `#box at ${w}: every tile picture is square and inside its tile (${m.length} pictures${bad.length ? '; wrong [w, h, tile h]: ' + JSON.stringify(bad.slice(0, 3)) : ''})`); await q.close(); }
ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0].slice(0, 120) : ''));
await b.close();
console.log(`v2-public: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
