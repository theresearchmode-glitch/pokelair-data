// ---------- the Pokémon info sheet's working-out (R4, Nov 11; shared with the new build) ----------
// Today's sheet (lairSheet, 25-ratings-page.js) draws from these; the new build's sheet draws from the same ones.
// What the data says: one row per source, [label, value, note] (value and note may hold winSpan / pctFmt markup)
function lairEvidence(p) { const r = rating(p), src = r.src || {}, pf0 = activePerf(), ev = [];
    const pt = pilotFor(p); if (pt) ev.push(['Same players test', `${winSpan(pt.w)} wins with it · ${pctFmt(pt.wo)} without`, `the same ${pt.players.toLocaleString()} players: ${pt.g.toLocaleString()} games with it, ${pt.go.toLocaleString()} without. ${pt.d >= 3 ? 'A big gap: the Pokémon itself is winning games' : pt.d >= 1 ? 'Wins a little more than these players usually do' : pt.d > -1 ? 'About the same: these players win as often without it' : 'These players do better without it'}`]);
    // (the model-based "own share of team wins / win chance" row was removed Oct 28 with the other win predictions)
    { const bl = typeof bringLead === 'function' ? bringLead(p) : null; if (bl) ev.push(['Team preview (Showdown replays)', `brought ${pctFmt(bl.b)} · led ${pctFmt(bl.l)} of games`, `when it's on the team · ${bl.g.toLocaleString('en-US')} games${bl.forms ? ' · all forms' : ''}${bl.g < 300 ? ' · few games' : ''} · shown, not scored yet`]); }
    // every row says how recent its numbers are, in one format ("Oct 30", "Sep 2026")
    const dt = k => { const d = pf0 && pf0.dates && pf0.dates[k]; return d ? ' · ' + perfDateText(d) : ''; };
    if (src.tour) ev.push(['Limitless tournaments', `${pctFmt(src.tour[0])} of teams`, `${winSpan(src.tour[1])} wins · ${src.tour[2].toLocaleString()} games${dt('tour')}`]);
    if (src.official) ev.push(['Official VGC events', `${pctFmt(src.official[0])} of teams`, `${pctFmt(src.official[1])} of matches won · ${src.official[2].toLocaleString()} matches · whole field${pf0 && pf0.frozenOfficial ? ` · RK9, read before Nov 1 · frozen, newest event${dt('official').replace(' ·', '')}` : dt('official')}`]);
    const fam = ROSTER.some(q => q.m && q.b === p.b), spn = ((byName.get(p.b) || ROSTER.find(q => q.b === p.b && !q.m) || p).d || '').replace(/\s*\(.*\)$/, '').replace(/^Mega /, ''); // Floette has no plain entry (only Eternal and Mega)
    if (src.ingame != null) ev.push(['In-game Ranked Doubles', `#${src.ingame} most used`, `op.gg${pf0 && pf0.season ? ', season ' + esc(pf0.season) : ''}${fam ? ` · ${esc(spn)}, all forms (shared by form)` : ''}${dt('ingame')}`]);
    if (src.smogon != null) ev.push(['Showdown 1760+', `${pctFmt(src.smogon)} of teams`, `Smogon usage stats${dt('smogon')}`]);
    if (src.ladder) ev.push(['Showdown ladder', `${pctFmt(src.ladder[0])} of teams`, `${winSpan(src.ladder[1])} wins · avg player ${src.ladder[2]}${fam ? ` · ${esc(spn)} total, shared by form` : ''} · Showdowntier, 14 days${dt('ladder')}`]);
  return ev; }
// Why it rates N: the bars, [label, value 0-100 or null, note], in the order the sheet shows them. Which bars depends on
// what the rating is built from: tournament top cuts (r.parts and r.tc), a win model (r.win), or results + profile.
function lairBars(p) { const r = rating(p);
  if (r.parts && r.tc) return [['Top-cut presence', r.parts.top, `on ${pctFmt(r.tc.top)} of top-cut teams`], ['Picked by strong players', r.parts.rw, `on ${pctFmt(r.tc.rw)} of teams, strong players counted more`],
    ...(r.parts.lift != null ? [['Converts to top cut', r.parts.lift, `${Math.abs(r.tc.lift - 1) < .005 ? 'makes top cut as often as' : `makes top cut ${Math.round(Math.abs(r.tc.lift - 1) * 100)}% ${r.tc.lift > 1 ? 'more' : 'less'} often than`} its usage predicts`]] : []),
    ['Win rate', r.parts.wr, r.tc.g < 30 ? `only ${Math.round(r.tc.g)} games so far` : `${winFmt(r.tc.wr)} wins, recent games weighted${r.tc.g < 800 ? ' · few games' : ''}`]];
  if (!r.tc && r.parts === null) return [];
  if (r.win != null) return [['Winning', r.win, r.conf < .4 ? 'few games' : ''], ['Picked by strong players', r.popAll], ['Stats & typing', r.intrinsic]];
  return [['Real results', r.evidence, r.conf < .4 ? 'small sample' : ''], ['Power', r.power], ['Typing', r.typing], ['Tools', r.tools]]; }
