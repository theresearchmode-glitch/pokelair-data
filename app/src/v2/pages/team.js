// ---------- My Team (R4, Nov 11) ----------
// Everything the page shows is worked out by today's shared logic; this file only gathers it (teamData) and draws it.
// Approved design: docs/rebuild/mocks/myteam.tpl.html (NastyPlot Full Redesign artifact). Word list: CLAUDE.md.

// the data, no HTML: one call per draw
V2.teamData = () => {
  const ms = members(); if (!ms.length) return {empty: true};
  const useA = true, CK = proChecks(ms, useA), RD = prepOf(ms), G = RD ? CH.gradeOf(RD, CK, ms) : null;
  // the lead pair against the meta's top six (Battle mode's planner, the same one today's My Team uses)
  const four = ms.length >= 4 ? CH.four(ms) : null;
  const role = n => !four ? '' : four.lead.includes(n) ? 'Lead' : four.back.includes(n) ? 'Back' : 'Bench';
  // matchups: the 30 top threats, each with the real-games verdict (if the model has one) and the damage-calc level
  const rows = RD ? RD.rows.map(r => ({t: r.t, w: r.t.w, level: r.level, real: CH.realVs(r.t.n, ms)})) : [];
  const top = rows.slice().sort((a, b) => b.w - a.w).slice(0, 10);
  const cnt = w => rows.filter(r => r.real && r.real.w === w).length;
  const calc = [0, 1, 2, 3].map(l => rows.filter(r => r.level === l).length);
  const basics = CK ? CK.items.filter(x => !x.note && !x.skip) : [], notes = CK ? CK.items.filter(x => x.note) : [];
  const sug = V2.sugData(ms, RD);
  const lo = S.teams.find(t => t.id === S.loadedId);
  return {ms, G, RD, CK, four, role, rows, top, sug, saved: lo ? lo.name : '', mu: {fav: cnt('Favoured'), even: cnt('Even match'), unf: cnt('Unfavoured'), any: rows.some(r => r.real)},
    calc: {beats: calc[3], handles: calc[2], shaky: calc[1], none: calc[0]}, basics, notes, full: ms.length === 6};
};

