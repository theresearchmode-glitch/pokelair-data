// Before/after picture check (Sim, Nov 13): every look change is shot BEFORE and AFTER at every width, day and night, and each
// shot is compared pixel by pixel, so a change that also moves something it shouldn't (Nov 13: Look Q3 was for phones only but
// widened Battle's tab names on desktop) is flagged at once, not found later by eye.
// Usage: node experiments/visual-diff.mjs BEFORE.html AFTER.html [views] [outdir]
//   views: comma list of #hash pages (default team,build,battle,box,home); "build+" = Build after pressing Build Me a Team,
//          "battle+" = Battle with an opponent entered (the first recent event's winning six)
//   EXPECT="320-699" (optional): widths where a change is intended; changes elsewhere are listed as UNEXPECTED
//   WIDTHS (optional, comma list) default 320,360,390,430,520,600,700,820,1024,1180,1280,1440,1920,2560
// It says what it can't see: only the page as first drawn in that state (no hover, no open folds, no sheets).
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path'; import fs from 'node:fs'; import {createRequire} from 'node:module'; import {execFileSync} from 'node:child_process';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), require = createRequire(import.meta.url);
let pw; try { pw = require(path.join(ROOT, 'node_modules/playwright')); } catch (e) { pw = require('playwright'); }
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {};
const D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/history': rd('history.json'),
  'meta/weekly': rd('weekly.json'), 'meta/track': rd('track.json'), 'meta/practice': rd('practice.json'), 'meta/calendar': rd('calendar.json')};
const [before, after, viewArg = 'team,build,battle,box,home', outDir = path.join(ROOT, 'out', 'visual-diff')] = process.argv.slice(2);
if (!before || !after) { console.error('usage: node experiments/visual-diff.mjs BEFORE.html AFTER.html [views] [outdir]'); process.exit(2); }
const WIDTHS = (process.env.WIDTHS || '320,360,390,430,520,600,700,820,1024,1180,1280,1440,1920,2560').split(',').map(Number);
const inExpect = w => { const e = process.env.EXPECT; if (!e) return null; return e.split(',').some(r => { const [a, b] = r.split('-').map(Number); return w >= a && w <= (b || a); }); };
fs.mkdirSync(outDir, {recursive: true});
const shoot = async (b, file, view, w, theme, png) => {
  const p = await b.newPage({viewport: {width: w, height: 900}, deviceScaleFactor: 1});
  await p.addInitScript(([D, theme]) => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', theme); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, [D, theme]);
  const v = view.replace('+', ''); await p.goto(pathToFileURL(path.resolve(file)).href + '#' + v); await p.waitForTimeout(2500);
  await p.waitForFunction(() => !document.querySelector('.sg2-wait,.cx2-busy'), null, {timeout: 90000}).catch(() => {});
  if (view === 'build+') { await p.evaluate(() => { const b = document.querySelector('#main [data-bdgo]'); if (b) b.click(); });
    await p.waitForFunction(() => { const r = document.querySelector('#main .bd-result'); const b = document.querySelector('#main [data-bdgo]'); return r && /Strength Score/.test(r.innerText) && !(b && b.getAttribute('aria-busy') === 'true'); }, null, {timeout: 60000}).catch(() => {}); }
  if (view === 'battle+') { const b = p.locator('[data-btopp]').first(); if (await b.count()) { await b.click(); await p.waitForTimeout(500); await p.locator('[data-btteam="0"]').first().click().catch(() => {}); } }
  await p.waitForTimeout(1500); await p.evaluate(() => { document.querySelectorAll('*').forEach(e => { e.style.animation = 'none'; e.style.transition = 'none'; }); });
  await p.screenshot({path: png, fullPage: true}); await p.close(); };
const b = await pw.chromium.launch(), rows = [], t0 = Date.now();
for (const view of viewArg.split(',')) for (const theme of ['day', 'night']) for (const w of WIDTHS) {
  const tag = `${view.replace('+', '-built')}-${w}-${theme}`, A = path.join(outDir, tag + '-before.png'), B = path.join(outDir, tag + '-after.png');
  await shoot(b, before, view, w, theme, A); await shoot(b, after, view, w, theme, B);
  // compare in Python (Pillow): changed pixels, the changed box, and a picture of the difference when anything changed
  const r = execFileSync('python3', ['-I', '-c', `
import sys
from PIL import Image, ImageChops
a=Image.open(sys.argv[1]).convert('RGB'); b=Image.open(sys.argv[2]).convert('RGB')
if a.size!=b.size:
  print('SIZE %dx%d -> %dx%d'%(a.size+b.size)); sys.exit()
d=ImageChops.difference(a,b).convert('L').point(lambda x:255 if x>24 else 0); box=d.getbbox()
n=d.histogram()[255]
if box:
  m=Image.blend(b,Image.new('RGB',b.size,(255,0,255)),0); m.paste((255,0,255),mask=d); Image.blend(b,m,.6).save(sys.argv[3])
print('SAME' if not box else 'CHANGED %d px in box %s'%(n,box))`, A, B, path.join(outDir, tag + '-diff.png')]).toString().trim();
  const exp = inExpect(w), changed = r !== 'SAME', flag = exp === null ? '' : changed && !exp ? '  UNEXPECTED' : !changed && exp ? '  (no change where one was expected)' : '';
  rows.push(`${tag.padEnd(28)} ${r}${flag}`); console.log(rows[rows.length - 1]);
}
await b.close();
const unexpected = rows.filter(r => /UNEXPECTED/.test(r)).length;
console.log(`\nvisual diff: ${rows.length} shots compared, ${rows.filter(r => !/ SAME/.test(r)).length} changed${process.env.EXPECT ? `, ${unexpected} UNEXPECTED (outside ${process.env.EXPECT})` : ''}; ${Math.round((Date.now() - t0) / 1000)}s. Pictures: ${outDir}`);
process.exit(unexpected ? 1 : 0);
