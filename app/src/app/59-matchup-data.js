// ---------- Matchups: the working-out behind every Matchups view and the threat sheet (R4, Nov 11) ----------
// Moved unchanged out of the drawing code (60-concept-h.js threats10 / scouting sheet, 61-concept-h-pages.js chart,
// 08-render-all.js renderThreatCard, 18-archetypes.js renderThreats) so today's page and the new build draw the same numbers.
// Data only, no HTML. Proof that today's page is unchanged: experiments/same-matchups.mjs.

// one cell of the Top 12 grid: what one of your six does against one threat (colour plus a shape, colour-blind check Nov 1)
CH.LVC = {win: ['var(--chok)', 'answers it', '✓', 'ok'], trade: ['var(--chshaky)', 'partial answer', '~', 'part'], lose: ['var(--chbad)', 'loses 1-on-1', '✗', 'bad'], none: ['var(--line2)', 'no direct matchup', '–', 'none']};
CH.cellOf = (r, m) => { const n = m.p.n, has = a => (a || []).some(x => x.m && x.m.n === n); return has(r.solid) ? 'win' : has(r.soft) ? 'trade' : has(r.losers) ? 'lose' : 'none'; };
// the Top 12 grid's rows: the top k threats by top-cut share, worst first
CH.gridRows = (RD, k = 12) => RD.rows.slice().sort((a, b) => b.t.w - a.t.w).slice(0, k).sort((a, b) => a.level - b.level || b.t.w - a.t.w);
// Top 10: the 10 most common threats (by top-cut share), then the other 20 worst first. Nov 10 (Sim picked option 1): the
// real-games verdict leads, so "worst first" means least favoured in real games (calc breaks ties). RV: each rest row's verdict.
CH.top10 = RD => { const top = RD.rows.slice().sort((a, b) => b.t.w - a.t.w).slice(0, 10), set = new Set(top); let rest = CH.order(RD).filter(r => !set.has(r));
  const RV = new Map(rest.map(r => [r, CH.realVs(r.t.n)])); if (rest.some(r => RV.get(r))) rest = rest.slice().sort((a, b) => ((RV.get(a) || {pts: 0}).pts - (RV.get(b) || {pts: 0}).pts) || (a.level - b.level));
  return {top, rest, RV}; };
// the threat sheet: how many threats need a plan (No answer + Shaky), and up to 5 of the worst
CH.needN = RD => { const c = CH.lvCount(RD); return c[0] + c[1]; };
CH.worst5 = RD => CH.order(RD).filter(r => r.level <= 1).slice(0, 5);

// All 30, "Threat preparation": the four groups (No answer, Shaky, Handles it, Beats it), each worst-first by top-cut share
/* the group names and classes (THR_LV) live in 08-render-all.js */
function thrGroup(RD, lv) { return RD.rows.filter(r => r.level === lv).sort((x, y) => y.t.w - x.t.w); }
// the calc reasons behind one threat's verdict, as {k: 'ok'|'part'|'no'|'t2', text}, then the field and its usual set
function thrReasons(r) { const pc = x => Math.round(x * 100), L = [];
  for (const x of r.solid) L.push({k: 'ok', text: x.why}); for (const x of r.soft) L.push({k: 'part', text: x.why}); for (const x of r.warn) L.push({k: 'no', text: x.why});
  if (r.losers.length) L.push({k: 'no', text: `It beats ${r.losers.map(x => `${x.m.d} (${x.du.d.mv} ${pc(x.du.d.min)}-${pc(x.du.d.pct)}%${x.du.nT === 1 ? ', OHKO' : ', 2HKO'}${x.du.first ? '' : `, speed ${x.du.st} vs ${x.du.sm}`})`).join(', ')} 1-on-1${r.overloaded ? `: only ${r.holders} of your Pokémon hold up against it, so any 4 you bring includes at least 2 it beats` : ''}`});
  if (r.mode) L.push({k: 't2', text: `Judged by its job: ${r.mode.map(x => x.name).join(' and ')}`});
  if (!L.length) L.push({k: 'no', text: 'Nothing on the team beats it 1-on-1 or stops what it does'});
  const f = r.field || {};
  return {list: L, field: `${f.weather ? f.weather : 'no weather'}, ${f.terrain ? f.terrain + ' terrain' : 'no terrain'}`, set: r.t.moves.slice(0, 4).map(m => m.name).join(', ') + (r.t.item ? ' @ ' + r.t.item : '')}; }

