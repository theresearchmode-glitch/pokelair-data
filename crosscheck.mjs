// Daily cross-check (after perf.mjs): our numbers next to independent sites' numbers for the same thing, so a scraping or
// mapping mistake on our side shows up as a disagreement. Writes out/crosscheck.json; health.mjs prints the summary.
// For each comparison: the 40 most used Pokémon (by our number), ours vs theirs, the difference, and flags when they
// disagree beyond the tolerance. Tolerances allow for the known, legitimate differences listed in each check's "known":
//  - windows: our Limitless table covers all of Reg M-C; Pikalytics about the last 2 weeks; meta_tour the last 4 weeks
//  - samples: Pokémon Zone counts tournaments with 16+ players and match (not game) records
//  - ladders: Smogon is one calendar month at a rating cut; Showdowntier the last 14 days, all ratings; project-red-data
//    the top 10% of public replays over 30 days
//  - names: sites list a species ("Charizard"); we split Megas out. Everything here is compared per species (a team can
//    hold only one of a species, so the plain form and its Megas add up exactly), except checks marked per form.
import fs from 'node:fs';
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
const S = rd('sources.json') || {}, P = rd('perf.json') || {}, MT = rd('meta_tour.json'), ML = rd('meta_ladder.json'), OF = rd('official.json');
// species key: Megas fold into their species; Floette's plain entry is Floette-Eternal
const spec = n => { const b = String(n).replace(/-Mega(-[XYZ])?$/, ''); return b === 'Floette' ? 'Floette-Eternal' : b; };
// [name, usage %, win %, games] rows -> per species {u, w, g}
function bySpecies(rows) { const D = {};
  for (const r of rows || []) { const k = spec(r[0]), o = D[k] = D[k] || {u: 0, wins: 0, g: 0}; o.u += +r[1] || 0; if (r[2] != null && r[3]) { o.wins += r[2] / 100 * r[3]; o.g += +r[3]; } }
  for (const k in D) { const o = D[k]; D[k] = {u: +o.u.toFixed(2), w: o.g ? +(100 * o.wins / o.g).toFixed(1) : null, g: Math.round(o.g)}; } return D; }
const metaRows = M => M ? [...(M.top || []), ...(M.more || [])] : [];
const setsOf = M => { const D = {}; for (const r of metaRows(M)) { const k = spec(r.n), u = r.u || 0; if (!D[k] || u > D[k].u) D[k] = {u, it: (r.it || []).map(x => x[0]), mv: (r.mv || []).map(x => x[0])}; } return D; };
const lc = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const checks = [];
function compare({id, ours, theirs, oursName, theirsName, known, tolU = [3, .25], tolW = null, sets = null, top = 40, form = false}) {
  if (!ours || !theirs || !Object.keys(ours).length || !Object.keys(theirs).length) { checks.push({id, skipped: !theirs ? `${theirsName}: not fetched today` : `${oursName}: missing`}); return; }
  // win rates are compared as the gap to each source's own average over these rows (Pokémon Zone counts finishers' match
  // records, which average well above 50%; game records of every player average about 50%)
  const avg = (D, ks) => { let a = 0, b = 0; for (const k of ks) { const o = D[k]; if (o && o.w != null && o.g) { a += o.w * o.g; b += o.g; } } return b ? a / b : null; };
  const names = Object.keys(ours).sort((a, b) => (ours[b].u || 0) - (ours[a].u || 0)).slice(0, top), rows = [], both = names.filter(n => theirs[n]), mO = avg(ours, both), mT = avg(theirs, both);
  for (const n of names) { const o = ours[n], t = theirs[n], f = [];
    const row = {n, ours: o.u, theirs: t ? t.u : null};
    if (!t) { if (o.u >= 8) f.push('missing there'); row.flags = f; rows.push(row); continue; }
    if (o.u != null && t.u != null) { row.du = +(o.u - t.u).toFixed(2); if (Math.abs(row.du) > Math.max(tolU[0], tolU[1] * Math.max(o.u, t.u))) f.push('usage'); }
    if (tolW != null && o.w != null && t.w != null && mO != null && mT != null) { row.wOurs = o.w; row.wTheirs = t.w; row.dw = +((o.w - mO) - (t.w - mT)).toFixed(1); if (Math.abs(row.dw) > tolW && Math.min(o.g || 1e9, t.g || 1e9) >= 300) f.push('win'); }
    if (sets) { const so = sets.ours[n], st = sets.theirs[n];
      if (so && st) { if (st.it && st.it[0] && so.it.length) { row.itOurs = so.it[0]; row.itTheirs = st.it[0][0] || st.it[0]; if (!so.it.slice(0, 2).map(lc).includes(lc(row.itTheirs)) && !(st.it[0][1] < 15)) f.push('item'); }
        if (st.mv && st.mv[0] && so.mv.length) { row.mvOurs = so.mv[0]; row.mvTheirs = st.mv[0][0] || st.mv[0]; if (!so.mv.slice(0, 4).map(lc).includes(lc(row.mvTheirs))) f.push('move'); } } }
    row.flags = f; rows.push(row); }
  // their top 20 that we don't have at all
  const extra = Object.keys(theirs).sort((a, b) => (theirs[b].u || 0) - (theirs[a].u || 0)).slice(0, 20).filter(n => !ours[n]).map(n => ({n, theirs: theirs[n].u}));
  const staples = new Set(names.slice(0, 12));
  checks.push({id, ours: oursName, theirs: theirsName, known, per: form ? 'form' : 'species', tolerance: {usage: `max(${tolU[0]} points, ${tolU[1] * 100}% of the larger)`, win: tolW == null ? null : `${tolW} points, each measured from its own source's average (300+ games)`}, winAverage: tolW == null ? null : {ours: mO && +mO.toFixed(1), theirs: mT && +mT.toFixed(1)},
    rows, missingHere: extra, flagged: rows.filter(r => r.flags.length).length, staplesFlagged: rows.filter(r => r.flags.length && staples.has(r.n)).map(r => `${r.n} (${r.flags.join(', ')})`)}); }
