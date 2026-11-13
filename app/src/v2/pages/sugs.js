// ---------- My Team › Suggestions (R4, Nov 11): the controls, the cards and what sits around them ----------
// Every setting, list, number and word comes from today's shared logic (36-sug-data.js, 29-fix-planner.js, 36-lanes.js);
// this file only draws them in the new design and passes taps back. The planner run itself is in team.js (V2.plan).

// ---------- the settings: today's sliders, same choices, same saved settings, same messages ----------
V2.sgCtl = () => `<div class="sg2-ctl" role="group" aria-label="Suggestion settings">
  <div class="sg2-c sg2-pool"><span class="sg2-k">Suggest from</span>${V2.slide('sgpool', [['box', 'My Box'], ['boxfill', 'Box + Catch'], ['all', 'Whole Roster']], ui.pool, 'Suggest from')}</div>
  <div class="sg2-c"><span class="sg2-k">Megas on team</span>${V2.slide('sgmega', [['0', '0'], ['1', '1'], ['2', '2']], String(megaGoal()), 'Megas on the team')}</div>
  <div class="sg2-c"><span class="sg2-k">Swap my Mega?</span>${V2.slide('sgswap', [['0', 'No'], ['1', 'Yes']], $('swapMega').checked ? '1' : '0', 'Suggestions can swap out my Mega')}</div></div>`;
// Swap my Mega? is kept in this browser on the new build (today's page forgets it on reload while Megas on team is kept: SUG-03b)
try { if (V2.LS.get('np2.swapMega') === '1') $('swapMega').checked = true; } catch (e) {}
// a new choice: the setting and its message at once; the page redraws once the plate has slid over (so the slide is seen)
V2.sgLater = fn => { clearTimeout(V2._sgT); V2._sgT = setTimeout(fn, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240); };
document.addEventListener('v2slide', e => { const {key, value} = e.detail;
  if (key === 'sgpool') { if (value === ui.pool) return; const say = setPool(value); toast(say); V2.sgLater(render); }
  else if (key === 'sgmega') { if (+value === megaGoal()) return; const say = setMegaGoal(value); if (ui.ab && !ui.ab.busy) { if (V2.route() === 'build') runAutoBuild(); else ui.ab = null; } toast(say); V2.sgLater(render); } // Build results follow the new Megas number (today's 34-events.js)
  else if (key === 'sgswap') { const say = setSwapMega(value === '1'); if (!say) return; V2.LS.set('np2.swapMega', value); toast(say); V2.sgLater(render); } });

// ---------- the cards' reasons: today's planWhy over the same plans renderPlans works them out for ----------
// (the plans, then up to 3 side options when nothing improves the team), so Why? lists today's reasons word for word
V2.sgX = ms => { const useA = $('useAbil').checked, RD = prepOf(ms), P = V2.plan.plans || [];
  return {ms, a: analyze(playForm(ms), useA), plans: P, covered: offenseRows(ms, useA).covered, baseTS: RD && RD.score != null ? {score: RD.score} : null}; };
