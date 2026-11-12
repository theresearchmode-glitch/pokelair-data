// Behaviour tests: shared kit (Rebuild R1, Nov 10). Every feature in docs/rebuild/inventory/*.md gets a test written from the
// player's side ("tap X, see Y"), keyed by its inventory ID. The same tests must pass on today's site AND on the rebuild before
// a rebuilt page replaces the old one, so nothing is lost.
//
// Portability rule: tests talk to the page through the ADAPTER (adapters/<name>.mjs), never through today's class names or
// internals directly. Today's adapter is adapters/current.mjs; the rebuild gets its own adapter with the same function names.
// Prefer what a player sees: visible text (word list words), roles, labels. Use adapter selectors only where text can't work.
//
// Data: frozen copy in fixture/ (freeze.mjs). Tests fail only when the code breaks, never because the daily data moved.
//
// Usage inside a group file:
//   import {group, open, TEAM} from './harness.mjs';
//   const t = group('A-team');
//   t('TEAM-03', 'Remove a Pokémon with its ×', async () => { const {pg, ui} = await open({team: TEAM}); ... ; ui.close(); });
// Run: node app/test/behaviour/run.mjs [A-team|B-build|C-battle|D-meta-shell] [--only=ID,ID]   PAGE=path ADAPTER=name
import fs from 'node:fs'; import zlib from 'node:zlib'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';

export const HERE = fileURLToPath(new URL('.', import.meta.url)), ROOT = HERE + '../../../';
export const PAGE_SRC = process.env.PAGE || ROOT + 'app/dist/page.html';
export const TEAM = ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'];
export const BOX = ['Absol', 'Archaludon', 'Azumarill', 'Basculegion', 'Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Whimsicott', 'Rillaboom'];
export const OPP = ['Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Whimsicott', 'Basculegion'];

// ---------- frozen data, served as the page's shared database documents ----------
const fx = f => { try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(HERE + 'fixture/' + f + '.json.gz')).toString('utf8')); } catch (e) { return null; } };
const L = fx('limitless') || {};
export const DOCS = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null,
  'meta/doubles_tour': fx('meta_tour'), 'meta/teams': fx('teams'), 'meta/model': fx('model'), 'meta/doubles': fx('meta_ladder'),
  'meta/doubles_ingame': fx('meta_ingame'), 'meta/history': fx('history'), 'meta/events': fx('events'), 'meta/weekly': fx('weekly'),
  'meta/track': fx('track'), 'meta/practice': fx('practice'), 'meta/calendar': fx('calendar')};

// ---------- the page under test (a copy with a test hook; the hook is optional, adapters must work without it) ----------
const PAGE = ROOT + `app/test/behaviour/_page-${process.pid}.html`;
let built = false;
function page() { if (built) return PAGE; let h = fs.readFileSync(PAGE_SRC, 'utf8');
  h = h.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);');
  fs.writeFileSync(PAGE, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + h);
  // the new site reads its self-hosted fonts from fonts/ beside the page (Nov 12): copy them next to this test copy too
  const fd = PAGE_SRC.replace(/[^\/\\]*$/, '') + 'fonts'; if (fs.existsSync(fd)) { const to = ROOT + 'app/test/behaviour/fonts'; fs.mkdirSync(to, {recursive: true}); for (const f of fs.readdirSync(fd)) if (f.endsWith('.woff2')) fs.copyFileSync(fd + '/' + f, to + '/' + f); }
  built = true; return PAGE; }
process.on('exit', () => { try { fs.unlinkSync(PAGE); } catch (e) {} });

const AD_NAME = process.env.ADAPTER || 'current';
export const ADAPTER = (await import(`./adapters/${AD_NAME}.mjs`)).default;
// extra page-group helpers live in adapters/<name>.<group>.mjs (default export: (A, pg) => ({...more functions})), merged in
// Name clashes (Nov 11): every group's helpers are merged, then the CURRENT test's own group is merged again last, so a group
// always gets its own helper when two groups use the same name.
const EXTRAS = [];
for (const f of fs.readdirSync(HERE + 'adapters').filter(f => f.startsWith(AD_NAME + '.') && f.endsWith('.mjs') && f !== AD_NAME + '.mjs').sort())
  EXTRAS.push({group: f.slice(AD_NAME.length + 1, -4), fn: (await import(`./adapters/${f}`)).default});
let CUR_GROUP = null;
/** the runner sets this before each test */
export const setGroup = g => { CUR_GROUP = g; };

let browser = null;
export async function closeAll() { if (browser) await browser.close(); browser = null; }

/** Open the site the way a player would.
 * opts: width (1280), height (900), mode 'light'|'dark', touch (auto for width < 700),
 *   team: array of names (default none), box: names, opp: names, saved: [{name, team:[names]}],
 *   account: true = signed in (data saved to the fake account, readable via acct()), false = this browser only,
 *   fresh: true = first-time visitor (no welcome dismissal, nothing saved),
 *   stored: extra raw localStorage entries {key: value}, hash: '#team=...' etc.
 * Returns {pg, ctx, errs, ui, acct, ls, close}. `ui` is the adapter bound to this page. */
