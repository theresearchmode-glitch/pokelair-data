// ---------- My Team's six tiles and the set card (R4 group "six", Nov 11) ----------
// The working-out is today's shared logic (src/app/05-six-data.js: teamLineup, PLAN_VS); this file only draws it.
// Approved look: docs/rebuild/mocks/myteam.tpl.html (the six in three pairs: Lead, Back, Bench, each name over its item).

// the six in three pairs, in plan order, then the game plan line (today's AR.plan words)
V2.sixHtml = (D, sel) => { const {ms, L} = D, E = V2.esc;
  const ord = [...L.lead, ...L.back, ...L.bench], role = m => L.lead.includes(m) ? 'Lead' : L.back.includes(m) ? 'Back' : 'Bench';
  const tile = m => { const k = ms.indexOf(m), on = m === sel;
    // Lock and × on the tile (TEAM-09, today's words): shown on the picked tile, on hover, and always while locked
    const lk = !!(S.slots[m.i] && S.slots[m.i].lock);
    const ctl = `<button type="button" class="sx-ic sx-lock${lk ? ' on' : ''}" data-v2lock="${m.i}" aria-pressed="${lk}" aria-label="${lk ? 'Unlock' : 'Lock'} ${E(m.d)}: suggestions never swap out a locked Pokémon" title="${lk ? 'Locked: suggestions keep it' : 'Lock it so suggestions keep it'}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="${lk ? 'M9 11V8a3 3 0 0 1 6 0v3' : 'M9 11V8a3 3 0 0 1 5.8-1'}"/></svg></button>`
      + `<button type="button" class="sx-ic sx-rm" data-v2rm="${m.i}" aria-label="Remove ${E(m.d)} from your team"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg></button>`;
    return `<div class="sx-slot${on ? ' on' : ''}${lk ? ' locked' : ''}"><button type="button" class="tm-pick" data-tmsel="${k}" aria-pressed="${on}" aria-label="${E(m.d)}, ${role(m)}${lk ? ', locked' : ''}">${V2.mon(m.p.n, {sel: on, sub: m.heldItem || m.item || 'No item'})}</button>${ctl}</div>`; };
  // empty spots (TEAM-20): "+ Add a Pokémon" tiles after the team, each opens the name box for its own spot (as today)
  const used = new Set(ms.map(m => m.i)), open = [0, 1, 2, 3, 4, 5].filter(i => !used.has(i)).slice(0, 6 - ord.length);
  const add = i => `<div class="sx-slot sx-empty"><button type="button" class="sx-add" data-v2addto="${i}" aria-label="Add a Pokémon to slot ${i + 1}"><span class="sx-addart" aria-hidden="true"><i>+</i></span><b><span class="sx-pre">Add a</span> Pokémon</b><small>Spot ${i + 1}</small></button></div>`;
  const cells = ord.map(tile).concat(open.map(add)), grp = (name, j) => cells.slice(j * 2, j * 2 + 2).length ? `<div class="sx-grp" role="group" aria-label="${name}"><p class="sx-gl u" aria-hidden="true">${name}</p><div class="sx-tiles">${cells.slice(j * 2, j * 2 + 2).join('')}</div></div>` : '';
  const pair = g => g.map(m => escName(m.d)).join(' + '), vs = PLAN_VS[L.by];
  const plan = L.lead.length >= 2 ? `<p class="sx-plan"><span class="sx-pl">Game plan${/^vs /.test(vs) ? ' ' + vs : ', ' + vs}: lead <b>${pair(L.lead)}</b>${L.back.length ? `, back ${pair(L.back)}` : ''}${L.bench.length ? `, bench ${pair(L.bench)}` : ''}.</span>${L.by === 'you' ? `<button type="button" class="np-link sx-reset" data-v2lead="">Use NastyPlot's pick</button>` : ''}</p>` : '';
  return `<div class="tm-six sx"><div class="sx-grps">${['Lead', 'Back', 'Bench'].map(grp).join('')}</div>${plan}</div>`; };

