// Battle > Turn One follows the game's rules (Sim's design review #1, Nov 18): on 300 real tournament matchups (top-cut teams
// from out/ events, each against another), turn one never shows two Megas leading on one side, never plans a move that can KO
// your own partner, never lets a Pokémon act after it flinched (a 'Flinches' beat has no move of its own), never shows a Fake Out
// as 'Fake Out then <attack>' (that attack is from turn two on), and works out every matchup without an error.
// It could fail: the build before this fix planned Earthquake into its own Sneasler (161%) and 'Fake Out (if they have it), then
// Close Combat'. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-t1rules.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}}); await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#battle', {timeout: 90000}); await p.waitForTimeout(3500);
await p.evaluate(n => { globalThis.N_T1 = n; }, +process.env.N || 300); /* N=1000 for a wider sweep */
const st = await p.evaluate(() => window.__ev(`(() => { const teams = []; for (const e of META.events.events) for (const t of e.top || []) if (t.mons && t.mons.length === 6 && t.mons.every(m => byName.get(m.n))) teams.push(t.mons.map(m => m.n));
  const st = {n: 0, err: 0, errs: [], twoMega: [], allyKO: [], flinchActs: [], foThen: [], flinches: 0, myFlinchAct: [], noBeat: [], copyWrong: [], foGhost: [], copies: 0, theirDud: [], myLate: [], sureBad: [], tailwinds: 0, twLate: [], prioAtk: 0, prioBlocked: [], theirPrio: 0, theirPrioWrong: []}; const slots0 = JSON.stringify(S.slots), opp0 = JSON.stringify(S.opp);
  /* the sweep's pairs, plus real matchups a review found (rare cases a 300-matchup sweep may not reach), always run */
  const pairs = []; for (let i = 0; i < Math.min(teams.length, +(globalThis.N_T1 || 300)); i++) pairs.push([teams[i], teams[(i * 7 + 3) % teams.length]]);
  const EXTRA = [['Blaziken-Mega/Rillaboom/Kingambit/Lucario-Mega-Z/Dragonite/Basculegion', 'Floette-Mega/Whimsicott/Incineroar/Farigiraf/Aegislash/Garchomp'], /* Extreme Speed into a side with Farigiraf's Armor Tail */
    /* their Gale Wings Talonflame's Brave Bird / Dual Wingbeat (+1): no such case in the default sweep */
    ['Grimmsnarl/Metagross-Mega/Pelipper/Charizard-Mega-Y/Basculegion/Archaludon', 'Sneasler/Armarouge/Gardevoir-Mega/Indeedee-F/Kommo-o/Talonflame'],
    ['Charizard-Mega-Y/Pelipper/Archaludon/Venusaur/Grimmsnarl/Garchomp-Mega-Z', 'Garchomp/Talonflame/Ninetales-Alola/Floette-Mega/Basculegion/Kingambit'],
    ['Venusaur/Charizard-Mega-Y/Pelipper/Archaludon/Grimmsnarl/Garchomp', 'Sneasler/Armarouge/Gardevoir-Mega/Indeedee-F/Kommo-o/Talonflame']];
  for (const [a, c] of EXTRA) { const x = a.split('/'), y = c.split('/'); if (x.concat(y).every(n => byName.get(n))) pairs.push([x, y]); }
  for (const [me, th] of pairs) { const tag = me.join('/') + ' vs ' + th.join('/');
    S.slots = me.map(n => ({n, a: null, lock: false})); fixSlots(); S.opp = [...th];
    let T, L0; try { const mine = members(), theirs = oppTeam(), r = planMatchup(mine, theirs, true); L0 = r.lead.map(i => mine[i]); T = turnOneData(mine, theirs, r); } catch (e) { st.err++; if (st.errs.length < 3) st.errs.push(tag + ': ' + String(e.stack || e).slice(0, 200)); continue; }
    if (!T) continue; st.n++;
    if (T.opp.filter(x => x.p.m).length > 1 || T.leads.filter(x => x.p.m).length > 1) st.twoMega.push(tag);
    for (const bt of T.beats) { const a = (bt.why.match(/also hits your .*? up to (\\d+)%/) || [])[1]; if (a && +a >= 100) st.allyKO.push(tag + ': ' + bt.act);
      if (/^Fake Out/.test(bt.act) && /\\bthen\\b/.test(bt.why)) st.foThen.push(tag + ': ' + bt.why);
      if (bt.act === 'Flinches') { st.flinches++; if (!bt.flinch) st.flinchActs.push(tag); } }
    /* Nov 19 review: your own lead never shows 'Flinches' (their Fake Out is a guess), every lead has its beat (Home's plan board finds
       it by the original member), a base-form copy has the base form's types and Ability, and your Fake Out never aims at a Ghost
       without Scrappy */
    for (const bt of T.beats) if (bt.me && bt.act === 'Flinches') st.myFlinchAct.push(tag);
    for (const m of L0) if (!T.beats.find(x => x.me && (x.x === m || x.x._orig === m))) st.noBeat.push(tag + ': ' + m.p.n);
    for (const x of [...T.leads, ...T.opp]) if (x._orig) { st.copies++; const ab = abilityOf(x); if (JSON.stringify(x.types || x.p.t) !== JSON.stringify(x.p.t) || (ab && x.p.a && !x.p.a.includes(ab)) || x.mega) st.copyWrong.push(tag + ': ' + x.p.n + ' ' + ab); }
    /* second review, Nov 19: their Fake Out is planned only when it can work; yours never aims at a Pokémon that has already moved;
       a 'Flinches' (sure) needs your Fake Out user not to be at risk of flinching first */
    for (const bt of T.beats) { if (!bt.me && /^Fake Out has no effect/.test(bt.why)) st.theirDud.push(tag + ': ' + bt.x.d + ' ' + bt.act);
      if (bt.me && /^Fake Out /.test(bt.act) && /has already moved: no flinch/.test(bt.why)) st.myLate.push(tag + ': ' + bt.act);
      if (!bt.me && bt.flinch === 'sure') { const u = T.beats.find(y => y.me && y.act === 'Fake Out ' + bt.x.d); if (u && u.flinch === 'likely') st.sureBad.push(tag + ': ' + bt.x.d); } }
    /* third review, Nov 19: once a side's Tailwind is up, its partner moves at double Speed for the rest of turn one (Gen 9
       re-sorts the queue after each action; assumed for Champions): no slower Pokémon of the other side in the same bracket
       moves between the Tailwind and that partner. raw = the partner's own Speed (a doubled one is marked tw) */
    { const ti = T.beats.findIndex(y => y.act === 'Tailwind'); if (ti >= 0) { const side = T.beats[ti].me; st.tailwinds++;
      for (let j = ti + 1; j < T.beats.length; j++) { const bj = T.beats[j]; if (bj.me !== side) continue; const raw = bj.tw ? bj.speed / 2 : bj.speed;
        const k = T.beats.slice(ti + 1, j).find(y => y.me !== side && y.prio === bj.prio && y.speed < 2 * raw); if (k) st.twLate.push(tag + ': ' + bj.x.d + ' (' + 2 * raw + ') after ' + k.x.d + ' (' + k.speed + ')'); } } }
    /* third review: no priority attack is planned (either side) into a side with Armor Tail / Queenly Majesty / Dazzling (unless
       the user has Mold Breaker, Teravolt or Turboblaze), nor into a grounded target in Psychic Terrain: it would fail */
    for (const bt of T.beats) { const m = bt.act.match(/^(.+?) (?:into (.+)|\\(hits both\\))$/), mv = m && mvByName.get(m[1]); if (!mv || !mv.bp || m[1] === 'Fake Out') continue;
      if (movePrio(mv, abilityOf(bt.x), {terrain: T.terrain, grounded: grounded(bt.x)}) <= 0) continue; st.prioAtk++;
      const side = bt.me ? T.opp : T.leads, tg = m[2] ? side.filter(o => o.d === m[2]) : side;
      if ((!['Mold Breaker', 'Teravolt', 'Turboblaze'].includes(abilityOf(bt.x)) && side.some(y => ['Armor Tail', 'Queenly Majesty', 'Dazzling'].includes(abilityOf(y)))) || (T.terrain === 'psychic' && tg.some(t => grounded(t)))) st.prioBlocked.push(tag + ': ' + bt.x.d + ' ' + bt.act); }
    /* third review: their attack moves in its own priority bracket (Extreme Speed +2, Sucker Punch +1...), not always 0 */
    for (const bt of T.beats) { const m = !bt.me && bt.act.match(/^(.+?) into /), mv = m && mvByName.get(m[1]); if (!mv || m[1] === 'Fake Out') continue;
      const want = movePrio(mv, abilityOf(bt.x), {terrain: T.terrain, grounded: grounded(bt.x)}); if (want) st.theirPrio++; if (bt.prio !== want) st.theirPrioWrong.push(tag + ': ' + bt.x.d + ' ' + bt.act + ' at ' + bt.prio + ', should be ' + want); }
    for (const bt of T.beats) if (bt.me && /^Fake Out (.+)$/.test(bt.act)) { const t = [...T.opp].find(o => o.d === bt.act.slice(9)); if (t && (t.types || t.p.t).includes('Ghost') && abilityOf(bt.x) !== 'Scrappy') st.foGhost.push(tag + ': ' + bt.act); } }
  S.slots = JSON.parse(slots0); fixSlots(); S.opp = JSON.parse(opp0); return st; })()`));
