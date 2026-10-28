// Stress test: the page under hostile conditions. Sections (run all, or name some on the command line):
//   links    team-link fuzz: garbage, truncated, huge, wrong types, old formats, duplicate species, HTML in fields
//   back     rapid back/forward through views and open overlays
//   storage  localStorage throwing / full / cleared / holding corrupt saved state
//   db       no db, db that rejects, slow db (10 s), empty / partial / corrupt meta documents
//   monkey   thousands of random taps, keys, view switches, theme switches and resizes, phone + desktop
// Each checks: no page errors, no blank screen, no NaN/undefined/[object …] text, no executed injected HTML.
// Usage: node experiments/stress-chaos.mjs [section ...] [--actions N]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'stress-chaos.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const args = process.argv.slice(2), ai = args.indexOf('--actions'), ACTIONS = ai >= 0 ? +args[ai + 1] : 3000;
const SECTIONS = args.filter((a, i) => !a.startsWith('--') && (ai < 0 || i !== ai + 1)); const want = s => !SECTIONS.length || SECTIONS.includes(s);
const VIEWS = ['home', 'build', 'auto', 'teams', 'matchup', 'coverage', 'types', 'ratings', 'meta', 'top', 'cores', 'events', 'sets', 'box', 'speed', 'calc', 'gauntlet', 'arch'];
const BAD = /\bNaN\b|\bundefined\b|\[object |\bInfinity\b|null%/;
let seed = 777; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }, pick = a => a[Math.floor(rnd() * a.length)];
const issues = [], add = (tag, m) => { const k = tag.split('/')[0] + '|' + m; if (!issues.some(i => i.k === k)) issues.push({k, tag, m}); };
const stats = {};
const b = await chromium.launch();
// mocked runtime: mode = 'ok' | 'none' | 'null' | 'reject' | 'slow' | {docs}
const initDb = ({D, mode, delay}) => {
  const docs = mode && mode.docs ? mode.docs : D;
  if (mode === 'none') return;
  window.claude = {use: async n => {
    if (mode === 'null') return null;
    if (mode === 'reject') throw new Error('nope');
    if (n !== 'db') return null;
    const d = delay || 5;
    return {doc: p => ({onSnapshot: (cb, err) => { setTimeout(() => { if (mode === 'snaperr') { err && err(new Error('x')); return; } cb({exists: docs[p] !== undefined, data: () => docs[p]}); }, d); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}),
      collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})};
  }};
};
async function open({w = 1366, h = 900, scheme = 'light', mode = 'ok', delay = 0, pre = null, hash = '', tag}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700, colorScheme: scheme});
  const pg = await ctx.newPage(); pg.__tag = tag;
  pg.on('pageerror', e => add(pg.__tag, 'page error: ' + e.message.slice(0, 200)));
  pg.on('dialog', d => { add(pg.__tag, 'dialog opened: ' + d.message().slice(0, 80)); d.dismiss().catch(() => {}); });
  await pg.addInitScript(initDb, {D, mode, delay});
  if (pre) await pg.addInitScript(pre);
  await pg.addInitScript(() => { window.__pwned = 0; });
  await pg.goto('file://' + page + hash).catch(e => add(tag, 'could not open: ' + e.message.slice(0, 80))); await pg.waitForTimeout(delay > 1000 ? 600 : 2200);
  return {ctx, pg};
}
async function check(pg, tag) {
  pg.__tag = tag;
  const r = await pg.evaluate(BADs => { const BAD = new RegExp(BADs);
    const main = document.querySelector('main'); const txt = main ? main.innerText : '';
    const bad = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const t = n.textContent; if (BAD.test(t) && n.parentElement && n.parentElement.offsetParent && !n.parentElement.closest('script,style,textarea,code')) bad.push(t.trim().slice(0, 100)); }
    return {len: txt.trim().length, bad: [...new Set(bad)].slice(0, 3), pw: window.__pwned, inj: !!document.querySelector('img[src="x"], svg[onload], [onerror]:not(script)')}; }, BAD.source).catch(e => ({err: e.message}));
  if (r.err) { add(tag, 'check failed: ' + r.err.slice(0, 120)); return; }
  if (r.len < 40) add(tag, `blank screen (${r.len} chars)`);
  for (const t of r.bad) add(tag, 'text: ' + t);
  if (r.pw || r.inj) add(tag, 'injected HTML ran or was inserted');
}
const go = (pg, v) => pg.evaluate(v => window.__ev(`setView(${JSON.stringify(v)});window.scrollTo(0,0)`), v).catch(e => add(pg.__tag, 'setView threw: ' + e.message.slice(0, 120)));
const b64 = s => Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// ---------- links ----------
if (want('links')) {
  const good = {v: 1, f: 'doubles', s: [['Incineroar', '', ['Fake Out', 'Flare Blitz', 'Parting Shot', 'Protect'], 'Sitrus Berry', 'Careful:32/0/2/0/32/0'], ['Sneasler'], ['Garchomp']]};
  const C = [
    ['valid', b64(JSON.stringify(good))],
    ['truncated', b64(JSON.stringify(good)).slice(0, 40)],
    ['garbage-b64', 'QUJDREVGR0hJSktMTU5PUFFSU1RVVldY'],
    ['not-b64', '!!!!@@@@####$$$$%%%%'],
    ['huge', b64(JSON.stringify({...good, s: Array.from({length: 300}, () => ['Incineroar', 'x'.repeat(20), Array(10).fill('Tackle'), 'y'.repeat(30)])}))],
    ['v2', b64(JSON.stringify({...good, v: 2}))],
    ['singles', b64(JSON.stringify({...good, f: 'singles'}))],
    ['types', b64(JSON.stringify({v: 1, s: [[123], [null], ['Garchomp', {}, 'Earthquake', 5, 'Jolly:99/0/0/0/0/0'], ['Kingambit', 7, [1, 2, null], ['arr'], 12], 'Rillaboom', {n: 'Sneasler'}]}))],
    ['dups', b64(JSON.stringify({v: 1, s: Array(6).fill(['Incineroar'])}))],
    ['html', b64(JSON.stringify({v: 1, n: '<img src=x onerror="window.__pwned=1">', s: [['Incineroar', '<img src=x onerror="window.__pwned=1">', ['<svg onload=window.__pwned=1>'], '<img src=x onerror=a>', '<b>:1/2/3/4/5/6']]}))],
    ['nature-bad', b64(JSON.stringify({v: 1, s: [['Incineroar', '', 0, '', 'Hacky:0/0/0/0/0/0'], ['Garchomp', '', 0, '', 'Jolly:32/32/32/32/32/32']]}))],
    ['bad-ability', b64(JSON.stringify({v: 1, s: [['Incineroar', 'Huge Power'], ['Charizard-Mega-Y', 'Drizzle']]}))],
    ['bad-item', b64(JSON.stringify({v: 1, s: [['Incineroar', '', 0, 'Choice Band'], ['Garchomp', '', 0, 'Charizardite Y'], ['Sneasler', '', 0, 'Leftovers']]}))],
    ['proto', b64('{"v":1,"s":[["__proto__"],["constructor"],["toString"]],"__proto__":{"polluted":1}}')],
    ['unicode', b64(JSON.stringify({v: 1, n: '🔥'.repeat(100), s: [['Incineroar']]}))],
    ['empty', ''],
    ['equals', '======'],
  ];
  for (const [name, code] of C) for (const where of ['#team=', '?team=']) {
    const tag = `links/${name}${where[0]}`; const {ctx, pg} = await open({hash: where + code, tag});
    const bar = await pg.evaluate(() => !!document.getElementById('sharedBar'));
    if (bar) { await pg.evaluate(() => { const x = document.querySelector('[data-sharedload]'); x && x.click(); }); await pg.waitForTimeout(600);
      const st = await pg.evaluate(() => window.__ev(`({n:S.slots.filter(s=>s.n).map(s=>s.n),dup:new Set(S.slots.filter(s=>s.n).map(s=>byName.get(s.n).b)).size!==S.slots.filter(s=>s.n).length,sp:S.slots.filter(s=>s.sp&&s.sp.doubles).map(s=>s.sp.doubles.v.reduce((a,b)=>a+b,0)),it:S.slots.map(s=>s.it&&s.it.doubles).filter(Boolean),ab:S.slots.filter(s=>s.n&&s.a&&!byName.get(s.n).a.includes(s.a)).map(s=>s.n+':'+s.a),pol:({}).polluted})`));
      if (st.dup) add(tag, 'two of the same species loaded: ' + st.n.join(','));
      if (st.sp.some(x => x > 66)) add(tag, 'stat points over 66 accepted: ' + st.sp.join(','));
      if (st.pol) add(tag, 'prototype polluted');
      for (const it of st.it) if (/[<>]|Choice Band|Charizardite/.test(it)) add(tag, 'bad held item accepted: ' + it.slice(0, 40));
      if (st.ab.length) add(tag, 'ability the Pokémon cannot have kept: ' + st.ab.join(', '));
      for (const v of ['build', 'matchup', 'calc', 'speed']) { await go(pg, v); await pg.waitForTimeout(500); await check(pg, tag + '/' + v); }
    } else await check(pg, tag);
    if (name === 'valid' && !bar) add(tag, 'valid link did not offer the team');
    await ctx.close(); }
  stats.links = C.length * 2;
}

