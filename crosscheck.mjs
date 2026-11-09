// Daily cross-check (after perf.mjs): our numbers next to independent sites' numbers for the same thing, so a scraping or
// mapping mistake on our side shows up as a disagreement. Writes out/crosscheck.json; health.mjs prints the summary.
// For each comparison: the 40 most used Pokémon (by our number), ours vs theirs, the difference, and flags when they
// disagree beyond the tolerance. Tolerances allow for the known, legitimate differences listed in each check's "known":
//  - windows: Pikalytics covers about the last 2 weeks of tournaments; our meta_tour the last 4 weeks
//  - samples: Pikalytics applies its own minimum event size; Pokémon Zone (not read: it refuses automated requests)
//  - ladders: Smogon is one calendar month at a rating cut; Showdowntier the last 14 days, all ratings
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
// sets per species with every form counted together, each weighted by its usage (the way the official team sheets count:
// Garchomp's top item there is Garchompite Z because Mega Garchomp Z and plain Garchomp are one species; Nov 7)
const setsOfAll = M => { const A = {}; for (const r of metaRows(M)) { const k = spec(r.n), u = r.u || 0, o = A[k] = A[k] || {u: 0, it: {}, mv: {}}; o.u += u;
    for (const [x, pc] of r.it || []) o.it[x] = (o.it[x] || 0) + u * pc; for (const [x, pc] of r.mv || []) o.mv[x] = (o.mv[x] || 0) + u * pc; }
  const rank = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([x]) => x);
  return Object.fromEntries(Object.entries(A).map(([k, o]) => [k, {u: o.u, it: rank(o.it), mv: rank(o.mv)}])); };
const setsOf = M => { const D = {}; for (const r of metaRows(M)) { const k = spec(r.n), u = r.u || 0; if (!D[k] || u > D[k].u) D[k] = {u, it: (r.it || []).map(x => x[0]), mv: (r.mv || []).map(x => x[0])}; } return D; };
const lc = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const checks = [];
/* infoOnly (Nov 9): two sources that measure different player groups can't agree by design; reported as information, never as a
   daily warning (a warning that always fires teaches everyone to ignore warnings) */
function compare({id, ours, theirs, oursName, theirsName, known, tolU = [3, .25], tolW = null, sets = null, top = 40, form = false, infoOnly = false}) {
  if (!ours || !theirs || !Object.keys(ours).length || !Object.keys(theirs).length) { checks.push({id, skipped: !theirs ? `${theirsName}: not fetched today` : `${oursName}: missing`}); return; }
  // win rates are compared as the gap to each source's own average over these rows (some sites count finishers' match
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
  checks.push({id, ours: oursName, theirs: theirsName, known, infoOnly, per: form ? 'form' : 'species', tolerance: {usage: `max(${tolU[0]} points, ${tolU[1] * 100}% of the larger)`, win: tolW == null ? null : `${tolW} points, each measured from its own source's average (300+ games)`}, winAverage: tolW == null ? null : {ours: mO && +mO.toFixed(1), theirs: mT && +mT.toFixed(1)},
    rows, missingHere: extra, flagged: rows.filter(r => r.flags.length).length, staplesFlagged: rows.filter(r => r.flags.length && staples.has(r.n)).map(r => `${r.n} (${r.flags.join(', ')})`)}); }
// a source's rows per species: usage adds up over forms (sites that split Megas out list the plain form without its
// Mega users); win rate weighted by games
const fromSrc = rows => bySpecies((rows || []).map(r => [r.n, r.u, r.wr != null ? r.wr : r.w != null ? r.w : null, r.g || r.m || (r.wr != null || r.w != null ? 1 : 0)]));
// per species, the set of the form most players use (rows give each form's usage)
const bestForm = (sets, rows) => { const U = Object.fromEntries((rows || []).map(r => [r.n, r.u])), D = {}, best = {};
  for (const [k, v] of Object.entries(sets || {})) { const s = spec(k), u = U[k] != null ? U[k] : 0; if (!D[s] || u > best[s]) { D[s] = v; best[s] = u; } } return D; };
const mtSp = MT ? bySpecies(metaRows(MT).map(r => [r.n, r.u, r.w, r.teams])) : null;
// 2. Recent tournaments + sets: our last-4-weeks team sheets vs Pikalytics (tournaments, about the last 2 weeks)
compare({id: 'tour-vs-pikalytics', ours: mtSp, theirs: S.pika && fromSrc(S.pika.rows), oursName: MT && MT.source, theirsName: S.pika && `Pikalytics Reg M-C (${S.pika.scope || 'recent tournaments'})`,
  known: 'Same population: both are Limitless tournament team sheets (Pikalytics championstournaments since Nov 8; before that this compared against its Showdown ladder stats by mistake). Checked Nov 8 on the top 39: top item agrees 39/39, top Ability 39/39, the same top-4 moves 37/39 (Indeedee: Pikalytics merges both forms; Annihilape: its 2nd-4th moves are near-tied). Small gaps come from different time windows. Its usage table names species while its core lists name Megas, so Mega species are not comparable',
  tolU: [6, .45], tolW: 4, sets: S.pika && {ours: setsOf(MT), theirs: bestForm(S.pika.sets, S.pika.rows)}});
