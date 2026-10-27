// ---------- Sleepers: Pokémon that win far more than their popularity suggests ----------
// The "same players test" (pilot.mjs, shipped in the win model's daily file): each player's games WITH a Pokémon against
// their own games WITHOUT it in the same 3-week window, weighted so no single heavy player dominates (paired, Oct 28; the
// first version pooled all games and credited Annihilape with a gap that disappears once time and volume are paired).
// A sleeper passes every check: rated 65+, at least an even record with it (50%+ in those paired windows), a clear gap
// over the same players' other games (3+ points, shrunk for small samples), 300+ games and 100+ players behind it, and
// still on fewer than 8% of tournament teams.
function pilotFor(p) { const P = META.model && META.model.pilot, v = P && P[p.n]; if (!Array.isArray(v) || v.length < 5) return null;
  const [g, w, go, wo, players] = v.map(Number); if (![g, w, go, wo, players].every(isFinite)) return null;
  return {g, w, go, wo, players, d: +(w - wo).toFixed(1), dShrunk: (w - wo) * g / (g + 500)}; }
let sleeperCache = {key: null, list: []};
function sleepers() { const key = metaVersion + '|' + ui.metaSrc; if (sleeperCache.key === key) return sleeperCache.list;
  const list = [];
  for (const p of ROSTER) { const pt = pilotFor(p); if (!pt) continue; const r = rating(p), use = r.src && r.src.tour ? +r.src.tour[0] : 0;
    if (r.total >= 65 && pt.w >= 50 && pt.dShrunk >= 3 * 300 / 800 && pt.d >= 3 && pt.g >= 300 && pt.players >= 100 && use < 8) list.push({p, r, pt, use}); }
  list.sort((a, b) => b.r.total - a.r.total || b.pt.d - a.pt.d);
  sleeperCache = {key, list}; return list; }
function sleeperCard(x, compact) { const {p, r, pt, use} = x;
  return `<div class="slcard"><button type="button" class="slhead" data-lt="${esc(p.n)}">${sprite(p, 'mini') || ''}<span class="slname"><b>${esc(p.d)}</b><span class="vsub">★ ${r.total} · on ${use < 1 ? 'under 1' : use.toFixed(1)}% of teams</span></span></button>
    <div class="slstat"><span><b>${pt.w}%</b> wins with it</span><span><b>${pt.wo}%</b> same players without</span>${compact ? '' : `<span class="vsub">${pt.players.toLocaleString()} players · ${pt.g.toLocaleString()} games</span>`}</div>
    <div class="row"><button type="button" class="btn sm primary" data-abaround="${esc(p.n)}">Build around it</button>${compact ? '' : `<button type="button" class="linkbtn" data-lt="${esc(p.n)}">Full breakdown</button>`}</div></div>`; }
function sleepersSection(where) { const L = sleepers();
  // the section stays even when nothing passes, so it never silently disappears
  if (!L.length) return (META.model && META.model.pilot) ? `<div class="hsec sleepers"><div class="hsh"><h3>Sleepers</h3></div><p class="t2">No Pokémon passes the sleeper checks right now: none wins clearly more for the same players, in the same weeks, than their other teams do, with enough games behind it. This updates every morning.</p></div>` : '';
  const n = where === 'home' ? 3 : 8;
  return `<div class="hsec sleepers"><div class="hsh"><h3>Sleepers</h3>${where === 'home' ? '<button type="button" class="hlink" data-view="ratings">All ratings ›</button>' : ''}</div>
    <p class="t2">They win more than their popularity suggests, and the edge holds up when the same players switch: in the same weeks, those players win less with their other teams. That points to the Pokémon, though it can't rule out everything (like which events people bring it to). Few opponents will have prepared for them.</p>
    <div class="slgrid">${L.slice(0, n).map(x => sleeperCard(x, where === 'home')).join('')}</div></div>`; }
// "Build around it": Build for me with this Pokémon locked into every team
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-abaround],[data-abaroundx]'); if (!b) return;
  if (b.dataset.abaroundx) { ui.abLock = null; runAutoBuild(); return; }
  const p = byName.get(b.dataset.abaround); if (!p) return; ui.abLock = p.n; if (!inBox(p)) ui.abSrc = 'all';
  const sh = $('lairSheet'); if (sh) sh.hidden = true; setView('auto'); runAutoBuild(); });
