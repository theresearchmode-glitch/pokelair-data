// Resizing sweep (Plans: "Every window size looks right", step r1, Nov 9; Sim: "whenever i have a weird resize of window, our page
// formatting breaks"). LOOK ONLY: changes nothing. For every view, with a full team loaded, at widths 320-2560 px (step 40) and a few
// odd shapes, it measures: sideways page scroll; elements sticking out past the window's right edge; text cut off inside its box;
// text overlapping other text. Then a live-resize check: the window is dragged from wide to narrow and back on one open page, and the
// layout is compared with a fresh load at the same size (anything stuck at the old size shows up as a difference).
// Usage: node experiments/resize-sweep.mjs <out.json>      (needs app/dist/page.html)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/history': rd('history.json')};
const VIEWS = (process.env.VIEWS || 'home,report,coverage,build,auto,matchup,box,teams,ratings,meta,top,sets,calc,speed,types,cores,events,arch,gauntlet,weekly,track,method,compare,sheet').split(',');
const WIDTHS = []; for (let w = 320; w <= 2560; w += +(process.env.STEP || 40)) WIDTHS.push(w);
const SHAPES = [[1280, 480], [1920, 600], [960, 1080], [700, 400], [2560, 720]];
const page = ROOT + `app/rs-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const TEAM = ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'];
const MEASURE = () => { const vw = document.documentElement.clientWidth, out = {hscroll: document.documentElement.scrollWidth > vw + 1 ? document.documentElement.scrollWidth - vw : 0, stick: [], clip: [], overlap: []};
  const pane = document.querySelector('[data-pane].on, [data-pane]:not([hidden])') || document.body;
  const vis = e => { if (e.checkVisibility && !e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) return null; if (e.closest('.sr,[aria-hidden="true"],details:not([open]) > :not(summary)')) return null; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null; return r; };
  const name = e => (e.id ? '#' + e.id : e.tagName.toLowerCase()) + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const all = [...document.body.querySelectorAll('*')];
  for (const e of all) { const r = vis(e); if (!r) continue;
    if (r.right > vw + 1 && r.left < vw && !e.closest('[aria-hidden="true"],svg,.ar-rail,[class*="scroll"],[class*="rail"]')) { let p = e.parentElement, scrolled = false; while (p) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') { scrolled = true; break; } p = p.parentElement; } if (!scrolled) out.stick.push(name(e) + ' +' + Math.round(r.right - vw)); }
    const cs = getComputedStyle(e); if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && cs.textOverflow !== 'ellipsis' && e.scrollWidth > e.clientWidth + 2 && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) out.clip.push(name(e) + ' "' + e.textContent.trim().slice(0, 30) + '"'); }
  // text overlapping text: leaf elements with their own visible text
  // each LINE of text separately (a wrapped paragraph's bounding box covers neighbours it doesn't touch)
  const lines = []; for (const e of all) { if (!vis(e)) continue; for (const n of e.childNodes) { if (n.nodeType !== 3 || n.textContent.trim().length < 2) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width > 2 && r.height > 2) lines.push({e, r}); } if (lines.length > 1500) break; }
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) { const a = lines[i], b = lines[j]; if (a.e === b.e) continue;
    const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (ix > 3 && iy > 3 && iy > .3 * Math.min(a.r.height, b.r.height)) out.overlap.push(`"${a.e.textContent.trim().slice(0, 20)}" × "${b.e.textContent.trim().slice(0, 20)}"`); }
  out.stick = [...new Set(out.stick)].slice(0, 8); out.clip = [...new Set(out.clip)].slice(0, 8); out.overlap = [...new Set(out.overlap)].slice(0, 8); return out; };
const b = await chromium.launch(), res = {made: new Date().toISOString(), widths: WIDTHS, views: VIEWS, sweep: {}, shapes: {}, live: {}}, errs = [];
async function open(w, h) { const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1}), pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await pg.addInitScript(D => { try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); } catch (e) {} window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000); await pg.evaluate(t => window.__ev(`S.slots=${JSON.stringify(t)}.map(n=>({n,a:null,lock:false}));render();`), TEAM); await pg.waitForTimeout(800); return {ctx, pg}; }
async function visit(pg, v) { await pg.evaluate(v => window.__ev(`setView(${JSON.stringify(v)},false)`), v); await pg.waitForTimeout(v === 'build' || v === 'report' ? 1500 : 500); return pg.evaluate(`(${MEASURE})()`); }
const t0 = Date.now();
for (const w of WIDTHS) { const {ctx, pg} = await open(w, 900); for (const v of VIEWS) { try { res.sweep[`${v}@${w}`] = await visit(pg, v); } catch (e) { res.sweep[`${v}@${w}`] = {err: String(e.message).slice(0, 80)}; } } await ctx.close();
  process.stdout.write(`  width ${w} done · ${Math.round((Date.now() - t0) / 1000)}s\n`); }
for (const [w, h] of SHAPES) { const {ctx, pg} = await open(w, h); for (const v of VIEWS) { try { res.shapes[`${v}@${w}x${h}`] = await visit(pg, v); } catch (e) {} } await ctx.close(); }
// live resize: open at 1440, visit each view, drag to 360 and back to 1440 in steps; compare with a fresh 360 and a fresh 1440
const snap = () => [...document.querySelectorAll('[data-pane] *')].filter(e => e.getBoundingClientRect().width).slice(0, 400).map(e => { const r = e.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.width) + ',' + Math.round(r.height); }).join('|');
for (const v of VIEWS) { try { const A = await open(1440, 900); await visit(A.pg, v); for (const w of [1200, 1000, 820, 700, 560, 420, 360]) { await A.pg.setViewportSize({width: w, height: 900}); await A.pg.waitForTimeout(150); }
    await A.pg.waitForTimeout(800); const narrow = await A.pg.evaluate(`(${snap})()`), mNarrow = await A.pg.evaluate(`(${MEASURE})()`);
    for (const w of [560, 820, 1100, 1440]) { await A.pg.setViewportSize({width: w, height: 900}); await A.pg.waitForTimeout(150); } await A.pg.waitForTimeout(800); const wide = await A.pg.evaluate(`(${snap})()`); await A.ctx.close();
    const F1 = await open(360, 900); await visit(F1.pg, v); const fNarrow = await F1.pg.evaluate(`(${snap})()`); await F1.ctx.close();
    const F2 = await open(1440, 900); await visit(F2.pg, v); const fWide = await F2.pg.evaluate(`(${snap})()`); await F2.ctx.close();
    const diff = (x, y) => { const a = x.split('|'), c = y.split('|'); let d = 0; for (let i = 0; i < Math.max(a.length, c.length); i++) if (a[i] !== c[i]) d++; return d; };
    res.live[v] = {narrowDiff: diff(narrow, fNarrow), wideDiff: diff(wide, fWide), afterDrag: mNarrow}; } catch (e) { res.live[v] = {err: String(e.message).slice(0, 80)}; } }
await b.close(); fs.unlinkSync(page); res.errors = [...new Set(errs)].slice(0, 20);
fs.writeFileSync(process.argv[2] || OUT + 'resize-sweep.json', JSON.stringify(res));
const bad = Object.entries(res.sweep).filter(([, m]) => m && (m.hscroll || m.stick && m.stick.length || m.overlap && m.overlap.length || m.clip && m.clip.length));
console.log(`done in ${Math.round((Date.now() - t0) / 1000)}s: ${Object.keys(res.sweep).length} view×width checks, ${bad.length} with something flagged; page errors: ${res.errors.length}`);
