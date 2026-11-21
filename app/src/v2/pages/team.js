// pre-launch check 6d (Nov 17): team names stop at 40 characters (a long paste was cut mid-word without a word). From 30 characters the
// field shows how many are used ("34/40"); the spoken label says the limit
V2.nameCnt = v => String(v || '').length >= 30 ? `${String(v).length}/40` : '';
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-v2savename],[data-svname]'); if (!i) return;
  const c = i.parentElement.querySelector('[data-v2cnt]'); if (c) c.textContent = V2.nameCnt(i.value); });
if (typeof TIPS === 'object' && TIPS.checklist && TIPS.checklist[0] === 'Checklist') TIPS.checklist = ['How Team Checks work', TIPS.checklist[1]]; /* word list (naming audit #15, Nov 16): the tip was read out as 'What is Checklist?' */
// ---------- My Team (R4, Nov 11) ----------
// Everything the page shows is worked out by today's shared logic; this file only gathers it (teamData) and draws it.
// Approved design: docs/rebuild/mocks/myteam.tpl.html (NastyPlot Full Redesign artifact). Word list: CLAUDE.md.

// the data, no HTML: one call per draw
V2.teamData = () => {
  const ms = members(); if (!ms.length) return {empty: true};
  const useA = true, CK = proChecks(ms, useA), RD = prepOf(ms), G = RD ? CH.gradeOf(RD, CK, ms) : null;
  // the lead pair against the meta's top six (Battle mode's planner, the same one today's My Team uses)
  const four = ms.length >= 4 ? CH.four(ms) : null;
  // group six: the lineup My Team shows (today's teamLineup: the planner's pick, your lead pick, or team order); roles follow it
  const L = teamLineup(ms), role = n => L.lead.some(m => m.p.n === n) ? 'Lead' : L.back.some(m => m.p.n === n) ? 'Back' : 'Bench';
  // matchups: the 30 top threats, each with the real-games verdict (if the model has one) and the damage-calc level
  const rows = RD ? RD.rows.map(r => ({t: r.t, w: r.t.w, level: r.level, real: CH.realVs(r.t.n, ms)})) : [];
  const top = rows.slice().sort((a, b) => b.w - a.w).slice(0, 10);
  const cnt = w => rows.filter(r => r.real && r.real.w === w).length;
  const calc = [0, 1, 2, 3].map(l => rows.filter(r => r.level === l).length);
  const basics = CK ? CK.items.filter(x => !x.note && !x.skip) : [], notes = CK ? CK.items.filter(x => x.note) : [];
  const sug = V2.sugData(ms, RD);
  const lo = S.teams.find(t => t.id === S.loadedId);
  return {ms, G, RD, CK, four, L, role, rows, top, sug, saved: lo ? lo.name : '', mu: {fav: cnt('Favoured'), even: cnt('Even match'), unf: cnt('Unfavoured'), any: rows.some(r => r.real)},
    calc: {beats: calc[3], handles: calc[2], shaky: calc[1], none: calc[0]}, basics, notes, full: ms.length === 6};
};

// ---------- suggestions: today's planner (planFixesG), run in small slices between frames like today's page ----------
V2.plan = {key: null, plans: null, job: null};
// the same key today's page re-plans on (planKeyOf, 08-render-all.js): team, Suggest from, Megas on team, Swap my Mega, box, never-suggest... (R4 sugs hook)
V2.planKey = () => planKeyOf($('useAbil').checked);
V2.planStart = ms => { const key = V2.planKey(); if (V2.plan.key === key || (V2.plan.job && V2.plan.job.key === key)) return;
  const job = {key, g: planAllG(ms, suggestPool(), true, analyze(playForm(ms), true))}; /* today's whole pass, hidden gems for Quick add included (R4 sugs hook) */ V2.plan.job = job;
  // speed (Nov 17, pre-launch 2d): the planner waits while the page is being scrolled (its slices caused the 200-330 ms stalls)
  const step = () => { if (V2.plan.job !== job) return; if (performance.now() - (V2.lastScroll || -1e9) < 250) { setTimeout(step, 150); return; } const t = performance.now(); let r;
    try { for (;;) { r = job.g.next(); if (r.done) break; if (performance.now() - t > 30) { setTimeout(step, 0); return; } } } catch (e) { console.error(e); r = {value: []}; }
    V2.plan = {key, plans: r.value || [], job: null};
    // speed (Nov 18, pre-launch 2d): the redraw that shows them is its own step, and it too waits while the page is being scrolled
    const show = () => { if (V2.plan.key !== key) return; if (performance.now() - (V2.lastScroll || -1e9) < 250) { setTimeout(show, 150); return; } if (V2.route() === 'team') V2.redraw(); };
    setTimeout(show, 0); };
  if (window.requestIdleCallback) requestIdleCallback(step, {timeout: 1500}); else setTimeout(step, 0); };
if (!V2._scrollWatch) { V2._scrollWatch = 1; addEventListener('scroll', () => { V2.lastScroll = performance.now(); }, {passive: true}); }
// which suggestions show (shared with today's page: planListOf, CH.sideGrades) and what each does to the Strength Score
V2.sugData = (ms, RD) => { if (ms.length < 1) return null; V2.planStart(ms); const P = V2.plan.key === V2.planKey() ? V2.plan.plans : null; if (!P) return {pending: true};
  let g0 = P.gBase != null ? P.gBase : null; if (g0 == null) { try { g0 = ms.length === 6 ? gradeTeam(ms) : null; } catch (e) {} }
  const base = RD ? RD.score : null; let list = planListOf(P, RD ? {score: RD.score} : null, []), side = false;
  if (!P.length && Array.isArray(P.more) && P.more.length) { side = true; list = CH.sideGrades(P.more, g0, base); }
  const top = list.slice(0, 3).map(pl => { const g1 = planGrade(pl), ok = g0 != null && g1 != null, r0 = ok ? Math.round(g0) : null, r1 = ok ? Math.round(g1) : null;
    return {pl, g0, g1, d: ok ? r1 - r0 : null, r0, r1, word: ok && CH.wordOf(g0) !== CH.wordOf(g1) ? CH.wordOf(g1) : ''}; });
  ui.planList = list; return {top, side, none: !top.length};
};


// ---------- Team Sheet (Sim, Nov 9 / Option A Nov 11: opens as a sheet over My Team) ----------
// One card per Pokémon: item, Ability, the four moves, the nature (+ and −) and the six stats at level 50 with their stat points.
// The numbers come from sheetData() (39-damage-calc-speed.js), the same function today's Team Sheet draws from.
// Nov 12 (Sim: every feature of today's Team Sheet kept): head line with the team and regulation, "← My Team", Share as Image,
// cards that open Edit Set, and the empty-team message (items 10-14).
V2.openTeamSheet = () => { const ms = members(), r = (typeof regInfo === 'function' && regInfo()) || {id: 'M-C'}, reg = `Reg ${V2.esc(String(r.id))} doubles · level 50`;
  const back = '<a class="np-back" href="#team" data-v2close>← My Team</a>';
  if (!ms.length) { V2.sheet(`<div class="ts2"><div class="np-eyebrow"><span>${back} · ${reg}</span></div><h2 class="u">Team Sheet</h2>
    <p class="tm-sub">No team yet. Add Pokémon on My Team and their full sets show here.</p><div class="ts2-acts"><button type="button" class="np-btn" data-v2close data-v2search><span>Add a Pokémon</span></button></div></div>`, {label: 'Team Sheet', small: true}); return; }
  let LU = null; /* Sim, Nov 20: no Lead mark on My Team (leads are Battle's call) */
  // Nov 14, Sim's pick "Tale of the Tape" (docs/rebuild/mocks/team-sheet-tape): the six across the top, every fact read across in rows,
  // the team's best in each stat on a blue plate (ties all marked). A real table: the Pokémon are the column headers, the facts the row headers.
  const E = V2.esc, D = ms.map(m => sheetData(m)), N = D[0] ? D[0].stats.length : 0;
  const best = [...Array(N)].map((_, k) => Math.max(...D.map(d => d.stats[k].val == null ? -1 : d.stats[k].val)));
  const vs = LU ? (/^vs /.test(PLAN_VS[LU.by]) ? PLAN_VS[LU.by] : '(' + PLAN_VS[LU.by] + ')') : '';
  const head = (m, i) => { const P = m.p, d = V2.disp(P.n), mega = /^Mega /.test(d), lead = LU && LU.lead.includes(m), t1 = P.t[0], t2 = P.t[1] || P.t[0];
    return `<th scope="col" class="tt-mon"><button type="button" class="tt-pick" data-ts2edit="${m.i}" aria-label="${E(m.d)}: edit its set"><span class="tt-ban" aria-hidden="true" style="--b1:var(--ty-${t1});--b2:var(--ty-${t2})"><i class="tt-no u">${String(m.i + 1).padStart(2, '0')}</i><i class="tt-giant u">${E((mega ? d.slice(5) : d).toUpperCase())}</i>${V2.mon(P.n, {iw: 120, bare: true})}</span>
      <span class="tt-mg u">${mega ? 'Mega' : '&nbsp;'}</span><b class="tt-nm u">${E(mega ? d.slice(5) : d)}</b></button></th>`; };
  /* say it once (Nov 16, re-verify #17): when every column's spread note is the same ('Most common spread'), the key says it once */
  const srcs = [...new Set(D.filter(d => d && d.nat).map(d => String(d.src || '').replace(/<[^>]*>/g, '')))], srcOnce = srcs.length === 1 && srcs[0] ? srcs[0] : '';
  const nat = (m, i) => { const d = D[i]; return d.nat ? `<b>${E(d.nat)}</b>${d.up && d.dn && d.up !== d.dn ? `<small class="tt-nb"><span class="up">+${d.up}</span> <span class="dn">−${d.dn}</span></small>` : ''}${srcOnce ? '' : `<small class="tt-src">${E(String(d.src || '').replace(/<[^>]*>/g, ''))}</small>`}` : '<b>Nature unknown</b>'; };
  const mv = m => `<ul class="tt-mv">${[0, 1, 2, 3].map(j => { const x = m.moves[j]; return x ? `<li class="np-type" style="--tc:var(--ty-${V2.TYPES.includes(x.type) ? x.type : 'Normal'})">${E(x.name)}</li>` : '<li class="none">No move</li>'; }).join('')}</ul>`;
  const stat = k => (m, i) => { const x = D[i].stats[k], top = x.val != null && x.val === best[k], w = x.val == null || !best[k] ? 0 : Math.round(100 * x.val / best[k]);
    return `<div class="tt-st${top ? ' best' : ''}${x.mark ? ' ' + x.mark : ''}"><b class="u">${x.val == null ? '—' : x.val}</b><small>${x.mark === 'up' ? '<span aria-hidden="true">▲ </span><span class="vh">raised by nature, </span>' : x.mark === 'dn' ? '<span aria-hidden="true">▼ </span><span class="vh">lowered by nature, </span>' : ''}${x.pts == null ? '' : x.pts + ' points'}${top ? '<span class="vh">, team best</span>' : ''}</small><i class="tt-bar" aria-hidden="true" style="--w:${w}%"></i></div>`; };
  const tape = (part, k) => { const ix = part.map(m => ms.indexOf(m));
    const row = (label, f, cls) => `<tr class="${cls || ''}"><th scope="row" class="tt-rh u">${label}</th>${part.map((m, i) => `<td data-ts2edit="${m.i}">${f(m, ix[i])}</td>`).join('')}</tr>`;
    return `<table class="tt"${k != null ? ` aria-label="Team Sheet, Pokémon ${ix[0] + 1} to ${ix[ix.length - 1] + 1}"` : ' aria-label="Team Sheet"'}><thead><tr><td class="tt-corner"></td>${part.map((m, i) => head(m, ix[i])).join('')}</tr></thead>
      <tbody>${row('Item', m => E(m.heldItem || m.item || 'No item').replace(/ (\S{1,2})$/, '\u00a0$1'))}${row('Ability', m => E(m.ability || '—'))}${row('Nature', nat, 'tt-nat')}${row('Moves', m => mv(m), 'tt-mvs')}</tbody>
      <tbody class="tt-stats"><tr class="tt-sh"><th scope="rowgroup" colspan="${part.length + 1}"><span class="u">Stats</span> <small>at level 50</small></th></tr>${(D[0] ? D[0].stats : []).map((s, k) => row(s.S, (m, i) => stat(k)(m, i), k % 2 ? 'odd' : '')).join('')}</tbody></table>`; };
  const phone = innerWidth < 700, tiny = innerWidth < 380, parts = tiny && ms.length > 2 ? [ms.slice(0, 2), ms.slice(2, 4), ms.slice(4)].filter(x => x.length) : phone && ms.length > 3 ? [ms.slice(0, 3), ms.slice(3)] : [ms]; /* Sim Q19 (Nov 15): under 380 three tables of two, so every move chip fits its column */
  const legend = `<p class="tt-key"><span><i class="tt-kbest" aria-hidden="true"></i>team best in that stat</span><span><b class="up">▲</b> raised by nature</span><span><b class="dn">▼</b> lowered by nature</span><span>points = stat points <span class="nw">(0–32)</span></span>${srcOnce ? `<span>Spreads: ${E(srcOnce.replace(/^Most common spread$/, 'each one\'s most common'))}</span>` : ''}${LU ? `<span>Lead = ${E(vs)}</span>` : ''}</p>`;
  V2.sheet(`<div class="ts2 tt2"><div class="np-eyebrow"><span>${back} · ${V2.esc(teamTitleFor(ms))} · ${reg}</span></div><div class="tt-top"><h2 class="u">Team Sheet</h2>
    <div class="ts2-acts"><button type="button" class="np-btn" data-v2copy><span>Copy for Showdown</span></button><button type="button" class="np-btn2" data-ts2share><span>Share as Image</span></button></div></div>
    <p class="fine tt-help">Tap a column to edit its set · Big number: the stat at level 50</p>${legend}
    <div class="tt-wrap">${parts.map((p, k) => tape(p, parts.length > 1 ? k : null)).join('')}</div></div>`, {label: 'Team Sheet'}); };
