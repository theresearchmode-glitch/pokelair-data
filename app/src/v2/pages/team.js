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
  const step = () => { if (V2.plan.job !== job) return; const t = performance.now(); let r;
    try { for (;;) { r = job.g.next(); if (r.done) break; if (performance.now() - t > 30) { setTimeout(step, 0); return; } } } catch (e) { console.error(e); r = {value: []}; }
    V2.plan = {key, plans: r.value || [], job: null}; if (V2.route() === 'team') V2.redraw(); };
  setTimeout(step, 0); };
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
  let LU = null; try { LU = ms.length >= 4 ? teamLineup(ms) : null; } catch (e) {} // today's "↑ Lead" mark on the lead pair (Nov 12)
  const card = m => { const D = sheetData(m), P = m.p, lead = LU && LU.lead.includes(m) ? `<p class="ts2-lead">↑ Lead ${V2.esc(/^vs /.test(PLAN_VS[LU.by]) ? PLAN_VS[LU.by] : '(' + PLAN_VS[LU.by] + ')')}</p>` : LU ? '<p class="ts2-lead no" aria-hidden="true">&nbsp;</p>' : '';
    const nat = D.nat ? `${V2.esc(D.nat)}${D.up && D.dn && D.up !== D.dn ? ` <span class="ts2-nb"><b class="up">+${D.up}</b> <b class="dn">−${D.dn}</b></span>` : ''}` : 'Nature unknown';
    return `<article class="ts2-card" role="button" tabindex="0" data-ts2edit="${m.i}" aria-label="${V2.esc(m.d)}: edit its set"><header>${V2.mon(P.n, {iw: 72, bare: true})}<div><h3 class="u">${V2.nameHtml(m.d)}</h3>${lead}<p><span><em>Item</em> ${V2.esc(m.heldItem || m.item || 'No item')}</span><span><em>Ability</em> ${V2.esc(m.ability || '—')}</span></p></div></header>
      <ul class="ts2-mv">${[0, 1, 2, 3].map(j => { const x = m.moves[j]; return x ? `<li class="np-type" style="--tc:var(--ty-${V2.TYPES.includes(x.type) ? x.type : 'Normal'})">${V2.esc(x.name)}</li>` : '<li class="none">No move</li>'; }).join('')}</ul>
      <p class="ts2-nat"><b>${nat}</b><span>${V2.esc(String(D.src || '').replace(/<[^>]*>/g, ''))}</span></p>
      <div class="ts2-st" role="group" aria-label="Stats at level 50, with stat points below">${D.stats.map(x => `<div class="${x.mark}"><span>${x.S}${x.mark === 'up' ? '<i aria-label="raised by nature">+</i>' : x.mark === 'dn' ? '<i aria-label="lowered by nature">−</i>' : ''}</span><b>${x.val == null ? '—' : x.val}</b><small>${x.pts == null ? '' : x.pts}</small></div>`).join('')}</div></article>`; };
  V2.sheet(`<div class="ts2"><div class="np-eyebrow"><span>${back} · ${V2.esc(teamTitleFor(ms))} · ${reg}</span></div><h2 class="u">Team Sheet</h2>
    <div class="ts2-acts"><button type="button" class="np-btn" data-v2copy><span>Copy for Showdown</span></button><button type="button" class="np-btn2" data-ts2share><span>Share as Image</span></button><p class="fine">Tap a card to edit its set · Big number: the stat at level 50 · small number: stat points (0–32) · <b class="up">+</b> / <b class="dn">−</b> nature</p></div>
    <div class="ts2-grid">${ms.map(card).join('')}</div></div>`, {label: 'Team Sheet'}); };
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
  const c = e.target.closest('[data-ts2edit]'); if (c) { V2.closeSheet(true); V2.openEdit(+c.dataset.ts2edit); } });
document.addEventListener('keydown', e => { const c = e.target && e.target.closest && e.target.closest('[data-ts2edit]'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.click(); } });