// ---------- suggestions: today's planner (planFixesG), run in small slices between frames like today's page ----------
V2.plan = {key: null, plans: null, job: null};
V2.planKey = () => JSON.stringify([S.slots, ui.pool, typeof metaVersion === 'number' ? metaVersion : 0, ui.swKey || '']);
V2.planStart = ms => { const key = V2.planKey(); if (V2.plan.key === key || (V2.plan.job && V2.plan.job.key === key)) return;
  const job = {key, g: planFixesG(ms, suggestPool(), true)}; V2.plan.job = job;
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
V2.openTeamSheet = () => { const ms = members(); if (!ms.length) return;
  const card = m => { const D = sheetData(m), P = m.p;
    const nat = D.nat ? `${V2.esc(D.nat)}${D.up && D.dn && D.up !== D.dn ? ` <span class="ts2-nb"><b class="up">+${D.up}</b> <b class="dn">−${D.dn}</b></span>` : ''}` : 'Nature unknown';
    return `<article class="ts2-card"><header>${V2.mon(P.n, {iw: 72, bare: true})}<div><h3 class="u">${V2.nameHtml(m.d)}</h3><p><span><em>Item</em> ${V2.esc(m.heldItem || m.item || 'No item')}</span><span><em>Ability</em> ${V2.esc(m.ability || '—')}</span></p></div></header>
      <ul class="ts2-mv">${[0, 1, 2, 3].map(j => { const x = m.moves[j]; return x ? `<li class="np-type" style="--tc:var(--ty-${V2.TYPES.includes(x.type) ? x.type : 'Normal'})">${V2.esc(x.name)}</li>` : '<li class="none">No move</li>'; }).join('')}</ul>
      <p class="ts2-nat"><b>${nat}</b><span>${V2.esc(String(D.src || '').replace(/<[^>]*>/g, ''))}</span></p>
      <div class="ts2-st" role="group" aria-label="Stats at level 50, with stat points below">${D.stats.map(x => `<div class="${x.mark}"><span>${x.S}${x.mark === 'up' ? '<i aria-label="raised by nature">+</i>' : x.mark === 'dn' ? '<i aria-label="lowered by nature">−</i>' : ''}</span><b>${x.val == null ? '—' : x.val}</b><small>${x.pts == null ? '' : x.pts}</small></div>`).join('')}</div></article>`; };
  V2.sheet(`<div class="ts2"><div class="np-eyebrow">Level 50 · bring 6, pick 4</div><h2 class="u">Team Sheet</h2>
    <div class="ts2-acts"><button type="button" class="np-btn" data-v2copy><span>Copy for Showdown</span></button><p class="fine">Big number: the stat at level 50 · small number: stat points (0–32) · <b class="up">+</b> / <b class="dn">−</b> nature</p></div>
    <div class="ts2-grid">${ms.map(card).join('')}</div></div>`, {label: 'Team Sheet'}); };
// Copy for Showdown: today's export (exportPaste) and clipboard helper (copyText)
V2.copyTeam = async () => { toast((await copyText(exportPaste())) ? 'Team copied for Showdown' : 'Copy failed. Try again.'); };
document.addEventListener('click', e => { if (e.target.closest('[data-v2copy]')) V2.copyTeam(); if (e.target.closest('[data-v2sheetopen]')) V2.openTeamSheet(); });

// ---------- Save Team (R4, Nov 11): a small sheet; the save itself is today's saveTeamAs (30-saved-data.js) ----------
// Same choices as today's save panel: update the open saved team or save as new, up to 10 teams; Enter does the main action.
V2.openSave = () => { if (!members().length) return; const lo = S.teams.find(t => t.id === S.loadedId), full = S.teams.length >= 10, n = S.teams.length;
  const sh = V2.sheet(`<div class="sv2"><h2 class="u">Save Team</h2>
    <p class="tm-sub">${lo ? `Open now: <b>${V2.esc(lo.name)}</b>. Update it, or save this six as a new team.` : 'Give this six a name.'} <span class="sv2-n">${n} of 10 saved</span></p>
    <form data-v2saveform><label class="np-field"><input data-v2savename maxlength="40" placeholder="Team name, e.g. Rain Archaludon" aria-label="Team name" autocomplete="off" value="${V2.esc(lo ? lo.name : '')}"></label>
    <div class="sv2-acts">${lo ? `<button type="submit" class="np-btn">Update Team</button><button type="button" class="np-btn2" data-v2savenew${full ? ' disabled' : ''}><span>Save as New</span></button>`
      : `<button type="submit" class="np-btn"${full ? ' disabled' : ''}>Save Team</button>`}<button type="button" class="np-link" data-v2close>Cancel</button></div></form>
    ${full ? '<p class="fine sv2-full">You have 10 saved teams. Update the open team, or delete one in Saved Teams to save a new one.</p>' : ''}</div>`, {label: 'Save Team', small: true, focus: '[data-v2savename]'});
  const box = document.querySelector('[data-v2saveform]'), inp = box && box.querySelector('[data-v2savename]'); if (!box) return; if (inp) inp.select();
  const go = over => { const t = saveTeamAs(inp.value, over); if (!t) return; V2.closeSheet(); render(); toast(`Saved "${t.name}"`); };
  box.addEventListener('submit', e => { e.preventDefault(); go(!!lo); });
  const nw = box.querySelector('[data-v2savenew]'); if (nw) nw.addEventListener('click', () => go(false));
  return sh; };
document.addEventListener('click', e => { if (e.target.closest('[data-v2save]')) V2.openSave(); });

// ---------- Saved Teams (R4, Nov 11): a sheet over My Team; rows and their scores are today's savedRows (30-saved-data.js) ----------
// Open, Copy for Showdown, Rename and Delete (with a confirm) as today. Sort: Newest / Name / Matchups (today's "Readiness" sort).
// Still to come on the new build: Compare (with the Compare page) and "Your games" with this six (with My Record).
V2.svUi = {sort: 'recent', ren: null, del: null};
V2.savedHtml = () => { const U = V2.svUi, rows = savedRows(U.sort), n = rows.length;
  const card = ({t, r, ck, G}) => { const on = t.id === S.loadedId, id = V2.esc(t.id), nm = V2.esc(t.name), s = G ? Math.round(G.s) : null;
    const six = r.ms.map(m => `<li>${V2.mon(m.p.n, {iw: 56})}</li>`).join('') + Array.from({length: Math.max(0, 6 - r.ms.length)}, () => '<li class="svt2-empty"><i></i><span>Empty</span></li>').join('');
    const head = U.ren === t.id ? `<form class="svt2-ren" data-svrenform="${id}"><label class="np-field"><input data-svname maxlength="40" value="${nm}" aria-label="Team name" autocomplete="off"></label><button type="submit" class="np-btn2"><span>Save</span></button><button type="button" class="np-link" data-svact="renx">Cancel</button></form>`
      : `<header><h3 class="u">${nm}</h3>${on ? '<span class="np-chip">Open now</span>' : ''}</header>`;
    const score = s != null ? `<div class="np-score sm" style="--band:var(--band-${({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid'})"><b>${s}</b><div class="w"><span>${V2.esc(CH.wordOf(G.s))}</span><small>Strength Score</small></div></div>`
      : `<p class="svt2-part">${r.ms.length < 6 ? `${r.ms.length} of 6 picked` : 'Not rated yet'}</p>`;
    const acts = U.del === t.id ? `<div class="svt2-del" role="group" aria-label="Delete ${nm}?"><span>Delete ${nm}?</span><button type="button" class="np-btn2" data-svact="delok" data-id="${id}"><span>Delete</span></button><button type="button" class="np-link" data-svact="delx">Keep</button></div>`
      : `<div class="svt2-acts"><button type="button" class="np-btn2" data-svact="open" data-id="${id}" aria-label="Open ${nm}"><span>Open</span></button><button type="button" class="np-link" data-svact="copy" data-id="${id}" aria-label="Copy ${nm} for Showdown">Copy for Showdown</button><button type="button" class="np-link" data-svact="ren" data-id="${id}" aria-label="Rename ${nm}">Rename</button><button type="button" class="np-link" data-svact="del" data-id="${id}" aria-label="Delete ${nm}">Delete</button></div>`;
    const gone = goneNote(t.slots);
    return `<article class="svt2-card${on ? ' on' : ''}">${head}<ul class="svt2-six" aria-label="${V2.esc(r.ms.map(m => m.d).join(', ') || 'Empty')}">${six}</ul><p class="fine svt2-gone">${gone}</p><div class="svt2-foot">${score}${ck ? `<span class="fine">${ck.pass}/${ck.n} checks</span>` : ''}</div>${acts}</article>`; };
  // an odd count leaves a hole in the 2-across grid: the free spot invites saving the six on My Team (Sim: no half-filled rows)
  const mine = members().length, free = `<article class="svt2-card svt2-free"><h3 class="u">${10 - n} spots free</h3><p class="tm-sub">${mine ? 'Keep the six on My Team as a saved team.' : 'Build a team on My Team, then save it here.'}</p>
    <div class="svt2-acts">${mine ? '<button type="button" class="np-btn2" data-svact="new"><span>Save This Six</span></button>' : '<a class="np-btn2" href="#build"><span>Build me a team</span></a>'}</div></article>`;
  return `<div class="svt2"><div class="np-eyebrow">${n} of 10 saved</div><h2 class="u">Saved Teams</h2>
    ${n ? `<div class="svt2-sort">${V2.slide('svsort', [['recent', 'Newest', 'clock'], ['name', 'Name'], ['rating', 'Matchups', 'gauge']], U.sort, 'Sort saved teams')}</div><div class="svt2-grid" aria-live="polite">${rows.map(card).join('')}${n % 2 && n < 10 ? free : ''}</div>`
      : `<p class="tm-sub">No saved teams yet. Tap Save Team on My Team to keep this six.</p>`}</div>`; };
V2.openSavedTeams = () => { V2.svUi.ren = V2.svUi.del = null; V2.sheet(V2.savedHtml(), {label: 'Saved Teams', fit: true}); };
// redraw the sheet in place (the page under it redraws through render()); focus goes to `focus` or the sheet itself
V2.svRefresh = focus => { const el = document.querySelector('.svt2'); if (!el) return; el.outerHTML = V2.savedHtml(); const f = focus && document.querySelector(focus); (f || document.querySelector('.np-sheet')).focus(); if (f && f.select) f.select(); };
document.addEventListener('click', e => { if (e.target.closest('[data-v2saved]')) { V2.openSavedTeams(); return; }
  const b = e.target.closest('[data-svact]'); if (!b) return; const U = V2.svUi, id = b.dataset.id, a = b.dataset.svact;
  if (a === 'open') { const t = openSaved(id); if (!t) return; V2.closeSheet(true); V2.ui.sel = 0; if (location.hash !== '#team') location.hash = '#team'; render(); scrollTo(0, 0); toast(`Opened "${t.name}"`, true); }
  else if (a === 'copy') { const t = S.teams.find(x => x.id === id); if (t) copyText(slotsPaste(t.slots)).then(ok => toast(ok ? 'Team copied for Showdown' : 'Copy failed. Try again.')); }
  else if (a === 'ren') { U.ren = id; U.del = null; V2.svRefresh('[data-svname]'); }
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
V2.editHtml = () => { const i = V2.ed.i, s = S.slots[i], m = s && memberOf(s, i); if (!m) return '<div class="ed2"><p class="tm-sub">This spot is empty.</p></div>';
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
    `<div class="ed-mvs">${M.sm.names.map((nm, j) => { const t = nm && mvByName.get(nm); return `<label class="np-field ed-sel ed-mv" style="--tc:var(--ty-${t && V2.TYPES.includes(t.type) ? t.type : 'Normal'})"><select data-ed="mv" data-j="${j}" aria-label="Move ${j + 1} for ${E(m.d)}"><option value=""${nm ? '' : ' selected'}>(no move)</option>${M.pm.length ? `<optgroup label="Popular">${M.pm.map(x => mo(x, nm)).join('')}</optgroup>` : ''}<optgroup label="All moves it learns">${M.rest.map(x => mo(x, nm)).join('')}</optgroup></select></label>`; }).join('')}</div>`, ' wide');
  // Nature and stat points
  const N = natureChoices(s, p);
  const na = field('Nature', N.ownNat ? tag(true, 'natreset', 'Use ' + (N.top || 'the most run')) : N.top ? '<span class="ed-tag">Most run</span>' : '',
    sel('data-ed="nat"', 'Nature for ' + m.d, N.order.map(n => `<option value="${E(n)}"${n === N.nat ? ' selected' : ''}>${E(n)} · ${natFx(n)}${N.pc.has(n) ? pc(N.pc.get(n)) : ''}${n === N.top ? ' ★' : ''}</option>`).join('')));
  const L = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  const pts = field('Stat points', (N.ownPts ? tag(true, 'ptsreset', 'Use the most common') : N.cs ? '<span class="ed-tag">Most common</span>' : '') + `<span class="ed-tot" data-ed-tot>${N.sum} of ${SP_TOTAL}</span>`,
    `<div class="ed-pts">${L.map((l, j) => `<label><span>${l}</span><input class="ed-num" type="number" min="0" max="32" step="1" inputmode="numeric" data-ed="pt" data-j="${j}" value="${N.v[j]}" aria-label="${l} stat points for ${E(m.d)}"></label>`).join('')}</div>
    <div class="ed-ptact"><button type="button" class="np-btn2" data-ed="ptsave"><span>Save Stat Points</span></button><span class="fine" data-ed-msg role="status"></span></div>`);
  const foot = `<div class="ed-foot"><button type="button" class="np-btn2" data-ed="lock" aria-pressed="${!!s.lock}"><span>${s.lock ? 'Locked' : 'Lock'}</span></button><p class="fine">${s.lock ? 'Suggestions never swap out a locked Pokémon.' : 'Lock it so Suggestions never swap it out.'}</p><button type="button" class="np-link ed-rm" data-ed="rm">Remove ${E(m.d)}</button></div>`;
  return `<div class="ed2"><div class="np-eyebrow">Edit Set</div><h2 class="u">${V2.nameHtml(m.d)}</h2>${strip}<div class="ed-grid">${ab}${it}${mv}${na}${pts}</div>${foot}</div>`; };
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
  else if (k === 'rm') { clearSlot(i); V2.closeSheet(); render(); toast(`Removed ${m.d}`, true); } });

