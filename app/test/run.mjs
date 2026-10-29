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
  // scouting report header (readiness, checks, legality), counters on Rankings, turn 1 plan in Matchup
  await go(pg, 'build'); await pg.waitForTimeout(400);
  const ts = await pg.evaluate(() => { const v = document.getElementById('verdict'); return v ? v.textContent : ''; });
  ok(/Ready for \d+% of the top 30 threats/i.test(ts) && /checks/.test(ts) && /Legal/.test(ts), 'team: scouting report shows readiness, checks and legality');
  await pg.waitForFunction(() => document.querySelectorAll('#thrCard .thrrow').length >= 20, null, {timeout: 8000}).catch(() => {});
  const tc = await pg.evaluate(() => { const c = document.getElementById('thrCard'), s = document.querySelector('#chfThr .chs'), rp = document.querySelector('[data-pane="report"]'); const tiles = document.querySelectorAll('#chTeam [data-chthr]').length; if (window.__CH) window.__CH.open(); const sh = document.getElementById('chScout'), n = sh && !sh.hidden ? sh.querySelectorAll('[data-chthr]').length : 0; if (window.__CH) window.__CH.close(); return {open: !!rp && !!c && rp.contains(c) && !!s && /unanswered/.test(s.textContent) && tiles === 30 && n === 30, head: !!c && /Threat preparation/i.test(c.textContent), rows: document.querySelectorAll('#thrCard .thrrow').length}; });
  ok(tc.open && tc.head && tc.rows >= 20, `team: scouting report is its own page (30 threat tiles, fold summaries, threat sheet), with threat preparation for the top threats (${tc.rows} threats)`);
  await go(pg, 'meta'); await pg.evaluate(() => document.querySelector('[data-src="ladder"]').click()); await pg.waitForTimeout(300);
  ok(await pg.evaluate(() => /Checks & counters/.test(document.getElementById('metaList').innerText)), 'meta/ladder: checks & counters shown');
  // Gauntlet: matchup prep against real teams, no win odds
  await go(pg, 'gauntlet'); await pg.waitForTimeout(2500);
  const g = await pg.evaluate(() => ({n: document.querySelectorAll('.gitem').length, prep: document.querySelectorAll('.gprep').length, odds: /win chance|% to win/i.test(document.getElementById('gauntOut').innerText)}));
  ok(g.n >= 10, `gauntlet: ${g.n} teams`); ok(g.prep >= 10 && !g.odds, `gauntlet: matchup prep for each team, no win odds (${g.prep})`);
  await pg.evaluate(() => document.querySelector('[data-gaunt]').click()); await pg.waitForTimeout(800);
  ok(await pg.evaluate(() => { const t = document.querySelector('.t1plan'); return !!t && /Turn order/.test(t.innerText); }), 'matchup: turn 1 plan shown');
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

// Found by the battle simulator, round 2 (Oct 28): each case checked against Pokémon Showdown's own engine
{ console.log('\n== simulator round 2');
  const {pg, ctx} = await open(1280);
  const r = await pg.evaluate(() => { const T = window.__PL, P = n => T.byName.get(n), M = n => T.mvByName.get(n), side = (n, role, o) => ({p: P(n), ...T.sideDefaults(P(n), role), ...(o || {})});
    const d = (a, df, mv, o) => T.damage({atk: a, def: df, move: M(mv), ...(o || {})});
    const ind = side('Indeedee', 'atk', {ability: 'Psychic Surge'}), pel = side('Pelipper', 'def', {ability: 'Drizzle'});
    const lead = (n, ab, spe, nat) => ({p: P(n), ability: ab, _spe: spe, _nat: nat});
    const spOf = x => T.calcStat ? 0 : 0;
    // Mega Charizard Y (base Charizard 100) vs Mega Froslass (base Froslass 110): the faster pre-Mega Froslass evolves first,
    // Charizard's Drought comes last and stays
    const megaF = T.turnOneField([{p: P('Charizard-Mega-Y')}, {p: P('Froslass-Mega')}], x => x.p.st[5]);
    const c9 = T.turnOneField([{p: P('Torkoal'), ability: 'Drought'}, {p: P('Altaria'), ability: 'Cloud Nine'}], x => x.p.st[5]);
    const tr = T.turnOneField([{p: P('Pelipper'), ability: 'Drizzle'}, {p: P('Meowstic-F-Mega')}], x => x.p.st[5]);
    const rilla = side('Rillaboom', 'atk', {ability: 'Grassy Surge'}), def = side('Incineroar', 'def');
    return {
      // Expanding Force in Psychic Terrain: spread cut with two foes, full power when only one is left
      ef2: d(ind, pel, 'Expanding Force', {terrain: 'psychic'}).max, ef1: d(ind, pel, 'Expanding Force', {terrain: 'psychic', oneFoe: true}).max,
      megaW: megaF.weather, c9: [c9.weather, c9.wx, c9.negated], traced: tr.traced,
      items: ['Chopple Berry', 'Grassy Seeds', 'expertbelt', 'salamencite', 'Venosaurite', 'Life Orb', 'No Item'].map(T.canonItem),
      // an Air Balloon holder floats: no Grassy Terrain boost on its own Grass move; Iron Ball keeps it grounded
      grass: [d({...rilla, item: 'Iron Ball'}, def, 'Wood Hammer', {terrain: 'grassy'}).max, d({...rilla, item: 'Air Balloon'}, def, 'Wood Hammer', {terrain: 'grassy'}).max, d({...rilla, item: 'Air Balloon'}, def, 'Wood Hammer').max] }; });
  ok(r.ef1 > r.ef2, `Expanding Force at full power when only one foe is left (${r.ef2} → ${r.ef1})`);
  ok(r.megaW === 'sun', `Megas evolve in pre-Mega Speed order: Mega Froslass's snow first, Mega Charizard Y's sun stays (${r.megaW})`);
  ok(r.c9[0] === 'sun' && r.c9[1] === '' && r.c9[2] === true, 'Cloud Nine on the field cancels the weather\'s effects (still set, no effect)');
  ok(r.traced === true, 'a Trace lead (Mega Meowstic) next to a weather setter flags the field as uncertain');
  ok(r.items.join('|') === 'Chople Berry|Grassy Seed|Expert Belt|Salamencite|Venusaurite|Life Orb|No Item', `hand-typed sheet items match the real item (${r.items.join(', ')})`);
  ok(r.grass[1] === r.grass[2] && r.grass[0] > r.grass[1], `Air Balloon holder gets no terrain boost; an Iron Ball holder does (${r.grass.join(' / ')})`);
  await ctx.close(); }

