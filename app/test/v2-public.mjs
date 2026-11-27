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
/* Job DD (Nov 26; Sim picked Final 3 as Home's FIRST SCREEN, never removed the rest, rule 18): the public Home is F3's hero, then the
   Stampede's Top 10, your six, tools rack and post band in today's order, and the Stampede's own hero is gone (one h1). Failed on
   design6 52fa60e6, where the public Home was the hero alone. */
{ const o = await p.evaluate(() => { const at = s => { const e = document.querySelector('#main ' + s); return e ? [...document.querySelectorAll('#main *')].indexOf(e) : -1; };
    return {hero: at('.f3-hero'), top: at('.sd-top'), six: at('.sd-six'), tools: at('.sd-tools'), post: at('.sd-post'), old: at('.sdh'), h1: document.querySelectorAll('#main h1').length}; });
  const seq = [o.hero, o.top, o.six, o.tools, o.post];
  ok(seq.every(x => x >= 0) && seq.every((x, i) => !i || x > seq[i - 1]) && o.old < 0 && o.h1 === 1, `public Home: Final 3's hero first, then Top 10, your six, tools rack, post band; no Stampede hero; one h1 (${JSON.stringify(o)})`); }
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