// ---------- adding a Pokémon (R4, Nov 11): today's addMon into the first empty spot, one of each species (Species Clause) ----------
V2.addState = n => { const p = byName.get(n); if (!p) return 'none'; if (S.slots.some(x => { const q = byName.get(x.n); return q && q.b === p.b; })) return 'have'; return S.slots.findIndex(x => !byName.get(x.n)) < 0 ? 'full' : 'ok'; };
V2.addBtn = n => { const st = V2.addState(n), d = V2.esc(V2.disp(n));
  return st === 'ok' ? `<div class="row ms-add"><button type="button" class="np-btn" data-v2add="${V2.esc(n)}">Add to My Team</button></div>`
    : `<p class="fine ms-add">${st === 'have' ? `${d} is already on your team.` : st === 'full' ? 'Your team is full: remove one on My Team to add it.' : ''}</p>`; };
V2.addToTeam = n => { const p = byName.get(n), st = V2.addState(n); if (st !== 'ok') { if (p) toast(st === 'have' ? `${p.d} is already on your team` : 'Your team is full: remove one on My Team to add it'); return; } const i = S.slots.findIndex(x => !byName.get(x.n)); addMon(i, p); V2.closeSheet(true);
  if (location.hash !== '#team') location.hash = '#team'; render(); toast(p.d + ' added'); };
