// ---------- Type Chart (Nov 14), Battle's tool: what hits a Pokemon (or one or two types) hard, and what its own types hit ----------
// Concept A 'Spotlight' (mock-ups docs/rebuild/mocks/types). Every number comes from today's shared type logic (20-types-data.js:
// typeGroups with the Ability's notes, typeOffence, EFF); the state is today's (ui.typesSel, ui.typesMon, ui.typesCleared, ui.tcAtk),
// so both sites agree. Today's controls all stay: look up a Pokemon, your team, pick one or two types, Clear, the full 18x18 chart, and
// on phones the attacking-type row.
V2.tcState = () => { const team = members();
  // opens on something useful: your first team member, or the most-used Pokemon when the team is empty (until you press Clear), as today
  if (!(ui.typesSel || []).length && !ui.typesMon && !ui.typesCleared) { let p0 = team[0] ? team[0].p : null;
    if (!p0) { try { const r = lairRows(); p0 = r && r[0] ? r[0].p : null; } catch (e) {} }
    if (p0) { ui.typesMon = p0.n; ui.typesSel = p0.t.slice(); ui.typesAuto = true; } }
  else if (ui.typesAuto && ui.typesMon && team.length && !team.some(m => m.p.n === ui.typesMon)) { const p0 = team[0].p; ui.typesMon = p0.n; ui.typesSel = p0.t.slice(); }
  const sel = ui.typesSel || [], mon = ui.typesMon ? byName.get(ui.typesMon) : null, onTeam = mon ? team.find(m => m.p.n === mon.n) : null;
  const ab = mon ? (onTeam ? onTeam.ability : (metaAbility(mon) || bestAbility(mon))) : null;
  return {team, sel, mon, onTeam, ab}; };
V2.TC_AB = t => t.slice(0, 3);
V2.tcMul = v => v === 0 ? '0' : v === .25 ? '¼' : v === .5 ? '½' : v === 4 ? '4' : v === 2 ? '2' : '';

