// ---------- Events (tournament pages) and team search ----------
// meta/events (out/events.json from events.mjs): recent Limitless events with 32+ players (top 8) and official RK9
// events (top 16), each with full team sheets. Strings are stored once in "dict" and referenced by index.
// Events lists them with the winner up front; one tap opens the standings with every set.
// Team search (on Top teams) filters every one of those teams by Pokémon, item, move or ability.
function cleanEvents(v) { try {
  if (!v || typeof v !== 'object' || !Array.isArray(v.events) || !Array.isArray(v.dict)) return null;
  const D = v.dict.map(x => typeof x === 'string' ? x.slice(0, 60) : ''), g = i => D[i] || '';
  const sheet = s => { if (!Array.isArray(s)) return null; const n = g(s[0]); if (!byName.has(n)) return null;
    return {n, i: g(s[1]), a: g(s[2]), nt: g(s[3]), mv: (Array.isArray(s[4]) ? s[4] : []).slice(0, 4).map(g).filter(Boolean)}; };
  const events = v.events.slice(0, 200).map(e => { if (!e || !Array.isArray(e.top)) return null;
    const top = e.top.slice(0, 16).map(t => { if (!Array.isArray(t) || !Array.isArray(t[3])) return null; const mons = t[3].map(sheet).filter(Boolean); if (mons.length !== 6) return null;
      return {player: str(t[0], 60), place: +t[1] || 0, record: str(t[2], 20), mons}; }).filter(Boolean);
    if (!top.length) return null;
    return {id: str(e.id, 120), name: str(e.name, 140), date: str(e.date, 10), players: +e.players || 0, src: e.src === 'official' ? 'official' : 'limitless', top,
      field: (Array.isArray(e.field) ? e.field : []).map(f => Array.isArray(f) ? [g(f[0]), +f[1] || 0] : null).filter(f => f && byName.has(f[0])).slice(0, 8)}; }).filter(Boolean);
  return events.length ? {source: str(v.source, 200), updated: str(v.updated, 40), events} : null; } catch (e) { return null; } }
const evDate = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return d; } };
const placeTxt = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th';
let evUi = {open: null, filter: 'all', more: 0, sets: {}};
// one team with its sets: sprites, then (folded) each Pokémon's item, ability, nature and moves
function teamSheetCard(t, ev, key, hl) {
  const open = !!evUi.sets[key], H = x => hl && hl.has(x.toLowerCase()) ? ' class="hl"' : '';
  return `<div class="plan evteam"><div class="ttwho"><div class="pt"><span class="evpl p${Math.min(t.place, 9)}">${t.place ? placeTxt(t.place) : ''}</span> ${esc(t.player)} ${t.record ? `<span class="vsub">${esc(t.record)}</span>` : ''}</div>${ev ? `<div class="t2">${esc(ev.name)} · ${evDate(ev.date)} · ${ev.players} players</div>` : ''}</div>
    ${open ? '' : teamGrid(t.mons.map(m => m.n), hl)}
    <div class="ttmeta"><span class="archchips">${archChips(teamPlanLabel(t.mons.map(m => m.n)))}</span></div>
    ${open ? `<div class="evsets">${t.mons.map(m => { const p = byName.get(m.n); return `<div class="evset">${sprite(p, 'evspr')}<div><b${H(p.d)}>${esc(p.d)}</b>${m.i ? ` <span class="t2">@</span> <span${H(m.i)}>${esc(m.i)}</span>` : ''}
      <div class="t2"><span${H(m.a)}>${esc(m.a)}</span>${m.nt ? ' · ' + esc(m.nt) : ''}</div><div class="evmv">${m.mv.map(x => `<span${H(x)}>${esc(x)}</span>`).join('')}</div></div></div>`; }).join('')}</div>` : ''}
    <div class="row evbtns"><button class="btn sm" type="button" data-evload="${esc(key)}">Load team</button><button class="linkbtn" type="button" data-evsets="${esc(key)}" aria-expanded="${open}">${open ? 'Hide sets' : 'Sets'}</button><button class="linkbtn" type="button" data-evvs="${esc(key)}">Practice against</button></div></div>`; }
function evTeam(key) { const E = META.events; if (!E) return null; const [id, k] = key.split('#'); const ev = E.events.find(e => e.id === id); return ev && ev.top[+k] ? {ev, t: ev.top[+k]} : null; }
// plain words for the data line, when it has the usual shape
function evSourceText(x) { x = String(x || ''); const m = x.match(/Limitless \((\d+)\+ players, last (\d+) days, top (\d+)\)/), o = x.match(/official events \(top (\d+)\)/);
  return m ? `online events with ${m[1]}+ players from the last ${m[2]} days (top ${m[3]})${o ? ` and official events (top ${o[1]})` : ''}` : x; }
