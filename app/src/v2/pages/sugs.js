// ---------- My Team › Suggestions (R4, Nov 11): the controls, the cards and what sits around them ----------
// Every setting, list, number and word comes from today's shared logic (36-sug-data.js, 29-fix-planner.js, 36-lanes.js);
// this file only draws them in the new design and passes taps back. The planner run itself is in team.js (V2.plan).

// ---------- the settings: today's sliders, same choices, same saved settings, same messages ----------
/* advisor (Nov 15): Suggestions answer first; the settings follow, still visible, under a small label (Nov 16) */
/* Sim, Nov 18 (Q5 A): desktop (1100+) folds it as phones do; Sim Q71 (Nov 20, 8:17 AM): tablets 700-1099 fold it too (was open) */
V2.sgAdj = () => {
  // Sim, Nov 18 (C, phone length): on phones Adjust Suggestions is a fold; its closed line says the current settings
  const mg = megaGoal(), ex = (S.excl || []).length, sum = [{box: 'My Box', boxfill: 'Box + Catch', all: 'Whole Roster'}[ui.pool] || '', `${mg} Mega${+mg === 1 ? '' : 's'}`,
    `Swap Mega: ${$('swapMega').checked ? 'Yes' : 'No'}`, `Abilities: ${$('useAbil').checked ? 'Yes' : 'No'}`, ex ? `${ex} never suggested` : ''].filter(Boolean).join(' · ');
  return `<details class="sg2-fold sg2-adjf" data-v2adj${V2.adjOpen ? ' open' : ''}><summary><span class="t">Adjust Suggestions</span><span class="s">${V2.esc(sum)}</span></summary><div class="sg2-adj">${V2.sgCtl()}</div></details>`; };
document.addEventListener('toggle', e => { const d = e.target; if (d && d.matches && d.matches('[data-v2adj]')) V2.adjOpen = d.open; }, true); /* open stays open through redraws (a new setting redraws the page) */
V2.sgCtl = () => `<div class="sg2-ctl" role="group" aria-label="Suggestion settings">
  <div class="sg2-c sg2-pool"><span class="sg2-k">Suggest from</span>${V2.slide('sgpool', [['box', 'My Box'], ['boxfill', 'Box + Catch'], ['all', 'Whole Roster']], ui.pool, 'Suggest from')}</div>
  <div class="sg2-c"><span class="sg2-k">Megas on team</span>${V2.slide('sgmega', [['0', '0'], ['1', '1'], ['2', '2']], String(megaGoal()), 'Megas on the team')}</div>
  <div class="sg2-c"><span class="sg2-k">Swap my Mega?</span>${V2.slide('sgswap', [['0', 'No'], ['1', 'Yes']], $('swapMega').checked ? '1' : '0', 'Suggestions can swap out my Mega')}</div>
  <div class="sg2-c sg2-abil"><span class="sg2-k">Count Abilities?</span>${V2.slide('sgabil', [['0', 'No'], ['1', 'Yes']], $('useAbil').checked ? '1' : '0', 'Count Abilities like Levitate in matchups and suggestions')}</div></div>${V2.exclLine()}`; /* Sim Q6 (Nov 16): Count abilities beside Megas and Swap (today's page has it; the new build kept it always on, hidden) */
// Swap my Mega? is kept in this browser on the new build (today's page forgets it on reload while Megas on team is kept: SUG-03b)
try { if (V2.LS.get('np2.swapMega') === '1') $('swapMega').checked = true; } catch (e) {}
try { if (V2.LS.get('np2.useAbil') === '0') $('useAbil').checked = false; } catch (e) {} /* Count abilities, kept in this browser too */
// a new choice: the setting and its message at once; the page redraws once the plate has slid over (so the slide is seen)
V2.sgLater = fn => { clearTimeout(V2._sgT); V2._sgT = setTimeout(fn, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240); };
document.addEventListener('v2slide', e => { const {key, value} = e.detail;
  if (key === 'sgpool') { if (value === ui.pool) return; const say = setPool(value); toast(say); V2.sgLater(render); }
  else if (key === 'sgmega') { if (+value === megaGoal()) return; const say = setMegaGoal(value); if (ui.ab && !ui.ab.busy) { if (V2.route() === 'build') runAutoBuild(); else ui.ab = null; } toast(say); V2.sgLater(render); } // Build results follow the new Megas number (today's 34-events.js)
  else if (key === 'sgswap') { const say = setSwapMega(value === '1'); if (!say) return; V2.LS.set('np2.swapMega', value); toast(say); V2.sgLater(render); }
  else if (key === 'sgabil') { const on = value === '1'; if ($('useAbil').checked === on) return; $('useAbil').checked = on; V2.LS.set('np2.useAbil', value); toast(on ? 'Counting abilities (Levitate, Flash Fire and the rest)' : 'Not counting abilities: types only'); V2.sgLater(render); } });
/* Refresh Suggestions (today's 'Refresh plans', Sim Q6): work the suggestions out again from scratch */
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-v2replan]'))) return; if (typeof clearCaches === 'function') clearCaches(); V2.plan = {key: null, plans: null, job: null}; render(); toast('Suggestions refreshed'); });

// ---------- the cards' reasons: today's planWhy over the same plans renderPlans works them out for ----------
// (the plans, then up to 3 side options when nothing improves the team), so Why? lists today's reasons word for word
V2.sgX = ms => { const useA = $('useAbil').checked, RD = prepOf(ms), P = V2.plan.plans || [];
  return {ms, a: analyze(playForm(ms), useA), plans: P, covered: offenseRows(ms, useA).covered, baseTS: RD && RD.score != null ? RD : null /* the whole report, so Why? can say how many top threats each plan handles (it needs the rows; review FP-3) */}; };
