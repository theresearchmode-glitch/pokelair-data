// ---------- NastyPlot ratings: every Reg M-C Pokémon on a tier board, a meta map, and a detail sheet ----------
const LTIERS = [{k: 'S', min: 80, c: '#ffb400', d: 'Top of the format'}, {k: 'A', min: 70, c: '#ff6a3d', d: 'Strong, proven picks'}, {k: 'B', min: 60, c: '#b45cff', d: 'Solid with the right team'},
  {k: 'C', min: 50, c: '#2f9bff', d: 'Niche or team-dependent'}, {k: 'D', min: 35, c: '#22b58a', d: 'Needs a specific plan'}, {k: 'E', min: 0, c: '#8a90a6', d: 'Rarely worth a slot'}];
const lTier = t => LTIERS.find(x => t >= x.min) || LTIERS[LTIERS.length - 1];
function lairRows() { const R = ratings();
  return ROSTER.map(p => ({p, r: R.get(p.n)})).filter(x => x.r).sort((a, b) => b.r.total - a.r.total || a.p.d.localeCompare(b.p.d)); }
function lairFilter(rows) { const q = (ui.lq || '').trim().toLowerCase(), ty = ui.lty || [], f = ui.lf || {};
  return rows.filter(({p}) => (!q || p.d.toLowerCase().includes(q) || p.t.some(t => t.toLowerCase() === q)) && (!ty.length || ty.every(t => p.t.includes(t)))
    && (!f.mega || p.m) && (!f.nomega || !p.m) && (!f.gem || isGem(p)) && (!f.box || inBox(p))); }
function lairTile(p, r) { const a = TC[p.t[0]], b = TC[p.t[1] || p.t[0]];
  return `<button type="button" class="ltile${r.band >= 10 ? ' unsure' : ''}" data-lt="${esc(p.n)}" style="--ta:${a};--tb:${b}" title="${esc(p.d)} · ★ ${r.total} ±${r.band}${r.band >= 10 ? ' (few games: estimate)' : ''}"><span class="ltf">${p.m ? '<i class="ltm" title="Mega">M</i>' : ''}${isGem(p) ? '<i class="ltg" title="Hidden gem">◆</i>' : ''}${inBox(p) ? '<i class="ltb" title="In your box"></i>' : ''}</span><span class="lts">${r.total}</span>`
    + `<span class="ltn${ltnFit(p)}">${esc(ltName(p))}</span>${sprite(p,'ltspr')}</button>`; }
// the M badge already says Mega, so tiles drop the word; longer names step down a size instead of being cut off
// Tile names: Megas drop "Mega", and long regional names shorten their region ("P. Tauros (Combat)"); the full name is on the sheet.
const ltName = p => { let n = p.m ? String(p.d).replace(/^Mega /, '') : String(p.d); if (n.length > 16) n = n.replace(/^(Alolan|Galarian|Hisuian|Paldean) /, (m, r) => r[0] + '. '); return n; };
// smaller type for a long word, or a long name overall (tiles fit two lines)
const ltnFit = p => { const n = ltName(p), w = Math.max(...n.split(' ').map(x => x.length)); return w >= 11 || n.length >= 19 ? ' xs' : w >= 9 || n.length >= 15 ? ' sm' : ''; };
// The ratings' own track record, measured live like the Team Score's: inside each recent event's top cut, how often the
// team with the higher average rating finished higher. Cheap (ratings are cached), so it's recomputed with the data.
let ratingTrackCache = {key: null, res: null};
function ratingTrack() { const E = META.events; if (!E) return null; const key = E.updated + '|' + E.events.length + '|' + metaVersion; if (ratingTrackCache.key === key) return ratingTrackCache.res;
  let agree = 0, pairs = 0;
  for (const ev of E.events) { const sc = (ev.top || []).filter(t => t && t.mons && t.mons.length === 6 && t.mons.every(m => byName.get(m.n))).map(t => ({pl: t.place, s: t.mons.reduce((a, m) => a + rating(byName.get(m.n)).total, 0) / 6}));
    for (let a = 0; a < sc.length; a++) for (let b = a + 1; b < sc.length; b++) { const A = sc[a], B = sc[b]; if (A.pl === B.pl || A.s === B.s) continue; pairs++; if ((A.s > B.s) === (A.pl < B.pl)) agree++; } }
  const res = pairs >= 200 ? {acc: agree / pairs, pairs, events: E.events.length} : null; ratingTrackCache = {key, res}; return res; }
