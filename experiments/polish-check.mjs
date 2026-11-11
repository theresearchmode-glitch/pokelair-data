// The polish check (Focus plan Part 4c, f7-check; Sim, Nov 10: "we really need a check [for] little things like this").
// LOOK ONLY: changes nothing. Turns the outside polish review into a repeatable measurement, so small things (text spilling or
// wrapping unevenly in a box, a tile left alone on a row, half-slanted headlines, sizes off the scale...) are caught by a
// script, not on Sim's phone.
//   Layout checks, every page at widths 320-2560 (step 80, light):
//     spill     text sticking out of its box (button, chip, tile, card)
//     uneven    a row of short labels where some wrap to 2+ lines and others don't ("Tier board" / "Meta map")
//     lone      a grid or wrapping row whose last row is short (one tile alone, 7 checks in 4 columns...)
//     empty     desktop only: a wide block whose content fills under 60% of its width (possible empty half)
//     hscroll   sideways page scroll
//   Style checks, every page at 390 / 820 / 1440, light and dark:
//     size      text size off the type scale (13 15 16 17 20 22 24 26 28 34, display sizes 31+)
//     bodyhead  headline-size text (20px+) in the body font
//     slant     a headline that is partly slanted and partly upright
//     lineh     body text of 2+ lines with line height under 1.45
//     space     margins, padding and gaps off the 4px grid (1, 2 and 6 allowed)
//     boxes     three or more stacked background shades (page > card > cell > ...)
//     glow      text with a glow (text-shadow)
//     help      "?" buttons in more than one size
//     tap       phone/tablet widths: a button, link or toggle under 44px tall (links inside running text exempt; Sim's review Nov 11, item 7)
// Usage: node experiments/polish-check.mjs [out.json]   (TARGET=v2 for the rebuild's dist/v2.html)
//   (needs app/dist/page.html; ~10 minutes)
//   STEP=80 VIEWS=home,ratings to narrow it. Writes a JSON report and prints a summary, one line per finding.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('..', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/history': rd('history.json'), 'meta/events': rd('events.json'), 'meta/weekly': rd('weekly.json'), 'meta/track': rd('track.json'), 'meta/practice': rd('practice.json'), 'meta/calendar': rd('calendar.json')};
// TARGET=v2 checks the rebuild (app/dist/v2.html; views are its #hash pages, theme in np2.theme). Default: today's page.
const V2 = process.env.TARGET === 'v2';
const VIEWS = (process.env.VIEWS || (V2 ? 'guide' : null) || 'home,report,coverage,build,auto,matchup,box,teams,ratings,meta,top,sets,calc,speed,types,cores,events,arch,gauntlet,weekly,track,method,compare,sheet').split(',');
const STEP = +(process.env.STEP || 80), WIDTHS = []; for (let w = +(process.env.W0 || 320); w <= 2560; w += STEP) WIDTHS.push(w);
const STYLE_W = (process.env.STYLE_W || '390,820,1440').split(',').map(Number);
const page = ROOT + `app/pc-${process.pid}.html`;
if (V2) fs.writeFileSync(page, fs.readFileSync(ROOT + 'app/dist/v2.html', 'utf8')); else fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const TEAM = ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'];