// ---------- back / forward ----------
if (want('back')) {
  for (const w of [375, 1366]) { const tag = `back/${w}`; const {ctx, pg} = await open({w, h: 812, tag}); let n = 0;
    for (let k = 0; k < 120; k++) { await go(pg, pick(VIEWS)); n++; if (rnd() < .3) await pg.evaluate(() => { const o = [...document.querySelectorAll('[data-lt],[data-fb],#fbOpen,.fbbtn,[data-jump]')].filter(e => e.offsetParent); if (o.length) o[Math.floor(Math.random() * o.length)].click(); }); await pg.waitForTimeout(30); }
    for (let k = 0; k < 150; k++) { if (rnd() < .75) await pg.goBack({timeout: 2000}).catch(() => {}); else await pg.goForward({timeout: 2000}).catch(() => {}); if (k % 10 === 0) await check(pg, tag + '/hist'); }
    const v = await pg.evaluate(() => window.__ev('view')); if (!VIEWS.includes(v)) add(tag, 'ended on unknown view ' + v);
    // overlays: open the Pokémon sheet, then back closes it (not the page)
    await go(pg, 'ratings'); await pg.waitForTimeout(400); await go(pg, 'top'); await pg.waitForTimeout(400);
    const opened = await pg.evaluate(() => { const e = [...document.querySelectorAll('main [data-lt]')].find(e => e.offsetParent); if (!e) return false; e.click(); return true; }); await pg.waitForTimeout(500);
    if (opened) { const vis = await pg.evaluate(() => { const s = document.getElementById('lairSheet'); return !!(s && !s.hidden && s.offsetParent !== null); });
      await pg.goBack(); await pg.waitForTimeout(400);
      const after = await pg.evaluate(() => ({v: window.__ev('view'), open: (() => { const s = document.getElementById('lairSheet'); return !!(s && !s.hidden && s.offsetParent !== null); })()}));
      if (vis && (after.open || after.v !== 'top')) add(tag, `back with the Pokémon sheet open: view ${after.v}, sheet still open ${after.open}`); }
    stats['back' + w] = n; await ctx.close(); }
}

