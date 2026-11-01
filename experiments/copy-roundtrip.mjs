// Copy for Showdown round trip (Nov): 50 random real tournament teams (open team sheets from events.json) are copied the
// way the "Copy for Showdown" button copies them, then read back with the page's own Showdown importer (parsePaste).
// Every Pokémon must come back with the same form, item, ability, nature and moves (nothing lost, nothing invented).
// Also: Winning-teams cards (tt:), your own team with stat points (mine), a saved team (saved:), and that copying a
// team never changes the team you have open. Usage: node experiments/copy-roundtrip.mjs [count]
import fs from 'node:fs'; import {createRequire} from 'node:module'; import {fileURLToPath} from 'node:url';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const N = +process.argv[2] || 50, page = APP + 'copy-roundtrip.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(); const pg = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(([D]) => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {} }, [D]);
await pg.goto('file://' + page); await pg.waitForTimeout(5000);
const res = await pg.evaluate(c => window.__ev(c), `(() => { const N = ${N}; let seed = 20261101; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const fails = [], same = (a, b) => JSON.stringify(a) === JSON.stringify(b), base = n => (byName.get(n) || {}).b;
  const pool = []; META.events.events.forEach(ev => ev.top.forEach((t, k) => pool.push({key: ev.id + '#' + k, t})));
  const picked = []; while (picked.length < Math.min(N, pool.length)) { const x = pool[Math.floor(rnd() * pool.length)]; if (!picked.includes(x)) picked.push(x); }
  const keep = JSON.stringify(S.slots); let filledTeams = 0, mons = 0;
  // one sheet against what the importer read back
  const check = (label, sheet, r) => { const back = parsePaste(r.text); if (back.slots.length !== sheet.length) fails.push(label + ': ' + back.slots.length + ' of ' + sheet.length + ' Pokémon came back ' + JSON.stringify(back.notes));
    const bad = back.notes.filter(n => !/^No stat points in the paste/.test(n)); if (bad.length) fails.push(label + ': importer notes ' + JSON.stringify(bad));
    sheet.forEach(m => { const s = back.slots.find(x => base(x.n) === base(m.n)); mons++; if (!s) { fails.push(label + ': lost ' + m.n); return; } const p = byName.get(m.n);
      if (s.n !== m.n) fails.push(label + ': form ' + m.n + ' came back as ' + s.n);
      const mv = (s.mv && s.mv.doubles || []).filter(Boolean); if (!r.note && !same(mv, m.mv)) fails.push(label + ': ' + m.n + ' moves ' + JSON.stringify(m.mv) + ' → ' + JSON.stringify(mv));
      if (r.note && !m.mv.every(x => mv.includes(x) || !(LEARN[p.n] || []).some(k => MV[k].name === x))) fails.push(label + ': ' + m.n + ' lost a recorded move');
      if (!p.m && m.i && (s.it && s.it.doubles) !== m.i) fails.push(label + ': ' + m.n + ' item ' + m.i + ' → ' + (s.it && s.it.doubles));
      if (!p.m && m.a && p.a.includes(m.a) && s.a !== m.a) fails.push(label + ': ' + m.n + ' ability ' + m.a + ' → ' + s.a);
      if (p.m && s.a !== p.a[0]) fails.push(label + ': Mega ' + m.n + ' ability ' + s.a);
      const NEU = ['Hardy', 'Docile', 'Serious', 'Bashful', 'Quirky'], nt = String(m.nt || '').normalize('NFD').replace(/[\u0300-\u036f]/g, ''), got = s.sp && s.sp.doubles && s.sp.doubles.nat;
      if (nt && !(got === nt || (NEU.includes(nt) && got === 'Hardy'))) fails.push(label + ': ' + m.n + ' nature ' + m.nt + ' → ' + JSON.stringify(s.sp));
      if (/^EVs:/m.test(r.text)) fails.push(label + ': a stat-point line was written for a team sheet (sheets never list them)'); }); };
  for (const {key, t} of picked) { const r = sdResolve('ev:' + key); if (!r || !r.text) { fails.push(key + ': nothing copied'); continue; } if (r.note) filledTeams++;
    // a complete sheet must copy without the "filled" note
    const complete = t.mons.every(m => { const p = byName.get(m.n); const ln = new Set((LEARN[p.n] || []).map(k => MV[k].name)); return m.mv.length === Math.min(4, ln.size || 4) && m.mv.every(x => !ln.size || ln.has(x)) && (m.i || p.m) && m.a && (p.m || p.a.includes(m.a)); }); if (complete && r.note) fails.push(key + ': complete sheet marked as filled');
    if (!complete && !r.note) fails.push(key + ': incomplete sheet copied without the note');
    check(key, t.mons, r); }
  // Winning teams cards: the event sheet when there is one (same player, same six)
  let tt = 0, ttSheet = 0; (META.teams && META.teams.teams || []).slice(0, 40).forEach((t, k) => { const r = sdResolve('tt:' + k); if (!r || !r.text) { fails.push('tt:' + k + ' nothing copied'); return; } tt++;
    const sh = sdSheetFor(t.mons, t.player); if (sh) { ttSheet++; check('tt:' + k, sh.mons, r); } else { const back = parsePaste(r.text); if (back.slots.length !== t.mons.length) fails.push('tt:' + k + ' (no sheet) lost Pokémon'); if (!r.note) fails.push('tt:' + k + ' filled from common sets without the note'); } });
  // your own team with your stat points: they must come back exactly
  S.slots = normSlots([{n: 'Incineroar', a: 'Intimidate', it: {doubles: 'Sitrus Berry'}, sp: {doubles: {nat: 'Careful', v: [32, 0, 10, 0, 24, 0]}}}, {n: 'Garchomp'}, {n: 'Charizard-Mega-Y'}, {n: 'Sinistcha'}, {n: 'Kingambit'}, {n: 'Whimsicott'}]); fixSlots();
  const mineTxt = sdResolve('mine').text, mb = parsePaste(mineTxt), inc = mb.slots.find(s => s.n === 'Incineroar');
  if (!inc || !inc.sp || !same(inc.sp.doubles.v, [32, 0, 10, 0, 24, 0]) || inc.sp.doubles.nat !== 'Careful' || inc.it.doubles !== 'Sitrus Berry') fails.push('mine: stat points/nature/item lost ' + JSON.stringify(inc));
  if (!/^EVs: 32 HP \\/ 10 Def \\/ 24 SpD$/m.test(mineTxt)) fails.push('mine: EVs line not in Showdown Champions form');
  if (!/^Charizard @ Charizardite Y$/m.test(mineTxt)) fails.push('mine: Mega not written as base + stone');
  if (mb.slots.length !== 6 || mb.slots.map(s => s.n).join() !== S.slots.map(s => s.n).join()) fails.push('mine: Pokémon changed');
  // a saved team copies without touching the open team
  const open = JSON.stringify(S.slots); S.teams.push({id: 'rt1', name: 'RT', slots: [{n: 'Pelipper'}, {n: 'Archaludon'}, {n: 'Basculegion'}, {n: 'Sneasler'}, {n: 'Incineroar'}, {n: 'Rillaboom'}], format: 'doubles', saved: 1});
  const sv = sdResolve('saved:rt1'), sb = parsePaste(sv.text); if (sb.slots.map(s => s.n).join() !== 'Pelipper,Archaludon,Basculegion,Sneasler,Incineroar,Rillaboom') fails.push('saved: wrong team ' + sb.slots.map(s => s.n));
  if (JSON.stringify(S.slots) !== open) fails.push('saved: copying changed the open team');
  S.teams = S.teams.filter(t => t.id !== 'rt1'); S.slots = JSON.parse(keep);
  return {teams: picked.length, mons, filledTeams, tt, ttSheet, fails: fails.slice(0, 40), nFails: fails.length}; })()`);
await b.close(); fs.unlinkSync(page);
console.log(`${res.teams} tournament teams (${res.mons} Pokémon) copied and re-imported; ${res.filledTeams} needed a filled detail. Winning-teams cards: ${res.tt} (${res.ttSheet} from their sheet).`);
if (errs.length) console.log('page errors:', errs.slice(0, 5));
if (res.nFails || errs.length) { console.log('FAIL', res.nFails); res.fails.forEach(f => console.log(' -', f)); process.exit(1); }
console.log('PASS: no loss in the round trip');