// ---------- in-page measurements ----------
const LAYOUT = () => { const vw = document.documentElement.clientWidth, out = {hscroll: Math.max(0, document.documentElement.scrollWidth - vw - 1), spill: [], uneven: [], lone: [], empty: []};
  const vis = e => { if (e.checkVisibility && !e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) return null; if (e.closest('.sr,.sr-only,[aria-hidden="true"],details:not([open]) > :not(summary),#scrim,.toast')) return null; for (let a = e, i = 0; a && i < 4; a = a.parentElement, i++) { const c = getComputedStyle(a); if (/rect\(0/.test(c.clip) || (c.overflow === 'hidden' && a.getBoundingClientRect().width <= 2)) return null; } /* screen-reader-only text (1px, clipped) */ const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 ? r : null; };
  const name = e => { const c = e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).filter(x => !/^(on|is-|ar-on)/.test(x)).slice(0, 2).join('.') : ''; return (e.id ? '#' + e.id : e.tagName.toLowerCase()) + c; };
  const where = e => { const p = e.parentElement; return (p ? name(p) + ' > ' : '') + name(e); };
  const txt = e => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim();
  const all = [...document.body.querySelectorAll('*')].filter(e => !e.closest('svg,script,style,template'));
  const isBox = e => { const cs = getComputedStyle(e); return /^(button|a|label|summary)$/i.test(e.tagName) || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0; };
  // spill: a line of text past the edges of its nearest box
  for (const e of all) { if (!vis(e)) continue; for (const n of e.childNodes) { if (n.nodeType !== 3 || n.textContent.trim().length < 2) continue;
      let box = e; while (box && box !== document.body && !isBox(box)) box = box.parentElement; if (!box || box === document.body) continue; if (box.closest('.nprtrack')) continue; /* Speed Tiers: names float centred under each sprite on purpose */ const B = box.getBoundingClientRect(); if (B.width < 20 || B.width > vw * .98) continue;
      const cs = getComputedStyle(box); if (cs.overflow === 'hidden' && cs.textOverflow === 'ellipsis') continue;
      const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) { if (r.width < 2) continue; const over = Math.max(B.left - r.left, r.right - B.right, r.bottom - B.bottom - 2, B.top - r.top - 2); if (over > 2) { out.spill.push(`${where(box)} "${txt(box).slice(0, 24)}" +${Math.round(over)}px`); break; } } } }
  // uneven: siblings that are short labels (buttons, tabs, slider choices, tiles' titles) with different line counts
  const lines = el => { const lab = el.querySelector(':scope b, :scope .ar-sllab, :scope span:not(.sr):not([aria-hidden])') || el; const rg = document.createRange(); rg.selectNodeContents(lab);
    // one line = pieces that overlap vertically (a smaller count like "4/4" sits on its own baseline but on the same line, Nov 11);
    // a real wrap starts below the line above, so it still counts
    const ln = []; for (const r of rg.getClientRects()) { if (r.width <= 2 || r.height <= 4) continue; const hit = ln.find(l => Math.min(l.b, r.bottom) - Math.max(l.t, r.top) > 0.5 * Math.min(l.b - l.t, r.height)); if (hit) { hit.t = Math.min(hit.t, r.top); hit.b = Math.max(hit.b, r.bottom); } else ln.push({t: r.top, b: r.bottom}); } return ln.length; };
  for (const p of all) { const kids = [...p.children].filter(k => vis(k) && /^(BUTTON|A|LABEL)$/.test(k.tagName) && txt(k).length > 1 && txt(k).length < 28); if (kids.length < 2 || kids.length < p.children.length * .6) continue;
    const rows = new Map(); for (const k of kids) { const t = Math.round(k.getBoundingClientRect().top / 8); (rows.get(t) || rows.set(t, []).get(t)).push(k); }
    for (const row of rows.values()) { if (row.length < 2) continue; const ls = row.map(lines); if (Math.max(...ls) > 1 && Math.min(...ls) === 1) out.uneven.push(`${where(p)}: ${row.map((k, i) => `"${txt(k).slice(0, 18)}"×${ls[i]}`).join(' ')}`); } }
  // lone: grids / wrapping rows (3+ items) whose last row has fewer items than the first
  for (const p of all) { if (p.children.length < 3 || p.children.length > 80) continue; const cs = getComputedStyle(p); const grid = cs.display.includes('grid') /* not gridTemplateColumns: reading it crashed Chromium on Ratings (Nov 10) */, wrap = cs.display.includes('flex') && cs.flexWrap === 'wrap' && cs.flexDirection.startsWith('row'); if (!grid && !wrap) continue;
    const kids = [...p.children].filter(k => vis(k) && getComputedStyle(k).position !== 'absolute'); if (kids.length < 3) continue;
    const rows = []; for (const k of kids) { const t = k.getBoundingClientRect().top; const row = rows.find(r => Math.abs(r.t - t) < 6); row ? row.n++ : rows.push({t, n: 1}); }
    if (rows.length < 2) continue; const first = rows[0].n, last = rows[rows.length - 1].n; if (first > 1 && last < first) out.lone.push(`${where(p)}: ${kids.length} items, rows ${rows.map(r => r.n).join('+')}`); }
  // empty: desktop, a wide block (not the whole page) whose children span under 60% of it
  if (vw >= 1000) { const pane = document.querySelector('[data-pane]:not([hidden])') || document.body;
    for (const b of pane.querySelectorAll('section, .chblock, .card, [class*="card"], [class*="panel"], footer, .hsec')) { const R = vis(b); if (!R || R.width < 600 || R.height < 120) continue;
      const kids = [...b.children].map(vis).filter(Boolean); if (!kids.length) continue; const cs = getComputedStyle(b), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
      const right = Math.max(...kids.map(r => r.right)), left = Math.min(...kids.map(r => r.left)), inner = R.width - pl - pr; const fill = (right - left) / inner;
      if (fill < .6) out.empty.push(`${where(b)} fills ${Math.round(fill * 100)}% of ${Math.round(inner)}px`); } }
  for (const k of ['spill', 'uneven', 'lone', 'empty']) out[k] = [...new Set(out[k])].slice(0, 12); return out; };

