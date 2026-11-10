/* ===== Two kinds of suggestions (focus plan Part 3, f3-lanes / f3-none, Nov 10) =====
   Measured before writing a line (Sim: honest numbers that still feel like real upgrades):
   - Real problems are big. On 10,575 real team sheets and 38,513 games, player skill taken out (experiments/lane-fixes.mjs):
     no Mega −23 win-chance points (−37 to −16); Protect on 0-1 of the six −15 (−21 to −10), on 2 −4 (−8 to −2), vs the usual 3.
     Ready for the top threats +3.5 (2.4 to 4.7, checks-real.mjs). Choice Scarf on a Trick Room team: no measurable harm (+0.9,
     −0.9 to +2.7), so it is not pushed as a fix.
   - Plain swaps are small. On real one-swap pairs judged on games the evidence never saw (experiments/lane-test.mjs), the model's
     value gap picks the better six 55% (57% when the gap is 4+ points) and really delivers about 0.35 of what it promises; the
     six's own record picks 50%, a coin flip, so real teams' records can't back a swap on their own.
   So: a FIX repairs a real problem and says what that problem costs in real games; a SWAP is shown only when the model's gain is
   4+ win-chance points, and says about a third of it, the size real swaps deliver; anything else is an OPTION (kept for the
   team checks and game-plan notes, said plainly that real games show no clear edge). No fix and no swap: "Nothing to fix". */