// ---------- storage ----------
if (want('storage')) {
  const P = {
    'throws': () => { for (const k of ['getItem', 'setItem', 'removeItem', 'clear', 'key']) Storage.prototype[k] = () => { throw new DOMException('blocked', 'SecurityError'); }; },
    'quota': () => { Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); }; },
    'no-ls': () => { Object.defineProperty(window, 'localStorage', {get() { throw new DOMException('denied', 'SecurityError'); }}); },
    'corrupt': () => { const g = ['{', 'null', '[]', '"x"', '{"slots":"x","box":[],"teams":[]}', '{"slots":[{"n":"Incineroar","mv":"x","it":5,"sp":{"doubles":{"v":[99,99,99,99,99,99],"nat":"<b>"}}},null,7,"x"],"box":[1,null,"Garchomp"],"teams":[{"id":"a","slots":[{"n":"Bogus"}]},null,{"id":"b","name":"<img src=x onerror=window.__pwned=1>","slots":[]}],"loadedId":"zz","log":[{"r":"W","b":"x"},null,{"r":"L","b":["Incineroar"],"t":"NaN"}],"opp":"x"}'];
      const p = g[+(sessionStorage.getItem('__g') || 0) % g.length];
      for (const k of ['cc2.state', 'cc2.view', 'cc2.theme', 'cc2.lmode', 'cc2.setMon', 'cc2.pool', 'cc2.setSrc', 'cc2.tview', 'cc2.recsrc', 'cc2.absrc', 'cc2.welcomed', 'cc2.seenNew', 'cc2.refreshAt']) localStorage.setItem(k, k === 'cc2.state' ? p : pick2()); function pick2() { return ['{', '"zzz"', '999', 'null', '[1,2]', '{"a":1}'][Math.floor(Math.random() * 6)]; } },
  };
  for (const [name, fn] of Object.entries(P)) for (let rep = 0; rep < (name === 'corrupt' ? 6 : 1); rep++) {
    const tag = `storage/${name}${rep ? rep : ''}`;
    const pre = name === 'corrupt' ? new Function(`sessionStorage.setItem('__g','${rep}');(${fn.toString()})()`) : fn;
    const {ctx, pg} = await open({tag, pre});
    for (const v of ['home', 'build', 'teams', 'ratings', 'calc', 'speed', 'box', 'matchup']) { await go(pg, v); await pg.waitForTimeout(300); await check(pg, tag + '/' + v); }
    // save a team and switch theme with storage broken
    await pg.evaluate(() => { for (const s of ['[data-theme-set="dark"]', '.thm button', '#saveTeam', '[data-save]']) { const e = document.querySelector(s); if (e && e.offsetParent) e.click(); } }).catch(() => {});
    await pg.waitForTimeout(300); await check(pg, tag + '/after-actions');
    await ctx.close(); }
  stats.storage = Object.keys(P).length + 5;
}