const STYLE = () => { const out = {size: {}, bodyhead: {}, slant: [], lineh: {}, space: {}, boxes: [], glow: [], help: {}, tap: {}};
  const SCALE = new Set([13, 15, 16, 17, 20, 22, 24, 26, 28, 34]);
  const vis = e => { if (e.checkVisibility && !e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) return null; if (e.closest('.sr,.sr-only,[aria-hidden="true"],details:not([open]) > :not(summary)')) return null; for (let a = e, i = 0; a && i < 4; a = a.parentElement, i++) { const c = getComputedStyle(a); if (/rect\(0/.test(c.clip) || (c.overflow === 'hidden' && a.getBoundingClientRect().width <= 2)) return null; } const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 ? r : null; };
  const name = e => { const c = e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).filter(x => !/^(on|is-|ar-on)/.test(x)).slice(0, 2).join('.') : ''; return (e.id ? '#' + e.id : e.tagName.toLowerCase()) + c; };
  const where = e => { const p = e.parentElement; return (p ? name(p) + ' > ' : '') + name(e); };
  const add = (o, k, ex) => { (o[k] = o[k] || {n: 0, ex: []}).n++; if (o[k].ex.length < 3 && !o[k].ex.includes(ex)) o[k].ex.push(ex); };
  const own = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
  const disp = cs => /Unbounded/i.test(cs.fontFamily.split(',')[0]);
  const all = [...document.body.querySelectorAll('*')].filter(e => !e.closest('svg,script,style,template'));
  const bg = e => { const c = getComputedStyle(e).backgroundColor; return c === 'rgba(0, 0, 0, 0)' || c === 'transparent' || /, 0\)$/.test(c) ? null : c; };
  for (const e of all) { const r = vis(e); if (!r) continue; const cs = getComputedStyle(e);
    if (own(e) && parseFloat(cs.fontSize) >= 1) { const fs = parseFloat(cs.fontSize), fsr = Math.round(fs * 10) / 10;
      if (!(SCALE.has(fsr) || fs >= 30.5 || (disp(cs) && (fs >= 24 || e.closest('.ar-num'))) /* display headlines (and the parts of a big number, like its %) may scale to fit the screen (the big type that fills the width) */)) add(out.size, fsr + 'px', where(e) + ' "' + e.textContent.trim().slice(0, 16) + '"');
      if (fs >= 19.5 && !disp(cs) && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName) && e.textContent.trim().length > 1 /* not a lone × or ? */) add(out.bodyhead, fsr + 'px', where(e) + ' "' + e.textContent.trim().slice(0, 16) + '"');
      const lh = parseFloat(cs.lineHeight); if (!disp(cs) && lh && e.getClientRects().length && r.height > lh * 1.7 && lh / fs < 1.45 && e.textContent.trim().length > 40) add(out.lineh, (Math.round(lh / fs * 100) / 100) + '', where(e));
      if (cs.textShadow && cs.textShadow !== 'none' && !/^(\s*(rgba\([^)]*,\s*0\)|transparent)[^,]*,?)+$/.test(cs.textShadow)) out.glow.push(where(e) + ' "' + e.textContent.trim().slice(0, 20) + '"');
      if (e.textContent.trim() === '?' && /^(BUTTON|A|SUMMARY)$/.test(e.tagName)) add(out.help, `${Math.round(r.width)}x${Math.round(r.height)}`, where(e)); }
    // half-slanted headline: display text whose slant differs from its display-font parent with text of its own
    if (own(e) && disp(cs) && e.parentElement) { const p = e.parentElement, pc = getComputedStyle(p); if (disp(pc) && own(p) && (pc.fontStyle === 'normal') !== (cs.fontStyle === 'normal')) out.slant.push(`${where(e)} "${e.textContent.trim().slice(0, 20)}" ${cs.fontStyle} inside ${pc.fontStyle} "${p.textContent.trim().slice(0, 24)}"`); }
    for (const k of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'rowGap', 'columnGap']) { const v = parseFloat(cs[k]); if (!v || Number.isNaN(v)) continue; const a = Math.abs(Math.round(v * 10) / 10); if (a % 4 === 0 || a === 1 || a === 2 || a === 6) continue; if (/margin(Left|Right)/.test(k) && cs.display === 'block' && r.width > 300) continue; add(out.space, a + 'px', where(e) + ' ' + k); }
    // boxes in boxes: an element with its own shade, inside two more distinct shades below the page
    const own_bg = bg(e); if (own_bg && r.width * r.height > 2500) { const shades = [own_bg]; let p = e.parentElement; while (p && p !== document.documentElement) { const c = bg(p); if (c && c !== shades[shades.length - 1]) shades.push(c); p = p.parentElement; } if (new Set(shades).size >= 4) out.boxes.push(`${where(e)} (${new Set(shades).size} shades)`); } }
  // tap targets (phones and tablets): interactive things under 44px tall; a link inside running text is exempt
  if (innerWidth < 1000) for (const e of document.body.querySelectorAll('a[href],button,summary,[role="button"],[role="tab"],input:not([type="hidden"]),select')) { const r = vis(e.matches('input,select') && e.closest('label') || e); // a field inside its label: the whole label is the tap area
    if (!r || r.height >= 43.5 || r.width < 1) continue;
    const cs = getComputedStyle(e); if (cs.display === 'inline' && e.parentElement && own(e.parentElement)) continue;
    add(out.tap, Math.round(r.height) + 'px', where(e) + ' "' + (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 18) + '"'); }
  out.slant = [...new Set(out.slant)].slice(0, 12); out.boxes = [...new Set(out.boxes)].slice(0, 12); out.glow = [...new Set(out.glow)].slice(0, 8); return out; };