// ---------- Save Team (R4, Nov 11): a small sheet; the save itself is today's saveTeamAs (30-saved-data.js) ----------
// Same choices as today's save panel: update the open saved team or save as new, up to 10 teams; Enter does the main action.
V2.openSave = () => { if (!members().length) return; const lo = S.teams.find(t => t.id === S.loadedId), full = S.teams.length >= 10, n = S.teams.length;
  const sh = V2.sheet(`<div class="sv2"><h2 class="u">Save Team</h2>
    <p class="tm-sub">${lo ? `Open now: <b>${V2.esc(lo.name)}</b>. Update it, or save this six as a new team.` : 'Give this six a name.'} <span class="sv2-n">${n} of 10 saved</span></p>
    <form data-v2saveform><label class="np-field"><input data-v2savename maxlength="40" placeholder="Team name, e.g. Rain Archaludon" aria-label="Team name" autocomplete="off" value="${V2.esc(lo ? lo.name : '')}"></label>
    <div class="sv2-acts">${lo ? `<button type="submit" class="np-btn">Update Team</button><button type="button" class="np-btn2" data-v2savenew${full ? ' disabled' : ''}><span>Save as New</span></button>`
      : `<button type="submit" class="np-btn"${full ? ' disabled' : ''}>Save Team</button>`}<button type="button" class="np-link" data-v2close>Cancel</button></div></form>
    ${full ? '<p class="fine sv2-full">You have 10 saved teams. Update the open team, or delete one in Saved Teams to save a new one.</p>' : ''}</div>`, {label: 'Save Team', small: true, focus: lo ? '[data-v2saveform] .np-btn' : '[data-v2savename]'}); // Sim, Nov 11: updating needs no typing, so on phones the keyboard stays down until you tap the name
  const box = document.querySelector('[data-v2saveform]'), inp = box && box.querySelector('[data-v2savename]'); if (!box) return; if (inp && !lo) inp.select();
  const go = over => { const t = saveTeamAs(inp.value, over); if (!t) return; V2.closeSheet(); render(); toast(`Saved "${t.name}"`); };
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
    const head = U.ren === t.id ? `<form class="svt2-ren" data-svrenform="${id}"><label class="np-field"><input data-svname maxlength="40" value="${nm}" aria-label="Team name" autocomplete="off"></label><button type="submit" class="np-btn2"><span>Save</span></button><button type="button" class="np-link" data-svact="renx">Cancel</button></form>`
      : `<header><h3 class="u">${nm}</h3>${on ? '<span class="np-chip">Open now</span>' : ''}</header>`;
    const score = s != null ? `<div class="np-score sm" style="--band:var(--band-${({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid'})"><b>${s}</b><div class="w"><span>${V2.esc(CH.wordOf(G.s))}</span><small>Strength Score</small></div></div>`
      : `<p class="svt2-part">${r.ms.length < 6 ? `${r.ms.length} of 6 picked` : 'Not rated yet'}</p>`;
    const acts = U.del === t.id ? `<div class="svt2-del" role="group" aria-label="Delete ${nm}?"><span>Delete ${nm}?</span><button type="button" class="np-btn2" data-svact="delok" data-id="${id}"><span>Delete</span></button><button type="button" class="np-link" data-svact="delx">Keep</button></div>`
      : `<div class="svt2-acts"><button type="button" class="np-btn2" data-svact="open" data-id="${id}" aria-label="Open ${nm}"><span>Open</span></button><button type="button" class="np-link" data-svact="cmp" data-id="${id}" aria-pressed="${U.cmp === t.id}" aria-label="Compare ${nm}">${U.cmp === t.id ? 'Picked ✓' : 'Compare'}</button><button type="button" class="np-link" data-svact="copy" data-id="${id}" aria-label="Copy ${nm} for Showdown">Copy for Showdown</button><button type="button" class="np-link" data-svact="poster" data-id="${id}" aria-label="Team poster of ${nm}">Team Poster</button><button type="button" class="np-link" data-svact="ren" data-id="${id}" aria-label="Rename ${nm}">Rename</button><button type="button" class="np-link" data-svact="del" data-id="${id}" aria-label="Delete ${nm}">Delete</button></div>`;
    const gone = goneNote(t.slots);
    return `<article class="svt2-card${on ? ' on' : ''}">${head}<ul class="svt2-six" aria-label="${V2.esc(r.ms.map(m => m.d).join(', ') || 'Empty')}">${six}</ul><p class="fine svt2-gone">${gone}</p><div class="svt2-foot">${score}${ck ? `<span class="fine">${ck.pass}/${ck.n} checks</span>` : ''}${(() => { const G = myGames(r.ms); return G ? `<span class="fine">Your games ${G.w}–${G.l}</span>` : ''; })()}</div>${acts}</article>`; };
  // an odd count leaves a hole in the 2-across grid: the free spot invites saving the six on My Team (Sim: no half-filled rows)
  const mine = members().length, free = `<article class="svt2-card svt2-free"><h3 class="u">${10 - n} spots free</h3><p class="tm-sub">${mine ? 'Keep the six on My Team as a saved team.' : 'Build a team on My Team, then save it here.'}</p>
    <div class="svt2-acts">${mine ? '<button type="button" class="np-btn2" data-svact="new"><span>Save This Team</span></button>' : '<a class="np-btn2" href="#build"><span>Build me a team</span></a>'}</div></article>`;
  return `<div class="svt2"><div class="np-eyebrow"><span><a class="np-back" href="#team" data-v2close>← My Team</a> · ${n} of 10 saved</span></div><h2 class="u">Saved Teams</h2>
    <p class="fine svt2-sync">Up to 10 teams. ${(ui.syncSt || 'local') === 'local' ? 'Saved in this browser only.' : 'Saved and kept in step across your devices.'}</p>
    ${U.cmp && S.teams.some(t => t.id === U.cmp) ? `<p class="svt2-cmp" role="status"><b>Compare:</b> ${V2.esc((S.teams.find(t => t.id === U.cmp) || {}).name || '')} is picked. Pick one more saved team, or <button type="button" class="np-link" data-svact="cmpcur">Compare with My Team</button> · <button type="button" class="np-link" data-svact="cmpx">Cancel</button></p>` : n > 1 ? '<p class="fine svt2-cmp">Tap Compare on two teams to see them side by side.</p>' : ''}${n ? `<div class="svt2-sort">${V2.slide('svsort', [['recent', 'Newest', 'clock'], ['name', 'Name'], ['rating', 'Matchups', 'gauge']], U.sort, 'Sort saved teams')}</div><div class="svt2-grid" aria-live="polite">${rows.map(card).join('')}${n % 2 && n < 10 ? free : ''}</div>`
      : mine ? `<p class="tm-sub">No saved teams yet. Save this six to come back to it, compare it, or try changes without losing it.</p><div class="svt2-empty"><button type="button" class="np-btn" data-svact="new"><span>Save This Team</span></button></div>` // Sim, Nov 12 (option B)
      : `<p class="tm-sub">No saved teams yet. Add Pokémon on My Team, then save them here.</p>`}</div>`; };