V2.sgReasons = ms => { const X = V2.sgX(ms), P = X.plans, list = [...P]; [...list, ...planExtra(P, list)].forEach((pl, k) => { try { planWhy(pl, k, X); } catch (e) { console.error(e); } }); return X; };
// today's page says " · " lists in words (undotText, shared): the same rule on the shared texts drawn here, text only (never inside tags)
V2.undot = s => undotText(String(s), ', ', /;/.test(s));
V2.undotHtml = h => { h = String(h); const list = /;/.test(h.replace(/<[^>]*>/g, '')); return h.split(/(<[^>]*>)/).map(x => x.startsWith('<') ? x : undotText(x, ', ', list)).join(''); };
// one suggestion as a card (also used by All Suggestions); the score change from today's planGrade, the kind line from today's LANE
// known-bug COV-04/SUGG-04 (Nov 17): the Pokémon coming in says whether it's in your box or still to catch (today's page: Box / TO CATCH)
V2.sgOwn = P => { try { return inBox(P) ? 'In your box' : ui.pool !== 'all' ? 'To catch' : ''; } catch (e) { return ''; } };
V2.sgSide = (m, cls) => { const P = m.p || m, own = cls === ' in' ? V2.sgOwn(P) : ''; return `<span class="tm-sw${cls}"><img src="${V2.art(SPRITE_ID[P.n])}" alt=""><span>${V2.nameHtml(m.d || V2.disp(P.n))}${own ? `<small class="tm-own">${own}</small>` : ''}</span></span>`; };
V2.sgSwap = x => `<div class="tm-chg" aria-label="${x.out ? V2.esc(x.out.d) + ' out, ' : 'Add '}${V2.esc(x.c.p.d)}${x.out ? ' in' : ''}${V2.sgOwn(x.c.p) ? ', ' + V2.sgOwn(x.c.p).toLowerCase() : ''}">${x.out ? V2.sgSide(x.out, '') : '<span class="tm-sw"></span>'}<span class="tm-ar" aria-hidden="true">${x.out ? '→' : '+'}</span>${V2.sgSide(x.c.p, ' in')}</div>`;
V2.sgCard = ({pl, k, g0, attr, side, hidden, why, main, facts}) => { const g1 = g0 != null ? planGrade(pl) : null, ok = g0 != null && g1 != null, r0 = ok ? Math.round(g0) : null, r1 = ok ? Math.round(g1) : null, d = ok ? r1 - r0 : null;
  const word = ok && CH.wordOf(g0) !== CH.wordOf(g1) ? CH.wordOf(g1) : '', ln = (() => { try { if (!pl._lane) LANE.of(pl, members(), g0); } catch (e) {} return LANE.lineParts(pl); })(); // plans from the planner's extra list have no lane yet: work it out, as today's 23-coverage.js does (Nov 10 fix; audit SUGG-06)
  // Why?: the plan's own reasons (else, for a side option, what keeps it level), the weak-spot change first (as today)
  const W = why || {lines: pl._why && pl._why.length ? pl._why : side ? ['Keeps every check and your speed control', 'About the same Strength Score as now, with a different look'] : [], wk: pl._wk};
  const wk = W.wk ? `<li>Weak spots: <b>${V2.esc(W.wk[0])}</b> → <b>${V2.esc(W.wk[1])}</b></li>` : '', L = W.lines.filter(Boolean), nr = L.length + (wk ? 1 : 0);
  return `<li${hidden ? ' hidden' : ''}><span class="np-eyebrow">Suggestion ${k + 1}</span>${d != null ? `<div class="tm-mv"><b>${d > 0 ? '+' + d : d < 0 ? '−' + Math.abs(d) : '±0'}</b><span>${r0} → ${r1}</span>${word ? `<em class="sg2-band">${V2.esc(word)}</em>` : ''}</div>` : ''}<div class="tm-swaps">${pl.ch.map(V2.sgSwap).join('')}</div>${facts || ''}
    ${ln ? `<p class="sg2-ln ${ln.k}"><b>${ln.tag}</b> ${ln.text}</p>` : ''}${main ? `<button type="button" class="np-btn" ${attr}="${k}">Apply</button>` : `<button type="button" class="np-btn2" ${attr}="${k}"><span>Apply</span></button>`}
    ${nr ? `<details class="sg2-why"><summary><span class="q">Why?</span><span class="n">${nr} reason${nr === 1 ? '' : 's'}</span></summary><ul>${wk}${L.map(l => `<li>${V2.undotHtml(V2.wl(l))}</li>`).join('')}</ul></details>` : ''}</li>`; };

// ---------- the section: the settings, then the suggestions (the first; Show more opens the next two; then See all) ----------
/* speed audit Nov 16 (4x CPU profile: the winners pass is ~9 s of work, each team's score alone >50 ms): on phones it starts only when
   Suggestions or Team Checks (the two places that quote it) come within a screen of view, or after 8 s with no tap or scroll; until then
   they say "most recent event winners", as before. On wide screens the sections are in view, so it starts at once, as before */
V2.ckWinSoon = () => { if (V2._ckGo) { safe('checklist claims', ckWinRefresh); return; } if (V2._ckWait) return; V2._ckWait = 1;
  /* speed (Nov 18, pre-launch 2d): scrolling Suggestions into view used to redraw the page at once, mid-scroll (the start-up stall,
     200-550 ms at 4x CPU); the refresh now waits until the scrolling pauses (as the planner does), and runs at once otherwise */
  const run = () => { if (performance.now() - (V2.lastScroll || -1e9) < 250) { setTimeout(run, 150); return; } safe('checklist claims', ckWinRefresh); };
  const go = () => { if (V2._ckGo) return; V2._ckGo = 1; V2._ckWait = 0; try { V2._ckObs && V2._ckObs.disconnect(); } catch (e) {} clearTimeout(V2._ckT); removeEventListener('scroll', poke); run(); };
  const poke = () => { clearTimeout(V2._ckT); V2._ckT = setTimeout(go, 8000); };
  /* pl-2c (Nov 19): looked for once the page is on screen; with the draw in two steps (V2.warmDraw) that is after the second step */
  (V2.afterPre || (f => setTimeout(f, 0)))(() => { const els = [...document.querySelectorAll('.tm-sgs,.tm-cks,.tm-tabs')]; /* q59: on phones the two are tabs, hidden until picked, so the tab bar above them (where they would start) counts too */ if (!els.length || typeof IntersectionObserver !== 'function') { go(); return; }
    V2._ckObs = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) go(); }, {rootMargin: '100% 0px'}); els.forEach(e => V2._ckObs.observe(e)); });
  addEventListener('scroll', poke, {passive: true}); poke(); };
