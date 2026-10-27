// NastyPlot test suite: builds the page, loads it in Chromium with a mocked Claude runtime serving the repo's out/ data,
// and checks every page on desktop and phone, the Meta sources, the damage calc, Gauntlet and phone layout.
// Run: node app/test/run.mjs   (exit code 1 on any failure)
import fs from 'node:fs'; import {execFileSync} from 'node:child_process'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
// fileURLToPath works on Windows too (URL.pathname gives "/C:/..." there)
const APP = fileURLToPath(new URL('..', import.meta.url)), OUT = APP + '../out/';
execFileSync('node', [APP + 'build.mjs'], {stdio: 'inherit'});
const page = APP + 'dist/test.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const VIEWS = ['home', 'build', 'auto', 'matchup', 'speed', 'calc', 'gauntlet', 'arch', 'coverage', 'types', 'ratings', 'meta', 'cores', 'top', 'events', 'sets', 'teams', 'box'];
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
  const ts = await pg.evaluate(() => { const v = document.getElementById('verdict'); return v ? v.textContent : ''; });
  ok(/Team Score \d+/i.test(ts), 'team: Team Score shown');
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
// replay import and Showdown export
{ console.log('\n== replay + export');
  const {pg, ctx} = await open(1280);
  const r = await pg.evaluate(() => { const T = window.__PL; const mine = T.members().map(m => m.p);
    const sw = (s, i, p) => `|switch|${s}${'ab'[i % 2]}: X|${p.n}, L50|100/100`;
    const log = ['|player|p1|Me|1', '|player|p2|Them|2', ...mine.map(p => `|poke|p1|${p.n}, L50|`), ...['Garchomp', 'Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Pelipper'].map(n => `|poke|p2|${n}, L50|`),
      sw('p1', 0, mine[0]), sw('p1', 1, mine[1]), '|switch|p2a: Y|Garchomp, L50|100/100', '|turn|1', sw('p1', 0, mine[2]), sw('p1', 1, mine[3]), '|win|Me'].join('\n');
    const x = T.parseReplay(log); const paste = T.exportPaste(), back = T.parsePaste(paste);
    return {x, evs: /EVs: /.test(paste), nature: / Nature/.test(paste), back: back.slots.length, n: mine.length}; });
  ok(r.x.r === 'W' && r.x.b.length === 4 && r.x.o.length === 6, 'replay: win, 4 brought, their 6 read from the log');
  ok(r.evs && r.nature, 'export: spreads and natures in the Showdown paste');
  ok(r.back === r.n, 'export: the paste imports back to the same six');
  await ctx.close(); }
// data health banner: hidden with fresh data, shown when a source is stale
{ console.log('\n== data health');
  const fresh = await open(1280); ok(await fresh.pg.evaluate(() => document.getElementById('healthBar').hidden), 'health: no banner with fresh data'); await fresh.ctx.close();
  const old = DOCS['meta/model']; DOCS['meta/model'] = {...old, updated: '2026-01-01T00:00:00Z'};
  const stale = await open(1280); ok(await stale.pg.evaluate(() => { const b = document.getElementById('healthBar'); return !b.hidden && /Win model/.test(b.textContent); }), 'health: banner names a stale source'); await stale.ctx.close();
  DOCS['meta/model'] = old; }
// share card: draws the team and opens the dialog
{ console.log('\n== share card');
  const {pg, errs, ctx} = await open(1280); await go(pg, 'build'); await pg.waitForTimeout(400);
  await pg.click('#shareBtn'); await pg.waitForSelector('#shareBox:not([hidden])', {timeout: 15000}).catch(() => {});
  const r = await pg.evaluate(() => { const b = document.getElementById('shareBox'); return {open: !!b && !b.hidden, img: !!document.querySelector('.shareimg'), save: !!document.getElementById('shareSave')}; });
  ok(r.open && r.img && r.save, `share card: dialog with image and save (${JSON.stringify(r)})`);
  await pg.keyboard.press('Escape'); ok(await pg.evaluate(() => document.getElementById('shareBox').hidden), 'share card: Escape closes');
  ok(errs.length === 0, `share card: no page errors${errs.length ? ': ' + errs.join(' | ') : ''}`); await ctx.close(); }
