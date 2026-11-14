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
  if (!sel.length) return wrap(`<p class="tm-sub tc-none">Pick one or two types above, or look up a Pokémon.</p><div class="tc-city quiet" aria-hidden="true">${V2.tcCity(TYPES.map(t => ({t, m: 1})), true)}</div>`);
  const {groups: g, abNotes} = typeGroups(sel, X.ab), off = typeOffence(sel);
  const mulOf = t => g.q.includes(t) ? 4 : g.d.includes(t) ? 2 : g.h.includes(t) ? .5 : g.qr.includes(t) ? .25 : g.z.includes(t) ? 0 : 1;
  const list = TYPES.map((t, i) => ({t, m: mulOf(t), i})).sort((a, b) => b.m - a.m || a.i - b.i);
  const left = mon ? `<div class="tc-cardw">${V2.msCard(mon, mon.n, `<h2 class="u">${V2.nameHtml(V2.disp(mon.n))}</h2>`, `<div class="ms-ty">${mon.t.map(chip).join('')}</div>`)}</div>`
    : `<div class="tc-cardw tc-types">${sel.map(t => `<span class="tc-tile big" style="--tc:var(--ty-${t})"><b>${t}</b></span>`).join('')}</div>`;
  // the text version (screen readers, and what the tests read): today's five groups and today's sentence
  const bands = [['4×', 'weak', g.q, 'b4'], ['2×', 'weak', g.d, 'b2'], ['½', 'resists', g.h, 'bh'], ['¼', 'resists', g.qr, 'bq'], ['0', 'immune', g.z, 'b0']];
  const sr = `<div class="vh"><ul>${bands.map(([m, w, ts, c]) => `<li class="tc-band ${c}">${m} ${w}: <span class="ts">${ts.length ? ts.map(chip).join(' ') : 'none'}</span></li>`).join('')}</ul><p>Everything not listed hits it for normal damage.</p></div>`;
  const legend = `<ul class="tc-leg" aria-hidden="true"><li><i class="k w"></i>Tall, red edge: it is weak here</li><li><i class="k n"></i>Short and faded: normal damage</li><li><i class="k r"></i>Low, blue edge: it resists</li><li><i class="k z"></i>Flat plate: immune</li></ul>`;
  const note = abNotes.length ? `<p class="tc-ab">${E(abNotes.join('. '))}.</p>` : '';
  const grp = (m, w, ts, k) => `<div class="tc-grp ${k}"><p class="cap"><b class="u">${m}</b><span>${w}</span></p><div class="row">${ts.length ? ts.map(t => `<span class="blk" style="--ty:var(--ty-${t})"><i aria-hidden="true"></i><span>${t}</span></span>`).join('') : '<i class="none">Nothing</i>'}</div></div>`;
  const streets = `<section class="tc-streets n${off.length}"><p class="tc-lbl">Attacking with its own types</p><p class="tc-sub">Everything not standing here takes normal damage.</p><div class="tc-sts">${off.map(o => `<div class="tc-st" style="--ty:var(--ty-${o.atk})"><div class="tc-ban"><b class="u">${o.atk}</b> <small>attacks</small></div><div class="tc-grps">${grp('2×', 'Hits hard', o.se, 'hi')}${grp('½', 'Half damage', o.nv, 'lo')}${o.no.length ? grp('0', 'No effect', o.no, 'z') : ''}</div></div>`).join('')}</div></section>`;
  return wrap(`<div class="tc-sky">${left}<p class="tc-lbl tc-takes">Taking hits as ${sel.map(chip).join(' ')}</p><div class="tc-city" aria-hidden="true">${V2.tcCity(list)}</div>${sr}${legend}${note}<p class="fine tc-sorted">Sorted from hits hardest (back) to can't touch it (front).</p></div>${streets}`); }};