(() => { let b = innerWidth < 700, tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { const nb = innerWidth < 700; if (nb === b) return; b = nb; if (document.querySelector('.np-sheet .tt2')) V2.openTeamSheet(); }, 150); }); })();
// Copy for Showdown: today's export (exportPaste) and clipboard helper (copyText)
// Export to Showdown (today's Export panel, Nov 12: every feature kept): the same text as Copy for Showdown, shown so it can be
// read or selected by hand when copying is blocked
V2.openExport = () => { if (!members().length) return; let x = ''; try { x = exportPaste(); } catch (e) {}
  V2.sheet(`<div class="imp2"><div class="np-eyebrow">Export</div><h2 class="u">Export to Showdown</h2>
    <p class="tm-sub">Your team as Showdown text: items, Abilities, level 50, stat points as EVs, natures and moves.</p>
    <textarea class="imp2-in" data-expout rows="12" readonly spellcheck="false" aria-label="Your team as Showdown text">${V2.esc(x)}</textarea>
    <div class="imp2-acts"><button type="button" class="np-btn" data-expcopy><span>Copy</span></button></div></div>`, {label: 'Export to Showdown', small: true, focus: '[data-expcopy]'}); };
document.addEventListener('click', async e => { if (e.target.closest('[data-v2export]')) { V2.closeSheet(true); V2.openExport(); return; }
  if (e.target.closest('[data-expcopy]')) { const f = document.querySelector('[data-expout]'); if (await V2.copy(f ? f.value : '')) toast('Copied'); else if (f) { f.focus(); f.select(); toast('Press Ctrl+C to copy'); } } });
V2.copyTeam = async () => { toast((await V2.copy(exportPaste())) ? 'Team copied for Showdown' : 'Copy failed. Try again.'); };
document.addEventListener('click', e => { if (e.target.closest('[data-v2copy]')) V2.copyTeam(); if (e.target.closest('[data-v2sheetopen]')) V2.openTeamSheet();
  if (e.target.closest('[data-ts2share]')) { V2.shUi.kind = 'sheet'; V2.closeSheet(true); V2.openShare(); }
  const c = e.target.closest('[data-ts2edit]'); if (c) { V2.closeSheet(true); V2.openEdit(+c.dataset.ts2edit, true); } });
document.addEventListener('keydown', e => { const c = e.target && e.target.closest && e.target.closest('[data-ts2edit]'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.click(); } });

// ---------- Save Team (R4, Nov 11): a small sheet; the save itself is today's saveTeamAs (30-saved-data.js) ----------
// Same choices as today's save panel: update the open saved team or save as new, up to 10 teams; Enter does the main action.
V2.openSave = () => { if (!members().length) return; const lo = S.teams.find(t => t.id === S.loadedId), full = S.teams.length >= 10, n = S.teams.length;
  const sh = V2.sheet(`<div class="sv2"><h2 class="u">Save Team</h2>
    <p class="tm-sub">${lo ? `Open now: <b>${V2.esc(lo.name)}</b>. Update it, or save ${members().length === 6 ? 'this six' : 'it'} as a new team.` : `Give this ${members().length === 6 ? 'six' : 'team'} a name.`} <span class="sv2-n">${n} of 10 saved</span></p>
    <form data-v2saveform><label class="np-field"><input data-v2savename maxlength="40" placeholder="Team name, e.g. Rain Archaludon" aria-label="Team name, up to 40 characters" autocomplete="off" value="${V2.esc(lo ? lo.name : '')}"><span class="np-cnt" data-v2cnt aria-hidden="true">${V2.nameCnt(lo ? lo.name : '')}</span></label>
    <div class="sv2-acts">${lo ? `<button type="submit" class="np-btn">Update Team</button><button type="button" class="np-btn2" data-v2savenew${full ? ' disabled' : ''}><span>Save as New</span></button>`
      : `<button type="submit" class="np-btn"${full ? ' disabled' : ''}>Save Team</button>`}<button type="button" class="np-link" data-v2close>Cancel</button></div></form>
    ${full ? '<p class="fine sv2-full">You have 10 saved teams. Update the open team, or delete one in Saved Teams to save a new one.</p>' : ''}</div>`, {label: 'Save Team', small: true, focus: lo ? '[data-v2saveform] .np-btn' : '[data-v2savename]'}); // Sim, Nov 11: updating needs no typing, so on phones the keyboard stays down until you tap the name
  const box = document.querySelector('[data-v2saveform]'), inp = box && box.querySelector('[data-v2savename]'); if (!box) return; if (inp && !lo) inp.select();
  const go = over => { const t = saveTeamAs(inp.value, over); if (!t) return; V2.closeSheet(); render(); toast(V2.canStore ? `Saved "${t.name}"` : `Saved "${t.name}" for this visit. ${V2.noStoreTxt}`); };
  box.addEventListener('submit', e => { e.preventDefault(); go(!!lo); });
  const nw = box.querySelector('[data-v2savenew]'); if (nw) nw.addEventListener('click', () => go(false));
  return sh; };
document.addEventListener('click', e => { if (e.target.closest('[data-v2save]')) V2.openSave(); });

// ---------- Saved Teams (R4, Nov 11): a sheet over My Team; rows and their scores are today's savedRows (30-saved-data.js) ----------
// Open, Copy for Showdown, Rename and Delete (with a confirm) as today. Sort: Newest / Name / Matchups (today's "Readiness" sort).
// Still to come on the new build: Compare (with the Compare page) and "Your games" with this six (with My Record).
V2.svUi = {sort: 'recent', ren: null, del: null, cmp: null};
V2.savedHtml = () => { const U = V2.svUi, rows = savedRows(U.sort), n = rows.length;
  const card = ({t, r, ck, G}) => { const on = t.id === S.loadedId, id = V2.esc(t.id), nm = V2.esc(t.name), s = G ? Math.round(G.s) : null;
    const six = r.ms.map(m => `<li>${V2.mon(m.p.n, {iw: 56})}</li>`).join('') + Array.from({length: Math.max(0, 6 - r.ms.length)}, () => '<li class="svt2-empty"><i></i><span>Empty</span></li>').join('');
    const head = U.ren === t.id ? `<form class="svt2-ren" data-svrenform="${id}"><label class="np-field"><input data-svname maxlength="40" value="${nm}" aria-label="Team name, up to 40 characters" autocomplete="off"><span class="np-cnt" data-v2cnt aria-hidden="true">${V2.nameCnt(t.name)}</span></label><button type="submit" class="np-btn2"><span>Save</span></button><button type="button" class="np-link" data-svact="renx">Cancel</button></form>`
      : `<header><h3 class="u">${nm}</h3>${on ? '<span class="np-chip">Open now</span>' : ''}</header>`;
    const score = s != null ? `<div class="np-score sm" style="--band:var(--band-${({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid'})"><b>${s}</b><div class="w"><span>${V2.esc(CH.wordOf(G.s))}</span><small>Strength Score</small></div></div>`
      : `<p class="svt2-part">${r.ms.length < 6 ? `${r.ms.length} of 6 picked` : 'Not rated yet'}</p>`;
    const acts = U.del === t.id ? `<div class="svt2-del" role="group" aria-label="Delete ${nm}?"><span>Delete ${nm}?</span><button type="button" class="np-btn2" data-svact="delok" data-id="${id}"><span>Delete</span></button><button type="button" class="np-link" data-svact="delx">Keep</button></div>`
      : `<div class="svt2-acts"><button type="button" class="np-btn2" data-svact="open" data-id="${id}" aria-label="Open ${nm}"><span>Open</span></button><button type="button" class="np-link" data-svact="cmp" data-id="${id}" aria-pressed="${U.cmp === t.id}" aria-label="Compare ${nm}">${U.cmp === t.id ? 'Picked ✓' : 'Compare'}</button><button type="button" class="np-link" data-svact="copy" data-id="${id}" aria-label="Copy for Showdown: ${nm}">Copy for Showdown</button><button type="button" class="np-link" data-svact="poster" data-id="${id}" aria-label="Team poster of ${nm}">Team Poster ›</button><button type="button" class="np-link" data-svact="ren" data-id="${id}" aria-label="Rename ${nm}">Rename</button><button type="button" class="np-link" data-svact="del" data-id="${id}" aria-label="Delete ${nm}">Delete</button></div>`;
    const gone = goneNote(t.slots);
    return `<article class="svt2-card${on ? ' on' : ''}">${head}<ul class="svt2-six" aria-label="${V2.esc(r.ms.map(m => m.d).join(', ') || 'Empty')}">${six}</ul><p class="fine svt2-gone">${gone}</p><div class="svt2-foot">${score}${ck ? `<span class="fine">${ck.pass}/${ck.n} checks</span>` : ''}${(() => { const G = myGames(r.ms); return G ? `<span class="fine">Your games ${G.w}–${G.l}</span>` : ''; })()}</div>${acts}</article>`; };
  // an odd count leaves a hole in the 2-across grid: the free spot invites saving the six on My Team (Sim: no half-filled rows)
  const mine = members().length, free = `<article class="svt2-card svt2-free"><h3 class="u">${10 - n} spots free</h3><p class="tm-sub">${mine ? 'Keep the six on My Team as a saved team.' : 'Build a team on My Team, then save it here.'}</p>
    <div class="svt2-acts">${mine ? '<button type="button" class="np-btn2" data-svact="new"><span>Save Team</span></button>' : '<a class="np-btn2" href="#build"><span>Build Me a Team</span></a>'}</div></article>`;
  return `<div class="svt2"><div class="np-eyebrow"><span><a class="np-back" href="#team" data-v2close>← My Team</a> · ${n} of 10 saved</span></div><h2 class="u">Saved Teams</h2>
    <p class="fine svt2-sync">Up to 10 teams. ${!V2.canStore ? V2.noStoreTxt : (ui.syncSt || 'local') === 'local' ? 'Saved in this browser only.' : 'Saved and kept in step across your devices.'}</p>
    ${U.cmp && S.teams.some(t => t.id === U.cmp) ? `<p class="svt2-cmp" role="status"><b>Compare:</b> ${V2.esc((S.teams.find(t => t.id === U.cmp) || {}).name || '')} is picked. Pick one more saved team, or <button type="button" class="np-link" data-svact="cmpcur">Compare with My Team ›</button> · <button type="button" class="np-link" data-svact="cmpx">Cancel</button></p>` : n > 1 ? '<p class="fine svt2-cmp">Tap Compare on two teams to see them side by side.</p>' : ''}${n ? `<div class="svt2-sort">${V2.slide('svsort', [['recent', 'Newest', 'clock'], ['name', 'Name'], ['rating', 'Matchups', 'gauge']], U.sort, 'Sort saved teams')}</div><div class="svt2-grid" aria-live="polite">${rows.map(card).join('')}${n % 2 && n < 10 ? free : ''}</div>`
      : mine ? `<p class="tm-sub">No saved teams yet. Save this ${members().length === 6 ? 'six' : 'team'} to come back to it, compare it, or try changes without losing it.</p><div class="svt2-empty"><button type="button" class="np-btn" data-svact="new"><span>Save Team</span></button></div>` // Sim, Nov 12 (option B)
      : `<p class="tm-sub">No saved teams yet. Add Pokémon on My Team, then save them here.</p>`}</div>`; };
V2.openSavedTeams = () => { V2.svUi.ren = V2.svUi.del = V2.svUi.cmp = null; V2.sheet(V2.savedHtml(), {label: 'Saved Teams', fit: true}); };
// redraw the sheet in place (the page under it redraws through render()); focus goes to `focus` or the sheet itself
V2.svRefresh = focus => { const el = document.querySelector('.svt2'); if (!el) return; el.outerHTML = V2.savedHtml(); const f = focus && document.querySelector(focus); (f || document.querySelector('.np-sheet')).focus(); if (f && f.select) f.select(); };
document.addEventListener('click', e => { if (e.target.closest('[data-v2saved]')) { V2.openSavedTeams(); return; }
  const b = e.target.closest('[data-svact]'); if (!b) return; const U = V2.svUi, id = b.dataset.id, a = b.dataset.svact;
  if (a === 'open') { const t = openSaved(id); if (!t) return; V2.closeSheet(true); V2.ui.sel = 0; V2.ui.picked = false; if (location.hash !== '#team') location.hash = '#team'; render(); scrollTo(0, 0); toast(`Opened "${t.name}"`, true); }
  else if (a === 'copy') { const t = S.teams.find(x => x.id === id); if (t) V2.copy(slotsPaste(t.slots)).then(ok => toast(ok ? 'Team copied for Showdown' : 'Copy failed. Try again.')); }
  else if (a === 'ren') { U.ren = id; U.del = null; V2.svRefresh('[data-svname]'); }
  // Compare two saved teams (as today): the first tap picks, the second opens Compare; or the pick against My Team
  else if (a === 'cmp') { if (U.cmp && U.cmp !== id) { const x = U.cmp; U.cmp = null; V2.closeSheet(true); V2.cxGo('s:' + x, 's:' + id); } else { U.cmp = U.cmp === id ? null : id; V2.svRefresh(`[data-svact="cmp"][data-id="${CSS.escape(id)}"]`); } }
  else if (a === 'cmpcur') { const x = U.cmp; U.cmp = null; V2.closeSheet(true); V2.cxGo('cur', 's:' + x); }
  else if (a === 'cmpx') { const x = U.cmp; U.cmp = null; V2.svRefresh(`[data-svact="cmp"][data-id="${CSS.escape(x || '')}"]`); }
  else if (a === 'poster') { V2.closeSheet(true); V2.openShare(id); }
  else if (a === 'renx') { const was = U.ren; U.ren = null; V2.svRefresh(`[data-svact="ren"][data-id="${CSS.escape(was || '')}"]`); }
  else if (a === 'del') { U.del = id; U.ren = null; V2.svRefresh('[data-svact="delx"]'); }
  else if (a === 'delx') { const was = U.del; U.del = null; V2.svRefresh(`[data-svact="del"][data-id="${CSS.escape(was || '')}"]`); }
  else if (a === 'new') V2.openSave();
  else if (a === 'delok') { const t = deleteSaved(id); U.del = null; render(); V2.svRefresh(); if (t) toast(`Deleted "${t.name}"`); } });
