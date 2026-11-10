// readable text on a tier colour: dark ink on light colours (gold S tier), white on dark ones (sweep, Oct 31: 1.8:1 contrast)
/* tier-coloured chips that carry a letter or number (legibility, Nov 2): dark ink on light band colours; on mid-tone ones
   (B purple) the chip is deepened a step until white text reads at 4.5:1+, so no tier letter sits at ~4:1 */
const tierLum = h => { h = String(h).replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0); };
const tierBg = c => { const h = String(c).replace('#', ''); if (h.length !== 6) return c; if ((tierLum(h) + .05) / .066 >= 4.5) return c; let [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  for (let k = 0; k < 20 && 1.05 / (tierLum([r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')) + .05) < 4.6; k++) { r = r * .9 + 29 * .1; g = g * .9 + 33 * .1; b = b * .9 + 64 * .1; }
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); };
const tierInk = c => { const h = String(c).replace('#', ''); if (h.length !== 6) return '#fff'; return (tierLum(h) + .05) / .066 >= 4.5 ? '#1D2140' : '#fff'; };
// ---------- Sets: popular doubles sets for any Pokémon ----------
// "Best data" is the merged set: official in-game stats first, then Showdown or tournament rows where the game has none (a Mega's own set).
const SET_SRC = {ingame: 'Best data', tour: 'Tournaments', ladder: 'Showdown'};
function setCard(title, sub, t, extra, foot) {
  // Concept H (Oct 29): moves as solid blue bars, items / abilities / natures as one block of chips, teammates as sprites
  const pc = v => v == null ? '' : (+v).toFixed(+v >= 10 ? 0 : 1) + '%';
  const moves = t && t.mv && t.mv.length ? `<div class="stat"><h4 class="kdh">${typeof kindIcon === 'function' ? kindIcon('m') : ''}Moves</h4><div class="smvs">${t.mv.slice(0, 8).map(([n, v]) => `<div class="smv"><div class="smvt"><b>${esc(n)}</b><span>${pc(v)}</span></div><i style="--w:${Math.max(2, Math.min(100, +v || 0))}%"></i></div>`).join('')}</div></div>` : '';
  const chips = (lab, arr, k) => arr && arr.length ? `<div class="sbuild"><span class="chk kdh">${typeof kindIcon === 'function' ? kindIcon(({Item: 'i', Ability: 'a', Nature: 'n'})[lab]) : ''}${lab}</span><div class="sbchips">${arr.slice(0, k).map(([n, v], i) => `<span class="sbchip${i === 0 ? ' top' : ''}">${esc(n)}${v == null ? '' : ` <em>${pc(v)}</em>`}</span>`).join('')}</div></div>` : '';
  const build = t ? chips('Item', t.it, 4) + chips('Ability', t.ab, 3) + chips('Nature', t.na, 3) : '';
  const tm = t && t.tm && t.tm.length ? `<div class="stat"><h4>Teammates</h4><div class="stms">${t.tm.slice(0, 6).map(([n, v]) => { const q = byName.get(n);
    return `<button type="button" class="stm${q ? ' tyacc' : ''}"${q ? ` style="${tyv(q)}"` : ''} data-setmon="${esc(q ? q.n : n)}"${q ? '' : ' disabled'}>${q ? sprite(q) || '' : ''}<b>${esc(q ? q.d : n)}</b>${v != null ? `<span>${(+v).toFixed(0)}%</span>` : ''}</button>`; }).join('')}</div></div>` : '';
  const body = hasSet(t) ? `<div class="setgrid2">${moves}${build ? `<div class="stat sbuilds">${build}</div>` : ''}</div>${tm}`
                 : `<div class="empty-note">Not among the top Pokémon in this list. "Best data" covers every Pokémon.</div>`;
  return `<div class="setcard"><div class="ph"><div><div class="pt">${title}</div><div class="t2">${sub}</div></div>${extra || ''}</div>${body}${foot ? `<div class="t2 setfoot">${foot}</div>` : ''}</div>`;
}
// Where each part of a merged set came from, in plain words.
function setSources(st, fmt, p) {
  const label = {mv: 'moves', it: 'items', ab: 'abilities', na: 'natures', tm: 'teammates'}, by = {};
  const mega = st.src.it === 'mega';
  for (const f in label) { const s = st.src[f]; if (!s || s === 'mega') continue; const w = s === 'live' ? 'official in-game stats (live)' : s === 'game' ? `official in-game stats (${SETS.meta.pulled} snapshot)` : s === 'sd' ? `Showdown 1630+${mega ? ' (Mega-specific)' : st.sd && st.sd.cut === 0 ? ' (all ratings)' : ''}` : srcWord(s, fmt) + ' data'; (by[w] = by[w] || []).push(label[f]); }
  const k = Object.keys(by); if (!k.length) return '';
  let txt = k.length === 1 ? 'From ' + k[0] : k.map(w => `${by[w].join(', ').replace(/^./, c => c.toUpperCase())}: ${w}`).join(' · ');
  if (mega) txt += ' · Its stone and ability are fixed';
  /* the data behind the percentages (trust pass): the Pokémon's own battles or teams in that list, small samples flagged */
  if (st.sd && +st.sd.raw > 0 && Object.values(st.src).includes('sd')) txt += ` · ${basisText(st.sd.raw, 'Showdown battle', 'battles')}`;
  { const b = p && setBasis(p, st, 'mv'); if (b && b.src === 'tour') txt += ` · moves: ${basisText(b.n, 'tournament team', 'sets', {pre: 'of'})}`; }
  if (st.shared) txt += ' · Shares stats with the same-ability plumage; the game counts them together';
  if (st.partial) txt += ' · The game\'s file is missing its top moves';
  return esc(txt);
}
// One line naming where the moves came from, for the card subtitle.
function mainSource(st) { const s = st.src.mv; return s === 'sd' ? (st.src.it === 'mega' ? 'Showdown ladder, 1630+ rating (this Mega)' : 'Showdown ladder') : s === 'tour' ? 'Tournament teams' : s === 'ladder' ? 'Showdown ladder' : 'Official in-game ranked battles'; }
function rankLine(d, t) {
  if (!d || !t) return '';
  const bits = ['#' + t.r];
  if (t.teams) bits.push(basisText(t.teams, 'team', 'sets')); else if (t.u) bits.push((+t.u).toFixed(1) + '% usage' + (d.battles ? ` of ${basisNum(d.battles, true)} battles` : ''));
  if (t.w) bits.push((+t.w).toFixed(1) + '% wins');
  return bits.join(' · ') + ' · ' + esc(d.source || '');
}
function renderSets() {
  const out = $('setOut'); if (!out) return;
  const team = members();
  let p = byName.get(ui.setMon);
  if (!p && team.length) { p = team[0].p; ui.setMon = p.n; }
  // no team and nothing looked up yet: open on the most-used Pokémon rather than an empty page
  if (!p) { try { const r = lairRows(); p = r && r[0] ? r[0].p : null; } catch (e) {} if (p) ui.setMon = p.n; }
  /* Nov 10 fix: drawn after the default is chosen, so the Pokémon shown is highlighted on first open */
  $('setQuick').innerHTML = team.length ? `<span class="lbl">Your team</span>${team.map(m => `<button type="button" class="ttmon${m.p.n === ui.setMon ? ' on' : ''}" data-setmon="${esc(m.p.n)}">${esc(m.d)}</button>`).join('')}` : '';
  if (!p) { out.innerHTML = '<div class="empty-note">Look up a Pokémon to see its popular sets.</div>'; return; }
  if (!ui.setSrcLoaded) { ui.setSrcLoaded = true; try { const v = LS.get('cc2.setSrc', null); if (SET_SRC[v]) ui.setSrc = v; } catch (e) {} }
  const src = SET_SRC[ui.setSrc] ? ui.setSrc : 'ingame';
  const seg = `<div class="seg" role="group" aria-label="Doubles data source">${Object.entries(SET_SRC).map(([k, v]) => `<button type="button" data-setsrc="${k}" aria-pressed="${k === src}">${v}</button>`).join('')}</div>`;
  // In-game: the merged set (every Pokémon). Tournaments / Showdown: that list's own row, unmerged.
  let dCard;
  if (src === 'ingame') { const st = setFor(p, 'doubles', 'ingame'), d = META[SRC.ingame], row = findIn(d, p);
    dCard = setCard('Doubles', rankLine(d, row) || mainSource(st), st, seg, setSources(st, 'doubles', p)); }
  else { const d = META[SRC[src]], row = findIn(d, p);
    dCard = setCard('Doubles', rankLine(d, row) || (d ? esc(d.source || '') : 'No data loaded yet'), row, seg); }
  out.setAttribute('style', tyv(p)); out.innerHTML = `<div class="sethead tyacc">${sprite(p,'big')}<span class="sl-name">${esc(p.d)}</span><span class="chips">${p.t.map(t => chip(t)).join('')}</span>${p.m ? '<span class="tag mega ico" title="Mega Evolution">Mega</span>' : ''}${inBox(p) ? '<span class="tag box ico" title="In your box">Box</span>' : ''}${(() => { try { const r = rating(p), T = lTier(r.total); return `<span class="tag tier" style="background:${T.c};color:${tierInk(T.c)};box-shadow:none" title="NastyPlot rating ${RS(r.total)}${rankTxt(p) ? ' · ' + rankTxt(p) : ''} · ${esc(T.d)}">${T.k} tier · rated ${RS(r.total)}${rankTxt(p) ? ' · ' + rankTxt(p) : ''}</span>`; } catch (e) { return ""; } })()}</div>
    ${(m => m ? `<p class="t2 setmine">Your ${esc(m.d)}: ${esc(m.ability)}${m.item ? ` @ <b>${esc(m.item)}</b>${m.heldItem ? ' (your pick)' : ''}` : ''} · ${m.moves.filter(Boolean).map(x => esc(x.name)).join(', ')}${m.custom ? ' (your moves)' : ''}</p>` : '')(team.find(m => m.p.n === p.n))}
    <div class="mucols one">${dCard}</div>`;
}

