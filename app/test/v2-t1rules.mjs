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
const st = await p.evaluate(() => window.__ev(`(() => { const teams = []; for (const e of META.events.events) for (const t of e.top || []) if (t.mons && t.mons.length === 6 && t.mons.every(m => byName.get(m.n))) teams.push(t.mons.map(m => m.n));
  const st = {n: 0, err: 0, errs: [], twoMega: [], allyKO: [], flinchActs: [], foThen: [], flinches: 0, myFlinchAct: [], noBeat: [], copyWrong: [], foGhost: [], copies: 0}; const slots0 = JSON.stringify(S.slots), opp0 = JSON.stringify(S.opp);
  for (let i = 0; i < Math.min(teams.length, 300); i++) { const me = teams[i], th = teams[(i * 7 + 3) % teams.length], tag = me.join('/') + ' vs ' + th.join('/');
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
console.log(`v2-t1rules: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