document.addEventListener('submit', e => { const f = e.target.closest && e.target.closest('[data-svrenform]'); if (!f) return; e.preventDefault();
  const id = f.dataset.svrenform; renameSaved(id, f.querySelector('[data-svname]').value); V2.svUi.ren = null; render(); V2.svRefresh(`[data-svact="ren"][data-id="${CSS.escape(id)}"]`); });
// a new sort swaps only the cards, so the slider's thumb glides and keeps focus
document.addEventListener('v2slide', e => { if (e.detail.key !== 'svsort') return; V2.svUi.sort = e.detail.value; const g = document.querySelector('.svt2-grid'), t = document.createElement('div'); t.innerHTML = V2.savedHtml(); const ng = t.querySelector('.svt2-grid'); if (g && ng) g.innerHTML = ng.innerHTML; });

// ---------- Edit Set (R4, Nov 11): a sheet over My Team; every change and every list of choices is today's (31-set-edits.js) ----------
// Strip of the six to switch Pokémon, then Ability, item, the four moves, nature and stat points; Lock and Remove at the foot.
// After each change the message says how the Strength Score moved (today's site says "ready for X%" / "Offense N of 18" there).
V2.scoreNow = () => { const ms = members(); if (!ms.length) return null; try { const RD = prepOf(ms), G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; return G ? Math.round(G.s) : null; } catch (e) { return null; } };
V2.ed = {i: 0};
V2.editHtml = () => { const i = V2.ed.i, s = S.slots[i], m = s && memberOf(s, i); if (m && V2.ed.rep === i && V2.addHtml) return V2.addHtml(i, m.d); /* Replace (Sim, Nov 17, B) */ if (!m && V2.addHtml) return V2.addHtml(i); /* group six: add into this spot (six.js) */ if (!m) return `<div class="ed2"><div class="np-eyebrow">Spot ${i + 1}</div><h2 class="u">Add a Pokémon</h2><p class="tm-sub">This spot is empty. Pick a Pokémon to fill it.</p><div class="ed-foot"><button type="button" class="np-btn" data-v2search>Add a Pokémon</button></div></div>`;
  const p = m.p, E = V2.esc, pc = x => x != null ? ` (${(+x).toFixed(+x < 1 ? 1 : 0)}%)` : '';
  const tag = (mine, reset, label) => mine ? `<span class="ed-tag mine">Your pick</span><button type="button" class="np-link ed-rs" data-ed="${reset}">${E(label)}</button>` : `<span class="ed-tag">${E(label)}</span>`;
  const field = (lab, tg, ctl, cls = '') => `<div class="ed-f${cls}"><div class="ed-l"><span>${lab}</span>${tg}</div>${ctl}</div>`;
  const sel = (attr, label, opts) => `<label class="np-field ed-sel"><select ${attr} aria-label="${E(label)}">${opts}</select></label>`;
  // the six: tap one to edit it
  const strip = `<div class="ed-strip" role="group" aria-label="Your six: pick one to edit">${S.slots.map((x, k) => { const q = memberOf(x, k); return q ? `<button type="button" class="ed-pk" data-ed="go" data-k="${k}" aria-pressed="${k === i}" aria-label="Edit ${E(q.d)}">${V2.mon(q.p.n, {iw: 56, sel: k === i, bare: true})}</button>` : ''; }).join('')}</div>`;
  // Ability
  const A = abilChoices(s, m);
  const ab = field('Ability', A.mine ? tag(true, 'abreset', 'Use ' + A.rec) : A.only ? `<span class="ed-tag">${p.m ? 'Mega Ability' : 'Only Ability'}</span>` : `<span class="ed-tag">${A.meta ? 'Most used' : 'Suggested'}</span>`,
    sel('data-ed="ab"', 'Ability for ' + m.d, A.list.map(({name, pct}) => `<option value="${E(name)}"${name === m.ability ? ' selected' : ''}>${E(name)}${pc(pct)}${name === A.rec ? ' ★' : ''}</option>`).join('')));
  // Item
  const C = itemChoices(s, i, m), o = (n, x) => `<option value="${E(n)}"${n === C.shown ? ' selected' : ''}>${E(n)}${pc(x)}${n === C.def ? ' ★' : ''}</option>`;
  const it = C.fixed != null ? field('Item', '<span class="ed-tag">Mega Stone</span>', `<p class="ed-fixed">${E(C.fixed)}</p>`)
    : field('Item', C.moved ? `<span class="ed-tag">${E(C.def)} is on a teammate</span>` : C.mine ? tag(true, 'itreset', 'Use ' + (C.def || 'the usual item')) : `<span class="ed-tag">${C.pop.length ? 'Most used' : 'No usage data'}</span>`,
      sel('data-ed="it"', 'Held item for ' + m.d, `${m.item ? '' : '<option value="" selected>(no item)</option>'}${C.pop.length ? `<optgroup label="Most used">${C.pop.map(([n, v]) => o(n, v)).join('')}</optgroup>` : ''}${C.rest.length ? `<optgroup label="Other items">${C.rest.map(n => o(n, null)).join('')}</optgroup>` : ''}`));
  // Moves
  const M = moveChoices(s, p), mo = (x, cur) => `<option value="${E(x.name)}"${x.name === cur ? ' selected' : ''}${x.name !== cur && M.sm.names.includes(x.name) ? ' disabled' : ''}>${E(x.name)} · ${x.type}${x.cat ? ' ' + (x.bp || 'var') : ''}${M.pct.has(x.name) ? ' · ' + (+M.pct.get(x.name)).toFixed(0) + '%' : ''}</option>`;
  const mv = field('Moves', M.custom ? tag(true, 'mvreset', 'Back to the popular set') : `<span class="ed-tag">${E(M.src.charAt(0).toUpperCase() + M.src.slice(1))}</span>`,
    `<div class="ed-mvs">${M.sm.names.map((nm, j) => { const t = nm && mvByName.get(nm); return `<label class="np-field ed-sel ed-mv" style="--tc:var(--ty-${t && V2.TYPES.includes(t.type) ? t.type : 'Normal'});--tcn:var(--tyn-${t && V2.TYPES.includes(t.type) ? t.type : 'Normal'})"><select data-ed="mv" data-j="${j}" aria-label="Move ${j + 1} for ${E(m.d)}"><option value=""${nm ? '' : ' selected'}>(no move)</option>${M.pm.length ? `<optgroup label="Popular">${M.pm.map(x => mo(x, nm)).join('')}</optgroup>` : ''}<optgroup label="All moves it learns">${M.rest.map(x => mo(x, nm)).join('')}</optgroup></select></label>`; }).join('')}</div>`, ' wide');
  // Nature and stat points
  const N = natureChoices(s, p);
  const na = field('Nature', N.ownNat ? tag(true, 'natreset', 'Use ' + (N.top || 'the most used')) : N.top ? '<span class="ed-tag">Most used</span>' : '', /* Nov 15 (audit #26): one tag word, as Ability and Item say */
    sel('data-ed="nat"', 'Nature for ' + m.d, N.order.map(n => `<option value="${E(n)}"${n === N.nat ? ' selected' : ''}>${E(n)} · ${natFx(n)}${N.pc.has(n) ? pc(N.pc.get(n)) : ''}${n === N.top ? ' ★' : ''}</option>`).join('')));
  const L = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'], DV = V2.ed.draft && V2.ed.draft.i === V2.ed.i ? V2.ed.draft.v : null;
  const pts = field('Stat points', (N.ownPts ? tag(true, 'ptsreset', 'Use the most common') : N.cs ? '<span class="ed-tag">Most common</span>' : '') + `<span class="ed-tot${DV && DV.reduce((a, b) => a + b, 0) > SP_TOTAL ? ' over' : ''}" data-ed-tot>${DV ? DV.reduce((a, b) => a + b, 0) : N.sum} of ${SP_TOTAL}</span>`,
    `<div class="ed-pts">${L.map((l, j) => `<label><span>${l}</span><input class="ed-num" type="number" min="0" max="32" step="1" inputmode="numeric" data-ed="pt" data-j="${j}" value="${DV ? DV[j] : N.v[j]}" aria-label="${l} stat points for ${E(m.d)}"></label>`).join('')}</div>
    <div class="ed-ptact"><button type="button" class="np-btn2" data-ed="ptsave"><span>Save Stat Points</span></button><span class="fine" data-ed-msg role="status"></span></div>`);
  const foot = `<div class="ed-foot"><button type="button" class="np-btn2" data-ed="lock" aria-pressed="${!!s.lock}"><span>${s.lock ? 'Locked' : 'Lock'}</span></button><p class="fine">${s.lock ? 'Suggestions never swap out a locked Pokémon.' : 'Lock it so Suggestions never swap it out.'}</p><button type="button" class="np-link ed-rm" data-ed="rm">Remove ${E(m.d)} from the team</button></div>`;
  // Nov 12 (today's features kept, Sim): the slot header (types, rating with its tier, share of teams) and the Weak / Resists fold
  // with the Ability's text (today's 07-render-slots.js: mult() over every type, the Ability counted)
  const P = m.p, R = monRating(P); let H = null; try { H = lairHead(P); } catch (e) {}
  const head = `<div class="tm-types ed-head">${(P.t || []).map(V2.typeChip).join('')}${R ? `<span class="sx-rate2"><b class="u">${R.n}</b> ${R.tier ? V2.esc(R.tier) + ' tier rating' : 'Rating'}</span>` : ''}${H ? `<span class="ed-use">${V2.esc(V2.shareTxt(H))} of tournament teams</span>` : ''}</div>`;
  const wk = [], rs = []; for (const t of V2.TYPES) { let x = 1; try { x = mult(t, P.t, m.ability, true); } catch (e) {} if (x >= 2) wk.push([t, x >= 4 ? '4×' : '']); else if (x <= .5) rs.push([t, x === 0 ? '0×' : x <= .25 ? '¼×' : '']); }
  const chips = a => a.length ? a.map(([t, k]) => `<span class="ed-ty">${V2.typeChip(t)}${k ? `<b>${k}</b>` : ''}</span>`).join('') : '<span class="fine">None</span>';
  const abTxt = typeof ABIL === 'object' && ABIL[m.ability] ? String(ABIL[m.ability]).replace(/Pokemon/g, 'Pokémon') : '';
  const weak = `<details class="ed-weak"${V2.ed.weak ? ' open' : ''}><summary><span class="lbl">Weak to</span><span class="ed-tys">${chips(wk)}</span></summary>
    <div class="ed-weakin"><div class="ed-wrow"><span class="lbl">Resists</span><span class="ed-tys">${chips(rs)}</span></div>${abTxt ? `<p class="fine"><b>${V2.esc(m.ability)}:</b> ${V2.esc(abTxt)}</p>` : ''}</div></details>`;
  return `<div class="ed2"><div class="np-eyebrow">Edit Set</div><h2 class="u">${V2.nameHtml(m.d)}</h2>${head}${strip}<div class="ed-grid">${ab}${it}${mv}${na}${pts}</div><p class="ed-full"><button type="button" class="np-link" data-mssets="${V2.esc(m.p.n)}">Full Popular Sets ›</button></p>${weak}${foot}</div>`; }; /* today's 'Full popular sets ›' (EDIT-09): closes the sheet, opens Popular Sets on this Pokémon */
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('ed-weak')) V2.ed.weak = e.target.open; }, true);
V2.openEdit = (i, fromSheet) => { V2.ed.rep = null; if (i != null) V2.ed.i = i; if (!memberOf(S.slots[V2.ed.i] || {}, V2.ed.i)) { const f = members()[0]; if (!f) return; V2.ed.i = f.i; } V2.ed.draft = null; V2.sheet(V2.editHtml(), {label: 'Edit Set', onClose: swap => { V2.edFlush(); if (fromSheet && !swap && (V2.pages[V2.route()] || {}).place === 'team') V2.openTeamSheet(); } /* reopened at once, so it keeps the sheet's history step and Back still closes it (Nov 15) */}); }; /* Sim Q15 (Nov 15): opened from the Team Sheet, closing Edit Set brings you back to it (not when another sheet replaces it, nor after leaving My Team) */
// redraw the sheet in place and put focus back on the same control (so a keyboard user keeps their place)
V2.edKey = (a = document.activeElement) => a && a.dataset && a.dataset.ed ? `[data-ed="${a.dataset.ed}"]${a.dataset.j != null ? `[data-j="${a.dataset.j}"]` : ''}${a.dataset.k != null ? `[data-k="${a.dataset.k}"]` : ''}` : null;
V2.edRefresh = (key = V2.edKey()) => { const el = document.querySelector('.ed2'); if (!el) return; el.outerHTML = V2.editHtml(); const f = key && document.querySelector('.ed2 ' + key); (f || document.querySelector('.np-sheet')).focus(); };
// one change: apply it, redraw the page and the sheet, and say what it did to the Strength Score
V2.edDo = (fn, say) => { const key = V2.edKey(), b = V2.scoreNow(), r = fn(); if (r === false) return; render(); V2.edRefresh(key); const a = V2.scoreNow();
  const sc = b != null && a != null ? ` · Strength Score ${a === b ? 'stays at ' + a : b + ' → ' + a}` : ''; if (say) toast((typeof say === 'function' ? say(r) : say) + sc); };
document.addEventListener('change', e => { const t = e.target.closest && e.target.closest('.ed2 [data-ed]'); if (!t) return; const i = V2.ed.i, m = memberOf(S.slots[i], i); if (!m) return; const k = t.dataset.ed;
  if (k === 'ab') V2.edDo(() => setAbility(i, t.value), rec => t.value === rec ? `${t.value}: the most-used Ability` : `${t.value} set (most players run ${rec})`);
  else if (k === 'it') V2.edDo(() => setItem(i, t.value), def => `${t.value || 'No item'}${t.value === def ? ': the usual item' : ''}`);
  else if (k === 'mv') { const name = t.value; if (name && !(LEARN[m.p.n] || []).some(x => MV[x].name === name)) { toast(`${m.d} can't learn ${name}`); V2.edRefresh(); return; }
    if (name && [...document.querySelectorAll('.ed2 [data-ed="mv"]')].some(x => x !== t && x.value === name)) { toast(`${m.d} already knows ${name}`); V2.edRefresh(); return; } /* function sweep, Nov 15: the list greys it out; this guards anything that gets past that */
    V2.edDo(() => moveSlotSet(i, +t.dataset.j, name), old => `${name || 'Move removed'}${old && name ? ' replaces ' + old : ''}`); }
  else if (k === 'nat') V2.edDo(() => setNature(i, t.value), 'Nature saved'); });
