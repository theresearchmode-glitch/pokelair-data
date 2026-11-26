(X, V) => { const E = V2.esc, chip = V2.typeChip, d = V2.disp(X.n), g = X.groups, idx = t => X.types.indexOf(t);
  const pat = t => (V2.DC_PAT && V2.DC_PAT[t]) || 'rings', mult = t => { let m = 1; for (const s of X.sel) m *= X.eff[idx(t)][idx(s)]; return m; };
  const abNote = X.abNotes.length ? `<p class="t2-ab">${E(X.abNotes.join('. '))}.</p>` : '';
  const show = `<p class="t2-show">Showing <b>${E(d)}</b>, ability ${E(X.ab)}${X.onTeam ? ' (from your team)' : ''}</p>`;
  const team = `<div class="t2-team">${X.team.map(n => `<button type="button" class="t2-tm${n === X.n ? ' on' : ''}">${V2.mon(n, {iw: 40, bare: true})}<span>${V2.rowName(V2.disp(n))}</span></button>`).join('')}</div>`;
  const find = `<label class="np-field t2-find">${V2.ICON.search}<input placeholder="Look up a Pokémon"></label>`;
  const picks = `<p class="t2-lbl"><span>Or pick one or two types</span><button type="button" class="np-link">Clear</button></p><div class="t2-picks">${X.types.map(t => `<button type="button" class="t2-tp${X.sel.includes(t) ? ' on' : ''}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>`;
  const ctl = `<div class="t2-ctl">${find}${team}</div>${show}${picks}`;
  const head = `<section class="t2-h"><p class="np-eyebrow"><span>Battle · Type Chart</span></p><h1 class="u"><span>What hits ${E(d)}</span> <span class="pl">hard.</span></h1></section>`;
  const tile = (t, big) => `<span class="t2-tile pat-${pat(t)}${big ? ' big' : ''}" style="--tc:var(--ty-${t})"><b class="u">${t}</b></span>`;
  const off = X.off.map(o => `<div class="t2-off"><div class="h">${tile(o.atk)}<b>attacks</b></div><div class="r"><span class="k up">2× on</span><span class="c">${o.se.map(chip).join('') || '<i>Nothing</i>'}</span></div><div class="r"><span class="k dn">½× on</span><span class="c">${o.nv.map(chip).join('') || '<i>Nothing</i>'}</span></div>${o.no.length ? `<div class="r"><span class="k no">No effect</span><span class="c">${o.no.map(chip).join('')}</span></div>` : ''}</div>`).join('');
  const own = `<section class="t2-own"><p class="t2-lbl"><span>Attacking with its own types</span></p><div class="t2-offs">${off}</div></section>`;
  const fold = `<details class="t2-fold"><summary><span><b>Full type chart</b><small>Every attacking type against every defending type</small></span><i aria-hidden="true">›</i></summary></details>`;
  const card = V2.msCard(X.p, X.n, `<h2 class="u">${V2.nameHtml(d)}</h2>`, `<div class="ms-ty">${X.p.t.map(chip).join('')}</div>`);
  const note = `<p class="fine">Everything not listed hits it for normal damage.</p>`;

  if (V === 'plus') { const bands = [['4×', 'weak', g.q, 'b4'], ['2×', 'weak', g.d, 'b2'], ['½', 'resists', g.h, 'bh'], ['¼', 'resists', g.qr, 'bq'], ['0', 'immune', g.z, 'b0']];
    return `<div class="t2 t2-plus">${V2.battleToolsBar('types')}${head}${ctl}<div class="t2-main"><div class="t2-cardw">${card}</div><div class="t2-right"><p class="t2-lbl"><span>Taking hits as</span> ${X.sel.map(chip).join(' ')}</p>
      <div class="t2-spec">${bands.map(([m, w, ts, c]) => `<div class="t2-band ${c}${ts.length ? '' : ' none'}"><div class="m"><b class="u">${m}</b><small>${w}</small></div><div class="ts">${ts.length ? ts.map(t => tile(t, c === 'b4' || c === 'b0')).join('') : '<i>None</i>'}</div></div>`).join('')}</div>${abNote}${note}</div></div>${own}${fold}</div>`; }

  if (V === 'ring') { const all = X.types.map(t => ({t, m: mult(t)})), n = all.length, R = 236;
    const lvl = m => m >= 4 ? 'b4' : m >= 2 ? 'b2' : m === 0 ? 'b0' : m <= .25 ? 'bq' : m < 1 ? 'bh' : 'b1', lab = m => m === 0 ? '0' : m === .25 ? '¼' : m === .5 ? '½' : m + '×';
    const seg = (o, i) => { const a = -90 + i * 360 / n, x = Math.round(R * Math.cos(a * Math.PI / 180)), y = Math.round(R * Math.sin(a * Math.PI / 180));
      return `<span class="t2-rt ${lvl(o.m)} pat-${pat(o.t)}" style="--tc:var(--ty-${o.t});translate:calc(${x}px - 50%) calc(${y}px - 50%)"><b class="u">${o.t}</b><i class="u">${lab(o.m)}</i></span>`; };
    return `<div class="t2 t2-ringv">${V2.battleToolsBar('types')}${head}${ctl}<div class="t2-main ring"><div class="t2-ring" aria-label="Every type's hit on ${E(d)}"><div class="t2-core">${card}</div>${all.map(seg).join('')}</div>
      <div class="t2-key"><p class="t2-lbl"><span>Taking hits as</span> ${X.sel.map(chip).join(' ')}</p><ul>${[['b4', '4× weak'], ['b2', '2× weak'], ['b1', 'normal'], ['bh', '½ resists'], ['bq', '¼ resists'], ['b0', 'immune']].map(([c, l]) => `<li class="${c}"><i></i>${l}</li>`).join('')}</ul>${abNote}${note}${own}</div></div>${fold}</div>`; }

  // lanes: every attacking type, sorted from hits hardest to can't touch it; a slanted bar sized by the multiplier
  const all = X.types.map(t => ({t, m: mult(t)})).sort((a, b) => b.m - a.m || idx(a.t) - idx(b.t)), w = m => m === 0 ? 0 : Math.round(100 * Math.log2(m * 4) / 4);
  const lane = o => `<div class="t2-lane ${o.m >= 4 ? 'b4' : o.m >= 2 ? 'b2' : o.m === 0 ? 'b0' : o.m < 1 ? 'bh' : 'b1'}">${tile(o.t)}<div class="bar"><i style="width:${w(o.m)}%"></i></div><b class="u v">${o.m === 0 ? '0' : o.m === .25 ? '¼' : o.m === .5 ? '½' : o.m + '×'}</b></div>`;
  return `<div class="t2 t2-lanes">${V2.battleToolsBar('types')}${head}${ctl}<div class="t2-main lanes"><div class="t2-cardw">${card}</div><div class="t2-right"><p class="t2-lbl"><span>Taking hits as</span> ${X.sel.map(chip).join(' ')} <span class="sub">hits hardest first</span></p>
    <div class="t2-ls">${all.map(lane).join('')}</div>${abNote}${note}</div></div>${own}${fold}</div>`; }