V2.sgSec = D => { const S2 = D.sug; if (!S2) return ''; const ms = D.ms, P = V2.plan.plans || [];
  // the winner rates some reasons and the team checks quote ("75% of 113 recent event winners…"): today's measurement, started
  // as today's render() starts it (once per data version; it redraws the page when it has the numbers)
  V2.ckWinSoon();
  let body;
  if (S2.pending) { const last = V2._sgLast;
    // while the next suggestions are worked out the ones on screen stay, faded and not tappable (as today), so nothing jumps
    body = `<p class="tm-sub sg2-wait" role="status">Working out the best changes for your team…</p>${last ? `<div class="sg2-stale" inert aria-busy="true">${last}</div>` : ''}`; }
  else { V2.sgReasons(ms); const side = !P.length && Array.isArray(P.more) && P.more.length > 0, top = S2.top, g0 = top.length ? top[0].g0 : null;
    const open = ui.sugMore === ms.map(m => m.p.n).join(','), hid = top.length - 1;
    // above the cards, as today: a Protect fix (a set change, not a swap), then a game-plan gap no swap in this pool can close
    const pre = V2.itemFixCard(ms) + V2.setTipsCard() + V2.protCard(ms) + (P.nothing ? V2.noneCard() : ''), gap = pre + (P.gapNote ? `<p class="sg2-gap"><b>Note:</b> ${V2.esc(P.gapNote)}</p>` : '') /* a note is advice, as in Team Checks: it can't read as contradicting "Nothing to fix" (Sim, Nov 12) */;
    const all = `<span class="sg2-links"><button type="button" class="np-link sg2-all" data-v2sgall>See All<span class="sg2-l2"> Suggestions ›</span></button>${(S.excl || []).length ? '' : '<button type="button" class="np-link sg2-all" data-v2excl>Never<span class="sg2-l2"> Suggest ›</span></button>'}<button type="button" class="np-link sg2-all" data-v2replan>Refresh<span class="sg2-l2"> Suggestions</span></button></span>`;
    // A3 proposal (Sim's fix plan, Nov 12: "your recommendation"): a best swap that doesn't raise the score (±0 or lower) gets no
    // card and no Apply: the quiet line stays and the swaps wait behind See all suggestions (same rule as Matchups' Best fix)
    const up = top.length && g0 != null ? Math.round(planGrade(top[0].pl)) - Math.round(g0) : null;
    if (top.length && up != null && up <= 0) { body = `${gap || `<p class="tm-sub">Nothing raises this team’s Strength Score right now.</p>`}${all}`; V2._sgLast = body;
      return `<section class="tm-sec tm-sgs" id="tm-sg"><h2 class="u">Suggestions</h2>${V2.undoBar()}${body}${V2.sgAdj()}</section>`; }
    body = !top.length ? (side ? `${gap}<p class="tm-sub">Nothing raises this team’s Strength Score right now, and every other swap would lower it.</p>${all}` /* Nov 15: the fix cards (items, Protect) showed in every branch but this one */
        : gap || '<p class="tm-sub">No single change from this pool raises the team’s Strength Score. Try another pool below, or see Matchups for what to watch.</p>')
      : `${gap}<p class="tm-sub">${P.nothing ? 'Optional swaps:' : side ? 'Nothing raises this team’s Strength Score right now. These swaps keep every check and about the same score, with a different look:' : 'What to change, best first.'}</p>
      <ol class="tm-sug">${top.map((x, k) => V2.sgCard({pl: x.pl, k, g0, attr: 'data-v2plan', side, hidden: k > 0 && !open, main: !k})).join('')}</ol>
      ${hid > 0 && !open ? `<span class="sg2-links"><button type="button" class="np-link sg2-all" data-v2sgmore aria-expanded="false">Show ${hid} More<span class="sg2-l2"> Suggestion${hid === 1 ? '' : 's'} ›</span></button>${(S.excl || []).length ? '' : '<button type="button" class="np-link sg2-all" data-v2excl>Never<span class="sg2-l2"> Suggest ›</span></button>'}</span>` : all}`;
    V2._sgLast = body; }
  V2.sgAllSync(); /* an open All Suggestions sheet follows the planner (Suggest from in the sheet re-plans) */
  if (!S2.pending && !(S.excl || []).length && !/data-v2excl/.test(body)) body += '<p class="sg2-links"><button type="button" class="np-link sg2-all" data-v2excl>Never<span class="sg2-l2"> Suggest ›</span></button></p>'; /* always reachable */
  return `<section class="tm-sec tm-sgs" id="tm-sg"><h2 class="u">Suggestions</h2>${V2.undoBar()}${body}${V2.sgAdj()}</section>`; };
// the Protect fix: only 0-2 of the six run Protect while their usual sets do; Add Protect puts it in those sets (today's
// LANE.protFix / protApply and its [data-protfix] handler, 36-lanes.js; the words from LANE.protWords)
// today's "Fix your items first" (54-items.js itemFixHtml): an Item Clause clash or an item that does nothing, with a one-tap "Give X Y"
// (data-itfix, today's handler: Undo in the message). Nov 15 parity: the new site flagged the clash but had no fix button.
// today's "Set check: what most players run" (57-set-tips.js setTips): a rare item, Ability or move next to what most players run, with
// one tap to use theirs (today's [data-settip] handler: Undo in the message). Nov 15 parity: the file was not in the new build.
V2.setTipsCard = () => { let tips = []; try { tips = setTips(); } catch (e) { return ''; } ui.setTips = tips; if (!tips.length) return ''; const E = V2.esc, what = t => t.k === 'it' ? 'item' : t.k === 'ab' ? 'Ability' : 'move';
  return `<div class="sg2-fix sg2-tips" role="group" aria-label="Set check: what most players run">${tips.map((t, x) => `<p class="sg2-ln fix tip"><b>Tip</b> ${E(t.p.d)}: ${E(t.to)} instead of ${E(t.from)} (${what(t)}). ${E(t.why)}</p><button type="button" class="np-btn2" data-settip="${x}"><span>Use ${E(t.to)}</span></button>`).join('')}<p class="fine">Tips come from what players run, not from the Strength Score.</p></div>`; };
