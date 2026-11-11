// ---------- My Team's six tiles and the set card (R4 group "six", Nov 11) ----------
// The working-out is today's shared logic (src/app/05-six-data.js: teamLineup, PLAN_VS); this file only draws it.
// Approved look: docs/rebuild/mocks/myteam.tpl.html (the six in three pairs: Lead, Back, Bench, each name over its item).

// the six in three pairs, in plan order, then the game plan line (today's AR.plan words)
V2.sixHtml = (D, sel) => { const {ms, L} = D, E = V2.esc;
  const ord = [...L.lead, ...L.back, ...L.bench], role = m => L.lead.includes(m) ? 'Lead' : L.back.includes(m) ? 'Back' : 'Bench';
  const tile = m => { const k = ms.indexOf(m), on = m === sel;
    return `<div class="sx-slot${on ? ' on' : ''}"><button type="button" class="tm-pick" data-tmsel="${k}" aria-pressed="${on}" aria-label="${E(m.d)}, ${role(m)}">${V2.mon(m.p.n, {sel: on, sub: m.heldItem || m.item || 'No item'})}</button></div>`; };
  const cells = ord.map(tile), grp = (name, j) => cells.slice(j * 2, j * 2 + 2).length ? `<div class="sx-grp" role="group" aria-label="${name}"><p class="sx-gl u" aria-hidden="true">${name}</p><div class="sx-tiles">${cells.slice(j * 2, j * 2 + 2).join('')}</div></div>` : '';
  const pair = g => g.map(m => escName(m.d)).join(' + '), vs = PLAN_VS[L.by];
  const plan = L.lead.length >= 2 ? `<p class="sx-plan"><span class="sx-pl">Game plan${/^vs /.test(vs) ? ' ' + vs : ', ' + vs}: lead <b>${pair(L.lead)}</b>${L.back.length ? `, back ${pair(L.back)}` : ''}${L.bench.length ? `, bench ${pair(L.bench)}` : ''}.</span></p>` : '';
  return `<div class="tm-six sx"><div class="sx-grps">${['Lead', 'Back', 'Bench'].map(grp).join('')}</div>${plan}</div>`; };

// the set card (TEAM-10): its place in the plan, the rating with its tier, item, Ability, nature and stat points (yours or what
// most players run), the four moves, then Edit Set, Set as Lead (not already a lead) and its Info Sheet. Today's words throughout.
V2.setSecHtml = (D, sel) => { const m = sel, P = m.p, E = V2.esc, L = D.ms.length >= 4 ? D.L : null, R = monRating(P), N = natInfo(m);
  const role = L && L.lead.length ? `<p class="tm-sub sx-role">${roleText(m, L, x => escName(x.d))}${L.by === 'meta' ? ' ' + PLAN_VS.meta : ''}</p>` : '';
  const row = (k, v, note) => `<div><dt>${k}</dt><dd>${v}${note ? ` <small>${note}</small>` : ''}</dd></div>`;
  return `<section class="tm-sec tm-set" id="tm-set"><h2 class="u">Set</h2>${role}<div class="tm-setgrid"><div class="tm-art sx-art">${V2.mon(P.n, {sel: true, bare: true})}${R ? `<p class="sx-rate"><b class="u">${R.n}</b> <span>${R.tier ? E(R.tier) + ' tier rating' : 'Rating'}</span></p>` : ''}</div><div>
    <h3 class="u">${V2.nameHtml(m.d)}</h3><div class="tm-types">${(P.t || []).map(V2.typeChip).join('')}</div>
    <dl class="sx-kv">${row('Item', E(m.heldItem || m.item || 'No item'))}${row('Ability', E(m.ability || 'None'))}${N.nat ? row('Nature', E(N.nat), N.natNote) : ''}${N.words ? row('Stat points', E(N.words), N.ptsNote) : ''}</dl>
    <div class="tm-moves">${m.moves.filter(Boolean).map(v => `<span class="np-type" style="--tc:var(--ty-${V2.TYPES.includes(v.type) ? v.type : 'Normal'})">${E(v.name)}</span>`).join('')}</div>
    <div class="tm-setacts"><button type="button" class="np-btn2" data-v2edit="${m.i}"><span>Edit Set</span></button><button type="button" class="np-link sx-info" data-v2mon="${E(P.n)}">Info Sheet ›</button></div></div></div></section>`; };

