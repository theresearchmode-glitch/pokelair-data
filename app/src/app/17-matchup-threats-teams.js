// ---------- Matchup, threats, top teams, trends ----------
// Uses the page's helpers: byName, memberOf, members, popularMoves, metaAbility, bestAbility, attackEntries, hitMult,
// teamContext, isCoverage, memberMoves, megaFormFor, metaDoc, viability, teamRoles, chip, esc, S, META, ui.

// An opponent Pokémon as it's usually run: its most common ability and moves for this format.
function oppMember(p) {
  const pm = popularMoves(p);
  return {p, name: p.n, d: p.d, types: p.t, ability: metaAbility(p) || bestAbility(p), moves: pm, mega: p.m, base: p.b};
}
const fScore = x => x >= 4 ? 2 : x >= 2 ? 1 : x >= 1 ? 0 : x > 0 ? -1 : -2;
// Head-to-head numbers between two sides. off[i][j]: my i's best hit on their j. def[i][j]: their j's best hit on my i.
function headToHead(mine, theirs, useA) {
  const myCtx = teamContext(useA ? mine : []), thCtx = teamContext(useA ? theirs : []);
  const myEn = mine.map(m => attackEntries({...m, ability: useA ? m.ability : null}, memberMoves(m).moves, myCtx));
  const thEn = theirs.map(o => attackEntries({...o, ability: useA ? o.ability : null}, o.moves.some(isCoverage) ? o.moves : [], thCtx));
  const off = mine.map((m, i) => theirs.map(o => bestHit(myEn[i], o.types, useA ? o.ability : null)));
  const def = mine.map(m => theirs.map((o, j) => bestHit(thEn[j], m.types, useA ? m.ability : null)));
  // under your own Trick Room the slower Pokémon moves first; a Choice Scarf (yours as chosen, theirs as usually run) is 1.5× Speed
  const myTR = mine.some(m => (memberMoves(m).moves || []).some(x => x && x.name === 'Trick Room'));
  const spdOf = (p, mem) => { const s = likelySpeed(p); const scarf = mem ? mem.item === 'Choice Scarf' : s.scarf; return Math.floor(s.v * (scarf ? 1.5 : 1)); };
  const M = mine.map((m, i) => theirs.map((o, j) => {
    let v = fScore(off[i][j] ? off[i][j].x : 1) - fScore(def[i][j] ? def[i][j].x : 1);
    try { const dO = bestHitOn(m.p, memberMoves(m).moves, o.p, m, null), dD = bestHitOn(o.p, o.moves || [], m.p, null, m);
      const ds = b => { if (!b) return -1; const p = b.r.max / b.r.hp; return p >= 1 ? 2 : p >= .5 ? 1 : p >= .3 ? 0 : -1; };
      v = (v + ds(dO) - ds(dD)) / 2;
      const sm = spdOf(m.p, m), so = spdOf(o.p, null), first = myTR ? sm < so : sm > so, second = myTR ? sm > so : sm < so; v += first ? .25 : second ? -.25 : 0;
    } catch (e) { if (m.p.sp != null && o.p.sp != null) v += m.p.sp > o.p.sp + 10 ? .25 : m.p.sp + 10 < o.p.sp ? -.25 : 0; }
    return v; }));
  return {off, def, M};
}
const combos = (n, k) => { const out = []; const rec = (s, a) => { if (a.length === k) { out.push(a.slice()); return; } for (let i = s; i < n; i++) { a.push(i); rec(i + 1, a); a.pop(); } }; rec(0, []); return out; };

