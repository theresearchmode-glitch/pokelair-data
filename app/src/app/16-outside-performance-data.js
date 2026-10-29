// ---------- Outside performance data: raw source tables -> rating inputs ----------
// The daily refresh writes the raw tables to meta/perf exactly as each source prints them; the snapshot built into the
// page (PERF_RAW) has the same shape. Names are matched to the roster here, and Mega usage is split out of base names.
const PZ_FORM = {'Hisuian Form': 'Hisui', 'Alolan Form': 'Alola', 'Galarian Form': 'Galar', 'Female': 'F', 'Dusk Form': 'Dusk', 'Midnight Form': 'Midnight', 'Low Key Form': 'Low-Key',
  'Paldean Form (Aqua Breed)': 'Paldea-Aqua', 'Paldean Form (Blaze Breed)': 'Paldea-Blaze', 'Paldean Form (Combat Breed)': 'Paldea-Combat', 'Small Variety': 'Small', 'Large Variety': 'Large',
  'Jumbo Variety': 'Super', 'Yellow Plumage': 'Yellow', 'Family of Four': '', 'Fancy Pattern': '', 'Male': 'M'};
const PZ_ROTOM = {'Wash Rotom': 'Rotom-Wash', 'Heat Rotom': 'Rotom-Heat', 'Frost Rotom': 'Rotom-Frost', 'Fan Rotom': 'Rotom-Fan', 'Mow Rotom': 'Rotom-Mow'};
function srcName(raw) { let n = String(raw || '').trim(); if (!n) return null; if (byName.has(n)) return n;
  const mega = /^Mega /.test(n); n = n.replace(/^Mega /, '');
  const m = n.match(/^(.*?) \[(.*)\]$/); if (m) { const f = PZ_FORM[m[2]]; n = f ? m[1] + '-' + f : m[1]; }
  if (PZ_ROTOM[n]) n = PZ_ROTOM[n];
  if (n === 'Floette' && !mega) n = 'Floette-Eternal';
  if (mega) { const z = n.match(/^(.*) ([XYZ])$/); n = z ? `${z[1]}-Mega-${z[2]}` : n + '-Mega'; }
  // Megas of gendered species: "Mega Meowstic" alone means the female Mega (the one Limitless shows in use)
  if (mega && n === 'Meowstic-Mega') n = 'Meowstic-F-Mega';
  // A plain name only ever maps to a plain form ("Meowstic-F" used to pick up Meowstic-F-Mega here)
  for (const x of [n, n.replace(/'/g, '’'), n.replace(/’/g, "'"), ...(mega ? [n.replace(/-Mega$/, '') + '-Mega'] : [])]) if (byName.has(x) && (mega || !byName.get(x).m)) return x;
  // cosmetic forms (Sinistcha-Masterpiece, Maushold-Four, Vivillon-Pokeball) count as the base Pokémon
  const base = n.split('-')[0]; if (!mega && byName.has(base) && !byName.get(base).m) return base;
  return null; }
// op.gg names: "Alolan Ninetales", "Indeedee (Female)", "Heat Rotom". A name listed twice means two forms; the first is the Hisuian one.
const OP_REGION = {Alolan: 'Alola', Galarian: 'Galar', Hisuian: 'Hisui', Paldean: 'Paldea'};
function opggNames(list) { const seen = new Set(), out = [];
  for (const x0 of list || []) { let x = String(x0 || '').trim(), n = null; const m = x.match(/^(Alolan|Galarian|Hisuian|Paldean) (.*)$/); let reg = null; if (m) { reg = OP_REGION[m[1]]; x = m[2]; }
    const f = x.match(/^(.*?) \((.*)\)$/); let base = f ? f[1] : x, form = f ? f[2] : '';
    if (reg === 'Paldea' && /Breed/.test(form)) n = 'Tauros-Paldea-' + form.split(' ')[0];
    else if (reg) n = base + '-' + reg;
    else if (/^Female$/.test(form)) n = base + '-F';
    else if (/Dusk|Midnight/.test(form)) n = base + '-' + form.split(' ')[0];
    else if (/Low Key/.test(form)) n = base + '-Low-Key';
    else if (/Yellow Plumage/.test(form)) n = base + '-Yellow';
    else if (/Super Size/.test(form)) n = base + '-Super'; else if (/Small Size/.test(form)) n = base + '-Small'; else if (/Large Size/.test(form)) n = base + '-Large';
    else n = base;
    if (!reg && !form && ['Arcanine', 'Zoroark', 'Typhlosion', 'Samurott', 'Goodra', 'Decidueye', 'Avalugg'].includes(base) && !seen.has(base)) { seen.add(base); n = base + '-Hisui'; }
    out.push(srcName(n) || srcName(x0)); }
  return out; }
function perfFromRaw(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const num = v => (typeof v === 'number' && isFinite(v)) ? v : +v;
  // tournament tables list base names that include their Mega users; split the plain form out
  // split: the table already lists Megas on their own rows (our daily Limitless table), so nothing is subtracted
  const pz = (rows, megas, split) => { const D = {}; for (const r of [...(rows || []), ...(megas || [])]) { if (!Array.isArray(r)) continue; const n = srcName(r[0]); if (!n) continue;
      const u = num(r[1]), w = num(r[2]), mt = num(r[3]); if (![u, w, mt].every(isFinite)) continue;
      // two rows for one Pokémon (cosmetic forms like Sinistcha-Masterpiece) add up instead of overwriting
      const o = D[n]; D[n] = o ? [+(o[0] + u).toFixed(2), o[2] + mt > 0 ? +((o[1] * o[2] + w * mt) / (o[2] + mt)).toFixed(1) : w, o[2] + mt] : [u, w, mt]; }
    if (!split) for (const p of ROSTER) { if (p.m || !D[p.n] || (p.n !== p.b && p.n !== 'Floette-Eternal')) continue;
      const ms = ROSTER.filter(q => q.m && q.b === p.b && D[q.n]); if (!ms.length) continue;
      let [u, w, mt] = D[p.n], wins = w / 100 * mt; for (const q of ms) { u -= D[q.n][0]; mt -= D[q.n][2]; wins -= D[q.n][1] / 100 * D[q.n][2]; }
      D[p.n] = [Math.max(0, +u.toFixed(2)), mt > 0 ? +Math.max(0, Math.min(100, wins / mt * 100)).toFixed(1) : 0, Math.max(0, Math.round(mt))]; }
    return D; };
  const usageMap = rows => { const D = {}; for (const r of rows || []) { if (!Array.isArray(r)) continue; const n = srcName(r[0]); if (n && isFinite(num(r[1]))) D[n] = +((D[n] || 0) + num(r[1])).toFixed(2); } return D; };
  const smogon = usageMap(raw.smogon && raw.smogon.rows), prd = usageMap(raw.prd && raw.prd.rows);
  // ladder and in-game rows use species names that cover the plain form and its Megas together ("Garchomp" includes
  // Mega Garchomp and Mega Garchomp Z). Share each row out by how strong players split the species (Smogon's form usage,
  // else tournament usage), so a popular Mega isn't scored as unused and its base form isn't credited with its games.
  const tourU = (() => { const D = {}; for (const r of [...((raw.tour && raw.tour.rows) || []), ...((raw.tour && raw.tour.megas) || [])]) { if (Array.isArray(r)) { const n = srcName(r[0]); if (n && isFinite(num(r[1]))) D[n] = (D[n] || 0) + num(r[1]); } } return D; })();
  // A species row covers the plain form and its Megas. Regional forms (Alolan Raichu, Galarian Slowbro) have no Mega of
  // their own, so they are never split with the Kanto form's Megas.
  const formsOf = n => { const q = byName.get(n); if (!q) return [[n, 1]]; if (!q.m && q.n !== q.b && q.n !== 'Floette-Eternal') return [[n, 1]];
    const fam = ROSTER.filter(f => f.b === q.b && (f.n === q.n || f.m));
    for (const U of [smogon, tourU]) { const tot = fam.reduce((a, f) => a + (U[f.n] || 0), 0); if (tot > 0) return fam.filter(f => (U[f.n] || 0) > 0).map(f => [f.n, (U[f.n] || 0) / tot]); }
    return [[n, 1]]; };
  const ladder = {}; for (const r of (raw.ladder && raw.ladder.rows) || []) { if (!Array.isArray(r)) continue; const n = srcName(r[0]); if (!n) continue; const v = [num(r[1]), num(r[2]), num(r[3])]; if (!v.every(isFinite)) continue;
    for (const [k, sh] of formsOf(n)) { const o = ladder[k]; ladder[k] = o ? [+(o[0] + v[0] * sh).toFixed(2), o[1], o[2]] : [+(v[0] * sh).toFixed(2), v[1], v[2]]; } }
  // in-game ranked doubles (op.gg): a full rank order, no percentages. Turn rank r into a usage figure by giving it the r-th
  // biggest usage on the 1760+ ladder (same shape of curve), then hand base names to the form strong players use.
  const ingame = {}, ig = opggNames(raw.ingame && raw.ingame.names), curve = Object.values(smogon).sort((a, b) => b - a);
  const igSeen = new Set(); ig.forEach((n, i) => { if (!n || igSeen.has(n)) return; igSeen.add(n); const v = curve.length ? (curve[i] != null ? curve[i] : curve[curve.length - 1] * Math.pow(.97, i - curve.length + 1)) : 0;
    for (const [k, sh] of formsOf(n)) ingame[k] = (ingame[k] || 0) + v * sh; });
  const out = {updated: raw.updated || '', doubles: pz(raw.tour && raw.tour.rows, raw.tour && raw.tour.megas, !!(raw.tour && raw.tour.split)), official: pz(raw.official && raw.official.rows, raw.official && raw.official.megas),
    adj: (() => { const D = {}; for (const r of (raw.adj && raw.adj.rows) || []) { if (!Array.isArray(r)) continue; const n = srcName(r[0]); const b = num(r[1]), g = num(r[2]); if (!n || !isFinite(b) || !isFinite(g)) continue;
      const t = num(r[3]) || 0, w = isFinite(num(r[4])) ? num(r[4]) : null, o = D[n];
      // two rows for one Pokémon ("Floette|M" and "Eternal Flower Floette|M"): weighted merge by games
      D[n] = !o ? [b, g, t, w] : [+((o[0] * o[1] + b * g) / (o[1] + g || 1)).toFixed(3), o[1] + g, o[2] + t, o[3] == null || w == null ? (o[3] ?? w) : +((o[3] * o[1] + w * g) / (o[1] + g || 1)).toFixed(1)]; } return D; })(),
    ladder, smogon, prd, ingame, ingameRank: (() => { const R = {}; ig.forEach((n, i) => { if (n) for (const [k] of formsOf(n)) if (!R[k]) R[k] = i + 1; }); return R; })(), ingameTotal: ig.length, prdTeams: raw.prd && raw.prd.teams,
    sources: {tour: raw.tour && raw.tour.label, official: raw.official && raw.official.label, ladder: raw.ladder && raw.ladder.label, smogon: raw.smogon && raw.smogon.label, prd: raw.prd && raw.prd.label, adj: raw.adj && raw.adj.label, ingame: raw.ingame && raw.ingame.label}};
  return Object.keys(out.doubles).length >= 20 ? out : null;
}
// The performance data in use: today's refresh (meta/perf) if it's usable, otherwise the snapshot built into the page.
let perfCache = {key: null, val: null};
function activePerf() { const key = metaVersion; if (perfCache.key === key) return perfCache.val;
  // the daily refresh doesn't fetch op.gg yet: borrow the built-in in-game ranking when today's data lacks it
  let v = null; try { let raw = META.perf; if (raw && typeof PERF_RAW === 'object') { const add = {}; for (const k of ['tour', 'official', 'ladder', 'smogon', 'prd', 'ingame', 'adj']) if (!raw[k] && PERF_RAW[k]) add[k] = PERF_RAW[k]; if (Object.keys(add).length) raw = Object.assign({}, raw, add); } v = raw ? perfFromRaw(raw) : null; } catch (e) { v = null; }
  if (!v) { try { v = typeof PERF_RAW === 'object' ? perfFromRaw(PERF_RAW) : null; } catch (e) { v = null; } }
  perfCache = {key, val: v}; return v; }

