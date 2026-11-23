// ---------- Type Chart (Nov 14), Battle's tool: what hits a Pokemon (or one or two types) hard, and what its own types hit ----------
// On the shared kit (reskin, Nov 22; was Concept A 'Spotlight' + the Skyline): kit header, three plan steps, the damage line. Every number comes from today's shared type logic (20-types-data.js:
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
V2.tcGrid = sel => `<div class="tc-gw"><table class="tc-grid"><caption class="vh">Type chart: attacking types down the side, defending types across the top</caption><thead><tr><th class="cor" scope="col">Attacking ↓<br>Defending →</th>${TYPES.map(t => `<th scope="col" title="${t}" class="${sel.includes(t) ? 'lit' : ''}" style="--tc:var(--ty-${t})"><span>${V2.TC_AB(t)}</span></th>`).join('')}</tr></thead>
  <tbody>${TYPES.map(a => `<tr><th scope="row" style="--tc:var(--ty-${a})"><span>${a}</span></th>${TYPES.map(d => { const v = EFF[a][d]; return `<td class="v${String(v).replace('.', '_')}${sel.includes(d) ? ' lit' : ''}">${V2.tcMul(v)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
// type symbols (Sim, Nov 21, 3:35 PM): each pick button and big tile shows its type's symbol above the word (V2.kTy, kit.js), never alone
// phones (today's row view): pick an attacking type, its hits as three groups
V2.tcRow = () => { const a = TYPES.includes(ui.tcAtk) ? ui.tcAtk : 'Fire', chip = V2.typeChip, grp = (lab, f, k) => { const ts = TYPES.filter(d => f(EFF[a][d])); return `<div class="tc-offr"><span class="k ${k}">${lab}</span><span class="c">${ts.length ? ts.map(chip).join('') : '<i class="none">None</i>'}</span></div>`; };
  return `<div class="tc-prow"><p class="tc-lbl">Attacking type</p><div class="tc-picks" role="group" aria-label="Attacking type">${TYPES.map(t => `<button type="button" class="tc-tp sym${t === a ? ' on' : ''}" data-tcatk="${t}" aria-pressed="${t === a}" style="--tc:var(--ty-${t})">${V2.kTy(t)}${t}</button>`).join('')}</div>
    <div class="tc-off"><p class="tc-oh tc-offh">${chip(a)} <span>attacks hit…</span></p>${grp('Super effective (2×)', x => x >= 2, 'up')}${grp('Not very effective (½×)', x => x > 0 && x < 1, 'dn')}${grp('No effect (0×)', x => x === 0, 'no')}<p class="fine">Every other type takes normal damage.</p></div></div>`; };

/* the headline on the kit (reskin, Nov 22): 'Name hard.' stays together while it fits; when it doesn't (most names on phones), the join
   becomes an ordinary space; a single long word that still runs off (Crabominable at 320) steps the headline down the scale (34, then 28) */
V2.tcFitHead = () => { const h = document.querySelector('.tc-h h1'), j = h && h.querySelector('.tc-j'); if (!h) return; if (j) j.textContent = '\u00a0'; h.style.fontSize = '';
  /* the edge is the page's own content edge (the header could grow to the headline's widest unbroken piece) */
  const pg = h.closest('.tc'), edge = pg ? pg.getBoundingClientRect().right - parseFloat(getComputedStyle(pg).paddingRight) : innerWidth;
  const rg = document.createRange(), fits = () => { rg.selectNodeContents(h); return [...rg.getClientRects()].every(r => r.right <= edge + 1); }; /* every line's text, not only its box */
  if (fits()) return; if (j) j.textContent = ' '; if (fits()) return;
  for (const v of ['--t34', '--t28']) { h.style.fontSize = `var(${v})`; if (fits()) return; } };
/* phone length: on a phone the headline keeps to three lines; a long name steps it down the scale (34, then 28) until it does */
V2.tcFitLines = () => { const h = document.querySelector('.tc-h h1'); if (!h || innerWidth >= 700) return; const lines = () => h.getBoundingClientRect().height / (parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize));
  for (const v of ['--t34', '--t28']) { if (lines() <= 3.5) return; const px = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)); if (px < parseFloat(getComputedStyle(h).fontSize)) h.style.fontSize = `var(${v})`; } };

// the damage line (reskin, Nov 22): one row per attacking type that does more or less than normal damage, hardest first. The 1x line is
// normal damage; a pink bar runs right for each step it hurts more (2x, 4x), a blue bar left for each step it is shrugged off (1/2, 1/4),
// and an ink bar to the far edge for no effect. The types that hit it normally share one row of chips under it.
V2.TC_STEP = {4: 2, 2: 1, 1: 0, .5: -1, .25: -2, 0: -3};
V2.tcLine = (list, chip) => { const pos = v => (v + 3) * 20, mul = m => m === 4 ? '4×' : m === 2 ? '2×' : m === .5 ? '½' : m === .25 ? '¼' : '0';
  const rows = list.filter(o => o.m !== 1), norm = list.filter(o => o.m === 1);
  const row = o => { const v = V2.TC_STEP[o.m], a = Math.min(pos(v), 60), b = Math.max(pos(v), 60), k = o.m > 1 ? 'w' : o.m === 0 ? 'z' : 'r';
    return `<li class="tc-r ${k}"><span class="tc-rt">${chip(o.t)}</span><span class="tc-rk"><i class="tc-bar" style="left:${a}%;width:${b - a}%"><b class="u">${mul(o.m)}</b></i></span></li>`; };
  return `<div class="tc-ln"><p class="tc-ax" aria-hidden="true"><span class="r">← <span class="lg">Shrugs it off</span><span class="sh">Less</span></span><span class="n">1×<span class="lg"> normal</span></span><span class="w"><span class="lg">Hurts</span><span class="sh">More</span> →</span></p>
    <ul class="tc-rows" aria-hidden="true">${rows.map(row).join('')}</ul>
    ${norm.length ? `<div class="tc-norm" aria-hidden="true"><p class="tc-lbl">Normal damage</p><div class="ts">${norm.map(o => chip(o.t)).join('')}</div></div>` : ''}</div>`; };

V2.pages.types = {place: 'battle', after() { V2.tcFitHead(); V2.tcFitLines(); }, draw() { const E = V2.esc, chip = V2.typeChip, X = V2.tcState(), {sel, mon} = X;
  const who = mon ? E(V2.disp(mon.n)).replace(/ (\S)$/, '&nbsp;$1') /* 'Charizard Y': a lone letter stays with its name */ : sel.length ? sel.join(' and ') : '';
  const head = `<section class="tc-h">${V2.kHead({kicker: 'Battle · Type Chart', h1Html: who ? `What hits <em>${who}</em><span class="tc-j">&nbsp;</span>hard.` : 'What hits <em>what.</em>',
    leadHtml: mon ? `<span class="tc-show">Showing <b>${E(V2.disp(mon.n))}</b>, ability ${E(X.ab || '')}${X.onTeam ? ' (from your team)' : ''}</span>` : sel.length ? `Taking hits as ${E(sel.join(' and '))}.` : ''})}</section>`;
  const team = X.team.length ? `<div class="tc-team" role="group" aria-label="Your team">${X.team.map(m => `<button type="button" class="tc-tm${mon && m.p.n === mon.n ? ' on' : ''}" data-tcmon="${E(m.p.n)}" aria-pressed="${!!(mon && m.p.n === mon.n)}" aria-label="${E(V2.disp(m.p.n))}">${V2.mon(m.p.n, {iw: 40, bare: true})}<span>${V2.rowName(V2.disp(m.p.n))}</span></button>`).join('')}</div>` : '';
  const find = `<div class="tc-findw"><label class="np-field tc-find">${V2.ICON.search}<input type="search" data-tcfind value="${E(V2.tcFind || '')}" placeholder="Look up a Pokémon" aria-label="Look up a Pokémon: type its name" autocomplete="off">${V2.CLR}</label><div class="bd-hits tc-hits" data-tchits>${V2.tcFind ? V2.tcHits(V2.tcFind) : ''}</div></div>`;
  const picks = `<div class="tc-picks" role="group" aria-label="Or pick one or two types">${TYPES.map(t => `<button type="button" class="tc-tp sym${sel.includes(t) ? ' on' : ''}" data-tctype="${t}" aria-pressed="${sel.includes(t)}" style="--tc:var(--ty-${t})">${V2.kTy(t)}${t}</button>`).join('')}</div>`;
  const ctl = `<div class="tc-ctl">${team}${find}</div><p class="tc-lbl tc-pl"><span>Or pick one or two types</span>${sel.length || mon ? '<button type="button" class="np-link tc-clear" data-tcclear>Clear</button>' : ''}</p>${picks}`;
  const full = V2.kStep(sel.length ? 3 : 1, 'The whole chart.', 'every type against every type', `<div class="tc-full" data-tcfold>${V2.tcGrid(sel)}${V2.tcRow()}</div><div class="tc-fin">${V2.kGo('PLOT THE HIT.', {href: '#calc'})}<p class="fine tc-gnote">Rows attack, columns defend. 2 = super effective, ½ = not very effective, 0 = no effect, blank = normal.</p></div>`);
  const wrap = body => `<div class="tc">${V2.battleToolsBar('types')}${head}${ctl}${body}</div>`;
  if (!sel.length) return wrap(`<p class="k-lead tc-none">Pick one or two types above, or look up a Pokémon.</p>${V2.kPlan(full)}`);
  const {groups: g, abNotes} = typeGroups(sel, X.ab), off = typeOffence(sel);
  const mulOf = t => g.q.includes(t) ? 4 : g.d.includes(t) ? 2 : g.h.includes(t) ? .5 : g.qr.includes(t) ? .25 : g.z.includes(t) ? 0 : 1;
  const list = TYPES.map((t, i) => ({t, m: mulOf(t), i})).sort((a, b) => b.m - a.m || a.i - b.i);
  // beside the card: three counts (weak spots, resists, immune); a weak count is in pink, as its bars
  const nW = g.q.length + g.d.length, facts = `<ul class="k-facts">${[[nW, nW === 1 ? 'weak spot' : 'weak spots', nW ? ' bad' : ''], [g.h.length + g.qr.length, 'resists', ''], [g.z.length, 'immune', '']].map(([v, l, c]) => `<li><b class="u${c}">${v}</b><span>${l}</span></li>`).join('')}</ul>`;
  const left = mon ? `<div class="tc-cardw">${V2.kCard(mon.n, {fact: mon.t.join(' · ')})}${facts}</div>`
    : `<div class="tc-cardw tc-types">${sel.map(t => `<span class="tc-tile big" style="--tc:var(--ty-${t})">${V2.kTy(t)}<b>${t}</b></span>`).join('')}</div>`;
  // the text version (screen readers, and what the tests read): today's five groups and today's sentence
  const bands = [['4×', 'weak', g.q, 'b4'], ['2×', 'weak', g.d, 'b2'], ['½', 'resists', g.h, 'bh'], ['¼', 'resists', g.qr, 'bq'], ['0', 'immune', g.z, 'b0']];
  const sr = `<div class="vh"><ul>${bands.map(([m, w, ts, c]) => `<li class="tc-band ${c}">${m} ${w}: <span class="ts">${ts.length ? ts.map(chip).join(' ') : 'none'}</span></li>`).join('')}</ul><p>Everything not listed hits it for normal damage.</p></div>`;
  const note = abNotes.length ? `<p class="tc-ab">${E(abNotes.join('. '))}.</p>` : '';
  const hurt = V2.kStep(1, 'Where it hurts.', '', `<div class="tc-dmg">${left}<div class="tc-dr">${V2.tcLine(list, chip)}${sr}${note}</div></div>`);
  const grp = (m, w, ts) => `<div class="tc-og"><p class="cap"><b class="u">${m}</b> <span>${w}</span></p><div class="ts">${ts.length ? ts.map(chip).join('') : '<i class="none">Nothing</i>'}</div></div>`;
  const back = V2.kStep(2, 'Hitting back.', 'attacking with its own types',
    `<div class="tc-offs n${off.length}">${off.map(o => `<div class="tc-o" style="--ty:var(--ty-${o.atk})"><p class="tc-oh">${chip(o.atk)} <span>attacks</span></p>${grp('2×', 'hits hard', o.se)}${grp('½', 'half damage', o.nv)}${o.no.length ? grp('0', 'no effect', o.no) : ''}</div>`).join('')}</div>`);
  return wrap(V2.kPlan(hurt + back + full)); }};

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