// the set card (TEAM-10): its place in the plan, the rating with its tier, item, Ability, nature and stat points (yours or what
// most players run), the four moves, then Edit Set, Set as Lead (not already a lead) and its Info Sheet. Today's words throughout.
V2.setSecHtml = (D, sel) => { const m = sel, P = m.p, E = V2.esc, L = D.ms.length >= 4 ? D.L : null, R = monRating(P), N = natInfo(m);
  const role = L && L.lead.length ? `<p class="tm-sub sx-role">${roleText(m, L, x => escName(x.d))}${L.by === 'meta' ? ' ' + PLAN_VS.meta : ''}</p>` : '';
  const lead = L && L.lead.length && !L.lead.includes(m) ? `<button type="button" class="np-btn2" data-v2lead="${E(P.n)}"><span>Set as Lead</span></button>` : '';
  const row = (k, v, note) => `<div><dt>${k}</dt><dd>${v}${note ? ` <small>${note}</small>` : ''}</dd></div>`;
  return `<section class="tm-sec tm-set" id="tm-set"><h2 class="u">Set</h2>${role}<div class="tm-setgrid"><div class="tm-art sx-art">${V2.mon(P.n, {sel: true, bare: true})}${R ? `<p class="sx-rate"><b class="u">${R.n}</b> <span>${R.tier ? E(R.tier) + ' tier rating' : 'Rating'}</span></p>` : ''}</div><div>
    <h3 class="u">${V2.nameHtml(m.d)}</h3><div class="tm-types">${(P.t || []).map(V2.typeChip).join('')}</div>
    <dl class="sx-kv">${row('Item', E(m.heldItem || m.item || 'No item'))}${row('Ability', E(m.ability || 'None'))}${N.nat ? row('Nature', E(N.nat), N.natNote) : ''}${N.words ? row('Stat points', E(N.words), N.ptsNote) : ''}</dl>
    <div class="tm-moves">${m.moves.filter(Boolean).map(v => `<span class="np-type" style="--tc:var(--ty-${V2.TYPES.includes(v.type) ? v.type : 'Normal'})">${E(v.name)}</span>`).join('')}</div>
    <div class="tm-setacts"><button type="button" class="np-btn2" data-v2edit="${m.i}"><span>Edit Set</span></button>${lead}<button type="button" class="np-link sx-info" data-v2mon="${E(P.n)}">Info Sheet ›</button></div></div></div></section>`; };

// Set as Lead / Use NastyPlot's pick (TEAM-11): today's setLeadPick and words; the pick is saved with the team (S.leads)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2lead]'); if (!b) return;
  const pk = setLeadPick(b.dataset.v2lead); if (pk === false) return; render(); toast(leadMsg(pk)); });

// Lock and × on a tile (TEAM-09): today's toggleLock and clearSlot (31-set-edits.js); × keeps Undo, as today
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-v2lock],[data-v2rm]'); if (!t) return;
  if (t.dataset.v2lock != null) { toggleLock(+t.dataset.v2lock); render(); const b = document.querySelector(`[data-v2lock="${t.dataset.v2lock}"]`); if (b) b.focus({preventScroll: true}); return; }
  const was = clearSlot(+t.dataset.v2rm); render(); if (was) toast(`Removed ${was.d}`, true); });

// ---------- adding into a spot (ADD-01, ADD-02): the name box opens in the Edit Set sheet, focused ----------
// Live search with today's monChoices (base names, "mega sal", "hisuian arc"; Species Clause for this spot), each row with its
// type, "In your box" and its share of tournament teams (useText). Arrow keys move, Enter adds, Escape closes the list only.
// Picking adds it (today's addMon) and the sheet turns into that Pokémon's Edit Set. The sheet sits outside the page, so a redraw
// while typing (the day's data arriving) never touches the text.
V2.addHtml = i => `<div class="ed2 sx-addsh"><div class="np-eyebrow">Spot ${i + 1}</div><h2 class="u">Add a Pokémon</h2>
  <label class="np-field">${V2.ICON.search}<input type="search" data-adq="${i}" placeholder="Name, e.g. garch or mega sal" aria-label="Pokémon for spot ${i + 1}" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="sx-hits"></label>
  <div class="hits sx-hits" id="sx-hits" role="listbox" aria-label="Matches" data-adhits></div>
  <p class="fine sx-addhint">Type part of a name: a base name lists its forms and Mega too.</p></div>`;
