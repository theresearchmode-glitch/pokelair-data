// Rank tiebreak line check (Job 39, Nov 25): every Pokémon with tournament results gets its own rank (ties on the shown
// rating RS(r.total) broken by the full rating before rounding, except an exact full-rating tie which shares #N), and
// rankEdge(p) in app/src/app/24-sheet-data.js explains why on the Pokémon page.
// Checks over every rated Pokémon with results (lairRows().filter(x => x.r.tc)) on the frozen test data:
//   (a) unique shown rating RS(r.total): rankEdge(p) === ''
//   (b) 2-way shown-rating tie: names the other Pokémon and says "ahead" (smaller rank) or "behind" (larger rank),
//       except exact full-rating ties (same rank), which say "exactly level" and "share #N" (happens once on frozen data)
//   (c) group of 3+ sharing a shown rating: says how many rate that number and its ordinal place among them (1st, 2nd, 3rd...)
//   (d) top 10 ranks (lairRank(p).rank) are 1, 2, ..., 10
// Run: PAGE=app/dist/v2.html node experiments/rank-tiebreak-test.mjs   (exit 1 on any failure)
import {chromium} from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
if (!fs.existsSync(PAGE)) { console.log('  FAIL  built page missing: ' + PAGE); process.exit(1); }

let fails = 0;
const ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails++; };
const ord = n => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const q = await ctx.newPage();
const errs = [];
q.on('pageerror', e => errs.push(String(e.message || e)));
await q.addInitScript(() => { window.__PL_TEST = 1; });
await q.goto(pathToFileURL(PAGE).href + '#about', {timeout: 90000});
await q.waitForFunction(() => typeof window.__ev === 'function', null, {timeout: 30000});

const rows = JSON.parse(await q.evaluate(() => window.__ev(`JSON.stringify(
  lairRows().filter(x => x.r.tc).map(x => ({
    n: x.p.n,
    d: x.p.d,
    rs: RS(x.r.total),
    rk: lairRank(x.p),
    edge: rankEdge(x.p)
  }))
)`)));

await ctx.close();
await b.close();

const groups = new Map();
for (const x of rows) {
  const k = String(x.rs);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(x);
}

// (a) unique shown ratings: rankEdge(p) === ''
const solo = rows.filter(x => groups.get(String(x.rs)).length === 1);
const badSolo = solo.filter(x => x.edge !== '');
ok(solo.length > 0 && !badSolo.length,
  `(a) unique shown ratings: ${solo.length - badSolo.length}/${solo.length} Pokémon return ''` +
  (badSolo.length ? ` (e.g. ${badSolo.slice(0, 3).map(x => `${x.d}: "${x.edge}"`).join('; ')})` : ''));

// (b) 2-way shown-rating ties: ahead/behind, plus the exact-level exception ("exactly level" + "share #N", once on frozen data)
const pairs = [...groups.values()].filter(g => g.length === 2);
const splitPairs = pairs.filter(([x, y]) => x.rk.rank !== y.rk.rank);
const levelPairs = pairs.filter(([x, y]) => x.rk.rank === y.rk.rank);
const splitMons = [], badSplit = [];
for (const [x, y] of splitPairs) for (const [m, o] of [[x, y], [y, x]]) {
  splitMons.push(m);
  const want = m.rk.rank < o.rk.rank ? 'ahead' : 'behind';
  const wrong = m.rk.rank < o.rk.rank ? 'behind' : 'ahead';
  if (!(m.edge.includes(o.d) && m.edge.includes(want) && !m.edge.includes(wrong) && m.edge.includes(`#${m.rk.rank}`))) {
    badSplit.push(`${m.d} (#${m.rk.rank} vs ${o.d} #${o.rk.rank}): "${m.edge}"`);
  }
}
ok(splitMons.length > 0 && !badSplit.length,
  `(b) two-way ties (distinct ranks): ${splitMons.length - badSplit.length}/${splitMons.length} Pokémon across ${splitPairs.length} pairs name the other and say ahead/behind` +
  (badSplit.length ? ` (e.g. ${badSplit.slice(0, 2).join('; ')})` : ''));

const levelMons = [], badLevel = [];
for (const [x, y] of levelPairs) for (const [m, o] of [[x, y], [y, x]]) {
  levelMons.push(m);
  if (!(m.edge.includes(o.d) && m.edge.includes('exactly level') && m.edge.includes(`share #${m.rk.rank}`))) {
    badLevel.push(`${m.d} (#${m.rk.rank} with ${o.d}): "${m.edge}"`);
  }
}
ok(levelPairs.length === 1 && levelMons.length === 2 && !badLevel.length,
  `(b) exact-level tie exception: ${levelPairs.length} pair (${levelMons.length - badLevel.length}/${levelMons.length} Pokémon` +
  `${levelMons.length ? ': ' + levelMons.map(x => `${x.d} #${x.rk.rank}`).join(' & ') : ''}) says "exactly level" and "share #N"` +
  (badLevel.length ? ` (e.g. ${badLevel.join('; ')})` : ''));

// (c) groups of 3 or more sharing a shown rating: count + ordinal place (1st, 2nd, 3rd...)
const multiGroups = [...groups.values()].filter(g => g.length >= 3);
const multiMons = [], badMulti = [];
for (const g of multiGroups) g.forEach((m, i) => {
  multiMons.push(m);
  const wantCount = `${g.length} Pokémon rate ${m.rs}`;
  const wantOrd = ord(i + 1);
  if (!(m.edge.includes(wantCount) && m.edge.includes(wantOrd) && m.edge.includes(`#${m.rk.rank}`))) {
    badMulti.push(`${m.d} (rs ${m.rs}, idx ${i + 1}/${g.length}): "${m.edge}"`);
  }
});
ok(multiMons.length > 0 && !badMulti.length,
  `(c) groups of 3+: ${multiMons.length - badMulti.length}/${multiMons.length} Pokémon across ${multiGroups.length} groups state group count and ordinal place` +
  (badMulti.length ? ` (e.g. ${badMulti.slice(0, 2).join('; ')})` : ''));

// (d) top 10 ranks are 1..10
const top10 = rows.slice(0, 10).map(x => x.rk && x.rk.rank);
const want10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
ok(top10.length === 10 && top10.every((r, i) => r === want10[i]),
  `(d) top 10 ranks are 1..10 (got [${top10.join(', ')}])`);

ok(!errs.length, `no page errors (${rows.length} rated Pokémon with results checked)` + (errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''));

console.log(fails ? `rank-tiebreak test: ${fails} FAILED` : 'rank-tiebreak test: all passed');
process.exit(fails ? 1 : 0);