// a source's rows per species: usage adds up over forms (sites that split Megas out, like project-red-data, list the
// plain form without its Mega users); win rate weighted by games
const fromSrc = rows => bySpecies((rows || []).map(r => [r.n, r.u, r.wr != null ? r.wr : r.w != null ? r.w : null, r.g || r.m || (r.wr != null || r.w != null ? 1 : 0)]));
// per species, the set of the form most players use (rows give each form's usage)
const bestForm = (sets, rows) => { const U = Object.fromEntries((rows || []).map(r => [r.n, r.u])), D = {}, best = {};
  for (const [k, v] of Object.entries(sets || {})) { const s = spec(k), u = U[k] != null ? U[k] : 0; if (!D[s] || u > best[s]) { D[s] = v; best[s] = u; } } return D; };
const tourSp = P.tour ? bySpecies([...(P.tour.rows || []), ...(P.tour.megas || [])]) : null;
const tourForm = P.tour ? Object.fromEntries((P.tour.megas || []).map(r => [r[0], {u: r[1], w: r[2], g: r[3]}])) : null;
const mtSp = MT ? bySpecies(metaRows(MT).map(r => [r.n, r.u, r.w, r.teams])) : null;
// 1. Limitless tournaments: ours (whole Reg M-C) vs Pokémon Zone (also Limitless, whole Reg M-C)
compare({id: 'tour-vs-pokemonzone', ours: tourSp, theirs: S.pz && fromSrc(S.pz.rows), oursName: P.tour && P.tour.label, theirsName: S.pz && `Pokémon Zone tier list (${S.pz.events || '?'} Limitless tournaments, ${S.pz.date})`,
  known: 'Same underlying Limitless results. Pokémon Zone keeps tournaments with 16+ players and counts match records (we count games), so its win rates sit closer to 50% and usage can differ by a point or two.', tolW: 4});
compare({id: 'tour-megas-vs-pokemonzone', form: true, ours: tourForm, theirs: S.pzMega && Object.fromEntries(S.pzMega.rows.map(r => [r.n, {u: r.u, w: r.wr, g: r.m}])), oursName: 'Limitless Megas (per form)', theirsName: S.pzMega && `Pokémon Zone Mega tier list (${S.pzMega.date})`,
  known: 'As above, per Mega form.', tolW: 4, top: 25});
// 2. Recent tournaments + sets: our last-4-weeks team sheets vs Pikalytics (tournaments, about the last 2 weeks)
compare({id: 'tour-vs-pikalytics', ours: mtSp, theirs: S.pika && fromSrc(S.pika.rows), oursName: MT && MT.source, theirsName: S.pika && `Pikalytics Reg M-C (${S.pika.scope || 'recent tournaments'})`,
  known: 'Both are tournament team sheets, but Pikalytics covers about the last 2 weeks with its own minimum event size; ours covers 4 weeks of Limitless. A Pokémon rising or falling right now differs by window.',
  tolW: 4, sets: S.pika && {ours: setsOf(MT), theirs: bestForm(S.pika.sets, S.pika.rows)}});
