// ---------- Auto-build: the best doubles teams from your pool ----------
// Grows real tournament cores (RESULTS.cores) that you can field, plus official in-game teammate pairs.
// Each seed is grown to 6 with a small beam search on teamValue (the whole model), then
// polished with single swaps. Keeps up to 3 different teams for "Try another".
function abMember(p) { const pm = runMoves(p); return {...memberFrom(p, metaAbility(p) || undefined), i: -1, p, d: p.d, moves: pm, _mv: pm.some(isCoverage) ? pm : [], mega: p.m, base: p.b, types: p.t}; }
function abPool() {
  return (ui.abSrc === 'all' ? ROSTER : ROSTER.filter(inBox)).filter(p => !isExcl(p) && !isTrap(p) && (inBox(p) ? (OFFMETA || viability(p) >= 8) : poolOK(p, 25)));
}
// For a full build, the game plan (speed control above all) and the best proven core's win rate count extra:
// a beginner's team should come with a plan, and cores that win more (Tailwind sun: 62%) should rank first.
function abScore(team) { const v = teamValue(team); let s = v.score - .5 * v.gp.penalty - (team.length >= 4 ? typeEmphasis(v.st.a) : 0) - pillarCost(team, v.gp);
  // aim for the grades too: fewer defense points, more of the meta hit by 2+ members (a secondary goal next to proven cores and pillars)
  if (team.length >= 5) { const g = proGrades(team, true); if (g) s += -g.dp * 8 + (g.se2 - .67) * 60 - Math.max(0, g.og - 1) * 18 - Math.max(0, g.dg - 1) * 18; }
  if (OFFMETA) { const mc = team.filter(m => isMetaPick(m.p)).length; s -= Math.max(0, mc - 2) * 30; }
  if (!OFFMETA && RES && team.length >= 3) { const names = new Set(team.map(m => m.p.n)); let best = 0;
    for (const c of RES.cores) if (c[3] >= (RES.minCore || 6) && names.has(c[0]) && names.has(c[1]) && names.has(c[2])) best = Math.max(best, c[4] - RES.base); s += best * 400; }
  if (!OFFMETA && team.length >= 4 && typeof modelOK === 'function' && modelOK()) { const nm = team.map(m => m.p.n);
    s += (teamX(nm, team) - (META.model.meanX || 0) * team.length / 6) * 120; const pa = personalAdj(); if (pa) for (const n of nm) s += (pa.get(n) || 0) * 8; }
  return s; }
