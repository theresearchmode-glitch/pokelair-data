(X, V) => { const E = V2.esc, chip = V2.typeChip, d = V2.disp(X.n), g = X.groups, idx = t => X.types.indexOf(t);
  const pat = t => (V2.DC_PAT && V2.DC_PAT[t]) || 'rings', mult = t => { let m = 1; for (const s of X.sel) m *= X.eff[idx(t)][idx(s)]; return m; };
  const lab = m => m === 0 ? '0' : m === .25 ? '¼' : m === .5 ? '½' : m + '×', lvl = m => m >= 4 ? 'b4' : m >= 2 ? 'b2' : m === 0 ? 'b0' : m <= .25 ? 'bq' : m < 1 ? 'bh' : 'b1';
  const all = X.types.map(t => ({t, m: mult(t)})), sorted = all.slice().sort((a, b) => b.m - a.m || idx(a.t) - idx(b.t));
  const show = `<p class="t3-show">Showing <b>${E(d)}</b>, ability ${E(X.ab)}${X.onTeam ? ' (from your team)' : ''}</p>`;
  const team = `<div class="t3-team">${X.team.map(n => `<button type="button" class="t3-tm${n === X.n ? ' on' : ''}">${V2.mon(n, {iw: 40, bare: true})}<span>${V2.rowName(V2.disp(n))}</span></button>`).join('')}</div>`;
  const ctl = `<div class="t3-ctl"><label class="np-field t3-find">${V2.ICON.search}<input placeholder="Look up a Pokémon"></label>${team}</div>${show}<p class="t3-lbl"><span>Or pick one or two types</span><button type="button" class="np-link">Clear</button></p><div class="t3-picks">${X.types.map(t => `<button type="button" class="t3-tp${X.sel.includes(t) ? ' on' : ''}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>`;
  const head = `<section class="t3-h"><p class="np-eyebrow"><span>Battle · Type Chart</span></p><h1 class="u"><span>What hits ${E(d)}</span> <span class="pl">hard.</span></h1></section>`;
  const off = `<section class="t3-own"><p class="t3-lbl"><span>Attacking with its own types</span></p><div class="t3-offs">${X.off.map(o => `<div class="t3-off"><div class="h">${chip(o.atk)}<b>attacks</b></div><div class="r"><span class="k up">2× on</span><span class="c">${o.se.map(chip).join('') || '<i>Nothing</i>'}</span></div><div class="r"><span class="k dn">½× on</span><span class="c">${o.nv.map(chip).join('') || '<i>Nothing</i>'}</span></div>${o.no.length ? `<div class="r"><span class="k no">No effect</span><span class="c">${o.no.map(chip).join('')}</span></div>` : ''}</div>`).join('')}</div></section>`;
  const fold = `<details class="t3-fold"><summary><span><b>Full type chart</b><small>Every attacking type against every defending type</small></span><i aria-hidden="true">›</i></summary></details>`;
  const ab = X.abNotes.length ? `<p class="t3-ab">${E(X.abNotes.join('. '))}.</p>` : '';
  const wrap = (cls, body) => `<div class="t3 ${cls}">${V2.battleToolsBar('types')}${head}${ctl}${body}${off}${fold}</div>`;
  const cp = (() => { const m = (typeof ART_META === 'object' && ART_META[SPRITE_ID[X.n]]) || [150, 150, 165]; return `${m[0]},${m[1]},${m[2]}`; })();

  if (V === 'card') { // A. Trading Card: the Pokemon as a collectible card, its weaknesses printed on the card's own strip
    const strip = (title, list, cls) => `<div class="t3-tc-s ${cls}"><span class="k u">${title}</span><span class="v">${list.length ? list.map(o => `<span class="e" style="--tc:var(--ty-${o.t})"><i class="pat-${pat(o.t)}"></i><b>${o.t}</b><em class="u">${lab(o.m)}</em></span>`).join('') : '<span class="none">None</span>'}</span></div>`;
    const big = sorted[0];
    return wrap('t3-card', `<section class="t3-tc-stage"><div class="t3-tc" style="--cp:${cp};--t1:var(--ty-${X.p.t[0]});--t2:var(--ty-${X.p.t[1] || X.p.t[0]})">
      <div class="t3-tc-top"><b class="u">${V2.nameHtml(d)}</b><span>${X.p.t.map(chip).join('')}</span></div>
      <div class="t3-tc-art">${V2.mon(X.n, {iw: 300, bare: true, ft: true})}<span class="giant u" aria-hidden="true">${E(d.replace(/^Mega /, '').toUpperCase())}</span></div>
      <p class="t3-tc-ab">Ability: <b>${E(X.ab)}</b></p>
      ${strip('Weakness', sorted.filter(o => o.m > 1), 'w')}${strip('Resistance', sorted.filter(o => o.m > 0 && o.m < 1), 'r')}${strip('Immune', sorted.filter(o => o.m === 0), 'z')}
      ${big.m >= 2 ? `<span class="t3-tc-stamp u" style="--tc:var(--ty-${big.t})">${lab(big.m)}<small>${big.t}</small></span>` : ''}</div>
      <div class="t3-tc-side"><p class="t3-lbl"><span>Taking hits as</span> ${X.sel.map(chip).join(' ')}</p><div class="t3-verdict">${(() => { const q = sorted.filter(o => o.m >= 4), w = sorted.filter(o => o.m === 2), r = sorted.filter(o => o.m > 0 && o.m < 1), z = sorted.filter(o => o.m === 0), J = l => l.map(o => o.t).join(l.length > 2 ? ', ' : ' and ');
      return [q.length ? `<p class="t3-big u"><span>${J(q)} ${q.length > 1 ? 'hit' : 'hits'} it</span> <span class="pl">four times over.</span></p>` : '', w.length ? `<p class="t3-big u sm"><span>${J(w)} ${w.length > 1 ? 'hit' : 'hits'} it</span> <span class="pl">twice as hard.</span></p>` : '',
        r.length ? `<p class="t3-big u sm dim"><span>${J(r)} barely ${r.length > 1 ? 'scratch' : 'scratches'} it.</span></p>` : '', z.length ? `<p class="t3-big u sm dim"><span>${J(z)}</span> <span class="pl">can't touch it.</span></p>` : ''].join(''); })()}</div>${ab}<p class="fine">Everything not listed hits it for normal damage.</p></div></section>`); }

  if (V === 'deck') { // B. Attack Deck: the 18 types as the calc's move cards, rows by multiplier, the giant outlined number = the multiplier
    const card = (o, i, n) => `<div class="dc2-mv pat-${pat(o.t)}${o.m === 0 ? ' none' : ''}" style="--tc:var(--ty-${o.t});--r:${(i - (n - 1) / 2) * 3}deg"><span class="pw u" aria-hidden="true">${lab(o.m)}</span><span class="np-type" style="--tc:var(--ty-${o.t})">${o.t}</span><b class="nm u">${o.m === 0 ? 'No effect' : lab(o.m) + ' damage'}</b></div>`;
    const row = (title, list, cls) => list.length ? `<div class="t3-dk-row ${cls}"><p class="t3-lbl"><span>${title}</span></p><div class="t3-dk-hand">${list.map((o, i) => card(o, i, list.length)).join('')}</div></div>` : '';
    return wrap('t3-deck', `<section class="t3-dk-table"><div class="t3-dk-surface" aria-hidden="true"></div><div class="t3-dk-mid">${V2.msCard(X.p, X.n, `<h2 class="u">${V2.nameHtml(d)}</h2>`, `<div class="ms-ty">${X.p.t.map(chip).join('')}</div>`)}</div>
      <div class="t3-dk-rows">${row('Hits it hard', sorted.filter(o => o.m > 1), 'hard')}${row('Barely scratches it', sorted.filter(o => o.m > 0 && o.m < 1), 'soft')}${row('Can\'t touch it', sorted.filter(o => o.m === 0), 'zero')}
        <p class="t3-dk-n">The other ${sorted.filter(o => o.m === 1).length} types hit it for normal damage: ${sorted.filter(o => o.m === 1).map(o => chip(o.t)).join('')}</p>${ab}</div></section>`); }

  if (V === 'sky') { // C. Skyline: 18 slanted pillars, height by the hit, the Pokemon in front
    const h = m => m === 0 ? 4 : Math.round(16 + 84 * Math.log2(m * 4) / 4);
    return wrap('t3-sky', `<section class="t3-sk"><div class="t3-sk-mon">${V2.mon(X.n, {iw: 280, bare: true, ft: true})}<b class="u">${V2.nameHtml(d)}</b><span>${X.sel.map(chip).join('')}</span></div>
      <div class="t3-sk-city">${sorted.map(o => `<div class="p ${lvl(o.m)}" style="--tc:var(--ty-${o.t});--h:${h(o.m)}%"><b class="v u">${lab(o.m)}</b><i class="pat-${pat(o.t)}"></i><span class="t">${o.t}</span></div>`).join('')}</div>${ab}<p class="fine t3-sk-n">Taller hits harder. Everything at the middle line hits it for normal damage.</p></section>`); }

  // D. Shield: a honeycomb of 18 hexes around the Pokemon; cracked and glowing where it is weak, solid where it resists, sealed where immune
  const D = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]], cells = [];
  for (const k of [1, 2]) { let q = D[4][0] * k, r = D[4][1] * k; for (let i = 0; i < 6; i++) for (let j = 0; j < k; j++) { cells.push([q, r]); q += D[i][0]; r += D[i][1]; } }
  const hex = (o, i) => { const [q, r] = cells[i]; return `<div class="hx ${lvl(o.m)}" style="--tc:var(--ty-${o.t});--q:${q};--r:${r}"><i class="pat-${pat(o.t)}"></i><b>${o.t}</b><em class="u">${lab(o.m)}</em></div>`; };
  const ring = sorted.slice(0, 18);
  return wrap('t3-shield', `<section class="t3-sh"><div class="t3-sh-hive">${ring.map(hex).join('')}<div class="t3-sh-core" style="--cp:${cp}">${V2.mon(X.n, {iw: 200, bare: true})}</div></div>
    <div class="t3-sh-key"><p class="t3-big u"><span>${d}'s</span> <span class="pl">shield.</span></p><ul><li class="b4"><i></i>Cracked: 4× weak</li><li class="b2"><i></i>Chipped: 2× weak</li><li class="b1"><i></i>Plain: normal</li><li class="bh"><i></i>Plated: resists</li><li class="b0"><i></i>Sealed: immune</li></ul>${ab}<p class="fine">Taking hits as ${X.sel.join(' and ')}.</p></div></section>`); }
