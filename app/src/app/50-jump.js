// ---------- Jump to anything: one search box for every tool, Pokémon and saved team ----------
// Opens with Ctrl+K (Cmd+K on Mac), the "/" key, or the search button in the header. Arrows move, Enter opens, Esc closes.
const JUMP_TOOLS = [['home', 'Home', 'Start page'], ['build', 'My team', 'Your six, Team Score, fix plans'], ['auto', 'Build for me', 'A winning team from your box'],
  ['coverage', 'Best additions', 'Pokémon that raise your Team Score'], ['matchup', 'Battle mode', 'Their six in, your four and leads out'], ['speed', 'Speed tiers', 'Who moves first'],
  ['calc', 'Damage calc', 'Exact damage rolls'], ['gauntlet', 'Gauntlet', 'Your team against the top 20 teams'], ['ratings', 'Ratings', 'Every Pokémon on one tier board'],
  ['meta', 'Meta rankings', 'Usage and sets by source'], ['top', 'Teams', 'Search winning teams'], ['events', 'Events', 'Recent tournaments and top cuts'],
  ['cores', 'Winning cores', 'Pairs and trios that win most'], ['sets', 'Popular sets', 'Moves, items, natures'], ['arch', 'Archetypes', 'How to beat Trick Room, rain, sun…'],
  ['types', 'Type chart', 'What hits what'], ['teams', 'Saved teams', 'Your saved teams'], ['box', 'My box', 'The Pokémon you own']];
let jumpSel = 0, jumpList = [];
function jumpItems(q) { const k = norm(q || ''), out = [];
  const hit = (s) => !k || norm(s).includes(k);
  for (const [v, t, d] of JUMP_TOOLS) if (document.querySelector(`[data-pane="${v}"]`) && (hit(t) || hit(d))) out.push({kind: 'Tool', label: t, sub: d, go: () => setView(v)});
  for (const t of S.teams || []) if (hit(t.name)) out.push({kind: 'Saved team', label: t.name, sub: t.slots.map(s => (byName.get(s.n) || {}).d).filter(Boolean).join(', '), go: () => jumpClick({load: t.id})});
  if (k) { const mons = ROSTER.filter(p => p.k.includes(k) || p.tok.some(x => x.startsWith(k))).sort((a, b) => (norm(a.d).startsWith(k) ? 0 : 1) - (norm(b.d).startsWith(k) ? 0 : 1) || rating(b).total - rating(a).total).slice(0, 8);
    for (const p of mons) out.push({kind: 'Pokémon', label: p.d, sub: `Rating ${rating(p).total} · ${p.t.join('/')}`, p, go: () => { setView('ratings'); setTimeout(() => lairSheet(p.n), 60); }}); }
  // whole name starts with it, then any word starts with it, then anything else
  const rank = x => norm(x.label).startsWith(k) ? 0 : x.label.split(/[\s()-]+/).some(w => norm(w).startsWith(k)) ? 1 : 2;
  return k ? out.sort((a, b) => rank(a) - rank(b)).slice(0, 14) : out.slice(0, 14); }
// run an existing button's action without duplicating its code
function jumpClick(data) { const b = document.createElement('button'); b.type = 'button'; b.hidden = true; for (const [k, v] of Object.entries(data)) b.dataset[k] = v; document.body.appendChild(b); b.click(); b.remove(); }
function jumpRender() { const el = $('jumpList'); if (!el) return; jumpList = jumpItems(($('jumpIn') || {}).value); jumpSel = Math.min(jumpSel, Math.max(0, jumpList.length - 1));
  el.innerHTML = jumpList.length ? jumpList.map((x, i) => `<li role="option" id="jo${i}" aria-selected="${i === jumpSel}" data-jo="${i}">${x.p ? sprite(x.p, 'mini') || '' : ''}<span class="jl"><b>${esc(x.label)}</b><span>${esc(x.sub || '')}</span></span><span class="jk">${x.kind}</span></li>`).join('')
    : '<li class="jnone">Nothing matches. Try a Pokémon, a tool like "speed", or a saved team.</li>';
  const inp = $('jumpIn'); if (inp) inp.setAttribute('aria-activedescendant', jumpList.length ? 'jo' + jumpSel : ''); const cur = $('jo' + jumpSel); if (cur && cur.scrollIntoView) cur.scrollIntoView({block: 'nearest'}); }
function jumpOpen() { let w = $('jump'); if (!w) { w = document.createElement('div'); w.id = 'jump'; w.className = 'jump'; w.hidden = true;
    w.innerHTML = `<div class="jbox" role="dialog" aria-modal="true" aria-label="Jump to"><input id="jumpIn" class="field" type="search" placeholder="Search Pokémon, tools or saved teams" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="jumpList"><ul id="jumpList" role="listbox"></ul><div class="jhint">↑ ↓ to move · Enter to open · Esc to close</div></div>`;
    document.body.appendChild(w); w.addEventListener('click', e => { if (e.target === w) jumpClose(); const li = e.target.closest && e.target.closest('[data-jo]'); if (li) jumpGo(+li.dataset.jo); });
    $('jumpIn').addEventListener('input', () => { jumpSel = 0; jumpRender(); }); }
  w.hidden = false; $('jumpIn').value = ''; jumpSel = 0; jumpRender(); $('jumpIn').focus(); }
function jumpClose() { const w = $('jump'); if (w) w.hidden = true; }
function jumpGo(i) { const x = jumpList[i]; if (!x) return; jumpClose(); x.go(); }
document.addEventListener('keydown', e => { const w = $('jump'), open = w && !w.hidden, t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); open ? jumpClose() : jumpOpen(); return; }
  if (e.key === '/' && !typing && !open) { e.preventDefault(); jumpOpen(); return; }
  if (!open) return;
  if (e.key === 'Escape') { e.preventDefault(); jumpClose(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); jumpSel = Math.min(jumpList.length - 1, jumpSel + 1); jumpRender(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); jumpSel = Math.max(0, jumpSel - 1); jumpRender(); }
  else if (e.key === 'Enter') { e.preventDefault(); jumpGo(jumpSel); } });
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-jumpbtn]'); if (b) jumpOpen(); });