// team links: code round trip, Import accepts a link, an opened link asks before loading
{ console.log('\n== team links');
  const {pg, errs, ctx} = await open(1280);
  const r = await pg.evaluate(() => { const T = window.__PL, S = T.getS(); const code = T.teamCode(); const back = T.decodeTeam('https://x.test/#team=' + code);
    return {len: code.length, names: S.slots.filter(s => s.n).map(s => s.n).join(','), back: back && back.slots.map(s => s.n).join(','), bad: T.decodeTeam('hello world')}; });
  ok(r.len > 10 && r.len < 600 && r.back === r.names && r.bad === null, `team links: round trip (${r.len} chars)`);
  const code = await pg.evaluate(() => window.__PL.teamCode());
  await ctx.close();
  const c2 = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true}); const p2 = await c2.newPage(); const e2 = [];
  p2.on('pageerror', e => e2.push(e.message));
  await p2.addInitScript(() => { window.__PL_TEST = true; window.claude = {use: async () => null}; });
  await p2.goto('file://' + page + '#team=' + code); await p2.waitForTimeout(1500);
  ok(await p2.evaluate(() => !!document.getElementById('sharedBar')), 'team links: opened link shows the load banner');
  await p2.click('[data-sharedload]'); await p2.waitForTimeout(400);
  ok(await p2.evaluate(() => !document.getElementById('sharedBar') && document.querySelector('[data-pane="build"]').hidden === false), 'team links: Load it opens the team');
  ok(e2.length === 0, `team links: no page errors${e2.length ? ': ' + e2.join(' | ') : ''}`); await c2.close(); }
// Team Score can't be gamed: calibrated, anchored to real teams, no 100 for an odd six, no Mega stacking, no duplicates
{ console.log('\n== Team Score integrity');
  const {pg, errs, ctx} = await open(1280); await pg.waitForTimeout(300);
  const r = await pg.evaluate(() => { const P = window.__PL, S = P.getS(); S.format = 'doubles'; const M = P.META.model;
    const sc = ns => { S.slots = P.normSlots(ns.map(n => ({n, a: null, lock: false}))); const ms = P.members(); if (ms.length !== 6) return null; const wv = P.winVsField(ns, true); return wv ? P.teamScore({wv}).score : null; };
    const winners = P.META.events.events.map(e => e.top[0]).filter(t => t && t.place === 1).map(t => sc(t.mons.map(m => m.n))).filter(x => x != null).sort((a, b) => a - b);
    // a quick hill climb over the 40 best-rated legal Pokémon, from two seeds, swapping one slot at a time
    const pool = [...P.byName.values()].filter(p => P.rating(p).total >= 55).sort((a, b) => P.rating(b).total - P.rating(a).total).slice(0, 40).map(p => p.n);
    const legal = ns => { const bs = new Set(); let mg = 0; for (const n of ns) { const p = P.byName.get(n); if (!p || bs.has(p.b)) return false; bs.add(p.b); if (p.m) mg++; } return mg <= 2; };
    let best = 0; for (const seed of [pool.filter((n, i, a) => legal(a.slice(0, i + 1))).slice(0, 6), ['Sinistcha', 'Camerupt-Mega', 'Venusaur-Mega', 'Archaludon', 'Hydreigon', 'Basculegion-F']]) {
      let cur = seed.slice(); if (!legal(cur) || cur.length < 6) continue; let cs = sc(cur); for (let pass = 0; pass < 2; pass++) for (let i = 0; i < 6; i++) for (const n of pool) { if (cur.includes(n)) continue; const nx = cur.slice(); nx[i] = n; if (!legal(nx)) continue; const v = sc(nx); if (v != null && v > cs) { cur = nx; cs = v; } } best = Math.max(best, cs); }
    const two = ['Floette-Mega', 'Annihilape', 'Sinistcha', 'Raichu-Mega-Y', 'Milotic', 'Rillaboom'], four = ['Floette-Mega', 'Annihilape', 'Sinistcha', 'Raichu-Mega-Y', 'Charizard-Mega-Y', 'Gengar-Mega'];
    return {calib: M.calib, dist: !!(M.dist && M.dist.q && M.dist.q.length === 101), center: !!M.center, med: winners[winners.length >> 1], n: winners.length, best,
      gamed: sc(['Sinistcha', 'Camerupt-Mega', 'Venusaur-Mega', 'Archaludon', 'Hydreigon', 'Basculegion-F']), dup: sc(['Annihilape', 'Annihilape', 'Sinistcha', 'Milotic', 'Rillaboom', 'Kingambit']),
      megaStack: sc(four) <= Math.max(sc(two), sc(['Floette-Mega', 'Annihilape', 'Sinistcha', 'Raichu-Mega-Y', 'Kingambit', 'Incineroar'])) + 15 }; });
  // (the page stretches or shrinks the model's edges by this held-out slope, so it only has to be sane)
  ok(r.center && r.dist && r.calib > .6 && r.calib < 1.3, `model: centered builds, real-team spread, calibration ${r.calib}`);
  ok(r.med >= 55, `validity: recent event winners score above an average team (median ${r.med} of ${r.n}, popular sets)`);
  ok(r.best < 100, `can't be gamed: a hill-climbed six tops out at ${r.best}, below 100`);
  ok(r.gamed != null && r.gamed < 90, `the old 100-point six now scores ${r.gamed}`);
  ok(r.dup === null, 'duplicate species: no score');
  ok(r.megaStack, 'stacking Megas does not pay');
  ok(errs.length === 0, `Team Score: no page errors${errs.length ? ': ' + errs.join(' | ') : ''}`); await ctx.close(); }