document.addEventListener('input', e => { const t = e.target.closest && e.target.closest('.ed2 [data-ed="pt"]'); if (!t) return;
  const v = [...document.querySelectorAll('.ed2 [data-ed="pt"]')].map(x => +x.value || 0), tot = v.reduce((a, b) => a + b, 0), el = document.querySelector('[data-ed-tot]');
  if (el) { el.textContent = `${tot} of ${SP_TOTAL}`; el.classList.toggle('over', tot > SP_TOTAL); }
  V2.ed.draft = {i: V2.ed.i, v: [...document.querySelectorAll('.ed2 [data-ed="pt"]')].map(x => x.value === '' ? 0 : Number(x.value))};
  if (document.querySelector('.ed2 [aria-invalid]')) V2.edMark(false); });
/* review Nov 19 #6 (non-visual part): after Save Stat Points finds a problem, the boxes it's about are marked (aria-invalid, linked to the
   line beside Save) and the first gets the focus: a box outside 0-32, or all six when the total is over, or Nature; marks follow the
   numbers as they're fixed, and go once pointsProblem is happy */
V2.edMark = focus => { const B = [...document.querySelectorAll('.ed2 [data-ed="pt"]')], nt = document.querySelector('.ed2 [data-ed="nat"]'), msg = document.querySelector('[data-ed-msg]');
  const v = B.map(x => x.value === '' ? 0 : Number(x.value)), nat = (nt || {}).value, bad = pointsProblem(v, nat);
  const off = v.length !== 6 ? B : B.filter((x, j) => !Number.isInteger(v[j]) || v[j] < 0 || v[j] > 32); /* pointsProblem's first rule, box by box */
  const f = !bad ? [] : off.length ? off : v.reduce((a, b) => a + b, 0) > SP_TOTAL ? B : nt ? [nt] : [];
  V2.fieldOk(B.concat(nt || [])); if (f.length) V2.fieldErr(f, msg, focus); };
// typed stat points are never lost (function sweep, Nov 15): a redraw shows the draft, and closing Edit Set or switching Pokémon saves it,
// or says plainly why it couldn't (the same rule as Save Stat Points)
V2.edFlush = () => { const d = V2.ed.draft; V2.ed.draft = null; const s = d && S.slots[d.i], p = s && byName.get(s.n); if (!p) return;
  const N = natureChoices(s, p); if (d.v.every((x, j) => x === N.v[j])) return; const bad = savePoints(d.i, N.nat, d.v);
  if (bad) { V2.toast(`${V2.esc(p.d)}'s stat points weren't saved: ${V2.esc(bad)}.`); return; } render(); V2.toast(`${V2.esc(p.d)}'s stat points saved`); };
document.addEventListener('click', e => { if (e.target.closest('[data-v2edit]')) { V2.openEdit(+e.target.closest('[data-v2edit]').dataset.v2edit); return; }
  const b = e.target.closest('.ed2 button[data-ed]'); if (!b) return; const i = V2.ed.i, k = b.dataset.ed, m = memberOf(S.slots[i], i);
  if (k === 'go') { V2.edFlush(); V2.ed.i = +b.dataset.k; V2.ed.rep = null; V2.edRefresh(); return; } if (!m) return;
  if (k === 'abreset') V2.edDo(() => resetAbility(i), 'Back to the most-used Ability');
  else if (k === 'itreset') V2.edDo(() => resetItem(i), 'Back to the usual item');
  else if (k === 'mvreset') V2.edDo(() => resetMoves(i), 'Back to the popular set');
  else if (k === 'natreset') V2.edDo(() => resetNature(i), 'Using the nature most players run');
  else if (k === 'ptsreset') V2.edDo(() => { V2.ed.draft = null; return resetPoints(i); }, 'Using the most common stat points');
  else if (k === 'ptsave') { const v = [...document.querySelectorAll('.ed2 [data-ed="pt"]')].map(x => x.value === '' ? 0 : Number(x.value)), nat = (document.querySelector('.ed2 [data-ed="nat"]') || {}).value;
    const bad = pointsProblem(v, nat); if (bad) { const msg = document.querySelector('[data-ed-msg]'); if (msg) msg.textContent = bad; V2.edMark(true); return; } V2.ed.draft = null; V2.edDo(() => savePoints(i, nat, v), 'Stat points saved'); }
  else if (k === 'lock') V2.edDo(() => toggleLock(i), on => on ? `${m.d} locked: Suggestions keep it` : `${m.d} unlocked`);
  else if (k === 'rm') { clearSlot(i); render(); V2.edRefresh('[data-adq]'); /* group six */ toast(`Removed ${m.d}`, true); } });

// ---------- adding a Pokémon (R4, Nov 11): today's addMon into the first empty spot, one of each species (Species Clause) ----------
V2.addState = n => { const p = byName.get(n); if (!p) return 'none'; if (S.slots.some(x => { const q = byName.get(x.n); return q && q.b === p.b; })) return 'have'; return S.slots.findIndex(x => !byName.get(x.n)) < 0 ? 'full' : 'ok'; };
V2.addBtn = n => { const st = V2.addState(n), d = V2.esc(V2.disp(n));
  return st === 'ok' ? `<div class="row ms-add"><button type="button" class="np-btn" data-v2add="${V2.esc(n)}">Add to My Team</button></div>`
    : `<p class="fine ms-add${st === 'have' ? ' ms-on' : ''}">${st === 'have' ? 'On your team ✓' : st === 'full' ? 'Your team is full: remove one on My Team to add it.' : ''}</p>`; };
V2.addToTeam = n => { const p = byName.get(n), st = V2.addState(n); if (st !== 'ok') { if (p) toast(st === 'have' ? `${p.d} is already on your team` : 'Your team is full: remove one on My Team to add it'); return; } const i = S.slots.findIndex(x => !byName.get(x.n)); keepUndo(); addMon(i, p); /* code review C8: Undo, as the Box has */
  // Sim, Nov 12 (decision 15): from a sheet you stay where you are; the sheet shows "On your team ✓" (her approved sheet mock-up, today's behaviour)
  const sh = V2._sheet; render(); if (sh) { const el = document.querySelector('.np-sheet .ms-add'); if (el) el.outerHTML = V2.addBtn(n); } else if (V2.route() === 'pokemon') { if (V2.redraw) V2.redraw(); } /* the Pokémon page took over from the sheet: you stay, it shows 'On your team ✓' (decision 15) */ else if (!/^#team/.test(location.hash)) location.hash = '#team'; toast(p.d + ' added to your team', true); };
document.addEventListener('click', e => { const b = e.target.closest('[data-v2add]'); if (b) V2.addToTeam(b.dataset.v2add); });

// ---------- empty My Team: the lead, and today's underdog (Sim, Nov 11) ----------
// The featured Pokémon comes from the bottom of our own ratings: every Pokémon is somebody's favourite. Flapple goes first
// (Sim: "it's the cutest"), then one a day from the 12 lowest-rated Pokémon that have real games (at least 1% of teams), so
// the rating means something (the very bottom has almost none: Flapple has 43 tournament games, 0.1% of teams). Never shown beside grades or a team's data.
V2.underdog = (now = new Date()) => { const day = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2026, 10, 12)) / 864e5);
  if (day <= 0 || typeof rating !== 'function') return 'Flapple';
  const pool = ROSTER.filter(p => !p.m && (U(p) || 0) >= 1 && SPRITE_ID[p.n]).map(p => ({n: p.n, r: RS(rating(p).total)})).sort((a, b) => a.r - b.r || a.n.localeCompare(b.n)).slice(0, 12);
  return pool.length ? pool[(day - 1) % pool.length].n : 'Flapple'; };
V2.emptyHtml = (o = {}) => { const n = V2.underdog(), d = V2.esc(V2.disp(n)), nSaved = S.teams.filter(t => t.format !== 'singles').length;
  // First visit Q1 B (Sim, Nov 13, the approved first-visit mock-up): the six empty spots (Lead / Back / Bench, the six's own
  // empty tiles: each opens the name box for its spot) beside the lead, and "Or Start from a Winner" (today's six highest-rated,
  // tap one to build around it: Home's handler) beside the underdog
  // Sim, Nov 13 (Empty My Team Q1 B): "Add" with a sub-line under it; scan S4 A (Sim, Nov 20): the sub-line names the spot by its group
  // ("Lead 1", "Lead 2", "Back 1" …), since on phones the groups are columns and "Spot 1 · Spot 3 · Spot 5" read across the top row
  const add = (i, g, k) => `<div class="sx-slot sx-empty"><button type="button" class="sx-add" data-v2addto="${i}" aria-label="Add a Pokémon to slot ${i + 1}"><span class="sx-addart" aria-hidden="true"><i>+</i></span><b>Add</b><small>${g} ${k}</small></button></div>`;
  /* Sim, Nov 20: no Lead / Back / Bench before the six are known (leads are Battle's call): Spot 1-6 */
  const spots = `<div class="tm-six sx tm-e-six"><div class="sx-grps">${[0, 1, 2].map(j => `<div class="sx-grp" role="group" aria-label="Spots ${j * 2 + 1} and ${j * 2 + 2}"><div class="sx-tiles">${add(j * 2, 'Spot', j * 2 + 1)}${add(j * 2 + 1, 'Spot', j * 2 + 2)}</div></div>`).join('')}</div></div>`;
  let top = []; try { top = lairRows().slice(0, 6).map(x => x.p); } catch (e) {}
  const win = top.length ? `<div class="tm-e-win"><h2 class="u">Or Start from a Winner</h2><p>Today's six highest-rated Pokémon. Tap one to build a team around it.</p><div class="tm-e-wg">${top.map(p => { const R = monRating(p), u = homePct(p);
    return `<button type="button" class="tm-e-w" data-hmaround="${V2.esc(p.n)}" aria-label="Build around ${V2.esc(p.d)}">${V2.mon(p.n, {iw: 96, bare: true, tag: true})}<b>${V2.tileName(p.d)}</b><small>${R ? `<span>${R.tier}\u00a0tier\u00a0${R.n}</span>` : ''}${u ? `<span>${u}% of <span class="tm-e-src">Showdown ladder teams</span></span>` : ''}</small></button>`; }).join('')}</div></div>` : '';
  return `<section class="tm-empty tm-empty2"><div class="tm-e-lead"><div class="np-eyebrow">My Team · 0 of 6 · No team yet</div><h1 class="u">Six spots, all yours.</h1><p>Add a Pokémon to start, or let us build a whole team around a favourite.</p>
    <div class="row"><a class="np-btn" href="#build">Build Me a Team</a><button type="button" class="np-btn2" data-v2search><span>Add a Pokémon</span></button><span class="tm-e-links"><button type="button" class="np-link" data-v2import>Import a Team ›</button>${nSaved ? `<button type="button" class="np-link tm-e-saved" data-v2saved>Saved Teams <small>${nSaved}</small> ›</button>` : ''}</span></div>${V2.restoreHtml()}</div>
    ${spots}${win}<div class="tm-ud"><div class="tm-ud-hd"><div class="np-eyebrow">Today's underdog</div><h2 class="u ud-nm" data-v2mon="${V2.esc(n)}">${d}. <span>Somebody's favourite.</span></h2></div><button type="button" class="tm-ud-st" data-v2mon="${V2.esc(n)}" tabindex="-1" aria-label="${d}: open its info">${V2.mon(n, {iw: 240, bare: true, ft: true})}</button><div class="tm-ud-bd">
    <p>Rarely picked in tournaments, but every Pokémon deserves its moment. Maybe it's yours?</p>
    <div class="row">${o.preview || V2.addState(n) === 'ok' ? `<button type="button" class="np-btn2" data-v2add="${V2.esc(n)}"><span>Add ${d} to My Team</span></button>` : ''}<button type="button" class="np-link" data-v2mon="${V2.esc(n)}">Pokémon Page ›</button></div><p class="np-or"><a class="np-link" href="#build">Or Build Around Your Favourite Pokémon ›</a></p></div></div></section>`; };

// ---------- Share (R4, Nov 11): today's share images (44-share-images.js, proved pixel-identical with same-share.mjs) ----------
// Team Card / Team Poster / Team Sheet, light or dark; Save Image (the downloads capability, else a plain download) and Copy Team
// Link (today's team link). The new build draws its sprites from its own art folder.
V2.shUi = {kind: 'card', mode: null, url: null, blob: null, saved: null};
if (!window.__SPR) window.__SPR = new Proxy({}, {get: (t, id) => typeof id === 'string' && /^\d+$/.test(id) ? V2.art(id) : undefined});
// Nov 15: The Slab (Sim, Nov 14, Q4 A) joins the kinds; it has one fixed look, so its second choice is the shape (Tall for feeds, Wide for link previews)
V2.shCtl = SV => { const U = V2.shUi; return `${SV ? '' : V2.slide('shkind', [['card', 'Team Card', 'card'], ['poster', 'Team Poster', 'poster'], ['sheet', 'Team Sheet', 'list']], U.kind, 'What to share')}${V2.slide('shmode', [['light', 'Light'], ['dark', 'Dark']], U.mode, 'Image style')}`; }; /* Sim, Nov 15 (recommended): Team Card = The Slab wide, Team Poster = The Slab tall, Team Sheet = the Tale of the Tape image; The Slab's own tab merged in; all three Light or Dark */
V2.openShare = savedId => { const U = V2.shUi, t = savedId && S.teams.find(x => x.id === savedId); U.saved = t ? {name: t.name, ms: teamRating(t.slots).ms} : null;
  if (U.saved ? !U.saved.ms.length : !members().length) { if (U.saved) toast('This saved team has no Pokémon'); return; } if (!U.mode) U.mode = V2.theme() === 'night' ? 'dark' : 'light'; const SV = U.saved;
  V2.sheet(`<div class="sh2"><div class="np-eyebrow">Share</div><h2 class="u">${SV ? V2.esc(SV.name) + ': Team Poster' : 'Share Your Team'}</h2>
    <div class="sh2-ctl" data-sh2ctl>${V2.shCtl(SV)}</div>
    <div class="sh2-img" data-sh2img aria-live="polite"><p class="fine">Drawing your image…</p></div>
    <div class="sh2-acts"><button type="button" class="np-btn" data-sh2save disabled>Save Image</button>${SV ? '' : '<button type="button" class="np-btn2" data-copylink><span>Copy Team Link</span></button>'}<span class="fine" id="shareMsg" data-sh2msg role="status"></span></div>
    <p class="fine">On a phone you can also press and hold the image to save or share it.${SV ? '' : ' The team link opens this six on NastyPlot.'}</p></div>`, {label: SV ? 'Team poster' : 'Share'});
  V2.shDraw(); };
