// ---------- Winning cores: pairs, trios and full teams from real tournament results ----------
// From the results document (RES): every pair and trio seen on enough tournament teams, and the exact six-Pokémon
// lists ("proven teams"). Sorted by win rate (pulled toward average when there are few entries) or by how often they
// show up. Each row says what the core does, and can be added to your team or searched in Top teams.
let coreUi = {kind: 'pairs', sort: 'win', mon: null, more: 0, confirm: null};
const CORE_MIN = {pairs: 60, trios: 0, teams: 3};
function coreRows() {
  if (!RES) return [];
  const base = +RES.base || .5, tot = +RES.teams || 0, k = 40, adj = (wr, n) => (wr * n + base * k) / (n + k);
  let rows = [];
  if (coreUi.kind === 'pairs') rows = Object.entries(RES.pairs || {}).map(([key, v]) => ({ns: key.split('|'), n: +v[0], wr: +v[1]})).filter(x => x.n >= CORE_MIN.pairs);
  else if (coreUi.kind === 'trios') rows = (RES.cores || []).map(c => ({ns: c.slice(0, 3), n: +c[3], wr: +c[4]})).filter(x => x.n >= (RES.minCore || 6));
  else rows = (RES.proven || []).map(x => ({ns: x[0], n: +x[1], wr: +x[2]})).filter(x => Array.isArray(x.ns) && x.n >= CORE_MIN.teams);
  rows = rows.filter(x => x.ns.every(n => byName.get(n)));
  if (coreUi.mon) { const b = (byName.get(coreUi.mon) || {}).b; rows = rows.filter(x => x.ns.some(n => n === coreUi.mon || (byName.get(n) || {}).b === b)); }
  rows.forEach(x => { x.score = adj(x.wr, x.n); x.use = tot ? 100 * x.n / tot : 0; x.d = x.wr - base; });
  rows.sort((a, b) => coreUi.sort === 'use' ? b.n - a.n : b.score - a.score);
  return rows; }
let coreTagCache = new Map();
function coreTags(ns) { const key = metaVersion + '|' + ns.join(','); if (coreTagCache.has(key)) return coreTagCache.get(key);
  let out = []; try { withFormat('doubles', () => { const ms = ns.map(n => abMember(byName.get(n))), r = teamRoles(ms);
    for (const a of r.arch) if (a.active) out.push(a.name);
    const tr = ms.filter(m => relMove(m, ROLE.tr)[0] >= .5), tw = ms.filter(m => relMove(m, ROLE.tw)[0] >= .5);
    if (tr.length) out.push('Trick Room'); if (tw.length) out.push('Tailwind'); else if (r.speed.length && !tr.length) out.push('Speed control');
    if (r.fake.length) out.push('Fake Out'); if (r.redirect.length) out.push('Redirection'); if (r.intim.length) out.push('Intimidate');
    if (ms.filter(m => m.mega).length) out.push('Mega'); }); } catch (e) {}
  out = [...new Set(out)].slice(0, 4); if (coreTagCache.size > 400) coreTagCache.clear(); coreTagCache.set(key, out); return out; }