V2.itemFixCard = ms0 => { const ms = typeof members === 'function' ? members() : ms0; /* with their items, as today's fix planner passes them */ let pr = []; try { pr = itemProblems(ms); } catch (e) {} if (!pr.length) return ''; const E = V2.esc;
  const rows = pr.map(x => { const tgt = x.k === 'clause' ? x.ms[x.ms.length - 1] : x.ms[0]; let fix = ''; try { fix = tgt && tgt.i >= 0 ? itemFixFor(tgt, ms) : ''; } catch (e) {}
    return `<p class="sg2-ln fix"><b>Fix</b> ${E(x.k === 'clause' ? 'Item Clause' : x.k === 'scarftr' ? 'Clashes with Trick Room' : 'Item does nothing')}: ${E(x.why)}</p>${fix ? `<button type="button" class="np-btn2" data-itfix="${tgt.i}|${E(fix)}"><span>Give ${E(tgt.d)} ${E(fix)}</span></button>` : ''}`; }).join('');
  return `<div class="sg2-fix sg2-items" role="group" aria-label="Fix your items first">${rows}${typeof regNote === 'function' ? regNote('fine') : ''}</div>`; }; /* parity, Nov 15: today's card ends with the rules caption, visible (a hover title never reaches touch screens) */
V2.protCard = ms => { let f = null; try { f = LANE.protFix(ms); } catch (e) {} if (!f) return ''; const W = LANE.protWords(f);
  return `<div class="sg2-fix"><p class="sg2-ln fix"><b>Fix</b> ${W.fix}</p><p class="tm-sub">${W.who} ${f.who.map(m => `<b>${V2.esc(m.d)}</b>`).join(' and ')}.</p><button type="button" class="np-btn2" data-protfix><span>${W.btn}</span></button></div>`; };
// Nothing to fix: every basic, no fix and no swap past the measured bar (today's plans.nothing, LANE.apply); the edge now is in
// play: Battle, and the sets (words from LANE.NONE)
V2.noneCard = () => { const N = LANE.NONE;
  // Sim, Nov 11 (#5): one quiet paragraph, not a headline (beside optional swaps a big "Nothing to fix." read as a contradiction)
  return `<div class="sg2-nwrap"><p class="sg2-none"><b>${N.head}</b> ${N.body} ${N.edge}</p><p class="sg2-nact"><a class="np-link" href="#battle">Battle ›</a><a class="np-link" href="#sets">Popular Sets ›</a></p></div>`; };
// the Undo bar: the last suggestion (or Quick add) applied, until the team is changed some other way; Undo steps back one at a
// time, up to 8 (today's undo stack and its [data-undobar] handler, 06-helpers.js)
// A6 proposal (Sim's fix plan: one message per action, one Undo): after an Apply, the "Applied … Undo" bar in Suggestions is the
// message when it is on screen; the toast (with its Undo) shows only when that bar is out of sight (applied from a sheet, Matchups)
// "on screen" means clear of the sticky header and jump bar above and the phone bar below (Nov 12: under the header it counted as seen)
V2.appliedSay = (t) => { const b = document.querySelector('.sg2-undo'), r = b && b.getBoundingClientRect(), rs = s => [...document.querySelectorAll(s)].map(e => e.getBoundingClientRect()).filter(q => q.height);
  const top = Math.max(0, ...rs('.np-head,.tm-jump').filter(q => q.top < innerHeight / 2).map(q => q.bottom)), bot = Math.min(innerHeight, ...rs('.np-bar,.np-dock').filter(q => q.top > innerHeight / 2).map(q => q.top));
  if (r && r.height && r.top >= top && r.bottom <= bot) return true; toast(t, true); return false; }; /* true: the bar is the message (Apply's focus goes to its Undo) */
V2.undoBar = () => { const t = undoTop(); return t ? `<div class="sg2-undo" role="status"><span>Applied <b>${V2.esc(t.label)}</b></span><button type="button" class="np-btn2" data-undobar><span>Undo</span></button></div>` : ''; };

// Show more: the next suggestions open in place (already worked out) and the link becomes See all suggestions (as today)
document.addEventListener('click', e => { if (!e.target.closest || !e.target.closest('[data-v2sgmore]')) return; ui.sugMore = members().map(m => m.p.n).join(',');
  V2.redraw(); const b = document.querySelectorAll('#tm-sg .tm-sug > li')[1], f = b && b.querySelector('[data-v2plan]'); if (f) f.focus({preventScroll: true}); });

// ---------- All Suggestions: a sheet with every suggestion the planner found (Sim, Nov 18, Q5 C: the middle way) ----------
// Head, then the one Suggest from (the same setting as My Team's, not a second copy), the notes, "One Pokémon In, One Out" (or
// "Pokémon to Add" under six): 6 cards, then "Show 6 More" (Showing 6 of N); then "Bigger Plans" (two or more changes) as an open
// section; the list ends with where to find more. Each card adds short facts (types, tier, role, Hidden gem, Ability @ Item); the
// change chips stay in Why?, which already says them. Apply closes the sheet; its Undo waits on My Team (Q5 sub-question A).
// Every plan, number and word comes from today's shared logic (planner, rating, monRole, isGem, assignItems); this only draws them.
V2.sgAll = {list: [], n: 6, nb: 1}; // nb: Bigger Plans shown before its own Show More (Sim, Nov 18, Q3 B: first plan, then 'Show N More')
V2.SGA_POOL = {box: 'your box', boxfill: 'your box and the best Pokémon to catch', all: 'the whole roster'};
// the card facts for each Pokémon coming in: type chips, "S tier 94", role, Hidden gem, then "Ability @ Item" (today's plan card's set
// line: the Ability its set runs, the item after Item Clause is settled across the new six, assignItems)
V2.sgaFacts = pl => { const E = V2.esc; let tA = pl.team; try { if (typeof assignItems === 'function') tA = assignItems(pl.team); } catch (e) {}
  return `<div class="sga2-facts">${pl.ch.map(x => { const p = x.c.p, mem = x.c.mem || pl.team.find(m => m.p === p) || {}; let tier = '', role = '', gem = false, it = '';
    try { const r = rating(p); tier = `${lTier(r.total).k} tier ${RS(r.total)}`; } catch (e) {}
    try { role = monRole(mem) || ''; } catch (e) {}
    try { gem = !!pl.gem || isGem(p); } catch (e) {}
    try { const t = tA.find(m => m.p === p); it = (t && t.item) || ''; } catch (e) {}
    const tags = `${tier ? `<span class="sga2-tag">${E(tier)}</span>` : ''}${role ? `<span class="sga2-tag">${E(role)}</span>` : ''}${gem ? '<span class="sga2-tag sga2-gem">Hidden gem</span>' : ''}`;
    return `<div class="sga2-f">${pl.ch.length > 1 ? `<p class="sga2-who">${V2.nameHtml(p.d)}</p>` : ''}<div class="sga2-row">${(p.t || []).map(V2.typeChip).join('')}${tags}</div>${mem.ability || it ? `<p class="sga2-set">${mem.ability ? `<b>${E(mem.ability)}</b>` : ''}${it ? ` @ ${E(it)}` : ''}</p>` : ''}</div>`; }).join('')}</div>`; };