V2.openSavedTeams = () => { V2.svUi.ren = V2.svUi.del = V2.svUi.cmp = null; V2.sheet(V2.savedHtml(), {label: 'Saved Teams', fit: true}); };
// redraw the sheet in place (the page under it redraws through render()); focus goes to `focus` or the sheet itself
V2.svRefresh = focus => { const el = document.querySelector('.svt2'); if (!el) return; el.outerHTML = V2.savedHtml(); const f = focus && document.querySelector(focus); (f || document.querySelector('.np-sheet')).focus(); if (f && f.select) f.select(); };
document.addEventListener('click', e => { if (e.target.closest('[data-v2saved]')) { V2.openSavedTeams(); return; }
  const b = e.target.closest('[data-svact]'); if (!b) return; const U = V2.svUi, id = b.dataset.id, a = b.dataset.svact;
  if (a === 'open') { const t = openSaved(id); if (!t) return; V2.closeSheet(true); V2.ui.sel = 0; if (location.hash !== '#team') location.hash = '#team'; render(); scrollTo(0, 0); toast(`Opened "${t.name}"`, true); }
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
V2.editHtml = () => { const i = V2.ed.i, s = S.slots[i], m = s && memberOf(s, i); if (!m && V2.addHtml) return V2.addHtml(i); /* group six: add into this spot (six.js) */ if (!m) return `<div class="ed2"><div class="np-eyebrow">Spot ${i + 1}</div><h2 class="u">Add a Pokémon</h2><p class="tm-sub">This spot is empty. Pick a Pokémon to fill it.</p><div class="ed-foot"><button type="button" class="np-btn" data-v2search>Add a Pokémon</button></div></div>`;
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
  const na = field('Nature', N.ownNat ? tag(true, 'natreset', 'Use ' + (N.top || 'the most run')) : N.top ? '<span class="ed-tag">Most run</span>' : '',
    sel('data-ed="nat"', 'Nature for ' + m.d, N.order.map(n => `<option value="${E(n)}"${n === N.nat ? ' selected' : ''}>${E(n)} · ${natFx(n)}${N.pc.has(n) ? pc(N.pc.get(n)) : ''}${n === N.top ? ' ★' : ''}</option>`).join('')));
  const L = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  const pts = field('Stat points', (N.ownPts ? tag(true, 'ptsreset', 'Use the most common') : N.cs ? '<span class="ed-tag">Most common</span>' : '') + `<span class="ed-tot" data-ed-tot>${N.sum} of ${SP_TOTAL}</span>`,
    `<div class="ed-pts">${L.map((l, j) => `<label><span>${l}</span><input class="ed-num" type="number" min="0" max="32" step="1" inputmode="numeric" data-ed="pt" data-j="${j}" value="${N.v[j]}" aria-label="${l} stat points for ${E(m.d)}"></label>`).join('')}</div>
    <div class="ed-ptact"><button type="button" class="np-btn2" data-ed="ptsave"><span>Save Stat Points</span></button><span class="fine" data-ed-msg role="status"></span></div>`);
  const foot = `<div class="ed-foot"><button type="button" class="np-btn2" data-ed="lock" aria-pressed="${!!s.lock}"><span>${s.lock ? 'Locked' : 'Lock'}</span></button><p class="fine">${s.lock ? 'Suggestions never swap out a locked Pokémon.' : 'Lock it so Suggestions never swap it out.'}</p><button type="button" class="np-link ed-rm" data-ed="rm">Remove ${E(m.d)} from the team</button></div>`;
  // Nov 12 (today's features kept, Sim): the slot header (types, rating with its tier, share of teams) and the Weak / Resists fold
  // with the Ability's text (today's 07-render-slots.js: mult() over every type, the Ability counted)
  const P = m.p, R = monRating(P); let H = null; try { H = lairHead(P); } catch (e) {}
  const head = `<div class="tm-types ed-head">${(P.t || []).map(V2.typeChip).join('')}${R ? `<span class="sx-rate2"><b class="u">${R.n}</b> ${R.tier ? V2.esc(R.tier) + ' tier rating' : 'Rating'}</span>` : ''}${H ? `<span class="ed-use">${V2.esc(V2.shareTxt(H))} of teams</span>` : ''}</div>`;
  const wk = [], rs = []; for (const t of V2.TYPES) { let x = 1; try { x = mult(t, P.t, m.ability, true); } catch (e) {} if (x >= 2) wk.push([t, x >= 4 ? '4×' : '']); else if (x <= .5) rs.push([t, x === 0 ? '0×' : x <= .25 ? '¼×' : '']); }
  const chips = a => a.length ? a.map(([t, k]) => `<span class="ed-ty">${V2.typeChip(t)}${k ? `<b>${k}</b>` : ''}</span>`).join('') : '<span class="fine">None</span>';
  const abTxt = typeof ABIL === 'object' && ABIL[m.ability] ? String(ABIL[m.ability]).replace(/Pokemon/g, 'Pokémon') : '';
  const weak = `<details class="ed-weak"${V2.ed.weak ? ' open' : ''}><summary><span class="lbl">Weak to</span><span class="ed-tys">${chips(wk)}</span></summary>
    <div class="ed-weakin"><div class="ed-wrow"><span class="lbl">Resists</span><span class="ed-tys">${chips(rs)}</span></div>${abTxt ? `<p class="fine"><b>${V2.esc(m.ability)}:</b> ${V2.esc(abTxt)}</p>` : ''}</div></details>`;
  return `<div class="ed2"><div class="np-eyebrow">Edit Set</div><h2 class="u">${V2.nameHtml(m.d)}</h2>${head}${strip}<div class="ed-grid">${ab}${it}${mv}${na}${pts}</div>${weak}${foot}</div>`; };
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('ed-weak')) V2.ed.weak = e.target.open; }, true);
V2.openEdit = i => { if (i != null) V2.ed.i = i; if (!memberOf(S.slots[V2.ed.i] || {}, V2.ed.i)) { const f = members()[0]; if (!f) return; V2.ed.i = f.i; } V2.sheet(V2.editHtml(), {label: 'Edit Set'}); };
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
    V2.edDo(() => moveSlotSet(i, +t.dataset.j, name), old => `${name || 'Move removed'}${old && name ? ' replaces ' + old : ''}`); }
  else if (k === 'nat') V2.edDo(() => setNature(i, t.value), 'Nature saved'); });
document.addEventListener('input', e => { const t = e.target.closest && e.target.closest('.ed2 [data-ed="pt"]'); if (!t) return;
  const v = [...document.querySelectorAll('.ed2 [data-ed="pt"]')].map(x => +x.value || 0), tot = v.reduce((a, b) => a + b, 0), el = document.querySelector('[data-ed-tot]');
  if (el) { el.textContent = `${tot} of ${SP_TOTAL}`; el.classList.toggle('over', tot > SP_TOTAL); } });
document.addEventListener('click', e => { if (e.target.closest('[data-v2edit]')) { V2.openEdit(+e.target.closest('[data-v2edit]').dataset.v2edit); return; }
  const b = e.target.closest('.ed2 button[data-ed]'); if (!b) return; const i = V2.ed.i, k = b.dataset.ed, m = memberOf(S.slots[i], i);
  if (k === 'go') { V2.ed.i = +b.dataset.k; V2.edRefresh(); return; } if (!m) return;
  if (k === 'abreset') V2.edDo(() => resetAbility(i), 'Back to the most-used Ability');
  else if (k === 'itreset') V2.edDo(() => resetItem(i), 'Back to the usual item');
  else if (k === 'mvreset') V2.edDo(() => resetMoves(i), 'Back to the popular set');
  else if (k === 'natreset') V2.edDo(() => resetNature(i), 'Using the nature most players run');
  else if (k === 'ptsreset') V2.edDo(() => resetPoints(i), 'Using the most common stat points');
  else if (k === 'ptsave') { const v = [...document.querySelectorAll('.ed2 [data-ed="pt"]')].map(x => x.value === '' ? 0 : Number(x.value)), nat = (document.querySelector('.ed2 [data-ed="nat"]') || {}).value;
    const bad = pointsProblem(v, nat); if (bad) { const msg = document.querySelector('[data-ed-msg]'); if (msg) msg.textContent = bad; return; } V2.edDo(() => savePoints(i, nat, v), 'Stat points saved'); }
  else if (k === 'lock') V2.edDo(() => toggleLock(i), on => on ? `${m.d} locked: Suggestions keep it` : `${m.d} unlocked`);
  else if (k === 'rm') { clearSlot(i); render(); V2.edRefresh('[data-adq]'); /* group six */ toast(`Removed ${m.d}`, true); } });