function renderCores() {
  const el = $('coreOut'); if (!el) return;
  if (!RES) { el.innerHTML = '<div class="empty-note">Cores appear once tournament results have loaded.</div>'; return; }
  const rows = coreRows(), cap = 25 + coreUi.more * 25, base = +RES.base || .5;
  const seg = (k, opts) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button type="button" data-core${k}="${v}" aria-pressed="${coreUi[k] === v}">${t}</button>`).join('')}</div>`;
  const mon = coreUi.mon && byName.get(coreUi.mon);
  const ctl = `<div class="corectl">${seg('kind', [['pairs', 'Pairs'], ['trios', 'Trios'], ['teams', 'Full teams']])}${seg('sort', [['win', 'Best win rate'], ['use', 'Most used']])}
    <div class="corefind">${mon ? `<span class="corechip">${sprite(mon, 'tiny')}${esc(mon.d)}<button type="button" data-corex="1" aria-label="Clear">×</button></span>` : '<div class="cb"><input class="field" id="coreMonIn" placeholder="With a Pokémon…" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Only cores with this Pokémon"></div>'}</div></div>`;
  const what = coreUi.kind === 'pairs' ? `two Pokémon on the same team, ${CORE_MIN.pairs}+ teams` : coreUi.kind === 'trios' ? `three Pokémon on the same team, ${RES.minCore || 6}+ teams` : `the exact six, ${CORE_MIN.teams}+ entries`;
  const intro = `<p class="t2 coreintro">A core is a group of Pokémon that cover each other: one sets up, protects or speeds the other, or they handle each other's bad matchups. These are ${what}, from ${(+RES.teams || 0).toLocaleString('en-US')} tournament teams. Average team wins ${(100 * base).toFixed(1)}% of games. ${coreUi.sort === 'win' ? 'Ranked by win rate, with small samples pulled toward average.' : ''}</p>`;
  if (!rows.length) { el.innerHTML = ctl + intro + '<div class="empty-note">No cores match. Try another Pokémon.</div>'; bindCoreIn(); return; }
  const mx = Math.max(.08, ...rows.slice(0, cap).map(x => Math.abs(x.d)));
  const list = rows.slice(0, cap).map((x, i) => { const key = x.ns.join('|'), tags = coreTags(x.ns), ps = x.ns.map(n => byName.get(n));
    const conf = coreUi.confirm === key;
    return `<div class="corerow${x.ns.length > 3 ? ' six' : ''}"><span class="corerk">${i + 1}</span>
      <div class="coremons">${ps.map(p => `<span class="coremon">${sprite(p, 'coresp')}<b>${esc(p.d)}</b></span>`).join('')}</div>
      <div class="corestat"><div class="corewr"><b>${(100 * x.wr).toFixed(1)}%</b><span class="${x.d >= 0 ? 'up' : 'dn'}">${x.d >= 0 ? '+' : ''}${(100 * x.d).toFixed(1)}</span></div>
        <div class="corebar" aria-hidden="true"><i class="${x.d >= 0 ? 'up' : 'dn'}" style="${x.d >= 0 ? 'left:50%' : 'right:50%'};width:${Math.min(50, 50 * Math.abs(x.d) / mx).toFixed(1)}%"></i></div>
        <div class="t2">${x.n.toLocaleString('en-US')} ${x.ns.length > 3 ? 'entr' + (x.n === 1 ? 'y' : 'ies') : 'teams'} · ${x.use >= .1 ? x.use.toFixed(1) : '<0.1'}% of teams</div></div>
      ${tags.length ? `<div class="coretags">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="row corebtns">${conf ? `<span class="inline-confirm" style="color:var(--ink)">Replace your team?</span><button class="btn sm primary" type="button" data-coreuse="${esc(key)}" data-sure="1">Replace</button><button class="btn sm" type="button" data-corecx="1">Cancel</button>`
        : `<button class="btn sm" type="button" data-coreuse="${esc(key)}">${x.ns.length > 3 ? 'Load team' : 'Add to my team'}</button>${x.ns.length <= 3 ? `<button class="btn sm ghost" type="button" data-corefind="${esc(key)}">Teams with it</button>` : `<button class="btn sm ghost" type="button" data-corepractice="${esc(key)}">Practice against</button>`}`}</div></div>`; }).join('');
  el.innerHTML = ctl + intro + `<div class="corelist">${list}</div>` + (rows.length > cap ? `<div class="morebar"><button class="btn sm" type="button" data-coremore="1">Show more (${rows.length - cap} left)</button></div>` : '');
  bindCoreIn(); }
function bindCoreIn() { const i = $('coreMonIn'); if (i) bindMonInput(i, p => { coreUi.mon = p.n; coreUi.more = 0; renderCores(); }); }
// a core joins your team: it goes first, your other Pokémon keep their places after it, extras drop off the end
function useCore(ns, sure) {
  const cur = S.slots.filter(s => byName.get(s.n)), have = new Set(cur.map(s => s.n));
  if (ns.length > 3) { if (cur.length && !sure) return false; S.slots = normSlots(ns.map(n => ({n, a: null, lock: false}))); S.format = 'doubles'; S.loadedId = null; render(); setView('build'); toast('Loaded the team (doubles)'); return true; }
  const keep = cur.filter(s => !ns.includes(s.n) && !ns.some(n => (byName.get(n) || {}).b === (byName.get(s.n) || {}).b));
  const next = [...ns.map(n => cur.find(s => s.n === n) || {n, a: null, lock: false}), ...keep];
  if (next.length > 6 && !sure) return false;
  const dropped = next.slice(6).map(s => (byName.get(s.n) || {}).d).filter(Boolean);
  S.slots = normSlots(next.slice(0, 6)); S.format = 'doubles'; render(); setView('build');
  toast(`Added ${ns.filter(n => !have.has(n)).map(n => byName.get(n).d).join(' + ') || 'the core'}${dropped.length ? ' · removed ' + dropped.join(', ') : ''}`); return true; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-corekind],[data-coresort],[data-corex],[data-coremore],[data-coreuse],[data-corecx],[data-corefind],[data-corepractice]'); if (!b) return; const d = b.dataset;
  if (d.corekind) { coreUi.kind = d.corekind; coreUi.more = 0; coreUi.confirm = null; }
  else if (d.coresort) { coreUi.sort = d.coresort; coreUi.more = 0; }
  else if (d.corex) { coreUi.mon = null; coreUi.more = 0; }
  else if (d.coremore) coreUi.more++;
  else if (d.corecx) coreUi.confirm = null;
  else if (d.coreuse) { const ns = d.coreuse.split('|'); if (useCore(ns, !!d.sure)) { coreUi.confirm = null; return; } coreUi.confirm = d.coreuse; }
  else if (d.corefind) { if (typeof tsSet === 'function') { tsSet(d.corefind.split('|').map(n => ({k: 'mon', v: n}))); setView('top'); } return; }
  else if (d.corepractice) { S.opp = d.corepractice.split('|').slice(0, 6); while (S.opp.length < 6) S.opp.push(''); persist(); setView('battle'); toast('Loaded as your opponent'); return; }
  keepScroll(() => renderCores()); });
