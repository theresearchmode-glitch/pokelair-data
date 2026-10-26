// Monthly Showdown ladder stats (step 5): Smogon's usage stats for Champions VGC Reg M-C, 1630+ ladder.
// Builds out/meta_ladder.json in the same shape as meta_tour.json (plus checks & counters), only when a new month is out.
import fs from 'node:fs'; import vm from 'node:vm';
const FMT = 'gen9championsvgc2026regmc', CUT = 1630, BASE = 'https://www.smogon.com/stats/';
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const prev = readJSON('out/meta_ladder.json', null);
const months = [...(await (await fetch(BASE)).text()).matchAll(/href="(\d{4}-\d{2})\/"/g)].map(m => m[1]).sort().reverse();
let month = null, data = null;
for (const m of months.slice(0, 3)) { const r = await fetch(`${BASE}${m}/chaos/${FMT}-${CUT}.json`); if (r.ok) { month = m; if (prev && prev.month === m && !process.env.FORCE) break; data = await r.json(); break; } }
if (!month) { console.log('ladder: no stats found'); process.exit(0); }
if (!data) { console.log(`ladder: ${month} already built`); process.exit(0); }
// Showdown ids -> names
const sd = async (f, key) => { const t = await (await fetch('https://play.pokemonshowdown.com/data/' + f)).text(); const ctx = {exports: {}}; vm.runInNewContext(t, ctx); return ctx.exports[key]; };
const MOVES = await (await fetch('https://play.pokemonshowdown.com/data/moves.json')).json(), ITEMS = await sd('items.js', 'BattleItems'), ABIL = await sd('abilities.js', 'BattleAbilities');
const nm = (tab, id) => (tab[id] && tab[id].name) || id;
const ROSTER = new Set(readJSON('roster.json', []));
const mapMon = n => { n = n.replace(/'/g, '’'); if (ROSTER.has(n)) return n; for (const c of [n.replace(/-F$/, '-F'), n.replace(/-(Mega.*)$/, '-$1'), n.split('-')[0]]) if (ROSTER.has(c)) return c; return null; };
const D = data.data, N = data.info['number of battles'], miss = [];
const rows = Object.entries(D).sort((a, b) => b[1].usage - a[1].usage).slice(0, 100).map(([name, x], i) => {
  const tot = Object.values(x.Abilities).reduce((a, b) => a + b, 0) || 1;
  const pc = (o, k, f) => Object.entries(o).filter(([id]) => id && id !== 'nothing').sort((a, b) => b[1] - a[1]).slice(0, k).map(([id, w]) => [f ? f(id) : id, Math.round(1000 * w / tot) / 10]);
  const nat = {}; for (const [s, w] of Object.entries(x.Spreads)) { const n = s.split(':')[0]; nat[n] = (nat[n] || 0) + w; }
  const n = mapMon(name); if (!n) miss.push(name);
  const cc = Object.entries(x['Checks and Counters'] || {}).filter(([, v]) => v.n >= 30).map(([o, v]) => [mapMon(o) || o, Math.round(1000 * (v.p - 4 * v.d)) / 10]).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return {r: i + 1, n: n || name, u: Math.round(10000 * x.usage) / 100, mv: pc(x.Moves, 12, id => nm(MOVES, id)), it: pc(x.Items, 6, id => nm(ITEMS, id)), ab: pc(x.Abilities, 4, id => nm(ABIL, id)),
    na: pc(nat, 4), sp: pc(x.Spreads, 3), tm: pc(x.Teammates, 10, o => mapMon(o) || o), cc}; });
const out = {format: 'doubles', kind: 'ladder', month, source: `Showdown ladder ${CUT}+ (Smogon usage stats, ${FMT})`, period: month, battles: N, updated: new Date().toISOString(),
  note: 'Usage among teams on the 1630+ ladder. Checks & counters: how often the listed Pokémon KOs or forces this one out.', top: rows.slice(0, 60), more: rows.slice(60)};
fs.writeFileSync('out/meta_ladder.json', JSON.stringify(out));
console.log(`ladder: ${month}, ${N} battles, ${rows.length} Pokémon${miss.length ? ', not in roster: ' + miss.join(', ') : ''}`);
