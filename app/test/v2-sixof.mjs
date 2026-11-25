// A six's own record counts only for Pokémon on a set real players ran (code review A2-I1; Sim, Nov 16, batch 9B). Uses real event
// team sheets whose six has its own record, read with the moves and items their players registered:
//   - a real sheet keeps its whole record (share 6/6)
//   - one Pokémon given a move nobody ran on it: 5/6
//   - all six given such a move: no record at all (the score reads as our estimate)
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-sixof.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(3000);
const r = await p.evaluate(() => window.__ev(`(() => { const S6 = META.model && META.model.sixes; if (!S6) return {skip: 'no sixes'};
  const mk = t => assignItems(t.mons.map(m => { const p = byName.get(m.n), mv = (m.mv || []).map(x => mvByName.get(x)).filter(Boolean), it = !p.m && m.i && typeof m.i === 'string' ? m.i : null;
    return {...memberFrom(p, p.a.includes(m.a) ? m.a : undefined), i: -1, p, d: p.d, moves: mv, _mv: mv, custom: true, heldItem: it, item: it || defaultItem(p), mega: p.m, base: p.b, types: p.t}; }));
  const never = p => { const ran = new Set((defSet(p).mv || []).map(r => r[0])), pm = new Set((popularMoves(p) || []).map(x => x.name)); return [...mvByName.values()].find(x => !ran.has(x.name) && !pm.has(x.name)); };
  let whole = null;
  for (const ev of META.events.events) for (const t of ev.top || []) { if (whole || !t || Array.isArray(t) || !t.mons || t.mons.length !== 6 || !t.mons.every(m => byName.get(m.n) && (m.mv || []).length)) continue;
    if (!Array.isArray(S6[t.mons.map(m => m.n).sort().join('|')])) continue; const ms = mk(t), x = CH.sixOf(ms); if (x && x.share === 1) whole = ms; }
  if (!whole) return {skip: 'no real sheet with a record found'};
  const edit = (ms, k) => ms.map((m, i) => i < k ? {...m, moves: [...m.moves.slice(0, 3), never(m.p)], _mv: null} : m);
  const a = CH.sixOf(whole), one = CH.sixOf(edit(whole, 1)), all = CH.sixOf(edit(whole, 6));
  return {a: a && a.share, one: one && one.share, all: all === null ? 'none' : all && all.share}; })()`));
await b.close();
if (r.skip) { console.log('v2-sixof: skipped, ' + r.skip); process.exit(1); }
ok(r.a === 1, `a real team sheet keeps its whole record (share ${r.a})`);
ok(Math.abs(r.one - 5 / 6) < 1e-9, `one Pokémon given a move nobody ran: 5/6 of the record (share ${r.one})`);
ok(r.all === 'none', `all six changed: no record of their own (${r.all})`);
console.log(`v2-sixof: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
