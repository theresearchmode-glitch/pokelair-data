// ---------- Events (tournament pages) and team search ----------
// meta/events (out/events.json from events.mjs): recent Limitless events with 32+ players (top 8) and official
// events (top 16), each with full team sheets. Strings are stored once in "dict" and referenced by index.
// Events lists them with the winner up front; one tap opens the standings with every set.
// Team search (on Top teams) filters every one of those teams by Pokémon, item, move or ability.
// cleanEvents: moved to 05-data-clean.js (R4, Nov 11; shared with the rebuild)
/* evDate, placeTxt, evTeam and tsPool live in 49-event-data.js (shared with the new build, R4 Nov 11) */
let evUi = {open: null, filter: 'all', more: 0, sets: {}};
// one team with its sets: sprites, then (folded) each Pokémon's item, ability, nature and moves
function teamSheetCard(t, ev, key, hl) {
  const open = !!evUi.sets[key], H = x => hl && hl.has(x.toLowerCase()) ? ' class="hl"' : '';
  return `<div class="plan evteam"><div class="ttwho"><div class="pt"><span class="evpl p${Math.min(t.place, 9)}">${t.place ? placeTxt(t.place) : ''}</span> ${t.record ? `<span class="vsub">${esc(t.record)}</span>` : ''}</div>${ev ? `<div class="t2">${esc(ev.name)} · ${evDate(ev.date)} · ${ev.players} players</div>` : ''}</div>
    ${open ? '' : teamGrid(t.mons.map(m => m.n), hl)}
    <div class="ttmeta"><span class="archchips">${archChips(teamPlanLabel(t.mons.map(m => m.n)))}</span></div>
    ${open ? `<div class="evsets">${t.mons.map(m => { const p = byName.get(m.n); return `<div class="evset tyacc" style="${tyv(p)}">${sprite(p, 'evspr')}<div><b${H(p.d)}>${esc(p.d)}</b>${m.i ? ` <span class="t2">@</span> <span${H(m.i)}>${esc(m.i)}</span>` : ''}
      <div class="t2"><span${H(m.a)}>${esc(m.a)}</span>${m.nt ? ' · ' + esc(m.nt) : ''}</div><div class="evmv">${m.mv.map(x => `<span${H(x)}>${esc(x)}</span>`).join('')}</div></div></div>`; }).join('')}</div>` : ''}
    <div class="row evbtns"><button class="btn sm" type="button" data-evload="${esc(key)}">Load team</button><button class="linkbtn" type="button" data-evsets="${esc(key)}" aria-expanded="${open}">${open ? 'Hide sets' : 'Sets'}</button><button class="linkbtn" type="button" data-evvs="${esc(key)}">Practice against</button><button class="linkbtn" type="button" data-cxgo="cur|e:${esc(key)}">Compare</button>${sdBtn('ev:' + key)}</div></div>`; }
// plain words for the data line, when it has the usual shape
function evSourceText(x) { x = String(x || ''); const m = x.match(/Limitless \((\d+)\+ players, last (\d+) days, top (\d+)\)/), o = x.match(/official events \(top (\d+)\)/);
  return m ? `online tournaments with ${m[1]}+ players from the last ${m[2]} days (top ${m[3]})${o ? ` and official events (top ${o[1]})` : ''}` : x; }