// ---------- Skyline (Sim's pick, Nov 14; brief docs/rebuild/mocks/types/skyline/BRIEF.md): the 18 attacking types as towers ----------
// Three drawings of the same city; the room the city has picks one (container query): a diamond on wide columns, a slanted block of
// six on phones, a block of three on the narrowest. Heights follow the multiplier; six to a row, hardest hits at the back, so a tall
// tower never stands in front of a shorter one. Roof labels are text laid over the drawing at a fixed size (the type scale).
V2.TC_H = {4: 1.4375, 2: .85, 1: .2875, .5: .1375, .25: .0625, 0: 0};
V2.tcCity = (list, quiet) => [['dia', 160, 6], ['blk6', 120, 6], ['blk3', 120, 3]].map(([kind, L, per]) => {
  const P = list.map((o, k) => { const r = Math.floor(k / per), c = k % per, x = kind === 'dia' ? (c - r) * L / 2 : c * L / 2, y = kind === 'dia' ? (c + r) * L / 4 : c * L / 4 + r * L / 2;
    return {...o, x, y, h: (quiet ? V2.TC_H[1] : V2.TC_H[o.m]) * L}; });
  const w = .86 * L / 2, d = w / 2, pad = 6, f = n => Math.round(n * 10) / 10;
  const x0 = Math.min(...P.map(p => p.x)) - L / 2 - pad, x1 = Math.max(...P.map(p => p.x)) + L / 2 + pad, y0 = Math.min(...P.map(p => Math.min(p.y - L / 4, p.y - d - p.h))) - pad, y1 = Math.max(...P.map(p => p.y)) + L / 4 + pad, W = x1 - x0, H = y1 - y0;
  const st = m => quiet ? 'q' : m >= 2 ? 'w' + m : m === 1 ? 'n' : m === 0 ? 'z' : 'r', mul = m => m === 4 ? '4×' : m === 2 ? '2×' : m === .5 ? '½' : m === .25 ? '¼' : m === 0 ? '0' : '';
  const tower = p => { const {x, y, h} = p, pt = a => a.map(([u, v]) => `${f(u)},${f(v)}`).join(' '), lot = pt([[x, y - L / 4], [x + L / 2, y], [x, y + L / 4], [x - L / 2, y]]);
    if (!quiet && p.m === 0) return `<g class="tw z" style="--ty:var(--ty-${p.t})"><polygon class="lot" points="${lot}"/><polygon class="pl" vector-effect="non-scaling-stroke" points="${pt([[x, y - d], [x + w, y], [x, y + d], [x - w, y]])}"/></g>`;
    let lines = ''; for (let k = L * .075; k < h - 2; k += L * .075) lines += `<polyline class="fl" vector-effect="non-scaling-stroke" points="${pt([[x - w, y - k], [x, y + d - k], [x + w, y - k]])}"/>`;
    return `<g class="tw ${st(p.m)}" style="--ty:var(--ty-${p.t})"><polygon class="lot" points="${lot}"/><polygon class="lw" points="${pt([[x - w, y - h], [x, y + d - h], [x, y + d], [x - w, y]])}"/><polygon class="rw" points="${pt([[x, y + d - h], [x + w, y - h], [x + w, y], [x, y + d]])}"/>${lines}<polygon class="rf" vector-effect="non-scaling-stroke" points="${pt([[x, y - d - h], [x + w, y - h], [x, y + d - h], [x - w, y - h]])}"/><polyline class="lt" vector-effect="non-scaling-stroke" points="${pt([[x - w, y - h], [x, y - d - h], [x + w, y - h]])}"/></g>`; };
  const order = P.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const labels = P.map(p => `<span class="lb ${st(p.m)}" style="left:${f((p.x - x0) / W * 100)}%;top:${f((p.y - p.h - x0 * 0 - y0) / H * 100)}%">${mul(p.m) && !quiet ? `<b class="u">${mul(p.m)}</b> ` : ''}<span>${p.t}</span></span>`).join('');
  return `<div class="tc-cv ${kind}" style="--mw:${Math.round(kind === 'blk3' ? W * 1.25 : W)}px"><svg viewBox="${f(x0)} ${f(y0)} ${f(W)} ${f(H)}" focusable="false">${order.map(tower).join('')}</svg>${labels}</div>`; }).join('');
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