/* Nov 15 (audit): draws run one at a time and only the newest pick is shown and saved (quick taps could show the wrong image) */
V2.shDraw = () => { const t = V2.shTok = (V2.shTok || 0) + 1; V2.shQ = (V2.shQ || Promise.resolve()).then(() => t === V2.shTok ? V2.shDraw0(t) : null).catch(() => {}); return V2.shQ; };
V2.shDraw0 = async (tok) => { const U = V2.shUi, box = document.querySelector('[data-sh2img]'), sv = document.querySelector('[data-sh2save]'); if (!box) return; const SV = U.saved, ms = SV ? SV.ms : members(), was = CH.shareMode, kind = SV ? 'poster' : U.kind;
  if (sv) sv.disabled = true; CH.shareMode = U.mode; let c = null;
  try { c = SV ? await V2.slab(ms, 'tall', U.mode !== 'dark', SV.name) : kind === 'poster' ? await V2.slab(ms, 'tall', U.mode !== 'dark') : kind === 'sheet' ? await (V2.tapeImage ? V2.tapeImage(ms, U.mode === 'dark') : buildSheetImage(ms)) /* Nov 15: the Team Sheet image in the Tale of the Tape look (share-tape.js) */ : await V2.slab(ms, 'wide', U.mode !== 'dark'); } catch (e) { c = null; } finally { CH.shareMode = was; }
  if (U.url) { try { URL.revokeObjectURL(U.url); } catch (e) {} U.url = null; }
  let blob = null; if (c) try { blob = await new Promise(r => c.toBlob(r, 'image/png')); } catch (e) {}
  if (tok !== V2.shTok) { if (sv) sv.disabled = true; return; }
  if (U.url) try { URL.revokeObjectURL(U.url); } catch (e) {} U.blob = blob; U.url = blob ? URL.createObjectURL(blob) : null; if (!document.contains(box)) return;
  box.className = 'sh2-img' + (kind === 'card' ? '' : ' tall');
  box.innerHTML = U.url ? `<img src="${U.url}" alt="${SV ? V2.esc(SV.name) + ' as a NastyPlot team poster' : U.kind === 'sheet' ? 'Your team as a NastyPlot team sheet: every set, nature and stat' : U.kind === 'slab' ? 'Your team as a NastyPlot share card, The Slab' : U.kind === 'poster' ? 'Your team as a NastyPlot team poster' : 'Your team as a NastyPlot share card'}">` : '<p class="fine">Could not draw the image in this view.</p>';
  if (sv) sv.disabled = !blob; };
document.addEventListener('v2slide', e => { const k = e.detail.key; if (k !== 'shkind' && k !== 'shmode' && k !== 'shshape') return; V2.shUi[k === 'shkind' ? 'kind' : k === 'shshape' ? 'shape' : 'mode'] = e.detail.value;
  if (k === 'shkind') { const ctl = document.querySelector('[data-sh2ctl]'); if (ctl) ctl.innerHTML = V2.shCtl(V2.shUi.saved); } V2.shDraw(); });
document.addEventListener('click', async e => { if (e.target.closest('[data-v2share]')) { V2.openShare(); return; }
  if (!e.target.closest('[data-sh2save]')) return; const U = V2.shUi, msg = document.querySelector('[data-sh2msg]'); if (!U.blob) return;
  const name = U.saved ? U.saved.name.replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + ' poster - NastyPlot.png' : ((typeof teamTitleFor === 'function' ? teamTitleFor(members()) : '') || 'My Team').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + (U.kind === 'poster' ? ' poster' : U.kind === 'sheet' ? ' sheet' : U.kind === 'slab' ? ' slab' : '') + ' - NastyPlot.png';
  let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (er) {}
  if (dl) { try { await dl.save({filename: name, data: U.blob}); if (msg) msg.textContent = 'Saved.'; } catch (err) { if (msg) msg.textContent = err && err.code === 'declined' ? 'Not saved.' : 'Saving is not available here. Press and hold the image instead.'; } }
  else { const a = document.createElement('a'); a.href = U.url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); if (msg) msg.textContent = 'Downloaded.'; } });

// ---------- a shared team link (R4, Nov 11): today's decodeTeam (same rules as a pasted team) and loadShared ----------
// The link's team replaces yours only if you say so (as today); Undo brings yours back.
V2.checkShared = () => { let raw = ''; try { raw = location.hash || ''; } catch (e) {} if (!/team=/.test(raw)) return; const x = decodeTeam(raw);
  try { history.replaceState(history.state, '', location.pathname + location.search + '#team'); } catch (e) {}
  if (!x) { V2.draw(); toast("That team link didn't work: it may be cut off"); return; } V2.draw();
  const name = x.n || 'A shared team', six = x.slots.map(s => `<li>${V2.mon(s.n, {iw: 72})}</li>`).join('');
  V2.sheet(`<div class="shd2"><div class="np-eyebrow">Shared team</div><h2 class="u">${V2.esc(name)}</h2><ul class="shd2-six">${six}</ul>
    <p class="tm-sub">${members().length ? 'Open it as your team? Undo brings yours back.' : 'Open it as your team?'}</p>
    <div class="row shd2-acts"><button type="button" class="np-btn" data-shdload>Load Team</button><button type="button" class="np-link" data-v2close>Not Now</button></div></div>`, {label: 'Shared team', small: true, focus: '[data-shdload]'});
  const b = document.querySelector('[data-shdload]'); if (b) b.addEventListener('click', () => V2.openShared(x)); };