// Typical set: the nature(s) and stat points most players run (Sim, Nov 6)
function lairSetBits(p) { let na = null, cs = null; try { const st = setFor(p); na = st.na && st.na.length ? st.na.slice(0, 2).map(x => x[0]) : null; } catch (e) {} try { cs = commonSpread(p); } catch (e) {}
  if (!na && cs && cs.nat) na = [cs.nat];
  // Sim, Nov 13 (Natures Q1 B): the nature shown first is the complete spread's, so it matches the points beside it (w); the next most run follows
  if (cs && cs.nat && na) na = [cs.nat, ...na.filter(x => x !== cs.nat)].slice(0, 2); const L = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'], K = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const w = cs ? K.map((k, j) => [cs[k], L[j]]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).map(x => `${x[0]}\u00a0${x[1]}`).join(', ') : '';
  return {na, w}; }

// ---------- ratings: tiers, rank and range (moved from 25-ratings-page.js, Nov 11) ----------
const LTIERS = [{k: 'S', min: 80, show: 90, c: '#ffb400', d: 'Top of the format'}, {k: 'A', min: 70, show: 80, c: '#ff6a3d', d: 'Strong, proven picks'}, {k: 'B', min: 60, show: 70, c: '#b45cff', d: 'Solid with the right team'},
  {k: 'C', min: 50, show: 60, c: '#2f9bff', d: 'Niche or team-dependent'}, {k: 'D', min: 35, show: 50, c: '#22b58a', d: 'Needs a specific plan'}, {k: 'F', min: 0, show: 1, c: '#8a90a6', d: 'Rarely worth a slot'}];
const lTier = t => LTIERS.find(x => t >= x.min) || LTIERS[LTIERS.length - 1];
function lairRows() { const R = ratings();
  return ROSTER.map(p => ({p, r: R.get(p.n)})).filter(x => x.r).sort((a, b) => b.r.total - a.r.total || a.p.d.localeCompare(b.p.d)); }
/* Rank next to the score (Nov 2): position among the Pokémon WITH results (a placeholder rating has no rank); ties share
   a rank (1 + how many rate strictly higher). Cached per ratings map. */
let lairRankCache = {R: null, m: null, of: 0};
function lairRank(p) { if (!p) return null; const R = ratings(); if (lairRankCache.R !== R) { const xs = lairRows().filter(x => x.r.tc), m = new Map();
    xs.forEach((x, i) => m.set(x.p.n, i && xs[i - 1].r.total === x.r.total ? m.get(xs[i - 1].p.n) : i + 1)); lairRankCache = {R, m, of: xs.length}; }
  const k = lairRankCache.m.get(p.n); return k ? {rank: k, of: lairRankCache.of} : null; }
/* what the N in "of N" counts (Sim, Nov 4): the long form says it in full, 'cap' is the short form for tight spots,
   short (1) is just "#20"; '' when it has no results yet */
const rankTxt = (p, short) => { const k = lairRank(p); return k ? (short === 'cap' ? `#${k.rank} of ${k.of} with results` : short ? `#${k.rank}` : `#${k.rank} of ${k.of} Pokémon with tournament results`) : ''; };
/* the range in words, on the shown scale: "likely 80–88" (never "±4") */
const rRange = r => { const a = RS(Math.max(1, r.total - (r.band || 0))), b = RS(Math.min(99, r.total + (r.band || 0))); return a === b ? `likely ${a}` : `likely ${a}–${b}`; };
/* a tier's shown band in words: "90+", ..., "under 50" */
const tierBand = T => T.k === 'F' ? `under ${LTIERS[LTIERS.length - 2].show}` : `${T.show}+`;
// the same players test (moved from 52-sleepers.js, Nov 11)
function pilotFor(p) { const P = META.model && META.model.pilot, v = P && P[p.n]; if (!Array.isArray(v) || v.length < 5) return null;
  const [g, w, go, wo, players] = v.map(Number); if (![g, w, go, wo, players].every(isFinite)) return null;
  return {g, w, go, wo, players, d: +(w - wo).toFixed(1), dShrunk: (w - wo) * g / (g + 500)}; }