document.addEventListener('click', e => { const b = e.target.closest('[data-v2add]'); if (b) V2.addToTeam(b.dataset.v2add); });

// ---------- empty My Team: the lead, and today's underdog (Sim, Nov 11) ----------
// The featured Pokémon comes from the bottom of our own ratings: every Pokémon is somebody's favourite. Flapple goes first
// (Sim: "it's the cutest"), then one a day from the 12 lowest-rated Pokémon that have real games (at least 1% of teams), so
// the rating means something. Never shown beside grades or a team's data.
V2.underdog = (now = new Date()) => { const day = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2026, 10, 12)) / 864e5);
  if (day <= 0 || typeof rating !== 'function') return 'Flapple';
  const pool = ROSTER.filter(p => !p.m && (U(p) || 0) >= 1 && SPRITE_ID[p.n]).map(p => ({n: p.n, r: RS(rating(p).total)})).sort((a, b) => a.r - b.r || a.n.localeCompare(b.n)).slice(0, 12);
  return pool.length ? pool[(day - 1) % pool.length].n : 'Flapple'; };
V2.emptyHtml = (o = {}) => { const n = V2.underdog(), d = V2.esc(V2.disp(n)), nSaved = S.teams.filter(t => t.format !== 'singles').length;
  return `<section class="tm-empty"><div class="tm-e-lead"><div class="np-eyebrow">My Team</div><h1 class="u">Six spots, all yours.</h1><p>Add a Pokémon to start, or let us build a whole team around a favourite.</p>
    <div class="row"><a class="np-btn" href="#build">Build Me a Team</a><button type="button" class="np-btn2" data-v2search><span>Add a Pokémon</span></button>${nSaved ? `<button type="button" class="np-link tm-e-saved" data-v2saved>Open a saved team <small>${nSaved}</small></button>` : ''}</div></div>
    <div class="tm-ud"><div class="tm-ud-hd"><div class="np-eyebrow">Today's underdog</div><h2 class="u">${d}. <span>Somebody's favourite.</span></h2></div><div class="tm-ud-st">${V2.mon(n, {iw: 240, bare: true})}</div><div class="tm-ud-bd">
    <p>Rarely picked in tournaments, but every Pokémon deserves its moment. Maybe it's yours?</p>
    <div class="row">${o.preview || V2.addState(n) === 'ok' ? `<button type="button" class="np-btn2" data-v2add="${V2.esc(n)}"><span>Add ${d} to My Team</span></button>` : ''}<button type="button" class="np-link" data-v2mon="${V2.esc(n)}">Info Sheet</button></div></div></div></section>`; };