// ---------- adding a Pokémon (R4, Nov 11): today's addMon into the first empty spot, one of each species (Species Clause) ----------
V2.addState = n => { const p = byName.get(n); if (!p) return 'none'; if (S.slots.some(x => { const q = byName.get(x.n); return q && q.b === p.b; })) return 'have'; return S.slots.findIndex(x => !byName.get(x.n)) < 0 ? 'full' : 'ok'; };
V2.addBtn = n => { const st = V2.addState(n), d = V2.esc(V2.disp(n));
  return st === 'ok' ? `<div class="row ms-add"><button type="button" class="np-btn" data-v2add="${V2.esc(n)}">Add to My Team</button></div>`
    : `<p class="fine ms-add${st === 'have' ? ' ms-on' : ''}">${st === 'have' ? 'On your team ✓' : st === 'full' ? 'Your team is full: remove one on My Team to add it.' : ''}</p>`; };
V2.addToTeam = n => { const p = byName.get(n), st = V2.addState(n); if (st !== 'ok') { if (p) toast(st === 'have' ? `${p.d} is already on your team` : 'Your team is full: remove one on My Team to add it'); return; } const i = S.slots.findIndex(x => !byName.get(x.n)); addMon(i, p);
  // Sim, Nov 12 (decision 15): from a sheet you stay where you are; the sheet shows "On your team ✓" (her approved sheet mock-up, today's behaviour)
  const sh = V2._sheet; render(); if (sh) { const el = document.querySelector('.np-sheet .ms-add'); if (el) el.outerHTML = V2.addBtn(n); } else if (!/^#team/.test(location.hash)) location.hash = '#team'; toast(p.d + ' added to your team'); };
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
  const add = i => `<div class="sx-slot sx-empty"><button type="button" class="sx-add" data-v2addto="${i}" aria-label="Add a Pokémon to slot ${i + 1}"><span class="sx-addart" aria-hidden="true"><i>+</i></span><b><span class="sx-pre">Add a</span> Pokémon</b><small>Spot ${i + 1}</small></button></div>`;
  const spots = `<div class="tm-six sx tm-e-six"><div class="sx-grps">${['Lead', 'Back', 'Bench'].map((g, j) => `<div class="sx-grp" role="group" aria-label="${g}"><p class="sx-gl u" aria-hidden="true">${g}</p><div class="sx-tiles">${add(j * 2)}${add(j * 2 + 1)}</div></div>`).join('')}</div></div>`;
  let top = []; try { top = lairRows().slice(0, 6).map(x => x.p); } catch (e) {}
  const win = top.length ? `<div class="tm-e-win"><h2 class="u">Or Start from a Winner</h2><p>Today's six highest-rated Pokémon. Tap one to build a team around it.</p><div class="tm-e-wg">${top.map(p => { const R = monRating(p), u = homePct(p);
    return `<button type="button" class="tm-e-w" data-hmaround="${V2.esc(p.n)}" aria-label="Build around ${V2.esc(p.d)}">${V2.mon(p.n, {iw: 96, bare: true, tag: true})}<b>${V2.tileName(p.d)}</b><small>${R ? `<span>${R.tier}\u00a0tier\u00a0${R.n}</span>` : ''}${u ? `<span>${u}% of teams</span>` : ''}</small></button>`; }).join('')}</div></div>` : '';
  return `<section class="tm-empty tm-empty2"><div class="tm-e-lead"><div class="np-eyebrow">My Team · 0 of 6 · No team yet</div><h1 class="u">Six spots, all yours.</h1><p>Add a Pokémon to start, or let us build a whole team around a favourite.</p>
    <div class="row"><a class="np-btn" href="#build">Build Me a Team</a><button type="button" class="np-btn2" data-v2search><span>Add a Pokémon</span></button><span class="tm-e-links"><button type="button" class="np-link" data-v2import>Import a Team</button>${nSaved ? `<button type="button" class="np-link tm-e-saved" data-v2saved>Open a Saved Team <small>${nSaved}</small></button>` : ''}</span></div></div>
    ${spots}${win}<div class="tm-ud"><div class="tm-ud-hd"><div class="np-eyebrow">Today's underdog</div><h2 class="u">${d}. <span>Somebody's favourite.</span></h2></div><div class="tm-ud-st">${V2.mon(n, {iw: 240, bare: true, ft: true})}</div><div class="tm-ud-bd">
    <p>Rarely picked in tournaments, but every Pokémon deserves its moment. Maybe it's yours?</p>
    <div class="row">${o.preview || V2.addState(n) === 'ok' ? `<button type="button" class="np-btn2" data-v2add="${V2.esc(n)}"><span>Add ${d} to My Team</span></button>` : ''}<button type="button" class="np-link" data-v2mon="${V2.esc(n)}">Info Sheet</button></div><p class="np-or"><a class="np-link" href="#build">Or build around your favourite Pokémon ›</a></p></div></div></section>`; };

// ---------- Share (R4, Nov 11): today's share images (44-share-images.js, proved pixel-identical with same-share.mjs) ----------
// Team Card / Team Poster / Team Sheet, light or dark; Save Image (the downloads capability, else a plain download) and Copy Team
// Link (today's team link). The new build draws its sprites from its own art folder.
V2.shUi = {kind: 'card', mode: null, url: null, blob: null, saved: null};
if (!window.__SPR) window.__SPR = new Proxy({}, {get: (t, id) => typeof id === 'string' && /^\d+$/.test(id) ? V2.art(id) : undefined});
V2.openShare = savedId => { const U = V2.shUi, t = savedId && S.teams.find(x => x.id === savedId); U.saved = t ? {name: t.name, ms: teamRating(t.slots).ms} : null;
  if (U.saved ? !U.saved.ms.length : !members().length) { if (U.saved) toast('This saved team has no Pokémon'); return; } if (!U.mode) U.mode = V2.theme() === 'night' ? 'dark' : 'light'; const SV = U.saved;
  V2.sheet(`<div class="sh2"><div class="np-eyebrow">Share</div><h2 class="u">${SV ? V2.esc(SV.name) + ': Team Poster' : 'Share Your Team'}</h2>
    <div class="sh2-ctl">${SV ? '' : V2.slide('shkind', [['card', 'Team Card', 'card'], ['poster', 'Team Poster', 'poster'], ['sheet', 'Team Sheet', 'list']], U.kind, 'What to share')}${V2.slide('shmode', [['light', 'Light'], ['dark', 'Dark']], U.mode, 'Image style')}</div>
    <div class="sh2-img" data-sh2img aria-live="polite"><p class="fine">Drawing your image…</p></div>
    <div class="sh2-acts"><button type="button" class="np-btn" data-sh2save disabled>Save Image</button>${SV ? '' : '<button type="button" class="np-btn2" data-copylink><span>Copy Team Link</span></button>'}<span class="fine" id="shareMsg" data-sh2msg role="status"></span></div>
    <p class="fine">On a phone you can also press and hold the image to save or share it.${SV ? '' : ' The team link opens this six on NastyPlot.'}</p></div>`, {label: SV ? 'Team poster' : 'Share'});
  V2.shDraw(); };
V2.shDraw = async () => { const U = V2.shUi, box = document.querySelector('[data-sh2img]'), sv = document.querySelector('[data-sh2save]'); if (!box) return; const SV = U.saved, ms = SV ? SV.ms : members(), was = CH.shareMode, kind = SV ? 'poster' : U.kind;
  if (sv) sv.disabled = true; CH.shareMode = U.mode; let c = null;
  try { c = SV ? await ARB.poster(ms, {name: SV.name}) : kind === 'poster' ? await ARB.poster(ms) : kind === 'sheet' ? await buildSheetImage(ms) : await ARB.card(); } catch (e) { c = null; } finally { CH.shareMode = was; }
  if (U.url) { try { URL.revokeObjectURL(U.url); } catch (e) {} U.url = null; }
  let blob = null; if (c) try { blob = await new Promise(r => c.toBlob(r, 'image/png')); } catch (e) {}
  U.blob = blob; U.url = blob ? URL.createObjectURL(blob) : null; if (!document.contains(box)) return;
  box.className = 'sh2-img' + (kind === 'card' ? '' : ' tall');
  box.innerHTML = U.url ? `<img src="${U.url}" alt="${SV ? V2.esc(SV.name) + ' as a NastyPlot team poster' : U.kind === 'sheet' ? 'Your team as a NastyPlot team sheet: every set, nature and stat' : U.kind === 'poster' ? 'Your team as a NastyPlot team poster' : 'Your team as a NastyPlot share card'}">` : '<p class="fine">Could not draw the image in this view.</p>';
  if (sv) sv.disabled = !blob; };
document.addEventListener('v2slide', e => { const k = e.detail.key; if (k !== 'shkind' && k !== 'shmode') return; V2.shUi[k === 'shkind' ? 'kind' : 'mode'] = e.detail.value; V2.shDraw(); });
document.addEventListener('click', async e => { if (e.target.closest('[data-v2share]')) { V2.openShare(); return; }
  if (!e.target.closest('[data-sh2save]')) return; const U = V2.shUi, msg = document.querySelector('[data-sh2msg]'); if (!U.blob) return;
  const name = U.saved ? U.saved.name.replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + ' poster - NastyPlot.png' : ((typeof teamTitleFor === 'function' ? teamTitleFor(members()) : '') || 'My team').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + (U.kind === 'poster' ? ' poster' : U.kind === 'sheet' ? ' sheet' : '') + ' - NastyPlot.png';
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
    <div class="row shd2-acts"><button type="button" class="np-btn" data-shdload>Open This Team</button><button type="button" class="np-link" data-v2close>Not now</button></div></div>`, {label: 'Shared team', small: true, focus: '[data-shdload]'});
  const b = document.querySelector('[data-shdload]'); if (b) b.addEventListener('click', () => V2.openShared(x)); };
// today's applyShared without its page switch: load (Undo kept), back to My Team, the same toast
V2.openShared = x => { loadShared(x); V2.closeSheet(true); V2.ui.sel = 0; if (!/^#team/.test(location.hash)) location.hash = '#team'; render(); toast(`Loaded ${x.n ? '“' + x.n + '”' : 'a shared team'} (${x.slots.length} Pokémon)`, true); };

// ---------- Import and Clear Team (R4, Nov 11): today's importPaste and clearTeam, same messages ----------
V2.openImport = () => {
  V2.sheet(`<div class="imp2"><div class="np-eyebrow">Import</div><h2 class="u">Paste a Team</h2>
    <p class="tm-sub">A Showdown team or a NastyPlot team link. Undo brings yours back.</p>
    <textarea class="imp2-in" data-impin rows="9" spellcheck="false" autocomplete="off" aria-label="Paste a Showdown team to import" placeholder="Paste here: a team from Showdown, Pokémon Zone, Pikalytics or Victory Road"></textarea>
    <p class="imp2-note" data-impnote role="status" aria-live="polite"></p>
    <div class="imp2-acts"><button type="button" class="np-btn" data-impgo>Replace My Team</button><p class="fine">Pokepaste links can't be opened from here; copy the team text instead.</p></div>
    ${typeof regNote === 'function' ? regNote('fine imp2-reg') : ''}</div>`, {label: 'Import a Team', small: true, focus: '[data-impin]'});
  const go = document.querySelector('[data-impgo]'); if (!go) return;
  go.addEventListener('click', () => { const r = importPaste((document.querySelector('[data-impin]') || {}).value);
    if (r.shared) { V2.openShared(r.shared); return; }
    if (r.error) { const n = document.querySelector('[data-impnote]'); if (n) n.textContent = r.error; return; }
    V2.closeSheet(true); V2.ui.sel = 0; render(); toast(r.msg, true); }); };
V2.clearTeam = () => { clearTeam(); V2.ui.sel = 0; render(); toast('Team cleared', true); };
document.addEventListener('click', e => { if (e.target.closest('[data-v2import]')) V2.openImport(); else if (e.target.closest('[data-v2clear]')) V2.clearTeam(); });
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
    : `<p class="tm-sub">Teams scoring like this win about ${W.e}% against today’s tournament teams. It adds up from:</p><ul class="why2-l">${row(W.base, 'from how its Pokémon, pairs and sets do in real tournament games')}${row(sg(W.mu), `for its matchups (beats or handles ${E(String(W.ready).replace('/', ' of '))} top threats). They count a little, since players often play around a shaky matchup`)}${W.hasSix ? row(sg(W.own), `from this exact six's own ${W.ownGames.toLocaleString('en-US')} real games, with its players' skill taken out`) : '<li><b>–</b><span>This exact six hasn’t been played in tournaments yet, so the rest is our estimate</span></li>'}<li class="why2-sum"><b>${W.s}</b><span>Strength Score</span></li></ul>`;
  return `<div class="why2${o.inline ? ' why2-in' : ''}">${head}${parts}${W.partial || o.inline ? '' : `<p class="fine">${E(CH.WHY_TEST)}</p>`}${W.sure ? `<p class="fine">How sure: <b>${E(W.sure.w)}</b>. ${E(W.sure.t[0].toUpperCase() + W.sure.t.slice(1))}.</p>` : ''}${W.illegal ? `<p class="tm-sub">Not legal yet: fix the items first.</p>${typeof regNote === 'function' ? regNote() : ''}` : ''}${o.inline ? '' : `<p class="fine">${E(CH.LETTERS)}</p><p class="fine"><a class="np-link" href="#method">How the Strength Score works</a></p>`}${o.inline ? '' : V2.howHtml()}</div>`; };
// Sim, Nov 12 (iPhone): "Why this score?" opened empty. The explanation needs the Strength Score; when it can't be worked out the
// page shows the older check-based number, so say which case it is and what the number is, never an empty sheet.
V2.whyNone = G => { const E = V2.esc, ms = members(), bases = ms.map(m => (byName.get(m.p.n) || {}).b || m.p.n), dup = bases.find((b, i) => bases.indexOf(b) !== i);
  const why = ms.length < 6 ? `Your team has ${ms.length} of 6 Pokémon. The Strength Score needs all six.`
    : dup ? `Your team has two forms of ${E(V2.disp(dup))}. Tournament rules allow only one of each Pokémon, so the Strength Score can't be worked out until one of them is swapped.`
    : typeof modelOK === 'function' && !modelOK() ? `Today's data is still loading. Try again in a moment.`
    : `The Strength Score couldn't be worked out for this team.`;
  return `<div class="why2"><div class="np-eyebrow">Strength Score</div><h2 class="u">Not Worked Out Yet</h2><p class="tm-sub">${why}</p>${G && G.v === 1 ? `<p class="fine">The ${E(String(G.s))} shown for now is the simpler check-based score: how its Pokémon do in real tournament games, minus points for any missing basic.</p>` : ''}</div>`; };
// other saved teams in one tap (today's "Switch team"): opening one is Saved Teams' Open, with Undo
V2.switchHtml = () => { const ts = S.teams.filter(t => t && t.id !== S.loadedId && t.format !== 'singles' && Array.isArray(t.slots) && t.slots.some(x => x && x.n)).slice(0, 8);
  return `<div class="sw2"><div class="np-eyebrow">My Team</div><h2 class="u">Switch Team</h2><ul>${ts.map(t => `<li><button type="button" class="sw2-t" data-svact="open" data-id="${V2.esc(t.id)}"><span class="sw2-m">${t.slots.filter(x => x && byName.get(x.n)).slice(0, 6).map(x => `<img src="${V2.art(SPRITE_ID[x.n])}" alt="" loading="lazy">`).join('')}</span><b>${V2.esc(t.name || 'Saved team')}</b></button></li>`).join('')}</ul></div>`; };
document.addEventListener('click', e => { if (e.target.closest('[data-v2why]')) V2.sheet(V2.whyHtml(), {label: 'Why This Score?', small: true}); else if (e.target.closest('[data-v2switch]')) V2.sheet(V2.switchHtml(), {label: 'Switch team', small: true, focus: '.sw2-t'}); });

// Team Checks (Sim, Nov 11): checks that pass fold into one line; only the ones that fail show in full (a note says it's a note)
V2.ckBody = (D, ck) => { const fb = D.basics.filter(x => !x.ok), fn = D.notes.filter(x => !x.ok), pb = D.basics.filter(x => x.ok), pn = D.notes.filter(x => x.ok);
  const nb = D.basics.length, nn = D.notes.length, allOk = !fb.length && !fn.length;
  const fails = fb.length || fn.length ? `<ul class="tm-ck">${fb.map(ck).join('')}${fn.map(x => ck(x).replace('<span>', '<span><em class="tm-cknote">Note</em> ')).join('')}</ul>` : '';
  const passed = pb.length + pn.length, line = allOk ? `All ${nb} basics${nn ? ` and all ${nn} notes` : ''} pass` : `${passed} more pass`;
  return `${fails}${passed ? `<details class="tm-ckok"><summary><b aria-hidden="true">✓</b>${line}</summary>${pb.length ? `<ul class="tm-ck">${pb.map(ck).join('')}</ul>` : ''}${pn.length ? `<h3 class="tm-h3">${CK_TXT.notes}</h3><p class="fine">${CK_TXT.notesWhy}</p><ul class="tm-ck">${pn.map(ck).join('')}</ul>` : ''}<p class="fine">${CK_TXT.intro}</p></details>` : ''}`; };

// the More menu (Sim, Nov 11): every other My Team action, one per row; Clear Team sits last, apart
V2.moreHtml = () => { const n = S.box.length, ms = members();
  const row = (attrs, label, sub) => `<li><button type="button" class="tm-mi" ${attrs}><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</button></li>`;
  return `<div class="tm-moremenu"><div class="np-eyebrow">My Team</div><h2 class="u">More</h2><ul>
    ${row('data-v2sheetopen', 'Team Sheet', ms.length ? `${ms.length} sets on one page` : 'Every set on one page')}${ms.length ? row('data-v2copy', 'Copy for Showdown', 'The team as text, ready to paste') : ''}
    ${ms.length ? row('data-v2export', 'Export', 'The Showdown text to read, select or copy') : ''}${row('data-v2import', 'Import', 'Paste a team or a team link')}${ms.length ? row('data-cxgo2="cur|"', 'Compare', 'Side by side with another team') : ''}
    <li><a class="tm-mi" href="#box"><span>My Box</span><small>${n} Pokémon you own</small></a></li></ul>
    ${ms.length ? `<ul class="tm-mdanger">${row('data-v2clear', 'Clear Team', 'Empties all six spots. Undo brings them back')}</ul>` : ''}</div>`; };
document.addEventListener('click', e => { if (e.target.closest('[data-v2more]')) { V2.sheet(V2.moreHtml(), {label: 'More', small: true, focus: '.tm-mi'}); return; }
  // actions that don't open their own sheet close the menu (the others replace it)
  const t = e.target.closest('.tm-moremenu [data-v2copy],.tm-moremenu [data-v2clear],.tm-moremenu a[href],.tm-moremenu [data-cxgo2]'); if (t) setTimeout(() => { if (document.querySelector('.np-sheet .tm-moremenu')) V2.closeSheet(true); }, 0); });

// ---------- drawing ----------
V2.ui = V2.ui || {sel: 0, mu: 'top'};
V2.LV = ['No answer', 'Shaky', 'Handles it', 'Beats it']; // the four calc levels (word list)
V2.pages.team = {place: 'team', draw() {
  const D = V2.teamData();
  if (D.empty) return V2.emptyHtml();
  const {ms, G} = D, sel = ms[Math.min(V2.ui.sel, ms.length - 1)], s = G ? Math.round(G.s) : null;
  const word = G ? CH.wordOf(G.s) + (G.partial ? ' so far' : '') : '';
  const rank = G && !G.partial && G.rk != null ? CH.rankShort(G.rk) + ' of tournament teams' : G && G.partial ? `${ms.length} of 6 picked` : '';
  // today's hero: the win line, and a note when few real games back this mix ("How sure" itself is in Why this score?)
  const su = G && G.st && G.st.su, low = su && su.w === 'Low', win = G && G.v === 2 && !G.partial && G.e != null ? `Teams scoring like this win about ${Math.round(G.e)}% against today’s tournament teams` : '';
  const others = S.teams.filter(t => t && t.id !== S.loadedId && t.format !== 'singles' && Array.isArray(t.slots) && t.slots.some(x => x && x.n)).length;
  const L = legalOf(ms), title = D.saved || (ms.length ? teamTitleFor(ms) : '');
  // today's header line "My team: 6 of 6, Sun team": the count and the weather or terrain the six sets (shared wxKeyOf / wxName)
  let wx = ''; try { const k = ms.length ? wxKeyOf(ms) : null; if (k) wx = wxName(k); } catch (e) {}
  // Legal mark (mock-up: in the jump bar); narrower windows show it in the hero's links row instead, where it has room
  const legalMark = ms.length ? `<span class="tm-legal${L.illegal ? ' bad' : ''}" title="Based on our reading of the ${V2.esc(REG_NAME)} rules. Check the official rules before an event."><i aria-hidden="true"></i>${L.illegal ? 'Not legal yet' : 'Legal for ' + V2.esc(REG_NAME)}</span>` : '';
  const lockup = `<div class="tm-lock"><div class="np-eyebrow tm-eb"><span>My Team · ${ms.length} of 6${wx ? ` · ${V2.esc(wx)}` : ''}</span></div>${title ? `<h1 class="tm-name">${V2.esc(title).replace(/(Mega \S+) ([XYZ])\b/g, '$1\u00a0$2')}</h1>` : ''}${/\(sample\)\s*$/i.test(title || '') ? '<p class="fine tm-sample">This is a sample team, here to show how NastyPlot works. <span class="tm-sample-acts"><a class="np-link" href="#build">Build Your Own</a> · <button type="button" class="np-link" data-v2import>Import a Team</button></span></p>' : ''}${s == null ? `<p class="tm-wait">${ms.length} of 6 picked. The Strength Score shows once the team can be rated.</p>`
    : `<div class="np-score" style="--band:var(--band-${({A: "top", B: "ready", C: "solid", D: "work", F: "miss"})[G.band] || "solid"})"><b>${s}</b><div class="w"><span>${V2.esc(word)}</span><small>Strength Score</small></div></div>`}</div><div class="tm-info">${s == null ? '' : `${win ? `<p class="tm-line">${win}</p>` : ''}<p class="tm-rank">${V2.esc(rank)}${V2.asOf() ? `<span class="tm-asof"> · ${V2.esc(V2.asOf().replace(/ \(\d+ days? old\)/, ''))}</span>` : ''}</p>${low ? '<p class="fine tm-low">Few real games back this mix yet, so it\'s a best guess</p>' : ''}<div class="tm-links"><button type="button" class="np-link" data-v2why aria-haspopup="dialog">Why This Score?</button>${others ? `<button type="button" class="np-link" data-v2switch aria-haspopup="dialog">Switch Team <small>${others} saved</small></button>` : ''}${legalMark.replace('class="tm-legal', 'class="tm-legal tm-legal-h')}</div>`}${goneNote(S.slots) ? `<p class="fine tm-gone" role="status">${goneNote(S.slots)}</p>` : ''}</div>`;
  // Sim, Nov 11: the one main action plus two others; the rest in one More menu (Clear Team last, apart, with Undo)
  // A11 proposal (Sim's fix plan): the main button only when there is something to save. A saved team that hasn't changed shows a
  // quiet "Saved ✓" (same sheet behind it, so a copy can still be saved under a new name)
  const lt = S.loadedId && S.teams.find(t => t.id === S.loadedId), same = lt && JSON.stringify(lt.slots) === JSON.stringify(S.slots);
  const acts = `<div class="tm-acts">${same ? '<button type="button" class="np-btn2 tm-saved" data-v2save><span>Saved <b aria-hidden="true">✓</b></span></button>' : `<button type="button" class="np-btn" data-v2save>${lt ? 'Update Saved Team' : 'Save Team'}</button>`}<button type="button" class="np-btn2" data-v2share><span>Share</span></button><button type="button" class="np-btn2 tm-svl" data-v2saved><span>Saved Teams <small>${S.teams.filter(t => t.format !== 'singles').length}</small></span></button><button type="button" class="np-btn2 tm-svl tm-more" data-v2more aria-haspopup="dialog"><span>More <b aria-hidden="true">⋯</b></span></button></div>`;
  const nm = D.mu.fav + D.mu.even + D.mu.unf;
  const jump = `<nav class="np-tabs tm-jump" aria-label="On this page"><a href="#team" data-tmjump="tm-set" aria-selected="true">Set</a><a href="#team" data-tmjump="tm-mu">Matchups</a><a href="#team" data-tmjump="tm-sg">Suggestions</a><a href="#team" data-tmjump="tm-ck">Team Checks</a>${legalMark}<button type="button" class="tm-tsbtn" data-v2sheetopen aria-label="Team Sheet">Team Sheet <span aria-hidden="true">↗</span></button></nav>`;
  // 1. Set: the selected Pokémon on its tilted panel, with its whole set (group six: six.js)
  const setSec = V2.setSecHtml(D, sel);
  // 2. Matchups: real-game verdicts lead, the calc reading underneath (Sim, Nov 10); views and threat sheet in pages/matchups.js (hook)
  const muSec = V2.muSec ? V2.muSec(D) : '';
  // 3. Suggestions: drawn by pages/sugs.js (R4 sugs hook)
  const sgSec = V2.sgSec(D);
  // 4. Team checks: the 4 basics count, the 3 notes don't (Sim, Nov 9)
  // A2 proposal (Sim's fix plan, Nov 12): the checks are listed ONCE, with the detail that used to sit in a second list inside
  // "Problems and Team Checks" (what the team has or misses, and how often winners have it); the threats "?" sits on its check
  const hand = CH.hand(D.RD), ck = x => `<li class="${x.ok ? 'ok' : ''}"><b aria-hidden="true">${x.ok ? '✓' : '–'}</b><span>${V2.esc(V2.wl(x.label))}${/^Ready for/.test(x.label) ? V2.tip('readiness') : ''}${(x.ok ? x.have : x.miss) ? `<small>${V2.esc(V2.undot(V2.wl(x.ok ? x.have : x.miss, hand)))}</small>` : ''}${x.pro && !x.note ? `<small>${V2.undotHtml(x.pro)}</small>` : ''}</span></li>`; // notes: their 'why' is said once, above them
  const ckSec = `<section class="tm-sec tm-cks" id="tm-ck"><h2 class="u">Team Checks</h2><p class="tm-sub">The 4 basics count toward the score; the notes are advice.${V2.tip('checklist')}</p>${V2.ckBody(D, ck)}${V2.fixFold(D) /* Problems and Team Checks: pages/sugs.js (R4 sugs hook) */}</section>`;
  return `<section class="tm-hero">${lockup}${V2.sixHtml(D, sel) /* group six: tiles in plan order + game plan line (six.js) */}${acts}</section>${jump}<div class="tm-work"><div class="tm-c1">${setSec}${sgSec}</div><div class="tm-c2">${muSec}${ckSec}${V2.ygSec ? V2.ygSec(ms) : ''}</div></div>`;
},
after() {
  /* Apply on a suggestion: pages/sugs.js (R4 sugs hook) */
  // a redraw now keeps unchanged elements (A5), so bind each element once (a second listener would fire twice)
  document.querySelectorAll('[data-tmsel]').forEach(b => { if (b._v2b) return; b._v2b = 1; b.addEventListener('click', () => { V2.ui.sel = +b.dataset.tmsel; V2.redraw(); }); });
  document.querySelectorAll('[data-tmjump]').forEach(a => !a._v2b && (a._v2b = 1) && a.addEventListener('click', e => { e.preventDefault(); V2._jumpPick = a.dataset.tmjump; requestAnimationFrame(V2.jumpSync); /* side-by-side sections: the one you tapped is marked, even when no scroll is needed (A7) */ const t = document.getElementById(a.dataset.tmjump); if (t) { t.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); const h = t.querySelector('h2'); if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({preventScroll: true}); } } })); /* focus moves to the section heading, so Tab and screen readers carry on from there (audit TEAM-07) */
  V2.jumpSync(); // A7 proposal: the jump bar marks the section you are reading
  if (V2.muAfter) V2.muAfter(); // Matchups hook (pages/matchups.js): keeps an open threat sheet in step with the page
}};
// A7 proposal (Sim's fix plan: "a marker that is always wrong is worse than none"): the jump bar's underline follows the scroll.
// The marked section is the last one whose top has passed just under the bar (ties, as in the desktop columns, go to the one
// earlier in the bar, unless you tapped the other one); at the very end of the page the last one is marked.
V2.jumpSync = () => { const nav = document.querySelector('.tm-jump'); if (!nav) return; const as = [...nav.querySelectorAll('[data-tmjump]')]; if (!as.length) return;
  // (Sim approved A7, Claude's recommendation for wide screens): from 700px the sections sit side by side, so "where you are" has
  // no single answer; there no section is marked (no underline) rather than a wrong one
  if (matchMedia('(min-width:700px)').matches) { for (const a of as) if (a.getAttribute('aria-selected') !== 'false') a.setAttribute('aria-selected', 'false'); return; }
  const line = nav.getBoundingClientRect().bottom + 24; let cur = as[0], best = -Infinity;
  for (const a of as) { const s = document.getElementById(a.dataset.tmjump); if (!s) continue; const t = s.getBoundingClientRect().top; if (t <= line && (t > best + 1 || (Math.abs(t - best) <= 1 && a.dataset.tmjump === V2._jumpPick))) { best = Math.max(best, t); cur = a; } }
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) cur = as[as.length - 1];
  for (const a of as) { const on = a === cur; if ((a.getAttribute('aria-selected') === 'true') !== on) a.setAttribute('aria-selected', on ? 'true' : 'false'); } };