// 3. (Removed Nov 9) Limitless vs the official events' whole field: it read RK9 data, retired Nov 1 (RK9 terms), and was
//    skipped every day after that without anyone noticing. Check 5 (official top-64 team sheets, Victory Road) covers official events.
// 4. Ladder usage: Smogon 1760+ (monthly) vs Showdowntier (14 days)
const smSp = P.smogon ? bySpecies(P.smogon.rows) : null;
compare({id: 'smogon1760-vs-showdowntier', ours: smSp, theirs: S.sdt && fromSrc(S.sdt.rows), oursName: P.smogon && P.smogon.label, theirsName: S.sdt && `Showdowntier (${S.sdt.from} – ${S.sdt.to}, all ratings)`,
  known: 'Showdowntier counts every rated battle (average player about 1290); Smogon 1760+ is the strong end of the ladder for a past month. Large gaps are expected for Pokémon strong players favour or avoid.', tolU: [5, .4], infoOnly: true});
// 5. Our own two set sources against each other: Limitless sheets vs the official events' top 64 open team sheets
//    (Victory Road + VR Pastes; top item and moves)
if (MT && OF) { const T = {}; for (const e of OF.events || []) for (const t of e.teams || []) for (const m of t.mons || []) { const k = spec(m.n), o = T[k] = T[k] || {c: 0, it: {}, mv: {}}; o.c++; if (m.i) o.it[m.i] = (o.it[m.i] || 0) + 1; for (const v of m.mv || []) o.mv[v] = (o.mv[v] || 0) + 1; }
  const N = (OF.events || []).reduce((a, e) => a + (e.teams || []).length, 0) || 1, top = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
  const theirs = Object.fromEntries(Object.entries(T).map(([k, o]) => [k, {u: +(100 * o.c / N).toFixed(1)}])), sets = Object.fromEntries(Object.entries(T).filter(([, o]) => o.c >= 15).map(([k, o]) => [k, {it: top(o.it).slice(0, 3).map(([a, b]) => [a, +(100 * b / o.c).toFixed(1)]), mv: top(o.mv).slice(0, 6).map(([a, b]) => [a, +(100 * b / o.c).toFixed(1)])}]));
  compare({id: 'tour-sets-vs-official-top64', ours: mtSp, theirs, oursName: MT.source, theirsName: `${OF.source || 'Official events'} (${N} teams)`,
    known: 'Usage is not comparable (top 64 of big events vs every Limitless team), so only sets are judged: the top item and top move should agree for staples. Both sides count every form of a species together (Mega and plain), as the team sheets do.', tolU: [100, 1], sets: {ours: setsOfAll(MT), theirs: sets}}); }
// 6. Official events: Victory Road's standings and team sheets against Liquipedia (placements, player count, start date)
//    and against Victory Road's own event page (the six Pokémon on the page vs the team sheet). official.mjs does the
//    work and stores it in out/official.json "checks"; here each event is one row.
if (OF && Array.isArray(OF.checks)) { const rows = OF.checks.map(c => ({n: c.event, ours: c.teams, theirs: c.liquipedia && c.liquipedia.placed != null ? c.liquipedia.agree + '/' + c.liquipedia.placed : null, flags: c.flags.slice(0, 12), note: typeof c.liquipedia === 'string' ? c.liquipedia : undefined}));
  checks.push({id: 'official-vs-liquipedia', ours: OF.source, theirs: 'Liquipedia (MediaWiki API; CC-BY-SA 3.0) and Victory Road event pages', known: 'Liquipedia lists placements in ranges (9-16, 17-32 ...) and only top cut by bracket; names are matched loosely (Victory Road prints first name + one surname). Player counts differ by a few between sites (late drops).', per: 'event',
    rows, missingHere: [], flagged: rows.filter(r => r.flags.length).length, staplesFlagged: rows.filter(r => r.flags.some(f => /Liquipedia places|start date/.test(f))).map(r => `${r.n} (${r.flags.filter(f => /Liquipedia places|start date/.test(f)).length} placement/date)`)}); }
const out = {updated: new Date().toISOString(), checks};
fs.writeFileSync('out/crosscheck.json', JSON.stringify(out));
// Nov 9 (no silent failures): a cross-check that couldn't run is recorded like a skipped daily step (skip.mjs -> out/skips.json),
// so health.mjs raises the "Daily data problem" alarm when the same one is skipped two days in a row. (The RK9-based check
// was skipped every day for 8+ days and only ever printed one quiet line.)
{ const {execFileSync} = await import('node:child_process'); for (const c of checks) if (c.skipped) { try { execFileSync('node', ['skip.mjs', `cross-check ${c.id} skipped (${c.skipped})`], {stdio: 'inherit'}); } catch (e) {} } }
for (const c of checks) console.log(c.skipped ? `crosscheck ${c.id}: skipped (${c.skipped})` : `crosscheck ${c.id}: ${c.flagged}/${c.rows.length} differ beyond tolerance${c.staplesFlagged.length ? '; staples: ' + c.staplesFlagged.join(', ') : ''}`);