// Team Score sense checks (Oct 27, from a real user team that scored 97): problems a player can see must cost points,
// an illegal team can't score, and odd low-evidence sixes can't beat what real event winners score.
{ console.log('\n== Team Score sense checks');
  const {pg, errs, ctx} = await open(1280); await pg.waitForTimeout(300);
  const USER97 = `Raichu @ Raichunite X\nAbility: Lightning Rod\nJolly Nature\n- Fake Out\n- Protect\n- Volt Tackle\n- Volt Switch\n\nSneasler @ Psychic Seed\nAbility: Unburden\nAdamant Nature\n- Close Combat\n- Dire Claw\n- Protect\n- Fake Out\n\nPrimarina @ Leftovers\nAbility: Liquid Voice\nModest Nature\n- Hyper Voice\n- Protect\n- Moonblast\n- Calm Mind\n\nCharizard @ Charizardite Y\nAbility: Blaze\nTimid Nature\n- Heat Wave\n- Protect\n- Weather Ball\n- Solar Beam\n\nFarigiraf @ Sitrus Berry\nAbility: Armor Tail\nBold Nature\n- Trick Room\n- Helping Hand\n- Psychic\n- Thunderbolt\n\nHydreigon @ Choice Scarf\nAbility: Levitate\nModest Nature\n- Dark Pulse\n- Draco Meteor\n- Earth Power\n- Snarl`;
  const r = await pg.evaluate(txt => { const P = window.__PL, S = P.getS(); S.format = 'doubles';
    const run = slots => { S.slots = P.normSlots(slots); const ms = P.members(); if (ms.length !== 6) return null; const wv = P.winVsField(ms.map(m => m.p.n), true, ms); if (!wv) return null; const ts = P.teamScore({wv}); const b = P.tsBreakdown(ms); return {s: ts.score, label: ts.label, illegal: !!ts.illegal, miss: wv.struct.miss, b}; };
    const sl = (ns, extra) => ns.map((n, i) => ({n, a: null, lock: false, ...((extra || {})[i] || {})}));
    // event winners with the sets they actually registered (items, moves, ability), like the user's own team
    const winners = P.META.events.events.map(e => e.top[0]).filter(t => t && t.place === 1).map(t => run(t.mons.map(m => ({n: m.n, a: m.a || null, lock: false, it: m.i ? {doubles: m.i} : undefined, mv: m.mv && m.mv.length ? {doubles: m.mv} : undefined})))).filter(Boolean).map(x => x.s).sort((a, b) => a - b), med = winners[winners.length >> 1];
    // the page's own import, with each held item put on its slot as the Team page stores it (the import keeps items once
    // fix/items lands; set here so this check doesn't depend on it)
    const u = P.parsePaste(txt), its = txt.split(/\n\s*\n/).map(b => (b.split('\n')[0].split(' @ ')[1] || '').trim());
    u.slots.forEach((s, i) => { const p = P.byName.get(s.n); if (its[i] && p && !p.m) s.it = {doubles: its[i]}; }); const user = run(u.slots);
    const tr = {0: {mv: {doubles: ['Trick Room', 'Psychic', 'Hyper Voice', 'Protect']}}};
    const trOne = run(sl(['Farigiraf', 'Incineroar', 'Sneasler', 'Garchomp', 'Charizard-Mega-Y', 'Whimsicott'].map(n => n === 'Whimsicott' ? 'Raichu-Mega-Y' : n), tr));
    const trOk = run(sl(['Farigiraf', 'Incineroar', 'Torkoal', 'Kingambit', 'Charizard-Mega-Y', 'Amoonguss'].filter(n => P.byName.has(n)).concat(['Ursaluna', 'Snorlax', 'Hatterene'].filter(n => P.byName.has(n))).slice(0, 6), tr));
    const dup = run(sl(['Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott'], {0: {it: {doubles: 'Sitrus Berry'}}, 1: {it: {doubles: 'Sitrus Berry'}}}));
    const dflt = run(sl(['Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott']));
    const niche = run(sl(['Annihilape', 'Kommo-o', 'Scrafty', 'Venusaur-Mega', 'Hydreigon', 'Charizard-Mega-Y']));
    return {med, n: winners.length, notes: u.notes, items: u.slots.map(s => s.it && s.it.doubles), user, trOne, trOk, dup, dflt, niche, dfltItems: P.resolveItems(P.members()).map(m => m.item)}; }, USER97);
  console.log('   winners median', r.med, '| user team', r.user && r.user.s, r.user && r.user.miss.join('; '), '| TR one slow', r.trOne && r.trOne.s, '| TR coherent', r.trOk && r.trOk.s, '| niche', r.niche && r.niche.s);
  ok(r.user && r.user.s < r.med, `user's 97 team now scores below the median event winner (${r.user && r.user.s} vs ${r.med})`);
  ok(r.user && r.user.miss.some(x => /Trick Room/.test(x)) && r.user.miss.some(x => /Psychic Seed/.test(x)), 'user team: Trick Room with one slow attacker and the dead Psychic Seed are deductions');
  ok(r.trOne && r.trOk && r.trOne.miss.some(x => /Trick Room/.test(x)) && !r.trOk.miss.some(x => /Trick Room/.test(x)), `TR coherence: one slow attacker is cut (${r.trOne && r.trOne.s}), a coherent TR team isn't (${r.trOk && r.trOk.s})`);
  ok(r.dup && r.dup.illegal && r.dup.s === 0, 'Item Clause: two chosen Sitrus Berries make the team illegal (score 0)');
  ok(r.dflt && !r.dflt.illegal && new Set(r.dfltItems.filter(Boolean)).size === r.dfltItems.filter(Boolean).length, 'default items never clash in the Team Score (each member gets a different item)');
  ok(r.niche && r.niche.s < r.med, `a low-evidence niche six scores below the median event winner (${r.niche && r.niche.s} vs ${r.med})`);
  ok(errs.length === 0, `sense checks: no page errors${errs.length ? ': ' + errs.join(' | ') : ''}`); await ctx.close(); }
