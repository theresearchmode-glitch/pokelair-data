// Scroll smoothness: today's site vs the rebuild mock-ups (with the glow). Scrolls each page with mouse-wheel steps like a
// desktop mouse and records how long each frame took. Run on Sim's PC (Windows, mouse wheel, 100% scaling) for real numbers:
//   node experiments/scroll-perf.mjs            (headed Chromium window, 1440x900, light and dusk)
// Reports per page: average frames per second, % of frames slower than 20 ms (a visible hitch), and the slowest frame.
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll, TEAM} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = ROOT + 'docs/rebuild/mocks/out/';
const HEADED = !process.argv.includes('--headless');
const measure = async pg => {
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(600);
  await pg.evaluate(() => { window.__f = []; let last = performance.now(); const tick = t => { window.__f.push(t - last); last = t; if (window.__run) requestAnimationFrame(tick); }; window.__run = true; requestAnimationFrame(tick); });
  const maxY = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0, i = 0; y < maxY && i < 160; y += 100, i++) { await pg.mouse.wheel(0, 100); await pg.waitForTimeout(16); }
  for (let i = 0; i < 60; i++) { await pg.mouse.wheel(0, -100); await pg.waitForTimeout(16); }
  await pg.waitForTimeout(300);
  const f = await pg.evaluate(() => { window.__run = false; return window.__f.slice(2); });
  const avg = f.reduce((a, b) => a + b, 0) / f.length;
  return {fps: Math.round(1000 / avg), slow: Math.round(f.filter(x => x > 20).length / f.length * 1000) / 10, worst: Math.round(Math.max(...f)), frames: f.length};
};
const rows = [];
const b = await chromium.launch({headless: !HEADED});
for (const theme of ['light', 'dusk']) for (const p of ['myteam', 'mybox']) {
  const f = OUT + p + '.html'; if (!fs.existsSync(f)) { console.log('missing', f, '(run node experiments/make-mocks.mjs first)'); continue; }
  const pg = await (await b.newContext({viewport: {width: 1440, height: 900}})).newPage();
  await pg.goto('file://' + f + '#' + theme); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}); await pg.mouse.move(700, 450);
  rows.push({page: `rebuild ${p} (${theme})`, ...(await measure(pg))}); await pg.context().close(); }
await b.close();
// today's site, same size, same team, both themes (its mouse-screen glow rules apply as on the live page)
for (const theme of ['light', 'dark']) for (const [name, view] of [['My Team', 'My Team'], ['My Box', 'My Box']]) {
  const {ui, pg, close} = await open({team: TEAM, mode: theme, width: 1440, height: 900});
  await ui.go(view, 1500); await pg.mouse.move(700, 450); rows.push({page: `today ${name} (${theme})`, ...(await measure(pg))}); await close(); }
await closeAll();
console.log('\npage                          fps   slow frames   worst ms   frames');
for (const r of rows) console.log(r.page.padEnd(30), String(r.fps).padStart(3), String(r.slow + '%').padStart(12), String(r.worst).padStart(10), String(r.frames).padStart(8));
fs.mkdirSync(ROOT + 'docs/rebuild/test-runs', {recursive: true});
fs.writeFileSync(ROOT + `docs/rebuild/test-runs/scroll-perf-${process.platform}.json`, JSON.stringify({ran: new Date().toISOString(), platform: process.platform, headed: HEADED, rows}, null, 1));