// the full chart: every attacking type (rows) against every defending type (columns); the picked types' columns lit
V2.tcGrid = sel => `<div class="tc-gw"><table class="tc-grid"><caption class="vh">Type chart: attacking types down the side, defending types across the top</caption><thead><tr><th class="cor" scope="col">Attacking ↓ · Defending →</th>${TYPES.map(t => `<th scope="col" title="${t}" class="${sel.includes(t) ? 'lit' : ''}" style="--tc:var(--ty-${t})"><span>${V2.TC_AB(t)}</span></th>`).join('')}</tr></thead>
  <tbody>${TYPES.map(a => `<tr><th scope="row" style="--tc:var(--ty-${a})"><span>${a}</span></th>${TYPES.map(d => { const v = EFF[a][d]; return `<td class="v${String(v).replace('.', '_')}${sel.includes(d) ? ' lit' : ''}">${V2.tcMul(v)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
// phones (today's row view): pick an attacking type, its hits as three groups
V2.tcRow = () => { const a = TYPES.includes(ui.tcAtk) ? ui.tcAtk : 'Fire', chip = V2.typeChip, grp = (lab, f, k) => { const ts = TYPES.filter(d => f(EFF[a][d])); return `<div class="tc-offr"><span class="k ${k}">${lab}</span><span class="c">${ts.length ? ts.map(chip).join('') : '<i>None</i>'}</span></div>`; };
  return `<div class="tc-prow"><p class="tc-lbl">Attacking type</p><div class="tc-picks" role="group" aria-label="Attacking type">${TYPES.map(t => `<button type="button" class="tc-tp${t === a ? ' on' : ''}" data-tcatk="${t}" aria-pressed="${t === a}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>
    <div class="tc-off"><div class="tc-offh">${chip(a)}<b>attacks hit…</b></div>${grp('Super effective (2×)', x => x >= 2, 'up')}${grp('Not very effective (½×)', x => x > 0 && x < 1, 'dn')}${grp('No effect (0×)', x => x === 0, 'no')}<p class="fine">Every other type takes normal damage.</p></div></div>`; };

V2.pages.types = {place: 'battle', draw() { const E = V2.esc, chip = V2.typeChip, X = V2.tcState(), {sel, mon} = X;
  const who = mon ? E(V2.disp(mon.n)) : sel.length ? sel.join(' and ') : '';
  const head = `<section class="tc-h"><p class="np-eyebrow"><span>Battle · Type Chart</span></p><h1 class="u">${who ? `<span>What hits ${who}</span> <span class="pl">hard.</span>` : '<span>What hits</span> <span class="pl">what.</span>'}</h1></section>`;
  const team = X.team.length ? `<div class="tc-team" role="group" aria-label="Your team">${X.team.map(m => `<button type="button" class="tc-tm${mon && m.p.n === mon.n ? ' on' : ''}" data-tcmon="${E(m.p.n)}" aria-pressed="${!!(mon && m.p.n === mon.n)}" aria-label="${E(V2.disp(m.p.n))}">${V2.mon(m.p.n, {iw: 40, bare: true})}<span>${V2.rowName(V2.disp(m.p.n))}</span></button>`).join('')}</div>` : '';
  const find = `<div class="tc-findw"><label class="np-field tc-find">${V2.ICON.search}<input type="search" data-tcfind value="${E(V2.tcFind || '')}" placeholder="Look up a Pokémon" aria-label="Look up a Pokémon: type its name" autocomplete="off"></label><div class="bd-hits tc-hits" data-tchits>${V2.tcFind ? V2.tcHits(V2.tcFind) : ''}</div></div>`;
  const picks = `<div class="tc-picks" role="group" aria-label="Or pick one or two types">${TYPES.map(t => `<button type="button" class="tc-tp${sel.includes(t) ? ' on' : ''}" data-tctype="${t}" aria-pressed="${sel.includes(t)}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>`;
  const ctl = `<div class="tc-ctl">${find}${team}</div>${mon ? `<p class="tc-show">Showing <b>${E(V2.disp(mon.n))}</b>, ability ${E(X.ab || '')}${X.onTeam ? ' (from your team)' : ''}</p>` : ''}<p class="tc-lbl tc-pl"><span>Or pick one or two types</span>${sel.length || mon ? '<button type="button" class="np-link tc-clear" data-tcclear>Clear</button>' : ''}</p>${picks}`;
  const fold = `<details class="tc-fold" data-tcfold${V2.tcOpen ? ' open' : ''}><summary><span><b>Full type chart</b><small>Every attacking type against every defending type</small></span><i aria-hidden="true">›</i></summary>${V2.tcGrid(sel)}<p class="fine tc-gnote">Rows attack, columns defend. 2 = super effective, ½ = not very effective, 0 = no effect, blank = normal.</p>${V2.tcRow()}</details>`;
  const wrap = body => `<div class="tc">${V2.battleToolsBar('types')}${head}${ctl}${body}${fold}</div>`;
  if (!sel.length) return wrap(`<p class="tm-sub tc-none">Pick one or two types above, or look up a Pokémon.</p>`);
  const {groups: g, abNotes} = typeGroups(sel, X.ab), off = typeOffence(sel);
  const bands = [['4×', 'weak', g.q, 'b4'], ['2×', 'weak', g.d, 'b2'], ['½', 'resists', g.h, 'bh'], ['¼', 'resists', g.qr, 'bq'], ['0', 'immune', g.z, 'b0']];
  const left = mon ? `<div class="tc-cardw">${V2.msCard(mon, mon.n, `<h2 class="u">${V2.nameHtml(V2.disp(mon.n))}</h2>`, `<div class="ms-ty">${mon.t.map(chip).join('')}</div>`)}</div>`
    : `<div class="tc-cardw tc-types">${sel.map(t => `<span class="tc-tile big" style="--tc:var(--ty-${t})"><b>${t}</b></span>`).join('')}</div>`;
  const note = `${abNotes.length ? `<p class="tc-ab">${E(abNotes.join('. '))}.</p>` : ''}<p class="fine">Everything not listed hits it for normal damage.</p>`;
  const offH = off.map(o => `<div class="tc-off"><div class="tc-offh">${chip(o.atk)}<b>attacks</b></div><div class="tc-offr"><span class="k up">2× on</span><span class="c">${o.se.map(chip).join('') || '<i>Nothing</i>'}</span></div>
    <div class="tc-offr"><span class="k dn">½× on</span><span class="c">${o.nv.map(chip).join('') || '<i>Nothing</i>'}</span></div>${o.no.length ? `<div class="tc-offr"><span class="k no">No effect</span><span class="c">${o.no.map(chip).join('')}</span></div>` : ''}</div>`).join('');
  return wrap(`<div class="tc-main">${left}<div class="tc-right"><p class="tc-lbl">Taking hits as ${sel.map(chip).join(' ')}</p>
    <div class="tc-spec">${bands.map(([m, w, ts, c]) => `<div class="tc-band ${c}${ts.length ? '' : ' none'}"><div class="m u">${m}<small>${w}</small></div><div class="ts">${ts.length ? ts.map(chip).join('') : '<i>None</i>'}</div></div>`).join('')}</div>${note}
    <p class="tc-lbl">Attacking with its own types</p><div class="tc-offs">${offH}</div></div></div>`); }};

// the look-up box: Build's search (same names, Megas included), picks a Pokemon
V2.tcHits = q => (V2.buildHits ? V2.buildHits(q) : '').replace(/data-bdpick=/g, 'data-tcpick=');
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-tcfind]'); if (!i) return; V2.tcFind = i.value; const h = document.querySelector('[data-tchits]'); if (h) h.innerHTML = V2.tcHits(i.value); });
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-tcfind]'); if (!i) return;
  if (e.key === 'Enter') { const h = document.querySelector('[data-tchits] [data-tcpick]'); if (h) { e.preventDefault(); h.click(); } }
  else if (e.key === 'Escape') { V2.tcFind = ''; i.value = ''; const h = document.querySelector('[data-tchits]'); if (h) h.innerHTML = ''; } });
document.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('[data-tcfold]')) V2.tcOpen = e.target.open; }, true);
// taps: today's rules (34-events.js): a type toggles (a third replaces the older one) and clears the Pokemon; a Pokemon sets its types
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.tc [data-tcmon],.tc [data-tcpick],.tc [data-tctype],.tc [data-tcclear],.tc [data-tcatk]'); if (!t) return; const d = t.dataset;
  if (d.tcatk) { ui.tcAtk = d.tcatk; V2.redraw(); return; }
  if (d.tcmon || d.tcpick) { const p = byName.get(d.tcmon || d.tcpick); if (p) { ui.typesAuto = false; ui.typesMon = p.n; ui.typesSel = p.t.slice(); V2.tcFind = ''; } V2.redraw(); return; }
  if (d.tctype) { const s = ui.typesSel || []; ui.typesMon = null; ui.typesCleared = true; ui.typesSel = s.includes(d.tctype) ? s.filter(x => x !== d.tctype) : (s.length >= 2 ? [s[1], d.tctype] : [...s, d.tctype]); V2.redraw(); return; }
  ui.typesSel = []; ui.typesMon = null; ui.typesCleared = true; V2.tcFind = ''; V2.redraw(); }, true);