// ---------- run ----------
const b = await chromium.launch(), res = {made: new Date().toISOString(), widths: WIDTHS, styleWidths: STYLE_W, views: VIEWS, layout: {}, style: {}}, errs = [];
async function open(w, h, mode) { if (V2) { const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1}), pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message.slice(0, 120)));
    await pg.addInitScript(t => { try { localStorage.setItem('np2.theme', t); } catch (e) {} }, mode === 'dark' ? 'night' : 'day'); await pg.goto('file://' + page + '#' + VIEWS[0]); await pg.waitForTimeout(800); return {ctx, pg}; }
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, colorScheme: mode === 'dark' ? 'dark' : 'light'}), pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await pg.addInitScript(([D, mode]) => { try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); localStorage.setItem('cc2.theme', JSON.stringify(mode || 'light')); } catch (e) {} window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, [D, mode]);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000); await pg.evaluate(([t, mode]) => window.__ev(`S.slots=${JSON.stringify(t)}.map(n=>({n,a:null,lock:false}));try{setTheme(${JSON.stringify(mode || 'light')})}catch(e){};render();`), [TEAM, mode]); await pg.waitForTimeout(800); return {ctx, pg}; }
async function visit(pg, v, fn) { if (V2) { await pg.evaluate(v => { location.hash = v; scrollTo(0, 0); }, v); await pg.waitForTimeout(500); return pg.evaluate(`(${fn})()`); }
  await pg.evaluate(v => window.__ev(`setView(${JSON.stringify(v)},false);window.scrollTo(0,0)`), v); await pg.waitForTimeout(v === 'build' || v === 'report' ? 1500 : 600); return pg.evaluate(`(${fn})()`); }