// Found in 20,000 real Showdown battles (Oct 28)
{ console.log('\n== real battles');
  const {pg, ctx} = await open(1280);
  const r = await pg.evaluate(() => { const T = window.__PL, P = n => T.byName.get(n), M = n => T.mvByName.get(n), side = (n, role, o) => ({p: P(n), ...T.sideDefaults(P(n), role), ...(o || {})});
    const d = (a, df, o) => T.damage({atk: a, def: df, move: M('Knock Off'), ...(o || {})}).max;
    const ttar = side('Tyranitar', 'atk'), gol = n => side('Golisopod-Mega', 'def', {item: n}), inc = n => side('Incineroar', 'def', {item: n});
    // a Mega Stone can't be knocked off its own Pokémon, so Knock Off gets no 1.5× boost; any other item still gives it
    return {mega: d(ttar, gol('Golisopite')), megaNone: d(ttar, gol('')), other: d(ttar, inc('Sitrus Berry')), otherNone: d(ttar, inc('')),
      stoneOnOther: d(ttar, inc('Golisopite'))}; });
  ok(r.mega === r.megaNone && r.other > r.otherNone && r.stoneOnOther > r.otherNone, `Knock Off: no boost against a Mega Stone on its own Pokémon, boost otherwise (${r.mega}/${r.megaNone}, ${r.other}/${r.otherNone}, ${r.stoneOnOther})`);
  await ctx.close(); }
// Found by the stress test (Oct 28): each against the game's rules as Showdown implements them
{ console.log('\n== stress test');
  const {pg, ctx} = await open(1280);
  const r = await pg.evaluate(() => { const T = window.__PL, P = n => T.byName.get(n), M = n => T.mvByName.get(n), side = (n, role, o) => ({p: P(n), ...T.sideDefaults(P(n), role), ...(o || {})});
    const d = (a, df, mv) => T.damage({atk: a, def: df, move: M(mv)}).max;
    // the game's speed order: stage first, then Scarf/weather/Tailwind chained, then paralysis
    const pr = x => (x % 1 > .5 ? Math.ceil(x) : Math.floor(x)); let spdBad = 0;
    for (let v = 20; v <= 400; v++) for (const sc of [0, 1]) for (const tw of [0, 1]) for (const par of [0, 1]) { let s = Math.floor(v * 2 / 3), m = 4096;
      for (const x of [sc ? 6144 : 4096, tw ? 8192 : 4096]) if (x !== 4096) m = (m * x + 2048) >> 12; s = Math.max(1, pr(s * m / 4096)); if (par) s = Math.floor(s / 2);
      if (T.spdCalc(v, !!sc, '', '', {tw: !!tw, icy: true, par: !!par}) !== s) spdBad++;
      // Unburden ×2 sits in the same chain, before paralysis halves it
      if (!sc && T.spdCalc(v, false, 'Unburden', '', {tw: !!tw, par: !!par, unb: true}) !== Math.floor(v * (tw ? 4 : 2) / (par ? 2 : 1))) spdBad++; }
    const A = n => ({...M(n)});
    return {
      // an Iron Ball holder is grounded: Ground moves hit a Flying type or a Levitate user
      ironFly: d(side('Garchomp', 'atk'), side('Corviknight', 'def', {item: 'Iron Ball'}), 'Earthquake'), ironLev: d(side('Garchomp', 'atk'), side('Gengar', 'def', {ability: 'Levitate', item: 'Iron Ball'}), 'Earthquake'),
      fly: d(side('Garchomp', 'atk'), side('Corviknight', 'def', {item: ''}), 'Earthquake'), spdBad,
      // sure-hit moves ignore accuracy drops; one-hit KO moves ignore accuracy boosts
      sure: [T.moveAcc(M('Aerial Ace'), 'Hustle', '', null, ''), T.moveAcc(M('Aura Sphere'), '', 'sand', {ability: 'Sand Veil', item: 'Bright Powder'}, '')],
      // a Mega holds its Mega Stone, so its Acrobatics isn't doubled; a Pokémon with no item gets double power
      acro: [d(side('Hawlucha-Mega', 'atk', {item: ''}), side('Incineroar', 'def'), 'Acrobatics'), d(side('Hawlucha', 'atk', {item: ''}), side('Incineroar', 'def'), 'Acrobatics'), d(side('Hawlucha', 'atk', {item: 'Sitrus Berry'}), side('Incineroar', 'def'), 'Acrobatics')],
      // Ripen doubles a resist berry: Flapple's Tanga Berry takes Megahorn to a quarter (Smogon's calc agrees)
      ripen: [d(side('Heracross', 'atk'), side('Flapple', 'def', {ability: 'Ripen', item: 'Tanga Berry'}), 'Megahorn'), d(side('Heracross', 'atk'), side('Flapple', 'def', {ability: 'Hustle', item: 'Tanga Berry'}), 'Megahorn')],
      // Prankster Taunt fails into Armor Tail (Farigiraf) and into Dark types (Grimmsnarl); without those it works
      taunt: (() => { const W = {n: 'Whimsicott', ability: 'Prankster', moves: ['Taunt', 'Tailwind', 'Moonblast', 'Protect']}, tv = (t) => { const r = T.THR.teamVs([W], t); return [...r.solid, ...r.soft].some(x => /Taunt/.test(x)); };
        return [tv({n: 'Farigiraf', ability: 'Armor Tail', moves: ['Trick Room', 'Psychic', 'Helping Hand', 'Protect']}), tv({n: 'Farigiraf', ability: 'Cud Chew', moves: ['Trick Room', 'Psychic', 'Helping Hand', 'Protect']}),
          tv({n: 'Grimmsnarl', ability: 'Prankster', moves: ['Reflect', 'Light Screen', 'Spirit Break', 'Thunder Wave']})]; })(),
      hustle: T.moveAcc(M('Rock Slide'), 'Hustle', '', null, ''), ohko: M('Sheer Cold') ? T.moveAcc(M('Sheer Cold'), 'Compound Eyes', '', null, 'Wide Lens', ['Ice']) : 30 }; });
  ok(r.ironFly > 0 && r.ironLev > 0 && r.fly === 0, `Iron Ball grounds the holder: Earthquake hits Flying and Levitate holders (${r.ironFly}, ${r.ironLev}; without it ${r.fly})`);
  ok(r.spdBad === 0, `speed tiers apply a −1 stage before Scarf/Tailwind and paralysis after, as the game does (${r.spdBad} off)`);
  ok(r.sure.every(x => x === 100) && r.hustle === 72, `sure-hit moves can't be made to miss; Hustle still cuts others (${r.sure.join('/')}, Rock Slide ${r.hustle})`);
  ok(r.ohko === 30, `one-hit KO moves ignore Compound Eyes and Wide Lens (${r.ohko})`);
  ok(r.taunt[0] === false && r.taunt[1] === true && r.taunt[2] === false, `Prankster Taunt isn't an answer into Armor Tail or a Dark type (${r.taunt.join('/')})`);
  ok(r.ripen[0] > 0 && Math.abs(r.ripen[0] * 2 - r.ripen[1]) <= 2, `Ripen doubles a resist berry (${r.ripen.join(' vs ')})`);
  ok(r.acro[1] > r.acro[2] * 1.8 && r.acro[0] < r.acro[1] * 1.3, `Acrobatics: double power with no item, not for a Mega holding its stone (${r.acro.join(' / ')})`);
  await ctx.close(); }