V2.sgReasons = ms => { const X = V2.sgX(ms), P = X.plans, list = [...P]; [...list, ...planExtra(P, list)].forEach((pl, k) => { try { planWhy(pl, k, X); } catch (e) { console.error(e); } }); return X; };
// today's page says " · " lists in words (undotText, shared): the same rule on the shared texts drawn here, text only (never inside tags)
V2.undot = s => undotText(String(s), ', ', /;/.test(s));
V2.undotHtml = h => { h = String(h); const list = /;/.test(h.replace(/<[^>]*>/g, '')); return h.split(/(<[^>]*>)/).map(x => x.startsWith('<') ? x : undotText(x, ', ', list)).join(''); };
// one suggestion as a card (also used by All Suggestions); the score change from today's planGrade, the kind line from today's LANE
V2.sgSide = (m, cls) => { const P = m.p || m; return `<span class="tm-sw${cls}"><img src="${V2.art(SPRITE_ID[P.n])}" alt=""><span>${V2.nameHtml(m.d || V2.disp(P.n))}</span></span>`; };
V2.sgSwap = x => `<div class="tm-chg" aria-label="${x.out ? V2.esc(x.out.d) + ' out, ' : 'Add '}${V2.esc(x.c.p.d)}${x.out ? ' in' : ''}">${x.out ? V2.sgSide(x.out, '') : '<span class="tm-sw"></span>'}<span class="tm-ar" aria-hidden="true">${x.out ? '→' : '+'}</span>${V2.sgSide(x.c.p, ' in')}</div>`;
V2.sgCard = ({pl, k, g0, attr, side, hidden, why, main}) => { const g1 = g0 != null ? planGrade(pl) : null, ok = g0 != null && g1 != null, r0 = ok ? Math.round(g0) : null, r1 = ok ? Math.round(g1) : null, d = ok ? r1 - r0 : null;
  const word = ok && CH.wordOf(g0) !== CH.wordOf(g1) ? CH.wordOf(g1) : '', ln = LANE.lineParts(pl);
  // Why?: the plan's own reasons (else, for a side option, what keeps it level), the weak-spot change first (as today)
  const W = why || {lines: pl._why && pl._why.length ? pl._why : side ? ['Keeps every check and your speed control', 'About the same grade as now, with a different look'] : [], wk: pl._wk};
  const wk = W.wk ? `<li>Weak spots: <b>${V2.esc(W.wk[0])}</b> → <b>${V2.esc(W.wk[1])}</b></li>` : '', L = W.lines.filter(Boolean), nr = L.length + (wk ? 1 : 0);
  return `<li${hidden ? ' hidden' : ''}><span class="np-eyebrow">Suggestion ${k + 1}</span>${d != null ? `<div class="tm-mv"><b>${d > 0 ? '+' + d : d < 0 ? '−' + Math.abs(d) : '±0'}</b><span>${r0} → ${r1}</span>${word ? `<em class="sg2-band">${V2.esc(word)}</em>` : ''}</div>` : ''}<div class="tm-swaps">${pl.ch.map(V2.sgSwap).join('')}</div>
    ${ln ? `<p class="sg2-ln ${ln.k}"><b>${ln.tag}</b> ${ln.text}</p>` : ''}${main ? `<button type="button" class="np-btn" ${attr}="${k}">Apply</button>` : `<button type="button" class="np-btn2" ${attr}="${k}"><span>Apply</span></button>`}
    ${nr ? `<details class="sg2-why"><summary><span class="q">Why?</span><span class="n">${nr} reason${nr === 1 ? '' : 's'}</span></summary><ul>${wk}${L.map(l => `<li>${V2.undotHtml(l)}</li>`).join('')}</ul></details>` : ''}</li>`; };

// ---------- the section: the settings, then the suggestions (the first; Show more opens the next two; then See all) ----------
V2.sgSec = D => { const S2 = D.sug; if (!S2) return ''; const ms = D.ms, P = V2.plan.plans || [];
  // the winner rates some reasons and the team checks quote ("75% of 113 recent event winners…"): today's measurement, started
  // as today's render() starts it (once per data version; it redraws the page when it has the numbers)
  safe('checklist claims', ckWinRefresh);
  let body;
  if (S2.pending) { const last = V2._sgLast;
    // while the next suggestions are worked out the ones on screen stay, faded and not tappable (as today), so nothing jumps
    body = `<p class="tm-sub sg2-wait" role="status">Working out the best changes for your team…</p>${last ? `<div class="sg2-stale" inert aria-busy="true">${last}</div>` : ''}`; }
  else { V2.sgReasons(ms); const side = !P.length && Array.isArray(P.more) && P.more.length > 0, top = S2.top, g0 = top.length ? top[0].g0 : null;
    const open = ui.sugMore === ms.map(m => m.p.n).join(','), hid = top.length - 1;
    // above the cards, as today: a Protect fix (a set change, not a swap), then a game-plan gap no swap in this pool can close
    const pre = V2.protCard(ms) + (P.nothing ? V2.noneCard() : ''), gap = pre + (P.gapNote ? `<p class="sg2-gap"><b>Note:</b> ${V2.esc(P.gapNote)}</p>` : '') /* a note is advice, as in Team Checks: it can't read as contradicting "Nothing to fix" (Sim, Nov 12) */;
    const all = '<button type="button" class="np-link sg2-all" data-v2sgall>See All Suggestions ›</button>';
    // A3 proposal (Sim's fix plan, Nov 12: "your recommendation"): a best swap that doesn't raise the score (±0 or lower) gets no
    // card and no Apply: the quiet line stays and the swaps wait behind See all suggestions (same rule as Matchups' Best fix)
    const up = top.length && g0 != null ? Math.round(planGrade(top[0].pl)) - Math.round(g0) : null;
    if (top.length && up != null && up <= 0) { body = `${gap || `<p class="tm-sub">Nothing raises this team’s Strength Score right now.</p>`}${all}`; V2._sgLast = body;
      return `<section class="tm-sec tm-sgs" id="tm-sg"><h2 class="u">Suggestions</h2>${V2.sgCtl()}${V2.undoBar()}${body}</section>`; }
    body = !top.length ? (side ? `<p class="tm-sub">Nothing raises this team’s Strength Score right now, and every other swap would lower it.</p>${all}`
        : gap || '<p class="tm-sub">No single change from this pool raises the team’s Strength Score. Try another pool above, or see Matchups for what to watch.</p>')
      : `${gap}<p class="tm-sub">${P.nothing ? 'Optional swaps:' : side ? 'Nothing raises this team’s Strength Score right now. These swaps keep every check and about the same score, with a different look:' : 'What to change, best first.'}</p>
      <ol class="tm-sug">${top.map((x, k) => V2.sgCard({pl: x.pl, k, g0, attr: 'data-v2plan', side, hidden: k > 0 && !open, main: !k})).join('')}</ol>
      ${hid > 0 && !open ? `<button type="button" class="np-link sg2-all" data-v2sgmore aria-expanded="false">Show ${hid} more suggestion${hid === 1 ? '' : 's'}</button>` : all}`;
    V2._sgLast = body; }
  return `<section class="tm-sec tm-sgs" id="tm-sg"><h2 class="u">Suggestions</h2>${V2.sgCtl()}${V2.undoBar()}${body}</section>`; };