// today's applyShared without its page switch: load (Undo kept), back to My Team, the same toast
V2.openShared = x => { loadShared(x); V2.closeSheet(true); V2.ui.sel = 0; V2.ui.picked = false; if (!/^#team/.test(location.hash)) location.hash = '#team'; render(); toast(`Loaded ${x.n ? '“' + x.n + '”' : 'a shared team'} (${x.slots.length} Pokémon)`, true); };

// ---------- Import and Clear Team (R4, Nov 11): today's importPaste and clearTeam, same messages ----------
V2.openImport = (o = {}) => { let done = false;
  V2.sheet(`<div class="imp2"><div class="np-eyebrow">Import</div><h2 class="u">Paste a Team</h2>
    <p class="tm-sub">A Showdown team or a NastyPlot team link. Undo brings yours back.</p>
    <textarea class="imp2-in" data-impin rows="9" spellcheck="false" autocomplete="off" aria-label="Paste a Showdown team to import" placeholder="Paste here: a team from Showdown, Pokémon Zone, Pikalytics or Victory Road"></textarea>
    <p class="imp2-note" data-impnote role="status" aria-live="polite"></p>
    <div class="imp2-acts"><button type="button" class="np-btn" data-impgo>Replace My Team</button><p class="fine">Pokepaste links can't be opened from here; copy the team text instead.</p></div>
    ${typeof regNote === 'function' ? regNote('fine imp2-reg') : ''}</div>`, {label: 'Import a Team', small: true, focus: '[data-impin]',
    /* audit Nov 16 (focus order): opened from Home, closing it without importing goes back to Home with focus on its Import button */
    onClose: swap => { if (swap || done || !o.fromHome) return; location.hash = '#home'; setTimeout(() => { const b = document.querySelector('[data-v2homeimport]'); if (b) b.focus(); }, 150); }});
  const go = document.querySelector('[data-impgo]'); if (!go) return;
  go.addEventListener('click', () => { const r = importPaste((document.querySelector('[data-impin]') || {}).value);
    if (r.shared) { done = true; V2.openShared(r.shared); return; }
    if (r.error) { const n = document.querySelector('[data-impnote]'); if (n) n.textContent = r.error; V2.fieldErr(document.querySelector('[data-impin]'), n); return; } /* review Nov 19 #6: the box is marked and gets the focus */
    done = true; V2.closeSheet(true); V2.ui.sel = 0; V2.ui.picked = false; render(); toast(r.msg, true); }); };
/* Sim's design review (Nov 18, P1 #1): Clear Team empties all six, so its Undo stays 10 s (the toast also waits while hovered or
   focused) and the focus goes to that Undo, not the page heading; test app/test/v2-clear.mjs */
/* Q26 A (Sim, Nov 19, design review #2): Clear Team also keeps the cleared six (Undo's own copy: slots with their sets, and the open
   saved team) with its name, in this page's memory like the Undo (nothing is saved or sent); the empty My Team offers "Restore Last Team"
   after the 10 s Undo is gone, until a Pokémon is added (bridge.js render forgets it); test app/test/v2-q26.mjs */
V2.clearTeam = () => { const lo = S.teams.find(t => t.id === S.loadedId), had = S.slots.some(x => x && x.n); clearTeam();
  V2.ui.lastClear = had && ui.undo ? {slots: JSON.parse(JSON.stringify(ui.undo.slots)), loadedId: ui.undo.loadedId, name: lo ? lo.name : '', at: Date.now()} : null; V2.ui.sel = 0; V2.ui.picked = false; V2.ui.holdRoles = null; render(); toast('Team cleared', true, 10000);
  setTimeout(() => { const u = document.querySelector('.np-toast #toastUndo'); if (u) u.focus({preventScroll: true}); }, 120); };
document.addEventListener('input', e => { if (e.target && e.target.matches && e.target.matches('[data-impin][aria-invalid]')) V2.fieldOk(e.target); }); /* a changed paste is no longer the one that failed */
V2.restoreLast = () => { const L = V2.ui.lastClear; if (!L || S.slots.some(x => x && x.n)) return; S.slots = JSON.parse(JSON.stringify(L.slots)); fixSlots();
  S.loadedId = L.loadedId && S.teams.some(t => t.id === L.loadedId) ? L.loadedId : null; ui.undo = null; V2.ui.sel = 0; V2.ui.picked = false; render();
  toast(L.name ? `Restored “${L.name}”` : 'Your last team is back'); };
V2.restoreHtml = () => { const L = V2.ui && V2.ui.lastClear; if (!L) return ''; const n = L.slots.filter(x => x && x.n).length, m = Math.floor((Date.now() - L.at) / 60000);
  const nm = L.name ? V2.esc(L.name) : `Your last ${n} Pokémon`, ago = m < 1 ? 'a moment ago' : m < 60 ? `${m} min ago` : 'earlier';
  return `<div class="tm-e-rest"><button type="button" class="np-btn2" data-v2restore aria-label="Restore Last Team: ${nm}"><span>Restore Last Team</span></button><p class="tm-e-rest-t">${nm}, cleared ${ago}.</p></div>`; };
document.addEventListener('click', e => { if (e.target.closest('[data-v2import]')) V2.openImport(); else if (e.target.closest('[data-v2clear]')) V2.clearTeam(); else if (e.target.closest('[data-v2restore]')) V2.restoreLast(); });
window.addEventListener('hashchange', () => { if (/team=/.test(location.hash)) V2.checkShared(); });
setTimeout(V2.checkShared, 0);

// ---------- the Strength Score header extras (R4, Nov 11): meter, Why this score?, Switch Team ----------
// the five bands as one bar with a tick at the score (approved mock-up)
V2.meter = s => `<div class="tm-meter" aria-hidden="true"><div class="segs"><i style="--b:var(--band-miss)"></i><i style="--b:var(--band-work)"></i><i style="--b:var(--band-solid)"></i><i style="--b:var(--band-ready)"></i><i style="--b:var(--band-top)"></i></div><span class="tick" style="left:${Math.max(0, Math.min(100, s))}%"></span><div class="lbls"><span>Missing a basic</span><span>Top tier</span></div></div>`;
// today's breakdown (CH.whyData, the same numbers and sentences as today's "Why this score?"), as a sheet
// G given: another team's score (Compare's "Why These Scores", inline: no eyebrow, no key or link, those show once below)
V2.whyHtml = (G0, o = {}) => { let G = G0; if (G === undefined) { const ms = members(), RD = ms.length ? prepOf(ms) : null; G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } const W = CH.whyData(G), E = V2.esc; if (!W) return V2.whyNone(G);
  const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v), row = (n, t) => `<li><b>${n}</b><span>${t}</span></li>`;
  const band = ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid';
  const head = `${o.inline ? '' : '<div class="np-eyebrow">Strength Score</div>'}<div class="np-score sm" style="--band:var(--band-${band})"><b>${W.s}</b><div class="w"><span>${E(W.word)}${W.partial ? ' so far' : ''}</span><small>${W.partial ? `${W.k} of 6 picked` : E(W.rank)}</small></div></div>${V2.meter(G.s)}`; // the band meter lives here only (Sim, Nov 11: under the score it repeated the band word)
  const parts = W.partial ? `<ul class="why2-l why2-p"><li><span>From how your ${W.k} Pokémon, their pairs and their sets do in real tournament games</span></li><li><span>Each of the ${6 - W.k} empty slot${6 - W.k === 1 ? '' : 's'} counts as an average tournament pick, so a strong pick raises it and a weak one lowers it</span></li><li><span>Matchups and real results join once all six are in</span></li></ul>`
    : `<p class="tm-sub">Teams scoring like this win about ${W.e}% against today’s tournament teams. It adds up from:</p><ul class="why2-l">${row(W.base, 'from how its Pokémon, pairs and sets do in real tournament games')}${row(sg(W.mu), `for its matchups (beats or handles ${E(String(W.ready).replace('/', ' of '))} top threats). They count a little, since players often play around a shaky matchup`)}${W.hasSix ? row(sg(W.own), `from ${W.ownGames.toLocaleString('en-US')} of this exact six's games at events (the ones with both full teams known), with its players' skill taken out`) : '<li><b>–</b><span>This exact six hasn’t been played in tournaments yet, so the rest is our estimate</span></li>'}<li class="why2-sum"><b>${W.s}</b><span>Strength Score</span></li></ul>`;
  return `<div class="why2${o.inline ? ' why2-in' : ''}">${head}${parts}${W.partial || o.inline ? '' : `<p class="fine">${E(CH.WHY_TEST)}</p>`}${W.sure ? `<p class="fine">How sure: <b>${E(W.sure.w)}</b>. ${E(W.sure.t[0].toUpperCase() + W.sure.t.slice(1))}.</p>` : ''}${W.illegal ? `<p class="tm-sub">Not legal yet: fix the items first.</p>${typeof regNote === 'function' ? regNote() : ''}` : ''}${o.inline ? '' : `<p class="fine">${E(CH.LETTERS)}</p><p class="fine"><a class="np-link" href="#method">How the Strength Score works ›</a></p>`}${o.inline ? '' : V2.howHtml()}</div>`; };
// Sim, Nov 12 (iPhone): "Why this score?" opened empty. The explanation needs the Strength Score; when it can't be worked out the
// page shows the older check-based number, so say which case it is and what the number is, never an empty sheet.
V2.whyNone = G => { const E = V2.esc, ms = members(), bases = ms.map(m => (byName.get(m.p.n) || {}).b || m.p.n), dup = bases.find((b, i) => bases.indexOf(b) !== i);
  const why = ms.length < 6 ? `Your team has ${ms.length} of 6 Pokémon. The Strength Score needs all six.`
    : dup ? `Your team has two forms of ${E(V2.disp(dup))}. Tournament rules allow only one of each Pokémon, so the Strength Score can't be worked out until one of them is swapped.`
    : typeof modelOK === 'function' && !modelOK() ? `Today's data is still loading. Try again in a moment.`
    : `The Strength Score couldn't be worked out for this team.`;
  return `<div class="why2"><div class="np-eyebrow">Strength Score</div><h2 class="u">Not Worked Out Yet</h2><p class="tm-sub">${why}</p>${G && G.v === 1 ? `<p class="fine">The ${E(String(G.s))} shown for now is the simpler check-based score: how its Pokémon do in real tournament games, minus points for any missing basic.</p>` : ''}</div>`; };
document.addEventListener('click', e => { if (e.target.closest('[data-v2why]')) V2.sheet(V2.whyHtml(), {label: 'Why This Score?', small: true}); });

// Team Checks (Sim, Nov 11): checks that pass fold into one line; only the ones that fail show in full (a note says it's a note)
V2.ckBody = (D, ck) => { const fb = D.basics.filter(x => !x.ok), fn = D.notes.filter(x => !x.ok), pb = D.basics.filter(x => x.ok), pn = D.notes.filter(x => x.ok);
  const nb = D.basics.length, nn = D.notes.length, allOk = !fb.length && !fn.length;
  const fails = fb.length || fn.length ? `<ul class="tm-ck">${fb.map(ck).join('')}${fn.map(x => ck(x).replace('<span>', '<span><em class="tm-cknote">Note</em> ')).join('')}</ul>` : '';
  const passed = pb.length + pn.length, line = allOk ? `All ${nb} basics${nn ? ` and all ${nn} notes` : ''} pass` : `${passed} more pass`;
  return `${fails}${passed ? `<details class="tm-ckok"><summary><b aria-hidden="true">✓</b>${line}</summary>${pb.length ? `<ul class="tm-ck">${pb.map(ck).join('')}</ul>` : ''}${pn.length ? `<h3 class="tm-h3">${CK_TXT.notes}</h3><p class="fine">${CK_TXT.notesWhy}</p><ul class="tm-ck">${pn.map(ck).join('')}</ul>` : ''}<p class="fine">${CK_TXT.intro}</p></details>` : ''}`; };

// the More menu (Sim, Nov 11): every other My Team action, one per row; Clear Team sits last, apart
V2.moreHtml = () => { const ms = members();
  const row = (attrs, label, sub) => `<li><button type="button" class="tm-mi" ${attrs}><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</button></li>`;
  return `<div class="tm-moremenu"><div class="np-eyebrow">My Team</div><h2 class="u">More</h2><ul>
    ${row('data-v2sheetopen', 'Team Sheet', 'Every set on one page')}${ms.length ? row('data-v2copy', 'Copy for Showdown', 'The team as text, ready to paste') : ''}
    ${ms.length ? row('data-v2export', 'Export', 'The Showdown text to read, select or copy') : ''}${row('data-v2import', 'Import', 'Paste a team or a team link')}${ms.length ? row('data-cxgo2="cur|"', 'Compare', 'Side by side with another team') : ''}
    <li><a class="tm-mi" href="#box"><span>My Box</span><small>The Pokémon you own</small></a></li></ul>
    ${ms.length ? `<ul class="tm-mdanger">${row('data-v2clear', 'Clear Team', 'Empties all six spots. Undo brings them back')}</ul>` : ''}</div>`; };
document.addEventListener('click', e => { if (e.target.closest('[data-v2more]')) { V2.sheet(V2.moreHtml(), {label: 'More', small: true, focus: '.tm-mi'}); return; }
  // actions that don't open their own sheet close the menu (the others replace it)
  const t = e.target.closest('.tm-moremenu [data-v2copy],.tm-moremenu [data-v2clear],.tm-moremenu a[href],.tm-moremenu [data-cxgo2]'); if (t) setTimeout(() => { if (document.querySelector('.np-sheet .tm-moremenu')) V2.closeSheet(true); }, 0); });

// ---------- drawing ----------
V2.ui = V2.ui || {sel: 0, mu: 'top'};
V2.LV = ['No answer', 'Shaky', 'Handles it', 'Beats it']; // the four calc levels (word list)
// Sim, Nov 15 night: on phones a long band word ('Tournament ready') can't fit beside the name (it was cut off, or squeezed the name to a
// letter-wide column); then the score belt takes its own full-width row under the name, at full size. Safe to repeat (after every draw).
V2.mtBeltFit = () => { const h = document.querySelector('.tm-hero.mt'); if (!h) return; h.classList.remove('mt-wide'); V2._mtWide = false; if (innerWidth >= 1100) return; /* phones and 700-1099 (the belt is narrow in both) */ const sp = h.querySelector('.mt-belt .w span'), belt = h.querySelector('.mt-belt .np-score'); if (!sp || !belt) return;
  const longest = Math.max(...sp.textContent.trim().split(/\s+/).map(wd => { const r = document.createElement('span'); r.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; const cs = getComputedStyle(sp); r.style.font = cs.font; r.style.fontStyle = cs.fontStyle; r.textContent = wd; document.body.append(r); const w = r.getBoundingClientRect().width; r.remove(); return w; }));
  const cs = getComputedStyle(belt), room = belt.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); if (longest > room) { h.classList.add('mt-wide'); V2._mtWide = true; } };
{ let t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (V2.mtBeltFit) V2.mtBeltFit(); }, 120); }); }
V2.pages.team = {place: 'team', draw() {
  const D = V2.teamData();
  if (D.empty) return V2.emptyHtml();
  const {ms, G} = D, sel = ms[Math.min(V2.ui.sel, ms.length - 1)], s = G ? Math.round(G.s) : null;
  const word = G ? CH.wordOf(G.s) + (G.partial ? ' so far' : '') : '';
  const rank = G && !G.partial && G.rk != null ? CH.rankShort(G.rk) + ' of tournament teams' : G && G.partial ? `${ms.length} of 6 picked` : '';
  // today's hero: the win line, and a note when few real games back this mix ("How sure" itself is in Why this score?)
  /* Nov 21: after Remove the line under the score keeps the height it had (six.js sets V2.ui.winHold), so nothing above the six moves; let go once the team changes size */
  const WH = V2.ui.winHold; if (WH && WH.n !== ms.length) V2.ui.winHold = null; const wh = V2.ui.winHold ? ` style="min-height:${V2.ui.winHold.h}px"` : ''; const SH = V2.ui.scoreHold; if (SH && SH.n !== ms.length) V2.ui.scoreHold = null; const sh = V2.ui.scoreHold ? `;min-height:${V2.ui.scoreHold.h}px` : '';
  const su = G && G.st && G.st.su, low = su && su.w === 'Low', win = G && G.v === 2 && !G.partial && G.e != null ? `Teams scoring like this win about ${Math.round(G.e)}% against today’s tournament teams` : '';
  /* scan S2 (Nov 20, Sim: 'go with your recommendations'): the 'Saved Teams · N saved ›' link (a quick switch sheet) is gone; it sat right above
     the 'Saved Teams N' button. The button stays: it is in the action row on every team, and its sheet opens a team the same way (Open, with Undo). */
  const L = legalOf(ms), title = D.saved || (ms.length ? teamTitleFor(ms) : '');
  // today's header line "My team: 6 of 6, Sun team": the count and the weather or terrain the six sets (shared wxKeyOf / wxName)
  let wx = ''; try { const k = ms.length ? wxKeyOf(ms) : null; if (k) wx = wxName(k); } catch (e) {}
  // Legal mark (mock-up: in the jump bar); narrower windows show it in the hero's links row instead, where it has room
  const legalMark = ms.length ? `<span class="tm-legal${L.illegal ? ' bad' : ''}" title="Based on our reading of the ${V2.esc(REG_NAME)} rules. Check the official rules before an event."><i aria-hidden="true"></i>${L.illegal ? 'Not legal yet' : 'Legal for ' + V2.esc(REG_NAME)}</span>` : '';
  const lockup = `<div class="tm-lock"><div class="np-eyebrow tm-eb"><span>My Team · ${ms.length} of 6${wx ? ` · ${V2.esc(wx)}` : ''}</span></div>${title ? `<h1 class="tm-name">${V2.esc(title).replace(/(Mega \S+) ([XYZ])\b/g, '$1\u00a0$2')}</h1>` : ''}${/\(sample\)\s*$/i.test(title || '') ? '<p class="fine tm-sample">This is a sample team, here to show how NastyPlot works. <span class="tm-sample-acts"><a class="np-link" href="#build">Build Me a Team ›</a><button type="button" class="np-link" data-v2import>Import a Team ›</button></span></p>' : ''}${s == null ? `<p class="tm-wait">${ms.length} of 6 picked. The Strength Score shows once the team can be rated.</p>`
    : `<div class="np-score" style="--band:var(--band-${({A: "top", B: "ready", C: "solid", D: "work", F: "miss"})[G.band] || "solid"})"><b>${s}</b><div class="w"><span>${V2.esc(word)}</span><small>Strength Score</small></div></div>`}</div><div class="tm-info">${s == null ? '' : `${win ? `<p class="tm-line">${win}</p>` : ''}<p class="tm-rank">${V2.esc(rank)}</p>${low ? '<p class="fine tm-low">Few real games back this mix yet, so it\'s a best guess</p>' : ''}<div class="tm-links"><button type="button" class="np-link" data-v2why aria-haspopup="dialog">Why This Score? ›</button>${legalMark.replace('class="tm-legal', 'class="tm-legal tm-legal-h')}</div>`}${goneNote(S.slots) ? `<p class="fine tm-gone" role="status">${goneNote(S.slots)}</p>` : ''}</div>`;
  // Sim, Nov 11: the one main action plus two others; the rest in one More menu (Clear Team last, apart, with Undo)
  // A11 proposal (Sim's fix plan): the main button only when there is something to save. A saved team that hasn't changed shows a
  // quiet "Saved ✓" (same sheet behind it, so a copy can still be saved under a new name)
  const lt = S.loadedId && S.teams.find(t => t.id === S.loadedId), same = lt && JSON.stringify(lt.slots) === JSON.stringify(S.slots);
  const acts = `<div class="tm-acts">${same ? '<button type="button" class="np-btn2 tm-saved" data-v2save><span>Saved <b aria-hidden="true">✓</b></span></button>' : `<button type="button" class="np-btn" data-v2save>${lt ? 'Update Team' : 'Save Team'}</button>`}<button type="button" class="np-btn2" data-v2share><span>Share as Image</span></button><button type="button" class="np-btn2 tm-svl" data-v2saved><span>Saved Teams <small>${S.teams.filter(t => t.format !== 'singles').length}</small></span></button><button type="button" class="np-btn2 tm-svl tm-more" data-v2more aria-haspopup="dialog"><span>More <b aria-hidden="true">⋯</b></span></button></div>`;
  const nm = D.mu.fav + D.mu.even + D.mu.unf;
  // The Hand (Sim's pick, Nov 14; brief docs/rebuild/mocks/my-team-hand/BRIEF.md), piece 1: Home's band, then three parts in one row:
  // your corner (name, win line with the rank, links), the Strength Score belt, the matchup counts over the four buttons. Same hooks
  // and words as today's header (tm-lock / np-score / tm-acts / data-v2*), so every TEAM / SHARE / IO feature works as before.
  const bandWord = G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid' : 'solid';
  const mtBand = `<p class="fn-band mt-band" aria-hidden="true"><span class="live">My Team</span><span class="tm-eb">${ms.length} of 6${wx ? ` · ${V2.esc(wx.replace(/ team$/i, ''))}` : ''}${ms.length ? ` · ${L.illegal ? 'Not legal yet' : 'Legal ✓'}` : ''}</span>${rank && !(G && G.partial) ? `<span>${V2.esc(rank)}</span>` : ''}</p>`; /* a team being built: the count is already in the band (it said '5 of 6' twice); scan S5 A (Sim, Nov 20): the band says 'Grassy Terrain · Legal ✓' so it stays one line (the full 'Legal for Reg M-C' is in the header and Team Checks) */
  const mtSample = /\(sample\)\s*$/i.test(title || '') ? '<p class="fine tm-sample">This is a sample team, here to show how NastyPlot works. <span class="tm-sample-acts"><a class="np-link" href="#build">Build Me a Team ›</a><button type="button" class="np-link" data-v2import>Import a Team ›</button></span></p>' : '';
  const mtId = `<div class="mt-id"><p class="vh">My Team · ${ms.length} of 6${wx ? ` · ${V2.esc(wx)}` : ''}${ms.length ? ` · ${L.illegal ? 'Not legal yet' : 'Legal for ' + V2.esc(REG_NAME)}` : ''}</p><p class="fn-k">Your corner</p>${title ? `<h1 class="tm-name u">${V2.esc(title).replace(/(Mega \S+) ([XYZ])\b/g, '$1 $2')}</h1>` : ''}${mtSample}
    ${s == null ? `<p class="tm-wait">${ms.length} of 6 picked. The Strength Score shows once the team can be rated.</p>` : `${win ? `<p class="tm-line">${win}. <b class="tm-rank">${V2.esc(rank)}</b></p>` : `<p class="tm-rank">${V2.esc(rank)}</p>`}${low ? '<p class="fine tm-low">Few real games back this mix yet, so it\'s a best guess</p>' : ''}
    <div class="tm-links"><button type="button" class="np-link" data-v2why aria-haspopup="dialog">Why This Score? ›</button><button type="button" class="np-link" data-v2sheetopen aria-haspopup="dialog">Team Sheet <span aria-hidden="true">↗</span></button>${legalMark.replace('class="tm-legal', 'class="tm-legal tm-legal-h')}</div>`}${goneNote(S.slots) ? `<p class="fine tm-gone" role="status">${goneNote(S.slots)}</p>` : ''}</div>`;
  const mtBelt = s == null ? '' : `<div class="mt-belt"><div class="np-score fn-belt" style="--band:var(--band-${bandWord});--bd:var(--band-${bandWord})"><b class="u">${s}</b><div class="w"><span class="u">${V2.esc(G ? CH.wordOf(G.s) : word)}</span><small>Strength Score${G && G.partial ? ' so far' : ''}</small></div></div></div>`; /* Sim, Nov 15 night: 'so far' in the small line, not in the big word (it widened the belt and squeezed the name) */
  // the three counts (brief s1) are left out: Sim, Nov 12, 'no Matchups summary in the header' (TEAM-15); question to Sim with pictures
  const mtNums = nm ? `<div class="mt-nums"><p class="lf"><b class="u">${D.mu.fav}</b><span>Favoured</span></p><p class="le"><b class="u">${D.mu.even}</b><span>Even match</span></p><p class="lu"><b class="u">${D.mu.unf}</b><span>Unfavoured</span></p></div>` : '';
  /* Sim, Nov 21 (the frame's header, party4 mock-up): status line, the name big ('(sample)' smaller), the sample line with Build Me a Team
     and Import a Team as two full-size buttons side by side (fixes the 820-wide tap failure, v2-q69 / tap-size), the Strength Score big
     and blue with its band word and win line, then the action links. Same hooks as today's header (data-v2why, data-v2sheetopen,
     data-v2share, data-v2saved, data-v2more, data-v2save, data-v2import). */
  const sampleT = /\(sample\)\s*$/i.test(title || ''), nSaved = S.teams.filter(t => t.format !== 'singles').length;
  const mtfHead = `<div class="mtf-head"><div class="mtf-id"><p class="mtf-k"><span class="mtf-lg">My team · </span>${ms.length} of 6${wx ? ` · ${V2.esc(wx).replace(/ team$/, '<span class="mtf-lg"> team</span>')}` : ''}${ms.length ? ` · ${L.illegal ? 'Not legal yet' : 'Legal<span class="mtf-lg"> for ' + V2.esc(REG_NAME) + '</span> ✓'}` : ''}</p>
    ${title ? `<h1 class="tm-name u">${V2.esc(title.replace(/\s*\(sample\)\s*$/i, '')).replace(/(Mega \S+) ([XYZ])\b/g, '$1 $2')}${sampleT ? ' <span class="mtf-smp">(sample)</span>' : ''}</h1>` : ''}
    ${sampleT ? `<p class="fine tm-sample">This is a sample team, here to show how NastyPlot works.</p><p class="mtf-bb"><a class="mtf-btn u" href="#build">Build Me a Team ›</a><button type="button" class="mtf-btn u ghost" data-v2import>Import a Team ›</button></p>` : ''}${goneNote(S.slots) ? `<p class="fine tm-gone" role="status">${goneNote(S.slots)}</p>` : ''}</div>
    ${s == null ? `<p class="tm-wait mtf-wait">${ms.length} of 6 picked. The Strength Score shows once the team can be rated.</p>` : `<div class="mtf-score" style="--band:var(--band-${bandWord})${sh}"><p class="lab">Strength Score${G && G.partial ? ' so far' : ''}</p><p class="n u">${s}</p><p class="band u">${V2.esc(G ? CH.wordOf(G.s) : word)}</p>${win ? `<p class="win"${wh}>${win}. <b>${V2.esc(rank)}.</b></p>` : rank ? `<p class="win"${wh}><b>${V2.esc(rank)}</b></p>` : ''}${low ? '<p class="fine tm-low">Few real games back this mix yet, so it\'s a best guess.</p>' : ''}</div>`}
    <p class="mtf-acts"><button type="button" class="np-link" data-v2why aria-haspopup="dialog">Why This Score? ›</button><button type="button" class="np-link" data-v2sheetopen aria-haspopup="dialog">Team Sheet <span aria-hidden="true">↗</span></button><button type="button" class="np-link" data-v2share>Share as Image</button><button type="button" class="np-link" data-v2saved>Saved Teams ${nSaved}</button><button type="button" class="np-link" data-v2more aria-haspopup="dialog">More <span aria-hidden="true">⋯</span></button>${same ? '<button type="button" class="np-link mtf-saved u" data-v2save>Saved <span aria-hidden="true">✓</span></button>' : `<button type="button" class="mtf-btn u" data-v2save>${lt ? 'Update Team' : 'Save Team'}</button>`}</p></div>`;
  const mtHead = `${mtBand}<div class="tm-lock mt-head">${mtId}${mtBelt}<div class="mt-right">${acts.replace(/ tm-svl/g, '')}</div></div>`;
  // Sim's yes (Nov 20, option B of docs/rebuild/research/team-meta-length-nov20.md): on phones (under 700) the bar under the six is real
  // tabs, one section at a time (Your Games stays under it), so the page is about as long as one section; 700 and up as before
  const tabbed = V2.tmTabbed() && !(V2.mtfFrame && V2.isHand(D)) /* Sim, Nov 21: the frame replaces the phone tabs (natural scrolling, about 3 screens) */, tabIds = [...(V2.isHand(D) ? [] : ['tm-set']), 'tm-mu', 'tm-sg', 'tm-ck'];
  if (tabbed) V2.tmHashTab();
  const curTab = tabIds.includes(V2.tmUi.tab) ? V2.tmUi.tab : V2.tmAutoTab(G); /* a tab the player chose (or '#team=sg') wins; else S18's first tab */
  const jump = `<nav class="np-tabs tm-jump" aria-label="On this page">${V2.isHand(D) ? '' : '<a href="#team" data-tmjump="tm-set" aria-current="location">Set</a>'}<a href="#team" data-tmjump="tm-mu"${V2.isHand(D) ? ' aria-current="location"' : ''}>Matchups</a><a href="#team" data-tmjump="tm-sg">Suggestions</a><a href="#team" data-tmjump="tm-ck">Team Checks</a>${legalMark}<button type="button" class="tm-tsbtn" data-v2sheetopen aria-label="Team Sheet">Team Sheet <span aria-hidden="true">↗</span></button></nav>`;
  // 1. Set: the selected Pokémon on its tilted panel, with its whole set (group six: six.js)
  const setSec = V2.isHand(D) ? '' : V2.setSecHtml(D, sel); // The Hand: the editing strip under the Hand replaces the Set section (brief s3)
  // 2. Matchups: real-game verdicts lead, the calc reading underneath (Sim, Nov 10); views and threat sheet in pages/matchups.js (hook)
  V2._hand = V2.isHand(D); /* The Hand, piece 4: stand-outs as small Cards (matchups.js) */ const muSec = V2.muSec ? V2.muSec(D) : '';
  // 3. Suggestions: drawn by pages/sugs.js (R4 sugs hook)
  const sgSec = V2.sgSec(D);
  // 4. Team checks: the 4 basics count, the 3 notes don't (Sim, Nov 9)
  // A2 proposal (Sim's fix plan, Nov 12): the checks are listed ONCE, with the detail that used to sit in a second list inside
  // "Problems and Team Checks" (what the team has or misses, and how often winners have it); the threats "?" sits on its check
  /* scan S19 A (Sim, Nov 20): the threats check's line names its source ("Damage calc: …") and points to Matchups for the real games, so
     its count and Matchups' Favoured / Unfavoured words stop reading like two answers to one question */
  const hand = CH.hand(D.RD), ck = x => `<li class="${x.ok ? 'ok' : ''}"><b aria-hidden="true">${x.ok ? '✓' : '–'}</b><span>${V2.esc(V2.wl(x.label))}${/^Ready for/.test(x.label) ? V2.tip('readiness') : ''}${(x.ok ? x.have : x.miss) ? `<small>${V2.ckCalc(x, V2.esc(V2.undot(V2.wl(x.ok ? x.have : x.miss, hand))))}</small>` : ''}${x.pro && /\d/.test(x.pro) && !x.note ? `<small>${V2.undotHtml(x.pro)}</small>` : ''}</span></li>`; // notes: their 'why' is said once, above them
  const ckSec = `<section class="tm-sec tm-cks" id="tm-ck"><h2 class="u">Team Checks</h2><p class="tm-sub">The 4 basics count toward the score; the notes are advice.${V2.tip('checklist')}</p>${V2.ckBody(D, ck)}${V2.fixFold(D) /* Problems and Team Checks: pages/sugs.js (R4 sugs hook) */}</section>`;
  // the tabs: Suggestions carries how many there are (the numbered cards), Team Checks how many of the 4 basics fail, so a tab with
  // something to act on says so without being opened
  /* Sim Q64 A (Nov 20, 6:17 AM): no count on the Suggestions tab when the section says 'Nothing to fix' (its cards are optional swaps) */
  const nSg = D.sug && !D.sug.pending && !(V2.plan && V2.plan.plans && V2.plan.plans.nothing) ? (sgSec.match(/<span class="np-eyebrow">Suggestion \d+<\/span>/g) || []).length : 0, nCk = D.basics.filter(x => !x.ok).length;
  const tabTxt = {'tm-set': ['Set'], 'tm-mu': ['Matchups'], 'tm-sg': ['Suggestions', nSg, nSg === 1 ? 'suggestion' : 'suggestions'], 'tm-ck': ['Team Checks', nCk, nCk === 1 ? 'basic missing' : 'basics missing']};
  const tabBar = `<div class="np-tabs tm-jump tm-tabs" role="tablist" aria-label="Team sections">${tabIds.map(k => { const [t, n, w] = tabTxt[k], on = k === curTab;
    return `<button type="button" role="tab" id="tmtab-${k}" aria-controls="${k}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-tmjump="${k}">${t}${n ? `<span class="tm-tcnt" aria-hidden="true"> ${n}</span><span class="vh">, ${n} ${w}</span>` : ''}</button>`; }).join('')}</div>`;
  const tabPanels = h => tabbed ? h.replace(/<section class="tm-sec ([^"]*)" id="(tm-(?:set|mu|sg|ck))"/g, (m, c, k) => `<section class="tm-sec ${c}${k === curTab ? '' : ' tm-off'}" id="${k}" role="tabpanel" aria-labelledby="tmtab-${k}"`) : h;
  // Nov 18: the hero is drawn with the belt's last fit (mt-wide), so a redraw no longer drops the belt's full-width row and puts it back
  // in after(): that flip moved everything under the belt 30px and back, and scroll anchoring moved the page 30px on each redraw
  return `<section class="tm-hero mt${V2._mtWide && innerWidth < 1100 ? ' mt-wide' : ''}${V2.mtfFrame && V2.isHand(D) ? ' mtf-hero' : ''}">${V2.mtfFrame && V2.isHand(D) ? mtfHead : mtHead}${V2.mtfFrame && V2.isHand(D) ? V2.mtfFrame(D, sel, sgSec) /* Sim, Nov 21: the frame (Your six, the one you tapped, Suggestions): team-frame.js */ : V2.sixHtml(D, sel)}</section>${tabbed ? tabBar : jump}<div class="tm-work${V2.isHand(D) ? ' mt-work' : ''}${tabbed ? ' tm-tabbed' : ''}">${tabPanels(`${V2.isHand(D) ? muSec : ''}<div class="tm-c1">${setSec}${V2.mtfFrame && V2.isHand(D) ? '' : sgSec}</div><div class="tm-c2">${V2.isHand(D) ? '' : muSec}${ckSec}`)}${V2.ygSec ? V2.ygSec(ms) : ''}</div></div>`;
},
after() { V2.mtBeltFit(); if (V2.mtfHashJump) V2.mtfHashJump(); if (V2.mtfFit) { V2.mtfFit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => V2.mtfFit()); }
  /* Apply on a suggestion: pages/sugs.js (R4 sugs hook) */
  // a redraw now keeps unchanged elements (A5), so bind each element once (a second listener would fire twice)
  document.querySelectorAll('[data-tmsel]').forEach(b => { if (b._v2b) return; b._v2b = 1; b.addEventListener('click', () => { V2.ui.sel = +b.dataset.tmsel; V2.ui.picked = true; V2.redraw();
    /* Sim, Nov 18 (C): with the Hand three across the panel opens under the whole Hand; if that is below the screen, bring its top into view */
    if (V2.mtHand3()) requestAnimationFrame(() => { const e = document.querySelector('#main .mt-edit'); if (e && e.getBoundingClientRect().top > innerHeight - 160) e.scrollIntoView({block: 'nearest', behavior: V2.smooth()}); }); }); });
  document.querySelectorAll('a[data-tmjump]').forEach(a => !a._v2b && (a._v2b = 1) && a.addEventListener('click', e => { e.preventDefault(); V2._jumpPick = a.dataset.tmjump; requestAnimationFrame(V2.jumpSync); /* side-by-side sections: the one you tapped is marked, even when no scroll is needed (A7) */ const t = document.getElementById(a.dataset.tmjump); if (t) { t.scrollIntoView({behavior: V2.smooth()}); const h = t.querySelector('h2'); if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({preventScroll: true}); } } })); /* focus moves to the section heading, so Tab and screen readers carry on from there (audit TEAM-07) */
  V2.jumpSync(); // A7 proposal: the jump bar marks the section you are reading
  if (V2.muAfter) V2.muAfter(); // Matchups hook (pages/matchups.js): keeps an open threat sheet in step with the page
}};
// A7 proposal (Sim's fix plan: "a marker that is always wrong is worse than none"): the jump bar's underline follows the scroll.
// The marked section is the last one whose top has passed just under the bar (ties, as in the desktop columns, go to the one
// earlier in the bar, unless you tapped the other one); at the very end of the page the last one is marked.
V2.jumpSync = () => { const nav = document.querySelector('.tm-jump'); if (!nav || nav.getAttribute('role') === 'tablist') return; /* phones: the tabs mark the chosen one (aria-selected), not the scroll */ const as = [...nav.querySelectorAll('[data-tmjump]')]; if (!as.length) return;
  // (Sim approved A7, Claude's recommendation for wide screens): from 700px the sections sit side by side, so "where you are" has
  // no single answer; there no section is marked (no underline) rather than a wrong one
  if (matchMedia('(min-width:700px)').matches) { for (const a of as) a.removeAttribute('aria-current'); return; }
  const line = Math.min(nav.getBoundingClientRect().bottom, (parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight) + 24; /* Nov 21: My Team frame (Sim approved): Suggestions sits above the bar, in the frame; the line is where the bar's foot is once it sticks, so at the top of the page the section above the bar isn't marked */ let cur = as[0], best = -Infinity;
  for (const a of as) { const s = document.getElementById(a.dataset.tmjump); if (!s) continue; const t = s.getBoundingClientRect().top; if (t <= line && (t > best + 1 || (Math.abs(t - best) <= 1 && a.dataset.tmjump === V2._jumpPick))) { best = Math.max(best, t); cur = a; } }
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) cur = as[as.length - 1];
  for (const a of as) { const on = a === cur; if ((a.getAttribute('aria-current') === 'location') !== on) { if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); } } }; /* audit Nov 16: aria-current (links can't be "selected") */