function planMatchup(mine, theirs, useA) {
  const dbl = S.format === 'doubles', bring = Math.min(dbl ? 4 : 3, mine.length);
  const h = headToHead(mine, theirs, useA);
  const roles = mine.map(m => { const r = teamRoles([m]); return {speed: r.speed.length > 0, fake: r.fake.length > 0 || r.redirect.length > 0 || m.ability === 'Intimidate',
    tr: relMove(m, ROLE.tr)[0] >= .5, tw: relMove(m, ROLE.tw)[0] >= .5, anti: relMove(m, ROLE.anti)[0] >= .4, ghost: (m.types || m.p.t).includes('Ghost'), chop: relMove(m, ['Throat Chop', 'Taunt'])[0] >= .3, prio: relMove(m, ROLE.prio)[0] >= .5}; });
  // archetypes: what they plan, and which of your field setters each of your Pokémon depends on
  const A = dbl ? teamArchetype(mine) : null, B = dbl ? teamArchetype(theirs) : null;
  const fieldLinks = A ? A.field.filter(f => f.active).map(f => ({set: f.setters.map(m => mine.indexOf(m)).filter(i => i >= 0), use: f.abusers.map(m => mine.indexOf(m)).filter(i => i >= 0)})) : [];
  const psyThem = B && B.terrain.includes('psy');
  const archBonus = c => { if (!A) return 0; let v = 0; const has = f => c.some(i => roles[i][f]);
    if (B.speed === 'tr' || B.speed === 'hardtr' || B.speed === 'tailroom') v += has('anti') ? 1.2 : has('tr') ? 1 : 0;
    if (B.speed === 'tw' || B.speed === 'tailroom') v += has('tr') ? 1.2 : has('tw') ? .8 : 0;
    if (B.perish) v += c.some(i => roles[i].ghost || roles[i].chop) ? 1.2 : 0;
    if (A.perish) v += A.trappers.some(m => c.includes(mine.indexOf(m))) ? 2 : -2;
    for (const f of fieldLinks) { const s = f.set.some(i => c.includes(i)), u = f.use.filter(i => c.includes(i)).length; if (s && u) v += .8; else if (u && !s) v -= .6 * u; }
    return v; };
  let best = null;
  for (const c of combos(mine.length, bring)) {
    let v = 0;
    theirs.forEach((o, j) => { const col = c.map(i => h.M[i][j]); v += Math.max(...col) + .25 * col.reduce((a, b) => a + b, 0) / col.length; });
    if (dbl) { if (c.some(i => roles[i].speed)) v += 1.5; if (c.some(i => roles[i].fake)) v += psyThem ? .3 : 1; v += archBonus(c); }
    if (c.filter(i => mine[i].mega).length > 1) v -= .5; // only one can Mega Evolve per battle
    if (!best || v > best.v) best = {c, v};
  }
  const chosen = best ? best.c : [];
  let lead = [];
  if (dbl && chosen.length >= 2) {
    let bl = null;
    for (const pr of combos(chosen.length, 2)) { const a = chosen[pr[0]], b = chosen[pr[1]];
      let v = theirs.reduce((s, o, j) => s + Math.max(h.M[a][j], h.M[b][j]), 0);
      if (roles[a].fake || roles[b].fake) v += psyThem ? .3 : 1.2; if (roles[a].speed || roles[b].speed) v += 1;
      if (fieldLinks.some(f => (f.set.includes(a) && f.use.includes(b)) || (f.set.includes(b) && f.use.includes(a)))) v += .8;
      if (B && (B.speed === 'tr' || B.speed === 'hardtr') && (roles[a].anti || roles[b].anti)) v += .8;
      if (A && A.perish && A.trappers.some(m => [a, b].includes(mine.indexOf(m)))) v += 2;
      if (mine[a].mega && mine[b].mega) v -= 3; // only one can Mega Evolve, so leading both wastes one
      if (!bl || v > bl.v) bl = {p: [a, b], v}; }
    lead = bl.p;
  } else if (chosen.length) { lead = [chosen.reduce((b, i) => (theirs.reduce((s, o, j) => s + h.M[i][j], 0) > theirs.reduce((s, o, j) => s + h.M[b][j], 0) ? i : b), chosen[0])]; }
  return {h, chosen, lead, back: chosen.filter(i => !lead.includes(i)), bench: mine.map((m, i) => i).filter(i => !chosen.includes(i)), A, B};
}