// ---------- the info sheet's Info tab: pure helpers (moved from 67-sheet-tabs.js as SHT.*, which LST takes on; Nov 11) ----------
const SHT = {};
/* stat bar colours by value: cool for low, green for high, magenta for exceptional (never red: red is for opponents) */
SHT.stCol = v => v >= 150 ? '#E048C8' : v >= 120 ? '#3FB618' : v >= 100 ? '#12B5A4' : v >= 80 ? '#2F9BFF' : v >= 50 ? '#5B6BF5' : '#9B6CFF';
SHT.baseForm = p => { if (!p || !p.m) return null; const b = byName.get(p.b); return b && !b.m ? b : ROSTER.find(q => q.b === p.b && !q.m) || null; };
SHT.abDesc = a => (typeof ABIL === 'object' && ABIL[a] ? String(ABIL[a]).replace(/Pokemon/g, 'Pokémon') : '');
/* type effectiveness in words (the Type chart page uses the same groups) */
SHT.word = x => x === 0 ? 'no damage' : x === .25 ? '¼ damage' : x === .5 ? '½ damage' : x === 1 ? 'normal damage' : x === 1.25 ? 'a quarter more damage' : x === 2 ? '2× damage' : x === 4 ? '4× damage' : x + '× damage';
/* the matchups of p's typing, and what each ability it can have changes (ABILITY_MODS in engine/types.js, the same table
   the team checks and the Type chart use) */
SHT.matchups = p => { const g = {q: [], d: [], h: [], qr: [], z: []}, abs = [...new Set(p.a)], only = abs.length === 1 && ABILITY_MODS[abs[0]] ? abs[0] : null;
  /* with only one possible ability (every Mega, Rotom's Levitate ...) the lists already count it; otherwise they are for the typing alone */
  for (const atk of TYPES) { const x = mult(atk, p.t, only, !!only); (x === 0 ? g.z : x >= 4 ? g.q : x >= 2 ? g.d : x <= .25 ? g.qr : x <= .5 ? g.h : []).push(atk); }
  const ab = [...new Set(p.a)].filter(a => ABILITY_MODS[a]).map(a => ({a, ch: TYPES.filter(t => mult(t, p.t, a, true) !== mult(t, p.t, null, false)).map(t => ({t, raw: mult(t, p.t, null, false), x: mult(t, p.t, a, true)}))})).filter(o => o.ch.length);
  return {g, ab, only}; };
/* Speed at level 50 from the app's own Champions maths (39-damage-calc-speed.js): calcStat = floor((base + 20 + points) × nature),
   spdCalc for Scarf / Tailwind / weather abilities, likelySpeed for what players run, outspeedOf for "outspeeds X% of the top 30" */