// the Protect fix: only 0-2 of the six run Protect while their usual sets do; Add Protect puts it in those sets (today's
// LANE.protFix / protApply and its [data-protfix] handler, 36-lanes.js; the words from LANE.protWords)
V2.protCard = ms => { let f = null; try { f = LANE.protFix(ms); } catch (e) {} if (!f) return ''; const W = LANE.protWords(f);
  return `<div class="sg2-fix"><p class="sg2-ln fix"><b>Fix</b> ${W.fix}</p><p class="tm-sub">${W.who} ${f.who.map(m => `<b>${V2.esc(m.d)}</b>`).join(' and ')}.</p><button type="button" class="np-btn2" data-protfix><span>${W.btn}</span></button></div>`; };
// Nothing to fix: every basic, no fix and no swap past the measured bar (today's plans.nothing, LANE.apply); the edge now is in
// play: Battle, and the sets (words from LANE.NONE)
V2.noneCard = () => { const N = LANE.NONE;
  // Sim, Nov 11 (#5): one quiet paragraph, not a headline (beside optional swaps a big "Nothing to fix." read as a contradiction)
  return `<div class="sg2-nwrap"><p class="sg2-none"><b>${N.head}</b> ${N.body} ${N.edge}</p><p class="sg2-nact"><a class="np-link" href="#battle">Battle</a><a class="np-link" href="#sets">Sets</a></p></div>`; };
// the Undo bar: the last suggestion (or Quick add) applied, until the team is changed some other way; Undo steps back one at a
// time, up to 8 (today's undo stack and its [data-undobar] handler, 06-helpers.js)
// A6 proposal (Sim's fix plan: one message per action, one Undo): after an Apply, the "Applied … Undo" bar in Suggestions is the
// message when it is on screen; the toast (with its Undo) shows only when that bar is out of sight (applied from a sheet, Matchups)
// "on screen" means clear of the sticky header and jump bar above and the phone bar below (Nov 12: under the header it counted as seen)
V2.appliedSay = (t) => { const b = document.querySelector('.sg2-undo'), r = b && b.getBoundingClientRect(), rs = s => [...document.querySelectorAll(s)].map(e => e.getBoundingClientRect()).filter(q => q.height);
  const top = Math.max(0, ...rs('.np-head,.tm-jump').filter(q => q.top < innerHeight / 2).map(q => q.bottom)), bot = Math.min(innerHeight, ...rs('.np-bar,.np-dock').filter(q => q.top > innerHeight / 2).map(q => q.top));
  if (r && r.height && r.top >= top && r.bottom <= bot) return; toast(t, true); };
V2.undoBar = () => { const t = undoTop(); return t ? `<div class="sg2-undo" role="status"><span>Applied <b>${V2.esc(t.label)}</b></span><button type="button" class="np-btn2" data-undobar><span>Undo</span></button></div>` : ''; };

// Show more: the next suggestions open in place (already worked out) and the link becomes See all suggestions (as today)
document.addEventListener('click', e => { if (!e.target.closest || !e.target.closest('[data-v2sgmore]')) return; ui.sugMore = members().map(m => m.p.n).join(',');
  V2.redraw(); const b = document.querySelectorAll('#tm-sg .tm-sug > li')[1], f = b && b.querySelector('[data-v2plan]'); if (f) f.focus({preventScroll: true}); });

