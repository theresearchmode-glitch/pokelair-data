// PokéLair test suite: builds the page, loads it in Chromium with a mocked Claude runtime serving the repo's out/ data,
// and checks every page on desktop and phone, the Meta sources, the damage calc, Gauntlet and phone layout.
// Run: node app/test/run.mjs   (exit code 1 on any failure)
import fs from 'node:fs'; import {execFileSync} from 'node:child_process'; import {chromium} from 'playwright';
const APP = new URL('..', import.meta.url).pathname, OUT = APP + '../out/';
execFileSync('node', [APP + 'build.mjs'], {stdio: 'inherit'});
const page = APP + 'dist/test.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const VIEWS = ['home', 'build', 'auto', 'matchup', 'speed', 'calc', 'gauntlet', 'coverage', 'types', 'ratings', 'meta', 'top', 'sets', 'teams', 'box'];
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('  FAIL', msg); } else console.log('  ok  ', msg); };
const browser = await chromium.launch();
async function open(width) {
  const ctx = await browser.newContext({viewport: {width, height: 900}, isMobile: width < 700, hasTouch: width < 700});
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
  await pg.addInitScript(D => { window.__PL_TEST = true; const state = {};
    window.claude = {use: async n => { await new Promise(r => setTimeout(r, 20));
      if (n === 'db') return {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: !!state[p], data: () => state[p]}), set: async v => { state[p] = v; }})};
      if (n === 'user') return {id: async () => 'u_test', isOwner: () => true}; return null; }}; }, DOCS);
  await pg.goto('file://' + page); await pg.waitForTimeout(1500);
  return {pg, errs, ctx}; }
const go = (pg, v) => pg.evaluate(v => { const b = document.querySelector(`.sidenav [data-view="${v}"]`) || document.querySelector(`[data-view="${v}"]`); b.click(); }, v);
for (const width of [1280, 390]) {
  console.log(`\n== ${width}px`);
  const {pg, errs, ctx} = await open(width);
  for (const v of VIEWS) { await go(pg, v); await pg.waitForTimeout(v === 'gauntlet' ? 2500 : 400);
    const r = await pg.evaluate(v => { const p = document.querySelector(`[data-pane="${v}"]`); return {shown: p && !p.hidden, len: p ? p.innerText.length : 0, sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth}; }, v);
    ok(r.shown && r.len > 100, `${v}: renders (${r.len} chars)`);
    if (width < 700) ok(r.sw <= r.w, `${v}: no sideways scroll on phone`); }
  // Meta: every source has rows
  for (const src of ['ingame', 'tour', 'ladder']) { await go(pg, 'meta'); await pg.evaluate(s => document.querySelector(`[data-src="${s}"]`).click(), src); await pg.waitForTimeout(300);
    const n = await pg.evaluate(() => document.getElementById('metaList').children.length); ok(n >= 40, `meta/${src}: ${n} rows`); }
  // Team Score, counters on Rankings, turn 1 plan in Matchup
  await go(pg, 'build'); await pg.waitForTimeout(400);
  const ts = await pg.evaluate(() => { const v = document.getElementById('verdict'); return v ? v.innerText : ''; });
  ok(/Team Score \d+/.test(ts), 'team: Team Score shown');
  await go(pg, 'meta'); await pg.evaluate(() => document.querySelector('[data-src="ladder"]').click()); await pg.waitForTimeout(300);
  ok(await pg.evaluate(() => /Checks & counters/.test(document.getElementById('metaList').innerText)), 'meta/ladder: checks & counters shown');
  // Gauntlet has teams with model odds
  await go(pg, 'gauntlet'); await pg.waitForTimeout(2500);
  const g = await pg.evaluate(() => ({n: document.querySelectorAll('.gitem').length, model: document.querySelectorAll('.gpm').length}));
  ok(g.n >= 10, `gauntlet: ${g.n} teams`); ok(g.model >= 1, `gauntlet: model odds shown`);
  await pg.evaluate(() => document.querySelector('[data-gaunt]').click()); await pg.waitForTimeout(800);
  ok(await pg.evaluate(() => { const t = document.querySelector('.t1plan'); return !!t && /Speed order/.test(t.innerText); }), 'matchup: turn 1 plan shown');
  ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
  await ctx.close(); }
// damage calc and speed checks
{ console.log('\n== calc');
  const {pg, ctx} = await open(1280);
  const r = await pg.evaluate(() => { const T = window.__PL, P = n => T.byName.get(n), M = n => T.mvByName.get(n), side = (n, role, o) => ({p: P(n), ...T.sideDefaults(P(n), role), ...(o || {})});
    const d = (a, df, mv, o) => T.damage({atk: a, def: df, move: M(mv), ...(o || {})});
    return {
      levitate: d(side('Garchomp', 'atk'), side('Gengar', 'def', {ability: 'Levitate'}), 'Earthquake', {spread: true}).max,
      ghostNormal: d(side('Gengar', 'atk'), side('Kangaskhan', 'def'), 'Shadow Ball').eff,
      status: T.damage({atk: side('Garchomp', 'atk'), def: side('Incineroar', 'def'), move: M('Protect')}),
      intim: [d(side('Kingambit', 'atk'), side('Incineroar', 'def'), 'Kowtow Cleave').max, d(side('Kingambit', 'atk', {boost: -1}), side('Incineroar', 'def'), 'Kowtow Cleave').max],
      spread: [d(side('Garchomp', 'atk'), side('Incineroar', 'def'), 'Earthquake', {spread: false}).max, d(side('Garchomp', 'atk'), side('Incineroar', 'def'), 'Earthquake', {spread: true}).max],
      hp: T.damage({atk: side('Garchomp', 'atk'), def: side('Incineroar', 'def', {hpSp: 32}), move: M('Earthquake')}).hp,
      spe: T.likelySpeed(P('Torkoal')).v, realSpread: T.sideDefaults(P('Rillaboom'), 'def') }; });
  ok(r.levitate === 0, 'Levitate is immune to Earthquake'); ok(r.ghostNormal === 0, 'Ghost moves miss Normal types'); ok(r.status === null, 'status moves do no damage');
  ok(r.intim[1] < r.intim[0], 'Intimidate lowers damage'); ok(r.spread[1] < r.spread[0], 'spread moves do 75%');
  ok(r.hp === 95 + 75 + 32, 'level 50 HP with 32 points: base + 75 + points');
  ok(r.realSpread && r.realSpread.real, 'calc uses real ladder spreads when loaded'); ok(r.spe < 60, 'Trick Room setters stay slow');
  await ctx.close(); }
await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
