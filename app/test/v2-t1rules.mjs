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
const st = await p.evaluate(() => window.__ev(`(() => { const teams = [], refOf = new Map(); for (const e of META.events.events) for (const t of e.top || []) if (t.mons && t.mons.length === 6 && t.mons.every(m => byName.get(m.n))) { teams.push(t.mons.map(m => m.n)); if (!refOf.has(t.mons.map(m => m.n).join('/'))) refOf.set(t.mons.map(m => m.n).join('/'), {ev: e, t}); }
  const st = {n: 0, err: 0, errs: [], twoMega: [], allyKO: [], flinchActs: [], foThen: [], flinches: 0, myFlinchAct: [], noBeat: [], copyWrong: [], foGhost: [], copies: 0, theirDud: [], myLate: [], sureBad: [], tailwinds: 0, twLate: [], prioAtk: 0, prioBlocked: [], theirPrio: 0, theirPrioWrong: [], boards: 0, boardTwoMega: [], boardArrow: [], planNoTarget: [], sureKO: 0, koActs: [], intoDown: [], fainted: 0, faintBad: [], koStamp: 0, koStampBad: [], allyHits: 0, names: 0, nameSide: [], noteIt: [], whyN: 0, whyMax: 0, whyLong: [], sheetHits: 0, sheetDiff: 0, sheetWrong: [], koLines: 0, sashKO: [], warnNames: 0, warnSide: [], intoGone: [], dblParen: [], theirKO: 0, theirKOmiss: [], koSureN: 0, koSureBad: []}; const slots0 = JSON.stringify(S.slots), opp0 = JSON.stringify(S.opp);
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
    for (const bt of T.beats) { const a = (bt.why.match(/also hits your .*?up to (\\d+)%/i) || [])[1]; if (a) st.allyHits++; if (a && +a >= 100) st.allyKO.push(tag + ': ' + bt.act);
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
    for (const bt of T.beats) { if (!bt.me && /^Fake Out /.test(bt.act) && /^Fake Out has no effect|has already moved: no flinch|takes the hit but can't flinch/.test(bt.why)) st.theirDud.push(tag + ': ' + bt.x.d + ' ' + bt.act);
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
    /* third review: Home's plan board draws what turn one plans with (one Mega per side, as Battle), and every arrow points at a
       drawn Pokémon. Their six as the board's 'latest winner' (V2.sdsPlan, stampede-six.js), with that team's real open sheet */
    { const ref = refOf.get(th.join('/')); if (ref && typeof V2 === 'object' && V2.sdsPlan) { const P = V2.sdsPlan(members(), {ev: ref.ev, t: ref.t, six: ref.t.mons.map(m => ({p: byName.get(m.n)}))});
      if (P && P.their && P.their.length >= 2) { st.boards++; const meN = P.leadN || P.lead.map(m => m.p.n), mg = a => a.filter(n => (byName.get(n) || {}).m).length;
        if (mg(P.their) > 1 || mg(meN) > 1) st.boardTwoMega.push(tag + ': ' + meN.join('+') + ' vs ' + P.their.join('+'));
        for (const a of P.aim || []) if (a) for (const n of a.at) if (!P.their.includes(n)) st.boardArrow.push(tag + ': ' + a.move + ' at ' + n); } } }
    /* third check: a 'may not move' note from YOUR Fake Out never calls it their likely target (that is their Fake Out's wording) */
    /* wording pass (Nov 19; was: a note from your Fake Out never says 'their likely target'): every Pokémon named in a why line says
       whose it is ('your' / 'their'; mirrors have one name on both sides), and the side is right; a note (after the main fact,
       bt.main) never says 'it' or 'its' (lower case: a move such as Make It Rain is not a pronoun), so 'it' can't mean two Pokémon in one line; no why runs past 130 characters */
    { const sides = [['your', T.leads.map(x => x.d)], ['their', T.opp.map(x => x.d)]], all = [...sides[0][1], ...sides[1][1]];
      for (const bt of T.beats) { const w = bt.why; st.whyN++; st.whyMax = Math.max(st.whyMax, w.length); if (w.length > 130) st.whyLong.push(tag + ': ' + w);
        for (const n of new Set(all)) for (let i = w.indexOf(n); i >= 0; i = w.indexOf(n, i + 1)) {
          if (all.some(m => m !== n && m.includes(n) && w.indexOf(m, i - m.indexOf(n)) === i - m.indexOf(n))) continue; /* part of a longer name */
          const sd = ((w.slice(0, i).match(/\\b(your|their) $/i) || [])[1] || '').toLowerCase(); st.names++;
          if (!sd || !sides.find(x => x[0] === sd)[1].includes(n)) st.nameSide.push(tag + ': ' + bt.x.d + ': ' + w); }
        if (bt.main != null && /\\b(it|its)\\b/.test(w.slice(bt.main.length))) st.noteIt.push(tag + ': ' + w); } }
    /* third check (cosmetic): a flinched Fake Out user's plan names its target, as every Fake Out line does */
    for (const bt of T.beats) if (bt.act === 'Flinches' && bt.plan === 'Fake Out') st.planNoTarget.push(tag + ': ' + bt.x.d);
    /* fourth check (Nov 19, KO gap): a sure KO (your 'KOs' line: no '% to hit', not 'charges first', the user not at risk of being
       flinched or KO'd first (koRisk), no Focus Sash / Sturdy on the target) means the target never acts later in turn one, and no later
       attack aims at it unless the line says so ('KO'd earlier this turn'). The target is read from the act ('into X'; a spread
       move's 'KOs on X'). Exact speed ties are left out (either may move first) */
    { const down = new Map(); T.beats.forEach((bt, i) => { if (!bt.me || bt.act === 'Flinches' || bt.flinch === 'likely' || bt.koRisk) return;
        const k = (bt.main != null ? bt.main : bt.why).match(/^KOs(?: their (.+?))?(?: \\(([^)]*)\\))?(?:\\. |$)/); if (!k || (k[2] && /% to hit|charges first/.test(k[2]))) return;
        const am = bt.act.match(/^(.+?) into (.+)$/), tn = am ? am[2] : k[1], t = T.opp.find(o => o.d === tn); if (!t) return;
        /* Focus Sash as the calc sees a foe: its most common item (sideDefaults), or the item it carries */
        if ([t.item, (t._orig || {}).item, (topItem(t.p) || [])[0]].includes('Focus Sash') || abilityOf(t) === 'Sturdy') return; st.sureKO++; if (!down.has(t)) down.set(t, i);
        const j = T.beats.findIndex(y => y.x === t); if (j > i && !(T.beats[j].prio === bt.prio && T.beats[j].speed === bt.speed) && T.beats[j].act !== 'Fainted') st.koActs.push(tag + ': ' + bt.x.d + ' ' + bt.act + ' (' + bt.why + ') then ' + t.d + ' ' + T.beats[j].act); });
      T.beats.forEach((bt, j) => { const am = bt.act.match(/^(.+?) into (.+)$/) || bt.act.match(/^(Fake Out) (.+)$/); if (!am) return; const t = (bt.me ? T.opp : T.leads).find(o => o.d === am[2]);
        if (t && down.has(t) && down.get(t) < j) st.intoDown.push(tag + ': ' + bt.x.d + ' ' + bt.act + ' (' + bt.why + ')'); });
      for (const bt of T.beats) if (bt.act === 'Fainted') { st.fainted++; if (bt.me || !bt.plan) st.faintBad.push(tag + ': ' + bt.x.d); } }
    /* Nov 19 visual check: Battle's card shows a KO stamp only for a sure KO ('KOs', or 'OHKO' with no chance); a chance KO
       ('OHKO 19%') or a KO named only in a note gets none. Read from each card as Battle draws it (V2.pbpBeat) */
    if (typeof V2 === 'object' && V2.pbpBeat) T.beats.forEach((bt, i) => { if (!/ into /.test(bt.act)) return; const main = bt.main != null ? bt.main : String(bt.why).split('; ')[0];
      const stamp = /pbp-tgt ko/.test(V2.pbpBeat(bt, i, T, i + 1)), sure = /^KOs\\b/i.test(main) || /\\bOHKO\\b(?! \\d)/.test(main);
      if (stamp) st.koStamp++; if (stamp && !sure) st.koStampBad.push(tag + ': ' + bt.x.d + ' ' + bt.act + ' (' + bt.why + ') stamp ' + stamp); });
    /* Nov 19 review (small): no act aims 'into' a foe its own why calls KO'd earlier this turn (the card would draw a Pokémon that is
       gone), and no why carries a double closing parenthesis ('(up to 287% to your Basculegion (F))') */
    for (const bt of T.beats) { const am = bt.act.match(/ into (.+)$/), g = bt.why.match(/(.*) (?:is|are) KO'd earlier this turn/i);
      if (am && g && g[1].includes(am[1])) st.intoGone.push(tag + ': ' + bt.act + ' (' + bt.why + ')'); if (bt.why.includes('))')) st.dblParen.push(tag + ': ' + bt.why); }
    /* Nov 19 (opponent items): their lead from a real open team sheet is calculated with its sheet item and Ability (spread: the
       usual one), both ways. Each single-target attack line into or from such a lead must show what a direct damage() call with
       that item gives ('up to N%' or 'KOs'). sheetDiff counts lines where the sheet item is not the Pokémon's most common one, so
       the check could fail. And no 'KOs' when that call says Focus Sash or Sturdy holds (r.sash; 'Sash holds' instead) */
    { const F0 = T.field || {}, F = {weather: (F0.wx != null ? F0.wx : F0.weather) || '', terrain: T.terrain || '', auras: F0.auras};
      const sheetOf = x => { const o = x._orig || x, it = x.item || o.item; return o.real && it ? it : null; };
      const side = (x, role) => { const mine = T.leads.includes(x), d = sideDefaults(x.p, role, mine ? (x._orig || x) : null), it = mine ? null : sheetOf(x);
        if (it) { d.item = it; if (x.ability && x.p.a.includes(x.ability)) d.ability = x.ability; } return {p: x.p, ...d}; };
      for (const bt of T.beats) { const main = bt.main != null ? bt.main : bt.why, am = bt.act.match(/^(.+?) into (.+)$/), sp = !am && bt.me && main.match(/^KOs their (.+?)(?: \\(|\\. |$)/);
        if ((!am && !sp) || (am && am[1] === 'Fake Out') || /KO'd earlier this turn/.test(bt.why)) continue;
        const t = (bt.me ? T.opp : T.leads).find(o => o.d === (am ? am[2] : sp[1])), mvN = am ? am[1] : bt.act.replace(/ \\(hits both\\)$/, ''), mv = (bt.x.moves || []).find(x => x && x.name === mvN) || mvByName.get(mvN);
        if (!t || !mv) continue; const foe = bt.me ? t : bt.x, it = sheetOf(foe);
        const r = damage({atk: side(bt.x, 'atk'), def: side(t, 'def'), move: mv, spread: !!mv.spread, weather: F.weather, terrain: F.terrain, auras: F.auras}); if (!r || !r.hp) continue;
        /* Nov 19 review: the KO stamp on Battle's card (V2.pbpBeat) shows exactly when the KO is sure, told from the calc, not the
           line's text: every roll KOs, Sash/Sturdy don't hold, 100% to hit, not charging, and the attacker isn't at risk of being
           flinched or KO'd first (flinch 'likely', koRisk) */
        if (am && typeof V2 === 'object' && V2.pbpBeat) { const A = side(bt.x, 'atk'), i = T.beats.indexOf(bt), acc = moveAcc(mv, A.ability, F.weather, side(t, 'def'), A.item);
          const sure = r.min >= r.hp && !r.sash && acc >= 100 && !chargesFirst(mv, F.weather, A.item) && !bt.koRisk && bt.flinch !== 'likely', stamp = /pbp-tgt ko/.test(V2.pbpBeat(bt, i, T, i + 1));
          if (sure) st.koSureN++; if (stamp !== sure) st.koSureBad.push(tag + ': ' + (bt.me ? 'your ' : 'their ') + bt.x.d + ' ' + bt.act + ' (' + bt.why + ') stamp ' + stamp + ', ' + dmgP(100 * r.min / r.hp) + '-' + dmgP(100 * r.max / r.hp) + '%, ' + acc + '% to hit'); }
        /* Nov 19 review: their hit that can KO your lead before it moves (any roll, any accuracy; not Sash, not charging) puts that
           lead at risk (koRisk), so its own KO isn't sure; told from the calc and the turn order, not the line's text */
        if (!bt.me && am && r.max >= r.hp && !r.sash && !chargesFirst(mv, F.weather, side(bt.x, 'atk').item)) { const j = T.beats.findIndex(y => y.x === t);
          if (j > T.beats.indexOf(bt)) { st.theirKO++; if (!T.beats[j].koRisk) st.theirKOmiss.push(tag + ': their ' + bt.x.d + ' ' + bt.act + ' (' + dmgP(100 * r.min / r.hp) + '-' + dmgP(100 * r.max / r.hp) + '%) before your ' + t.d + ' ' + T.beats[j].act); } }
        if (!it && !/^KOs/.test(main)) continue; /* the checks below: sheet lines and 'KOs' lines only (the two above: every attack line) */
        if (/^KOs/.test(main)) { st.koLines++; if (r.sash) st.sashKO.push(tag + ': ' + bt.x.d + ' ' + bt.act + ' (' + main + '), ' + t.d + ' holds with ' + r.sashBy); }
        if (!it) continue; st.sheetHits++; if (sideDefaults(foe.p, 'def', null).item !== it) st.sheetDiff++;
        const um = main.match(/^up to (\\S+)% of /), okHit = um ? um[1] === dmgP(100 * r.max / r.hp) : /^KOs/.test(main) ? r.min >= r.hp : true;
        if (!okHit) st.sheetWrong.push(tag + ': ' + (bt.me ? 'your ' : 'their ') + bt.x.d + ' ' + bt.act + ' (' + main + ') vs ' + dmgP(100 * r.min / r.hp) + '-' + dmgP(100 * r.max / r.hp) + '% with ' + it); } }
    /* Nov 19: the Watch line names every Pokémon with 'your' or 'their' (mirrors have one name on both sides), on the right side */
    { const sides = [['your', T.leads.map(x => x.d)], ['their', T.opp.map(x => x.d)]], all = [...sides[0][1], ...sides[1][1]];
      for (const w of T.warn || []) for (const n of new Set(all)) for (let i = w.indexOf(n); i >= 0; i = w.indexOf(n, i + 1)) {
        if (all.some(m => m !== n && m.includes(n) && w.indexOf(m, i - m.indexOf(n)) === i - m.indexOf(n))) continue; st.warnNames++;
        const sd = ((w.slice(0, i).match(/\\b(your|their) $/i) || [])[1] || '').toLowerCase(); if (!sd || !sides.find(x => x[0] === sd)[1].includes(n)) st.warnSide.push(tag + ': ' + w); } }
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
ok(st.boards > 0 && !st.boardTwoMega.length, `Home's plan board draws one Mega per side, as turn one plans (${st.boards} boards, ${st.boardTwoMega.length} with two${st.boardTwoMega.length ? ', e.g. ' + st.boardTwoMega[0] : ''})`);
ok(!st.boardArrow.length, `every plan board arrow points at a drawn Pokémon (${st.boardArrow.length}${st.boardArrow.length ? ', e.g. ' + st.boardArrow[0] : ''})`);
ok(st.names > 0 && !st.nameSide.length, `every Pokémon named in a why line says 'your' or 'their', on the right side (${st.names} names, ${st.nameSide.length} wrong${st.nameSide.length ? ', e.g. ' + st.nameSide[0] : ''})`);
ok(!st.noteIt.length, `a note never says 'it' or 'its' (only the main fact does, for its target) (${st.noteIt.length}${st.noteIt.length ? ', e.g. ' + st.noteIt[0] : ''})`);
ok(st.whyN > 0 && !st.whyLong.length, `every why line is at most 130 characters (${st.whyN} lines, longest ${st.whyMax}, ${st.whyLong.length} over${st.whyLong.length ? ', e.g. ' + st.whyLong[0] : ''})`);
ok(st.allyHits > 0, `the partner-hit note is still read (${st.allyHits} lines)`);
ok(!st.planNoTarget.length, `a flinched Fake Out user's plan names its target (${st.planNoTarget.length}${st.planNoTarget.length ? ', e.g. ' + st.planNoTarget[0] : ''})`);
ok(st.sureKO > 0 && !st.koActs.length, `a Pokémon your sure KO hits before it moves doesn't act this turn (${st.sureKO} sure KOs, ${st.koActs.length} targets still acting${st.koActs.length ? ', e.g. ' + st.koActs[0] : ''})`);
ok(!st.intoDown.length, `no later attack aims at a Pokémon already KO'd this turn (${st.intoDown.length}${st.intoDown.length ? ', e.g. ' + st.intoDown[0] : ''})`);
ok(!st.faintBad.length, `a 'Fainted' beat is only theirs and keeps its planned move (${st.fainted} fainted, ${st.faintBad.length} wrong${st.faintBad.length ? ', e.g. ' + st.faintBad[0] : ''})`);
ok(st.koStamp > 0 && !st.koStampBad.length, `Battle's KO stamp shows only for a sure KO, not a chance ('OHKO 19%') (${st.koStamp} stamps, ${st.koStampBad.length} wrong${st.koStampBad.length ? ', e.g. ' + st.koStampBad[0] : ''})`);
ok(st.sheetDiff > 0 && !st.sheetWrong.length, `their lead from a real open team sheet is calculated with its sheet item, both ways (${st.sheetHits} lines, ${st.sheetDiff} where it isn't the most common item, ${st.sheetWrong.length} wrong${st.sheetWrong.length ? ', e.g. ' + st.sheetWrong[0] : ''})`);
ok(st.koLines > 0 && !st.sashKO.length, `no 'KOs' when Focus Sash or Sturdy holds (${st.koLines} KO lines, ${st.sashKO.length} wrong${st.sashKO.length ? ', e.g. ' + st.sashKO[0] : ''})`);
ok(st.warnNames > 0 && !st.warnSide.length, `the Watch line says 'your' or 'their' on every name, on the right side (${st.warnNames} names, ${st.warnSide.length} wrong${st.warnSide.length ? ', e.g. ' + st.warnSide[0] : ''})`);
ok(!st.intoGone.length && !st.dblParen.length, `no act aims at a foe KO'd earlier this turn, no double parenthesis (${st.intoGone.length} aimed at a fainted foe, ${st.dblParen.length} '))'${st.intoGone.length ? ', e.g. ' + st.intoGone[0] : st.dblParen.length ? ', e.g. ' + st.dblParen[0] : ''})`);
ok(st.theirKO > 0 && !st.theirKOmiss.length, `their hit that can KO your lead before it moves marks that lead at risk, sure or chance (${st.theirKO} such hits, ${st.theirKOmiss.length} unmarked${st.theirKOmiss.length ? ', e.g. ' + st.theirKOmiss[0] : ''})`);
ok(st.koSureN > 0 && !st.koSureBad.length, `Battle's KO stamp shows exactly for a sure KO, told from the calc (not under 100% to hit, not when the attacker may not move first) (${st.koSureN} sure KOs, ${st.koSureBad.length} wrong${st.koSureBad.length ? ', e.g. ' + st.koSureBad[0] : ''})`);
console.log(`v2-t1rules: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
