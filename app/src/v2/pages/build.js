// ---------- Build (R4, Nov 12): piece 1, the head and the options strip, from the approved mock-up (docs/rebuild/mocks/build.tpl.html) ----------
// Every setting is today's: the pool is ui.abSrc (saved as cc2.absrc, as 34-events.js), Megas on team is megaGoal()/setMegaGoal() (one
// value shared with My Team's slider), Build around is ui.abLock (as 52-sleepers.js / Home's Build Around It). The engine (runAutoBuild,
// 22-auto-build.js) is shared; the answer card and the lower sections are pieces 2 and 3.
V2.bdUi = V2.bdUi || {find: ''};
V2.buildHead = () => { const E = V2.esc, nBox = (S.box || []).length, lk = ui.abLock && byName.get(ui.abLock);
  const head = `<div class="bd-head"><div><p class="np-eyebrow"><span>Build ·<span class="bd-rw"> real winning teams ·</span> ${E(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C')} doubles</span></p><h1 class="u">Build me <span class="pl">a team.</span></h1></div>
    <div class="bd-side"><p>Winning tournament teams you can field from your box or the whole roster.</p><button type="button" class="np-link" data-bdhow>How it works ›</button></div></div>`;
  const src = V2.slide('bdsrc', [['box', `My Box ${nBox}`], ['all', 'Whole roster']], ui.abSrc === 'all' ? 'all' : 'box', 'Build from');
  const meg = V2.slide('sgmega', [['0', '0'], ['1', '1'], ['2', '2']], String(megaGoal()), 'Megas on team');
  const around = lk ? `<div class="bd-pick">${SPRITE_ID[lk.n] ? `<img src="${V2.art(SPRITE_ID[lk.n])}" alt="">` : ''}<b>${V2.nameHtml(V2.disp(lk.n))}</b><button type="button" class="bd-x" data-bdx aria-label="Stop building around ${E(V2.disp(lk.n))}">×</button></div>`
    : `<label class="np-field bd-find">${V2.ICON.search}<input type="search" data-bdfind value="${E(V2.bdUi.find)}" placeholder="Optional" aria-label="Build around a Pokémon (optional): type its name" autocomplete="off"></label><div class="bd-hits" data-bdhits></div>`;
  const busy = !!(ui.ab && ui.ab.busy), label = lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team';
  const opts = `<div class="bd-opts"><div class="bd-opt bd-src"><span class="bd-lab">Build from</span>${src}</div><div class="bd-opt bd-meg"><span class="bd-lab">Megas on team</span>${meg}</div>
    <div class="bd-opt bd-around"><span class="bd-lab">Build around a Pokémon <span>· optional</span></span>${around}</div>
    <div class="bd-opt bd-go"><button type="button" class="np-btn2" data-bdgo${busy ? ' aria-busy="true" disabled' : ''}><span>${label}${ui.ab && !busy ? ' ↻' : ''}</span></button></div></div>`;
  return head + opts; };
V2.buildHits = q => { q = String(q || '').trim().toLowerCase(); if (!q) return '';
  const r = ROSTER.filter(p => !p.m && (p.d || p.n).toLowerCase().includes(q)).slice(0, 6);
  return r.length ? r.map(p => `<button type="button" class="np-hit" data-bdpick="${V2.esc(p.n)}">${SPRITE_ID[p.n] ? `<img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy">` : ''}<b>${V2.esc(p.d || p.n)}</b></button>`).join('')
    : `<p class="fine">No Pokémon called “${V2.esc(q)}”.</p>`; };
V2.pages.build = {place: 'build', draw() { return `<div class="bd2">${V2.buildHead()}<section class="bd-result" aria-live="polite">${ui.ab && ui.ab.busy ? '<p class="fine">Building from real winning teams…</p>' : ''}</section></div>`; }};
// the pool: today's rule (34-events.js): save, and rebuild if results are showing
document.addEventListener('v2slide', e => { if (e.detail.key !== 'bdsrc') return; ui.abSrc = e.detail.value === 'all' ? 'all' : 'box'; try { LS.set('cc2.absrc', ui.abSrc); } catch (x) {} if (ui.ab && !ui.ab.busy) runAutoBuild(); V2.redraw(); });
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-bdfind]'); if (!i) return; V2.bdUi.find = i.value; const h = document.querySelector('[data-bdhits]'); if (h) h.innerHTML = V2.buildHits(i.value); });
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-bdfind]'); if (!i) return;
  if (e.key === 'Enter') { const h = document.querySelector('[data-bdhits] [data-bdpick]'); if (h) { e.preventDefault(); h.click(); } }
  else if (e.key === 'Escape') { V2.bdUi.find = ''; i.value = ''; const h = document.querySelector('[data-bdhits]'); if (h) h.innerHTML = ''; } });
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-bdpick],[data-bdx],[data-bdgo]'); if (!t) return;
  if (t.dataset.bdpick) { const p = byName.get(t.dataset.bdpick); if (!p) return; ui.abLock = p.n; if (typeof inBox === 'function' && !inBox(p)) ui.abSrc = 'all'; V2.bdUi.find = ''; if (ui.ab && !ui.ab.busy) ui.ab = null; V2.redraw(); return; }
  if (t.hasAttribute('data-bdx')) { ui.abLock = null; if (ui.ab && !ui.ab.busy) ui.ab = null; V2.redraw(); setTimeout(() => { const i = document.querySelector('[data-bdfind]'); if (i) i.focus(); }, 30); return; }
  if (t.hasAttribute('data-bdgo')) { runAutoBuild(); V2.redraw(); } });