function renderEvents() {
  const el = $('evOut'); if (!el) return; const E = META.events;
  /* round words: the counts as labelled number cells; which events count (online player floor, last N days, top cut) is behind "?", unchanged */
  const src = $('evSource'); if (src) { if (!E) src.textContent = ''; else { const on = E.events.filter(e => e.src !== 'official').length, off = E.events.length - on, rule = evSourceText(E.source);
    const cell = (v, l) => `<span class="wdc"><b>${v.toLocaleString('en-US')}</b><small>${l}</small></span>`;
    src.classList.add('wdstats'); src.innerHTML = `<span class="wdrow" role="group" aria-label="Events counted">${cell(E.events.length, 'events')}${off ? cell(on, 'online') + cell(off, 'official') : ''}${typeof tipText === 'function' && rule ? `<span class="wdq">${tipText('evsrc', 'What counts as an event', `${rule[0].toUpperCase() + rule.slice(1)}.`)}</span>` : ''}</span>`; } }
  if (!E) { el.innerHTML = '<div class="empty-note">Tournament results appear here after the next data refresh.</div>'; return; }
  const ev = evUi.open && E.events.find(e => e.id === evUi.open);
  if (ev) {
    el.innerHTML = `<button class="btn sm ghost evback" type="button" data-evback="1">‹ All events</button>
      <div class="evhead"><div><div class="evname">${esc(ev.name)}</div><div class="t2">${evDate(ev.date)} · ${ev.players.toLocaleString('en-US')} players · ${ev.src === 'official' ? 'Official Pokémon event (Victory Road)' : 'Online (Limitless)'} · top ${ev.top.length}</div></div>${ev.src === 'official' ? '<span class="tag evoff">OFFICIAL</span>' : ''}</div>
      ${ev.field.length ? `<div class="evfield"><div class="lbl">Most brought by the whole field${ev.players ? ' ' + basis(ev.players, 'player', 'teams', {pre: '· of'}) : ''}</div><div class="evfl">${ev.field.map(([n, pc]) => { const p = byName.get(n); return `<span class="evfm">${sprite(p, 'tiny')}${esc(p.d)} <b>${pctTxt(pc)}</b></span>`; }).join('')}</div></div>` : ''}
      ${ev.top.map((t, k) => teamSheetCard(t, null, ev.id + '#' + k)).join('')}`;
    return; }
  let list = E.events; if (evUi.filter === 'official') list = list.filter(e => e.src === 'official'); else if (evUi.filter === 'big') list = list.filter(e => e.players >= 100);
  const cap = 12 + evUi.more * 12;
  const seg = `<div class="seg" role="group" aria-label="Which events">${[['all', 'All'], ['official', 'Official'], ['big', '100+ players']].map(([k, t]) => `<button type="button" data-evf="${k}" aria-pressed="${evUi.filter === k}">${t}</button>`).join('')}</div>`;
  el.innerHTML = seg + `<div class="evlist">${list.slice(0, cap).map(e => { const w = e.top[0];
    return `<button type="button" class="evcard" data-evopen="${esc(e.id)}"><div class="evct"><span class="evname">${esc(e.name)}</span>${e.src === 'official' ? '<span class="tag evoff">OFFICIAL</span>' : ''}</div>
      <div class="t2">${evDate(e.date)} · ${e.players.toLocaleString('en-US')} players</div>
      <div class="evwin">${w.mons.map(m => sprH(byName.get(m.n), 'mini')).join('')}</div></button>`; }).join('') || '<div class="empty-note">No events here yet.</div>'}</div>`
    + (list.length > cap ? `<div class="morebar"><button class="btn sm" type="button" data-evmore="1">Show more (${list.length - cap} left)</button></div>` : ''); }