// ---------- drawing ----------
V2.ui = V2.ui || {sel: 0, mu: 'top'};
V2.LV = ['No answer', 'Shaky', 'Handles it', 'Beats it']; // the four calc levels (word list)
V2.pages.team = {place: 'team', draw() {
  const D = V2.teamData();
  if (D.empty) return V2.emptyHtml();
  const {ms, G} = D, sel = ms[Math.min(V2.ui.sel, ms.length - 1)], s = G ? Math.round(G.s) : null;
  const word = G ? CH.wordOf(G.s) + (G.partial ? ' so far' : '') : '';
  const rank = G && !G.partial && G.rk != null ? CH.rankShort(G.rk) + ' of tournament teams' : G && G.partial ? `${ms.length} of 6 picked` : '';
  const sure = G && G.su ? `How sure: ${G.su.w}` : '';
  const mon = (m, i) => `<button type="button" class="tm-pick" data-tmsel="${i}" aria-pressed="${m === sel}" aria-label="${V2.esc(m.d)}${D.role(m.p.n) ? ', ' + D.role(m.p.n) : ''}">${V2.mon(m.p.n, {sel: m === sel, sub: D.role(m.p.n)})}</button>`;
  const lockup = `<div class="tm-lock"><div class="np-eyebrow tm-eb"><span>My Team${D.saved ? ` · ${V2.esc(D.saved)}` : ''}</span></div>${s == null ? `<p class="tm-wait">${ms.length} of 6 picked. The Strength Score shows once the team can be rated.</p>`
    : `<div class="np-score" style="--band:var(--band-${({A: "top", B: "ready", C: "solid", D: "work", F: "miss"})[G.band] || "solid"})"><b>${s}</b><div class="w"><span>${V2.esc(word)}</span><small>Strength Score</small></div></div><p class="tm-rank">${V2.esc([rank, sure].filter(Boolean).join(' · '))}</p>`}</div>`;
  const acts = `<div class="tm-acts"><button type="button" class="np-btn" data-v2save>Save Team</button><a class="np-btn2" href="#team"><span>Share</span></a><button type="button" class="np-btn2" data-v2copy><span>Copy for Showdown</span></button><button type="button" class="np-btn2 tm-tsact" data-v2sheetopen><span>Team Sheet</span></button><button type="button" class="np-btn2 tm-svl" data-v2saved><span>Saved Teams <small>${S.teams.filter(t => t.format !== 'singles').length}</small></span></button></div>`;
  const nm = D.mu.fav + D.mu.even + D.mu.unf;
  const jump = `<nav class="np-tabs tm-jump" aria-label="On this page"><a href="#team" data-tmjump="tm-set" aria-selected="true">Set</a><a href="#team" data-tmjump="tm-mu">Matchups${nm ? ` <small>${nm}</small>` : ''}</a><a href="#team" data-tmjump="tm-sg">Suggestions</a><a href="#team" data-tmjump="tm-ck">Team Checks <small>${D.basics.filter(x => x.ok).length}/${D.basics.length}</small></a><button type="button" class="tm-tsbtn" data-v2sheetopen>Team Sheet <small>${ms.length} sets</small> <span aria-hidden="true">↗</span></button></nav>`;
  // 1. Set: the selected Pokémon on its tilted panel, with its whole set
  const P = sel.p, r = typeof RS === 'function' && typeof rating === 'function' ? Math.round(RS(rating(P).total)) : null;
  const spr = sel.spread && sel.spread.nat ? sel.spread : null;
  const setSec = `<section class="tm-sec tm-set" id="tm-set"><h2 class="u">Set</h2><div class="tm-setgrid"><div class="tm-art">${V2.mon(P.n, {sel: true, iw: 240, bare: true})}</div><div>
    <h3 class="u">${V2.esc(sel.d)}</h3><div class="tm-types">${(P.t || []).map(V2.typeChip).join('')}${r != null ? `<span class="np-chip">Rated ${r}</span>` : ''}</div>
    <dl class="tm-kv"><div><dt>Item</dt><dd>${V2.esc(sel.heldItem || sel.item || 'None')}</dd></div><div><dt>Ability</dt><dd>${V2.esc(sel.ability || '')}</dd></div>${spr ? `<div><dt>Nature</dt><dd>${V2.esc(spr.nat)}</dd></div>` : ''}</dl>
    <div class="tm-moves">${sel.moves.filter(Boolean).map(v => `<span class="np-type" style="--tc:var(--ty-${V2.TYPES.includes(v.type) ? v.type : 'Normal'})">${V2.esc(v.name)}</span>`).join('')}</div>
    <div class="tm-setacts"><button type="button" class="np-btn2" data-v2edit="${sel.i}"><span>Edit Set</span></button></div></div></div></section>`;
  // 2. Matchups: real-game verdicts lead, the calc reading underneath (Sim, Nov 10)
  const vcls = {'Favoured': 'vf', 'Even match': 've', 'Unfavoured': 'vu'};
  const muSec = !D.rows.length ? '' : `<section class="tm-sec tm-mus" id="tm-mu"><h2 class="u">Matchups</h2><p class="tm-sub">Against the top ${D.rows.length} threats.${D.mu.any ? ' Verdicts come from real tournament games; the damage calc reading is underneath.' : ''}</p>
    ${D.mu.any ? `<div class="tm-legend"><span class="lf"><b>${D.mu.fav}</b> Favoured</span><span class="le"><b>${D.mu.even}</b> Even match</span><span class="lu"><b>${D.mu.unf}</b> Unfavoured</span></div>` : ''}
    <p class="fine">Damage calc: Beats it ${D.calc.beats} · Handles it ${D.calc.handles} · Shaky ${D.calc.shaky} · No answer ${D.calc.none}</p>
    <ol class="tm-rows">${D.top.map(x => `<li><img src="${V2.art(SPRITE_ID[x.t.n])}" alt="" loading="lazy"><span class="nm">${V2.esc(x.t.d)}<small>Calc: ${V2.LV[x.level]}</small></span>${x.real ? `<span class="tm-v ${vcls[x.real.w]}">${x.real.w}</span>` : ''}</li>`).join('')}</ol></section>`;
  // 3. Suggestions, numbered (word list), each with its Strength Score change and Apply
  const S2 = D.sug, side1 = (m, cls) => { const P = m.p || m; return `<span class="tm-sw${cls}"><img src="${V2.art(SPRITE_ID[P.n])}" alt=""><span>${V2.nameHtml(m.d || V2.disp(P.n))}</span></span>`; };
  const swap = x => `<div class="tm-chg" aria-label="${x.out ? V2.esc(x.out.d) + ' out, ' : 'Add '}${V2.esc(x.c.p.d)}${x.out ? ' in' : ''}">${x.out ? side1(x.out, '') : '<span class="tm-sw"></span>'}<span class="tm-ar" aria-hidden="true">${x.out ? '→' : '+'}</span>${side1(x.c.p, ' in')}</div>`;
  const sgSec = !S2 ? '' : `<section class="tm-sec tm-sgs" id="tm-sg"><h2 class="u">Suggestions</h2>${S2.pending ? '<p class="tm-sub" role="status">Working out the best changes for your team…</p>'
    : S2.none ? '<p class="tm-sub">Nothing raises this team’s Strength Score right now, and every other swap would lower it.</p>'
    : `<p class="tm-sub">${S2.side ? 'Nothing raises this team’s Strength Score right now. These swaps keep every check and about the same score, with a different look:' : 'What to change, best first.'}</p>
    <ol class="tm-sug">${S2.top.map((x, k) => `<li><span class="np-eyebrow">Suggestion ${k + 1}</span>${x.d != null ? `<div class="tm-mv"><b>${x.d > 0 ? '+' + x.d : x.d < 0 ? '−' + Math.abs(x.d) : '±0'}</b><span>${x.r0} → ${x.r1}${x.word ? ' · ' + V2.esc(x.word) : ''}</span></div>` : ''}<div class="tm-swaps">${x.pl.ch.map(swap).join('')}</div><button type="button" class="np-btn" data-v2plan="${k}">Apply</button></li>`).join('')}</ol>`}</section>`;
  // 4. Team checks: the 4 basics count, the 3 notes don't (Sim, Nov 9)
  const ck = x => `<li class="${x.ok ? 'ok' : ''}"><b aria-hidden="true">${x.ok ? '✓' : '–'}</b><span>${V2.esc(x.label)}${!x.ok && x.miss ? `<small>${V2.esc(x.miss)}</small>` : ''}</span></li>`;
  const ckSec = `<section class="tm-sec tm-cks" id="tm-ck"><h2 class="u">Team Checks</h2><p class="tm-sub">The 4 basics count toward the score; the notes are advice.</p><ul class="tm-ck">${D.basics.map(ck).join('')}</ul>${D.notes.length ? `<h3 class="tm-h3">Notes</h3><ul class="tm-ck">${D.notes.map(ck).join('')}</ul>` : ''}</section>`;
  return `<section class="tm-hero">${lockup}<div class="tm-six">${ms.map(mon).join('')}</div>${acts}</section>${jump}<div class="tm-work">${setSec}${ckSec}${muSec}${sgSec}</div>`;
},
after() {
  document.querySelectorAll('[data-v2plan]').forEach(b => b.addEventListener('click', () => { const pl = (ui.planList || [])[+b.dataset.v2plan]; if (!pl) return;
    applyPlan(pl); persist(); V2.redraw(); toast(`Applied: ${pl.ch.map(x => x.c.p.d).join(' and ')}`, true); }));
  document.querySelectorAll('[data-tmsel]').forEach(b => b.addEventListener('click', () => { V2.ui.sel = +b.dataset.tmsel; V2.redraw(); }));
  document.querySelectorAll('[data-tmjump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.getElementById(a.dataset.tmjump); if (t) t.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }));
}};
// a look at the empty My Team without emptying anyone's team (the redesign preview links here; it changes nothing)
V2.pages['team-empty'] = {place: 'team', draw: () => V2.emptyHtml({preview: true})};