// How it works (today's three points, 22-auto-build.js abStart; "Ready for the top threats" is "Matchups" in the word list)
V2.BUILD_HOW = [['Six that work together', 'Built from teams that win at real tournaments, filtered to what you own.'], ['The why', 'Each pick comes with its job on the team and what it fixes.'], ['Matchups', 'Which of the top threats it answers, and the one change that would help most.']];
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-bdhow]'))) return;
  V2.sheet(`<div class="bd-how"><p class="np-eyebrow">Build</p><h2 class="u">How it works</h2><ol class="hm-steps">${V2.BUILD_HOW.map(([t, d]) => `<li><b>${V2.esc(t)}</b><span>${V2.esc(d)}</span></li>`).join('')}</ol></div>`, {label: 'How Build works', fit: true}); });
// ---------- Build piece 2 (Nov 12): the answer, the best team built (mock-up's lock + six + four reasons + actions) ----------
// The option shown is today's abTeam('doubles') (ui.abIdx); its Strength Score is CH.gradeOf on its own RD and checks, the same call
// My Team makes, so both pages agree. Use / Save follow today's 34-events.js rules (Undo; 10 saved max; "Already saved as").
V2.BAND_K = {A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'};
V2.buildAnswer = () => { const E = V2.esc, r = ui.ab;
  if (r && r.busy) return '<p class="bd-busy" role="status">Building from real winning teams…</p>';
  const res = r && r.doubles; if (!res) return '';
  if (!res.teams || !res.teams.length) return `<p class="bd-none" role="status">${res.noMega != null ? `No team fits with ${res.noMega} Mega${res.noMega === 1 ? '' : 's'} from this pool.` : 'No team fits these settings.'} Try Whole roster, or another Megas number.</p>`;
  const t = abTeam('doubles'), n = res.teams.length, k = ((ui.abIdx && ui.abIdx.doubles) || 0) % n;
  let G = null, CK = null; try { CK = proChecks(t._ms, true); G = CH.gradeOf(t._rd, CK, t._ms); } catch (e) {}
  const s = G ? Math.round(G.s) : t.score, band = G ? V2.BAND_K[G.band] || 'solid' : 'solid', word = G ? CH.wordOf(G.s) : '';
  const kind = t.proven ? (t.proven.swapped ? 'Proven team, 1 swap' : 'Proven team') : t.fresh ? 'Fresh take' : 'Built team';
  const chips = (t.gp || []).slice(0, 3).concat(t.megas > 1 ? [`${t.megas} Mega options`] : []);
  const six = t.mons.map(m => { const R = monRating(byName.get(m.n));
    return `<div class="bd-pk">${V2.mon(m.n, {iw: 120, bare: true})}<b>${m.n === ui.abLock ? '<span class="mg">Your pick</span> ' : ''}${V2.nameHtml(m.d)}</b><small>${E(m.it || '')}</small><small class="r">${E(String(m.role || '').replace(', Mega', ''))}${R ? ' · ' + E(R.tier) + ' tier ' + R.n : ''}</small></div>`; }).join('');
  const rows = t._rd && t._rd.rows || [], ans = rows.filter(x => x.level >= 2).length, sh = rows.filter(x => x.level === 1).length, no = rows.filter(x => x.level === 0).length;
  const basics = CK ? CK.items.filter(x => !x.skip && !x.note) : [] /* the 4 basics, Matchups included (as My Team's Team checks) */, notes = CK ? CK.items.filter(x => x.note && x.ok).map(x => x.label) : [];
  const core = (t.why || []).map(w => w.match(/^(.*): ([\d,]+) tournament teams, ([\d.]+)% wins$/)).find(Boolean);
  const pv = t.proven;
  const why = `<div class="bd-why">
    <div><span class="n">${ans}<span class="unit">/${rows.length}</span></span><span class="l">Matchups with an answer</span><p>Top ${rows.length} threats: ${sh} Shaky, ${no} No answer</p></div>
    <div><span class="n good">${basics.filter(x => x.ok).length}/${basics.length}</span><span class="l">Team checks: the ${basics.length} basics</span><p>${notes.length ? 'Notes met: ' + notes.map(E).join(', ') : 'No notes met'}</p></div>
    ${pv ? `<div><span class="n">${Math.round(pv.wr * 100)}<span class="unit">% won</span></span><span class="l">${pv.swapped ? 'Their six at events, 1 swap' : 'This exact six at events'}</span><p>${homeNum(pv.n)} players, ${homeNum(pv.g)} games${pv.swapped && pv.ours && pv.theirs ? `, with ${E(V2.disp(pv.ours))} in place of ${E(V2.disp(pv.theirs))}` : ''}</p></div>` : `<div><span class="n">New</span><span class="l">Not yet run at events</span><p>Built from cores that win; no player has run this exact six</p></div>`}
    ${core ? `<div><span class="n">${E(core[3])}<span class="unit">% wins</span></span><span class="l">Best core, ${E(core[2])} teams</span><p>${E(core[1])}</p></div>` : ''}</div>`;
  const nCatch = t.mons.filter(m => !m.box).length;
  const acts = `<div class="row bd-acts"><button type="button" class="np-btn" data-bduse>Use This Team</button><button type="button" class="np-btn2" data-bdsave${S.teams.length >= 10 ? ' disabled title="10 saved teams already"' : ''}><span>Save</span></button><button type="button" class="np-btn2" data-bdcopy><span>Copy for Showdown</span></button>
    <span class="bd-catch">${nCatch === 6 ? 'All six to catch: none is in your box yet' : nCatch ? `${nCatch} to catch` : 'All six are in your box'}</span></div>`;
  return `<section class="bd-ans" style="--band:var(--band-${band})"><div class="bd-lock"><p class="np-eyebrow">Option ${k + 1} of ${n} · ${kind}</p><h2 class="u">${E(t.label)}</h2>
    <div class="np-score bd-score"><b>${s}</b><div class="w"><span>${E(word)}</span><small>Strength Score</small></div></div>${G ? `<p class="bd-rank">${E(CH.pctTxt(G))}</p>${V2.buildBrk(G)}` : ''}
    ${chips.length ? `<div class="bd-chips">${chips.map(c => `<span class="np-chip">${E(c)}</span>`).join('')}</div>` : ''}</div><div class="bd-six" style="background:${V2.buildLight(t.mons)}">${six}</div></section>${why}${acts}`; };
V2.pages.build.draw = () => `<div class="bd2">${V2.buildHead()}<div class="bd-result" aria-live="polite">${V2.buildAnswer()}</div></div>`;
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bduse],[data-bdsave],[data-bdcopy]'); if (!b) return; const t = abTeam('doubles'); if (!t) return;
  if (b.hasAttribute('data-bduse')) { keepUndo(); S.format = 'doubles'; S.slots = t.mons.map(m => ({n: m.n, a: null, lock: false})); S.loadedId = null; if (typeof persist === 'function') persist(); location.hash = '#team'; toast('Using the built team. Suggestions and the game plan now describe it.', true); return; }
  if (b.hasAttribute('data-bdsave')) { if (S.teams.length >= 10) return; const key = t.mons.map(m => m.n).sort().join('|'), dup = S.teams.find(x => x.slots.map(s => s.n).filter(Boolean).sort().join('|') === key); if (dup) { toast(`Already saved as "${dup.name}"`); return; }
    const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name = `${t.label || 'Built team'}`.slice(0, 40); S.teams.push({id, name, slots: t.mons.map(m => ({n: m.n, a: null, lock: false})), format: 'doubles', saved: Date.now()}); if (typeof persist === 'function') persist(); toast(`Saved "${name}"`); V2.redraw(); return; }
  if (b.hasAttribute('data-bdcopy')) { const txt = slotsPaste(t.mons.map(m => ({n: m.n, a: null, lock: false}))); try { navigator.clipboard.writeText(txt).then(() => toast('Team copied for Showdown'), () => toast('Could not copy here: open Export on My Team')); } catch (x) { toast('Could not copy here: open Export on My Team'); } } });
