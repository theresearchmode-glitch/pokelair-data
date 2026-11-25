// Commander (Reg M-D, Nov 25): Tatsugiri with Commander leading beside its side's Dondozo jumps into it as the leads come out.
// Turn One (40-turn-one-data.js) must then: show Tatsugiri's Commander first (priority stays 0), never let either side target or
// hit it (spread moves skip it), give Dondozo +2 Attack/Defense/Sp. Atk/Sp. Def/Speed (more damage dealt, less taken, double
// Speed), and work the same for their side. Dondozo and Tatsugiri aren't in the roster until Showdown publishes Reg M-D, so the
// test adds them with Showdown's own Champions numbers (Dondozo 150/100/115/65/65/35 Water; Tatsugiri 68/50/60/120/95/82
// Dragon/Water). Each check fails on the build before Commander (no Commander line; Dondozo's numbers unchanged).
//   PAGE=app/dist/v2.html node experiments/commander-test.mjs   (a --v2 build; exit 1 on any failure)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#battle', {timeout: 90000}); await p.waitForTimeout(3000);
const R = await p.evaluate(() => window.__ev(`(() => {
  const mk = (n, t, a, st) => ({n, d: n, t, a, m: 0, u: 0, s: st.reduce((x, y) => x + y, 0), us: 0, b: n, sp: st[5], st, k: n.toLowerCase(), tok: [n.toLowerCase()]});
  const DZ = mk('Dondozo', ['Water'], ['Unaware', 'Oblivious', 'Water Veil'], [150, 100, 115, 65, 65, 35]), TG = mk('Tatsugiri', ['Dragon', 'Water'], ['Commander', 'Storm Drain'], [68, 50, 60, 120, 95, 82]);
  const had = [byName.get('Dondozo'), byName.get('Tatsugiri')]; byName.set('Dondozo', DZ); byName.set('Tatsugiri', TG);
  const MV = ns => ns.map(n => mvByName.get(n)).filter(Boolean);
  const mon = (pp, ab, moves, item) => ({p: pp, d: pp.d, types: pp.t, ability: ab, item: item || '', moves: MV(moves), custom: true});
  const foe = n => { const pp = byName.get(n); return mon(pp, pp.a[0], ['Protect']); };
  const dz = () => mon(DZ, 'Unaware', ['Wave Crash', 'Earthquake', 'Body Press', 'Protect'], 'Leftovers');
  const run = (mine, theirs) => { const T = turnOneData(mine, theirs, {lead: [0, 1], B: null}); return T && T.beats ? T.beats.map(x => ({who: x.x.d, me: x.me, act: x.act, why: x.why, speed: x.speed, prio: x.prio})) : null; };
  try {
    const th = () => { const g = mon(byName.get('Garchomp'), 'Rough Skin', ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Protect']), i = mon(byName.get('Incineroar'), 'Blaze', ['Flare Blitz', 'Knock Off', 'Protect', 'U-turn']); return [g, i, foe('Rillaboom'), foe('Sneasler')]; };
    const withC = run([dz(), mon(TG, 'Commander', ['Draco Meteor', 'Muddy Water', 'Protect']), foe('Kingambit'), foe('Clefable')], th());
    const noC = run([dz(), mon(TG, 'Storm Drain', ['Draco Meteor', 'Muddy Water', 'Protect']), foe('Kingambit'), foe('Clefable')], th());
    const theirsC = run([mon(byName.get('Garchomp'), 'Rough Skin', ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Protect']), mon(byName.get('Incineroar'), 'Blaze', ['Flare Blitz', 'Knock Off', 'Protect']), foe('Rillaboom'), foe('Sneasler')],
      [dz(), mon(TG, 'Commander', ['Draco Meteor', 'Muddy Water', 'Protect']), foe('Kingambit'), foe('Clefable')]);
    /* what Dondozo takes, straight from the hit helper: Garchomp's Earthquake (physical) and Draco Meteor (special), at 0 and at +2 Def / Sp. Def */
    const G = byName.get('Garchomp'), tk = (mv, st) => { const h = bestHitOn(G, MV([mv]), DZ, null, null, st ? {dStage: {def: 2, spd: 2}} : {}); return h ? h.r.max : null; };
    const taken = {phys: [tk('Earthquake'), tk('Earthquake', 1)], spec: [tk('Draco Meteor'), tk('Draco Meteor', 1)]};
    return JSON.stringify({withC, noC, theirsC, taken}); }
  finally { had[0] ? byName.set('Dondozo', had[0]) : byName.delete('Dondozo'); had[1] ? byName.set('Tatsugiri', had[1]) : byName.delete('Tatsugiri'); } })()`));
let fails = 0; const ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails++; };
let r; try { r = JSON.parse(R); } catch (e) { ok(false, 'turn one ran: ' + String(R).slice(0, 300)); await b.close(); process.exit(1); }
const {withC, noC, theirsC, taken} = r, j = x => JSON.stringify(x).slice(0, 400);
const pct = (bs, who, me) => { const x = bs && bs.find(y => y.who === who && y.me === me); const m = x && /up to (\d+(?:\.\d+)?)%/i.exec(x.why); return m ? +m[1] : (x && /^KOs/.test(x.why) ? 999 : null); };
ok(!!withC && withC[0].who === 'Tatsugiri' && /^Commander: into your Dondozo/.test(withC[0].act) && withC[0].prio === 0, `your Tatsugiri's Commander comes first, priority 0 (${j(withC && withC[0])})`);
ok(!!withC && !withC.some(x => /Tatsugiri/.test(x.act) && !x.me), `their leads never aim at your commanding Tatsugiri (${j(withC && withC.filter(x => !x.me).map(x => x.act))})`);
const dzW = withC && withC.find(x => x.who === 'Dondozo'), dzN = noC && noC.find(x => x.who === 'Dondozo');
ok(!!dzW && !!dzN && dzW.speed === 2 * dzN.speed, `Dondozo moves at double Speed (+2) while commanded (${dzW && dzW.speed} vs ${dzN && dzN.speed})`);
const hitW = pct(withC, 'Dondozo', true), hitN = pct(noC, 'Dondozo', true);
ok(hitW != null && hitN != null && hitW > hitN, `Dondozo hits harder at +2 (${hitW}% vs ${hitN}% without Commander)`);
ok(taken && taken.phys[1] < taken.phys[0] && taken.spec[1] < taken.spec[0], `Dondozo takes less at +2 Defense / Sp. Def: Earthquake ${taken && taken.phys.join(' -> ')} HP, Draco Meteor ${taken && taken.spec.join(' -> ')} HP`);
ok(!!noC && noC.some(x => !x.me && / into Tatsugiri/.test(x.act)), 'without Commander their leads can aim at Tatsugiri (so the check above can fail)');
ok(!!noC && !noC.some(x => /^Commander/.test(x.act)), 'no Commander without the Ability (Storm Drain Tatsugiri)');
ok(!!theirsC && theirsC[0].who === 'Tatsugiri' && !theirsC[0].me && /^Commander: into their Dondozo/.test(theirsC[0].act) && !theirsC.some(x => x.me && /Tatsugiri/.test(x.act)), `their Commander: first, and your leads never aim at it (${j(theirsC && theirsC.map(x => x.act))})`);
await b.close(); console.log(fails ? `commander-test: ${fails} FAILED` : 'commander-test: all passed'); process.exit(fails ? 1 : 0);