SHT.speeds = p => { const rows = [], os = (v, tr) => { try { return outspeedOf(v, '', {tr: !!tr}); } catch (e) { return null; } };
  const maxN = calcStat(p, 'Spe', 32, 1.1);
  try { const s = likelySpeed(p, null), ab = abilityOf({p}), v = spdCalc(s.v, s.scarf, ab, '', {});
    rows.push({k: 'run', l: 'What players run', v, note: s.label.replace(/^./, c => c.toUpperCase()) + (s.scarf ? ', Choice Scarf' : ''), os: os(v), main: true}); } catch (e) {}
  rows.push({k: 'none', l: 'No Speed points', v: calcStat(p, 'Spe', 0, 1), note: 'neutral nature'});
  rows.push({k: 'max', l: 'Max Speed points', v: calcStat(p, 'Spe', 32, 1), note: '32 points, neutral nature'});
  rows.push({k: 'maxn', l: 'Max + Speed nature', v: maxN, note: '32 points, Speed-boosting nature (Timid, Jolly…)'});
  if (!p.m) rows.push({k: 'scarf', l: 'Choice Scarf', v: spdCalc(maxN, true, '', '', {}), note: 'max + Speed nature'});
  rows.push({k: 'tw', l: 'In Tailwind', v: spdCalc(maxN, false, '', '', {tw: true}), note: 'max + Speed nature, Speed doubled'});
  const WX = {sun: 'sun', rain: 'rain', sand: 'sand', snow: 'snow'};
  for (const a of [...new Set(p.a)]) { const w = typeof WEATHER_SPD_AB === 'object' && WEATHER_SPD_AB[a]; if (w) rows.push({k: 'wx', l: `${a} in ${WX[w] || w}`, v: spdCalc(maxN, false, a, w, {}), note: 'max + Speed nature, Speed doubled'}); }
  rows.push({k: 'tr', l: 'Trick Room build', v: calcStat(p, 'Spe', 0, .9), note: '0 points, Speed-lowering nature', tr: true});
  /* no repeated numbers (Sim, Nov 2): when what players run equals a standard row, that row is folded into it */
  const run = rows.find(r => r.k === 'run'), dup = run && rows.find(r => r !== run && !r.tr && r.k !== 'wx' && r.k !== 'tw' && r.v === run.v);
  if (dup) { run.note += ` · same as ${dup.l.replace(/^./, c => c.toLowerCase())}`; rows.splice(rows.indexOf(dup), 1); }
  for (const r of rows) if (r.os === undefined) r.os = os(r.v, r.tr);
  return rows; };

// ---------- the sheet's header numbers and Mega Stone line (moved from 61-concept-h-pages.js, Nov 11) ----------
// The header shows real totals, the same numbers as this Pokémon's row in the Ratings list: tournament share, wins and games
// when it has tournament games, else the rating's own top-cut figures (30+ games). thinR: few games, so "Early read".
function lairHead(p) { const r = rating(p), src = r.src || {};
  const tOK = src.tour && +src.tour[2] > 0, tcOK = !tOK && r.tc && r.tc.g >= 30, hU = tOK ? +src.tour[0] : tcOK ? r.tc.field : null, hW = tOK ? +src.tour[1] : tcOK ? r.tc.wr : null, hG = tOK ? +src.tour[2] : tcOK ? r.tc.g : null;
  const tot = tOK && RES && +RES.teams > 0 ? +RES.teams : null, thinR = (hG != null && thinFor(hG, 'rating')) || r.band >= 10;
  return {tOK, tcOK, hU, hW, hG, tot, thinR}; }
// Mega Stones: the species' Megas, the stone players pick most (for species with two, sweep Oct 31), how many hold a stone
function lairStones(p, st) { const megas = ROSTER.filter(q => q.m && q.b === p.b && q.n !== p.n), top = (st.itStones || [])[0], mg = (top && megas.find(q => stoneFor(q) === top[0])) || megas[0], stn = st.itStone || 0, rest = (st.it || []).reduce((a, [, v]) => a + (+v || 0), 0);
  return {megas, top, mg, stn, rest}; }
// a Mega's key in the Showdown replay data (brought-with): its base form (moved from 60-concept-h.js, Nov 11)
function brKeyOf(p) { return p.n === 'Floette-Mega' ? 'Floette-Eternal' : p.n.replace(/-Mega(-[XYZ])?$/, ''); }

// ---------- the regulation in force (moved from 43-data-health.js, Nov 11) ----------
const PAGE_REG = 'M-C';
function regInfo() { const r = (META.perf && META.perf.reg) || META.reg; /* META.reg: kept even when a thin first day of a new regulation fails cleanPerf (Nov 7) */ if (!r || typeof r !== 'object' || !/^[A-Z]-[A-Z]$/.test(r.id)) return null;
  const day = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) ? String(d) : '', now = r.now && typeof r.now === 'object' && /^[A-Z]-[A-Z]$/.test(r.now.id) && r.now.id !== r.id && day(r.now.since) ? r.now : null;
  return {id: r.id, since: day(r.since), now: now ? {id: now.id, since: day(now.since), events: +now.events || 0, players: +now.players || 0, need: now.need && +now.need.events > 0 ? +now.need.events : null} : null}; }
// the regulation's name (switch it here for Reg M-D) and the rules note under team checks and Import (moved from 56-about.js, R4 Nov 11)
var REG_NAME = 'Reg M-C';
function regNote(cls) { return `<p class="regnote${cls ? ' ' + cls : ''}">Based on our reading of the ${esc(REG_NAME)} rules — check the official rules before an event.</p>`; }