// Proven teams first: exact six-Pokémon lists real players won with at Limitless events (RESULTS.proven), that you can
// field from your pool, or field all but one (the gap is filled from your pool by the team model). Tested Oct 24: the
// hand-built team score barely predicts which teams win (held-out rho 0.09), so real results lead and the model only fills.
function provenBuild() {
  if (OFFMETA || !RES || !Array.isArray(RES.proven) || !RES.proven.length) return null;
  const goal = megaGoal(), all = ui.abSrc === 'all';
  const ok = p => p && !isExcl(p) && (all || inBox(p));
  const cands = [];
  for (const [names, n, wr] of RES.proven) {
    const ps = names.map(x => byName.get(x)); if (ps.some(p => !p)) continue;
    if (ui.abLock && !names.includes(ui.abLock)) continue; // "Build around it": only real teams that ran this Pokémon
    const missing = ps.filter(p => !ok(p) && p.n !== ui.abLock); if (missing.length > 1) continue;
    cands.push({ps, n, wr, missing: missing[0] || null});
  }
  if (!cands.length) return null;
  const fill = c => { const keep = c.ps.filter(p => p !== c.missing).map(abMember); if (!c.missing) return keep;
    const used = new Set(keep.map(m => m.p.b)), mg = keep.filter(m => m.p.m).length;
    const opts = [];
    for (const p of ROSTER) { if (!ok(p) || isTrap(p) || used.has(p.b) || (p.m && mg >= 2) || viability(p) < 8) continue; const t = [...keep, abMember(p)]; opts.push({t, sc: abScore(t)}); }
    opts.sort((a, b) => b.sc - a.sc); if (!opts.length) return null;
    // the gap goes to whichever of the 8 best fits gives the highest Team Score
    if (useTSPick()) { let best = null; for (const o of opts.slice(0, 8)) { const ts = tsOf(o.t); if (ts != null && (!best || ts > best.ts)) best = {t: o.t, ts}; } if (best) return best.t; }
    return opts[0].t; };
  let scored = cands.map(c => ({...c, s: c.wr + .006 * Math.log2(1 + c.n) - (c.missing ? .05 : 0) - (c.ps.filter(p => p.m).length !== goal ? .015 : 0)})).sort((a, b) => b.s - a.s);
  // Team Score decides the order (win model loaded): the 15 best-proven lists, highest Team Score first
  if (useTSPick()) { scored = scored.slice(0, 15); for (const c of scored) { c.t = fill(c); c.ts = c.t && c.t.length === 6 ? tsOf(c.t) : null; }
    scored.sort((a, b) => (b.ts ?? -1) - (a.ts ?? -1) || b.s - a.s); }
  const out = [];
  for (const c of scored) { if (out.length >= 3) break; const t = c.t !== undefined ? c.t : fill(c); if (!t || t.length !== 6) continue;
    if (out.some(o => o.t.filter(m => t.some(x => x.p.b === m.p.b)).length > 3)) continue; out.push({t, c}); }
  if (!out.length) return null;
  return {fmt: 'doubles', teams: out.map(({t, c}) => { const d = abDescribe(t);
    const src = `${c.n > 1 ? `${c.n} players brought this exact team` : 'A real tournament team'} at Limitless events, winning about ${Math.round(c.wr * 100)}% of games`;
    d.why.unshift(c.missing ? `${src}, with ${c.missing.d} where you have ${(t.find(m => !c.ps.some(p => p.b === m.p.b)) || {d: '?'}).d}` : src);
    d.proven = {n: c.n, wr: c.wr, swapped: !!c.missing}; return d; })};
}
function buildBest() {
  // "Build around it": proven teams that ran the Pokémon come first, but only those that score 50+; the search below
  // fills the rest, so a rare sleeper still gets three good teams
  let keepPr = null;
  { const pr = provenBuild(); if (pr && !ui.abLock) return pr;
    if (pr && ui.abLock) { const good = pr.teams.filter(t => { try { return (tsOf(t.mons.map(m => abMember(byName.get(m.n)))) ?? 0) >= 50; } catch (e) { return false; } }); if (good.length >= 3) return {...pr, teams: good}; keepPr = good; } }
  const res0 = buildBest_();
  if (keepPr && keepPr.length) { const fresh = (res0.teams || []).filter(t => !keepPr.some(k => k.mons.filter(m => t.mons.some(x => x.n === m.n)).length > 3)); return {...res0, teams: [...keepPr, ...fresh].slice(0, 3)}; }
  return res0;
}
function buildBest_() {
  const fmt = 'doubles'; vCache = new Map(); pmCache = new Map(); setCache = new Map(); pairCache = new Map(); relCache = new Map();
  try {
    const pool = abPool(); if (pool.length < 6) return {fmt, teams: [], short: pool.length};
    const lockP = ui.abLock ? byName.get(ui.abLock) : null; if (lockP && !pool.includes(lockP)) pool.push(lockP);
    const M = new Map(pool.map(p => [p.n, abMember(p)])), goal = megaGoal();
    // never more Megas than the goal, and never so few that the open slots can't reach it
    const legal = (t, p) => { if (t.some(m => m.base === p.b)) return false; const mg = megaCount(t) + (p.m ? 1 : 0); return mg <= goal && mg + (6 - t.length - 1) >= goal; };
    // seeds
    let seeds = [];
    if (RES && !OFFMETA) for (const c of RES.cores) { const ps = c.slice(0, 3).map(n => byName.get(n)); if (ps.every(p => p && M.has(p.n))) { const t = []; let okk = true; for (const p of ps) { if (!legal(t, p)) { okk = false; break; } t.push(M.get(p.n)); } if (okk) seeds.push(t); } if (seeds.length >= 10) break; }
    const byV = pool.slice().sort((a, b) => pickVia(b) - pickVia(a));
    for (const p of byV.slice(0, 10)) { const m = M.get(p.n); const mates = setFor(p).tm.map(([n]) => byName.get(n)).filter(q => q && M.has(q.n));
      for (const q of mates.slice(0, 2)) if (legal([m], q)) seeds.push([m, M.get(q.n)]); }
    if (!seeds.length) seeds.push([M.get(byV[0].n)]);
    // "Build around it": every seed must hold the locked Pokémon (it stays put through the polish, which only swaps
    // members after the seed); its proven cores and teammates are tried first
    if (lockP) { const L = M.get(lockP.n), has = t => t.some(m => m.p.n === lockP.n);
      const extra = [[L], ...setFor(lockP).tm.map(([n]) => byName.get(n)).filter(q => q && M.has(q.n) && legal([L], q)).slice(0, 4).map(q => [L, M.get(q.n)])];
      seeds = [...seeds.filter(has), ...extra]; if (!legal([], lockP)) return {fmt, teams: [], noMega: goal}; }
    const key = t => t.map(m => m.p.n).sort().join('|'); const seen = new Set(); seeds = seeds.filter(t => { const k = key(t); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 14);
    // candidates: strongest Pokémon plus everything that pairs well with the seeds
    const cand = byV.slice(0, OFFMETA ? 70 : 45).map(p => M.get(p.n));
    const finals = [];
    for (const seed of seeds) {
      let beam = [seed];
      while (beam[0].length < 6) {
        const next = [];
        for (const t of beam) { const scored = [];
          for (const c of cand) { if (!legal(t, c.p)) continue; scored.push([abScore([...t, c]), [...t, c]]); }
          scored.sort((a, b) => b[0] - a[0]); next.push(...scored.slice(0, 3)); }
        const nk = new Set(); beam = next.sort((a, b) => b[0] - a[0]).filter(([, t]) => { const k = key(t); if (nk.has(k)) return false; nk.add(k); return true; }).slice(0, 3).map(x => x[1]);
        if (!beam.length) break;
      }
      for (const t of beam) if (t.length === 6) finals.push({t, lock: seed.length});
    }
    // polish: try swapping each non-core member for each candidate once (the seed core stays, so options stay different)
    const polish = (t, lock) => { let best = t, bs = abScore(t);
      for (let i = lock; i < 6; i++) for (const c of cand) { const rest = best.filter((_, j) => j !== i); if (!legal(rest, c.p)) continue; const nt = [...rest.slice(0, i), c, ...rest.slice(i)]; const s = abScore(nt); if (s > bs + 1) { best = nt; bs = s; } }
      return {t: best, s: bs}; };
    let ranked = finals.map(f => ({...f, s: abScore(f.t)})).sort((a, b) => b.s - a.s).slice(0, 12).map(x => ({...polish(x.t, x.lock), lock: x.lock})).sort((a, b) => b.s - a.s);
    // Team Score decides the order (win model loaded): the search above only shortlists. Each shortlisted team then
    // gets one round of Team Score polish: the single swap (outside its seed core) that raises its Team Score most.
    // Candidates for the polish: the 25 strongest by pick value plus the 15 the win model rates highest (so a Pokémon the
    // model likes is tried even if it's rarely picked). Up to 3 rounds, each taking the single swap that raises it most.
    if (useTSPick()) { const mv = p => (META.model.mons[p.n] || 0), cTS = [...new Set([...cand.slice(0, 25), ...pool.slice().sort((a, b) => mv(b) - mv(a)).slice(0, 15).map(p => M.get(p.n))])];
      for (const r of ranked.slice(0, 8)) { r.ts = tsOf(r.t); if (r.ts == null) continue;
        for (let round = 0; round < 3; round++) { let best = null;
          for (let i = r.lock; i < 6; i++) for (const c of cTS) { const rest = r.t.filter((_, j) => j !== i); if (!legal(rest, c.p)) continue; const nt = [...rest.slice(0, i), c, ...rest.slice(i)]; const t = tsOf(nt); if (t != null && t > (best ? best.ts : r.ts + 1)) best = {t: nt, ts: t}; }
          if (!best) break; r.t = best.t; r.ts = best.ts; } }
      for (const r of ranked.slice(8)) r.ts = tsOf(r.t);
      ranked.sort((a, b) => (b.ts ?? -1) - (a.ts ?? -1) || b.s - a.s); }
    // three different teams: each must differ from the ones kept by at least 3 Pokémon
    const out = [];
    for (const r of ranked) { if (megaCount(r.t) !== goal) continue; if (out.some(o => o.t.filter(m => r.t.some(x => x.p.b === m.p.b)).length > 3)) continue; out.push(r); if (out.length >= 3) break; }
    if (!out.length) return {fmt, teams: [], noMega: goal};
    return {fmt, teams: out.map(r => abDescribe(r.t))};
  } finally { vCache = new Map(); pmCache = new Map(); setCache = new Map(); pairCache = new Map(); relCache = new Map(); threatCache = {key: null, list: null}; }
}
// Everything the card shows about one built team.
function abDescribe(t) {
  const v = teamValue(t), gp = v.gp, tr = v.tr;
  const role = m => monRole(m);
  const mons = t.map(m => ({n: m.p.n, d: m.p.d, types: m.p.t, mega: !!m.p.m, box: inBox(m.p), role: role(m), ability: m.ability, offMeta: viability(m.p) < 25}));
  const why = [];
  if (RES) { const names = new Set(t.map(m => m.p.n)); const core = RES.cores.find(c => c.slice(0, 3).every(n => names.has(n)));
    if (core) why.push(`${core.slice(0, 3).map(n => (byName.get(n) || {}).d || n).join(' + ')}: ${core[3]} tournament teams, ${Math.round(core[4] * 100)}% wins`); }
  else { let best = null; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const s = pairSyn(t[i], t[j]); if (!best || s > best.s) best = {s, a: t[i], b: t[j]}; }
    if (best && best.s >= 8) why.push(`${best.a.d} and ${best.b.d} are often run together in ranked`); }
  const ans = tr.rows.filter(r => r.best >= 1).length; why.push(`Answers ${ans} of the ${tr.rows.length} most-used Pokémon`);
  const gpl = gp.rows.filter(r => r.st === 'ok' && ['speed', 'weather', 'terrain', 'support', 'haz', 'pivot'].includes(r.k)).map(r => r.label.replace('Fake Out / redirection', 'Fake Out'));
  mons.filter(m => !m.box).forEach(m => why.push(`${m.d} isn't in your box: the best one to catch for this team`));
  // the team's plan in a few words: weather + speed mode, or how it wins without one
  const arc = teamArchetype(t), parts = [arc ? arc.label : 'Balance'];
  return {mons, label: parts.join(' + '), why, gp: gpl, megas: mons.filter(m => m.mega).length, score: Math.round(v.score), grade: proChecks(t, true)};
}
// before you build: what you'll get, plus three recent event winners you can load straight away
function abStart() {
  const E = META.events, picks = E ? E.events.filter(e => e.src === 'official' || e.players >= 64).filter(e => e.top[0] && e.top[0].place === 1).slice(0, 3) : [];
  return `<div class="abstart"><div class="abwhat">${[['Six that work together', 'Built from teams that win at real tournaments, filtered to what you own.'], ['The why', 'Each pick comes with its job on the team and what it fixes.'], ['Your Team Score', 'How ready it is, and the one change that would help most.']].map(([h, t], i) => `<div class="abw"><span class="abwn">${i + 1}</span><div><b>${h}</b><p class="t2">${t}</p></div></div>`).join('')}</div>
    ${picks.length ? `<div class="head abwinhead"><div><h3>Or start from a recent winner</h3><p class="hint">Full sets, ready to load.</p></div></div>${picks.map(e => teamSheetCard(e.top[0], e, e.id + '#0')).join('')}` : ''}</div>`; }