let jumpRaf = 0; addEventListener('scroll', () => { if (jumpRaf) return; jumpRaf = requestAnimationFrame(() => { jumpRaf = 0; if (V2.route() === 'team') V2.jumpSync(); }); }, {passive: true});
addEventListener('resize', () => { if (V2.route() === 'team') V2.jumpSync(); });
// a look at the empty My Team without emptying anyone's team (the redesign preview links here; it changes nothing)
V2.pages['team-empty'] = {place: 'team', draw: () => V2.emptyHtml({preview: true})};

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
  'Archetypes: each team is read by its speed mode (Tailwind, Trick Room, both or none), its field (sun, rain, sand, snow, and Grassy, Psychic, Electric or Misty Terrain) and control plans like Perish Trap. Battle mode compares both archetypes and weighs them when it picks your 4 and your lead.',
  'Roster, abilities, moves and learnsets come from Pokémon Showdown\'s Champions data.'];
V2.howHtml = () => `<details class="ed-weak hs2"${V2.hsOpen ? ' open' : ''}><summary><span class="lbl">How Scoring Works</span><span></span></summary><div class="hs2-in">${V2.HOW_SCORE.map((t, i) => { const k = t.search(/\. [A-Z(]/), first = k > 0 ? t.slice(0, k + 1) : t, rest = k > 0 ? t.slice(k + 1) : '';
  return `<p>${V2.esc(first)}${rest ? `<span class="hs2-more" hidden>${V2.esc(rest)}</span> <button type="button" class="np-link hs2-mb" data-hsmore aria-expanded="false">More</button>` : ''}</p>`; }).join('')}</div></details>`;
// open / closed is remembered on this device, under today's key (cc2.chf.rhow; audit X-07)
try { V2.hsOpen = !!LS.get('cc2.chf.rhow', false); } catch (e) { V2.hsOpen = false; }
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('hs2')) { V2.hsOpen = e.target.open; try { LS.set('cc2.chf.rhow', V2.hsOpen); } catch (er) {} } }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-hsmore]'); if (!b) return; const s = b.parentElement.querySelector('.hs2-more'); if (!s) return; const open = s.hidden; s.hidden = !open; b.textContent = open ? 'Less' : 'More'; b.setAttribute('aria-expanded', String(open)); });
