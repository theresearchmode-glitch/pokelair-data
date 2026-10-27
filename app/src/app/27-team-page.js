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
  const mons = S.slots.map((s, i) => ({p: byName.get(s.n), i})).filter(x => x.p);
  el.className = 'thero ' + lvl; el.hidden = false;
  el.innerHTML = `<div class="thtop"><span class="thk">Your team · ${mons.length}/6</span><span class="thbadge">${esc(shortHead(v.head))}</span></div>
    <div class="thname${teamTitleFor(ms).length > 20 ? ' long' : ''}" role="heading" aria-level="3">${esc(teamTitleFor(ms))}</div>
    <div class="thline">${mons.map(x => `<button type="button" class="thmon" data-tjump="${x.i}" title="${esc(x.p.d)}" aria-label="Jump to ${esc(x.p.d)}">${sprite(x.p, 'thspr') || `<span class="thdot" style="--tc:${TC[x.p.t[0]]}"></span>`}</button>`).join('')}</div>
    <div class="thfloor" aria-hidden="true"></div>
    <div class="thstats">${stats.slice(0, 3).map(([b, l, c]) => `<span class="ths ${c}"><b>${b}</b>${l}${l === 'Team Score' ? (typeof tip === 'function' ? tip('teamscore') : '') : l === 'checklist' ? (typeof tip === 'function' ? tip('checklist') : '') : ''}</span>`).join('')}</div>
    ${scoreNote(v)}${tsBreakHtml(ms)}`; }
// When the checklist and the Team Score seem to disagree, say why in one line.
function scoreNote(v) { const ts = v.TS, ck = v.CK; if (!ts || !ck || !ck.full) return '';
  if (ck.pass >= ck.n - 1 && ts.score < 50) return `<p class="thnote">It has the basics winning teams have (the checklist), but the Team Score measures strength: these six, together, have won less often than most tournament teams. "What's behind the score" shows who's holding it back.</p>`;
  if (ck.pass <= ck.n - 3 && ts.score >= 75) return `<p class="thnote">Strong Pokémon that win together, but it misses ${ck.n - ck.pass} things most winning teams have. The checklist shows which.</p>`;
  return ''; }
// Each member's share of the Team Score, as a small bar chart that folds open.
function tsBreakHtml(ms) { let b = null; try { b = tsBreakdown(ms); } catch (e) { b = null; } if (!b) return '';
  const mx = Math.max(4, ...b.rows.map(r => Math.abs(r.d))), rows = b.rows.slice().sort((x, y) => y.d - x.d);
  const cuts = [...b.miss.map(x => x.replace(/^no /, 'No ')), b.untried ? `Untried mix: only ${b.tested} of its 15 pairs were brought together on 15+ tournament teams` : ''].filter(Boolean);
  return `<details class="tsbrk"${ui.tsbrk ? ' open' : ''}><summary>What's behind the score</summary>
    <p class="t2">Points each Pokémon adds or costs compared with an average tournament pick in its place.</p>
    <div class="tsbrows">${rows.map(r => `<div class="tsbr"><span class="tsbn">${esc(r.m.p.d)}</span><span class="tsbbar"><i class="${r.d >= 0 ? 'up' : 'dn'}" style="--w:${Math.round(Math.abs(r.d) / mx * 50)}%"></i></span><b class="${r.d > 0 ? 'up' : r.d < 0 ? 'dn' : ''}">${r.d > 0 ? '+' : r.d < 0 ? '−' : '±'}${Math.abs(r.d)}</b></div>`).join('')}</div>
    ${b.cut ? `<p class="t2 tsbcut"><b>−${b.cut}</b> taken off: ${esc(cuts.join('; ') || 'checks most winning teams pass')}.</p>` : ''}</details>`; }
document.addEventListener('toggle', e => { const d = e.target; if (d && d.classList && d.classList.contains('tsbrk')) ui.tsbrk = d.open; }, true);
document.addEventListener('click', e => { const t = e.target; if (!t || !t.closest) return;
  const tv = t.closest('[data-tview]'); if (tv) { ui.tview = tv.dataset.tview === 'grid' ? 'grid' : 'full'; LS.set('cc2.tview', ui.tview); renderSlots(); return; }
  const j = t.closest('[data-tjump]'); const g = !j && ui.tview === 'grid' && t.closest('.slot.tcard') && !t.closest('button,input,select,a,summary') ? t.closest('.slot.tcard') : null;
  if (j || g) { const i = j ? j.dataset.tjump : g.dataset.tcard; if (ui.tview === 'grid') { ui.tview = 'full'; LS.set('cc2.tview', 'full'); renderSlots(); }
    const el = $('slot' + i); if (el) { try { el.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (err) {} el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 900); } } });