// the team's own light behind the six (mock-up: one low wash per Pokémon in its own colour, as My Team); stronger at night
V2.buildLight = mons => { const dk = V2.theme && V2.theme() === 'night', al = dk ? .22 : .11, ph = innerWidth < 700, xs = ph ? [17, 50, 83, 17, 50, 83] : [8, 25, 42, 58, 75, 92], ys = ph ? [30, 30, 30, 80, 80, 80] : [50, 50, 50, 50, 50, 50];
  return mons.map((m, i) => `radial-gradient(${ph ? 30 : 14}% ${ph ? 26 : 46}% at ${xs[i]}% ${ys[i]}%,rgba(${V2.cp(m.n)},${al}),transparent)`).join(','); };
// ---------- Build piece 3 (Nov 12): the lower half: Other options (left) beside Build around a core (right), from the mock-up ----------
// Other options = the other built teams (today's ui.abIdx picks the one shown: "Show this one ›" is today's Try another, made direct).
// Cores = today's Winning Cores data (47-core-data.js: coreUi, coreRows, coreTags, corePlan); Add follows today's useCore rules and words.
V2.buildOthers = () => { const res = ui.ab && ui.ab.doubles; if (!res || !res.teams || res.teams.length < 2) return ''; const E = V2.esc, n = res.teams.length, cur = ((ui.abIdx && ui.abIdx.doubles) || 0) % n;
  const item = (t, i) => { let G = null, CK = null; try { CK = proChecks(t._ms, true); G = CH.gradeOf(t._rd, CK, t._ms); } catch (e) {}
    const rows = t._rd && t._rd.rows || [], ans = rows.filter(x => x.level >= 2).length, bas = CK ? CK.items.filter(x => !x.skip && !x.note) : [], band = G ? V2.BAND_K[G.band] || 'solid' : 'solid';
    return `<div class="bd-alt"><div class="bd-alt-top"><div><p class="bd-kk">Option ${i + 1} · ${t.proven ? (t.proven.swapped ? 'Proven team, 1 swap' : 'Proven team') : t.fresh ? 'Fresh take' : 'Built team'}</p><h3 class="u">${E(t.label)}</h3></div>
      <div class="bd-alt-sc" style="--band:var(--band-${band})"><b class="u">${G ? Math.round(G.s) : t.score}</b><span>${G ? E(CH.wordOf(G.s)) : ''}<small>${G ? E(CH.pctShort(G)) : ''}</small></span></div></div>
      <div class="bd-alt-six">${t.mons.map(m => `<span class="bd-alt-pk">${V2.mon(m.n, {iw: 60, bare: true})}<b>${V2.rowName(m.d)}</b></span>`).join('')}</div>
      <div class="bd-alt-meta"><span>${ans}/${rows.length} matchups with an answer · ${bas.filter(x => x.ok).length}/${bas.length} team checks</span><button type="button" class="np-link" data-bdshow="${i}">Show this one ›</button></div></div>`; };
  const list = res.teams.map((t, i) => i === cur ? '' : item(t, i)).join('');
  return `<section class="bd-others"><div class="bd-hd"><h2 class="u">Other options</h2><span class="bd-k">${n} built</span></div><p class="bd-sub">Tap one to see it in full above.${ui.abLock ? ` All have ${E(V2.disp(ui.abLock))}.` : ''}</p>${list}</section>`; };