V2.ckCalc = (x, h) => /^Ready for/.test(x.label) && /^Beats or handles/.test(h) ? `Damage calc: b${h.slice(1)} <button type="button" class="np-link tm-ckmu" data-tmgomu>Real games: see Matchups ›</button>` : h;
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-tmgomu]')) V2.tmGo('tm-mu'); });
// ---------- My Team's tabs on phones (Sim's yes, Nov 20: option B) ----------
V2.tmUi = V2.tmUi || {tab: null, auto: null}; /* tab: the tab the player chose, kept through redraws; auto: the first tab picked for this team (S18) */
/* scan S18 (Nov 20, Sim: 'go with your recommendations'): with no tab chosen, a full team whose Strength Score reads Needs work or Missing a
   basic (under 70, as the belt rounds it) opens on Suggestions, since the fix is what a weaker team needs; any other team on Matchups (the
   approved picture). The pick is kept for that team while it is edited (shares 4+ of its six: a suggestion applied, a Pokémon swapped), so the
   tab never jumps under the player when the score crosses 70; a new six (an import, a loaded or built team) or a new visit picks again. */
V2.tmAutoTab = G => { const ns = S.slots.map(x => x && x.n).filter(Boolean), A = V2.tmUi.auto;
  if (A && ns.filter(n => A.ns.includes(n)).length >= 4) { A.ns = ns; return A.tab; }
  if (!G || G.partial || G.s == null || ns.length < 6) { V2.tmUi.auto = null; return 'tm-mu'; }
  V2.tmUi.auto = {ns, tab: Math.round(G.s) < 70 ? 'tm-sg' : 'tm-mu'}; return V2.tmUi.auto.tab; };