// ---------- All Suggestions: a sheet with every suggestion the planner found (My Team's first, then the other ideas) ----------
V2.sgAll = {list: [], n: 12};
V2.allSugsHtml = () => { const ms = members(), P = V2.plan.plans || [], shown = ui.planList || [], X = V2.sgX(ms), U = V2.sgAll;
  const rest = [...P, ...(P.more || [])].filter(pl => !shown.includes(pl)), list = U.list = [...shown, ...rest]; let g0 = null; try { g0 = P.gBase != null ? P.gBase : ms.length === 6 ? gradeTeam(ms) : null; } catch (e) {}
  const side = !P.length, left = list.length - shown.length - U.n;
  const cards = list.slice(0, shown.length + U.n).map((pl, k) => { let why = null;
    if (!(pl._why && pl._why.length)) { try { const r = planWhy(pl, k, X, false); why = {lines: r.lines, wk: r.wk}; } catch (e) {} }
    return V2.sgCard({pl, k, g0, attr: 'data-v2plana', side: side && k < shown.length, why, main: !k}); }).join('');
  return `<div class="sga2"><div class="np-eyebrow">${list.length} suggestion${list.length === 1 ? '' : 's'}</div><h2 class="u">All Suggestions</h2>
    <p class="tm-sub">The ones on My Team first, then every other change the planner found in ${V2.esc({box: 'your box', boxfill: 'your box and the best Pokémon to catch', all: 'the whole roster'}[ui.pool])}, each with how it moves the Strength Score.</p>
    ${list.length ? `<ol class="tm-sug">${cards}</ol>${left > 0 ? `<button type="button" class="np-link sg2-all" data-v2sgamore>Show ${Math.min(12, left)} more</button>` : ''}` : '<p class="tm-sub">No suggestions for this team from this pool.</p>'}</div>`; };
V2.openAllSugs = () => { if (!members().length) return; V2.sgAll.n = 12; V2.sheet(V2.allSugsHtml(), {label: 'All Suggestions'}); };
document.addEventListener('click', e => { if (!e.target.closest) return;
  if (e.target.closest('[data-v2sgall]')) { V2.openAllSugs(); return; }
  if (e.target.closest('[data-v2sgamore]')) { V2.sgAll.n += 12; const el = document.querySelector('.sga2'); if (el) el.outerHTML = V2.allSugsHtml(); const s = document.querySelector('.np-sheet'); if (s) s.focus({preventScroll: true}); } });

// ---------- Apply (today's applyPlan: Undo kept, what it swapped out isn't offered straight back) ----------
// a second tap within half a second is ignored, as on today's page (a double tap can't apply two suggestions)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2plan],[data-v2plana]'); if (!b) return; const now = Date.now(); if (now - (V2._sgTap || 0) < 450) return; V2._sgTap = now;
  const fromAll = b.dataset.v2plana != null, pl = fromAll ? V2.sgAll.list[+b.dataset.v2plana] : (ui.planList || [])[+b.dataset.v2plan]; if (!pl) return;
  if (fromAll) V2.closeSheet(true); applyPlan(pl); render(); V2.appliedSay(`Applied: ${pl.ch.map(x => x.c.p.d).join(' and ')}`); });