V2.buildCores = () => { const E = V2.esc, rows = coreRows(), shown = rows.slice(0, 7 + 15 * (coreUi.more || 0)), base = RES && +RES.base ? +RES.base : .5;
  const kindW = {pairs: 'pairs', trios: 'trios', teams: 'full teams'}[coreUi.kind] || 'pairs';
  const row = (r, i) => { const tags = coreTags(r.ns), pts = r.tog == null ? null : Math.round(r.tog * 1000) / 10;
    return `<li class="bd-core"><i class="bd-cn">${i + 1}</i><span class="bd-cp">${r.ns.map(n => SPRITE_ID[n] ? `<img src="${V2.art(SPRITE_ID[n])}" alt="" loading="lazy">` : '').join('')}</span>
      <span class="bd-cm"><b>${r.ns.map(n => V2.rowName(V2.disp(n))).join(' + ')}</b><small>${tags.length ? `<em>${E(tags.slice(0, 2).join(', '))}</em> · ` : ''}${homeNum(r.n)} teams${pts != null ? ` · ${pts > 0 ? '+' : ''}${pts} points together` : ''}</small></span>
      <span class="bd-cw"><b class="u">${E(winFmt(r.wr * 100))}</b><small>wins · ${r.d >= 0 ? '+' : ''}${Math.round(r.d * 1000) / 10} vs avg</small></span><button type="button" class="np-btn2 bd-add" data-bdcore="${E(r.ns.join('|'))}" aria-label="Add ${E(r.ns.map(n => V2.disp(n)).join(' and '))} to your team"><span>${r.ns.length > 3 ? 'Load' : 'Add'}</span></button></li>`; };
  return `<section class="bd-cores"><div class="bd-hd"><h2 class="u">Build around a core</h2><span class="bd-k">${homeNum(rows.length)} ${kindW}</span></div><p class="bd-sub">Pick a pair or trio that wins, then fill the rest.</p>
    <div class="bd-csw">${V2.slide('bdckind', [['pairs', 'Pairs'], ['trios', 'Trios'], ['teams', 'Full teams']], coreUi.kind, 'Kind of core')}${V2.slide('bdcsort', [['win', 'Top rated'], ['use', 'Most used']], coreUi.sort, 'Sort cores')}</div>
    <p class="bd-hint">From ${homeNum(RES && RES.teams)} tournament teams. Average team wins ${E(winFmt(base * 100))} of games. ${coreUi.sort === 'use' ? 'Ranked by how many teams run it.' : 'Ranked by win rate, pulled toward the average.'}</p>
    <ol class="bd-clist">${shown.map(row).join('')}</ol>${rows.length > shown.length ? `<button type="button" class="np-link bd-cmore" data-bdcmore>Show ${Math.min(15, rows.length - shown.length)} more ${kindW}</button>` : ''}</section>`; };