V2.allSugsHtml = () => { const ms = members(), U = V2.sgAll, E = V2.esc, busy = !(V2.plan.plans && V2.plan.key === V2.planKey());
  U.P = V2.plan.plans; U.busy = busy; U.pool = ui.pool;
  const poolW = V2.SGA_POOL[ui.pool] || 'this pool';
  const ctl = `<div class="sg2-ctl sga2-ctl" role="group" aria-label="Suggestion settings"><div class="sg2-c sg2-pool"><span class="sg2-k">Suggest from</span>${V2.slide('sgpool', [['box', 'My Box'], ['boxfill', 'Box + Catch'], ['all', 'Whole Roster']], ui.pool, 'Suggest from')}</div></div>`;
  // audit Nov 19 #2 (rule C3): when My Team says "Nothing to fix" (plans.nothing; its ±0 best swap waits here, Sim's A3), the sheet says the
  // same sentence (LANE.NONE, the approved words) before its list, so "1 suggestion" can't read as a fix My Team missed
  /* W1b (Sim, Nov 19): beside 'Nothing to fix' the count says what the cards are: optional swaps (his Nov 11 words), not suggestions */
  const head = (n, none) => `<div class="np-eyebrow">${n == null ? 'Suggestions' : `${n} ${none ? 'optional swap' : 'suggestion'}${n === 1 ? '' : 's'}`}</div><h2 class="u">All Suggestions</h2>
    <p class="tm-sub">${none ? `<b>${LANE.NONE.head}</b> ${LANE.NONE.body} ` : ''}Every change the planner found for your team, best first, each with how it moves the Strength Score.</p>${ctl}`;
  // while the planner works (a new Suggest from, a team change) the list on screen stays, faded and not tappable, as on My Team
  if (busy) return `<div class="sga2">${head(U.count, U.none)}<p class="tm-sub sg2-wait" role="status">Working out the best changes for your team…</p>${U.last ? `<div class="sg2-stale" inert aria-busy="true">${U.last}</div>` : ''}</div>`;
  const P = V2.plan.plans || [], shown = ui.planList || [], X = V2.sgX(ms);
  const rest = [...P, ...(P.more || [])].filter(pl => !shown.includes(pl)), all = [...shown, ...rest]; let g0 = null; try { g0 = P.gBase != null ? P.gBase : ms.length === 6 ? gradeTeam(ms) : null; } catch (e) {}
  const side = !P.length, singles = all.filter(pl => pl.ch.length === 1), multi = all.filter(pl => pl.ch.length > 1);
  const S1 = singles.slice(0, U.n), left = singles.length - S1.length, M1 = multi.slice(0, U.nb), bleft = multi.length - M1.length; U.list = [...S1, ...M1]; U.s1 = S1.length; U.count = all.length;
  const card = (pl, k) => { let why = null;
    if (!(pl._why && pl._why.length)) { try { const r = planWhy(pl, k, X, false); why = {lines: r.lines, wk: r.wk}; } catch (e) {} }
    return V2.sgCard({pl, k, g0, attr: 'data-v2plana', side: side && shown.includes(pl), why, main: !k, facts: V2.sgaFacts(pl)}); };
  const notes = P.gapNote ? `<p class="sg2-gap"><b>Note:</b> ${E(P.gapNote)}</p>` : '';
  const one = S1.length ? `<h3 class="u sga2-h3">${ms.length >= 6 ? 'One Pokémon In, One Out' : 'Pokémon to Add'}</h3><ol class="tm-sug sga2-two">${S1.map((pl, k) => card(pl, k)).join('')}</ol>
    ${left > 0 ? `<button type="button" class="sga2-strip" data-v2sgamore><b class="u">Show ${Math.min(6, left)} More</b><span>Showing ${S1.length} of ${singles.length}</span></button>` : ''}` : '';
  const big = `<h3 class="u sga2-h3">Bigger Plans</h3><p class="tm-sub">Two or more changes at once.</p>${multi.length ? `<ol class="tm-sug sga2-big">${M1.map((pl, j) => card(pl, S1.length + j)).join('')}</ol>${bleft > 0 ? `<button type="button" class="sga2-strip" data-v2sgbmore><b class="u">Show ${Math.min(3, bleft)} More</b><span>Showing ${M1.length} of ${multi.length}</span></button>` : ''}`
    : `<p class="tm-sub">No plan with two or more changes raises the Strength Score${g0 != null ? ` (it’s at ${Math.round(g0)})` : ''}.</p>`}`;
  const end = left > 0 || bleft > 0 ? '' : `<p class="tm-sub sga2-end">That’s every change the planner found in ${E(poolW)}.${ui.pool !== 'all' ? ' For more, set Suggest from to Whole Roster above.' : ''}</p>`;
  const body = all.length ? notes + one + big + end : `${notes}<p class="tm-sub">No suggestions for this team from this pool.${ui.pool !== 'all' ? ' Try Whole Roster above.' : ''}</p>`;
  U.last = body; return `<div class="sga2">${head(all.length, U.none = !!(P.nothing && all.length))}${body}</div>`; };