// ---------- Problems and Team Checks (in the Team Checks section): a fold, closed until opened, remembered per device ----------
// Today's rows (problemRows), Quick add picks (quickList / quickInfo), the team checks (proChecks, ckState, CK_TXT) and the verdict
// (verdictData); the first 4 rows show, Show N more / Show less for the rest; opening the fold opens the first problem with a fix.
V2.fx = {open: new Set(), qa: [], was: (() => { try { return !!LS.get('cc2.chf.rfix', null); } catch (e) { return false; } })()};
V2.fixRows = (D, useA, a, tRows, P) => { const ms = D.ms, out = problemRows(ms, a, tRows, useA, P, t => V2.typeChip(t)), used = new Set(); let qa = 0; V2.fx.qa = [];
  const tag = (t, cls, title) => `<span class="sg2-tag${cls ? ' ' + cls : ''}"${title ? ` title="${V2.esc(title)}"` : ''}>${t}</span>`;
  const pick = (key, pl) => { const x = pl.ch[0], p = x.c.p, I = quickInfo(key, pl, ms), i = V2.fx.qa.push(pl) - 1, idea = pl.gem ? '' : ideaTag(p);
    return `<li class="sg2-qp"><div class="sg2-qt"><img src="${V2.art(SPRITE_ID[p.n])}" alt=""><div><b>${V2.nameHtml(p.d)}</b><span class="ty">${(p.t || []).map(V2.typeChip).join('')}</span></div></div>
      <p class="sg2-tags">${p.m ? tag('Mega', 'mega', 'Mega Evolution') : ''}${I.box ? tag('In your box', '', '') : I.catch ? tag('To catch', '', 'Not in your box yet') : ''}${pl.gem ? tag('Hidden gem', 'gem', '') : idea ? tag('Idea', '', (idea.match(/title="([^"]*)"/) || [])[1] || '') : ''}</p>
      ${I.why ? `<p class="sg2-qw">${V2.esc(V2.undot(I.why))}</p>` : ''}${I.thr ? `<p class="sg2-qw">${V2.undotHtml(I.thr)}</p>` : ''}
      <div class="sg2-qa"><button type="button" class="np-btn2" data-v2qa="${i}"><span>${V2.esc(I.btn)}</span></button><span class="fine" title="${V2.esc(V2.wl(I.fitTitle))}">${V2.wl(I.fit)}</span></div></li>`; };
  const row = ([s, l, tx, key]) => { const Q = key && P && qa++ < 8 ? quickList(key, P, ms, used) : null, n = Q ? Q.picks.length : 0, minor = !Q && (s === 'lo' || s === 'ok');
    // A2 proposal: a weakness the "No major weak spot" check lets pass is called minor, so the two can't read as a contradiction
    if (l === 'Weakness' && (D.basics || []).some(x => /major weak spot/i.test(x.label) && x.ok)) l = 'Minor weakness';
    const head = `<span class="sg2-sev ${s}">${V2.esc(l)}</span><span class="sg2-pt">${V2.undotHtml(tx)}</span>`;
    if (!n) return `<div class="sg2-prob${minor ? ' minor' : ''}">${head}${Q && Q.note ? `<p class="fine sg2-qn">${Q.note}</p>` : ''}</div>`;
    return `<details class="sg2-prob sg2-pf" data-v2pk="${V2.esc(key)}"${V2.fx.open.has(key) ? ' open' : ''}><summary>${head}<span class="sg2-fixn">${n} fix${n > 1 ? 'es' : ''}</span></summary><div class="sg2-qbox"><p class="sg2-k">Quick add</p><ul class="sg2-qps">${Q.picks.map(pl => pick(key, pl)).join('')}</ul></div></details>`; };
  const real = out.filter(o => o[0] !== 'ok'), rows = out.map(row), cap = ui.needsAll ? rows.length : 4, more = rows.length - cap;
  return {real, html: (real.length ? '' : `<div class="sg2-prob"><span class="sg2-sev ok">${PROB_TXT.clear}</span><span class="sg2-pt">${PROB_TXT.clearWhy}</span></div>`) + rows.slice(0, cap).join('')
    + (more > 0 ? `<button type="button" class="np-link sg2-all" data-v2needs>Show ${more} more</button>` : ui.needsAll && rows.length > 4 ? '<button type="button" class="np-link sg2-all" data-v2needs>Show less</button>' : '')}; };
