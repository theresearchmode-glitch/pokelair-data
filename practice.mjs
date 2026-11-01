// Team preview practice (Nov): a few hundred real ladder games to practise picking four and two leads, with what strong
// players actually brought. Reads out/replays.json (newest 20,000 Showdown games), writes out/practice.json (≤ 250 KB).
//
// "Similar" teams: the same six, or five of six the same (Mega forms count as their base Pokémon, since the replay only
// shows a Mega form when it Mega Evolved). Bring stats only use sides where all four brought Pokémon were seen.
//
// out/practice.json
//   dict: Pokémon names; every other name is an index into it
//   minR: the ladder rating the aggregates count from ("strong players")
//   opp:  [six, n, mons]  an opposing six (base forms, as at team preview) and, across every game where a player rated
//         minR+ faced a similar six: n = such games, mons = [[mon, games with it, brought it, led with it], ...]
//   rounds: [oppIndex, mySix, myBrought, myLead, myRating, theirRating, iWon, theirBrought, theirLead, pair]
//         one real game seen from the side facing opp[oppIndex]; pair = what players with a similar six did against a
//         similar opposing six: [games, mostCommonFour, itsCount, mostCommonLead, itsCount]
import fs from 'node:fs';
const MIN_R = 1300, ROUND_R = 1450, MAX_OPP = 160, PER_OPP = 3, LIMIT = 250 * 1024;
const src = (() => { try { return JSON.parse(fs.readFileSync('out/replays.json', 'utf8')); } catch (e) { return null; } })();
if (!src || !Array.isArray(src.games) || !src.games.length) { console.log('practice: no replays, out/practice.json left as it was'); process.exit(0); }
const base = n => String(n).replace(/-Mega.*$/, '');
const shared = (a, b) => { let n = 0; for (const x of a) if (b.includes(x)) n++; return n; };
const ok = g => g && Array.isArray(g.p) && g.p.length === 2 && g.p.every(s => Array.isArray(s) && s.length === 6) && Array.isArray(g.b) && Array.isArray(g.l) && (g.w === 0 || g.w === 1);
const games = src.games.filter(ok);
// one record per side: own six (as recorded), its base forms, what it brought/led, rating, the opposing six
const sides = [];
for (const g of games) for (const i of [0, 1]) {
  const r = Array.isArray(g.r) ? +g.r[i] || 0 : 0;
  sides.push({g, i, six: g.p[i], sb: g.p[i].map(base), b: (g.b[i] || []).map(base), l: (g.l[i] || []).map(base), r, ob: g.p[1 - i].map(base), full: (g.b[i] || []).length === 4 && (g.l[i] || []).length === 2}); }
const strong = sides.filter(s => s.full && s.r >= MIN_R);
// candidate opponents: the opposing sixes strong players faced most (exact six, base forms), then greedy so no two picked
// opponents are similar to each other (more variety)
const key = s => s.slice().sort().join('|');
const faced = new Map(); for (const s of strong) { const k = key(s.ob); faced.set(k, (faced.get(k) || 0) + 1); }
const picked = [];
for (const [k] of [...faced].sort((a, b) => b[1] - a[1])) { if (picked.length >= MAX_OPP) break; const six = k.split('|');
  if (picked.some(p => shared(p, six) >= 5)) continue;
  picked.push(six); }
const dict = [], di = new Map(), id = n => { if (!di.has(n)) { di.set(n, dict.length); dict.push(n); } return di.get(n); };
const opp = [], rounds = [];
for (const six of picked) {
  const vs = strong.filter(s => shared(s.ob, six) >= 5); if (vs.length < 10) continue;
  const m = new Map(); for (const s of vs) for (const x of s.sb) { const c = m.get(x) || [0, 0, 0]; c[0]++; if (s.b.includes(x)) c[1]++; if (s.l.includes(x)) c[2]++; m.set(x, c); }
  const mons = [...m].sort((a, b) => b[1][0] - a[1][0]).map(([x, c]) => [id(x), ...c]);
  const oi = opp.length; opp.push([six.map(id), vs.length, mons]);
  // rounds: real games against this exact six by higher-rated players, own sixes with the most data first (so the reveal has
  // numbers to show), each round a different own six
  const cand = sides.filter(s => s.full && s.r >= ROUND_R && key(s.ob) === key(six) && (s.g.b[1 - s.i] || []).length >= 2).map(s => [s, s.sb.reduce((a, x) => a + Math.min(30, (m.get(x) || [0])[0]), 0) + s.r / 100]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const used = [];
  for (const s of cand) { if (used.length >= PER_OPP) break; if (used.some(u => shared(u.sb, s.sb) >= 5)) continue; used.push(s);
    // players with a similar six against a similar opposing six (this game included)
    const sim = strong.filter(x => shared(x.sb, s.sb) >= 5 && shared(x.ob, six) >= 5);
    const four = new Map(), lead = new Map();
    for (const x of sim) { const f = x.b.slice().sort().join('|'), l = x.l.slice().sort().join('|'); four.set(f, (four.get(f) || 0) + 1); lead.set(l, (lead.get(l) || 0) + 1); }
    // ties go to what this player did
    const best = (mp, own) => [...mp].sort((a, b) => b[1] - a[1] || (b[0] === own) - (a[0] === own))[0];
    const f = best(four, s.b.slice().sort().join('|')), l = best(lead, s.l.slice().sort().join('|'));
    const g = s.g, j = 1 - s.i;
    rounds.push([oi, s.six.map(id), g.b[s.i].map(id), g.l[s.i].map(id), s.r, Array.isArray(g.r) ? +g.r[j] || 0 : 0, g.w === s.i ? 1 : 0, g.b[j].map(id), g.l[j].map(id),
      [sim.length, f[0].split('|').map(id), f[1], l[0].split('|').map(id), l[1]]]); }
}
const out = {updated: new Date().toISOString(), source: `Showdown ladder replays (${src.format || 'Reg M-C'}), ${games.length.toLocaleString('en-US')} recent games`, from: Math.min(...games.map(g => g.t || Infinity)), to: Math.max(...games.map(g => g.t || 0)), minR: MIN_R, roundR: ROUND_R, dict, opp, rounds};
let txt = JSON.stringify(out);
// keep under the size limit: drop the rarest Pokémon rows first
while (txt.length > LIMIT) { for (const o of out.opp) o[2] = o[2].slice(0, Math.max(12, o[2].length - 4)); const t2 = JSON.stringify(out); if (t2.length === txt.length) { out.rounds = out.rounds.slice(0, out.rounds.length - 20); } txt = JSON.stringify(out); }
fs.writeFileSync('out/practice.json', txt);
console.log(`practice: ${out.opp.length} opposing teams, ${out.rounds.length} rounds, ${(txt.length / 1024).toFixed(0)} KB`);