// All 30, "Biggest threats": top meta Pokémon that hit several of yours super effectively or that nothing answers, most
// dangerous first (up to 8). null = no meta data yet. Each row: the threat, who it hits, who answers it, the scouting report's
// level for it (null when it is not one of the top 30) and the hardest hit it lands on your six.
function biggestThreats(ms, useA) { const d = metaDoc(); if (!d || !d.top || !d.top.length) return null;
  let RDx = null; try { RDx = prepOf(ms); } catch (e) {} const rdRow = n => { if (!RDx) return null; const b = (byName.get(n) || {}).b; return RDx.rows.find(x => x.t && x.t.n === n) || RDx.rows.find(x => x.t && (byName.get(x.t.n) || {}).b === b) || null; };
  const theirs = d.top.slice(0, 20).map(t => { const p = byName.get(t.n); return p ? oppMember(megaFormFor(p, t)) : null; }).filter(Boolean);
  const h = headToHead(ms, theirs, useA);
  return theirs.map((o, j) => { const hit = ms.map((m, i) => i).filter(i => h.def[i][j] && h.def[i][j].x >= 2);
    const ans = ms.map((m, i) => i).filter(i => h.M[i][j] >= 1);
    return {o, j, hit, ans, danger: hit.length * 2 + (ans.length ? 0 : 3) - ans.length * .5 + viability(o.p) / 50}; })
    .filter(r => r.hit.length >= 2 || !r.ans.length).sort((a, b) => b.danger - a.danger).slice(0, 8)
    .map(r => { const row = rdRow(r.o.p.n); r.name = row ? row.t.d : (byName.get(r.o.p.n) || r.o).d; r.lv = row ? row.level : null;
      r.hard = (() => { try { let b = null; ms.forEach(m => { const x = bestHitOn(r.o.p, r.o.moves || [], m.p, null, m); if (x && (!b || x.r.max / x.r.hp > b.x.r.max / b.x.r.hp)) b = {x, m}; });
        return b ? {mv: b.x.mv.name, pct: Math.round(100 * b.x.r.max / b.x.r.hp), m: b.m} : null; } catch (e) { return null; } })();
      return r; }); }

// the threat sheet's lines (moved unchanged from 60-concept-h.js, Nov 11): what's behind the Strength Score as parts that add up
// to it, and how many top threats the team handles
CH.gradeParts = (G, RD) => { const nm = G.miss ? G.miss.length : 0, chk = G.chk != null ? G.chk : G.s; return {nm, ts: chk - RD.score + CH.GMISS * nm, ra: G.s - chk}; };
CH.gradeSum = (G, RD) => { const sg = v => v < 0 ? '−' : '+';
  /* the parts in rating points (Sim, Nov 7: no tiny win-rate pieces): where its Pokémon, pairs and sets alone would rank it, what
     its matchups move, what its own games move */
  if (G.v === 2) { const a = Math.round(G.pct0), b = Math.round(G.pMu), t = Math.round(G.s), m = b - a, r = t - b;
    return `<b>Strength Score <span data-band="${G.band || String(G.letter)[0]}">${t}</span></b> = ${a} from its Pokémon, pairs and sets${m ? ` ${sg(m)} ${Math.abs(m)} for its matchups (ready for ${G.h ? G.h.x + '/' + G.h.n : ''} top threats)` : ''}${G.six && r ? ` ${sg(r)} ${Math.abs(r)} from this six's own ${G.six.g.toLocaleString('en-US')} real games (players' skill taken out)` : ''}${typeof tip === 'function' ? tip('numbers') : ''}`; }
  const {nm, ts, ra} = CH.gradeParts(G, RD);
  return `<b>Grade <span data-band="${G.band || String(G.letter)[0]}">${G.s}</span></b> = ${RD.score} ready${ts ? ` ${sg(ts)} ${Math.abs(ts)} team strength` : ''}${nm ? ` − ${CH.GMISS * nm} (${nm} missed check${nm === 1 ? '' : 's'})` : ''}${G.rec && ra ? ` ${sg(ra)} ${Math.abs(ra)} real results` : ''}${typeof tip === 'function' ? tip('numbers') : ''}`; };
CH.readyTxt = RD => { const h = CH.hand(RD); return h ? `Ready for ${h.x}/${h.n} top threats` : ''; };
CH.handTxt = (RD, short) => { const h = CH.hand(RD); return !h ? '' : short ? `handles ${h.x} of ${h.n}` : `handles ${h.x} of the top ${h.n} threats`; };
CH.LEGEND = 'Strength Score = how strong the team is altogether, from how its Pokémon, pairs and sets do in real games, its matchups against the top threats, and its own record (players\' skill taken out). 90+ Top tier · 80s Tournament ready · 70s Solid · 60s Needs work · under 60 Missing a basic.';
