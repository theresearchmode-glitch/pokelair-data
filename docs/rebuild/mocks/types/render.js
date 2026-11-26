(X, V) => { const E = V2.esc, chip = V2.typeChip, d = V2.disp(X.n), g = X.groups;
  const ab = t => t.slice(0, 3), mul = v => v === 0 ? '0' : v === .25 ? '¼' : v === .5 ? '½' : v === 4 ? '4' : v === 2 ? '2' : '';
  // the controls every concept keeps: look up a Pokemon, your six, or pick one or two types
  const team = `<div class="tc-team" role="group" aria-label="Your team">${X.team.map(n => `<button type="button" class="tc-tm${n === X.n ? ' on' : ''}">${V2.mon(n, {iw: 40, bare: true})}<span>${V2.rowName ? V2.rowName(V2.disp(n)) : E(V2.disp(n))}</span></button>`).join('')}</div>`;
  const find = `<label class="np-field tc-find"><span aria-hidden="true">⌕</span><input value="" placeholder="Look up a Pokémon"></label>`;
  const picks = `<div class="tc-picks" role="group" aria-label="Or pick one or two types">${X.types.map(t => `<button type="button" class="tc-tp${X.sel.includes(t) ? ' on' : ''}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>`;
  const note = `${X.abNotes.length ? `<p class="tc-ab">${E(X.abNotes.join('. '))}.</p>` : ''}<p class="fine">Everything not listed hits it for normal damage. Ability: ${E(X.ab)}${X.onTeam ? ' (from your team)' : ''}.</p>`;
  const bands = [['4×', 'weak', g.q, 'b4'], ['2×', 'weak', g.d, 'b2'], ['½', 'resists', g.h, 'bh'], ['¼', 'resists', g.qr, 'bq'], ['0', 'immune', g.z, 'b0']];
  const off = X.off.map(o => `<div class="tc-off"><div class="tc-offh">${chip(o.atk)}<b>attacks</b></div><div class="tc-offr"><span class="k up">2× on</span><span class="c">${o.se.map(chip).join('') || '<i>Nothing</i>'}</span></div>
    <div class="tc-offr"><span class="k dn">½× on</span><span class="c">${o.nv.map(chip).join('') || '<i>Nothing</i>'}</span></div>${o.no.length ? `<div class="tc-offr"><span class="k no">No effect</span><span class="c">${o.no.map(chip).join('')}</span></div>` : ''}</div>`).join('');
  const grid = (lit) => `<div class="tc-gw"><table class="tc-grid"><thead><tr><th class="cor">Attacking ↓ · Defending →</th>${X.types.map(t => `<th class="${lit && X.sel.includes(t) ? 'lit' : ''}" style="--tc:var(--ty-${t})"><span>${ab(t)}</span></th>`).join('')}</tr></thead>
    <tbody>${X.types.map((a, i) => `<tr><th style="--tc:var(--ty-${a})"><span>${a}</span></th>${X.eff[i].map((v, j) => `<td class="v${String(v).replace('.', '_')}${lit && X.sel.includes(X.types[j]) ? ' lit' : ''}">${mul(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const card = V2.msCard(X.p, X.n, `<h2 class="u">${V2.nameHtml(d)}</h2>`, `<div class="ms-ty">${X.p.t.map(chip).join('')}</div>`);
  const head = (h, sub) => `<section class="tc-h"><p class="np-eyebrow"><span>Battle · Type Chart</span></p><h1 class="u">${h}</h1>${sub ? `<p class="tm-sub">${sub}</p>` : ''}</section>`;

  if (V === 'spot') return `<div class="tc tc-spot">${V2.battleToolsBar ? V2.battleToolsBar('types') : ''}${head(`<span>What hits ${E(d)}</span> <span class="pl">hard.</span>`, '')}
    <div class="tc-ctl">${find}${team}</div>${picks}
    <div class="tc-main"><div class="tc-cardw">${card}</div>
      <div class="tc-right"><p class="tc-lbl">Taking hits as ${X.sel.map(chip).join(' ')}</p>
        <div class="tc-spec">${bands.map(([m, w, ts, c]) => `<div class="tc-band ${c}${ts.length ? '' : ' none'}"><div class="m u">${m}<small>${w}</small></div><div class="ts">${ts.length ? ts.map(chip).join('') : '<i>None</i>'}</div></div>`).join('')}</div>${note}
        <p class="tc-lbl">Attacking with its own types</p><div class="tc-offs">${off}</div></div></div>
    <details class="tc-fold"><summary><b>All 18 types: the full chart</b><small>Every attacking type against every defending type</small></summary>${grid(false)}</details></div>`;

  if (V === 'grid') return `<div class="tc tc-gridv">${V2.battleToolsBar ? V2.battleToolsBar('types') : ''}${head('<span>Every type</span> <span class="pl">against every type.</span>', 'Tap a row or a column. Your Pokémon\'s types are lit.')}
    <div class="tc-ctl">${find}${team}</div>
    <div class="tc-gmain">${grid(true)}<div class="tc-prow"><p class="tc-lbl">Attacking type</p><div class="tc-picks">${X.types.map(t => `<button type="button" class="tc-tp${t === X.sel[0] ? ' on' : ''}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>
      ${(o => `<div class="tc-off"><div class="tc-offh">${chip(o.atk)}<b>attacks hit</b></div><div class="tc-offr"><span class="k up">2× on</span><span class="c">${o.se.map(chip).join('') || '<i>Nothing</i>'}</span></div><div class="tc-offr"><span class="k dn">½× on</span><span class="c">${o.nv.map(chip).join('') || '<i>Nothing</i>'}</span></div>${o.no.length ? `<div class="tc-offr"><span class="k no">No effect</span><span class="c">${o.no.map(chip).join('')}</span></div>` : ''}</div>`)(X.off[0])}</div><aside class="tc-side"><div class="tc-mini">${V2.mon(X.n, {iw: 120, bare: true})}<div><b class="u">${E(d)}</b><span>${X.p.t.map(chip).join('')}</span></div></div>
      ${bands.filter(b => b[2].length).map(([m, w, ts, c]) => `<div class="tc-sr ${c}"><b class="u">${m}</b><span>${w}</span><div>${ts.map(chip).join('')}</div></div>`).join('')}${note}</aside></div></div>`;

  // duel: the Pokemon in the middle; what hurts it on the left (biggest tiles for 4x), what barely scratches it on the right, immune below
  const tiles = (ts, big) => ts.map(t => `<span class="tc-tile${big ? ' big' : ''}" style="--tc:var(--ty-${t})"><b>${t}</b></span>`).join('');
  return `<div class="tc tc-duel">${V2.battleToolsBar ? V2.battleToolsBar('types') : ''}${head(`<span>${E(d)}</span> <span class="pl">vs every type.</span>`, '')}
    <div class="tc-ctl">${find}${team}</div>${picks}
    <div class="tc-arena"><div class="tc-hurt"><p class="tc-lbl">Hits it hard</p><div class="m u">4×</div>${tiles(g.q, true)}<div class="m u">2×</div>${tiles(g.d)}</div>
      <div class="tc-mid">${card}</div>
      <div class="tc-soft"><p class="tc-lbl">Barely scratches it</p><div class="m u">½</div>${tiles(g.h)}${g.qr.length ? `<div class="m u">¼</div>${tiles(g.qr)}` : ''}<div class="m u">0</div>${tiles(g.z)}</div></div>${note}
    <div class="tc-offs row">${off}</div>
    <details class="tc-fold"><summary><b>All 18 types: the full chart</b><small>Every attacking type against every defending type</small></summary>${grid(false)}</details></div>`; }