await b.close();
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
ok(st.n >= 100, `turn one worked out for ${st.n} real matchups`);
ok(st.err === 0, `no errors (${st.err}${st.errs.length ? ': ' + st.errs.join(' | ') : ''})`);
ok(!st.twoMega.length, `one Mega per side among the leads (${st.twoMega.length} with two${st.twoMega.length ? ', e.g. ' + st.twoMega[0] : ''})`);
ok(!st.allyKO.length, `no planned move can KO your own partner (${st.allyKO.length}${st.allyKO.length ? ', e.g. ' + st.allyKO[0] : ''})`);
ok(!st.foThen.length, `no Fake Out carries a later attack in turn one (${st.foThen.length}${st.foThen.length ? ', e.g. ' + st.foThen[0] : ''})`);
ok(st.flinches > 0 && !st.flinchActs.length, `flinched Pokémon don't act (${st.flinches} flinches shown, ${st.flinchActs.length} unmarked)`);
ok(!st.myFlinchAct.length, `your own leads keep their planned move (a flinch from their Fake Out is only a note) (${st.myFlinchAct.length}${st.myFlinchAct.length ? ', e.g. ' + st.myFlinchAct[0] : ''})`);
ok(!st.noBeat.length, `every lead has its turn-one move, found by the original member as Home's plan board does (${st.noBeat.length}${st.noBeat.length ? ', e.g. ' + st.noBeat[0] : ''})`);
ok(st.copies > 0 && !st.copyWrong.length, `a Mega shown as its base form takes that form's types and Ability (${st.copies} copies, ${st.copyWrong.length} wrong${st.copyWrong.length ? ', e.g. ' + st.copyWrong[0] : ''})`);
ok(!st.foGhost.length, `your Fake Out never aims at a Ghost type (no effect) (${st.foGhost.length}${st.foGhost.length ? ', e.g. ' + st.foGhost[0] : ''})`);
ok(!st.theirDud.length, `their Fake Out is only planned when it can work on one of your leads (${st.theirDud.length}${st.theirDud.length ? ', e.g. ' + st.theirDud[0] : ''})`);
ok(!st.myLate.length, `your Fake Out never aims at a Pokémon that has already moved (${st.myLate.length}${st.myLate.length ? ', e.g. ' + st.myLate[0] : ''})`);
ok(!st.sureBad.length, `a sure flinch never comes from a Fake Out user that may itself be flinched first (${st.sureBad.length}${st.sureBad.length ? ', e.g. ' + st.sureBad[0] : ''})`);
ok(st.tailwinds > 0 && !st.twLate.length, `after a Tailwind, its partner moves at double Speed this turn (${st.tailwinds} Tailwinds, ${st.twLate.length} partners late${st.twLate.length ? ', e.g. ' + st.twLate[0] : ''})`);
ok(!st.prioBlocked.length, `no priority attack is planned into a priority blocker's side or Psychic Terrain (${st.prioAtk} priority attacks, ${st.prioBlocked.length} blocked${st.prioBlocked.length ? ', e.g. ' + st.prioBlocked[0] : ''})`);
ok(st.theirPrio > 0 && !st.theirPrioWrong.length, `their attacks move in their own priority bracket (${st.theirPrio} priority attacks, ${st.theirPrioWrong.length} wrong${st.theirPrioWrong.length ? ', e.g. ' + st.theirPrioWrong[0] : ''})`);
console.log(`v2-t1rules: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
