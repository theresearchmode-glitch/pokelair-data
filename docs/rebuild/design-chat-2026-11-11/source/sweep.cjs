// Sweep of the published "NastyPlot Full Redesign" artifact's real build (foundation.html), My Team. Usage: node sweep.cjs <outDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const OUT = process.argv[2], F = 'file:///C:/Users/simra/AppData/Local/Temp/claude/469e588db1a22171/bb823294-4095-4fd5-ba18-59326258ebc4/scratchpad/art-site/foundation.html';
const QA = () => { const r = {}; const imgs = [...document.images]; r.imgs = imgs.length; r.broken = imgs.filter(i => !i.complete || !i.naturalWidth).map(i => (i.getAttribute('src') || '').slice(0, 40)).slice(0, 6); r.noAlt = imgs.filter(i => !i.hasAttribute('alt')).length;
  r.h = document.documentElement.scrollHeight; r.sideways = document.documentElement.scrollWidth - innerWidth;
  const vis = e => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.opacity !== '0'; };
  const leaf = [...document.querySelectorAll('body *')].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const lab = e => (e.className && String(e.className).slice(0, 22) || e.tagName) + ':"' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 30) + '"';
  r.small = [...new Set(leaf.filter(e => parseFloat(getComputedStyle(e).fontSize) < 13).map(e => parseFloat(getComputedStyle(e).fontSize) + 'px ' + lab(e)))].slice(0, 8);
  r.clipped = leaf.filter(e => { const s = getComputedStyle(e); return (e.scrollWidth > e.clientWidth + 1 && s.overflowX !== 'visible') || (e.scrollHeight > e.clientHeight + 2 && s.overflowY === 'hidden'); }).map(lab).slice(0, 10);
  r.offscreen = leaf.filter(e => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 || b.left < -1; }).map(lab).slice(0, 10);
  const bx = leaf.map(e => ({e, b: e.getBoundingClientRect()})).filter(x => x.b.width < 600); const ov = [];
  for (let i = 0; i < bx.length && ov.length < 10; i++) for (let j = i + 1; j < bx.length; j++) { const a = bx[i], c = bx[j]; if (a.e.contains(c.e) || c.e.contains(a.e)) continue; const w = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left), h = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top); if (w > 4 && h > 4) { ov.push(lab(a.e) + ' x ' + lab(c.e)); break; } }
  r.overlap = ov;
  const ctl = [...document.querySelectorAll('button,a,[role=button],input,select,[tabindex]')].filter(vis);
  r.controls = ctl.length; r.tap = innerWidth < 900 ? ctl.filter(e => { const b = e.getBoundingClientRect(); return b.height < 40 || b.width < 40; }).map(e => Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height) + ' ' + lab(e)).slice(0, 14) : [];
  r.noName = ctl.filter(e => !(e.textContent.trim() || e.getAttribute('aria-label') || e.getAttribute('title') || e.getAttribute('placeholder') || (e.labels && e.labels.length))).map(e => e.outerHTML.slice(0, 90)).slice(0, 8);
  const txt = document.body.innerText; r.badText = (txt.match(/[^\n]*\b(undefined|NaN|null|\[object Object\]|Infinity)\b[^\n]*/g) || []).slice(0, 6);
  const ids = {}; document.querySelectorAll('[id]').forEach(e => ids[e.id] = (ids[e.id] || 0) + 1); r.dupIds = Object.keys(ids).filter(k => ids[k] > 1).slice(0, 8);
  const lines = txt.split('\n').map(s => s.trim()).filter(s => s.length > 24), seen = {}; lines.forEach(s => seen[s] = (seen[s] || 0) + 1); r.repeats = Object.keys(seen).filter(k => seen[k] > 1).map(k => seen[k] + 'x ' + k.slice(0, 70)).slice(0, 8);
  // sections and their heights, to see where the length goes
  r.sections = [...document.querySelectorAll('main section, main > div, [data-sec]')].filter(vis).map(e => (e.id || String(e.className).slice(0, 20)) + ' ' + Math.round(e.getBoundingClientRect().height)).slice(0, 24);
  // low contrast text (rough: text colour vs nearest opaque background)
  const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return {l: .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]), a: m[3] === undefined ? 1 : m[3]}; };
  const bgOf = e => { for (let n = e; n; n = n.parentElement) { const s = getComputedStyle(n); if (s.backgroundImage !== 'none') return null; const c = lum(s.backgroundColor); if (c.a > .95) return c.l; } return null; };
  r.contrast = [...new Set(leaf.map(e => { const s = getComputedStyle(e), f = lum(s.color), b = bgOf(e); if (b == null || f.a < .95) return null; const cr = (Math.max(f.l, b) + .05) / (Math.min(f.l, b) + .05); const big = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.6 && parseInt(s.fontWeight) >= 700); return cr < (big ? 3 : 4.5) ? cr.toFixed(1) + ' ' + lab(e) : null; }).filter(Boolean))].slice(0, 12);
  return r; };
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch(), res = {};
  const open = async (vw, vh, theme, route) => { const cx = await b.newContext({viewport: {width: vw, height: vh}, deviceScaleFactor: 1, hasTouch: vw < 900}); const pg = await cx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push('JS: ' + e.message.slice(0, 140))); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)); }); pg.on('requestfailed', q => errs.push('failed: ' + q.url().slice(-60)));
    await pg.goto(F + '#' + route); await pg.waitForTimeout(1200); await pg.evaluate(t => { if (window.V2 && V2.setTheme) V2.setTheme(t); }, theme); await pg.waitForTimeout(900); return {pg, cx, errs}; };
  // 1. static checks
  const stat = async (vw, vh, theme, route, shot) => { const {pg, cx, errs} = await open(vw, vh, theme, route); const k = `${route} ${vw} ${theme}`; res[k] = await pg.evaluate(QA); res[k].errors = errs;
    if (shot) await pg.screenshot({path: path.join(OUT, `sw-${route}-${vw}-${theme}.png`), fullPage: true}); await cx.close(); };
  const sj = []; for (const route of ['team', 'team-empty']) for (const [w, h] of [[320, 640], [390, 844], [820, 1180], [1440, 900], [2560, 1300]]) for (const t of ['day', 'night']) sj.push(() => stat(w, h, t, route, (w === 390 || w === 1440 || w === 820) && (t === 'day' || w !== 820)));
  for (let i = 0; i < sj.length; i += 4) await Promise.all(sj.slice(i, i + 4).map(f => f()));
  // 2. click every control on My Team, fresh page each time
  const clicks = []; const SNAP = () => ({t: document.body.innerText.length + ':' + document.body.innerText.slice(0, 4000).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0), n: document.querySelectorAll('*').length, hash: location.hash, sy: scrollY, sideways: document.documentElement.scrollWidth - innerWidth,
    over: [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); const q = e.getBoundingClientRect(); return (s.position === 'fixed') && q.width > innerWidth * .5 && q.height > innerHeight * .3 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; }).map(e => { const q = e.getBoundingClientRect(); return {c: String(e.className).slice(0, 24), role: e.getAttribute('role'), modal: e.getAttribute('aria-modal'), l: Math.round(q.left), t: Math.round(q.top), r: Math.round(q.right), b: Math.round(q.bottom), sh: e.scrollHeight, ch: e.clientHeight}; }),
    focus: document.activeElement ? (document.activeElement.tagName + '.' + String(document.activeElement.className).slice(0, 20)) : ''});
  const list = async (vw, vh) => { const {pg, cx} = await open(vw, vh, 'day', 'team'); const n = await pg.evaluate(() => [...document.querySelectorAll('button,a,[role=button],[role=tab],select,summary')].filter(e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0; }).map(e => (e.textContent.trim().replace(/\s+/g, ' ') || e.getAttribute('aria-label') || e.getAttribute('title') || '?').slice(0, 40))); await cx.close(); return n; };
  const one = async (vw, vh, i, name) => { const {pg, cx, errs} = await open(vw, vh, 'day', 'team'); const r = {vw, i, name}; try {
      const el = (await pg.$$('button,a,[role=button],[role=tab],select,summary')); const vis = []; for (const e of el) { const q = await e.boundingBox(); if (q && q.width > 0 && q.height > 0) vis.push(e); }
      const e = vis[i]; if (!e) { r.gone = true; } else { const before = await pg.evaluate(SNAP); const tag = await e.evaluate(n => n.tagName + (n.getAttribute('href') ? ' href=' + n.getAttribute('href').slice(0, 40) : '') + (n.disabled ? ' DISABLED' : ''));
        r.tag = tag; await e.scrollIntoViewIfNeeded(); try { await e.click({timeout: 2500}); } catch (x) { r.clickFail = String(x.message).split('\n')[0].slice(0, 110); }
        await pg.waitForTimeout(700); const after = await pg.evaluate(SNAP); r.changed = before.t !== after.t || before.n !== after.n || before.hash !== after.hash; r.hash = before.hash !== after.hash ? after.hash : undefined; r.jump = Math.abs(after.sy - before.sy) > 300 ? after.sy - before.sy : undefined; r.sideways = after.sideways > 1 ? after.sideways : undefined;
        const nov = after.over.filter(o => !before.over.some(p => p.c === o.c)); if (nov.length) { r.overlay = nov.map(o => `${o.c}[role=${o.role},modal=${o.modal}] ${o.l},${o.t}-${o.r},${o.b}` + ((o.r > vw + 1 || o.l < -1) ? ' OFF-SIDE' : '') + ((o.b > vh + 1 && o.sh <= o.ch + 1) ? ' CUT-OFF-BOTTOM' : '')).join(' | '); r.focusIn = after.focus;
          r.bodyScrolls = await pg.evaluate(() => { const y = scrollY; scrollBy(0, 200); const m = scrollY !== y; scrollTo(0, y); return m; });
          await pg.keyboard.press('Escape'); await pg.waitForTimeout(450); const esc = await pg.evaluate(SNAP); r.escCloses = !esc.over.some(o => nov.some(p => p.c === o.c)); r.focusBack = esc.focus; if (i < 400) await pg.screenshot({path: path.join(OUT, `sw-click-${vw}-${i}.png`)}).catch(() => {}); }
      } } catch (x) { r.fail = String(x.message).slice(0, 120); } r.errors = errs.length ? errs.slice(0, 3) : undefined; await cx.close(); clicks.push(r); };
  for (const [vw, vh] of [[390, 844], [1440, 900]]) { const names = await list(vw, vh); res['controls ' + vw] = names.length; const cj = names.map((n, i) => () => one(vw, vh, i, n)); for (let i = 0; i < cj.length; i += 4) await Promise.all(cj.slice(i, i + 4).map(f => f())); }
  clicks.sort((a, c) => a.vw - c.vw || a.i - c.i); fs.writeFileSync(path.join(OUT, 'sweep.json'), JSON.stringify({res, clicks}, null, 1));
  for (const k in res) { const r = res[k]; if (typeof r !== 'object') { console.log(k, r); continue; } console.log(k.padEnd(24), 'h', r.h, 'side', r.sideways, 'broken', r.broken.length, 'small', r.small.length, 'clip', r.clipped.length, 'off', r.offscreen.length, 'overlap', r.overlap.length, 'tap', r.tap.length, 'noName', r.noName.length, 'contrast', r.contrast.length, 'err', r.errors.length); }
  await b.close();
})();