V2.openAdd = i => { V2.ed.i = i; V2.sheet(V2.editHtml(), {label: 'Add a Pokémon', focus: '[data-adq]'}); };
V2.ad = {list: [], k: 0};
V2.adDraw = inp => { const out = document.querySelector('[data-adhits]'); if (!out) return; const q = inp.value.trim(), E = V2.esc;
  if (!q) { V2.ad = {list: [], k: 0}; out.innerHTML = ''; inp.setAttribute('aria-expanded', 'false'); return; }
  const C = monChoices(inp.value, slotPool(+inp.dataset.adq)); V2.ad = {list: C.list, k: 0};
  out.innerHTML = C.list.length ? C.list.map((p, k) => `<button type="button" class="np-hit sx-hit" role="option" id="sx-o${k}" data-adpick="${E(p.n)}" aria-selected="${k === 0}" tabindex="-1"><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy"><b>${V2.nameHtml(p.d)}</b><span class="ty">${(p.t || []).map(V2.typeChip).join('')}</span><span class="sx-meta">${inBox(p) ? '<span class="sx-inbox">In your box</span>' : ''}<span class="sx-use" title="Share of tournament teams">${useText(p)}</span></span></button>`).join('')
    : `<p class="fine sx-none">${E(C.note || 'No matches. Try fewer letters.')}</p>`;
  inp.setAttribute('aria-expanded', C.list.length ? 'true' : 'false'); if (C.list.length) inp.setAttribute('aria-activedescendant', 'sx-o0'); else inp.removeAttribute('aria-activedescendant'); };
V2.adMove = (inp, d) => { const n = V2.ad.list.length; if (!n) return; V2.ad.k = (V2.ad.k + d + n) % n;
  document.querySelectorAll('[data-adhits] .sx-hit').forEach((o, k) => o.setAttribute('aria-selected', k === V2.ad.k)); inp.setAttribute('aria-activedescendant', 'sx-o' + V2.ad.k);
  const o = document.getElementById('sx-o' + V2.ad.k); if (o) o.scrollIntoView({block: 'nearest'}); };
V2.adPick = (i, n) => { const p = byName.get(n); if (!p || !slotPool(i)(p) || memberOf(S.slots[i], i)) return; addMon(i, p); render(); toast(p.d + ' added'); V2.ed.i = i; V2.edRefresh(); };
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-v2addto]'); if (a) { V2.openAdd(+a.dataset.v2addto); return; }
  const o = e.target.closest && e.target.closest('[data-adpick]'), inp = document.querySelector('[data-adq]'); if (o && inp) V2.adPick(+inp.dataset.adq, o.dataset.adpick); });
document.addEventListener('input', e => { if (e.target.matches && e.target.matches('[data-adq]')) V2.adDraw(e.target); });
document.addEventListener('keydown', e => { const inp = e.target; if (!inp.matches || !inp.matches('[data-adq]')) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); V2.adMove(inp, e.key === 'ArrowDown' ? 1 : -1); }
  else if (e.key === 'Enter') { e.preventDefault(); const p = V2.ad.list[V2.ad.k]; if (p) V2.adPick(+inp.dataset.adq, p.n); }
  // Escape closes the list first (the sheet stays open, as today); a second Escape closes the sheet
  else if (e.key === 'Escape' && document.querySelector('[data-adhits]').innerHTML) { e.preventDefault(); e.stopPropagation(); V2.ad = {list: [], k: 0}; document.querySelector('[data-adhits]').innerHTML = ''; inp.setAttribute('aria-expanded', 'false'); } }, true); // capture: runs before the sheet's own Escape