V2.fixFold = D => { const ms = D.ms; if (!ms || !ms.length) return ''; const useA = $('useAbil').checked, a = analyze(playForm(ms), useA), {tRows} = offenseRows(ms, useA);
  const ready = V2.plan.key === V2.planKey() && V2.plan.plans, P = ready ? V2.plan.plans : null; if (P) ui.plans = P;
  let pr; try { pr = V2.fixRows(D, useA, a, tRows, P); } catch (e) { console.error(e); pr = {real: [], html: ''}; }
  const PG = proGrades(ms, useA), CK = D.CK || proChecks(ms, useA), V = verdictData(ms, a, PG, CK);
  // the team checks card
  const ckLi = (x, nt) => { const k = ckState(x); return `<li class="${k}"><b class="mk" aria-label="${CK_MARK[k][1]}">${CK_MARK[k][0]}</b><div><b>${V2.wl(x.label)}</b><span>${V2.esc(V2.undot(V2.wl(x.ok ? x.have : x.miss, CH.hand(V.RD))))}</span>${x.pro && !nt ? `<small>${V2.undotHtml(x.pro)}</small>` : ''}</div></li>`; };
  const ckCard = CK ? `<div class="sg2-ckc"><p class="sg2-ckh"><span class="sg2-k">Team checks${!CK.full ? ' so far' : ''}</span><b class="u">${CK.pass} of ${CK.n} checks</b></p><p class="fine">${CK_TXT.intro}</p>
    <ul class="sg2-ckl">${CK.items.filter(x => !x.note).map(x => ckLi(x)).join('')}</ul>${CK.items.some(x => x.note) ? `<p class="sg2-ckn"><b>${CK_TXT.notes}</b><span>${CK_TXT.notesWhy}</span></p><ul class="sg2-ckl nt">${CK.items.filter(x => x.note).map(x => ckLi(x, 1)).join('')}</ul>` : ''}</div>` : '';
  // the verdict: legal and items, threats, checks, real results, your games, type balance
  const hand = !V.illegal && V.RD && CH.hand(V.RD) ? ` · ${CH.handTxt(V.RD, true)}` : '';
  const chips = [V.score != null && CH.hand(V.RD) ? `<span><b>${CH.hand(V.RD).x}/${CH.hand(V.RD).n}</b> handled${V2.tip('readiness')}</span>` : '', CK ? `<span><b>${CK.pass}/${CK.n}</b> checks${V2.tip('checklist')}</span>` : '', `<span class="${V.illegal ? 'bad' : 'ok'}"><b>${V.illegal ? 'Not legal' : 'Legal'}</b></span>`].join('');
  const vd = `<div class="sg2-vd ${V.lvl}"><dl>${V.rows.filter(r => !/^Checklist$/.test(r[0])).map(r => `<div><dt>${r[0]}</dt><dd>${V2.undotHtml(r[1])}</dd></div>`).join('')}</dl>${typeof regNote === 'function' ? regNote('fine') : ''}</div>`;
  // A2: the fold holds the things to know and the read that appears nowhere else; the checks are listed once, above
  const sub = [pr.real.length ? `${pr.real.length} thing${pr.real.length === 1 ? '' : 's'}` : 'Nothing to know', 'types', V.illegal ? 'not legal yet' : 'legal'].filter(Boolean).join(', ');
  // A6 (Sim's fix plan): one live "Working out…" message at load, not two; Suggestions' own line is the one read out
  const isOpen = !!LS.get('cc2.chf.rfix', null), probs = P ? pr.html : `<p class="tm-sub">Working out the fixes for your team…</p>${V2.fx.last ? `<div class="sg2-stale" inert aria-busy="true">${V2.fx.last}</div>` : ''}`;
  if (P) V2.fx.last = pr.html;
  return `<details class="sg2-fold" data-v2fix${isOpen ? ' open' : ''}><summary><span class="t">Things to Know</span><span class="s">${V2.esc(sub)}</span></summary>
    <div class="sg2-fb"><div class="sg2-probs">${probs}</div>${vd}${V2.typesHtml ? V2.typesHtml() : ''}</div></details>`; };
// the fold remembers open / closed on this device (today's key, cc2.chf.rfix); opening it opens the first problem with a fix
document.addEventListener('toggle', e => { const d = e.target; if (!d || !d.matches) return;
  // (a redraw draws the fold again, already open: only a real opening opens the first problem, as on today's page)
  if (d.matches('[data-v2fix]')) { const was = V2.fx.was; V2.fx.was = d.open; LS.set('cc2.chf.rfix', d.open ? 1 : 0); if (d.open && !was) { const rows = [...d.querySelectorAll('details[data-v2pk]')]; if (rows.length && !rows.some(x => x.open)) rows[0].open = true; } }
  else if (d.matches('[data-v2pk]')) { if (d.open) V2.fx.open.add(d.dataset.v2pk); else V2.fx.open.delete(d.dataset.v2pk); } }, true);
// Show N more / Show less (today's ui.needsAll), and Quick add (today's applyQuick: Undo kept, the Undo bar shows it)
document.addEventListener('click', e => { if (!e.target.closest) return;
  if (e.target.closest('[data-v2needs]')) { ui.needsAll = !ui.needsAll; V2.redraw(); return; }
  const b = e.target.closest('[data-v2qa]'); if (!b) return; const now = Date.now(); if (now - (V2._sgTap || 0) < 450) return; V2._sgTap = now;
  const pl = V2.fx.qa[+b.dataset.v2qa]; if (!pl) return; const say = applyQuick(pl); render(); V2.appliedSay(say); });