addEventListener('hashchange', () => { if (!/^#team(=|$)/.test(location.hash)) V2.tmUi.auto = null; }); /* leaving My Team: the next visit picks again */
V2.tmTabbed = () => matchMedia('(max-width:699.98px)').matches;
// '#team=mu' / '#team=sg' / '#team=ck' (for a link from elsewhere) opens My Team at that tab, once per arrival of that address
V2.tmHashTab = () => { const m = /^#team=(set|mu|sg|ck)$/.exec(location.hash); if (!m) { V2._tmHash = ''; return; } if (V2._tmHash === location.hash) return; V2._tmHash = location.hash; V2.tmUi.tab = 'tm-' + m[1]; };
// show one section: the tab is marked and the others hidden at once (the next redraw draws the same from V2.tmUi). As the jump bar did
// (TEAM-07), the page brings the section's heading just under the bar, so the tapped section starts at the top of the screen
V2.tmShow = k => { V2.tmUi.tab = k; const nav = document.querySelector('.tm-tabs'); if (!nav) return;
  for (const t of nav.querySelectorAll('[role="tab"]')) { const on = t.dataset.tmjump === k; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; const s = document.getElementById(t.dataset.tmjump); if (s) s.classList.toggle('tm-off', !on); }
  const s = document.getElementById(k); if (s && Math.abs(s.getBoundingClientRect().top - parseFloat(getComputedStyle(s).scrollMarginTop)) > 4) s.scrollIntoView({block: 'start', behavior: V2.smooth()}); };
// a link elsewhere that leads to a section (Matchups' "All 30" and the threat sheet's button): on phones it opens that tab first
V2.tmGo = k => { V2.tmUi.tab = k; if (document.querySelector('.tm-tabs')) V2.tmShow(k); const s = document.getElementById(k); if (s) s.scrollIntoView({block: 'start'}); };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.tm-tabs [role="tab"]'); if (t) V2.tmShow(t.dataset.tmjump); });
document.addEventListener('keydown', e => { const t = e.target.closest && e.target.closest('.tm-tabs [role="tab"]'); if (!t) return; const as = [...t.parentElement.querySelectorAll('[role="tab"]')], i = as.indexOf(t);
  const j = e.key === 'ArrowRight' ? (i + 1) % as.length : e.key === 'ArrowLeft' ? (i - 1 + as.length) % as.length : e.key === 'Home' ? 0 : e.key === 'End' ? as.length - 1 : -1; if (j < 0) return;
  e.preventDefault(); as[j].focus(); V2.tmShow(as[j].dataset.tmjump); });
// crossing 700 redraws, so phones get the tabs and wider windows the sections side by side, with no reload
matchMedia('(max-width:699.98px)').addEventListener('change', () => { if (V2.route() === 'team' && V2.redraw) V2.redraw(); });
addEventListener('hashchange', () => { if (V2.route() === 'team' && /^#team=/.test(location.hash) && V2.redraw) V2.redraw(); });
let jumpRaf = 0; addEventListener('scroll', () => { if (jumpRaf) return; jumpRaf = requestAnimationFrame(() => { jumpRaf = 0; if (V2.route() === 'team') V2.jumpSync(); }); }, {passive: true});
addEventListener('resize', () => { if (V2.route() === 'team') V2.jumpSync(); });
// a look at the empty My Team without emptying anyone's team (the redesign preview links here; it changes nothing)
if (window.__NP_PREVIEW) V2.pages['team-empty'] = {place: 'team', draw: () => V2.emptyHtml({preview: true})}; /* a Preview-only look at the empty My Team (code review A1-M5) */

// ---------- How Scoring Works (Nov 12: today's fold, kept; Sim: at the end of "Why this score?", words updated to the word list) ----------
// Today's eight paragraphs (body.html "How scoring works"); each shows its first sentence and "More". Wording changed only where the
// word list says so (Ready for the top threats / readiness -> Matchups, Plans -> Suggestions, Elo -> player skill) and where today's
// text no longer matched the code (Team checks: 4 counted basics + 3 notes, proChecks; checked Nov 12).
V2.HOW_SCORE = [
  'Matchups: the 30 Pokémon that make top cut most often (weighted by how often), and for each one whether your team is prepared. Every verdict is a real damage calc (the same engine as the damage calc, checked against Smogon\'s Champions calculator) with your sets against the set most players run, with the speed, weather, terrain, Tailwind and Trick Room your team actually has. A Pokémon of yours that moves first and OHKOs it, survives its best hit and OHKOs back, or takes at most half per hit and 2HKOs it is a solid answer; Intimidate (not into Defiant or Competitive), Will-O-Wisp, Wide Guard, Taunt or a fragile 1-on-1 win are partial answers. Support Pokémon whose job is Trick Room, screens or redirection are judged by answers to that job (Taunt, Imprison, your own Trick Room, screen breakers, Infiltrator, spread attacks, or KOing them before Trick Room goes up). Beats it = 2+ solid answers, Handles it = 1, Shaky = partial only, No answer = none, and one level lower when a threat beats 4+ of your six 1-on-1. Matchups count 1, 0.8, 0.4 and 0 points for those. The definition was checked on 42 hand-worked matchups and on 31,598 real tournament games, where better-prepared teams did better than the players\' skill alone predicts. It is preparation, not a forecast: NastyPlot doesn\'t predict who wins a game, because the player decides that. Two Pokémon holding the same item make a team illegal (VGC Item Clause).',
  'Team checks: what recent event winners usually have, measured live from the Events data. Four basics count: Mega Evolution, no major weak spot, weak spots spread out, and Matchups. Three notes are shown but not counted, because teams with them didn\'t win more often in real games: speed control, spread damage and lead support (Fake Out, Intimidate or redirection). A missing check is a gap to know about, not a verdict. Move sets for other players\' teams are estimated from popular sets, so a move only some players run counts as "partly" (~), and a partly-there check is not counted as passed.',
  'Defense: for each attacking type, Pokémon weak to it are matched against Pokémon that resist it, and immunities count as resists. Abilities counted on defense: Levitate, Eelevate, Earth Eater, Flash Fire, Well-Baked Body, Water Absorb, Storm Drain, Dry Skin, Volt Absorb, Lightning Rod, Motor Drive, Sap Sipper, Thick Fat, Heatproof, Water Bubble, Purifying Salt, Fluffy.',
  'Offense: each Pokémon\'s damaging moves, after Aerilate, Pixilate, Refrigerate, Galvanize, Dragonize, Liquid Voice, Scrappy and Tinted Lens change how they hit.',
  'Suggestions: Pokémon are rated from in-game rankings, tournament use and ladder usage, then checked for speed control, Fake Out or redirection, weather and Trick Room fit, and how often real teams pair them with yours. Each suggestion says which top threats it covers and which it loses, and the checks it fixes or breaks. Suggestions never leave a duplicate item, a dead item or Choice Scarf under your own Trick Room.',
  'NastyPlot rating: a 0–100 score, read like a school grade, for every legal Pokémon, saying how strong it is in the current format, proven by results. Most of it is top-cut presence: how often it\'s on the teams that reach top cut at Limitless events (recent and bigger events count more). Next, how often strong players pick it: usage with each team weighted by the chance its player is in the top 30% by player skill (over every Limitless game), like Smogon\'s rating-weighted usage. Then whether it reaches top cut more or less often than its usage predicts, and its win rate, both pulled toward average until there are enough games, so a few lucky runs can\'t push a rare pick to the top. Ratings read like school grades (S 90+, A 80s, B 70s, C 60s, D 50s, F under 50) and the best Pokémon shows as 97; halving a Pokémon\'s presence costs about 10 points (about 5 inside S, where the top is squeezed). The mix was chosen by testing ten candidate measures (plain and skill-weighted usage, top cuts weighted by placing, top cuts per entry, event wins, a Wilson lower-bound win rate, skill-adjusted results, results against the most-used Pokémon, how many different players took it to top cut, and consistency) by building each from older events only and checking it against later events\' top cuts and five outside tier lists; only skill-weighted usage added to the core. Team-preview bring and lead rates from Showdown replays are shown on each sheet but not scored until there are more games. The win model isn\'t used here. Pokémon with no tournament results get a rough placeholder from stats, typing and tools, never above 43. Official-event, in-game and replay numbers are shown on each sheet for reference, with other sites\' tier lists for comparison when the daily data job can read a current one (each shows its date; none is scored). Every day the ratings are saved and later checked against the tournaments played after them. Hidden gems are rarely used Pokémon (under 2% of teams) that reach top cut clearly more often than their usage predicts and win more than average, over 300+ games. Suggestions from the whole roster need a rating of 50+.',
  'Archetypes: each team is read by its speed mode (Tailwind, Trick Room, both or none), its field (sun, rain, sand, snow, and Grassy, Psychic, Electric or Misty Terrain) and control plans like Perish Trap. Battle compares both archetypes and weighs them when it picks your 4 and your lead.',
  'Roster, abilities, moves and learnsets come from Pokémon Showdown\'s Champions data.'];
V2.howHtml = () => `<details class="ed-weak hs2"${V2.hsOpen ? ' open' : ''}><summary><span class="lbl">How Scoring Works</span><span></span></summary><div class="hs2-in">${V2.HOW_SCORE.map((t, i) => { const k = t.search(/\. [A-Z(]/), first = k > 0 ? t.slice(0, k + 1) : t, rest = k > 0 ? t.slice(k + 1) : '';
  return `<p>${V2.esc(first)}${rest ? `<span class="hs2-more" hidden>${V2.esc(rest)}</span> <button type="button" class="np-link hs2-mb" data-hsmore aria-expanded="false">More</button>` : ''}</p>`; }).join('')}</div></details>`;
// open / closed is remembered on this device, under today's key (cc2.chf.rhow; audit X-07)
try { V2.hsOpen = !!LS.get('cc2.chf.rhow', false); } catch (e) { V2.hsOpen = false; }
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('hs2')) { V2.hsOpen = e.target.open; try { LS.set('cc2.chf.rhow', V2.hsOpen); } catch (er) {} } }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-hsmore]'); if (!b) return; const s = b.parentElement.querySelector('.hs2-more'); if (!s) return; const open = s.hidden; s.hidden = !open; b.textContent = open ? 'Less' : 'More'; b.setAttribute('aria-expanded', String(open)); });