function renderEvents() {
  const el = $('evOut'); if (!el) return; const E = META.events;
  const src = $('evSource'); if (src) src.textContent = E ? `${E.events.length} events · ${evSourceText(E.source)}` : '';
  if (!E) { el.innerHTML = '<div class="empty-note">Tournament results appear here after the next data refresh.</div>'; return; }
  const ev = evUi.open && E.events.find(e => e.id === evUi.open);
  if (ev) {
    el.innerHTML = `<button class="btn sm ghost evback" type="button" data-evback="1">‹ All events</button>
      <div class="evhead"><div><div class="evname">${esc(ev.name)}</div><div class="t2">${evDate(ev.date)} · ${ev.players.toLocaleString('en-US')} players · ${ev.src === 'official' ? 'Official Pokémon event' : 'Online (Limitless)'} · top ${ev.top.length}</div></div>${ev.src === 'official' ? '<span class="tag evoff">OFFICIAL</span>' : ''}</div>
      ${ev.field.length ? `<div class="evfield"><div class="lbl">Most brought by the whole field</div><div class="evfl">${ev.field.map(([n, pc]) => { const p = byName.get(n); return `<span class="evfm">${sprite(p, 'tiny')}${esc(p.d)} <b>${pc}%</b></span>`; }).join('')}</div></div>` : ''}
      ${ev.top.map((t, k) => teamSheetCard(t, null, ev.id + '#' + k)).join('')}`;
    return; }
  let list = E.events; if (evUi.filter === 'official') list = list.filter(e => e.src === 'official'); else if (evUi.filter === 'big') list = list.filter(e => e.players >= 100);
  const cap = 12 + evUi.more * 12;
  const seg = `<div class="seg" role="group" aria-label="Which events">${[['all', 'All'], ['official', 'Official'], ['big', '100+ players']].map(([k, t]) => `<button type="button" data-evf="${k}" aria-pressed="${evUi.filter === k}">${t}</button>`).join('')}</div>`;
  el.innerHTML = seg + `<div class="evlist">${list.slice(0, cap).map(e => { const w = e.top[0];
    return `<button type="button" class="evcard" data-evopen="${esc(e.id)}"><div class="evct"><span class="evname">${esc(e.name)}</span>${e.src === 'official' ? '<span class="tag evoff">OFFICIAL</span>' : ''}</div>
      <div class="t2">${evDate(e.date)} · ${e.players.toLocaleString('en-US')} players · won by <b>${esc(w.player)}</b></div>
      <div class="evwin">${w.mons.map(m => sprite(byName.get(m.n), 'mini')).join('')}</div></button>`; }).join('') || '<div class="empty-note">No events here yet.</div>'}</div>`
    + (list.length > cap ? `<div class="morebar"><button class="btn sm" type="button" data-evmore="1">Show more (${list.length - cap} left)</button></div>` : ''); }
function loadSheet(t) { keepUndo(); S.slots = normSlots(t.mons.map(m => { const p = byName.get(m.n); const mv = m.mv.filter(x => mvByName.has(x)); while (mv.length < 4) mv.push('');
    return {n: m.n, a: p.a.includes(m.a) ? m.a : null, lock: false, ...(mv.some(Boolean) ? {mv: {doubles: mv.slice(0, 4)}} : {}), ...(!p.m && m.i && typeof m.i === 'string' ? {it: {doubles: m.i}} : {})}; }));
  S.format = 'doubles'; S.loadedId = null; render(); setView('build'); toast(`Loaded ${t.player}'s team with their moves and items`, true); }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-evopen],[data-evback],[data-evf],[data-evmore],[data-evsets],[data-evload],[data-evvs]'); if (!b) return; const d = b.dataset;
  if (d.evopen) { evUi.open = d.evopen; renderEvents(); try { window.scrollTo({top: 0}); } catch (er) {} return; }
  if (d.evback) { evUi.open = null; renderEvents(); return; }
  if (d.evf) { evUi.filter = d.evf; evUi.more = 0; }
  else if (d.evmore) evUi.more++;
  else if (d.evsets) evUi.sets[d.evsets] = !evUi.sets[d.evsets];
  else if (d.evload || d.evvs) { const x = evTeam(d.evload || d.evvs); if (!x) return;
    if (d.evload) { if (members().length && b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Tap again to replace your team'; return; } loadSheet(x.t); return; }
    S.opp = x.t.mons.map(m => m.n); persist(); setView('matchup'); toast(`${x.t.player}'s team is your opponent`); return; }
  keepScroll(() => { if (view === 'top') renderTeamSearch(); else if (view === 'auto') renderAutoBuild(); else renderEvents(); }); });

// ---- team search (Top teams) ----
let tsUi = {f: [], more: 0};
function tsPool() { const E = META.events; if (!E) return []; const out = [];
  E.events.forEach(ev => ev.top.forEach((t, k) => out.push({ev, t, key: ev.id + '#' + k}))); return out; }
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
  box.innerHTML = `<div class="tsrow"><div class="cb tsin"><input class="field" id="tsIn" placeholder="Search ${pool.length} winning teams: Pokémon, item, move or ability" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Search winning teams"></div></div>
    ${tsUi.f.length ? `<div class="tschips">${tsUi.f.map((f, i) => `<span class="corechip">${f.k === 'mon' ? sprite(byName.get(f.v), 'tiny') : `<i class="tsk">${TS_KIND[f.k]}</i>`}${esc(label(f))}<button type="button" data-tsx="${i}" aria-label="Remove">×</button></span>`).join('')}<button type="button" class="linkbtn" data-tsx="*">Clear</button></div>` : ''}`;
  const inp = $('tsIn');
  if (inp) { const run = () => { const q = norm(inp.value); if (!q) { closeMenu(); return; }
      const have = new Set(tsUi.f.map(f => f.k + ':' + f.v));
      const r = tsTerms().filter(x => !have.has(x.k + ':' + x.v) && norm(x.label).includes(q)).sort((a, b) => (norm(b.label).startsWith(q) ? 1 : 0) - (norm(a.label).startsWith(q) ? 1 : 0) || b.c - a.c).slice(0, 8);
      openMenu(inp, r, x => `${x.k === 'mon' ? sprite(byName.get(x.v), 'tiny') : ''}<span class="on">${esc(x.label)}</span><span class="tag">${TS_KIND[x.k].toUpperCase()}</span><span class="uso">${x.c} team${x.c === 1 ? '' : 's'}</span>`,
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