// ---------- db ----------
if (want('db')) {
  const deepMut = (o, rate) => { if (Array.isArray(o)) return o.map(x => deepMut(x, rate)); if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = deepMut(o[k], rate); return r; }
    if (rnd() < rate) return pick([null, 'x', -1, 1e12, '', '<img src=x onerror="window.__pwned=1">', [], {}, true, 'abc', -0.5, 99999]); return o; };
  const modes = [['none', 'none'], ['null', 'null'], ['reject', 'reject'], ['snaperr', 'snaperr'], ['slow-10s', 'ok', 10000], ['empty-docs', {docs: {}}],
    ['all-null', {docs: Object.fromEntries(Object.keys(D).map(k => [k, null]))}], ['all-string', {docs: Object.fromEntries(Object.keys(D).map(k => [k, 'garbage']))}],
    ['all-array', {docs: Object.fromEntries(Object.keys(D).map(k => [k, [1, 2, 3]]))}], ['all-empty-obj', {docs: Object.fromEntries(Object.keys(D).map(k => [k, {}]))}]];
  for (const k of Object.keys(D)) modes.push(['only-missing:' + k, {docs: Object.fromEntries(Object.entries(D).filter(([x]) => x !== k))}]);
  for (let i = 0; i < 6; i++) modes.push(['mutated-2%#' + i, {docs: deepMut(D, .02)}]);
  for (const k of Object.keys(D)) modes.push(['mutated-30%:' + k, {docs: {...D, [k]: deepMut(D[k], .3)}}]);
  for (const k of Object.keys(D)) for (let i = 0; i < 3; i++) modes.push([`mutated-3%:${k}#${i}`, {docs: {...D, [k]: deepMut(D[k], .03)}}]);
  for (const [name, mode, delay] of modes) {
    const tag = `db/${name}`; const {ctx, pg} = await open({tag, mode, delay});
    if (delay) { await check(pg, tag + '/before-data'); await pg.waitForTimeout(delay + 1500); }
    const before = issues.length;
    for (const v of ['home', 'ratings', 'top', 'cores', 'events', 'teams', 'sets', 'build', 'matchup', 'calc', 'gauntlet']) { await go(pg, v); await pg.waitForTimeout(v === 'gauntlet' ? 1500 : 250); await check(pg, tag + '/' + v); }
    if (issues.length > before && mode && mode.docs && process.env.DUMP) fs.writeFileSync(`${process.env.DUMP}/${name.replace(/[^\w-]/g, '_')}.json`, JSON.stringify(mode.docs));
    await ctx.close(); }
  stats.db = modes.length;
}