// ---------- "?" explainers (today's TIPS words, 36-sug-data.js): tap for a small bubble; tap outside, Escape or scrolling closes it ----------
V2.tip = k => { const T0 = TIPS[k], T = T0 && [V2.wl(T0[0]), V2.wl(T0[1])]; return T ? `<button type="button" class="sg2-tip" data-v2tip="${k}" aria-expanded="false" aria-label="${V2.esc(/^(What|How)\b/.test(T[0]) ? T[0] : `What is ${T[0]}?`)}">?</button>` : ''; };
V2.tipClose = () => { document.querySelectorAll('.sg2-tipop').forEach(x => x.remove()); document.querySelectorAll('[data-v2tip][aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2tip]');
  if (!b) { if (!(e.target.closest && e.target.closest('.sg2-tipop'))) V2.tipClose(); return; }
  e.preventDefault(); const was = document.querySelector('.sg2-tipop'); V2.tipClose(); if (was && was.dataset.k === b.dataset.v2tip) return;
  const T0 = TIPS[b.dataset.v2tip], T = T0 && [V2.wl(T0[0]), V2.wl(T0[1])]; if (!T) return; const p = document.createElement('div'); p.className = 'sg2-tipop'; p.dataset.k = b.dataset.v2tip; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', T[0]);
  p.innerHTML = `<b class="u">${V2.esc(T[0])}</b><p>${V2.esc(T[1])}</p><a class="np-link" href="#method">How we calculate →</a>`; document.body.append(p); b.setAttribute('aria-expanded', 'true');
  // place it from the drawn 24px tile, not the 44px tap area around it (A15), so it sits where it always did
  const q = b.getBoundingClientRect(), g = Math.max(0, (q.height - 24) / 2), r = {left: q.left + g, width: q.width - 2 * g, top: q.top + g, bottom: q.bottom - g}, w = Math.min(340, innerWidth - 32); p.style.width = w + 'px'; p.style.left = Math.max(16, Math.min(innerWidth - w - 16, r.left + r.width / 2 - w / 2)) + 'px';
  const below = r.bottom + 8 + p.offsetHeight < innerHeight - 72; p.style.top = (below ? r.bottom + 8 : Math.max(16, r.top - 8 - p.offsetHeight)) + scrollY + 'px'; });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.querySelector('.sg2-tipop')) { const b = document.querySelector('[data-v2tip][aria-expanded="true"]'); V2.tipClose(); if (b) b.focus(); } });
addEventListener('scroll', () => { if (document.querySelector('.sg2-tipop')) V2.tipClose(); }, {passive: true});

// ---------- Types (Nov 12, today's "Types" fold, every part kept; Sim: inside Things to Know) ----------
// Offense / Defense switch, today's headlines (threat 2HKOs, types hit; weaknesses vs resists, top threats that beat 3+),
// the type lists, the two-Mega pick, and Full Tables (today's offense table and defense grid) as a sheet.
// Working-out is today's shared logic: analyze, offenseRows, prepOf, playForm, mult (no maths copied here).
V2.ty = {mode: (() => { try { return LS.get('np2.seg.types', 'off') === 'def' ? 'def' : 'off'; } catch (e) { return 'off'; } })()};
V2.tyData = () => { const ms = members(); if (!ms.length) return null; const msPlay = playForm(ms), a = analyze(msPlay, true);
  let RD = null; try { RD = prepOf(ms); } catch (e) {}
  const RDd = RD ? {over: RD.rows.filter(r => r.losers.length >= 3), hit: RD.rows.filter(r => r.rows.some(x => x.du && x.du.nM <= 2)).length, noHit: RD.rows.filter(r => !r.rows.some(x => x.du && x.du.nM <= 2)).sort((x, y) => y.t.w - x.t.w)} : null;
  const off = offenseRows(ms, true); return {ms, msPlay, a, RDd, off}; };
V2.typesHtml = () => { const D = V2.tyData(); if (!D) return ''; const {a, RDd, off, ms} = D, E = V2.esc, chips = l => l.length ? l.join('') : '<span class="fine">None</span>';
  const ch = (t, k) => `<span class="ed-ty">${V2.typeChip(t)}${k ? `<b>${k}</b>` : ''}</span>`;
  const row = (k, v) => `<div class="ty2-r"><span class="lbl">${k}</span><span class="ed-tys">${v}</span></div>`;
  const offB = `<p class="ty2-h"><b>${RDd ? `You OHKO or 2HKO ${RDd.hit} of the top 30 threats` : '—'}</b><span class="fine">${off.covered}/18 types hit super effectively by at least one of yours</span></p>
    ${RDd && RDd.noHit.length ? row('Nothing 2HKOs', `<span class="ty2-t">${RDd.noHit.slice(0, 6).map(r => E(r.t.d)).join(', ')}</span>`) : ''}
    ${row('Nobody hits super effectively', chips(off.tRows.filter(r => !r.hits.length).map(r => ch(r.t))))}
    ${off.stabOnly.length ? `<p class="fine">${E(off.stabOnly.join(', '))}: no move data yet, so only their own types are counted.</p>` : ''}`;
  const megas = ms.filter(m => m.p && m.p.m), keep = megas.length > 1 ? (megas.find(m => m.p.n === ui.megaPick) || megas[0]) : null;
  const defB = `<p class="ty2-h"><b>${a.excess ? `${a.excess} more weakness${a.excess === 1 ? '' : 'es'} than resistances` : 'Every weakness is covered by a resist'}</b><span class="fine">${ms.length}/6 Pokémon${RDd ? ` · ${RDd.over.length} of the top 30 threats beat 3+ of yours 1-on-1${RDd.over.length ? ` (${RDd.over.slice(0, 3).map(r => E(r.t.d)).join(', ')}${RDd.over.length > 3 ? ` and ${RDd.over.length - 3} more` : ''})` : ''}` : ''}</span></p>
    ${row('More weak than resist', chips(a.rows.filter(t => t.w > t.r).map(t => ch(t.atk, t.w - t.r > 1 ? '×' + (t.w - t.r) : ''))))}
    ${row('Nobody resists', chips(a.unresisted.map(t => ch(t))))}
    ${row('Even split', chips(a.rows.filter(t => t.w > 0 && t.w === t.r).map(t => ch(t.atk))))}
    <p class="fine">×2 next to a type means 2 more of yours are weak to it than resist it.</p>
    ${keep ? `<p class="fine ty2-mega">Only one Mega Evolves per battle, so this reads <b>${E(keep.d)}</b> as the Mega and the others in base form. Show: ${megas.map(m => `<button type="button" class="np-link" data-v2megapick="${E(m.p.n)}" aria-pressed="${m === keep}">${V2.nameHtml(m.d)}</button>`).join(' · ')}</p>` : ''}`;
  return `<div class="ty2"><div class="ty2-hd"><h3 class="u">Types</h3>${V2.slide('types', [['off', 'Offense'], ['def', 'Defense']], V2.ty.mode, 'Types: offense or defense')}</div>
    <p class="fine">${V2.ty.mode === 'off' ? 'What you hit.' : 'What hits you.'}</p>${V2.ty.mode === 'off' ? offB : defB}
    <button type="button" class="np-link ty2-full" data-v2tytables>Full Tables ›</button></div>`; };