V2.openAllSugs = () => { if (!members().length) return; Object.assign(V2.sgAll, {n: 6, nb: 1, last: '', count: null, none: false}); V2.sheet(V2.allSugsHtml(), {label: 'All Suggestions'}); };
// redraw the open sheet in place, keeping its scroll and the focused control (a Suggest from choice, Show More)
V2.sgAllRedraw = focusSel => { const el = document.querySelector('.np-sheet .sga2'); if (!el) return; const a = document.activeElement, sh = el.closest('.np-sheet'), y = sh.scrollTop;
  let sel = focusSel; if (!sel && a && el.contains(a)) sel = a.matches('[data-v2slide] > button') ? `[data-v2slide="${a.parentElement.dataset.v2slide}"] > [data-v="${a.dataset.v}"]` : a.matches('[data-v2sgamore]') ? '[data-v2sgamore]' : a.matches('[data-v2sgbmore]') ? '[data-v2sgbmore]' : null;
  const had = !!(a && el.contains(a)); el.outerHTML = V2.allSugsHtml(); sh.scrollTop = y;
  const f = sel && sh.querySelector('.sga2 ' + sel); if (f) f.focus({preventScroll: true}); else if (had) sh.focus({preventScroll: true}); };
// My Team redraws when the planner finishes or a setting changes: the open sheet follows when its plans, pool or busy state changed
V2.sgAllSync = () => { if (V2._sgaT) return; V2._sgaT = setTimeout(() => { V2._sgaT = 0; const U = V2.sgAll; if (!document.querySelector('.np-sheet .sga2')) return;
  const busy = !(V2.plan.plans && V2.plan.key === V2.planKey()); if (busy === U.busy && V2.plan.plans === U.P && ui.pool === U.pool) return; V2.sgAllRedraw(); }, 0); };
document.addEventListener('click', e => { if (!e.target.closest) return;
  if (e.target.closest('[data-v2sgall]')) { V2.openAllSugs(); return; }
  // Show 6 More: the next six swaps open in place; the focus goes to the first new card's Apply
  if (e.target.closest('[data-v2sgamore]')) { const k = Math.min(V2.sgAll.n, V2.sgAll.list.length); V2.sgAll.n += 6; V2.sgAllRedraw(`[data-v2plana="${k}"]`); return; }
  // Show N More under Bigger Plans (Q3 B): the next three plans open in place; the focus goes to the first new card's Apply
  if (e.target.closest('[data-v2sgbmore]')) { const U = V2.sgAll, k = (U.s1 || 0) + U.nb; U.nb += 3; V2.sgAllRedraw(`[data-v2plana="${k}"]`); } });

// ---------- Apply (today's applyPlan: Undo kept, what it swapped out isn't offered straight back) ----------
// a second tap within half a second is ignored, as on today's page (a double tap can't apply two suggestions)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2plan],[data-v2plana]'); if (!b) return; const now = Date.now(); if (now - (V2._sgTap || 0) < 450) return; V2._sgTap = now;
  const fromAll = b.dataset.v2plana != null, pl = fromAll ? V2.sgAll.list[+b.dataset.v2plana] : (ui.planList || [])[+b.dataset.v2plan]; if (!pl) return;
  // known-bug SUGG-09 (Nov 17): the parts above Suggestions change height on the redraw, so Suggestions jumped about 120px; keep it where it was
  const sec = !fromAll && b.closest('section'), id = sec && sec.id, y0 = sec ? sec.getBoundingClientRect().top : null, k = b.dataset.v2plan, a0 = b.getBoundingClientRect().top;
  if (fromAll) V2.closeSheet(true); applyPlan(pl); render();
  // Nov 18: on a slow phone the parts above redraw later than the next frame, so the place is held, and let go the moment the player
  // scrolls, taps or presses a key (their own move always wins)
  // Nov 18 (SUGG-09 inside Suggestions): the new Undo bar sits above the faded list while the next suggestions are worked out, so
  // holding the section's top let the Apply under the finger drop by the bar's height (600 -> 775 at 4x CPU), then move again when
  // the new list came. What is held is the place under the finger: an Apply (the faded copy's, then the next suggestion's) where the
  // tapped one was; with no Apply left (nothing to fix), the section's top where it was. Held until the list has settled: at least
  // 5 s, while the planner works, and 1 s after (20 s at most). Done in script, so it works without scroll anchoring (Safari).
  // Review Nov 18 (C1, C2): any scroll the hold didn't make itself (a screen reader, find-in-page, a script) also lets go, and so does
  // leaving My Team or Suggestions being gone (V2.holdGuard, shell.js); before, Back then Forward within 5 s dragged the page down again
  const at = el => { const seen = e => e.getClientRects().length; return [el.querySelector(`[data-v2plan="${k}"]`), ...el.querySelectorAll('[data-v2plan]')].find(e => e && seen(e)); };
  let G = null; if (id) { const t0 = performance.now(); let t1 = t0; G = V2.holdGuard(() => { const el = document.getElementById(id); return el && (at(el) || el); });
    const hold = () => { const el = document.getElementById(id); if (!el) return G.stop(); const A = at(el);
      const d = A ? A.getBoundingClientRect().top - a0 : el.getBoundingClientRect().top - y0; if (Math.abs(d) > 1) scrollBy(0, d); G.mark(); if (el.querySelector('.sg2-wait')) t1 = performance.now(); };
    const keep = () => { if (!G.on()) return; hold(); const t = performance.now(); if ((t - t0 < 5000 || t - t1 < 1000) && t - t0 < 20000) requestAnimationFrame(keep); else G.stop(); };
    hold(); requestAnimationFrame(keep); }
  // one message per Apply (A6): decided where the player will see the bar, after the place is held
  const bar = V2.appliedSay(`Applied: ${pl.ch.map(x => x.c.p.d).join(' and ')}`);
  // Review Nov 18 (C3): the tapped Apply is gone with the redraw, so the focus fell to <body> (a keyboard or screen-reader player lost
  // their place). It goes to the Undo in the 'Applied … Undo' bar when that bar is the message (A6: one message; the bar says what was
  // applied), else to the Apply now in the tapped one's place if it can take focus (the faded copy is inert), else to the bar's Undo
  // all the same (it stays after the list settles; the toast's own Undo goes when the toast does); without scrolling, so the hold keeps the place
  if (id && (!document.activeElement || document.activeElement === document.body)) { const el = document.getElementById(id), u = el && el.querySelector('.sg2-undo [data-undobar]'), A = el && at(el);
    const f = (bar && u) || (A && !A.closest('[inert]') ? A : null) || u || document.getElementById('toastUndo');
    if (f) f.focus({preventScroll: true}); /* if the page then scrolls to show the focus (Tab focus under the header), that scroll wins and the hold lets go */ } });

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
    return `<details class="sg2-prob sg2-pf" data-v2pk="${V2.esc(key)}"${V2.fx.open.has(key) ? ' open' : ''}><summary>${head}<span class="sg2-fixn">${n} ${P && P.nothing ? `idea${n > 1 ? 's' : ''}` : `fix${n > 1 ? 'es' : ''}`}</span></summary><div class="sg2-qbox"><p class="sg2-k">Quick add</p><ul class="sg2-qps">${Q.picks.map(pl => pick(key, pl)).join('')}</ul></div></details>`; };
  const real = out.filter(o => o[0] !== 'ok'), rows = out.map(row), cap = ui.needsAll ? rows.length : 4, more = rows.length - cap;
  return {real, html: (real.length ? '' : `<div class="sg2-prob"><span class="sg2-sev ok">${PROB_TXT.clear}</span><span class="sg2-pt">${PROB_TXT.clearWhy}</span></div>`) + rows.slice(0, cap).join('')
    + (more > 0 ? `<button type="button" class="np-link sg2-all" data-v2needs>Show ${more} More ›</button>` : ui.needsAll && rows.length > 4 ? '<button type="button" class="np-link sg2-all" data-v2needs>Show Fewer</button>' : '')}; };