export async function open(o = {}) {
  if (!browser) browser = await chromium.launch();
  const width = o.width || 1280, touch = o.touch ?? width < 700;
  const ctx = await browser.newContext({viewport: {width, height: o.height || 900}, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch,
    colorScheme: o.mode === 'dark' ? 'dark' : 'light'});
  const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  const state = o.team || o.box || o.opp || o.saved ? ADAPTER.stateFor(o) : null;
  await pg.addInitScript(([D, st, o]) => {
    window.__PL_TEST = 1;
    // copies are recorded here as well as sent to the real clipboard (Nov 11: reading the clipboard back fails on Windows)
    window.__copied = null; try { const c = navigator.clipboard, w = c && c.writeText && c.writeText.bind(c); if (c) c.writeText = s => { window.__copied = String(s); return w ? w(s).catch(() => {}) : Promise.resolve(); }; } catch (e) {}
    // Reloads (Nov 11): seed only on this tab's FIRST load, so a reload shows what the player saved, like a real reload.
    let first = true; try { first = !sessionStorage.getItem('__np_seeded'); sessionStorage.setItem('__np_seeded', '1'); } catch (e) {}
    if (first) try { if (!o.fresh) { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); }
      localStorage.setItem('cc2.theme', JSON.stringify(o.mode || 'light'));
      if (st && o.account === false) localStorage.setItem('cc2.state', JSON.stringify(st));
      for (const k in (o.stored || {})) localStorage.setItem(k, o.stored[k]); } catch (e) {}
    // the fake account: shared docs from the frozen data; the player's own doc in memory (window.__acct) so tests can read saves
    const mine = 'data/users/u_test/state'; let kept = null; try { kept = first ? null : JSON.parse(sessionStorage.getItem('__np_acct') || 'null'); } catch (e) {}
    window.__acct = kept || (st && o.account !== false ? {[mine]: JSON.parse(JSON.stringify(st))} : {});
    const keep = () => { try { sessionStorage.setItem('__np_acct', JSON.stringify(window.__acct)); } catch (e) {} }; keep();
    const docOf = p => ({
      get: async () => ({exists: p in window.__acct || !!D[p], data: () => p in window.__acct ? JSON.parse(JSON.stringify(window.__acct[p])) : D[p]}),
      set: async v => { window.__acct[p] = JSON.parse(JSON.stringify(v)); keep(); },
      update: async v => { window.__acct[p] = Object.assign(window.__acct[p] || {}, JSON.parse(JSON.stringify(v))); keep(); },
      onSnapshot: cb => { setTimeout(() => cb({exists: p in window.__acct || !!D[p], metadata: {}, data: () => p in window.__acct ? window.__acct[p] : D[p]}), 5); return () => {}; }});
    const db = {doc: docOf, collection: c => ({doc: k => docOf(c + '/' + k)})};
    window.claude = {use: async n => { await new Promise(r => setTimeout(r, 10));
      if (n === 'db') return o.account === false ? null : db;
      if (n === 'user') return o.account === false ? null : {id: async () => 'u_test', isOwner: () => true, canEdit: () => true, can: () => true, me: async () => ({id: 'u_test'})};
      return null; }};
  }, [DOCS, state, {fresh: !!o.fresh, mode: o.mode, account: o.account, stored: o.stored}]);
  await pg.goto('file://' + page() + (o.hash || ''));
  await pg.waitForTimeout(o.wait ?? 1500);
  const ui = ADAPTER.bind(pg, o); for (const X of EXTRAS) Object.assign(ui, X.fn(ui, pg, o));
  for (const X of EXTRAS) if (X.group === CUR_GROUP) Object.assign(ui, X.fn(ui, pg, o));
  const acct = () => pg.evaluate(() => window.__acct['data/users/u_test/state'] || null);
  const ls = k => pg.evaluate(k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return localStorage.getItem(k); } }, k);
  return {pg, ctx, errs, ui, acct, ls, close: () => ctx.close()};
}

// ---------- tests ----------
const ALL = [];
/** group('A-team') returns t(id, title, fn, opts). opts.known = 'why': a known bug, expected to fail until fixed (reported apart).
 * opts.skip = 'why': can't be tested here (e.g. needs a real iPhone); listed, never silently dropped. */
export function group(name) { return (id, title, fn, opts = {}) => ALL.push({group: name, id, title, fn, ...opts}); }
export const tests = () => ALL;

/** small helpers every test may use */
export const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
export const visibleText = (pg, sel = 'body') => pg.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }, sel);
export const sleep = ms => new Promise(r => setTimeout(r, ms));
/** retry a check until it passes or time runs out (Nov 11: a fast PC checked before the page finished redrawing).
 *  fn returns truthy when the condition holds; resolves true/false. */
export async function eventually(fn, ms = 4000, step = 150) { const end = Date.now() + ms; for (;;) { try { if (await fn()) return true; } catch (e) {} if (Date.now() > end) return false; await sleep(step); } }
