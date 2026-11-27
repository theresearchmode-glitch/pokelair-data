#!/usr/bin/env node
// chain-review-guard.mjs — fail-first regression guard for Job 71 (M1, M2, M3, M4, F1 from kip-chain-review.md).
//
// Usage:
//   node app/build.mjs --v2 --split --split-routes --art=../src/v2/art/ --public
//   node experiments/chain-review-guard.mjs
//
// Checks:
//   M1a: Failing /routes/calc*.js stops after 1 request and shows "This page didn't load"
//   M1b: Failing /routes/team*.js stops after 1 request and shows "This page didn't load"
//   M2:  Failing /routes/info-text*.js on /pokemon/garchomp ability tap stops after 1 request (opens fallback sheet or toast)
//   M3:  Returning visitor with localStorage cc2.state on /team, /box, /compare never sees sample team/score before /data/*.json arrives
//   M4:  Sprites A rule: no .np-mon img with src containing -s/ has --iw > 80 (or missing --iw)
//   F1:  My Team desktop (1440x900) Tab order inside .pty2: "Why This Score?" precedes .mtf cards (no y-jump back up)

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'app/dist');
if (!fs.existsSync(path.join(DIST, 'routes'))) {
  console.log('chain-review-guard: no --split-routes build in app/dist');
  process.exit(1);
}

const cwd = process.cwd();
process.chdir(ROOT);
const {DOC_SOURCES} = await import(pathToFileURL(path.join(ROOT, 'split-docs.mjs')).href);
const {perfDoc} = await import(pathToFileURL(path.join(ROOT, 'app/data-docs.mjs')).href);
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch { return null; } };
const docs = Object.fromEntries(Object.entries(DOC_SOURCES).map(([k, get]) => [k, get()]));
docs.perf = perfDoc(rd('limitless.json'), rd('perf.json'));
process.chdir(cwd);

const T = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.png': 'image/png',
};

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent((q.url || '/').split('?')[0]);
  const m = /^\/data\/([a-z_]+)\.json$/.exec(p);
  if (m) {
    const v = docs[m[1]];
    if (v === undefined) { r.writeHead(404); return r.end(); }
    r.writeHead(200, {'content-type': 'application/json'});
    return r.end(JSON.stringify(v));
  }
  if (p === '/') p = '/index.html';
  let f = p.startsWith('/src/') ? path.join(ROOT, 'app', p) : path.join(DIST, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + '.html') ? f + '.html' : '';
  if (!f) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});

await new Promise(res => srv.listen(0, '127.0.0.1', res));
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch({args: ['--disable-dev-shm-usage']});
let fails = 0;