V2.fixFold = D => { const ms = D.ms; if (!ms || !ms.length) return ''; const useA = $('useAbil').checked, a = analyze(playForm(ms), useA), {tRows} = offenseRows(ms, useA);
  const ready = V2.plan.key === V2.planKey() && V2.plan.plans, P = ready ? V2.plan.plans : null; if (P) ui.plans = P;
  let pr; try { pr = V2.fixRows(D, useA, a, tRows, P); } catch (e) { console.error(e); pr = {real: [], html: ''}; }
  const PG = proGrades(ms, useA), CK = D.CK || proChecks(ms, useA), V = verdictData(ms, a, PG, CK);
  // the team checks card
  const ckLi = (x, nt) => { const k = ckState(x); return `<li class="${k}"><b class="mk" aria-label="${CK_MARK[k][1]}">${CK_MARK[k][0]}</b><div><b>${V2.wl(x.label)}</b><span>${V2.esc(V2.undot(V2.wl(x.ok ? x.have : x.miss, CH.hand(V.RD))))}</span>${x.pro && /\d/.test(x.pro) && !nt ? `<small>${V2.undotHtml(x.pro)}</small>` : ''}</div></li>`; };
  const ckCard = CK ? `<div class="sg2-ckc"><p class="sg2-ckh"><span class="sg2-k">Team checks${!CK.full ? ' so far' : ''}</span><b class="u">${CK.pass} of ${CK.n} checks</b></p><p class="fine">${CK_TXT.intro}</p>
    <ul class="sg2-ckl">${CK.items.filter(x => !x.note).map(x => ckLi(x)).join('')}</ul>${CK.items.some(x => x.note) ? `<p class="sg2-ckn"><b>${CK_TXT.notes}</b><span>${CK_TXT.notesWhy}</span></p><ul class="sg2-ckl nt">${CK.items.filter(x => x.note).map(x => ckLi(x, 1)).join('')}</ul>` : ''}</div>` : '';
  // the verdict: legal and items, threats, checks, real results, your games, type balance
  const hand = !V.illegal && V.RD && CH.hand(V.RD) ? ` · ${CH.handTxt(V.RD, true)}` : '';
  const chips = [V.score != null && CH.hand(V.RD) ? `<span><b>${CH.hand(V.RD).x}/${CH.hand(V.RD).n}</b> handled${V2.tip('readiness')}</span>` : '', CK ? `<span><b>${CK.pass}/${CK.n}</b> checks${V2.tip('checklist')}</span>` : '', `<span class="${V.illegal ? 'bad' : 'ok'}"><b>${V.illegal ? 'Not legal' : 'Legal'}</b></span>`].join('');
  const vd = `<div class="sg2-vd ${V.lvl}"><dl>${V.rows.filter(r => !/^Checklist$/.test(r[0])).map(r => `<div><dt>${r[0]}</dt><dd>${V2.undotHtml(r[1])}</dd></div>`).join('')}</dl>${typeof regNote === 'function' ? regNote('fine') : ''}</div>`;
  // A2: the fold holds the things to know and the read that appears nowhere else; the checks are listed once, above
  // player review 3f (Nov 17): name what the fold holds: the weak spots (weaknesses, 4x, coverage gaps, missing Mega, fringe picks), the
  // type chart, the legal check ("7 weak spots, type chart, legal"; was "7 things, types, legal")
  /* W1c (Sim, Nov 19): beside 'Nothing to fix' the weak spots are called minor, so the two lines can't read as a contradiction */
  const sub = [pr.real.length ? `${pr.real.length} ${P && P.nothing ? 'minor ' : ''}weak spot${pr.real.length === 1 ? '' : 's'}` : 'No weak spots', 'type chart', V.illegal ? 'not legal yet' : 'legal'].filter(Boolean).join(', ');
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
  p.innerHTML = `<b class="u">${V2.esc(T[0])}</b><p>${V2.esc(T[1])}</p><a class="np-link" href="#method">How We Calculate ›</a>`; p.id = 'np-tipop'; p.tabIndex = -1; document.body.append(p); b.setAttribute('aria-expanded', 'true'); b.setAttribute('aria-controls', 'np-tipop');
  // place it from the drawn 24px tile, not the 44px tap area around it (A15), so it sits where it always did
  const q = b.getBoundingClientRect(), g = Math.max(0, (q.height - 24) / 2), r = {left: q.left + g, width: q.width - 2 * g, top: q.top + g, bottom: q.bottom - g}, w = Math.min(340, innerWidth - 32); p.style.width = w + 'px'; p.style.left = Math.max(16, Math.min(innerWidth - w - 16, r.left + r.width / 2 - w / 2)) + 'px';
  const below = r.bottom + 8 + p.offsetHeight < innerHeight - 72; p.style.top = (below ? r.bottom + 8 : Math.max(16, r.top - 8 - p.offsetHeight)) + scrollY + 'px';
  /* stress test (Nov 16): opened from the keyboard, focus moves into the tip so its words are read (it was never reached); Escape returns to the '?' */
  if (e.detail === 0) p.focus({preventScroll: true}); });
