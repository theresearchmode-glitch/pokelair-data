// Pre-launch check 1 (Nov 17): a page must not draw the built-in numbers first and then swap to today's (Home "10,209 real
// tournament teams" became "13,826" ~1.2 s later; the Game Plan's lead and bench flipped; Strength Score 92 -> 93).
// The page's data store is made to answer 1.2 s late (as the live site's does); the page is read every 100 ms. Fails if a number,
// the Game Plan or the Strength Score, once shown, changes; or if nothing says it's loading while it waits.
// Exit 1 on any failure (fails on a --preview-data build before the fix).   PAGE=app/dist/v2.html node app/test/data-swap.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), DELAY = +(process.env.DELAY || 1200);
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const b = await chromium.launch();
for (const [route, read] of [
  ['home', () => { const m = document.querySelector('#main'); if (!m) return null; const t = m.innerText.replace(/\s+/g, ' ');
    const a = (t.match(/from ([\d,]+) real tournament teams/) || [])[1], u = (t.match(/([\d.]+)% of Showdown ladder teams · #1/) || [])[1], g = (t.match(/Game Plan [^.]{0,160}/) || [])[0];
    return {a, u, g, load: !!m.querySelector('.np-loading')}; }],
  ['team', () => { const m = document.querySelector('#main'); if (!m) return null; const s = m.querySelector('.tm-hero'), t = s ? s.innerText.replace(/\s+/g, ' ') : '';
    return {sc: (t.match(/(\d{1,3}) (?:Top tier|Tournament ready|Solid|Needs work|Missing a basic)/) || [])[1], load: !!m.querySelector('.np-loading')}; }],
  ['meta', () => { const m = document.querySelector('#main'); if (!m) return null; const t = m.innerText.replace(/\s+/g, ' ');
    /* Q60 (Nov 20): on phones the S tier's count sits on its band as "See All 11 ›" (no "11 Pokémon" line) */
    return {s: (t.match(/S tier[^0-9]{0,40}(\d+) Pokémon/) || t.match(/90\+ (\d+) Pokémon/) || t.match(/90\+[^0-9]{0,60}See All (\d+)/) || [])[1], load: !!m.querySelector('.np-loading')}; }]]) {
  const p = await b.newPage({viewport: {width: 390, height: 844}});
  await p.addInitScript(d => { let w; Object.defineProperty(window, '__NP_CLAUDE', {configurable: true, get: () => w, set: v => {
    w = v && v.use ? {use: async n => { const r = await v.use(n); if (n !== 'db' || !r) return r;
      return {doc: q => { const x = r.doc(q); return Object.assign({}, x, {onSnapshot: cb => x.onSnapshot(s => setTimeout(() => cb(s), d))}); }}; }} : v; }}); }, DELAY);
  await p.goto('file://' + PAGE + '#' + route); const seen = []; let loadSeen = false;
  for (let i = 0; i < 40; i++) { const v = await p.evaluate(read); if (v) { if (v.load) loadSeen = true; delete v.load; seen.push(JSON.stringify(v)); } await p.waitForTimeout(100); }
  const vals = seen.map(x => JSON.parse(x)), keys = [...new Set(vals.flatMap(o => Object.keys(o)))];
  for (const k of keys) { const shown = [...new Set(vals.map(o => o[k]).filter(x => x != null))]; ok(shown.length <= 1, `${route}: "${k}" never changes once shown (${shown.length ? shown.map(x => String(x).slice(0, 60)).join(' -> ') : 'not shown'})`); }
  const first = vals.findIndex(o => Object.keys(o).length); ok(keys.length > 0, `${route}: the numbers appear (first at about ${first < 0 ? 'never' : (first + 1) * 100 + ' ms'}, data store ${DELAY} ms late)`);
  ok(loadSeen, `${route}: while the numbers load, the page says so (loading panel seen: ${loadSeen})`);
  await p.close(); }
await b.close();
console.log(`data-swap: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