// 3. Official events: our RK9 whole-field table vs Pokémon Zone's official (pokedata) list
compare({id: 'official-vs-pokemonzone', ours: P.official && bySpecies(P.official.rows), theirs: S.pzOfficial && fromSrc(S.pzOfficial.rows), oursName: P.official && P.official.label, theirsName: S.pzOfficial && `Pokémon Zone, official events data (${S.pzOfficial.date})`,
  known: 'Both from RK9 official events. Pokémon Zone may count a different set of events (it updates on its own schedule) and match records of finishers.', tolW: 4});
// 4. Ladder usage: Smogon 1760+ (monthly) vs project-red-data (top 10% of replays, 30 days) and Showdowntier (14 days)
const smSp = P.smogon ? bySpecies(P.smogon.rows) : null, mlSets = setsOf(ML);
compare({id: 'smogon1760-vs-prd', ours: smSp, theirs: S.prd && fromSrc(S.prd.rows), oursName: P.smogon && P.smogon.label, theirsName: S.prd && `project-red-data top 10% replays (${S.prd.date})`,
  known: 'Different windows (a finished calendar month vs the last 30 days) and cuts (1760+ vs the top 10% of public replays, about 1560+). Megas: project-red-data lists the species from team preview.', tolU: [4, .35]});
compare({id: 'ladder-sets-vs-prd', ours: ML ? bySpecies(metaRows(ML).map(r => [r.n, r.u])) : null, theirs: S.prd && fromSrc(S.prd.rows), oursName: ML && ML.source, theirsName: S.prd && 'project-red-data open team sheets (items, moves)',
  known: 'Sets: Smogon 1630+ for one month vs open team sheets from Bo3 and some Bo1 ladder replays. Usage differs by window and cut.', tolU: [5, .4],
  sets: S.prd && {ours: mlSets, theirs: bestForm(S.prd.sets, S.prd.rows)}});
compare({id: 'smogon1760-vs-showdowntier', ours: smSp, theirs: S.sdt && fromSrc(S.sdt.rows), oursName: P.smogon && P.smogon.label, theirsName: S.sdt && `Showdowntier (${S.sdt.from} – ${S.sdt.to}, all ratings)`,
  known: 'Showdowntier counts every rated battle (average player about 1290); Smogon 1760+ is the strong end of the ladder for a past month. Large gaps are expected for Pokémon strong players favour or avoid.', tolU: [5, .4]});
// 5. Our own two set sources against each other: Limitless sheets vs RK9 official top 64 (top item and moves)
if (MT && OF) { const T = {}; for (const e of OF.events || []) for (const t of e.teams || []) for (const m of t.mons || []) { const k = spec(m.n), o = T[k] = T[k] || {c: 0, it: {}, mv: {}}; o.c++; if (m.i) o.it[m.i] = (o.it[m.i] || 0) + 1; for (const v of m.mv || []) o.mv[v] = (o.mv[v] || 0) + 1; }
  const N = (OF.events || []).reduce((a, e) => a + (e.teams || []).length, 0) || 1, top = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
  const theirs = Object.fromEntries(Object.entries(T).map(([k, o]) => [k, {u: +(100 * o.c / N).toFixed(1)}])), sets = Object.fromEntries(Object.entries(T).filter(([, o]) => o.c >= 15).map(([k, o]) => [k, {it: top(o.it).slice(0, 3).map(([a, b]) => [a, +(100 * b / o.c).toFixed(1)]), mv: top(o.mv).slice(0, 6).map(([a, b]) => [a, +(100 * b / o.c).toFixed(1)])}]));
  compare({id: 'tour-sets-vs-rk9-top64', ours: mtSp, theirs, oursName: MT.source, theirsName: `RK9 official events, top 64 open team sheets (${N} teams)`,
    known: 'Usage is not comparable (top 64 of big events vs every Limitless team), so only sets are judged: the top item and top move should agree for staples.', tolU: [100, 1], sets: {ours: setsOf(MT), theirs: sets}}); }
const out = {updated: new Date().toISOString(), checks};
fs.writeFileSync('out/crosscheck.json', JSON.stringify(out));
for (const c of checks) console.log(c.skipped ? `crosscheck ${c.id}: skipped (${c.skipped})` : `crosscheck ${c.id}: ${c.flagged}/${c.rows.length} differ beyond tolerance${c.staplesFlagged.length ? '; staples: ' + c.staplesFlagged.join(', ') : ''}`);
