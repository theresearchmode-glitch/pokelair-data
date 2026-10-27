// ---------- Coverage: best additions ----------
// What a Pokémon does for the team, in one word.
function monRole(m) { const r = k => relMove(m, ROLE[k])[0];
  if (WEATHER_OF[m.ability]) return ARCH[WEATHER_OF[m.ability]].name.toUpperCase(); if (r('tw') >= .5) return 'TAILWIND'; if (r('tr') >= .5) return 'TRICK ROOM';
  if (r('fake') >= .5) return 'FAKE OUT'; if (r('redir') >= .5) return 'REDIRECT';
  if (r('prio') >= .5) return 'PRIORITY'; if (r('boost') >= .5) return 'SETUP'; return 'ATTACKER'; }
// The team-building principles, each checked against tournament teams (377 teams, 2,459 games):
// speed control (Tailwind teams won 56.6% vs 51.7%), no stacked weakness (51% vs 55%), at most one type hitting 3+ (50% vs 55.5%),
// 17+ of 18 types hit super effectively (the bottom quarter of tournament teams hits 17), answers to 23+ of the 30 most-used Pokémon (the median),
// and Fake Out or redirection and 2 Mega options (80% of teams).
function teamProfile(ms, useA) {
  const st = stateScore(ms, useA), gp = gamePlan(ms), tr = threatReport(ms, useA), sh = typeShape(st.a);
  const ans = tr.rows.filter(r => r.best >= 1).length, gpst = k => (gp.rows.find(r => r.k === k) || {}).st;
  return {st, gp, tr, sh, ex: st.a.excess, un: st.a.unresisted.length, off: st.off, ans, nThreat: tr.rows.length, gpst, megas: ms.filter(m => m.mega).length};
}
// The Coverage tab shows the same winning-team checklist as the scouting report, so the two never disagree.
function principles(P, ms) { const c = proChecks(ms, $('useAbil').checked); if (!c) return [];
  return c.items.map(x => ({ok: x.skip ? 'part' : x.soft ? 'part' : x.ok ? 'ok' : 'miss', label: x.label, detail: (x.ok ? x.have : x.miss) + (x.pro ? ` · ${x.pro}` : '')})); }