// ---------- chaos monkey ----------
if (want('monkey')) {
  let total = 0;
  for (const [w, h, scheme] of [[375, 812, 'dark'], [1366, 900, 'light'], [375, 812, 'light'], [1366, 900, 'dark']]) {
    const tag = `monkey/${w}${scheme}`; const {ctx, pg} = await open({w, h, scheme, tag}); const per = Math.round(ACTIONS / 4);
    const t0 = Date.now(); let last = '';
    for (let k = 0; k < per; k++) { const r = rnd(); let act;
      try {
        if (r < .55) { act = await pg.evaluate(seed => { const els = [...document.querySelectorAll('button, summary, a[href^="#"], [data-view], [role=button], input[type=checkbox], input[type=radio], select, [data-lt], [data-mon]')].filter(e => e.offsetParent && !e.disabled && !/download|copy|delete|remove|clear|reset|send/i.test(e.textContent + (e.getAttribute('aria-label') || '')));
            if (!els.length) return 'none'; const e = els[seed % els.length]; if (e.tagName === 'SELECT') { const o = e.options; if (o.length) { e.selectedIndex = seed % o.length; e.dispatchEvent(new Event('change', {bubbles: true})); } return 'select ' + (e.id || e.name); }
            e.click(); return 'click ' + (e.getAttribute('aria-label') || e.textContent || e.className).trim().slice(0, 30); }, Math.floor(rnd() * 1e6)); }
        else if (r < .7) { const v = pick(VIEWS); act = 'view ' + v; await go(pg, v); }
        else if (r < .8) { act = await pg.evaluate(seed => { const els = [...document.querySelectorAll('input[type=text], input[type=search], input:not([type]), textarea')].filter(e => e.offsetParent && !e.readOnly); if (!els.length) return 'type none';
            const e = els[seed % els.length], T = ['Incin', 'garchomp', '<img src=x onerror=window.__pwned=1>', '🔥', 'zzzzzz', '', '   ', 'Kingambit @ Leftovers\n- Sucker Punch', 'a'.repeat(3000)]; e.focus(); e.value = T[seed % T.length]; e.dispatchEvent(new Event('input', {bubbles: true})); e.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})); return 'type into ' + (e.id || e.placeholder || '').slice(0, 20); }, Math.floor(rnd() * 1e6)); }
        else if (r < .87) { const key = pick(['Escape', 'Tab', 'Enter', 'ArrowDown', 'ArrowUp', ' ', '/', 'k']); act = 'key ' + key; await pg.keyboard.press(key === 'k' ? 'Control+k' : key); }
        else if (r < .92) { act = 'back'; await pg.goBack({timeout: 1500}).catch(() => {}); }
        else if (r < .96) { const s = pick([[320, 568], [375, 812], [768, 1024], [1366, 900], [2560, 1300]]); act = 'resize ' + s; await pg.setViewportSize({width: s[0], height: s[1]}); }
        else { act = 'theme'; await pg.evaluate(() => { const t = [...document.querySelectorAll('[data-theme-set], .thm button, [aria-label*="theme" i], [aria-label*="dark" i], [aria-label*="light" i]')].filter(e => e.offsetParent); if (t.length) t[Math.floor(Math.random() * t.length)].click(); }); }
      } catch (e) { add(tag, `action failed (${act}): ${e.message.slice(0, 120)}`); }
      last = act; total++;
      if (k % 15 === 0) { await pg.waitForTimeout(60); await check(pg, `${tag}/after "${last}"`); }
    }
    await pg.waitForTimeout(400); await check(pg, tag + '/end');
    stats[tag] = {actions: per, sec: Math.round((Date.now() - t0) / 1000)}; await ctx.close(); }
  stats.monkeyTotal = total;
}

await b.close(); fs.unlinkSync(page);
console.log(JSON.stringify(stats));
console.log(issues.length ? issues.map(i => `${i.tag}: ${i.m}`).join('\n') + `\n\n${issues.length} ISSUES` : 'CHAOS CLEAN');
process.exit(issues.length ? 1 : 0);
