// Does the grade miss team STRUCTURE? (Nov 8, Phase 2: in the blind review Sim preferred Build for Me teams with a classic support
// core, Rillaboom + Incineroar / Fake Out + Intimidate, or a clear Trick Room plan.) The grade counts each Pokémon, each pair, sets,
// matchups and the six's own record. This asks whether the ROLES a team covers predict later wins beyond the grade.
// Roles per species from tournament team sheets (out/meta_tour.json): a Pokémon fills a role when 40%+ of its sheets run it.
// For every later tournament game (the same games experiments/site-board.mjs scores, same order), the site's own win chance is the
// starting point; then: win ~ logit(site chance) + b × (role on my side − role on theirs). b > 0 beyond chance = the grade underrates it.
// Usage: node experiments/structure-check.mjs <pred.json from site-board.mjs>      (MATCHES / BOARD_DATE as site-board)
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches_dev.json', 'utf8')), P = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const FROM = process.env.BOARD_DATE || '2026-10-27', teams = M.teams.map(k => k.split('|')), isSD = i => String(M.events[i][0]).startsWith('sd-');
const futE = new Set(M.events.map((e, i) => [e, i]).filter(([e, i]) => e[1] >= FROM && !isSD(i)).map(([, i]) => i));
const G = M.m.filter(g => futE.has(g[3]) && g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6);
if (G.length !== P.y.length) { console.error(`game count differs (${G.length} vs ${P.y.length}); run with the same MATCHES/BOARD_DATE as site-board`); process.exit(2); }
const T = JSON.parse(fs.readFileSync(OUT + 'meta_tour.json', 'utf8')), rows = [...T.top, ...(T.more || [])], R = new Map(rows.map(r => [r.n, r]));
const has = (n, k, v) => { const r = R.get(n) || R.get(n.replace(/-Mega.*$/, '')); if (!r) return false; const L = r[k] || []; const x = L.find(([a]) => String(a).toLowerCase() === v.toLowerCase()); return !!x && x[1] >= 40; };
const ROLE = {
  'Fake Out': n => has(n, 'mv', 'Fake Out'),
  'Intimidate': n => has(n, 'ab', 'Intimidate'),
  'redirection': n => has(n, 'mv', 'Follow Me') || has(n, 'mv', 'Rage Powder'),
  'Tailwind': n => has(n, 'mv', 'Tailwind'),
  'Trick Room': n => has(n, 'mv', 'Trick Room'),
};
const side = ns => { const o = {}; for (const [k, f] of Object.entries(ROLE)) o[k] = ns.some(f) ? 1 : 0; o['Fake Out + Intimidate core'] = o['Fake Out'] && o['Intimidate'] ? 1 : 0; o['speed control (Tailwind or Trick Room)'] = o['Tailwind'] || o['Trick Room'] ? 1 : 0; return o; };
const row = P.rows[Object.keys(P.rows).find(k => /^site today/.test(k))], logit = p => Math.log(p / (1 - p)), sig = z => 1 / (1 + Math.exp(-z));
const data = G.map((g, i) => ({off: logit(Math.min(.999, Math.max(.001, row[i]))), y: P.y[i], a: side(teams[g[0]]), b: side(teams[g[1]]), ev: g[3]}));
// one-variable logistic fit on top of the grade's own chance (offset), with a cluster-robust (by tournament) standard error
function fit(key) { let w = 0; for (let it = 0; it < 30; it++) { let g = 0, h = 0; for (const d of data) { const x = d.a[key] - d.b[key]; if (!x) continue; const p = sig(d.off + w * x); g += (d.y - p) * x; h += p * (1 - p) * x * x; } if (!h) return null; w += g / h; }
  let h = 0; const byE = new Map(); for (const d of data) { const x = d.a[key] - d.b[key]; if (!x) continue; const p = sig(d.off + w * x); h += p * (1 - p) * x * x; byE.set(d.ev, (byE.get(d.ev) || 0) + (d.y - p) * x); }
  let v = 0; for (const s of byE.values()) v += s * s; const se = Math.sqrt(v) / h, n = data.filter(d => d.a[key] !== d.b[key]).length; return {w, se, n}; }
const pts = c => (sig(c) - .5) * 100;
console.log(`${data.length} later tournament games, the site's grade as the starting point`);
console.log('role (one side has it, the other not)        games   effect beyond the grade (win-chance pts, 95% range)');
for (const k of [...Object.keys(ROLE), 'Fake Out + Intimidate core', 'speed control (Tailwind or Trick Room)']) { const f = fit(k); if (!f) continue;
  const lo = pts(f.w - 1.96 * f.se), hi = pts(f.w + 1.96 * f.se), sigTxt = lo > 0 ? '  UNDERRATED by the grade' : hi < 0 ? '  OVERRATED by the grade' : '';
  console.log(`  ${k.padEnd(42)} ${String(f.n).padStart(5)}   ${pts(f.w) >= 0 ? '+' : ''}${pts(f.w).toFixed(1)} (${lo.toFixed(1)} to ${hi.toFixed(1)})${sigTxt}`); }
// how common each role is on real tournament teams (the field) for context
const all = G.flatMap(g => [side(teams[g[0]]), side(teams[g[1]])]); console.log('\nshare of real tournament teams with each:', Object.keys(all[0]).map(k => `${k} ${Math.round(all.filter(o => o[k]).length / all.length * 100)}%`).join(' · '));
