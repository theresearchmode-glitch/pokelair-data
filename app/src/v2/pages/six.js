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