function loadSheet(t) { keepUndo(); S.slots = normSlots(t.mons.map(m => { const p = byName.get(m.n); const mv = m.mv.filter(x => mvByName.has(x)); while (mv.length < 4) mv.push('');
    return {n: m.n, a: p.a.includes(m.a) ? m.a : null, lock: false, ...(mv.some(Boolean) ? {mv: {doubles: mv.slice(0, 4)}} : {}), ...(!p.m && m.i && typeof m.i === 'string' ? {it: {doubles: m.i}} : {})}; }));
  S.format = 'doubles'; S.loadedId = null; render(); setView('build'); toast(`${teamWho(t).split(' · ')[0]}'s team loaded with its moves and items`, true); }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-evopen],[data-evback],[data-evf],[data-evmore],[data-evsets],[data-evload],[data-evvs]'); if (!b) return; const d = b.dataset;
  if (d.evopen) { evUi.open = d.evopen; renderEvents(); try { window.scrollTo({top: 0}); } catch (er) {} return; }
  if (d.evback) { evUi.open = null; renderEvents(); return; }
  if (d.evf) { evUi.filter = d.evf; evUi.more = 0; }
  else if (d.evmore) evUi.more++;
  else if (d.evsets) evUi.sets[d.evsets] = !evUi.sets[d.evsets];
  else if (d.evload || d.evvs) { const x = evTeam(d.evload || d.evvs); if (!x) return;
    if (d.evload) { const sure = ui.evSure && ui.evSure.k === d.evload && Date.now() - ui.evSure.t < 6000; /* kept in ui, so a redraw between taps doesn't reset it */
      if (members().length && !sure) { ui.evSure = {k: d.evload, t: Date.now()}; b.textContent = 'Tap again to replace your team'; return; } ui.evSure = null; loadSheet(x.t); return; }
    S.opp = x.t.mons.map(m => m.n); ui.oppFrom = {who: x.t.player, key: S.opp.slice().sort().join('|')}; persist(); setView('matchup'); toast(`Opponent set: ${teamWho(x.t)}`); return; }
  keepScroll(() => { if (view === 'top') renderTeamSearch(); else if (view === 'auto') renderAutoBuild(); else renderEvents(); }); });

// ---- team search (Top teams) ----
let tsUi = {f: [], more: 0};
let tsTermCache = {v: -1, terms: []};
function tsTerms() { if (tsTermCache.v === metaVersion) return tsTermCache.terms; const m = new Map(), add = (k, v, label) => { const id = k + ':' + v; const x = m.get(id); if (x) x.c++; else m.set(id, {k, v, label, c: 1}); };
  for (const {t} of tsPool()) for (const x of t.mons) { add('mon', x.n, byName.get(x.n).d); if (x.i) add('item', x.i, x.i); if (x.a) add('ability', x.a, x.a); x.mv.forEach(v => add('move', v, v)); }
  tsTermCache = {v: metaVersion, terms: [...m.values()].sort((a, b) => b.c - a.c)}; return tsTermCache.terms; }