/* Tab out of the tip continues after its '?' in the page (the tip sits at the end of the page, so focus fell to <body>) */
document.addEventListener('keydown', e => { if (e.key !== 'Tab') return; const p = document.querySelector('.sg2-tipop'); if (!p || !p.contains(document.activeElement)) return;
  const b = document.querySelector('[data-v2tip][aria-expanded="true"]'); if (!b) return; const inside = [...p.querySelectorAll('a,button')], last = inside[inside.length - 1];
  if (e.shiftKey && document.activeElement === p) { e.preventDefault(); V2.tipClose(); b.focus(); return; }
  if (!e.shiftKey && document.activeElement === (last || p)) { e.preventDefault(); const all = [...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,summary,[tabindex="0"]')].filter(x => !p.contains(x) && x.getClientRects().length);
    const nx = all[all.indexOf(b) + 1]; V2.tipClose(); (nx || b).focus(); } });
document.addEventListener('focusout', e => { const p = document.querySelector('.sg2-tipop'); if (!p || !p.contains(e.target)) return; setTimeout(() => { const q = document.querySelector('.sg2-tipop'), f = document.activeElement; if (!q || q.contains(f) || (f && f.matches && f.matches('[data-v2tip]'))) return; V2.tipClose(); }, 0); }); /* after the move: removing the tip itself fires focusout */
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.querySelector('.sg2-tipop')) { const b = document.querySelector('[data-v2tip][aria-expanded="true"]'); V2.tipClose(); if (b) b.focus(); } });
addEventListener('scroll', () => { const p = document.querySelector('.sg2-tipop'); if (p && !p.contains(document.activeElement)) V2.tipClose(); }, {passive: true}); /* Nov 16 (TEST-09): a tip holding keyboard focus stays open on scroll (focusing it can scroll it into view; it is anchored to the page, so it moves with it) */

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

// Sim, Nov 15 (Q3 A): the Pokémon you chose never to have suggested (today's Plan settings › Never suggest, S.excl). Saved lists from today's
// site still filter suggestions and Build Me a Team, so they must be visible and undoable: one line here, "Change ›" opens the list.
V2.exclNames = () => (S.excl || []).map(n => [n, (byName.get(n) || {}).d || n]).sort((x, y) => x[1].localeCompare(y[1]));
V2.exclLine = () => { const L = V2.exclNames(), E = V2.esc;
  return `<p class="fine sg2-excl">${L.length ? `<span>Never suggested: ${L.slice(0, 4).map(([, d]) => `<b>${E(d)}</b>`).join(', ')}${L.length > 4 ? ` and ${L.length - 4} more` : ''}</span><button type="button" class="np-link" data-v2excl>Change ›</button>` : ''}</p>`.replace('<p class="fine sg2-excl"></p>', ''); }; /* empty list: the link sits with See All Suggestions instead (no extra row) */
V2.exclSheet = () => { const E = V2.esc, L = V2.exclNames();
  return `<div class="ex2"><div class="np-eyebrow">Suggestions</div><h2 class="u">Never Suggest</h2><p class="fine">These never appear in suggestions or Build Me a Team${L.length ? '' : '. Nothing here yet'}.</p>
    ${L.length ? `<ul class="ex2-list">${L.map(([n, d]) => `<li><b>${E(d)}</b><button type="button" class="np-btn2" data-exallow="${E(n)}"><span>Allow Again</span></button></li>`).join('')}</ul>` : ''}
    <label class="np-field ex2-add">${V2.ICON.search}<input type="search" data-exq placeholder="Add a Pokémon" aria-label="Add a Pokémon never to suggest" autocomplete="off">${V2.CLR}</label><div class="hits" data-exhits aria-live="polite"></div></div>`; };
V2.exclOpen = (focus) => { V2.sheet(V2.exclSheet(), {label: 'Never suggest', small: true, focus: focus || '[data-exq]'}); };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-v2excl],[data-exallow],[data-exadd]'); if (!t) return; const d = t.dataset;
  if (d.v2excl != null) { V2.exclOpen(); return; }
  if (d.exallow) { const p = byName.get(d.exallow); S.excl = S.excl.filter(n => n !== d.exallow); toast(`${p ? p.d : d.exallow} can be suggested again`); render(); V2.exclOpen('[data-exq]'); return; }
  if (d.exadd) { const p = byName.get(d.exadd); if (p && !isExcl(p)) { S.excl.push(p.n); toast(`${p.d} won't be suggested${!p.m && ROSTER.some(q => q.m && ownKey(q) === p.n) ? ' (nor its Mega)' : ''}`); } render(); V2.exclOpen('[data-exq]'); } });
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-exq]'); if (!i) return; const out = document.querySelector('[data-exhits]'); if (!out) return;
  const r = i.value.trim() ? V2.find(i.value).mons.filter(p => !isExcl(p)).slice(0, 6) : [];
  out.innerHTML = r.map(p => `<button type="button" class="np-hit" data-exadd="${V2.esc(p.n)}"><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy" decoding="async"><span class="nm"><b>${V2.nameHtml(V2.disp(p.n))}</b></span><span class="pg">Add</span></button>`).join(''); });