function report(ok, name, detail) {
  if (!ok) fails++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

try {
  // M1a & M1b: Failing page chunks must stop after 1 request and show "This page didn't load"
  for (const [label, routePath, pattern] of [
    ['M1a: failing /routes/calc*.js', '/calc', /\/routes\/calc.*\.js/],
    ['M1b: failing /routes/team*.js', '/team', /\/routes\/team.*\.js/],
  ]) {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    const page = await ctx.newPage();
    let reqs = 0, navErr = '';
    await page.route(pattern, async route => {
      reqs++;
      if (reqs > 50) { await new Promise(r => setTimeout(r, 100)); }
      return route.abort('failed').catch(() => {});
    });
    try {
      await page.goto(base + routePath, {waitUntil: 'domcontentloaded', timeout: 10000});
      await page.waitForTimeout(1500);
    } catch (e) { navErr = String(e.message).split('\n')[0]; }
    const body = navErr ? navErr : await page.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 120)).catch(e => String(e.message).split('\n')[0]);
    const ok = !navErr && reqs === 1 && /didn['’]t load/i.test(body);
    report(ok, label, `reqs=${reqs}, main="${body}"`);
    await ctx.close();
  }

  // M2: Failing info-text.js on ability tap must stop after 1 request (no loop)
  {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    const page = await ctx.newPage();
    let reqs = 0, navErr = '';
    await page.route(/\/routes\/info-text.*\.js/, async route => {
      reqs++;
      if (reqs > 50) { await new Promise(r => setTimeout(r, 100)); }
      return route.abort('failed').catch(() => {});
    });
    try {
      await page.goto(base + '/pokemon/garchomp', {waitUntil: 'networkidle', timeout: 10000});
      await page.waitForTimeout(400);
      await page.click('[data-v2info="ab"]');
      await page.waitForTimeout(1500);
    } catch (e) { navErr = String(e.message).split('\n')[0]; }
    const st = navErr ? {sheet: false, toast: false, tags: reqs} : await page.evaluate(() => ({
      sheet: Boolean(document.querySelector('.np-sheet')),
      toast: Boolean(document.querySelector('.np-toast')),
      tags: document.querySelectorAll('script[src*="info-text"]').length,
    })).catch(() => ({sheet: false, toast: false, tags: reqs}));
    const ok = !navErr && reqs === 1 && st.tags <= 1 && (st.sheet || st.toast);
    report(ok, 'M2: failing info-text.js on ability tap', `reqs=${reqs}, tags=${st.tags}, sheet=${st.sheet}, toast=${st.toast}${navErr ? ', err=' + navErr : ''}`);
    await ctx.close();
  }

  // M3: Returning visitor with saved cc2.state must not see sample team/score on /team, /box, /compare
  {
    const ownState = JSON.stringify({
      v: 2,
      name: 'My Own Team',
      format: 'doubles',
      slots: [
        {n: 'Pikachu', a: 'Lightning Rod', it: 'Light Ball', tr: 'Electric', nt: 'Timid', ev: [0,0,0,252,4,252], m: ['Thunderbolt','Fake Out','Protect','Volt Switch']},
        {n: 'Snorlax', a: 'Thick Fat', it: 'Leftovers', tr: 'Normal', nt: 'Adamant', ev: [252,252,4,0,0,0], m: ['Body Slam','Protect','Yawn','Earthquake']},
        {n: 'Gengar', a: 'Cursed Body', it: 'Focus Sash', tr: 'Ghost', nt: 'Timid', ev: [0,0,0,252,4,252], m: ['Shadow Ball','Sludge Bomb','Icy Wind','Protect']},
        {n: 'Dragonite', a: 'Multiscale', it: 'Choice Band', tr: 'Normal', nt: 'Adamant', ev: [4,252,0,0,0,252], m: ['Extreme Speed','Outrage','Stomping Tantrum','Ice Spinner']},
        {n: 'Tyranitar', a: 'Sand Stream', it: 'Assault Vest', tr: 'Rock', nt: 'Adamant', ev: [252,252,4,0,0,0], m: ['Rock Slide','Crunch','Low Kick','Tera Blast']},
        {n: 'Gardevoir', a: 'Telepathy', it: 'Choice Scarf', tr: 'Fairy', nt: 'Timid', ev: [0,0,0,252,4,252], m: ['Dazzling Gleam','Psychic','Trick','Protect']},
      ],
      teams: [],
      box: [{n: 'Pikachu'}],
    });
    const badPages = [];
    for (const rpath of ['/team', '/box', '/compare']) {
      const ctx = await browser.newContext({viewport: {width: 390, height: 844}});
      await ctx.addInitScript(st => { localStorage.setItem('cc2.state', st); }, ownState);
      const page = await ctx.newPage();
      await page.route(/\/data\/.*\.json/, async route => {
        await new Promise(r => setTimeout(r, 2200));
        await route.continue();
      });
      await page.goto(base + rpath, {waitUntil: 'domcontentloaded'});
      await page.waitForTimeout(500);
      const snap = await page.evaluate(() => {
        const m = document.querySelector('#main');
        const txt = (m ? m.innerText : '').replace(/\s+/g, ' ');
        const hasPre = Boolean(m && m.querySelector('[data-np-pre]'));
        return {hasPre, sample: /Sun Tailwind|\(sample\)|Charizard Y|Whimsicott|Basculegion/i.test(txt), txt: txt.slice(0, 120)};
      });
      if (snap.sample || snap.hasPre) badPages.push(`${rpath}(pre=${snap.hasPre},sample=${snap.sample})`);
      await ctx.close();
    }
    report(badPages.length === 0, 'M3: returning visitor never sees sample team on /team,/box,/compare', badPages.length ? badPages.join('; ') : 'clean on all 3');
  }

  // M4: Sprites A rule (no .np-mon img with src containing -s/ has --iw > 80 or missing --iw)
  {
    let wrong = 0, used = 0;
    for (const [w, r] of [[390, '/build'], [390, '/speed'], [1280, '/calc'], [1280, '/battle'], [390, '/team']]) {
      const ctx = await browser.newContext({viewport: {width: w, height: 900}});
      const page = await ctx.newPage();
      await page.goto(base + r, {waitUntil: 'networkidle'});
      await page.waitForTimeout(600);
      const res = await page.evaluate(() => {
        const im = [...document.querySelectorAll('#main img[src*=".webp"]')].filter(i => i.getClientRects().length);
        const sm = im.filter(i => i.getAttribute('src').includes('-s/') || i.dataset.full);
        const big = sm.filter(i => {
          const m = i.closest('.np-mon');
          const iw = m ? parseFloat(((m.getAttribute('style') || '').match(/--iw:([\d.]+)px/) || [])[1]) : NaN;
          return m && !(iw <= 80);
        });
        return [sm.length, big.length];
      });
      used += res[0];
      wrong += res[1];
      await ctx.close();
    }
    report(used > 0 && wrong === 0, 'M4: Sprites A (240px src only on slots <= 80px)', `small=${used}, wrong=${wrong}`);
  }

  // F1: My Team desktop (1440x900) Tab order inside .pty2 follows visual order (Why This Score? before .mtf cards)
  {
    const ctx = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await ctx.newPage();
    await page.goto(base + '/team', {waitUntil: 'networkidle'});
    await page.waitForTimeout(600);
    const res = await page.evaluate(() => {
      const hero = document.querySelector('#main .tm-hero.pty2');
      if (!hero) return {ok: false, reason: 'no .tm-hero.pty2'};
      const focusables = [...hero.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
      const idxWhy = focusables.findIndex(e => e.hasAttribute('data-v2why'));
      const idxCard = focusables.findIndex(e => e.closest('.mtf'));
      const yWhy = idxWhy >= 0 ? Math.round(focusables[idxWhy].getBoundingClientRect().top) : -1;
      const yCard = idxCard >= 0 ? Math.round(focusables[idxCard].getBoundingClientRect().top) : -1;
      return {ok: idxWhy >= 0 && idxCard >= 0 && idxWhy < idxCard && yWhy <= yCard, idxWhy, idxCard, yWhy, yCard};
    });
    report(res.ok, 'F1: My Team desktop Tab order (Why This Score? precedes .mtf)', JSON.stringify(res));
    await ctx.close();
  }
} finally {
  await browser.close();
  srv.close();
}

console.log(`chain-review-guard: ${fails ? fails + ' FAILED' : 'ALL PASSED'}`);
process.exit(fails ? 1 : 0);