function tsMatch(t, f) { return t.mons.some(m => f.k === 'mon' ? m.n === f.v : f.k === 'item' ? m.i === f.v : f.k === 'ability' ? m.a === f.v : m.mv.includes(f.v)); }
function tsSet(fs) { tsUi.f = fs.slice(0, 6); tsUi.more = 0; }
const TS_KIND = {mon: 'Pokémon', item: 'Item', move: 'Move', ability: 'Ability'};
function renderTeamSearch() {
  const box = $('tsBox'), out = $('tsOut'), list = $('ttList'); if (!box || !out) return;
  const pool = tsPool();
  if (!pool.length) { box.innerHTML = ''; out.innerHTML = ''; if (list) list.hidden = false; return; }
  const label = f => f.k === 'mon' ? (byName.get(f.v) || {}).d || f.v : f.v;
  box.innerHTML = `<div class="tsrow"><div class="cb tsin"><input class="field" id="tsIn" placeholder="Search winning teams" aria-label="Search ${pool.length} winning teams by Pokémon, item, move or ability" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Search winning teams"></div></div>
    ${tsUi.f.length ? `<div class="tschips">${tsUi.f.map((f, i) => `<span class="corechip">${f.k === 'mon' ? sprite(byName.get(f.v), 'tiny') : (typeof kindTag === 'function' ? kindTag(f.k, 'tsk') : `<i class="tsk">${TS_KIND[f.k]}</i>`)}${esc(label(f))}<button type="button" data-tsx="${i}" aria-label="Remove">×</button></span>`).join('')}<button type="button" class="linkbtn" data-tsx="*">Clear</button></div>` : ''}`;
  const inp = $('tsIn');
  if (inp) { const run = () => { const q = norm(inp.value); if (!q) { closeMenu(); return; }
      const have = new Set(tsUi.f.map(f => f.k + ':' + f.v));
      const r = tsTerms().filter(x => !have.has(x.k + ':' + x.v) && norm(x.label).includes(q)).sort((a, b) => (norm(b.label).startsWith(q) ? 1 : 0) - (norm(a.label).startsWith(q) ? 1 : 0) || b.c - a.c).slice(0, 8);
      openMenu(inp, r, x => `${x.k === 'mon' ? sprite(byName.get(x.v), 'tiny') : ''}<span class="on">${esc(x.label)}</span>${x.k === 'mon' || typeof kindTag !== 'function' ? `<span class="tag">${TS_KIND[x.k]}</span>` : kindTag(x.k)}<span class="uso">${x.c} team${x.c === 1 ? '' : 's'}</span>`,
        x => { tsUi.f.push({k: x.k, v: x.v}); tsUi.more = 0; renderTeamSearch(); const n = $('tsIn'); if (n) n.focus(); }, 'Nothing in the winning teams matches that.'); };
    inp.addEventListener('input', run); inp.addEventListener('focus', () => { if (inp.value) run(); }); inp.addEventListener('keydown', kb);
    inp.addEventListener('blur', () => setTimeout(() => { if (cbState && cbState.input === inp) closeMenu(); }, 120)); }
  if (!tsUi.f.length) { out.innerHTML = ''; if (list) list.hidden = false; return; }
  if (list) list.hidden = true;
  const hits = pool.filter(x => tsUi.f.every(f => tsMatch(x.t, f))).sort((a, b) => (b.ev.src === 'official') - (a.ev.src === 'official') || a.t.place - b.t.place || (b.ev.date > a.ev.date ? 1 : -1));
  const cap = 8 + tsUi.more * 8, hl = new Set(tsUi.f.map(f => label(f).toLowerCase()));
  hits.slice(0, cap).forEach(x => { if (evUi.sets[x.key] == null && tsUi.f.some(f => f.k !== 'mon')) evUi.sets[x.key] = true; });
  // what the matching teams have in common, to suggest the next filter
  const c = new Map(); hits.forEach(x => new Set(x.t.mons.map(m => m.n)).forEach(n => { if (!tsUi.f.some(f => f.k === 'mon' && f.v === n)) c.set(n, (c.get(n) || 0) + 1); }));
  const mates = [...c].sort((a, b) => b[1] - a[1]).slice(0, 6);
  out.innerHTML = `<div class="tsres"><b>${hits.length}</b> team${hits.length === 1 ? '' : 's'} match${hits.length ? ` · ${hits.filter(x => x.t.place === 1).length} won their event` : ''}</div>
    ${mates.length && hits.length >= 3 ? `<div class="tsmates"><span class="t2">Often with:</span>${mates.map(([n, k]) => `<button type="button" class="corechip add" data-tsadd="${esc(n)}">${sprite(byName.get(n), 'tiny')}${esc(byName.get(n).d)} <b>${Math.round(100 * k / hits.length)}%</b></button>`).join('')}</div>` : ''}
    ${hits.length ? hits.slice(0, cap).map(x => teamSheetCard(x.t, x.ev, x.key, hl)).join('') : '<div class="empty-note">No winning team has all of these. Remove a filter.</div>'}
    ${hits.length > cap ? `<div class="morebar"><button class="btn sm" type="button" data-tsmore="1">Show more (${hits.length - cap} left)</button></div>` : ''}`; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tsx],[data-tsmore],[data-tsadd]'); if (!b) return; const d = b.dataset;
  if (d.tsx === '*') tsUi.f = []; else if (d.tsx != null) tsUi.f.splice(+d.tsx, 1); else if (d.tsmore) tsUi.more++; else if (d.tsadd) tsUi.f.push({k: 'mon', v: d.tsadd});
  if (!d.tsmore) tsUi.more = 0; keepScroll(() => renderTeamSearch()); });