function renderLair(bodyOnly) {
  { const el = $('ratingTrack'), r = ratingTrack(); if (el) el.textContent = r ? `Track record: in ${r.events} recent events, the team with the higher average rating finished higher in ${Math.round(r.acc * 100)}% of ${r.pairs.toLocaleString('en-US')} head-to-head pairs (50% would be a coin flip; the Team Score, which judges whole teams, does better). Ratings rank single Pokémon: use them to find candidates, and the Team Score to judge a team.` : ''; }
  const pane = $('lairBody'); if (!pane) return; if (ui.lmode == null) { try { ui.lmode = LS.get('cc2.lmode', 'board'); } catch (e) { ui.lmode = 'board'; } }
  const all = lairRows(), rows = lairFilter(all), mode = ui.lmode === 'map' ? 'map' : 'board', pf = activePerf();
  const filtered = !!((ui.lq || '').trim() || (ui.lty || []).length || Object.values(ui.lf || {}).some(Boolean));
  if (!bodyOnly) {
    const src = pf && pf.sources ? Object.entries(pf.sources).filter(([, v]) => v) : [];
    const when = t => { try { return new Date(t + 'T12:00:00').toLocaleDateString([], {month: 'short', day: 'numeric'}); } catch (e) { return t; } };
    $('lairHero').innerHTML = `<div class="lhstat"><b>${all.length}</b><span>Pokémon rated</span></div><div class="lhstat"><b>${src.length}</b><span>data source${src.length === 1 ? '' : 's'}</span></div>`
      + `<div class="lhstat"><b>${all.filter(x => x.r.total >= 80).length}</b><span>in S tier</span></div><div class="lhstat"><b>${all.filter(x => isGem(x.p)).length}</b><span>hidden gems</span></div>`
      + `<details class="lhsrc"><summary>Doubles sources${pf && pf.updated ? ' · data from ' + esc(when(pf.updated)) : ''}</summary><ul>${src.map(([, v]) => `<li>${esc(v)}</li>`).join('')}</ul>
        <p class="t2">About 57% of the score is how a Pokémon wins: win rates from tournaments and official events (shrunk for small samples and corrected for mirror matches) plus its own share of team wins from 10,000+ Limitless teams, with teammates accounted for. About 38% is how often strong players pick it, across five sources (Limitless, official events, in-game Ranked, Showdown 1760+ and top replays), with each species\' numbers split between its regular and Mega forms. Stats, typing and tools fill in only where there are few games, and a Pokémon almost nobody picks can\'t rate highly on stats alone. Tested on held-out data: built without official-event results, it still ranks those win rates better than any single source.</p></details>`;
    document.querySelectorAll('[data-lmode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lmode === mode));
    $('lairTypes').innerHTML = TYPES.map(t => `<button type="button" class="ltype${(ui.lty || []).includes(t) ? ' on' : ''}" data-lty="${t}" style="--tc:${TC[t]}" title="${t}" aria-pressed="${(ui.lty || []).includes(t)}">${ticon(t)}<span>${t}</span></button>`).join('');
    const f = ui.lf || {};
    $('lairFlags').innerHTML = [['mega', 'Megas'], ['nomega', 'No Megas'], ['gem', '◆ Hidden gems'], ['box', 'In my box']].map(([k, l]) => `<button type="button" class="lflag" data-lflag="${k}" aria-pressed="${!!f[k]}">${l}</button>`).join('')
      + (filtered ? '<button type="button" class="lflag clr" data-lflag="clear">Clear</button>' : '');
  }
  $('lairCount').textContent = filtered ? `${rows.length} of ${all.length} match` : '';
  if (!rows.length) { pane.innerHTML = '<div class="empty-note">No Pokémon match. Try clearing a filter.</div>'; return; }
  if (mode === 'map') { pane.innerHTML = lairMap(rows); return; }
  const cols = Math.max(3, Math.floor(((pane.clientWidth || 900) - 56 - 16 + 6) / 118)), cap = PHONE() ? 5 : cols * 2 - 1, open = ui.lopen || {};
  pane.innerHTML = `<p class="t2 lnote"><i class="ltm">M</i> Mega · ◆ hidden gem · <i class="ltb"></i> in your box · <span class="lts dash">?</span> few games, so the score is an estimate</p><div class="lboard">${LTIERS.map(T => {
    const inT = rows.filter(x => lTier(x.r.total) === T); if (!inT.length) return '';
    const showAll = filtered || open[T.k] || inT.length <= cap + 1, shown = showAll ? inT : inT.slice(0, cap);
    return `<div class="ltier" style="--tc:${T.c}"><div class="ltl"><b>${T.k}</b><span>${T.min ? T.min + '+' : '<' + LTIERS[LTIERS.length - 2].min}</span></div>
      <div class="ltbody"><div class="ltd">${T.d} · ${inT.length}</div><div class="ltgrid">${shown.map(x => lairTile(x.p, x.r)).join('')}${showAll ? (open[T.k] && !filtered && inT.length > cap + 1 ? `<button type="button" class="ltile more" data-ltier="${T.k}">Show fewer</button>` : '') : `<button type="button" class="ltile more" data-ltier="${T.k}">+${inT.length - cap} more</button>`}</div></div></div>`; }).join('')}</div>`;
}
// Usage (x) against rating (y): where the meta agrees with the numbers, and where it doesn't.
function lairMap(rows) {
  const pts = rows.filter(x => x.r.pop != null && x.r.conf >= .25), ph = PHONE(); if (pts.length < 3) return '<div class="empty-note">Not enough usage data for the map yet.</div>';
  const W = ph ? 360 : 640, H = ph ? 460 : 420, L = 30, Rr = 12, Tp = 30, B = 34, xs = pts.map(x => x.r.pop), x0 = Math.max(0, Math.min(...xs) - 2), x1 = Math.min(100, Math.max(...xs) + 2);
  const ys = pts.map(x => x.r.total), y0 = Math.min(...ys) - 3, y1 = Math.max(...ys) + 3;
  const X = v => L + (v - x0) / (x1 - x0 || 1) * (W - L - Rr), Y = v => Tp + (1 - (v - y0) / (y1 - y0 || 1)) * (H - Tp - B);
  const sx = 58, sy = 65;
  const lab = new Set(pts.slice().sort((a, b) => b.r.total - a.r.total).slice(0, ph ? 9 : 14).map(x => x.p.n));
  pts.filter(x => x.r.pop < sx && x.r.total >= 66).slice(0, ph ? 3 : 6).forEach(x => lab.add(x.p.n));
  pts.filter(x => x.r.pop >= sx && x.r.total < 62).slice(0, ph ? 2 : 4).forEach(x => lab.add(x.p.n));
  const Q = (x, y, t, a) => `<text class="lq" x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
  return `<div class="lmapwrap"><svg class="lmap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Usage against NastyPlot rating">
    <rect class="lqbg g" x="${L}" y="${Tp}" width="${X(sx) - L}" height="${Y(sy) - Tp}"/><rect class="lqbg k" x="${X(sx)}" y="${Tp}" width="${W - Rr - X(sx)}" height="${Y(sy) - Tp}"/>
    <line class="lax" x1="${X(sx)}" x2="${X(sx)}" y1="${Tp}" y2="${H - B}"/><line class="lax" x1="${L}" x2="${W - Rr}" y1="${Y(sy)}" y2="${Y(sy)}"/>
    <text class="lal" x="${(L + W) / 2}" y="${H - 8}" text-anchor="middle">How often strong players pick it →</text>
    <text class="lal" x="12" y="${(Tp + H - B) / 2}" text-anchor="middle" transform="rotate(-90 12 ${(Tp + H - B) / 2})">NastyPlot rating →</text>
    ${(() => { // place labels greedily: biggest ratings first, right of the dot or left of it, never on top of another label
      const fs = ph ? 10 : 10.5, boxes = [[W - Rr - 120, H - B - 22, 116, 18], [L + 4, H - B - 22, 50, 18]], lbl = new Map();
      const hit = (x, y, w, h) => boxes.some(([a, b, c, d]) => x < a + c && a < x + w && y < b + d && b < y + h);
      for (const x of pts.filter(x => lab.has(x.p.n)).sort((a, b) => b.r.total - a.r.total)) { const cx = X(x.r.pop), cy = Y(x.r.total), t = x.p.d.replace(/^Mega /, 'M-'), w = t.length * fs * .56, h = fs + 2;
        for (const side of cx > W * .6 ? ['l', 'r'] : ['r', 'l']) { const lx = side === 'r' ? cx + 8 : cx - 8 - w, ly = cy - h / 2;
          if (lx < L || lx + w > W - 2 || hit(lx, ly, w, h)) continue; boxes.push([lx, ly, w, h]); lbl.set(x.p.n, {x: side === 'r' ? cx + 8 : cx - 8, y: cy + fs * .36, a: side === 'r' ? 'start' : 'end', t}); break; } }
      return pts.map(x => { const cx = X(x.r.pop).toFixed(1), cy = Y(x.r.total).toFixed(1);
        return `<g class="ldot" data-lt="${esc(x.p.n)}" tabindex="0" role="button" aria-label="${esc(x.p.d)}, rating ${x.r.total}"><circle cx="${cx}" cy="${cy}" r="${(x.p.m ? 6.5 : 5.5) - (ph ? 1.2 : 0)}" style="fill:${TC[x.p.t[0]]};stroke:${TC[x.p.t[1] || x.p.t[0]]}"/><circle class="hit" cx="${cx}" cy="${cy}" r="13"/></g>`; }).join('')
        + `<g class="llabels">${[...lbl.values()].map(l => `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="${l.a}">${esc(l.t)}</text>`).join('')}${Q(L + 4, Tp - 9, '◆ Hidden gems', 'start')}${Q(W - Rr - 4, Tp - 9, '♛ Meta kings', 'end')}${Q(W - Rr - 8, H - B - 8, 'Popular, beatable', 'end')}${Q(L + 8, H - B - 8, 'Niche', 'start')}</g>`; })()}
  </svg></div><p class="t2">Tap a dot for the full breakdown. ${pts.length} Pokémon with tournament or ladder data; the other ${rows.length - pts.length} are rated from stats, typing and tools only.</p>`;
}
function lairSheet(n) {
  const sh = $('lairSheet'); if (!sh) return; const p = byName.get(n); if (!p) { sh.hidden = true; return; }
  const r = rating(p), T = lTier(r.total), all = lairRows(), pos = all.findIndex(x => x.p.n === p.n) + 1, src = r.src || {};
  const bar = (l, v, note) => `<div class="lbar"><span>${l}</span><i style="--w:${Math.max(2, Math.min(100, v || 0))}%"></i><b>${v == null ? '–' : v}</b>${note ? `<em>${note}</em>` : ''}</div>`;
  const ev = [];
  {
    if (src.adj) { const v = src.adj[0] * 25; ev.push(['Own share of team wins', `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}% win chance`, `teammates accounted for · ${src.adj[2].toLocaleString()} Limitless teams`]); }
    if (src.tour) ev.push(['Limitless tournaments', `${src.tour[0]}% of teams`, `${src.tour[1]}% won · ${src.tour[2].toLocaleString()} games`]);
    if (src.official) ev.push(['Official VGC events', `${src.official[0]}% of teams`, `${src.official[1]}% won · ${src.official[2].toLocaleString()} games`]);
    const fam = ROSTER.some(q => q.m && q.b === p.b), spn = (byName.get(p.b) || p).d;
    if (src.ingame != null) ev.push(['In-game Ranked Doubles', `#${src.ingame} most used`, `op.gg, season M-7${fam ? ` · ${esc(spn)}, all forms (shared by form)` : ''}`]);
    if (src.smogon != null) ev.push(['Showdown 1760+', `${src.smogon}% of teams`, 'Smogon usage stats']);
    if (src.prd != null) ev.push(['Top-10% Showdown replays', `${src.prd}% of teams`, 'project-red-data']);
    if (src.ladder) ev.push(['Showdown ladder', `${src.ladder[0]}% of teams`, `${src.ladder[1]}% won · avg player ${src.ladder[2]}${fam ? ` · ${esc(spn)} total, shared by form` : ''}`]);
  }
  const ab = metaAbility(p) || bestAbility(p), ti = topItems(p), mv = (() => { try { return runMoves(p).map(m => m.name).filter(Boolean); } catch (e) { return []; } })();
  const onTeam = members().some(m => m.base === p.b), full = !S.slots.some(s => !byName.get(s.n));
  sh.innerHTML = `<div class="lsback" data-lclose="1"></div><div class="lspanel" role="dialog" aria-modal="true" aria-label="${esc(p.d)} rating">
    <div class="lshead" style="--ta:${TC[p.t[0]]};--tb:${TC[p.t[1] || p.t[0]]}"><button type="button" class="lsx" data-lclose="1" aria-label="Close">✕</button>${sprite(p,'lsspr')}
      <div class="lsring" style="--v:${r.total};--tc:${T.c}"><b>${r.total}</b><span>±${r.band} · ${T.k}</span></div>
      <div class="lsname"><h3>${esc(p.d)}</h3><div class="chips">${p.t.map(t => chip(t)).join('')}${p.m ? '<span class="tag mega ico" title="Mega Evolution">MEGA</span>' : ''}${isGem(p) ? '<span class="tag offmeta">HIDDEN GEM</span>' : ''}${inBox(p) ? '<span class="tag box ico" title="In your box">BOX</span>' : ''}</div>
      <div class="lspos">#${pos} of ${all.length} in doubles</div></div></div>
    <div class="lsbody">
      <div class="lsec"><h4>Why it rates ${r.total}</h4>${r.win != null ? `${bar('Winning', r.win, r.conf < .4 ? 'few games' : '')}${bar('Picked by strong players', r.popAll)}${bar('Stats & typing', r.intrinsic)}
        <p class="t2">Likely range ${Math.max(1, r.total - r.band)}–${Math.min(99, r.total + r.band)}. How it wins counts ${Math.round(57 * r.conf)}%, how often strong players pick it 38%, and its stats, typing and tools the rest${r.conf < .9 ? ' (they stand in for win rates it doesn\'t have yet)' : ''}${r.band >= 10 ? '. Few games so far, so treat this one as an estimate' : ''}.</p>`
        : `${bar('Real results', r.evidence, r.conf < .4 ? 'small sample' : '')}${bar('Power', r.power)}${bar('Typing', r.typing)}${bar('Tools', r.tools)}
        <p class="t2">Likely range ${Math.max(1, r.total - r.band)}–${Math.min(99, r.total + r.band)}. Real results count ${Math.round(r.conf * 100)}% toward the score; stats, typing and tools make up the rest${r.band >= 10 ? ', so treat this one as an estimate' : ''}.</p>`}</div>
      ${isTrap(p) ? `<div class="lsec"><p class="t2" style="color:var(--bad)">Suggestions skip this one: across ${((r.src && r.src.adj && r.src.adj[1]) || 0).toLocaleString()}+ Limitless games it lost more than it won, even after accounting for its teammates. You can still add it yourself.</p></div>` : ''}
      <div class="lsec"><h4>What the data says</h4>${ev.length ? `<div class="levs">${ev.map(e => `<div class="lev"><span>${e[0]}</span><b>${e[1]}</b><em>${e[2]}</em></div>`).join('')}</div>` : '<p class="t2">No tournament or ladder games yet: this rating comes from stats, typing and tools.</p>'}</div>
      ${typeof OUTSIDE === 'object' ? `<div class="lsec"><h4>Other tier lists</h4><div class="lout">${OUTSIDE.lists.map(L => { const v = OUTSIDE.data[L.k] && OUTSIDE.data[L.k][p.n];
        return `<a class="lo" href="${L.url}" target="_blank" rel="noopener"><b class="lot${v ? ' t' + L.tiers[v] : ''}">${v ? L.tiers[v] : '–'}</b><span>${L.name}</span><em>${v ? L.how : 'not listed · ' + L.note}</em></a>`; }).join('')}</div><p class="t2">Checked ${OUTSIDE.date}. Shown for comparison, not counted in the score.</p></div>` : ''}
      <div class="lsec"><h4>Typical set</h4><div class="lset"><span>Ability</span><b>${esc(ab || '–')}</b>${ti ? `<span>Item</span><b>${ti.it.map(x => esc(x[0])).join(' / ')}</b>` : ''}${mv.length ? `<span>Moves</span><b>${mv.map(esc).join(' · ')}</b>` : ''}</div></div>
      <div class="lsact">${onTeam ? '<span class="t2">On your team</span>' : full ? '<span class="t2">Team full</span>' : `<button class="btn primary" type="button" data-laddteam="${esc(p.n)}">Add to team</button>`}<button class="btn" type="button" data-lsets="${esc(p.n)}">Popular sets</button></div>
    </div></div>`;
  sh.hidden = false; ui.lsheet = p.n; try { document.body.classList.add('lsopen'); } catch (e) {}
  const x = sh.querySelector('.lsx'); if (x && x.focus) try { x.focus({preventScroll: true}); } catch (e) {}
}
function lairClose() { const sh = $('lairSheet'); if (sh) sh.hidden = true; ui.lsheet = null; try { document.body.classList.remove('lsopen'); } catch (e) {} }
document.addEventListener('click', e => { const t = e.target; if (!t || !t.closest) return;
  const g = t.closest('[data-lt],[data-ltier],[data-lty],[data-lflag],[data-lmode],[data-lclose],[data-laddteam],[data-lsets]'); if (!g) return; const d = g.dataset;
  if (d.lt) { lairSheet(d.lt); return; }
  if (d.lclose) { lairClose(); return; }
  if (d.ltier) { ui.lopen = Object.assign({}, ui.lopen, {[d.ltier]: !(ui.lopen || {})[d.ltier]}); renderLair(true); return; }
  if (d.lty) { const s = ui.lty || []; ui.lty = s.includes(d.lty) ? s.filter(x => x !== d.lty) : (s.length >= 2 ? [s[1], d.lty] : [...s, d.lty]); renderLair(); return; }
  if (d.lflag) { if (d.lflag === 'clear') { ui.lf = {}; ui.lty = []; ui.lq = ''; const q = $('lairQ'); if (q) q.value = ''; }
    else { const f = Object.assign({}, ui.lf); f[d.lflag] = !f[d.lflag]; if (d.lflag === 'mega' && f.mega) f.nomega = false; if (d.lflag === 'nomega' && f.nomega) f.mega = false; ui.lf = f; } renderLair(); return; }
  if (d.lmode) { ui.lmode = d.lmode; try { LS.set('cc2.lmode', d.lmode); } catch (e) {} renderLair(); return; }
  if (d.laddteam) { const p = byName.get(d.laddteam), j = S.slots.findIndex(s => !byName.get(s.n)); if (p && j >= 0) { S.slots[j] = {n: p.n, a: null, lock: false}; render(); toast(p.d + ' added to your team'); lairSheet(p.n); } return; }
  if (d.lsets) { ui.setMon = d.lsets; try { LS.set('cc2.setMon', d.lsets); } catch (e) {} lairClose(); setView('sets'); renderSets(); return; } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.lsheet) lairClose();
  if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.classList && e.target.classList.contains('ldot')) { e.preventDefault(); lairSheet(e.target.dataset.lt); } });
document.addEventListener('input', e => { if (e.target && e.target.id === 'lairQ') { ui.lq = e.target.value; renderLair(); } });

