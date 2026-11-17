// B-m4 look-only experiment (code review, Nov 17): does isolating each page section (contain: paint) change any pixel, and does
// it make scrolling cheaper? Injects the CSS at run time (no site change). For each page x width, night theme:
//   pixels: full-page screenshot without vs with (both from the top, after a scroll pass; plus the same page shot twice as the noise floor); counts differing pixels (any channel differs by > 8)
//   scroll: 4x CPU throttle, scrolls 40 px a frame for 150 frames, frame time mean and 95th percentile (headless estimate only)
// Usage: PAGE=app/dist/v2.html node experiments/contain-check.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const CSS = process.env.CSS || '#main > *{contain:paint}';
const ROUTES = (process.env.ROUTES || 'home,team,meta,calc,mon/Garchomp').split(','), WIDTHS = (process.env.WIDTHS || '390,1280').split(',').map(Number);
const b = await chromium.launch();
const diff = async (pg, a, c) => pg.evaluate(async ([a, c]) => { const ld = u => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = u; });
  const [A, C] = await Promise.all([ld(a), ld(c)]); if (A.width !== C.width || A.height !== C.height) return `size ${A.width}x${A.height} vs ${C.width}x${C.height}`;
  const cv = document.createElement('canvas'); cv.width = A.width; cv.height = A.height; const x = cv.getContext('2d'); x.drawImage(A, 0, 0); const da = x.getImageData(0, 0, A.width, A.height).data;
  x.clearRect(0, 0, A.width, A.height); x.drawImage(C, 0, 0); const dc = x.getImageData(0, 0, A.width, A.height).data; let n = 0;
  for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - dc[i]) > 8 || Math.abs(da[i + 1] - dc[i + 1]) > 8 || Math.abs(da[i + 2] - dc[i + 2]) > 8) n++; return n; }, [a, c]);
const scroll = async pg => { const s = await pg.context().newCDPSession(pg); await s.send('Emulation.setCPUThrottlingRate', {rate: 4});
  const r = await pg.evaluate(() => new Promise(res => { const t = []; let last = performance.now(), k = 0; scrollTo(0, 0);
    const f = now => { t.push(now - last); last = now; scrollBy(0, 40); if (++k < 150) requestAnimationFrame(f); else res(t.slice(5)); }; requestAnimationFrame(f); }));
  await s.send('Emulation.setCPUThrottlingRate', {rate: 1}); const s2 = r.slice().sort((x, y) => x - y);
  return {mean: +(r.reduce((x, y) => x + y, 0) / r.length).toFixed(1), p95: +s2[Math.floor(s2.length * .95)].toFixed(1)}; };
for (const w of WIDTHS) for (const rt of ROUTES) {
  const pg = await b.newPage({viewport: {width: w, height: 900}}); await pg.addInitScript(() => { try { localStorage.setItem('cc2.theme', '"night"'); } catch (e) {} });
  await pg.goto('file://' + PAGE + '#' + rt); await pg.waitForTimeout(3000); await pg.evaluate(() => { document.documentElement.dataset.theme = 'night'; }); await pg.waitForTimeout(400);
  const s0 = await scroll(pg); await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(400);
  const a = 'data:image/png;base64,' + (await pg.screenshot({fullPage: true})).toString('base64'), a2 = 'data:image/png;base64,' + (await pg.screenshot({fullPage: true})).toString('base64');
  await pg.addStyleTag({content: CSS}); await pg.waitForTimeout(400);
  await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(400); const c = 'data:image/png;base64,' + (await pg.screenshot({fullPage: true})).toString('base64'); const s1 = await scroll(pg);
  const n = await diff(pg, a, c), noise = await diff(pg, a, a2); const secs = await pg.evaluate(() => document.querySelectorAll('#main > *').length);
  console.log(`${rt.padEnd(14)} ${String(w).padStart(4)}  sections ${secs}  pixels changed ${n} (same page twice: ${noise})  scroll ms/frame without ${s0.mean} (p95 ${s0.p95}) with ${s1.mean} (p95 ${s1.p95})`); await pg.close(); }
await b.close();