// battle mode, cores, events, team search, calc both ways
{ console.log('\n== battle mode + cores + events');
  for (const width of [1280, 390]) { const {pg, errs, ctx} = await open(width);
    await pg.evaluate(() => { const S = window.__PL.getS(); S.opp = ['Incineroar', 'Rillaboom', 'Garchomp', 'Gengar', 'Sneasler', 'Kingambit']; });
    await go(pg, 'matchup'); await pg.waitForTimeout(600); if (width < 700) { for (const t of ['speed', 'dmg']) await pg.evaluate(t => { const s = document.querySelector('.bmgrid'); if (s) s.dataset.tab = 'all'; }, t); }
    const b = await pg.evaluate(() => ({picks: document.querySelectorAll('.bmpick').length, lead: document.querySelectorAll('.bmpick.lead').length, speed: document.querySelectorAll('.bmsr').length,
      cells: document.querySelectorAll('.bmdt td .bo').length, back: document.querySelectorAll('.bmdt td .bd').length, sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth}));
    ok(b.picks === 4 && b.lead === 2, `battle: bring 4, lead 2 (${width}px)`); ok(b.speed === 10, `battle: speed order has 10 (${b.speed})`);
    ok(b.cells === 24 && b.back === 24, `battle: damage both ways grid (${b.cells}/${b.back})`);
    if (width < 700) ok(b.sw <= b.w, 'battle: no sideways scroll on phone');
    await pg.evaluate(() => document.querySelector('[data-bms="tr"]').click()); await pg.waitForTimeout(200);
    ok(await pg.evaluate(() => { const v = [...document.querySelectorAll('.bmsv')].map(x => parseInt(x.textContent, 10)); return v.every((x, i) => !i || x >= v[i - 1]); }), 'battle: Trick Room sorts slowest first');
    // one log: the battle log starts from the plan's four and records them
    const lg = await pg.evaluate(() => ({on: document.querySelectorAll('#logForm .logpick.on').length, note: (document.querySelector('#logForm .logacts') || {}).textContent || '', old: document.querySelectorAll('[data-qlog]').length}));
    ok(lg.on === 4 && /from the plan/.test(lg.note) && lg.old === 0, `battle log: prefilled from the plan, one place to log (${lg.on})`);
    const n0 = await pg.evaluate(() => (window.__PL.getS().log || []).length); await pg.evaluate(() => document.querySelector('#logForm [data-logres="W"]').click()); await pg.waitForTimeout(200);
    ok(await pg.evaluate(n => { const L = window.__PL.getS().log; return L.length === n + 1 && L[L.length - 1].b.length === 4; }, n0), 'battle log: win saved with four');
    await go(pg, 'cores'); await pg.waitForTimeout(400);
    const c = await pg.evaluate(() => document.querySelectorAll('.corerow').length); ok(c >= 10, `cores: ${c} pairs`);
    await pg.evaluate(() => document.querySelector('[data-corekind="trios"]').click()); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => { const r = [...document.querySelectorAll(".corerow .corenames")]; return r.length >= 10 && r.every(x => x.textContent.split(" + ").length === 3); }), 'cores: trios list');
    await pg.evaluate(() => document.querySelector('[data-corekind="teams"]').click()); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => document.querySelectorAll('.corerow.six').length >= 10), 'cores: full teams list');
    await go(pg, 'top'); await pg.waitForTimeout(300); await pg.evaluate(() => document.querySelector('.teamsw [data-view="events"]').click()); await pg.waitForTimeout(400);
    const ev = await pg.evaluate(() => document.querySelectorAll('.evcard').length); ok(ev >= 10, `events: ${ev} events`);
    await pg.evaluate(() => document.querySelector('.evcard').click()); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => document.querySelectorAll('.evteam').length >= 4), 'events: standings open');
    await pg.evaluate(() => document.querySelector('#evOut [data-evsets]').click()); await pg.waitForTimeout(200);
    ok(await pg.evaluate(() => document.querySelectorAll('#evOut .evset').length === 6), 'events: sets shown');
    await go(pg, 'top'); await pg.waitForTimeout(300);
    await pg.fill('#tsIn', 'Choice Sc'); await pg.waitForTimeout(200);
    ok(await pg.evaluate(() => /Choice Scarf/.test((document.querySelector('.menu') || {}).innerText || '')), 'team search: suggests items');
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
    const ts = await pg.evaluate(() => ({n: document.querySelectorAll('#tsOut .evteam').length, hidden: document.getElementById('ttList').hidden})); ok(ts.n >= 3 && ts.hidden, `team search: ${ts.n} teams with Choice Scarf`);
    await go(pg, 'calc'); await pg.waitForTimeout(400);
    if (width < 700) { await pg.evaluate(() => scrollTo(0, 300)); await pg.waitForTimeout(300); const st = await pg.evaluate(() => { const x = document.getElementById('dcStick'); if (!x) return null; const r = x.getBoundingClientRect(); return {vis: getComputedStyle(x).opacity > .5 && r.top >= 0 && r.top < 120, txt: x.textContent}; });
      ok(st && st.vis && /%/.test(st.txt), 'calc: result pinned on phone'); await pg.evaluate(() => scrollTo(0, 0)); }
    // names fit: no cut-off Pokémon names on ratings tiles or team grids
    for (const [v, sel] of [['ratings', '.ltn'], ['top', '.tgn'], ['auto', '.tgn']]) { await go(pg, v); await pg.waitForTimeout(400);
      const cut = await pg.evaluate(sel => [...document.querySelectorAll(`[data-pane]:not([hidden]) ${sel}`)].filter(x => x.offsetParent && (x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 1)).map(x => x.textContent), sel);
      ok(cut.length === 0, `${v}: names fit (${width}px)${cut.length ? ': ' + cut.slice(0, 5).join(', ') : ''}`); } await pg.evaluate(() => document.querySelector('[data-dcdir="theirs"]').click()); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => /best hit on your team/i.test(document.getElementById('dcOut').innerText)), 'calc: their hits on you');
    ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`); await ctx.close(); } }
await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