V2.pages.build.draw = () => `<div class="bd2">${V2.buildHead()}<div class="bd-result" aria-live="polite">${V2.buildAnswer()}</div><div class="bd-lower">${V2.buildOthers() || ''}${V2.buildCores()}</div></div>`;
document.addEventListener('v2slide', e => { const k = e.detail.key; if (k !== 'bdckind' && k !== 'bdcsort') return; if (k === 'bdckind') coreUi.kind = e.detail.value; else coreUi.sort = e.detail.value; coreUi.more = 0; V2.redraw(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bdshow],[data-bdcore],[data-bdcmore]'); if (!b) return;
  if (b.dataset.bdshow != null) { ui.abIdx = ui.abIdx || {}; ui.abIdx.doubles = +b.dataset.bdshow; V2.redraw(); const a = document.querySelector('.bd-ans'); if (a) a.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }
  if (b.hasAttribute('data-bdcmore')) { coreUi.more = (coreUi.more || 0) + 1; V2.redraw(); return; }
  const ns = b.dataset.bdcore.split('|'), cur = S.slots.filter(s => byName.get(s.n)), have = new Set(cur.map(s => s.n));
  if (ns.length > 3) { keepUndo(); S.slots = normSlots(ns.map(n => ({n, a: null, lock: false}))); S.format = 'doubles'; S.loadedId = null; render(); location.hash = '#team'; toast(cur.length ? 'Loaded the team (your old team is one tap away: Undo)' : 'Loaded the team', !!cur.length); return; }
  const c = corePlan(ns); keepUndo(); S.slots = normSlots(c.next.slice(0, 6)); S.format = 'doubles'; render(); location.hash = '#team';
  toast(`Added ${ns.filter(n => !have.has(n)).map(n => byName.get(n).d).join(' + ') || 'the core'}${c.dropped.length ? ' · removed ' + c.dropped.join(', ') : ''}${c.megas > 2 ? ` · ${c.megas} Megas on the team now` : ''}`, true); });
