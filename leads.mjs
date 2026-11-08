// Lead values learned from real games (Nov 8, readiness fix: the battle plan's lead pair showed no effect on wins).
// From Showdown ladder replays: for each Pokémon, did players who LED with it win more than players who brought it but
// kept it in the back, after allowing for both players' ladder ratings (the Elo formula)? The difference, pulled hard toward
// zero until there are many games (n / (n + 300)), is that Pokémon's lead value. Battle mode adds it to its lead pick.
// Adds to out/model.json: leads = {"Pokémon": value in win-chance points / 100} for Pokémon brought in 150+ games.
// REPLAYS_UNTIL=<unix seconds> (experiments): learn only from games before then; MODEL_FILE: which model file to write into.
import fs from 'node:fs';
const MF = process.env.MODEL_FILE || 'out/model.json', UNTIL = +(process.env.REPLAYS_UNTIL || Infinity);
let R; try { R = JSON.parse(fs.readFileSync('out/replays.json', 'utf8')).games; } catch (e) { console.log('leads: no replays, nothing added'); process.exit(0); }
const MD = JSON.parse(fs.readFileSync(MF, 'utf8')), elo = d => 1 / (1 + Math.pow(10, -d / 400)), base = n => n.replace(/-Mega.*$/, '');
const st = new Map(); // species → {ln, lr, bn, br}: led games and their summed residual, back games and theirs
for (const g of R) { if (g.t >= UNTIL || !Array.isArray(g.r) || (g.w !== 0 && g.w !== 1) || !g.b || !g.l) continue;
  for (const s of [0, 1]) { if (!g.b[s] || g.b[s].length !== 4 || !g.l[s] || g.l[s].length !== 2) continue; const res = (g.w === s ? 1 : 0) - elo(g.r[s] - g.r[1 - s]), led = new Set(g.l[s].map(base));
    for (const n of g.b[s]) { const k = base(n), o = st.get(k) || {ln: 0, lr: 0, bn: 0, br: 0}; if (led.has(k)) { o.ln++; o.lr += res; } else { o.bn++; o.br += res; } st.set(k, o); } } }
const leads = {}; for (const [k, o] of st) { if (o.ln + o.bn < 150 || !o.ln || !o.bn) continue; const n = Math.min(o.ln, o.bn), d = o.lr / o.ln - o.br / o.bn; leads[k] = +(d * n / (n + 300)).toFixed(4); }
MD.leads = leads; MD.leadsNote = 'lead value from ladder replays (leads.mjs): rating-adjusted win rate when led minus when brought in back, shrunk n/(n+300)';
fs.writeFileSync(MF, JSON.stringify(MD));
const top = Object.entries(leads).sort((a, b) => b[1] - a[1]);
console.log(`leads: ${top.length} Pokémon · best leads ${top.slice(0, 4).map(([k, v]) => `${k} +${(v * 100).toFixed(1)}`).join(', ')} · worst ${top.slice(-3).map(([k, v]) => `${k} ${(v * 100).toFixed(1)}`).join(', ')}`);
