// ---------- Sets: popular doubles sets for any Pokémon ----------
// "Best data" is the merged set: official in-game stats first, then Showdown or tournament rows where the game has none (a Mega's own set).
const SET_SRC = {ingame: 'Best data', tour: 'Tournaments', ladder: 'Showdown'};
function setCard(title, sub, t, extra, foot) {
  // Concept H (Oct 29): moves as solid blue bars, items / abilities / natures as one block of chips, teammates as sprites
  const pc = v => v == null ? '' : (+v).toFixed(+v >= 10 ? 0 : 1) + '%';
  const moves = t && t.mv && t.mv.length ? `<div class="stat"><h4>Moves</h4><div class="smvs">${t.mv.slice(0, 8).map(([n, v]) => `<div class="smv"><div class="smvt"><b>${esc(n)}</b><span>${pc(v)}</span></div><i style="--w:${Math.max(2, Math.min(100, +v || 0))}%"></i></div>`).join('')}</div></div>` : '';
  const chips = (lab, arr, k) => arr && arr.length ? `<div class="sbuild"><span class="chk">${lab}</span><div class="sbchips">${arr.slice(0, k).map(([n, v], i) => `<span class="sbchip${i === 0 ? ' top' : ''}">${esc(n)}${v == null ? '' : ` <em>${pc(v)}</em>`}</span>`).join('')}</div></div>` : '';
  const build = t ? chips('Item', t.it, 4) + chips('Ability', t.ab, 3) + chips('Nature', t.na, 3) : '';
  const tm = t && t.tm && t.tm.length ? `<div class="stat"><h4>Teammates</h4><div class="stms">${t.tm.slice(0, 6).map(([n, v]) => { const q = byName.get(n);
    return `<button type="button" class="stm" data-setmon="${esc(q ? q.n : n)}"${q ? '' : ' disabled'}>${q ? sprite(q) || '' : ''}<b>${esc(q ? q.d : n)}</b>${v != null ? `<span>${(+v).toFixed(0)}%</span>` : ''}</button>`; }).join('')}</div></div>` : '';
  const body = hasSet(t) ? `<div class="setgrid2">${moves}${build ? `<div class="stat sbuilds">${build}</div>` : ''}</div>${tm}`
                 : `<div class="empty-note">Not among the top Pokémon in this list. "Best data" covers every Pokémon.</div>`;
  return `<div class="setcard"><div class="ph"><div><div class="pt">${title}</div><div class="t2">${sub}</div></div>${extra || ''}</div>${body}${foot ? `<div class="t2 setfoot">${foot}</div>` : ''}</div>`;
}
// Where each part of a merged set came from, in plain words.
function setSources(st, fmt) {
  const label = {mv: 'moves', it: 'items', ab: 'abilities', na: 'natures', tm: 'teammates'}, by = {};
  const mega = st.src.it === 'mega';
  for (const f in label) { const s = st.src[f]; if (!s || s === 'mega') continue; const w = s === 'live' ? 'official in-game stats (live)' : s === 'game' ? `official in-game stats (${SETS.meta.pulled} snapshot)` : s === 'sd' ? `Showdown 1630+${mega ? ' (Mega-specific)' : st.sd && st.sd.cut === 0 ? ' (all ratings)' : ''}` : srcWord(s, fmt) + ' data'; (by[w] = by[w] || []).push(label[f]); }
  const k = Object.keys(by); if (!k.length) return '';
  let txt = k.length === 1 ? 'From ' + k[0] : k.map(w => `${by[w].join(', ').replace(/^./, c => c.toUpperCase())}: ${w}`).join(' · ');
  if (mega) txt += ' · Its stone and ability are fixed';
  if (st.sd && st.sd.raw < 500) txt += ` · Showdown sample is small (${st.sd.raw.toLocaleString()} battles)`;
  if (st.shared) txt += ' · Shares stats with the same-ability plumage; the game counts them together';
  if (st.partial) txt += ' · The game\'s file is missing its top moves';
  return esc(txt);
}
// One line naming where the moves came from, for the card subtitle.
function mainSource(st) { const s = st.src.mv; return s === 'sd' ? (st.src.it === 'mega' ? 'Showdown ladder, 1630+ rating (this Mega)' : 'Showdown ladder') : s === 'tour' ? 'Tournament teams' : s === 'ladder' ? 'Showdown ladder' : 'Official in-game ranked battles'; }
function rankLine(d, t) {
  if (!d || !t) return '';
  const bits = ['#' + t.r];
  if (t.teams) bits.push(t.teams.toLocaleString() + ' teams'); else if (t.u) bits.push((+t.u).toFixed(1) + '% usage');
  if (t.w) bits.push((+t.w).toFixed(1) + '% wins');
  return bits.join(' · ') + ' · ' + esc(d.source || '');
}
function renderSets() {
  const out = $('setOut'); if (!out) return;
  const team = members();
  $('setQuick').innerHTML = team.length ? `<span class="lbl">Your team</span>${team.map(m => `<button type="button" class="ttmon${m.p.n === ui.setMon ? ' on' : ''}" data-setmon="${esc(m.p.n)}">${esc(m.d)}</button>`).join('')}` : '';
  let p = byName.get(ui.setMon);
  if (!p && team.length) { p = team[0].p; ui.setMon = p.n; }
  // no team and nothing looked up yet: open on the most-used Pokémon rather than an empty page
  if (!p) { try { const r = lairRows(); p = r && r[0] ? r[0].p : null; } catch (e) {} if (p) ui.setMon = p.n; }
  if (!p) { out.innerHTML = '<div class="empty-note">Look up a Pokémon to see its popular sets.</div>'; return; }
  if (!ui.setSrcLoaded) { ui.setSrcLoaded = true; try { const v = LS.get('cc2.setSrc', null); if (SET_SRC[v]) ui.setSrc = v; } catch (e) {} }
  const src = SET_SRC[ui.setSrc] ? ui.setSrc : 'ingame';
  const seg = `<div class="seg" role="group" aria-label="Doubles data source">${Object.entries(SET_SRC).map(([k, v]) => `<button type="button" data-setsrc="${k}" aria-pressed="${k === src}">${v}</button>`).join('')}</div>`;
  // In-game: the merged set (every Pokémon). Tournaments / Showdown: that list's own row, unmerged.
  let dCard;
  if (src === 'ingame') { const st = setFor(p, 'doubles', 'ingame'), d = META[SRC.ingame], row = findIn(d, p);
    dCard = setCard('Doubles', rankLine(d, row) || mainSource(st), st, seg, setSources(st, 'doubles')); }
  else { const d = META[SRC[src]], row = findIn(d, p);
    dCard = setCard('Doubles', rankLine(d, row) || (d ? esc(d.source || '') : 'No data loaded yet'), row, seg); }
  out.innerHTML = `<div class="sethead">${sprite(p,'big')}<span class="sl-name">${esc(p.d)}</span><span class="chips">${p.t.map(t => chip(t)).join('')}</span>${p.m ? '<span class="tag mega ico" title="Mega Evolution">MEGA</span>' : ''}${inBox(p) ? '<span class="tag box ico" title="In your box">BOX</span>' : ''}${(() => { try { const r = rating(p), T = lTier(r.total); return `<span class="tag tier" style="background:${T.c};color:#fff" title="NastyPlot rating ${r.total}">${T.k} tier · ${esc(T.d)}</span>`; } catch (e) { return ""; } })()}</div>
    ${(m => m ? `<p class="t2 setmine">Your ${esc(m.d)}: ${esc(m.ability)}${m.item ? ` @ <b>${esc(m.item)}</b>${m.heldItem ? ' (your pick)' : ''}` : ''} · ${m.moves.filter(Boolean).map(x => esc(x.name)).join(', ')}${m.custom ? ' (your moves)' : ''}</p>` : '')(team.find(m => m.p.n === p.n))}
    <div class="mucols one">${dCard}</div>`;
}