// the built team's Team Score, from the same model as the Team page
function abTS(tm) { if (tm.mons.length !== 6) return ''; if (tm._ts === undefined) { let t = null; try { const ms = tm.mons.map(m => abMember(byName.get(m.n))); const wv = winVsField(ms.map(m => m.p.n), true, ms); t = wv ? teamScore({wv}) : null; } catch (e) {} tm._ts = t; }
  return tm._ts ? `<span class="abtsv" title="Team Score: stronger than ${tm._ts.score}% of recent tournament teams"><b>${tm._ts.score}</b>Team Score</span>` : ''; }
function renderAutoBuild() {
  const el = $('abOut'); if (!el) return; const r = ui.ab;
  if (!r) { el.innerHTML = abStart(); return; }
  if (r.busy) { el.innerHTML = '<div class="empty-note">Building your teams…</div>'; return; }
  const col = (res) => { if (!res.teams.length) return `<div class="abcol"><div class="abfmt">${FMT(res.fmt)}</div><div class="empty-note">${res.noMega != null ? `No strong team with exactly ${res.noMega} Mega${res.noMega === 1 ? '' : 's'} from this pool. Add Mega-capable Pokémon to your box, switch to Whole roster, or change Megas on team.` : res.short != null ? `Only ${res.short} usable Pokémon in your box for ${FMT(res.fmt).toLowerCase()}. Add more in My box, or switch to Whole roster.` : 'No legal team from this pool.'}</div></div>`;
    const k = (ui.abIdx && ui.abIdx[res.fmt]) || 0, tm = res.teams[k % res.teams.length];
    return `<div class="abcol"><div class="abhead"><span class="abfmt">${FMT(res.fmt)}</span><span class="archchips">${archChips(tm.label)}</span>${tm.fresh ? '<span class="tag offmeta">FRESH TAKE</span>' : ''}${tm.proven ? `<span class="tag box" title="Built from a real tournament team">${tm.proven.swapped ? 'PROVEN · 1 SWAP' : 'PROVEN TEAM'}</span>` : ''}${tm.grade ? `<span style="margin-left:auto" class="abts">${abTS(tm)}${miniGrades(tm.grade)}</span>` : ''}${res.teams.length > 1 ? `<span class="vsub">option ${k % res.teams.length + 1} of ${res.teams.length}</span>` : ''}</div>
      <div class="abmons">${tm.mons.map(m => `<div class="abmon">${sprite(byName.get(m.n),'mini')}<span class="abname">${esc(m.d)}</span>${confChip(byName.get(m.n))}<span class="chips">${m.types.map(t => chip(t)).join('')}</span>${m.box ? '<span class="tag box ico" title="In your box">BOX</span>' : '<span class="tag catch ico" title="Not in your box yet">TO CATCH</span>'}${m.offMeta ? '<span class="tag offmeta">OFF-META</span>' : ''}<span class="abright"><span class="tag role">${esc(m.role)}${m.mega ? ' · MEGA' : ''}</span>${byName.get(m.n) ? ratingTag(byName.get(m.n)) : ''}</span></div>`).join('')}</div>
      <div class="abgp">${tm.gp.map(g => `<span class="sev ok">${esc(g)}</span>`).join('')}<span class="sev lo">${tm.megas} Mega option${tm.megas === 1 ? '' : 's'}</span></div>
      ${tm.fresh ? '<div class="t2 gemline">A fresh take: built on raw power and fit instead of popularity, with at most 2 meta staples. Fewer people will have prepared for it.</div>' : ''}
      <ul class="abwhy">${tm.why.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
      <div class="row"><button class="btn sm primary" type="button" data-abuse="${res.fmt}">Use this team</button><button class="btn sm" type="button" data-absave="${res.fmt}"${S.teams.length >= 10 ? ' disabled title="10 saved teams already"' : ''}>Save</button>${res.teams.length > 1 ? `<button class="btn sm" type="button" data-abnext="${res.fmt}">Try another</button>` : ''}</div></div>`; };
  const lk = ui.abLock && byName.get(ui.abLock);
  el.innerHTML = (lk ? `<div class="ablock">${sprite(lk, 'mini') || ''}<span>Built around <b>${esc(lk.d)}</b>: every team keeps it.</span><button type="button" class="linkbtn" data-abaroundx="1">Build without it</button></div>` : '')
    + `<div class="abgrid${r.doubles ? ' one' : ''}">${r.doubles ? col(r.doubles) : ''}</div>`;
}
function runAutoBuild() {
  ui.ab = {busy: true}; ui.abIdx = {}; renderAutoBuild();
  setTimeout(() => { try { ui.ab = {doubles: addFreshTake(buildBest())}; } catch (e) { try { console.error('Champions Team Coverage: auto-build failed', e); } catch (x) {} ui.ab = null; toast('Auto-build hit a problem. Try again.'); } render(); }, 30);
}
// Add a "fresh take" as option 2: a team built with off-meta scoring, on power and fit (at most 2 meta staples),
// kept only if it passes nearly as many winning-team checks as the proven build and isn't the same team.
function addFreshTake(res) {
  if (OFFMETA || ui.abLock || !res || !res.teams || !res.teams.length) return res;
  let alt = null; try { alt = withOffMeta(() => buildBest()); } catch (e) { alt = null; }
  if (!alt || !alt.teams || !alt.teams.length) return res;
  const best = res.teams[0], names = new Set(best.mons.map(m => m.n));
  const pick = alt.teams.find(t => t.mons.filter(m => names.has(m.n)).length <= 3 && t.mons.filter(m => m.offMeta).length >= 2 && (!best.grade || !t.grade || t.grade.pass >= best.grade.pass - 1));
  if (!pick) return res;
  pick.fresh = true; res.teams.splice(1, 0, pick); return res;
}
function abNext(fmt) { ui.abIdx = ui.abIdx || {}; ui.abIdx[fmt] = (ui.abIdx[fmt] || 0) + 1;
  renderAutoBuild(); }
function abTeam(fmt) { const res = ui.ab && ui.ab[fmt]; if (!res || !res.teams.length) return null; const k = (ui.abIdx && ui.abIdx[fmt]) || 0; return res.teams[k % res.teams.length]; }