V2.openTypeTables = () => { const D = V2.tyData(); if (!D) return; const {a, off, msPlay} = D, E = V2.esc;
  const m = x => `<span class="ty2-m${x === 0 ? ' z' : x >= 2 ? ' hi' : x < 1 ? ' lo' : ''}">${x === 0 ? '0' : x === .25 ? '¼' : x === .5 ? '½' : x === 1 ? '' : x + '×'}</span>`;
  const offT = `<table class="ty2-tb ty2-off"><thead><tr><th>Defending type</th><th>Best</th><th>Who hits it super effectively</th></tr></thead><tbody>${off.tRows.map(r => { const x = r.best ? r.best.x : 0;
    return `<tr${r.hits.length ? '' : ' class="no"'}><td>${V2.typeChip(r.t)}</td><td>${m(x)}</td><td>${r.hits.length ? r.hits.map(h => `${V2.nameHtml(h.m.d)} <span class="fine">(${E(h.b.e.move)})</span>`).join(', ') : '<span class="fine">Nobody</span>'}</td></tr>`; }).join('')}</tbody></table>`;
  const defT = `<table class="ty2-tb ty2-grid"><thead><tr><th>Attack</th>${msPlay.map(x => `<th title="${E(x.d)}">${E(x.d.replace('Mega ', 'M·').slice(0, 12))}</th>`).join('')}<th>Weak</th><th>Resist</th><th>Net</th></tr></thead><tbody>${a.rows.map(t => `<tr${t.w > t.r ? ' class="no"' : ''}><td>${V2.typeChip(t.atk)}</td>${msPlay.map(x => `<td>${m(mult(t.atk, x.types, x.ability, true))}</td>`).join('')}<td>${t.w || ''}</td><td>${t.r || ''}</td><td>${t.net > 0 ? '+' + t.net : t.net < 0 ? t.net : '0'}</td></tr>`).join('')}</tbody></table>`;
  V2.sheet(`<div class="gp2 ty2s"><div class="np-eyebrow"><span>My Team · Types</span></div><h2 class="u">Full Tables</h2>
    <h3 class="u">Offense: what you hit</h3><div class="ty2-wrap">${offT}</div><h3 class="u">Defense: what hits you</h3><div class="ty2-wrap">${defT}</div></div>`, {label: 'Full Tables'}); };
document.addEventListener('v2slide', e => { if (e.detail.key !== 'types') return; V2.ty.mode = e.detail.value; try { LS.set('np2.seg.types', V2.ty.mode); } catch (er) {} const el = document.querySelector('.ty2'); if (el) { el.outerHTML = V2.typesHtml(); const f = document.querySelector(`.ty2 [data-v2slide="types"] [data-v="${V2.ty.mode}"]`); if (f) f.focus(); } });
document.addEventListener('click', e => { if (e.target.closest('[data-v2tytables]')) { V2.openTypeTables(); return; }
  const b = e.target.closest('[data-v2megapick]'); if (b) { ui.megaPick = b.dataset.v2megapick; const el = document.querySelector('.ty2'); if (el) el.outerHTML = V2.typesHtml(); } });