let recCache = {key: null, val: null};
function computeRecs(ms, useA) {
  const key = JSON.stringify([OFFMETA, S.slots, ui.recSrc, megaGoal(), useA, metaVersion, ui.metaSrc, S.box.join(), S.excl.join(), $('swapMega').checked]);
  if (recCache.key === key) return recCache.val;
  ui.recMore = 0;
  const pool = (ui.recSrc === 'all' ? ROSTER.filter(p => inBox(p) || poolOK(p, 25)) : ROSTER.filter(inBox)).filter(p => !isExcl(p) && !isTrap(p) && (OFFMETA || viability(p) >= 12 || rating(p).total >= 50));
  const res = planFixes(ms, pool, useA, {singlesOnly: true}), B = teamProfile(ms, useA);
  const gpRank = {miss: 0, opt: 1, part: 1, ok: 2};
  const keeps = (A) => A.ex <= B.ex && A.sh.maxStack <= Math.max(2, B.sh.maxStack) && A.sh.w3 <= Math.max(1, B.sh.w3) && A.un <= B.un && A.off >= B.off && A.ans >= B.ans
    && B.gp.rows.every(r => gpRank[A.gpst(r.k) || 'miss'] >= gpRank[r.st]);
  const shortB = megaShort(ms), gains = (A, pl) => (shortB - pl.megaShort) * 6 + (B.ex - A.ex) * 3 + (B.un - A.un) * 2 + (A.off - B.off) * 2 + (A.ans - B.ans) + B.gp.rows.filter(r => gpRank[A.gpst(r.k) || 'miss'] > gpRank[r.st]).length * 3 + (B.sh.maxStack > 2 && A.sh.maxStack <= 2 ? 4 : 0);
  const clean = [], soft = [], seen = new Set();
  // Team Score decides when the pick completes a six (win model loaded): it must raise the Team Score, and the
  // highest goes first. The type rules relax to "at most one more weakness or unresisted type, no new stack".
  const useTS = useTSPick() && ms.length >= 5, baseTS = useTS && ms.length === 6 ? tsOf(ms) : null; let tsN = 0;
  const tsOK = pl => { if (!useTS || pl.team.length !== 6) return null; if (pl._ts === undefined) { if (tsN >= 120) return null; tsN++; pl._ts = tsOf(pl.team); } return pl._ts; };
  for (const pl of res.singles) { const x = pl.ch[0], b = x.c.p.b; if (seen.has(b)) continue;
    const A = teamProfile(pl.team, useA); pl.prof = A; pl.gain = gains(A, pl);
    const t = tsOK(pl);
    if (t != null) { const fits = A.ex <= B.ex + 1 && A.un <= B.un + 1 && A.sh.maxStack <= Math.max(2, B.sh.maxStack) && pl.megaShort <= shortB;
      if (fits && (baseTS == null || t >= baseTS + TS_GAIN)) { seen.add(b); clean.push(pl); } else if (soft.length < 3 && fits) soft.push(pl);
      if (clean.length >= 24) break; continue; }
    const megaFix = pl.megaShort < shortB && A.ex <= B.ex + 1 && A.sh.maxStack <= Math.max(2, B.sh.maxStack) && A.off >= B.off - 1;
    if ((keeps(A) || megaFix) && (ms.length < 6 || pl.gain > 0)) { seen.add(b); pl.megaFix = megaFix && !keeps(A); clean.push(pl); } else if (soft.length < 3 && A.ex <= B.ex + 1 && A.off >= B.off - 1) soft.push(pl);
    if (clean.length >= 24) break; }
  // rank by the model score plus how much each one lifts defense, offense, meta answers and the game plan
  // Strength floor: suggestions have to be good Pokémon, not just a type fit. Whole roster asks for a rating of 50+,
  // your own box 35+ (it's what you have). Then rank by rating plus how much the pick improves the team.
  const floor = OFFMETA ? 35 : ui.recSrc === 'all' ? 50 : 35, strong = pl => inBox(pl.ch[0].c.p) && ui.recSrc === 'box' ? rating(pl.ch[0].c.p).total >= floor : rating(pl.ch[0].c.p).total >= floor;
  const rank = pl => (pl._ts != null ? pl._ts * 1000 : 0) + rating(pl.ch[0].c.p).total + pl.gain * 4;
  for (let k = clean.length - 1; k >= 0; k--) if (!strong(clean[k])) clean.splice(k, 1);
  clean.sort((x, y) => rank(y) - rank(x));
  // Hidden gems: also look past the usual meta picks (with off-meta scoring) for up to 2 strong Pokémon that fit just as cleanly.
  const gems = [];
  if (!OFFMETA) { const taken = new Set(clean.map(pl => pl.ch[0].c.p.b));
    const gpool = (ui.recSrc === 'all' ? ROSTER : ROSTER.filter(inBox)).filter(p => !isExcl(p) && !isMetaPick(p) && !taken.has(p.b) && (rating(p).total >= 55 || p.m));
    const gres = withOffMeta(() => planFixes(ms, gpool, useA, {singlesOnly: true}));
    const gseen = new Set();
    for (const pl of gres.singles) { const b = pl.ch[0].c.p.b; if (gseen.has(b)) continue; const A = teamProfile(pl.team, useA); pl.prof = A; pl.gain = gains(A, pl);
      const gt = useTS && pl.team.length === 6 ? tsOK(pl) : undefined;
      if (keeps(A) && (gt !== undefined ? gt != null && (baseTS == null || gt >= baseTS + TS_GAIN) : (ms.length < 6 || pl.gain > 0)) && pl.megaShort <= shortB && isGem(pl.ch[0].c.p)) { gseen.add(b); pl.gem = true; gems.push(pl); }
      if (gems.length >= 12) break; }
    gems.sort((x, y) => rank(y) - rank(x)); }
  // Alternatives: swaps that don't improve the numbers but keep every check and stay close on them.
  // They feed "More ideas", so the list never just stops when the team is already good.
  const alts = [], aseen = new Set([...clean, ...gems].map(pl => pl.ch[0].c.p.b)), passB = (proChecks(ms, useA) || {pass: 0}).pass;
  for (const pl of res.singles) { const b = pl.ch[0].c.p.b; if (aseen.has(b) || alts.length >= 18) continue;
    const A = pl.prof || teamProfile(pl.team, useA); pl.prof = A; if (pl.gain == null) pl.gain = gains(A, pl);
    if (A.ex <= B.ex + 1 && A.un <= B.un + 1 && A.sh.maxStack <= Math.max(2, B.sh.maxStack) && A.off >= B.off - 1 && A.ans >= B.ans - 2 && pl.megaShort <= shortB && strong(pl) && (proChecks(pl.team, useA) || {pass: 0}).pass >= passB
      && (baseTS == null || pl.team.length !== 6 || (t => t != null && t >= baseTS - TS_GAIN)(tsOK(pl)))) { aseen.add(b); pl.alt = true; alts.push(pl); } }
  // first page: the 6 best clean picks plus 2 hidden gems; then everything else, mixing gems and alternatives in by rating
  const first = clean.slice(0, 6).concat(gems.slice(0, 2));
  const rk2 = pl => (pl._ts != null ? pl._ts * 1000 : 0) + rating(pl.ch[0].c.p).total + (pl.gem ? 6 : 0) + pl.gain * 3;
  const rest = clean.slice(6).concat(gems.slice(2), alts).sort((x, y) => rk2(y) - rk2(x));
  const val = {B, clean: first, more: rest, soft, basePl: res.basePl, full: res.full};
  recCache = {key, val}; return val;
}
function renderRecs() {
  const elP = $('princ'), elL = $('recList'); if (!elP || !elL) return;
  document.querySelectorAll('[data-recsrc]').forEach(x => x.setAttribute('aria-pressed', x.dataset.recsrc === ui.recSrc));
  const useA = $('useAbil').checked, ms = members();
  if (ms.length < 2) { elP.innerHTML = ''; elL.innerHTML = '<div class="empty-note">Add at least two Pokémon on the Team page to get suggestions.</div>'; return; }
  const r = computeRecs(ms, useA), B = r.B, pr = principles(B, ms);
  const mark = {ok: '✓', part: '~', miss: '✕'};
  { const head = `<span class="gpt">Winning-team checklist</span><span class="vsub">${pr.filter(x => x.ok !== 'miss').length} of ${pr.length} checks</span>`,
      rows = pr.map(x => `<div class="prow ${x.ok}"><span class="pm" aria-hidden="true">${mark[x.ok]}</span><div><div class="pl">${esc(x.label)}</div><div class="t2">${esc(x.detail)}</div></div></div>`).join('');
    const wasOpen = elP.querySelector && elP.querySelector('details[open]');
    elP.innerHTML = PHONE() ? `<details class="princfold"${wasOpen ? ' open' : ''}><summary class="princhead">${head}</summary>${rows}</details>` : `<div class="princhead">${head}</div>` + rows; }
  ui.recs = [];
  const delta = (lbl, a, b, better, fmt) => { const d = a === b ? 'same' : better ? 'up' : 'down'; return `<span class="dchip ${d}"><b>${lbl}</b> ${fmt(b)}${a === b ? '' : ` → ${fmt(a)}`}</span>`; };
  const card = (pl, soft) => { const x = pl.ch[0], p = x.c.p, A = pl.prof, i = ui.recs.push(pl) - 1, mem = pl.team.find(m => m.p === p) || x.c.mem;
    const gpUp = B.gp.rows.filter(rw => ({miss: 0, opt: 1, part: 1, ok: 2})[A.gpst(rw.k) || 'miss'] > ({miss: 0, opt: 1, part: 1, ok: 2})[rw.st]).map(rw => rw.label);
    const rest = pl.team.filter(m => m.p !== p); let pair = null; for (const t of rest) { const v = pairSyn({p}, t) + tourSyn({p}, t); if (v >= 8 && (!pair || v > pair.v)) pair = {t, v}; }
    const why = [gpUp.length ? 'Adds ' + gpUp.join(', ').toLowerCase() : '', pair ? `often paired with ${pair.t.d}` : '', x.out ? `replaces ${x.out.d}` : ''].filter(Boolean).join(' · ');
    return `<div class="addcard${soft ? ' soft' : ''}"><div class="rtop">${sprite(p,'mini')}<span class="qname">${esc(p.d)}</span><span class="chips">${p.t.map(t => chip(t)).join('')}</span>${confChip(p)}${p.m ? '<span class="tag mega ico" title="Mega Evolution">MEGA</span>' : ''}${inBox(p) ? '<span class="tag box ico" title="In your box">BOX</span>' : '<span class="tag catch ico" title="Not in your box yet">TO CATCH</span>'}<span class="tag role">${esc(monRole(mem))}</span>${(pl.gem ? '<span class="tag offmeta">HIDDEN GEM</span>' : (pl.alt ? '<span class="tag sidegrade">SIDE-GRADE</span>' : '') + ideaTag(p)) + ratingTag(p)}</div>
      ${pl.gem ? `<div class="qwhy gemline">Hidden gem: ${esc(evidenceLine(p))}. It fits this team as cleanly as the usual picks.</div>` : pl.alt ? `<div class="qwhy gemline">A different look that keeps every check and stays close on the numbers.</div>` : ''}
      <div class="dchips">${tsChip(pl.team)}${delta('Weak', A.ex, B.ex, A.ex < B.ex, v => v)}${delta('Unresisted', A.un, B.un, A.un < B.un, v => v)}${delta('Offense', A.off, B.off, A.off > B.off, v => v + '/18')}${delta('Meta answers', A.ans, B.ans, A.ans > B.ans, v => v + '/' + B.nThreat)}</div>
      ${why ? `<div class="qwhy">${esc(why)}</div>` : ''}${pl.megaFix ? `<div class="qwhy warnline">Trade-off: ${[A.ex > B.ex ? 'one more weakness than resist' : '', A.un > B.un ? 'one more type nobody resists' : '', A.off < B.off ? 'one less type hit super effectively' : '', A.ans < B.ans ? 'one fewer meta answer' : ''].filter(Boolean).join(', ') || 'small coverage cost'}, but it brings the team to ${megaGoal()} Mega${megaGoal() > 1 ? 's' : ''}</div>` : ''}${soft ? `<div class="qwhy warnline">Trade-off: ${esc([A.ex > B.ex ? `${A.ex - B.ex} more weakness` : '', A.off < B.off ? 'one less type covered' : '', A.ans < B.ans ? `${B.ans - A.ans} fewer meta answers` : '', A.un > B.un ? 'one more unresisted type' : ''].filter(Boolean).join(', ') || 'loses part of the game plan')}</div>` : ''}
      <div class="row"><button class="btn sm primary" type="button" data-rec="${i}">${x.out ? 'Swap for ' + esc(x.out.d) : 'Add to team'}</button></div></div>`; };
  const where = ui.recSrc === 'all' ? 'the whole roster' : 'your box';
  const ph = PHONE(), first = ph ? r.clean.slice(0, 4) : r.clean, page = ui.recMore || 0, pool2 = (ph ? r.clean.slice(4) : []).concat(r.more), extra = pool2.slice(0, page * (ph ? 4 : 6)), left = pool2.length - extra.length;
  const moreBtn = `<div class="morebar">${left > 0 ? `<button class="btn" type="button" id="recMoreBtn">More ideas</button><span class="vsub">${left} more option${left === 1 ? '' : 's'}${ph ? '' : ', including rarely used picks and side-grades'}</span>` : pool2.length ? `<span class="vsub">That's every option from ${where} that keeps your checks.</span><button class="btn sm" type="button" id="recMoreReset">Back to the top picks</button>` : ''}</div>`;
  const altHead = extra.length ? `<div class="lbl" style="margin-top:6px">More ideas</div>` : '';
  if (!r.clean.length && extra.length === 0 && r.more.length && !page) { ui.recMore = 1; return renderRecs(); }
  elL.innerHTML = (first.length || extra.length) ? first.map(pl => card(pl, false)).join('') + altHead + extra.map(pl => card(pl, false)).join('') + moreBtn
    : `<div class="empty-note">Nothing in ${where} improves this team without costing something${r.full ? ' (every swap gives up some defense, offense, meta answers or a game-plan job)' : ''}.${ui.recSrc === 'box' ? ' Try "Whole roster" to see what to catch.' : ''}</div>` + moreBtn + (r.soft.length ? `<div class="lbl" style="margin-top:6px">Closest options, with their trade-off</div>` + r.soft.map(pl => card(pl, true)).join('') : '');
}

