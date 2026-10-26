// ---------- Team page: lineup banner (Option B) ----------
// The whole six at a glance, the verdict as a badge, and the numbers that matter. Tap a sprite to jump to its card.
const shortHead = h => !h ? 'Keep building' : /keep building/i.test(h) ? 'Keep building' : h;
function teamTitleFor(ms) { const loaded = S.teams.find(t => t.id === S.loadedId); if (loaded) return loaded.name;
  let lb = ''; try { const a = teamArchetype(ms); lb = a && a.label ? a.label : ''; } catch (e) {} return lb || 'Your team'; }
function renderTeamHero(ms) { const el = $('teamHero'); if (!el) return; if (!ms.length) { el.hidden = true; el.innerHTML = ''; return; }
  const v = ui.vsum || {}, lvl = v.lvl || 'mid', stats = [];
  if (v.TS) stats.push([String(v.TS.score), 'Team Score', '']);
  if (v.tr) stats.push([`${v.tr.w}–${v.tr.l}`, 'your record', 'good']);
  if (v.best) stats.push([Math.round(v.best.wr * 100) + '%', v.best.k === 6 ? 'won at events' : 'similar teams won', '']);
  if (v.CK) stats.push([`${v.CK.pass}/${v.CK.n}`, 'checklist', '']);
  if (stats.length < 3) stats.push([v.excess ? '+' + v.excess : '0', v.excess ? 'extra weaknesses' : 'extra weaknesses', v.excess ? 'warn' : '']);
  const mons = S.slots.map((s, i) => ({p: byName.get(s.n), i})).filter(x => x.p);
  el.className = 'thero ' + lvl; el.hidden = false;
  el.innerHTML = `<div class="thtop"><span class="thk">Your team · ${mons.length}/6</span><span class="thbadge">${esc(shortHead(v.head))}</span></div>
    <div class="thname${teamTitleFor(ms).length > 20 ? ' long' : ''}" role="heading" aria-level="3">${esc(teamTitleFor(ms))}</div>
    <div class="thline">${mons.map(x => `<button type="button" class="thmon" data-tjump="${x.i}" title="${esc(x.p.d)}" aria-label="Jump to ${esc(x.p.d)}">${sprite(x.p, 'thspr') || `<span class="thdot" style="--tc:${TC[x.p.t[0]]}"></span>`}</button>`).join('')}</div>
    <div class="thfloor" aria-hidden="true"></div>
    <div class="thstats">${stats.slice(0, 3).map(([b, l, c]) => `<span class="ths ${c}"><b>${b}</b>${l}${l === 'Team Score' ? (typeof tip === 'function' ? tip('teamscore') : '') : l === 'checklist' ? (typeof tip === 'function' ? tip('checklist') : '') : ''}</span>`).join('')}</div>`; }
document.addEventListener('click', e => { const t = e.target; if (!t || !t.closest) return;
  const tv = t.closest('[data-tview]'); if (tv) { ui.tview = tv.dataset.tview === 'grid' ? 'grid' : 'full'; LS.set('cc2.tview', ui.tview); renderSlots(); return; }
  const j = t.closest('[data-tjump]'); const g = !j && ui.tview === 'grid' && t.closest('.slot.tcard') && !t.closest('button,input,select,a,summary') ? t.closest('.slot.tcard') : null;
  if (j || g) { const i = j ? j.dataset.tjump : g.dataset.tcard; if (ui.tview === 'grid') { ui.tview = 'full'; LS.set('cc2.tview', 'full'); renderSlots(); }
    const el = $('slot' + i); if (el) { try { el.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (err) {} el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 900); } } });