// ---------- Build: Start from a recent winner (mock R2: compact rows under Other options; today's abStart picks and card actions) ----------
// The same three winners today's Build offers (newest 1st-place teams from official events or 64+ players). Each row opens a fold with
// the six full sets (today's "Sets") and today's four actions: Load This Team (second tap to replace, Home's), Practice Against, Compare,
// Copy for Showdown.
V2.bdUi = V2.bdUi || {win: null};
V2.buildWinners = () => { const EV = META.events, E = V2.esc; if (!EV) return '';
  const picks = EV.events.filter(e => e.src === 'official' || e.players >= 64).filter(e => e.top[0] && e.top[0].place === 1).slice(0, 3); if (!picks.length) return '';
  const row = ev => { const t = ev.top[0], key = ev.id + '#0', open = V2.bdUi.win === key, sure = V2.hmUi && V2.hmUi.sure === key;
    const sets = t.mons.map(m => { const p = byName.get(m.n); return `<li class="bd-set">${V2.mon(m.n, {iw: 48, bare: true})}<div><b>${V2.rowName(p ? p.d : m.n)}</b>${m.i ? ` <span class="bd-at">@ ${E(m.i)}</span>` : ''}
      <small>${E(m.a || '')}${m.nt ? ' · ' + E(m.nt) : ''}</small><small class="bd-mv">${(m.mv || []).map(E).join(' · ')}</small></div></li>`; }).join('');
    return `<details class="sg2-fold bd-win" data-bdwin="${E(key)}"${open ? ' open' : ''}><summary><span class="bd-wtop"><span class="bd-wk"><b class="u">1st</b>${t.record ? E(t.record) + ' · ' : ''}${E(evDate(ev.date))}${ev.players ? ` · ${ev.players} players` : ''}</span>
      <span class="bd-wev">${E(V2.evTitle(ev.name))}</span></span><span class="bd-wsix" aria-hidden="true">${t.mons.map(m => V2.mon(m.n, {iw: 40, bare: true})).join('')}</span></summary>
      <p class="bd-wwho">${E(teamWho(t))}'s six, full sets</p><ul class="bd-sets">${sets}</ul>
      <div class="row bd-wacts"><button type="button" class="np-btn2" data-hmload="${E(key)}"><span>${sure ? 'Tap Again to Replace Your Team' : 'Load This Team'}</span></button><button type="button" class="np-btn2" data-hmcopy="${E(key)}"><span>Copy for Showdown</span></button>
      <button type="button" class="np-link" data-hmprep="${E(key)}">Practice Against ›</button><button type="button" class="np-link" data-bdcx="${E(key)}">Compare ›</button></div></details>`; };
  return `<section class="bd-wins"><div class="bd-hd"><h2 class="u">Start from a recent winner</h2><span class="bd-k">${picks.length} teams</span></div><p class="bd-sub">Full sets, ready to load.</p>${picks.map(row).join('')}</section>`; };
V2.pages.build.draw = () => `<div class="bd2">${V2.buildHead()}<div class="bd-result" aria-live="polite">${V2.buildAnswer()}</div><div class="bd-lower"><div class="bd-lcol">${V2.buildOthers() || ''}${V2.buildWinners()}</div>${V2.buildCores()}</div></div>`;
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('[data-bdwin]')) return; if (d.open) V2.bdUi.win = d.dataset.bdwin; else if (V2.bdUi.win === d.dataset.bdwin) V2.bdUi.win = null; }, true);
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bdcx]'); if (b) V2.cxGo('cur', 'e:' + b.dataset.bdcx); });

// ---------- Build: the score's breakdown line under the rank (mock R2 line 194; the same numbers as My Team's "Why this score?") ----------
V2.buildBrk = G => { let W = null; try { W = CH.whyData(G); } catch (e) {} if (!W || W.partial) return ''; V2.bdG = G; const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v);
  return `<p class="bd-brk">${W.base} from its Pokémon and sets · ${sg(W.mu)} matchups${W.hasSix ? ` · ${sg(W.own)} from its own ${homeNum(W.ownGames)} games` : ''} <button type="button" class="np-link" data-bdwhy>Why this score? ›</button></p>`; };
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-bdwhy]') && V2.bdG) V2.sheet(V2.whyHtml(V2.bdG), {label: 'Why this score?', small: true}); });