const LANE = {
  PTS: {mega: 23, prot1: 15, prot2: 4, reach: 3.5}, // win-chance points at an even game (see above)
  SWAP_PTS: 4,  // the model gain a plain swap needs (lane-test.mjs: picks the better real six 57.3% at 4+)
  REAL: .35,    // what a model-picked swap really delivers per point it promises (lane-test.mjs slope)
  PROT: new Set(['Protect', 'Detect', 'Spiky Shield', "King's Shield", 'Baneful Bunker', 'Silk Trap', 'Burning Bulwark', 'Obstruct']),
  // the moves a member really runs: its own (custom) moves, else its popular set
  moves(m) { const mv = m && m.moves && m.moves.length ? m.moves : m && m.p ? popularMoves(m.p) : []; return (mv || []).map(x => x && (x.name || x)).filter(Boolean); },
  protCount(ms) { return ms.filter(m => LANE.moves(m).slice(0, 4).some(n => LANE.PROT.has(n))).length; },
  // win-chance points the Strength Score promises for a plan (the score is win chance against today's tournament teams)
  gain(pl, g0) { const g1 = typeof planGrade === 'function' ? planGrade(pl) : null; if (g0 == null || g1 == null) return null; const a = CH.eOfS(g0), b = CH.eOfS(g1); return a == null || b == null ? null : b - a; },
  of(pl, ms, g0) { if (pl._lane) return pl._lane; const fixes = [];
    try { if (itemClash(pl.team).length < itemClash(ms).length) fixes.push({k: 'clause'}); } catch (e) {}
    if (pl.team.length === 6 && !ms.some(m => m.mega) && pl.team.some(m => m.mega)) fixes.push({k: 'mega', pts: LANE.PTS.mega});
    try { const r = t => ((proChecks(t, true) || {items: []}).items.find(x => x.k === 'reach') || {}).ok; if (pl.team.length === 6 && r(ms) === false && r(pl.team)) fixes.push({k: 'reach', pts: LANE.PTS.reach}); } catch (e) {}
    const gain = LANE.gain(pl, g0);
    return pl._lane = fixes.length ? {k: 'fix', fixes, gain} : gain != null && gain >= LANE.SWAP_PTS ? {k: 'swap', gain, real: Math.max(1, Math.round(gain * LANE.REAL))} : {k: 'option', gain}; },
  // after the planner: fixes first, then swaps that clear the bar, then options that cover a check or note; plain swaps below the
  // bar move to the front of More ideas (still one tap away, never removed)
  apply(out, ms, g0) { if (!out || !ms || ms.length !== 6) return out; const keep = [], moved = [];
    for (const pl of out) { const L = LANE.of(pl, ms, g0); const forced = pl.gap && ((pl.gap.fix && pl.gap.fix.length) || (pl.gap.why || []).some(w => /^Meets the /.test(w)));
      if (L.k === 'fix' || L.k === 'swap' || forced) keep.push(pl); else moved.push(pl); }
    const rank = pl => pl._lane.k === 'fix' ? 0 : pl._lane.k === 'swap' ? 1 : 2; keep.sort((a, b) => rank(a) - rank(b));
    out.length = 0; out.push(...keep); if (Array.isArray(out.more)) out.more.unshift(...moved.filter(pl => !out.more.includes(pl)));
    out.nothing = !keep.some(pl => pl._lane.k !== 'option') && !LANE.protFix(ms); return out; },
  // the line under a suggestion: what kind it is, and its honest size in real games
  line(pl) { const L = pl && pl._lane; if (!L) return '';
    if (L.k === 'fix') { const f = L.fixes[0], w = {clause: 'two of your Pokémon hold the same item, so the team can’t be registered; this frees it',
        mega: `adds a Mega: teams with no Mega won about ${L.fixes[0].pts} fewer games in 100`, reach: `makes the team ready for the top threats: teams that are win about ${Math.round(LANE.PTS.reach)} more in 100`}[f.k];
      return `<span class="chlane fix"><b>Fix</b> ${w}</span>`; }
    if (L.k === 'swap') return `<span class="chlane swap"><b>Small edge</b> about ${L.real} more win${L.real === 1 ? "" : "s"} in 100 games in real play</span>`;
    return `<span class="chlane opt"><b>Option</b> covers a team note; real games show no clear edge either way</span>`; },
  // too little Protect: a set fix, not a swap. Members whose popular set runs Protect but whose moves here don't.
  protFix(ms) { if (!ms || ms.length !== 6) return null; const n = LANE.protCount(ms); if (n > 2) return null;
    const who = ms.filter(m => !LANE.moves(m).slice(0, 4).some(x => LANE.PROT.has(x)) && (popularMoves(m.p) || []).slice(0, 4).some(x => LANE.PROT.has(x && (x.name || x))));
    return who.length ? {n, who: who.slice(0, 3 - n), pts: n <= 1 ? LANE.PTS.prot1 : LANE.PTS.prot2} : null; },
  protCard(ms) { const f = LANE.protFix(ms); if (!f) return '';
    return `<div class="chlanecard fix"><p><span class="chlane fix"><b>Fix</b> only ${f.n} of your six run${f.n === 1 ? 's' : ''} Protect: teams with ${f.n <= 1 ? 'one or none' : 'two'} won about ${f.pts} fewer games in 100 than teams with three</span></p>
      <p class="t2">Their usual sets run it: ${f.who.map(m => `<b>${esc(m.d)}</b>`).join(' and ')}.</p><button type="button" class="chghost" data-protfix>Add Protect</button></div>`; },
  // the move swapped out for Protect: the one its popular set runs least (else the last one)
  protApply(ms) { const f = LANE.protFix(ms); if (!f) return; for (const m of f.who) { const s = S.slots[m.i]; if (!s) continue;
      const pop = (popularMoves(m.p) || []).map(x => x && (x.name || x)), cur = LANE.moves(m).slice(0, 4); while (cur.length < 4) cur.push('');
      let j = -1, worst = -1; cur.forEach((n, k) => { const r = n ? pop.indexOf(n) : 99; const rr = r < 0 ? 98 : r; if (rr > worst) { worst = rr; j = k; } });
      if (j < 0) j = 3; cur[j] = 'Protect'; s.mv = s.mv || {}; s.mv[S.format] = cur; }
    persist(); render(); try { toast('Protect added: it’s in each set now, change it any time', true); } catch (e) {} },
  // nothing to fix: say so, and point to where this team still has a measured edge
  noneCard() { return `<div class="chlanecard none"><p><b>Nothing to fix.</b> Your team has every basic and no swap clearly beats it in real games.</p>
    <p class="t2">Your edge now comes from how you play it: plan each matchup in Battle, and tune your sets.</p>
    <div class="chlanebtns"><button type="button" class="chghost" data-view="matchup">Battle</button><button type="button" class="chghost" data-view="sets">Sets</button></div></div>`; }
};
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-protfix]'); if (!b) return; try { LANE.protApply(members()); } catch (x) {} });