// Scouting report, approved Oct 28: your own weather/terrain is a choice (you bring 4 of 6), and adding a Pokémon never makes
// any threat's verdict or the readiness score worse
{ console.log('\n== own field + bring 4');
  const {pg, ctx} = await open(1280);
  const r = await pg.evaluate(() => { const H = window.__PL.THR, five = [{n: 'Staraptor'}, {n: 'Emolga'}, {n: 'Garchomp-Mega-Z'}, {n: 'Dragonite-Mega'}, {n: 'Delphox-Mega'}], six = [...five, {n: 'Pelipper'}];
    const g5 = H.teamVs(five, {n: 'Gholdengo', top: true}), g6 = H.teamVs(six, {n: 'Gholdengo', top: true});
    const bas = H.teamVs([{n: 'Basculegion', ability: 'Swift Swim'}, {n: 'Pelipper'}], {n: 'Floette-Mega', top: true});
    const pel = H.teamVs([{n: 'Pelipper'}, {n: 'Kingambit'}, {n: 'Incineroar'}], {n: 'Charizard-Mega-Y'});
    // a small fixed property run: each team, then each team with one more Pokémon in a random slot
    const pool = ['Incineroar', 'Rillaboom', 'Pelipper', 'Torkoal', 'Kingambit', 'Sneasler', 'Farigiraf', 'Gholdengo', 'Charizard-Mega-Y', 'Basculegion', 'Archaludon', 'Whimsicott', 'Tyranitar', 'Excadrill', 'Venusaur', 'Indeedee-F', 'Garchomp', 'Sinistcha'];
    let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, pick = a => a[Math.floor(rnd() * a.length)];
    let pairs = 0, drops = [];
    for (let i = 0; i < 8; i++) { const n = 2 + (i % 4), base = []; while (base.length < n) { const x = pick(pool); if (!base.includes(x)) base.push(x); }
      let add; do add = pick(pool); while (base.includes(add)); const big = [...base]; big.splice(Math.floor(rnd() * (n + 1)), 0, add);
      const a = H.report(base.map(n => ({n}))), b = H.report(big.map(n => ({n})));
      if (b.score < a.score) drops.push(`${base.join('/')} +${add}: readiness ${a.score} -> ${b.score}`);
      for (let k = 0; k < a.rows.length; k++) { pairs++; if (b.rows[k].level < a.rows[k].level) drops.push(`${base.join('/')} +${add}: ${a.rows[k].t.n} ${a.rows[k].label} -> ${b.rows[k].label}`); } }
    return {g5: g5.level, g6: g6.level, g6why: g6.solid.join(' | '), basSolid: bas.solid.some(x => /Basculegion/.test(x)), basSoft: bas.soft.filter(x => /Basculegion/.test(x)).join(' | '),
      pelSolid: pel.solid.filter(x => /Pelipper/.test(x)).join(' | '), pairs, drops}; });
  ok(r.g6 >= r.g5 && /Delphox[^|]*only if your rain isn't up/.test(r.g6why), `adding Pelipper keeps Mega Delphox's Fire answer to Gholdengo, marked "only if your rain isn't up" (${r.g5} -> ${r.g6})`);
  ok(!r.basSolid && /needs your rain/.test(r.basSoft), `an answer that needs a teammate's rain counts as soft, with the condition (${r.basSoft})`);
  ok(r.pelSolid && !/needs your|isn't up/.test(r.pelSolid), `Pelipper's own rain is always up while it's out, so its answer is not conditional (${r.pelSolid})`);
  ok(r.drops.length === 0 && r.pairs >= 200, `adding a Pokémon never lowers a threat's verdict or readiness (${r.pairs} threat checks${r.drops.length ? ': ' + r.drops.slice(0, 2).join('; ') : ''})`);
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
// Ratings mean proven strength: staples on top, rare picks can't take #1 (Oct 27 v3)
{ console.log('\n== ratings');
  const {pg, errs, ctx} = await open(1280); await pg.waitForTimeout(300);
  const r = await pg.evaluate(() => { const P = window.__PL, R = n => P.rating(P.byName.get(n)), all = [...P.byName.values()].map(p => ({n: p.n, r: P.rating(p)})).filter(x => x.r.total).sort((a, b) => b.r.total - a.r.total);
    const use = x => x.r.tc ? x.r.tc.field : x.r.usage; const top10 = all.slice(0, 10);
    return {zard: R('Charizard-Mega-Y').total, ann: R('Annihilape').total, kom: R('Kommo-o').total, first: all[0].n, firstUse: use(all[0]), minTop10Use: Math.min(...top10.map(use)),
      staplesS_A: ['Charizard-Mega-Y', 'Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Floette-Mega', 'Raichu-Mega-Y', 'Gholdengo', 'Salamence-Mega', 'Arcanine-Hisui'].filter(n => R(n).total < 70) }; });
  ok(r.zard > r.ann, `Mega Charizard Y (${r.zard}) outranks Annihilape (${r.ann})`);
  ok(r.firstUse >= 10, `#1 (${r.first}) is on ${r.firstUse}% of teams (10%+ needed)`);
  ok(r.minTop10Use >= 3, `every top-10 Pokémon is on 3%+ of teams (lowest ${r.minTop10Use}%)`);
  ok(!r.staplesS_A.length, `format staples sit in S or A${r.staplesS_A.length ? ': not ' + r.staplesS_A.join(', ') : ''}`);
  ok(errs.length === 0, `ratings: no page errors${errs.length ? ': ' + errs.join(' | ') : ''}`); await ctx.close(); }
// Threat preparation (Oct 28): facts, not predictions. Real event winners read as well prepared, the user's team that once
// scored 97 shows its real gaps, problems a player can see show up as checks and items, plans fix them, and nothing on the
// site shows a win chance.
{ console.log('\n== Threat preparation');
  const {pg, errs, ctx} = await open(1280); await pg.waitForTimeout(300);
  const USER97 = `Raichu @ Raichunite X\nAbility: Lightning Rod\nLevel: 50\nEVs: 2 HP / 32 Atk / 32 Spe\nJolly Nature\n- Fake Out\n- Protect\n- Volt Tackle\n- Volt Switch\n\nSneasler @ Psychic Seed\nAbility: Unburden\nLevel: 50\nEVs: 2 HP / 32 Atk / 32 Spe\nAdamant Nature\n- Close Combat\n- Dire Claw\n- Protect\n- Fake Out\n\nPrimarina @ Leftovers\nAbility: Liquid Voice\nLevel: 50\nEVs: 32 HP / 32 SpA / 2 SpD\nModest Nature\n- Hyper Voice\n- Protect\n- Moonblast\n- Calm Mind\n\nCharizard @ Charizardite Y\nAbility: Blaze\nLevel: 50\nEVs: 2 HP / 32 SpA / 32 Spe\nTimid Nature\n- Heat Wave\n- Protect\n- Weather Ball\n- Solar Beam\n\nFarigiraf @ Sitrus Berry\nAbility: Armor Tail\nLevel: 50\nEVs: 27 HP / 20 Def / 19 SpD\nBold Nature\n- Trick Room\n- Helping Hand\n- Psychic\n- Thunderbolt\n\nHydreigon @ Choice Scarf\nAbility: Levitate\nLevel: 50\nEVs: 2 HP / 32 SpA / 32 Spe\nModest Nature\n- Dark Pulse\n- Draco Meteor\n- Earth Power\n- Snarl`;
  const r = await pg.evaluate(txt => { const P = window.__PL, S = P.getS(); S.format = 'doubles';
    const load = slots => { S.slots = P.normSlots(slots); return P.members(); };
    const sl = (ns, extra) => ns.map((n, i) => ({n, a: null, lock: false, ...((extra || {})[i] || {})}));
    // event winners with the sets they registered
    const wins = P.META.events.events.map(e => e.top[0]).filter(t => t && t.place === 1 && t.mons.length === 6 && t.mons.every(m => P.byName.get(m.n)))
      .map(t => P.tsOf(load(t.mons.map(m => ({n: m.n, a: m.a || null, lock: false, it: m.i ? {doubles: m.i} : undefined, mv: m.mv && m.mv.length ? {doubles: m.mv} : undefined}))))).filter(x => x != null).sort((a, b) => a - b);
    const med = wins[wins.length >> 1];
    const u = P.parsePaste(txt); const ums = load(u.slots); const urep = P.prepOf(ums), uts = P.tsOf(ums);
    const ip = P.itemProblems(ums).map(x => x.k + ':' + x.item), gp = P.gamePlan(ums.map(m => ({...m, _mv: m.moves}))), sp = gp.rows.find(x => x.k === 'speed');
    const ck = P.proChecks(ums, true), ckSpeed = ck.items.find(x => x.k === 'speed');
    const plans = P.planFixes(ums, [...P.byName.values()], true) || [], planTeams = [...plans, ...(plans.more || [])].map(pl => P.assignItems(pl.team));
    const planBad = planTeams.filter(t => P.itemProblems(t).some(x => x.k === 'clause') || new Set(t.map(m => m.p.b)).size < t.length).length;
    const planFix = [...plans].some(pl => P.itemProblems(P.assignItems(pl.team)).length < P.itemProblems(ums).length);
    const dup = P.tsOf(load(sl(['Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott'], {0: {it: {doubles: 'Sitrus Berry'}}, 1: {it: {doubles: 'Sitrus Berry'}}})));
    const dms = load(sl(['Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott'])), dItems = dms.map(m => m.item).filter(Boolean);
    const nms = load(sl(['Annihilape', 'Kommo-o', 'Scrafty', 'Venusaur-Mega', 'Hydreigon', 'Charizard-Mega-Y'])), niche = P.tsOf(nms);
    let nDbg = ''; try { const ck = P.proChecks(nms, true); nDbg = 'checks ' + ck.items.filter(x => !x.skip).map(x => (x.ok ? '+' : '-') + x.k).join(' '); } catch (e) { nDbg = 'dbg ' + e.message; }
    const mir = (() => { const ms = load(sl(['Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott'])); const g = P.gauntletPrep(ms, ms.map(m => m.p.n)); return [g.yN, g.tN]; })();
    return {med, n: wins.length, items: u.slots.map(s => s.it && s.it.doubles), uts, un: urep.rows.filter(x => x.level === 0).map(x => x.t.n), ip, spSt: sp && sp.st, ckSpeedOk: ckSpeed && ckSpeed.ok, planBad, planFix, nPlans: planTeams.length, dup, dItems, niche, nDbg, mir}; }, USER97);
  console.log('   NICHE', r.nDbg);
  console.log('   winners median', r.med, `(${r.n})`, '| user team', r.uts, 'unanswered', r.un.join(', '), '| items', r.ip.join(', '), '| niche', r.niche, '| mirror', r.mir.join('/'));
  ok(r.n >= 20 && r.med >= 75, `real event winners are well prepared (median ${r.med}% of ${r.n})`);
  ok(r.uts != null && r.uts < r.med, `user's old 97 team is less prepared than the median winner (${r.uts}% vs ${r.med}%)`);
  // Oct 28: 1+ (Grimmsnarl is now shaky for this team: Fake Out and 2HKOs count as partial answers to screens)
  ok(r.un.length >= 1, `user team: unanswered threats are named (${r.un.join(', ')})`);
  ok(r.items[1] === 'Psychic Seed' && r.items[2] === 'Leftovers' && r.items[4] === 'Sitrus Berry' && r.items[5] === 'Choice Scarf', `import keeps the pasted items (${r.items.join(', ')})`);
  ok(r.ip.some(x => /dead:Psychic Seed/.test(x)) && r.ip.some(x => /scarftr:Choice Scarf/.test(x)), `user team: dead Psychic Seed and Choice Scarf under Trick Room are flagged (${r.ip.join(', ')})`);
  ok(r.spSt === 'part' && r.ckSpeedOk === false, `user team: Trick Room with one slow attacker is only partial speed control, not a pass (${r.spSt})`);
  ok(r.planFix, 'user team: a fix plan fixes an item problem');
  ok(r.nPlans > 0 && r.planBad === 0, `no plan leaves a duplicate item or species (${r.nPlans} plans)`);
  ok(r.dup === 0, 'Item Clause: two chosen Sitrus Berries read as an illegal team (0)');
  ok(new Set(r.dItems).size === r.dItems.length, 'default items never clash (each member gets a different item)');
  // Readiness only says how its six fare 1-on-1 against the top threats; a niche six can look fine there. The report must
  // still flag what's wrong with it: no speed control and a stacked weakness.
  ok(r.niche != null && /-speed/.test(r.nDbg) && /-(stack|w3)/.test(r.nDbg), `a niche six is flagged by the checklist (${r.nDbg}; ready ${r.niche}% vs winners ${r.med}%)`);
  ok(r.mir[0] === r.mir[1], `gauntlet mirror reads the same both ways (${r.mir.join(' / ')})`);
  // no win prediction anywhere on the site
  const VIEWS2 = ['home', 'build', 'auto', 'matchup', 'speed', 'calc', 'gauntlet', 'coverage', 'ratings', 'meta', 'cores', 'top', 'events', 'sets', 'teams'];
  const hits = []; for (const v of VIEWS2) { await go(pg, v); await pg.waitForTimeout(v === 'gauntlet' || v === 'coverage' ? 2500 : 500);
    const tx = await pg.evaluate(v => document.querySelector(`[data-pane="${v}"]`).innerText, v); const m = tx.match(/win chance|chance to win|% to win|win %|Team Score/i); if (m) hits.push(v + ': ' + m[0]); }
  ok(!hits.length, `no win prediction or Team Score shown anywhere${hits.length ? ': ' + hits.join(' | ') : ''}`);
  ok(errs.length === 0, `threat preparation: no page errors${errs.length ? ': ' + errs.join(' | ') : ''}`); await ctx.close(); }// battle mode, cores, events, team search, calc both ways
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
// Found by the stress test (Oct 28): pasted and linked teams follow the game's rules; corrupt data never shows NaN
{ console.log('\n== stress test');
  const {pg, errs, ctx} = await open(1280); await pg.waitForTimeout(800);
  const r = await pg.evaluate(() => { const T = window.__PL, b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const link = T.decodeTeam('#team=' + b64(JSON.stringify({v: 1, s: [['Incineroar', 'Huge Power', 0, 'Choice Band', 'Careful:32/32/32/0/0/0'], ['Incineroar'], ['Garchomp', '', 0, 'Charizardite Y'], ['Sneasler', '', 0, '<img src=x>'], ['Kingambit', 'Defiant', 0, 'Black Glasses', 'Adamant:32/32/2/0/0/0']]})));
    const ns = T.normSlots(link.slots);
    const fem = T.parsePaste('Meowstic-F @ Meowsticite\nAbility: Prankster\n- Expanding Force\n- Protect');
    const S0 = T.getS(); const keep = S0.slots; S0.slots = T.normSlots(fem.slots); const ex = T.exportPaste(); S0.slots = keep;
    const male = T.parsePaste('Meowstic @ Meowsticite\nAbility: Prankster\n- Protect');
    const over = T.parsePaste('Garchomp @ Life Orb\nAbility: Rough Skin\nEVs: 32 HP / 32 Atk / 32 Def / 32 SpA / 32 SpD / 32 Spe\nJolly Nature\n- Earthquake');
    const R = T.META.results, bad = JSON.parse(JSON.stringify(R)), k = Object.keys(bad.mons);
    bad.mons[k[0]] = [null, 'x']; bad.mons[k[1]] = ['abc', .5]; bad.pairs[Object.keys(bad.pairs)[0]] = [{}, 99999]; bad.tc.rows[Object.keys(bad.tc.rows)[0]] = ['x', 1, 2, 3, 4, 5];
    const c = T.cleanResults(bad);
    return {names: link.slots.map(s => s.n), ab: link.slots[0].a, its: link.slots.map(s => s.it && s.it.doubles || ''), sps: ns.filter(s => s.sp).map(s => s.n),
      fem: fem.slots.map(s => s.n), femEx: ex.split('\n')[0], male: male.slots.map(s => s.n), over: [!!(over.slots[0] && over.slots[0].sp), over.notes.join(' ')],
      clean: !!c && !(k[0] in c.mons) && !(k[1] in c.mons) && Object.values(c.mons).every(x => Number.isFinite(x[0]) && Number.isFinite(x[1])) && Object.values(c.tc.rows).every(x => x.every(Number.isFinite)) && Object.keys(c.mons).length === k.length - 2}; });
  ok(r.names.join() === 'Incineroar,Garchomp,Sneasler,Kingambit', `team link: one of each species (${r.names.join(', ')})`);
  ok(r.ab === null, 'team link: an ability the Pokémon cannot have is dropped');
  ok(r.its.join() === ',,,Black Glasses', `team link: only Champions items, no Mega Stone on the wrong Pokémon (${r.its.join(' / ')})`);
  ok(r.sps.join() === 'Kingambit', 'team link: stat points over the 66 total are dropped');
  ok(r.fem.join() === 'Meowstic-F-Mega' && r.femEx === 'Meowstic-F @ Meowsticite', `paste: female Mega Meowstic imports and exports (${r.fem}, "${r.femEx}")`);
  ok(r.male.join() === 'Meowstic-M-Mega', 'paste: Meowstic with its stone becomes Mega Meowstic');
  ok(!r.over[0] && /66/.test(r.over[1]), 'paste: stat points over 66 in total are skipped with a note');
  ok(r.clean, 'corrupt results data: bad rows dropped, no NaN');
  ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`); await ctx.close(); }
// Loose ends from the stress test (Oct 28): team sheets without stat points, the item lists, Megas in the calc
// Bottom bar (Oct 28): Build sits dead centre (±1 px), labels visible, More reachable from the header
{ console.log('\n== bottom bar');
  for (const w of [375, 390, 430, 768, 1000]) { const {pg, errs, ctx} = await open(w); await pg.waitForTimeout(600);
    const r = await pg.evaluate(() => { const b = document.querySelector('.bnav [data-view="auto"]'), f = b && b.querySelector('.chfab'), rc = (f || b).getBoundingClientRect(), mb = document.getElementById('moreBtn');
      const labs = [...document.querySelectorAll('.bnav button')].filter(x => x.offsetParent).map(x => { const s = x.querySelector('span:not(.chfab)'); return s ? {t: s.textContent, fs: parseFloat(getComputedStyle(s).fontSize), v: s.offsetParent !== null} : null; });
      return {c: rc.left + rc.width / 2, vw: document.documentElement.clientWidth, n: labs.length, labs, more: !!(mb && mb.closest('.band') && mb.offsetParent)}; });
    ok(Math.abs(r.c - r.vw / 2) <= 1, `bottom bar ${w}px: Build centre ${r.c.toFixed(1)} vs ${r.vw / 2}`);
    ok(r.n === 5 && r.labs.every(l => l && l.v && l.fs >= 11), `bottom bar ${w}px: 5 items, every label visible at 11px+ (${r.labs.map(l => l ? l.t + ' ' + l.fs : '?').join(', ')})`);
    ok(r.more, `bottom bar ${w}px: More in the header`); await ctx.close(); } }// Archetypes (Oct 28): every guide card shows its key Pokémon (Trick Room and Tailwind had none)
{ console.log('\n== archetypes');
  const {pg, errs, ctx} = await open(390); await pg.waitForTimeout(800); await go(pg, 'arch'); await pg.waitForTimeout(800);
  const cards = await pg.evaluate(() => [...document.querySelectorAll('#guideOut details.guide')].map(d => ({n: (d.querySelector('.pt') || {}).textContent, s: d.querySelectorAll('.gkm .spr').length})));
  ok(cards.length >= 8 && cards.every(c => c.s >= 2), `archetypes: every card has key Pokémon sprites (${cards.map(c => c.n + ' ' + c.s).join(', ')})`);
  ok(errs.length === 0, `archetypes: no page errors${errs.length ? ': ' + errs.join(' | ') : ''}`); await ctx.close(); }{ console.log('\n== stress test loose ends');
  const {pg, errs, ctx} = await open(1280); await pg.waitForTimeout(800);
  const r = await pg.evaluate(() => { const T = window.__PL, S0 = T.getS(), keep = S0.slots;
    // a team sheet: nature, no EVs line
    const sheet = T.parsePaste('Garchomp @ Life Orb\nAbility: Rough Skin\nJolly Nature\n- Earthquake\n- Dragon Claw');
    const sl = sheet.slots[0];
    S0.slots = T.normSlots(sheet.slots); const m = T.members()[0], ex = T.exportPaste(), back = T.parsePaste(ex);
    S0.slots = T.normSlots(back.slots); const m2 = T.members()[0];
    const code = (() => { S0.slots = T.normSlots(sheet.slots); return T.teamCode(); })(), dl = T.decodeTeam(code); S0.slots = T.normSlots(dl.slots); const m3 = T.members()[0];
    // an explicit EVs line, even all zero, is kept exactly
    const zero = T.parsePaste('Garchomp @ Life Orb\nAbility: Rough Skin\nEVs: 0 HP\nJolly Nature\n- Earthquake'); S0.slots = T.normSlots(zero.slots); const mz = T.members()[0];
    // and it survives export + re-import (the export writes "EVs: 0 HP" instead of dropping the line)
    const zb = T.parsePaste(T.exportPaste()); S0.slots = T.normSlots(zb.slots); const mz2 = T.members()[0], zrt = !!(mz2.spread && !mz2.spread.assumed && mz2.spread.atk === 0 && mz2.spread.spe === 0);
    // a garbage EVs line counts as missing (assumed spread, the same before and after export + re-import)
    const gb = T.parsePaste('Whimsicott @ Focus Sash\nAbility: Prankster\nEVs: lots of speed\nTimid Nature\n- Tailwind\n- Moonblast'); S0.slots = T.normSlots(gb.slots); const g1 = T.members()[0];
    const gb2 = T.parsePaste(T.exportPaste()); S0.slots = T.normSlots(gb2.slots); const g2 = T.members()[0];
    const garb = [!!(g1.spread && g1.spread.assumed), g1.spread && [g1.spread.hp, g1.spread.spa, g1.spread.spe].join('/'), g2.spread && [g2.spread.hp, g2.spread.spa, g2.spread.spe].join('/')];
    // a Mega gets its fixed ability on the first import (the paste writes the base form's)
    const fl = T.parsePaste('Floette-Eternal @ Floettite\nAbility: Flower Veil\nModest Nature\n- Moonblast\n- Protect'); S0.slots = T.normSlots(fl.slots); const fl2 = T.parsePaste(T.exportPaste());
    const mega = [fl.slots[0] && fl.slots[0].n, fl.slots[0] && fl.slots[0].a, fl2.slots[0] && fl2.slots[0].a];
    S0.slots = keep;
    const reg = new Set(T.regmcItems), it = T.itTab();
    return {assumed: !!(sl.sp && sl.sp.doubles.assumed), note: sheet.notes.join(' '), mSp: m.spread && [m.spread.nat, m.spread.assumed, m.spread.spe, m.spread.atk],
      exEv: /EVs: /.test(ex), backSp: m2.spread && [m2.spread.nat, m2.spread.spe, m2.spread.atk], linkSp: m3.spread && [m3.spread.nat, !!m3.spread.assumed, m3.spread.spe],
      zero: mz.spread && [mz.spread.nat, mz.spread.hp + mz.spread.atk + mz.spread.def + mz.spread.spa + mz.spread.spd + mz.spread.spe, !!mz.spread.assumed, zrt],
      garb, mega, badCalc: T.calcItems.filter(x => x && !reg.has(x)), badFallback: it.fallback.filter(x => !reg.has(x)), past: ['Covert Cloak', 'Safety Goggles', 'Clear Amulet', 'Choice Band'].filter(x => T.pasteItemOK(x)), herb: T.pasteItemOK('White Herb')}; });
  ok(r.assumed && /most common spread/.test(r.note), `team sheet (nature, no EVs line): stat points assumed, with a note ("${r.note}")`);
  ok(r.mSp && r.mSp[0] === 'Jolly' && r.mSp[1] === true && r.mSp[2] + r.mSp[3] > 0, `team sheet: your nature on the most common spread, not 0 points (${r.mSp})`);
  ok(r.exEv && r.backSp && r.backSp[0] === 'Jolly' && r.backSp[1] === r.mSp[2] && r.backSp[2] === r.mSp[3], `team sheet: export writes the assumed spread and re-imports the same numbers (${r.backSp})`);
  ok(r.linkSp && r.linkSp[0] === 'Jolly' && r.linkSp[1] && r.linkSp[2] === r.mSp[2], `team sheet: a team link keeps the nature and the assumed spread (${r.linkSp})`);
  ok(r.zero && r.zero[0] === 'Jolly' && r.zero[1] === 0 && !r.zero[2] && r.zero[3], `an explicit EVs line (all zero) is kept exactly, also through export + re-import (${r.zero})`);
  ok(r.garb[0] && r.garb[1] && r.garb[1] === r.garb[2], `a garbage EVs line counts as missing: assumed spread, same after export + re-import (${r.garb})`);
  ok(/Mega/.test(r.mega[0] || '') && r.mega[1] && r.mega[1] === r.mega[2], `a pasted Mega gets its fixed ability on import, same after round trip (${r.mega})`);
  ok(!r.badCalc.length, `every calc item is legal in Reg M-C (${r.badCalc.join(', ') || 'all'})`);
  ok(!r.badFallback.length, `every fallback item is legal in Reg M-C (${r.badFallback.join(', ') || 'all'})`);
  ok(!r.past.length && r.herb, `items Champions doesn't have are refused on import (${r.past.join(', ') || 'none accepted'})`);
  // the calc shows a Mega's stone instead of "None"
  await go(pg, 'calc'); await pg.waitForTimeout(300);
  const c = await pg.evaluate(() => { const T = window.__PL; T.dc().a = 'Charizard-Mega-Y'; T.dc().d = 'Raichu-Mega-X'; T.renderCalc();
    const a = document.getElementById('dcAIt'), d = document.getElementById('dcDIt'); return [a && a.disabled, a && a.value, d && d.value]; });
  ok(c[0] && c[1] === 'Charizardite Y' && /Raichunite X/.test(c[2]), `calc: a Mega shows its Mega Stone, fixed (${c.join(' / ')})`);
  // the threat engine's duel cache never changes a result: 12 teams from the top threats, cache on vs off
  const eq = await pg.evaluate(() => { const H = window.__PL.THR, names = H.threatList().map(s => s.n), teams = [];
    for (let i = 0; i + 6 <= names.length && teams.length < 12; i += 2) teams.push(names.slice(i, i + 6).map(n => ({n, top: true})));
    const run = () => teams.map(t => JSON.stringify(H.brief(H.report(t))));
    H.noCache(true); const a = run(); H.noCache(false); const b = run(), b2 = run(); return {n: teams.length, same: a.every((x, i) => x === b[i] && x === b2[i])}; });
  ok(eq.n >= 10 && eq.same, `threat engine: cached duels give identical reports (${eq.n} teams)`);
  ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`); await ctx.close(); }
// Assumptions are labeled (Oct 28): an assumed spread is tagged on the team card and can be set in one tap; the calc tags a side
// whose points are assumed; the refresh button explains every failure
{ console.log('\n== assumptions labeled');
  const {pg, errs, ctx} = await open(1280); await pg.waitForTimeout(800);
  await pg.evaluate(() => { const T = window.__PL, S0 = T.getS(); window.__keep = S0.slots;
    S0.slots = T.normSlots(T.parsePaste('Garchomp @ Life Orb\nAbility: Rough Skin\nJolly Nature\n- Earthquake\n- Dragon Claw').slots); T.render(); });
  await go(pg, 'build'); await pg.waitForTimeout(400);
  const tag = await pg.evaluate(() => { const c = document.getElementById('slot0'); return c ? [...c.querySelectorAll('.asm')].map(x => x.textContent) : null; });
  ok(tag && tag.includes('assumed'), `team card: the team sheet's spread is tagged assumed (${tag})`);
  const clk = s => pg.evaluate(s => document.querySelector(s).click(), s), put = (s, v) => pg.evaluate(([s, v]) => { const e = document.querySelector(s); e.value = v; }, [s, v]);
  await clk('[data-spedit="0"]'); await put('#spv0', '40/0/0/0/0/32'); await clk('[data-spsave="0"]');
  const bad = await pg.evaluate(() => (document.getElementById('spmsg0') || {}).textContent || '');
  ok(/0-32/.test(bad), `spread editor refuses a stat over 32 ("${bad}")`);
  await put('#spv0', '2/32/0/0/0/32'); await put('#spn0', 'Adamant'); await clk('[data-spsave="0"]'); await pg.waitForTimeout(200);
  const set = await pg.evaluate(() => { const m = window.__PL.members()[0]; return m.spread && [m.spread.nat, m.spread.atk, m.spread.spe, !!m.spread.assumed, document.getElementById('slot0').querySelectorAll('.asm').length]; });
  ok(set && set[0] === 'Adamant' && set[1] === 32 && set[2] === 32 && !set[3], `spread editor: your spread is saved and used (${set})`);
  const ex = await pg.evaluate(() => window.__PL.exportPaste());
  ok(/EVs: 2 HP \/ 32 Atk \/ 32 Spe/.test(ex) && /Adamant Nature/.test(ex), 'spread editor: export writes your spread');
  await go(pg, 'calc'); await pg.waitForTimeout(300);
  const cal = await pg.evaluate(() => { const T = window.__PL; T.dc().a = 'Garchomp'; T.dc().d = 'Incineroar'; T.dc().inv = {}; T.renderCalc(); const h = [...document.querySelectorAll('#dcOut .dccol h3')].map(x => x.innerText); return h; });
  ok(cal.length === 2 && !/assumed|estimated/.test(cal[0]) && /assumed|estimated/.test(cal[1]), `calc: your spread untagged, theirs tagged (${cal.join(' | ')})`);
  const rf = await pg.evaluate(async () => { const T = window.__PL; const codes = ['not_granted', 'rate_limited', 'server_not_connected', 'tool_error', undefined];
    const txt = codes.map(c => T.refreshErrText(c ? {code: c} : new Error('x')));
    const a1 = await T.refreshArgs({describeTool: async () => ({inputSchema: {properties: {trigger_id: {}}}})}), a2 = await T.refreshArgs({describeTool: async () => { throw {code: 'not_granted'}; }}), a3 = await T.refreshArgs({});
    window.__PL.getS().slots = window.__keep; return {txt, keys: [a1, a2, a3].map(a => Object.keys(a).join())}; });
  ok(rf.txt.every(t => t && t.length > 10) && new Set(rf.txt).size >= 4, `refresh button: a plain message for each failure (${rf.txt.length})`);
  ok(rf.keys.every(k => k === 'trigger_id'), `refresh button: sends trigger_id with or without the connector's schema (${rf.keys})`);
  // Mold Breaker ignores the target's partner's Friend Guard (Showdown marks Friend Guard breakable; found by the simulator)
  const fg = await pg.evaluate(() => { const T = window.__PL, A = n => ({p: T.byName.get('Ampharos-Mega'), sp: 32, nat: 'Modest', ability: n, item: '', boost: 0}),
    D = {p: T.byName.get('Kingambit'), hpSp: 32, defSp: 0, spdSp: 2, nat: 'Adamant', ability: 'Defiant', item: '', boost: 0}, mv = T.mvByName.get('Thunderbolt');
    const r = (ab, fg) => T.damage({atk: A(ab), def: D, move: mv, fg}).max; return [r('Mold Breaker', false), r('Mold Breaker', true), r('Static', false), r('Static', true)]; });
  ok(fg[0] === fg[1] && fg[3] < fg[2], `Mold Breaker ignores Friend Guard; other abilities don't (${fg})`);
  ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`); await ctx.close(); }
await browser.close();
// items, suggestions and battle math (Oct 28 audit), on the same build
try { execFileSync('node', [APP + 'test/items.mjs'], {stdio: 'inherit'}); } catch (e) { fails++; console.log('  FAIL items/suggestions suite'); }
// stress-test cases (Oct 28): checklist, item problems, archetypes, legality, move names, Build me a team Megas, gem stability
try { execFileSync('node', [APP + '../experiments/stress-checks.mjs'], {stdio: 'inherit'}); } catch (e) { fails++; console.log('  FAIL stress checks suite'); }
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