const t0 = Date.now();
for (const w of WIDTHS) { const {ctx, pg} = await open(w, 900, 'light'); for (const v of VIEWS) { try { res.layout[`${v}@${w}`] = await visit(pg, v, LAYOUT); } catch (e) { res.layout[`${v}@${w}`] = {err: String(e.message).slice(0, 80)}; } } await ctx.close();
  process.stdout.write(`  layout ${w}px · ${Math.round((Date.now() - t0) / 1000)}s\n`); }
for (const mode of ['light', 'dark']) for (const w of STYLE_W) { const {ctx, pg} = await open(w, 900, mode); for (const v of VIEWS) { try { res.style[`${v}@${w}@${mode}`] = await visit(pg, v, STYLE); } catch (e) { res.style[`${v}@${w}@${mode}`] = {err: String(e.message).slice(0, 80)}; } } await ctx.close();
  process.stdout.write(`  style ${mode} ${w}px · ${Math.round((Date.now() - t0) / 1000)}s\n`); }
await b.close(); fs.unlinkSync(page); res.errors = [...new Set(errs)].slice(0, 20);
fs.writeFileSync(process.argv[2] || OUT + 'polish-check.json', JSON.stringify(res));

// ---------- summary: each finding once, with the widths it shows at ----------
const ranges = ws => { ws = [...new Set(ws)].sort((a, b) => a - b); const o = []; for (const w of ws) { const l = o[o.length - 1]; if (l && w - l[1] === STEP) l[1] = w; else o.push([w, w]); } return o.map(([a, z]) => a === z ? `${a}` : `${a}-${z}`).join(','); };
const sum = {}; const put = (k, v, item, at) => { const key = `${k}|${v}|${item}`; (sum[key] = sum[key] || {k, v, item, at: []}).at.push(at); };
for (const [key, m] of Object.entries(res.layout)) { const [v, w] = key.split('@'); if (!m || m.err) { put('error', v, m && m.err, +w); continue; } if (m.hscroll) put('hscroll', v, `${m.hscroll}px`, +w); for (const k of ['spill', 'uneven', 'lone', 'empty']) for (const x of m[k] || []) put(k, v, x, +w); }
for (const [key, m] of Object.entries(res.style)) { const [v, w, mode] = key.split('@'); if (!m || m.err) continue; const at = `${w}${mode === 'dark' ? 'd' : ''}`;
  for (const k of ['size', 'bodyhead', 'lineh', 'space', 'tap']) for (const [val, o] of Object.entries(m[k] || {})) put(k, v, `${val} (${o.ex[0]})`, at);
  for (const k of ['slant', 'boxes', 'glow']) for (const x of m[k]) put(k, v, x, at);
  if (Object.keys(m.help).length > 1) put('help', v, Object.keys(m.help).join(' / '), at); }
const ORDER = ['error', 'hscroll', 'spill', 'uneven', 'lone', 'slant', 'tap', 'size', 'bodyhead', 'lineh', 'help', 'glow', 'boxes', 'empty', 'space'], counts = {};
const rows = Object.values(sum).sort((a, b) => ORDER.indexOf(a.k) - ORDER.indexOf(b.k) || a.v.localeCompare(b.v));
for (const r of rows) { counts[r.k] = (counts[r.k] || 0) + 1; if (!process.env.QUIET || r.k !== 'space') console.log(`${r.k.padEnd(8)} ${r.v.padEnd(9)} ${r.item}  @ ${typeof r.at[0] === 'number' ? ranges(r.at) : [...new Set(r.at)].join(',')}`); }
console.log(`\npolish check: ${Object.entries(counts).map(([k, n]) => `${k} ${n}`).join(', ') || 'nothing found'}; page errors ${res.errors.length}; ${Math.round((Date.now() - t0) / 1000)}s`);
